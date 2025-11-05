let differencesData = [];
let gdosMap = new Map();
let duplicateMap = new Map();
let duplicateCheckRecords = [];
// Polling/adaptive sync configuration
let pollIntervalMsDefault = 10000; // normal short poll
let pollIntervalMs = pollIntervalMsDefault;
let pollBackoffCount = 0;
const pollMaxInterval = 60000; // don't back off beyond 60s
let _serverPollTimeoutId = null;
// Background sync scheduler (debounced) so UI edits don't force immediate sync/refresh
let _backgroundSyncTimeoutId = null;
const BACKGROUND_SYNC_DELAY_MS = 5000; // wait 5s of idle before syncing
let _pendingServerReconcile = null;

function scheduleBackgroundSync(delayMs = BACKGROUND_SYNC_DELAY_MS) {
    try { if (_backgroundSyncTimeoutId) clearTimeout(_backgroundSyncTimeoutId); } catch (e) {}
    _backgroundSyncTimeoutId = setTimeout(() => {
        // Fire-and-forget sync; attemptSyncLocalCorrections is serialized internally
        attemptSyncLocalCorrections().catch(e => console.warn('background attemptSyncLocalCorrections failed', e));
    }, delayMs);
}
// Optional cross-tab notification channel to avoid redundant polling between tabs
let _bc = null;
try { if (typeof BroadcastChannel !== 'undefined') _bc = new BroadcastChannel('gdos-corrections'); } catch (e) { _bc = null; }
// Corrections that couldn't be applied because rows weren't present yet
let pendingCorrections = {};
// latestFilteredData holds the current set of rows matching active filters (all pages)
let latestFilteredData = null;
// In-memory copy of corrections loaded from shared storage (used to compute deltas)
let loadedCorrections = {};
// Local queue for unsynced corrections (persisted to localStorage)
let localCorrections = {};
// Sync state for UI
let syncState = { lastAttempt: null, lastSuccess: null, pending: 0 };

// Whether a full table refresh was skipped while the user was editing
let deferredTableRefresh = false;
let _deferredRefreshListenerAdded = false;

