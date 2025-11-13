# RSYC Profile Generator

A comprehensive web application for generating HTML profiles for 50+ Red Shield Youth Centers (RSYC) across The Salvation Army's Southern Territory.

## 🎯 Features

### Core Functionality
- **Center Selection**: Browse and search all 50+ RSYC centers organized by division
- **Modular Sections**: Choose from 9 customizable profile sections
- **HTML Generation**: Generate clean, CMS-ready HTML code
- **Live Preview**: Preview generated profiles before publishing
- **Version Tracking**: Track generation history and publication status
- **Copy & Download**: Easy copy-to-clipboard and file download

### Available Profile Sections
1. **Hero Section** - Center name, location, and primary call-to-action
2. **About This Center** - Detailed description and mission
3. **Featured Programs** - Showcase key programs with icons
4. **Program Schedules** - Detailed schedule information
5. **Hours of Operation** - Regular and summer hours
6. **Facility Features** - Available amenities and facilities
7. **Staff & Leadership** - Team member profiles
8. **Volunteer Opportunities** - How to get involved
9. **Contact & Donate** - Contact information and donation links

## 📁 File Structure

```
rsyc/
├── rsyc-profile-generator.html    # Main application interface
├── rsyc-data.js                   # Data loader and cache
├── rsyc-templates.js              # HTML template engine
├── rsyc-tracker.js                # Version tracking system
├── rsyc-generator.js              # Main application controller
└── rsyc-generator.css             # Application styling
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (to fetch data from SharePoint)

### CORS Setup for Local Development

When running on `localhost`, you have **3 options** to handle CORS restrictions:

#### ✅ Option 1: Use CORS Proxy (Default - No Setup Required)
The app automatically uses a CORS proxy when running locally. Just open the file and it works!

**Pros:** Zero setup  
**Cons:** Slower, requires internet

#### ⭐ Option 2: Download Data Files Locally (Recommended)
1. Open `download-data.html` from `thisishoperva.org` domain
2. Click "Download All Files" button
3. Save all 7 JSON files to the `data/` folder
4. The app will automatically use local files

**Pros:** Faster, works offline, more reliable  
**Cons:** One-time setup, manual updates

#### 🚀 Option 3: Deploy to Production
Upload to `thisishoperva.org/rsyc/` - no CORS issues!

### Installation
1. Download all files to your local directory
2. Open `rsyc-profile-generator.html` in your web browser
3. Wait for data to load (should take 5-10 seconds)

### Usage

#### Step 1: Select a Center
- Use the search box to filter centers
- Click on a center from the left panel
- Centers are organized by division

#### Step 2: Choose Sections
- Select which sections to include in the profile
- Use "Select All" or "Clear All" for quick selection
- At least one section must be selected

#### Step 3: Generate HTML
- Click "Generate HTML" button
- View the generated code in the Output panel
- Switch between HTML, Preview, and History tabs

#### Step 4: Use Generated HTML
- **Copy**: Click "Copy to Clipboard" to copy HTML
- **Download**: Save as HTML file for later use
- **Preview**: View rendered HTML before publishing
- **Mark Published**: Track when profiles are published to CMS

## 📊 Data Sources

The application fetches data from the following SharePoint JSON endpoints:

- **Center Profiles**: `units-rsyc-profiles.json` (50+ centers)
- **Program Schedules**: `RSYCProgramSchedules.json`
- **Staff/Leaders**: `RSYCLeaders.json`
- **Photos**: `RSYCHomepagePhotos.json`
- **Hours**: `RSYCHours.json`
- **Facility Features**: `RSYCFacilityFeatures.json` (31 features)
- **Programs**: `RSYCPrograms.json` (48 programs)

All data is cached in memory for fast performance.

## 🔧 Technical Details

### Data Relationships
```
Center (GUID: field_0)
  ↓
  ├─ Program Schedules (Center#Id)
  ├─ Leaders (Center#Id array)
  ├─ Photos (Center#Id)
  ├─ Hours (Center#Id)
  ├─ Facility Features (ID array)
  └─ Programs (ID array)
```

### Version Tracking
- Versions are stored in browser `localStorage`
- Each generation is hashed for change detection
- Tracks up to 10 versions per center
- Identifies centers with unpublished changes

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Template Customization

### Modifying Templates
Edit `rsyc-templates.js` to customize HTML output:

```javascript
// Example: Modify Hero Section
generateHero(data) {
    const { center } = data;
    return `
        <section class="rsyc-hero">
            <!-- Your custom HTML -->
        </section>
    `;
}
```

### Adding New Sections
1. Add section to `sections` object in `RSYCTemplates`
2. Create new `generate[SectionName]` method
3. Add to `methods` object in `generateSection`

### CSS Styling
The generated HTML includes Bootstrap Icons classes. Add your own CSS in your CMS:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
```

## 🎨 Application Styling

The app uses Salvation Army brand colors:
- **Primary Red**: `#C8102E`
- **Navy**: `#003F87`
- **Gold**: `#FDB913`

Customize colors in `rsyc-generator.css` CSS variables:
```css
:root {
    --sa-red: #C8102E;
    --sa-navy: #003F87;
    --sa-gold: #FDB913;
}
```

## 🔍 Troubleshooting

### Data Not Loading
- **CORS Error on localhost?** 
  - The app uses a CORS proxy by default (should work automatically)
  - OR download JSON files locally using `download-data.html`
  - OR deploy to production domain (no CORS issues)
- Check internet connection
- Verify SharePoint URLs are accessible
- Check browser console for specific errors
- Try refreshing the page

### Section Not Appearing
- Verify center has data for that section
- Check console for template errors
- Ensure section is selected in checkboxes

### Copy to Clipboard Not Working
- Grant clipboard permissions in browser
- Use Download option as alternative
- Try different browser

## 📈 Version History Tracking

### Viewing History
1. Select a center
2. Generate HTML
3. Click "History" tab in Output panel
4. View all past generations with timestamps

### Version Indicators
- **Latest Badge**: Most recent generation
- **Published Badge**: Marked as published
- **Updates Badge**: Centers with unpublished changes

### Exporting History
Version history is stored in `localStorage`. To backup:
```javascript
// In browser console
const backup = rsycTracker.exportData();
console.log(JSON.stringify(backup));
```

## 🤝 Support

For issues or questions:
- Check browser console for error messages
- Verify all files are in the same directory
- Ensure internet connection is stable
- Contact IT Web Operations team

## 📄 License

Internal use only - The Salvation Army USA Southern Territory

## 🔄 Updates

To update center data:
1. Refresh the page to fetch latest JSON
2. Data is cached only during current session
3. Clear cache by closing/reopening browser

---

**Created for**: The Salvation Army USA Southern Territory  
**Purpose**: Streamline RSYC profile management and HTML generation  
**Maintained by**: THQ Communications Department
