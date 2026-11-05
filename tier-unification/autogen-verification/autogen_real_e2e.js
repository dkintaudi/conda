// TRUE end-to-end through the REAL Autogenerate.html (its own parse/buildData/render/deliver).
// 1) Run the real Profiler -> capture its actual .xlsx export bytes (Mini + Standard).
// 2) Load Autogenerate.html in jsdom, DROP the .xlsx + the library .docx templates onto its
//    real drop zones, click its real "Generate drafts" button, click "Save all", and capture
//    the .docx blobs the tool itself produced.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const PizZip = require('pizzip');

const ROOT = '/tmp/tierunif/toolset/ESPMO-Toolset-v01.2-EDD-Polished';
const PROFILER = path.join(ROOT, '01_Tools_Self_Contained/Project-Profiler.html');
const AUTOGEN = path.join(ROOT, '01_Tools_Self_Contained/Autogenerate.html');
const LIB = path.join(ROOT, '02_Templates_and_Reference/02_Templates');
const OUT = '/tmp/e2e/autogen_out';
const wait = ms => new Promise(r => setTimeout(r, ms));

function newDom(file) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local/' });
  const { window } = dom;
  window.alert = () => {}; window.scrollTo = () => {};
  if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){} });
  return window;
}

// ---------- Step 1: real Profiler export bytes ----------
function profilerExport(answers, projName) {
  const window = newDom(PROFILER); const document = window.document;
  let captured = null;
  window.XLSX.writeFile = (wb) => { captured = window.XLSX.write(wb, { type: 'array', bookType: 'xlsx' }); };
  window.URL.createObjectURL = () => 'blob:x'; window.URL.revokeObjectURL = () => {};
  const click = el => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const setA = (id, v) => { const o = [...document.querySelectorAll(`.opt[data-id="${id}"]`)].find(x => x.dataset.v === v); if (!o) throw new Error('opt ' + id + '=' + v); click(o); };
  const nm = document.querySelector('.txt[data-id="name"]'); nm.value = projName; nm.dispatchEvent(new window.Event('input', { bubbles: true }));
  for (const [k, v] of Object.entries(answers)) setA(k, v);
  const rb = document.getElementById('revealBtn'); if (rb) click(rb);
  click(document.getElementById('excelBtn'));
  if (!captured) throw new Error('no export captured');
  return Buffer.from(captured);
}

const MINI = { method:'agile', phase:'Plan', benefit:'inc', impact:'team', newcap:'n', mandate:'n', data:'n', spend:'s', coord:'1', vendor:'n', deps:'n', novelTech:'n', novelBiz:'n', sec:'n', cloud:'n', migrate:'n', pal:'n', eddnext:'n', pmexp:'ve', testing:'na', support:'na' };
const STANDARD = { method:'waterfall', phase:'Plan', benefit:'trans', impact:'public', newcap:'n', mandate:'n', data:'n', spend:'m', coord:'3', vendor:'n', deps:'m', novelTech:'s', novelBiz:'s', sec:'n', cloud:'n', migrate:'n', pal:'n', eddnext:'n', pmexp:'sw', testing:'na', support:'na' };

