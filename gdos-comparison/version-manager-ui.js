/**
 * UI Controller for Data Version Manager
 * Handles all user interactions and table rendering
 */

let versionManager = null;
let comparisonTable = null;
let currentData = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    versionManager = new DataVersionManager();
    setupEventListeners();
    initializeTable();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    document.getElementById('btnLoadVersions').addEventListener('click', loadAllVersions);
    document.getElementById('btnShowChanges').addEventListener('click', showOnlyChanges);
    document.getElementById('btnShowAll').addEventListener('click', showAllRecords);
    document.getElementById('btnExportHistory').addEventListener('click', exportHistory);
    document.getElementById('btnClearCache').addEventListener('click', clearCache);
    
    document.getElementById('filterTerritory').addEventListener('change', applyFilters);
    document.getElementById('filterChangeType').addEventListener('change', applyFilters);
    document.getElementById('searchGdosId').addEventListener('input', applyFilters);
    
    document.getElementById('btnCancelUpdate').addEventListener('click', closeUpdateModal);
    document.getElementById('btnConfirmUpdate').addEventListener('click', confirmUpdate);
}

/**
 * Initialize the Tabulator table
 */
function initializeTable() {
    comparisonTable = new Tabulator("#versionComparisonTable", {
        layout: "fitDataStretch",
        height: "600px",
        placeholder: "No data loaded. Click 'Load All Data Versions' to begin.",
        columns: [
            {
                title: "GDOS ID",
                field: "gdosId",
                width: 280,
                frozen: true,
                headerFilter: "input"
            },
            {
                title: "Name",
                field: "name",
                width: 250,
                frozen: true
            },
            {
                title: "Territory",
                field: "territory",
                width: 100,
                headerFilter: "select",
                headerFilterParams: {
                    values: {"": "All", "USW": "USW", "USS": "USS", "USC": "USC", "USE": "USE"}
                }
            },
            {
                title: "Changed Fields",
                field: "changedFieldsCount",
                width: 120,
                hozAlign: "center",
                formatter: function(cell) {
                    const value = cell.getValue();
                    if (value === 0) {
                        return `<span class="change-badge unchanged">No Changes</span>`;
                    }
                    return `<span class="change-badge changed">${value} Changes</span>`;
                }
            },
            {
                title: "Field Changes",
                field: "changedFields",
                width: 200,
                formatter: function(cell) {
                    const fields = cell.getValue() || [];
                    return fields.join(', ');
                }
            },
            {
                title: "GDOS Changes",
                field: "gdosChanges",
                width: 120,
                hozAlign: "center",
                formatter: function(cell) {
                    return cell.getValue() || 0;
                }
            },
            {
                title: "Zesty Changes",
                field: "zestyChanges",
                width: 120,
                hozAlign: "center",
                formatter: function(cell) {
                    return cell.getValue() || 0;
                }
            },
            {
                title: "KV Storage",
                field: "kvStorageStatus",
                width: 150,
                formatter: function(cell) {
                    const status = cell.getValue();
                    if (status === 'not-set') {
                        return '<span class="change-badge unchanged">Not Set</span>';
                    } else if (status === 'needs-update') {
                        return '<span class="change-badge changed">⚠️ Needs Update</span>';
                    } else if (status === 'up-to-date') {
                        return '<span class="change-badge unchanged">✓ Up to Date</span>';
                    }
                    return '';
                }
            },
            {
                title: "Recommendation",
                field: "recommendation",
                width: 250,
                formatter: function(cell) {
                    const rec = cell.getValue();
                    if (rec && rec.action === 'review') {
                        return `<strong>⚠️ Review:</strong> ${rec.message}`;
                    }
                    return '✅ No action needed';
                }
            },
            {
                title: "Actions",
                width: 150,
                hozAlign: "center",
                formatter: function(cell) {
                    const row = cell.getRow().getData();
                    if (row.changedFieldsCount > 0) {
                        return '<button class="btn btn-primary" style="padding: 6px 12px; margin: 0;">Review & Update</button>';
                    }
                    return '<button class="btn btn-secondary" disabled style="padding: 6px 12px; margin: 0;">View Details</button>';
                },
                cellClick: function(e, cell) {
                    const row = cell.getRow().getData();
                    if (row.changedFieldsCount > 0) {
                        openUpdateModal(row);
                    }
                }
            }
        ],
        initialSort: [
            {column: "changedFieldsCount", dir: "desc"}
        ]
    });
}

