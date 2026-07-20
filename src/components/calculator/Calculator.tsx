import { Component, type ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { EngineInputs, SensitivityRow } from '../../lib/engine/types';
import { analyzeScenario, simulateCore } from '../../lib/engine/engine';
import { DEFAULT_INPUTS, SUPPORTED_CURRENCIES } from '../../lib/engine/defaults';
import {
  decodeParams,
  encodeParams,
  hasScenarioParams,
  OWNED_PARAMS,
} from '../../lib/engine/urlParams';
import { formatCurrency, formatNumber, formatPercent } from '../../lib/engine/format';
import { CompactNumber, Group, SliderField, Toggle } from './fields';
import { PRESETS } from './presets';
import { VerdictBanner } from './VerdictBanner';
import { NetWorthChart } from './NetWorthChart';
import { MonthlyCosts } from './MonthlyCosts';
import { Sensitivity } from './Sensitivity';
import { YearTable } from './YearTable';
import { ShareSheet } from './ShareSheet';

const STORAGE_KEY = 'bvr-scenario-v2';
/** Comparable rent heuristic while linked: 0.5% of the price per month. */
const linkedRent = (price: number) => Math.round((price * 0.005) / 25) * 25;

/** Renders a recoverable fallback instead of blanking the island on a crash. */
class CalcErrorBoundary extends Component<{ children: ComponentChildren }, { failed: boolean }> {
  state = { failed: false };
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    if (this.state.failed) {
      return (
        <div class="mx-auto max-w-xl rounded-xl border-2 border-hairline p-6 text-center">
          <p class="font-semibold text-ink">The calculator hit an unexpected error.</p>
          <p class="mt-1 text-sm text-ink-secondary">
            Your inputs are saved in the URL — reloading usually fixes it.
          </p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-buy px-4 py-2 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
          >
            Reload the calculator
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function initialState(): { inputs: EngineInputs; rentLinked: boolean } {
  if (typeof window !== 'undefined') {
    // Only treat the URL as a scenario when it carries params we understand —
    // ?utm_source=… alone must not mask the visitor's saved scenario.
    if (hasScenarioParams(window.location.search)) {
      return { inputs: decodeParams(window.location.search), rentLinked: false };
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // Sanitize stored JSON through the same codec used for URLs.
        const parsed = { ...DEFAULT_INPUTS, ...JSON.parse(saved) } as EngineInputs;
        return { inputs: decodeParams(encodeParams(parsed)), rentLinked: false };
      }
    } catch {
      // Corrupt storage — fall through to defaults.
    }
  }
  return { inputs: DEFAULT_INPUTS, rentLinked: true };
}

export default function Calculator() {
  const [{ inputs, rentLinked }, setState] = useState(initialState);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();

  const set = (patch: Partial<EngineInputs>, opts: { breakRentLink?: boolean } = {}) => {
    setState((prev) => {
      let next = { ...prev.inputs, ...patch };
      let linked = prev.rentLinked && !opts.breakRentLink;
      if (linked && patch.homePrice !== undefined) {
        next = { ...next, monthlyRent: linkedRent(patch.homePrice) };
      }
      return { inputs: next, rentLinked: linked };
    });
    setActivePreset(null);
  };

  // Debounced URL + localStorage sync: the URL is the share artifact. Params
  // we don't own (utm_*, ref, …) are preserved for analytics attribution.
  useEffect(() => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const merged = new URLSearchParams(encodeParams(inputs));
      for (const [key, value] of new URLSearchParams(window.location.search)) {
        if (!OWNED_PARAMS.has(key)) merged.set(key, value);
      }
      const qs = merged.toString();
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
      } catch {
        // Storage full/blocked — sharing via URL still works.
      }
    }, 300);
    return () => clearTimeout(syncTimer.current);
  }, [inputs]);

  // The core simulation is ~1ms and runs on every input; the sensitivity and
  // tipping-point extras are ~50 more simulations, so they trail by 150ms and
  // never block slider feedback.
  const results = useMemo(() => simulateCore(inputs), [inputs]);
  const [analysis, setAnalysis] = useState<{
    sensitivity: SensitivityRow[];
    tippingRent: number | null;
  } | null>(null);
  // Keep the previous analysis on screen while the next one computes; a separate
  // pending flag lets the UI dim the stale values in place rather than nulling
  // them, which would unmount rows and shift the layout on every slider move.
  const [analysisPending, setAnalysisPending] = useState(true);
  useEffect(() => {
    setAnalysisPending(true);
    const timer = setTimeout(() => {
      setAnalysis(analyzeScenario(inputs));
      setAnalysisPending(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [inputs]);

  const shareUrl = `https://rentvsbuymath.com/${(() => {
    const p = encodeParams(inputs);
    return p ? `?${p}` : '';
  })()}`;

  const downPaymentDollars = (inputs.homePrice * inputs.downPaymentPct) / 100;
  const fmt$ = (v: number) => formatCurrency(v, inputs.currency);

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const next = { ...DEFAULT_INPUTS, ...preset.values } as EngineInputs;
    setState({
      inputs: next,
      rentLinked: next.monthlyRent === linkedRent(next.homePrice),
    });
    setActivePreset(id);
  };

  return (
    <CalcErrorBoundary>
    <div class="mx-auto max-w-5xl px-4">
      <VerdictBanner
        results={results}
        tippingRent={analysis?.tippingRent ?? null}
        analysisReady={analysis !== null}
        analysisPending={analysisPending}
        currency={inputs.currency}
        horizon={inputs.timeHorizonYears}
      />

      <div class="mt-6 grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-10">
        {/* Inputs column */}
        <div class="min-w-0">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="flex flex-wrap gap-2" role="group" aria-label="Example scenarios">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  class={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    activePreset === p.id
                      ? 'border-buy bg-buy-soft text-buy'
                      : 'border-hairline text-ink-secondary hover:border-ink-muted'
                  }`}
                  aria-pressed={activePreset === p.id}
                  onClick={() => applyPreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label class="flex items-center gap-1 text-xs text-ink-muted">
              <span class="sr-only">Currency</span>
              <select
                class="rounded border border-hairline bg-white px-1.5 py-1 text-xs"
                value={inputs.currency}
                onChange={(e) => set({ currency: (e.target as HTMLSelectElement).value })}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <SliderField
            id="homePrice"
            label="Home price"
            value={inputs.homePrice}
            min={50_000}
            max={2_000_000}
            step={5_000}
            format={formatNumber}
            prefix={currencySymbol(inputs.currency)}
            onInput={(v) => set({ homePrice: v })}
          />
          <SliderField
            id="monthlyRent"
            label="Rent for a similar home"
            value={inputs.monthlyRent}
            min={200}
            max={10_000}
            step={25}
            format={formatNumber}
            prefix={currencySymbol(inputs.currency)}
            suffix="/mo"
            onInput={(v) => set({ monthlyRent: v }, { breakRentLink: true })}
            detail={
              rentLinked ? (
                <span>
                  Linked to price (0.5%/mo) — edit to set your real local rent.
                </span>
              ) : (
                <button
                  type="button"
                  class="underline underline-offset-2 hover:text-ink-secondary"
                  onClick={() =>
                    setState((prev) => ({
                      inputs: { ...prev.inputs, monthlyRent: linkedRent(prev.inputs.homePrice) },
                      rentLinked: true,
                    }))
                  }
                >
                  Re-link rent to price (0.5%/mo)
                </button>
              )
            }
          />
          <SliderField
            id="downPayment"
            label="Down payment"
            value={inputs.downPaymentPct}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onInput={(v) => set({ downPaymentPct: v })}
            detail={
              <span>
                {fmt$(downPaymentDollars)} upfront
                {inputs.downPaymentPct < 20 && ' · under 20% adds mortgage insurance (PMI)'}
                {inputs.downPaymentPct === 100 && ' · all-cash purchase, no mortgage'}
              </span>
            }
          />
          <SliderField
            id="mortgageRate"
            label="Mortgage rate"
            value={inputs.mortgageRatePct}
            min={0}
            max={12}
            step={0.125}
            suffix="%"
            format={(v) => v.toFixed(3).replace(/\.?0+$/, '')}
            onInput={(v) => set({ mortgageRatePct: v })}
          />
          <SliderField
            id="timeHorizon"
            label="How long you'll stay"
            value={inputs.timeHorizonYears}
            min={1}
            max={40}
            step={1}
            suffix=" years"
            onInput={(v) => set({ timeHorizonYears: v })}
            detail={<span>The single most decisive input — selling early is expensive.</span>}
          />

          <div class="mt-4">
            <Group
              title="Buying costs"
              summary={`${formatPercent(inputs.propertyTaxPct)} tax · ${fmt$(inputs.homeInsuranceAnnual)} ins · ${fmt$(inputs.hoaMonthly)} HOA`}
              onReset={() =>
                set({
                  propertyTaxPct: DEFAULT_INPUTS.propertyTaxPct,
                  propertyTaxIncreasePct: DEFAULT_INPUTS.propertyTaxIncreasePct,
                  homeInsuranceAnnual: DEFAULT_INPUTS.homeInsuranceAnnual,
                  hoaMonthly: DEFAULT_INPUTS.hoaMonthly,
                  maintenancePct: DEFAULT_INPUTS.maintenancePct,
                  pmiAnnualPct: DEFAULT_INPUTS.pmiAnnualPct,
                  closingCostPct: DEFAULT_INPUTS.closingCostPct,
                  sellingCostPct: DEFAULT_INPUTS.sellingCostPct,
                  mortgageTermYears: DEFAULT_INPUTS.mortgageTermYears,
                })
              }
            >
              <CompactNumber id="mortgageTerm" label="Mortgage term" value={inputs.mortgageTermYears} min={1} max={50} suffix="yrs" onInput={(v) => set({ mortgageTermYears: v })} />
              <CompactNumber id="propertyTax" label="Property tax" value={inputs.propertyTaxPct} min={0} max={10} step={0.05} suffix="%/yr" onInput={(v) => set({ propertyTaxPct: v })} />
              <CompactNumber id="propertyTaxIncrease" label="Property tax growth" value={inputs.propertyTaxIncreasePct} min={0} max={20} step={0.5} suffix="%/yr" onInput={(v) => set({ propertyTaxIncreasePct: v })} />
              <CompactNumber id="insurance" label="Home insurance" value={inputs.homeInsuranceAnnual} min={0} max={100_000} step={100} prefix={currencySymbol(inputs.currency)} suffix="/yr" onInput={(v) => set({ homeInsuranceAnnual: v })} />
              <CompactNumber id="hoa" label="HOA fees" value={inputs.hoaMonthly} min={0} max={10_000} step={25} prefix={currencySymbol(inputs.currency)} suffix="/mo" onInput={(v) => set({ hoaMonthly: v })} />
              <CompactNumber id="maintenance" label="Maintenance" value={inputs.maintenancePct} min={0} max={10} step={0.25} suffix="% of value/yr" hint="Rule of thumb: 1% of the home's value per year" onInput={(v) => set({ maintenancePct: v })} />
              <CompactNumber id="pmi" label="Mortgage insurance (PMI)" value={inputs.pmiAnnualPct} min={0} max={3} step={0.1} suffix="%/yr" hint="Required under 20% down; cancels automatically at 20% equity" onInput={(v) => set({ pmiAnnualPct: v })} />
              <CompactNumber id="closing" label="Closing costs (buying)" value={inputs.closingCostPct} min={0} max={10} step={0.5} suffix="% of price" onInput={(v) => set({ closingCostPct: v })} />
              <CompactNumber id="selling" label="Selling costs (later)" value={inputs.sellingCostPct} min={0} max={15} step={0.5} suffix="% of value" hint="Agent commissions plus transfer costs when you eventually sell" onInput={(v) => set({ sellingCostPct: v })} />
            </Group>

            <Group
              title="What the future holds"
              summary={`home +${formatPercent(inputs.homeAppreciationPct)} · rent +${formatPercent(inputs.rentIncreasePct)} · stocks +${formatPercent(inputs.investmentReturnPct)}`}
              onReset={() =>
                set({
                  homeAppreciationPct: DEFAULT_INPUTS.homeAppreciationPct,
                  rentIncreasePct: DEFAULT_INPUTS.rentIncreasePct,
                  investmentReturnPct: DEFAULT_INPUTS.investmentReturnPct,
                  expenseRatioPct: DEFAULT_INPUTS.expenseRatioPct,
                  inflationPct: DEFAULT_INPUTS.inflationPct,
                })
              }
            >
              <CompactNumber id="appreciation" label="Home appreciation" value={inputs.homeAppreciationPct} min={-10} max={20} step={0.25} suffix="%/yr" hint="US long-run average ≈ 4% nominal; varies hugely by metro" onInput={(v) => set({ homeAppreciationPct: v })} />
              <CompactNumber id="rentIncrease" label="Rent increases" value={inputs.rentIncreasePct} min={0} max={20} step={0.25} suffix="%/yr" onInput={(v) => set({ rentIncreasePct: v })} />
              <CompactNumber id="return" label="Investment return (total)" value={inputs.investmentReturnPct} min={-20} max={50} step={0.25} suffix="%/yr" hint="Total nominal return including dividends; S&P 500 long-run ≈ 10% before inflation" onInput={(v) => set({ investmentReturnPct: v })} />
              <CompactNumber id="expense" label="Fund fees (expense ratio)" value={inputs.expenseRatioPct} min={0} max={5} step={0.01} suffix="%/yr" hint="0.03–0.1% is typical for index funds" onInput={(v) => set({ expenseRatioPct: v })} />
              <CompactNumber id="inflation" label="General inflation" value={inputs.inflationPct} min={0} max={15} step={0.25} suffix="%/yr" hint="Drives insurance, HOA and similar costs upward" onInput={(v) => set({ inflationPct: v })} />
            </Group>

            <Group
              title="Renting details"
              summary={`${fmt$(inputs.rentersInsuranceMonthly)}/mo ins · ${inputs.securityDepositMonths} mo deposit`}
              onReset={() =>
                set({
                  rentersInsuranceMonthly: DEFAULT_INPUTS.rentersInsuranceMonthly,
                  securityDepositMonths: DEFAULT_INPUTS.securityDepositMonths,
                })
              }
            >
              <CompactNumber id="rentersIns" label="Renter's insurance" value={inputs.rentersInsuranceMonthly} min={0} max={1000} step={5} prefix={currencySymbol(inputs.currency)} suffix="/mo" onInput={(v) => set({ rentersInsuranceMonthly: v })} />
              <CompactNumber id="deposit" label="Security deposit" value={inputs.securityDepositMonths} min={0} max={12} step={1} suffix="months" hint="Locked up while renting, returned when you leave" onInput={(v) => set({ securityDepositMonths: v })} />
            </Group>

            <Group
              title="Taxes (US model)"
              summary={`${formatPercent(inputs.marginalTaxRatePct, 0)} bracket · ${inputs.itemizeDeductions ? 'itemizing' : 'standard deduction'}`}
              onReset={() =>
                set({
                  marginalTaxRatePct: DEFAULT_INPUTS.marginalTaxRatePct,
                  capitalGainsRatePct: DEFAULT_INPUTS.capitalGainsRatePct,
                  standardDeduction: DEFAULT_INPUTS.standardDeduction,
                  saltCap: DEFAULT_INPUTS.saltCap,
                  mortgageInterestDeductionCap: DEFAULT_INPUTS.mortgageInterestDeductionCap,
                  itemizeDeductions: DEFAULT_INPUTS.itemizeDeductions,
                  filingStatus: DEFAULT_INPUTS.filingStatus,
                })
              }
            >
              <div class="flex items-center justify-between gap-3 py-1.5">
                <label htmlFor="filing" class="text-sm text-ink-secondary">
                  Filing status
                </label>
                <select
                  id="filing"
                  class="rounded border border-hairline bg-white px-2 py-1 text-sm"
                  value={inputs.filingStatus}
                  onChange={(e) =>
                    set({ filingStatus: (e.target as HTMLSelectElement).value as 'single' | 'married' })
                  }
                >
                  <option value="single">Single</option>
                  <option value="married">Married filing jointly</option>
                </select>
              </div>
              <Toggle id="itemize" label="Itemize mortgage interest & property tax" checked={inputs.itemizeDeductions} hint="Off = you take the standard deduction (most people since 2018)" onChange={(v) => set({ itemizeDeductions: v })} />
              <CompactNumber id="bracket" label="Marginal income tax rate" value={inputs.marginalTaxRatePct} min={0} max={60} suffix="%" onInput={(v) => set({ marginalTaxRatePct: v })} />
              <CompactNumber id="capGains" label="Capital gains rate" value={inputs.capitalGainsRatePct} min={0} max={60} suffix="%" hint="Long-term rate on investment gains and home-sale gains beyond the exclusion" onInput={(v) => set({ capitalGainsRatePct: v })} />
              <CompactNumber id="stdDeduction" label="Standard deduction" value={inputs.standardDeduction} min={0} max={200_000} step={100} prefix={currencySymbol(inputs.currency)} onInput={(v) => set({ standardDeduction: v })} />
              <CompactNumber id="salt" label="SALT deduction cap" value={inputs.saltCap} min={0} max={200_000} step={1000} prefix={currencySymbol(inputs.currency)} hint="$40,000 under 2025 law (phases down above $500k income)" onInput={(v) => set({ saltCap: v })} />
              <p class="mt-1 text-xs text-ink-muted">
                Outside the US? Set the tax fields to 0 and the model works as a pre-tax
                comparison in any currency.
              </p>
            </Group>
          </div>
        </div>

        {/* Results column */}
        <div class="min-w-0 space-y-8">
          <NetWorthChart results={results} currency={inputs.currency} />
          <MonthlyCosts results={results} currency={inputs.currency} />
          <Sensitivity
            sensitivity={analysis?.sensitivity ?? null}
            difference={results.difference}
            currency={inputs.currency}
            analysisPending={analysisPending}
          />
          <YearTable results={results} currency={inputs.currency} />
          <ShareSheet
            results={results}
            currency={inputs.currency}
            horizon={inputs.timeHorizonYears}
            shareUrl={shareUrl}
          />
        </div>
      </div>
    </div>
    </CalcErrorBoundary>
  );
}

function currencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
  };
  return symbols[currency] ?? '$';
}
