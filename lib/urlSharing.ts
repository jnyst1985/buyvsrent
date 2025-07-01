import { CalculationInputs } from './types';

// Default values for comparison (to skip encoding defaults)
const defaultInputs: CalculationInputs = {
  general: {
    currency: 'USD',
    timeHorizon: 30,
    currentSavings: 100000,
  },
  realEstate: {
    propertyPrice: 500000,
    downPaymentPercent: 20,
    mortgageInterestRate: 6.5,
    mortgageTerm: 30,
    propertyTaxRate: 1.2,
    homeownersInsurance: 1500,
    hoaFees: 200,
    maintenanceCostPercent: 1,
    closingCostPercent: 2.5,
    sellingCostPercent: 6,
    propertyAppreciationRate: 3.5,
    propertyTaxIncreaseRate: 2,
  },
  stockMarket: {
    expectedAnnualReturn: 8,
    dividendYield: 1.5,
    expenseRatio: 0.1,
    monthlyInvestment: 0,
  },
  rental: {
    monthlyRent: 2500,
    annualRentIncrease: 3,
    rentersInsurance: 20,
    securityDeposit: 2,
  },
  tax: {
    incomeTaxBracket: 24,
    capitalGainsTaxRate: 15,
    mortgageInterestDeduction: true,
    propertyTaxDeduction: true,
    standardDeduction: 27700,
  },
};

// Optimized parameter mapping (short names)
const paramMap = {
  // General
  'c': 'currency',
  'th': 'timeHorizon', 
  'cs': 'currentSavings',
  
  // Real estate (shortened names)
  'pp': 'propertyPrice',
  'dp': 'downPaymentPercent',
  'mr': 'mortgageInterestRate',
  'mt': 'mortgageTerm',
  'pt': 'propertyTaxRate',
  'ins': 'homeownersInsurance',
  'hoa': 'hoaFees',
  'mnt': 'maintenanceCostPercent',
  'cc': 'closingCostPercent',
  'sc': 'sellingCostPercent',
  'apr': 'propertyAppreciationRate',
  'pti': 'propertyTaxIncreaseRate',
  
  // Stock market
  'sr': 'expectedAnnualReturn',
  'div': 'dividendYield',
  'exp': 'expenseRatio',
  
  // Rental
  'rent': 'monthlyRent',
  'ri': 'annualRentIncrease',
  'rins': 'rentersInsurance',
  'sd': 'securityDeposit',
  
  // Tax
  'it': 'incomeTaxBracket',
  'cg': 'capitalGainsTaxRate',
  'md': 'mortgageInterestDeduction',
  'pd': 'propertyTaxDeduction',
  'std': 'standardDeduction',
};

// Encode calculation inputs to URL parameters for sharing (optimized)
export const encodeInputsToUrl = (inputs: CalculationInputs): string => {
  const params = new URLSearchParams();
  
  // Helper function to add parameter only if different from default
  const addIfDifferent = (shortName: string, value: any, category: keyof CalculationInputs, field: string) => {
    const defaultValue = (defaultInputs[category] as any)[field];
    if (value !== defaultValue) {
      params.set(shortName, value.toString());
    }
  };
  
  // General parameters
  addIfDifferent('c', inputs.general.currency, 'general', 'currency');
  addIfDifferent('th', inputs.general.timeHorizon, 'general', 'timeHorizon');
  addIfDifferent('cs', inputs.general.currentSavings, 'general', 'currentSavings');
  
  // Real estate parameters
  addIfDifferent('pp', inputs.realEstate.propertyPrice, 'realEstate', 'propertyPrice');
  addIfDifferent('dp', inputs.realEstate.downPaymentPercent, 'realEstate', 'downPaymentPercent');
  addIfDifferent('mr', inputs.realEstate.mortgageInterestRate, 'realEstate', 'mortgageInterestRate');
  addIfDifferent('mt', inputs.realEstate.mortgageTerm, 'realEstate', 'mortgageTerm');
  addIfDifferent('pt', inputs.realEstate.propertyTaxRate, 'realEstate', 'propertyTaxRate');
  addIfDifferent('ins', inputs.realEstate.homeownersInsurance, 'realEstate', 'homeownersInsurance');
  addIfDifferent('hoa', inputs.realEstate.hoaFees, 'realEstate', 'hoaFees');
  addIfDifferent('mnt', inputs.realEstate.maintenanceCostPercent, 'realEstate', 'maintenanceCostPercent');
  addIfDifferent('cc', inputs.realEstate.closingCostPercent, 'realEstate', 'closingCostPercent');
  addIfDifferent('sc', inputs.realEstate.sellingCostPercent, 'realEstate', 'sellingCostPercent');
  addIfDifferent('apr', inputs.realEstate.propertyAppreciationRate, 'realEstate', 'propertyAppreciationRate');
  addIfDifferent('pti', inputs.realEstate.propertyTaxIncreaseRate, 'realEstate', 'propertyTaxIncreaseRate');
  
  // Stock market parameters
  addIfDifferent('sr', inputs.stockMarket.expectedAnnualReturn, 'stockMarket', 'expectedAnnualReturn');
  addIfDifferent('div', inputs.stockMarket.dividendYield, 'stockMarket', 'dividendYield');
  addIfDifferent('exp', inputs.stockMarket.expenseRatio, 'stockMarket', 'expenseRatio');
  
  // Rental parameters
  addIfDifferent('rent', inputs.rental.monthlyRent, 'rental', 'monthlyRent');
  addIfDifferent('ri', inputs.rental.annualRentIncrease, 'rental', 'annualRentIncrease');
  addIfDifferent('rins', inputs.rental.rentersInsurance, 'rental', 'rentersInsurance');
  addIfDifferent('sd', inputs.rental.securityDeposit, 'rental', 'securityDeposit');
  
  // Tax parameters
  addIfDifferent('it', inputs.tax.incomeTaxBracket, 'tax', 'incomeTaxBracket');
  addIfDifferent('cg', inputs.tax.capitalGainsTaxRate, 'tax', 'capitalGainsTaxRate');
  addIfDifferent('md', inputs.tax.mortgageInterestDeduction, 'tax', 'mortgageInterestDeduction');
  addIfDifferent('pd', inputs.tax.propertyTaxDeduction, 'tax', 'propertyTaxDeduction');
  addIfDifferent('std', inputs.tax.standardDeduction, 'tax', 'standardDeduction');
  
  return params.toString();
};

