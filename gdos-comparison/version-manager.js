/**
 * GDOS/Zesty Data Version Manager
 * 
 * This module manages versioned data from multiple time periods and provides
 * safe mechanisms to view, compare, and selectively update KV storage records.
 * 
 * Key Features:
 * - Load and manage multiple data versions (Oct vs Dec)
 * - Compare GDOS and Zesty values across versions
 * - Track which version is "newer" for each field
 * - Safe selective updates with version tracking
 * - Preserve existing KV storage data
 * - Audit trail of updates
 */

class DataVersionManager {
    constructor() {
        // Data storage for different versions
        this.versions = {
            'oct-2024': {
                gdos: { USW: null, USS: null, USC: null, USE: null },
                zesty: null,
                loadedAt: null
            },
            'dec-2024': {
                gdos: { USW: null, USS: null, USC: null, USE: null },
                zesty: null,
                loadedAt: null
            }
        };
        
        // Track which version is considered "current" for KV storage
        this.currentVersion = 'oct-2024';
        
        // Store comparison results
        this.comparisonCache = new Map();
        
        // Update history for audit trail
        this.updateHistory = [];
        
        // Reference to main differences data
        this.mainDifferencesData = null;
        
        // KV storage data (loaded from Cloudflare Worker)
        this.kvStorage = {};
        this.kvStorageUrl = 'https://gdos-corrections-worker.uss-thq-cloudflare-account.workers.dev/';
    }

    /**
     * Load all data versions
     */
    async loadAllVersions() {
        try {
            // Load October data
            await this.loadVersion('oct-2024', {
                gdosFiles: {
                    USW: 'GDOS-10-14-18-53-USW.json',
                    USS: 'GDOS-10-14-18-10-USS.json',
                    USC: 'GDOS-10-15-04-22-USC.json',
                    USE: 'GDOS-10-15-04-57-USE.json'
                },
                zestyFile: 'LocationsData-10-28.json'
            });

            // Load December data
            await this.loadVersion('dec-2024', {
                gdosFiles: {
                    USW: 'GDOS-12-10-18-11-USW.json',
                    USS: 'GDOS-12-10-18-09-USS.json',
                    USC: 'GDOS-12-10-18-14-USC.json',
                    USE: 'GDOS-12-10-18-16-USE.json'
                },
                zestyFile: 'LocationsData-12-10.json'
            });

            console.log('✓ All data versions loaded successfully');
            
            // Load KV storage data
            await this.loadKVStorage();
            
            return true;
        } catch (error) {
            console.error('Error loading data versions:', error);
            throw error;
        }
    }
    
    /**
     * Load current KV storage data from Cloudflare Worker
     */
    async loadKVStorage() {
        try {
            const response = await fetch(this.kvStorageUrl);
            if (!response.ok) {
                console.warn('Could not load KV storage data');
                return;
            }
            const data = await response.json();
            // Handle both {current: {...}} and direct object formats
            this.kvStorage = data.current || data;
            console.log('✓ KV storage data loaded:', Object.keys(this.kvStorage).length, 'entries');
        } catch (error) {
            console.warn('Error loading KV storage:', error);
            this.kvStorage = {};
        }
    }

    /**
     * Load a specific version's data
     */
    async loadVersion(versionKey, files) {
        const version = this.versions[versionKey];
        if (!version) {
            throw new Error(`Unknown version: ${versionKey}`);
        }

        // Load GDOS files for each territory
        for (const [territory, filename] of Object.entries(files.gdosFiles)) {
            const response = await fetch(filename);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            version.gdos[territory] = await response.json();
        }

        // Load Zesty/LocationsData file
        const zestyResponse = await fetch(files.zestyFile + '?v=' + Date.now());
        if (!zestyResponse.ok) throw new Error(`Failed to load ${files.zestyFile}`);
        const zestyData = await zestyResponse.json();
        version.zesty = zestyData.data || zestyData;
        
        version.loadedAt = new Date();
        console.log(`✓ Loaded version ${versionKey}`);
    }

    /**
     * Get combined GDOS data for a version
     */
    getCombinedGDOS(versionKey) {
        const version = this.versions[versionKey];
        if (!version) return [];

        return [
            ...(version.gdos.USW || []).map(item => ({ ...item, territory: 'USW' })),
            ...(version.gdos.USS || []).map(item => ({ ...item, territory: 'USS' })),
            ...(version.gdos.USC || []).map(item => ({ ...item, territory: 'USC' })),
            ...(version.gdos.USE || []).map(item => ({ ...item, territory: 'USE' }))
        ];
    }

