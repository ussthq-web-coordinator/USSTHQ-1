/**
 * RSYC Unit Data Loader
 * Aggregates centers by organizational hierarchy (Division, State, City, Area Command)
 * Builds unit objects with statistics and center groups
 */

class RSYCUnitDataLoader {
    constructor(dataLoader) {
        this.dataLoader = dataLoader; // Reference to RSYCDataLoader instance
        this.cache = {
            units: {},
            hierarchy: {},
            indexByType: {
                all: {},
                division: {},
                state: {},
                city: {},
                'area-command': {}
            },
            lastUpdated: null
        };
    }

    /**
     * Build unit hierarchy from centers data
     * Must be called after RSYCDataLoader has loaded centers
     */
    async buildUnitHierarchy() {
        if (this.cache.lastUpdated && 
            (new Date() - this.cache.lastUpdated) < 3600000) { // Cache for 1 hour
            console.log('✓ Using cached unit hierarchy');
            return this.cache.units;
        }

        try {
            console.log('🏗️  Building unit hierarchy...');
            
            // Ensure centers are loaded
            if (!this.dataLoader.cache.centers || this.dataLoader.cache.centers.length === 0) {
                console.warn('⚠️  No centers loaded, building hierarchy skipped');
                return {};
            }

            // Enrich centers with photos before building hierarchy so all unit types (division, all, etc) have images
            const photos = this.dataLoader.cache.photos || [];
            const centers = this.dataLoader.cache.centers.map(center => ({
                ...center,
                photos: photos.filter(p => p.centerId === center.sharePointId)
            }));
            
            // Index centers by organizational attributes
            this._indexCenters(centers);
            
            // Build unit objects at each level
            this._buildAllUnits(centers);
            this._buildDivisionUnits(centers);
            this._buildStateUnits(centers);
            this._buildCityUnits(centers);
            this._buildAreaCommandUnits(centers);
            
            // Build relationships
            this._buildHierarchyRelationships();
            
            this.cache.lastUpdated = new Date();
            console.log('✓ Unit hierarchy built successfully');
            console.log('  All Centers:', Object.keys(this.cache.indexByType.all).length);
            console.log('  Divisions:', Object.keys(this.cache.indexByType.division).length);
            console.log('  States:', Object.keys(this.cache.indexByType.state).length);
            console.log('  Cities:', Object.keys(this.cache.indexByType.city).length);
            console.log('  Area Commands:', Object.keys(this.cache.indexByType['area-command']).length);
            
            return this.cache.units;
        } catch (error) {
            console.error('❌ Error building unit hierarchy:', error);
            throw error;
        }
    }

    /**
     * Get a specific unit by type and value
     */
    getUnit(type, value) {
        const key = this._normalizeKey(value);
        return this.cache.indexByType[type]?.[key] || null;
    }

    /**
     * Get all units of a specific type
     */
    getUnitsByType(type) {
        return Object.values(this.cache.indexByType[type] || {});
    }

    /**
     * Get centers in a specific unit
     */
    getUnitCenters(type, value) {
        const unit = this.getUnit(type, value);
        return unit ? unit.centers : [];
    }

    /**
     * Get statistics for a unit
     */
    getUnitStats(type, value) {
        const unit = this.getUnit(type, value);
        if (!unit) return null;
        return unit.stats;
    }

