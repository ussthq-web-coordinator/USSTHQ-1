# RSYC Unit Pages - Quick Troubleshooting Guide

## The 10-Minute Fix

### Problem: Page is Blank

**Step 1** (30 seconds)
```javascript
// Open F12, go to Console tab, paste:
RSYCDebug.showStatus()
```

Look for ✗ (missing) items:
- RSYCDataLoader ✗ → rsyc-data.js didn't load
- RSYCUnitDataLoader ✗ → rsyc-unit-data.js didn't load  
- RSYCUnitTemplates ✗ → rsyc-unit-templates.js didn't load

**Step 2** (30 seconds)
```javascript
// Check network
RSYCDebug.checkScripts()
```

All rsyc-*.js files should be listed.

**Step 3** (1 minute)
If files missing, check F12 Network tab for red 404 errors.

**Step 4** (2 minutes)
- Stop your server
- Start again: `node rsyc-server.js` (or `python -m http.server 3000`)
- Hard refresh: Ctrl+Shift+R
- Check console again

**Step 5** (5 minutes)
If still failing, check file sizes:
```javascript
// Are files > 0 bytes?
fetch('/rsyc/rsyc-unit-injector.js')
  .then(r => r.text())
  .then(t => console.log('File size:', t.length, 'bytes'))
```

---

## The 5-Minute Fixes

### Blank Page - Instant Solutions

| Problem | Solution | Time |
|---------|----------|------|
| **No script loads** | Hard refresh: `Ctrl+Shift+R` | 10 sec |
| **Shows error in red** | Copy error message, check if file exists | 30 sec |
| **Network shows 404** | Restart server, check file exists | 1 min |
| **Says "Unit not found"** | Try different unit value, check data | 2 min |
| **Sections don't show** | Check if section data empty | 1 min |

### One-Liner Fixes

```javascript
// Hard reset everything
location.reload()

// Clear and reload
localStorage.clear(); location.reload()

// Enable all sections
window.RSYCUnitConfig.enabledSections = ['hero','overview','centers','programs','resources','impact','giving','leaders','contact']; location.reload()
```

---

## Error Messages & Solutions

### Error: "Failed to load: rsyc-data.js"

**What it means**: File doesn't exist or server not responding

**Fixes** (in order):
1. Check file exists: `/rsyc/rsyc-data.js`
2. Restart server
3. Hard refresh: Ctrl+Shift+R
4. Check Network tab for 404

**Verification**:
```javascript
fetch('/rsyc/rsyc-data.js')
  .then(r => r.ok ? console.log('✓ File exists') : console.log('✗ 404 Not Found'))
  .catch(e => console.log('✗ Network error:', e))
```

---

### Error: "RSYCDataLoader not found"

**What it means**: rsyc-data.js loaded but didn't execute

**Fixes**:
1. Check file has no syntax errors
2. Check file isn't empty
3. Restart server
4. Clear cache: Ctrl+Shift+Delete

**Verification**:
```javascript
console.log('Class exists?', typeof window.RSYCDataLoader !== 'undefined')
```

---

### Error: "Unit not found: division - Texas"

**What it means**: No centers have "Texas" in Division field

**Fixes**:
1. Check SharePoint data has Division field
2. Check center records actually have "Texas" value
3. Try different value: `"North Carolina"`, `"Florida"`
4. Check rsyc-data.js loads center data

**Verification**:
```javascript
// List all divisions in your data
const loader = new RSYCDataLoader();
await loader.loadCriticalData();
const divisions = [...new Set(loader.centers.map(c => c.division))];
console.log('Available divisions:', divisions);
```

---

### Error: "Cannot read property 'length' of undefined"

**What it means**: A section has no data

**Fixes**:
1. This is usually fine - just means that section is empty
2. Hide the section in config:
```javascript
window.RSYCUnitConfig.enabledSections = ['hero', 'overview', 'centers']
```
3. Or check if center data loaded properly

