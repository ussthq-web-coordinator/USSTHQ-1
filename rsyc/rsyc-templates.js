/**
 * RSYC HTML Template Engine
 * Generates modular HTML sections for center profiles
 */

// ============================================
// CRITICAL: Define all modal/UI functions BEFORE templates are used
// These are called from generated HTML onclick handlers
// ============================================

/**
 * Modal display function - must be globally available
 */
window.showRSYCModal = function(type, centerName) {
    console.log('[RSYC] showRSYCModal:', type);
    const modal = document.getElementById('rsyc-modal-' + type);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        console.warn('[RSYC] Modal not found:', 'rsyc-modal-' + type);
    }
};

/**
 * Modal close function - must be globally available
 */
window.closeRSYCModal = function(type) {
    console.log('[RSYC] closeRSYCModal:', type);
    const modal = document.getElementById('rsyc-modal-' + type);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    } else {
        console.warn('[RSYC] Modal not found:', 'rsyc-modal-' + type);
    }
};

/**
 * Staff modal navigation - handles previous/next through staff list
 */
window.rsycNavigateStaffModal = function(groupKey, currentIndex, delta) {
    try {
        const modals = Array.from(document.querySelectorAll(`.rsyc-modal[data-rsyc-staff-group="${groupKey}"]`));
        if (!modals.length) {
            console.warn('[RSYC] No staff modals found for group:', groupKey);
            return;
        }

        const items = modals
            .map(m => ({
                el: m,
                idx: Number(m.dataset.rsycStaffIndex),
                type: m.id ? m.id.replace('rsyc-modal-', '') : ''
            }))
            .filter(x => Number.isFinite(x.idx) && x.type);

        if (items.length <= 1) return;
        items.sort((a, b) => a.idx - b.idx);

        const curPos = items.findIndex(x => x.idx === Number(currentIndex));
        if (curPos === -1) {
            console.warn('[RSYC] Current staff index not found:', currentIndex);
            return;
        }

        const nextPos = (curPos + delta + items.length) % items.length;
        const current = items[curPos];
        const next = items[nextPos];

        if (current && current.type) {
            const curEl = document.getElementById('rsyc-modal-' + current.type);
            if (curEl) curEl.style.display = 'none';
        }

        if (next && next.type) {
            const nextEl = document.getElementById('rsyc-modal-' + next.type);
            if (nextEl) {
                nextEl.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
    } catch (e) {
        console.error('[RSYC] Staff navigation failed:', e);
    }
};

/**
 * Global toggle function for RSYC accordions
 */
window.toggleRSYCAccordion = function(accordionId) {
    const content = document.getElementById(accordionId);
    const icon = document.getElementById(accordionId + '-icon');
    
    if (!content) {
        console.warn(`[RSYC] Accordion content not found: ${accordionId}`);
        return;
    }
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
};

/**
 * Toggle schedule accordion (for mobile/iPad)
 */
window.toggleScheduleInfo = function(scheduleId) {
    const content = document.getElementById(scheduleId);
    const icon = document.getElementById(scheduleId + '-icon');
    
    if (!content) {
        console.warn(`[RSYC] Schedule content not found: ${scheduleId}`);
        return;
    }
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
};

/**
 * Close modal when clicking outside content
 */
document.addEventListener('click', function(e) {
    if (e.target.classList && e.target.classList.contains('rsyc-modal')) {
        const modalId = e.target.id;
        const type = modalId.replace('rsyc-modal-', '');
        window.closeRSYCModal(type);
    }
}, false);

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.rsyc-modal[style*="display: flex"]');
        openModals.forEach(modal => {
            const type = modal.id.replace('rsyc-modal-', '');
            window.closeRSYCModal(type);
        });
    }
}, false);

if (typeof window.RSYCTemplates === 'undefined') {
class RSYCTemplates {
    constructor() {
        this.sections = {
            'hero': { name: 'Hero Section', enabled: true, order: 1 },
            'about': { name: 'About This Center', enabled: true, order: 2 },
            'schedules': { name: 'Program Schedules', enabled: true, order: 3 },
            'hours': { name: 'Hours of Operation', enabled: true, order: 4 },
            // Facility Features above Featured Programs
            'facilities': { name: 'Facility Features', enabled: true, order: 5 },
            'programs': { name: 'Featured Programs', enabled: true, order: 6 },
            // Staff immediately after Featured Programs
            'staff': { name: 'Staff & Leadership', enabled: true, order: 7 },
            'events': { name: 'Events', enabled: true, order: 8 },
            'stories': { name: 'Stories', enabled: true, order: 9 },
            'nearby': { name: 'Nearby Centers', enabled: true, order: 10 },
            'parents': { name: 'For Parents', enabled: true, order: 11 },
            'youth': { name: 'For Youth', enabled: true, order: 12 },
            'volunteer': { name: 'Volunteer Opportunities', enabled: true, order: 13 },
            'footerPhoto': { name: 'Footer Photo', enabled: true, order: 14 },
            'contact': { name: 'Contact & Donate', enabled: true, order: 15 }
        };
    }

    /**
     * Generate complete profile HTML
     */
    generateProfile(centerData, enabledSections) {
        const sections = [];
        
        Object.keys(this.sections).forEach(sectionKey => {
            if (enabledSections.includes(sectionKey)) {
                const html = this.generateSection(sectionKey, { ...centerData, __enabledSections: enabledSections });
                if (html) {
                    sections.push(html);
                }
            }
        });

        return sections.join('\n\n');
    }

    /**
     * Generate individual section
     */
    generateSection(sectionKey, data) {
        try {
            const methods = {
                'hero': this.generateHero,
                'about': this.generateAbout,
                'schedules': this.generateSchedules,
                'hours': this.generateHours,
                'programs': this.generatePrograms,
                'facilities': this.generateFacilities,
                'staff': this.generateStaff,
                'events': this.generateEvents,
                'stories': this.generateStories,
                'nearby': this.generateNearby,
                'parents': this.generateParents,
                'youth': this.generateYouth,
                'volunteer': this.generateVolunteer,
                // Sort schedules primarily by start time, then by first day, then by proximity to current month
                'footerPhoto': this.generateFooterPhoto,
                'contact': this.generateContact
            };

            const method = methods[sectionKey];
            if (method) {
                try {
                    const result = method.call(this, data);
                    console.log(`🔍 Section "${sectionKey}":`, result ? `${result.length} chars` : 'EMPTY/NULL');
                    return result || '';
                } catch (err) {
                    console.error(`[RSYC] Error generating "${sectionKey}" section:`, err);
                    // Return empty string instead of failing to allow other sections to render
                    return '';
                }
            }
            console.warn(`⚠️ No method found for section: ${sectionKey}`);
            return '';
        } catch (err) {
            console.error(`[RSYC] Critical error in generateSection:`, err);
            return '';
        }
    }

    /**
     * Hero Section
     */
    generateHero(data) {
        const { center, photos } = data;
        
        // Get exterior photo from photos array
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const exteriorPhoto = photoData?.urlExteriorPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';
        
        if (!exteriorPhoto) return ''; // No hero without photo
        
        return `<!-- Hero Section -->
<style>
    .rsyc-hero img {
        width: 96% !important;
        margin-top: 75px !important;
    }
    @media (min-width: 992px) {
        .rsyc-hero img {
            width: 80% !important;
        }
    }
    /* Global Modal Corner Radius */
    .rsyc-modal-content {
        border-radius: 20px !important;
        overflow: hidden !important;
    }
    .rsyc-modal-header {
        border-top-left-radius: 20px !important;
        border-top-right-radius: 20px !important;
    }
    
    /* CRITICAL: Force RSYC container and all children to be visible */
    [data-rsyc-center-id] {
        display: block !important;
        visibility: visible !important;
        height: auto !important;
        min-height: 100px !important;
        max-height: none !important;
        overflow: visible !important;
        opacity: 1 !important;
        position: relative !important;
        clear: both !important;
        float: none !important;
    }
    
    /* Force all direct children to display */
    [data-rsyc-center-id] > * {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    }
    
    /* Ensure RSYC sections are visible - only target within RSYC containers */
    [data-rsyc-center-id] .rsyc-hero,
    [data-rsyc-center-id] .freeTextArea,
    [data-rsyc-center-id] .section,
    [data-rsyc-center-id] .u-centerBgImage,
    [data-rsyc-center-id] .u-sa-tealBg,
    [data-rsyc-center-id] .u-sa-whiteBg,
    [data-rsyc-center-id] .u-sa-creamBg,
    [data-rsyc-center-id] .u-sa-greyVeryLightBg,
    [data-rsyc-center-id] .u-sa-goldBg {
        display: block !important;
        visibility: visible !important;
        height: auto !important;
        min-height: 50px !important;
        max-height: none !important;
        overflow: visible !important;
        opacity: 1 !important;
    }
    
    /* Ensure images don't collapse the container */
    [data-rsyc-center-id] .rsyc-hero img,
    [data-rsyc-center-id] .freeTextArea img {
        max-width: 100%;
        height: auto;
    }
    }
</style>
<section class="rsyc-hero" style="background-color: #00929C; padding: 20px 0; display: flex !important; justify-content: center; align-items: center; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <img src="${this.escapeHTML(exteriorPhoto)}" alt="${this.escapeHTML(center.name)} Exterior" 
         style="display: block; height: 500px; object-fit: cover; object-position: center; margin: 35px auto 0 auto; border-radius: 15px;">
</section>`;
    }

    generateAbout(data) {
        const { center, schedules, photos } = data;

        if (!center || !center.aboutText) return '';

        const hasSchedules = schedules && schedules.length > 0;
        const bottomMarginClass = hasSchedules ? ' mb-5' : '';

        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const exteriorPhoto = photoData?.urlExteriorPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';

        const schedulesCacheKey = `schedules_${center.id || 'default'}`;
        if (typeof window.RSYC_SCHEDULES !== 'undefined' && window.RSYC_SCHEDULES && window.RSYC_SCHEDULES[schedulesCacheKey]) {
            window.RSYC_SCHEDULES[schedulesCacheKey].exteriorPhoto = exteriorPhoto;
        }

        const explainerVideoEmbedCode = center.explainerVideoEmbedCode || center.ExplainerVideoEmbedCode || '';
        const videoHTML = explainerVideoEmbedCode ? `
            <div class="mt-2" style="border-radius: 12px; overflow: hidden;">
                ${explainerVideoEmbedCode}
            </div>` : '';

        return `<!-- About This Center -->
<div id="freeTextArea-about" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="mt-0 mb-5">
                <div class="d-flex justify-content-center${bottomMarginClass}">
                    <div class="schedule-card w-100 text-dark" style="max-width:800px;width:100%;padding:1.5rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                        <h2 class="fw-bold mb-3 text-center">About This <em>Center</em></h2>
                        <p class="text-center mb-3"><strong>The Salvation Army ${this.escapeHTML(center.name || center.Title)}</strong></p>
                        <div class="about-content" style="font-family: inherit; font-size: 1rem; line-height: 1.6;">
                            ${center.aboutText}
                        </div>
                        ${videoHTML}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Events Section
     */
    generateEvents(data) {
        try {
            const { center, events } = data;
            if (!events || !Array.isArray(events) || events.length === 0) return '';

            const formatEventDateTimeParts = (event) => {
                try {
                    const startTs = Number.isFinite(event._startTimestamp) ? event._startTimestamp : Date.parse(String(event.startDateTime || ''));
                    const endTs = Number.isFinite(event._endTimestamp) ? event._endTimestamp : Date.parse(String(event.endDateTime || ''));
                    const hasStart = startTs && !isNaN(startTs);
                    const hasEnd = endTs && !isNaN(endTs);
                    const start = hasStart ? new Date(startTs) : null;
                    const end = hasEnd ? new Date(endTs) : null;

                    const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

                    if (start && end) {
                        const sameDay = start.toDateString() === end.toDateString();
                        return {
                            dateText: sameDay ? dateFmt.format(start) : `${dateFmt.format(start)} - ${dateFmt.format(end)}`,
                            timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                        };
                    }
                    if (start) {
                        return { dateText: dateFmt.format(start), timeText: timeFmt.format(start) };
                    }
                    return { dateText: '', timeText: '' };
                } catch (e) {
                    console.warn('[RSYC] Error formatting event dates:', e);
                    return { dateText: '', timeText: '' };
                }
            };

        const sortedEvents = [...events].sort((a, b) => {
            const aStart = Number.isFinite(a._startTimestamp) ? a._startTimestamp : null;
            const bStart = Number.isFinite(b._startTimestamp) ? b._startTimestamp : null;
            if (aStart && bStart) return aStart - bStart;
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            return 0;
        });

        let eventModals = '';
        const eventCards = sortedEvents.map(evt => {
            const eventTypeText = evt.eventType || '';
            const eventSubtitleText = evt.subtitle || '';
            const eventCardSubtitleText = eventSubtitleText || eventTypeText;
            const dt = formatEventDateTimeParts(evt);
            const dateText = dt.dateText || '';
            const timeText = dt.timeText || '';
            const addressText = [evt.street, evt.city, evt.state, evt.postalCode].filter(Boolean).join(', ');
            const directionsUrl = addressText ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText)}` : '';
            const onSaleTag = evt.isOnSale ? `
                <div style="position:absolute; top: 10px; right: 10px; background:#dc3545; color:#fff; font-weight:700; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 999px; letter-spacing: 0.02em;">
                    On Sale
                </div>` : '';

            const modalType = `event-${evt.id}`;

            const eventModal = `
<!-- Modal for Event Details -->
<div id="rsyc-modal-${modalType}" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap: 1rem;">
            <div style="min-width:0; flex: 1;">
                <h2 style="margin:0;">${this.escapeHTML(evt.title)}</h2>
            </div>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('${modalType}')" style="background:none; border:none; cursor:pointer; font-size: 1.5rem; padding:0.25rem; color:#333; flex-shrink:0;">&times;</button>
        </div>
        
        ${(evt.primaryButtonUrl || evt.secondaryButtonUrl || evt.facebookEventUrl) ? `
        <div class="rsyc-modal-actions" style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; align-items:center; margin-bottom:1rem; padding:0.75rem; background:#f8f9fa; border-radius:8px; border:1px solid #e0e0e0;">
            ${evt.primaryButtonUrl ? `<a class="btn btn-primary" href="${this.escapeHTML(evt.primaryButtonUrl)}" target="_blank" style="background-color:#00929C; border:none; font-size: 0.9rem; padding:0.5rem 1rem;">${this.escapeHTML(evt.primaryButtonText || 'Learn More')}</a>` : ''}
            ${evt.secondaryButtonUrl ? `<a class="btn btn-outline-primary" href="${this.escapeHTML(evt.secondaryButtonUrl)}" target="_blank" style="font-size: 0.9rem; padding:0.5rem 1rem;">${this.escapeHTML(evt.secondaryButtonText || 'More Info')}</a>` : ''}
            ${evt.facebookEventUrl ? `<a href="${this.escapeHTML(evt.facebookEventUrl)}" target="_blank" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; padding:0.5rem; color:#1877F2; text-decoration:none;" title="View Facebook Event"><i class="bi bi-facebook"></i></a>` : ''}
            <button class="rsyc-modal-print" onclick="printRSYCModal('event-${evt.id}')" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; padding:0.5rem; color:#333;" title="Print or Save as PDF"><i class="bi bi-printer"></i></button>
        </div>
        ` : ''}
        <div class="rsyc-modal-body" style="color:#333;">
            ${evt.imageUrl ? `
                <div class="mb-4">
                    <img alt="${this.escapeHTML(evt.title)}" src="${this.escapeHTML(evt.imageUrl)}" style="width:100%; height:auto; border-radius: 12px; display:block;" />
                </div>
            ` : ''}

            <div class="mb-3" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                <div style="font-size: 1.1rem; font-weight:600; color:#0C0C0C;"><strong>${this.escapeHTML(center.name || center.Title)}</strong></div>
                <img src="https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg" alt="Red Shield Youth Centers Logo" style="height:42px; max-width:120px; width:auto; object-fit:contain; display:block;" />
            </div>

            ${(eventTypeText || eventSubtitleText) ? `<div class="mb-3 rsyc-event-cost" style="font-size: 1rem; color:#333;">
                ${eventTypeText ? `<div class="rsyc-event-cost"><strong>Type:</strong><br>${this.escapeHTML(eventTypeText)}</div>` : ''}
                ${eventSubtitleText ? `<div style="margin-top:0.5rem;"><strong>Subtitle:</strong><br>${this.escapeHTML(eventSubtitleText)}</div>` : ''}
            </div>` : ''}
            ${evt.isOnSale ? `<div class="mb-3"><span class="badge" style="background:#dc3545;">On Sale</span></div>` : ''}
            ${(dateText || timeText) ? `<div class="mb-3" style="font-size: 1rem; color:#333;">
                ${dateText ? `<div><strong>Date:</strong><br>${this.escapeHTML(dateText)}</div>` : ''}
                ${timeText ? `<div style="margin-top:0.5rem;" class="rsyc-event-cost"><strong>Time:</strong><br>${this.escapeHTML(timeText)}</div>` : ''}
            </div>` : ''}
            ${evt.cost ? `<div class="mb-3 rsyc-event-cost" style="font-size: 1rem; color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(evt.cost)}</div>` : ''}
            ${evt.extendedCareTimes ? `<div class="mb-3 rsyc-event-extended-care" style="font-size: 1rem; color:#333;"><strong>Extended Care Times:</strong><br>${this.escapeHTML(evt.extendedCareTimes)}</div>` : ''}

            ${evt.specialFeatures ? `<div class="mb-3 rsyc-event-cost" style="font-size: 1rem; color:#333;">
                <strong>What you can expect:</strong><br>
                ${this.escapeHTML(evt.specialFeatures)}
            </div>` : ''}

            ${evt.description ? `<div class="mb-3 rsyc-event-cost" style="font-size: 1.1rem; line-height: 1.7; color:#333;">${evt.description}</div>` : ''}

            ${addressText ? `
            <div class="mb-3 rsyc-event-location" style="background:#f8f9fa; padding:1rem; border-radius:8px; border:1px solid #e0e0e0;">
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 0.75rem;">
                    <div style="min-width:0;">
                        <strong style="display:block; margin-bottom:0.35rem;"><i class="bi bi-geo-alt me-2"></i>Location</strong>
                        <div>${this.escapeHTML(addressText)}</div>
                    </div>
                    ${directionsUrl ? `<a class="btn btn-outline-secondary btn-sm" href="${directionsUrl}" target="_blank" style="font-size: 0.8rem; padding:0.25rem 0.5rem; flex-shrink:0;"><i class="bi bi-sign-turn-right me-1"></i>Directions</a>` : ''}
                </div>
            </div>
            ` : ''}

            ${(evt.contactName || evt.contactEmail || evt.contactNumber) ? `
            <div class="mb-3" style="background:#f0f7f7; padding:1rem; border-radius:8px; border:1px solid #d1e7e7;">
                <strong style="display:block; margin-bottom:0.35rem; color:#20B3A8;"><i class="bi bi-person-lines-fill me-2"></i>Contact</strong>
                ${evt.contactName ? `<div><strong>${this.escapeHTML(evt.contactName)}</strong></div>` : ''}
                ${evt.contactEmail ? `<div><a href="mailto:${this.escapeHTML(evt.contactEmail)}" style="color:#2F4857; text-decoration:underline;">${this.escapeHTML(evt.contactEmail)}</a></div>` : ''}
                ${evt.contactNumber ? `<div>${this.escapeHTML(evt.contactNumber)}</div>` : ''}
            </div>
            ` : ''}
        </div>
    </div>
</div>`;

            eventModals += eventModal;

            return `
                <div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; scroll-snap-align: start; border: 1px solid #dee2e6; overflow:hidden; position:relative;">
                    ${onSaleTag}
                    <div style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        <img alt="${this.escapeHTML(evt.title)}" src="${this.escapeHTML(evt.thumbnailUrl || evt.imageUrl || '')}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none';" />
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="fw-bold mb-1" style="font-size: 1.05rem; line-height: 1.3;">${this.escapeHTML(evt.title)}</div>
                        ${eventCardSubtitleText ? `<div class="text-muted mb-2" style="font-size: 0.9rem;">${this.escapeHTML(eventCardSubtitleText)}</div>` : ''}
                        <div style="flex-grow:1; font-size: 0.9rem; line-height: 1.5;">
                            ${dateText ? `<div><strong>Date:</strong> ${this.escapeHTML(dateText)}</div>` : ''}
                            ${timeText ? `<div><strong>Time:</strong> ${this.escapeHTML(timeText)}</div>` : ''}
                        </div>
                        <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Details</button>
                    </div>
                </div>
            `;
        }).join('');

        const scrollHint = sortedEvents.length > 3 ? `
            <p class="text-center mb-n2">
                <small class="text-muted" style="color:rgba(255,255,255,0.85);">
                    Scroll to view more
                    <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                </small>
            </p>` : '';

        const justifyContent = 'justify-content-center';

        return `<!-- Events -->
<div id="freeTextArea-events" class="freeTextArea section" style="background-color: #cb2e3d; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 4rem; padding-bottom: 4rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="bg-area rounded p-4">
                    <h2 class="fw-bold mb-4 text-center" style="color:#fff;">Upcoming <em style="color:#fff;">Events</em></h2>
                    ${scrollHint}
                    <div class="horizontal-scroll ${justifyContent} overflow-auto gap-4 py-2" style="scroll-snap-type: x mandatory; justify-content:center; align-items:stretch;">
                        ${eventCards}
                    </div>
                    ${eventModals}
                </div>
            </div>
        </div>
    </div>
</div>`;
        } catch (err) {
            console.error('[RSYC] Error generating events section:', err);
            return '';
        }
    }

    /**
     * Stories Section
     */
    generateStories(data) {
        try {
            const { center, stories } = data;
            if (!stories || !Array.isArray(stories) || stories.length === 0) return '';

            const sortedStories = [...stories].sort((a, b) => {
                const aTs = Number.isFinite(a._storyDateTs) ? a._storyDateTs : null;
                const bTs = Number.isFinite(b._storyDateTs) ? b._storyDateTs : null;
                // Sort by date descending (newest first)
                if (aTs && bTs) return bTs - aTs;
                if (aTs && !bTs) return -1;
                if (!aTs && bTs) return 1;
                return 0;
            });

            let storyModals = '';
            const storyCards = sortedStories.map(story => {
                const storyDateObj = story.storyDate ? new Date(story.storyDate) : null;
                const storyDateFormatted = storyDateObj ? new Intl.DateTimeFormat('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }).format(storyDateObj) : '';

                const modalType = `story-${story.id}`;

                const storyModal = `
<!-- Modal for Story Details -->
<div id="rsyc-modal-${modalType}" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        ${story.mainImage ? `
        <div style="width:100%; max-height:400px; overflow:hidden; margin-bottom:1.5rem; border-radius:8px;">
            <img src="${this.escapeHTML(story.mainImage)}" alt="${this.escapeHTML(story.title)}" style="width:100%; height:100%; object-fit:cover; object-position:center;" />
        </div>
        ` : ''}
        <div class="rsyc-modal-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap: 1rem;">
            <div style="min-width:0; flex: 1;">
                <h2 style="margin:0;">${this.escapeHTML(story.title)}</h2>
            </div>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('${modalType}')" style="background:none; border:none; cursor:pointer; font-size: 1.5rem; padding:0.25rem; color:#333; flex-shrink:0;">&times;</button>
        </div>
        
        <div class="rsyc-modal-actions" style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; align-items:center; margin-bottom:1rem; padding:0.75rem; background:#f8f9fa; border-radius:8px; border:1px solid #e0e0e0;">
            ${story.primaryCTALink ? `<a class="btn btn-primary" href="${this.escapeHTML(story.primaryCTALink)}" target="_blank" style="background-color:#00929C; border:none; font-size: 0.9rem; padding:0.5rem 1rem;">${this.escapeHTML(story.primaryCTAName || 'Learn More')}</a>` : ''}
            ${story.secondaryCTALink ? `<a class="btn btn-outline-primary" href="${this.escapeHTML(story.secondaryCTALink)}" target="_blank" style="font-size: 0.9rem; padding:0.5rem 1rem;">${this.escapeHTML(story.secondaryCTAName || 'More Info')}</a>` : ''}
            ${story.externalUrl ? `<a class="btn btn-outline-secondary" href="${this.escapeHTML(story.externalUrl)}" target="_blank" style="font-size: 0.9rem; padding:0.5rem 1rem;"><i class="bi bi-box-arrow-up-right me-1"></i>Read Full Story</a>` : ''}
            <button class="rsyc-modal-print" onclick="printStoryModal('story-${story.id}')" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; padding:0.5rem; color:#333;" title="Print or Save as PDF"><i class="bi bi-printer"></i></button>
        </div>
        <div class="rsyc-modal-body" style="color:#333;">
            <div class="mb-3" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                <div>
                    <div style="font-size: 1.1rem; font-weight:600; color:#0C0C0C;"><strong>${this.escapeHTML(center.name || center.Title)}</strong></div>
                    ${storyDateFormatted ? `<div class="text-muted" style="font-size: 0.9rem;">${storyDateFormatted}</div>` : ''}
                </div>
                <img src="https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg" alt="Red Shield Youth Centers Logo" style="height:42px; max-width:120px; width:auto; object-fit:contain; display:block;" />
            </div>

            ${story.author ? `<div class="mb-3" style="font-size: 0.95rem; font-style: italic; color:#666;">By ${this.escapeHTML(story.author)}</div>` : ''}
            
            ${story.body ? `<div class="mb-3 rsyc-story-body" style="font-size: 1rem; line-height: 1.7; color:#333;">${story.body}</div>` : ''}
        </div>
    </div>
</div>`;

                storyModals += storyModal;

                return `
                <div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; scroll-snap-align: start; border: 1px solid #dee2e6; overflow:hidden; position:relative;">
                    <div style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        ${story.thumbnailImage ? `
                        <img src="${this.escapeHTML(story.thumbnailImage)}" alt="${this.escapeHTML(story.title)}" style="width:100%; height:100%; object-fit:cover; object-position:center;" />
                        ` : `
                        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #20B3A8 0%, #2F4857 100%); color:white; font-size:2rem;">
                            <i class="bi bi-book"></i>
                        </div>
                        `}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="fw-bold mb-1" style="font-size: 1.05rem; line-height: 1.3;">${this.escapeHTML(story.title)}</div>
                        ${storyDateFormatted ? `<div class="text-muted mb-2" style="font-size: 0.9rem;">${storyDateFormatted}</div>` : ''}
                        <div style="flex-grow:1; font-size: 0.9rem; line-height: 1.5;">
                            ${story.excerpt ? `<div>${this.escapeHTML(story.excerpt.substring(0, 100))}${story.excerpt.length > 100 ? '...' : ''}</div>` : ''}
                        </div>
                        <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">Read Story</button>
                    </div>
                </div>
            `;
        }).join('');

        const scrollHint = sortedStories.length > 3 ? `
            <p class="text-center mb-n2">
                <small class="text-muted" style="color:rgba(255,255,255,0.85);">
                    Scroll to view more
                    <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                </small>
            </p>` : '';

        const justifyContent = 'justify-content-center';

        return `<!-- Stories -->
<style>
    #freeTextArea-stories .stories-container {
        display: flex;
        gap: 1rem;
        padding: 0.5rem 0;
        align-items: stretch;
    }
    
    #freeTextArea-stories .card {
        width: 280px;
        border: 1px solid #dee2e6;
        overflow: hidden;
        position: relative;
    }
    
    #freeTextArea-stories .card-body {
        display: flex;
        flex-direction: column;
    }
    
    @media (min-width: 992px) {
        #freeTextArea-stories .stories-container {
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            flex-wrap: nowrap;
            justify-content: center;
        }
        #freeTextArea-stories .stories-container > div {
            scroll-snap-align: start;
            flex-shrink: 0;
        }
    }
    
    @media (max-width: 991px) {
        #freeTextArea-stories .stories-container {
            flex-wrap: wrap;
            justify-content: center;
            overflow: visible;
            gap: 1.5rem;
        }
        #freeTextArea-stories .stories-container > div {
            flex-shrink: 0;
            width: 100%;
            max-width: 340px;
        }
        #freeTextArea-stories .card {
            width: 100%;
        }
        #freeTextArea-stories .card-body {
            padding: 0.75rem;
        }
        #freeTextArea-stories .card-body > div:nth-child(n+2) {
            font-size: 0.85rem;
        }
    }
