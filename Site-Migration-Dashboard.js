
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

function normalizeRevampFilterValue(value) {
  if (value === undefined || value === null || String(value).trim() === '') return 'Not Set';
  if (value === true || value === 1 || value === '1') return 'Yes';
  const s = String(value).toLowerCase().trim();
  if (s === 'true' || s === 'yes') return 'Yes';
  if (s === 'false' || s === 'no' || s === '0') return 'No';
  return String(value);
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
  filterRevamp: d => normalizeRevampFilterValue(d["Revamp Page"]),
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
    filterRevamp: getSelectValue("filterRevamp"),
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

// Helper: determine if a row is marked for revamp
function isRevampPage(row){
  if (!row) return false;
  const v = row['Revamp Page'] || row.RevampPage || row.revamp || '';
  if (v === true) return true;
  if (!v && v !== 0) return false;
  try{ const s = String(v).toLowerCase().trim(); return s === 'true' || s === 'yes' || s === '1'; }catch(e){ return false; }
}

// Helper: determine if a row is marked as Service Center Page
function isServiceCenterPage(row){
  if (!row) return false;
  const v = row['Service Center Page'] || row.ServiceCenterPage || row.serviceCenter || '';
  if (v === true) return true;
  if (!v && v !== 0) return false;
  try{ const s = String(v).toLowerCase().trim(); return s === 'true' || s === 'yes' || s === '1'; }catch(e){ return false; }
}

// Helper: read the automated redirect-verification note (Redirect Status field) and
// classify it. Most non-blank values start with "Redirect verified" (OK); anything
// else non-blank (e.g. "Redirect goes to the wrong page …") is a real QA flag.
function getRedirectCheckStatus(row){
  const raw = (row && row['Redirect Status'] || '').toString().trim();
  if (!raw) return { checked: false, flagged: false, raw: '' };
  const flagged = !/^redirect verified/i.test(raw);
  return { checked: true, flagged, raw };
}

// The site a page should be counted under. "Service Center Site Name" is how the team
// marks a page that landed on its own site in Zesty (or a similar re-home), so whenever
// that field is set it wins — including for rows where the Service Center Page checkbox
// was never ticked. Without this, 9 distinct sites existed only as a Service Center Site
// Name and were never counted as sites at all.
function getSiteGroupTitle(row){
  if (!row) return 'Unknown';
  const scName = (row['Service Center Site Name'] || '').toString().trim();
  if (scName) return scName;
  return (row['Site Title'] || row['Site'] || 'Unknown').toString().trim() || 'Unknown';
}

// Distinguish a page that was genuinely migrated into Zesty from one that was only
// redirected. A truly migrated page has BOTH Zesty coordinates — the mobile editor path
// and the URL path part; a redirect-only page is missing one or both (and its migration
// notes typically describe a redirect check rather than a migration run).
function isFullyMigratedPage(row){
  if (!row) return false;
  const editor = (row['Zesty Content Mobile Editor Path'] || '').toString().trim();
  const pathPart = (row['Zesty URL Path Part'] || '').toString().trim();
  return !!(editor && pathPart);
}

// Resolve a row's best true migration-completion date: Migration Date -> Last Migrated ->
// Last Migration -> a date found inside Migration Notes. That last fallback is skipped
// when Migration Notes is itself a later redirect-verification stamp (e.g. "Redirect
// verified — … (2026-09-05 22:48)") rather than an actual PROD migration report — the
// redirect checker overwrites Migration Notes with its own note+date after the real
// migration, so blindly regex-matching a date out of it would show the verification date
// as if it were the migration date. Used everywhere a "when was this page migrated" date
// is needed: the velocity chart, footer activity figure, Migration Tool Insights, and the
// Migration Dates calendar/agenda.
function resolveMigrationDateStr(row){
  if (!row) return null;
  let raw = row['Migration Date'] || row.migrationDate || row['Last Migrated'] || row['Last Migration'] || null;
  if (!raw && row['Migration Notes']) {
    const notes = String(row['Migration Notes']);
    const isVerificationNote = /^redirect (verified|goes to|works with)/i.test(notes.trim());
    if (!isVerificationNote) {
      const match = notes.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2})/);
      if (match) raw = match[0];
    }
  }
  return raw || null;
}

// Render the footer: the "Data last refreshed" line plus one clear activity figure.
// Activity is based on the genuine per-page "Last Migrated" timestamp — not
// "Modified", which is bulk-touched by the sync app and isn't a real activity signal
// (see the Migration Velocity chart for the same reasoning). Uses the full dataset,
// not the active filters, since this is a global status line.
function updateFooterStats(){
  const refreshEl = document.getElementById('refreshDate');
  if (!refreshEl) return;
  const ver = (window.APP_VERSION || APP_VERSION);

  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);

  let thisWeekCount = 0, lastWeekCount = 0;
  (Array.isArray(tableData) ? tableData : []).forEach(d => {
    const canon = getCanonicalStatus(d.Status);
    if (canon !== 'Completed' && canon !== 'THQ Redirect') return;
    const dStr = resolveMigrationDateStr(d);
    if (!dStr) return;
    const dt = new Date(dStr);
    if (isNaN(dt)) return;
    if (dt >= thisWeekStart) thisWeekCount++;
    else if (dt >= lastWeekStart) lastWeekCount++;
  });

  const rows = Array.isArray(tableData) ? tableData : [];
  const totalPages = rows.length;
  const resolved = rows.filter(d => {
    const canon = getCanonicalStatus(d.Status);
    return canon === 'Completed' || canon === 'THQ Redirect' || canon === 'Do Not Migrate';
  }).length;
  const pctResolved = totalPages ? ((resolved / totalPages) * 100).toFixed(1) : '0.0';

  const delta = thisWeekCount - lastWeekCount;
  const trendClass = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const trendIcon = delta > 0 ? 'bi-arrow-up-right' : delta < 0 ? 'bi-arrow-down-right' : 'bi-dash';
  const trendText = delta === 0
    ? 'level with last week'
    : `${Math.abs(delta)} ${delta > 0 ? 'more' : 'fewer'} than last week`;

  refreshEl.innerHTML = `
    <div class="footer-brand">
      <span class="footer-mark"><i class="bi bi-rocket-takeoff"></i></span>
      <span>
        <span class="footer-title">Sites Page Migration</span>
        <span class="footer-meta">v${ver} · Data refreshed ${escapeHtml(dashboardRefreshedText || 'unknown')}</span>
      </span>
    </div>
    <div class="footer-stats">
      <div class="footer-stat">
        <span class="footer-stat-value">${pctResolved}%</span>
        <span class="footer-stat-label">Overall resolved</span>
      </div>
      <div class="footer-stat">
        <span class="footer-stat-value">${resolved.toLocaleString()}<span class="footer-stat-of"> / ${totalPages.toLocaleString()}</span></span>
        <span class="footer-stat-label">Pages</span>
      </div>
      <div class="footer-stat">
        <span class="footer-stat-value">${thisWeekCount}
          <span class="footer-trend ${trendClass}"><i class="bi ${trendIcon}"></i></span>
        </span>
        <span class="footer-stat-label">Completed this week · ${trendText}</span>
      </div>
    </div>
  `;
}

