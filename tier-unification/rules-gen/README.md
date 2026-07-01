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
SIMM_Tech · Triggers · TierQuestionIds · PAL_Determination`

The `PAL_Determination` sheet documents the exact rule: config
(`EDD_COST_DELEGATION` / `COST_KNOWN`), the five triggers with their source
question ids and Yes values, the decision rule (any Yes ⇒ PAL, else any Unknown ⇒
Indeterminate, else Regular), the resulting status strings, and that anticipated
PAL rolls up to a separate governance tier (Tier 4) above Full.
