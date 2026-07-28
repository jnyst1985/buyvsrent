import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { DEFAULT_INPUTS } from '../../lib/engine/defaults';
import { analyzeScenario, simulateCore } from '../../lib/engine/engine';
import { decomposeMonthly } from '../../lib/engine/decompose';
import { rateLadder, type RateRow } from '../../lib/engine/ladder';
import { decodeParams, encodeParams, hasScenarioParams } from '../../lib/engine/urlParams';
import { formatCurrency } from '../../lib/engine/format';
import type { EngineInputs, SensitivityRow } from '../../lib/engine/types';

import { ConverterCard } from './ConverterCard';
import { AnswerBand } from './AnswerBand';
import { Trio } from './Trio';
import { MoneyBars } from './MoneyBars';
import { RaceChart } from './RaceChart';
import { FlipLevers } from './FlipLevers';
import { RatesTable } from './RatesTable';
import { CustomizeGrid } from './CustomizeGrid';
import { KeepResult } from './KeepResult';
import { AuditTable } from './AuditTable';

/** Everything the expensive pass produces. */
interface Analysis {
  tippingRent: number | null;
  sensitivity: SensitivityRow[];
  ladder: RateRow[];
}

const analyse = (inputs: EngineInputs): Analysis => {
  const { tippingRent, sensitivity } = analyzeScenario(inputs);
  return { tippingRent, sensitivity, ladder: rateLadder(inputs) };
};

