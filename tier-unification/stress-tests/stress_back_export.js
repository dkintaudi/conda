const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
const Q=w.ESPMO_RULES.questions; const S=w.eval('state');
w.URL.createObjectURL=()=>'blob:x'; w.URL.revokeObjectURL=()=>{};
const EXPECT=["Profile","Intake Answers","SIMM Complexity","Documents","Maps","Engagement Matrix","Glossary","CA-PMF Templates","Templates","Fields","Loops"];
const origWrite=w.XLSX.write; let cap=null;
w.XLSX.write=function(wb,opts){ cap=wb; return origWrite.call(this,wb,opts); };
function rnd(){ Object.keys(S).forEach(k=>delete S[k]); Q.forEach(q=>{ if(q.type==='text'){S[q.id]='Proj '+((Math.random()*1e6)|0);return;} if(q.o){ if(Math.random()<0.08) return; S[q.id]=q.o[(Math.random()*q.o.length)|0].v; } }); }
const fails=[]; const rec=(m)=>{ if(fails.length<15) fails.push(m); };
function one(i){
  rnd();
  w.__revealed=true;
  try{ w.compute(); }catch(e){ rec('compute threw: '+e.message); return; }
  cap=null;
  try{ w.saveAsExcel(); }catch(e){ rec('saveAsExcel threw: '+e.message); return; }
  if(!cap){ rec('no workbook produced'); return; }
  for(const sh of EXPECT){ if(!cap.SheetNames.includes(sh)){ rec('missing sheet '+sh); break; } }
  // handoff sheets must parse to rows (the Autogenerate data contract = the "back")
  for(const sh of ['Templates','Fields','Loops','CA-PMF Templates']){
    const ws=cap.Sheets[sh]; if(!ws){ rec('no sheet obj '+sh); continue; }
    const rows=w.XLSX.utils.sheet_to_json(ws,{header:1}); if(!rows.length){ rec('empty sheet '+sh); }
  }
  // TRUE round-trip: serialize to xlsx bytes and read back
  try{
    const buf=origWrite(cap,{type:'array',bookType:'xlsx'});
    const wb2=w.XLSX.read(buf,{type:'array'});
    if(wb2.SheetNames.length!==cap.SheetNames.length) rec('round-trip sheet count drift');
    if(!wb2.Sheets['CA-PMF Templates']) rec('round-trip lost CA-PMF Templates');
  }catch(e){ rec('reparse threw: '+e.message); }
}
const N=parseInt(process.argv[2]||'2000',10);
console.log('BACK stress: '+N.toLocaleString()+' full export -> re-read round-trips\n');
let t=Date.now();
for(let i=0;i<N;i++){ one(i); if(i&&i%500===0) process.stdout.write('  '+i+' done ('+(Date.now()-t)+'ms)\n'); }
const secs=((Date.now()-t)/1000).toFixed(1);
console.log('\nBACK: '+N.toLocaleString()+' exports in '+secs+'s  ('+(N/secs).toFixed(0)+'/s)');
console.log('BACK failures: '+fails.length); fails.forEach(f=>console.log('  - '+f));
console.log(fails.length?'\nBACK: FAIL':'\nBACK: ALL EXPORT ROUND-TRIPS OK');
process.exit(fails.length?1:0);
