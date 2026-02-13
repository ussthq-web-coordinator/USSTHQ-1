/**
 * RSYC Unit Injector
 * Loads and renders unit pages (Division, State, City, Area Command) into divs
 * Usage: Add <div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
 */

(function() {
    console.log('[RSYCUnitInjector] Initializing...');

    // Stop if in admin environment to prevent interference with CMS editor
    if (window.location.href.includes('/admin/') || window.location.hostname.includes('webmanager')) {
        console.log('[RSYCUnitInjector] Admin environment detected, skipping injection.');
        return;
    }

    /**
     * Global unit configuration
     */
    window.RSYCUnitConfig = window.RSYCUnitConfig || {
        enabledSections: ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'leaders', 'contact']
    };

    /**
     * Show loading skeleton for faster perceived performance
     */
    let loadingTimeoutId = null;
    
    function showLoadingSkeleton(targetElement, unitType, unitValue) {
        // Only show text if it's not the "all" unit type
        const showText = unitType !== 'all';
        const titleText = showText ? `<h3 style="margin: 0; color: #333; font-family: sans-serif;">Loading ${unitType} Profile...</h3>` : '';
        const subText = showText ? `<p style="color: #666; margin-top: 10px;">${unitValue}</p>` : '';

        targetElement.innerHTML = `
            <div class="rsyc-unit-skeleton" style="padding: 40px; text-align: center; background: #f8f9fa; border-radius: 12px; border: 1px solid #eee; margin: 20px 0;">
                <div style="display: inline-block; width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #d93d3d; border-radius: 50%; animation: rsyc-spin 1s linear infinite; margin-bottom: 20px;"></div>
                ${titleText}
                ${subText}
                <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                    <div style="height: 200px; background: #eee; border-radius: 8px; animation: rsyc-pulse 1.5s infinite;"></div>
                    <div style="height: 200px; background: #eee; border-radius: 8px; animation: rsyc-pulse 1.5s infinite; animation-delay: 0.2s;"></div>
                    <div style="height: 200px; background: #eee; border-radius: 8px; animation: rsyc-pulse 1.5s infinite; animation-delay: 0.4s;"></div>
                </div>
            </div>
            <style>
                @keyframes rsyc-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes rsyc-pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
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
     * Load and render a unit page into a container
     */
    async function loadUnitPage(unitType, unitValue, targetElement, unitSection = 'all') {
        try {
            console.log(`[RSYCUnitInjector] Loading ${unitType}: ${unitValue}`);

            // Start timer for loading skeleton (only show after 600ms)
            loadingTimeoutId = setTimeout(() => {
                showLoadingSkeleton(targetElement, unitType, unitValue);
            }, 600);

            // Determine base URL
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? window.location.origin
                : 'https://thisishoperva.org';

            // Use hourly cache buster instead of millisecond for better performance
            const hourlyVersion = Math.floor(Date.now() / 3600000);
            const cacheBuster = `?v=${hourlyVersion}`;

            console.log('[RSYCUnitInjector] Loading scripts from:', baseUrl);

            // Load required scripts in parallel
            await Promise.all([
                loadScript(`${baseUrl}/rsyc/rsyc-staff-order.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-data.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-cms-publisher.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-unit-data.js${cacheBuster}`),
                loadScript(`${baseUrl}/rsyc/rsyc-unit-templates.js${cacheBuster}`)
            ]);
            console.log('[RSYCUnitInjector] ✓ Loaded core scripts');
            
            // Load tracker in background
            loadScript(`${baseUrl}/rsyc/rsyc-tracker.js${cacheBuster}`).catch(() => {
                console.warn('[RSYCUnitInjector] Tracker script optional, continuing...');
            });

            // Verify classes are available
            if (!window.RSYCDataLoader) {
                throw new Error('RSYCDataLoader not found after loading rsyc-data.js');
            }
            if (!window.RSYCUnitDataLoader) {
                throw new Error('RSYCUnitDataLoader not found after loading rsyc-unit-data.js');
            }
            if (!window.RSYCUnitTemplates) {
                throw new Error('RSYCUnitTemplates not found after loading rsyc-unit-templates.js');
            }

            console.log('[RSYCUnitInjector] All classes loaded successfully');

            // Initialize data loaders
            const dataLoader = new window.RSYCDataLoader();
            const unitDataLoader = new window.RSYCUnitDataLoader(dataLoader);

            // 1. Load critical data (centers + photos)
            await dataLoader.loadCriticalData();
            console.log('[RSYCUnitInjector] ✓ Critical data loaded');
            
            // 2. Load optional data EARLY if this is an "all" unit (needed for staff grid)
            const normalizedValue = unitValue.toLowerCase() === 'all' ? 'all' : unitValue;
            if (unitType === 'all') {
                console.log('[RSYCUnitInjector] 📦 Pre-loading optional data for "all" unit (includes staff)...');
                await dataLoader.loadOptionalData();
                console.log('[RSYCUnitInjector] ✓ Optional data pre-loaded for all unit');
            }
            
            // 3. Build hierarchy (now has leaders available if "all" unit)
            console.log('[RSYCUnitInjector] 🏗️ Building unit hierarchy...');
            await unitDataLoader.buildUnitHierarchy();
            
            // Get the unit
            let unit = unitDataLoader.getUnit(unitType, normalizedValue);
            
            if (!unit) {
                console.warn(`[RSYCUnitInjector] ⚠️ Unit not found: ${unitType} - ${normalizedValue}, loading optional data to retry...`);
                // If not found after critical, wait for optional just in case, then check again
                await dataLoader.loadOptionalData();
                unit = unitDataLoader.getUnit(unitType, normalizedValue);
                
                if (!unit) {
                    // Final attempt: If it's type 'all', and we still don't have a unit, 
                    // check if building hierarchy failed despite having centers
                    if (unitType === 'all' && dataLoader.cache.centers?.length > 0) {
                        console.log('[RSYCUnitInjector] 🔄 Forcing "all" unit construction...');
                        await unitDataLoader.buildUnitHierarchy();
                        unit = unitDataLoader.getUnit('all', 'all');
                    }
                }
            }

            if (unit) {
                // Clear skeleton
                clearLoadingSkeleton();
                
                renderUnit(unit, targetElement, unitType, unitValue, unitSection);
                
                // Then load optional data in background if not already loaded
                if (!dataLoader.cache.schedules) {
                    dataLoader.loadOptionalData().then(() => {
                        console.log('[RSYCUnitInjector] 📦 Optional data loaded in background');
                    });
                }
            } else {
                clearLoadingSkeleton();
                throw new Error(`Unit not found: ${unitType} - ${unitValue}`);
            }

        } catch (error) {
            clearLoadingSkeleton();
            console.error('[RSYCUnitInjector] Error:', error);
            const errorDetails = `${error.message}<br><br><small style="opacity: 0.7;">Check browser console (F12) for detailed logs. Common causes:<br>• Script files not found (404 errors in Network tab)<br>• Center data not loading from SharePoint<br>• Missing dependencies</small>`;
            targetElement.innerHTML = `<div style="padding: 20px; background: #ffe6e6; color: #990000; border-radius: 8px; border: 1px solid #ffcccc; font-size: 14px;">
                <strong><i class="bi bi-exclamation-triangle"></i> Error loading unit page:</strong><br>${errorDetails}
            </div>`;
        }
    }

    /**
     * Render the unit page HTML and inject it
     */
    function renderUnit(unit, targetElement, unitType, unitValue, unitSection = 'all') {
        console.log(`[RSYCUnitInjector] Rendering unit: ${unit.displayName} (${unit.centers.length} centers, section: ${unitSection})`);

        // Generate unit page HTML
        const templateEngine = new window.RSYCUnitTemplates();
        let html = '';
        
        if (unitSection === 'staff') {
            // Read options from the target element's data attributes
            const ds = targetElement.dataset || {};
            const opts = {
                filters: ds.rsycStaffFilters === undefined ? true : String(ds.rsycStaffFilters) !== 'false',
                bg: ds.rsycStaffBg === undefined ? true : String(ds.rsycStaffBg) !== 'false',
                padding: ds.rsycStaffPadding || 'default'
            };

            // Show only staff grid, passing options
            html = templateEngine.generateStaffGridOnly(unit, opts);
        } else if (unitSection === 'centers') {
            // Show only centers grid
            const enabledSections = [];
            html = templateEngine.generateUnitProfile(unit, enabledSections);
        } else {
            // Show all sections (default)
            const enabledSections = window.RSYCUnitConfig.enabledSections || ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'leaders', 'contact'];
            html = templateEngine.generateUnitProfile(unit, enabledSections);
        }

        // Inject custom styles once
        if (!document.getElementById('rsyc-unit-injected-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'rsyc-unit-injected-styles';
            styleEl.type = 'text/css';
            styleEl.textContent = `
/* Hide navigation from the CMS if it's interfering with the unit page */
.localSites-website {
  display: none !important;
}

/* CMS Height Fixes */
#page, 
.freeTextArea.u-centerBgImage.u-sa-whiteBg.u-coverBgImage,
div #freeTextArea {
  height: auto !important;
  min-height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
}

.rsyc-unit-page {
  width: 100%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.rsyc-unit-page .section {
  width: 100%;
}

.rsyc-unit-page .container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hover effects for cards */
.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rsyc-unit-page h1 {
    font-size: 1.75rem !important;
  }
  
  .rsyc-unit-page h2 {
    font-size: 1.5rem !important;
  }
}

/* Feature icons */
.feature-icon {
  flex-shrink: 0;
  width: 32px;
  text-align: center;
}
`;
            document.head.appendChild(styleEl);
        }

        // Render unit page
        const container = document.createElement('div');
        container.className = 'rsyc-unit-page';
        container.id = `rsyc-unit-container-${unitType}-${_normalizeForId(unitValue)}`;
        container.innerHTML = html;

        // For 'all' type, append content; for others, replace content
        if (unitType === 'all') {
            targetElement.innerHTML = ''; // Clear anyway if it's the first render
            targetElement.appendChild(container);
        } else {
            targetElement.innerHTML = '';
            targetElement.appendChild(container);
        }

        // Load custom styles
        loadCustomStyles();

        console.log(`[RSYCUnitInjector] ✅ Unit page rendered: ${unit.displayName}`);
    }

    /**
     * Load a script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded (ignore query string version)
            const baseSrc = src.split('?')[0];
            const existing = document.querySelector(`script[src^="${baseSrc}"]`);
            if (existing) {
                console.log('[RSYCUnitInjector] Script already loaded:', baseSrc);
                resolve();
                return;
            }

            const shortSrc = src.split('/').pop();
            console.log('[RSYCUnitInjector] Loading script:', shortSrc);
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                console.log('[RSYCUnitInjector] ✓ Loaded:', shortSrc);
                resolve();
            };
            script.onerror = () => {
                const error = `Failed to load: ${shortSrc} (${src})`;
                console.error('[RSYCUnitInjector] ✗ ' + error);
                reject(new Error(error));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Load custom styles
     */
    async function loadCustomStyles() {
        if (document.getElementById('rsyc-unit-styles')) {
            return; // Already loaded
        }

        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? window.location.origin
                : 'https://thisishoperva.org';

            // Use hourly version
            const hourlyVersion = Math.floor(Date.now() / 3600000);
            const cacheBuster = `?v=${hourlyVersion}`;

            // Load main CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${baseUrl}/rsyc/rsyc-generator-v2.css${cacheBuster}`;
            document.head.appendChild(link);

            // Load custom styles
            try {
                const response = await fetch(`${baseUrl}/rsyc/rsyc-custom-styles.html${cacheBuster}`);
                if (response.ok) {
                    const customStylesContent = await response.text();
                    const styleContainer = document.createElement('div');
                    styleContainer.id = 'rsyc-unit-custom-styles';
                    styleContainer.innerHTML = customStylesContent;
                    document.head.appendChild(styleContainer);
                }
            } catch (e) {
                console.warn('[RSYCUnitInjector] Could not load custom styles:', e.message);
            }

            // Mark as loaded
            const marker = document.createElement('style');
            marker.id = 'rsyc-unit-styles';
            document.head.appendChild(marker);

        } catch (error) {
            console.warn('[RSYCUnitInjector] Style loading error:', error.message);
        }
    }

    /**
     * Initialize unit pages on page load
     */
    function initializeUnitPages() {
        console.log('[RSYCUnitInjector] Looking for unit page containers...');

        // Find all elements with unit page attributes
        document.querySelectorAll('[data-rsyc-unit-type]').forEach((container) => {
            const unitType = container.dataset.rsycUnitType;
            const unitValue = container.dataset.rsycUnitValue;
            const unitSection = container.dataset.rsycUnitSection || 'all';

            if (unitType && unitValue) {
                console.log(`[RSYCUnitInjector] Found unit page: ${unitType} - ${unitValue} (section: ${unitSection})`);
                loadUnitPage(unitType, unitValue, container, unitSection);
            }
        });
    }

    /**
     * Normalize string for ID use
     */
    function _normalizeForId(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    // Expose global function for manual loading
    window.RSYCLoadUnitPage = function(unitType, unitValue, targetElement) {
        console.log(`[RSYCUnitInjector] RSYCLoadUnitPage called for: ${unitType} - ${unitValue}`);
        loadUnitPage(unitType, unitValue, targetElement);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUnitPages);
    } else {
        initializeUnitPages();
    }

    console.log('[RSYCUnitInjector] ✅ Initialized');
})();
