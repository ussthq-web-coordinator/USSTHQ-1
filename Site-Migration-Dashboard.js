/**
 * Site-Migration-Dashboard.js
 * 
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

// Backup Data URL https://cdn.jsdelivr.net/gh/ussthq-web-coordinator/USSTHQ-1@latest/DashboardData.json

const jsonURL = "https://hopewell.pages.dev/DashboardData.json";
let table, tableData=[], pageCache={}, qaGroupedCache={};
let priorityChart, pageTypeChart, pubSymChart;
let statusChart = null;


//version number change here
async function fetchData() {
  try {
    const res = await fetch(jsonURL);
    if(!res.ok) throw new Error('Unable to load JSON data');
    const json = await res.json();
    tableData = Array.isArray(json) ? json : (json.data || []);
    const refreshUTC = json.refreshDate ? new Date(json.refreshDate) : null;
    document.getElementById("refreshDate").textContent = refreshUTC ? "Version 1.9232040 - Last refreshed (Eastern): " + refreshUTC.toLocaleString("en-US",{ timeZone:"America/New_York", dateStyle:"medium", timeStyle:"short"}) : "Last refreshed: Unknown";
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
  const container = chart.canvas.parentNode;
  
  container.addEventListener("mouseenter", () => showLegendModal(chart, chartTitle));
  container.addEventListener("touchstart", () => showLegendModal(chart, chartTitle));
}

function showLegendModal(chart, title) {
  const legendHtml = chart.generateLegend ? chart.generateLegend() : "Legend unavailable";
  document.getElementById("chartLegendTitle").innerText = title;
  document.getElementById("chartLegendBody").innerHTML = legendHtml;
  new bootstrap.Modal(document.getElementById("chartLegendModal")).show();
}


function initFilters(){
  const filterIds = ["filterDivision","filterAC","filterStatus","filterPageType","filterPubSym","filterSymType"];

  filterIds.forEach(id=>{
    const sel = document.getElementById(id);
    sel.addEventListener("change", updateFiltersAndDashboard);
  });

  updateFiltersOptions();
}

function updateFiltersOptions(){
  const selected = {
    filterDivision: document.getElementById("filterDivision").value,
    filterAC: document.getElementById("filterAC").value,
    filterStatus: document.getElementById("filterStatus").value,
    filterPageType: document.getElementById("filterPageType").value,
    filterPubSym: document.getElementById("filterPubSym").value,
    filterSymType: document.getElementById("filterSymType").value
  };

  const filterMapping = {
    filterDivision: d => d.Division || "Not Set",
    filterAC: d => d["Area Command Admin Group.title"] || "Not Set",
    filterStatus: d => d.Status || "Not Set",
    filterPageType: d => d["Page Type"] || "Not Set",
    filterPubSym: d => d["Published Symphony"] || "Not Set",
    filterSymType: d => d["Symphony Site Type"] || "Not Set"
  };

  const filterIds = Object.keys(selected);

  filterIds.forEach(id=>{
    const sel = document.getElementById(id);

    // Calculate available options based on other selected filters
    const otherFilters = {...selected};
    delete otherFilters[id];

    const filteredData = tableData.filter(d=>{
      return Object.keys(otherFilters).every(fId=>{
        const val = otherFilters[fId];
        if(!val) return true;
        const field = filterMapping[fId];
        return field(d) === val;
      });
    });

    const options = [...new Set(filteredData.map(d=>filterMapping[id](d)))].sort();

    // Preserve current selection if still available
    const currentValue = sel.value;
    sel.innerHTML = "<option value=''>All</option>" + options.map(o=>`<option value="${o}">${o}</option>`).join("");
    if(options.includes(currentValue)) sel.value = currentValue;
  });
}

function updateFiltersAndDashboard(){
  updateFiltersOptions();
  updateDashboard();
}


function getFilteredData(){
  const div = document.getElementById("filterDivision").value;
  const ac = document.getElementById("filterAC").value;
  const status = document.getElementById("filterStatus").value;
  const pageType = document.getElementById("filterPageType").value;
  const pubSym = document.getElementById("filterPubSym").value;
  const symType = document.getElementById("filterSymType").value;

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
  const total = filtered.length;
  const counts = { "Do Not Migrate":0, "Needs Info":0, "In Progress":0, "In QA":0, Unknown:0, Completed:0,};
  
  filtered.forEach(d=>{
    const s = getCanonicalStatus(d.Status);
    counts[s] = (counts[s] || 0) + 1;
  });

  const container = document.getElementById("progressBarContainer");
  container.innerHTML = "";

  const legendContainer = document.getElementById("progressLegend");
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




function renderQaAccordion(data){
  const container = document.getElementById("qaGroupsBody");
  container.innerHTML = "";
  const qaRows = data.filter(d=>d["QA Issues.lookupValue"]);
  
  // Update badge with total count
  const badge = document.getElementById("qaBadge");
  badge.textContent = qaRows.length;

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
          width: 110,        // fixed column width in px (adjust to taste)
          minWidth: 80,
          headerSort: true, // optional: keep width stable on header sort
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
const masterData = tableData;

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  // Search function for Tabulator
  function filterTable() {
    const query = searchInput.value.toLowerCase().trim();
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
    searchInput.value = "";
    if (table) table.clearFilter();
  }

  searchBtn.addEventListener("click", filterTable);
  clearBtn.addEventListener("click", clearFilter);

  // Optional: filter on Enter key press
  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") filterTable();
  });
});






  // --- Table Modal ---
function showTableModalById(id){
  const page = pageCache[id];
  if(page) showTableModal(page);
}

function showTableModal(page){
  document.getElementById("tableModalTitle").innerText = page.Title;

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
  document.getElementById("tableModalBody").innerHTML = html;

  new bootstrap.Modal(document.getElementById('tableDetailModal')).show();
}


// --- QA Modal: now a responsive table with SD/ZD icons and clickable title ---
function showQaIssuesModal(groupKey){
  const ids = qaGroupedCache[groupKey] || [];
  const modalBody = document.getElementById("qaIssuesModalBody");

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
            <th class="text-center">Edit</th>
            <th class="text-center">SD</th>
            <th class="text-center">ZD</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>QA Notes</th>
          </tr>
        </thead>
        <tbody>
  `;

  let whyImportant = "";
  let howToFix = "";

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
      <td><a href="#" onclick="showTableModalById(${id})">${p.Title}</a></td>  
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
  });

  html += "</tbody></table></div>";

  // add headings/values under the table
  if (whyImportant) {
    html += `<div class="mt-3"><h5>Why Fixing This Is Important</h5><p>${whyImportant}</p></div>`;
  }
  if (howToFix) {
    html += `<div class="mt-3"><h5>How to Fix This Issue</h5><p>${howToFix}</p></div>`;
  }

  modalBody.innerHTML = html;
  new bootstrap.Modal(document.getElementById("qaIssuesModal")).show();
}

// --- Charts: fixed Published Symphony chart to show Yes/No correctly ---
function renderCharts(data){
  Object.values(charts).forEach(c => c.destroy && c.destroy());
  charts = {};

  // Status
// --- Compute progress ---
  const statusGroups = { "Completed":0, "Do Not Migrate":0, "Needs Info":0, "In Progress":0, "In QA":0 };

  data.forEach(d => {
    const s = (d.Status || "").trim();
    if (/^(4|5)/.test(s)) statusGroups["Completed"]++;
    else if (/^3/.test(s)) statusGroups["In QA"]++;
    else if (/^2/.test(s)) statusGroups["In Progress"]++;
    else if (/^1/.test(s)) statusGroups["Needs Info"]++;
    else if (s === "Do Not Migrate") statusGroups["Do Not Migrate"]++;
  
    
  });

  const total = Object.values(statusGroups).reduce((a,b)=>a+b,0);

  // --- Set progress bar widths ---
  document.getElementById("progressCompleted").style.width = (statusGroups["Completed"]/total*100) + "%";
  document.getElementById("progressDoNotMigrate").style.width = (statusGroups["Do Not Migrate"]/total*100) + "%";
  document.getElementById("progressNeedsInfo").style.width = (statusGroups["Needs Info"]/total*100) + "%";
  document.getElementById("progressInProgress").style.width = (statusGroups["In Progress"]/total*100) + "%";
  document.getElementById("progressInQA").style.width = (statusGroups["In QA"]/total*100) + "%";

  // Priority
  const priorityCounts = countBy(data,"Priority");
  charts.priorityChart = new Chart(document.getElementById("priorityChart"), {
    type:"pie",
    data:{ labels:Object.keys(priorityCounts),
           datasets:[{ data:Object.values(priorityCounts),
                       backgroundColor:palette(Object.keys(priorityCounts).length) }] },
    options:{ plugins:{ title:{display:true,text:"Priority"} } }
  });

  // Page Type
  const typeCounts = countBy(data,"Page Type");
  charts.pageTypeChart = new Chart(document.getElementById("pageTypeChart"), {
    type:"pie",
    data:{ labels:Object.keys(typeCounts),
           datasets:[{ data:Object.values(typeCounts),
                       backgroundColor:palette(Object.keys(typeCounts).length) }] },
    options:{ plugins:{ title:{display:true,text:"Page Type"} } }
  });

  // ✅ Published Symphony fix
  const pubCounts = { Yes:0, No:0 };
  data.forEach(d => {
    if (String(d["Published Symphony"]).toLowerCase() === "true") pubCounts.Yes++;
    else pubCounts.No++;
  });
  charts.pubSymChart = new Chart(document.getElementById("pubSymChart"), {
    type:"pie",
    data:{ labels:["Yes","No"],
           datasets:[{ data:[pubCounts.Yes, pubCounts.No],
                       backgroundColor:["#3498db","#95a5a6"] }] },
    options:{ plugins:{ title:{display:true,text:"Published Symphony"} } }
  });
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

function renderCharts(data){
  // destroy old charts
  Object.values(charts).forEach(c=>c.destroy && c.destroy());
  charts={};

const statusChart = new Chart(document.getElementById('statusChart'), {

  type: 'pie',
  data: statusData,
  options: {
    plugins: {
      legend: { display: false } // hide in chart
    }
  },
  plugins: [{
    id: 'legendPlugin',
    afterUpdate: chart => {
      chart.generateLegend = function() {
        const items = chart.data.labels.map((label, i) => {
          const color = chart.data.datasets[0].backgroundColor[i];
          const value = chart.data.datasets[0].data[i];
          return `<div style="display:flex;align-items:center;gap:0.5rem;margin:0.2rem 0;">
                    <span style="width:12px;height:12px;background-color:${color};display:inline-block;"></span>
                    ${label}: ${value}
                  </div>`;
        }).join('');
        return items;
      }
    }
  }]
});

// Attach modal trigger
addChartLegendModal(statusChart, "Status Overview");


// --- Status chart ---
const statusGroups = { "Completed":0, "Do Not Migrate":0, "Needs Info":0, "In Progress":0, "In QA":0 };
data.forEach(d=>{
  const s = (d.Status||"").trim();
  if (/^(4|5)/.test(s)) statusGroups["Completed"]++;
  else if (/^3/.test(s)) statusGroups["In QA"]++;
  else if (/^2/.test(s)) statusGroups["In Progress"]++;
  else if (/^1/.test(s)) statusGroups["Needs Info"]++;
  else if (s === "Do Not Migrate") statusGroups["Do Not Migrate"]++;
});

const statusLabels = Object.keys(statusGroups);
const statusData   = Object.values(statusGroups);
const statusTotal  = statusData.reduce((a,b)=>a+b,0);

charts.statusChart = new Chart(document.getElementById("statusChart"), {
  type:"pie",
  data:{
    labels: statusLabels,           // keep plain names here
    datasets:[{ 
      data: statusData,
      backgroundColor:["#2ecc71","#e74c3c","#f39c12","#002056","#CA5010"]
    }]
  },
  options:{
    plugins:{
      title:{ display:true, text:"Status" },
      legend:{
        labels:{
          generateLabels(chart){
            const {data} = chart;
            const total = data.datasets[0].data.reduce((a,b)=>a+b,0);
            return data.labels.map((label, i)=>{
              const count = data.datasets[0].data[i];
              const pct   = total ? Math.round(count/total*100) : 0;
              const bg    = data.datasets[0].backgroundColor[i];
              return {
                text: `${label} - ${pct}% (${count})`,
                fillStyle: bg,
                hidden: isNaN(count) || chart.getDatasetMeta(0).data[i].hidden
              };
            });
          }
        }
      }
    }
  }
});


// --- Priority chart ---
const priorityCounts = countBy(data,"Priority");
const priorityLabels = Object.keys(priorityCounts);
const priorityData   = Object.values(priorityCounts);
const priorityTotal  = priorityData.reduce((a,b)=>a+b,0);
const priorityLabelsWithPct = priorityLabels.map(
  (l,i)=>`${l} - ${priorityTotal ? Math.round(priorityData[i]/priorityTotal*100) : 0}% (${priorityData[i]})`
);

charts.priorityChart = new Chart(document.getElementById("priorityChart"), {
  type:"pie",
  data:{
    labels: priorityLabelsWithPct,
    datasets:[{ data: priorityData, backgroundColor: palette(priorityLabels.length) }]
  },
  options:{ plugins:{ title:{display:true,text:"Priority"} } }
});

// --- Page Type chart ---
const typeCounts = countBy(data,"Page Type");
const typeLabels = Object.keys(typeCounts);
const typeData   = Object.values(typeCounts);
const typeTotal  = typeData.reduce((a,b)=>a+b,0);
const typeLabelsWithPct = typeLabels.map(
  (l,i)=>`${l} - ${typeTotal ? Math.round(typeData[i]/typeTotal*100) : 0}% (${typeData[i]})`
);

charts.pageTypeChart = new Chart(document.getElementById("pageTypeChart"), {
  type:"pie",
  data:{
    labels: typeLabelsWithPct,
    datasets:[{ data: typeData, backgroundColor: palette(typeLabels.length) }]
  },
  options:{ plugins:{ title:{display:true,text:"Page Type"} } }
});

// --- Published Symphony chart (Yes/No) ---
const pubCounts = { "Yes":0, "No":0 };
data.forEach(d=>{
  const val = (d["Published Symphony"]||"").trim().toLowerCase();
  if(val==="yes") pubCounts["Yes"]++;
  else pubCounts["No"]++;
});
const pubLabels = Object.keys(pubCounts);
const pubData   = Object.values(pubCounts);
const pubTotal  = pubData.reduce((a,b)=>a+b,0);
const pubLabelsWithPct = pubLabels.map(
  (l,i)=>`${l} - ${pubTotal ? Math.round(pubData[i]/pubTotal*100) : 0}% (${pubData[i]})`
);

charts.pubSymChart = new Chart(document.getElementById("pubSymChart"), {
  type:"pie",
  data:{
    labels: pubLabelsWithPct,
    datasets:[{ data: pubData, backgroundColor:["#2ecc71","#e74c3c"] }]
  },
  options:{ plugins:{ title:{display:true,text:"Published Symphony"} } }
});
}

const refreshEl = document.getElementById("refreshDate");
if(refreshEl){
  refreshEl.textContent = refreshUTC 
    ? "Last refreshed (Eastern): " + refreshUTC.toLocaleString("en-US",{timeZone:"America/New_York", dateStyle:"medium", timeStyle:"short"})
    : "Last refreshed: Unknown";
}


function updateDashboard(){
  renderCards();
  renderTable();
  renderCharts(getFilteredData());
  renderOverallProgress(getFilteredData());
}
