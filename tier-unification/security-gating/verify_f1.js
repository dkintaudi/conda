const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
function fresh(){const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});return{w,dc};}
const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
// expected fired rule ids given data/sec/cloud/migrate
function expected(data,sec,cloud,migrate){
  const s=[];
  if(data==='y'&&sec==='n')s.push('C1');
  if(data==='y'&&sec==='ns')s.push('C2');
  if(cloud==='y'&&sec==='n')s.push('C3');
  if(migrate==='y'&&data==='n')s.push('C4');
  return s.sort().join(',');
}
const {w}=fresh(); const S=w.eval('state');
const DV=['n','m','y'], SV=['n','mb','y','ns'], CV=['n','y','ns'], MV=['n','y','ns'];
let cases=0,bad=0;
for(const data of DV)for(const sec of SV)for(const cloud of CV)for(const migrate of MV){
  Object.keys(S).forEach(k=>delete S[k]);
  S.data=data;S.sec=sec;S.cloud=cloud;S.migrate=migrate;
  const got=w.evalContradictions().map(c=>c.id).sort().join(',');
  const exp=expected(data,sec,cloud,migrate);
  cases++; if(got!==exp){bad++; if(bad<=8)console.log('   MISMATCH',{data,sec,cloud,migrate},'got',got,'exp',exp);}
}
ok('contradiction truth table ('+cases+' combos)', bad===0, bad+' mismatches');
// severity: C1 hard, others soft
{Object.keys(S).forEach(k=>delete S[k]);S.data='y';S.sec='n';
 const c=w.evalContradictions().find(x=>x.id==='C1');
 ok('C1 is hard', c&&c.severity==='hard');
}
// export gate: hard unacked disables saveBtn/submitBtn (need reveal + compute)
{const {w,dc}=fresh(); const S=w.eval('state');
 const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const set=(id,v)=>{const o=[...dc.querySelectorAll('.opt[data-id="'+id+'"]')].find(x=>x.dataset.v===v);if(o&&!o.classList.contains('sel'))click(o);};
 set('impact','public');set('spend','l');set('coord','3');set('data','y');set('sec','n'); // C1 hard fires
 w.__revealed=true; click(dc.getElementById('revealBtn'));
 const sb=dc.getElementById('saveBtn'), eb=dc.getElementById('submitBtn');
 ok('hard unacked -> saveBtn disabled', sb&&sb.disabled===true);
 ok('hard unacked -> submitBtn disabled', eb&&eb.disabled===true);
 ok('contradictions panel visible', dc.getElementById('contraSect').style.display!=='none');
 // acknowledge with initials
 S.__ackContra={C1:'DK'}; w.updateExportGate();
 ok('acknowledged -> saveBtn enabled', sb&&sb.disabled===false);
 // ack checkbox without initials should NOT unblock
 S.__ackContra={C1:''}; w.updateExportGate();
 ok('ack without initials stays blocked', sb&&sb.disabled===true);
}
console.log('\n'+(fail.length?fail.length+' FAIL':'ALL F1 CHECKS PASSED'));
process.exit(fail.length?1:0);
