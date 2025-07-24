import { CalculationInputs, CalculationResults, YearlyData } from './types';
import { 
  validateCalculationInputs, 
  calculateMortgageDetails, 
  calculateFinalNetWorth,
  findBreakEvenYear,
  calculatePrincipalPaid,
  getMontlyRate
} from './calculationUtils';

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

// Fixed function that grows portfolio for one year with specific monthly contribution
export function calculateYearlyInvestmentGrowth(
  currentBalance: number,
  monthlyContribution: number,
  annualReturn: number,
  dividendYield: number,
  expenseRatio: number
): number {
  const effectiveReturn = (annualReturn - expenseRatio) / 100;
  const monthlyReturn = effectiveReturn / 12;
  const monthlyDividend = dividendYield / 100 / 12;
  
  let balance = currentBalance;
  
  // Apply growth for 12 months with the specified monthly contribution
  for (let month = 0; month < 12; month++) {
    balance = balance * (1 + monthlyReturn + monthlyDividend) + monthlyContribution;
  }
  
  return balance;
}

export function performCalculations(inputs: CalculationInputs): CalculationResults {
  const { general, realEstate, stockMarket, rental, tax } = inputs;
  
  // Validate inputs using extracted utility
  validateCalculationInputs(inputs);
  
  // Calculate mortgage details using extracted utility
  const mortgageDetails = calculateMortgageDetails(inputs);
  
  // Calculate investment scenario
  const initialInvestment = mortgageDetails.downPayment + mortgageDetails.closingCosts;
  const monthlyInvestmentAmount = Math.max(0, mortgageDetails.totalMonthlyHousingCost - rental.monthlyRent);
  
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
  
  // Initialize portfolio tracking with starting balance
  let portfolioValue = initialInvestment;
  
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
      mortgageDetails.loanAmount,
      realEstate.mortgageInterestRate,
      mortgageDetails.monthlyMortgagePayment,
      monthsPaid
    );
    
    // Calculate interest paid this year using extracted utility
    const yearStartBalance = year > 1 ? 
      calculateMortgageBalance(mortgageDetails.loanAmount, realEstate.mortgageInterestRate, mortgageDetails.monthlyMortgagePayment, (year - 1) * 12) : 
      mortgageDetails.loanAmount;
    const yearEndBalance = mortgageBalance;
    const principalPaid = calculatePrincipalPaid(yearStartBalance, yearEndBalance);
    const interestPaidThisYear = (mortgageDetails.monthlyMortgagePayment * 12) - principalPaid;
    
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
    
    // Calculate investment portfolio growth for this year
    const adjustedMonthlyInvestment = Math.max(0, mortgageDetails.totalMonthlyHousingCost - currentRent);
    portfolioValue = calculateYearlyInvestmentGrowth(
      portfolioValue,
      adjustedMonthlyInvestment,
      stockMarket.expectedAnnualReturn,
      stockMarket.dividendYield,
      stockMarket.expenseRatio
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
  
  // Calculate final net worth using extracted utility
  const netWorthResults = calculateFinalNetWorth(yearlyData, inputs, mortgageDetails);
  
  // Find break-even year using extracted utility
  const breakEvenYear = findBreakEvenYear(yearlyData, realEstate.sellingCostPercent);
  
  return {
    ...netWorthResults,
    breakEvenYear,
    yearlyData,
    totalCosts: {
      buy: {
        totalInterest,
        totalPropertyTax,
        totalInsurance,
        totalMaintenance,
        totalHOA,
        closingCosts: mortgageDetails.closingCosts,
        sellingCosts: currentHomeValue * (realEstate.sellingCostPercent / 100)
      },
      rent: {
        totalRent: totalRentPaid,
        totalRentersInsurance
      }
    }
  };
}