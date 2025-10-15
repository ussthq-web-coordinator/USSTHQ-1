let differencesData = [];
let gdosMap = new Map();
let duplicateMap = new Map();
let duplicateCheckRecords = [];
// latestFilteredData holds the current set of rows matching active filters (all pages)
let latestFilteredData = null;

// Shared storage configuration - using Cloudflare Worker for storage
const SHARED_STORAGE_URL = 'https://odd-breeze-03d9.uss-thq-cloudflare-account.workers.dev';

// Raw JSONs for modal inspection
let rawUsw = null;
let rawUss = null;
let rawUsc = null;
let rawUse = null;
let rawLocations = null;
// filenames for GDOS JSONs (used to parse refresh timestamps)
let rawUswFilename = null;
let rawUssFilename = null;
let rawUscFilename = null;
let rawUseFilename = null;

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
    fetch('./LocationsData.json?v=' + Date.now()).then(response => {
        if (!response.ok) throw new Error('LocationsData file not found');
        return response.json();
    }),
    fetch('./DuplicateLocationCheck.json?v=' + Date.now()).then(response => {
        if (!response.ok) throw new Error('DuplicateLocationCheck file not found');
        return response.json();
    })
])
.then(([uswData, ussData, uscData, useData, locationsData, duplicateCheckData]) => {
    // store raw JSONs for modal use
    rawUsw = uswData;
    rawUss = ussData;
    rawUsc = uscData;
    rawUse = useData;
        // store filenames so we can parse refresh dates from filenames
        rawUswFilename = 'GDOS-10-14-18-53-USW.json';
        rawUssFilename = 'GDOS-10-14-18-10-USS.json';
        rawUscFilename = 'GDOS-10-15-04-22-USC.json';
        rawUseFilename = 'GDOS-10-15-04-57-USE.json';
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

    // Fields to compare - with mapping for GDOS nested fields and Zesty flattened fields
    const fieldsToCompare = [
        { field: 'name', gdosPath: 'name', zestyPath: 'Column1.content.name' },
        { field: 'address', gdosPath: 'address1', zestyPath: 'Column1.content.address' },
        { field: 'latitude', gdosPath: 'location.latitude', zestyPath: 'Column1.content.latitude' },
        { field: 'longitude', gdosPath: 'location.longitude', zestyPath: 'Column1.content.longitude' },
        { field: 'zipcode', gdosPath: 'zip.zipcode', zestyPath: 'Column1.content.zipcode' }
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
            const zestyValue = loc[fieldObj.zestyPath]; // Flattened key
            
            // Skip if should ignore this field
            if (shouldIgnoreField(fieldObj.field, zestyValue)) return;
            
            // Normalize values for comparison
            const normalizedGdos = normalizeValue(gdosValue, fieldObj.field);
            const normalizedZesty = normalizeValue(zestyValue, fieldObj.field);
            
            if (normalizedGdos !== normalizedZesty && normalizedGdos != null && normalizedZesty != null) {
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
                    zesty_value: zestyValue,
                    correct: 'GDOS' // default
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
    console.log('Differences found:', differencesData.length);
    
    if (differencesData.length > 0) {
        console.log('Sample difference:', differencesData[0]);
    }

    // Load any previously saved changes
    loadSavedChanges();
    
    renderDifferencesTable();
})
.catch(error => {
    console.error('Error loading data:', error);
    alert('Error loading data: ' + error.message);
});

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
    if (rowData.field === 'name' || rowData.field === 'siteTitle') {
        options += `<option value="Zesty Name to Site Title" ${value === 'Zesty Name to Site Title' ? 'selected' : ''}>Zesty Name to Site Title</option>`;
    }
    select.innerHTML = options;
    select.addEventListener('change', function() {
        const newValue = this.value;
        // Update the row data (this will cause formatters to re-run)
        const row = cell.getRow();
        const rowData = row.getData();
        rowData.correct = newValue;
        if (newValue === 'Zesty Name to Site Title') {
            rowData.field = 'siteTitle';
            rowData.final_value = rowData.zesty_value;
        } else {
            rowData.final_value = newValue === 'GDOS' ? rowData.gdos_value : rowData.zesty_value;
        }
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
                if (span) span.classList.toggle('selected-underline', newValue === 'Zesty' || newValue === 'Zesty Name to Site Title');
            }
        } catch (e) {
            console.warn('toggle underline failed', e);
        }

        // Save changes
        saveChanges();
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

    const span = document.createElement('span');
    span.className = 'value-text' + (correctValue === 'Zesty' ? ' selected-underline' : '');
    span.textContent = value;
    return span;
}

function saveChanges() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        const data = table.getData();
        // Save to shared storage only
        const corrections = data.filter(r => r.correct !== 'GDOS').map(r => ({
            gdos_id: r.gdos_id,
            field: r.field,
            correct: r.correct
        }));
        console.log('Saving corrections to shared storage:', corrections);
        const updatedData = {
            data: corrections,
            lastUpdated: new Date().toISOString()
        };
        const payload = JSON.stringify(updatedData);
        console.log('Payload size:', payload.length, 'bytes');
        return fetch(SHARED_STORAGE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        })
        .then(response => {
            if (!response.ok) {
                console.error('Save failed with status:', response.status, response.statusText);
                return response.text().then(text => {
                    console.error('Response body:', text);
                    throw new Error(`Save failed: ${response.status}`);
                });
            }
            return response.text(); // PUT returns "OK" as text
        })
        .then(() => console.log('Changes saved to shared storage'))
        .catch(error => console.warn('Shared storage save failed:', error));        // update metrics live
        updateMetrics();
    }
}

