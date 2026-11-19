const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
const grab=expr=>w.eval('JSON.stringify('+expr+')');
// Documents checklist catalog lives inside the Excel builder; read its literal from the source.
const SRC=fs.readFileSync(F,'utf8');
const c0=SRC.indexOf('const DOCS_CATALOG=[')+'const DOCS_CATALOG='.length;
const c1=SRC.indexOf('\n  const T=[',c0);
const docsCatalog=Function('return '+SRC.slice(c0,c1).trim().replace(/;$/,''))();
const out={
  docsCatalog,
  packageOf: JSON.parse(grab('PACKAGE_OF')),
  rules: w.ESPMO_RULES,
  valueModel: JSON.parse(grab('VALUE_MODEL')),
  valueWsum: JSON.parse(grab('VALUE_WSUM')),
  valueMax: JSON.parse(grab('VALUE_MAX')),
  qnum: JSON.parse(grab('QNUM')),
  palDefault: w.determinePAL()
};
const OUT=process.argv[2]||'/tmp/rules_dump.json';
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('wrote',OUT,'| checklist items:',docsCatalog.reduce((n,g)=>n+g.items.length,0),'| package map:',Object.keys(out.packageOf).length);
console.log('questions:', out.rules.questions.length, '| pal triggers:', out.rules.pal.triggers.length, '| valueModel:', out.valueModel.length);
console.log('pal.status.pal =', out.rules.pal.status.pal);
console.log('pal default status =', out.palDefault.status);
