# IDP Security Tasks — Template + Schedule (one build)

Three files, one normalized 124-row model:

1. **IDP_Security_Tasks_TEMPLATE.xlsx** — the reusable library (from your upload,
   unchanged): 124 rows, durations, predecessors verbatim (internal IDs + Ext +
   FS/SS/FF offsets), **no dates**. AutoFilter + freeze + Abbreviations/How-to.

2. **IDP_Security_Tasks_SCHEDULE.xlsx** — same 124 rows PLUS Start/Finish/Status
   as **Excel formulas** off one editable anchor (**B1 = =TODAY()**), plus a
   **31-week Gantt** drawn with conditional formatting (bars/◆ milestones/rollup
   bars recompute when B1 or any duration changes). Change B1 to re-base the whole
   plan. Category-colored. Reference sheets carried over.

3. **Current_Project_Schedule_AS-IS.xlsx** — the existing ESPMO project schedule
   template, untouched.

## Ext handling (important)
Every dependency chain in this model roots in an **external** task, so "leave Ext
blank" would leave the whole schedule empty. Instead, Ext-only tasks are anchored
**provisionally to the project start (B1)** and flagged in **Status**
`⚠ EXTERNAL — wire to your project task`. Mixed tasks (internal + Ext) are dated
from their internal legs and flagged `⚠ Mixed — external leg may push start later`.
Wire the Ext legs to your own project tasks to firm up those dates.
(If you want the strict spec behavior — Ext-only left blank — say so and I'll flip it.)

## Verified
- 248/248 Start/Finish formulas evaluate with 0 errors / 0 mismatches vs. an
  independent forward-pass model. Rollups span their children (MIN/MAX). 20 Ext/
  mixed tasks flagged. Template carries no dates; schedule carries dates + Gantt.
