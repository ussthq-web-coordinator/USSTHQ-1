# RSYC Section Configuration Guide

## Overview

The section configuration is now **unified** in `rsyc-cms-publisher.js` under `RSYCPublisher.SECTION_CONFIG`. Both the publisher and injector read from this single source of truth, ensuring changes sync automatically.

## Configuration Location

File: `rsyc-cms-publisher.js` (lines 26-40)

```javascript
SECTION_CONFIG: {
    // Default sections in order
    default: [
        'schedules', 'hours', 'facilities', 'programs', 'staff', 
        'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'
    ],
    
    // Sections that load immediately (critical path - fast rendering)
    critical: ['hours', 'contact'],
    
    // Sections that load asynchronously (deferred path - after initial render)
    deferred: ['schedules', 'facilities', 'programs', 'staff', 'nearby', 'volunteer', 'footerPhoto']
}
```

## How to Change Sections

### 1. Change Section Order
Edit the `default` array in `SECTION_CONFIG`:

```javascript
default: [
    'hours',        // Move hours first
    'contact',      // Move contact second
    'schedules',    // Then schedules
    // ... etc
]
```

### 2. Add a New Section
1. Add it to `default` array
2. Decide if it should be `critical` or `deferred`
3. Create the template method in `rsyc-templates.js`

```javascript
default: [
    'schedules', 'hours', 'facilities', 'programs', 'staff', 
    'nearby', 'parents', 'youth', 'volunteer', 'newSection', 'footerPhoto', 'contact'
],
deferred: ['schedules', 'facilities', 'programs', 'staff', 'nearby', 'volunteer', 'footerPhoto', 'newSection']
```

### 3. Remove a Section
Delete it from `default` and either `critical` or `deferred`:

```javascript
default: [
    'schedules', 'hours', 'facilities', 'programs',  // Removed 'staff'
    'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'
],
deferred: ['schedules', 'facilities', 'programs', 'nearby', 'volunteer', 'footerPhoto']  // Removed 'staff'
```

### 4. Make a Section Load Immediately (Critical Path)
Move it from `deferred` to `critical`:

```javascript
critical: ['hours', 'contact', 'schedules'],  // Added schedules to critical
deferred: ['facilities', 'programs', 'staff', 'nearby', 'volunteer', 'footerPhoto']
```

## Files That Automatically Update

Changes to `SECTION_CONFIG` automatically affect:

1. **rsyc-cms-publisher.js** - Publisher uses `this.SECTION_CONFIG.default`
2. **rsyc-profile-injector.js** - Injector reads:
   - `window.RSYCPublisher.SECTION_CONFIG.critical` for fast render
   - `window.RSYCPublisher.SECTION_CONFIG.deferred` for async load

## Current Section List

| Section | Type | Purpose |
|---------|------|---------|
| `schedules` | Deferred | Program schedules and about center |
| `hours` | Critical | Hours of operation |
| `facilities` | Deferred | Facility features |
| `programs` | Deferred | Featured programs |
| `staff` | Deferred | Staff & leadership (often empty) |
| `nearby` | Deferred | Nearby Salvation Army centers |
| `parents` | Default | For parents section |
| `youth` | Default | For youth section |
| `volunteer` | Deferred | Get involved / volunteer |
| `footerPhoto` | Deferred | Footer photo (often empty) |
| `contact` | Critical | Footer scripture quote |

## Performance Notes

**Critical sections** (render immediately):
- Used for fast First Contentful Paint (FCP)
- Keep small (~2KB total)
- Should be frequently used on every profile

**Deferred sections** (load async):
- Loaded after initial render
- Doesn't block page
- Good for large or optional content

## Testing Changes

1. Edit `SECTION_CONFIG` in `rsyc-cms-publisher.js`
2. Reload the profile publisher page
3. Changes apply to all new profiles
4. No other files need editing!

## Rollback

If sections get out of sync, find the most recent Git commit:
```bash
git log --oneline rsyc-cms-publisher.js | head -5
```

Then restore:
```bash
git checkout <commit-hash> -- rsyc-cms-publisher.js
```
