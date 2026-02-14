// RSYC Profile Publisher Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

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
                const tryRecoverParse = (str) => {
                    const trimmed = str.trim();
                    try {
                        return JSON.parse(trimmed);
                    } catch (e) {
                        console.warn(`[RECOVERY] Parse failed for ${filename}: ${e.message}`);
                        
                        // Try position-based recovery
                        const posMatch = e.message.match(/position (\d+)/);
                        if (posMatch && posMatch[1]) {
                            const pos = parseInt(posMatch[1], 10);
                            try {
                                return JSON.parse(trimmed.substring(0, pos));
                            } catch (e2) {}
                        }

                        // Try backward search for valid closing brace/bracket
                        const first = Math.min(
                            str.indexOf('{') === -1 ? 9999999 : str.indexOf('{'),
                            str.indexOf('[') === -1 ? 9999999 : str.indexOf('[')
                        );
                        const last = Math.max(str.lastIndexOf('}'), str.lastIndexOf(']'));
                        
                        if (first !== 9999999 && last !== -1 && last > first) {
                            let currentLast = last;
                            while (currentLast > first) {
                                try {
                                    const candidate = JSON.parse(str.substring(first, currentLast + 1));
                                    console.log(`[RECOVERY] ✅ Successfully recovered ${filename} by truncation at ${currentLast}`);
                                    return candidate;
                                } catch (err) {
                                    const nextBrace = str.lastIndexOf('}', currentLast - 1);
                                    const nextBracket = str.lastIndexOf(']', currentLast - 1);
                                    currentLast = Math.max(nextBrace, nextBracket);
                                }
                            }
                        }
                        throw e;
                    }
                };

                try {
                    const json = tryRecoverParse(data);
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
    return data.map(l => {
        // Extract faceFocus
        let faceFocus = '';
        if (l.FaceFocus && l.FaceFocus.Value) {
            faceFocus = String(l.FaceFocus.Value).trim();
        } else if (l.FaceFocus && typeof l.FaceFocus === 'string') {
            faceFocus = l.FaceFocus.trim();
        }

        // Extract zoomLevel
        let zoomLevel = 1;
        const zoomValue = l.ZoomLevel || l.Scale || l.PhotoZoom;
        if (zoomValue) {
            const parsed = parseFloat(zoomValue);
            if (!isNaN(parsed) && parsed > 0) zoomLevel = parsed;
        }

        return {
            id: l.ID,
            centerIds: Array.isArray(l['Center#Id']) ? l['Center#Id'] : [l['Center#Id']],
            // Mapping for generateStaff template
            roleType: l.RoleType ? l.RoleType.Value : '',
            positionTitle: l.PositionTitle || '',
            alternateName: l.AlternateName || '',
            biography: l.Biography || '',
            Sort: l.Sort,
            faceFocus: faceFocus,
            zoomLevel: zoomLevel,
            imageURL: l.ImageURL || l.ImageUrl || l.Photo || null,
            person: l.Person ? {
                name: l.Person.DisplayName,
                email: l.Person.Email,
                picture: l.Person.Picture || null,
                department: l.Person.Department,
                title: l.Person.JobTitle
            } : null
        };
    });
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
                const trimmedData = data.trim();
                const tryRecover = (str, originalErr) => {
                    // 1. Try position-based recovery (V8 error: "at position 123")
                    const posMatch = originalErr.message.match(/position (\d+)/);
                    if (posMatch && posMatch[1]) {
                        const pos = parseInt(posMatch[1], 10);
                        try {
                            return JSON.parse(str.substring(0, pos));
                        } catch (e2) {}
                    }

                    // 2. Structural recovery with backward search
                    const first = Math.min(
                        str.indexOf('{') === -1 ? Infinity : str.indexOf('{'),
                        str.indexOf('[') === -1 ? Infinity : str.indexOf('[')
                    );
                    const last = Math.max(str.lastIndexOf('}'), str.lastIndexOf(']'));

                    if (first !== Infinity && last !== -1 && last > first) {
                        let searchPos = last;
                        while (searchPos > first) {
                            try {
                                return JSON.parse(str.substring(first, searchPos + 1));
                            } catch (err) {
                                const nextBrace = str.lastIndexOf('}', searchPos - 1);
                                const nextBracket = str.lastIndexOf(']', searchPos - 1);
                                searchPos = Math.max(nextBrace, nextBracket);
                            }
                        }
                    }
                    throw originalErr;
                };

                try {
                    const json = JSON.parse(trimmedData);
                    console.log(`[PROXY] Success: ${url}`);
                    res.json(json);
                } catch (e) {
                    try {
                        const recovered = tryRecover(trimmedData, e);
                        console.log(`[PROXY] ✅ Recovered JSON from corrupted stream: ${url}`);
                        return res.json(recovered);
                    } catch (recoveryError) {
                        console.error(`[PROXY] JSON parse error: ${url}`, e.message);
                        res.status(500).json({ error: 'Invalid JSON response', details: e.message });
                    }
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

// Start server
app.listen(PORT, () => {
    console.log(`✅ RSYC Profile Publisher Server running at http://localhost:${PORT}`);
    console.log(`📂 Open: http://localhost:${PORT}/rsyc/rsyc-profile-publisher.html`);
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
                    // About is now included in generateSchedules, skip it here
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
 * Schedules Section - Tabbed Accordion with About + Social + Schedule
 * NOTE: generateAbout is no longer separate - it's included in generateSchedules
 */
function generateSchedules(data) {
    const { schedules, center } = data;
    
    // ============================================
    // PART 1: Build About section if available
    // ============================================
    let aboutImageSection = '';
    let aboutSection = '';
    let socialSection = '';
    
    if (center.aboutText) {
        // Get explainer video embed code
        const explainerVideoEmbedCode = center.explainerVideoEmbedCode || center.ExplainerVideoEmbedCode || '';
        const videoHTML = explainerVideoEmbedCode ? `
                <div class="mt-4" style="border-radius: 12px; overflow: hidden;">
                    ${explainerVideoEmbedCode}
                </div>` : '';
        
        aboutSection = `
    <div class="d-flex justify-content-center">
        <div class="schedule-card w-100 text-dark" style="max-width:800px;width:100%;padding:1.5rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h2 class="fw-bold mb-3 text-center">About This <em>Center</em></h2>
            <p class="text-center mb-3"><strong>The Salvation Army ${escapeHTML(center.name || center.Title)}</strong></p>
            <div class="about-content" style="font-family: inherit; font-size: 1rem; line-height: 1.6;">
                ${center.aboutText}
            </div>
            ${videoHTML}
        </div>
    </div>`;
    }
    
    // Build social network links
    const hasFacebook = center.facebookURL;
    const hasInstagram = center.instagramURL;
    const hasTwitter = center.twitterURL;
    const hasLinkedIn = center.linkedInURL;
    const hasYouTube = center.youTubeURL;
    
    if (hasFacebook || hasInstagram || hasTwitter || hasLinkedIn || hasYouTube) {
        const socialIcons = [];
        if (hasFacebook) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${escapeHTML(center.facebookURL)}" target="_blank"><i class="bi bi-facebook" style="font-size:1.45rem;"></i></a>`);
        }
        if (hasInstagram) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${escapeHTML(center.instagramURL)}" target="_blank"><i class="bi bi-instagram" style="font-size:1.45rem;"></i></a>`);
        }
        if (hasLinkedIn) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${escapeHTML(center.linkedInURL)}" target="_blank"><i class="bi bi-linkedin" style="font-size:1.45rem;"></i></a>`);
        }
        if (hasYouTube) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${escapeHTML(center.youTubeURL)}" target="_blank"><i class="bi bi-youtube" style="font-size:1.45rem;"></i></a>`);
        }
        if (hasTwitter) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${escapeHTML(center.twitterURL)}" target="_blank"><i class="bi bi-twitter" style="font-size:1.45rem;"></i></a>`);
        }
        
        socialSection = `
    <div class="mt-4 text-center">
        <h4 class="fw-bold mb-3 text-white">Follow Us</h4>
        <div class="d-flex justify-content-center gap-3 mb-4">
            ${socialIcons.join(' ')}
        </div>
    </div>`;
    }
    
    // ============================================
    // PART 2: Build schedule accordion if available
    // ============================================
    let scheduleScrollSection = '';
    
    if (schedules && schedules.length > 0) {
        let accordionHeaders = '';
        let accordionPanels = '';
        
        schedules.forEach((schedule) => {
            // Parse days
            let daysText = '';
            if (schedule.scheduleDays && Array.isArray(schedule.scheduleDays) && schedule.scheduleDays.length > 0) {
                const days = schedule.scheduleDays;
                const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                const allWeekdays = weekdays.every(day => days.includes(day));
                
                if (allWeekdays && days.length === 5) {
                    daysText = 'Monday - Friday';
                } else if (days.length === 1) {
                    daysText = days[0];
                } else if (days.length === 2) {
                    daysText = days.join(' and ');
                } else {
                    daysText = days.join(', ');
                }
            }
            
            // Parse time
            let timeText = '';
            if (schedule.scheduleTime) {
                timeText = schedule.scheduleTime;
            }
            
            const scheduleId = `rsyc-schedule-${schedule.id}`;
            
            // Build accordion header button
            accordionHeaders += `
                <button class="rsyc-accordion-header-btn" data-schedule="${scheduleId}" onclick="window.showRSYCSchedulePanel('${scheduleId}')" style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #f8f9fa; cursor: pointer; flex: 1; min-width: 0; transition: all 0.3s ease; text-align: left;">
                    <div style="color: #000; margin: 0;">
                        <h5 class="fw-bold mb-1" style="margin: 0; color: #000; font-size: 0.95rem;">${escapeHTML(schedule.title)}</h5>
                        ${schedule.subtitle ? `<div class="text-muted small" style="color: #666; font-size: 0.85rem;">${escapeHTML(schedule.subtitle)}</div>` : ''}
                        <p class="mb-0 mt-2" style="font-size: 0.85rem; color: #000;">
                            ${daysText ? `<strong>Days:</strong> ${escapeHTML(daysText)}<br>` : ''}
                            ${timeText ? `<strong>Time:</strong> ${escapeHTML(timeText)}` : ''}
                        </p>
                    </div>
                </button>`;
            
            // Build accordion panel content
            accordionPanels += `
                <div class="rsyc-accordion-panel" id="${scheduleId}-panel" style="display: none; padding: 1.5rem; border: 1px solid #e0e0e0; border-top: 3px solid #20B3A8; background: white; color: #333; border-radius: 0 0 8px 8px;">
                    <h3 style="margin: 0 0 1rem 0; color: #000;">${escapeHTML(schedule.title)}</h3>
                    ${schedule.subtitle ? `<p style="color:#666; margin: 0 0 1rem 0; font-style:italic;">${escapeHTML(schedule.subtitle)}</p>` : ''}
                    ${schedule.description ? `<p class="mb-3">${schedule.description}</p>` : ''}
                    
                    <div class="row">
                        ${daysText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${escapeHTML(daysText)}</div>` : ''}
                        ${timeText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${escapeHTML(timeText)}</div>` : ''}
                        ${schedule.ageRange ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Age Range:</strong><br>${escapeHTML(schedule.ageRange)}</div>` : ''}
                        ${schedule.cost ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${escapeHTML(schedule.cost)}</div>` : ''}
                    </div>
                </div>`;
        });
        
        // Add global function to switch schedule panels
        if (typeof window.showRSYCSchedulePanel === 'undefined') {
            window.showRSYCSchedulePanel = function(scheduleId) {
                document.querySelectorAll('.rsyc-accordion-panel').forEach(panel => {
                    panel.style.display = 'none';
                });
                document.querySelectorAll('.rsyc-accordion-header-btn').forEach(btn => {
                    btn.style.background = '#f8f9fa';
                    btn.style.borderColor = '#e0e0e0';
                    btn.classList.remove('active');
                });
                const selectedPanel = document.getElementById(scheduleId + '-panel');
                if (selectedPanel) {
                    selectedPanel.style.display = 'block';
                }
                const selectedBtn = document.querySelector(`[data-schedule="${scheduleId}"]`);
                if (selectedBtn) {
                    selectedBtn.style.background = '#e8f4f8';
                    selectedBtn.style.borderColor = '#20B3A8';
                    selectedBtn.classList.add('active');
                }
            };
        }
        
        scheduleScrollSection = `
    <div class="rsyc-tabbed-accordion" style="margin: 2rem 0; width: 100%;">
        <div class="rsyc-accordion-headers" style="display: flex; gap: 0.75rem; margin-bottom: 0; flex-wrap: wrap; width: 100%;">
            ${accordionHeaders}
        </div>
        <div class="rsyc-accordion-panels" style="margin-top: 0; width: 100%;">
            ${accordionPanels}
        </div>
    </div>`;
    }
    
    // ============================================
    // PART 3: Build complete output with About + Schedules
    // ============================================
    let output = '';
    
    // Add About section first (in teal background)
    if (aboutSection || socialSection) {
        output += `<!-- About This Center -->
<div id="freeTextArea-about" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container" style="margin: 0; padding: 0;">
            <div class="mt-0 mb-5">
                ${aboutImageSection}
                ${aboutSection}
                ${socialSection}
            </div>
        </div>
    </div>
</div>

`;
    }
    
    // Add Schedule section if there are schedules (in white background)
    if (scheduleScrollSection && scheduleScrollSection.trim() !== '') {
        output += `<!-- Program Schedule Section -->
<div class="freeTextArea section" style="background: white; padding: 3rem 0;">
    <div class="u-positionRelative">
        <div class="container" style="margin: 0; padding: 0;">
            <h2 class="fw-bold mb-4 text-center">Program <em>Schedule</em></h2>
            
            <div class="schedule-scroll-wrapper" style="margin: 0;">
                ${scheduleScrollSection}
            </div>
        </div>
    </div>
</div>`;
    }
    
    // Return combined output or empty if nothing to display
    if (!output || output.trim() === '') {
        return '';
    }
    
    return output;
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
    
    // Sort facilities alphabetically
    const features = [...(center.facilities || [])].sort((a, b) => {
        const nameA = a.name || a;
        const nameB = b.name || b;
        return nameA.localeCompare(nameB);
    });
    
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
    
    // Sort programs alphabetically
    const programs = [...(center.programs || [])].sort((a, b) => {
        const nameA = a.name || a;
        const nameB = b.name || b;
        return nameA.localeCompare(nameB);
    });
    
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