// ---------- Step 2: drive the REAL Autogenerate ----------
async function runAutogen(label, xlsxBuf, projName) {
  const window = newDom(AUTOGEN); const document = window.document;
  await wait(400); // let its bundle + self-check init
  const $ = id => document.getElementById(id);
  const fileOf = (buf, name) => new window.File([new Uint8Array(buf)], name);
  function dropOn(elId, files) {
    const ev = new window.Event('drop', { bubbles: true, cancelable: true });
    ev.dataTransfer = { files };
    $(elId).dispatchEvent(ev);
  }

  // 2a. drop the Profiler .xlsx onto step-1 source zone
  dropOn('dropProfileBuild', [fileOf(xlsxBuf, projName.replace(/\W+/g,'_') + '_Profiler.xlsx')]);
  // wait for parse + the needed-templates list
  for (let i = 0; i < 40 && /waiting|0 templates/i.test($('tplNeeded').textContent); i++) await wait(100);
  const needText = $('tplNeeded').textContent.trim();

  // 2b. drop ALL library .docx templates so every needed one is present
  const tplFiles = fs.readdirSync(LIB).filter(f => /\.docx$/i.test(f))
    .map(f => fileOf(fs.readFileSync(path.join(LIB, f)), f));
  dropOn('dropTpl', tplFiles);
  for (let i = 0; i < 60 && $('runBtn').disabled; i++) await wait(100);

  const runNote = $('runNote').textContent.trim();
  const ready = !$('runBtn').disabled;

  // 2c. capture whatever the tool hands to saveAs
  const saved = [];
  const readBlob = blob => new Promise((res, rej) => {
    if (blob && typeof blob.arrayBuffer === 'function') { blob.arrayBuffer().then(ab => res(Buffer.from(ab)), rej); return; }
    const fr = new window.FileReader();
    fr.onload = () => res(Buffer.from(fr.result));
    fr.onerror = () => rej(new Error('blob read failed'));
    fr.readAsArrayBuffer(blob);
  });
  window.saveAs = (blob, name) => {
    readBlob(blob).then(buf => {
      fs.mkdirSync(path.join(OUT, label), { recursive: true });
      fs.writeFileSync(path.join(OUT, label, name), buf);
      saved.push(name);
    }).catch(e => console.log('  saveAs capture error:', e.message));
  };

  if (!ready) return { label, needText, runNote, ready, saved, error: 'runBtn never enabled' };

  // 2d. click the REAL Generate button, then the REAL "Save all"
  $('runBtn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(600);
  const buttons = [...document.querySelectorAll('#resultLog button')];
  const saveAll = buttons.find(b => /save all/i.test(b.textContent)) || buttons.find(b => /save/i.test(b.textContent));
  if (saveAll) saveAll.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(1500); // allow the staggered saveAs setTimeouts to fire

  // results panel summary
  const resultText = ($('resultLog').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  return { label, needText, runNote, ready, saved, resultText };
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const miniBuf = profilerExport(MINI, 'Small Forms Tidy-Up');
  const stdBuf = profilerExport(STANDARD, 'Statewide Intake Revamp');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'profiler_export_mini.xlsx'), miniBuf);
  fs.writeFileSync(path.join(OUT, 'profiler_export_standard.xlsx'), stdBuf);

  const fails = [];
  for (const [label, buf, name] of [['Mini', miniBuf, 'Small Forms Tidy-Up'], ['Standard', stdBuf, 'Statewide Intake Revamp']]) {
    const r = await runAutogen(label, buf, name);
    console.log(`\n========== ${label} (through the real Autogenerate) ==========`);
    console.log(`  step1 needed: ${r.needText}`);
    console.log(`  runNote: ${r.runNote}`);
    console.log(`  generated & saved (${r.saved.length}): ${r.saved.join(', ') || '(none)'}`);
    if (r.error) { console.log('  ERROR: ' + r.error); fails.push(`${label}: ${r.error}`); continue; }
    // verify each produced .docx: opens, has project name, no leftover scalar {tags}
    const dir = path.join(OUT, label);
    for (const f of r.saved.filter(x => /\.docx$/i.test(x))) {
      const xml = new PizZip(fs.readFileSync(path.join(dir, f))).file('word/document.xml').asText();
      const text = xml.replace(/<[^>]+>/g, '');
      const nameOK = text.includes(name);
      const leftover = (text.match(/\{[^{}]+\}/g) || []).filter(t => !/DRAFT WITH COPILOT/i.test(t));
      console.log(`     - ${f}: opens=yes name=${nameOK} leftoverTags=${leftover.length}`);
      if (!nameOK) fails.push(`${label}/${f}: project name not filled`);
      if (leftover.length) fails.push(`${label}/${f}: ${leftover.length} leftover tag(s): ${leftover.slice(0,5)}`);
    }
  }
  // tier-driven check: Standard produced an Engagement Matrix, Mini did not
  const ls = d => fs.existsSync(path.join(OUT, d)) ? fs.readdirSync(path.join(OUT, d)) : [];
  const miniEM = ls('Mini').some(f => /Engagement[_ ]?Matrix/i.test(f));
  const stdEM = ls('Standard').some(f => /Engagement[_ ]?Matrix/i.test(f));
  console.log(`\n  tier-driven: Mini Engagement Matrix=${miniEM} (expect false) · Standard Engagement Matrix=${stdEM} (expect true)`);
  if (miniEM) fails.push('Mini should not produce an Engagement Matrix');
  if (!stdEM) fails.push('Standard should produce an Engagement Matrix');

  console.log('\n==================================================');
  if (fails.length) { console.log(`FAIL (${fails.length}):`); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
  else console.log('PASS — the REAL Autogenerate tool ran end to end: it parsed the Profiler export, matched templates, filled and delivered valid .docx, with the correct tier-driven document set.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