// Return true when the user is actively editing an input/select/textarea inside the table
function isUserEditingInTable() {
    try {
        const ae = document.activeElement;
        if (!ae) return false;
        const tableContainer = document.getElementById('differencesTable');
        if (!tableContainer) return false;
        if (!tableContainer.contains(ae)) return false;
        const tag = (ae.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'select' || tag === 'textarea' || ae.isContentEditable;
    } catch (e) {
        return false;
    }
}

async function smartRefreshTable(table) {
    if (!table) return;
    // If the user is typing inside the table, defer the full refresh and let incremental updates happen instead
    if (isUserEditingInTable()) {
        deferredTableRefresh = true;
        // ensure we listen for the end of editing via blur on inputs created by formatters
        if (!_deferredRefreshListenerAdded) {
            _deferredRefreshListenerAdded = true;
            // fallback listener to attempt refresh when focus leaves the table
            document.addEventListener('focusout', function() {
                setTimeout(async () => {
                    if (!isUserEditingInTable() && deferredTableRefresh) {
                        try {
                            if (typeof table.replaceData === 'function') await table.replaceData(differencesData);
                            else if (typeof table.setData === 'function') await table.setData(differencesData);
                        } catch (e) { console.warn('deferred replaceData/setData failed', e); }
                        deferredTableRefresh = false;
                    }
                }, 50);
            }, true);
        }
        console.log('Deferring full table refresh until user stops editing');
        return;
    }

    try {
        if (typeof table.replaceData === 'function') {
            await table.replaceData(differencesData);
        } else if (typeof table.setData === 'function') {
            await table.setData(differencesData);
        }
    } catch (e) {
        console.warn('smartRefreshTable failed', e);
    }
}

// Helper: build canonical storage key for a row (territory-prefixed)
function makeCorrectionKey(r) {
    // Always use the field name directly as the key
    const fieldKey = r.field || '';
    return `${r.territory || ''}-${r.gdos_id}-${fieldKey}`;
}

// Helper: build correction entry object from a rowData
function buildCorrectionEntry(r) {
    if (!r || !r.correct) return null;
    // Save all corrections including GDOS
    const entry = { correct: r.correct };
    try {
        if (r.zesty_value !== undefined && r.zesty_value !== null && String(r.zesty_value).trim() !== '') entry.value = r.zesty_value;
    } catch (e) { /* ignore */ }
    return entry;
}

// Persist a single change: add to localCorrections, then queue for sync
function persistSingleCorrection(rowData) {
    const delta = {};
    const key = makeCorrectionKey(rowData);
    const entry = buildCorrectionEntry(rowData);
    delta[key] = entry === null ? null : entry;

    // Update localCorrections
    Object.keys(delta).forEach(k => {
        if (delta[k] === null) {
            delete localCorrections[k];
        } else {
            localCorrections[k] = delta[k];
        }
    });

    // Save to localStorage immediately
    try {
        localStorage.setItem('gdosLocalCorrections', JSON.stringify(localCorrections));
    } catch (e) {
        console.warn('Failed to save localCorrections to localStorage', e);
    }

    // Notify other tabs that a local correction was made so they can kick off sync sooner
    try {
        if (_bc) _bc.postMessage({ type: 'localCorrection', ts: Date.now() });
    } catch (e) { /* ignore */ }

    // Update sync state and UI status
    syncState.pending = Object.keys(localCorrections).length;
    updateSyncStatus();
    updateUIEnabledState();

    // Schedule a background sync to run after a short idle period so typing/selection
    // actions do not trigger immediate network activity or table refreshes.
    scheduleBackgroundSync();
}

// Attempt to sync all localCorrections to the server
let _syncInProgress = false;
let _syncRetryPending = false;

async function attemptSyncLocalCorrections() {
    // If nothing to do, return
    if (Object.keys(localCorrections).length === 0) return;

    // If a sync is already running, mark that we should retry after current run completes
    if (_syncInProgress) {
        _syncRetryPending = true;
        return;
    }

    _syncInProgress = true;
    _syncRetryPending = false;

    try {
        // Snapshot the corrections we're about to send so concurrent edits during the fetch
        // get persisted to localCorrections and retried after this run.
        const payload = JSON.stringify(localCorrections);
        const res = await fetch(SHARED_STORAGE_URL, {
            method: 'PATCH',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: payload
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);

        // On success, merge the snapshot into loadedCorrections
        // The server authoritatively reflects what we just sent
        try {
            Object.keys(JSON.parse(payload)).forEach(k => {
                const val = JSON.parse(payload)[k];
                if (val === null) {
                    delete loadedCorrections[k];
                } else {
                    loadedCorrections[k] = val;
                }
            });
        } catch (e) {
            // If parsing snapshot fails for some reason, fall back to using localCorrections
            Object.keys(localCorrections).forEach(k => {
                if (localCorrections[k] === null) delete loadedCorrections[k]; else loadedCorrections[k] = localCorrections[k];
            });
        }

        // Clear the keys that we successfully sent from localCorrections
        try {
            const sentKeys = Object.keys(JSON.parse(payload));
            sentKeys.forEach(k => delete localCorrections[k]);
        } catch (e) {
            localCorrections = {};
        }
        // Persist remaining localCorrections (if any edits happened during the sync)
        try { localStorage.setItem('gdosLocalCorrections', JSON.stringify(localCorrections)); } catch (e) { console.warn('localStorage write failed after sync', e); }

        // Update sync state
        syncState.pending = Object.keys(localCorrections).length;
        updateSyncStatus();

        // Re-enable UI
        updateUIEnabledState();

        // Apply the authoritative changes to differencesData for immediate UI update
        // However, if the user is currently editing inside the table, avoid applying
        // UI updates that can steal focus or change the editing state. In that case,
        // persist loadedCorrections and schedule a background reconcile to update UI
        // after a short idle period.
        // Compute changed keys from the payload we sent (if available). This helps us
        // update only the affected rows in the table rather than replacing whole data.
        let changedKeys = [];
        try {
            const parsedPayload = JSON.parse(payload || '{}');
            changedKeys = Object.keys(parsedPayload || {});
        } catch (e) { /* ignore */ }

        if (isUserEditingInTable()) {
            // Merge into loadedCorrections now (authoritative state updated above)
            try { applyChanges(loadedCorrections); } catch (e) { console.warn('applyChanges (deferred) failed', e); }
            // Schedule a background UI update (smaller delay so it occurs once editing finishes)
            if (_backgroundSyncTimeoutId) try { clearTimeout(_backgroundSyncTimeoutId); } catch (e) {}
            _backgroundSyncTimeoutId = setTimeout(async () => {
                try {
                    const table = window.differencesTable || (typeof Tabulator !== 'undefined' && typeof Tabulator.findTable === 'function' ? Tabulator.findTable("#differencesTable")[0] : null);
                    if (table) {
                        // Try incremental updates first
                        applyIncrementalChangesToTable(table, changedKeys);
                        // If incremental didn't cover everything, fall back to smartRefreshTable
                        try { await smartRefreshTable(table); } catch (e) { /* ignore */ }
                    }
                    try { populateCorrectValueDropdown(loadedCorrections); } catch (e) {}
                    try { applyGlobalFilters(); } catch (e) {}
                    try { updateMetrics(); } catch (e) {}
                } catch (e) { console.warn('deferred UI reconcile failed', e); }
            }, 1000);
        } else {
            try { applyChanges(loadedCorrections); } catch (e) { console.warn('applyChanges failed', e); }
            // Update the table incrementally where possible to preserve scroll/focus
            const table = window.differencesTable || (typeof Tabulator !== 'undefined' && typeof Tabulator.findTable === 'function' ? Tabulator.findTable("#differencesTable")[0] : null);
            if (table) {
                try {
                    applyIncrementalChangesToTable(table, changedKeys);
                    // If we couldn't apply all changes incrementally, smartRefreshTable will be a no-op or perform minimal update
                    try { await smartRefreshTable(table); } catch (e) { console.warn('smartRefreshTable failed after sync', e); }
                } catch (e) { console.warn('incremental update after sync failed', e); }
            }
            // Update dropdown/options immediately
            try { populateCorrectValueDropdown(loadedCorrections); } catch (e) { console.warn('populateCorrectValueDropdown failed in attemptSyncLocalCorrections', e); }
            // Re-apply filters and update metrics
            try { applyGlobalFilters(); } catch (e) { console.warn('applyGlobalFilters failed in attemptSyncLocalCorrections', e); }
            try { updateMetrics(); } catch (e) { console.warn('updateMetrics failed in attemptSyncLocalCorrections', e); }
        }

        console.log('Local corrections synced to server');
    } catch (e) {
        console.warn('Sync to Cloudflare failed', e);
        // Update sync status to show out of sync
        const el = document.getElementById('syncStatus');
        if (el) {
            el.textContent = '⚠ Out of Sync';
            el.className = 'small text-danger';
        }
        // Keep any unsent localCorrections persisted; we'll retry later
        try { localStorage.setItem('gdosLocalCorrections', JSON.stringify(localCorrections)); } catch (e) { console.warn('localStorage write failed on sync error', e); }
    } finally {
        _syncInProgress = false;
        // If edits arrived during sync, schedule a retry shortly
        if (_syncRetryPending && Object.keys(localCorrections).length > 0) {
            console.log('Retrying sync because changes arrived during in-flight sync');
            setTimeout(() => attemptSyncLocalCorrections().catch(e => console.warn('retry sync failed', e)), 250);
        }
    }
}

// Update UI enabled state based on pending changes
function updateUIEnabledState() {
    const hasPending = Object.keys(localCorrections).length > 0;
    // Don't change Tabulator.editable dynamically; that can trigger re-renders which steal focus.
    // Instead, only disable global controls outside the table when pending.
    const tableEl = document.getElementById('differencesTable');
    const allButtons = Array.from(document.querySelectorAll('.btn'));
    allButtons.forEach(btn => {
        // Skip buttons that are inside the table to avoid interrupting row edits
        if (tableEl && tableEl.contains(btn)) return;
        if (hasPending) {
            btn.disabled = true;
            btn.title = 'Please wait for pending changes to sync';
        } else {
            btn.disabled = false;
            btn.title = '';
        }
    });
}

// Update the sync status badge
function updateSyncStatus() {
    const el = document.getElementById('syncStatus');
    const pending = Object.keys(localCorrections).length;
    const text = pending > 0 ? `⟳ Syncing ${pending} change${pending === 1 ? '' : 's'}...` : '✓ Synced';
    const className = pending > 0 ? 'small text-warning' : 'small text-success';
    if (el) {
        el.textContent = text;
        el.className = className;
    }
}

function showServerResponseModal(obj) {
    try {
        const pre = document.getElementById('serverResponseJson');
        if (!pre) return;
        pre.textContent = JSON.stringify(obj, null, 2);
        // show the modal using Bootstrap's modal API
        const modalEl = document.getElementById('serverResponseModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl, { keyboard: true });
        modal.show();

        // wire copy button
        const copyBtn = document.getElementById('copyServerResponseBtn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                copyToClipboard(pre.textContent || '');
                showTransientMessage('Server response copied to clipboard', 2000);
            };
        }
    } catch (e) {
        console.warn('showServerResponseModal failed', e);
    }
}

// Fetch latest server corrections with conditional GET. Returns { changed, payload }
async function pollServerForChanges() {
    try {
        const headers = Object.assign({}, authHeaders());
        if (serverEtag) headers['If-None-Match'] = String(serverEtag);
        const res = await fetch(SHARED_STORAGE_URL, { method: 'GET', headers });
        if (res.status === 304) {
            // No changes since last version
            return { changed: false };
        }
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const body = await res.json();
        // body may be { current, version } or just object
        const payload = body && body.current ? body : { current: body };
        const version = payload.version || payload.current && payload.current._version || null;
        // Prefer ETag header if present
        const etag = res.headers.get('ETag') || version || null;
        if (etag) serverEtag = String(etag);
        return { changed: true, payload };
    } catch (e) {
        console.warn('pollServerForChanges failed', e);
        return { changed: false, error: e };
    }
}

// Detect conflicts between queued deltas and authoritative server object
function detectConflictsWithQueue(serverObj) {
    // No queue, no conflicts
    return [];
}

function authHeaders() {
    return {};
}

// Raw JSONs for modal inspection
let rawUsw = null;
let rawUss = null;
let rawUsc = null;
let rawUse = null;
let rawLocations = null;

// Function to get nested value from object
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Normalize a state value which may be a string or an object (e.g. { id, name })
function extractStateValue(stateVal) {
    if (stateVal == null) return null;
    if (typeof stateVal === 'string') return stateVal;
    if (typeof stateVal === 'object') {
        // common name properties
        return stateVal.name || stateVal.text || stateVal.state || null;
    }
    return null;
}

// Normalization functions for comparison
function normalizeValue(value, field) {
    if (value == null) return null;
    let normalized = String(value).toLowerCase().trim();
    
    // Remove line breaks in OpenHoursText
    if (field === 'openHoursText') {
        normalized = normalized.replace(/[\r\n]+/g, ' ');
    }
    
    // Replace http:// with https://
    normalized = normalized.replace(/^http:\/\//, 'https://');
    
    // For name field, treat "Family" and "Thrift" as equivalent
    if (field === 'name') {
        normalized = normalized.replace(/\bFamily\b/gi, 'Thrift');
    }
    
    return normalized;
}

function shouldIgnoreField(field, zestyValue) {
    // Ignore when Zesty's PrimaryWebsite = https://satruck.org/
    if (field === 'primaryWebsite' && zestyValue && zestyValue.toLowerCase() === 'https://satruck.org/') {
        return true;
    }
    // Ignore latitude and longitude fields - GDOS value will be used for sync
    if (field === 'latitude' || field === 'longitude') {
        return true;
    }
    return false;
}

// Load JSON data from both territories and locations
Promise.all([
    fetch('GDOS-10-14-18-53-USW.json').then(response => {
        if (!response.ok) throw new Error('USW file not found');
        return response.json();
    }),
    fetch('GDOS-10-14-18-10-USS.json').then(response => {
        if (!response.ok) throw new Error('USS file not found');
        return response.json();
    }),
    fetch('GDOS-10-15-04-22-USC.json').then(response => {
        if (!response.ok) throw new Error('USC file not found');
        return response.json();
    }),
    fetch('GDOS-10-15-04-57-USE.json').then(response => {
        if (!response.ok) throw new Error('USE file not found');
        return response.json();
    }),
    fetch('../LocationsData.json?v=' + Date.now()).then(response => {
        if (!response.ok) throw new Error('LocationsData file not found');
        return response.json();
    }),
    fetch('./DuplicateLocationCheck.json?v=' + Date.now()).then(async response => {
        if (!response.ok) return { data: [] }; // treat as empty if not found
        try {
            return await response.json();
        } catch (e) {
            console.warn('DuplicateLocationCheck.json is empty or invalid, treating as empty');
            return { data: [] };
        }
    })
])
.then(([uswData, ussData, uscData, useData, locationsData, duplicateCheckData]) => {
    // store raw JSONs for modal use
    rawUsw = uswData;
    rawUss = ussData;
    rawUsc = uscData;
    rawUse = useData;
    rawLocations = locationsData;
    if (!Array.isArray(uswData)) throw new Error('USW data is not an array');
    if (!Array.isArray(ussData)) throw new Error('USS data is not an array');
    if (!Array.isArray(uscData)) throw new Error('USC data is not an array');
    if (!Array.isArray(useData)) throw new Error('USE data is not an array');
    if (!locationsData.data || !Array.isArray(locationsData.data)) throw new Error('LocationsData.data is not an array');
    if (!duplicateCheckData.data || !Array.isArray(duplicateCheckData.data)) throw new Error('DuplicateLocationCheck.data is not an array');

    // Extract the data arrays
    locationsData = locationsData.data.filter(loc => loc && typeof loc === 'object');
    duplicateCheckRecords = duplicateCheckData.data;
    console.log('First filtered loc:', locationsData[0]);
    console.log('LocationsData length after filter:', locationsData.length);

    console.log('GDOS USW data length:', uswData.length);
    console.log('GDOS USS data length:', ussData.length);
    console.log('GDOS USC data length:', uscData.length);
    console.log('GDOS USE data length:', useData.length);
    console.log('LocationsData length:', locationsData.length);

    // Create map from GDOS ID to location data
    const locationMap = new Map();
    locationsData.forEach((loc) => {
        const gdosId = loc['Column1.content.gdos_id'];
        if (gdosId || gdosId === 0) {
            // normalize key type to string to avoid mismatches
            locationMap.set(String(gdosId), loc);
        }
    });

    // Create map from gdosid to duplicate check data
    duplicateMap = new Map();
    duplicateCheckRecords.forEach(record => {
        // support several common key variants for GDOS id in the duplicate check data
        const gdosId = record && (record.gdosid ?? record.gdos_id ?? record.gdosId ?? record['gdos id'] ?? (record.gdos && record.gdos.id));
        if (gdosId || gdosId === 0) {
            duplicateMap.set(String(gdosId), record);
        }
    });

    console.log('Location map size:', locationMap.size);
    if (locationMap.size > 0) {
        const firstKey = locationMap.keys().next().value;
        console.log('Sample GDOS ID in map:', firstKey);
        console.log('Sample Zesty record for ID:', locationMap.get(firstKey)['Column1.content.name']);
    }

    // Combine GDOS data with territory info
    const gdosData = [
        ...uswData.map(item => ({ ...item, territory: 'USW' })),
        ...ussData.map(item => ({ ...item, territory: 'USS' })),
        ...uscData.map(item => ({ ...item, territory: 'USC' })),
        ...useData.map(item => ({ ...item, territory: 'USE' }))
    ];
    // populate gdosMap for lookups by id
    gdosData.forEach(g => {
        if (g && g.id) gdosMap.set(g.id, g);
    });
    console.log('Total GDOS data length:', gdosData.length);
    if (gdosData.length > 0) {
        console.log('Sample GDOS name:', gdosData[0].name);
        console.log('Sample normalized GDOS name:', normalizeValue(gdosData[0].name, 'name'));
    }

    // DEBUG: mapping diagnostics to help trace why only a subset of Zesty hours are appearing.
    try {
        const zestyWithHours = Array.from(locationMap.entries()).filter(([k, loc]) => {
            const h = getNestedValue(loc, 'Column1.content.hours_of_operation');
            return h !== undefined && h !== null && String(h).trim() !== '';
        });
        console.log('DEBUG: locationMap entries total:', locationMap.size);
        console.log('DEBUG: locationMap entries with non-empty hours_of_operation:', zestyWithHours.length);
        const matchedGdosCount = Array.from(locationMap.keys()).filter(k => gdosMap.has(String(k))).length;
        console.log('DEBUG: locationMap keys that match a GDOS id from the pull:', matchedGdosCount);
        const publishedGdosCount = gdosData.filter(g => g && g.published).length;
        const publishedWithLoc = gdosData.filter(g => g && g.published && locationMap.has(String(g.id))).length;
        console.log('DEBUG: published GDOS records in pull:', publishedGdosCount);
        console.log('DEBUG: published GDOS records that have a Zesty locationMap entry:', publishedWithLoc);
    } catch (e) { console.warn('DEBUG: mapping diagnostics failed', e); }

    // Fields to compare - with mapping for GDOS nested fields and Zesty flattened fields
    const fieldsToCompare = [
        { field: 'name', gdosPath: 'name', zestyPath: 'Column1.content.name' },
        { field: 'address', gdosPath: 'address1', zestyPath: 'Column1.content.address' },
        { field: 'latitude', gdosPath: 'location.latitude', zestyPath: 'Column1.content.latitude' },
        { field: 'longitude', gdosPath: 'location.longitude', zestyPath: 'Column1.content.longitude' },
        { field: 'zipcode', gdosPath: 'zip.zipcode', zestyPath: 'Column1.content.zipcode' },
        { field: 'phone', gdosPath: 'phone.phoneNumber', zestyPath: 'Column1.content.phoneNumber' },
        { field: 'siteTitle', gdosPath: 'name', zestyPath: 'Column1.content.siteTitle', alwaysShow: true }, // Always show for published records
        { field: 'openHoursText', gdosPath: 'openHoursText', zestyPath: 'Column1.content.openHoursText', alwaysShow: true } // Always show for published records
    ];

    // Find differences
    let matchCount = 0;
    let skippedNoMatch = 0;
    let skippedNotPublished = 0;
    let totalComparisons = 0;
    gdosData.forEach((gdos, index) => {
        // Skip if not published, but still track for statistics
        const isPublished = gdos.published;
        if (!isPublished) {
            skippedNotPublished++;
        }
        
    // look up by stringified GDOS id to match how we keyed the maps
    let loc = locationMap.get(String(gdos.id));
        
        if (!loc) {
            skippedNoMatch++;
            return;
        }
        
        matchCount++;
        if (matchCount === 1) { // Log first match
            console.log('First match - GDOS ID:', gdos.id, 'Name:', gdos.name);
            console.log('Zesty GDOS ID:', loc['Column1.content.gdos_id'], 'Name:', loc['Column1.content.name']);
        }
        const division = getNestedValue(gdos, 'location.division.name') || 'Unknown';
        const territory = gdos.territory;
        let duplicateRecord = duplicateMap.get(String(gdos.id));
        // Fallback: if map lookup missed (due to different key shapes or missing entries),
        // try scanning the raw duplicateCheckRecords array for common id variants.
        if (!duplicateRecord && Array.isArray(duplicateCheckRecords)) {
            duplicateRecord = duplicateCheckRecords.find(r => {
                if (!r) return false;
                const candidate = r.gdosid ?? r.gdos_id ?? r.gdosId ?? r['gdos id'] ?? (r.gdos && r.gdos.id);
                return String(candidate) === String(gdos.id);
            }) || null;
        }
        
        fieldsToCompare.forEach(fieldObj => {
            totalComparisons++;
            const gdosValue = getNestedValue(gdos, fieldObj.gdosPath);
            
            let zestyValue;
            if (fieldObj.field === 'openHoursText') {
                zestyValue = getNestedValue(loc, 'Column1.content.hours_of_operation');
            } else {
                zestyValue = loc[fieldObj.zestyPath]; // Flattened key
            }
            
            // Skip if should ignore this field
            if (shouldIgnoreField(fieldObj.field, zestyValue)) return;
            
            // Normalize values for comparison
            const normalizedGdos = normalizeValue(gdosValue, fieldObj.field);
            const normalizedZesty = normalizeValue(zestyValue, fieldObj.field);
            
            // Always show for published records if alwaysShow is true, or if there's a difference
            const hasDifference = normalizedGdos !== normalizedZesty && normalizedGdos != null && normalizedZesty != null;

            // For alwaysShow fields (siteTitle, openHoursText), show for all published records by default.
            // Additionally: if this is the openHoursText field and Zesty provides a non-empty
            // hours_of_operation value, show the row even when GDOS is not published. This surfaces
            // Zesty hours that otherwise get hidden by the published-only filter.
            const shouldShowAlwaysShow = fieldObj.alwaysShow && (isPublished || (fieldObj.field === 'openHoursText' && zestyValue !== undefined && zestyValue !== null && String(zestyValue).trim() !== ''));
            
            if (shouldShowAlwaysShow || hasDifference) {
                // Special handling for siteTitle alwaysShow rows
                let correctValue = hasDifference ? 'GDOS' : 'Zesty';
                let zestyVal = zestyValue || '';
                let isSiteTitleRow = false;
                
                if (fieldObj.field === 'siteTitle' && fieldObj.alwaysShow) {
                    // For siteTitle alwaysShow, default to GDOS
                    correctValue = 'GDOS';
                    // Prepopulate with Zesty name if it's different from GDOS name
                    const zestyName = loc['Column1.content.name'];
                    if (zestyName && zestyName !== gdos.name) {
                        zestyVal = zestyName;
                    } else {
                        zestyVal = '';
                    }
                    isSiteTitleRow = true;
                }
                
                if (fieldObj.field === 'openHoursText' && fieldObj.alwaysShow) {
                    // For openHoursText alwaysShow, default to GDOS
                    correctValue = 'GDOS';
                    // Use the hours_of_operation value (assigned earlier to zestyValue)
                    // so the Zesty column is always populated when that field exists.
                    if (zestyValue) {
                        zestyVal = zestyValue;
                        console.debug('Populating openHoursText zestyVal from hours_of_operation for GDOS id', gdos.id);
                    } else {
                        zestyVal = '';
                        console.debug('No Zesty hours_of_operation found for GDOS id', gdos.id);
                    }
                }
                
                differencesData.push({
                    gdos_id: gdos.id,
                    name: gdos.name,
                    property_type: getNestedValue(gdos, 'wm4SiteType.name') || 'Unknown',
                    division: division,
                    territory: territory,
                    published: isPublished ? 'True' : 'False',
                    // If duplicateRecord exists, use the file values exactly (stringified); otherwise use defaults
                    duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
                    doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False',
                    field: fieldObj.field,
                    gdos_value: gdosValue,
                    zesty_value: zestyVal, // Allow empty zesty value for editing
                    correct: correctValue,
                    editable: fieldObj.alwaysShow, // Mark as editable for alwaysShow fields
                    siteTitleRow: isSiteTitleRow
                });
            }
        });

        // Additionally, if a GDOS record is identified as a duplicate or Do Not Import, show a synthetic 'published' row so
        // the team can mark it unpublished (published=false) before import.
        const isDuplicate = duplicateRecord && duplicateRecord.duplicate === '1';
        const doNotImportFlag = duplicateRecord && (duplicateRecord.doNotImport === 'True' || duplicateRecord.doNotImport === true || String(duplicateRecord.doNotImport).toLowerCase() === 'true');
        if (isDuplicate || doNotImportFlag) {
            // push a published-field difference if one doesn't already exist for this record
            const already = differencesData.find(d => d.gdos_id === gdos.id && d.field === 'published');
            if (!already) {
                differencesData.push({
                    gdos_id: gdos.id,
                    name: gdos.name,
                    property_type: getNestedValue(gdos, 'wm4SiteType.name') || 'Unknown',
                    division: division,
                    territory: territory,
                    published: isPublished ? 'True' : 'False',
                    // reflect duplicate/doNotImport exactly as present in DuplicateLocationCheck.json when available
                    duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
                    doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False',
                    field: 'published',
                    gdos_value: isPublished ? 'True' : 'False',
                    zesty_value: 'False',
                    correct: 'Zesty',
                    synthetic: true
                });
            }
        }
    });

    // Now, add synthetic 'published' rows for all published GDOS records that have no Zesty match,
    // so they can be marked as unpublished before import.
    gdosData.forEach((gdos) => {
        const isPublished = gdos.published;
        if (!isPublished) return; // Only for published records

        const hasMatch = locationMap.has(String(gdos.id));
        if (hasMatch) return; // Already handled in the main loop

        // Look up duplicate record
        let duplicateRecord = duplicateMap.get(String(gdos.id));
        if (!duplicateRecord && Array.isArray(duplicateCheckRecords)) {
            duplicateRecord = duplicateCheckRecords.find(r => {
                if (!r) return false;
                const candidate = r.gdosid ?? r.gdos_id ?? r.gdosId ?? r['gdos id'] ?? (r.gdos && r.gdos.id);
                return String(candidate) === String(gdos.id);
            }) || null;
        }

        // Only add synthetic row if doNotImport is 'True' (meaning it cannot be imported as is, so needs to be unpublished)
        const doNotImportFlag = duplicateRecord && (duplicateRecord.doNotImport === 'True' || duplicateRecord.doNotImport === true || String(duplicateRecord.doNotImport).toLowerCase() === 'true');
        if (!doNotImportFlag) return;

        const division = getNestedValue(gdos, 'location.division.name') || 'Unknown';
        const territory = gdos.territory;

        // Add synthetic 'published' row
        differencesData.push({
            gdos_id: gdos.id,
            name: gdos.name,
            property_type: getNestedValue(gdos, 'wm4SiteType.name') || 'Unknown',
            division: division,
            territory: territory,
            published: 'True', // Since it's published in GDOS
            // Use file values if available, else defaults
            duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
            doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False',
            field: 'published',
            gdos_value: 'True',
            zesty_value: 'False', // Default to unpublished
            correct: 'Zesty',
            synthetic: true
        });
    });

    console.log('Skipped not published:', skippedNotPublished);
    console.log('Skipped no match:', skippedNoMatch);
    console.log('Matched GDOS records:', matchCount);
    console.log('Total field comparisons:', totalComparisons);
    console.log('Differences found (before adding Zesty-only openHoursText rows):', differencesData.length);
    
    // ADDITIONAL PASS: Add openHoursText rows for Zesty locations that have hours_of_operation
    // but were not processed in the main GDOS loop (either because they have no GDOS match,
    // or the GDOS record is not published). This ensures all Zesty hours are editable.
    let zestyOnlyOpenHoursCount = 0;
    locationsData.forEach(loc => {
        if (!loc) return;
        const gdosId = loc['Column1.content.gdos_id'];
        if (!gdosId && gdosId !== 0) return; // Skip if no gdos_id
        
        const hoursOfOperation = getNestedValue(loc, 'Column1.content.hours_of_operation');
        if (!hoursOfOperation || String(hoursOfOperation).trim() === '') return; // Skip if no hours
        
        // Check if we already created an openHoursText row for this gdos_id
        const alreadyExists = differencesData.some(r => String(r.gdos_id) === String(gdosId) && r.field === 'openHoursText');
        if (alreadyExists) return; // Already have a row for this
        
        // This Zesty location has hours but no openHoursText row yet - create one
        // Look up GDOS record if it exists (may be unpublished or not in pull)
        const gdosRecord = gdosMap.get(String(gdosId));
        const gdosName = gdosRecord ? gdosRecord.name : loc['Column1.content.name'] || 'Unknown';
        const gdosValue = gdosRecord ? gdosRecord.openHoursText : null;
        const isPublished = gdosRecord ? gdosRecord.published : false;
        const division = gdosRecord ? getNestedValue(gdosRecord, 'location.division.name') || 'Unknown' : 'Unknown';
        const territory = gdosRecord ? gdosRecord.territory : 'Unknown';
        const propertyType = gdosRecord ? getNestedValue(gdosRecord, 'wm4SiteType.name') || 'Unknown' : 'Unknown';
        
        // Look up duplicate record
        let duplicateRecord = duplicateMap.get(String(gdosId));
        if (!duplicateRecord && Array.isArray(duplicateCheckRecords)) {
            duplicateRecord = duplicateCheckRecords.find(r => {
                if (!r) return false;
                const candidate = r.gdosid ?? r.gdos_id ?? r.gdosId ?? r['gdos id'] ?? (r.gdos && r.gdos.id);
                return String(candidate) === String(gdosId);
            }) || null;
        }
        
        differencesData.push({
            gdos_id: gdosId,
            name: gdosName,
            property_type: propertyType,
            division: division,
            territory: territory,
            published: isPublished ? 'True' : 'False',
            duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
            doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False',
            field: 'openHoursText',
            gdos_value: gdosValue,
            zesty_value: hoursOfOperation,
            correct: 'GDOS',
            editable: true,
            siteTitleRow: false
        });
        zestyOnlyOpenHoursCount++;
    });
    
    console.log('Added Zesty-only openHoursText rows:', zestyOnlyOpenHoursCount);
    console.log('Total differences found:', differencesData.length);
    
    // Count openHoursText rows with populated vs empty Zesty values
    const openHoursTextRows = differencesData.filter(r => r.field === 'openHoursText');
    const openHoursTextWithZesty = openHoursTextRows.filter(r => r.zesty_value && String(r.zesty_value).trim() !== '');
    console.log('=== OPEN HOURS TEXT DIAGNOSTIC ===');
    console.log('Total openHoursText rows:', openHoursTextRows.length);
    console.log('openHoursText rows WITH Zesty value:', openHoursTextWithZesty.length);
    console.log('openHoursText rows WITHOUT Zesty value:', openHoursTextRows.length - openHoursTextWithZesty.length);
    console.log('==================================');
    
    if (differencesData.length > 0) {
        console.log('Sample difference:', differencesData[0]);
    }

    // Load any previously saved changes and only render after corrections are applied.
    // This prevents the table from rendering once and then switching when saved corrections arrive.
    loadSavedChanges().then(() => {
        try { renderDifferencesTable(); } catch (e) { console.error('renderDifferencesTable failed', e); }
    }).catch(err => {
        console.warn('loadSavedChanges failed, still rendering table', err);
        try { renderDifferencesTable(); } catch (e) { console.error('renderDifferencesTable failed', e); }
    });
})
.catch(error => {
    console.error('Error loading data:', error);
    alert('Error loading data: ' + error.message);
});

// Function to show transient messages
function showTransientMessage(message, durationMs = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info alert-dismissible fade show position-fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, durationMs);
}

// Loading overlay functions
function showLoadingOverlay() {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
        document.body.appendChild(overlay);
    }
    // Allow pointer events to pass through the overlay so inputs inside the table remain interactive
    overlay.style.pointerEvents = 'none';
    // Allow the spinner itself to be the only element that can receive pointer events (optional)
    try { if (overlay.firstElementChild) overlay.firstElementChild.style.pointerEvents = 'auto'; } catch (e) {}
    overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Function to load saved changes from server
async function loadSavedChanges() {
    showLoadingOverlay();
    // Save scroll position
    const scrollY = window.scrollY;
    // Load localCorrections from localStorage
    try {
        const stored = localStorage.getItem('gdosLocalCorrections');
        if (stored) {
            localCorrections = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load localCorrections from localStorage', e);
        localCorrections = {};
    }

    let corrections = {};
    try {
        const response = await fetch(SHARED_STORAGE_URL);
        if (!response.ok) throw new Error('Shared storage not available');
        const data = await response.json();

        // Support worker responses that wrap the authoritative object as { current, version }
        const payload = (data && typeof data === 'object' && data.current) ? data.current : data;

        if (payload && typeof payload === 'object') {
            corrections = payload;
        } else {
            corrections = {};
        }

        // Check if storage is empty (cleared)
        if (Object.keys(corrections).length === 0) {
            console.log('Storage is empty, performing hard reset');
            // Clear localCorrections
            localCorrections = {};
            localStorage.removeItem('gdosLocalCorrections');
            // Clear filter localStorage
            localStorage.removeItem('globalTerritoryFilter');
            localStorage.removeItem('globalCorrectFilter');
            localStorage.removeItem('globalFieldFilter');
            localStorage.removeItem('hideSiteTitleOpenHours');
            // Reset sync state
            syncState.pending = 0;
            updateSyncStatus();
            // Show message
            showTransientMessage('Storage cleared - all corrections reset', 5000);
        }

    } catch (e) {
        console.warn('Failed to load from Cloudflare Worker', e);
        corrections = {};
        alert('Failed to load corrections from Cloudflare. Please check connection.');
    }

    try {
        // Set loadedCorrections
        loadedCorrections = Object.assign({}, corrections);

        if (typeof corrections === 'object' && corrections !== null) {
            applyChanges(corrections);
            console.log('Corrections loaded from Cloudflare Worker');
            const table = window.differencesTable || (typeof Tabulator !== 'undefined' && typeof Tabulator.findTable === 'function' ? Tabulator.findTable("#differencesTable")[0] : null);
            if (table) {
                try {
                    // Try to apply incremental changes using the keys present in corrections
                    const changedKeys = Object.keys(corrections || {});
                    applyIncrementalChangesToTable(table, changedKeys);
                    try { await smartRefreshTable(table); } catch (e) { /* ignore */ }
                } catch (e) { console.warn('incremental update during loadSavedChanges failed', e); }
            }
            populateCorrectValueDropdown(corrections);
        }
    } finally {
        // Do not programmatically change scroll position here. Restoring scroll can
        // cause unwanted jumps while the UI is updating (especially during frequent
        // polls). We still hide the loading overlay.
        hideLoadingOverlay();
    }
}

function correctValueFormatter(cell, formatterParams, onRendered) {
    const value = cell.getValue();
    const row = cell.getRow();
    const rowData = row.getData();

    const select = document.createElement('select');
    select.className = 'form-select form-select-sm';
    let options = `
        <option value="GDOS" ${value === 'GDOS' ? 'selected' : ''}>GDOS</option>
        <option value="Zesty" ${value === 'Zesty' ? 'selected' : ''}>Zesty</option>
    `;
    select.innerHTML = options;
    select.value = value;
    
    // Do not programmatically disable selects here - that can steal focus. We'll ignore changes while pending instead.
    
    select.addEventListener('change', function() {
        const row = cell.getRow();
        const rowData = row.getData();
        const isCustomField = rowData.field === 'siteTitle' || rowData.field === 'openHoursText';
        // If there are pending changes, ignore this change (unless custom field) and inform the user.
        if (Object.keys(localCorrections).length > 0 && !isCustomField) {
            showTransientMessage('Please wait for pending changes to finish syncing before making another change', 2000);
            return;
        }
        const newValue = this.value;
        rowData.correct = newValue;
        rowData.final_value = newValue === 'GDOS' ? rowData.gdos_value : rowData.zesty_value;
        row.update(rowData);
        // If this is a synthetic row and correct is changed to 'GDOS', remove it from the table
        if (rowData.synthetic && newValue === 'GDOS') {
            row.delete();
        }
        // Try toggling the underline on the rendered value spans so change is immediate
        try {
            const gdosCell = row.getCell('gdos_value');
            const zestyCell = row.getCell('zesty_value');
            if (gdosCell) {
                const el = gdosCell.getElement();
                const span = el ? el.querySelector('.value-text') : null;
                if (span) span.classList.toggle('selected-underline', newValue === 'GDOS');
            }
            if (zestyCell) {
                const el = zestyCell.getElement();
                const span = el ? el.querySelector('.value-text') : null;
                if (span) span.classList.toggle('selected-underline', newValue === 'Zesty');
            }
        } catch (e) {
            console.warn('toggle underline failed', e);
        }
        
        // Persist this single change immediately (updates localCorrections, queue, and schedules send)
        try { persistSingleCorrection(rowData); } catch (e) { console.warn('persistSingleCorrection failed in select change handler', e); }
    });
    return select;
}

function finalValueFormatter(cell, formatterParams, onRendered) {
    const row = cell.getRow();
    const correctValue = row.getData().correct;
    const gdosValue = row.getData().gdos_value;
    const zestyValue = row.getData().zesty_value;
    
    return correctValue === 'GDOS' ? gdosValue : zestyValue;
}

function fieldFormatter(cell, formatterParams, onRendered) {
    const field = cell.getValue();
    return field;
}

function gdosValueFormatter(cell, formatterParams, onRendered) {
    const row = cell.getRow();
    const correctValue = row.getData().correct;
    const value = cell.getValue();

    const span = document.createElement('span');
    span.className = 'value-text' + (correctValue === 'GDOS' ? ' selected-underline' : '');
    span.textContent = value;
    return span;
}

function zestyValueFormatter(cell, formatterParams, onRendered) {
    const row = cell.getRow();
    const correctValue = row.getData().correct;
    const value = cell.getValue();
    const rowData = row.getData();

    // For editable rows (alwaysShow fields), create an input field
    if (rowData.editable) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control form-control-sm';
        input.value = value || '';
        
        // For openHoursText, show the current Zesty hours_of_operation value as the input's value
        if (rowData.field === 'openHoursText') {
            const gdosId = rowData.gdos_id;
            const zestyRecord = rawLocations && Array.isArray(rawLocations.data) ? rawLocations.data.find(loc => getNestedValue(loc, 'Column1.content.gdos_id') == gdosId) : null;
            const hoursOfOperation = zestyRecord ? getNestedValue(zestyRecord, 'Column1.content.hours_of_operation') : '';
            // Prioritize the existing value (from saved corrections), but fall back to hoursOfOperation.
            input.value = value || hoursOfOperation || '';
            input.placeholder = 'Enter custom value...';
        } else {
            input.value = value || '';
            input.placeholder = 'Enter custom value...';
        }

        // Do not disable the input element programmatically (it causes layout changes). We'll ignore attempts to change while pending.
        // For custom openHoursText and siteTitle fields, persist on blur instead of input to avoid every keystroke
        const eventType = (rowData.field === 'siteTitle' || rowData.field === 'openHoursText') ? 'blur' : 'input';
        input.addEventListener(eventType, function() {
            const newValue = this.value;
            // Update the row data directly
            rowData.zesty_value = newValue;
            rowData.final_value = newValue; // Since editable rows use Zesty value

            // Persist this single change immediately so every keystroke is saved to local storage and queued for sync.
            // If a sync is already in-flight, the attemptSyncLocalCorrections() serializer will retry after the current run.
            try { persistSingleCorrection(rowData); } catch (e) { console.warn('persistSingleCorrection failed in input handler', e); }
        });
        return input;
    }

    // Default behavior for non-editable rows
    const span = document.createElement('span');
    span.className = 'value-text' + (correctValue === 'Zesty' ? ' selected-underline' : '');
    span.textContent = value;
    return span;
}

function saveChanges() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        const data = table.getData();
    // Save to shared storage and a local fallback (localStorage) so UI changes persist immediately
        const corrections = {};
        // Use territory-prefixed keys so stored corrections can be mapped back to the correct row
        data.filter(r => r.correct !== 'GDOS').forEach(r => {
            const key = `${r.territory}-${r.gdos_id}-${r.field}`;
            // Save the chosen correct value and include any Zesty value present
            const entry = { correct: r.correct };
            if (r.zesty_value !== undefined && r.zesty_value !== null && String(r.zesty_value).trim() !== '') {
                entry.value = r.zesty_value;
            }
            corrections[key] = entry;
        });
        // Persist a local copy immediately so reloads reflect the user's change even if shared storage is slow/unavailable
        try {
            localStorage.setItem('localCorrections', JSON.stringify(corrections));
        } catch (e) { console.warn('localStorage write failed', e); }
        console.log('Saving corrections to shared storage:', corrections);
        // Compute minimal delta against loadedCorrections
        const delta = {};
        Object.entries(corrections).forEach(([k, v]) => {
            // If key is new or value changed, include in delta
            const existing = loadedCorrections[k];
            if (!existing || JSON.stringify(existing) !== JSON.stringify(v)) {
                delta[k] = v;
            }
        });
        // Also detect removals (keys present in loadedCorrections but now absent)
        Object.keys(loadedCorrections).forEach(k => {
            if (!corrections[k]) {
                // mark as null to indicate deletion
                delta[k] = null;
            }
        });

        // If no changes, still update metrics and return resolved promise
        if (Object.keys(delta).length === 0) {
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
            return Promise.resolve();
        }

        // Send delta directly to Cloudflare
        const payload = JSON.stringify(delta);
        console.log('Sending delta to Cloudflare:', delta);
        return fetch(SHARED_STORAGE_URL, {
            method: 'PATCH',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: payload
        })
        .then(async response => {
            if (!response.ok) throw new Error(`Status ${response.status}`);
            // Parse server response and reconcile authoritative state if provided
            let body = null;
            try { body = await response.json(); } catch (e) { body = null; }
            try {
                reconcileServerState(body);
            } catch (e) {
                console.warn('reconcileServerState failed after save', e);
                // Fallback: merge delta into loadedCorrections
                Object.entries(delta).forEach(([k, v]) => {
                    if (v === null) delete loadedCorrections[k]; else loadedCorrections[k] = v;
                });
                try { localStorage.setItem('localCorrections', JSON.stringify(loadedCorrections)); } catch (e) { console.warn('localStorage write failed', e); }
                try { populateCorrectValueDropdown(loadedCorrections); } catch(e) { console.warn('populateCorrectValueDropdown failed after save', e); }
            }
            console.log('Save succeeded and server reconciled');
        })
        .catch(error => {
            console.warn('Save failed:', error);
            alert('Failed to save to Cloudflare. Please check connection and try again.');
        })
        .finally(() => {
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
        });
    }
}

