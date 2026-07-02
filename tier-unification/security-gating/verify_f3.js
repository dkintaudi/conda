const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Autogenerate.html';
const errs=[];
const {VirtualConsole}=require('jsdom');
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/',virtualConsole:vc});
const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};
setTimeout(()=>{
  const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
  ok('tool loads with no JS errors', errs.length===0, errs.slice(0,2).join('|'));
  const pb=fields=>({templates:[{}],fields:fields.map(([t,v])=>({tag:t,value:v})),loops:[]});
  const T=w.__F3TEST;
  ok('security_fired=Y -> fired', T.fired(pb([['security_fired','Y']]))===true);
  ok('ans_sec=y -> fired', T.fired(pb([['ans_sec','y']]))===true);
  ok('ans_sec=mb -> fired', T.fired(pb([['ans_sec','mb']]))===true);
  ok('ans_data=y -> fired', T.fired(pb([['ans_data','y']]))===true);
  ok('sec=n,data=n -> NOT fired', T.fired(pb([['ans_sec','n'],['ans_data','n']]))===false);
  ok('empty pb -> not fired', T.fired(null)===false);
  // reflect: fired -> checkbox checked+disabled+caption
  T.reflect(pb([['ans_sec','y'],['ans_data','n']]));
  const cb=dc.getElementById('inclSecurity'), cap=dc.getElementById('secGateCaption');
  ok('fired -> checkbox checked', cb.checked===true);
  ok('fired -> checkbox disabled', cb.disabled===true);
  ok('fired -> caption shown', cap.style.display==='block' && /Required — fired/.test(cap.textContent), cap.textContent);
  // unfired -> re-enabled, caption hidden
  T.reflect(pb([['ans_sec','n'],['ans_data','n']]));
  ok('unfired -> checkbox enabled', cb.disabled===false);
  ok('unfired -> caption hidden', cap.style.display==='none');
  // caption verbatim states
  T.reflect(pb([['ans_sec','mb'],['ans_data','y']]));
  ok('caption shows Maybe/Yes', /security: Maybe; protected data: Yes/.test(cap.textContent), cap.textContent);
  console.log('\n'+(fail.length?fail.length+' FAIL':'ALL F3 CHECKS PASSED'));
  process.exit(fail.length?1:0);
},600);
