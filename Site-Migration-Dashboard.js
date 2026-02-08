
/* Migration Dates module: FullCalendar (grid) + Agenda (list) + Table (Tabulator) */
const _migrationSampleData = [
  {
    "Site Title": "USA National Homepage",
    "Migration Date": "2025-04-03",
    "View Website URL": "https://www.salvationarmyusa.org/",
    "Division": "USA National",
    "meta.zuid": "",
    "meta.title": "USA National Homepage",
    "Path Part": "/",
    "meta.description": ""
  },
  {
    "Site Title": "USA Southern Territory",
    "Migration Date": "2025-05-08",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/",
    "Division": "USA Southern Territory",
    "meta.zuid": "",
    "meta.title": "USA Southern Territory",
    "Path Part": "/usa-southern-territory/",
    "meta.description": ""
  },
  {
    "Site Title": "North and South Carolina",
    "Migration Date": "2025-08-21",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/north-and-south-carolina/",
    "Division": "North and South Carolina",
    "meta.zuid": "7-fcbb8f98c9-r7nxlf",
    "meta.title": "North and South Carolina Division",
    "Path Part": "/usa-southern-territory/north-and-south-carolina/",
    "meta.description": "The Salvation Army USA | North and South Carolina Division Headquarters"
  },
  {
    "Site Title": "Potomac",
    "Migration Date": "2025-09-05",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/potomac/",
    "Division": "Potomac",
    "meta.zuid": "7-f0f9b5c4ec-xb359v",
    "meta.title": "Potomac Division",
    "Path Part": "/usa-southern-territory/potomac/",
    "meta.description": "The Salvation Army USA | Potomac Division Headquarters"
  },
  {
    "Site Title": "Kentucky and Tennessee",
    "Migration Date": "2025-10-01",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/kentucky-and-tennessee/",
    "Division": "Kentucky and Tennessee",
    "meta.zuid": "7-dac2a589bf-2klwh6",
    "meta.title": "Kentucky and Tennessee Division",
    "Path Part": "/usa-southern-territory/kentucky-and-tennessee/",
    "meta.description": "The Salvation Army USA | Kentucky and Tennessee Division Headquarters"
  },
  {
    "Site Title": "Arkansas and Oklahoma",
    "Migration Date": "2025-10-02",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/arkansas-and-oklahoma/",
    "Division": "Arkansas and Oklahoma",
    "meta.zuid": "7-f4cfbc98a0-bhnrr5",
    "meta.title": "Arkansas and Oklahoma Division",
    "Path Part": "/usa-southern-territory/arkansas-and-oklahoma/",
    "meta.description": "The Salvation Army USA | Arkansas and Oklahoma Division Headquarters"
  },
  {
    "Site Title": "Alabama, Louisiana, and Mississippi",
    "Migration Date": "2025-10-23",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/alabama-louisiana-and-mississippi/",
    "Division": "Alabama, Louisiana, and Mississippi",
    "meta.zuid": "7-f68ddd8c96-x07gqx",
    "meta.title": "Alabama, Louisiana and Mississippi Division",
    "Path Part": "/usa-southern-territory/alabama-louisiana-and-mississippi/",
    "meta.description": "The Salvation Army USA | Alabama, Louisiana and Mississippi Division Headquarters"
  },
  {
    "Site Title": "Texas",
    "Migration Date": "2025-10-23",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/texas/",
    "Division": "Texas",
    "meta.zuid": "7-8cb2cdb7d3-v7g7zn",
    "meta.title": "Texas Division",
    "Path Part": "/usa-southern-territory/texas/",
    "meta.description": "The Salvation Army USA | Texas Division Headquarters"
  },
  {
    "Site Title": "Florida",
    "Migration Date": "2026-01-28",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/florida/",
    "Division": "Florida",
    "meta.zuid": "7-d4ecfdb8aa-ggn7w9",
    "meta.title": "Florida Division",
    "Path Part": "/usa-southern-territory/florida/",
    "meta.description": "The Salvation Army USA | Florida Division Headquarters"
  },
  {
    "Site Title": "Georgia",
    "Migration Date": "2026-01-29",
    "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/georgia/",
    "Division": "Georgia",
    "meta.zuid": "7-d4ebbcf3b4-lwqwp2",
    "meta.title": "Georgia Division",
    "Path Part": "/usa-southern-territory/georgia/",
    "meta.description": "The Salvation Army USA | Georgia Division Headquarters"
  },
  {
    "Site Title": "Area Command Site Pages",
    "Migration Date": "",
    "View Website URL": "",
    "Division": "We are asking site admins to review the migration report to determine pages planned to migrate and understand the level of effort needed.",
    "meta.zuid": "",
    "meta.title": "Area Command Site Pages",
    "Path Part": "",
    "meta.description": ""
  },
  {
    "Site Title": "Location Site Pages",
    "Migration Date": "",
    "View Website URL": "",
    "Division": "We are asking site admins to review the migration report to determine pages planned to migrate and understand the level of effort needed.",
    "meta.zuid": "",
    "meta.title": "Location Site Pages",
    "Path Part": "",
    "meta.description": ""
  }
];




/**
 * Site-Migration-Dashboard.js
 * 
 */

// Strict mode for better error checking
/**
 * Site-Migration-Dashboard.js
 */

// Strict mode for better error checking
'use strict';

// Prevent global namespace pollution
(function() {
  // Example: App namespace
  window.SiteMigrationDashboard = window.SiteMigrationDashboard || {};

  // Basic protection: Prevent script execution if not in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('This script must be run in a browser environment.');
  }

  // Example: Initialization function
  SiteMigrationDashboard.init = function() {
    // Initialization code here
    console.log('Site Migration Dashboard initialized.');
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SiteMigrationDashboard.init);
  } else {
    SiteMigrationDashboard.init();
  }
})();

// Inject CSS to ensure only clickable values in the QA modal Tabulator table show hover/active styles
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const css = `
      /* Prevent full-row hover highlight inside QA modal's Tabulator table */
      #qaIssuesModalBody .tabulator-row:hover { background-color: transparent !important; }
      /* Keep default cursor for cells */
      #qaIssuesModalBody .tabulator-row .tabulator-cell { cursor: default !important; background-color: transparent !important; }
      /* Make anchors visually responsive and clickable only */
      #qaIssuesModalBody .tabulator-row .tabulator-cell a { cursor: pointer !important; display: inline-block; padding: 2px 4px; border-radius: 4px; }
      #qaIssuesModalBody .tabulator-row .tabulator-cell a:hover { background-color: rgba(0,0,0,0.06); text-decoration: underline; }
      /* Remove default focus outlines/shadows in this modal table while preserving accessibility (use subtle underline instead) */
      #qaIssuesModalBody .tabulator-row .tabulator-cell:focus, #qaIssuesModalBody .tabulator-row .tabulator-cell a:focus {
        outline: none !important;
        box-shadow: none !important;
        text-decoration: underline !important;
      }
      #qaIssuesModalBody .tabulator-row .tabulator-cell a:focus { background-color: rgba(0,0,0,0.04); }

      /* Zesty preview link style: use the link emoji with a yellow underline */
      .zesty-link { text-decoration: underline; text-decoration-color: #FF5D0A; text-decoration-thickness: 1px; text-underline-offset: 2px; color: inherit; font-size: 14px; display:inline-block; }
      .zesty-link:hover { text-decoration-color: #f39c12; }
    `;
    const s = document.createElement('style');
    s.setAttribute('data-generated','qa-table-hover');
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }catch(e){/* no-op */}
});

// The earlier duplicate/partial renderQaAccordion implementation was removed to avoid
// duplicate definitions and unbalanced braces. The full `renderQaAccordion` is defined
// later in this file and will be used instead.
function formatAcDisplay(title) {
  if (!title) return "Not Set";
  if (typeof title !== 'string') return String(title);
  // Case 1: Division codes (INTLAPP_WM_DIV_USS_XXX)
  if (title.startsWith("INTLAPP_WM_DIV_USS_")) {
    return title.replace("INTLAPP_WM_DIV_USS_", "");
  }

  // Case 2: Location codes (INTLAPP_WM_LOC_USS_XXX ...)
  if (title.startsWith("INTLAPP_WM_LOC_USS_")) {
    return title.replace("INTLAPP_WM_LOC_USS_", "");
  }

  return title;
}

function updateACDropdown(filteredData) {
  const sel = document.getElementById("filterAC");
  if (!sel) return;

  // Build AC option list: prefer AC, fallback to Local when AC is empty
  const options = [...new Set(filteredData.map(d => (d["Area Command Admin Group.title"] || d["Local Web Admin Group.title"] || 'Not Set')))].sort();

  sel.innerHTML = "<option value=''>All</option>" + options.map(o => {
    const displayText = formatAcDisplay(o); // formatted for dropdown
    return `<option value="${o}">${displayText}</option>`; // keep original value
  }).join("");
}

// --- Filter utilities (borrowed from backup) ---
// Adjust label for display only
function adjustLabel(rawValue) {
  if (!rawValue) return "Not Set";
  if (typeof rawValue !== 'string') return String(rawValue);
  if (rawValue.startsWith("INTLAPP_WM_LOC_USS_")) {
    return rawValue.replace("INTLAPP_WM_LOC_USS_", "");
  }
  if (rawValue.startsWith("INTLAPP_WM_DIV_USS_")) {
    return rawValue.replace("INTLAPP_WM_DIV_USS_", "");
  }
  return rawValue;
}

// Filter mapping helpers for updateFiltersOptions
const filterMapping = {
  filterDivision: d => d.Division || "Not Set",
  filterAC: d => (d["Area Command Admin Group.title"] || d["Local Web Admin Group.title"] || "Not Set"),
  filterSiteTitle: d => d["Site Title"] || "Not Set",
  filterStatus: d => d.Status || "Not Set",
  filterPageType: d => d["Page Type"] || "Not Set",
  filterPubSym: d => d["Published Symphony"] || "Not Set",
  filterSymType: d => d["Symphony Site Type"] || "Not Set",
  // New filters
  filterPriority: d => d.Priority || "Not Set",
  filterEffort: d => d["Effort Needed"] || "Not Set",
  filterZestyUrl: d => {
    const zestyUrl = d["Zesty URL Path Part"] || "";
    return (zestyUrl && zestyUrl.toString().trim()) ? "Provided" : "Not Provided";
  }
};

function updateFiltersOptions() {
  const selected = {
    filterDivision: getSelectValue("filterDivision"),
    filterAC: getSelectValue("filterAC"),
    filterSiteTitle: getSelectValue("filterSiteTitle"),
    filterStatus: getSelectValue("filterStatus"),
    filterPageType: getSelectValue("filterPageType"),
    filterPubSym: getSelectValue("filterPubSym"),
    filterSymType: getSelectValue("filterSymType"),
    filterPriority: getSelectValue("filterPriority"),
    filterEffort: getSelectValue("filterEffort"),
    filterZestyUrl: getSelectValue("filterZestyUrl")
  };

  // Read Modified date inputs so option lists can be constrained by date range as well
  const modFromEl = document.getElementById('filterModifiedFrom');
  const modToEl = document.getElementById('filterModifiedTo');
  const modFromMs = dateToUtcMidnightMs(modFromEl && modFromEl.value);
  const modToMs = dateToUtcMidnightMs(modToEl && modToEl.value);

  Object.keys(filterMapping).forEach(filterId => {
    const dropdown = document.getElementById(filterId);
    if (!dropdown) return;

    const otherSelected = { ...selected };
    delete otherSelected[filterId];

    const filteredData = tableData.filter(d => {
      // honor other selected dropdowns
      const ok = Object.keys(otherSelected).every(fId => {
        const val = otherSelected[fId];
        if (!val) return true;
        const fieldFn = filterMapping[fId];
        return fieldFn(d) === val;
      });
      if (!ok) return false;

      // honor Modified date range when computing options
  if (modFromMs && (!d.Modified || dateToUtcMidnightMs(d.Modified) === null || dateToUtcMidnightMs(d.Modified) < modFromMs)) return false;
  if (modToMs && (!d.Modified || dateToUtcMidnightMs(d.Modified) === null || dateToUtcMidnightMs(d.Modified) > modToMs)) return false;

      return true;
    });

    let values = [...new Set(filteredData.map(filterMapping[filterId]))];
    if (filterId === 'filterAC') {
      values = values.sort((a, b) => adjustLabel(String(a)).localeCompare(adjustLabel(String(b)), undefined, { sensitivity: 'base' }));
    } else {
      values = values.sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));
    }

    const currentValue = selected[filterId];

    let optionsHtml = "<option value=''>All</option>" + values.map(v => {
      const label = adjustLabel(v);
      return `<option value="${v}" ${currentValue === v ? 'selected' : ''}>${label}</option>`;
    }).join("");

    if (currentValue && !values.includes(currentValue)) {
      const label = adjustLabel(currentValue);
      optionsHtml += `<option value="${currentValue}" selected>${label} (Unavailable)</option>`;
    }

    dropdown.innerHTML = optionsHtml;
    try { if (currentValue) dropdown.value = currentValue; else dropdown.value = ""; } catch(e) {}
  });
}

function updateFiltersAndDashboard(){
  updateFiltersOptions();
  updateDashboard();
}

function getFilteredData(){
  const div = getSelectValue("filterDivision");
  const ac = getSelectValue("filterAC");
  const status = getSelectValue("filterStatus");
  const pageType = getSelectValue("filterPageType");
  const pubSym = getSelectValue("filterPubSym");
  const symType = getSelectValue("filterSymType");
  const priority = getSelectValue("filterPriority");
  const effort = getSelectValue("filterEffort");
  const siteTitle = getSelectValue("filterSiteTitle");
  const zestyUrl = getSelectValue("filterZestyUrl");
  const modFromEl = document.getElementById('filterModifiedFrom');
  const modToEl = document.getElementById('filterModifiedTo');
  const modifiedFromMs = dateToUtcMidnightMs(modFromEl && modFromEl.value);
  const modifiedToMs = dateToUtcMidnightMs(modToEl && modToEl.value);

  return tableData.filter(d => {
    // Helper to match Not Set (blank/null/missing)
    function isNotSet(val) {
      return val === undefined || val === null || String(val).trim() === '';
    }
    // Division
    if (div) {
      if (div === 'Not Set') {
        if (!isNotSet(d.Division)) return false;
      } else if (d.Division !== div) return false;
    }
    // Area Command
    if (ac) {
      if (ac === 'Not Set') {
        if (!isNotSet(d["Area Command Admin Group.title"]) && !isNotSet(d["Local Web Admin Group.title"])) return false;
      } else if (d["Area Command Admin Group.title"] !== ac && d["Local Web Admin Group.title"] !== ac) return false;
    }
    // Status
    if (status) {
      if (status === 'Not Set') {
        if (!isNotSet(d.Status)) return false;
      } else if (d.Status !== status) return false;
    }
    // Page Type
    if (pageType) {
      if (pageType === 'Not Set') {
        if (!isNotSet(d["Page Type"])) return false;
      } else if (d["Page Type"] !== pageType) return false;
    }
    // Published Symphony
    if (pubSym) {
      if (pubSym === 'Not Set') {
        if (!isNotSet(d["Published Symphony"])) return false;
      } else if (d["Published Symphony"] !== pubSym) return false;
    }
    // Symphony Site Type
    if (symType) {
      if (symType === 'Not Set') {
        if (!isNotSet(d["Symphony Site Type"])) return false;
      } else if (d["Symphony Site Type"] !== symType) return false;
    }
    // Priority
    if (priority) {
      if (priority === 'Not Set') {
        if (!isNotSet(d.Priority)) return false;
      } else if ((d.Priority || '') !== priority) return false;
    }
    // Effort Needed
    if (effort) {
      if (effort === 'Not Set') {
        if (!isNotSet(d["Effort Needed"])) return false;
      } else if ((d["Effort Needed"] || '') !== effort) return false;
    }
    // Site Title
    if (siteTitle) {
      if (siteTitle === 'Not Set') {
        if (!isNotSet(d["Site Title"])) return false;
      } else if (d["Site Title"] !== siteTitle) return false;
    }
    // Zesty URL
    if (zestyUrl) {
      const zestyUrlValue = d["Zesty URL Path Part"] || "";
      const zestyStatus = (zestyUrlValue && zestyUrlValue.toString().trim()) ? "Provided" : "Not Provided";
      if (zestyStatus !== zestyUrl) return false;
    }
    // Modified date range
    if (modifiedFromMs && (!d.Modified || dateToUtcMidnightMs(d.Modified) === null || dateToUtcMidnightMs(d.Modified) < modifiedFromMs)) return false;
    if (modifiedToMs && (!d.Modified || dateToUtcMidnightMs(d.Modified) === null || dateToUtcMidnightMs(d.Modified) > modifiedToMs)) return false;
    return true;
  });
}