    /**
     * Create lookup maps for a version
     */
    createVersionMaps(versionKey) {
        const version = this.versions[versionKey];
        if (!version) return { gdosMap: new Map(), zestyMap: new Map() };

        // Create GDOS map
        const gdosData = this.getCombinedGDOS(versionKey);
        const gdosMap = new Map();
        gdosData.forEach(item => {
            if (item && item.id) {
                gdosMap.set(String(item.id), item);
            }
        });

        // Create Zesty map
        const zestyMap = new Map();
        (version.zesty || []).forEach(loc => {
            const gdosId = loc['Column1.content.gdos_id'];
            if (gdosId || gdosId === 0) {
                zestyMap.set(String(gdosId), loc);
            }
        });

        return { gdosMap, zestyMap };
    }

    /**
     * Compare a specific GDOS record across versions
     * Returns detailed comparison showing what changed
     */
    compareRecordAcrossVersions(gdosId) {
        const id = String(gdosId);
        
        // Check cache first
        if (this.comparisonCache.has(id)) {
            return this.comparisonCache.get(id);
        }

        const octMaps = this.createVersionMaps('oct-2024');
        const decMaps = this.createVersionMaps('dec-2024');

        const comparison = {
            gdosId: id,
            versions: {
                'oct-2024': {
                    gdos: octMaps.gdosMap.get(id) || null,
                    zesty: octMaps.zestyMap.get(id) || null
                },
                'dec-2024': {
                    gdos: decMaps.gdosMap.get(id) || null,
                    zesty: decMaps.zestyMap.get(id) || null
                }
            },
            fieldChanges: {},
            recommendation: null
        };

        // Fields to compare (latitude and longitude excluded - GDOS values always used)
        const fieldsToCompare = [
            { field: 'name', gdosPath: 'name', zestyPath: 'Column1.content.name' },
            { field: 'address', gdosPath: 'address1', zestyPath: 'Column1.content.address' },
            { field: 'zipcode', gdosPath: 'zip.zipcode', zestyPath: 'Column1.content.zipcode' },
            { field: 'phone', gdosPath: 'phone.phoneNumber', zestyPath: 'Column1.content.phoneNumber' },
            { field: 'siteTitle', gdosPath: 'name', zestyPath: 'Column1.content.siteTitle' },
            { field: 'openHoursText', gdosPath: 'openHoursText', zestyPath: 'Column1.content.hours_of_operation' }
        ];

        fieldsToCompare.forEach(fieldDef => {
            const octGdosValue = this.getNestedValue(comparison.versions['oct-2024'].gdos, fieldDef.gdosPath);
            const octZestyValue = this.getNestedValue(comparison.versions['oct-2024'].zesty, fieldDef.zestyPath);
            const decGdosValue = this.getNestedValue(comparison.versions['dec-2024'].gdos, fieldDef.gdosPath);
            const decZestyValue = this.getNestedValue(comparison.versions['dec-2024'].zesty, fieldDef.zestyPath);

            const octNorm = this.normalizeValue(octGdosValue);
            const decNorm = this.normalizeValue(decGdosValue);
            const octZestyNorm = this.normalizeValue(octZestyValue);
            const decZestyNorm = this.normalizeValue(decZestyValue);

            comparison.fieldChanges[fieldDef.field] = {
                gdosChanged: octNorm !== decNorm,
                zestyChanged: octZestyNorm !== decZestyNorm,
                values: {
                    'oct-2024': { gdos: octGdosValue, zesty: octZestyValue },
                    'dec-2024': { gdos: decGdosValue, zesty: decZestyValue }
                },
                newerVersion: null,
                needsUpdate: false
            };

            // Determine which version is "newer" for this field
            if (comparison.fieldChanges[fieldDef.field].gdosChanged) {
                // If GDOS changed, Dec is newer
                comparison.fieldChanges[fieldDef.field].newerVersion = 'dec-2024';
            }
            if (comparison.fieldChanges[fieldDef.field].zestyChanged) {
                // If Zesty changed, Dec is newer
                comparison.fieldChanges[fieldDef.field].newerVersion = 'dec-2024';
            }

            // Check if KV storage needs update
            // (If Dec GDOS or Zesty is different from Oct, might need update)
            if (comparison.fieldChanges[fieldDef.field].gdosChanged || 
                comparison.fieldChanges[fieldDef.field].zestyChanged) {
                comparison.fieldChanges[fieldDef.field].needsUpdate = true;
            }
        });

        // Generate recommendation
        const changedFields = Object.entries(comparison.fieldChanges)
            .filter(([_, change]) => change.needsUpdate);
        
        if (changedFields.length > 0) {
            comparison.recommendation = {
                action: 'review',
                message: `${changedFields.length} field(s) changed in December data`,
                fields: changedFields.map(([field, _]) => field)
            };
        } else {
            comparison.recommendation = {
                action: 'none',
                message: 'No changes detected between versions'
            };
        }

        // Cache the result
        this.comparisonCache.set(id, comparison);
        return comparison;
    }
    
