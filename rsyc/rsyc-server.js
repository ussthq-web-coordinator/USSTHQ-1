// RSYC Profile Publisher Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files from parent directory (allows access to rsyc and data folders)
app.use(express.static(path.join(__dirname, '..')));

// Cache for loaded data to avoid repeated fetches
let dataCache = {
    centers: null,
    schedules: null,
    leaders: null,
    photos: null,
    hours: null,
    facilities: null,
    programs: null,
    lastUpdated: null
};

/**
 * Fetch JSON from external API
 */
async function fetchExternalJSON(filename) {
    return new Promise((resolve, reject) => {
        const baseURL = 'https://thisishoperva.org/rsyc/';
        const url = baseURL + filename;
        
        console.log(`[API] Fetching: ${filename}`);
        
        const request = https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`[API] ✅ Loaded ${filename}`);
                    resolve(json);
                } catch (e) {
                    reject(new Error(`Failed to parse ${filename}: ${e.message}`));
                }
            });
        });
        
        request.on('error', reject);
    });
}

/**
 * Load all data needed for profile generation
 */
async function loadAllData() {
    // If cache is fresh (within last 5 minutes), use it
    if (dataCache.centers && dataCache.lastUpdated && Date.now() - dataCache.lastUpdated < 5 * 60 * 1000) {
        console.log('[API] Using cached data');
        return dataCache;
    }
    
    console.log('[API] Loading data from external API...');
    
    try {
        const [centers, schedules, leaders, photos, hours, facilities, programs] = await Promise.all([
            fetchExternalJSON('units-rsyc-profiles.json'),
            fetchExternalJSON('RSYCProgramSchedules.json'),
            fetchExternalJSON('RSYCLeaders.json'),
            fetchExternalJSON('RSYCHomepagePhotos.json').catch(() => []),
            fetchExternalJSON('RSYCHours.json'),
            fetchExternalJSON('RSYCFacilityFeatures.json'),
            fetchExternalJSON('RSYCPrograms.json')
        ]);
        
        // Update cache
        dataCache = {
            centers: processCenters(centers),
            schedules: processSchedules(schedules),
            leaders: processLeaders(leaders),
            photos: processPhotos(photos),
            hours: processHours(hours),
            facilities: processFacilities(facilities),
            programs: processPrograms(programs),
            lastUpdated: Date.now()
        };
        
        console.log('[API] ✅ Data loaded and processed');
        return dataCache;
    } catch (error) {
        console.error('[API] ❌ Error loading data:', error.message);
        throw error;
    }
}

/**
 * Process functions (matching rsyc-data.js logic)
 */
function processCenters(data) {
    return data.map(center => ({
        Id: center.field_0,
        id: center.field_0,
        Title: center.Title,
        name: center.field_1,
        shortName: center.Title,
        division: center.field_6,
        city: center.field_12,
        state: center.field_13,
        zip: center.field_14,
        address: center.field_3,
        phone: center.field_20,
        email: center.field_2,
        website: center.field_21,
        missionStatement: center.field_11 || '',
        lat: center.field_15,
        lng: center.field_16
    }));
}

function processSchedules(data) {
    return data.map(s => ({
        id: s.ID,
        centerId: s['Center#Id'],
        title: s.CustomProgramScheduleTitle || s.Title,
        description: s.Narrative || '',
        days: s.ScheduleDays ? s.ScheduleDays.map(d => d.Value) : []
    }));
}

function processLeaders(data) {
    return data.map(l => ({
        id: l.ID,
        centerIds: Array.isArray(l['Center#Id']) ? l['Center#Id'] : [l['Center#Id']],
        name: l.PositionTitle || '',
        role: l.RoleType ? l.RoleType.Value : ''
    }));
}

function processPhotos(data) {
    return data.map(p => ({
        id: p.ID,
        centerId: p['Center#Id'],
        exterior: p.URLExteriorPhoto || ''
    }));
}

