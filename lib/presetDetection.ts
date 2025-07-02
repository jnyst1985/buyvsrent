import { CalculationInputs } from './types';

// Preset configurations (moved from PresetScenarios component)
export const presetConfigurations = {
  'first-time-buyer': {
    name: '🏠 First-Time Buyer',
    description: 'Young professional buying their first home',
    inputs: {
      general: {
        currency: 'USD',
        timeHorizon: 30,
        currentSavings: 50000,
      },
      realEstate: {
        propertyPrice: 350000,
        downPaymentPercent: 10,
        mortgageInterestRate: 6.5,
        mortgageTerm: 30,
        propertyTaxRate: 1.2,
        homeownersInsurance: 1200,
        hoaFees: 100,
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
        monthlyRent: 2000,
        annualRentIncrease: 3,
        rentersInsurance: 20,
        securityDeposit: 2,
      },
      tax: {
        incomeTaxBracket: 22,
        capitalGainsTaxRate: 15,
        mortgageInterestDeduction: true,
        propertyTaxDeduction: true,
        standardDeduction: 27700,
      },
    }
  },
  
  'investor': {
    name: '📈 Investment Property',
    description: 'Real estate investor with significant capital',
    inputs: {
      general: {
        currency: 'USD',
        timeHorizon: 20,
        currentSavings: 200000,
      },
      realEstate: {
        propertyPrice: 600000,
        downPaymentPercent: 25,
        mortgageInterestRate: 7.0,
        mortgageTerm: 20,
        propertyTaxRate: 1.5,
        homeownersInsurance: 2000,
        hoaFees: 300,
        maintenanceCostPercent: 1.5,
        closingCostPercent: 2.5,
        sellingCostPercent: 6,
        propertyAppreciationRate: 4,
        propertyTaxIncreaseRate: 2.5,
      },
      stockMarket: {
        expectedAnnualReturn: 9,
        dividendYield: 2,
        expenseRatio: 0.05,
        monthlyInvestment: 0,
      },
      rental: {
        monthlyRent: 3500,
        annualRentIncrease: 3.5,
        rentersInsurance: 25,
        securityDeposit: 2,
      },
      tax: {
        incomeTaxBracket: 32,
        capitalGainsTaxRate: 20,
        mortgageInterestDeduction: true,
        propertyTaxDeduction: true,
        standardDeduction: 27700,
      },
    }
  },
  
  'downsizing': {
    name: '🏡 Downsizing',
    description: 'Older homeowner buying a smaller home',
    inputs: {
      general: {
        currency: 'USD',
        timeHorizon: 15,
        currentSavings: 150000,
      },
      realEstate: {
        propertyPrice: 400000,
        downPaymentPercent: 30,
        mortgageInterestRate: 6.0,
        mortgageTerm: 15,
        propertyTaxRate: 1.3,
        homeownersInsurance: 1800,
        hoaFees: 250,
        maintenanceCostPercent: 0.8,
        closingCostPercent: 2.5,
        sellingCostPercent: 6,
        propertyAppreciationRate: 3,
        propertyTaxIncreaseRate: 2,
      },
      stockMarket: {
        expectedAnnualReturn: 7,
        dividendYield: 2.5,
        expenseRatio: 0.08,
        monthlyInvestment: 0,
      },
      rental: {
        monthlyRent: 2200,
        annualRentIncrease: 2.5,
        rentersInsurance: 18,
        securityDeposit: 2,
      },
      tax: {
        incomeTaxBracket: 24,
        capitalGainsTaxRate: 15,
        mortgageInterestDeduction: true,
        propertyTaxDeduction: true,
        standardDeduction: 27700,
      },
    }
  },

  'custom': {
    name: '⚙️ Custom',
    description: 'Your personalized configuration',
    inputs: null // Custom doesn't have preset inputs
  }
};

// Helper function to round numbers for comparison (handles floating point precision)
const roundForComparison = (value: number): number => {
  return Math.round(value * 100) / 100;
};

