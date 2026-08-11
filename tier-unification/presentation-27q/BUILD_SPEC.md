# ESPMO Project Profiler — 27-Question Build Spec

**Target:** Profiler v01.4 (assign canonical version; update header + export version stamp)
**Source of truth:** Profiler v01.3 (`ESPMO_RULES` block + export writer) and *Questions, Values & Triggers v01.3*
**Change class:** Presentation-layer release. Zero scoring changes. Zero code changes. Zero export-schema changes.

---

## 0 · Agent instructions — read first

1. **Required input:** the current canonical Profiler HTML (v01.3). If it is not in the workspace, **STOP and ask for it.** Do not reconstruct scoring, weights, band thresholds, contradiction logic, or export formatting from this spec — this spec defines structure and contracts, not scoring math.
2. **Port `ESPMO_RULES` verbatim.** Copy the entire block byte-for-byte from v01.3. Verify with a diff/hash. Do not refactor, reformat, rename, or "improve" it.
3. **Conflict rule:** if anything in this spec appears to conflict with v01.3 `ESPMO_RULES` behavior — the rules block wins for scoring math; this spec wins for presentation and structure. Raise the conflict; never silently choose.
4. **Codes are the contract.** Question IDs, answer codes, and export keys are consumed by scoring, export, and the downstream Profiler → Excel → Autogenerate pipeline. Never rename, renumber, re-case, or normalize them (see §5 warnings).
5. **Architecture:** single self-contained `.html` file. Vanilla HTML/CSS/JS, everything inline. **No CDN, no external requests, no build step, no frameworks.** Must run from a file share with no network.
6. This is question **reduction by presentation only**: 32 → 27 visible screens. Every one of the 31 answer fields is still captured. Nothing is auto-filled, defaulted, gated, or skipped.

---

## 1 · Invariants (non-negotiable)

| # | Invariant |
|---|---|
| I1 | `ESPMO_RULES` in the built file is byte-identical to v01.3 |
| I2 | Export schema unchanged: all 31 question fields + `name` metadata, same keys, same value codes |
| I3 | Identical answer-code vectors produce **byte-identical exports** vs v01.3 |
| I4 | Every answer option that exists in v01.3 exists here — none added, none removed, none re-labeled in a way that changes meaning |
| I5 | "Not sure" remains available everywhere it exists today, including per-row in the PAL matrix |
| I6 | No question is conditionally hidden. All 27 screens are always presented |
| I7 | The delivery-method advisory remains advisory: it never blocks progress and never alters value/complexity/tier |
| I8 | Q31 `na` continues to suppress the M&O Plan (known asymmetry — intentionally NOT fixed this release; see §9) |

---

## 2 · Delta vs v01.3 (complete list — nothing else changes)

