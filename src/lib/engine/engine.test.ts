import { describe, expect, it } from 'vitest';
import type { EngineInputs } from './types';
import { simulate, tippingPointRent } from './engine';

/** All-zero baseline: no growth, no costs, no taxes. Every number hand-derivable. */
const ZERO: EngineInputs = {
  currency: 'USD',
  timeHorizonYears: 1,
  homePrice: 120_000,
  downPaymentPct: 100,
  mortgageRatePct: 0,
  mortgageTermYears: 30,
  closingCostPct: 0,
  sellingCostPct: 0,
  propertyTaxPct: 0,
  propertyTaxIncreasePct: 0,
  homeInsuranceAnnual: 0,
  hoaMonthly: 0,
  maintenancePct: 0,
  homeAppreciationPct: 0,
  pmiAnnualPct: 0,
  monthlyRent: 1000,
  rentIncreasePct: 0,
  rentersInsuranceMonthly: 0,
  securityDepositMonths: 0,
  investmentReturnPct: 0,
  expenseRatioPct: 0,
  marginalTaxRatePct: 0,
  capitalGainsRatePct: 0,
  filingStatus: 'single',
  standardDeduction: 0,
  saltCap: 0,
  mortgageInterestDeductionCap: 750_000,
  itemizeDeductions: false,
  inflationPct: 0,
};

describe('degenerate all-cash scenario (every number hand-derivable)', () => {
  it('difference equals exactly the rent the buyer avoided paying', () => {
    const r = simulate(ZERO);
    // Buyer: home worth 120k + invested the 1000/mo they saved vs renting = 12k.
    expect(r.buyNetWorth).toBeCloseTo(132_000, 6);
    // Renter: invested the buyer's 120k upfront, zero growth.
    expect(r.rentNetWorth).toBeCloseTo(120_000, 6);
    expect(r.difference).toBeCloseTo(12_000, 6);
    expect(r.verdict).toBe('buy');
  });

  it('is symmetric: renter invests when buying costs more', () => {
    // Same world, but the buyer now pays 500/mo HOA and rent is only 100.
    const r = simulate({ ...ZERO, hoaMonthly: 500, monthlyRent: 100 });
    // diff = 500 − 100 = 400/mo into the renter's portfolio.
    expect(r.years[0].rentPortfolio).toBeCloseTo(120_000 + 400 * 12, 6);
    expect(r.years[0].buyPortfolio).toBeCloseTo(0, 6);
  });
});

describe('mortgage math', () => {
  const MORTGAGE: EngineInputs = {
    ...ZERO,
    homePrice: 125_000,
    downPaymentPct: 20, // loan = 100k
    mortgageRatePct: 6,
    mortgageTermYears: 30,
    timeHorizonYears: 1,
  };

  it('computes the canonical 100k @ 6% 30y payment (599.55)', () => {
    const r = simulate(MORTGAGE);
    expect(r.monthly.mortgagePayment).toBeCloseTo(599.5505, 3);
  });

  it('amortizes to the standard 12-month balance (98,771.99)', () => {
    const r = simulate(MORTGAGE);
    expect(r.years[0].loanBalance).toBeCloseTo(98_771.99, 1);
    // interest + principal = 12 payments
    expect(r.years[0].interestPaid + r.years[0].principalPaid).toBeCloseTo(599.5505 * 12, 2);
  });

  it('0% mortgage divides principal evenly', () => {
    const r = simulate({ ...MORTGAGE, mortgageRatePct: 0 });
    expect(r.monthly.mortgagePayment).toBeCloseTo(100_000 / 360, 6);
    expect(r.years[0].interestPaid).toBe(0);
  });

  it('stops payments after the loan term when horizon > term', () => {
    const r = simulate({
      ...MORTGAGE,
      mortgageTermYears: 15,
      timeHorizonYears: 20,
    });
    const y16 = r.years[15];
    expect(y16.principalPaid).toBe(0);
    expect(y16.interestPaid).toBe(0);
    expect(r.years[14].loanBalance).toBeCloseTo(0, 4);
    // With the mortgage gone, buying is cheaper than renting → buyer invests.
    expect(r.years[19].buyPortfolio).toBeGreaterThan(0);
  });
});

