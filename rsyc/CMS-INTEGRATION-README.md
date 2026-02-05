# RSYC CMS Publisher Integration Guide

## Overview

The RSYC CMS Publisher allows you to integrate dynamic RSYC (Salvation Army Regional Youth Center) profiles into your CMS. When a center page loads, it automatically fetches data from the external RSYC API and generates a professional profile page without requiring any database integration.

## Features

- 🚀 **Zero Database Integration**: All data pulled from external APIs in real-time
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- ⚡ **Lightweight**: Minimal JavaScript footprint
- 🔄 **Real-time Updates**: Always displays current data from source
- 🎨 **Customizable**: Easy to adapt styling to your CMS
- 📦 **Single File**: Just one script to include

## Files

- **rsyc-cms-publisher.js** - Main embeddable script (lightweight, production-ready)
- **rsyc-cms-setup.html** - Setup/configuration page for generating embed codes
- **rsyc-data.js** - Data loader utility (used by setup page)

## Quick Start

### Step 1: Copy Files to Your Server

Upload these files to your web server:
- `rsyc-cms-publisher.js`
- `rsyc-data.js` (required by setup page)

Example path: `https://yourdomain.com/rsyc/rsyc-cms-publisher.js`

### Step 2: Open Setup Page

1. Open [rsyc-cms-setup.html](rsyc-cms-setup.html) in your browser
2. Select the center you want to configure
3. Copy the generated embed code
4. Paste into your CMS page template

### Step 3: Add to Your CMS

For each center's page, add:

```html
<div id="rsyc-profile-container"></div>
<script src="https://yourdomain.com/rsyc/rsyc-cms-publisher.js" 
        data-center-id="CENTER_ID_HERE"
        data-base-url="https://thisishoperva.org/rsyc/">
</script>
```

Replace `CENTER_ID_HERE` with the actual center ID (visible in the setup page).

## Integration Methods

### Method 1: Automatic (Recommended)

Best for static CMS pages. The script auto-runs on page load.

```html
<div id="rsyc-profile-container"></div>
<script src="https://yourdomain.com/rsyc/rsyc-cms-publisher.js" 
        data-center-id="8f4e3d2c-1b5a-4f2e-9c3d-5e8f2a1b4c7d"
        data-base-url="https://thisishoperva.org/rsyc/">
</script>
```

**Attributes:**
- `data-center-id` - Required. The center's unique identifier
- `data-base-url` - Optional. External API base URL (default shown)
- `data-container` - Optional. Target element ID (default: `rsyc-profile-container`)

### Method 2: JavaScript API

Best for dynamic content or complex CMS pages.

```html
<div id="rsyc-profile-container"></div>
<script src="https://yourdomain.com/rsyc/rsyc-cms-publisher.js"></script>
<script>
  // Call after page elements are ready
  RSYCPublisher.generate({
    centerId: '8f4e3d2c-1b5a-4f2e-9c3d-5e8f2a1b4c7d',
    container: '#rsyc-profile-container',
    baseUrl: 'https://thisishoperva.org/rsyc/'
  });
</script>
```

## API Reference

### RSYCPublisher.generate(options)

Generate and display a center profile.

**Parameters:**

```javascript
{
  centerId: 'string',           // Required. Center ID
  container: 'selector|element', // Optional. CSS selector or DOM element (default: '#rsyc-profile-container')
  baseUrl: 'string',            // Optional. API base URL (default: 'https://thisishoperva.org/rsyc/')
  sections: Array<string>       // Optional. Specific sections to display
}
```

**Supported Sections:**
- `schedules` - Program schedules
- `hours` - Hours of operation
- `facilities` - Facility features
- `programs` - Available programs
- `staff` - Staff and leadership
- `nearby` - Nearby centers
- `parents` - For parents section
- `youth` - For youth section
- `volunteer` - Get involved / volunteer
- `contact` - Contact information (default included)

**Example with Custom Sections:**

```javascript
RSYCPublisher.generate({
  centerId: '8f4e3d2c-1b5a-4f2e-9c3d-5e8f2a1b4c7d',
  container: '#profile',
  sections: ['contact', 'hours', 'programs', 'staff', 'volunteer']
});
```

