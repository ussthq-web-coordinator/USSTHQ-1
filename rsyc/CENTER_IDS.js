/**
 * RSYC Center IDs Configuration
 * Auto-populated from units-rsyc-profiles.json at runtime
 * 
 * Usage:
 * - This file is auto-populated when data loads
 * - window.RSYC_CENTER_IDS contains all available center IDs
 * - IDs are extracted from the "ID" field in units-rsyc-profiles.json
 * 
 * No manual configuration needed - automatically syncs with your data!
 */

window.RSYC_CENTER_IDS = [];

/**
 * Populate center IDs from loaded center data
 * Called automatically by the data loader
 */
window.populateCenterIDs = function(centers) {
    if (!centers || centers.length === 0) {
        console.warn('⚠️ No centers provided to populateCenterIDs');
        return;
    }
    
    window.RSYC_CENTER_IDS = centers
        .map(c => c.ID || c.id)
        .filter(id => id !== null && id !== undefined)
        .sort((a, b) => a - b);
    
    console.log(`✅ Populated ${window.RSYC_CENTER_IDS.length} center IDs from data:`, window.RSYC_CENTER_IDS);
};

/**
 * Helper function to get center ID by index
 */
window.getRSYCCenterId = function(index) {
    if (index < 0 || index >= window.RSYC_CENTER_IDS.length) {
        return null;
    }
    return window.RSYC_CENTER_IDS[index];
};

/**
 * Helper function to find center index by ID
 */
window.getRSYCCenterIndex = function(centerId) {
    return window.RSYC_CENTER_IDS.indexOf(centerId);
};

/**
 * Get total number of centers
 */
window.getRSYCCenterCount = function() {
    return window.RSYC_CENTER_IDS.length;
};
