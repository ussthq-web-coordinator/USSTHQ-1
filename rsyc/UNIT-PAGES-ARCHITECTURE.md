# RSYC Unit Pages Architecture

## Overview
Extends the RSYC system to support organizational hierarchy pages beyond individual center profiles. Enables aggregated views for Division, State, City, and Area Command Unit hierarchies.

## System Components

### 1. **rsyc-unit-data.js** (Data Aggregation Layer)
- **Purpose**: Load and organize centers by organizational hierarchy
- **Hierarchy Levels**: Division → State → City → Area Command Unit
- **Functions**:
  - Load centers from existing RSYC data
  - Index centers by organizational attributes
  - Group centers by unit level
  - Calculate unit statistics (center count, program count, etc.)
  - Build parent-child relationships

### 2. **rsyc-unit-templates.js** (Rendering Layer)
- **Purpose**: Generate HTML for unit aggregation pages
- **Sections** (geared toward parents, youth, donors):
  - **Hero Section**: Unit name, overview, inspiring messaging
  - **Unit Overview**: Statistical dashboard (centers, programs, youth served)
  - **Centers Grid**: Interactive cards with each center's key info
  - **Featured Programs**: Cross-center programs relevant to this unit
  - **Resources**: Parents guides, youth opportunities, volunteer info
  - **Impact Stories**: Growth metrics, testimonials, community impact
  - **Giving**: Donation opportunities for this unit
  - **Leaders**: Unit commanders and administrators
  - **Footer**: Contact, navigation

### 3. **rsyc-unit-injector.js** (Client-Side Rendering)
- **Purpose**: Load and inject unit pages into existing divs
- **Usage**:
  ```html
  <div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
  <div data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>
  <div data-rsyc-unit-type="city" data-rsyc-unit-value="Charlotte, NC"></div>
  <div data-rsyc-unit-type="area-command" data-rsyc-unit-value="Winston-Salem Area Command"></div>
  ```

### 4. **rsyc-unit-publisher.html** (Publishing Interface)
- **Purpose**: Build and preview unit pages
- **Features**:
  - Select unit type and value
  - Configure sections per unit
  - Preview page
  - Generate embed code
  - Deploy to production

## Data Structure

### Unit Object
```javascript
{
  type: 'division|state|city|area-command',
  value: 'Texas|North Carolina|Charlotte, NC|Winston-Salem Area Command',
  displayName: 'Texas Division',
  centers: [/* array of center objects */],
  stats: {
    centerCount: 12,
    programCount: 48,
    youthServed: 2500,
    yearsOfService: 145
  },
  parent: {
    type: 'division',
    value: 'Southern Territory'
  },
  children: [
    { type: 'area-command', value: '...' },
    { type: 'state', value: '...' }
  ]
}
```

### Center Reference
```javascript
{
  id: 'center-id',
  name: 'Winston-Salem Youth Center',
  division: 'North Carolina',
  state: 'North Carolina',
  city: 'Winston-Salem',
  areaCommand: 'Winston-Salem Area Command',
  programs: [],
  contact: {}
}
```

## Section Configuration

Unit pages follow center profile patterns but with aggregated content:

```javascript
const unitSections = {
  'hero': { name: 'Hero Section', enabled: true, order: 1 },
  'overview': { name: 'Unit Overview', enabled: true, order: 2 },
  'centers': { name: 'Centers in This Unit', enabled: true, order: 3 },
  'programs': { name: 'Featured Programs', enabled: true, order: 4 },
  'resources': { name: 'Resources', enabled: true, order: 5 },
  'impact': { name: 'Impact & Growth', enabled: true, order: 6 },
  'giving': { name: 'Give to This Unit', enabled: true, order: 7 },
  'leaders': { name: 'Leadership', enabled: true, order: 8 },
  'contact': { name: 'Contact & Learn More', enabled: true, order: 9 }
};
```

## Configuration

