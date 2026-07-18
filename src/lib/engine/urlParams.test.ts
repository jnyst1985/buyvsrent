import { describe, expect, it } from 'vitest';
import { DEFAULT_INPUTS } from './defaults';
import { decodeParams, encodeParams } from './urlParams';

describe('decodeParams', () => {
  it('returns defaults for an empty query string', () => {
    expect(decodeParams('')).toEqual(DEFAULT_INPUTS);
  });

  it('decodes legacy share-link params (previous site version)', () => {
    // A realistic legacy link: custom price, down payment, rent, dividend yield, itemization.
    const inputs = decodeParams('pp=750000&dp=10&rent=3200&sr=7&div=2&md=true&fs=married&th=15');
    expect(inputs.homePrice).toBe(750000);
    expect(inputs.downPaymentPct).toBe(10);
    expect(inputs.monthlyRent).toBe(3200);
    // Legacy dividend yield folds into total return: 7 + 2
    expect(inputs.investmentReturnPct).toBe(9);
    expect(inputs.itemizeDeductions).toBe(true);
    expect(inputs.filingStatus).toBe('married');
    expect(inputs.timeHorizonYears).toBe(15);
  });

  it('clamps hostile values instead of propagating them', () => {
    const inputs = decodeParams('pp=999999999999&mr=-5&th=1000&rent=0');
    expect(inputs.homePrice).toBe(100_000_000);
    expect(inputs.mortgageRatePct).toBe(0);
    expect(inputs.timeHorizonYears).toBe(50);
    expect(inputs.monthlyRent).toBe(1);
  });

  it('ignores malformed values', () => {
    const inputs = decodeParams('pp=abc&c=EURO&mr=');
    expect(inputs.homePrice).toBe(DEFAULT_INPUTS.homePrice);
    expect(inputs.currency).toBe('USD');
    expect(inputs.mortgageRatePct).toBe(DEFAULT_INPUTS.mortgageRatePct);
  });
});

describe('encodeParams', () => {
  it('encodes nothing for default inputs', () => {
    expect(encodeParams(DEFAULT_INPUTS)).toBe('');
  });

  it('round-trips non-default inputs', () => {
    const inputs = {
      ...DEFAULT_INPUTS,
      homePrice: 850000,
      monthlyRent: 4100,
      filingStatus: 'married' as const,
      itemizeDeductions: true,
    };
    const decoded = decodeParams(encodeParams(inputs));
    expect(decoded).toEqual(inputs);
  });
});
