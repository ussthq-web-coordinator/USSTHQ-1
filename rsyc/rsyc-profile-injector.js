/**
 * RSYC Profile Injector
 * Auto-loads profiles into divs with data-rsyc-center-id attribute
 * Usage: Add <div data-rsyc-center-id="centerId"></div> to your page
 * Then include: <script src="https://thisishoperva.org/rsyc/rsyc-profile-injector.js"></script>
 */

(function() {
    // Load RSYCProfileLoader if not already loaded
    if (typeof RSYCProfileLoader === 'undefined') {
        const script = document.createElement('script');
        script.src = window.location.hostname === 'localhost'
            ? 'http://localhost:3001/rsyc/rsyc-profile-loader.js'
            : 'https://thisishoperva.org/rsyc/rsyc-profile-loader.js';
        
        script.onload = initializeProfiles;
        document.head.appendChild(script);
    } else {
        initializeProfiles();
    }

    /**
     * Find all profile containers and load them
     */
    function initializeProfiles() {
        const containers = document.querySelectorAll('[data-rsyc-center-id]');
        
        if (containers.length === 0) {
            console.log('[RSYCProfileInjector] No profile containers found');
            return;
        }

        console.log(`[RSYCProfileInjector] Found ${containers.length} profile container(s)`);

        containers.forEach((container, index) => {
            const centerId = container.dataset.rsycCenterId;
            
            if (!centerId) {
                console.warn('[RSYCProfileInjector] Container missing data-rsyc-center-id');
                return;
            }

            // Parse optional sections from data attribute
            const sections = container.dataset.rsycSections 
                ? container.dataset.rsycSections.split(',').map(s => s.trim())
                : undefined;

            // Load profile
            RSYCProfileLoader.load(centerId, container, { sections });
        });
    }

    // Also support loading on demand via global function
    window.RSYCLoadProfile = function(centerId, targetElement, options) {
        if (typeof RSYCProfileLoader === 'undefined') {
            console.error('[RSYCProfileInjector] RSYCProfileLoader not loaded');
            return;
        }
        return RSYCProfileLoader.load(centerId, targetElement, options);
    };

    console.log('[RSYCProfileInjector] ✅ Initialized');
})();
