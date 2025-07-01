import { CalculationInputs } from './types';

export interface ValidationError {
  field: string;
  message: string;
  category: keyof CalculationInputs;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Input sanitization utilities
export const sanitizeNumber = (value: string | number): number => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return isNaN(num) ? 0 : num;
};

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/[<>]/g, '');
};

// Validation rules
const VALIDATION_RULES = {
  general: {
    currency: {
      required: true,
      allowedValues: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'],
      message: 'Please select a valid currency'
    },
    timeHorizon: {
      required: true,
      min: 1,
      max: 50,
      integer: true,
      message: 'Time horizon must be between 1 and 50 years'
    },
    currentSavings: {
      required: true,
      min: 0,
      max: 100000000,
      message: 'Current savings must be a positive number'
    }
  },
  realEstate: {
    propertyPrice: {
      required: true,
      min: 1000,
      max: 100000000,
      message: 'Property price must be between $1,000 and $100,000,000'
    },
    downPaymentPercent: {
      required: true,
      min: 0,
      max: 100,
      message: 'Down payment must be between 0% and 100%'
    },
    mortgageInterestRate: {
      required: true,
      min: 0,
      max: 50,
      message: 'Mortgage interest rate must be between 0% and 50%'
    },
    mortgageTerm: {
      required: true,
      min: 1,
      max: 50,
      integer: true,
      message: 'Mortgage term must be between 1 and 50 years'
    },
    propertyTaxRate: {
      required: true,
      min: 0,
      max: 10,
      message: 'Property tax rate must be between 0% and 10%'
    },
    homeownersInsurance: {
      required: true,
      min: 0,
      max: 100000,
      message: 'Homeowners insurance must be between $0 and $100,000'
    },
    hoaFees: {
      required: true,
      min: 0,
      max: 10000,
      message: 'HOA fees must be between $0 and $10,000'
    },
    maintenanceCostPercent: {
      required: true,
      min: 0,
      max: 10,
      message: 'Maintenance cost must be between 0% and 10%'
    },
    closingCostPercent: {
      required: true,
      min: 0,
      max: 10,
      message: 'Closing cost must be between 0% and 10%'
    },
    sellingCostPercent: {
      required: true,
      min: 0,
      max: 15,
      message: 'Selling cost must be between 0% and 15%'
    },
    propertyAppreciationRate: {
      required: true,
      min: -10,
      max: 20,
      message: 'Property appreciation rate must be between -10% and 20%'
    },
    propertyTaxIncreaseRate: {
      required: true,
      min: 0,
      max: 20,
      message: 'Property tax increase rate must be between 0% and 20%'
    }
  },
  stockMarket: {
    expectedAnnualReturn: {
      required: true,
      min: -20,
      max: 50,
      message: 'Expected annual return must be between -20% and 50%'
    },
    dividendYield: {
      required: true,
      min: 0,
      max: 20,
      message: 'Dividend yield must be between 0% and 20%'
    },
    expenseRatio: {
      required: true,
      min: 0,
      max: 5,
      message: 'Expense ratio must be between 0% and 5%'
    }
  },
  rental: {
    monthlyRent: {
      required: true,
      min: 100,
      max: 50000,
      message: 'Monthly rent must be between $100 and $50,000'
    },
    annualRentIncrease: {
      required: true,
      min: 0,
      max: 20,
      message: 'Annual rent increase must be between 0% and 20%'
    },
    rentersInsurance: {
      required: true,
      min: 0,
      max: 1000,
      message: 'Renters insurance must be between $0 and $1,000'
    },
    securityDeposit: {
      required: true,
      min: 0,
      max: 12,
      message: 'Security deposit must be between 0 and 12 months'
    }
  },
  tax: {
    incomeTaxBracket: {
      required: true,
      min: 0,
      max: 50,
      message: 'Income tax bracket must be between 0% and 50%'
    },
    capitalGainsTaxRate: {
      required: true,
      min: 0,
      max: 50,
      message: 'Capital gains tax rate must be between 0% and 50%'
    },
    standardDeduction: {
      required: true,
      min: 0,
      max: 100000,
      message: 'Standard deduction must be between $0 and $100,000'
    }
  }
};

// Validate individual field
export const validateField = (
  category: keyof CalculationInputs,
  field: string,
  value: any
): ValidationError | null => {
  const rules = VALIDATION_RULES[category] as any;
  const fieldRules = rules?.[field];
  
  if (!fieldRules) return null;

  const sanitizedValue = typeof value === 'number' ? value : sanitizeNumber(value);

  // Required check
  if (fieldRules.required && (sanitizedValue === null || sanitizedValue === undefined)) {
    return {
      field,
      category,
      message: fieldRules.message
    };
  }

  // Allowed values check (for strings like currency)
  if (fieldRules.allowedValues && !fieldRules.allowedValues.includes(value)) {
    return {
      field,
      category,
      message: fieldRules.message
    };
  }

  // Numeric validations
  if (typeof sanitizedValue === 'number') {
    // Min/Max checks
    if (fieldRules.min !== undefined && sanitizedValue < fieldRules.min) {
      return {
        field,
        category,
        message: fieldRules.message
      };
    }
    
    if (fieldRules.max !== undefined && sanitizedValue > fieldRules.max) {
      return {
        field,
        category,
        message: fieldRules.message
      };
    }

    // Integer check
    if (fieldRules.integer && !Number.isInteger(sanitizedValue)) {
      return {
        field,
        category,
        message: fieldRules.message
      };
    }
  }

  return null;
};

