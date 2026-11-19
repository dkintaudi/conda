# Autogenerate — TRT / Scope Enrichment

A follow-on enhancement to `01_Tools_Self_Contained/Autogenerate.html`, separate from the
tier-unification work. Three additive changes to the TRT source parser and `buildData`
(no other behavior touched):

## 1. In Scope — answer-derived draft, explicit source wins
- If a source (TRT) **explicitly lists** In Scope, those items fill the Scope table.
- Otherwise, a deterministic **`[REVIEW]` draft** is composed from the intake answer flags
  — the same answer→narrative pattern the tool already uses for the business problem:

  | Affirmative answer | In-Scope line |
  |---|---|
  | new/changed capability | Deliver the new or changed service, system, process, or capability |
  | data migration | Migrate, convert, or cleanse existing data |
  | cloud / infra | Implement cloud, hosting, or infrastructure / environment changes |
  | security review | Implement access-control / authentication changes and complete the security review |
  | sensitive data | Implement privacy and data-protection controls for sensitive data |
  | heavy dependencies | Integrate with the dependent systems, interfaces, or shared data |
  | vendor / contractor | Manage vendor / contractor-delivered scope (SOW and acceptance) |

## 2. Out of Scope — explicit only, never inferred
Exclusions cannot be derived from intake answers (a "No" is not an exclusion). Out of Scope
is filled **only** when a source explicitly lists it; otherwise it stays `[PM TO COMPLETE]`.

## 3. Objectives stay deterministic (no scope coupling)
The Objective **statement** remains deterministic (intake answers / business problem) and the
**measure** is enriched from the TRT per the existing `objectiveMeasureRule`. Scope does **not**
feed objectives. (An earlier prototype that mirrored scope→objectives was rejected for
violating "statement stays deterministic" and was removed.)

## Bonus: labeled-value pickup
Widened the source label scanner so `Funding Source:`, `Fiscal Years:`, `Date Prepared:`,
and cost labels are captured when a source states them (same colon-scan as the role labels).

## Verification (reproducible, headless)
Run against the real tool in jsdom:
- `autogen-verification/autogen_real_e2e.js` — Profiler export → real Autogenerate →
  delivered `.docx` for Mini (3 docs) and Standard (4 docs incl. Engagement Matrix); each
  opens, project name + unified tier filled, 0 unrendered placeholders.
- `autogen-verification/scope_v2_test.js` — shows In Scope auto-drafted from answer flags
  (Profiler only) and the TRT explicit list winning when present; Out of Scope stays human.

## Note
In-Scope items render as a tight loop; if separate bullets are wanted, that's a one-line
template tweak to put `{#in_scope}…{/in_scope}` on its own paragraph/row in the .docx.