function processHours(data) {
    return data.map(h => ({
        id: h.ID,
        centerId: h['Center#Id'],
        monday: h.MondayRegularHours || '',
        tuesday: h.TuesdayRegularHours || '',
        wednesday: h.WednesdayRegularHours || '',
        thursday: h.ThursdayRegularHours || '',
        friday: h.FridayRegularHours || '',
        saturday: h.SaturdayRegularHours || '',
        sunday: h.SundayRegularHours || ''
    }));
}

function processFacilities(data) {
    return data.map(f => ({
        id: f.ID,
        name: f.Title,
        icon: f.IconClass || 'bi-check-circle'
    }));
}

function processPrograms(data) {
    return data.map(p => ({
        id: p.ID,
        name: p.Title,
        icon: p.IconClass || 'bi-activity'
    }));
}

// CORS Proxy for external RSYC data
app.get('/api/cors-proxy', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    console.log(`[PROXY] Fetching: ${url}`);
    
    try {
        const protocol = url.startsWith('https') ? https : http;
        const request = protocol.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`[PROXY] Success: ${url}`);
                    res.json(json);
                } catch (e) {
                    console.error(`[PROXY] JSON parse error: ${url}`, e.message);
                    res.status(500).json({ error: 'Invalid JSON response', details: e.message });
                }
            });
        });
        request.on('error', (error) => {
            console.error(`[PROXY] Request error for ${url}:`, error.message);
            res.status(500).json({ error: 'Proxy request failed', details: error.message });
        });
    } catch (error) {
        console.error(`[PROXY] Error: ${url}`, error.message);
        res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'rsyc-profile-publisher' });
});

/**
 * API Endpoint: Generate Profile HTML
 * GET /api/generate-profile?centerId=xxx&sections=schedules,hours,contact
 * POST /api/generate-profile with JSON body
 */