function updateMetrics() {
    const table = window.differencesTable || Tabulator.findTable("#differencesTable")[0];
    if (!table) return;
    // If Tabulator provided the full filtered set (latestFilteredData), prefer that
    let data = null;
    if (Array.isArray(latestFilteredData)) {
        data = latestFilteredData;
    } else {
        // Otherwise, attempt to compute from visible rows (covers header filters) or fall back
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
    const total = data.length;
    const gdosCount = data.filter(r => r.correct === 'GDOS').length;
    const zestyCount = data.filter(r => r.correct === 'Zesty').length;

    // per-field counts
    const fieldCounts = data.reduce((acc, r) => {
        const f = r.field || 'unknown';
        acc[f] = (acc[f] || 0) + 1;
        return acc;
    }, {});

    const metricTotal = document.getElementById('metricTotal');
    const metricGdos = document.getElementById('metricGdos');
    const metricZesty = document.getElementById('metricZesty');
    const metricFields = document.getElementById('metricFields');
    if (metricTotal) metricTotal.textContent = total;
    if (metricGdos) metricGdos.textContent = gdosCount;
    if (metricZesty) metricZesty.textContent = zestyCount;
    if (metricFields) {
        metricFields.innerHTML = Object.keys(fieldCounts).sort().map(k => `${k}: ${fieldCounts[k]}`).join('  •  ');
    }
}

function loadSavedChanges() {
    // Load from shared storage only
    fetch(SHARED_STORAGE_URL)
        .then(response => {
            if (!response.ok) throw new Error('Shared storage not available');
            return response.json();
        })
        .then(data => {
            const corrections = data.data;
            if (Array.isArray(corrections)) {
                applyChanges(corrections);
                console.log('Shared corrections loaded');
                // Update the table with the modified data
                const table = window.differencesTable || Tabulator.findTable("#differencesTable")[0];
                if (table) {
                    table.setData(differencesData);
                }
                return;
            }
            throw new Error('Invalid shared data');
        })
        .catch(error => {
            console.warn('Failed to load shared corrections:', error);
            // No fallback to localStorage
        });
}

function applyChanges(changes) {
    console.log('Applying changes from shared storage:', changes);
    changes.forEach(savedRow => {
        const currentRow = differencesData.find(row => 
            row.gdos_id === savedRow.gdos_id && row.field === savedRow.field
        );
        if (currentRow) {
            console.log('Applying to row:', currentRow.gdos_id, currentRow.field, '-> correct:', savedRow.correct);
            currentRow.correct = savedRow.correct;
            // Compute final_value based on correct
            if (savedRow.correct === 'Zesty Name to Site Title') {
                currentRow.field = 'siteTitle';
                currentRow.final_value = currentRow.zesty_value;
            } else {
                currentRow.final_value = savedRow.correct === 'GDOS' ? currentRow.gdos_value : currentRow.zesty_value;
            }
        } else {
            console.warn('No matching row for:', savedRow);
        }
    });
    console.log('Applied changes, updated differencesData length:', differencesData.length);
}

    // Build and download a CSV of corrections where GDOS is not the correct value
    function downloadCorrectionsCsv() {
        // We want one row per GDOS record where the chosen correct value is Zesty (i.e., not GDOS)
        // Columns: GDOS ID, Name (with correct value), Address1, Address2, City, State, Zip, PhoneNumber, OpenHoursText, PrimaryWebsite, Division, Territory
        const table = Tabulator.findTable("#differencesTable")[0];
        if (!table) {
            alert('Table not initialized yet');
            return;
        }

        const allRows = table.getData();

        // Group by gdos_id and collect the final values for fields
        const grouped = new Map();
        allRows.forEach(r => {
            // use final_value and correct to determine whether GDOS is NOT correct
            if (!r.gdos_id) return;
            if (r.correct === 'GDOS') return; // only collect rows where correct is not GDOS

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
                    siteTitle: ''
                });
            }

            const entry = grouped.get(gid);
            // The field indicates which property changed; final_value holds the chosen value
            const field = r.field;
            const finalVal = r.final_value;

            // Map the comparison field names to import sheet columns
            switch (field) {
                case 'name':
                    entry.name = finalVal || entry.name;
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

        // Fill missing fields from GDOS source data (gdosMap) and convert grouped Map to CSV
        const rows = Array.from(grouped.values());
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
        if (rows.length === 0) {
            alert('No corrections where GDOS is not the correct value were found.');
            return;
        }

        const headers = ['GDOS ID','Name','Address1','Address2','City','State','Zip','PhoneNumber','OpenHoursText','PrimaryWebsite','Published','Site Title','Division','Territory'];
        const csvLines = [headers.join(',')];

        rows.forEach(r => {
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

    // Try common places for a refresh/timestamp in the raw JSONs
    function extractRefreshDate(source) {
        if (!source) return null;
        // If source has top-level metadata or timestamp fields
        const possibleKeys = ['updated_at','updatedAt','last_updated','lastUpdated','refreshed','refreshDate','refresh_date','timestamp','generated_at','generatedAt'];
        // If object with meta
        if (source.meta && typeof source.meta === 'object') {
            for (const k of possibleKeys) if (source.meta[k]) return source.meta[k];
        }
        // If it's an array, try first item's meta
        if (Array.isArray(source) && source.length > 0) {
            const first = source[0];
            for (const k of possibleKeys) if (first[k]) return first[k];
        }
        // Try top-level keys
        for (const k of possibleKeys) if (source[k]) return source[k];
        return null;
    }

    function showRefreshDates() {
        const list = document.getElementById('refreshDatesList');
        if (!list) return;
        list.innerHTML = '';

            // Prefer parsing the filename for GDOS refresh dates
            const uswDate = parseGdosFilenameDate(rawUswFilename) || extractRefreshDate(rawUsw) || '(unknown)';
            const ussDate = parseGdosFilenameDate(rawUssFilename) || extractRefreshDate(rawUss) || '(unknown)';
            const uscDate = parseGdosFilenameDate(rawUscFilename) || extractRefreshDate(rawUsc) || '(unknown)';
            const useDate = parseGdosFilenameDate(rawUseFilename) || extractRefreshDate(rawUse) || '(unknown)';
            // Zesty (locations) may have date in different spots; fallback to 10/15 4 AM if not present
            const zestyDate = (function(){
                const d = extractRefreshDate(rawLocations);
                if (d) return d;
                return '2025-10-15 04:00';
            })();

        // Prefer showing the filename text (e.g. '10-14-18-53-USW') if available
        const uswText = filenameDateText(rawUswFilename) || uswDate;
        const ussText = filenameDateText(rawUssFilename) || ussDate;
        const uscText = filenameDateText(rawUscFilename) || uscDate;
        const useText = filenameDateText(rawUseFilename) || useDate;

        const entries = [
            ['USW (GDOS)', uswText],
            ['USS (GDOS)', ussText],
            ['USC (GDOS)', uscText],
            ['USE (GDOS)', useText],
            ['Zesty (LocationsData)', zestyDate]
        ];

        // Populate the list with entries
        entries.forEach(([label, dateText]) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `<strong>${label}</strong> <span>${dateText}</span>`;
            list.appendChild(li);
        });

            // Build one-line, alphabetically ordered territory: date pairs
            const footer = document.getElementById('refreshDatesFooter');
            if (footer) {
                const pairs = entries.map(([label, date]) => {
                    // convert label like 'USW (GDOS)' to just 'USW' for sorting/display
                    const short = label.split(' ')[0];
                    // prefer filename text (e.g., '10-14-18-53-USW') and include parsed readable date
                    const fnameText = (typeof date === 'string' ? date : '') || '';
                    const parsed = (function(){
                        if (short === 'USW') return formatParsedFilenameDate(rawUswFilename);
                        if (short === 'USS') return formatParsedFilenameDate(rawUssFilename);
                        if (short === 'USC') return formatParsedFilenameDate(rawUscFilename);
                        if (short === 'USE') return formatParsedFilenameDate(rawUseFilename);
                        if (label.startsWith('Zesty')) return `(${zestyDate})`;
                        return '';
                    })();
                    const display = `${fnameText} ${parsed}`.trim();
                    return { short, display };
                });

                pairs.sort((a,b) => a.short.localeCompare(b.short));

                footer.textContent = pairs.map(p => `${p.short}: ${p.display}`).join('  •  ');
            }
    }

    // Populate the inline refresh dates list when the DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // showRefreshDates will populate the #refreshDatesList so the collapse shows useful content
        showRefreshDates();
    });

    // Also populate when the modal is shown
    const refreshModal = document.getElementById('refreshDatesModal');
    if (refreshModal) {
        refreshModal.addEventListener('show.bs.modal', () => {
            showRefreshDates();
        });
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
            { title: "Field", field: "field", width: 100, cssClass: "field-highlight" },
            { title: "GDOS Value", field: "gdos_value", width: 200, formatter: gdosValueFormatter },
            { title: "Zesty Value", field: "zesty_value", width: 200, formatter: zestyValueFormatter },
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
                cssClass: "final-value-highlight"
            },
            { title: "GDOS ID", field: "gdos_id", width: 120 },
            { title: "Name", field: "name", width: 200 },
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
}

