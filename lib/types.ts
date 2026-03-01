export interface GeneralParameters {
  currency: string;
  timeHorizon: number; // years
  currentSavings: number;
}

export interface RealEstateParameters {
  propertyPrice: number;
  downPaymentPercent: number;
  mortgageInterestRate: number; // annual %
  mortgageTerm: number; // years
  propertyTaxRate: number; // annual % of property value
  homeownersInsurance: number; // annual amount
  hoaFees: number; // monthly
  maintenanceCostPercent: number; // annual % of property value
  closingCostPercent: number; // % of property price
  sellingCostPercent: number; // % of property price
  propertyAppreciationRate: number; // annual %
  propertyTaxIncreaseRate: number; // annual %
  pmiRate: number; // annual % of loan amount, applies when down payment < 20%
  generalInflationRate: number; // annual % for insurance/HOA/renter's insurance escalation
}

export interface StockMarketParameters {
  expectedAnnualReturn: number; // %
  dividendYield: number; // %
  expenseRatio: number; // %
  monthlyInvestment: number; // calculated from mortgage payment - rent
}

export interface RentalParameters {
  monthlyRent: number;
  annualRentIncrease: number; // %
  rentersInsurance: number; // monthly
  securityDeposit: number; // months of rent
}

export interface TaxParameters {
  incomeTaxBracket: number; // %
  capitalGainsTaxRate: number; // %
  mortgageInterestDeduction: boolean;
  propertyTaxDeduction: boolean;
  standardDeduction: number;
  saltCap: number; // SALT deduction cap (default $10,000)
  filingStatus: 'single' | 'married'; // for home sale capital gains exclusion
}

export interface CalculationInputs {
  general: GeneralParameters;
  realEstate: RealEstateParameters;
  stockMarket: StockMarketParameters;
  rental: RentalParameters;
  tax: TaxParameters;
}

export interface YearlyData {
  year: number;
  buyScenario: {
    homeValue: number;
    mortgageBalance: number;
    equity: number;
    totalCosts: number;
    taxSavings: number;
  };
  rentScenario: {
    portfolioValue: number;
    totalRentPaid: number;
    monthlyRent: number;
  };
}

export interface CalculationResults {
  buyScenarioNetWorth: number;
  rentScenarioNetWorth: number;
  difference: number;
  differencePercent: number;
  breakEvenYear: number | null;
  yearlyData: YearlyData[];
  totalCosts: {
    buy: {
      totalInterest: number;
      totalPropertyTax: number;
      totalInsurance: number;
      totalMaintenance: number;
      totalHOA: number;
      totalPMI: number;
      closingCosts: number;
      sellingCosts: number;
    };
    rent: {
      totalRent: number;
      totalRentersInsurance: number;
    };
  };
}