// Deterministic scoring signature over N seeded random states (DOM-free _recompute).
const fs=require('fs'),{JSDOM}=require('jsdom');
const F=process.argv[2]; const N=parseInt(process.argv[3]||'20000',10); const OUT=process.argv[4];
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
const Q=w.ESPMO_RULES.questions; const S=w.eval('state');
let s=123456789; const rnd=()=>{ s=(1103515245*s+12345)&0x7fffffff; return s/0x7fffffff; };
const crypto=require('crypto');
const lines=[];
for(let i=0;i<N;i++){
  Object.keys(S).forEach(k=>delete S[k]);
  Q.forEach(q=>{ if(q.type==='text')return; if(q.o){ if(rnd()<0.10)return; S[q.id]=q.o[(rnd()*q.o.length)|0].v; } });
  const r=w._recompute();
  const sig=[r.value,r.bizCx.toFixed(3),r.techCx.toFixed(3),r.avgCx.toFixed(3),r.cxi,r.zone,r.crit,r.vc,r.band,r.quad,r.naturalTier,r.govTier,Object.keys(r.flags).sort().join('|')].join(',');
  lines.push(sig);
}
const h=crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
fs.writeFileSync(OUT, lines.join('\n'));
console.log('cases:',N,'| signature sha256:',h);
