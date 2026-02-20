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
        this.viewerMode = 'code'; // 'code' or 'datamap'
        this.currentSection = null; // Track current section for toggle
        
        // Setup global error handlers early so UI shows issues during init
        try { this.setupGlobalErrorHandlers(); } catch (e) { /* ignore */ }

        this.init();
    }

    /**
     * Observe the DOM for insertion of about/volunteer content and auto-run contact-linking.
     */
    observeForContactElements() {
        // Already observing?
        if (this._rsycContactsObserver) return;

        const runOnElement = (el) => {
            try {
                if (window.rsycMakeContactsClickable) window.rsycMakeContactsClickable(el);
            } catch (e) {
                console.warn('rsycMakeContactsClickable failed on element:', e);
            }
        };

        // Process existing elements immediately
        try {
            document.querySelectorAll('.about-content, [data-volunteer-text]').forEach(runOnElement);
        } catch (e) { /* ignore */ }

        // Create observer to watch for added nodes matching selectors
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.addedNodes && m.addedNodes.length) {
                    m.addedNodes.forEach(node => {
                        if (!node) return;
                        // If the added node itself matches
                        if (node.nodeType === 1) {
                            if (node.matches && (node.matches('.about-content') || node.matches('[data-volunteer-text]'))) {
                                runOnElement(node);
                            }
                            // Or contains matching descendants
                            try {
                                node.querySelectorAll && node.querySelectorAll('.about-content, [data-volunteer-text]').forEach(runOnElement);
                            } catch (err) { /* ignore */ }
                        }
                    });
                }
            });
        });

        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
        this._rsycContactsObserver = observer;
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

            // Register global contact-linking helper
            this.registerMakeContactsClickable();
            // Start observing DOM for content insertions so contact-linking runs on new elements
            this.observeForContactElements();

            // Load all data
            await this.dataLoader.loadAll();
            
            // Build dynamic data models from live endpoints (for Data Models accordion)
            try {
                await this.buildDataModelsFromLiveData();
            } catch (e) {
                console.warn('Failed to build data models from live data, using fallback:', e);
            }
            
            // Pre-process center content (aboutText, volunteerText) into clickable links
            try {
                this.processAllCenterContacts();
            } catch (e) {
                console.warn('Failed to pre-process center contacts:', e);
            }
            
            // Populate center dropdown
            this.populateCenterDropdown();
            
            // Load previous selection if available
            try {
                const lastId = localStorage.getItem('rsyc_last_center_id');
                if (lastId) {
                    const dropdown = document.getElementById('centerSelect');
                    if (dropdown && lastId) {
                        console.log('🔄 Restoring last selected center:', lastId);
                        dropdown.value = lastId;
                        this.onCenterSelect(lastId);
                    }
                }
            } catch (e) { /* ignore localStorage errors */ }

            // Attach event listeners
            this.attachEventListeners();
            
            // Initialize navigation buttons (enable both when nothing selected)
            this.updateNavigationButtons();
            
            // Enable View Data Structure button (always available, shows templates when no center selected)
            const dataBtn = document.getElementById('viewDataStructure');
            if (dataBtn) {
                dataBtn.disabled = false;
            }
            
            this.updateStatus('dataStatus', `Data: Loaded (${this.dataLoader.cache.centers.length} centers)`);
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateStatus('dataStatus', 'Data: Load Failed ⚠️');
            // Show persistent error banner in the UI for easier visibility
            try {
                const banner = document.getElementById('rsyc-error-banner');
                const bannerText = document.getElementById('rsyc-error-text');
                if (banner && bannerText) {
                    bannerText.textContent = `Failed to load data: ${error && error.message ? error.message : String(error)}. See console for details.`;
                    banner.style.display = 'block';
                }
            } catch (e) { /* ignore */ }
            // Keep the original alert for immediate visibility in some environments
            try { alert('Failed to load data. Please check the console for details.'); } catch (e) { /* ignore */ }
        }
    }

    /**
     * Setup global error handlers to display a friendly banner in the publisher UI
     */
    setupGlobalErrorHandlers() {
        // runtime errors
        window.addEventListener('error', (ev) => {
            try {
                const banner = document.getElementById('rsyc-error-banner');
                const bannerText = document.getElementById('rsyc-error-text');
                if (banner && bannerText) {
                    bannerText.textContent = `Runtime error: ${ev && ev.message ? ev.message : ev.toString()}`;
                    banner.style.display = 'block';
                }
            } catch (e) { /* ignore */ }
        });

        // unhandled promise rejections
        window.addEventListener('unhandledrejection', (ev) => {
            try {
                const banner = document.getElementById('rsyc-error-banner');
                const bannerText = document.getElementById('rsyc-error-text');
                if (banner && bannerText) {
                    const reason = ev && ev.reason ? (ev.reason.message || JSON.stringify(ev.reason)) : String(ev);
                    bannerText.textContent = `Unhandled promise rejection: ${reason}`;
                    banner.style.display = 'block';
                }
            } catch (e) { /* ignore */ }
        });

        // Close button handler
        try {
            const closeBtn = document.getElementById('rsyc-error-close');
            if (closeBtn) closeBtn.addEventListener('click', () => {
                const banner = document.getElementById('rsyc-error-banner');
                if (banner) banner.style.display = 'none';
            });
        } catch (e) { /* ignore */ }
    }

    /**
     * Pre-process all centers in the loaded cache to convert emails/phones inside
     * their HTML-rich `aboutText` and `volunteerText` fields into clickable links.
     * This ensures generated HTML and templates include links even if inserted later.
     */
    processAllCenterContacts() {
        if (!this.dataLoader || !this.dataLoader.cache || !Array.isArray(this.dataLoader.cache.centers)) return;
        const centers = this.dataLoader.cache.centers;

        centers.forEach(center => {
            try {
                ['aboutText', 'volunteerText'].forEach(field => {
                    const raw = center[field];
                    if (!raw || typeof raw !== 'string') return;

                    // Create temporary container
                    const div = document.createElement('div');
                    div.innerHTML = raw;

                    // Run global processor if available
                    if (window.rsycMakeContactsClickable) {
                        try {
                            window.rsycMakeContactsClickable(div);
                        } catch (e) {
                            // fallback to no-op
                        }
                    }

                    // Store processed HTML back
                    center[field] = div.innerHTML;
                });
            } catch (err) {
                // ignore per-center errors
            }
        });
    }

    /**
     * Load custom styles and scripts from rsyc-custom-styles.html
     */
    async loadCustomStyles() {
        try {
            const response = await fetch('rsyc-custom-styles.html');
            if (response.ok) {
                const customStylesContent = await response.text();
                
                // Store for downloads/exports
                this.customStyles = customStylesContent;
                
                // Inject into page head for global styling (once)
                if (!document.getElementById('rsyc-global-styles')) {
                    // Mark the document so we can scope overrides for the embedded
                    // publisher view and prevent Symphony's global layout rules from
                    // pushing the publisher UI down.
                    try { document.body.classList.add('rsyc-embedded'); } catch (e) { /* ignore */ }

                    const styleContainer = document.createElement('div');
                    styleContainer.id = 'rsyc-global-styles';
                    styleContainer.innerHTML = customStylesContent;
                    document.head.appendChild(styleContainer);
                }
                
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

    /**
     * Make contacts clickable inside a DOM container.
     * We provide this as a global function so it can be called after innerHTML inserts
     * (script tags inside inserted HTML do not execute when using innerHTML).
     */
    registerMakeContactsClickable() {
        if (window.rsycMakeContactsClickable) return;

        window.rsycMakeContactsClickable = function(container) {
            if (!container) return;
            // If selector passed
            if (typeof container === 'string') container = document.querySelector(container);
            if (!container) return;
            if (container.dataset && container.dataset.rsycContactsProcessed === 'true') return;
            // First: handle split-email cases where the local-part is plain text and the
            // domain (e.g. "@uss.salvationarmy.org") was wrapped in an <a> with no href.
            // Example problematic markup: "kathleen.hutto<a>@uss.salvationarmy.org</a>"
            try {
                const anchors = Array.from(container.querySelectorAll('a'));
                anchors.forEach(a => {
                    try {
                        const aText = (a.textContent || '').trim();
                        const href = a.getAttribute && a.getAttribute('href');
                        // Only consider anchors that look like a bare domain piece and have no meaningful href
                        if (!aText || !aText.startsWith('@')) return;
                        if (href && href.trim() && href.trim() !== '#') return;

                        // Look for the local-part immediately before the anchor.
                        let prev = a.previousSibling;
                        if (!prev) return;

                        // Find a trailing token that looks like an email local-part at the end of the previous node
                        let prevText = '';
                        if (prev.nodeType === Node.TEXT_NODE) {
                            prevText = prev.nodeValue || '';
                        } else if (prev.nodeType === 1) {
                            // If the previous node is an element, try its last text node child first
                            const lastChild = prev.lastChild;
                            if (lastChild && lastChild.nodeType === Node.TEXT_NODE) prevText = lastChild.nodeValue || '';
                            else prevText = prev.textContent || '';
                        }

                        const m = prevText.match(/([A-Za-z0-9._%+-]+)\s*$/);
                        if (!m) return;
                        const local = m[1];
                        if (!local || local.indexOf('@') !== -1) return;

                        const email = local + aText; // combine local + @domain

                        // Create new mailto anchor
                        const newA = document.createElement('a');
                        newA.setAttribute('href', 'mailto:' + email);
                        newA.textContent = email;

                        // Insert new anchor before the existing anchor
                        a.parentNode.insertBefore(newA, a);

                        // Remove only the matched local-part from the previous node (preserve other text)
                        const escapedLocal = local.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const removeRegex = new RegExp(escapedLocal + '\\s*$');

                        if (prev.nodeType === Node.TEXT_NODE) {
                            prev.nodeValue = prev.nodeValue.replace(removeRegex, '');
                            // If the previous text node is now empty, remove it
                            if (!prev.nodeValue || !prev.nodeValue.trim()) {
                                try { prev.parentNode.removeChild(prev); } catch (e) { /* ignore */ }
                            }
                        } else if (prev.nodeType === 1) {
                            // Try to update lastChild text node if present
                            const lastChild = prev.lastChild;
                            if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
                                lastChild.nodeValue = lastChild.nodeValue.replace(removeRegex, '');
                                if (!lastChild.nodeValue || !lastChild.nodeValue.trim()) {
                                    try { prev.removeChild(lastChild); } catch (e) { /* ignore */ }
                                }
                            } else {
                                // Fallback: remove the local text from element's textContent
                                prev.textContent = prev.textContent.replace(removeRegex, '');
                            }
                            // If element has become empty, remove it
                            if (!prev.textContent || !prev.textContent.trim()) {
                                try { prev.parentNode.removeChild(prev); } catch (e) { /* ignore */ }
                            }
                        }

                        // Finally remove the original anchor we replaced
                        try { a.parentNode.removeChild(a); } catch (e) { /* ignore */ }
                    } catch (inner) { /* ignore per-anchor errors */ }
                });
            } catch (e) {
                // non-fatal
            }

            // Now run a TreeWalker to handle in-place text -> anchor replacements for remaining emails/phones
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);

            nodes.forEach(node => {
                const text = node.nodeValue;
                if (!text || !text.trim()) return;

                // Skip text nodes that are inside an <a>, <script>, <style>, or input/textarea
                const anc = node.parentElement;
                if (!anc) return;
                if (anc.closest && anc.closest('a, script, style, textarea, input')) return;

                let replaced = text;

                // Link emails (standard contiguous emails)
                replaced = replaced.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');

                // Link phone numbers (flexible) - normalize displayed format preserved, tel uses digits with +1 when appropriate
                replaced = replaced.replace(/(\+?1?[\s-\.\(]*\d{3}[\)\s-\.]*\d{3}[\s-\.]*\d{4})/g, function(m) {
                    const digits = m.replace(/\D/g, '');
                    if (digits.length === 10) {
                        const tel = '+1' + digits;
                        return '<a href="tel:' + tel + '">' + m + '</a>';
                    } else if (digits.length === 11 && digits.startsWith('1')) {
                        const tel = '+' + digits;
                        return '<a href="tel:' + tel + '">' + m + '</a>';
                    }
                    return m;
                });

                if (replaced !== text) {
                    const span = document.createElement('span');
                    span.innerHTML = replaced;
                    node.parentNode.replaceChild(span, node);
                }
            });

            if (container.dataset) container.dataset.rsycContactsProcessed = 'true';

            // Ensure all links inside the processed container open in a new tab
            try {
                const anchors = Array.from(container.querySelectorAll('a'));
                anchors.forEach(a => {
                    try {
                        // Skip anchors that explicitly opt out via data-target="self"
                        if (a.dataset && a.dataset.target === 'self') return;
                        // Set target and rel for security when opening new tabs
                        a.setAttribute('target', '_blank');
                        // Preserve existing rel tokens but ensure noopener noreferrer are present
                        const existingRel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
                        if (!existingRel.includes('noopener')) existingRel.push('noopener');
                        if (!existingRel.includes('noreferrer')) existingRel.push('noreferrer');
                        a.setAttribute('rel', existingRel.join(' '));
                    } catch (e) { /* ignore per-anchor errors */ }
                });
            } catch (e) { /* ignore */ }
        };
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

        // Clear existing options but keep the placeholder first option if present
        try {
            const placeholder = dropdown.querySelector('option[value=""]');
            dropdown.innerHTML = '';
            if (placeholder) dropdown.appendChild(placeholder);
        } catch (e) {
            // fallback: remove all
            dropdown.innerHTML = '';
        }

        // Add options
        sortedUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.Id;
            option.textContent = unit.Title || unit.name || unit.shortName || 'Unnamed Center';
            dropdown.appendChild(option);
        });

        // Ensure change listener is attached (in case DOM was replaced)
        try {
            if (!dropdown.dataset || dropdown.dataset.rsycListenerAttached !== 'true') {
                dropdown.addEventListener('change', (e) => { this.onCenterSelect(e.target.value); });
                if (dropdown.dataset) dropdown.dataset.rsycListenerAttached = 'true';
            }
        } catch (e) { /* ignore listener attach errors */ }

        // Log sample of loaded centers for debugging
        try {
            console.log('📋 Center samples:', sortedUnits.slice(0,5).map(u => ({ Id: u.Id, Title: u.Title }))); 
        } catch (e) { /* ignore */ }
        
        console.log(`✅ Added ${sortedUnits.length} options to dropdown`);
    }

    attachEventListeners() {
        // Center selection
        document.getElementById('centerSelect')?.addEventListener('change', (e) => {
            this.onCenterSelect(e.target.value);
        });

        // Previous/Next center navigation
        document.getElementById('prevCenter')?.addEventListener('click', () => {
            this.navigateCenter(-1);
        });

        document.getElementById('nextCenter')?.addEventListener('click', () => {
            this.navigateCenter(1);
        });

        // Refresh data button - reloads live JSON and updates UI & preview
        document.getElementById('refreshData')?.addEventListener('click', async () => {
            const btn = document.getElementById('refreshData');
            try {
                if (btn) btn.disabled = true;
                this.updateStatus('dataStatus', 'Data: Refreshing...');

                // Clear cache first to force fresh data load
                this.dataLoader.clearCache();

                // Reload all JSON from remote sources (with cache busting)
                await this.dataLoader.loadAll();

                // Re-process centers to ensure rich text contact linking
                try { this.processAllCenterContacts(); } catch (e) { /* ignore */ }

                // Repopulate dropdown with fresh data
                try { this.populateCenterDropdown(); } catch (e) { console.warn('Repopulate dropdown failed after refresh', e); }

                // If a center was selected before refresh, try to preserve selection and regenerate preview
                if (this.currentCenter) {
                    const currentId = this.currentCenter.id || this.currentCenter.Id;
                    const newCenter = (this.dataLoader.cache.centers || []).find(c => (c.id && c.id == currentId) || (c.Id && c.Id == currentId));
                    if (newCenter) {
                        this.currentCenter = newCenter;
                        // Ensure dropdown value matches
                        const dd = document.getElementById('centerSelect');
                        if (dd) dd.value = newCenter.Id || newCenter.id;
                        // Regenerate preview for current center
                        try { await this.autoGeneratePreview(); } catch (e) { console.warn('autoGeneratePreview failed after refresh', e); }
                    } else {
                        // If the selected center no longer exists, clear and show placeholder
                        this.currentCenter = null;
                        this.showPlaceholder('Selected center not found after refresh');
                    }
                }

                this.updateStatus('dataStatus', `Data: Refreshed (${(this.dataLoader.cache.centers||[]).length} centers)`);
            } catch (error) {
                console.error('❌ Data refresh failed:', error);
                this.updateStatus('dataStatus', 'Data: Refresh Failed ⚠️');
            } finally {
                if (btn) btn.disabled = false;
            }
        });

        // Section checkboxes - auto-update on change + update count
        // Use event delegation on the parent container to ensure all checkboxes are caught
        const sectionCheckboxesContainer = document.querySelector('.section-checkboxes');
        if (sectionCheckboxesContainer) {
            sectionCheckboxesContainer.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    console.log('[SectionCheckbox] Changed:', e.target.value, 'Checked:', e.target.checked);
                    this.updateSectionsCount();
                    if (this.currentCenter) this.autoGeneratePreview();
                }
            });
        }

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
        
        document.getElementById('downloadWithOG')?.addEventListener('click', () => {
            this.downloadFullPageWithOG();
        });

        // View Custom CSS button
        document.getElementById('viewCustomCSS')?.addEventListener('click', () => {
            this.showCSSModal('custom');
        });

        // View Data Structure button
        document.getElementById('viewDataStructure')?.addEventListener('click', () => {
            this.showDataStructureModal();
        });

                                window.addEventListener('resize', this._rsycScheduleResizeHandler);
                                // Delegated listener for center selection to ensure handler works even if
                                // the select element is replaced by other scripts or re-rendered.
                                const self = this;
                                if (!document._rsycDelegatedCenterListenerAttached) {
                                    document.addEventListener('change', function (e) {
                                        try {
                                            if (!e || !e.target) return;
                                            if (e.target.id === 'centerSelect') {
                                                self.onCenterSelect(e.target.value);
                                            }
                                        } catch (err) { /* ignore per-event errors */ }
                                    });
                                    document._rsycDelegatedCenterListenerAttached = true;
                                    console.log('✅ RSYC: delegated centerSelect change listener attached');
                                }
        document.getElementById('openDataAudit')?.addEventListener('click', () => {
            try { this.showDataAuditModal(); } catch (e) { console.warn('showDataAuditModal failed', e); }
        });

        // Close CSS Modal
        document.getElementById('closeCSSModal')?.addEventListener('click', () => {
            document.getElementById('cssModal').style.display = 'none';
        });

        // Copy CSS Content
        document.getElementById('copyCSSContent')?.addEventListener('click', () => {
            const content = document.getElementById('cssModalContent');
            const textToCopy = content.value || content.textContent || '';
            navigator.clipboard.writeText(textToCopy).then(() => {
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

        // Copy inject code
        document.getElementById('copyInjectCode')?.addEventListener('click', () => {
            const centerId = this.currentCenter?.Id || this.currentCenter?.id || '';
            const injectCode = `<div data-rsyc-center-id="${centerId}">\n\t&nbsp;\n</div>\n<script src="https://thisishoperva.org/rsyc/rsyc-profile-injector.js"><\/script>`;
            navigator.clipboard.writeText(injectCode).then(() => {
                const btn = document.getElementById('copyInjectCode');
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });

        // Responsive tweak: adjust schedule card widths on window resize (debounced)
        try {
            if (!this._rsycScheduleResizeHandler) {
                this._rsycScheduleResizeHandler = () => {
                    if (this._rsycScheduleResizeTimer) clearTimeout(this._rsycScheduleResizeTimer);
                    this._rsycScheduleResizeTimer = setTimeout(() => {
                        try { this.adjustScheduleCardWidths(); } catch (e) { /* ignore */ }
                    }, 120);
                };
                window.addEventListener('resize', this._rsycScheduleResizeHandler);
            }
        } catch (e) { /* ignore in older browsers */ }

        // Listen for staff order changes from rsyc-staff-order.js
        // When user saves a new role order, regenerate the preview to reflect the changes
        window.addEventListener('rsyc:roleOrderChanged', (e) => {
            console.log('📋 Staff role order changed, regenerating preview...');
            if (this.currentCenter) {
                try {
                    this.autoGeneratePreview();
                } catch (err) {
                    console.warn('Failed to regenerate preview after role order change:', err);
                }
            }
        });

        // Listen for explicit generate requests
        window.addEventListener('rsyc:requestGeneratePreview', () => {
            console.log('📋 Generate preview requested via custom event');
            if (this.currentCenter) {
                try {
                    this.autoGeneratePreview();
                } catch (err) {
                    console.warn('Failed to regenerate preview:', err);
                }
            }
        });
    }

    switchCenter(centerId) {
        if (!centerId) return;
        console.log('🔄 Dashboard Switching Center to:', centerId);
        const dropdown = document.getElementById('centerSelect');
        if (dropdown) {
            dropdown.value = centerId;
            this.onCenterSelect(centerId);
            
            // Visual feedback: briefly highlight the link that was clicked or show a message
            // or just rely on the UI behind updating.
        }
    }

    onCenterSelect(centerId) {
        console.log('🎯 onCenterSelect called with:', centerId, 'Type:', typeof centerId);
        
        if (!centerId) {
            this.currentCenter = null;
            this.updateStatus('selectedCenter', 'Selected: None');
            this.showPlaceholder();
            this.disableButtons();
            // Hide inject code
            const injectDisplay = document.getElementById('injectCodeDisplay');
            if (injectDisplay) injectDisplay.style.display = 'none';
            try { localStorage.removeItem('rsyc_last_center_id'); } catch (e) {}
            return;
        }

        // Save selection for future reloads
        try {
            localStorage.setItem('rsyc_last_center_id', centerId);
        } catch (e) { /* ignore localStorage issues */ }

        // Find the selected center. Be permissive: match by Id, id, sharePointId, Title or name
        const centers = this.dataLoader?.cache?.centers || [];
        const findCenter = (val) => {
            if (!val) return null;
            // Try exact Id match
            let c = centers.find(u => (u.Id && String(u.Id) === String(val)) || (u.id && String(u.id) === String(val)));
            if (c) return c;
            // Try numeric SharePoint ID
            c = centers.find(u => u.sharePointId && String(u.sharePointId) === String(val));
            if (c) return c;
            // Try matching by Title or name (case-insensitive)
            const lower = String(val).toLowerCase();
            c = centers.find(u => (u.Title && String(u.Title).toLowerCase() === lower) || (u.name && String(u.name).toLowerCase() === lower));
            if (c) return c;
            // Last resort: try partial match on Title
            c = centers.find(u => (u.Title && String(u.Title).toLowerCase().includes(lower)) || (u.name && String(u.name).toLowerCase().includes(lower)));
            return c || null;
        };

        this.currentCenter = findCenter(centerId);
        console.log('🎯 Center found:', this.currentCenter ? this.currentCenter.Title : 'NOT FOUND');
        
        if (this.currentCenter) {
            this.updateStatus('selectedCenter', `Selected: ${this.currentCenter.Title}`);
            
            // Update OG tags dynamically
            const center = this.currentCenter;
            const pageTitle = `${center.Title} - Red Shield Youth Centers`;
            const city = center.city || 'Your Community';
            const state = center.state || '';
            const cityState = state ? `${city}, ${state}` : city;
            const pageDescription = `A safe, welcoming space in ${cityState} offering youth programs, activities, mentoring, and community support for kids and teens.`;
            const ogImageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg';
            const pageUrl = center.websiteURL || 'https://www.redshieldyouth.org/';
            
            this.setOGTags({
                title: pageTitle,
                description: pageDescription,
                image: ogImageUrl,
                url: pageUrl
            });
            
            document.getElementById('generateHTML').disabled = false;
            const dataBtn = document.getElementById('viewDataStructure');
            console.log('🔧 View Data Structure button:', dataBtn, 'Disabled before:', dataBtn?.disabled);
            if (dataBtn) {
                dataBtn.disabled = false;
                console.log('✅ Enabled View Data Structure button, disabled now:', dataBtn.disabled);
            } else {
                console.error('❌ viewDataStructure button not found!');
            }
            
            // Show and update inject code
            const injectDisplay = document.getElementById('injectCodeDisplay');
            if (injectDisplay) {
                injectDisplay.style.display = 'flex';
                const centerId = this.currentCenter.Id || this.currentCenter.id;
                const injectIdSpan = document.getElementById('injectCenterId');
                if (injectIdSpan) injectIdSpan.textContent = centerId;
            }
            
            // Auto-generate preview
            this.autoGeneratePreview();
        } else {
            console.error('❌ Center not found for ID:', centerId, '— available samples:', centers.slice(0,5).map(c => ({Id:c.Id, sharePointId:c.sharePointId, Title:c.Title}))); 
            // As a fallback, reset dropdown to empty so user knows selection didn't stick
            const dd = document.getElementById('centerSelect');
            try { if (dd) dd.value = ''; } catch (e) {}
            // Hide inject code
            const injectDisplay = document.getElementById('injectCodeDisplay');
            if (injectDisplay) injectDisplay.style.display = 'none';
        }
        
        // Update arrow button states
        this.updateNavigationButtons();
    }

    navigateCenter(direction) {
        const dropdown = document.getElementById('centerSelect');
        const options = Array.from(dropdown.options).filter(opt => opt.value !== '');
        
        if (options.length === 0) return;
        
        const currentIndex = options.findIndex(opt => opt.value === dropdown.value);
        
        // If nothing selected
        if (currentIndex === -1 || !dropdown.value) {
            // Right arrow: select first, Left arrow: select last
            const targetIndex = direction > 0 ? 0 : options.length - 1;
            dropdown.value = options[targetIndex].value;
            this.onCenterSelect(options[targetIndex].value);
            return;
        }
        
        // Navigate from current selection
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < options.length) {
            dropdown.value = options[newIndex].value;
            this.onCenterSelect(options[newIndex].value);
        }
    }

    updateNavigationButtons() {
        const dropdown = document.getElementById('centerSelect');
        const options = Array.from(dropdown.options).filter(opt => opt.value !== '');
        const currentIndex = options.findIndex(opt => opt.value === dropdown.value);
        
        const prevBtn = document.getElementById('prevCenter');
        const nextBtn = document.getElementById('nextCenter');
        
        // Always enable both arrows when nothing is selected (they will select first/last)
        // Disable only when at the actual boundaries
        if (prevBtn) prevBtn.disabled = options.length === 0 || (dropdown.value && currentIndex === 0);
        if (nextBtn) nextBtn.disabled = options.length === 0 || (dropdown.value && currentIndex === options.length - 1);
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
        // Sync checked sections to global injector config
        this.syncSectionsToConfig();
    }

    /**
     * Sync selected sections from checkboxes to global RSYCProfileConfig
     * This allows the injector to use the same sections the publisher has selected
     */
    syncSectionsToConfig() {
        const selectedSections = this.getSelectedSections();
        if (!window.RSYCProfileConfig) {
            window.RSYCProfileConfig = {};
        }
        window.RSYCProfileConfig.enabledSections = selectedSections;
        console.log('[Publisher] Synced sections to config:', selectedSections);
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
            
            // Sort selected sections by their formal template order
            selectedSections.sort((a, b) => {
                const orderA = (this.templateEngine.sections[a]?.order) || 99;
                const orderB = (this.templateEngine.sections[b]?.order) || 99;
                return orderA - orderB;
            });

            // Generate HTML for selected sections
            let html = '';
            selectedSections.forEach(sectionId => {
                // Add enabled sections list to data so generateNavigation can access it
                const dataWithSections = { ...centerData, __enabledSections: selectedSections };
                const sectionHTML = this.templateEngine.generateSection(sectionId, dataWithSections);
                if (sectionHTML) {
                    html += sectionHTML + '\n\n';
                }
            });

            // Add modals to the HTML
            console.log('[RSYC Generator V2] Adding modals to preview...');
            let modals = '';
            
            // Add audit modal
            if (this.templateEngine.generateAuditModal) {
                modals += '\n\n' + this.templateEngine.generateAuditModal(selectedSections);
                console.log('[RSYC Generator V2] Audit modal added');
            }
            
            // Add joinCenter modal
            if (this.templateEngine.generateJoinCenterModal) {
                modals += '\n\n' + this.templateEngine.generateJoinCenterModal();
                console.log('[RSYC Generator V2] Join Center modal added');
            } else {
                console.log('[RSYC Generator V2] generateJoinCenterModal method not found!');
            }
            
            // Combine sections and modals
            const fullHTML = html + modals;

            // Store ONLY the section HTML (without customStyles) for export
            this.generatedHTML = html;
            
            // Update live preview with full HTML including modals (custom styles already injected globally in page head)
            this.updatePreview(fullHTML);
            
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
        
        // After injecting HTML, run contact-linker on the preview container
        if (window.rsycMakeContactsClickable) {
            try { window.rsycMakeContactsClickable(previewContainer); } catch (e) { console.warn('rsycMakeContactsClickable failed on preview:', e); }
        }

        // Also ensure contact-linking is applied to the main DOM sections if present
        try {
            const selectors = document.querySelectorAll('.about-content, [data-volunteer-text]');
            selectors.forEach(el => {
                if (window.rsycMakeContactsClickable) {
                    try { window.rsycMakeContactsClickable(el); } catch (e) { /* ignore */ }
                }
            });
        } catch (err) {
            // ignore
        }

        // Attach event listeners for modals and accordions in the preview
        this.attachPreviewEventListeners();

        // Scroll to top
        previewContainer.scrollTop = 0;

        // Ensure schedule cards are equal width on small screens by matching the
        // widest of the first three cards. This makes the carousel look even when
        // only 1-2 cards are visible on mobile.
        try { this.adjustScheduleCardWidths(); } catch (e) { /* ignore */ }
    }

    attachPreviewEventListeners() {
        const previewContainer = document.getElementById('livePreview');
        if (!previewContainer) return;

        // Override showRSYCModal and closeRSYCModal to work within preview
        window.showRSYCModal = (type, centerName) => {
            console.log('showRSYCModal called (rsyc-generator-v2.attachPreviewEventListeners)', type, centerName);
            let modal = previewContainer.querySelector('#rsyc-modal-' + type);
            if (!modal) modal = document.getElementById('rsyc-modal-' + type);
            if (modal) {
                console.log('  found modal:', modal.id);
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                console.log('  modal not found for type:', type);
            }
        };

        window.closeRSYCModal = (type) => {
            let modal = previewContainer.querySelector('#rsyc-modal-' + type);
            if (!modal) modal = document.getElementById('rsyc-modal-' + type);
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        };

        // Staff modal navigation helper (prev/next arrows)
        // Needs to exist in the publisher preview context because injected HTML uses inline onclick handlers.
        window.rsycNavigateStaffModal = (groupKey, currentIndex, delta) => {
            try {
                const selector = `.rsyc-modal[data-rsyc-staff-group="${groupKey}"]`;
                const getItems = (root) => {
                    const list = Array.from(root.querySelectorAll(selector));
                    return list
                        .map(m => ({
                            idx: Number(m.getAttribute('data-rsyc-staff-index')),
                            type: (m.id || '').replace('rsyc-modal-', ''),
                            el: m
                        }))
                        .filter(x => Number.isFinite(x.idx) && x.type);
                };

                // Prefer previewContainer, fall back to document
                let items = getItems(previewContainer);
                if (!items.length) items = getItems(document);
                if (items.length <= 1) return;

                items.sort((a, b) => a.idx - b.idx);
                const curPos = items.findIndex(x => x.idx === Number(currentIndex));
                if (curPos === -1) return;

                const nextPos = (curPos + Number(delta) + items.length) % items.length;
                const curType = items[curPos].type;
                const nextType = items[nextPos].type;

                // Hide current
                let curEl = previewContainer.querySelector('#rsyc-modal-' + curType);
                if (!curEl) curEl = document.getElementById('rsyc-modal-' + curType);
                if (curEl) curEl.style.display = 'none';

                // Show next
                let nextEl = previewContainer.querySelector('#rsyc-modal-' + nextType);
                if (!nextEl) nextEl = document.getElementById('rsyc-modal-' + nextType);
                if (nextEl) {
                    nextEl.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            } catch (e) {
                console.warn('rsycNavigateStaffModal failed in preview:', e);
            }
        };

        // Attach modal functionality
        // Debug: list modals present in preview and document
        try {
            const previewModals = previewContainer.querySelectorAll('.rsyc-modal');
            console.log('attachPreviewEventListeners: previewContainer rsyc-modals count:', previewModals.length);
            previewModals.forEach(m => console.log('  preview modal id:', m.id));
            const docModals = document.querySelectorAll('.rsyc-modal');
            console.log('attachPreviewEventListeners: document rsyc-modals count:', docModals.length);
            docModals.forEach(m => console.log('  document modal id:', m.id));
        } catch (e) { console.warn('modal listing failed', e); }

        const viewAllButtons = previewContainer.querySelectorAll('.view-all-btn');
                viewAllButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const modalId = btn.getAttribute('data-modal');
                        let modal = previewContainer.querySelector(`#${modalId}`);
                        if (!modal) modal = document.getElementById(modalId);
                        if (modal) {
                            console.log('view-all-btn opening modal:', modalId, modal.id);
                            modal.style.display = 'flex';
                            document.body.style.overflow = 'hidden';
                        } else {
                            console.log('view-all-btn could not find modal element for:', modalId);
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

        // Initialize pagination for nearby center cards that already exist in the HTML from rsyc-templates.js
        this.initializeNearbyCardsPagination(previewContainer);
    }

    initializeNearbyCardsPagination(container) {
        try {
            // Find the nearby section
            const nearbySection = container.querySelector('#nearby');
            if (!nearbySection) return; // No nearby section, nothing to paginate

            // Initialize pagination for both area and division card lists using existing HTML
            this.initializePaginationForSection(nearbySection, 'area');
            this.initializePaginationForSection(nearbySection, 'division');

            // Setup toggle button listener to reinitialize pagination when division centers are shown/hidden
            const toggleBtn = nearbySection.querySelector('#rsyc-nearby-toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    // After toggle, reinitialize division pagination
                    setTimeout(() => {
                        this.initializePaginationForSection(nearbySection, 'division');
                    }, 10);
                });
            }
        } catch (e) {
            console.warn('Failed to initialize nearby cards pagination:', e);
        }
    }

    initializePaginationForSection(nearbySection, section) {
        try {
            const grid = nearbySection.querySelector(`.rsyc-nearby-grid[data-section="${section}"]`);
            if (!grid) return;

            const cards = Array.from(grid.querySelectorAll('.rsyc-nearby-card'));
            if (!cards.length) return;

            // Determine cards per page based on screen width
            const getPerPage = () => {
                const w = window.innerWidth;
                if (w < 768) return 1;           // Mobile: 1 column
                if (w < 992) return 4;           // Tablet: 2 columns × 2 rows
                return 6;                         // Desktop: 3 columns × 2 rows
            };

            const paginationContainer = grid.parentElement.querySelector(`.rsyc-pagination-${section}`);
            if (!paginationContainer) return; // Pagination HTML should already exist from rsyc-templates.js

            const render = () => {
                const perPage = getPerPage();
                const totalPages = Math.max(1, Math.ceil(cards.length / perPage));
                
                // Hide all cards first
                cards.forEach(card => card.classList.add('hidden'));
                
                // Show cards for first page
                for (let i = 0; i < Math.min(perPage, cards.length); i++) {
                    cards[i].classList.remove('hidden');
                }
                
                // Update pagination controls
                const currentPageSpan = paginationContainer.querySelector('.rsyc-current-page');
                const totalPagesSpan = paginationContainer.querySelector('.rsyc-total-pages');
                const prevBtn = paginationContainer.querySelector('.rsyc-prev-btn');
                const nextBtn = paginationContainer.querySelector('.rsyc-next-btn');
                
                if (currentPageSpan) currentPageSpan.textContent = '1';
                if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = totalPages <= 1;
                
                // Show/hide pagination based on whether multiple pages exist
                paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
            };

            // Attach onclick handlers to the pagination buttons (they should call window.rsycPagination)
            const prevBtn = paginationContainer.querySelector('.rsyc-prev-btn');
            const nextBtn = paginationContainer.querySelector('.rsyc-next-btn');
            
            if (prevBtn && !prevBtn.__initialized) {
                prevBtn.onclick = () => window.rsycPagination(section, 'prev');
                prevBtn.__initialized = true;
            }
            
            if (nextBtn && !nextBtn.__initialized) {
                nextBtn.onclick = () => window.rsycPagination(section, 'next');
                nextBtn.__initialized = true;
            }

            // Initial render
            render();

            // Re-render on window resize with debounce
            if (!window._rsycNearbyResizeTimeout) {
                window._rsycNearbyResizeTimeout = null;
            }
            
            const resizeHandler = () => {
                clearTimeout(window._rsycNearbyResizeTimeout);
                window._rsycNearbyResizeTimeout = setTimeout(() => {
                    render();
                }, 150);
            };
            
            if (!window._rsycNearbyResizeListenerAttached) {
                window.addEventListener('resize', resizeHandler);
                window._rsycNearbyResizeListenerAttached = true;
            }
        } catch (e) {
            console.warn(`Failed to initialize pagination for section "${section}":`, e);
        }
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

    generateEmailAuditStaffTable(data) {
        const { centers, leaders } = data;
        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;') : '';

        const centersBySpId = new Map((centers || []).map(c => [String(c.sharePointId ?? c.SharePointId ?? c.spId ?? ''), c]));
        const getCenterById = (id) => {
            if (id === null || id === undefined) return null;
            const key = String(id);
            return centersBySpId.get(key) || null;
        };

        const getCenterName = (c) => {
            if (!c) return '';
            return c.name || c.Title || '';
        };

        const getCenterLocation = (c) => {
            if (!c) return '';
            const city = c.city || c.City || '';
            const state = c.state || c.State || '';
            const parts = [city, state].filter(Boolean);
            return parts.join(', ');
        };

        // Match center profile staff sorting (Sort field, role priority, then name)
        const priorityRoles = (function() {
            try {
                if (window.RSYC && Array.isArray(window.RSYC.roleOrder) && window.RSYC.roleOrder.length) return window.RSYC.roleOrder.slice();
                const raw = localStorage.getItem('rsycRoleOrder');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length) return parsed;
                }
            } catch (e) { /* ignore and fall back to defaults */ }
            return [
                'Area Commander',
                'Corps Officer',
                'Area Executive Director',
                'Area Director',
                'Executive Director',
                'Center Director',
                'Program Manager',
                'Program Coordinator',
                'Youth Development Professional',
                'Administrative Clerk',
                'Membership Clerk',
                'Other'
            ];
        })();

        const getPriority = (role) => {
            if (!role) return priorityRoles.length;
            const r = role.toString().toLowerCase().trim();
            const exactIdx = priorityRoles.findIndex(pr => pr.toLowerCase() === r);
            if (exactIdx !== -1) return exactIdx;
            const roleTokens = r.split(/[^a-z0-9]+/).filter(Boolean);
            if (!roleTokens.length) return priorityRoles.length;
            const base = roleTokens[roleTokens.length - 1];
            const baseMatchIdx = priorityRoles.findIndex(pr => {
                const prTokens = pr.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                return prTokens.includes(base);
            });
            if (baseMatchIdx !== -1) return baseMatchIdx;
            const substringIdx = priorityRoles.findIndex(pr => {
                const prTokens = pr.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                return prTokens.some(t => roleTokens.includes(t));
            });
            if (substringIdx !== -1) return substringIdx;
            const phraseIdx = priorityRoles.findIndex(pr => r.includes(pr.toLowerCase()));
            if (phraseIdx !== -1) return phraseIdx;
            return priorityRoles.length;
        };

        const expandedRows = (leaders || [])
            .flatMap(l => {
                const person = l.person || {};
                const displayName = person.name || l.alternateName || '';
                const title = l.positionTitle || person.title || l.roleType || '';
                const bio = l.biography || '';

                const centerIds = Array.isArray(l.centerIds) && l.centerIds.length ? l.centerIds : [null];
                return centerIds.map(centerId => {
                    const center = getCenterById(centerId);
                    const centerName = getCenterName(center);
                    const location = getCenterLocation(center);
                    const centerSlug = this.getCenterSlug(centerName);
                    const liveUrl = centerSlug ? `https://southernusa.salvationarmy.org/redshieldyouth/${centerSlug}` : '';
                    return {
                        displayName,
                        title,
                        bio,
                        Sort: l.Sort,
                        roleType: l.roleType,
                        positionTitle: l.positionTitle,
                        centerId: centerId === null || centerId === undefined ? '' : String(centerId),
                        centerName,
                        location,
                        liveUrl
                    };
                });
            })
            .filter(r => r.displayName || r.title || r.bio || r.centerName);

        const grouped = {};
        expandedRows.forEach(r => {
            const key = r.centerName || 'Unassigned / Unknown Center';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
        });

        Object.keys(grouped).forEach(k => {
            grouped[k].sort((a, b) => {
                // 1) explicit Sort order
                const rawA = parseFloat(a.Sort);
                const rawB = parseFloat(b.Sort);
                const sortA = !isNaN(rawA) ? rawA : 1000;
                const sortB = !isNaN(rawB) ? rawB : 1000;
                if (sortA !== sortB) return sortA - sortB;

                // 2) role priority
                const rawRoleA = (a.roleType || '').toString();
                const roleA = (rawRoleA && !/\bother\b/i.test(rawRoleA)) ? rawRoleA : (a.positionTitle || rawRoleA || '').toString();
                const rawRoleB = (b.roleType || '').toString();
                const roleB = (rawRoleB && !/\bother\b/i.test(rawRoleB)) ? rawRoleB : (b.positionTitle || rawRoleB || '').toString();
                const pA = getPriority(roleA);
                const pB = getPriority(roleB);
                if (pA !== pB) return pA - pB;

                // 3) exact role match tie-breaker
                const pr = priorityRoles[pA] || '';
                const isExactA = pr && roleA.toLowerCase() === pr.toLowerCase();
                const isExactB = pr && roleB.toLowerCase() === pr.toLowerCase();
                if (isExactA !== isExactB) return isExactA ? -1 : 1;

                // 4) name
                return String(a.displayName || '').localeCompare(String(b.displayName || ''), undefined, { sensitivity: 'base' });
            });
        });

        const centerSections = Object.keys(grouped)
            .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }))
            .map(centerName => {
                const items = grouped[centerName] || [];

                const tableRows = items.map(r => {
                    const nameCell = `
                        <div style="font-weight: 700; margin-bottom: 2px;">${esc(r.displayName)}</div>
                        <div style="color: #666;">${esc(r.title)}</div>
                        ${r.liveUrl ? `<div style="margin-top: 6px;"><a href="${esc(r.liveUrl)}" style="color:#FCA200; text-decoration: underline;">Open Center Profile</a></div>` : ''}
                    `;

                    const bioCell = `<div>${esc(r.bio)}</div>`;

                    return `
                        <tr>
                            <td valign="top" style="border: 1px solid #e5e5e5; padding: 6px; width: 240px; word-break: break-word;">${nameCell}</td>
                            <td valign="top" style="border: 1px solid #e5e5e5; padding: 6px; word-break: break-word;">${bioCell}</td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div style="margin: 18px 0 22px 0;">
                        <br>
                        <div style="background:#f4f4f4; padding: 12px 14px; border-left: 6px solid #FCA200; font-weight: 800; font-size: 14px; color: #242424;">
                            ${esc(centerName)} <span style="font-weight:600; color:#666;">(${items.length})</span>
                        </div>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; width: 100%; font-size: 12px; table-layout: fixed;">
                            <tr>
                                <th align="left" style="border: 1px solid #e5e5e5; padding: 6px; background: #fafafa; width: 240px;">Name</th>
                                <th align="left" style="border: 1px solid #e5e5e5; padding: 6px; background: #fafafa;">Bio</th>
                            </tr>
                            ${tableRows}
                        </table>
                        <br>
                    </div>
                `;
            })
            .join('');

        const instructionBlock = `
            <div style="padding: 16px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; font-family: 'Segoe UI', sans-serif; margin: 8px; border-radius: 8px; border: 1px solid #eee;">
                <div style="font-size: 16px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">RSYC Staff & Community Leader Instructions</div>
                <p style="font-size: 14px; color: #333; line-height: 1.5; margin: 0 0 12px 0;">Please create a new entry for most staff at your center to profiles with photos and bios. <b>Please refrain from using selfies.</b></p>
                
                <div style="margin-bottom: 16px;">
                    <a href="https://submitstaff-rsyc.usscommunications.org/" target="_blank" style="font-size: 14px; color: #0078d4; text-decoration: underline; font-weight: 600; margin-right: 12px;">Submit a New Staff Item</a>
                    <a href="https://staffreview-rsyc.usscommunications.org/" target="_blank" style="font-size: 14px; color: #0078d4; text-decoration: underline; font-weight: 600;">View and edit submitted staff & leaders</a>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Note: Profile photo and biography are required before the staff entry can be published.</div>
                </div>

                <div style="background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 12px; margin-bottom: 16px;">
                    <div style="font-size: 15px; font-weight: 700; color: #242424; margin-bottom: 8px;">🖼️ Profile Photo and Bio Required</div>
                    <div style="font-size: 13px; color: #444; line-height: 1.5;">
                        <b>REQUIRED:</b> Upload a high-quality photo (4:5, 5:7, or Square aspect ratio).
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Contain only one individual.</li>
                            <li>Reflect professional image/attire (Full uniform for officers).</li>
                            <li>No stretching - crop the image if necessary.</li>
                            <li>Full face and top of shoulders; no masks.</li>
                        </ul>
                        <b>Recommendations:</b> No hats or sunglasses (eyeglasses accepted). Good lighting. Face centered and not blurry.
                    </div>
                </div>

                <div style="font-size: 13px; color: #555; font-style: italic; background: #fff; border: 1px solid #eee; padding: 8px; border-radius: 4px;">
                    💡 <b>Pro-Tip:</b> Alternate name can be used to show the name the youth calls the leader (e.g., "Miss J", "Coach Mike", or "Vicky" for Victoria).
                </div>
            </div>
        `;

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.4;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">👥 RSYC STAFF & COMMUNITY LEADERS DIRECTORY</div>
                ${instructionBlock}
                <p style="margin: 0 0 12px 0; font-size: 12.5px; color: #666;">Generated on ${new Date().toLocaleDateString()} • ${expandedRows.length} total profiles</p>
                ${centerSections || '<div style="font-size:12.5px; color:#999;">No staff found.</div>'}
            </div>
        `;
    }

    async ensureEditorsCacheLoaded() {
        if (this._editorsCache && this._editorsCache.loaded) return this._editorsCache;
        this._editorsCache = { loaded: false, divisionEditors: [], centerEditors: [] };

        const normalizeDivisionName = (raw) => {
            let d = String(raw || '')
                .replace(/\s*Division\b/ig, '')
                .replace(/[,&/\\-]+/g, ' ')
                .replace(/\bAND\b/ig, ' ')
                .trim()
                .toUpperCase();

            d = d.replace(/\s+/g, ' ');

            // Canonical division codes
            if (d === 'GEO' || d === 'GEORGIA') return 'GEO';
            if (d === 'AOK' || d === 'ARKANSAS OKLAHOMA') return 'AOK';
            if (d === 'ALM' || d === 'ALABAMA LOUISIANA MISSISSIPPI') return 'ALM';
            if (d === 'PMC' || d === 'POTOMAC') return 'PMC';
            if (d === 'TEX' || d === 'TEXAS') return 'TEX';
            if (d === 'NSC' || d === 'NORTH SOUTH CAROLINA') return 'NSC';

            return d;
        };

        const parseCSV = (csvText) => {
            if (!csvText) return [];
            const lines = String(csvText)
                .split(/\r?\n/)
                .filter(l => l && l.trim().length);

            // Some SharePoint exports have a huge ListSchema= line first
            const startIdx = lines.findIndex(l => /^"/g.test(l.trim()));
            const dataLines = startIdx >= 0 ? lines.slice(startIdx) : lines;
            if (!dataLines.length) return [];

            const parseRow = (line) => {
                const out = [];
                let cur = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const ch = line[i];
                    if (ch === '"') {
                        if (inQuotes && line[i + 1] === '"') {
                            cur += '"';
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (ch === ',' && !inQuotes) {
                        out.push(cur);
                        cur = '';
                    } else {
                        cur += ch;
                    }
                }
                out.push(cur);
                return out;
            };

            const header = parseRow(dataLines[0]).map(h => String(h || '').trim());
            const rows = [];
            for (let i = 1; i < dataLines.length; i++) {
                const vals = parseRow(dataLines[i]);
                const obj = {};
                header.forEach((h, idx) => {
                    obj[h] = (vals[idx] ?? '').trim();
                });
                rows.push(obj);
            }
            return rows;
        };

        const fetchText = async (fileNameOrPath) => {
            const candidates = [
                String(fileNameOrPath || ''),
                `./${String(fileNameOrPath || '')}`,
                `rsyc/${String(fileNameOrPath || '')}`,
                `./rsyc/${String(fileNameOrPath || '')}`,
                `/${String(fileNameOrPath || '')}`,
                `/rsyc/${String(fileNameOrPath || '')}`
            ].filter(Boolean);

            let lastErr = null;
            for (const rel of candidates) {
                try {
                    const resolved = (typeof window !== 'undefined')
                        ? new URL(rel, window.location.href).toString()
                        : rel;
                    const url = resolved + (resolved.includes('?') ? '&' : '?') + 'v=' + Date.now();
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.text();
                } catch (e) {
                    lastErr = e;
                }
            }

            throw new Error(`Failed to load ${fileNameOrPath}. Tried: ${candidates.join(', ')}${lastErr ? ` (${lastErr.message || lastErr})` : ''}`);
        };

        try {
            const [divisionCsv, centerCsv] = await Promise.all([
                fetchText('RSYC Division Permissions.csv'),
                fetchText('RSYC Permissions.csv')
            ]);

            const divisionRows = parseCSV(divisionCsv);
            const centerRows = parseCSV(centerCsv);

            // Normalize fields
            this._editorsCache.divisionEditors = divisionRows
                .map(r => ({
                    division: normalizeDivisionName(r['Division'] || ''),
                    editor: (r['Editor'] || r['Editor0'] || '').trim(),
                    remove: String(r['Remove Permission'] || r['RemovePermissions'] || '').toLowerCase() === 'true'
                }))
                .filter(r => r.division && r.editor && !r.remove);

            this._editorsCache.centerEditors = centerRows
                .map(r => ({
                    division: normalizeDivisionName(r['Center:Division'] || ''),
                    center: (r['Center'] || '').trim(),
                    editor: (r['Editor'] || r['Editor1'] || '').trim(),
                    city: (r['Center:City'] || '').trim(),
                    state: (r['Center:State'] || '').trim(),
                    remove: String(r['Remove Permission'] || r['RemovePermission'] || '').toLowerCase() === 'true'
                }))
                .filter(r => r.division && r.center && r.editor && !r.remove);

            this._editorsCache.loaded = true;
            return this._editorsCache;
        } catch (e) {
            console.warn('Failed to load editor permissions CSVs', e);
            this._editorsCache.loaded = false;
            return this._editorsCache;
        }
    }

    generateEmailAuditEditorsTable(data) {
        const { selectedDivision, editorsCache, leaders } = data || {};
        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

        const normalizeDivisionName = (raw) => {
            let d = String(raw || '')
                .replace(/\s*Division\b/ig, '')
                .replace(/[,&/\\-]+/g, ' ')
                .replace(/\bAND\b/ig, ' ')
                .trim()
                .toUpperCase();
            d = d.replace(/\s+/g, ' ');

            if (d === 'GEO' || d === 'GEORGIA') return 'GEO';
            if (d === 'AOK' || d === 'ARKANSAS OKLAHOMA') return 'AOK';
            if (d === 'ALM' || d === 'ALABAMA LOUISIANA MISSISSIPPI') return 'ALM';
            if (d === 'PMC' || d === 'POTOMAC') return 'PMC';
            if (d === 'TEX' || d === 'TEXAS') return 'TEX';
            if (d === 'NSC' || d === 'NORTH SOUTH CAROLINA') return 'NSC';

            return d;
        };

        const div = normalizeDivisionName(selectedDivision || '');
        const cache = editorsCache || this._editorsCache || {};

        const buildPeopleDirectory = () => {
            const map = new Map();
            (leaders || []).forEach(l => {
                const p = l && l.person ? l.person : null;
                if (!p) return;
                const email = (p.email || '').toString().trim().toLowerCase();
                if (!email) return;
                if (!map.has(email)) {
                    map.set(email, {
                        name: (p.name || '').toString().trim(),
                        title: (p.title || '').toString().trim(),
                        department: (p.department || '').toString().trim()
                    });
                }
            });
            return map;
        };

        const toTitleCase = (s) => String(s || '')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());

        const formatNameFromEmail = (email) => {
            const e = String(email || '').trim();
            if (!e) return '';
            const local = e.split('@')[0] || e;
            const tokens = local.split(/[._-]+/g).filter(Boolean);
            return toTitleCase(tokens.join(' '));
        };

        const peopleByEmail = buildPeopleDirectory();

        const formatEditor = (editorEmail) => {
            const raw = String(editorEmail || '').trim();
            if (!raw) return '';
            const key = raw.toLowerCase();
            const person = peopleByEmail.get(key);
            const name = (person && person.name) ? person.name : formatNameFromEmail(raw);

            return `
                <div style="margin-bottom: 6px;">
                    <div style="font-weight:700;">${esc(name)}</div>
                </div>
            `;
        };

        const divisionEditors = (cache.divisionEditors || []).filter(r => !div || r.division === div);
        const centerEditors = (cache.centerEditors || []).filter(r => !div || r.division === div);

        const editorsByDivision = {};
        divisionEditors.forEach(r => {
            if (!editorsByDivision[r.division]) editorsByDivision[r.division] = new Set();
            editorsByDivision[r.division].add(r.editor);
        });

        const editorsByCenter = {};
        centerEditors.forEach(r => {
            const key = `${r.division}|||${r.center}`;
            if (!editorsByCenter[key]) editorsByCenter[key] = { division: r.division, center: r.center, city: r.city, state: r.state, editors: new Set() };
            editorsByCenter[key].editors.add(r.editor);
        });

        const centerRows = Object.values(editorsByCenter)
            .sort((a, b) => {
                const d = String(a.division).localeCompare(String(b.division));
                if (d) return d;
                return String(a.center).localeCompare(String(b.center));
            });

        const allDivisions = Array.from(new Set([
            ...Object.keys(editorsByDivision),
            ...centerRows.map(r => r.division)
        ])).sort();

        const htmlRows = allDivisions.flatMap(d => {
            const divEditors = Array.from(editorsByDivision[d] || []).sort();
            const divLine = divEditors.length ? divEditors.map(formatEditor).join('') : '<span style="color:#999;">(none listed)</span>';

            const divRow = `
                <tr>
                    <td valign="top" style="border: 1px solid #e5e5e5; padding: 8px; width: 80px; font-weight:700;">${esc(d)}</td>
                    <td valign="top" style="border: 1px solid #e5e5e5; padding: 8px; width: 220px; font-weight:700;">(Division Editors)</td>
                    <td valign="top" style="border: 1px solid #e5e5e5; padding: 8px;">${divLine}</td>
                </tr>
            `;

            const centersForDivision = centerRows.filter(r => r.division === d);
            const centerHtmlRows = centersForDivision.map(r => {
                const loc = [r.city, r.state].filter(Boolean).join(', ');
                const centerSlug = this.getCenterSlug(r.center);
                const liveUrl = centerSlug ? `https://southernusa.salvationarmy.org/redshieldyouth/${centerSlug}` : '';
                const editors = Array.from(r.editors || []).sort().map(formatEditor).join('');
                return `
                    <tr>
                        <td valign="top" style="border: 1px solid #e5e5e5; padding: 8px; width: 80px;">${esc(r.division)}</td>
                        <td valign="top" style="border: 1px solid #e5e5e5; padding: 8px; width: 220px;">
                            ${esc(r.center)}
                            ${loc ? `<div style=\"color:#666; font-size:11px; margin-top:2px;\">${esc(loc)}</div>` : ''}
                            ${liveUrl ? `<div style=\"margin-top:6px;\"><a href=\"${esc(liveUrl)}\" style=\"color:#FCA200; text-decoration: underline;\">Open Center Profile</a></div>` : ''}
                        </td>
                        <td valign="top" style="border: 1px solid #e5e5e5; padding: 8px;">${editors || ''}</td>
                    </tr>
                `;
            });

            return [divRow, ...centerHtmlRows];
        }).join('');

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.4;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">🔐 RSYC PROFILE PERMISSIONS (EDITORS)</div>
                <p style="margin: 0 0 12px 0; font-size: 12.5px; color: #666;">Generated on ${new Date().toLocaleDateString()}${div ? ` • Division: <b>${esc(div)}</b>` : ''}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; width: 100%; font-size: 12.5px;">
                    <tr>
                        <th align="left" style="border: 1px solid #e5e5e5; padding: 8px; background: #fafafa;">Division</th>
                        <th align="left" style="border: 1px solid #e5e5e5; padding: 8px; background: #fafafa;">Center</th>
                        <th align="left" style="border: 1px solid #e5e5e5; padding: 8px; background: #fafafa;">Editors</th>
                    </tr>
                    ${htmlRows || '<tr><td colspan="3" style="border: 1px solid #e5e5e5; padding: 8px; color:#999;">No editor data found.</td></tr>'}
                </table>
            </div>
        `;
    }

    generateEmailAuditOverallStatus(data) {
        const { rows, lowFacilities, lowPrograms, recentFacs, recentProgs, centersCount, closedCount, aggregates } = data;

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

        const shortCenterName = (name) => {
            const n = String(name || '').trim();
            return n
                .replace(/^Red Shield Youth Centers? of\s+/i, '')
                .replace(/^Red Shield Youth Center of\s+/i, '')
                .trim();
        };

        const check = (v) => v ? '✅' : '<span style="color:#d93d3d; font-weight:bold;">✗</span>';
        const num = (v) => (v === 0 || v) ? String(v) : '';

        const overallHeader = `
            <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📊 RSYC PROFILE AUDIT - OVERALL STATUS</div>
            <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()} • Analyzing ${centersCount} total centers (${closedCount} flagged as CLOSED)</p>
        `;

        const goal = `
            <div style="background-color: #f0f7ff; border-left: 6px solid #007bff; padding: 20px; margin: 18px 0 22px 0; border-radius: 4px; display: block;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #2c3e50; display: block;">
                    <strong>Our Goal:</strong> We are currently auditing the Red Shield Youth Center territory-wide to ensure every location is accurately represented and fully ready for public promotion. This focus on profile readiness ensures that when families, donors, and community partners visit <strong>redshieldyouth.org</strong>, they encounter a professional, complete, and locally relevant view of our ministry.
                </p>
            </div>
        `;

        const metricCells = [
            { label: 'Centers', value: `${centersCount}`, sub: `${closedCount} closed` },
            { label: 'About Tags', value: `${aggregates?.about ?? rows.filter(r => r.hasAbout).length}` },
            { label: 'Schedules', value: `${aggregates?.schedules_centers ?? rows.filter(r => r.schedCount > 0).length} centers`, sub: `${aggregates?.schedules_items ?? rows.reduce((s, r) => s + (r.schedCount || 0), 0)} items` },
            { label: 'Leaders', value: `${aggregates?.leaders_centers ?? rows.filter(r => r.leaderCount > 0).length} centers`, sub: `${aggregates?.leaders_items ?? rows.reduce((s, r) => s + (r.leaderCount || 0), 0)} total` },
            { label: 'Photos', value: `${aggregates?.photos_centers ?? rows.filter(r => r.photoCount > 0).length} centers`, sub: `${aggregates?.photos_items ?? rows.reduce((s, r) => s + (r.photoCount || 0), 0)} images` },
            { label: 'Hours', value: `${aggregates?.hours ?? rows.filter(r => r.hasHours).length}` },
            { label: 'Events', value: `${aggregates?.events_centers ?? 0} centers`, sub: `${aggregates?.events_items ?? 0} total` },
            { label: 'Info Pages', value: `${aggregates?.informationalPages_centers ?? 0} centers`, sub: `${aggregates?.informationalPages_items ?? 0} total` }
        ];

        const metrics = `
            <div style="margin: 0 0 18px 0; display:block;">
                <table style="width:100%; border-collapse:separate; border-spacing:10px 10px; table-layout:fixed;">
                    <tr>
                        ${metricCells.slice(0, 4).map(c => `
                            <td style="background:#f8f9fa; border:1px solid #e9ecef; padding:12px; border-radius:8px; text-align:center; vertical-align:top;">
                                <div style="font-size:11px; color:#666; text-transform:uppercase; font-weight:600; line-height:1.2;">${esc(c.label)}<br></div>
                                <div style="font-weight:700; font-size:16px; margin:4px 0; line-height:1.2;">${esc(c.value)}</div>
                                ${c.sub ? `<div style=\"font-size:10px; color:#999; line-height:1.2;\">${esc(c.sub)}</div>` : ''}
                            </td>
                        `).join('')}
                    </tr>
                    <tr>
                        ${metricCells.slice(4).map(c => `
                            <td style="background:#f8f9fa; border:1px solid #e9ecef; padding:12px; border-radius:8px; text-align:center; vertical-align:top;">
                                <div style="font-size:11px; color:#666; text-transform:uppercase; font-weight:600; line-height:1.2;">${esc(c.label)}<br></div>
                                <div style="font-weight:700; font-size:16px; margin:4px 0; line-height:1.2;">${esc(c.value)}</div>
                                ${c.sub ? `<div style=\"font-size:10px; color:#999; line-height:1.2;\">${esc(c.sub)}</div>` : ''}
                            </td>
                        `).join('')}
                    </tr>
                </table>
            </div>
        `;

        const missingAboutCount = rows.filter(r => !r.hasAbout && !r.isClosed).length;
        const missingPhotosCount = rows.filter(r => r.photoCount === 0 && !r.isClosed).length;
        const missingHoursCount = rows.filter(r => !r.hasHours && !r.isClosed).length;
        const missingSchedulesCount = rows.filter(r => r.schedCount === 0 && !r.isClosed).length;

        const needsAttention = `
            <div style="margin-bottom: 22px; padding: 16px; background-color: #fff5f5; border: 1px solid #ffccd5; border-radius: 8px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="font-weight: 800; color: #dc3545; font-size: 14px; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #ffccd5; padding-bottom: 8px;">🚨 High-Priority Content Needs Attention</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="font-size: 13px; color: #333;">
                        <span style="display:inline-block; width:22px; height:22px; background:#dc3545; color:white; border-radius:50%; text-align:center; line-height:22px; font-weight:bold; margin-right:8px; font-size:11px;">${missingAboutCount}</span> 
                        <strong>No About This Center Statement</strong>
                    </div>
                    <div style="font-size: 13px; color: #333;">
                        <span style="display:inline-block; width:22px; height:22px; background:#dc3545; color:white; border-radius:50%; text-align:center; line-height:22px; font-weight:bold; margin-right:8px; font-size:11px;">${missingPhotosCount}</span> 
                        <strong>No Photos (Missing Facility Exterior)</strong>
                    </div>
                    <div style="font-size: 13px; color: #333;">
                        <span style="display:inline-block; width:22px; height:22px; background:#dc3545; color:white; border-radius:50%; text-align:center; line-height:22px; font-weight:bold; margin-right:8px; font-size:11px;">${missingHoursCount}</span> 
                        <strong>Missing Custom Operating Hours</strong>
                    </div>
                    <div style="font-size: 13px; color: #333;">
                        <span style="display:inline-block; width:22px; height:22px; background:#dc3545; color:white; border-radius:50%; text-align:center; line-height:22px; font-weight:bold; margin-right:8px; font-size:11px;">${missingSchedulesCount}</span> 
                        <strong>No Program Schedules Submitted</strong>
                    </div>
                </div>
                <div style="margin-top: 12px; font-size: 11px; color: #dc3545; font-style: italic;">
                    * All counts exclude centers flagged as [CLOSED]. Refer to the detailed status table below for center-specific items.
                </div>
            </div>
        `;

        const tableRows = rows.map(r => `
            <tr style="border-bottom:1px solid #f5f5f5; ${r.isClosed ? 'background:#fff5f5;' : ''}">
                <td style="padding:6px 8px; font-size:12px;">
                    ${r.isClosed ? `<span style="color:#dc3545; font-size:10px; font-weight:bold;">[CLOSED]</span> ` : ''}
                    <span class="center-audit-link" data-center-id="${r.id}" style="color:#004a99; font-weight:bold; cursor:pointer; text-decoration:none;" title="Click to switch dropdown to this center">
                        ${esc(shortCenterName(r.name))}
                    </span>
                </td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${r.isClosed ? '' : `<a href="${esc(r.liveUrl)}" target="_blank" style="text-decoration:none;">🔗</a>`}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${check(r.hasAbout)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${check(r.hasStaff)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.leaderCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.schedCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.eventCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.infoPageCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.photoCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${check(r.hasHours)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.facilityCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${num(r.programCount)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${check(r.hasFooterPhoto)}</td>
                <td style="padding:6px 8px; text-align:center; font-size:12px;">${check(r.hasFooterScripture)}</td>
            </tr>
        `).join('');

        const statusTable = `
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">All Centers Status Detail (Table View)</div>
                <div style="border:1px solid #eee; border-radius:8px; overflow:hidden;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:8px; text-align:left; font-size:11px;">Center</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Live</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">About</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Staff</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Leaders</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Schedules</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Events</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Info</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Photos</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Hours</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Facilities</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Programs</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Footer Photo</th>
                                <th style="padding:8px; text-align:center; font-size:11px;">Footer Verse</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
                <br>
                <div style="margin-top:14px; padding:12px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; color:#666; font-size:12px; font-style:italic; line-height:1.5;">
                    <b>Status Key:</b><br>
                    • Red (✗) items indicate missing data for <b>OPEN</b> centers that require attention.<br>
                    • Light red rows indicate centers currently marked as <b>CLOSED</b>.
                </div>
            </div>
        `;

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.5;">
                ${overallHeader}
                ${goal}
                ${metrics}
                ${needsAttention}
                ${statusTable}
            </div>
        `;
    }

    generateEmailAuditFiltersAndAssociations(data) {
        const { lowFacilities, lowPrograms, recentFacs, recentProgs } = data;

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

        const groupBy = (arr, getKey) => {
            const m = new Map();
            (arr || []).forEach(item => {
                const k = String(getKey(item) || '').trim() || 'Other';
                if (!m.has(k)) m.set(k, []);
                m.get(k).push(item);
            });
            return m;
        };

        const centers = this.dataLoader?.cache?.centers || [];
        const facilitiesRef = this.dataLoader?.cache?.facilities || [];
        const programsRef = this.dataLoader?.cache?.featuredPrograms || [];

        const facilityUsage = {};
        const programUsage = {};
        facilitiesRef.forEach(f => { if (f?.name) facilityUsage[String(f.name).trim()] = 0; });
        programsRef.forEach(p => { if (p?.name) programUsage[String(p.name).trim()] = 0; });

        centers.forEach(c => {
            (c.facilityFeatures || []).forEach(f => {
                const n = String(f?.name || '').trim();
                if (!n) return;
                facilityUsage[n] = (facilityUsage[n] || 0) + 1;
            });
            (c.featuredPrograms || []).forEach(p => {
                const n = String(p?.name || '').trim();
                if (!n) return;
                programUsage[n] = (programUsage[n] || 0) + 1;
            });
        });

        const countStyle = (count) => (count < 30)
            ? 'color:#dc3545; font-weight:800;'
            : 'color:#333; font-weight:700;';

        const allFacilitiesRows = [...facilitiesRef]
            .filter(f => f && f.name)
            .map(f => ({
                name: String(f.name).trim(),
                description: f.description || '',
                count: facilityUsage[String(f.name).trim()] || 0
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const allProgramsRows = [...programsRef]
            .filter(p => p && p.name)
            .map(p => ({
                name: String(p.name).trim(),
                category: p.category || 'Other',
                description: p.description || '',
                count: programUsage[String(p.name).trim()] || 0
            }))
            .sort((a, b) => {
                const ac = String(a.category || '').localeCompare(String(b.category || ''));
                if (ac !== 0) return ac;
                return String(a.name || '').localeCompare(String(b.name || ''));
            });

        const allFacilitiesTable = `
            <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                        <tr>
                            <th style="padding:10px; text-align:left; width:260px;">Facility Feature</th>
                            <th style="padding:10px; text-align:center; width:110px;">Centers</th>
                            <th style="padding:10px; text-align:left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(allFacilitiesRows.length ? allFacilitiesRows : []).map((r, idx) => {
                            return `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx % 2 ? 'background:#fcfcfc;' : ''}">
                                    <td style="padding:8px 10px; font-weight:600;">${esc(r.name)}</td>
                                    <td style="padding:8px 10px; text-align:center;"><span style="${countStyle(r.count)}">${esc(r.count)}</span></td>
                                    <td style="padding:8px 10px; color:#666; line-height:1.5;">${esc(r.description || '')}</td>
                                </tr>
                            `;
                        }).join('') || `
                            <tr><td colspan="3" style="padding:10px; color:#999;">None</td></tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;

        const allProgramsTable = `
            <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                        <tr>
                            <th style="padding:10px; text-align:left; width:260px;">Featured Program</th>
                            <th style="padding:10px; text-align:center; width:110px;">Centers</th>
                            <th style="padding:10px; text-align:left; width:160px;">Category</th>
                            <th style="padding:10px; text-align:left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(allProgramsRows.length ? allProgramsRows : []).map((r, idx) => {
                            return `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx % 2 ? 'background:#fcfcfc;' : ''}">
                                    <td style="padding:8px 10px; font-weight:600;">${esc(r.name)}</td>
                                    <td style="padding:8px 10px; text-align:center;"><span style="${countStyle(r.count)}">${esc(r.count)}</span></td>
                                    <td style="padding:8px 10px; color:#666;">${esc(r.category || '')}</td>
                                    <td style="padding:8px 10px; color:#666; line-height:1.5;">${esc(r.description || '')}</td>
                                </tr>
                            `;
                        }).join('') || `
                            <tr><td colspan="4" style="padding:10px; color:#999;">None</td></tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;

        const recentProgramsByCat = groupBy(recentProgs, (p) => p.category || 'Other');
        const recentProgramsGrouped = Array.from(recentProgramsByCat.keys()).sort().map(cat => {
            const items = recentProgramsByCat.get(cat) || [];
            return `
                <div style="margin-bottom:10px;">
                    <div style="font-weight:800; color:#333; font-size:12px;">${esc(cat)}</div>
                    <div style="font-size:12px; color:#444; line-height:1.6;">${items.map(p => `• ${esc(p.name)}`).join('<br>') || '<span style="color:#999;">None</span>'}</div>
                </div>
            `;
        }).join('');

        const recentlyCreated = `
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📅 Recently Created Filter Options (Last 90 Days)</div>
                <div style="margin-left: 10px; display: block;">
                    <h4 style="margin: 0 0 10px 0; font-weight: 700; font-size: 13px; display: block; color:#333;">New Facility Features:</h4>
                    ${recentFacs.length ? `<div style="font-size:12px; color:#444; line-height:1.6;">${recentFacs.map(f => `• ${esc(f.name)}`).join('<br>')}</div>` : '<p style="font-size:12px; color:#999; margin-left:0; display:block;">None</p>'}
                    <h4 style="margin: 14px 0 10px 0; font-weight: 700; font-size: 13px; display: block; color:#333;">New Featured Programs:</h4>
                    ${recentProgs.length ? `<div style="font-size:12px; color:#444; line-height:1.6;">${recentProgramsGrouped}</div>` : '<p style="font-size:12px; color:#999; margin-left:0; display:block;">None</p>'}
                </div>
            </div>
        `;

        const lowAssoc = `
            <br>
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">⚠️ Low Filter Association (&lt;30)</div>
                <div style="margin-left: 10px; display: block;">
                    <br>
                    <h4 style="margin: 0 0 10px 0; font-weight: 700; font-size: 13px; display: block; color:#333;">Facility Features (All)</h4>
                    ${allFacilitiesTable}
                    <br>
                    <h4 style="margin: 14px 0 10px 0; font-weight: 700; font-size: 13px; display: block; color:#333;">Featured Programs (All)</h4>
                    ${allProgramsTable}
                    <p style="font-size: 12px; color: #d93d3d; font-style: italic; margin-top: 16px; border-top: 1px solid #eee; padding-top: 12px; display: block; line-height: 1.6;">
                        <strong>Note:</strong> Associate as many applicable facility features and featured programs as possible to ensure centers show on the live location page filters.
                    </p>
                </div>
            </div>
        `;

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">🏷️ RSYC FILTER & TAG ASSOCIATIONS</div>
                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()}</p>
                ${recentlyCreated}
                ${lowAssoc}
            </div>
        `;
    }

    generateEmailAuditDataModels() {
        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 1000px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📘 RSYC DATA MODELS (CORE FIELDS)</div>
                
                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">1. Center Profile</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Primary center information and descriptions</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Title</strong></td>
                                <td style="padding:8px;">Center name</td>
                                <td style="padding:8px;">Red Shield Youth Center of Gaston - Joe R. Hudson</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>About This Center</strong></td>
                                <td style="padding:8px;">Center description (HTML)</td>
                                <td style="padding:8px; font-size:10px;">&lt;div&gt;Our community center offers...&lt;/div&gt;</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Facility Features</strong></td>
                                <td style="padding:8px;">Array of available facilities</td>
                                <td style="padding:8px;">["Full-Size Gymnasium", "Computer Lab", ...]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Featured Programs</strong></td>
                                <td style="padding:8px;">Array of program highlights</td>
                                <td style="padding:8px;">["Adventure Corps", "Club 316", ...]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Explainer Video Embed Code</strong></td>
                                <td style="padding:8px;">Video iframe HTML</td>
                                <td style="padding:8px; font-size:10px;">&lt;iframe src="..."&gt;&lt;/iframe&gt;</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Footer Scripture Verse</strong></td>
                                <td style="padding:8px;">Scripture text for footer</td>
                                <td style="padding:8px;">"For I know the plans I have for you..."</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Online Sign-Up</strong></td>
                                <td style="padding:8px;">Sign-up link</td>
                                <td style="padding:8px; font-size:10px;">https://online.traxsolutions.com/...</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Donation Form</strong></td>
                                <td style="padding:8px;">Donation link</td>
                                <td style="padding:8px; font-size:10px;">https://classy.org/give/...</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Facebook Page</strong></td>
                                <td style="padding:8px;">Facebook profile link</td>
                                <td style="padding:8px; font-size:10px;">https://facebook.com/SalvationArmyGastonia</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Gaston - Joe R. Hudson (NSC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">2. Program Schedules</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Program schedule details and timing</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Custom Program Schedule Title</strong></td>
                                <td style="padding:8px;">Schedule name</td>
                                <td style="padding:8px;">Arrive & Thrive</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Custom Program Schedule Subtitle</strong></td>
                                <td style="padding:8px;">Schedule description</td>
                                <td style="padding:8px;">Board Games and Computer Time</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>All Related Programs</strong></td>
                                <td style="padding:8px;">Link to program catalog</td>
                                <td style="padding:8px;">Adventure Corps</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Schedule Days</strong></td>
                                <td style="padding:8px;">Days program runs</td>
                                <td style="padding:8px;">["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Schedule Time</strong></td>
                                <td style="padding:8px;">Program time</td>
                                <td style="padding:8px;">2:30 PM - 6:30 PM</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Timezone</strong></td>
                                <td style="padding:8px;">Time zone reference</td>
                                <td style="padding:8px;">Eastern/America/New_York</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Frequency</strong></td>
                                <td style="padding:8px;">Recurrence pattern</td>
                                <td style="padding:8px;">Weekly</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Ages Served</strong></td>
                                <td style="padding:8px;">Age group array</td>
                                <td style="padding:8px;">["Elementary", "Middle", "Teen"]</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Contact Info</strong></td>
                                <td style="padding:8px;">Program coordinator</td>
                                <td style="padding:8px;">Name, email, phone</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>What to Bring</strong></td>
                                <td style="padding:8px;">Items to bring</td>
                                <td style="padding:8px;">Snack, water bottle</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Schedule Disclaimer</strong></td>
                                <td style="padding:8px;">Special notices</td>
                                <td style="padding:8px;">Hours may vary on holidays</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Hagerstown (PMC) - Titles: Arrive & Thrive, TROOPS Classes, STEM Crafts & Arts
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">3. Leaders</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Staff and leadership directory</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Person</strong></td>
                                <td style="padding:8px;">Staff member name</td>
                                <td style="padding:8px;">Damion Motley</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Role Type</strong></td>
                                <td style="padding:8px;">Position/title</td>
                                <td style="padding:8px;">Center Executive Director</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Center</strong></td>
                                <td style="padding:8px;">Center assignment (array)</td>
                                <td style="padding:8px;">Gaston - Joe R. Hudson</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Department</strong></td>
                                <td style="padding:8px;">Department/corps</td>
                                <td style="padding:8px;">Gastonia Corps</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Image</strong></td>
                                <td style="padding:8px;">Staff photo</td>
                                <td style="padding:8px;">Uploaded Photo</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Center Division</strong></td>
                                <td style="padding:8px;">Regional division (array)</td>
                                <td style="padding:8px;">NSC</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Gaston - Joe R. Hudson (NSC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">4. Hours</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Operating hours and schedules</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Center</strong></td>
                                <td style="padding:8px;">Center reference</td>
                                <td style="padding:8px;">Hickory</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Regular Hours Term</strong></td>
                                <td style="padding:8px;">Season/term label</td>
                                <td style="padding:8px;">August - May</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Open Full Days Dates</strong></td>
                                <td style="padding:8px;">Days fully open</td>
                                <td style="padding:8px;">All Week</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Closed Dates</strong></td>
                                <td style="padding:8px;">Holiday closures</td>
                                <td style="padding:8px;">July 3rd (4th of July Holiday)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Special Hours</strong></td>
                                <td style="padding:8px;">Extended/modified times</td>
                                <td style="padding:8px;">Early Drop 7:30AM / Late Pick 5:30PM</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Hickory (NSC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">5. Events</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Special events and camps</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Event Title</strong></td>
                                <td style="padding:8px;">Event name</td>
                                <td style="padding:8px;">The Great Garden Escape</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Center</strong></td>
                                <td style="padding:8px;">Host center</td>
                                <td style="padding:8px;">Aiken Teen Center</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Event Type</strong></td>
                                <td style="padding:8px;">Type of event</td>
                                <td style="padding:8px;">Spring Break Camp</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Start Date and Time</strong></td>
                                <td style="padding:8px;">Event start</td>
                                <td style="padding:8px;">2026-04-06T12:00:00Z</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>End Date and Time</strong></td>
                                <td style="padding:8px;">Event end</td>
                                <td style="padding:8px;">2026-04-10T21:00:00Z</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Extended Care Times</strong></td>
                                <td style="padding:8px;">Before/after care hours</td>
                                <td style="padding:8px;">Early Drop 7:30AM / Late 5:30PM</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Special Features</strong></td>
                                <td style="padding:8px;">Event highlights</td>
                                <td style="padding:8px;">Escape Rooms, Crafts, Field Trips</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Cost</strong></td>
                                <td style="padding:8px;">Registration fee</td>
                                <td style="padding:8px;">$80 (Includes meals & snacks)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Contact Person</strong></td>
                                <td style="padding:8px;">Primary contact</td>
                                <td style="padding:8px;">Kathleen Hutto</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Contact Email</strong></td>
                                <td style="padding:8px;">Contact email</td>
                                <td style="padding:8px;">kathleen.hutto@uss.salvationarmy.org</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Contact Number</strong></td>
                                <td style="padding:8px;">Contact phone</td>
                                <td style="padding:8px;">(803) 522-2963</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Primary Button Text</strong></td>
                                <td style="padding:8px;">CTA button label</td>
                                <td style="padding:8px;">Register Here</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Primary Button Link</strong></td>
                                <td style="padding:8px;">Registration URL</td>
                                <td style="padding:8px; font-size:10px;">https://online.traxsolutions.com/...</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Event Image</strong></td>
                                <td style="padding:8px;">Event photo</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Aiken Teen Center (NSC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">6. Informational Pages</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Facility policies, safety protocols, and mission details</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Page Title</strong></td>
                                <td style="padding:8px;">Information headline</td>
                                <td style="padding:8px;">Safety Protocol & Guidelines</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Category</strong></td>
                                <td style="padding:8px;">Information type</td>
                                <td style="padding:8px;">Safety</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Body</strong></td>
                                <td style="padding:8px;">Detail content (HTML)</td>
                                <td style="padding:8px; font-size:10px;">&lt;div&gt;We ensure that...&lt;/div&gt;</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>URL Thumbnail Image</strong></td>
                                <td style="padding:8px;">Upload image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>External URL</strong></td>
                                <td style="padding:8px;">External link/PDF</td>
                                <td style="padding:8px; font-size:10px;">https://example.com/safety.pdf</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Aiken Teen Center (NSC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">7. Stories</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Success stories and testimonials</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Story Title</strong></td>
                                <td style="padding:8px;">Story headline</td>
                                <td style="padding:8px;">How the Red Shield Youth Center Helped One Teen Find His Way</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Center</strong></td>
                                <td style="padding:8px;">Story center location</td>
                                <td style="padding:8px;">Greater Charlotte - Belmont Avenue</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Story Date</strong></td>
                                <td style="padding:8px;">Published/authored date</td>
                                <td style="padding:8px;">2025-08-25</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Author</strong></td>
                                <td style="padding:8px;">Story author</td>
                                <td style="padding:8px;">Ed Boyce</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Body</strong></td>
                                <td style="padding:8px;">Full story narrative (HTML)</td>
                                <td style="padding:8px; font-size:10px;">&lt;article&gt;Micah Grier came...&lt;/article&gt;</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Thumbnail Image</strong></td>
                                <td style="padding:8px;">Story preview image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Main Image</strong></td>
                                <td style="padding:8px;">Story featured image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>External URL</strong></td>
                                <td style="padding:8px;">External story link</td>
                                <td style="padding:8px; font-size:10px;">https://southernusa.salvationarmy.org/...</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Greater Charlotte - Belmont Avenue (NSC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">8. Photos</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Homepage and section images</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Center</strong></td>
                                <td style="padding:8px;">Center reference</td>
                                <td style="padding:8px;">Baltimore - Middle River</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Exterior Photo</strong></td>
                                <td style="padding:8px;">Building exterior image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Facility Features Photo</strong></td>
                                <td style="padding:8px;">Facilities image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Programs Photo</strong></td>
                                <td style="padding:8px;">Programs section image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Nearby Centers Photo</strong></td>
                                <td style="padding:8px;">Locations image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Parents Section Photo</strong></td>
                                <td style="padding:8px;">Parents page image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Youth Section Photo</strong></td>
                                <td style="padding:8px;">Youth page image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Get Involved Photo</strong></td>
                                <td style="padding:8px;">Volunteer/involvement image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Footer Photo</strong></td>
                                <td style="padding:8px;">Footer background image</td>
                                <td style="padding:8px;">Uploaded Image</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Status</strong></td>
                                <td style="padding:8px;">Publication status</td>
                                <td style="padding:8px;">5. Published by THQ</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> Baltimore - Middle River (PMC)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">9. Facility Features</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Physical amenities and resources</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Title</strong></td>
                                <td style="padding:8px;">Facility name</td>
                                <td style="padding:8px;">Full-Size Gymnasium</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Description</strong></td>
                                <td style="padding:8px;">Facility purpose/details</td>
                                <td style="padding:8px;">Basketball, volleyball & sports</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Icon Class</strong></td>
                                <td style="padding:8px;">Bootstrap icon identifier</td>
                                <td style="padding:8px;">bi bi-trophy</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> All centers (40+ shared facilities)
                    </div>
                </div>

                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px;">
                    <h4 style="font-size:16px; font-weight:700; color:#242424; margin:0 0 4px 0;">10. Programs</h4>
                    <p style="font-size:11px; color:#666; margin:0 0 12px 0;">Program catalog</p>
                    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f0f0f0; border-bottom:2px solid #ddd;">
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Field Name</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Purpose</th>
                                <th style="text-align:left; padding:8px; font-weight:700; color:#333;">Example Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Title</strong></td>
                                <td style="padding:8px;">Program name</td>
                                <td style="padding:8px;">Adventure Corps: Explorers (Gr. 1–5)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Description</strong></td>
                                <td style="padding:8px;">Program summary</td>
                                <td style="padding:8px;">Outdoor, skill-based team program</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Category</strong></td>
                                <td style="padding:8px;">Program category</td>
                                <td style="padding:8px;">Character & Leadership</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px; color:#0078d4;"><strong>Icon Class</strong></td>
                                <td style="padding:8px;">Bootstrap icon identifier</td>
                                <td style="padding:8px;">bi bi-shield</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size:10px; color:#666; padding:6px 8px; background:#f9f9f9; border-radius:4px;">
                        <strong>Example Center:</strong> All centers (55+ shared programs)
                    </div>
                </div>

            </div>
        `;
    }

    async buildDataModelsFromLiveData() {
        /**
         * Dynamically fetch and build data models from live JSON endpoints
         * Shows actual single-record examples for each model type
         */
        try {
            const baseUrl = 'https://thisishoperva.org/rsyc';
            
            // SharePoint/system fields to hide
            const hiddenFields = new Set([
                '@odata.etag', 'ItemInternalId', 'Editor', 'Editor#Claims', 'Author', 'Author#Claims',
                '{Identifier}', '{IsFolder}', '{Thumbnail}', '{Link}', '{Name}', '{FilenameWithExtension}',
                '{Path}', '{FullPath}', '{ContentType}', '{ContentType}#Id', '{HasAttachments}', '{VersionNumber}',
                'CountryOrRegion', 'FacilityFeatures@odata.type', 'FacilityFeatures#Id', 'FacilityFeatures#Id@odata.type',
                'FeaturedPrograms@odata.type', 'FeaturedPrograms#Id', 'URLEventImage', 'URLEventThumbnail'
            ]);
            
            const systemFieldPatterns = /@odata|#|{.*}|__|^_|Claims|etag|created|modified|version|lastmodified/i;
            
            // Field name normalization (rename certain fields for display)
            const normalizeFieldName = (fieldName) => {
                const renames = {
                    'URLEventImage': 'EventImage',
                    'URLEventThumbnail': 'EventThumbnail'
                };
                return renames[fieldName] || fieldName;
            };
            
            // Generate smart purpose descriptions based on field name
            const generatePurpose = (fieldName, value) => {
                const lower = fieldName.toLowerCase();
                
                if (lower.includes('image') || lower.includes('photo') || lower.includes('picture') || lower.includes('thumbnail')) return 'High-quality uploaded image';
                if (lower.includes('title') || lower.includes('name')) return 'Display name/title';
                if (lower.includes('email') || lower.includes('@')) return 'Contact email';
                if (lower.includes('phone') || lower.includes('number')) return 'Phone/contact number';
                if (lower.includes('date') || lower.includes('time')) return 'Date/timestamp';
                if (lower.includes('url') || lower.includes('link') || lower.includes('href')) return 'External link/URL';
                if (lower.includes('description') || lower.includes('body')) return 'Narrative/rich content';
                if (lower.includes('status') || lower.includes('state')) return 'Status/lifecycle';
                if (lower.includes('category') || lower.includes('type') || lower.includes('kind')) return 'Classification/category';
                if (lower.includes('center')) return 'Location/center reference';
                if (lower.includes('cost') || lower.includes('price') || lower.includes('fee')) return 'Pricing/cost';
                if (lower.includes('person') || lower.includes('staff') || lower.includes('author') || lower.includes('contact')) return 'Person/staff reference';
                if (lower.includes('days') || lower.includes('schedule') || lower.includes('hours')) return 'Scheduling/timing';
                if (lower.includes('content') || lower.includes('text')) return 'Text content';
                if (Array.isArray(value)) return 'Related items (array)';
                if (typeof value === 'object' && value !== null) return 'Structured data';
                
                return 'Field value';
            };

            // Recursively find the most useful value in an object
            const extractObjectValue = (obj, depth = 0) => {
                if (depth > 5) return null; // Prevent infinite recursion
                
                // Priority order of fields to look for
                const priorities = [
                    'displayName', 'name', 'title', 'Person', 'email', 'value',
                    'Title', 'Name', 'Email', 'DisplayName'
                ];
                
                // Check priority fields first
                for (const field of priorities) {
                    if (field in obj && obj[field] !== null && obj[field] !== undefined) {
                        const val = obj[field];
                        if (typeof val === 'string' && val.trim().length > 0) {
                            return val;
                        }
                    }
                }
                
                // Look for any non-system string field
                for (const [key, val] of Object.entries(obj)) {
                    if (systemFieldPatterns.test(key)) continue;
                    if (hiddenFields.has(key)) continue;
                    
                    if (typeof val === 'string' && val.trim().length > 0 && !val.startsWith('{')) {
                        return val;
                    }
                }
                
                // If no string found, check for nested objects/arrays
                for (const [key, val] of Object.entries(obj)) {
                    if (systemFieldPatterns.test(key)) continue;
                    if (hiddenFields.has(key)) continue;
                    
                    if (typeof val === 'object' && val !== null) {
                        const nested = extractObjectValue(val, depth + 1);
                        if (nested) return nested;
                    }
                }
                
                return null;
            };

            // Format value intelligently for display
            const formatValue = (val, maxLen = 60) => {
                if (val === null || val === undefined) return '—';
                
                // Handle strings
                if (typeof val === 'string') {
                    // Hide amazonaws URLs entirely - just show upload indicator
                    if (val.includes('amazonaws.com')) {
                        return '[Uploaded Image]';
                    }
                    
                    // HTML content - extract text preview
                    if (val.includes('<') && val.includes('>')) {
                        const text = val.replace(/<[^>]*>/g, '').trim();
                        return text.length > 0 ? (text.length > maxLen ? text.substring(0, maxLen) + '...' : text) : '[HTML markup]';
                    }
                    // URLs - show domain
                    if (val.startsWith('http')) {
                        try {
                            const url = new URL(val);
                            return url.hostname;
                        } catch (e) {
                            return '[URL]';
                        }
                    }
                    // Regular strings
                    return val.length > maxLen ? val.substring(0, maxLen) + '...' : val;
                }
                
                // Handle arrays
                if (Array.isArray(val)) {
                    if (val.length === 0) return '[]';
                    
                    // For arrays of objects, extract useful values
                    if (typeof val[0] === 'object' && val[0] !== null) {
                        const values = val.slice(0, 3).map(item => {
                            const extracted = extractObjectValue(item);
                            return extracted || '[Item]';
                        }).filter(v => v !== '[Item]' || val.length === 1);
                        
                        if (values.length === 0) return '[]';
                        return `[${values.join(', ')}${val.length > 3 ? ', ...' : ''}]`;
                    }
                    
                    // Arrays of strings
                    return `[${val.slice(0, 3).join(', ')}${val.length > 3 ? ', ...' : ''}]`;
                }
                
                // Handle objects - dig down to find the usable value
                if (typeof val === 'object' && val !== null) {
                    const extracted = extractObjectValue(val);
                    if (extracted) return extracted.length > maxLen ? extracted.substring(0, maxLen) + '...' : extracted;
                    
                    // If no string value found, describe the structure
                    const keys = Object.keys(val).filter(k => !systemFieldPatterns.test(k) && !hiddenFields.has(k));
                    if (keys.length > 0) {
                        return `[${keys.length} properties]`;
                    }
                    return '[Complex object]';
                }
                
                // Handle numbers/booleans
                if (typeof val === 'number' || typeof val === 'boolean') {
                    return String(val);
                }
                
                return '—';
            };

            const models = [];

            // 1. CENTER PROFILE
            try {
                const centersRes = await fetch(`${baseUrl}/units-rsyc-profiles.json`);
                const centers = await centersRes.json();
                const gastonCenter = centers.find(c => c.Title && c.Title.includes('Gaston'));
                
                if (gastonCenter) {
                    const centerFields = Object.keys(gastonCenter)
                        .filter(k => !hiddenFields.has(k) && gastonCenter[k] !== null && gastonCenter[k] !== undefined && gastonCenter[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, gastonCenter[k]),
                            example: formatValue(gastonCenter[k], 60)
                        }));
                    
                    models.push({
                        title: '1. Center Profile',
                        fields: centerFields.slice(0, 12),
                        example: `${gastonCenter.Title} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Center Profile data:', e); }

            // 2. PROGRAM SCHEDULES
            try {
                const schedulesRes = await fetch(`${baseUrl}/RSYCProgramSchedules.json`);
                const schedules = await schedulesRes.json();
                const haggerstownSchedules = schedules.filter(s => s.Center && String(s.Center).toLowerCase().includes('hagerstown'));
                const arriveAndThrive = haggerstownSchedules.find(s => s.CustomProgramScheduleTitle === 'Arrive & Thrive');
                
                if (arriveAndThrive) {
                    const scheduleFields = Object.keys(arriveAndThrive)
                        .filter(k => !hiddenFields.has(k) && arriveAndThrive[k] !== null && arriveAndThrive[k] !== undefined && arriveAndThrive[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, arriveAndThrive[k]),
                            example: formatValue(arriveAndThrive[k], 60)
                        }));
                    
                    models.push({
                        title: '2. Program Schedules',
                        fields: scheduleFields,
                        example: `${arriveAndThrive.CustomProgramScheduleTitle} at ${arriveAndThrive.Center} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Program Schedules data:', e); }

            // 3. LEADERS
            try {
                const leadersRes = await fetch(`${baseUrl}/RSYCLeaders.json`);
                const leaders = await leadersRes.json();
                const gastonLeader = leaders.find(l => l.Department && l.Department.includes('Gastonia'));
                
                if (gastonLeader) {
                    const leaderFields = Object.keys(gastonLeader)
                        .filter(k => !hiddenFields.has(k) && gastonLeader[k] !== null && gastonLeader[k] !== undefined && gastonLeader[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, gastonLeader[k]),
                            example: formatValue(gastonLeader[k], 60)
                        }));
                    
                    models.push({
                        title: '3. Leaders',
                        fields: leaderFields,
                        example: `${gastonLeader.Person} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Leaders data:', e); }

            // 4. HOURS
            try {
                const hoursRes = await fetch(`${baseUrl}/RSYCHours.json`);
                const hours = await hoursRes.json();
                const hickoryHours = hours.find(h => h.Center && String(h.Center).includes('Hickory'));
                
                if (hickoryHours) {
                    const hourFields = Object.keys(hickoryHours)
                        .filter(k => !hiddenFields.has(k) && hickoryHours[k] !== null && hickoryHours[k] !== undefined && hickoryHours[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, hickoryHours[k]),
                            example: formatValue(hickoryHours[k], 60)
                        }));
                    
                    models.push({
                        title: '4. Hours',
                        fields: hourFields,
                        example: `${hickoryHours.Center} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Hours data:', e); }

            // 5. EVENTS (now derived from program schedules marked for events)
            try {
                // fetch schedules and pick one item flagged ShowinEventsSection to illustrate the schema
                const schedulesRes = await fetch(`${baseUrl}/RSYCProgramSchedules.json`);
                const schedules = await schedulesRes.json();
                const eventSample = (schedules || []).find(s => s && s.ShowinEventsSection === true);

                if (eventSample) {
                    const eventFields = Object.keys(eventSample)
                        .filter(k => !hiddenFields.has(k) && eventSample[k] !== null && eventSample[k] !== undefined && eventSample[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, eventSample[k]),
                            example: formatValue(eventSample[k], 60)
                        }));
                    
                    models.push({
                        title: '5. Events',
                        fields: eventFields,
                        example: `${eventSample.CustomProgramScheduleTitle || eventSample.Title || ''} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Events data:', e); }

            // 6. INFORMATIONAL PAGES
            try {
                const infoPagesRes = await fetch(`${baseUrl}/RSYCInformationalPages.json`);
                const infoPages = await infoPagesRes.json();
                const infoPage = infoPages && infoPages.length > 0 ? infoPages[0] : null;
                
                if (infoPage) {
                    const infoFields = Object.keys(infoPage)
                        .filter(k => !hiddenFields.has(k) && infoPage[k] !== null && infoPage[k] !== undefined && infoPage[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, infoPage[k]),
                            example: formatValue(infoPage[k], 60)
                        }));
                    
                    models.push({
                        title: '6. Informational Pages',
                        fields: infoFields,
                        example: `${infoPage.PageTitle || infoPage.Title || 'Informational Page'} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Informational Pages data:', e); }

            // 7. STORIES
            try {
                const storiesRes = await fetch(`${baseUrl}/RSYCStories.json`);
                const stories = await storiesRes.json();
                const story = stories && stories.length > 0 ? stories[0] : null;
                
                if (story) {
                    const storyFields = Object.keys(story)
                        .filter(k => !hiddenFields.has(k) && story[k] !== null && story[k] !== undefined && story[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, story[k]),
                            example: formatValue(story[k], 60)
                        }));
                    
                    models.push({
                        title: '7. Stories',
                        fields: storyFields,
                        example: `${story.StoryTitle} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Stories data:', e); }

            // 8. PHOTOS
            try {
                const photosRes = await fetch(`${baseUrl}/RSYCHomepagePhotos.json`);
                const photos = await photosRes.json();
                const baltimorPhotos = photos.find(p => p.Center && String(p.Center).includes('Baltimore'));
                
                if (baltimorPhotos) {
                    const photoFields = Object.keys(baltimorPhotos)
                        .filter(k => !hiddenFields.has(k) && baltimorPhotos[k] !== null && baltimorPhotos[k] !== undefined && baltimorPhotos[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, baltimorPhotos[k]),
                            example: formatValue(baltimorPhotos[k], 60)
                        }));
                    
                    models.push({
                        title: '8. Photos',
                        fields: photoFields,
                        example: `${baltimorPhotos.Center} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Photos data:', e); }

            // 9. FACILITY FEATURES (Pick List)
            try {
                const facilitiesRes = await fetch(`${baseUrl}/RSYCFacilityFeatures.json`);
                const facilities = await facilitiesRes.json();
                const gymnasiumFeature = facilities.find(f => f.Title && f.Title.includes('Gymnasium'));
                
                if (gymnasiumFeature) {
                    const facilityFields = Object.keys(gymnasiumFeature)
                        .filter(k => !hiddenFields.has(k) && gymnasiumFeature[k] !== null && gymnasiumFeature[k] !== undefined && gymnasiumFeature[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, gymnasiumFeature[k]),
                            example: formatValue(gymnasiumFeature[k], 60)
                        }));
                    
                    models.push({
                        title: '9. Facility Features (Pick List)',
                        fields: facilityFields,
                        example: `${gymnasiumFeature.Title} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Facility Features data:', e); }

            // 10. PROGRAMS (Pick List)
            try {
                const programsRes = await fetch(`${baseUrl}/RSYCPrograms.json`);
                const programs = await programsRes.json();
                const adventureCorps = programs.find(p => p.Title && p.Title.includes('Adventure Corps'));
                
                if (adventureCorps) {
                    const programFields = Object.keys(adventureCorps)
                        .filter(k => !hiddenFields.has(k) && adventureCorps[k] !== null && adventureCorps[k] !== undefined && adventureCorps[k] !== '')
                        .map(k => ({
                            name: normalizeFieldName(k),
                            purpose: generatePurpose(k, adventureCorps[k]),
                            example: formatValue(adventureCorps[k], 60)
                        }));
                    
                    models.push({
                        title: '10. Programs (Pick List)',
                        fields: programFields,
                        example: `${adventureCorps.Title} (Real data)`
                    });
                }
            } catch (e) { console.warn('Error loading Programs data:', e); }

            this.liveDataModels = models;
            return models;
        } catch (e) {
            console.error('Error building data models from live data:', e);
            return [];
        }
    }

    createDataModelsSection() {
        const content = document.createElement('div');
        content.style.fontSize = '12px';
        content.style.padding = '12px';
        content.style.lineHeight = '1.6';
        content.style.maxHeight = '600px';
        content.style.overflowY = 'auto';
        content.style.color = '#333';
        
        // Use live data models if available, otherwise use fallback
        const models = this.liveDataModels && this.liveDataModels.length > 0 ? this.liveDataModels : [
            {
                title: '1. Center Profile',
                fields: [
                    { name: 'Title', purpose: 'Center name', example: 'Red Shield Youth Center of Gaston - Joe R. Hudson' },
                    { name: 'About This Center', purpose: 'Center description (HTML)', example: '<div>Our community center offers...</div>' },
                    { name: 'Facility Features', purpose: 'Array of available facilities', example: '["Full-Size Gymnasium", "Computer Lab", ...]' },
                    { name: 'Featured Programs', purpose: 'Array of program highlights', example: '["Adventure Corps", "Club 316", ...]' },
                    { name: 'Explainer Video Embed Code', purpose: 'Video iframe HTML', example: '<iframe src="..."></iframe>' },
                    { name: 'Footer Scripture Verse', purpose: 'Scripture text for footer', example: '"For I know the plans I have for you..."' },
                    { name: 'Online Sign-Up', purpose: 'Sign-up link', example: 'https://online.traxsolutions.com/...' },
                    { name: 'Donation Form', purpose: 'Donation link', example: 'https://classy.org/give/...' },
                    { name: 'Facebook Page', purpose: 'Facebook profile link', example: 'https://facebook.com/SalvationArmyGastonia' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Gaston - Joe R. Hudson (NSC)'
            },
            {
                title: '2. Program Schedules',
                fields: [
                    { name: 'Custom Program Schedule Title', purpose: 'Schedule name', example: 'Arrive & Thrive' },
                    { name: 'Custom Program Schedule Subtitle', purpose: 'Schedule description', example: 'Board Games and Computer Time' },
                    { name: 'All Related Programs', purpose: 'Link to program catalog', example: 'Adventure Corps' },
                    { name: 'Schedule Days', purpose: 'Days program runs', example: '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]' },
                    { name: 'Schedule Time', purpose: 'Program time', example: '2:30 PM - 6:30 PM' },
                    { name: 'Timezone', purpose: 'Time zone reference', example: 'Eastern/America/New_York' },
                    { name: 'Frequency', purpose: 'Recurrence pattern', example: 'Weekly' },
                    { name: 'Ages Served', purpose: 'Age group array', example: '["Elementary", "Middle", "Teen"]' },
                    { name: 'Contact Info', purpose: 'Program coordinator', example: 'Name, email, phone' },
                    { name: 'What to Bring', purpose: 'Items to bring', example: 'Snack, water bottle' },
                    { name: 'Schedule Disclaimer', purpose: 'Special notices', example: 'Hours may vary on holidays' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Hagerstown (PMC) - Titles: Arrive & Thrive, TROOPS Classes, STEM Crafts & Arts'
            },
            {
                title: '3. Leaders',
                fields: [
                    { name: 'Person', purpose: 'Staff member name', example: 'Damion Motley' },
                    { name: 'Role Type', purpose: 'Position/title', example: 'Center Executive Director' },
                    { name: 'Center', purpose: 'Center assignment (array)', example: 'Gaston - Joe R. Hudson' },
                    { name: 'Department', purpose: 'Department/corps', example: 'Gastonia Corps' },
                    { name: 'Image', purpose: 'Staff photo', example: 'Uploaded Photo' },
                    { name: 'Center Division', purpose: 'Regional division (array)', example: 'NSC' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Gaston - Joe R. Hudson (NSC)'
            },
            {
                title: '4. Hours',
                fields: [
                    { name: 'Center', purpose: 'Center reference', example: 'Hickory' },
                    { name: 'Regular Hours Term', purpose: 'Season/term label', example: 'August - May' },
                    { name: 'Open Full Days Dates', purpose: 'Days fully open', example: 'All Week' },
                    { name: 'Closed Dates', purpose: 'Holiday closures', example: 'July 3rd (4th of July Holiday)' },
                    { name: 'Special Hours', purpose: 'Extended/modified times', example: 'Early Drop 7:30AM / Late Pick 5:30PM' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Hickory (NSC)'
            },
            {
                title: '5. Events',
                fields: [
                    { name: 'Event Title', purpose: 'Event name', example: 'The Great Garden Escape' },
                    { name: 'Center', purpose: 'Host center', example: 'Aiken Teen Center' },
                    { name: 'Event Type', purpose: 'Type of event', example: 'Spring Break Camp' },
                    { name: 'Start Date and Time', purpose: 'Event start', example: '2026-04-06T12:00:00Z' },
                    { name: 'End Date and Time', purpose: 'Event end', example: '2026-04-10T21:00:00Z' },
                    { name: 'Extended Care Times', purpose: 'Before/after care hours', example: 'Early Drop 7:30AM / Late 5:30PM' },
                    { name: 'Special Features', purpose: 'Event highlights', example: 'Escape Rooms, Crafts, Field Trips' },
                    { name: 'Cost', purpose: 'Registration fee', example: '$80 (Includes meals & snacks)' },
                    { name: 'Contact Person', purpose: 'Primary contact', example: 'Kathleen Hutto' },
                    { name: 'Contact Email', purpose: 'Contact email', example: 'kathleen.hutto@uss.salvationarmy.org' },
                    { name: 'Contact Number', purpose: 'Contact phone', example: '(803) 522-2963' },
                    { name: 'Primary Button Text', purpose: 'CTA button label', example: 'Register Here' },
                    { name: 'Primary Button Link', purpose: 'Registration URL', example: 'https://online.traxsolutions.com/...' },
                    { name: 'Event Image', purpose: 'Event photo', example: 'Uploaded Image' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Aiken Teen Center (NSC)'
            },
            {
                title: '6. Informational Pages',
                fields: [
                    { name: 'Page Title', purpose: 'The title of the information page', example: 'Safety Protocol & Guidelines' },
                    { name: 'Center', purpose: 'Host center location', example: 'Aiken Teen Center' },
                    { name: 'Category', purpose: 'Classification (e.g. Safety, Policy, Faith)', example: 'Safety' },
                    { name: 'Body', purpose: 'Main content/protocol details (HTML)', example: '<div>We ensure that all staff...</div>' },
                    { name: 'URL Thumbnail Image', purpose: 'Uploaded thumbnail image URL', example: 'https://uss-cache.salvationarmy.org/...' },
                    { name: 'External URL', purpose: 'Link to external source or PDF', example: 'https://example.com/safety.pdf' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Aiken Teen Center (NSC)'
            },
            {
                title: '7. Stories',
                fields: [
                    { name: 'Story Title', purpose: 'Story headline', example: 'How the Red Shield Youth Center Helped One Teen Find His Way' },
                    { name: 'Center', purpose: 'Story center location', example: 'Greater Charlotte - Belmont Avenue' },
                    { name: 'Story Date', purpose: 'Published/authored date', example: '2025-08-25' },
                    { name: 'Author', purpose: 'Story author', example: 'Ed Boyce' },
                    { name: 'Body', purpose: 'Full story narrative (HTML)', example: '<article>Micah Grier came...</article>' },
                    { name: 'Thumbnail Image', purpose: 'Story preview image', example: 'Uploaded Image' },
                    { name: 'Main Image', purpose: 'Story featured image', example: 'Uploaded Image' },
                    { name: 'External URL', purpose: 'External story link', example: 'https://southernusa.salvationarmy.org/...' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Greater Charlotte - Belmont Avenue (NSC)'
            },
            {
                title: '8. Photos',
                fields: [
                    { name: 'Center', purpose: 'Center reference', example: 'Baltimore - Middle River' },
                    { name: 'Exterior Photo', purpose: 'Building exterior image', example: 'Uploaded Image' },
                    { name: 'Facility Features Photo', purpose: 'Facilities image', example: 'Uploaded Image' },
                    { name: 'Programs Photo', purpose: 'Programs section image', example: 'Uploaded Image' },
                    { name: 'Nearby Centers Photo', purpose: 'Locations image', example: 'Uploaded Image' },
                    { name: 'Parents Section Photo', purpose: 'Parents page image', example: 'Uploaded Image' },
                    { name: 'Youth Section Photo', purpose: 'Youth page image', example: 'Uploaded Image' },
                    { name: 'Get Involved Photo', purpose: 'Volunteer/involvement image', example: 'Uploaded Image' },
                    { name: 'Footer Photo', purpose: 'Footer background image', example: 'Uploaded Image' },
                    { name: 'Status', purpose: 'Publication status', example: '5. Published by THQ' }
                ],
                example: 'Baltimore - Middle River (PMC)'
            },
            {
                title: '9. Facility Features (Pick List)',
                fields: [
                    { name: 'Title', purpose: 'Facility name', example: 'Full-Size Gymnasium' },
                    { name: 'Description', purpose: 'Facility purpose/details', example: 'Basketball, volleyball & sports' },
                    { name: 'Icon Class', purpose: 'Bootstrap icon identifier', example: 'bi bi-trophy' }
                ],
                example: 'All centers (40+ shared facilities)'
            },
            {
                title: '10. Programs (Pick List)',
                fields: [
                    { name: 'Title', purpose: 'Program name', example: 'Adventure Corps: Explorers (Gr. 1–5)' },
                    { name: 'Description', purpose: 'Program summary', example: 'Outdoor, skill-based team program' },
                    { name: 'Category', purpose: 'Program category', example: 'Character & Leadership' },
                    { name: 'Icon Class', purpose: 'Bootstrap icon identifier', example: 'bi bi-shield' }
                ],
                example: 'All centers (55+ shared programs)'
            }
        ];
        
        models.forEach((model, index) => {
            // Model title
            const titleDiv = document.createElement('div');
            titleDiv.style.fontWeight = '700';
            titleDiv.style.fontSize = '13px';
            titleDiv.style.marginTop = index === 0 ? '0' : '16px';
            titleDiv.style.marginBottom = '8px';
            titleDiv.style.color = '#242424';
            titleDiv.textContent = model.title;
            content.appendChild(titleDiv);
            
            // Fields table
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginBottom = '4px';
            table.style.fontSize = '11px';
            table.style.border = '1px solid #e0e0e0';
            
            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.style.backgroundColor = '#f0f0f0';
            headerRow.style.borderBottom = '2px solid #ddd';
            
            ['Field Name', 'Purpose', 'Example'].forEach(headerText => {
                const th = document.createElement('th');
                th.style.textAlign = 'left';
                th.style.padding = '6px';
                th.style.fontWeight = '700';
                th.style.color = '#333';
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Body
            const tbody = document.createElement('tbody');
            model.fields.forEach((field, fieldIndex) => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid #eee';
                
                const nameCell = document.createElement('td');
                nameCell.style.padding = '6px';
                nameCell.style.color = '#0078d4';
                nameCell.style.fontWeight = '600';
                nameCell.style.fontSize = '10px';
                nameCell.textContent = field.name;
                row.appendChild(nameCell);
                
                const purposeCell = document.createElement('td');
                purposeCell.style.padding = '6px';
                purposeCell.style.fontSize = '10px';
                purposeCell.textContent = field.purpose;
                row.appendChild(purposeCell);
                
                const exampleCell = document.createElement('td');
                exampleCell.style.padding = '6px';
                exampleCell.style.fontSize = '10px';
                exampleCell.style.color = '#666';
                exampleCell.textContent = field.example;
                row.appendChild(exampleCell);
                
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            content.appendChild(table);
            
            // Example center
            const exampleDiv = document.createElement('div');
            exampleDiv.style.fontSize = '10px';
            exampleDiv.style.color = '#666';
            exampleDiv.style.padding = '6px';
            exampleDiv.style.backgroundColor = '#f9f9f9';
            exampleDiv.style.borderRadius = '3px';
            exampleDiv.style.marginBottom = '6px';
            exampleDiv.innerHTML = `<strong>Example:</strong> ${model.example}`;
            content.appendChild(exampleDiv);
        });
        
        return content;
    }

    createCenterProfileSectionsSection() {
        const content = document.createElement('div');
        content.style.fontSize = '12px';
        content.style.padding = '15px';
        content.style.background = '#fcfcfc';
        
        if (this.templateEngine && typeof this.templateEngine.getSectionReferenceTable === 'function') {
            content.innerHTML = this.templateEngine.getSectionReferenceTable();
        } else {
            content.innerHTML = '<div style="color:#d93d3d; padding:20px; border:1px solid #ffccd5; background:#fff5f5; border-radius:8px;">Section Metadata unavailable. Ensure RSYCTemplates is initialized correctly.</div>';
        }
        
        return content;
    }

    generateEmailMasterCommandCenter() {
        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">🛠️ RSYC CENTER PROFILE MASTER COMMAND CENTER</div>
                <div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:12px; padding:24px; margin-bottom:30px; font-family:Segoe UI, sans-serif;">
                    <div style="margin-bottom:24px; border-bottom:2px solid #eee; padding-bottom:20px;">
                        <h4 style="font-size:20px; font-weight:700; color:#242424; margin:0 0 8px 0;">Dashboard & Resource Links</h4>
                        <p style="font-size:14px; color:#444; line-height:1.6; margin:0 0 15px 0;">
                            To ensure each location is represented well for our upcoming launch, use this dashboard to manage all local content. Final launch dates will be set once profiles are reviewed and marked "Ready to Publish."
                        </p>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:15px;">
                            <div style="background:#fff; border:1px solid #d0e3ff; border-radius:10px; padding:15px; border-left:5px solid #0078d4;">
                                <div style="font-weight:700; color:#0056b3; font-size:12px; text-transform:uppercase; margin-bottom:8px;">🚀 Primary Profile Editor</div>
                                <br>
                                <a href="https://centerprofile.redshieldyouth.org" target="_blank" style="font-size:16px; color:#0078d4; text-decoration:none; font-weight:700; display:block;">centerprofile.redshieldyouth.org</a>
                                <div style="font-size:12px; color:#666; margin-top:6px;">Main portal for editing About, Contact, Hours, and Mandatory Fields.</div>
                            </div>
                            <div style="background:#fff; border:1px solid #eee; border-radius:10px; padding:15px; border-left:5px solid #666;">
                                <br>
                                <div style="font-weight:700; color:#666; font-size:12px; text-transform:uppercase; margin-bottom:8px;">📚 Training & Support</div>
                                <br>
                                <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/SitePages/Manage-Youth-Center-Web-Profile.aspx" target="_blank" style="font-size:13px; color:#0078d4; text-decoration:underline; font-weight:600;">View Detailed User Guide</a>
                                <br>
                                <a href="https://southernusa.salvationarmy.org/redshieldyouth/center-locations" target="_blank" style="font-size:13px; color:#0078d4; text-decoration:underline; font-weight:600;">Live Profiles Filter Site</a>
                            </div>
                        </div>

                        <div style="font-size:13px; color:#444; background-color:#fff8e1; border-left:5px solid #f2c200; padding:15px; line-height:1.6; border-radius:6px; margin-bottom:15px;">
                            <br>
                            <b>💡 Dashboard Pro-Tips:</b><br>
                            • <b>Seamless Editing:</b> Click directly beneath each field label to select options or enter text; work is saved automatically when you click away.<br>
                            • <b>Launch Process:</b> When updates are finished, set the status to <b>"Ready to Publish"</b> and @mention <b>@Shared THQ Web and Social Media</b> in the sidebar comments.
                        </div>
                    </div>

                    <hr style="border:none; border-top:1px solid #e5e5e5; margin:18px 0;">

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:35px; margin-bottom:28px;">
                        <div>
                            <h5 style="font-size:15px; font-weight:700; color:#d93d3d; margin:0 0 15px 0; display:flex; align-items:center;">
                                <span style="background:#d93d3d; color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-right:8px; font-size:12px;">1</span> High-Priority Content Updates
                            </h5>
                            <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:13px; font-weight:500;">📅 Operating Hours</span>
                                    <a href="https://hoursreview-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#0078d4; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Manage →</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:13px; font-weight:500;">🖼️ Center Exterior Photos</span>
                                    <a href="https://photos1review-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#0078d4; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Manage →</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:13px; font-weight:500;">📋 Program Schedules</span>
                                        <a href="https://submitschedules-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#28a745; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Add New →</a>
                                    </div>
                                    <a href="https://schedulesreview-rsyc.usscommunications.org/" target="_blank" style="font-size:10px; color:#0078d4; text-decoration:underline; font-weight:600; margin-left:2px;">Edit/Review Existing Schedules</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:13px; font-weight:500;">👥 Staff & Local Leaders</span>
                                        <a href="https://submitstaff-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#28a745; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Add New →</a>
                                    </div>
                                    <a href="https://staffreview-rsyc.usscommunications.org/" target="_blank" style="font-size:10px; color:#0078d4; text-decoration:underline; font-weight:600; margin-left:2px;">Edit/Review Existing Staff</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:13px; font-weight:500;">🎭 Hero / Theatre Slides</span>
                                        <a href="https://submitslides-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#28a745; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Add New →</a>
                                    </div>
                                    <a href="https://slidesreview-rsyc.usscommunications.org/" target="_blank" style="font-size:10px; color:#0078d4; text-decoration:underline; font-weight:600; margin-left:2px;">Edit/Review Existing Slides</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:13px; font-weight:500;">📰 Stories</span>
                                        <a href="https://submitstories-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#28a745; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Add New →</a>
                                    </div>
                                    <a href="https://storiesreview-rsyc.usscommunications.org/" target="_blank" style="font-size:10px; color:#0078d4; text-decoration:underline; font-weight:600; margin-left:2px;">Edit/Review Existing Stories</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:13px; font-weight:500;">📣 Events</span>
                                        <a href="https://submitevents-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#28a745; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Add New →</a>
                                    </div>
                                    <a href="https://eventsreview-rsyc.usscommunications.org/" target="_blank" style="font-size:10px; color:#0078d4; text-decoration:underline; font-weight:600; margin-left:2px;">Edit/Review Existing Events</a>
                                </div>
                                <br>
                                <div style="background:white; border:1px solid #eee; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:13px; font-weight:500;">📄 Informational Pages</span>
                                        <a href="https://submitinfopage-rsyc.usscommunications.org/" target="_blank" style="font-size:11px; background:#28a745; color:white; padding:4px 10px; border-radius:4px; text-decoration:none;">Add New →</a>
                                    </div>
                                    <a href="https://infopagereview-rsyc.usscommunications.org/" target="_blank" style="font-size:10px; color:#0078d4; text-decoration:underline; font-weight:600; margin-left:2px;">Edit/Review Existing Informational Pages</a>
                                </div>
                            </div>
                        </div>

                        <div>
                            <br>
                            <h5 style="font-size:15px; font-weight:700; color:#242424; margin:0 0 15px 0; display:flex; align-items:center;">
                                <span style="background:#242424; color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-right:8px; font-size:12px;">2</span> Required Profile Data
                            </h5>
                            <div style="font-size:13px; color:#555; line-height:1.7;">
                                <div style="background:#fff; border:1px solid #eee; padding:12px; border-radius:8px; margin-bottom:12px;">
                                    <br>
                                    <b style="color:#333;">Category Maintenance:</b><br>
                                    • Facility Features: <a href="https://sauss.sharepoint.com/sites/THQITDWeb/Lists/RSYCFacilityFeatures/AllItems.aspx?env=WebViewList" target="_blank" style="color:#0078d4; font-weight:600;">View Pick List</a> | <a href="https://forms.office.com/r/DtqymAM3Vu" target="_blank" style="color:#0078d4; font-weight:600;">Submit Missing Feature</a><br>
                                    • Featured Programs: <a href="https://sauss.sharepoint.com/sites/THQITDWeb/Lists/RSYCPrograms/AllItems.aspx?env=WebViewList" target="_blank" style="color:#0078d4; font-weight:600;">View Pick List</a> | <a href="https://forms.office.com/r/9AwuTKQ3fE" target="_blank" style="color:#0078d4; font-weight:600;">Submit Missing Program</a><br>
                                    <span style="font-size:11px; color:#777; font-style:italic;">Use these if your center offers something not in current pick-lists.</span>
                                </div>
                                <div style="background:#f0f7ff; border:1px solid #cfe2ff; padding:12px; border-radius:8px;">
                                    <br>
                                    <b style="color:#004085;">Mandatory Narrative Fields:</b><br>
                                    • Overall "About This Center" History/Story<br>
                                    • Parent/Guardian Registration Link<br>
                                    • Classy Donation Link (for Youth Ministry)<br>
                                    • Volunteer/Mentor Contact Instructions<br>
                                    • Local Footer Scripture Verse<br>
                                    • Program: select either or both <b>"Youth Snack Provided"</b> or <b>"Youth Meal Provided"</b><br>
                                    • Facility Features: select <b>"After-school Pickup"</b> when offered
                                </div>
                                <div style="background:#fff; border:1px solid #eee; padding:12px; border-radius:8px; margin-top:12px;">
                                    <br>
                                    <b style="color:#333;">Best Practices From Live Profiles:</b><br>
                                    • <b>Events & Camps:</b> <u>Camps should be listed as Events</u>, not just as a program schedule item.<br>
                                    • <b>Informational Pages:</b> <u>Use for presentations and parent meetings.</u> Do not use for events, programs, volunteer recruitment, or fundraising.<br>
                                    • About: who you serve (ages/grades) + core programs (after-school, camps, tutoring, arts/sports)
                                    • About: outcomes (academic support, character/leadership, life skills, faith/values)
                                    • Schedules: title + optional subtitle, days, time range, timezone, and frequency
                                    • Schedules: include season details (start/end dates or months running) and registration opens
                                    • Schedules: add ages served, fees, transportation notes, and holiday/closure disclaimers when relevant
                                    • Schedules narrative: describe activities, meals/snacks, transportation, and family expectations
                                    • Volunteer: include contact name, email/phone, and required steps (background check, Safe From Harm, orientation)
                                    • Other fields: parent sign-up link and donation link
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr style="border:none; border-top:1px solid #e5e5e5; margin:18px 0;">

                    <div style="display:grid; grid-template-columns:1fr; gap:35px; border-top:1px solid #eee; padding-top:28px;">
                        <div>
                            <h4 style="font-size:17px; font-weight:800; color:#242424; margin:0 0 15px 0;">🔐 Permissions & User Access</h4>
                            <div style="font-size:13px; color:#555; line-height:1.6;">
                                <p style="margin-bottom:12px;">Divisional Communications Directors and Authorized Web Teams can grant edit permissions directly:</p>
                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/_layouts/15/user.aspx?obj=%7B681BC933-4712-4B2E-893C-8A6136B28795%7D%2C0%2CIcon" target="_blank" style="background:#f8f9fa; border:1px solid #ddd; padding:8px 12px; border-radius:6px; color:#0078d4; text-decoration:none; font-weight:600; font-size:12px;">Grant Permissions to RSYC Manager</a>
                                    <div style="display:block;">
                                        <a href="https://sauss.sharepoint.com/sites/THQITDWeb/Lists/RSYCPermissions/AllItems.aspx?env=WebViewList" target="_blank" style="color:#0078d4; font-size:11px; text-decoration:underline;">View Center Profile Permissions</a>
                                        <br>
                                        <a href="https://sauss.sharepoint.com/sites/THQITDWeb/Lists/RSYCDivisionPermissions/AllItems.aspx?env=WebViewList" target="_blank" style="color:#0078d4; font-size:11px; text-decoration:underline;">View Division Profile Permissions</a>
                                    </div>
                                </div>
                                <p style="font-size:11px; color:#888; margin-top:12px;">Need Help? Email <a href="mailto:THQ.Web.SocialMedia@uss.salvationarmy.org" style="color:#0078d4;">Shared THQ Web and Social Media</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateEmailAuditProgramSchedules(data) {
        const { centers, schedules } = data;

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
        const val = (v, fallback = '') => (v === null || v === undefined || v === '' ? fallback : v);
        const joinArr = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(', ') : '';

        const centersBySpId = new Map((centers || []).map(c => [String(c.sharePointId ?? c.id ?? c.Id), c]));

        const schedulesByCenterId = {};
        (schedules || []).forEach(s => {
            const cid = String(s.centerId ?? '');
            if (!cid) return;
            if (!schedulesByCenterId[cid]) schedulesByCenterId[cid] = [];
            schedulesByCenterId[cid].push(s);
        });

        Object.keys(schedulesByCenterId).forEach(cid => {
            schedulesByCenterId[cid].sort((a, b) => {
                const at = Number.isFinite(a._timeMinutes) ? a._timeMinutes : 24 * 60;
                const bt = Number.isFinite(b._timeMinutes) ? b._timeMinutes : 24 * 60;
                if (at !== bt) return at - bt;
                const ad = Number.isFinite(a._firstDayIndex) ? a._firstDayIndex : 99;
                const bd = Number.isFinite(b._firstDayIndex) ? b._firstDayIndex : 99;
                if (ad !== bd) return ad - bd;
                return String(a.title || '').localeCompare(String(b.title || ''));
            });
        });

        const fieldRows = [
            ['Title','title','Schedule title or event name'],
            ['Center','centerId','Associated center SharePoint ID'],
            ['Custom Program Schedule Title','customProgramScheduleTitle','Alternate title field (if used).'],
            ['Custom Program Schedule Subtitle','customProgramScheduleSubtitle','Useful very short description'],
            ['Modified','modified','Last modified timestamp.'],
            ['Status','status','Is it ready or will you submit it as a draft? You can always edit submitted items later.'],
            ['Schedule Time','scheduleTime','Time of day (e.g. 3:30 PM - 5:30 PM)'],
            ['Category','category','Classification or type of program.'],
            ['All Related Programs','allRelatedPrograms','Please select each related program delivered during this same time.'],
            ['Contact Info','contactInfo','Enter a name or email address (active mailbox).'],
            ['Contact Phone Number','contactPhoneNumber','Phone number for inquiries.'],
            ['Schedule Days','scheduleDays','Days of week the program runs (e.g. Mon, Wed, Fri)'],
            ['Schedule Disclaimer','scheduleDisclaimer','Example: (Holidays and teacher workdays hours will vary)'],
            ['Image','image','URL or filename of associated image'],
            ['Start Date','startDate','Optional explicit start date'],
            ['End Date','endDate','Optional explicit end date'],
            ['Time zone','timezone','Time zone for the schedule'],
            ['Frequency','frequency','How often the program recurs (weekly, monthly, etc.)'],
            ['Narrative','narrative','Main description. Include special features and exciting things attendees can expect.'],
            ['Extended Care Times','extendedCareTimes','Details of any extended care options.'],
            ['What to bring','whatToBring','Include what parents should send and what the center provides.'],
            ['Orientation Details','orientationDetails','Is an orientation scheduled? Info parents need before registering.'],
            ['Cost','cost','Example: $25 per week/child; Includes breakfast/lunch and snack.'],
            ['Transportation Fee and Details','transportationFeeandDetails','List schools and pick-up/drop-off details.'],
            ['Ages Served','agesServed','Point out whether you serve 5‑year‑olds or other age groups.'],
            ['Ages Served Custom','agesServedCustom','Provide age range if not in the dropdown.'],
            ['Registration is open','registrationIsOpen','When parents can prepare to apply; select months open.'],
            ['Program Runs In','programRunsIn','Months the program is actively running.'],
            ['Address','address','Street address if applicable.'],
            ['Primary Button Text','primaryButtonText','Text for main call-to-action button.'],
            ['Primary Button Link','primaryButtonLink','URL for main action button.'],
            ['Secondary Button Text','secondaryButtonText','Text for secondary action button.'],
            ['Secondary Button Link','secondaryButtonLink','URL for secondary action.'],
            ['Video Embed Code','videoEmbedCode','YouTube or toolkit video embed code.'],
            ['Modified By','modifiedBy','User who last modified.'],
            ['Created','created','Creation timestamp.'],
            ['Created By','createdBy','User who created.'],
            ['Closed Dates','closedDates','List upcoming closure dates for the program.'],
            ['Open Full Days Dates','openFullDayDates','Dates/policy for full‑planning days.'],
            ['Open Half Days Dates','openHalfDayDates','Dates/policy for half‑days.'],
            ['URLImage','urlImage','Image URL used on site.'],
            ['URLThumbnailImage','urlThumbnailImage','Thumbnail image URL.'],
            ['Show in Events Section','showInEventsSection','One‑time programs, camps, seasonal offerings should be in events section.'],
            ['Center:Division','centerDivision','Division of the center.'],
            ['Center:City','centerCity','City of the center.'],
            ['Center:State','centerState','State of the center.'],
            ['Attachments','attachments','Link or reference to flyers/graphics.']
        ];

        const fieldGuide = `
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📘 Program Schedule Model Fields (Purpose Guide)</div>
                <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px; text-align:left; width:200px;">Field</th>
                                <th style="padding:10px; text-align:left; width:200px;">Raw Name</th>
                                <th style="padding:10px; text-align:left;">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fieldRows.map(([f,v,p], idx) => `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx % 2 ? 'background:#fcfcfc;' : ''}">
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(f)}</td>
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(v)}</td>
                                    <td style="padding:8px 10px; color:#555; line-height:1.5;">${esc(p)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const centerBlocks = Object.keys(schedulesByCenterId)
            .sort((a, b) => {
                const ca = centersBySpId.get(String(a));
                const cb = centersBySpId.get(String(b));
                return String(ca?.name || '').localeCompare(String(cb?.name || ''));
            })
            .map(centerId => {
                const c = centersBySpId.get(String(centerId));
                const centerName = c?.name || c?.Title || `Center ${centerId}`;
                const centerCity = c?.city || '';
                const centerState = c?.state || '';
                const items = schedulesByCenterId[centerId] || [];

                const rowsHtml = items.map(s => {
                    const contacts = (Array.isArray(s.contacts) && s.contacts.length)
                        ? s.contacts.map(x => [x.name, x.email].filter(Boolean).join(' ')).filter(Boolean).join(' | ')
                        : '';

                    const keyFacts = [
                        joinArr(s.scheduleDays),
                        s.scheduleTime || '',
                        s.timezone ? `TZ: ${s.timezone}` : '',
                        s.frequency ? `Freq: ${s.frequency}` : '',
                        Array.isArray(s.programRunsIn) && s.programRunsIn.length ? `Runs: ${joinArr(s.programRunsIn)}` : '',
                        Array.isArray(s.registrationOpensIn) && s.registrationOpensIn.length ? `Reg opens: ${joinArr(s.registrationOpensIn)}` : ''
                    ].filter(Boolean).join(' • ');

                    const optional = [
                        s.subtitle ? `Subtitle: ${s.subtitle}` : '',
                        s.ageRange ? `Age range: ${s.ageRange}` : '',
                        Array.isArray(s.agesServed) && s.agesServed.length ? `Ages served: ${joinArr(s.agesServed)}` : '',
                        s.cost ? `Cost: ${s.cost}` : '',
                        s.location ? `Location: ${s.location}` : '',
                        s.capacity ? `Capacity: ${s.capacity}` : '',
                        s.registrationDeadline ? `Registration deadline: ${s.registrationDeadline}` : '',
                        s.registrationFee ? `Registration fee: ${s.registrationFee}` : '',
                        s.dropOffPickUp ? `Drop-off/pick-up: ${s.dropOffPickUp}` : '',
                        s.transportationFeeandDetails ? `Transportation: ${s.transportationFeeandDetails}` : '',
                        s.closedDates ? `Closed dates: ${s.closedDates}` : '',
                        s.openHalfDayDates ? `Open half-days: ${s.openHalfDayDates}` : '',
                        s.openFullDayDates ? `Open full-days: ${s.openFullDayDates}` : '',
                        s.scheduleDisclaimer ? `Disclaimer: ${s.scheduleDisclaimer}` : '',
                        s.contactInfo ? `Contact info: ${s.contactInfo}` : '',
                        contacts ? `Contacts: ${contacts}` : '',
                        s.status ? `Status: ${s.status}` : ''
                    ].filter(Boolean);

                    return `
                        <tr style="border-bottom:1px solid #f3f3f3;">
                            <td style="padding:8px 10px; font-weight:700; font-size:12px;">${esc(s.title || '')}</td>
                            <td style="padding:8px 10px; font-size:12px; color:#555; line-height:1.5;">
                                <div style="margin-bottom:4px;">${esc(keyFacts)}</div>
                                ${optional.length ? `<div style=\"font-size:11px; color:#777;\">${optional.map(x => `• ${esc(x)}`).join('<br>')}</div>` : ''}
                            </td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                        <div style="background:#fff; border:1px solid #e9ecef; border-radius:10px; overflow:hidden;">
                            <div style="padding:12px 14px; background:#f8f9fa; border-bottom:1px solid #e9ecef;">
                                <div style="font-weight:800; color:#242424;">${esc(centerName)}</div>
                                <div style="font-size:12px; color:#666;">${esc([centerCity, centerState].filter(Boolean).join(', '))} • ${items.length} schedule item(s)</div>
                            </div>
                            <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
                                <thead style="background:#fff; border-bottom:1px solid #eee;">
                                    <tr>
                                        <th style="padding:10px; text-align:left; width:240px; font-size:11px; color:#333;">Program</th>
                                        <th style="padding:10px; text-align:left; font-size:11px; color:#333;">Schedule + Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                        <br>
                    </div>
                `;
            })
            .join('');

        const instructionBlock = `
            <div style="padding: 16px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; font-family: 'Segoe UI', sans-serif; margin: 8px;">
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">RSYC Program Schedule & Events Instructions</div>
                    <p style="font-size: 14px; color: #333; line-height: 1.5; margin: 0 20px 8px 0;">All programs and events are submitted using this form. Please click in the area beneath each field label to see instructions and enter your information. Changes are saved when you click out of a field. If you have images or flyers, please add them as attachments.</p>
                    <div style="margin-bottom: 12px;">
                        <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/SitePages/Manage-Youth-Center-Web-Profile.aspx#center-profile-manager" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">Learn more</a>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/center-locations" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View Your Profile</a>
                        <a href="https://schedulesreview-rsyc.usscommunications.org/" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View and edit submitted program schedules or events</a>
                        <a href="https://submitevents-rsyc.usscommunications.org/" target="_blank" style="font-size:13px; color:#0078d4; text-decoration:underline; margin:0 6px 12px 0; display:inline-block;">Submit a new Program Schedule or Event item</a>
                    </div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 8px 10px; margin: 0 20px 8px 0; line-height: 1.5;">💬 Submit recurring programs that are part of your regular afterschool or corps programming as separate items (for example: Afterschool Enrichment, Youth Night, Homework Help, Music & Arts, Dance, Drama, Youth Meals, or Sunday Worship). These will appear in the Program Schedule section.</div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 8px 10px; margin: 0 20px 8px 0; line-height: 1.5;">One-time programs, camps, seasonal offerings, or special activities (such as Spring Break Camp, Summer Day Camp, or community events) should also be submitted here.</div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #d13438; padding: 8px 10px; margin: 0 20px 16px 0; line-height: 1.5; font-weight: 600;">IMPORTANT: If you want a program or activity to appear in both the Program Schedule and the Events section of your website, simply check the Show in Events Section box. This is especially helpful for camps, seasonal programs, and one-time events.</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px">
                    <div>
                        <div style="font-size: 15px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">Check it out!</div>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/hickory" target="_blank" style="font-size: 15px; color: #0078d4; text-decoration: underline;">View an example of a profile with combined program schedules and events.</a>
                    </div>
                </div>
            </div>
        `;

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 1000px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📅 RSYC TERRITORIAL PROGRAM SCHEDULE CATALOG</div>
                
                ${instructionBlock}

                <div style="font-size:12px; color:#777; font-style:italic; margin-bottom:12px; line-height:1.6;">
                    Note: the live center profiles already include print helpers (individual schedule print and a "Print all schedules" option). We also have a share-ready flyer concept that combines center bio, photo, and active schedules for easy sharing.
                </div>
                <br>
                <div style="font-size:13px; color:#444; margin-bottom:14px; line-height:1.7;">
                    <b>Why this matters:</b> Program schedules are one of the most shareable and practical parts of a center profile.
                    Breaking schedules into clear, consistent items (title + days + time + brief details) makes it easier for families to browse, for staff to promote, and for partners to share.
                </div>
                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()} • ${val((schedules || []).length)} total schedule item(s)</p>
                ${fieldGuide}
                <br>
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📌 Current Schedules (Grouped by Center)</div>
                <br>
                ${centerBlocks || '<div style="font-size:13px; color:#999;">No schedules found.</div>'}
            </div>
        `;
    }

    generateEmailAuditEvents(data) {
        // expects schedules array where ShowinEventsSection flag marks actual events
        const { centers, schedules, events } = data || {};
        // determine source array
        let eventItems = [];
        if (Array.isArray(schedules)) {
            // use schedules but only those explicitly marked for events
            eventItems = (schedules || []).filter(s => s && s.ShowinEventsSection === true);
        } else if (Array.isArray(events)) {
            // legacy dataset – include all
            eventItems = events;
        } else {
            eventItems = [];
        }

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
        const val = (v, fallback = '') => (v === null || v === undefined || v === '' ? fallback : v);
        
        const centersBySpId = new Map((centers || []).map(c => [String(c.sharePointId ?? c.id ?? c.Id), c]));

        const eventsByCenterId = {};
        (eventItems || []).forEach(e => {
            const cid = String(e.centerId ?? '');
            if (!cid) return;
            if (!eventsByCenterId[cid]) eventsByCenterId[cid] = [];
            eventsByCenterId[cid].push(e);
        });

        const instructionBlock = `
            <div style="padding: 16px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; font-family: 'Segoe UI', sans-serif; margin: 8px;">
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">RSYC Program Schedule & Events Instructions</div>
                    <p style="font-size: 14px; color: #333; line-height: 1.5; margin: 0 20px 8px 0;">All programs and events are submitted using this form. Please click in the area beneath each field label to see instructions and enter your information. Changes are saved when you click out of a field. If you have images or flyers, please add them as attachments.</p>
                    <div style="margin-bottom: 12px;">
                        <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/SitePages/Manage-Youth-Center-Web-Profile.aspx#center-profile-manager" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">Learn more</a>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/center-locations" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View Your Profile</a>
                        <a href="https://schedulesreview-rsyc.usscommunications.org/" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View and edit submitted program schedules or events</a>
                        <a href="https://submitevents-rsyc.usscommunications.org/" target="_blank" style="font-size:13px; color:#0078d4; text-decoration:underline; margin:0 6px 12px 0; display:inline-block;">Submit a new Program Schedule or Event item</a>
                    </div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 8px 10px; margin: 0 20px 8px 0; line-height: 1.5;">💬 Submit recurring programs that are part of your regular afterschool or corps programming as separate items (for example: Afterschool Enrichment, Youth Night, Homework Help, Music & Arts, Dance, Drama, Youth Meals, or Sunday Worship). These will appear in the Program Schedule section.</div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 8px 10px; margin: 0 20px 8px 0; line-height: 1.5;">One-time programs, camps, seasonal offerings, or special activities (such as Spring Break Camp, Summer Day Camp, or community events) should also be submitted here.</div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #d13438; padding: 8px 10px; margin: 0 20px 16px 0; line-height: 1.5; font-weight: 600;">IMPORTANT: If you want a program or activity to appear in both the Program Schedule and the Events section of your website, simply check the Show in Events Section box. This is especially helpful for camps, seasonal programs, and one-time events.</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px">
                    <div>
                        <div style="font-size: 15px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">Check it out!</div>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/hickory" target="_blank" style="font-size: 15px; color: #0078d4; text-decoration: underline;">View an example of a profile with combined program schedules and events.</a>
                    </div>
                </div>
            </div>
        `;
        // same field list used for program schedules since events are now schedules
        const fieldRows = [
            ['Title','title','Schedule title or event name'],
            ['Center','centerId','Associated center SharePoint ID'],
            ['Custom Program Schedule Title','customProgramScheduleTitle','Alternate title field (if used).'],
            ['Custom Program Schedule Subtitle','customProgramScheduleSubtitle','Useful very short description'],
            ['Modified','modified','Last modified timestamp.'],
            ['Status','status','Is it ready or will you submit it as a draft? You can always edit submitted items later.'],
            ['Schedule Time','scheduleTime','Time of day (e.g. 3:30 PM - 5:30 PM)'],
            ['Category','category','Classification or type of program.'],
            ['All Related Programs','allRelatedPrograms','Please select each related program delivered during this same time.'],
            ['Contact Info','contactInfo','Enter a name or email address (active mailbox).'],
            ['Contact Phone Number','contactPhoneNumber','Phone number for inquiries.'],
            ['Schedule Days','scheduleDays','Days of week the program runs (e.g. Mon, Wed, Fri)'],
            ['Schedule Disclaimer','scheduleDisclaimer','Example: (Holidays and teacher workdays hours will vary)'],
            ['Image','image','URL or filename of associated image'],
            ['Start Date','startDate','Optional explicit start date'],
            ['End Date','endDate','Optional explicit end date'],
            ['Time zone','timezone','Time zone for the schedule'],
            ['Frequency','frequency','How often the program recurs (weekly, monthly, etc.)'],
            ['Narrative','narrative','Main description. Include special features and exciting things attendees can expect.'],
            ['Extended Care Times','extendedCareTimes','Details of any extended care options.'],
            ['What to bring','whatToBring','Include what parents should send and what the center provides.'],
            ['Orientation Details','orientationDetails','Is an orientation scheduled? Info parents need before registering.'],
            ['Cost','cost','Example: $25 per week/child; Includes breakfast/lunch and snack.'],
            ['Transportation Fee & Details','transportationFeeandDetails','List schools and pick-up/drop-off details.'],
            ['Ages Served','agesServed','Point out whether you serve 5‑year‑olds or other age groups.'],
            ['Ages Served Custom','agesServedCustom','Provide age range if not in the dropdown.'],
            ['Registration is open','registrationIsOpen','When parents can prepare to apply; select months open.'],
            ['Program Runs In','programRunsIn','Months the program is actively running.'],
            ['Address','address','Street address if applicable.'],
            ['Primary Button Text','primaryButtonText','Text for main call-to-action button.'],
            ['Primary Button Link','primaryButtonLink','URL for main action button.'],
            ['Secondary Button Text','secondaryButtonText','Text for secondary action button.'],
            ['Secondary Button Link','secondaryButtonLink','URL for secondary action.'],
            ['Video Embed Code','videoEmbedCode','YouTube or toolkit video embed code.'],
            ['Modified By','modifiedBy','User who last modified.'],
            ['Created','created','Creation timestamp.'],
            ['Created By','createdBy','User who created.'],
            ['Closed Dates','closedDates','List upcoming closure dates for the program.'],
            ['Open Full Days Dates','openFullDayDates','Dates/policy for full‑planning days.'],
            ['Open Half Days Dates','openHalfDayDates','Dates/policy for half‑days.'],
            ['URLImage','urlImage','Image URL used on site.'],
            ['URLThumbnailImage','urlThumbnailImage','Thumbnail image URL.'],
            ['Show in Events Section','showInEventsSection','One‑time programs, camps, seasonal offerings should be in events section.'],
            ['Center:Division','centerDivision','Division of the center.'],
            ['Center:City','centerCity','City of the center.'],
            ['Center:State','centerState','State of the center.'],
            ['Attachments','attachments','Link or reference to flyers/graphics.']
        ];

        const fieldGuide = `
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📘 Program Schedule Model Fields (Purpose Guide)</div>
                <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px; text-align:left; width:200px;">Field</th>
                                <th style="padding:10px; text-align:left; width:200px;">Raw Name</th>
                                <th style="padding:10px; text-align:left;">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fieldRows.map(([f,v,p], idx) => `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx % 2 ? 'background:#fcfcfc;' : ''}">
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(f)}</td>
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(v)}</td>
                                    <td style="padding:8px 10px; color:#555; line-height:1.5;">${esc(p)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const centerBlocks = Object.keys(eventsByCenterId)
            .sort((a, b) => {
                const ca = centersBySpId.get(String(a));
                const cb = centersBySpId.get(String(b));
                return String(ca?.name || '').localeCompare(String(cb?.name || ''));
            })
            .map(centerId => {
                const c = centersBySpId.get(String(centerId));
                const centerName = c?.name || c?.Title || `Center ${centerId}`;
                const items = eventsByCenterId[centerId] || [];

                const rowsHtml = items.map(e => {
                    const dateInfo = [
                        e.startDateTime ? `Start: ${e.startDateTime}` : '',
                        e.endDateTime ? `End: ${e.endDateTime}` : ''
                    ].filter(Boolean).join(' • ');

                    const details = [
                        e.eventType ? `Type: ${e.eventType}` : '',
                        e.cost ? `Cost: ${e.cost}` : '',
                        e.subtitle ? `Subtitle: ${e.subtitle}` : ''
                    ].filter(Boolean).join(' • ');

                    return `
                        <tr style="border-bottom:1px solid #f3f3f3;">
                            <td style="padding:8px 10px; font-weight:700; font-size:12px;">${esc(e.title || '')}</td>
                            <td style="padding:8px 10px; font-size:12px; color:#555; line-height:1.5;">
                                <div style="margin-bottom:4px;">${esc(dateInfo)}</div>
                                <div style="font-size:11px; color:#777;">${esc(details)}</div>
                            </td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                        <div style="background:#fff; border:1px solid #e9ecef; border-radius:10px; overflow:hidden;">
                            <div style="padding:12px 14px; background:#f8f9fa; border-bottom:1px solid #e9ecef;">
                                <div style="font-weight:800; color:#242424;">${esc(centerName)}</div>
                                <div style="font-size:12px; color:#666;">${items.length} upcoming event(s)</div>
                            </div>
                            <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
                                <thead style="background:#fff; border-bottom:1px solid #eee;">
                                    <tr>
                                        <th style="padding:10px; text-align:left; width:240px; font-size:11px; color:#333;">Event</th>
                                        <th style="padding:10px; text-align:left; font-size:11px; color:#333;">Dates & Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                        <br>
                    </div>
                `;
            })
            .join('');

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 1000px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📣 RSYC TERRITORIAL UPCOMING EVENTS CATALOG</div>
                
                ${instructionBlock}

                <div style="font-size:12px; color:#777; font-style:italic; margin-bottom:12px; line-height:1.6;">
                    Note: All events are shown in the program schedule section on the live website automatically when published.
                </div>
                <br>
                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()} • ${val((eventItems || []).length)} total event(s)</p>
                ${fieldGuide}
                <br>
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📌 Upcoming Events (Grouped by Center)</div>
                <br>
                ${centerBlocks || '<div style="font-size:13px; color:#999;">No upcoming events found.</div>'}
            </div>
        `;
    }

    generateEmailAuditStories(data) {
        const { centers, stories } = data;

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
        const val = (v, fallback = '') => (v === null || v === undefined || v === '' ? fallback : v);
        
        const centersBySpId = new Map((centers || []).map(c => [String(c.sharePointId ?? c.id ?? c.Id), c]));

        const storiesByCenterId = {};
        (stories || []).forEach(s => {
            const cid = String(s.centerId ?? '');
            if (!cid) return;
            if (!storiesByCenterId[cid]) storiesByCenterId[cid] = [];
            storiesByCenterId[cid].push(s);
        });

        const instructionBlock = `
            <div style="padding: 16px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; font-family: 'Segoe UI', sans-serif; margin: 8px; border-radius: 8px; border: 1px solid #eee;">
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">RSYC Stories Instructions</div>
                    <div style="font-size: 14px; color: #333; line-height: 1.5; margin-bottom: 8px;">Click in the area beneath each of the field labels to see instructions or provide your own text. Changes are saved automatically.</div>
                    <div style="margin-bottom: 12px;">
                        <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/SitePages/Manage-Youth-Center-Web-Profile.aspx#center-profile-manager" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">Learn more</a>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/center-locations" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View Your Profile</a>
                        <a href="https://storiesreview-rsyc.usscommunications.org/" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View and edit submitted stories</a>
                        <a href="https://submitstories-rsyc.usscommunications.org/" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">Submit a Story Item</a>
                    </div>
                    <div style="font-size: 15px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 8px 10px; margin-bottom: 12px; line-height: 1.5;">💬 Stories should highlight the center’s impact on youth, families, and the community. Choose stories that inspire, inform, and celebrate accomplishments.</div>
                    
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Guidance for selecting stories:</div>
                    <div style="margin-left: 16px; margin-bottom: 12px; font-size: 14px; color: #444;">
                        • Youth Spotlights: Highlight achievements, talents, and personal growth.<br>
                        • Local Community Highlights: Showcase partnerships, volunteer initiatives, or neighborhood impact.<br>
                        • Earned Media: Link to news coverage, press releases, or blog articles.<br>
                        • Fundraising & Events: Promote upcoming events, share recaps, and highlight donor impact.<br>
                        • Programs & Activities: Share innovative programs, special activities, and successes.<br>
                        • Partner & School Features: Spotlight collaborations with local schools, organizations, or community groups.<br>
                        • Legacy Giving Stories: Show how gifts make a long-term impact on youth and families.
                    </div>

                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Tips for writing stories:</div>
                    <div style="margin-left: 16px; margin-bottom: 12px; font-size: 14px; color: #444;">
                        • Keep the story concise, clear, and positive.<br>
                        • Include quotes from youth, staff, or community members when appropriate.<br>
                        • Add photos or videos to bring the story to life.<br>
                        • Use links to program pages, event registrations, or partner websites for additional context.<br>
                        • Focus on impact—how did the program, event, or initiative benefit youth, families, or the community?
                    </div>

                </div>
                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px; border-top: 1px solid #eee; padding-top: 16px;">
                    <div>
                        <div style="font-size: 15px; font-weight: 600; color: #242424; margin-bottom: 8px;">Check it out!</div>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/aiken-teen-center" target="_blank" style="font-size: 15px; color: #0078d4; text-decoration: underline;">View an example of a profile with published stories</a>
                    </div>
                </div>
            </div>
        `;

        const fieldRows = [
            ['Title','Title','Record title, usually the center name or short descriptor.'],
            ['Center','Center','Associated center SharePoint ID.'],
            ['Story Title','StoryTitle','Public name of the story shown on the website.'],
            ['Status','Status','Select Draft or Published.'],
            ['Modified','Modified','Last modified timestamp.'],
            ['Modified By','ModifiedBy','User who last updated the item.'],
            ['Story Image','StoryImage','URL of the main story image (THQ use only).'],
            ['Story date','StoryDate','When the story occurred or was published.'],
            ['Author','Author','Name of the person who wrote the story.'],
            ['Excerpt','Excerpt','A short, quoted sentence or two from the story that appears on the story card.'],
            ['Embed Video','EmbedVideo','External embed code for a video about the story.'],
            ['Primary CTA Name','PrimaryCTAName','Text for primary call‑to‑action button.'],
            ['Primary CTA Link','PrimaryCTALink','URL for primary call‑to‑action.'],
            ['Secondary CTA Link','SecondaryCTALink','URL for secondary call‑to‑action.'],
            ['Secondary CTA Name','SecondaryCTAName','Text for secondary call‑to‑action button.'],
            ['URL Thumbnail Image','URLThumbnailImage','(THQ use only) thumbnail image URL.'],
            ['URL Main Image','URLMainImage','(THQ use only) main image URL.'],
            ['External URL','ExternalURL','URL where visitors can read or watch the full story.']
        ];

        const fieldGuide = `
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📘 Story Model Fields (Purpose Guide)</div>
                <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px; text-align:left; width:200px;">Field</th>
                                <th style="padding:10px; text-align:left; width:200px;">Raw Name</th>
                                <th style="padding:10px; text-align:left;">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fieldRows.map(([f,v,p], idx) => `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx % 2 ? 'background:#fcfcfc;' : ''}">
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(f)}</td>
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(v)}</td>
                                    <td style="padding:8px 10px; color:#555; line-height:1.5;">${esc(p)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const centerBlocks = Object.keys(storiesByCenterId)
            .sort((a, b) => {
                const ca = centersBySpId.get(String(a));
                const cb = centersBySpId.get(String(b));
                return String(ca?.name || '').localeCompare(String(cb?.name || ''));
            })
            .map(centerId => {
                const c = centersBySpId.get(String(centerId));
                const centerName = c?.name || c?.Title || `Center ${centerId}`;
                const items = storiesByCenterId[centerId] || [];

                const rowsHtml = items.map(s => {
                    return `
                        <tr style="border-bottom:1px solid #f3f3f3;">
                            <td style="padding:8px 10px; font-weight:700; font-size:12px;">${esc(s.title || '')}</td>
                            <td style="padding:8px 10px; font-size:12px; color:#555; line-height:1.5;">
                                ${s.date ? `<div style="margin-bottom:4px;">Date: ${esc(s.date)}</div>` : ''}
                                ${s.category ? `<div style="font-size:11px; color:#777;">Category: ${esc(s.category)}</div>` : ''}
                                ${s.description ? `<div style="margin-top:4px; font-style:italic;">${esc(s.description)}</div>` : ''}
                            </td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div style="margin-bottom: 22px;">
                        <div style="background-color: #f4f4f4; padding: 12px 14px; border-left: 6px solid #FCA200; font-weight: 800; font-size: 14px; color: #242424; margin-bottom: 8px;">
                            ${esc(centerName)} <span style="font-weight:600; color:#666;">(${items.length} stories)</span>
                        </div>
                        <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                                <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                                    <tr>
                                        <th style="padding:10px; text-align:left; width:220px;">Story Title</th>
                                        <th style="padding:10px; text-align:left;">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            })
            .join('');

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 1000px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📰 RSYC TERRITORIAL STORIES CATALOG</div>
                
                ${instructionBlock}

                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()} • ${val((stories || []).length)} total story item(s)</p>
                ${fieldGuide}
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📌 Center Stories (Impact & News)</div>
                <br>
                ${centerBlocks || '<div style="font-size:13px; color:#999;">No stories found.</div>'}
            </div>
        `;
    }

    generateEmailAuditPhotos(data) {
        const { centers, photos } = data;
        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
        const val = (v, fallback = '') => (v === null || v === undefined || v === '' ? fallback : v);
        const centersBySpId = new Map((centers || []).map(c => [String(c.sharePointId ?? c.id ?? c.Id), c]));
        const getCenterName = (c) => {
            if (!c) return '';
            return c.name || c.Title || '';
        };

        // define model fields for center photos
        const fieldRows = [
            ['Center','Center','Associated center SharePoint ID'],
            ['Status','Status','Draft or published status.'],
            ['Modified','Modified','Last modified timestamp.'],
            ['Modified By','ModifiedBy','User who last updated the record.'],
            ['Center Exterior Photo','CenterExteriorPhoto','Exterior building photo.'],
            ['Facility Features Photo','FacilityFeaturesPhoto','Inside facility photo showing features.'],
            ['Programs Photo','ProgramsPhoto','Photo representing programs offered.'],
            ['Nearby Centers Photo','NearbyCentersPhoto','Photo of nearby centers/community.'],
            ['Parents Section Photo','ParentsSectionPhoto','Image used in parents section.'],
            ['Youth Section Photo','YouthSectionPhoto','Image used in youth section.'],
            ['Get Involved Photo','GetInvolvedPhoto','Call-to-action photo for involvement.'],
            ['Footer Photo','FooterPhoto','Footer-area image.'],
            ['Footer Photo Focus','FooterPhotoFocus','Crop focus point for footer photo.'],
            ['URL Center Exterior Photo','URLCenterExteriorPhoto','(THQ use only) external image URL.'],
            ['URL Facility Features Photo','URLFacilityFeaturesPhoto','(THQ) external URL for features photo.'],
            ['URL Programs Photo','URLProgramsPhoto','(THQ) external URL for programs photo.'],
            ['URL Nearby Centers Photo','URLNearbyCentersPhoto','(THQ) external URL for nearby centers photo.'],
            ['URL Parents Section Photo','URLParentsSectionPhoto','(THQ) external URL for parents photo.'],
            ['URL Youth Section Photo','URLYouthSectionPhoto','(THQ) external URL for youth photo.'],
            ['URL Get Involved Photo','URLGetInvolvedPhoto','(THQ) external URL for get-involved photo.'],
            ['URL Footer Photo','URLFooterPhoto','(THQ) external URL for footer photo.']
        ];

        // build guide table markup
        const fieldGuide = `
            <div style="margin-bottom:22px; font-family:'Segoe UI',Tahoma,sans-serif;">
                <div style="background-color:#f4f4f4; padding:14px; border-left:6px solid #d93d3d; font-weight:bold; margin-bottom:14px; font-size:16px; color:#333; display:block; width:100%;">📘 Center Photos Fields (Purpose Guide)</div>
                <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px; text-align:left; width:200px;">Field</th>
                                <th style="padding:10px; text-align:left; width:200px;">Raw Name</th>
                                <th style="padding:10px; text-align:left;">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fieldRows.map(([f,v,p], idx) => `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx%2?'background:#fcfcfc;':''}">
                                    <td style="padding:8px 10px; font-family:Consolas,monospace; font-size:11px; color:#333;">${esc(f)}</td>
                                    <td style="padding:8px 10px; font-family:Consolas,monospace; font-size:11px; color:#333;">${esc(v)}</td>
                                    <td style="padding:8px 10px; color:#555; line-height:1.5;">${esc(p)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const photosByCenterId = {};
        (photos || []).forEach(p => {
            const cid = String(p.centerId ?? '');
            if (!cid) return;
            if (!photosByCenterId[cid]) photosByCenterId[cid] = [];
            photosByCenterId[cid].push(p);
        });

        // helper list of known photo types with normalized keys
        const photoTypes = [
            { label: 'Center Exterior Photo', key: 'urlExteriorPhoto' },
            { label: 'Facility Features Photo', key: 'urlFacilityFeaturesPhoto' },
            { label: 'Programs Photo', key: 'urlProgramsPhoto' },
            { label: 'Nearby Centers Photo', key: 'urlNearbyCentersPhoto' },
            { label: 'Parents Section Photo', key: 'urlParentsSectionPhoto' },
            { label: 'Youth Section Photo', key: 'urlYouthSectionPhoto' },
            { label: 'Get Involved Photo', key: 'urlGetInvolvedPhoto' },
            { label: 'Footer Photo', key: 'urlFooterPhoto' }
        ];

        const centerBlocks = Object.keys(photosByCenterId).map(cid => {
            const items = photosByCenterId[cid];
            const c = centersBySpId.get(cid) || {};
            const name = getCenterName(c);

            // build rows by enumerating each photo type within each record
            const rowsHtml = [];
            items.forEach(p => {
                // gather any missing types for this record (for footer row)
                const missingImgs = photoTypes
                    .filter(pt => !p[pt.key])
                    .map(pt => pt.label);

                photoTypes.forEach(pt => {
                    const url = p[pt.key] ? String(p[pt.key]) : '';
                    let imageHtml = '';
                    if (url) {
                        // display actual photo only, small thumbnail 100×100 so copy/paste is lightweight
                        imageHtml = `
                            <div style="margin:4px 0;">
                                <img src="${esc(url)}" width="100" height="100" style="object-fit:cover; display:block; border-radius:4px;" />
                            </div>
                        `;
                    } else {
                        imageHtml = `<div style="font-size:11px; color:#a00;">No Image Provided</div>`;
                    }

                    rowsHtml.push(`
                        <tr style="border-bottom:1px solid #f3f3f3;">
                            <td style="padding:8px 10px; font-weight:700; font-size:12px;">${esc(pt.label)}</td>
                            <td style="padding:8px 10px; font-size:12px; color:#555; line-height:1.5;">
                                ${imageHtml}
                            </td>
                        </tr>
                    `);
                });

                if (missingImgs.length) {
                    rowsHtml.push(`
                        <tr>
                            <td colspan="2" style="padding:6px 10px; font-size:11px; color:#a00;">Missing: ${esc(missingImgs.join(', '))}</td>
                        </tr>
                    `);
                }
            });

            return `
                <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <div style="background:#fff; border:1px solid #e9ecef; border-radius:10px; overflow:hidden;">
                        <div style="padding:12px 14px; background:#f8f9fa; border-bottom:1px solid #e9ecef;">
                            <div style="font-weight:800; color:#242424;">${esc(name)}</div>
                            <div style="font-size:12px; color:#666;">${items.length} photo item(s)</div>
                        </div>
                        <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
                            <thead style="background:#fff; border-bottom:1px solid #eee;">
                                <tr>
                                    <th style="padding:10px; text-align:left; width:240px; font-size:11px; color:#333;">Photo Type</th>
                                    <th style="padding:10px; text-align:left; font-size:11px; color:#333;">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml.join('')}
                            </tbody>
                        </table>
                    </div>
                    <br>
                </div>
            `;
        }).join('');

        const instructionBlock = `
            <div style="padding: 16px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; font-family: 'Segoe UI', sans-serif; margin: 8px;">
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #242424; margin: 0 0 8px 0;">RSYC Center Photos Instructions</div>
                    <p style="font-size: 14px; color: #333; line-height: 1.5; margin: 0 0 8px 0;">Please click in the area beneath each of the field labels to upload photos for each section in the form below. Changes are saved when you click out of the field.</p>
                    <div>
                        <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/SitePages/Manage-Youth-Center-Web-Profile.aspx#center-profile-manager" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">Learn more</a>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/center-locations" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; margin: 0 6px 12px 0; display: inline-block;">View Your Profile</a>
                    </div>
                    <div style="font-size: 13px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 8px 10px; margin: 0 0 16px 0; line-height: 1.5;">
                        💬 After you make changes to photos, please @mention our team in the comments on the right like this: @Shared THQ Web and Social Media, We have added new center photos ready to publish.
                    </div>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin:4px 0 0 0;">
                    <div>
                        <div style="font-size:15px; font-weight:600; color:#242424; margin:0 0 8px 0;">Check it out!</div>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/hickory" target="_blank" style="font-size:15px; color:#0078d4; text-decoration:underline;">View an example of a profile with localized photos.</a>
                    </div>
                </div>
            </div>
        `;

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 1000px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📸 RSYC CENTER PHOTOS CATALOG</div>
                ${instructionBlock}
                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()} • ${val((photos || []).length)} total photo item(s)</p>
                <br>
                ${centerBlocks || '<div style="font-size:13px; color:#999;">No photos found.</div>'}
            </div>
        `;
    }

    generateEmailAuditInfoPages(data) {
        const { centers, informationalPages } = data;

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
        const val = (v, fallback = '') => (v === null || v === undefined || v === '' ? fallback : v);
        
        const centersBySpId = new Map((centers || []).map(c => [String(c.sharePointId ?? c.id ?? c.Id), c]));

        const pagesByCenterId = {};
        (informationalPages || []).forEach(p => {
            const cid = String(p.centerId ?? '');
            if (!cid) return;
            if (!pagesByCenterId[cid]) pagesByCenterId[cid] = [];
            pagesByCenterId[cid].push(p);
        });

        const instructionBlock = `
            <div style="padding: 16px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; font-family: 'Segoe UI', sans-serif; margin: 8px; border-radius: 8px; border: 1px solid #eee;">
                <div>
                    <div style="font-size: 18px; font-weight: 600; color: #242424; margin-bottom: 8px;">RSYC Informational Pages Instructions</div>
                    <div style="font-size: 14px; color: #333; margin-bottom: 12px; line-height:1.5;">Use Informational Pages to support youth presentations, parent meetings, and important center-wide communication. These pages provide a link you can reference during live sessions and share with families afterward.</div>
                    <div style="margin-bottom: 12px;">
                        <a href="https://submitinfopage-rsyc.usscommunications.org/" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; font-weight: 600; margin: 0 6px 12px 0; display: inline-block;">Submit a New Informational Page</a>
                        <a href="https://infopagereview-rsyc.usscommunications.org/" target="_blank" style="font-size: 13px; color: #0078d4; text-decoration: underline; font-weight: 600; margin: 0 6px 12px 0; display: inline-block;">View and edit submitted info pages</a>
                    </div>
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Suggested Informational Page Topics:</div>
                    <div style="font-size: 14px; color:#444; line-height:1.6; margin-bottom:12px;">
                        • Digital Citizenship & Online Safety<br>
                        • Healthy Relationships & Respect<br>
                        • Bullying Prevention & Peer Leadership<br>
                        • Emotional Resilience & Mental Wellness<br>
                        • Academic Responsibility & Study Skills<br>
                        • Leadership & Personal Responsibility<br>
                        • Substance Use Awareness & Wise Choices<br>
                        • Safety Policies & Behavioral Expectations<br>
                        • Life Skills & Preparing for the Future<br>
                        • Faith Foundations: What We Teach & Why
                    </div>

                    <div style="font-size: 14px; background-color: #fff8e1; border-left: 4px solid #d13438; padding: 8px 10px; margin-bottom: 12px; font-weight: 600; line-height:1.4;">
                        IMPORTANT: Do not use Informational Pages for events, recurring programs, volunteer recruitment, fundraising appeals, or contact details. Use those dedicated sections instead.
                    </div>

                    <a href="https://submitinfopage-rsyc.usscommunications.org/" target="_blank" style="font-size: 14px; color: #0078d4; text-decoration: underline; font-weight:600;">Submit a New Informational Page</a>
                </div>
            </div>
        `;

        const fieldRows = [
            ['PageTitle', 'PageTitle', 'Public name of the information page.'],
            ['Category', 'Category', 'Categorization (Bullying Prevention, Safety, Faith, etc).'],
            ['Body', 'Body', 'Full narrative content and resources for the page.'],
            ['ExternalURL', 'ExternalURL', 'Link to related materials, forms, or external websites.'],
            ['URLThumbnailImage', 'URLThumbnailImage', 'Thumbnail icon or photo for the page listing.']
        ];

        const fieldGuide = `
            <div style="margin-bottom: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📘 Information Page Model Fields (Purpose Guide)</div>
                <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                            <tr>
                                <th style="padding:10px; text-align:left; width:200px;">Field</th>
                                <th style="padding:10px; text-align:left; width:200px;">Raw Name</th>
                                <th style="padding:10px; text-align:left;">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fieldRows.map(([f,v,p], idx) => `
                                <tr style="border-bottom:1px solid #f3f3f3; ${idx % 2 ? 'background:#fcfcfc;' : ''}">
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(f)}</td>
                                    <td style="padding:8px 10px; font-family:Consolas, monospace; font-size:11px; color:#333;">${esc(v)}</td>
                                    <td style="padding:8px 10px; color:#555; line-height:1.5;">${esc(p)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const centerBlocks = Object.keys(pagesByCenterId)
            .sort((a, b) => {
                const ca = centersBySpId.get(String(a));
                const cb = centersBySpId.get(String(b));
                return String(ca?.name || '').localeCompare(String(cb?.name || ''));
            })
            .map(centerId => {
                const c = centersBySpId.get(String(centerId));
                const centerName = c?.name || c?.Title || `Center ${centerId}`;
                const items = pagesByCenterId[centerId] || [];

                const rowsHtml = items.map(p => {
                    return `
                        <tr style="border-bottom:1px solid #f3f3f3;">
                            <td style="padding:8px 10px; font-weight:700; font-size:12px;">${esc(p.title || '')}</td>
                            <td style="padding:8px 10px; font-size:12px; color:#555; line-height:1.5;">
                                ${p.category ? `<div style="font-size:11px; font-weight:600; color:#444;">Category: ${esc(p.category)}</div>` : ''}
                                ${p.lastModified ? `<div style="font-size:10px; color:#888;">Modified: ${esc(p.lastModified)}</div>` : ''}
                                ${p.externalUrl ? `<div style="margin-top:4px;"><a href="${esc(p.externalUrl)}" style="color:#0078d4;">External Link</a></div>` : ''}
                            </td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div style="margin-bottom: 22px;">
                        <div style="background-color: #f4f4f4; padding: 12px 14px; border-left: 6px solid #FCA200; font-weight: 800; font-size: 14px; color: #242424; margin-bottom: 8px;">
                            ${esc(centerName)} <span style="font-weight:600; color:#666;">(${items.length} pages)</span>
                        </div>
                        <div style="border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff;">
                            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                                <thead style="background:#f8f9fa; border-bottom:1px solid #eee;">
                                    <tr>
                                        <th style="padding:10px; text-align:left; width:220px;">Page Title</th>
                                        <th style="padding:10px; text-align:left;">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            })
            .join('');

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 1000px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">💡 RSYC TERRITORIAL INFORMATIONAL PAGES CATALOG</div>
                
                ${instructionBlock}

                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()} • ${val((informationalPages || []).length)} total informational page(s)</p>
                ${fieldGuide}
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📌 Center Informational Pages (Guidance & Policy)</div>
                <br>
                ${centerBlocks || '<div style="font-size:13px; color:#999;">No informational pages found.</div>'}
            </div>
        `;
    }

    generateEmailAuditDivisionReport(data) {
        const { rows, division, centers, leaders, editorsCache } = data;

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

        const normalizeDivisionName = (raw) => {
            let d = String(raw || '')
                .replace(/\s*Division\b/ig, '')
                .replace(/[,&/\\-]+/g, ' ')
                .replace(/\bAND\b/ig, ' ')
                .trim()
                .toUpperCase();
            d = d.replace(/\s+/g, ' ');

            if (d === 'GEO' || d === 'GEORGIA') return 'GEO';
            if (d === 'AOK' || d === 'ARKANSAS OKLAHOMA') return 'AOK';
            if (d === 'ALM' || d === 'ALABAMA LOUISIANA MISSISSIPPI') return 'ALM';
            if (d === 'PMC' || d === 'POTOMAC') return 'PMC';
            if (d === 'TEX' || d === 'TEXAS') return 'TEX';
            if (d === 'NSC' || d === 'NORTH SOUTH CAROLINA') return 'NSC';

            return d;
        };

        const selectedDivision = normalizeDivisionName(division || '');

        const divisionDisplayName = (code) => {
            const c = normalizeDivisionName(code || '');
            if (c === 'GEO') return 'GEORGIA';
            if (c === 'AOK') return 'ARKANSAS AND OKLAHOMA';
            if (c === 'ALM') return 'ALABAMA, LOUISIANA AND MISSISSIPPI';
            if (c === 'PMC') return 'POTOMAC';
            if (c === 'TEX') return 'TEXAS';
            if (c === 'NSC') return 'NORTH AND SOUTH CAROLINA';
            return (code || '').toString().trim();
        };

        const displayDivision = divisionDisplayName(division || selectedDivision);

        const missingByCenter = rows
            .filter(r => normalizeDivisionName(r.division || 'Other') === selectedDivision)
            .filter(r => !r.isClosed)
            .map(r => {
                const missing = [];
                if (!r.hasHours) missing.push("Missing Custom Hours (Check Year-Round vs Summer)");
                if (!r.hasStaff && r.leaderCount === 0) missing.push("Missing Staff & Community Leaders (Photos/Bios)");
                if (r.schedCount === 0) missing.push("Missing Program Schedules (Recurring Weekly, Camps, Afterschool Time Breakdown)");
                if (!r.hasDonationUrl || !r.hasSignUpUrl || !r.hasVolunteer) missing.push("Missing Engagement Links (Classy Studio, Parent Portal, or Volunteer/Recruitment)");
                if (!r.hasAbout) missing.push("Missing 'About This Center' (Local Narrative)");
                if (!r.hasExplainerVideo) missing.push("Missing Explainer Video (Using Territorial Placeholder)");
                if (r.photoCount === 0) missing.push("Missing Mandatory Site Photos (Exterior/Facility)");
                if (!r.hasFooterPhoto) missing.push("Missing Local Footer Photo (Building/Staff/Community)");
                if (!r.hasFooterScripture) missing.push("Missing Footer Scripture Reference");
                return { id: r.id, name: r.name, liveUrl: r.liveUrl, missing };
            })
            .filter(c => c.missing.length > 0);

        const actionList = missingByCenter.length
            ? missingByCenter.map(c => `
                <br>
                <div style="margin-bottom: 18px; display:block;">
                    <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:block;">
                        📍 <span class="center-audit-link" data-center-id="${c.id}" style="cursor:pointer; color:#004a99; text-decoration:none;" title="Click to switch dropdown to this center">${esc(c.name)}</span> 
                        <a href="${esc(c.liveUrl)}" target="_blank" style="text-decoration:none; margin-left:6px;">🔗</a>
                    </div>
                    <div style="font-size:12px; color:#555; line-height:1.6; margin-left:12px;">
                        ${c.missing.map(m => `• ${esc(m)}`).join('<br>')}
                    </div>
                </div>
            `).join('')
            : '<p style="font-size: 13px; color: #28a745; font-weight: bold;">🎉 No missing core items found for open centers in this division.</p>';

        const howTo = `
            <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 22px; margin: 20px 0 22px 0; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <div style="font-weight:700; font-size:16px; color:#242424; margin:0 0 10px 0;">How to complete your profile</div>
                <div style="font-size: 13px; color: #444; line-height: 1.6; margin: 0;">
                    Go to <a href="https://centerprofile.redshieldyouth.org" style="color:#0078d4;">centerprofile.redshieldyouth.org</a> to edit your center's About, Contact, and mandatory links. Use the @mention feature <b>@Shared THQ Web and Social Media</b> in the sidebar comments to notify the team when your updates are ready to publish.
                </div>
            </div>
        `;

        const divisionCenters = (centers || []).filter(c => {
            const div = (c.division || c.field_6 || 'Other');
            return normalizeDivisionName(div) === selectedDivision;
        });
        const divisionCenterSpIds = new Set(divisionCenters.map(c => String(c.sharePointId ?? c.SharePointId ?? '')).filter(Boolean));
        const divisionLeaders = (leaders || []).filter(l => {
            // treat leaders without any centerIds as global/unassigned and include them
            if (!l.centerIds || !l.centerIds.length) return true;
            // normalize to string for comparison (centers may store IDs as numbers)
            return (l.centerIds || []).map(String).some(id => divisionCenterSpIds.has(String(id)));
        });
        const divisionStaffTable = this.generateEmailAuditStaffTable({
            centers: divisionCenters,
            leaders: divisionLeaders
        });

        const divisionEditorsTable = this.generateEmailAuditEditorsTable({
            selectedDivision: selectedDivision,
            editorsCache: editorsCache,
            leaders: leaders
        });

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">📂 RSYC DIVISIONAL AUDIT REPORT: ${esc(displayDivision)}</div>
                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 18px; display: block;">Generated on ${new Date().toLocaleDateString()}</p>
                ${howTo}
                <br>
                ${divisionEditorsTable}
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">📌 Division Action List</div>
                ${actionList}
                <br>
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 14px; font-size: 16px; color: #333; display: block; width: 100%;">👥 Divisional Staff &amp; Community Leaders</div>
                ${divisionStaffTable}
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
     * Build complete HTML page with Open Graph meta tags for social sharing
     */
    buildFullPageWithOGTags() {
        if (!this.generatedHTML || !this.currentCenter) {
            alert('No HTML generated yet!');
            return '';
        }

        const center = this.currentCenter;
        const pageTitle = `${center.Title} - Red Shield Youth Centers`;
        
        // Build dynamic description with city and state
        const city = center.city || 'Your Community';
        const state = center.state || '';
        const cityState = state ? `${city}, ${state}` : city;
        const pageDescription = `A safe, welcoming space in ${cityState} offering youth programs, activities, mentoring, and community support for kids and teens.`;
        
        const ogImageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg';
        
        // Use the center's website URL if available, otherwise use the websiteURL field
        const pageUrl = center.websiteURL || `https://www.redshieldyouth.org/`;

        // Truncate description to 160 chars for OG tags (though our description should already be short)
        const shortDescription = pageDescription.substring(0, 160) + (pageDescription.length > 160 ? '...' : '');

        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHTML(pageTitle)}</title>
    
    <!-- Open Graph Meta Tags for Social Sharing -->
    <meta property="og:title" content="${this.escapeHTML(pageTitle)}">
    <meta property="og:description" content="${this.escapeHTML(shortDescription)}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:url" content="${this.escapeHTML(pageUrl)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="The Salvation Army Red Shield Youth Centers">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escapeHTML(pageTitle)}">
    <meta name="twitter:description" content="${this.escapeHTML(shortDescription)}">
    <meta name="twitter:image" content="${ogImageUrl}">
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${this.escapeHTML(shortDescription)}">
    <meta name="theme-color" content="#20B3A8">
    
    <style>
        :root {
            --rsyc-teal: #20B3A8;
            --rsyc-navy: #2F4857;
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
        }

        .rsyc-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        img { max-width: 100%; height: auto; display: block; }
        a { color: #20B3A8; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="rsyc-container">
        ${this.generatedHTML}
    </div>
</body>
</html>`;

        return fullHTML;
    }

    /**
     * Download complete page with Open Graph tags
     */
    downloadFullPageWithOG() {
        const fullHTML = this.buildFullPageWithOGTags();
        if (!fullHTML) return;

        const center = this.currentCenter;
        const filename = `${center.Title.replace(/[^a-z0-9]/gi, '-')}-full-profile.html`;
        const blob = new Blob([fullHTML], { type: 'text/html' });
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
     * Escape HTML special characters for use in meta tags
     */
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update Open Graph meta tags dynamically for in-page updates
     * Note: These won't affect social media previews (FB/LinkedIn fetchers don't run JS),
     * but are useful for client-side page updates and SPA navigation
     */
    setOGTags(ogData) {
        const { title, description, image, url } = ogData;

        // Update OG meta tags
        const ogTitle = document.getElementById('og-title');
        const ogDescription = document.getElementById('og-description');
        const ogImage = document.getElementById('og-image');
        const ogImageWidth = document.getElementById('og-image-width');
        const ogImageHeight = document.getElementById('og-image-height');
        const ogUrl = document.getElementById('og-url');

        if (ogTitle && title) ogTitle.setAttribute('content', title);
        if (ogDescription && description) ogDescription.setAttribute('content', description);
        if (ogImage && image) {
            ogImage.setAttribute('content', image);
            // Set standard OG image dimensions (1200x630 is optimal for most platforms)
            if (ogImageWidth) ogImageWidth.setAttribute('content', '1200');
            if (ogImageHeight) ogImageHeight.setAttribute('content', '630');
        }
        if (ogUrl && url) ogUrl.setAttribute('content', url);

        // Update Twitter Card meta tags
        const twitterTitle = document.getElementById('twitter-title');
        const twitterDescription = document.getElementById('twitter-description');
        const twitterImage = document.getElementById('twitter-image');

        if (twitterTitle && title) twitterTitle.setAttribute('content', title);
        if (twitterDescription && description) twitterDescription.setAttribute('content', description);
        if (twitterImage && image) twitterImage.setAttribute('content', image);

        // Also update the page title tag
        if (title) document.title = title;
    }

    /**
     * Initialize and overwrite OG/Twitter tags on page load
     * Especially important when this page is injected into a CMS
     * This method generates all required OG tag values from a center and updates the meta tags
     */
    updateOGTagsOnPage(center) {
        if (!center) return;

        // Build OG tag values from center data
        const pageTitle = `${center.Title} - Red Shield Youth Centers`;
        const city = center.city || 'Your Community';
        const state = center.state || '';
        const cityState = state ? `${city}, ${state}` : city;
        const pageDescription = `A safe, welcoming space in ${cityState} offering youth programs, activities, mentoring, and community support for kids and teens.`;
        const ogImageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/f432e3f1-79a6-4dfe-82c6-5c93c55e6b09_Charlotte+NC-04489.jpg';
        const pageUrl = center.websiteURL || 'https://www.redshieldyouth.org/';

        // Update all OG and Twitter meta tags in document head
        // These will overwrite parent page's meta tags
        const metaTags = {
            'og-title': pageTitle,
            'og-description': pageDescription,
            'og-image': ogImageUrl,
            'og-url': pageUrl,
            'twitter-title': pageTitle,
            'twitter-description': pageDescription,
            'twitter-image': ogImageUrl
        };

        Object.entries(metaTags).forEach(([id, value]) => {
            let element = document.getElementById(id);
            
            // If element doesn't exist (parent page didn't include it), create it
            if (!element) {
                const isTwitter = id.startsWith('twitter-');
                const property = isTwitter ? 'name' : 'property';
                const propertyValue = isTwitter ? id : `og:${id.replace('og-', '')}`;
                
                element = document.createElement('meta');
                element.setAttribute(property, propertyValue);
                element.id = id;
                document.head.appendChild(element);
            }
            
            element.setAttribute('content', value);
        });

        // Update page title
        document.title = pageTitle;

        // Store current center for future reference
        this.currentCenter = center;
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
        let content = document.getElementById('cssModalContent');
        const saveBtn = document.getElementById('saveCSSContent');
        const historyDiv = document.getElementById('cssUpdateHistory');

        // Restore textarea if it was replaced by HTML viewer
        const modalBody = content ? content.parentElement : null;
        if (!content || content.tagName !== 'TEXTAREA') {
            // Recreate the original modal structure
            if (modalBody) {
                modalBody.innerHTML = `
                    <button id="copyCSSContent" style="position:absolute; top:10px; right:10px; background:#28a745; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; z-index:1;">Copy All</button>
                    <button id="saveCSSContent" style="position:absolute; top:10px; right:110px; background:#007bff; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; z-index:1; display:none;">💾 Save CSS</button>
                    <textarea id="cssModalContent" style="width:100%; background:#f4f4f4; padding:15px; border:1px solid #ddd; border-radius:4px; overflow:auto; min-height:500px; max-height:600px; font-family:monospace; font-size:13px; line-height:1.5; resize:vertical;" spellcheck="false"></textarea>
                `;
                content = document.getElementById('cssModalContent');
            }
        }

        if (type === 'custom') {
            title.textContent = 'Edit Custom CSS - Master File';
            description.innerHTML = '<strong>📋 Copy this to CMS:</strong> This is the master CSS file for all RSYC profiles. When you save, the version and date will update automatically. Copy the entire file to your CMS after making changes.';
            
            if (content) {
                // Extract Symphony CSS link and remove from editable content
                const symphonyLinkPattern = /<!-- Symphony Main CSS -->[\s\S]*?<link href="\/\/static\.salvationarmy\.org[^>]+>/;
                const symphonyMatch = this.customStyles.match(symphonyLinkPattern);
                
                let editableCSS = this.customStyles;
                if (symphonyMatch) {
                    // Remove Symphony link from editable content
                    editableCSS = this.customStyles.replace(symphonyMatch[0], '').trim();
                    
                    // Show Symphony link in separate info box
                    const symphonyLinkDiv = document.getElementById('symphonyLinkInfo');
                    const symphonyLinkCode = document.getElementById('symphonyLinkCode');
                    if (symphonyLinkDiv && symphonyLinkCode) {
                        symphonyLinkCode.textContent = symphonyMatch[0];
                        symphonyLinkDiv.style.display = 'block';
                    }
                } else {
                    // Hide Symphony link div if not found
                    const symphonyLinkDiv = document.getElementById('symphonyLinkInfo');
                    if (symphonyLinkDiv) symphonyLinkDiv.style.display = 'none';
                }
                
                content.value = editableCSS || '/* No custom styles loaded */';
                content.readOnly = false;
                content.style.background = '#fff';
            }
            
            // Show save button
            const saveBtnRefresh = document.getElementById('saveCSSContent');
            if (saveBtnRefresh) {
                saveBtnRefresh.style.display = 'block';
                saveBtnRefresh.onclick = () => this.saveCustomCSS();
            }
            
            // Show update history
            if (historyDiv) {
                this.displayCSSHistory();
            }
        }

        modal.style.display = 'block';
    }

    showDataStructureModal() {
        const modal = document.getElementById('cssModal');
        const title = document.getElementById('cssModalTitle');
        const description = document.getElementById('cssModalDescription');
        const content = document.getElementById('cssModalContent');

        // Determine mode: Template view (no center) or Data view (center selected)
        const hasCenter = !!this.currentCenter;
        
        if (hasCenter) {
            title.textContent = 'Data Structure & Output Viewer';
            description.innerHTML = `View the data values for <strong>${this.currentCenter.name}</strong> or see the generated HTML output for each section.`;
        } else {
            title.textContent = 'Template Code Viewer';
            description.innerHTML = `View the HTML template code structure with placeholders. <em>Select a center to view actual data values.</em>`;
        }
        
        // Create interactive viewer
        const viewerHTML = this.createTemplateViewer(hasCenter);
        content.value = ''; // Clear textarea, we'll replace it with HTML
        
        // Replace textarea with custom HTML viewer
        const modalBody = content.parentElement;
        modalBody.innerHTML = viewerHTML;
        
        // Attach event listeners for section selection
        this.attachTemplateViewerListeners(hasCenter);

        modal.style.display = 'block';
    }

    /**
     * Build and show a Data Audit modal listing which centers have custom data
     * in key sections and aggregate counts. Rows are clickable to select a
     * center in the dropdown and jump to the live preview.
     */
    /**
     * Generate URL slug from center name
     */
    getCenterSlug(name) {
        if (!name) return '';
        let slugName = name
            .replace(/\s*\(?CLOSED\)?\s*/gi, '') // Strip " (CLOSED)" or " CLOSED"
            .replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '')
            .replace(/^rsyc\s+/i, '');
        
        return slugName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with dashes
            .replace(/-+/g, '-')            // Collapse multiple dashes to single dash
            .replace(/[^\w-]/g, '');        // Remove special characters except dashes (no need to escape - if at end)
    }

    async showDataAuditModal() {
        // Remove existing modal if present
        const existing = document.getElementById('dataAuditModal');
        if (existing) existing.remove();

        const centers = this.dataLoader.cache.centers || [];
        const schedules = this.dataLoader.cache.schedules || [];
        const leaders = this.dataLoader.cache.leaders || [];
        const photos = this.dataLoader.cache.photos || [];
        const hours = this.dataLoader.cache.hours || [];
        const facilities = this.dataLoader.cache.facilities || [];
        const featuredPrograms = this.dataLoader.cache.featuredPrograms || [];
        const events = this.dataLoader.cache.events || [];
        const stories = this.dataLoader.cache.stories || [];
        const informationalPages = this.dataLoader.cache.informationalPages || [];

        // Helper: normalize hour strings for robust comparison
        const normalizeHourValue = (v) => {
            if (v === null || v === undefined) return '';
            let s = String(v).trim();
            if (!s) return '';
            if (/^closed$/i.test(s)) return '';
            s = s.replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');
            s = s.replace(/\s*-\s*/g, ' - ');
            s = s.replace(/\s+/g, ' ');
            s = s.replace(/\b(am|pm)\b/ig, (m) => m.toUpperCase());
            s = s.replace(/:00\b/g, ''); // Normalize 2:00 PM to 2 PM for better matching
            return s;
        };

        const isDefaultHoursRecord = (h) => {
            if (!h) return false;
            try {
                const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                // Normalizer removes :00, so we use normalized strings here
                const defReg = { monday:'2 PM - 7:30 PM', tuesday:'2 PM - 7:30 PM', wednesday:'2 PM - 7:30 PM', thursday:'2 PM - 7:30 PM', friday:'2 PM - 7:30 PM', saturday:'', sunday:'' };
                const defSum = { monday:'7:30 AM - 5:30 PM', tuesday:'7:30 AM - 5:30 PM', wednesday:'7:30 AM - 5:30 PM', thursday:'7:30 AM - 5:30 PM', friday:'7:30 AM - 5:30 PM', saturday:'', sunday:'' };
                for (const d of days) if (normalizeHourValue(h.regularHours?.[d]) !== defReg[d]) return false;
                for (const d of days) if (normalizeHourValue(h.summerHours?.[d]) !== defSum[d]) return false;
                return true;
            } catch (e) { return false; }
        };

        // Compute per-center indicators
        const rows = centers.map(c => {
            const spId = c.sharePointId;
            const name = c.name || c.Title || '(unnamed)';
            // Detect closure from title/name or explicit property
            const isClosed = !!c.isClosed || 
                           String(c.name || '').toUpperCase().includes('CLOSED') || 
                           String(c.Title || '').toUpperCase().includes('CLOSED');
            
            const centerSlug = this.getCenterSlug(name);
            const liveUrl = `https://southernusa.salvationarmy.org/redshieldyouth/${centerSlug}`;

            // Check if center has custom about text (not the default boilerplate)
            const defaultAbout = "Give your child the chance to explore, create, and grow while having a blast!";
            const hasAbout = !!(c.aboutText && 
                              String(c.aboutText).trim() && 
                              !String(c.aboutText).includes(defaultAbout));

            const hasVolunteer = !!(c.volunteerText && String(c.volunteerText).trim());
            const centerSchedules = schedules.filter(s => s.centerId == spId);
            const schedCount = centerSchedules.length;
            const leaderCount = leaders.filter(l => {
                if (!l.centerIds || !l.centerIds.length) return false;
                return (l.centerIds || []).map(String).includes(String(spId));
            }).length;
            // indicate staff if either schedules list contacts or leaders JSON includes this center
            const hasStaff = centerSchedules.some(s => (s.contacts && s.contacts.length > 0) || (s.ContactInfo && s.ContactInfo.length > 0))
                            || leaderCount > 0;
            const photosForCenter = photos.filter(p => p.centerId == spId);
            const urlFields = ['urlExteriorPhoto','urlFacilityFeaturesPhoto','urlProgramsPhoto','urlNearbyCentersPhoto','urlParentsSectionPhoto','urlYouthSectionPhoto','urlGetInvolvedPhoto','urlFooterPhoto'];
            const urlSet = new Set();
            photosForCenter.forEach(p => urlFields.forEach(f => {
                if (p && p[f] && String(p[f]).trim()) urlSet.add(String(p[f]).trim());
            }));
            const photoCount = urlSet.size;
            const hasFooterPhoto = photosForCenter.some(p => p && p.urlFooterPhoto && String(p.urlFooterPhoto).trim());
            const hasFooterScripture = !!(c.scripture && String(c.scripture).trim());
            const hasSignUpUrl = !!(c.signUpURL && String(c.signUpURL).trim());
            const hasDonationUrl = !!(c.donationURL && String(c.donationURL).trim());
            // Check if center has a custom video (not the default territory promo)
            const hasExplainerVideo = !!(c.explainerVideoEmbedCode && 
                                       String(c.explainerVideoEmbedCode).trim() && 
                                       !String(c.explainerVideoEmbedCode).includes('g52shymyyo'));
            
            const hoursForCenter = hours.find(h => h.centerId == spId);
            let hasHours = !!hoursForCenter && !isDefaultHoursRecord(hoursForCenter);
            const facilityCount = (c.facilityFeatures || []).length;
            const programCount = (c.featuredPrograms || []).length;
            
            // count schedules flagged as events (ShowinEventsSection true) rather than using the deprecated
            // `events` feed. This aligns audit counts with the program schedules source of truth.
            const eventCount = centerSchedules.filter(s => s.ShowinEventsSection === true).length;
            const infoPageCount = informationalPages.filter(p => p.centerId == spId).length;

            return {
                id: c.id || c.Id,
                sharePointId: spId,
                name: name,
                liveUrl: liveUrl,
                division: (c.division || c.field_6 || 'Unknown').replace(/\s*Division/i, ''),
                areaCommand: c.areaCommand || c.field_17 || 'None',
                divisionCode: c.divisionCode || '',
                isClosed: isClosed,
                hasAbout, hasVolunteer, hasStaff, schedCount, leaderCount, photoCount, hasHours, facilityCount, programCount,
                eventCount, infoPageCount,
                hasFooterPhoto, hasFooterScripture,
                hasSignUpUrl, hasDonationUrl, hasExplainerVideo
            };
        });

        // Association Audit
        const facilityUsage = {};
        const programUsage = {};
        
        // Initialize ALL known items to 0 usage
        facilities.forEach(f => { if (f.name) facilityUsage[f.name] = 0; });
        featuredPrograms.forEach(p => { if (p.name) programUsage[p.name] = 0; });

        // Count usages from centers
        centers.forEach(c => {
            (c.facilityFeatures || []).forEach(f => { facilityUsage[f.name] = (facilityUsage[f.name] || 0) + 1; });
            (c.featuredPrograms || []).forEach(p => { programUsage[p.name] = (programUsage[p.name] || 0) + 1; });
        });
        
        const lowFacilities = Object.entries(facilityUsage).filter(([name, count]) => count < 30).sort((a,b) => a[1]-b[1]);
        const lowPrograms = Object.entries(programUsage).filter(([name, count]) => count < 30).sort((a,b) => a[1]-b[1]);

        // Recently Created Audit (last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const parseSpDate = (d) => d ? new Date(d) : null;
        const recentFacs = facilities.filter(f => parseSpDate(f.created) > ninetyDaysAgo).sort((a,b) => parseSpDate(b.created) - parseSpDate(a.created));
        const recentProgs = featuredPrograms.filter(p => parseSpDate(p.created) > ninetyDaysAgo).sort((a,b) => parseSpDate(b.created) - parseSpDate(a.created));

        // Missing Data Lists (for visual UI cards)
        const missingAbout = rows.filter(r => !r.hasAbout && !r.isClosed).map(r => r.name);
        const missingPhotos = rows.filter(r => r.photoCount === 0 && !r.isClosed).map(r => r.name);

        const aggregates = {
            centers: centers.length,
            closed: rows.filter(r => r.isClosed).length,
            about: rows.filter(r => r.hasAbout).length,
            schedules_centers: rows.filter(r => r.schedCount > 0).length,
            schedules_items: rows.reduce((s, r) => s + (r.schedCount || 0), 0),
            leaders_centers: rows.filter(r => r.leaderCount > 0).length,
            leaders_items: rows.reduce((s, r) => s + (r.leaderCount || 0), 0),
            photos_centers: rows.filter(r => r.photoCount > 0).length,
            photos_items: rows.reduce((s, r) => s + (r.photoCount || 0), 0),
            hours: rows.filter(r => r.hasHours).length,
            events_centers: rows.filter(r => r.eventCount > 0).length,
            events_items: rows.reduce((s, r) => s + (r.eventCount || 0), 0),
            informationalPages_centers: Array.from(new Set((informationalPages || []).map(p => p.centerId))).length,
            informationalPages_items: (informationalPages || []).length
        };

        const modal = document.createElement('div');
        modal.id = 'dataAuditModal';
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:12500; overflow:auto; padding:30px 10px;';

        const modalInner = document.createElement('div');
        modalInner.style.cssText = 'background:white; margin:0 auto; padding:24px; max-width:1250px; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.3); font-family:sans-serif;';

        const esc = (v) => v ? String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

        const shortCenterName = (name) => {
            const n = String(name || '').trim();
            return n
                .replace(/^Red Shield Youth Centers? of\s+/i, '')
                .replace(/^Red Shield Youth Center of\s+/i, '')
                .trim();
        };

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'border-bottom:1px solid #eee; padding-bottom:16px; margin-bottom:24px; position:relative;';

        const headerTitle = document.createElement('div');
        headerTitle.innerHTML = `
            <h2 style="margin:0; color:#333;">RSYC Profile Audit</h2>
            <p style="margin:4px 0 0 0; color:#666; font-size:14px;">Audit date: ${new Date().toLocaleDateString()} • ${centers.length} Centers (${aggregates.closed} Closed)</p>
        `;
        header.appendChild(headerTitle);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;';

        const divisionRow = document.createElement('div');
        divisionRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; align-items:center;';

        const divisionSelect = document.createElement('select');
        divisionSelect.className = 'form-select form-select-sm';
        divisionSelect.style.minWidth = '220px';
        const normalizeDivisionName = (raw) => {
            let d = String(raw || '')
                .replace(/\s*Division\b/ig, '')
                .replace(/[,&/\\-]+/g, ' ')
                .replace(/\bAND\b/ig, ' ')
                .trim()
                .toUpperCase();
            d = d.replace(/\s+/g, ' ');

            if (d === 'GEO' || d === 'GEORGIA') return 'GEO';
            if (d === 'AOK' || d === 'ARKANSAS OKLAHOMA') return 'AOK';
            if (d === 'ALM' || d === 'ALABAMA LOUISIANA MISSISSIPPI') return 'ALM';
            if (d === 'PMC' || d === 'POTOMAC') return 'PMC';
            if (d === 'TEX' || d === 'TEXAS') return 'TEX';
            if (d === 'NSC' || d === 'NORTH SOUTH CAROLINA') return 'NSC';

            return d;
        };

        const divisionNames = Array.from(new Set(rows
            .map(r => normalizeDivisionName(r.division || 'Other'))
            .filter(Boolean)))
            .sort();
        divisionSelect.innerHTML = divisionNames
            .map(d => `<option value="${esc(d)}">${esc(d)}</option>`)
            .join('');

        const copyOverallBtn = document.createElement('button');
        copyOverallBtn.className = 'btn btn-success btn-sm';
        copyOverallBtn.innerHTML = '<i class="bi bi-clipboard-check"></i> Copy Overall Status';
        copyOverallBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditOverallStatus({
                rows: rows,
                lowFacilities, lowPrograms, recentFacs, recentProgs,
                centersCount: centers.length,
                closedCount: aggregates.closed,
                aggregates
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyOverallBtn.textContent = '✓ Copied!';
                setTimeout(() => copyOverallBtn.innerHTML = '<i class="bi bi-clipboard-check"></i> Copy Overall Status', 2000);
            });
        };

        const copyFiltersBtn = document.createElement('button');
        copyFiltersBtn.className = 'btn btn-success btn-sm';
        copyFiltersBtn.innerHTML = '<i class="bi bi-funnel"></i> Copy Filters & Associations';
        copyFiltersBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditFiltersAndAssociations({
                lowFacilities, lowPrograms, recentFacs, recentProgs
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyFiltersBtn.textContent = '✓ Copied!';
                setTimeout(() => copyFiltersBtn.innerHTML = '<i class="bi bi-funnel"></i> Copy Filters & Associations', 2000);
            });
        };

        const copyMasterCommandCenterBtn = document.createElement('button');
        copyMasterCommandCenterBtn.className = 'btn btn-success btn-sm';
        copyMasterCommandCenterBtn.innerHTML = '<i class="bi bi-grid-1x2"></i> Copy Master Control Center';
        copyMasterCommandCenterBtn.onclick = () => {
            const reportHtml = this.generateEmailMasterCommandCenter();
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyMasterCommandCenterBtn.textContent = '✓ Copied!';
                setTimeout(() => copyMasterCommandCenterBtn.innerHTML = '<i class="bi bi-grid-1x2"></i> Copy Master Control Center', 2000);
            });
        };

        const copyDataModelsBtn = document.createElement('button');
        copyDataModelsBtn.className = 'btn btn-success btn-sm';
        copyDataModelsBtn.innerHTML = '<i class="bi bi-diagram-2"></i> Copy Data Models';
        copyDataModelsBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditDataModels();
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyDataModelsBtn.textContent = '✓ Copied!';
                setTimeout(() => copyDataModelsBtn.innerHTML = '<i class="bi bi-diagram-2"></i> Copy Data Models', 2000);
            });
        };

        const copySchedulesBtn = document.createElement('button');
        copySchedulesBtn.className = 'btn btn-success btn-sm';
        copySchedulesBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Copy Program Schedules & Events';
        copySchedulesBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditProgramSchedules({
                centers,
                schedules
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copySchedulesBtn.textContent = '✓ Copied!';
                setTimeout(() => copySchedulesBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Copy Program Schedules', 2000);
            });
        };

        const copyEventsBtn = document.createElement('button');
        copyEventsBtn.className = 'btn btn-success btn-sm';
        copyEventsBtn.innerHTML = '<i class="bi bi-megaphone"></i> Copy Program Schedules & Events';
        copyEventsBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditEvents({
                centers,
                schedules
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyEventsBtn.textContent = '✓ Copied!';
                setTimeout(() => copyEventsBtn.innerHTML = '<i class="bi bi-megaphone"></i> Copy Program Schedules & Events', 2000);
            });
        };

        const copyStoriesBtn = document.createElement('button');
        copyStoriesBtn.className = 'btn btn-success btn-sm';
        copyStoriesBtn.innerHTML = '<i class="bi bi-chat-left-quote"></i> Copy Stories';
        copyStoriesBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditStories({
                centers,
                stories
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyStoriesBtn.textContent = '✓ Copied!';
                setTimeout(() => copyStoriesBtn.innerHTML = '<i class="bi bi-chat-left-quote"></i> Copy Stories', 2000);
            });
        };

        const copyInfoPagesBtn = document.createElement('button');
        copyInfoPagesBtn.className = 'btn btn-success btn-sm';
        copyInfoPagesBtn.innerHTML = '<i class="bi bi-info-circle"></i> Copy Info Pages';
        copyInfoPagesBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditInfoPages({
                centers,
                informationalPages
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyInfoPagesBtn.textContent = '✓ Copied!';
                setTimeout(() => copyInfoPagesBtn.innerHTML = '<i class="bi bi-info-circle"></i> Copy Info Pages', 2000);
            });
        };

        const copyPhotosBtn = document.createElement('button');
        copyPhotosBtn.className = 'btn btn-success btn-sm';
        copyPhotosBtn.innerHTML = '<i class="bi bi-camera"></i> Copy Center Photos';
        copyPhotosBtn.onclick = () => {
            // try to reuse the preview's HTML if already rendered so copy output matches exactly
            let reportHtml;
            const previewEl = document.getElementById('rsyc-photos-preview');
            if (previewEl) {
                reportHtml = previewEl.innerHTML;
            } else {
                reportHtml = this.generateEmailAuditPhotos({
                    centers,
                    photos
                });
            }
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyPhotosBtn.textContent = '✓ Copied!';
                setTimeout(() => copyPhotosBtn.innerHTML = '<i class="bi bi-camera"></i> Copy Center Photos', 2000);
            });
        };

        const copyStaffTableBtn = document.createElement('button');
        copyStaffTableBtn.className = 'btn btn-success btn-sm';
        copyStaffTableBtn.innerHTML = '<i class="bi bi-people"></i> Copy Staff Table';
        copyStaffTableBtn.onclick = () => {
            const reportHtml = this.generateEmailAuditStaffTable({
                centers,
                leaders
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyStaffTableBtn.textContent = '✓ Copied!';
                setTimeout(() => copyStaffTableBtn.innerHTML = '<i class="bi bi-people"></i> Copy Staff Table', 2000);
            });
        };

        const copyDivisionBtn = document.createElement('button');
        copyDivisionBtn.className = 'btn btn-primary btn-sm';
        copyDivisionBtn.innerHTML = '<i class="bi bi-diagram-3"></i> Copy Divisional Report';
        copyDivisionBtn.onclick = async () => {
            const division = normalizeDivisionName(divisionSelect.value || '');
            if (!division) return;

            const editorsCache = await this.ensureEditorsCacheLoaded();
            const reportHtml = this.generateEmailAuditDivisionReport({
                rows: rows,
                division,
                centers,
                leaders,
                editorsCache
            });
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyDivisionBtn.textContent = '✓ Copied!';
                setTimeout(() => copyDivisionBtn.innerHTML = '<i class="bi bi-diagram-3"></i> Copy Divisional Report', 2000);
            });
        };

        const copyEditorsBtn = document.createElement('button');
        copyEditorsBtn.className = 'btn btn-success btn-sm';
        copyEditorsBtn.innerHTML = '<i class="bi bi-person-badge"></i> Copy Editors';
        copyEditorsBtn.onclick = async () => {
            try {
                const editorsCache = await this.ensureEditorsCacheLoaded();
                const reportHtml = this.generateEmailAuditEditorsTable({ editorsCache, leaders });
                const blob = new Blob([reportHtml], { type: 'text/html' });
                const data = [new ClipboardItem({ 'text/html': blob })];
                await navigator.clipboard.write(data);
                this.showToast('Editors table copied to clipboard! Paste into Outlook.', 'success');
            } catch (e) {
                console.warn(e);
                this.showToast('Failed to copy editors table. See console.', 'danger');
            }
        };

        const copyDocsBtn = document.createElement('button');
        copyDocsBtn.className = 'btn btn-success btn-sm';
        copyDocsBtn.innerHTML = '<i class="bi bi-journal-text"></i> Copy Documentation';
        copyDocsBtn.onclick = () => {
            const reportHtml = this.templateEngine.getSectionReferenceTable();
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            navigator.clipboard.write(data).then(() => {
                copyDocsBtn.textContent = '✓ Copied!';
                setTimeout(() => copyDocsBtn.innerHTML = '<i class="bi bi-journal-text"></i> Copy Documentation', 2000);
            });
        };

        const copyAllBtn = document.createElement('button');
        copyAllBtn.className = 'btn btn-primary btn-sm';
        copyAllBtn.innerHTML = '<i class="bi bi-envelope"></i> Copy All';
        copyAllBtn.onclick = async () => {
            try {
                const editorsCache = await this.ensureEditorsCacheLoaded();

                const overallHtml = this.generateEmailAuditOverallStatus({
                    rows: rows,
                    lowFacilities, lowPrograms, recentFacs, recentProgs,
                    centersCount: centers.length,
                    closedCount: aggregates.closed,
                    aggregates
                });

                const masterHtml = this.generateEmailMasterCommandCenter();

                const dataModelsHtml = this.generateEmailAuditDataModels();

                const filtersHtml = this.generateEmailAuditFiltersAndAssociations({
                    lowFacilities, lowPrograms, recentFacs, recentProgs
                });

                const schedulesHtml = this.generateEmailAuditProgramSchedules({
                    centers,
                    schedules
                });

                const eventsHtml = this.generateEmailAuditEvents({
                    centers,
                    schedules
                });

                const photosHtml = this.generateEmailAuditPhotos({
                    centers,
                    photos
                });

                const storiesHtml = this.generateEmailAuditStories({
                    centers,
                    stories
                });

                const infoPagesHtml = this.generateEmailAuditInfoPages({
                    centers,
                    informationalPages
                });

                const allDivisions = Array.from(new Set(rows
                    .map(r => normalizeDivisionName(r.division || 'Other'))
                    .filter(Boolean)))
                    .sort();

                const allDivisionReportsHtml = allDivisions.map(d => {
                    return `
                        <div style="margin-top: 22px;">
                            ${this.generateEmailAuditDivisionReport({
                                rows: rows,
                                division: d,
                                centers,
                                leaders,
                                editorsCache
                            })}
                        </div>
                    `;
                }).join('<br>');

                const staffHtml = this.generateEmailAuditStaffTable({
                    centers,
                    leaders
                });

                const docsHtml = this.templateEngine.getSectionReferenceTable();

                const editorsHtml = this.generateEmailAuditEditorsTable({
                    editorsCache,
                    leaders
                });

                const errorsHtml = this.generateEmailAuditErrorMessages();

                const reportHtml = `
                    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.5;">
                        ${overallHtml}
                        <br>
                        ${masterHtml}
                        <br>
                        ${dataModelsHtml}
                        <br>
                        ${filtersHtml}
                        <br>
                        ${schedulesHtml}
                        <br>
                        ${eventsHtml}
                        <br>
                        ${photosHtml}
                        <br>
                        ${infoPagesHtml}
                        <br>
                        ${storiesHtml}
                        <br>
                        <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">All Divisions - Divisional Reports</div>
                        ${allDivisionReportsHtml || '<div style="font-size:12.5px; color:#999;">No divisions found.</div>'}
                        <br>
                        ${docsHtml}
                        <br>
                        ${staffHtml}
                        <br>
                        ${editorsHtml}
                        <br>
                        ${errorsHtml}
                    </div>
                `;

                const blob = new Blob([reportHtml], { type: 'text/html' });
                const data = [new ClipboardItem({ 'text/html': blob })];
                await navigator.clipboard.write(data);
                copyAllBtn.textContent = '✓ Copied!';
                setTimeout(() => copyAllBtn.innerHTML = '<i class="bi bi-envelope"></i> Copy All', 2000);
            } catch (e) {
                console.warn(e);
                this.showToast('Failed to copy. See console.', 'danger');
            }
        };

        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('type', 'button');
        closeBtn.className = 'btn btn-link';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = 'position:absolute; top:0; right:0; font-size:28px; line-height:1; padding:0 6px; margin:0; color:#444; text-decoration:none;';
        closeBtn.onclick = () => modal.remove();

        btnRow.appendChild(copyOverallBtn);
        btnRow.appendChild(copyMasterCommandCenterBtn);
        btnRow.appendChild(copyDataModelsBtn);
        btnRow.appendChild(copyFiltersBtn);
        btnRow.appendChild(copySchedulesBtn);
        btnRow.appendChild(copyEventsBtn);
        btnRow.appendChild(copyStoriesBtn);
        btnRow.appendChild(copyInfoPagesBtn);
        btnRow.appendChild(copyPhotosBtn);
        btnRow.appendChild(copyStaffTableBtn);
        btnRow.appendChild(copyEditorsBtn);
        btnRow.appendChild(copyDocsBtn);
        btnRow.appendChild(copyAllBtn);

        divisionRow.appendChild(divisionSelect);
        divisionRow.appendChild(copyDivisionBtn);

        header.appendChild(btnRow);
        header.appendChild(divisionRow);
        header.appendChild(closeBtn);
        modalInner.appendChild(header);

        const accordionId = 'rsycAuditAccordion';
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        accordion.id = accordionId;

        const makeAccordionItem = (idSuffix, title, contentEl, expanded) => {
            const item = document.createElement('div');
            item.className = 'accordion-item';

            const headingId = `${accordionId}-heading-${idSuffix}`;
            const collapseId = `${accordionId}-collapse-${idSuffix}`;

            item.innerHTML = `
                <h2 class="accordion-header" id="${headingId}">
                    <button class="accordion-button ${expanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${expanded ? 'true' : 'false'}" aria-controls="${collapseId}" data-collapse-id="${collapseId}">
                        ${title}
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse ${expanded ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#${accordionId}">
                    <div class="accordion-body"></div>
                </div>
            `;

            const body = item.querySelector('.accordion-body');
            if (body && contentEl) body.appendChild(contentEl);

            // Fallback toggling for environments where Bootstrap's JS isn't loaded.
            // If Bootstrap is present, it will also handle the click; this keeps behavior consistent.
            const btn = item.querySelector('button.accordion-button');
            const collapse = item.querySelector(`#${collapseId}`);
            if (btn && collapse) {
                btn.addEventListener('click', (e) => {
                    const bootstrapActive = typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Collapse;
                    if (bootstrapActive) return;

                    e.preventDefault();
                    e.stopPropagation();

                    const isOpen = collapse.classList.contains('show');

                    // Close other open panels (accordion behavior)
                    accordion.querySelectorAll('.accordion-collapse.show').forEach(el => {
                        if (el === collapse) return;
                        el.classList.remove('show');
                        const otherBtn = accordion.querySelector(`button.accordion-button[data-collapse-id="${el.id}"]`);
                        if (otherBtn) {
                            otherBtn.classList.add('collapsed');
                            otherBtn.setAttribute('aria-expanded', 'false');
                        }
                    });

                    if (isOpen) {
                        collapse.classList.remove('show');
                        btn.classList.add('collapsed');
                        btn.setAttribute('aria-expanded', 'false');
                    } else {
                        collapse.classList.add('show');
                        btn.classList.remove('collapsed');
                        btn.setAttribute('aria-expanded', 'true');
                    }
                });
            }
            return item;
        };

        // Narrative Section
        const narrativeHtml = this.generateEmailAuditOverallStatus({
            rows: rows,
            lowFacilities, lowPrograms, recentFacs, recentProgs,
            centersCount: centers.length,
            closedCount: aggregates.closed,
            aggregates
        });

        const overviewWrap = document.createElement('div');
        overviewWrap.innerHTML = narrativeHtml;
        
        // Command Center
        const commandCenterHTML = this.generateEmailMasterCommandCenter();
        const commandCenterWrap = document.createElement('div');
        commandCenterWrap.innerHTML = commandCenterHTML;

        // Filter Associations
        const filtersHTML = this.generateEmailAuditFiltersAndAssociations({
            lowFacilities, lowPrograms, recentFacs, recentProgs
        });
        const filtersWrap = document.createElement('div');
        filtersWrap.innerHTML = filtersHTML;

        // All Divisional Reports
        const editorsCache = await this.ensureEditorsCacheLoaded();
        const allDivisions = Array.from(new Set(rows
            .map(r => normalizeDivisionName(r.division || 'Other'))
            .filter(Boolean)))
            .sort();

        const allDivisionReportsHtml = allDivisions.map(d => {
            return `
                <div style="margin-top: 22px;">
                    ${this.generateEmailAuditDivisionReport({
                        rows: rows,
                        division: d,
                        centers,
                        leaders,
                        editorsCache
                    })}
                </div>
            `;
        }).join('<br>');
        
        const divisionalReportsWrap = document.createElement('div');
        divisionalReportsWrap.innerHTML = `
            <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 24px; font-size: 16px; color: #333; display: block; width: 100%;">Complete Divisional Performance Audit</div>
            ${allDivisionReportsHtml || '<div style="font-size:12.5px; color:#999; padding:20px;">No divisions found.</div>'}
        `;

        // Detailed Checklist (The "Outlook" view but live in the modal)
        const actionListSection = document.createElement('div');
        const actionListWrap = document.createElement('div');
        actionListWrap.style.cssText = 'max-height:600px; overflow:auto; border:1px solid #eee; border-radius:12px; padding:20px; background:#fafafa; margin-bottom:24px;';
        
        // Group by division and area command
        const actionsByGroup = {};
        rows.filter(r => !r.isClosed).forEach(r => {
            const divName = (r.division || 'Unknown').trim().toUpperCase();
            const acName = (r.areaCommand && r.areaCommand !== 'None') ? r.areaCommand.trim().toUpperCase() : 'GENERAL';
            
            if (!actionsByGroup[divName]) actionsByGroup[divName] = {};
            if (!actionsByGroup[divName][acName]) actionsByGroup[divName][acName] = [];
            
            // Priority 1: Hours
            const missing = [];
            if (!r.hasHours) missing.push("Missing Custom Hours (Check Year-Round vs Summer)");
            if (!r.hasStaff && r.leaderCount === 0) missing.push("Missing Staff & Community Leaders (Photos/Bios)");
            if (r.schedCount === 0) missing.push("Missing Program Schedules (Recurring Weekly)");
            if (!r.hasDonationUrl || !r.hasSignUpUrl || !r.hasVolunteer) {
                missing.push("Missing Engagement Links (Classy Studio, Parent Portal, or Volunteer/Recruitment)");
            }
            if (!r.hasAbout) missing.push("Missing 'About This Center' (Local Narrative)");
            if (!r.hasExplainerVideo) missing.push("Missing Explainer Video (Using Territorial Placeholder)");
            if (r.photoCount === 0) missing.push("Missing Mandatory Site Photos (Exterior/Facility)");
            if (!r.hasFooterPhoto) missing.push("Missing Local Footer Photo (Building/Staff/Community)");
            if (!r.hasFooterScripture) missing.push("Missing Footer Scripture Reference");

            if (missing.length > 0) actionsByGroup[divName][acName].push({ name: r.name, liveUrl: r.liveUrl, missing });
        });

        Object.keys(actionsByGroup).sort().forEach(div => {
            const divSec = document.createElement('div');
            divSec.style.marginBottom = '20px';
            divSec.innerHTML = `<div style="font-weight:bold; color:#d93d3d; border-bottom:1px solid #ddd; margin-bottom:10px; font-size:14px;">${div}</div>`;
            
            const acs = actionsByGroup[div];
            Object.keys(acs).sort().forEach(ac => {
                if (ac !== 'GENERAL') {
                    divSec.innerHTML += `<div style="font-weight:bold; font-size:12px; color:#666; margin:10px 0 5px 10px; text-decoration: underline;">${ac}</div>`;
                }
                acs[ac].forEach(c => {
                    const centerRow = document.createElement('div');
                    centerRow.style.cssText = `margin-bottom:10px; margin-left: ${ac === 'GENERAL' ? '10px' : '20px'};`;
                    centerRow.innerHTML = `<div style="font-weight:bold; font-size:12px;">📍 ${esc(c.name)} <a href="${c.liveUrl}" target="_blank" style="text-decoration:none; margin-left:5px;" onclick="event.stopPropagation();">🔗</a></div>`;
                    c.missing.forEach(m => {
                        centerRow.innerHTML += `<div style="font-size:11px; color:#666; margin-left:15px;">• ${m}</div>`;
                    });
                    divSec.appendChild(centerRow);
                });
            });
            actionListWrap.appendChild(divSec);
        });
        actionListSection.appendChild(actionListWrap);

        const footerNote = document.createElement('div');
        footerNote.style.cssText = 'margin-top:24px; padding:15px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; color:#666; font-size:12px; font-style:italic; line-height:1.5;';
        footerNote.innerHTML = `
            <b>Audit Summary:</b><br>
            • Red (✗) items indicate missing data for <b>OPEN</b> centers that require attention before launch.<br>
            • This view is synchronized with the <b>"Copy All"</b> report tool to ensure data consistency.<br>
            • Use the <b>Command Center</b> for direct links to all management portals.
        `;

        const footerSection = document.createElement('div');
        footerSection.appendChild(footerNote);

        const schedulesPreviewSection = document.createElement('div');
        schedulesPreviewSection.innerHTML = this.generateEmailAuditProgramSchedules({
            centers,
            schedules
        });

        const eventsPreviewSection = document.createElement('div');
        eventsPreviewSection.innerHTML = this.generateEmailAuditEvents({
            centers,
            schedules
        });

        const infoPagesPreviewSection = document.createElement('div');
        infoPagesPreviewSection.innerHTML = this.generateEmailAuditInfoPages({
            centers,
            informationalPages
        });

        const storiesPreviewSection = document.createElement('div');
        storiesPreviewSection.innerHTML = this.generateEmailAuditStories({
            centers,
            stories
        });

        const photosPreviewSection = document.createElement('div');
        photosPreviewSection.id = 'rsyc-photos-preview';
        photosPreviewSection.innerHTML = this.generateEmailAuditPhotos({
            centers,
            photos
        });

        const staffPreviewSection = document.createElement('div');
        staffPreviewSection.innerHTML = this.generateEmailAuditStaffTable({
            centers,
            leaders
        });

        const editorsPreviewSection = document.createElement('div');
        editorsPreviewSection.innerHTML = '<div style="font-size:12px; color:#666;">Loading editors Permissions…</div>';
        editorsPreviewSection.innerHTML = this.generateEmailAuditEditorsTable({ editorsCache, leaders });

        // Error Messages section
        const errorMessagesSection = document.createElement('div');
        errorMessagesSection.innerHTML = this.generateEmailAuditErrorMessages();

        accordion.appendChild(makeAccordionItem('status', 'All Centers Status Detail', overviewWrap, true));
        accordion.appendChild(makeAccordionItem('filters', 'Filter & Tag Associations', filtersWrap, false));
        accordion.appendChild(makeAccordionItem('command', 'Master Control Center', commandCenterWrap, false));
        accordion.appendChild(makeAccordionItem('datamodels', 'Data Models (Center Profile Fields)', this.createDataModelsSection(), false));
        accordion.appendChild(makeAccordionItem('centerProfileSections', 'Center Profile Sections', this.createCenterProfileSectionsSection(), false));
        accordion.appendChild(makeAccordionItem('actions', 'Territorial Action List', actionListSection, false));
        accordion.appendChild(makeAccordionItem('divisional', 'All Divisional Audit Reports', divisionalReportsWrap, false));
        accordion.appendChild(makeAccordionItem('previewSchedules', 'Program Schedules (Full Catalog)', schedulesPreviewSection, false));
        accordion.appendChild(makeAccordionItem('previewEvents', 'Upcoming Events (Full Catalog)', eventsPreviewSection, false));
        accordion.appendChild(makeAccordionItem('previewStories', 'Published Stories (Full Catalog)', storiesPreviewSection, false));
        accordion.appendChild(makeAccordionItem('previewPhotos', 'Center Photos (Full Catalog)', photosPreviewSection, false));
        accordion.appendChild(makeAccordionItem('previewInfoPages', 'Informational Pages (Full Catalog)', infoPagesPreviewSection, false));
        accordion.appendChild(makeAccordionItem('previewStaff', 'Staff Table (Full Preview)', staffPreviewSection, false));
        accordion.appendChild(makeAccordionItem('previewEditors', 'Editors (Full Permissions)', editorsPreviewSection, false));
        accordion.appendChild(makeAccordionItem('errorMessages', 'Front-End Error Messages', errorMessagesSection, false));
        accordion.appendChild(makeAccordionItem('footer', 'Notes', footerSection, false));

        modalInner.appendChild(accordion);

        // Add delegating click listener for center switching throughout the modal
        modalInner.addEventListener('click', (e) => {
            const link = e.target.closest('.center-audit-link');
            if (link) {
                const id = link.dataset.centerId;
                this.switchCenter(id);
                
                // Close the modal as requested so the user can see the profile switch
                modal.remove();
            }
        });

        modal.appendChild(modalInner);
        document.body.appendChild(modal);
    }

    generateEmailAuditErrorMessages() {
        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 900px; line-height: 1.5;">
                <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">🚧 RSYC FRONT-END ERROR MESSAGES (SYSTEM PREVIEW)</div>
                
                <div style="margin-bottom: 35px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    <h4 style="color: #333; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase;">1. Center Profile Error Message</h4>
                    <div style="padding: 30px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; text-align: center; max-width: 450px; margin: 0 auto;">
                        <div style="font-size: 40px; margin-bottom: 12px;">👋</div>
                        <h2 style="color: #333; font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">Thanks for stopping by!</h2>
                        <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">This Center Profile page did not load successfully. Please refresh and try again.</p>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h4 style="color: #333; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase;">2. Unit Grid Error Message</h4>
                    <div style="padding: 30px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; text-align: center; max-width: 450px; margin: 0 auto;">
                        <div style="font-size: 40px; margin-bottom: 12px;">👋</div>
                        <h2 style="color: #333; font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">Thanks for stopping by!</h2>
                        <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">This Unit Grid page did not load successfully. Please refresh and try again.</p>
                    </div>
                </div>
            </div>
        `;
    }

    generateEmailAuditReport(data) {
        const { rows, lowFacilities, lowPrograms, recentFacs, recentProgs, centersCount, closedCount } = data;
        
        const sectionStyle = "margin-bottom: 60px; font-family: 'Segoe UI', Tahoma, sans-serif;";
        const headerStyle = "background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;";
        const subHeaderStyle = "font-weight: bold; font-size: 16px; color: #d93d3d; border-bottom: 3px solid #eee; padding-bottom: 8px; margin: 15px 0 20px 0; display: block; text-transform: uppercase; width: 100%;";
        const listStyle = "margin: 0; padding-left: 20px; font-size: 13px; color: #444; line-height: 1.7;";
        const centerNameStyle = "font-weight: bold; font-size: 13px; color: #000; margin-top: 20px; margin-bottom: 12px; display: block;";
        const missingItemStyle = "font-size: 12px; color: #555; font-style: italic; margin-left: 15px; margin-bottom: 8px; display: block;";
        const faqHeaderStyle = "font-weight: bold; color: #d93d3d; font-size: 14px; margin-bottom: 8px; display: block;";
        const faqParaStyle = "font-size: 12px; color: #444; margin-bottom: 25px; line-height: 1.6; display: block;";
        const pStyle = "font-size: 13px; color: #444; margin-bottom: 20px; display: block; line-height: 1.6;";
        
        // Email Safe Section Styling
        const divisionContainerStyle = "background-color: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 40px; display: block;";
        const acContainerStyle = "background-color: #ffffff; border-left: 4px solid #ddd; padding: 10px 15px; margin: 20px 0 20px 10px; display: block;";
        
        // Group centers by division and area command
        const grouped = {};
        rows.forEach(r => {
            const div = (r.division || 'Other').trim().toUpperCase();
            const ac = (r.areaCommand && r.areaCommand !== 'None') ? r.areaCommand.trim().toUpperCase() : 'GENERAL';
            
            if (!grouped[div]) grouped[div] = {};
            if (!grouped[div][ac]) grouped[div][ac] = [];
            
            const missing = [];
            // Priority 1: Hours
            if (!r.hasHours) missing.push("Missing Custom Hours (Check Year-Round vs Summer)");
            
            // Priority 2: Staff & Community Leaders
            if (!r.hasStaff && r.leaderCount === 0) missing.push("Missing Staff & Community Leaders (Photos/Bios)");
            
            // Priority 3: Schedules
            if (r.schedCount === 0) missing.push("Missing Program Schedules (Recurring Weekly)");
            
            // Priority 4: Engagement Links
            if (!r.hasDonationUrl || !r.hasSignUpUrl || !r.hasVolunteer) {
                missing.push("Missing Engagement Links (Classy Studio, Parent Portal, or Volunteer/Recruitment)");
            }

            // Priority 5: Profile Context
            if (!r.hasAbout) missing.push("Missing 'About This Center' (Local Narrative)");
            if (!r.hasExplainerVideo) missing.push("Missing Explainer Video (Using Territorial Placeholder)");
            if (r.photoCount === 0) missing.push("Missing Mandatory Site Photos (Exterior/Facility)");
            
            // Priority 6: Footer Integrity
            if (!r.hasFooterPhoto) missing.push("Missing Local Footer Photo (Building/Staff/Community)");
            if (!r.hasFooterScripture) missing.push("Missing Regional Scripture Reference");

            if (missing.length > 0 || r.isClosed) {
                grouped[div][ac].push({ 
                    name: r.name, 
                    liveUrl: r.liveUrl, 
                    missing: r.isClosed ? [] : missing, 
                    isClosed: r.isClosed 
                });
            }
        });

        const sortedDivs = Object.keys(grouped).sort();
        
        let missingContent = '';

        sortedDivs.forEach(div => {
            const areaCommands = grouped[div];
            const areaCommandKeys = Object.keys(areaCommands).sort();
            
            let divHasData = false;
            let divContent = `<!-- Bold Divider Above Each Division -->
                                <hr style="border: none; border-top: 3px solid #d93d3d; margin: 40px 0 20px 0; display: block;">
                                <div style="${divisionContainerStyle}">
                                <div style="${subHeaderStyle}">📂 DIVISION: ${div}</div>`;
            
            areaCommandKeys.forEach(ac => {
                const centers = areaCommands[ac];
                if (centers.length === 0) return;
                divHasData = true;
                
                if (ac !== 'GENERAL') {
                    divContent += `<hr style="border: none; border-top: 1px dashed #ccc; margin: 35px 0 10px 10px; display: block; width: 100%;">
                                   <div style="${acContainerStyle}">
                                    <div style="font-size: 13px; font-weight: bold; color: #666; margin-bottom: 10px; text-transform: uppercase;">📁 AREA COMMAND: ${ac}</div>`;
                } else {
                    divContent += `<div style="margin-top: 15px; display: block;">`;
                }
                
                centers.forEach((c, idx) => {
                    // HR above EACH center
                    divContent += `<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px 0; display: block;">`;
                    
                    const closedMark = c.isClosed ? `<span style="color:#dc3545; font-size:10px; font-weight:bold;">[CLOSED]</span> ` : '';
                    divContent += `<div style="${centerNameStyle}">📍 ${closedMark}${c.name} <a href="${c.liveUrl}" target="_blank" style="text-decoration:none; margin-left:5px;">🔗</a></div>`;
                    
                    if (c.isClosed) {
                        divContent += `<div style="${missingItemStyle};">• This center is currently flagged as CLOSED and excluded from active audit requirements.</div>`;
                    } else {
                        c.missing.forEach(m => {
                            divContent += `<div style="${missingItemStyle};">• ${m}</div>`;
                        });
                    }
                });

                divContent += `</div>`; // Close AC container or spacing div
            });
            
            divContent += `</div>`; // Close division container
            if (divHasData) missingContent += divContent;
        });

        if (!missingContent) missingContent = '<p style="font-size: 13px; color: #28a745; font-weight: bold;">🎉 All open centers have complete core data!</p>';

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; max-width: 700px; line-height: 1.5;">
                <h2 style="color: #d93d3d; margin-bottom: 30px; display: block;">RSYC Profile Audit</h2>
                <p style="font-size: 14px; margin-top: 0; color: #666; margin-bottom: 25px; display: block;">Generated on ${new Date().toLocaleDateString()} • Analyzing ${centersCount} total centers (${closedCount} flagged as CLOSED)</p>
                
                <div style="background-color: #f0f7ff; border-left: 6px solid #007bff; padding: 20px; margin: 35px 0; border-radius: 4px; display: block;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #2c3e50; display: block; margin-bottom: 10px;">
                        <strong>Our Goal:</strong> We are currently auditing the Red Shield Youth Center territory-wide to ensure every location is accurately represented and fully ready for public promotion. This focus on profile readiness ensures that when families, donors, and community partners visit <strong>redshieldyouth.org</strong>, they encounter a professional, complete, and locally relevant view of our ministry. By addressing the specific data points identified in this report, we can collectively strengthen our regional presence and ensure every center has the "digital front door" it deserves.
                    </p>
                </div>

                <!-- Educational Guidance Section for Outlook -->
                <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin-bottom: 35px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #242424; margin: 0 0 10px 0;">RSYC Center Profile Instructions</h3>
                    <p style="font-size: 14px; color: #333; line-height: 1.5; margin: 0 0 15px 0;">
                        Changes to your center profile are managed through the SharePoint Profile Manager. Changes are saved when you click out of a field, and sync to the live site within minutes.
                    </p>
                    <div style="margin-bottom: 20px;">
                        <a href="https://sauss.sharepoint.com/sites/ConnectCommunications/SitePages/Manage-Youth-Center-Web-Profile.aspx#center-profile-manager" style="font-size: 13px; color: #0078d4; margin-right: 15px;">Learn more</a>
                        <a href="https://southernusa.salvationarmy.org/redshieldyouth/center-locations" style="font-size: 13px; color: #0078d4;">View Your Profile</a>
                    </div>
                    
                    <div style="font-size: 13px; color: #444; background-color: #fff8e1; border-left: 4px solid #f2c200; padding: 12px; margin-bottom: 25px; line-height: 1.5;">
                        💬 <b>REQUIRED ACTION FOR PHOTOS:</b> For changes to photos, please @mention our team in the SharePoint comments: <i>"@Shared THQ Web and Social Media, We have added new center photos, staff photos, hero slides, stories, events, info pages that are ready to publish."</i>
                    </div>

                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td width="55%" valign="top" style="padding-right: 15px;">
                                <h4 style="font-size: 15px; color: #242424; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">🚀 Completion Order</h4>
                                <div style="font-size: 12px; line-height: 2;">
                                    • <b>Hours:</b> <a href="https://hoursreview-rsyc.usscommunications.org/" style="color: #0078d4;">Review/Edit</a><br>
                                    • <b>Photos:</b> <a href="https://photos1review-rsyc.usscommunications.org/" style="color: #0078d4;">Manage Photos</a><br>
                                    • <b>Schedules:</b> <a href="https://submitschedules-rsyc.usscommunications.org/" style="color: #0078d4;">Add New</a> | <a href="https://schedulesreview-rsyc.usscommunications.org/" style="color: #0078d4;">Edit Existing</a><br>
                                    • <b>Staff & Leaders:</b> <a href="https://submitstaff-rsyc.usscommunications.org/" style="color: #0078d4;">Add New</a> | <a href="https://staffreview-rsyc.usscommunications.org/" style="color: #0078d4;">Edit Existing</a><br>
                                    • <b>Hero Slides:</b> <a href="https://submitslides-rsyc.usscommunications.org/" style="color: #0078d4;">Add New</a> | <a href="https://slidesreview-rsyc.usscommunications.org/" style="color: #0078d4;">Edit Existing</a><br>
                                    • <b>Stories:</b> <a href="https://submitstories-rsyc.usscommunications.org/" style="color: #0078d4;">Add New</a> | <a href="https://storiesreview-rsyc.usscommunications.org/" style="color: #0078d4;">Edit Existing</a><br>
                                    • <b>Events:</b> <a href="https://submitevents-rsyc.usscommunications.org/" style="color: #0078d4;">Add New</a> | <a href="https://eventsreview-rsyc.usscommunications.org/" style="color: #0078d4;">Edit Existing</a><br>
                                    • <b>Info Pages:</b> <a href="https://submitinfopage-rsyc.usscommunications.org/" style="color: #0078d4;">Add New</a> | <a href="https://infopagereview-rsyc.usscommunications.org/" style="color: #0078d4;">Edit Existing</a>
                                </div>
                            </td>
                            <td width="45%" valign="top">
                                <h4 style="font-size: 15px; color: #242424; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">💡 Best Practices</h4>
                                <div style="font-size: 12px; line-height: 1.6; color: #555;">
                                    <b>Schedules:</b> List recurring programs separately (ACT Prep, Karate, Afterschool).<br>
                                    <b>Events & Camps:</b> <u>Camps should be listed as Events</u>, not just as a program schedule item. Submit all one-time and recurring events (Summer Camp, Spring Break, Community Fairs) as Events.<br>
                                    <b>Season:</b> Add start/end dates or months running plus registration opens.<br>
                                    <b>Details:</b> Add ages served, fees, transportation notes, and holiday/closure disclaimers when relevant.<br>
                                    <b>Narrative:</b> Include activities, meals/snacks, transportation, and expectations (orientation, required forms).
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0; display: block;">

                <div style="${sectionStyle}">
                    <div style="${headerStyle}">🛠️ TERRITORIAL PROFILE AUDIT BY DIVISION</div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0 25px 0; display: block;">
                    
                    <div style="font-size: 12px; color: #666; background: #fff9f9; padding: 15px; border: 1px solid #ffecec; margin-bottom: 35px; border-radius: 6px; display: block; line-height: 1.6;">
                        <strong>Field Requirements Guide:</strong><br>
                        <div style="margin-top: 10px; margin-bottom: 10px; display: block;">• <strong>Custom Hours:</strong> Centers should have hours entered that differ from the 2:00 PM-7:30 PM School year and 7:30 AM-5:30 PM Summer defaults.</div>
                        <div style="margin-bottom: 10px; display: block;">• <strong>Staff and Community Leaders:</strong> Include most staff profiles with photos and bios.</div>
                        <div style="margin-bottom: 10px; display: block;">• <strong>Program Schedules:</strong> List recurring programs (e.g., Afterschool, Youth Night, Dinner, Club 316, Music/Arts, Sunday Worship).</div>
                        <div style="margin-bottom: 10px; display: block;">• <strong>Engagement Links (CRITICAL):</strong> Every profile must include a direct **Online Registration/Parent Sign-up Link**, a **Classy Studio Donation Form Link**, and **Volunteer Sign Up Information**.</div>
                        <div style="margin-bottom: 10px; display: block;">• <strong>Explainer/About Video:</strong> A territorial promotional video is provided as the default until a local video is uploaded.</div>
                        <div style="display: block;">• <strong>Footer Content:</strong> Local footer photos and scripture provide a unique city-specific touch and can be updated as often as desired to keep the site fresh.</div>
                        <div style="margin-top: 12px; display: block;"><strong>Best Practices From Live Profiles:</strong></div>
                        <div style="margin-top: 6px; display: block;">• <strong>Events & Camps:</strong> <u>Camps should be listed as Events</u>, not just as a program schedule item.</div>
                        <div style="margin-top: 6px; display: block;">• <strong>About This Center:</strong> lead with who you serve (ages/grades) and core programs (after-school, camps, tutoring, arts/sports), then outcomes (academic support, character/leadership, life skills, faith/values).</div>
                        <div style="margin-top: 6px; display: block;">• <strong>Program Schedules:</strong> list each program separately with title/subtitle, days, time range, timezone, and frequency.</div>
                        <div style="margin-top: 6px; display: block;">• <strong>Season & Registration:</strong> include start/end dates or months running plus when registration typically opens.</div>
                        <div style="margin-top: 6px; display: block;">• <strong>Details That Help Families:</strong> ages served, fees, transportation notes, and holiday/closure disclaimers when applicable.</div>
                        <div style="margin-top: 6px; display: block;">• <strong>Schedule Narrative:</strong> include activities offered, meals/snacks, transportation, and any expectations (orientation, required forms).</div>
                        <div style="margin-top: 6px; display: block;">• <strong>Volunteer/Mentor:</strong> include a named contact with email/phone plus steps (interest form, background check, Safe From Harm, orientation).</div>
                    </div>

                    ${missingContent}
                </div>

                <div style="${sectionStyle}">
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0 25px 0; display: block;">
                    <div style="${headerStyle}">📅 RECENTLY CREATED FILTER OPTIONS (LAST 90 DAYS)</div>
                    <div style="margin-left: 10px; display: block;">
                        <h4 style="margin: 0 0 15px 0; font-weight: 700; font-size: 13px; display: block; color:#333;">New Facility Features:</h4>
                        ${recentFacs.length ? `<ul style="${listStyle}; margin-bottom: 25px;">${recentFacs.map(f => `<li>${f.name}</li>`).join('')}</ul>` : '<p style="font-size:12px; color: #999; margin-left:20px; margin-bottom: 25px; display: block;">None</p>'}
                        <h4 style="margin: 0 0 15px 0; font-weight: 700; font-size: 13px; display: block; color:#333;">New Featured Programs:</h4>
                        ${recentProgs.length ? `<ul style="${listStyle}; margin-bottom: 25px;">${recentProgs.map(p => `<li>${p.name}</li>`).join('')}</ul>` : '<p style="font-size:12px; color: #999; margin-left:20px; margin-bottom: 25px; display: block;">None</p>'}
                        <p style="font-size: 12px; color: #d93d3d; font-style: italic; margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px; display: block; line-height: 1.6;">
                            <strong>Note:</strong> It is critical to associate centers with as many applicable facility features and featured programs as possible to ensure they show on center location filters.
                        </p>
                    </div>
                </div>

                <div style="${sectionStyle}">
                    <div style="${headerStyle}">💡 MASTER INSTRUCTIONS & FIELD SUPPORT</div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0 25px 0; display: block;">
                    <div style="margin-left: 10px; display: block;">
                        <span style="${faqHeaderStyle}">How to complete your profile?</span>
                        <p style="${faqParaStyle}">
                            Go to <a href="https://centerprofile.redshieldyouth.org">centerprofile.redshieldyouth.org</a> to edit your center's About, Contact, and mandatory links. Use the @mention feature <b>@Shared THQ Web and Social Media</b> in the sidebar comments to notify the team when your updates are ready to publish.
                        </p>

                        <span style="${faqHeaderStyle}">Priority Completion Order</span>
                        <div style="font-size: 13px; line-height: 1.6; color: #444; margin-bottom: 25px;">
                            <strong>1.</strong> Manage <a href="https://hoursreview-rsyc.usscommunications.org/">Operating Hours</a><br>
                            <strong>2.</strong> Review <a href="https://photos1review-rsyc.usscommunications.org/">Center Exterior Photos</a><br>
                            <strong>3.</strong> Program Schedules: <a href="https://submitschedules-rsyc.usscommunications.org/">Add New</a> | <a href="https://schedulesreview-rsyc.usscommunications.org/">Edit Existing</a><br>
                            <strong>4.</strong> Staff & Leaders: <a href="https://submitstaff-rsyc.usscommunications.org/">Add New</a> | <a href="https://staffreview-rsyc.usscommunications.org/">Edit Existing</a><br>
                            <strong>5.</strong> Hero/Theatre Slides: <a href="https://submitslides-rsyc.usscommunications.org/">Add New</a> | <a href="https://slidesreview-rsyc.usscommunications.org/">Edit Existing</a><br>
                            <strong>6.</strong> Stories: <a href="https://submitstories-rsyc.usscommunications.org/">Add New</a> | <a href="https://storiesreview-rsyc.usscommunications.org/">Edit Existing</a><br>
                            <strong>7.</strong> Events: <a href="https://submitevents-rsyc.usscommunications.org/">Add New</a> | <a href="https://eventsreview-rsyc.usscommunications.org/">Edit Existing</a><br>
                            <strong>8.</strong> Info Pages: <a href="https://submitinfopage-rsyc.usscommunications.org/">Add New</a> | <a href="https://infopagereview-rsyc.usscommunications.org/">Edit Existing</a>
                        </div>

                         <span style="${faqHeaderStyle}">Pick-List Maintenance</span>
                         <p style="${faqParaStyle}">
                            Associate centers with as many applicable facility features and featured programs as possible to ensure they show on filters. If a feature or program is missing, submit it here:<br>
                            • <a href="https://sauss.sharepoint.com/sites/THQITDWeb/Lists/RSYCFacilityFeatures/AllItems.aspx?env=WebViewList">View Facility Features Pick List</a> | <a href="https://forms.office.com/r/DtqymAM3Vu">Submit Missing Feature</a><br>
                            • <a href="https://sauss.sharepoint.com/sites/THQITDWeb/Lists/RSYCPrograms/AllItems.aspx?env=WebViewList">View Featured Programs Pick List</a> | <a href="https://forms.office.com/r/9AwuTKQ3fE">Submit Missing Program</a>
                        </p>
                    </div>
                </div>

                <div style="${sectionStyle}">
                    <div style="${headerStyle}">📑 PROGRAM SCHEDULE EXAMPLE</div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0 25px 0; display: block;">
                    <div style="margin-left: 10px; display: block;">
                        <p style="font-size: 13px; color: #444; line-height: 1.6; margin-bottom: 15px;">
                            Example of formatted program schedule data to ensure consistency for parents and families:
                        </p>
                        <table style="width: 100%; border-collapse: collapse; font-family: Segoe UI, sans-serif; font-size: 12px; margin-bottom: 25px;">
                            <thead style="background: #f1f1f1;">
                                <tr>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Program</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Schedule Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">After-School Program</td><td style="padding: 10px; border: 1px solid #ddd;">Mon-Fri, 2:30PM - 6:00PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Karate (All Levels)</td><td style="padding: 10px; border: 1px solid #ddd;">Tue & Thu, 6:30PM - 7:30PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Youth Creative Arts</td><td style="padding: 10px; border: 1px solid #ddd;">Wednesdays, 5:00PM - 6:30PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Adult Pickleball</td><td style="padding: 10px; border: 1px solid #ddd;">Mon & Wed, 9:00AM - 12:00PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">SAT/ACT Prep</td><td style="padding: 10px; border: 1px solid #ddd;">Saturdays, 10:00AM - 1:00PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Teen Night</td><td style="padding: 10px; border: 1px solid #ddd;">Fridays, 6:00PM - 9:00PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Music Fundamentals</td><td style="padding: 10px; border: 1px solid #ddd;">Tue/Thu, 4:00PM - 5:30PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Cooking Class</td><td style="padding: 10px; border: 1px solid #ddd;">Mondays, 5:30PM - 7:00PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Basketball League</td><td style="padding: 10px; border: 1px solid #ddd;">Tue, 5:00PM - 8:00PM</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">Community Garden</td><td style="padding: 10px; border: 1px solid #ddd;">Saturdays, 9:00AM - 11:00AM</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="${sectionStyle}">
                    <div style="${headerStyle}">🚀 LAUNCH READINESS & ACCESS</div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0 25px 0; display: block;">
                    <div style="margin-left: 10px; font-size: 12px; color: #444; line-height: 1.6; display: block;">
                        <p style="margin-bottom: 15px;">
                            For technical support or to request permissions for local staff, please contact the Territorial Web Team. Authorized divisional leadership can grant access directly using the <b>Permissions Site</b> links in the Master Resources guide.
                        </p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #eee;">
                            <strong>Strategic Context:</strong> This hub complements local websites by providing a unified, territory-wide view of our youth ministry. Your local sites should link to your center profile on <b>redshieldyouth.org</b> to ensure families have the most current program and schedule information.
                        </div>
                        <p style="margin-top: 25px; font-weight: bold; color: #d93d3d; display: block;">Thanks for your partnership in making this launch a success!</p>
                    </div>
                </div>

                <p style="font-size: 11px; color: #999; margin-top: 80px; border-top: 1px solid #eee; padding-top: 30px; display: block;">
                    This automated maintenance report was generated from the Center Profile Manager data at <a href="https://centerprofile.redshieldyouth.org">https://centerprofile.redshieldyouth.org</a> 
                </p>
            </div>
        `;
    }

    createTemplateViewer(hasCenter = false) {
        // Build sections list; hide About button when a center is selected but About is empty
        let sections = [
            { key: 'about', name: 'About This Center' },
            { key: 'schedules', name: 'Program Schedules' },
            { key: 'hours', name: 'Hours of Operation' },
            { key: 'facilities', name: 'Facility Features' },
            { key: 'programs', name: 'Featured Programs' },
            { key: 'staff', name: 'Staff & Community Leaders' },
            { key: 'events', name: 'Upcoming Events' },
            { key: 'infopages', name: 'Information & Policies' },
            { key: 'stories', name: 'Impact Stories' },
            { key: 'nearby', name: 'Nearby Centers' },
            { key: 'parents', name: 'For Parents' },
            { key: 'youth', name: 'For Youth' },
            { key: 'volunteer', name: 'Get Involved' },
            { key: 'footerPhoto', name: 'Footer Photo' },
            { key: 'contact', name: 'Footer Scripture' }
        ];

        if (hasCenter && this.currentCenter) {
            const aboutText = (this.currentCenter.aboutText || '').toString().trim();
            if (!aboutText) {
                // Remove the About section from the viewer when it's empty for the selected center
                sections = sections.filter(s => s.key !== 'about');
            }
        }

        const viewModeButtons = hasCenter ? `
            <button id="viewFullPageCode" class="template-section-btn" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 10px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            ">
                📄 Full Page Output
            </button>
            <button id="viewDataValues" class="template-section-btn" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            ">
                📊 View Data Values
            </button>
        ` : `
            <button id="viewFullPageCode" class="template-section-btn" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            ">
                📄 View Full Template
            </button>
        `;

        return `
            <div style="display: flex; gap: 20px; height: 600px;">
                <!-- Left sidebar: Section list -->
                <div style="width: 250px; border-right: 2px solid #dee2e6; padding-right: 15px; overflow-y: auto;">
                    ${viewModeButtons}
                    <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">
                        ${hasCenter ? 'Section Output:' : 'Section Templates:'}
                    </h4>
                    ${sections.map(section => `
                        <button class="template-section-btn" data-section="${section.key}" style="
                            width: 100%;
                            padding: 10px;
                            margin-bottom: 8px;
                            background: white;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            cursor: pointer;
                            text-align: left;
                            font-size: 13px;
                            transition: all 0.2s;
                        ">
                            ${section.name}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Right panel: Code display -->
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <strong id="currentSectionTitle">
                            ${hasCenter ? 'Select a section to view its output' : 'Select a section to view its template code'}
                        </strong>
                        <div style="display: flex; gap: 8px;">
                            <button id="toggleViewMode" style="
                                padding: 6px 12px;
                                background: #6c757d;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 12px;
                            " title="Toggle between code view and data mapping view">
                                🔄 Show Data Map
                            </button>
                            <button id="copyTemplateCode" style="
                                padding: 6px 12px;
                                background: #007bff;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 12px;
                            ">
                                📋 Copy
                            </button>
                        </div>
                    </div>
                    <textarea id="templateCodeDisplay" readonly style="
                        flex: 1;
                        width: 100%;
                        background: #f4f4f4;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.5;
                        resize: none;
                    ">${hasCenter ? 'Select a section from the left to view its generated output or data values.' : 'Select a section from the left to view its template code with placeholders.'}</textarea>
                </div>
            </div>
        `;
    }

    attachTemplateViewerListeners(hasCenter = false) {
        // Reset view mode when opening modal
        this.viewerMode = 'code';
        this.currentSection = null;
        
        // Section buttons
        document.querySelectorAll('.template-section-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.template-section-btn[data-section]').forEach(b => {
                    b.style.background = 'white';
                    b.style.borderColor = '#dee2e6';
                    b.style.fontWeight = 'normal';
                });
                e.target.style.background = '#e7f3ff';
                e.target.style.borderColor = '#007bff';
                e.target.style.fontWeight = '600';
                
                const section = e.target.dataset.section;
                this.currentSection = section;
                
                if (this.viewerMode === 'code') {
                    if (hasCenter) {
                        this.displaySectionOutput(section);
                    } else {
                        this.displaySectionTemplate(section);
                    }
                } else {
                    this.displaySectionDataMap(section, hasCenter);
                }
            });
        });

        // Full page code button
        document.getElementById('viewFullPageCode')?.addEventListener('click', () => {
            this.currentSection = 'fullpage';
            
            // Clear section button highlights
            document.querySelectorAll('.template-section-btn[data-section]').forEach(b => {
                b.style.background = 'white';
                b.style.borderColor = '#dee2e6';
                b.style.fontWeight = 'normal';
            });
            
            if (this.viewerMode === 'code') {
                if (hasCenter) {
                    this.displayFullPageOutput();
                } else {
                    this.displayFullPageTemplate();
                }
            } else {
                this.displayFullDataMap(hasCenter);
            }
        });

        // View data values button (only when center selected)
        if (hasCenter) {
            document.getElementById('viewDataValues')?.addEventListener('click', () => {
                this.currentSection = 'datavalues';
                
                // Clear section button highlights
                document.querySelectorAll('.template-section-btn[data-section]').forEach(b => {
                    b.style.background = 'white';
                    b.style.borderColor = '#dee2e6';
                    b.style.fontWeight = 'normal';
                });
                
                this.displayDataValues();
            });
        }

        // Toggle view mode button
        document.getElementById('toggleViewMode')?.addEventListener('click', () => {
            this.viewerMode = this.viewerMode === 'code' ? 'datamap' : 'code';
            const btn = document.getElementById('toggleViewMode');
            
            // Update button text based on CURRENT mode (show what clicking will do)
            if (this.viewerMode === 'datamap') {
                btn.innerHTML = '🔄 Show Code';
            } else {
                btn.innerHTML = '🔄 Show Data Map';
            }
            
            // Refresh current view
            if (this.currentSection) {
                if (this.currentSection === 'fullpage') {
                    if (this.viewerMode === 'code') {
                        if (hasCenter) {
                            this.displayFullPageOutput();
                        } else {
                            this.displayFullPageTemplate();
                        }
                    } else {
                        this.displayFullDataMap(hasCenter);
                    }
                } else if (this.currentSection === 'datavalues') {
                    this.displayDataValues();
                } else {
                    // Regular section
                    if (this.viewerMode === 'code') {
                        if (hasCenter) {
                            this.displaySectionOutput(this.currentSection);
                        } else {
                            this.displaySectionTemplate(this.currentSection);
                        }
                    } else {
                        this.displaySectionDataMap(this.currentSection, hasCenter);
                    }
                }
            }
        });

        // Copy button
        document.getElementById('copyTemplateCode')?.addEventListener('click', () => {
            const code = document.getElementById('templateCodeDisplay').value;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('copyTemplateCode');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            });
        });
    }

    displaySectionTemplate(sectionKey) {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        // Get the method source code from the template engine
        const methodName = 'generate' + sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
        const method = this.templateEngine[methodName];
        
        if (method) {
            titleEl.textContent = `Template: ${sectionKey} (${methodName})`;
            codeEl.value = this.formatMethodSource(method);
        } else {
            titleEl.textContent = `Template: ${sectionKey} - Not Found`;
            codeEl.value = `// No template method found for: ${methodName}`;
        }
    }

    displaySectionOutput(sectionKey) {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        if (!this.currentCenter) {
            titleEl.textContent = `Output: ${sectionKey} (No Center Selected)`;
            codeEl.value = `// Error: No center selected\n// Please select a center from the dropdown first.`;
            return;
        }
        
        // Use the correct ID property - centers have 'id' property (lowercase)
        const centerId = this.currentCenter.id || this.currentCenter.Id;
        console.log('🔍 displaySectionOutput - currentCenter:', this.currentCenter);
        console.log('🔍 displaySectionOutput - using centerId:', centerId);
        
        const centerData = this.dataLoader.getCenterData(centerId);
        console.log('🔍 displaySectionOutput - centerData returned:', centerData);
        
        if (!centerData) {
            titleEl.textContent = `Output: ${this.currentCenter.name || this.currentCenter.Title} - ${sectionKey} (No Data)`;
            codeEl.value = `// Error: No data found for center
// Center: ${this.currentCenter.name || this.currentCenter.Title}
// Center ID (id): ${this.currentCenter.id}
// Center ID (Id): ${this.currentCenter.Id}
// SharePoint ID: ${this.currentCenter.sharePointId}

// Current Center object:
${JSON.stringify(this.currentCenter, null, 2)}

// This could mean:
// 1. Data failed to load
// 2. Center ID doesn't match what getCenter() expects
// 3. getCenterData returned null`;
            return;
        }
        
        const methodName = 'generate' + sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
        
        try {
            // Get currently enabled sections from checkboxes
            const enabledSections = Array.from(
                document.querySelectorAll('.section-checkboxes input[type="checkbox"]:checked')
            ).map(cb => cb.value);
            
            // Add enabled sections to data so generateNavigation can access it
            const dataWithSections = { ...centerData, __enabledSections: enabledSections };
            const output = this.templateEngine.generateSection(sectionKey, dataWithSections);
            
            if (output && output.trim()) {
                titleEl.textContent = `Output: ${this.currentCenter.name || this.currentCenter.Title} - ${sectionKey}`;
                codeEl.value = output;
            } else {
                titleEl.textContent = `Output: ${this.currentCenter.name || this.currentCenter.Title} - ${sectionKey} (Empty)`;
                codeEl.value = `// This section produced no output\n// Reason: Section may be disabled or no data available for this center\n// Method: ${methodName}\n\n// Center Data Keys: ${Object.keys(centerData).join(', ')}`;
            }
        } catch (error) {
            titleEl.textContent = `Output: ${this.currentCenter.name || this.currentCenter.Title} - ${sectionKey} (Error)`;
            codeEl.value = `// Error generating section output:\n// ${error.message}\n\n// Stack trace:\n${error.stack}\n\n// Center Data Available:\n${JSON.stringify(centerData, null, 2)}`;
        }
    }

    displayFullPageTemplate() {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        titleEl.textContent = 'Full Page Template Code (generateProfile method)';
        
        const method = this.templateEngine.generateProfile;
        if (method) {
            codeEl.value = this.formatMethodSource(method);
        } else {
            codeEl.value = '// generateProfile method not found';
        }
    }

    displayFullPageOutput() {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        if (!this.currentCenter) {
            titleEl.textContent = 'Full Page Output (No Center Selected)';
            codeEl.value = `// Error: No center selected\n// Please select a center from the dropdown first.`;
            return;
        }
        
        const centerName = this.currentCenter.name || this.currentCenter.Title;
        titleEl.textContent = `Full Page Output: ${centerName}`;
        
        try {
            const enabledSections = this.getSelectedSections();
            const centerId = this.currentCenter.id || this.currentCenter.Id;
            const centerData = this.dataLoader.getCenterData(centerId);
            
            if (!centerData) {
                titleEl.textContent = `Full Page Output: ${centerName} (No Data)`;
                codeEl.value = `// Error: No data found for center\n// Center: ${centerName}\n// Center ID: ${centerId}`;
                return;
            }
            
            // Filter programs to show only featured programs for this center
            if (centerData.programs && Array.isArray(centerData.programs)) {
                const center = centerData.center;
                const featuredProgramIds = center['FeaturedPrograms#Id'] || center.FeaturedProgramIds || [];
                const featuredPrograms = centerData.programs.filter(p => featuredProgramIds.includes(p.Id));
                centerData.programs = featuredPrograms;
            }
            
            const fullHTML = this.templateEngine.generateProfile(centerData, enabledSections);
            
            codeEl.value = fullHTML;
        } catch (error) {
            titleEl.textContent = `Full Page Output: ${centerName} (Error)`;
            codeEl.value = `// Error generating full page output:\n// ${error.message}\n\n// Stack trace:\n${error.stack}`;
        }
    }

    displayDataValues() {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        const centerName = this.currentCenter.name || this.currentCenter.Title;
        titleEl.textContent = `Data Values: ${centerName}`;
        
        const centerId = this.currentCenter.id || this.currentCenter.Id;
        const centerData = this.dataLoader.getCenterData(centerId);
        
        const output = [];
        output.push('='.repeat(80));
        output.push(`DATA STRUCTURE FOR: ${this.currentCenter.name}`);
        output.push('='.repeat(80));
        output.push('');
        
        // Center Info
        output.push('--- CENTER INFORMATION (data.center) ---');
        output.push(JSON.stringify(centerData.center || {}, null, 2));
        output.push('');
        
        // Schedules
        output.push(`--- PROGRAM SCHEDULES (data.schedules) - ${(centerData.schedules || []).length} items ---`);
        if (centerData.schedules && centerData.schedules.length > 0) {
            output.push(JSON.stringify(centerData.schedules, null, 2));
        } else {
            output.push('⚠️ No schedules available for this center');
        }
        output.push('');
        
        // Leaders
        output.push(`--- STAFF & COMMUNITY LEADERS (data.leaders) - ${(centerData.leaders || []).length} items ---`);
        if (centerData.leaders && centerData.leaders.length > 0) {
            output.push(JSON.stringify(centerData.leaders, null, 2));
        } else {
            output.push('⚠️ No leaders available for this center');
        }
        output.push('');
        
        // Photos
        output.push(`--- PHOTOS (data.photos) ---`);
        if (centerData.photos) {
            output.push(JSON.stringify(centerData.photos, null, 2));
        } else {
            output.push('⚠️ No custom photos - using defaults');
        }
        output.push('');
        
        // Hours
        output.push(`--- HOURS OF OPERATION (data.hours) ---`);
        if (centerData.hours) {
            output.push(JSON.stringify(centerData.hours, null, 2));
        } else {
            output.push('⚠️ No hours available for this center');
        }
        output.push('');
        
        // Facilities
        output.push(`--- FACILITY FEATURES (data.facilityFeatures) - ${(centerData.facilityFeatures || []).length} items ---`);
        if (centerData.facilityFeatures && centerData.facilityFeatures.length > 0) {
            output.push(JSON.stringify(centerData.facilityFeatures, null, 2));
        } else {
            output.push('⚠️ No facility features available for this center');
        }
        output.push('');
        
        // Programs
        output.push(`--- FEATURED PROGRAMS (data.programDetails) - ${(centerData.programDetails || []).length} items ---`);
        if (centerData.programDetails && centerData.programDetails.length > 0) {
            output.push(JSON.stringify(centerData.programDetails, null, 2));
        } else {
            output.push('⚠️ No programs available for this center');
        }
        output.push('');
        
        output.push('='.repeat(80));
        
        codeEl.value = output.join('\n');
    }

    displaySectionDataMap(sectionKey, hasCenter = false) {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        titleEl.textContent = `Data Mapping: ${sectionKey}`;
        
        const dataMap = this.getSectionDataMap(sectionKey);
        
        const output = [];
        output.push('═'.repeat(80));
        output.push(`DATA MAPPING FOR SECTION: ${sectionKey.toUpperCase()}`);
        output.push('═'.repeat(80));
        output.push('');
        output.push('This shows which JSON data sources are used in this section:');
        output.push('');
        
        // Display data sources
        output.push('📊 DATA SOURCES USED:');
        output.push('─'.repeat(80));
        dataMap.sources.forEach(source => {
            output.push(`\n  ${source.icon} ${source.name}`);
            output.push(`  📁 File: ${source.file}`);
            output.push(`  🔗 Access: ${source.path}`);
            
            if (hasCenter && this.currentCenter) {
                const centerData = this.dataLoader.getCenterData(this.currentCenter.sharePointId);
                const value = this.getDataValue(centerData, source.path);
                
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        output.push(`  ✅ Status: ${value.length} items found`);
                        if (value.length > 0) {
                            output.push(`  📝 Sample: ${JSON.stringify(value[0], null, 4).split('\n').join('\n      ')}`);
                        }
                    } else if (typeof value === 'object') {
                        output.push(`  ✅ Status: Object with ${Object.keys(value).length} properties`);
                        output.push(`  📝 Value: ${JSON.stringify(value, null, 4).split('\n').join('\n      ')}`);
                    } else {
                        output.push(`  ✅ Status: Value found`);
                        output.push(`  📝 Value: "${value}"`);
                    }
                } else {
                    output.push(`  ⚠️  Status: No data available for this center`);
                }
            } else {
                output.push(`  📋 Example: ${source.example}`);
            }
        });
        
        output.push('\n');
        output.push('─'.repeat(80));
        output.push('🎯 TEMPLATE PLACEHOLDERS USED:');
        output.push('─'.repeat(80));
        dataMap.placeholders.forEach(placeholder => {
            output.push(`  • ${placeholder}`);
        });
        
        output.push('\n');
        output.push('═'.repeat(80));
        
        codeEl.value = output.join('\n');
    }

    displayFullDataMap(hasCenter = false) {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        titleEl.textContent = 'Full Page Data Mapping';
        
        const output = [];
        output.push('═'.repeat(80));
        output.push('COMPLETE DATA MAPPING - ALL SECTIONS');
        output.push('═'.repeat(80));
        output.push('');
        output.push('This shows the complete data flow from JSON files to HTML sections:');
        output.push('');
        
        const sections = ['about', 'schedules', 'hours', 'facilities', 'programs', 
                         'staff', 'events', 'infopages', 'stories', 'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'];
        
        sections.forEach((section, index) => {
            const dataMap = this.getSectionDataMap(section);
            
            output.push(`\n${index + 1}. ${section.toUpperCase()}`);
            output.push('─'.repeat(80));
            output.push(`   📦 Data Sources (${dataMap.sources.length}):`);
            dataMap.sources.forEach(source => {
                output.push(`      ${source.icon} ${source.name} → ${source.path}`);
            });
            output.push(`   🏷️  Placeholders (${dataMap.placeholders.length}):`);
            dataMap.placeholders.slice(0, 5).forEach(placeholder => {
                output.push(`      • ${placeholder}`);
            });
            if (dataMap.placeholders.length > 5) {
                output.push(`      ... and ${dataMap.placeholders.length - 5} more`);
            }
        });
        
        output.push('\n');
        output.push('═'.repeat(80));
        output.push('📁 JSON FILES SUMMARY:');
        output.push('═'.repeat(80));
        output.push('  • units-rsyc-profiles.json - Center information');
        output.push('  • RSYCProgramSchedules.json - Program schedules');
        output.push('  • RSYCLeaders.json - Staff and leadership');
        output.push('  • RSYCHours.json - Hours of operation');
        output.push('  • RSYCFacilityFeatures.json - Facility features');
        output.push('  • RSYCPrograms.json - Program details');
        output.push('  • RSYCHomepagePhotos.json - Custom photos');
        output.push('');
        
        codeEl.value = output.join('\n');
    }

    getDataValue(data, path) {
        try {
            const parts = path.split('.');
            let value = data;
            for (const part of parts) {
                if (part.includes('[')) {
                    const [key, index] = part.replace(']', '').split('[');
                    value = value[key][parseInt(index)];
                } else {
                    value = value[part];
                }
            }
            return value;
        } catch (e) {
            return undefined;
        }
    }

    getSectionDataMap(sectionKey) {
        const dataMaps = {
            hero: {
                sources: [
                    { icon: '🏢', name: 'Center Info', file: 'units-rsyc-profiles.json', path: 'center.name', example: '"Red Shield Youth Center"' },
                    { icon: '🏢', name: 'Center City', file: 'units-rsyc-profiles.json', path: 'center.city', example: '"Charlotte"' },
                    { icon: '🏢', name: 'Center State', file: 'units-rsyc-profiles.json', path: 'center.state', example: '"NC"' },
                    { icon: '🏢', name: 'Center Zip', file: 'units-rsyc-profiles.json', path: 'center.zip', example: '"28202"' },
                    { icon: '🔗', name: 'Website URL', file: 'units-rsyc-profiles.json', path: 'center.websiteURL', example: '"https://..."' }
                ],
                placeholders: ['${center.name}', '${center.city}', '${center.state}', '${center.zip}', '${center.websiteURL}']
            },
            about: {
                sources: [
                    { icon: '📝', name: 'About Text', file: 'units-rsyc-profiles.json', path: 'center.aboutText', example: '"Welcome to our center..."' },
                    { icon: '📸', name: 'Exterior Photo (custom)', file: 'RSYCHomepagePhotos.json', path: 'photos.urlExteriorPhoto', example: '"https://..."' },
                    { icon: '📸', name: 'Exterior Photo (default)', file: 'Template default', path: 'N/A', example: 'Empty string (no default image)' }
                ],
                placeholders: ['${center.aboutText}', '${photos.urlExteriorPhoto}', '${makeContactsClickable()}']
            },
            schedules: {
                sources: [
                    { icon: '📅', name: 'Schedules Array', file: 'RSYCProgramSchedules.json', path: 'schedules', example: '[{title, ageRange, days...}]' },
                    { icon: '📅', name: 'Schedule Title', file: 'RSYCProgramSchedules.json', path: 'schedules[0].title', example: '"After School Program"' },
                    { icon: '📅', name: 'Age Range', file: 'RSYCProgramSchedules.json', path: 'schedules[0].ageRange', example: '"6-12 years"' },
                    { icon: '📅', name: 'Days', file: 'RSYCProgramSchedules.json', path: 'schedules[0].days', example: '"Mon-Fri"' },
                    { icon: '📅', name: 'Start Time', file: 'RSYCProgramSchedules.json', path: 'schedules[0].startTime', example: '"3:00 PM"' },
                    { icon: '📅', name: 'End Time', file: 'RSYCProgramSchedules.json', path: 'schedules[0].endTime', example: '"6:00 PM"' }
                ],
                placeholders: ['${schedules.length}', '${schedule.title}', '${schedule.ageRange}', '${schedule.days}', '${schedule.startTime}', '${schedule.endTime}']
            },
            hours: {
                sources: [
                    { icon: '🕐', name: 'Hours Data', file: 'RSYCHours.json', path: 'hours', example: '{regularHours: {...}, summerHours: {...}}' },
                    { icon: '🕐', name: 'Regular Hours', file: 'RSYCHours.json', path: 'hours.regularHours', example: '{monday: {open, close}...}' },
                    { icon: '🕐', name: 'Summer Hours', file: 'RSYCHours.json', path: 'hours.summerHours', example: '{monday: {open, close}...}' }
                ],
                placeholders: ['${hours.regularHours}', '${hours.summerHours}', '${day.open}', '${day.close}']
            },
            facilities: {
                sources: [
                    { icon: '🏗️', name: 'Facilities Array', file: 'RSYCFacilityFeatures.json', path: 'facilityFeatures', example: '[{feature, biClass...}]' },
                    { icon: '🏗️', name: 'Feature Name', file: 'RSYCFacilityFeatures.json', path: 'facilityFeatures[0].feature', example: '"Basketball Court"' },
                    { icon: '🏗️', name: 'Icon Class', file: 'RSYCFacilityFeatures.json', path: 'facilityFeatures[0].biClass', example: '"bi-basketball"' },
                    { icon: '📸', name: 'Exterior Photo (custom)', file: 'RSYCHomepagePhotos.json', path: 'photos.urlExteriorPhoto', example: '"https://..."' },
                    { icon: '📸', name: 'Exterior Photo (default)', file: 'Template default', path: 'N/A', example: 'Empty string (no default image)' }
                ],
                placeholders: ['${facilityFeatures.length}', '${feature.feature}', '${feature.biClass}', '${photos.urlExteriorPhoto}']
            },
            programs: {
                sources: [
                    { icon: '🎯', name: 'Programs Array', file: 'RSYCPrograms.json', path: 'programDetails', example: '[{name, iconClass...}]' },
                    { icon: '🎯', name: 'Program Name', file: 'RSYCPrograms.json', path: 'programDetails[0].name', example: '"Youth Sports"' },
                    { icon: '🎯', name: 'Icon Class', file: 'RSYCPrograms.json', path: 'programDetails[0].iconClass', example: '"bi-basketball"' },
                    { icon: '📸', name: 'Programs Photo (custom)', file: 'RSYCHomepagePhotos.json', path: 'photos.urlProgramsPhoto', example: '"https://..."' },
                    { icon: '📸', name: 'Programs Photo (default)', file: 'rsyc-templates.js line 127', path: 'hardcoded', example: '"https://s3.amazonaws.com/uss-cache.salvationarmy.org/c11a1b73-6893-4eb4-a24c-8ecf98058b14_484033880_1061382646027353_8208563035826151450_n.jpg"' }
                ],
                placeholders: ['${programDetails.length}', '${program.name}', '${program.iconClass}', '${photos.urlProgramsPhoto}']
            },
            staff: {
                sources: [
                    { icon: '👥', name: 'Leaders Array', file: 'RSYCLeaders.json', path: 'leaders', example: '[{name, title, bio...}]' },
                    { icon: '👥', name: 'Leader Name', file: 'RSYCLeaders.json', path: 'leaders[0].name', example: '"John Smith"' },
                    { icon: '👥', name: 'Leader Title', file: 'RSYCLeaders.json', path: 'leaders[0].title', example: '"Program Director"' },
                    { icon: '👥', name: 'Leader Bio', file: 'RSYCLeaders.json', path: 'leaders[0].bio', example: '"John has 10 years..."' }
                ],
                placeholders: ['${leaders.length}', '${leader.name}', '${leader.title}', '${leader.bio}']
            },
            events: {
                sources: [
                    { icon: '📅', name: 'Events Array', file: 'RSYCEvents.json', path: 'events', example: '[{title, date, location...}]' },
                    { icon: '📅', name: 'Event Title', file: 'RSYCEvents.json', path: 'event.title', example: '"Christmas Concert"' },
                    { icon: '📸', name: 'Event Image', file: 'RSYCEvents.json', path: 'event.imageUrl', example: '"https://..."' }
                ],
                placeholders: ['${events.length}', '${evt.title}', '${evt.description}', '${evt.primaryButtonUrl}']
            },
            infopages: {
                sources: [
                    { icon: '📘', name: 'Info Pages Array', file: 'RSYCInformationalPages.json', path: 'informationalPages', example: '[{title, category, body...}]' },
                    { icon: '📘', name: 'Page Title', file: 'RSYCInformationalPages.json', path: 'page.title', example: '"Safety Guidelines"' },
                    { icon: '📘', name: 'Category', file: 'RSYCInformationalPages.json', path: 'page.category', example: '"Safety"' }
                ],
                placeholders: ['${informationalPages.length}', '${page.title}', '${page.body}', '${page.externalUrl}']
            },
            stories: {
                sources: [
                    { icon: '📖', name: 'Stories Array', file: 'RSYCStories.json', path: 'stories', example: '[{title, body, imageUrl...}]' },
                    { icon: '📖', name: 'Story Title', file: 'RSYCStories.json', path: 'story.title', example: '"Mark\'s Journey"' },
                    { icon: '📸', name: 'Story Image', file: 'RSYCStories.json', path: 'story.imageUrl', example: '"https://..."' }
                ],
                placeholders: ['${stories.length}', '${story.title}', '${story.body}', '${story.imageUrl}']
            },
            nearby: {
                sources: [
                    { icon: '📍', name: 'Nearby Centers Array', file: 'units-rsyc-profiles.json', path: 'center.nearestCenters', example: '[{name, city...}]' },
                    { icon: '📍', name: 'Center Name', file: 'units-rsyc-profiles.json', path: 'nearbyCenter.name', example: '"Another RSYC"' },
                    { icon: '📍', name: 'Center City', file: 'units-rsyc-profiles.json', path: 'nearbyCenter.city', example: '"Charlotte"' }
                ],
                placeholders: ['${nearbyCenter.name}', '${nearbyCenter.city}', '${nearbyCenter.distance}']
            },
            parents: {
                sources: [
                    { icon: '👨‍👩‍👧', name: 'Center Name', file: 'units-rsyc-profiles.json', path: 'center.name', example: '"Red Shield Youth Center"' }
                ],
                placeholders: ['${center.name}', 'Static modal content (A Place for Growth, Safety Policies)']
            },
            youth: {
                sources: [
                    { icon: '🧒', name: 'Center Name', file: 'units-rsyc-profiles.json', path: 'center.name', example: '"Red Shield Youth Center"' }
                ],
                placeholders: ['${center.name}', 'Static content (Getting Started section)']
            },
            volunteer: {
                sources: [
                    { icon: '🤝', name: 'Volunteer Text', file: 'units-rsyc-profiles.json', path: 'center.volunteerText', example: '"Join our team..."' },
                    { icon: '🤝', name: 'Center Name', file: 'units-rsyc-profiles.json', path: 'center.name', example: '"Red Shield Youth Center"' }
                ],
                placeholders: ['${center.volunteerText}', '${center.name}', '${makeContactsClickable()}']
            },
            footerPhoto: {
                sources: [
                    { icon: '📸', name: 'Footer Photo (custom)', file: 'RSYCHomepagePhotos.json', path: 'photos.urlFooterPhoto', example: '"https://..."' },
                    { icon: '📸', name: 'Footer Photo (default)', file: 'Template default', path: 'N/A', example: 'Empty string (no default image)' }
                ],
                placeholders: ['${photos.urlFooterPhoto}']
            },
            contact: {
                sources: [
                    { icon: '📖', name: 'Scripture', file: 'units-rsyc-profiles.json', path: 'center.scripture', example: '"I give you a new command..."' },
                    { icon: '📖', name: 'Scripture Reference', file: 'units-rsyc-profiles.json', path: 'center.scriptureReference', example: '"John 13:34 (ICB)"' }
                ],
                placeholders: ['${center.scripture}', '${center.scriptureReference}']
            }
        };
        
        return dataMaps[sectionKey] || { sources: [], placeholders: [] };
    }

    /**
     * Find schedule horizontal-scroll containers and set all schedule-card widths
     * to the widest of the first three cards when on small viewports. This
     * ensures that on mobile (where only 1-2 cards may be visible) the cards
     * appear consistent and avoid awkward wrapping from differing content length.
     */
    adjustScheduleCardWidths() {
        try {
            const containers = Array.from(document.querySelectorAll('#freeTextArea-schedules .horizontal-scroll'));
            if (!containers.length) return;

            containers.forEach(container => {
                const cards = Array.from(container.querySelectorAll('.schedule-card'));
                if (!cards.length) return;

                // Ensure every schedule card has the Bootstrap h-100 utility so
                // cards expand to full available height (helps when some cards
                // have more content than others). Also ensure they stretch in
                // the cross-axis for flexbox layouts.
                cards.forEach(c => {
                    try {
                        c.classList.add('h-100');
                        c.style.alignSelf = 'stretch';
                    } catch (e) {}
                });

                // Measure first up to 3 cards (if present)
                const firstThree = cards.slice(0, 3);
                const widths = firstThree.map(c => {
                    // ensure element is in layout
                    try { return c.getBoundingClientRect().width; } catch (e) { return 0; }
                }).filter(w => w > 0);
                if (!widths.length) return;

                const maxWidth = Math.max(...widths);

                // Apply only for viewports that typically show up to 3 cards (mobile/tablet narrow)
                // Use 991px as an upper bound so small tablets/large phones are covered.
                // Width adjustments only for small viewports (keep desktop flexible)
                if (window.innerWidth <= 991) {
                    // Only set the first three cards to the computed max width so the
                    // visible set appears consistent. Leave later cards flexible.
                    firstThree.forEach(c => {
                        c.style.width = Math.max(maxWidth, 0) + 'px';
                        c.style.flex = '0 0 ' + Math.max(maxWidth, 0) + 'px';
                    });
                } else {
                    // Clear inline width/flex sizing on larger viewports
                    cards.forEach(c => {
                        c.style.width = '';
                        c.style.flex = '';
                    });
                }

                // Normalize heights across ALL viewports: compute tallest card and apply
                // that height to all cards so they appear uniform regardless of content length.
                try {
                    const heights = cards.map(c => {
                        try { return c.getBoundingClientRect().height; } catch (e) { return 0; }
                    }).filter(h => h > 0);
                    if (heights.length) {
                        const maxH = Math.max(...heights);
                        cards.forEach(c => { c.style.height = maxH + 'px'; c.style.minHeight = maxH + 'px'; });
                    }
                } catch (e) { /* ignore */ }
            });
        } catch (e) {
            // Do not block main flow
            console.warn('adjustScheduleCardWidths failed:', e);
        }
    }

    displaySectionTemplate(sectionKey) {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        // Get the method source code from the template engine
        const methodName = 'generate' + sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
        const method = this.templateEngine[methodName];
        
        if (method) {
            titleEl.textContent = `Template: ${sectionKey} (${methodName})`;
            codeEl.value = this.formatMethodSource(method);
        } else {
            titleEl.textContent = `Template: ${sectionKey} - Not Found`;
            codeEl.value = `// No template method found for: ${methodName}`;
        }
    }

    displayFullPageTemplate() {
        const titleEl = document.getElementById('currentSectionTitle');
        const codeEl = document.getElementById('templateCodeDisplay');
        
        titleEl.textContent = 'Full Page Template Code (All Sections Combined)';
        
        // Get all section templates
        const sections = ['about', 'schedules', 'hours', 'facilities', 'programs', 
                         'staff', 'events', 'infopages', 'stories', 'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'];
        
        const allTemplates = [];
        
        sections.forEach(sectionKey => {
            const methodName = 'generate' + sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
            const method = this.templateEngine[methodName];
            
            if (method) {
                allTemplates.push(`// ============================================================`);
                allTemplates.push(`// SECTION: ${sectionKey.toUpperCase()}`);
                allTemplates.push(`// METHOD: ${methodName}`);
                allTemplates.push(`// ============================================================`);
                allTemplates.push('');
                allTemplates.push(this.formatMethodSource(method));
                allTemplates.push('');
                allTemplates.push('');
            }
        });
        
        codeEl.value = allTemplates.join('\n');
    }

    formatMethodSource(method) {
        // Convert function to string to show the template code
        let source = method.toString();
        
        // Remove the function wrapper to show just the template
        source = source.replace(/^[^{]*\{/, ''); // Remove "function(...) {"
        source = source.replace(/\}[^}]*$/, ''); // Remove final "}"
        
        // Clean up indentation
        const lines = source.split('\n');
        const minIndent = Math.min(
            ...lines
                .filter(line => line.trim().length > 0)
                .map(line => line.match(/^\s*/)[0].length)
        );
        
        const cleanedLines = lines.map(line => 
            line.substring(minIndent)
        );
        
        return cleanedLines.join('\n').trim();
    }

    injectGlobalStyles() {
        // Inject global CSS into the page so it's always available
        const styleElement = document.getElementById('globalStyles');
        if (styleElement) {
            styleElement.textContent = this.getGlobalCSS();
        }
    }

    /**
     * Get Global CSS for CMS
     * 
     * VERSION TRACKING INSTRUCTIONS:
     * When you need to add NEW CSS rules that should be in the CMS global styles:
     * 1. Update the version number below (increment minor version for new styles)
     * 2. Update the lastUpdated date
     * 3. Add entry to VERSION HISTORY section in the CSS output
     * 4. Add your new CSS in the appropriate section with clear comments
     * 5. Notify staff to copy the updated CSS to CMS global styles
     * 
     * Current Version: 1.0.0
     * Last Updated: 2025-11-15
     */
    getGlobalCSS() {
        const version = "1.0.0"; // Update this when adding new styles
        const lastUpdated = "2025-11-15";
        
        return `/* ========================================
   RSYC Profile - Global CSS for CMS
   Version: ${version}
   Last Updated: ${lastUpdated}
   
   Add this ENTIRE section to your CMS global styles.
   This CSS is required for RSYC profiles to work correctly.
   ======================================== */

/* VERSION HISTORY:
   v1.0.0 (2025-11-15) - Initial release
   - Tooltip styles for schedule cards
   - Horizontal scroll styling
   - Dark text on white schedule cards
   - Staff bio scrollable text (4 lines)
   - Modal styles for features/programs
*/

/* ========================================
   TOOLTIP STYLES
   Required for schedule card tooltips
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

/* ========================================
   HORIZONTAL SCROLL STYLES
   Required for schedule card scrolling
   ======================================== */

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

/* ========================================
   SCHEDULE CARD TEXT STYLES
   Required for readable text on schedule cards
   ======================================== */

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

/* ========================================
   STAFF BIO SCROLLABLE TEXT
   Required for staff bios to scroll after 4 lines
   ======================================== */

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
   MODAL STYLES
   Required for "View All Features/Programs" modals
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
   Button Styles - Outline Primary (ADDED 2025-11-14)
   Red hover effect for schedule buttons
   ======================================== */
.btn.btn-outline-primary,
button.btn-outline-primary {
    color: #2F4857 !important;
    border-color: #2F4857 !important;
    background-color: transparent !important;
    transition: all 0.3s ease;
}

.btn.btn-outline-primary:hover,
.btn.btn-outline-primary:focus,
.btn.btn-outline-primary:active,
.btn.btn-outline-primary.active,
button.btn-outline-primary:hover,
button.btn-outline-primary:focus,
button.btn-outline-primary:active,
button.btn-outline-primary.active {
    background-color: #EF3D42 !important;
    color: #fff !important;
    border-color: #EF3D42 !important;
    transform: translateY(-5px);
    box-shadow: 0 1rem 2rem rgba(0,0,0,0.1);
}

.btn.btn-outline-primary:focus-visible,
button.btn-outline-primary:focus-visible {
    outline: 2px solid #EF3D42;
    outline-offset: 2px;
}
/* ======================================== END ADDED STYLES ======================================== */

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

    /**
     * Save custom CSS with automatic version and date tracking
     */
    async saveCustomCSS() {
        const content = document.getElementById('cssModalContent');
        if (!content) return;

        const newCSS = content.value;
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Get the Symphony CSS link from the info box
        const symphonyLinkCode = document.getElementById('symphonyLinkCode');
        const symphonyLink = symphonyLinkCode ? symphonyLinkCode.textContent : '';
        
        // Update the version header with new date
        let updatedCSS = newCSS;
        
        // Find and update "Last Updated" date in header (HTML comment format)
        const lastUpdatedPattern = /Last Updated:\s*\d{4}-\d{2}-\d{2}/;
        if (lastUpdatedPattern.test(updatedCSS)) {
            updatedCSS = updatedCSS.replace(lastUpdatedPattern, `Last Updated: ${timestamp}`);
        }
        
        // Add entry to CHANGE LOG if needed (HTML comment format)
        const changeLogPattern = /CHANGE LOG:([\s\S]*?)-->/;
        const changeLogMatch = updatedCSS.match(changeLogPattern);
        
        if (changeLogMatch) {
            const currentLog = changeLogMatch[1];
            // Check if today's date already exists in changelog
            if (!currentLog.includes(timestamp)) {
                // Add new entry at the top of the changelog
                const newEntry = `\n   ${timestamp} - Updated custom styles`;
                const newChangeLog = `CHANGE LOG:${newEntry}${currentLog}-->`;
                updatedCSS = updatedCSS.replace(changeLogPattern, newChangeLog);
            }
        }
        
        // Re-add Symphony CSS link after the header comments
        if (symphonyLink) {
            // Find where to insert (after the header comment block ending)
            const headerEndPattern = /(<!-- Update this file to apply changes to all generated profiles -->)/;
            if (headerEndPattern.test(updatedCSS)) {
                updatedCSS = updatedCSS.replace(headerEndPattern, `$1\n\n${symphonyLink}`);
            }
        }
        
        // Update in-memory cache
        this.customStyles = updatedCSS;
        content.value = updatedCSS;
        
        // Show save confirmation
        const saveBtn = document.getElementById('saveCSSContent');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '✓ Saved!';
            saveBtn.style.background = '#28a745';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '#007bff';
            }, 2000);
        }
        
        // Update history display
        this.displayCSSHistory();
        
        // Download updated file for user to replace rsyc-custom-styles.html
        this.downloadCustomCSS(updatedCSS, timestamp);
        
        alert(`✓ CSS saved with timestamp: ${timestamp}\n\nDownloading updated file. Please replace your rsyc-custom-styles.html file with this version.`);
    }

    /**
     * Download custom CSS file
     */
    downloadCustomCSS(cssContent, timestamp) {
        const blob = new Blob([cssContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsyc-custom-styles-${timestamp}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Display CSS update history from CHANGE LOG
     */
    displayCSSHistory() {
        const historyDiv = document.getElementById('cssUpdateHistory');
        const historyList = document.getElementById('cssHistoryList');
        
        if (!historyDiv || !historyList || !this.customStyles) return;
        
        // Extract CHANGE LOG section (HTML comment format)
        const changeLogPattern = /CHANGE LOG:([\s\S]*?)-->/;
        const changeLogMatch = this.customStyles.match(changeLogPattern);
        
        if (!changeLogMatch) {
            historyDiv.style.display = 'none';
            return;
        }
        
        // Parse changelog entries (format: "   YYYY-MM-DD - Description")
        const entries = changeLogMatch[1]
            .split('\n')
            .filter(line => line.trim() && line.includes('-'))
            .map(line => line.trim())
            .slice(0, 5); // Show only most recent 5
        
        if (entries.length === 0) {
            historyDiv.style.display = 'none';
            return;
        }
        
        // Display entries
        historyList.innerHTML = entries.map(entry => 
            `<div style="padding:3px 0;">📅 ${entry}</div>`
        ).join('');
        
        historyDiv.style.display = 'block';
    }

    // Removed markAsPublished() function - button removed from UI

    enableButtons() {
        document.getElementById('generateHTML').disabled = false;
        document.getElementById('copyHTML').disabled = false;
        document.getElementById('downloadHTML').disabled = false;
        document.getElementById('downloadWithOG').disabled = false;
    }

    disableButtons() {
        document.getElementById('generateHTML').disabled = true;
        document.getElementById('copyHTML').disabled = true;
        document.getElementById('downloadHTML').disabled = true;
        document.getElementById('downloadWithOG').disabled = true;
        // Note: viewDataStructure is always enabled (shows templates when no center selected)
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
    window.rsycGen = window.rsycApp;  // Alias for template functions to access generator instance
    
    // ADDED 2025-11-15: Toggle advanced controls
    const toggleBtn = document.getElementById('toggleAdvanced');
    const advancedControls = document.getElementById('advancedControls');
    
    if (toggleBtn && advancedControls) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = advancedControls.style.display === 'none' || advancedControls.style.display === '';
            advancedControls.style.display = isHidden ? 'block' : 'none';
            toggleBtn.classList.toggle('expanded', isHidden);
            toggleBtn.innerHTML = isHidden 
                ? '<i class="bi bi-chevron-up"></i> Hide Options'
                : '<i class="bi bi-chevron-down"></i> More Options';
        });
    }
    // END ADDED 2025-11-15
});

