# Data Version Manager - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Open the Tool
- Open `version-manager-ui.html` in your browser
- You'll see a purple gradient dashboard

### 2. Load Data
- Click **"🔄 Load All Data Versions"**
- Wait 10-30 seconds for data to load
- Statistics will update automatically

### 3. Find Changes
- Click **"📋 Show Only Changed Records"**
- See table of locations with differences between Oct and Dec

### 4. Update a Record
- Click **"Review & Update"** on any row
- Check boxes for fields you want to update
- Click **"Apply Selected Updates"**
- Confirm when prompted

### 5. Export History
- Click **"💾 Export Update History"**
- Save the JSON file for your records

## 📊 What Do the Numbers Mean?

| Stat | Meaning |
|------|---------|
| **Total Records (Dec)** | All locations in December GDOS data |
| **Records with Changes** | Locations that differ between Oct and Dec |
| **Updates Applied** | How many records you've already updated |
| **Pending Review** | Records with changes you haven't updated yet |

## 🎯 Common Workflows

### Workflow 1: Update All Phone Numbers
```
1. Load data versions
2. Show only changed records
3. Filter Change Type: "GDOS Changed Only"
4. Search: "phone" in table
5. Review each phone number change
6. Apply updates selectively
7. Export history
```

### Workflow 2: Update Specific Territory
```
1. Load data versions
2. Show only changed records
3. Filter Territory: "USW" (or USS, USC, USE)
4. Review all changes for that territory
5. Apply updates
6. Export history
```

### Workflow 3: Find Specific Location
```
1. Load data versions
2. Show all records
3. Search GDOS ID or name in search box
4. Click "Review & Update"
5. Check desired fields
6. Apply update
```

## ⚠️ Important Safety Rules

1. **NEVER** click "Apply" without reviewing the changes
2. **ALWAYS** check both Oct and Dec values before updating
3. **ONLY** select fields you want to update (not all)
4. **EXPORT** history after significant update sessions
5. **VERIFY** the December value is actually newer/correct

## 🔍 Understanding Change Badges

- 🟢 **Green "No Changes"** = Record is identical, skip it
- 🟡 **Yellow "X Changes"** = Has differences, review it
- **"GDOS Changes: 3"** = 3 fields changed in GDOS between versions
- **"Zesty Changes: 2"** = 2 fields changed in Zesty between versions

## 🛠️ Filter Combinations

### Find GDOS-only changes in West territory
- Territory: USW
- Change Type: GDOS Changed Only
- Result: Changes that came from GDOS update, not Zesty edits

### Find locations where both sources changed
- Territory: (Any)
- Change Type: Both Changed
- Result: Most critical to review - both systems changed

### Find specific location
- Search: Paste GDOS ID or location name
- Result: Jumps to that specific record

## 📋 What Fields Can Be Updated?

✅ **Safe to Update (Usually)**
- phone (phone numbers change often)
- openHoursText / hours_of_operation (hours change)
- address (corrections to street address)

⚠️ **Review Carefully**
- name (name changes are significant)
- siteTitle (affects website)
- latitude/longitude (verify accuracy)
- zipcode (verify it matches address)

## 💡 Pro Tips

1. **Start Small**: Update one territory first to get comfortable
2. **Use Filters**: Don't try to review everything at once
3. **Export Often**: Export history after each session
4. **Check Patterns**: If many phones changed, might be a format update
5. **Trust the Badge**: Green badge = skip, yellow badge = review

## ❓ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Table is empty | Click "Load All Data Versions" first |
| Can't find a location | Use search box (GDOS ID or name) |
| Too many results | Apply territory or change type filters |
| Update didn't work | Check at least one field box is selected |
| Need to undo | Currently no undo - be careful! Export history first |

## 📞 Need Help?

1. Check the full README: `VERSION-MANAGER-README.md`
2. Review browser console for technical errors (F12)
3. Export update history to see what was changed
4. Check that all JSON files are in the `gdos-comparison` folder

---

**Quick Ref v1.0** | Made with ❤️ for safe data management
