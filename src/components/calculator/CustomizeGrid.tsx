import { useEffect, useRef } from 'preact/hooks';
import { unitFor } from './inputs';
import { DEFAULT_INPUTS } from '../../lib/engine/defaults';
import type { EngineInputs } from '../../lib/engine/types';

type NumKey = {
  [K in keyof EngineInputs]: EngineInputs[K] extends number ? K : never;
}[keyof EngineInputs];

interface NumSpec {
  key: NumKey;
  label: string;
  suffix: string;
  min: number;
  max: number;
}
interface CheckSpec {
  key: 'itemizeDeductions';
  label: string;
  suffix: 'check';
}
type FieldSpec = NumSpec | CheckSpec;

/** `suffix` is a plain string on NumSpec, so the union needs an explicit
 *  predicate to narrow - a bare `f.suffix === 'check'` check does not. */
const isCheck = (f: FieldSpec): f is CheckSpec => f.suffix === 'check';

/** Every assumption behind the answer. Nothing here is hidden. */
export const GROUPS: { title: string; fields: FieldSpec[] }[] = [
  {
    title: 'The purchase',
    fields: [
      { key: 'downPaymentPct', label: 'Down payment', suffix: '%', min: 0, max: 100 },
      { key: 'closingCostPct', label: 'Closing costs', suffix: '%', min: 0, max: 15 },
      { key: 'sellingCostPct', label: 'Selling costs', suffix: '%', min: 0, max: 20 },
      { key: 'mortgageTermYears', label: 'Mortgage term', suffix: 'years', min: 5, max: 40 },
    ],
  },
  {
    title: 'Cost of owning',
    fields: [
      { key: 'propertyTaxPct', label: 'Property tax', suffix: '% /yr', min: 0, max: 10 },
      {
        key: 'propertyTaxIncreasePct',
        label: 'Property tax growth',
        suffix: '% /yr',
        min: 0,
        max: 20,
      },
      { key: 'homeInsuranceAnnual', label: 'Home insurance', suffix: '$ /yr', min: 0, max: 100000 },
      { key: 'hoaMonthly', label: 'HOA', suffix: '$ /mo', min: 0, max: 10000 },
      { key: 'maintenancePct', label: 'Maintenance', suffix: '% /yr', min: 0, max: 10 },
      { key: 'pmiAnnualPct', label: 'Mortgage insurance', suffix: '% /yr', min: 0, max: 5 },
    ],
  },
  {
    title: 'Cost of renting',
    fields: [
      { key: 'rentIncreasePct', label: 'Rent growth', suffix: '% /yr', min: 0, max: 20 },
      {
        key: 'rentersInsuranceMonthly',
        label: "Renter's insurance",
        suffix: '$ /mo',
        min: 0,
        max: 1000,
      },
      { key: 'securityDepositMonths', label: 'Security deposit', suffix: 'months', min: 0, max: 12 },
    ],
  },
  {
    title: 'Markets and tax',
    fields: [
      { key: 'homeAppreciationPct', label: 'Home appreciation', suffix: '% /yr', min: -10, max: 20 },
      { key: 'investmentReturnPct', label: 'Investment return', suffix: '% /yr', min: -10, max: 20 },
      { key: 'expenseRatioPct', label: 'Fund expense ratio', suffix: '% /yr', min: 0, max: 3 },
      { key: 'inflationPct', label: 'Inflation', suffix: '% /yr', min: 0, max: 20 },
      { key: 'marginalTaxRatePct', label: 'Marginal tax rate', suffix: '%', min: 0, max: 60 },
      { key: 'capitalGainsRatePct', label: 'Capital gains rate', suffix: '%', min: 0, max: 60 },
      { key: 'itemizeDeductions', label: 'Itemise deductions', suffix: 'check' },
    ],
  },
];

interface Props {
  inputs: EngineInputs;
  onChange: (patch: Partial<EngineInputs>) => void;
}

/** One numeric assumption. Clamps on input, reconciles the field on blur. */
function AssumptionField({
  spec,
  value,
  onChange,
}: {
  spec: NumSpec;
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const id = `c_${spec.key}`;

  // Keep the field in step with external changes (a group reset, a shared
  // link) without fighting the user mid-edit.
  useEffect(() => {
    const el = ref.current;
    if (!el || el === document.activeElement) return;
    el.value = String(value);
  }, [value]);

  return (
    <div class="cf">
      <label for={id}>{spec.label}</label>
      <span class="box">
        <input
          ref={ref}
          id={id}
          inputMode="decimal"
          onInput={() => {
            const raw = parseFloat((ref.current?.value ?? '').replace(/[^0-9.-]/g, ''));
            if (!isNaN(raw)) onChange(Math.min(spec.max, Math.max(spec.min, raw)));
          }}
          onBlur={() => {
            // Show what the engine actually used, so a clamped 999 does not sit
            // in the field pretending to be the input.
            if (ref.current) ref.current.value = String(value);
          }}
        />
        <span class="sfx">{unitFor(spec.suffix, value)}</span>
      </span>
    </div>
  );
}

export function CustomizeGrid({ inputs, onChange }: Props) {
  return (
    <div class="cgrid">
      {GROUPS.map((group) => (
        <div class="cg" key={group.title}>
          <div class="ch">
            <h3>{group.title}</h3>
            <button
              class="rst"
              type="button"
              onClick={() => {
                const patch: Partial<EngineInputs> = {};
                for (const f of group.fields) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (patch as any)[f.key] = DEFAULT_INPUTS[f.key];
                }
                onChange(patch);
              }}
            >
              Reset group
            </button>
          </div>

          {group.fields.map((f) =>
            isCheck(f) ? (
              <div class="cf check" key={f.key}>
                <input
                  type="checkbox"
                  id={`c_${f.key}`}
                  checked={inputs.itemizeDeductions}
                  onChange={(e) =>
                    onChange({ itemizeDeductions: (e.currentTarget as HTMLInputElement).checked })
                  }
                />
                <label for={`c_${f.key}`}>{f.label}</label>
              </div>
            ) : (
              <AssumptionField
                key={f.key}
                spec={f}
                value={inputs[f.key] as number}
                onChange={(v) => onChange({ [f.key]: v } as Partial<EngineInputs>)}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}
