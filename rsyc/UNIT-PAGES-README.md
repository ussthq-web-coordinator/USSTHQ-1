# RSYC Unit Pages - Complete Implementation Guide

## Overview

The RSYC Unit Pages system extends the existing center profile system to support organizational hierarchy pages at multiple levels:

- **All Centers** Page - Interactive grid of all 57 centers nationwide with filters
- **Division** Pages (e.g., "Texas Division")
- **State** Pages (e.g., "North Carolina State")  
- **City** Pages (e.g., "Charlotte, NC")
- **Area Command** Pages (e.g., "Winston-Salem Area Command")

All content is strategically designed for three key audiences:
- **Parents** - Program enrollment, family resources, support services
- **Youth** - Youth programs, opportunities, leadership development
- **Donors** - Impact metrics, stories, giving opportunities

## Quick Start

### For Website Administrators

1. **Open the Publisher**
   ```
   Navigate to: /rsyc/rsyc-unit-publisher.html
   ```

2. **Create a Unit Page**
   - Select "Unit Type" (Division, State, City, Area Command)
   - Select "Unit Value" (e.g., "Texas", "North Carolina")
   - Click "Load Unit"
   - Preview appears on right side

3. **Configure Sections**
   - Check/uncheck sections to enable/disable
   - Sections reorder automatically by configured order

4. **Get Embed Code**
   - Click "Copy Code" button
   - Paste into any HTML page

### For Page Builders (Zesty, WordPress, etc.)

1. **Get the embed code from Publisher**

2. **Paste into your page/template**
   ```html
   <div id="unit-page" 
        data-rsyc-unit-type="division" 
        data-rsyc-unit-value="Texas"></div>
   <script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
   ```

3. **Optional: Configure sections globally**
   ```html
   <script>
     window.RSYCUnitConfig = {
       enabledSections: ['hero', 'overview', 'centers', 'programs', 'giving']
     };
   </script>
   <script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
   ```

## File Architecture

### Core Files

| File | Purpose | Dependencies |
|------|---------|--------------|
| `rsyc-unit-data.js` | Data aggregation layer (hierarchies + "all" units) | rsyc-data.js |
| `rsyc-unit-templates.js` | HTML template generation (includes generateAllCentersGrid) | None |
| `rsyc-unit-injector.js` | Client-side page rendering | All above |
| `rsyc-unit-publisher.html` | Admin interface | All above |
| `rsyc-generator-v2.css` | Stylesheet for all pages | None |

### Data Flow

```
RSYCDataLoader (centers)
       ↓
RSYCUnitDataLoader (aggregates by unit)
       ↓
RSYCUnitTemplates (generates HTML)
       ↓
RSYCUnitInjector (renders to page)
```

## Detailed Usage Examples

### Example 1: Texas Division Page

**URL Pattern:**
```
https://your-domain.com/divisions/texas/
```

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://thisishoperva.org/rsyc/rsyc-generator-v2.css">
</head>
<body>
  <div id="texas-division" 
       data-rsyc-unit-type="division" 
       data-rsyc-unit-value="Texas"></div>
  
  <script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
</body>
</html>
```

**What Users See:**
- Hero section with division name and inspiring message
- Overview with statistics (12 centers, 48 programs, etc.)
- Interactive grid of all centers in Texas with links to center pages
- Featured programs across all Texas centers
- Resources for parents, youth, and donors
- Impact metrics and growth stories
- Donation options
- Leadership information
- Contact and navigation

### Example 2: North Carolina State Page

**HTML:**
```html
<div data-rsyc-unit-type="state" 
     data-rsyc-unit-value="North Carolina"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Example 3: Charlotte City Page

**HTML:**
```html
<div data-rsyc-unit-type="city" 
     data-rsyc-unit-value="Charlotte, NC"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Example 4: Area Command Page

**HTML:**
```html
<div data-rsyc-unit-type="area-command" 
     data-rsyc-unit-value="Winston-Salem Area Command"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Example 5: All Centers National Page (NEW)

**Purpose**: Display all 57 Salvation Army Youth Centers across the country with interactive filters

**URL Pattern:**
```
https://your-domain.com/all-centers/
```

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://thisishoperva.org/rsyc/rsyc-generator-v2.css">
</head>
<body>
  <div id="all-centers-page" 
       data-rsyc-unit-type="all" 
       data-rsyc-unit-value="all"></div>
  
  <script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
