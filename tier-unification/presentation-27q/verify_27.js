const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
const errs=[];const {VirtualConsole}=require('jsdom');const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/',virtualConsole:vc});
const w=d.window,dc=w.document;w.alert=()=>{};w.scrollTo=()=>{};
const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
ok('loads clean',errs.length===0,errs.slice(0,2).join('|'));
const secs=[...dc.querySelectorAll('.group-label')].map(e=>e.textContent);
ok('6 "Section N of 6" headers', secs.filter(t=>/^Section \d of 6 ·/.test(t)).length===6, secs.filter(t=>/Section/.test(t)).length);
ok('name input in intro (data-id=name)', !!dc.querySelector('input.txt[data-id="name"]'));
// every one of the 31 fields is selectable/present
const FIELDS=['method','scope','delivery','custavail','teamavail','phase','benefit','mandate','risk','impact','pmexp','funding','newcap','spend','loe','eddnext','coord','vendor','pal_budget','pal_legis','pal_govbudget','pal_crit','data','deps','migrate','novelTech','novelBiz','sec','cloud','testing','support'];
let miss=FIELDS.filter(f=>dc.querySelectorAll('[data-id="'+f+'"]').length===0);
ok('all 31 answer fields present as controls', miss.length===0, miss.join(','));
// PAL matrix: 4 ids x 3 cols = 12 .opt cells
const palCells=['pal_budget','pal_legis','pal_govbudget','pal_crit'].reduce((n,id)=>n+dc.querySelectorAll('.opt[data-id="'+id+'"]').length,0);
ok('PAL matrix = 12 cells (4x3)', palCells===12, palCells);
// each PAL row has n/y/ns
const palOK=['pal_budget','pal_legis','pal_govbudget','pal_crit'].every(id=>['n','y','ns'].every(v=>dc.querySelector('.opt[data-id="'+id+'"][data-v="'+v+'"]')));
ok('each PAL row has No/Yes/Not sure', palOK);
console.log('\n'+(fail.length?fail.length+' FAIL':'STRUCTURE OK'));
process.exit(fail.length?1:0);