function updateMetrics() {
    const table = window.differencesTable || Tabulator.findTable("#differencesTable")[0];
    if (!table) return;
    // Determine visible (filtered) data that the table is currently showing
    let data = null;
    if (Array.isArray(latestFilteredData)) {
        data = latestFilteredData.slice();
    } else {
        try {
            if (typeof table.getRows === 'function') {
                const rows = table.getRows();
                const visibleRows = rows.filter(r => {
                    try {
                        const el = r.getElement();
                        return !!(el && el.offsetParent !== null);
                    } catch (e) {
                        return true;
                    }
                });
                data = visibleRows.map(r => r.getData());
            }
        } catch (e) {
            // ignore and fallback
        }
        if (!Array.isArray(data)) data = table.getData();
    }

    // visible (filtered) counts
    const visible = Array.isArray(data) ? data.slice() : [];
    const visibleTotal = visible.length;
    const visibleGdos = visible.filter(r => r && r.correct === 'GDOS').length;
    const visibleZesty = visible.filter(r => r && r.correct === 'Zesty').length;

    // totals across the entire dataset (unfiltered)
    // Determine pull-level data: differencesData filtered only by territory selection (ignore other filters)
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const territoryVal = territorySelect && territorySelect.value && territorySelect.value !== 'all' ? territorySelect.value : null;
    const pullData = Array.isArray(differencesData) ? (territoryVal ? differencesData.filter(r => r && r.territory === territoryVal) : differencesData.slice()) : [];
    const total = pullData.length;
    const gdosCount = pullData.filter(r => r && r.correct === 'GDOS').length;
    const zestyCount = pullData.filter(r => r && r.correct === 'Zesty').length;

    // Compute pull-level per-field totals (counts of rows per field within the pull)
    const pullFieldCounts = pullData.reduce((acc, r) => {
        if (!r) return acc;
        const f = r.field || 'unknown';
        acc[f] = (acc[f] || 0) + 1;
        return acc;
    }, {});

    // per-field counts for visible data
    const fieldCounts = visible.reduce((acc, r) => {
        const f = r && r.field ? r.field : 'unknown';
        acc[f] = (acc[f] || 0) + 1;
        return acc;
    }, {});

    const metricTotal = document.getElementById('metricTotal');
    const metricGdos = document.getElementById('metricGdos');
    const metricZesty = document.getElementById('metricZesty');
    const metricFields = document.getElementById('metricFields');
    if (metricTotal) metricTotal.textContent = visibleTotal;
    if (metricGdos) metricGdos.textContent = visibleGdos;
    if (metricZesty) metricZesty.textContent = visibleZesty;
    if (metricFields) {
        // Keep the field breakdown as a compact text line (no pills)
        const excluded = new Set(['address', 'name', 'zipcode', 'siteTitle', 'openHoursText']);
        metricFields.innerHTML = Object.keys(fieldCounts).filter(k => !excluded.has(k)).sort().map(k => `${k}: ${fieldCounts[k]}`).join('  •  ');
    }
    // Update the new Field Totals (pull-level) card
    try {
        const metricFieldTotals = document.getElementById('metricFieldTotals');
        if (metricFieldTotals) {
            const items = Object.keys(pullFieldCounts).sort();
            if (items.length === 0) {
                metricFieldTotals.innerHTML = '-';
            } else {
                // Build HTML of spans so CSS can control wrapping (break after third)
                metricFieldTotals.innerHTML = items.map(k => {
                    const v = pullFieldCounts[k] || 0;
                    return `<span class="metric-field-item">${escapeHtml(k)}: ${v}</span>`;
                }).join('');
            }
        }
    } catch (e) { console.warn('Failed to update metricFieldTotals', e); }
    // Published-field differences: rows where the compared field is 'published' and GDOS and Zesty values differ
    try {
        const metricPublishedZesty = document.getElementById('metricPublishedZesty');
        if (metricPublishedZesty) {
            // Rows in pullData whose field is 'published' and values differ (normalized)
            const publishedDiffRows = pullData.filter(r => {
                try {
                    if (!r || String(r.field).toLowerCase() !== 'published') return false;
                    // Treat missing values as empty strings so rows with only one side present are counted
                    const gval = normalizeValue(r.gdos_value, 'published') || '';
                    const zval = normalizeValue(r.zesty_value, 'published') || '';
                    return gval !== zval;
                } catch (e) { return false; }
            });
            const publishedDiffRowCount = publishedDiffRows.length;
            const publishedDiffUnique = new Set(publishedDiffRows.map(r => String(r.gdos_id))).size;

            // Show the row-level published-field difference count (this matches 'published differences' rows in the table)
            metricPublishedZesty.textContent = String(publishedDiffRowCount);
            metricPublishedZesty.title = `Published-field differences in pull: ${publishedDiffRowCount} (unique records: ${publishedDiffUnique})`;
        }
    } catch (e) { console.warn('Failed to compute published-field differences metric', e); }

    // Also update published badges for Total Differences and Correct = GDOS cards
    try {
        const metricPublishedTotal = document.getElementById('metricPublishedTotal');
        const metricPublishedGdos = document.getElementById('metricPublishedGdos');
        if (metricPublishedTotal) {
            // total published-field difference rows in pullData
            const totalPublishedDiffs = pullData.filter(r => r && String(r.field).toLowerCase() === 'published' && normalizeValue(r.gdos_value, 'published') != null && normalizeValue(r.zesty_value, 'published') != null && normalizeValue(r.gdos_value, 'published') !== normalizeValue(r.zesty_value, 'published')).length;
            metricPublishedTotal.textContent = String(totalPublishedDiffs);
            metricPublishedTotal.title = `Published-field differences in pull: ${totalPublishedDiffs}`;
        }
        if (metricPublishedGdos) {
            // published-field difference rows where correct === 'GDOS' (in pullData)
            const gdosPublishedDiffs = pullData.filter(r => r && String(r.field).toLowerCase() === 'published' && r.correct === 'GDOS' && normalizeValue(r.gdos_value, 'published') != null && normalizeValue(r.zesty_value, 'published') != null && normalizeValue(r.gdos_value, 'published') !== normalizeValue(r.zesty_value, 'published')).length;
            metricPublishedGdos.textContent = String(gdosPublishedDiffs);
            metricPublishedGdos.title = `Published-field differences (Correct = GDOS) in pull: ${gdosPublishedDiffs}`;
        }
    } catch (e) { console.warn('Failed to update additional published metrics', e); }
}

