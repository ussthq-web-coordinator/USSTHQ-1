let data = [];
let table;
const hiddenFields = ['contactName', 'contactWebsite', 'email', 'externalTerritoryId', 'licensed', 'location', 'lock', 'services', 'wm4ModelName', 'websiteTechnology', 'locationData'];

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
    locationsData = locationsData.data;
    const duplicateCheckRecords = duplicateCheckData.data;
    
    // Create map from gdos_id to location data
    const locationMap = new Map();
    locationsData.forEach(loc => {
        const gdosId = loc['Column1.content.gdos_id'];
        if (gdosId || gdosId === 0) {
            // normalize key type to string to avoid mismatches
            locationMap.set(String(gdosId), loc);
        }
    });
    
    // Create map from gdosid to duplicate check data
    const duplicateMap = new Map();
    duplicateCheckRecords.forEach(record => {
        // support several common key variants for GDOS id in the duplicate check data
        const gdosId = record && (record.gdosid ?? record.gdos_id ?? record.gdosId ?? record['gdos id'] ?? (record.gdos && record.gdos.id));
        if (gdosId || gdosId === 0) {
            duplicateMap.set(String(gdosId), record);
        }
    });
    
    // Add territory field and merge location data (without mutating original data)
    const uswDataWithTerritory = uswData.map(d => {
        const loc = locationMap.get(String(d.id));
        const duplicateRecord = duplicateMap.get(String(d.id));
        return {
            ...d,
            territory: 'USA Western Territory',
            ...(loc && { locationData: loc }),
            // If duplicateRecord exists, use the file values exactly (stringified); otherwise use defaults
            duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
            doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False'
        };
    });
    const ussDataWithTerritory = ussData.map(d => {
        const loc = locationMap.get(String(d.id));
        const duplicateRecord = duplicateMap.get(String(d.id));
        return {
            ...d,
            territory: 'USA Southern Territory',
            ...(loc && { locationData: loc }),
            // If duplicateRecord exists, use the file values exactly (stringified); otherwise use defaults
            duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
            doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False'
        };
    });
    const uscDataWithTerritory = uscData.map(d => {
        const loc = locationMap.get(String(d.id));
        const duplicateRecord = duplicateMap.get(String(d.id));
        return {
            ...d,
            territory: 'USA Central Territory',
            ...(loc && { locationData: loc }),
            // If duplicateRecord exists, use the file values exactly (stringified); otherwise use defaults
            duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
            doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False'
        };
    });
    const useDataWithTerritory = useData.map(d => {
        const loc = locationMap.get(String(d.id));
        const duplicateRecord = duplicateMap.get(String(d.id));
        return {
            ...d,
            territory: 'USA Eastern Territory',
            ...(loc && { locationData: loc }),
            // If duplicateRecord exists, use the file values exactly (stringified); otherwise use defaults
            duplicate: duplicateRecord && duplicateRecord.duplicate != null ? String(duplicateRecord.duplicate) : '0',
            doNotImport: duplicateRecord && duplicateRecord.doNotImport != null ? String(duplicateRecord.doNotImport) : 'False'
        };
    });
    
    // Combine data
    data = [...uswDataWithTerritory, ...ussDataWithTerritory, ...uscDataWithTerritory, ...useDataWithTerritory];
    
    populateFilterOptions(data, true);
    updateFilterVisualState();
    renderTable();
})
.catch(error => {
    document.body.innerHTML = `<h1>Error: ${error.message}</h1><p>Please check the JSON files.</p>`;
});