### Enable/Disable Unit Pages
```javascript
window.RSYCUnitConfig = {
  enabled: true,
  hierarchyLevels: ['division', 'state', 'city', 'area-command'],
  enabledSections: ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'leaders', 'contact'],
  centersPerRow: {
    desktop: 3,
    tablet: 2,
    mobile: 1
  }
};
```

### Per-Unit Customization
```html
<div 
  data-rsyc-unit-type="state"
  data-rsyc-unit-value="North Carolina"
  data-rsyc-sections="hero,overview,centers,giving"
  data-rsyc-centers-per-row="4"
></div>
```

## Compatibility

### ✅ Backward Compatible
- Existing center profiles (rsyc-profile-injector.js) work unchanged
- All center profile code remains intact
- New unit pages are separate parallel system
- Same data loader (RSYCDataLoader) powers both

### ✅ Shared Components
- RSYCTemplates base styling
- Modal system
- Data processing utilities
- CSS framework (Bootstrap, custom RSYC styles)

### ✅ Enhanced Reuse
- Unit templates inherit center profile styling
- Unit modals use same system as schedule modals
- Tracking system monitors both center and unit page views

## Usage Examples

### Example 1: Texas Division Page
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/rsyc/rsyc-generator-v2.css">
</head>
<body>
  <div id="texas-division-page" data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
  
  <script src="/rsyc/rsyc-unit-injector.js"></script>
  <script>
    window.RSYCUnitConfig = {
      enabledSections: ['hero', 'overview', 'centers', 'programs', 'giving']
    };
  </script>
</body>
</html>
```

### Example 2: North Carolina State Page
```html
<div id="nc-state-page" data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>
<script src="/rsyc/rsyc-unit-injector.js"></script>
```

### Example 3: Charlotte City Page
```html
<div id="charlotte-city-page" data-rsyc-unit-type="city" data-rsyc-unit-value="Charlotte, NC"></div>
<script src="/rsyc/rsyc-unit-injector.js"></script>
```

### Example 4: Area Command Page
```html
<div id="ac-page" data-rsyc-unit-type="area-command" data-rsyc-unit-value="Winston-Salem Area Command"></div>
<script src="/rsyc/rsyc-unit-injector.js"></script>
```

## Content Strategy

### For Parents
- Programs available in this unit for children/youth
- Schedules and registration links
- Facility features and amenities
- Family resources and support services

### For Youth
- Youth programs and activities
- Summer camps and events
- Mentorship opportunities
- Leadership development

### For Donors
- Unit impact metrics (youth served, programs, financial need)
- Success stories and testimonials
- Giving opportunities and levels
- Financial transparency

### General
- Inspiration and hope messaging
- Growth metrics (year-over-year, multi-year trends)
- Community involvement
- Leadership and vision

## File Dependencies

### Load Order
1. `rsyc-data.js` - Core data loader
2. `rsyc-unit-data.js` - Unit aggregation layer
3. `rsyc-templates.js` - Base templates
4. `rsyc-unit-templates.js` - Unit-specific templates
5. `rsyc-unit-injector.js` - Client-side rendering

### Standalone Usage
Unit pages can work independently or alongside center profiles:
- Unit pages can exist on separate domains
- No shared state between unit and center systems
- Both systems use same underlying data

## Future Enhancements

1. **Territory Pages** - Group divisions by territory
2. **Region Pages** - Custom groupings
3. **Dynamic Benchmarking** - Compare units side-by-side
4. **Historical Tracking** - Year-over-year comparisons
5. **Advanced Analytics** - Unit-level analytics dashboard
6. **Mobile App Integration** - Deep linking from mobile apps
7. **Social Media Widgets** - Shareable social content for units
8. **Email Campaigns** - Segment donors/volunteers by unit

## Notes

- All existing center profile functionality remains unchanged
- Unit pages inherit styling and patterns from center profiles
- Data is loaded once and indexed multiple ways for efficiency
- Sections can be enabled/disabled per unit or globally
- Mobile-responsive design consistent with center profiles
