import { CalculationInputs, CalculationResults, YearlyData } from './types';
import {
  validateCalculationInputs,
  calculateMortgageDetails,
  calculateFinalNetWorth,
  findBreakEvenYear,
  calculatePrincipalPaid,
  getMonthlyRate
} from './calculationUtils';
import { CALCULATION_CONSTANTS } from './constants';

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
  standardDeduction: number,
  saltCap: number = 10000 // SALT deduction cap
): number {
  let itemizedDeductions = 0;

  if (deductMortgage) {
    itemizedDeductions += mortgageInterest;
  }

  if (deductProperty) {
    // Apply SALT cap to property tax deduction
    itemizedDeductions += Math.min(propertyTax, saltCap);
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

  // Calculate investment scenario — subtract security deposit from initial investment
  const securityDepositAmount = rental.securityDeposit * rental.monthlyRent;
  const initialInvestment = mortgageDetails.downPayment + mortgageDetails.closingCosts - securityDepositAmount;

  // Initialize tracking variables
  const yearlyData: YearlyData[] = [];
  let currentHomeValue = realEstate.propertyPrice;
  let currentPropertyTax = realEstate.propertyPrice * realEstate.propertyTaxRate / 100;
  let currentRent = rental.monthlyRent;
  let currentInsurance = realEstate.homeownersInsurance;
  let currentHOA = realEstate.hoaFees;
  let currentRentersInsurance = rental.rentersInsurance;
  let totalRentPaid = 0;
  let totalPropertyTax = 0;
  let totalInsurance = 0;
  let totalMaintenance = 0;
  let totalHOA = 0;
  let totalInterest = 0;
  let totalRentersInsurance = 0;
  let totalPMI = 0;

  // Track cumulative amount invested for accurate cost basis calculation
  let cumulativeTotalInvested = Math.max(0, initialInvestment);

  // Initialize portfolio tracking with starting balance
  let portfolioValue = Math.max(0, initialInvestment);

  // Inflation rate for insurance/HOA/renter's insurance
  const inflationRate = realEstate.generalInflationRate / 100;

  // Calculate year by year
  for (let year = 1; year <= general.timeHorizon; year++) {
    // Home value appreciation
    currentHomeValue *= (1 + realEstate.propertyAppreciationRate / 100);

    // Property tax increase
    currentPropertyTax *= (1 + realEstate.propertyTaxIncreaseRate / 100);

    // Inflate insurance, HOA, and renter's insurance annually
    if (year > 1) {
      currentRent *= (1 + rental.annualRentIncrease / 100);
      currentInsurance *= (1 + inflationRate);
      currentHOA *= (1 + inflationRate);
      currentRentersInsurance *= (1 + inflationRate);
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

    // PMI calculation — auto-cancel when equity reaches 20% of current home value
    const currentEquityRatio = (currentHomeValue - mortgageBalance) / currentHomeValue;
    const pmiActive = realEstate.downPaymentPercent < 20 &&
      currentEquityRatio < CALCULATION_CONSTANTS.PMI_CANCEL_EQUITY_THRESHOLD;
    const annualPMI = pmiActive ? (mortgageDetails.loanAmount * realEstate.pmiRate / 100) : 0;

    // Accumulate costs (using inflated values)
    totalPropertyTax += currentPropertyTax;
    totalInsurance += currentInsurance;
    totalMaintenance += currentHomeValue * realEstate.maintenanceCostPercent / 100;
    totalHOA += currentHOA * 12;
    totalInterest += interestPaidThisYear;
    totalPMI += annualPMI;
    totalRentPaid += currentRent * 12;
    totalRentersInsurance += currentRentersInsurance * 12;

    // Calculate tax savings with SALT cap
    const taxSavings = calculateTaxSavings(
      interestPaidThisYear,
      currentPropertyTax,
      tax.incomeTaxBracket,
      tax.mortgageInterestDeduction,
      tax.propertyTaxDeduction,
      tax.standardDeduction,
      tax.saltCap
    );

    // Calculate actual monthly housing cost for this year (with inflated costs + PMI)
    const yearlyMonthlyHousingCost = mortgageDetails.monthlyMortgagePayment +
      (currentPropertyTax / 12) +
      (currentInsurance / 12) +
      currentHOA +
      (currentHomeValue * realEstate.maintenanceCostPercent / 100 / 12) +
      (pmiActive ? annualPMI / 12 : 0);

    // Calculate investment portfolio growth for this year
    const adjustedMonthlyInvestment = Math.max(0, yearlyMonthlyHousingCost - currentRent - currentRentersInsurance);
    cumulativeTotalInvested += adjustedMonthlyInvestment * 12;

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
        totalCosts: totalPropertyTax + totalInsurance + totalMaintenance + totalHOA + totalInterest + totalPMI,
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
  const netWorthResults = calculateFinalNetWorth(yearlyData, inputs, mortgageDetails, cumulativeTotalInvested);

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
        totalPMI,
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