</style>
<div id="freeTextArea-stories" class="freeTextArea section" style="background-color: #20B3A8; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 4rem; padding-bottom: 4rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="bg-area rounded p-4">
                    <h2 class="fw-bold mb-4 text-center" style="color:#fff;">Recent <em style="color:#fff;">Stories</em></h2>
                    ${scrollHint}
                    <div class="stories-container">
                        ${storyCards}
                    </div>
                    ${storyModals}
                </div>
            </div>
        </div>
    </div>
</div>`;
        } catch (err) {
            console.error('[RSYC] Error generating stories section:', err);
            return '';
        }
    }

    /**
     * Featured Programs Section
     */
    generatePrograms(data) {
        const { programDetails, photos, center } = data;
        const hasPrograms = programDetails && programDetails.length > 0;

        // Hide section if no programs provided
        if (!hasPrograms) return '';

        // Get programs photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const programPhoto = photoData?.urlProgramsPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/c11a1b73-6893-4eb4-a24c-8ecf98058b14_484033880_1061382646027353_8208563035826151450_n.jpg';

        let programItems = '';
        let viewAllButton = '';
        let modal = '';

        if (hasPrograms) {
            // Alphabetically sort programs by name
            const sortedPrograms = [...programDetails].sort((a, b) => 
                (a.name || '').localeCompare(b.name || '')
            );

            const totalPrograms = sortedPrograms.length;
            const threshold = 8;
            const hasManyPrograms = totalPrograms > threshold;
            const displayPrograms = hasManyPrograms ? sortedPrograms.slice(0, threshold) : sortedPrograms;

            // Button text: "View All [N] Programs" if > 8, else "View More Details"
            const buttonLabel = hasManyPrograms ? `View All ${totalPrograms} Programs` : 'View More Details';
            
            programItems = displayPrograms.map(program => {
                const icon = program.iconClass || 'bi-star';
                return `
                    <div class="d-flex align-items-center rsyc-feature-item" style="flex: 1 1 45%;">
                        <i class="bi ${this.escapeHTML(icon)} feature-icon"></i> 
                        <span class="ms-1">${this.escapeHTML(program.name)}</span>
                    </div>`;
            }).join('');

            // All programs for modal (sorted)
            const allProgramItems = sortedPrograms.map(program => {
                const icon = program.iconClass || 'bi-star';
                const description = program.description || '';
                return `
                    <div class="col-sm-12 col-md-6 mb-4">
                        <div class="d-flex align-items-start">
                            <i class="bi ${this.escapeHTML(icon)} feature-icon me-3 mt-1" style="font-size: 1.5rem;"></i>
                            <div>
                                <div class="fw-bold" style="font-size: 1.1rem;">${this.escapeHTML(program.name)}</div>
                                ${description ? `<div class="text-muted small mt-1" style="line-height: 1.4;">${this.escapeHTML(description)}</div>` : ''}
                            </div>
                        </div>
                    </div>`;
            }).join('');

            viewAllButton = `
                            <div class="text-center mt-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showRSYCModal('programs', '${this.escapeHTML(center.name, true)}')">
                                    ${buttonLabel}
                                </button>
                            </div>`;

            modal = `
<!-- Modal for All Programs -->
<div id="rsyc-modal-programs" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>All Featured Programs</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('programs')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <div class="row">
                ${allProgramItems}
            </div>
        </div>
    </div>
</div>`;
        }

        return `<!-- Featured Programs -->
<style>
    .rsyc-modal-content {
        border-radius: 20px !important;
        overflow: hidden !important;
    }
    .rsyc-modal-header {
        border-top-left-radius: 20px !important;
        border-top-right-radius: 20px !important;
    }
