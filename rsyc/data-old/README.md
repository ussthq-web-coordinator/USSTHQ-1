# RSYC Data Files

This folder should contain local copies of the JSON data files for development.

## Setup for Local Development

Since the application runs on `localhost` and needs to fetch data from `thisishoperva.org`, you have **3 options**:

### Option 1: Use CORS Proxy (Current Default - No Setup Required)
The app automatically uses `corsproxy.io` when running on localhost. This works out of the box but requires internet connection.

**Pros:** No setup required  
**Cons:** Slower, requires internet, relies on third-party service

### Option 2: Download Data Files Locally (Recommended)
1. Open `download-data.html` from the `thisishoperva.org` domain (not localhost)
2. Click "Download All Files"
3. Save each JSON file to this `data/` folder
4. The app will automatically use local files when available

**Pros:** Faster, works offline, more reliable  
**Cons:** Requires one-time download, needs manual updates

### Option 3: Deploy to Production Domain
Upload the app to `thisishoperva.org/rsyc/` - no CORS issues.

**Pros:** No CORS issues, production-ready  
**Cons:** Requires server access

## Required Files

Place these 7 JSON files in this folder:

- `units-rsyc-profiles.json` (50+ center profiles)
- `RSYCProgramSchedules.json` (program schedules)
- `RSYCLeaders.json` (staff/leaders)
- `RSYCHomepagePhotos.json` (photos)
- `RSYCHours.json` (hours of operation)
- `RSYCFacilityFeatures.json` (31 facility features)
- `RSYCPrograms.json` (48 programs)

## Auto-Detection Logic

The app automatically detects:
1. **If on localhost:** Try local `./data/` files first
2. **If local files fail:** Fall back to CORS proxy
3. **If on production:** Use direct URLs (no CORS issues)

## Updating Data

To refresh data:
1. Delete old JSON files from this folder
2. Run `download-data.html` again to get fresh data
3. OR just rely on CORS proxy for latest data