</body>
</html>
```

**What Users See:**
- **Filter Bar** with 4 dropdowns:
  - City (46 options)
  - State (11 options)
  - Facility Features (31 options)
  - Programs (43 options)
- **Interactive Card Grid** (3-column responsive layout):
  - Each center displayed as a card with:
    - **Background image**: Center's exterior photo (fallback to default Salvation Army building image)
    - **Gradient overlay**: Semi-transparent black-to-transparent gradient
    - **Center name**: Bold text overlaid on image
    - **Location**: City, State text
    - **"Learn More"** link
  - Cards update instantly as filters are applied
- **Responsive Design**: Adapts to all screen sizes

**Features:**
- ✅ Real-time client-side filtering (no page reload)
- ✅ Multiple filter combinations work together (AND logic)
- ✅ Dynamic filter population from actual center data
- ✅ Each center links to `/redshieldyouth/{center-slug}` URL pattern
- ✅ Exterior photos for visual center identification
- ✅ Works offline once CSS and scripts are cached

## Section Configuration

### Available Sections

**For Division, State, City, and Area Command pages:**

```javascript
{
  'hero': { name: 'Hero Section', order: 1 },
  'overview': { name: 'Unit Overview', order: 2 },
  'centers': { name: 'Centers in This Unit', order: 3 },
  'programs': { name: 'Featured Programs', order: 4 },
  'resources': { name: 'Resources for Families', order: 5 },
  'impact': { name: 'Impact & Growth', order: 6 },
  'giving': { name: 'Give to This Unit', order: 7 },
  'leaders': { name: 'Leadership', order: 8 },
  'contact': { name: 'Contact & Learn More', order: 9 }
}
```

**For "All Centers" page:**
- Only "Filters" + "Card Grid" sections (no traditional unit page sections)
- Automatically populates with all centers and all available filter options

### Global Configuration

**Control which sections appear on ALL pages:**

```html
<script>
  window.RSYCUnitConfig = {
    enabledSections: [
      'hero', 
      'overview', 
      'centers', 
      'programs', 
      'giving'
    ]
  };
</script>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Per-Page Configuration

**Data attributes (planned, not yet implemented):**

```html
<div data-rsyc-unit-type="division" 
     data-rsyc-unit-value="Texas"
     data-rsyc-sections="hero,overview,centers,giving"></div>
```

## Section Details

### Hero Section
- Large header with unit name
- Inspiring message (different per unit type)
- Responsive design
- **Customizable**: Unit name comes from data

### Overview Section  
- Statistical dashboard
- 4 key metrics: Centers, Programs, Staff, Youth Served
- Compelling description
- Call-to-action button to explore centers
- **Customizable**: Stats calculated from center data

### Centers Grid
- Card for each center in unit
- Center name, location, phone
- Program count
- Clickable to view center profile
- **Customizable**: Links to center profile system

### Programs Section
- Unique programs across all centers
- Program icons
- Shows up to 8 programs with "more available" indicator
- **Customizable**: Icons and grouping

### Resources Section
- Two-column layout: For Parents / For Youth
- Bulleted lists of key resources
- **Customizable**: Add specific resource links

### Impact Section
- Colored background (teal gradient)
- 3 large metric boxes
- Success story placeholder
- **Customizable**: Metrics, story content

### Giving Section
- Call-to-action section
- Preset donation levels ($25, $50, $100, Custom)
- Each level shows impact (e.g., "Provides supplies for 10 youth")
- **Customizable**: Amounts, impact descriptions, links

### Leaders Section
- Unit leadership information
- Description of leadership approach
- Contact instructions
- **Customizable**: Leader names, bios (enhanced version)

### Contact Section
- Final call-to-action
- 3 buttons: Visit Centers, Support Mission, Learn More
- Social media icons
- **Customizable**: Links, social URLs

## Data Sources

### Centers Data
- **Source**: SharePoint (units-rsyc-profiles.json)
- **Loaded by**: RSYCDataLoader
- **Fields used**:
  - `name` - Center name
  - `division` - Division assignment
  - `state` - State location
  - `city` - City location
  - `areaCommand` / `areaCommandUnit` - Area command assignment
  - `programs` - Array of programs offered
  - `leaders` - Array of leaders
  - `phone` - Contact number
  - `id` - Center ID (links to profile)

