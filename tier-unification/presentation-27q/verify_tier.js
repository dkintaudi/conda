const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false});
const Q=w.ESPMO_RULES.questions; const S=w.eval('state');
let s=7; const rnd=()=>{s=(1103515245*s+12345)&0x7fffffff;return s/0x7fffffff;};
const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
let mism=0, moved=0, movedUp=0, hiValHiCx=0, hiValHiCxTier3=0, N=30000;
for(let i=0;i<N;i++){
  Object.keys(S).forEach(k=>delete S[k]);
  Q.forEach(q=>{ if(q.type==='text')return; if(q.o){ if(rnd()<0.1)return; S[q.id]=q.o[(rnd()*q.o.length)|0].v; } });
  const r=w._recompute();
  const eddnext=!!r.flags.eddnext;
  const newFormula=(eddnext||r.value>=80)?3:((r.value<60&&r.avgCx<2.5)?1:2);
  const oldFormula=(eddnext||r.vc>=80)?3:((r.value<60&&r.avgCx<2.5)?1:2);
  if(r.naturalTier!==newFormula) mism++;
  if(oldFormula!==newFormula){ moved++; if(newFormula>oldFormula) movedUp++; }
  if(r.value>=80 && r.avgCx>=2.5){ hiValHiCx++; if(r.naturalTier===3) hiValHiCxTier3++; }
}
ok('naturalTier matches value-based formula (all '+N+')', mism===0, mism+' mismatches');
ok('high-value(>=80) high-complexity(>=2.5) always Tier 3', hiValHiCx>0 && hiValHiCx===hiValHiCxTier3, hiValHiCxTier3+'/'+hiValHiCx);
console.log('  tier changed vs old vc-based logic: '+moved+' cases; all upward: '+(moved===movedUp)+' ('+movedUp+' up)');
// explicit case: force high value + high complexity
Object.keys(S).forEach(k=>delete S[k]);
Object.assign(S,{benefit:'trans',mandate:'y',risk:'all',impact:'public',pmexp:'ve',funding:'sec', // high value
  data:'y',sec:'y',novelTech:'y',novelBiz:'y',deps:'m',coord:'4',spend:'l',vendor:'mlt'});         // high complexity
const r2=w._recompute();
ok('crafted high-value high-complexity -> Tier 3', r2.naturalTier===3, 'value='+r2.value+' avgCx='+r2.avgCx.toFixed(2)+' vc='+r2.vc+' tier='+r2.naturalTier);
console.log('\n'+(fail.length?fail.length+' FAIL':'ALL TIER CHECKS PASSED'));
process.exit(fail.length?1:0);
