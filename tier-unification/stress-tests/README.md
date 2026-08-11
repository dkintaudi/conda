# Stress tests — Project Profiler (back & front)

Randomized, high-volume checks that the whole package holds up end to end.

## Front / core — `stress_front_500k.js`
Feeds random answer sets through the real pipeline (bound to the live `state`
object) and asserts invariants each iteration: value 0–100, complexity 0–4,
zone/criticality/govTier valid, PAL kind + `anticipated`⇔govTier 4, method ∈
{Waterfall,Agile,Hybrid}, T-shirt column/label rules, required∩recommended = ∅,
Mini-tier keep-rule (Small keeps Mini Charter + Governance), tier⇔size mapping,
PAL overrides to the pal column.

```
node stress_front_500k.js 500000
```
Result: 500,000 iterations, 0 failures.

## Back / export — `stress_back_export.js`
Random state → compute() → saveAsExcel() → verify all 11 sheets present, the
Autogenerate handoff sheets (Templates/Fields/Loops) + CA-PMF Templates parse
to rows → serialize to real .xlsx bytes → XLSX.read back → confirm sheets
survive the round-trip.

```
node stress_back_export.js 3000
```
Result: 3,000 full export→re-read round-trips, 0 failures (~5/s; a literal 500k
would take ~28h, so this is a representative sample).
