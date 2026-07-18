/**
 * Engine input model. All rates are annual percentages (e.g. 6.5 = 6.5%).
 * Flat on purpose: maps 1:1 to URL params and form fields.
 */
export interface EngineInputs {
  currency: string;
  timeHorizonYears: number;

  // Buying
  homePrice: number;
  downPaymentPct: number; // 0–100; 100 = all-cash purchase (no loan)
  mortgageRatePct: number;
  mortgageTermYears: number;
  closingCostPct: number; // buyer's closing costs, % of price
  sellingCostPct: number; // sale costs at horizon, % of final home value
  propertyTaxPct: number; // year-1 tax as % of price; grows at propertyTaxIncreasePct
  propertyTaxIncreasePct: number;
  homeInsuranceAnnual: number; // grows with inflation
  hoaMonthly: number; // grows with inflation
  maintenancePct: number; // annual % of current home value
  homeAppreciationPct: number;
  pmiAnnualPct: number; // % of original loan; cancels at 20% equity

  // Renting
  monthlyRent: number;
  rentIncreasePct: number; // applied at each year boundary
  rentersInsuranceMonthly: number; // grows with inflation
  securityDepositMonths: number; // months of first-year rent, locked until horizon

  // Investing (the "rent and invest the difference" side, and buyer surplus)
  investmentReturnPct: number; // TOTAL nominal return incl. dividends
  expenseRatioPct: number; // annual fund fees, subtracted from return

  // Taxes (US model; all optional in effect — zero them out for other countries)
  marginalTaxRatePct: number;
  capitalGainsRatePct: number;
  filingStatus: 'single' | 'married';
  standardDeduction: number;
  saltCap: number;
  mortgageInterestDeductionCap: number; // acquisition debt cap ($750k US)
  itemizeDeductions: boolean; // model itemizing mortgage interest + property tax

  // Economy
  inflationPct: number;
}

/** One row per simulated year (values at end of year). */
export interface YearRow {
  year: number;
  homeValue: number;
  loanBalance: number;
  /** Home equity net of nothing — raw value minus balance. */
  homeEquity: number;
  /** Buyer's side portfolio (invested surplus in years renting costs more). */
  buyPortfolio: number;
  /** Renter's portfolio (down payment + closing costs + invested savings). */
  rentPortfolio: number;
  /** Net worth if you sold/liquidated at the end of this year (after sale costs + taxes). */
  buyNetWorth: number;
  rentNetWorth: number;
  /** Total housing cash outlay this year (mortgage P&I + taxes + ins + HOA + maint + PMI − tax savings). */
  buyAnnualCost: number;
  /** Rent + renter's insurance this year. */
  rentAnnualCost: number;
  monthlyRent: number;
  interestPaid: number;
  principalPaid: number;
  taxSavings: number;
  pmiPaid: number;
}

export interface CostTotals {
  buy: {
    downPayment: number;
    closingCosts: number;
    totalInterest: number;
    totalPrincipal: number;
    totalPropertyTax: number;
    totalInsurance: number;
    totalMaintenance: number;
    totalHoa: number;
    totalPmi: number;
    totalTaxSavings: number;
    sellingCosts: number;
    homeSaleTax: number;
  };
  rent: {
    securityDeposit: number;
    totalRent: number;
    totalRentersInsurance: number;
  };
}

export interface SensitivityRow {
  /** Input being varied. */
  key: 'homeAppreciationPct' | 'investmentReturnPct' | 'rentIncreasePct' | 'mortgageRatePct';
  label: string;
  /** Signed net-worth difference (buy − rent) when the input moves ±1pp. */
  minusOne: number;
  plusOne: number;
  /** True if a ±1pp move flips the verdict. */
  flips: boolean;
}

export interface EngineResults {
  verdict: 'buy' | 'rent' | 'tie';
  /** buyNetWorth − rentNetWorth at horizon. */
  difference: number;
  /** Position at t=0, right after the purchase: buying starts behind by transaction costs. */
  yearZero: { buyNetWorth: number; rentNetWorth: number };
  buyNetWorth: number;
  rentNetWorth: number;
  /** First year buying pulls ahead for good (net of sale costs/taxes), or null. */
  breakEvenYear: number | null;
  years: YearRow[];
  totals: CostTotals;
  /** Year-1 monthly snapshot for the "monthly cost" display. */
  monthly: {
    mortgagePayment: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
    pmi: number;
    buyTotal: number;
    rent: number;
    rentersInsurance: number;
    rentTotal: number;
  };
  sensitivity: SensitivityRow[];
}
