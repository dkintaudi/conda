import json, re, shutil, math
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter

UP="SOURCE_IDP_Security_Tasks_Templatev1.xlsx"
tasks=json.load(open('/tmp/sectasks.json'))
for t in tasks:
    t['id']=int(t['id'])
    try: t['dur']=float(t['dur'])
    except: t['dur']=0
byid={t['id']:t for t in tasks}
order=[t['id'] for t in tasks]; idx={i:k for k,i in enumerate(order)}

def parse(pred):
    o=[]
    for part in str(pred).split(','):
        p=part.strip()
        if not p: continue
        m=re.match(r'^(Ext|\d+)?\s*(FS|SS|FF)?\s*([+-]\s*\d+)?\s*d?$',p,re.I)
        if not m: continue
        o.append({'ref':m.group(1),'link':(m.group(2)or'FS').upper(),'off':int(m.group(3).replace(' ',''))if m.group(3)else 0})
    return o
for t in tasks: t['toks']=parse(t['pred'])
def level(t): return 0 if (str(t['sys']).strip().lower()=='parent rollup' or t['cat']=='Final Rollup') else 1
def child_range(t):
    i=idx[t['id']]; lv=level(t); j=i+1
    while j<len(order):
        tj=byid[order[j]]
        if tj['type']=='Rollup' and level(tj)<=lv: break
        j+=1
    if j-1>i: return (order[i+1],order[j-1])
    # empty parent: extend to end of same category run
    j=i+1
    while j<len(order) and byid[order[j]]['cat']==t['cat']: j+=1
    return (order[i+1],order[j-1]) if j-1>i else None

R0=6  # grid header row; task id -> row = R0+id. Rows 1-5 = stampable header block.
def rowOf(tid): return R0+tid

# ---------- 1) TEMPLATE output = the uploaded file, as-is ----------
shutil.copy(UP, "/tmp/out/IDP_Security_Tasks_TEMPLATE.xlsx")

# ---------- 3) CURRENT schedule, as-is ----------
shutil.copy("/tmp/current_schedule.xlsx", "/tmp/out/Current_Project_Schedule_AS-IS.xlsx")

# ---------- 2) SCHEDULE output ----------
src=openpyxl.load_workbook(UP, data_only=True)
wb=openpyxl.Workbook(); wb.remove(wb.active)
ws=wb.create_sheet("Security Schedule")

INK="1F2A38"; TEAL="12504C"; GOLD="C8973F"
hdrFill=PatternFill("solid",fgColor=INK); hdrFont=Font(name="Calibri",bold=True,color="FFFFFF",size=10)
anchFill=PatternFill("solid",fgColor="FCEFD6"); anchFont=Font(name="Calibri",bold=True,color="7A5320",size=12)
thin=Side(style="thin",color="D0D7DD"); bd=Border(left=thin,right=thin,top=thin,bottom=thin)
wrap=Alignment(vertical="top",wrap_text=True); ctr=Alignment(horizontal="center",vertical="center")
# category palette
cats=list(dict.fromkeys(t['cat'] for t in tasks))
palette=["DCEBF7","E3F0E1","FBF0DA","EFE6F5","E1F0EF","FDE8E4","EAF2D8","F3E7D2","E7ECF3","F0E4EE","E0EFEA","EDEDED"]
catcol={c:palette[i%len(palette)] for i,c in enumerate(cats)}

