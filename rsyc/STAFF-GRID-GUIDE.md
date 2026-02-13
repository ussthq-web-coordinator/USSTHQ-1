# Staff & Community Leaders Grid - Implementation Guide

## Overview

The unit group display system has been extended to aggregate and display staff and community leaders from all centers in a single, filterable grid. This feature complements the existing centers grid and provides a unified view of the personnel serving across all locations.

## Features Implemented

### 1. Staff Aggregation
- Aggregates all staff and community leaders from every center in the unit
- Automatically enriches staff data with center information (name, city, state)
- Prevents duplicates using staff ID + center ID combination

### 2. Staff Card Display
Each staff member is displayed in a professional card containing:
- **Photo**: Staff member's image (with fallback to default)
- **Name**: Staff member's alternate name or primary name
- **Title**: Position title (e.g., "Center Director", "Youth Worker")
- **Center**: Name of the center where they work
- **Location**: City and state information
- **Bio**: Biography preview (first 150 characters with "..." if longer)
- **Visual Hierarchy**: Color-coded title in teal (#20B3A8), muted location text

### 3. Filtering System
Three-level filtering capability:
- **By State**: Filter to show staff from specific states
- **By City**: Filter to show staff from specific cities
- **By Position Type**: Filter by role type (e.g., "Commander", "Manager")

Filters work in combination (AND logic) - all selected filters must match.

### 4. Visual Design
- Responsive grid layout (auto-fill, minmax 280px-1fr)
- 24px gap between cards
- White cards with subtle shadows and hover effects
- Light gray (#f8f9fa) background section for staff grid
- Professional typography matching existing RSYC system
- Icon indicators (building, location) for visual clarity
- Mobile-responsive: adapts to 1-3 columns based on screen size

## Technical Implementation

### Modified Files

#### `rsyc-unit-templates.js`
Added two new methods:

1. **`generateAllStaffGrid(unit)`**
   - Main method that generates the complete staff grid HTML
   - Filters out closed centers
   - Aggregates staff from active centers only
   - Prevents duplicate entries
   - Extracts filter options
   - Generates individual staff cards
   - Creates filter interface
   - Returns complete HTML with filters and grid

2. **`generateUnitSection()` updates**
   - Modified `generateAllCentersGrid()` return statement
   - Now calls `generateAllStaffGrid()` and includes output
   - Added "Our Centers" heading to centers section
   - Added "Staff & Community Leaders" section with descriptive text

3. **Global Filter Functions**
   - `window.applyAllStaffFilters()`: Applies active filters to staff cards
   - `window.clearAllStaffFilters()`: Resets all filters

### Data Structure

Staff data comes from center objects and includes:
```javascript
{
    id: "staff ID",
    alternateName: "John Doe",
    positionTitle: "Center Director",
    biography: "Biography text...",
    roleType: "Commander",
    imageURL: "https://...",
    centerName: "Red Shield Youth Center of Springfield",
    centerCity: "Springfield",
    centerState: "IL"
}
```

### Integration with Existing System

The staff grid is automatically included when viewing the "all centers" unit (type='all'). It appears **after** the centers grid in the page layout:

1. **Filter bar** (gray background)
   - State, City, and Position Type dropdowns
   - Clear All Filters button

2. **Staff Cards Grid** (white background)
   - Responsive grid of staff members
   - 4-card display on large screens, 2-3 on tablets, 1 on mobile

## Usage

### For End Users

1. Navigate to the unit group "All Centers" view
2. Scroll down past the centers section
3. View "Staff & Community Leaders" section
4. Use filters to find staff by location or role
5. Click individual cards to view more details (when linked in future)

### For Developers

To customize the staff grid:

1. **Modify card layout**: Edit the card HTML template in `generateAllStaffGrid()`
2. **Add filters**: Add new filter categories in the filter extraction and filter HTML sections
3. **Change grid size**: Modify `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
4. **Update styling**: Modify inline styles in card templates

### Testing

Use the test page at: `http://localhost:3001/rsyc/test-staff-grid.html`

This page loads the complete staff grid system and logs:
- Number of staff cards rendered
- Confirmation of successful rendering
- Debug information to browser console

## Data Source

Staff data comes from:
- **Source**: `RSYCLeaders.json` (processed by `rsyc-data.js`)
- **Required Fields**:
  - `alternateName` or `PositionTitle` for staff name
  - `positionTitle` for role
  - `biography` for bio text
  - `roleType` for position type filtering
  - `imageURL` or equivalent for photo
  - Center association via center ID reference

## Styling Reference

Key CSS classes and styles:
- `.staff-card`: Individual staff member card
- Grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Card height: 250px for image, flexible content area
- Accent color: `#20B3A8` (teal)
- Background color: `#f8f9fa` (light gray for section)
- Gap between cards: `24px`

## Future Enhancements

Potential improvements for future versions:

1. **Staff Profiles**: Link staff cards to individual profile pages
2. **Contact Integration**: Add email/phone contact buttons
3. **Department Badges**: Visual badges for department type
4. **Sort Options**: Allow sorting by name, title, etc.
5. **Search**: Full-text search by name or keywords
6. **Card Interactions**: Expand card on hover to show full bio
7. **Export**: Download staff directory as PDF/CSV
8. **Social Links**: LinkedIn, email, or other social integration

## Performance Notes

- Staff aggregation uses `Map` to prevent duplicates
- Filters use DOM manipulation (classList/display toggling)
- No external API calls for filtering
- Lazy loading of images via `loading="lazy"`
- Optimized for typical staff counts (50-500 members)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses ES6 features (arrow functions, template literals, Map)
- Responsive design works on all devices
- CSS Grid with `auto-fill` supported in all modern browsers

## Troubleshooting

### Staff not showing
1. Check that centers have `leaders` array in center data
2. Verify staff have `imageURL` or image field set
3. Check browser console for errors
4. Ensure data loads: Check `RSYCLeaders.json` exists

### Filters not working
1. Verify filter select elements have correct IDs
2. Check that `roleType` is populated in staff data
3. Ensure filter dropdown options are generated
4. Check console for JavaScript errors

### Styling issues
1. Verify Bootstrap CSS is loaded
2. Check for inline style conflicts
3. Verify `#20B3A8` color value is correct
4. Test in different browsers

## Code Examples

### Accessing the staff grid in JavaScript
```javascript
// Get all visible staff cards
const visibleStaff = document.querySelectorAll('.staff-card:not([style*="display: none"])');

// Get staff from specific state
const texasStaff = document.querySelectorAll('.staff-card[data-state="TX"]');

// Apply custom filter
document.querySelectorAll('.staff-card').forEach(card => {
    if (card.dataset.role === 'Commander') {
        card.style.borderLeft = '4px solid #20B3A8';
    }
});
```

### Customizing the staff card HTML
Edit the template literal in `generateAllStaffGrid()` starting around line 460:
```javascript
return `
    <div class="staff-card" data-city="${city}" data-state="${state}" data-role="${roleType}">
        <!-- Card content here -->
    </div>
`;
```

## Support & Maintenance

For issues or questions:
1. Check browser console (F12 → Console tab)
2. Review this documentation
3. Check the test page output
4. Examine `rsyc-unit-templates.js` for implementation details