// Populate the territory select with values from differencesData
function populateGlobalFilters() {
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');
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
}

function applyGlobalFilters() {
    const table = window.differencesTable;
    if (!table) return;
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');

    const filters = [];
    if (territorySelect && territorySelect.value && territorySelect.value !== 'all') {
        filters.push({ field: 'territory', type: '=', value: territorySelect.value });
    }
    if (correctSelect && correctSelect.value && correctSelect.value !== 'all') {
        filters.push({ field: 'correct', type: '=', value: correctSelect.value });
    }
    if (fieldSelect && fieldSelect.value && fieldSelect.value !== 'all') {
        filters.push({ field: 'field', type: '=', value: fieldSelect.value });
    }

    if (filters.length === 0) {
        table.clearFilter();
    } else if (filters.length === 1) {
        table.setFilter(filters[0].field, filters[0].type, filters[0].value);
    } else {
        table.setFilter(filters);
    }
}

function applySavedGlobalFilters() {
    const territorySelect = document.getElementById('globalTerritoryFilter');
    const correctSelect = document.getElementById('globalCorrectFilter');
    const fieldSelect = document.getElementById('globalFieldFilter');
    const savedTerr = localStorage.getItem('globalTerritoryFilter');
    const savedCorrect = localStorage.getItem('globalCorrectFilter');
    const savedField = localStorage.getItem('globalFieldFilter');
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
    // apply after setting
    applyGlobalFilters();
}

