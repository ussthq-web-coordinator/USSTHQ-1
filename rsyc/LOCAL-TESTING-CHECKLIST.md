# RSYC Unit Pages - Local Testing Checklist

## Prerequisites
- [ ] Node.js server running on `http://localhost:3000` 
- [ ] All files synced from GitHub
- [ ] Browser with F12 Developer Tools

---

## Phase 1: Page Load & Script Verification

### 1.1 Open Test Page
- [ ] Navigate to `http://localhost:3000/rsyc/rsyc-unit-groups.html`
- [ ] Page loads without 404 errors
- [ ] "RSYC Unit Injector - Local Test" header visible

### 1.2 Console Checks (F12 → Console)
Look for these success messages (in order):
- [ ] `[RSYCUnitInjector] Initializing...`
- [ ] `[RSYCUnitInjector] Loading scripts from: http://localhost:3000`
- [ ] `[RSYCUnitInjector] Loading script: rsyc-staff-order.js`
- [ ] `[RSYCUnitInjector] ✓ Loaded: rsyc-staff-order.js`
- [ ] `[RSYCUnitInjector] ✓ Loaded: rsyc-data.js`
- [ ] `[RSYCUnitInjector] ✓ Loaded: rsyc-cms-publisher.js`
- [ ] `[RSYCUnitInjector] ✓ Loaded: rsyc-unit-data.js`
- [ ] `[RSYCUnitInjector] ✓ Loaded: rsyc-unit-templates.js`
- [ ] `[RSYCUnitInjector] ✓ Loaded core scripts`
- [ ] `[RSYCUnitInjector] All classes loaded successfully`
- [ ] `[RSYCUnitInjector] ✓ Center data loaded` (with center count)
- [ ] `[RSYCUnitInjector] ✓ Unit hierarchy built`
- [ ] `[RSYCUnitInjector] ✅ Unit page loaded: <Unit Name>`

### 1.3 Network Tab Checks (F12 → Network)
- [ ] rsyc-staff-order.js → 200 OK
- [ ] rsyc-data.js → 200 OK
- [ ] rsyc-cms-publisher.js → 200 OK
- [ ] rsyc-unit-data.js → 200 OK
- [ ] rsyc-unit-templates.js → 200 OK
- [ ] rsyc-generator-v2.css → 200 OK
- [ ] No red entries (404 errors)

---

## Phase 2: Content Rendering

### 2.1 Page Sections Visible
- [ ] Hero section with "Texas Division" (or unit name)
- [ ] Overview section with 4 stat cards
  - [ ] Centers count
  - [ ] Programs count
  - [ ] Staff count
  - [ ] Youth served count
- [ ] Centers section with grid of center cards
- [ ] Programs section with list of programs
- [ ] Resources section (parents/youth resources)
- [ ] Impact section with growth metrics
- [ ] Giving section with donation options
- [ ] Leaders section with leadership info
- [ ] Contact section with CTA

### 2.2 Data Accuracy
- [ ] Center count matches actual centers in Texas division
- [ ] Programs listed are real programs
- [ ] Staff numbers reasonable
- [ ] Youth served count reasonable
- [ ] No "undefined" or "null" values visible

### 2.3 Mobile Responsiveness (F12 → Toggle device toolbar)
- [ ] iPhone SE view displays correctly
- [ ] iPad view displays correctly  
- [ ] Sections stack vertically on mobile
- [ ] Text is readable on small screens
- [ ] Buttons are tappable on mobile
- [ ] Images scale appropriately

---

## Phase 3: Different Unit Types

Create temporary test files to test each unit type:

### 3.1 Test Division Page
Create `division-test.html`:
```html
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
<script src="rsyc-unit-injector.js"></script>
```
- [ ] Page loads
- [ ] Shows correct division name
- [ ] All centers from that division display
- [ ] Stats are correct

### 3.2 Test State Page
Create `state-test.html`:
```html
<div data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>
<script src="rsyc-unit-injector.js"></script>
```
- [ ] Page loads
- [ ] Shows correct state name
- [ ] All centers from that state display
- [ ] Stats are correct

### 3.3 Test City Page
Create `city-test.html`:
```html
<div data-rsyc-unit-type="city" data-rsyc-unit-value="Charlotte, NC"></div>
<script src="rsyc-unit-injector.js"></script>
```
- [ ] Page loads
- [ ] Shows correct city/state
- [ ] Only centers in that city display
- [ ] Stats are correct

### 3.4 Test Area Command Page
Create `area-command-test.html`:
```html
<div data-rsyc-unit-type="area-command" data-rsyc-unit-value="Winston-Salem Area Command"></div>
<script src="rsyc-unit-injector.js"></script>
```
- [ ] Page loads
- [ ] Shows correct area command name
- [ ] Only centers in that area command display
- [ ] Stats are correct

---

## Phase 4: Interactive Elements

