const fs=require('fs'),{JSDOM}=require('jsdom');
const openpyxlNote=0;
const XLSX=require('/tmp/e2e/node_modules/xlsx'); // for reading sample codes + writing? use for read
const PF='/home/user/conda/tier-unification/Project-Profiler.html';
const DIR='/tmp/deliv/ESPMO-Toolset-v01.2-EDD-Polished/07_Sample_Inputs/';
const samples=fs.readdirSync(DIR).filter(f=>/^SAMPLE_Profiler-Export.*\.xlsx$/.test(f));
function codesFrom(path){
  const wb=XLSX.readFile(path);
  const rows=XLSX.utils.sheet_to_json(wb.Sheets['Fields'],{header:1,defval:''});
  const fmap={}; rows.forEach(r=>{ if(r[0]) fmap[String(r[0])]=r[1]; });
  const codes={}; Object.keys(fmap).forEach(k=>{ if(k.endsWith('__v')) codes[k.slice(0,-3)]=String(fmap[k]); });
  return {codes, name:fmap['project_name']||'', vc:fmap['vc_score']||''};
}
function regen(name){ const path=DIR+name;
  const {codes,name:pname,vc}=codesFrom(path); const nm=pname;
  const d=new JSDOM(fs.readFileSync(PF,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
  const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
  w.URL.createObjectURL=()=>'blob:x';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
  const S=w.eval('state');
  Object.keys(codes).forEach(k=>{ S[k]=codes[k]; });
  if(nm) S.name=nm;
  w.__revealed=true; const rb=dc.getElementById('revealBtn'); if(rb) rb.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const r=w._recompute();
  let cap=null; const ow=w.XLSX.write; w.XLSX.write=function(wb,o){cap=wb;return ow.call(this,wb,o);};
  w.saveAsExcel();
  const bytes=ow(cap,{type:'array',bookType:'xlsx'});
  fs.writeFileSync(path, Buffer.from(bytes));
  return {name:nm, oldVC:vc, newVC:r.vc, sheets:cap.SheetNames, codes};
}
const out=[];
for(const s of samples){
  const res=regen(s);
  console.log('\n'+s);
  console.log('  project:',res.name,'| old VC:',res.oldVC,'-> new VC:',res.newVC, res.oldVC==res.newVC?'(match)':'(CHANGED)');
  console.log('  sheets:',res.sheets.join(', '));
  out.push(res);
}
console.log('\nregenerated',samples.length,'samples');