// Filter functions for quick access
function filterDuplicates() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.setFilter("duplicate", "=", "1");
        try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
    }
}

function filterDoNotImport() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.setFilter("doNotImport", "=", "True");
        try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
    }
}

function clearFilters() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.clearFilter();
        try { updateMetrics(); } catch(e) { console.warn('updateMetrics failed', e); }
    }
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

// Parse GDOS filename of form GDOS-M-D-H-M-Territory.json and return a formatted date string
function parseGdosFilenameDate(filename) {
    if (!filename || typeof filename !== 'string') return null;
    // Match patterns like GDOS-10-14-18-53-USW.json or GDOS-10-15-04-22-USC.json
    const re = /GDOS-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-[A-Za-z]+\.json/;
    const m = filename.match(re);
    if (!m) return null;
    const year = (new Date()).getFullYear();
    const month = String(m[1]).padStart(2, '0');
    const day = String(m[2]).padStart(2, '0');
    const hour = String(m[3]).padStart(2, '0');
    const minute = String(m[4]).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

// Extract the middle filename text after 'GDOS-' and before the extension, e.g. '10-14-18-53-USW'
function filenameDateText(filename) {
    if (!filename || typeof filename !== 'string') return null;
    const m = filename.replace(/^GDOS-/, '').replace(/\.json$/i, '');
    return m || null;
}

function formatParsedFilenameDate(filename) {
    const parsed = parseGdosFilenameDate(filename);
    return parsed ? `(${parsed})` : '';
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