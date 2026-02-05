/**
 * RSYC CMS Publisher - Legacy Compatibility Module
 * 
 * This module provides backward compatibility and modal system support.
 * The primary profile generation is now handled by:
 *  - rsyc-generator.js (full CMS interface)
 *  - rsyc-profile-injector.js (embedded profiles)
 * 
 * Both use rsyc-templates.js for section generation, providing a single source of truth.
 */

(function() {
    'use strict';

    // Ensure compatibility exports exist
    const RSYCPublisher = {
        // Exposed for backward compatibility if needed
        baseURL: 'https://thisishoperva.org/rsyc/'
    };

    // Expose globally
    window.RSYCPublisher = RSYCPublisher;