const qaIssueDetailsMap = {};
// Master lookup populated from CSV (lookupValue -> {why, how, howDetails})
let qaLookupMaster = {};

// Top-level runtime state (shared across functions)
let table, tableData = [], charts = {}, pageCache = {}, qaGroupedCache = {}, masterData;
let tableResizeListenerAdded = false;
// Top-level chart handles (Chart.js instances) — initialized to null so renderCharts can safely destroy/create
let statusChart = null;
let priorityChart = null;
let pageTypeChart = null;
let pubSymChart = null;
let effortChart = null;
// Breakdown toggle states
let showStatusBreakdown = false;
let showHidden = false;
let show100Only = false;
let hideProgressBars = false; // Track if progress bars should be hidden
let userToggledHidden = false; // Track if user manually toggled the 0% visibility
// Helper: transform raw counts to visually compressed values for pie slices
// while preserving raw counts for tooltips. Methods: 'sqrt' (default), 'log', or 'none'.
function transformCountsForPie(rawCounts, method = 'sqrt'){
  if (!Array.isArray(rawCounts)) return rawCounts;
  const fn = method === 'log' ? (v => v > 0 ? Math.log10(v + 1) : 0) : (v => v > 0 ? Math.sqrt(v) : 0);
  // Map numbers, preserving zeros and coercing non-numeric to 0
  return rawCounts.map(v => {
    const n = Number(v) || 0;
    return n === 0 ? 0 : fn(n);
  });
}
// Application version (edit this value to bump text shown on the page)
// Keep this value here so you can edit it directly in the JS without relying on DashboardData.json
const APP_VERSION = '2602.08.1611';
// Also expose to window so you can tweak at runtime in the browser console if needed
window.APP_VERSION = window.APP_VERSION || APP_VERSION;

// Global status color map (used by multiple renderers)
const statusColors = {
  "Do Not Migrate": "#E74C3C", // red
  "Completed": "#28a745",      // green
  "In QA": "#fd7e14",          // orange
  "Needs Info": "#002056",     // navy
  "Pending Migration": "#0D6FB8", // light blue
  "In Progress": "#6f42c1",    // purple
  "THQ Redirect": "#00929C",    // teal
  "Unknown": "#6c757d"         // gray
};

// Safe helper to read select values when an element may be missing
function getSelectValue(id){
  try{ const el = document.getElementById(id); return el ? el.value : ""; }catch(e){ return ""; }
}

// Tiny CSV parser for the QA lookup file (assumes first row headers)
function parseCsv(text){
  const lines = text.split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g,'').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++){
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = [];
    let cur = '';
    let inQuote = false;
    for (let j=0;j<line.length;j++){
      const ch = line[j];
      if (ch === '"') { inQuote = !inQuote; cur += ch; }
      else if (ch === ',' && !inQuote){ parts.push(cur.trim().replace(/^"|"$/g,'')); cur = ''; }
      else cur += ch;
    }
    if (cur.length) parts.push(cur.trim().replace(/^"|"$/g,''));
    const obj = {};
    for (let k=0;k<headers.length;k++) obj[headers[k]] = parts[k] || '';
    rows.push(obj);
  }
  return rows;
}

async function loadQaLookupCsv(){
  const url = 'Website QA Issues.csv';
  try{
    const r = await fetch(url);
    if (!r.ok) throw new Error('CSV not found');
    const text = await r.text();
    const rows = parseCsv(text);
    qaLookupMaster = {};
    rows.forEach(rw => {
      const key = (rw['Item That May Need Fixing on the Page'] || '').trim();
      if (!key) return;
      qaLookupMaster[key] = {
        why: rw['Why This Is Important'] || '',
        how: rw['How to Fix'] || '',
        howDetails: rw['How to Fix Details'] || ''
      };
    });
    console.info('QA lookup CSV loaded', Object.keys(qaLookupMaster).length);
  }catch(e){ console.warn('Failed to load QA CSV', e); qaLookupMaster = {}; }
  
}

// Load dashboard data: prefer local `DashboardData.json` then CDN; populate runtime state and initialize UI
(async function loadDashboardData(){
  const localUrl = 'DashboardData.json';
  const cdnUrl = 'https://hopewell.pages.dev/DashboardData.json';
  let json = null;
  try{
    // Try local file first. Read as text and parse safely so an empty file doesn't throw.
    try{
      const r = await fetch(localUrl);
      if (r && r.ok){
        const txt = await r.text();
        if (txt && txt.trim()){
          try{
            json = JSON.parse(txt);
          }catch(parseErr){
            console.warn('Local DashboardData.json found but JSON.parse failed, will try CDN...', parseErr);
            json = null;
          }
        } else {
          console.warn('Local DashboardData.json is empty, trying CDN...');
        }
      }
    }catch(e){ console.warn('Local DashboardData.json fetch failed, trying CDN...', e); }

    // Try CDN if local not usable. Also parse text safely and provide clearer errors.
    if (!json){
      const r2 = await fetch(cdnUrl);
      if (!r2.ok) throw new Error('Failed to load remote dashboard JSON');
      const txt2 = await r2.text();
      if (!txt2 || !txt2.trim()) throw new Error('Remote DashboardData.json is empty');
      try{
        json = JSON.parse(txt2);
      }catch(parseErr){
        throw new Error('Remote DashboardData.json parse failed: ' + (parseErr && parseErr.message));
      }
    }

    // Show refreshDate if present (use window.APP_VERSION as the authoritative version)
    if (json && (json.refreshDate || json.refresh_date || json.refresh)){
      const refreshEl = document.getElementById('refreshDate');
      if (refreshEl){
        const raw = json.refreshDate || json.refresh_date || json.refresh;
        let formatted = raw;
        const parsedDate = new Date(raw);
        if (!isNaN(parsedDate.getTime())){
          formatted = parsedDate.toLocaleString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true, timeZoneName:'short' });
        }
        const ver = (window.APP_VERSION || APP_VERSION);
        refreshEl.textContent = `v${ver} · Data last refreshed: ${formatted}`;
      }
    }

    // Load QA lookup CSV (best-effort) so we can enrich per-page QA details
    try{ await loadQaLookupCsv(); }catch(e){ console.warn('QA lookup CSV load failed', e); }

    // Process table data
    tableData = Array.isArray(json) ? json : (json.data || []);
    pageCache = {};
    tableData.forEach((d,i)=>{ 
      d._id = i; 
      // Compute a numeric timestamp to use for accurate sorting of the Modified column.
      // Try Date.parse first (handles ISO timestamps), fall back to dateToUtcMidnightMs
      // for date-only strings where timezone-aware midnight is desired.
      let ms = null;
      try {
        if (d && d.Modified) {
          const parsed = Date.parse(d.Modified);
          if (!isNaN(parsed)) ms = parsed;
          else {
            const tzMs = dateToUtcMidnightMs(d.Modified);
            if (tzMs !== null) ms = tzMs;
          }
        }
      } catch(e) { ms = null; }
      d._ModifiedMs = ms || 0;
      pageCache[i] = d; 
    });

    // Diagnostics: report distribution of Modified strings and parsing success so
    // we can understand why sorting shows only a couple of dates.
    try {
      const modCounts = {};
      let parsedCount = 0;
      const failedSamples = [];
      tableData.forEach((r, idx) => {
        const raw = (r && (r.Modified || '')).toString();
        modCounts[raw] = (modCounts[raw] || 0) + 1;
        if (r && r._ModifiedMs && Number(r._ModifiedMs) > 0) parsedCount++;
        else if (failedSamples.length < 10) failedSamples.push({ idx, raw });
      });
      const distinct = Object.keys(modCounts).length;
      console.info('[Diagnostics] Modified values: distinct=', distinct, 'parsedCount=', parsedCount, 'total=', tableData.length);
      // show top 10 most common Modified strings
      const top = Object.entries(modCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
      console.info('[Diagnostics] Top Modified strings (value,count)=', top);
      if (failedSamples.length) console.info('[Diagnostics] Sample parse failures (index,raw)=', failedSamples);
    } catch(e) { console.warn('Diagnostics collection failed', e); }
    masterData = tableData;

    // Initialize filters and render the dashboard — let errors surface
    if (typeof initFilters === 'function') initFilters();
    if (typeof updateDashboard === 'function') updateDashboard();

    try{ window.__SM_dashboard = window.__SM_dashboard || {}; window.__SM_dashboard.loaded = true; window.__SM_dashboard.rowCount = tableData.length; }catch(e){}
    console.info('Site Migration Dashboard data loaded', { rows: tableData.length });
  }catch(err){
    console.error('Dashboard data load failed', err);
    // Fallback: use embedded sample data so the dashboard remains usable in dev or when
    // both local and remote JSON are unavailable or invalid.
    try{
      console.info('Falling back to embedded _migrationSampleData');
      json = { data: Array.isArray(_migrationSampleData) ? _migrationSampleData : [] };
      tableData = json.data;
      pageCache = {};
      tableData.forEach((d,i)=>{ d._id = i; pageCache[i] = d; d._ModifiedMs = dateToUtcMidnightMs(d.Modified) || 0; });
      masterData = tableData;
      try{ if (typeof initFilters === 'function') initFilters(); }catch(e){}
      try{ if (typeof updateDashboard === 'function') updateDashboard(); }catch(e){}
      try{ window.__SM_dashboard = window.__SM_dashboard || {}; window.__SM_dashboard.loaded = true; window.__SM_dashboard.rowCount = tableData.length; }catch(e){}
      console.info('Dashboard loaded from embedded sample data', { rows: tableData.length });
    }catch(e){
      console.error('Fallback to embedded sample data failed', e);
    }
  }
})();

// --- QA Accordion rendering (one card per page, aggregated issues) ---
function renderQaAccordion(data){
  const container = document.getElementById("qaGroupsBody");
  if (!container) return;
  container.innerHTML = "";

  // Clear previous per-instance QA details to avoid accumulating duplicates across re-renders
  Object.keys(qaIssueDetailsMap).forEach(k => delete qaIssueDetailsMap[k]);

  const qaRows = Array.isArray(data) ? data.filter(d => d["QA Issues.lookupValue"]) : [];

  const badge = document.getElementById("qaBadge");
  if (badge) badge.textContent = qaRows.length;

  // Always update the View All Issues button count, even if 0
  try {
    const viewBtn = document.getElementById('viewAllQaBtn');
    const viewCount = document.getElementById('viewAllQaCount');
    if (viewCount) viewCount.textContent = qaRows.length || 0;
    if (viewBtn) viewBtn.style.display = (qaRows.length > 0) ? '' : 'none';
  } catch(e) {}

  if(!qaRows.length){
    container.innerHTML = "<p>No QA Issues found.</p>";
    return;
  }

  // Group rows by page title
  qaGroupedCache = {};
  qaRows.forEach(d => {
    const pageTitle = d.Title || "Untitled Page";
    qaGroupedCache[pageTitle] = qaGroupedCache[pageTitle] || [];
    qaGroupedCache[pageTitle].push(d);
  });

  const rowDiv = document.createElement('div');
  rowDiv.className = 'row g-3';

  const frag = document.createDocumentFragment();

  Object.keys(qaGroupedCache).sort().forEach(title => {
    const rows = qaGroupedCache[title];
    const page = pageCache[rows[0]._id];
    if (!page) return;

  // Per-page accumulators
  const pageIssueIds = [];
  const uniqueWhysSet = new Set();
  const uniqueLookupsSet = new Set();

    // Build issue instances for the page
    rows.forEach(r => {
      const lookups = (r["QA Issues.lookupValue"] || "").split(";").map(s => s.trim()).filter(Boolean);
      const whys = (r["QA Issues:Why This Is Important"] || "").split(";").map(s => s.trim());
      const hows = (r["QA Issues:How to Fix"] || "").split(";").map(s => s.trim());
      const howDetailsArr = (r["QA Issues:How to Fix Details"] || "").split(";").map(s => s.trim());

      for (let idx = 0; idx < lookups.length; idx++) {
        const issue = lookups[idx];
        if (!issue) continue;
        const why = whys[idx] || "";
        const how = hows[idx] || "";
        const howDetails = howDetailsArr[idx] || "";

        // Create a DOM-safe ID (only letters, numbers, hyphen, underscore)
        const rawIssueId = `${page.ID}_${title}_${idx}_${Math.random().toString(36).substr(2,6)}`;
        const issueId = String(rawIssueId).replace(/[^a-zA-Z0-9-_]/g, '_');

        // Prefer enriched details from QA lookup CSV when available
        const master = qaLookupMaster && qaLookupMaster[issue];
        const effectiveWhy = (master && master.why) ? master.why : why;
        const effectiveHow = (master && master.how) ? master.how : how;
  // If a master lookup row exists, prefer its howDetails value even if empty.
  // This ensures that when the CSV doesn't provide How to Fix Details we do
  // NOT fall back to the page row's value and therefore the accordion
  // section will be hidden for that issue.
  const effectiveHowDetails = master ? (master.howDetails || "") : howDetails;

        qaIssueDetailsMap[issueId] = {
          pageTitle: title,
          lookupValue: issue,
          why: effectiveWhy,
          how: effectiveHow,
          howDetails: effectiveHowDetails,
          pageId: page.ID
        };

        pageIssueIds.push(issueId);
        if (effectiveWhy) uniqueWhysSet.add(effectiveWhy);
        if (issue) uniqueLookupsSet.add(issue);
      }
    });

    // After building all issues for the page, render one card representing the page
    if (pageIssueIds.length){
      const firstIssueId = pageIssueIds[0];
      const uniqueWhys = Array.from(uniqueWhysSet);
      const subtitleBase = uniqueWhys.length ? (uniqueWhys[0].length > 120 ? uniqueWhys[0].slice(0,120) + '…' : uniqueWhys[0]) : '';
      const moreCount = Math.max(0, uniqueWhys.length - 1);
      const subtitle = subtitleBase + (moreCount > 0 ? ` (+${moreCount} more)` : '');

      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
      const card = document.createElement('div'); card.className = 'card h-100 qa-page-card';
      const cardBody = document.createElement('div'); cardBody.className = 'card-body d-flex flex-column';

    // Center the title within the card header
    const headerDiv = document.createElement('div'); headerDiv.className = 'd-flex flex-column align-items-center';
    const titleEl = document.createElement('h6'); titleEl.className = 'card-title mb-1 text-center mx-3'; titleEl.style.cursor = 'pointer'; titleEl.innerText = page.Title || page['Site Title'] || title;
    headerDiv.appendChild(titleEl);

  // Site title (small muted) and lookup info
  const siteTitleEl = document.createElement('div'); siteTitleEl.className = 'card-subtitle text-muted small mb-1 mt-2'; siteTitleEl.innerText = page['Site Title'] || '';
  const lookupArray = Array.from(uniqueLookupsSet);
  const lookupText = lookupArray.length ? (lookupArray[0] + (lookupArray.length > 1 ? ` (+${lookupArray.length - 1} more)` : '')) : '';
  const lookupEl = document.createElement('div'); lookupEl.className = 'text-muted small mb-2'; lookupEl.innerText = lookupText;

  const inlineDiv = document.createElement('div'); inlineDiv.className = 'collapse';
      const quickWhy = uniqueWhys.length ? uniqueWhys[0] : '';
      inlineDiv.innerHTML = `<div class="small text-muted mt-2">${escapeHtml(quickWhy)}</div>`;

  const footer = document.createElement('div'); footer.className = 'mt-auto pt-1 d-flex justify-content-center align-items-center';
  const btn = document.createElement('button'); btn.className = 'btn btn-sm btn-primary';
  btn.innerHTML = `View Issues <span class="badge bg-warning qa-badge ms-2">${pageIssueIds.length}</span>`;
  btn.addEventListener('click', ()=> showQaIssuesModal(firstIssueId));
  footer.appendChild(btn);

      titleEl.addEventListener('click', ()=>{ inlineDiv.classList.toggle('show'); });

  cardBody.appendChild(headerDiv);
  // Page name/title shown as the main heading already in header; show site title and lookup under it
  cardBody.appendChild(siteTitleEl);
  cardBody.appendChild(lookupEl);
  cardBody.appendChild(inlineDiv);
      cardBody.appendChild(footer);
      card.appendChild(cardBody);
      col.appendChild(card);
      rowDiv.appendChild(col);
    }
  });

  frag.appendChild(rowDiv);
  // Defer appending to avoid layout thrash when many nodes are created
  requestAnimationFrame(()=>{ container.appendChild(frag); });

  // Update the 'View All Issues' button count and wire it up
  try{
    const viewBtn = document.getElementById('viewAllQaBtn');
    const viewCount = document.getElementById('viewAllQaCount');
    if(viewCount) viewCount.textContent = qaRows.length || 0;
    if(viewBtn){
      viewBtn.removeEventListener('click', showAllQaModal);
      viewBtn.addEventListener('click', showAllQaModal);
    }
  }catch(e){ /* no-op */ }
}


