/**
 * RSYC Profile Generator V2 - Controller
 * Compact layout with auto-updating live preview
 */

class RSYCGeneratorV2 {
    constructor() {
        this.dataLoader = null;
        this.templateEngine = null;
        this.tracker = null;
        this.currentCenter = null;
        this.generatedHTML = '';
        this.customStyles = '';  // Store custom styles/scripts
        
        this.init();
    }

    async init() {
        try {
            // Initialize components
            this.dataLoader = new RSYCDataLoader();
            this.templateEngine = new RSYCTemplates();
            this.tracker = new RSYCTracker();

            // Update status
            this.updateStatus('dataStatus', 'Data: Loading...');

            // Load custom styles
            await this.loadCustomStyles();

            // Load all data
            await this.dataLoader.loadAll();
            
            // Populate center dropdown
            this.populateCenterDropdown();
            
            // Attach event listeners
            this.attachEventListeners();
            
            this.updateStatus('dataStatus', `Data: Loaded (${this.dataLoader.cache.centers.length} centers)`);
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateStatus('dataStatus', 'Data: Load Failed ⚠️');
            alert('Failed to load data. Please check the console for details.');
        }
    }

    /**
     * Load custom styles and scripts from rsyc-custom-styles.html
     */
    async loadCustomStyles() {
        try {
            const response = await fetch('rsyc-custom-styles.html');
            if (response.ok) {
                this.customStyles = await response.text();
                console.log('✅ Custom styles loaded');
            } else {
                console.warn('⚠️ Custom styles file not found, using defaults');
                this.customStyles = '';
            }
        } catch (error) {
            console.warn('⚠️ Failed to load custom styles:', error);
            this.customStyles = '';
        }
    }