async function loadSavedChanges() {
    showLoadingOverlay();
    const preSnapshot = snapshotDifferences();
    // Load localCorrections from localStorage
    try {
        const stored = localStorage.getItem('gdosLocalCorrections');
        if (stored) {
            localCorrections = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load localCorrections from localStorage', e);
        localCorrections = {};
    }
    let corrections = {};
    try {
        const response = await fetch(SHARED_STORAGE_URL);
        if (!response.ok) throw new Error('Shared storage not available');
        const data = await response.json();

        // Support worker responses that wrap the authoritative object as { current, version }
        const payload = (data && typeof data === 'object' && data.current) ? data.current : data;

        if (payload && typeof payload === 'object' && payload.data && Array.isArray(payload.data)) {
            // Old format: convert array to object
            corrections = {};
            payload.data.forEach(savedRow => {
                const key = `${savedRow.gdos_id}-${savedRow.field}`;
                corrections[key] = {
                    correct: savedRow.correct,
                    value: savedRow.customZestyValue || savedRow.zesty_value
                };
            });
        } else {
            // New format: payload is the corrections object directly
            corrections = payload || {};
        }

    } catch (e) {
        console.warn('Failed to load from Cloudflare Worker', e);
        corrections = {};
        alert('Failed to load corrections from Cloudflare. Please check connection.');
    }

    try {
        // Set loadedCorrections
        loadedCorrections = Object.assign({}, corrections);

        if (typeof corrections === 'object' && corrections !== null) {
            applyChanges(corrections);
            console.log('Corrections loaded from Cloudflare Worker');
            const table = window.differencesTable || (typeof Tabulator !== 'undefined' && typeof Tabulator.findTable === 'function' ? Tabulator.findTable("#differencesTable")[0] : null);
            if (table) {
                try {
                    await smartRefreshTable(table);
                } catch (e) { console.warn('smartRefreshTable failed during loadSavedChanges', e); }
            } else {
                // Table isn't initialized yet or doesn't provide a setData/replaceData API
                console.debug('Table not present or lacks setData/replaceData; table will be created later with current differencesData.');
            }
            populateCorrectValueDropdown(corrections);

            const postSnapshot = snapshotDifferences();
            const changed = [];
            postSnapshot.forEach((after, key) => {
                const before = preSnapshot.get(key);
                if (!before) return;
                if (String(before.gdos_value) !== String(after.gdos_value) || String(before.zesty_value) !== String(after.zesty_value) || String(before.published) !== String(after.published)) {
                    changed.push({ key, before, after });
                }
            });
            if (changed.length > 0) {
                console.warn('Underlying data changed since last snapshot:', changed.slice(0,10));
                // Silently handle data changes - they'll be reconciled in the next poll
                // Don't show unhelpful messages that confuse users
            }
            return;
        }
    } finally {
        try { applyPendingCorrections(); } catch (e) { console.warn('applyPendingCorrections failed in finally', e); }
        hideLoadingOverlay();
    }
}




// Shared storage configuration - using Cloudflare Worker for storage
const SHARED_STORAGE_URL = 'https://gdos-corrections-worker.uss-thq-cloudflare-account.workers.dev/';

// ETag / version of last seen server snapshot (used for conditional GET)
let serverEtag = null;

// Conflict notification throttling
let _lastConflictNotify = 0;

// Fetch latest server corrections with conditional GET. Returns { changed, payload }
async function pollServerForChanges() {
    try {
        const headers = Object.assign({}, authHeaders());
        if (serverEtag) headers['If-None-Match'] = String(serverEtag);
        const res = await fetch(SHARED_STORAGE_URL, { method: 'GET', headers });
        if (res.status === 304) {
            // No changes since last version
            return { changed: false };
        }
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const body = await res.json();
        // body may be { current, version } or just object
        const payload = body && body.current ? body : { current: body };
        serverEtag = res.headers.get('ETag') || null;
        return { changed: true, payload: payload.current };
    } catch (e) {
        console.warn('pollServerForChanges failed', e);
        return { changed: false };
    }
}

// Detect conflicts between queued deltas and authoritative server object
function detectConflictsWithQueue(serverObj) {
    // No queue, no conflicts
    return [];
}

// Poll loop that runs periodically to keep UI in sync with remote changes and detect conflicts
async function startServerPoll(intervalMs = 10000) {
    try {
        // If the user is actively editing inside the table, avoid running the poll work
        // that may re-render or modify the table. Defer until editing stops to avoid
        // stealing focus or making fields appear readonly during sync.
        if (isUserEditingInTable()) {
            console.log('Polling deferred because user is editing; retrying shortly');
            // Retry sooner so UI stays in sync shortly after editing finishes
            scheduleNextPoll(1000);
            return;
        }

        const result = await pollServerForChanges();
        if (result.changed) {
            // Server has new data, reconcile
            console.log('Poll detected server changes, reconciling...');
            reconcileServerState(result.payload);
            // reset backoff after a real change
            pollBackoffCount = 0;
            pollIntervalMs = pollIntervalMsDefault;
        } else {
            // No change: increase backoff slowly up to max interval
            pollBackoffCount = Math.min(pollBackoffCount + 1, 10);
            pollIntervalMs = Math.min(pollIntervalMsDefault * Math.pow(1.5, pollBackoffCount), pollMaxInterval);
        }

        // Attempt to sync localCorrections (this is serialized internally)
        await attemptSyncLocalCorrections();
    } catch (e) {
        console.warn('startServerPoll failed', e);
        // On error, backoff a bit
        pollBackoffCount = Math.min(pollBackoffCount + 2, 10);
        pollIntervalMs = Math.min(pollIntervalMsDefault * Math.pow(1.5, pollBackoffCount), pollMaxInterval);
    } finally {
        // Schedule next poll using adaptive interval
        scheduleNextPoll(pollIntervalMs);
    }
}

// start polling when app initializes (after a short delay to avoid clashing with initial load)
function scheduleNextPoll(ms) {
    try { if (_serverPollTimeoutId) clearTimeout(_serverPollTimeoutId); } catch (e) {}
    _serverPollTimeoutId = setTimeout(() => startServerPoll(pollIntervalMs), ms);
}

setTimeout(() => startServerPoll(pollIntervalMsDefault), 5000);

// Listen for cross-tab notifications and trigger immediate reconcile/sync when another tab posts changes
if (_bc) {
    _bc.onmessage = (ev) => {
        try {
            const data = ev.data || {};
            if (data && data.type === 'localCorrection') {
                console.log('Received localCorrection broadcast from another tab; scheduling background sync');
                // Schedule a background sync so we don't interrupt editing in this tab
                scheduleBackgroundSync(1000);
                // Also trigger a near-term poll to pick up authoritative state later
                scheduleNextPoll(500);
            }
            if (data && data.type === 'serverReconcile') {
                console.log('Received serverReconcile broadcast; reconciling now (deferred if editing)');
                // If the user is editing, stash the reconcile payload and apply after idle
                if (isUserEditingInTable()) {
                    _pendingServerReconcile = data.payload;
                    // apply after short idle
                    if (_backgroundSyncTimeoutId) clearTimeout(_backgroundSyncTimeoutId);
                    _backgroundSyncTimeoutId = setTimeout(() => {
                        try { reconcileServerState(_pendingServerReconcile); _pendingServerReconcile = null; } catch (e) { console.warn('deferred reconcile failed', e); }
                    }, 1500);
                } else {
                    try { reconcileServerState(data.payload); } catch (e) { console.warn('reconcileServerState failed on broadcast', e); }
                }
            }
        } catch (e) { console.warn('BroadcastChannel onmessage failed', e); }
    };
}

function authHeaders() {
    return {};
}

function populateCorrectValueDropdown(corrections) {
    const select = document.getElementById('globalCorrectFilter');
    if (!select) return;

    const currentValue = select.value;

    // Clear existing options except 'All'
    // Keep a stable set of base options (so built-in choices remain available)
    select.innerHTML = '<option value="all">All</option>';
    const baseOptions = ['GDOS', 'Zesty', 'Zesty Custom Value to openHoursText'];
    baseOptions.forEach(optVal => {
        const o = document.createElement('option');
        o.value = optVal;
        o.textContent = optVal;
        select.appendChild(o);
    });

    // Find unique correct values from corrections and add any that are not base options
    try {
        const uniqueCorrects = new Set();
        Object.values(corrections || {}).forEach(correction => {
            if (correction && correction.correct) uniqueCorrects.add(correction.correct);
        });
        Array.from(uniqueCorrects).sort().forEach(correct => {
            if (baseOptions.includes(correct) || correct === 'all') return;
            const option = document.createElement('option');
            option.value = correct;
            option.textContent = correct;
            select.appendChild(option);
        });
        console.log('Populated correct value dropdown with options (merged):', Array.from(uniqueCorrects));
    } catch (e) {
        console.warn('populateCorrectValueDropdown failed to enumerate corrections', e);
    }

    // Restore the current value if it exists in the options
    if (select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    } else {
        select.value = 'all';
    }
}

// --- UI helpers: loading overlay and transient messages ---
function ensureLoadingOverlay() {
    let overlay = document.getElementById('differencesLoadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'differencesLoadingOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.4)';
        overlay.style.display = 'none';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';
        overlay.innerHTML = '<div style="background:#fff;padding:20px 30px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.3);font-weight:600">Loading saved changes...</div>';
        document.body.appendChild(overlay);
    }
    // Make this overlay non-blocking so sync UI doesn't prevent typing in the table inputs
    overlay.style.pointerEvents = 'none';
    try { if (overlay.firstElementChild) overlay.firstElementChild.style.pointerEvents = 'auto'; } catch (e) {}
    return overlay;
}