# --- Header block (rows 1-5) — the Autogenerator stamps into these fixed cells ---
lblF=Font(bold=True,color=TEAL,size=10)
ws["A1"]="Project Start (edit to re-base whole schedule) ▶"; ws["A1"].font=Font(bold=True,color=TEAL,size=11)
ws["B1"]="=TODAY()"; ws["B1"].fill=anchFill; ws["B1"].font=anchFont; ws["B1"].number_format="ddd, mmm d, yyyy"
# identity (stamp targets: B2 name, E2 PM)
ws["A2"]="Project"; ws["A2"].font=lblF; ws["B2"]="(from intake)"
ws["D2"]="PM"; ws["D2"].font=lblF; ws["E2"]="(from intake)"
# determinations (stamp targets: B3 security review, E3 protected data, B4 fired-by-intake)
ws["A3"]="Security review"; ws["A3"].font=lblF; ws["B3"]="(from intake)"
ws["D3"]="Protected data"; ws["D3"].font=lblF; ws["E3"]="(from intake)"
ws["A4"]="Fired by intake"; ws["A4"].font=lblF; ws["B4"]="(from intake)"
ws.merge_cells("B2:C2"); ws.merge_cells("E2:F2"); ws.merge_cells("B3:C3"); ws.merge_cells("E3:F3"); ws.merge_cells("B4:F4")
ws["A5"]=("Dates are Excel formulas off B1 — change B1 (or let the Autogenerator stamp the project start) and the whole "
          "schedule + Gantt re-base. ⚠ EXTERNAL tasks are anchored provisionally to the project start; wire them to your own "
          "project tasks. Bars are conditional formatting (recompute automatically). ◆ = milestone.")
ws["A5"].font=Font(italic=True,size=9,color="5A6472"); ws["A5"].alignment=Alignment(wrap_text=True,vertical="top")
ws.merge_cells("A5:M5")

COLS=["Task ID","Category","System / Component","Task Name","Type","Duration (days)",
      "Predecessor IDs","Predecessor (plain English)","Successor IDs","Status","Start","Finish","Notes"]
for ci,name in enumerate(COLS,1):
    c=ws.cell(R0,ci,name); c.fill=hdrFill; c.font=hdrFont; c.alignment=wrap; c.border=bd
NWEEKS=31; GC0=len(COLS)+1  # first gantt col (N=14)
for k in range(NWEEKS):
    col=GC0+k; c=ws.cell(R0,col)
    c.value="=$B$1+"+str(7*k); c.number_format="m/d"; c.fill=hdrFill; c.font=Font(bold=True,color="FFFFFF",size=8); c.alignment=ctr; c.border=bd
    ws.column_dimensions[get_column_letter(col)].width=3.4

def off_s(o): return ("+"+str(o)) if o>0 else (str(o) if o<0 else "")
for t in tasks:
    R=rowOf(t['id']); cf=catcol[t['cat']]
    ints=[k for k in t['toks'] if k['ref'] and k['ref'].isdigit()]
    hasExt=any(k['ref'] and k['ref'].lower()=='ext' for k in t['toks'])
    vals=[t['id'],t['cat'],t['sys'],t['name'],t['type'],t['dur'],t['pred'],t['predEN'],t['succ']]
    for ci,v in enumerate(vals,1):
        c=ws.cell(R,ci,v); c.border=bd; c.alignment=wrap
        if ci==2: c.fill=PatternFill("solid",fgColor=cf)
    Fcell="F%d"%R; Kcell="K%d"%R; Lcell="L%d"%R
    # Start / Finish formulas
    if t['type']=='Rollup':
        cr=child_range(t)
        if cr:
            a,b=rowOf(cr[0]),rowOf(cr[1])
            ws[Kcell]="=IF(COUNT(K{a}:K{b})=0,\"\",MIN(K{a}:K{b}))".format(a=a,b=b)
            ws[Lcell]="=IF(COUNT(L{a}:L{b})=0,\"\",MAX(L{a}:L{b}))".format(a=a,b=b)
        else:
            ws[Kcell]=""; ws[Lcell]=""
        status=""
    else:
        if ints:
            terms=[]
            for k in ints:
                pr=rowOf(int(k['ref']))
                if k['link']=='SS': terms.append("K%d%s"%(pr,off_s(k['off'])))
                elif k['link']=='FF': terms.append("L%d%s-%s"%(pr,off_s(k['off']),Fcell))
                else: terms.append("L%d%s"%(pr,off_s(k['off'])))
            ws[Kcell]="=IFERROR(MAX(%s),\"\")"%(",".join(terms))
            status="⚠ Mixed — internal-dated; external leg may push start later" if hasExt else ""
        else:
            # Ext-only -> provisional anchor at project start
            ws[Kcell]="=$B$1"
            status="⚠ EXTERNAL — provisional from project start; wire to your project task"
        if t['type']=='Milestone':
            ws[Lcell]="="+Kcell
        else:
            ws[Lcell]="=IF({K}=\"\",\"\",{K}+{F})".format(K=Kcell,F=Fcell)
    ws.cell(R,10,status)
    for cc in (11,12): ws.cell(R,cc).number_format="mmm d"; ws.cell(R,cc).border=bd
    ws.cell(R,10).border=bd; ws.cell(R,10).alignment=wrap; ws.cell(R,10).font=Font(size=9,color="7A5320")
    ws.cell(R,13,t['notes']).border=bd; ws.cell(R,13).alignment=wrap
    # gantt cells border
    for k in range(NWEEKS): ws.cell(R,GC0+k).border=bd
    if t['type']=='Rollup':
        for ci in range(1,14):
            cell=ws.cell(R,ci); cell.font=Font(bold=True,color=INK,size=10)
            if ci!=2: cell.fill=PatternFill("solid",fgColor="EDEFF2")

