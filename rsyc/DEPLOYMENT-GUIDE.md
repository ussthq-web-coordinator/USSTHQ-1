# RSYC CMS Publisher - Deployment Guide

## Your Deployment URLs

### Script Hosting
- **Location**: `https://thisishoperva.org/rsyc/`
- **Files to Upload**:
  - `rsyc-cms-publisher.js` → `https://thisishoperva.org/rsyc/rsyc-cms-publisher.js`
  - `rsyc-data.js` → `https://thisishoperva.org/rsyc/rsyc-data.js`

### CMS Pages That Will Load Profiles
- **Southern USA** (Production): `https://southernusa.salvationarmy.org/redshieldyouth/`
- **Migration Site** (Test): `https://migration.salvationarmy.org/redshieldyouth/`

---

## Deployment Steps

### Step 1: Upload Files to thisishoperva.org

Upload these files to `https://thisishoperva.org/rsyc/`:

1. **rsyc-cms-publisher.js** - Main embeddable script
2. **rsyc-data.js** - Data loading utility

The scripts folder should look like:
```
https://thisishoperva.org/rsyc/
├── rsyc-cms-publisher.js
├── rsyc-data.js
├── RSYCPrograms.json (already there)
├── RSYCProgramSchedules.json (already there)
├── RSYCLeaders.json (already there)
├── RSYCHours.json (already there)
├── RSYCFacilityFeatures.json (already there)
└── units-rsyc-profiles.json (already there)
```

### Step 2: Update Your CMS Pages

For **each center page** in your CMS, add this code somewhere in the page (before closing `</body>` tag):

#### Method 1: Simple (Recommended for Static Pages)

```html
<!-- RSYC Center Profile -->
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
        data-center-id="[CENTER_ID_HERE]"
        data-base-url="https://thisishoperva.org/rsyc/">
</script>
```

Replace `[CENTER_ID_HERE]` with the actual center ID.

#### Method 2: JavaScript API (For Dynamic/Conditional Pages)

```html
<!-- RSYC Center Profile -->
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js"></script>
<script>
  RSYCPublisher.generate({
    centerId: '[CENTER_ID_HERE]',  // Replace with center ID
    container: '#rsyc-profile-container',
    baseUrl: 'https://thisishoperva.org/rsyc/'
  });
</script>
```

### Step 3: Find Center IDs

To get the center IDs, use one of these methods:

#### Option A: Setup Page (Easiest)
1. Open: [rsyc-cms-setup.html](http://localhost:3001/rsyc/rsyc-cms-setup.html)
2. Select a center from the list
3. The ID is shown in the code snippets

#### Option B: Direct JSON
Access and search: `https://thisishoperva.org/rsyc/units-rsyc-profiles.json`
Look for the `field_0` value for each center

#### Option C: Common Center IDs
```
Ask your administrator for a list of center IDs for your locations
```

---

## Example CMS Integrations

### WordPress (In Theme or Plugin)

Add to your center page template (`single-center.php`):

```php
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
        data-center-id="<?php echo get_post_meta(get_the_ID(), 'center_id', true); ?>">
</script>
```

Or in a Shortcode:

```php
function rsyc_profile_shortcode($atts) {
    $center_id = isset($atts['id']) ? $atts['id'] : '';
    return '<div id="rsyc-profile-container"></div>
            <script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
                    data-center-id="' . $center_id . '"></script>';
}
add_shortcode('rsyc-profile', 'rsyc_profile_shortcode');
```

Usage: `[rsyc-profile id="center-id-here"]`

### Drupal (In Block or Node Template)

Add to your Twig template:

```twig
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
        data-center-id="{{ node.field_center_id.value }}">
</script>
```

### Joomla (In Custom Module)

```html
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
        data-center-id="<?php echo $this->center_id; ?>">
</script>
```

### Plain HTML (Static Sites)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Center Name - Red Shield Youth</title>
</head>
<body>
    <h1>Center Name</h1>
    
    <!-- RSYC Profile -->
    <div id="rsyc-profile-container"></div>
    <script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
            data-center-id="YOUR_CENTER_ID">
    </script>
</body>
</html>
```

---

## Styling the Profile

The generated profile uses inline CSS. To customize:

### Option 1: Override CSS

Add your own CSS after the profile loads:

```css
.rsyc-profile {
    font-family: 'Your Font';
    /* Your custom styles */
}

.rsyc-header {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
    /* Your custom header styles */
}
```

### Option 2: Edit the Script

Modify `rsyc-cms-publisher.js` - look for the `generateProfileHTML()` function and update the inline styles.

---

## Multiple Centers on One Page

To show multiple center profiles:

```html
<div id="center-1-container"></div>
<div id="center-2-container"></div>

<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js"></script>
<script>
  RSYCPublisher.generate({
    centerId: 'center-1-id',
    container: '#center-1-container'
  });
  
  RSYCPublisher.generate({
    centerId: 'center-2-id',
    container: '#center-2-container'
  });
</script>
```

---

## Testing Before Production

### Test Locations
1. **Migration Site**: `https://migration.salvationarmy.org/redshieldyouth/`
2. **Local Testing**: `http://localhost:3001/rsyc/rsyc-cms-setup.html`

### Checklist
- [ ] Script files uploaded to `https://thisishoperva.org/rsyc/`
- [ ] Embed code added to CMS page
- [ ] Center ID is correct
- [ ] Page loads without console errors (F12 → Console)
- [ ] Profile displays with correct center information
- [ ] All sections render (contact, hours, programs, etc.)
- [ ] Responsive design works on mobile
- [ ] Links and buttons work correctly

### Debugging

If the profile doesn't load:

1. **Check Console** (F12 → Console tab)
   - Look for fetch errors
   - Check for JavaScript errors

2. **Verify URLs**
   - Open `https://thisishoperva.org/rsyc/rsyc-cms-publisher.js` directly
   - Should see JavaScript code, not 404

3. **Verify Center ID**
   - Check that the center ID exists
   - Use the Setup Page to confirm

4. **Network Tab**
   - Open F12 → Network tab
   - Look for failed requests
   - Check CORS headers

---

## File Sizes & Performance

- **rsyc-cms-publisher.js**: ~8KB
- **rsyc-data.js**: ~15KB
- **Total Data Transfer**: ~50-100KB on first load
- **Load Time**: 500-1000ms depending on network

The script caches data in memory, so subsequent profiles load much faster.

---

## Support & Troubleshooting

### Common Issues

**Profile shows "Error Loading Profile"**
- Check browser console for specific error
- Verify center ID is correct
- Ensure network has access to `thisishoperva.org`

**404 on script file**
- Verify files are uploaded to correct location
- Check file names match exactly
- Verify HTTPS is used (not HTTP)

**CORS errors**
- This should not happen if scripts are on same domain
- Check that server has CORS enabled

**Data not loading**
- Verify `https://thisishoperva.org/rsyc/` is accessible
- Check internet/network connection
- Verify external JSON files exist

---

## Contact

For deployment assistance or issues, contact:
- Technical Support: [your-email]
- Script Updates: Check for updates regularly at `https://thisishoperva.org/rsyc/`

---

## Version

**RSYC CMS Publisher v1.0** | Deployed: February 4, 2026