function showLoadingOverlay() {
    const overlay = ensureLoadingOverlay();
    overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('differencesLoadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showTransientMessage(text, ms = 5000) {
    let msg = document.getElementById('differencesTransientMsg');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'differencesTransientMsg';
        msg.style.position = 'fixed';
        msg.style.right = '20px';
        msg.style.bottom = '20px';
        msg.style.background = '#323232';
        msg.style.color = '#fff';
        msg.style.padding = '10px 14px';
        msg.style.borderRadius = '6px';
        msg.style.zIndex = '10000';
        msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        msg.style.transition = 'opacity 300ms';
        msg.style.opacity = '0';
        document.body.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.opacity = '1';
    setTimeout(() => {
        try { msg.style.opacity = '0'; } catch (e) {}
    }, ms);
}

function snapshotDifferences() {
    const map = new Map();
    differencesData.forEach(r => {
        if (!r) return;
        const key = `${r.gdos_id}::${r.field}`;
        map.set(key, {
            gdos_value: r.gdos_value,
            zesty_value: r.zesty_value,
            correct: r.correct,
            published: r.published
        });
    });
    return map;
}

function applyChanges(changes) {
    console.log('Applying changes from shared storage:', changes);
    Object.entries(changes).forEach(([key, savedRow]) => {
        const parsed = parseCorrectionKey(key, savedRow);
        const { field, candidates } = parsed;

        if (savedRow === null) {
            // Deletion: set to GDOS
            let currentRow = differencesData.find(row => candidates.includes(String(row.gdos_id)) && row.field === field);
            if (currentRow) {
                currentRow.correct = 'GDOS';
                currentRow.final_value = currentRow.gdos_value;
            }
            return;
        }

        // General case for all corrections (name, siteTitle, address, phone, etc.)
        let currentRow = differencesData.find(row => candidates.includes(String(row.gdos_id)) && row.field === field);
        if (currentRow) {
            console.log('Applying to row:', currentRow.gdos_id, currentRow.field, '-> correct:', savedRow.correct);
            currentRow.correct = savedRow.correct;
            // Only apply saved correction value when it's non-empty to avoid clearing existing zesty values
            if (savedRow.value !== undefined && String(savedRow.value).trim() !== '') {
                currentRow.zesty_value = savedRow.value;
            }
            currentRow.final_value = savedRow.correct === 'GDOS' ? currentRow.gdos_value : currentRow.zesty_value;
        } else {
            // Row not present yet; save for later application when rows are available
            pendingCorrections[key] = savedRow;
            console.log('Stored pending correction for later application:', key);
        }
    });
    console.log('Applied changes, updated differencesData length:', differencesData.length);
}

// Parse correction key into canonical pieces and candidate gdos_id values
function parseCorrectionKey(key, savedRow) {
    let territory = null;
    let id = null;
    let field = null;
    const parts = String(key).split('-');
    if (parts.length >= 3) {
        territory = parts[0];
        field = parts.slice(parts.length - 1).join('-');
        id = parts.slice(1, parts.length - 1).join('-');
    } else if (parts.length === 2) {
        id = parts[0];
        field = parts[1];
    } else {
        id = key;
        field = savedRow && savedRow.field ? savedRow.field : null;
    }
    const candidates = [];
    if (territory) candidates.push(`${territory}-${id}`);
    candidates.push(String(id));
    return { territory, id, field, candidates };
}

function applyPendingCorrections() {
    if (!pendingCorrections || Object.keys(pendingCorrections).length === 0) return;
    let appliedCount = 0;
    const table = window.differencesTable || Tabulator.findTable("#differencesTable")[0];
    Object.entries(pendingCorrections).forEach(([key, savedRow]) => {
        const { field, candidates } = parseCorrectionKey(key, savedRow);
        const idx = differencesData.findIndex(r => candidates.includes(String(r.gdos_id)) && r.field === field);
        if (idx !== -1) {
            const row = differencesData[idx];
            row.correct = savedRow.correct;
            // Only apply saved correction value when non-empty so we preserve populated hours_of_operation
            if (savedRow.value !== undefined && String(savedRow.value).trim() !== '') row.zesty_value = savedRow.value;
            row.final_value = row.correct === 'GDOS' ? row.gdos_value : row.zesty_value;
            appliedCount++;
            delete pendingCorrections[key];
            console.log('Applied pending correction for key:', key);

            // If table is present, update the specific row component to avoid re-rendering entire table
            try {
                if (table && typeof table.getRows === 'function') {
                    const rowComp = table.getRows().find(r => {
                        try { return String(r.getData().gdos_id) === String(row.gdos_id) && r.getData().field === row.field; } catch (e) { return false; }
                    });
                    if (rowComp) {
                        rowComp.update(row);
                    }
                }
            } catch (e) {
                console.warn('Failed to incrementally update row after applying pending correction', e);
            }
        }
    });
    if (appliedCount > 0) {
        // update dropdown and metrics without full table reset
        try { populateCorrectValueDropdown(loadedCorrections); } catch (e) { console.warn('populateCorrectValueDropdown failed after applying pending corrections', e); }
        try { updateMetrics(); } catch (e) { console.warn('updateMetrics failed after applying pending corrections', e); }
    }
}

// Apply only the changed keys to the existing Tabulator table to avoid full rebuilds
function applyIncrementalChangesToTable(table, changedKeys) {
    if (!table || !Array.isArray(changedKeys) || changedKeys.length === 0) return;
    try {
        const rows = table.getRows ? table.getRows() : [];
        changedKeys.forEach(key => {
            try {
                // Determine target rows for this key
                const parsed = parseCorrectionKey(key, loadedCorrections && loadedCorrections[key] ? loadedCorrections[key] : null);
                const { field, candidates } = parsed;
                // find index in differencesData
                const idx = differencesData.findIndex(r => candidates.includes(String(r.gdos_id)) && r.field === field);
                if (idx === -1) return; // row not present - applyChanges will stash in pendingCorrections
                const rowData = differencesData[idx];
                // find Tabulator row component
                const rowComp = rows.find(r => {
                    try { const d = r.getData(); return d && String(d.gdos_id) === String(rowData.gdos_id) && d.field === rowData.field; } catch (e) { return false; }
                });
                if (rowComp && typeof rowComp.update === 'function') {
                    rowComp.update(rowData);
                }
            } catch (e) { console.warn('applyIncrementalChangesToTable key update failed', key, e); }
        });
    } catch (e) {
        console.warn('applyIncrementalChangesToTable failed', e);
    }
}

    // Build and download a CSV of corrections where GDOS is not the correct value
    function downloadCorrectionsCsv() {
        // Export all corrections including GDOS selections, plus unpublished/not imported records
        // Columns: GDOS ID, Name (with correct value), Address1, Address2, City, State, Zip, PhoneNumber, OpenHoursText, PrimaryWebsite, Published, Site Title, Division, Territory
        const table = Tabulator.findTable("#differencesTable")[0];
        if (!table) {
            alert('Table not initialized yet');
            return;
        }

        // Use full differencesData instead of filtered table data to include all records including synthetic "do not import" rows
        // Include rows that represent corrections (where Correct != 'GDOS')
        // Also include siteTitle and openHoursText rows that have a non-empty final_value (user-entered Zesty value)
        const includedExamples = [];
        const excludedExamples = [];
        const allRows = differencesData.filter(r => {
            try {
                if (!r) return false;
                // Include anything explicitly marked as non-GDOS
                if (r.correct && r.correct !== 'GDOS') {
                    if (includedExamples.length < 5) includedExamples.push({ gdos_id: r.gdos_id, field: r.field, reason: 'correct!=GDOS' });
                    return true;
                }
                // For staging fields, include when either final_value or zesty_value contains a non-empty user value
                if (r.field && (r.field === 'siteTitle' || /openhours/i.test(r.field))) {
                    const fv = r.final_value !== undefined && r.final_value !== null ? String(r.final_value).trim() : '';
                    const zv = r.zesty_value !== undefined && r.zesty_value !== null ? String(r.zesty_value).trim() : '';
                    if (fv !== '' || zv !== '') {
                        if (includedExamples.length < 5) includedExamples.push({ gdos_id: r.gdos_id, field: r.field, reason: fv !== '' ? 'final_value' : 'zesty_value', value: fv !== '' ? fv : zv });
                        return true;
                    }
                }
                if (excludedExamples.length < 5) excludedExamples.push({ gdos_id: r.gdos_id, field: r.field, correct: r.correct, final_value: r.final_value, zesty_value: r.zesty_value });
                return false;
            } catch (e) {
                return false;
            }
        });
        console.debug('downloadCorrectionsCsv: included rows:', allRows.length, 'examples:', includedExamples);
        console.debug('downloadCorrectionsCsv: excluded sample rows (up to 5):', excludedExamples);

        // Group by gdos_id and collect all corrections (including GDOS)
        const grouped = new Map();
        allRows.forEach(r => {
            if (!r.gdos_id) return;

            const gid = r.gdos_id;
            if (!grouped.has(gid)) {
                grouped.set(gid, {
                    gdos_id: gid,
                    name: r.name || '',
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zip: '',
                    phone: '',
                    openhours: '',
                    website: '',
                    division: r.division || '',
                    territory: r.territory || '',
                    published: '',
                    siteTitle: '',
                    hasCorrections: false // Track if this record has any corrections
                });
            }

            const entry = grouped.get(gid);

            // The field indicates which property changed; final_value holds the chosen value.
            // If final_value was not populated for staging fields, fall back to zesty_value so
            // user-entered Zesty custom values are exported.
            const field = r.field;
            let finalVal = r.final_value;
            if ((finalVal === undefined || finalVal === null || String(finalVal).trim() === '') && r.zesty_value !== undefined && r.zesty_value !== null) {
                finalVal = r.zesty_value;
            }

            // Only mark as hasCorrections if this is a meaningful correction.
            // siteTitle and openHoursText are treated as "staging" rows by default, but
            // if the user selected Zesty (finalVal present/non-empty) we should include them
            // as real corrections in the export.
            let markAsCorrection = false;
            if (field === 'siteTitle' || /openhours/i.test(field)) {
                // For these staging fields, only mark as a correction when a non-empty final value exists
                if (finalVal !== undefined && finalVal !== null && String(finalVal).trim() !== '') {
                    markAsCorrection = true;
                }
            } else {
                // All other fields are considered meaningful corrections
                markAsCorrection = true;
            }
            if (markAsCorrection) entry.hasCorrections = true;

            // Map the comparison field names to import sheet columns
            switch (field) {
                case 'name':
                    entry.name = finalVal || entry.name;
                    break;
                case 'siteTitle':
                    entry.siteTitle = finalVal || entry.siteTitle;
                    break;
                case 'address':
                    entry.address1 = finalVal || entry.address1;
                    break;
                case 'zipcode':
                    entry.zip = finalVal || entry.zip;
                    break;
                case 'published':
                    entry.published = finalVal || entry.published;
                    break;
                case 'siteTitle':
                    entry.siteTitle = finalVal || entry.siteTitle;
                    break;
                case 'latitude':
                case 'longitude':
                    // ignore for import
                    break;
                default:
                    // other fields might map to phone, openhours, website - try to infer by field name
                    if (/phone/i.test(field)) entry.phone = finalVal || entry.phone;
                    if (/openhours/i.test(field)) entry.openhours = finalVal || entry.openhours;
                    if (/website|primarywebsite/i.test(field)) entry.website = finalVal || entry.website;
            }
        });

        // Fill missing fields from GDOS source data and add records that should be unpublished/not imported
        const rows = Array.from(grouped.values());
        
        // Also add records that should be unpublished/not imported but may not have corrections in the table
        duplicateMap.forEach((duplicateRecord, gdosId) => {
            const doNotImportFlag = duplicateRecord && (duplicateRecord.doNotImport === 'True' || duplicateRecord.doNotImport === true || String(duplicateRecord.doNotImport).toLowerCase() === 'true');
            if (doNotImportFlag && !grouped.has(gdosId)) {
                // Add this record to the export with published = 'False'
                const gdosRecord = gdosMap.get(gdosId);
                if (gdosRecord) {
                    rows.push({
                        gdos_id: gdosId,
                        name: getNestedValue(gdosRecord, 'name') || '',
                        address1: getNestedValue(gdosRecord, 'address1') || '',
                        address2: getNestedValue(gdosRecord, 'address2') || '',
                        city: getNestedValue(gdosRecord, 'city') || '',
                        state: extractStateValue(getNestedValue(gdosRecord, 'state') || getNestedValue(gdosRecord, 'address.state')) || '',
                        zip: getNestedValue(gdosRecord, 'zip.zipcode') || getNestedValue(gdosRecord, 'zipcode') || '',
                        phone: getNestedValue(gdosRecord, 'phone') || getNestedValue(gdosRecord, 'phoneNumber') || '',
                        openhours: getNestedValue(gdosRecord, 'openHoursText') || '',
                        website: getNestedValue(gdosRecord, 'primaryWebsite') || '',
                        division: getNestedValue(gdosRecord, 'location.division.name') || '',
                        territory: gdosRecord.territory || '',
                        published: 'False', // Explicitly set to False for doNotImport records
                        siteTitle: '',
                        hasCorrections: false
                    });
                }
            }
        });
        
        rows.forEach(entry => {
            const gdosRecord = gdosMap.get(entry.gdos_id);
            // Look up duplicate record for this entry
            let duplicateRecord = duplicateMap.get(entry.gdos_id);
            if (!duplicateRecord && Array.isArray(duplicateCheckRecords)) {
                duplicateRecord = duplicateCheckRecords.find(r => {
                    if (!r) return false;
                    const candidate = r.gdosid ?? r.gdos_id ?? r.gdosId ?? r['gdos id'] ?? (r.gdos && r.gdos.id);
                    return String(candidate) === String(entry.gdos_id);
                }) || null;
            }
            const doNotImportFlag = duplicateRecord && (duplicateRecord.doNotImport === 'True' || duplicateRecord.doNotImport === true || String(duplicateRecord.doNotImport).toLowerCase() === 'true');
                if (gdosRecord) {
                    // pull common GDOS fields if empty
                    entry.address1 = entry.address1 || getNestedValue(gdosRecord, 'address1') || '';
                    entry.address2 = entry.address2 || getNestedValue(gdosRecord, 'address2') || '';
                    entry.city = entry.city || getNestedValue(gdosRecord, 'city') || '';
                    // State in GDOS may be an object; normalize to the name if so
                    const gdosStateRaw = getNestedValue(gdosRecord, 'state') || getNestedValue(gdosRecord, 'address.state') || null;
                    const gdosState = extractStateValue(gdosStateRaw);
                    entry.state = entry.state || gdosState || '';
                    entry.zip = entry.zip || getNestedValue(gdosRecord, 'zip.zipcode') || getNestedValue(gdosRecord, 'zipcode') || '';
                    entry.phone = entry.phone || getNestedValue(gdosRecord, 'phone') || getNestedValue(gdosRecord, 'phoneNumber') || '';
                    entry.openhours = entry.openhours || getNestedValue(gdosRecord, 'openHoursText') || '';
                    entry.website = entry.website || getNestedValue(gdosRecord, 'primaryWebsite') || '';
                    entry.division = entry.division || getNestedValue(gdosRecord, 'location.division.name') || '';
                    entry.territory = entry.territory || gdosRecord.territory || '';
                    entry.name = entry.name || getNestedValue(gdosRecord, 'name') || '';
                    entry.published = entry.published || (gdosRecord.published ? 'True' : 'False');

                    // If state still missing, try to look up from the Zesty locations raw data (rawLocations)
                    if (!entry.state && rawLocations && Array.isArray(rawLocations.data)) {
                        const zestyRec = rawLocations.data.find(l => l && l['Column1.content.gdos_id'] == entry.gdos_id);
                        if (zestyRec) {
                            const zstate = extractZestyStateValue(zestyRec);
                            if (zstate) entry.state = zstate;
                        }
                    }
                }
            // Override published to 'False' if doNotImport is 'True', to ensure these records are unpublished in the import
            if (doNotImportFlag) {
                entry.published = 'False';
            }
        });
        
        // Filter to only include records that have corrections OR should be unpublished
        const finalRows = rows.filter(entry => entry.hasCorrections || entry.published === 'False');
        
        if (finalRows.length === 0) {
            alert('No corrections or records to unpublish were found.');
            return;
        }

        const headers = ['GDOS ID','Name','Address1','Address2','City','State','Zip','PhoneNumber','OpenHoursText','PrimaryWebsite','Published','Site Title','Division','Territory'];
        const csvLines = [headers.join(',')];

        finalRows.forEach(r => {
            const vals = [
                escapeCsv(r.gdos_id),
                escapeCsv(r.name),
                escapeCsv(r.address1),
                escapeCsv(r.address2),
                escapeCsv(r.city),
                escapeCsv(r.state),
                escapeCsv(r.zip),
                escapeCsv(r.phone),
                escapeCsv(r.openhours),
                escapeCsv(r.website),
                escapeCsv(r.published),
                escapeCsv(r.siteTitle),
                escapeCsv(r.division),
                escapeCsv(r.territory)
            ];
            csvLines.push(vals.join(','));
        });

        const csvContent = csvLines.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gdos_corrections.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function escapeCsv(str) {
        if (str == null) return '';
        const s = String(str);
        if (s.includes(',') || s.includes('\n') || s.includes('"')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

// Simple HTML escaper for small snippets
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderDifferencesTable() {
    // Clear summary (we don't display the auto-generated summary line)
    const summaryDiv = document.getElementById('differencesSummary');
    if (summaryDiv) {
        summaryDiv.innerHTML = '';
    }
    
    const table = new Tabulator("#differencesTable", {
        data: differencesData,
        layout: "fitColumns",
        columns: [
            { title: "Field", field: "field", width: 100, cssClass: "field-highlight", formatter: fieldFormatter },
            { title: "GDOS Value", field: "gdos_value", width: 200, formatter: gdosValueFormatter, headerFilter: "input" },
            { title: "Zesty Value", field: "zesty_value", width: 200, formatter: zestyValueFormatter, headerFilter: "input" },
            {
                title: "Correct Value",
                field: "correct",
                width: 150,
                formatter: correctValueFormatter
            },
            {
                title: "Final Value",
                field: "final_value",
                width: 300,
                formatter: finalValueFormatter,
                cssClass: "final-value-highlight",
                headerFilter: "input"
            },
            { title: "GDOS ID", field: "gdos_id", width: 120, headerFilter: "input" },
            { title: "Name", field: "name", width: 200, headerFilter: "input" },
            { title: "Property Type", field: "property_type", width: 150, headerFilter: "input" },
            { title: "Division", field: "division", width: 80, headerFilter: "input" },
            { title: "Territory", field: "territory", width: 70, headerFilter: "input" },
            { title: "Published", field: "published", width: 70, headerFilter: "list", headerFilterParams: { values: {"True": "Published", "False": "Not Published"} } },
            { title: "Duplicate", field: "duplicate", width: 70, headerFilter: "list", headerFilterParams: { values: {"0": "Not Duplicate", "1": "Duplicate"} } },
            { title: "Do Not Import", field: "doNotImport", width: 80, headerFilter: "list", headerFilterParams: { values: {"False": "Import", "True": "Do Not Import"} } }
        ],
        rowFormatter: function(row){
            const data = row.getData();
            if (data && data.synthetic) {
                row.getElement().classList.add('synthetic-row');
                row.getElement().title = 'Synthetic row: This row was added to represent a workflow decision (e.g., published status) and is not a direct field comparison.';
            } else if (data && data.siteTitleRow) {
                row.getElement().classList.add('siteTitle-row');
                row.getElement().title = 'Site Title row: This name difference has been resolved by using the Zesty name value for the siteTitle field.';
            }
        },
        pagination: "local",
        paginationSize: 20,
        paginationSizeSelector: [10, 20, 50, 100],
        tooltips: true,
        resizableColumns: true
    });

    // Expose table globally for filters and other actions
    window.differencesTable = table;

    // Populate global filters after table created
    populateGlobalFilters();
    updateFilterVisualState();

    // Apply any saved global filters after table is built
    table.on("tableBuilt", function(){
        applySavedGlobalFilters();
    });
    // Update metrics (immediately and shortly after render to ensure Tabulator has processed data)
    try { updateMetrics(); } catch (e) { console.warn('updateMetrics immediate failed', e); }
    // also attach listener for table data changes and schedule a delayed metrics update
    try {
        if (table && typeof table.on === 'function') {
            table.on('dataChanged', updateMetrics);
            // dataFiltered fires when Tabulator applies filters (header filters, setFilter, clearFilter, etc.)
            table.on('dataFiltered', function(filters, rows){
                try {
                    // rows is an array of RowComponent objects; capture their data for metrics
                    try {
                        latestFilteredData = rows.map(r => r.getData());
                    } catch (e) {
                        latestFilteredData = null;
                    }
                    updateMetrics();
                } catch(e) { console.warn('updateMetrics failed on dataFiltered', e); }
            });
        }
    } catch (e) { console.warn('could not attach dataChanged listener', e); }
    setTimeout(() => {
        try { updateMetrics(); } catch (e) { console.warn('delayed updateMetrics failed', e); }
    }, 100);
    // Metrics will be updated after loadSavedChanges applies any pending corrections
}

// Populate the territory select with values from differencesData
function populateGlobalFilters() {
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');
    const hideSiteTitleOpenHoursCheckbox = document.getElementById('hideSiteTitleOpenHours');
    if (!territorySelect || !correctSelect) return;

    // gather unique territories from differencesData
    const territories = Array.from(new Set(differencesData.map(d => d.territory || 'Unknown'))).sort();

    // clear existing (preserve 'all')
    while (territorySelect.options.length > 1) territorySelect.remove(1);

    territories.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        territorySelect.appendChild(opt);
    });

    // attach change listeners (only once)
    if (!territorySelect._listenerAdded) {
        territorySelect.addEventListener('change', function() {
            localStorage.setItem('globalTerritoryFilter', this.value);
            applyGlobalFilters();
            // update metrics when filters change
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
        });
        territorySelect._listenerAdded = true;
    }

    if (!correctSelect._listenerAdded) {
        correctSelect.addEventListener('change', function() {
            localStorage.setItem('globalCorrectFilter', this.value);
            applyGlobalFilters();
            // update metrics when filters change
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
        });
        correctSelect._listenerAdded = true;
    }

    // populate field select options from differencesData
    if (fieldSelect) {
        // gather unique fields
        const fields = Array.from(new Set(differencesData.map(d => d.field || 'unknown'))).sort();
        // clear existing (preserve 'all')
        while (fieldSelect.options.length > 1) fieldSelect.remove(1);
        fields.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            fieldSelect.appendChild(opt);
        });

        if (!fieldSelect._listenerAdded) {
            fieldSelect.addEventListener('change', function() {
                localStorage.setItem('globalFieldFilter', this.value);
                applyGlobalFilters();
                // update metrics when field filter changes
                try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
            });
            fieldSelect._listenerAdded = true;
        }
    }

    // Add listeners for siteTitle and openHours filters
    const showSiteTitleFilter = document.getElementById('showSiteTitleFilter');
    if (showSiteTitleFilter && !showSiteTitleFilter._listenerAdded) {
        showSiteTitleFilter.addEventListener('change', function() {
            localStorage.setItem('showSiteTitleFilter', this.value);
            applyGlobalFilters();
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
        });
        showSiteTitleFilter._listenerAdded = true;
    }

    const showOpenHoursFilter = document.getElementById('showOpenHoursFilter');
    if (showOpenHoursFilter && !showOpenHoursFilter._listenerAdded) {
        showOpenHoursFilter.addEventListener('change', function() {
            localStorage.setItem('showOpenHoursFilter', this.value);
            applyGlobalFilters();
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
        });
        showOpenHoursFilter._listenerAdded = true;
    }

    const showDoNotImportFilter = document.getElementById('showDoNotImportFilter');
    if (showDoNotImportFilter && !showDoNotImportFilter._listenerAdded) {
        showDoNotImportFilter.addEventListener('change', function() {
            localStorage.setItem('showDoNotImportFilter', this.value);
            applyGlobalFilters();
            try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
        });
        showDoNotImportFilter._listenerAdded = true;
    }

    // Note: hideSiteTitleOpenHours checkbox has been replaced with separate dropdown filters
}

