import { describe, expect, it } from 'vitest';
import { DEFAULT_INPUTS } from './defaults';
import { decodeParams, encodeParams, hasScenarioParams } from './urlParams';

describe('decodeParams — current links (v=2)', () => {
  it('returns defaults for an empty query string', () => {
    expect(decodeParams('')).toEqual(DEFAULT_INPUTS);
  });

  it('treats unknown-params-only URLs as no scenario at all', () => {
    expect(hasScenarioParams('utm_source=hn&utm_medium=social&ref=abc')).toBe(false);
    expect(decodeParams('utm_source=hn&ref=abc')).toEqual(DEFAULT_INPUTS);
  });

  it('round-trips non-default inputs and stamps v=2', () => {
    const inputs = {
      ...DEFAULT_INPUTS,
      homePrice: 850000,
      monthlyRent: 4100,
      investmentReturnPct: 9,
      filingStatus: 'married' as const,
      itemizeDeductions: true,
    };
    const encoded = encodeParams(inputs);
    expect(encoded).toContain('v=2');
    expect(encoded).toContain('ret=9');
    expect(decodeParams(encoded)).toEqual(inputs);
  });

  it('encodes nothing for default inputs', () => {
    expect(encodeParams(DEFAULT_INPUTS)).toBe('');
  });
});

describe('decodeParams — legacy links (no version param)', () => {
  it('decodes a legacy link against the OLD defaults for absent fields', () => {
    // Old site omitted params matching its defaults, so a price-only link
    // implied: 30-year horizon, $200 HOA, itemizing on, 8% + 1.5% dividend.
    const inputs = decodeParams('pp=600000');
    expect(inputs.homePrice).toBe(600000);
    expect(inputs.timeHorizonYears).toBe(30);
    expect(inputs.hoaMonthly).toBe(200);
    expect(inputs.homeInsuranceAnnual).toBe(1500);
    expect(inputs.itemizeDeductions).toBe(true);
    expect(inputs.investmentReturnPct).toBe(9.5);
    expect(inputs.expenseRatioPct).toBe(0.1);
    expect(inputs.securityDepositMonths).toBe(2);
  });

  it('folds explicit legacy sr+div into total return', () => {
    const inputs = decodeParams('pp=750000&dp=10&rent=3200&sr=7&div=2&md=true&fs=married&th=15');
    expect(inputs.investmentReturnPct).toBe(9); // 7 + 2
    expect(inputs.downPaymentPct).toBe(10);
    expect(inputs.filingStatus).toBe('married');
    expect(inputs.timeHorizonYears).toBe(15);
    expect(inputs.itemizeDeductions).toBe(true);
  });

  it('applies the legacy default dividend when only sr is present', () => {
    // Old encoder omitted div at its default 1.5 — sr=10 meant 11.5 total.
    expect(decodeParams('sr=10').investmentReturnPct).toBe(11.5);
  });

  it('maps the legacy deduction toggles onto the single itemize flag', () => {
    // Both explicitly off → not itemizing.
    expect(decodeParams('pp=500000&md=false&pd=false').itemizeDeductions).toBe(false);
    // One off, the other defaulted (on) → still itemizing.
    expect(decodeParams('pp=500000&pd=false').itemizeDeductions).toBe(true);
    expect(decodeParams('pp=500000&md=false').itemizeDeductions).toBe(true);
  });

  it('clamps hostile values instead of propagating them', () => {
    const inputs = decodeParams('pp=999999999999&mr=-5&th=1000&rent=0');
    expect(inputs.homePrice).toBe(100_000_000);
    expect(inputs.mortgageRatePct).toBe(0);
    expect(inputs.timeHorizonYears).toBe(50);
    expect(inputs.monthlyRent).toBe(1);
  });

  it('ignores malformed values, falling back to the legacy base', () => {
    const inputs = decodeParams('pp=abc&c=EURO&mr=');
    expect(inputs.homePrice).toBe(500000); // legacy default, since link is unversioned
    expect(inputs.currency).toBe('USD');
    expect(inputs.mortgageRatePct).toBe(6.5);
  });
});
