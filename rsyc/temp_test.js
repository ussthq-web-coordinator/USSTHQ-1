const fs=require('fs');
const path='c:/Users/orientrius.cook/OneDrive - SAUSS/Documents/GitHub/USSTHQ-1/rsyc/rsyc-templates.js';
const code=fs.readFileSync(path,'utf-8');
// stub minimal browser globals used by templates
global.window = { addEventListener: () => {}, removeEventListener: () => {} };
global.window.makeContactsClickable = (x)=>x;
// stub minimal document
global.document = {
    addEventListener: () => {},
    querySelector: () => null,
    createElement: () => ({ appendChild: ()=>{}, setAttribute: ()=>{}, style: {} }),
};

eval(code);
// RSYCTemplates is defined in conditional block; grab from window if available
const TemplateClass = (typeof RSYCTemplates !== 'undefined' ? RSYCTemplates : (window && window.RSYCTemplates));
if (!TemplateClass) {
    console.error('RSYCTemplates class not found');
    process.exit(1);
}
// override prototype helper to avoid DOM dependency
TemplateClass.prototype.preserveLineBreaks = function(s){ return (s||'').toString(); };
const gen=new TemplateClass();
const data={center:[{sharePointId:1,name:'Test Center'}],schedules:[{id:1,title:'Test Program',subtitle:'Sub',description:'Desc',address:'123 Main St',city:'Hickory',state:'NC',postalCode:'28601',contactPhoneNumber:'(555) 121-2121',scheduleDays:['Monday'],scheduleTime:'3 PM - 5 PM',whatToBring:'Please bring water',materialsProvided:'Snacks provided'}],events:[{id:10,title:'Fun Fair',subtitle:'Community event',description:'Enjoy a day of games!','StartDateandTime':'2025-04-01T10:00:00','EndDateandTime':'2025-04-01T14:00:00',_startTimestamp:Date.now(),cost:'Free',whatToBring:'Bring sunscreen'}]};
const html=gen.generateSchedules(data);
console.log(html);
