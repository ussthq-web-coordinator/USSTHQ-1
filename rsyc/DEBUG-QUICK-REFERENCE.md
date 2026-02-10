# RSYC Unit Pages - Debug Quick Reference

## Browser Console Commands

Open Developer Tools (F12) → Console and run:

### Check System Status
```javascript
RSYCDebug.showStatus()
```
Shows all loaded classes, configuration, DOM elements, and available functions.

### Verify Scripts Loaded
```javascript
RSYCDebug.checkScripts()
```
Lists all rsyc-*.js scripts currently loaded on the page.

### Check Stylesheets
```javascript
RSYCDebug.showStyles()
```
Lists all rsyc-*.css stylesheets and style elements.

### Manually Load a Unit
```javascript
RSYCDebug.loadUnit('division', 'Texas')
// or specific selector:
RSYCDebug.loadUnit('state', 'North Carolina', '#my-unit-container')
```

---

## Common Issues & Solutions

### Issue: Blank Page
1. Open F12 → Console tab
2. Run: `RSYCDebug.showStatus()`
3. Look for ✗ (missing) classes
4. Check Network tab for 404 errors

**Quick Fix**:
```javascript
// Reload all scripts
location.reload()
```

### Issue: Script Load Error
**In Console**, you'll see:
```
[RSYCUnitInjector] ✗ Failed to load: rsyc-data.js
```

**Solution**: 
1. Verify file exists: Check `/rsyc/rsyc-data.js`
2. Restart server: Stop and restart Node/Python server
3. Hard refresh: Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: "Unit not found"
Error message: `Unit not found: division - Texas`

**Possible Causes**:
1. Center data not loaded
2. Unit value doesn't exist in data
3. Data doesn't have correct Division/State fields

**Debug**:
```javascript
// Check if data loaded
RSYCDebug.showStatus()

// Manually load and check
const loader = new RSYCDataLoader();
await loader.loadCriticalData();
console.log('Centers loaded:', loader.centers.length);
```

### Issue: Sections Not Showing
Some sections display, others are blank.

**Cause**: Empty data for that section

**Debug**:
```javascript
// Check enabled sections
console.log(window.RSYCUnitConfig.enabledSections)

// Enable all sections
window.RSYCUnitConfig.enabledSections = ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'leaders', 'contact'];

// Reload unit
location.reload()
```

### Issue: Styling Missing
Unit page renders but looks plain/unstyled.

**Debug**:
```javascript
// Check stylesheets
RSYCDebug.showStyles()

// Manually inject styles
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'rsyc-generator-v2.css';
document.head.appendChild(link);
```

---

## URL & Path Verification

### Expected Script Paths (Local)
```
http://localhost:3000/rsyc/rsyc-data.js
http://localhost:3000/rsyc/rsyc-unit-data.js
http://localhost:3000/rsyc/rsyc-unit-templates.js
http://localhost:3000/rsyc/rsyc-unit-injector.js
http://localhost:3000/rsyc/rsyc-cms-publisher.js
http://localhost:3000/rsyc/rsyc-staff-order.js
```

### Check File Accessibility
```javascript
// Test individual script
fetch('rsyc-unit-injector.js')
  .then(r => console.log(r.status))
  .catch(e => console.error('Not found:', e))
```

---

## Data Debugging

### Check Center Data Loading
```javascript
const loader = new RSYCDataLoader();
await loader.loadCriticalData();
console.log('Centers:', loader.centers);
console.log('Total:', loader.centers.length);
```

### List All Divisions
```javascript
const loader = new RSYCDataLoader();
await loader.loadCriticalData();
const divisions = [...new Set(loader.centers.map(c => c.division))];
console.log('Divisions:', divisions);
```

### List All States
```javascript
const loader = new RSYCDataLoader();
await loader.loadCriticalData();
const states = [...new Set(loader.centers.map(c => c.state))];
console.log('States:', states);
```

### Find Centers in Division
```javascript
const loader = new RSYCDataLoader();
const unitLoader = new RSYCUnitDataLoader(loader);
await loader.loadCriticalData();
await unitLoader.buildUnitHierarchy();

const texasCenters = unitLoader.getUnitCenters('division', 'Texas');
console.log('Texas centers:', texasCenters);
```

---

## Performance Debugging

### Check Page Load Time
```javascript
// In browser console after page loads
console.log('Load time:', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms');

// Or use:
performance.now()
```

### Monitor Memory
```javascript
// Chrome only
if (performance.memory) {
    console.log('Memory:', {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    });
}
```

---

## Console Log Reference

### Script Loading Indicators
- ✓ Loaded - Script loaded successfully
- ✗ Failed - Script failed to load (404 or error)
- ⚠ Warning - Minor issue, non-blocking
- ✅ Success - Operation completed successfully

### Log Format
```
[ComponentName] message
[RSYCUnitInjector] Loading division: Texas
[RSYCDataLoader] ✓ Center data loaded (245 centers)
```

---

## Quick Troubleshooting Flowchart

```
Page Blank?
├─ Open F12 Console
├─ Look for red errors
│
├─ Script loading error?
│  ├─ Check Network tab
│  ├─ Verify file exists
│  └─ Restart server
│
├─ "Unit not found"?
│  ├─ Run: RSYCDebug.showStatus()
│  ├─ Check center data loaded
│  └─ Verify unit value exists
│
├─ Sections not showing?
│  ├─ Check enabled sections
│  ├─ Verify data loaded for section
│  └─ Check for empty arrays
│
└─ Styling missing?
   ├─ Check rsyc-generator-v2.css loaded
   ├─ Verify Bootstrap loaded
   └─ Check style injection
```

---

## Advanced Debugging

### Enable Verbose Logging
```javascript
// Add this before loading injector
window.RSYCVerbose = true;
```

### Inspect Unit Object
```javascript
// After unit loads
const unitContainer = document.querySelector('[id^="rsyc-unit-container"]');
console.log('Container HTML:', unitContainer.innerHTML);
```

### Check CSS Classes
```javascript
// Verify RSYC styling applied
const sections = document.querySelectorAll('[class*="rsyc"]');
console.log('RSYC elements:', sections.length);
```

### Test Data Aggregation
```javascript
const loader = new RSYCDataLoader();
const unitLoader = new RSYCUnitDataLoader(loader);
await loader.loadCriticalData();
await unitLoader.buildUnitHierarchy();

// Get stats
const unit = unitLoader.getUnit('division', 'Texas');
console.log('Unit stats:', {
  name: unit.displayName,
  centers: unit.centers.length,
  programs: unit.programs.length,
  staff: unit.stats.staffCount,
  youth: unit.stats.youthServed
});
```

---

## Still Stuck?

1. **Clear cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Hard refresh**: Ctrl+Shift+R or Cmd+Shift+R
3. **Check all files exist**: Visit `/rsyc/rsyc-*.js` in browser directly
4. **Restart server**: Stop and restart your Node/Python server
5. **Check file sizes**: Files should be > 1KB (not empty)

Share the console error and I can help debug further!
