const fs=require('fs'),{JSDOM}=require('jsdom');
const F='/home/user/conda/tier-unification/Project-Profiler.html';
const d=new JSDOM(fs.readFileSync(F,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/'});
const w=d.window;w.alert=()=>{};w.scrollTo=()=>{};if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
const grab=expr=>w.eval('JSON.stringify('+expr+')');
const out={
  rules: w.ESPMO_RULES,
  valueModel: JSON.parse(grab('VALUE_MODEL')),
  valueWsum: JSON.parse(grab('VALUE_WSUM')),
  valueMax: JSON.parse(grab('VALUE_MAX')),
  qnum: JSON.parse(grab('QNUM')),
  palDefault: w.determinePAL()
};
fs.writeFileSync('/tmp/rules_dump.json', JSON.stringify(out));
console.log('questions:', out.rules.questions.length, '| pal triggers:', out.rules.pal.triggers.length, '| valueModel:', out.valueModel.length);
console.log('pal.status.pal =', out.rules.pal.status.pal);
console.log('pal default status =', out.palDefault.status);
