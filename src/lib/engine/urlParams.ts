import type { EngineInputs } from './types';
import { DEFAULT_INPUTS } from './defaults';

/**
 * Short URL param names. These are a compatibility contract: links shared from
 * the previous version of the site use the same names and must keep decoding.
 */
const PARAM_TO_FIELD = {
  c: 'currency',
  th: 'timeHorizonYears',
  pp: 'homePrice',
  dp: 'downPaymentPct',
  mr: 'mortgageRatePct',
  mt: 'mortgageTermYears',
  pt: 'propertyTaxPct',
  ins: 'homeInsuranceAnnual',
  hoa: 'hoaMonthly',
  mnt: 'maintenancePct',
  cc: 'closingCostPct',
  sc: 'sellingCostPct',
  apr: 'homeAppreciationPct',
  pti: 'propertyTaxIncreasePct',
  pmi: 'pmiAnnualPct',
  inf: 'inflationPct',
  sr: 'investmentReturnPct',
  exp: 'expenseRatioPct',
  rent: 'monthlyRent',
  ri: 'rentIncreasePct',
  rins: 'rentersInsuranceMonthly',
  sd: 'securityDepositMonths',
  it: 'marginalTaxRatePct',
  cg: 'capitalGainsRatePct',
  std: 'standardDeduction',
  salt: 'saltCap',
  micap: 'mortgageInterestDeductionCap',
} as const satisfies Record<string, keyof EngineInputs>;

type NumericField = (typeof PARAM_TO_FIELD)[keyof typeof PARAM_TO_FIELD];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Sanity bounds so hostile URLs can't produce NaN/Infinity UI. */
const BOUNDS: Partial<Record<NumericField, [number, number]>> = {
  timeHorizonYears: [1, 50],
  homePrice: [1000, 100_000_000],
  downPaymentPct: [0, 100],
  mortgageRatePct: [0, 50],
  mortgageTermYears: [1, 50],
  propertyTaxPct: [0, 10],
  homeInsuranceAnnual: [0, 100_000],
  hoaMonthly: [0, 10_000],
  maintenancePct: [0, 10],
  closingCostPct: [0, 10],
  sellingCostPct: [0, 15],
  homeAppreciationPct: [-10, 20],
  propertyTaxIncreasePct: [0, 20],
  pmiAnnualPct: [0, 3],
  inflationPct: [0, 15],
  investmentReturnPct: [-20, 50],
  expenseRatioPct: [0, 5],
  monthlyRent: [1, 100_000],
  rentIncreasePct: [0, 20],
  rentersInsuranceMonthly: [0, 1000],
  securityDepositMonths: [0, 12],
  marginalTaxRatePct: [0, 60],
  capitalGainsRatePct: [0, 60],
  standardDeduction: [0, 200_000],
  saltCap: [0, 200_000],
  mortgageInterestDeductionCap: [0, 100_000_000],
};

export function decodeParams(search: string | URLSearchParams): EngineInputs {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const inputs: EngineInputs = { ...DEFAULT_INPUTS };

  for (const [short, field] of Object.entries(PARAM_TO_FIELD)) {
    const raw = params.get(short);
    if (raw === null) continue;
    if (field === 'currency') {
      if (/^[A-Z]{3}$/.test(raw)) inputs.currency = raw;
      continue;
    }
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) continue;
    const bounds = BOUNDS[field as NumericField];
    (inputs[field] as number) = bounds ? clamp(n, bounds[0], bounds[1]) : n;
  }

  // Legacy params from the previous site version:
  // `div` (dividend yield) was compounded on top of the expected return, so old
  // links encode total return as sr + div. `md`/`pd` were separate itemization flags.
  const legacyDividend = Number.parseFloat(params.get('div') ?? '');
  if (Number.isFinite(legacyDividend)) {
    inputs.investmentReturnPct = clamp(inputs.investmentReturnPct + legacyDividend, -20, 50);
  }
  const md = params.get('md');
  const pd = params.get('pd');
  if (md !== null || pd !== null) {
    inputs.itemizeDeductions = md?.toLowerCase() === 'true' || pd?.toLowerCase() === 'true';
  }
  const fs = params.get('fs');
  if (fs === 'married' || fs === 'single') inputs.filingStatus = fs;

  return inputs;
}

/** Encode only fields that differ from defaults, for short shareable URLs. */
export function encodeParams(inputs: EngineInputs): string {
  const params = new URLSearchParams();
  for (const [short, field] of Object.entries(PARAM_TO_FIELD)) {
    const value = inputs[field];
    if (value !== DEFAULT_INPUTS[field]) params.set(short, String(value));
  }
  if (inputs.itemizeDeductions !== DEFAULT_INPUTS.itemizeDeductions) {
    params.set('md', String(inputs.itemizeDeductions));
  }
  if (inputs.filingStatus !== DEFAULT_INPUTS.filingStatus) {
    params.set('fs', inputs.filingStatus);
  }
  return params.toString();
}
