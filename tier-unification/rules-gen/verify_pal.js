const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
function fresh(){const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});return {w,dc};}
const fail=[];const ok=(n,c,got)=>{console.log((c?'  PASS ':'  FAIL ')+n+(got!==undefined?'  (got: '+got+')':''));if(!c)fail.push(n);};
function palFor(ans){const {w,dc}=fresh();const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const set=(id,v)=>{const o=[...dc.querySelectorAll('.opt[data-id="'+id+'"]')].find(x=>x.dataset.v===v); if(o&&!o.classList.contains('sel'))click(o);};Object.entries(ans).forEach(([id,v])=>set(id,v));return {w,dc,pal:w.determinePAL(),set,click};}
console.log('PAL determination (SAM 4819.37 five triggers):\n');

const {w}=fresh();
ok('4 PAL trigger questions exist', ['pal_budget','pal_legis','pal_govbudget','pal_crit'].every(id=>w.ESPMO_RULES.questions.find(q=>q.id===id)));
ok('old single pal question removed', !w.ESPMO_RULES.questions.find(q=>q.id==='pal'));
ok('cost trigger UNKNOWN while unconfigured', w.determinePAL().triggers.cost_exceeds_delegation==='UNKNOWN');

// No triggers, cost unknown -> INDETERMINATE (not Regular)
let r=palFor({}).pal;
ok('no triggers + cost unknown -> INDETERMINATE', r.kind==='indeterminate' && /INDETERMINATE/.test(r.status), r.status);
ok('  ...not anticipated PAL', r.anticipated===false);

// Any single trigger -> PAL, short-circuits cost
r=palFor({pal_budget:'y'}).pal;
ok('budget action Yes -> PAL', r.kind==='pal' && r.anticipated, r.status);
ok('  ...deciding names the budget trigger', r.deciding.join()==='Budget action (BCP / Budget Revision)', r.deciding.join());
r=palFor({pal_legis:'y'}).pal; ok('legislative Yes -> PAL', r.kind==='pal', r.status);
r=palFor({pal_govbudget:'y'}).pal; ok("Governor's Budget Yes -> PAL", r.kind==='pal', r.status);
r=palFor({pal_crit:'y'}).pal; ok('CDT/AIO criticality Yes -> PAL', r.kind==='pal', r.status);

// PAL trigger -> flags.pal -> govTier 4 (need >=3 complexity drivers answered + reveal)
{
  const {w,dc,click,set}=palFor({data:'n',sec:'n',impact:'public',spend:'l',coord:'3',pal_legis:'y'});
  w.__revealed=true; click(dc.getElementById('revealBtn'));
  ok('anticipated PAL sets govTier 4', w.__GOV_TIER===4, w.__GOV_TIER);
  ok('PAL panel renders status', /PAL — Non-Delegated/.test(dc.getElementById('palStatus').textContent), dc.getElementById('palStatus').textContent.trim());
}
// no PAL trigger -> govTier not forced to 4
{
  const {w,dc,click}=palFor({data:'n',sec:'n',impact:'public',spend:'l',coord:'3',eddnext:'y'});
  w.__revealed=true; click(dc.getElementById('revealBtn'));
  ok('no PAL trigger -> govTier not 4 (eddnext=3)', w.__GOV_TIER===3, w.__GOV_TIER);
}
console.log('\n'+(fail.length? fail.length+' FAIL: '+fail.join(' | '):'ALL PAL CHECKS PASSED'));
process.exit(fail.length?1:0);