// Decode URL parameters back to calculation inputs (with optimized parameter names)
export const decodeUrlToInputs = (searchParams: URLSearchParams, fallbackDefaults: CalculationInputs): CalculationInputs => {
  const parseNumber = (value: string | null, defaultValue: number): number => {
    if (!value) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };
  
  const parseBoolean = (value: string | null, defaultValue: boolean): boolean => {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  };
  
  // Use our internal defaults, not the passed fallbackDefaults
  return {
    general: {
      currency: searchParams.get('c') || defaultInputs.general.currency,
      timeHorizon: parseNumber(searchParams.get('th'), defaultInputs.general.timeHorizon),
      currentSavings: parseNumber(searchParams.get('cs'), defaultInputs.general.currentSavings),
    },
    realEstate: {
      propertyPrice: parseNumber(searchParams.get('pp'), defaultInputs.realEstate.propertyPrice),
      downPaymentPercent: parseNumber(searchParams.get('dp'), defaultInputs.realEstate.downPaymentPercent),
      mortgageInterestRate: parseNumber(searchParams.get('mr'), defaultInputs.realEstate.mortgageInterestRate),
      mortgageTerm: parseNumber(searchParams.get('mt'), defaultInputs.realEstate.mortgageTerm),
      propertyTaxRate: parseNumber(searchParams.get('pt'), defaultInputs.realEstate.propertyTaxRate),
      homeownersInsurance: parseNumber(searchParams.get('ins'), defaultInputs.realEstate.homeownersInsurance),
      hoaFees: parseNumber(searchParams.get('hoa'), defaultInputs.realEstate.hoaFees),
      maintenanceCostPercent: parseNumber(searchParams.get('mnt'), defaultInputs.realEstate.maintenanceCostPercent),
      closingCostPercent: parseNumber(searchParams.get('cc'), defaultInputs.realEstate.closingCostPercent),
      sellingCostPercent: parseNumber(searchParams.get('sc'), defaultInputs.realEstate.sellingCostPercent),
      propertyAppreciationRate: parseNumber(searchParams.get('apr'), defaultInputs.realEstate.propertyAppreciationRate),
      propertyTaxIncreaseRate: parseNumber(searchParams.get('pti'), defaultInputs.realEstate.propertyTaxIncreaseRate),
    },
    stockMarket: {
      expectedAnnualReturn: parseNumber(searchParams.get('sr'), defaultInputs.stockMarket.expectedAnnualReturn),
      dividendYield: parseNumber(searchParams.get('div'), defaultInputs.stockMarket.dividendYield),
      expenseRatio: parseNumber(searchParams.get('exp'), defaultInputs.stockMarket.expenseRatio),
      monthlyInvestment: defaultInputs.stockMarket.monthlyInvestment, // This is calculated
    },
    rental: {
      monthlyRent: parseNumber(searchParams.get('rent'), defaultInputs.rental.monthlyRent),
      annualRentIncrease: parseNumber(searchParams.get('ri'), defaultInputs.rental.annualRentIncrease),
      rentersInsurance: parseNumber(searchParams.get('rins'), defaultInputs.rental.rentersInsurance),
      securityDeposit: parseNumber(searchParams.get('sd'), defaultInputs.rental.securityDeposit),
    },
    tax: {
      incomeTaxBracket: parseNumber(searchParams.get('it'), defaultInputs.tax.incomeTaxBracket),
      capitalGainsTaxRate: parseNumber(searchParams.get('cg'), defaultInputs.tax.capitalGainsTaxRate),
      mortgageInterestDeduction: parseBoolean(searchParams.get('md'), defaultInputs.tax.mortgageInterestDeduction),
      propertyTaxDeduction: parseBoolean(searchParams.get('pd'), defaultInputs.tax.propertyTaxDeduction),
      standardDeduction: parseNumber(searchParams.get('std'), defaultInputs.tax.standardDeduction),
    },
  };
};

// Generate shareable URL with current calculation
export const generateShareableUrl = (inputs: CalculationInputs): string => {
  // Use localhost for development, force custom domain for production
  const baseUrl = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost' ? window.location.origin : 'https://buyvsrent.xyz')
    : 'https://buyvsrent.xyz';
  
  const params = encodeInputsToUrl(inputs);
  return params ? `${baseUrl}?${params}` : baseUrl;
};