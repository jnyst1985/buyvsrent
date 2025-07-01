/**
 * Unit tests for calculator functions
 * 
 * To run these tests, you would need to install Jest and @types/jest:
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * Then configure Jest in package.json or jest.config.js
 */

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
      
      expect(balance).toBeCloseTo(0, 2);
    });
  });

  describe('calculateTaxSavings', () => {
    it('should calculate tax savings when itemizing is beneficial', () => {
      const mortgageInterest = 20000;
      const propertyTax = 10000;
      const incomeTaxRate = 24;
      const standardDeduction = 27700;
      
      const savings = calculateTaxSavings(
        mortgageInterest,
        propertyTax,
        incomeTaxRate,
        true, // deduct mortgage
        true, // deduct property tax
        standardDeduction
      );
      
      // Itemized deductions (30k) exceed standard (27.7k) by 2.3k
      // Tax savings = 2300 * 0.24 = 552
      expect(savings).toBeCloseTo(552, 2);
    });

    it('should return zero when standard deduction is better', () => {
      const mortgageInterest = 10000;
      const propertyTax = 5000;
      const incomeTaxRate = 24;
      const standardDeduction = 27700;
      
      const savings = calculateTaxSavings(
        mortgageInterest,
        propertyTax,
        incomeTaxRate,
        true,
        true,
        standardDeduction
      );
      
      // Itemized (15k) < standard (27.7k), so no benefit
      expect(savings).toBe(0);
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
      // Scenario favoring buying (low rent, high property appreciation)
      const buyFavoredInputs: CalculationInputs = {
        ...DEFAULT_INPUTS,
        rental: {
          ...DEFAULT_INPUTS.rental,
          monthlyRent: 1500 // Lower rent
        },
        realEstate: {
          ...DEFAULT_INPUTS.realEstate,
          propertyAppreciationRate: 6 // Higher appreciation
        }
      };
      
      const results = performCalculations(buyFavoredInputs);
      
      expect(results.breakEvenYear).toBeGreaterThan(0);
      expect(results.breakEvenYear).toBeLessThanOrEqual(buyFavoredInputs.general.timeHorizon);
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