// --- QA Modal with one accordion per unique issue ID ---


function showQaIssuesModal(issueId){
  const modalEl = document.getElementById("qaIssuesModal");
  const modalBody = document.getElementById("qaIssuesModalBody");
  if (!modalEl || !modalBody) return console.warn('Modal elements missing');

  const issueData = qaIssueDetailsMap[issueId];
  if (!issueData) {
    modalBody.innerHTML = `<p>Issue data not found for ID: ${escapeHtml(issueId)}</p>`;
    new bootstrap.Modal(modalEl).show();
    return;
  }

  const pageTitle = issueData.pageTitle;
  const rows = qaGroupedCache[pageTitle] || [];
  const page = pageCache[rows[0]._id];

  // We'll defer building and inserting the heavy modal content until the modal is shown
  modalBody.innerHTML = '';
  const headerH4 = document.createElement('h4'); headerH4.className = 'mb-3'; headerH4.innerText = (page["Site Title"] || page.Title || "Untitled Page");
  modalBody.appendChild(headerH4);

  // Show the modal first, then append content and initialize Tabulator after it's visible to avoid aria-hidden focus issues
  const bs = new bootstrap.Modal(modalEl);
  bs.show();

  const onShown = function(){
    try{ modalEl.removeEventListener('shown.bs.modal', onShown); }catch(e){}

    requestAnimationFrame(()=>{
      // --- Tabulator Table ---
  const tableContainer = document.createElement("div");
  // class for modal-specific table styling (wrapping Title and QA Notes)
  tableContainer.className = 'qa-modal-table-container';
  modalBody.appendChild(tableContainer);

      // Choose a dynamic table height on small screens so the user doesn't have to scroll as much.
      // Use a percentage of the viewport height with a sensible minimum.
      const modalWidth = modalBody.clientWidth || window.innerWidth;
      const rowsCount = 1; // local data here is usually a single page object; keep placeholder if logic changes
      // If the result set is small, let Tabulator size to content (auto). Only apply a bounded
      // numeric height when there are many rows so the modal doesn't become enormous.
      let tableHeight;
      // We'll compute rowsCount from tableData below and pick sizing accordingly

      const tableData = [{
        ID: page.ID,
        Title: page.Title,
        "Page URL": page["Page URL"],
        "Zesty URL Path Part": page["Zesty URL Path Part"],
        Status: page.Status || "N/A",
        Priority: page.Priority || "N/A",
        "QA Notes": page["QA Notes"] || "",
        "Symphony Site Type": page["Symphony Site Type"] || ""
      }];

      // Rows count for the small per-page table (usually 1). If this ever becomes multiple rows
      // the sizing will grow accordingly. Use 'auto' when few rows so table matches content.
      const actualRows = Array.isArray(tableData) ? tableData.length : 0;
      if (actualRows <= 6) {
        tableHeight = 'auto';
        tableContainer.style.minHeight = '';
      } else {
        const vh = (window.innerHeight || document.documentElement.clientHeight) || 640;
        // Use 45% of viewport height, bounded between 180px and 320px for reasonable sizes
        const computed = Math.floor(vh * 0.45);
        const bounded = Math.max(180, Math.min(320, computed));
        tableHeight = bounded;
        tableContainer.style.minHeight = tableHeight + 'px';
      }

      const table = new Tabulator(tableContainer, {
        data: tableData,
        layout: window.innerWidth < 600 ? "fitDataFill" : "fitColumns",
        reactiveData: true,
        autoColumns: false,
        height: tableHeight,
        initialSort: [{ column: "Title", dir: "asc" }], // sort by Title for QA modal table
        columns: [
          {title:"Title", field:"Title", formatter: function(cell){
            const v = cell.getValue() || "";
            // On very small viewports enforce exact 30-char truncation per UX request
            if (window.innerWidth <= 580) return escapeHtml(truncateExact(v, 30));
            return escapeHtml(v);
          }},
          {title:"Edit", field:"Form", hozAlign:"center", width:60, maxWidth:90,
            formatter: function(cell){
              const row = cell.getRow().getData();
              const id = row.ID;
              const type = (row["Symphony Site Type"] || "").trim();
              let url = "#";
              if(type==="Metro Area") url=`https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${encodeURIComponent(id)}&e=mY8mhG`;
              else if(type==="Corps") url=`https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${encodeURIComponent(id)}&e=dF11LG`;
              return `<a href="${escapeHtml(url)}" target="_blank">Form</a>`;
            }
          },
          {title:"SD", field:"Page URL", hozAlign:"center", width:55, maxWidth:64, formatter: function(cell){
            const v = cell.getValue();
            return v ? `<a href="${escapeHtml(v)}" target="_blank">🔗</a>` : "";
          }},
          {title:"ZD", field:"Zesty URL Path Part", hozAlign:"center", width:55, maxWidth:64, formatter: function(cell){
            const v = cell.getValue();
            return v ? `<a class="zesty-link" href="https://8hxvw8tw-dev.webengine.zesty.io${escapeHtml(v)}?zpw=tsasecret123&redirect=false&_bypassError=true" target="_blank" rel="noopener noreferrer" aria-label="Open Zesty preview">🔗</a>` : "--";
          }},
          {title:"Status", field:"Status", formatter: function(cell){ return escapeHtml(cell.getValue()); }},
          {title:"Priority", field:"Priority", width:55, maxWidth:64, formatter: function(cell){ return escapeHtml(cell.getValue()); }},
          {title:"QA Notes", field:"QA Notes", formatter: function(cell){ return escapeHtml(cell.getValue()); }}
        ],
        responsiveLayout:"collapse",
        responsiveLayoutCollapseStartOpen:true,
        tooltips:true
      });

      // Table created with initialSort above; avoid calling methods that may not exist

  // --- DOM-built accordion for this issue ---
  // Build a unique accordion container id for this modal instance
  const modalAccordionIdRaw = `qa_issue_accordion_${page.ID}_${Math.random().toString(36).substr(2,6)}`;
  const modalAccordionId = String(modalAccordionIdRaw).replace(/[^a-zA-Z0-9-_]/g, '_');

  const accordionDiv = document.createElement("div");
  accordionDiv.className = "accordion mt-4";
  accordionDiv.id = modalAccordionId;

  // Find all issue keys for this page (use pageId to be robust)
  const allKeys = Object.keys(qaIssueDetailsMap).filter(k => qaIssueDetailsMap[k] && String(qaIssueDetailsMap[k].pageId) === String(page.ID));

  // Deduplicate by lookupValue so we show one accordion per logical issue (not per instance)
  const lookupToKey = {};
  allKeys.forEach(k => {
    const lv = (qaIssueDetailsMap[k] && qaIssueDetailsMap[k].lookupValue) ? String(qaIssueDetailsMap[k].lookupValue).trim() : k;
    if (!lookupToKey[lv]) lookupToKey[lv] = k;
  });

  let issueKeys = Object.values(lookupToKey);

  // If we have no other keys, fall back to the provided issueId
  if (!issueKeys.length) issueKeys = [issueId];

  // Determine which index to show: prefer the requested issueId if present, otherwise show the first
  let showIndex = issueKeys.indexOf(issueId);
  if (showIndex === -1) showIndex = 0;

  issueKeys.forEach((k, index) => {
    const idSafe = k;
    const dataObj = qaIssueDetailsMap[k];
    const showClass = (index === showIndex) ? 'show' : '';

    const item = document.createElement('div');
    item.className = 'accordion-item';
    const whyPresent = dataObj.why && dataObj.why.toString().trim();
    const howPresent = dataObj.how && dataObj.how.toString().trim();
    const howDetailsPresent = dataObj.howDetails && dataObj.howDetails.toString().trim();

    item.innerHTML = `
      <h2 class="accordion-header" id="heading_${idSafe}">
        <button class="accordion-button ${showClass ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${idSafe}" aria-expanded="${showClass ? 'true' : 'false'}" aria-controls="collapse_${idSafe}">
          ${escapeHtml(dataObj.lookupValue || ('Issue ' + (index+1)))}
        </button>
      </h2>
      <div id="collapse_${idSafe}" class="accordion-collapse collapse ${showClass}" data-bs-parent="#${modalAccordionId}">
        <div class="accordion-body">
          ${whyPresent ? `<h6>Why This Is Important</h6><p>${escapeHtml(dataObj.why)}</p>` : ""}
          ${howPresent ? `<h6>How to Fix</h6><p>${escapeHtml(dataObj.how)}</p>` : ""}
          ${howDetailsPresent ? `<h6>How to Fix Details</h6><p>${escapeHtml(dataObj.howDetails)}</p>` : ""}
        </div>
      </div>
    `;

    accordionDiv.appendChild(item);
  });

  modalBody.appendChild(accordionDiv);
 

    // Focus first actionable element for accessibility (after shown)
    const firstAction = modalBody.querySelector('button, a');
    if (firstAction) firstAction.focus();

    console.log("Modal opened with issueId:", issueId);
    console.log("Available keys:", Object.keys(qaIssueDetailsMap));
  });
  };

  modalEl.addEventListener('shown.bs.modal', onShown);
}

