const fs=require('fs'),{JSDOM}=require('jsdom');
const XLSX=require('/tmp/e2e/node_modules/xlsx');
const DIR='/tmp/deliv/ESPMO-Toolset-v01.2-EDD-Polished/07_Sample_Inputs/';
const samples=fs.readdirSync(DIR).filter(f=>/^SAMPLE_Profiler-Export.*\.xlsx$/.test(f));
// structural checks
function struct(path){
  const wb=XLSX.readFile(path);
  const T=XLSX.utils.sheet_to_json(wb.Sheets['Templates'],{header:1,defval:''});
  const hdr=T[0].map(x=>String(x).toLowerCase()); const gi=hdr.indexOf('generate');
  const gy=T.slice(1).filter(r=>['y','yes','true','1'].includes(String(r[gi]).toLowerCase())).length;
  const F=XLSX.utils.sheet_to_json(wb.Sheets['Fields'],{header:1,defval:''});
  const fmap={}; F.forEach(r=>{if(r[0])fmap[String(r[0])]=r[1];});
  const C=wb.Sheets['Contradictions']?XLSX.utils.sheet_to_json(wb.Sheets['Contradictions'],{header:1,defval:''}):[];
  return {sheets:wb.SheetNames, gy, ans_sec:fmap['ans_sec'], ans_data:fmap['ans_data'], security_fired:fmap['security_fired'], contraRows:C.length-1};
}
// Autogenerate parse
const A='/home/user/conda/tier-unification/Autogenerate.html';
const errs=[];const {VirtualConsole}=require('jsdom');const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(A,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/',virtualConsole:vc});
const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};
setTimeout(()=>{
  const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
  ok('autogen loads clean', errs.length===0, errs.slice(0,1).join());
  for(const s of samples){
    console.log('\n== '+s+' ==');
    const st=struct(DIR+s);
    const bytes=new Uint8Array(fs.readFileSync(DIR+s));
    const r=w.__F3TEST.parse(bytes.buffer);
    ok('  has Contradictions sheet', st.sheets.includes('Contradictions'));
    ok('  has CA-PMF Templates sheet', st.sheets.includes('CA-PMF Templates'));
    ok('  Templates generate=Y > 0 (docs will build)', st.gy>0, st.gy);
    ok('  Autogenerate needs > 0 templates', r.needed>0, r.needed+' needed / '+r.templates+' rows');
    ok('  ans_sec/ans_data present', st.ans_sec!==undefined && st.ans_data!==undefined, 'sec='+st.ans_sec+' data='+st.ans_data);
    ok('  security_fired field present', st.security_fired!==undefined, st.security_fired);
    ok('  Contradictions rows = 4 (all rules)', st.contraRows===4, st.contraRows);
    console.log('     parse: firedSec='+r.firedSec+', contradictions(fired-in-sheet parsed)='+r.n+', block='+(r.block?'yes':'(none)'));
  }
  console.log('\n'+(fail.length?fail.length+' FAIL':'ALL SAMPLE CHECKS PASSED'));
  process.exit(fail.length?1:0);
},700);
