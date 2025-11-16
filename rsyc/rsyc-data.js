/**
 * RSYC Data Loader
 * Fetches and caches all JSON data from SharePoint
 */

class RSYCDataLoader {
    constructor() {
        // Use CORS proxy for all environments to avoid CORS issues
        this.corsProxy = 'https://corsproxy.io/?';
        this.baseURL = 'https://thisishoperva.org/rsyc/';
        
        this.cache = {
            centers: null,
            programs: null,
            schedules: null,
            leaders: null,
            photos: null,
            hours: null,
            facilities: null,
            featuredPrograms: null,
            lastUpdated: null
        };
        this.loading = false;
    }

    /**
     * Load all data sources
     */
    async loadAll() {
        if (this.loading) return;
        this.loading = true;

        try {
            console.log('🔄 Loading RSYC data...');
            
            // Load critical data first, then optional data
            const [centers, schedules, leaders, hours, facilities, featuredPrograms] = await Promise.all([
                this.fetchJSON('units-rsyc-profiles.json'),
                this.fetchJSON('RSYCProgramSchedules.json'),
                this.fetchJSON('RSYCLeaders.json'),
                this.fetchJSON('RSYCHours.json'),
                this.fetchJSON('RSYCFacilityFeatures.json'),
                this.fetchJSON('RSYCPrograms.json')
            ]);

            // Load photos separately with error handling (optional data)
            let photos = [];
            try {
                photos = await this.fetchJSON('RSYCHomepagePhotos.json');
                console.log('✅ Photos loaded successfully');
            } catch (error) {
                console.warn('⚠️ Photos not available, using defaults:', error.message);
                photos = []; // Empty array, templates will use default images
            }

            this.cache.centers = this.processCenters(centers);
            this.cache.schedules = this.processSchedules(schedules);
            this.cache.leaders = this.processLeaders(leaders);
            this.cache.photos = this.processPhotos(photos);
            this.cache.hours = this.processHours(hours);
            this.cache.facilities = this.processFacilities(facilities);
            this.cache.featuredPrograms = this.processPrograms(featuredPrograms);
            this.cache.lastUpdated = new Date();

            console.log('✅ Data loaded successfully:', {
                centers: this.cache.centers.length,
                schedules: this.cache.schedules.length,
                leaders: this.cache.leaders.length,
                photos: this.cache.photos.length,
                hours: this.cache.hours.length,
                facilities: this.cache.facilities.length,
                programs: this.cache.featuredPrograms.length
            });

            return true;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Fetch JSON from URL with fallback
     */
    async fetchJSON(filename) {
        // Always fetch the canonical remote JSON via CORS proxy. No local fallback.
        const remoteUrl = this.corsProxy + encodeURIComponent(this.baseURL + filename);
        try {
            console.log(`📥 Fetching remote (via CORS proxy): ${filename} -> ${remoteUrl}`);
            const response = await fetch(remoteUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`✅ Loaded remote: ${filename}`);
            return data;
        } catch (error) {
            console.error(`❌ Failed to fetch ${filename} (remote):`, error);
            // Surface a clear error so the caller can show UI feedback
            throw new Error(`Failed to fetch ${filename}: ${error.message}`);
        }
    }

    /**
     * Process center data
     */
    processCenters(data) {
        return data.map(center => ({
            Id: center.field_0,  // Main ID (GUID) - Add uppercase Id for V2 compatibility
            id: center.field_0,  // Main ID (GUID)
            sharePointId: center.ID,  // SharePoint list item numeric ID for hours/schedules/photos lookup
            Title: center.Title,  // Add Title for V2 compatibility
            name: center.field_1,
            shortName: center.Title,
            type: center.field_5,
            division: center.field_6,
            divisionCode: center.field_4,
            city: center.field_12,
            state: center.field_13,
            zip: center.field_14,
            latitude: center.field_15,
            longitude: center.field_16,
            websiteURL: center.field_21,
            centerType: center.field_22,
            corpName: center.field_10,
            gdosID: center.field_19,
            aboutText: center.AboutThisCenter || '',
            // Normalize scripture: handle object wrappers, rich text, or plain string
            scripture: (function() {
                const raw = center.FooterScriptureVerse || center.FooterScripture || center.Scripture || '';
                if (!raw) return '';
                // If SharePoint returns an expanded reference object with Value
                if (typeof raw === 'object' && raw.Value) return String(raw.Value).trim();
                // If it's HTML (rich text), strip tags
                if (typeof raw === 'string' && /<[^>]+>/.test(raw)) {
                    try {
                        const div = document.createElement('div');
                        div.innerHTML = raw;
                        return div.textContent.trim();
                    } catch (e) {
                        return raw.trim();
                    }
                }
                return String(raw).trim();
            })(),
            volunteerText: center.Volunteer_x002f_MentorSign_x002d || '',
            donationURL: center.DonationFormURL || '',
            signUpURL: center['OnlineSign_x002d_UpURL'] || '',
            facebookURL: center.FacebookPageURL || '',
            facilityFeatures: (center.FacilityFeatures || []).map(f => ({
                id: f.Id,
                name: f.Value
            })),
            featuredPrograms: (center.FeaturedPrograms || []).map(p => ({
                id: p.Id,
                name: p.Value
            })),
            status: center.Status?.Value || 'Draft',
            modified: center.Modified,
            version: center['{VersionNumber}']
        }));
    }

    /**
     * Process program schedules
     */
    processSchedules(data) {
        return data.map(schedule => ({
            id: schedule.ID,
            centerId: schedule['Center#Id'],
            title: schedule.CustomProgramScheduleTitle,
            status: schedule.Status?.Value || '',
            description: schedule.Narrative || schedule.Description || '',
            ageRange: schedule.AgeRange || '',
            cost: schedule.Cost || '',
            location: schedule.Location || '',
            contactInfo: schedule.ContactInfo || '',
            capacity: schedule.Capacity || '',
            prerequisites: schedule.Prerequisites || '',
            materialsProvided: schedule.MaterialsProvided || '',
            whatToBring: schedule.WhatToBring || '',
            registrationDeadline: schedule.RegistrationDeadline || '',
            registrationFee: schedule.RegistrationFee || '',
            dropOffPickUp: schedule.DropOffPickUp || '',
            videoEmbedCode: schedule.VideoEmbedCode || '',
            // Extract .Value from ScheduleDays array
            scheduleDays: (schedule.ScheduleDays || []).map(d => d.Value),
            scheduleTime: schedule.ScheduleTime,
            scheduleDisclaimer: schedule.ScheduleDisclaimer || '',
            timezone: schedule.Timezone?.Value || schedule.TimeZone?.Value || '',
            frequency: schedule.Frequency?.Value || '',
            // Extract .Value from ProgramRunsIn array
            programRunsIn: (schedule.ProgramRunsIn || []).map(m => m.Value),
            // Extract .Value from RegistrationTypicallyOpensin array
            registrationOpensIn: (schedule.RegistrationTypicallyOpensin || []).map(m => m.Value),
            relatedPrograms: (Array.isArray(schedule.RelatedProgram) ? schedule.RelatedProgram : []).map(p => ({
                id: p.Id,
                name: p.Value
            }))
        }));
    }

    /**
     * Process leaders/staff
     */
    processLeaders(data) {
        return data.map(leader => ({
            id: leader.ID,
            centerIds: leader['Center#Id'] || [],
            roleType: leader.RoleType?.Value || '',
            positionTitle: leader.PositionTitle,
            alternateName: leader.AlternateName,
            biography: leader.Biography,
            // Top-level image fields (many naming variants) to allow templates to prefer leader.imageURL
            imageURL: leader.ImageURL || leader.ImageUrl || leader.Image || leader.Photo || leader.PhotoURL || leader.Picture || null,
            // Preserve person object (if present)
            person: leader.Person ? {
                name: leader.Person.DisplayName,
                email: leader.Person.Email,
                picture: leader.Person.Picture || null,
                department: leader.Person.Department,
                title: leader.Person.JobTitle
            } : null
        }));
    }

    /**
     * Process photos
     */
    processPhotos(data) {
        return data.map(photo => ({
            id: photo.ID,
            centerId: photo['Center#Id'],
            title: photo.Title,
            urlExteriorPhoto: photo.URLExteriorPhoto || '',
            urlFacilityFeaturesPhoto: photo.URLFacilityFeaturesPhoto || '',
            urlProgramsPhoto: photo.URLProgramsPhoto || '',
            urlNearbyCentersPhoto: photo.URLNearbyCentersPhoto || '',
            urlParentsSectionPhoto: photo.URLParentsSectionPhoto || '',
            urlYouthSectionPhoto: photo.URLYouthSectionPhoto || '',
            urlGetInvolvedPhoto: photo.URLGetInvolvedPhoto || '',
            urlFooterPhoto: photo.URLFooterPhoto || ''
        }));
    }

    /**
     * Process hours
     */
    processHours(data) {
        return data.map(hours => ({
            id: hours.ID,
            centerId: hours['Center#Id'],
            regularTerm: hours.RegularHoursTerm?.Value || 'August - May',
            regularHours: {
                monday: hours.MondayRegularHours,
                tuesday: hours.TuesdayRegularHours,
                wednesday: hours.WednesdayRegularHours,
                thursday: hours.ThursdayRegularHours,
                friday: hours.FridayRegularHours,
                saturday: hours.SaturdayRegularHours,
                sunday: hours.SundayRegularHours
            },
            summerHours: {
                monday: hours.MondaySummerHours,
                tuesday: hours.TuesdaySummerHours,
                wednesday: hours.WednesdaySummerHours,
                thursday: hours.ThursdaySummerHours,
                friday: hours.FridaySummerHours,
                saturday: hours.SaturdaySummerHours,
                sunday: hours.SundaySummerHours
            }
        }));
    }

    /**
     * Process facility features reference data
     */
    processFacilities(data) {
        return data.map(facility => {
            // Normalize iconClass: remove any leading standalone 'bi' tokens to avoid duplicated classes
            const raw = facility.IconClass || '';
            const normalized = raw.toString().trim().replace(/^(?:bi\s+)+/i, '');
            return {
                id: facility.ID,
                name: facility.Title,
                description: facility.Description,
                iconClass: normalized
            };
        });
    }

    /**
     * Process programs reference data
     */
    processPrograms(data) {
        return data.map(program => {
            const raw = program.IconClass || '';
            const normalized = raw.toString().trim().replace(/^(?:bi\s+)+/i, '');
            return {
                id: program.ID,
                name: program.Title,
                category: program.Category?.Value || '',
                description: program.Description,
                iconClass: normalized
            };
        });
    }

    /**
     * Get all centers
     */
    getCenters() {
        return this.cache.centers || [];
    }

    /**
     * Get center by ID
     */
    getCenter(id) {
        return this.cache.centers?.find(c => c.id === id);
    }

    /**
     * Get data for a specific center
     */
    getCenterData(centerId) {
        const center = this.getCenter(centerId);
        if (!center) return null;

        console.log('🔍 getCenterData called with centerId:', centerId, 'Type:', typeof centerId);
        console.log('🔍 Center found:', center.name, 'Center.id:', center.id, 'Center.sharePointId:', center.sharePointId);

        // Get facility features with their details (including biClass for icons)
        const facilityFeatures = center.facilityFeatures.map(f => 
            this.cache.facilities.find(facility => facility.id === f.id)
        ).filter(Boolean).map(facility => ({
            ...facility,
            biClass: facility.iconClass || 'bi-check-circle'  // Map iconClass to biClass
        }));

        // Get program details
        const programDetails = center.featuredPrograms.map(p => 
            this.cache.featuredPrograms.find(program => program.id === p.id)
        ).filter(Boolean);

        // Find hours using SharePoint list item ID
        const hours = this.cache.hours.find(h => h.centerId == center.sharePointId);
        console.log('🔍 Hours lookup: center.sharePointId', center.sharePointId, 'Type:', typeof center.sharePointId, '| Found:', hours ? 'YES ✅' : 'NO ❌');
        if (!hours) {
            console.log('🔍 Sample hours centerIds:', this.cache.hours.slice(0, 5).map(h => `${h.centerId}(${typeof h.centerId})`).join(', '));
            console.log('🔍 All hours centerIds:', this.cache.hours.map(h => h.centerId).sort((a,b) => a-b).join(', '));
        }

        return {
            center,
            schedules: this.cache.schedules.filter(s => s.centerId === center.sharePointId),
            leaders: this.cache.leaders.filter(l => l.centerIds.includes(center.sharePointId)),
            photos: this.cache.photos.filter(p => p.centerId === center.sharePointId),
            hours,
            facilityFeatures,  // Use the mapped version with biClass
            facilityDetails: facilityFeatures,  // Alias for backward compatibility
            programDetails
        };
    }

    /**
     * Search centers
     */
    searchCenters(query) {
        const q = query.toLowerCase();
        return this.cache.centers.filter(c => 
            c.name.toLowerCase().includes(q) ||
            c.shortName.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.division.toLowerCase().includes(q)
        );
    }
}

// Create global instance
window.rsycData = new RSYCDataLoader();