    /**
     * Index centers by organizational attributes
     */
    _indexCenters(centers) {
        const divisionIndex = {};
        const stateIndex = {};
        const cityIndex = {};
        const acIndex = {};

        centers.forEach(center => {
            const division = center.division || 'Unknown Division';
            const state = center.state || 'Unknown State';
            const city = center.city || 'Unknown City';
            const ac = center.areaCommand || center.areaCommandUnit || 'Unknown Area Command';

            // Normalize keys for consistent lookup
            const divKey = this._normalizeKey(division);
            const stateKey = this._normalizeKey(state);
            const cityKey = this._normalizeKey(`${city}, ${state}`); // City + State combo
            const acKey = this._normalizeKey(ac);

            // Add to division index
            if (!divisionIndex[divKey]) divisionIndex[divKey] = [];
            divisionIndex[divKey].push(center);

            // Add to state index
            if (!stateIndex[stateKey]) stateIndex[stateKey] = [];
            stateIndex[stateKey].push(center);

            // Add to city index
            if (!cityIndex[cityKey]) cityIndex[cityKey] = [];
            cityIndex[cityKey].push(center);

            // Add to area command index
            if (!acIndex[acKey]) acIndex[acKey] = [];
            acIndex[acKey].push(center);
        });

        this.cache._centersByDivision = divisionIndex;
        this.cache._centersByState = stateIndex;
        this.cache._centersByCity = cityIndex;
        this.cache._centersByAC = acIndex;

        console.log('  Indexed centers by:', {
            divisions: Object.keys(divisionIndex).length,
            states: Object.keys(stateIndex).length,
            cities: Object.keys(cityIndex).length,
            areaCommands: Object.keys(acIndex).length
        });
    }

    /**
     * Build "all" unit containing all centers
     */
    _buildAllUnits(centers) {
        if (!centers || centers.length === 0) {
            console.warn('⚠️ No centers provided to _buildAllUnits');
            return;
        }

        const unit = {
            type: 'all',
            value: 'all',
            displayName: 'All Centers',
            centers: centers,
            stats: {
                centerCount: centers.length,
                programCount: 0,
                youthServed: 0,
                staffCount: 0
            }
        };

        this._calculateStats(unit);
        this.cache.indexByType.all['all'] = unit;
        console.log('🏗️  Built "all" unit with', centers.length, 'centers');
    }

    /**
     * Build division-level units
     */
    _buildDivisionUnits(centers) {
        const divisions = new Map();

        centers.forEach(center => {
            const divisionCode = center.divisionCode || 'Unknown';
            const divisionName = center.division || 'Unknown Division';
            const key = this._normalizeKey(divisionCode);

            if (!divisions.has(key)) {
                divisions.set(key, {
                    type: 'division',
                    value: divisionCode,
                    displayName: divisionName,
                    centers: [],
                    stats: {
                        centerCount: 0,
                        programCount: 0,
                        youthServed: 0,
                        staffCount: 0
                    }
                });
            }

            const unit = divisions.get(key);
            unit.centers.push(center);
        });

        // Convert map to indexed units
        divisions.forEach((unit, key) => {
            this._calculateStats(unit);
            this.cache.indexByType.division[key] = unit;
        });
    }

    /**
     * Build state-level units
     */
    _buildStateUnits(centers) {
        const states = new Map();

        centers.forEach(center => {
            const state = center.state || 'Unknown State';
            const key = this._normalizeKey(state);

            if (!states.has(key)) {
                states.set(key, {
                    type: 'state',
                    value: state,
                    displayName: `${state} State`,
                    centers: [],
                    stats: {
                        centerCount: 0,
                        programCount: 0,
                        youthServed: 0,
                        staffCount: 0
                    }
                });
            }

            const unit = states.get(key);
            unit.centers.push(center);
        });

        states.forEach((unit, key) => {
            this._calculateStats(unit);
            this.cache.indexByType.state[key] = unit;
        });
    }

    /**
     * Build city-level units (City, State combination)
     */
    _buildCityUnits(centers) {
        const cities = new Map();

        centers.forEach(center => {
            const city = center.city || 'Unknown City';
            const state = center.state || 'Unknown State';
            const displayValue = `${city}, ${state}`;
            const key = this._normalizeKey(displayValue);

            if (!cities.has(key)) {
                cities.set(key, {
                    type: 'city',
                    value: displayValue,
                    displayName: displayValue,
                    city: city,
                    state: state,
                    centers: [],
                    stats: {
                        centerCount: 0,
                        programCount: 0,
                        youthServed: 0,
                        staffCount: 0
                    }
                });
            }

            const unit = cities.get(key);
            unit.centers.push(center);
        });

        cities.forEach((unit, key) => {
            this._calculateStats(unit);
            this.cache.indexByType.city[key] = unit;
        });
    }