### Unit Hierarchy
- **Built by**: RSYCUnitDataLoader
- **Building process**:
  1. Index all centers by organizational attributes
  2. Create unit objects grouping centers
  3. Calculate statistics from center data
  4. Build parent-child relationships
- **Caching**: 1 hour TTL to balance performance with freshness

## Styling & Customization

### CSS Framework
- Bootstrap 5.3
- Custom RSYC styles (rsyc-generator-v2.css)
- Primary color: `#20B3A8` (Salvation Army teal)

### Color Palette
```css
--primary: #20B3A8    (Teal - Primary brand)
--light: #f8f9fa      (Off-white backgrounds)
--dark: #333          (Text)
--gray: #666          (Secondary text)
--success: #28a745    (Green for positive)
--info: #17a2b8       (Light blue)
```

### Custom Styling

**Override colors in your page:**

```html
<style>
  :root {
    --primary-color: #20B3A8;
  }
  
  .rsyc-unit-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
</style>
```

## All Centers Page - Production Implementation

### What Was Built

A complete "All Centers" unit type that displays all 57 Red Shield Youth Centers nationally with:
- **Interactive Card Grid**: CSS Grid layout (3 columns on desktop, responsive on mobile)
- **Center Photos**: Each card uses exterior photo from RSYCHomepagePhotos.json
- **Gradient Overlay**: Semi-transparent gradient with center name, location, "Learn More" link
- **Smart Filtering**: 4 independent filters that work together
- **URL Navigation**: Links to `/redshieldyouth/{center-slug}` pattern

### Changes Made to Core Files

#### rsyc-unit-data.js
- Added `'all': {}` entry to `indexByType` object
- Added `_buildAllUnits(centers)` method that:
  - Creates a single unit containing all 57 centers
  - Enriches each center with photos data from `dataLoader.cache.photos`
  - Calculates statistics (centerCount, etc.)
- Updated `buildUnitHierarchy()` to call `_buildAllUnits()`

#### rsyc-unit-templates.js
- Added special handling in `generateUnitProfile()`:
  - Detects `unit.type === 'all'`
  - Calls new `generateAllCentersGrid()` method instead of regular sections
- Added `generateAllCentersGrid(unit)` method that:
  - Extracts unique filter values from all centers (cities, states, features, programs)
  - Generates filter HTML with 4 dropdowns
  - Generates center cards with:
    - Exterior photo background (or fallback default image)
    - Gradient overlay
    - Center name, city/state
    - "Learn More" link to center URL
  - Includes inline JavaScript for real-time filtering with instant card visibility updates

#### rsyc-data.js
- Added mapping: `areaCommand: getVal(center.field_17)` in `processCenters()`
- Maps SharePoint field_17 to center.areaCommand for area command unit support

#### rsyc-unit-injector.js
- Fixed function call: `_normalizeForId()` instead of `this._normalizeForId()`

### How to Deploy to Production

#### 1. **Upload Files to Server**
Copy these files to your RSYC directory:
- `rsyc-unit-data.js` (updated with _buildAllUnits)
- `rsyc-unit-templates.js` (updated with generateAllCentersGrid)
- `rsyc-data.js` (updated with areaCommand field mapping)
- `rsyc-unit-injector.js` (fixed function call)

#### 2. **Create the All Centers Page**

**Option A: Static HTML Page (Recommended)**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Red Shield Youth Centers</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://thisishoperva.org/rsyc/rsyc-generator-v2.css">
</head>
<body>
    <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
        <h1 style="margin-bottom: 30px; color: #20B3A8;">Red Shield Youth Centers Across America</h1>
        
        <!-- All Centers Grid will load here -->
        <div id="all-centers-page" 
             data-rsyc-unit-type="all" 
             data-rsyc-unit-value="all"></div>
    </div>

    <script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
</body>
</html>
```

**Option B: CMS Integration (Zesty, WordPress, etc.)**
```html
<div id="all-centers-page" 
     data-rsyc-unit-type="all" 
     data-rsyc-unit-value="all"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

#### 3. **URL Routing**

**Create a route for the all-centers page:**

```
/all-centers/
/centers/all/
/explore/centers/
```

(Choose whichever fits your URL structure)

#### 4. **Navigation Integration**

Add link to your main navigation:
```html
<a href="/all-centers/">All Centers</a>
```

