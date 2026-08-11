const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Autogenerate.html';
const errs=[];const {VirtualConsole}=require('jsdom');
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/',virtualConsole:vc});
const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};
setTimeout(()=>{
  const fail=[];const ok=(n,c,g)=>{console.log((c?'  PASS ':'  FAIL ')+n+(g!==undefined?'  ('+g+')':''));if(!c)fail.push(n);};
  ok('tool loads no JS errors', errs.length===0, errs.slice(0,2).join('|'));
  const pb=fields=>({templates:[{}],fields:fields.map(([t,v])=>({tag:t,value:v})),loops:[]});
  const T=w.__F3TEST;
  // with start date + identity + determinations (fired)
  const P=pb([['project_name','ITW1081 Copilot'],['project_manager','D. Kintaudi'],['project_start_date','2026-08-03'],['ans_sec','y'],['ans_data','y'],['security_fired','Y']]);
  const xml=T.schedXml(P);
  const cell=(a)=>{const m=xml.match(new RegExp('<c r="'+a+'"[^>]*>[\\s\\S]*?</c>'));return m?m[0]:'';};
  ok('B2 stamped name', /ITW1081 Copilot/.test(cell('B2')), cell('B2'));
  ok('E2 stamped PM', /D\. Kintaudi/.test(cell('E2')), cell('E2'));
  ok('B3 security review = Yes', />Yes</.test(cell('B3')), cell('B3'));
  ok('E3 protected data = Yes', />Yes</.test(cell('E3')), cell('E3'));
  ok('B4 fired text', /required by intake/.test(cell('B4')), cell('B4'));
  // B1 stamped to serial (no <f>), keeps style s="2"
  const b1=cell('B1');
  const mv=b1.match(/<v>(\d+(?:\.\d+)?)<\/v>/);
  const expSerial=Math.round((Date.UTC(2026,7,3)-Date.UTC(1899,11,30))/86400000);
  ok('B1 has a numeric serial', !!mv, b1);
  ok('B1 serial ~ 2026-08-03 (±1)', mv && Math.abs(parseFloat(mv[1])-expSerial)<=1, mv&&mv[1]+' vs '+expSerial);
  ok('B1 formula removed', b1.indexOf('<f>')<0, b1);
  ok('B1 keeps date style s="2"', /s="2"/.test(b1), b1);
  // formula count delta = 1 (only B1)
  const before=(T.schedXml(pb([]))||'').match(/<f>/g)||[]; // no start -> B1 formula intact
  const withStart=xml.match(/<f>/g)||[];
  ok('no-start keeps B1 formula (count '+before.length+')', before.length===280, before.length);
  ok('start stamp drops exactly 1 formula ('+withStart.length+')', withStart.length===279, withStart.length);
  // real build() does not throw and returns a blob
  let built=null; try{ built=T.build(P); }catch(e){ ok('build() throws',false,e.message); }
  ok('build() returns named blob', built && built.name==='IDP_Security_Tasks_SCHEDULE.xlsx' && built.blob, built&&built.name);
  // unfired: B4=No, B1 stays formula (no start)
  const xml2=T.schedXml(pb([['ans_sec','n'],['ans_data','n']]));
  ok('unfired B4=No', />No</.test(xml2.match(/<c r="B4"[^>]*>[\s\S]*?<\/c>/)[0]));
  console.log('\n'+(fail.length?fail.length+' FAIL':'ALL F2 CHECKS PASSED'));
  process.exit(fail.length?1:0);
},700);
