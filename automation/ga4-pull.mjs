// GA4 pull for rentvsbuymath.com. Deterministic, no model - part of the
// measurement layer, never the analysis layer.
//
// Auth: the same service account as GSC (~/.config/gsc/service-account.json),
// added to the GA4 property as Viewer on 2026-08-04. Requires the Analytics
// Data API (and, first run only, the Analytics Admin API for property
// discovery) to be ENABLED on the service account's GCP project. Until they
// are, this prints {"status":"api_disabled",...} and exits 0 - the callers
// keep a ledger row either way, and the script self-heals once the APIs are
// switched on.
//
// Usage: node ga4-pull.mjs [days=1]
// Prints ONE JSON object to stdout:
//   { status: "ok"|"api_disabled"|"no_access"|"error", date, range_days,
//     sessions, engaged_sessions, events: {name: count}, channels: {group: sessions} }
//
// The numeric property ID is discovered once via the Admin API (matching the
// data stream to measurement ID G-J18VFSYEHD) and cached in
// automation/metrics/ga4-property.txt so daily runs touch only the Data API.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROPERTY_CACHE = join(HERE, 'metrics', 'ga4-property.txt');
const MEASUREMENT_ID = 'G-J18VFSYEHD';
const DAYS = Math.max(1, Math.min(28, Number(process.argv[2]) || 1));

const out = (obj) => {
  console.log(
    JSON.stringify({
      date: new Date().toISOString().slice(0, 10),
      // The report window ends yesterday (GA4 daily data is complete then);
      // ledger rows are keyed on this, not on the run date.
      window_end: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
      range_days: DAYS,
      ...obj,
    })
  );
  process.exit(0);
};

const classify = (err) => {
  const msg = JSON.stringify(err);
  if (msg.includes('SERVICE_DISABLED')) return 'api_disabled';
  if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) return 'no_access';
  return 'error';
};

let sa;
try {
  sa = JSON.parse(readFileSync(`${process.env.HOME}/.config/gsc/service-account.json`, 'utf8'));
} catch {
  out({ status: 'error', error: 'service-account.json unreadable' });
}

// --- token ------------------------------------------------------------------
const now = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const unsigned =
  b64({ alg: 'RS256', typ: 'JWT' }) +
  '.' +
  b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
const signer = createSign('RSA-SHA256');
signer.update(unsigned);
const jwt = unsigned + '.' + signer.sign(sa.private_key, 'base64url');

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
  signal: AbortSignal.timeout(30_000),
}).catch(() => null);
const token = tokenRes ? await tokenRes.json() : null;
if (!token?.access_token) out({ status: 'error', error: 'token exchange failed' });
const auth = { Authorization: `Bearer ${token.access_token}` };

// --- property id (cached after first successful discovery) ------------------
let propertyId = existsSync(PROPERTY_CACHE) ? readFileSync(PROPERTY_CACHE, 'utf8').trim() : '';
if (!propertyId) {
  const summaries = await (
    await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: auth,
      signal: AbortSignal.timeout(30_000),
    })
  ).json();
  if (summaries.error) out({ status: classify(summaries.error), error: summaries.error.message });
  const props = (summaries.accountSummaries ?? []).flatMap((a) => a.propertySummaries ?? []);
  for (const p of props) {
    const streams = await (
      await fetch(`https://analyticsadmin.googleapis.com/v1beta/${p.property}/dataStreams`, {
        headers: auth,
        signal: AbortSignal.timeout(30_000),
      })
    ).json();
    if ((streams.dataStreams ?? []).some((s) => s.webStreamData?.measurementId === MEASUREMENT_ID)) {
      propertyId = p.property; // "properties/NNNN"
      break;
    }
  }
  if (!propertyId) out({ status: 'no_access', error: `no visible property has stream ${MEASUREMENT_ID}` });
  writeFileSync(PROPERTY_CACHE, propertyId + '\n');
}

// --- report -----------------------------------------------------------------
const run = (body) =>
  fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: 'yesterday' }], ...body }),
    signal: AbortSignal.timeout(60_000),
  }).then((r) => r.json());

const totals = await run({ metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }] });
if (totals.error) out({ status: classify(totals.error), error: totals.error.message });

const byEvent = await run({
  metrics: [{ name: 'eventCount' }],
  dimensions: [{ name: 'eventName' }],
  limit: 50,
});
const byChannel = await run({
  metrics: [{ name: 'sessions' }],
  dimensions: [{ name: 'sessionDefaultChannelGroup' }],
  limit: 20,
});

const row = totals.rows?.[0]?.metricValues ?? [];
const events = Object.fromEntries(
  (byEvent.rows ?? []).map((r) => [r.dimensionValues[0].value, Number(r.metricValues[0].value)])
);
const channels = Object.fromEntries(
  (byChannel.rows ?? []).map((r) => [r.dimensionValues[0].value, Number(r.metricValues[0].value)])
);

out({
  status: 'ok',
  property: propertyId,
  sessions: Number(row[0]?.value ?? 0),
  engaged_sessions: Number(row[1]?.value ?? 0),
  events,
  channels,
});
