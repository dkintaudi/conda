# Fidelity & Coverage — Use of the EDD T-Shirt Size / Template Breakdown
### in the ESPMO Project Profiler

**Date:** July 1, 2026  
**Prepared by:** _ESPMO_  
**Source document:** EDD *T-Shirt Size / Template Breakdown* (sheets: T-SHIRT SZ BRKDWN · AGILE&WATERFALL · mast_data)  
**Author of source:** _[T-Shirt Breakdown author]_ — per-template comments (the “Jeff’s Comments” column) attributed and preserved

---

## 1. Purpose

This memo documents, for the author of the T-Shirt Size / Template Breakdown, exactly how their document was used in the Project Profiler. It is written to be **fair in two directions at once**: it preserves the existing ESPMO document design a delivery **schedule is already built on**, and it reproduces the author’s required/optional matrix **in full and without alteration**.

## 2. Fidelity — the matrix is reproduced cell-for-cell

The Profiler embeds the author’s matrix as data and drives the tool from it. An automated check (`rules-gen/verify_fidelity.py`) compares the embedded matrix against the author’s workbook on every build:

| Check | Result |
|---|---|
| Templates in source vs. tool | **56 / 56** matched |
| Cell-for-cell differences (5 profiles × 56 rows) | **0** |
| Author’s per-template comments preserved | **44 / 44** |
| PAL Required/Optional | **23 / 25** (identical) |
| Hybrid-Agile Required/Optional | **11 / 31** (identical) |
| Waterfall Large Required/Optional | **23 / 25** (identical) |
| Waterfall Medium Required/Optional | **12 / 28** (identical) |
| Waterfall Small Required/Optional | **4 / 25** (identical) |

*Nothing was dropped, added, or reweighted. The result is verifiable at any time by re-running the check.*

## 3. How the document is utilized

- **Single source of truth.** The full matrix lives in the Profiler’s rules block (`ESPMO_RULES.tshirt`) and in the reference Rules workbook (`Tshirt_Templates` sheet).
- **Profile selection.** Each project maps to one of the author’s five columns — chosen **PAL → delivery approach → Waterfall T-shirt size** — and the tool reads that column’s Required/Optional exactly as the author set them.
- **On screen.** Required and Optional templates for the profile appear in click-to-open sections; the author’s comments show as notes. The source document is credited in the panel.
- **Author’s comments.** All **44** per-template comments are carried into the Profiler and shown in the workbook export’s *Note (author)* column.
- **Autogenerator.** The author’s `mast_data` SharePoint paths were registered for **51** templates in `template-paths.xlsx`, so the generator resolves the real EDD files.
- **Export.** The workbook’s *CA-PMF Templates* sheet exports the complete Required + Optional set with owner, phase, file, SharePoint path, and author note.

## 4. Fairness to the existing design (the schedule)

The prior ESPMO core document set — Charter, Project Management Plan, Governance Plan, Stakeholder Register, CRAID, and RTM (the **9** core items also present in the author’s matrix) — remains the default on-screen view, so the schedule built on it is unaffected. The author’s fuller required/optional set is added on top, collapsed by default so a reader isn’t overwhelmed. **Collapsing is display-only — the complete set is always exported.**

## 5. Complete crosswalk (all 56 templates)

Legend: **R** = Required, **o** = optional/recommended, **·** = not needed. ★ marks a core document already in the main panel. ✓ = SharePoint path registered for Autogenerate.

