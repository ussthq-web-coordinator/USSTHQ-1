/**
 * RSYC Profile Loader
 * Loads RSYC profiles into DOM elements via API
 * Usage: RSYCProfileLoader.load('centerId', 'elementId');
 */

const RSYCProfileLoader = {
    /**
     * Load a profile and inject into a target element
     * @param {string} centerId - The center ID
     * @param {string|HTMLElement} targetElement - Element ID or DOM element
     * @param {object} options - Optional configuration
     */
    async load(centerId, targetElement, options = {}) {
        try {
            // Get target element
            const target = typeof targetElement === 'string' 
                ? document.getElementById(targetElement)
                : targetElement;

            if (!target) {
                console.error(`[RSYCProfileLoader] Target element not found: ${targetElement}`);
                return;
            }

            // Show loading state (no visible text per user request)
            target.innerHTML = '<div style="padding: 40px; text-align: center;"></div>';

            // Determine API URL
            const baseUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3001'
                : 'https://thisishoperva.org';

            // Fetch profile from API
            const response = await fetch(`${baseUrl}/api/generate-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    centerId,
                    sections: options.sections || [
                        'schedules', 'hours', 'facilities', 'programs', 
                        'staff', 'events', 'nearby', 'volunteer', 'footerPhoto', 'contact'
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.html) {
                throw new Error('No HTML returned from API');
            }

            // Inject HTML
            target.innerHTML = data.html;

            // Load and inject styles
            await this.loadStyles(target);

            // Attach event listeners for modals/interactions
            this.attachEventListeners(target);

            console.log(`[RSYCProfileLoader] ✅ Loaded profile for center: ${data.centerName}`);

            return data;
        } catch (error) {
            console.error('[RSYCProfileLoader] Error:', error.message);
            const target = typeof targetElement === 'string' 
                ? document.getElementById(targetElement)
                : targetElement;
            if (target) {
                target.innerHTML = `<div style="padding: 20px; background: #ffe6e6; color: #990000; border-radius: 8px; border: 1px solid #ffcccc;">
                    Error loading profile: ${error.message}
                </div>`;
            }
        }
    },

    /**
     * Load and inject CSS styles
     */
    async loadStyles(container) {
        try {
            // Check if styles already loaded
            if (document.getElementById('rsyc-loader-styles')) {
                return;
            }

            // Create style element with comprehensive CSS
            const styleEl = document.createElement('style');
            styleEl.id = 'rsyc-loader-styles';
            styleEl.textContent = `
                /* RSYC Profile Styles */
                .rsyc-profile {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    color: #333;
                    line-height: 1.6;
                }

                .rsyc-profile * {
                    box-sizing: border-box;
                }

                .rsyc-profile h1, .rsyc-profile h2, .rsyc-profile h3 {
                    font-weight: 600;
                    margin-top: 0;
                }

                .rsyc-profile a {
                    color: #0066cc;
                    text-decoration: none;
                }

                .rsyc-profile a:hover {
                    text-decoration: underline;
                }

                /* Schedule Cards */
                .schedule-card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 16px;
                }

                /* Modal Styles */
                .rsyc-modal {
                    display: none;
                    position: fixed;
                    z-index: 2000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.6);
                    overflow: auto;
                }

                .rsyc-modal.show {
                    display: block;
                }

                .rsyc-modal-content {
                    background-color: white;
                    margin: 5% auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .rsyc-modal-close {
                    color: #999;
                    float: right;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                    border: none;
                    background: none;
                }

                .rsyc-modal-close:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(styleEl);

            // Try to load custom styles
            try {
                const baseUrl = window.location.hostname === 'localhost'
                    ? 'http://localhost:3001'
                    : 'https://thisishoperva.org';
                
                const response = await fetch(`${baseUrl}/rsyc/rsyc-custom-styles.html`);
                if (response.ok) {
                    const customStyles = await response.text();
                    const customEl = document.createElement('div');
                    customEl.id = 'rsyc-custom-styles';
                    customEl.innerHTML = customStyles;
                    document.head.appendChild(customEl);
                }
            } catch (e) {
                console.warn('[RSYCProfileLoader] Could not load custom styles:', e.message);
            }
        } catch (error) {
            console.error('[RSYCProfileLoader] Style loading error:', error);
        }
    },

    /**
     * Attach event listeners for modals and interactions
     */
    attachEventListeners(container) {
        // Find all modal triggers
        container.querySelectorAll('[data-modal-id]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modalId;
                const modal = container.querySelector(`#${modalId}`);
                if (modal) {
                    modal.classList.add('show');
                }
            });
        });

        // Find all modal close buttons
        container.querySelectorAll('.rsyc-modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = closeBtn.closest('.rsyc-modal');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Close modal when clicking outside
        container.querySelectorAll('.rsyc-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }
};

// Export for use in Node environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSYCProfileLoader;
}
