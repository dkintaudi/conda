const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
const Q=w.ESPMO_RULES.questions;
const S=w.eval('state');  // live reference to the profiler's real state object
const MC='Project_Charter_Mini_Template_with_Instructions.docx', GV='Governance_Management_Plan_Template_with_Instructions.docx';
const COLS=new Set(['pal','hyb','wl','wm','ws']);
const METHODS=new Set(['Waterfall','Agile','Hybrid']);
const TIERS=new Set(['Mini','Standard','Large','PAL']);
const ZONES=new Set(['I','II','III','IV']); const CRIT=new Set(['Low','Medium','High']);
const PKIND=new Set(['pal','indeterminate','regular']);

const fails=[]; const rec=(msg,st)=>{ if(fails.length<20) fails.push(msg+'  state='+JSON.stringify(st)); };
function randState(){
  Object.keys(S).forEach(k=>delete S[k]);              // clear the real state
  Q.forEach(q=>{ if(q.type==='text'){ if(Math.random()<0.5)S[q.id]='X'; return; }
    if(q.o){ if(Math.random()<0.10) return; S[q.id]=q.o[(Math.random()*q.o.length)|0].v; } });
  return S;
}
function check(){
  const st=randState();
  let r,pal,rm,td,v;
  try{
    v=w.computeValue();
    r=w._recompute();
    pal=w.determinePAL();
    rm=w.recommendMethod();
    td=w.tshirtDocs(r.flags);
  }catch(e){ rec('THREW: '+e.message, st); return; }
  // value
  if(!Number.isInteger(v)||v<0||v>100) rec('value oob '+v, st);
  if(r.value!==v) rec('value mismatch '+r.value+'/'+v, st);
  // complexity
  if(!(r.bizCx>=0&&r.bizCx<=4)) rec('bizCx oob '+r.bizCx, st);
  if(!(r.techCx>=0&&r.techCx<=4)) rec('techCx oob '+r.techCx, st);
  if(!ZONES.has(r.zone)) rec('zone bad '+r.zone, st);
  if(!CRIT.has(r.crit)) rec('crit bad '+r.crit, st);
  if(![1,2,3,4].includes(r.govTier)) rec('govTier bad '+r.govTier, st);
  if(!Number.isFinite(r.vc)) rec('vc not finite', st);
  // PAL
  if(!PKIND.has(pal.kind)) rec('pal.kind bad '+pal.kind, st);
  if(pal.anticipated!==(pal.kind==='pal')) rec('pal.anticipated mismatch', st);
  if((r.govTier===4)!==pal.anticipated) rec('govTier4/pal mismatch', st);
  const anyTrig=Object.values(pal.triggers).some(x=>x===true);
  if(anyTrig&&pal.kind!=='pal') rec('trigger true but not pal', st);
  // method rec
  if(!['Agile','Waterfall','Hybrid'].includes(rm.rec)) rec('rec bad '+rm.rec, st);
  if(typeof rm.recFull!=='string'||!rm.recFull) rec('recFull bad', st);
  // tshirt
  const p=td.profile;
  if(!COLS.has(p.col)) rec('col bad '+p.col, st);
  if(!TIERS.has(p.tier)) rec('tier bad '+p.tier, st);
  if(!METHODS.has(p.method)) rec('method bad '+p.method, st);
  const expLabel = p.col==='pal' ? 'PAL' : (p.method+' · '+p.tier);
  if(p.label!==expLabel) rec('label bad "'+p.label+'" exp "'+expLabel+'"', st);
  if(!Array.isArray(td.required)||!Array.isArray(td.recommended)) rec('td arrays bad', st);
  // disjoint required/recommended by file||name
  const key=t=>t.file||t.name;
  const rset=new Set(td.required.map(key));
  if(td.recommended.some(t=>rset.has(key(t)))) rec('required/recommended overlap', st);
  // profile column consistency
  if(pal.anticipated && p.col!=='pal') rec('pal but col!=pal', st);
  if(!pal.anticipated){
    const m=(st.method&&st.method!=='tbd')?st.method:rm.rec.toLowerCase();
    if((m==='agile'||m==='hybrid') && p.col!=='hyb') rec('agile/hybrid col!=hyb '+p.col, st);
    if(m==='waterfall' && !['wl','wm','ws'].includes(p.col)) rec('waterfall col bad '+p.col, st);
  }
  // Mini-tier keep rule
  if(p.col!=='pal' && st.loe==='s'){
    if(!td.required.some(t=>t.file===MC)) rec('mini keep: no MiniCharter', st);
    if(!td.required.some(t=>t.file===GV)) rec('mini keep: no Governance', st);
  }
  // tier<->size mapping (non-PAL)
  if(p.col!=='pal'){
    const exp={s:'Mini',m:'Standard',l:'Large'}[st.loe]||'Standard';
    if(p.tier!==exp) rec('tier/size mismatch '+p.tier+'/'+st.loe, st);
  }
}

const N=parseInt(process.argv[2]||'500000',10);
console.log('FRONT/CORE stress: '+N.toLocaleString()+' randomized iterations\n');
let t=Date.now();
for(let i=0;i<N;i++){ check(); if(i%100000===0&&i) process.stdout.write('  '+(i/1000)+'k done ('+(Date.now()-t)+'ms)\n'); }
const secs=((Date.now()-t)/1000).toFixed(1);
console.log('\nFRONT: '+N.toLocaleString()+' iterations in '+secs+'s  ('+Math.round(N/(secs))+'/s)');
console.log('FRONT failures: '+fails.length);
fails.forEach(f=>console.log('  - '+f));
console.log(fails.length? '\nFRONT: FAIL' : '\nFRONT: ALL INVARIANTS HELD');
process.exit(fails.length?1:0);