// Validate entire inputs object
export const validateInputs = (inputs: CalculationInputs): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate each category
  for (const category of Object.keys(inputs) as Array<keyof CalculationInputs>) {
    const categoryData = inputs[category] as any;
    
    for (const field of Object.keys(categoryData)) {
      const error = validateField(category, field, categoryData[field]);
      if (error) {
        errors.push(error);
      }
    }
  }

  // Cross-field validations
  const crossFieldErrors = validateCrossFields(inputs);
  errors.push(...crossFieldErrors);

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Cross-field validation logic
const validateCrossFields = (inputs: CalculationInputs): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Down payment cannot exceed current savings
  const downPayment = inputs.realEstate.propertyPrice * (inputs.realEstate.downPaymentPercent / 100);
  if (downPayment > inputs.general.currentSavings) {
    errors.push({
      field: 'downPaymentPercent',
      category: 'realEstate',
      message: 'Down payment exceeds current savings'
    });
  }

  // Mortgage term cannot exceed time horizon
  if (inputs.realEstate.mortgageTerm > inputs.general.timeHorizon) {
    errors.push({
      field: 'mortgageTerm',
      category: 'realEstate',
      message: 'Mortgage term cannot exceed time horizon'
    });
  }

  // Reasonable rent vs property price ratio
  const annualRent = inputs.rental.monthlyRent * 12;
  const rentToPriceRatio = annualRent / inputs.realEstate.propertyPrice;
  if (rentToPriceRatio > 0.2) { // 20% is very high
    errors.push({
      field: 'monthlyRent',
      category: 'rental',
      message: 'Rent seems unusually high compared to property price'
    });
  }

  return errors;
};

// Sanitize entire inputs object
export const sanitizeInputs = (inputs: CalculationInputs): CalculationInputs => {
  return {
    general: {
      currency: sanitizeString(inputs.general.currency),
      timeHorizon: sanitizeNumber(inputs.general.timeHorizon),
      currentSavings: sanitizeNumber(inputs.general.currentSavings),
    },
    realEstate: {
      propertyPrice: sanitizeNumber(inputs.realEstate.propertyPrice),
      downPaymentPercent: sanitizeNumber(inputs.realEstate.downPaymentPercent),
      mortgageInterestRate: sanitizeNumber(inputs.realEstate.mortgageInterestRate),
      mortgageTerm: sanitizeNumber(inputs.realEstate.mortgageTerm),
      propertyTaxRate: sanitizeNumber(inputs.realEstate.propertyTaxRate),
      homeownersInsurance: sanitizeNumber(inputs.realEstate.homeownersInsurance),
      hoaFees: sanitizeNumber(inputs.realEstate.hoaFees),
      maintenanceCostPercent: sanitizeNumber(inputs.realEstate.maintenanceCostPercent),
      closingCostPercent: sanitizeNumber(inputs.realEstate.closingCostPercent),
      sellingCostPercent: sanitizeNumber(inputs.realEstate.sellingCostPercent),
      propertyAppreciationRate: sanitizeNumber(inputs.realEstate.propertyAppreciationRate),
      propertyTaxIncreaseRate: sanitizeNumber(inputs.realEstate.propertyTaxIncreaseRate),
    },
    stockMarket: {
      expectedAnnualReturn: sanitizeNumber(inputs.stockMarket.expectedAnnualReturn),
      dividendYield: sanitizeNumber(inputs.stockMarket.dividendYield),
      expenseRatio: sanitizeNumber(inputs.stockMarket.expenseRatio),
      monthlyInvestment: sanitizeNumber(inputs.stockMarket.monthlyInvestment),
    },
    rental: {
      monthlyRent: sanitizeNumber(inputs.rental.monthlyRent),
      annualRentIncrease: sanitizeNumber(inputs.rental.annualRentIncrease),
      rentersInsurance: sanitizeNumber(inputs.rental.rentersInsurance),
      securityDeposit: sanitizeNumber(inputs.rental.securityDeposit),
    },
    tax: {
      incomeTaxBracket: sanitizeNumber(inputs.tax.incomeTaxBracket),
      capitalGainsTaxRate: sanitizeNumber(inputs.tax.capitalGainsTaxRate),
      mortgageInterestDeduction: Boolean(inputs.tax.mortgageInterestDeduction),
      propertyTaxDeduction: Boolean(inputs.tax.propertyTaxDeduction),
      standardDeduction: sanitizeNumber(inputs.tax.standardDeduction),
    }
  };
};