# Tier Unification — Implementation Notes (v01.3)

Implements the approved `v01.3_TIER-UNIFICATION_SPEC.md` against
`Project-Profiler.html`. The redundant complexity-only `artTier` is gone; the map
band, the document binder, and the oversight pill now read **one** governance tier.

## The single ladder (one definition, used everywhere)

```
naturalTier = (EDD Next OR V–C >= 80) ? 3
            : (value < 60 AND avgCx < 2.5) ? 1     // the both-low corner
            : 2
govTier     = PAL ? 4 : naturalTier
```

- **Tier 1 (Mini)** — both-low corner → baseline doc set only.
- **Tier 2 (Standard)** — the middle → baseline + Tier-2 docs.
- **Tier 3 (Full)** — `V–C ≥ 80 OR EDD Next` → baseline + Tier-2 + Tier-3 docs.
- **Tier 4 (PAL)** — PAL designation → forces Full docs **and** adds the PAL Stage 1–4
  gate package, overriding the natural band.

`naturalTier` (1/2/3) drives the **map label**. `govTier` (1–4) drives both the
**document set** (`buildArtifacts`) and the **oversight pill** — so they cannot
disagree. PAL is overlaid as Tier 4 on top of the natural band: it escalates the
binder and oversight without moving the map label. That is the single intended
divergence in the whole grid.

## What changed in `Project-Profiler.html`

Both near-identical computation blocks were converted identically (the
"fixed one, missed the other" trap — verified byte-identical, see below):

1. **Deleted `artTier`** (`cxi>=75?3:cxi>=50?2:1` + PII bump) in both `compute()` and
   `_recompute()`.
2. **One tier** computed from corner (T1) / `V–C≥80 OR EDD Next` (T3) / PAL (T4) / else T2.
3. **Re-keyed `buildArtifacts`** to the unified `govTier` (call sites in `compute()` and
   `saveAsExcel()`), and the Engagement-Matrix `trigActive` tier source.
4. **Collapsed the `t1Max` 60-vs-50 split** — the old V–C `govTier` ladder (with its
   `t1Max`, `piiSecFloor`, `cxFloorT2` floors) was removed; the corner now defines Tier 1.
5. **Map relabel** — band/chip labels and the V–C SVG region now read **Mini / Standard /
   Full**; PAL remains a badge overlay, not a V–C region.
6. **"Targeted" → "Full"** across the on-screen map label, the `BANDINFO`/band chips,
   the Excel "V–C Read (band)" formula, the Maps-sheet `{TGT/STD/MEA}` display map, and
   the band caption.
7. **CSS tidy** — `.q-mea` → `.q-min`.
8. **Export columns** (`artifact_tier`, `"Artifact Tier"`, JSON `artifactTier`) — naming
   left as-is per the spec's explicit deferral, but now fed the unified tier via an
   `artTier = govTier` alias in `_recompute()` so no downstream exporter breaks. A later
   pass can collapse these to a single Governance Tier column.

### Decision recorded: PII no longer escalates the tier
The spec's single-ladder definition (and checklist item 1, which deletes the `artTier`
"+PII bump") contains no PII floor. The old `piiSecFloor`/`cxFloorT2` were part of the
removed govTier complexity. PII still fires its own document set (PIA, BIA, SSP, Risk
Assessment) via the `pii` flag, but it no longer changes the tier classification — which
is what keeps PII from introducing a hidden binder/map/oversight divergence.

## Verification (the definition-of-done gate)

`verify_tier_sweep.js` replicates the implemented logic and sweeps
**value × complexity × {EDD Next, PAL, PII}** (2,856 cells):

- **PASS** — binder, map label, and oversight tier agree on every cell.
- The **only** divergence is PAL forcing Full docs above its natural band (592 cells).
- PII never moves the tier.
- The four representative split cells from the spec's problem table now resolve to a
  single tier each (55/0.8→Mini, 59/2.8→Standard, 40/2.8→Standard, 65/2.8→Standard).

Additional checks run against the shipped file:
- All `<script>` blocks parse with 0 errors.
- Both `naturalTier`/`govTier` definitions extracted from the file are **byte-identical**
  and execute to the expected tier across the sweep (the duplicated-block trap).
- `04_QA_Checks/validate_templates.py` → **17 DOCX scanned, QA passed**.
- `PACKAGE-MANIFEST.sha256` regenerated → **70/70 OK**.

Run it yourself:
```
node verify_tier_sweep.js
```

## Repackaging

- `Project-Profiler.html` — the edited tool (also synced inside the zip).
- `ESPMO-Toolset-v01_3-TIER-UNIFIED.zip` — full repackaged toolset with the edited tool,
  regenerated manifest (70/70 OK), and validator passing (17 DOCX).
- `verify_tier_sweep.js` — the verification harness.
- `v01.3_TIER-UNIFICATION_SPEC.md` — the authoritative work order, for reference.
