# Locations Comparison Dashboard

## Overview

The **Locations Comparison Dashboard** is an interactive tool designed to compare the **source of truth (GDOS)** with your **web presence (Zesty)**.

This dashboard provides real-time insights into:
- ✅ Locations that exist in both GDOS and Zesty (matched)
- ⚠️ Locations in Zesty that are **no longer in GDOS** (unpublished from source)
- ✨ **New locations in GDOS** that are not yet in Zesty
- 📊 A glance at how many centers are out of sync

## Features

### Summary Statistics
At a glance, see:
- **Total GDOS Locations**: Count of all locations in the source of truth
- **Total Zesty Locations**: Count of all locations on your website
- **Zesty Only**: Locations published in Zesty but no longer in GDOS
- **GDOS Only**: New locations in GDOS not yet on Zesty

### Advanced Filtering
Filter locations by:
- **View**: See all locations, only Zesty-only, only GDOS-only, or matched pairs
- **Division**: Filter by organizational division
- **Territory**: Filter by territory/region
- **State**: Filter by US state
- **City**: Search for specific cities (partial match)
- **Property Type**: Filter by location type (thrift store, corps, etc.)
- **Published**: Show published or unpublished locations

### Detailed Location Information
For each location, view:
- **Name** (from GDOS or Zesty)
- **Address** and **Zip Code**
- **City and State**
- **Division**
- **Phone Number**
- **Property Type**
- **Published Status** (GDOS and/or Zesty)
- **Location Match Status** (Matched, GDOS Only, or Zesty Only)

### Interactive Table
- **Sortable columns**: Click any column header to sort
- **Pagination**: Navigate through results with configurable page size
- **Responsive design**: Works on desktop, tablet, and mobile
- **Clear visual indicators**: Color-coded badges for easy identification

## Understanding the Data

### Status Indicators

#### ✓ Matched (Blue Badge)
The location exists in **both GDOS and Zesty**. This is the ideal state and indicates the location is properly synced.

#### GDOS Only (Green Badge)
The location exists in **GDOS (source of truth) but NOT in Zesty** (web presence). These are new locations that need to be added to the website.

**Action**: Review these locations and add them to Zesty as needed.

#### Zesty Only (Yellow Badge)
The location exists in **Zesty (web presence) but NOT in GDOS** (source of truth). These are locations that have been removed from the source but may still be visible on your website.

**Action**: Review these locations and consider removing them from Zesty if they are no longer active.

### Column Explanations

- **Published**: Shows which system(s) have the location published
  - `GDOS` badge: Published in source of truth
  - `Zesty` badge: Listed on website
  - No badges: Not published anywhere

- **Property Type**: The type of location (e.g., thrift store, corps, outpost, etc.)

- **City**: Shows comparison if different between systems

## How to Use

1. **Load the Dashboard**: Open the HTML file in your web browser
2. **Review Summary**: Check the statistics cards at the top
3. **Apply Filters**: Select desired filters and click "Apply Filters"
4. **Clear Filters**: Click "Clear Filters" to reset all selections
5. **Sort Data**: Click column headers to sort
6. **Review Details**: Use the detailed information to identify discrepancies

## Common Tasks

### Find all locations no longer in GDOS
1. Set **View** to "Zesty Only"
2. Click **Apply Filters**
3. Review the list of locations that need removal from web

### Find all new locations to add to Zesty
1. Set **View** to "GDOS Only"
2. Optionally filter by **Division** or **State**
3. Click **Apply Filters**
4. Review the list of new locations to add

### Check a specific state
1. Select a **State** from the dropdown
2. Click **Apply Filters**
3. See all locations in that state across both systems

### Find cities with discrepancies
1. Leave **View** as "All Locations"
2. Select your **Division**
3. Click **Apply Filters**
4. Look for rows where "City" shows different names between systems

## Technical Details

### Data Sources
- **GDOS Data**: Loaded from `gdos/GDOS-[Region]-020726.json`
  - USS (Southern Territory)
  - USC (Central Territory)
  - USE (Eastern Territory)
  - USW (Western Territory)

- **Zesty Data**: Loaded from `LocationsData.json`

### Matching Logic
Locations are matched using their **GDOS ID**. If a Zesty location has a `gdos_id` field that matches a GDOS location's ID, they are considered a pair.

### Performance
- The dashboard loads data asynchronously
- Table pagination handles large datasets efficiently
- Filtering is performed client-side for instant results

## Troubleshooting

### Data not loading
- Check browser console (F12) for error messages
- Verify that data files (JSON) are in the correct directories
- Ensure your browser allows CORS requests

### Filters not working
- Click "Apply Filters" button after making changes
- Check that at least one filter value is selected
- Clear filters and try again

### Table displaying slowly
- Try adjusting the pagination size to a smaller number
- Filter to a specific division or state
- Close other browser tabs to free up memory

## File Structure

```
Locations-Comparison-Dashboard.html  - Main dashboard page
Locations-Comparison-Dashboard.css   - Styling
Locations-Comparison-Dashboard.js    - Core functionality
gdos/GDOS-*.json                    - GDOS data files
LocationsData.json                  - Zesty data file
```

## Support

For issues or feature requests, please check:
1. Browser console for error messages
2. Data file paths and format
3. Network requests (F12 > Network tab)

---

**Last Updated**: February 8, 2026
**Version**: 1.0