#### 5. **Testing Checklist**

- [ ] Page loads without errors (check console with F12)
- [ ] All 57 centers display in the grid
- [ ] City filter shows ~46 options and filters correctly
- [ ] State filter shows 11 options and filters correctly  
- [ ] Facility Features filter shows ~31 options and filters correctly
- [ ] Programs filter shows ~43 options and filters correctly
- [ ] Multiple filters work together (e.g., filter by both State and City)
- [ ] Each center card displays exterior photo or fallback image
- [ ] "Learn More" links navigate to `/redshieldyouth/{center-slug}`
- [ ] Grid is responsive on mobile (1 column), tablet (2 columns), desktop (3 columns)
- [ ] Page loads in under 2 seconds (after initial data fetch)

### URL Slug Generation

The "Learn More" link slugs are generated automatically from center names:

**Examples:**
- "Aiken Teen Center" → `/redshieldyouth/aiken-teen-center`
- "Charleston WV - St Albans" → `/redshieldyouth/charleston-wv-st-albans`
- "Allegany County" → `/redshieldyouth/allegany-county`

**Algorithm:**
1. Convert to lowercase
2. Replace spaces with dashes
3. Collapse multiple consecutive dashes to single dash
4. Remove special characters (keep only alphanumeric and dashes)

**Important**: Ensure these URLs either:
- Redirect to center detail pages using slug-based routing, OR
- Each center has a page at `/redshieldyouth/{slug}/` URL pattern

### Performance Optimization

**For large pages:**
- All filtering happens client-side (no server requests)
- CSS Grid layout is optimized for browser rendering
- Images are lazy-loaded by browser
- Caching enabled (1 hour for unit hierarchy)

**Expected load time:**
- First visit: ~1.5s (data fetching + rendering)
- Subsequent visits: ~100ms (cached data)
- Filter interaction: <10ms (client-side)

### Image Source Priority

The system tries to use photos in this order:
1. **urlExteriorPhoto** (preferred - center exterior/building photo)
2. **urlFacilityFeaturesPhoto** (facility features image)
3. **urlProgramsPhoto** (programs image)
4. **Default**: Salvation Army building image (https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png)

### Troubleshooting Deployment

**Issue**: "Unit not found: all - all"
- **Cause**: Cache might be stale
- **Solution**: Hard refresh page (Ctrl+Shift+R), check console logs

**Issue**: Cards not showing images
- **Cause**: Photos not loaded in data
- **Solution**: Check RSYCHomepagePhotos.json loads (F12 Network tab), fallback should still show

**Issue**: Filters not working
- **Cause**: Filter data attributes not properly set
- **Solution**: Verify JavaScript not throwing errors (check console), filters should still populate

**Issue**: Links go to wrong URL
- **Cause**: Center slug generation issue or routing not configured
- **Solution**: Verify center names in data, test slug generation formula

## Troubleshooting

### "Unit not found" error
- **Cause**: Unit value doesn't match center data
- **Solution**: Check exact spelling in publisher; try different unit type

### Sections not showing
- **Cause**: Section has no data (e.g., no programs for a city)
- **Solution**: Sections automatically hide when empty; this is correct behavior

### Centers not linking to profiles
- **Cause**: Center ID doesn't match
- **Solution**: Verify center data loaded correctly

### Styling issues
- **Cause**: CSS file not loading
- **Solution**: Check path to rsyc-generator-v2.css; ensure CORS headers if cross-domain

### Data loading slowly
- **Cause**: Large dataset being aggregated
- **Solution**: Normal for first load; subsequent loads cached for 1 hour

## Advanced Usage

### Using RSYCUnitDataLoader Directly

```javascript
// Initialize
const dataLoader = new RSYCDataLoader();
const unitDataLoader = new RSYCUnitDataLoader(dataLoader);

// Load data
await dataLoader.loadCriticalData();
await dataLoader.loadOptionalData();

// Build hierarchy
await unitDataLoader.buildUnitHierarchy();

// Get a unit
const unit = unitDataLoader.getUnit('division', 'Texas');

// Get all units of a type
const allStates = unitDataLoader.getUnitsByType('state');

// Get centers in a unit
const txCenters = unitDataLoader.getUnitCenters('division', 'Texas');

// Get statistics
const stats = unitDataLoader.getUnitStats('state', 'North Carolina');
```

### Using RSYCUnitTemplates Directly

