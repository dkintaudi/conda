// Verifies that every document the Profiler recommends (on-screen artifacts / Excel Templates
// sheet) belongs to a package, and that the package shows on that same export's Documents
// checklist. Runs N random answer sets through the real Profiler.
// Usage: node verify_packages.js [N]   (needs jsdom; set NODE_PATH if it is installed elsewhere)
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom');
const P = path.join(__dirname, '..', 'Project-Profiler.html');
const N = +process.argv[2] || 300;
const w = new JSDOM(fs.readFileSync(P, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local/' }).window;
w.alert = () => {}; w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
w.HTMLAnchorElement.prototype.click = function () {};
const doc = w.document, click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
let wb = null; const _w = w.XLSX.write; w.XLSX.write = function (b, o) { wb = b; return _w.apply(this, arguments); };
(async () => { await new Promise(r => setTimeout(r, 500));
const fails = []; const seenPkgs = new Set(); let rng = 12345; const rnd = n => (rng = (rng * 1103515245 + 12345) % 2147483648) % n;
// Static check: every name the rules can emit has a package that exists in the catalog
const T = JSON.parse(w.eval('JSON.stringify(ESPMO_RULES.triggers)'));
const all = [...T.baseline, ...T.tier2, ...T.tier3, ...T.method.predictive, ...T.method.agile, ...Object.values(T.flags).flatMap(f => f.docs)].map(d => d.nm)
  .concat(['Project Charter', 'Project Management Plan']);
const PK = JSON.parse(w.eval('JSON.stringify(PACKAGE_OF)'));
for (const nm of new Set(all)) if (!PK[nm]) fails.push('no package for: ' + nm);
const t = doc.querySelector('.txt[data-id="name"]'); t.value = 'Package Check'; t.dispatchEvent(new w.Event('input', { bubbles: true }));
const qs = {}; doc.querySelectorAll('.opt').forEach(o => (qs[o.dataset.id] = qs[o.dataset.id] || []).push(o.dataset.v)); // option values; elements are re-rendered on each click
for (let i = 0; i < N; i++) {
  for (const id in qs) { const v = qs[id][rnd(qs[id].length)]; const o = [...doc.querySelectorAll(`.opt[data-id="${id}"]`)].find(x => x.dataset.v === v); if (o) click(o); }
  click(doc.getElementById('revealBtn')); wb = null; click(doc.getElementById('excelBtn'));
  if (!wb) { fails.push('run ' + i + ': no export'); continue; }
  const tpl = w.XLSX.utils.sheet_to_json(wb.Sheets['Templates']);
  tpl.forEach(r => { if (!r.package) fails.push(`run ${i}: Templates row "${r.template_name}" has an empty package column`); });
  // full recommendation list (PMO + routed), exactly what the on-screen panel shows
  const rows = JSON.parse(w.eval('JSON.stringify(window.__ARTIFACTS_FULL||[])')).map(a => ({ template_name: a.nm, package: PK[a.nm] }));
  const docs = new Set(w.XLSX.utils.sheet_to_json(wb.Sheets['Documents'], { header: 1 }).filter(r => /^\d+$/.test(String(r[5]))).map(r => r[0]));
  for (const r of rows) {
    seenPkgs.add(r.package);
    if (!r.package) fails.push(`run ${i}: "${r.template_name}" has no package`);
    else if (!docs.has(r.package)) fails.push(`run ${i}: "${r.template_name}" -> package "${r.package}" missing from Documents sheet`);
  }
}
const uniq = [...new Set(fails.map(f => f.replace(/^run \d+: /, '')))];
console.log(`${N} random answer sets · ${seenPkgs.size} packages exercised · ${doc.querySelectorAll('.opt.sel, .opt.on, .opt[aria-pressed="true"]').length} options selected on last run`);
if (uniq.length) { console.log(`FAIL (${uniq.length} distinct):`); uniq.forEach(f => console.log('  - ' + f)); process.exit(1); }
console.log('PASS — every recommended document maps to a package that appears on the Documents checklist.');
})();
