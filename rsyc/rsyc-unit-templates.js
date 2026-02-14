/**
 * RSYC Unit Templates
 * Generates HTML for organizational unit pages (Division, State, City, Area Command)
 * Content focused on Parents, Youth, and Donors
 */

class RSYCUnitTemplates {
    constructor() {
        // State name mapping
        const stateNames = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
            'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
            'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
            'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
            'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
            'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
            'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
            'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
        };
        this.stateNames = stateNames;

        // Define which sections are available for unit pages
        this.sections = {
            'hero': { name: 'Hero Section', enabled: true, order: 1 },
            'overview': { name: 'Unit Overview', enabled: true, order: 2 },
            'centers': { name: 'Centers in This Unit', enabled: true, order: 3 },
            'programs': { name: 'Featured Programs', enabled: true, order: 4 },
            'resources': { name: 'Resources for Families', enabled: true, order: 5 },
            'impact': { name: 'Impact & Growth', enabled: true, order: 6 },
            'giving': { name: 'Give to This Unit', enabled: true, order: 7 },
            'leaders': { name: 'Leadership', enabled: true, order: 8 },
            'contact': { name: 'Contact & Learn More', enabled: true, order: 9 }
        };

        // Define filter function globally so inline onchange handlers can access it
        window.applyAllCentersFilters = function() {
            const cards = document.querySelectorAll('.center-card');
            const cityVal = document.getElementById('city-filter')?.value || '';
            const stateVal = document.getElementById('state-filter')?.value || '';
            const featVal = document.getElementById('features-filter')?.value || '';
            const progVal = document.getElementById('programs-filter')?.value || '';
            
            // Get visible cards based on current filters
            let visibleCards = [];
            cards.forEach(card => {
                const matchCity = !cityVal || card.dataset.city === cityVal;
                const matchState = !stateVal || card.dataset.state === stateVal;
                const matchFeatures = !featVal || (card.dataset.features && card.dataset.features.includes(featVal));
                const matchPrograms = !progVal || (card.dataset.programs && card.dataset.programs.includes(progVal));
                
                const show = matchCity && matchState && matchFeatures && matchPrograms;
                card.style.display = show ? '' : 'none';
                if (show) visibleCards.push(card);
            });
            
            // Update available options in other filters based on visible cards
            window.updateFilterOptions(visibleCards, cityVal, stateVal, featVal, progVal);
        };

