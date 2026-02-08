# Code Change Reference Guide

## File: Locations-Comparison-Dashboard.js

### 1. Global Variable Declarations
**Location**: Lines 15-16
**What**: Added two new global variables for dataset mapping
```javascript
let zestyDivisionLocations = {};  // Key by GDOS_ID for Division Locations
let zestyServiceAreaLocations = {};  // Key by GDOS_ID for Service Area Locations
```

### 2. Initialization Function
**Location**: init() function, after `await loadDoNotImportList();`
**What**: Added two async loader calls to fetch CSV data
```javascript
await loadZestyDivisionLocations();
await loadZestyServiceAreaLocations();
```

### 3. CSV Loader Functions
**Location**: Lines ~258-363 (after loadDoNotImportList function)
**What**: Two new functions with identical structure and CSV parsing logic
- `loadZestyDivisionLocations()` - Loads Zesty Division Locations CSV
- `loadZestyServiceAreaLocations()` - Loads Zesty Service Area Locations CSV

**Key Implementation Details**:
- Fetch from `gdos/` folder
- Parse CSV with quote-aware parsing (handles quoted fields)
- Find `gdos_id` column by header index
- Iterate through data lines (skip empty lines)
- Create boolean map: `gdosId → true`
- Log success with count
- Non-blocking error handling (console.warn, no throw)

### 4. GDOS Item Comparison Data
**Location**: buildComparisonData() function, lines 429-431
**What**: Added two properties to GDOS items (checking against loaded maps)
```javascript
inZestyDivisionLocations: !!zestyDivisionLocations[gdosId],
inZestyServiceAreaLocations: !!zestyServiceAreaLocations[gdosId]
```

### 5. Zesty-Only Item Comparison Data
**Location**: buildComparisonData() function, lines 476-478
**What**: Added same two properties to Zesty-only items
```javascript
inZestyDivisionLocations: !!zestyDivisionLocations[gdosId],
inZestyServiceAreaLocations: !!zestyServiceAreaLocations[gdosId]
```

### 6. Table Column Definition
**Location**: Lines 672-686 (end of columns array)
**What**: New table column showing which Zesty datasets match
```javascript
{
  title: 'Zesty Datasets',
  field: 'zestyDatasets',
  width: 180,
  formatter: function(cell) {
    const row = cell.getRow().getData();
    const datasets = [];
    if (row.inZestyDivisionLocations) datasets.push('<span class="badge badge-info">Division</span>');
    if (row.inZestyServiceAreaLocations) datasets.push('<span class="badge badge-secondary">Service Area</span>');
    
    if (datasets.length === 0) {
      return '<span class="text-muted">-</span>';
    }
    return datasets.join(' ');
  }
}
```

### 7. Statistics Calculation Update
**Location**: updateStatistics() function, lines 938-960
**What**: Calculate and display statistics for new datasets
```javascript
// Count locations in each dataset
const inDivisionLocations = dataToCount.filter(item => item.inZestyDivisionLocations).length;
const inServiceAreaLocations = dataToCount.filter(item => item.inZestyServiceAreaLocations).length;
const inEitherDataset = dataToCount.filter(item => item.inZestyDivisionLocations || item.inZestyServiceAreaLocations).length;
const inBothDatasets = dataToCount.filter(item => item.inZestyDivisionLocations && item.inZestyServiceAreaLocations).length;

// Calculate percentages (% of GDOS Total)
const divisionPercent = totalGDOS > 0 ? Math.round((inDivisionLocations / totalGDOS) * 100) : 0;
const serviceAreaPercent = totalGDOS > 0 ? Math.round((inServiceAreaLocations / totalGDOS) * 100) : 0;
const eitherPercent = totalGDOS > 0 ? Math.round((inEitherDataset / totalGDOS) * 100) : 0;
const bothPercent = totalGDOS > 0 ? Math.round((inBothDatasets / totalGDOS) * 100) : 0;

// Update HTML elements
document.getElementById('zestyDivisionCount').textContent = inDivisionLocations;
document.getElementById('zestyDivisionPercent').textContent = `(${divisionPercent}% of GDOS Total)`;

document.getElementById('zestyServiceAreaCount').textContent = inServiceAreaLocations;
document.getElementById('zestyServiceAreaPercent').textContent = `(${serviceAreaPercent}% of GDOS Total)`;

document.getElementById('zestyEitherDatasetCount').textContent = inEitherDataset;
document.getElementById('zestyEitherDatasetPercent').textContent = `(${eitherPercent}% of GDOS Total)`;

document.getElementById('zestyBothDatasetsCount').textContent = inBothDatasets;
document.getElementById('zestyBothDatasetsPercent').textContent = `(${bothPercent}% of GDOS Total)`;
```

---

## File: Locations-Comparison-Dashboard.html