function getFilteredData(){
  const div = getSelectValue("filterDivision");
  const ac = getSelectValue("filterAC");
  const status = getSelectValue("filterStatus");
  const pageType = getSelectValue("filterPageType");
  const pubSym = getSelectValue("filterPubSym");
  const symType = getSelectValue("filterSymType");
  const priority = getSelectValue("filterPriority");
  const revamp = getSelectValue("filterRevamp");
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
    // Revamp Needed
    if (revamp) {
      if (normalizeRevampFilterValue(d["Revamp Page"]) !== revamp) return false;
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
let dashboardRefreshedText = ''; // "Data last refreshed" text, set once on load, read by updateFooterStats()
let currentPageSize = parseInt(localStorage.getItem('dashboardPageSize')) || 20; // Load from localStorage or default to 20
// Top-level chart handles (Chart.js instances) — initialized to null so renderCharts can safely destroy/create
let statusChart = null;
let priorityChart = null;
let pageTypeChart = null;
let pubSymChart = null;
let effortChart = null;
let velocityChart = null;
// Breakdown toggle states
let showStatusBreakdown = false;
let showHidden = false;
let show100Only = false;
let hideProgressBars = false; // Track if progress bars should be hidden
let userToggledHidden = false; // Track if user manually toggled the 0% visibility
let showOnlyPending = false; // when true, breakdown shows only groups with Pending Migration
let showOnlyRFMT = false; // when true, breakdown shows only groups with Ready for Migration Tool
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
const APP_VERSION = '2606.18.1136';
// Also expose to window so you can tweak at runtime in the browser console if needed
window.APP_VERSION = window.APP_VERSION || APP_VERSION;

// Global status color map (used by multiple renderers)
const statusColors = {
  "Do Not Migrate": "#E74C3C", // red
  "Completed": "#28a745",      // green
  "In QA": "#fd7e14",          // orange
  "Needs Info": "#002056",     // navy
  "Ready for Migration Tool": "#17a2b8", // cyan-ish (1c. RFMT)
  "Pending Migration": "#0D6FB8", // light blue
  "In Progress": "#6f42c1",    // purple
  "THQ Redirect": "#00929C",    // teal
  "Unknown": "#6c757d"         // gray
};

// Display labels for statuses when shown in UI (keep canonical keys internally)
const statusDisplay = {
  "Ready for Migration Tool": "Ready"
};

// Scroll-triggered reveal for every major section down the page: each one starts
// slightly lowered and transparent, then settles as it scrolls into view, with a small
// stagger between neighbours so sections arrive in sequence rather than all at once.
(function initScrollReveal(){
  const SECTION_SELECTORS = [
    '.filters-row',
    '#metricCards',
    '.dash-panel',
    '.accordion',
    '.charts-scroll-wrapper',
    '.chart-container',
    '.dashboard-footer',
    'h3'
  ].join(',');

  function start(){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = Array.from(document.querySelectorAll(SECTION_SELECTORS))
      // Don't animate accordions nested inside another animated accordion — the parent
      // reveal already covers them, and nesting the effect looks jittery.
      .filter(el => !el.closest('.modal') && !el.parentElement.closest('.accordion'));

    if (!nodes.length || typeof IntersectionObserver === 'undefined') return;

    nodes.forEach(el => el.classList.add('dash-reveal'));

    let lastRevealTime = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger anything that becomes visible in the same burst.
        const now = performance.now();
        const sinceLast = now - lastRevealTime;
        const delay = sinceLast < 400 ? Math.min(320, 90 + sinceLast / 4) : 0;
        lastRevealTime = now;
        setTimeout(() => {
          el.classList.add('is-visible');
          // Once it has settled, take it out of the transition path entirely so it
          // isn't an animation candidate during normal interaction.
          setTimeout(() => el.classList.add('reveal-done'), 700);
        }, delay);
        observer.unobserve(el);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    nodes.forEach(el => observer.observe(el));

    // Safety net: if anything never intersects (hidden container, odd layout), show it
    // rather than leaving it invisible.
    setTimeout(() => {
      document.querySelectorAll('.dash-reveal:not(.is-visible)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('is-visible');
      });
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

// Rich hover tooltip: any element with a `data-rich-tooltip` attribute (HTML content,
// built via buildRichTooltipHtml) gets a nicely styled floating panel near the cursor
// instead of the plain native browser title tooltip. Single delegated listener + one
// shared floating element, so this scales to any number of bars/segments on the page.
(function initRichTooltip(){
  let tipEl = null;
  function ensureTip(){
    if (tipEl) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'rich-tooltip';
    tipEl.style.display = 'none';
    document.body.appendChild(tipEl);
    return tipEl;
  }
  function findTarget(el){
    while (el && el !== document.body && el.nodeType === 1) {
      if (el.hasAttribute && el.hasAttribute('data-rich-tooltip')) return el;
      el = el.parentElement;
    }
    return null;
  }
  function positionTip(tip, x, y){
    // Generous offset so the panel clears the cursor itself — large/custom mouse
    // pointers can be 32-48px, and a tight offset put the tooltip under the pointer.
    const padX = 34;
    const padY = 30;
    const rect = tip.getBoundingClientRect();
    let left = x + padX;
    let top = y + padY;
    // Flip to the other side when it would run off-screen
    if (left + rect.width > window.innerWidth - 10) left = x - rect.width - padX;
    if (top + rect.height > window.innerHeight - 10) top = y - rect.height - padY;
    tip.style.left = Math.max(10, left) + 'px';
    tip.style.top = Math.max(10, top) + 'px';
  }
  document.addEventListener('mouseover', (e) => {
    const target = findTarget(e.target);
    if (!target) return;
    const tip = ensureTip();
    tip.innerHTML = target.getAttribute('data-rich-tooltip') || '';
    tip.style.display = 'block';
    positionTip(tip, e.clientX, e.clientY);
  });
  // Only tracks while a tooltip is actually showing, and at most once per frame —
  // a per-move reposition on every pointer event made the page feel heavy.
  let rafPending = false;
  document.addEventListener('mousemove', (e) => {
    if (!tipEl || tipEl.style.display === 'none' || rafPending) return;
    rafPending = true;
    const { clientX, clientY } = e;
    requestAnimationFrame(() => {
      rafPending = false;
      if (tipEl && tipEl.style.display !== 'none') positionTip(tipEl, clientX, clientY);
    });
  }, { passive: true });
  document.addEventListener('mouseout', (e) => {
    const target = findTarget(e.target);
    if (target && !findTarget(e.relatedTarget)) {
      if (tipEl) tipEl.style.display = 'none';
    }
  });
  // Hide on scroll (e.g. a modal's internal scroll container) so a tooltip never gets stuck.
  document.addEventListener('scroll', () => { if (tipEl) tipEl.style.display = 'none'; }, true);
})();

// Build the HTML content for a rich hover tooltip (a title line + a color-swatched row
// per segment). The returned string is meant to be HTML-attribute-escaped and set as a
// `data-rich-tooltip` attribute — see initRichTooltip().
function buildRichTooltipHtml(titleText, rows) {
  const rowsHtml = rows.map(r => `<div class="rich-tooltip-row"><span class="swatch" style="background:${r.color || '#888'};"></span><span>${escapeHtml(r.label)}: <strong>${r.n}</strong>${r.note ? escapeHtml(r.note) : ''}</span></div>`).join('');
  return `<div class="rich-tooltip-title">${escapeHtml(titleText)}</div>${rowsHtml}`;
}

// Plain-text variant of the rich tooltip (no swatched rows) — used for icon badges like
// "QA Notes" where the content is free text rather than a breakdown.
function buildRichTooltipTextHtml(text, titleText) {
  return `${titleText ? `<div class="rich-tooltip-title">${escapeHtml(titleText)}</div>` : ''}<div class="rich-tooltip-text">${escapeHtml(text || '')}</div>`;
}

// Build a compact stacked mini-bar showing the canonical-status breakdown for a set of
// pages. Used in the Site Migration Status modal in place of dense numeric columns —
// hover (or tap) the bar to see the full breakdown in a rich tooltip, including the
// 2c/4b/5x sub-detail that isn't broken out as its own segment.
function buildStatusMiniBarHtml(stats, total) {
  stats = stats || {};
  const segments = [
    { key: '1a', label: 'Needs Info', color: statusColors['Needs Info'] },
    { key: '1b', label: 'Pending Migration', color: statusColors['Pending Migration'] },
    { key: '1c', label: 'Ready for Migration Tool', color: statusColors['Ready for Migration Tool'] },
    { key: '2.x', label: 'In Progress', color: statusColors['In Progress'] },
    { key: '3.x', label: 'In QA', color: statusColors['In QA'] },
    { key: 'Live', label: 'Completed', color: statusColors['Completed'] },
    { key: 'Redirect', label: 'THQ Redirect', color: statusColors['THQ Redirect'] },
    { key: 'DNM', label: 'Do Not Migrate', color: statusColors['Do Not Migrate'] }
  ];
  const t = total || segments.reduce((a, s) => a + (stats[s.key] || 0), 0);
  if (!t) return '<span class="text-muted small">—</span>';

  const tooltipRows = [];
  const bars = segments.map(seg => {
    const n = stats[seg.key] || 0;
    if (!n) return '';
    let note = '';
    if (seg.key === '2.x' && stats['2c']) note = ` (incl. ${stats['2c']} flagged "Updates Needed")`;
    if (seg.key === 'Live') {
      const fivePages = stats['5x'] || 0;
      const fourPages = Math.max(0, n - fivePages);
      if (fivePages || fourPages) note = ` (${fivePages} published & redirected, ${fourPages} QA-complete/pending publish)`;
    }
    tooltipRows.push({ label: seg.label, n, note, color: seg.color });
    return `<span style="flex:${Math.max(n, t * 0.02)} 0 0%; background:${seg.color};"></span>`;
  }).join('');

  const tooltipHtml = buildRichTooltipHtml(`Status Breakdown — Total: ${t}`, tooltipRows);
  return `<div class="status-mini-bar" style="display:flex; height:14px; width:100%; min-width:70px; border-radius:3px; overflow:hidden; background:#e9ecef;" data-rich-tooltip="${escapeHtml(tooltipHtml)}">${bars}</div>`;
}

// Generic compact stacked segment bar (unlike buildStatusMiniBarHtml, not tied to the
// canonical status buckets) — used for the QA Issues metric card.
function buildSegmentBarHtml(segments, total) {
  const segs = (segments || []).filter(s => (s.n || 0) > 0);
  const t = total || segs.reduce((a, s) => a + (s.n || 0), 0);
  if (!t) return '<span class="text-white-50 small">—</span>';
  const tooltipHtml = buildRichTooltipHtml(`Total: ${t}`, segs);
  const bars = segs.map(s => `<span style="flex:${Math.max(s.n, t * 0.02)} 0 0%; background:${s.color};"></span>`).join('');
  return `<div class="status-mini-bar" style="display:flex; height:100%; width:100%; border-radius:3px; overflow:hidden;" data-rich-tooltip="${escapeHtml(tooltipHtml)}">${bars}</div>`;
}

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

    // Store refreshDate text if present; updateFooterStats() (called once tableData is
    // populated below) renders the full footer, including the activity figure.
    if (json && (json.refreshDate || json.refresh_date || json.refresh)){
      const raw = json.refreshDate || json.refresh_date || json.refresh;
      let formatted = raw;
      const parsedDate = new Date(raw);
      if (!isNaN(parsedDate.getTime())){
        formatted = parsedDate.toLocaleString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true, timeZoneName:'short' });
      }
      dashboardRefreshedText = formatted;
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

function anyDashboardFilterActive(){
  const ids = ["filterDivision","filterAC","filterStatus","filterPageType","filterPubSym","filterSymType","filterPriority","filterRevamp","filterSiteTitle"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && el.value) return true;
  }
  const modFrom = document.getElementById('filterModifiedFrom');
  const modTo = document.getElementById('filterModifiedTo');
  if ((modFrom && modFrom.value) || (modTo && modTo.value)) return true;
  return false;
}

function getQaSourceData(preferredData){
  if (!anyDashboardFilterActive() && Array.isArray(masterData) && masterData.length) {
    return masterData;
  }
  if (Array.isArray(preferredData) && preferredData.length) return preferredData;
  if (typeof getFilteredData === 'function') return getFilteredData();
  return tableData;
}

function buildExpandedQaIssueRows(sourceData){
  const issueRows = [];
  (Array.isArray(sourceData) ? sourceData : []).forEach(r => {
    const lookups = (r['QA Issues.lookupValue'] || '').toString().split(';').map(s => s.trim()).filter(Boolean);
    const redirectInfo = getRedirectCheckStatus(r);
    const redirectCheck = redirectInfo.flagged ? redirectInfo.raw : '';
    if (!lookups.length) {
      if (isRevampPage(r)) {
        const isNotPublished = ((r['Revamp Publish Y/N'] || '').toString().trim().toLowerCase() === 'no');
        issueRows.push({
          ID: r.ID,
          Title: r.Title || r['Site Title'] || '',
          'Symphony Site Type': r['Symphony Site Type'] || '',
          'Page URL': r['Page URL'] || '',
          'Zesty URL Path Part': r['Zesty URL Path Part'] || '',
          Status: r.Status || '',
          Priority: r.Priority || '',
          'QA Notes': r['QA Notes'] || '',
          'QA Issue': 'Revamp Needed',
          'Not Published': isNotPublished ? 'Yes' : '',
          'Redirect Check': redirectCheck,
          'Site Title': r['Site Title'] || ''
        });
      }
    } else {
      lookups.forEach(lv => {
        const isNotPublished = ((r['Revamp Publish Y/N'] || '').toString().trim().toLowerCase() === 'no');
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
          'Not Published': isNotPublished ? 'Yes' : '',
          'Redirect Check': redirectCheck,
          'Site Title': r['Site Title'] || ''
        });
      });
    }
  });
  return issueRows;
}

// Build a compact, fixed-height info card shared by the QA, Redirect Verification Flags,
// and Service Center sections. Detail that used to be printed as variable-length paragraph
// text (QA notes, issue names, etc.) is now shown as small hoverable icon badges instead —
// the full text lives in the badge's native tooltip — so every card in the grid renders at
// the same height regardless of how much text a given page has.
function buildCompactInfoCard(opts) {
  const { title, siteTitle, statusText, statusColor, icons, footerHtml, footerClass, onClick, onTitleClick } = opts;

  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

  const card = document.createElement('div');
  card.className = 'card h-100 compact-info-card';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body d-flex flex-column';

  const titleEl = document.createElement('h6');
  titleEl.className = 'card-title mb-1 text-center text-truncate';
  titleEl.title = title || '';
  titleEl.textContent = title || '';
  if (onTitleClick) { titleEl.style.cursor = 'pointer'; titleEl.addEventListener('click', onTitleClick); }
  cardBody.appendChild(titleEl);

  const siteEl = document.createElement('div');
  siteEl.className = 'card-subtitle text-muted small mb-2 text-center text-truncate';
  siteEl.title = siteTitle || '';
  siteEl.textContent = siteTitle || '';
  cardBody.appendChild(siteEl);

  if (statusText) {
    const statusRow = document.createElement('div');
    statusRow.className = 'text-center mb-2';
    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge compact-status-badge';
    statusBadge.style.backgroundColor = statusColor || '#6c757d';
    statusBadge.title = `Status: ${statusText}`;
    statusBadge.textContent = statusText;
    statusRow.appendChild(statusBadge);
    cardBody.appendChild(statusRow);
  }

  const iconRow = document.createElement('div');
  iconRow.className = 'compact-icon-row d-flex justify-content-center flex-wrap gap-1 mb-1';
  (icons || []).forEach(ic => {
    const span = document.createElement('span');
    span.className = `compact-icon-badge${ic.variant ? ' variant-' + ic.variant : ''}`;
    span.setAttribute('data-rich-tooltip', buildRichTooltipTextHtml(ic.label || ''));
    span.innerHTML = ic.icon;
    iconRow.appendChild(span);
  });
  cardBody.appendChild(iconRow);

  const spacer = document.createElement('div');
  spacer.className = 'flex-grow-1';
  cardBody.appendChild(spacer);

  const footer = document.createElement('div');
  footer.className = 'mt-auto pt-1 d-flex justify-content-center align-items-center';
  const btn = document.createElement('button');
  btn.className = `btn btn-sm ${footerClass || 'btn-primary'}`;
  btn.innerHTML = footerHtml || 'Open';
  if (onClick) btn.addEventListener('click', onClick);
  footer.appendChild(btn);
  cardBody.appendChild(footer);

  card.appendChild(cardBody);
  col.appendChild(card);
  return col;
}

// --- QA Accordion rendering (one card per page, aggregated issues) ---
function renderQaAccordion(data){
  const container = document.getElementById("qaGroupsBody");
  if (!container) return;
  container.innerHTML = "";

  // Clear previous per-instance QA details to avoid accumulating duplicates across re-renders
  Object.keys(qaIssueDetailsMap).forEach(k => delete qaIssueDetailsMap[k]);

  const qaRows = Array.isArray(data) ? data.filter(d => d["QA Issues.lookupValue"] || isRevampPage(d)) : [];
  const redirectFlaggedRows = Array.isArray(data) ? data.filter(d => getRedirectCheckStatus(d).flagged) : [];
  const qaSourceData = getQaSourceData(data);
  const qaExpandedIssueRows = buildExpandedQaIssueRows(qaSourceData);

  const qaPageCount = qaRows.filter(d => d["QA Issues.lookupValue"] && String(d["QA Issues.lookupValue"]).trim()).length;
  const qaIssueTotal = qaExpandedIssueRows.length;
  const revampCount = qaRows.filter(d => isRevampPage(d)).length;
  const notPublishedCount = qaRows.filter(d => ((d['Revamp Publish Y/N'] || '').toString().trim().toLowerCase() === 'no')).length;
  const qaSummaryEl = document.getElementById('qaAccordionSummary');
  if (qaSummaryEl) qaSummaryEl.innerHTML = `<strong>Pages:</strong> ${qaPageCount} &nbsp;|&nbsp; <strong>Revamp:</strong> ${revampCount} &nbsp;|&nbsp; <strong>Not Published:</strong> ${notPublishedCount}`;
  const badge = document.getElementById("qaBadge");
  if (badge) badge.textContent = qaIssueTotal;

  // Always update the View All Issues button count, even if 0
  try {
    const viewBtn = document.getElementById('viewAllQaBtn');
    const viewCount = document.getElementById('viewAllQaCount');
    if (viewCount) viewCount.textContent = qaIssueTotal || 0;
    if (viewBtn) viewBtn.style.display = (qaIssueTotal > 0) ? '' : 'none';
  } catch(e) {}

  if(!qaRows.length && !redirectFlaggedRows.length){
    container.innerHTML = "<p>No QA Issues or Revamp pages found.</p>";
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
    if (pageIssueIds.length || isRevampPage(page)){
      const notesSet = new Set(
        rows
          .map(r => (r["QA Notes"] || "").toString().trim())
          .filter(Boolean)
      );
      const notesList = Array.from(notesSet);

      const statusRaw = (page.Status || '').toString().trim();
      const statusText = statusRaw || 'Not Set';
      const hasNotPublished = rows.some(r => ((r['Revamp Publish Y/N'] || '').toString().trim().toLowerCase() === 'no'));
      const lookupArray = Array.from(uniqueLookupsSet);

      const icons = [];
      if (pageIssueIds.length) {
        icons.push({
          icon: `<i class="bi bi-clipboard2-pulse"></i><span class="compact-icon-count">${pageIssueIds.length}</span>`,
          label: `${pageIssueIds.length} QA issue${pageIssueIds.length === 1 ? '' : 's'}: ${lookupArray.join('; ')}`,
          variant: 'warning'
        });
      }
      if (notesList.length) {
        icons.push({
          icon: '<i class="bi bi-sticky"></i>',
          label: `QA Notes: ${notesList.join(' | ')}`,
          variant: 'info'
        });
      }
      if (hasNotPublished) {
        icons.push({ icon: '<i class="bi bi-eye-slash"></i>', label: 'Not Published', variant: 'danger' });
      }
      if (isRevampPage(page)) {
        icons.push({ icon: '<i class="bi bi-arrow-repeat"></i>', label: 'Revamp Needed', variant: 'info' });
      }

      const col = buildCompactInfoCard({
        title: page.Title || page['Site Title'] || title,
        siteTitle: page['Site Title'] || '',
        statusText,
        statusColor: statusColors[getCanonicalStatus(statusText)] || '#6c757d',
        icons,
        footerHtml: pageIssueIds.length
          ? `View Issues <span class="badge bg-warning qa-badge ms-2">${pageIssueIds.length}</span>`
          : `Revamp Needed <span class="badge bg-info text-dark ms-2">Open Record</span>`,
        footerClass: pageIssueIds.length ? 'btn-primary' : 'btn-info',
        onClick: pageIssueIds.length
          ? (() => showQaIssuesModal(pageIssueIds[0]))
          : (() => showTableModalById(rows[0]._id))
      });
      rowDiv.appendChild(col);
    }
  });

  frag.appendChild(rowDiv);

  // --- Redirect Verification Flags (from the automated "Redirect Status" check) ---
  if (redirectFlaggedRows.length) {
    const redirectGrouped = {};
    redirectFlaggedRows.forEach(d => {
      const pageTitle = d.Title || d['Site Title'] || 'Untitled Page';
      redirectGrouped[pageTitle] = redirectGrouped[pageTitle] || [];
      redirectGrouped[pageTitle].push(d);
    });

    const redirectHeading = document.createElement('h5');
    redirectHeading.className = 'mt-4 mb-2';
    redirectHeading.innerHTML = `🔁 Redirect Verification Flags <span class="badge bg-danger ms-1">${redirectFlaggedRows.length}</span>`;

    const redirectRowDiv = document.createElement('div');
    redirectRowDiv.className = 'row g-3';

    Object.keys(redirectGrouped).sort().forEach(title => {
      const rows = redirectGrouped[title];
      const page = pageCache[rows[0]._id] || rows[0];
      const statusText = (page.Status || '').toString().trim() || 'Not Set';
      const redirectInfo = getRedirectCheckStatus(page);

      const col = buildCompactInfoCard({
        title: page.Title || page['Site Title'] || title,
        siteTitle: page['Site Title'] || '',
        statusText,
        statusColor: statusColors[getCanonicalStatus(statusText)] || '#6c757d',
        icons: [{ icon: '<i class="bi bi-signpost-split"></i>', label: `Redirect Issue: ${redirectInfo.raw}`, variant: 'danger' }],
        footerHtml: 'Open Record',
        footerClass: 'btn-info',
        onClick: () => showTableModalById(rows[0]._id)
      });
      redirectRowDiv.appendChild(col);
    });

    frag.appendChild(redirectHeading);
    frag.appendChild(redirectRowDiv);
  }

  // Defer appending to avoid layout thrash when many nodes are created
  requestAnimationFrame(()=>{ container.appendChild(frag); });

  // Update the 'View All Issues' button count and wire it up
  try{
    const viewBtn = document.getElementById('viewAllQaBtn');
    const viewCount = document.getElementById('viewAllQaCount');
    if(viewCount) viewCount.textContent = qaIssueTotal || 0;
    if(viewBtn){
      viewBtn.removeEventListener('click', showAllQaModal);
      viewBtn.addEventListener('click', showAllQaModal);
    }
  }catch(e){ /* no-op */ }
}

function renderServiceCenterAccordion(data){
  const container = document.getElementById('serviceCenterGroupsBody');
  if (!container) return;
  container.innerHTML = '';

  const scRows = Array.isArray(data) ? data.filter(d => isServiceCenterPage(d)) : [];
  const uniquePages = new Set((scRows || []).map(d => (d.Title || d['Site Title'] || 'Untitled Page')));

  const badge = document.getElementById('serviceCenterBadge');
  if (badge) badge.textContent = uniquePages.size;

  if (!scRows.length) {
    container.innerHTML = '<p>No Service Center pages found.</p>';
    return;
  }

  const grouped = {};
  scRows.forEach(d => {
    const pageTitle = d.Title || d['Site Title'] || 'Untitled Page';
    grouped[pageTitle] = grouped[pageTitle] || [];
    grouped[pageTitle].push(d);
  });

  const rowDiv = document.createElement('div');
  rowDiv.className = 'row g-3';

  Object.keys(grouped).sort().forEach(title => {
    const rows = grouped[title];
    const page = pageCache[rows[0]._id] || rows[0];
    const statusText = (page.Status || '').toString().trim() || 'Not Set';

    const notesSet = new Set(
      rows.map(r => (r['QA Notes'] || '').toString().trim()).filter(Boolean)
    );
    const notesList = Array.from(notesSet);

    const icons = [{ icon: '<i class="bi bi-building"></i>', label: 'Service Center', variant: 'info' }];
    if (notesList.length) {
      icons.push({ icon: '<i class="bi bi-sticky"></i>', label: `QA Notes: ${notesList.join(' | ')}`, variant: 'info' });
    }

    const col = buildCompactInfoCard({
      title: page.Title || page['Site Title'] || title,
      siteTitle: page['Site Title'] || '',
      statusText,
      statusColor: statusColors[getCanonicalStatus(statusText)] || '#6c757d',
      icons,
      footerHtml: 'Open Record',
      footerClass: 'btn-info',
      onClick: () => showTableModalById(rows[0]._id)
    });
    rowDiv.appendChild(col);
  });

  requestAnimationFrame(() => { container.appendChild(rowDiv); });
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
  const sourceData = getQaSourceData();
  const issueRows = buildExpandedQaIssueRows(sourceData);

  const tabData = issueRows.map(r => ({
    ID: r.ID,
    Title: r.Title,
    'Symphony Site Type': r['Symphony Site Type'],
    'Page URL': r['Page URL'],
    'Zesty URL Path Part': r['Zesty URL Path Part'],
    Status: r.Status,
    'QA Notes': r['QA Notes'],
    'QA Issue': escapeHtml(r['QA Issue'] || ''),
    'Not Published': r['Not Published'] || '',
    'Redirect Check': r['Redirect Check'] || '',
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
          {title:'Not Published', field:'Not Published', hozAlign:'center', width:82, minWidth:70, maxWidth:92, headerWordWrap:true, formatter: function(cell){ return (cell.getValue() === 'Yes') ? '<span style="display:inline-block; max-width:64px; padding:2px 6px; border-radius:10px; background:#dc3545; color:#fff; font-size:0.72rem; font-weight:600; line-height:1.05; white-space:normal; text-align:center;">Not Published</span>' : ''; } },
          {title:'QA Notes', field:'QA Notes', formatter: function(cell){ return escapeHtml(cell.getValue()); } },
          {title:'QA Issue', field:'QA Issue', formatter: function(cell){ return cell.getValue(); } },
          {title:'Redirect Check', field:'Redirect Check', formatter: function(cell){ const v = cell.getValue(); return v ? `<span class="badge bg-danger" style="white-space:normal;">${escapeHtml(v)}</span>` : ''; } },
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

// Global function to generate site summary table (must be outside renderCards)
function generateSiteSummaryTable() {
  const summary = {}; // { Division: { SiteTitle: { 1a: 0, 1b: 0, 1c: 0, 2.x: 0, 3.x: 0, Live: 0, Redirect: 0, DNM: 0, Total: 0 } } }
  const dataToUse = getFilteredData();
  
  // Initialize stats tracking
  const statusCategories = ['1a', '1b', '1c', '2.x', '3.x', 'Live', 'Redirect', 'DNM'];
  
  dataToUse.forEach(d => {
    const div = (d.Division || 'Other').toString().trim();
    const site = getSiteGroupTitle(d);

    if (!summary[div]) summary[div] = {};
    if (!summary[div][site]) {
      summary[div][site] = { 
        '1a': 0, '1b': 0, '1c': 0, 
        '2.x': 0, '2c': 0, '3.x': 0, 
        'Live': 0, '4b': 0, '5x': 0, 'Redirect': 0, 'DNM': 0, 
        Total: 0,
        isDivisional: false
      };
    }
    
    // Mark divisional records strictly by site-title naming.
    try {
      const siteLower = (site || '').toString().toLowerCase();
      if (siteLower.indexOf('division') !== -1 || siteLower.indexOf('territory') !== -1) {
        summary[div][site].isDivisional = true;
      }
    } catch(e) { /* fallback: leave as default false */ }
    
    summary[div][site].Total++;
    
    const s = (d.Status || '').toString().trim();
    let statusKey = 'DNM';
    
    if (s.startsWith('1a')) statusKey = '1a';
    else if (s.startsWith('1b')) statusKey = '1b';
    else if (s.startsWith('1c')) statusKey = '1c';
    else if (s.startsWith('2')) {
      statusKey = '2.x';
      if (s.startsWith('2c')) summary[div][site]['2c'] = (summary[div][site]['2c'] || 0) + 1;
    }
    else if (s.startsWith('3')) statusKey = '3.x';
    else if (s.startsWith('4')) {
      statusKey = 'Live';
      if (s.startsWith('4b')) summary[div][site]['4b'] = (summary[div][site]['4b'] || 0) + 1;
    }
    else if (s.startsWith('5')) { statusKey = 'Live'; summary[div][site]['5x'] = (summary[div][site]['5x'] || 0) + 1; }
    else if (s === 'THQ Redirect') statusKey = 'Redirect';
    else if (s === 'Do Not Migrate') statusKey = 'DNM';
    
    summary[div][site][statusKey]++;
  });

  // Count sites per majority status category (with D/L breakdown)
  const statusSiteCounts = {
    'NotMigrated': { divisional: new Set(), local: new Set() }, // 1a
    'MigrationStarted': { divisional: new Set(), local: new Set() }, // 1b/1c/2.x
    'InQA': { divisional: new Set(), local: new Set() }, // 3.x
    'Live': { divisional: new Set(), local: new Set() } // Live (majority)
  };

  // Also track per-division aggregated majority counts for the division rows
  const divisionMajorCounts = {}; // { division: { NotMigrated:0, MigrationStarted:0, InQA:0, Live:0 } }
  // Map per-site display category for later per-division breakdowns
  const siteDisplay = {}; // { division: { site: displayCat } }

  // Prepare sets to capture sites that have any pages in '5' status, and divisions that have any 5.x pages
  const fiveSiteSets = { divisional: new Set(), local: new Set() };
  const fiveDivisions = new Set();

  Object.keys(summary).forEach(div => {
    divisionMajorCounts[div] = { NotMigrated: 0, MigrationStarted: 0, InQA: 0, Live: 0 };
    siteDisplay[div] = siteDisplay[div] || {};
    Object.keys(summary[div]).forEach(site => {
      const stats = summary[div][site];
      const siteKey = `${div}|${site}`;
      const isDiv = stats.isDivisional;

      // Determine majority status for this site (pick the status with highest page count)
      const counts = {
        '1a': stats['1a'] || 0,
        '1b': stats['1b'] || 0,
        '1c': stats['1c'] || 0,
        '2.x': stats['2.x'] || 0,
        '2c': stats['2c'] || 0,
        '3.x': stats['3.x'] || 0,
        'Live': stats['Live'] || 0,
        '4b': stats['4b'] || 0,
        'Redirect': stats['Redirect'] || 0,
        'DNM': stats['DNM'] || 0
      };

      // Find max key (if tie, prefer more advanced statuses: Live > 3.x > 2.x > 1c > 1b > 1a)
      const order = ['Live', '3.x', '2.x', '1c', '1b', '1a', 'Redirect', 'DNM'];
      let maxKey = '1a';
      let maxVal = -1;
      Object.keys(counts).forEach(k => {
        const v = counts[k];
        if (v > maxVal) { maxVal = v; maxKey = k; }
        else if (v === maxVal && v > 0) {
          // tie-breaker using order
          const prevIdx = order.indexOf(maxKey);
          const curIdx = order.indexOf(k);
          if (curIdx < prevIdx) { maxKey = k; }
        }
      });

      // Map detailed key to display categories using explicit rule set.
      // In Zesty/QA: any 2c, 3.x, or 4b pages.
      // Migration Started: any 1b/1c or 2-starting pages (2.x excluding 2c).
      let displayCat = 'NotMigrated';
      const hasInQaStatus = (stats['2c'] || 0) > 0 || (stats['3.x'] || 0) > 0 || (stats['4b'] || 0) > 0;
      const hasMigrationStartedStatus = (stats['1b'] || 0) > 0 || (stats['1c'] || 0) > 0 || ((stats['2.x'] || 0) - (stats['2c'] || 0)) > 0;

      if (isDiv) displayCat = 'Live';
      else if (hasInQaStatus) displayCat = 'InQA';
      else if (hasMigrationStartedStatus) displayCat = 'MigrationStarted';
      else if (maxKey === '1a') displayCat = 'NotMigrated';
      else if (maxKey === 'Live') displayCat = 'Live';
      else displayCat = 'NotMigrated';

      // store per-site display category for later use
      siteDisplay[div][site] = displayCat;

      // Increment global and division counts
      statusSiteCounts[displayCat][isDiv ? 'divisional' : 'local'].add(siteKey);
      divisionMajorCounts[div][displayCat]++;
      // Track sites that have any pages in the '5' status (Total Live requirement)
      if (stats['5x'] && stats['5x'] > 0) {
        fiveSiteSets[isDiv ? 'divisional' : 'local'].add(siteKey);
        if (isDiv) fiveDivisions.add(div);
      }
    });
  });

  // Calculate totals
  const totalSites = Object.values(summary).reduce((sum, div) => sum + Object.keys(div).length, 0);
  // Compute division-level majority: assign each division to the category
  const divisionLevelCounts = { NotMigrated: new Set(), MigrationStarted: new Set(), InQA: new Set(), Live: new Set() };
  Object.keys(divisionMajorCounts).forEach(div => {
    const c = divisionMajorCounts[div];
    // determine max category across sites in this division
    const order = ['Live', 'InQA', 'MigrationStarted', 'NotMigrated'];
    let maxCat = 'NotMigrated';
    let maxVal = -1;
    Object.keys(c).forEach(k => {
      const v = c[k] || 0;
      if (v > maxVal) { maxVal = v; maxCat = k; }
      else if (v === maxVal && v > 0) {
        const prevIdx = order.indexOf(maxCat);
        const curIdx = order.indexOf(k);
        if (curIdx < prevIdx) { maxCat = k; }
      }
    });
    divisionLevelCounts[maxCat].add(div);
  });

  // Territory header D counts should reflect site-level counts for divisional sites
  const notMigD = statusSiteCounts['NotMigrated'].divisional.size;
  const notMigL = statusSiteCounts['NotMigrated'].local.size;
  const migratingD = statusSiteCounts['MigrationStarted'].divisional.size;
  const migratingL = statusSiteCounts['MigrationStarted'].local.size;
  const qaD = statusSiteCounts['InQA'].divisional.size;
  const qaL = statusSiteCounts['InQA'].local.size;
  const liveD = statusSiteCounts['Live'].divisional.size;
  const liveL = statusSiteCounts['Live'].local.size;
  // Sites with any pages in status 5.x (site-level totals)
  const fiveSitesD = fiveSiteSets.divisional.size;
  const fiveSitesL = fiveSiteSets.local.size;
  // Divisions that have at least one site with 5.x pages (division-level D count)
  const fiveDivCount = fiveDivisions.size;

  // Not Migrated is tracked independently from Migration Started.
  
  // Generate unique ID for this modal's chart
  const chartId = `territoryChart_${Math.random().toString(36).substr(2, 9)}`;
  
  // Start HTML at the All Territories Migration Status section (trim header/legend)
  let html = `<div class="territory-content" style="padding: 20px;">
      <style>
        .territory-content .sc-bottom-scroll {
          max-height: 320px;
          overflow: auto;
        }
        /* Site Category Audit Table: cap to ~70% of the viewport so the top and bottom
           edges of the scroll region are always visually obvious, however many sites
           there are. */
        .territory-content .sc-bottom-scroll.site-audit-scroll {
          max-height: 70vh;
        }
        /* Division Page Totals By Status: short, compact table (one row per division,
           now just a mini status bar instead of 10 numeric columns) — no need for its
           own internal scrollbar. */
        .territory-content .sc-bottom-scroll.division-totals-scroll {
          max-height: none;
          overflow: visible;
        }
        .territory-content .sc-report-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #f8f9fa;
        }
        .territory-content table tbody tr:nth-child(odd) td {
          background: #ffffff;
        }
        .territory-content table tbody tr:nth-child(even) td {
          background: #f7f9fc;
        }
      </style>

      <!-- Data caveat: site counts here are derived from this list's Site Title /
           Service Center grouping and don't always map 1:1 to real-world sites. -->
      <div class="alert alert-warning py-2 px-3 mb-3" style="font-size: 0.8rem;">
        <i class="bi bi-exclamation-triangle me-1"></i>
        Site counts here may not perfectly reflect reality: some sites were launched to their own
        site from a location or division site and aren't broken out separately, and some locations
        may have migrated directly to Zesty without prior Symphony coverage.
      </div>

      <!-- Chart -->
      <div style="margin-bottom: 20px;">
        <h5 style="margin-bottom: 8px; font-weight: 600;">Site Migration Status</h5>
        <div style="position: relative; height: 100px;">
          <canvas id="${chartId}" style="max-height: 100px; width: 100%;"></canvas>
        </div>
      </div>

      <!-- Summary Stats Card (condensed) -->
      <div style="background: #fff; margin-bottom: 12px;">
        <h5 style="margin-bottom: 8px; font-weight: 600;"><i class="bi bi-bar-chart"></i> Territory Summary</h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
          <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
            <h3 style="margin: 0 0 4px; color: #dc3545; font-weight: 700; font-size: 1.2rem;">${notMigD + notMigL}</h3>
            <p style="margin: 0 0 4px; color: #333; font-weight: 600;">Not Migrated</p>
            <small style="color: #666;">D: ${notMigD} | L: ${notMigL}</small>
          </div>
          <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
            <h3 style="margin: 0 0 4px; color: #ffc107; font-weight: 700; font-size: 1.2rem;">${migratingD + migratingL}</h3>
            <p style="margin: 0 0 4px; color: #333; font-weight: 600;">Migration Started</p>
            <small style="color: #666;">D: ${migratingD} | L: ${migratingL}</small>
          </div>
          <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
            <h3 style="margin: 0 0 4px; color: #17a2b8; font-weight: 700; font-size: 1.2rem;">${qaD + qaL}</h3>
            <p style="margin: 0 0 4px; color: #333; font-weight: 600;">In Zesty/QA</p>
            <small style="color: #666;">D: ${qaD} | L: ${qaL}</small>
          </div>
          <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
            <h3 style="margin: 0 0 4px; color: #28a745; font-weight: 700; font-size: 1.2rem;">${fiveSitesD + fiveSitesL}</h3>
            <p style="margin: 0 0 4px; color: #333; font-weight: 600;">Total Live</p>
            <small style="color: #666;">D: ${fiveDivCount} | L: ${fiveSitesL}</small>
          </div>
        </div>
      </div>

      <!-- Divisions -->
      <div style="margin-top: 4px;">
        <h5 style="margin: 0 0 8px; font-weight: 600;"><i class="bi bi-diagram-3"></i> Division Group Summary</h5>
        <div class="sc-division-table-wrap" style="border:1px solid #e0e0e0; border-radius:4px; overflow:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.84rem; min-width:760px; table-layout:fixed;">
            <thead>
              <tr style="background:#f8f9fa;">
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; width:220px;">Division</th>
                <th style="text-align:center; padding:8px; border-bottom:1px solid #e0e0e0; width:90px;">Status</th>
                <th style="text-align:center; padding:8px; border-bottom:1px solid #e0e0e0;"><i class="bi bi-x-circle text-danger"></i> Not Migrated</th>
                <th style="text-align:center; padding:8px; border-bottom:1px solid #e0e0e0;"><i class="bi bi-hourglass-split text-warning"></i> Migration Started</th>
                <th style="text-align:center; padding:8px; border-bottom:1px solid #e0e0e0;"><i class="bi bi-gear text-info"></i> In Zesty/QA</th>
                <th style="text-align:center; padding:8px; border-bottom:1px solid #e0e0e0;"><i class="bi bi-check-circle text-success"></i> Live</th>
              </tr>
            </thead>
            <tbody>`;

  const sortedDivs = Object.keys(summary).sort();
  if (sortedDivs.length === 0) {
    return `<div class="p-4 text-center text-muted">No data available for the current filters.</div>`;
  }

  sortedDivs.forEach(div => {
    const divStats = summary[div];
    const divStatus = 'Live';
    const badgeClass = 'bg-success';

    // Build per-category divisional/local breakdown for titles
    const perCat = {
      NotMigrated: { div: 0, local: 0 },
      MigrationStarted: { div: 0, local: 0 },
      InQA: { div: 0, local: 0 },
      Live: { div: 0, local: 0 }
    };

    Object.keys(divStats).forEach(site => {
      const st = divStats[site] || {};
      const isDiv = !!st.isDivisional;
      let cat = 'NotMigrated';

      // Requested rule priority:
      // 1) In Zesty/QA = any site with 2c, 3.x, or 4b pages
      // 2) Migration Started = any site with 1b, 1c, or 2-starting pages (2.x excluding 2c)
      // 3) Live = any site with any Live/5.x pages
      // 4) Not Migrated = fallback (1a/other)
      if (isDiv) cat = 'Live';
      else if ((st['2c'] || 0) > 0 || (st['3.x'] || 0) > 0 || (st['4b'] || 0) > 0) cat = 'InQA';
      else if ((st['1b'] || 0) > 0 || (st['1c'] || 0) > 0 || ((st['2.x'] || 0) - (st['2c'] || 0)) > 0) cat = 'MigrationStarted';
      else if ((st['Live'] || 0) > 0 || (st['5x'] || 0) > 0) cat = 'Live';
      else cat = 'NotMigrated';

      if (!perCat[cat]) perCat[cat] = { div: 0, local: 0 };
      if (isDiv) perCat[cat].div++;
      else perCat[cat].local++;
    });

    const nmOnlyTotal = (perCat.NotMigrated.div || 0) + (perCat.NotMigrated.local || 0);
    const msTotal = (perCat.MigrationStarted.div || 0) + (perCat.MigrationStarted.local || 0);
    const nmTotal = nmOnlyTotal;
    const iqTotal = (perCat.InQA.div || 0) + (perCat.InQA.local || 0);
    const liveTotal = (perCat.Live.div || 0) + (perCat.Live.local || 0);

    html += `<tr>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(div)}">${escapeHtml(div)}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0; text-align:center;"><span class="badge ${badgeClass}" style="font-size:0.72rem;">${divStatus}</span></td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0; text-align:center;" title="Not Migrated (Divisional: ${perCat.NotMigrated.div || 0}, Local: ${perCat.NotMigrated.local || 0})">${nmTotal}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0; text-align:center;" title="Migration Started (Divisional: ${perCat.MigrationStarted.div || 0}, Local: ${perCat.MigrationStarted.local || 0})">${msTotal}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0; text-align:center;" title="In Zesty/QA (Divisional: ${perCat.InQA.div || 0}, Local: ${perCat.InQA.local || 0})">${iqTotal}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0; text-align:center;" title="Live (Divisional: ${perCat.Live.div || 0}, Local: ${perCat.Live.local || 0})">${liveTotal}</td>
    </tr>`;
  });

  // Build detailed site-level audit rows and division page-total rows.
  const siteAuditRows = [];
  const divisionTotalsRows = [];

  sortedDivs.forEach(div => {
    const divStats = summary[div] || {};
    const totals = {
      sites: 0,
      divisionalSites: 0,
      localSites: 0,
      totalPages: 0,
      '1a': 0,
      '1b': 0,
      '1c': 0,
      '2.x': 0,
      '2c': 0,
      '3.x': 0,
      '4.x': 0,
      '4b': 0,
      'Live': 0,
      '5x': 0,
      'Redirect': 0,
      'DNM': 0
    };

    Object.keys(divStats).sort((a, b) => a.localeCompare(b)).forEach(site => {
      const st = divStats[site] || {};
      const livePages = st['Live'] || 0;
      const fivePages = st['5x'] || 0;
      const fourPages = Math.max(0, livePages - fivePages);
      const isDiv = !!st.isDivisional;
      const categories = [];

      // Allow multiple category membership so users can identify all applicable pulls.
      const hasNotLive = (st['1a'] || 0) > 0 || (st['1b'] || 0) > 0 || (st['1c'] || 0) > 0 || (st['2.x'] || 0) > 0 || (st['2c'] || 0) > 0;
      const hasMigrationStarted = (st['1b'] || 0) > 0 || (st['2.x'] || 0) > 0;
      const hasReady = (st['1c'] || 0) > 0;
      const hasInQa = (st['2c'] || 0) > 0 || (st['3.x'] || 0) > 0 || (st['4b'] || 0) > 0;
      const hasRedirectNoFive = (st['Redirect'] || 0) > 0 && fivePages === 0;
      // Keep Live pill aligned with the Live/5 column: require at least one status 5 page.
      const hasLive = fivePages > 0;
      const hasOnlyDnm = (st['DNM'] || 0) > 0 && (st.Total || 0) === (st['DNM'] || 0);

      if (hasNotLive || hasOnlyDnm || hasRedirectNoFive) categories.push('Not Migrated');
      if (hasMigrationStarted || hasRedirectNoFive) categories.push('Migration Started');
      if (hasReady) categories.push('Ready');
      if (hasInQa) categories.push('In Zesty/QA');
      if (hasLive) categories.push('Live');
      if (!categories.length) categories.push('Unclassified');

      siteAuditRows.push({
        division: div,
        siteTitle: site,
        type: isDiv ? 'D' : 'L',
        categories: categories,
        totalPages: st.Total || 0,
        '1a': st['1a'] || 0,
        '1b': st['1b'] || 0,
        '1c': st['1c'] || 0,
        '2.x': st['2.x'] || 0,
        '2c': st['2c'] || 0,
        '3.x': st['3.x'] || 0,
        '4.x': fourPages,
        '4b': st['4b'] || 0,
        'Live': livePages,
        '5x': st['5x'] || 0,
        'Redirect': st['Redirect'] || 0,
        'DNM': st['DNM'] || 0
      });

      totals.sites += 1;
      totals.divisionalSites += isDiv ? 1 : 0;
      totals.localSites += isDiv ? 0 : 1;
      totals.totalPages += st.Total || 0;
      totals['1a'] += st['1a'] || 0;
      totals['1b'] += st['1b'] || 0;
      totals['1c'] += st['1c'] || 0;
      totals['2.x'] += st['2.x'] || 0;
      totals['2c'] += st['2c'] || 0;
      totals['3.x'] += st['3.x'] || 0;
      totals['4.x'] += fourPages;
      totals['4b'] += st['4b'] || 0;
      totals['Live'] += st['Live'] || 0;
      totals['5x'] += st['5x'] || 0;
      totals['Redirect'] += st['Redirect'] || 0;
      totals['DNM'] += st['DNM'] || 0;
    });

    divisionTotalsRows.push({ division: div, totals: totals });
  });

  const categoryPillHtml = function(cat) {
    if (cat === 'Not Migrated') return '<span style="display:inline-block;padding:2px 6px;border-radius:999px;background:#f8d7da;color:#842029;font-size:0.72rem;margin:1px;">Not Migrated</span>';
    if (cat === 'Migration Started') return '<span style="display:inline-block;padding:2px 6px;border-radius:999px;background:#fff3cd;color:#664d03;font-size:0.72rem;margin:1px;">Migration Started</span>';
    if (cat === 'Ready') return '<span style="display:inline-block;padding:2px 6px;border-radius:999px;background:#e7f1ff;color:#0a3d91;font-size:0.72rem;margin:1px;">Ready</span>';
    if (cat === 'In Zesty/QA') return '<span style="display:inline-block;padding:2px 6px;border-radius:999px;background:#cff4fc;color:#055160;font-size:0.72rem;margin:1px;">In Zesty/QA</span>';
    if (cat === 'Live') return '<span style="display:inline-block;padding:2px 6px;border-radius:999px;background:#d1e7dd;color:#0f5132;font-size:0.72rem;margin:1px;">Live</span>';
    return '<span style="display:inline-block;padding:2px 6px;border-radius:999px;background:#e2e3e5;color:#41464b;font-size:0.72rem;margin:1px;">Unclassified</span>';
  };

  const siteRowsHtml = siteAuditRows.map(r => `
      <tr>
        <td style="width:90px; max-width:90px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(r.division)}">${escapeHtml(r.division)}</td>
        <td style="width:200px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(r.siteTitle)}">${escapeHtml(r.siteTitle)}</td>
        <td style="text-align:center;">${r.type}</td>
        <td>${r.categories.map(categoryPillHtml).join('')}</td>
        <td style="text-align:right;">${r.totalPages}</td>
        <td style="padding:6px 8px;">${buildStatusMiniBarHtml(r, r.totalPages)}</td>
      </tr>`).join('');

  const divisionRowsHtml = divisionTotalsRows.map(r => `
      <tr>
        <td style="width:130px; max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(r.division)}">${escapeHtml(r.division)}</td>
        <td style="text-align:right;">${r.totals.sites}</td>
        <td style="text-align:right;">${r.totals.divisionalSites}</td>
        <td style="text-align:right;">${r.totals.localSites}</td>
        <td style="text-align:right;">${r.totals.totalPages}</td>
        <td style="padding:6px 8px;">${buildStatusMiniBarHtml(r.totals, r.totals.totalPages)}</td>
      </tr>`).join('');

  const siteGrandTotals = siteAuditRows.reduce((acc, r) => {
    acc.totalPages += r.totalPages || 0;
    acc['1a'] += r['1a'] || 0;
    acc['1b'] += r['1b'] || 0;
    acc['1c'] += r['1c'] || 0;
    acc['2.x'] += r['2.x'] || 0;
    acc['2c'] += r['2c'] || 0;
    acc['3.x'] += r['3.x'] || 0;
    acc['4.x/4b'] += (r['4.x'] || 0) + (r['4b'] || 0);
    acc['Live/5'] += r['5x'] || 0;
    acc['R'] += r['Redirect'] || 0;
    acc['DNM'] += r['DNM'] || 0;
    if (r.type === 'D') acc.divisionalSites += 1;
    else acc.localSites += 1;
    return acc;
  }, {
    totalPages: 0,
    '1a': 0,
    '1b': 0,
    '1c': 0,
    '2.x': 0,
    '2c': 0,
    '3.x': 0,
    '4.x/4b': 0,
    'Live/5': 0,
    'R': 0,
    'DNM': 0,
    divisionalSites: 0,
    localSites: 0
  });

  const categoryPullTotals = siteAuditRows.reduce((acc, r) => {
    (r.categories || []).forEach((cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {
    'Not Migrated': 0,
    'Migration Started': 0,
    'Ready': 0,
    'In Zesty/QA': 0,
    'Live': 0,
    'Unclassified': 0
  });

  const categoryPullTotalsHtml = ['Not Migrated', 'Migration Started', 'Ready', 'In Zesty/QA', 'Live', 'Unclassified']
    .filter(cat => (categoryPullTotals[cat] || 0) > 0)
    .map(cat => `${categoryPillHtml(cat).replace('</span>', `: ${categoryPullTotals[cat]}</span>`)}`)
    .join('');

  const siteTotalsBarStats = {
    '1a': siteGrandTotals['1a'], '1b': siteGrandTotals['1b'], '1c': siteGrandTotals['1c'],
    '2.x': siteGrandTotals['2.x'], '2c': siteGrandTotals['2c'], '3.x': siteGrandTotals['3.x'],
    'Live': siteGrandTotals['Live/5'], '5x': siteGrandTotals['Live/5'],
    'Redirect': siteGrandTotals['R'], 'DNM': siteGrandTotals['DNM']
  };
  const siteTotalsRowHtml = `
      <tr style="background:#f8f9fa; font-weight:600;">
        <td style="padding:8px; border-top:2px solid #d0d7de;">Sum</td>
        <td style="padding:8px; border-top:2px solid #d0d7de;">All Sites (${siteAuditRows.length})</td>
        <td style="text-align:center; padding:8px; border-top:2px solid #d0d7de;">D:${siteGrandTotals.divisionalSites} L:${siteGrandTotals.localSites}</td>
        <td style="padding:8px; border-top:2px solid #d0d7de;">${categoryPullTotalsHtml || '<span style="color:#6c757d;">-</span>'}</td>
        <td style="text-align:right; padding:8px; border-top:2px solid #d0d7de;">${siteGrandTotals.totalPages}</td>
        <td style="padding:6px 8px; border-top:2px solid #d0d7de;">${buildStatusMiniBarHtml(siteTotalsBarStats, siteGrandTotals.totalPages)}</td>
      </tr>`;

  const divisionGrandTotals = divisionTotalsRows.reduce((acc, r) => {
    const t = r.totals || {};
    acc.sites += t.sites || 0;
    acc.divisionalSites += t.divisionalSites || 0;
    acc.localSites += t.localSites || 0;
    acc.totalPages += t.totalPages || 0;
    acc['1a'] += t['1a'] || 0;
    acc['1b'] += t['1b'] || 0;
    acc['1c'] += t['1c'] || 0;
    acc['2.x'] += t['2.x'] || 0;
    acc['2c'] += t['2c'] || 0;
    acc['3.x'] += t['3.x'] || 0;
    acc['4.x/4b'] += (t['4.x'] || 0) + (t['4b'] || 0);
    acc['Live/5'] += t['5x'] || 0;
    acc['R'] += t['Redirect'] || 0;
    acc['DNM'] += t['DNM'] || 0;
    return acc;
  }, {
    sites: 0,
    divisionalSites: 0,
    localSites: 0,
    totalPages: 0,
    '1a': 0,
    '1b': 0,
    '1c': 0,
    '2.x': 0,
    '2c': 0,
    '3.x': 0,
    '4.x/4b': 0,
    'Live/5': 0,
    'R': 0,
    'DNM': 0
  });

  const divisionTotalsBarStats = {
    '1a': divisionGrandTotals['1a'], '1b': divisionGrandTotals['1b'], '1c': divisionGrandTotals['1c'],
    '2.x': divisionGrandTotals['2.x'], '2c': divisionGrandTotals['2c'], '3.x': divisionGrandTotals['3.x'],
    'Live': divisionGrandTotals['Live/5'], '5x': divisionGrandTotals['Live/5'],
    'Redirect': divisionGrandTotals['R'], 'DNM': divisionGrandTotals['DNM']
  };
  const divisionTotalsRowHtml = `
      <tr style="background:#f8f9fa; font-weight:600;">
        <td style="padding:8px; border-top:2px solid #d0d7de;">Sum</td>
        <td style="text-align:right; padding:8px; border-top:2px solid #d0d7de;">${divisionGrandTotals.sites}</td>
        <td style="text-align:right; padding:8px; border-top:2px solid #d0d7de;">${divisionGrandTotals.divisionalSites}</td>
        <td style="text-align:right; padding:8px; border-top:2px solid #d0d7de;">${divisionGrandTotals.localSites}</td>
        <td style="text-align:right; padding:8px; border-top:2px solid #d0d7de;">${divisionGrandTotals.totalPages}</td>
        <td style="padding:6px 8px; border-top:2px solid #d0d7de;">${buildStatusMiniBarHtml(divisionTotalsBarStats, divisionGrandTotals.totalPages)}</td>
      </tr>`;

  html += `
        </tbody>
      </table>
    </div>

      <div style="margin-top: 16px; border-top: 1px solid #e9ecef; padding-top: 12px;">
        <h5 style="margin: 0 0 8px; font-weight: 600;"><i class="bi bi-table"></i> Site Category Audit Table</h5>
        <small style="color:#666; display:block; margin-bottom:8px;">Each site can appear in one or multiple categories based on page statuses.</small>
        <div class="sc-table-wrap" style="border:1px solid #e0e0e0; border-radius:4px; overflow:hidden;">
          <div class="sc-top-scroll" style="overflow-x:auto; overflow-y:hidden; height:14px; border-bottom:1px solid #e0e0e0; background:#fafbfc;">
            <div class="sc-top-scroll-inner" style="height:1px;"></div>
          </div>
          <div class="sc-bottom-scroll site-audit-scroll" style="overflow:auto;">
          <table class="sc-report-table" style="width:100%; border-collapse:collapse; font-size:0.82rem; min-width:780px; table-layout:fixed;">
            <thead>
              <tr>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; width:90px; max-width:90px;">Division</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; width:200px; max-width:200px;">Site Title</th>
                <th style="text-align:center; padding:8px; border-bottom:1px solid #e0e0e0; width:40px;">D/L</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; width:220px; min-width:220px;">Category Pull(s)</th>
                <th style="text-align:right; padding:8px; border-bottom:1px solid #e0e0e0; width:60px;">Pages</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; min-width:160px;" title="Hover any bar for the exact status breakdown">Status Breakdown</th>
              </tr>
            </thead>
            <tbody>${siteRowsHtml}</tbody>
            <tfoot>${siteTotalsRowHtml}</tfoot>
          </table>
          </div>
        </div>
      </div>

      <div style="margin-top: 16px; border-top: 1px solid #e9ecef; padding-top: 12px;">
        <h5 style="margin: 0 0 8px; font-weight: 600;"><i class="bi bi-collection"></i> Division Page Totals By Status</h5>
        <div class="sc-table-wrap" style="border:1px solid #e0e0e0; border-radius:4px; overflow:hidden;">
          <div class="sc-top-scroll" style="overflow-x:auto; overflow-y:hidden; height:14px; border-bottom:1px solid #e0e0e0; background:#fafbfc;">
            <div class="sc-top-scroll-inner" style="height:1px;"></div>
          </div>
          <div class="sc-bottom-scroll division-totals-scroll" style="overflow:auto;">
          <table class="sc-report-table" style="width:100%; border-collapse:collapse; font-size:0.82rem; min-width:680px; table-layout:fixed;">
            <thead>
              <tr>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; width:130px; max-width:130px;">Division</th>
                <th style="text-align:right; padding:8px; border-bottom:1px solid #e0e0e0; width:55px;">Sites</th>
                <th style="text-align:right; padding:8px; border-bottom:1px solid #e0e0e0; width:65px;">Div Sites</th>
                <th style="text-align:right; padding:8px; border-bottom:1px solid #e0e0e0; width:75px;">Local Sites</th>
                <th style="text-align:right; padding:8px; border-bottom:1px solid #e0e0e0; width:60px;">Pages</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e0e0e0; min-width:220px;" title="Hover any bar for the exact status breakdown">Status Breakdown</th>
              </tr>
            </thead>
            <tbody>${divisionRowsHtml}</tbody>
            <tfoot>${divisionTotalsRowHtml}</tfoot>
          </table>
          </div>
        </div>
      </div>`;
  
  html += `</div></div></div>`;
  
  // Store territory chart data globally for rendering later (show site distribution)
  const siteChartData = [
    notMigD + notMigL,
    migratingD + migratingL,
    qaD + qaL,
    liveD + liveL
  ];
  
  window.territoryChartData = {
    chartId: chartId,
    labels: ['Not Migrated', 'Migration Started', 'In QA', 'Live'],
    data: siteChartData
  };
  
  return html;
}

// Add a synchronized top horizontal scrollbar for long report tables.
function initTopTableScrollbars(rootEl) {
  const root = rootEl || document;
  const wraps = root.querySelectorAll('.sc-table-wrap');
  wraps.forEach(wrap => {
    const top = wrap.querySelector('.sc-top-scroll');
    const topInner = wrap.querySelector('.sc-top-scroll-inner');
    const bottom = wrap.querySelector('.sc-bottom-scroll');
    const table = bottom ? bottom.querySelector('table') : null;
    if (!top || !topInner || !bottom || !table) return;

    const refreshWidth = () => {
      try {
        topInner.style.width = `${table.scrollWidth}px`;
      } catch (e) { /* no-op */ }
    };

    refreshWidth();

    let syncing = false;
    top.onscroll = () => {
      if (syncing) return;
      syncing = true;
      bottom.scrollLeft = top.scrollLeft;
      syncing = false;
    };
    bottom.onscroll = () => {
      if (syncing) return;
      syncing = true;
      top.scrollLeft = bottom.scrollLeft;
      syncing = false;
    };

    if (typeof ResizeObserver !== 'undefined') {
      try {
        const ro = new ResizeObserver(refreshWidth);
        ro.observe(table);
      } catch (e) { /* no-op */ }
    }
  });
}

function renderCards(){
  const filtered = getFilteredData();
  const dedupeRows = (rows) => {
    const seen = new Set();
    return (rows || []).filter((row) => {
      const key = row && (row.ID ?? row._id ?? `${row.Title || ''}|${row['Site Title'] || ''}|${row['Page URL'] || ''}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const allRows = dedupeRows(Array.isArray(tableData) ? tableData : []);
  const filteredTotal = filtered.length;
  const allTotal = allRows.length || filteredTotal;
  const hasActiveFilters = (() => {
    const filterIds = [
      'filterDivision',
      'filterAC',
      'filterStatus',
      'filterPageType',
      'filterPubSym',
      'filterSymType',
      'filterPriority',
      'filterRevamp',
      'filterSiteTitle',
      'filterZestyUrl'
    ];
    const dropdownActive = filterIds.some((id) => {
      const el = document.getElementById(id);
      return !!(el && String(el.value || '').trim());
    });
    const modifiedFrom = document.getElementById('filterModifiedFrom');
    const modifiedTo = document.getElementById('filterModifiedTo');
    const dateActive = !!((modifiedFrom && modifiedFrom.value) || (modifiedTo && modifiedTo.value));
    return dropdownActive || dateActive;
  })();

  const toPct = (count, total) => total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  const compareText = (count, total) => `${count} of ${total} (${toPct(count, total)}%)`;
  const statusValue = (d) => (d.Status || '').toString().trim();
  const isCompletedRow = (d) => statusValue(d).startsWith('4') || statusValue(d).startsWith('5') || statusValue(d) === 'THQ Redirect';
  const completedCount = (rows) => rows.filter(isCompletedRow).length;
  // Of the completed pages: those actually rebuilt in Zesty vs those only redirected.
  const migratedCount = (rows) => rows.filter(d => isCompletedRow(d) && isFullyMigratedPage(d)).length;
  const redirectedOnlyCount = (rows) => rows.filter(d => isCompletedRow(d) && !isFullyMigratedPage(d)).length;
  const doNotMigrateCount = (rows) => rows.filter(d => statusValue(d) === 'Do Not Migrate').length;
  const migrationProgressCount = (rows) => completedCount(rows) + doNotMigrateCount(rows);
  const qaSummary = (rows) => {
    let qaHigh = 0;
    let qaLow = 0;
    let revampCount = 0;
    let notPublishedCount = 0;
    let redirectFlagCount = 0;

    rows.forEach(d => {
      const hasQa = d["QA Issues.lookupValue"] && String(d["QA Issues.lookupValue"]).trim();
      if (hasQa) {
        if (d.Priority === 'High') qaHigh++; else qaLow++;
      }
      if (isRevampPage(d)) {
        revampCount++;
      }

      const revampPublish = (d['Revamp Publish Y/N'] || '').toString().trim().toLowerCase();
      if (revampPublish === 'no') notPublishedCount++;

      if (getRedirectCheckStatus(d).flagged) redirectFlagCount++;
    });

    return {
      qaHigh,
      qaLow,
      revampCount,
      notPublishedCount,
      redirectFlagCount,
      pageCount: qaHigh + qaLow
    };
  };

  const filteredProgress = migrationProgressCount(filtered);
  const allProgress = migrationProgressCount(allRows);
  const filteredMigrated = migratedCount(filtered);
  const allMigrated = migratedCount(allRows);
  const filteredRedirectedOnly = redirectedOnlyCount(filtered);
  const allRedirectedOnly = redirectedOnlyCount(allRows);
  const filteredDoNotMigrate = doNotMigrateCount(filtered);
  const allDoNotMigrate = doNotMigrateCount(allRows);
  const filteredQa = qaSummary(filtered);
  const allQa = qaSummary(allRows);

  const siteMigrationProgress = (rows) => {
    const sites = {};
    rows.forEach(d => {
      const site = getSiteGroupTitle(d);
      if (!sites[site]) sites[site] = { total: 0, finished: 0 };
      sites[site].total++;
      const s = statusValue(d);
      
      // A site is not completed if any page is still in 1b/1c or other non-end statuses.
      // End statuses are strictly limited to 4.x, 5.x, Redirect, and Do Not Migrate.
      if (s.startsWith('4') || s.startsWith('5') || s === 'THQ Redirect' || s === 'Do Not Migrate') {
        sites[site].finished++;
      }
    });
    const siteList = Object.values(sites);
    const total = siteList.length;
    const completed = siteList.filter(s => s.finished === s.total).length;
    return { completed, total };
  };

  const filteredSiteStats = siteMigrationProgress(filtered);
  const allSiteStats = siteMigrationProgress(allRows);

  // Site Status Summary for management report trigger
  const siteStatusSummary = (() => {
    const summary = {}; // { Division: { SiteTitle: { Completed: 0, InProgress: 0, InQA: 0, NeedsInfo: 0, Total: 0 } } }
    filtered.forEach(d => {
      const div = (d.Division || 'Other').toString().trim();
      const site = getSiteGroupTitle(d);

      if (!summary[div]) summary[div] = {};
      if (!summary[div][site]) summary[div][site] = { Completed: 0, InProgress: 0, InQA: 0, NeedsInfo: 0, Total: 0 };
      
      summary[div][site].Total++;
      const s = statusValue(d);
      if (s.startsWith('4') || s.startsWith('5') || s === 'THQ Redirect' || s === 'Do Not Migrate') summary[div][site].Completed++;
      else if (s.startsWith('2')) summary[div][site].InProgress++;
      else if (s.startsWith('3')) summary[div][site].InQA++;
      else summary[div][site].NeedsInfo++;
    });
    return summary;
  })();

  updateFooterStats();

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth()-1, today.getDate());
  renderOverallProgress(filtered);


  // --- Extra data for the visual metric cards (replacing the unused 3a/3b/3c cards) ---
  const sitePct = filteredSiteStats.total > 0 ? (filteredSiteStats.completed / filteredSiteStats.total) * 100 : 0;
  const pagePct = filteredTotal > 0 ? (filteredProgress / filteredTotal) * 100 : 0;
  const migratedPct = filteredTotal > 0 ? (filteredMigrated / filteredTotal) * 100 : 0;
  const redirectedPct = filteredTotal > 0 ? (filteredRedirectedOnly / filteredTotal) * 100 : 0;
  const dnmPct = filteredTotal > 0 ? (filteredDoNotMigrate / filteredTotal) * 100 : 0;

  // Work queue for the teammate who sets migration fields / does the pre-migration review.
  const needsFieldsCount = filtered.filter(d => statusValue(d).startsWith('1a')).length;

  const qaTotal = filteredQa.pageCount + filteredQa.revampCount + filteredQa.notPublishedCount + filteredQa.redirectFlagCount;

  // --- metrics object ---
  // Every card follows the same shape: a big bold hero number/word, a one-line detail
  // under it, and either a thin progress bar (percentage cards) or an icon chip (count
  // cards) — so cards read consistently and none of them are "just text."
  const metrics = {
    "Site Migration Progress": {
      hero: `${toPct(filteredSiteStats.completed, filteredSiteStats.total)}%`,
      detail: `${filteredSiteStats.completed} of ${filteredSiteStats.total} sites`,
      compareSub: `All sites: ${allSiteStats.completed} of ${allSiteStats.total} (${toPct(allSiteStats.completed, allSiteStats.total)}%)`,
      bar: { pct: sitePct, color: '#ffffff' }
    },
    "Page Migration Progress": {
      hero: `${toPct(filteredProgress, filteredTotal)}%`,
      detail: `${filteredProgress} of ${filteredTotal} pages`,
      compareSub: `Filtered share of all pages: ${compareText(filteredProgress, allTotal)}`,
      bar: { pct: pagePct, color: '#ffffff' }
    },
    "Migrated Pages": {
      hero: `${filteredMigrated}`,
      detail: `Rebuilt in Zesty — ${toPct(filteredMigrated, filteredTotal)}% of ${filteredTotal} pages`,
      compareSub: `All pages: ${compareText(allMigrated, allTotal)}`,
      bar: { pct: migratedPct, color: '#6ee7a8' },
      alwaysShowSub: false
    },
    "Redirected Pages": {
      hero: `${filteredRedirectedOnly}`,
      detail: `Redirect only, no Zesty page — ${toPct(filteredRedirectedOnly, filteredTotal)}% of ${filteredTotal}`,
      compareSub: `All pages: ${compareText(allRedirectedOnly, allTotal)}`,
      bar: { pct: redirectedPct, color: '#9be3ee' }
    },
    "Do Not Migrate": {
      hero: `${filteredDoNotMigrate}`,
      detail: `${toPct(filteredDoNotMigrate, filteredTotal)}% of ${filteredTotal} pages`,
      compareSub: `All pages: ${compareText(allDoNotMigrate, allTotal)}`,
      bar: { pct: dnmPct, color: '#ff8a80' }
    },
    "QA Issues": {
      hero: `${qaTotal}`,
      // Icons rather than a long text line — the text wrapped to two lines and pushed
      // this card's bar out of alignment with the others. Hover any icon for the label.
      detail: '',
      iconRow: [
        { icon: 'bi-clipboard2-pulse', count: filteredQa.pageCount, label: 'Pages with QA issues', color: '#8a6a1c' },
        { icon: 'bi-arrow-repeat', count: filteredQa.revampCount, label: 'Pages needing revamp', color: '#b8912b' },
        { icon: 'bi-eye-slash', count: filteredQa.notPublishedCount, label: 'Revamped but not published', color: '#d4af37' },
        { icon: 'bi-signpost-split', count: filteredQa.redirectFlagCount, label: 'Redirect checks flagged', color: '#eed58a' }
      ],
      // Shades of gold rather than four unrelated hues — the segments read as one
      // measure split into parts instead of four competing categories.
      segmentBar: [
        { n: filteredQa.pageCount, color: '#8a6a1c', label: 'QA Issues' },
        { n: filteredQa.revampCount, color: '#b8912b', label: 'Revamp' },
        { n: filteredQa.notPublishedCount, color: '#d4af37', label: 'Not Published' },
        { n: filteredQa.redirectFlagCount, color: '#eed58a', label: 'Redirects' }
      ]
    },
    "Redirect Verification": {
      hero: filteredQa.redirectFlagCount ? `${filteredQa.redirectFlagCount}` : '0',
      detail: filteredQa.redirectFlagCount ? 'Pages flagged by the automated check' : 'All redirects verified',
      icon: filteredQa.redirectFlagCount ? 'bi-signpost-split' : 'bi-check-circle',
      iconVariant: filteredQa.redirectFlagCount ? 'danger' : 'success'
    },
    "Needs Migration Fields": {
      hero: `${needsFieldsCount}`,
      detail: 'Pages still needing fields set before review (1a)',
      icon: 'bi-pencil-square',
      iconVariant: 'warning'
    }
  };

  // Charts are rendered once, via the top-level renderCharts(getFilteredData())
  // call in updateDashboard() — see the full 6-chart implementation later in this file.
  // (A duplicate 4-chart copy used to be nested here and ran on every refresh
  // alongside the real one; it was removed as dead weight.)

// Cards rendering
// Old Colors '#f1c40f','#2ecc71','#e74c3c','#f39c12','#3498db','#9b59b6','#16a085','#d35400','#ff6b6b', '#f7b32b', '#4ecdc4'
  // ['#132230', '#1a3245', '#22445a', '#2b5770', '#33688a', '#3c7aa0', '#448cba', '#4d9ecf', '#55b0e5', '#5dc3f5', '#66d6ff'];
//['#0b1622', '#0f1b2d', '#132230', '#18293a', '#1d3145', '#223950', '#27415b', '#2c4966', '#315171', '#365a7c', '#3b637f'];
  // Capped at #2258a1 (not the brighter blues that used to go up to #2f80f5) — the
  // brighter shades pushed white text below WCAG AA contrast (as low as 2.9:1 for the
  // detail line). Every shade here keeps white text at 5.6:1 or better.
  const colors = [
  '#132230',
  '#16304d',
  '#1a3d69',
  '#1e4a85',
  '#2258a1',
  '#16304d',
  '#1a3d69',
  '#1e4a85'
];






  const container = document.getElementById("metricCards");
  container.innerHTML = "";
  let i=0;

  // Render metrics. Every card follows the same layout — icon chip OR nothing up top,
  // a big bold hero number, a one-line detail, then a thin progress bar (percentage
  // cards) or wider segment bar (QA Issues) — fixed card height keeps them all matching.
  for(const key in metrics){
    const metric = metrics[key] || {};
    const isSiteCard = key === "Site Migration Progress";

    const iconChipHtml = metric.icon
      ? `<div class="metric-icon-chip variant-${metric.iconVariant || 'info'}"><i class="bi ${metric.icon}"></i></div>`
      : '';

    const barHtml = metric.bar
      ? `<div class="metric-bar-track"><div class="metric-bar-fill" style="width:${Math.max(0, Math.min(100, metric.bar.pct || 0)).toFixed(1)}%; background:${metric.bar.color};"></div></div>`
      : '';

    const segmentBarHtml = metric.segmentBar
      ? `<div class="metric-segment-bar">${buildSegmentBarHtml(metric.segmentBar)}</div>`
      : '';

    // Compact icon+count row (used where a text breakdown would wrap and throw the
    // card's bar out of alignment) — hover any icon for its label.
    const iconRowHtml = metric.iconRow
      ? `<div class="metric-count-row">${metric.iconRow.map(ic => `
          <span class="metric-count-chip" data-rich-tooltip="${escapeHtml(buildRichTooltipTextHtml(`${ic.label}: ${ic.count}`))}">
            <i class="bi ${ic.icon}" style="color:${ic.color};"></i><span class="metric-count-value">${ic.count}</span>
          </span>`).join('')}</div>`
      : '';

    const compareSubHtml = (hasActiveFilters && metric.compareSub)
      ? `<p class="metric-compare-sub mb-0">${metric.compareSub}</p>`
      : '';

    container.innerHTML += `
      <div class="col-lg-3 col-md-6 col-sm-12 mb-1">
        <div class="card text-white site-metric-card"
             style="background-color:${colors[i++ % colors.length]}">
          <div class="card-body d-flex flex-column align-items-center justify-content-center h-100">
            <h5 class="card-title d-flex align-items-center justify-content-center gap-1 mb-1" style="line-height:1.2;">
              <span>${key}</span>
              ${isSiteCard ? '<span style="color:rgba(19,35,63,0.78); font-size:0.68rem; font-weight:700; font-family:Arial,sans-serif; line-height:1; display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; flex:0 0 16px; background:rgba(19,35,63,0.1); border:1px solid rgba(19,35,63,0.24); border-radius:50%;" title="See the full breakdown in the Site Migration Status section below">i</span>' : ''}
            </h5>
            ${iconChipHtml}
            <div class="metric-hero">${metric.hero}</div>
            ${metric.detail ? `<p class="metric-detail mb-0">${metric.detail}</p>` : ''}
            ${iconRowHtml}
            ${barHtml}
            ${segmentBarHtml}
            ${compareSubHtml}
          </div>
        </div>
      </div>`;
  }

  renderOverallProgress(getFilteredData());


  renderBreakdown(filtered);
  renderQaAccordion(filtered);
  renderServiceCenterAccordion(filtered);
  renderSiteManagementSection();
  try { renderTitleCloud(filtered); } catch(e){ console.warn('renderTitleCloud failed', e); }
}

// Site Migration Status: used to be a modal opened by clicking the "Site Migration
// Progress" metric card; now rendered inline on the main page (like the other
// accordions) so it doesn't require a click to discover.
function renderSiteManagementSection(){
  const body = document.getElementById('siteManagementBody');
  if (!body) return;
  body.innerHTML = generateSiteSummaryTable();
  initTopTableScrollbars(body);

  // Render the territory chart after content is injected
  setTimeout(() => {
    if (window.territoryChartData && typeof Chart !== 'undefined') {
      const canvas = document.getElementById(window.territoryChartData.chartId);
      if (canvas) {
        try {
          const ctx = canvas.getContext('2d');
          // Render as a single horizontal stacked bar to save vertical space
          const labels = window.territoryChartData.labels;
          const counts = window.territoryChartData.data;
          const colors = ['#dc3545', '#ffc107', '#17a2b8', '#28a745'];
          const datasets = labels.map((lbl, i) => ({
            label: lbl,
            data: [counts[i] || 0],
            backgroundColor: colors[i] || '#ccc',
            borderColor: '#fff',
            borderWidth: 1,
            stack: 'a'
          }));

          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: [''],
              datasets: datasets
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: { right: 30 }
              },
              plugins: {
                legend: {
                  position: 'right',
                  align: 'start',
                  labels: { boxWidth: 10, padding: 8, font: { size: 11 } }
                },
                tooltip: { callbacks: { label: function(context){ return context.dataset.label + ': ' + (context.parsed.x || context.parsed); } } }
              },
              scales: {
                x: { stacked: true, ticks: { beginAtZero: true }, grace: '10%' },
                y: { stacked: true }
              }
            }
          });
        } catch (e) {
          console.error('Error rendering territory chart:', e);
        }
      }
    }
  }, 50);
}



function renderBreakdown(data){
  const container = document.getElementById("progressBreakdownBody");
  if (!container) return;
  
  // Create button container with proper structure
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'mb-3 d-flex gap-2 flex-wrap';
  buttonDiv.innerHTML = "<button id='toggleHiddenGroups' class='btn btn-sm btn-secondary'>Show 0% Groups</button><button id='toggleFullGroups' class='btn btn-sm btn-secondary'>Show 100% Groups</button><button id='toggleStatus' class='btn btn-sm btn-secondary'>Show Status</button><button id='toggleProgressBars' class='btn btn-sm btn-secondary'>Hide Progress Bars</button><button id='showOnlyPendingBtn' class='btn btn-sm btn-secondary'>Show only Pending Migration</button><button id='showOnlyRFMTBtn' class='btn btn-sm btn-secondary'>Show only Ready</button>";
  
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
      } else if (/^1c/.test(String(status))) {
        statusCategory = 'Ready for Migration Tool';
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
    // Compute total, visible, and hidden counts so badge clearly indicates what's shown
    let totalCount = 0;
    let visibleCount = 0;

    const entryWouldBeVisible = (grp, siteTotal, prog, hiddenClass) => {
      // Determine whether this entry would be hidden by the current toggles
      const wouldBeHiddenByProgress = (hiddenClass === 'hidden-group' && !showHidden) || (show100Only && (hiddenClass === 'non-100-group' || hiddenClass === 'hidden-group'));
      // honor show-only filters (Pending / RFMT)
      if (showOnlyPending && !((grp.statusBreakdown && (grp.statusBreakdown['Pending Migration'] || 0) > 0))) return false;
      if (showOnlyRFMT && !((grp.statusBreakdown && (grp.statusBreakdown['Ready for Migration Tool'] || 0) > 0))) return false;
      return !wouldBeHiddenByProgress;
    };

    // For Location groups with multiple sites, count each site separately
    if (g.field === 'Local Web Admin Group.title') {
      entries.forEach(({ rawKey }) => {
        const grp = grouped[rawKey];
        const siteCount = grp.siteTitles ? grp.siteTitles.size : 0;
        if (siteCount > 1) {
          Array.from(grp.siteTitles).forEach(siteTitle => {
            totalCount++;
            // compute site-specific breakdown to determine visibility
            const siteData = data.filter(d => {
              const rawLocal = (d['Local Web Admin Group.title'] || '').toString().trim();
              const siteKey = rawLocal || 'Not Set';
              const siteTitleItem = (d['Site Title'] || d['SiteTitle'] || '').toString().trim();
              return siteKey === rawKey && siteTitleItem === siteTitle;
            });
            const siteTotal = siteData.length;
            let siteDone = 0; let siteDonot = 0; const siteStatusBreakdown = {};
            siteData.forEach(d => {
              const status = d.Status || '';
              let statusCategory = 'Unknown';
              if (/^4|^5/.test(String(status).charAt(0))) { statusCategory = 'Completed'; siteDone++; }
              else if (status === 'THQ Redirect') { statusCategory = 'THQ Redirect'; siteDone++; }
              else if (status === 'Do Not Migrate') { statusCategory = 'Do Not Migrate'; siteDonot++; }
              else if (/^2/.test(String(status).charAt(0))) { statusCategory = 'In Progress'; }
              else if (/^1c/.test(String(status))) { statusCategory = 'Ready for Migration Tool'; }
              else if (/^1b/.test(String(status))) { statusCategory = 'Pending Migration'; }
              else if (/^1/.test(String(status).charAt(0))) { statusCategory = 'Needs Info'; }
              else if (/^3/.test(String(status).charAt(0))) { statusCategory = 'In QA'; }
              siteStatusBreakdown[statusCategory] = (siteStatusBreakdown[statusCategory] || 0) + 1;
            });
            const siteProg = siteTotal ? Math.round((siteDone + siteDonot) / siteTotal * 100) : 0;
            let hiddenClass = '';
            if (siteProg === 0) hiddenClass = 'hidden-group';
            else if (siteProg !== 100) hiddenClass = 'non-100-group';
            else if (siteProg === 100) hiddenClass = 'is-100-group';

            // Build a fake grp.statusBreakdown for show-only checks
            const fakeGrp = { statusBreakdown: siteStatusBreakdown };
            if (entryWouldBeVisible(fakeGrp, siteTotal, siteProg, hiddenClass)) visibleCount++;
          });
        } else {
          totalCount++;
          const total = grp.total;
          const prog = total ? Math.round((grp.done + grp.donot) / total * 100) : 0;
          let hiddenClass = '';
          if (prog === 0) hiddenClass = 'hidden-group';
          else if (prog !== 100) hiddenClass = 'non-100-group';
          else if (prog === 100) hiddenClass = 'is-100-group';
          if (g.field === 'Area Command Admin Group.title' && siteCount === 1 && prog === 0) hiddenClass = 'hidden-group';
          if (entryWouldBeVisible(grp, total, prog, hiddenClass)) visibleCount++;
        }
      });
    } else {
      // Non-location groups: each entry represents one group
      entries.forEach(({ rawKey }) => {
        const grp = grouped[rawKey];
        totalCount++;
        const total = grp.total;
        const prog = total ? Math.round((grp.done + grp.donot) / total * 100) : 0;
        let hiddenClass = '';
        if (prog === 0) hiddenClass = 'hidden-group';
        else if (prog !== 100) hiddenClass = 'non-100-group';
        else if (prog === 100) hiddenClass = 'is-100-group';
        if (entryWouldBeVisible(grp, total, prog, hiddenClass)) visibleCount++;
      });
    }

    const hiddenCount = totalCount - visibleCount;
    const groupCountDisplay = `${visibleCount} shown · ${hiddenCount} hidden · ${totalCount} total`;

    // --- Start section HTML with badge ---
    let sectionHtml = `
      <div class="breakdown-section">
        <h3 class="mt-3 d-flex align-items-center gap-2">
          ${g.name} <span class="badge bg-dark text-light">${groupCountDisplay}</span>
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
      // Apply show-only filters: if enabled, skip groups without the target status
      if (showOnlyPending && !((grp.statusBreakdown && (grp.statusBreakdown['Pending Migration'] || 0) > 0))) return;
      if (showOnlyRFMT && !((grp.statusBreakdown && (grp.statusBreakdown['Ready for Migration Tool'] || 0) > 0))) return;
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
            } else if (/^1c/.test(String(status))) {
              statusCategory = 'Ready for Migration Tool';
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
            const statusOrder = ['Do Not Migrate', 'Needs Info', 'Pending Migration', 'Ready for Migration Tool', 'In Progress', 'In QA', 'THQ Redirect', 'Unknown', 'Completed'];
            statusOrder.forEach(status => {
              const count = siteStatusBreakdown[status] || 0;
              if (count > 0) {
                const pct = Math.round(count / siteTotal * 100);
                const color = statusColors[status] || '#6c757d';
                const disp = statusDisplay[status] || status;
                progressHtml += `<div class="progress-bar" style="width:${pct}%; background-color:${color}; border-right:1px solid white;" title="${disp}: ${count}"></div>`;
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
          const statusOrder = ['Do Not Migrate', 'Needs Info', 'Pending Migration', 'Ready for Migration Tool', 'In Progress', 'In QA', 'THQ Redirect', 'Unknown', 'Completed'];
          const breakdown = grp.statusBreakdown || {};
          
          statusOrder.forEach(status => {
            const count = breakdown[status] || 0;
            if (count > 0) {
              const pct = Math.round(count / total * 100);
              const color = statusColors[status] || '#6c757d';
              const disp2 = statusDisplay[status] || status;
              progressHtml += `<div class="progress-bar" style="width:${pct}%; background-color:${color}; border-right:1px solid white;" title="${disp2}: ${count}"></div>`;
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

  // --- Show-only buttons for specific statuses ---
  const showOnlyPendingBtn = document.getElementById('showOnlyPendingBtn');
  const showOnlyRFMTBtn = document.getElementById('showOnlyRFMTBtn');
  if (showOnlyPendingBtn) {
    showOnlyPendingBtn.innerText = showOnlyPending ? 'Show All Groups' : 'Show only Pending Migration';
    showOnlyPendingBtn.onclick = () => {
      showOnlyPending = !showOnlyPending;
      if (showOnlyPending) showOnlyRFMT = false;
      renderBreakdown(data);
    };
  }
  if (showOnlyRFMTBtn) {
    showOnlyRFMTBtn.innerText = showOnlyRFMT ? 'Show All Groups' : 'Show only Ready';
    showOnlyRFMTBtn.onclick = () => {
      showOnlyRFMT = !showOnlyRFMT;
      if (showOnlyRFMT) showOnlyPending = false;
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
  const isDesktopTable = window.matchMedia('(min-width: 992px)').matches;
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
    layout: isDesktopTable ? "fitColumns" : "fitDataStretch",
    responsiveLayout: isDesktopTable ? false : "collapse",
    responsiveLayoutCollapseStartOpen: !isDesktopTable,
    rowHeight: isDesktopTable ? 32 : 27,
    tooltips: isDesktopTable,
    resizableColumnFit: isDesktopTable,
    columnDefaults: {
      vertAlign: "middle",
      resizable: isDesktopTable
    },
    paginationCounter: "rows",
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
      widthGrow: isDesktopTable ? 2 : 1,
      frozen: isDesktopTable,
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
  hozAlign: "center",
  headerHozAlign: "center",
  width: isDesktopTable ? 84 : 72,
  minWidth: 70,
  frozen: isDesktopTable,
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


      {title:"SD", field:"Page URL",  hozAlign:'center', headerHozAlign: 'center', width:70, minWidth:62, formatter:cell=>cell.getValue()?`<a href="${escapeHtml(cell.getValue())}" target="_blank" rel="noopener noreferrer">&#128279;</a>`:""},
  {title:"ZD", field:"Zesty URL Path Part", visible:true, hozAlign:"center", headerHozAlign:"center", width:70, minWidth:62, maxWidth:72, formatter:cell=>{
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
      {
        title:"QA Notes",
        field:"QA Notes",
        width: 220,
        minWidth: 150,
        headerSort: true,
        formatter: function(cell){
          const v = cell.getValue() ?? "";
          const esc = String(v)
            .replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            .replace(/\"/g,"&quot;");
          return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
        }
      },
      {
        title:"Revamp Needed",
        field:"Revamp Page",
        width: 120,
        minWidth: 100,
        headerSort: true,
        formatter: function(cell){
          const v = cell.getValue();
          if (v === true || v === 1 || v === "1") return "Yes";
          const s = String(v ?? "").toLowerCase().trim();
          return (s === "true" || s === "yes") ? "Yes" : "";
        }
      },
      {
        title:"Service Center",
        field:"Service Center Page",
        width: 120,
        minWidth: 100,
        headerSort: true,
        formatter: function(cell){
          const v = cell.getValue();
          if (v === true || v === 1 || v === "1") return "Yes";
          const s = String(v ?? "").toLowerCase().trim();
          return (s === "true" || s === "yes") ? "Yes" : "";
        }
      },
      {
        title:"Slide Handling",
        field:"Slide Handling",
        width: 120,
        minWidth: 100,
        headerSort: true,
        formatter: function(cell){
          const v = cell.getValue() ?? "";
          const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
          return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
        }
      },
      {
        title:"QA Post Migration",
        field:"QA Post Migration Review Completed",
        width: 136,
        minWidth: 116,
        headerSort: true,
        formatter: function(cell){
          const v = cell.getValue() ?? "";
          const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
          return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
        }
      },
      {
  title:"Site Title", 
  field:"Site Title",
  width: 110,        
  minWidth: 80,
  headerSort: true, 
  formatter: function(cell){
    const v = cell.getValue() ?? "";
    // escape html so long content can't break markup
    const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
    return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;  
  }
},
      {title:"Priority", field:"Priority", width: 98, minWidth: 84},
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

      {title:"Published", field:"Published Symphony", width: 120, minWidth: 96},
      {title:"Page Type", field:"Page Type", width: 112, minWidth: 92},
      // Use the numeric _ModifiedMs field for sorting, but display the human-friendly Modified string.
      {title:"Modified", field:"_ModifiedMs", width: 124, minWidth: 110, headerSort:true, sorter:"number", formatter: function(cell){
        const row = cell.getRow().getData();
        const v = row && row.Modified ? row.Modified : '';
        const esc = String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
        return `<div class="col-ellipsis" title="${esc}">${esc}</div>`;
      }}
    ],
    pagination: currentPageSize === 0 ? false : "local",
    paginationSize: currentPageSize === 0 ? false : currentPageSize,
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
  const counts = { "Do Not Migrate":0, "Needs Info":0, "Pending Migration":0, "Ready for Migration Tool":0, "In Progress":0, "In QA":0, "THQ Redirect":0, Unknown:0, Completed:0 };
  
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

  // Segment widths are TRUE proportions of the total. (They used to be sqrt-scaled,
  // which made a 0.2% sliver look like a meaningful chunk — the bar disagreed with its
  // own labels.) Ordered from "not started" through to "done" so the bar reads as a
  // pipeline left-to-right, and only segments with room show their inline label.
  const ORDER = [
    'Needs Info', 'Pending Migration', 'Ready for Migration Tool', 'In Progress',
    'In QA', 'Completed', 'THQ Redirect', 'Do Not Migrate', 'Unknown'
  ];
  const keys = ORDER.filter(k => (counts[k] || 0) > 0);

  // Headline above the bar: the single number people actually want.
  const doneCount = (counts['Completed'] || 0) + (counts['THQ Redirect'] || 0) + (counts['Do Not Migrate'] || 0);
  const donePct = total > 0 ? (doneCount / total) * 100 : 0;
  const headline = document.getElementById('progressHeadline');
  if (headline) {
    const remaining = total - doneCount;
    headline.innerHTML = `
      <div class="progress-headline-figure">${donePct.toFixed(1)}%</div>
      <div class="progress-headline-text">
        <div class="progress-headline-main">${doneCount.toLocaleString()} of ${total.toLocaleString()} pages resolved</div>
        <div class="progress-headline-sub">${remaining.toLocaleString()} still to work through — migrated, redirected or marked Do Not Migrate all count as resolved</div>
      </div>`;
  }

  keys.forEach((key) => {
    const raw = counts[key] || 0;
    const pct = total > 0 ? (raw / total) * 100 : 0;
    const pctDisplay = pct.toFixed(1);
    const displayKey = statusDisplay[key] || key;

    const div = document.createElement("div");
    div.className = "progress-bar";
    div.style.width = pct + "%";
    div.style.backgroundColor = statusColors[key];
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.overflow = "hidden";
    div.style.whiteSpace = "nowrap";
    // Only label segments wide enough to hold text; the rest rely on the legend + hover.
    div.innerText = pct >= 7 ? `${displayKey} · ${pctDisplay}%` : (pct >= 3.5 ? `${pctDisplay}%` : '');
    // NOTE: no escapeHtml() here. setAttribute stores the string verbatim (unlike an
    // attribute written into an innerHTML string, where the parser decodes entities),
    // so escaping it would make the tooltip display its own markup as text.
    div.setAttribute('data-rich-tooltip', buildRichTooltipHtml(
      displayKey,
      [{ label: 'Pages', n: raw.toLocaleString(), color: statusColors[key] },
       { label: 'Share of total', n: `${pctDisplay}%`, color: statusColors[key] }]
    ));
    container.appendChild(div);

    const legendItem = document.createElement("div");
    legendItem.className = "d-flex align-items-center gap-1 legend-item";
    legendItem.innerHTML = `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background-color:${statusColors[key]};"></span> ${displayKey} – ${pctDisplay}% (${raw.toLocaleString()})`;
    legendContainer.appendChild(legendItem);
  });

  // --- Division at-a-glance: ranked % complete by Division ---
  const divisionGlanceContainer = document.getElementById("divisionGlance");
  if (divisionGlanceContainer) {
    const divisionStats = {};
    filtered.forEach(d => {
      const div = (d.Division || 'Other').toString().trim() || 'Other';
      if (!divisionStats[div]) divisionStats[div] = { total: 0, done: 0 };
      divisionStats[div].total++;
      const canon = getCanonicalStatus(d.Status);
      if (canon === 'Completed' || canon === 'THQ Redirect' || canon === 'Do Not Migrate') {
        divisionStats[div].done++;
      }
    });

    const divisionRows = Object.keys(divisionStats)
      .map(div => {
        const stats = divisionStats[div];
        const pct = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
        return { div, total: stats.total, done: stats.done, pct };
      })
      .sort((a, b) => b.pct - a.pct);

    if (divisionRows.length) {
      divisionGlanceContainer.innerHTML = `
        <div class="small text-muted mb-2">Division progress at a glance <span class="text-muted">— click a division for its site-by-site breakdown</span></div>
        <div class="d-flex flex-column gap-1">
          ${divisionRows.map((r, idx) => `
            <div class="division-glance-row d-flex align-items-center gap-2" role="button" tabindex="0"
                 data-division="${escapeHtml(r.div)}" style="animation-delay:${60 + idx * 55}ms;"
                 title="Click for the site-by-site breakdown of ${escapeHtml(r.div)}">
              <div class="small text-truncate" style="min-width:220px; max-width:220px;">${escapeHtml(r.div)}</div>
              <div class="progress flex-grow-1" style="height:10px;">
                <div class="progress-bar" role="progressbar" style="width:${r.pct.toFixed(1)}%; background-color:#2258a1;" aria-valuenow="${r.pct.toFixed(1)}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="small text-muted" style="min-width:110px; text-align:right;">${r.pct.toFixed(1)}% (${r.done}/${r.total})</div>
            </div>
          `).join('')}
        </div>`;

      divisionGlanceContainer.querySelectorAll('.division-glance-row').forEach(row => {
        const open = () => showDivisionSitesModal(row.getAttribute('data-division'));
        row.addEventListener('click', open);
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
      });
    } else {
      divisionGlanceContainer.innerHTML = '';
    }
  }
}

// Page Title Cloud
// ─────────────────
// The same page titles repeat across sites — "Home" on ~299 pages, "Advisory Board" on
// ~112 — so a cloud reads the shape of the work far faster than a table: bigger text
// means the title recurs on more pages, and the colour says how far that title has got.
// Click any title for the site-by-site breakdown.
function renderTitleCloud(data){
  const container = document.getElementById('titleCloudBody');
  if (!container) return;
  const rows = Array.isArray(data) ? data : getFilteredData();

  const scopeEl = document.getElementById('titleCloudScope');
  const limit = parseInt(scopeEl && scopeEl.value, 10) || 60;

  const groups = {};
  rows.forEach(r => {
    const title = (r['Page Title'] || r.Title || '').toString().trim();
    if (!title) return;
    if (!groups[title]) groups[title] = { title, total: 0, done: 0, dnm: 0, open: 0, sites: new Set() };
    const g = groups[title];
    g.total++;
    g.sites.add(getSiteGroupTitle(r));
    const canon = getCanonicalStatus(r.Status);
    if (canon === 'Completed' || canon === 'THQ Redirect') g.done++;
    else if (canon === 'Do Not Migrate') g.dnm++;
    else g.open++;
  });

  const all = Object.values(groups);
  if (!all.length) {
    container.innerHTML = '<div class="text-muted small">No page titles in the current filter.</div>';
    return;
  }

  const top = all.sort((a, b) => b.total - a.total).slice(0, limit);
  const maxCount = top[0].total;
  const minCount = top[top.length - 1].total;

  // sqrt scaling keeps the long tail readable — a linear map would shrink everything
  // below the few huge titles into illegibility.
  const MIN_REM = 0.78, MAX_REM = 2.6;
  const sizeFor = (n) => {
    if (maxCount === minCount) return (MIN_REM + MAX_REM) / 2;
    const t = (Math.sqrt(n) - Math.sqrt(minCount)) / (Math.sqrt(maxCount) - Math.sqrt(minCount));
    return MIN_REM + t * (MAX_REM - MIN_REM);
  };

  // Colour carries the second dimension: how much of that title is finished.
  const colorFor = (pct) => {
    if (pct >= 90) return '#1c7a34';
    if (pct >= 60) return '#2f7d4f';
    if (pct >= 35) return '#2258a1';
    if (pct >= 15) return '#8a6a1c';
    return '#b02a37';
  };

  // Shuffle so sizes interleave and it reads as a cloud rather than a sorted list,
  // but keep it deterministic per render so it doesn't jump around on every refresh.
  const shuffled = top.slice();
  let seed = shuffled.length;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const items = shuffled.map(g => {
    const pct = g.total ? (g.done / g.total) * 100 : 0;
    const tooltip = buildRichTooltipHtml(g.title, [
      { label: 'Pages with this title', n: g.total.toLocaleString(), color: '#2258a1' },
      { label: 'Sites', n: g.sites.size.toLocaleString(), color: '#5d6b80' },
      { label: 'Migrated', n: `${g.done} (${pct.toFixed(0)}%)`, color: '#28a745' },
      { label: 'Still open', n: g.open.toLocaleString(), color: '#E74C3C' },
      { label: 'Do Not Migrate', n: g.dnm.toLocaleString(), color: '#6c757d' }
    ]);
    return `<button type="button" class="title-cloud-word" data-title="${escapeHtml(g.title)}"
              style="font-size:${sizeFor(g.total).toFixed(2)}rem; color:${colorFor(pct)};"
              data-rich-tooltip="${escapeHtml(tooltip)}">${escapeHtml(g.title)}</button>`;
  }).join('');

  const totalPages = all.reduce((a, g) => a + g.total, 0);
  const shownPages = top.reduce((a, g) => a + g.total, 0);

  container.innerHTML = `
    <div class="title-cloud">${items}</div>
    <div class="title-cloud-footer">
      <div class="title-cloud-legend">
        <span class="title-cloud-legend-label">Migrated:</span>
        <span class="title-cloud-key" style="color:#b02a37;">under 15%</span>
        <span class="title-cloud-key" style="color:#8a6a1c;">15–35%</span>
        <span class="title-cloud-key" style="color:#2258a1;">35–60%</span>
        <span class="title-cloud-key" style="color:#2f7d4f;">60–90%</span>
        <span class="title-cloud-key" style="color:#1c7a34;">90%+</span>
      </div>
      <div class="title-cloud-meta">
        Showing the ${top.length} most common of ${all.length.toLocaleString()} distinct titles
        (${shownPages.toLocaleString()} of ${totalPages.toLocaleString()} pages). Click a title for its site-by-site breakdown.
      </div>
    </div>`;

  container.querySelectorAll('.title-cloud-word').forEach(btn => {
    btn.addEventListener('click', () => showTitleDetailModal(btn.getAttribute('data-title'), rows));
  });

  if (scopeEl && !scopeEl._cloudBound) {
    scopeEl._cloudBound = true;
    scopeEl.addEventListener('change', () => renderTitleCloud(getFilteredData()));
  }
}

// Every site that has a page with this title, and where each one stands.
function showTitleDetailModal(title, sourceRows){
  const modalEl = document.getElementById('titleDetailModal');
  const bodyEl = document.getElementById('titleDetailModalBody');
  const labelEl = document.getElementById('titleDetailModalLabel');
  if (!modalEl || !bodyEl) return;

  const matched = (sourceRows || getFilteredData()).filter(r =>
    ((r['Page Title'] || r.Title || '').toString().trim() === title));

  if (labelEl) labelEl.textContent = `“${title}” — ${matched.length} page${matched.length === 1 ? '' : 's'}`;

  const bySite = {};
  matched.forEach(r => {
    const site = getSiteGroupTitle(r);
    if (!bySite[site]) bySite[site] = [];
    bySite[site].push(r);
  });

  const openFirst = Object.keys(bySite).sort((a, b) => {
    const openA = bySite[a].filter(r => !['Completed', 'THQ Redirect', 'Do Not Migrate'].includes(getCanonicalStatus(r.Status))).length;
    const openB = bySite[b].filter(r => !['Completed', 'THQ Redirect', 'Do Not Migrate'].includes(getCanonicalStatus(r.Status))).length;
    return openB - openA || a.localeCompare(b);
  });

  bodyEl.innerHTML = `
    <p class="text-muted small">Every site with a page called “${escapeHtml(title)}”, sites with the most outstanding work first.</p>
    <div class="table-responsive division-sites-scroll">
      <table class="table table-hover align-middle mb-0 division-sites-table">
        <thead><tr><th>Site</th><th>Division</th><th>Status</th><th>Page</th></tr></thead>
        <tbody>
          ${openFirst.map(site => bySite[site].map(r => {
            const url = (r['Page URL'] || '').toString();
            const canon = getCanonicalStatus(r.Status);
            const color = statusColors[canon] || '#6c757d';
            return `
              <tr>
                <td class="fw-semibold">${escapeHtml(site)}</td>
                <td class="small text-muted">${escapeHtml(r.Division || '')}</td>
                <td><span class="badge" style="background:${color};">${escapeHtml(statusDisplay[canon] || canon)}</span></td>
                <td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open</a>` : '<span class="text-muted">—</span>'}</td>
              </tr>`;
          }).join('')).join('')}
        </tbody>
      </table>
    </div>`;

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// Division drill-down: every distinct Site Title in the division, with the data that
// matters per site — page counts, the canonical status mix, migrated vs redirect-only,
// QA flags and the most recent migration date.
function showDivisionSitesModal(divisionName){
  const modalEl = document.getElementById('divisionSitesModal');
  const bodyEl = document.getElementById('divisionSitesModalBody');
  const titleEl = document.getElementById('divisionSitesModalLabel');
  if (!modalEl || !bodyEl) return;

  const rows = getFilteredData().filter(d => ((d.Division || 'Other').toString().trim() || 'Other') === divisionName);
  if (titleEl) titleEl.textContent = `${divisionName} — Site Breakdown`;

  // Group by site (Service Center pages roll up under their service center, matching
  // how sites are counted elsewhere on the dashboard).
  const sites = {};
  rows.forEach(d => {
    const site = getSiteGroupTitle(d);
    if (!sites[site]) {
      sites[site] = {
        site, total: 0, done: 0, migrated: 0, redirected: 0, dnm: 0,
        qaIssues: 0, redirectFlags: 0, latestDate: 0,
        counts: { '1a':0, '1b':0, '1c':0, '2.x':0, '2c':0, '3.x':0, 'Live':0, '5x':0, 'Redirect':0, 'DNM':0 }
      };
    }
    const s = sites[site];
    s.total++;

    const status = (d.Status || '').toString().trim();
    const canon = getCanonicalStatus(status);
    if (status.startsWith('1a')) s.counts['1a']++;
    else if (status.startsWith('1b')) s.counts['1b']++;
    else if (status.startsWith('1c')) s.counts['1c']++;
    else if (status.startsWith('2')) { s.counts['2.x']++; if (status.startsWith('2c')) s.counts['2c']++; }
    else if (status.startsWith('3')) s.counts['3.x']++;
    else if (status.startsWith('4') || status.startsWith('5')) { s.counts['Live']++; if (status.startsWith('5')) s.counts['5x']++; }
    else if (status === 'THQ Redirect') s.counts['Redirect']++;
    else if (status === 'Do Not Migrate') s.counts['DNM']++;

    const isDone = canon === 'Completed' || canon === 'THQ Redirect' || canon === 'Do Not Migrate';
    if (isDone) s.done++;
    if (canon === 'Do Not Migrate') s.dnm++;
    if ((canon === 'Completed' || canon === 'THQ Redirect')) {
      if (isFullyMigratedPage(d)) s.migrated++; else s.redirected++;
    }
    if ((d['QA Issues.lookupValue'] || '').toString().trim() || isRevampPage(d)) s.qaIssues++;
    if (getRedirectCheckStatus(d).flagged) s.redirectFlags++;

    const dStr = resolveMigrationDateStr(d);
    if (dStr) {
      const t = new Date(dStr).getTime();
      if (!isNaN(t) && t > s.latestDate) s.latestDate = t;
    }
  });

  const siteList = Object.values(sites).sort((a, b) => {
    const pa = a.total ? a.done / a.total : 0;
    const pb = b.total ? b.done / b.total : 0;
    return pa - pb || b.total - a.total; // least complete first — where attention is needed
  });

  const totals = siteList.reduce((acc, s) => {
    acc.total += s.total; acc.done += s.done; acc.migrated += s.migrated;
    acc.redirected += s.redirected; acc.dnm += s.dnm; acc.qaIssues += s.qaIssues;
    acc.redirectFlags += s.redirectFlags;
    return acc;
  }, { total: 0, done: 0, migrated: 0, redirected: 0, dnm: 0, qaIssues: 0, redirectFlags: 0 });

  const pctOf = (n, t) => t > 0 ? ((n / t) * 100).toFixed(1) : '0.0';
  const dateText = (ms) => ms ? new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const statCard = (icon, value, label, variant) => `
    <div class="division-stat-card variant-${variant}">
      <div class="division-stat-icon"><i class="bi ${icon}"></i></div>
      <div>
        <div class="division-stat">${value}</div>
        <div class="division-stat-label">${label}</div>
      </div>
    </div>`;

  bodyEl.innerHTML = `
    <div class="division-modal-summary mb-3">
      ${statCard('bi-buildings', siteList.length, 'Sites', 'neutral')}
      ${statCard('bi-file-earmark-text', totals.total, 'Pages', 'neutral')}
      ${statCard('bi-check2-circle', pctOf(totals.done, totals.total) + '%', 'Complete', 'success')}
      ${statCard('bi-box-arrow-in-down', totals.migrated, 'Migrated', 'success')}
      ${statCard('bi-signpost-split', totals.redirected, 'Redirect only', 'info')}
      ${statCard('bi-slash-circle', totals.dnm, 'Do Not Migrate', 'danger')}
      ${statCard('bi-clipboard2-pulse', totals.qaIssues, 'QA flags', 'warning')}
    </div>
    <div class="table-responsive division-sites-scroll">
      <table class="table table-hover align-middle mb-0 division-sites-table">
        <thead>
          <tr>
            <th style="min-width:210px;">Site Title</th>
            <th class="text-end" style="width:70px;">Pages</th>
            <th style="min-width:150px;">Complete</th>
            <th style="min-width:150px;">Status Breakdown</th>
            <th class="text-end" style="width:90px;">Migrated</th>
            <th class="text-end" style="width:95px;">Redirect only</th>
            <th class="text-end" style="width:80px;">QA</th>
            <th style="width:120px;">Last Migrated</th>
          </tr>
        </thead>
        <tbody>
          ${siteList.map(s => {
            const pct = s.total ? (s.done / s.total) * 100 : 0;
            const barColor = pct >= 99 ? '#28a745' : pct >= 50 ? '#2258a1' : '#E74C3C';
            return `
            <tr>
              <td class="fw-semibold">${escapeHtml(s.site)}</td>
              <td class="text-end">${s.total}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1" style="height:8px; min-width:60px;">
                    <div class="progress-bar" style="width:${pct.toFixed(1)}%; background-color:${barColor};"></div>
                  </div>
                  <span class="small text-muted" style="min-width:44px; text-align:right;">${pct.toFixed(0)}%</span>
                </div>
              </td>
              <td>${buildStatusMiniBarHtml(s.counts, s.total)}</td>
              <td class="text-end">${s.migrated}</td>
              <td class="text-end">${s.redirected}</td>
              <td class="text-end">${s.qaIssues ? `<span class="badge bg-warning text-dark">${s.qaIssues}</span>` : '—'}${s.redirectFlags ? ` <span class="badge bg-danger" title="Redirect check flagged">${s.redirectFlags}</span>` : ''}</td>
              <td class="small text-muted">${dateText(s.latestDate)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
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
  if (/^1c/.test(status)) return "Ready for Migration Tool";
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
  const filterIds = ["filterDivision","filterAC","filterStatus","filterPageType","filterPubSym","filterSymType","filterPriority","filterRevamp","filterSiteTitle","filterZestyUrl"];

  filterIds.forEach(id=>{
    const sel = document.getElementById(id);
    if (sel) sel.addEventListener("change", debounce(updateFiltersAndDashboard, 150));
  });

  // Wire Modified date range inputs (optional date inputs with IDs filterModifiedFrom and filterModifiedTo)
  const modFrom = document.getElementById('filterModifiedFrom');
  const modTo = document.getElementById('filterModifiedTo');
  if (modFrom) modFrom.addEventListener('change', debounce(updateFiltersAndDashboard, 150));
  if (modTo) modTo.addEventListener('change', debounce(updateFiltersAndDashboard, 150));

  // Wire page size selector
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  if (pageSizeSelect) {
    // Set the initial value from localStorage
    pageSizeSelect.value = currentPageSize;
    pageSizeSelect.addEventListener('change', function() {
      currentPageSize = parseInt(this.value) || 20;
      // Save to localStorage
      localStorage.setItem('dashboardPageSize', currentPageSize);
      // Update the select element to reflect the current value
      this.value = currentPageSize;
      updateDashboard();
    });
  }

  // Wire clear filters button
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Clear all filter dropdowns
      const filterIds = ["filterDivision", "filterAC", "filterStatus", "filterPageType", "filterPubSym", "filterSymType", "filterPriority", "filterRevamp", "filterSiteTitle", "filterZestyUrl"];
      filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      
      // Clear date inputs
      const modFrom = document.getElementById('filterModifiedFrom');
      const modTo = document.getElementById('filterModifiedTo');
      if (modFrom) modFrom.value = "";
      if (modTo) modTo.value = "";
      
      // Clear search input if it exists
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = "";
      
      // Update dashboard with cleared filters
      updateFiltersAndDashboard();
    });
  }

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
  const renderedKeys = new Set();
  const yesNo = (val) => {
    if (val === true || val === 1 || val === "1") return "Yes";
    const s = String(val ?? "").toLowerCase().trim();
    return (s === "true" || s === "yes") ? "Yes" : "No";
  };
  const toDateLabel = (raw) => {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
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

  // Migration accordion shown above record details
  const lastMigrationRaw = page['Last Migrated'] || page['Last Migration'] || '';
  const lastMigrationLabel = toDateLabel(lastMigrationRaw) || 'Not Set';
  const migrationNotes = page['Migration Notes'] || 'No migration notes available.';
  const migrationDateEsc = escapeHtml(lastMigrationLabel);
  const migrationNotesEsc = escapeHtml(String(migrationNotes)).replace(/\n/g, '<br>');
  const migrationAccordionId = `lastMigrationAccordion_${page.ID || page._id || 'x'}`;
  const migrationCollapseId = `lastMigrationCollapse_${page.ID || page._id || 'x'}`;
  html += `
    <div class="accordion mb-3" id="${migrationAccordionId}">
      <div class="accordion-item">
        <h2 class="accordion-header" id="${migrationAccordionId}_heading">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${migrationCollapseId}" aria-expanded="false" aria-controls="${migrationCollapseId}">
            Last Migration: ${migrationDateEsc}
          </button>
        </h2>
        <div id="${migrationCollapseId}" class="accordion-collapse collapse" aria-labelledby="${migrationAccordionId}_heading" data-bs-parent="#${migrationAccordionId}">
          <div class="accordion-body">
            <div><strong>Date:</strong> ${migrationDateEsc}</div>
            <div class="mt-2"><strong>Migration Notes:</strong></div>
            <div>${migrationNotesEsc}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  html += '<table class="table table-bordered">';
  // --- Form link ---
  const type = (page["Symphony Site Type"] || "").trim();
  let formUrl = "#";
  if(type === "Metro Area") 
      formUrl = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${page.ID}&e=mY8mhG`;
  else if(type === "Corps") 
      formUrl = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${page.ID}&e=dF11LG`;
  html += `<tr><th>Form</th><td><a href="${formUrl}" target="_blank">Edit Form</a></td></tr>`;
  html += `<tr><th>Revamp Needed</th><td>${yesNo(page['Revamp Page'])}</td></tr>`;
  html += `<tr><th>Service Center</th><td>${yesNo(page['Service Center Page'])}</td></tr>`;
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
      renderedKeys.add(k);
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
      if(k==="Zesty Preview Migration" && val)
          val = `<a href="${val}" target="_blank" rel="noopener noreferrer">${val}</a>`;
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

    // Ensure requested IDs and redirect values appear in these detail groups.
    if (groupName === 'Page Migration Report Details') {
      if (!renderedKeys.has('idDocument')) {
        html += `<tr><th>idDocument</th><td>${page['idDocument'] ?? ''}</td></tr>`;
      }
      if (!renderedKeys.has('idSite')) {
        html += `<tr><th>idSite</th><td>${page['idSite'] ?? ''}</td></tr>`;
      }
    }
    if (groupName === 'Symphony Details' && !renderedKeys.has('Webmanager Redirect External URL')) {
      html += `<tr><th>Webmanager Redirect External URL</th><td>${page['Webmanager Redirect External URL'] ?? ''}</td></tr>`;
    }
  });

  // Fallbacks if groups are missing from FieldExport configuration
  if (!renderedKeys.has('idDocument')) {
    html += `<tr><th>idDocument</th><td>${page['idDocument'] ?? ''}</td></tr>`;
  }
  if (!renderedKeys.has('idSite')) {
    html += `<tr><th>idSite</th><td>${page['idSite'] ?? ''}</td></tr>`;
  }
  if (!renderedKeys.has('Webmanager Redirect External URL')) {
    html += `<tr><th>Webmanager Redirect External URL</th><td>${page['Webmanager Redirect External URL'] ?? ''}</td></tr>`;
  }

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
  const ctxVelocityEl = document.getElementById("velocityChart");
  if (!ctxStatusEl || !ctxPriorityEl || !ctxPageTypeEl || !ctxPubSymEl || !ctxEffortEl) return;

  const ctxStatus = ctxStatusEl.getContext("2d");
  const ctxPriority = ctxPriorityEl.getContext("2d");
  const ctxPageType = ctxPageTypeEl.getContext("2d");
  const ctxPubSym = ctxPubSymEl.getContext("2d");
  const ctxEffort = ctxEffortEl.getContext("2d");
  const ctxVelocity = ctxVelocityEl ? ctxVelocityEl.getContext("2d") : null;

    const statusCounts = {};
    filtered.forEach(d => {
      let s = normalizeStatus(d.Status) || "Unknown";
      if (/^(4|5)/.test(s)) s = "Completed";
      else if (s === "Do Not Migrate") s = "Do Not Migrate";
      else if (/^2/.test(s)) s = "In Progress";
      else if (/^1c/.test(s)) s = "Ready for Migration Tool";
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

      // Migration Velocity: pages completed per week, using the "Last Migrated" timestamp
      // (a genuine per-page completion date), not "Modified" (bulk-touched by the sync app
      // and unusable for a real trend).
      if (ctxVelocity) {
        const resolveMigrationDate = (d) => {
          const dStr = resolveMigrationDateStr(d);
          if (!dStr) return null;
          const dt = new Date(dStr);
          return isNaN(dt) ? null : dt;
        };

        // ISO 8601 week key, e.g. "2026-W36"
        const isoWeekKey = (date) => {
          const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
          return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
        };

        const weeklyCompleted = {};
        filtered.forEach(d => {
          const canon = getCanonicalStatus(d.Status);
          if (canon !== 'Completed' && canon !== 'THQ Redirect') return;
          const dt = resolveMigrationDate(d);
          if (!dt) return;
          const key = isoWeekKey(dt);
          weeklyCompleted[key] = (weeklyCompleted[key] || 0) + 1;
        });

        const activeWeeks = Object.keys(weeklyCompleted).sort();
        const recentWeeks = activeWeeks.slice(-12);
        const velocityData = recentWeeks.map(wk => weeklyCompleted[wk]);
        // "2026-W34" means nothing at a glance — label each bar with the week's start
        // date ("Aug 17") instead, which reads instantly.
        const velocityLabels = recentWeeks.map(wk => {
          const [yearStr, weekStr] = wk.split('-W');
          const year = Number(yearStr), week = Number(weekStr);
          const jan4 = new Date(Date.UTC(year, 0, 4));
          const weekStart = new Date(jan4);
          weekStart.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() || 7) - 1) + (week - 1) * 7);
          return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        });

        if (velocityChart) try { velocityChart.destroy(); } catch (e) {}
        velocityChart = new Chart(ctxVelocity, {
          type: 'bar',
          data: {
            labels: velocityLabels,
            datasets: [{
              label: 'Pages completed',
              data: velocityData,
              backgroundColor: '#2258a1',
              hoverBackgroundColor: '#2f80f5',
              borderRadius: 6,
              borderSkipped: false,
              maxBarThickness: 26
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 2,
            layout: { padding: { top: 6, bottom: 2 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                displayColors: false,
                backgroundColor: '#13233f',
                borderColor: '#d4af37',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  title: (items) => `Week of ${items[0].label}`,
                  label: (ctx) => `${ctx.parsed.y} page${ctx.parsed.y === 1 ? '' : 's'} completed`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 6,
                  color: '#5d6b80',
                  font: { size: 11 }
                }
              },
              y: {
                beginAtZero: true,
                grace: '8%',
                border: { display: false },
                grid: { color: 'rgba(19,35,63,0.07)' },
                ticks: { precision: 0, maxTicksLimit: 4, color: '#5d6b80', font: { size: 11 } }
              }
            }
          }
        });

        const statEl = document.getElementById('velocityChartStat');
        if (statEl) {
          if (recentWeeks.length) {
            const total = velocityData.reduce((a, b) => a + b, 0);
            const avg = (total / recentWeeks.length).toFixed(1);
            statEl.textContent = `Avg ${avg} pages/week over the last ${recentWeeks.length} active week${recentWeeks.length === 1 ? '' : 's'} (based on Last Migrated)`;
          } else {
            statEl.textContent = 'No completion dates available yet for the current filters.';
          }
        }
      }
  }catch(err){ console.warn('renderCharts failed', err); }
}

// --- Migration Insights rendering ---
function renderMigrationInsights(filteredData){
  const container = document.getElementById("siteInsightsParent") || document.getElementById("migrationInsightsBody");
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(filteredData)) filteredData = getFilteredData();

  // Broadened filter: include anything with migration activity or handle-marks
  const migratedPages = filteredData.filter(d => {
    // Only include if a genuine migration date was found (primary requirement)
    return !!resolveMigrationDateStr(d);
  });

  const badge = document.getElementById("migrationInsightsBadge");
  if (badge) badge.textContent = migratedPages.length;

  if (!migratedPages.length) {
    container.innerHTML = "<div class='alert alert-info'>No migration data available for filtered pages.</div>";
    return;
  }

  // Parse notes function (categorizes by keywords)
  const parseNotes = (notes) => {
    if (!notes) return [];
    const lines = notes.split(/\n|;/).map(s => s.trim()).filter(Boolean);
    const parsed = [];
    lines.forEach(line => {
      const lower = line.toLowerCase();
      let category = 'info';
      if (lower.includes('completed') || lower.includes('done') || lower.includes('success')) category = 'success';
      else if (lower.includes('issue') || lower.includes('error') || lower.includes('problem') || lower.includes('broken')) category = 'danger';
      else if (lower.includes('pending') || lower.includes('todo') || lower.includes('wait')) category = 'warning';
      parsed.push({ text: line, category });
    });
    return parsed;
  };

  // Helper to linkify URLs in text
  const linkifyText = (text) => {
    if (!text) return "";
    
    // Improved SharePoint App link handling vs general URLs
    // Example: SharePoint App ([6/16/2026 11:56 AM](https://...))
    const spRegex = /SharePoint App \(\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\)/g;
    let processed = escapeHtml(text).replace(spRegex, (match, dateLabel, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary fw-bold" style="text-decoration: underline;">SP Migration Log (${dateLabel})</a>`;
    });

    const urlRegex = /(https?:\/\/[^\s\)]+|www\.[^\s\)]+)/g;
    return processed.replace(urlRegex, (match) => {
      // Don't re-linkify what we already processed for SP
      if (match.includes('sauss.sharepoint.com') && processed.includes('SP Migration Log')) return match;
      const url = match.startsWith('http') ? match : 'https://' + match;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: inherit;">${match}</a>`;
    });
  };

  // Group by Site Title
  const sitesMap = {};
  migratedPages.forEach(page => {
    const groupTitle = getSiteGroupTitle(page);
    const isServiceCenter = !!(page['Service Center Site Name'] || '').toString().trim();

    if (!sitesMap[groupTitle]) {
      sitesMap[groupTitle] = {
        title: groupTitle,
        pages: [],
        latestDate: 0,
        allDates: new Set(),
        division: page.Division || '',
        siteType: page['Site Type'] || page['Symphony Site Type'] || '',
        isServiceCenterCluster: (isServiceCenter && page['Service Center Site Name'] === groupTitle)
      };
    }
    sitesMap[groupTitle].pages.push(page);
    
    const dStr = resolveMigrationDateStr(page);
    if (dStr) {
      const d = new Date(dStr).getTime();
      if (!isNaN(d)) {
        if (d > sitesMap[groupTitle].latestDate) sitesMap[groupTitle].latestDate = d;
        sitesMap[groupTitle].allDates.add(new Date(dStr).toLocaleDateString());
      }
    }
  });

  // Sort sites by latest migration date descending
  const sortedSites = Object.values(sitesMap).sort((a, b) => b.latestDate - a.latestDate);

  // Show summary header
  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'mb-4 p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center';
  summaryDiv.innerHTML = `
    <div>
        <h5 class="mb-1 fw-bold text-dark">Recent Site Migration Tool Insights</h5>
        <span class="text-muted small">Showing highlights for <strong>${migratedPages.length}</strong> pages across <strong>${sortedSites.length}</strong> grouped site buckets.</span>
    </div>
    <div class="text-end">
        <span class="badge bg-primary rounded-pill px-3">${sortedSites.length} Active Buckets</span>
    </div>
  `;
  container.appendChild(summaryDiv);

  // Render Site Sections
  sortedSites.forEach((site, siteIndex) => {
    const siteCard = document.createElement('div');
    siteCard.className = 'site-insight-card mb-4';
    
    // Unique ID for accordion functionality
    const collapseId = `siteCollapse_${siteIndex}`;
    
    // Sort pages within site by date descending
    site.pages.sort((a,b) => {
      const daStr = resolveMigrationDateStr(a);
      const dbStr = resolveMigrationDateStr(b);
      return new Date(dbStr || 0) - new Date(daStr || 0);
    });

    const datesList = Array.from(site.allDates).sort((a,b) => new Date(b) - new Date(a));
    const datesHtml = datesList.length 
      ? datesList.map(dt => `<span class="badge bg-light text-dark border me-1">${dt}</span>`).join('')
      : '<span class="text-muted small">Date Pending</span>';

    siteCard.innerHTML = `
      <div class="card border-0 shadow-sm overflow-hidden mb-2">
        <div class="card-header bg-dark text-white p-0">
          <button class="btn btn-dark w-100 text-start p-3 border-0 d-flex justify-content-between align-items-start collapse-trigger collapsed" 
                  type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" 
                  aria-expanded="false" aria-controls="${collapseId}">
            <div class="flex-grow-1">
              <h5 class="mb-0 fw-bold d-flex align-items-center">
                <span class="badge ${site.isServiceCenterCluster ? 'bg-primary' : 'bg-warning text-dark'} me-2 px-2" style="font-size: 0.7rem;">${site.isServiceCenterCluster ? 'SERVICE CENTER' : 'SITE'}</span>
                ${escapeHtml(site.title)}
                <i class="ms-2 opacity-50 small pe-7s-angle-down"></i>
              </h5>
              <div class="d-flex align-items-center mt-1">
                <small class="opacity-75 me-2">${escapeHtml(site.division)}</small>
                ${site.siteType ? `<span class="badge bg-secondary opacity-75" style="font-size: 0.65rem;">${escapeHtml(site.siteType)}</span>` : ''}
              </div>
            </div>
            <div class="text-end" style="min-width: 150px;">
              <div class="small fw-bold mb-1 opacity-75" style="font-size: 0.7rem;">MIGRATION DATES:</div>
              <div class="d-flex flex-wrap justify-content-end gap-1">${datesHtml}</div>
            </div>
          </button>
        </div>
        <div id="${collapseId}" class="collapse" data-bs-parent="#siteInsightsParent">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped mb-0 align-middle">
                <thead class="table-light small text-uppercase fw-bold">
                  <tr>
                    <th style="padding-left: 1.5rem; width: 35%;">Page Title & URL</th>
                    <th style="width: 15%;">Date</th>
                    <th style="padding-right: 1.5rem;">Notes & Summaries</th>
                  </tr>
                </thead>
                <tbody>
                  ${site.pages.map(page => {
                    const pTitle = page.Title || page['Page Title'] || 'Untitled Page';
                    const pDateStr = resolveMigrationDateStr(page);
                    const pDate = pDateStr ? new Date(pDateStr).toLocaleDateString() : '-';
                    
                    // Comprehensive activity summary with improved badges
                    const tags = [];
                    
                    // Status Badge (Priority)
                    const status = page['Status'];
                    if (status) {
                      let sClass = 'primary';
                      if (status.includes('Complete') || status.includes('Ready')) sClass = 'success';
                      else if (status.includes('Review') || status.includes('Redirect')) sClass = 'warning text-dark';
                      tags.push(`<span class="badge border border-${sClass} text-${sClass} text-uppercase me-1" style="font-size: 0.6rem;">${escapeHtml(status)}</span>`);
                    }

                    // Site Info (if Service Center, show original site)
                    if (site.isServiceCenterCluster && page['Site Title'] && page['Site Title'] !== site.title) {
                      tags.push(`<span class="badge bg-secondary text-white me-1">From: ${escapeHtml(page['Site Title'])}</span>`);
                    }

                    // Priority Badge
                    const priority = page['Priority'];
                    if (priority && priority !== 'None') {
                      let pClass = 'secondary';
                      if (priority.includes('1')) pClass = 'danger';
                      else if (priority.includes('2')) pClass = 'warning text-dark';
                      tags.push(`<span class="badge bg-${pClass} text-uppercase me-1" title="Priority">P: ${escapeHtml(priority)}</span>`);
                    }

                    // Effort Badge
                    const effort = page['Effort Needed'];
                    if (effort && !effort.includes('0')) {
                      tags.push(`<span class="badge bg-light text-dark border me-1" title="Level of Effort">Effort: ${escapeHtml(effort.split('.')[0])}</span>`);
                    }

                    if (page['Revamp Page'] && page['Revamp Page'] !== 'None' && page['Revamp Page'] !== 'false' && page['Revamp Page'] !== false && String(page['Revamp Page']).toLowerCase() !== 'false') {
                      tags.push(`<span class="badge bg-info text-white me-1">Revamp: ${escapeHtml(page['Revamp Page'])}</span>`);
                    }

                    // Show Revamp Publish if 'No'
                    if (page['Revamp Publish Y/N'] === 'No' || page['Revamp Publish Y/N'] === 'no') {
                      tags.push(`<span class="badge text-white me-1" style="background-color: darkorange;" title="Revamp Publish Status">Not Published Live</span>`);
                    }
                    
                    if (page['Service Center Page'] && page['Service Center Page'] !== 'No' && page['Service Center Page'] !== '0') {
                      tags.push(`<span class="badge bg-primary text-white me-1">Service Center Page</span>`);
                    }
                    
                    if (page['Status'] === 'THQ Redirect') {
                      tags.push(`<span class="badge bg-secondary text-white me-1">Redirect Active</span>`);
                    }
                    
                    // QA Issues count
                    const qaIssues = page['QA Issues'] || page['QA Issues.lookupValue'];
                    if (qaIssues) {
                      tags.push(`<span class="badge bg-danger text-white me-1">QA Issues Found</span>`);
                    }

                    const tagsHtml = tags.length ? `<div class="mb-2 d-flex flex-wrap gap-1">${tags.join('')}</div>` : '';

                    // Combine all possible summary fields. QA Notes is generally written
                    // during the pre-migration review, Migration Notes when the migration
                    // tool actually ran — so Migration Notes comes last (more recent).
                    const combinedNotes = [
                      page['QA Notes'],
                      page['Migration Notes']
                    ].filter(Boolean).join('; ');

                    // Keep only the most recent line per category (success/danger/warning/info)
                    // instead of stacking every historical line — a later note (e.g. "migration
                    // completed successfully") supersedes an older one in the same category
                    // (e.g. a pre-migration QA note flagging an issue that may since be resolved),
                    // so the old one doesn't need to stay flagged.
                    const allNotes = parseNotes(combinedNotes);
                    const latestByCategory = {};
                    allNotes.forEach(n => { latestByCategory[n.category] = n; });
                    const notes = Object.values(latestByCategory);
                    const notesHtml = notes.length
                      ? notes.map(n => `
                          <div class="d-flex align-items-start mb-1 notes-line">
                            <span class="badge bg-${n.category} p-0 mt-2 me-2" style="min-width: 6px; height: 6px; border-radius: 50%; opacity: 0.8;">&nbsp;</span>
                            <span class="small text-dark">${linkifyText(n.text)}</span>
                          </div>
                        `).join('')
                      : '<span class="text-muted italic small opacity-50">No activity summaries available</span>';
                    
                    return `
                      <tr>
                        <td style="padding-left: 1.5rem;">
                          <a href="${escapeHtml(page['Page URL'] || '#')}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                            <div class="fw-bold text-primary" style="font-size: 0.9rem;">${escapeHtml(pTitle)}</div>
                            <div class="small text-muted text-truncate" style="max-width: 250px; font-size: 0.75rem;">${escapeHtml(page['Page URL'] || '')}</div>
                          </a>
                        </td>
                        <td>
                          <div class="small fw-medium">${pDate}</div>
                        </td>
                        <td style="padding-right: 1.5rem;">
                          <div class="py-2">
                            ${tagsHtml}
                            <div class="notes-container">${notesHtml}</div>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer bg-light p-2 text-center border-top-0">
              <small class="text-muted fw-bold" style="font-size: 0.7rem;">Total Migrated Items in Site Cluster: ${site.pages.length}</small>
          </div>
        </div>
      </div>
    `;
    container.appendChild(siteCard);
  });

  // Updated CSS for the site-centric insights
  if (!document.getElementById('migration-insights-css')) {
    const css = `
      .site-insight-card .card { border-radius: 10px; border: 1px solid #e0e0e0; }
      .site-insight-card .card-header { background: #212529 !important; border-bottom: none; border-radius: 10px 10px 0 0; }
      .site-insight-card .card-header .btn { border-radius: 0; box-shadow: none !important; }
      .site-insight-card .collapse-trigger::after {
        content: '\\25BC';
        font-size: 0.7rem;
        transition: transform 0.3s;
        opacity: 0.5;
        margin-left: 1rem;
        margin-top: 0.5rem;
      }
      .site-insight-card .collapse-trigger:not(.collapsed)::after {
        transform: rotate(-180deg);
      }
      .site-insight-card .table th { background: #f8f9fa; color: #6c757d; font-size: 0.7rem; border-bottom: 1px solid #dee2e6; letter-spacing: 0.05em; }
      .site-insight-card .table td { border-bottom: 1px solid #f2f2f2; padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .site-insight-card .text-primary { color: #004a99 !important; }
      .notes-line { line-height: 1.4; }
      .notes-container { max-height: 150px; overflow-y: auto; scrollbar-width: thin; }
      .site-insight-card .badge { border-radius: 4px; font-weight: 500; }
    `;
    const style = document.createElement('style');
    style.id = 'migration-insights-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
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

  // Render Migration Insights
  try { renderMigrationInsights(getFilteredData()); } catch(e){ console.warn('renderMigrationInsights failed', e); }

  // Update Page Details badge with current filtered count
  try{
    const badge = document.getElementById('pageDetailsBadge');
    if (badge) badge.textContent = String(getFilteredData().length || 0);
  }catch(e){}
}

/* Migration Dates module: activity heatmap (fast, day-by-day) + Agenda (grouped list).
   Both the top "View Calendar" button and the inline one in Migration Tool Insights call
   the same openMigrationCalendarModal(), which always builds fresh data from the current
   dashboard filters — previously these were two inconsistent paths (one could open on
   stale/sample data), and the old FullCalendar month-grid rendered a DOM event per page,
   which got slow once locations (not just divisions) started migrating. */
(function(){
  let migrationData = [];
  let selectedDay = null; // 'YYYY-MM-DD' (local) or null — set by clicking a heatmap day
  const E_TZ = 'America/New_York';

  // Parse a date value for display in the configured timezone.
  // If the value is a date-only string (YYYY-MM-DD) treat it as that calendar day
  // by creating a UTC-noon instant so timezone conversions won't push it to the previous day.
  function parseDateForDisplay(v){
    if (!v) return null;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)){
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

  // Resolve a row's best-guess migration date string: Migration Date -> Last Migrated ->
  // Last Migration -> a date found inside Migration Notes.
  // Delegates to the shared resolveMigrationDateStr() (top of file), which skips
  // redirect-verification stamps so they don't get mistaken for the actual migration date.
  const resolveDateStr = resolveMigrationDateStr;

  // Local (browser-timezone) YYYY-MM-DD key for grouping into heatmap day cells.
  function localDayKey(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function buildAgendaHTML(data){
    if (!data.length) {
      const empty = document.createElement('div');
      empty.className = 'text-muted small';
      empty.textContent = selectedDay ? 'No pages migrated on this day.' : 'No migration data available.';
      return empty;
    }
    const DONE_NO_DATE = 'Migrated — date not recorded';
    const NOT_MIGRATED = 'Not yet migrated';

    const groups = data.reduce((acc,row)=>{
      const raw = resolveDateStr(row);
      const pd = parseDateForDisplay(raw);
      let key;
      if (pd) {
        key = pd.toLocaleString('en-US',{year:'numeric',month:'long', timeZone: E_TZ});
      } else {
        // A page that's already done but carries no migration date isn't "unscheduled" —
        // it's migrated, we just don't have the date. Keep those separate from work that
        // genuinely hasn't happened yet. (Its redirect-verification stamp, when present,
        // is shown as a "Verified" date rather than passed off as a migration date.)
        key = row._isCompleted ? DONE_NO_DATE : NOT_MIGRATED;
      }
      (acc[key]=acc[key]||[]).push({ ...row, _displayDate: raw });
      return acc;
    },{});

    const keys = Object.keys(groups).sort((a,b)=>{
      const rank = (k) => k === DONE_NO_DATE ? 1 : k === NOT_MIGRATED ? 2 : 0;
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (rank(a) !== 0) return 0;
      // Most recent month first, matching the day-level ordering inside each month.
      const da = new Date(groups[a][0]._displayDate);
      const db = new Date(groups[b][0]._displayDate);
      return db - da;
    });

    const container = document.createElement('div');
    container.className = 'migration-agenda';

    const rowItem = (r) => {
      const url = r['View Website URL'] || r.viewUrl || r.viewWebsiteUrl || '';
      let item;
      if (url) {
        item = document.createElement('a');
        item.href = url;
        item.target = '_blank';
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
      } else {
        item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-start';
      }
      const title = (r['Page Title'] && r['Site Title']) ? `${r['Page Title']} - ${r['Site Title']}` : (r['Page Title'] || r['Site Title'] || '(No Title)');
      const left = document.createElement('div');
      left.innerHTML = '<div class="fw-bold">' + escapeHtml(title) + '</div>' + (r['Division'] ? '<small class="text-muted">' + escapeHtml(r['Division']) + '</small>' : '');
      const right = document.createElement('div');
      right.className = 'text-end';
      right.innerHTML = '<div>' + formatDateISO(r._displayDate) + '</div>' + (url ? '<div><small class="text-primary">Visit</small></div>' : '');
      item.appendChild(left); item.appendChild(right);
      return item;
    };

    keys.forEach(k=>{
      const section = document.createElement('div');
      section.className = 'agenda-group';

      // The dateless buckets can hold thousands of pages — collapse them into one
      // accordion per site title instead of a flat wall of rows.
      if (k === DONE_NO_DATE || k === NOT_MIGRATED) {
        section.classList.add('agenda-group');
        const bySite = {};
        groups[k].forEach(r => {
          const site = (r['Site Title'] || '(No Site Title)').toString().trim() || '(No Site Title)';
          (bySite[site] = bySite[site] || []).push(r);
        });
        const siteNames = Object.keys(bySite).sort((a, b) => a.localeCompare(b));
        const accId = `unscheduledAcc_${Math.random().toString(36).slice(2, 8)}`;

        // Spell out what each dateless bucket actually is — "two groups of unscheduled"
        // with no explanation isn't readable.
        const explain = k === DONE_NO_DATE
          ? 'These pages are already migrated or redirected, but the source list has no migration date recorded for them.'
          : 'These pages have not been migrated yet. Do Not Migrate pages and pages never published in Symphony are excluded.';

        const h = document.createElement('h6');
        h.className = 'agenda-group-title';
        h.innerHTML = `${escapeHtml(k)} <span class="badge bg-secondary ms-1">${groups[k].length}</span>`;
        section.appendChild(h);

        const explainEl = document.createElement('div');
        explainEl.className = 'agenda-group-explain';
        explainEl.textContent = `${explain} Grouped by site.`;
        section.appendChild(explainEl);

        const acc = document.createElement('div');
        acc.className = 'accordion accordion-flush';
        acc.id = accId;

        siteNames.forEach((site, idx) => {
          const safeId = `${accId}_${idx}`;
          const item = document.createElement('div');
          item.className = 'accordion-item';
          item.innerHTML = `
            <h2 class="accordion-header" id="heading_${safeId}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                      data-bs-target="#collapse_${safeId}" aria-expanded="false" aria-controls="collapse_${safeId}">
                ${escapeHtml(site)} <span class="badge bg-warning text-dark ms-2">${bySite[site].length}</span>
              </button>
            </h2>
            <div id="collapse_${safeId}" class="accordion-collapse collapse" aria-labelledby="heading_${safeId}" data-bs-parent="#${accId}">
              <div class="accordion-body p-0"><div class="list-group list-group-flush"></div></div>
            </div>`;
          const list = item.querySelector('.list-group');
          bySite[site]
            .sort((a, b) => (a['Page Title'] || '').localeCompare(b['Page Title'] || ''))
            .forEach(r => list.appendChild(rowItem(r)));
          acc.appendChild(item);
        });

        section.appendChild(acc);
        container.appendChild(section);
        return;
      }

      // Dated months: one collapsed accordion per migration day inside the month, so a
      // month with hundreds of pages opens as a short list of days rather than a wall.
      const h = document.createElement('h6');
      h.className = 'agenda-group-title';
      h.innerHTML = `${escapeHtml(k)} <span class="badge bg-secondary ms-1">${groups[k].length}</span>`;
      section.appendChild(h);

      const byDay = {};
      groups[k].forEach(r => {
        const pd = parseDateForDisplay(r._displayDate);
        const dayKey = pd ? pd.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: E_TZ }) : 'Unknown date';
        const sortKey = pd ? pd.getTime() : 0;
        if (!byDay[dayKey]) byDay[dayKey] = { rows: [], sortKey };
        byDay[dayKey].rows.push(r);
      });

      const dayKeys = Object.keys(byDay).sort((a, b) => byDay[b].sortKey - byDay[a].sortKey);
      const accId = `dayAcc_${Math.random().toString(36).slice(2, 8)}`;
      const acc = document.createElement('div');
      acc.className = 'accordion accordion-flush';
      acc.id = accId;

      dayKeys.forEach((dayKey, idx) => {
        const safeId = `${accId}_${idx}`;
        const dayRows = byDay[dayKey].rows;
        const siteCount = new Set(dayRows.map(r => r['Site Title'] || '')).size;
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
          <h2 class="accordion-header" id="heading_${safeId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapse_${safeId}" aria-expanded="false" aria-controls="collapse_${safeId}">
              ${escapeHtml(dayKey)}
              <span class="badge bg-warning text-dark ms-2">${dayRows.length} page${dayRows.length === 1 ? '' : 's'}</span>
              <span class="badge bg-light text-dark border ms-2">${siteCount} site${siteCount === 1 ? '' : 's'}</span>
            </button>
          </h2>
          <div id="collapse_${safeId}" class="accordion-collapse collapse" aria-labelledby="heading_${safeId}" data-bs-parent="#${accId}">
            <div class="accordion-body p-0"><div class="list-group list-group-flush"></div></div>
          </div>`;
        const list = item.querySelector('.list-group');
        dayRows
          .sort((a, b) => (a['Site Title'] || '').localeCompare(b['Site Title'] || '') || (a['Page Title'] || '').localeCompare(b['Page Title'] || ''))
          .forEach(r => list.appendChild(rowItem(r)));
        acc.appendChild(item);
      });

      section.appendChild(acc);
      container.appendChild(section);
    });

    return container;
  }

  function renderAgenda(filtered){
    const el = document.getElementById('migrationAgenda'); if(!el) return;
    const data = selectedDay ? filtered.filter(r => {
      const dt = parseDateForDisplay(resolveDateStr(r));
      return dt && localDayKey(dt) === selectedDay;
    }) : filtered;
    el.innerHTML=''; el.appendChild(buildAgendaHTML(data));
  }

  // Fast activity heatmap (GitHub-style): one small colored cell per day, not one DOM
  // event per page — renders instantly even with thousands of migrated pages, unlike the
  // old FullCalendar month grid. Click a day to filter the agenda list below it.
  function renderHeatmap(data){
    const container = document.getElementById('migrationHeatmap');
    if (!container) return;

    const counts = {};
    let maxDate = null;
    (data || []).forEach(r => {
      const dt = parseDateForDisplay(resolveDateStr(r));
      if (!dt) return;
      const key = localDayKey(dt);
      counts[key] = (counts[key] || 0) + 1;
      if (!maxDate || dt > maxDate) maxDate = dt;
    });

    if (!maxDate) {
      container.innerHTML = '<div class="text-muted small">No migration dates available for the current results.</div>';
      return;
    }

    const WEEKS = 18;
    const today = new Date();
    const endRef = maxDate > today ? maxDate : today;
    const endOfWeek = new Date(endRef); endOfWeek.setDate(endRef.getDate() + (6 - endRef.getDay()));
    const startOfGrid = new Date(endOfWeek); startOfGrid.setDate(endOfWeek.getDate() - (WEEKS * 7 - 1));

    const maxCount = Math.max(1, ...Object.values(counts));
    const levelFor = (n) => { if (!n) return 0; const r = n / maxCount; return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1; };

    let colsHtml = '';
    let monthLabelsHtml = '';
    let lastMonthLabel = '';
    const cursor = new Date(startOfGrid);
    for (let w = 0; w < WEEKS; w++) {
      const weekStartLabel = cursor.toLocaleDateString('en-US', { month: 'short' });
      if (weekStartLabel !== lastMonthLabel) {
        monthLabelsHtml += `<div class="heatmap-month-label">${weekStartLabel}</div>`;
        lastMonthLabel = weekStartLabel;
      } else {
        monthLabelsHtml += `<div class="heatmap-month-label"></div>`;
      }

      let colHtml = '';
      for (let d = 0; d < 7; d++) {
        const key = localDayKey(cursor);
        const n = counts[key] || 0;
        const isFuture = cursor > today;
        const label = `${cursor.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}: ${n} page${n === 1 ? '' : 's'} migrated`;
        colHtml += `<div class="heatmap-cell level-${isFuture ? 0 : levelFor(n)}${selectedDay === key ? ' selected' : ''}" data-day-key="${key}" data-rich-tooltip="${escapeHtml(buildRichTooltipTextHtml(label))}"></div>`;
        cursor.setDate(cursor.getDate() + 1);
      }
      colsHtml += `<div class="heatmap-col">${colHtml}</div>`;
    }

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-1">
        <div class="small text-muted">Migration activity — click a day to filter the list below</div>
        ${selectedDay ? `<button type="button" id="heatmapClearDay" class="btn btn-sm btn-outline-secondary">Clear day filter</button>` : ''}
      </div>
      <div class="migration-heatmap-scroll">
        <div class="migration-heatmap-months">${monthLabelsHtml}</div>
        <div class="migration-heatmap">${colsHtml}</div>
      </div>
      <div class="d-flex align-items-center gap-1 mt-2 small text-muted">
        <span>Less</span>
        <span class="heatmap-cell level-0" style="display:inline-block;"></span>
        <span class="heatmap-cell level-1" style="display:inline-block;"></span>
        <span class="heatmap-cell level-2" style="display:inline-block;"></span>
        <span class="heatmap-cell level-3" style="display:inline-block;"></span>
        <span class="heatmap-cell level-4" style="display:inline-block;"></span>
        <span>More</span>
      </div>`;

    container.querySelectorAll('.heatmap-cell[data-day-key]').forEach(cell => {
      cell.addEventListener('click', () => {
        const key = cell.getAttribute('data-day-key');
        selectedDay = (selectedDay === key) ? null : key;
        renderHeatmap(migrationData);
        renderAgenda(migrationData);
      });
    });
    const clearBtn = document.getElementById('heatmapClearDay');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      selectedDay = null;
      renderHeatmap(migrationData);
      renderAgenda(migrationData);
    });
  }

  function filterMigrationData(q){
    if(!q) return migrationData.slice();
    const s = q.toLowerCase();
    return migrationData.filter(r=> (r['Site Title']||'').toLowerCase().includes(s) || (r['Division']||'').toLowerCase().includes(s));
  }

  // Single entry point for both "View Calendar" triggers: always builds fresh data from
  // the dashboard's current filters (never stale/sample data) and opens the modal.
  function openMigrationCalendarModal(){
    const currentResults = (typeof getFilteredData === 'function') ? getFilteredData() : [];
    const specificData = currentResults
      // Pages marked Do Not Migrate, or that were never published in Symphony, are not
      // pending work — they'd otherwise pad the "Not yet migrated" bucket with pages
      // nobody intends to migrate.
      .filter(r => {
        if (getCanonicalStatus(r.Status) === 'Do Not Migrate') return false;
        const pubSym = (r['Published Symphony'] || '').toString().trim().toLowerCase();
        if (pubSym === 'false' || pubSym === 'no' || pubSym === '0') return false;
        return true;
      })
      .map(r => {
        const canon = getCanonicalStatus(r.Status);
        return {
          'Site Title': getSiteGroupTitle(r),
          'Page Title': r['Page Title'] || r.Title || '',
          'Migration Date': resolveDateStr(r),
          'View Website URL': r['Page URL'] || r.MigrationURL || '',
          'Division': r['Division'] || '',
          _isCompleted: canon === 'Completed' || canon === 'THQ Redirect'
        };
      });
    window.setMigrationData(specificData);
    const modalEl = document.getElementById('migrationDatesModal');
    if (modalEl) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  window.setMigrationData = function(dataArray){
    if (!Array.isArray(dataArray)) return;
    migrationData = dataArray.map(r=>({
      'Site Title': r['Site Title'] || r.siteTitle || '',
      'Page Title': r['Page Title'] || r.pageTitle || '',
      'Migration Date': r['Migration Date'] || r.migrationDate || r.MigrationDate || '',
      'View Website URL': r['View Website URL'] || r.viewUrl || r.viewWebsiteUrl || '',
      'Division': r['Division'] || r.division || '',
      _isCompleted: !!r._isCompleted
    }));
    selectedDay = null;
    renderHeatmap(migrationData);
    renderAgenda(migrationData);
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    const search = document.getElementById('migrationSearch');
    const modal = document.getElementById('migrationDatesModal');
    const exportBtn = document.getElementById('exportMigrationJson');
    const topBtn = document.getElementById('migrationDatesLink');

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

    // Both "View Calendar" entry points (the one above Overall Progress, and the inline
    // one in Migration Tool Insights) now share one code path — see openMigrationCalendarModal().
    if (topBtn) topBtn.addEventListener('click', (e) => { e.preventDefault(); openMigrationCalendarModal(); });
    window.addEventListener('openMigrationCalendar', openMigrationCalendarModal);

    if (search) search.addEventListener('input', ()=>{
      const q = search.value.trim();
      const filtered = filterMigrationData(q);
      selectedDay = null;
      renderHeatmap(filtered);
      renderAgenda(filtered);
    });

    // Safety net: if the modal is ever shown some other way, re-render with whatever
    // data is currently loaded (respecting an active search) rather than doing nothing.
    if (modal) modal.addEventListener('shown.bs.modal', ()=>{
      const q = search && search.value ? search.value.trim() : '';
      const filtered = q ? filterMigrationData(q) : migrationData;
      renderHeatmap(filtered);
      renderAgenda(filtered);
    });

    if (exportBtn) exportBtn.addEventListener('click', function(e){ e.preventDefault(); const blob=new Blob([JSON.stringify(migrationData,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='migration-dates.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });
  });
})();

