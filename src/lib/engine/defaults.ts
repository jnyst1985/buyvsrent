import type { EngineInputs } from './types';

/**
 * 2026-era US defaults. Sources noted in /methodology.
 * Every value is editable in the UI; these exist so the page shows a
 * meaningful answer before the user touches anything.
 */
export const DEFAULT_INPUTS: EngineInputs = {
  currency: 'USD',
  timeHorizonYears: 10,

  homePrice: 420000,
  downPaymentPct: 20,
  mortgageRatePct: 6.5,
  mortgageTermYears: 30,
  closingCostPct: 3,
  sellingCostPct: 6,
  propertyTaxPct: 1.1,
  propertyTaxIncreasePct: 2,
  homeInsuranceAnnual: 2500,
  hoaMonthly: 0,
  maintenancePct: 1,
  homeAppreciationPct: 3,
  pmiAnnualPct: 0.6,

  monthlyRent: 2100,
  rentIncreasePct: 2.5,
  rentersInsuranceMonthly: 15,
  securityDepositMonths: 1,

  investmentReturnPct: 7,
  expenseRatioPct: 0.05,

  marginalTaxRatePct: 24,
  capitalGainsRatePct: 15,
  filingStatus: 'single',
  standardDeduction: 16100,
  saltCap: 40400,
  mortgageInterestDeductionCap: 750000,
  itemizeDeductions: false,

  inflationPct: 2.5,
};

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CNY',
  'INR',
] as const;
