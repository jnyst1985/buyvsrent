import { CalculationInputs, CalculationResults, YearlyData } from './types';

export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return payment;
}

export function calculateMortgageBalance(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  monthsPaid: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal - (monthlyPayment * monthsPaid);
  }
  
  const balance = principal * Math.pow(1 + monthlyRate, monthsPaid) -
    monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);
  
  return Math.max(0, balance);
}

export function calculateInterestPaid(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  year: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  
  for (let month = 1; month <= year * 12; month++) {
    const interestPayment = balance * monthlyRate;
    totalInterest += interestPayment;
    balance = calculateMortgageBalance(principal, annualRate, monthlyPayment, month);
  }
  
  return totalInterest;
}

export function calculateTaxSavings(
  mortgageInterest: number,
  propertyTax: number,
  incomeTaxRate: number,
  deductMortgage: boolean,
  deductProperty: boolean,
  standardDeduction: number
): number {
  let itemizedDeductions = 0;
  
  if (deductMortgage) {
    itemizedDeductions += mortgageInterest;
  }
  
  if (deductProperty) {
    itemizedDeductions += propertyTax;
  }
  
  const deductionBenefit = Math.max(0, itemizedDeductions - standardDeduction);
  return deductionBenefit * (incomeTaxRate / 100);
}

export function calculateInvestmentGrowth(
  initialInvestment: number,
  monthlyContribution: number,
  annualReturn: number,
  dividendYield: number,
  expenseRatio: number,
  years: number
): number {
  const effectiveReturn = (annualReturn - expenseRatio) / 100;
  const monthlyReturn = effectiveReturn / 12;
  const monthlyDividend = dividendYield / 100 / 12;
  
  let balance = initialInvestment;
  
  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + monthlyReturn + monthlyDividend) + monthlyContribution;
  }
  
  return balance;
}