/**
 * Load all data versions
 */
async function loadAllVersions() {
    showLoading(true);
    try {
        await versionManager.loadAllVersions();
        updateStats();
        showAllRecords();
        showLoading(false);
        alert('✓ All data versions loaded successfully!');
    } catch (error) {
        showLoading(false);
        alert('Error loading data: ' + error.message);
        console.error(error);
    }
}

/**
 * Show only records with changes
 */
function showOnlyChanges() {
    if (!versionManager.versions['dec-2024'].gdos.USW) {
        alert('Please load data versions first');
        return;
    }
    
    showLoading(true);
    const changedRecords = versionManager.getAllChangedRecords();
    currentData = formatTableData(changedRecords);
    comparisonTable.setData(currentData);
    updateStats();
    showLoading(false);
}

/**
 * Show all records
 */
function showAllRecords() {
    if (!versionManager.versions['dec-2024'].gdos.USW) {
        alert('Please load data versions first');
        return;
    }
    
    showLoading(true);
    const decMaps = versionManager.createVersionMaps('dec-2024');
    const allComparisons = [];
    
    for (const gdosId of decMaps.gdosMap.keys()) {
        allComparisons.push(versionManager.compareRecordAcrossVersions(gdosId));
    }
    
    currentData = formatTableData(allComparisons);
    comparisonTable.setData(currentData);
    updateStats();
    showLoading(false);
}

/**
 * Format comparison data for table
 */
function formatTableData(comparisons) {
    return comparisons.map(comp => {
        const decGdos = comp.versions['dec-2024'].gdos;
        const changedFields = Object.entries(comp.fieldChanges)
            .filter(([_, change]) => change.needsUpdate)
            .map(([field, _]) => field);
        
        const gdosChanges = Object.values(comp.fieldChanges)
            .filter(change => change.gdosChanged).length;
        
        const zestyChanges = Object.values(comp.fieldChanges)
            .filter(change => change.zestyChanged).length;
        
        // Determine KV storage status
        let kvStorageStatus = 'not-set';
        const hasStoredValues = Object.entries(comp.fieldChanges).some(([field, _]) => {
            const kvValue = versionManager.getKVStorageValue(
                comp.gdosId, 
                field, 
                decGdos ? decGdos.territory : 'Unknown'
            );
            return kvValue.exists;
        });
        
        if (hasStoredValues) {
            // Check if any field needs updating
            const needsUpdate = Object.entries(comp.fieldChanges).some(([field, change]) => {
                if (!change.needsUpdate) return false;
                const kvValue = versionManager.getKVStorageValue(
                    comp.gdosId, 
                    field, 
                    decGdos ? decGdos.territory : 'Unknown'
                );
                return kvValue.exists; // Has stored value but field changed
            });
            kvStorageStatus = needsUpdate ? 'needs-update' : 'up-to-date';
        }
        
        return {
            gdosId: comp.gdosId,
            name: decGdos ? decGdos.name : 'Unknown',
            territory: decGdos ? decGdos.territory : 'Unknown',
            changedFieldsCount: changedFields.length,
            changedFields: changedFields,
            gdosChanges: gdosChanges,
            zestyChanges: zestyChanges,
            kvStorageStatus: kvStorageStatus,
            recommendation: comp.recommendation,
            _comparison: comp // Store full comparison for modal
        };
    });
}

/**
 * Apply filters to table
 */
function applyFilters() {
    if (!comparisonTable) return;
    
    const territory = document.getElementById('filterTerritory').value;
    const changeType = document.getElementById('filterChangeType').value;
    const searchId = document.getElementById('searchGdosId').value.toLowerCase();
    
    let filteredData = [...currentData];
    
    if (territory) {
        filteredData = filteredData.filter(row => row.territory === territory);
    }
    
    if (changeType === 'gdos-only') {
        filteredData = filteredData.filter(row => row.gdosChanges > 0 && row.zestyChanges === 0);
    } else if (changeType === 'zesty-only') {
        filteredData = filteredData.filter(row => row.zestyChanges > 0 && row.gdosChanges === 0);
    } else if (changeType === 'both') {
        filteredData = filteredData.filter(row => row.gdosChanges > 0 && row.zestyChanges > 0);
    }
    
    if (searchId) {
        filteredData = filteredData.filter(row => 
            row.gdosId.toLowerCase().includes(searchId) ||
            row.name.toLowerCase().includes(searchId)
        );
    }
    
    comparisonTable.setData(filteredData);
}

