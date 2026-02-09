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
            // Pre-process center content (aboutText, volunteerText) into clickable links
            try {
                this.processAllCenterContacts();
            } catch (e) {
                console.warn('Failed to pre-process center contacts:', e);
            }
            
            // Populate center dropdown
            this.populateCenterDropdown();
            
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

                // Reload all JSON from remote sources
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
            return;
        }
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
            
            // Update live preview (custom styles already injected globally in page head)
            this.updatePreview(html);
            
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
            const modal = previewContainer.querySelector('#rsyc-modal-' + type);
            if (modal) {
                modal.style.display = 'flex';
            }
        };

        window.closeRSYCModal = (type) => {
            const modal = previewContainer.querySelector('#rsyc-modal-' + type);
            if (modal) {
                modal.style.display = 'none';
            }
        };

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
    showDataAuditModal() {
        // Remove existing modal if present
        const existing = document.getElementById('dataAuditModal');
        if (existing) existing.remove();

        const centers = this.dataLoader.cache.centers || [];
        const schedules = this.dataLoader.cache.schedules || [];
        const leaders = this.dataLoader.cache.leaders || [];
        const photos = this.dataLoader.cache.photos || [];
        const hours = this.dataLoader.cache.hours || [];

        // Helper: normalize hour strings for robust comparison
        const normalizeHourValue = (v) => {
            if (v === null || v === undefined) return '';
            let s = String(v).trim();
            if (!s) return '';
            // Treat explicit 'closed' as empty
            if (/^closed$/i.test(s)) return '';
            // Normalize various dashes to simple hyphen
            s = s.replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');
            // Normalize spacing around hyphen
            s = s.replace(/\s*-\s*/g, ' - ');
            // Collapse multiple spaces
            s = s.replace(/\s+/g, ' ');
            // Upper-case AM/PM markers
            s = s.replace(/\b(am|pm)\b/ig, (m) => m.toUpperCase());
            return s;
        };

        // Canonical default Symphony hours (normalized)
        const defaultRegular = {
            monday: normalizeHourValue('2:00 PM - 7:30 PM'),
            tuesday: normalizeHourValue('2:00 PM - 7:30 PM'),
            wednesday: normalizeHourValue('2:00 PM - 7:30 PM'),
            thursday: normalizeHourValue('2:00 PM - 7:30 PM'),
            friday: normalizeHourValue('2:00 PM - 7:30 PM'),
            saturday: normalizeHourValue(''),
            sunday: normalizeHourValue('')
        };
        const defaultSummer = {
            monday: normalizeHourValue('7:30 AM - 5:30 PM'),
            tuesday: normalizeHourValue('7:30 AM - 5:30 PM'),
            wednesday: normalizeHourValue('7:30 AM - 5:30 PM'),
            thursday: normalizeHourValue('7:30 AM - 5:30 PM'),
            friday: normalizeHourValue('7:30 AM - 5:30 PM'),
            saturday: normalizeHourValue(''),
            sunday: normalizeHourValue('')
        };

        const isDefaultHoursRecord = (h) => {
            if (!h) return false;
            try {
                const rh = h.regularHours || {};
                const sh = h.summerHours || {};
                const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                for (const d of days) {
                    const a = normalizeHourValue(rh[d]);
                    const b = defaultRegular[d];
                    if (a !== b) return false;
                }
                for (const d of days) {
                    const a = normalizeHourValue(sh[d]);
                    const b = defaultSummer[d];
                    if (a !== b) return false;
                }
                return true;
            } catch (e) {
                return false;
            }
        };

        // Compute per-center indicators
        const rows = centers.map(c => {
            const spId = c.sharePointId;
            const hasAbout = !!(c.aboutText && String(c.aboutText).trim());
            const hasVolunteer = !!(c.volunteerText && String(c.volunteerText).trim());
            const schedCount = schedules.filter(s => s.centerId == spId).length;
            const leaderCount = leaders.filter(l => (l.centerIds || []).includes(spId)).length;
            // Count distinct populated photo URL fields for this center across photo records
            const photosForCenter = photos.filter(p => p.centerId == spId);
            const urlFields = ['urlExteriorPhoto','urlFacilityFeaturesPhoto','urlProgramsPhoto','urlNearbyCentersPhoto','urlParentsSectionPhoto','urlYouthSectionPhoto','urlGetInvolvedPhoto','urlFooterPhoto'];
            const urlSet = new Set();
            photosForCenter.forEach(p => {
                urlFields.forEach(f => {
                    const v = (p && p[f]) ? String(p[f]).trim() : '';
                    if (v) urlSet.add(v);
                });
            });
            const photoCount = urlSet.size;
            const hasFooterPhoto = photosForCenter.some(p => {
                const v = (p && p.urlFooterPhoto) ? String(p.urlFooterPhoto).trim() : '';
                return !!v;
            });
            const hasFooterScripture = !!(c.scripture && String(c.scripture).trim());
            const hoursForCenter = hours.find(h => h.centerId == spId);
            // Consider hours 'custom' only when an hours record exists AND it does not match the
            // canonical Symphony default hours block. If it matches the default (no changes),
            // treat as no custom hours.
            let hasHours = !!hoursForCenter;
            if (hasHours && isDefaultHoursRecord(hoursForCenter)) {
                hasHours = false;
            }
            const facilityCount = (c.facilityFeatures || []).length;
            const programCount = (c.featuredPrograms || []).length;
            return {
                id: c.id || c.Id,
                sharePointId: spId,
                name: c.name || c.Title || '(unnamed)',
                hasAbout,
                hasVolunteer,
                hasFooterPhoto,
                hasFooterScripture,
                schedCount,
                leaderCount,
                photoCount,
                hasHours,
                facilityCount,
                programCount
            };
        });

        // Aggregate counts: both number of centers with data and total item counts
        // Also compute distinct counts for facility features and featured programs
        const facilitySet = new Set();
        const programSet = new Set();
        centers.forEach(c => {
            const feats = c.facilityFeatures || [];
            feats.forEach(f => {
                const fid = f && (f.id || f.Id || f.FeatureId || f.featureId || f.name || f.Name || f.Title) || (f ? JSON.stringify(f) : null);
                if (fid !== undefined && fid !== null) facilitySet.add(String(fid));
            });
            const progs = c.featuredPrograms || [];
            progs.forEach(p => {
                const pid = p && (p.id || p.Id || p.ProgramId || p.programId || p.name || p.Name || p.Title) || (p ? JSON.stringify(p) : null);
                if (pid !== undefined && pid !== null) programSet.add(String(pid));
            });
        });

        const aggregates = {
            centers: centers.length,
            about: rows.filter(r => r.hasAbout).length,
            volunteers: rows.reduce((s, r) => s + (r.hasVolunteer ? 1 : 0), 0),
            footerPhoto: rows.reduce((s, r) => s + (r.hasFooterPhoto ? 1 : 0), 0),
            footerScripture: rows.reduce((s, r) => s + (r.hasFooterScripture ? 1 : 0), 0),
            schedules_centers: rows.reduce((s, r) => s + (r.schedCount > 0 ? 1 : 0), 0),
            schedules_items: rows.reduce((s, r) => s + (r.schedCount || 0), 0),
            leaders_centers: rows.reduce((s, r) => s + (r.leaderCount > 0 ? 1 : 0), 0),
            leaders_items: rows.reduce((s, r) => s + (r.leaderCount || 0), 0),
            photos_centers: rows.reduce((s, r) => s + (r.photoCount > 0 ? 1 : 0), 0),
            photos_items: rows.reduce((s, r) => s + (r.photoCount || 0), 0),
            hours: rows.reduce((s, r) => s + (r.hasHours ? 1 : 0), 0),
            facilities_centers: rows.reduce((s, r) => s + (r.facilityCount > 0 ? 1 : 0), 0),
            facilities_items: rows.reduce((s, r) => s + (r.facilityCount || 0), 0),
            facilities_distinct: facilitySet.size,
            programs_centers: rows.reduce((s, r) => s + (r.programCount > 0 ? 1 : 0), 0),
            programs_items: rows.reduce((s, r) => s + (r.programCount || 0), 0),
            programs_distinct: programSet.size
        };

    // Build modal HTML
        const modal = document.createElement('div');
        modal.id = 'dataAuditModal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.background = 'rgba(0,0,0,0.6)';
        modal.style.zIndex = 12500;
        modal.style.overflow = 'auto';

        const modalInner = document.createElement('div');
        modalInner.style.background = 'white';
        modalInner.style.margin = '30px auto';
        modalInner.style.padding = '16px';
        modalInner.style.maxWidth = '1100px';
        modalInner.style.borderRadius = '8px';
        modalInner.style.boxShadow = '0 10px 40px rgba(0,0,0,0.25)';

        // Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '12px';
        header.innerHTML = `<h3 style="margin:0;">Data Audit — ${aggregates.centers} centers</h3>`;
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.className = 'btn btn-sm btn-danger';
        closeBtn.onclick = () => modal.remove();
        header.appendChild(closeBtn);

        // Summary counts
        const summary = document.createElement('div');
        summary.style.display = 'flex';
        summary.style.gap = '12px';
        summary.style.flexWrap = 'wrap';
        summary.style.marginBottom = '12px';
        const makeBadge = (label, centersCount, itemsCount) => {
            const itemsLine = (typeof itemsCount === 'number') ? `<div style='font-size:12px;color:#666;margin-top:4px'>${itemsCount} total</div>` : '';
            return `<div style="background:#f8f9fa;border:1px solid #e9ecef;padding:8px 10px;border-radius:6px;min-width:140px;text-align:center;margin-bottom:6px;">
                        <div style='font-size:12px;color:#666'>${label}</div>
                        <div style='font-weight:700;font-size:16px'>${centersCount} centers</div>
                        ${itemsLine}
                    </div>`;
        };

        summary.innerHTML =
            makeBadge('About', aggregates.about) +
            makeBadge('Schedules', aggregates.schedules_centers, aggregates.schedules_items) +
            makeBadge('Leaders', aggregates.leaders_centers, aggregates.leaders_items) +
            makeBadge('Volunteers', aggregates.volunteers) +
            makeBadge('Photos', aggregates.photos_centers, aggregates.photos_items) +
            makeBadge('Footer Photo', aggregates.footerPhoto) +
            makeBadge('Footer Scripture', aggregates.footerScripture) +
            makeBadge('Hours', aggregates.hours) +
            // Facility Features: show distinct and total
            `<div style="background:#f8f9fa;border:1px solid #e9ecef;padding:8px 10px;border-radius:6px;min-width:140px;text-align:center;margin-bottom:6px;">
                        <div style='font-size:12px;color:#666'>Facility Features</div>
                        <div style='font-weight:700;font-size:16px'>${aggregates.facilities_centers} centers</div>
                        <div style='font-size:12px;color:#666;margin-top:4px'>${aggregates.facilities_distinct} distinct • ${aggregates.facilities_items} total</div>
                    </div>` +
            // Featured Programs
            `<div style="background:#f8f9fa;border:1px solid #e9ecef;padding:8px 10px;border-radius:6px;min-width:140px;text-align:center;margin-bottom:6px;">
                        <div style='font-size:12px;color:#666'>Featured Programs</div>
                        <div style='font-weight:700;font-size:16px'>${aggregates.programs_centers} centers</div>
                        <div style='font-size:12px;color:#666;margin-top:4px'>${aggregates.programs_distinct} distinct • ${aggregates.programs_items} total</div>
                    </div>`;

        // Table
        const tableWrap = document.createElement('div');
        tableWrap.style.maxHeight = '60vh';
        tableWrap.style.overflow = 'auto';
        tableWrap.style.border = '1px solid #e9ecef';
        tableWrap.style.borderRadius = '6px';

        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.style.margin = '0';
        const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Center</th><th>About</th><th>Schedules</th><th>Leaders</th><th>Volunteer</th><th>Photos</th><th>Footer Photo</th><th>Footer Scripture</th><th>Hours</th><th>Features</th><th>Programs</th></tr>`;
        // Make header sticky so it stays visible while the table body scrolls
        thead.style.position = 'sticky';
        thead.style.top = '0';
        thead.style.zIndex = '5';
        thead.style.background = '#fff';
        thead.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
        // Ensure individual th cells also render with white background
        Array.from(thead.querySelectorAll('th')).forEach(th => {
            th.style.background = 'inherit';
            th.style.position = 'relative';
        });
        const tbody = document.createElement('tbody');

        // small HTML-escape helper (avoid depending on template engine here)
        const esc = (v) => {
            if (v === null || v === undefined) return '';
            return String(v)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        rows.forEach(r => {
            const tr = document.createElement('tr');
            // highlight currently selected center
            if (this.currentCenter && (this.currentCenter.id == r.id || this.currentCenter.Id == r.id || this.currentCenter.sharePointId == r.sharePointId)) {
                tr.style.background = '#f1f9ff';
            }
            tr.style.cursor = 'pointer';
            tr.onclick = () => {
                // Select center in dropdown and regenerate preview
                const dd = document.getElementById('centerSelect');
                if (dd) {
                    dd.value = r.id;
                    dd.dispatchEvent(new Event('change'));
                }
                modal.remove();
            };

            const yesNo = (v) => v ? '✓' : '';
            tr.innerHTML = `
                <td style="min-width:220px;"><i class="bi bi-mouse2" style="margin-right:8px;color:#007bff;"></i>${esc(r.name)}</td>
                <td style="text-align:center">${yesNo(r.hasAbout)}</td>
                <td style="text-align:center">${r.schedCount || ''}</td>
                <td style="text-align:center">${r.leaderCount || ''}</td>
                <td style="text-align:center">${yesNo(r.hasVolunteer)}</td>
                <td style="text-align:center">${r.photoCount || ''}</td>
                <td style="text-align:center">${yesNo(r.hasFooterPhoto)}</td>
                <td style="text-align:center">${yesNo(r.hasFooterScripture)}</td>
                <td style="text-align:center">${yesNo(r.hasHours)}</td>
                <td style="text-align:center">${r.facilityCount || ''}</td>
                <td style="text-align:center">${r.programCount || ''}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableWrap.appendChild(table);

        // Footer note
    const note = document.createElement('div');
    note.style.marginTop = '10px';
    note.style.color = '#666';
    note.style.fontSize = '13px';
    note.textContent = 'Click a row to select that center and open the live preview. Counts indicate presence or number of items in the dataset.';

        modalInner.appendChild(header);
        modalInner.appendChild(summary);
        modalInner.appendChild(tableWrap);
        modalInner.appendChild(note);
        modal.appendChild(modalInner);
        document.body.appendChild(modal);
    }

    createTemplateViewer(hasCenter = false) {
        // Build sections list; hide About button when a center is selected but About is empty
        let sections = [
            { key: 'about', name: 'About This Center' },
            { key: 'schedules', name: 'Program Schedules' },
            { key: 'hours', name: 'Hours of Operation' },
            { key: 'facilities', name: 'Facility Features' },
            { key: 'programs', name: 'Featured Programs' },
            { key: 'staff', name: 'Staff & Leadership' },
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
            const output = this.templateEngine.generateSection(sectionKey, centerData);
            
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
        output.push(`--- STAFF & LEADERS (data.leaders) - ${(centerData.leaders || []).length} items ---`);
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
                         'staff', 'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'];
        
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
                         'staff', 'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'];
        
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
    }

    disableButtons() {
        document.getElementById('generateHTML').disabled = true;
        document.getElementById('copyHTML').disabled = true;
        document.getElementById('downloadHTML').disabled = true;
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

