const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');const PizZip=require('pizzip');
const ROOT='/tmp/tierunif/toolset/ESPMO-Toolset-v01.2-EDD-Polished';
const PROFILER=path.join(ROOT,'01_Tools_Self_Contained/Project-Profiler.html');
const PROTO='/tmp/e2e/Autogenerate_proto.html';
const LIB=path.join(ROOT,'02_Templates_and_Reference/02_Templates');
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function newDom(file){const dom=new JSDOM(fs.readFileSync(file,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});const {window}=dom;window.alert=()=>{};window.scrollTo=()=>{};if(!window.matchMedia)window.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});return window;}

// rich Profiler export (many "yes" flags so the answer-derived In Scope has several lines)
function richExport(){
  const window=newDom(PROFILER);const document=window.document;let cap=null;
  window.XLSX.writeFile=wb=>{cap=window.XLSX.write(wb,{type:'array',bookType:'xlsx'});};
  window.URL.createObjectURL=()=>'x';window.URL.revokeObjectURL=()=>{};
  const click=el=>el.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  const setA=(id,v)=>{const o=[...document.querySelectorAll(`.opt[data-id="${id}"]`)].find(x=>x.dataset.v===v);if(!o)throw new Error(id+'='+v);click(o);};
  const nm=document.querySelector('.txt[data-id="name"]');nm.value='Statewide Benefits Modernization';nm.dispatchEvent(new window.Event('input',{bubbles:true}));
  const A={method:'hybrid',phase:'Execute',benefit:'trans',impact:'public',newcap:'y',mandate:'y',data:'y',spend:'l',coord:'4',vendor:'mlt',deps:'m',migrate:'y',novelTech:'y',novelBiz:'y',sec:'y',cloud:'y',pmexp:'ne',loe:'l',pal:'n',eddnext:'n',testing:'hybrid_test',support:'hybrid_sup'};
  for(const [k,v] of Object.entries(A))setA(k,v);
  click(document.getElementById('revealBtn'));click(document.getElementById('excelBtn'));
  return Buffer.from(cap);
}

const TRT_WITH_SCOPE=[
 "TRT Recommendation — Statewide Benefits Modernization",
 "Based on the discussion, proceed in the Execute phase.",
 "The business problem is that legacy intake is fragmented across counties.",
 "In Scope:",
 "- Replace the county intake portals with one statewide portal",
 "- Consolidate eligibility rules into a shared service",
 "Out of Scope:",
 "- Changes to federal reporting interfaces",
].join("\n");

async function runAutogen(xlsxBuf, trtText){
  const window=newDom(PROTO);const document=window.document;await wait(400);
  const $=id=>document.getElementById(id);
  const fileOf=(b,n)=>new window.File([new Uint8Array(b)],n);
  const dropOn=(id,fl)=>{const e=new window.Event('drop',{bubbles:true,cancelable:true});e.dataTransfer={files:fl};$(id).dispatchEvent(e);};
  dropOn('dropProfileBuild',[fileOf(xlsxBuf,'P.xlsx')]);
  for(let i=0;i<40&&/waiting|0 templates/i.test($('tplNeeded').textContent);i++)await wait(100);
  if(trtText){const ta=$('trtPasteText');ta.value=trtText;ta.dispatchEvent(new window.Event('input',{bubbles:true}));$('trtPasteRead').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await wait(400);}
  dropOn('dropTpl',fs.readdirSync(LIB).filter(f=>/\.docx$/i.test(f)).map(f=>fileOf(fs.readFileSync(path.join(LIB,f)),f)));
  for(let i=0;i<60&&$('runBtn').disabled;i++)await wait(100);
  if($('runBtn').disabled)return {error:$('runNote').textContent};
  let charterBuf=null;
  const rb=blob=>new Promise((res,rej)=>{const fr=new window.FileReader();fr.onload=()=>res(Buffer.from(fr.result));fr.onerror=()=>rej();fr.readAsArrayBuffer(blob);});
  window.saveAs=(b,n)=>{if(/Charter/i.test(n))rb(b).then(buf=>{charterBuf=buf;if(global.__OUT)fs.writeFileSync(global.__OUT,buf);});};
  $('runBtn').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await wait(700);
  const btns=[...document.querySelectorAll('#resultLog button')];(btns.find(b=>/save all/i.test(b.textContent))||btns.find(b=>/save/i.test(b.textContent))).dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  await wait(1500);
  const t=new PizZip(charterBuf).file('word/document.xml').asText().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const seg=(a,b)=>{const i=t.indexOf(a);if(i<0)return '(n/a)';const j=t.indexOf(b,i);return t.slice(i,j>i?j:i+260).trim();};
  return {scope:seg('High-Level Scope','Key Deliverables'), objectives:seg('Objectives &','High-Level Scope')};
}

(async()=>{
  const xlsx=richExport();
  console.log('############ A) Profiler ONLY — In Scope drafted from answer flags ############');
  global.__OUT='/tmp/e2e/Charter_A_answer-derived-scope.docx';const a=await runAutogen(xlsx,null);
  console.log('OBJECTIVES (should stay deterministic):\n  '+a.objectives+'\n');
  console.log('SCOPE:\n  '+a.scope+'\n');
  console.log('############ B) Profiler + TRT that lists scope — TRT wins ############');
  global.__OUT='/tmp/e2e/Charter_B_TRT-scope-wins.docx';const b=await runAutogen(xlsx,TRT_WITH_SCOPE);
  console.log('OBJECTIVES:\n  '+b.objectives+'\n');
  console.log('SCOPE:\n  '+b.scope);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