</style>
<div id="freeTextArea-programs" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="row align-items-stretch">
                    <!-- Left block: Photo (5 columns) -->
                    <div class="col-lg-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1; min-width: 100%; min-height: auto;">
                            ${programPhoto ? `
                            <img alt="Program Photo" 
                                 class="img-fluid w-100 h-100" 
                                 src="${this.escapeHTML(programPhoto)}" 
                                 style="object-fit:cover; object-position: center;">
                            ` : `
                            <div class="bg-light w-100 h-100 d-flex align-items-center justify-content-center" style="min-height:300px;">
                                <p class="text-muted">Program Photo</p>
                            </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Right block: Featured Programs (7 columns) -->
                    <div class="col-lg-7 d-flex">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-award icon-lg"></i>
                            <h2 class="fw-bold mb-4">Featured <em>Programs</em></h2>
                            
                            <!-- Icons row using flexbox with consistent gap -->
                            <div class="d-flex flex-wrap gap-3 mt-auto">
                                ${programItems}
                            </div>
                            ${viewAllButton}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
${modal}`;
    }

    /**
     * Program Schedules Section
     */
    generateSchedules(data, enabledSections) {
        const { center, schedules, events } = data;

        const formatEventDateTimeParts = (event) => {
            try {
                const startTs = Number.isFinite(event._startTimestamp) ? event._startTimestamp : Date.parse(String(event.startDateTime || ''));
                const endTs = Number.isFinite(event._endTimestamp) ? event._endTimestamp : Date.parse(String(event.endDateTime || ''));
                const hasStart = startTs && !isNaN(startTs);
                const hasEnd = endTs && !isNaN(endTs);
                const start = hasStart ? new Date(startTs) : null;
                const end = hasEnd ? new Date(endTs) : null;

                const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

                if (start && end) {
                    const sameDay = start.toDateString() === end.toDateString();
                    return {
                        dateText: sameDay ? dateFmt.format(start) : `${dateFmt.format(start)} - ${dateFmt.format(end)}`,
                        timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                    };
                }
                if (start) {
                    return { dateText: dateFmt.format(start), timeText: timeFmt.format(start) };
                }
                return { dateText: '', timeText: '' };
            } catch (e) {
                return { dateText: '', timeText: '' };
            }
        };
        
        // Build schedule cards if available
        let scheduleCards = '';
        // Accumulate schedule modals separately so they are placed
        // once at the end of the schedules section (consistent with other modals)
        let scheduleModals = '';
        let scheduleScrollSection = '';
        let scheduleTitleSection = '';
        
        const eventCardsSource = Array.isArray(events) ? events : [];
        const scheduleCardsSource = Array.isArray(schedules) ? schedules : [];

        // Merge events into the same card scroller (Program Schedule cards)
        // Events are tagged by __type==='event' and have _startTimestamp for sorting.
        const mergedSchedules = [...scheduleCardsSource, ...eventCardsSource];

        if (mergedSchedules && mergedSchedules.length > 0) {
            // Only show title if there are schedule items
            scheduleTitleSection = `<h2 class="fw-bold mb-4 text-center"><span style="color:#FCA200;">Program </span><em style="color:#ffffff;">Schedule</em></h2>`;
            
            // Sort schedules by proximity to current month
            const currentMonth = new Date().getMonth(); // 0-11
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            // Sort schedules primarily by proximity to current month, then by first day and start time
            const getEarliestMonth = (schedule) => {
                if (!schedule.programRunsIn || schedule.programRunsIn.length === 0) return 999;
                const monthIndices = schedule.programRunsIn.map(m => monthOrder.indexOf(m)).filter(i => i !== -1);
                if (monthIndices.length === 0) return 999;

                // Find the closest upcoming month (wrapping around the year)
                let minDistance = 999;
                for (const monthIdx of monthIndices) {
                    let distance = monthIdx - currentMonth;
                    if (distance < 0) distance += 12; // Wrap to next year
                    if (distance < minDistance) minDistance = distance;
                }
                return minDistance;
            };

            // Sort considering explicit start dates if present. Order:
            // 1) Explicit start timestamp (earlier first)
            // 2) Program run month proximity
            // 3) Start day of week
            // 4) Start time
            // 5) Fewer days (more specific)
            // 6) End timestamp (earlier end first)
            const sortedSchedules = [...mergedSchedules].sort((a, b) => {
                const aStart = Number.isFinite(a._startTimestamp) ? a._startTimestamp : null;
                const bStart = Number.isFinite(b._startTimestamp) ? b._startTimestamp : null;
                if (aStart && bStart) {
                    if (aStart !== bStart) return aStart - bStart;
                } else if (aStart && !bStart) {
                    return -1;
                } else if (!aStart && bStart) {
                    return 1;
                }

                const ma = getEarliestMonth(a);
                const mb = getEarliestMonth(b);
                if (ma !== mb) return ma - mb;

                const aDay = Number.isFinite(a._firstDayIndex) ? a._firstDayIndex : 99;
                const bDay = Number.isFinite(b._firstDayIndex) ? b._firstDayIndex : 99;
                if (aDay !== bDay) return aDay - bDay;

                const aTime = Number.isFinite(a._timeMinutes) ? a._timeMinutes : 24 * 60;
                const bTime = Number.isFinite(b._timeMinutes) ? b._timeMinutes : 24 * 60;
                if (aTime !== bTime) return aTime - bTime;

                const aLen = Array.isArray(a.scheduleDays) ? a.scheduleDays.length : 99;
                const bLen = Array.isArray(b.scheduleDays) ? b.scheduleDays.length : 99;
                if (aLen !== bLen) return aLen - bLen;

                const aEnd = Number.isFinite(a._endTimestamp) ? a._endTimestamp : null;
                const bEnd = Number.isFinite(b._endTimestamp) ? b._endTimestamp : null;
                if (aEnd && bEnd) return aEnd - bEnd;
                if (aEnd && !bEnd) return -1;
                if (!aEnd && bEnd) return 1;

                return 0;
            });
            
            scheduleCards = sortedSchedules.map(schedule => {
                const isEvent = schedule && schedule.__type === 'event';

                const eventDateTimeParts = isEvent ? formatEventDateTimeParts(schedule) : { dateText: '', timeText: '' };
                const eventDateText = eventDateTimeParts.dateText || '';
                const eventTimeText = eventDateTimeParts.timeText || '';
                const eventTypeText = isEvent ? (schedule.eventType || '') : '';
                const eventSubtitleText = isEvent ? (schedule.subtitle || '') : '';
                const eventCardSubtitleText = isEvent ? (eventSubtitleText || eventTypeText) : '';
                const onSaleTag = (isEvent && schedule.isOnSale) ? `
                    <div style="position:absolute; top: 10px; right: 10px; background:#dc3545; color:#fff; font-weight:700; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 999px; letter-spacing: 0.02em;">
                        On Sale
                    </div>` : '';

                // Parse days - format as "Monday - Friday" or list individual days
                let daysText = '';
                if (schedule.scheduleDays && Array.isArray(schedule.scheduleDays) && schedule.scheduleDays.length > 0) {
                    const days = schedule.scheduleDays;
                    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                    const allWeekdays = weekdays.every(day => days.includes(day));
                    
                    if (allWeekdays && days.length === 5) {
                        daysText = 'Monday - Friday';
                    } else if (days.length === 1) {
                        daysText = days[0];
                    } else if (days.length === 2) {
                        daysText = days.join(' and ');
                    } else {
                        daysText = days.join(', ');
                    }
                }
                
                // Parse time - the ScheduleTime field already contains the full time range
                let timeText = '';
                if (schedule.scheduleTime) {
                    timeText = schedule.scheduleTime;
                    
                    // Append Time Zone (Eastern or Central only)
                    if (schedule.timezone) {
                        const tz = schedule.timezone.toLowerCase();
                        if (tz.includes('eastern')) {
                            timeText += ' (Eastern)';
                        } else if (tz.includes('central')) {
                            timeText += ' (Central)';
                        }
                    }
                }
                
                // Parse months for tooltip - summarize into readable ranges
                            const months = schedule.programRunsIn && Array.isArray(schedule.programRunsIn)
                                ? this.summarizeMonths(schedule.programRunsIn)
                                : '';
                const registrationMonths = schedule.registrationOpensIn && Array.isArray(schedule.registrationOpensIn)
                    ? this.summarizeMonths(schedule.registrationOpensIn)
                    : '';
                
                // Wrap registration months after first month
                let wrappedRegistrationMonths = '';
                if (registrationMonths) {
                    const parts = registrationMonths.split(',');
                    if (parts.length > 1) {
                        wrappedRegistrationMonths = parts[0] + ',<br>' + parts.slice(1).join(',');
                    } else {
                        wrappedRegistrationMonths = registrationMonths;
                    }
                }
                
                // Get schedule disclaimer if available
                const disclaimer = schedule.scheduleDisclaimer || '';
                
                // Wrap occurs value every 3 words to prevent card expansion
                let wrappedMonths = '';
                if (months) {
                    const words = months.split(' ');
                    const chunks = [];
                    for (let i = 0; i < words.length; i += 3) {
                        chunks.push(words.slice(i, i + 3).join(' '));
                    }
                    wrappedMonths = chunks.join('<br>');
                }
                
                // Wrap disclaimer every 3 words to prevent card expansion
                let wrappedDisclaimer = '';
                if (disclaimer) {
                    const words = disclaimer.split(' ');
                    const chunks = [];
                    for (let i = 0; i < words.length; i += 3) {
                        chunks.push(words.slice(i, i + 3).join(' '));
                    }
                    wrappedDisclaimer = chunks.join('<br>');
                }
                
                // Create expandable info section if we have additional details
                const hasAdditionalInfo = months || registrationMonths || disclaimer;
                const scheduleId = `schedule-${schedule.id}`;
                
                const modalType = isEvent ? `event-${schedule.id}` : `schedule-${schedule.id}`;

                const expandableInfo = `
                    <div class="mt-2" style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline-primary rsyc-details-btn-desktop view-all-btn" data-modal="rsyc-modal-${modalType}" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; display: none;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                            View Full Details
                        </button>
                        <button class="btn btn-outline-primary rsyc-details-btn-mobile" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; display: none;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                            View Full Details
                        </button>
                    </div>
                `;
                
                // Helper to check if a field has content
                const hasContent = (field) => typeof field === 'string' && field.trim() !== '';
                
                // Create modal with full schedule details
                const scheduleModal = `
<!-- Modal for Schedule Details -->
<div id="rsyc-modal-schedule-${schedule.id}" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3>What's Happening</h3>
            <div style="display:flex; gap:0.25rem; align-items:center;">
                <button class="rsyc-modal-print" onclick="printRSYCModal('schedule-${schedule.id}')" style="background:none; border:none; cursor:pointer; font-size:1.1rem; padding:0.4rem; color:#333;" title="Print or Save as PDF"><i class="bi bi-printer"></i></button>
                <button class="rsyc-modal-close" onclick="closeRSYCModal('schedule-${schedule.id}')" style="font-size:1.5rem; padding:0 0.5rem;">&times;</button>
            </div>
        </div>
        <div class="rsyc-modal-body" style="color:#333;">
            ${schedule.videoEmbedCode ? `
                <div class="mb-4">
                    <div class="ratio ratio-16x9" style="border-radius: 12px; overflow: hidden;">
                        ${schedule.videoEmbedCode}
                    </div>
                </div>
            ` : ''}
            ${schedule.centerName ? `<div class="mb-3" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                <div style="font-size:1.1rem; font-weight:600; color:#0C0C0C;"><strong>${this.escapeHTML(center.name || center.Title)}</strong></div>
                <img src="https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg" alt="Red Shield Youth Centers Logo" style="height:42px; max-width:120px; width:auto; object-fit:contain; display:block;" />
            </div>` : ''}
            ${schedule.title ? `<h3 class="mb-2" style="color:#333;">${this.escapeHTML(schedule.title)}</h3>` : ''}
            ${isEvent && (eventTypeText || eventSubtitleText) ? `<div class="mb-3" style="font-size: 1.1rem; color:#333;">
                ${eventTypeText ? `<div><strong>Type:</strong><br>${this.escapeHTML(eventTypeText)}</div>` : ''}
                ${eventSubtitleText ? `<div style="margin-top:0.5rem;"><strong>Subtitle:</strong><br>${this.escapeHTML(eventSubtitleText)}</div>` : ''}
            </div>` : ''}
            ${(!isEvent && schedule.subtitle) ? `<p class="mb-3" style="color:#666; font-style:italic;">${this.escapeHTML(schedule.subtitle)}</p>` : ''}
            ${schedule.description ? `<p class="mb-1 rsyc-description">${schedule.description}</p>` : ''}
            ${isEvent && (eventDateText || eventTimeText) ? `<div class="mb-3" style="font-size: 1.1rem; color:#333;">
                ${eventDateText ? `<div><strong>Date:</strong><br>${this.escapeHTML(eventDateText)}</div>` : ''}
                ${eventTimeText ? `<div style="margin-top:0.5rem;"><strong>Time:</strong><br>${this.escapeHTML(eventTimeText)}</div>` : ''}
            </div>` : ''}
            ${isEvent && schedule.cost ? `<div class="mb-3" style="font-size: 1.1rem; color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}

            ${isEvent && (schedule.primaryButtonUrl || schedule.secondaryButtonUrl) ? `
            <div class="mb-4" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                ${schedule.primaryButtonUrl ? `<a class="btn btn-primary" href="${this.escapeHTML(schedule.primaryButtonUrl)}" target="_blank" rel="noopener noreferrer" style="background-color:#00929C; border:none;">${this.escapeHTML(schedule.primaryButtonText || 'Learn More')}</a>` : ''}
                ${schedule.secondaryButtonUrl ? `<a class="btn btn-outline-primary" href="${this.escapeHTML(schedule.secondaryButtonUrl)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(schedule.secondaryButtonText || 'More Info')}</a>` : ''}
            </div>
            ` : ''}
            
            ${hasContent(schedule.scheduleDisclaimer) ? `<div class="mb-4 rsyc-important-dates" style="background:#fff3cd; padding:1rem; border-radius:6px; border-left:3px solid #ff6b6b; color:#000;"><strong class="rsyc-important-dates-title" style="color:#000;"><i class="bi bi-exclamation-triangle me-2"></i>Important Dates/Closures:</strong><br><div class="mt-2 rsyc-important-dates-body" style="font-size:0.95rem;">${this.escapeHTML(schedule.scheduleDisclaimer)}</div></div>` : ''}
            
            <div class="row">
                ${(!isEvent && hasContent(daysText)) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${this.escapeHTML(daysText)}</div>` : ''}
                ${(!isEvent && hasContent(timeText)) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${this.escapeHTML(timeText)}</div>` : ''}
                ${hasContent(months) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Runs In:</strong><br>${this.escapeHTML(months)}</div>` : ''}
                ${hasContent(registrationMonths) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Opens:</strong><br>${this.escapeHTML(registrationMonths)}</div>` : ''}
                ${hasContent(schedule.registrationFee) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Fee:</strong><br>${this.escapeHTML(schedule.registrationFee)}</div>` : ''}
                ${hasContent(schedule.ageRange) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Ages:</strong><br>${this.escapeHTML(schedule.ageRange)}</div>` : ''}
                ${hasContent(schedule.startDate) || hasContent(schedule.endDate) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Dates:</strong><br>${hasContent(schedule.startDate) ? this.escapeHTML(schedule.startDate) : ''} ${hasContent(schedule.startDate) && hasContent(schedule.endDate) ? '-' : ''} ${hasContent(schedule.endDate) ? this.escapeHTML(schedule.endDate) : ''}</div>` : ''}
                
                ${hasContent(schedule.registrationDeadline) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Deadline:</strong><br>${this.escapeHTML(schedule.registrationDeadline)}</div>` : ''}
                ${(!isEvent && hasContent(schedule.location)) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Location:</strong><br>${this.escapeHTML(schedule.location)}</div>` : ''}
                ${(!isEvent && hasContent(schedule.cost)) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}
                ${hasContent(schedule.frequency) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Frequency:</strong><br>${this.escapeHTML(schedule.frequency)}</div>` : ''}
                ${hasContent(months) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Runs In:</strong><br>${this.escapeHTML(months)}</div>` : ''}
                ${hasContent(registrationMonths) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Opens:</strong><br>${this.escapeHTML(registrationMonths)}</div>` : ''}
                ${hasContent(schedule.registrationDeadline) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Deadline:</strong><br>${this.escapeHTML(schedule.registrationDeadline)}</div>` : ''}
                ${hasContent(schedule.registrationFee) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Fee:</strong><br>${this.escapeHTML(schedule.registrationFee)}</div>` : ''}
                ${(!isEvent && hasContent(schedule.cost)) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}
                ${(!isEvent && hasContent(schedule.location)) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Location:</strong><br>${this.escapeHTML(schedule.location)}</div>` : ''}
                ${hasContent(schedule.capacity) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Capacity:</strong><br>${this.escapeHTML(schedule.capacity)}</div>` : ''}
                
                ${hasContent(schedule.agesServed?.join(', ')) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Ages:</strong><br>${this.escapeHTML(schedule.agesServed.join(', '))}</div>` : ''}
                ${hasContent(schedule.startDate) || hasContent(schedule.endDate) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Dates:</strong><br>${hasContent(schedule.startDate) ? this.escapeHTML(schedule.startDate) : ''} ${hasContent(schedule.startDate) && hasContent(schedule.endDate) ? '-' : ''} ${hasContent(schedule.endDate) ? this.escapeHTML(schedule.endDate) : ''}</div>` : ''}
                
                ${hasContent(schedule.transportationFeeandDetails) ? `<div class="col-sm-12 mb-3 rsyc-transportation" style="background:#fff9ea; padding:1rem; border-radius:6px; border-left:3px solid #ffb300; color:#333;"><strong style="color:#e6a800;"><i class="bi bi-bus-front me-2"></i>Transportation:</strong><br><div class="mt-1 rsyc-transportation-value" style="font-size:0.95rem;">${this.preserveLineBreaks(schedule.transportationFeeandDetails)}</div></div>` : ''}
                
                ${hasContent(schedule.closedDates) ? `<div class="col-sm-12 mb-3" style="background:#ffe6e6; padding:1rem; border-radius:6px; border-left:3px solid #dc3545; color:#333;"><strong style="color:#dc3545;"><i class="bi bi-calendar-x me-2"></i>Closed Dates:</strong><br>${this.preserveLineBreaks(schedule.closedDates)}</div>` : ''}
                ${hasContent(schedule.openHalfDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Half Days:</strong><br>${this.preserveLineBreaks(schedule.openHalfDayDates)}</div>` : ''}
                ${hasContent(schedule.openFullDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Full Days:</strong><br>${this.preserveLineBreaks(schedule.openFullDayDates)}</div>` : ''}
                
                ${hasContent(schedule.orientationDetails) ? `
                <div class="col-sm-12 mb-3" style="background:#fffacd; padding:1rem; border-radius:6px; border-left:3px solid #ff8c00; color:#333;">
                    <strong style="color:#000;"><i class="bi bi-info-circle me-2"></i>Orientation Details:</strong>
                    <div class="mt-2" style="font-size:0.95rem; color:#000;">${this.preserveLineBreaks(schedule.orientationDetails)}</div>
                </div>
                ` : ''}
                
                ${hasContent(schedule.whatToBring) || hasContent(schedule.materialsProvided) ? `
                <div class="col-sm-12 mb-3" style="background:#f0f8ff; padding:1rem; border-radius:6px; border-left:3px solid #4169e1; color:#333;">
                    <strong style="color:#4169e1;"><i class="bi bi-backpack2 me-2"></i>What to Bring:</strong>
                    ${hasContent(schedule.whatToBring) ? `<div class="mt-2">${this.preserveLineBreaks(schedule.whatToBring)}</div>` : ''}
                    ${hasContent(schedule.materialsProvided) ? `<div class="mt-2"><u>Materials Provided:</u><br>${this.preserveLineBreaks(schedule.materialsProvided)}</div>` : ''}
                </div>
                ` : ''}
                
                ${(schedule.contacts && schedule.contacts.length > 0) || hasContent(schedule.contactInfo) ? `
                <div class="col-sm-12 mb-3 p-4" style="background:#f0f7f7; border-radius:12px; border:1px solid #d1e7e7; color:#333;">
                    <strong style="color:#20B3A8; text-transform:uppercase; font-size:1.1rem; letter-spacing:0.05rem; display:block;">Point${schedule.contacts && schedule.contacts.length > 1 ? 's' : ''} of Contact</strong>
                    ${schedule.contacts && schedule.contacts.length > 0 ? schedule.contacts.map((contact, idx) => `
                        <div class="rsyc-contact-item"${idx > 0 ? ` style="margin-top:1.2rem; padding-top:1.2rem; border-top:1px solid rgba(32,179,168,0.2);"` : ''}>
                            ${hasContent(contact.name) ? `<div class="rsyc-contact-name" style="font-weight:700; font-size:1.25rem; color:#111;">${this.escapeHTML(contact.name)}</div>` : ''}
                            ${hasContent(contact.jobTitle) ? `<div class="rsyc-contact-job" style="font-weight:500; color:#555; margin-bottom: 0.25rem;">${this.escapeHTML(contact.jobTitle)}</div>` : ''}
                            ${hasContent(contact.email) ? `<div class="rsyc-contact-email mt-1"><a href="mailto:${this.escapeHTML(contact.email)}" style="color:#2F4857; text-decoration:underline; font-weight:400;"><i class="bi bi-envelope-at me-2"></i>${this.escapeHTML(contact.email)}</a></div>` : ''}
                        </div>
                    `).join('') : ''}
                    ${hasContent(schedule.contactInfo) ? `<div class="mt-2 pt-2 border-top" style="font-size:0.9rem; border-top-color:rgba(32,179,168,0.2) !important;">${this.escapeHTML(schedule.contactInfo)}</div>` : ''}
                </div>
                ` : ''}
                
                ${hasContent(schedule.prerequisites) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Prerequisites:</strong><br>${this.preserveLineBreaks(schedule.prerequisites)}</div>` : ''}
                ${hasContent(schedule.dropOffPickUp) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Drop-off/Pick-up Info:</strong><br>${this.preserveLineBreaks(schedule.dropOffPickUp)}</div>` : ''}
            </div>
                
                ${(schedule.relatedPrograms && Array.isArray(schedule.relatedPrograms) && schedule.relatedPrograms.length > 0) ? `
                <div class="col-sm-12 mb-3" style="background:#f5f5f5; padding:1rem; border-radius:6px; color:#333;">
                    <strong style="color:#333; font-size:1.1rem; display:block; margin-bottom:0.75rem;"><i class="bi bi-link me-2" style="color:#20B3A8;"></i>Related Programs</strong>
                    <div class="d-flex flex-wrap gap-2">
                        ${schedule.relatedPrograms.map(p => `<span class="badge bg-primary">${this.escapeHTML(p.name)}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            ${(schedule.relatedPrograms && Array.isArray(schedule.relatedPrograms) && schedule.relatedPrograms.length > 0) ? `
            <div class="col-sm-12 mb-3" style="background:#f5f5f5; padding:1rem; border-radius:6px; color:#333;">
                <strong style="color:#333; font-size:1.1rem; display:block; margin-bottom:0.75rem;"><i class="bi bi-link me-2" style="color:#20B3A8;"></i>Related Programs</strong>
                <div class="d-flex flex-wrap gap-2">
                    ${schedule.relatedPrograms.map(p => `<span class="badge bg-primary">${this.escapeHTML(p.name)}</span>`).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    </div>
</div>`;

                // For small screens, force a break after three words of the Active value
                // For small screens, format Active text robustly and force a break after three words
                // Use formatActiveForDisplay() to normalize spacing (fixes cases like "exceptJune")
                let activeHTML = months ? this.formatActiveForDisplay(months) : '';

                // Build accordion version for small screens/iPad with same content as modal
                const accordionId = `rsyc-accordion-${schedule.id}`;
                const scheduleAccordion = isEvent ? '' : `
                <div class="rsyc-schedule-accordion" style="width: 100%; margin-bottom: 1rem; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; background: white;">
                    <div class="accordion-header" style="padding: 1rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; color: #000;" onclick="window.toggleRSYCAccordion('${accordionId}')">
                        <div style="color: #000;">
                            <h5 class="fw-bold mb-1" style="margin: 0; color: #000;">${this.escapeHTML(schedule.title)}</h5>
                            ${schedule.subtitle ? `<div class="text-muted small" style="color: #666;">${this.escapeHTML(schedule.subtitle)}</div>` : ''}
                            <p class="mb-0 mt-2" style="font-size: 0.9rem; color: #000;">
                                ${daysText ? `<strong>Days:</strong> ${this.escapeHTML(daysText)}<br>` : ''}
                                ${timeText ? `<strong>Time:</strong> ${this.escapeHTML(timeText)}` : ''}
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; margin-left: 1rem;">
                            <button class="rsyc-modal-print" onclick="event.stopPropagation(); printRSYCModal('schedule-${schedule.id}')" style="background:none; border:none; cursor:pointer; font-size:1rem; padding:0.25rem; color:#666;" title="Print"><i class="bi bi-printer"></i></button>
                            <i class="bi bi-chevron-down" id="${accordionId}-icon" style="font-size: 1.2rem; color: #666; transition: transform 0.3s;"></i>
                        </div>
                    </div>
                    <div id="${accordionId}" class="accordion-body" style="display: none; padding: 1rem; color: #333; background: white;">
                        ${schedule.videoEmbedCode ? `
                            <div class="mb-4">
                                <div class="ratio ratio-16x9" style="border-radius: 12px; overflow: hidden;">
                                    ${schedule.videoEmbedCode}
                                </div>
                            </div>
                        ` : ''}
                        ${schedule.centerName ? `<div class="mb-3" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                            <div style="font-size:1.1rem; font-weight:600; color:#0C0C0C;"><strong>${this.escapeHTML(center.name || center.Title)}</strong></div>
                            <img src="https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg" alt="Red Shield Youth Centers Logo" style="height:36px; max-width:100px; width:auto; object-fit:contain; display:block;" />
                        </div>` : ''}
                        ${schedule.title ? `<h3 class="mb-2" style="color:#333;">${this.escapeHTML(schedule.title)}</h3>` : ''}
                        ${schedule.subtitle ? `<p class="mb-3" style="color:#666; font-style:italic;">${this.escapeHTML(schedule.subtitle)}</p>` : ''}
                        ${schedule.description ? `<p class="mb-1 rsyc-description">${schedule.description}</p>` : ''}
                        
                        ${hasContent(schedule.scheduleDisclaimer) ? `<div class="mb-4" style="background:#fff3cd; padding:1rem; border-radius:6px; border-left:3px solid #ff6b6b; color:#000;"><strong style="color:#000;"><i class="bi bi-exclamation-triangle me-2"></i>Important Dates/Closures:</strong><br><div class="mt-2" style="font-size:0.95rem;">${this.escapeHTML(schedule.scheduleDisclaimer)}</div></div>` : ''}
                        
                        <div class="row">
                            ${hasContent(schedule.ageRange) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Age Range:</strong><br>${this.escapeHTML(schedule.ageRange)}</div>` : ''}
                            ${hasContent(daysText) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${this.escapeHTML(daysText)}</div>` : ''}
                            ${hasContent(timeText) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${this.escapeHTML(timeText)}</div>` : ''}
                            ${hasContent(schedule.timezone) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time Zone:</strong><br>${this.escapeHTML(schedule.timezone)}</div>` : ''}
                            ${hasContent(schedule.frequency) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Frequency:</strong><br>${this.escapeHTML(schedule.frequency)}</div>` : ''}
                            ${hasContent(months) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Runs In:</strong><br>${this.escapeHTML(months)}</div>` : ''}
                            ${hasContent(registrationMonths) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Opens:</strong><br>${this.escapeHTML(registrationMonths)}</div>` : ''}
                            ${hasContent(schedule.registrationDeadline) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Deadline:</strong><br>${this.escapeHTML(schedule.registrationDeadline)}</div>` : ''}
                            ${hasContent(schedule.registrationFee) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Fee:</strong><br>${this.escapeHTML(schedule.registrationFee)}</div>` : ''}
                            ${hasContent(schedule.cost) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}
                            ${hasContent(schedule.location) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Location:</strong><br>${this.escapeHTML(schedule.location)}</div>` : ''}
                            ${hasContent(schedule.capacity) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Capacity:</strong><br>${this.escapeHTML(schedule.capacity)}</div>` : ''}
                            
                            ${hasContent(schedule.agesServed?.join(', ')) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Ages:</strong><br>${this.escapeHTML(schedule.agesServed.join(', '))}</div>` : ''}
                            ${hasContent(schedule.startDate) || hasContent(schedule.endDate) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Dates:</strong><br>${hasContent(schedule.startDate) ? this.escapeHTML(schedule.startDate) : ''} ${hasContent(schedule.startDate) && hasContent(schedule.endDate) ? '-' : ''} ${hasContent(schedule.endDate) ? this.escapeHTML(schedule.endDate) : ''}</div>` : ''}
                            
                            ${hasContent(schedule.transportationFeeandDetails) ? `<div class="col-sm-12 mb-3 rsyc-transportation" style="background:#fff9ea; padding:1rem; border-radius:6px; border-left:3px solid #ffb300; color:#333;"><strong style="color:#e6a800;"><i class="bi bi-bus-front me-2"></i>Transportation:</strong><br><div class="mt-1 rsyc-transportation-value" style="font-size:0.95rem;">${this.preserveLineBreaks(schedule.transportationFeeandDetails)}</div></div>` : ''}
                            
                            ${hasContent(schedule.closedDates) ? `<div class="col-sm-12 mb-3" style="background:#ffe6e6; padding:1rem; border-radius:6px; border-left:3px solid #dc3545; color:#333;"><strong style="color:#dc3545;"><i class="bi bi-calendar-x me-2"></i>Closed Dates:</strong><br>${this.preserveLineBreaks(schedule.closedDates)}</div>` : ''}
                            ${hasContent(schedule.openHalfDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Half Days:</strong><br>${this.preserveLineBreaks(schedule.openHalfDayDates)}</div>` : ''}
                            ${hasContent(schedule.openFullDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Full Days:</strong><br>${this.preserveLineBreaks(schedule.openFullDayDates)}</div>` : ''}
                            
                            ${hasContent(schedule.orientationDetails) ? `
                            <div class="col-sm-12 mb-3" style="background:#fffacd; padding:1rem; border-radius:6px; border-left:3px solid #ff8c00; color:#333;">
                                <strong style="color:#000;"><i class="bi bi-info-circle me-2"></i>Orientation Details:</strong>
                                <div class="mt-2" style="font-size:0.95rem; color:#000;">${this.preserveLineBreaks(schedule.orientationDetails)}</div>
                            </div>
                            ` : ''}
                            
                            ${hasContent(schedule.whatToBring) || hasContent(schedule.materialsProvided) ? `
                            <div class="col-sm-12 mb-3" style="background:#f0f8ff; padding:1rem; border-radius:6px; border-left:3px solid #4169e1; color:#333;">
                                <strong style="color:#4169e1;"><i class="bi bi-backpack2 me-2"></i>What to Bring:</strong>
                                ${hasContent(schedule.whatToBring) ? `<div class="mt-2">${this.preserveLineBreaks(schedule.whatToBring)}</div>` : ''}
                                ${hasContent(schedule.materialsProvided) ? `<div class="mt-2"><u>Materials Provided:</u><br>${this.preserveLineBreaks(schedule.materialsProvided)}</div>` : ''}
                            </div>
                            ` : ''}
                            
                            ${(schedule.contacts && schedule.contacts.length > 0) || hasContent(schedule.contactInfo) ? `
                            <div class="col-sm-12 mb-3 p-3" style="background:#f0f7f7; border-radius:10px; border:1px solid #d1e7e7; color:#333;">
                                <strong style="color:#20B3A8; text-transform:uppercase; font-size:1.5rem; letter-spacing:0.05rem; display:block; margin-bottom:0.5rem;">Point${schedule.contacts && schedule.contacts.length > 1 ? 's' : ''} of Contact</strong>
                                ${schedule.contacts && schedule.contacts.length > 0 ? schedule.contacts.map((contact, idx) => `
                                    <div${idx > 0 ? ` style="margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(32,179,168,0.15);"` : ''}>
                                        ${hasContent(contact.name) ? `<div style="font-weight:700; font-size:1.5rem;">${this.escapeHTML(contact.name)}</div>` : ''}
                                        ${hasContent(contact.jobTitle) ? `<div class="small text-muted" style="font-weight:500;">${this.escapeHTML(contact.jobTitle)}</div>` : ''}
                                        ${hasContent(contact.email) ? `<div class="mt-2"><a href="mailto:${this.escapeHTML(contact.email)}" style="color:#2F4857; text-decoration:none; font-weight:400;"><i class="bi bi-envelope-at me-2"></i>${this.escapeHTML(contact.email)}</a></div>` : ''}
                                    </div>
                                `).join('') : ''}
                                ${hasContent(schedule.contactInfo) ? `<div class="mt-2 pt-2 border-top" style="font-size:0.9rem; border-top-color:rgba(32,179,168,0.2) !important;">${this.escapeHTML(schedule.contactInfo)}</div>` : ''}
                            </div>
                            ` : ''}
                            
                            ${hasContent(schedule.prerequisites) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Prerequisites:</strong><br>${this.preserveLineBreaks(schedule.prerequisites)}</div>` : ''}
                            ${hasContent(schedule.dropOffPickUp) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Drop-off/Pick-up Info:</strong><br>${this.preserveLineBreaks(schedule.dropOffPickUp)}</div>` : ''}
                        </div>
                        
                        ${(schedule.relatedPrograms && Array.isArray(schedule.relatedPrograms) && schedule.relatedPrograms.length > 0) ? `
                        <div class="col-sm-12 mb-3" style="background:#f5f5f5; padding:1rem; border-radius:6px; color:#333;">
                            <strong style="color:#333; font-size:1.1rem; display:block; margin-bottom:0.75rem;"><i class="bi bi-link me-2" style="color:#20B3A8;"></i>Related Programs</strong>
                            <div class="d-flex flex-wrap gap-2">
                                ${schedule.relatedPrograms.map(p => `<span class="badge bg-primary">${this.escapeHTML(p.name)}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                `;
                
                // Only append schedule modals for non-events.
                // Events reuse the shared event modal defined in the Events section.
                if (!isEvent) {
                    scheduleModals += scheduleModal;
                }

                return `
                    <div>
                        <!-- Desktop Card Version -->
                        <div class="schedule-card rsyc-schedule-card-desktop text-dark" style="min-width:230px;padding:1rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;flex-direction:column;height:100%;gap:0.75rem; position:relative;">
                            ${onSaleTag}
                            <div style="flex-shrink:0;">
                                <h5 class="fw-bold mb-1">${this.escapeHTML(schedule.title)}</h5>
                                ${isEvent && eventCardSubtitleText ? `<div class="text-muted small">${this.escapeHTML(eventCardSubtitleText)}</div>` : ''}
                                ${!isEvent && schedule.subtitle ? `<div class="text-muted small">${this.escapeHTML(schedule.subtitle)}</div>` : ''}
                            </div>
                            <div style="flex-grow:1;display:flex;flex-direction:column;">
                                <p class="mb-0">
                                    ${isEvent && eventDateText ? `<strong>Date:</strong> ${this.escapeHTML(eventDateText)}<br>` : ''}
                                    ${isEvent && eventTimeText ? `<strong>Time:</strong> ${this.escapeHTML(eventTimeText)}<br>` : ''}
                                    ${!isEvent && daysText ? `<strong>Days:</strong> <span class="d-inline-block">${this.escapeHTML(daysText)}</span><br>` : ''}
                                    ${!isEvent && timeText ? `<strong>Time:</strong> ${this.escapeHTML(timeText)}<br>` : ''}
                                </p>
                            </div>
                            <div style="flex-shrink:0;">
                                ${expandableInfo}
                            </div>
                        </div>
                        
                        <!-- Mobile Accordion Version -->
                        <div class="rsyc-schedule-accordion-mobile" style="display: none;">
                            ${scheduleAccordion}
                        </div>
                        
                        
                    </div>
                    `;
            }).join('');
            
            // Conditionally center if 3 or fewer cards, otherwise left-align for proper scrolling
            const justifyContent = mergedSchedules.length <= 3 ? 'justify-content-center' : '';
            const scrollHint = mergedSchedules.length > 3 ? `
    <p class="text-center mb-n2">
        <small class="text-light">
            Scroll to view more 
            <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
        </small>
    </p>` : '';
            
            // Store schedules in global variable for printing
            if (typeof window.RSYC_SCHEDULES === 'undefined') {
                window.RSYC_SCHEDULES = {};
            }
            const schedulesCacheKey = `schedules_${center.id || 'default'}`;
            const photoData = data.photos && data.photos.length > 0 ? data.photos[0] : null;
            const exteriorPhoto = photoData?.urlExteriorPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';
            window.RSYC_SCHEDULES[schedulesCacheKey] = {
                centerName: center.name || center.Title,
                aboutText: center.aboutText || '',
                exteriorPhoto: exteriorPhoto,
                schedules: sortedSchedules
            };
            
            scheduleScrollSection = `
    ${scrollHint}

    <div class="horizontal-scroll ${justifyContent}" style="display:flex;gap:1rem;overflow-x:auto;overflow-y:visible;padding-bottom:0.5rem;align-items:stretch;">
        ${scheduleCards}
    </div>
    
    <div class="text-center mt-4">
        <button class="btn btn-outline-primary" onclick="printAllSchedules('${schedulesCacheKey}')" style="border-color:#d3d3d3; color:#d3d3d3;">
            <i class="bi bi-printer me-2"></i>Print / Save all as PDF
        </button>
    </div>`;
        }
        
        // About This Center renders via the dedicated 'about' section.
        
        // Build social network links
        let socialSection = '';
        const hasFacebook = center.facebookURL;
        const hasInstagram = center.instagramURL;
        const hasTwitter = center.twitterURL;
        const hasLinkedIn = center.linkedInURL;
        const hasYouTube = center.youTubeURL;
        
        if (hasFacebook || hasInstagram || hasTwitter || hasLinkedIn || hasYouTube) {
            const socialIcons = [];
            if (hasFacebook) {
                socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(center.facebookURL)}" target="_blank"><i class="bi bi-facebook" style="font-size:1.45rem;"></i></a>`);
            }
            if (hasInstagram) {
                socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(center.instagramURL)}" target="_blank"><i class="bi bi-instagram" style="font-size:1.45rem;"></i></a>`);
            }
            if (hasLinkedIn) {
                socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(center.linkedInURL)}" target="_blank"><i class="bi bi-linkedin" style="font-size:1.45rem;"></i></a>`);
            }
            if (hasYouTube) {
                socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(center.youTubeURL)}" target="_blank"><i class="bi bi-youtube" style="font-size:1.45rem;"></i></a>`);
            }
            if (hasTwitter) {
                socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(center.twitterURL)}" target="_blank"><i class="bi bi-twitter" style="font-size:1.45rem;"></i></a>`);
            }
            
            socialSection = `
    <div class="mt-4 text-center">
        <h4 class="fw-bold mb-3 text-white">Follow Us</h4>
        <div class="d-flex justify-content-center gap-3 mb-4">
            ${socialIcons.join(' ')}
        </div>
    </div>`;
        }

        // If there is no schedules and no social links, don't render the entire section
        if ((!scheduleCards || scheduleCards.trim() === '') && (!socialSection || socialSection.trim() === '')) {
            return '';
        }

        return `<!-- Program Schedules -->
<div id="freeTextArea-schedules" class="freeTextArea u-centerBgImage section u-coverBgImage" style="background-color: #00929C; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="mt-0 mb-5">
                ${scheduleTitleSection}
                
                <div class="schedule-scroll-wrapper">
                    ${scheduleScrollSection}
                </div>
                
                ${socialSection}
                ${scheduleModals}
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Hours of Operation Section
     */
    /**
     * Hours of Operation Section (Symphony Format)
     */
    generateHours(data) {
        const { hours } = data;
        console.log('🕐 generateHours called with:', { 
            hours, 
            hasHours: !!hours,
            regularHours: hours?.regularHours,
            summerHours: hours?.summerHours
        });
        if (!hours) {
            console.warn('⚠️ No hours data, returning empty string');
            return '';
        }
        
        // Check if regularHours or summerHours exist
        if (!hours.regularHours && !hours.summerHours) {
            console.warn('⚠️ No regularHours or summerHours found in hours object');
            return '';
        }

        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // Generate unique IDs for each section
        const regularId = Date.now().toString();
        const summerId = (Date.now() + 1).toString();

        // Helper function to generate scripts for each day
        const generateDayScripts = (sectionId, day, dayTitle, openTime, closeTime) => {
            if (!openTime || openTime.toLowerCase() === 'closed') {
                return '';
            }
            
            return `
			<script type="text/javascript">
				var section = $.grep(symphony.operationHoursSections, function (x) { return x.id == '${sectionId}'; })[0];
				if (section) {
					if (!section.hours) {
						section.hours = [];
					}
					section.hours.push({
						title: '${dayTitle}',
						name: '${day}',
						open: '${openTime}',
						close: '${closeTime}'
					});
				} else {
					symphony.operationHoursSections.push({
						id: '${sectionId}',
						hours: [
							{
								title: '${dayTitle}',
								name: '${day}',
								open: '${openTime}',
								close: '${closeTime}'
							}
						]
					});
				}
			</script>`;
        };

        // Helper function to parse time (handles formats like "3:00 PM - 8:00 PM" or "Closed")
        const parseTimeRange = (timeStr) => {
            if (!timeStr || timeStr.toLowerCase().includes('closed')) {
                return { open: null, close: null };
            }
            
            const parts = timeStr.split('-').map(t => t.trim());
            if (parts.length === 2) {
                return { open: parts[0], close: parts[1] };
            }
            return { open: null, close: null };
        };

        // Helper function to get current day for "u-bold" class
        const getCurrentDay = () => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            return days[new Date().getDay()];
        };
        const currentDay = getCurrentDay();

        // Generate Regular Hours Section
        let regularScripts = '';
        let regularHoursLines = '';
        
        daysOfWeek.forEach((day, index) => {
            const timeStr = hours.regularHours[day];
            const { open, close } = parseTimeRange(timeStr);
            
            if (open && close) {
                regularScripts += generateDayScripts(regularId, day, dayAbbr[index], open, close);
            }
            
            const boldClass = day === currentDay ? ' u-bold' : '';
            const displayTime = (open && close) ? `${open} - ${close}`.replace(':00 ', ' ') : 'CLOSED';
            
            regularHoursLines += `
										<div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-${day}-ui${boldClass}">
											${dayNames[index]}
												${(open && close) ? `<div class="u-floatRight u-clear">
														${displayTime}
													</div>` : `<div class="u-floatRight">
${displayTime}												</div>`}
										</div>
`;
        });

        const regularEffective = hours.regularTerm || 'August - May';

        // Check if summer hours exist
        const hasSummerHours = daysOfWeek.some(day => hours.summerHours && hours.summerHours[day]);
        
        let summerSection = '';
        if (hasSummerHours) {
            let summerScripts = '';
            let summerHoursLines = '';
            
            daysOfWeek.forEach((day, index) => {
                const timeStr = hours.summerHours[day];
                const { open, close } = parseTimeRange(timeStr);
                
                if (open && close) {
                    summerScripts += generateDayScripts(summerId, day, dayAbbr[index], open, close);
                }
                
                const boldClass = day === currentDay ? ' u-bold' : '';
                const displayTime = (open && close) ? `${open} - ${close}`.replace(':00 ', ' ') : 'CLOSED';
                
                summerHoursLines += `
										<div class="operationHoursAdvanced-hoursLine operationHoursAdvanced-${day}-ui${boldClass}">
											${dayNames[index]}
												${(open && close) ? `<div class="u-floatRight u-clear">
														${displayTime}
													</div>` : `<div class="u-floatRight">
${displayTime}												</div>`}
										</div>
`;
            });

            const summerEffective = this.getComplementMonths(regularEffective);

            summerSection = `
						<div id="operationHoursAdvanced-${summerId}" class="operationHoursAdvanced-featured">
							<div class="operationHoursAdvanced-head" style="background-image:url(https://s3.amazonaws.com/uss-cache.salvationarmy.org/276157b4-8271-4978-914f-f2ae9d7354ec_Summer+Sunflower+With+Glasses.jpg)"></div>
							<div class="operationHoursAdvanced-body">
								<div class="operationHoursAdvanced-title" onclick="symphony.expandOperationHours(this)">
									Summer Hours
									<div class="operationHoursAdvanced-expandToggle fas fa-chevron-down"></div>
									<div class="operationHoursAdvanced-openSign">
										<div>OPEN</div><span>Opens at ${hours.summerHours.monday ? parseTimeRange(hours.summerHours.monday).open : '9 AM'}</span>
									</div>
								</div>
${summerScripts}
${summerHoursLines}
								<p>
	<span style="font-size:18px;"><strong>Effective:</strong> ${summerEffective}</span>
</p>

							</div>
						</div>
`;
        }

        return `<!-- Hours of Operation -->
	<script type="text/javascript">
		var symphony = symphony || {};
		symphony.operationHoursSections = symphony.operationHoursSections || [];
	</script>

    <div class="section operationHoursAdvanced-container" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">

		<div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">

						<div id="operationHoursAdvanced-${regularId}" class="operationHoursAdvanced-featured">
							<div class="operationHoursAdvanced-head" style="background-image:url(https://s3.amazonaws.com/uss-cache.salvationarmy.org/cf37a78a-dde2-45fb-8f51-3440812a0bc1_School+Books+Background.jpg)"></div>
							<div class="operationHoursAdvanced-body">
								<div class="operationHoursAdvanced-title" onclick="symphony.expandOperationHours(this)">
									Regular Hours
									<div class="operationHoursAdvanced-expandToggle fas fa-chevron-down"></div>
									<div class="operationHoursAdvanced-openSign">
										<div>OPEN</div><span>Opens at ${hours.regularHours.monday ? parseTimeRange(hours.regularHours.monday).open : '3 PM'}</span>
									</div>
								</div>
${regularScripts}
${regularHoursLines}
								<p>
	<span style="font-size:18px;"><strong>Effective:</strong> ${regularEffective}</span>
</p>

							</div>
						</div>
${summerSection}

			<div class="u-clear"></div>



		</div>

	</div>`;
    }

    /**
     * Facility Features Section
     */
    generateFacilities(data) {
        const { center, facilityFeatures, photos } = data;
        const hasFeatures = facilityFeatures && facilityFeatures.length > 0;

        // Hide section if no features provided
        if (!hasFeatures) return '';

        // Get facility photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const facilityPhoto = photoData?.urlFacilityFeaturesPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';

        let featuresHTML = '';
        let viewAllButton = '';
        let modal = '';

        if (hasFeatures) {
            // Alphabetically sort facility features by name
            const sortedFeatures = [...facilityFeatures].sort((a, b) => 
                (a.name || '').localeCompare(b.name || '')
            );

            const totalFeatures = sortedFeatures.length;
            const threshold = 8;
            const hasManyFeatures = totalFeatures > threshold;
            const displayFeatures = hasManyFeatures ? sortedFeatures.slice(0, threshold) : sortedFeatures;

            const buttonLabel = hasManyFeatures ? `View All ${totalFeatures} Features` : 'View More Details';

            featuresHTML = displayFeatures.map(feature => {
                const icon = feature.biClass || 'bi-check-circle';
                return `
          <div class="d-flex align-items-center mb-3 rsyc-feature-item" style="flex:1 1 45%;">
            <i class="bi ${this.escapeHTML(icon)} feature-icon me-2"></i> 
            <span>${this.escapeHTML(feature.name)}</span>
          </div>`;
            }).join('');

            // All features for modal (sorted)
            const allFeaturesHTML = sortedFeatures.map(feature => {
                const icon = feature.biClass || 'bi-check-circle';
                const description = feature.description || '';
                return `
          <div class="col-sm-12 col-md-6 mb-4">
            <div class="d-flex align-items-start">
                <i class="bi ${this.escapeHTML(icon)} feature-icon me-3 mt-1" style="font-size: 1.5rem;"></i>
                <div>
                    <div class="fw-bold" style="font-size: 1.1rem;">${this.escapeHTML(feature.name)}</div>
                    ${description ? `<div class="text-muted small mt-1" style="line-height: 1.4;">${this.escapeHTML(description)}</div>` : ''}
                </div>
            </div>
          </div>`;
            }).join('');

            viewAllButton = `
                            <div class="text-center mt-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showRSYCModal('facilities', '${this.escapeHTML(center.name, true)}')">
                                    ${buttonLabel}
                                </button>
                            </div>`;

            modal = `
<!-- Modal for All Facilities -->
<div id="rsyc-modal-facilities" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>All Facility Features</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('facilities')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <div class="row">
                ${allFeaturesHTML}
            </div>
        </div>
    </div>
</div>`;
        }

        return `<!-- Facility Features -->
<div id="freeTextArea-facilities" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="row align-items-stretch">
                    <!-- Left block: Facility Features (7 columns) -->
                    <div class="col-lg-7 d-flex order-2 order-lg-1">
                        <div class="hover-card p-4 flex-fill d-flex flex-column">
                            <i class="bi bi-building icon-lg mb-3"></i>
                            <h2 class="fw-bold mb-4">Facility <em>Features</em></h2>
                            
                            <div class="d-flex flex-wrap justify-content-between mt-auto">
                                ${featuresHTML}
                            </div>
                            ${viewAllButton}
                        </div>
                    </div>

                    <!-- Right block: Photo (5 columns) -->
                    <div class="col-lg-5 d-flex mt-4 mt-lg-0 order-1 order-lg-2">
                        <div class="photo-card w-100 h-100" style="aspect-ratio: 1 / 1; min-width: 100%; min-height: auto;">
                            ${facilityPhoto ? `
                            <img alt="Facility Exterior" 
                                 src="${this.escapeHTML(facilityPhoto)}" 
                                 class="img-fluid w-100 h-100" 
                                 style="object-fit:cover; object-position: center;">
                            ` : `
                            <div class="bg-light w-100 h-100 d-flex align-items-center justify-content-center" style="min-height:300px;">
                                <p class="text-muted">Facility Photo</p>
                            </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
${modal}`;
    }

    /**
     * Staff & Leadership Section
     */
    generateStaff(data) {
        try {
            const { leaders, center } = data;
            if (!leaders || leaders.length === 0) return '';

            // Default photo for all staff - will be manually replaced later
            const defaultPhoto = 'https://8hxvw8tw.media.zestyio.com/SAL_Leaders_Desktop-2.png';

        // Order staff by prioritized role types. This list is configurable from the publisher UI
        // and is saved to localStorage under 'rsycRoleOrder'. The UI script (rsyc-staff-order.js)
        // exposes the current order on window.RSYC.roleOrder.
        const priorityRoles = (function(){
            try{
                if(window.RSYC && Array.isArray(window.RSYC.roleOrder) && window.RSYC.roleOrder.length) return window.RSYC.roleOrder.slice();
                const raw = localStorage.getItem('rsycRoleOrder');
                if(raw){
                    const parsed = JSON.parse(raw);
                    if(Array.isArray(parsed) && parsed.length) return parsed;
                }
            }catch(e){ /* ignore and fall back to defaults */ }
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
            // Normalize
            if (!role) return priorityRoles.length;
            const r = role.toString().toLowerCase().trim();

            // 1) Exact match (case-insensitive)
            const exactIdx = priorityRoles.findIndex(pr => pr.toLowerCase() === r);
            if (exactIdx !== -1) return exactIdx;

            // Tokenize role and priority roles
            const roleTokens = r.split(/[^a-z0-9]+/).filter(Boolean);
            if (!roleTokens.length) return priorityRoles.length;

            // Use the last token as the base (e.g., 'coordinator', 'director')
            const base = roleTokens[roleTokens.length - 1];

            // 2) Prefer a priority role that contains the same base token
            const baseMatchIdx = priorityRoles.findIndex(pr => {
                const prTokens = pr.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                return prTokens.includes(base);
            });
            if (baseMatchIdx !== -1) return baseMatchIdx;

            // 3) Fallback: find any priority role whose tokens appear in the role string
            const substringIdx = priorityRoles.findIndex(pr => {
                const prTokens = pr.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                return prTokens.some(t => roleTokens.includes(t));
            });
            if (substringIdx !== -1) return substringIdx;

            // 4) As a last resort, see if the role string contains the full priority phrase
            const phraseIdx = priorityRoles.findIndex(pr => r.includes(pr.toLowerCase()));
            if (phraseIdx !== -1) return phraseIdx;

            // Unknown roles go to the end
            return priorityRoles.length;
        };

        const sorted = [...leaders].sort((a, b) => {
            // 1) Explicit Sort order (higher priority than roles)
            // Use Number.parseFloat and handle NaN to ensure consistent sorting
            const rawA = parseFloat(a.Sort);
            const rawB = parseFloat(b.Sort);
            const sortA = !isNaN(rawA) ? rawA : 1000;
            const sortB = !isNaN(rawB) ? rawB : 1000;

            if (sortA !== sortB) {
                return sortA - sortB;
            }

            // prefer roleType, but if roleType is 'Other' (or contains 'other')
            // use the actual positionTitle from the record so specific titles are respected
            const rawRoleA = (a.roleType || '').toString();
            let roleA = '';
            if (rawRoleA && !/\bother\b/i.test(rawRoleA)) {
                roleA = rawRoleA;
            } else {
                roleA = (a.positionTitle || rawRoleA || '').toString();
            }

            const rawRoleB = (b.roleType || '').toString();
            let roleB = '';
            if (rawRoleB && !/\bother\b/i.test(rawRoleB)) {
                roleB = rawRoleB;
            } else {
                roleB = (b.positionTitle || rawRoleB || '').toString();
            }
            const pA = getPriority(roleA);
            const pB = getPriority(roleB);
            if (pA !== pB) return pA - pB;

            // If both mapped to the same priority, prefer the leader whose role string
            // exactly matches the priority role (e.g., 'Program Coordinator') so the
            // official Program Coordinator appears before other coordinator types.
            const pr = priorityRoles[pA] || '';
            const isExactA = pr && roleA.toLowerCase() === pr.toLowerCase();
            const isExactB = pr && roleB.toLowerCase() === pr.toLowerCase();
            if (isExactA !== isExactB) return isExactA ? -1 : 1;

            // If still tied, sort by person name (primary then alternate)
            const nameA = ((a.person && (a.person.name || '')) || (a.alternateName || '')).toString();
            const nameB = ((b.person && (b.person.name || '')) || (b.alternateName || '')).toString();
            return nameA.localeCompare(nameB);
        });

        const staffCards = sorted.map(leader => {
            const person = leader.person || {};
            const primaryName = person.name || '';
            const alternate = leader.alternateName || '';

            // Display: "Primary Name (Alternate)" when both present and different
            let displayName = primaryName || alternate || 'Firstname Lastname';
            if (primaryName && alternate && primaryName.trim() !== alternate.trim()) {
                displayName = `${primaryName} (${alternate})`;
            }

            const title = leader.positionTitle || leader.roleType || 'Role or Title';
            const bio = leader.biography || 'This is a short description or contact info placeholder text. Keep it concise so all cards align perfectly.';
            const staffId = leader.id || this.slugify(`${displayName}-${title}`);
            const modalType = `staff-${this.escapeHTML(String(staffId), true)}`;

            // Prefer leader-specific image fields when available, fall back to person-level fields (including person.picture), then default
            const photo = (
                leader.imageURL || leader.ImageURL || leader.imageUrl || leader.image || leader.photo || leader.photoUrl || leader.photoURL ||
                (person && (person.picture || person.imageURL || person.imageUrl || person.photo || person.photoUrl || person.image)) ||
                defaultPhoto
            );

            // Smart crop: Use normalized faceFocus from data loader (extracts FaceFocus.Value from SharePoint)
            const faceFocus = leader.faceFocus || 'top center';
            const zoomLevel = leader.zoomLevel || 1;
            const scaleStyle = zoomLevel !== 1 ? `transform:scale(${zoomLevel});` : '';
            const objectPositionStyle = `object-position:${faceFocus};`;

            return `
		<div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; scroll-snap-align: start; border: 1px solid #dee2e6; overflow:hidden;">
			<div style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
				<img alt="${this.escapeHTML(displayName)}" class="card-img-top" src="${this.escapeHTML(photo)}" style="width:100%; height:100%; object-fit:cover; ${objectPositionStyle} ${scaleStyle} display:block;">
			</div>
			<div class="card-body d-flex flex-column">
				<div class="fw-bold mb-1" style="font-size: 1.1rem; line-height: 1.3;">${this.escapeHTML(displayName)}</div>
				<div class="text-muted mb-2" style="font-size: 0.95rem;">${this.escapeHTML(title)}</div>
				<div style="flex-grow:1;"></div>
				<button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Bio</button>
			</div>
		</div>`;
        }).join('\n');

        const staffModalGroupKey = (data && data.center && (data.center.id || data.center.sharePointId))
            ? `center-${this.escapeHTML(String(data.center.id || data.center.sharePointId), true)}`
            : `center-${this.slugify((data && data.center && (data.center.name || data.center.Title)) ? (data.center.name || data.center.Title) : 'center')}`;

        const showStaffNav = sorted.length > 1;

        const staffModals = sorted.map((leader, idx) => {
            const person = leader.person || {};
            const primaryName = person.name || '';
            const alternate = leader.alternateName || '';

            let displayName = primaryName || alternate || 'Firstname Lastname';
            if (primaryName && alternate && primaryName.trim() !== alternate.trim()) {
                displayName = `${primaryName} (${alternate})`;
            }

            const title = leader.positionTitle || leader.roleType || 'Role or Title';
            const bio = leader.biography || '';

            const staffId = leader.id || this.slugify(`${displayName}-${title}`);
            const modalType = `staff-${this.escapeHTML(String(staffId), true)}`;

            const defaultPhoto = 'https://8hxvw8tw.media.zestyio.com/SAL_Leaders_Desktop-2.png';
            const photo = (
                leader.imageURL || leader.ImageURL || leader.imageUrl || leader.image || leader.photo || leader.photoUrl || leader.photoURL ||
                (person && (person.picture || person.imageURL || person.imageUrl || person.photo || person.photoUrl || person.image)) ||
                defaultPhoto
            );

            const faceFocus = leader.faceFocus || 'top center';
            const zoomLevel = leader.zoomLevel || 1;
            const scaleStyle = zoomLevel !== 1 ? `transform:scale(${zoomLevel});` : '';
            const objectPositionStyle = `object-position:${faceFocus};`;

            const safeBio = bio && bio.trim() ? bio : 'Staff member of The Salvation Army.';

            const centerName = (data && data.center && (data.center.name || data.center.Title)) ? (data.center.name || data.center.Title) : '';
            const centerCity = (data && data.center && data.center.city) ? data.center.city : '';
            const centerState = (data && data.center && data.center.state) ? data.center.state : '';
            const centerLocation = centerCity ? `${centerCity}${centerState ? ', ' + centerState : ''}` : (centerState || '');

            return `
<div id="rsyc-modal-${modalType}" class="rsyc-modal" style="display:none;" data-rsyc-staff-group="${staffModalGroupKey}" data-rsyc-staff-index="${idx}">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>${this.escapeHTML(displayName)}</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('${modalType}')">&times;</button>
        </div>
        <div class="rsyc-modal-body" style="background-color:#F7A200; position:relative; padding-left: clamp(28px, 7vw, 84px); padding-right: clamp(28px, 7vw, 84px);">
            ${showStaffNav ? `
            <button type="button" aria-label="Previous staff" onclick="rsycNavigateStaffModal('${staffModalGroupKey}', ${idx}, -1)" style="position:absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; padding: 10px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.65); background: rgba(0,0,0,0.18); color: #fff; display:flex; align-items:center; justify-content:center; z-index: 1000002; cursor:pointer; pointer-events:auto;">
                <i class="bi bi-chevron-left"></i>
            </button>
            <button type="button" aria-label="Next staff" onclick="rsycNavigateStaffModal('${staffModalGroupKey}', ${idx}, 1)" style="position:absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; padding: 10px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.65); background: rgba(0,0,0,0.18); color: #fff; display:flex; align-items:center; justify-content:center; z-index: 1000002; cursor:pointer; pointer-events:auto;">
                <i class="bi bi-chevron-right"></i>
            </button>
            ` : ''}
            <div class="row g-4 align-items-start">
                <div class="col-12 col-lg-5">
                    <div class="card shadow border rounded-3" style="border: 1px solid #dee2e6; overflow:hidden;">
                        <div style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0;">
                            <img alt="${this.escapeHTML(displayName)}" class="card-img-top" src="${this.escapeHTML(photo)}" style="width:100%; height:100%; object-fit:cover; ${objectPositionStyle} ${scaleStyle} display:block;">
                        </div>
                        <div class="card-body">
                            <div class="fw-bold mb-1" style="font-size: 1.1rem; line-height: 1.3;">${this.escapeHTML(displayName)}</div>
                            <div class="text-muted" style="font-size: 0.95rem;">${this.escapeHTML(title)}</div>
                            ${centerName ? `<div class="text-muted" style="margin-top: 0.75rem; font-size: 0.9rem; line-height: 1.4;">
                                <div><i class="bi bi-building" style="margin-right: 0.35rem;"></i>${this.escapeHTML(centerName)}</div>
                                ${centerLocation ? `<div><i class="bi bi-geo-alt" style="margin-right: 0.35rem;"></i>${this.escapeHTML(centerLocation)}</div>` : ''}
                            </div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-7">
                    <div class="card border rounded-3" style="border: 1px solid #dee2e6;">
                        <div class="card-body">
                            <div class="fw-bold mb-2" style="font-size: 1.1rem;">Bio</div>
                            <div style="white-space: pre-wrap; font-size: 1rem; line-height: 1.7;">${this.escapeHTML(safeBio)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
        }).join('\n');

        // Conditionally show scroll hint if there are more than 3 leaders
        const scrollHint = sorted.length > 3 ? `
                    <p class="text-center mb-n2">
                        <small style="color:#eeeeee;">
                            Scroll to view more 
                            <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle; color:#eeeeee;"></i>
                        </small>
                    </p>` : '';
        
        // Center cards if 3 or fewer, otherwise leave for scrolling
        const justifyContent = sorted.length <= 3 ? 'justify-content-center' : '';

        return `<!-- Staff & Community Leaders -->
<div id="freeTextArea-staff" class="freeTextArea u-centerBgImage section u-coverBgImage" style="background-color: #F7A200; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="bg-area rounded p-4" id="profiles">
                    <h2 class="fw-bold mb-4 text-center"><span style="color:#ffffff;">Staff &amp; <em style="color:#ffffff;">Community Leaders</em></span></h2>
                    ${scrollHint}
                    
                    <div class="d-flex overflow-auto gap-4 py-2 ${justifyContent}" style="scroll-snap-type: x mandatory;">
                        ${staffCards}
                    </div>

                    ${staffModals}
                </div>
            </div>
        </div>
    </div>
</div>`;
        } catch (err) {
            console.error('[RSYC] Error generating staff section:', err);
            return '';
        }
    }

    /**
     * Nearby Centers Section
     * Static content - will be customized per center later
     */
    generateNearbyCenters(data) {
        const { center } = data;
        
        // Use center's zip code for location finder link
        const zipCode = center.zip || '27107';
        
        return `<!-- Nearby Salvation Army Centers -->
<div id="freeTextArea-nearby" class="freeTextArea u-centerBgImage section u-sa-greyVeryLightBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem;">
        <div class="container">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="row align-items-stretch flex-column-reverse flex-md-row">
                    <!-- Left block: Nearby Centers card (7 columns) -->
                    <div class="col-md-7 d-flex mb-4 mb-md-0">
                        <div class="hover-card w-100 d-flex flex-column">
                            <i class="bi bi-geo-alt icon-lg"></i>
                            <h2 class="fw-bold mb-4">Nearby <em>Salvation Army</em> Centers</h2>
                            
                            <!-- Icons row: 2 columns per row -->
                            <div class="d-flex flex-wrap justify-content-between mt-auto">
                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Winston-Salem Citadel Corps<br>
                                        <span style="font-size:12px;">(2 miles away)</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Winston-Salem Kernersville Corps<br>
                                        <span style="font-size:12px;">(10 miles away)</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Red Shield Youth Center of Davidson County<br>
                                        <span style="font-size:12px;">(15 miles away)</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        High Point Corps<br>
                                        <span style="font-size:12px;">(18 miles away)</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Red Shield Youth Center of High Point<br>
                                        <span style="font-size:12px;">(18 miles away)</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Davidson County Corps<br>
                                        <span style="font-size:12px;">(19 miles away)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <a class="btn btn-outline-primary btn-sm mt-3" 
                               href="https://www.salvationarmyusa.org/location-finder/?address=${zipCode}&services=" 
                               target="_blank">
                                <i class="bi bi-map me-2"></i> Get More Details
                            </a>
                        </div>
                    </div>
                    
                    <!-- Right block: Photo (5 columns) -->
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1; min-width: 100%; min-height: auto;">
                            <!-- Template photo: https://s3.amazonaws.com/uss-cache.salvationarmy.org/71fe3cd2-5a53-4557-91ea-bb40ab76e2f5_nearby-corps-1.jpg -->
                            <img alt="Nearby Centers Photo" 
                                 class="img-fluid w-100 h-100" 
                                 src="https://s3.amazonaws.com/uss-cache.salvationarmy.org/71fe3cd2-5a53-4557-91ea-bb40ab76e2f5_nearby-corps-1.jpg" 
                                 style="object-fit:cover;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * For Parents Section
     */
    generateParents(data) {
        const { center, leaders, photos } = data;
        
        // Get parents section photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const parentPhoto = photoData?.urlParentsSectionPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/c86f2661-8584-4ec2-9a2b-efb037af243c_480824461_1048794390619512_2584431963266610630_n.jpg';
        
        // Use center's registration URL if available
        const registrationURL = center.signUpURL;
        
        // Check if staff section has data (to show/hide Meet Our Staff button)
        const hasStaff = leaders && leaders.length > 0;
        const hasRegistrationURL = registrationURL && registrationURL.trim() !== '';
        
        // A Place for Growth modal
        const growthModal = `
<!-- Modal for A Place for Growth -->
<div id="rsyc-modal-growth" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>A Place for Growth</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('growth')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <div style="font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;">
                <p>The Red Shield Youth Center is more than a safe place after school—it's a space where children and teens can grow, explore, and build the skills they need for the future. Our programs support the whole child through a variety of opportunities:</p>
                
                <ul style="margin-left: 1.5rem; margin-bottom: 1.5rem;">
                    <li><strong>Spiritual Development</strong> – connecting youth with Christ centered purpose and values</li>
                    <li><strong>Academic Support</strong> – tutoring, homework help, and enrichment activities</li>
                    <li><strong>Social-Emotional Learning</strong> – building confidence, empathy, and communication skills</li>
                    <li><strong>Character & Leadership Development</strong> – opportunities to lead, problem-solve, and make decisions</li>
                    <li><strong>STEAM & Creative Exploration</strong> – hands-on activities that spark curiosity and creativity</li>
                    <li><strong>Physical Activity & Team Sports</strong> – promoting health, teamwork, and well-being</li>
                    <li><strong>Music & Arts</strong> – nurturing creative talents and self-expression</li>
                </ul>
                
                <p>Staff provide guidance, encouragement, and individualized attention to help every child thrive. By combining learning, creativity, and meaningful relationships, the Youth Center creates a space where youth feel supported, challenged, and inspired. Sign up your youth today and give them a place to learn, grow, and succeed.</p>
            </div>
            <div class="text-center" style="padding-top: 1.5rem; border-top: 1px solid #dee2e6;">
                <p style="font-size: 1rem; margin-bottom: 1rem;">Learn more about our programs and safety standards</p>
                <div class="d-flex gap-2 justify-content-center flex-wrap">
                    <a class="btn btn-outline-primary" href="/redshieldyouth/about" target="_blank">
                        <i class="bi bi-info-circle me-2"></i> About Us
                    </a>
                    <a class="btn btn-outline-primary" href="/redshieldyouth/safety" target="_blank">
                        <i class="bi bi-shield-check me-2"></i> Safety Policies
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>`;
        
        return `<!-- For Parents -->
<div id="freeTextArea-parents" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            ${growthModal}
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="row align-items-stretch">
                    <!-- Left block: Photo (5 columns) -->
                    <div class="col-lg-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1; min-width: 100%; min-height: auto;">
                            ${parentPhoto ? `
                            <img alt="Youth Center" 
                                 class="img-fluid w-100 h-100" 
                                 src="${this.escapeHTML(parentPhoto)}" 
                                 style="object-fit:cover; object-position: center;">
                            ` : `
                            <div class="bg-light w-100 h-100 d-flex align-items-center justify-content-center" style="min-height:300px;">
                                <p class="text-muted">Youth Center Photo</p>
                            </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Right block: Hover card (7 columns) -->
                    <div class="col-lg-7 d-flex">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-shield-lock icon-lg"></i>
                            <h2 class="fw-bold mb-2">For <em>Parents</em></h2>
                            
                            <p class="text-secondary mb-4">
                                Everything you need to know to keep your child safe and engaged at our youth centers.
                            </p>
                            
                            <div class="d-grid gap-2 mt-auto">
                                <button class="btn btn-outline-primary btn-md" onclick="showRSYCModal('growth', '${this.escapeHTML(center.name, true)}')">
                                    <i class="bi bi-flower2 me-2"></i> A Place for Growth
                                </button>
                                ${hasRegistrationURL ? `
                                <a class="btn btn-outline-primary btn-md" 
                                   href="${this.escapeHTML(registrationURL)}" 
                                   target="_blank">
                                    <i class="bi bi-calendar-check me-2"></i> Sign-up your Youth
                                </a>
                                ` : ''}
                                ${hasStaff ? `
                                <a class="btn btn-outline-primary btn-md" href="#profiles">
                                    <i class="bi bi-chat-text me-2"></i> Meet Our Staff
                                </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    generateYouth(data) {
        const { center, photos } = data;

        // Get youth section photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const photoUrl = photoData?.urlYouthSectionPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/adcebba0-1957-44b7-b252-52047fba3012_493289641_24370578925875198_8553369015658130819_n.jpg';

        // Dynamic registration URLs
        const registrationURL = center.signUpURL || 'https://online.traxsolutions.com/southernusasalvationarmy/winston-salem#/dashboard';
        const searchURL = registrationURL.replace(/#\/dashboard$/, '#/search');

        const html = `
<div id="freeTextArea-youth" data-index="7" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem;">
                <div class="row align-items-stretch">
                    <!-- Left block: Hover card (7 columns) -->
                    <div class="col-lg-7 d-flex order-2 order-lg-1">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-lightning-charge icon-lg"></i>
                            <h2 class="fw-bold mb-2">For <em>Youth</em></h2>
                            <!-- Subtitle -->
                            <p class="mb-4 text-muted" style="font-size:1.1rem;">
                                Engage in exciting programs, sports, and activities designed to inspire and empower.
                            </p>

                            <div class="d-grid gap-2 mt-auto">
                                <a class="btn btn-outline-primary btn-lg" href="${registrationURL}" target="_blank"><i class="bi bi-controller me-2"></i> Join a Center </a>
                                <a class="btn btn-outline-primary btn-lg" href="${searchURL}" target="_blank"> <i class="bi bi-trophy me-2"></i> Join an Activity </a>
                                <a class="btn btn-outline-primary btn-lg" href="https://peermag.org/" target="_blank"> <i class="bi bi-stars me-2"></i> Peer Magazine </a>
                            </div>
                        </div>
                    </div>
                    <!-- Right block: Photo (5 columns) -->
                    <div class="col-lg-5 d-flex order-1 order-lg-2">
                        <div class="photo-card w-100" style="aspect-ratio: 1 / 1; overflow:hidden; border-radius:12px; min-width: 100%; min-height: auto;">
                            <img alt="Teens Photo" src="${photoUrl}" style="width:100%; height:100%; object-fit:cover; object-position: center;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
        `;

        return html;
    }

    /**
     * Nearby Centers Section
     */
    generateNearby(data) {
        const { center, photos } = data;
        
        // Use postal code from center data
        const postalCode = center.zip || '27107';
        const locationFinderUrl = `https://www.salvationarmyusa.org/location-finder/?address=${postalCode}&services=`;
        
        // Get nearby centers photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const nearbyPhoto = photoData?.urlNearbyCentersPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/71fe3cd2-5a53-4557-91ea-bb40ab76e2f5_nearby-corps-1.jpg';

        return `<!-- Nearby Salvation Army Centers -->
<div id="freeTextArea-nearby" class="freeTextArea u-centerBgImage section u-sa-greyVeryLightBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="row align-items-stretch flex-column-reverse flex-lg-row">
                    <!-- Left block: Nearby Centers card (7 columns) -->
                    <div class="col-lg-7 d-flex mb-4 mb-lg-0">
                        <div class="hover-card w-100 d-flex flex-column h-100">
                            <i class="bi bi-geo-alt icon-lg"></i>
                            <h2 class="fw-bold mb-4">Nearby <em>Salvation Army</em> Centers</h2>

                            <!-- Icons row: 2 columns per row -->
                            <div class="d-flex flex-wrap justify-content-between mt-auto">

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Corps Community Center (Church)<br>
                                        <span style="font-size:12px;">Worship, programs, and community support for all ages.</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Red Shield Youth Center<br>
                                        <span style="font-size:12px;">Mentoring, recreation, and enrichment for kids and teens.</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Thrift Store &amp; Donation Center<br>
                                        <span style="font-size:12px;">Shop or donate items that fund local programs.</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Social Services Office<br>
                                        <span style="font-size:12px;">Assistance with food, bills, and emergency support.</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Shelter / Housing Program<br>
                                        <span style="font-size:12px;">Safe housing and guidance for individuals and families.</span>
                                    </div>
                                </div>

                                <div class="d-flex align-items-center mb-3" style="flex: 1 1 45%;">
                                    <i class="bi bi-geo feature-icon"></i>
                                    <div>
                                        Center of Hope<br>
                                        <span style="font-size:12px;">Shelter, meals, and programs to help people regain stability.</span>
                                    </div>
                                </div>

                            </div>

                            <a class="btn btn-outline-primary btn-sm mt-3" href="${locationFinderUrl}" target="_blank">
                                <i class="bi bi-map me-2"></i> Get More Details
                            </a>
                        </div>
                    </div>

                    <!-- Right block: Photo (5 columns) -->
                    <div class="col-lg-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1; min-width: 100%; min-height: auto;">
                            <img alt="Nearby Centers Photo" class="img-fluid w-100 h-100" src="${this.escapeHTML(nearbyPhoto)}" style="object-fit:cover; object-position: center;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Get Involved Section (Volunteer/Donate/Mentor)
     */
    generateVolunteer(data) {
        const { center, photos } = data;
        const volunteerText = center.volunteerText || '';

        // Get get involved photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const photoUrl = photoData?.urlGetInvolvedPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/22971941-6318-4db7-8231-ff5435aa654b_Low+Res+Web+Ready-30112_Tulsa_group_of_young_boys_playing_drums.png';

        // Use center's donation URL or fallback to default
        const donationURL = center.donationURL || 'https://give.salvationarmysouth.org/campaign/703141/donate?c_src=RSYC-Center-Page';

        // Volunteer/Mentor modal content
        const volunteerModal = volunteerText ? `
<!-- Modal for Volunteer/Mentor Info -->
<div id="rsyc-modal-volunteer" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>Volunteer / Mentor Youth</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('volunteer')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <div style="font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;" data-volunteer-text>
                ${volunteerText}
            </div>
            <div class="text-center" style="padding-top: 1.5rem; border-top: 1px solid #dee2e6;">
                <p style="font-size: 1rem; margin-bottom: 1rem;">Learn more about volunteering at Red Shield Youth Centers</p>
                <a class="btn btn-outline-primary" href="/redshieldyouth/volunteer" target="_blank">
                    <i class="bi bi-hand-thumbs-up me-2"></i> Volunteer Information
                </a>
            </div>
        </div>
        </div>
        </div>` : '';

        // Legacy modal content
        const legacyModal = `
<!-- Modal for Leave a Legacy -->
<div id="rsyc-modal-legacy" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>Leave a Legacy That Impacts Youth for Generations to Come</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('legacy')">&times;</button>
        </div>
        <div class="rsyc-modal-body">
            <div style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">
                <p>As a partner in the mission of the Red Shield Youth Center, your legacy can boldly change the future of young lives.</p>
                <p>By including the Center in your plans—through a bequest, beneficiary designation, or other legacy gift—you create a lasting foundation of hope, growth and purpose for children, teens and families.</p>
                <p>Your legacy today becomes the stories of success, resilience and transformation that we tell for years to come.</p>
            </div>
            <div class="text-center">
                <a href="https://www.tsalegacyoflove.org/" target="_blank" class="btn btn-primary btn-lg">
                    Create Your Legacy <i class="bi bi-arrow-right ms-2"></i>
                </a>
            </div>
        </div>
    </div>
</div>`;

        const html = `
<div id="freeTextArea-volunteer" data-index="8" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem;">
                <div class="row align-items-stretch">
                    <!-- Left block: Photo (5 columns) -->
                    <div class="col-lg-5 d-flex">
                        <div class="photo-card w-100" style="aspect-ratio: 1 / 1; overflow:hidden; border-radius:12px; min-width: 100%; min-height: auto;">
                            <img alt="Get Involved Photo" src="${photoUrl}" style="width:100%; height:100%; object-fit:cover; object-position: center;">
                        </div>
                    </div>
                    <!-- Right block: Hover card (7 columns) -->
                    <div class="col-lg-7 d-flex">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-heart-pulse icon-lg"></i>

                            <h2 class="fw-bold mb-2">Get <em>Involved</em></h2>
                            <!-- Subtitle -->
                            <p class="mb-4 text-muted" style="font-size:1.1rem;">
                                Support youth in your community through giving, volunteering, or mentoring.
                            </p>

                            <div class="d-grid gap-2 mt-auto">
                                <a class="btn btn-outline-primary btn-lg" href="${this.escapeHTML(donationURL)}" target="_blank"><i class="bi bi-gift me-2"></i> Donate </a>
                                ${volunteerText ? `<button class="btn btn-outline-primary btn-lg" onclick="showRSYCModal('volunteer', '${this.escapeHTML(center.name, true)}')"><i class="bi bi-hand-thumbs-up me-2"></i> Volunteer / Mentor Youth </button>` : `<a class="btn btn-outline-primary btn-lg" href="/redshieldyouth/volunteer"><i class="bi bi-hand-thumbs-up me-2"></i> Volunteer / Mentor Youth </a>`}
                                <button class="btn btn-outline-primary btn-lg" onclick="showRSYCModal('legacy', '${this.escapeHTML(center.name, true)}')"><i class="bi bi-star me-2"></i> Leave a Legacy </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
${volunteerModal}
${legacyModal}
        `;

        return html;
    }

    /**
     * Footer Photo Section
     */
    generateFooterPhoto(data) {
        const { photos } = data;
        
        // Get footer photo from photos array
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const footerPhoto = photoData?.urlFooterPhoto || '';
        
        // Only show section if there's a photo
        if (!footerPhoto) return '';

        // Determine background-position based on optional focus field on the photo record.
        // Be extra-robust: check processed property, raw variants, and any string values on the object.
        let bgPosition = 'center';
        try {
            let focusRaw = '';
            // Prefer processed property if present
            if (photoData?.footerPhotoFocus) {
                focusRaw = photoData.footerPhotoFocus;
            }
            // Check common raw variants
            if (!focusRaw) focusRaw = photoData?.FooterPhotoFocus || photoData?.URLFooterPhotoFocus || photoData?.Focus || photoData?.FocalPoint || photoData?.focalPoint || '';
            // If still empty, scan all string values on the photoData object for a likely focus token
            if (!focusRaw && photoData && typeof photoData === 'object') {
                for (const k of Object.keys(photoData)) {
                    try {
                        const v = photoData[k];
                        if (typeof v === 'string' && /^(top|center|bottom)$/i.test(v.trim())) {
                            focusRaw = v; break;
                        }
                        // handle nested objects with .Value
                        if (v && typeof v === 'object' && typeof v.Value === 'string' && /^(top|center|bottom)$/i.test(v.Value.trim())) {
                            focusRaw = v.Value; break;
                        }
                        // handle string that contains top/bottom as part
                        if (typeof v === 'string' && /(top|bottom)/i.test(v)) {
                            focusRaw = v; break;
                        }
                    } catch (e) { /* ignore */ }
                }
            }

            focusRaw = (focusRaw || '').toString().trim().toLowerCase();

            if (focusRaw.includes('top')) {
                bgPosition = 'center top';
            } else if (focusRaw.includes('bottom')) {
                bgPosition = 'center bottom';
            } else {
                bgPosition = 'center';
            }
            // Debug: expose detected focus in console for troubleshooting (non-blocking)
            try { console.debug('RSYC: footerPhoto focusRaw=', focusRaw, '=> bgPosition=', bgPosition, 'photoKeys=', Object.keys(photoData || {})); } catch (e) {}
        } catch (e) {
            // fallback to center on any unexpected value
            bgPosition = 'center';
        }

        return `<!-- Footer Photo Section -->
<section id="freeTextArea-footerPhoto" class="freeTextArea u-centerBgImage section u-coverBgImage" style="min-height: 400px; background-image: url('${this.escapeHTML(footerPhoto)}'); background-size: cover; background-position: ${bgPosition} !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
    <div class="u-positionRelative" style="min-height: 400px; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <!-- Empty content - just showing the photo -->
    </div>
</section>`;
    }

    /**
     * Footer Scripture Section
     */
    generateContact(data) {
        const { center } = data;
        console.log('📖 generateContact called with:', { 
            hasCenter: !!center, 
            scripture: center?.scripture 
        });
        
        // Parse scripture if provided, otherwise use default
        let scriptureText = '';
        let scriptureReference = '';
        
        if (center.scripture && center.scripture.trim()) {
            const parsed = this.parseScripture(center.scripture);
            scriptureText = parsed.text;
            scriptureReference = parsed.reference;
            
            // Remove all types of quotes from scripture text if they exist
            if (scriptureText) {
                // Remove leading and trailing quotes: ", ', ", ", ', ', «, »
                scriptureText = scriptureText
                    .replace(/^["""'''«»'"]+/, '')
                    .replace(/["""'''«»'"]+$/, '')
                    .trim();
            }
        } else {
            // Default scripture
            scriptureText = "How good and pleasant it is when God's people live together in unity!";
            scriptureReference = "Psalm 133:1";
        }
        
        return `<!-- Footer Scripture -->
<style type="text/css">
.localSites-items,
.localSites-item {
  height: auto !important;
  min-height: auto !important;
}

  /* Hide the "Visit Website" link completely */
.localSites-website {
  display: none !important;
}

div #freeTextArea-0 {
  margin-bottom: -75px !important;
}
  
#freeTextArea-scripture .container {
  padding-top: 75px !important;
  padding-bottom: 140px !important;
  margin-bottom: 0 !important;
}

#freeTextArea-scripture p:last-child {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>

<div id="freeTextArea-scripture" data-index="10" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            
            <p>&nbsp;</p><p>&nbsp;</p>
            
            <h2 style="text-align: center; margin-bottom: 1.5rem;">
                ${this.escapeHTML(center.name || center.Title)}
            </h2>
            
            <p style="text-align: center;">
                <cite>${this.escapeHTML(scriptureText)}</cite>
            </p>
            
            <p style="text-align: center; padding-bottom: 2rem;">
                <strong><cite>-&nbsp;${this.escapeHTML(scriptureReference)}</cite></strong>
            </p>
            <p>&nbsp;</p><p>&nbsp;</p>
        </div>
    </div>
</div>`;
    }

    /**
     * Parse scripture text to separate quote and reference
     * Handles various formats from the unit profile data:
     * - "Proverbs 22:6 In all your ways..."
     * - "Start children off on the way they should go..." Proverbs 22:6
     * - John 13:34 (ICB) - "I give you a new command..."
     * - "As each one has received a gift..."-1 Peter 4:10
     * - “We love each other because he loved us first.” 1 John 4:19
     */
    parseScripture(scripture) {
        if (!scripture) return { text: '', reference: '' };
        
        // Remove leading/trailing whitespace and handle smart quotes/dashes immediately
        scripture = scripture.trim()
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/[–—]/g, '-');
        
        // Bible book pattern (handles 1-2 word book names with optional numbers like "1 John", "2 Corinthians")
        // Captures: optional digit, book name (1-2 words), chapter:verse(-verse), optional version like (ICB)
        const bookPatternStr = '((?:(?:\\d\\s?)?[A-Za-z]+(?:\\s+[A-Za-z]+)?)\\s+\\d+:\\d+(?:-\\d+)?(?:\\s*\\([A-Z]+\\))?)';
        const bookPattern = new RegExp(bookPatternStr);
        
        // 1. Check for reference at start (e.g. "John 13:34 (ICB) - I give you...")
        const startRefMatch = scripture.match(new RegExp(`^${bookPatternStr}\\s*[-:]*\\s*(.*)$`, 'i'));
        if (startRefMatch) {
            return {
                text: startRefMatch[2].replace(/^["']|["']$/g, '').trim(),
                reference: startRefMatch[1].trim()
            };
        }

        // 2. Check for reference at end, optionally in parentheses (e.g. "God so loved... (John 3:16)")
        const endRefMatch = scripture.match(new RegExp(`^(.*?)\\s*[-:]*\\s*\\(?${bookPatternStr}\\)?\\s*$`, 'i'));
        if (endRefMatch && endRefMatch[1].trim()) {
            return {
                text: endRefMatch[1].replace(/^["']|["']$/g, '').trim(),
                reference: endRefMatch[2].trim()
            };
        }

        // 3. Try finding the pattern anywhere
        const generalMatch = scripture.match(bookPattern);
        if (generalMatch) {
            const reference = generalMatch[1];
            let text = scripture.replace(reference, '')
                .replace(/^["']|["']$/g, '')
                .replace(/\s*[-:]*\s*$/, '')
                .replace(/^\s*[-:]*\s*/, '')
                .replace(/[()]/g, '') // Remove surviving parens if we found ref inside them
                .trim();
            return { text, reference };
        }
        
        // Fallback: use entire text as quote, no reference
        return { 
            text: scripture.replace(/^["']|["']$/g, '').trim(), 
            reference: '' 
        };
    }

    /**
     * Calculate complement months from a term string
     * e.g., "September - June" returns "July - August"
     * e.g., "October - July" returns "August - September"
     */
    getComplementMonths(termString) {
        if (!termString) return 'June - July';
        
        const monthOrder = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Parse the term string (e.g., "September - June" or "August - May")
        const parts = termString.split('-').map(s => s.trim());
        if (parts.length !== 2) return 'June - July';
        
        const startMonth = parts[0];
        const endMonth = parts[1];
        
        const startIdx = monthOrder.indexOf(startMonth);
        const endIdx = monthOrder.indexOf(endMonth);
        
        if (startIdx === -1 || endIdx === -1) return 'June - July';
        
        // Calculate complement (the months NOT in the regular term)
        // If regular is Sept(8) - June(5), complement is July(6) - Aug(7)
        const complementStart = (endIdx + 1) % 12;
        const complementEnd = (startIdx - 1 + 12) % 12;
        
        // Handle single month case
        if (complementStart === complementEnd) {
            return monthOrder[complementStart];
        }
        
        // Handle two consecutive months
        if ((complementStart + 1) % 12 === complementEnd) {
            return `${monthOrder[complementStart]} - ${monthOrder[complementEnd]}`;
        }
        
        return `${monthOrder[complementStart]} - ${monthOrder[complementEnd]}`;
    }

    /**
     * Summarize a list of months into a readable range
     * e.g., ["August", "September", "October", "November", "December", "January", "February", "March", "April", "May"]
     * becomes "August - May"
     * For 10+ months, shows "All months except [missing months]"
     */
    summarizeMonths(monthList) {
        if (!monthList || monthList.length === 0) return '';
        if (monthList.length === 1) return monthList[0];
        
        const monthOrder = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // If all 12 months are present, return "All Months"
        if (monthList.length === 12) {
            return 'All Months';
        }
        
        // If 10 or 11 months (most of the year), show as "All months except..."
        if (monthList.length >= 10) {
            const missing = monthOrder.filter(m => !monthList.includes(m));
            if (missing.length === 1) {
                return `All months except ${missing[0]}`;
            } else if (missing.length === 2) {
                return `All months except ${missing[0]} and ${missing[1]}`;
            }
        }
        
        // Sort months by calendar order
        const sorted = [...monthList].sort((a, b) => {
            const idxA = monthOrder.indexOf(a);
            const idxB = monthOrder.indexOf(b);
            return idxA - idxB;
        });
        
        // For 2 months, use "Month and Month"
        if (sorted.length === 2) {
            return `${sorted[0]} and ${sorted[1]}`;
        }
        
        // For 3+ consecutive months, use "First - Last"
        // Check if months are consecutive (accounting for year wrap)
        const indices = sorted.map(m => monthOrder.indexOf(m));
        let isConsecutive = true;
        
        // Handle year-wrap case (e.g., Aug-May spans across calendar year)
        if (indices[0] > indices[indices.length - 1]) {
            // Wraps around the year - still consecutive if gap is only at the wrap point
            for (let i = 1; i < indices.length; i++) {
                const prev = indices[i - 1];
                const curr = indices[i];
                
                // Allow wrap from Dec (11) to Jan (0), or normal increment
                if (curr !== prev + 1 && !(prev === 11 && curr === 0)) {
                    isConsecutive = false;
                    break;
                }
            }
        } else {
            // No wrap - check normal sequence
            for (let i = 1; i < indices.length; i++) {
                if (indices[i] !== indices[i - 1] + 1) {
                    isConsecutive = false;
                    break;
                }
            }
        }
        
        if (isConsecutive && sorted.length >= 3) {
            return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
        }
        
        // Not consecutive - list them all (parents need to know exactly when it runs)
        return sorted.join(', ');
    }

    /**
     * Normalize and format the Active / Program Runs In text for display.
     * Ensures missing spaces (e.g., "exceptJune") are fixed and inserts
     * a small-screen break after the third word using a responsive <br>.
     */
    formatActiveForDisplay(months) {
        if (!months) return '';

        // Normalize to string and collapse non-breaking spaces
        let s = months.toString();
        s = s.replace(/\u00A0/g, ' ');

        // Ensure commas have a single space after them
        s = s.replace(/,\s*/g, ', ');

        // If input accidentally glued words like 'exceptJune', insert a space
        // between a lowercase followed by uppercase (fixes "exceptJune")
        s = s.replace(/([a-z])([A-Z])/g, '$1 $2');

        // Also guard common keyword run-ons (e.g., 'exceptJune' without capital)
        s = s.replace(/except(?=[A-Za-z0-9])/gi, 'except ');

        // Collapse multiple spaces and trim
        s = s.replace(/\s+/g, ' ').trim();

    // Split into tokens (words and punctuation-aware)
    const tokens = s.split(/\s+/).filter(Boolean);

        if (tokens.length <= 3) {
            return `<strong>Active:</strong> ${this.escapeHTML(s)}`;
        }

        const first3 = this.escapeHTML(tokens.slice(0, 3).join(' '));
        const rest = this.escapeHTML(tokens.slice(3).join(' '));

        // Insert a normal space before the responsive <br> so DESKTOPs keep a space
        // while small screens (<992px) will break after the third word.
        return `<strong>Active:</strong> ${first3} <br class="d-lg-none">${rest}`;
    }

    /**
     * Escape HTML and preserve line breaks
     */
    preserveLineBreaks(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        // Replace line breaks with <br> tags
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} str - The string to escape
     * @param {boolean} forAttribute - If true, return a version safe for HTML attributes (removes quotes for onclick compatibility)
     */
    escapeHTML(str, forAttribute = false) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        let escaped = div.innerHTML;
        // If for use in HTML attributes, remove problematic characters that could break onclick handlers
        if (forAttribute) {
            escaped = escaped.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
        return escaped;
    }

    /**
     * Make email addresses and phone numbers clickable
     * ADDED 2025-11-15: Auto-link emails and phones in content
     */
    makeContactsClickable(text) {
        if (!text) return '';
        
        // Process text node by node to avoid matching inside HTML tags
        // Split by HTML tags while preserving them
        const parts = text.split(/(<[^>]+>)/g);
        
        const processedParts = parts.map((part) => {
            // Skip HTML tags (anything starting with < and ending with >)
            if (part.startsWith('<') && part.endsWith('>')) {
                return part;
            }
            
            // Skip if empty or only whitespace
            if (!part.trim()) {
                return part;
            }
            
            // Process text content only
            let processed = part;
            
            // Make email addresses clickable - very permissive pattern
            // Matches any email format including after labels, in lists, etc.
            processed = processed.replace(/([a-zA-Z0-9][a-zA-Z0-9._+-]*@[a-zA-Z0-9][a-zA-Z0-9._-]*\.[a-zA-Z0-9._-]+)/gi, 
                '<a href="mailto:$1">$1</a>');
            
            // Make phone numbers clickable with very flexible matching
            // Handles: (864) 576-8330, (803)522- 2963, 864-576-8330, etc.
            processed = processed.replace(/(\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4})/g, function(match) {
                const cleanNumber = match.replace(/\D/g, '');
                if (cleanNumber.length === 10) {
                    return `<a href="tel:+1${cleanNumber}">${match}</a>`;
                }
                return match;
            });
            
            return processed;
        });
        
        return processedParts.join('');
    }
    // END ADDED 2025-11-15

    /**
     * Get section list
     */
    getSections() {
        return this.sections;
    }
}

// Export class to global scope
window.RSYCTemplates = RSYCTemplates;
} // End if RSYCTemplates undefined

// Create global instance
if (!window.rsycTemplates) {
    window.rsycTemplates = new window.RSYCTemplates();
}

// Print function for modal content - Mobile-friendly with fallback
async function printRSYCModal(modalId) {
    const modal = document.getElementById(`rsyc-modal-${modalId}`);
    if (!modal) return;
    
    const printDate = new Date().toLocaleDateString('en-US');
    
    // Extract title and center name from modal
    const isEventModal = typeof modalId === 'string' && modalId.startsWith('event-');
    const titleElement = isEventModal
        ? modal.querySelector('.rsyc-modal-header h3')
        : modal.querySelector('.rsyc-modal-body h3');
    const scheduleTitle = isEventModal ? 'Event Details' : (titleElement ? titleElement.textContent.trim() : 'Schedule');

    const centerStrong = modal.querySelector('.rsyc-modal-body strong');
    const centerName = centerStrong ? centerStrong.textContent.trim() : '';
    
    // Create print window title
    const printTitle = isEventModal ? `${scheduleTitle} - ${printDate}` : (centerName ? `${scheduleTitle} - ${centerName} - ${printDate}` : `${scheduleTitle} - ${printDate}`);
    
    // Get modal content and clone it
    const modalContent = modal.querySelector('.rsyc-modal-content');
    const printContent = modalContent.cloneNode(true);

    // Detect if narrative (description) is long and reduce font size if so
    const descriptionEl = printContent.querySelector('.rsyc-description');
    if (descriptionEl && descriptionEl.textContent.trim().length > 600) {
        descriptionEl.style.fontSize = '7.5pt';
        descriptionEl.style.lineHeight = '1.3';
    }

    // Clean up cloned content
    const existingLogoEl = printContent.querySelector('img[alt="Red Shield Youth Centers Logo"]');
    if (existingLogoEl) existingLogoEl.remove();
    
    // For event modals, remove the center name div from body (it's in the header)
    if (isEventModal) {
        const centerNameDiv = printContent.querySelector('.rsyc-modal-body > div.mb-3');
        if (centerNameDiv && centerNameDiv.querySelector('strong') && centerNameDiv.textContent.includes(centerName)) {
            centerNameDiv.remove();
        }
    }

    // Fetch logo for injection
    let logoSvgHtml = '';
    const logoUrl = 'https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg';
    try {
        const resp = await fetch(logoUrl);
        if (resp.ok) {
            logoSvgHtml = await resp.text();
        } else {
            logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`;
        }
    } catch (e) {
        logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`;
    }

    const printWindow = /Android/i.test(navigator.userAgent) ? null : window.open('', '', 'height=900,width=1200');
    if (!printWindow && !/Android/i.test(navigator.userAgent)) {
        alert('Pop-up blocked. Please allow pop-ups for this site.');
        return;
    }
    
    const hideRedundantRule = isEventModal
        ? ''
        : `

        /* Hide redundant titles already in header */
        .rsyc-modal-body > div:first-of-type,
        .rsyc-modal-body > h3:first-of-type { display: none !important; }
        `;

    const eventImageRule = isEventModal
        ? `

        /* EVENT PRINT LAYOUT: keep image compact and allow details to flow beside it */
        .rsyc-modal-body img {
            float: right;
            width: 190pt !important;
            max-width: 40% !important;
            height: auto !important;
            max-height: 220pt !important;
            object-fit: contain !important;
            border-radius: 6pt !important;
            margin: 0 0 10pt 12pt !important;
        }

        /* Prevent the floated image from forcing awkward breaks */
        .rsyc-modal-body::after { content: ""; display: block; clear: both; }

        /* Give key blocks breathing room */
        .rsyc-event-location { margin-top: 10pt !important; margin-bottom: 12pt !important; }
        .rsyc-event-cost { margin-bottom: 10pt !important; }
        .rsyc-event-extended-care { margin-bottom: 10pt !important; }
        `
        : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${printTitle}</title>
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0.4in; 
            font-size: 10pt; 
            line-height: 1.4; 
            color: #222; 
        }

        /* HEADER */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15pt;
            border-bottom: 1.5pt solid var(--rsyc-teal);
            padding-bottom: 10pt;
        }

        .header-logo { width: 160pt; flex: 0 0 160pt; }
        .header-logo svg, .header-logo img { width: 100%; height: auto; display: block; }

        .header-text { text-align: left; }
        .header-text h1 { color: var(--rsyc-teal); font-size: 16pt; margin-bottom: 2pt; }
        .header-text p { font-size: 14pt; color: #666; font-style: italic; font-weight: 600; }

        /* BODY CONTENT */
        .rsyc-modal-body { width: 100%; }
        
        ${hideRedundantRule}

        ${eventImageRule}

        .rsyc-modal-body h3 { 
            color: var(--rsyc-navy); 
            font-size: 12pt; 
            margin: 10pt 0 8pt 0; 
            border-bottom: 1px solid #eee;
            padding-bottom: 4pt;
        }

        /* Detail Boxes (Important Dates, etc) */
        .rsyc-important-dates {
            background: #f8fcfb !important;
            border: 1px solid #e0f2f1 !important;
            border-radius: 4pt;
            padding: 8pt !important;
            margin-bottom: 10pt !important;
        }

        .rsyc-orientation {
            background: #f8fcfb !important;
            border: 1px solid #e0f2f1 !important;
            border-radius: 4pt;
            padding: 8pt !important;
            margin-bottom: 0 !important; /* Remove margin below orientation */
        }

        .rsyc-contacts {
            background: #f8fcfb !important;
            border: 1px solid #e0f2f1 !important;
            border-radius: 4pt;
            padding: 8pt !important;
            margin-top: 8pt !important; /* Small margin above contact container */
            margin-bottom: 10pt !important;
        }

        .rsyc-important-dates-title, .rsyc-orientation-title, .rsyc-contacts-title {
            color: var(--rsyc-teal) !important;
            font-weight: 700 !important;
            font-size: 10pt !important;
            margin-bottom: 6pt !important;
            text-transform: uppercase;
        }

        .rsyc-important-dates-body, .rsyc-orientation-body {
            font-size: 8.5pt !important;
            line-height: 1.3 !important;
        }

        .rsyc-transportation-value {
            font-size: 8.5pt !important;
            line-height: 1.3 !important;
        }

        /* POINT OF CONTACT - Compact Styling */
        .rsyc-contact-item { margin-bottom: 6pt !important; padding: 4pt 0 !important; }
        .rsyc-contact-name { font-size: 9.5pt !important; font-weight: 700 !important; color: #000 !important; }
        .rsyc-contact-job { font-size: 8.5pt !important; color: #444 !important; font-weight: 500 !important; margin-bottom: 1pt !important; }
        .rsyc-contact-phone, .rsyc-contact-email { font-size: 8.5pt !important; color: #555 !important; line-height: 1.2 !important; }

        /* Normalize User Content */
        p, li { font-size: 8.5pt !important; margin-bottom: 6pt !important; }
        strong { font-weight: 600; color: #000; }
        
        .row { display: flex; flex-wrap: wrap; margin-left: -5pt; margin-right: -5pt; }
        .col-sm-12 { width: 100% !important; flex: 0 0 100% !important; padding: 0 5pt !important; margin-bottom: 10pt !important; box-sizing: border-box !important; }
        .col-md-6 { width: 50% !important; flex: 0 0 50% !important; padding: 0 5pt !important; margin-bottom: 10pt !important; box-sizing: border-box !important; }

        /* Hide UI elements */
        .rsyc-modal-close, .rsyc-modal-print, .rsyc-modal-actions, .btn { display: none !important; }

        @media print {
            body { margin: 0.4in; }
        }

        .date-stamp {
            position: fixed;
            bottom: 10pt;
            right: 10pt;
            font-size: 7pt;
            color: #bbb;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-text">
            <h1>${scheduleTitle}</h1>
           <div class="center-name">The Salvation Army ${centerName}</div>
        </div>
        <div class="header-logo">${logoSvgHtml}</div>
    </header>

    <main class="rsyc-modal-body">
        ${printContent.innerHTML}
    </main>

    <footer style="margin-top: 40pt; padding-top: 15pt; border-top: 1px solid #eee; text-align: center; font-size: 10pt; color: #777;">
        <p>Learn more about exciting activities and our updated contact information at <strong>www.redshieldyouth.org</strong></p>
    </footer>
    <div class="date-stamp">Printed on ${printDate}</div>
</body>
</html>`;

    const isAndroid = /Android/i.test(navigator.userAgent);
    
    try {
        if (isAndroid) {
            // Android-specific reliable printing via iframe and Blob
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            const iframe = document.createElement('iframe');
            iframe.style.visibility = 'hidden';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.src = blobUrl;
            
            document.body.appendChild(iframe);
            
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    // Cleanup
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(iframe);
                    }, 5000);
                }, 1000); // Give Android extra time to render the blob
            };
        } else {
            // Desktop/iOS standard behavior
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => { printWindow.close(); }, 500);
            }, 800);
        }
    } catch(e) {
        console.error('Print error:', e);
    }
}

