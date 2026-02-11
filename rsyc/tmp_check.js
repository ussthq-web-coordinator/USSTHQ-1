const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'rsyc-templates.js');
const s = fs.readFileSync(file, 'utf8');
console.log('view-all-btn present:', s.includes('view-all-btn'));
console.log('data-modal present:', s.includes('data-modal="rsyc-modal-schedule-'));
const modals = [...s.matchAll(/id=\"rsyc-modal-([^\"]+)\"/g)].map(m => m[1]);
console.log('modals count:', modals.length);
console.log('sample modals:', modals.slice(0,6));
