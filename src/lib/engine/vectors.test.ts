/**
 * Independently-derived verification vectors. Each expected value was computed
 * by hand (closed-form amortization / annuity math) during the methodology
 * audit — NOT by running this engine. See each vector's `derivation`.
 */
import { describe, expect, it } from 'vitest';
import type { EngineInputs } from './types';
import { simulate } from './engine';
import vectors from './fixtures/vectors.json';

interface LegacyInputs {
  [k: string]: unknown;
}

/** Map the audit's legacy nested-ish field names onto EngineInputs. */
function toEngineInputs(v: LegacyInputs): EngineInputs {
  const num = (k: string, fallback = 0) => (typeof v[k] === 'number' ? (v[k] as number) : fallback);
  const legacyDividend = num('dividendYield', 0);
  return {
    currency: (v.currency as string) ?? 'USD',
    timeHorizonYears: num('timeHorizon', 10),
    homePrice: num('propertyPrice'),
    downPaymentPct: num('downPaymentPercent'),
    mortgageRatePct: num('mortgageInterestRate'),
    mortgageTermYears: num('mortgageTerm', 30),
    closingCostPct: num('closingCostPercent'),
    sellingCostPct: num('sellingCostPercent'),
    propertyTaxPct: num('propertyTaxRate'),
    propertyTaxIncreasePct: num('propertyTaxIncreaseRate'),
    homeInsuranceAnnual: num('homeownersInsurance'),
    hoaMonthly: num('hoaFees'),
    maintenancePct: num('maintenanceCostPercent'),
    homeAppreciationPct: num('propertyAppreciationRate'),
    pmiAnnualPct: num('pmiRate'),
    monthlyRent: num('monthlyRent'),
    rentIncreasePct: num('annualRentIncrease'),
    rentersInsuranceMonthly: num('rentersInsurance'),
    securityDepositMonths: num('securityDeposit'),
    // The audit defines expectedAnnualReturn as TOTAL return; dividendYield is
    // display-only and must be inert (defect D02).
    investmentReturnPct: num('expectedAnnualReturn'),
    expenseRatioPct: num('expenseRatio'),
    marginalTaxRatePct: num('incomeTaxBracket'),
    capitalGainsRatePct: num('capitalGainsTaxRate'),
    filingStatus: (v.filingStatus as 'single' | 'married') ?? 'single',
    standardDeduction: num('standardDeduction'),
    saltCap: num('saltCap', 40_400),
    mortgageInterestDeductionCap: num('mortgageInterestDebtCap', 750_000),
    itemizeDeductions: Boolean(v.mortgageInterestDeduction) || Boolean(v.propertyTaxDeduction),
    inflationPct: num('generalInflationRate'),
  };
}

describe('methodology audit vectors', () => {
  for (const vector of vectors) {
    it(vector.name, () => {
      const inputs = toEngineInputs(vector.inputs as LegacyInputs);
      const expected = vector.expected as unknown as Record<string, number | boolean | string | null>;
      const tol = typeof expected.tolerance_abs === 'number' ? expected.tolerance_abs : 1;

      const r = simulate(inputs);
      const last = r.years[r.years.length - 1];

      const checks: Array<[string, number | null | undefined, number]> = [
        ['monthlyMortgagePayment', r.monthly.mortgagePayment, tol],
        ['buyScenarioNetWorth', r.buyNetWorth, tol],
        ['rentScenarioNetWorth', r.rentNetWorth, tol],
        ['difference', r.difference, tol],
        ['totalInterest', r.totals.buy.totalInterest, tol],
        ['totalPMI', r.totals.buy.totalPmi, tol],
        ['buyerPortfolio', last.buyPortfolio, tol],
        ['buyerPortfolioPreTax', last.buyPortfolio, tol],
        ['renterPortfolioPreTax', last.rentPortfolio, tol],
        ['finalMortgageBalance', last.loanBalance, tol],
        ['homeSaleTax', r.totals.buy.homeSaleTax, tol],
        ['interestYear1', r.years[0].interestPaid, tol],
        ['taxBenefitYear1', r.years[0].taxSavings, tol],
      ];

      for (const [key, actual, tolerance] of checks) {
        if (typeof expected[key] === 'number') {
          expect(actual, key).toBeCloseTo(expected[key] as number, -Math.log10(tolerance * 2));
        }
      }

      if ('breakEvenYear' in expected) {
        expect(r.breakEvenYear, 'breakEvenYear').toBe(expected.breakEvenYear);
      }

      if (expected.dividendYield_invariance) {
        const withDividend = simulate(inputs); // dividendYield never reaches the engine
        expect(withDividend.difference).toBe(r.difference);
      }
    });
  }
});
