# Local Testing Guide - RSYC Unit Pages

## Quick Start

1. **Start your local server** (if not already running):
   ```bash
   # If using the Node.js server
   node rsyc-server.js
   
   # Or if using Python
   python -m http.server 3000
   ```

2. **Open the test page**:
   ```
   http://localhost:3000/rsyc/rsyc-unit-groups.html
   ```

3. **Open Developer Tools** (F12) and check:
   - **Console tab** - Look for loading logs and any errors
   - **Network tab** - Check that all .js files load successfully (no 404 errors)

## What to Look For

### Success Indicators
- Console shows: `[RSYCUnitInjector] ✅ Initialized`
- Page displays a "RSYC Unit Injector - Local Test" section
- A Unit page appears below with sections like Hero, Overview, Centers, etc.
- All scripts load with status 200 in Network tab

### Common Issues

#### Issue 1: Blank Page
**Possible Cause**: One or more scripts failed to load

**How to Fix**:
1. Open F12 → Network tab
2. Look for red entries (404 errors)
3. Check if files exist:
   - `rsyc-data.js` ✅
   - `rsyc-unit-data.js` ✅
   - `rsyc-unit-templates.js` ✅
   - `rsyc-unit-injector.js` ✅
   - `rsyc-cms-publisher.js` ✅
   - `rsyc-staff-order.js` ✅

#### Issue 2: Console Shows Errors
**Check the specific error message**:
- If `RSYCDataLoader not found` → rsyc-data.js didn't load
- If `RSYCUnitDataLoader not found` → rsyc-unit-data.js didn't load
- If `RSYCUnitTemplates not found` → rsyc-unit-templates.js didn't load

#### Issue 3: "Unit not found: division - Texas"
**Possible Cause**: Center data from SharePoint didn't load or Texas doesn't have centers

**How to Fix**:
1. Check that centers in your data have `Division: "Texas"`
2. Test with different unit values
3. Check SharePoint connection in rsyc-data.js

## Testing Different Unit Types

```html
<!-- Division Page -->
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>

<!-- State Page -->
<div data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>

<!-- City Page -->
<div data-rsyc-unit-type="city" data-rsyc-unit-value="Charlotte, NC"></div>

<!-- Area Command Page -->
<div data-rsyc-unit-type="area-command" data-rsyc-unit-value="Winston-Salem Area Command"></div>
```

## Debug Mode

To enable extra logging, add this before the injector script loads:

```html
<script>
    // Enable verbose logging
    window.RSYCDebug = true;
</script>
<script src="rsyc-unit-injector.js"></script>
```

Check console for detailed logs about:
- Script loading progress
- Unit hierarchy building
- Data aggregation steps
- Section generation

## Admin Publisher Interface

Once basic testing works, try the admin interface:

```
http://localhost:3000/rsyc/rsyc-unit-publisher.html
```

This lets you:
1. Select unit type from dropdown
2. Choose specific unit to preview
3. Toggle sections on/off
4. Copy embed code for new pages

## Troubleshooting Checklist

- [ ] Server running on localhost:3000?
- [ ] F12 Console shows no red errors?
- [ ] Network tab shows all .js files loading?
- [ ] rsyc-data.js console log shows center count?
- [ ] Center data contains your test unit value?
- [ ] All 5 core scripts load in order?
- [ ] Unit page appears with content sections?
- [ ] Responsive design works on mobile (F12 → Toggle device toolbar)?

## Next Steps

Once local testing confirms unit pages work:
1. Test all 4 unit types (division, state, city, area-command)
2. Verify section content is appropriate for each type
3. Test responsive design on different screen sizes
4. Check that center profile links work
5. Deploy to production when satisfied

## Support

If you encounter issues:
1. Share the console error message (F12 → Console)
2. Check Network tab for failed requests
3. Verify center data in SharePoint has correct fields
4. Review UNIT-PAGES-README.md for detailed documentation
