'use strict';

/**
 * Locations Comparison Dashboard
 * Compares GDOS (source of truth) with Zesty (web presence)
 */

(function() {
  window.LocationsComparisonDashboard = window.LocationsComparisonDashboard || {};

  // Data storage
  let gdosData = {};  // Key by ID
  let zestyData = {};  // Key by ID (includes all Zesty sources: LocationsData, Division, Service Area)
  let doNotImportData = {};  // Key by GDOS_ID
  let doNotImportReasons = {};  // Track reasons breakdown
  let zestySourceCounts = {  // Track which source each Zesty location came from
    locationData: 0,
    divisionLocations: 0,
    serviceAreaLocations: 0
  };
  let comparisonData = [];
  let filteredData = [];
  let tabulatorTable = null;

  // Current filter state
  let filters = {
    view: '',
    division: '',
    territory: '',
    state: '',
    city: '',
    propertyType: '',
    published: '',
    doNotImport: ''
  };

  // Initialize the dashboard
  async function init() {
    console.log('Initializing Locations Comparison Dashboard...');
    
    try {
      // Load data files
      await loadGDOSData();
      await loadZestyData();
      await loadDoNotImportList();
      await loadZestyDivisionData();
      await loadZestyServiceAreaData();
      
      // Build comparison data
      buildComparisonData();
      
      // Initialize UI elements
      initializeFilters();
      initializeTable();
      updateStatistics();
      
      // Setup event listeners
      setupEventListeners();
      
      // Set last updated time
      document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
      
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      showError('Failed to load dashboard: ' + error.message);
    }
  }

  /**
   * Load GDOS data from all regional JSON files
   */
  async function loadGDOSData() {
    console.log('Loading GDOS data...');
    
    const regions = ['USS', 'USC', 'USE', 'USW'];
    const baseUrl = 'gdos/GDOS-';
    const dateSuffix = '-020726.json';
    
    try {
      for (const region of regions) {
        const url = `${baseUrl}${region}${dateSuffix}`;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`Could not load ${url}`);
            continue;
          }
          
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.id) {
                // Add territory from filename
                item.gdosTerritory = region;
                gdosData[item.id] = item;
              }
            });
          }
        } catch (e) {
          console.warn(`Error loading ${url}:`, e);
        }
      }
      
      console.log(`Loaded ${Object.keys(gdosData).length} GDOS locations`);
    } catch (error) {
      console.error('Error loading GDOS data:', error);
      throw error;
    }
  }

  /**
   * Load Zesty data from LocationsData.json
   */
  async function loadZestyData() {
    console.log('Loading Zesty data...');
    
    try {
      const response = await fetch('LocationsData.json');
      if (!response.ok) {
        throw new Error('Failed to load LocationsData.json');
      }
      
      const wrapper = await response.json();
      const rawData = wrapper.data || wrapper;
      
      // The LocationsData format has flattened keys with dot notation
      if (Array.isArray(rawData)) {
        let count = 0;
        rawData.forEach(item => {
          // Extract values from flattened keys
          const gdosId = item['Column1.content.gdos_id'];
          const zid = item['Column1.content.zid'];
          const name = item['Column1.content.name'];
          const address = item['Column1.content.address'];
          const city = item['Column1.content.city'];
          const zipcode = item['Column1.content.zipcode'];
          const phone = item['Column1.content.contact_number'];
          const listed = item['Column1.content.listed'];
          const lastUpdated = item['Column1.content.last_updated'];
          const propertyType = item['Column1.content.property_type'];
          const stateName = item['Column1.content.state.data.name'] || item['Column1.content.state'];
          const stateZuid = item['Column1.content.state.data.zuid'];
          const territoryName = item['Column1.content.territory.data.name'] || item['Column1.content.territory'];
          const territoryZuid = item['Column1.content.territory.data.zuid'];
          const divisionName = item['Column1.content.division.data.name'] || item['Column1.content.division'];
          const divisionZuid = item['Column1.content.division.data.zuid'];
          
          if (gdosId) {
            zestyData[gdosId] = {
              _zesty_id: zid,
              _zesty_name: name,
              _zesty_gdos_id: gdosId,
              _zesty_listed: listed === 1 || listed === '1' || listed === true,
              _zesty_last_updated: lastUpdated,
              address: address,
              city: city,
              zipcode: zipcode,
              contact_number: phone,
              property_type: propertyType,
              state: { data: { name: stateName, zuid: stateZuid } },
              territory: { data: { name: territoryName, zuid: territoryZuid } },
              division: { data: { name: divisionName, zuid: divisionZuid } },
              _source: 'LocationsData'
            };
            count++;
          } else if (zid) {
            // Store by zid if no gdosId, so we can still match Zesty-only records
            zestyData[zid] = {
              _zesty_id: zid,
              _zesty_name: name,
              _zesty_gdos_id: gdosId,
              _zesty_listed: listed === 1 || listed === '1' || listed === true,
              _zesty_last_updated: lastUpdated,
              address: address,
              city: city,
              zipcode: zipcode,
              contact_number: phone,
              property_type: propertyType,
              state: { data: { name: stateName, zuid: stateZuid } },
              territory: { data: { name: territoryName, zuid: territoryZuid } },
              division: { data: { name: divisionName, zuid: divisionZuid } },
              _source: 'LocationsData'
            };
            count++;
          }
        });
        zestySourceCounts.locationData = count;
      }
      
      console.log(`Loaded ${Object.keys(zestyData).length} Zesty locations`);
    } catch (error) {
      console.error('Error loading Zesty data:', error);
      throw error;
    }
  }

  /**
   * Load do-not-import list and create lookup by GDOS_ID
   */
  async function loadDoNotImportList() {
    console.log('Loading do-not-import list...');
    
    try {
      const response = await fetch('gdos/GDOS_Do Not Import List February 2 2026.csv');
      if (!response.ok) {
        console.warn('Could not load do-not-import list');
        return;
      }
      
      const csv = await response.text();
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Find column indices
      const gdosIdIndex = headers.indexOf('GDOS_ID');
      const reasonIndex = headers.indexOf('Reason');
      
      if (gdosIdIndex === -1) {
        console.error('GDOS_ID column not found in do-not-import list');
        return;
      }
      
      // Process each line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing (handles basic cases)
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        
        // Get GDOS ID and reason
        const gdosId = values[gdosIdIndex];
        const reason = reasonIndex >= 0 ? values[reasonIndex] : 'Unknown';
        
        if (gdosId) {
          doNotImportData[gdosId] = reason;
          
          // Track reason breakdown
          if (!doNotImportReasons[reason]) {
            doNotImportReasons[reason] = 0;
          }
          doNotImportReasons[reason]++;
        }
      }
      
      console.log(`Loaded ${Object.keys(doNotImportData).length} do-not-import entries`);
      console.log('Do-not-import reasons:', doNotImportReasons);
    } catch (error) {
      console.error('Error loading do-not-import list:', error);
      // Don't throw - allow dashboard to work without this list
    }
  }

  /**
   * Load Zesty Division Locations CSV and merge into zestyData
   */
  async function loadZestyDivisionData() {
    try {
      const response = await fetch('gdos/Zesty Division Locations.csv');
      if (!response.ok) {
        console.warn('Could not load Zesty Division Locations');
        return;
      }
      
      const csv = await response.text();
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const gdosIdIndex = headers.indexOf('gdos_id');
      const nameIndex = headers.indexOf('name');
      const cityIndex = headers.indexOf('city');
      const stateIndex = headers.indexOf('state');
      const addressIndex = headers.indexOf('address');
      const zipcodeIndex = headers.indexOf('zipcode');
      const contactIndex = headers.indexOf('contact_number');
      const divisionIndex = headers.indexOf('division_code');
      
      if (gdosIdIndex === -1) {
        console.warn('gdos_id column not found in Zesty Division Locations');
        return;
      }
      
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        
        const gdosId = values[gdosIdIndex]?.trim();
        if (gdosId && !zestyData[gdosId]) {
          zestyData[gdosId] = {
            zestyGdosId: gdosId,
            _zesty_name: values[nameIndex]?.trim() || '',
            city: values[cityIndex]?.trim() || '',
            state: { data: { name: values[stateIndex]?.trim() || '' } },
            address: values[addressIndex]?.trim() || '',
            zipcode: values[zipcodeIndex]?.trim() || '',
            contact_number: values[contactIndex]?.trim() || '',
            division: { data: { name: values[divisionIndex]?.trim() || '' } },
            _zesty_listed: true,
            _source: 'Division Locations'
          };
          count++;
        }
      }
      zestySourceCounts.divisionLocations = count;
      console.log(`Loaded ${count} Zesty Division Locations`);
    } catch (error) {
      console.warn('Error loading Zesty Division Locations:', error);
    }
  }

  /**
   * Load Zesty Service Area Locations CSV and merge into zestyData
   */
  async function loadZestyServiceAreaData() {
    try {
      const response = await fetch('gdos/Zesty Service Area Locations.csv');
      if (!response.ok) {
        console.warn('Could not load Zesty Service Area Locations');
        return;
      }
      
      const csv = await response.text();
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const gdosIdIndex = headers.indexOf('gdos_id');
      const nameIndex = headers.indexOf('name');
      const cityIndex = headers.indexOf('county');
      const stateIndex = headers.indexOf('state');
      const contactIndex = headers.indexOf('contact_number');
      
      if (gdosIdIndex === -1) {
        console.warn('gdos_id column not found in Zesty Service Area Locations');
        return;
      }
      
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        
        const gdosId = values[gdosIdIndex]?.trim();
        if (gdosId && !zestyData[gdosId]) {
          zestyData[gdosId] = {
            zestyGdosId: gdosId,
            _zesty_name: values[nameIndex]?.trim() || '',
            city: values[cityIndex]?.trim() || '',
            state: { data: { name: values[stateIndex]?.trim() || '' } },
            contact_number: values[contactIndex]?.trim() || '',
            _zesty_listed: true,
            _source: 'Service Area Locations'
          };
          count++;
        }
      }
      zestySourceCounts.serviceAreaLocations = count;
      console.log(`Loaded ${count} Zesty Service Area Locations`);
    } catch (error) {
      console.warn('Error loading Zesty Service Area Locations:', error);
    }
  }

  /**
   * Build comparison data array
   */
  function buildComparisonData() {
    console.log('Building comparison data...');
    comparisonData = [];
    
    const processedIds = new Set();
    
    // Process GDOS items
    Object.entries(gdosData).forEach(([gdosId, gdosItem]) => {
      processedIds.add(gdosId);
      
      const zestyItem = zestyData[gdosId];
      const comparison = {
        gdosId: gdosId,
        zestyGdosId: zestyItem?._zesty_gdos_id || null,
        gdosName: gdosItem.name || 'Unknown',
        gdosCity: gdosItem.city || '',
        gdosState: gdosItem.state?.shortCode || '',
        gdosStateName: gdosItem.state?.name || '',
        gdosTerritory: gdosItem.gdosTerritory || '', // Territory extracted from filename during load
        gdosDivision: gdosItem.location?.division?.name || '',
        gdosPublished: gdosItem.published !== false,
        gdosAddress: gdosItem.address1 || '',
        gdosZip: gdosItem.displayZip || gdosItem.zip?.zipcode || '',
        gdosPhone: gdosItem.phoneNumber || '',
        gdosEmail: gdosItem.email?.address || '',
        gdosPropertyType: gdosItem.wm4SiteType?.name || 'Location',
        gdosServices: (gdosItem.services || []).map(s => s.name).join('; '),
        
        zestyId: zestyItem?._zesty_id || null,
        zestyName: zestyItem?._zesty_name || '',
        zestyCity: zestyItem?.city || '',
        zestyState: zestyItem?.state?.data?.name || '', // Extract state name from nested object
        zestyTerritory: zestyItem?.territory?.data?.name || '',
        zestyDivision: zestyItem?.division?.data?.name || '',
        zestyListed: zestyItem?._zesty_listed || false,
        zestyAddress: zestyItem?.address || '',
        zestyZip: zestyItem?.zipcode || '',
        zestyPhone: zestyItem?.contact_number || '',
        zestyPropertyType: zestyItem?.property_type || '',
        
        status: zestyItem ? 'matched' : 'gdos_only',
        matchType: zestyItem ? 'GDOS & Zesty' : 'GDOS Only',
        
        onDoNotImportList: !!doNotImportData[gdosId],
        doNotImportReason: doNotImportData[gdosId] || ''
      };
      
      comparisonData.push(comparison);
    });
    
    // Process Zesty-only items
    Object.entries(zestyData).forEach(([gdosId, zestyItem]) => {
      if (!processedIds.has(gdosId)) {
        processedIds.add(gdosId);
        
        const comparison = {
          gdosId: null,
          zestyGdosId: zestyItem._zesty_gdos_id || null,
          gdosName: '',
          gdosCity: '',
          gdosState: '',
          gdosStateName: '',
          gdosTerritory: '',
          gdosDivision: '',
          gdosPublished: false,
          gdosAddress: '',
          gdosZip: '',
          gdosPhone: '',
          gdosEmail: '',
          gdosPropertyType: '',
          gdosServices: '',
          
          zestyId: zestyItem._zesty_id || gdosId,
          zestyName: zestyItem._zesty_name || '',
          zestyCity: zestyItem.city || '',
          zestyState: zestyItem.state?.data?.name || '',
          zestyTerritory: zestyItem.territory?.data?.name || '',
          zestyDivision: zestyItem.division?.data?.name || '',
          zestyListed: zestyItem._zesty_listed || false,
          zestyAddress: zestyItem.address || '',
          zestyZip: zestyItem.zipcode || '',
          zestyPhone: zestyItem.contact_number || '',
          zestyPropertyType: zestyItem.property_type || '',
          
          status: 'zesty_only',
          matchType: 'Zesty Only',
          
          onDoNotImportList: !!doNotImportData[gdosId],
          doNotImportReason: doNotImportData[gdosId] || ''
        };
        
        comparisonData.push(comparison);
      }
    });
    
    console.log(`Built comparison data with ${comparisonData.length} total locations`);
  }

  /**
   * Initialize filter dropdowns with available values
   */
  function initializeFilters() {
    console.log('Initializing filters...');
    
    const divisions = new Set();
    const territories = new Set();
    const states = new Set();
    const propertyTypes = new Set();
    
    comparisonData.forEach(item => {
      if (item.gdosDivision) divisions.add(item.gdosDivision);
      if (item.zestyDivision) divisions.add(item.zestyDivision);
      
      if (item.gdosTerritory) territories.add(item.gdosTerritory);
      if (item.zestyTerritory) territories.add(item.zestyTerritory);
      
      // Use state code from GDOS, name from Zesty
      if (item.gdosState) states.add(item.gdosState);
      if (item.zestyState) states.add(item.zestyState);
      
      if (item.gdosPropertyType) propertyTypes.add(item.gdosPropertyType);
      if (item.zestyPropertyType) propertyTypes.add(item.zestyPropertyType);
    });
    
    // Populate dropdowns
    populateSelect('filterDivision', Array.from(divisions).sort());
    populateSelect('filterTerritory', Array.from(territories).sort());
    populateSelect('filterState', Array.from(states).sort());
    populateSelect('filterPropertyType', Array.from(propertyTypes).sort());
  }

  /**
   * Populate a select element with options
   */
  function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(option => {
      if (option) {
        const optElement = document.createElement('option');
        optElement.value = option;
        optElement.textContent = option;
        select.appendChild(optElement);
      }
    });
  }

  /**
   * Initialize Tabulator table
   */
  function initializeTable() {
    console.log('Initializing table...');
    
    const columns = [
      {
        title: 'Status',
        field: 'status',
        width: 140,
        formatter: function(cell) {
          const status = cell.getValue();
          if (status === 'matched') {
            return '<span class="badge badge-matched">✓ Matched</span>';
          } else if (status === 'gdos_only') {
            return '<span class="badge badge-gdos-only">GDOS Only</span>';
          } else {
            return '<span class="badge badge-zesty-only">Zesty Only</span>';
          }
        }
      },
      {
        title: 'GDOS ID',
        field: 'gdosId',
        width: 180,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          const gdosId = row.gdosId || row.zestyGdosId;
          const source = row.gdosId ? '' : ' (Zesty)';
          return gdosId ? `<code style="font-size: 0.85rem; color: #666;">${gdosId}</code><small style="display: block; font-size: 0.7rem; color: #999;">${source}</small>` : '-';
        }
      },
      {
        title: 'Do-Not-Import',
        field: 'onDoNotImportList',
        width: 160,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          if (row.onDoNotImportList) {
            return `<span class="badge badge-danger" title="${row.doNotImportReason}">🚫 ${row.doNotImportReason}</span>`;
          } else {
            return '<span class="badge badge-success">✓ OK</span>';
          }
        }
      },
      {
        title: 'Location Name',
        field: 'gdosName',
        width: 280,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          if (row.gdosName) {
            return `<strong>${row.gdosName}</strong>`;
          } else if (row.zestyName) {
            return `<strong>${row.zestyName}</strong>`;
          }
          return '-';
        }
      },
      {
        title: 'City',
        field: 'gdosCity',
        width: 140,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosCity || '-';
        }
      },
      {
        title: 'State',
        field: 'gdosState',
        width: 120,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosState || row.zestyState || '-';
        }
      },
      {
        title: 'Division',
        field: 'gdosDivision',
        width: 220,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosDivision || row.zestyDivision || '-';
        }
      },
      {
        title: 'Published',
        field: 'gdosPublished',
        width: 140,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          const gdosStatus = row.gdosPublished ? '<span class="badge badge-published">GDOS</span>' : '';
          const zestyStatus = row.zestyListed ? '<span class="badge badge-published">Zesty</span>' : '';
          const statuses = [gdosStatus, zestyStatus].filter(s => s).join(' ');
          return statuses || '<span class="badge badge-unpublished">None</span>';
        }
      },
      {
        title: 'Property Type',
        field: 'gdosPropertyType',
        width: 150,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosPropertyType || row.zestyPropertyType || '-';
        }
      },
      {
        title: 'Address',
        field: 'gdosAddress',
        width: 280,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosAddress || row.zestyAddress || '-';
        }
      },
      {
        title: 'Zip',
        field: 'gdosZip',
        width: 100,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosZip || row.zestyZip || '-';
        }
      },
      {
        title: 'Phone',
        field: 'gdosPhone',
        width: 150,
        formatter: function(cell) {
          const row = cell.getRow().getData();
          return row.gdosPhone || row.zestyPhone || '-';
        }
      }
    ];
    
    const tableElement = document.getElementById('locationsTable');
    
    tabulatorTable = new Tabulator(tableElement, {
      data: comparisonData,
      columns: columns,
      layout: 'fitDataStretch',
      responsive: true,
      pagination: 'local',
      paginationSize: 25,
      paginationSizeSelector: [20, 25, 50, 100, 200, 500],
      sort: [{ column: 'status', dir: 'asc' }],
      movableColumns: true,
      downloadReady: function() {
        return true;
      },
      downloadDataFormatter: function(data) {
        return data;
      }
    });
  }

  /**
   * Setup event listeners for filters
   */
  function setupEventListeners() {
    // Auto-apply filters on any filter change
    document.getElementById('filterView').addEventListener('change', applyFilters);
    document.getElementById('filterDivision').addEventListener('change', applyFilters);
    document.getElementById('filterTerritory').addEventListener('change', applyFilters);
    document.getElementById('filterState').addEventListener('change', applyFilters);
    document.getElementById('filterCity').addEventListener('keyup', debounce(applyFilters, 300));
    document.getElementById('filterPropertyType').addEventListener('change', applyFilters);
    document.getElementById('filterPublished').addEventListener('change', applyFilters);
    document.getElementById('filterDoNotImport').addEventListener('change', applyFilters);
    
    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);
  }

  /**
   * Debounce function for city search
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Apply filters to table
   */
  function applyFilters() {
    console.log('Applying filters...');
    
    // Get filter values
    filters.view = document.getElementById('filterView').value;
    filters.division = document.getElementById('filterDivision').value;
    filters.territory = document.getElementById('filterTerritory').value;
    filters.state = document.getElementById('filterState').value;
    filters.city = document.getElementById('filterCity').value.toLowerCase();
    filters.propertyType = document.getElementById('filterPropertyType').value;
    filters.published = document.getElementById('filterPublished').value;
    filters.doNotImport = document.getElementById('filterDoNotImport').value;
    
    // Filter data
    filteredData = comparisonData.filter(item => {
      // View filter
      if (filters.view === 'zesty_only' && item.status !== 'zesty_only') return false;
      if (filters.view === 'gdos_only' && item.status !== 'gdos_only') return false;
      if (filters.view === 'gdos_only_not_dnc') {
        if (item.status !== 'gdos_only') return false;
        if (item.onDoNotImportList) return false;
      }
      if (filters.view === 'matched' && item.status !== 'matched') return false;
      
      // Division filter
      if (filters.division) {
        const division = item.gdosDivision || item.zestyDivision || '';
        if (division !== filters.division) return false;
      }
      
      // Territory filter
      if (filters.territory) {
        const territory = item.gdosTerritory || item.zestyTerritory || '';
        if (territory !== filters.territory) return false;
      }
      
      // State filter
      if (filters.state) {
        const state = item.gdosState || item.zestyState || '';
        if (state !== filters.state) return false;
      }
      
      // City filter
      if (filters.city) {
        const city = ((item.gdosCity || '') + ' ' + (item.zestyCity || '')).toLowerCase();
        if (!city.includes(filters.city)) return false;
      }
      
      // Property Type filter
      if (filters.propertyType) {
        const propType = item.gdosPropertyType || item.zestyPropertyType || '';
        if (propType !== filters.propertyType) return false;
      }
      
      // Published filter
      if (filters.published) {
        const isPublished = filters.published === 'true';
        if (isPublished && !item.gdosPublished && !item.zestyListed) return false;
        if (!isPublished && (item.gdosPublished || item.zestyListed)) return false;
      }
      
      // Do-Not-Import filter
      if (filters.doNotImport === 'on_list' && !item.onDoNotImportList) return false;
      if (filters.doNotImport === 'not_on_list' && item.onDoNotImportList) return false;
      
      return true;
    });
    
    // Update table
    tabulatorTable.setData(filteredData);
    updateStatistics();
    
    // Update table title
    updateTableTitle();
    
    console.log(`Filtered to ${filteredData.length} locations`);
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    document.getElementById('filterView').value = '';
    document.getElementById('filterDivision').value = '';
    document.getElementById('filterTerritory').value = '';
    document.getElementById('filterState').value = '';
    document.getElementById('filterCity').value = '';
    document.getElementById('filterPropertyType').value = '';
    document.getElementById('filterPublished').value = '';
    
    filters = {
      view: '',
      division: '',
      territory: '',
      state: '',
      city: '',
      propertyType: '',
      published: ''
    };
    
    filteredData = comparisonData;
    tabulatorTable.setData(filteredData);
    updateStatistics();
    updateTableTitle();
    
    console.log('Filters cleared');
  }

  /**
   * Update statistics cards
   */
  function updateStatistics() {
    const dataToCount = filteredData.length > 0 ? filteredData : comparisonData;
    
    const totalGDOS = dataToCount.filter(item => item.gdosId).length;
    const totalZesty = dataToCount.filter(item => item.zestyId).length;
    const zestyOnlyCount = dataToCount.filter(item => item.status === 'zesty_only').length;
    const gdosOnlyCount = dataToCount.filter(item => item.status === 'gdos_only').length;
    
    document.getElementById('totalGDOS').textContent = totalGDOS;
    
    // Zesty total as % of GDOS
    const totalZestyPercent = totalGDOS > 0 ? Math.round((totalZesty / totalGDOS) * 100) : 0;
    document.getElementById('totalZesty').textContent = totalZesty;
    document.getElementById('totalZestyPercent').textContent = `(${totalZestyPercent}% of GDOS Total)`;
    
    // Zesty Only as % of GDOS
    const zestyOnlyPercent = totalGDOS > 0 ? Math.round((zestyOnlyCount / totalGDOS) * 100) : 0;
    document.getElementById('zestyOnly').textContent = zestyOnlyCount;
    document.getElementById('zestyOnlyPercent').textContent = `(${zestyOnlyPercent}% of GDOS Total)`;
    
    // GDOS Only as % of GDOS
    const gdosOnlyPercent = totalGDOS > 0 ? Math.round((gdosOnlyCount / totalGDOS) * 100) : 0;
    document.getElementById('gdosOnly').textContent = gdosOnlyCount;
    document.getElementById('gdosOnlyPercent').textContent = `(${gdosOnlyPercent}% of GDOS Total)`;
    
    // Calculate do-not-import statistics for GDOS
    const gdosOnDoNotImportCount = dataToCount.filter(item => item.gdosId && item.onDoNotImportList).length;
    const gdosDoNotImportPercent = totalGDOS > 0 ? Math.round((gdosOnDoNotImportCount / totalGDOS) * 100) : 0;
    
    document.getElementById('gdosOnDoNotImport').innerHTML = `
      <div class="stat-number">${gdosOnDoNotImportCount}</div>
      <div class="stat-sublabel">(${gdosDoNotImportPercent}% of GDOS Total)</div>
    `;
    
    // Calculate do-not-import statistics for Zesty as % of GDOS Total
    const zestyOnDoNotImportCount = dataToCount.filter(item => item.zestyId && item.onDoNotImportList).length;
    const zestyOnDoNotImportPercent = totalGDOS > 0 ? Math.round((zestyOnDoNotImportCount / totalGDOS) * 100) : 0;
    
    document.getElementById('zestyOnDoNotImport').textContent = zestyOnDoNotImportCount;
    document.getElementById('zestyOnDoNotImportPercent').textContent = `(${zestyOnDoNotImportPercent}% of GDOS Total)`;
    
    // Calculate unpublished GDOS locations (all GDOS centers where published = false)
    const gdosUnpublishedCount = dataToCount.filter(item => item.gdosId && item.gdosPublished === false).length;
    const gdosUnpublishedPercent = totalGDOS > 0 ? Math.round((gdosUnpublishedCount / totalGDOS) * 100) : 0;
    document.getElementById('gdosUnpublished').textContent = gdosUnpublishedCount;
    document.getElementById('gdosUnpublishedPercent').textContent = `(${gdosUnpublishedPercent}% of GDOS Total)`;
    
    // Build do-not-import breakdown by reason with both GDOS and Zesty counts
    let breakdownHtml = '';
    
    // Get all unique reasons and track both GDOS and Zesty counts
    const reasonBreakdown = {};
    dataToCount.forEach(item => {
      if (item.onDoNotImportList && item.doNotImportReason) {
        if (!reasonBreakdown[item.doNotImportReason]) {
          reasonBreakdown[item.doNotImportReason] = { gdos: 0, zesty: 0, total: 0 };
        }
        if (item.gdosId) {
          reasonBreakdown[item.doNotImportReason].gdos++;
        }
        if (item.zestyId) {
          reasonBreakdown[item.doNotImportReason].zesty++;
        }
        reasonBreakdown[item.doNotImportReason].total++;
      }
    });
    
    const totalOnDoNotImportList = dataToCount.filter(item => item.onDoNotImportList).length;
    
    if (totalOnDoNotImportList > 0) {
      // Add header row
      breakdownHtml += `
        <div class="do-not-import-item do-not-import-header">
          <span class="do-not-import-reason">Reason</span>
          <div class="do-not-import-counts">
            <div class="do-not-import-count">
              <span class="do-not-import-count-value">GDOS</span>
            </div>
            <div class="do-not-import-count">
              <span class="do-not-import-count-value">Zesty</span>
            </div>
          </div>
        </div>
      `;
      
      // Sort by total count descending
      const sortedReasons = Object.entries(reasonBreakdown)
        .sort((a, b) => b[1].total - a[1].total);
      
      sortedReasons.forEach(([reason, counts]) => {
        breakdownHtml += `
          <div class="do-not-import-item">
            <span class="do-not-import-reason">${reason}</span>
            <div class="do-not-import-counts">
              <div class="do-not-import-count">
                <span class="do-not-import-count-value">${counts.gdos}</span>
              </div>
              <div class="do-not-import-count">
                <span class="do-not-import-count-value">${counts.zesty}</span>
              </div>
            </div>
          </div>
        `;
      });
    } else {
      breakdownHtml = '<div style="text-align: center; color: #6c757d; padding: 10px;">No locations on do-not-import list</div>';
    }
    
    document.getElementById('doNotImportBreakdown').innerHTML = breakdownHtml;
    
    // Update Zesty breakdown to show sources
    const zestyBreakdownText = `LocationsData: ${zestySourceCounts.locationData} | Division: ${zestySourceCounts.divisionLocations} | Service Area: ${zestySourceCounts.serviceAreaLocations}`;
    const zestyBreakdownElement = document.getElementById('zestyBreakdown');
    if (zestyBreakdownElement) {
      zestyBreakdownElement.textContent = zestyBreakdownText;
    }

    // Update GDOS breakdown to show territories
    const gdosTerritories = {};
    dataToCount.forEach(item => {
      if (item.gdosId && item.gdosTerritory) {
        gdosTerritories[item.gdosTerritory] = (gdosTerritories[item.gdosTerritory] || 0) + 1;
      }
    });
    
    const gdosBreakdownText = Object.entries(gdosTerritories)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([territory, count]) => `${territory}: ${count}`)
      .join(' | ');
    
    const gdosBreakdownElement = document.getElementById('gdosBreakdown');
    if (gdosBreakdownElement) {
      gdosBreakdownElement.textContent = gdosBreakdownText || 'No territories';
    }

    // Calculate property type counts from filtered data
    updatePropertyTypeCounts(dataToCount);
  }

  /**
   * Update property type counts
   */
  function updatePropertyTypeCounts(dataToCount) {
    const propertyTypeCounts = {};
    const totalLocations = dataToCount.length;

    // Count each property type
    dataToCount.forEach(item => {
      const propType = item.gdosPropertyType || item.zestyPropertyType || 'Unknown';
      if (!propertyTypeCounts[propType]) {
        propertyTypeCounts[propType] = 0;
      }
      propertyTypeCounts[propType]++;
    });

    // Sort by count descending
    const sortedTypes = Object.entries(propertyTypeCounts)
      .sort((a, b) => b[1] - a[1]);

    // Build HTML
    let html = '<div class="property-type-counts">';
    
    sortedTypes.forEach(([propType, count]) => {
      const percent = totalLocations > 0 ? Math.round((count / totalLocations) * 100) : 0;
      html += `
        <div class="property-type-card">
          <div class="property-type-name">${propType}</div>
          <div class="property-type-count">${count}</div>
          <div class="property-type-percent">${percent}%</div>
        </div>
      `;
    });

    html += '</div>';

    const container = document.getElementById('propertyTypeCounts');
    if (container) {
      container.innerHTML = html;
    }
  }

  /**
   * Update table title based on filters
   */
  function updateTableTitle() {
    let title = 'All Locations';
    
    if (filters.view === 'zesty_only') {
      title = 'Zesty Only Locations (Not in GDOS)';
    } else if (filters.view === 'gdos_only') {
      title = 'GDOS Only Locations (Not in Zesty)';
    } else if (filters.view === 'gdos_only_not_dnc') {
      title = 'GDOS Only Locations (Not on Do-Not-Import List)';
    } else if (filters.view === 'matched') {
      title = 'Matched Locations (In Both Systems)';
    }
    
    // Add filter details
    let details = [];
    if (filters.division) details.push(`Division: ${filters.division}`);
    if (filters.territory) details.push(`Territory: ${filters.territory}`);
    if (filters.state) details.push(`State: ${filters.state}`);
    if (filters.city) details.push(`City: ${filters.city}`);
    if (filters.propertyType) details.push(`Type: ${filters.propertyType}`);
    
    if (details.length > 0) {
      title += ` - ${details.join(', ')}`;
    }
    
    document.getElementById('tableTitle').textContent = title;
  }

  /**
   * Show error message
   */
  function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.role = 'alert';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alert, container.firstChild);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
