# Locations Comparison Dashboard - Quick Start Guide

## 🚀 Getting Started in 30 Seconds

### Step 1: Open the Dashboard
Navigate to your project folder and open this file in your web browser:
```
Locations-Comparison-Dashboard.html
```

### Step 2: Wait for Data to Load
You'll see:
- ✅ Summary statistics cards at the top
- 📋 A detailed table with all locations
- 🔍 Filter options to narrow results

**Data loads automatically** - no configuration needed!

---

## 📊 Understanding What You See

### The Four Summary Cards

**Left to Right:**

1. **Total GDOS Locations** (Red)
   - Count of all locations in your source of truth

2. **Total Zesty Locations** (Red)
   - Count of all locations on your website

3. **Zesty Only** (Yellow) ⚠️
   - Locations on your website but NO LONGER in GDOS
   - **Consider removing these from web**

4. **GDOS Only** (Green) ✨
   - Locations in GDOS but NOT YET on your website
   - **Consider adding these to web**

---

## 🎯 Quick Tasks

### Find locations to add to the website
1. Click the **View** dropdown
2. Select **"GDOS Only"**
3. Click **"Apply Filters"**
4. Review the green-badged locations
5. These are NEW locations that should be added to Zesty

### Find outdated locations on the website
1. Click the **View** dropdown
2. Select **"Zesty Only"**
3. Click **"Apply Filters"**
4. Review the yellow-badged locations
5. These are REMOVED locations still showing on your website

### Check a specific state or division
1. Select a **State** or **Division** from the dropdowns
2. Click **"Apply Filters"**
3. See all locations matching those criteria
4. Identify which ones are in GDOS vs Zesty

### Search for a specific city
1. Type in the **City** search box
2. Click **"Apply Filters"**
3. Instantly find all locations in that city

---

## 📋 Understanding the Table

### Status Badges

| Badge | Color | Meaning | Action |
|-------|-------|---------|--------|
| **✓ Matched** | Blue | In BOTH systems ✅ | None needed |
| **GDOS Only** | Green | New location | Add to Zesty |
| **Zesty Only** | Yellow | Old location | Remove from Zesty |

### Key Columns

- **Location Name**: From GDOS (or Zesty if not in GDOS)
- **City**: Shows if different between systems
- **State**: Where the location is
- **Division**: Organizational division
- **Published**: Shows which system(s) have it
- **Property Type**: Type of location (thrift store, corps, etc.)
- **Address & Phone**: Contact information

---

## 🔧 Filtering Tips

### Apply Multiple Filters
You can combine filters! For example:
- Division: "Texas"
- State: "TX"
- Property Type: "thrift_store"
- View: "GDOS Only"

Then click **"Apply Filters"** to see new thrift stores in Texas.

### Clear All Filters
Click **"Clear Filters"** to go back to the original view.

### Sort by Any Column
Click on a column header to sort ascending/descending. Click again to reverse.

---

## 💡 Common Workflows

### Weekly Sync Check
1. Open the dashboard
2. Check the **GDOS Only** count - how many new locations?
3. Check the **Zesty Only** count - how many to remove?
4. Make a plan for the week

### Add New Locations
1. Filter to **"GDOS Only"**
2. Filter by your **Division**
3. Review the list
4. Export or manually add to Zesty

### Find Discrepancies
1. Look at **Matched** locations
2. Check if addresses or phone numbers differ
3. Verify which system has the correct info

### By-Division Review
1. Select a **Division**
2. Apply filter
3. See all locations in that division
4. Identify which ones are synced

---

## ❓ Common Questions

**Q: Why is a location showing as "Zesty Only"?**
A: It was published in Zesty but removed from GDOS (source of truth). It should probably be removed from the website.

**Q: Why is a location showing as "GDOS Only"?**
A: It's new in GDOS (source of truth) but hasn't been added to Zesty yet.

**Q: How often is the data updated?**
A: The dashboard loads the latest data files each time you open it. The GDOS and Zesty data files are date-stamped: GDOS-*-020726.json and LocationsData.json.

**Q: Can I edit locations in this dashboard?**
A: No, this is a comparison/review tool. Make changes in GDOS (source) or Zesty (web) directly.

**Q: How do I know which location is correct when they differ?**
A: GDOS is the source of truth. If information differs, the GDOS version is authoritative.

---

## 📱 Mobile Friendly

The dashboard works on phones and tablets! The table will:
- Adjust column widths automatically
- Show fewer columns on small screens
- Keep filters accessible

---

## 🆘 Troubleshooting

### Nothing showing up?
- Wait a few seconds - data is loading
- Check your internet connection
- Try refreshing the page

### Filters not working?
- Make sure you click **"Apply Filters"** button
- Check that at least one filter is selected
- Try clicking **"Clear Filters"** first

### Seeing an error?
- Open browser console (F12) to see details
- Check that data files exist in the `gdos/` folder
- Verify LocationsData.json is in the root folder

---

## 📚 More Information

For detailed documentation, see:
- `Locations-Comparison-Dashboard-README.md` - Full user guide
- `LOCATIONS-DASHBOARD-SUMMARY.md` - Technical summary

---

## 🎓 Pro Tips

1. **Combine filters strategically** to identify specific action items
2. **Sort by Division** to organize work by team
3. **Check the City column** for possible address/location name differences
4. **Review Published badges** to see sync status at a glance
5. **Adjust pagination size** if table is moving slowly (bottom right)

---

**Dashboard Version**: 1.0
**Last Updated**: February 8, 2026
**Ready to use!** ✅
