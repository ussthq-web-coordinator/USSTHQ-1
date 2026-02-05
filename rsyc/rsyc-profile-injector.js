/**
 * RSYC Profile Injector
 * Loads profiles into divs using client-side rendering (rsyc-profile-publisher approach)
 * Usage: Add <div data-rsyc-center-id="centerId"></div> to your page
 * Then include: <script src="https://thisishoperva.org/rsyc/rsyc-profile-injector.js"></script>
 */

(function() {
    console.log('[RSYCProfileInjector] Initializing...');

    /**
     * Load and render a profile into a container
     */
    async function loadProfile(centerId, targetElement) {
        try {
            // Show loading state
            targetElement.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">Loading profile...</div>';

            // Load required scripts if not already loaded
            const baseUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3001'
                : 'https://thisishoperva.org';

            console.log('[RSYCProfileInjector] Loading scripts from:', baseUrl);
            
            // Load scripts in order - these must load before we use the classes
            await loadScript(`${baseUrl}/rsyc/rsyc-staff-order.js`);
            console.log('[RSYCProfileInjector] ✓ Loaded rsyc-staff-order.js');
            
            await loadScript(`${baseUrl}/rsyc/rsyc-data.js`);
            console.log('[RSYCProfileInjector] ✓ Loaded rsyc-data.js');
            
            await loadScript(`${baseUrl}/rsyc/rsyc-templates.js`);
            console.log('[RSYCProfileInjector] ✓ Loaded rsyc-templates.js');
            
            await loadScript(`${baseUrl}/rsyc/rsyc-tracker.js`);
            console.log('[RSYCProfileInjector] ✓ Loaded rsyc-tracker.js');

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

            // Initialize data loader
            const dataLoader = new window.RSYCDataLoader();
            console.log('[RSYCProfileInjector] Initializing data loader...');
            
            await dataLoader.loadAll();
            console.log('[RSYCProfileInjector] Data loaded');

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

            // Generate profile HTML using the template engine
            const templateEngine = new window.RSYCTemplates();
            
            // Generate sections
            const sections = ['schedules', 'hours', 'facilities', 'programs', 'staff', 'nearby', 'volunteer', 'footerPhoto', 'contact'];
            let html = '';

            sections.forEach(sectionId => {
                try {
                    const sectionHTML = templateEngine.generateSection(sectionId, centerData);
                    if (sectionHTML) {
                        html += sectionHTML + '\n\n';
                    }
                } catch (e) {
                    console.warn(`[RSYCProfileInjector] Section ${sectionId} failed:`, e.message);
                }
            });

            if (!html) {
                throw new Error('No sections generated');
            }

            console.log('[RSYCProfileInjector] Generated profile HTML');

            // Create container with proper styling
            const container = document.createElement('div');
            container.className = 'rsyc-profile';
            container.innerHTML = `
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
                ${html}
            `;

            targetElement.innerHTML = '';
            targetElement.appendChild(container);

            // Load custom styles
            await loadCustomStyles();

            console.log(`[RSYCProfileInjector] ✅ Loaded profile: ${centerData.center.name}`);

        } catch (error) {
            console.error('[RSYCProfileInjector] Error:', error);
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
            // Check if script already in DOM
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                console.log('[RSYCProfileInjector] Script already loaded:', src);
                resolve();
                return;
            }

            console.log('[RSYCProfileInjector] Adding script tag:', src);
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log('[RSYCProfileInjector] Script onload fired:', src);
                // Give a tiny delay to ensure the script initializes
                setTimeout(resolve, 100);
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
                console.log(`[RSYCProfileInjector] Found profile container: ${centerId}`);
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
        console.log(`[RSYCProfileInjector] RSYCLoadProfile called for: ${centerId}`);
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

