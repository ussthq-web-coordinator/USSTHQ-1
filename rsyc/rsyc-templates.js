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
            'hero': { 
                name: 'Hero Section', 
                enabled: true, 
                order: 1,
                anchor: '#hero',
                purpose: 'Visual introduction showing the facility exterior.',
                fields: 'Exterior Photo URL'
            },
            'about': { 
                name: 'About This Center', 
                enabled: true, 
                order: 2,
                anchor: '#about',
                purpose: 'Core narrative, mission statement, and promotional video.',
                fields: 'About Text (RTF), Promo Video URL'
            },
            'navigation': {
                name: 'Page Navigation',
                enabled: true,
                order: 2.5,
                anchor: '#navigation',
                purpose: 'Pill-style anchors to jump to other sections.',
                fields: 'Automated list of enabled sections'
            },
            'schedules': { 
                name: 'Program Schedules', 
                enabled: true, 
                order: 3,
                anchor: '#schedules',
                purpose: 'Detailed program cards and interactive modals for daily activities.',
                fields: 'Programs (Title, Days, Time, Modals, Print Settings)'
            },
            'social': {
                name: 'Social Links',
                enabled: true,
                order: 3.5,
                anchor: '#social',
                purpose: 'Social media links and Facebook feed integration.',
                fields: 'Facebook, Instagram, Twitter, LinkedIn, YouTube URLs, Facebook Embed Code'
            },
            'hours': { 
                name: 'Hours of Operation', 
                enabled: true, 
                order: 4,
                anchor: '#hours',
                purpose: 'Interactive schedule showing current operating status and seasonal shifts.',
                fields: 'Regular & Summer Hours (Days, Times, Effective Dates)'
            },
            'facilities': { 
                name: 'Facility Features', 
                enabled: true, 
                order: 5,
                anchor: '#facilities',
                purpose: 'Showcase of specialized rooms and physical amenities.',
                fields: 'Facility Icons, Titles, and Descriptions'
            },
            'programs': { 
                name: 'Featured Programs', 
                enabled: true, 
                order: 6,
                anchor: '#programs',
                purpose: 'Quick-glance overview of major program tracks.',
                fields: 'Program Categories & Icons'
            },
            'midsectionPhoto': {
                name: 'Midsection Photo',
                enabled: true,
                order: 10.5,
                anchor: '#midsectionPhoto',
                purpose: 'Decorative full-width photo section.',
                fields: 'Hardcoded URL'
            },
            'staff': { 
                name: 'Staff & Leadership', 
                enabled: true, 
                order: 7,
                anchor: '#staff',
                purpose: 'Community-focused introduction to the local leadership team.',
                fields: 'Staff Cards (Names, Bios, Photos, Roles)'
            },
            'events': { 
                name: 'Events', 
                enabled: true, 
                order: 8,
                anchor: '#events',
                purpose: 'Calendar of community gatherings and signature fundraisers.',
                fields: 'Event Cards (Date, Time, Image, Registration Links)'
            },
            'infopages': { 
                name: 'Informational Pages', 
                enabled: true, 
                order: 9,
                anchor: '#infopages',
                purpose: 'Key resources, safety policies, and faith foundations displayed as interactive cards.',
                fields: 'Page Title, Category, Body, External URL, URL Thumbnail Image'
            },
            'stories': { 
                name: 'Stories', 
                enabled: true, 
                order: 10,
                anchor: '#stories',
                purpose: 'Impact highlights and community testimonials.',
                fields: 'Stories (Title, Image, Body)'
            },
            'parents': { 
                name: 'For Parents', 
                enabled: true, 
                order: 11,
                anchor: '#parents',
                purpose: 'Practical links and safety reassurances for families.',
                fields: 'Registration Portal Link, Safety Policies'
            },
            'youth': { 
                name: 'For Youth', 
                enabled: true, 
                order: 12,
                anchor: '#youth',
                purpose: 'Engagement-driven links for young people.',
                fields: 'Join a Center / Activity, Peer Magazine Link'
            },
            'nearby': { 
                name: 'Nearby Centers', 
                enabled: true, 
                order: 15,
                anchor: '#nearby',
                purpose: 'Geographic context and links to other service points.',
                fields: 'Nearby Corps & Service Locations'
            },
            'volunteer': { 
                name: 'Volunteer Opportunities', 
                enabled: true, 
                order: 14,
                anchor: '#volunteer',
                purpose: 'Call to action for donations and community service.',
                fields: 'Donation Link, Volunteer Modal Link'
            },
            'footerPhoto': { 
                name: 'Footer Photo', 
                enabled: true, 
                order: 16,
                anchor: '#footerPhoto',
                purpose: 'Large atmospheric background image for the page footer.',
                fields: 'Parallax/Cover Image URL'
            },
            'contact': { 
                name: 'Contact & Footer Branding', 
                enabled: true, 
                order: 17,
                anchor: '#contact',
                purpose: 'Final branding, scripture, and navigational anchors.',
                fields: 'Scripture Verse, Center Name, Branding Teal'
            }
        };
    }

    /**
     * Get section reference table for documentation
     */
    getSectionReferenceTable() {
        const rows = Object.keys(this.sections).sort((a,b) => this.sections[a].order - this.sections[b].order).map(key => {
            const s = this.sections[key];
            const fieldsStr = Array.isArray(s.fields) ? s.fields.join(', ') : (s.fields || '');
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: 600; color: #333;">${s.name}</td>
                    <td style="padding: 10px; font-family: monospace; color: #00929C;"><code>${s.anchor}</code></td>
                    <td style="padding: 10px; color: #555; font-size: 11px; line-height: 1.4;">${s.purpose || ''}</td>
                    <td style="padding: 10px; color: #666; font-size: 11px; font-style: italic; line-height: 1.4;">${fieldsStr}</td>
                </tr>`;
        }).join('');

        return `
            <div style="background-color: #f4f4f4; padding: 14px; border-left: 6px solid #d93d3d; font-weight: bold; margin-bottom: 25px; font-size: 18px; color: #333; display: block; width: 100%;">Red Shield Youth Center Profile - Documentation Reference</div>
            <div style="background: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; width: 20%;">Section Name</th>
                            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; width: 15%;">Anchor ID</th>
                            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; width: 35%;">Purpose & Content</th>
                            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; width: 30%;">Data Fields / Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #777; font-style: italic;">
                * Note: Anchor IDs are used for deep-linking within the RSYC Template system.
            </div>
        `;
    }

    /**
     * Generate complete profile HTML
     */
    generateProfile(centerData, enabledSections) {
        const sections = [];
        
        // Ensure sections are rendered in the correct metadata order
        const sortedKeys = Object.keys(this.sections).sort((a, b) => 
            (this.sections[a].order || 0) - (this.sections[b].order || 0)
        );

        sortedKeys.forEach(sectionKey => {
            if (enabledSections.includes(sectionKey)) {
                const html = this.generateSection(sectionKey, { ...centerData, __enabledSections: enabledSections });
                if (html) {
                    console.log(`[RSYC] Adding section "${sectionKey}" to profile (${html.length} chars)`);
                    sections.push(html);
                } else {
                    console.log(`[RSYC] Section "${sectionKey}" returned empty HTML`);
                }
            }
        });

        // Always generate schedule modals if there are schedules/events data (events and schedules are the same thing)
        let scheduleModals = '';
        console.log('[RSYC] Checking for schedules/events data:', {
            hasSchedules: !!centerData.schedules,
            schedulesCount: centerData.schedules ? centerData.schedules.length : 0,
            hasEvents: !!centerData.events,
            eventsCount: centerData.events ? centerData.events.length : 0
        });
        
        if (centerData.schedules || centerData.events) {
            // Generate schedule modals for all schedules/events to ensure they exist for events section
            console.log('[RSYC] Calling generateScheduleModalsOnly...');
            scheduleModals = this.generateScheduleModalsOnly(centerData);
            console.log('[RSYC] generateScheduleModalsOnly returned length:', scheduleModals.length);
        } else {
            console.log('[RSYC] No schedules or events data, skipping modal generation');
        }

        // Add audit modal with section navigation
        const auditModal = this.generateAuditModal(enabledSections);
        
        // Add joinCenter modal for front-end profiles
        const joinCenterModal = this.generateJoinCenterModal(centerData);
        console.log('[RSYC] Join Center modal generated:', joinCenterModal ? 'YES' : 'NO');
        console.log('[RSYC] Join Center modal length:', joinCenterModal ? joinCenterModal.length : 0);
        
        console.log(`[RSYC] Final profile: ${sections.length} sections, total length: ${sections.join('\n\n').length + scheduleModals.length + auditModal.length + joinCenterModal.length} chars`);
        console.log('[RSYC] Sections included:', sections.map((s, i) => `${i+1}. ${s.substring(0, 50)}...`).join('\n'));
        
        return sections.join('\n\n') + '\n\n' + scheduleModals + '\n\n' + auditModal + '\n\n' + joinCenterModal;
    }

    /**
     * Generate only schedule modals (for events section support)
     * This ensures modals exist for events even when schedules section is not enabled
     */
    generateScheduleModalsOnly(centerData) {
        const { center, schedules, events } = centerData;
        
        console.log('[RSYC] generateScheduleModalsOnly called with:', {
            hasSchedules: !!schedules,
            schedulesCount: schedules ? schedules.length : 0,
            hasEvents: !!events,
            eventsCount: events ? events.length : 0
        });
        
        if (!schedules && !events) {
            console.log('[RSYC] No schedules or events data, returning empty');
            return '';
        }
        
        // Merge all schedules and events for modal generation (ignore ShowinEventsSection filtering for modals)
        const eventCardsSource = Array.isArray(events) ? events : [];
        const scheduleCardsSource = Array.isArray(schedules) ? schedules : [];
        const allSchedulesForModals = [...scheduleCardsSource, ...eventCardsSource];
        
        console.log('[RSYC] Total schedules/events for modals:', allSchedulesForModals.length);
        
        if (!allSchedulesForModals || allSchedulesForModals.length === 0) {
            console.log('[RSYC] No schedules/events for modals, returning empty');
            return '';
        }
        
        // Generate modals for all schedules/events
        const scheduleModals = allSchedulesForModals.map(schedule => {
            console.log('[RSYC] Generating modal for schedule:', schedule.id, schedule.title);
            // Use the same modal generation logic as generateSchedules
            const addressText = [schedule.street, schedule.city, schedule.state, schedule.postalCode].filter(Boolean).join(', ');
            const directionsUrl = addressText ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText)}` : '';
            
            // Format date/time for modal
            const formatEventDateTimeParts = (event) => {
                if (!event) return { dateText: '', timeText: '' };
                
                let dateText = '';
                let timeText = '';
                
                if (event.eventDate) {
                    const date = new Date(event.eventDate);
                    if (!isNaN(date.getTime())) {
                        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        dateText = date.toLocaleDateString('en-US', options);
                    }
                }
                
                if (event.eventTime) {
                    timeText = event.eventTime;
                }
                
                return { dateText, timeText };
            };
            
            const dt = formatEventDateTimeParts(schedule);
            const eventDateText = dt.dateText || '';
            const eventTimeText = dt.timeText || '';
            
            return `
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
            ${schedule.URLImage || schedule.imageUrl ? `
                <div class="mb-4">
                    <img alt="${this.escapeHTML(schedule.title)}" src="${this.escapeHTML(schedule.URLImage || schedule.imageUrl)}" style="width:100%; height:auto; border-radius: 12px; display:block;" />
                </div>
            ` : ''}
            ${schedule.title ? `<h3 class="mb-2" style="color:#333;">${this.escapeHTML(schedule.title)}</h3>` : ''}
            ${schedule.subtitle ? `<p class="mb-3" style="color:#666; font-style:italic;">${this.escapeHTML(schedule.subtitle)}</p>` : ''}
            ${schedule.description ? `<p class="mb-1 rsyc-description">${schedule.description}</p>` : ''}
            ${addressText ? `
                <div class="mb-3 rsyc-event-location" style="background:#f8f9fa; padding:1rem; border-radius:8px; border:1px solid #e0e0e0;">
                    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.75rem;">
                        <div style="min-width:0;">
                            <strong style="display:block; margin-bottom:0.35rem;"><i class="bi bi-geo-alt me-2"></i>Address</strong>
                            <div>${this.escapeHTML(addressText)}</div>
                        </div>
                        ${directionsUrl ? `<a class="btn btn-outline-secondary btn-sm" href="${directionsUrl}" target="_blank" style="font-size: 0.8rem; padding:0.25rem 0.5rem; flex-shrink:0;"><i class="bi bi-sign-turn-right me-1"></i>Directions</a>` : ''}
                    </div>
                </div>
            ` : ''}
            ${(eventDateText || eventTimeText) ? `<div class="mb-3" style="font-size: 1.1rem; color:#333;">
                ${eventDateText ? `<div><strong>Date:</strong><br>${this.escapeHTML(eventDateText)}</div>` : ''}
                ${eventTimeText ? `<div><strong>Time:</strong><br>${this.escapeHTML(eventTimeText)}</div>` : ''}
            </div>` : ''}
        </div>
    </div>
</div>`;
        }).join('');
        
        console.log('[RSYC] Generated', scheduleModals.split('</div>').length - 1, 'modals');
        return scheduleModals;
    }

    /**
     * Generate Audit Modal with section navigation
     */
    generateAuditModal(enabledSections) {
        console.log('[RSYC] generateAuditModal called with sections:', enabledSections);
        
        // Build accordion items - always include enabled sections
        let accordionHTML = '';
        const sectionsToShow = enabledSections && enabledSections.length > 0 ? enabledSections : Object.keys(this.sections);
        
        sectionsToShow.forEach((sectionKey, index) => {
            const meta = this.sections[sectionKey];
            if (!meta) {
                console.warn('[RSYC] Section not in metadata:', sectionKey);
                return;
            }
            
            const accordionId = `audit-accordion-${sectionKey}`;
            const isExpanded = index === 0; // Expand first item
            const anchorId = meta.anchor.replace('#', '');
            
            accordionHTML += `<div class="rsyc-audit-section" data-section="${sectionKey}">
                <div class="rsyc-audit-header" onclick="window.toggleRSYCAuditAccordion('${sectionKey}')" style="cursor: pointer; padding: 1rem; background: #f8f9fa; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                    <strong style="color: #333; font-size: 1rem;">${meta.name}</strong>
                    <span id="${accordionId}-icon" style="transition: transform 0.2s; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; display: inline-block;">▼</span>
                </div>
                <div id="${accordionId}" class="rsyc-audit-content" style="padding: 0; background: #fafbfc; border: 1px solid #ddd; border-top: none; border-radius: 0 0 6px 6px; margin-bottom: 1rem; max-height: ${isExpanded ? '800px' : '0'}; overflow: hidden; transition: all 0.3s ease-in-out;">
                    <div style="padding: 1rem;">
                        <p style="margin: 0 0 1rem 0; color: #555; line-height: 1.6;">${meta.purpose || ''}</p>
                        
                        <div style="background: #f0f7f7; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #00929C;">
                            <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Anchor ID</div>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <code style="font-family: monospace; color: #00929C; background: white; padding: 0.5rem; border-radius: 3px; flex: 1; font-weight: 600;">#${anchorId}</code>
                                <button class="copy-btn" onclick="navigator.clipboard.writeText('#${anchorId}'); this.textContent='✓'; setTimeout(() => this.textContent='Copy', 1500);" style="padding: 0.5rem 1rem; background: #00929C; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: 600; white-space: nowrap;">Copy</button>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <strong style="color: #333; margin-bottom: 0.5rem; display: block;">📋 Fields:</strong>
                            <div style="color: #555; line-height: 1.8;">
                                ${Array.isArray(meta.fields) ? meta.fields.join(', ') : (meta.fields || '')}
                            </div>
                        </div>
                        
                        <button onclick="const el = document.getElementById('${anchorId}'); if (el) { el.scrollIntoView({behavior: 'smooth'}); window.closeRSYCModal('audit'); } else { alert('Section not found'); }" style="padding: 0.5rem 1rem; background: #00929C; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: 600;">Jump to #${anchorId}</button>
                    </div>
                </div>
            </div>`;
        });

        // Build table rows for all sections in metadata
        let tableHTML = Object.entries(this.sections).map(([key, meta]) => {
            const anchorId = meta.anchor.replace('#', '');
            const hasStories = key === 'stories' ? '✅' : '';
            return `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 0.75rem 1rem; color: #333; width: 40%;">${meta.name}</td>
            <td style="padding: 0.75rem 1rem; font-family: monospace; color: #00929C; width: 30%;"><code>#${anchorId}</code></td>
            <td style="padding: 0.75rem 1rem; text-align: center; font-size: 1.2rem; width: 15%;">${hasStories}</td>
            <td style="padding: 0.75rem 1rem; text-align: center; width: 15%;"><button onclick="navigator.clipboard.writeText('#${anchorId}'); alert('Copied: #${anchorId}');" style="padding: 0.3rem 0.8rem; background: #00929C; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Copy</button></td>
        </tr>`;
        }).join('');

        return `<!-- Audit Modal -->
<div id="rsyc-modal-audit" class="rsyc-modal" style="display: none !important;">
    <div class="rsyc-modal-content" style="max-width: 1000px;">
        <div class="rsyc-modal-header">
            <h3 style="margin: 0;">📋 Profile Sections Reference</h3>
            <button class="rsyc-modal-close" onclick="window.closeRSYCModal('audit')" style="background: none; border: none; font-size: 2rem; cursor: pointer;">&times;</button>
        </div>
        <div class="rsyc-modal-body" style="padding: 1.5rem;">
            <p style="color: #666; margin-bottom: 1.5rem;">Click on any section to view details and available fields. Use the copy buttons to copy anchor IDs.</p>

            <h4 style="margin-bottom: 1rem; color: #333;">📌 All Sections Quick Reference</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem; border: 1px solid #ddd; background: white;">
                <thead style="background: #f8f9fa;">
                    <tr><th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; width: 40%;">Section</th><th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; width: 30%;">Anchor</th><th style="padding: 0.75rem 1rem; text-align: center; font-weight: 600; width: 15%;">Stories</th><th style="padding: 0.75rem 1rem; text-align: center; font-weight: 600; width: 15%;">Copy</th></tr>
                </thead>
                <tbody>${tableHTML}</tbody>
            </table>

            <h4 style="margin-bottom: 1rem; color: #333;">📖 Section Details</h4>
            <div style="border-radius: 6px; overflow: hidden;">${accordionHTML}</div>
        </div>
    </div>
</div>

<style>
#rsyc-modal-audit { display: none !important; }
#rsyc-modal-audit.show { display: flex !important; }
.rsyc-audit-header:hover { background: #e8eaed; }
</style>

<script>
// Ensure modal functions exist
if (!window.closeRSYCModal) {
    window.closeRSYCModal = function(type) {
        const modal = document.getElementById('rsyc-modal-' + type);
        if (modal) modal.style.display = 'none';
    };
}
if (!window.showRSYCModal) {
    window.showRSYCModal = function(type) {
        const modal = document.getElementById('rsyc-modal-' + type);
        if (modal) modal.style.display = 'flex';
    };
}

// Accordion toggle for Audit Modal
if (!window.toggleRSYCAuditAccordion) {
    window.toggleRSYCAuditAccordion = function(sectionKey) {
        const content = document.getElementById('audit-accordion-' + sectionKey);
        const icon = document.getElementById('audit-accordion-' + sectionKey + '-icon');
        
        if (!content || !icon) return;
        
        const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight !== '';
        
        // Close all others
        document.querySelectorAll('.rsyc-audit-content').forEach(el => {
            el.style.maxHeight = '0px';
        });
        document.querySelectorAll('[id$="-icon"]').forEach(el => {
            if (el.id.startsWith('audit-accordion-')) {
                el.style.transform = 'rotate(0deg)';
            }
        });
        
        // Open this one if it was closed
        if (!isOpen) {
            content.style.maxHeight = '800px';
            icon.style.transform = 'rotate(180deg)';
        }
    };
}
console.log('[RSYC] Audit modal initialized');
</script>
        `;

    }

    /**
     * Generate Join Center Modal for front-end profiles for print
     */
    generateJoinCenterModal(data = {}) {
        console.log('[RSYC] generateJoinCenterModal called');
        const { center = {} } = data;
        const centName = center.name || center.Title || 'your Red Shield Youth Center';
        const modalHTML = `
<!-- Join Center Modal -->
<div id="rsyc-modal-joinCenter" class="rsyc-modal" style="display: none !important;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>🌟 Join the Center</h3>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline-primary" id="joinCenterJoinBtn" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-box-arrow-up-right me-2"></i>Join
                </button>
                <button class="btn btn-outline-primary" onclick="printJoinCenterModal()" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-printer me-2"></i>Print / Save as PDF
                </button>
                <button class="rsyc-modal-close" onclick="closeRSYCModal('joinCenter')">&times;</button>
            </div>
        </div>

        <div class="rsyc-modal-body">
            <div style="display: none;"><strong>${centName}</strong></div>
            <div style="text-align: center; margin-bottom: 2rem;">
                <p style="font-size: 1.1rem; color: #666; margin-bottom: 1.5rem; font-style: italic;">Where fun, friends, and adventures begin.</p>
            </div>

            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid #00929C;">
                <p style="margin: 0; font-size: 0.75rem;">Imagine a place where you can hang out, try new things, build skills, and feel like you truly belong. A Red Shield Youth Center isn't just somewhere to go after school—it's a place where you get to grow, lead, and discover what you're capable of.</p>
            </div>

            <p style="font-weight: 500; color: #00929C; margin-bottom: 1rem; font-size: 0.85rem;">At a Red Shield Youth Center, every day brings something new:</p>

            <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🎨</span>
                    <p style="margin: 0; flex: 1;">Create art, music, drama, or dance</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🏀</span>
                    <p style="margin: 0; flex: 1;">Play sports, hit the gym, swim, or try something new like archery or karate</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">📚</span>
                    <p style="margin: 0; flex: 1;">Get homework help, tutoring, and academic support when you need it</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">💻</span>
                    <p style="margin: 0; flex: 1;">Explore technology, coding, robotics, and STEM projects</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🌱</span>
                    <p style="margin: 0; flex: 1;">Join leadership groups, clubs, and service opportunities</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🎉</span>
                    <p style="margin: 0; flex: 1;">Go on field trips, special events, and unforgettable adventures</p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #f0f8f9 0%, #e6f3f4 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <p style="margin: 0; font-size: 0.75rem;">The Salvation Army ${centName} is a safe, welcoming space where caring mentors know your name, cheer you on, and help you grow—not just academically, but socially, emotionally, physically, and spiritually.</p>
            </div>

            <p style="margin: 0; font-size: 0.75rem;">You'll build real friendships, learn how to lead, stay healthy, explore your faith, and gain confidence for what's next—all in a place where you're supported and encouraged to be yourself.</p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
                <p style="margin: 0 0 1rem 0; font-weight: 500; color: #856404;">💬 Talk with your parents about joining a Red Shield Youth Center near you and invite them to explore this page with you:</p>
                <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: #00929C;">👉 www.redshieldyouth.org</p>
            </div>

            <div style="text-align: center; margin-top: 0.5rem; padding-top: 1.5rem; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 0.70rem; font-weight: 600; color: #00929C; font-style: italic;">Come for the fun. Stay for the friendships. Grow into who you're meant to be.</p>
            </div>
        </div>
    </div>
</div>
`;
        console.log('[RSYC] generateJoinCenterModal returning HTML, length:', modalHTML.length);
        return modalHTML;

    }

    /**
     * Generate individual section
     */
    generateSection(sectionKey, data) {
        try {
            console.log('[RSYC] generateSection called with:', sectionKey);
            const methods = {
                'hero': this.generateHero,
                'about': this.generateAbout,
                'navigation': this.generateNavigation,
                'schedules': this.generateSchedules,
                'social': this.generateSocial,
                'hours': this.generateHours,
                'programs': this.generatePrograms,
                'midsectionPhoto': this.generateMidsectionPhoto,
                'facilities': this.generateFacilities,
                'staff': this.generateStaff,
                'events': this.generateEvents,
                'infopages': this.generateInfoPages,
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
                    console.log('[RSYC] Calling method for section:', sectionKey);
                    const result = method.call(this, data);
                    console.log('[RSYC] Section', sectionKey, 'result length:', result ? result.length : 0);
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
<section id="hero" class="rsyc-hero" style="background-color: #00929C !important; padding: 20px 0; display: flex !important; justify-content: center; align-items: center; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <img src="${this.escapeHTML(exteriorPhoto)}" alt="${this.escapeHTML(center.name)} Exterior" 
         style="display: block; height: 500px; object-fit: cover; object-position: center; margin: 35px auto 0 auto; border-radius: 15px;">
</section>`;
    }

    generateAbout(data) {
        const { center, schedules, photos } = data; // removed __enabledSections, now handled by generateNavigation

        if (!center || !center.aboutText) return '';

        const hasSchedules = schedules && schedules.length > 0;
        const bottomMarginClass = hasSchedules ? ' mb-5' : '';

        const photoData = photos && photos.length > 0 ? photos[0] : null;

        const explainerVideoEmbedCode = center.explainerVideoEmbedCode || center.ExplainerVideoEmbedCode || '';
        const videoHTML = explainerVideoEmbedCode ? `
            <div class="mt-2" style="border-radius: 12px; overflow: hidden;">
                ${explainerVideoEmbedCode}
            </div>` : '';

        return `<!-- About This Center -->
<div id="about" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage" style="background-color: #00929C !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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
     * Navigation Section (Pills)
     */
    generateNavigation(data) {
        const { __enabledSections } = data;
        
        if (!__enabledSections || !Array.isArray(__enabledSections)) return '';

        // Filter to sections to show, excluding meta sections
        let candidateSections = __enabledSections.filter(key => 
            key !== 'hero' && 
            key !== 'about' && 
            key !== 'navigation' && 
            key !== 'footerPhoto' && 
            key !== 'midsectionPhoto' && 
            key !== 'contact' && 
            this.sections[key]
        );

        // Only show pills for sections that have actual content
        const navSections = candidateSections.filter(key => {
            try {
                // Special handling for schedules section - only show pill if there are actual schedules
                if (key === 'schedules') {
                    const { schedules } = data;
                    const hasSchedules = schedules && Array.isArray(schedules) && schedules.length > 0;
                    return hasSchedules;
                }
                
                const sectionHtml = this.generateSection(key, data);
                return sectionHtml && sectionHtml.trim().length > 0;
            } catch (e) {
                return false; // Skip sections with errors
            }
        }).sort((a, b) => {
            // Sort by section order to match page layout
            const orderA = this.sections[a]?.order || 999;
            const orderB = this.sections[b]?.order || 999;
            return orderA - orderB;
        });

        if (navSections.length === 0) return '';

        const navLinks = navSections.map(key => {
            const section = this.sections[key];
            return `<a href="${section.anchor}" class="btn btn-sm m-1" style="
                background-color: rgba(255, 255, 255, 0.15); 
                border: 1px solid rgba(255, 255, 255, 0.4); 
                color: #fff; 
                border-radius: 50px; 
                padding: 0.4rem 1.2rem; 
                font-weight: 600; 
                font-size: 0.9rem; 
                transition: all 0.2s ease;
                backdrop-filter: blur(4px);
                text-decoration: none;
                display: inline-block;
            " onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 0.25)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.15)'; this.style.transform='translateY(0)';">
                ${this.escapeHTML(section.name)}
            </a>`;
        }).join('');

        return `<!-- Navigation Menu -->
    <div id="navigation" class="section u-sa-tealBg" style="background-color: #00929C !important; padding: 1.5rem 0; margin-top: -0.5rem;">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-10 text-center">
                <p class="small mb-3 text-uppercase fw-bold text-white" style="letter-spacing: 1.5px; opacity: 0.85; font-size: 0.8rem;">Jump To Section</p>
                <div class="d-flex flex-wrap justify-content-center gap-2">
                    ${navLinks}
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Events Section
     */

    /**
     * Events Section
     */
    generateEvents(data) {
        try {
            const { center, events, schedules } = data;
            
            // Include program schedules that have ShowinEventsSection = true
            const eventCardsSource = Array.isArray(events) ? events : [];
            const scheduleCardsSource = Array.isArray(schedules) ? schedules.filter(s => s.ShowinEventsSection === true) : [];
            const mergedEvents = [...eventCardsSource, ...scheduleCardsSource];
            
            if (!mergedEvents || !Array.isArray(mergedEvents) || mergedEvents.length === 0) return '';

            // Helper function for friendly date formatting without timezone conversion
            const formatFriendlyDate = (dateStr, includeYear = true) => {
                if (!dateStr) return '';
                
                try {
                    // Parse the date string (YYYY-MM-DD format)
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
                    
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const month = months[date.getMonth()];
                    const day = date.getDate();
                    const year = date.getFullYear();
                    
                    if (includeYear) {
                        return `${month} ${day}, ${year}`;
                    } else {
                        return `${month} ${day}`;
                    }
                } catch (e) {
                    return dateStr; // Return original if error
                }
            };
            
            const formatFriendlyDateRange = (startDateStr, endDateStr) => {
                if (!startDateStr) return '';
                
                try {
                    const startDate = new Date(startDateStr);
                    const endDate = endDateStr ? new Date(endDateStr) : null;
                    
                    if (isNaN(startDate.getTime())) return startDateStr; // Return original if invalid
                    
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const startMonth = months[startDate.getMonth()];
                    const startDay = startDate.getDate();
                    const startYear = startDate.getFullYear();
                    
                    if (!endDate || isNaN(endDate.getTime())) {
                        // Single date
                        return `${startMonth} ${startDay}, ${startYear}`;
                    }
                    
                    const endMonth = months[endDate.getMonth()];
                    const endDay = endDate.getDate();
                    const endYear = endDate.getFullYear();
                    
                    // Check if same month and year
                    if (startMonth === endMonth && startYear === endYear) {
                        return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
                    }
                    
                    // Check if same year
                    if (startYear === endYear) {
                        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
                    }
                    
                    // Different years
                    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
                } catch (e) {
                    return startDateStr; // Return original if error
                }
            };

            const formatEventDateTimeParts = (event) => {
                try {
                    // For schedules, if we have explicit date fields, parse those
                    const isSchedule = !event.__type && (event.StartDate || event.startDate); // Check both capital and lowercase
                    
                    if (isSchedule && (event.StartDate || event.startDate)) {
                        // Parse schedule dates directly
                        try {
                            const startDateStr = String(event.StartDate || event.startDate || '').trim();
                            const endDateStr = String(event.EndDate || event.endDate || '').trim();
                            
                            if (startDateStr) {
                                // Use friendly date formatting without timezone conversion
                                const dateText = formatFriendlyDateRange(startDateStr, endDateStr);
                                
                                return {
                                    dateText: dateText,
                                    timeText: event.scheduleTime ? `${event.scheduleTime}` : ''
                                };
                            }
                            if (startDateStr) {
                                return { dateText: formatFriendlyDate(startDateStr), timeText: event.scheduleTime ? `${event.scheduleTime}` : '' };
                            }
                        } catch (e) {
                            console.warn('[RSYC] Error parsing schedule dates:', e);
                        }
                    }
                    
                    // For events, use SharePoint field names: StartDateandTime and EndDateandTime
                    let startTs = null;
                    let endTs = null;
                    
                    // Try multiple field name variations
                    const startDateField = event.StartDateandTime || event.startDateTime || event._startTimestamp;
                    const endDateField = event.EndDateandTime || event.endDateTime || event._endTimestamp;
                    
                    if (startDateField) {
                        startTs = Number.isFinite(startDateField) ? startDateField : Date.parse(String(startDateField));
                    }
                    if (endDateField) {
                        endTs = Number.isFinite(endDateField) ? endDateField : Date.parse(String(endDateField));
                    }
                    
                    const hasStart = startTs && !isNaN(startTs);
                    const hasEnd = endTs && !isNaN(endTs);
                    const start = hasStart ? new Date(startTs) : null;
                    const end = hasEnd ? new Date(endTs) : null;

                    // Convert dates to ISO strings for friendly formatting
                    const startDateStr = start ? start.toISOString().split('T')[0] : '';
                    const endDateStr = end ? end.toISOString().split('T')[0] : '';
                    
                    // Time formatter for time display only
                    const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });

                    if (start && end) {
                        const sameDay = start.toDateString() === end.toDateString();
                        if (sameDay) {
                            return {
                                dateText: formatFriendlyDate(startDateStr),
                                timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                            };
                        }
                        // Use friendly date formatting for date ranges
                        const dateText = formatFriendlyDateRange(startDateStr, endDateStr);
                        return {
                            dateText: dateText,
                            timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                        };
                    }
                    if (start) {
                        return { dateText: formatFriendlyDate(startDateStr), timeText: timeFmt.format(start) };
                    }
                    return { dateText: '', timeText: '' };
                } catch (e) {
                    console.warn('[RSYC] Error formatting event dates:', e);
                    return { dateText: '', timeText: '' };
                }
            };

        const sortedEvents = [...mergedEvents].sort((a, b) => {
            const aStart = Number.isFinite(a._startTimestamp) ? a._startTimestamp : null;
            const bStart = Number.isFinite(b._startTimestamp) ? b._startTimestamp : null;
            if (aStart && bStart) return aStart - bStart;
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            return 0;
        });

        const eventCards = sortedEvents.map(evt => {
            const isScheduleInEvents = evt.ShowinEventsSection === true && !evt.__type;
            
            // Extract event type from AllRelatedPrograms if available (look for id 41 or use first program)
            // Skip type ID 41 if the event title is "Summer Day Camp" (to avoid duplicate display)
            let eventTypeText = evt.eventType || '';
            if (isScheduleInEvents && evt.AllRelatedPrograms && Array.isArray(evt.AllRelatedPrograms) && evt.AllRelatedPrograms.length > 0) {
                const program41 = evt.AllRelatedPrograms.find(p => p.id === 41);
                if (program41 && evt.title !== 'Summer Day Camp') {
                    eventTypeText = program41.name || 'Summer Day Camp';
                } else if (!program41) {
                    eventTypeText = evt.AllRelatedPrograms[0].name || evt.AllRelatedPrograms[0].Value || eventTypeText;
                }
            }
            
            const eventSubtitleText = evt.subtitle || '';
            const eventCardSubtitleText = eventSubtitleText || eventTypeText;
            const dt = formatEventDateTimeParts(evt);
            const dateText = dt.dateText || '';
            const timeText = dt.timeText || '';
            
            // Add timezone to scheduleTime for schedules in events section
            let scheduleTimeWithTZ = evt.scheduleTime || '';
            if (scheduleTimeWithTZ && evt.timezone && isScheduleInEvents) {
                const tz = evt.timezone.toLowerCase();
                if (tz.includes('eastern')) {
                    scheduleTimeWithTZ += ' (Eastern)';
                } else if (tz.includes('central')) {
                    scheduleTimeWithTZ += ' (Central)';
                }
            }
            const addressText = [evt.street, evt.city, evt.state, evt.postalCode].filter(Boolean).join(', ');
            const directionsUrl = addressText ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText)}` : '';
            const onSaleTag = evt.isOnSale ? `
                <div style="position:absolute; top: 10px; right: 10px; background:#dc3545; color:#fff; font-weight:700; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 999px; letter-spacing: 0.02em;">
                    On Sale
                </div>` : '';
            
            // Use URLImage for schedules in modal body, URLThumbnailImage for card front
            const modalImageUrl = isScheduleInEvents ? evt.URLImage : evt.imageUrl;
            const cardImageUrl = isScheduleInEvents ? evt.URLThumbnailImage : evt.thumbnailUrl;

            const modalType = `schedule-${evt.id}`;

            // Event modal removed - events now use schedule modal

            return `
                <div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; border: 1px solid #dee2e6; overflow:hidden; position:relative;">
                    ${onSaleTag}
                    <!-- Desktop: Original layout -->
                    <div class="d-none d-lg-block" style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        <img alt="${this.escapeHTML(evt.title)}" src="${this.escapeHTML(cardImageUrl || '')}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none';" />
                    </div>
                    <div class="d-none d-lg-block card-body d-flex flex-column">
                        <div class="fw-bold mb-1" style="font-size: 1.05rem; line-height: 1.3;">${this.escapeHTML(evt.title)}</div>
                        ${eventCardSubtitleText && eventCardSubtitleText !== evt.title ? `<div class="text-muted mb-2" style="font-size: 0.9rem;">${this.escapeHTML(eventCardSubtitleText)}</div>` : ''}
                        <div style="flex-grow:1; font-size: 0.9rem; line-height: 1.5;">
                            ${dateText ? `<div><strong>Date:</strong> ${this.escapeHTML(dateText)}</div>` : ''}
                            ${isScheduleInEvents ? `${scheduleTimeWithTZ ? `<div><strong>Time:</strong> ${this.escapeHTML(scheduleTimeWithTZ)}</div>` : ''}` : `${timeText ? `<div><strong>Time:</strong> ${this.escapeHTML(timeText)}</div>` : ''}`}
                        </div>
                        <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Details</button>
                    </div>
                    
                    <!-- Tablet/Mobile: Horizontal layout -->
                    <div class="d-lg-none p-3" style="cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        <div class="d-flex align-items-center">
                            <div style="width: 150px; height: 150px; overflow:hidden; background:#f0f0f0; flex-shrink: 0;">
                                <img alt="${this.escapeHTML(evt.title)}" src="${this.escapeHTML(cardImageUrl || '')}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none';" />
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <div class="fw-bold mb-1" style="font-size: 0.95rem; line-height: 1.3;">${this.escapeHTML(evt.title)}</div>
                                ${eventCardSubtitleText && eventCardSubtitleText !== evt.title ? `<div class="text-muted mb-2" style="font-size: 0.8rem;">${this.escapeHTML(eventCardSubtitleText)}</div>` : ''}
                                <div style="font-size: 0.8rem; line-height: 1.4; margin-bottom: 0.5rem;">
                                    ${dateText ? `<div><strong>Date:</strong> ${this.escapeHTML(dateText)}</div>` : ''}
                                    ${isScheduleInEvents ? `${scheduleTimeWithTZ ? `<div><strong>Time:</strong> ${this.escapeHTML(scheduleTimeWithTZ)}</div>` : ''}` : `${timeText ? `<div><strong>Time:</strong> ${this.escapeHTML(timeText)}</div>` : ''}`}
                                </div>
                                <button type="button" class="btn btn-outline-primary align-self-start" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const scrollHint = sortedEvents.length > 3 ? `
            <p class="rsyc-scroll-hint text-center mb-n2">
                <small class="text-muted" style="color:rgba(255,255,255,0.85);">
                    Scroll to view more
                    <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                </small>
            </p>` : '';

        // always centre cards; CSS handles wrapping on wide screens
const justifyContent = 'justify-content-center';

        // Events and schedules are the same thing - no separate modal generation needed
        // All schedule/event modals are generated in the generateSchedules function

        return `<!-- Events -->
<div id="events" class="freeTextArea section" style="background-color: #cb2e3d; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 4rem; padding-bottom: 4rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="bg-area rounded p-4">
                    <h2 class="fw-bold mb-4 text-center" style="color:#fff;">Upcoming <em style="color:#fff;">Events</em></h2>
                    ${scrollHint}
                    <div class="rsyc-center-container" style="width:100%;">
                        <div style="display: flex; justify-content: center; width: 100%; margin: 0 auto;">
                            <div class="d-flex flex-wrap gap-4 justify-content-center">
                                ${eventCards}
                            </div>
                        </div>
                    </div>
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
     * Informational Pages Section
     * Mimics the Events section layout but focused on policies and resources.
     */
    generateInfoPages(data) {
        try {
            const { center, informationalPages, allPrograms, facilityFeatures } = data;
            if (!informationalPages || !Array.isArray(informationalPages) || informationalPages.length === 0) return '';

            let infoModals = '';
            const infoCards = informationalPages.map(page => {
                const categoryText = page.category || '';
                const modalType = `infopage-${page.id}`;
                
                // Helper to strip HTML for preview
                const plainText = (page.body || '').replace(/<[^>]*>?/gm, '');
                const previewText = plainText.length > 120 ? plainText.substring(0, 117) + '...' : plainText;

                // Build CTA buttons for modal
                const ctaButtons = [];
                if (page.primaryCTAName && page.primaryCTALink) {
                    ctaButtons.push(`<a class="btn btn-primary" href="${this.escapeHTML(page.primaryCTALink)}" target="_blank" style="background-color:#00929C; border:none; font-size: 0.9rem; padding:0.5rem 1rem;"><i class="bi bi-box-arrow-up-right me-2"></i>${this.escapeHTML(page.primaryCTAName)}</a>`);
                }
                if (page.secondaryCTAName && page.secondaryCTALink) {
                    ctaButtons.push(`<a class="btn btn-secondary" href="${this.escapeHTML(page.secondaryCTALink)}" target="_blank" style="background-color:#6c757d; border:none; font-size: 0.9rem; padding:0.5rem 1rem;"><i class="bi bi-box-arrow-up-right me-2"></i>${this.escapeHTML(page.secondaryCTAName)}</a>`);
                }
                if (page.externalUrl && !page.primaryCTALink && !page.secondaryCTALink) {
                    ctaButtons.push(`<a class="btn btn-primary" href="${this.escapeHTML(page.externalUrl)}" target="_blank" style="background-color:#00929C; border:none; font-size: 0.9rem; padding:0.5rem 1rem;"><i class="bi bi-box-arrow-up-right me-2"></i>View Original Source</a>`);
                }

                // Build points of contact section
                let contactsHTML = '';
                if (page.pointsOfContact && page.pointsOfContact.length > 0) {
                    const contactCards = page.pointsOfContact.map(contact => `
                        <div style="display:flex; gap:0.75rem; align-items:center; padding:0.75rem; background:white; border-radius:6px; border:1px solid #e0e0e0;">
                            ${contact.picture ? `<img src="${this.escapeHTML(contact.picture)}" alt="${this.escapeHTML(contact.name)}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">` : '<div style="width:48px; height:48px; border-radius:50%; background:#20B3A8; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:1.2rem;">' + (contact.name ? contact.name.charAt(0) : '?') + '</div>'}
                            <div style="flex:1; min-width:0;">
                                <div style="font-weight:600; color:#0C0C0C;">${this.escapeHTML(contact.name)}</div>
                                ${contact.jobTitle ? `<div style="font-size:0.85rem; color:#666;">${this.escapeHTML(contact.jobTitle)}</div>` : ''}
                                ${contact.email ? `<div style="font-size:0.85rem; color:#00929C;"><a href="mailto:${this.escapeHTML(contact.email)}" style="color:#00929C;">${this.escapeHTML(contact.email)}</a></div>` : ''}
                            </div>
                        </div>
                    `).join('');
                    
                    contactsHTML = `
                        <div style="margin-top:1.5rem; padding:1rem; background:#f8f9fa; border-radius:8px; border:1px solid #e0e0e0;">
                            <div style="font-weight:600; color:#0C0C0C; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
                                <i class="bi bi-person-circle" style="color:#20B3A8; font-size:1.2rem;"></i>
                                Points of Contact
                            </div>
                            <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                ${contactCards}
                            </div>
                        </div>
                    `;
                }

                // Build related programs and facilities
                let relatedHTML = '';
                const relatedItems = [];
                
                // Get related programs
                if (page.relatedProgramIds && page.relatedProgramIds.length > 0 && allPrograms) {
                    const programs = page.relatedProgramIds
                        .map(id => allPrograms.find(p => p.Id === id))
                        .filter(p => p && p.name)
                        .map(p => `<span class="badge" style="background-color:#FCA200; color:white; font-size:0.85rem; padding:0.4rem 0.8rem;">${this.escapeHTML(p.name)}</span>`)
                        .join(' ');
                    
                    if (programs) {
                        relatedItems.push(`
                            <div>
                                <div style="font-weight:600; color:#0C0C0C; margin-bottom:0.5rem; font-size:0.9rem;">
                                    <i class="bi bi-stars" style="color:#FCA200;"></i> Related Programs
                                </div>
                                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                                    ${programs}
                                </div>
                            </div>
                        `);
                    }
                }

                // Get related facilities
                if (page.relatedFacilityIds && page.relatedFacilityIds.length > 0 && facilityFeatures) {
                    const facilities = page.relatedFacilityIds
                        .map(id => facilityFeatures.find(f => f.Id === id))
                        .filter(f => f && f.name)
                        .map(f => `<span class="badge" style="background-color:#20B3A8; color:white; font-size:0.85rem; padding:0.4rem 0.8rem;">${this.escapeHTML(f.name)}</span>`)
                        .join(' ');
                    
                    if (facilities) {
                        relatedItems.push(`
                            <div>
                                <div style="font-weight:600; color:#0C0C0C; margin-bottom:0.5rem; font-size:0.9rem;">
                                    <i class="bi bi-building" style="color:#20B3A8;"></i> Related Facilities
                                </div>
                                <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                                    ${facilities}
                                </div>
                            </div>
                        `);
                    }
                }

                if (relatedItems.length > 0) {
                    relatedHTML = `
                        <div style="margin-top:1.5rem; padding:1rem; background:#f0f7f7; border-radius:8px; border:1px solid #d1e7e7;">
                            <div style="display:flex; flex-direction:column; gap:1rem;">
                                ${relatedItems.join('')}
                            </div>
                        </div>
                    `;
                }

                const infoModal = `
<!-- Modal for Informational Page Details -->
<div id="rsyc-modal-${modalType}" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap: 1rem;">
            <div style="min-width:0; flex: 1;">
                <h2 style="margin:0;">${this.escapeHTML(page.title)}</h2>
            </div>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('${modalType}')" style="background:none; border:none; cursor:pointer; font-size: 1.5rem; padding:0.25rem; color:#333; flex-shrink:0;">&times;</button>
        </div>
        
        ${ctaButtons.length > 0 ? `
        <div class="rsyc-modal-actions" style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; align-items:center; margin-bottom:1rem; padding:0.75rem; background:#f8f9fa; border-radius:8px; border:1px solid #e0e0e0;">
            ${ctaButtons.join('')}
            <button class="rsyc-modal-print" onclick="printRSYCModal('${modalType}')" style="background:none; border:none; cursor:pointer; font-size: 1.2rem; padding:0.5rem; color:#333;" title="Print or Save as PDF"><i class="bi bi-printer"></i></button>
        </div>
        ` : ''}

        <div class="rsyc-modal-body" style="color:#333;">
            ${page.heroImage ? `
            <div style="width:100%; max-height:400px; overflow:hidden; border-radius:8px; margin-bottom:1.5rem;">
                <img src="${this.escapeHTML(page.heroImage)}" alt="${this.escapeHTML(page.title)}" style="width:100%; height:100%; object-fit:cover; display:block;" />
            </div>
            ` : ''}
            
            <div class="mb-3" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                <div style="font-size: 1.1rem; font-weight:600; color:#0C0C0C;"><strong>${this.escapeHTML(center.name || center.Title)}</strong></div>
                <img src="https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg" alt="Red Shield Youth Centers Logo" style="height:42px; max-width:120px; width:auto; object-fit:contain; display:block;" />
            </div>

            ${categoryText ? `<div class="mb-3"><span class="badge" style="background-color:#20B3A8;">${this.escapeHTML(categoryText)}</span></div>` : ''}

            <div class="mb-3" style="font-size: 1.1rem; line-height: 1.7; color:#333;">
                ${page.body || '<p>No content provided.</p>'}
            </div>

            ${contactsHTML}
            ${relatedHTML}
        </div>
    </div>
</div>`;

                infoModals += infoModal;

                // Card with hero image
                const cardImageHTML = page.heroImage 
                    ? `<div style="width:100%; aspect-ratio:16/9; background-image:url('${this.escapeHTML(page.heroImage)}'); background-size:cover; background-position:center; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')"></div>`
                    : `<div style="width:100%; aspect-ratio:16/9; background:#f0f7f7; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                         <i class="bi bi-journal-text" style="font-size: 3.5rem; color:#20B3A8; opacity:0.8;"></i>
                    </div>`;

                return `
                <div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; border: 1px solid #dee2e6; overflow:hidden; background: white;">
                    <!-- Desktop: Original layout -->
                    <div class="d-none d-lg-block">
                        ${cardImageHTML}
                        <div class="card-body d-flex flex-column" style="padding: 1.25rem;">
                            <div class="fw-bold mb-1" style="font-size: 1.05rem; line-height: 1.3; color:#2F4857;">${this.escapeHTML(page.title)}</div>
                            ${categoryText ? `<div class="text-muted mb-2" style="font-size: 0.8rem; font-weight:700; text-transform:uppercase; color:#20B3A8 !important;">${this.escapeHTML(categoryText)}</div>` : ''}
                            <div style="flex-grow:1; font-size: 0.9rem; line-height: 1.5; color:#555; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                ${this.escapeHTML(previewText)}
                            </div>
                            <button type="button" class="btn btn-outline-primary mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Information</button>
                        </div>
                    </div>
                    
                    <!-- Tablet/Mobile: Horizontal layout -->
                    <div class="d-lg-none p-3" style="cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        <div class="d-flex align-items-start">
                            <div style="width: 150px; height: 150px; overflow:hidden; background:#f0f7f7; flex-shrink: 0; border-radius: 8px;">
                                ${page.heroImage 
                                    ? `<img src="${this.escapeHTML(page.heroImage)}" alt="${this.escapeHTML(page.title)}" style="width:100%; height:100%; object-fit:cover; object-position:center;" />`
                                    : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                                         <i class="bi bi-journal-text" style="font-size: 3rem; color:#20B3A8; opacity:0.8;"></i>
                                    </div>`
                                }
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <div class="fw-bold mb-1" style="font-size: 0.95rem; line-height: 1.3; color:#2F4857;">${this.escapeHTML(page.title)}</div>
                                ${categoryText ? `<div class="text-muted mb-2" style="font-size: 0.75rem; font-weight:700; text-transform:uppercase; color:#20B3A8 !important;">${this.escapeHTML(categoryText)}</div>` : ''}
                                <div style="flex-grow:1; font-size: 0.8rem; line-height: 1.4; color:#555; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${this.escapeHTML(previewText)}
                                </div>
                                <button type="button" class="btn btn-outline-primary mt-2 align-self-start" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Information</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;}).join('');

            const scrollHint = informationalPages.length > 3 ? `
                <p class="rsyc-scroll-hint text-center mb-n2">
                    <small class="text-muted" style="color:rgba(255,255,255,0.85);">
                        Scroll to view more
                        <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                    </small>
                </p>` : '';

            const justifyContent = 'justify-content-center';

            return `<!-- Informational Pages -->
<div id="infopages" class="freeTextArea section" style="background-color: #00929C; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 4rem; padding-bottom: 4rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="bg-area rounded-4 p-4">
                <h2 class="fw-bold mb-2 text-center" style="color:#fff;">Center <em style="color:#fff;">Information</em></h2>
                <p class="text-center mb-4" style="max-width: 600px; margin-left: auto; margin-right: auto; color: rgba(255,255,255,0.9);">Key resources, safety protocols, and operational guidelines for our center community.</p>
                ${scrollHint}
                <div class="rsyc-center-container" style="width:100%;">
                    <div style="display: flex; justify-content: center; width: 100%; margin: 0 auto;">
                        <div class="d-flex flex-wrap gap-4 justify-content-center">
                            ${infoCards}
                        </div>
                    </div>
                </div>
                ${infoModals}
            </div>
        </div>
    </div>
</div>`;
        } catch (err) {
            console.error('[RSYC] Error generating informational pages section:', err);
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
            <div class="mb-3" style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;">
                <div style="flex:1;">
                    <div style="font-size: 1.1rem; font-weight:600; color:#0C0C0C;"><strong>${this.escapeHTML(center.name || center.Title)}</strong></div>
                    ${storyDateFormatted ? `<div class="text-muted" style="font-size: 0.9rem; margin-bottom:1rem;">${storyDateFormatted}</div>` : ''}
                </div>
                <img src="https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg" alt="Red Shield Youth Centers Logo" style="height:42px; max-width:120px; width:auto; object-fit:contain; display:block; flex-shrink:0;" />
            </div>

            ${story.mainImage ? `
            <div style="float:right; margin:0 0 1rem 1.5rem; max-width:280px; width:100%; max-width:45%;">
                <img src="${this.escapeHTML(story.mainImage)}" alt="${this.escapeHTML(story.title)}" style="width:100%; height:auto; border-radius:8px;" />
            </div>
            ` : ''}

            ${story.author ? `<div class="mb-3" style="font-size: 0.95rem; font-style: italic; color:#666;">By ${this.escapeHTML(story.author)}</div>` : ''}
            
            ${story.body ? `<div class="rsyc-story-body" style="font-size: 1rem; line-height: 1.7; color:#333;">${story.body}</div>` : ''}
            
            <div style="clear:both;"></div>
        </div>
    </div>
</div>`;

                storyModals += storyModal;

                return `
                <div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; border: 1px solid #dee2e6; overflow:hidden; position:relative;">
                    <!-- Desktop: Original layout -->
                    <div class="d-none d-lg-block" style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        ${story.thumbnailImage ? `
                        <img src="${this.escapeHTML(story.thumbnailImage)}" alt="${this.escapeHTML(story.title)}" style="width:100%; height:100%; object-fit:cover; object-position:center;" />
                        ` : `
                        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #20B3A8 0%, #2F4857 100%); color:white; font-size:2rem;">
                            <i class="bi bi-book"></i>
                        </div>
                        `}
                    </div>
                    <div class="d-none d-lg-block card-body d-flex flex-column">
                        <div class="fw-bold mb-1" style="font-size: 1.05rem; line-height: 1.3;">${this.escapeHTML(story.title)}</div>
                        ${storyDateFormatted ? `<div class="text-muted mb-2" style="font-size: 0.9rem;">${storyDateFormatted}</div>` : ''}
                        <div style="flex-grow:1; font-size: 0.9rem; line-height: 1.5;">
                            ${story.excerpt ? `<div>${this.escapeHTML(story.excerpt.substring(0, 100))}${story.excerpt.length > 100 ? '...' : ''}</div>` : ''}
                        </div>
                        <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">Read Story</button>
                    </div>
                    
                    <!-- Tablet/Mobile: Horizontal layout -->
                    <div class="d-lg-none p-3" style="cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
                        <div class="d-flex align-items-center">
                            <div style="width: 150px; height: 150px; overflow:hidden; background:#f0f0f0; flex-shrink: 0;">
                                ${story.thumbnailImage ? `
                                <img src="${this.escapeHTML(story.thumbnailImage)}" alt="${this.escapeHTML(story.title)}" style="width:100%; height:100%; object-fit:cover; object-position:center;" />
                                ` : `
                                <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #20B3A8 0%, #2F4857 100%); color:white; font-size:2rem;">
                                    <i class="bi bi-book"></i>
                                </div>
                                `}
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <div class="fw-bold mb-1" style="font-size: 0.95rem; line-height: 1.3;">${this.escapeHTML(story.title)}</div>
                                ${storyDateFormatted ? `<div class="text-muted mb-2" style="font-size: 0.8rem;">${storyDateFormatted}</div>` : ''}
                                <div style="flex-grow:1; font-size: 0.8rem; line-height: 1.4; margin-bottom: 0.5rem;">
                                    ${story.excerpt ? `<div>${this.escapeHTML(story.excerpt.substring(0, 80))}${story.excerpt.length > 80 ? '...' : ''}</div>` : ''}
                                </div>
                                <button type="button" class="btn btn-outline-primary align-self-start" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">Read Story</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const scrollHint = sortedStories.length > 3 ? `
            <p class="rsyc-scroll-hint text-center mb-n2">
                <small class="text-muted" style="color:rgba(255,255,255,0.85);">
                    Scroll to view more
                    <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                </small>
            </p>` : '';

        const justifyContent = 'justify-content-center';

        return `<!-- Stories -->
<style>
    #stories .stories-container {
        display: flex;
        gap: 1rem;
        padding: 0.5rem 0;
        align-items: stretch;
        scroll-snap-type: x mandatory;
    }
    
    #stories .card {
        width: 280px;
        border: 1px solid #dee2e6;
        overflow: hidden;
        position: relative;
    }
    
    #stories .card-body {
        display: flex;
        flex-direction: column;
    }
    
    @media (min-width: 992px) {
        #stories .stories-container {
            overflow-x: auto;
            overflow-y: hidden;
            flex-wrap: nowrap;
            justify-content: var(--stories-justify, flex-start);
        }
        #stories .stories-container > div {
            scroll-snap-align: start;
            flex-shrink: 0;
        }
    }
    
    @media (max-width: 991px) {
        #stories .stories-container {
            flex-wrap: wrap;
            justify-content: var(--stories-justify, flex-start);
            overflow: visible;
            gap: 1.5rem;
        }
        #stories .stories-container > div {
            flex-shrink: 0;
            width: 100%;
            max-width: 340px;
        }
        #stories .card {
            width: 100%;
        }
        #stories .card-body {
            padding: 0.75rem;
        }
        #stories .card-body > div:nth-child(n+2) {
            font-size: 0.85rem;
        }
    }
