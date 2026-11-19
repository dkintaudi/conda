const fs=require('fs'),{JSDOM}=require('jsdom');
const NEW='/home/user/conda/tier-unification/Project-Profiler.html', OLD='/tmp/v13.html';
function inst(F){const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false});w.URL.createObjectURL=()=>'blob:x';w.URL.revokeObjectURL=()=>{};if(w.HTMLAnchorElement)w.HTMLAnchorElement.prototype.click=function(){};return w;}
function exp(w,codes){
  const S=w.eval('state'); Object.keys(S).forEach(k=>delete S[k]);
  Object.assign(S,codes); w.__revealed=true; try{w.compute();}catch(e){}
  let cap=null; const ow=w.XLSX.write; w.XLSX.write=function(wb,o){cap=wb;return ow.call(this,wb,o);};
  w.saveAsExcel(); w.XLSX.write=ow;
  const g=n=>cap.Sheets[n]?w.XLSX.utils.sheet_to_json(cap.Sheets[n],{header:1,defval:''}):[];
  // Fields minus volatile rows (version/generated_on) which legitimately differ across editions
  const F=g('Fields').filter(r=>!['version','generated_on'].includes(String(r[0])));
  return {Fields:F,Templates:g('Templates'),Loops:g('Loops'),Contradictions:g('Contradictions'),
          Docs:g('Documents'),EM:g('Engagement Matrix'),sheets:cap.SheetNames};
}
const wOld=inst(OLD), wNew=inst(NEW);
const Q=wNew.ESPMO_RULES.questions.filter(q=>q.o);
let s=99; const rnd=()=>{s=(1103515245*s+12345)&0x7fffffff;return s/0x7fffffff;};
const J=JSON.stringify;
let fails=0, n=25;
for(let i=0;i<n;i++){
  const codes={name:'Case '+i};
  Q.forEach(q=>{ if(rnd()<0.12)return; codes[q.id]=q.o[(rnd()*q.o.length)|0].v; });
  // ensure reveal gate
  codes.data=codes.data||'y'; codes.impact=codes.impact||'public'; codes.spend=codes.spend||'l'; codes.coord=codes.coord||'3'; codes.sec=codes.sec||'y';
  const a=exp(wOld,codes), b=exp(wNew,codes);
  for(const k of ['Fields','Templates','Loops','Contradictions','Docs','EM','sheets']){
    if(J(a[k])!==J(b[k])){ fails++; if(fails<=5){console.log('DIFF case',i,'sheet',k); } }
  }
}
console.log(fails? (fails+' DIFFS across '+n+' vectors') : ('EXPORT PARITY: byte-identical data across '+n+' vectors (excl. version/date)'));
process.exit(fails?1:0);
