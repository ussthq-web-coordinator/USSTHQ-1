# RSYC Profile Social Media Sharing Guide

## Overview

The RSYC Profile system now includes full support for sharing center profiles on social media platforms (Facebook, Twitter, LinkedIn) with proper Open Graph (OG) tags and rich previews.

## How It Works

### For Embedded Profiles (CMS Pages)

When you embed a profile using the injector:

```html
<div data-rsyc-center-id="centerId"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-profile-injector.js"></script>
```

The profile loads dynamically, and share buttons appear below the profile. Users can click these buttons to share on:
- **Facebook** - Rich preview with center image, title, and description
- **Twitter** (X) - Card-style preview with image  
- **LinkedIn** - Professional network sharing with details

### For Direct Sharing (Social Media Links)

To share a center profile directly on social media, use the preview page URL:

```
https://yourdomain.com/rsyc/rsyc-profile-preview.html?centerId=123
```

**Why a preview page?**

Social media crawlers (Facebook, Twitter, LinkedIn) **don't execute JavaScript**. They only read the initial HTML. Since the injector dynamically loads profiles via JavaScript, crawlers would miss the OG tags.

The preview page solves this by:
1. Accepting the `centerId` as a URL parameter
2. Rendering the profile with proper OG tags in the initial HTML
3. Ensuring crawlers see the complete metadata before parsing

## OG Tags Included

For each shared profile, the following Open Graph and Twitter Card tags are set:

### Open Graph Tags
- `og:title` - "The Salvation Army [Center Name] - Exciting Youth Programs and Community Support"
- `og:description` - "A safe, welcoming space in [City], [State] offering youth programs, activities, mentoring, and community support for kids and teens."
- `og:image` - High-quality 1200x630px image optimized for social platforms
- `og:image:width` - 1200
- `og:image:height` - 630
- `og:url` - The center's website URL (or redshieldyouth.org as fallback)
- `og:type` - website
- `og:site_name` - Red Shield Youth Centers

### Twitter Card Tags
- `twitter:card` - summary_large_image (shows large image in preview)
- `twitter:title` - Same as og:title
- `twitter:description` - Same as og:description
- `twitter:image` - Same as og:image

## Implementation Details

### In rsyc-profile-injector.js
- Profiles render dynamically when `data-rsyc-center-id` is detected
- Share buttons automatically appear below each profile
- Buttons link to the preview page with the center ID encoded in the URL
- Clicking social buttons opens the native share dialog with the preview URL

### In rsyc-profile-preview.html  
- Accepts `centerId` as URL parameter
- Loads center data from shared JSON files
- Renders profile and OG tags server-side (or on initial page load)
- Social crawlers see OG tags in the initial HTML response
- Users see a complete profile + share options

## Testing Social Sharing

### Facebook
1. Use Facebook's Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Enter the preview URL: `https://yourdomain.com/rsyc/rsyc-profile-preview.html?centerId=123`
3. Verify the image, title, and description appear correctly
4. Click "Scrape Again" to refresh if you made changes

### Twitter
1. Use Twitter's Card Validator: https://cards-dev.twitter.com/validator
2. Enter the preview URL
3. Verify the card type shows "summary_large_image"
4. Check that image and text display properly

### LinkedIn
1. Try pasting the preview URL into a LinkedIn post
2. The rich preview should appear with image and description

## User Workflow

### Embedded Profile Sharing (Standard)
1. User visits CMS page with embedded RSYC profile
2. Profile loads with share buttons visible
3. User clicks Facebook/Twitter/LinkedIn button
4. Native share dialog opens with preview URL
5. User composes post and shares
6. Preview appears on social feed with full OG metadata

### Direct Link Sharing
1. User visits preview page directly: `/rsyc/rsyc-profile-preview.html?centerId=123`
2. Page displays profile + note about sharing
3. User copies URL from browser address bar
4. User pastes into social media
5. Social crawler fetches OG tags from preview page
6. Rich preview appears in feed

## Technical Requirements

For the preview page to work properly:

1. **Path Configuration** - The preview page needs to be accessible at:
   ```
   /rsyc/rsyc-profile-preview.html
   ```

2. **Data Files** - Must have JSON data files accessible:
   - `/rsyc/data/units-rsyc-profiles.json`
   - `/rsyc/data/RSYCSchedules.json`
   - `/rsyc/data/RSYCLeaders.json`
   - And other data files referenced by rsyc-data.js

3. **CORS Headers** (if on different domain):
   ```
   Access-Control-Allow-Origin: *
   ```

4. **Image URL** - The shared image must be publicly accessible:
   ```
   https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg
   ```

## Troubleshooting

### "Image too small" warning on Facebook Debugger
- The image must be at least 1200x600px (we use 1200x630px)
- Image URL must be publicly accessible
- Use Facebook Debugger to clear cache: https://developers.facebook.com/tools/debug/

### "No Twitter Card defined" warnings disappear but preview still missing
- Twitter requires a crawlable HTML page with meta tags
- Make sure meta tags are in the `<head>` section
- Use Twitter Card Validator to check: https://cards-dev.twitter.com/validator

### Preview shows wrong center or generic data
- Verify the `centerId` parameter matches an actual center in the data
- Check browser console for error messages
- Verify data files are loading correctly

### Share buttons don't appear below profile
- The profile must load successfully first
- Check browser console for any JavaScript errors
- Verify the injector script loaded properly

## Future Enhancements

Potential improvements:
1. **Server-Side Rendering (SSR)** - Pre-render profiles on the backend with built-in OG tags
2. **Dynamic Image Generation** - Create center-specific images instead of using a static image
3. **Meta Tag Service** - Use a service like Cloudflare Workers to inject OG tags dynamically
4. **URL Shortener Integration** - Create shorter, shareable URLs with built-in metadata
5. **Social Analytics** - Track shares and engagement per center

## Contact & Support

For issues with OG tags or social sharing:
1. Check the browser console for JavaScript errors
2. Use official debuggers (Facebook, Twitter) to validate
3. Contact the development team with the center ID and error details
