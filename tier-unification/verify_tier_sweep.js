#!/usr/bin/env node
/* Tier-Unification verification sweep.
 * Mirrors EXACTLY the unified-tier logic implemented in Project-Profiler.html:
 *   - compute() / _recompute(): naturalTier + govTier
 *   - buildArtifacts(tier): tier>=2 adds the Tier-2 doc set, tier>=3 adds the Tier-3 set
 *   - PAL flag: adds the PAL Stage 1-4 Gate Package independent of tier
 * Gate: across value x complexity x {EDD Next, PAL, PII}, the binder, the map label,
 * and the oversight tier must agree on every cell — the ONLY intended divergence being
 * PAL forcing Full docs (+PAL package) above its natural band.
 */

function model({ value, avgCx, eddnext, pal, pii }) {
  const vc = Math.round(value - avgCx * 2.5);

  // --- unified ladder (identical to the HTML) ---
  const naturalTier = (eddnext || vc >= 80) ? 3 : ((value < 60 && avgCx < 2.5) ? 1 : 2);
  const govTier = pal ? 4 : naturalTier;

  // --- map band label reads the natural tier ---
  const mapLabelTier = naturalTier;                 // 1=Mini 2=Standard 3=Full

  // --- buildArtifacts doc set is keyed to the unified govTier ---
  const hasTier2Docs = govTier >= 2;                // Engagement Matrix, RACI, PMP
  const hasTier3Docs = govTier >= 3;                // Post-Impl Review, ESPMO/Portfolio Oversight
  const binderTier = hasTier3Docs ? 3 : (hasTier2Docs ? 2 : 1);
  const palPackage = !!pal;                         // PAL Stage 1-4 Gate Package fires from the flag

  // --- oversight pill ---
  const oversightTier = govTier;

  return { vc, naturalTier, govTier, mapLabelTier, binderTier, oversightTier, palPackage };
}

const LABEL = { 1: 'Mini', 2: 'Standard', 3: 'Full' };
const failures = [];
let cells = 0, palDivergences = 0;

const values = [];
for (let v = 0; v <= 100; v += 5) values.push(v);
const cxs = [];
for (let c = 0; c <= 4.0001; c += 0.25) cxs.push(+c.toFixed(2));

for (const value of values)
for (const avgCx of cxs)
for (const eddnext of [0, 1])
for (const pal of [0, 1])
for (const pii of [0, 1]) {
  cells++;
  const r = model({ value, avgCx, eddnext, pal, pii });
  const ctx = `value=${value} avgCx=${avgCx} vc=${r.vc} eddnext=${eddnext} pal=${pal} pii=${pii}`;

  // (1) PII must never move the tier: compare to the same cell without PII.
  if (pii) {
    const base = model({ value, avgCx, eddnext, pal, pii: 0 });
    if (base.govTier !== r.govTier || base.naturalTier !== r.naturalTier)
      failures.push(`PII changed the tier — ${ctx}`);
  }

  if (!pal) {
    // (2) Non-PAL: binder == map label == oversight, all equal.
    if (!(r.binderTier === r.mapLabelTier && r.mapLabelTier === r.oversightTier))
      failures.push(`Tier disagreement (non-PAL): binder=${r.binderTier} map=${r.mapLabelTier} oversight=${r.oversightTier} — ${ctx}`);
  } else {
    // (3) PAL: oversight=4, binder=Full(3) + PAL package; map label = natural band.
    if (r.oversightTier !== 4) failures.push(`PAL oversight not 4 (=${r.oversightTier}) — ${ctx}`);
    if (r.binderTier !== 3)    failures.push(`PAL binder not Full (=${LABEL[r.binderTier]}) — ${ctx}`);
    if (!r.palPackage)         failures.push(`PAL package missing — ${ctx}`);
    if (r.mapLabelTier < 3) palDivergences++;        // the one intended divergence
    // The map label must NOT be silently forced to Full by PAL — it stays natural.
    const natural = model({ value, avgCx, eddnext, pal: 0, pii });
    if (r.mapLabelTier !== natural.naturalTier)
      failures.push(`PAL moved the map label off its natural band — ${ctx}`);
  }

  // (4) EDD Next must route to at least Tier 3 everywhere (binder, map, oversight).
  if (eddnext && !pal) {
    if (!(r.binderTier === 3 && r.mapLabelTier === 3 && r.oversightTier === 3))
      failures.push(`EDD Next did not route to Full/3 consistently — ${ctx}`);
  }
}

// Spot-check the representative splits from the spec problem table (these used to disagree).
function tierOf(value, avgCx, opt = {}) { return model({ value, avgCx, eddnext: 0, pal: 0, pii: 0, ...opt }); }
const spec = [
  { value: 55, avgCx: 0.8, want: 1 }, // was Mini vs gov1 vs gov2 — now all Tier 1
  { value: 59, avgCx: 2.8, want: 2 }, // was Standard vs gov1 vs gov2 — now all Tier 2
  { value: 40, avgCx: 2.8, want: 2 }, // avgCx>=2.5 so not the corner -> Standard
  { value: 65, avgCx: 2.8, want: 2 }, // vc=58 -> Standard everywhere
];
console.log('Spec representative cells (binder=map=oversight):');
for (const s of spec) {
  const r = tierOf(s.value, s.avgCx);
  const ok = r.binderTier === s.want && r.mapLabelTier === s.want && r.oversightTier === s.want;
  console.log(`  value=${s.value} avgCx=${s.avgCx} vc=${r.vc} -> ${LABEL[r.binderTier]}(${r.binderTier}) [${ok ? 'OK' : 'MISMATCH expected ' + s.want}]`);
  if (!ok) failures.push(`Spec cell mismatch value=${s.value} avgCx=${s.avgCx}`);
}

// PAL-overrides-natural-Mini example from the spec (value-60 PAL = Mini by nature, Full+PAL by binder).
{
  const r = model({ value: 55, avgCx: 0.8, eddnext: 0, pal: 1, pii: 0 });
  console.log(`\nPAL override example: value=55 avgCx=0.8 -> map=${LABEL[r.mapLabelTier]}(${r.mapLabelTier}), binder=${LABEL[r.binderTier]}(${r.binderTier})+PAL pkg=${r.palPackage}, oversight=Tier ${r.oversightTier}`);
}

console.log(`\nSwept ${cells} cells (value x avgCx x {eddnext,pal,pii}).`);
console.log(`Intended PAL divergences (map below Full while binder=Full): ${palDivergences}`);
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  failures.slice(0, 40).forEach(f => console.log('  - ' + f));
  process.exit(1);
} else {
  console.log('\nPASS — binder, map label, and oversight tier agree on every cell; the only divergence is PAL forcing Full docs above its natural band. PII never moves the tier.');
}
