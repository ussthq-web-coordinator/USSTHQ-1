const fs=require('fs');
const s=fs.readFileSync(__dirname+'\\rsyc-templates.js','utf8');
console.log('rsyc-modal-schedule- occurrences:', (s.match(/rsyc-modal-schedule-/g)||[]).length);
console.log('id="rsyc-modal- occurrences:', (s.match(/id=\"rsyc-modal-/g)||[]).length);

// Print a short sample around the first schedule modal occurrence
const idx = s.indexOf('rsyc-modal-schedule-');
if (idx !== -1) {
    const start = Math.max(0, idx-80);
    console.log('sample context:', s.slice(start, idx+80));
} else {
    console.log('no literal "rsyc-modal-schedule-" found in file (templates use template strings)');
}
// (clean)