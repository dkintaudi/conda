import json, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

D=json.load(open('/tmp/rules_dump.json'))
R=D['rules']; VM=D['valueModel']; QN=D['qnum']

wb=openpyxl.Workbook(); wb.remove(wb.active)

INK="1F2A38"; ACCENT="12504C"; GOLD="C8973F"; BROWN="7A5230"
band=PatternFill("solid",fgColor=ACCENT); sect=PatternFill("solid",fgColor="E8EEF0")
palfill=PatternFill("solid",fgColor="FBF4EC")
hdrF=Font(name="Calibri",bold=True,color="FFFFFF",size=11)
sectF=Font(name="Calibri",bold=True,color=ACCENT,size=11)
cellF=Font(name="Calibri",color=INK,size=10)
wrap=Alignment(vertical="top",wrap_text=True); top=Alignment(vertical="top")
thin=Side(style="thin",color="C9D2D6"); bd=Border(left=thin,right=thin,top=thin,bottom=thin)

def sheet(name):
    ws=wb.create_sheet(name); return ws
def band_row(ws,text,ncol):
    ws.append([text]+[""]*(ncol-1))
    ws.merge_cells(start_row=ws.max_row,start_column=1,end_row=ws.max_row,end_column=ncol)
    c=ws.cell(ws.max_row,1); c.fill=band; c.font=hdrF; c.alignment=Alignment(vertical="center"); ws.row_dimensions[ws.max_row].height=18
def hdr(ws,cols):
    ws.append(cols)
    for i in range(1,len(cols)+1):
        c=ws.cell(ws.max_row,i); c.fill=PatternFill("solid",fgColor=INK); c.font=hdrF; c.alignment=wrap; c.border=bd
def datarow(ws,vals):
    ws.append(vals)
    for i in range(1,len(vals)+1):
        c=ws.cell(ws.max_row,i); c.font=cellF; c.alignment=wrap; c.border=bd
def widths(ws,ws_w):
    for i,w in enumerate(ws_w,1): ws.column_dimensions[get_column_letter(i)].width=w

# ---------- _meta ----------
ws=sheet("_meta"); band_row(ws,"EDD · ESPMO · GOVERNANCE RULES (round-trip schema)",2)
meta=[("Description","Regenerated FROM the live Profiler ESPMO_RULES block — questions, scoring, triggers, and the PAL calculation all derive from the same source, so the tool and this workbook cannot drift."),
 ("schema","RT-1.1"),("rulesVersion","01.04"),("generatedFrom","Profiler ESPMO_RULES (32 questions, weighted value model, ESPMO_RULES.pal, ESPMO_RULES.tshirt)"),
 ("zoneThreshold",R['scoring']['zoneThreshold']),("value.model","weighted 0/1/3/9 drivers, normalized to 100 (Σ weight×value / "+str(D['valueMax'])+" × 100)"),
 ("value.weightSum",D['valueWsum']),("value.max",D['valueMax']),
 ("pal.spec",R['pal']['spec']),("pal.palTier",R['pal']['palTier']),
 ("pal.config.EDD_COST_DELEGATION",str(R['pal']['config']['EDD_COST_DELEGATION'])),
 ("pal.config.COST_KNOWN",str(R['pal']['config']['COST_KNOWN'])),
 ("govTier.palTier",R['scoring'].get('govTier',{}).get('palTier',4)),
 ("govTier.eddnextFloor",R['scoring'].get('govTier',{}).get('eddnextFloor',3))]
for k,v in meta: datarow(ws,[k,v])
widths(ws,[26,90])

# ---------- Questions ----------
ws=sheet("Questions"); band_row(ws,"Intake questions — one row per question (options packed label|value|flag)",6)
hdr(ws,["Q#","id","group","type","question","options (label|value|flag ; …)  /  help"])
for q in R['questions']:
    opts=""
    if q.get('o'):
        opts=" ; ".join("|".join([o['l'],o['v']]+([o['f']] if o.get('f') else [])) for o in q['o'])
    qn=("Q%02d"%QN[q['id']]) if q['id'] in QN else "—"
    datarow(ws,[qn,q['id'],q.get('g',''),q.get('type','select'),q.get('t',''),opts])
    datarow(ws,["","","","","help ▸",q.get('h','')])
widths(ws,[6,14,26,8,50,60])

# ---------- Value (weighted model) ----------
ws=sheet("Value"); band_row(ws,"Value scoring — weighted 0/1/3/9 prioritization drivers (normalized to 100)",5)
datarow(ws,["Total value = round( Σ (weight × selected 0/1/3/9 value) / "+str(D['valueMax'])+" × 100 ).  Σ weights = "+str(D['valueWsum'])+".","","","",""])
hdr(ws,["criterion","weight","source question","% share of value","value map (answer → 0/1/3/9)"])
for c in VM:
    share=round(c['w']/D['valueWsum']*100,1)
    vm=", ".join("%s→%s"%(k,v) for k,v in c['map'].items())
    datarow(ws,[c['label'],c['w'],c['src'],share,vm])
widths(ws,[34,8,16,14,52])

# ---------- Value_Score_Responses ----------
ws=sheet("Value_Score_Responses"); band_row(ws,"Value scoring — per-response points (0/1/3/9) and weighted contribution",6)
hdr(ws,["criterion","weight","source question","answer value","0/1/3/9","weighted contribution to 100"])
for c in VM:
    for k,v in c['map'].items():
        contrib=round(c['w']*v/D['valueMax']*100,2)
        datarow(ws,[c['label'],c['w'],c['src'],k,v,contrib])
widths(ws,[34,8,16,14,10,26])

