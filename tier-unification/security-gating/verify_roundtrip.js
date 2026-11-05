const fs=require('fs'),{JSDOM}=require('jsdom');
// 1) Produce a Profiler export (bytes) with C1 fired+acked
function makeExport(){
  const F='/home/user/conda/tier-unification/Project-Profiler.html';
  const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
  const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};
  w.URL.createObjectURL=()=>'blob:x';w.URL.revokeObjectURL=()=>{};
  const S=w.eval('state');const click=e=>e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const set=(id,v)=>{const o=[...dc.querySelectorAll('.opt[data-id="'+id+'"]')].find(x=>x.dataset.v===v);if(o&&!o.classList.contains('sel'))click(o);};
  set('impact','public');set('spend','l');set('coord','3');set('data','y');set('sec','n');set('cloud','y'); // C1 hard + C3 soft
  w.__revealed=true;click(dc.getElementById('revealBtn'));
  S.__ackContra={C1:'DK'}; w.updateExportGate();
  let cap=null;const ow=w.XLSX.write;w.XLSX.write=function(wb,o){cap=wb;return ow.call(this,wb,o);};
  w.saveAsExcel();
  return ow(cap,{type:'array',bookType:'xlsx'});  // arraybuffer/uint8
}
const bytes=makeExport();
// 2) Feed into Autogenerate parse
const A='/home/user/conda/tier-unification/Autogenerate.html';
const errs=[];const {VirtualConsole}=require('jsdom');const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push(e.message));
const d2=new JSDOM(fs.readFileSync(A,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/',virtualConsole:vc});
const w2=d2.window;w2.alert=()=>{};w2.scrollTo=()=>{};
setTimeout(()=>{
  const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
  ok('autogen loads clean', errs.length===0, errs.slice(0,2).join('|'));
  const r=w2.__F3TEST.parse(bytes);
  ok('Contradictions sheet parsed (4 rows)', r.n===4, r.n);
  ok('block mentions C1 acknowledged (DK)', /C1 \[hard\]: acknowledged as intentional \(DK\)/.test(r.block), r.block.split('\n')[1]);
  ok('block mentions C3 unresolved', /C3 \[soft\]: unresolved at export/.test(r.block), r.block);
  ok('securityFired true from export (pii)', r.firedSec===true);
  console.log('\n'+(fail.length?fail.length+' FAIL':'ROUND-TRIP OK'));
  console.log('--- rendered {contradictions_block} ---\n'+r.block);
  process.exit(fail.length?1:0);
},700);
