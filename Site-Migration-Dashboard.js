/* Migration Dates module: FullCalendar (grid) + Agenda (list) + Table (Tabulator) */
const _migrationSampleData = [
  { "Site Title": "USA National Homepage", "Migration Date": "2025-04-03", "View Website URL": "https://www.salvationarmyusa.org/", "Division": "USA National" },
  { "Site Title": "USA Southern Territory", "Migration Date": "2025-05-08", "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/", "Division": "USA Southern Territory" },
  { "Site Title": "North and South Carolina", "Migration Date": "2025-08-21", "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/north-and-south-carolina/", "Division": "North and South Carolina" },
  { "Site Title": "Potomac", "Migration Date": "2025-09-05", "View Website URL": "https://www.salvationarmyusa.org/usa-southern-territory/potomac/", "Division": "Potomac" },
  { "Site Title": "Kentucky and Tennessee", "Migration Date": "", "View Website URL": "", "Division": "Kentucky and Tennessee" },
  { "Site Title": "Alabama, Louisiana, and Mississippi", "Migration Date": "", "View Website URL": "", "Division": "Alabama, Louisiana, and Mississippi" },
  { "Site Title": "Texas", "Migration Date": "", "View Website URL": "", "Division": "Texas" },
  { "Site Title": "Arkansas and Oklahoma", "Migration Date": "", "View Website URL": "", "Division": "Arkansas and Oklahoma" },
  { "Site Title": "Florida", "Migration Date": "", "View Website URL": "", "Division": "Florida" },
  { "Site Title": "Georgia", "Migration Date": "", "View Website URL": "", "Division": "Georgia" }
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

// If sample migration data is defined, try to populate the views via the public API
if (typeof _migrationSampleData !== 'undefined' && Array.isArray(_migrationSampleData)){
  const applySample = () => {
    if (typeof window.setMigrationData === 'function'){
      try { window.setMigrationData(_migrationSampleData); return true; } catch(e){ console.warn('setMigrationData threw', e); }
    }
    return false;
  };

  if (!applySample()){
    // Retry a couple times in case module registers after this script runs
    setTimeout(()=>{ if (!applySample()) setTimeout(applySample, 500); }, 200);
  }
}

// Backup Data URL https://cdn.jsdelivr.net/gh/ussthq-web-coordinator/USSTHQ-1@latest/DashboardData.json

const jsonURL = "https://hopewell.pages.dev/DashboardData.json";

// Globals used across the dashboard version number
let table;
let tableData = [];
let pageCache = {};
let qaGroupedCache = {};
let priorityChart, pageTypeChart, pubSymChart;
let statusChart = null;

async function fetchData() {
  try {
    const res = await fetch(jsonURL);
    if(!res.ok) throw new Error('Unable to load JSON data');
    const json = await res.json();
    tableData = Array.isArray(json) ? json : (json.data || []);
    const refreshUTC = json.refreshDate ? new Date(json.refreshDate) : null;
    const refreshEl = document.getElementById("refreshDate");
    if (refreshEl) {
      refreshEl.textContent = refreshUTC ? "Version 1.9300620 - Last refreshed (Eastern): " + refreshUTC.toLocaleString("en-US",{ timeZone:"America/New_York", dateStyle:"medium", timeStyle:"short"}) : "Last refreshed: Unknown";
    }
    pageCache = {}; tableData.forEach((d,i)=>{d._id=i; pageCache[i]=d;});
    initFilters(); renderCards(); renderTable();
  } catch(err) {
    document.body.innerHTML = `<div class="alert alert-danger m-3">Error loading dashboard: ${err.message}</div>`;
    console.error(err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

function normalizeStatus(status){
  return (status || "").toString().trim();
}

// canonical mapping
function getCanonicalStatus(status) {
  status = (status||"").trim();
  if (/^(4|5)/.test(status)) return "Completed";
  if (status === "Do Not Migrate") return "Do Not Migrate";
  if (/^2/.test(status)) return "In Progress";       // 2a/2b/2c
  if (/^3[a-c]/.test(status)) return "In QA";       // 3a/3b/3c
  if (/^1/.test(status)) return "Needs Info";
  return "Unknown";
}


// status colors Old Blue 3B50B2
const statusColors = {
    "Completed": "#2ecc71",
    "Do Not Migrate": "#e74c3c",
    "In Progress": "#f39c12",
    "In QA": "#CA5010",
    "Needs Info": "#002056",
    "Unknown": "#7f8c8d"
};




const chartOptions = {
  plugins: {
    legend: {
      display: false, // hide the legend on the chart itself
    },
    tooltip: {
      enabled: true,
    }
  }
};



function addChartLegendModal(chart, chartTitle) {
  if (!chart || !chart.canvas) return;
  const container = chart.canvas.parentNode;
  if (!container) return;

  // Only show legend on explicit user click/tap (not on hover or scroll)
  container.addEventListener('click', (e) => {
    try {
      if (!chart || typeof chart.generateLegend !== 'function') return;
      const legendHtml = chart.generateLegend();
      if (!legendHtml || String(legendHtml).trim() === '') return;
      showLegendModal(chart, chartTitle);
    } catch (err) {
      console.warn('Failed to check/generate chart legend', err);
    }
  }, { passive: true });
}

function showLegendModal(chart, title) {
  if (!chart || typeof chart.generateLegend !== 'function') return;
  const legendHtml = chart.generateLegend();
  if (!legendHtml || String(legendHtml).trim() === '') return; // nothing to show

  const titleEl = document.getElementById("chartLegendTitle");
  const bodyEl = document.getElementById("chartLegendBody");
  const modalEl = document.getElementById("chartLegendModal");
  if (!titleEl || !bodyEl || !modalEl) {
    console.warn('Chart legend modal elements missing');
    return;
  }
  titleEl.innerText = title;
  bodyEl.innerHTML = legendHtml;
  try { new bootstrap.Modal(modalEl).show(); } catch(e) { console.warn('bootstrap.Modal not available or failed to show legend modal', e); }
}


function initFilters(){
  const filterIds = ["filterDivision","filterAC","filterStatus","filterPageType","filterPubSym","filterSymType"];

  filterIds.forEach(id=>{
    const sel = document.getElementById(id);
    if (sel) sel.addEventListener("change", debounce(updateFiltersAndDashboard, 150));
  });

  updateFiltersOptions();
}

// Safe helper to read select values when an element may be missing
function getSelectValue(id){
  const el = document.getElementById(id);
  return el ? el.value : "";
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

// 1. Adjust label for display only
function adjustLabel(rawValue) {
  if (!rawValue) return "Not Set";

  // LOC titles: remove "INTLAPP_WM_LOC_USS_" but leave rest intact
  if (rawValue.startsWith("INTLAPP_WM_LOC_USS_")) {
    return rawValue.replace("INTLAPP_WM_LOC_USS_", "");
  }

  // DIV titles: reduce "INTLAPP_WM_DIV_USS_XXX" -> "XXX"
  if (rawValue.startsWith("INTLAPP_WM_DIV_USS_")) {
    return rawValue.replace("INTLAPP_WM_DIV_USS_", "");
  }

  // fallback
  return rawValue;
}

// 2. Your filter mappings (unchanged: these are real values for filtering)
const filterMapping = {
  filterDivision: d => d.Division || "Not Set",
  filterAC: d => d["Area Command Admin Group.title"] || "Not Set",
  filterStatus: d => d.Status || "Not Set",
  filterPageType: d => d["Page Type"] || "Not Set",
  filterPubSym: d => d["Published Symphony"] || "Not Set",
  filterSymType: d => d["Symphony Site Type"] || "Not Set"
};

// 3. When building dropdown options, apply `adjustLabel`
function updateFiltersOptions() {
  const selected = {
    filterDivision: getSelectValue("filterDivision"),
    filterAC: getSelectValue("filterAC"),
    filterStatus: getSelectValue("filterStatus"),
    filterPageType: getSelectValue("filterPageType"),
    filterPubSym: getSelectValue("filterPubSym"),
    filterSymType: getSelectValue("filterSymType")
  };

  // For each filter, compute available values based on OTHER selected filters
  Object.keys(filterMapping).forEach(filterId => {
    const dropdown = document.getElementById(filterId);
    if (!dropdown) return;

    // Build otherFilters (exclude current filter)
    const otherSelected = { ...selected };
    delete otherSelected[filterId];

    // Filter tableData by otherSelected values
    const filteredData = tableData.filter(d => {
      return Object.keys(otherSelected).every(fId => {
        const val = otherSelected[fId];
        if (!val) return true; // no constraint
        const fieldFn = filterMapping[fId];
        return fieldFn(d) === val;
      });
    });

    // Extract unique values for this filter
    let values = [...new Set(filteredData.map(filterMapping[filterId]))];

    // Sort by adjusted label for filterAC, otherwise by raw string
    if (filterId === 'filterAC') {
      values = values.sort((a, b) => adjustLabel(String(a)).localeCompare(adjustLabel(String(b)), undefined, { sensitivity: 'base' }));
    } else {
      values = values.sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));
    }

    // Preserve current selection if still available; if not, keep it as an unavailable option
    const currentValue = selected[filterId];

    let optionsHtml = "<option value=''>All</option>" + values.map(v => {
      const label = adjustLabel(v);
      return `<option value="${v}" ${currentValue === v ? 'selected' : ''}>${label}</option>`;
    }).join("");

    if (currentValue && !values.includes(currentValue)) {
      // Add the unavailable current value (marked) so user's selection doesn't vanish
      const label = adjustLabel(currentValue);
      optionsHtml += `<option value="${currentValue}" selected>${label} (Unavailable)</option>`;
    }

    dropdown.innerHTML = optionsHtml;
    try {
      // Try to preserve selection explicitly (some browsers reset value when innerHTML changes)
      if (currentValue) dropdown.value = currentValue;
      else dropdown.value = "";
    } catch(e) {
      // ignore if setting value fails for any reason
    }
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

  return tableData.filter(d => 
    (!div || d.Division===div) &&
    (!ac || d["Area Command Admin Group.title"]===ac) &&
    (!status || d.Status===status) &&
    (!pageType || d["Page Type"]===pageType) &&
    (!pubSym || d["Published Symphony"]===pubSym) &&
    (!symType || d["Symphony Site Type"]===symType)
  );
}

    // Change order of overall progress legend
function renderOverallProgress(filtered){
  if (!Array.isArray(filtered)) return;
  const total = filtered.length;
  const counts = { "Do Not Migrate":0, "Needs Info":0, "In Progress":0, "In QA":0, Unknown:0, Completed:0,};
  
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

  Object.keys(counts).forEach(key=>{
    const pct = total ? (counts[key]/total*100) : 0; // use float, not rounded
    if(counts[key] > 0){  // render all non-zero counts
      const div = document.createElement("div");
      div.className = "progress-bar";
      div.style.width = pct + "%";
      div.style.backgroundColor = statusColors[key];
      div.style.display="flex";
      div.style.alignItems="center";
      div.style.justifyContent="center";
      div.innerText = `${Math.round(pct)}% (${counts[key]})`;
      container.appendChild(div);

      // Add legend
      // Add legend
    const legendItem = document.createElement("div");
    legendItem.className = "d-flex align-items-center gap-1 legend-item";
    legendItem.innerHTML =
    `<span style="display:inline-block;width:14px;height:14px;background-color:${statusColors[key]};"></span>
    ${key} – ${Math.round(pct)}% (${counts[key]})`;
    legendContainer.appendChild(legendItem);

    }
  });
}

function formatAcDisplay(title) {
  if (!title) return "Not Set";

  // Case 1: Division codes (INTLAPP_WM_DIV_USS_XXX)
  if (title.startsWith("INTLAPP_WM_DIV_USS_")) {
    return title.replace("INTLAPP_WM_DIV_USS_", "");
  }

  // Case 2: Location codes (INTLAPP_WM_LOC_USS_XXX ...)
  if (title.startsWith("INTLAPP_WM_LOC_USS_")) {
    // remove INTLAPP_WM_LOC_USS_ and keep the rest
    return title.replace("INTLAPP_WM_LOC_USS_", "");
  }

  // Default: return as-is
  return title;
}

function updateACDropdown(filteredData) {
  const sel = document.getElementById("filterAC");
  if (!sel) return;

  const options = [...new Set(filteredData.map(d => d["Area Command Admin Group.title"]))].sort();

  sel.innerHTML = "<option value=''>All</option>" + options.map(o => {
    const displayText = formatAcDisplay(o); // formatted for dropdown
    return `<option value="${o}">${displayText}</option>`; // keep original value
  }).join("");
}


function renderQaAccordion(data){
  const container = document.getElementById("qaGroupsBody");
  if (!container) return;
  container.innerHTML = "";
  const qaRows = Array.isArray(data) ? data.filter(d=>d["QA Issues.lookupValue"]) : [];

  // Update badge with total count
  const badge = document.getElementById("qaBadge");
  if (badge) badge.textContent = qaRows.length;

  if(!qaRows.length){
    container.innerHTML = "<p>No QA Issues found.</p>";
    return;
  }

  qaGroupedCache={};
  qaRows.forEach(d=>{
    const key=d["QA Issues.lookupValue"];
    qaGroupedCache[key]=qaGroupedCache[key]||[];
    qaGroupedCache[key].push(d._id);
  });

  Object.keys(qaGroupedCache).sort().forEach(k=>{
    container.innerHTML += `
      <div class="mb-2">
        <button class="btn btn-sm btn-secondary ms-2" onclick="showQaIssuesModal('${k}')">View Pages</button>&nbsp;&nbsp;
        ${k} <strong>(${qaGroupedCache[k].length})</strong>
      </div>`;
  });
}



function renderCards(){
  const filtered = getFilteredData();
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth()-1, today.getDate());
  renderOverallProgress(filtered);


    // --- replace the metrics object ---
const metrics = {
  "Migration Progress": (() => {
      const total = filtered.length;
      const completed = filtered.filter(d => ["4","5"].some(s => d.Status?.trim().startsWith(s))).length;
      const doNotMigrate = filtered.filter(d => d.Status?.trim() === "Do Not Migrate").length;
      const progressCount = completed + doNotMigrate;
      const progressPct = total > 0 ? Math.round((progressCount / total) * 100) : 0;
      return `${progressPct}% (${progressCount} of ${total} Total Pages)`;
  })(),

  "Completed": filtered.filter(d => ["4","5"].some(s => d.Status?.trim().startsWith(s))).length,
  "Do Not Migrate": filtered.filter(d => d.Status?.trim() === "Do Not Migrate").length,

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
} else if (/^1/.test(s)) {
  s = "Needs Info";
} else if (/^3[a-c]/.test(s)) {
  s = "In QA";
} else if (s === "Needs Info") {
  s = "Needs Info";
} else {
  s = "Unknown";
}


  statusCounts[s] = (statusCounts[s] || 0) + 1;
});

  // Status chart
// Map of status to color
const statusColors = {
  "Do Not Migrate": "#dc3545", // red
  "Completed": "#28a745",      // green
  "In QA": "#fd7e14",          // orange 
  "Needs Info": "#002056",     // navy/
  "In Progress": "#6f42c1",    // purple
  "Unknown": "#6c757d"         // gray
};

// Prepare data for chart
const labels = Object.keys(statusCounts);
const data = Object.values(statusCounts);
const backgroundColor = labels.map(label => statusColors[label] || "#6c757d"); // fallback gray

// Status chart
if(statusChart) statusChart.destroy();
statusChart = new Chart(ctxStatus, {
  type: "pie",
  data: {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: backgroundColor
    }]
  },
  options: {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
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
        data: Object.values(priorityCounts),
        backgroundColor: ["#002056","#f1c40f","#f39c12","#e74c3c","#3498db","#9b59b6","#16a085","#d35400","#ff6b6b"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
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
        data: Object.values(pageTypeCounts),
        backgroundColor: ["#002056","#2ecc71","#e74c3c","#f39c12","#3498db"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
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
        data:Object.values(pubSymCounts),
        backgroundColor:["#002056","#e74c3c","#f39c12","#3498db","#9b59b6"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
      try{ addChartLegendModal(pubSymChart, 'Published Symphony'); }catch(e){}
}

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
  container.innerHTML="<button id='toggleHiddenGroups' class='btn btn-sm btn-secondary mb-2'>Show 0% Groups</button>";

  const groups = [
    {name:"Division", field:"Division"},
    {name:"Page Type", field:"Page Type"},
    {name:"Site Type", field:"Symphony Site Type"},
    {name:"Area Command", field:"Area Command Admin Group.title"}
  ];

  groups.forEach(g=>{
    const grouped={};
    data.forEach(d=>{
      let val = d[g.field] || "Not Set";
      grouped[val] = grouped[val] || {total:0, done:0, donot:0};
      grouped[val].total++;
      if(["4","5"].some(s=>d.Status?.startsWith(s))) grouped[val].done++;
      if(d.Status==="Do Not Migrate") grouped[val].donot++;
    });

    container.innerHTML += `<h3 class="mt-3">${g.name}</h3>`;
    Object.keys(grouped).sort().forEach(k=>{
      const total = grouped[k].total;
      const prog = total ? Math.round((grouped[k].done + grouped[k].donot)/total*100) : 0;
      const hiddenClass = prog===0?"hidden-group":""; 
      const colorClass = prog<40?"bg-danger":prog<70?"bg-warning":"bg-success";
      container.innerHTML += `<div class="mb-1 ${hiddenClass}" style="display:${hiddenClass?'none':'block'}">
        <strong>${k}</strong>
        <div class="progress">
          <div class="progress-bar ${colorClass}" style="width:${prog}%">${prog}%</div>
        </div>
      </div>`;
    });
  });

  document.getElementById("toggleHiddenGroups").onclick=()=> {
    const hiddenElems = container.querySelectorAll(".hidden-group");
    hiddenElems.forEach(e=>e.style.display=e.style.display==="none"?"block":"none");
    document.getElementById("toggleHiddenGroups").innerText = hiddenElems[0].style.display==="block"?"Hide 0% Groups":"Show 0% Groups";
  };
}

// Table rendering
function renderTable(){
  if(table) table.destroy();
  const filtered = getFilteredData();
  table = new Tabulator("#tableContainer",{
    data: filtered,
    layout:"fitDataStretch",
    responsiveLayout:"collapse",
    initialSort: [              
        { column: "Title", dir: "asc" },
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


      {title:"SD", field:"Page URL", formatter:cell=>cell.getValue()?`<a href="${cell.getValue()}" target="_blank">&#128279;</a>`:""},
      {title:"ZD", field:"Zesty URL Path Part", formatter:cell=>cell.getValue()?`<a href="https://8hxvw8tw-dev.webengine.zesty.io${cell.getValue()}?zpw=tsasecret123&redirect=false&_bypassError=true" target="_blank">&#128279;</a>`:""},
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
      {title:"Modified", field:"Modified"},
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
}

// Make sure masterData references tableData
const masterData = [...tableData];

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
  if(page) showTableModal(page);
}

function showTableModal(page){
  const titleEl = document.getElementById("tableModalTitle");
  const bodyEl = document.getElementById("tableModalBody");
  const modalEl = document.getElementById('tableDetailModal');
  if (!titleEl || !bodyEl) {
    console.warn('Table modal elements missing');
    return;
  }

  titleEl.innerText = page.Title;

  let html = '<table class="table table-bordered">';

  // --- Form link ---
  const type = (page["Symphony Site Type"] || "").trim();
  let formUrl = "#";
  if(type === "Metro Area") 
      formUrl = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${page.ID}&e=mY8mhG`;
  else if(type === "Corps") 
      formUrl = `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${page.ID}&e=dF11LG`;
  
  html += `<tr><th>Form</th><td><a href="${formUrl}" target="_blank">Edit Form</a></td></tr>`;

  // --- Other fields ---
  for(const k in page){
    let val = page[k];
    if(k==="Page URL" && val) 
        val = `<a href="${val}" target="_blank">${val}</a>`;
    if(k==="Zesty URL Path Part" && val) 
        val = `<a href="https://8hxvw8tw-dev.webengine.zesty.io${val}?zpw=tsasecret123&redirect=false&_bypassError=true" target="_blank">${val}</a>`;
    if(k==="Zesty Content Mobile Editor Path" && val) 
        val = `<a href="${val}" target="_blank">${val}</a>`;
    if(k==="Migration URL" && val) 
        val = `<a href="${val}" target="_blank">${val}</a>`;

    html += `<tr><th>${k}</th><td>${val}</td></tr>`;
  }

  html += "</table>";
  bodyEl.innerHTML = html;
  if (modalEl) {
    try { new bootstrap.Modal(modalEl).show(); } catch(e) { console.warn('bootstrap.Modal not available or failed to show table detail modal', e); }
  }
}


// --- QA Modal: now a responsive table with SD/ZD icons and clickable title ---
function showQaIssuesModal(groupKey){
  const ids = qaGroupedCache[groupKey] || [];
  const modalBody = document.getElementById("qaIssuesModalBody");
  const modalEl = document.getElementById("qaIssuesModal");
  if (!modalBody) {
    console.warn('qaIssuesModalBody missing');
    return;
  }

  if (ids.length === 0) {
    modalBody.innerHTML = "<p>No pages in this group.</p>";
    return;
  }

  let html = `
  <div class="mb-2"><strong>Issue: </strong><p style="font-size: 1rem;">${groupKey}</p></div>
    <div class="table-responsive">
      <table class="table table-sm table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th>Title</th>
            <th class="text-center">Edit</th>
            <th class="text-center">SD</th>
            <th class="text-center">ZD</th>
            <th>Status</th>
            <th>Priority</th>
            <th>QA Notes</th>
          </tr>
        </thead>
        <tbody>
  `;

  let whyImportant = "";
  let howToFix = "";
  let howToFixDetails = "";

  ids.forEach(id => {
    const p = pageCache[id];
    const sdLink = p["Page URL"]
      ? `<a href="${p["Page URL"]}" target="_blank" title="Site Link">🔗</a>` : "";
    const zdLink = p["Zesty URL Path Part"]
      ? `<a href="https://8hxvw8tw-dev.webengine.zesty.io${p["Zesty URL Path Part"]}?zpw=tsasecret123&redirect=false&_bypassError=true"
           target="_blank" title="Zesty Preview">🟢</a>` : "";

    const type = (p["Symphony Site Type"] || "").trim();
    let formLink = "-";
    if(type==="Metro Area") formLink = `<a href="https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${p.ID}&e=mY8mhG" target="_blank">Form</a>`;
    else if(type==="Corps") formLink = `<a href="https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${p.ID}&e=dF11LG" target="_blank">Form</a>`;

    html += `
      <tr>
      <td>${p.Title}</a></td>  
      <td class="text-center">${formLink}</td>
        <td class="text-center">${sdLink}</td>
        <td class="text-center">${zdLink}</td>
        <td>${p.Status || "N/A"}</td>
        <td>${p.Priority || "N/A"}</td>
        <td>${p["QA Notes"] || ""}</td>
      </tr>
    `;

  // capture first non-empty value only
    if (!whyImportant && p["QA Issues:Why This Is Important"]) {
      whyImportant = p["QA Issues:Why This Is Important"];
    }
    if (!howToFix && p["QA Issues:How to Fix"]) {
      howToFix = p["QA Issues:How to Fix"];
    }
    if (!howToFixDetails && p["QA Issues:How to Fix Details"]) {
      howToFixDetails = p["QA Issues:How to Fix Details"];
    }
  });

  html += "</tbody></table></div>";

  // add headings/values under the table
  if (whyImportant) {
    html += `<div class="mt-3"><h5>Why Fixing This Is Important</h5><p>${whyImportant}</p></div>`;
  }
  if (howToFix) {
    html += `<div class="mt-3"><h5>How to Fix This Issue</h5><p>${howToFix}</p></div>`;
  }
  if (howToFixDetails) {
    html += `<div class="mt-3"><h6>How to Fix Details</h6><p>${howToFixDetails}</p></div>`;
  }

  modalBody.innerHTML = html;
  if (modalEl) {
    try { new bootstrap.Modal(modalEl).show(); } catch(e) { console.warn('bootstrap.Modal not available or failed', e); }
  } else {
    console.warn('qaIssuesModal element missing');
  }
}

// Delegated handler for QA title links (works when rows are added dynamically)
document.addEventListener('click', function (e) {
  const link = e.target.closest && e.target.closest('.qaTitleLink');
  if (!link) return;
  e.preventDefault();
  const rowId = link.dataset && (link.dataset.id || link.dataset.rowid);
  if (!rowId) return console.warn('qaTitleLink clicked but no data-id found');

  // Prefer pageCache lookup (we populate _id on fetch)
  const page = pageCache[rowId];
  if (page) return showTableModal(page);

  // fallback: if there is a table and Tabulator row, try to find by ID
  if (table && typeof table.getData === 'function') {
    const found = table.getData().find(r => String(r._id) === String(rowId) || String(r.ID) === String(rowId));
    if (found) return showTableModal(found);
  }

  console.warn('No page found for qaTitleLink id', rowId);
});


// Function to show all QA issues in the modal
function showAllQaIssues() {
    const tbody = document.querySelector("#allQaTable tbody");
    tbody.innerHTML = "";

    // ✅ Get currently filtered data first
    const filteredData = getFilteredData();

    // Filter QA issues within the filtered dataset
    const allQaIssuesFiltered = filteredData.filter(p => p["QA Issues.lookupValue"]);

    // Build table rows
    allQaIssuesFiltered.forEach(p => {
        const tr = document.createElement("tr");
        const type = (p["Symphony Site Type"] || "").trim();
        const formLink = type === "Metro Area"
            ? `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/MetroAreaSitesInfoPagesSymphony/DispForm.aspx?ID=${p.ID}&e=mY8mhG`
            : type === "Corps"
                ? `https://sauss.sharepoint.com/sites/USSWEBADM/Lists/CorpsSitesPageMigrationReport/DispForm.aspx?ID=${p.ID}&e=dF11LG`
                : "#";

        const sdLink = p["Page URL"] || "#";
        const zdLink = p["Zesty URL Path Part"]
            ? `https://8hxvw8tw-dev.webengine.zesty.io${p["Zesty URL Path Part"]}?zpw=tsasecret123&redirect=false&_bypassError=true`
            : "#";

        tr.innerHTML = `
            <td>${p.Title}</td>
            <td><a href="${formLink}" target="_blank">Form</a></td>
            <td class="text-center"><a href="${sdLink}" target="_blank">Live</a></td>
            <td class="text-center"><a href="${zdLink}" target="_blank">Zesty</a></td>
            <td>${p.Status || ""}</td>
            <td>${p.Priority || ""}</td>
            <td>${p["QA Notes"] || ""}</td>
            <td>${p["QA Issues.lookupValue"]}</td>
            <td>${p["QA Issues:Why This Is Important"]}</td>
            <td>${p["QA Issues:How to Fix"]}</td>
            <td>${p["QA Issues:How to Fix Details"]}</td>
        `;
        tbody.appendChild(tr);
    });

    // Show modal
    const modalEl = document.getElementById('allQaModal');
    new bootstrap.Modal(modalEl).show();
}


// Attach handler
const viewAllQaBtn = document.getElementById("viewAllQaBtn");
if (viewAllQaBtn) viewAllQaBtn.addEventListener("click", showAllQaIssues);









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
function updateDashboard(){
  renderCards();
  renderTable();
  renderCharts(getFilteredData());
  renderOverallProgress(getFilteredData());
}

/* Migration Dates module: FullCalendar (grid) + Agenda (list) + Table (Tabulator) */
(function(){
  let migrationData = [];
  let fullCalendar = null;

  function formatDateISO(d){
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toLocaleDateString();
  }

  function toEvent(r){
    return {
      title: r['Site Title'] || r.siteTitle || '(No Title)',
      start: r['Migration Date'] || r.migrationDate || r.MigrationDate || null,
      url: r['View Website URL'] || r.viewUrl || r.viewWebsiteUrl || null,
      extendedProps: { division: r['Division'] || r.division || '' }
    };
  }

  function buildAgendaHTML(data){
    const groups = data.reduce((acc,row)=>{
      const key = row['Migration Date'] ? new Date(row['Migration Date']).toLocaleString(undefined,{year:'numeric',month:'long'}) : 'Unscheduled';
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
        const item = document.createElement('a');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
        item.href = r['View Website URL'] || '#'; item.target = '_blank';
        const left = document.createElement('div'); left.innerHTML = '<div class="fw-bold">'+(r['Site Title']||'(No Title)')+'</div>'+(r['Division']?'<small class="text-muted">'+r['Division']+'</small>':'');
        const right = document.createElement('div'); right.className='text-end'; right.innerHTML = '<div>'+formatDateISO(r['Migration Date'])+'</div>'+(r['View Website URL']?'<div><small class="text-primary">Visit</small></div>':'');
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

  function refreshFullCalendar(){
    const el = document.getElementById('migrationFullCalendar'); if(!el || typeof FullCalendar==='undefined') return;
    const events = migrationData.filter(r=>r['Migration Date']).map(toEvent);
    if (!fullCalendar){
      fullCalendar = new FullCalendar.Calendar(el,{
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },
        navLinks: true,
        events: events,
        eventClick: function(info){ if(info.event.url){ info.jsEvent.preventDefault(); window.open(info.event.url,'_blank'); } },
        height: 'auto',
        themeSystem: 'bootstrap'
      });
      fullCalendar.render();
    } else {
      fullCalendar.removeAllEvents();
      events.forEach(e=>fullCalendar.addEvent(e));
    }
  }

  function filterMigrationData(q){ if(!q) return migrationData.slice(); const s=q.toLowerCase(); return migrationData.filter(r=> (r['Site Title']||'').toLowerCase().includes(s) || (r['Division']||'').toLowerCase().includes(s)); }

  document.addEventListener('DOMContentLoaded', ()=>{
  const btnCal = document.getElementById('viewCalendarBtn');
  const btnAgenda = document.getElementById('viewAgendaBtn');
    const search = document.getElementById('migrationSearch');
    const modal = document.getElementById('migrationDatesModal');
    const exportBtn = document.getElementById('exportMigrationJson');

  function showCalendar(){ document.getElementById('migrationFullCalendar').style.display=''; document.getElementById('migrationAgenda').style.display='none'; if(btnCal) btnCal.classList.add('btn-primary'); if(btnCal) btnCal.classList.remove('btn-outline-primary'); if(btnAgenda) btnAgenda.classList.remove('btn-primary'); if(btnAgenda) btnAgenda.classList.add('btn-outline-primary'); }
  function showAgenda(){ document.getElementById('migrationFullCalendar').style.display='none'; document.getElementById('migrationAgenda').style.display=''; if(btnAgenda) btnAgenda.classList.add('btn-primary'); if(btnAgenda) btnAgenda.classList.remove('btn-outline-primary'); if(btnCal) btnCal.classList.remove('btn-primary'); if(btnCal) btnCal.classList.add('btn-outline-primary'); }

    if (btnCal) btnCal.addEventListener('click', ()=>{ showCalendar(); if(!fullCalendar) refreshFullCalendar(); else fullCalendar.changeView('dayGridMonth'); });
    if (btnAgenda) btnAgenda.addEventListener('click', ()=>{ showAgenda(); });

    if (search) search.addEventListener('input', ()=>{
      const q = search.value.trim(); const filtered = filterMigrationData(q);
      renderAgenda(filtered); if (fullCalendar) refreshFullCalendar();
    });

  if (modal) modal.addEventListener('shown.bs.modal', ()=>{ renderAgenda(migrationData && migrationData.length ? migrationData : (typeof _migrationSampleData !== 'undefined' ? _migrationSampleData.slice() : [])); if (!fullCalendar) refreshFullCalendar(); else fullCalendar.render(); });

    if (exportBtn) exportBtn.addEventListener('click', function(e){ e.preventDefault(); const blob=new Blob([JSON.stringify(migrationData,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='migration-dates.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });

    // default to Agenda view on open
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
