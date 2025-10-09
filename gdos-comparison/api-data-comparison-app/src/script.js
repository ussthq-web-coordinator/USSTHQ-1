let data = [];
let table;

// Load JSON data
fetch('GDOS-10-9-1-28.json')
    .then(response => {
        if (!response.ok) throw new Error('File not found');
        return response.json();
    })
    .then(json => {
        if (!Array.isArray(json)) throw new Error('Data is not an array');
        data = json;
        populateFilters();
        renderTable();
    })
    .catch(error => {
        document.body.innerHTML = `<h1>Error: ${error.message}</h1><p>Please check the GDOS-10-9-1-28.json file.</p>`;
    });

function populateFilters() {
    const categorySelect = document.getElementById('categorySelect');
    const categories = [...new Set(data.map(d => d.category).filter(c => c))];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        option.selected = true;
        categorySelect.appendChild(option);
    });

    if (data.some(d => d.date)) {
        const dates = data.map(d => new Date(d.date)).filter(d => !isNaN(d));
        if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            document.getElementById('dateFrom').value = minDate.toISOString().split('T')[0];
            document.getElementById('dateTo').value = maxDate.toISOString().split('T')[0];
        }
    }

    renderCards(data);
}

function applyFilters() {
    const selectedCategories = Array.from(document.getElementById('categorySelect').selectedOptions).map(o => o.value);
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    const filtered = data.filter(d => {
        if (selectedCategories.length > 0 && !selectedCategories.includes(d.category)) return false;
        if (dateFrom && new Date(d.date) < new Date(dateFrom)) return false;
        if (dateTo && new Date(d.date) > new Date(dateTo)) return false;
        return true;
    });

    table.setData(filtered);
    renderCards(filtered);
}

function renderTable() {
    const columns = Object.keys(data[0] || {}).map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        field: key,
        headerFilter: true,
        sorter: typeof data[0][key] === 'number' ? 'number' : 'string'
    }));

    table = new Tabulator("#dataTable", {
        data: data,
        columns: columns,
        layout: "fitDataStretch",
        pagination: "local",
        paginationSize: 20,
        movableColumns: true,
        resizableRows: true
    });
}

function renderCards(filteredData) {
    const cardsDiv = document.getElementById('cards');
    cardsDiv.innerHTML = '';

    // Total records
    const totalCard = document.createElement('div');
    totalCard.style = 'border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #f9f9f9;';
    totalCard.innerHTML = `<h3>Total Records</h3><p>${filteredData.length}</p>`;
    cardsDiv.appendChild(totalCard);

    if (filteredData.length === 0) return;

    // Find categorical fields (strings with multiple unique values)
    const sample = filteredData[0];
    const categoricalFields = Object.keys(sample).filter(key => typeof sample[key] === 'string' && new Set(filteredData.map(d => d[key])).size > 1);

    categoricalFields.forEach(field => {
        const counts = {};
        filteredData.forEach(d => {
            const value = d[field] || 'Unknown';
            counts[value] = (counts[value] || 0) + 1;
        });

        Object.entries(counts).filter(([value, count]) => count >= 15).forEach(([value, count]) => {
            const card = document.createElement('div');
            card.style = 'border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #e9f9e9; display: inline-block; margin: 5px;';
            card.innerHTML = `<h4>${field}: ${value}</h4><p>${count} records</p>`;
            cardsDiv.appendChild(card);
        });
    });
}