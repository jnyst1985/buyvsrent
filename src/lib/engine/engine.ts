import type {
  CostTotals,
  EngineInputs,
  EngineResults,
  SensitivityRow,
  YearRow,
} from './types';

/**
 * Monthly-resolution simulation of both scenarios over the horizon.
 *
 * Core principle — symmetric opportunity cost: each month, whichever scenario
 * is cheaper, that person invests the difference. The renter's portfolio is
 * seeded with the buyer's upfront cash (down payment + closing costs, less the
 * renter's own security deposit). Most calculators only credit the renter and
 * never invest the buyer's surplus in years when renting is dearer; that
 * asymmetry systematically distorts the comparison.
 *
 * Conventions (documented on /methodology):
 * - Home value compounds monthly at (1+a)^(1/12): year-end values match the
 *   stated annual appreciation exactly.
 * - Rent, property tax, insurance, HOA and renter's insurance step once per
 *   year (lease renewals / annual bills).
 * - Investment return compounds monthly at (r − fees)/12, contributions at
 *   month-end. r is TOTAL return (dividends included).
 * - Mortgage interest deduction honors the acquisition-debt cap pro rata;
 *   property tax deduction is capped by the SALT cap; only the amount by which
 *   itemized deductions exceed the standard deduction counts (post-2017 rules).
 * - PMI (when down payment < 20%) is charged in any month that STARTS with a
 *   balance above 80% of the ORIGINAL purchase price — the Homeowners
 *   Protection Act automatic-termination schedule. (Borrowers can often
 *   cancel earlier by request once appreciation lifts equity; we model the
 *   guaranteed path.)
 * - At the horizon both scenarios liquidate: the home sale pays selling costs
 *   and capital-gains tax beyond the Section 121 exclusion; portfolios pay
 *   capital-gains tax on gains above contributed basis; the renter's security
 *   deposit returns without interest.
 */
export function simulate(inputs: EngineInputs): EngineResults {
  const core = run(inputs);
  return { ...core, sensitivity: computeSensitivity(inputs, core.difference) };
}

/**
 * The simulation without the sensitivity re-runs — the cheap path for live
 * recompute. Pair with analyzeScenario() for the deferred expensive extras.
 */
export function simulateCore(inputs: EngineInputs): Omit<EngineResults, 'sensitivity'> {
  return run(inputs);
}

/** The expensive extras (~50 extra simulations): sensitivity + tipping rent. */
export function analyzeScenario(inputs: EngineInputs): {
  sensitivity: SensitivityRow[];
  tippingRent: number | null;
} {
  const base = run(inputs);
  return {
    sensitivity: computeSensitivity(inputs, base.difference),
    tippingRent: tippingPointRent(inputs),
  };
}

/** One month of amortization for every month of a year — the single source of
 *  truth used both for the tax projection and the actual cash-flow loop. */
function amortizeYear(
  startBalance: number,
  monthlyRate: number,
  payment: number,
  monthsThisYear: number,
  firstMonthIndex: number,
  termMonths: number,
): { months: Array<{ interest: number; principal: number }>; endBalance: number } {
  const months: Array<{ interest: number; principal: number }> = [];
  let bal = startBalance;
  for (let m = 0; m < monthsThisYear; m++) {
    const monthIndex = firstMonthIndex + m;
    if (bal <= 0 || monthIndex > termMonths) {
      months.push({ interest: 0, principal: 0 });
      continue;
    }
    const interest = bal * monthlyRate;
    const principal = Math.min(payment - interest, bal);
    months.push({ interest, principal });
    bal -= principal;
  }
  return { months, endBalance: bal };
}