const round1k = (v: number) => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');
const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function HomePage() {
  const [inputs, setInputs] = useState<EngineInputs>(DEFAULT_INPUTS);

  // The cheap pass. Synchronous on every keystroke.
  const results = simulateCore(inputs);

  // The expensive pass: tipping-rent solver, sensitivity sweep and a nine-rung
  // rate ladder. Computed eagerly for the first paint so the page never ships a
  // "Computing..." flash, then debounced.
  const [analysis, setAnalysis] = useState<Analysis>(() => analyse(DEFAULT_INPUTS));
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return; // already analysed at init
    }
    setPending(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setAnalysis(analyse(inputs));
      setPending(false);
    }, 160);
    return () => clearTimeout(timer.current);
  }, [inputs]);

  // Hydrate from a shared link. Runs after first paint, so the server-rendered
  // default scenario is what crawlers see and a shared link resolves a beat later.
  useEffect(() => {
    if (hasScenarioParams(window.location.search)) {
      const fromUrl = decodeParams(window.location.search);
      setInputs(fromUrl);
      setAnalysis(analyse(fromUrl));
    }
  }, []);

  // Push state back to the URL so the address bar is always shareable.
  useEffect(() => {
    if (first.current) return;
    const id = setTimeout(() => {
      const qs = encodeParams(inputs);
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, '', url);
    }, 400);
    return () => clearTimeout(id);
  }, [inputs]);

  const onChange = useCallback(
    (patch: Partial<EngineInputs>) => setInputs((prev) => ({ ...prev, ...patch })),
    []
  );

  const scrollToCustomize = useCallback(() => {
    document.getElementById('customize')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  const decomp = useMemo(
    () => decomposeMonthly(results, inputs.timeHorizonYears),
    [results, inputs.timeHorizonYears]
  );
  const investedMonthly =
    [...decomp.rent, ...decomp.own].find((s) => s.name.startsWith('Invested difference'))?.value ??
    0;

  const fmt = (v: number) => formatCurrency(v, inputs.currency);
  const tie = results.verdict === 'tie';
  const rentWins = results.difference < 0;
  const gap = Math.abs(results.difference);
  const { tippingRent, sensitivity, ladder } = analysis;

  return (
    <>
      {/* One polite status region for the whole page. It rides the debounced
          pass so dragging a slider does not spam a screen reader on every frame. */}
      <p class="sr-only" role="status" aria-live="polite">
        {pending
          ? ''
          : tie
            ? 'The two paths are level.'
            : `${rentWins ? 'Renting and investing' : 'Buying'} is ahead by ${round1k(gap)} after ${inputs.timeHorizonYears} years.`}
      </p>

      <section class="hero">
        <div class="wrap">
          <div class="split">
            <div>
              <h1>Should you buy, or rent and invest the difference?</h1>
              <p class="lede">
                Put your numbers in. Get the honest answer, with every formula public and nothing
                trying to sell you a mortgage.
              </p>
              <div class="chips">
                <span class="chip">Open source</span>
                <span class="chip">No sign-up</span>
                <span class="chip">Every formula documented</span>
              </div>
            </div>
            <ConverterCard
              inputs={inputs}
              results={results}
              investedMonthly={investedMonthly}
              onChange={onChange}
              onCustomize={scrollToCustomize}
            />
          </div>
        </div>
      </section>

      <AnswerBand results={results} stayYears={inputs.timeHorizonYears} />

      <section class="band band-white" id="why">
        <div class="wrap">
          <h2>{tie ? 'Where the two paths land' : `Where the ${round1k(gap)} comes from`}</h2>
          <p class="h2sub">
            Both paths at the end of the stay, and the one number that decides which is which.
          </p>
          <Trio
            results={results}
            tippingRent={tippingRent}
            homePrice={inputs.homePrice}
            currency={inputs.currency}
            pending={pending}
          />
        </div>
      </section>

      {/* Trust lands here, at #4, rather than straight after the hero: the
          claim means more once the reader has seen the answer it produced. */}
      <section class="band band-sage" id="honest">
        <div class="wrap">
          <h2>An honest calculator, not a sales tool</h2>
          <p class="h2sub">
            Most rent-versus-buy calculators are published by people who profit when you buy. This
            one has nothing to sell, and it takes the renter's side of the maths as seriously as the
            owner's.
          </p>
          <div class="hgrid">
            <div class="hc">
              <h3>Symmetric opportunity cost</h3>
              <p>
                Whichever path costs less in a given month, the difference is invested by the person
                on that path. Most calculators only let the buyer build wealth and quietly assume
                the renter spends the difference.
              </p>
            </div>
            <div class="hc">
              <h3>The full cost of owning</h3>
              <p>
                Interest, property tax, insurance, maintenance, HOA, mortgage insurance, closing
                costs and selling costs. Not just the mortgage payment.
              </p>
            </div>
            <div class="hc">
              <h3>Real tax rules</h3>
              <p>
                Standard deduction versus itemising, the $750,000 mortgage-interest cap, the SALT
                limit, capital gains, and the Section 121 home-sale exclusion.
              </p>
            </div>
            <div class="hc">
              <h3>Honest about uncertainty</h3>
              <p>
                Every answer comes with the levers that would flip it. If the result sits on a knife
                edge, the page says so rather than projecting false confidence.
              </p>
            </div>
          </div>
          <div class="hsig">
            <span class="sig">Open source</span>
            <span class="sig">Every formula documented</span>
            <span class="sig">No sign-up, no data collected</span>
          </div>
        </div>
      </section>

      {/* band-rule because this follows another SAGE band. Two same-coloured
          bands butted together have no seam, so their 128px of combined padding
          reads as one section with a hole in it - the same defect Jon caught on
          /guides. The colour cannot change here: `.mcard` inside is a
          borderless WHITE card, so a white band would make it invisible. When
          the colour has to stay, a hairline is the seam. */}
      <section class="band band-sage band-rule" id="money">
        <div class="wrap">
          <h2>Where the money actually goes</h2>
          <p class="h2sub">
            Every dollar each path spends in an average month of the stay. Solid acid is money that
            stays yours; grey is money that leaves for good.
          </p>
          <MoneyBars
            results={results}
            currency={inputs.currency}
            stayYears={inputs.timeHorizonYears}
          />
        </div>
      </section>

      <section class="band band-white band-rule" id="race">
        <div class="wrap">
          <h2>The year by year</h2>
          <p class="h2sub">
            Where each path stands at the end of every year of the stay. The line that is ahead at
            the end carries the colour; both are labelled, and rent is always listed first.
          </p>
          <RaceChart results={results} stayYears={inputs.timeHorizonYears} />
          <FlipLevers sensitivity={sensitivity} />
        </div>
      </section>

      {/* Inside a run of white bands every one after the first takes the
          hairline, or the sections merge into one long white stretch. `race`
          and `customize` already had it; this one was the gap. */}
      <section class="band band-white band-rule" id="rates">
        <div class="wrap">
          <h2>Rates decide the answer</h2>
          <p class="h2sub">
            The mortgage rate moves the tipping point more than anything else you can change. Below
            is the rent at which buying starts to win, at each rate, holding your other assumptions
            fixed. Your row is highlighted.
          </p>
          <div style={pending ? { opacity: 0.55 } : undefined}>
            <RatesTable
              rows={ladder}
              rate={inputs.mortgageRatePct}
              homePrice={inputs.homePrice}
              currency={inputs.currency}
            />
          </div>
        </div>
      </section>

      <section class="band band-white band-rule" id="customize">
        <div class="wrap">
          <h2>Change every assumption</h2>
          <p class="h2sub">
            These are the defaults doing the work behind the answer. Every one is editable, and the
            whole page recomputes as you type. Nothing here is a secret.
          </p>
          <CustomizeGrid inputs={inputs} onChange={onChange} />
        </div>
      </section>

      {/* Keep-your-result sits at #9, not #2. The earlier order assumed a
          shareable image; the copy-paste-to-AI block is only worth anything
          once the numbers have been customised. */}
      <section class="band band-sage" id="keep">
        <div class="wrap">
          <h2>Keep your result</h2>
          <p class="h2sub">
            Your scenario as plain text, with the numbers and the assumptions behind them. Paste it
            into ChatGPT or Claude to talk through your own situation - the things this page cannot
            know, like how long you will really stay or how secure your income is.
          </p>
          <KeepResult
            inputs={inputs}
            results={results}
            tippingRent={tippingRent}
            investedMonthly={investedMonthly}
          />
        </div>
      </section>

      <section class="band band-white" id="audit">
        <div class="wrap">
          <h2>Audit the math</h2>
          <p class="h2sub">
            Every year of the simulation, and what each path is worth at the end of it. Nothing is
            rounded away and nothing is hidden behind a chart.
          </p>
          <AuditTable results={results} />
        </div>
      </section>

      <section class="band band-sage" id="faq">
        <div class="wrap">
          <h2>Quick answers</h2>
          <p class="h2sub">
            The questions people ask most. Twenty more are answered with numbers on the{' '}
            <a href="/faq">FAQ page</a>.
          </p>
          <div class="fgrid">
            <div class="fc">
              <h3>Is it cheaper to rent or buy right now?</h3>
              <p>
                At {inputs.mortgageRatePct.toFixed(2)}% on a {fmt(inputs.homePrice)} home with{' '}
                {fmt(inputs.monthlyRent)} rent over {inputs.timeHorizonYears} years,{' '}
                {rentWins ? 'renting and investing comes out ' : 'buying comes out '}
                {round1k(gap)} ahead. Change the rate and that can flip - the table above shows
                where.
              </p>
            </div>
            <div class="fc">
              <h3>How does this decide which side wins?</h3>
              <p>
                It simulates every month of the stay: the mortgage amortises, the home appreciates,
                costs inflate, and whichever path is cheaper that month invests the difference. At
                the end both sides sell up and pay their taxes, and the two cash figures are
                compared.
              </p>
            </div>
            <div class="fc">
              <h3>What rent makes buying the better deal?</h3>
              <p>
                {tippingRent
                  ? `At your numbers, ${fmt(tippingRent)} a month - about ${((tippingRent / inputs.homePrice) * 100).toFixed(2)}% of the home's value per month. Below that, renting and investing the difference stays ahead.`
                  : 'At your numbers there is no rent high enough to make buying win inside this stay.'}
              </p>
            </div>
            <div class="fc">
              <h3>Does it account for taxes?</h3>
              <p>
                Yes - standard deduction versus itemising, the $750,000 mortgage-interest cap, the
                SALT limit, capital gains on investments, and the Section 121 exclusion on the home
                sale. All of them are editable.
              </p>
            </div>
            <div class="fc">
              <h3>Why do most calculators favour buying?</h3>
              <p>
                Three shortcuts: they let only the buyer invest, they count the mortgage payment but
                not maintenance and selling costs, and they compare monthly payments rather than
                what you are actually worth at the end.
              </p>
            </div>
            <div class="fc">
              <h3>Is this financial advice?</h3>
              <p>
                No. It is an educational model, and its answer is only as good as the assumptions
                you give it. It shows you which of those assumptions the answer depends on so you
                can judge that for yourself.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
