import type { EngineInputs } from './types';
import { DEFAULT_INPUTS } from './defaults';

/**
 * Short URL param names. These are a compatibility contract: links shared from
 * the previous site version use the same names and must keep decoding — see
 * the legacy notes at the bottom of this file.
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
  ret: 'investmentReturnPct',
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

/** Every param this site (or the previous version) has ever used. */
export const OWNED_PARAMS: ReadonlySet<string> = new Set([
  ...Object.keys(PARAM_TO_FIELD),
  'v',
  'md',
  'pd',
  'fs',
  'sr',
  'div',
  'cs',
]);

/**
 * The previous site omitted params equal to ITS defaults, so an unversioned
 * link's absent fields mean these values — not today's defaults. Notably the
 * old default horizon was 30 years, price $500k, itemizing ON, and investment
 * return 8% + 1.5% dividend compounded on top (total ≈ 9.5%).
 */
const LEGACY_DEFAULTS: EngineInputs = {
  ...DEFAULT_INPUTS,
  timeHorizonYears: 30,
  homePrice: 500_000,
  monthlyRent: 2500,
  propertyTaxPct: 1.2,
  homeInsuranceAnnual: 1500,
  hoaMonthly: 200,
  closingCostPct: 2.5,
  homeAppreciationPct: 3.5,
  pmiAnnualPct: 0.8,
  inflationPct: 3,
  rentIncreasePct: 3,
  rentersInsuranceMonthly: 20,
  securityDepositMonths: 2,
  investmentReturnPct: 9.5, // old 8% "return" + 1.5% dividend, compounded together
  expenseRatioPct: 0.1,
  standardDeduction: 27_700,
  saltCap: 10_000,
  itemizeDeductions: true, // old defaults: both deduction toggles on
};

const LEGACY_DIVIDEND_DEFAULT = 1.5;
const LEGACY_RETURN_DEFAULT = 8;

type NumericField = Exclude<(typeof PARAM_TO_FIELD)[keyof typeof PARAM_TO_FIELD], 'currency'>;

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

/** True when the query string carries any scenario data we understand. */
export function hasScenarioParams(search: string | URLSearchParams): boolean {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  for (const key of params.keys()) {
    if (OWNED_PARAMS.has(key)) return true;
  }
  return false;
}

export function decodeParams(search: string | URLSearchParams): EngineInputs {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const isCurrent = params.get('v') === '2';
  const isLegacy = !isCurrent && hasScenarioParams(params);
  const inputs: EngineInputs = { ...(isLegacy ? LEGACY_DEFAULTS : DEFAULT_INPUTS) };

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
    let value = bounds ? clamp(n, bounds[0], bounds[1]) : n;
    // Whole years only — the engine's annual tax math assumes integer horizons.
    if (field === 'timeHorizonYears' || field === 'mortgageTermYears') {
      value = Math.round(value);
    }
    (inputs[field] as number) = value;
  }

  if (isLegacy) {
    // The old engine compounded `sr` (price return) and `div` (dividend yield)
    // together; either could be omitted at its old default.
    const sr = Number.parseFloat(params.get('sr') ?? '');
    const div = Number.parseFloat(params.get('div') ?? '');
    if (Number.isFinite(sr) || Number.isFinite(div)) {
      const total =
        (Number.isFinite(sr) ? sr : LEGACY_RETURN_DEFAULT) +
        (Number.isFinite(div) ? div : LEGACY_DIVIDEND_DEFAULT);
      inputs.investmentReturnPct = clamp(total, -20, 50);
    }
    // Old model had two toggles, both defaulting to true and omitted at their
    // defaults. Itemize when either is (or defaults to) on.
    const md = params.get('md');
    const pd = params.get('pd');
    if (md !== null || pd !== null) {
      const mdOn = md === null ? true : md.toLowerCase() === 'true';
      const pdOn = pd === null ? true : pd.toLowerCase() === 'true';
      inputs.itemizeDeductions = mdOn || pdOn;
    }
  } else {
    const md = params.get('md');
    if (md !== null) inputs.itemizeDeductions = md.toLowerCase() === 'true';
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
  // Version-stamp any non-empty scenario so future decoders know the defaults
  // these params were diffed against.
  if ([...params.keys()].length > 0) params.set('v', '2');
  return params.toString();
}
