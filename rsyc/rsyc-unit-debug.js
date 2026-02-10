/**
 * RSYC Unit Pages - Debug Helper
 * Add to HTML to enable enhanced debugging output
 * Usage: <script src="rsyc-unit-debug.js"></script>
 */

(function() {
    const DEBUG = true;

    function log(section, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const style = `
            color: #20B3A8;
            font-weight: bold;
            background: rgba(32, 179, 168, 0.1);
            padding: 2px 6px;
            border-radius: 3px;
        `;
        
        if (data) {
            console.log(`%c[${section}] ${message}`, style, data);
        } else {
            console.log(`%c[${section}] ${message}`, style);
        }
    }

    // Monitor script loading
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        log('FETCH', `Loading: ${args[0]}`);
        return originalFetch.apply(this, args)
            .then(response => {
                if (!response.ok) {
                    log('FETCH', `❌ Failed: ${args[0]} (${response.status})`);
                } else {
                    log('FETCH', `✓ Loaded: ${args[0]}`);
                }
                return response;
            })
            .catch(error => {
                log('FETCH', `❌ Error: ${args[0]}`, error);
                throw error;
            });
    };

    // Monitor global variables
    const checkInterval = setInterval(() => {
        const checks = {
            'RSYCDataLoader': window.RSYCDataLoader ? '✓' : '✗',
            'RSYCUnitDataLoader': window.RSYCUnitDataLoader ? '✓' : '✗',
            'RSYCUnitTemplates': window.RSYCUnitTemplates ? '✓' : '✗',
            'RSYCUnitConfig': window.RSYCUnitConfig ? '✓' : '✗',
            'RSYCLoadUnitPage': window.RSYCLoadUnitPage ? '✓' : '✗'
        };

        let allPresent = true;
        for (const [key, status] of Object.entries(checks)) {
            if (status === '✗') allPresent = false;
            if (status === '✓' && !window[key + '_logged']) {
                log('CLASSES', `Found: ${key}`);
                window[key + '_logged'] = true;
            }
        }

        if (allPresent && !window.UNIT_DEBUG_COMPLETE) {
            clearInterval(checkInterval);
            log('READY', '✅ All classes loaded and ready');
            
            // Show system status
            console.group('📊 System Status');
            console.log('RSYCUnitConfig:', window.RSYCUnitConfig);
            console.log('Enabled Sections:', window.RSYCUnitConfig?.enabledSections);
            console.log('Base URL:', window.location.origin);
            console.groupEnd();
            
            window.UNIT_DEBUG_COMPLETE = true;
        }
    }, 100);

    // Monitor unit page elements
    window.addEventListener('load', () => {
        setTimeout(() => {
            const unitDivs = document.querySelectorAll('[data-rsyc-unit-type]');
            
            if (unitDivs.length === 0) {
                log('ELEMENTS', '⚠️ No unit page divs found with [data-rsyc-unit-type]');
            } else {
                unitDivs.forEach((div, index) => {
                    const type = div.dataset.rsycUnitType;
                    const value = div.dataset.rsycUnitValue;
                    log('ELEMENTS', `Found unit div #${index + 1}`, `${type}: ${value}`);
                });
            }

            // Check for rendered content
            const unitPages = document.querySelectorAll('[id^="rsyc-unit-container"]');
            if (unitPages.length > 0) {
                log('RENDER', `✓ ${unitPages.length} unit page(s) rendered`);
            }

            // Check for errors
            const errorDivs = document.querySelectorAll('[style*="ffe6e6"]');
            if (errorDivs.length > 0) {
                log('ERRORS', `⚠️ ${errorDivs.length} error message(s) found`);
                errorDivs.forEach(div => {
                    console.error('Error message:', div.textContent);
                });
            }
        }, 500);
    });

    // Expose debug utilities
    window.RSYCDebug = {
        showStatus() {
            console.clear();
            console.group('🔍 RSYC Unit Pages Debug Status');
            
            console.group('Classes');
            console.log('RSYCDataLoader:', window.RSYCDataLoader ? '✓ Loaded' : '✗ Missing');
            console.log('RSYCUnitDataLoader:', window.RSYCUnitDataLoader ? '✓ Loaded' : '✗ Missing');
            console.log('RSYCUnitTemplates:', window.RSYCUnitTemplates ? '✓ Loaded' : '✗ Missing');
            console.groupEnd();

            console.group('Configuration');
            console.log('Config:', window.RSYCUnitConfig);
            console.log('Enabled Sections:', window.RSYCUnitConfig?.enabledSections || 'Not set');
            console.groupEnd();

            console.group('DOM Elements');
            console.log('Unit divs:', document.querySelectorAll('[data-rsyc-unit-type]').length);
            console.log('Rendered pages:', document.querySelectorAll('[id^="rsyc-unit-container"]').length);
            console.log('Error messages:', document.querySelectorAll('[style*="ffe6e6"]').length);
            console.groupEnd();

            console.group('Window Functions');
            console.log('RSYCLoadUnitPage:', typeof window.RSYCLoadUnitPage);
            console.groupEnd();

            console.groupEnd();
        },

        loadUnit(type, value, selector = '#unit-page') {
            const element = document.querySelector(selector);
            if (!element) {
                console.error(`❌ Element not found: ${selector}`);
                return;
            }
            
            log('DEBUG', `Loading unit: ${type} - ${value} into ${selector}`);
            
            if (window.RSYCLoadUnitPage) {
                window.RSYCLoadUnitPage(type, value, element);
            } else {
                console.error('❌ RSYCLoadUnitPage not available');
            }
        },

        showUnitData(type, value) {
            if (!window.RSYCUnitDataLoader) {
                console.error('❌ RSYCUnitDataLoader not loaded');
                return;
            }

            // Get instance from any loaded unit loader
            // This is a workaround - in real use, you'd have the instance
            console.log(`To view unit data for ${type}: ${value}, use:`);
            console.log(`
                // Create a loader instance
                const dataLoader = new RSYCDataLoader();
                const unitLoader = new RSYCUnitDataLoader(dataLoader);
                
                // Load data
                await dataLoader.loadCriticalData();
                await unitLoader.buildUnitHierarchy();
                
                // Get unit
                const unit = unitLoader.getUnit('${type}', '${value}');
                console.log(unit);
            `);
        },

        checkScripts() {
            console.clear();
            console.log('🔍 Checking script sources...');
            
            document.querySelectorAll('script').forEach(script => {
                if (script.src && script.src.includes('rsyc')) {
                    console.log(`✓ ${script.src}`);
                }
            });
        },

        showStyles() {
            const styleCount = document.querySelectorAll('style, link[rel="stylesheet"]').length;
            console.log(`📋 Found ${styleCount} style elements`);
            
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                if (link.href.includes('rsyc')) {
                    console.log(`✓ ${link.href}`);
                }
            });
        }
    };

    log('INIT', '✅ Debug helper loaded');
    log('HELP', 'Call RSYCDebug.showStatus() to see system status');
    log('HELP', 'Call RSYCDebug.checkScripts() to verify script loading');

})();
