/**
 * RSYC Version Tracker
 * Tracks generated profiles, versions, and publication status
 */

class RSYCTracker {
    constructor() {
        this.storageKey = 'rsyc_profile_versions';
        this.versions = this.loadVersions();
    }

    /**
     * Load versions from localStorage
     */
    loadVersions() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading versions:', error);
            return {};
        }
    }

    /**
     * Save versions to localStorage
     */
    saveVersions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.versions));
        } catch (error) {
            console.error('Error saving versions:', error);
        }
    }

    /**
     * Track a new generation
     */
    trackGeneration(centerId, centerName, sections, html) {
        const now = new Date().toISOString();
        const hash = this.hashCode(html);

        if (!this.versions[centerId]) {
            this.versions[centerId] = {
                centerName,
                generations: [],
                published: null
            };
        }

        const generation = {
            timestamp: now,
            sections: [...sections],
            hash,
            htmlLength: html.length,
            published: false
        };

        this.versions[centerId].generations.unshift(generation);
        
        // Keep only last 10 generations
        if (this.versions[centerId].generations.length > 10) {
            this.versions[centerId].generations = this.versions[centerId].generations.slice(0, 10);
        }

        this.saveVersions();
        return generation;
    }

    /**
     * Mark a generation as published
     */
    markAsPublished(centerId, timestamp) {
        if (!this.versions[centerId]) return false;

        const generation = this.versions[centerId].generations.find(g => g.timestamp === timestamp);
        if (generation) {
            generation.published = true;
            generation.publishedAt = new Date().toISOString();
            this.versions[centerId].published = timestamp;
            this.saveVersions();
            return true;
        }
        return false;
    }

    /**
     * Mark current generation as published
     */
    markCurrentAsPublished(centerId) {
        if (!this.versions[centerId] || this.versions[centerId].generations.length === 0) {
            return false;
        }

        const latest = this.versions[centerId].generations[0];
        return this.markAsPublished(centerId, latest.timestamp);
    }

    /**
     * Get generation history for a center
     */
    getHistory(centerId) {
        return this.versions[centerId]?.generations || [];
    }

    /**
     * Get last published generation
     */
    getLastPublished(centerId) {
        const centerData = this.versions[centerId];
        if (!centerData || !centerData.published) return null;

        return centerData.generations.find(g => g.timestamp === centerData.published);
    }

    /**
     * Check if there are unpublished changes
     */
    hasUnpublishedChanges(centerId) {
        const centerData = this.versions[centerId];
        if (!centerData || centerData.generations.length === 0) return false;

        const latest = centerData.generations[0];
        const published = this.getLastPublished(centerId);

        if (!published) return true;
        return latest.hash !== published.hash;
    }

    /**
     * Get version comparison
     */
    compareVersions(centerId, timestamp1, timestamp2) {
        const centerData = this.versions[centerId];
        if (!centerData) return null;

        const v1 = centerData.generations.find(g => g.timestamp === timestamp1);
        const v2 = centerData.generations.find(g => g.timestamp === timestamp2);

        if (!v1 || !v2) return null;

        return {
            sectionsAdded: v2.sections.filter(s => !v1.sections.includes(s)),
            sectionsRemoved: v1.sections.filter(s => !v2.sections.includes(s)),
            sectionsChanged: v1.sections.filter(s => v2.sections.includes(s)),
            contentChanged: v1.hash !== v2.hash
        };
    }

    /**
     * Get centers with unpublished changes
     */
    getCentersNeedingUpdate() {
        return Object.entries(this.versions)
            .filter(([centerId, data]) => this.hasUnpublishedChanges(centerId))
            .map(([centerId, data]) => ({
                centerId,
                centerName: data.centerName,
                lastGenerated: data.generations[0].timestamp,
                lastPublished: data.published
            }));
    }

    /**
     * Export all tracking data
     */
    exportData() {
        return {
            exported: new Date().toISOString(),
            versions: this.versions
        };
    }

    /**
     * Import tracking data
     */
    importData(data) {
        if (data && data.versions) {
            this.versions = data.versions;
            this.saveVersions();
            return true;
        }
        return false;
    }

    /**
     * Clear all tracking data
     */
    clearAll() {
        if (confirm('Are you sure you want to clear all version history?')) {
            this.versions = {};
            this.saveVersions();
            return true;
        }
        return false;
    }

    /**
     * Simple hash function for content comparison
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get statistics
     */
    getStats() {
        const totalCenters = Object.keys(this.versions).length;
        const totalGenerations = Object.values(this.versions).reduce((sum, data) => sum + data.generations.length, 0);
        const publishedCenters = Object.values(this.versions).filter(data => data.published).length;
        const needingUpdate = this.getCentersNeedingUpdate().length;

        return {
            totalCenters,
            totalGenerations,
            publishedCenters,
            needingUpdate
        };
    }
}

// Export class to global scope
window.RSYCTracker = RSYCTracker;

// Create global instance
window.rsycTracker = new RSYCTracker();