describe('investment growth', () => {
  it('compounds monthly with end-of-month contributions (FV formula)', () => {
    const clean = simulate({
      ...ZERO,
      homePrice: 120_000,
      hoaMonthly: 1100, // buy cost = 1100, rent = 1000 → diff 100/mo to renter
      investmentReturnPct: 12,
    });
    // Renter: seed 120k grows at 1%/mo for 12mo + 100/mo annuity at month-end.
    const seedGrowth = 120_000 * 1.01 ** 12;
    const annuity = 100 * ((1.01 ** 12 - 1) / 0.01);
    expect(clean.years[0].rentPortfolio).toBeCloseTo(seedGrowth + annuity, 2);
  });

  it('subtracts the expense ratio from returns', () => {
    const gross = simulate({ ...ZERO, investmentReturnPct: 8 });
    const net = simulate({ ...ZERO, investmentReturnPct: 8, expenseRatioPct: 1 });
    const netEquivalent = simulate({ ...ZERO, investmentReturnPct: 7 });
    expect(net.rentNetWorth).toBeLessThan(gross.rentNetWorth);
    expect(net.rentNetWorth).toBeCloseTo(netEquivalent.rentNetWorth, 6);
  });
});

describe('PMI', () => {
  it('charges PMI under 20% down and cancels at 80% LTV of current value', () => {
    const r = simulate({
      ...ZERO,
      timeHorizonYears: 30,
      homePrice: 100_000,
      downPaymentPct: 10,
      mortgageRatePct: 6,
      pmiAnnualPct: 1,
      homeAppreciationPct: 3,
    });
    expect(r.years[0].pmiPaid).toBeGreaterThan(0);
    // With 3% appreciation + amortization, LTV falls below 80% within a few years.
    const firstFree = r.years.find((y) => y.pmiPaid === 0);
    expect(firstFree).toBeDefined();
    expect(firstFree!.year).toBeLessThan(10);
    // Once cancelled it never comes back.
    const cancelIndex = r.years.indexOf(firstFree!);
    expect(r.years.slice(cancelIndex).every((y) => y.pmiPaid === 0)).toBe(true);
  });

  it('never charges PMI at 20%+ down', () => {
    const r = simulate({ ...ZERO, downPaymentPct: 20, homePrice: 100_000, mortgageRatePct: 6 });
    expect(r.years.every((y) => y.pmiPaid === 0)).toBe(true);
  });
});

describe('taxes at sale', () => {
  const APPRECIATING: EngineInputs = {
    ...ZERO,
    timeHorizonYears: 30,
    homePrice: 500_000,
    homeAppreciationPct: 5,
    sellingCostPct: 6,
    capitalGainsRatePct: 15,
  };

  it('applies the Section 121 exclusion by filing status', () => {
    const single = simulate(APPRECIATING);
    const married = simulate({ ...APPRECIATING, filingStatus: 'married' });
    // 500k @ 5%×30y ≈ 2.16M → gain far above both exclusions; married excludes 250k more.
    const expectedGap = 250_000 * 0.15;
    expect(married.buyNetWorth - single.buyNetWorth).toBeCloseTo(expectedGap, 0);
  });

  it('taxes portfolio gains above contributed basis', () => {
    const noTax = simulate({ ...ZERO, investmentReturnPct: 8, capitalGainsRatePct: 0, timeHorizonYears: 10 });
    const taxed = simulate({ ...ZERO, investmentReturnPct: 8, capitalGainsRatePct: 15, timeHorizonYears: 10 });
    const gain = noTax.years[9].rentPortfolio - 120_000;
    expect(noTax.rentNetWorth - taxed.rentNetWorth).toBeCloseTo(gain * 0.15, 2);
  });
});

