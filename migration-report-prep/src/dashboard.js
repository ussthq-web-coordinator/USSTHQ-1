'use strict';
// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════
let API_BASE     = 'http://localhost:3002';
let allRecords   = [];
let filtered     = [];
let currentView  = 'all';
let currentPage  = 1;
let sortCol      = null;
let sortDir      = 1;           // 1 = asc, -1 = desc
let allChangeTypes = new Set();  // All possible change types
let ignoredChangeTypes = new Set(); // Globally ignored change types

// Ignored site titles (exact match)
const IGNORED_SITES = new Set([
    'Adult Rehabilitation Center Atlanta',
    'ARC Atlanta',
    'ARC Command',
    'Camp Hidden Lake',
    'Camp Heart O Hills',
    'Brengle Holiness Conference',
    'Keystone Camp & Conference Center',
    'Camp Grandview',
    'Project Share',
    'Camp Paradise Valley',
    'Love Serve Disciple',
    'Boys & Girls Club of Charleston',
    'Boys & Girls Club of Greenville SC',
    'Boys & Girls Club of Hickory',
    'Boys & Girls Clubs of Greater Charlotte',
    'Boys & Girls Clubs of the Carolinas',
    'Camp Walter Johnson',
    'Carolinas Music & Arts',
    'Program Test',
    'Project FIGHT',
    'The Boys & Girls Clubs of Greensboro',
    'corp-test',
    'KT Corps Test',
    'Boys and Girls Club CRVA',
    'National Capital Band',
    'Potomac Music and Arts',
    'Emergency Disaster Services (INACTIVE SITE - DO NOT LINK TO)',
    'USS Template Site',
    'USS Conductor',
    'The Salvation Army Boys & Girls Club',
    'Volunteer Registration',
    'Evangeline Booth College',
    'Red Shield Youth Centers',
    'Spiritual Life Development',
    'Trade South Discounts',
    'USS Safe From Harm',
]);

// ═══════════════════════════════════════════════════════════════════
// INIT – detect server port
// ═══════════════════════════════════════════════════════════════════
(async function init() {
    for (const port of [3002, 3000, 8080, 3001]) {
        try {
            const r = await fetch(`http://localhost:${port}/config`,
                { signal: AbortSignal.timeout(900) });
            if (r.ok) { const cfg = await r.json(); API_BASE = cfg.apiBaseUrl; break; }
        } catch {}
    }
    loadData();
})();

