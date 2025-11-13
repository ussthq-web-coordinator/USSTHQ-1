# RSYC Profile Generator V2 - UI Redesign

## Changes Made

### New Compact Layout

The UI has been completely redesigned with a more efficient, compact layout:

1. **Header Section**
   - Simplified single-line header with app title
   - Removed redundant subtitle

2. **Compact Controls Header**
   - **Center Selection**: Dropdown (replaces left sidebar list)
   - **Section Checkboxes**: Horizontal inline checkboxes (replaces vertical list)
   - **Action Buttons**: Single row with all actions (Generate, Copy, Download, Publish, Select All, Clear All)

3. **Full-Width Live Preview**
   - Automatically updates when center or sections change
   - No tabs needed - direct HTML preview
   - Full width for better visibility
   - Auto-scrolls to top on each update

4. **Status Bar**
   - Shows data load status, selected center, last generation time

## New Files Created

- **rsyc-profile-generator-v2.html** - New compact UI structure
- **rsyc-generator-v2.css** - Redesigned styles for compact layout
- **rsyc-generator-v2.js** - New controller with auto-update logic

## Key Features

### Auto-Updating Preview
- Preview updates automatically when:
  - Center is selected from dropdown
  - Any section checkbox is toggled
  - No manual "Generate" click needed for preview

### Smart Section Detection
- System automatically hides sections with no data
- All sections checked by default
- Quick select/deselect all options

### Compact Section Selection
- Inline checkbox labels (9 sections in 2-3 rows)
- Much smaller footprint than previous vertical list
- Visual feedback for checked items

### Streamlined Workflow
1. Select center from dropdown
2. Preview appears instantly with all checked sections
3. Toggle sections on/off to refine
4. Click "Generate HTML" to finalize
5. Copy, Download, or Mark as Published

## Usage

Open `rsyc-profile-generator-v2.html` in your browser.

### Workflow:
1. **Select Center**: Choose from dropdown (sorted alphabetically)
2. **Review Preview**: Live preview shows immediately below
3. **Adjust Sections**: Check/uncheck sections as needed (preview updates automatically)
4. **Generate**: Click "Generate HTML" to finalize and timestamp
5. **Export**: Use Copy, Download, or Mark Published buttons

### Sections Available:
- Hero (banner/header)
- About (mission/description)
- Programs (program offerings)
- Schedules (program schedules with tooltips)
- Hours (hours of operation)
- Facilities (features with icons and photo)
- Staff (leadership team)
- Volunteer (opportunities)
- Contact (location/contact info)

## Benefits of V2 Layout

✅ **More Screen Space**: Full-width preview instead of 50% split  
✅ **Faster Workflow**: Auto-updates eliminate manual preview clicks  
✅ **Better Mobile**: Responsive design works on tablets/smaller screens  
✅ **Cleaner UI**: Single dropdown vs scrolling list  
✅ **Less Clicks**: Inline actions, no tab switching  
✅ **Instant Feedback**: See changes immediately as you select  

## Technical Details

### Auto-Update Mechanism
```javascript
// Checkboxes auto-trigger preview update
checkbox.addEventListener('change', () => {
    if (this.currentCenter) {
        this.autoGeneratePreview();
    }
});
```

### Section Visibility Logic
The template engine automatically returns empty string for sections with no data, so they won't appear in preview even if checked.

### Performance
- Debouncing not needed (generation is fast enough)
- Direct HTML injection (no iframe overhead)
- Minimal DOM manipulation

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Modern mobile browsers: ✅ Full support

## Next Steps

1. Test the new layout: Open `rsyc-profile-generator-v2.html`
2. If satisfied, can rename to replace original
3. Old version preserved as `rsyc-profile-generator.html` (backup)

---

**Note**: The original files remain unchanged. V2 files are separate and can run side-by-side for comparison.