| Template | Phase | PAL | H-A | WF-L | WF-M | WF-S | ★ | Path | Author note |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| Concept Development and Readiness Assessment | Concept | R | R | R | · | · |  | ✓ | Replaced by EDD Work Intake process |
| Concept Process Phase Checklist | Concept | o | · | R | · | · |  | ✓ |  |
| Hybrid-Agile Project Charter *(to build)* | Initiation | · | R | · | · | · | ★ | to build | New template to be created for Hybrid-Agile only |
| Initiating Process Phase Checklist | Initiation | o | · | · | · | · |  | ✓ |  |
| Project Charter | Initiation | R | · | R | · | · | ★ | ✓ | Required for PAL Projects |
| Project Charter Mini | Initiation | · | · | · | R | R | ★ | ✓ |  |
| Project Document Approval | Initiation | o | o | o | · | · |  | ✓ | Only needed for a project that needs formal document or deli… |
| Project Priorities | Initiation | o | o | o | o | o |  | ✓ | Optional template |
| RACI Matrix | Initiation | R | R | R | R | · |  | ✓ | CA-PMF template should be for PAL projects only (USE NEW VER… |
| RACI Matrix Mini | Initiation | · | · | R | R | · |  | ✓ | CA-PMF template should be for PAL projects only (USE NEW VER… |
| Stakeholder Register | Initiation | R | R | R | R | o | ★ | ✓ | Recommended for all sizes of projects but only required for … |
| Agile-Hybrid Project Management Plan *(to build)* | Planning | · | R | · | · | · | ★ | to build | New template to be created for Hybrid-Agile only |
| Change Control Management Plan | Planning | R | o | R | o | · |  | ✓ | Required for large, recommended for medium |
| Change Request Form | Planning | R | o | R | o | · |  | ✓ | Required for large, recommended for medium |
| Change Request Log | Planning | o | o | R | o | · |  | ✓ | Required for large and medium |
| Communications Management Plan | Planning | R | o | R | o | · |  | ✓ | Required for large, recommended for medium |
| Contract Management Plan | Planning | R | o | o | o | o |  | ✓ | Optional for any size project except PAL |
| Corrective Action Plan | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Cost Management Plan | Planning | R | o | o | o | o |  | ✓ | Optional for any size project except PAL |
| Governance Management Plan | Planning | R | o | o | o | o | ★ | ✓ | Optional for any size project except PAL |
| Hybrid-Agile Product Roadmap *(to build)* | Planning | · | R | · | · | · |  | to build | New template to be created for Hybrid-Agile only |
| Implementation Management Plan | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Issue Log | Planning | R | o | R | R | · |  | ✓ |  |
| Issue Management Plan | Planning | R | o | R | R | · |  | ✓ |  |
| Maintenance and Operations Transition Management Plan | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Meeting Agenda and Minutes | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Planning Process Phase Checklist | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Procurement Management Plan | Planning | R | o | o | o | o |  | ✓ | Optional for any size project |
| Product Backlog for Hybrid-Agile projects *(to build)* | Planning | · | R | · | · | · |  | to build | New template to be created for Hybrid-Agile only |
| Project Management Plan PMP | Planning | · | · | R | · | · | ★ | ✓ |  |
| Project Management Plan PMP Mini | Planning | · | · | · | R | · | ★ | ✓ |  |
| Project Org Chart | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Quality Management Plan | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Requirements Management Plan | Planning | R | · | R | · | · |  | ✓ | Recommended for all sizes of projects but only required for … |
| Requirements Traceability Matrix | Planning | R | · | R | · | · | ★ | ✓ | Recommended for all sizes of projects but only required for … |
| Resource Management Plan | Planning | R | o | o | o | o |  | ✓ | Optional for any size project except PAL |
| Risk Management Plan | Planning | R | R | R | R | · |  | ✓ |  |
| Risk Register | Planning | R | R | R | R | · |  | ✓ |  |
| Schedule Management Plan | Planning | R | · | R | R | R |  | ✓ | Required for large T-Shirt size but recommended for all size… |
| Scope Management | Planning | o | · | R | · | · |  | ✓ |  |
| Scope Management Plan | Planning | R | · | R | · | · |  | ✓ |  |
| Skills Assessment | Planning | o | o | o | o | o |  | ✓ | Optional for any size project |
| Stakeholder Management Plan | Planning | R | R | R | R | R |  | ✓ | Required for large & medium but recommended for all sizes |
| WBS | Planning | o | · | R | · | · |  | ✓ | Recommended for Waterfall large T-shirt |
| Deliverable Expectation Document | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Executing Process Phase Checklist | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Formal Product Acceptance | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Operational Readiness Assessment ORA | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Process Improvement Plan | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Sponsorship Commitment Survey | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Team Effectiveness Survey | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Work Authorization | Execution | o | o | o | o | o |  | ✓ | Optional for any size project |
| Closing Process Phase Checklist | Close | o | o | o | o | o |  | ✓ | Optional for any size project |
| Lessons Learned | Close | R | · | · | · | · |  | ✓ | We have a new template covering this category, now managed b… |
| Project Closeout Report | Close | R | o | o | o | o |  | ✓ | Optional for any size project |
| Retrospective (Lessons Learned) *(to build)* | Close | o | R | R | R | R |  | to build |  |

## 6. Author acknowledgement

> I have reviewed how the T-Shirt Size / Template Breakdown was used in the ESPMO Project Profiler. My document was understood, represented fairly, and utilized — reproduced in full with my per-template comments preserved.

Author: ____________________________   Signature: ____________________________   Date: ____________

---

*Re-verify anytime:* `python3 rules-gen/verify_fidelity.py` — 0 differences = full fidelity.
