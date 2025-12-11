# Data Version Manager - User Guide

## Overview

The Data Version Manager is a comprehensive tool for safely comparing and managing updates between different versions of GDOS (Global Database of Services) and Zesty (LocationsData) data. It allows you to:

- **Compare** data between October 2024 and December 2024 versions
- **Identify** what has changed in GDOS vs Zesty data
- **Selectively update** KV (Key-Value) storage records
- **Track** all updates with a complete audit trail
- **Prevent data loss** by reviewing changes before applying them

## File Structure

```
gdos-comparison/
├── version-manager.js          # Core logic for version comparison
├── version-manager-ui.html     # Main UI interface
├── version-manager-ui.js       # UI controller and event handlers
├── GDOS-10-14-18-53-USW.json  # October GDOS data (West)
├── GDOS-10-14-18-10-USS.json  # October GDOS data (South)
├── GDOS-10-15-04-22-USC.json  # October GDOS data (Central)
├── GDOS-10-15-04-57-USE.json  # October GDOS data (East)
├── GDOS-12-10-18-11-USW.json  # December GDOS data (West)
├── GDOS-12-10-18-09-USS.json  # December GDOS data (South)
├── GDOS-12-10-18-14-USC.json  # December GDOS data (Central)
├── GDOS-12-10-18-16-USE.json  # December GDOS data (East)
├── LocationsData-10-28.json    # October Zesty data
└── LocationsData-12-10.json    # December Zesty data
```

## Getting Started

### Step 1: Open the Version Manager

1. Navigate to the `gdos-comparison` folder
2. Open `version-manager-ui.html` in your web browser
3. You'll see the main dashboard with statistics and controls

### Step 2: Load Data Versions

1. Click the **"🔄 Load All Data Versions"** button
2. Wait for all data files to load (this may take 10-30 seconds)
3. Once loaded, you'll see updated statistics:
   - Total Records (Dec)
   - Records with Changes
   - Updates Applied
   - Pending Review

### Step 3: Review Changes

#### Option A: View Only Changed Records
1. Click **"📋 Show Only Changed Records"** to filter to records that have differences
2. The table will display only locations with changes between October and December

#### Option B: View All Records
1. Click **"📄 Show All Records"** to see every location
2. Records with changes will be highlighted

### Step 4: Filter and Search

Use the filter controls to narrow down your view:

- **Territory Filter**: Filter by USW, USS, USC, or USE
- **Change Type Filter**:
  - GDOS Changed Only
  - Zesty Changed Only
  - Both Changed
- **Search Box**: Search by GDOS ID or location name

## Understanding the Table

### Columns Explained

| Column | Description |
|--------|-------------|
| **GDOS ID** | Unique identifier for the location |
| **Name** | Location name from December GDOS data |
| **Territory** | USW, USS, USC, or USE |
| **Changed Fields** | Visual badge showing how many fields changed |
| **Field Changes** | List of specific fields that changed |
| **GDOS Changes** | Number of fields where GDOS data changed |
| **Zesty Changes** | Number of fields where Zesty data changed |
| **Recommendation** | System recommendation for action |
| **Actions** | Button to review and update the record |

### Change Indicators

- 🟢 **No Changes**: Green badge indicates no differences between versions
- 🟡 **X Changes**: Yellow badge shows number of changed fields
- ⚠️ **Review**: Recommendation to review the record
- ✅ **No action needed**: Record is identical across versions

## Updating Records

### Safe Update Process

1. **Identify** a record with changes in the table
2. Click the **"Review & Update"** button for that record
3. A modal window will open showing:
   - GDOS ID and Location Name
   - All fields that have changed
   - October value vs December value side-by-side

4. **Select** which fields you want to update by checking the boxes
   - You can update individual fields, not forced to update all
   - Review the differences carefully before selecting

5. Click **"Apply Selected Updates"**
6. Confirm the update when prompted
7. The system will:
   - Apply the updates to KV storage
   - Record the change in the audit trail
   - Update statistics

### Example Update Workflow

```
Record: GDOS ID 8a808375559c116c0155c93d838a0388
Location: Salvation Army Corps Community Center

Changed Fields:
☑ phone
  October: 800-SA-TRUCK
  December: (978) 374-9561

☑ hours_of_operation
  October: (empty)
  December: Monday-Friday: 9AM-4PM

☐ address
  October: 395 Main Street
  December: 395 Main Street (no change, unchecked)
```

### What Gets Updated

