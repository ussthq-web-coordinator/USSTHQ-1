/**
 * RSYC Profile Injector
 * Loads profiles into divs using client-side rendering (rsyc-profile-publisher approach)
 * Usage: Add <div data-rsyc-center-id="centerId"></div> to your page
 * Then include: <script src="https://thisishoperva.org/rsyc/rsyc-profile-injector.js"></script>
 */

(function() {
    console.log('[RSYCProfileInjector] Initializing...');

    // Inject og:image meta tag into head
    const ogImageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg';
    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.setAttribute('content', ogImageUrl);
    console.log('[RSYCProfileInjector] Injected og:image meta tag:', ogImageUrl);

    // Stop if in admin environment to prevent interference with CMS editor
    if (window.location.href.includes('/admin/') || window.location.hostname.includes('webmanager')) {
        console.log('[RSYCProfileInjector] Admin environment detected, skipping injection.');
        return;
    }

    /**
     * Global sections configuration - can be set before loading profiles
     * Usage: window.RSYCProfileConfig.enabledSections = ['hero', 'about', 'schedules'];
     */
    window.RSYCProfileConfig = window.RSYCProfileConfig || {
        enabledSections: ['hero', 'about', 'navigation', 'schedules', 'hours', 'facilities', 'programs', 'midsectionPhoto', 'staff', 'events', 'infopages', 'stories', 'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact']
    };

    /**
     * Show loading skeleton for faster perceived performance (hidden by default)
     * Only shown if loading takes longer than threshold
     */
    let loadingTimeoutId = null;
    
    function showLoadingSkeleton(targetElement, centerName) {
        targetElement.innerHTML = `
            <div style="padding: 24px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 8px; margin-bottom: 16px; height: 200px;"></div>
            <style>
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            </style>
        `;
    }

    /**
     * Clear any pending loading skeleton
     */
    function clearLoadingSkeleton() {
        if (loadingTimeoutId) {
            clearTimeout(loadingTimeoutId);
            loadingTimeoutId = null;
        }
    }

    /**
     * Ensure modal functions are available
     * These are called from generated HTML onclick handlers
     */
    function ensureModalFunctions() {
        if (!window.showRSYCModal) {
            window.showRSYCModal = function(type, centerName) {
                console.log('[RSYCProfileInjector] showRSYCModal:', type);
                const modal = document.getElementById('rsyc-modal-' + type);
                if (modal) {
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                } else {
                    console.warn('[RSYCProfileInjector] Modal not found:', 'rsyc-modal-' + type);
                }
            };
        }
        if (!window.closeRSYCModal) {
            window.closeRSYCModal = function(type) {
                console.log('[RSYCProfileInjector] closeRSYCModal:', type);
                const modal = document.getElementById('rsyc-modal-' + type);
                if (modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                } else {
                    console.warn('[RSYCProfileInjector] Modal not found:', 'rsyc-modal-' + type);
                }
            };
        }
        if (!window.rsycNavigateStaffModal) {
            window.rsycNavigateStaffModal = function(groupKey, currentIndex, delta) {
                try {
                    const modals = Array.from(document.querySelectorAll(`.rsyc-modal[data-rsyc-staff-group="${groupKey}"]`));
                    if (!modals.length) {
                        console.warn('[RSYCProfileInjector] No staff modals found for group:', groupKey);
                        return;
                    }
                    const items = modals
                        .map(m => ({
                            el: m,
                            idx: Number(m.dataset.rsycStaffIndex),
                            type: m.id ? m.id.replace('rsyc-modal-', '') : ''
                        }))
                        .filter(x => Number.isFinite(x.idx) && x.type);
                    if (items.length <= 1) return;
                    items.sort((a, b) => a.idx - b.idx);
                    const curPos = items.findIndex(x => x.idx === Number(currentIndex));
                    if (curPos === -1) {
                        console.warn('[RSYCProfileInjector] Current staff index not found:', currentIndex);
                        return;
                    }
                    const nextPos = (curPos + delta + items.length) % items.length;
                    const current = items[curPos];
                    const next = items[nextPos];
                    if (current && current.type) {
                        const curEl = document.getElementById('rsyc-modal-' + current.type);
                        if (curEl) curEl.style.display = 'none';
                    }
                    if (next && next.type) {
                        const nextEl = document.getElementById('rsyc-modal-' + next.type);
                        if (nextEl) {
                            nextEl.style.display = 'flex';
                            document.body.style.overflow = 'hidden';
                        }
                    }
                } catch (e) {
                    console.error('[RSYCProfileInjector] Staff navigation failed:', e);
                }
            };
        }
        if (!window.printRSYCModal) {
            window.printRSYCModal = function(type) {
                console.log('[RSYCProfileInjector] printRSYCModal:', type);
                // The actual implementation is in rsyc-templates.js, this is a placeholder
                // but usually rsyc-templates.js is loaded first.
                if (typeof window.printRSYCModal === 'function' && window.printRSYCModal.toString().includes('window.open')) {
                    // It's already the full version
                }
            };
        }
        if (!window.toggleRSYCAccordion) {
            window.toggleRSYCAccordion = function(accordionId) {
                const content = document.getElementById(accordionId);
                const icon = document.getElementById(accordionId + '-icon');
                if (!content) {
                    console.warn('[RSYCProfileInjector] Accordion content not found:', accordionId);
                    return;
                }
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    if (icon) icon.style.transform = 'rotate(180deg)';
                } else {
                    content.style.display = 'none';
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            };
        }
        if (!window.toggleScheduleInfo) {
            window.toggleScheduleInfo = function(scheduleId) {
                const content = document.getElementById(scheduleId);
                const icon = document.getElementById(scheduleId + '-icon');
                if (!content) {
                    console.warn('[RSYCProfileInjector] Schedule content not found:', scheduleId);
                    return;
                }
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    if (icon) icon.style.transform = 'rotate(180deg)';
                } else {
                    content.style.display = 'none';
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            };
        }
        console.log('[RSYCProfileInjector] ✓ Modal functions ensured');
    }

    /**
     * Update page OG tags with center information when profile is loaded
     * 
     * IMPORTANT: This updates the parent page's OG tags for display only.
     * Social media crawlers (Facebook, Twitter, LinkedIn) don't execute JavaScript,
     * so they won't see these dynamically updated tags.
     * 
     * For social sharing, use the shareable preview URL:
     * /rsyc/rsyc-profile-preview.html?centerId=[id]
     * (The share buttons below the profile will link to this)
     */
    function updateOGTagsForCenter(center) {
        if (!center) return;

        try {
            console.log('[RSYCProfileInjector] Center object for OG tags:', center);
            
            // Handle various possible field names for center properties
            const title = center.Title || center.title || center.name || 'Red Shield Youth Center';
            const city = center.city || center.City || 'Your Community';
            const state = center.state || center.State || '';
            const websiteUrl = center.websiteURL || center.website || center.websiteUrl || 'https://www.redshieldyouth.org/';
            
            const cityState = state ? `${city}, ${state}` : city;
            const pageTitle = `${title} - Red Shield Youth Centers`;
            const pageDescription = `A safe, welcoming space in ${cityState} offering youth programs, activities, mentoring, and community support for kids and teens.`;
            const ogImageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg';
            
            console.log('[RSYCProfileInjector] OG Tag values:');
            console.log('  Title:', pageTitle);
            console.log('  Description:', pageDescription);
            console.log('  Image:', ogImageUrl);
            console.log('  URL:', websiteUrl);

            // Update or create OG meta tags
            const metaTags = {
                'og:title': pageTitle,
                'og:description': pageDescription,
                'og:image': ogImageUrl,
                'og:image:width': '1200',
                'og:image:height': '630',
                'og:url': websiteUrl
            };

            Object.entries(metaTags).forEach(([property, content]) => {
                let element = document.querySelector(`meta[property="${property}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute('property', property);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
                console.log(`  [${property}] = ${content}`);
            });

            // Update Twitter Card tags
            const twitterTags = {
                'twitter:title': pageTitle,
                'twitter:description': pageDescription,
                'twitter:image': ogImageUrl,
                'twitter:card': 'summary_large_image'
            };

            Object.entries(twitterTags).forEach(([name, content]) => {
                let element = document.querySelector(`meta[name="${name}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute('name', name);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            });

            // Update page title
            document.title = pageTitle;

            console.log('[RSYCProfileInjector] ✅ OG tags updated for:', title);
        } catch (error) {
            console.warn('[RSYCProfileInjector] Error updating OG tags:', error);
        }
    }

    /**
     * Load and render a profile into a container (optimized)
     */
    async function loadProfile(centerId, targetElement, enabledSections = null) {
        try {
            // START: Ensure modal functions are available IMMEDIATELY
            ensureModalFunctions();
            
            // Start timer for loading skeleton (only show after 1.5 seconds)
            loadingTimeoutId = setTimeout(() => {
                showLoadingSkeleton(targetElement);
            }, 1500);

            // Load required scripts if not already loaded
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? window.location.origin
                : 'https://thisishoperva.org';

            // Use hourly cache buster instead of millisecond for better performance
            const hourlyVersion = Math.floor(Date.now() / 3600000);
            const cacheBuster = `?v=${hourlyVersion}`;

            console.log('[RSYCProfileInjector] Loading scripts from:', baseUrl);
            
            // Load support scripts in parallel - rsyc-data can load in parallel with others
            await Promise.all([
                loadScript(`${baseUrl}/rsyc/rsyc-staff-order.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-data.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-cms-publisher.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-templates.js${cacheBuster}`),
            ]);
            console.log('[RSYCProfileInjector] ✓ Loaded core scripts');
            
            // Load tracker in background after initial render
            loadScript(`${baseUrl}/rsyc/rsyc-tracker.js${cacheBuster}`).catch(() => {
                console.warn('[RSYCProfileInjector] Tracker script optional, continuing...');
            });

            // Verify classes are available
            if (!window.RSYCDataLoader) {
                console.error('[RSYCProfileInjector] Available window properties:', Object.keys(window).filter(k => k.includes('RSYC') || k.includes('rsyc')));
                throw new Error('RSYCDataLoader not found after loading rsyc-data.js');
            }
            if (!window.RSYCTemplates) {
                console.error('[RSYCProfileInjector] Available window properties:', Object.keys(window).filter(k => k.includes('RSYC') || k.includes('rsyc')));
                throw new Error('RSYCTemplates not found after loading rsyc-templates.js');
            }

            console.log('[RSYCProfileInjector] All classes loaded successfully');

            // Initialize data loader with cache
            const dataLoader = new window.RSYCDataLoader();
            console.log('[RSYCProfileInjector] Initializing data loader...');
            
            // Load ALL data (critical + optional) for complete profile
            await dataLoader.loadCriticalData();
            await dataLoader.loadOptionalData();
            console.log('[RSYCProfileInjector] All data loaded');

            // Get center data
            const centerData = await dataLoader.getCenterData(centerId);
            if (!centerData || !centerData.center) {
                // Log available centers for debugging
                const availableCenters = dataLoader.cache.centers.slice(0, 5).map(c => `${c.name} (${c.id})`).join(', ');
                console.error('[RSYCProfileInjector] Available centers:', availableCenters);
                console.error('[RSYCProfileInjector] Total centers loaded:', dataLoader.cache.centers.length);
                throw new Error(`Center not found: ${centerId}. Check console for available centers.`);
            }

            console.log('[RSYCProfileInjector] Center found:', centerData.center.name);

            // Filter programs to show only featured programs for this center
            if (centerData.programs && Array.isArray(centerData.programs)) {
                const center = centerData.center;
                const featuredProgramIds = center['FeaturedPrograms#Id'] || center.FeaturedProgramIds || [];
                console.log('[RSYCProfileInjector] Center featured program IDs:', featuredProgramIds);
                
                const featuredPrograms = centerData.programs.filter(p => featuredProgramIds.includes(p.Id));
                console.log(`[RSYCProfileInjector] Filtered programs: ${centerData.programs.length} total → ${featuredPrograms.length} featured`);
                centerData.programs = featuredPrograms;
            }

            // Generate profile HTML using the template engine (exactly like generator.js)
            const templateEngine = new window.RSYCTemplates();
            
            // --- START HOTFIX: Essential Patch for Midsection Photo & Navigation Support ---
            // This ensures features render even if the browser loads a cached/stale rsyc-templates.js
            
            // 1. Polyfill generateMidsectionPhoto
            if (typeof templateEngine.generateMidsectionPhoto !== 'function' || true) { // FORCE OVERRIDE
                console.log('[RSYCProfileInjector] Hot-patching generateMidsectionPhoto');
                templateEngine.generateMidsectionPhoto = function(data) {
                    const imageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/d731081c-1e2c-4ffb-9a22-595ce1e1effc_Youth+arriving+from+school+to+Red+Shield+Youth+Center+-CNC-04489.jpg';
                    return `<section id="midsectionPhoto" class="freeTextArea u-centerBgImage section u-coverBgImage" style="min-height: 400px; background-image: url('${imageUrl}'); background-size: cover; background-position: center !important; display: block !important; visibility: visible !important; opacity: 1 !important;"><div class="u-positionRelative" style="min-height: 400px; display: block !important; visibility: visible !important; opacity: 1 !important;"></div></section>`;
                };
            }

            // 2. Polyfill generateNavigation
            if (typeof templateEngine.generateNavigation !== 'function') {
                console.log('[RSYCProfileInjector] Hot-patching generateNavigation');
                templateEngine.generateNavigation = function(data) {
                    const { __enabledSections } = data;
                    if (!__enabledSections || !Array.isArray(__enabledSections)) return '';
                    
                    const navSections = __enabledSections.filter(key => 
                        key !== 'hero' && key !== 'about' && key !== 'navigation' && 
                        key !== 'footerPhoto' && key !== 'midsectionPhoto' && this.sections[key]
                    );

                    if (navSections.length === 0) return '';

                    const navLinks = navSections.map(key => {
                        const section = this.sections[key];
                        const name = section ? (section.name || key) : key;
                        return `<a href="${section.anchor}" class="btn btn-sm m-1" style="
                            background-color: rgba(255, 255, 255, 0.15); 
                            border: 1px solid rgba(255, 255, 255, 0.4); 
                            color: #fff; 
                            border-radius: 50px; 
                            padding: 0.4rem 1.2rem; 
                            font-weight: 600; 
                            font-size: 0.9rem; 
                            transition: all 0.2s ease; 
                            backdrop-filter: blur(4px); 
                            text-decoration: none; 
                            display: inline-block;
                        " onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 0.25)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.15)'; this.style.transform='translateY(0)';">${name}</a>`;
                    }).join('');

                    return `<div id="navigation" class="section u-sa-tealBg" style="background-color: #00929C !important; padding-bottom: 3rem; margin-top: -1.5rem;"><div class="container"><div class="row justify-content-center"><div class="col-12 col-lg-10 text-center"><p class="small mb-3 text-uppercase fw-bold text-white" style="letter-spacing: 1.5px; opacity: 0.85; font-size: 0.8rem;">Jump To Section</p><div class="d-flex flex-wrap justify-content-center gap-2">${navLinks}</div></div></div></div></div>`;
                };
            }

            // 3. Ensure Metadata & Order
            if (templateEngine.sections) {
                if (!templateEngine.sections.navigation) templateEngine.sections.navigation = { name: 'Navigation', anchor: '#navigation', order: 2.5 };
                if (!templateEngine.sections.midsectionPhoto) templateEngine.sections.midsectionPhoto = { name: 'Midsection Photo', anchor: '#midsectionPhoto', order: 10.5 };
                
                // Set explicit orders
                if (templateEngine.sections.hero) templateEngine.sections.hero.order = 1;
                if (templateEngine.sections.about) templateEngine.sections.about.order = 2;
                if (templateEngine.sections.navigation) templateEngine.sections.navigation.order = 2.5;
                if (templateEngine.sections.midsectionPhoto) templateEngine.sections.midsectionPhoto.order = 10.5;
                if (templateEngine.sections.volunteer) templateEngine.sections.volunteer.order = 14;
                if (templateEngine.sections.nearby) templateEngine.sections.nearby.order = 15;
            }

            // 4. Force using a sorted generator to guarantee order
            // This replaces the old generatedProfile method which might not sort by 'order' property
            templateEngine.generateProfile = function(centerData, enabledSections) {
                console.log('[RSYC] using Hotfixed generateProfile');
                const sections = [];
                const sortedKeys = Object.keys(this.sections).sort((a, b) => 
                    (this.sections[a].order || 0) - (this.sections[b].order || 0)
                );
                sortedKeys.forEach(sectionKey => {
                    if (enabledSections.includes(sectionKey)) {
                        const html = this.generateSection(sectionKey, { ...centerData, __enabledSections: enabledSections });
                        if (html) sections.push(html);
                    }
                });
                
                // Add audit modal and joinCenter modal
                let modals = '';
                console.log('[RSYC] Checking for modal generation methods:');
                console.log('[RSYC] generateAuditModal exists:', typeof this.generateAuditModal);
                console.log('[RSYC] generateJoinCenterModal exists:', typeof this.generateJoinCenterModal);
                
                if (this.generateAuditModal) {
                    modals += '\n\n' + this.generateAuditModal(enabledSections);
                    console.log('[RSYC] Audit modal added to hotfixed profile');
                }
                if (this.generateJoinCenterModal) {
                    modals += '\n\n' + this.generateJoinCenterModal();
                    console.log('[RSYC] Join Center modal added to hotfixed profile');
                } else {
                    console.log('[RSYC] generateJoinCenterModal method not found!');
                }
                
                return sections.join('\n\n') + modals;
            };
            // --- END HOTFIX ---

            // Patch section order to ensure "Nearby" is below "Volunteer" (older templates might have wrong order)
            if (templateEngine.sections && templateEngine.sections.volunteer && templateEngine.sections.nearby) {
                templateEngine.sections.volunteer.order = 14;
                templateEngine.sections.nearby.order = 15;
                console.log('[RSYCProfileInjector] Patched section order: Volunteer(14), Nearby(15)');
            }
            
            // Use sections from global config
            const contentSections = window.RSYCProfileConfig.enabledSections;
            console.log('[RSYCProfileInjector] Using configured sections:', contentSections.join(', '));

            // Generate complete profile using generateProfile (exactly like generator.js)
            const html = templateEngine.generateProfile(centerData, contentSections);
            
            console.log('[RSYCProfileInjector] ✅ Profile generated:', centerData.center.name);

            // Clear the loading skeleton timer since we have content
            clearLoadingSkeleton();

            // Inject custom styles once
            if (!document.getElementById('rsyc-injected-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'rsyc-injected-styles';
                styleEl.type = 'text/css';
                styleEl.textContent = `
.localSites-items,
.localSites-item {
  height: auto !important;
  min-height: auto !important;
}

/* Hide the "Visit Website" link completely */
.localSites-website {
  display: none !important;
}

/* Override the huge page height */
#page {
  height: auto !important;
  min-height: auto !important;
}

/* Override the huge freeTextArea height and padding */
.freeTextArea.u-centerBgImage.u-sa-whiteBg.u-coverBgImage {
  height: auto !important;
  min-height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
}

div #freeTextArea {
  margin-bottom: -75px !important;
  height: auto !important;
  min-height: auto !important;
  padding: 0 !important;
}
  
#freeTextArea-scripture .container {
  padding-bottom: 25px !important;
  margin-bottom: 0 !important;
}

#freeTextArea-scripture {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 60px 20px !important;
}

#freeTextArea-scripture .u-positionRelative {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
}

#freeTextArea-scripture p:last-child {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* Mobile-specific padding for footer scripture */
@media (max-width: 768px) {
  #freeTextArea-scripture {
    padding: 60px 20px 100px 20px !important;
  }
}

/* Center and style videos/embeds - keep original size with rounded corners */
.rsyc-profile video,
.rsyc-profile iframe,
.rsyc-profile embed {
  display: block !important;
  margin: 20px auto !important;
  border-radius: 8px !important;
}
`;
                document.head.appendChild(styleEl);
            }

            // Render complete profile immediately (match generator approach)
            const container = document.createElement('div');
            container.className = 'rsyc-profile';
            container.id = `rsyc-container-${centerId}`;
            container.innerHTML = html;

            targetElement.innerHTML = '';
            targetElement.appendChild(container);

            // Augment nearby section if the loaded template hasn't been updated yet
            (function augmentNearbySection() {
                try {
                    const center = centerData.center || {};
                    const allCenters = centerData.allCenters || [];
                    const nearbyEl = container.querySelector('#nearby');
                    if (!nearbyEl) return; // nothing to do

                    // If the template already contains the new nearby marker or pills, skip augmentation
                    // Check for updated versions including the restore version
                    const currentVersion = nearbyEl.dataset.rsycNearbyVersion;
                    if (currentVersion === 'v2026-02-16' || currentVersion === 'v2026-02-16-restore' || nearbyEl.querySelector('.rsyc-nearby-pills')) {
                        console.log('[RSYCProfileInjector] Nearby section already upgraded by templates; skipping augmentation');
                        return;
                    }

                    const parentCorpsName = center.corpName || center.field_8 || '';
                    const areaCommandName = center.areaCommand || center.field_17 || '';
                    const divisionName = center.division || '';

                    // Build pills HTML (Parent > Area > Division)
                    let pillsHtml = '';
                    if (parentCorpsName || areaCommandName || divisionName) {
                        pillsHtml = `<div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-4 rsyc-nearby-pills">` +
                            (parentCorpsName ? `\n<span class="rsyc-parent-pill" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.45rem 0.75rem; border-radius:999px; background:#fff; border:1px solid #e6eef0; color:#2F4857; font-weight:600; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">\n<i class=\"bi bi-building\" style=\"color:#D93D3D; font-size:1.05rem;\"></i>Parent Center: ${escapeHtml(parentCorpsName)}\n</span>` : '') +
                            (areaCommandName ? `\n<span class="rsyc-area-pill" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.45rem 0.75rem; border-radius:999px; background:#fff; border:1px solid #e6eef0; color:#2F4857; font-weight:600; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">\n<i class=\"bi bi-diagram-3\" style=\"color:#20B3A8; font-size:1.05rem;\"></i>Area: ${escapeHtml(areaCommandName)}\n</span>` : '') +
                            (divisionName ? `\n<span class="rsyc-division-pill" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.45rem 0.75rem; border-radius:999px; background:#fff; border:1px solid #e6eef0; color:#2F4857; font-weight:600; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">\n<i class=\"bi bi-diagram-2\" style=\"color:#1877F2; font-size:1.05rem;\"></i>Division: ${escapeHtml(divisionName)}\n</span>` : '') +
                            `</div>`;
                    }

                    // Helper to normalize strings
                    const norm = v => String(v || '').toLowerCase().trim();
                    let matchedCenters = [];
                    const seenIds = new Set();
                    
                    // Add current center to seen to exclude it
                    const currentId = center.id ? String(center.id) : null;
                    const currentSpId = center.sharePointId ? String(center.sharePointId) : null;
                    if (currentId) seenIds.add(currentId);
                    
                    const addMatches = (matches) => {
                        matches.forEach(c => {
                            if (!c) return;
                            const cId = c.id ? String(c.id) : (c.sharePointId ? String(c.sharePointId) : null);
                            if (cId === currentId) return;
                            if (currentSpId && c.sharePointId && String(c.sharePointId) === currentSpId) return;

                            if (cId && !seenIds.has(cId)) {
                                seenIds.add(cId);
                                matchedCenters.push(c);
                            } else if (!cId) {
                                matchedCenters.push(c);
                            }
                        });
                    };

                    if (allCenters && Array.isArray(allCenters) && allCenters.length > 0) {
                        // A. Area Command Matches
                        if (areaCommandName) {
                            const areaNorm = norm(areaCommandName);
                            const areaMatches = allCenters.filter(c => {
                                const candidates = [c.areaCommand, c.field_17, c.field_10, c.corpName, c.field_8, c.name, c.Title];
                                return candidates.some(s => areaNorm && String(s || '').toLowerCase().trim().includes(areaNorm));
                            });
                            addMatches(areaMatches);
                        }

                        // B. Division Matches
                        if (divisionName) {
                            const divNorm = norm(divisionName);
                            const divMatches = allCenters.filter(c => {
                                return norm(c.division || '').includes(divNorm);
                            });
                            addMatches(divMatches);
                        }
                    }

                    matchedCenters.sort((a, b) => (String(a.name || '').toLowerCase()).localeCompare(String(b.name || '').toLowerCase()));

                    // Build center content: Area matches (Visible) + Other Division matches (Hidden) + Toggle Button
                    let areaCardsHtml = '';
                    let divisionOnlyCardsHtml = '';
                    let toggleButtonHtml = '';
                    let cardsHtml = ''; // Final combined HTML

                    // Helper to render card
                    const renderCard = (c, colClass) => {
                         const displayName = String((c.name || 'Salvation Army Center')).replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '').replace(/^rsyc\s+/i, '');
                        const centerName = escapeHtml(displayName);
                        const city = c.city || '';
                        const state = c.state || '';
                        let slugName = String((c.name || '')).replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '').replace(/^rsyc\s+/i, '');
                        const centerSlug = slugName.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/[^\w\-]/g, '');
                        const centerUrl = `/redshieldyouth/${centerSlug}`;
                        let imageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';
                        if (c.photos && c.photos.length > 0) {
                            const exteriorPhoto = c.photos.find(p => p.urlExteriorPhoto);
                            if (exteriorPhoto) imageUrl = exteriorPhoto.urlExteriorPhoto;
                            else {
                                const photo = c.photos[0];
                                imageUrl = photo.urlFacilityFeaturesPhoto || photo.urlProgramsPhoto || imageUrl;
                            }
                        }

                        return `\n<div class="${colClass}" style="max-width:350px;">
                            <a href="${centerUrl}" style="text-decoration:none; color:inherit; display:block;">
                                <div class="card h-100 shadow-sm border-0" style="border-radius:12px; overflow:hidden;">
                                    <div style="height:140px; overflow:hidden; position:relative;">
                                        <img src="${imageUrl}" alt="${centerName}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
                                        <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.6), transparent); display:flex; align-items:flex-end; padding:0.75rem;">
                                            <h5 style="color:white; margin:0; font-size:1rem; font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.3);">${centerName}</h5>
                                        </div>
                                    </div>
                                    <div class="card-body p-3 bg-white text-start">
                                        <div style="font-size:0.9rem; color:#555;">${escapeHtml(city)}${state ? ', ' + escapeHtml(state) : ''}</div>
                                        <div style="margin-top:0.5rem; font-weight:600; color:#00929C; font-size:0.85rem;">View Center <i class="bi bi-arrow-right"></i></div>
                                    </div>
                                </div>
                            </a>
                        </div>`;
                    };

                    if (matchedCenters.length > 0) {
                        let areaCenters = [];
                        let otherDivisionCenters = [];

                        if (areaCommandName) {
                            const areaNorm = norm(areaCommandName);
                            matchedCenters.forEach(c => {
                                const candidates = [c.areaCommand, c.field_17, c.field_10, c.corpName, c.field_8];
                                const isArea = candidates.some(s => areaNorm && String(s || '').toLowerCase().trim().includes(areaNorm));
                                if (isArea) {
                                    areaCenters.push(c);
                                } else {
                                    otherDivisionCenters.push(c);
                                }
                            });
                        } else {
                            otherDivisionCenters = matchedCenters;
                        }

                        // Render Logic
                        if (areaCenters.length > 0) {
                            areaCardsHtml = areaCenters.map(c => renderCard(c, 'col-md-4 mb-3')).join('');

                            if (otherDivisionCenters.length > 0) {
                                divisionOnlyCardsHtml = otherDivisionCenters.map(c => renderCard(c, 'col-md-4 mb-3')).join('');
                                
                                toggleButtonHtml = `
                                <div class="text-center mt-4" id="rsyc-nearby-toggle-btn-container-inj" style="width:100%;">
                                    <button id="rsyc-nearby-toggle-btn-inj" class="btn btn-outline-primary rounded-pill px-4" style="border-radius:50px; padding:8px 24px; border:1px solid #0d6efd; background:transparent; color:#0d6efd; font-weight:600;" onclick="
                                        const divList = document.getElementById('rsyc-nearby-division-list-inj');
                                        const btn = document.getElementById('rsyc-nearby-toggle-btn-inj');
                                        if (divList.style.display === 'none') {
                                            divList.style.display = 'flex';
                                            btn.innerHTML = 'View Less <i class=\\'bi bi-chevron-up ms-1\\'></i>';
                                        } else {
                                            divList.style.display = 'none';
                                            btn.innerHTML = 'View All in Division <i class=\\'bi bi-chevron-down ms-1\\'></i>';
                                        }
                                    ">
                                        View All in Division <i class="bi bi-chevron-down ms-1"></i>
                                    </button>
                                </div>`;
                            }
                        } else {
                             // Fallback: If no dedicated area list, show everything
                             areaCardsHtml = matchedCenters.map(c => renderCard(c, 'col-md-4 mb-3')).join('');
                        }

                        const sectionTitle = `Other Centers in Your <em style="color:#20B3A8;">Area</em>`;

                        cardsHtml = `
                        <div style="margin-top:1rem; width:100%;">
                            <h3 class="fw-bold mb-4 text-center">${sectionTitle}</h3>
                            
                            <!-- Area List (Default) -->
                            <div id="rsyc-nearby-area-list-inj" class="row justify-content-center">
                                ${areaCardsHtml}
                            </div>

                            <!-- Division List (Hidden) -->
                            ${divisionOnlyCardsHtml ? `
                            <div id="rsyc-nearby-division-list-inj" class="row justify-content-center" style="display:none; margin-top:0;">
                                ${divisionOnlyCardsHtml}
                            </div>
                            ` : ''}

                             <!-- Button -->
                            ${toggleButtonHtml}
                        </div>`;
                    }

                    // Insert pills and cards after the main row
                    const innerContainer = nearbyEl.querySelector('.container > .container') || nearbyEl.querySelector('.container');
                    const mainRow = innerContainer ? innerContainer.querySelector('.row') : null;
                    if (mainRow) {
                        const newContainer = document.createElement('div');
                        newContainer.className = 'row justify-content-center mt-5 pt-5 border-top';
                        newContainer.innerHTML = `<div class="col-12 text-center">${pillsHtml}</div><div class="col-12"><div id="rsyc-nearby-cards-wrap-inj">${cardsHtml}</div><div id="rsyc-nearby-pagination-inj" class="d-flex justify-content-center align-items-center gap-2 mt-3"></div></div>`;
                        mainRow.parentElement.appendChild(newContainer);
                        console.log('[RSYCProfileInjector] Nearby augmentation injected (hybrid mode)');

                        // Initialize pagination for nearby cards (responsive: 1 / 4 / 6)
                        (function initNearbyPaginationInj() {
                            try {
                                const wrap = mainRow.parentElement.querySelector('#rsyc-nearby-cards-wrap-inj');
                                const paginationEl = mainRow.parentElement.querySelector('#rsyc-nearby-pagination-inj');
                                if (!wrap || !paginationEl) return;

                                const cards = Array.from(wrap.querySelectorAll('.rsyc-nearby-card'));
                                if (!cards.length) return;

                                let currentPage = 0;

                                function getPerPage() {
                                    const w = window.innerWidth;
                                    if (w < 576) return 1;       // mobile
                                    return 6;                     // tablet and desktop
                                }

                                function render() {
                                    const perPage = getPerPage();
                                    const totalPages = Math.max(1, Math.ceil(cards.length / perPage));
                                    if (currentPage > totalPages - 1) currentPage = totalPages - 1;

                                    cards.forEach((c, i) => {
                                        const show = i >= currentPage * perPage && i < (currentPage + 1) * perPage;
                                        c.style.display = show ? '' : 'none';
                                    });

                                    // Build controls - cleaner design with Prev/Next only
                                    paginationEl.innerHTML = '';
                                    
                                    const prev = document.createElement('button');
                                    prev.className = 'btn btn-outline-secondary btn-sm';
                                    prev.type = 'button';
                                    prev.innerHTML = '<i class="bi bi-chevron-left"></i> Prev';
                                    prev.disabled = currentPage === 0;
                                    prev.style.cssText = 'border-radius: 6px; font-weight: 500; min-width: 90px;';
                                    prev.onclick = () => { if (currentPage > 0) { currentPage--; render(); } };
                                    paginationEl.appendChild(prev);

                                    const indicator = document.createElement('div');
                                    indicator.style.cssText = 'padding: 0.5rem 1.5rem; font-weight: 500; color: #495057; white-space: nowrap;';
                                    indicator.textContent = `${currentPage + 1} of ${totalPages}`;
                                    paginationEl.appendChild(indicator);

                                    const next = document.createElement('button');
                                    next.className = 'btn btn-outline-secondary btn-sm';
                                    next.type = 'button';
                                    next.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
                                    next.disabled = currentPage >= totalPages - 1;
                                    next.style.cssText = 'border-radius: 6px; font-weight: 500; min-width: 90px;';
                                    next.onclick = () => { if (currentPage < totalPages - 1) { currentPage++; render(); } };
                                    paginationEl.appendChild(next);
                                }

                                let resizeTimer = null;
                                window.addEventListener('resize', function() {
                                    clearTimeout(resizeTimer);
                                    resizeTimer = setTimeout(function() { render(); }, 150);
                                });

                                render();
                            } catch (e) {
                                console.warn('[RSYCProfileInjector] Nearby pagination init failed:', e);
                            }
                        })();
                    }
                } catch (e) {
                    console.warn('[RSYCProfileInjector] Nearby augmentation failed:', e);
                }

                // Simple HTML-escaping helper
                function escapeHtml(str) {
                    if (!str) return '';
                    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                }
            })();

            // Augment About section with Navigation Menu - DEPRECATED
            // Note: Navigation is now a first-class section 'navigation' added to enabledSections.
            // Keeping this empty block to maintain structural integrity in case of reverts.
            (function augmentAboutSection() {
                // Disabled in favor of native section
            })();

            // Load custom styles
            loadCustomStyles();

            console.log(`[RSYCProfileInjector] ✅ Profile loaded: ${centerData.center.name}`);
            
            // Update page OG tags with this center's information (for display, not social sharing)
            updateOGTagsForCenter(centerData.center);

        } catch (error) {
            console.error('[RSYCProfileInjector] Error:', error);
            
            // Clear loading skeleton on error
            clearLoadingSkeleton();
            
            targetElement.innerHTML = `<div style="padding: 20px; background: #ffe6e6; color: #990000; border-radius: 8px; border: 1px solid #ffcccc;">
                <strong>Error loading profile:</strong> ${error.message}
            </div>`;
        }
    }

    /**
     * Load a script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already in DOM (ignore query string version)
            const baseSrc = src.split('?')[0];
            const existing = document.querySelector(`script[src^="${baseSrc}"]`);
            if (existing) {
                console.log('[RSYCProfileInjector] Script already loaded:', baseSrc);
                resolve();
                return;
            }

            console.log('[RSYCProfileInjector] Adding script tag:', src);
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                console.log('[RSYCProfileInjector] Script onload fired:', src);
                // Minimal delay to ensure script initializes
                resolve();
            };
            script.onerror = () => {
                reject(new Error(`Failed to load: ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Load custom styles
     */
    async function loadCustomStyles() {
        if (document.getElementById('rsyc-injector-styles')) {
            return; // Already loaded
        }

        try {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3001'
                : 'https://thisishoperva.org';

            // Load main CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${baseUrl}/rsyc/rsyc-generator-v2.css`;
            document.head.appendChild(link);

            // Load custom styles HTML
            try {
                const response = await fetch(`${baseUrl}/rsyc/rsyc-custom-styles.html`);
                if (response.ok) {
                    const customStylesContent = await response.text();
                    const styleContainer = document.createElement('div');
                    styleContainer.id = 'rsyc-custom-styles';
                    styleContainer.innerHTML = customStylesContent;
                    document.head.appendChild(styleContainer);
                }
            } catch (e) {
                console.warn('[RSYCProfileInjector] Could not load custom styles:', e.message);
            }

            // Add marker to prevent duplicate loads
            const marker = document.createElement('style');
            marker.id = 'rsyc-injector-styles';
            document.head.appendChild(marker);

        } catch (error) {
            console.warn('[RSYCProfileInjector] Style loading error:', error.message);
        }
    }

    /**
     * Initialize profiles on page load
     */
    function initializeProfiles() {
        console.log('[RSYCProfileInjector] Looking for profile containers...');

        // Handle data-rsyc-center-id divs
        document.querySelectorAll('[data-rsyc-center-id]').forEach((container) => {
            const centerId = container.dataset.rsycCenterId;
            
            if (centerId) {
                console.log(`[RSYCProfileInjector] Found profile container: ${centerId}`, `Sections: ${window.RSYCProfileConfig.enabledSections.join(', ')}`);
                loadProfile(centerId, container);
            }
        });

        // Handle script tag with data attributes
        const currentScript = document.currentScript;
        if (currentScript && currentScript.dataset.centerId && currentScript.dataset.elementId) {
            const element = document.getElementById(currentScript.dataset.elementId);
            if (element) {
                console.log(`[RSYCProfileInjector] Found profile element: ${currentScript.dataset.centerId}`);
                loadProfile(currentScript.dataset.centerId, element);
            }
        }
    }

    // Expose global function
    window.RSYCLoadProfile = function(centerId, targetElement) {
        console.log(`[RSYCProfileInjector] RSYCLoadProfile called for: ${centerId}`, `Sections: ${window.RSYCProfileConfig.enabledSections.join(', ')}`);
        loadProfile(centerId, targetElement);
    };

    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfiles);
    } else {
        initializeProfiles();
    }

    console.log('[RSYCProfileInjector] ✅ Initialized');
})();