</style>
<div id="stories" class="freeTextArea section" style="background-color: #20B3A8; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; --stories-justify: ${justifyContent === 'justify-content-start' ? 'flex-start' : 'flex-start'};">
    <div class="u-positionRelative" style="padding-top: 4rem; padding-bottom: 4rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="bg-area rounded p-4">
                    <h2 class="fw-bold mb-4 text-center" style="color:#fff;">Recent <em style="color:#fff;">Stories</em></h2>
                    ${scrollHint}
                    <div class="rsyc-center-container" style="width:100%;">
                        <div style="display: flex; justify-content: center; width: 100%; margin: 0 auto;">
                            <div class="d-flex flex-wrap gap-4 justify-content-center">
                            ${storyCards}
                        </div>
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
<div id="programs" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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
                // Try multiple field name variations for SharePoint data
                const startDateField = event.StartDateandTime || event.startDateTime || event._startTimestamp;
                const endDateField = event.EndDateandTime || event.endDateTime || event._endTimestamp;
                
                let startTs = null;
                let endTs = null;
                
                if (startDateField) {
                    startTs = Number.isFinite(startDateField) ? startDateField : Date.parse(String(startDateField));
                }
                if (endDateField) {
                    endTs = Number.isFinite(endDateField) ? endDateField : Date.parse(String(endDateField));
                }
                
                const hasStart = startTs && !isNaN(startTs);
                const hasEnd = endTs && !isNaN(endTs);
                const start = hasStart ? new Date(startTs) : null;
                const end = hasEnd ? new Date(endTs) : null;

                const dateFmtWithYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
                const dateFmtNoYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
                const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });

                if (start && end) {
                    const sameDay = start.toDateString() === end.toDateString();
                    if (sameDay) {
                        return {
                            dateText: dateFmtWithYear.format(start),
                            timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                        };
                    }
                    // Check if same year - consolidate year to end only
                    const sameYear = start.getFullYear() === end.getFullYear();
                    const dateText = sameYear
                        ? `${dateFmtNoYear.format(start)} - ${dateFmtNoYear.format(end)}, ${end.getFullYear()}`
                        : `${dateFmtWithYear.format(start)} - ${dateFmtWithYear.format(end)}`;
                    return {
                        dateText: dateText,
                        timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                    };
                }
                if (start) {
                    return { dateText: dateFmtWithYear.format(start), timeText: timeFmt.format(start) };
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
        const scheduleCardsSource = Array.isArray(schedules) ? schedules : []; // Show ALL schedules

        console.log('[RSYC] Schedules section data:', {
            totalSchedules: schedules ? schedules.length : 0,
            eventsCount: events ? events.length : 0,
            schedulesWithShowInEvents: schedules ? schedules.filter(s => s.ShowinEventsSection === true).length : 0,
            allSchedulesForDisplay: scheduleCardsSource.length,
            mergedCount: [...scheduleCardsSource, ...eventCardsSource].length
        });

        // Merge events into the same card scroller (Program Schedule cards)
        // Events are tagged by __type==='event' and have _startTimestamp for sorting.
        // Show ALL schedules in schedules section (events section will filter separately)
        const mergedSchedules = [...scheduleCardsSource, ...eventCardsSource];

        if (mergedSchedules && mergedSchedules.length > 0) {
            // Only show title if there are schedule items
            scheduleTitleSection = `<h2 class="fw-bold mb-4 text-center"><span style="color:#FCA200;">Program </span><em style="color:#ffffff;">Schedule</em></h2>`;

            // Sort schedules by proximity to current month, etc. (unchanged)
            // ...existing code...

            const sortedSchedules = [...mergedSchedules]; // keep sort logic as before if needed

            // Helper function for friendly date formatting without timezone conversion
            const formatFriendlyDate = (dateStr, includeYear = true) => {
                if (!dateStr) return '';
                
                try {
                    // Parse the date string (YYYY-MM-DD format)
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
                    
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const month = months[date.getMonth()];
                    const day = date.getDate();
                    const year = date.getFullYear();
                    
                    if (includeYear) {
                        return `${month} ${day}, ${year}`;
                    } else {
                        return `${month} ${day}`;
                    }
                } catch (e) {
                    return dateStr; // Return original if error
                }
            };
            
            const formatFriendlyDateRange = (startDateStr, endDateStr) => {
                if (!startDateStr) return '';
                
                try {
                    const startDate = new Date(startDateStr);
                    const endDate = endDateStr ? new Date(endDateStr) : null;
                    
                    if (isNaN(startDate.getTime())) return startDateStr; // Return original if invalid
                    
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const startMonth = months[startDate.getMonth()];
                    const startDay = startDate.getDate();
                    const startYear = startDate.getFullYear();
                    
                    if (!endDate || isNaN(endDate.getTime())) {
                        // Single date
                        return `${startMonth} ${startDay}, ${startYear}`;
                    }
                    
                    const endMonth = months[endDate.getMonth()];
                    const endDay = endDate.getDate();
                    const endYear = endDate.getFullYear();
                    
                    // Check if same month and year
                    if (startMonth === endMonth && startYear === endYear) {
                        return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
                    }
                    
                    // Check if same year
                    if (startYear === endYear) {
                        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
                    }
                    
                    // Different years
                    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
                } catch (e) {
                    return startDateStr; // Return original if error
                }
            };

            scheduleCards = sortedSchedules.map(schedule => {
                const isEvent = schedule && schedule.__type === 'event';

                // For events shown in program schedule: extract time from StartDateandTime/EndDateandTime
                let eventDateText = '';
                let eventTimeText = '';

                if (isEvent) {
                    // ...existing event logic...
                    // (leave as is)
                }

                const eventTypeText = isEvent ? (schedule.eventType || '') : '';
                const eventSubtitleText = isEvent ? (schedule.subtitle || '') : '';
                const eventCardSubtitleText = isEvent ? (eventSubtitleText || eventTypeText) : '';

                // Use friendly date formatting for program schedules
                let scheduleDateText = '';
                const currentYear = new Date().getFullYear();
                
                if (schedule.startDate && schedule.endDate) {
                    // Check if both dates are in current year
                    const startYear = new Date(schedule.startDate).getFullYear();
                    const endYear = new Date(schedule.endDate).getFullYear();
                    const bothCurrentYear = startYear === currentYear && endYear === currentYear;
                    
                    if (bothCurrentYear) {
                        // Use format without year for current year dates
                        scheduleDateText = formatFriendlyDateRange(schedule.startDate, schedule.endDate).replace(/,\s*\d{4}/g, '').replace(/,\s*\d{4}\s*-\s*/g, ' - ');
                    } else {
                        scheduleDateText = formatFriendlyDateRange(schedule.startDate, schedule.endDate);
                    }
                } else if (schedule.startDate && !schedule.endDate) {
                    const startYear = new Date(schedule.startDate).getFullYear();
                    if (startYear === currentYear) {
                        // Use format without year for current year date
                        scheduleDateText = formatFriendlyDate(schedule.startDate, false);
                    } else {
                        scheduleDateText = formatFriendlyDate(schedule.startDate);
                    }
                }
                
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
                
// build address text for schedules (city/state/postal may also be available)
                const addressText = [schedule.address, schedule.city, schedule.state, schedule.postalCode].filter(Boolean).join(', ');
                const directionsUrl = addressText ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText)}` : '';

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
                
                const modalType = `schedule-${schedule.id}`;

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
            ${schedule.URLImage || schedule.imageUrl ? `
                <div class="mb-4">
                    <img alt="${this.escapeHTML(schedule.title)}" src="${this.escapeHTML(schedule.URLImage || schedule.imageUrl)}" style="width:100%; height:auto; border-radius: 12px; display:block;" />
                </div>
            ` : ''}
            ${schedule.title ? `<h3 class="mb-2" style="color:#333;">${this.escapeHTML(schedule.title)}</h3>` : ''}

            ${schedule.subtitle ? `<p class="mb-3" style="color:#666; font-style:italic;">${this.escapeHTML(schedule.subtitle)}</p>` : ''}
            ${schedule.description ? `<p class="mb-1 rsyc-description">${schedule.description}</p>` : ''}
            ${addressText ? `
                <div class="mb-3 rsyc-event-location" style="background:#f8f9fa; padding:1rem; border-radius:8px; border:1px solid #e0e0e0;">
                    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.75rem;">
                        <div style="min-width:0;">
                            <strong style="display:block; margin-bottom:0.35rem;"><i class="bi bi-geo-alt me-2"></i>Address</strong>
                            <div>${this.escapeHTML(addressText)}</div>
                        </div>
                        ${directionsUrl ? `<a class="btn btn-outline-secondary btn-sm" href="${directionsUrl}" target="_blank" style="font-size: 0.8rem; padding:0.25rem 0.5rem; flex-shrink:0;"><i class="bi bi-sign-turn-right me-1"></i>Directions</a>` : ''}
                    </div>
                </div>
            ` : ''}
            ${(eventDateText || eventTimeText) ? `<div class="mb-3" style="font-size: 1.1rem; color:#333;">
                ${eventDateText ? `<div><strong>Date:</strong><br>${this.escapeHTML(eventDateText)}</div>` : ''}
                ${eventTimeText ? `<div style="margin-top:0.5rem;"><strong>Time:</strong><br>${this.escapeHTML(eventTimeText)}</div>` : ''}
            </div>` : ''}
            ${schedule.cost ? `<div class="mb-3" style="font-size: 1.1rem; color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}

            ${(schedule.primaryButtonUrl || schedule.secondaryButtonUrl) ? `
            <div class="mb-4" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                ${schedule.primaryButtonUrl ? `<a class="btn btn-primary" href="${this.escapeHTML(schedule.primaryButtonUrl)}" target="_blank" rel="noopener noreferrer" style="background-color:#00929C; border:none;">${this.escapeHTML(schedule.primaryButtonText || 'Learn More')}</a>` : ''}
                ${schedule.secondaryButtonUrl ? `<a class="btn btn-outline-primary" href="${this.escapeHTML(schedule.secondaryButtonUrl)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(schedule.secondaryButtonText || 'More Info')}</a>` : ''}
            </div>
            ` : ''}
            
            ${hasContent(schedule.scheduleDisclaimer) ? `<div class="mb-4 rsyc-important-dates" style="background:#fff3cd; padding:1rem; border-radius:6px; border-left:3px solid #ff6b6b; color:#000;"><strong class="rsyc-important-dates-title" style="color:#000;"><i class="bi bi-exclamation-triangle me-2"></i>Important Dates/Closures:</strong><br><div class="mt-2 rsyc-important-dates-body" style="font-size:0.95rem;">${this.escapeHTML(schedule.scheduleDisclaimer)}</div></div>` : ''}
            
            <div class="row">
                ${hasContent(daysText) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${this.escapeHTML(daysText)}</div>` : ''}
                ${hasContent(timeText) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${this.escapeHTML(timeText)}</div>` : ''}
                ${hasContent(months) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Runs In:</strong><br>${this.escapeHTML(months)}</div>` : ''}
                ${hasContent(registrationMonths) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Opens:</strong><br>${this.escapeHTML(registrationMonths)}</div>` : ''}
                ${hasContent(schedule.registrationFee) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Fee:</strong><br>${this.escapeHTML(schedule.registrationFee)}</div>` : ''}
                ${hasContent(schedule.ageRange) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Ages:</strong><br>${this.escapeHTML(schedule.ageRange)}</div>` : ''}
                ${scheduleDateText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Dates:</strong><br>${this.escapeHTML(scheduleDateText)}</div>` : ''}
                ${addressText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Address:</strong><br>${this.escapeHTML(addressText)}</div>` : ''}
                ${hasContent(schedule.contactPhoneNumber) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Phone:</strong><br>${this.escapeHTML(schedule.contactPhoneNumber)}</div>` : ''}
                ${eventTypeText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Type:</strong><br>${this.escapeHTML(eventTypeText)}</div>` : ''}
                
                ${hasContent(schedule.registrationDeadline) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Deadline:</strong><br>${this.escapeHTML(schedule.registrationDeadline)}</div>` : ''}
                ${hasContent(schedule.location) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Location:</strong><br>${this.escapeHTML(schedule.location)}</div>` : ''}
                ${hasContent(schedule.cost) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}
                ${hasContent(schedule.frequency) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Frequency:</strong><br>${this.escapeHTML(schedule.frequency)}</div>` : ''}
                
                ${hasContent(schedule.transportationFeeandDetails) ? `<div class="col-sm-12 mb-3 rsyc-transportation" style="background:#fff9ea; padding:1rem; border-radius:6px; border-left:3px solid #ffb300; color:#333;"><strong style="color:#555;"><i class="bi bi-bus-front me-2"></i>Transportation:</strong><br><div class="mt-1 rsyc-transportation-value" style="font-size:0.95rem;">${this.preserveLineBreaks(schedule.transportationFeeandDetails)}</div></div>` : ''}
                
                ${hasContent(schedule.whatToBring) || hasContent(schedule.materialsProvided) ? `
                <div class="col-sm-12 mb-3" style="background:#f0f8ff; padding:1rem; border-radius:6px; border-left:3px solid #4169e1; color:#333;">
                    <strong style="color:#4169e1;"><i class="bi bi-backpack2 me-2"></i>What to Bring:</strong>
                    ${hasContent(schedule.whatToBring) ? `<div class="mt-2">${this.preserveLineBreaks(schedule.whatToBring)}</div>` : ''}
                    ${hasContent(schedule.materialsProvided) ? `<div class="mt-2"><u>Materials Provided:</u><br>${this.preserveLineBreaks(schedule.materialsProvided)}</div>` : ''}
                </div>
                ` : ''}
                
                ${hasContent(schedule.closedDates) ? `<div class="col-sm-12 mb-3" style="background:#ffe6e6; padding:1rem; border-radius:6px; border-left:3px solid #dc3545; color:#333;"><strong style="color:#dc3545;"><i class="bi bi-calendar-x me-2"></i>Closed Dates:</strong><br>${this.preserveLineBreaks(schedule.closedDates)}</div>` : ''}
                ${hasContent(schedule.openHalfDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Half Days:</strong><br>${this.preserveLineBreaks(schedule.openHalfDayDates)}</div>` : ''}
                ${hasContent(schedule.openFullDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Full Days:</strong><br>${this.preserveLineBreaks(schedule.openFullDayDates)}</div>` : ''}
                ${(() => {
                    // output any extra simple string fields not already rendered above
                    const known = ['id','title','subtitle','description','videoEmbedCode','URLImage','imageUrl','URLThumbnailImage','thumbnailUrl','centerName','startDate','endDate','scheduleDays','scheduleTime','registrationFee','ageRange','scheduleDisclaimer','daysText','timeText','months','registrationMonths','registrationDeadline','location','cost','frequency','transportationFeeandDetails','closedDates','openHalfDayDates','openFullDayDates','orientationDetails','whatToBring','materialsProvided','contacts','contactInfo','address','city','state','postalCode','contactPhoneNumber','status','timezone'];
                    const extras = Object.keys(schedule).filter(k => !known.includes(k) && schedule[k] && typeof schedule[k] === 'string').map(k => `
                        <div class="col-sm-12 mb-2" style="color:#333;"><strong>${this.escapeHTML(k)}:</strong> ${this.escapeHTML(schedule[k])}</div>
                    `);
                    return extras.length ? `<div class="col-sm-12 mb-3" style="background:#eef; padding:0.75rem; border-radius:6px;">
                        ${extras.join('')}
                    </div>` : '';
                })()}
                
                ${hasContent(schedule.orientationDetails) ? `
                <div class="col-sm-12 mb-3" style="background:#fffacd; padding:1rem; border-radius:6px; border-left:3px solid #ff8c00; color:#333;">
                    <strong style="color:#000;"><i class="bi bi-info-circle me-2"></i>Orientation Details:</strong>
                    <div class="mt-2" style="font-size:0.95rem; color:#000;">${this.preserveLineBreaks(schedule.orientationDetails)}</div>
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
                            ${hasContent(contact.phone) ? `<div class="rsyc-contact-phone mt-1"><a href="tel:${contact.phone.replace(/\D/g, '')}" style="color:#2F4857; text-decoration:underline; font-weight:400;"><i class="bi bi-telephone me-2"></i>${this.escapeHTML(contact.phone)}</a></div>` : ''}
                        </div>
                    `).join('') : ''}
                    ${hasContent(schedule.contactInfo) ? `<div class="mt-2 pt-2 border-top" style="font-size:0.9rem; border-top-color:rgba(32,179,168,0.2) !important;">${this.makeContactsClickable(this.escapeHTML(schedule.contactInfo))}</div>` : ''}
                </div>
                ` : ''}
                
                ${hasContent(schedule.prerequisites) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Prerequisites:</strong><br>${this.preserveLineBreaks(schedule.prerequisites)}</div>` : ''}
                ${hasContent(schedule.dropOffPickUp) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Drop-off/Pick-up Info:</strong><br>${this.preserveLineBreaks(schedule.dropOffPickUp)}</div>` : ''}
            </div>
                
                ${(schedule.AllRelatedPrograms && Array.isArray(schedule.AllRelatedPrograms) && schedule.AllRelatedPrograms.length > 0) ? (() => {
                    const relatedProgramsHtml = schedule.AllRelatedPrograms.map(relatedProgram => {
                        // Extract program name from AllRelatedPrograms (comes as object with id and name from rsyc-data.js)
                        const programName = typeof relatedProgram === 'string' ? relatedProgram : (relatedProgram.name || relatedProgram.Value || '');
                        // Find full program details from allPrograms (ALL programs from RSYCPrograms.json) - case-insensitive and trim whitespace
                        const normalizedName = programName.trim().toLowerCase();
                        const fullProgram = (data.allPrograms || []).find(p => {
                            const pName = (p.name || p.Title || '').trim().toLowerCase();
                            return pName === normalizedName;
                        });
                        
                        // Log for debugging
                        if (!fullProgram) {
                            console.warn('[RelatedPrograms] Could not find program details for:', programName, 'in', (data.allPrograms || []).map(p => p.name || p.Title));
                        }
                        
                        // Extract icon and description from full program details
                        const icon = fullProgram?.iconClass || fullProgram?.IconClass || 'bi-star';
                        const description = fullProgram?.description || fullProgram?.Description || '';
                        return `
                        <div class="col-sm-12 col-md-6 mb-3">
                            <div class="d-flex align-items-start">
                                <i class="bi ${icon} feature-icon me-3 mt-1" style="font-size: 1.5rem; color:#20B3A8;"></i>
                                <div style="flex: 1;">
                                    <div class="fw-bold" style="font-size: 1rem; color:#333;">${programName}</div>
                                    ${description ? `<div class="text-muted small mt-1" style="line-height: 1.4; font-size: 0.9rem;">${description}</div>` : ''}
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('');
                    return `
                <div class="col-sm-12 mb-3" style="background:#f5f5f5; padding:1rem; border-radius:6px; color:#333;">
                    <strong style="color:#333; font-size:1.1rem; display:block; margin-bottom:0.75rem;"><i class="bi bi-link me-2" style="color:#20B3A8;"></i>Related Programs</strong>
                    <div class="row">
                        ${relatedProgramsHtml}
                    </div>
                </div>
                    `;
                })() : ''}
            </div>
        </div>
    </div>