When you apply an update:
- The selected field values are marked for update in KV storage
- An audit record is created with:
  - GDOS ID
  - Field names updated
  - Old values (October)
  - New values (December)
  - Timestamp
  - Update source (manual)

## Data Safety Features

### 1. No Automatic Updates
- Nothing is updated without your explicit approval
- You must review and select fields individually
- Confirmation dialog before any changes

### 2. Selective Field Updates
- Update only the fields you choose
- Keep existing data for fields you don't select
- No "all or nothing" forced updates

### 3. Version Comparison
- Side-by-side comparison of October vs December
- Clear highlighting of differences
- Normalized comparison (ignores minor formatting differences)

### 4. Audit Trail
- Every update is recorded
- Export update history at any time
- JSON format for easy archiving

### 5. Cache Management
- Comparison results are cached for performance
- Clear cache to force fresh comparisons
- No impact on source data files

## Advanced Features

### Export Update History

1. Click **"💾 Export Update History"**
2. A JSON file will download with all applied updates
3. File format:
```json
{
  "exported": "2024-12-10T18:30:00.000Z",
  "totalUpdates": 15,
  "history": [
    {
      "gdosId": "8a808375559c116c0155c93d838a0388",
      "fields": ["phone", "hours_of_operation"],
      "targetVersion": "dec-2024",
      "updates": {
        "phone": {
          "from": { "gdos": "800-SA-TRUCK", "zesty": "800-SA-TRUCK" },
          "to": { "gdos": "(978) 374-9561", "zesty": "(978) 374-9561" },
          "timestamp": "2024-12-10T18:25:00.000Z"
        }
      },
      "appliedAt": "2024-12-10T18:25:00.000Z",
      "appliedBy": "manual"
    }
  ]
}
```

### Clear Comparison Cache

- Click **"🗑️ Clear Comparison Cache"** to reset
- Useful if you've updated source files
- Forces fresh comparison calculations
- Does not affect applied updates or audit trail

## Fields Compared

The system compares these fields across versions:

1. **name** - Location name
2. **address** - Street address
3. **latitude** - GPS latitude
4. **longitude** - GPS longitude  
5. **zipcode** - Postal code
6. **phone** - Contact phone number
7. **siteTitle** - Web page title
8. **openHoursText** / **hours_of_operation** - Operating hours

## Best Practices

### Before Updating
1. ✅ Load all versions first
2. ✅ Review statistics to understand scope
3. ✅ Filter to specific territories if working on one area
4. ✅ Search for specific locations if you know what needs updating

### During Updates
1. ✅ Review each field change carefully
2. ✅ Don't update all fields if only some changed
3. ✅ Check if the December value is actually newer/better
4. ✅ Make notes about significant changes

### After Updates
1. ✅ Export update history for your records
2. ✅ Review statistics to see progress
3. ✅ Document any unusual patterns you notice

## Troubleshooting

### Issue: "No data loaded" message
**Solution**: Click "Load All Data Versions" button first

### Issue: Table shows 0 records
**Solution**: 
- Check that data files are in the same folder
- Check browser console for error messages
- Try clearing filters

### Issue: Update doesn't seem to apply
**Solution**: 
- Check that you selected at least one field
- Confirm the update in the dialog
- Check Export History to verify it was recorded

### Issue: Too many records to review
**Solution**:
- Use "Show Only Changed Records" filter
- Filter by territory
- Use Change Type filter (GDOS/Zesty/Both)
- Search for specific GDOS IDs

## Integration with Main Dashboard

### Current Workflow
1. Use Version Manager to identify and approve updates
2. Updates are recorded in audit trail
3. Separately, update KV storage using the main differences.js dashboard
4. Reference the exported update history as needed

### Future Enhancement
The version manager can be integrated directly with the Cloudflare KV storage system to apply updates automatically. Currently, it tracks what *should* be updated.

## Performance Notes

- **Loading Time**: Initial load takes 10-30 seconds depending on data size
- **Caching**: Comparisons are cached for faster subsequent access
- **Memory**: Keep browser tab active for large datasets
- **Filtering**: Filters are instant (client-side)

## Data Privacy

- All processing happens in your browser (client-side)
- No data is sent to external servers
- Update history is stored locally until exported
- Source JSON files are read-only

## Questions?

If you encounter issues or have questions about specific records:

1. Check the comparison details in the update modal
2. Review the exported update history
3. Check browser console for technical errors
4. Note the GDOS ID and field for reference

---

**Version Manager v1.0**  
Last Updated: December 10, 2024