// Show modal listing all QA issues across pages (Tabulator + accordion of lookup entries)
function showAllQaModal(){
  const modalEl = document.getElementById('allQaModal');
  const modalBody = document.getElementById('allQaModalBody');
  if(!modalEl || !modalBody) return console.warn('All QA modal elements missing');
  // Determine whether any dashboard filter is active. If none are active, prefer the
  // full master dataset so "View All Issues" truly means all issues regardless of
  // currently-visible filters.
  function anyFilterActive(){
    const ids = ["filterDivision","filterAC","filterStatus","filterPageType","filterPubSym","filterSymType","filterPriority","filterEffort","filterSiteTitle"];
    for(const id of ids){ const el = document.getElementById(id); if(el && el.value) return true; }
    const modFrom = document.getElementById('filterModifiedFrom'); const modTo = document.getElementById('filterModifiedTo');
    if ((modFrom && modFrom.value) || (modTo && modTo.value)) return true;
    return false;
  }

  // Use masterData (all rows) when no filters are active so the modal shows everything.
  const sourceData = (!anyFilterActive() && Array.isArray(masterData) && masterData.length) ? masterData : (typeof getFilteredData === 'function' ? getFilteredData() : tableData);

  // Expand multi-lookup rows into one row per individual lookup so the table shows
  // every issue separately (instead of one row per page with semicolon-separated lookups).
  const issueRows = [];
  (Array.isArray(sourceData) ? sourceData : []).forEach(r => {
    const lookups = (r['QA Issues.lookupValue'] || '').toString().split(';').map(s=>s.trim()).filter(Boolean);
    if (!lookups.length) return;
    lookups.forEach(lv => {
      issueRows.push({
        ID: r.ID,
        Title: r.Title || r['Site Title'] || '',
        'Symphony Site Type': r['Symphony Site Type'] || '',
        'Page URL': r['Page URL'] || '',
        'Zesty URL Path Part': r['Zesty URL Path Part'] || '',
        Status: r.Status || '',
        Priority: r.Priority || '',
        'QA Notes': r['QA Notes'] || '',
        'QA Issue': lv,
        'Site Title': r['Site Title'] || ''
      });
    });
  });

  const tabData = issueRows.map(r => ({
    ID: r.ID,
    Title: r.Title,
    'Symphony Site Type': r['Symphony Site Type'],
    'Page URL': r['Page URL'],
    'Zesty URL Path Part': r['Zesty URL Path Part'],
    Status: r.Status,
    Priority: r.Priority,
    'QA Notes': r['QA Notes'],
    'QA Issue': escapeHtml(r['QA Issue'] || ''),
    'Site Title': r['Site Title'] || ''
  }));
// Hold these columns for reference if we want to add them later
// 'QA Why This Is Important': r['QA Issues:Why This Is Important'] || '',
// 'QA How to Fix': r['QA Issues:How to Fix'] || '',
// 'QA How to Fix Details': r['QA Issues:How to Fix Details'] || '',


  // Show modal then create Tabulator after shown to avoid display issues
  const bs = new bootstrap.Modal(modalEl);
  modalBody.innerHTML = '';
  const headerH5 = document.createElement('h5'); headerH5.className = 'mb-3'; headerH5.innerText = `All QA Issues (${tabData.length})`;
  modalBody.appendChild(headerH5);

  const tableContainer = document.createElement('div'); tableContainer.className = 'qa-modal-table-container';
  modalBody.appendChild(tableContainer);

  const accordionContainer = document.createElement('div'); accordionContainer.className = 'mt-4';
  modalBody.appendChild(accordionContainer);

  bs.show();

  const onShown = function(){
    try{ modalEl.removeEventListener('shown.bs.modal', onShown); }catch(e){}
    requestAnimationFrame(()=>{
      // Create Tabulator
      const tbl = new Tabulator(tableContainer, {
        data: tabData,
        layout: window.innerWidth < 600 ? 'fitDataFill' : 'fitColumns',
        reactiveData: true,
        autoColumns: false,
        height: tabData.length <= 8 ? 'auto' : Math.max(220, Math.min(480, Math.floor((window.innerHeight || 700) * 0.5))),
        initialSort: [{ column: 'Title', dir: 'asc' }],
        columns: [
          {title:'Title', field:'Title', formatter: function(cell){ const v = cell.getValue()||''; if(window.innerWidth<=580) return escapeHtml(truncateExact(v,30)); return escapeHtml(v);} },
          {title:'Edit', field:'Form', hozAlign:'center', width:60, maxWidth:90, formatter: function(cell){ const row = cell.getRow().getData(); const id = row.ID; const type = (row['Symphony Site Type']||'').trim(); let url='#'; if(type==='Metro Area') url=`https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${encodeURIComponent(id)}&e=mY8mhG`; else if(type==='Corps') url=`https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${encodeURIComponent(id)}&e=dF11LG`; return `<a href="${escapeHtml(url)}" target="_blank">Form</a>`;} },
          {title:'SD', field:'Page URL', hozAlign:'center', width:55, maxWidth:64, formatter: function(cell){ const v = cell.getValue(); return v ? `<a href="${escapeHtml(v)}" target="_blank">🔗</a>` : ''; } },
          {title:'ZD', field:'Zesty URL Path Part', hozAlign:'center', width:55, maxWidth:64, formatter: function(cell){ const v = cell.getValue(); return v ? `<a class="zesty-link" href="https://8hxvw8tw-dev.webengine.zesty.io${escapeHtml(v)}?zpw=tsasecret123&redirect=false&_bypassError=true" target="_blank" rel="noopener noreferrer" aria-label="Open Zesty preview">🔗</a>` : ''; } },
          {title:'Status', field:'Status', formatter: function(cell){ return escapeHtml(cell.getValue()); } },
          {title:'Priority', field:'Priority', width:55, maxWidth:64, formatter: function(cell){ return escapeHtml(cell.getValue()); } },
          {title:'QA Notes', field:'QA Notes', formatter: function(cell){ return escapeHtml(cell.getValue()); } },
          {title:'QA Issue', field:'QA Issue', formatter: function(cell){ return cell.getValue(); } },
          // New column: Site Title placed at the end per request
          {title:'Site Title', field:'Site Title', formatter: function(cell){ return escapeHtml(cell.getValue()); } }
        ],
        responsiveLayout:'collapse',
        responsiveLayoutCollapseStartOpen:true,
        tooltips:true
      });
// Hold these columns for reference if we want to add them later
  //        {title:'QA Why', field:'QA Why This Is Important', formatter: function(cell){ return escapeHtml(cell.getValue()); } },
 //         {title:'QA How', field:'QA How to Fix', formatter: function(cell){ return escapeHtml(cell.getValue()); } },
 //         {title:'QA Details', field:'QA How to Fix Details', formatter: function(cell){ return escapeHtml(cell.getValue()); } },


      // Build accordion of unique QA lookup entries (why/how/details) across all filtered pages
      // Use the expanded issueRows so each individual lookup is represented.
      const lookupMap = {};
      issueRows.forEach(row => {
        const lv = (row['QA Issue'] || '').toString().trim();
        if (!lv) return;
        // Prefer per-page enriched details from qaIssueDetailsMap when available; keep them
        // separately so we can render master lookup fields once and page-specific
        // overrides only when they differ.
        const master = qaLookupMaster && qaLookupMaster[lv] ? qaLookupMaster[lv] : null;
        const perPage = Object.keys(qaIssueDetailsMap).map(k => qaIssueDetailsMap[k]).find(o => o && String(o.lookupValue) === String(lv) && String(o.pageId) === String(row.ID));
        const perPageWhy = perPage && perPage.why ? perPage.why : '';
        const perPageHow = perPage && perPage.how ? perPage.how : '';
        const perPageHowDetails = perPage && perPage.howDetails ? perPage.howDetails : '';
        if (!lookupMap[lv]) lookupMap[lv] = [];
        lookupMap[lv].push({
          pageTitle: row.Title || row['Site Title'] || '',
          siteTitle: row['Site Title'] || '',
          notes: row['QA Notes'] || '',
          perPageWhy: perPageWhy,
          perPageHow: perPageHow,
          perPageHowDetails: perPageHowDetails,
          master: master // keep reference to master data for convenience
        });
      });

      if(Object.keys(lookupMap).length){
        const accId = `allqa_acc_${Math.random().toString(36).substr(2,6)}`;
        const acc = document.createElement('div'); acc.className = 'accordion'; acc.id = accId;
        Object.keys(lookupMap).sort().forEach((lv, idx) => {
          const safe = String(lv).replace(/[^a-zA-Z0-9-_]/g,'_') + '_' + idx;
          const item = document.createElement('div'); item.className = 'accordion-item';

          // Use raw master data for the top-level QA fields (show once)
          const rawDataObj = qaLookupMaster && qaLookupMaster[lv] ? qaLookupMaster[lv] : null;
          let extraHtml = '';
          if (rawDataObj) {
            const whyPresent = rawDataObj.why && rawDataObj.why.toString().trim();
            const howPresent = rawDataObj.how && rawDataObj.how.toString().trim();
            const howDetailsPresent = rawDataObj.howDetails && rawDataObj.howDetails.toString().trim();
            if (whyPresent || howPresent || howDetailsPresent) {
              extraHtml += `<div class="mt-0 mb-3">`;
              extraHtml += whyPresent ? `<h4>Why This Is Important</h4><p>${escapeHtml(rawDataObj.why)}</p>` : '';
              extraHtml += howPresent ? `<h4>How to Fix</h4><p>${escapeHtml(rawDataObj.how)}</p>` : '';
              extraHtml += howDetailsPresent ? `<h4>How to Fix Details</h4><p>${escapeHtml(rawDataObj.howDetails)}</p>` : '';
              extraHtml += `</div>`;
            }
          }

          // Build pages affected list — deduplicate by page title + site
          const seenPages = new Set();
          let bodyHtml = '';
          lookupMap[lv].forEach((detail) => {
            const key = `${detail.pageTitle}||${detail.siteTitle}`;
            if (seenPages.has(key)) return;
            seenPages.add(key);
            bodyHtml += `<div class="mb-3 border-top pt-2">`;
            bodyHtml += detail.pageTitle ? `<h6 class="mt-1 fw-bold">${escapeHtml(detail.pageTitle)} - <em>${escapeHtml(detail.siteTitle)}</em></h6>` : '';
            // Show per-page why/how only if they exist and differ from master
            if (detail.perPageWhy && (!rawDataObj || rawDataObj.why !== detail.perPageWhy)) {
              bodyHtml += `<h6>Why (page-specific)</h6><p>${escapeHtml(detail.perPageWhy)}</p>`;
            }
            if (detail.perPageHow && (!rawDataObj || rawDataObj.how !== detail.perPageHow)) {
              bodyHtml += `<h6>How to Fix (page-specific)</h6><p>${escapeHtml(detail.perPageHow)}</p>`;
            }
            if (detail.perPageHowDetails && (!rawDataObj || rawDataObj.howDetails !== detail.perPageHowDetails)) {
              bodyHtml += `<h6>How to Fix Details (page-specific)</h6><p>${escapeHtml(detail.perPageHowDetails)}</p>`;
            }
            if (detail.notes) bodyHtml += `<em class="pt-1">&#x1F7E1; QA Notes</em><p>${escapeHtml(detail.notes)}</p>`;
            bodyHtml += `</div>`;
          });

          item.innerHTML = `
            <h2 class="accordion-header" id="heading_all_${safe}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_all_${safe}" aria-expanded="false" aria-controls="collapse_all_${safe}">
                ${escapeHtml(lv)}
              </button>
            </h2>
            <div id="collapse_all_${safe}" class="accordion-collapse collapse" data-bs-parent="#${accId}">
              <div class="accordion-body">
                ${extraHtml}
                <h6 class="mt-2">Pages Affected:</h6>
                ${bodyHtml}
              </div>
            </div>
          `;
          acc.appendChild(item);
        });
        accordionContainer.appendChild(acc);
      }
    });
  };
  modalEl.addEventListener('shown.bs.modal', onShown);
}

// (duplicate escapeHtml removed - single definition exists earlier)

function renderCards(){
  const filtered = getFilteredData();
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth()-1, today.getDate());
  renderOverallProgress(filtered);


    // --- metrics object ---
  const metrics = {
    "Migration Progress": (() => {
      const total = filtered.length;
      const completed = filtered.filter(d => (d.Status || '').toString().trim().startsWith('4') || (d.Status || '').toString().trim().startsWith('5')).length;
      // New THQ Redirect status should be treated as completed for progress totals
      const thqRedirect = filtered.filter(d => (d.Status || '').toString().trim() === 'THQ Redirect').length;
      const doNotMigrate = filtered.filter(d => (d.Status || '').toString().trim() === "Do Not Migrate").length;
      const progressCount = completed + thqRedirect + doNotMigrate;
      const progressPct = total > 0 ? Math.round((progressCount / total) * 100) : 0;
      return `${progressPct}% (${progressCount} of ${total} Total Pages)`;
    })(),
    // Merge Completed and THQ Redirect into a single card while keeping progress calculation unchanged
    "Completed (incl. THQ Redirect)": (() => {
      const completed = filtered.filter(d => ((d.Status || '').toString().trim().startsWith('4') || (d.Status || '').toString().trim().startsWith('5'))).length;
      const thqRedirect = filtered.filter(d => (d.Status || '').toString().trim() === 'THQ Redirect').length;
      return completed + thqRedirect;
    })(),
    "Do Not Migrate": filtered.filter(d => (d.Status || '').toString().trim() === "Do Not Migrate").length,

    "Weekly Modified": (() => {
      const today = new Date();
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - 7);
      const thisWeekCount = filtered.filter(d => d.Modified && new Date(d.Modified) >= thisWeekStart).length;
      const prevWeekStart = new Date(today);
      prevWeekStart.setDate(today.getDate() - 14);
      const prevWeekEnd = new Date(today);
      prevWeekEnd.setDate(today.getDate() - 7);
      const prevWeekCount = filtered.filter(d => d.Modified && new Date(d.Modified) >= prevWeekStart && new Date(d.Modified) < prevWeekEnd).length;
      return `This Week: ${thisWeekCount} | Last Week: ${prevWeekCount}`;
    })(),

    "QA Issues": (() => {
      const total = filtered.filter(d => d["QA Issues.lookupValue"]).length;
      const high = filtered.filter(d => d["QA Issues.lookupValue"] && d.Priority === "High").length;
      const low = total - high;
      renderCharts(filtered);
      return `High: ${high} | Low: ${low} | Total: ${total}`;
    })()
  };



function renderCharts(filtered) {
  const ctxStatus = document.getElementById("statusChart").getContext("2d");
  const ctxPriority = document.getElementById("priorityChart").getContext("2d");
  const ctxPageType = document.getElementById("pageTypeChart").getContext("2d");
  const ctxPubSym = document.getElementById("pubSymChart").getContext("2d");


  const canonicalStatus = {
    completed: ["4. THQ QA Complete, THQ will publish on migration date","5. THQ Published and URL Redirected"],
    doNotMigrate: ["Do Not Migrate"],
    thqRedirect: ["THQ Redirect"],
    inProgress: ["2a. Started Content Migration","2b. Finished Content Migration; Zesty Columns Set in this list","2c. Updates Needed, See QA Notes/Comments"],
    inQA: ["3a. Ready for Area Command QA","3b. Ready for DHQ QA","3c. Ready for THQ QA"],
    needsInfo: ["1a. Need Migration Fields set","1b. Pending Migration"],
    unknown: [""] // fallback
};



const statusCounts = {};
filtered.forEach(d => {
  let s = normalizeStatus(d.Status) || "Unknown";

 if (/^(4|5)/.test(s)) {
  s = "Completed";
} else if (s === "Do Not Migrate") {
  s = "Do Not Migrate";
} else if (/^2/.test(s)) {
  s = "In Progress";
} else if (/^1b/.test(s)) {
  s = "Pending Migration";
} else if (/^1/.test(s)) {
  s = "Needs Info";
} else if (/^3[a-d]/.test(s)) {
  s = "In QA";
} else if (s === "Needs Info") {
  s = "Needs Info";
} else {
  s = "Unknown";
}


  statusCounts[s] = (statusCounts[s] || 0) + 1;
});

  // Status chart


// Prepare data for chart
const labels = Object.keys(statusCounts);
const data = Object.values(statusCounts);
const backgroundColor = labels.map(label => statusColors[label] || "#6c757d"); // fallback gray

// Status chart (use transformed values for visual scaling)
if(statusChart) statusChart.destroy();
statusChart = new Chart(ctxStatus, {
  type: "pie",
  data: {
    labels: labels,
    datasets: [{
      // Use sqrt scaling so small categories remain visible
      data: transformCountsForPie(data, 'sqrt'),
      // Keep raw counts nearby so tooltips can reference them
      _rawCounts: data,
      backgroundColor: backgroundColor
    }]
  },
  options: {
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(ctx){
            try{
              const ds = ctx.dataset;
              const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
              const total = ds._rawCounts ? ds._rawCounts.reduce((a,b)=>a+(Number(b)||0),0) : ctx.chart._metasets[ctx.datasetIndex].total;
              const pct = total ? ((raw/total)*100).toFixed(1) : '0.0';
              return `${raw} (${pct}%)`;
            }catch(e){ return `${ctx.parsed}`; }
          }
        }
      },
      datalabels: { anchor: 'end', align: 'top' }
    }
  },
});
try{ addChartLegendModal(statusChart, 'Status'); }catch(e){}




  // Priority chart (now pie)
  const priorityCounts = {};
  filtered.forEach(d => {
    const p = d.Priority || "None";
    priorityCounts[p] = (priorityCounts[p] || 0) + 1;
  });

  if(priorityChart) priorityChart.destroy();
  priorityChart = new Chart(ctxPriority, {
    type: "pie",
    data: {
      labels: Object.keys(priorityCounts),
      datasets: [{
        data: transformCountsForPie(Object.values(priorityCounts), 'sqrt'),
        _rawCounts: Object.values(priorityCounts),
        backgroundColor: ["#002056","#f1c40f","#f39c12","#e74c3c","#3498db","#9b59b6","#16a085","#d35400","#ff6b6b"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(ctx){
              try{
                const ds = ctx.dataset;
                const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
                const total = ds._rawCounts ? ds._rawCounts.reduce((a,b)=>a+(Number(b)||0),0) : ctx.chart._metasets[ctx.datasetIndex].total;
                const pct = total ? ((raw/total)*100).toFixed(1) : '0.0';
                return `${raw} (${pct}%)`;
              }catch(e){ return `${ctx.parsed}`; }
            }
          }
        },
        datalabels: { anchor: 'end', align: 'top' }
      }
    },
  });
  try{ addChartLegendModal(priorityChart, 'Priority'); }catch(e){}

  // Page Type chart
  const pageTypeCounts = {};
  filtered.forEach(d => {
    const pt = d["Page Type"] || "Not Set";
    pageTypeCounts[pt] = (pageTypeCounts[pt] || 0) + 1;
  });

  if(pageTypeChart) pageTypeChart.destroy();
  pageTypeChart = new Chart(ctxPageType, {
    type: "pie",
    data: {
      labels: Object.keys(pageTypeCounts),
      datasets: [{
        data: transformCountsForPie(Object.values(pageTypeCounts), 'sqrt'),
        _rawCounts: Object.values(pageTypeCounts),
        backgroundColor: ["#002056","#2ecc71","#e74c3c","#f39c12","#3498db","#6f42c1"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(ctx){
              try{ const ds = ctx.dataset; const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0; const total = ds._rawCounts ? ds._rawCounts.reduce((a,b)=>a+(Number(b)||0),0) : 0; const pct = total ? ((raw/total)*100).toFixed(1) : '0.0'; return `${raw} (${pct}%)`; }catch(e){ return `${ctx.parsed}`; }
            }
          }
        },
      }
    }
  });
    try{ addChartLegendModal(pageTypeChart, 'Page Type'); }catch(e){}

  // Published Symphony chart
  const pubSymCounts = {};
  filtered.forEach(d => {
    const ps = d["Published Symphony"] || "Not Set";
    pubSymCounts[ps] = (pubSymCounts[ps] || 0) + 1;
  });

  if(pubSymChart) pubSymChart.destroy();
  pubSymChart = new Chart(ctxPubSym,{
    type:"pie",
    data:{
      labels:Object.keys(pubSymCounts),
      datasets:[{
        data: transformCountsForPie(Object.values(pubSymCounts), 'sqrt'),
        _rawCounts: Object.values(pubSymCounts),
        backgroundColor:["#002056","#e74c3c","#f39c12","#3498db","#9b59b6"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(ctx){ try{ const ds = ctx.dataset; const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0; const total = ds._rawCounts ? ds._rawCounts.reduce((a,b)=>a+(Number(b)||0),0) : 0; const pct = total ? ((raw/total)*100).toFixed(1) : '0.0'; return `${raw} (${pct}%)`; }catch(e){ return `${ctx.parsed}`; } }
          }
        }
      }
    }
  });
      try{ addChartLegendModal(pubSymChart, 'Published Symphony'); }catch(e){}
}
    // (No global exposures required — keep functions top-level and add runtime guards.)

