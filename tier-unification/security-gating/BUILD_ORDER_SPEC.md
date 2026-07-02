# ESPMO Toolset — Build Order: Contradiction Checks + Determination-Driven Security Gating

**Target:** Toolset v01.2 → v01.3 candidate
**Scope:** `01_Tools_Self_Contained/Project-Profiler.html`, `01_Tools_Self_Contained/Autogenerate.html`, `00_START_HERE_User_Auditor_Guide.docx` (changelog note)
**Author of record:** D. Kintaudi, ESPMO / TGD
**Executor:** Claude Code

---

## 0. Read this first — invariants that must survive

These are non-negotiable properties of this codebase. Violating any of them fails the build regardless of feature completeness.

1. **Single-file, no-CDN, browser-only.** Both tools are self-contained HTML. No new network calls, no external scripts, no build step. All new code is inline.
2. **The rules hoist is law.** All decision logic lives in the single `ESPMO_RULES` block in the Profiler. New rules (contradictions, gating signals) are DATA in that block, evaluated by small generic functions — never scattered inline `if`s keyed to question ids in render code.
3. **The frozen scoring baseline stays bit-identical.** There is a 50,114-case verification baseline for scores/tiers/doc-sets. **Contradiction checks and gating must be non-scoring**: they must not change value, complexity, V–C, tier, criticality, zone, flags, or the triggered document list for any input. Re-run the baseline; require zero diffs.
4. **Schedule writes are PizZip XML surgery only.** SheetJS silently drops formulas on write — it is never used to write schedules. Any stamping added to the security schedule uses the existing surgical cell-replacement path. Formula counts are asserted before/after (project schedule: 146; capture and assert the security schedule's count as part of this build).
5. **Fail-safe delivery.** A schedule or security-file build failure logs a warning and never blocks the Word drafts. This build may *elevate the severity* of one warning (see F3) but must not introduce any path where drafts fail to ship.
6. **The handoff contract is versioned and tested.** The Profiler export's hidden sheets (Templates / Fields / Loops) are the machine contract Autogenerate reads. Any new field rides the existing export round-trip verification. (Historical incident: "Error 0" — an export with a populated Engagement Matrix but an empty Templates sheet silently produced zero documents. Do not repeat the class of bug: every contract change ships with a round-trip test.)

---

## 1. Verified code anchors (found in v01.2 source — locate exactly, do not trust line numbers)

**Profiler**

- Question definitions are JSON objects with ids; the two that matter here:
  - `{"id":"sec","t":"Will the project require new access controls, authentication changes, or a formal security review?","o":[{"l":"No","v":"n"},{"l":"Maybe","v":"mb","f":"security"},{"l":"Yes","v":"y","f":"security"},{"l":"Not sure","v":"ns"}]}`
  - `{"id":"data","t":"Does the project involve sensitive, personal, confidential, regulated data, FTI, or other protected data?","o":[{"l":"No","v":"n"},{"l":"Not sure","v":"m"},{"l":"Yes","v":"y","f":"pii"}]}`
- Flags are computed generically: `const flags={}; QUESTIONS.forEach(q=>{ const o=getOpt(q.id); if(o&&o.f)flags[o.f]=true; });`
- Security complexity axis (do not modify — cited here so you don't "fix" it): `{"a":"Security","max":[["data",{"n":0.5,"m":2,"y":4}],["sec",{"n":0.5,"mb":2.5,"y":4,"ns":2.5}]]}`
- Flag→question mapping used in the Engagement Matrix render: `const FQ={production:'newcap',pii:'data',security:'sec',cloud:'cloud',vendor:'vendor',migration:'migrate'};`
- Trigger doc lists (for reference; unchanged by this build): `security → C&A Package, ISRP, SIEM / Logging Kickoff, Vulnerability Scan & Pen Test`; `pii → PIA, BIA, SSP-Initial (§1&2), Risk Assessment` (pii also sets the Tier-2 floor via `window.__PII_FLOOR`).

**Autogenerate**

- Security output gating today (the line this build changes):
  `var wantSecurity = !$("inclSecurity") || $("inclSecurity").checked;` → `if (wantSecurity) { buildSecurityTemplateOutput(); buildSecurityScheduleOutput(); }` inside a try/catch that warns and never blocks drafts.
- Draft language map for the sec states exists under a `"sec"` key: `y / mb / n / ns` → `sec_text` strings ("...requires...", "...may require, pending assessment...", "...does not require...", "...has not yet been confirmed.").
- The security schedule's Project Start cell (`B1` on the Security Schedule sheet) is a live formula (reads as today's date); all task dates and the Gantt derive from it.

---

## 2. Feature F1 — Contradiction checks (Profiler)

### Intent
Catch answer combinations that are individually valid but jointly implausible, force an explicit human acknowledgment, and carry that acknowledgment through the export into the drafts. Contradictions **inform and demand confirmation; they never change scores.**

### Rules block (new, in `ESPMO_RULES`)
Add `ESPMO_RULES.contradictions` as data. Initial set:

| id | when | severity | message |
|---|---|---|---|
| C1 | `data === 'y' && sec === 'n'` | **hard** | "Intake marks protected/regulated data but answers No to security review. Protected data almost always entails access-control and review work — confirm this combination is intentional." |
| C2 | `data === 'y' && sec === 'ns'` | soft | "Protected data is marked Yes while the security-review question is unresolved. Resolve the security answer before baselining." |
| C3 | `cloud === 'y' && sec === 'n'` | soft | "Cloud/hosting/infrastructure changes with No security review is unusual — confirm with CSD guidance in mind." |
| C4 | `migrate === 'y' && data === 'n'` | soft | "Large-scale data migration with no protected data — confirm the data classification is right." |

Schema: `{ id, when: [ [qid, op, value], ... ] (AND semantics), severity: 'hard'|'soft', msg }`. Write one generic evaluator; no per-rule code.

### Behavior
- **Evaluation:** on every recompute (same place flags are computed) — results screen shows a Contradictions panel listing fired rules, styled distinctly (hard = red-toned banner, soft = amber note). Zero fired → panel absent.
- **Hard rules:** export requires acknowledgment. A checkbox per hard contradiction: "Confirmed intentional — [PM types initials]". Unacknowledged hard contradiction → export button disabled with explanatory text. **Do not block re-answering** — the primary remedy is fixing the answer; acknowledgment is the escape hatch.
- **Soft rules:** displayed, exportable without acknowledgment, but recorded.
- **Non-scoring guarantee:** the evaluator runs after scoring and reads answers only. It writes to a `contradictions` result object consumed by render/export — nothing else reads it.

### Export & draft stamping
- Handoff: add a `Contradictions` region (new rows in the existing Fields sheet or a parallel hidden sheet — match whichever pattern the Fields sheet uses; keep the contract style consistent): `contradiction_id | severity | fired | acknowledged | ack_initials | message`.
- Autogenerate: new template tag `{contradictions_block}` renders, in any template that includes it: nothing (none fired), or a short "Intake consistency notes" block listing fired rules with their acknowledgment state — e.g. "C1 acknowledged as intentional (DK)" or "C2 unresolved at export." Add the tag to the security-relevant templates' data path; leave template files untouched in this build (tag renders only where present — same convention as existing tags).

### Acceptance criteria (F1)
- Full truth-table test: every combination of `data × sec × cloud × migrate` values evaluated; fired set matches the table above exactly; **all scoring outputs bit-identical to baseline for every combination.**
- Hard-unacknowledged blocks export; acknowledging (with non-empty initials) unblocks; round-trip test shows the acknowledgment arriving intact in Autogenerate's parse.
- UI: contradiction panel appears/disappears reactively as answers change; no console errors.

---

## 3. Feature F2 — Security determinations "click in" to the security outputs

### Intent
The security files should visibly belong to *this* project and *these* answers — not read as generic attachments.

### Changes (Autogenerate, security schedule build path)
1. **Stamp Project Start:** replace the `B1` live-formula default with the project's start date from the Profiler export **when present** (surgical cell write, value + date format preserved); fall back to the existing formula when absent. All downstream date formulas must keep computing (they reference `$B$1` — assert the reference style is value-compatible; if `B1` must stay a formula for conditional-format reasons, write the date as a literal into the formula's source cell per the template's own "change B1" affordance).
2. **Stamp identity:** project name + PM into the security schedule's header region (add cells if the template lacks them — prefer existing empty header cells; do not shift rows/columns).
3. **Stamp the determinations:** a small header block on the security schedule (and the library's How-to sheet): `Security review: <verbatim sec_text state>` and `Protected data: Yes/No/Not sure`, plus `Fired by intake: security flag [y/n], protected-data flag [y/n]`.
4. **Formula preservation:** capture the security schedule's formula count pre-change; assert identical count post-stamp (minus any cell intentionally converted per item 1 — document the delta explicitly; expected delta ≤ 1 and only `B1`).

### Acceptance criteria (F2)
- Build from a sample export with a start date → `B1` shows that date; every task Start/Finish and Gantt bar re-based accordingly; zip-validity readback passes; Excel opens clean.
- Build from an export without a start date → current behavior (live formula) preserved.
- Determination header text matches the Profiler's answers verbatim for all four sec states.

---

## 4. Feature F3 — Determination-driven gating (the checkbox stops being the authority)

### Intent
**Security outputs fire from the answers, whether or not anyone clicks a box.** The checkbox becomes a manual *include* for unfired projects, never an *exclude* for fired ones.

### Rule
`securityFired = flags.security || flags.pii` — i.e., `sec ∈ {y, mb}` OR `data === 'y'`. Read from the handoff (add `ans_sec` and `ans_data` raw values to the Fields region if not already derivable; round-trip tested).

### Behavior matrix
| securityFired | inclSecurity checkbox | Result |
|---|---|---|
| true | any state | **Both security files ship. Checkbox rendered checked + disabled**, caption: "Required — fired by intake answers (security: [state]; protected data: [state])." |
| false | checked (default) | Files ship (today's floor preserved — no regression). |
| false | unchecked | Files skipped, log line notes they were declined and not answer-required. |

### Failure elevation
If `securityFired === true` and the security build throws: keep shipping the drafts (invariant 5), but elevate the message from `warn` to an error-styled banner: "Security files are REQUIRED by this project's intake answers and failed to build — do not treat this delivery as complete." (Today's neutral warn stays for unfired builds.)

### Acceptance criteria (F3)
- Truth-table test over `securityFired × checkbox` matches the matrix exactly.
- With `securityFired`, programmatically unchecking/removing the checkbox still ships both files (the `!$("inclSecurity")` null-guard semantics must not create a bypass).
- Fired-and-failed path shows the elevated banner; drafts still produced.

---

## 5. Test & verification plan (run all; all green = done)

1. **Frozen baseline:** full 50,114-case scoring verification — zero diffs.
2. **Contradiction truth table** (F1) — fired sets + non-scoring assertion per combination.
3. **Gating truth table** (F3).
4. **Export round-trip:** contradictions + acknowledgments + `ans_sec`/`ans_data` + start date survive Profiler→export→Autogenerate parse. Include the Error-0 regression case (Templates sheet must be populated whenever the Engagement Matrix is).
5. **Schedule integrity:** project schedule 146/146 formulas byte-intact; security schedule formula count asserted with the documented `B1` delta only; zip-validity readback on every stamped output (reuse the existing randomized-run harness; a 10k-run smoke is acceptable for this build, full 500k before canonizing).
6. **Manual pass:** open both tools in Edge, run the pack's sample intake end-to-end, eyeball the contradictions panel, the disabled checkbox caption, and the stamped security schedule.

## 6. Versioning & docs
- Bump: Profiler → v01.3, Autogenerate → v01.07 (or next per internal scheme); update in-file headers and `<title>`s.
- Changelog entries in each file header: F1/F2/F3 one-liners + "non-scoring, baseline-identical" note.
- One paragraph in `00_START_HERE_User_Auditor_Guide.docx`: what contradictions are, what the disabled checkbox means, what the stamped security header shows.
- Do **not** modify: scoring weights, tier ladder, trigger doc lists, Security axis values, template .docx/.xlsx files.

## 7. Open decisions (implement the recommendation unless overridden)
- **D1 — Unfired default:** checkbox default stays **checked** (preserves the every-build floor; zero regression). Alternative (default off when unfired) is a *policy* call for Andy/CSD, not engineering — leave a one-line config constant `SECURITY_DEFAULT_INCLUDE = true` so the policy flip is a one-character change.
- **D2 — Hard-contradiction escape hatch:** acknowledgment-with-initials (recommended) vs. hard block. Recommended: acknowledgment. It matches the toolset's "anticipated determination — humans decide" posture, and the acknowledgment stamped into drafts is the audit artifact.
- **D3 — C3/C4 severity:** shipped as soft. Promote to hard only after CSD reviews the message text.