    /**
     * Build area command-level units
     */
    _buildAreaCommandUnits(centers) {
        const areaCommands = new Map();

        centers.forEach(center => {
            const ac = center.areaCommand || center.areaCommandUnit || 'Unknown Area Command';
            const key = this._normalizeKey(ac);

            if (!areaCommands.has(key)) {
                areaCommands.set(key, {
                    type: 'area-command',
                    value: ac,
                    displayName: ac,
                    centers: [],
                    stats: {
                        centerCount: 0,
                        programCount: 0,
                        youthServed: 0,
                        staffCount: 0
                    }
                });
            }

            const unit = areaCommands.get(key);
            unit.centers.push(center);
        });

        areaCommands.forEach((unit, key) => {
            this._calculateStats(unit);
            this.cache.indexByType['area-command'][key] = unit;
        });
    }

    /**
     * Build hierarchy relationships (parent-child links)
     */
    _buildHierarchyRelationships() {
        // Division -> State relationships
        Object.values(this.cache.indexByType.division).forEach(division => {
            const states = new Set();
            division.centers.forEach(center => {
                const state = center.state || 'Unknown State';
                states.add(state);
            });

            division.children = Array.from(states).map(state => ({
                type: 'state',
                value: state,
                displayName: `${state} State`
            }));
        });

        // State -> City relationships
        Object.values(this.cache.indexByType.state).forEach(state => {
            const cities = new Set();
            state.centers.forEach(center => {
                const city = center.city || 'Unknown City';
                cities.add(city);
            });

            state.children = Array.from(cities).map(city => ({
                type: 'city',
                value: `${city}, ${state.value}`,
                displayName: `${city}, ${state.value}`
            }));
        });

        // City -> Area Command relationships
        Object.values(this.cache.indexByType.city).forEach(city => {
            const acs = new Set();
            city.centers.forEach(center => {
                const ac = center.areaCommand || center.areaCommandUnit || 'Unknown Area Command';
                acs.add(ac);
            });

            city.children = Array.from(acs).map(ac => ({
                type: 'area-command',
                value: ac,
                displayName: ac
            }));

            // Set parent
            city.parent = {
                type: 'state',
                value: city.state,
                displayName: `${city.state} State`
            };
        });

        // Area Command -> no children
        // All area command centers are leaves
    }

    /**
     * Calculate statistics for a unit
     */
    _calculateStats(unit) {
        let programCount = 0;
        let staffCount = 0;

        unit.centers.forEach(center => {
            // Count programs
            if (center.programs && Array.isArray(center.programs)) {
                programCount += center.programs.length;
            }
            // Count staff/leaders
            if (center.leaders && Array.isArray(center.leaders)) {
                staffCount += center.leaders.length;
            }
        });

        unit.stats.centerCount = unit.centers.length;
        unit.stats.programCount = programCount;
        unit.stats.staffCount = staffCount;
        // Note: youthServed would need to come from center data if available
        unit.stats.youthServed = Math.floor(unit.centers.length * 250); // Estimate
    }

    /**
     * Normalize string for consistent key lookup
     */
    _normalizeKey(value) {
        if (!value) return 'unknown';
        return value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    /**
     * Clear cache to force rebuild on next call
     */
    clearCache() {
        this.cache = {
            units: {},
            hierarchy: {},
            indexByType: {
                division: {},
                state: {},
                city: {},
                'area-command': {}
            },
            lastUpdated: null
        };
    }
}

// Export for use in both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.RSYCUnitDataLoader = RSYCUnitDataLoader;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSYCUnitDataLoader;
}