// ═══════════════════════════════════════════════════════════════════
// LOAD DATA
// ═══════════════════════════════════════════════════════════════════
async function loadData() {
    showLoading('Connecting to server…');
    try {
        setLoadingDetail('Fetching SQL pages (territory 58 / theme 19) and SharePoint JSON…');
        const [sqlRes, spRes] = await Promise.all([
            fetch(`${API_BASE}/api/sql-pages`).then(r => r.json()),
            fetch(`${API_BASE}/api/sharepoint-data`).then(r => r.json()),
        ]);

        if (sqlRes.error) throw new Error('SQL Error: ' + sqlRes.error);
        if (spRes.error)  throw new Error('SP JSON Error: ' + spRes.error);

        const EXCLUDED_TYPES = new Set(['news', 'events']);
        const sqlRows = (Array.isArray(sqlRes) ? sqlRes : [])
            .filter(r => !EXCLUDED_TYPES.has((r.page_type || '').toLowerCase()))
            .filter(r => !(r.site_path_root || '').toLowerCase().includes('kroc'))
            .filter(r => !IGNORED_SITES.has(r.site_title));
        const spRows  = (spRes.records || [])
            .filter(r => !EXCLUDED_TYPES.has((r['Page Type'] || '').toLowerCase()))
            .filter(r => !(r['Site Path Root'] || '').toLowerCase().includes('kroc'))
            .filter(r => !IGNORED_SITES.has(r['Site Title']));

        setLoadingDetail(
            `SQL: ${sqlRows.length} pages · SP: ${spRows.length} records · Reconciling…`
        );
        await tick();

        allRecords = reconcile(sqlRows, spRows);
        
        // Filter out new records with deletion dates (deleted pages shouldn't be added to SP)
        allRecords = allRecords.filter(r => !(r.type === 'new' && r.sql?.deletion_date));
        
        // Collect all change types
        allChangeTypes.clear();
        for (const rec of allRecords) {
            if (rec.type === 'new') {
                allChangeTypes.add('Add to SP');
            } else if (rec.type === 'sp-only') {
                allChangeTypes.add('Remove from SP');
            } else {
                for (const diff of rec.diffs) {
                    allChangeTypes.add(diff);
                }
            }
        }
        ignoredChangeTypes.clear();
        renderChangeTypeToggles();
        
        populateFilterDropdowns(allRecords);
        updateStats(allRecords);
        applyFilters();

        document.getElementById('btnExportActive').disabled = false;
        document.getElementById('btnExportDeleted').disabled = false;
        document.getElementById('btnExportSPWithSQL').disabled = false;
        document.getElementById('lastLoaded').textContent =
            `Loaded ${new Date().toLocaleTimeString()} · SQL ${sqlRows.length} · SP ${spRows.length}`;
    } catch (e) {
        hideLoading();
        document.getElementById('emptyState').innerHTML =
            `<div class="error-box"><i class="bi bi-exclamation-triangle-fill"></i> ${esc(e.message)}</div>`;
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    hideLoading();
}

// ═══════════════════════════════════════════════════════════════════
// RECONCILIATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Matching key = lowercase(site_path_root) + "||" + lowercase(document_url)
 * Matches SQL document records against SharePoint migration list rows.
 *
 * Note: The SharePoint JSON combines two lists (Corps + Metro Area).
 * IDs are independent between lists, so we never match by ID.
 * We match only by (Site Path Root, Document URL).
 */
function matchKey(sitePathRoot, documentUrl) {
    return `${(sitePathRoot||'').toLowerCase().trim()}||${(documentUrl||'').toLowerCase().trim()}`;
}

// Field pairs to compare (label, SQL accessor, SP accessor)
const CMP_FIELDS = [
    { label: 'Site Title',     sqlFn: r => r.site_title,          spFn: r => r['Site Title'] },
    { label: 'Site Path Root', sqlFn: r => r.site_path_root,      spFn: r => r['Site Path Root'] },
    { label: 'Page Title',     sqlFn: r => r.page_title,          spFn: r => r['Page Title'] },
    { label: 'Page Type',      sqlFn: r => r.page_type,           spFn: r => r['Page Type'] },
    {
        label: 'Published',
        sqlFn: r => normPub(r.published),
        spFn:  r => normPub(r['Published Symphony']),
    },
    { label: 'Redirect URL',   sqlFn: r => normRedirectUrl(r.redirect_external_url), spFn: r => normRedirectUrl(r['Redirect External URL']) },
    { label: 'Date Modified',  sqlFn: r => normDate(r.date_modified),   spFn: r => normDate(r['Date Modified']) },
    { label: 'Date Created',   sqlFn: r => normDate(r.date_created),    spFn: r => normDate(r['Date Created '] ?? r['Date Created']) },
];

function normPub(v) {
    if (v == null || v === '') return '';
    if (v === 1 || v === true  || String(v).toLowerCase() === 'true')  return 'true';
    if (v === 0 || v === false || String(v).toLowerCase() === 'false') return 'false';
    return String(v).toLowerCase().trim();
}
function ns(v) { return v == null ? '' : String(v).trim(); }

// Normalize dates by stripping timezone, milliseconds, and formatting
// Examples: "2023-09-29T23:53:59.000Z" and "2023-09-29 19:53:59" both become "2023-09-29 23:53:59"
function normDate(v) {
    if (!v) return '';
    const s = String(v).trim();
    
    // Remove Z timezone indicator
    let normalized = s.replace(/Z$/, '');
    
    // Remove timezone offset like +00:00 or -05:00
    normalized = normalized.replace(/[+-]\d{2}:\d{2}$/, '');
    
    // Remove milliseconds: convert .000 or .123 to empty
    normalized = normalized.replace(/\.\d{3}/, '');
    
    // Normalize T separator to space (ISO 8601 to readable format)
    normalized = normalized.replace('T', ' ');
    
    // Trim and return
    return normalized.trim();
}

// Normalize redirect URLs by ignoring known URLs that should be ignored
function normRedirectUrl(v) {
    if (!v) return '';
    const s = String(v).trim();
    const ignoredUrls = [
        'https://www.salvationarmyusa.org/usa-southern-territory/north-and-south-carolina/charitable-gifts/',
        'https://www.salvationarmyusa.org/usa-southern-territory/north-and-south-carolina/legacy-and-estate-gifts/',
        'https://mailchi.mp/uss/c14yugvmfu'
    ];
    if (ignoredUrls.includes(s)) return '';
    return s;
}

// Normalize page titles by handling special character variations (curly quotes, dashes, bullets, etc.)
// Examples: "John "Jack" Moeller" and "John "Jack" Moeller" both normalize the same
function normPageTitle(v) {
    if (!v) return '';
    let s = String(v).trim();
    
    // Normalize curly quotes to straight quotes
    s = s.replace(/[""]/g, '"');  // " " → "
    s = s.replace(/['']/g, "'");  // ' ' → '
    
    // Normalize various dashes to hyphen
    s = s.replace(/[–—]/g, '-');  // en-dash, em-dash → -
    
    // Normalize bullet point and similar symbols to dash
    s = s.replace(/[•·]/g, '-');  // bullet, middle dot → -
    
    // Normalize multiple spaces to single space
    s = s.replace(/\s+/g, ' ');
    
    return s.toLowerCase().trim();
}

function eq(a, b) { return (a||'').toLowerCase().trim() === (b||'').toLowerCase().trim(); }

function computeDiffs(sql, sp) {
    const diffs = [];
    for (const f of CMP_FIELDS) {
        const sv = f.sqlFn(sql), pv = f.spFn(sp);
        if (!eq(sv, pv)) diffs.push(f.label);
    }
    if (sql.deletion_date) diffs.unshift('Deleted in SQL');
    return diffs;
}

function reconcile(sqlRows, spRows) {
    // Build SP lookup by matchKey (one key can have multiple SP entries from diff lists)
    const spMap = new Map();
    for (const sp of spRows) {
        const k = matchKey(sp['Site Path Root'], sp['Document URL']);
        if (!spMap.has(k)) spMap.set(k, []);
        spMap.get(k).push(sp);
    }

    const seen = new Set();
    const out  = [];

    for (const sql of sqlRows) {
        const k = matchKey(sql.site_path_root, sql.document_url);
        const spList = spMap.get(k) || [];
        seen.add(k);

        if (spList.length === 0) {
            out.push({ type: 'new', sql, sp: null, diffs: [], key: k });
        } else {
            const sp    = spList[0];
            const diffs = computeDiffs(sql, sp);
            const isDeleted = !!sql.deletion_date;
            // Date Created and Date Modified alone do not constitute an actionable diff
            const DATE_ONLY = new Set(['Date Created', 'Date Modified']);
            const actionableDiffs = diffs.filter(d => !DATE_ONLY.has(d));
            const type  = isDeleted ? 'deleted' : actionableDiffs.length > 0 ? 'diff' : 'match';
            out.push({ type, sql, sp, diffs, key: k, spCount: spList.length });
        }
    }

    // SP-only records (no matching SQL entry)
    for (const [k, list] of spMap.entries()) {
        if (!seen.has(k)) {
            for (const sp of list) {
                out.push({ type: 'sp-only', sql: null, sp, diffs: [], key: k });
            }
        }
    }

    return out;
}

// ═══════════════════════════════════════════════════════════════════
// SORT
// ═══════════════════════════════════════════════════════════════════
const SORT_KEY_MAP = {
    type:      r => r.type,
    div:       r => (r.sp?.['Division'] || '').toLowerCase(),
    siteTitle: r => (r.sql?.site_title  || r.sp?.['Site Title'] || '').toLowerCase(),
    siteRoot:  r => (r.sql?.site_path_root || r.sp?.['Site Path Root'] || '').toLowerCase(),
    docUrl:    r => (r.sql?.document_url   || r.sp?.['Document URL']   || '').toLowerCase(),
    pageTitle: r => (r.sql?.page_title     || r.sp?.['Page Title']     || '').toLowerCase(),
    pageType:  r => (r.sql?.page_type      || r.sp?.['Page Type']      || '').toLowerCase(),
    pub:       r => (r.sql ? normPub(r.sql.published) : (r.sp?.['Published Symphony']||'')),
    dateMod:   r => (r.sql?.date_modified  || r.sp?.['Date Modified']  || ''),
    delDate:   r => (r.sql?.deletion_date  || ''),
    spStatus:  r => (r.sp?.['Status'] || '').toLowerCase(),
    spKey:     r => (r.sp?.['Key']    || ''),
};

function sortBy(col) {
    if (sortCol === col) sortDir = -sortDir;
    else { sortCol = col; sortDir = 1; }

    document.querySelectorAll('thead th').forEach(th => {
        th.classList.remove('sort-asc','sort-desc');
    });
    const th = document.querySelector(`thead th[data-col="${col}"]`);
    if (th) th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');

    applyFilters();
}

// ═══════════════════════════════════════════════════════════════════
// FILTER + VIEW
// ═══════════════════════════════════════════════════════════════════
function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    const map = { all:'vbAll', diff:'vbDiff', new:'vbNew', 'sp-only':'vbSp' };
    document.getElementById(map[view])?.classList.add('active');
    applyFilters();
}