/**
 * Print all schedules aggregated into a one-page format - Mobile-friendly
 */
async function printAllSchedules(cacheKey) {
    // Retrieve schedules from global cache
    if (!window.RSYC_SCHEDULES || !window.RSYC_SCHEDULES[cacheKey]) {
        alert('Schedule data not available');
        return;
    }
    
    const { centerName, aboutText, schedules } = window.RSYC_SCHEDULES[cacheKey];
    const exteriorPhoto = window.RSYC_SCHEDULES[cacheKey].exteriorPhoto || 'https://thisishoperva.org/rsyc/9150a418-1c58-4d01-bf81-5753d1c608ae_building+1.png';
    
    // Conditionally reduce aboutText font if very long
    const isAboutLong = aboutText && aboutText.length > 800;
    const aboutFontSize = isAboutLong ? '6.8pt' : '7.8pt';
    
    if (!schedules || schedules.length === 0) {
        alert('No schedules to print');
        return;
    }
    
    // Check if we should generate a direct PDF (consistent and reliable download)
    // We'll use the native print logic for now as it's been updated for Android reliability,
    // but we can add a PDF generator here in the future if needed.
    
    // Create print window (except on Android)
    const isAndroid = /Android/i.test(navigator.userAgent);
    const printWindow = isAndroid ? null : window.open('', '', 'height=900,width=1200');
    
    if (!printWindow && !isAndroid) {
        alert('Unable to open print window. Your browser may have popup blocking enabled.');
        return;
    }
    
    const printDate = new Date().toLocaleDateString('en-US');
    const printTitle = `Program Schedules - ${centerName} - ${printDate}`;
    
    // The most modern and reliable way to print images across Edge/Safari 
    // is to embed the raw SVG markup directly into the document.
    // This avoids all external image security/loading issues.
    let logoSvgHtml = '';
    const logoUrl = 'https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg';
    try {
        const resp = await fetch(logoUrl);
        if (resp.ok) {
            logoSvgHtml = await resp.text();
            // Clean up SVG for inline use if needed (usually works as is)
        } else {
            logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:280px; display:block;" />`;
        }
    } catch (e) {
        logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:280px; display:block;" />`;
    }

    // Build schedules content
    let schedulesHTML = '';
    const formatEventDateTimeParts = (event) => {
        try {
            const startTs = Number.isFinite(event._startTimestamp) ? event._startTimestamp : Date.parse(String(event.startDateTime || ''));
            const endTs = Number.isFinite(event._endTimestamp) ? event._endTimestamp : Date.parse(String(event.endDateTime || ''));
            const hasStart = startTs && !isNaN(startTs);
            const hasEnd = endTs && !isNaN(endTs);
            const start = hasStart ? new Date(startTs) : null;
            const end = hasEnd ? new Date(endTs) : null;

            const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

            if (start && end) {
                const sameDay = start.toDateString() === end.toDateString();
                return {
                    dateText: sameDay ? dateFmt.format(start) : `${dateFmt.format(start)} - ${dateFmt.format(end)}`,
                    timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                };
            }
            if (start) {
                return { dateText: dateFmt.format(start), timeText: timeFmt.format(start) };
            }
            return { dateText: '', timeText: '' };
        } catch (e) {
            return { dateText: '', timeText: '' };
        }
    };

    schedules.forEach((schedule, index) => {
        const isEvent = schedule && schedule.__type === 'event';
        const daysText = schedule.scheduleDays && Array.isArray(schedule.scheduleDays) && schedule.scheduleDays.length > 0
            ? schedule.scheduleDays.join(', ')
            : '';
        
        let timeText = schedule.scheduleTime || '';
        if (timeText && schedule.timezone) {
            const tz = schedule.timezone.toLowerCase();
            if (tz.includes('eastern')) {
                timeText += ' (Eastern)';
            } else if (tz.includes('central')) {
                timeText += ' (Central)';
            }
        }

        const templateEngine = new RSYCTemplates();
        const months = schedule.programRunsIn && Array.isArray(schedule.programRunsIn)
            ? templateEngine.summarizeMonths(schedule.programRunsIn)
            : '';
            
        const registrationOpens = schedule.registrationOpensIn && Array.isArray(schedule.registrationOpensIn)
            ? templateEngine.summarizeMonths(schedule.registrationOpensIn)
            : '';

        let ageRange = schedule.ageRange || '';
        if (!ageRange && schedule.agesServed && Array.isArray(schedule.agesServed) && schedule.agesServed.length > 0) {
            ageRange = schedule.agesServed.join(', ');
        }
        
        const location = schedule.location || '';
        const cost = schedule.cost || '';
        const registrationFee = schedule.registrationFee || '';
        const registrationDeadline = schedule.registrationDeadline || '';
        const programDates = (schedule.startDate || schedule.endDate) 
            ? `${schedule.startDate || ''} ${schedule.startDate && schedule.endDate ? '-' : ''} ${schedule.endDate || ''}`.trim()
            : '';
        
        const eventDt = isEvent ? formatEventDateTimeParts(schedule) : { dateText: '', timeText: '' };
        const eventDateText = eventDt.dateText || '';
        const eventTimeText = eventDt.timeText || '';
        const eventTypeText = isEvent ? (schedule.eventType || '') : '';
        const eventSubtitleText = isEvent ? (schedule.subtitle || '') : '';
        const eventCardSubtitleText = isEvent ? (eventSubtitleText || eventTypeText) : '';
        const eventThumb = isEvent ? (schedule.thumbnailUrl || schedule.imageUrl || '') : '';

        schedulesHTML += `
        <div class="schedule-item">
            <h4>${schedule.title || (isEvent ? 'Event' : 'Program')}</h4>
            ${isEvent && eventCardSubtitleText ? `<p class="subtitle">${eventCardSubtitleText}</p>` : ''}
            ${(!isEvent && schedule.subtitle) ? `<p class="subtitle">${schedule.subtitle}</p>` : ''}
            ${isEvent && eventThumb ? `<img src="${eventThumb}" alt="${schedule.title || 'Event'}" style="width:100%; height:auto; border-radius: 4pt; margin: 6pt 0; display:block;" />` : ''}
            
            <div class="details">
                ${isEvent && eventDateText ? `<div><strong>Date:</strong> ${eventDateText}</div>` : ''}
                ${isEvent && eventTimeText ? `<div><strong>Time:</strong> ${eventTimeText}</div>` : ''}
                ${!isEvent && daysText ? `<div><strong>Days:</strong> ${daysText}</div>` : ''}
                ${!isEvent && timeText ? `<div><strong>Time:</strong> ${timeText}</div>` : ''}
                ${months ? `<div><strong>Program Runs In:</strong> ${months}</div>` : ''}
                ${registrationOpens ? `<div><strong>Registration Opens:</strong> ${registrationOpens}</div>` : ''}
                ${registrationFee ? `<div><strong>Registration Fee:</strong> ${registrationFee}</div>` : ''}
                ${ageRange ? `<div><strong>Ages:</strong> ${ageRange}</div>` : ''}
                ${programDates ? `<div><strong>Program Dates:</strong> ${programDates}</div>` : ''}
                
                ${(!isEvent && location) ? `<div><strong>Location:</strong> ${location}</div>` : ''}
                ${cost ? `<div><strong>Cost:</strong> ${cost}</div>` : ''}
                ${registrationDeadline ? `<div><strong>Registration Deadline:</strong> ${registrationDeadline}</div>` : ''}
            </div>
        </div>`;
    });
    
    // Build complete HTML document
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${printTitle}</title>
    <style>
        /* MODERN PRINT FOUNDATION */
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0.2in; 
            font-size: 8.5pt; 
            line-height: 1.25; 
            color: #222; 
            background: #fff;
        }

        /* HEADER SECTION */
        .header { 
            display: flex; 
            justify-content: space-between;
            align-items: center; 
            border-bottom: 2pt solid var(--rsyc-teal); 
            padding-bottom: 4pt; 
            margin-bottom: 6pt;
        }
        
        .header-logo-container { width: 200pt; flex: 0 0 200pt; }
        .header-logo-container svg, .header-logo-container img { width: 100%; height: auto; display: block; }
        
        .header-text { text-align: left; }
        .header-text h2 { 
            color: var(--rsyc-teal); 
            font-size: 15pt; 
            font-weight: 700; 
            margin-bottom: 0px;
            text-transform: uppercase;
        }
        
        .center-name { 
            font-size: 14pt; 
            color: #555; 
            font-style: italic;
        }

        /* ABOUT SECTION */
        .about-section { 
            display: block;
            margin-bottom: 6pt;
            padding-bottom: 4pt;
            border-bottom: 1.5pt solid #eee;
            overflow: auto;
        }
        
        .about-text { font-size: ${aboutFontSize}; line-height: 1.3; text-align: justify; }
        .about-photo { 
            float: right;
            width: 200pt; 
            height: 140pt; 
            object-fit: cover; 
            border-radius: 4pt;
            margin-left: 12pt;
            margin-bottom: 2pt;
        }

        /* MULTI-COLUMN SCHEDULES */
        .schedule-list { 
            column-count: 2; 
            column-gap: 18pt; 
        }

        .schedule-item { 
            position: relative;
            break-inside: avoid-column;
            margin-bottom: 8pt;
            padding: 6pt;
            background: #fdfdfd;
            border: 0.5pt solid #eee;
            border-radius: 3pt;
        }

        .schedule-item h4 { 
            color: var(--rsyc-teal); 
            font-size: 10.5pt; 
            font-weight: 700; 
            margin-bottom: 2pt;
        }

        .subtitle { 
            font-size: 8pt; 
            color: #666; 
            margin-bottom: 3pt; 
            font-style: italic;
        }

        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt; font-size: 8.5pt; }
        .details strong { color: var(--rsyc-navy); font-weight: 600; }

        /* FOOTER */
        .footer-note { 
            margin-top: 6pt; 
            padding-top: 4pt; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            font-size: 8.5pt; 
            color: #666;
        }

        @media print {
            body { margin: 0.2in; }
            .schedule-item { border-color: #ddd; }
        }

        .date-stamp {
            position: fixed;
            bottom: 5pt;
            right: 5pt;
            font-size: 7pt;
            color: #ccc;
            z-index: 9999;
        }
    </style>
</head>
<body>

<header class="header">
    <div class="header-text">
        <h2>Program Schedules</h2>
        <div class="center-name">The Salvation Army ${centerName}</div>
    </div>
    <div class="header-logo-container">
        ${logoSvgHtml || ''}
    </div>
</header>

${(aboutText || exteriorPhoto) ? `
<div class="about-section">
    ${exteriorPhoto ? `<img src="${exteriorPhoto}" alt="Center Photo" class="about-photo">` : ''}
    <div class="about-text">${aboutText || ''}</div>
</div>` : ''}

<main class="schedule-list">
    ${schedulesHTML}
</main>

<footer class="footer-note">
    <p>Learn more about exciting activities for youth and our updated contact information at <strong>www.redshieldyouth.org</strong></p>
</footer>

<div class="date-stamp">Printed on ${printDate}</div>
</body>
</html>`;
    
    const dateStamp = `<div class="date-stamp">Printed on ${printDate}</div>`;
    
    // Final check on logo injection
    const finalHtml = htmlContent.replace('${logoSvgHtml || \'\'}', logoSvgHtml || '');

    try {
        if (isAndroid) {
            // Android-specific reliable printing via iframe and Blob
            const blob = new Blob([finalHtml], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            const iframe = document.createElement('iframe');
            iframe.style.visibility = 'hidden';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.src = blobUrl;
            
            document.body.appendChild(iframe);
            
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    // Cleanup
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(iframe);
                    }, 5000);
                }, 1000);
            };
        } else {
            printWindow.document.open();
            printWindow.document.write(finalHtml);
            printWindow.document.close();
            
            // Wait for fonts and SVG to be fully ready
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => { printWindow.close(); }, 500);
            }, 800);
        }
    } catch(e) {
        alert('Unable to print. Please use the Print button in the preview window.');
        console.error('Print error:', e);
    }
}

/**
 * Print story modal content - Mobile-friendly with fallback
 */
async function printStoryModal(storyId) {
    const modal = document.getElementById(`rsyc-modal-${storyId}`);
    if (!modal) return;
    
    const printDate = new Date().toLocaleDateString('en-US');
    
    // Extract title and story content
    const titleElement = modal.querySelector('.rsyc-modal-header h2');
    const storyTitle = titleElement ? titleElement.textContent.trim() : 'Story';
    const centerNameEl = modal.querySelector('.rsyc-modal-body strong');
    const centerName = centerNameEl ? centerNameEl.textContent.trim() : '';
    
    // Get story content and clone it
    const modalContent = modal.querySelector('.rsyc-modal-content');
    const printContent = modalContent.cloneNode(true);

    // Clean up cloned content - remove buttons, close button, image, header, and duplicate logo/center info
    const closeBtn = printContent.querySelector('.rsyc-modal-close');
    if (closeBtn) closeBtn.remove();
    const actionsDiv = printContent.querySelector('.rsyc-modal-actions');
    if (actionsDiv) actionsDiv.remove();
    const headerDiv = printContent.querySelector('.rsyc-modal-header');
    if (headerDiv) headerDiv.remove();
    // Remove main image from cloned content
    const mainImageContainer = printContent.querySelector('div[style*="max-height:400px"]');
    if (mainImageContainer) mainImageContainer.remove();
    // Remove the duplicate center name and logo from modal body (the first flex div with center info)
    const centerLogoSection = printContent.querySelector('.rsyc-modal-body > div');
    if (centerLogoSection) centerLogoSection.remove();

    // Fetch logo for injection
    let logoSvgHtml = '';
    const logoUrl = 'https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg';
    try {
        const resp = await fetch(logoUrl);
        if (resp.ok) { logoSvgHtml = await resp.text(); }
        else { logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`; }
    } catch (e) {
        logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`;
    }

    const printWindow = /Android/i.test(navigator.userAgent) ? null : window.open('', '', 'height=900,width=1200');
    if (!printWindow && !/Android/i.test(navigator.userAgent)) {
        alert('Pop-up blocked. Please allow pop-ups for this site.');
        return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${storyTitle} - ${printDate}</title>
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0.4in; 
            font-size: 10pt; 
            line-height: 1.4; 
            color: #222; 
        }

        /* HEADER */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15pt;
            border-bottom: 1.5pt solid var(--rsyc-teal);
            padding-bottom: 10pt;
        }

        .header-logo { width: 160pt; flex: 0 0 160pt; }
        .header-logo svg, .header-logo img { width: 100%; height: auto; display: block; }

        .header-text { text-align: left; }
        .header-text h1 { color: var(--rsyc-teal); font-size: 16pt; margin-bottom: 2pt; }
        .header-text p { font-size: 14pt; color: #666; font-style: italic; font-weight: 600; }

        /* BODY CONTENT */
        .rsyc-modal-body { width: 100%; }
        
        .rsyc-modal-header { 
            margin-bottom: 10pt;
            display: none;
        }

        .rsyc-modal-body h2 { 
            color: var(--rsyc-navy); 
            font-size: 14pt; 
            margin: 10pt 0 8pt 0; 
            border-bottom: 1px solid #eee;
            padding-bottom: 4pt;
        }

        .rsyc-modal-body h3 { 
            color: var(--rsyc-teal); 
            font-size: 11pt; 
            margin: 8pt 0 4pt 0; 
        }

        .rsyc-story-body {
            font-size: 9.5pt !important;
            line-height: 1.5 !important;
        }

        /* Normalize User Content */
        p { font-size: 9.5pt !important; margin-bottom: 6pt !important; }
        strong { font-weight: 600; color: #000; }
        
        /* Hide UI elements */
        .rsyc-modal-close, .rsyc-modal-print, .rsyc-modal-actions, .btn { display: none !important; }

        @media print {
            body { margin: 0.4in; }
        }

        .date-stamp {
            position: fixed;
            bottom: 10pt;
            right: 10pt;
            font-size: 7pt;
            color: #bbb;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-text">
            <h1>${storyTitle}</h1>
            ${centerName ? `<div class="center-name">The Salvation Army ${centerName}</div>` : ''}
        </div>
        <div class="header-logo">${logoSvgHtml}</div>
    </header>

    <main class="rsyc-modal-body">
        ${printContent.innerHTML}
    </main>

    <footer style="margin-top: 40pt; padding-top: 15pt; border-top: 1px solid #eee; text-align: center; font-size: 10pt; color: #777;">
        <p>Learn more about our center and stories at <strong>www.redshieldyouth.org</strong></p>
    </footer>
    <div class="date-stamp">Printed on ${printDate}</div>
</body>
</html>`;

    const isAndroid = /Android/i.test(navigator.userAgent);
    
    try {
        if (isAndroid) {
            // Android - use blob URL approach
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `story-${storyId}-${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            // Desktop - use print window
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => { printWindow.close(); }, 500);
            }, 800);
        }
    } catch(e) {
        alert('Unable to print. Please use the browser Print function.');
        console.error('Print error:', e);
    }
}

// Modal display functions
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

// Make functions globally available
window.showRSYCModal = showRSYCModal;
window.closeRSYCModal = closeRSYCModal;
window.printRSYCModal = printRSYCModal;
window.printStoryModal = printStoryModal;

// Close modal when clicking outside content
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rsyc-modal')) {
        const modalId = e.target.id;
        const type = modalId.replace('rsyc-modal-', '');
        closeRSYCModal(type);
    }
});
