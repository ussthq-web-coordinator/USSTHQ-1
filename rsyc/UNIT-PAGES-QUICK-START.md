# RSYC Unit Pages - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### For Texas Division Page
```html
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### For North Carolina State Page
```html
<div data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### For Charlotte City Page
```html
<div data-rsyc-unit-type="city" data-rsyc-unit-value="Charlotte, NC"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### For Area Command Page
```html
<div data-rsyc-unit-type="area-command" data-rsyc-unit-value="Winston-Salem Area Command"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

## 📋 Unit Types & Values

| Type | Examples | Use Case |
|------|----------|----------|
| `division` | Texas, Florida, Georgia, North Carolina | State-level organizational pages |
| `state` | North Carolina, South Carolina, Virginia | Multi-city operations |
| `city` | Charlotte, NC / Raleigh, NC | Local community focus |
| `area-command` | Winston-Salem Area Command | Regional management units |

## 🎨 Sections (In Order)

```
1. hero           - Header with unit name
2. overview       - Statistics dashboard
3. centers        - Grid of all centers
4. programs       - Featured programs
5. resources      - Parent/Youth resources
6. impact         - Growth metrics
7. giving         - Donation options
8. leaders        - Leadership info
9. contact        - Call-to-action
```

## ⚙️ Configuration Examples

### Hide Specific Sections
```html
<script>
  window.RSYCUnitConfig = {
    enabledSections: ['hero', 'overview', 'centers', 'giving']
  };
</script>
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Minimal Page (Just Basics)
```html
<script>
  window.RSYCUnitConfig = {
    enabledSections: ['hero', 'overview', 'centers']
  };
</script>
<div data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Full Page (All Sections)
```html
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
<!-- Uses default: all sections enabled -->
```

## 🏗️ Files Overview

| File | Purpose | Size |
|------|---------|------|
| `rsyc-unit-data.js` | Data aggregation | ~400 lines |
| `rsyc-unit-templates.js` | HTML generation | ~700 lines |
| `rsyc-unit-injector.js` | Page rendering | ~300 lines |
| `rsyc-unit-publisher.html` | Admin interface | ~400 lines |

## 📊 What Each Section Shows

### Hero
- Large header with unit name
- Inspiring message
- Responsive banner

### Overview  
- 4 stat cards
- Unit description
- Button to explore centers

### Centers
- Card grid (responsive)
- Center name, location, phone
- Program count
- Links to center profiles

### Programs
- List of unique programs
- Program icons
- "X more available" if over 8

### Resources
- Parent resources (bullets)
- Youth resources (bullets)
- Family services links

### Impact
- 3 big metric boxes
- Success story section
- Colored background

### Giving
- 4 donation level cards
- Impact per donation level
- Links to donate

### Leaders
- Leadership information
- Contact details
- Description of approach

### Contact
- 3 action buttons
- Social media links
- Final call-to-action

## 🔧 Common Tasks

### Task: Hide "Leaders" Section
```html
<script>
  window.RSYCUnitConfig = {
    enabledSections: ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'contact']
  };
</script>
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Task: Show Only Parent Resources
```html
<script>
  window.RSYCUnitConfig = {
    enabledSections: ['hero', 'overview', 'centers', 'resources']
  };
</script>
<div data-rsyc-unit-type="state" data-rsyc-unit-value="North Carolina"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

### Task: Giving-Focused Page
```html
<script>
  window.RSYCUnitConfig = {
    enabledSections: ['hero', 'impact', 'giving', 'contact']
  };
</script>
<div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
<script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
```

## 🎯 Unit Values by Type

### Divisions (Example)
- Texas
- Florida  
- Georgia
- North Carolina
- Alabama, Louisiana, and Mississippi
- Arkansas and Oklahoma

### States (All 50)
- North Carolina
- South Carolina
- Virginia
- Tennessee
- *etc...*

### Cities (100+)
- Charlotte, NC
- Raleigh, NC
- Greensboro, NC
- Winston-Salem, NC
- *etc...*

### Area Commands
- Winston-Salem Area Command
- Charlotte Area Command
- Raleigh Area Command
- *etc... (varies by division)*

## 📱 Responsive Behavior

```
Desktop (≥992px)  → 3-4 columns, large text
Tablet (≥768px)   → 2-3 columns, medium text
Mobile (<768px)   → 1 column, optimized text
```

## 🐛 Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Unit not found" | Wrong value spelling | Check in publisher or use exact name |
| Sections not showing | Has no data | Normal - empty sections hide |
| Slow loading | First time load | Normal - ~1-2s, then cached |
| Styling issues | CSS not loaded | Check path to rsyc-generator-v2.css |
| Links not working | Center not loaded | Verify center data is present |

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Publisher | `/rsyc/rsyc-unit-publisher.html` |
| Docs | `/rsyc/UNIT-PAGES-README.md` |
| Architecture | `/rsyc/UNIT-PAGES-ARCHITECTURE.md` |
| Source | `/rsyc/rsyc-unit-*.js` |

## 💡 Pro Tips

1. **Test in Publisher First** - See preview before deploying
2. **Use Global Config** - Set once for all pages
3. **Mobile Check** - Always test on phone
4. **Link Colors** - Uses #20B3A8 (Salvation Army teal)
5. **Update Center Data** - Changes reflected automatically

## 📞 Support

- **Error Messages**: Check browser console (F12)
- **Logging**: All logs prefixed with `[RSYCUnitInjector]`
- **Documentation**: See UNIT-PAGES-README.md
- **Questions**: Review UNIT-PAGES-ARCHITECTURE.md

## ✅ Compatibility

- ✅ Works with existing center profiles
- ✅ No breaking changes
- ✅ Mobile responsive
- ✅ All modern browsers
- ✅ Works offline (after first load)

## 🎨 Customization

### Change Primary Color
```html
<style>
  .rsyc-unit-page {
    --primary: #20B3A8;  /* Teal */
  }
</style>
```

### Override Button Style
```html
<style>
  .rsyc-unit-page .btn-primary {
    background-color: #20B3A8 !important;
  }
</style>
```

## 📦 Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salvation Army - Texas Division</title>
  <link rel="stylesheet" href="https://thisishoperva.org/rsyc/rsyc-generator-v2.css">
</head>
<body>
  <div id="texas-page" 
       data-rsyc-unit-type="division" 
       data-rsyc-unit-value="Texas"></div>
  
  <script>
    window.RSYCUnitConfig = {
      enabledSections: ['hero', 'overview', 'centers', 'programs', 'giving', 'contact']
    };
  </script>
  <script src="https://thisishoperva.org/rsyc/rsyc-unit-injector.js"></script>
</body>
</html>
```

## 🚢 Deployment Checklist

- [ ] Test locally with sample data
- [ ] Verify all 4 unit types load
- [ ] Check mobile responsiveness
- [ ] Test links to center profiles
- [ ] Validate embed code
- [ ] Review content for accuracy
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Gather user feedback

---

**Need more help?** See [UNIT-PAGES-README.md](UNIT-PAGES-README.md) or [UNIT-PAGES-ARCHITECTURE.md](UNIT-PAGES-ARCHITECTURE.md)