</div>`;

                // For small screens, force a break after three words of the Active value
                // For small screens, format Active text robustly and force a break after three words
                // Use formatActiveForDisplay() to normalize spacing (fixes cases like "exceptJune")
                let activeHTML = months ? this.formatActiveForDisplay(months) : '';

                // Build accordion version for small screens/iPad with same content as modal
                const accordionId = `rsyc-accordion-${schedule.id}`;
                const scheduleAccordion = `
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
                        ${schedule.title ? `<h3 class="mb-2" style="color:#333;">${this.escapeHTML(schedule.title)}</h3>` : ''}
                        ${schedule.subtitle ? `<p class="mb-3" style="color:#666; font-style:italic;">${this.escapeHTML(schedule.subtitle)}</p>` : ''}
                        ${schedule.description ? `<p class="mb-1 rsyc-description">${schedule.description}</p>` : ''}
                        
                        ${hasContent(schedule.scheduleDisclaimer) ? `<div class="mb-4" style="background:#fff3cd; padding:1rem; border-radius:6px; border-left:3px solid #ff6b6b; color:#000;"><strong style="color:#000;"><i class="bi bi-exclamation-triangle me-2"></i>Important Dates/Closures:</strong><br><div class="mt-2" style="font-size:0.95rem;">${this.escapeHTML(schedule.scheduleDisclaimer)}</div></div>` : ''}
                        
                        <div class="row">
                            ${hasContent(schedule.ageRange) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Age Range:</strong><br>${this.escapeHTML(schedule.ageRange)}</div>` : ''}
                            ${hasContent(daysText) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${this.escapeHTML(daysText)}</div>` : ''}
                            ${hasContent(timeText) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${this.escapeHTML(timeText)}</div>` : ''}
                            ${hasContent(schedule.frequency) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Frequency:</strong><br>${this.escapeHTML(schedule.frequency)}</div>` : ''}
                            ${hasContent(months) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Runs In:</strong><br>${this.escapeHTML(months)}</div>` : ''}
                            ${hasContent(registrationMonths) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Opens:</strong><br>${this.escapeHTML(registrationMonths)}</div>` : ''}
                            ${hasContent(schedule.registrationDeadline) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Deadline:</strong><br>${this.escapeHTML(schedule.registrationDeadline)}</div>` : ''}
                            ${hasContent(schedule.registrationFee) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Fee:</strong><br>${this.escapeHTML(schedule.registrationFee)}</div>` : ''}
                            ${hasContent(schedule.cost) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}
                            ${hasContent(schedule.location) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Location:</strong><br>${this.escapeHTML(schedule.location)}</div>` : ''}
                            ${hasContent(schedule.capacity) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Capacity:</strong><br>${this.escapeHTML(schedule.capacity)}</div>` : ''}
                            
                            ${hasContent(schedule.agesServed?.join(', ')) ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Ages:</strong><br>${this.escapeHTML(schedule.agesServed.join(', '))}</div>` : ''}
                            ${scheduleDateText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Dates:</strong><br>${this.escapeHTML(scheduleDateText)}</div>` : ''}
                            
                            ${hasContent(schedule.transportationFeeandDetails) ? `<div class="col-sm-12 mb-3 rsyc-transportation" style="background:#fff9ea; padding:1rem; border-radius:6px; border-left:3px solid #ffb300; color:#333;"><strong style="color:#555;"><i class="bi bi-bus-front me-2"></i>Transportation:</strong><br><div class="mt-1 rsyc-transportation-value" style="font-size:0.95rem;">${this.preserveLineBreaks(schedule.transportationFeeandDetails)}</div></div>` : ''}
                            
                            ${hasContent(schedule.whatToBring) || hasContent(schedule.materialsProvided) ? `
                            <div class="col-sm-12 mb-3" style="background:#f0f8ff; padding:1rem; border-radius:6px; border-left:3px solid #4169e1; color:#333;">
                                <strong style="color:#4169e1;"><i class="bi bi-backpack2 me-2"></i>What to Bring:</strong>
                                ${hasContent(schedule.whatToBring) ? `<div class="mt-2">${this.preserveLineBreaks(schedule.whatToBring)}</div>` : ''}
                                ${hasContent(schedule.materialsProvided) ? `<div class="mt-2"><u>Materials Provided:</u><br>${this.preserveLineBreaks(schedule.materialsProvided)}</div>` : ''}
                            </div>
                            ` : ''}
                            
                            ${hasContent(schedule.closedDates) ? `<div class="col-sm-12 mb-3" style="background:#ffe6e6; padding:1rem; border-radius:6px; border-left:3px solid #dc3545; color:#333;"><strong style="color:#dc3545;"><i class="bi bi-calendar-x me-2"></i>Closed Dates:</strong><br>${this.preserveLineBreaks(schedule.closedDates)}</div>` : ''}
                            ${hasContent(schedule.openHalfDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Half Days:</strong><br>${this.preserveLineBreaks(schedule.openHalfDayDates)}</div>` : ''}
                            ${hasContent(schedule.openFullDayDates) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Open Full Days:</strong><br>${this.preserveLineBreaks(schedule.openFullDayDates)}</div>` : ''}
                            
                            ${hasContent(schedule.orientationDetails) ? `
                            <div class="col-sm-12 mb-3" style="background:#fffacd; padding:1rem; border-radius:6px; border-left:3px solid #ff8c00; color:#333;">
                                <strong style="color:#000;"><i class="bi bi-info-circle me-2"></i>Orientation Details:</strong>
                                <div class="mt-2" style="font-size:0.95rem; color:#000;">${this.preserveLineBreaks(schedule.orientationDetails)}</div>
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
                                        ${hasContent(contact.phone) ? `<div class="mt-1"><a href="tel:${contact.phone.replace(/\D/g, '')}" style="color:#2F4857; text-decoration:none; font-weight:400;"><i class="bi bi-telephone me-2"></i>${this.escapeHTML(contact.phone)}</a></div>` : ''}
                                    </div>
                                `).join('') : ''}
                                ${hasContent(schedule.contactInfo) ? `<div class="mt-2 pt-2 border-top" style="font-size:0.9rem; border-top-color:rgba(32,179,168,0.2) !important;">${this.makeContactsClickable(this.escapeHTML(schedule.contactInfo))}</div>` : ''}
                            </div>
                            ` : ''}
                            
                            ${hasContent(schedule.prerequisites) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Prerequisites:</strong><br>${this.preserveLineBreaks(schedule.prerequisites)}</div>` : ''}
                            ${hasContent(schedule.dropOffPickUp) ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Drop-off/Pick-up Info:</strong><br>${this.preserveLineBreaks(schedule.dropOffPickUp)}</div>` : ''}
                        </div>
                        
                        ${(schedule.AllRelatedPrograms && Array.isArray(schedule.AllRelatedPrograms) && schedule.AllRelatedPrograms.length > 0) ? (() => {
                            const relatedProgramsHtml = schedule.AllRelatedPrograms.map(relatedProgram => {
                                // Extract program name from AllRelatedPrograms (comes as object with id and name from rsyc-data.js)
                                const programName = typeof relatedProgram === 'string' ? relatedProgram : (relatedProgram.name || relatedProgram.Value || '');
                                // Find full program details from allPrograms (ALL programs from RSYCPrograms.json) - case-insensitive and trim whitespace
                                const normalizedName = programName.trim().toLowerCase();
                                const fullProgram = (data.allPrograms || []).find(p => {
                                    const pName = (p.name || p.Title || '').trim().toLowerCase();
                                    return pName === normalizedName;
                                });
                                
                                // Log for debugging
                                if (!fullProgram) {
                                    console.warn('[RelatedPrograms-Accordion] Could not find program details for:', programName, 'in', (data.allPrograms || []).map(p => p.name || p.Title));
                                }
                                
                                // Extract icon and description from full program details
                                const icon = fullProgram?.iconClass || fullProgram?.IconClass || 'bi-star';
                                const description = fullProgram?.description || fullProgram?.Description || '';
                                return `
                                <div class="col-sm-12 col-md-6 mb-3">
                                    <div class="d-flex align-items-start">
                                        <i class="bi ${icon} feature-icon me-3 mt-1" style="font-size: 1.5rem; color:#20B3A8;"></i>
                                        <div style="flex: 1;">
                                            <div class="fw-bold" style="font-size: 1rem; color:#333;">${programName}</div>
                                            ${description ? `<div class="text-muted small mt-1" style="line-height: 1.4; font-size: 0.9rem;">${description}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('');
                            return `
                        <div class="col-sm-12 mb-3" style="background:#f5f5f5; padding:1rem; border-radius:6px; color:#333;">
                            <strong style="color:#333; font-size:1.1rem; display:block; margin-bottom:0.75rem;"><i class="bi bi-link me-2" style="color:#20B3A8;"></i>Related Programs</strong>
                            <div class="row">
                                ${relatedProgramsHtml}
                            </div>
                        </div>
                            `;
                        })() : ''}
                    </div>
                </div>
                `;
                
                // Use schedule modal for both schedules and events
                scheduleModals += scheduleModal;

                return `
                    <div class="col-12 col-md-6 d-flex">
                        <!-- Desktop Card Version -->
                        <div class="schedule-card rsyc-schedule-card-desktop text-dark card h-100 bg-white d-flex flex-column" style="border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                            <div class="card-body d-flex flex-column flex-grow-1">
                                ${onSaleTag}
                                <div class="flex-shrink-0">
                                    <h5 class="fw-bold mb-1 text-wrap">${this.escapeHTML(schedule.title)}</h5>
                                    ${schedule.subtitle ? `<div class="text-muted small text-wrap">${this.escapeHTML(schedule.subtitle)}</div>` : ''}
                                </div>
                                <div class="flex-grow-1">
                                    <p class="mb-0 text-wrap">
                                        ${eventDateText ? `<strong>Date:</strong> ${this.escapeHTML(eventDateText)}<br>` : ''}
                                        ${eventTimeText ? `<strong>Time:</strong> ${this.escapeHTML(eventTimeText)}<br>` : ''}
                                        ${scheduleDateText ? `<strong>Date:</strong> ${this.escapeHTML(scheduleDateText)}<br>` : ''}
                                        ${!scheduleDateText && daysText ? `<strong>Days:</strong> <span class="d-inline-block text-wrap">${this.escapeHTML(daysText)}</span><br>` : ''}
                                        ${timeText ? `<strong>Time:</strong> ${this.escapeHTML(timeText)}<br>` : ''}
                                    </p>
                                </div>
                                <div class="flex-shrink-0">
                                    ${expandableInfo}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Mobile Accordion Version -->
                        <div class="rsyc-schedule-accordion-mobile" style="display: none;">
                            ${scheduleAccordion}
                        </div>
                    </div>
                    `;
            }).join('');
            
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
    <!-- Desktop Table Layout (hidden on mobile/tablet) -->
    <div class="d-none d-lg-block">
        <div class="table-responsive">
            <table class="table table-hover bg-white" style="border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                <thead class="table-light">
                    <tr>
                        <th style="border-radius:8px 0 0 0;">Program</th>
                        <th style="border-radius:0 8px 0 0;">Summary</th>
                        <th style="border-radius:0 8px 0 0;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedSchedules.map(schedule => {
                        console.log('[RSYC] Processing schedule for table:', schedule.title);
                        
                        // Use the exact same date/time extraction logic as the cards
                        const isEvent = schedule && schedule.__type === 'event';
                        
                        // For events shown in program schedule: extract time from StartDateandTime/EndDateandTime
                        let eventDateText = '';
                        let eventTimeText = '';
                        
                        if (isEvent) {
                            // Use the same event logic as cards
                            const dt = this.formatEventDateTimeParts(schedule);
                            eventDateText = dt.dateText || '';
                            eventTimeText = dt.timeText || '';
                        }
                        
                        // Use the same date formatting logic as cards - check what functions are available
                        let scheduleDateText = '';
                        
                        // Try to use the same date formatting as cards
                        if (schedule.startDate && schedule.endDate) {
                            // Use the formatFriendlyDateRange function if available, otherwise fallback
                            try {
                                scheduleDateText = this.formatFriendlyDateRange(schedule.startDate, schedule.endDate);
                            } catch (e) {
                                console.warn('[RSYC] formatFriendlyDateRange not available, using fallback:', e);
                                // Simple fallback formatting
                                const start = new Date(schedule.startDate);
                                const end = new Date(schedule.endDate);
                                const options = { month: 'short', day: 'numeric' };
                                scheduleDateText = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
                            }
                        } else if (schedule.startDate && !schedule.endDate) {
                            try {
                                scheduleDateText = this.formatFriendlyDate(schedule.startDate);
                            } catch (e) {
                                console.warn('[RSYC] formatFriendlyDate not available, using fallback:', e);
                                // Simple fallback formatting
                                const date = new Date(schedule.startDate);
                                scheduleDateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            }
                        }
                        
                        // Parse days - format as "Monday - Friday" or list individual days (same as cards)
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
                        
                        // Parse time - the ScheduleTime field already contains the full time range (same as cards)
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
                        
                        console.log('[RSYC] Table schedule data (using card logic):', {
                            title: schedule.title,
                            isEvent: isEvent,
                            eventDateText: eventDateText,
                            eventTimeText: eventTimeText,
                            scheduleDateText: scheduleDateText,
                            timeText: timeText,
                            daysText: daysText,
                            startDate: schedule.startDate,
                            endDate: schedule.endDate,
                            scheduleTime: schedule.scheduleTime,
                            scheduleDays: schedule.scheduleDays
                        });
                        
                        // Build date/time/days display using the same logic as cards
                        let dateTimeInfo = [];
                        if (isEvent && eventDateText) dateTimeInfo.push(`<strong>Date:</strong> ${eventDateText}`);
                        else if (scheduleDateText) dateTimeInfo.push(`<strong>Date:</strong> ${scheduleDateText}`);
                        
                        if (isEvent && eventTimeText) dateTimeInfo.push(`<strong>Time:</strong> ${eventTimeText}`);
                        else if (timeText) dateTimeInfo.push(`<strong>Time:</strong> ${timeText}`);
                        
                        if (daysText) dateTimeInfo.push(`<strong>Days:</strong> ${daysText}`);
                        
                        const dateTimeDisplay = dateTimeInfo.length > 0 ? dateTimeInfo.join('<br>') : '';
                        
                        return `
                        <tr>
                            <td style="width: 40%;">
                                <div class="fw-bold text-wrap">${this.escapeHTML(schedule.title)}</div>
                                ${schedule.subtitle ? `<div class="text-muted small text-wrap">${this.escapeHTML(schedule.subtitle)}</div>` : ''}
                            </td>
                            <td style="width: 50%;">
                                ${dateTimeDisplay ? `<div class="text-wrap small">${dateTimeDisplay}</div>` : '<div class="text-muted small">No date/time information available</div>'}
                            </td>
                            <td style="width: 10%;">
                                <button class="btn btn-sm btn-outline-primary" onclick="showRSYCModal('schedule-${schedule.id}', '${this.escapeHTML(center.name || center.Title, true)}')">
                                    View Details
                                </button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Mobile/Tablet Card Layout (hidden on desktop) -->
    <div class="d-lg-none">
        <div class="row g-2 justify-content-between align-items-stretch">
            ${scheduleCards}
        </div>
    </div>
    
    <div class="text-center mt-3 mb-0">
        <button class="btn btn-outline-primary" onclick="printAllSchedules('${schedulesCacheKey}')" style="border-color:#d3d3d3; color:#d3d3d3;">
            <i class="bi bi-printer me-2"></i>Print / Save all as PDF
        </button>
    </div>`;
        }
        
        // About This Center renders via the dedicated 'about' section.
        
        // Update title section to only show "Program Schedules" when there are actual schedules
        if (!scheduleCards || scheduleCards.trim() === '') {
            // Only show social section, no schedules title
            scheduleTitleSection = '';
        }

        return `<!-- Program Schedules -->
<div id="schedules" class="freeTextArea u-centerBgImage section u-coverBgImage" style="background-color: #00929C !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="mt-0 mb-5">
                ${scheduleTitleSection}
                
                <div class="schedule-scroll-wrapper" style="margin:0; display:flex; flex-direction:column; align-items:center;">
                    ${scheduleScrollSection}
                </div>
                
                ${scheduleModals}
            </div>
        </div>
    </div>
</div>`;    }

    /**
     * Social Links Section
     */
    generateSocial(data) {
        const { center } = data;
        
        if (!center) return '';
        
        // Comprehensive social media field checking - support multiple naming conventions
        const socialFields = {
            facebook: [
                center.FacebookPageURL, center.facebookURL, center.Facebook, center.facebook,
                center.FacebookPage, center.facebookPage
            ].filter(Boolean),
            instagram: [
                center.instagramURL, center.InstagramURL, center.instagram, center.Instagram,
                center.InstagramPage, center.instagramPage
            ].filter(Boolean),
            twitter: [
                center.twitterURL, center.TwitterURL, center.twitter, center.Twitter,
                center.TwitterHandle, center.twitterHandle, center.XURL, center.xURL
            ].filter(Boolean),
            linkedin: [
                center.linkedInURL, center.LinkedInURL, center.linkedIn, center.LinkedIn,
                center.LinkedInPage, center.linkedInPage
            ].filter(Boolean),
            youtube: [
                center.youTubeURL, center.YouTubeURL, center.youtube, center.YouTube,
                center.YouTubeChannel, center.youtubeChannel
            ].filter(Boolean),
            tiktok: [
                center.tiktokURL, center.TikTokURL, center.tiktok, center.TikTok,
                center.TikTokHandle, center.tiktokHandle
            ].filter(Boolean),
            pinterest: [
                center.pinterestURL, center.PinterestURL, center.pinterest, center.Pinterest,
                center.PinterestProfile, center.pinterestProfile
            ].filter(Boolean),
            snapchat: [
                center.snapchatURL, center.SnapchatURL, center.snapchat, center.Snapchat,
                center.SnapchatHandle, center.snapchatHandle
            ].filter(Boolean)
        };
        
        // Check for Facebook embed
        const hasEmbedFacebook = center.EmbedFacebookFeed || center.embedFacebookFeedCode || 
                                center.FacebookEmbed || center.facebookEmbed;
        
        // Check if any social media content exists
        const hasAnySocial = Object.values(socialFields).some(urls => urls.length > 0) || hasEmbedFacebook;
        
        console.log('[RSYC] Social section data check:', {
            facebook: socialFields.facebook.length > 0 ? socialFields.facebook[0] : null,
            instagram: socialFields.instagram.length > 0 ? socialFields.instagram[0] : null,
            twitter: socialFields.twitter.length > 0 ? socialFields.twitter[0] : null,
            linkedin: socialFields.linkedin.length > 0 ? socialFields.linkedin[0] : null,
            youtube: socialFields.youtube.length > 0 ? socialFields.youtube[0] : null,
            tiktok: socialFields.tiktok.length > 0 ? socialFields.tiktok[0] : null,
            pinterest: socialFields.pinterest.length > 0 ? socialFields.pinterest[0] : null,
            snapchat: socialFields.snapchat.length > 0 ? socialFields.snapchat[0] : null,
            hasEmbedFacebook: !!hasEmbedFacebook,
            hasAnySocial: hasAnySocial
        });
        
        if (!hasAnySocial) {
            console.log('[RSYC] No social data found, returning empty');
            return '';
        }
        
        console.log('[RSYC] Social data found, generating section');
        
        // Build social icons with proper icons and links
        const socialIcons = [];
        
        if (socialFields.facebook.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.facebook[0])}" target="_blank" title="Facebook"><i class="bi bi-facebook" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.instagram.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.instagram[0])}" target="_blank" title="Instagram"><i class="bi bi-instagram" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.twitter.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.twitter[0])}" target="_blank" title="X/Twitter"><i class="bi bi-twitter-x" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.linkedin.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.linkedin[0])}" target="_blank" title="LinkedIn"><i class="bi bi-linkedin" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.youtube.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.youtube[0])}" target="_blank" title="YouTube"><i class="bi bi-youtube" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.tiktok.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.tiktok[0])}" target="_blank" title="TikTok"><i class="bi bi-tiktok" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.pinterest.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.pinterest[0])}" target="_blank" title="Pinterest"><i class="bi bi-pinterest" style="font-size:1.45rem;"></i></a>`);
        }
        if (socialFields.snapchat.length > 0) {
            socialIcons.push(`<a class="text-white text-decoration-none" href="${this.escapeHTML(socialFields.snapchat[0])}" target="_blank" title="Snapchat"><i class="bi bi-snapchat" style="font-size:1.45rem;"></i></a>`);
        }
        
        // Build social section with icons if any social links exist
        const socialIconsSection = socialIcons.length > 0 ? `
    <div class="text-center">
        <div class="d-flex justify-content-center gap-3 mb-4">
            ${socialIcons.join(' ')}
        </div>
    </div>` : '';
        
        // Build Facebook embed code section if available
        const facebookEmbedSection = hasEmbedFacebook ? `
    <div class="mt-4 facebook-feed-container" style="display: flex; justify-content: center;">
        ${hasEmbedFacebook}
    </div>` : '';
        
        const socialSection = socialIconsSection + facebookEmbedSection;
        
        console.log('[RSYC] Social section content:', {
            iconsCount: socialIcons.length,
            hasIcons: socialIcons.length > 0,
            hasEmbed: !!hasEmbedFacebook,
            socialSectionLength: socialSection.length,
            willShowHeader: true
        });
        
        return `<!-- Social Links -->
<div id="social" class="freeTextArea section" style="background-color: #6c757d; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 2rem; padding-bottom: 2rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="text-center">
                <h2 class="fw-bold mb-4 text-center" style="color:#fff;">Follow <em style="color:#fff;">Us</em></h2>
                ${socialSection}
            </div>
        </div>
    </div>
</div>`;
    }

    /**
     * Hours of Operation Section
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

    <div id="hours" class="section operationHoursAdvanced-container" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">

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
<div id="facilities" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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
		<div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; border: 1px solid #dee2e6; overflow:hidden;">
			<!-- Desktop: Original layout -->
			<div class="d-none d-lg-block" style="width:100%; aspect-ratio:1/1; overflow:hidden; background:#f0f0f0; cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
				<img alt="${this.escapeHTML(displayName)}" class="card-img-top" src="${this.escapeHTML(photo)}" style="width:100%; height:100%; object-fit:cover; ${objectPositionStyle} ${scaleStyle} display:block;">
			</div>
			<div class="d-none d-lg-block card-body d-flex flex-column">
				<div class="fw-bold mb-1" style="font-size: 1.1rem; line-height: 1.3;">${this.escapeHTML(displayName)}</div>
				<div class="text-muted mb-2" style="font-size: 0.95rem;">${this.escapeHTML(title)}</div>
				<div style="flex-grow:1;"></div>
				<button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Bio</button>
			</div>
			
			<!-- Tablet/Mobile: Horizontal layout -->
			<div class="d-lg-none p-3" style="cursor:pointer;" onclick="showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">
				<div class="d-flex align-items-center">
					<div style="width: 150px; height: 150px; overflow:hidden; background:#f0f0f0; flex-shrink: 0;">
						<img alt="${this.escapeHTML(displayName)}" src="${this.escapeHTML(photo)}" style="width:100%; height:100%; object-fit:cover; ${objectPositionStyle} ${scaleStyle} display:block;">
					</div>
					<div class="ms-3 flex-grow-1">
						<div class="fw-bold mb-1" style="font-size: 1rem; line-height: 1.3;">${this.escapeHTML(displayName)}</div>
						<div class="text-muted mb-2" style="font-size: 0.85rem;">${this.escapeHTML(title)}</div>
						<button type="button" class="btn btn-outline-primary align-self-start" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showRSYCModal('${modalType}', '${this.escapeHTML(center.name || center.Title, true)}')">View Bio</button>
					</div>
				</div>
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

            // Extract center contact information
            const centerEmail = (data && data.center && (data.center.email || data.center.emailAddress || data.center.contactEmail)) ? 
                (data.center.email || data.center.emailAddress || data.center.contactEmail) : '';
            const centerPhone = (data && data.center && (data.center.phone || data.center.phoneNumber || data.center.contactPhone || data.center.mainPhone)) ? 
                (data.center.phone || data.center.phoneNumber || data.center.contactPhone || data.center.mainPhone) : '';

            // Extract staff member contact information - comprehensive field checking
            let staffEmail = '';
            let staffPhone = '';
            
            // Use processed leader data first (from rsyc-data.js)
            if (leader.phoneNumber) {
                staffPhone = leader.phoneNumber;
            }
            
            // Check leader object if not found in processed data
            if (!staffPhone && leader) {
                staffPhone = leader.PhoneNumber || leader.phoneNumber || leader.Phone || leader.phone || leader.contactPhone || leader.mobile || '';
            }
            
            // Extract email
            if (leader) {
                staffEmail = leader.EmailAddress || leader.emailAddress || leader.email || leader.Email || leader.contactEmail || '';
            }
            
            // Check person object if not found in leader
            if ((!staffEmail || !staffPhone) && person) {
                staffEmail = staffEmail || person.EmailAddress || person.emailAddress || person.email || person.Email || person.contactEmail || '';
                staffPhone = staffPhone || person.PhoneNumber || person.phoneNumber || person.Phone || person.phone || person.contactPhone || person.mobile || '';
            }

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
                            ${staffEmail || staffPhone ? `<div class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem; line-height: 1.4;">
                                ${staffEmail ? `<div><i class="bi bi-envelope" style="margin-right: 0.35rem;"></i><a href="mailto:${this.escapeHTML(staffEmail)}" style="color: inherit; text-decoration: none;">${this.escapeHTML(staffEmail)}</a></div>` : ''}
                                ${staffPhone ? `<div><i class="bi bi-telephone" style="margin-right: 0.35rem;"></i><a href="tel:${this.escapeHTML(staffPhone.replace(/\D/g, ''))}" style="color: inherit; text-decoration: none;">${this.escapeHTML(staffPhone)}</a></div>` : ''}
                            </div>` : ''}
                            ${centerName ? `<div class="text-muted" style="margin-top: 0.75rem; font-size: 0.9rem; line-height: 1.4;">
                                <div><i class="bi bi-building" style="margin-right: 0.35rem;"></i>${this.escapeHTML(centerName)}</div>
                                ${centerLocation ? `<div><i class="bi bi-geo-alt" style="margin-right: 0.35rem;"></i>${this.escapeHTML(centerLocation)}</div>` : ''}
                                ${centerEmail ? `<div><i class="bi bi-envelope" style="margin-right: 0.35rem;"></i><a href="mailto:${this.escapeHTML(centerEmail)}" style="color: inherit; text-decoration: none;">${this.escapeHTML(centerEmail)}</a></div>` : ''}
                                ${centerPhone ? `<div><i class="bi bi-telephone" style="margin-right: 0.35rem;"></i><a href="tel:${this.escapeHTML(centerPhone.replace(/\D/g, ''))}" style="color: inherit; text-decoration: none;">${this.escapeHTML(centerPhone)}</a></div>` : ''}
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

        // No scroll hint needed for grid layout
        const scrollHint = '';
        
        // always centre cards; scroll/ wrapping handled via CSS
        const justifyContent = 'justify-content-center';

        return `<!-- Staff & Community Leaders -->
<div id="staff" class="freeTextArea u-centerBgImage section u-coverBgImage" style="background-color: #F7A200; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <div class="bg-area rounded p-4" id="profiles">
                    <h2 class="fw-bold mb-4 text-center"><span style="color:#ffffff;">Staff &amp; <em style="color:#ffffff;">Community Leaders</em></span></h2>
                    ${scrollHint}
                    
                    <div style="display: flex; justify-content: center; width: 100%; margin: 0 auto;">
                        <div class="d-flex flex-wrap gap-4 justify-content-center">
                            ${staffCards}
                        </div>
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
     * Displays centers in same area command with pills and card grid pagination
     */
    generateNearbyCenters(data) {
        const { center, allCenters } = data;
        
        console.log('[RSYCTemplates v2026-02-17] generateNearbyCenters called');
        
        // Get parent corps and area command info
        const parentCorpsName = center.corpName || center.field_8 || '';
        const areaCommandName = center.areaCommand || center.field_17 || '';
        const divisionName = center.division || '';
        
        // Separate centers by area command vs other divisions
        let areaCommandCenters = [];
        let divisionCenters = [];
        const _norm = v => String(v || '').toLowerCase().trim();

        if (allCenters && allCenters.length > 0) {
            const areaNorm = _norm(areaCommandName);
            const divNorm = _norm(divisionName);
            
            allCenters.forEach(c => {
                if (!c) return;
                if (c.id && center.id && String(c.id) === String(center.id)) return;
                if (c.sharePointId && center.sharePointId && String(c.sharePointId) === String(center.sharePointId)) return;
                
                // Check if in same area command
                if (areaNorm) {
                    const candidates = [c.areaCommand, c.field_17, c.field_10, c.corpName, c.field_8];
                    if (candidates.some(s => areaNorm && String(s || '').toLowerCase().trim().includes(areaNorm))) {
                        areaCommandCenters.push(c);
                        return;
                    }
                }
                
                // Check if in same division
                if (divNorm && _norm(c.division || '').includes(divNorm)) {
                    divisionCenters.push(c);
                }
            });
            
            areaCommandCenters.sort((a, b) => (String(a.name || '').toLowerCase()).localeCompare(String(b.name || '').toLowerCase()));
            divisionCenters.sort((a, b) => (String(a.name || '').toLowerCase()).localeCompare(String(b.name || '').toLowerCase()));
        }
        
        // Build area command cards
        const areaCardHTML = areaCommandCenters.map(c => this.generateNearbyCard(c)).join('');
        
        // Build division cards
        const divisionCardHTML = divisionCenters.map(c => this.generateNearbyCard(c)).join('');
        
        return `<!-- Nearby Youth Centers -->
<div id="nearby" class="freeTextArea section u-sa-greyVeryLightBg" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; padding-top: 5rem; padding-bottom: 5rem;">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 text-center">
                <h2 class="fw-bold mb-4 text-center">Other <em style="color:#20B3A8;">Youth</em> Centers in Your Area</h2>
                <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mb-4 rsyc-nearby-pills">
                    ${parentCorpsName ? `<span class="rsyc-parent-pill badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill"><i class="bi bi-building text-danger me-2"></i>Parent Center: ${this.escapeHTML(parentCorpsName)}</span>` : ''}
                    ${areaCommandName ? `<span class="rsyc-area-pill badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill"><i class="bi bi-diagram-3 text-info me-2"></i>Area: ${this.escapeHTML(areaCommandName)}</span>` : ''}
                    ${divisionName ? `<span class="rsyc-division-pill badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill"><i class="bi bi-diagram-2 text-primary me-2"></i>Division: ${this.escapeHTML(divisionName)}</span>` : ''}
                </div>
            </div>
            
            <!-- Area Command Centers (Always Visible) -->
            <div class="col-12">
                <div id="rsyc-nearby-area-list" class="rsyc-nearby-grid-container">
                    <div class="rsyc-nearby-grid" data-section="area" data-total-cards="${areaCommandCenters.length}">
                        ${areaCardHTML}
                    </div>
                    <div class="rsyc-pagination-controls text-center mt-4 rsyc-pagination-area" style="display:${areaCommandCenters.length > 6 ? 'flex' : 'none'}; justify-content:center;">
                        <button class="btn btn-outline-primary btn-sm rsyc-prev-btn" onclick="rsycPagination('area', 'prev')">
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                        <span class="rsyc-page-info mx-3">
                            Page <span class="rsyc-current-page">1</span> of <span class="rsyc-total-pages">1</span>
                        </span>
                        <button class="btn btn-outline-primary btn-sm rsyc-next-btn" onclick="rsycPagination('area', 'next')">
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- HR separator if division section exists -->
            ${divisionCenters.length > 0 ? '<div class="col-12"><hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;"></div>' : ''}

            <!-- Other Division Centers and Toggle Button (Hidden initially) -->
            ${divisionCenters.length > 0 ? `
            <div class="col-12" style="display:none;" id="rsyc-nearby-division-wrapper">
                <div id="rsyc-nearby-division-list" class="rsyc-nearby-grid-container">
                    <div class="rsyc-nearby-grid" data-section="division" data-total-cards="${divisionCenters.length}">
                        ${divisionCardHTML}
                    </div>
                    <div class="rsyc-pagination-controls text-center mt-4 rsyc-pagination-division" style="display:${divisionCenters.length > 6 ? 'flex' : 'none'}; justify-content:center;">
                        <button class="btn btn-outline-primary btn-sm rsyc-prev-btn" onclick="rsycPagination('division', 'prev')">
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                        <span class="rsyc-page-info mx-3">
                            Page <span class="rsyc-current-page">1</span> of <span class="rsyc-total-pages">1</span>
                        </span>
                        <button class="btn btn-outline-primary btn-sm rsyc-next-btn" onclick="rsycPagination('division', 'next')">
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="text-center mt-4" id="rsyc-nearby-toggle-btn-container">
                    <button id="rsyc-nearby-toggle-btn" class="btn btn-outline-primary rounded-pill px-4" onclick="
                        const wrapper = document.getElementById('rsyc-nearby-division-wrapper');
                        const btn = document.getElementById('rsyc-nearby-toggle-btn');
                        const mainBtnContainer = document.getElementById('rsyc-nearby-toggle-btn-container-main');
                        if (wrapper.style.display === 'none') {
                            wrapper.style.display = 'block';
                            btn.innerHTML = 'View Less <i class=\"bi bi-chevron-up ms-1\"></i>';
                            if (mainBtnContainer) mainBtnContainer.style.display = 'none';
                        } else {
                            wrapper.style.display = 'none';
                            btn.innerHTML = 'View All in Division <i class=\"bi bi-chevron-down ms-1\"></i>';
                            if (mainBtnContainer) mainBtnContainer.style.display = 'flex';
                        }
                    ">
                        View All in Division <i class="bi bi-chevron-down ms-1"></i>
                    </button>
                </div>
            </div>
            
            <!-- Toggle Button (visible when division wrapper is hidden) -->
            <div class="col-12" id="rsyc-nearby-toggle-btn-container-main" style="display:flex; justify-content:center;">
                <div class="text-center mt-4">
                    <button id="rsyc-nearby-toggle-btn-main" class="btn btn-outline-primary rounded-pill px-4" onclick="
                        const wrapper = document.getElementById('rsyc-nearby-division-wrapper');
                        const btnMain = document.getElementById('rsyc-nearby-toggle-btn-main');
                        const toggleBtn = document.getElementById('rsyc-nearby-toggle-btn');
                        wrapper.style.display = 'block';
                        btnMain.parentElement.parentElement.style.display = 'none';
                        toggleBtn.innerHTML = 'View Less <i class=\"bi bi-chevron-up ms-1\"></i>';
                    ">
                        View All in Division <i class="bi bi-chevron-down ms-1"></i>
                    </button>
                </div>
            </div>
            ` : ''}
        </div>
    </div>
</div>`;
    }

    /**
     * Helper: Generate a single nearby center card
     */
    generateNearbyCard(center) {
        let displayName = (center.name || 'Salvation Army Center');
        displayName = displayName
            .replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '')
            .replace(/^rsyc\s+/i, '');

        const centerName = this.escapeHTML(displayName);
        const city = this.escapeHTML(center.city || '');
        const state = this.escapeHTML(center.state || '');

        let slugName = (center.name || '');
        slugName = slugName
            .replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '')
            .replace(/^rsyc\s+/i, '');
        const centerSlug = slugName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/[^\w\-]/g, '');
        const centerUrl = `/redshieldyouth/${centerSlug}`;

        let imageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';
        if (center.photos && center.photos.length > 0) {
            const exteriorPhoto = center.photos.find(p => p.urlExteriorPhoto);
            if (exteriorPhoto) {
                imageUrl = exteriorPhoto.urlExteriorPhoto;
            } else {
                const photo = center.photos[0];
                imageUrl = photo.urlFacilityFeaturesPhoto || photo.urlNearbyCentersPhoto || photo.urlProgramsPhoto || imageUrl;
            }
        }

        return `<div class="rsyc-nearby-card">
            <a href="${centerUrl}" style="text-decoration:none; color:inherit;">
                <div class="card h-100 shadow-sm border-0" style="border-radius:12px; overflow:hidden;">
                    <div style="height:140px; overflow:hidden; position:relative;">
                        <img src="${imageUrl}" alt="${centerName}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
                        <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.6), transparent); display:flex; align-items:flex-end; padding:0.75rem;">
                            <h5 style="color:white; margin:0; font-size:1rem; font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.3);">${centerName}</h5>
                        </div>
                    </div>
                    <div class="card-body p-3 bg-white text-start">
                        <div style="font-size:0.9rem; color:#555;">${city}${state ? ', ' + state : ''}</div>
                        <div style="margin-top:0.5rem; font-weight:600; color:#00929C; font-size:0.85rem;">View Center <i class="bi bi-arrow-right"></i></div>
                    </div>
                </div>
            </a>
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
<div id="parents" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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

        // Join Center modal content
        const joinCenterModal = `
