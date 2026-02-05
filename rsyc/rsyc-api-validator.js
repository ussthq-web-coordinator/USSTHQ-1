/**
 * RSYC API Center ID Validator
 * Validates that all center IDs in CENTER_IDS.js exist in the loaded data
 * and initializes the API with proper center ID bindings
 */

(function() {
    'use strict';

    class RSYCAPIValidator {
        constructor() {
            this.validCenterIds = [];
            this.missingCenterIds = [];
            this.init();
        }

        async init() {
            try {
                // Wait for data loader to be available
                if (typeof RSYCDataLoader === 'undefined') {
                    console.error('❌ RSYCAPIValidator: RSYCDataLoader not found. Ensure rsyc-data.js is loaded first.');
                    return;
                }

                // Ensure CENTER_IDS is loaded
                if (typeof window.RSYC_CENTER_IDS === 'undefined') {
                    console.error('❌ RSYCAPIValidator: CENTER_IDS.js not loaded.');
                    return;
                }

                console.log(`🔍 Validating ${window.RSYC_CENTER_IDS.length} center IDs...`);

                // Create temporary data loader to fetch centers
                const loader = new RSYCDataLoader();
                await loader.loadAll();

                const loadedCenters = loader.cache.centers || [];
                const loadedCenterIds = loadedCenters.map(c => c.Id || c.id);

                // Validate each center ID
                window.RSYC_CENTER_IDS.forEach(centerId => {
                    if (loadedCenterIds.includes(centerId)) {
                        this.validCenterIds.push(centerId);
                    } else {
                        this.missingCenterIds.push(centerId);
                    }
                });

                // Report results
                console.log(`✅ Valid center IDs: ${this.validCenterIds.length}`);
                if (this.missingCenterIds.length > 0) {
                    console.warn(`⚠️ Missing center IDs: ${this.missingCenterIds.length}`);
                    console.warn(`Missing IDs:`, this.missingCenterIds);
                }

                // Store validation results globally
                window.RSYC_VALIDATION = {
                    validCenterIds: this.validCenterIds,
                    missingCenterIds: this.missingCenterIds,
                    totalLoaded: loadedCenters.length,
                    totalConfigured: window.RSYC_CENTER_IDS.length,
                    isValid: this.missingCenterIds.length === 0,
                    getStatus() {
                        return {
                            valid: this.isValid,
                            validCount: this.validCenterIds.length,
                            missingCount: this.missingCenterIds.length,
                            loadedCount: this.totalLoaded,
                            configuredCount: this.totalConfigured
                        };
                    }
                };

                // Log validation status
                if (window.RSYC_VALIDATION.isValid) {
                    console.log('✅ All center IDs are valid and loaded');
                } else {
                    console.error('❌ Some center IDs are missing from the data source');
                }

            } catch (error) {
                console.error('❌ Validation error:', error);
            }
        }
    }

    // Initialize validator when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.rsycAPIValidator = new RSYCAPIValidator();
        });
    } else {
        window.rsycAPIValidator = new RSYCAPIValidator();
    }
})();
