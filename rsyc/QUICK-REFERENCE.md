# RSYC CMS Publisher - Quick Reference Card

## 📋 Copy & Paste Embed Code

### For Your CMS Pages at:
- `https://southernusa.salvationarmy.org/redshieldyouth/`
- `https://migration.salvationarmy.org/redshieldyouth/`

---

## ✅ Method 1: Simple (Recommended)

**Copy this to your CMS page** and replace `[CENTER_ID]` with the actual center ID:

```html
<!-- RSYC Center Profile -->
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
        data-center-id="[CENTER_ID]">
</script>
```

**Example:**
```html
<!-- RSYC Center Profile -->
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js" 
        data-center-id="8f4e3d2c-1b5a-4f2e-9c3d-5e8f2a1b4c7d">
</script>
```

---

## ✅ Method 2: JavaScript API

**Use this if you need more control:**

```html
<!-- RSYC Center Profile -->
<div id="rsyc-profile-container"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-cms-publisher.js"></script>
<script>
  RSYCPublisher.generate({
    centerId: '[CENTER_ID]',
    container: '#rsyc-profile-container'
  });
</script>
```

---

## 🔍 Finding Your Center ID

### Option 1: Setup Page (Easiest)
Open: [rsyc-cms-setup.html](http://localhost:3001/rsyc/rsyc-cms-setup.html)
- Select your center
- ID appears in the code

### Option 2: API JSON
Download and search: `https://thisishoperva.org/rsyc/units-rsyc-profiles.json`
- Look for `field_0` value

---

## 📤 Files to Upload

Upload these 2 files to `https://thisishoperva.org/rsyc/`:

1. **rsyc-cms-publisher.js** (main script)
2. **rsyc-data.js** (data loader)

*Note: JSON files should already be there*

---

## 🧪 Testing

1. Add embed code to your CMS page
2. Replace `[CENTER_ID]` with real ID
3. Load the page in browser
4. Open F12 (DevTools) → Console tab
5. Check for errors
6. Profile should appear on page

---

## 📚 Full Documentation

- **Setup & Configuration**: See [CMS-INTEGRATION-README.md](CMS-INTEGRATION-README.md)
- **Deployment Steps**: See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
- **API Reference**: See [CMS-INTEGRATION-README.md#api-reference](CMS-INTEGRATION-README.md)

---

## 🎯 What Gets Displayed

The profile automatically includes:
- ✅ Center name & mission statement
- ✅ Contact information (address, phone, email)
- ✅ Hours of operation
- ✅ Programs offered
- ✅ Staff & leadership
- ✅ Call-to-action for volunteering

All data is pulled **live from the external API** - always current!

---

## ⚡ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Nothing appears | Check center ID is correct |
| Error message | Check F12 console for details |
| 404 on script | Verify files uploaded to `thisishoperva.org` |
| Wrong center | Double-check the center ID |
| Styling looks off | CSS can be customized in your CMS |

---

## 🔗 Key URLs

| Item | URL |
|------|-----|
| **Script** | `https://thisishoperva.org/rsyc/rsyc-cms-publisher.js` |
| **Data Files** | `https://thisishoperva.org/rsyc/` |
| **Setup Page** | `http://localhost:3001/rsyc/rsyc-cms-setup.html` |
| **Southern USA Site** | `https://southernusa.salvationarmy.org/redshieldyouth/` |
| **Migration Site** | `https://migration.salvationarmy.org/redshieldyouth/` |

---

## 💡 Tips

- **Multiple Centers?** Create one section per center with different center IDs
- **Custom Styling?** Override CSS classes like `.rsyc-header`, `.rsyc-section`
- **Mobile Friendly?** Profile is responsive, works on all devices
- **Always Current?** Data updates automatically from external API

---

**Version**: 1.0 | **Date**: February 4, 2026
