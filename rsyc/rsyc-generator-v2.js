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

            // Inject global styles immediately
            this.injectGlobalStyles();

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

        // View Custom CSS button
        document.getElementById('viewCustomCSS')?.addEventListener('click', () => {
            this.showCSSModal('custom');
        });

        // View Global CSS button
        document.getElementById('viewGlobalCSS')?.addEventListener('click', () => {
            this.showCSSModal('global');
        });

        // Close CSS Modal
        document.getElementById('closeCSSModal')?.addEventListener('click', () => {
            document.getElementById('cssModal').style.display = 'none';
        });

        // Copy CSS Content
        document.getElementById('copyCSSContent')?.addEventListener('click', () => {
            const content = document.getElementById('cssModalContent').textContent;
            navigator.clipboard.writeText(content).then(() => {
                const btn = document.getElementById('copyCSSContent');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });

        // Close modal on background click
        document.getElementById('cssModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'cssModal') {
                document.getElementById('cssModal').style.display = 'none';
            }
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
            // Global CSS is already injected in the page, no need to add it here
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
        
        // Attach event listeners for modals and accordions in the preview
        this.attachPreviewEventListeners();
        
        // Scroll to top
        previewContainer.scrollTop = 0;
    }

    attachPreviewEventListeners() {
        const previewContainer = document.getElementById('livePreview');
        if (!previewContainer) return;

        // Attach modal functionality
        const viewAllButtons = previewContainer.querySelectorAll('.view-all-btn');
        viewAllButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = btn.getAttribute('data-modal');
                const modal = previewContainer.querySelector(`#${modalId}`);
                if (modal) {
                    modal.style.display = 'block';
                }
            });
        });

        // Attach close button functionality
        const closeButtons = previewContainer.querySelectorAll('.rsyc-modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.rsyc-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modal when clicking outside
        const modals = previewContainer.querySelectorAll('.rsyc-modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Attach accordion functionality
        const moreInfoButtons = previewContainer.querySelectorAll('.more-info-btn');
        moreInfoButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.schedule-card');
                if (card) {
                    const details = card.querySelector('.schedule-details');
                    const icon = btn.querySelector('i');
                    
                    if (details) {
                        const isExpanded = details.style.display === 'block';
                        details.style.display = isExpanded ? 'none' : 'block';
                        if (icon) {
                            icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                        }
                    }
                }
            });
        });

        // Attach "View Full Details" modal buttons
        const viewDetailsButtons = previewContainer.querySelectorAll('.view-details-btn');
        viewDetailsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = btn.getAttribute('data-modal');
                const modal = previewContainer.querySelector(`#${modalId}`);
                if (modal) {
                    modal.style.display = 'block';
                }
            });
        });
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

    showCSSModal(type) {
        const modal = document.getElementById('cssModal');
        const title = document.getElementById('cssModalTitle');
        const description = document.getElementById('cssModalDescription');
        const content = document.getElementById('cssModalContent');

        if (type === 'custom') {
            title.textContent = 'Custom CSS (Not Included in Copy)';
            description.textContent = 'This CSS is loaded from rsyc-custom-styles.html and used for the live preview only. It is NOT included when you copy or download the HTML.';
            content.value = this.customStyles || '/* No custom styles loaded */';
        } else if (type === 'global') {
            title.textContent = 'Global CSS (Add to CMS Global Styles)';
            description.textContent = 'Add this CSS to your CMS global styles to make tooltips, scrollbars, and staff bios work correctly. This is NOT included in the copied HTML.';
            content.value = this.getGlobalCSS();
        }

        modal.style.display = 'block';
    }

    injectGlobalStyles() {
        // Inject global CSS into the page so it's always available
        const styleElement = document.getElementById('globalStyles');
        if (styleElement) {
            styleElement.textContent = this.getGlobalCSS();
        }
    }

    getGlobalCSS() {
        return `/* ========================================
   RSYC Profile - Global CSS
   Add this to your CMS global styles
   ======================================== */

/* Tooltip styles for schedule cards */
.tooltip-icon { 
    position: relative; 
    display: inline-flex; 
    align-items: center; 
    cursor: help; 
    margin-left: 6px; 
}

.tooltip-text {
    position: absolute;
    bottom: 110%; /* tooltip appears above */
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.88);
    color: #fff;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 13px;
    white-space: nowrap;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity .14s ease-in-out;
}

/* Show tooltip on hover/focus */
.tooltip-icon:hover .tooltip-text,
.tooltip-icon:focus .tooltip-text { 
    opacity: 1; 
    pointer-events: auto; 
}

/* Tooltip arrow */
.tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: rgba(0,0,0,0.88) transparent transparent transparent;
}

/* Mobile adjustment: shift tooltip down and left */
@media (max-width: 768px) {
    .tooltip-text {
        transform: translateX(calc(-50% - 15px)) translateY(30px);
    }
}

/* Horizontal scroll styling for schedule cards */
.horizontal-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.3) transparent;
}

/* Center schedule cards when using justify-content-center */
.horizontal-scroll.justify-content-center {
    flex-wrap: wrap;
}

/* Schedule scroll wrapper - break out of container on mobile */
.schedule-scroll-wrapper {
    margin-left: 0;
    margin-right: 0;
}

@media (max-width: 767px) {
    .schedule-scroll-wrapper {
        margin-left: calc(-1 * var(--bs-gutter-x, 0.75rem));
        margin-right: calc(-1 * var(--bs-gutter-x, 0.75rem));
    }
    
    .schedule-scroll-wrapper .horizontal-scroll {
        padding-left: var(--bs-gutter-x, 0.75rem);
        padding-right: var(--bs-gutter-x, 0.75rem);
    }
}

.horizontal-scroll::-webkit-scrollbar {
    height: 8px;
}

.horizontal-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 4px;
}

.horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.5);
}

/* Dark text on white schedule cards */
#freeTextArea-schedules .schedule-card,
#freeTextArea-schedules .schedule-card h5,
#freeTextArea-schedules .schedule-card p,
#freeTextArea-schedules .schedule-card strong {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: #111 !important;
}

#freeTextArea-schedules .schedule-card * { 
    color: inherit !important; 
}

/* Exception: Keep tooltip text white */
#freeTextArea-schedules .tooltip-text {
    color: #fff !important;
}

/* Staff bio: scroll after 4 lines */
.card-body .card-text {
    max-height: calc(0.875rem * 1.5 * 4); /* font-size * line-height * 4 lines */
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #ccc #f8f9fa;
}

/* Webkit scrollbar styling for staff bio */
.card-body .card-text::-webkit-scrollbar {
    width: 6px;
}

.card-body .card-text::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 3px;
}

.card-body .card-text::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.card-body .card-text::-webkit-scrollbar-thumb:hover {
    background: #999;
}

/* ========================================
   MODAL STYLES - View All Features/Programs
   ======================================== */

/* Modal overlay */
.rsyc-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

/* Modal content container */
.rsyc-modal-content {
    background: white;
    border-radius: 12px;
    max-width: 900px;
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: rsycModalSlideIn 0.3s ease-out;
}

@keyframes rsycModalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Modal header */
.rsyc-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #e0e0e0;
}

.rsyc-modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
}

/* Close button */
.rsyc-modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    line-height: 1;
}

.rsyc-modal-close:hover {
    background: #f0f0f0;
    color: #333;
}

/* Modal body */
.rsyc-modal-body {
    padding: 30px;
    overflow-y: auto;
    flex: 1;
}

/* Scrollbar styling for modal body */
.rsyc-modal-body::-webkit-scrollbar {
    width: 10px;
}

.rsyc-modal-body::-webkit-scrollbar-track {
    background: #f8f9fa;
}

.rsyc-modal-body::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 5px;
}

.rsyc-modal-body::-webkit-scrollbar-thumb:hover {
    background: #999;
}

/* ========================================
   MODAL JAVASCRIPT - Add to CMS
   Copy this JavaScript to your CMS global scripts
   ======================================== */

/*
<script>
function showRSYCModal(type, centerName) {
    const modal = document.getElementById('rsyc-modal-' + type);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

function closeRSYCModal(type) {
    const modal = document.getElementById('rsyc-modal-' + type);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    }
}

// Toggle schedule info accordion
function toggleScheduleInfo(scheduleId) {
    const content = document.getElementById(scheduleId);
    const icon = document.getElementById(scheduleId + '-icon');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Close modal when clicking outside content
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rsyc-modal')) {
        const modalId = e.target.id;
        const type = modalId.replace('rsyc-modal-', '');
        closeRSYCModal(type);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.rsyc-modal[style*="display: flex"]');
        openModals.forEach(modal => {
            const type = modal.id.replace('rsyc-modal-', '');
            closeRSYCModal(type);
        });
    }
});
</script>
*/`;
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