function applyFilters() {
    const div      = v('fDivision');
    const site     = v('fSite');
    const siteTitle = v('fSiteTitle');
    const pageType = v('fPageType');
    const siteType = v('fSiteType');
    const hasKey   = v('fHasKey');
    const changeType = v('fChangeType');
    const search   = v('fSearch').toLowerCase().trim();

    let data = allRecords;

    // View filter
    if (currentView === 'diff')    data = data.filter(r => r.type === 'diff' || r.type === 'deleted');
    if (currentView === 'new')     data = data.filter(r => r.type === 'new');
    if (currentView === 'sp-only') data = data.filter(r => r.type === 'sp-only');

    // Site exclusion filter
    data = data.filter(r => !IGNORED_SITES.has(r.sql?.site_title) && !IGNORED_SITES.has(r.sp?.['Site Title']));

    // Attribute filters
    if (div)      data = data.filter(r => (r.sp?.['Division'] || '') === div);
    if (site)     data = data.filter(r => (r.sql?.site_path_root || r.sp?.['Site Path Root'] || '') === site);
    if (siteTitle) data = data.filter(r => (r.sql?.site_title || r.sp?.['Site Title'] || '') === siteTitle);
    if (pageType) data = data.filter(r => (r.sql?.page_type      || r.sp?.['Page Type']      || '') === pageType);
    if (siteType) data = data.filter(r => (r.sp?.['Symphony Site Type'] || '') === siteType);
    if (hasKey === 'yes') data = data.filter(r => !!(r.sp?.['Key']));
    if (hasKey === 'no')  data = data.filter(r =>  !(r.sp?.['Key']));
    if (changeType) {
        data = data.filter(r => {
            if (changeType === 'Add to SP') return r.type === 'new';
            if (changeType === 'Remove from SP') return r.type === 'sp-only';
            const visibleDiffs = r.diffs.filter(d => !ignoredChangeTypes.has(d));
            return visibleDiffs.includes(changeType);
        });
    }

    if (search) {
        data = data.filter(r => {
            const hay = [
                r.sql?.page_title, r.sql?.document_url, r.sql?.site_title, r.sql?.site_path_root,
                r.sp?.['Page Title'], r.sp?.['Document URL'], r.sp?.['Site Title'],
                r.sp?.['Division'],
            ].map(x => (x||'').toLowerCase()).join(' ');
            return hay.includes(search);
        });
    }

    // Sort
    if (sortCol && SORT_KEY_MAP[sortCol]) {
        const fn = SORT_KEY_MAP[sortCol];
        data = [...data].sort((a,b) => {
            const av = fn(a), bv = fn(b);
            return sortDir * (av < bv ? -1 : av > bv ? 1 : 0);
        });
    }

    filtered = data;
    document.getElementById('filterCount').textContent =
        `${filtered.length.toLocaleString()} of ${allRecords.length.toLocaleString()}`;
    changePage(1);
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL CHANGE TYPE TOGGLES
// ═══════════════════════════════════════════════════════════════════
function renderChangeTypeToggles() {
    const container = document.getElementById('changeTypeToggles');
    if (!container) return;
    
    const types = [...allChangeTypes].sort();
    const html = types.map(t => {
        const isIgnored = ignoredChangeTypes.has(t);
        return `<label style="display:flex;align-items:center;gap:6px;white-space:nowrap;font-size:11px;cursor:pointer;margin:0 8px 0 0">
            <input type="checkbox" ${!isIgnored ? 'checked' : ''} 
                   style="cursor:pointer;margin:0" 
                   onchange="toggleChangeType('${esc(t)}')">
            <span>${esc(t)}</span>
        </label>`;
    }).join('');
    
    container.innerHTML = `<span style="font-size:11px;font-weight:700;color:#475569;margin-right:8px">Show Changes:</span>${html}`;
}

function toggleChangeType(changeType) {
    if (ignoredChangeTypes.has(changeType)) {
        ignoredChangeTypes.delete(changeType);
    } else {
        ignoredChangeTypes.add(changeType);
    }
    updateStats(allRecords);
    applyFilters();
}

function clearFilters() {
    ['fDivision','fSite','fSiteTitle','fPageType','fSiteType','fHasKey','fChangeType'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('fSearch').value = '';
    applyFilters();
}

// ═══════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════
function changePage(p) {
    const size  = parseInt(v('pageSize'));
    const pages = Math.max(1, Math.ceil(filtered.length / size));
    currentPage  = Math.min(Math.max(1, p), pages);

    const start = (currentPage - 1) * size;
    const slice = filtered.slice(start, start + size);

    renderTable(slice);
    renderPagination(currentPage, pages, filtered.length, start, slice.length);
}

function renderTable(rows) {
    const tbody = document.getElementById('tableBody');
    const table = document.getElementById('mainTable');
    const empty = document.getElementById('emptyState');

    if (!rows.length) {
        table.style.display = 'none';
        empty.innerHTML = `<i class="bi bi-search"></i> No records match the current filters.`;
        empty.style.display = 'block';
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';
    tbody.innerHTML = rows.map(renderRow).join('');
}

function renderRow(rec) {
    const { type, sql, sp, diffs } = rec;

    const rowClass = {
        new:      'row-sql-only',
        'sp-only':'row-sp-only',
        diff:     'row-diff',
        deleted:  'row-deleted',
        match:    'row-match',
    }[type] || 'row-match';

    const badge = {
        new:      `<span class="status-badge badge-new"><i class="bi bi-plus-circle-fill"></i> New</span>`,
        'sp-only':`<span class="status-badge badge-sp-only"><i class="bi bi-question-circle-fill"></i> SP Only</span>`,
        diff:     `<span class="status-badge badge-diff"><i class="bi bi-pencil-fill"></i> Update</span>`,
        deleted:  `<span class="status-badge badge-deleted"><i class="bi bi-trash-fill"></i> Deleted</span>`,
        match:    `<span class="status-badge badge-match"><i class="bi bi-check-circle-fill"></i> OK</span>`,
    }[type];

    const siteTypeRaw = sp?.['Symphony Site Type'] || '';
    const typeTag = siteTypeRaw.toLowerCase().includes('metro')
        ? `<span class="tag-metro">Metro</span>`
        : `<span class="tag-corps">Corps</span>`;

    const division = sp?.['Division'] || '';

    // Build a comparison cell
    function cell(sqlVal, spVal) {
        sqlVal = ns(sqlVal); spVal = ns(spVal);
        const diff = !eq(sqlVal, spVal);
        const cls  = diff ? 'is-diff' : '';

        if (type === 'new')      return `<td class="${cls}"><span>${esc(sqlVal)}</span></td>`;
        if (type === 'sp-only')  return `<td class="${cls}"><span>${esc(spVal)}</span></td>`;
        if (!diff)               return `<td><span>${esc(sqlVal)}</span></td>`;
        return `<td class="is-diff">
            <div class="cell-pair">
                <span class="val-sql">${esc(sqlVal)}</span>
                <span class="val-sp">${esc(spVal)}</span>
            </div></td>`;
    }

    // Render date cells without highlighting (dates are never highlighted)
    function cellNoHighlight(sqlVal, spVal) {
        sqlVal = ns(sqlVal); spVal = ns(spVal);

        if (type === 'new')      return `<td><span>${esc(sqlVal)}</span></td>`;
        if (type === 'sp-only')  return `<td><span>${esc(spVal)}</span></td>`;
        if (sqlVal === spVal)    return `<td><span>${esc(sqlVal)}</span></td>`;
        // Even if values differ, don't highlight date fields
        return `<td>
            <div class="cell-pair">
                <span class="val-sql">${esc(sqlVal)}</span>
                <span class="val-sp">${esc(spVal)}</span>
            </div></td>`;
    }

    // Published cell (normalized)
    const pubSql = sql ? normPub(sql.published)          : '';
    const pubSp  = sp  ? normPub(sp['Published Symphony']) : '';
    function pubLabel(val) {
        if (!val) return `<span style="color:#94a3b8">—</span>`;
        return `<span class="${val==='true'?'pub-true':'pub-false'}">${esc(val)}</span>`;
    }
    let pubCell;
    if (type === 'new')     pubCell = `<td>${pubLabel(pubSql)}</td>`;
    else if (type==='sp-only') pubCell = `<td>${pubLabel(pubSp)}</td>`;
    else if (!eq(pubSql,pubSp)) {
        pubCell = `<td class="is-diff">
            <div class="cell-pair">
                <span class="val-sql">${pubLabel(pubSql)}</span>
                <span class="val-sp">${pubLabel(pubSp)}</span>
            </div></td>`;
    } else pubCell = `<td>${pubLabel(pubSql)}</td>`;

    // Deletion date
    const delDate = sql?.deletion_date || '';
    const delCell = delDate
        ? `<td class="is-deleted-flag" title="Page deleted in CMS">${esc(delDate)}</td>`
        : `<td><span style="color:#94a3b8">—</span></td>`;

    // SP fields
    const spKey    = sp?.['Key']    || '';
    const spStatus = sp?.['Status'] || '';

    // Changes (filtered by global ignores)
    let changes;
    if (type === 'new') {
        changes = ignoredChangeTypes.has('Add to SP')
            ? `<span style="color:#94a3b8;font-size:9px">—</span>`
            : `<ul class="changes-list"><li>Add to SP</li></ul>`;
    } else if (type === 'sp-only') {
        changes = ignoredChangeTypes.has('Remove from SP')
            ? `<span style="color:#94a3b8;font-size:9px">—</span>`
            : `<ul class="changes-list"><li>Remove from SP</li></ul>`;
    } else {
        const visibleDiffs = diffs.filter(d => !ignoredChangeTypes.has(d));
        changes = visibleDiffs.length
            ? `<ul class="changes-list">${visibleDiffs.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`
            : `<span style="color:#94a3b8;font-size:9px">—</span>`;
    }

    return `<tr class="${rowClass}">
        <td>${badge}</td>
        <td>${typeTag}</td>
        <td>${esc(division)}</td>
        ${cell(sql?.site_title,          sp?.['Site Title'])}
        ${cell(sql?.site_path_root,      sp?.['Site Path Root'])}
        ${cell(sql?.document_url,        sp?.['Document URL'])}
        ${cell(sql?.page_title,          sp?.['Page Title'])}
        ${cell(sql?.page_type,           sp?.['Page Type'])}
        ${pubCell}
        ${cellNoHighlight(sql?.date_modified,       sp?.['Date Modified'])}
        ${cellNoHighlight(sql?.date_created,        sp?.['Date Created '] ?? sp?.['Date Created'])}
        ${cell(sql?.redirect_external_url||'', sp?.['Redirect External URL']||'')}
        ${delCell}
        <td><span style="font-size:10px;color:#475569">${esc(spStatus)}</span></td>
        <td><span class="sp-key">${esc(spKey)}</span></td>
        <td>${changes}</td>
    </tr>`;
}

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════
function renderPagination(page, pages, total, start, count) {
    document.getElementById('pageInfo').textContent =
        `Rows ${(start+1).toLocaleString()}–${(start+count).toLocaleString()} of ${total.toLocaleString()}`;

    document.getElementById('btnPrev').disabled = page <= 1;
    document.getElementById('btnNext').disabled = page >= pages;

    const range = 3;
    const lo = Math.max(1, page - range), hi = Math.min(pages, page + range);
    let html = '';
    if (lo > 1)    html += `<button class="btn-pg" onclick="changePage(1)">1</button>${lo>2?'<span style="font-size:10px;color:#94a3b8;padding:0 2px">…</span>':''}`;
    for (let i = lo; i <= hi; i++)
        html += `<button class="btn-pg${i===page?' active-pg':''}" onclick="changePage(${i})">${i}</button>`;
    if (hi < pages) html += `${hi<pages-1?'<span style="font-size:10px;color:#94a3b8;padding:0 2px">…</span>':''}<button class="btn-pg" onclick="changePage(${pages})">${pages}</button>`;
    document.getElementById('pageButtons').innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// STATS + FILTER DROPDOWNS
// ═══════════════════════════════════════════════════════════════════
function updateStats(records) {
    let match=0, diff=0, newR=0, spOnly=0, deleted=0;
    
    // Calculate effective type based on visible diffs (excluding globally ignored changes)
    const DATE_ONLY = new Set(['Date Created', 'Date Modified']);
    
    for (const r of records) {
        let effectiveType = r.type;
        
        // For new records, check if "Add to SP" is ignored
        if (r.type === 'new' && ignoredChangeTypes.has('Add to SP')) {
            effectiveType = 'match';
        }
        
        // For sp-only records, check if "Remove from SP" is ignored
        if (r.type === 'sp-only' && ignoredChangeTypes.has('Remove from SP')) {
            effectiveType = 'match';
        }
        
        // For diff/deleted records, recalculate if there are only ignored changes
        if (r.type === 'diff' || r.type === 'deleted') {
            const visibleDiffs = r.diffs.filter(d => !ignoredChangeTypes.has(d) && !DATE_ONLY.has(d));
            if (visibleDiffs.length === 0 && r.type === 'diff') {
                effectiveType = 'match';
            }
        }
        
        if (effectiveType === 'match')    match++;
        if (effectiveType === 'diff')     diff++;
        if (effectiveType === 'new')      newR++;
        if (effectiveType === 'sp-only')  spOnly++;
        if (effectiveType === 'deleted')  { diff++; deleted++; }
    }
    
    const total = records.length;
    document.getElementById('cntAll').textContent   = total;
    document.getElementById('cntDiff').textContent  = diff;
    document.getElementById('cntNew').textContent   = newR;
    document.getElementById('cntSp').textContent    = spOnly;
    document.getElementById('statTotal').textContent   = `Total: ${total.toLocaleString()}`;
    document.getElementById('statMatch').textContent   = `OK: ${match.toLocaleString()}`;
    document.getElementById('statDiff').textContent    = `Needs Update: ${diff.toLocaleString()}`;
    document.getElementById('statDeleted').textContent = `Deleted in SQL: ${deleted.toLocaleString()}`;
    document.getElementById('statNew').textContent     = `New (SQL only): ${newR.toLocaleString()}`;
    document.getElementById('statSpOnly').textContent  = `SP Only: ${spOnly.toLocaleString()}`;
}

function populateFilterDropdowns(records) {
    const divs=new Set(), sites=new Set(), siteTitles=new Set(), ptypes=new Set();
    for (const r of records) {
        if (r.sp?.['Division'])    divs.add(r.sp['Division']);
        const spr = r.sql?.site_path_root || r.sp?.['Site Path Root'] || '';
        if (spr) sites.add(spr);
        const st = r.sql?.site_title || r.sp?.['Site Title'] || '';
        if (st) siteTitles.add(st);
        const pt = r.sql?.page_type || r.sp?.['Page Type'] || '';
        if (pt) ptypes.add(pt);
    }
    fillSel('fDivision','All Divisions',    [...divs].sort());
    fillSel('fSite',    'All Sites',        [...sites].sort());
    fillSel('fSiteTitle','All Site Titles', [...siteTitles].sort());
    fillSel('fPageType','All Page Types',   [...ptypes].sort());
    fillSel('fChangeType','Any Change',     [...allChangeTypes].sort());
}
function fillSel(id, label, opts) {
    const el = document.getElementById(id);
    const cur = el.value;
    el.innerHTML = `<option value="">${label}</option>` +
        opts.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('');
    if (cur) el.value = cur;
}

// ═══════════════════════════════════════════════════════════════════
// EXCEL EXPORT  (SheetJS)
// ═══════════════════════════════════════════════════════════════════
function exportExcelActive() {
    const activeRecords = filtered.filter(r => r.type !== 'deleted' && r.type !== 'match');
    if (!activeRecords.length) { alert('No active records to export.'); return; }
    exportExcelHelper(activeRecords, 'active');
}

function exportExcelDeleted() {
    const deletedRecords = filtered.filter(r => r.type === 'deleted');
    if (!deletedRecords.length) { alert('No deleted records to export.'); return; }
    exportExcelHelper(deletedRecords, 'deleted');
}

function exportExcelSPWithSQL() {
    const matchedRecords = allRecords.filter(r => r.sql && r.sp);
    if (!matchedRecords.length) { alert('No matched SP records with SQL data to export.'); return; }
    exportExcelHelper(matchedRecords, 'sp-with-sql');
}

function exportExcelHelper(recordsToExport, exportType) {
    const wb = XLSX.utils.book_new();

    // Build lookup map for site title → Division/Symphony Site Type
    const siteMetadataMap = {};
    for (const rec of allRecords) {
        if (rec.sp) {
            const siteTitle = rec.sp['Site Title'];
            if (siteTitle) {
                if (!siteMetadataMap[siteTitle]) {
                    siteMetadataMap[siteTitle] = {
                        division: null,
                        symphonySiteType: null
                    };
                }
                if (!siteMetadataMap[siteTitle].division && rec.sp['Division']) {
                    siteMetadataMap[siteTitle].division = rec.sp['Division'];
                }
                if (!siteMetadataMap[siteTitle].symphonySiteType && rec.sp['Symphony Site Type']) {
                    siteMetadataMap[siteTitle].symphonySiteType = rec.sp['Symphony Site Type'];
                }
            }
        }
    }

    function toRow(rec) {
        const { type, sql, sp, diffs } = rec;
        let visibleDiffs = diffs.filter(d => !ignoredChangeTypes.has(d));
        
        // For active export, exclude date-only changes
        if (exportType === 'active') {
            const DATE_ONLY = new Set(['Date Created', 'Date Modified']);
            visibleDiffs = visibleDiffs.filter(d => !DATE_ONLY.has(d));
        }
        
        // Handle synthetic changes
        if (type === 'new' && !ignoredChangeTypes.has('Add to SP')) {
            visibleDiffs = ['Add to SP'];
        } else if (type === 'sp-only' && !ignoredChangeTypes.has('Remove from SP')) {
            visibleDiffs = ['Remove from SP'];
        }
        
        const statusLabel = {
            new:'New (SQL Only)', 'sp-only':'SP Only',
            diff:'Needs Update', deleted:'Deleted in SQL', match:'OK'
        }[type] || type;
        
        // For sp-only records, use SP values; for new/diff, use SQL values
        const source = (type === 'sp-only') ? sp : sql;
        const pubValue = source != null ? normPub(source.published ?? source['Published Symphony']) : '';
        
        // Derive Division and Symphony Site Type from other records with same site title
        const siteTitle = source?.site_title ?? source?.['Site Title'] ?? '';
        const metadata = siteMetadataMap[siteTitle] || {};
        const division = sp?.['Division'] ?? metadata.division ?? '';
        const symphonySiteType = sp?.['Symphony Site Type'] ?? metadata.symphonySiteType ?? '';
        
        const baseRow = {
            'Match Status'              : statusLabel,
            'Changes'                   : visibleDiffs.join('; '),
            'Symphony Site Type'        : symphonySiteType,
            'Division'                  : division,
            'Site Title'                : siteTitle,
            'Site Path Root'            : source?.site_path_root ?? source?.['Site Path Root'] ?? '',
            'Document URL'              : source?.document_url ?? source?.['Document URL'] ?? '',
            'Page Title'                : source?.page_title ?? source?.['Page Title'] ?? '',
            'Page Type'                 : source?.page_type ?? source?.['Page Type'] ?? '',
            'Published Symphony'        : pubValue,
            'Date Modified'             : ns(source?.date_modified ?? source?.['Date Modified']),
            'Date Created'              : ns(source?.date_created ?? (source?.['Date Created '] ?? source?.['Date Created'])),
            'Redirect External URL'     : source?.redirect_external_url ?? source?.['Redirect External URL'] ?? '',
            'Status'                    : source?.['Status']             ?? '',
            'Key'                       : sp?.['Key']                    ?? '',
            'ID'                        : source?.['ID']                 ?? '',
            'Page URL'                  : source?.['Page URL']           ?? '',
            'Migration URL'             : source?.['Migration URL']      ?? '',
            'Hide In Menu'              : source?.['Hide In Menu']       ?? '',
            'Show Nav Menu'             : source?.['Show Nav Menu']      ?? '',
            'Effort Needed'             : source?.['Effort Needed']      ?? '',
            'Priority'                  : source?.['Priority']           ?? '',
            'QA Issues'                 : source?.['QA Issues.lookupValue'] ?? '',
        };
        
        // For SP+SQL export or active export, add SQL identifiers
        if (exportType === 'sp-with-sql' || exportType === 'active') {
            baseRow['SQL – idDocument'] = sql?.idDocument || '';
            baseRow['SQL – idSite']     = sql?.idSite     || '';
        }
        
        // For active export, add SQL page title for import clarity
        if (exportType === 'active') {
            baseRow['SQL – Page Title'] = sql?.page_title || '';
        }
        
        return baseRow;
    }

    let sheets = [];
    
    if (exportType === 'active') {
        sheets = [
            { name: 'All Records',   data: recordsToExport },
            { name: 'Needs Update',  data: recordsToExport.filter(r => r.type==='diff') },
            { name: 'New (SQL Only)',data: recordsToExport.filter(r => r.type==='new') },
            { name: 'SP Only',       data: recordsToExport.filter(r => r.type==='sp-only') },
        ];
    } else if (exportType === 'sp-with-sql') {
        sheets = [
            { name: 'All Matched', data: recordsToExport },
            { name: 'OK',          data: recordsToExport.filter(r => r.type==='match') },
            { name: 'Needs Update',data: recordsToExport.filter(r => r.type==='diff') },
        ];
    } else {
        sheets = [
            { name: 'Deleted in SQL', data: recordsToExport },
        ];
    }

    for (const { name, data } of sheets) {
        const ws = XLSX.utils.json_to_sheet(data.map(toRow));
        // Auto column widths (rough)
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        const colWidths = [];
        for (let C = range.s.c; C <= range.e.c; C++) {
            let max = 10;
            for (let R = range.s.r; R <= range.e.r; R++) {
                const cell = ws[XLSX.utils.encode_cell({r:R,c:C})];
                if (cell && cell.v) max = Math.min(60, Math.max(max, String(cell.v).length + 2));
            }
            colWidths.push({ wch: max });
        }
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, name);
    }

    XLSX.writeFile(wb, `migration-reconciliation-${exportType}-${datestamp()}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════
function v(id) { return document.getElementById(id)?.value || ''; }
function tick() { return new Promise(r => setTimeout(r, 20)); }
function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function datestamp() { return new Date().toISOString().slice(0,10); }

function showLoading(msg) {
    document.getElementById('loadingMsg').textContent    = msg || 'Loading…';
    document.getElementById('loadingDetail').textContent = '';
    document.getElementById('loadingOverlay').style.display = 'flex';
}
function setLoadingDetail(msg) { document.getElementById('loadingDetail').textContent = msg; }
function hideLoading()         { document.getElementById('loadingOverlay').style.display = 'none'; }