<!-- Join Center Modal -->
<div id="rsyc-modal-joinCenter" class="rsyc-modal" style="display: none !important;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>🌟 Join a Center</h3>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline-primary" id="joinCenterJoinBtn" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-box-arrow-up-right me-2"></i>Join
                </button>
                <button class="btn btn-outline-primary" onclick="printJoinCenterModal()" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-printer me-2"></i>Print / Save as PDF
                </button>
                <button class="rsyc-modal-close" onclick="closeRSYCModal('joinCenter')">&times;</button>
            </div>
        </div>

        <div class="rsyc-modal-body">
            <div style="display: none;"><strong>${center.name || center.Title}</strong></div>
            <div style="text-align: center; margin-bottom: 2rem;">
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">Where fun, friends, and adventures begin.</p>
            </div>

            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid #00929C;">
                <p style="margin: 0; font-size: 0.75rem;">Imagine a place where you can hang out, try new things, build skills, and feel like you truly belong. A Red Shield Youth Center isn't just somewhere to go after school—it's a place where you get to grow, lead, and discover what you're capable of.</p>
            </div>

            <p style="font-weight: 500; color: #00929C; margin-bottom: 1rem; font-size: 0.85rem;">At a Red Shield Youth Center, every day brings something new:</p>

            <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🎨</span>
                    <p style="margin: 0; flex: 1;">Create art, music, drama, or dance</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🏀</span>
                    <p style="margin: 0; flex: 1;">Play sports, hit the gym, swim, or try something new like archery or karate</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">📚</span>
                    <p style="margin: 0; flex: 1;">Get homework help, tutoring, and academic support when you need it</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">💻</span>
                    <p style="margin: 0; flex: 1;">Explore technology, coding, robotics, and STEM projects</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🌱</span>
                    <p style="margin: 0; flex: 1;">Join leadership groups, clubs, and service opportunities</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🎉</span>
                    <p style="margin: 0; flex: 1;">Go on field trips, special events, and unforgettable adventures</p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #f0f8f9 0%, #e6f3f4 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                <p style="margin: 0; font-size: 0.75rem;">The Salvation Army ${center.name || center.Title || 'your Red Shield Youth Center'} is a safe, welcoming space where caring mentors know your name, cheer you on, and help you grow—not just academically, but socially, emotionally, physically, and spiritually.</p>
            </div>

            <p style="margin: 0; font-size: 0.75rem;">You'll build real friendships, learn how to lead, stay healthy, explore your faith, and gain confidence for what's next—all in a place where you're supported and encouraged to be yourself.</p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
                <p style="margin: 0 0 1rem 0; font-weight: 400; color: #856404;">💬 Talk with your parents about joining a Red Shield Youth Center near you and invite them to explore this page with you:</p>
                <p style="margin: 0; font-size: 0.75rem; font-weight: 600; color: #00929C;">👉 www.redshieldyouth.org</p>
            </div>

            <div style="text-align: center; margin-top: 0.5rem; padding-top: 1.5rem; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 0.70rem; font-weight: 600; color: #00929C; font-style: italic;">Come for the fun. Stay for the friendships. Grow into who you're meant to be.</p>
            </div>
        </div>
    </div>