function run(inputs: EngineInputs): Omit<EngineResults, 'sensitivity'> {
  const horizonMonths = Math.round(inputs.timeHorizonYears * 12);
  const termMonths = Math.round(inputs.mortgageTermYears * 12);

  const downPayment = (inputs.homePrice * inputs.downPaymentPct) / 100;
  const loanAmount = inputs.homePrice - downPayment;
  const closingCosts = (inputs.homePrice * inputs.closingCostPct) / 100;
  const monthlyRate = inputs.mortgageRatePct / 100 / 12;
  const mortgagePayment =
    loanAmount <= 0
      ? 0
      : monthlyRate === 0
        ? loanAmount / termMonths
        : (loanAmount * (monthlyRate * (1 + monthlyRate) ** termMonths)) /
          ((1 + monthlyRate) ** termMonths - 1);

  const securityDeposit = inputs.securityDepositMonths * inputs.monthlyRent;

  // Upfront difference seeds the portfolios, symmetric in both directions.
  const buyerUpfront = downPayment + closingCosts;
  let rentPortfolio = Math.max(0, buyerUpfront - securityDeposit);
  let buyPortfolio = Math.max(0, securityDeposit - buyerUpfront);
  let rentBasis = rentPortfolio;
  let buyBasis = buyPortfolio;

  const monthlyGrowth = 1 + (inputs.investmentReturnPct - inputs.expenseRatioPct) / 100 / 12;
  const homeMonthlyGrowth = (1 + inputs.homeAppreciationPct / 100) ** (1 / 12);
  const pmiRequired = inputs.downPaymentPct < 20 && loanAmount > 0;
  const monthlyPmi = pmiRequired ? (loanAmount * inputs.pmiAnnualPct) / 100 / 12 : 0;

  let homeValue = inputs.homePrice;
  let loanBalance = loanAmount;
  let annualRent = inputs.monthlyRent * 12;
  let annualPropertyTax = (inputs.homePrice * inputs.propertyTaxPct) / 100;
  let annualInsurance = inputs.homeInsuranceAnnual;
  let annualHoa = inputs.hoaMonthly * 12;
  let annualRentersInsurance = inputs.rentersInsuranceMonthly * 12;

  const years: YearRow[] = [];
  const totals: CostTotals = {
    buy: {
      downPayment,
      closingCosts,
      totalInterest: 0,
      totalPrincipal: 0,
      totalPropertyTax: 0,
      totalInsurance: 0,
      totalMaintenance: 0,
      totalHoa: 0,
      totalPmi: 0,
      totalTaxSavings: 0,
      sellingCosts: 0,
      homeSaleTax: 0,
    },
    rent: {
      securityDeposit,
      totalRent: 0,
      totalRentersInsurance: 0,
    },
  };

  const yearOneMonthly = {
    mortgagePayment,
    propertyTax: annualPropertyTax / 12,
    insurance: annualInsurance / 12,
    hoa: inputs.hoaMonthly,
    maintenance: (inputs.homePrice * inputs.maintenancePct) / 100 / 12,
    pmi: monthlyPmi,
    taxSavings: 0,
    buyTotal: 0,
    rent: inputs.monthlyRent,
    rentersInsurance: inputs.rentersInsuranceMonthly,
    rentTotal: 0,
  };
  yearOneMonthly.buyTotal =
    mortgagePayment +
    yearOneMonthly.propertyTax +
    yearOneMonthly.insurance +
    yearOneMonthly.hoa +
    yearOneMonthly.maintenance +
    yearOneMonthly.pmi;
  yearOneMonthly.rentTotal = inputs.monthlyRent + inputs.rentersInsuranceMonthly;

  const numYears = Math.ceil(horizonMonths / 12);
  for (let year = 1; year <= numYears; year++) {
    // Annual step-ups (rents renew, bills arrive once a year).
    if (year > 1) {
      annualRent *= 1 + inputs.rentIncreasePct / 100;
      annualPropertyTax *= 1 + inputs.propertyTaxIncreasePct / 100;
      annualInsurance *= 1 + inputs.inflationPct / 100;
      annualHoa *= 1 + inputs.inflationPct / 100;
      annualRentersInsurance *= 1 + inputs.inflationPct / 100;
    }

    const monthsThisYear = Math.min(12, horizonMonths - (year - 1) * 12);
    const yearFraction = monthsThisYear / 12;

    // This year's amortization, computed once and used both for the tax
    // projection and for the actual cash-flow loop below.
    const yearStartBalance = loanBalance;
    const schedule = amortizeYear(
      loanBalance,
      monthlyRate,
      mortgagePayment,
      monthsThisYear,
      (year - 1) * 12 + 1,
      termMonths,
    );
    const projectedInterest = schedule.months.reduce((s, m) => s + m.interest, 0);
    const projectedEndBalance = schedule.endBalance;

    // Tax savings from itemizing, over and above the standard deduction.
    // Deduction amounts pro-rate for a partial final year so the interest
    // (already partial) is compared against matching-period figures.
    let taxSavings = 0;
    if (inputs.itemizeDeductions) {
      // IRS Pub. 936 convention: average acquisition debt for the year.
      const averageBalance = (yearStartBalance + projectedEndBalance) / 2;
      const capRatio =
        averageBalance > inputs.mortgageInterestDeductionCap
          ? inputs.mortgageInterestDeductionCap / averageBalance
          : 1;
      const deductibleInterest = projectedInterest * capRatio;
      const deductibleSalt = Math.min(annualPropertyTax * yearFraction, inputs.saltCap * yearFraction);
      const excess = Math.max(
        0,
        deductibleInterest + deductibleSalt - inputs.standardDeduction * yearFraction,
      );
      taxSavings = (excess * inputs.marginalTaxRatePct) / 100;
    }
    const monthlyTaxCredit = monthsThisYear > 0 ? taxSavings / monthsThisYear : 0;

    let interestPaidThisYear = 0;
    let principalPaidThisYear = 0;
    let pmiPaidThisYear = 0;
    let buyCostThisYear = 0;
    let rentCostThisYear = 0;

    // Maintenance is a % of the home's value at the START of the year.
    const maintenanceMonthly = (homeValue * inputs.maintenancePct) / 100 / 12;

    for (let m = 0; m < monthsThisYear; m++) {
      // PMI is due for any month that STARTS above 80% LTV of original price.
      let pmiThisMonth = 0;
      if (pmiRequired && loanBalance > 0.8 * inputs.homePrice) {
        pmiThisMonth = monthlyPmi;
        pmiPaidThisYear += pmiThisMonth;
      }

      // Mortgage cash flow from the precomputed schedule.
      const { interest, principal } = schedule.months[m];
      const paymentThisMonth = interest + principal;
      interestPaidThisYear += interest;
      principalPaidThisYear += principal;
      loanBalance -= principal;

      const buyCost =
        paymentThisMonth +
        annualPropertyTax / 12 +
        annualInsurance / 12 +
        annualHoa / 12 +
        maintenanceMonthly +
        pmiThisMonth -
        monthlyTaxCredit;
      const rentCost = annualRent / 12 + annualRentersInsurance / 12;

      buyCostThisYear += buyCost;
      rentCostThisYear += rentCost;

      // Grow portfolios, then invest the month's difference on the cheaper side.
      rentPortfolio *= monthlyGrowth;
      buyPortfolio *= monthlyGrowth;
      const diff = buyCost - rentCost;
      if (diff > 0) {
        rentPortfolio += diff;
        rentBasis += diff;
      } else if (diff < 0) {
        buyPortfolio += -diff;
        buyBasis += -diff;
      }

      homeValue *= homeMonthlyGrowth;
    }

    if (year === 1) {
      yearOneMonthly.taxSavings = monthlyTaxCredit;
    }

    totals.buy.totalInterest += interestPaidThisYear;
    totals.buy.totalPrincipal += principalPaidThisYear;
    totals.buy.totalPropertyTax += (annualPropertyTax / 12) * monthsThisYear;
    totals.buy.totalInsurance += (annualInsurance / 12) * monthsThisYear;
    totals.buy.totalHoa += (annualHoa / 12) * monthsThisYear;
    totals.buy.totalPmi += pmiPaidThisYear;
    totals.buy.totalTaxSavings += taxSavings;
    totals.buy.totalMaintenance += maintenanceMonthly * monthsThisYear;
    totals.rent.totalRent += (annualRent / 12) * monthsThisYear;
    totals.rent.totalRentersInsurance += (annualRentersInsurance / 12) * monthsThisYear;

    years.push({
      year,
      homeValue,
      loanBalance,
      homeEquity: homeValue - loanBalance,
      buyPortfolio,
      rentPortfolio,
      buyNetWorth: liquidateBuy(inputs, homeValue, loanBalance, buyPortfolio, buyBasis),
      rentNetWorth: liquidateRent(inputs, rentPortfolio, rentBasis, securityDeposit),
      buyAnnualCost: buyCostThisYear,
      rentAnnualCost: rentCostThisYear,
      monthlyRent: annualRent / 12,
      interestPaid: interestPaidThisYear,
      principalPaid: principalPaidThisYear,
      taxSavings,
      pmiPaid: pmiPaidThisYear,
    });
  }

  const last = years[years.length - 1];
  totals.buy.sellingCosts = (last.homeValue * inputs.sellingCostPct) / 100;
  totals.buy.homeSaleTax = homeSaleTax(inputs, last.homeValue);

  const buyNetWorth = last.buyNetWorth;
  const rentNetWorth = last.rentNetWorth;
  const difference = buyNetWorth - rentNetWorth;
  // "Tie" band: within 1% of the larger side's magnitude.
  const tieBand = 0.01 * Math.max(Math.abs(buyNetWorth), Math.abs(rentNetWorth));
  const verdict = Math.abs(difference) <= tieBand ? 'tie' : difference > 0 ? 'buy' : 'rent';

  return {
    verdict,
    difference,
    buyNetWorth,
    rentNetWorth,
    yearZero: {
      buyNetWorth:
        inputs.homePrice * (1 - inputs.sellingCostPct / 100) -
        loanAmount -
        homeSaleTax(inputs, inputs.homePrice) +
        Math.max(0, securityDeposit - buyerUpfront),
      rentNetWorth: Math.max(0, buyerUpfront - securityDeposit) + securityDeposit,
    },
    breakEvenYear: findBreakEven(years),
    years,
    totals,
    monthly: yearOneMonthly,
  };
}

