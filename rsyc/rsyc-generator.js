/**
 * RSYC Profile Generator - Main Application Controller
 */

class RSYCGenerator {
    constructor() {
        this.currentCenter = null;
        this.enabledSections = [];
        this.generatedHTML = '';
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Initializing RSYC Profile Generator...');
        
        // Load data
        try {
            await rsycData.loadAll();
            this.updateDataStatus('✅ Data Loaded');
            this.renderCenterList();
        } catch (error) {
            this.updateDataStatus('❌ Data Load Failed');
            console.error(error);
            alert('Failed to load RSYC data. Please refresh the page.');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Application ready');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Center search
        document.getElementById('centerSearch').addEventListener('input', (e) => {
            this.filterCenters(e.target.value);
        });

        // Section selection buttons
        document.getElementById('selectAllSections').addEventListener('click', () => {
            this.selectAllSections();
        });
        document.getElementById('clearAllSections').addEventListener('click', () => {
            this.clearAllSections();
        });

        // Generation buttons
        document.getElementById('generateHTML').addEventListener('click', () => {
            this.generateHTML();
        });
        document.getElementById('previewHTML').addEventListener('click', () => {
            this.previewHTML();
        });

        // Output actions
        document.getElementById('copyHTML').addEventListener('click', () => {
            this.copyToClipboard();
        });
        document.getElementById('downloadHTML').addEventListener('click', () => {
            this.downloadHTML();
        });
        document.getElementById('markPublished').addEventListener('click', () => {
            this.markAsPublished();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('sectionModal').style.display = 'none';
        });
    }

    /**
     * Render center list
     */
    renderCenterList(centers = null) {
        const list = document.getElementById('centerList');
        const centersToShow = centers || rsycData.getCenters();

        if (centersToShow.length === 0) {
            list.innerHTML = '<p class="no-data">No centers found</p>';
            return;
        }

        // Sort by division and name
        centersToShow.sort((a, b) => {
            if (a.division !== b.division) {
                return a.division.localeCompare(b.division);
            }
            return a.shortName.localeCompare(b.shortName);
        });

        // Group by division
        const grouped = {};
        centersToShow.forEach(center => {
            if (!grouped[center.division]) {
                grouped[center.division] = [];
            }
            grouped[center.division].push(center);
        });

        // Render grouped list
        let html = '';
        Object.keys(grouped).sort().forEach(division => {
            html += `<div class="division-group">
                <h3>${division}</h3>
                <ul class="center-items">`;
            
            grouped[division].forEach(center => {
                const hasChanges = rsycTracker.hasUnpublishedChanges(center.id);
                const statusBadge = hasChanges ? '<span class="badge badge-warning">Updates</span>' : '';
                
                html += `
                    <li class="center-item" data-center-id="${center.id}">
                        <div class="center-name">${center.shortName}</div>
                        <div class="center-location">${center.city}, ${center.state}</div>
                        ${statusBadge}
                    </li>
                `;
            });
            
            html += `</ul></div>`;
        });

        list.innerHTML = html;

        // Add click handlers
        list.querySelectorAll('.center-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectCenter(item.dataset.centerId);
            });
        });
    }

    /**
     * Filter centers by search query
     */
    filterCenters(query) {
        if (!query.trim()) {
            this.renderCenterList();
            return;
        }
        
        const results = rsycData.searchCenters(query);
        this.renderCenterList(results);
    }

    /**
     * Select a center
     */
    selectCenter(centerId) {
        this.currentCenter = rsycData.getCenterData(centerId);
        
        if (!this.currentCenter) {
            alert('Center data not found');
            return;
        }

        // Update UI
        document.getElementById('noCenterSelected').style.display = 'none';
        document.getElementById('centerProfile').style.display = 'block';
        document.getElementById('centerName').textContent = this.currentCenter.center.name;
        document.getElementById('centerLocation').textContent = 
            `${this.currentCenter.center.city}, ${this.currentCenter.center.state}`;
        
        // Update status bar
        this.updateSelectedCenter(this.currentCenter.center.shortName);

        // Highlight selected center
        document.querySelectorAll('.center-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.centerId === centerId) {
                item.classList.add('active');
            }
        });

        // Render sections
        this.renderSections();

        // Load history
        this.renderHistory();
    }

    /**
     * Render available sections
     */
    renderSections() {
        const sections = rsycTemplates.getSections();
        const container = document.getElementById('sectionsList');

        let html = '';
        Object.entries(sections).forEach(([key, section]) => {
            const checked = this.enabledSections.includes(key) || this.enabledSections.length === 0;
            html += `
                <div class="section-checkbox">
                    <label>
                        <input type="checkbox" value="${key}" ${checked ? 'checked' : ''}>
                        <span>${section.name}</span>
                    </label>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add change handlers
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateEnabledSections();
            });
        });

        // Initialize enabled sections if first time
        if (this.enabledSections.length === 0) {
            this.updateEnabledSections();
        }
    }

    /**
     * Update enabled sections from checkboxes
     */
    updateEnabledSections() {
        this.enabledSections = Array.from(
            document.querySelectorAll('#sectionsList input[type="checkbox"]:checked')
        ).map(cb => cb.value);
    }

    /**
     * Select all sections
     */
    selectAllSections() {
        document.querySelectorAll('#sectionsList input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        this.updateEnabledSections();
    }

    /**
     * Clear all sections
     */
    clearAllSections() {
        document.querySelectorAll('#sectionsList input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        this.updateEnabledSections();
    }

    /**
     * Generate HTML
     */
    generateHTML() {
        if (!this.currentCenter) {
            alert('Please select a center first');
            return;
        }

        if (this.enabledSections.length === 0) {
            alert('Please select at least one section');
            return;
        }

        try {
            this.generatedHTML = rsycTemplates.generateProfile(
                this.currentCenter,
                this.enabledSections
            );

            // Track this generation
            rsycTracker.trackGeneration(
                this.currentCenter.center.id,
                this.currentCenter.center.name,
                this.enabledSections,
                this.generatedHTML
            );

            // Display HTML
            document.getElementById('htmlCode').textContent = this.generatedHTML;
            
            // Update status
            this.updateLastGenerated();
            
            // Update history
            this.renderHistory();

            // Switch to HTML tab
            this.switchTab('html');

            console.log('✅ HTML generated successfully');
        } catch (error) {
            console.error('❌ Generation error:', error);
            alert('Failed to generate HTML. Check console for details.');
        }
    }

    /**
     * Preview HTML
     */
    previewHTML() {
        if (!this.generatedHTML) {
            alert('Please generate HTML first');
            return;
        }

        const iframe = document.getElementById('previewFrame');
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Write HTML with basic styling
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 1200px; margin: 0 auto; }
                    section { margin-bottom: 40px; }
                    .container { max-width: 100%; }
                    h1, h2, h3 { color: #C8102E; }
                    .btn { display: inline-block; padding: 10px 20px; background: #C8102E; color: white; text-decoration: none; border-radius: 4px; }
                    .programs-grid, .staff-grid, .facilities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
                    .program-card, .staff-card, .facility-item { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; }
                    table td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .badge { display: inline-block; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; margin-right: 4px; font-size: 0.875em; }
                </style>
            </head>
            <body>
                ${this.generatedHTML}
            </body>
            </html>
        `);
        doc.close();

        this.switchTab('preview');
    }

    /**
     * Copy HTML to clipboard
     */
    async copyToClipboard() {
        if (!this.generatedHTML) {
            alert('Please generate HTML first');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.generatedHTML);
            alert('✅ HTML copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = this.generatedHTML;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('✅ HTML copied to clipboard!');
        }
    }

    /**
     * Download HTML file
     */
    downloadHTML() {
        if (!this.generatedHTML) {
            alert('Please generate HTML first');
            return;
        }

        const centerName = this.currentCenter.center.shortName
            .replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const filename = `rsyc-${centerName}-${Date.now()}.html`;

        const blob = new Blob([this.generatedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Mark as published
     */
    markAsPublished() {
        if (!this.currentCenter) {
            alert('Please select a center first');
            return;
        }

        if (rsycTracker.markCurrentAsPublished(this.currentCenter.center.id)) {
            alert('✅ Marked as published!');
            this.renderHistory();
            this.renderCenterList(); // Update badges
        } else {
            alert('No generations to mark as published');
        }
    }

    /**
     * Render version history
     */
    renderHistory() {
        if (!this.currentCenter) return;

        const history = rsycTracker.getHistory(this.currentCenter.center.id);
        const container = document.getElementById('versionHistory');

        if (history.length === 0) {
            container.innerHTML = '<p class="no-data">No version history yet</p>';
            return;
        }

        let html = '<div class="history-list">';
        history.forEach((version, index) => {
            const isLatest = index === 0;
            const publishedBadge = version.published ? '<span class="badge badge-success">Published</span>' : '';
            
            html += `
                <div class="history-item ${isLatest ? 'latest' : ''}">
                    <div class="history-header">
                        <strong>${rsycTracker.formatTimestamp(version.timestamp)}</strong>
                        ${isLatest ? '<span class="badge badge-primary">Latest</span>' : ''}
                        ${publishedBadge}
                    </div>
                    <div class="history-details">
                        <p>Sections: ${version.sections.join(', ')}</p>
                        <p>Size: ${(version.htmlLength / 1024).toFixed(1)} KB</p>
                        ${version.publishedAt ? `<p>Published: ${rsycTracker.formatTimestamp(version.publishedAt)}</p>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Switch output tab
     */
    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.output-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const contentMap = {
            'html': 'htmlOutput',
            'preview': 'previewOutput',
            'history': 'historyOutput'
        };
        
        document.getElementById(contentMap[tabName]).style.display = 'block';
    }

    /**
     * Update status bar
     */
    updateDataStatus(status) {
        document.getElementById('dataStatus').textContent = `Data: ${status}`;
    }

    updateSelectedCenter(centerName) {
        document.getElementById('selectedCenter').textContent = `Selected: ${centerName}`;
    }

    updateLastGenerated() {
        const now = new Date().toLocaleTimeString();
        document.getElementById('lastGenerated').textContent = `Last Generated: ${now}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rsycApp = new RSYCGenerator();
});