// Cards rendering
// Old Colors '#f1c40f','#2ecc71','#e74c3c','#f39c12','#3498db','#9b59b6','#16a085','#d35400','#ff6b6b', '#f7b32b', '#4ecdc4'
  // ['#132230', '#1a3245', '#22445a', '#2b5770', '#33688a', '#3c7aa0', '#448cba', '#4d9ecf', '#55b0e5', '#5dc3f5', '#66d6ff'];
//['#0b1622', '#0f1b2d', '#132230', '#18293a', '#1d3145', '#223950', '#27415b', '#2c4966', '#315171', '#365a7c', '#3b637f'];
  const colors = [
  '#132230', 
  '#16304d', 
  '#1a3d69', 
  '#1e4a85', 
  '#2258a1', 
  '#2765bd', 
  '#2b73d9', 
  '#2f80f5'
];






  const container = document.getElementById("metricCards");
  container.innerHTML = "";
  let i=0;

  // Render existing metrics
  for(const key in metrics){
    container.innerHTML += `
      <div class="col-lg-3 col-md-6 col-sm-12 mb-1">
        <div class="card text-white" style="background-color:${colors[i++ % colors.length]}">
          <div class="card-body">
            <h5 class="card-title">${key}</h5>
            <p class="card-text">${metrics[key]}</p>
          </div>
        </div>
      </div>`;
  }


  // QA statuses breakdown (AC, DHQ, THQ) with High/Low/Total
  const qaStatuses = [
    { status: "3a. Ready for AC QA"},
    { status: "3b. Ready for DHQ QA"},
    { status: "3c. Ready for THQ QA"}
  ];

  qaStatuses.forEach(qa => {
    const counts = { high: 0, low: 0 };
    filtered.forEach(d=>{
      if(d.Status === qa.status){
        if(d.Priority==="High") counts.high++;
        else counts.low++;
      }
    });
    const total = counts.high + counts.low;

    container.innerHTML += `
      <div class="col-lg-3 col-md-6 col-sm-12 mb-1">
        <div class="card text-white" style="background-color:${colors[i++ % colors.length]}">
          <div class="card-body">
            <h5 class="card-title" style="font-size:1rem;">${qa.status}</h5>
            <div class="d-flex justify-content-around mt-2">
              <div class="text-center" style="font-size:0.9rem;">
                High: ${counts.high} | Low: ${counts.low} | Total: ${total}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  });

  renderOverallProgress(getFilteredData());


  renderBreakdown(filtered);
  renderQaAccordion(filtered);
}



function renderBreakdown(data){
  const container = document.getElementById("progressBreakdownBody");
  if (!container) return;
  
  // Create button container with proper structure
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'mb-3 d-flex gap-2 flex-wrap';
  buttonDiv.innerHTML = "<button id='toggleHiddenGroups' class='btn btn-sm btn-secondary'>Show 0% Groups</button><button id='toggleFullGroups' class='btn btn-sm btn-secondary'>Show 100% Groups</button><button id='toggleStatus' class='btn btn-sm btn-secondary'>Show Status</button><button id='toggleProgressBars' class='btn btn-sm btn-secondary'>Hide Progress Bars</button>";
  
  // Clear container and add buttons
  container.innerHTML = '';
  container.appendChild(buttonDiv);

  const groups = [
    {name:"Division", field:"Division"},
    {name:"Page Type", field:"Page Type"},
    {name:"Site Type", field:"Symphony Site Type"},
    {name:"Area Command", field:"Area Command Admin Group.title"},
    {name:"Location", field:"Local Web Admin Group.title"}
  ];

  groups.forEach(g=>{
    const grouped = {};

    // --- Build grouped data ---
    data.forEach(d=>{
      const rawLocal = (d['Local Web Admin Group.title'] || '').toString().trim();
      const rawAC = (d['Area Command Admin Group.title'] || '').toString().trim();
      const rawVal = (d[g.field] || '').toString().trim();

      let key;
      if (g.field === 'Area Command Admin Group.title') key = rawAC || rawLocal || 'Not Set';
      else if (g.field === 'Local Web Admin Group.title') key = rawLocal || rawAC || 'Not Set';
      else key = rawVal || 'Not Set';

      const k = key || 'Not Set';
      grouped[k] = grouped[k] || { total: 0, done: 0, donot: 0, statusBreakdown: {}, siteTitles: new Set() };
      grouped[k].total++;
      
      // Categorize by status
      const status = d.Status || '';
      let statusCategory = 'Unknown';
      if (/^4|^5/.test(String(status).charAt(0))) {
        statusCategory = 'Completed';
        grouped[k].done++;
      } else if (status === 'THQ Redirect') {
        statusCategory = 'THQ Redirect';
        grouped[k].done++;
      } else if (status === 'Do Not Migrate') {
        statusCategory = 'Do Not Migrate';
        grouped[k].donot++;
      } else if (/^2/.test(String(status).charAt(0))) {
        statusCategory = 'In Progress';
      } else if (/^1b/.test(String(status))) {
        statusCategory = 'Pending Migration';
      } else if (/^1/.test(String(status).charAt(0))) {
        statusCategory = 'Needs Info';
      } else if (/^3/.test(String(status).charAt(0))) {
        statusCategory = 'In QA';
      }
      
      grouped[k].statusBreakdown[statusCategory] = (grouped[k].statusBreakdown[statusCategory] || 0) + 1;
      
      const siteTitle = (d['Site Title'] || d['SiteTitle'] || '').toString().trim();
      if (siteTitle) grouped[k].siteTitles.add(siteTitle);
    });

    // --- Build entries array ---
    let entries = Object.keys(grouped).map(rawKey => {
      let display = rawKey;
      if (g.field === 'Area Command Admin Group.title') display = formatAcDisplay(rawKey);
      else if (g.field === 'Local Web Admin Group.title') display = adjustLabel(rawKey);
      else display = rawKey || 'Not Set';
      return { rawKey, display };
    }).sort((a,b)=> a.display.localeCompare(b.display, undefined, { sensitivity: 'base' }));

    // --- Filter Area Command entries ---
    if (g.field === 'Area Command Admin Group.title'){
      entries = entries.filter(e => {
        const rk = (e.rawKey || '').toString().toLowerCase();
        const d = (e.display || '').toString().toLowerCase();
        return rk.includes('area command') || d.includes('area command');
      });
    }

    // --- Smart default for showing 0% groups: show them only if most groups are 0% ---
    // Only apply smart default if user hasn't manually toggled the setting
    if (g.field === 'Division' && !userToggledHidden) { // Only check on first group iteration to avoid recalculating
      let zeroPercentCount = 0;
      entries.forEach(({ rawKey }) => {
        const grp = grouped[rawKey];
        const total = grp.total;
        const prog = total ? Math.round((grp.done + grp.donot) / total * 100) : 0;
        if (prog === 0) zeroPercentCount++;
      });
      const zeroPercentRatio = entries.length > 0 ? zeroPercentCount / entries.length : 0;
      // Show 0% groups by default only if more than 50% of groups are at 0%
      showHidden = zeroPercentRatio > 0.5;
    }

    // --- Count entries for heading badge ---
    // For Location groups with multiple sites, count each site separately
    let groupCount = entries.length;
    if (g.field === 'Local Web Admin Group.title') {
      groupCount = 0;
      entries.forEach(({ rawKey }) => {
        const grp = grouped[rawKey];
        const siteCount = grp.siteTitles ? grp.siteTitles.size : 0;
        groupCount += siteCount > 1 ? siteCount : 1;
      });
    }

    // --- Start section HTML with badge ---
    let sectionHtml = `
      <div class="breakdown-section">
        <h3 class="mt-3 d-flex align-items-center gap-2">
          ${g.name} <span class="badge bg-dark text-light">${groupCount}</span>
        </h3>
    `;

    // --- Show notice if no child locations (only for Local Web Admin Group) ---
    if (g.field === 'Local Web Admin Group.title'){
      const childKeys = Object.keys(grouped).filter(k=>k && k !== 'Not Set');
      if (!childKeys.length) {
        sectionHtml += `<div class="mb-2 text-muted"><em>No child locations found for the current filters.</em></div>`;
      }
    }

    // --- Render each entry ---
    entries.forEach(({ rawKey, display }) => {
      const grp = grouped[rawKey];
      const siteCount = grp.siteTitles ? grp.siteTitles.size : 0;

      // Special handling for Location groups with multiple sites: split into individual site entries
      if (g.field === 'Local Web Admin Group.title' && siteCount > 1) {
        // Create individual entry for each site
        Array.from(grp.siteTitles).sort().forEach(siteTitle => {
          // Filter data to only get records for this specific site
          const siteData = data.filter(d => {
            const rawLocal = (d['Local Web Admin Group.title'] || '').toString().trim();
            const siteKey = rawLocal || 'Not Set';
            const siteTitleItem = (d['Site Title'] || d['SiteTitle'] || '').toString().trim();
            return siteKey === rawKey && siteTitleItem === siteTitle;
          });

          const siteTotal = siteData.length;
          let siteDone = 0;
          let siteDonot = 0;
          const siteStatusBreakdown = {};

          siteData.forEach(d => {
            const status = d.Status || '';
            let statusCategory = 'Unknown';
            if (/^4|^5/.test(String(status).charAt(0))) {
              statusCategory = 'Completed';
              siteDone++;
            } else if (status === 'THQ Redirect') {
              statusCategory = 'THQ Redirect';
              siteDone++;
            } else if (status === 'Do Not Migrate') {
              statusCategory = 'Do Not Migrate';
              siteDonot++;
            } else if (/^2/.test(String(status).charAt(0))) {
              statusCategory = 'In Progress';
            } else if (/^1b/.test(String(status))) {
              statusCategory = 'Pending Migration';
            } else if (/^1/.test(String(status).charAt(0))) {
              statusCategory = 'Needs Info';
            } else if (/^3/.test(String(status).charAt(0))) {
              statusCategory = 'In QA';
            }
            siteStatusBreakdown[statusCategory] = (siteStatusBreakdown[statusCategory] || 0) + 1;
          });

          const siteProg = siteTotal ? Math.round((siteDone + siteDonot) / siteTotal * 100) : 0;

          // Determine hidden classes
          let hiddenClass = '';
          let fullClass = '';
          if (siteProg === 0) hiddenClass = 'hidden-group';
          else if (siteProg !== 100) hiddenClass = 'non-100-group';
          else if (siteProg === 100) fullClass = 'is-100-group';

          // Build progress bar for this specific site
          let progressHtml = '';
          
          if (showStatusBreakdown) {
            progressHtml = '<div class="progress mt-1" style="height:24px;">';
            const statusOrder = ['Do Not Migrate', 'Needs Info', 'Pending Migration', 'In Progress', 'In QA', 'THQ Redirect', 'Unknown', 'Completed'];
            statusOrder.forEach(status => {
              const count = siteStatusBreakdown[status] || 0;
              if (count > 0) {
                const pct = Math.round(count / siteTotal * 100);
                const color = statusColors[status] || '#6c757d';
                progressHtml += `<div class="progress-bar" style="width:${pct}%; background-color:${color}; border-right:1px solid white;" title="${status}: ${count}"></div>`;
              }
            });
            progressHtml += `</div><small style="text-align:right; display:block; margin-top:2px; color:#666;">${siteProg}% Complete</small>`;
          } else {
            const colorClass = siteProg < 40 ? 'bg-danger' : siteProg < 70 ? 'bg-warning' : 'bg-success';
            progressHtml = `<div class="progress mt-1"><div class="progress-bar ${colorClass}" style="width:${siteProg}%">${siteProg}%</div></div>`;
          }

          // Clean site title
          const cleanedSiteTitle = siteTitle.replace(/The\s+|Salvation Army\s+(?:of\s+)?/gi, '').trim();
          const siteEntryKey = `${rawKey}|${siteTitle}`;

          sectionHtml += `      
            <div class="mb-1 ${hiddenClass} ${fullClass}" data-key="${encodeURIComponent(siteEntryKey)}" style="display:${((hiddenClass === 'hidden-group' && !showHidden) || (show100Only && (hiddenClass === 'non-100-group' || hiddenClass === 'hidden-group'))) ? 'none' : 'block'}">
              <strong>${display} | ${cleanedSiteTitle}</strong> <small class="text-muted">(${siteTotal} pages)</small>${hideProgressBars ? '' : progressHtml}
            </div>`;
        });
      } else {
        // Regular single-site or non-location handling
        const total = grp.total;
        const prog = total ? Math.round((grp.done + grp.donot) / total * 100) : 0;

        // Determine hidden classes for 0% bars and non-100% bars
        let hiddenClass = '';
        let fullClass = '';
        if (prog === 0) hiddenClass = 'hidden-group';
        else if (prog !== 100) hiddenClass = 'non-100-group';
        else if (prog === 100) fullClass = 'is-100-group';
        if (g.field === 'Area Command Admin Group.title' && siteCount === 1 && prog === 0) hiddenClass = 'hidden-group';

        // Build progress bar - simple by default, status breakdown if enabled
        let progressHtml = '';
        
        if (showStatusBreakdown) {
          // Status breakdown bar with colored segments
          progressHtml = '<div class="progress mt-1" style="height:24px;">';
          
          // Use same order as overall progress bar
          const statusOrder = ['Do Not Migrate', 'Needs Info', 'Pending Migration', 'In Progress', 'In QA', 'THQ Redirect', 'Unknown', 'Completed'];
          const breakdown = grp.statusBreakdown || {};
          
          statusOrder.forEach(status => {
            const count = breakdown[status] || 0;
            if (count > 0) {
              const pct = Math.round(count / total * 100);
              const color = statusColors[status] || '#6c757d';
              progressHtml += `<div class="progress-bar" style="width:${pct}%; background-color:${color}; border-right:1px solid white;" title="${status}: ${count}"></div>`;
            }
          });
          
          progressHtml += `</div><small style="text-align:right; display:block; margin-top:2px; color:#666;">${prog}% Complete</small>`;
        } else {
          // Simple single-color bar
          const colorClass = prog < 40 ? 'bg-danger' : prog < 70 ? 'bg-warning' : 'bg-success';
          progressHtml = `
            <div class="progress mt-1">
              <div class="progress-bar ${colorClass}" style="width:${prog}%">${prog}%</div>
            </div>`;
        }

        // Only show site title if single site AND title is meaningfully different from group name
        let siteTitleToShow = '';
        if (siteCount === 1 && grp.siteTitles) {
          const rawSiteTitle = Array.from(grp.siteTitles)[0];
          const cleanedSiteTitle = rawSiteTitle.replace(/The\s+|Salvation Army\s+(?:of\s+)?/gi, '').trim();
          const displayLower = display.toLowerCase();
          const siteTitleLower = cleanedSiteTitle.toLowerCase();
          
          // Normalize regional variations (e.g., "North East" → "Northeast") and abbreviations (e.g., "St." → "St", "Ft" → "Fort")
          const normalizeRegional = (str) => {
            return str
              .replace(/\b(north|south|east|west)\s+(east|west|carolina|dakota)\b/gi, '$1$2')
              .replace(/\bft\.?\s+/gi, 'fort ') // "Ft." or "Ft " → "Fort "
              .replace(/\b(st|mt)\./gi, '$1'); // Remove periods from other common abbreviations
          };
          
          const displayNormalized = normalizeRegional(displayLower);
          const siteTitleNormalized = normalizeRegional(siteTitleLower);
          
          // Extract significant words (filter out common generic words)
          const genericWords = new Set(['area', 'command', 'corps', 'the', 'of', 'and', 'or']);
          const getSignificantWords = (str) => 
            str.split(/\s+/).filter(w => w.length > 2 && !genericWords.has(w.toLowerCase()));
          
          const displayWords = getSignificantWords(displayNormalized);
          const siteTitleWords = getSignificantWords(siteTitleNormalized);
          
          // Check if most significant words from site title appear in display
          const matchedWords = siteTitleWords.filter(word => 
            displayWords.some(dWord => dWord.includes(word) || word.includes(dWord))
          );
          
          // Only show if less than 70% of site title's significant words are in the group name
          const similarity = siteTitleWords.length > 0 ? matchedWords.length / siteTitleWords.length : 0;
          if (similarity < 0.7) {
            siteTitleToShow = ' | ' + cleanedSiteTitle;
          }
        }

        sectionHtml += `      
          <div class="mb-1 ${hiddenClass} ${fullClass}" data-key="${encodeURIComponent(rawKey)}" style="display:${((hiddenClass === 'hidden-group' && !showHidden) || (show100Only && (hiddenClass === 'non-100-group' || hiddenClass === 'hidden-group'))) ? 'none' : 'block'}">
            <strong>${display}${siteTitleToShow}</strong> <small class="text-muted">(${total} pages${siteCount > 1 ? ' across ' + siteCount + ' sites' : ''})</small>${hideProgressBars ? '' : progressHtml}
          </div>`;
      }
    });

    sectionHtml += `</div>`; // close breakdown-section
    
    // Create a temporary div to parse HTML and append properly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    while (tempDiv.firstChild) {
      container.appendChild(tempDiv.firstChild);
    }
  });

  // --- Toggle button logic for 0% and 100% bars ---
  const toggleBtn = document.getElementById('toggleHiddenGroups');
  const toggleFullBtn = document.getElementById('toggleFullGroups');

  function updateHiddenCount() {
    if (!toggleBtn) return;
    const hiddenElems = container.querySelectorAll('.hidden-group');
    const count = hiddenElems.length;

    if(count === 0 || count <= 10){
      toggleBtn.style.display = 'none';
    } else {
      toggleBtn.style.display = 'inline-block';
      toggleBtn.innerText = showHidden 
        ? `Hide 0% Groups (${count})` 
        : `Show 0% Groups (${count})`;
    }
  }

  function updateFullCount() {
    if (!toggleFullBtn) return;
    const fullElems = container.querySelectorAll('.is-100-group');
    const allElems = container.querySelectorAll('.mb-1[data-key]');
    const count = fullElems.length;
    const totalCount = allElems.length;

    if(count === 0 || count <= 10){
      toggleFullBtn.style.display = 'none';
    } else {
      toggleFullBtn.style.display = 'inline-block';
      toggleFullBtn.innerText = show100Only 
        ? `Show All Groups (${totalCount})` 
        : `Show only 100% Groups (${count})`;
    }
  }

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      showHidden = !showHidden;
      userToggledHidden = true; // Mark that user manually toggled
      renderBreakdown(data);
    };
    updateHiddenCount();
  }

  if (toggleFullBtn) {
    toggleFullBtn.onclick = () => {
      show100Only = !show100Only;
      renderBreakdown(data);
    };
    updateFullCount();
  }

  // --- Toggle button logic for status breakdown ---
  const toggleStatusBtn = document.getElementById('toggleStatus');
  if (toggleStatusBtn) {
    // Hide status button when progress bars are hidden
    toggleStatusBtn.style.display = hideProgressBars ? 'none' : 'inline-block';
    
    // Set initial button text based on current state
    toggleStatusBtn.innerText = showStatusBreakdown ? 'Hide Status' : 'Show Status';
    
    toggleStatusBtn.onclick = () => {
      showStatusBreakdown = !showStatusBreakdown;
      renderBreakdown(data);
    };
  }

  // --- Toggle button logic for progress bars ---
  const toggleProgressBtn = document.getElementById('toggleProgressBars');
  if (toggleProgressBtn) {
    // Set initial button text based on current state
    toggleProgressBtn.innerText = hideProgressBars ? 'Show Progress Bars' : 'Hide Progress Bars';
    
    toggleProgressBtn.onclick = () => {
      hideProgressBars = !hideProgressBars;
      renderBreakdown(data);
    };
  }

  // --- Accordion total badge update ---
  function updateBadge(){
    const badge = document.getElementById("breakdownBadge");
    if (!badge) return;

    // Count all visible group entries (not progress-bar divs, as status view has multiple bars per group)
    const allGroups = container.querySelectorAll(".mb-1[data-key]");
    badge.textContent = allGroups.length;
  }

  updateBadge();
}






// Table rendering
function renderTable(){
  if(table) table.destroy();
  // Deduplicate filtered rows by ID
  const rawFiltered = getFilteredData();
  const seenIds = new Set();
  const filtered = rawFiltered.filter(row => {
    if (seenIds.has(row.ID)) return false;
    seenIds.add(row.ID);
    return true;
  });
  table = new Tabulator("#tableContainer",{
    data: filtered,
    layout:"fitDataStretch",
  responsiveLayout:"collapse",
  responsiveLayoutCollapseStartOpen:true,
    rowHeight: 27,
    initialSort: [              
        { column: "_ModifiedMs", dir: "desc" },
  ],
    placeholder:"No matching pages found",
    columns:[
      { 
title: "Title",
      field: "Title",
      sorter: "string",
      width: 300,       
      minWidth: 120,
      headerSort: true,
      formatter: function(cell){
        const v = cell.getValue() ?? "";
        const esc = String(v)
          .replace(/&/g,"&amp;")
          .replace(/</g,"&lt;")
          .replace(/>/g,"&gt;")
          .replace(/"/g,"&quot;");
        return `<div class="col-ellipsis table-link" title="${esc}">${esc}</div>`;
      },
      cellClick: (e, cell) => showTableModalById(cell.getRow().getData()._id)
}
,
{
  title: "Edit", 
  field: "Form", 
  formatter: cell => {
    const row = cell.getRow().getData();
    const id = row.ID; 
    const type = (row["Symphony Site Type"] || "").trim();
    let url = "#";
    if(type === "Metro Area") {
      url = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${id}&e=mY8mhG`;
    } else if(type === "Corps") {
      url = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${id}&e=dF11LG`;
    }
    return `<a href="${url}" target="_blank">Form</a>`;
  }
},


      {title:"SD", field:"Page URL",  hozAlign:'center', formatter:cell=>cell.getValue()?`<a href="${escapeHtml(cell.getValue())}" target="_blank" rel="noopener noreferrer">&#128279;</a>`:""},
  {title:"ZD", field:"Zesty URL Path Part", visible:true, hozAlign:"center", width:55, maxWidth:64, formatter:cell=>{
    const v = cell.getValue();
    return v ? `<a class="zesty-link" href="https://8hxvw8tw-dev.webengine.zesty.io${escapeHtml(v)}?zpw=tsasecret123&redirect=false&_bypassError=true" target="_blank" rel="noopener noreferrer" aria-label="Open Zesty preview">🔗</a>` : "--";
  }},
      {title:"Status", field:"Status",
          width: 110,        
          minWidth: 80,
          headerSort: true, 
          formatter: function(cell){
    const v = cell.getValue() ?? "";
    // escape html so long content can't break markup
    const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
  }
      },
      {title:"Priority", field:"Priority"},
      {
  title: "Effort Needed",
  field: "Effort Needed",
  width: 110,        
  minWidth: 80,
  headerSort: true, 
  formatter: function(cell){
    const v = cell.getValue() ?? "";
    // escape html so long content can't break markup
    const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
  }
},

      {title:"Published", field:"Published Symphony"},
      {title:"Page Type", field:"Page Type"},
      // Use the numeric _ModifiedMs field for sorting, but display the human-friendly Modified string.
      {title:"Modified", field:"_ModifiedMs", headerSort:true, sorter:"number", formatter: function(cell){
        const row = cell.getRow().getData();
        const v = row && row.Modified ? row.Modified : '';
        const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
        return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
      }},
      {
  title:"Site Title", 
  field:"Site Title",
  width: 110,        
  minWidth: 80,
  headerSort: true, 
  formatter: function(cell){
    const v = cell.getValue() ?? "";
    // escape html so long content can't break markup
    const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;  
  }
}
    ],
    pagination:"local",
    paginationSize:20,
    movableColumns:true
  });
  // Diagnostics: log column fields and ZD value count after table creation
  try {
    const cols = table.getColumns().map(c => ({field: c.getField(), visible: c.isVisible()}));
    const zdCount = filtered.filter(r => r['Zesty URL Path Part']).length;
    console.log('[renderTable] Tabulator columns:', cols);
    console.log('[renderTable] Filtered rows with Zesty URL Path Part:', zdCount);
  } catch(e) { console.warn('Tabulator diagnostics failed', e); }
}