/**
 * Open update modal for a record
 */
function openUpdateModal(rowData) {
    const comparison = rowData._comparison;
    
    document.getElementById('modalGdosId').textContent = rowData.gdosId;
    document.getElementById('modalLocationName').textContent = rowData.name;
    
    const fieldSelector = document.getElementById('fieldSelector');
    fieldSelector.innerHTML = '<h3>Select fields to update:</h3>';
    
    Object.entries(comparison.fieldChanges).forEach(([field, change]) => {
        if (change.needsUpdate) {
            const octValue = change.values['oct-2024'].gdos || change.values['oct-2024'].zesty || '(empty)';
            const decValue = change.values['dec-2024'].gdos || change.values['dec-2024'].zesty || '(empty)';
            
            // Get KV storage value for this field
            const territory = comparison.versions['dec-2024'].gdos ? comparison.versions['dec-2024'].gdos.territory : 'Unknown';
            const kvValue = versionManager.getKVStorageValue(comparison.gdosId, field, territory);
            
            const checkbox = document.createElement('label');
            checkbox.className = 'field-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" value="${field}" data-field="${field}">
                <span class="field-name">${field}</span>
                <span class="field-change">
                    <strong>October:</strong> ${String(octValue).substring(0, 100)}${String(octValue).length > 100 ? '...' : ''}<br>
                    <strong>December:</strong> <span class="diff-highlight">${String(decValue).substring(0, 100)}${String(decValue).length > 100 ? '...' : ''}</span><br>
                    <strong>KV Storage:</strong> ${kvValue.exists ? 
                        `<span class="kv-storage-value">${kvValue.correct} = "${String(kvValue.value || '').substring(0, 100)}${String(kvValue.value || '').length > 100 ? '...' : ''}"</span>` : 
                        '<span class="kv-not-set">(not set)</span>'}
                </span>
            `;
            fieldSelector.appendChild(checkbox);
        }
    });
    
    // Store comparison data on modal for later use
    document.getElementById('updateModal').dataset.gdosId = rowData.gdosId;
    document.getElementById('updateModal').classList.add('active');
}

/**
 * Close update modal
 */
function closeUpdateModal() {
    document.getElementById('updateModal').classList.remove('active');
}

/**
 * Confirm and apply updates
 */
async function confirmUpdate() {
    const gdosId = document.getElementById('updateModal').dataset.gdosId;
    const checkboxes = document.querySelectorAll('#fieldSelector input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one field to update');
        return;
    }
    
    const fields = Array.from(checkboxes).map(cb => cb.value);
    
    if (!confirm(`Apply updates to ${fields.length} field(s) for GDOS ID ${gdosId}?\n\nFields: ${fields.join(', ')}`)) {
        return;
    }
    
    try {
        const updates = await versionManager.applySelectiveUpdate(gdosId, fields, 'dec-2024');
        
        alert(`✓ Successfully applied ${fields.length} update(s)!\n\nUpdates:\n${JSON.stringify(updates, null, 2)}`);
        
        // Update stats
        document.getElementById('statUpdatesApplied').textContent = versionManager.updateHistory.length;
        
        closeUpdateModal();
    } catch (error) {
        alert('Error applying updates: ' + error.message);
        console.error(error);
    }
}

/**
 * Export update history
 */
function exportHistory() {
    const history = versionManager.exportUpdateHistory();
    
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `update-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`✓ Exported ${history.totalUpdates} update record(s)`);
}

/**
 * Clear comparison cache
 */
function clearCache() {
    if (confirm('Clear the comparison cache? This will force re-calculation of all comparisons.')) {
        versionManager.comparisonCache.clear();
        alert('✓ Cache cleared');
    }
}

/**
 * Update statistics display
 */
function updateStats() {
    const stats = versionManager.getUpdateStats();
    
    document.getElementById('statTotalRecords').textContent = stats.totalRecordsInDec.toLocaleString();
    document.getElementById('statChangedRecords').textContent = stats.recordsWithChanges.toLocaleString();
    document.getElementById('statUpdatesApplied').textContent = stats.updatesApplied.toLocaleString();
    document.getElementById('statPendingReview').textContent = 
        (stats.recordsWithChanges - stats.updatesApplied).toLocaleString();
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loader = document.getElementById('statusLoading');
    if (show) {
        loader.classList.add('active');
    } else {
        loader.classList.remove('active');
    }
}