// Deep comparison function for CalculationInputs objects
const deepEqual = (obj1: CalculationInputs, obj2: CalculationInputs): boolean => {
  // Compare general section
  if (obj1.general.currency !== obj2.general.currency) return false;
  if (obj1.general.timeHorizon !== obj2.general.timeHorizon) return false;
  if (obj1.general.currentSavings !== obj2.general.currentSavings) return false;

  // Compare real estate section (with rounding for floating point numbers)
  if (obj1.realEstate.propertyPrice !== obj2.realEstate.propertyPrice) return false;
  if (obj1.realEstate.downPaymentPercent !== obj2.realEstate.downPaymentPercent) return false;
  if (roundForComparison(obj1.realEstate.mortgageInterestRate) !== roundForComparison(obj2.realEstate.mortgageInterestRate)) return false;
  if (obj1.realEstate.mortgageTerm !== obj2.realEstate.mortgageTerm) return false;
  if (roundForComparison(obj1.realEstate.propertyTaxRate) !== roundForComparison(obj2.realEstate.propertyTaxRate)) return false;
  if (obj1.realEstate.homeownersInsurance !== obj2.realEstate.homeownersInsurance) return false;
  if (obj1.realEstate.hoaFees !== obj2.realEstate.hoaFees) return false;
  if (roundForComparison(obj1.realEstate.maintenanceCostPercent) !== roundForComparison(obj2.realEstate.maintenanceCostPercent)) return false;
  if (roundForComparison(obj1.realEstate.closingCostPercent) !== roundForComparison(obj2.realEstate.closingCostPercent)) return false;
  if (roundForComparison(obj1.realEstate.sellingCostPercent) !== roundForComparison(obj2.realEstate.sellingCostPercent)) return false;
  if (roundForComparison(obj1.realEstate.propertyAppreciationRate) !== roundForComparison(obj2.realEstate.propertyAppreciationRate)) return false;
  if (roundForComparison(obj1.realEstate.propertyTaxIncreaseRate) !== roundForComparison(obj2.realEstate.propertyTaxIncreaseRate)) return false;

  // Compare stock market section
  if (roundForComparison(obj1.stockMarket.expectedAnnualReturn) !== roundForComparison(obj2.stockMarket.expectedAnnualReturn)) return false;
  if (roundForComparison(obj1.stockMarket.dividendYield) !== roundForComparison(obj2.stockMarket.dividendYield)) return false;
  if (roundForComparison(obj1.stockMarket.expenseRatio) !== roundForComparison(obj2.stockMarket.expenseRatio)) return false;
  // Note: monthlyInvestment is calculated, so we don't compare it

  // Compare rental section
  if (obj1.rental.monthlyRent !== obj2.rental.monthlyRent) return false;
  if (roundForComparison(obj1.rental.annualRentIncrease) !== roundForComparison(obj2.rental.annualRentIncrease)) return false;
  if (obj1.rental.rentersInsurance !== obj2.rental.rentersInsurance) return false;
  if (roundForComparison(obj1.rental.securityDeposit) !== roundForComparison(obj2.rental.securityDeposit)) return false;

  // Compare tax section
  if (obj1.tax.incomeTaxBracket !== obj2.tax.incomeTaxBracket) return false;
  if (obj1.tax.capitalGainsTaxRate !== obj2.tax.capitalGainsTaxRate) return false;
  if (obj1.tax.mortgageInterestDeduction !== obj2.tax.mortgageInterestDeduction) return false;
  if (obj1.tax.propertyTaxDeduction !== obj2.tax.propertyTaxDeduction) return false;
  if (obj1.tax.standardDeduction !== obj2.tax.standardDeduction) return false;

  return true;
};

// Main function to detect which preset matches current inputs
export const detectActivePreset = (currentInputs: CalculationInputs): string => {
  // Check each preset configuration
  for (const [presetKey, preset] of Object.entries(presetConfigurations)) {
    if (presetKey === 'custom' || !preset.inputs) continue;
    
    // Update currency to match current selection before comparison
    const presetInputsWithCurrency = {
      ...preset.inputs,
      general: {
        ...preset.inputs.general,
        currency: currentInputs.general.currency
      }
    };
    
    if (deepEqual(currentInputs, presetInputsWithCurrency)) {
      return presetKey;
    }
  }
  
  // If no preset matches, it's custom
  return 'custom';
};

// Get preset configuration by key
export const getPresetInputs = (presetKey: string, currency: string): CalculationInputs | null => {
  const preset = presetConfigurations[presetKey as keyof typeof presetConfigurations];
  if (!preset || !preset.inputs) return null;
  
  // Return preset inputs with current currency
  return {
    ...preset.inputs,
    general: {
      ...preset.inputs.general,
      currency: currency
    }
  };
};