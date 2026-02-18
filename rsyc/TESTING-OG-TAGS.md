# Testing Open Graph Tags for RSYC Profiles

## Quick Overview

Social media platforms (Facebook, Twitter, LinkedIn) need **Open Graph (OG) tags** to display rich previews when you share a link. These tags are read from the initial HTML page response **before any JavaScript executes**.

## The Two-Part Solution

### Part 1: Embedded Profiles (Dynamic on CMS Pages)
- Located at: `https://southernusa.salvationarmy.org/redshieldyouth/[location]`
- **Share via**: The **Share Buttons** that appear below each profile
- These buttons automatically open the correct preview URL

### Part 2: Preview Pages (Static with OG Tags)
- Located at: `https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=123`
- **What makes it work**: OG tags are in the HTML head before profile renders
- Social media crawlers read these tags from initial response

---

## Step 1: Test with Facebook Debugger

### To Test:
1. Go to: https://developers.facebook.com/tools/debug/og/echo
2. Paste your preview page URL:
   ```
   https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=2
   ```
   *(Replace `2` with actual center ID)*

3. Click **"Debug"** or **"Scrape Again"** button

### What to Look For:
- ✅ **og:title** = `The Salvation Army [Location Name] - Exciting Youth Programs and Community Support`
- ✅ **og:description** = `A safe, welcoming space in [City, State] offering youth programs, activities, mentoring, and community support for kids and teens.`
- ✅ **og:image** = `https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg`
- ✅ **og:image:width** = `1200`
- ✅ **og:image:height** = `630`
- ✅ **og:url** = (should show the center's website or fallback URL)

### What **NOT** to See:
- ❌ BBB seal image
- ❌ Generic "Salvation Army" title
- ❌ Parent domain meta tags

---

## Step 2: Test Share Button Behavior

### From an Embedded Profile (e.g., Shawnee):
1. Click the **Facebook Share Button** (it's below the profile)
2. Facebook Share dialog should open
3. In the dialog, look for the preview thumbnail
   - Should show the center's image (Charlotte image)
   - Should show center-specific title and description

### What the Button Does:
- Automatically constructs: `https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=123`
- Opens Facebook's share dialog pointing to this URL
- Facebook reads the OG tags from that preview page

---

## Step 3: Test with Twitter Card Validator

### To Test:
1. Go to: https://cards-dev.twitter.com/validator
2. Paste your preview page URL
3. Click **"Load"**

### What to Expect:
- Card type: **summary_large_image**
- Image: Center's image (Charlotte)
- Title: Center name with proper formatting
- Description: Center-specific description including city/state

---

## Step 4: Test with LinkedIn

### To Test:
1. Open LinkedIn in a new tab
2. In the compose box, paste your preview URL:
   ```
   https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=2
   ```
3. Click paste and wait ~5 seconds for preview to load

### What to Expect:
- Large thumbnail of the center's image
- Center-specific title
- Center-specific description excerpt

---

## Troubleshooting

### Problem: "Page not found" when accessing preview page
**Solution**: Check that preview page file exists at correct location:
```
/rsyc/rsyc-profile-preview.html
```

### Problem: Facebook/Twitter showing "Unable to fetch page"
**Solution**: 
- Verify domain `https://thisishoperva.org` is publicly accessible from your network
- Check browser console (F12 > Console) for CORS errors
- Try "Scrape Again" button in Facebook Debugger to refresh cache

### Problem: Missing or Wrong Image
**Solution**:
- Verify image URL is publicly accessible: https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg
- Check OG image dimensions (must be 1200x630 minimum)
- Social platforms cache images; wait a few hours or clear cache in debugger

### Problem: Wrong Center Data Showing
**Solution**:
- Verify `centerId` in URL matches actual center ID in data files
- Check browser console (F12 > Console) for any JSON loading errors
- Confirm center exists in `rsyc-data.js` or related data files

### Problem: "BBB Seal" Still Showing on Facebook
**Solution**:
- **This means Facebook is scraping the wrong page**
- Ensure your **share button URL** includes full domain: `https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=X`
- Do NOT test by manually pasting the embedded profile URL (southernusa.salvationarmy.org...) - that has parent page's OG tags
- Test the preview page URL directly instead

---

## Testing Checklist

- [ ] Facebook Debugger shows correct image (not BBB)
- [ ] Facebook Debugger shows correct title (center-specific)
- [ ] Facebook Debugger shows correct description (city/state)
- [ ] Share button on embedded profile opens share dialog with correct preview
- [ ] Twitter Card validator shows summary_large_image format
- [ ] Twitter Card shows correct image and title
- [ ] LinkedIn preview shows center image and title
- [ ] All share platforms show center-specific information (not generic)

---

## Key URLs Reference

| Purpose | URL |
|---------|-----|
| **Preview Page Template** | `https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=2` |
| **Facebook Debugger** | https://developers.facebook.com/tools/debug/og/echo |
| **Twitter Card Validator** | https://cards-dev.twitter.com/validator |
| **LinkedIn** | https://linkedin.com (compose box) |
| **OG Image Source** | `https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg` |

---

## Common Center IDs for Testing

Replace `2` in preview URL with actual center available in your data:
```
https://thisishoperva.org/rsyc/rsyc-profile-preview.html?centerId=2
```

To find valid center IDs:
1. Open your browser developer tools (F12)
2. Go to an embedded profile page
3. In Console, type: `Object.keys(window.rsycCenters || {})` 
4. View the array of available center IDs

---

## How It Works Under the Hood

```
User clicks "Share on Facebook" button
    ↓
Button constructs preview URL with centerId
    ↓
User's browser opens Facebook share dialog
    ↓
Facebook's crawler fetches preview page from thisishoperva.org
    ↓
Crawler reads <meta property="og:*"> tags from HTML head
    ↓
JavaScript hasn't run yet - just parsing HTML
    ↓
Crawler extracts title, image, description from meta tags
    ↓
Facebook displays rich preview in share dialog
    ↓
User can see center image, title, description BEFORE sharing
```

**Note**: Social media crawlers do **NOT** wait for JavaScript. They extract what's in the initial HTML response only.