### 1. New Statistics Cards Section
**Location**: After "Do Not Import List Stats" row, lines 115-143
**What**: Added new section with 4 stat cards for Zesty datasets coverage
```html
<!-- Zesty Additional Datasets Coverage -->
<div class="row g-3 mt-2">
  <div class="col-md-3">
    <div class="stats-card total">
      <div class="stats-label">🗂️ Zesty Division Locations</div>
      <div class="stats-value" id="zestyDivisionCount">0</div>
      <div class="stats-sublabel" id="zestyDivisionPercent">0%</div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="stats-card total">
      <div class="stats-label">🗂️ Zesty Service Area Locations</div>
      <div class="stats-value" id="zestyServiceAreaCount">0</div>
      <div class="stats-sublabel" id="zestyServiceAreaPercent">0%</div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="stats-card total">
      <div class="stats-label">✓ In Either Dataset</div>
      <div class="stats-value" id="zestyEitherDatasetCount">0</div>
      <div class="stats-sublabel" id="zestyEitherDatasetPercent">0%</div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="stats-card success">
      <div class="stats-label">✓✓ In Both Datasets</div>
      <div class="stats-value" id="zestyBothDatasetsCount">0</div>
      <div class="stats-sublabel" id="zestyBothDatasetsPercent">0%</div>
    </div>
  </div>
</div>
```

**HTML Elements Added**:
- `zestyDivisionCount` - Display count
- `zestyDivisionPercent` - Display percentage
- `zestyServiceAreaCount` - Display count
- `zestyServiceAreaPercent` - Display percentage
- `zestyEitherDatasetCount` - Display count
- `zestyEitherDatasetPercent` - Display percentage
- `zestyBothDatasetsCount` - Display count
- `zestyBothDatasetsPercent` - Display percentage

---

## File: Locations-Comparison-Dashboard.css

**No changes required** - Uses existing CSS classes:
- `.stats-card` - Existing stat card styling
- `.badge-info` - Existing Bootstrap badge class (blue)
- `.badge-secondary` - Existing Bootstrap badge class (gray)
- `.text-muted` - Existing Bootstrap utility class

---

## Integration Flow Diagram

```
1. Page Load
   ↓
2. init() function called
   ↓
3. Load GDOS Data (4 regional JSONs)
   ↓
4. Load Zesty Data (LocationsData.json)
   ↓
5. Load Do-Not-Import List (CSV)
   ↓
6. Load Zesty Division Locations (CSV) ← NEW
   ↓
7. Load Zesty Service Area Locations (CSV) ← NEW
   ↓
8. buildComparisonData()
   - For each GDOS location:
     - Find matching Zesty item
     - Check if in Division Locations ← NEW
     - Check if in Service Area Locations ← NEW
     - Add to comparison array
   - For each Zesty-only location:
     - Check if in Division Locations ← NEW
     - Check if in Service Area Locations ← NEW
     - Add to comparison array
   ↓
9. initializeFilters()
   ↓
10. setupEventListeners()
   ↓
11. applyFilters() → filteredData
   ↓
12. updateStatistics() ← UPDATED to include new dataset stats
   ↓
13. initializeTable() ← UPDATED to include new "Zesty Datasets" column
   ↓
14. Dashboard Ready
```

---

## Testing Checklist

- [ ] Open browser console and verify CSV load messages:
  - "Loaded 41 Zesty Division Locations"
  - "Loaded 357 Zesty Service Area Locations" (or similar count)
- [ ] Check table for new "Zesty Datasets" column at right end
- [ ] Verify badge display in Zesty Datasets column:
  - Blue "Division" badge for division matches
  - Gray "Service Area" badge for service area matches
  - "-" for no matches
- [ ] Scroll right in statistics to see 4 new stat cards:
  - Division Locations count and percentage
  - Service Area Locations count and percentage
  - In Either Dataset count and percentage
  - In Both Datasets count and percentage
- [ ] Verify percentages display as "% of GDOS Total" (consistent format)
- [ ] Test filters still work correctly with new properties
- [ ] Export data and verify new columns included

---

## Rollback Instructions (if needed)

If reverting changes:
1. Remove lines 15-16 (global variables) in JS
2. Remove loader function calls in init()
3. Remove CSV loader functions (~260-365)
4. Remove 2 properties from GDOS items in buildComparisonData (lines 429-431)
5. Remove 2 properties from Zesty-only items in buildComparisonData (lines 476-478)
6. Remove table column (lines 672-686)
7. Remove statistics calculation section (lines 938-960)
8. Remove new stat card HTML (lines 115-143)

---

## Version Control Notes

- **Modified Date**: [Current Date]
- **Changes Type**: Feature Addition - New Dataset Integration
- **Affected Modules**: Data Loading, Comparison Logic, Table Display, Statistics
- **Backward Compatibility**: ✅ Fully backward compatible (existing features unchanged)
- **Breaking Changes**: ❌ None