    /**
     * Get KV storage value for a specific GDOS ID and field
     */
    getKVStorageValue(gdosId, field, territory) {
        // Build key in format: territory-gdosId-field
        const key = `${territory}-${gdosId}-${field}`;
        const stored = this.kvStorage[key];
        
        if (!stored) {
            return { exists: false, correct: null, value: null };
        }
        
        return {
            exists: true,
            correct: stored.correct || 'GDOS',
            value: stored.value || null
        };
    }

    /**
     * Get all records that have changes between versions
     */
    getAllChangedRecords() {
        const decMaps = this.createVersionMaps('dec-2024');
        const changedRecords = [];

        // Check all GDOS IDs from December
        for (const gdosId of decMaps.gdosMap.keys()) {
            const comparison = this.compareRecordAcrossVersions(gdosId);
            if (comparison.recommendation.action === 'review') {
                changedRecords.push(comparison);
            }
        }

        return changedRecords;
    }

    /**
     * Apply selective update to KV storage
     * @param {string} gdosId - The GDOS ID
     * @param {Array} fields - Array of field names to update
     * @param {string} targetVersion - Which version to use ('oct-2024' or 'dec-2024')
     */
    async applySelectiveUpdate(gdosId, fields, targetVersion = 'dec-2024') {
        const comparison = this.compareRecordAcrossVersions(gdosId);
        if (!comparison) {
            throw new Error(`No comparison data for GDOS ID: ${gdosId}`);
        }

        const updates = {};
        fields.forEach(field => {
            if (comparison.fieldChanges[field]) {
                const fieldChange = comparison.fieldChanges[field];
                updates[field] = {
                    from: fieldChange.values[this.currentVersion],
                    to: fieldChange.values[targetVersion],
                    timestamp: new Date().toISOString()
                };
            }
        });

        // Record in update history
        this.updateHistory.push({
            gdosId,
            fields,
            targetVersion,
            updates,
            appliedAt: new Date().toISOString(),
            appliedBy: 'manual' // Could be extended to track user
        });

        return updates;
    }

    /**
     * Get update statistics
     */
    getUpdateStats() {
        const changed = this.getAllChangedRecords();
        const stats = {
            totalRecordsInDec: this.getCombinedGDOS('dec-2024').length,
            totalRecordsInOct: this.getCombinedGDOS('oct-2024').length,
            recordsWithChanges: changed.length,
            fieldChangeBreakdown: {},
            updatesApplied: this.updateHistory.length
        };

        // Count changes by field
        changed.forEach(comp => {
            Object.entries(comp.fieldChanges).forEach(([field, change]) => {
                if (change.needsUpdate) {
                    stats.fieldChangeBreakdown[field] = (stats.fieldChangeBreakdown[field] || 0) + 1;
                }
            });
        });

        return stats;
    }

    /**
     * Export update history for audit
     */
    exportUpdateHistory() {
        return {
            exported: new Date().toISOString(),
            totalUpdates: this.updateHistory.length,
            history: this.updateHistory
        };
    }

    /**
     * Helper: Get nested value from object
     */
    getNestedValue(obj, path) {
        if (!obj || !path) return null;
        return path.split('.').reduce((current, prop) => 
            current && current[prop] !== undefined ? current[prop] : null, obj);
    }

    /**
     * Helper: Normalize value for comparison
     */
    normalizeValue(value) {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'string') {
            return value.trim().toLowerCase().replace(/\s+/g, ' ');
        }
        return String(value);
    }
}

// Export for use in main differences.js
window.DataVersionManager = DataVersionManager;
