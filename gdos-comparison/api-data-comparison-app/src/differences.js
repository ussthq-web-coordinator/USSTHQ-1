let differencesData = [];

// Function to get nested value from object
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
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
    if (!Array.isArray(uswData)) throw new Error('USW data is not an array');
    if (!Array.isArray(ussData)) throw new Error('USS data is not an array');
    if (!Array.isArray(uscData)) throw new Error('USC data is not an array');
    if (!Array.isArray(useData)) throw new Error('USE data is not an array');
    if (!locationsData.data || !Array.isArray(locationsData.data)) throw new Error('LocationsData.data is not an array');
    if (!duplicateCheckData.data || !Array.isArray(duplicateCheckData.data)) throw new Error('DuplicateLocationCheck.data is not an array');

    // Extract the data arrays
    locationsData = locationsData.data.filter(loc => loc && typeof loc === 'object');
    const duplicateCheckRecords = duplicateCheckData.data;
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
        if (gdosId) {
            locationMap.set(gdosId, loc);
        }
    });

    // Create map from gdosid to duplicate check data
    const duplicateMap = new Map();
    duplicateCheckRecords.forEach(record => {
        const gdosId = record.gdosid;
        if (gdosId) {
            duplicateMap.set(gdosId, record);
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
        // Only include if published (gdospub = 1 equivalent)
        if (!gdos.published) {
            skippedNotPublished++;
            return;
        }
        
        let loc = locationMap.get(gdos.id);
        
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
        const duplicateRecord = duplicateMap.get(gdos.id);
        
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
                    duplicate: duplicateRecord ? (duplicateRecord.duplicate === 'Not Found' ? '0' : duplicateRecord.duplicate) : '0',
                    doNotImport: duplicateRecord ? duplicateRecord.doNotImport : 'False',
                    field: fieldObj.field,
                    gdos_value: gdosValue,
                    zesty_value: zestyValue,
                    correct: 'GDOS' // default
                });
            }
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

    renderDifferencesTable();
})
.catch(error => {
    console.error('Error loading data:', error);
    alert('Error loading data: ' + error.message);
});

function correctValueFormatter(cell, formatterParams, onRendered) {
    const value = cell.getValue();
    const select = document.createElement('select');
    select.className = 'form-select form-select-sm';
    select.innerHTML = `
        <option value="GDOS" ${value === 'GDOS' ? 'selected' : ''}>GDOS</option>
        <option value="Zesty" ${value === 'Zesty' ? 'selected' : ''}>Zesty</option>
    `;
    select.addEventListener('change', function() {
        cell.setValue(this.value);
    });
    return select;
}

function renderDifferencesTable() {
    // Calculate summary
    const uniqueTerritories = new Set(differencesData.map(d => d.territory)).size;
    
    // Update summary
    const summaryDiv = document.getElementById('differencesSummary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `Showing ${differencesData.length} differences across ${uniqueTerritories} territories.`;
    }
    
    const table = new Tabulator("#differencesTable", {
        data: differencesData,
        layout: "fitColumns",
        columns: [
            { title: "GDOS ID", field: "gdos_id", width: 120 },
            { title: "Name", field: "name", width: 200 },
            { title: "Property Type", field: "property_type", width: 150, headerFilter: "input" },
            { title: "Division", field: "division", width: 150, headerFilter: "input" },
            { title: "Territory", field: "territory", width: 100, headerFilter: "input" },
            { title: "Duplicate", field: "duplicate", width: 100, headerFilter: "select", headerFilterParams: { values: {"0": "Not Duplicate", "1": "Duplicate"} } },
            { title: "Do Not Import", field: "doNotImport", width: 120, headerFilter: "select", headerFilterParams: { values: {"False": "Import", "True": "Do Not Import"} } },
            { title: "Field", field: "field", width: 100 },
            { title: "GDOS Value", field: "gdos_value", width: 200 },
            { title: "Zesty Value", field: "zesty_value", width: 200 },
            {
                title: "Correct Value",
                field: "correct",
                width: 150,
                formatter: correctValueFormatter
            }
        ],
        pagination: "local",
        paginationSize: 20,
        paginationSizeSelector: [10, 20, 50, 100],
        tooltips: true,
        resizableColumns: true
    });
}

// Filter functions for quick access
function filterDuplicates() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.setFilter("duplicate", "=", "1");
    }
}

function filterDoNotImport() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.setFilter("doNotImport", "=", "True");
    }
}

function clearFilters() {
    const table = Tabulator.findTable("#differencesTable")[0];
    if (table) {
        table.clearFilter();
    }
}