export function performCalculations(inputs: CalculationInputs): CalculationResults {
  const {
    general,
    realEstate,
    stockMarket,
    rental,
    tax
  } = inputs;
  
  // Validate inputs to prevent calculation errors
  if (general.timeHorizon <= 0) {
    throw new Error('Time horizon must be greater than 0');
  }
  if (realEstate.propertyPrice <= 0) {
    throw new Error('Property price must be greater than 0');
  }
  if (realEstate.downPaymentPercent < 0 || realEstate.downPaymentPercent > 100) {
    throw new Error('Down payment percentage must be between 0 and 100');
  }
  
  // Calculate mortgage details
  const downPayment = realEstate.propertyPrice * (realEstate.downPaymentPercent / 100);
  const loanAmount = realEstate.propertyPrice - downPayment;
  
  if (loanAmount <= 0) {
    throw new Error('Loan amount must be greater than 0');
  }
  if (realEstate.mortgageTerm <= 0) {
    throw new Error('Mortgage term must be greater than 0');
  }
  
  const monthlyMortgagePayment = calculateMortgagePayment(
    loanAmount,
    realEstate.mortgageInterestRate,
    realEstate.mortgageTerm
  );
  
  if (isNaN(monthlyMortgagePayment) || !isFinite(monthlyMortgagePayment)) {
    throw new Error('Invalid mortgage payment calculation');
  }
  
  // Calculate initial costs
  const closingCosts = realEstate.propertyPrice * (realEstate.closingCostPercent / 100);
  
  // Calculate monthly housing costs (buy scenario)
  const monthlyPropertyTax = (realEstate.propertyPrice * realEstate.propertyTaxRate / 100) / 12;
  const monthlyInsurance = realEstate.homeownersInsurance / 12;
  const monthlyMaintenance = (realEstate.propertyPrice * realEstate.maintenanceCostPercent / 100) / 12;
  const totalMonthlyHousingCost = monthlyMortgagePayment + monthlyPropertyTax + 
    monthlyInsurance + realEstate.hoaFees + monthlyMaintenance;
  
  // Calculate investment scenario
  const initialInvestment = downPayment + closingCosts;
  const monthlyInvestmentAmount = Math.max(0, totalMonthlyHousingCost - rental.monthlyRent);
  
  // Initialize tracking variables
  const yearlyData: YearlyData[] = [];
  let currentHomeValue = realEstate.propertyPrice;
  let currentPropertyTax = realEstate.propertyPrice * realEstate.propertyTaxRate / 100;
  let currentRent = rental.monthlyRent;
  let totalRentPaid = 0;
  let totalPropertyTax = 0;
  let totalInsurance = 0;
  let totalMaintenance = 0;
  let totalHOA = 0;
  let totalInterest = 0;
  let totalRentersInsurance = 0;
  
  // Calculate year by year
  for (let year = 1; year <= general.timeHorizon; year++) {
    // Home value appreciation
    currentHomeValue *= (1 + realEstate.propertyAppreciationRate / 100);
    
    // Property tax increase
    currentPropertyTax *= (1 + realEstate.propertyTaxIncreaseRate / 100);
    
    // Rent increase
    if (year > 1) {
      currentRent *= (1 + rental.annualRentIncrease / 100);
    }
    
    // Calculate mortgage balance
    const monthsPaid = Math.min(year * 12, realEstate.mortgageTerm * 12);
    const mortgageBalance = calculateMortgageBalance(
      loanAmount,
      realEstate.mortgageInterestRate,
      monthlyMortgagePayment,
      monthsPaid
    );
    
    // Calculate interest paid this year
    const yearStartBalance = year > 1 ? 
      calculateMortgageBalance(loanAmount, realEstate.mortgageInterestRate, monthlyMortgagePayment, (year - 1) * 12) : 
      loanAmount;
    const yearEndBalance = mortgageBalance;
    const principalPaid = yearStartBalance - yearEndBalance;
    const interestPaidThisYear = (monthlyMortgagePayment * 12) - principalPaid;
    
    // Accumulate costs
    totalPropertyTax += currentPropertyTax;
    totalInsurance += realEstate.homeownersInsurance;
    totalMaintenance += currentHomeValue * realEstate.maintenanceCostPercent / 100;
    totalHOA += realEstate.hoaFees * 12;
    totalInterest += interestPaidThisYear;
    totalRentPaid += currentRent * 12;
    totalRentersInsurance += rental.rentersInsurance * 12;
    
    // Calculate tax savings
    const taxSavings = calculateTaxSavings(
      interestPaidThisYear,
      currentPropertyTax,
      tax.incomeTaxBracket,
      tax.mortgageInterestDeduction,
      tax.propertyTaxDeduction,
      tax.standardDeduction
    );
    
    // Calculate investment portfolio value
    const adjustedMonthlyInvestment = Math.max(0, totalMonthlyHousingCost - currentRent);
    const portfolioValue = calculateInvestmentGrowth(
      initialInvestment,
      adjustedMonthlyInvestment,
      stockMarket.expectedAnnualReturn,
      stockMarket.dividendYield,
      stockMarket.expenseRatio,
      year
    );
    
    yearlyData.push({
      year,
      buyScenario: {
        homeValue: currentHomeValue,
        mortgageBalance,
        equity: currentHomeValue - mortgageBalance,
        totalCosts: totalPropertyTax + totalInsurance + totalMaintenance + totalHOA + totalInterest,
        taxSavings
      },
      rentScenario: {
        portfolioValue,
        totalRentPaid,
        monthlyRent: currentRent
      }
    });
  }
  
  // Calculate final net worth
  const sellingCosts = currentHomeValue * (realEstate.sellingCostPercent / 100);
  const finalMortgageBalance = yearlyData[yearlyData.length - 1].buyScenario.mortgageBalance;
  const buyScenarioNetWorth = currentHomeValue - finalMortgageBalance - sellingCosts;
  
  const finalPortfolioValue = yearlyData[yearlyData.length - 1].rentScenario.portfolioValue;
  const capitalGainsTax = (finalPortfolioValue - initialInvestment - 
    (monthlyInvestmentAmount * 12 * general.timeHorizon)) * (tax.capitalGainsTaxRate / 100);
  const rentScenarioNetWorth = finalPortfolioValue - capitalGainsTax;
  
  // Find true break-even year (last crossover where buying becomes permanently better)
  let breakEvenYear: number | null = null;
  
  // First, find all crossover points
  const crossovers: number[] = [];
  let previousBuyBetter = false;
  
  for (let i = 0; i < yearlyData.length; i++) {
    const buyNetWorth = yearlyData[i].buyScenario.equity - 
      (yearlyData[i].buyScenario.homeValue * realEstate.sellingCostPercent / 100);
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
        (yearlyData[i].buyScenario.homeValue * realEstate.sellingCostPercent / 100);
      const rentNetWorth = yearlyData[i].rentScenario.portfolioValue;
      
      if (rentNetWorth >= buyNetWorth) {
        buyStaysAhead = false;
        break;
      }
    }
    
    if (buyStaysAhead) {
      breakEvenYear = crossoverYear;
      break;
    }
  }
  
  return {
    buyScenarioNetWorth,
    rentScenarioNetWorth,
    difference: buyScenarioNetWorth - rentScenarioNetWorth,
    differencePercent: rentScenarioNetWorth !== 0 ? 
      ((buyScenarioNetWorth - rentScenarioNetWorth) / rentScenarioNetWorth) * 100 : 0,
    breakEvenYear,
    yearlyData,
    totalCosts: {
      buy: {
        totalInterest,
        totalPropertyTax,
        totalInsurance,
        totalMaintenance,
        totalHOA,
        closingCosts,
        sellingCosts
      },
      rent: {
        totalRent: totalRentPaid,
        totalRentersInsurance
      }
    }
  };
}