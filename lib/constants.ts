import { CalculationInputs } from './types';

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Buy vs Rent Calculator',
  DESCRIPTION: 'Free calculator to compare buying a house vs renting and investing in stocks. Analyze mortgage costs, property appreciation, and investment returns.',
  URL: 'https://buyvsrent.vercel.app', // Will update to custom domain later
  DOMAIN: 'buyvsrent.xyz'
};

// Supported Currencies
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'] as const;

// Timing Constants
export const TIMING = {
  SHARED_CALC_DELAY: 100, // milliseconds
  FORM_INTERACTION_DELAY: 300, // milliseconds for validation
  ANALYTICS_DELAY: 1000 // milliseconds for analytics tracking
};

// Validation Limits
export const VALIDATION_LIMITS = {
  TIME_HORIZON: { MIN: 1, MAX: 50 },
  CURRENT_SAVINGS: { MIN: 0, MAX: 100000000 },
  PROPERTY_PRICE: { MIN: 1000, MAX: 100000000 },
  DOWN_PAYMENT_PERCENT: { MIN: 0, MAX: 100 },
  MORTGAGE_INTEREST_RATE: { MIN: 0, MAX: 50 },
  MORTGAGE_TERM: { MIN: 1, MAX: 50 },
  PROPERTY_TAX_RATE: { MIN: 0, MAX: 10 },
  HOMEOWNERS_INSURANCE: { MIN: 0, MAX: 100000 },
  HOA_FEES: { MIN: 0, MAX: 10000 },
  MAINTENANCE_COST_PERCENT: { MIN: 0, MAX: 10 },
  CLOSING_COST_PERCENT: { MIN: 0, MAX: 10 },
  SELLING_COST_PERCENT: { MIN: 0, MAX: 15 },
  PROPERTY_APPRECIATION_RATE: { MIN: -10, MAX: 20 },
  PROPERTY_TAX_INCREASE_RATE: { MIN: 0, MAX: 20 },
  EXPECTED_ANNUAL_RETURN: { MIN: -20, MAX: 50 },
  DIVIDEND_YIELD: { MIN: 0, MAX: 20 },
  EXPENSE_RATIO: { MIN: 0, MAX: 5 },
  MONTHLY_RENT: { MIN: 100, MAX: 50000 },
  ANNUAL_RENT_INCREASE: { MIN: 0, MAX: 20 },
  RENTERS_INSURANCE: { MIN: 0, MAX: 1000 },
  SECURITY_DEPOSIT: { MIN: 0, MAX: 12 },
  INCOME_TAX_BRACKET: { MIN: 0, MAX: 50 },
  CAPITAL_GAINS_TAX_RATE: { MIN: 0, MAX: 50 },
  STANDARD_DEDUCTION: { MIN: 0, MAX: 100000 }
};

// Default Input Values (used in multiple places)
export const DEFAULT_INPUTS: CalculationInputs = {
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

// Preset Scenarios
export const PRESET_SCENARIOS = {
  FIRST_TIME_BUYER: 'First-Time Buyer',
  INVESTMENT_PROPERTY: 'Investment Property',
  DOWNSIZING: 'Downsizing',
  CUSTOM: 'Custom'
};

// URL Parameter Mapping (for shorter URLs)
export const URL_PARAM_MAP = {
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
} as const;

// Analytics Event Categories
export const ANALYTICS_EVENTS = {
  CALCULATION: 'calculation',
  ENGAGEMENT: 'engagement',
  FORM_INTERACTION: 'form_interaction',
  NAVIGATION: 'navigation',
  ERROR: 'error'
} as const;

// Common Error Messages
export const ERROR_MESSAGES = {
  CALCULATION_FAILED: 'Unable to perform calculation. Please check your inputs and try again.',
  VALIDATION_FAILED: 'Please fix the validation errors before calculating.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
  INVALID_INPUT: 'Invalid input detected. Please enter valid numbers.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
};

// Calculation Constants
export const CALCULATION_CONSTANTS = {
  MONTHS_PER_YEAR: 12,
  PERCENT_TO_DECIMAL: 100,
  MAX_CALCULATION_YEARS: 50,
  MIN_LOAN_AMOUNT: 1000,
  RENT_TO_PRICE_WARNING_RATIO: 0.2 // 20% is considered very high
};

// UI Constants
export const UI_CONSTANTS = {
  MAX_VALIDATION_ERRORS_SHOWN: 5,
  MILESTONE_YEARS: [1, 5, 10, 15, 20, 25, 30],
  CHART_COLORS: {
    BUY: '#3B82F6', // blue-500
    RENT: '#10B981', // green-500
    WARNING: '#F59E0B', // amber-500
    ERROR: '#EF4444' // red-500
  }
};

// Tax Year Constants (2024 values)
export const TAX_YEAR_2024 = {
  STANDARD_DEDUCTION: {
    SINGLE: 14600,
    MARRIED_FILING_JOINTLY: 29200,
    MARRIED_FILING_SEPARATELY: 14600,
    HEAD_OF_HOUSEHOLD: 21900
  },
  CAPITAL_GAINS_RATES: {
    SHORT_TERM: 'ordinary_income',
    LONG_TERM_0_PERCENT: 47025, // threshold for 0% rate
    LONG_TERM_15_PERCENT: 518900, // threshold for 15% rate
    LONG_TERM_20_PERCENT: Infinity // 20% rate above threshold
  }
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  CALCULATION_TIME_WARNING: 1000, // milliseconds
  BUNDLE_SIZE_WARNING: 1000000, // bytes (1MB)
  MEMORY_USAGE_WARNING: 50000000 // bytes (50MB)
};

// Feature Flags (for future use)
export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_TAX_CALCULATIONS: false,
  ENABLE_INTERNATIONAL_TAXES: false,
  ENABLE_PROPERTY_APPRECIATION_CURVES: false,
  ENABLE_MONTE_CARLO_SIMULATION: false,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_EMAIL_RESULTS: true,
  ENABLE_PDF_EXPORT: false
};