function homeSaleTax(inputs: EngineInputs, homeValue: number): number {
  const sellingCosts = (homeValue * inputs.sellingCostPct) / 100;
  const gain = homeValue - sellingCosts - inputs.homePrice;
  const exclusion = inputs.filingStatus === 'married' ? 500_000 : 250_000;
  const taxable = Math.max(0, gain - exclusion);
  return (taxable * inputs.capitalGainsRatePct) / 100;
}

function liquidateBuy(
  inputs: EngineInputs,
  homeValue: number,
  loanBalance: number,
  portfolio: number,
  basis: number,
): number {
  const sellingCosts = (homeValue * inputs.sellingCostPct) / 100;
  const portfolioTax =
    (Math.max(0, portfolio - basis) * inputs.capitalGainsRatePct) / 100;
  return (
    homeValue - sellingCosts - loanBalance - homeSaleTax(inputs, homeValue) + portfolio - portfolioTax
  );
}

function liquidateRent(
  inputs: EngineInputs,
  portfolio: number,
  basis: number,
  securityDeposit: number,
): number {
  const portfolioTax =
    (Math.max(0, portfolio - basis) * inputs.capitalGainsRatePct) / 100;
  return portfolio - portfolioTax + securityDeposit;
}

/** First year buying leads and never falls behind again (net of sale costs and taxes). */
function findBreakEven(years: YearRow[]): number | null {
  let candidate: number | null = null;
  for (const row of years) {
    if (row.buyNetWorth > row.rentNetWorth) {
      candidate ??= row.year;
    } else {
      candidate = null;
    }
  }
  return candidate;
}

