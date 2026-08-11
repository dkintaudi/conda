# ESPMO Rules workbook — regeneration

The reference **Rules workbook** (`ESPMO-Rules-v01.03.xlsx`) is generated *from* the
Profiler's published rules block so the tool and the spreadsheet cannot drift.

Source of truth: `ESPMO_RULES` (between `ESPMO_RULES_START/END`) inside
`../Project-Profiler.html`. The PAL calculation lives in `ESPMO_RULES.pal` and is
consumed at runtime by `determinePAL()` — the same block the workbook's
`PAL_Determination` sheet is built from.

## Regenerate

```bash
# 1) dump the live rules (needs jsdom): writes /tmp/rules_dump.json
node dump_rules_full.js

# 2) build the workbook (needs python openpyxl): writes /tmp/ESPMO-Rules-v01.03.xlsx
python3 gen_rules_wb.py
```

## Verify alignment

`verify_pal.js` exercises `determinePAL()` end-to-end (five SAM 4819.37 triggers,
cost UNKNOWN → INDETERMINATE, any trigger → PAL → governance Tier 4).

## Sheets

`_meta · Questions · Value · Value_Score_Responses · RatingMaps · SIMM_Biz ·
SIMM_Tech · Triggers · TierQuestionIds · PAL_Determination · Tshirt_Templates`

## CA-PMF T-shirt template matrix

`ESPMO_RULES.tshirt` holds the authoritative EDD/CA-PMF template catalog + the
Required/Recommended matrix per profile (source: `EDD_TSHIRT_SZ_BREAKDOWN.xlsx`,
the "T-SHIRT SZ BRKDWN" + "mast_data" sheets). The Profiler picks ONE profile
column per project — **PAL → delivery approach → Waterfall T-shirt size** — via
`tshirtProfile()` / `tshirtDocs()`, renders it in the "CA-PMF template set" panel,
and writes it to the workbook's "CA-PMF Templates" sheet. The `Tshirt_Templates`
sheet in the Rules workbook mirrors the same matrix. `mast_data`'s SharePoint
paths also feed the Autogenerator's `template-paths.xlsx` (folders + 51 files) so
the generator can resolve the real templates. `verify_tshirt.js` checks the
profile mapping and the Required/Recommended counts per column.

The `PAL_Determination` sheet documents the exact rule: config
(`EDD_COST_DELEGATION` / `COST_KNOWN`), the five triggers with their source
question ids and Yes values, the decision rule (any Yes ⇒ PAL, else any Unknown ⇒
Indeterminate, else Regular), the resulting status strings, and that anticipated
PAL rolls up to a separate governance tier (Tier 4) above Full.