function applyGlobalFilters() {
    const table = window.differencesTable;
    if (!table || !table.initialized) {
        console.warn('Table not ready, skipping filter application');
        return;
    }
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');
    const showSiteTitleFilter = document.getElementById('showSiteTitleFilter');
    const showOpenHoursFilter = document.getElementById('showOpenHoursFilter');
    const showDuplicatesFilter = document.getElementById('showDuplicatesFilter');
    const showDoNotImportFilter = document.getElementById('showDoNotImportFilter');

    // Clear all filters first
    table.clearFilter();

    // Add filters back
    if (territorySelect && territorySelect.value && territorySelect.value !== 'all') {
        table.addFilter("territory", "=", territorySelect.value);
    }
    if (correctSelect && correctSelect.value && correctSelect.value !== 'all') {
        table.addFilter("correct", "=", correctSelect.value);
    }
    if (fieldSelect && fieldSelect.value && fieldSelect.value !== 'all') {
        table.addFilter("field", "=", fieldSelect.value);
    }
    
    // Handle siteTitle filter
    if (showSiteTitleFilter && showSiteTitleFilter.value !== 'all') {
        if (showSiteTitleFilter.value === 'show') {
            // Show only siteTitle rows
            table.addFilter("field", "=", "siteTitle");
        } else if (showSiteTitleFilter.value === 'hide') {
            // Hide siteTitle rows
            table.addFilter(function(data, filterParams) {
                return data.field !== 'siteTitle';
            });
        }
    }
    
    // Handle openHours filter
    if (showOpenHoursFilter && showOpenHoursFilter.value !== 'all') {
        if (showOpenHoursFilter.value === 'show') {
            // Show only openHoursText rows
            table.addFilter("field", "=", "openHoursText");
        } else if (showOpenHoursFilter.value === 'hide') {
            // Hide openHoursText rows
            table.addFilter(function(data, filterParams) {
                return data.field !== 'openHoursText';
            });
        }
    }

    // Handle duplicates filter
    // Combine duplicates into Do Not Import filter. Treat duplicate=true as equivalent to doNotImport for filtering
    if (showDoNotImportFilter && showDoNotImportFilter.value !== 'all') {
        if (showDoNotImportFilter.value === 'show') {
            // Show only records marked doNotImport OR duplicate
            table.addFilter(function(data, filterParams) {
                const doVal = String(data.doNotImport || '').toLowerCase();
                const dupVal = String(data.duplicate || '').toLowerCase();
                return (doVal === '1' || doVal === 'true') || (dupVal === '1' || dupVal === 'true');
            });
        } else if (showDoNotImportFilter.value === 'hide') {
            // Hide records that are doNotImport OR duplicate
            table.addFilter(function(data, filterParams) {
                const doVal = String(data.doNotImport || '').toLowerCase();
                const dupVal = String(data.duplicate || '').toLowerCase();
                return !((doVal === '1' || doVal === 'true') || (dupVal === '1' || dupVal === 'true'));
            });
        }
    }
    // Note: siteTitle and openHoursText are always shown as separate fields - no longer hidden by checkbox
    updateFilterVisualState();
}