    populateCenterDropdown() {
        const dropdown = document.getElementById('centerSelect');
        console.log('📋 Populating dropdown...', { 
            dropdown, 
            centers: this.dataLoader?.cache?.centers?.length 
        });
        
        if (!dropdown) {
            console.error('❌ Dropdown element not found!');
            return;
        }
        
        if (!this.dataLoader.cache.centers) {
            console.error('❌ No centers data available!');
            return;
        }

        // Sort units alphabetically by name (handle missing titles)
        const sortedUnits = [...this.dataLoader.cache.centers].sort((a, b) => {
            const titleA = a.Title || '';
            const titleB = b.Title || '';
            return titleA.localeCompare(titleB);
        });
        
        console.log(`✅ Sorted ${sortedUnits.length} centers`);

        // Add options
        sortedUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.Id;
            option.textContent = unit.Title;
            dropdown.appendChild(option);
        });
        
        console.log(`✅ Added ${sortedUnits.length} options to dropdown`);
    }

    attachEventListeners() {
        // Center selection
        document.getElementById('centerSelect')?.addEventListener('change', (e) => {
            this.onCenterSelect(e.target.value);
        });

        // Section checkboxes - auto-update on change + update count
        const checkboxes = document.querySelectorAll('.section-checkboxes input[type="checkbox"]');
        const updateHandler = () => {
            this.updateSectionsCount();
            if (this.currentCenter) this.autoGeneratePreview();
        };
        checkboxes.forEach(cb => cb.addEventListener('change', updateHandler));

        // Initialize section count immediately
        this.updateSectionsCount();

        // Select/Deselect All buttons
        document.getElementById('selectAllSections')?.addEventListener('click', () => {
            this.selectAllSections(true);
        });

        document.getElementById('clearAllSections')?.addEventListener('click', () => {
            this.selectAllSections(false);
        });

        // Generate HTML button
        document.getElementById('generateHTML')?.addEventListener('click', () => {
            this.generateHTML();
        });

        // Copy HTML button
        document.getElementById('copyHTML')?.addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Download HTML button
        document.getElementById('downloadHTML')?.addEventListener('click', () => {
            this.downloadHTML();
        });

        // Mark Published button
        document.getElementById('markPublished')?.addEventListener('click', () => {
            this.markAsPublished();
        });
    }

    onCenterSelect(centerId) {
        console.log('🎯 onCenterSelect called with:', centerId, 'Type:', typeof centerId);
        
        if (!centerId) {
            this.currentCenter = null;
            this.updateStatus('selectedCenter', 'Selected: None');
            this.showPlaceholder();
            this.disableButtons();
            return;
        }

        // Find the selected center
        this.currentCenter = this.dataLoader.cache.centers.find(u => u.Id == centerId);
        console.log('🎯 Center found:', this.currentCenter ? this.currentCenter.Title : 'NOT FOUND');
        
        if (this.currentCenter) {
            this.updateStatus('selectedCenter', `Selected: ${this.currentCenter.Title}`);
            document.getElementById('generateHTML').disabled = false;
            
            // Auto-generate preview
            this.autoGeneratePreview();
        } else {
            console.error('❌ Center not found for ID:', centerId);
        }
    }

    getSelectedSections() {
        const checkboxes = document.querySelectorAll('.section-checkboxes input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    selectAllSections(checked) {
        const checkboxes = document.querySelectorAll('.section-checkboxes input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = checked;
        });
        // refresh count and preview
        this.updateSectionsCount();
        
        if (this.currentCenter) {
            this.autoGeneratePreview();
        }
    }

    updateSectionsCount() {
        const total = document.querySelectorAll('.section-checkboxes input[type="checkbox"]').length;
        const selected = document.querySelectorAll('.section-checkboxes input[type="checkbox"]:checked').length;
        const el = document.getElementById('sectionsCount');
        if (el) el.textContent = `${selected} / ${total}`;
        // Also update preview status if center already selected
        if (this.currentCenter) {
            const previewStatus = document.getElementById('previewStatus');
            if (previewStatus) previewStatus.textContent = `${selected} section(s) selected`;
        }
    }

    async autoGeneratePreview() {
        if (!this.currentCenter) return;

        const selectedSections = this.getSelectedSections();
        
        if (selectedSections.length === 0) {
            this.showPlaceholder('No sections selected');
            return;
        }

        try {
            // Gather all related data for this center
            const centerData = await this.dataLoader.getCenterData(this.currentCenter.Id);
            
            // Generate HTML for selected sections
            let html = '';
            selectedSections.forEach(sectionId => {
                const sectionHTML = this.templateEngine.generateSection(sectionId, centerData);
                if (sectionHTML) {
                    html += sectionHTML + '\n\n';
                }
            });

            // Store ONLY the section HTML (without customStyles) for export
            this.generatedHTML = html;
            
            // Update live preview (WITH customStyles for proper display)
            const previewHTML = this.customStyles + '\n\n' + html;
            this.updatePreview(previewHTML);
            
            // Update status
            document.getElementById('previewStatus').textContent = 
                `${selectedSections.length} section(s) generated`;
            
            // Enable action buttons
            this.enableButtons();

        } catch (error) {
            console.error('❌ Preview generation failed:', error);
            this.showPlaceholder('Error generating preview');
        }
    }

    generateHTML() {
        if (!this.currentCenter) return;
        
        this.autoGeneratePreview();
        this.updateStatus('lastGenerated', `Last Generated: ${new Date().toLocaleTimeString()}`);
    }

    updatePreview(html) {
        const previewContainer = document.getElementById('livePreview');
        if (!previewContainer) return;

        // HTML is already prepared with or without customStyles
        previewContainer.innerHTML = html;
        
        // Scroll to top
        previewContainer.scrollTop = 0;
    }

    showPlaceholder(message = 'Select a center and sections above to see the live preview') {
        const previewContainer = document.getElementById('livePreview');
        if (!previewContainer) return;

        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <div class="placeholder-icon">👆</div>
                <p>${message}</p>
            </div>
        `;
    }

    async copyToClipboard() {
        if (!this.generatedHTML) {
            alert('No HTML generated yet!');
            return;
        }

        try {
            // Sanitize the HTML before copying so it won't point to webmanager.salvationarmy.org
            const sanitized = this.sanitizeHTMLForCopy(this.generatedHTML);
            await navigator.clipboard.writeText(sanitized);
            
            // Visual feedback
            const btn = document.getElementById('copyHTML');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            btn.style.background = '#10b981';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);

        } catch (error) {
            console.error('❌ Copy failed:', error);
            alert('Failed to copy to clipboard');
        }
    }

    downloadHTML() {
        if (!this.generatedHTML || !this.currentCenter) {
            alert('No HTML generated yet!');
            return;
        }

        const filename = `${this.currentCenter.Title.replace(/[^a-z0-9]/gi, '-')}-profile.html`;
        // Sanitize before downloading to avoid embedding references to the webmanager domain
        const sanitized = this.sanitizeHTMLForCopy(this.generatedHTML);
        const blob = new Blob([sanitized], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Return a sanitized copy of HTML for copying/downloading so it does not reference
     * webmanager.salvationarmy.org. This intentionally rewrites that hostname to
     * example.com and neutralizes form actions that point to the domain.
     */
    sanitizeHTMLForCopy(html) {
        if (!html) return html;
        let out = html;

        // Replace any occurrence of the webmanager domain with example.com (preserve path)
        out = out.replace(/https?:\/\/(?:www\.)?webmanager\.salvationarmy\.org/gi, 'https://example.com');
        out = out.replace(/([^a-z0-9]|^)webmanager\.salvationarmy\.org/gi, (m, p1) => {
            return (p1 || '') + 'example.com';
        });

        // Remove external resources and extra header content the CMS already provides:
        // - <link ...> tags (stylesheets, fonts)
        // - <meta ...> tags
        // - <script>...</script>
        // - <style>...</style> blocks (except localSites styles)
        out = out.replace(/<link\b[^>]*>/gi, '');
        out = out.replace(/<meta\b[^>]*>/gi, '');
        out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        
        // Extract and preserve ONLY localSites styles
        let preservedStyles = '';
        const styleMatches = out.match(/<style\b[^>]*>([\s\S]*?)<\/style>/gi);
        if (styleMatches) {
            styleMatches.forEach(styleBlock => {
                const content = styleBlock.replace(/<\/?style[^>]*>/gi, '');
                // ONLY preserve styles that contain localSites rules
                if (content.match(/localSites/i)) {
                    preservedStyles += content + '\n';
                }
            });
        }
        
        // Now remove all style blocks
        out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

        // Neutralize form actions: set to '#'
        out = out.replace(/(<form\b[^>]*\baction=)["'][^"']*["']/gi, (m) => {
            return m.replace(/action=["'][^"']*["']/, `action="#"`);
        });

        if (preservedStyles) {
            // Prepend ONLY the localSites styles
            out = `<style type="text/css">\n${preservedStyles}</style>\n` + out;
        }

        return out;
    }

    markAsPublished() {
        if (!this.currentCenter || !this.generatedHTML) {
            alert('No HTML to publish!');
            return;
        }

        const sections = this.getSelectedSections();
        this.tracker.markPublished(this.currentCenter.Id, this.generatedHTML, sections);
        
        // Visual feedback
        const btn = document.getElementById('markPublished');
        const originalText = btn.textContent;
        btn.textContent = '✓ Published!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);

        alert(`✓ Marked "${this.currentCenter.Title}" as published!`);
    }

    enableButtons() {
        document.getElementById('generateHTML').disabled = false;
        document.getElementById('copyHTML').disabled = false;
        document.getElementById('downloadHTML').disabled = false;
        document.getElementById('markPublished').disabled = false;
    }

    disableButtons() {
        document.getElementById('generateHTML').disabled = true;
        document.getElementById('copyHTML').disabled = true;
        document.getElementById('downloadHTML').disabled = true;
        document.getElementById('markPublished').disabled = true;
    }

    updateStatus(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rsycApp = new RSYCGeneratorV2();
});
