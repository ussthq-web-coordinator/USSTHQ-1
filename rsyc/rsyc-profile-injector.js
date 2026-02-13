/**
 * RSYC Profile Injector
 * Loads profiles into divs using client-side rendering (rsyc-profile-publisher approach)
 * Usage: Add <div data-rsyc-center-id="centerId"></div> to your page
 * Then include: <script src="https://thisishoperva.org/rsyc/rsyc-profile-injector.js"></script>
 */

(function() {
    console.log('[RSYCProfileInjector] Initializing...');

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
        enabledSections: ['hero', 'about', 'schedules', 'hours', 'facilities', 'programs', 'staff', 'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact']
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
     * Load and render a profile into a container (optimized)
     */
    async function loadProfile(centerId, targetElement, enabledSections = null) {
        try {
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

            // Generate profile HTML using the template engine (exactly like generator.js)
            const templateEngine = new window.RSYCTemplates();
            
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
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* Ensure the injected profile wrapper does not add extra space at the bottom */
.rsyc-profile {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 100vh !important;
}

/* Let the footer photo grow to fill remaining viewport space on short profiles */
#freeTextArea-footerPhoto {
  flex-grow: 1 !important;
}

#freeTextArea-footerPhoto .u-positionRelative {
  min-height: 100% !important;
}

/* Override the huge freeTextArea height and padding */
.freeTextArea.u-centerBgImage.u-sa-whiteBg.u-coverBgImage {
  height: auto !important;
  min-height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Remove the empty placeholder block that can appear between footer scripture and the global footer */
#freeTextArea-0 {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
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
  margin-bottom: 0 !important;
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

            // Load custom styles
            loadCustomStyles();

            console.log(`[RSYCProfileInjector] ✅ Profile loaded: ${centerData.center.name}`);

        } catch (error) {
            console.error('[RSYCProfileInjector] Error:', error);
            
            // Clear loading skeleton on error
            clearLoadingSkeleton();
            
            targetElement.innerHTML = `<div style="padding: 40px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; text-align: center; font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 40px auto;">
                <div style="font-size: 48px; margin-bottom: 16px;">👋</div>
                <h2 style="color: #333; font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Thanks for stopping by!</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">This Center Profile page did not load successfully. Please refresh and try again.</p>
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