function populateFilterOptions(filteredData, addListeners = false, hasEmptyFilter = false) {
    // Territory filter
    const territorySelect = document.getElementById('territorySelect');
    const currentTerritories = Array.from(territorySelect.selectedOptions).map(o => o.value);
    territorySelect.innerHTML = '';
    // Add All option
    const allTerrOption = document.createElement('option');
    allTerrOption.value = 'all';
    allTerrOption.textContent = 'All';
    territorySelect.appendChild(allTerrOption);
    const allTerritories = [...new Set(data.map(d => d.territory).filter(t => t))];
    const availableTerritories = [...new Set(filteredData.map(d => d.territory).filter(t => t))];
    allTerritories.forEach(terr => {
        const option = document.createElement('option');
        option.value = terr;
        option.textContent = terr;
        option.selected = hasEmptyFilter || currentTerritories.length === 0 || currentTerritories.includes('all') || (currentTerritories.includes(terr) && availableTerritories.includes(terr));
        territorySelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allTerrOption.selected = currentTerritories.includes('all') || currentTerritories.length === 0 || hasEmptyFilter;

    // Published filter
    const publishedSelect = document.getElementById('publishedSelect');
    const currentPublished = Array.from(publishedSelect.selectedOptions).map(o => o.value);
    publishedSelect.innerHTML = '';
    // Add All option
    const allPubOption = document.createElement('option');
    allPubOption.value = 'all';
    allPubOption.textContent = 'All';
    publishedSelect.appendChild(allPubOption);
    const allPublished = [...new Set(data.map(d => d.published).filter(pub => pub !== undefined && pub !== null))];
    const availablePublished = [...new Set(filteredData.map(d => d.published).filter(pub => pub !== undefined && pub !== null))];
    allPublished.forEach(pub => {
        const option = document.createElement('option');
        option.value = pub.toString();
        option.textContent = pub ? 'Published' : 'Not Published';
        option.selected = hasEmptyFilter || currentPublished.length === 0 || currentPublished.includes('all') || (currentPublished.includes(pub.toString()) && availablePublished.includes(pub));
        publishedSelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allPubOption.selected = currentPublished.includes('all') || currentPublished.length === 0 || hasEmptyFilter;

    // State filter
    const stateSelect = document.getElementById('stateSelect');
    const currentStates = Array.from(stateSelect.selectedOptions).map(o => o.value);
    stateSelect.innerHTML = '';
    // Add All option
    const allStateOption = document.createElement('option');
    allStateOption.value = 'all';
    allStateOption.textContent = 'All';
    stateSelect.appendChild(allStateOption);
    const allStates = [...new Set(data.map(d => d.state?.name).filter(s => s))];
    const availableStates = [...new Set(filteredData.map(d => d.state?.name).filter(s => s))];
    allStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        option.selected = hasEmptyFilter || currentStates.length === 0 || currentStates.includes('all') || (currentStates.includes(state) && availableStates.includes(state));
        stateSelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allStateOption.selected = currentStates.includes('all') || currentStates.length === 0 || hasEmptyFilter;

    // Division filter
    const divisionSelect = document.getElementById('divisionSelect');
    const currentDivisions = Array.from(divisionSelect.selectedOptions).map(o => o.value);
    divisionSelect.innerHTML = '';
    // Add All option
    const allDivOption = document.createElement('option');
    allDivOption.value = 'all';
    allDivOption.textContent = 'All';
    divisionSelect.appendChild(allDivOption);
    const allDivisions = [...new Set(data.map(d => d.location?.division?.name).filter(d => d))];
    const availableDivisions = [...new Set(filteredData.map(d => d.location?.division?.name).filter(d => d))];
    allDivisions.forEach(div => {
        const option = document.createElement('option');
        option.value = div;
        option.textContent = div.length > 30 ? div.substring(0, 27) + '...' : div;
        option.selected = hasEmptyFilter || currentDivisions.length === 0 || currentDivisions.includes('all') || (currentDivisions.includes(div) && availableDivisions.includes(div));
        divisionSelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allDivOption.selected = currentDivisions.includes('all') || currentDivisions.length === 0 || hasEmptyFilter;

    // Site Type filter
    const siteTypeSelect = document.getElementById('siteTypeSelect');
    const currentSiteTypes = Array.from(siteTypeSelect.selectedOptions).map(o => o.value);
    siteTypeSelect.innerHTML = '';
    // Add All option
    const allSiteOption = document.createElement('option');
    allSiteOption.value = 'all';
    allSiteOption.textContent = 'All';
    siteTypeSelect.appendChild(allSiteOption);
    const allSiteTypes = [...new Set(data.map(d => d.wm4SiteType?.name).filter(s => s))];
    const availableSiteTypes = [...new Set(filteredData.map(d => d.wm4SiteType?.name).filter(s => s))];
    allSiteTypes.forEach(siteType => {
        const option = document.createElement('option');
        option.value = siteType;
        option.textContent = siteType;
        option.selected = hasEmptyFilter || currentSiteTypes.length === 0 || currentSiteTypes.includes('all') || (currentSiteTypes.includes(siteType) && availableSiteTypes.includes(siteType));
        siteTypeSelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allSiteOption.selected = currentSiteTypes.includes('all') || currentSiteTypes.length === 0 || hasEmptyFilter;

    // Duplicate filter
    const duplicateSelect = document.getElementById('duplicateSelect');
    const currentDuplicates = Array.from(duplicateSelect.selectedOptions).map(o => o.value);
    duplicateSelect.innerHTML = '';
    // Add All option
    const allDupOption = document.createElement('option');
    allDupOption.value = 'all';
    allDupOption.textContent = 'All';
    duplicateSelect.appendChild(allDupOption);
    const allDuplicates = [...new Set(data.map(d => d.duplicate).filter(dup => dup !== undefined && dup !== null))];
    const availableDuplicates = [...new Set(filteredData.map(d => d.duplicate).filter(dup => dup !== undefined && dup !== null))];
    allDuplicates.forEach(dup => {
        const option = document.createElement('option');
        option.value = dup;
        option.textContent = dup === '1' ? 'Duplicate' : 'Not Duplicate';
        option.selected = hasEmptyFilter || currentDuplicates.length === 0 || currentDuplicates.includes('all') || (currentDuplicates.includes(dup) && availableDuplicates.includes(dup));
        duplicateSelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allDupOption.selected = currentDuplicates.includes('all') || currentDuplicates.length === 0 || hasEmptyFilter;

    // Do Not Import filter
    const doNotImportSelect = document.getElementById('doNotImportSelect');
    const currentDoNotImport = Array.from(doNotImportSelect.selectedOptions).map(o => o.value);
    doNotImportSelect.innerHTML = '';
    // Add All option
    const allDniOption = document.createElement('option');
    allDniOption.value = 'all';
    allDniOption.textContent = 'All';
    doNotImportSelect.appendChild(allDniOption);
    const allDoNotImport = [...new Set(data.map(d => d.doNotImport).filter(dni => dni !== undefined && dni !== null))];
    const availableDoNotImport = [...new Set(filteredData.map(d => d.doNotImport).filter(dni => dni !== undefined && dni !== null))];
    allDoNotImport.forEach(dni => {
        const option = document.createElement('option');
        option.value = dni;
        option.textContent = dni === 'True' ? 'Do Not Import' : 'Import';
        option.selected = hasEmptyFilter || currentDoNotImport.length === 0 || currentDoNotImport.includes('all') || (currentDoNotImport.includes(dni) && availableDoNotImport.includes(dni));
        doNotImportSelect.appendChild(option);
    });
    // Select All if all is selected or no selection
    allDniOption.selected = currentDoNotImport.includes('all') || currentDoNotImport.length === 0 || hasEmptyFilter;

    // Column visibility select
    const columnSelect = document.getElementById('columnSelect');
    columnSelect.innerHTML = '';
    hiddenFields.forEach(field => {
        if (filteredData.some(d => d.hasOwnProperty(field))) {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field.charAt(0).toUpperCase() + field.slice(1);
            columnSelect.appendChild(option);
        }
    });

    // Add event listeners for live filtering
    if (addListeners) {
        territorySelect.addEventListener('change', applyFilters);
        publishedSelect.addEventListener('change', applyFilters);
        stateSelect.addEventListener('change', applyFilters);
        divisionSelect.addEventListener('change', applyFilters);
        siteTypeSelect.addEventListener('change', applyFilters);
        document.getElementById('duplicateSelect').addEventListener('change', applyFilters);
        document.getElementById('doNotImportSelect').addEventListener('change', applyFilters);
        document.getElementById('openHoursSelect').addEventListener('change', applyFilters);
        document.getElementById('websiteSelect').addEventListener('change', applyFilters);
        document.getElementById('phoneSelect').addEventListener('change', applyFilters);

        // Add event listener for column visibility
        columnSelect.addEventListener('change', () => {
            const selectedColumns = Array.from(columnSelect.selectedOptions).map(o => o.value);
            table.getColumns().forEach(col => {
                const field = col.getField();
                if (hiddenFields.includes(field)) {
                    col.toggle(selectedColumns.includes(field));
                }
            });
        });

        // Add event listener for reset filters
        document.getElementById('resetFilters').addEventListener('click', () => {
            populateFilterOptions(data, false, true);
            applyFilters();
        });
    }
}

function updateFilterVisualState() {
    // Get all filter containers
    const filterContainers = document.querySelectorAll('[data-filter-type]');

    filterContainers.forEach(container => {
        const select = container.querySelector('select');
        if (!select) return;

        const selectedOptions = Array.from(select.selectedOptions);
        const isMultiple = select.multiple;
        let isActive = false;

        if (isMultiple) {
            isActive = selectedOptions.length > 0 && !selectedOptions.some(o => o.value === 'all');
        } else {
            isActive = selectedOptions.length > 0 && selectedOptions[0].value !== 'all';
        }

        container.classList.toggle('active', isActive);
        container.classList.toggle('inactive', !isActive);

        // Style selected options in dropdown
        Array.from(select.options).forEach(option => {
            option.style.backgroundColor = '';
            option.style.color = '';
            option.style.fontWeight = '';
        });
        if (isActive) {
            selectedOptions.forEach(option => {
                option.style.backgroundColor = '#007bff';
                option.style.color = 'white';
                option.style.fontWeight = '600';
            });
        }

        // Add or update selected indicator
        let indicator = container.querySelector('.selected-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'selected-indicator';
            container.appendChild(indicator);
        }

        if (isActive) {
            const values = selectedOptions.map(o => o.textContent).join(', ');
            indicator.textContent = `Selected: ${values}`;
            indicator.style.display = 'block';
        } else {
            indicator.textContent = '';
            indicator.style.display = 'none';
        }
    });
}

function applyFilters() {
    const selectedTerritories = Array.from(document.getElementById('territorySelect').selectedOptions).map(o => o.value);
    const selectedPublished = Array.from(document.getElementById('publishedSelect').selectedOptions).map(o => o.value);
    const selectedStates = Array.from(document.getElementById('stateSelect').selectedOptions).map(o => o.value);
    const selectedDivisions = Array.from(document.getElementById('divisionSelect').selectedOptions).map(o => o.value);
    const selectedSiteTypes = Array.from(document.getElementById('siteTypeSelect').selectedOptions).map(o => o.value);
    const selectedDuplicates = Array.from(document.getElementById('duplicateSelect').selectedOptions).map(o => o.value);
    const selectedDoNotImport = Array.from(document.getElementById('doNotImportSelect').selectedOptions).map(o => o.value);
    const openHoursFilter = document.getElementById('openHoursSelect').value;
    const websiteFilter = document.getElementById('websiteSelect').value;
    const phoneFilter = document.getElementById('phoneSelect').value;

    const filtered = data.filter(d => {
        // New territory filter
        if (!selectedTerritories.includes('all') && selectedTerritories.length > 0 && !selectedTerritories.includes(d.territory)) return false;
        
        // New published filter
        if (!selectedPublished.includes('all') && selectedPublished.length > 0 && !selectedPublished.includes(d.published.toString())) return false;

        // State filter
        if (!selectedStates.includes('all') && selectedStates.length > 0 && !selectedStates.includes(d.state?.name)) return false;

        // Division filter
        if (!selectedDivisions.includes('all') && selectedDivisions.length > 0 && !selectedDivisions.includes(d.location?.division?.name)) return false;

        // Site Type filter
        if (!selectedSiteTypes.includes('all') && selectedSiteTypes.length > 0 && !selectedSiteTypes.includes(d.wm4SiteType?.name)) return false;

        // Duplicate filter
        if (!selectedDuplicates.includes('all') && selectedDuplicates.length > 0 && !selectedDuplicates.includes(d.duplicate)) return false;

        // Do Not Import filter
        if (!selectedDoNotImport.includes('all') && selectedDoNotImport.length > 0 && !selectedDoNotImport.includes(d.doNotImport)) return false;

        // OpenHoursText filter
        if (openHoursFilter === 'empty' && (d.openHoursText !== null && d.openHoursText !== '')) return false;
        if (openHoursFilter === 'not-empty' && (d.openHoursText === null || d.openHoursText === '')) return false;

        // PrimaryWebsite filter
        if (websiteFilter === 'empty' && (d.primaryWebsite !== null && d.primaryWebsite !== '')) return false;
        if (websiteFilter === 'not-empty' && (d.primaryWebsite === null || d.primaryWebsite === '')) return false;

        // PhoneNumber filter
        if (phoneFilter === 'empty' && (d.phoneNumber !== null && d.phoneNumber !== '')) return false;
        if (phoneFilter === 'not-empty' && (d.phoneNumber === null || d.phoneNumber === '')) return false;
        
        return true;
    });

    if (typeof smartRefreshTable === 'function') {
        Promise.resolve(smartRefreshTable(table)).catch(e => {
            console.warn('smartRefreshTable failed in filters; falling back to setData', e);
            try { if (table && typeof table.setData === 'function') table.setData(filtered); } catch (e2) { console.warn('fallback setData failed', e2); }
        });
    } else if (table && typeof table.setData === 'function') {
        // If the user is editing in the differences table, defer applying the filtered set
        // to avoid stealing focus. Retry shortly after editing stops.
        try {
            if (typeof isUserEditingInTable === 'function' && isUserEditingInTable()) {
                console.log('Deferring filter setData because user is editing; will retry shortly');
                setTimeout(() => {
                    try { table.setData(filtered); } catch (e) { console.warn('deferred table.setData failed in filters', e); }
                }, 1000);
            } else {
                table.setData(filtered);
            }
        } catch (e) { console.warn('table.setData failed in filters', e); }
    } else if (table && typeof table.replaceData === 'function') {
        try {
            if (typeof isUserEditingInTable === 'function' && isUserEditingInTable()) {
                console.log('Deferring filter replaceData because user is editing; will retry shortly');
                setTimeout(() => {
                    try { table.replaceData(filtered); } catch (e) { console.warn('deferred table.replaceData failed in filters', e); }
                }, 1000);
            } else {
                table.replaceData(filtered);
            }
        } catch (e) { console.warn('table.replaceData failed in filters', e); }
    }
    const hasEmptyFilter = selectedTerritories.includes('all') || selectedPublished.includes('all') || selectedStates.includes('all') || selectedDivisions.includes('all') || selectedSiteTypes.includes('all') || selectedDuplicates.includes('all') || selectedDoNotImport.includes('all');
    populateFilterOptions(hasEmptyFilter ? data : filtered, false, hasEmptyFilter);
    renderCards(filtered);
    updateFilterVisualState();
}

function renderTable() {
    let keys = Object.keys(data[0] || {});
    // Put 'name' column first if it exists
    const nameIndex = keys.indexOf('name');
    if (nameIndex > -1) {
        keys.splice(nameIndex, 1);
        keys.unshift('name');
    }
    // Put territory, duplicate, and doNotImport columns early
    const territoryIndex = keys.indexOf('territory');
    if (territoryIndex > -1) {
        keys.splice(territoryIndex, 1);
        keys.splice(1, 0, 'territory');
    }
    const duplicateIndex = keys.indexOf('duplicate');
    if (duplicateIndex > -1) {
        keys.splice(duplicateIndex, 1);
        keys.splice(2, 0, 'duplicate');
    }
    const doNotImportIndex = keys.indexOf('doNotImport');
    if (doNotImportIndex > -1) {
        keys.splice(doNotImportIndex, 1);
        keys.splice(3, 0, 'doNotImport');
    }
    const columns = [];
    keys.forEach(key => {
        if (hiddenFields.includes(key)) return;
        if (key === 'email') {
            columns.push({title: 'Email', field: 'email.address', headerFilter: true, sorter: 'string'});
        } else if (key === 'state') {
            columns.push({title: 'State', field: 'state.name', headerFilter: true, sorter: 'string'});
        } else if (key === 'zip') {
            columns.push({title: 'Zip', field: 'zip.zipcode', headerFilter: true, sorter: 'string'});
        } else if (key === 'wm4ModelName') {
            columns.push({title: 'WM4 Model', field: 'wm4ModelName.name', headerFilter: true, sorter: 'string'});
        } else if (key === 'wm4SiteType') {
            columns.push({title: 'WM4 Site Type', field: 'wm4SiteType.name', headerFilter: true, sorter: 'string'});
        } else if (key === 'services') {
            columns.push({title: 'Services', field: 'services', formatter: cell => cell.getValue()?.map(s => s.name).join(', ') || '', headerFilter: true, sorter: 'string'});
        } else if (key === 'locationData') {
            // Add separate columns for location data
            columns.push({title: 'Description', field: 'locationData.Column1.content.description', headerFilter: true, sorter: 'string'});
            columns.push({title: 'Classy ID', field: 'locationData.Column1.content.classy_id', headerFilter: true, sorter: 'string'});
            columns.push({title: 'Banner Images', field: 'locationData.Column1.content.banner_images', headerFilter: true, sorter: 'string'});
        } else {
            columns.push({
                title: key.charAt(0).toUpperCase() + key.slice(1),
                field: key,
                headerFilter: true,
                sorter: typeof data[0][key] === 'number' ? 'number' : 'string'
            });
        }
    });

    table = new Tabulator("#dataTable", {
        data: data,
        columns: columns,
        layout: "fitDataStretch",
        pagination: "local",
        paginationSize: 20,
        movableColumns: true,
        resizableRows: true
    });

    // Update metrics on data changes
    table.on('dataFiltered', function(filters, rows) {
        const filteredData = rows.map(r => r.getData());
        renderCards(filteredData);
    });
}

let currentPage = 0;
let allCards = [];

function renderCards(filteredData) {
    const cardsDiv = document.getElementById('cards');
    cardsDiv.innerHTML = '';

    // Total records
    const gdosTotal = filteredData.length;
    const zestyTotal = filteredData.filter(d => d.locationData).length;
    const totalCard = document.createElement('div');
    totalCard.className = 'card flex-shrink-0 me-3 border-primary';
    totalCard.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Total Records</h5>
            <p class="card-text">GDOS: ${gdosTotal}<br>Zesty: ${zestyTotal}</p>
        </div>
    `;
    cardsDiv.appendChild(totalCard);

    // Duplicate records
    const duplicateCount = filteredData.filter(d => d.duplicate === '1').length;
    const duplicateCard = document.createElement('div');
    duplicateCard.className = 'card flex-shrink-0 me-3 border-warning';
    duplicateCard.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Duplicate Records</h5>
            <p class="card-text">${duplicateCount} records</p>
        </div>
    `;
    cardsDiv.appendChild(duplicateCard);

    // Do Not Import records
    const doNotImportCount = filteredData.filter(d => d.doNotImport === 'True').length;
    const doNotImportCard = document.createElement('div');
    doNotImportCard.className = 'card flex-shrink-0 me-3 border-danger';
    doNotImportCard.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Do Not Import</h5>
            <p class="card-text">${doNotImportCount} records</p>
        </div>
    `;
    cardsDiv.appendChild(doNotImportCard);

    if (filteredData.length === 0) return;

    // Find categorical fields (strings with multiple unique values)
    const sample = filteredData[0];
    const categoricalFields = Object.keys(sample).filter(key => typeof sample[key] === 'string' && new Set(filteredData.map(d => d[key])).size > 1);

    allCards = [];
    categoricalFields.forEach(field => {
        const counts = {};
        filteredData.forEach(d => {
            const value = d[field] || 'Unknown';
            counts[value] = (counts[value] || 0) + 1;
        });

        Object.entries(counts).filter(([value, count]) => count >= 15).forEach(([value, count]) => {
            const card = document.createElement('div');
            card.className = 'card flex-shrink-0 me-3';
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${field}: ${value}</h5>
                    <p class="card-text">${count} records</p>
                </div>
            `;
            allCards.push(card);
        });
    });

    // Add pagination
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'd-flex justify-content-center mt-3';
    paginationDiv.innerHTML = `
        <nav aria-label="Card pagination">
            <ul class="pagination">
                <li class="page-item" id="prevBtn">
                    <a class="page-link" href="#" onclick="changePage(-1)">Previous</a>
                </li>
                <li class="page-item" id="nextBtn">
                    <a class="page-link" href="#" onclick="changePage(1)">Next</a>
                </li>
            </ul>
        </nav>
    `;
    cardsDiv.appendChild(paginationDiv);

    renderPage(0);
}

function renderPage(page) {
    currentPage = page;
    const cardsDiv = document.getElementById('cards');
    // Remove existing categorical cards (keep total and pagination)
    const existingCards = cardsDiv.querySelectorAll('.card:not(:first-child)');
    existingCards.forEach(card => card.remove());

    const start = page * 9;
    const end = start + 9;
    const cardsToShow = allCards.slice(start, end);

    // Insert after total card
    const totalCard = cardsDiv.querySelector('.card');
    cardsToShow.forEach(card => {
        cardsDiv.insertBefore(card, cardsDiv.lastElementChild);
    });

    // Update pagination buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    prevBtn.classList.toggle('disabled', page === 0);
    nextBtn.classList.toggle('disabled', end >= allCards.length);
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 0 && newPage * 9 < allCards.length) {
        renderPage(newPage);
    }
}