        // Update filter options based on visible centers - rebuild options to show only available choices
        window.updateFilterOptions = function(visibleCards) {
            const allCards = document.querySelectorAll('.center-card');
            
            // Get current filter values
            const cityVal = document.getElementById('city-filter').value;
            const stateVal = document.getElementById('state-filter').value;
            const featVal = document.getElementById('features-filter').value;
            const progVal = document.getElementById('programs-filter').value;
            
            // Helper function to get available values when a specific filter is excluded
            const getAvailableValues = (excludeFilter) => {
                const available = {
                    cities: new Set(),
                    states: new Set(),
                    features: new Set(),
                    programs: new Set()
                };
                
                allCards.forEach(card => {
                    // Check if card matches all filters EXCEPT the one being evaluated
                    const matchCity = excludeFilter === 'city' || !cityVal || card.dataset.city === cityVal;
                    const matchState = excludeFilter === 'state' || !stateVal || card.dataset.state === stateVal;
                    const matchFeatures = excludeFilter === 'features' || !featVal || (card.dataset.features && card.dataset.features.includes(featVal));
                    const matchPrograms = excludeFilter === 'programs' || !progVal || (card.dataset.programs && card.dataset.programs.includes(progVal));
                    
                    if (matchCity && matchState && matchFeatures && matchPrograms) {
                        if (card.dataset.city) available.cities.add(card.dataset.city);
                        if (card.dataset.state) available.states.add(card.dataset.state);
                        if (card.dataset.features) {
                            card.dataset.features.split('|').forEach(f => f && available.features.add(f));
                        }
                        if (card.dataset.programs) {
                            card.dataset.programs.split('|').forEach(p => p && available.programs.add(p));
                        }
                    }
                });
                
                return available;
            };
            
            // Rebuild City filter options - remove unavailable options entirely (better Apple device support)
            const citySelect = document.getElementById('city-filter');
            if (citySelect) {
                const allCities = [...new Set(Array.from(allCards).map(c => c.dataset.city))].sort();
                const availableCities = getAvailableValues('city');
                const options = ['<option value="">All Cities</option>'];
                
                allCities.forEach(city => {
                    if (availableCities.cities.has(city)) {
                        const isSelected = city === cityVal ? ' selected' : '';
                        options.push(`<option value="${city}"${isSelected}>${city}</option>`);
                    }
                });
                
                citySelect.innerHTML = options.join('');
            }
            
            // Rebuild State filter options - remove unavailable options entirely
            const stateSelect = document.getElementById('state-filter');
            if (stateSelect) {
                const allStates = [...new Set(Array.from(allCards).map(c => c.dataset.state))].sort();
                const availableStates = getAvailableValues('state');
                const options = ['<option value="">All States</option>'];
                
                allStates.forEach(state => {
                    if (availableStates.states.has(state)) {
                        const isSelected = state === stateVal ? ' selected' : '';
                        const stateDisplay = stateNames[state] || state;
                        options.push(`<option value="${state}"${isSelected}>${stateDisplay}</option>`);
                    }
                });
                
                stateSelect.innerHTML = options.join('');
            }
            
            // Rebuild Features filter options - remove unavailable options entirely
            const featuresSelect = document.getElementById('features-filter');
            if (featuresSelect) {
                const allFeatures = [...new Set(Array.from(allCards).flatMap(c => (c.dataset.features || '').split('|').filter(f => f)))].sort();
                const availableFeatures = getAvailableValues('features');
                const options = ['<option value="">All Features</option>'];
                
                allFeatures.forEach(feature => {
                    if (availableFeatures.features.has(feature)) {
                        const isSelected = feature === featVal ? ' selected' : '';
                        options.push(`<option value="${feature}"${isSelected}>${feature}</option>`);
                    }
                });
                
                featuresSelect.innerHTML = options.join('');
            }
            
            // Rebuild Programs filter options - remove unavailable options entirely
            const programsSelect = document.getElementById('programs-filter');
            if (programsSelect) {
                const allPrograms = [...new Set(Array.from(allCards).flatMap(c => (c.dataset.programs || '').split('|').filter(p => p)))].sort();
                const availablePrograms = getAvailableValues('programs');
                const options = ['<option value="">All Programs</option>'];
                
                allPrograms.forEach(program => {
                    if (availablePrograms.programs.has(program)) {
                        const isSelected = program === progVal ? ' selected' : '';
                        options.push(`<option value="${program}"${isSelected}>${program}</option>`);
                    }
                });
                
                programsSelect.innerHTML = options.join('');
            }
        };

