const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('rsyc/rsyc-templates.js','utf-8');
const sandbox = { window: { addEventListener: ()=>{} }, document: { addEventListener: ()=>{}, querySelectorAll: ()=>[], querySelector: ()=>null, getElementById: ()=>null, body:{}, createElement:()=>({}) }, navigator:{ userAgent: '' } };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const RSYCTemplates = sandbox.window.RSYCTemplates;
if (!RSYCTemplates) {
  console.error('no RSYCTemplates');
  process.exit(1);
}

const gen = new RSYCTemplates();

const schedule = {
  id: 'test1',
  title: 'Sample',
  subtitle: '',
  description: '',
  scheduleDays: ['Monday','Wednesday'],
  scheduleTime: '1pm-3pm',
  frequency: 'Weekly',
  timezone: '',
  startDate: '',
  endDate: ''
};

const html = gen.generateSchedules({center:{name:'Test'}, schedules:[schedule], events:[]}, ['schedules']);
console.log('generated html length', html.length);
console.log(html);
