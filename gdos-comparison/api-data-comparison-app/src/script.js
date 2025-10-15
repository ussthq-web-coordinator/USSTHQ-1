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
    locationsData = locationsData.data;
    
    // Create map from gdos_id to location data
    const locationMap = new Map();
    locationsData.forEach(loc => {
        const gdosId = loc['Column1.content.gdos_id'];
        if (gdosId) {
            locationMap.set(gdosId, loc);
        }
    });
    
    // Add territory field and merge location data
    uswData.forEach(d => {
        d.territory = 'USA Western Territory';
        const loc = locationMap.get(d.id);
        if (loc) d.locationData = loc;
    });
    ussData.forEach(d => {
        d.territory = 'USA Southern Territory';
        const loc = locationMap.get(d.id);
        if (loc) d.locationData = loc;
    });
    
    // Combine data
    data = [...uswData, ...ussData];
    
    populateFilterOptions(data, true);
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
    const allTerritories = [...new Set(data.map(d => d.territory).filter(t => t))];
    const availableTerritories = [...new Set(filteredData.map(d => d.territory).filter(t => t))];
    allTerritories.forEach(terr => {
        const option = document.createElement('option');
        option.value = terr;
        option.textContent = terr;
        option.selected = hasEmptyFilter || currentTerritories.length === 0 || (currentTerritories.includes(terr) && availableTerritories.includes(terr));
        territorySelect.appendChild(option);
    });

    // Published filter
    const publishedSelect = document.getElementById('publishedSelect');
    const currentPublished = Array.from(publishedSelect.selectedOptions).map(o => o.value);
    publishedSelect.innerHTML = '';
    const allPublished = [...new Set(data.map(d => d.published).filter(pub => pub !== undefined && pub !== null))];
    const availablePublished = [...new Set(filteredData.map(d => d.published).filter(pub => pub !== undefined && pub !== null))];
    allPublished.forEach(pub => {
        const option = document.createElement('option');
        option.value = pub.toString();
        option.textContent = pub ? 'Published' : 'Not Published';
        option.selected = hasEmptyFilter || currentPublished.length === 0 || (currentPublished.includes(pub.toString()) && availablePublished.includes(pub));
        publishedSelect.appendChild(option);
    });

    // State filter
    const stateSelect = document.getElementById('stateSelect');
    const currentStates = Array.from(stateSelect.selectedOptions).map(o => o.value);
    stateSelect.innerHTML = '';
    const allStates = [...new Set(data.map(d => d.state?.name).filter(s => s))];
    const availableStates = [...new Set(filteredData.map(d => d.state?.name).filter(s => s))];
    allStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        option.selected = hasEmptyFilter || currentStates.length === 0 || (currentStates.includes(state) && availableStates.includes(state));
        stateSelect.appendChild(option);
    });

    // Division filter
    const divisionSelect = document.getElementById('divisionSelect');
    const currentDivisions = Array.from(divisionSelect.selectedOptions).map(o => o.value);
    divisionSelect.innerHTML = '';
    const allDivisions = [...new Set(data.map(d => d.location?.division?.name).filter(d => d))];
    const availableDivisions = [...new Set(filteredData.map(d => d.location?.division?.name).filter(d => d))];
    allDivisions.forEach(div => {
        const option = document.createElement('option');
        option.value = div;
        option.textContent = div.length > 30 ? div.substring(0, 27) + '...' : div;
        option.selected = hasEmptyFilter || currentDivisions.length === 0 || (currentDivisions.includes(div) && availableDivisions.includes(div));
        divisionSelect.appendChild(option);
    });

    // Site Type filter
    const siteTypeSelect = document.getElementById('siteTypeSelect');
    const currentSiteTypes = Array.from(siteTypeSelect.selectedOptions).map(o => o.value);
    siteTypeSelect.innerHTML = '';
    const allSiteTypes = [...new Set(data.map(d => d.wm4SiteType?.name).filter(s => s))];
    const availableSiteTypes = [...new Set(filteredData.map(d => d.wm4SiteType?.name).filter(s => s))];
    allSiteTypes.forEach(siteType => {
        const option = document.createElement('option');
        option.value = siteType;
        option.textContent = siteType;
        option.selected = hasEmptyFilter || currentSiteTypes.length === 0 || (currentSiteTypes.includes(siteType) && availableSiteTypes.includes(siteType));
        siteTypeSelect.appendChild(option);
    });

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

function applyFilters() {
    const selectedTerritories = Array.from(document.getElementById('territorySelect').selectedOptions).map(o => o.value);
    const selectedPublished = Array.from(document.getElementById('publishedSelect').selectedOptions).map(o => o.value === 'true');  // Convert string to boolean
    const selectedStates = Array.from(document.getElementById('stateSelect').selectedOptions).map(o => o.value);
    const selectedDivisions = Array.from(document.getElementById('divisionSelect').selectedOptions).map(o => o.value);
    const selectedSiteTypes = Array.from(document.getElementById('siteTypeSelect').selectedOptions).map(o => o.value);
    const openHoursFilter = document.getElementById('openHoursSelect').value;
    const websiteFilter = document.getElementById('websiteSelect').value;
    const phoneFilter = document.getElementById('phoneSelect').value;

    const filtered = data.filter(d => {
        // New territory filter
        if (selectedTerritories.length > 0 && !selectedTerritories.includes(d.territory)) return false;
        
        // New published filter
        if (selectedPublished.length > 0 && !selectedPublished.includes(d.published)) return false;

        // State filter
        if (selectedStates.length > 0 && !selectedStates.includes(d.state?.name)) return false;

        // Division filter
        if (selectedDivisions.length > 0 && !selectedDivisions.includes(d.location?.division?.name)) return false;

        // Site Type filter
        if (selectedSiteTypes.length > 0 && !selectedSiteTypes.includes(d.wm4SiteType?.name)) return false;

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

    table.setData(filtered);
    const hasEmptyFilter = selectedTerritories.length === 0 || selectedPublished.length === 0 || selectedStates.length === 0 || selectedDivisions.length === 0 || selectedSiteTypes.length === 0;
    populateFilterOptions(hasEmptyFilter ? data : filtered, false, hasEmptyFilter);
    renderCards(filtered);
}

function renderTable() {
    let keys = Object.keys(data[0] || {});
    // Put 'name' column first if it exists
    const nameIndex = keys.indexOf('name');
    if (nameIndex > -1) {
        keys.splice(nameIndex, 1);
        keys.unshift('name');
    }
    // Swap 'id' and 'openHoursText' if both exist
    const idIndex = keys.indexOf('id');
    const openHoursIndex = keys.indexOf('openHoursText');
    if (idIndex > -1 && openHoursIndex > -1) {
        [keys[idIndex], keys[openHoursIndex]] = [keys[openHoursIndex], keys[idIndex]];
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
    const totalCard = document.createElement('div');
    totalCard.className = 'card flex-shrink-0 me-3 border-primary';
    totalCard.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Total Records</h5>
            <p class="card-text">${filteredData.length}</p>
        </div>
    `;
    cardsDiv.appendChild(totalCard);

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