</div>
`;

        // Join Activity modal content
        const joinActivityModal = `
<!-- Join Activity Modal -->
<div id="rsyc-modal-joinActivity" class="rsyc-modal" style="display: none !important;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>🚀 Join an Activity</h3>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline-primary" id="joinActivitySearchBtn" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-search me-2"></i>Search Activities
                </button>
                <button class="btn btn-outline-primary" onclick="printJoinActivityModal()" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-printer me-2"></i>Print / Save as PDF
                </button>
                <button class="rsyc-modal-close" onclick="closeRSYCModal('joinActivity')">&times;</button>
            </div>
        </div>

        <div class="rsyc-modal-body">
            <div style="display: none;"><strong>${center.name || center.Title}</strong></div>
            <div style="text-align: center; margin-bottom: 2rem;">
                <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem; font-style: italic;">Find what you love. Try something new. Lead with confidence.</p>
            </div>

            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #00929C;">
                <p style="margin: 0; font-size: 0.86rem;">Whether you love sports, music, art, technology, or helping others—there's an activity at the Red Shield Youth Center made just for you. And if you're still figuring out what you like? That's okay too—this is the place to explore.</p>
            </div>

            <p style="font-weight: 600; color: #00929C; margin-bottom: 1rem; font-size: 1.1rem;">You can jump into:</p>

            <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">📚</span>
                    <p style="margin: 0; flex: 1;">Academic support like tutoring, study clubs, test prep, and college & career readiness</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🎨</span>
                    <p style="margin: 0; flex: 1;">Music & arts including band, choir, dance, drama, visual arts, and performances</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">💻</span>
                    <p style="margin: 0; flex: 1;">STEM & tech with robotics, coding, makerspaces, science labs, and engineering challenges</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🏀</span>
                    <p style="margin: 0; flex: 1;">Sports & wellness like basketball, soccer, open gym, swimming, fitness clubs, and nutrition education</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🌱</span>
                    <p style="margin: 0; flex: 1;">Leadership & character programs that build confidence, teamwork, and purpose</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🤝</span>
                    <p style="margin: 0; flex: 1;">Service projects & volunteer opportunities that make a real difference</p>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <span style="font-size: 1.2rem;">🙏</span>
                    <p style="margin: 0; flex: 1;">Faith-based programs like Bible studies, youth nights, worship, and retreats</p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #f0f8f9 0%, #e6f3f4 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                <p style="margin: 0; font-size: 0.86rem;">Every activity at The Salvation Army ${center.name || center.Title || 'your Red Shield Youth Center'} is designed to help you grow stronger—inside and out. You'll learn how to work with others, handle challenges, make healthy choices, and lead with character and faith.</p>
            </div>

            <p style="margin: 0; font-size: 0.86rem;">This is where confidence grows, friendships form, and everyday moments turn into memories.</p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1.5rem; border-radius: 12px; margin-top: 2rem;">
                <p style="margin: 0 0 1rem 0; font-weight: 600; color: #856404;">👨‍👩‍👧 Share with your parents what excites you and ask them to check out these opportunities with you at:</p>
                <p style="margin: 0; font-size: 0.86rem; font-weight: 600; color: #00929C;">👉 www.redshieldyouth.org</p>
            </div>

            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 0.75rem; font-weight: 600; color: #00929C; font-style: italic;">Your next adventure is waiting—go for it.</p>
            </div>
        </div>
    </div>
