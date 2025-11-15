/**
 * RSYC HTML Template Engine
 * Generates modular HTML sections for center profiles
 */

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
            'nearby': { name: 'Nearby Centers', enabled: true, order: 8 },
            'volunteer': { name: 'Volunteer Opportunities', enabled: true, order: 9 },
            'footerPhoto': { name: 'Footer Photo', enabled: true, order: 10 },
            'contact': { name: 'Contact & Donate', enabled: true, order: 11 }
        };
    }

    /**
     * Generate complete profile HTML
     */
    generateProfile(centerData, enabledSections) {
        const sections = [];
        
        Object.keys(this.sections).forEach(sectionKey => {
            if (enabledSections.includes(sectionKey)) {
                const html = this.generateSection(sectionKey, centerData);
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
        const methods = {
            'schedules': this.generateSchedules,
            'hours': this.generateHours,
            'programs': this.generatePrograms,
            'facilities': this.generateFacilities,
            'staff': this.generateStaff,
            'nearby': this.generateNearby,
            'parents': this.generateParents,
            'youth': this.generateYouth,
            'volunteer': this.generateVolunteer,
            'footerPhoto': this.generateFooterPhoto,
            'contact': this.generateContact
        };

        const method = methods[sectionKey];
        if (method) {
            const result = method.call(this, data);
            console.log(`🔍 Section "${sectionKey}":`, result ? `${result.length} chars` : 'EMPTY/NULL');
            return result;
        }
        console.warn(`⚠️ No method found for section: ${sectionKey}`);
        return '';
    }

    /**
     * Hero Section
     */
    generateHero(data) {
        const { center } = data;
        return `<!-- Hero Section -->
<section class="rsyc-hero">
    <div class="container">
        <h1>${this.escapeHTML(center.name)}</h1>
        <p class="location">
            <i class="bi bi-geo-alt-fill"></i>
            ${this.escapeHTML(center.city)}, ${this.escapeHTML(center.state)} ${center.zip}
        </p>
        ${center.websiteURL ? `<a href="${this.escapeHTML(center.websiteURL)}" class="btn btn-primary">Visit Website</a>` : ''}
    </div>
</section>`;
    }

    /**
     * About This Center Section
     */
    generateAbout(data) {
        const { center, photos } = data;
        if (!center.aboutText) return '';

        // Get exterior photo from photos array
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const exteriorPhoto = photoData?.urlExteriorPhoto || '';

        const exteriorPhotoHTML = exteriorPhoto ? `
        <div class="mb-4">
            <img src="${this.escapeHTML(exteriorPhoto)}" alt="${this.escapeHTML(center.name)} Exterior" 
                 class="img-fluid" style="width: 100%; height: auto; border-radius: 12px; object-fit: cover;">
        </div>` : '';

        return `<!-- About This Center -->
<section class="rsyc-about">
    <div class="container">
        ${exteriorPhotoHTML}
        <h2>About This Center</h2>
        <div class="about-content">
            ${this.makeContactsClickable(center.aboutText)}
        </div>
    </div>
</section>`;
    }

    /**
     * Featured Programs Section
     */
    generatePrograms(data) {
        const { programDetails, photos, center } = data;
        if (!programDetails || programDetails.length === 0) return '';

        // Get programs photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const programPhoto = photoData?.urlProgramsPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/c11a1b73-6893-4eb4-a24c-8ecf98058b14_484033880_1061382646027353_8208563035826151450_n.jpg';

        const totalPrograms = programDetails.length;
        const showViewAll = totalPrograms > 8;
        const displayPrograms = showViewAll ? programDetails.slice(0, 8) : programDetails;

        const programItems = displayPrograms.map(program => {
            const icon = program.iconClass || 'bi-star';
            return `
                    <div class="d-flex align-items-center" style="flex: 1 1 45%;">
                        <i class="bi ${this.escapeHTML(icon)} feature-icon"></i> ${this.escapeHTML(program.name)}
                    </div>`;
        }).join('');

        // All programs for modal
        const allProgramItems = programDetails.map(program => {
            const icon = program.iconClass || 'bi-star';
            return `
                    <div class="col-sm-12 col-md-6 d-flex align-items-center mb-3">
                        <i class="bi ${this.escapeHTML(icon)} feature-icon me-2"></i> ${this.escapeHTML(program.name)}
                    </div>`;
        }).join('');

        const viewAllButton = showViewAll ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showRSYCModal('programs', '${this.escapeHTML(center.name, true)}')">
                                    View All ${totalPrograms} Programs
                                </button>
                            </div>` : '';

        const modal = showViewAll ? `
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
</div>` : '';

        return `<!-- Featured Programs -->
<div id="freeTextArea-programs" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <!-- Left block: Photo (5 columns) -->
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1;">
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
                    <div class="col-md-7 d-flex">
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
    generateSchedules(data) {
        const { schedules, center } = data;
        
        // Build schedule cards if available
        let scheduleCards = '';
        let scheduleScrollSection = '';
        let scheduleTitleSection = '';
        
        if (schedules && schedules.length > 0) {
            // Only show title if there are schedule items
            scheduleTitleSection = `<h2 class="fw-bold mb-4 text-center">Program <em>Schedule</em></h2>`;
            
            // Sort schedules by proximity to current month
            const currentMonth = new Date().getMonth(); // 0-11
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            const sortedSchedules = [...schedules].sort((a, b) => {
                // Get the earliest month for each schedule
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
                
                return getEarliestMonth(a) - getEarliestMonth(b);
            });
            
            scheduleCards = sortedSchedules.map(schedule => {
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
                
                const expandableInfo = `
                    <div class="mt-2">
                        <button class="btn btn-outline-primary" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;" onclick="showRSYCModal('schedule-${schedule.id}', '${this.escapeHTML(schedule.title, true)}')">
                            View Full Details
                        </button>
                    </div>
                `;
                
                // Create modal with full schedule details
                const scheduleModal = `
<!-- Modal for Schedule Details -->
<div id="rsyc-modal-schedule-${schedule.id}" class="rsyc-modal" style="display:none;">
    <div class="rsyc-modal-content">
        <div class="rsyc-modal-header">
            <h3>${this.escapeHTML(schedule.title)}</h3>
            <button class="rsyc-modal-close" onclick="closeRSYCModal('schedule-${schedule.id}')">&times;</button>
        </div>
        <div class="rsyc-modal-body" style="color:#333;">
            ${schedule.videoEmbedCode ? `
                <div class="mb-4">
                    <div class="ratio ratio-16x9" style="border-radius: 12px; overflow: hidden;">
                        ${schedule.videoEmbedCode}
                    </div>
                </div>
            ` : ''}
            ${schedule.description ? `<div class="mb-4"><div style="font-size:1rem; line-height:1.6; color:#333;">${schedule.description}</div></div>` : ''}
            
            <div class="row">
                ${schedule.ageRange ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Age Range:</strong><br>${this.escapeHTML(schedule.ageRange)}</div>` : ''}
                ${daysText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Days:</strong><br>${this.escapeHTML(daysText)}</div>` : ''}
                ${timeText ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time:</strong><br>${this.escapeHTML(timeText)}</div>` : ''}
                ${schedule.timezone ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Time Zone:</strong><br>${this.escapeHTML(schedule.timezone)}</div>` : ''}
                ${schedule.frequency ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Frequency:</strong><br>${this.escapeHTML(schedule.frequency)}</div>` : ''}
                ${months ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Program Runs:</strong><br>${this.escapeHTML(months)}</div>` : ''}
                ${registrationMonths ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Opens:</strong><br>${this.escapeHTML(registrationMonths)}</div>` : ''}
                ${schedule.registrationDeadline ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Deadline:</strong><br>${this.escapeHTML(schedule.registrationDeadline)}</div>` : ''}
                ${schedule.registrationFee ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Registration Fee:</strong><br>${this.escapeHTML(schedule.registrationFee)}</div>` : ''}
                ${schedule.cost ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Cost:</strong><br>${this.escapeHTML(schedule.cost)}</div>` : ''}
                ${schedule.location ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Location:</strong><br>${this.escapeHTML(schedule.location)}</div>` : ''}
                ${schedule.capacity ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Capacity:</strong><br>${this.escapeHTML(schedule.capacity)}</div>` : ''}
                ${schedule.contactInfo ? `<div class="col-sm-12 col-md-6 mb-3" style="color:#333;"><strong>Contact:</strong><br>${this.escapeHTML(schedule.contactInfo)}</div>` : ''}
                ${schedule.prerequisites ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Prerequisites:</strong><br>${this.escapeHTML(schedule.prerequisites)}</div>` : ''}
                ${schedule.materialsProvided ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Materials Provided:</strong><br>${this.escapeHTML(schedule.materialsProvided)}</div>` : ''}
                ${schedule.whatToBring ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>What to Bring:</strong><br>${this.escapeHTML(schedule.whatToBring)}</div>` : ''}
                ${schedule.dropOffPickUp ? `<div class="col-sm-12 mb-3" style="color:#333;"><strong>Drop-off/Pick-up Info:</strong><br>${this.escapeHTML(schedule.dropOffPickUp)}</div>` : ''}
            </div>
            
            ${disclaimer ? `<div class="mt-3 p-3" style="background:#f8f9fa; border-left:3px solid #2F4857; border-radius:4px; color:#333;">${this.escapeHTML(disclaimer)}</div>` : ''}
            
            ${schedule.relatedPrograms && schedule.relatedPrograms.length > 0 ? `
                <div class="mt-3" style="color:#333;">
                    <strong>Related Programs:</strong>
                    <div class="mt-2">
                        ${schedule.relatedPrograms.map(p => `<span class="badge bg-secondary me-1">${this.escapeHTML(p.name)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    </div>
</div>`;

                return `
                <div class="schedule-card text-dark d-flex flex-column h-100" style="min-width:230px;padding:1rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                    <h5 class="fw-bold mb-1">${this.escapeHTML(schedule.title)}</h5>
                    <p class="mb-0">
                        ${daysText ? `<strong>Days:</strong> <span class="d-inline-block">${this.escapeHTML(daysText)}</span><br>` : ''}
                        ${timeText ? `<strong>Time:</strong> ${this.escapeHTML(timeText)}` : ''}
                    </p>
                    ${expandableInfo}
                </div>
                ${scheduleModal}`;
            }).join('');
            
            // Conditionally center if 3 or fewer cards, otherwise left-align for proper scrolling
            const justifyContent = schedules.length <= 3 ? 'justify-content-center' : '';
            const scrollHint = schedules.length > 3 ? `
    <p class="text-center mb-n2">
        <small class="text-light">
            Scroll to view more 
            <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
        </small>
    </p>` : '';
            
            scheduleScrollSection = `
    ${scrollHint}

    <div class="horizontal-scroll ${justifyContent}" style="display:flex;gap:1rem;overflow-x:auto;overflow-y:visible;padding-bottom:0.5rem;">
        ${scheduleCards}
    </div>`;
        }
        
        // Build About This Center section (always show if available) in white rounded card
        let aboutSection = '';
        if (center.aboutText) {
            // Get exterior photo from photos array
            const photoData = data.photos && data.photos.length > 0 ? data.photos[0] : null;
            const exteriorPhoto = photoData?.urlExteriorPhoto || '';
            
            const exteriorPhotoHTML = exteriorPhoto ? `
            <div class="mb-4">
                <img src="${this.escapeHTML(exteriorPhoto)}" alt="${this.escapeHTML(center.name)} Exterior" 
                     class="img-fluid" style="width: 100%; height: 300px; border-radius: 12px; object-fit: cover; object-position: center;">
            </div>` : '';
            
            aboutSection = `
    <div class="mt-5 d-flex justify-content-center">
        <div class="schedule-card text-dark" style="max-width:800px;width:100%;padding:1.5rem;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            ${exteriorPhotoHTML}
            <h3 class="fw-bold mb-3 text-center" style="font-size: 1.5rem;">About This <em>Center</em></h3>
            <p class="text-center mb-3"><strong>The Salvation Army ${this.escapeHTML(center.name || center.Title)}</strong></p>
            <div class="about-content" style="font-family: inherit; font-size: 1rem; line-height: 1.6;">
                ${center.aboutText}
            </div>
        </div>
    </div>`;
        }
        
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

        return `<!-- Program Schedules -->
<div id="freeTextArea-schedules" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="my-5">
                ${scheduleTitleSection}
                
                <div class="schedule-scroll-wrapper">
                    ${scheduleScrollSection}
                </div>
                
                ${aboutSection}
                
                ${socialSection}
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

    <div class="section operationHoursAdvanced-container">

		<div class="container">

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
        if (!facilityFeatures || facilityFeatures.length === 0) return '';

        // Get facility photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const facilityPhoto = photoData?.urlFacilityFeaturesPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/9150a418-1c58-4d01-bf81-5753d1c608ae_salvation+army+building+1.png';

        const totalFeatures = facilityFeatures.length;
        const showViewAll = totalFeatures > 8;
        const displayFeatures = showViewAll ? facilityFeatures.slice(0, 8) : facilityFeatures;

        const featuresHTML = displayFeatures.map(feature => {
            const icon = feature.biClass || 'bi-check-circle';
            return `
          <div class="d-flex align-items-center mb-3" style="flex:1 1 45%;">
            <i class="bi ${this.escapeHTML(icon)} feature-icon me-2"></i> ${this.escapeHTML(feature.name)}
          </div>`;
        }).join('');

        // All features for modal
        const allFeaturesHTML = facilityFeatures.map(feature => {
            const icon = feature.biClass || 'bi-check-circle';
            return `
          <div class="col-sm-12 col-md-6 d-flex align-items-center mb-3">
            <i class="bi ${this.escapeHTML(icon)} feature-icon me-2"></i> ${this.escapeHTML(feature.name)}
          </div>`;
        }).join('');

        const viewAllButton = showViewAll ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showRSYCModal('facilities', '${this.escapeHTML(center.name, true)}')">
                                    View All ${totalFeatures} Features
                                </button>
                            </div>` : '';

        const modal = showViewAll ? `
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
</div>` : '';

        return `<!-- Facility Features -->
<div id="freeTextArea-facilities" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <!-- Left block: Facility Features (7 columns) -->
                    <div class="col-md-7 d-flex order-2 order-md-1">
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
                    <div class="col-md-5 d-flex mt-4 mt-md-0 order-1 order-md-2">
                        <div class="photo-card w-100 h-100" style="aspect-ratio: 1 / 1;">
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
        const { leaders } = data;
        if (!leaders || leaders.length === 0) return '';

        // Default photo for all staff - will be manually replaced later
        const defaultPhoto = 'https://8hxvw8tw.media.zestyio.com/SAL_Leaders_Desktop-2.png';

        // Order staff by prioritized role types (use the order from the provided choices)
        const priorityRoles = [
            'Executive Director',
            'Site Director',
            'Program Manager',
            'Program Coordinator',
            'Youth Development Professional',
            'Membership Clerk',
            'Area Director',
            'Corps Officer',
            'Area Commander',
            'Other'
        ];

        const getPriority = (role) => {
            if (!role) return priorityRoles.length;
            const idx = priorityRoles.findIndex(r => r.toLowerCase() === role.toLowerCase());
            return idx === -1 ? priorityRoles.length : idx;
        };

        const sorted = [...leaders].sort((a, b) => {
            // prefer roleType, fall back to positionTitle
            const roleA = (a.roleType || a.positionTitle || '').toString();
            const roleB = (b.roleType || b.positionTitle || '').toString();
            const pA = getPriority(roleA);
            const pB = getPriority(roleB);
            if (pA !== pB) return pA - pB;

            // If same priority, sort by person name (primary then alternate)
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
            const photo = defaultPhoto; // Use default image for all staff

            return `
		<div class="card shadow border rounded-3 flex-shrink-0" style="width: 280px; scroll-snap-align: start; border: 1px solid #dee2e6; overflow:hidden;">
			<img alt="${this.escapeHTML(displayName)}" class="card-img-top" src="${this.escapeHTML(photo)}" style="width:100%; height:250px; object-fit:cover; display:block;">
			<div class="card-body d-flex flex-column">
				<div class="fw-bold mb-1" style="font-size: 1.1rem; line-height: 1.3;">${this.escapeHTML(displayName)}</div>
				<div class="text-muted mb-2" style="font-size: 0.95rem;">${this.escapeHTML(title)}</div>
				<p class="card-text" style="flex-grow:1; font-size: 0.875rem; line-height: 1.5;">
					${this.escapeHTML(bio)}
				</p>
			</div>
		</div>`;
        }).join('\n');        return `<!-- Staff & Community Leaders -->
<div id="freeTextArea-staff" class="freeTextArea u-centerBgImage section u-sa-goldBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="bg-area rounded p-4" id="profiles">
                <h2 class="fw-bold mb-4"><span style="color:#111111;">Staff &amp; <em>Community Leaders</em></span></h2>
                <p class="mb-n2">
                    <small class="text-muted">
                        Scroll to view more 
                        <i class="bi bi-arrow-right-circle" style="font-size: 0.85em; vertical-align: middle;"></i>
                    </small>
                </p>
                
                <div class="d-flex overflow-auto gap-4 py-2" style="scroll-snap-type: x mandatory;">
                    ${staffCards}
                </div>
            </div>
        </div>
    </div>
</div>`;
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
<div id="freeTextArea-nearby" class="freeTextArea u-centerBgImage section u-sa-greyVeryLightBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
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
                               href="https://www.salvationarmyusa.org/location-finder/?address=${zipCode}" 
                               target="_blank">
                                <i class="bi bi-map me-2"></i> Get More Details
                            </a>
                        </div>
                    </div>
                    
                    <!-- Right block: Photo (5 columns) -->
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill">
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
        const registrationURL = center.signUpURL || 'https://online.traxsolutions.com/southernusasalvationarmy/winston-salem#/dashboard';
        
        // Check if staff section has data (to show/hide Meet Our Staff button)
        const hasStaff = leaders && leaders.length > 0;
        
        return `<!-- For Parents -->
<div id="freeTextArea-parents" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <!-- Left block: Photo (5 columns) -->
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1;">
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
                    <div class="col-md-7 d-flex">
                        <div class="hover-card w-100 d-flex flex-column flex-fill">
                            <i class="bi bi-shield-lock icon-lg"></i>
                            <h2 class="fw-bold mb-2">For <em>Parents</em></h2>
                            
                            <p class="text-secondary mb-4">
                                Everything you need to know to keep your child safe and engaged at our youth centers.
                            </p>
                            
                            <div class="d-grid gap-2 mt-auto">
                                <a class="btn btn-outline-primary btn-md" href="/redshieldyouth/safety">
                                    <i class="bi bi-file-earmark-text me-2"></i> Safety Policies
                                </a>
                                <a class="btn btn-outline-primary btn-md" 
                                   href="${this.escapeHTML(registrationURL)}" 
                                   target="_blank">
                                    <i class="bi bi-calendar-check me-2"></i> Register for Programs
                                </a>
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
<div id="freeTextArea-youth" data-index="7" class="freeTextArea u-centerBgImage section u-sa-creamBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <!-- Left block: Hover card (7 columns) -->
                    <div class="col-md-7 d-flex order-2 order-md-1">
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
                    <div class="col-md-5 d-flex order-1 order-md-2">
                        <div class="photo-card w-100" style="aspect-ratio: 1 / 1; overflow:hidden; border-radius:12px;">
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
        const locationFinderUrl = `https://www.salvationarmyusa.org/location-finder/?address=${postalCode}`;
        
        // Get nearby centers photo from photos array, fallback to default
        const photoData = photos && photos.length > 0 ? photos[0] : null;
        const nearbyPhoto = photoData?.urlNearbyCentersPhoto || 'https://s3.amazonaws.com/uss-cache.salvationarmy.org/71fe3cd2-5a53-4557-91ea-bb40ab76e2f5_nearby-corps-1.jpg';

        return `<!-- Nearby Salvation Army Centers -->
<div id="freeTextArea-nearby" class="freeTextArea u-centerBgImage section u-sa-greyVeryLightBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch flex-column-reverse flex-md-row">
                    <!-- Left block: Nearby Centers card (7 columns) -->
                    <div class="col-md-7 d-flex mb-4 mb-md-0">
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
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100 h-100 flex-fill" style="aspect-ratio: 1 / 1;">
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
            <div style="font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;">
                ${this.makeContactsClickable(volunteerText)}
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
<div id="freeTextArea-volunteer" data-index="8" class="freeTextArea u-centerBgImage section u-sa-whiteBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            <div class="container my-5">
                <div class="row align-items-stretch">
                    <!-- Left block: Photo (5 columns) -->
                    <div class="col-md-5 d-flex">
                        <div class="photo-card w-100" style="aspect-ratio: 1 / 1; overflow:hidden; border-radius:12px;">
                            <img alt="Get Involved Photo" src="${photoUrl}" style="width:100%; height:100%; object-fit:cover; object-position: center;">
                        </div>
                    </div>
                    <!-- Right block: Hover card (7 columns) -->
                    <div class="col-md-7 d-flex">
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

        return `<!-- Footer Photo Section -->
<section id="freeTextArea-footerPhoto" class="freeTextArea u-centerBgImage section u-coverBgImage" style="min-height: 400px; background-image: url('${this.escapeHTML(footerPhoto)}'); background-size: cover; background-position: center;">
    <div class="u-positionRelative" style="min-height: 400px;">
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
  padding-bottom: 25px !important;
  margin-bottom: 0 !important;
}

#freeTextArea-scripture p:last-child {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>

<div id="freeTextArea-scripture" data-index="10" class="freeTextArea u-centerBgImage section u-sa-tealBg u-coverBgImage">
    <div class="u-positionRelative">
        <div class="container">
            
            <h2 style="text-align: center; margin-bottom: 1.5rem;">
                ${this.escapeHTML(center.name || center.Title)}
            </h2>
            
            <p style="text-align: center;">
                <cite>${this.escapeHTML(scriptureText)}</cite>
            </p>
            
            <p style="text-align: center;">
                <strong><cite>-&nbsp;${this.escapeHTML(scriptureReference)}</cite></strong>
            </p>
        </div>
    </div>
</div>`;
    }

    /**
     * Parse scripture text to separate quote and reference
     * Handles various formats:
     * - "Galatians 3:26  So in Christ Jesus you are all children of God through faith"
     * - Proverbs 22:6 "Start children off on the way they should go..."
     * - "Start children off..." Proverbs 22:6
     * - "We love each other..." 1 John 4:19
     * - John 13:34 (ICB) - "I give you a new command..."
     * - "As each one has received a gift..."-1 Peter 4:10
     */
    parseScripture(scripture) {
        let text = '';
        let reference = '';
        
        // Remove leading/trailing whitespace
        scripture = scripture.trim();
        
        // Bible book pattern (handles 1-2 word book names with optional numbers like "1 John", "2 Corinthians")
        // Captures: optional digit, book name (1-2 words), chapter:verse(-verse), optional version like (ICB)
        const bookPattern = /(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:\s*\([A-Z]+\))?)/;
        
        // Pattern 1: Reference at start with dash/hyphen and quoted text
        // Format: "John 13:34 (ICB) - "Quote text"" or ""Quote text"-1 Peter 4:10"
        const refStartWithDash = scripture.match(/^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:\s*\([A-Z]+\))?)\s*[-–—]\s*(.+)$/);
        if (refStartWithDash) {
            reference = refStartWithDash[1].trim();
            text = refStartWithDash[2].trim();
            text = text.replace(/^["'""]|["'""]$/g, '').trim();
            return { text, reference };
        }
        
        // Pattern 2: Quoted text at start with dash/hyphen and reference at end
        // Format: ""Quote text"-1 Peter 4:10"
        const quotedStartWithDash = scripture.match(/^["'""](.+?)["'""]?\s*[-–—]\s*(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:\s*\([A-Z]+\))?)$/);
        if (quotedStartWithDash) {
            text = quotedStartWithDash[1].trim();
            reference = quotedStartWithDash[2].trim();
            return { text, reference };
        }
        
        // Pattern 3: Reference at start with space(s) and quoted text (no dash)
        // Format: "Proverbs 22:6 "Start children off..." or "Galatians 3:26  Text here"
        const refStartWithSpace = scripture.match(/^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:\s*\([A-Z]+\))?)\s+(.+)$/);
        if (refStartWithSpace) {
            reference = refStartWithSpace[1].trim();
            text = refStartWithSpace[2].trim();
            text = text.replace(/^["'""]|["'""]$/g, '').trim();
            return { text, reference };
        }
        
        // Pattern 4: Quoted text at start, reference at end (no dash)
        // Format: ""We love each other..." 1 John 4:19" or ""Quote" Proverbs 22:6"
        const quotedStart = scripture.match(/^["'""](.+?)["'""]\s+(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:\s*\([A-Z]+\))?)$/);
        if (quotedStart) {
            text = quotedStart[1].trim();
            reference = quotedStart[2].trim();
            return { text, reference };
        }
        
        // Pattern 5: Unquoted text with reference at end (space-separated)
        // Format: "Text here 1 John 4:19"
        const textWithRefEnd = scripture.match(/^(.+?)\s+(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:\s*\([A-Z]+\))?)$/);
        if (textWithRefEnd) {
            // Make sure we're not splitting within the book name
            const potentialText = textWithRefEnd[1].trim();
            const potentialRef = textWithRefEnd[2].trim();
            
            // Validate that the reference part looks like a real book reference
            if (/^\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+/.test(potentialRef)) {
                text = potentialText.replace(/^["'""]|["'""]$/g, '').trim();
                reference = potentialRef;
                return { text, reference };
            }
        }
        
        // No clear reference found, use entire text as quote
        text = scripture.replace(/^["'""]|["'""]$/g, '').trim();
        reference = '';
        
        return { text, reference };
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
        
        // Not consecutive - list first few and add "..."
        if (sorted.length > 4) {
            return `${sorted.slice(0, 3).join(', ')}, and ${sorted.length - 3} more`;
        }
        
        // 3-4 non-consecutive months - just list them
        return sorted.join(', ');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Make email addresses and phone numbers clickable
     * ADDED 2025-11-15: Auto-link emails and phones in content
     */
    makeContactsClickable(text) {
        if (!text) return '';
        
        // Make email addresses clickable
        // Match emails: word@domain.tld
        text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, 
            '<a href="mailto:$1">$1</a>');
        
        // Make phone numbers clickable
        // Match formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
        text = text.replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, function(match) {
            // Clean number for tel: link (remove all non-digits)
            const cleanNumber = match.replace(/\D/g, '');
            return `<a href="tel:+1${cleanNumber}">${match}</a>`;
        });
        
        return text;
    }
    // END ADDED 2025-11-15

    /**
     * Get section list
     */
    getSections() {
        return this.sections;
    }
}

// Create global instance
window.rsycTemplates = new RSYCTemplates();
