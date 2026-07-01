const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
function fresh(){const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});return {w,dc};}
const fail=[];const ok=(n,c,got)=>{console.log((c?'  PASS ':'  FAIL ')+n+(got!==undefined?'  (got: '+got+')':''));if(!c)fail.push(n);};
function setup(ans){const {w,dc}=fresh();const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const set=(id,v)=>{const o=[...dc.querySelectorAll('.opt[data-id="'+id+'"]')].find(x=>x.dataset.v===v); if(o&&!o.classList.contains('sel'))click(o);};
  // satisfy the reveal gate (>=3 complexity drivers answered) unless caller overrides
  const gate={data:'n',sec:'n',impact:'public',spend:'l',coord:'3'};
  Object.entries(gate).forEach(([id,v])=>{ if(!(id in ans)) set(id,v); });
  Object.entries(ans).forEach(([id,v])=>set(id,v));
  w.__revealed=true; const rb=dc.getElementById('revealBtn'); if(rb) click(rb);
  return {w,dc};}
console.log('CA-PMF T-shirt template matrix integration:\n');

// matrix present
{const {w}=fresh();
 ok('ESPMO_RULES.tshirt present', !!(w.ESPMO_RULES.tshirt&&w.ESPMO_RULES.tshirt.templates));
 ok('  56 templates', w.ESPMO_RULES.tshirt.templates.length===56, w.ESPMO_RULES.tshirt.templates.length);
 ok('  templates carry SharePoint paths', w.ESPMO_RULES.tshirt.templates.filter(t=>t.path).length>=50, w.ESPMO_RULES.tshirt.templates.filter(t=>t.path).length);
}
// expected counts per column
const EXP={pal:[23,25],hyb:[11,31],wl:[23,25],wm:[12,28],ws:[4,25]};
{const {w}=fresh();const T=w.ESPMO_RULES.tshirt.templates;
 for(const [col,[R,O]] of Object.entries(EXP)){
   const r=T.filter(t=>t[col]==='R').length, o=T.filter(t=>t[col]==='O').length;
   ok('col '+col+' Required='+R+' Optional='+O, r===R&&o===O, r+'/'+o);
 }}

// PAL -> pal column
{const {w}=setup({pal_legis:'y'}); const d=w.__TSHIRT;
 ok('PAL project -> PAL profile', d.profile.col==='pal'&&d.profile.label==='PAL', d.profile.label);
 ok('  required=23 recommended=25', d.required.length===23&&d.recommended.length===25, d.required.length+'/'+d.recommended.length);
}
// Waterfall + Large -> wl
{const {w}=setup({method:'waterfall',loe:'l'}); const d=w.__TSHIRT;
 ok('Waterfall+Large -> Waterfall — Large', d.profile.col==='wl', d.profile.label);
 ok('  required=23', d.required.length===23, d.required.length);
}
// Waterfall + Small -> ws
{const {w}=setup({method:'waterfall',loe:'s'}); const d=w.__TSHIRT;
 ok('Waterfall+Small -> Waterfall — Small', d.profile.col==='ws', d.profile.label);
 ok('  required=4', d.required.length===4, d.required.length);
}
// Agile -> hyb
{const {w}=setup({method:'agile',loe:'l'}); const d=w.__TSHIRT;
 ok('Agile -> Hybrid-Agile (size ignored)', d.profile.col==='hyb', d.profile.label);
}
// Hybrid -> hyb
{const {w}=setup({method:'hybrid',loe:'s'}); const d=w.__TSHIRT;
 ok('Hybrid -> Hybrid-Agile', d.profile.col==='hyb', d.profile.label);
}
// PAL overrides method+size
{const {w}=setup({method:'agile',loe:'s',pal_budget:'y'}); const d=w.__TSHIRT;
 ok('PAL overrides Agile/Small -> PAL', d.profile.col==='pal', d.profile.label);
}
// Waterfall unsized -> default Medium
{const {w}=setup({method:'waterfall'}); const d=w.__TSHIRT;
 ok('Waterfall unsized -> default Medium', d.profile.col==='wm', d.profile.label);
}
// panel renders
{const {w,dc}=setup({method:'waterfall',loe:'l'});
 const box=dc.getElementById('tshirt');
 ok('#tshirt panel populated', box && box.querySelectorAll('.art').length>0, box?box.querySelectorAll('.art').length:'no box');
 ok('profile tag set', dc.getElementById('tshirtProfileTag').textContent.includes('Waterfall'), dc.getElementById('tshirtProfileTag').textContent);
}
console.log('\n'+(fail.length? fail.length+' FAIL: '+fail.join(' | '):'ALL T-SHIRT CHECKS PASSED'));
process.exit(fail.length?1:0);
