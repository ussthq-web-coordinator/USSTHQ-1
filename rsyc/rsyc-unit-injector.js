/**
 * RSYC Unit Injector
 * Loads and renders unit pages (Division, State, City, Area Command) into divs
 * Usage: Add <div data-rsyc-unit-type="division" data-rsyc-unit-value="Texas"></div>
 */

(function() {
    console.log('[RSYCUnitInjector] Initializing...');

    /**
     * Global unit configuration
     */
    window.RSYCUnitConfig = window.RSYCUnitConfig || {
        enabledSections: ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'leaders', 'contact']
    };

    /**
     * Load and render a unit page into a container
     */
    async function loadUnitPage(unitType, unitValue, targetElement) {
        try {
            console.log(`[RSYCUnitInjector] Loading ${unitType}: ${unitValue}`);

            // Determine base URL
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? window.location.origin
                : 'https://thisishoperva.org';

            const cacheBuster = `?v=${new Date().getTime()}`;

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

            // Load all data
            await dataLoader.loadCriticalData();
            await dataLoader.loadOptionalData();
            console.log('[RSYCUnitInjector] ✓ Center data loaded');

            // Build unit hierarchy
            const units = await unitDataLoader.buildUnitHierarchy();
            console.log('[RSYCUnitInjector] ✓ Unit hierarchy built');

            // Get the specific unit
            const unit = unitDataLoader.getUnit(unitType, unitValue);
            if (!unit) {
                throw new Error(`Unit not found: ${unitType} - ${unitValue}`);
            }

            console.log(`[RSYCUnitInjector] ✓ Unit found: ${unit.displayName} (${unit.centers.length} centers)`);

            // Generate unit page HTML
            const templateEngine = new window.RSYCUnitTemplates();
            const enabledSections = window.RSYCUnitConfig.enabledSections || ['hero', 'overview', 'centers', 'programs', 'resources', 'impact', 'giving', 'leaders', 'contact'];
            
            const html = templateEngine.generateUnitProfile(unit, enabledSections);

            // Inject custom styles once
            if (!document.getElementById('rsyc-unit-injected-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'rsyc-unit-injected-styles';
                styleEl.type = 'text/css';
                styleEl.textContent = `
.rsyc-unit-page {
  width: 100%;
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

            targetElement.innerHTML = '';
            targetElement.appendChild(container);

            // Load custom styles
            loadCustomStyles();

            console.log(`[RSYCUnitInjector] ✅ Unit page loaded: ${unit.displayName}`);

        } catch (error) {
            console.error('[RSYCUnitInjector] Error:', error);
            const errorDetails = `${error.message}<br><br><small style="opacity: 0.7;">Check browser console (F12) for detailed logs. Common causes:<br>• Script files not found (404 errors in Network tab)<br>• Center data not loading from SharePoint<br>• Missing dependencies</small>`;
            targetElement.innerHTML = `<div style="padding: 20px; background: #ffe6e6; color: #990000; border-radius: 8px; border: 1px solid #ffcccc; font-size: 14px;">
                <strong><i class="bi bi-exclamation-triangle"></i> Error loading unit page:</strong><br>${errorDetails}
            </div>`;
        }
    }

    /**
     * Load a script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                console.log('[RSYCUnitInjector] Script already loaded:', src);
                resolve();
                return;
            }

            const shortSrc = src.split('/').pop();
            console.log('[RSYCUnitInjector] Loading script:', shortSrc);
            const script = document.createElement('script');
            script.src = src;
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
            const baseUrl = window.location.hostname === 'localhost'
                ? window.location.origin
                : 'https://thisishoperva.org';

            // Load main CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${baseUrl}/rsyc/rsyc-generator-v2.css`;
            document.head.appendChild(link);

            // Load custom styles
            try {
                const response = await fetch(`${baseUrl}/rsyc/rsyc-custom-styles.html`);
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

            if (unitType && unitValue) {
                console.log(`[RSYCUnitInjector] Found unit page: ${unitType} - ${unitValue}`);
                loadUnitPage(unitType, unitValue, container);
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