describe('itemized deductions', () => {
  it('only credits itemizing beyond the standard deduction, and helps the buyer', () => {
    const base: EngineInputs = {
      ...ZERO,
      timeHorizonYears: 5,
      homePrice: 800_000,
      downPaymentPct: 20,
      mortgageRatePct: 7,
      propertyTaxPct: 1.5,
      marginalTaxRatePct: 35,
      standardDeduction: 16_100,
      saltCap: 40_000,
      monthlyRent: 3000,
    };
    const std = simulate({ ...base, itemizeDeductions: false });
    const itemized = simulate({ ...base, itemizeDeductions: true });
    expect(itemized.years[0].taxSavings).toBeGreaterThan(0);
    expect(itemized.difference).toBeGreaterThan(std.difference);
  });

  it('caps deductible interest at the acquisition-debt cap', () => {
    const base: EngineInputs = {
      ...ZERO,
      timeHorizonYears: 1,
      homePrice: 2_000_000,
      downPaymentPct: 25, // loan 1.5M — double the cap
      mortgageRatePct: 6,
      marginalTaxRatePct: 37,
      standardDeduction: 0,
      itemizeDeductions: true,
    };
    const capped = simulate(base);
    const uncapped = simulate({ ...base, mortgageInterestDeductionCap: 100_000_000 });
    // Cap ratio 750k/1.5M = 0.5 → roughly half the interest deduction.
    expect(capped.years[0].taxSavings).toBeLessThan(uncapped.years[0].taxSavings * 0.55);
    expect(capped.years[0].taxSavings).toBeGreaterThan(uncapped.years[0].taxSavings * 0.45);
  });
});

describe('security deposit', () => {
  it('reduces the renter seed and returns nominal at the end', () => {
    const withDeposit = simulate({ ...ZERO, securityDepositMonths: 2, investmentReturnPct: 12 });
    const without = simulate({ ...ZERO, securityDepositMonths: 0, investmentReturnPct: 12 });
    // Deposit (2000) missed 12% growth for a year but returns nominal:
    // renter loses growth on it → slightly worse than no-deposit world.
    const growthLost = 2000 * (1.01 ** 12 - 1);
    expect(without.rentNetWorth - withDeposit.rentNetWorth).toBeCloseTo(growthLost, 2);
  });
});

describe('tipping point rent', () => {
  it('is the rent where the verdict flips', () => {
    const inputs: EngineInputs = {
      ...ZERO,
      timeHorizonYears: 10,
      homePrice: 420_000,
      downPaymentPct: 20,
      mortgageRatePct: 6.5,
      propertyTaxPct: 1.1,
      homeInsuranceAnnual: 2000,
      maintenancePct: 1,
      closingCostPct: 3,
      sellingCostPct: 6,
      homeAppreciationPct: 3.5,
      rentIncreasePct: 3,
      investmentReturnPct: 8,
      monthlyRent: 2100,
      capitalGainsRatePct: 15,
    };
    const tip = tippingPointRent(inputs);
    expect(tip).not.toBeNull();
    // Just below the tipping rent → renting wins; just above → buying wins.
    expect(simulate({ ...inputs, monthlyRent: tip! - 25 }).difference).toBeLessThan(0);
    expect(simulate({ ...inputs, monthlyRent: tip! + 25 }).difference).toBeGreaterThan(0);
  });
});

describe('break-even', () => {
  it('finds the last permanent crossover, or null when renting always wins', () => {
    const rentWins = simulate({
      ...ZERO,
      timeHorizonYears: 30,
      investmentReturnPct: 15,
      homeAppreciationPct: 0,
      sellingCostPct: 6,
      homePrice: 500_000,
      downPaymentPct: 20,
      mortgageRatePct: 7,
      monthlyRent: 1200,
    });
    expect(rentWins.verdict).toBe('rent');
    expect(rentWins.breakEvenYear).toBeNull();
  });
});