// Render overall progress bar and legend
function renderOverallProgress(filtered){
  if (!Array.isArray(filtered)) return;
  const total = filtered.length;
  const counts = { "Do Not Migrate":0, "Needs Info":0, "Pending Migration":0, "In Progress":0, "In QA":0, "THQ Redirect":0, Unknown:0, Completed:0 };
  
  filtered.forEach(d=>{
    const s = getCanonicalStatus(d.Status);
    counts[s] = (counts[s] || 0) + 1;
  });

  const container = document.getElementById("progressBarContainer");
  if (!container) return;
  container.innerHTML = "";

  const legendContainer = document.getElementById("progressLegend");
  if (!legendContainer) return;
  legendContainer.innerHTML = "";

  // Compute percentages from raw counts. Percentages are (count / total) * 100
  // and rounded to one decimal place for display. Widths use the raw percentage
  // so visual segments match the textual percentages (minor rounding differences
  // may cause the sums to be ~100%).
  // Prepare arrays for sqrt-scaling widths while keeping raw percentages for text
  const keys = Object.keys(counts);
  const rawCounts = keys.map(k => counts[k] || 0);
  const scaledCounts = transformCountsForPie(rawCounts, 'sqrt');
  const scaledTotal = scaledCounts.reduce((a,b)=>a+b,0) || 1;

  keys.forEach((key, idx) => {
    const raw = rawCounts[idx] || 0;
    const pct = total > 0 ? (raw / total) * 100 : 0;
    const pctDisplay = pct.toFixed(1); // one decimal place

    if (raw > 0) { // render only non-zero categories
      const scaled = scaledCounts[idx] || 0;
      const widthPct = scaledTotal ? (scaled / scaledTotal) * 100 : 0;

      const div = document.createElement("div");
      div.className = "progress-bar";
      div.style.width = widthPct + "%"; // use sqrt-scaled percentage for visual width
      div.style.backgroundColor = statusColors[key];
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.innerText = `${pctDisplay}% (${raw})`; // textual percentage uses raw counts
      container.appendChild(div);

      // Add legend line formatted as: Category Name – X% (Count)
      const legendItem = document.createElement("div");
      legendItem.className = "d-flex align-items-center gap-1 legend-item";
      legendItem.innerHTML = `<span style="display:inline-block;width:14px;height:14px;background-color:${statusColors[key]};"></span> ${key} – ${pctDisplay}% (${raw})`;
      legendContainer.appendChild(legendItem);
    }
  });
}

// Normalize status string
function normalizeStatus(status){
  return (status || "").toString().trim();
}

// Map raw status values to canonical buckets used throughout the dashboard
function getCanonicalStatus(status) {
  if (!status) return "Unknown";
  status = status.toString().trim();
  if (/^4|^5/.test(status)) return "Completed";
  if (status === "Do Not Migrate") return "Do Not Migrate";
  if (status === "THQ Redirect") return "THQ Redirect";
  if (/^2/.test(status)) return "In Progress";
  if (/^1b/.test(status)) return "Pending Migration";
  if (/^1/.test(status)) return "Needs Info";
  if (/^3[a-d]/.test(status)) return "In QA";
  return "Unknown";
}