function updateFilterVisualState() {
    // No visual styling applied to differences page filters
}

function applySavedGlobalFilters() {
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');
    const showSiteTitleFilter = document.getElementById('showSiteTitleFilter');
    const showOpenHoursFilter = document.getElementById('showOpenHoursFilter');
    const showDuplicatesFilter = document.getElementById('showDuplicatesFilter');
    const showDoNotImportFilter = document.getElementById('showDoNotImportFilter');
    const savedTerr = localStorage.getItem('globalTerritoryFilter');
    const savedCorrect = localStorage.getItem('globalCorrectFilter');
    const savedField = localStorage.getItem('globalFieldFilter');
    const savedSiteTitle = localStorage.getItem('showSiteTitleFilter') || 'all';
    const savedOpenHours = localStorage.getItem('showOpenHoursFilter') || 'all';
    const savedDuplicates = localStorage.getItem('showDuplicatesFilter') || 'all';
    // Default to 'hide' so Clear Filters hides Do Not Import / Duplicates by default
    const savedDoNotImport = localStorage.getItem('showDoNotImportFilter') || 'hide';
    // siteTitle and openHoursText are always shown now - no longer use hideSiteTitleOpenHours
    if (territorySelect && savedTerr) {
        // only set if option exists (safety)
        const opt = Array.from(territorySelect.options).find(o => o.value === savedTerr);
        if (opt) territorySelect.value = savedTerr;
    }
    if (correctSelect && savedCorrect) {
        const opt2 = Array.from(correctSelect.options).find(o => o.value === savedCorrect);
        if (opt2) correctSelect.value = savedCorrect;
    }
    if (fieldSelect && savedField) {
        const opt3 = Array.from(fieldSelect.options).find(o => o.value === savedField);
        if (opt3) fieldSelect.value = savedField;
    }
    if (showSiteTitleFilter) {
        showSiteTitleFilter.value = savedSiteTitle;
    }
    if (showOpenHoursFilter) {
        showOpenHoursFilter.value = savedOpenHours;
    }
    if (showDoNotImportFilter) {
        showDoNotImportFilter.value = savedDoNotImport;
    }
    // apply after setting
    setTimeout(() => applyGlobalFilters(), 0);
}

