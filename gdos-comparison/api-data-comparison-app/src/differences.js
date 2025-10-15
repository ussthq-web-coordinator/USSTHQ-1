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
    fetch('./LocationsData.json?v=' + Date.now()).then(response => {
        if (!response.ok) throw new Error('LocationsData file not found');
        return response.json();
    })
])
.then(([uswData, ussData, locationsData]) => {
    if (!Array.isArray(uswData)) throw new Error('USW data is not an array');
    if (!Array.isArray(ussData)) throw new Error('USS data is not an array');
    if (!locationsData.data || !Array.isArray(locationsData.data)) throw new Error('LocationsData.data is not an array');

    // Extract the data array
    locationsData = locationsData.data.filter(loc => loc && typeof loc === 'object');
    console.log('First filtered loc:', locationsData[0]);
    console.log('LocationsData length after filter:', locationsData.length);

    console.log('GDOS USW data length:', uswData.length);
    console.log('GDOS USS data length:', ussData.length);
    console.log('LocationsData length:', locationsData.length);

    // Create map from gdos_id to location data
    const locationMap = new Map();
    locationsData.forEach((loc, index) => {
        const gdosId = loc['Column1.content.gdos_id'];
        if (gdosId) {
            locationMap.set(String(gdosId), loc);
        }
    });

    console.log('Location map size:', locationMap.size);
    if (locationMap.size > 0) {
        const firstKey = locationMap.keys().next().value;
        console.log('Sample location gdos_id:', firstKey, typeof firstKey);
    }

    // Combine GDOS data with territory info
    const gdosData = [
        ...uswData.map(item => ({ ...item, territory: 'USW' })),
        ...ussData.map(item => ({ ...item, territory: 'USS' }))
    ];
    console.log('Total GDOS data length:', gdosData.length);
    if (gdosData.length > 0) {
        console.log('Sample GDOS id:', gdosData[0].id, typeof gdosData[0].id);
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
    gdosData.forEach(gdos => {
        // Only include if published (gdospub = 1 equivalent)
        if (!gdos.published) {
            skippedNotPublished++;
            return;
        }
        
        const loc = locationMap.get(String(gdos.id));
        if (!loc || typeof loc !== 'object' || !loc['Column1']?.['content']) {
            skippedNoMatch++;
            return;
        }
        
        matchCount++;
        if (matchCount === 1) { // Log first match
            console.log('First match - GDOS:', gdos.id, gdos.name);
            console.log('Zesty content:', loc['Column1']['content']);
        }
        const division = getNestedValue(gdos, 'location.division.name') || 'Unknown';
        const territory = gdos.territory;
        
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
                    division: division,
                    territory: territory,
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
            { title: "Division", field: "division", width: 150, headerFilter: "input" },
            { title: "Territory", field: "territory", width: 100, headerFilter: "input" },
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