1. **Project Name → metadata.** Captured on the intro screen, stored as `name`, rendered in the read-out header. No longer counted or displayed as a question.
2. **Q19–Q22 → one screen** (visible #19): a **true matrix**, 4 rows × 3 shared columns (No / Yes / Not sure). See §4.1.
3. **Q30–Q31 → one screen** (visible #27): **two stacked selects** on one screen. NOT a shared-column matrix. See §4.2.
4. **Section chrome:** 6 labeled sections with progress indicator; intro screen. See §7.
5. Q01–Q06, Q07–Q12, Q13–Q18, Q23–Q29 remain **standalone, unchanged screens**. Q02/Q03 and Q04/Q05 are deliberately NOT merged.

**Design criterion (record in code comment near the question definitions):**
> Judgment-scale inputs to the method advisory stand alone; factual flag screens merge.
Reduction math: 32 − 1 (name → metadata) − 3 (PAL 4→1) − 1 (Q30+Q31) = **27 visible**.

---

## 3 · The 27 screens

Format: `visible# · field-id — Section`. Question text and option labels are canonical — reproduce exactly. Codes in backticks. `→ flag` marks a flag raised by that option. **Help** lines must render on-screen (they carry the elicitation anchors).

### Section 1 · Project Identity (screens 1–6)

**1 · `method`** — What is the project delivery approach?
Help: Determines delivery artifacts and scope/standards. Does not drive priority. An advisory recommendation is derived from scope stability, delivery cadence, business-partner availability, team size, and team-availability answers to compare against this.
Options: Agile `agile` | Waterfall `waterfall` | Hybrid `hybrid` | Not yet determined `tbd`
Drives: Tech · Scope Management Process; Tech · Standards & Methods; tier driver; method signal (selected method)

**2 · `scope`** — Once defined, how stable is the scope / set of requirements expected to be during delivery?
Help (**must keep — disambiguation**): Advisory only — does not affect value or complexity. DISTINCT from novelty: this is requirements VOLATILITY (will they hold or keep changing), not whether the work is new. Stable favors predictive (Waterfall); changing favors adaptive (Agile).
Options: Stable — well-defined, few changes expected once set `stable` | Mostly stable — some change expected `mostly` | Volatile — frequent change expected or welcomed `evolving` | Not sure `ns`
Drives: method signal · scope stability

**3 · `delivery`** — How does the business want the solution delivered?
Help: Advisory only. EDD SDLC "Delivery" criterion. Stages favor Agile; single delivery at the end favors Waterfall.
Options: In stages — incremental releases over time `stages` | Phased — a few planned releases `phased` | All at once — single delivery at the end `end` | Not sure `ns`
Drives: method signal · delivery cadence

**4 · `custavail`** — How available is the business partner / product owner during delivery?
Help: Advisory only. Availability throughout favors Agile; engagement at milestones only favors Waterfall.
Options: Available throughout — ongoing collaboration `through` | Periodic — at key checkpoints `periodic` | At requirements and milestones only `miles` | Not sure `ns`
Drives: method signal · business-partner availability

**5 · `teamavail`** — Is the delivery team dedicated and available to this project?
Help: Advisory only. EDD SDLC "Resources" criterion (with team size). Dedicated favors Agile; shared/part-time favors plan-driven Waterfall.
Options: Dedicated — committed and available to this project `ded` | Mostly available — some competing work `mostly` | Shared / part-time — pulled across other work `shared` | Not sure `ns`
Drives: method signal · team availability

**6 · `phase`** — What is the current project phase?
Help: Determines which artifacts are expected now vs. later.
Options: Concept `Concept` | Initiate `Initiate` | Plan `Plan` | Execute `Execute` | Close `Close`  ← codes are capitalized; preserve exact case
Drives: artifact timing (due now vs later)

### Section 2 · Value / Priority Drivers (screens 7–12)

**7 · `benefit`** — What is the expected strategic or operational value if this project succeeds?
Options: Incremental `inc` | Moderate `mod` | High `high` | Transformational `trans`
Drives: Value · Strategic Alignment (**w5** — the single heaviest value input; drives-count 1 ≠ low impact)

**8 · `mandate`** — Is there a hard external driver — required deadline, statutory/regulatory requirement, policy/compliance requirement, audit finding, funding deadline, executive mandate, time-related contract restriction or expiration, end-of-life / unsupported system deadline, or other non-discretionary driver?
Help: Any hard, non-discretionary deadline — including an end-of-life/unsupported system or a contract time restriction — counts as Yes.
Options: No `n` | Yes `y` | Not sure `m`  ← **"Not sure" code is `m` here, not `ns`. Do not normalize.**
Drives: Value · Time/Mandate (w4); Biz · Issues; Biz · Policies; Biz · Time Scale; tier driver

**9 · `risk`** — Are the project's risks identified and under control?
Help: Higher = better risk posture. Anchor on what's documented (risk log / mitigation plan), not optimism.
Options: All under control — risks identified, owned, and actively mitigated `all` | Mostly — key risks managed, some gaps remain `most` | Minimal — few risks identified or mitigated `few` | None — risks unknown or unmanaged `none` | Not sure `ns`
Drives: Value · Risk Management (w3)

**10 · `impact`** — Who is expected to be impacted by the project outcome?
Options: Internal project team only `team` | One unit or program area `div` | Multiple units or divisions `multi` | External customers, claimants, employers, or public users `public` → flag `public`
Drives (12 — widest fan-out in the instrument): Value · Customer/Stakeholder (w2); Biz · Geography, Politics, Target Users, Visibility; Tech · Communications, Geography, Operations, Transaction Volume, Tolerance to Fault (**max**); tier driver; flag `public`

**11 · `pmexp`** — How experienced is the delivery team with this type of work?
Help: Observable test — HAS THIS TEAM DELIVERED THIS TYPE OF WORK BEFORE? Rate the collective team, not any one person. Cross-checks SIMM team experience.
Options: Very experienced — delivered multiple comparable projects; key roles held by people who've done it before `ve` | Somewhat experienced — adjacent or partial experience `sw` | New to this type of work — first time; learning on the job, or key roles unfilled `ne` | Not sure / not yet assessed `ns`
Drives: Value · Resource Availability — People (w0.5); Biz · Team Experience; Tech · Team Technical Experience; tier driver

**12 · `funding`** — Is funding secured for this work?
Help: Funding half of Resource Availability. An experienced team with no funding earns only the people half.
Options: Secured / fully funded `sec` | Partially funded or in the budget cycle `part` | Identified but not yet secured `id` | Not funded / no funding identified `none` | Not sure `ns`
Drives: Value · Resource Availability — Funding (w0.5)

### Section 3 · Size & Delivery Footprint (screens 13–18)

**13 · `newcap`** — Will this project deliver a new or changed service, system, process, or capability?
Options: No `n` | Not sure `m` | Yes `y` → flag `production`  ← "Not sure" is `m` here too
Drives: flag `production` → Rollback Plan; RFC / RRB; RRR Checklist; Hypercare / Production Readiness

**14 · `spend`** — What is the estimated project cost or funding range?
Options: Under $250K `s` | $250K–$1M `m` | Over $1M `l` | Unknown `u`
Drives: Biz · Financial Risk to State; tier driver. (Deliberately separate from `loe`: cost ≠ effort.)

**15 · `loe`** — What is the estimated level of effort (T-shirt size)?
Help: Sizing by estimated effort hours — separate from cost, complexity, and value. Small < 500 hrs · Medium 500–10,000 hrs · Large > 10,000 hrs.
Options: Small — under 500 hrs `s` | Medium — 500–10,000 hrs `m` | Large — over 10,000 hrs `l` | Not yet sized `u`
Drives: T-shirt size → CA-PMF profile (Mini / Standard / Large)

**16 · `eddnext`** — Is this an EDD Next project?
Help: Governance-tier driver — an EDD Next project is at least Tier 3 (Tier 4 if PAL also applies). Does not change complexity or value.
Options: No `n` | Yes `y` → flag `eddnext`
Drives: flag `eddnext`; Tier 3 floor

**17 · `coord`** — How many teams, units, or divisions need to coordinate for delivery?
Options: One team (1) `1` | A few teams or units (2–4) `2` | Several teams or divisions (5–9) `3` | Many groups across organizational lines (10+) `4`
Drives: Biz · Decision-Making Process; Biz · Interaction w/ Other Depts; Biz · Level of Authority; tier driver; method signal · team size

**18 · `vendor`** — Are vendors or contractors responsible for delivering part or all of the project?
Options: No, internal delivery only `n` | One vendor or contractor (1) `1` → flag `vendor` | A few vendors or contractors (2–4) `few` → flag `vendor` | Several vendors or contractors (5–9) `sev` → flag `vendor` | Many vendors or contractors (10+) `mlt` → flag `vendor` | Not sure `ns`
Drives: Biz · Team; tier driver; flag `vendor` → Vendor SOW & Contract Oversight

### Section 4 · PAL Determination (screen 19 — merged matrix)

**19 · PAL / CDT oversight triggers** — fields `pal_budget`, `pal_legis`, `pal_govbudget`, `pal_crit`. Full control spec in §4.1.

### Section 5 · Technical / Business Complexity (screens 20–26)

**20 · `data`** — Does the project involve sensitive, personal, confidential, regulated data, FTI, or other protected data?
Options: No `n` | Not sure `m` | Yes `y` → flag `pii`  ← "Not sure" is `m`
Drives: Tech · Security (**max**); Tech · Tolerance to Fault (**max**); tier driver; flag `pii` → Privacy Impact Assessment (PIA); Business Impact Analysis (BIA); System Security Plan (SSP) — Initial (Sections 1 & 2); Risk Assessment. Contradictions: C1, C2, C4

**21 · `deps`** — Does the project depend on other systems, integrations, interfaces, or shared data?
Options: Standalone or minimal dependencies `n` | A few dependencies (2–4) `f` | Several dependencies (5–9) `sev` | Many or critical dependencies (10+) `m` → flag `deps` | Not sure `ns`  ← here `m` means **Many**, not "not sure" — another reason codes are never normalized
Drives: Tech · Level of Integration; tier driver; flag `deps` (flag only — no artifact attached; do not invent one)

**22 · `migrate`** — Will existing data be migrated, converted, cleansed, or loaded at scale?
Options: No `n` | Yes `y` → flag `migration` | Not sure `ns`
Drives: flag `migration` → Data Migration / Conversion Plan. Contradiction: C4

**23 · `novelTech`** — How familiar is the technology to IT?
Options: Previously implemented `n` | Some new components `s` | Largely new or unproven `y` → flag `archnew` | Not sure `ns`
Drives (8): Tech · Delivery Mechanism, Hardware, Networks (L/W), New Technology Architecture, Software, Team; tier driver; flag `archnew` → Solution Architecture Document (SAD). **SAD is gated to novelTech only** — canonical decision; do not add other SAD triggers.

**24 · `novelBiz`** — How familiar is the business process or operational model to the business area?
Options: Previously implemented `n` | Some new components `s` | Largely new or unproven `y` | Not sure `ns`
Drives: Biz · Business Rules, Current Business Systems, High-Level Requirements, Impact to Business Process, Objectives; tier driver

**25 · `sec`** — Will the project require new access controls, authentication changes, or a formal security review?
Options: No `n` | Maybe `mb` → flag `security` | Yes `y` → flag `security` | Not sure `ns`  ← **Maybe raises the flag** (fail-safe by design)
Drives: Tech · Security (**max**); tier driver; flag `security` → C&A Package; ISRP; SIEM / Logging Kickoff; Vulnerability Scan & Pen Test. Contradictions: C1, C2, C3

**26 · `cloud`** — Does the project involve cloud, hosting, infrastructure, or environment changes?
Help: Artifact trigger only — does not auto-increase complexity unless other technical answers justify it. (Canonical decision; do not wire cloud into complexity.)
Options: No `n` | Yes `y` → flag `cloud` | Not sure `ns`
Drives: flag `cloud` → Cloud Architecture Diagram; Cloud Documentation; Cloud Review; TARC. Method signal · infra → Hybrid bias. Contradiction: C3

### Section 6 · Sustainment Planning (screen 27 — merged, stacked)

**27 · Testing & Support / M&O** — fields `testing`, `support`. Full control spec in §4.2.

---

## 4 · Merged-screen control specs

### 4.1 Screen 19 — PAL matrix (`pal_budget`, `pal_legis`, `pal_govbudget`, `pal_crit`)

- **Control: true matrix.** 4 rows × 3 shared columns — **No `n` / Yes `y` / Not sure `ns`** — one radio group per row. These four are the only questions in the instrument with identical option sets; that is what licenses a shared-column matrix.
- **NOT a select-all / checkbox group.** Checkboxes flatten per-trigger uncertainty: unchecked silently becomes No, and a global "Not sure" can't express *which* trigger is uncertain. Per-trigger `ns` is the actionable Stage-1 follow-up signal and must round-trip: the vector (`y`,`ns`,`n`,`n`) must be enterable, persist, and export exactly.
- **No "None" option.** Four No's = none. No cross-row validation needed.
- Screen header: *"PAL / CDT oversight triggers — answer each row."*
- Screen help (statutory anchor, must render): *PAL triggers per SAM 4819.37. Any Yes anticipates a PAL / CDT-reportable project. Advisory — the tool flags anticipated PAL status; confirm at PAL Stage 1 (SIMM 19A.2). Does not change complexity or value.*
- Row labels (keep full statutory language, as row label or expandable row help):
  1. `pal_budget` — Does the project require a budget action — a BCP (Budget Change Proposal) or Budget Revision?
  2. `pal_legis` — Is the project required by a legislative mandate, or subject to special legislative review?
  3. `pal_govbudget` — Does project initiation depend on Governor's Budget decisions?
  4. `pal_crit` — Has CDT/AIO determined the project's criticality or risk warrants CDT oversight?
- Storage: four independent fields, exactly as v01.3. The merge exists only in the DOM.

### 4.2 Screen 27 — Sustainment (stacked selects; `testing`, `support`)

- **Control: two independent selects/radio-groups stacked on one screen.** **NOT a shared-column matrix** — the rows have different option sets (5 vs 4) and forcing shared columns would corrupt codes.
- Each row keeps its own label and full option list:
  - `testing` — How will testing be performed for this project? → In-house QA / project team `inhouse` | Vendor-led testing `vendor_test` | Hybrid (vendor + in-house) `hybrid_test` | Not yet defined `tbd_test` | Not applicable (no software change) `na`
  - `support` — What is the planned post-deployment support and M&O strategy? → Internal IT operations support `internal` | Vendor-supported `vendor_sup` | Hybrid internal/vendor support `hybrid_sup` | Not yet defined / not applicable `na`
- Gating logic (already in rules; listed for validation): `testing` ≠ `na` → **Test Strategy**; `support` ≠ `na` → **Operations, Support & M&O Plan**.
- **Preserve the option asymmetry.** `testing` distinguishes `tbd_test` (fires) from `na` (suppresses); `support` folds "not yet defined" into `na` (suppresses). Do not harmonize — the fix is a v-next rules change (§9), not a presentation change.

---

## 5 · Export contract (field → allowed codes)

`name` = free-text metadata; all others exactly one code. Keys, codes, and case are frozen.

| Field | Allowed codes |
|---|---|
| name | *(free text)* |
| method | agile · waterfall · hybrid · tbd |
| scope | stable · mostly · evolving · ns |
| delivery | stages · phased · end · ns |
| custavail | through · periodic · miles · ns |
| teamavail | ded · mostly · shared · ns |
| phase | Concept · Initiate · Plan · Execute · Close |
| benefit | inc · mod · high · trans |
| mandate | n · y · **m** |
| risk | all · most · few · none · ns |
| impact | team · div · multi · public |
| pmexp | ve · sw · ne · ns |
| funding | sec · part · id · none · ns |
| newcap | n · **m** · y |
| spend | s · m · l · u |
| loe | s · m · l · u |
| eddnext | n · y |
| coord | 1 · 2 · 3 · 4 |
| vendor | n · 1 · few · sev · mlt · ns |
| pal_budget | n · y · ns |
| pal_legis | n · y · ns |
| pal_govbudget | n · y · ns |
| pal_crit | n · y · ns |
| data | n · **m** · y |
| deps | n · f · sev · **m** · ns |
| migrate | n · y · ns |
| novelTech | n · s · y · ns |
| novelBiz | n · s · y · ns |
| sec | n · mb · y · ns |
| cloud | n · y · ns |
| testing | inhouse · vendor_test · hybrid_test · tbd_test · na |
| support | internal · vendor_sup · hybrid_sup · na |

**Normalization traps — do not "clean up":**
- "Not sure" is `ns` on most fields but **`m`** on `mandate`, `newcap`, `data`. Canonical. Preserve.
- `m` means "Not sure" on those three fields but **"Many (10+)"** on `deps` and **"$250K–$1M" / "Medium"** on `spend`/`loe`. Same letter, different contracts per field.
- `mostly` appears on both `scope` and `teamavail` with different meanings. Fields are independent namespaces.
- `phase` codes are capitalized; everything else lower-case. Preserve exact case.

---

## 6 · Downstream logic map (validation reference only — the implementation is the ported `ESPMO_RULES`)

### 6.1 Value score (weights per v01.3)
| Criterion | Weight | Source |
|---|---|---|
| Strategic Alignment | 5 | benefit |
| Time / Mandate | 4 | mandate |
| Risk Management | 3 | risk |
| Customer / Stakeholder Value | 2 | impact |
| Resource Availability — People | 0.5 | pmexp |
| Resource Availability — Funding | 0.5 | funding |

Per-answer point values live in `ESPMO_RULES` — port, don't re-derive.

### 6.2 Complexity rows
**Business:** Issues ← mandate · Policies ← mandate · Time Scale ← mandate · Geography ← impact · Politics ← impact · Target Users ← impact · Visibility ← impact · Team Experience ← pmexp · Financial Risk to State ← spend · Decision-Making Process ← coord · Interaction w/ Other Depts ← coord · Level of Authority ← coord · Team ← vendor · Business Rules ← novelBiz · Current Business Systems ← novelBiz · High-Level Requirements ← novelBiz · Impact to Business Process ← novelBiz · Objectives ← novelBiz

**Technical:** Scope Management Process ← method · Standards & Methods ← method · Communications ← impact · Geography ← impact · Operations ← impact · Transaction Volume ← impact · **Tolerance to Fault ← max(impact, data)** · Team Technical Experience ← pmexp · **Security ← max(data, sec)** · Level of Integration ← deps · Delivery Mechanism ← novelTech · Hardware ← novelTech · Networks (L/W) ← novelTech · New Technology Architecture ← novelTech · Software ← novelTech · Team ← novelTech

**Max semantics:** Security and Tolerance to Fault take the max of their contributors — either source can raise the row alone. This is one design reason `data` and `sec` are separate questions; never merge them.

### 6.3 Tier
- Complexity-tier drivers: method, mandate, impact, pmexp, spend, coord, vendor, data, deps, novelTech, novelBiz, sec
- 4-tier model with V-C band thresholds — **band math lives in `ESPMO_RULES`; port unchanged**
- Floors: `eddnext = y` → at least Tier 3; Tier 4 if PAL also applies (per rules)

### 6.4 Flags → artifacts
| Flag | Raised by | Artifacts triggered |
|---|---|---|
| public | impact = public | (flag only — readout/context) |
| production | newcap = y | Rollback Plan · RFC / RRB · RRR Checklist · Hypercare / Production Readiness |
| eddnext | eddnext = y | (flag + Tier 3 floor) |
| vendor | vendor ∈ {1, few, sev, mlt} | Vendor SOW & Contract Oversight |
| pii | data = y | PIA · BIA · SSP — Initial (Sections 1 & 2) · Risk Assessment |
| deps | deps = m | (flag only) |
| migration | migrate = y | Data Migration / Conversion Plan |
| archnew | novelTech = y | Solution Architecture Document (SAD) |
| security | sec ∈ {mb, y} | C&A Package · ISRP · SIEM / Logging Kickoff · Vulnerability Scan & Pen Test |
| cloud | cloud = y | Cloud Architecture Diagram · Cloud Documentation · Cloud Review · TARC |
| — | testing ≠ na | Test Strategy |
| — | support ≠ na | Operations, Support & M&O Plan |

Phase (`phase`) gates artifact **timing** (due now vs later); the flag set gates artifact **membership**. Baseline doc set (incl. Project Schedule in baseline) lives in rules/Autogenerate — unchanged.

### 6.5 PAL
Four independent trigger fields (§4.1). Any `y` → anticipated PAL / CDT-reportable, advisory, confirm at Stage 1 (SIMM 19A.2). `ns` values surface as follow-up items in the readout exactly as v01.3 renders them.

### 6.6 Method advisory
Inputs: scope, delivery, custavail, teamavail, coord (team size), cloud (infra → Hybrid bias). Output: recommended approach, displayed **against** selected `method` (Q01). Advisory only — no effect on value, complexity, or tier. Algorithm in rules; port unchanged.

### 6.7 Contradiction checks
| Check | Members |
|---|---|
| C1 | data, sec |
| C2 | data, sec |
| C3 | sec, cloud |
| C4 | data, migrate |

C1 and C2 are **two distinct checks over the same pair** — port both; do not dedupe. Rule predicates live in `ESPMO_RULES`. Membership above is the validation surface: all four checks must remain reachable and must fire on the same code vectors as v01.3.

### 6.8 Size
`loe` → T-shirt size → CA-PMF profile (Mini / Standard / Large). Per rules.

---

## 7 · UX chrome

1. **Intro screen:** Project Name field (metadata), estimated completion time (5–10 minutes), and this line verbatim: *"Not sure is always a safe answer — it flags the item for follow-up instead of forcing a guess."*
2. **Progress:** "Section N of 6" + section names (Project Identity · Value & Priority · Size & Delivery Footprint · PAL Determination · Technical & Business Complexity · Sustainment Planning). Screen counts: 6 · 6 · 6 · 1 · 7 · 1 = 27.
3. **Help text** renders with its question (inline or expandable — but Q2's volatility-vs-novelty note and the PAL SAM anchor must be visible without extra clicks).
4. Standard toolset conventions: keyboard-navigable radio groups, no external fonts/assets, print-friendly readout, version string in header and export.

---

## 8 · Acceptance tests (all must pass before release)

| # | Test | Pass condition |
|---|---|---|
| T1 | Rules parity | `ESPMO_RULES` extracted from build == v01.3 block (diff empty / hash match) |
| T2 | Frozen baseline | 50,114-case suite runs against the rules block: 100% match. (Trivially true if T1 passes — run anyway as the tripwire) |
| T3 | UI→code sweep | Scripted pass selecting **every option on every screen** (~120 option-level assertions incl. 12 PAL cells): stored field/code matches §5 exactly |
| T4 | Export parity | The 9 named scenarios (Agile-leaning, Waterfall-leaning, Hybrid-leaning, PAL-triggering, PII, cloud, vendor, migration, EDD Next) entered through the new UI → exports byte-identical to v01.3 given the same code vectors |
| T5 | PAL uncertainty round-trip | Vector (`y`,`ns`,`n`,`n`) across the four PAL fields: enterable in the matrix, persists, exports per-field |
| T6 | Sustainment gating | testing=`na` suppresses Test Strategy; testing=`tbd_test` fires it; support=`na` suppresses M&O Plan (asymmetry intact per I8) |
| T7 | Contradiction reachability | v01.3 code vectors known to fire C1–C4 still fire them |
| T8 | Offline / no-CDN | File opened from disk with network disabled: fully functional; zero external requests; no CDN URLs present in source |
| T9 | Completeness | All 27 screens always render; no conditional hiding; all 31 fields + name present in every export |

---

## 9 · Out of scope — v-next register (do NOT implement in this release)

1. **`support` "not yet defined" split.** Today `na` on `support` covers both "not applicable" and "not yet defined," suppressing the M&O Plan — asymmetric with `testing`, where `tbd_test` fires the Test Strategy. Fix = new code + `ESPMO_RULES` change + baseline refresh. Flagged finding; ship v-next.
2. **Sustainment rows → binary.** Pending the EA-Readiness consumption answer (does EA review pull testing/support approach from the export, or re-ask it?). If it re-asks, collapse both rows to binary gates in a future rules-touching release.
3. **Any conditional branching / gated question groups.** Considered and rejected: auto-filled No's are indistinguishable from deliberate No's in the export, and the gated questions carry all four contradiction checks. Flat ask, dynamic readout.