function toggleSiteTitleOpenHoursVisibility() {
    const checkbox = document.getElementById('hideSiteTitleOpenHours');
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        // Trigger the change event to apply the filter
        checkbox.dispatchEvent(new Event('change'));
    }
}

function clearFilters() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.clearFilter();
        try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
    }
    // Also reset global filters
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');
    if (territorySelect) {
        territorySelect.value = 'all';
        localStorage.setItem('globalTerritoryFilter', 'all');
    }
    if (correctSelect) {
        correctSelect.value = 'all';
        localStorage.setItem('globalCorrectFilter', 'all');
    }
    if (fieldSelect) {
        fieldSelect.value = 'all';
        localStorage.setItem('globalFieldFilter', 'all');
    }
    // Reset siteTitle/openHours filters to 'hide' by default per new UX
    const showSiteTitleFilter = document.getElementById('showSiteTitleFilter');
    const showOpenHoursFilter = document.getElementById('showOpenHoursFilter');
    if (showSiteTitleFilter) {
        showSiteTitleFilter.value = 'hide';
        localStorage.setItem('showSiteTitleFilter', 'hide');
    }
    if (showOpenHoursFilter) {
        showOpenHoursFilter.value = 'hide';
        localStorage.setItem('showOpenHoursFilter', 'hide');
    }
    // Reset do-not-import filter to 'hide' per UX decision so Clear Filters hides these rows
    const showDoNotImportFilter = document.getElementById('showDoNotImportFilter');
    if (showDoNotImportFilter) {
        showDoNotImportFilter.value = 'hide';
        localStorage.setItem('showDoNotImportFilter', 'hide');
    }
    // Re-apply filters and update metrics after reset
    try { applyGlobalFilters(); } catch (e) { console.warn('applyGlobalFilters failed after clearFilters', e); }
    try { updateMetrics(); } catch (e) { console.warn('updateMetrics failed after clearFilters', e); }
    updateFilterVisualState();
}

// Try to pull a usable state string from a Zesty flattened record
function extractZestyStateValue(zestyRec) {
    if (!zestyRec) return null;
    const candidates = [
        'Column1.content.state',
        'Column1.content.addressState',
        'Column1.content.state.data',
        'state',
        'addressState'
    ];
    for (const k of candidates) {
        const v = zestyRec[k];
        if (v == null) continue;
        if (typeof v === 'string') {
            // Sometimes Zesty embeds JSON-like strings or markers like "[Record]"; try to ignore those
            if (v.trim() === '' || v.trim() === '[Record]') continue;
            return v;
        }
        if (typeof v === 'object') {
            // try common nested shapes
            if (v.name) return v.name;
            if (v.data && typeof v.data === 'object') {
                if (v.data.name) return v.data.name;
                // if data is array
                if (Array.isArray(v.data) && v.data.length > 0 && v.data[0].name) return v.data[0].name;
            }
        }
    }
    return null;
}

function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { console.warn('copy failed', e); }
        document.body.removeChild(ta);
        return;
    }
    navigator.clipboard.writeText(text).catch(e => console.warn('clipboard write failed', e));
}

// When the server returns an authoritative 'current' corrections object,
// replace the local loadedCorrections with it, persist locally, and
// compact the persistQueue by removing any queued deltas that are now
// reflected in the server state.
function reconcileServerState(serverPayload) {
    try {
        if (!serverPayload) return;
        const serverObj = serverPayload.current || serverPayload;
        if (!serverObj || typeof serverObj !== 'object') return;

        // Replace loadedCorrections with authoritative server state
        loadedCorrections = Object.assign({}, serverObj);

        try { populateCorrectValueDropdown(loadedCorrections); } catch (e) { console.warn('populateCorrectValueDropdown failed during reconciliation', e); }

        // Apply the updated corrections to the UI
        applyChanges(loadedCorrections);
        
        const table = window.differencesTable || (typeof Tabulator !== 'undefined' && typeof Tabulator.findTable === 'function' ? Tabulator.findTable("#differencesTable")[0] : null);
        if (table) {
            // If the user is editing, defer the refresh and other UI updates until editing stops
            if (isUserEditingInTable()) {
                deferredTableRefresh = true;
                console.log('Deferring reconciliation UI refresh until user stops editing');
                if (!_deferredRefreshListenerAdded) {
                    _deferredRefreshListenerAdded = true;
                    document.addEventListener('focusout', function() {
                        setTimeout(async () => {
                            if (!isUserEditingInTable() && deferredTableRefresh) {
                                try { await smartRefreshTable(table); } catch (e) { console.warn('deferred smartRefreshTable failed', e); }
                                try { applyGlobalFilters(); } catch (e) { console.warn('applyGlobalFilters failed after deferred reconciliation', e); }
                                try { updateMetrics(); } catch (e) { console.warn('updateMetrics failed after deferred reconciliation', e); }
                            }
                            deferredTableRefresh = false;
                        }, 50);
                    }, true);
                }
            } else {
                // call smartRefreshTable but this function is not async, so handle the promise directly
                smartRefreshTable(table).catch(e => console.warn('smartRefreshTable failed during reconciliation', e));
            }
        } else {
            console.debug('Table not present for live update; will be updated on next full load.');
        }
        
        // Re-apply filters and update metrics to reflect the new state. If editing, these were deferred above.
        if (!isUserEditingInTable()) {
            try { applyGlobalFilters(); } catch (e) { console.warn('applyGlobalFilters failed during reconciliation', e); }
            try { updateMetrics(); } catch (e) { console.warn('updateMetrics failed during reconciliation', e); }
        }

        console.log('Reconciled with server state.');
    } catch (e) {
        console.warn('reconcileServerState failed', e);
    }
}

// Queue modal helpers
function formatTs(ts) {
    if (!ts) return '—';
    try {
        const d = new Date(Number(ts));
        return d.toLocaleString();
    } catch (e) { return String(ts); }
}