**Returns:** Promise that resolves to the center object

**Example:**

```javascript
RSYCPublisher.generate({
  centerId: 'center-id-here'
}).then(center => {
  console.log('Profile generated for:', center.name);
}).catch(error => {
  console.error('Error:', error);
});
```

## CMS Integration Examples

### WordPress

1. Create a custom template file: `templates/center-profile.php`
2. Add to the template:

```php
<div id="rsyc-profile-container"></div>
<script>
  var centerId = '<?php echo get_post_meta(get_the_ID(), 'center_id', true); ?>';
  var scriptTag = document.createElement('script');
  scriptTag.src = '<?php echo get_template_directory_uri(); ?>/rsyc/rsyc-cms-publisher.js';
  scriptTag.setAttribute('data-center-id', centerId);
  document.body.appendChild(scriptTag);
</script>
```

### Shopify Liquid

```liquid
<div id="rsyc-profile-container"></div>
<script>
  var centerId = '{{ page.metafields.center.id }}';
  var scriptTag = document.createElement('script');
  scriptTag.src = '{{ "rsyc-cms-publisher.js" | asset_url }}';
  scriptTag.setAttribute('data-center-id', centerId);
  document.body.appendChild(scriptTag);
</script>
```

### Drupal

1. Create a custom Twig template
2. Include:

```twig
<div id="rsyc-profile-container"></div>
<script>
  RSYCPublisher.generate({
    centerId: '{{ node.field_center_id.value }}',
    container: '#rsyc-profile-container'
  });
</script>
```

## Getting Center IDs

1. Open the **Setup Page** (rsyc-cms-setup.html)
2. Look for the center you want in the list
3. The ID is shown as `CODE: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
4. Copy the ID and use it in your embed code

Alternatively, all center IDs are available in the external JSON file:
`https://thisishoperva.org/rsyc/units-rsyc-profiles.json`

## Styling & Customization

The generated profile uses inline styles for compatibility. To customize the appearance:

### Option 1: Override with CSS

Create a CSS file and override the classes:

```css
.rsyc-profile { /* Overall container */ }
.rsyc-header { /* Header section */ }
.rsyc-section { /* Content sections */ }
.rsyc-contact { /* Contact info */ }
.rsyc-hours { /* Hours section */ }
.rsyc-programs { /* Programs section */ }
.rsyc-staff { /* Staff section */ }
.rsyc-volunteer { /* Volunteer section */ }
```

### Option 2: Modify the Script

Edit `rsyc-cms-publisher.js` and update the `generateProfileHTML()` method to match your CMS styling.

## Troubleshooting

### Profile Not Loading

**Check the browser console** for errors:

```javascript
// Open DevTools (F12) and check the Console tab
```

**Common issues:**

1. **404 on rsyc-cms-publisher.js**
   - Verify the script URL is correct
   - Check server permissions

2. **CORS errors**
   - The script handles CORS automatically
   - Ensure your server can make outbound HTTPS requests

3. **Invalid Center ID**
   - Verify the center ID from the Setup Page
   - IDs are case-sensitive

4. **Data not loading**
   - Check that `https://thisishoperva.org/rsyc/` is accessible
   - Verify internet connection

### Debugging

Enable verbose logging by modifying the script:

```javascript
// In your page, before the script tag:
window.RSYCPublisherDebug = true;

// Then load the script as normal
```

## Performance

- **First Load**: ~500-800ms (depends on data size and network)
- **Subsequent Loads**: Cached in memory, near-instant
- **File Size**: ~8KB uncompressed (rsyc-cms-publisher.js)

The script uses fetch API with `no-cache` to always get fresh data.

## Security

- ✅ No sensitive data stored locally
- ✅ HTTPS only communication
- ✅ No form submissions or data collection
- ✅ Read-only data display
- ✅ No cookies or tracking

## Support

For issues or questions:

1. Check the browser console for errors
2. Review this documentation
3. Open the Setup Page to verify center data
4. Check network requests in DevTools Network tab

## License

RSYC CMS Publisher is proprietary software. Use only as authorized.

## Version History

### v1.0.0 (2026-02-04)
- Initial release
- Support for all major center data
- Automatic and API-based integration methods
- Responsive design