# widths
w={1:7,2:20,3:20,4:38,5:9,6:8,7:16,8:30,9:12,10:26,11:11,12:11,13:34}
for c,wd in w.items(): ws.column_dimensions[get_column_letter(c)].width=wd
ws.freeze_panes="A"+str(R0+1)  # freeze header rows
ws.auto_filter.ref="A{r}:M{last}".format(r=R0,last=R0+len(tasks))
ws.row_dimensions[5].height=42

# ---- Conditional-formatting Gantt ----
lastrow=R0+len(tasks); firstcol=get_column_letter(GC0); lastcol=get_column_letter(GC0+NWEEKS-1)
rng="{fc}{r}:{lc}{lr}".format(fc=firstcol,r=R0+1,lc=lastcol,lr=lastrow)
# milestone rule first (distinct color), stop if true
ms=PatternFill("solid",fgColor="B23A48")
work=PatternFill("solid",fgColor="2E7D5B")
tl=firstcol+str(R0+1)  # top-left N4
f_ms ='AND($E{r}="Milestone",$K{r}<>"",{c}$3<=$L{r},{c}$3+6>=$K{r})'.format(r=R0+1,c=firstcol)
f_bar='AND($K{r}<>"",$L{r}<>"",$E{r}<>"Rollup",{c}$3+6>=$K{r},{c}$3<=$L{r})'.format(r=R0+1,c=firstcol)
f_rup='AND($E{r}="Rollup",$K{r}<>"",$L{r}<>"",{c}$3+6>=$K{r},{c}$3<=$L{r})'.format(r=R0+1,c=firstcol)
rup=PatternFill("solid",fgColor="9AA7B4")
ws.conditional_formatting.add(rng, FormulaRule(formula=[f_ms], fill=ms, stopIfTrue=True))
ws.conditional_formatting.add(rng, FormulaRule(formula=[f_rup], fill=rup, stopIfTrue=True))
ws.conditional_formatting.add(rng, FormulaRule(formula=[f_bar], fill=work))

# ---- copy reference sheets (values) ----
for sn in ["Abbreviations","How to Use"]:
    s=src[sn]; d=wb.create_sheet(sn)
    for r in s.iter_rows(values_only=True):
        d.append(list(r))
    for i,row in enumerate(d.iter_rows(),1):
        for c in row:
            c.alignment=Alignment(wrap_text=True,vertical="top")
            if i==1: c.font=Font(bold=True,color="FFFFFF"); c.fill=hdrFill
    d.column_dimensions['A'].width=26; d.column_dimensions['B'].width=80
    d.freeze_panes="A2"

wb.save("/tmp/out/IDP_Security_Tasks_SCHEDULE.xlsx")
print("built:")
import os
for f in sorted(os.listdir("/tmp/out")): print("  ",f, os.path.getsize("/tmp/out/"+f),"bytes")