---

## Blank Page Debugging Matrix

```
Is there an error message in the red box?
├─ YES → Follow error message steps above
└─ NO → Is there anything rendering at all?
    ├─ Page fully blank → Check script loading
    │   ├─ Run: RSYCDebug.checkScripts()
    │   └─ All rsyc-*.js listed? 
    │       ├─ YES → Check console for errors
    │       └─ NO → Restart server + hard refresh
    └─ Some content shows → Check enabled sections
        └─ Run: console.log(window.RSYCUnitConfig.enabledSections)
```

---

## The Nuclear Option (Works 99% of the Time)

If nothing else works:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear everything
rm -rf node_modules/
rm package-lock.json
npm cache clean --force

# 3. Start fresh
npm install
node rsyc-server.js

# 4. In browser
Ctrl+Shift+Delete  # Clear cache
Ctrl+Shift+R       # Hard refresh
```

---

## Smart Debugging Checklist

Before you panic, check these in order:

- [ ] Server running? (Check http://localhost:3000 in browser)
- [ ] All rsyc-*.js files in `/rsyc/` folder?
- [ ] Test page has `<div data-rsyc-unit-type>`?
- [ ] Test page loads `rsyc-unit-injector.js`?
- [ ] F12 Console shows any red errors?
- [ ] F12 Network tab shows all scripts loading (200 status)?
- [ ] No 404 errors in Network tab?
- [ ] `RSYCDataLoader` class available? (`typeof window.RSYCDataLoader !== 'undefined'`)
- [ ] Center data loading? (Check console logs)
- [ ] Unit value exists in data? (e.g., "Texas" in Division)

---

## Super Quick Reference

| Issue | Command | Expected Result |
|-------|---------|-----------------|
| What's wrong? | `RSYCDebug.showStatus()` | Shows all classes + config |
| Files loaded? | `RSYCDebug.checkScripts()` | Lists all rsyc-*.js files |
| Data loaded? | `new RSYCDataLoader().loadCriticalData()` | Shows centers count |
| Try test unit | `RSYCDebug.loadUnit('division','Texas')` | Page renders |
| All sections? | `console.log(window.RSYCUnitConfig.enabledSections)` | Shows enabled sections |
| Clear & reload | `location.reload()` | Refreshes page |

---

## Common Cause Solutions

### Most Common Cause: Server Not Running
```bash
node rsyc-server.js
# or
python -m http.server 3000
```
Then test: `http://localhost:3000/rsyc/rsyc-unit-groups.html`

### Second Most Common: Stale Cache
```
Ctrl+Shift+Delete  # Clear all cache
Ctrl+Shift+R       # Hard refresh page
```

### Third Most Common: Wrong URL
- Are you using `http://localhost:3000`? ✓
- Are you using `http://localhost:8000`? ✗
- Are you using production URL? ✗

---

## Getting Help

When asking for help, provide:

1. **The error message** (from F12 Console, screenshot)
2. **Console output** from `RSYCDebug.showStatus()`
3. **Network errors** (red entries in F12 Network tab)
4. **What you're testing** (which unit type/value)

Example:
```
Error: "Unit not found: division - Texas"
My divisions are: ['Atlantic', 'Western', 'Southern']
How do I fix this?
```

---

## Prevention Tips

1. **Always check console first** (F12 → Console)
2. **Hard refresh often** (Ctrl+Shift+R)
3. **Restart server if in doubt** (Ctrl+C, then restart)
4. **Copy exact error messages** (Don't summarize)
5. **Test one thing at a time** (Not all 4 unit types at once)

---

## You're All Set! 🎉

If you've worked through this guide and it still doesn't work, you have excellent troubleshooting information to share. The system is solid - it's almost always an environment/configuration issue, not a code issue.

**Next: Check [LOCAL-TESTING-GUIDE.md](LOCAL-TESTING-GUIDE.md) for step-by-step testing.**

