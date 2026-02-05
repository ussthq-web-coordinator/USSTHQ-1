/**
 * RSYC CMS Publisher - Embeddable Script for Center Pages
 * 
 * Usage: Add to your CMS page HTML:
 * <div id="rsyc-profile-container"></div>
 * <script src="rsyc-cms-publisher.js" data-center-id="YOUR_CENTER_ID"></script>
 * 
 * Or:
 * <script>
 *   window.RSYCPublisher.generate({
 *     centerId: 'YOUR_CENTER_ID',
 *     container: '#rsyc-profile-container',
 *     baseUrl: 'https://thisishoperva.org/rsyc/'
 *   });
 * </script>
 */

(function() {
    'use strict';

    const RSYCPublisher = {
        baseURL: 'https://thisishoperva.org/rsyc/',
        cache: {},
        
        /**
         * UNIFIED SECTION CONFIGURATION
         * Single source of truth for section ordering and selection.
         * Used by both rsyc-cms-publisher.js and rsyc-profile-injector.js
         * 
         * To change sections:
         *   - Edit 'default' to change which sections appear and their order
         *   - Edit 'critical' to change which sections load immediately (fast path)
         *   - Edit 'deferred' to change which sections load asynchronously
         * 
         * Changes here automatically update both the publisher and injector.
         */
        SECTION_CONFIG: {
            // Default sections in order (used when no sections specified)
            default: [
                'schedules', 'hours', 'facilities', 'programs', 'staff', 
                'nearby', 'parents', 'youth', 'volunteer', 'footerPhoto', 'contact'
            ],
            
            // Sections that load immediately (critical path)
            critical: ['hours', 'contact'],
            
            // Sections that load asynchronously (deferred path)
            deferred: ['schedules', 'facilities', 'programs', 'staff', 'nearby', 'volunteer', 'footerPhoto']
        },
        
        /**
         * Initialize and generate profile for a center
         */
        async generate(options = {}) {
            const {
                centerId,
                container = '#rsyc-profile-container',
                baseUrl = this.baseURL,
                sections = null
            } = options;

            if (!centerId) {
                console.error('❌ RSYCPublisher: centerId is required');
                return;
            }

            const containerEl = typeof container === 'string' 
                ? document.querySelector(container)
                : container;

            if (!containerEl) {
                console.error(`❌ RSYCPublisher: Container not found: ${container}`);
                return;
            }

            try {
                containerEl.innerHTML = '<div style="padding:20px; text-align:center;"><p>⏳ Loading center profile...</p></div>';
                
                this.baseURL = baseUrl;
                
                // Load all necessary data
                console.log(`🔄 Loading data for center: ${centerId}`);
                const data = await this.loadAllData();
                
                // Find the center
                const center = data.centers.find(c => c.Id === centerId || c.id === centerId);
                if (!center) {
                    throw new Error(`Center not found: ${centerId}`);
                }

                console.log(`✅ Loaded center: ${center.name}`);
                
                // Generate profile HTML
                const html = this.generateProfileHTML(center, data, sections);
                
                // Inject into container
                containerEl.innerHTML = html;
                
                // Initialize interactive elements
                this.initializeInteractivity(containerEl);
                
                console.log(`✅ Profile generated for ${center.name}`);
                return center;
                
            } catch (error) {
                console.error('❌ Error generating profile:', error);
                containerEl.innerHTML = `
                    <div style="padding:20px; background:#fff3cd; border:1px solid #ffc107; border-radius:4px; color:#856404;">
                        <strong>Error Loading Profile:</strong>
                        <p>${error.message}</p>
                        <p style="font-size:12px; margin:10px 0 0 0;">Check console for details.</p>
                    </div>
                `;
            }
        },

        /**
         * Load all required data
         */
        async loadAllData() {
            if (this.cache.allData) {
                return this.cache.allData;
            }

            try {
                const [centers, programs, schedules, leaders, hours, facilities] = await Promise.all([
                    this.fetchJSON('units-rsyc-profiles.json'),
                    this.fetchJSON('RSYCPrograms.json'),
                    this.fetchJSON('RSYCProgramSchedules.json'),
                    this.fetchJSON('RSYCLeaders.json'),
                    this.fetchJSON('RSYCHours.json'),
                    this.fetchJSON('RSYCFacilityFeatures.json')
                ]);

                this.cache.allData = {
                    centers: this.processCenters(centers),
                    programs,
                    schedules,
                    leaders,
                    hours,
                    facilities
                };

                return this.cache.allData;
            } catch (error) {
                console.error('Error loading data:', error);
                throw error;
            }
        },

        /**
         * Fetch JSON file with error handling
         */
        async fetchJSON(filename) {
            const url = this.baseURL + filename;
            try {
                console.log(`📥 Fetching: ${filename}`);
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const json = await response.json();
                console.log(`✅ Loaded: ${filename}`);
                return json;
            } catch (error) {
                console.error(`⚠️ Error fetching ${filename}:`, error.message);
                throw error;
            }
        },

        /**
         * Process center data
         */
        processCenters(data) {
            return data.map(center => ({
                Id: center.ID,
                id: center.ID,
                sharePointId: center.ID,
                Title: center.Title,
                name: center.field_1,
                shortName: center.Title,
                type: center.field_5,
                division: center.field_6,
                divisionCode: center.field_4,
                city: center.field_12,
                state: center.field_13,
                address: center.field_11,
                phone: center.field_7,
                email: center.field_8,
                website: center.field_9,
                hours: center.field_14,
                zip: center.field_17,
                lat: center.field_18,
                lng: center.field_19,
                photo: center.field_3,
                missionStatement: center.field_2,
                contactName: center.field_10,
                notes: center.field_15,
                lastUpdateDate: center.Modified
            }));
        },

        /**
         * Generate profile HTML
         */
        generateProfileHTML(center, data, selectedSections = null) {
            const sections = selectedSections || this.SECTION_CONFIG.default;
            let html = `<div class="rsyc-profile" data-center-id="${center.Id}">`;

            // Header
            html += `
                <div class="rsyc-header" style="background:linear-gradient(135deg, #1a4d7f 0%, #2d6fa3 100%); color:white; padding:30px 20px; border-radius:8px; margin-bottom:30px;">
                    <h1 style="margin:0; font-size:32px; font-weight:bold;">${center.name}</h1>
                    <p style="margin:5px 0 0 0; font-size:16px; opacity:0.9;">${center.missionStatement || 'Salvation Army Youth Center'}</p>
                </div>
            `;

            // Contact Info
            if (sections.includes('contact')) {
                html += `
                    <div class="rsyc-section rsyc-contact" style="margin-bottom:30px; padding:20px; background:#f8f9fa; border-radius:8px; border-left:4px solid #1a4d7f;">
                        <h2 style="margin:0 0 15px 0; font-size:20px; color:#1a4d7f;">Contact Information</h2>
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:15px;">
                            ${center.address ? `<div><strong>📍 Address:</strong> ${center.address}, ${center.city}, ${center.state} ${center.zip}</div>` : ''}
                            ${center.phone ? `<div><strong>📞 Phone:</strong> <a href="tel:${center.phone}" style="color:#1a4d7f; text-decoration:none;">${center.phone}</a></div>` : ''}
                            ${center.email ? `<div><strong>✉️ Email:</strong> <a href="mailto:${center.email}" style="color:#1a4d7f; text-decoration:none;">${center.email}</a></div>` : ''}
                            ${center.website ? `<div><strong>🌐 Website:</strong> <a href="${center.website}" target="_blank" style="color:#1a4d7f; text-decoration:none;">Visit Website</a></div>` : ''}
                        </div>
                    </div>
                `;
            }

            // Hours
            if (sections.includes('hours') && center.hours) {
                html += `
                    <div class="rsyc-section rsyc-hours" style="margin-bottom:30px; padding:20px; background:#f8f9fa; border-radius:8px; border-left:4px solid #1a4d7f;">
                        <h2 style="margin:0 0 15px 0; font-size:20px; color:#1a4d7f;">📅 Hours of Operation</h2>
                        <pre style="background:white; padding:15px; border-radius:4px; overflow-x:auto; font-family:monospace; white-space:pre-wrap; word-wrap:break-word;">${center.hours}</pre>
                    </div>
                `;
            }

            // Programs
            if (sections.includes('programs') && data.programs && data.programs.length > 0) {
                const centerPrograms = data.programs.filter(p => p.Division === center.division);
                if (centerPrograms.length > 0) {
                    html += `
                        <div class="rsyc-section rsyc-programs" style="margin-bottom:30px;">
                            <h2 style="margin:0 0 15px 0; font-size:20px; color:#1a4d7f;">🎯 Programs</h2>
                            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:15px;">
                    `;
                    centerPrograms.forEach(program => {
                        html += `
                            <div style="padding:15px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6;">
                                <h3 style="margin:0 0 5px 0; font-size:16px; color:#1a4d7f;">${program.Name || program.Title}</h3>
                                <p style="margin:5px 0; font-size:14px; color:#666;">${program.Description || ''}</p>
                            </div>
                        `;
                    });
                    html += `
                            </div>
                        </div>
                    `;
                }
            }

            // Staff
            if (sections.includes('staff') && data.leaders && data.leaders.length > 0) {
                const centerStaff = data.leaders.filter(l => l.CenterID === center.sharePointId || l.Division === center.division);
                if (centerStaff.length > 0) {
                    html += `
                        <div class="rsyc-section rsyc-staff" style="margin-bottom:30px;">
                            <h2 style="margin:0 0 15px 0; font-size:20px; color:#1a4d7f;">👥 Staff & Leadership</h2>
                            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:15px;">
                    `;
                    centerStaff.forEach(staff => {
                        html += `
                            <div style="padding:15px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6; text-align:center;">
                                <h3 style="margin:0 0 5px 0; font-size:14px; color:#1a4d7f;">${staff.Name || staff.Title}</h3>
                                <p style="margin:5px 0; font-size:12px; color:#666;">${staff.Role || staff.Position || ''}</p>
                                ${staff.Email ? `<p style="margin:5px 0; font-size:11px;"><a href="mailto:${staff.Email}" style="color:#1a4d7f; text-decoration:none;">${staff.Email}</a></p>` : ''}
                            </div>
                        `;
                    });
                    html += `
                            </div>
                        </div>
                    `;
                }
            }

            // Get Involved
            if (sections.includes('volunteer')) {
                html += `
                    <div class="rsyc-section rsyc-volunteer" style="margin-bottom:30px; padding:20px; background:#e8f4f8; border-radius:8px; border-left:4px solid #17a2b8;">
                        <h2 style="margin:0 0 15px 0; font-size:20px; color:#1a4d7f;">🤝 Get Involved</h2>
                        <p style="margin:0; font-size:14px;">Interested in volunteering or learning more about our programs? <strong>Contact us today!</strong></p>
                    </div>
                `;
            }

            html += `</div>`;
            return html;
        },

        /**
         * Initialize interactive elements
         */
        initializeInteractivity(containerEl) {
            // Add any event listeners or interactive functionality here
            // For now, this is a placeholder for future enhancements
        }
    };

    /**
     * MODAL SYSTEM
     * Global modal functions for showing/hiding modals
     */
    
    // Inject modal styles into document
    if (!document.getElementById('rsyc-modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'rsyc-modal-styles';
        modalStyles.textContent = `
            .rsyc-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: none !important;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                flex-direction: column;
            }
            
            .rsyc-modal.active {
                display: flex !important;
            }
            
            .rsyc-modal-content {
                background: white;
                border-radius: 8px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                position: relative;
            }
            
            .rsyc-modal-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .rsyc-modal-close:hover {
                color: #333;
            }
        `;
        document.head.appendChild(modalStyles);
    }

    /**
     * Show a modal by ID or element
     */
    window.showRSYCModal = function(modalIdOrElement) {
        const modal = typeof modalIdOrElement === 'string' 
            ? document.getElementById(modalIdOrElement)
            : modalIdOrElement;
        
        if (!modal) {
            console.error('Modal not found:', modalIdOrElement);
            return;
        }
        
        modal.classList.add('active');
    };

    /**
     * Close a modal by ID or element
     */
    window.closeRSYCModal = function(modalIdOrElement) {
        const modal = typeof modalIdOrElement === 'string' 
            ? document.getElementById(modalIdOrElement)
            : modalIdOrElement;
        
        if (!modal) {
            console.error('Modal not found:', modalIdOrElement);
            return;
        }
        
        modal.classList.remove('active');
    };

    /**
     * Setup modal event listeners
     */
    window.setupRSYCModalListeners = function(modalElement) {
        // Close on backdrop click
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                window.closeRSYCModal(modalElement);
            }
        });
        
        // Close on close button click
        const closeBtn = modalElement.querySelector('.rsyc-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.closeRSYCModal(modalElement);
            });
        }
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modalElement.classList.contains('active')) {
                window.closeRSYCModal(modalElement);
            }
        };
        document.addEventListener('keydown', handleEscape);
    };

    // Expose globally
    window.RSYCPublisher = RSYCPublisher;

    // Auto-initialize if script tag has data-center-id
    document.addEventListener('DOMContentLoaded', () => {
        const scripts = document.querySelectorAll('script[data-center-id]');
        scripts.forEach(script => {
            const centerId = script.getAttribute('data-center-id');
            const container = script.getAttribute('data-container') || '#rsyc-profile-container';
            const baseUrl = script.getAttribute('data-base-url') || 'https://thisishoperva.org/rsyc/';
            
            RSYCPublisher.generate({
                centerId,
                container,
                baseUrl
            });
        });
    });

})();