const SENSITIVITY_KEYS: Array<{ key: SensitivityRow['key']; label: string }> = [
  { key: 'homeAppreciationPct', label: 'Home appreciation' },
  { key: 'investmentReturnPct', label: 'Investment return' },
  { key: 'rentIncreasePct', label: 'Rent growth' },
  { key: 'mortgageRatePct', label: 'Mortgage rate' },
];

/**
 * The rent at which buying and renting tie at the horizon: "buying wins if a
 * similar rental costs more than $X/month." Binary search; the security
 * deposit scales with the candidate rent, matching real scenarios. Returns
 * null when no tipping point exists in a sane range (e.g. buying wins even at
 * zero rent, which can't happen, or never wins below $100k/mo).
 */
export function tippingPointRent(inputs: EngineInputs): number | null {
  const diffAt = (rent: number) => run({ ...inputs, monthlyRent: rent }).difference;
  let lo = 1;
  let hi = 100_000;
  // difference(rent) increases with rent (higher rent favors buying).
  if (diffAt(lo) > 0 || diffAt(hi) < 0) return null;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (diffAt(mid) > 0) hi = mid;
    else lo = mid;
  }
  return Math.round((lo + hi) / 2);
}

function computeSensitivity(inputs: EngineInputs, baseDifference: number): SensitivityRow[] {
  const base = Math.sign(baseDifference);
  return SENSITIVITY_KEYS.map(({ key, label }) => {
    const minusOne = run({ ...inputs, [key]: inputs[key] - 1 }).difference;
    const plusOne = run({ ...inputs, [key]: inputs[key] + 1 }).difference;
    const flips = Math.sign(minusOne) !== base || Math.sign(plusOne) !== base;
    return { key, label, minusOne, plusOne, flips };
  });
}