# ---------- RatingMaps ----------
ws=sheet("RatingMaps"); band_row(ws,"Rating maps — shared 0–4 answer scales feeding SIMM complexity",3)
hdr(ws,["map","answer","score"])
for m,mp in R['scoring']['ratingMaps'].items():
    for a,s in mp.items(): datarow(ws,[m,a,s])
widths(ws,[20,12,10])

# ---------- SIMM_Biz / SIMM_Tech ----------
def simm(name,title,arr):
    ws=sheet(name); band_row(ws,title,3)
    hdr(ws,["factor","source question","score map"])
    for f in arr:
        if 'max' in f:
            mp="MAX of "+"; ".join("%s:%s"%(p[0], p[1] if isinstance(p[1],str) else json.dumps(p[1])) for p in f['max'])
            datarow(ws,[f['a'],"(max)",mp])
        else:
            mp=f['map'] if isinstance(f['map'],str) else json.dumps(f['map'])
            datarow(ws,[f['a'],f.get('src',''),mp])
    widths(ws,[30,16,44])
simm("SIMM_Biz","SIMM business complexity axis",R['scoring']['simmBiz'])
simm("SIMM_Tech","SIMM technical complexity axis",R['scoring']['simmTech'])

# ---------- Triggers ----------
ws=sheet("Triggers"); band_row(ws,"Triggers → documents (flag origin pulls each document in)",5)
hdr(ws,["origin (flag)","document","category","phase","note"])
T=R['triggers']
for grp in ['baseline','tier2','tier3']:
    for d0 in T.get(grp,[]): datarow(ws,[grp,d0['nm'],d0.get('cat',''),d0.get('ph',''),""])
for meth in ['predictive','agile']:
    for d0 in T.get('method',{}).get(meth,[]): datarow(ws,["method:"+meth,d0['nm'],d0.get('cat',''),d0.get('ph',''),""])
for fk,fv in T.get('flags',{}).items():
    for d0 in fv.get('docs',[]): datarow(ws,["flag:"+fk,d0['nm'],d0.get('cat',''),d0.get('ph',''),fv.get('origin','')])
widths(ws,[18,44,22,14,22])

# ---------- TierQuestionIds ----------
ws=sheet("TierQuestionIds"); band_row(ws,"Tier-driving question ids (high answers can push the complexity tier)",1)
hdr(ws,["question id"])
for q in R['tierQuestionIds']: datarow(ws,[q])
widths(ws,[24])

# ---------- PAL_Determination (the alignment sheet) ----------
P=R['pal']
ws=sheet("PAL_Determination"); band_row(ws,"PAL Determination — "+P['spec']+"  (how the Profiler calculates PAL)",5)
datarow(ws,["This is the exact rule the Profiler runs (ESPMO_RULES.pal). PAL rolls up to a separate governance tier (Tier "+str(P['palTier'])+") above Full.","","","",""])
ws.append([]); 
ws.append(["Decision rule"]); ws.cell(ws.max_row,1).font=sectF; ws.cell(ws.max_row,1).fill=sect
for k in ['pal','indeterminate','regular']:
    datarow(ws,[k.upper(),P['rule'][k],"→ status:",P['status'][k],""])
ws.append([])
ws.append(["Cost trigger configuration (SIMM 15A / delegation agreement)"]); ws.cell(ws.max_row,1).font=sectF; ws.cell(ws.max_row,1).fill=sect
datarow(ws,["EDD_COST_DELEGATION",str(P['config']['EDD_COST_DELEGATION']),"COST_KNOWN",str(P['config']['COST_KNOWN']),"While COST_KNOWN is false the cost trigger returns UNKNOWN → INDETERMINATE when triggers 2–5 are all No."])
ws.append([])
ws.append(["Triggers (any Yes ⇒ PAL)"]); ws.cell(ws.max_row,1).font=sectF; ws.cell(ws.max_row,1).fill=sect
hdr(ws,["#","trigger key","source question id","Yes value","label / meaning"])
for i,t in enumerate(P['triggers'],1):
    qtext = t['q'] if t.get('q') else "(cost vs. delegation tier — config)"
    datarow(ws,[i,t['key'],qtext,t.get('yes','—'),t['label']])
ws.append([])
datarow(ws,["Disclaimer",P['disclaimer'],"","",""])
datarow(ws,["Anti-splitting (SAM 4819.37)","Do not split scope or cost to stay under the delegation line.","","",""])
widths(ws,[6,30,26,12,60])
for r in range(1,ws.max_row+1):
    ws.cell(r,1).alignment=top

# ---------- Tshirt_Templates (CA-PMF matrix; aligned with ESPMO_RULES.tshirt) ----------
TS=R.get('tshirt',{}).get('templates',[])
ws=sheet("Tshirt_Templates"); band_row(ws,"CA-PMF T-shirt template matrix — Required (R) / Recommended (O) per profile",11)
datarow(ws,["Profile column chosen PAL \u2192 delivery approach \u2192 Waterfall T-shirt size. R = Required, O = Recommended/optional, blank = not needed.","","","","","","","","","",""])
hdr(ws,["template","file","phase","owner","PAL","Hybrid-Agile","WF-Large","WF-Medium","WF-Small","SharePoint path","note"])
for t in TS:
    datarow(ws,[t.get('name',''),t.get('file','') or '(to build)',t.get('phase',''),t.get('resp',''),
                t.get('pal',''),t.get('hyb',''),t.get('wl',''),t.get('wm',''),t.get('ws',''),
                t.get('path',''),t.get('note','')])
widths(ws,[34,42,14,8,6,12,9,10,9,46,40])

# freeze header-ish rows and save
out="/tmp/ESPMO-Rules-v01.04.xlsx"
wb.save(out)
print("saved",out,"sheets:",wb.sheetnames)