// Small helper to escape HTML in strings inserted via innerHTML
function escapeHtml(str){
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// truncate helper (keeps whole string if shorter than limit)
function truncateExact(str, limit){
  if (str === null || str === undefined) return '';
  const s = String(str);
  if (s.length <= limit) return s;
  return s.slice(0, limit) + '…';
}

// Normalize a value (date-only string or timestamp) to UTC midnight milliseconds.
// This ensures date-only strings like '2025-09-30' and full timestamps are compared
// on the same UTC date boundary regardless of client timezone.
function dateToUtcMidnightMs(v){
  // Fast, memoized conversion of a value to the UTC ms corresponding to midnight in America/New_York.
  // Initialize one-time formatters and caches on first call to avoid repeated Intl construction.
  if (!dateToUtcMidnightMs._init){
    const TZ = 'America/New_York';
    dateToUtcMidnightMs._TZ = TZ;
    dateToUtcMidnightMs._dtfFull = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dateToUtcMidnightMs._dtfDay = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
    dateToUtcMidnightMs._offsetCache = new Map(); // key: 'YYYY-MM-DD' -> offset minutes
    dateToUtcMidnightMs._resultCache = new Map(); // key: typed input -> utcMs
    dateToUtcMidnightMs._init = true;
  }

  if (!v && v !== 0) return null;

  const TZ = dateToUtcMidnightMs._TZ;
  const dtfFull = dateToUtcMidnightMs._dtfFull;
  const dtfDay = dateToUtcMidnightMs._dtfDay;
  const offsetCache = dateToUtcMidnightMs._offsetCache;
  const resultCache = dateToUtcMidnightMs._resultCache;

  function partsFromFormatter(dtf, date){
    const parts = dtf.formatToParts(date); const p = {}; parts.forEach(x=>{ if (x.type) p[x.type] = x.value; }); return p;
  }

  function utcMsForTzMidnight(y, mo, d){
    const key = `${y}-${mo}-${d}`;
    if (offsetCache.has(key)){
      const offsetMin = offsetCache.get(key);
      return Date.UTC(y, mo, d, 0, 0, 0) - (offsetMin * 60000);
    }
    // Use midday UTC (12:00) to reliably detect DST offset for that local date
    const middayUtc = Date.UTC(y, mo, d, 12, 0, 0);
    try{
      const p = partsFromFormatter(dtfFull, new Date(middayUtc));
      const hh = parseInt(p.hour||'0',10), mm = parseInt(p.minute||'0',10), ss = parseInt(p.second||'0',10);
      const asUtc = Date.UTC(parseInt(p.year,10), parseInt(p.month,10)-1, parseInt(p.day,10), hh, mm, ss);
      const offsetMin = Math.round((asUtc - middayUtc)/60000);
      offsetCache.set(key, offsetMin);
      return Date.UTC(y, mo, d, 0, 0, 0) - (offsetMin * 60000);
    }catch(e){
      // fallback to naive UTC midnight
      offsetCache.set(key, 0);
      return Date.UTC(y, mo, d, 0, 0, 0);
    }
  }

  function cacheKeyFor(v){
    if (typeof v === 'number' && !isNaN(v)) return `n:${v}`;
    if (typeof v === 'string') return `s:${v}`;
    if (v instanceof Date) return `d:${v.getTime()}`;
    return `o:${String(v)}`;
  }

  const key = cacheKeyFor(v);
  if (resultCache.has(key)) return resultCache.get(key);

  // compute
  let result = null;
  if (typeof v === 'number' && !isNaN(v)){
    const p = partsFromFormatter(dtfDay, new Date(v));
    const y = parseInt(p.year,10), mo = parseInt(p.month,10)-1, d = parseInt(p.day,10);
    result = utcMsForTzMidnight(y, mo, d);
    resultCache.set(key, result); return result;
  }

  if (typeof v === 'string'){
    const s = v.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m){ const y = parseInt(m[1],10), mo = parseInt(m[2],10)-1, d = parseInt(m[3],10); result = utcMsForTzMidnight(y, mo, d); resultCache.set(key, result); return result; }
    const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m2){ const mo = parseInt(m2[1],10)-1, d = parseInt(m2[2],10), y = parseInt(m2[3],10); result = utcMsForTzMidnight(y, mo, d); resultCache.set(key, result); return result; }
    const dt = new Date(s);
    if (!isNaN(dt)){
      const p = partsFromFormatter(dtfDay, dt);
      const y = parseInt(p.year,10), mo = parseInt(p.month,10)-1, d = parseInt(p.day,10);
      result = utcMsForTzMidnight(y, mo, d);
      resultCache.set(key, result); return result;
    }
    resultCache.set(key, null); return null;
  }

  if (v instanceof Date){
    if (isNaN(v)) { resultCache.set(key, null); return null; }
    const p = partsFromFormatter(dtfDay, v);
    const y = parseInt(p.year,10), mo = parseInt(p.month,10)-1, d = parseInt(p.day,10);
    result = utcMsForTzMidnight(y, mo, d);
    resultCache.set(key, result); return result;
  }

  resultCache.set(key, null);
  return null;
}

// debounce helper to avoid excessive re-renders on rapid input changes
function debounce(fn, wait){
  let timer = null;
  return function(...args){
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(()=> fn.apply(ctx, args), wait);
  };
}

// Initialize filter controls: attach change listeners and populate options
function initFilters(){
  const filterIds = ["filterDivision","filterAC","filterStatus","filterPageType","filterPubSym","filterSymType","filterPriority","filterEffort","filterSiteTitle","filterZestyUrl"];

  filterIds.forEach(id=>{
    const sel = document.getElementById(id);
    if (sel) sel.addEventListener("change", debounce(updateFiltersAndDashboard, 150));
  });

  // Wire Modified date range inputs (optional date inputs with IDs filterModifiedFrom and filterModifiedTo)
  const modFrom = document.getElementById('filterModifiedFrom');
  const modTo = document.getElementById('filterModifiedTo');
  if (modFrom) modFrom.addEventListener('change', debounce(updateFiltersAndDashboard, 150));
  if (modTo) modTo.addEventListener('change', debounce(updateFiltersAndDashboard, 150));

  updateFiltersOptions();
}

// Make sure masterData references tableData (assign to previously declared variable)
masterData = tableData;

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  // Search function for Tabulator (safe guards if elements are missing)
  function filterTable() {
    if (!searchInput) return;
    const query = (searchInput.value || "").toLowerCase().trim();
    if (!table) return;
    if (!query) {
      table.clearFilter();
      return;
    }
    table.setFilter(row => {
      return Object.values(row).some(val => String(val).toLowerCase().includes(query));
    });
  }

  function clearFilter() {
    if (searchInput) searchInput.value = "";
    if (table) table.clearFilter();
  }

  if (searchBtn) searchBtn.addEventListener("click", filterTable);
  if (clearBtn) clearBtn.addEventListener("click", clearFilter);

  // Optional: filter on Enter key press
  if (searchInput) {
    searchInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") filterTable();
    });
  }
});






  // --- Table Modal ---
function showTableModalById(id){
  const page = pageCache[id];
  if(page) return showTableModal(page);
}

async function showTableModal(page){
  const titleEl = document.getElementById("tableModalTitle");
  const bodyEl = document.getElementById("tableModalBody");
  const modalEl = document.getElementById('tableDetailModal');
  if (!titleEl || !bodyEl) {
    console.warn('Table modal elements missing');
    return;
  }

  titleEl.innerText = page.Title;

  let html = '';
  // Load field export config
  let fieldConfig;
  try {
    const req = await fetch('FieldExport.json?_ts=' + Date.now());
    fieldConfig = await req.json();
    window.FieldExportConfig = fieldConfig;
  } catch(e) { fieldConfig = null; }
  const fields = fieldConfig && fieldConfig.Fields ? fieldConfig.Fields : [];
  // Group fields by FieldGroup and sort by FieldNumberML
  const visibleFields = fields.filter(f => f.SortOrder !== 'True');
  const grouped = {};
  visibleFields.forEach(f => {
    const group = f.FieldPreferredName || 'Other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(f);
  });
  // Sort groups by FieldGroup (numeric)
  // Sort groups by preferred display order
  const preferredOrder = [
    'Page Migration Report Details',
    'Zesty Details',
    'Symphony Details',
    'Quality Assurance',
    'Extra Details'
  ];
  const groupOrder = Object.keys(grouped).sort((a, b) => {
    const idxA = preferredOrder.indexOf(a);
    const idxB = preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  html += '<table class="table table-bordered">';
  // --- Form link ---
  const type = (page["Symphony Site Type"] || "").trim();
  let formUrl = "#";
  if(type === "Metro Area") 
      formUrl = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${page.ID}&e=mY8mhG`;
  else if(type === "Corps") 
      formUrl = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${page.ID}&e=dF11LG`;
  html += `<tr><th>Form</th><td><a href="${formUrl}" target="_blank">Edit Form</a></td></tr>`;
  // Render grouped fields
  groupOrder.forEach(groupName => {
    html += `<tr class="table-group"><th colspan="2" style="background-color:#223950;color:#fff;">${groupName}</th></tr>`;
    const groupFields = grouped[groupName].sort((a,b) => {
      // Sort by SortOrder ("True" last, "False" first), then FieldNumberML
      if (a.SortOrder !== b.SortOrder) {
        return (a.SortOrder === 'False' ? -1 : 1);
      }
      return Number(a.FieldNumberML) - Number(b.FieldNumberML);
    });
    groupFields.forEach(f => {
      const k = f.FormField;
      let val = page[k];
      // Use Page Editor.title for Page Editor field
      if (k === "Page Editor") {
        val = page["Page Editor.title"] || val;
      }
      // Remove second Form field if empty
      if (k === "Form" && !val) return;
      if(k==="Page URL" && val) 
          val = `<a href="${val}" target="_blank">${val}</a>`;
      if(k==="Zesty URL Path Part" && val) 
          val = `<a href="https://8hxvw8tw-dev.webengine.zesty.io${val}?zpw=tsasecret123&redirect=false&_bypassError=true" target="_blank">${val}</a>`;
      if(k==="Zesty Content Mobile Editor Path") {
        if(val) {
          val = `<a href="https://salvationarmy.mobile.zesty.io${val}" target="_blank">${val}</a>`;
        } else {
          val = "--";
        }
      }
      if(k==="Migration URL" && val) 
          val = `<a href="${val}" target="_blank">${val}</a>`;

      // Published Symphony visual cue (normalize value)
      if(k==="Published Symphony") {
        const normVal = String(val).toLowerCase();
        if(val === true || val === 1 || val === "1" || normVal === "true") {
          val = `<span style="color:#28a745;font-weight:bold;">Published</span>`;
        } else {
          val = `<span style="color:#e74c3c;font-weight:bold;">Not Published</span>`;
        }
      }

      // Page Type External with Redirect External URL
      if(k==="Page Type" && (val === "external" || val === "External")) {
        const redirectUrl = page["Redirect External URL"];
        if(redirectUrl) {
          val = `<span style="background:#ffeeba;color:#856404;padding:2px 8px;border-radius:6px;font-weight:bold;" title="To set up as an informational page in Zesty: 1) Copy the value in Redirect External URL to the External URL field. 2) Add the page to the navigation parent. 3) Set 'Display on Header Navigation' to Yes.">External Page <i class='bi bi-info-circle'></i></span> <a href='${redirectUrl}' target='_blank' style='color:#0a66c2;text-decoration:underline;margin-left:8px;'>${redirectUrl}</a>`;
        } else {
          val = `<span style="background:#ffeeba;color:#856404;padding:2px 8px;border-radius:6px;font-weight:bold;">External Page</span>`;
        }
      }

      // Use FieldGroupSort if present, otherwise FieldPreferredName, otherwise FormField
      let displayName = f.FieldGroupSort && f.FieldGroupSort.trim() ? f.FieldGroupSort : (f.FieldPreferredName && f.FieldPreferredName.trim() ? f.FieldPreferredName : k);
      html += `<tr><th>${displayName}</th><td>${val ?? ''}</td></tr>`;
    });
  });
  html += "</table>";
  bodyEl.innerHTML = html;
  if (modalEl) {
    try { new bootstrap.Modal(modalEl).show(); } catch(e) { console.warn('bootstrap.Modal not available or failed to show table detail modal', e); }
  }
}

// helper: count occurrences by key
function countBy(arr, key){
  return arr.reduce((acc,d)=>{
    const val = d[key]||"Not Set";
    acc[val] = (acc[val]||0)+1;
    return acc;
  }, {});
}

// helper: generate color palette
function palette(n){
  const colors = ["#2ecc71","#e74c3c","#f39c12","#3498db","#9b59b6","#16a085","#d35400","#ff6b6b","#f7b32b","#4ecdc4"];
  return Array.from({length:n},(_,i)=>colors[i%colors.length]);
}



// --- Priority chart ---
function renderCharts(filtered) {
  if (!Array.isArray(filtered)) filtered = [];
  try{
  const ctxStatusEl = document.getElementById("statusChart");
  const ctxPriorityEl = document.getElementById("priorityChart");
  const ctxPageTypeEl = document.getElementById("pageTypeChart");
  const ctxPubSymEl = document.getElementById("pubSymChart");
  const ctxEffortEl = document.getElementById("effortChart");
  if (!ctxStatusEl || !ctxPriorityEl || !ctxPageTypeEl || !ctxPubSymEl || !ctxEffortEl) return;

  const ctxStatus = ctxStatusEl.getContext("2d");
  const ctxPriority = ctxPriorityEl.getContext("2d");
  const ctxPageType = ctxPageTypeEl.getContext("2d");
  const ctxPubSym = ctxPubSymEl.getContext("2d");
  const ctxEffort = ctxEffortEl.getContext("2d");

    const statusCounts = {};
    filtered.forEach(d => {
      let s = normalizeStatus(d.Status) || "Unknown";
      if (/^(4|5)/.test(s)) s = "Completed";
      else if (s === "Do Not Migrate") s = "Do Not Migrate";
      else if (/^2/.test(s)) s = "In Progress";
      else if (/^1b/.test(s)) s = "Pending Migration";
      else if (/^1/.test(s)) s = "Needs Info";
      else if (/^3[a-d]/.test(s)) s = "In QA";
      else s = s || "Unknown";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const backgroundColor = labels.map(label => statusColors[label] || "#6c757d");

// Removed ${ctx.label}: from tooltip label callback to simplify display

    if (statusChart) try { statusChart.destroy(); } catch (e) {}
    statusChart = new Chart(ctxStatus, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: transformCountsForPie(data, 'sqrt'),
          _rawCounts: data,
          backgroundColor: backgroundColor
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (ctx) {
                try {
                  const ds = ctx.dataset;
                  const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
                  const total = ds._rawCounts ? ds._rawCounts.reduce((a, b) => a + (Number(b) || 0), 0) : (ctx.chart && ctx.chart._metasets && ctx.chart._metasets[ctx.datasetIndex] ? ctx.chart._metasets[ctx.datasetIndex].total : 0);
                  const pct = total ? ((raw / total) * 100).toFixed(1) : '0.0';
                  return `${raw} (${pct}%)`;
                } catch (e) { return `${ctx.parsed}`; }
              }
            }
          }
        }
      }
    });
    try { addChartLegendModal(statusChart, 'Status'); } catch (e) {}

    // Priority
    const priorityCounts = {};
    filtered.forEach(d => { const p = d.Priority || 'None'; priorityCounts[p] = (priorityCounts[p] || 0) + 1; });
    if (priorityChart) try { priorityChart.destroy(); } catch (e) {}
    priorityChart = new Chart(ctxPriority, {
      type: 'pie',
      data: {
        labels: Object.keys(priorityCounts),
        datasets: [{
          data: transformCountsForPie(Object.values(priorityCounts), 'sqrt'),
          _rawCounts: Object.values(priorityCounts),
          backgroundColor: ["#002056", "#f1c40f", "#f39c12", "#e74c3c", "#3498db", "#9b59b6", "#16a085", "#d35400", "#ff6b6b"]
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (ctx) {
                try {
                  const ds = ctx.dataset;
                  const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
                  const total = ds._rawCounts ? ds._rawCounts.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
                  const pct = total ? ((raw / total) * 100).toFixed(1) : '0.0';
                  return `${raw} (${pct}%)`;
                } catch (e) { return `${ctx.parsed}`; }
              }
            }
          }
        }
      }
    });
    try { addChartLegendModal(priorityChart, 'Priority'); } catch (e) {}

    // Page Type
    const pageTypeCounts = {};
    filtered.forEach(d => { const pt = d['Page Type'] || 'Not Set'; pageTypeCounts[pt] = (pageTypeCounts[pt] || 0) + 1; });
    if (pageTypeChart) try { pageTypeChart.destroy(); } catch (e) {}
    pageTypeChart = new Chart(ctxPageType, {
      type: 'pie',
      data: {
        labels: Object.keys(pageTypeCounts),
        datasets: [{
          data: transformCountsForPie(Object.values(pageTypeCounts), 'sqrt'),
          _rawCounts: Object.values(pageTypeCounts),
          backgroundColor: ["#002056", "#2ecc71", "#e74c3c", "#f39c12", "#3498db", "#6f42c1"]
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (ctx) {
                try {
                  const ds = ctx.dataset;
                  const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
                  const total = ds._rawCounts ? ds._rawCounts.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
                  const pct = total ? ((raw / total) * 100).toFixed(1) : '0.0';
                  return `${raw} (${pct}%)`;
                } catch (e) { return `${ctx.parsed}`; }
              }
            }
          }
        }
      }
    });
    try { addChartLegendModal(pageTypeChart, 'Page Type'); } catch (e) {}

    // Published Symphony
    const pubSymCounts = {};
    filtered.forEach(d => { const ps = d['Published Symphony'] || 'Not Set'; pubSymCounts[ps] = (pubSymCounts[ps] || 0) + 1; });
    if (pubSymChart) try { pubSymChart.destroy(); } catch (e) {}
    pubSymChart = new Chart(ctxPubSym, {
      type: 'pie',
      data: {
        labels: Object.keys(pubSymCounts),
        datasets: [{
          data: transformCountsForPie(Object.values(pubSymCounts), 'sqrt'),
          _rawCounts: Object.values(pubSymCounts),
          backgroundColor: ["#002056", "#e74c3c", "#f39c12", "#3498db", "#9b59b6"]
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (ctx) {
                try {
                  const ds = ctx.dataset;
                  const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
                  const total = ds._rawCounts ? ds._rawCounts.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
                  const pct = total ? ((raw / total) * 100).toFixed(1) : '0.0';
                  return `${raw} (${pct}%)`;
                } catch (e) { return `${ctx.parsed}`; }
              }
            }
          }
        }
      }
    });
    try { addChartLegendModal(pubSymChart, 'Published Symphony'); } catch (e) {}

      // Effort Needed
      const effortCounts = {};
      filtered.forEach(d => { const ef = d['Effort Needed'] || 'Not Set'; effortCounts[ef] = (effortCounts[ef] || 0) + 1; });
      if (effortChart) try { effortChart.destroy(); } catch (e) {}
      effortChart = new Chart(ctxEffort, {
        type: 'pie',
        data: {
          labels: Object.keys(effortCounts),
          datasets: [{
            data: transformCountsForPie(Object.values(effortCounts), 'sqrt'),
            _rawCounts: Object.values(effortCounts),
            backgroundColor: ["#002056", "#f1c40f", "#f39c12", "#e74c3c", "#3498db", "#9b59b6", "#16a085", "#d35400", "#ff6b6b"]
          }]
        },
        options: {
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (ctx) {
                  try {
                    const ds = ctx.dataset;
                    const raw = ds._rawCounts && ds._rawCounts[ctx.dataIndex] ? ds._rawCounts[ctx.dataIndex] : ctx.parsed || 0;
                    const total = ds._rawCounts ? ds._rawCounts.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
                    const pct = total ? ((raw / total) * 100).toFixed(1) : '0.0';
                    return `${raw} (${pct}%)`;
                  } catch (e) { return `${ctx.parsed}`; }
                }
              }
            }
          }
        }
      });
      try { addChartLegendModal(effortChart, 'Effort Needed'); } catch (e) {}
  }catch(err){ console.warn('renderCharts failed', err); }
}

