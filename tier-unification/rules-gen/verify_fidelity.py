#!/usr/bin/env python3
"""Fidelity check: the Profiler's embedded CA-PMF matrix must reproduce the author's
EDD T-Shirt Size / Template Breakdown cell-for-cell, with the author's per-template
comments preserved. Proves the source document was used faithfully — nothing dropped,
added, or reweighted. Re-run after any change to the matrix.

Deps: openpyxl.  Usage: python3 verify_fidelity.py
"""
import openpyxl, json, re, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(BASE, '..', 'Project-Profiler.html')
WB   = os.path.join(BASE, 'EDD_TSHIRT_SZ_BREAKDOWN.xlsx')

def cell(v):
    if v is True: return "R"
    if isinstance(v, str) and v.strip().upper().startswith("TRUE"): return "O"
    return ""

# --- author's source workbook ---
wb = openpyxl.load_workbook(WB, data_only=True)
rows = list(wb['T-SHIRT SZ BRKDWN'].iter_rows(values_only=True))
src = []
for r in rows[3:]:
    if not r[1] or not str(r[1]).strip():
        continue
    name = str(r[1]).strip().replace('Conc+B3:B49ept', 'Concept')
    src.append({"name": name, "pal": cell(r[2]), "hyb": cell(r[3]),
                "wl": cell(r[4]), "wm": cell(r[5]), "ws": cell(r[6]),
                "note": (str(r[7]).strip() if r[7] and str(r[7]).strip() else "")})

# --- profiler's embedded matrix (ESPMO_RULES.tshirt) ---
html = open(HTML, encoding='utf-8').read()
i = html.index('"tshirt":'); j = html.index(',"scoring":{"ratingMaps"', i)
templates = json.loads(html[i + len('"tshirt":'):j])['templates']

def key(n): return re.sub(r'\.(docx|xlsx|pptx)$', '', str(n)).replace('Conc+B3:B49ept', 'Concept').strip().lower()
emb = {key(t['file'] or t['name']): t for t in templates}

diffs, matched, notes_total, notes_kept = [], 0, 0, 0
for s in src:
    e = emb.get(key(s['name']))
    if not e:
        diffs.append("MISSING in tool: " + s['name']); continue
    matched += 1
    for col in ('pal', 'hyb', 'wl', 'wm', 'ws'):
        if s[col] != e[col]:
            diffs.append("cell %s @ %s: source=%r tool=%r" % (col, s['name'], s[col], e[col]))
    if s['note']:
        notes_total += 1
        if e.get('note'): notes_kept += 1
        else: diffs.append("author note dropped: " + s['name'])

cols = ('pal', 'hyb', 'wl', 'wm', 'ws')
sc = {c: (sum(1 for x in src if x[c] == 'R'), sum(1 for x in src if x[c] == 'O')) for c in cols}
ec = {c: (sum(1 for x in templates if x[c] == 'R'), sum(1 for x in templates if x[c] == 'O')) for c in cols}

print("Fidelity — Profiler CA-PMF matrix vs. author's T-Shirt Size / Template Breakdown\n")
print("  source templates : %d" % len(src))
print("  embedded templates: %d" % len(templates))
print("  matched          : %d" % matched)
print("  author comments preserved: %d / %d" % (notes_kept, notes_total))
print("  profile Required/Optional counts (source vs tool):")
for c in cols:
    print("    %-4s source=%s tool=%s  %s" % (c, sc[c], ec[c], "OK" if sc[c] == ec[c] else "MISMATCH"))
counts_ok = all(sc[c] == ec[c] for c in cols)
print("\n  cell-for-cell differences: %d" % len(diffs))
for d in diffs[:30]:
    print("    -", d)

ok = (len(diffs) == 0 and matched == len(src) == len(templates) and counts_ok and notes_kept == notes_total)
print("\n" + ("FIDELITY VERIFIED — the author's document is reproduced in full." if ok else "FIDELITY FAILED"))
sys.exit(0 if ok else 1)