</div>
`;

        const html = `
<div id="youth" data-index="7" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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
                                <button class="btn btn-outline-primary btn-lg" onclick="showRSYCModal('joinCenter', '${this.escapeHTML(center.name, true)}')" data-registration-url="${registrationURL}"><i class="bi bi-controller me-2"></i> Join the Center </button>
                                <button class="btn btn-outline-primary btn-lg" onclick="showRSYCModal('joinActivity', '${this.escapeHTML(center.name, true)}')" data-search-url="${searchURL}"><i class="bi bi-trophy me-2"></i> Join an Activity </button>
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
${joinCenterModal}
${joinActivityModal}
        `;

        return html;
    }

    /**
     * Nearby Centers Section
     */
    generateNearby(data) {
        const { center, photos, allCenters } = data;
        
        // Use postal code from center data
        const postalCode = center.zip || '27107';
        const locationFinderUrl = `https://www.salvationarmyusa.org/location-finder/?address=${postalCode}&services=`;
        
        // Get nearby centers photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const nearbyPhoto = photoData?.urlNearbyCentersPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/71fe3cd2-5a53-4557-91ea-bb40ab76e2f5_nearby-corps-1.jpg';

        // --- Logic for Dynamic Nearby Centers (v2026-02-16) ---
        const parentCorpsName = center.corpName || center.field_8 || '';
        const areaCommandName = center.areaCommand || center.field_17 || '';
        const divisionName = center.division || '';

        // Helper to normalize strings
        const norm = v => String(v || '').toLowerCase().trim();

        // 1. Find matched centers (Union of Area Command and Division)
        // Note: Parent Corps usually falls within Area/Division so it's naturally included, 
        // but we'll specific check just in case it's named differently.
        let matchedCenters = [];
        const seenIds = new Set();
        
        // Add current center to seen to exclude it
        const currentId = center.id ? String(center.id) : null;
        const currentSpId = center.sharePointId ? String(center.sharePointId) : null;
        if (currentId) seenIds.add(currentId);
        
        // Helper to process a list of matches
        const addMatches = (matches) => {
            matches.forEach(c => {
                if (!c) return;
                const cId = c.id ? String(c.id) : (c.sharePointId ? String(c.sharePointId) : null);
                
                // Exclude self by ID and SharePoint ID check
                if (cId === currentId) return;
                if (currentSpId && c.sharePointId && String(c.sharePointId) === currentSpId) return;

                // Add if not already seen
                if (cId && !seenIds.has(cId)) {
                    seenIds.add(cId);
                    matchedCenters.push(c);
                } else if (!cId) {
                     // If no ID, rely on name check to avoid duplicates? (Risky, but rare)
                     // For now just add if no ID, but RSYC usually has IDs.
                     matchedCenters.push(c); 
                }
            });
        };

        if (allCenters && Array.isArray(allCenters) && allCenters.length > 0) {
            // A. Area Command Matches
            if (areaCommandName) {
                const areaNorm = norm(areaCommandName);
                const areaMatches = allCenters.filter(c => {
                    const candidates = [c.areaCommand, c.field_17, c.field_10, c.corpName, c.field_8, c.name, c.Title];
                    return candidates.some(s => areaNorm && String(s || '').toLowerCase().trim().includes(areaNorm));
                });
                addMatches(areaMatches);
            }

            // B. Division Matches
            if (divisionName) {
                const divNorm = norm(divisionName);
                const divMatches = allCenters.filter(c => {
                    return norm(c.division || '').includes(divNorm);
                });
                addMatches(divMatches);
            }
        }

        // Sort alphabetically
        matchedCenters.sort((a, b) => (String(a.name || '').toLowerCase()).localeCompare(String(b.name || '').toLowerCase()));

        // --- Logic for "Area Command vs Division" Toggle ---
        let areaCardsHtml = '';
        let divisionOnlyCardsHtml = '';
        let areaCenters = [];
        let otherDivisionCenters = [];
        let sectionTitle = `Other <em style="color:#20B3A8;">Youth</em> Centers in Your Area`;

        if (matchedCenters.length > 0) {
            if (areaCommandName) {
                const areaNorm = norm(areaCommandName);
                matchedCenters.forEach(c => {
                    const candidates = [c.areaCommand, c.field_17, c.field_10, c.corpName, c.field_8];
                    const isArea = candidates.some(s => areaNorm && String(s || '').toLowerCase().trim().includes(areaNorm));
                    if (isArea) {
                        areaCenters.push(c);
                    } else {
                        otherDivisionCenters.push(c);
                    }
                });
            } else {
                // If no area command defined, everything is just division
                otherDivisionCenters = matchedCenters;
            }

            // If we found Area centers, render them. If not, render everything as division (fallback behavior)
            if (areaCenters.length > 0) {
                areaCardsHtml = areaCenters.map(c => this._renderCenterCard(c, '')).join('');
                
                if (otherDivisionCenters.length > 0) {
                     divisionOnlyCardsHtml = otherDivisionCenters.map(c => this._renderCenterCard(c, '')).join(''); // Hidden initially
                }
            } else {
                // No specific area matches, show all matched (division) immediately
                 areaCardsHtml = matchedCenters.map(c => this._renderCenterCard(c, '')).join('');
                 areaCenters = matchedCenters; // Set areaCenters for pagination
            }
        } 
        else {
            // Fallback content if no centers found at all
             areaCardsHtml = `<!-- No nearby centers found -->`;
             areaCenters = []; // Ensure areaCenters is defined
             otherDivisionCenters = []; // Ensure otherDivisionCenters is defined
        }

        // 3. Generate Pills HTML (Order: Parent > Area > Division)
        let pillsHtml = '';
        if (parentCorpsName || areaCommandName || divisionName) {
            pillsHtml = `<div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mb-4 rsyc-nearby-pills">
                ${parentCorpsName ? `<span class="rsyc-parent-pill badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill"><i class="bi bi-building text-danger me-2"></i>Parent Center: ${this.escapeHTML(parentCorpsName)}</span>` : ''}
                ${areaCommandName ? `<span class="rsyc-area-pill badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill"><i class="bi bi-diagram-3 text-info me-2"></i>Area: ${this.escapeHTML(areaCommandName)}</span>` : ''}
                ${divisionName ? `<span class="rsyc-division-pill badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill"><i class="bi bi-diagram-2 text-primary me-2"></i>Division: ${this.escapeHTML(divisionName)}</span>` : ''}
            </div>`;
        }

        return `<!-- Nearby Salvation Army Centers -->
<div id="nearby" class="freeTextArea u-centerBgImage section u-sa-greyVeryLightBg u-coverBgImage" data-rsyc-nearby-version="v2026-02-16-toggle-v2" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
    <div class="u-positionRelative" style="padding-top: 5rem; padding-bottom: 5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <div class="container" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
            <div class="container" style="padding-top: 4.5rem; padding-bottom: 4.5rem; display: block !important; visibility: visible !important; opacity: 1 !important;">
                
                <!-- ORIGINAL SECTION CONTENT (Restored) -->
                <div class="row align-items-stretch flex-column-reverse flex-lg-row mb-5 pb-5 border-bottom">
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

                <!-- NEW DYNAMIC CONTENT (Centered, Toggleable) -->
                ${matchedCenters.length > 0 ? `
                <div class="row justify-content-center">
                    <div class="col-12 text-center">
                        <h2 class="fw-bold mb-4 text-center">${sectionTitle}</h2>
                        ${pillsHtml}
                    </div>
                    
                    <!-- Area Command Centers (Always Visible) -->
                    <div class="col-12">
                        <div id="rsyc-nearby-area-list" class="rsyc-nearby-grid-container">
                            <div class="rsyc-nearby-grid rsyc-nearby-grid-${areaCenters.length}" data-section="area" data-total-cards="${areaCenters.length}">
                                ${areaCardsHtml}
                            </div>
                            <div class="rsyc-pagination-controls text-center mt-4 rsyc-pagination-area" style="display:none;">
                                <button class="btn btn-outline-primary btn-sm rsyc-prev-btn" onclick="rsycPagination('area', 'prev')">
                                    <i class="bi bi-chevron-left"></i> Previous
                                </button>
                                <span class="rsyc-page-info mx-3">
                                    Page <span class="rsyc-current-page">1</span> of <span class="rsyc-total-pages">1</span>
                                </span>
                                <button class="btn btn-outline-primary btn-sm rsyc-next-btn" onclick="rsycPagination('area', 'next')">
                                    Next <i class="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- HR separator if division section exists -->
                    ${divisionOnlyCardsHtml ? `<div class="col-12"><hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;"></div>` : ''}

                    <!-- Other Division Centers and Toggle Button (Hidden initially) -->
                    ${divisionOnlyCardsHtml ? `
                    <div class="col-12" style="display:none;" id="rsyc-nearby-division-wrapper">
                        <div id="rsyc-nearby-division-list" class="rsyc-nearby-grid-container">
                            <div class="rsyc-nearby-grid rsyc-nearby-grid-${otherDivisionCenters.length}" data-section="division" data-total-cards="${otherDivisionCenters.length}">
                                ${divisionOnlyCardsHtml}
                            </div>
                            <div class="rsyc-pagination-controls text-center mt-4 rsyc-pagination-division" style="display:none;">
                                <button class="btn btn-outline-primary btn-sm rsyc-prev-btn" onclick="rsycPagination('division', 'prev')">
                                    <i class="bi bi-chevron-left"></i> Previous
                                </button>
                                <span class="rsyc-page-info mx-3">
                                    Page <span class="rsyc-current-page">1</span> of <span class="rsyc-total-pages">1</span>
                                </span>
                                <button class="btn btn-outline-primary btn-sm rsyc-next-btn" onclick="rsycPagination('division', 'next')">
                                    Next <i class="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="text-center mt-4" id="rsyc-nearby-toggle-btn-container">
                            <button id="rsyc-nearby-toggle-btn" class="btn btn-outline-primary rounded-pill px-4" onclick="
                                const wrapper = document.getElementById('rsyc-nearby-division-wrapper');
                                const btn = document.getElementById('rsyc-nearby-toggle-btn');
                                const mainBtnContainer = document.getElementById('rsyc-nearby-toggle-btn-container-main');
                                if (wrapper.style.display === 'none') {
                                    wrapper.style.display = 'block';
                                    btn.innerHTML = 'View Less <i class=\\'bi bi-chevron-up ms-1\\'></i>';
                                    if (mainBtnContainer) mainBtnContainer.style.display = 'none';
                                } else {
                                    wrapper.style.display = 'none';
                                    btn.innerHTML = 'View All in Division <i class=\\'bi bi-chevron-down ms-1\\'></i>';
                                    if (mainBtnContainer) mainBtnContainer.style.display = 'flex';
                                }
                            ">
                                View All in Division <i class="bi bi-chevron-down ms-1"></i>
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Toggle Button (visible when division wrapper is hidden) -->
                    ${divisionOnlyCardsHtml ? `
                    <div class="col-12" id="rsyc-nearby-toggle-btn-container-main" style="display:flex; justify-content:center;">
                        <div class="text-center mt-4">
                            <button id="rsyc-nearby-toggle-btn-main" class="btn btn-outline-primary rounded-pill px-4" onclick="
                                const wrapper = document.getElementById('rsyc-nearby-division-wrapper');
                                const btnMain = document.getElementById('rsyc-nearby-toggle-btn-main');
                                const toggleBtn = document.getElementById('rsyc-nearby-toggle-btn');
                                wrapper.style.display = 'block';
                                btnMain.parentElement.parentElement.style.display = 'none';
                                toggleBtn.innerHTML = 'View Less <i class=\\'bi bi-chevron-up ms-1\\'></i>';
                            ">
                                View All in Division <i class="bi bi-chevron-down ms-1"></i>
                            </button>
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

            </div>
        </div>
    </div>
</div>` + paginationStyles;
    }

    /**
     * Helper to render a consistent center card
     */
    _renderCenterCard(c, columnClass = 'col-md-4 mb-3', cardStyle = '') {
        const displayName = String((c.name || 'Salvation Army Center')).replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '').replace(/^rsyc\s+/i, '');
        const centerNameEsc = this.escapeHTML(displayName);
        const city = c.city || '';
        const state = c.state || '';
        let slugName = String((c.name || '')).replace(/^red\s+shield\s+youth\s+centers?\s+of\s+/i, '').replace(/^rsyc\s+/i, '');
        const centerSlug = slugName.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/[^\w\-]/g, '');
        const centerUrl = `/redshieldyouth/${centerSlug}`;
        
        let imageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';
        if (c.photos && c.photos.length > 0) {
            const exteriorPhoto = c.photos.find(p => p.urlExteriorPhoto);
            if (exteriorPhoto) imageUrl = exteriorPhoto.urlExteriorPhoto;
            else {
                const photo = c.photos[0];
                imageUrl = photo.urlFacilityFeaturesPhoto || photo.urlProgramsPhoto || imageUrl;
            }
        }

        const maxWidthStyle = columnClass ? 'max-width: 350px;' : '';
        
        return `
        <div class="${columnClass} ${cardStyle} rsyc-nearby-card" style="${maxWidthStyle}">
            <a href="${centerUrl}" style="text-decoration:none; color:inherit;">
                <div class="card h-100 shadow-sm border-0" style="border-radius:12px; overflow:hidden;">
                    <div style="height:140px; overflow:hidden; position:relative;">
                        <img src="${imageUrl}" alt="${centerNameEsc}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
                        <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.6), transparent); display:flex; align-items:flex-end; padding:0.75rem;">
                            <h5 style="color:white; margin:0; font-size:1rem; font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.3);">${centerNameEsc}</h5>
                        </div>
                    </div>
                    <div class="card-body p-3 bg-white text-start">
                        <div style="font-size:0.9rem; color:#555;">${this.escapeHTML(city)}${state ? ', ' + this.escapeHTML(state) : ''}</div>
                        <div style="margin-top:0.5rem; font-weight:600; color:#00929C; font-size:0.85rem;">View Center <i class="bi bi-arrow-right"></i></div>
                    </div>
                </div>
            </a>
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
        const volunteerModal = `
<!-- Modal for Volunteer/Mentor Info -->
<div id="rsyc-modal-volunteer" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>Volunteer / Mentor Youth</h3>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline-primary" onclick="printVolunteerModal('${this.escapeHTML(center.name, true)}')" style="border-color:#d3d3d3; color:#d3d3d3;">
                    <i class="bi bi-printer me-2"></i>Print / Save as PDF
                </button>
                <button class="rsyc-modal-close" onclick="closeRSYCModal('volunteer')">&times;</button>
            </div>
        </div>

        <div class="rsyc-modal-body">
            ${volunteerText ? `<div style="font-size: 0.9rem; line-height: 1.2; margin-bottom: 2rem;" data-volunteer-text>${this.makeContactsClickable(volunteerText)}</div>` : ''}

            ${!volunteerText || (!volunteerText.includes('Want to Make a Difference') && !volunteerText.includes('How to Sign Up')) ? `
            <div style="margin-bottom: 2rem; font-size: 0.86rem; line-height: 1.6;">
                <h3><strong>Want to Make a Difference? Join Our Red Shield Volunteer &amp; Mentor Team!</strong></h3>
                <p>Becoming a volunteer or mentor at The Salvation Army ${this.escapeHTML(center.name)} is easy — and incredibly rewarding! Whether you love helping with homework, sports, crafts, or simply being a positive role model, there’s a place for you.</p>

                <h4>⭐ <strong>How to Sign Up</strong></h4>
                <ol>
                    <li><strong>Email Our Volunteer Coordinator or click the link above.</strong><br>Share a bit about yourself, your interests, and how you’d like to help.</li>
                    <li><strong>Complete a Background Check</strong><br>Safety is our priority. All volunteers complete a simple check.</li>
                    <li><strong>Meet with Our Director</strong><br>Discuss your interests and find the best fit.</li>
                    <li><strong>Attend a Quick Training Session</strong><br>Learn the basics, meet staff, and get an overview of programs and expectations.</li>
                    <li><strong>Jump In and Make an Impact!</strong><br>Help youth succeed academically, socially, and emotionally. Your time truly matters.</li>
                </ol>
                <br>
                <hr />

                <h3>💡 <strong>Who Can Volunteer?</strong></h3>
                <ul>
                    <li>Adults 18+</li>
                    <li>High school or college students seeking service hours</li>
                    <li>Community members who love working with youth</li>
                    <li>Retirees eager to share experience</li>
                    <li>Anyone with a heart to help!</li>
                </ul>
                <br><br>
                <hr />

                <h4>❤️ <strong>Why Volunteer With Us?</strong></h4>
                <ul>
                    <li>Build meaningful connections</li>
                    <li>Inspire confidence in youth</li>
                    <li>Gain valuable experience for resumes</li>
                    <li>Help kids feel seen, supported, and valued</li>
                </ul>
                <br>
            </div>
            ` : ''}

            ${(!volunteerText || !volunteerText.includes('Homework Helper')) ? `
                           <hr />
                <div style="margin-bottom: 2rem; font-size: 0.86rem; line-height: 1.6;">
                <h4>🎯 <strong>Volunteer Opportunities</strong></h4>
                <ul>
                    <li><strong>Homework Helper</strong> — assist youth with homework</li>
                    <li><strong>Tutor</strong> — help youth practice reading or math skills</li>
                    <li><strong>Mentor / Leader</strong> — supervise and bond with youth</li>
                    <li><strong>Front Office Assistant</strong> — greet youth and families, manage sign-ins</li>
                    <li><strong>Cleaning / Organizing</strong> — maintain and organize Youth Center spaces</li>
                </ul>
            </div>
            ` : ''}

            <div class="text-center" style="padding-top: 1.5rem; border-top: 1px solid #dee2e6;">
                <p style="font-size: 1rem; margin-bottom: 1rem;">Learn more about volunteering at Red Shield Youth Centers</p>
                <a class="btn btn-outline-primary" href="/redshieldyouth/volunteer" target="_blank">
                    <i class="bi bi-hand-thumbs-up me-2"></i> Volunteer Information
                </a>
            </div>
        </div>
    </div>
</div>
`;

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
<div id="volunteer" data-index="8" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage" style="display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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
                                <button class="btn btn-outline-primary btn-lg" onclick="showRSYCModal('volunteer', '${this.escapeHTML(center.name, true)}')"><i class="bi bi-hand-thumbs-up me-2"></i> Volunteer / Mentor Youth </button>
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
     * Midsection Photo Section
     */
    generateMidsectionPhoto(data) {
        // Use hardcoded image as requested
        const imageUrl = 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/d731081c-1e2c-4ffb-9a22-595ce1e1effc_Youth+arriving+from+school+to+Red+Shield+Youth+Center+-CNC-04489.jpg';
        const bgPosition = 'center';

        return `<!-- Midsection Photo Section -->
<section id="midsectionPhoto" class="freeTextArea u-centerBgImage section u-coverBgImage" style="min-height: 400px; background-image: url('${imageUrl}'); background-size: cover; background-position: ${bgPosition} !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
    <div class="u-positionRelative" style="min-height: 400px; display: block !important; visibility: visible !important; opacity: 1 !important;">
        <!-- Empty content - just showing the photo -->
    </div>
</section>`;
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
<section id="footerPhoto" class="freeTextArea u-centerBgImage section u-coverBgImage" style="min-height: 400px; background-image: url('${this.escapeHTML(footerPhoto)}'); background-size: cover; background-position: ${bgPosition} !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
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

<div id="contact" data-index="10" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage" style="background-color: #00929C !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;">
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
    
    // Helper function for friendly date formatting without timezone conversion
    const formatFriendlyDate = (dateStr, includeYear = true) => {
        if (!dateStr) return '';
        
        try {
            // Parse the date string (YYYY-MM-DD format)
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr; // Return original if invalid
            
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            
            if (includeYear) {
                return `${month} ${day}, ${year}`;
            } else {
                return `${month} ${day}`;
            }
        } catch (e) {
            return dateStr; // Return original if error
        }
    };
    
    const formatFriendlyDateRange = (startDateStr, endDateStr) => {
        if (!startDateStr) return '';
        
        try {
            const startDate = new Date(startDateStr);
            const endDate = endDateStr ? new Date(endDateStr) : null;
            
            if (isNaN(startDate.getTime())) return startDateStr; // Return original if invalid
            
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            
            const startMonth = months[startDate.getMonth()];
            const startDay = startDate.getDate();
            const startYear = startDate.getFullYear();
            
            if (!endDate || isNaN(endDate.getTime())) {
                // Single date - keep original year format
                return `${startMonth} ${startDay}, ${startYear}`;
            }
            
            const endMonth = months[endDate.getMonth()];
            const endDay = endDate.getDate();
            const endYear = endDate.getFullYear();
            
            // Check if same month and year
            if (startMonth === endMonth && startYear === endYear) {
                return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
            }
            
            // Check if same year
            if (startYear === endYear) {
                return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
            }
            
            // Different years
            return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
        } catch (e) {
            return startDateStr; // Return original if error
        }
    };
    
    // Helper function to simplify consecutive day ranges
    const simplifyDayRange = (daysText) => {
        if (!daysText) return '';
        
        const days = daysText.split(',').map(day => day.trim());
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Find consecutive sequences
        const sequences = [];
        let currentSequence = [];
        
        for (let i = 0; i < days.length; i++) {
            const dayIndex = dayOrder.indexOf(days[i]);
            if (dayIndex === -1) {
                // Day not found in standard order, add as standalone
                if (currentSequence.length > 0) {
                    sequences.push([...currentSequence]);
                    currentSequence = [];
                }
                sequences.push([days[i]]);
            } else {
                if (currentSequence.length === 0) {
                    currentSequence.push(days[i]);
                } else {
                    const lastIndex = dayOrder.indexOf(currentSequence[currentSequence.length - 1]);
                    if (dayIndex === lastIndex + 1) {
                        // Consecutive day
                        currentSequence.push(days[i]);
                    } else {
                        // Not consecutive, start new sequence
                        sequences.push([...currentSequence]);
                        currentSequence = [days[i]];
                    }
                }
            }
        }
        
        // Add last sequence if exists
        if (currentSequence.length > 0) {
            sequences.push(currentSequence);
        }
        
        // Format sequences
        const formattedSequences = sequences.map(sequence => {
            if (sequence.length === 1) {
                return sequence[0];
            } else if (sequence.length === 2) {
                return `${sequence[0]} and ${sequence[1]}`;
            } else {
                return `${sequence[0]} - ${sequence[sequence.length - 1]}`;
            }
        });
        
        return formattedSequences.join(', ');
    };
    
    const printDate = new Date().toLocaleDateString('en-US');
    
    // Extract title and center name from modal
    const isInfoPageModal = typeof modalId === 'string' && modalId.startsWith('infopage-');
    
    let titleElement;
    if (isInfoPageModal) {
        titleElement = modal.querySelector('.rsyc-modal-header h2');
    } else {
        titleElement = modal.querySelector('.rsyc-modal-body h3');
    }
    
    const scheduleTitle = titleElement ? titleElement.textContent.trim() : 'Schedule';

    // Extract center name from modal - look for specific center name patterns
    let centerName = '';
    
    // Try to find center name in various ways
    // 1. Look for center name in the modal call (passed as parameter)
    const modalCall = modal.querySelector('[onclick*="showRSYCModal"]');
    if (modalCall) {
        const onclickAttr = modalCall.getAttribute('onclick');
        const centerMatch = onclickAttr.match(/showRSYCModal\([^,]+,\s*['"]([^'"]+)['"]\)/);
        if (centerMatch && centerMatch[1]) {
            centerName = centerMatch[1];
        }
    }
    
    // 2. If not found, try to extract from data attributes or other sources
    if (!centerName) {
        // Look for any element that might contain the center name
        const possibleCenterElements = modal.querySelectorAll('[data-center], .center-name, .rsyc-center');
        possibleCenterElements.forEach(el => {
            if (!centerName && el.textContent && el.textContent.trim()) {
                const text = el.textContent.trim();
                // Exclude field labels
                if (!text.includes(':') && !text.includes('Days') && !text.includes('Date') && !text.includes('Time')) {
                    centerName = text;
                }
            }
        });
    }
    
    // 3. Fallback - try to get from global data if available
    if (!centerName && window.rsycApp && window.rsycApp.currentCenter) {
        centerName = window.rsycApp.currentCenter.name || window.rsycApp.currentCenter.Title || '';
    }
    
    // Create print window title
    const printTitle = centerName ? `${scheduleTitle} - ${centerName} - ${printDate}` : `${scheduleTitle} - ${printDate}`;
    
    // Get modal content and clone it
    const modalContent = modal.querySelector('.rsyc-modal-content');
    const printContent = modalContent.cloneNode(true);

    // Detect if narrative (description) is long and reduce font size if so
    const descriptionEl = printContent.querySelector('.rsyc-description');
    if (descriptionEl && descriptionEl.textContent.trim().length > 600) {
        descriptionEl.style.fontSize = '6.5pt';
        descriptionEl.style.lineHeight = '1.2';
    } else if (descriptionEl) {
        // Lower font size for all descriptions, not just long ones
        descriptionEl.style.fontSize = '7pt';
        descriptionEl.style.lineHeight = '1.2';
    }

    // Update date fields to use friendly formatting
    const dateFields = printContent.querySelectorAll('.rsyc-modal-body [class*="col-"]');
    dateFields.forEach(field => {
        const strongEl = field.querySelector('strong');
        if (strongEl) {
            const label = strongEl.textContent.trim();
            const contentDiv = field.querySelector('div:last-child') || field;
            let contentText = contentDiv.textContent.replace(strongEl.textContent, '').trim();
            
            // Update Program Dates
            if (label === 'Program Dates:' && contentText) {
                // Check if it's a date range or single date
                const dateParts = contentText.split(' - ');
                if (dateParts.length === 2) {
                    // Date range
                    const friendlyDate = formatFriendlyDateRange(dateParts[0].trim(), dateParts[1].trim());
                    contentDiv.innerHTML = `<strong>${label}</strong><br>${friendlyDate}`;
                } else if (dateParts.length === 1) {
                    // Single date
                    const friendlyDate = formatFriendlyDate(dateParts[0].trim());
                    contentDiv.innerHTML = `<strong>${label}</strong><br>${friendlyDate}`;
                }
            }
            // Update Days - simplify consecutive day ranges
            else if (label === 'Days:' && contentText) {
                const simplifiedDays = simplifyDayRange(contentText);
                contentDiv.innerHTML = `<strong>${label}</strong><br>${simplifiedDays}`;
            }
            // Update Registration Deadline
            else if (label === 'Registration Deadline:' && contentText) {
                const friendlyDate = formatFriendlyDate(contentText);
                contentDiv.innerHTML = `<strong>${label}</strong><br>${friendlyDate}`;
            }
        }
    });

    // Also update date fields that might be in different formats
    const allTextNodes = printContent.querySelectorAll('.rsyc-modal-body *');
    allTextNodes.forEach(element => {
        const text = element.textContent;
        // Look for date patterns like YYYY-MM-DD or YYYY/MM/DD
        const datePattern = /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})(?:\s*[-–—]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}))?\b/g;
        
        if (datePattern.test(text) && !element.classList.contains('rsyc-description')) {
            const updatedText = text.replace(datePattern, (match, startDate, endDate) => {
                if (endDate) {
                    return formatFriendlyDateRange(startDate.replace(/\//g, '-'), endDate.replace(/\//g, '-'));
                } else {
                    return formatFriendlyDate(startDate.replace(/\//g, '-'));
                }
            });
            
            if (updatedText !== text) {
                // Preserve HTML structure if it exists
                if (element.innerHTML) {
                    element.innerHTML = updatedText;
                } else {
                    element.textContent = updatedText;
                }
            }
        }
    });

    // Ensure schedule information is always included for events
    // Check if this is an event modal and if schedule fields are missing
    const modalBody = printContent.querySelector('.rsyc-modal-body');
    if (modalBody) {
        // Check if schedule fields exist by searching text content
        const bodyText = modalBody.textContent || '';
        const hasScheduleFields = bodyText.includes('Days:') || bodyText.includes('Time:') || bodyText.includes('Program Runs In:');
        
        // If no schedule fields found, try to extract from event data and add them
        if (!hasScheduleFields) {
            // Look for event date/time information and convert to schedule format
            const allElements = modalBody.querySelectorAll('*');
            let eventDateEl = null;
            let eventTimeEl = null;
            
            allElements.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('Date:') && !eventDateEl) {
                    eventDateEl = el;
                }
                if (text.includes('Time:') && !eventTimeEl) {
                    eventTimeEl = el;
                }
            });
            
            if (eventDateEl || eventTimeEl) {
                // Create schedule fields from event information
                const scheduleInfo = document.createElement('div');
                scheduleInfo.className = 'row';
                scheduleInfo.style.cssText = 'margin-top: 12pt;';
                
                let scheduleHTML = '';
                
                // Extract date and convert to Days if possible
                if (eventDateEl) {
                    const dateText = eventDateEl.textContent.replace('Date:', '').trim();
                    // Try to determine day of week from date
                    try {
                        const dateMatch = dateText.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
                        if (dateMatch) {
                            const eventDate = new Date(dateMatch[0]);
                            const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
                            scheduleHTML += `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${dayOfWeek}</div>`;
                        }
                    } catch (e) {
                        // If can't parse date, use original text
                        scheduleHTML += `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${dateText}</div>`;
                    }
                }
                
                // Extract time
                if (eventTimeEl) {
                    const timeText = eventTimeEl.textContent.replace('Time:', '').trim();
                    scheduleHTML += `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${timeText}</div>`;
                }
                
                if (scheduleHTML) {
                    scheduleInfo.innerHTML = scheduleHTML;
                    // Insert before the first existing row or at the end
                    const existingRow = modalBody.querySelector('.row');
                    if (existingRow) {
                        existingRow.parentNode.insertBefore(scheduleInfo, existingRow);
                    } else {
                        modalBody.appendChild(scheduleInfo);
                    }
                }
            }
        }
    }

    // Add the same image from the modal to the print content
    const modalImage = modal.querySelector('.rsyc-modal-body img[alt]:not([alt="Red Shield Youth Centers Logo"])');
    if (modalImage && !printContent.querySelector('.rsyc-modal-body img[alt]:not([alt="Red Shield Youth Centers Logo"])')) {
        const imageClone = modalImage.cloneNode(true);
        // Insert the image at the beginning of the modal body, after any video but before other content
        const firstContentElement = printContent.querySelector('.rsyc-modal-body > *:not(.ratio):not([style*="display:flex"])');
        if (firstContentElement) {
            firstContentElement.parentNode.insertBefore(imageClone, firstContentElement);
        } else {
            const modalBody = printContent.querySelector('.rsyc-modal-body');
            if (modalBody) {
                modalBody.insertBefore(imageClone, modalBody.firstChild);
            }
        }
    }

    // Add main image at the very top of the content if it exists
    const mainImage = modal.querySelector('.rsyc-modal-body img[alt]:not([alt="Red Shield Youth Centers Logo"])');
    let mainImageHTML = '';
    if (mainImage) {
        const imageSrc = mainImage.src || mainImage.getAttribute('src');
        const imageAlt = mainImage.alt || '';
        mainImageHTML = `
        <div class="main-image-container" style="text-align: center; margin-bottom: 20pt; margin-top: 10pt;">
            <img src="${imageSrc}" alt="${imageAlt}" style="max-width: 100%; max-height: 200pt; object-fit: contain; border-radius: 8pt;" />
        </div>`;
    }

    // Clean up cloned content
    const existingLogoEl = printContent.querySelector('img[alt="Red Shield Youth Centers Logo"]');
    if (existingLogoEl) existingLogoEl.remove();

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
    
    const hideRedundantRule = `
        /* Hide redundant titles already in header, but keep description */
        .rsyc-modal-body > div:first-of-type:not(.rsyc-event-location):not(.rsyc-important-dates):not(.rsyc-transportation),
        .rsyc-modal-body > h3:first-of-type { display: none !important; }
        
        /* Ensure description is always visible with small font and proper layout */
        .rsyc-description { 
            display: block !important; 
            font-size: 7pt !important; 
            line-height: 1.2 !important;
            margin-bottom: 8pt !important;
            margin-top: 8pt !important;
            text-align: justify !important;
        }
        `;

    const eventImageRule = `
        /* SCHEDULE PRINT LAYOUT: keep image compact and allow details to flow beside it */
        .rsyc-modal-body > div:has(> img) {
            display: block !important;
            margin-bottom: 0 !important;
        }

        .rsyc-modal-body img:not([alt="Red Shield Youth Centers Logo"]) {
            float: right;
            width: 190pt !important;
            max-width: 40% !important;
            height: auto !important;
            max-height: 220pt !important;
            object-fit: contain !important;
            border-radius: 6pt !important;
            margin: 0 0 10pt 12pt !important;
            display: block !important;
        }

        /* Prevent the floated image from forcing awkward breaks */
        .rsyc-modal-body::after { content: ""; display: block; clear: both; }

        /* Ensure description flows around floated image */
        .rsyc-modal-body .rsyc-description {
            overflow: hidden; /* Creates block formatting context */
            zoom: 1; /* IE6/7 hasLayout */
        }

        /* Ensure subtitle also flows around floated image */
        .rsyc-modal-body p[style*="font-style:italic"] {
            overflow: hidden; /* Creates block formatting context */
            zoom: 1; /* IE6/7 hasLayout */
            margin-bottom: 8pt !important;
        }

        /* Ensure all text content flows around floated image */
        .rsyc-modal-body > p:not(.rsyc-description),
        .rsyc-modal-body > div > p {
            overflow: hidden; /* Creates block formatting context */
            zoom: 1; /* IE6/7 hasLayout */
        }

        /* Give key blocks breathing room */
        .rsyc-event-location { margin-top: 10pt !important; margin-bottom: 12pt !important; }
        .rsyc-event-cost { margin-bottom: 10pt !important; }
        .rsyc-event-extended-care { margin-bottom: 10pt !important; }
        `;

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

        /* SCHEDULE PRINT LAYOUT: keep image compact and allow details to flow beside it */
        .rsyc-modal-body > div:has(> img) {
            display: block !important;
            margin-bottom: 0 !important;
        }

        .rsyc-modal-body > div > img:not([alt="Red Shield Youth Centers Logo"]) {
            float: right;
            width: 180pt !important;
            max-width: 35% !important;
            height: auto !important;
            max-height: 200pt !important;
            object-fit: contain !important;
            border-radius: 6pt !important;
            margin: 0 0 10pt 12pt !important;
            display: block !important;
        }

        /* Prevent the floated image from forcing awkward breaks */
        .rsyc-modal-body::after { content: ""; display: block; clear: both; }

        /* Ensure description is always visible and flows around image */
        .rsyc-description { 
            display: block !important; 
            font-size: 7pt !important; 
            line-height: 1.2 !important;
            margin-bottom: 8pt !important;
            margin-top: 8pt !important;
            text-align: justify !important;
        }

        /* When image is present, make description flow around it */
        .rsyc-modal-body:has(img:not([alt="Red Shield Youth Centers Logo"])) .rsyc-description {
            margin-right: 0 !important;
            text-align: justify !important;
        }

        /* When no image, center the description */
        .rsyc-modal-body:not(:has(img:not([alt="Red Shield Youth Centers Logo"]))) .rsyc-description {
            text-align: center !important;
            max-width: 100% !important;
            margin: 8pt auto !important;
        }

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
        .rsyc-contact-item { margin-bottom: 6pt !important; padding: 8pt !important; }
        .rsyc-contact-name { font-size: 9.5pt !important; font-weight: 700 !important; color: #000 !important; }
        .rsyc-contact-job { font-size: 8.5pt !important; color: #444 !important; font-weight: 500 !important; margin-bottom: 1pt !important; }
        .rsyc-contact-phone, .rsyc-contact-email { font-size: 8.5pt !important; color: #555 !important; line-height: 1.2 !important; }
        
        /* Point of Contact container with padding and margin */
        .rsyc-contacts { padding: 12pt !important; margin-bottom: 15pt !important; }

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

    ${mainImageHTML}

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
            // Try multiple field name variations for SharePoint data
            const startDateField = event.StartDateandTime || event.startDateTime || event._startTimestamp;
            const endDateField = event.EndDateandTime || event.endDateTime || event._endTimestamp;
            
            let startTs = null;
            let endTs = null;
            
            if (startDateField) {
                startTs = Number.isFinite(startDateField) ? startDateField : Date.parse(String(startDateField));
            }
            if (endDateField) {
                endTs = Number.isFinite(endDateField) ? endDateField : Date.parse(String(endDateField));
            }
            
            const hasStart = startTs && !isNaN(startTs);
            const hasEnd = endTs && !isNaN(endTs);
            const start = hasStart ? new Date(startTs) : null;
            const end = hasEnd ? new Date(endTs) : null;

            const dateFmtWithYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
            const dateFmtNoYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
            const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });

            if (start && end) {
                const sameDay = start.toDateString() === end.toDateString();
                if (sameDay) {
                    return {
                        dateText: dateFmtWithYear.format(start),
                        timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                    };
                }
                // Check if same year - consolidate year to end only
                const sameYear = start.getFullYear() === end.getFullYear();
                const dateText = sameYear
                    ? `${dateFmtNoYear.format(start)} - ${dateFmtNoYear.format(end)}, ${end.getFullYear()}`
                    : `${dateFmtWithYear.format(start)} - ${dateFmtWithYear.format(end)}`;
                return {
                    dateText: dateText,
                    timeText: `${timeFmt.format(start)} - ${timeFmt.format(end)}`
                };
            }
            if (start) {
                return { dateText: dateFmtWithYear.format(start), timeText: timeFmt.format(start) };
            }
            return { dateText: '', timeText: '' };
        } catch (e) {
            return { dateText: '', timeText: '' };
        }
    };

    // Helper function for friendly date formatting without timezone conversion
    const formatFriendlyDate = (dateStr, includeYear = true) => {
        if (!dateStr) return '';
        
        try {
            // Parse the date string (YYYY-MM-DD format)
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr; // Return original if invalid
            
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            
            if (includeYear) {
                return `${month} ${day}, ${year}`;
            } else {
                return `${month} ${day}`;
            }
        } catch (e) {
            return dateStr; // Return original if error
        }
    };
    
    const formatFriendlyDateRange = (startDateStr, endDateStr) => {
        if (!startDateStr) return '';
        
        try {
            const startDate = new Date(startDateStr);
            const endDate = endDateStr ? new Date(endDateStr) : null;
            
            if (isNaN(startDate.getTime())) return startDateStr; // Return original if invalid
            
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            
            const startMonth = months[startDate.getMonth()];
            const startDay = startDate.getDate();
            const startYear = startDate.getFullYear();
            
            if (!endDate || isNaN(endDate.getTime())) {
                // Single date
                return `${startMonth} ${startDay}, ${startYear}`;
            }
            
            const endMonth = months[endDate.getMonth()];
            const endDay = endDate.getDate();
            const endYear = endDate.getFullYear();
            
            // Check if same month and year
            if (startMonth === endMonth && startYear === endYear) {
                return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
            }
            
            // Check if same year
            if (startYear === endYear) {
                return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
            }
            
            // Different years
            return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
        } catch (e) {
            return startDateStr; // Return original if error
        }
    };

    // Helper function to simplify consecutive day ranges
    const simplifyDayRange = (daysText) => {
        if (!daysText) return '';
        
        const days = daysText.split(',').map(day => day.trim());
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Find consecutive sequences
        const sequences = [];
        let currentSequence = [];
        
        for (let i = 0; i < days.length; i++) {
            const dayIndex = dayOrder.indexOf(days[i]);
            if (dayIndex === -1) {
                // Day not found in standard order, add as standalone
                if (currentSequence.length > 0) {
                    sequences.push([...currentSequence]);
                    currentSequence = [];
                }
                sequences.push([days[i]]);
            } else {
                if (currentSequence.length === 0) {
                    currentSequence.push(days[i]);
                } else {
                    const lastIndex = dayOrder.indexOf(currentSequence[currentSequence.length - 1]);
                    if (dayIndex === lastIndex + 1) {
                        // Consecutive day
                        currentSequence.push(days[i]);
                    } else {
                        // Not consecutive, start new sequence
                        sequences.push([...currentSequence]);
                        currentSequence = [days[i]];
                    }
                }
            }
        }
        
        // Add last sequence if exists
        if (currentSequence.length > 0) {
            sequences.push(currentSequence);
        }
        
        // Format sequences
        const formattedSequences = sequences.map(sequence => {
            if (sequence.length === 1) {
                return sequence[0];
            } else if (sequence.length === 2) {
                return `${sequence[0]} and ${sequence[1]}`;
            } else {
                return `${sequence[0]} - ${sequence[sequence.length - 1]}`;
            }
        });
        
        return formattedSequences.join(', ');
    };

    schedules.forEach((schedule, index) => {
        const isEvent = schedule && schedule.__type === 'event';
        const rawDaysText = schedule.scheduleDays && Array.isArray(schedule.scheduleDays) && schedule.scheduleDays.length > 0
            ? schedule.scheduleDays.join(', ')
            : '';
        
        // Simplify consecutive day ranges
        const daysText = simplifyDayRange(rawDaysText);
        
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
        
        // Use friendly date formatting for program dates
        let programDates = '';
        if (schedule.startDate || schedule.endDate) {
            if (schedule.startDate && schedule.endDate) {
                programDates = formatFriendlyDateRange(schedule.startDate, schedule.endDate);
            } else if (schedule.startDate && !schedule.endDate) {
                programDates = formatFriendlyDate(schedule.startDate);
            }
        }
        
        const eventDt = isEvent ? formatEventDateTimeParts(schedule) : { dateText: '', timeText: '' };
        let eventDateText = eventDt.dateText || '';
        let eventTimeText = eventDt.timeText || '';
        
        // Override for events in schedule view: show date without year, use scheduleTime with timezone
        if (isEvent) {
            // Format date WITHOUT year for consistency
            const startDateField = schedule.StartDateandTime || schedule.startDateTime;
            const endDateField = schedule.EndDateandTime || schedule.endDateTime;
            
            let startTs = null;
            let endTs = null;
            
            if (startDateField) {
                startTs = Number.isFinite(startDateField) ? startDateField : Date.parse(String(startDateField));
            }
            if (endDateField) {
                endTs = Number.isFinite(endDateField) ? endDateField : Date.parse(String(endDateField));
            }
            
            const hasStart = startTs && !isNaN(startTs);
            const hasEnd = endTs && !isNaN(endTs);
            const start = hasStart ? new Date(startTs) : null;
            const end = hasEnd ? new Date(endTs) : null;

            const dateFmtNoYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
            const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

            if (start && end) {
                const sameDay = start.toDateString() === end.toDateString();
                eventDateText = sameDay ? dateFmtNoYear.format(start) : `${dateFmtNoYear.format(start)} - ${dateFmtNoYear.format(end)}`;
                // Extract time from start and end
                eventTimeText = `${timeFmt.format(start)} - ${timeFmt.format(end)}`;
            } else if (start) {
                eventDateText = dateFmtNoYear.format(start);
                eventTimeText = timeFmt.format(start);
            }
            
            // Append timezone abbreviation if available
            if (eventTimeText && schedule.timezone) {
                const tz = schedule.timezone.toLowerCase();
                if (tz.includes('eastern')) {
                    eventTimeText += ' (Eastern)';
                } else if (tz.includes('central')) {
                    eventTimeText += ' (Central)';
                }
            }
        }
        
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

        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt; font-size: 7.5pt; }
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
        // Special handling for joinCenter modal
        if (type === 'joinCenter') {
            // Get the registration URL from the button that triggered this
            const joinButton = document.querySelector('[data-registration-url]');
            const registrationURL = joinButton ? joinButton.getAttribute('data-registration-url') : 'https://online.traxsolutions.com/southernusasalvationarmy/winston-salem#/dashboard';
            
            // Set the Join button URL
            const joinBtn = document.getElementById('joinCenterJoinBtn');
            if (joinBtn) {
                joinBtn.onclick = function() {
                    window.open(registrationURL, '_blank');
                };
            }
        }
        
        // Special handling for joinActivity modal
        if (type === 'joinActivity') {
            // Get the search URL from the button that triggered this
            const activityButton = document.querySelector('[data-search-url]');
            const searchURL = activityButton ? activityButton.getAttribute('data-search-url') : 'https://online.traxsolutions.com/southernusasalvationarmy/winston-salem#/search';
            
            // Set the Search Activities button URL
            const searchBtn = document.getElementById('joinActivitySearchBtn');
            if (searchBtn) {
                searchBtn.onclick = function() {
                    window.open(searchURL, '_blank');
                };
            }
        }
        
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

/**
 * Print Join Center Modal - Print join center information with same template header as schedules
 */
function printJoinCenterModal() {
    // Get join center modal content
    const joinCenterModal = document.getElementById('rsyc-modal-joinCenter');
    if (!joinCenterModal) {
        alert('Join Center information not available');
        return;
    }

    const modalBody = joinCenterModal.querySelector('.rsyc-modal-body');
    if (!modalBody) {
        alert('Unable to find join center content');
        return;
    }

    const joinCenterContent = modalBody.innerHTML;
    const printDate = new Date().toLocaleDateString('en-US');
    const printTitle = `Join a Center Information - ${printDate}`;

    // Get center name from current center or global reference
    const centerName = (window.rsycGen?.currentCenter?.name) || (window.rsycGen?.currentCenter?.Title) || window.currentCenter?.name || 'Red Shield Youth Centers';

    // Fetch logo for injection (exact same as program schedules)
    let logoSvgHtml = '';
    const logoUrl = 'https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg';
    try {
        const resp = fetch(logoUrl);
        if (resp.ok) { 
            logoSvgHtml = resp.text(); 
        } else { 
            logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`; 
        }
    } catch (e) {
        logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`;
    }

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>${printTitle}</title>
    <style>
        :root {
            --rsyc-teal: #20B3A8;
        }

        @page { margin: 0.2in; }
        
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0.2in; 
            font-size: 8pt; 
            line-height: 1.3; 
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
            font-size: 14pt; 
            font-weight: 700; 
            margin-bottom: 0px;
            text-transform: uppercase;
        }
        
        .center-name { 
            font-size: 12pt; 
            color: #555; 
            font-style: italic;
        }

        /* CONTENT SECTION - FONT SIZE REDUCTIONS FOR PRINT */
        .content { 
            line-height: 1.3; 
            margin-bottom: 6pt;
        }

        .content p { 
            font-size: 8pt;
            margin-bottom: 4pt;
            line-height: 1.3;
        }

        .content h2,
        .content h3 {
            color: var(--rsyc-teal);
            margin-top: 6pt;
            margin-bottom: 3pt;
            font-weight: 700;
        }

        .content h2 {
            font-size: 11pt;
        }

        .content h3 {
            font-size: 9pt;
        }

        .content div[style*="font-size: 1.1rem"],
        .content div[style*="font-size: 1.2rem"] {
            font-size: 8pt !important;
        }

        .content span[style*="font-size: 1.2rem"] {
            font-size: 10pt !important;
        }

        .content ul,
        .content ol {
            margin-left: 12pt;
            margin-bottom: 4pt;
        }

        .content li {
            font-size: 8pt;
            margin-bottom: 2pt;
            line-height: 1.3;
        }

        .content em {
            font-style: italic;
        }

        .content strong {
            font-weight: 700;
        }
        
        .footer { 
            text-align: center; 
            margin-top: 12pt; 
            padding-top: 6pt; 
            border-top: 1pt solid #ddd; 
            color: #666; 
            font-size: 7pt; 
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-text">
            <h2>Join a Center</h2>
            <div class="center-name">The Salvation Army ${centerName}</div>
        </div>
        <div class="header-logo-container">
            ${logoSvgHtml || ''}
        </div>
    </header>

    <main class="content">
        ${joinCenterContent}
    </main>

    <footer class="footer">
        <p>www.redshieldyouth.org</p>
    </footer>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

/**
 * Print Join Activity Modal - Print join activity information with same template header as schedules
 */
function printJoinActivityModal() {
    // Get join activity modal content
    const joinActivityModal = document.getElementById('rsyc-modal-joinActivity');
    if (!joinActivityModal) {
        alert('Join Activity information not available');
        return;
    }

    const modalBody = joinActivityModal.querySelector('.rsyc-modal-body');
    if (!modalBody) {
        alert('Unable to find join activity content');
        return;
    }

    const joinActivityContent = modalBody.innerHTML;
    const printDate = new Date().toLocaleDateString('en-US');
    const printTitle = `Join an Activity Information - ${printDate}`;

    // Get center name from current center or global reference
    const centerName = (window.rsycGen?.currentCenter?.name) || (window.rsycGen?.currentCenter?.Title) || window.currentCenter?.name || 'Red Shield Youth Centers';

    // Fetch logo for injection (exact same as program schedules)
    let logoSvgHtml = '';
    const logoUrl = 'https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg';
    try {
        const resp = fetch(logoUrl);
        if (resp.ok) { 
            logoSvgHtml = resp.text(); 
        } else { 
            logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`; 
        }
    } catch (e) {
        logoSvgHtml = `<img src="${logoUrl}" style="height:auto; width:220px; display:block;" />`;
    }

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>${printTitle}</title>
    <style>
        :root {
            --rsyc-teal: #20B3A8;
        }

        @page { margin: 0.2in; }
        
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0.2in; 
            font-size: 8pt; 
            line-height: 1.3; 
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
            font-size: 14pt; 
            font-weight: 700; 
            margin-bottom: 0px;
            text-transform: uppercase;
        }
        
        .center-name { 
            font-size: 12pt; 
            color: #555; 
            font-style: italic;
        }

        /* CONTENT SECTION - FONT SIZE REDUCTIONS FOR PRINT */
        .content { 
            line-height: 1.3; 
            margin-bottom: 6pt;
        }

        .content p { 
            font-size: 8pt;
            margin-bottom: 4pt;
            line-height: 1.3;
        }

        .content h2,
        .content h3 {
            color: var(--rsyc-teal);
            margin-top: 6pt;
            margin-bottom: 3pt;
            font-weight: 700;
        }

        .content h2 {
            font-size: 11pt;
        }

        .content h3 {
            font-size: 9pt;
        }

        .content div[style*="font-size: 1.1rem"],
        .content div[style*="font-size: 1.2rem"] {
            font-size: 8pt !important;
        }

        .content span[style*="font-size: 1.2rem"] {
            font-size: 10pt !important;
        }

        .content ul,
        .content ol {
            margin-left: 12pt;
            margin-bottom: 4pt;
        }

        .content li {
            font-size: 8pt;
            margin-bottom: 2pt;
            line-height: 1.3;
        }

        .content em {
            font-style: italic;
        }

        .content strong {
            font-weight: 700;
        }
        
        .footer { 
            text-align: center; 
            margin-top: 12pt; 
            padding-top: 6pt; 
            border-top: 1pt solid #ddd; 
            color: #666; 
            font-size: 7pt; 
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-text">
            <h2>Join an Activity</h2>
            <div class="center-name">The Salvation Army ${centerName}</div>
        </div>
        <div class="header-logo-container">
            ${logoSvgHtml || ''}
        </div>
    </header>

    <main class="content">
        ${joinActivityContent}
    </main>

    <footer class="footer">
        <p>www.redshieldyouth.org</p>
    </footer>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

/**
 * Print Volunteer Modal - Print volunteer information with same template header as schedules
 */
function printVolunteerModal(centerName) {
    // Get volunteer modal content
    const volunteerModal = document.getElementById('rsyc-modal-volunteer');
    if (!volunteerModal) {
        alert('Volunteer information not available');
        return;
    }

    const modalBody = volunteerModal.querySelector('.rsyc-modal-body');
    if (!modalBody) {
        alert('Unable to find volunteer content');
        return;
    }

    const volunteerContent = modalBody.innerHTML;
    const printDate = new Date().toLocaleDateString('en-US');
    const printTitle = `Volunteer Information - ${centerName} - ${printDate}`;

    // Fetch logo
    let logoSvgHtml = '';
    const logoUrl = 'https://thisishoperva.org/rsyc/Red+Shield+Youth+Centers+Logo+-+Color.svg';
    
    // Build HTML document with same structure as printAllSchedules
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
            font-size: 9pt; 
            line-height: 1.4; 
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

        /* CONTENT SECTION */
        .content { 
            margin-bottom: 6pt;
        }

        .content h2,
        .content h3 {
            color: var(--rsyc-teal);
            margin-top: 8pt;
            margin-bottom: 4pt;
        }

        .content h2 {
            font-size: 12pt;
            font-weight: 700;
        }

        .content h3 {
            font-size: 10pt;
            font-weight: 600;
        }

        .content h4 {
            font-size: 9pt;
            font-weight: 600;
            color: var(--rsyc-navy);
            margin-top: 6pt;
            margin-bottom: 3pt;
        }

        .content p {
            margin-bottom: 4pt;
            line-height: 1.4;
        }

        .content ul,
        .content ol {
            margin-left: 12pt;
            margin-bottom: 4pt;
        }

        .content li {
            margin-bottom: 2pt;
            line-height: 1.3;
        }

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
        <h2>Volunteer Information</h2>
        <div class="center-name">The Salvation Army ${centerName}</div>
    </div>
    <div class="header-logo-container">
        <img src="${logoUrl}" style="height:auto; width:280px; display:block;" />
    </div>
</header>

<main class="content">
    ${volunteerContent}
</main>

<footer class="footer-note">
    <p>Learn more about volunteering and other ways to get involved at <strong>www.redshieldyouth.org</strong></p>
</footer>

<div class="date-stamp">Printed on ${printDate}</div>
</body>
</html>`;

    // Open print window
    const printWindow = window.open('', '', 'height=900,width=1200');
    if (!printWindow) {
        alert('Unable to open print window. Your browser may have popup blocking enabled.');
        return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print after a short delay to ensure content is rendered
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// Make functions globally available
window.showRSYCModal = showRSYCModal;
window.closeRSYCModal = closeRSYCModal;
window.printRSYCModal = printRSYCModal;
window.printStoryModal = printStoryModal;
window.printVolunteerModal = printVolunteerModal;
window.printJoinCenterModal = printJoinCenterModal;
window.printJoinActivityModal = printJoinActivityModal;

// Close modal when clicking outside content
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rsyc-modal')) {
        const modalId = e.target.id;
        const type = modalId.replace('rsyc-modal-', '');
        closeRSYCModal(type);
    }
});

// CSS for centered grid and pagination
const paginationStyles = `
<style>
.rsyc-nearby-grid-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.rsyc-nearby-grid {
    display: grid;
    gap: 24px;
    width: 100%;
    max-width: 1050px;
    grid-template-columns: repeat(3, minmax(0, 350px));
    justify-content: center;
    justify-items: stretch;
}

.rsyc-nearby-card {
    width: 100%;
    transition: opacity 0.3s ease-in-out;
}

.rsyc-nearby-card.hidden {
    display: none;
}

/* Dynamic grid layouts based on number of centers */
/* 1 center - single column centered */
.rsyc-nearby-grid-1 {
    grid-template-columns: 1fr;
    max-width: 350px;
}

/* 2 centers - 2 columns centered */
.rsyc-nearby-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 350px));
    max-width: 724px;
}

/* 3+ centers - 3 columns by default, then responsive */
.rsyc-nearby-grid-3,
.rsyc-nearby-grid-4,
.rsyc-nearby-grid-5,
.rsyc-nearby-grid-6 {
    grid-template-columns: repeat(3, minmax(0, 350px));
    max-width: 1050px;
}

/* Desktop: 3 columns, 6 cards per page (2 rows) */
@media (min-width: 992px) {
    .rsyc-nearby-grid {
        grid-template-columns: repeat(3, minmax(0, 350px));
        max-width: 1050px;
    }
    .rsyc-nearby-card {
        max-width: 350px;
    }
}

/* Tablet: 2 columns, 4 cards per page (2 rows) */
@media (min-width: 768px) and (max-width: 991px) {
    .rsyc-nearby-grid {
        grid-template-columns: repeat(2, minmax(0, 350px));
        max-width: 724px !important;
    }
    .rsyc-nearby-card {
        max-width: 350px;
    }
}

/* Mobile: 1 column, 1 card per page */
@media (max-width: 767px) {
    .rsyc-nearby-grid {
        grid-template-columns: 1fr;
        max-width: 350px;
    }
    .rsyc-nearby-card {
        max-width: 100%;
    }
}

/* Pagination controls styling */
.rsyc-pagination-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
    width: 100%;
}

.rsyc-pagination-controls .btn {
    min-width: 100px;
}

.rsyc-pagination-controls .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.rsyc-page-info {
    font-weight: 500;
    color: #495057;
    white-space: nowrap;
}

/* Nearby pills styling */
.rsyc-nearby-pills {
    margin-bottom: 2rem;
}

.rsyc-nearby-pills .badge {
    white-space: normal;
}

/* Toggle button styling */
#rsyc-nearby-toggle-btn,
#rsyc-nearby-toggle-btn-main {
    transition: all 0.3s ease;
}

#rsyc-nearby-toggle-btn:hover,
#rsyc-nearby-toggle-btn-main:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
`;

// JavaScript pagination function
window.rsycPagination = function(section, direction) {
    const grid = document.querySelector(`.rsyc-nearby-grid[data-section="${section}"]`);
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.rsyc-nearby-card');
    const totalCards = cards.length;
    
    // Determine cards per page based on screen width
    let cardsPerPage;
    if (window.innerWidth >= 992) {
        cardsPerPage = 6; // Desktop: 3 columns × 2 rows
    } else if (window.innerWidth >= 768) {
        cardsPerPage = 4; // Tablet: 2 columns × 2 rows
    } else {
        cardsPerPage = 1; // Mobile: 1 column × 1 row
    }
    
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const paginationControls = grid.parentElement.querySelector('.rsyc-pagination-controls');
    const currentPageSpan = grid.parentElement.querySelector('.rsyc-current-page');
    const totalPagesSpan = grid.parentElement.querySelector('.rsyc-total-pages');
    const prevBtn = grid.parentElement.querySelector('.rsyc-prev-btn');
    const nextBtn = grid.parentElement.querySelector('.rsyc-next-btn');
    
    // Show/hide pagination controls based on whether pagination is needed
    if (totalCards > cardsPerPage) {
        paginationControls.style.display = 'flex';
    } else {
        paginationControls.style.display = 'none';
        // Show all cards if no pagination needed
        cards.forEach(card => card.classList.remove('hidden'));
        return;
    }
    
    let currentPage = parseInt(currentPageSpan.textContent);
    
    if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    } else if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else {
        return;
    }
    
    // Hide all cards
    cards.forEach(card => card.classList.add('hidden'));
    
    // Show cards for current page
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = Math.min(startIndex + cardsPerPage, totalCards);
    
    for (let i = startIndex; i < endIndex; i++) {
        cards[i].classList.remove('hidden');
    }
    
    // Update pagination controls
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
};

// Helper to initialize pagination for a section
function initializePaginationForSection(section) {
    const grid = document.querySelector(`.rsyc-nearby-grid[data-section="${section}"]`);
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.rsyc-nearby-card');
    if (cards.length === 0) return;
    
    // Determine cards per page based on screen width
    let cardsPerPage;
    if (window.innerWidth >= 992) {
        cardsPerPage = 6; // Desktop: 3 columns × 2 rows
    } else if (window.innerWidth >= 768) {
        cardsPerPage = 4; // Tablet: 2 columns × 2 rows
    } else {
        cardsPerPage = 1; // Mobile: 1 column × 1 row
    }
    
    const totalPages = Math.ceil(cards.length / cardsPerPage);
    const paginationContainer = grid.parentElement.querySelector('.rsyc-pagination-controls');
    const currentPageSpan = paginationContainer ? paginationContainer.querySelector('.rsyc-current-page') : null;
    const totalPagesSpan = paginationContainer ? paginationContainer.querySelector('.rsyc-total-pages') : null;
    const prevBtn = paginationContainer ? paginationContainer.querySelector('.rsyc-prev-btn') : null;
    const nextBtn = paginationContainer ? paginationContainer.querySelector('.rsyc-next-btn') : null;
    
    // Show pagination controls only if there are more cards than one page can display
    if (paginationContainer) {
        paginationContainer.style.display = cards.length > cardsPerPage ? 'flex' : 'none';
    }
    
    // Show/hide cards based on first page
    cards.forEach((card, index) => {
        card.classList.toggle('hidden', index >= cardsPerPage);
    });
    
    // Update pagination UI
    if (currentPageSpan) currentPageSpan.textContent = '1';
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = totalPages <= 1;
}

// Initialize pagination on page load
document.addEventListener('DOMContentLoaded', function() {
    // Inject pagination styles
    if (!document.querySelector('#rsyc-pagination-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'rsyc-pagination-styles';
        styleElement.innerHTML = paginationStyles;
        document.head.appendChild(styleElement.firstElementChild);
    }
    
    // Initialize pagination for each section
    ['area', 'division'].forEach(section => {
        initializePaginationForSection(section);
    });
    
    // Initialize division pagination when toggle button is clicked
    const toggleBtnMain = document.getElementById('rsyc-nearby-toggle-btn-main');
    if (toggleBtnMain) {
        toggleBtnMain.addEventListener('click', function() {
            setTimeout(() => {
                initializePaginationForSection('division');
            }, 100);
        });
    }
});

// Handle window resize for responsive pagination
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        ['area', 'division'].forEach(section => {
            initializePaginationForSection(section);
        });
    }, 250);
});

// Make pagination function globally available
window.rsycPagination = window.rsycPagination;
