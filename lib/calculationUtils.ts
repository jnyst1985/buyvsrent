import { CalculationInputs, YearlyData } from './types';

// Mortgage calculation utilities
export function getMontlyRate(annualRate: number): number {
  return annualRate / 100 / 12;
}

export function validateCalculationInputs(inputs: CalculationInputs): void {
  const { general, realEstate } = inputs;
  
  if (general.timeHorizon <= 0) {
    throw new Error('Time horizon must be greater than 0');
  }
  if (realEstate.propertyPrice <= 0) {
    throw new Error('Property price must be greater than 0');
  }
  if (realEstate.downPaymentPercent < 0 || realEstate.downPaymentPercent > 100) {
    throw new Error('Down payment percentage must be between 0 and 100');
  }
  if (realEstate.mortgageTerm <= 0) {
    throw new Error('Mortgage term must be greater than 0');
  }
}

export interface MortgageDetails {
  downPayment: number;
  loanAmount: number;
  monthlyMortgagePayment: number;
  closingCosts: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  totalMonthlyHousingCost: number;
}

export function calculateMortgageDetails(inputs: CalculationInputs): MortgageDetails {
  const { realEstate } = inputs;
  
  const downPayment = realEstate.propertyPrice * (realEstate.downPaymentPercent / 100);
  const loanAmount = realEstate.propertyPrice - downPayment;
  
  if (loanAmount <= 0) {
    throw new Error('Loan amount must be greater than 0');
  }
  
  const monthlyRate = getMontlyRate(realEstate.mortgageInterestRate);
  const numPayments = realEstate.mortgageTerm * 12;
  
  let monthlyMortgagePayment: number;
  if (monthlyRate === 0) {
    monthlyMortgagePayment = loanAmount / numPayments;
  } else {
    monthlyMortgagePayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }
  
  if (isNaN(monthlyMortgagePayment) || !isFinite(monthlyMortgagePayment)) {
    throw new Error('Invalid mortgage payment calculation');
  }
  
  const closingCosts = realEstate.propertyPrice * (realEstate.closingCostPercent / 100);
  const monthlyPropertyTax = (realEstate.propertyPrice * realEstate.propertyTaxRate / 100) / 12;
  const monthlyInsurance = realEstate.homeownersInsurance / 12;
  const monthlyMaintenance = (realEstate.propertyPrice * realEstate.maintenanceCostPercent / 100) / 12;
  const totalMonthlyHousingCost = monthlyMortgagePayment + monthlyPropertyTax + 
    monthlyInsurance + realEstate.hoaFees + monthlyMaintenance;
  
  return {
    downPayment,
    loanAmount,
    monthlyMortgagePayment,
    closingCosts,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyMaintenance,
    totalMonthlyHousingCost
  };
}

export interface NetWorthResults {
  buyScenarioNetWorth: number;
  rentScenarioNetWorth: number;
  difference: number;
  differencePercent: number;
}

export function calculateFinalNetWorth(
  yearlyData: YearlyData[], 
  inputs: CalculationInputs,
  mortgageDetails: MortgageDetails
): NetWorthResults {
  const finalYearData = yearlyData[yearlyData.length - 1];
  const currentHomeValue = finalYearData.buyScenario.homeValue;
  
  // Calculate final net worth
  const sellingCosts = currentHomeValue * (inputs.realEstate.sellingCostPercent / 100);
  const finalMortgageBalance = finalYearData.buyScenario.mortgageBalance;
  const buyScenarioNetWorth = currentHomeValue - finalMortgageBalance - sellingCosts;
  
  const finalPortfolioValue = finalYearData.rentScenario.portfolioValue;
  const initialInvestment = mortgageDetails.downPayment + mortgageDetails.closingCosts;
  const monthlyInvestmentAmount = Math.max(0, mortgageDetails.totalMonthlyHousingCost - inputs.rental.monthlyRent);
  
  // Calculate capital gains tax more safely
  const totalInvested = initialInvestment + (monthlyInvestmentAmount * 12 * inputs.general.timeHorizon);
  const capitalGains = Math.max(0, finalPortfolioValue - totalInvested);
  const capitalGainsTax = capitalGains * (inputs.tax.capitalGainsTaxRate / 100);
  const rentScenarioNetWorth = finalPortfolioValue - capitalGainsTax;
  
  const difference = buyScenarioNetWorth - rentScenarioNetWorth;
  const differencePercent = rentScenarioNetWorth !== 0 ? 
    (difference / rentScenarioNetWorth) * 100 : 0;
  
  return {
    buyScenarioNetWorth,
    rentScenarioNetWorth,
    difference,
    differencePercent
  };
}

export function calculatePrincipalPaid(yearStartBalance: number, yearEndBalance: number): number {
  return Math.max(0, yearStartBalance - yearEndBalance);
}

export function findBreakEvenYear(yearlyData: YearlyData[], sellingCostPercent: number): number | null {
  // Find true break-even year (last crossover where buying becomes permanently better)
  const crossovers: number[] = [];
  let previousBuyBetter = false;
  
  for (let i = 0; i < yearlyData.length; i++) {
    const buyNetWorth = yearlyData[i].buyScenario.equity - 
      (yearlyData[i].buyScenario.homeValue * sellingCostPercent / 100);
    const rentNetWorth = yearlyData[i].rentScenario.portfolioValue;
    const buyBetter = buyNetWorth > rentNetWorth;
    
    // If this is a crossover point (buy becomes better when it wasn't before)
    if (buyBetter && !previousBuyBetter) {
      crossovers.push(i + 1);
    }
    previousBuyBetter = buyBetter;
  }
  
  // Check each crossover to see if buying stays ahead for the rest of the period
  for (let crossoverIndex = crossovers.length - 1; crossoverIndex >= 0; crossoverIndex--) {
    const crossoverYear = crossovers[crossoverIndex];
    let buyStaysAhead = true;
    
    // Check if buying stays ahead from this crossover until the end
    for (let i = crossoverYear - 1; i < yearlyData.length; i++) {
      const buyNetWorth = yearlyData[i].buyScenario.equity - 
        (yearlyData[i].buyScenario.homeValue * sellingCostPercent / 100);
      const rentNetWorth = yearlyData[i].rentScenario.portfolioValue;
      
      if (rentNetWorth >= buyNetWorth) {
        buyStaysAhead = false;
        break;
      }
    }
    
    if (buyStaysAhead) {
      return crossoverYear;
    }
  }
  
  return null;
}