        // Define clear filters function
        window.clearAllCentersFilters = function() {
            document.getElementById('city-filter').value = '';
            document.getElementById('state-filter').value = '';
            document.getElementById('features-filter').value = '';
            document.getElementById('programs-filter').value = '';
            
            window.applyAllCentersFilters();
        };
    }

    /**
     * Generate complete unit profile HTML
     */
    generateUnitProfile(unit, enabledSections) {
        if (!unit) {
            console.error('❌ Invalid unit passed to generateUnitProfile');
            return '';
        }

        // Special handling for "all" unit type
        if (unit.type === 'all') {
            return this.generateAllCentersGrid(unit);
        }

        const sections = [];
        
        Object.keys(this.sections).forEach(sectionKey => {
            if (enabledSections.includes(sectionKey)) {
                const html = this.generateUnitSection(sectionKey, unit);
                if (html) {
                    sections.push(html);
                }
            }
        });

        return sections.join('\n\n');
    }

    /**
     * Generate all centers grid with filters
     */
    generateAllCentersGrid(unit) {
        if (!unit.centers || unit.centers.length === 0) {
            return '<div class="container py-5"><p class="text-center text-muted">No centers found</p></div>';
        }

        console.log('[RSYCUnitTemplates] Generating grid for', unit.centers.length, 'centers');
        console.log('[RSYCUnitTemplates] Sample center:', unit.centers[0]);

        // Filter out closed centers - hide any center with "Closed" in the title or name
        const activeCenters = unit.centers.filter(center => {
            const fullName = (center.name || '').toLowerCase();
            const shortName = (center.shortName || '').toLowerCase();
            const title = (center.Title || '').toLowerCase();
            return !fullName.includes('closed') && !shortName.includes('closed') && !title.includes('closed');
        });

        if (activeCenters.length === 0) {
            return '<div class="container py-5"><p class="text-center text-muted">No active centers found</p></div>';
        }

        console.log('[RSYCUnitTemplates] After filtering closed centers:', activeCenters.length, 'active centers');

        // Extract unique filter values
        const cities = [...new Set(activeCenters.map(c => c.city).filter(c => c))].sort();
        const states = [...new Set(activeCenters.map(c => c.state).filter(c => c))].sort();
        const allFeatures = new Set();
        const allPrograms = new Set();
        
        activeCenters.forEach(center => {
            if (center.facilityFeatures && Array.isArray(center.facilityFeatures)) {
                center.facilityFeatures.forEach(f => allFeatures.add(f.name || f));
            }
            // Use featuredPrograms, not programs
            if (center.featuredPrograms && Array.isArray(center.featuredPrograms)) {
                center.featuredPrograms.forEach(p => {
                    const progName = typeof p === 'string' ? p : p.name;
                    allPrograms.add(progName);
                });
            }
        });
        
        console.log('[RSYCUnitTemplates] Extracted filters - Cities:', cities.length, 'States:', states.length, 'Features:', allFeatures.size, 'Programs:', allPrograms.size);
        
        const features = Array.from(allFeatures).sort();
        const programs = Array.from(allPrograms).sort();

        console.log('[RSYCUnitTemplates] Sorted filters - Features:', features, 'Programs:', programs);

        // Sort centers alphabetically by name (after removing prefix)
        const sortedCenters = activeCenters.sort((a, b) => {
            let nameA = (a.name || '').replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '').replace(/^rsyc\s+/i, '');
            let nameB = (b.name || '').replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '').replace(/^rsyc\s+/i, '');
            return nameA.localeCompare(nameB);
        });

        // Generate center cards with image overlay
        const centerCards = sortedCenters.map(center => {
            // Remove prefix from display name
            let displayName = (center.name || 'Salvation Army Center');
            displayName = displayName
                .replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '')
                .replace(/^rsyc\s+/i, '');
            const centerName = this.escapeHTML(displayName);
            
            const city = center.city || 'City';  // Don't escape for data attributes
            const state = center.state || '';  // Don't escape for data attributes
            const centerId = this.escapeHTML(center.id || '');
            
            // Generate URL slug from center name - remove common prefix, convert to lowercase, replace spaces/dashes with single dash
            let slugName = (center.name || '');
            // Remove common prefixes like "Red Shield Youth Centers of" or "Red Shield Youth Center of"
            slugName = slugName
                .replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '')
                .replace(/^rsyc\s+/i, '');
            
            const centerSlug = slugName
                .toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with dashes
                .replace(/-+/g, '-')            // Collapse multiple dashes to single dash
                .replace(/[^\w\-]/g, '');       // Remove special characters except dashes
            const centerUrl = `/redshieldyouth/${centerSlug}`;
            
            // Get image from photos - prioritize Exterior Photo, then Facility Features
            let imageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';
            if (center.photos && center.photos.length > 0) {
                // Find any photo that has an exterior photo URL
                const exteriorPhoto = center.photos.find(p => p.urlExteriorPhoto);
                if (exteriorPhoto) {
                    imageUrl = exteriorPhoto.urlExteriorPhoto;
                } else {
                    // Fallback to the first available photo's other fields
                    const photo = center.photos[0];
                    imageUrl = photo.urlFacilityFeaturesPhoto || photo.urlProgramsPhoto || imageUrl;
                }
            }

            // Build feature and program strings for filtering - don't escape these either
            const featureStr = (center.facilityFeatures || []).map(f => typeof f === 'string' ? f : f.name).join('|');
            const programStr = (center.featuredPrograms || []).map(p => typeof p === 'string' ? p : p.name).join('|');

            return `
            <div class="center-card" data-city="${city}" data-state="${state}" data-features="${featureStr}" data-programs="${programStr}" style="cursor: pointer; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease;" onclick="window.location.href='${centerUrl}';">
                <div style="position: relative; height: 300px; width: 100%; overflow: hidden; background-color: #f0f0f0;">
                    <img src="${imageUrl}" alt="${centerName}" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.5rem; color: white;">
                        <h5 style="font-weight: bold; margin-bottom: 0.5rem; font-size: 1.1rem;">
                            ${centerName}
                        </h5>
                        <p style="margin-bottom: 1rem; font-size: 0.95rem;">
                            <i class="bi bi-geo-alt" style="margin-right: 0.25rem;"></i>${city}${state ? ', ' + state : ''}
                        </p>
                        <a href="${centerUrl}" style="color: white; text-decoration: underline; font-weight: 500;">Learn More →</a>
                    </div>
                </div>
            </div>`;
        }).join('');

        console.log('[RSYCUnitTemplates] Generated', centerCards.length, 'card HTML strings');

        // Build filter dropdown options separately to avoid template literal nesting issues
        const cityOptions = cities.map(c => `<option value="${c}">${c}</option>`).join('');
        const stateOptions = states.map(s => `<option value="${s}">${this.stateNames[s] || s}</option>`).join('');
        const featuresOptions = features.map(f => `<option value="${f}">${f}</option>`).join('');
        const programsOptions = programs.map(p => `<option value="${p}">${p}</option>`).join('');

        // Build filter HTML with inline onchange handlers
        const filterHTML = `
        <div id="all-centers-filters" style="background-color: #f8f9fa; padding: 25px 20px 30px 20px; border-bottom: 1px solid #e0e0e0; margin-top: 0;">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                    <h5 class="fw-bold mb-0" style="margin-top: 0;">Filter Centers</h5>
                    <button onclick="window.clearAllCentersFilters()" style="background-color: #6c757d; color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='#5a6268'" onmouseout="this.style.backgroundColor='#6c757d'">
                        Clear All Filters
                    </button>
                </div>
                <div class="row g-3">
                    <div class="col-md-6 col-lg-3">
                        <label class="form-label fw-500 mb-2">State</label>
                        <select class="form-select form-select-sm filter-select" id="state-filter" data-filter-type="state" onchange="window.applyAllCentersFilters()">
                            <option value="">All States</option>
                            ${stateOptions}
                        </select>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <label class="form-label fw-500 mb-2">City</label>
                        <select class="form-select form-select-sm filter-select" id="city-filter" data-filter-type="city" onchange="window.applyAllCentersFilters()">
                            <option value="">All Cities</option>
                            ${cityOptions}
                        </select>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <label class="form-label fw-500 mb-2">Facility Features</label>
                        <select class="form-select form-select-sm filter-select" id="features-filter" data-filter-type="features" onchange="window.applyAllCentersFilters()">
                            <option value="">All Features</option>
                            ${featuresOptions}
                        </select>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <label class="form-label fw-500 mb-2">Programs</label>
                        <select class="form-select form-select-sm filter-select" id="programs-filter" data-filter-type="programs" onchange="window.applyAllCentersFilters()">
                            <option value="">All Programs</option>
                            ${programsOptions}
                        </select>
                    </div>
                </div>
            </div>
        </div>`;

        return `${filterHTML}
<!-- All Centers Grid -->
<div class="section" style="background-color: white; padding: 40px 20px 60px 20px; min-height: 500px;">
    <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;" id="centers-grid">
            ${centerCards}
        </div>
    </div>
</div>`;
    }

    /**
     * Route to individual section generator
     */
    generateUnitSection(sectionKey, unit) {
        const methods = {
            'hero': this.generateHero,
            'overview': this.generateOverview,
            'centers': this.generateCenters,
            'programs': this.generatePrograms,
            'resources': this.generateResources,
            'impact': this.generateImpact,
            'giving': this.generateGiving,
            'leaders': this.generateLeaders,
            'contact': this.generateContact
        };

        const method = methods[sectionKey];
        if (method) {
            try {
                const result = method.call(this, unit);
                console.log(`✓ Section "${sectionKey}": ${result ? result.length + ' chars' : 'EMPTY'}`);
                return result;
            } catch (error) {
                console.error(`❌ Error generating section "${sectionKey}":`, error);
                return '';
            }
        }
        console.warn(`⚠️  No method found for section: ${sectionKey}`);
        return '';
    }

    /**
     * Hero Section - Unit overview with inspiring imagery
     */
    generateHero(unit) {
        const unitTypeLabel = this._getUnitTypeLabel(unit.type);
        const inspiringMessages = {
            'division': 'Serving communities across our division',
            'state': 'A beacon of hope in our state',
            'city': 'Transforming lives in our community',
            'area-command': 'Leaders in service to our area'
        };

        const message = inspiringMessages[unit.type] || 'Serving with purpose';

        return `<!-- Hero Section -->
<section class="rsyc-hero" style="background: linear-gradient(135deg, #20B3A8 0%, #1A8F8A 100%); padding: 60px 20px; display: flex; justify-content: center; align-items: center; min-height: 400px; text-align: center;">
    <div style="max-width: 600px; color: white; margin-top: 35px;">
        <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${this.escapeHTML(unit.displayName)}</h1>
        <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.95;">${message}</p>
        <p style="font-size: 1rem; opacity: 0.85;">A proud part of The Salvation Army</p>
    </div>
</section>`;
    }

    /**
     * Overview Section - Key statistics and unit description
     */
    generateOverview(unit) {
        const { stats } = unit;
        const typeLabel = this._getUnitTypeLabel(unit.type);

        return `<!-- Unit Overview -->
<div class="section" style="background-color: #f8f9fa; padding: 40px 20px;">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6 mb-4 mb-lg-0">
                <h2 class="fw-bold mb-4">About This ${typeLabel}</h2>
                <p style="font-size: 1.1rem; line-height: 1.8; color: #333;">
                    The Salvation Army ${unit.displayName} serves ${unit.stats.centerCount} 
                    location${unit.stats.centerCount !== 1 ? 's' : ''} across our region, offering 
                    hope and transformation through diverse programs and services. We're committed to 
                    serving families, children, youth, and those in need with compassion and purpose.
                </p>
                <div class="mt-4">
                    <a href="#centers" class="btn btn-primary" style="background-color: #20B3A8; border: none;">
                        Explore Our Centers
                    </a>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="card border-0 shadow-sm" style="background: white;">
                            <div class="card-body text-center">
                                <h3 class="text-primary" style="color: #20B3A8; font-size: 2rem; font-weight: bold;">
                                    ${stats.centerCount}
                                </h3>
                                <p class="card-text text-muted">Location${stats.centerCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="card border-0 shadow-sm" style="background: white;">
                            <div class="card-body text-center">
                                <h3 class="text-primary" style="color: #20B3A8; font-size: 2rem; font-weight: bold;">
                                    ${stats.programCount}
                                </h3>
                                <p class="card-text text-muted">Programs</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="card border-0 shadow-sm" style="background: white;">
                            <div class="card-body text-center">
                                <h3 class="text-primary" style="color: #20B3A8; font-size: 2rem; font-weight: bold;">
                                    ${stats.staffCount}
                                </h3>
                                <p class="card-text text-muted">Staff &amp; Leaders</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="card border-0 shadow-sm" style="background: white;">
                            <div class="card-body text-center">
                                <h3 class="text-primary" style="color: #20B3A8; font-size: 2rem; font-weight: bold;">
                                    ${this._formatNumber(stats.youthServed)}+
                                </h3>
                                <p class="card-text text-muted">Youth Served</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Centers Grid - All centers in this unit
     */
    generateCenters(unit) {
        if (!unit.centers || unit.centers.length === 0) {
            return '';
        }

        const centerCards = unit.centers.map(center => {
            const centerName = this.escapeHTML(center.name || 'Salvation Army Center');
            const city = this.escapeHTML(center.city || 'City');
            const state = this.escapeHTML(center.state || '');
            const phone = this.escapeHTML(center.phone || '');
            const programCount = (center.programs && center.programs.length) || 0;
            const centerId = this.escapeHTML(center.id || '');

            return `
            <div class="col-sm-12 col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm hover-card" style="border: none; border-radius: 12px; overflow: hidden; cursor: pointer;" onclick="if (typeof RSYCLoadProfile === 'function') RSYCLoadProfile('${centerId}', this.closest('.modal-body') || document.body); else window.location.hash='center/${centerId}';">
                    <div class="card-body" style="background: #fff; padding: 1.5rem;">
                        <h5 class="card-title fw-bold mb-2" style="color: #20B3A8; font-size: 1.1rem;">
                            ${centerName}
                        </h5>
                        <p class="card-text text-muted mb-3" style="font-size: 0.95rem;">
                            <i class="bi bi-geo-alt me-1"></i>${city}${state ? ', ' + state : ''}
                        </p>
                        ${phone ? `<p class="card-text text-muted mb-3" style="font-size: 0.95rem;">
                            <i class="bi bi-telephone me-1"></i><a href="tel:${phone.replace(/\D/g, '')}" style="color: #20B3A8; text-decoration: none;">${phone}</a>
                        </p>` : ''}
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">${programCount} Program${programCount !== 1 ? 's' : ''}</span>
                            <span style="color: #20B3A8; cursor: pointer;">Learn More →</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        return `<!-- Centers Grid -->
<div id="centers" class="section" style="background-color: white; padding: 60px 20px;">
    <div class="container">
        <h2 class="fw-bold mb-5 text-center">Our Centers</h2>
        <div class="row">
            ${centerCards}
        </div>
    </div>
</div>`;
    }

    /**
     * Programs Section - Aggregate featured programs
     */
    generatePrograms(unit) {
        if (!unit.centers || unit.centers.length === 0) {
            return '';
        }

        // Collect unique programs across all centers
        const allPrograms = [];
        const seenPrograms = new Set();

        unit.centers.forEach(center => {
            if (center.programs && Array.isArray(center.programs)) {
                center.programs.forEach(program => {
                    const programName = program.name || program;
                    if (!seenPrograms.has(programName)) {
                        seenPrograms.add(programName);
                        allPrograms.push({
                            name: programName,
                            icon: program.iconClass || 'bi-star'
                        });
                    }
                });
            }
        });

        if (allPrograms.length === 0) {
            return '';
        }

        // Sort programs alphabetically by name
        allPrograms.sort((a, b) => a.name.localeCompare(b.name));

        const displayPrograms = allPrograms.slice(0, 8);
        const programItems = displayPrograms.map(program => {
            return `<div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                <i class="bi ${this.escapeHTML(program.icon)} feature-icon me-2" style="color: #20B3A8; font-size: 1.5rem;"></i> 
                <span>${this.escapeHTML(program.name)}</span>
            </div>`;
        }).join('');

        return `<!-- Featured Programs -->
<div class="section" style="background-color: #f8f9fa; padding: 60px 20px;">
    <div class="container">
        <h2 class="fw-bold mb-5 text-center">Featured Programs</h2>
        <div class="row">
            <div class="col-lg-8 offset-lg-2">
                <div class="d-flex flex-wrap gap-3">
                    ${programItems}
                </div>
                ${allPrograms.length > 8 ? `
                <div class="text-center mt-4">
                    <p class="text-muted">+ ${allPrograms.length - 8} more programs available across our centers</p>
                </div>` : ''}
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Resources Section - Parents and youth resources
     */
    generateResources(unit) {
        return `<!-- Resources Section -->
<div class="section" style="background-color: white; padding: 60px 20px;">
    <div class="container">
        <h2 class="fw-bold mb-5 text-center">Resources for Families</h2>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card border-0 shadow-sm" style="border-left: 4px solid #20B3A8;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">For Parents</h5>
                        <ul style="list-style: none; padding: 0;">
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Program schedules and registration</li>
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Family support services</li>
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Child safety and development</li>
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Financial assistance programs</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card border-0 shadow-sm" style="border-left: 4px solid #20B3A8;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">For Youth</h5>
                        <ul style="list-style: none; padding: 0;">
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Leadership development programs</li>
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Summer camps and activities</li>
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Academic support and mentoring</li>
                            <li class="mb-2"><i class="bi bi-check-circle" style="color: #20B3A8; margin-right: 0.5rem;"></i>Career and life skills training</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Impact Section - Growth and success stories
     */
    generateImpact(unit) {
        const stats = unit.stats;
        
        return `<!-- Impact & Growth -->
<div class="section" style="background: linear-gradient(135deg, #20B3A8 0%, #1A8F8A 100%); padding: 60px 20px; color: white;">
    <div class="container">
        <h2 class="fw-bold mb-5 text-center">Our Impact</h2>
        <div class="row">
            <div class="col-md-4 mb-4 text-center">
                <div class="mb-3">
                    <i class="bi bi-people-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 style="font-size: 2.5rem; font-weight: bold;">${this._formatNumber(stats.youthServed)}+</h3>
                <p style="font-size: 1.1rem; opacity: 0.9;">Youth Served Annually</p>
            </div>
            <div class="col-md-4 mb-4 text-center">
                <div class="mb-3">
                    <i class="bi bi-graph-up-arrow" style="font-size: 3rem;"></i>
                </div>
                <h3 style="font-size: 2.5rem; font-weight: bold;">87%</h3>
                <p style="font-size: 1.1rem; opacity: 0.9;">Program Completion Rate</p>
            </div>
            <div class="col-md-4 mb-4 text-center">
                <div class="mb-3">
                    <i class="bi bi-heart-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 style="font-size: 2.5rem; font-weight: bold;">100%</h3>
                <p style="font-size: 1.1rem; opacity: 0.9;">Commitment to Our Mission</p>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-lg-8 offset-lg-2">
                <div class="card border-0" style="background: rgba(255,255,255,0.1); color: white;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">Success Story</h5>
                        <p class="card-text">
                            Through our programs and partnerships, we're transforming lives and strengthening families. 
                            With your support, we continue to provide hope, opportunity, and a pathway to better futures 
                            for those in need throughout our region.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Giving Section - Donation and support opportunities
     */
    generateGiving(unit) {
        const typeLabel = this._getUnitTypeLabel(unit.type);

        return `<!-- Giving Section -->
<div class="section" style="background-color: #f8f9fa; padding: 60px 20px;">
    <div class="container">
        <h2 class="fw-bold mb-5 text-center">Support Our Mission</h2>
        <div class="row">
            <div class="col-lg-8 offset-lg-2">
                <div class="card border-0 shadow">
                    <div class="card-body p-5">
                        <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem; color: #333;">
                            Your donation directly supports the vital programs and services we provide across our ${typeLabel.toLowerCase()}. 
                            Every contribution makes a difference in the lives of youth, families, and those in need.
                        </p>
                        
                        <div class="row mb-4">
                            <div class="col-md-6 mb-3">
                                <div class="p-3" style="background: #f0f0f0; border-radius: 8px;">
                                    <h6 class="fw-bold mb-2">$25</h6>
                                    <p class="text-muted small mb-3">Provides supplies for 10 youth in our programs</p>
                                    <a href="#" class="btn btn-sm" style="background-color: #20B3A8; color: white; border: none;">Give $25</a>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="p-3" style="background: #f0f0f0; border-radius: 8px;">
                                    <h6 class="fw-bold mb-2">$50</h6>
                                    <p class="text-muted small mb-3">Funds a week of after-school activities</p>
                                    <a href="#" class="btn btn-sm" style="background-color: #20B3A8; color: white; border: none;">Give $50</a>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="p-3" style="background: #f0f0f0; border-radius: 8px;">
                                    <h6 class="fw-bold mb-2">$100</h6>
                                    <p class="text-muted small mb-3">Supports a month of youth mentoring</p>
                                    <a href="#" class="btn btn-sm" style="background-color: #20B3A8; color: white; border: none;">Give $100</a>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="p-3" style="background: #f0f0f0; border-radius: 8px;">
                                    <h6 class="fw-bold mb-2">Custom Amount</h6>
                                    <p class="text-muted small mb-3">Give what you can to help our mission</p>
                                    <a href="#" class="btn btn-sm" style="background-color: #20B3A8; color: white; border: none;">Give Now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Leaders Section - Unit leadership and administration
     */
    generateLeaders(unit) {
        // For now, this shows a placeholder
        // Can be enhanced to pull leader data from centers if available
        const typeLabel = this._getUnitTypeLabel(unit.type);

        return `<!-- Leadership Section -->
<div class="section" style="background-color: white; padding: 60px 20px;">
    <div class="container">
        <h2 class="fw-bold mb-5 text-center">Leadership</h2>
        <div class="row">
            <div class="col-lg-8 offset-lg-2">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <p style="color: #666; line-height: 1.8;">
                            Our ${typeLabel.toLowerCase()} is led by dedicated commanders and administrators committed to 
                            serving our communities with excellence and compassion. Each of our ${unit.centers.length} 
                            center${unit.centers.length !== 1 ? 's' : ''} has skilled leaders focused on transforming lives through 
                            effective programs and quality service.
                        </p>
                        <div class="mt-4 pt-4 border-top">
                            <h6 class="fw-bold mb-3">Leadership Contacts</h6>
                            <p class="text-muted">
                                For inquiries about our ${typeLabel.toLowerCase()}, programs, or partnership opportunities, 
                                please contact one of our center directors listed on their individual profiles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Contact Section - Call to action
     */
    generateContact(unit) {
        return `<!-- Contact & Learn More -->
<div class="section" style="background: #f0f7f7; padding: 60px 20px;">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 offset-lg-2 text-center">
                <h2 class="fw-bold mb-4">Learn More About Our Work</h2>
                <p style="font-size: 1.1rem; color: #555; margin-bottom: 2rem;">
                    We'd love to hear from you. Explore our centers, learn about our programs, 
                    and discover how you can make a difference.
                </p>
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                    <a href="#centers" class="btn btn-primary" style="background-color: #20B3A8; border: none; padding: 0.75rem 2rem;">
                        <i class="bi bi-geo-alt me-2"></i>Visit Our Centers
                    </a>
                    <a href="#giving" class="btn btn-outline-primary" style="color: #20B3A8; border-color: #20B3A8; padding: 0.75rem 2rem;">
                        <i class="bi bi-heart me-2"></i>Support Our Mission
                    </a>
                    <a href="https://www.salvationarmyusa.org" target="_blank" class="btn btn-outline-secondary" style="padding: 0.75rem 2rem;">
                        <i class="bi bi-globe me-2"></i>Learn More
                    </a>
                </div>
                
                <div class="mt-5 pt-4 border-top">
                    <h6 class="fw-bold mb-3">Connect With Us</h6>
                    <div class="d-flex gap-3 justify-content-center">
                        <a href="#" class="text-decoration-none" style="color: #20B3A8;"><i class="bi bi-facebook" style="font-size: 1.5rem;"></i></a>
                        <a href="#" class="text-decoration-none" style="color: #20B3A8;"><i class="bi bi-instagram" style="font-size: 1.5rem;"></i></a>
                        <a href="#" class="text-decoration-none" style="color: #20B3A8;"><i class="bi bi-youtube" style="font-size: 1.5rem;"></i></a>
                        <a href="#" class="text-decoration-none" style="color: #20B3A8;"><i class="bi bi-twitter" style="font-size: 1.5rem;"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Helper: Get display label for unit type
     */
    _getUnitTypeLabel(type) {
        const labels = {
            'division': 'Division',
            'state': 'State',
            'city': 'City',
            'area-command': 'Area Command'
        };
        return labels[type] || 'Unit';
    }

    /**
     * Helper: Format large numbers
     */
    _formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Helper: Escape HTML special characters
     */
    escapeHTML(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Export for use in both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.RSYCUnitTemplates = RSYCUnitTemplates;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSYCUnitTemplates;
}
