# Quick Start Testing Guide

## What's New?
The Locations Comparison Dashboard now integrates two additional Zesty datasets:
- **Zesty Division Locations** (41 location records)
- **Zesty Service Area Locations** (357 location records)

## 1. Open Dashboard
Open `Locations-Comparison-Dashboard.html` in your web browser.

## 2. Check Browser Console
1. Press **F12** or right-click → **Inspect**
2. Go to **Console** tab
3. Look for these messages (they appear when data loads):
   ```
   Loaded 41 Zesty Division Locations
   Loaded 357 Zesty Service Area Locations
   ```
   ✅ If you see these messages, the CSV loading is working!

## 3. View New Statistics Cards
Scroll down to the **"Zesty Additional Datasets Coverage"** section.

You should see 4 new stat cards:

| Card | Shows |
|------|-------|
| 🗂️ Zesty Division Locations | How many GDOS locations appear in Division Locations CSV |
| 🗂️ Zesty Service Area Locations | How many GDOS locations appear in Service Area Locations CSV |
| ✓ In Either Dataset | How many locations are in at least one of the above |
| ✓✓ In Both Datasets | How many locations are in both datasets (usually 0) |

**Expected Results**:
- Division count: ~41 (or less, depends on GDOS ID matches)
- Service Area count: ~357 (or less)
- Either: Sum of above (minus overlap)
- Both: Usually 0 (datasets serve different purposes)
- All percentages shown as "% of GDOS Total"

## 4. Check Table for New Column
1. Scroll down to the data table
2. Scroll to the **rightmost column** → should see **"Zesty Datasets"**
3. Look at the badges displayed:
   - 🔵 **Division** (blue badge) = Location is in Division Locations CSV
   - ⚫ **Service Area** (gray badge) = Location is in Service Area Locations CSV
   - **-** (dash) = Location is in neither dataset
4. Some locations may show both badges if they appear in both CSVs

## 5. Test Filters (Optional)
All existing filters should work as before. Try:
1. Select **"View"** filter = "Zesty Only (Not in GDOS)"
2. Check the **"Zesty Datasets"** column
3. Verify locations show appropriate dataset badges
4. Try other view filters and confirm badges update correctly

## 6. Export Data (Optional)
1. Look for an **export button** in the table (if available)
2. Export the data
3. Open exported file and verify:
   - New columns are included
   - Dataset information preserved

## Troubleshooting

### ❌ CSV Load Messages Not Appearing
**Solution**:
1. Check that files exist in `gdos/` folder:
   - `Zesty Division Locations.csv`
   - `Zesty Service Area Locations.csv`
2. Check browser console for error messages
3. Verify CSV files are readable (not corrupted)

### ❌ "Zesty Datasets" Column Not Visible
**Solution**:
1. Scroll to the right in the table
2. Column is positioned as the last column
3. If still not visible, refresh the page

### ❌ Statistics Show 0 for All Datasets
**Possible Causes**:
1. CSV files didn't load (check console messages)
2. GDOS IDs in CSV files don't match GDOS data
3. The CSV parsing encountered an error

**Solution**:
1. Open browser console (F12)
2. Look for any error messages
3. Verify CSV files have proper `gdos_id` column

### ❌ Badges Not Displaying in Table
**Solution**:
1. Check that Bootstrap CSS is loaded (should be, from CDN)
2. Verify no console errors
3. Refresh page and try again

## What Data to Expect

### Coverage Percentages
If integration is working correctly, you should see:
- Division Locations: 0-5% of GDOS total (41 records max)
- Service Area Locations: 5-15% of GDOS total (357 records)
- Either: Combined total (likely 10-20%)
- Both: Usually 0-1% (very little overlap expected)

### Example Results
```
Total GDOS Locations: 15,000

Zesty Division Locations: 35 (0.23% of GDOS Total)
Zesty Service Area Locations: 320 (2.13% of GDOS Total)
In Either Dataset: 355 (2.37% of GDOS Total)
In Both Datasets: 0 (0.00% of GDOS Total)
```

## Key Features to Test

- [x] CSV files load successfully (check console)
- [x] Statistics cards display with correct counts
- [x] Table shows new "Zesty Datasets" column
- [x] Badges display correctly (Division/Service Area)
- [x] Percentages formatted consistently
- [x] Filters work with new data
- [x] No errors in browser console
- [x] Dashboard performs normally (no slowdown)

## Next Steps

Once verified:
1. ✅ Confirm all features working as expected
2. ✅ Share results with team
3. ✅ Deploy to production if approved
4. ✅ Monitor performance in live environment
5. ✅ Gather user feedback

## Support
If you encounter any issues:
1. Check console messages (F12 → Console)
2. Review `CODE-CHANGE-REFERENCE.md` for technical details
3. Check `INTEGRATION-SUMMARY.md` for overview
4. Verify CSV files exist and are properly formatted

---

**Last Updated**: 2024-02-08  
**Version**: 1.0 (Initial Release)