### 4.1 Center Cards
- [ ] Click center card → navigates to center profile
- [ ] Hover effect works (card lifts up slightly)
- [ ] All required info displays:
  - [ ] Center name
  - [ ] Address
  - [ ] Phone
  - [ ] Program list
  - [ ] "View Profile" button

### 4.2 Donation Cards (Giving Section)
- [ ] $25, $50, $100 cards visible
- [ ] "Custom Amount" button clickable
- [ ] Hover effects work
- [ ] Links go to giving page

### 4.3 Links
- [ ] All center profile links work
- [ ] Social media links work
- [ ] Call-to-action buttons functional
- [ ] No broken links in console

---

## Phase 5: Admin Publisher Interface

### 5.1 Access Publisher
- [ ] Navigate to `http://localhost:3000/rsyc/rsyc-unit-publisher.html`
- [ ] Page loads without errors
- [ ] Left sidebar visible with controls
- [ ] Right side shows live preview

### 5.2 Unit Type Selector
- [ ] Division dropdown works
- [ ] State dropdown works
- [ ] City dropdown works
- [ ] Area Command dropdown works

### 5.3 Unit Value Selector
- [ ] Selecting type populates value dropdown
- [ ] All available units show in dropdown
- [ ] Selecting a unit updates preview

### 5.4 Section Toggles
- [ ] Each section has toggle button
- [ ] Unchecking hides section in preview
- [ ] Checking shows section in preview
- [ ] Live preview updates instantly

### 5.5 Embed Code Generator
- [ ] "Generate Embed Code" button works
- [ ] Code shows correct unit type/value
- [ ] Code includes script tag
- [ ] "Copy" button copies to clipboard
- [ ] Copied code can be pasted into new page

---

## Phase 6: Performance & Edge Cases

### 6.1 Performance
- [ ] Page loads in < 3 seconds
- [ ] No console warnings about performance
- [ ] No memory leaks (check Task Manager)
- [ ] Smooth scrolling

### 6.2 Edge Cases
- [ ] Unit with 0 centers displays gracefully
- [ ] Unit with many centers (100+) displays correctly
- [ ] Very long center names wrap properly
- [ ] Special characters in unit names handled
- [ ] Multiple unit pages on same page work

### 6.3 Browser Compatibility
- [ ] Chrome: Full functionality ✓
- [ ] Firefox: Full functionality ✓
- [ ] Safari: Full functionality ✓
- [ ] Edge: Full functionality ✓

---

## Phase 7: Data Validation

### 7.1 Center Data
- [ ] Centers loading from SharePoint
- [ ] Center data includes: Name, Address, Phone, Division, State, City, Programs
- [ ] No duplicate centers
- [ ] Hierarchy levels consistent

### 7.2 Program Data  
- [ ] Programs aggregating correctly
- [ ] No duplicate programs within unit
- [ ] Program data complete and accurate

### 7.3 Stats Calculations
- [ ] Center count = actual centers in unit
- [ ] Program count = unique programs across centers
- [ ] Staff count calculated from centers
- [ ] Youth served = sum of all centers

---

## Phase 8: Deployment Readiness

### 8.1 Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Code properly formatted
- [ ] Comments clear and helpful

### 8.2 Documentation
- [ ] All files documented
- [ ] README files up-to-date
- [ ] Quick-start guide clear
- [ ] Architecture documented

### 8.3 Backward Compatibility
- [ ] Existing center profiles still work
- [ ] Old embed codes still function
- [ ] No breaking changes to existing pages
- [ ] All existing features intact

### 8.4 Production Ready
- [ ] All tests passing
- [ ] No known bugs
- [ ] Error handling comprehensive
- [ ] Ready to deploy

---

## Issue Resolution

### If Console Shows Errors

**Error: "Failed to load: rsyc-data.js"**
- Check: File exists in `/rsyc/` directory
- Check: Server running and accessible
- Try: Hard refresh (Ctrl+Shift+R)

**Error: "RSYCDataLoader not found"**
- Check: rsyc-data.js loaded (look in Network tab)
- Check: No errors in rsyc-data.js
- Solution: Restart server

**Error: "Unit not found"**
- Check: Unit value exists in your data
- Try: Different unit value (e.g., "Texas" vs "texas")
- Check: Center data loaded successfully

**Error: "Failed to load: rsyc-unit-templates.js"**
- Check: File syntax is correct
- Check: File not corrupted
- Solution: Recreate from backup

### If Page is Blank

1. Open F12 Console
2. Look for red error messages
3. Check Network tab for 404 errors
4. Try hard refresh: Ctrl+Shift+R
5. Try different unit type
6. Check center data in SharePoint

---

## Sign-Off

- [ ] All phases passed
- [ ] No critical issues
- [ ] Performance acceptable
- [ ] Ready for production deployment

**Date Tested**: _________________
**Tested By**: _________________
**Issues Found**: _________________