```javascript
// Initialize
const templates = new RSYCUnitTemplates();

// Generate full page
const html = templates.generateUnitProfile(unit, ['hero', 'overview', 'centers']);

// Generate single section
const sectionHtml = templates.generateUnitSection('centers', unit);

// Insert into page
document.getElementById('my-container').innerHTML = html;
```

### Manual Unit Page Loading

```javascript
// Load unit page into existing element
RSYCLoadUnitPage('state', 'North Carolina', document.getElementById('unit-container'));

// With configuration
window.RSYCUnitConfig = {
  enabledSections: ['hero', 'overview', 'centers', 'giving']
};
RSYCLoadUnitPage('division', 'Texas', document.getElementById('unit-container'));
```

## Integration with Existing Systems

### Center Profiles (Compatibility)
- ✅ Fully backward compatible
- Unit pages and center profiles are independent systems
- Center links in unit grids properly route to center profiles
- Both systems use same underlying data

### CMS Integration (e.g., Zesty)
- Embed code works in any HTML-capable field
- No conflicts with existing CMS functionality
- Can be used in templates, pages, or custom modules

### Analytics
- Unit page views tracked (if rsyc-tracker.js loaded)
- Center profile views from unit page tracked
- Separate metrics for unit vs center engagement

## Performance Considerations

### Data Loading
- **Critical data**: Centers + Hours (~200-500ms)
- **Optional data**: Programs, staff, photos (~300-500ms additional)
- **Unit building**: Aggregation + indexing (~100-200ms)
- **Template generation**: HTML generation (~50-100ms)
- **Total**: ~500-1500ms first page load, <100ms cached

### Caching Strategy
- Centers cached in RSYCDataLoader (session-based)
- Unit hierarchy cached with 1-hour TTL
- CSS and scripts cached by browser
- Clear cache: `unitDataLoader.clearCache()`

### Optimization Tips
1. Load units asynchronously after page render
2. Use global section configuration to avoid per-page overhead
3. Limit per-page section count
4. Preload common units on homepage

## Future Enhancements

### Planned Features
- [ ] Territory-level pages (group divisions)
- [ ] Custom region groupings
- [ ] Side-by-side unit comparison
- [ ] Year-over-year trend charts
- [ ] Unit-specific analytics dashboard
- [ ] Historical snapshots
- [ ] Social media sharing widgets

### Potential Extensions
- [ ] Mobile app deep linking
- [ ] Email campaign segmentation
- [ ] Volunteer/donor filtering by unit
- [ ] Dynamic resource linking
- [ ] Multilingual support
- [ ] ADA accessibility enhancements

## API Reference

### RSYCUnitDataLoader

```javascript
class RSYCUnitDataLoader {
  constructor(dataLoader)
  
  // Build the hierarchy (call once per session)
  async buildUnitHierarchy()
  
  // Get a specific unit
  getUnit(type, value)
  
  // Get all units of a type
  getUnitsByType(type)
  
  // Get centers in a unit
  getUnitCenters(type, value)
  
  // Get statistics for a unit
  getUnitStats(type, value)
  
  // Clear cache to force rebuild
  clearCache()
}
```

### RSYCUnitTemplates

```javascript
class RSYCUnitTemplates {
  // Generate complete profile
  generateUnitProfile(unit, enabledSections)
  
  // Generate individual section
  generateUnitSection(sectionKey, unit)
  
  // Individual section generators
  generateHero(unit)
  generateOverview(unit)
  generateCenters(unit)
  generatePrograms(unit)
  generateResources(unit)
  generateImpact(unit)
  generateGiving(unit)
  generateLeaders(unit)
  generateContact(unit)
}
```

### Global Functions

```javascript
// Manually load a unit page
RSYCLoadUnitPage(unitType, unitValue, targetElement)
```

## Support & Documentation

- **Architecture**: See [UNIT-PAGES-ARCHITECTURE.md](UNIT-PAGES-ARCHITECTURE.md)
- **Publisher Interface**: Open [rsyc-unit-publisher.html](rsyc-unit-publisher.html)
- **Code Examples**: Browse `rsyc-unit-*.js` files
- **Issues**: Check console (F12) for detailed error messages

## License & Attribution

Part of The Salvation Army's RSYC (Red Shield Youth Center) web system.
Extends existing center profile system while maintaining full compatibility.