app.post('/api/generate-profile', async (req, res) => {
    try {
        const { centerId, sections } = req.body;
        
        if (!centerId) {
            return res.status(400).json({ error: 'Missing centerId parameter' });
        }
        
        console.log(`[GENERATE] Generating profile for center: ${centerId}`);
        
        // Load all data
        const data = await loadAllData();
        
        // Find center
        const center = data.centers.find(c => c.Id === centerId);
        if (!center) {
            return res.status(404).json({ error: `Center not found: ${centerId}` });
        }
        
        // Get enabled sections (default to key sections if not specified)
        const enabledSections = sections && Array.isArray(sections) ? sections : [
            'hero',
            'about', 
            'schedules',
            'hours',
            'facilities',
            'programs',
            'staff',
            'nearby',
            'volunteer',
            'footerPhoto',
            'contact'
        ];
        
        // Build center data object matching rsyc-data.js structure
        const centerData = buildCenterData(center, data);
        
        // Generate HTML using ACTUAL section generators from rsyc-templates pattern
        const html = generateFullProfileWithSections(centerData, enabledSections);
        
        res.json({
            success: true,
            centerId,
            centerName: center.name,
            sections: enabledSections,
            html,
            size: Math.round(html.length / 1024) + ' KB'
        });
        
    } catch (error) {
        console.error('[GENERATE] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Build complete center data structure matching rsyc-data.js format
 */
function buildCenterData(center, data) {
    return {
        center,
        schedules: data.schedules.filter(s => s.centerId === center.Id),
        leaders: data.leaders.filter(l => l.centerIds && l.centerIds.includes && l.centerIds.includes(center.Id)),
        photos: data.photos.filter(p => p.centerId === center.Id),
        hours: data.hours.find(h => h.centerId === center.Id),
        facilityFeatures: (center.facilities || []),
        programDetails: (center.programs || []),
        facilityDetails: []
    };
}

/**
 * Generate full profile with all enabled sections
 */
function generateFullProfileWithSections(centerData, enabledSections) {
    const sections = [];
    
    // Generate each enabled section
    enabledSections.forEach(sectionKey => {
        try {
            let sectionHTML = '';
            
            switch(sectionKey) {
                case 'hero':
                    sectionHTML = generateHero(centerData);
                    break;
                case 'about':
                    sectionHTML = generateAbout(centerData);
                    break;
                case 'schedules':
                    sectionHTML = generateSchedules(centerData);
                    break;
                case 'hours':
                    sectionHTML = generateHours(centerData);
                    break;
                case 'facilities':
                    sectionHTML = generateFacilities(centerData);
                    break;
                case 'programs':
                    sectionHTML = generatePrograms(centerData);
                    break;
                case 'staff':
                    sectionHTML = generateStaff(centerData);
                    break;
                case 'nearby':
                    sectionHTML = generateNearby(centerData);
                    break;
                case 'volunteer':
                    sectionHTML = generateVolunteer(centerData);
                    break;
                case 'footerPhoto':
                    sectionHTML = generateFooterPhoto(centerData);
                    break;
                case 'contact':
                    sectionHTML = generateContact(centerData);
                    break;
            }
            
            if (sectionHTML && sectionHTML.trim()) {
                sections.push(sectionHTML);
            }
        } catch (e) {
            console.warn(`[GENERATE] Section ${sectionKey} failed:`, e.message);
        }
    });
    
    const html = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
<div class="rsyc-profile">${sections.join('\n\n')}</div>`;
    
    return html;
}

/**
 * Hero Section - Matches Publisher Format
 */
function generateHero(data) {
    const { center, photos } = data;
    const centerPhoto = photos && photos.length > 0 && photos[0].exterior ? photos[0].exterior : 'https://via.placeholder.com/1200x300?text=' + encodeURIComponent(center.name);
    
    return `<!-- Hero Section -->
<div class="mt-5 d-flex justify-content-center">
    <div style="max-width:800px;width:100%;">
        <img src="${centerPhoto}" alt="${escapeHTML(center.name)} Exterior" 
             class="img-fluid" style="width: 100%; height: 400px; border-radius: 12px; object-fit: cover; object-position: center;">
    </div>
</div>

<div class="mt-3 d-flex justify-content-center mb-5">
    <div class="schedule-card w-100 text-dark" style="max-width:800px;width:100%;padding:1.5rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <h2 class="fw-bold mb-3 text-center">About This <em>Center</em></h2>
        <p class="text-center mb-3"><strong>The Salvation Army Red Shield Youth Center of ${escapeHTML(center.city)}</strong></p>
        <div class="about-content" style="font-family: inherit; font-size: 1rem; line-height: 1.6;">
            <p>${escapeHTML(center.missionStatement || 'The Red Shield Youth Center provides a safe, supportive, and engaging environment where children can learn, grow, and thrive through mentoring, recreation, and enrichment programs.')}</p>
        </div>
    </div>
</div>`;
}

/**
 * About Section
 */
function generateAbout(data) {
    const { center, photos } = data;
    const aboutImage = photos && photos.length > 1 && photos[1].exterior ? photos[1].exterior : 'https://via.placeholder.com/1200x400?text=About';
    
    return `<!-- About Section -->
<section class="freeTextArea section u-positionRelative u-sa-whiteBg">
    <div class="container" style="padding: 40px 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
            <div><img src="${aboutImage}" alt="About" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"></div>
            <div>
                <h2 style="font-size: 32px; color: #1a4d7f; margin: 0 0 20px 0; font-weight: bold;">About This <span style="color: #17a2b8;">Center</span></h2>
                <p style="font-size: 16px; color: #666; line-height: 1.8; margin: 0 0 15px 0;">${escapeHTML(center.missionStatement || 'We serve our community with compassion and care.')}</p>
                <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0;">Located in ${escapeHTML(center.city)}, ${escapeHTML(center.state)}, we provide youth development, social services, and community support.</p>
            </div>
        </div>
    </div>
</section>`;
}

/**
 * Schedules Section - Matches Publisher Format with Modals
 */
function generateSchedules(data) {
    const { schedules, center } = data;
    if (!schedules || schedules.length === 0) return '';
    
    const scheduleCards = schedules.slice(0, 8).map((schedule, idx) => `
<div class="schedule-card text-dark d-flex flex-column h-100" style="min-width:230px;padding:1rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <h5 class="fw-bold mb-1">${escapeHTML(schedule.title || 'Program')}</h5>
    ${schedule.subtitle ? `<div class="text-muted small mb-1">${escapeHTML(schedule.subtitle)}</div>` : ''}
    <p class="mb-0">
        ${schedule.days ? `<strong>Days:</strong> <span class="d-inline-block">${escapeHTML(schedule.days.join(', '))}</span><br>` : ''}
        ${schedule.time ? `<strong>Time:</strong> ${escapeHTML(schedule.time)}<br>` : ''}
        <strong>Active:</strong> ${escapeHTML(schedule.months || 'Year-round')}
    </p>
    <div class="mt-2">
        <button class="btn btn-outline-primary" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;" onclick="showRSYCModal('schedule-${idx}', '${escapeHTML(schedule.title || 'Program')}')">
            View Full Details
        </button>
    </div>
</div>`).join('');

    const modals = schedules.slice(0, 8).map((schedule, idx) => `
<div id="rsyc-modal-schedule-${idx}" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>${escapeHTML(schedule.title || 'Program')}</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('schedule-${idx}')">&times;</button>
        </div>
        <div class="rsyc-modal-body" style="color:#333;">
            ${schedule.description ? `<div class="mb-4"><div style="font-size:1rem; line-height:1.6; color:#333;">${schedule.description}</div></div>` : ''}
            <div class="row">
                ${schedule.days ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${escapeHTML(schedule.days.join(', '))}</div>` : ''}
                ${schedule.time ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${escapeHTML(schedule.time)}</div>` : ''}
                <div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time Zone:</strong><br>Eastern/America/New York</div>
                ${schedule.months ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Active:</strong><br>${escapeHTML(schedule.months)}</div>` : ''}
            </div>
        </div>
    </div>
</div>`).join('');
    
    return `<!-- Program Schedules -->
<div id="freeTextArea-schedules" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="my-5">
                <h2 class="fw-bold mb-4 text-center">Program <em style="color:#20c997;">Schedule</em></h2>
                
                <div class="schedule-scroll-wrapper">
                    <p class="text-center mb-n2">
                        <small class="text-light">
                            Scroll to view more 
                            <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                        </small>
                    </p>
                    <div class="horizontal-scroll " style="display:flex;gap:1rem;overflow-x:auto;overflow-y:visible;padding-bottom:0.5rem;align-items:stretch;">
                        ${scheduleCards}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
${modals}`;
}

/**
 * Hours of Operation - Matches Publisher Format
 */
function generateHours(data) {
    const { hours } = data;
    if (!hours) return '';
    
    return `<!-- Hours of Operation -->
<div class="section operationHoursAdvanced-container">
    <div class="container">
        <div id="operationHoursAdvanced-1770250585948" class="operationHoursAdvanced-featured">
            <div class="operationHoursAdvanced-head" style="background-image:url(https://s3.amazonaws.com/uss-cache.salvationarmy.org/cf37a78a-dde2-45fb-8f51-3440812a0bc1_School+Books+Background.jpg); height:120px;"></div>
            <div class="operationHoursAdvanced-body">
                <div class="operationHoursAdvanced-title" onclick="symphony.expandOperationHours(this)">
                    Regular Hours
                    <div class="operationHoursAdvanced-expandToggle fas fa-chevron-down"></div>
                    <div class="operationHoursAdvanced-openSign">
                        <div>OPEN</div><span>Hours listed below</span>
                    </div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-monday-ui">
                    Monday
                    <div class="u-floatRight u-clear">${escapeHTML(hours.monday || 'Call for hours')}</div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-tuesday-ui">
                    Tuesday
                    <div class="u-floatRight u-clear">${escapeHTML(hours.tuesday || 'Call for hours')}</div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-wednesday-ui">
                    Wednesday
                    <div class="u-floatRight u-clear">${escapeHTML(hours.wednesday || 'Call for hours')}</div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-thursday-ui">
                    Thursday
                    <div class="u-floatRight u-clear">${escapeHTML(hours.thursday || 'Call for hours')}</div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-friday-ui">
                    Friday
                    <div class="u-floatRight u-clear">${escapeHTML(hours.friday || 'Call for hours')}</div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-saturday-ui">
                    Saturday
                    <div class="u-floatRight">CLOSED</div>
                </div>
                <div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-sunday-ui">
                    Sunday
                    <div class="u-floatRight">CLOSED</div>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Facility Features - Matches Publisher Format
 */
function generateFacilities(data) {
    const { center, photos } = data;
    const facilityImage = photos && photos.length > 1 && photos[1].exterior ? photos[1].exterior : 'https://via.placeholder.com/600x600';
    
    const features = center.facilities || [];
    const featureList = features.slice(0, 10).map(f => `
        <div class="d-flex align-items-center mb-3" style="flex:1 1 45%;">
            <i class="bi bi-check-circle feature-icon me-2" style="color:#1a4d7f; font-size:1.3rem;"></i> ${escapeHTML(f.name || f)}
        </div>`).join('');
    
    return `<!-- Facility Features -->
<div id="freeTextArea-facilities" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <div class="col-md-7 d-flex order-2 order-md-1">
                        <div class="hover-card p-4 flex-fill d-flex flex-column">
                            <i class="bi bi-building icon-lg mb-3" style="font-size:2.5rem;color:#1a4d7f;"></i>
                            <h2 class="fw-bold mb-4">Facility <em style="color:#20c997;">Features</em></h2>
                            <div class="d-flex flex-wrap justify-content-between mt-auto">
                                ${featureList}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5 d-flex mt-4 mt-md-0 order-1 order-md-2">
                        <div class="photo-card w-100 h-100" style="aspect-ratio: 1 / 1;">
                            <img alt="Facility" src="${facilityImage}" class="img-fluid w-100 h-100" style="object-fit:cover; object-position: center;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Programs Section - Matches Publisher Format
 */
function generatePrograms(data) {
    const { center, photos } = data;
    const programImage = photos && photos.length > 2 && photos[2].exterior ? photos[2].exterior : 'https://via.placeholder.com/600x600';
    
    const programs = center.programs || [];
    const programList = programs.slice(0, 8).map(p => `
        <div class="d-flex align-items-center" style="flex: 1 1 45%;">
            <i class="bi bi-star feature-icon" style="color:#f57c00; font-size:1.3rem; margin-right:0.5rem;"></i> ${escapeHTML(p.name || p)}
        </div>`).join('');
    
    return `<!-- Featured Programs -->
<div id="freeTextArea-programs" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1;">
                            <img alt="Programs" class="img-fluid w-100 h-100" src="${programImage}" style="object-fit:cover; object-position: center;">
                        </div>
                    </div>
                    <div class="col-md-7 d-flex">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-award icon-lg" style="font-size:2.5rem;color:#1a4d7f;"></i>
                            <h2 class="fw-bold mb-4">Featured <em style="color:#20c997;">Programs</em></h2>
                            <div class="d-flex flex-wrap gap-3 mt-auto">
                                ${programList}
                            </div>
                            <div class="text-center mt-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showRSYCModal('programs', '${escapeHTML(center.name)}')">
                                    View All ${programs.length} Programs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="rsyc-modal-programs" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>All Featured Programs</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('programs')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <div class="row">
                ${programs.map(p => `<div class="col-sm-12 col-md-6 d-flex align-items-center mb-3">
                    <i class="bi bi-star feature-icon me-2" style="color:#f57c00;"></i> ${escapeHTML(p.name || p)}
                </div>`).join('')}
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Staff Section - Matches Publisher Format
 */
function generateStaff(data) {
    const { leaders } = data;
    if (!leaders || leaders.length === 0) return '';
    
    const staffCards = leaders.slice(0, 6).map((leader, idx) => `
<div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; scroll-snap-align: start; border: 1px solid #dee2e6; overflow:hidden;">
    <img alt="${escapeHTML(leader.name)}" class="card-img-top" src="https://via.placeholder.com/280x250?text=${encodeURIComponent(leader.name)}" style="width:100%; height:250px; object-fit:cover; display:block;">
    <div class="card-body d-flex flex-column">
        <div class="fw-bold mb-1" style="font-size: 1.1rem; line-height: 1.3;">${escapeHTML(leader.name)}</div>
        <div class="text-muted mb-2" style="font-size: 0.95rem;">${escapeHTML(leader.role || 'Staff Member')}</div>
        <p class="card-text" style="flex-grow:1; font-size: 0.875rem; line-height: 1.5;">
            ${escapeHTML(leader.bio || 'Dedicated staff member committed to youth development and community service.')}
        </p>
    </div>
</div>`).join('');
    
    return `<!-- Staff & Community Leaders -->
<div id="freeTextArea-staff" class="freeTextArea u-centerBgImage section u-sa-goldBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="bg-area rounded p-4" id="profiles">
                <h2 class="fw-bold mb-4"><span style="color:#111111;">Staff &amp; <em style="color:#20c997;">Community Leaders</em></span></h2>
                <p class="mb-n2">
                    <small class="text-muted">
                        Scroll to view more 
                        <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                    </small>
                </p>
                <div class="d-flex overflow-auto gap-4 py-2" style="scroll-snap-type: x mandatory;">
                    ${staffCards}
                </div>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Nearby Salvation Army Centers
 */
function generateNearby(data) {
    const { center, photos } = data;
    const nearbyImage = photos && photos.length > 3 && photos[3].exterior ? photos[3].exterior : 'https://via.placeholder.com/600x600';
    
    return `<!-- Nearby Salvation Army Centers -->
<div id="freeTextArea-nearby" class="freeTextArea u-centerBgImage section u-sa-greyVeryLightBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch flex-column-reverse flex-md-row">
                    <div class="col-md-7 d-flex mb-4 mb-md-0">
                        <div class="hover-card w-100 d-flex flex-column h-100">
                            <i class="bi bi-geo-alt icon-lg" style="font-size:2.5rem;color:#1a4d7f;"></i>
                            <h2 class="fw-bold mb-4">Nearby <em style="color:#20c997;">Salvation Army</em> Centers</h2>
                            <div class="d-flex flex-wrap justify-content-between mt-auto">
                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon" style="color:#f57c00; margin-right:0.5rem;"></i>
                                    <div><strong>Corps Community Center</strong><br><span style="font-size:12px;">Worship and community support.</span></div>
                                </div>
                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon" style="color:#f57c00; margin-right:0.5rem;"></i>
                                    <div><strong>Red Shield Youth Center</strong><br><span style="font-size:12px;">Programs for kids and teens.</span></div>
                                </div>
                            </div>
                            <a class="btn btn-outline-primary btn-sm mt-3" href="https://www.salvationarmyusa.org/location-finder/" target="_blank">
                                <i class="bi bi-map me-2"></i> Find More Centers
                            </a>
                        </div>
                    </div>
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1;">
                            <img alt="Nearby Centers" class="img-fluid w-100 h-100" src="${nearbyImage}" style="object-fit:cover; object-position: center;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Volunteer Section
 */
function generateVolunteer(data) {
    const { center, photos } = data;
    const volunteerImage = photos && photos.length > 4 && photos[4].exterior ? photos[4].exterior : 'https://via.placeholder.com/600x600';
    
    return `<!-- Get Involved -->
<div id="freeTextArea-volunteer" data-index="8" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100" style="aspect-ratio: 1 / 1; overflow:hidden; border-radius:12px;">
                            <img alt="Get Involved" src="${volunteerImage}" style="width:100%; height:100%; object-fit:cover; object-position: center;">
                        </div>
                    </div>
                    <div class="col-md-7 d-flex">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-heart-pulse icon-lg" style="font-size:2.5rem;color:#1a4d7f;"></i>
                            <h2 class="fw-bold mb-2">Get <em style="color:#20c997;">Involved</em></h2>
                            <p class="mb-4 text-muted" style="font-size:1.1rem;">Support youth through giving, volunteering, or mentoring.</p>
                            <div class="d-grid gap-2 mt-auto">
                                <a class="btn btn-outline-primary btn-lg" href="https://give.salvationarmysouth.org/" target="_blank">
                                    <i class="bi bi-gift me-2"></i> Donate 
                                </a>
                                <button class="btn btn-outline-primary btn-lg" onclick="showRSYCModal('volunteer', '${escapeHTML(center.name)}')">
                                    <i class="bi bi-hand-thumbs-up me-2"></i> Volunteer / Mentor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="rsyc-modal-volunteer" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>Volunteer / Mentor Youth</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('volunteer')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <p>For information on how to volunteer at our Red Shield Youth Center, please contact us or visit our main website.</p>
            <a class="btn btn-outline-primary mt-3" href="/redshieldyouth/volunteer" target="_blank">
                <i class="bi bi-hand-thumbs-up me-2"></i> Volunteer Information
            </a>
        </div>
    </div>
</div>`;
}

/**
 * Footer Photo Section
 */
function generateFooterPhoto(data) {
    const { photos } = data;
    const footerImage = photos && photos.length > 5 && photos[5].exterior ? photos[5].exterior : 'https://via.placeholder.com/1400x400';
    
    return `<!-- Footer Photo Section -->
<section id="freeTextArea-footerPhoto" class="freeTextArea u-centerBgImage section u-coverBgImage" style="min-height: 400px; background-image: url('${footerImage}'); background-size: cover; background-position: center top !important;">
    <div class="u-positionRelative" style="min-height: 400px;"></div>
</section>`;
}

/**
 * Contact Section
 */
function generateContact(data) {
    const { center } = data;
    
    return `<!-- Contact Section -->
<div id="freeTextArea-scripture" data-index="10" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <h2 style="text-align: center; margin-bottom: 1.5rem;">
                ${escapeHTML(center.name)}
            </h2>
            <p style="text-align: center;">
                <strong>Phone:</strong> ${escapeHTML(center.phone || '(XXX) XXX-XXXX')}<br>
                <strong>Address:</strong> ${escapeHTML(center.address || '')}<br>
                ${center.email ? `<strong>Email:</strong> <a href="mailto:${escapeHTML(center.email)}">${escapeHTML(center.email)}</a>` : ''}
            </p>
            <p style="text-align: center;">
                <cite>Start children off on the way they should go, and even when they are old they will not turn from it.</cite>
            </p>
            <p style="text-align: center;">
                <strong><cite>- Proverbs 22:6</cite></strong>
            </p>
        </div>
    </div>
</div>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
    if (!str) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(str).replace(/[&<>"']/g, m => map[m]);
}

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ RSYC Profile Publisher Server running at http://localhost:${PORT}`);
    console.log(`📂 Open: http://localhost:${PORT}/rsyc/rsyc-profile-publisher.html`);
    console.log(`🔧 CMS Setup: http://localhost:${PORT}/rsyc/rsyc-cms-setup.html`);
    console.log(`📡 API Docs: POST /api/generate-profile (with centerId and sections)\n`);
});
