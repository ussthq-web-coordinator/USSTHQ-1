# RSYC Custom Styles - Update Guide

## Overview

All custom CSS and JavaScript for RSYC profiles is stored in a single file: **`rsyc-custom-styles.html`**

This file is automatically:
- Loaded into the live preview in both V1 and V2 generators
- Included in all exported/downloaded HTML profiles
- Applied when you copy HTML to clipboard

## How to Update Styles

### 1. Edit the Custom Styles File

Open and edit: `rsyc-custom-styles.html`

This file contains:
- **Fonts** (Google Fonts, Bootstrap Icons)
- **Custom CSS** (colors, buttons, cards, typography, animations)
- **JavaScript** (hero text transformations, word replacements)

### 2. Test Your Changes

**Method A: Generator Preview (Recommended)**
1. Open `rsyc-profile-generator-v2.html` in browser
2. Select any center from dropdown
3. Custom styles load automatically
4. See changes in live preview immediately

**Method B: Standalone Test**
1. Create a test HTML file
2. Include your custom styles at the top
3. Add sample RSYC HTML below
4. Open in browser to test

### 3. Refresh to Apply Changes

After editing `rsyc-custom-styles.html`:
- **Hard refresh** the generator page (Ctrl+F5 or Cmd+Shift+R)
- Select a center again to see updated styles
- Verify changes in preview

### 4. Deploy to Production

When satisfied with changes:
1. Upload `rsyc-custom-styles.html` to production server
2. All new profile generations will use updated styles
3. Existing profiles need manual updates

## What's Included

### Fonts
- **Google Fonts**: East Sea Dokdo, M PLUS 2, Rock Salt, Montserrat
- **Bootstrap Icons**: v1.10.5
- **Bootstrap CSS**: v5.3.2

### Custom Styles

**Brand Colors:**
- Red Shield Red: `#EF3D42`
- Teal: `#2F4857`
- Gold: `#F7A200`

**Components:**
- Hero headline styles with Rock Salt font
- Marker-style curved underlines for `<em>` tags
- Red/Grey button variants (solid & outline)
- Hover cards with animations
- Photo cards with rounded corners
- Schedule cards (horizontal scroll)
- Facility feature icons
- Responsive typography (h1-h6)

**Effects:**
- Icon wobble animation
- Button hover transforms
- Scroll snap for card containers
- Tooltip styles

### JavaScript Features

**Hero Text Enhancement:**
- Wraps headlines in `.underline-whole` span
- Automatically applies `<em>` tags to specific words:
  - Adventures, Youth, Events, Involved, Locations, Safety, Donor, Parent, Change
- Adds curved marker-style underlines

## Update Examples

### Example 1: Change Brand Color

**Before:**
```css
.btn-primary {
  background-color: #2F4857 !important;
}
```

**After:**
```css
.btn-primary {
  background-color: #1A2F3A !important; /* Darker teal */
}
```

### Example 2: Add New Emphasized Word

**Before:**
```javascript
html = html.replace(/\b(Change)\b/g, "<em>$1</em>");
```

**After:**
```javascript
html = html.replace(/\b(Change)\b/g, "<em>$1</em>");
html = html.replace(/\b(Community)\b/g, "<em>$1</em>"); // NEW
```

### Example 3: Modify Card Hover Effect

**Before:**
```css
.hover-card .btn:hover {
  transform: translateY(-5px);
}
```

**After:**
```css
.hover-card .btn:hover {
  transform: translateY(-8px) scale(1.05); /* More dramatic */
}
```

## File Structure

```
rsyc/
├── rsyc-custom-styles.html     ← EDIT THIS FILE
├── rsyc-profile-generator-v2.html
├── rsyc-generator-v2.js        ← Loads custom styles automatically
├── rsyc-data.js
├── rsyc-templates.js
└── rsyc-tracker.js
```

## Best Practices

✅ **DO:**
- Test changes in generator preview before deploying
- Keep all custom styles in `rsyc-custom-styles.html`
- Use comments to document major sections
- Maintain responsive breakpoints
- Test on mobile devices

❌ **DON'T:**
- Edit styles directly in generated HTML (they'll be overwritten)
- Mix inline styles with custom styles file
- Remove Bootstrap or Google Fonts links unless replacing
- Forget to hard refresh after editing

## Troubleshooting

**Styles not appearing in preview:**
- Hard refresh browser (Ctrl+F5)
- Check browser console for load errors
- Verify `rsyc-custom-styles.html` is in same directory

**Changes not applied:**
- Make sure you edited `rsyc-custom-styles.html`, not generated HTML
- Regenerate the profile after saving changes
- Clear browser cache if needed

**JavaScript not running:**
- Check console for errors
- Ensure `DOMContentLoaded` event listener is intact
- Verify script tags are properly closed

## Version Control

When updating `rsyc-custom-styles.html`:
1. Save a backup with date: `rsyc-custom-styles-2025-11-13.html`
2. Document changes in comments at top of file
3. Test thoroughly before replacing production version

## Support

For questions or issues with custom styles:
- Check this README first
- Review browser console for errors
- Test in incognito mode to rule out caching
- Compare with backup versions

---

**Last Updated:** November 13, 2025