function updateDashboard(){
  // Reset user toggle flag when filters change so smart default applies again
  userToggledHidden = false;
  
  renderCards();
  // Only render the table if Tabulator is available
  if (typeof Tabulator !== 'undefined') {
    try { renderTable(); } catch(e){ console.warn('renderTable failed', e); }
  }

  // Only render charts if Chart.js is present
  if (typeof Chart !== 'undefined') {
    try { renderCharts(getFilteredData()); } catch(e){ console.warn('renderCharts failed', e); }
  }

  try { renderOverallProgress(getFilteredData()); } catch(e){ console.warn('renderOverallProgress failed', e); }

  // Update Page Details badge with current filtered count
  try{
    const badge = document.getElementById('pageDetailsBadge');
    if (badge) badge.textContent = String(getFilteredData().length || 0);
  }catch(e){}
}

/* Migration Dates module: FullCalendar (grid) + Agenda (list) + Table (Tabulator) */
(function(){
  let migrationData = [];
  let fullCalendar = null;
  const E_TZ = 'America/New_York';

  // Parse a date value for display in the configured timezone.
  // If the value is a date-only string (YYYY-MM-DD) treat it as that calendar day
  // by creating a UTC-noon instant so timezone conversions won't push it to the previous day.
  function parseDateForDisplay(v){
    if (!v) return null;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$$/.test(v)){
      // Use UTC noon to avoid timezone day shifting when formatting
      return new Date(v + 'T12:00:00Z');
    }
    const d = new Date(v);
    if (isNaN(d)) return null;
    return d;
  }

  function formatDateISO(d){
    if (!d) return '';
    const dt = parseDateForDisplay(d);
    if (!dt) return '';
    try {
      return dt.toLocaleDateString('en-US', { timeZone: E_TZ, year:'numeric', month:'short', day:'numeric' });
    } catch (e) {
      return dt.toLocaleDateString();
    }
  }
  
  function toEvent(r){
    const raw = r['Migration Date'] || r.migrationDate || r.MigrationDate || null;
    const isDateOnly = typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw);
    const parsed = parseDateForDisplay(raw);
    const ev = {
      title: r['Site Title'] || r.siteTitle || '(No Title)',
      start: parsed || null,
      url: r['View Website URL'] || r.viewUrl || r.viewWebsiteUrl || null,
      extendedProps: { division: r['Division'] || r.division || '' }
    };
    if (isDateOnly) ev.allDay = true;
    return ev;
  }

  function buildAgendaHTML(data){
    const groups = data.reduce((acc,row)=>{
      const raw = row['Migration Date'];
      const pd = parseDateForDisplay(raw);
      const key = pd ? pd.toLocaleString('en-US',{year:'numeric',month:'long', timeZone: E_TZ}) : 'Unscheduled';
      (acc[key]=acc[key]||[]).push(row);
      return acc;
    },{});

    const keys = Object.keys(groups).sort((a,b)=>{
      if (a==='Unscheduled') return 1;
      if (b==='Unscheduled') return -1;
      const da = new Date(groups[a][0]['Migration Date']);
      const db = new Date(groups[b][0]['Migration Date']);
      return da - db;
    });

    const container = document.createElement('div');
    container.className = 'migration-agenda';

    keys.forEach(k=>{
      const section = document.createElement('div');
      section.className = 'mb-3';
      const h = document.createElement('h6'); h.textContent = k; section.appendChild(h);
      const list = document.createElement('div'); list.className = 'list-group';

  groups[k].sort((a,b)=> new Date(a['Migration Date']||8640000000000000) - new Date(b['Migration Date']||8640000000000000)).forEach(r=>{
        const url = r['View Website URL'] || r.viewUrl || r.viewWebsiteUrl || '';
        let item;
        if (url) {
          item = document.createElement('a');
          item.href = url;
          item.target = '_blank';
          item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
        } else {
          // Use a non-clickable container when there's no URL
          item = document.createElement('div');
          item.className = 'list-group-item d-flex justify-content-between align-items-start';
        }
        const left = document.createElement('div'); left.innerHTML = '<div class="fw-bold">'+(r['Site Title']||'(No Title)')+'</div>'+(r['Division']?'<small class="text-muted">'+r['Division']+'</small>':'');
        const right = document.createElement('div'); right.className='text-end'; right.innerHTML = '<div>'+formatDateISO(r['Migration Date'])+'</div>'+(url?'<div><small class="text-primary">Visit</small></div>':'');
        item.appendChild(left); item.appendChild(right); list.appendChild(item);
      });

      section.appendChild(list); container.appendChild(section);
    });

    return container;
  }

  function renderAgenda(filtered){
    const el = document.getElementById('migrationAgenda'); if(!el) return; el.innerHTML=''; el.appendChild(buildAgendaHTML(filtered));
  }

  // Table view removed — migration modal shows Calendar and Agenda only

  // Refresh the FullCalendar instance using an optional data array (filteredResults).
  // If no data is provided, fall back to migrationData or sample data.
  function refreshFullCalendar(filteredResults){
    const el = document.getElementById('migrationFullCalendar'); if(!el || typeof FullCalendar==='undefined') return;
    // Use provided filteredResults if present, otherwise migrationData, otherwise sample data
    const source = Array.isArray(filteredResults) ? filteredResults : ((Array.isArray(migrationData) && migrationData.length) ? migrationData : (typeof _migrationSampleData !== 'undefined' ? _migrationSampleData : []));
    const events = (Array.isArray(source) ? source : []).filter(r=>r['Migration Date']).map(toEvent);
    if (!fullCalendar){
      fullCalendar = new FullCalendar.Calendar(el,{
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },
        timeZone: E_TZ,
        navLinks: true,
        events: events,
        eventClick: function(info){ if(info.event.url){ info.jsEvent.preventDefault(); window.open(info.event.url,'_blank'); } },
        height: 'auto',
        themeSystem: 'bootstrap'
      });
      fullCalendar.render();
    } else {
      // Replace existing events with the filtered set
      fullCalendar.removeAllEvents();
      events.forEach(e=>fullCalendar.addEvent(e));
    }
    // Remove any previously injected custom calendar buttons (cleanup)
    try{
      const oldPrev = document.getElementById('calendarPrevBtn'); if (oldPrev) oldPrev.remove();
      const oldNext = document.getElementById('calendarNextBtn'); if (oldNext) oldNext.remove();
    }catch(e){}

    // Enhance the existing FullCalendar prev/next buttons: add icons, titles and ensure bootstrap button classes
    try{
      const calRoot = el;
      const prev = calRoot.querySelector('.fc-prev-button');
      const next = calRoot.querySelector('.fc-next-button');
      if (prev){
        prev.classList.add('btn','btn-primary','btn-sm');
        prev.innerHTML = '&#x2190;'; // left arrow
        prev.setAttribute('title','Previous month');
      }
      if (next){
        next.classList.add('btn','btn-primary','btn-sm');
        next.innerHTML = '&#x2192;'; // right arrow
        next.setAttribute('title','Next month');
      }
    }catch(e){}
  }

  function filterMigrationData(q){
    // Use migrationData when populated; otherwise fall back to sample data so search works even without an external data source
    const source = (Array.isArray(migrationData) && migrationData.length) ? migrationData : (typeof _migrationSampleData !== 'undefined' ? _migrationSampleData : []);
    if(!q) return Array.isArray(source) ? source.slice() : [];
    const s = q.toLowerCase();
    return (Array.isArray(source) ? source : []).filter(r=> (r['Site Title']||'').toLowerCase().includes(s) || (r['Division']||'').toLowerCase().includes(s));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
  const btnCal = document.getElementById('viewCalendarBtn');
  const btnAgenda = document.getElementById('viewAgendaBtn');
    const search = document.getElementById('migrationSearch');
    const modal = document.getElementById('migrationDatesModal');
    const exportBtn = document.getElementById('exportMigrationJson');

  // Force a consistent height for the Modified From/To date inputs via inline style
  // This guarantees the visual change even if a framework rule is stronger.
  ['filterModifiedFrom','filterModifiedTo'].forEach(id=>{
    try{
      const el = document.getElementById(id);
      if(el){
        el.style.height = '38px';
        el.style.minHeight = '38px';
        el.style.padding = '6px 8px';
        el.style.boxSizing = 'border-box';
      }
    }catch(e){}
  });

  // Toggle views: preserve original button classes (e.g. btn btn-outline-primary btn-sm)
  // and only toggle an 'active' state and aria-pressed for accessibility.
  function showCalendar(){
    document.getElementById('migrationFullCalendar').style.display = '';
    document.getElementById('migrationAgenda').style.display = 'none';
    if (btnCal) {
      btnCal.classList.add('active');
      btnCal.setAttribute('aria-pressed', 'true');
    }
    if (btnAgenda) {
      btnAgenda.classList.remove('active');
      btnAgenda.setAttribute('aria-pressed', 'false');
    }
  }

  function showAgenda(){
    document.getElementById('migrationFullCalendar').style.display = 'none';
    document.getElementById('migrationAgenda').style.display = '';
    if (btnAgenda) {
      btnAgenda.classList.add('active');
      btnAgenda.setAttribute('aria-pressed', 'true');
    }
    if (btnCal) {
      btnCal.classList.remove('active');
      btnCal.setAttribute('aria-pressed', 'false');
    }
  }

    if (btnCal) btnCal.addEventListener('click', ()=>{ showCalendar(); if(!fullCalendar) refreshFullCalendar(); else fullCalendar.changeView('dayGridMonth'); });
    if (btnAgenda) btnAgenda.addEventListener('click', ()=>{ showAgenda(); });

    // Initialize button pressed state and ensure original classes are preserved.
    try{
      if (btnCal){ btnCal.classList.remove('active'); btnCal.setAttribute('aria-pressed','false'); }
      if (btnAgenda){ btnAgenda.classList.remove('active'); btnAgenda.setAttribute('aria-pressed','false'); }
    }catch(e){}

    if (search) search.addEventListener('input', ()=>{
      const q = search.value.trim(); const filtered = filterMigrationData(q);
      renderAgenda(filtered);
      // update calendar with filtered dataset
      refreshFullCalendar(filtered);
    });

  if (modal) modal.addEventListener('shown.bs.modal', ()=>{
      const source = (Array.isArray(migrationData) && migrationData.length) ? migrationData : (typeof _migrationSampleData !== 'undefined' ? _migrationSampleData.slice() : []);
      // apply any active search filter when opening
      const q = search && search.value ? search.value.trim() : '';
      const filtered = q ? filterMigrationData(q) : source;
      renderAgenda(filtered);
      refreshFullCalendar(filtered);
      if (fullCalendar) fullCalendar.render();
    });

    if (exportBtn) exportBtn.addEventListener('click', function(e){ e.preventDefault(); const blob=new Blob([JSON.stringify(migrationData,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='migration-dates.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });

  // default to Agenda view on open (will set 'active' on the Agenda button)
  if (btnAgenda) btnAgenda.click();
  });

  window.setMigrationData = function(dataArray){
    if (!Array.isArray(dataArray)) return;
    migrationData = dataArray.map(r=>({
      'Site Title': r['Site Title'] || r.siteTitle || '',
      'Migration Date': r['Migration Date'] || r.migrationDate || r.MigrationDate || '',
      'View Website URL': r['View Website URL'] || r.viewUrl || r.viewWebsiteUrl || '',
      'Division': r['Division'] || r.division || ''
    }));

    const modalEl = document.getElementById('migrationDatesModal');
    if (modalEl && modalEl.classList.contains('show')){
      renderAgenda(migrationData); initTable(migrationData); refreshFullCalendar();
    }
  };

})();

