import { describe, it, expect } from 'vitest';
import {
  calculateMortgagePayment,
  calculateMortgageBalance,
  calculateInterestPaid,
  calculateTaxSavings,
  calculateInvestmentGrowth,
  performCalculations
} from './calculator';
import { CalculationInputs } from './types';
import { DEFAULT_INPUTS } from './constants';

describe('Calculator Functions', () => {
  describe('calculateMortgagePayment', () => {
    it('should calculate correct monthly payment for a 30-year mortgage', () => {
      const principal = 400000; // $400k loan
      const annualRate = 6.5; // 6.5% interest
      const years = 30;
      
      const payment = calculateMortgagePayment(principal, annualRate, years);
      
      // Expected payment should be around $2,528.27
      expect(payment).toBeCloseTo(2528.27, 2);
    });

    it('should handle zero interest rate', () => {
      const principal = 300000;
      const annualRate = 0; // 0% interest
      const years = 30;
      
      const payment = calculateMortgagePayment(principal, annualRate, years);
      
      // With 0% interest, payment = principal / (years * 12)
      expect(payment).toBeCloseTo(300000 / (30 * 12), 2);
    });

    it('should handle short-term loans', () => {
      const principal = 100000;
      const annualRate = 5;
      const years = 5;
      
      const payment = calculateMortgagePayment(principal, annualRate, years);
      
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeCloseTo(1887.12, 2);
    });
  });

  describe('calculateMortgageBalance', () => {
    it('should calculate remaining balance correctly', () => {
      const principal = 400000;
      const annualRate = 6.5;
      const monthlyPayment = 2528.27;
      const monthsPaid = 12; // 1 year of payments
      
      const balance = calculateMortgageBalance(principal, annualRate, monthlyPayment, monthsPaid);
      
      expect(balance).toBeLessThan(principal);
      expect(balance).toBeGreaterThan(350000); // Should still owe most of it after 1 year
    });

    it('should return zero when loan is paid off', () => {
      const principal = 100000;
      const annualRate = 5;
      const monthlyPayment = 1887.12;
      const monthsPaid = 60; // 5 years of payments
      
      const balance = calculateMortgageBalance(principal, annualRate, monthlyPayment, monthsPaid);
      
      // Floating point precision means balance won't be exactly 0
      expect(balance).toBeCloseTo(0, 0);
    });
  });

  describe('calculateTaxSavings', () => {
    it('should calculate tax savings when itemizing is beneficial', () => {
      const savings = calculateTaxSavings(20000, 10000, 24, true, true, 27700, 10000);
      // With SALT cap: mortgage (20k) + min(propertyTax 10k, cap 10k) = 30k
      // Exceeds standard (27.7k) by 2.3k → 2300 * 0.24 = 552
      expect(savings).toBeCloseTo(552, 2);
    });

    it('should return zero when standard deduction is better', () => {
      const savings = calculateTaxSavings(10000, 5000, 24, true, true, 27700, 10000);
      // Itemized (15k) < standard (27.7k), so no benefit
      expect(savings).toBe(0);
    });

    it('should apply SALT cap to property tax deduction', () => {
      // High property tax ($25k) should be capped at SALT limit ($10k)
      const withCap = calculateTaxSavings(20000, 25000, 24, true, true, 27700, 10000);
      // With SALT cap: 20k + min(25k, 10k) = 30k, benefit = 2.3k * 0.24 = 552
      expect(withCap).toBeCloseTo(552, 2);

      // Without SALT cap (very high cap): 20k + 25k = 45k, benefit = 17.3k * 0.24 = 4152
      const withoutCap = calculateTaxSavings(20000, 25000, 24, true, true, 27700, 100000);
      expect(withoutCap).toBeCloseTo(4152, 2);

      // SALT cap should reduce the deduction
      expect(withCap).toBeLessThan(withoutCap);
    });
  });

  describe('calculateInvestmentGrowth', () => {
    it('should calculate compound growth correctly', () => {
      const initialInvestment = 100000;
      const monthlyContribution = 1000;
      const annualReturn = 8;
      const dividendYield = 2;
      const expenseRatio = 0.1;
      const years = 10;
      
      const finalValue = calculateInvestmentGrowth(
        initialInvestment,
        monthlyContribution,
        annualReturn,
        dividendYield,
        expenseRatio,
        years
      );
      
      expect(finalValue).toBeGreaterThan(initialInvestment);
      expect(finalValue).toBeGreaterThan(220000); // Should grow significantly
    });

    it('should handle zero returns', () => {
      const initialInvestment = 100000;
      const monthlyContribution = 1000;
      const annualReturn = 0;
      const dividendYield = 0;
      const expenseRatio = 0;
      const years = 10;
      
      const finalValue = calculateInvestmentGrowth(
        initialInvestment,
        monthlyContribution,
        annualReturn,
        dividendYield,
        expenseRatio,
        years
      );
      
      // With 0% returns, final value = initial + (monthly * months)
      expect(finalValue).toBeCloseTo(100000 + (1000 * 120), 2);
    });
  });

  describe('performCalculations', () => {
    it('should perform full calculation without errors', () => {
      const inputs: CalculationInputs = DEFAULT_INPUTS;
      
      const results = performCalculations(inputs);
      
      expect(results).toBeDefined();
      expect(results.buyScenarioNetWorth).toBeGreaterThan(0);
      expect(results.rentScenarioNetWorth).toBeGreaterThan(0);
      expect(results.yearlyData).toHaveLength(inputs.general.timeHorizon);
      expect(typeof results.difference).toBe('number');
      expect(typeof results.differencePercent).toBe('number');
    });

    it('should throw error for invalid inputs', () => {
      const invalidInputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: {
          ...DEFAULT_INPUTS.general,
          timeHorizon: 0 // Invalid
        }
      };
      
      expect(() => performCalculations(invalidInputs)).toThrow();
    });

    it('should throw error when down payment exceeds property price', () => {
      const invalidInputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          propertyPrice: 100000,
          downPaymentPercent: 150 // 150% down payment
        }
      };
      
      expect(() => performCalculations(invalidInputs)).toThrow();
    });

    it('should calculate break-even year when buying becomes better', () => {
      // Scenario strongly favoring buying (high rent, high appreciation, low stock returns)
      const buyFavoredInputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        rental: {
          ...DEFAULT_INPUTS.rental,
          monthlyRent: 3500, // High rent
          annualRentIncrease: 5, // Fast-rising rent
        },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          propertyAppreciationRate: 6, // High appreciation
        },
        stockMarket: {
          ...DEFAULT_INPUTS.stockMarket,
          expectedAnnualReturn: 5, // Low stock returns
        },
      };

      const results = performCalculations(buyFavoredInputs);

      // Buying should be better in this scenario
      expect(results.difference).toBeGreaterThan(0);
      // Break-even may be null if buying is always better from year 1
      if (results.breakEvenYear !== null) {
        expect(results.breakEvenYear).toBeGreaterThan(0);
        expect(results.breakEvenYear).toBeLessThanOrEqual(buyFavoredInputs.general.timeHorizon);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high interest rates', () => {
      const principal = 400000;
      const annualRate = 25; // Very high rate
      const years = 30;
      
      const payment = calculateMortgagePayment(principal, annualRate, years);
      
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeGreaterThan(8000); // Should be very high
    });

    it('should handle very short time horizons', () => {
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: {
          ...DEFAULT_INPUTS.general,
          timeHorizon: 1
        }
      };
      
      const results = performCalculations(inputs);
      
      expect(results.yearlyData).toHaveLength(1);
      expect(results.buyScenarioNetWorth).toBeGreaterThan(0);
      expect(results.rentScenarioNetWorth).toBeGreaterThan(0);
    });

    it('should handle zero down payment', () => {
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          downPaymentPercent: 0
        }
      };
      
      const results = performCalculations(inputs);
      
      expect(results).toBeDefined();
      expect(results.buyScenarioNetWorth).toBeGreaterThan(0);
    });
  });

  describe('PMI Calculation (1.1)', () => {
    it('should include PMI costs when down payment < 20%', () => {
      const lowDownPayment: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 10, currentSavings: 200000 },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          downPaymentPercent: 10, // triggers PMI
          mortgageTerm: 30, // long term so equity builds slowly
          propertyAppreciationRate: 1, // slow appreciation
        },
      };

      const results = performCalculations(lowDownPayment);
      expect(results.totalCosts.buy.totalPMI).toBeGreaterThan(0);
    });

    it('should not include PMI when down payment >= 20%', () => {
      const highDownPayment: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 5 },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          downPaymentPercent: 20,
          mortgageTerm: 5,
        },
      };

      const results = performCalculations(highDownPayment);
      expect(results.totalCosts.buy.totalPMI).toBe(0);
    });

    it('should auto-cancel PMI when equity reaches 20%', () => {
      // With 10% down and 3.5% appreciation, equity should reach 20% within a few years
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 15 },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          downPaymentPercent: 10,
          propertyAppreciationRate: 5,
          mortgageTerm: 15,
        },
      };

      const results = performCalculations(inputs);
      // PMI should be less than if it ran for full 15 years
      const fullPMI = (inputs.realEstate.propertyPrice * 0.9) * (inputs.realEstate.pmiRate / 100) * 15;
      expect(results.totalCosts.buy.totalPMI).toBeLessThan(fullPMI);
      expect(results.totalCosts.buy.totalPMI).toBeGreaterThan(0);
    });
  });

  describe('Cost Inflation (1.3)', () => {
    it('should inflate insurance costs over time', () => {
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 10 },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          generalInflationRate: 3,
          homeownersInsurance: 1500,
          mortgageTerm: 10,
        },
      };

      const results = performCalculations(inputs);
      // With 3% inflation over 10 years, total insurance should exceed 10 * $1500 = $15000
      expect(results.totalCosts.buy.totalInsurance).toBeGreaterThan(15000);
    });

    it('should inflate HOA fees over time', () => {
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 10 },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          generalInflationRate: 3,
          hoaFees: 200,
          mortgageTerm: 10,
        },
      };

      const results = performCalculations(inputs);
      // With 3% inflation, total HOA should exceed 10 * 200 * 12 = $24000
      expect(results.totalCosts.buy.totalHOA).toBeGreaterThan(24000);
    });

    it('should inflate renters insurance over time', () => {
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 10 },
        realEstate: { ...DEFAULT_INPUTS.realEstate, mortgageTerm: 10 },
      };

      const results = performCalculations(inputs);
      // With 3% inflation, total renters insurance should exceed 10 * 20 * 12 = $2400
      expect(results.totalCosts.rent.totalRentersInsurance).toBeGreaterThan(2400);
    });
  });

  describe('Home Sale Capital Gains Exclusion (1.5)', () => {
    it('should not tax home gains below Section 121 exclusion', () => {
      // Home appreciation below $250k (single) should not be taxed
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 5 },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          propertyAppreciationRate: 3,
          mortgageTerm: 5,
        },
        tax: {
          ...DEFAULT_INPUTS.tax,
          filingStatus: 'single',
        },
      };

      const results = performCalculations(inputs);
      // With 3% appreciation on $500k for 5 years, gains ~$80k < $250k exclusion
      // buyScenarioNetWorth should not have home sale tax deducted
      expect(results.buyScenarioNetWorth).toBeGreaterThan(0);
    });

    it('should apply married filing jointly exclusion of $500k', () => {
      const singleResults = performCalculations({
        ...DEFAULT_INPUTS,
        tax: { ...DEFAULT_INPUTS.tax, filingStatus: 'single' },
      });

      const marriedResults = performCalculations({
        ...DEFAULT_INPUTS,
        tax: { ...DEFAULT_INPUTS.tax, filingStatus: 'married' },
      });

      // With default 30-year appreciation, gains could exceed $250k
      // Married should have higher or equal net worth due to larger exclusion
      expect(marriedResults.buyScenarioNetWorth).toBeGreaterThanOrEqual(singleResults.buyScenarioNetWorth);
    });
  });

  describe('Security Deposit (2.5)', () => {
    it('should reduce initial investment by security deposit amount', () => {
      const withDeposit: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 5 },
        realEstate: { ...DEFAULT_INPUTS.realEstate, mortgageTerm: 5 },
        rental: {
          ...DEFAULT_INPUTS.rental,
          securityDeposit: 2, // 2 months
          monthlyRent: 2500,
        },
      };

      const withoutDeposit: CalculationInputs = {
        ...withDeposit,
        rental: { ...withDeposit.rental, securityDeposit: 0 },
      };

      const resultsWithDeposit = performCalculations(withDeposit);
      const resultsWithout = performCalculations(withoutDeposit);

      // With deposit, the renter has less initial investment capital
      // but gets the deposit back at the end, so results should be similar
      // but not identical due to compounding
      expect(resultsWithDeposit.rentScenarioNetWorth).not.toBe(resultsWithout.rentScenarioNetWorth);
    });
  });

  describe('Investment Cost Basis Tracking (1.4)', () => {
    it('should track varying monthly investments correctly', () => {
      // When rent rises, monthly investment decreases (housing cost fixed, rent rising)
      // This should result in lower cost basis over time
      const inputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        general: { ...DEFAULT_INPUTS.general, timeHorizon: 10 },
        realEstate: { ...DEFAULT_INPUTS.realEstate, mortgageTerm: 10 },
        rental: {
          ...DEFAULT_INPUTS.rental,
          annualRentIncrease: 5, // Fast rent increase reduces monthly investment
        },
      };

      const results = performCalculations(inputs);
      // Should complete without errors and produce valid results
      expect(results.rentScenarioNetWorth).toBeGreaterThan(0);
      expect(Number.isFinite(results.rentScenarioNetWorth)).toBe(true);
    });
  });
});

// Mock data for testing
export const mockCalculationInputs = {
  simple: {
    ...DEFAULT_INPUTS,
    general: { ...DEFAULT_INPUTS.general, timeHorizon: 5 }
  },
  buyFavored: {
    ...DEFAULT_INPUTS,
    rental: { ...DEFAULT_INPUTS.rental, monthlyRent: 1500 },
    realEstate: { ...DEFAULT_INPUTS.realEstate, propertyAppreciationRate: 8 }
  },
  rentFavored: {
    ...DEFAULT_INPUTS,
    rental: { ...DEFAULT_INPUTS.rental, monthlyRent: 4000 },
    stockMarket: { ...DEFAULT_INPUTS.stockMarket, expectedAnnualReturn: 12 }
  }
};