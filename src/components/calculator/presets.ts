import type { EngineInputs } from '../../lib/engine/types';
import { DEFAULT_INPUTS } from '../../lib/engine/defaults';

export interface Preset {
  id: string;
  label: string;
  /** Fields written into the visible form (never a separate mode). */
  values: Partial<EngineInputs>;
}

export const PRESETS: Preset[] = [
  {
    id: 'first-home',
    label: 'First home',
    values: {
      ...DEFAULT_INPUTS,
      homePrice: 420_000,
      downPaymentPct: 10,
      monthlyRent: 2100,
      timeHorizonYears: 10,
    },
  },
  {
    id: 'upgrading',
    label: 'Upgrading',
    values: {
      ...DEFAULT_INPUTS,
      homePrice: 700_000,
      downPaymentPct: 25,
      monthlyRent: 3500,
      timeHorizonYears: 15,
      filingStatus: 'married',
      itemizeDeductions: true,
    },
  },
  {
    id: 'downsizing',
    label: 'Downsizing',
    values: {
      ...DEFAULT_INPUTS,
      homePrice: 300_000,
      downPaymentPct: 50,
      monthlyRent: 1500,
      timeHorizonYears: 20,
    },
  },
];
