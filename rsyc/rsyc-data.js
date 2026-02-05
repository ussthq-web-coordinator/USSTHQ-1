/**
 * RSYC Data Loader
 * Fetches and caches all JSON data from SharePoint
 */

class RSYCDataLoader {
    constructor() {
        // CORS / fetch configuration
        // By default we prefer trying the direct URL first. If that fails due to CORS
        // restrictions we fall back to the configured proxy. You can disable the
        // proxy by setting `useCorsProxy` to false (and make sure your server
        // sends Access-Control-Allow-Origin headers for the publisher origin).
        this.corsProxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/get?url='
        ];
        this.currentProxyIndex = 0;
        this.baseURL = 'https://thisishoperva.org/rsyc/';
        this.useCorsProxy = true;          // Enable proxy fallback for cross-origin requests
        this.tryDirectFirst = true;      // attempt direct fetch before using proxy
        
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
     * Load ONLY critical data (centers + hours) for fast initial render
     */
    async loadCriticalData() {
        if (this.cache.centers && this.cache.hours) {
            return; // Already loaded
        }

        try {
            console.log('⚡ Loading critical data...');
            
            const [centers, hours] = await Promise.all([
                this.fetchJSON('units-rsyc-profiles.json').catch(e => {
                    console.error('Failed to load centers:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCHours.json').catch(e => {
                    console.warn('Hours data unavailable:', e.message);
                    return [];
                })
            ]);

            this.cache.centers = this.processCenters(centers);
            this.cache.hours = this.processHours(hours);
            this.cache.lastUpdated = new Date();

            // Auto-populate CENTER_IDS from loaded data
            if (typeof window.populateCenterIDs === 'function') {
                window.populateCenterIDs(this.cache.centers);
            }

            console.log('⚡ Critical data loaded:', {
                centers: this.cache.centers.length,
                hours: this.cache.hours.length
            });
        } catch (error) {
            console.error('❌ Error loading critical data:', error);
            throw error;
        }
    }

    /**
     * Load optional data (schedules, programs, staff, facilities, photos)
     */
    async loadOptionalData() {
        // Skip if already loaded
        if (this.cache.schedules && this.cache.schedules.length > 0) {
            return;
        }

        try {
            console.log('📦 Loading optional data...');
            
            const [schedules, leaders, facilities, featuredPrograms, photos] = await Promise.all([
                this.fetchJSON('RSYCProgramSchedules.json').catch(e => {
                    console.warn('Schedules data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCLeaders.json').catch(e => {
                    console.warn('Leaders data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCFacilityFeatures.json').catch(e => {
                    console.warn('Facilities data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCPrograms.json').catch(e => {
                    console.warn('Programs data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCHomepagePhotos.json').catch(e => {
                    console.warn('Photos unavailable, using defaults:', e.message);
                    return [];
                })
            ]);

            this.cache.schedules = this.processSchedules(schedules);
            this.cache.leaders = this.processLeaders(leaders);
            this.cache.facilities = this.processFacilities(facilities);
            this.cache.featuredPrograms = this.processPrograms(featuredPrograms);
            this.cache.photos = this.processPhotos(photos);

            console.log('📦 Optional data loaded:', {
                schedules: this.cache.schedules.length,
                leaders: this.cache.leaders.length,
                photos: this.cache.photos.length,
                facilities: this.cache.facilities.length,
                programs: this.cache.featuredPrograms.length
            });
        } catch (error) {
            console.warn('⚠️ Error loading optional data:', error);
            // Don't throw - optional data failing shouldn't break the profile
        }
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
            // Some files may be empty or missing - that's OK
            const [centers, schedules, leaders, hours, facilities, featuredPrograms] = await Promise.all([
                this.fetchJSON('units-rsyc-profiles.json').catch(e => {
                    console.error('Failed to load centers:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCProgramSchedules.json').catch(e => {
                    console.warn('Schedules data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCLeaders.json').catch(e => {
                    console.warn('Leaders data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCHours.json').catch(e => {
                    console.warn('Hours data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCFacilityFeatures.json').catch(e => {
                    console.warn('Facilities data unavailable:', e.message);
                    return [];
                }),
                this.fetchJSON('RSYCPrograms.json').catch(e => {
                    console.warn('Programs data unavailable:', e.message);
                    return [];
                })
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

            // Auto-populate CENTER_IDS from loaded data
            if (typeof window.populateCenterIDs === 'function') {
                window.populateCenterIDs(this.cache.centers);
            }

            console.log('✅ Data loaded successfully:', {
                centers: this.cache.centers.length,
                schedules: this.cache.schedules.length,
                leaders: this.cache.leaders.length,
                photos: this.cache.photos.length,
                hours: this.cache.hours.length,
                facilities: this.cache.facilities.length,
                programs: this.cache.featuredPrograms.length
            });

            return {
                centers: this.cache.centers,
                schedules: this.cache.schedules,
                leaders: this.cache.leaders,
                photos: this.cache.photos,
                hours: this.cache.hours,
                facilities: this.cache.facilities,
                programs: this.cache.featuredPrograms,
                lastUpdated: this.cache.lastUpdated
            };
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
        const directUrl = this.baseURL + filename;
        
        // Use local proxy if we're running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const proxyUrl = isLocalhost ? `/api/cors-proxy?url=${encodeURIComponent(directUrl)}` : directUrl;

        // Helper to fetch and parse JSON, with nice error messages
        const doFetch = async (url, label, isProxy = false) => {
            try {
                console.log(`📥 Fetching ${label}: ${filename} -> ${url}`);
                const resp = await fetch(url, { mode: 'cors' });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                
                let json = await resp.json();
                
                // Handle allorigins.win response format (wraps content)
                if (isProxy && json && json.contents) {
                    // allorigins returns JSON as string in 'contents' property
                    if (typeof json.contents === 'string') {
                        json = JSON.parse(json.contents);
                    } else {
                        json = json.contents;
                    }
                }
                
                console.log(`✅ Loaded ${label}: ${filename}`);
                return json;
            } catch (err) {
                // Re-throw so caller can decide fallback
                throw err;
            }
        };

        // Try proxy first if on localhost
        if (isLocalhost) {
            try {
                return await doFetch(proxyUrl, 'local-proxy', true);
            } catch (err) {
                console.warn(`⚠️ Local proxy fetch failed for ${filename}:`, err.message);
                // fall through to direct
            }
        }

        // Try direct fetch first, trying without CORS restrictions first
        if (this.tryDirectFirst) {
            try {
                // Try with standard CORS
                return await doFetch(directUrl, 'direct', false);
            } catch (err) {
                console.warn(`⚠️ Direct fetch failed for ${filename}:`, err.message);
                // fall through to proxy
            }
        }

        // If direct failed, try with corsproxy.io which handles CORS
        if (this.useCorsProxy && this.corsProxies && this.corsProxies.length > 0) {
            for (let i = 0; i < this.corsProxies.length; i++) {
                const corsProxy = this.corsProxies[i];
                try {
                    let proxied = corsProxy + encodeURIComponent(directUrl);
                    console.log(`🔄 Trying CORS proxy ${i + 1}/${this.corsProxies.length} for ${filename}`);
                    const result = await doFetch(proxied, `cors-proxy-${i + 1}`, true);
                    console.log(`✅ Successfully fetched via CORS proxy ${i + 1}`);
                    return result;
                } catch (err) {
                    console.warn(`⚠️ CORS proxy ${i + 1} failed for ${filename}:`, err.message);
                    // Continue to next proxy
                }
            }
        }

        // If we get here, all methods failed
        throw new Error(`Failed to fetch ${filename}: direct fetch blocked by CORS. Enable CORS headers on https://thisishoperva.org or configure a backend proxy.`);
    }

    /**
     * Process center data
     */
    processCenters(data) {
        return data.map(center => ({
            Id: center.ID,  // Main ID (integer) - Use the numeric ID, not the GUID
            id: center.ID,  // Main ID (integer)
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
            explainerVideoEmbedCode: center.ExplainerVideoEmbedCode || '',
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
        return data.map((schedule) => {
            // Helper to safely extract subtitle-like fields from several possible keys
            const rawSubtitle = schedule.CustomProgramScheduleSubtitle || schedule.CustomProgramScheduleSubTitle || schedule.ScheduleSubtitle || schedule.Subtitle || schedule.CustomSubtitle || '';
            const subtitle = (function(v) {
                if (!v) return '';
                if (typeof v === 'object' && v.Value) return String(v.Value).trim();
                return String(v).trim();
            })(rawSubtitle);

            // Normalize schedule days to array of strings (already mapping .Value in many cases)
            const scheduleDays = (schedule.ScheduleDays || []).map(d => d.Value);

            // Compute first day index (Monday=1 ... Sunday=7). If no days, use 99.
            const dayOrder = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
            let firstDayIndex = 99;
            if (Array.isArray(scheduleDays) && scheduleDays.length > 0) {
                for (const d of scheduleDays) {
                    if (!d) continue;
                    const low = String(d).toLowerCase();
                    // match by full name or first 3 letters
                    for (const [name, idx] of Object.entries(dayOrder)) {
                        if (low.includes(name) || low.startsWith(name.slice(0,3))) {
                            firstDayIndex = Math.min(firstDayIndex, idx);
                        }
                    }
                }
            }

            // Parse start time in minutes from schedule.ScheduleTime (e.g. "8:30 AM - 10:00 AM").
            // Improve parsing by inheriting AM/PM from a later token in ranges like "2:30-6:30 pm".
            // Default to end-of-day so schedules without a time sort after those with explicit start times.
            let timeMinutes = 24 * 60; // 1440 minutes
            const rawTime = schedule.ScheduleTime || schedule.scheduleTime || '';
            if (rawTime && typeof rawTime === 'string') {
                const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/g;
                const matches = [];
                let mm;
                while ((mm = timeRegex.exec(rawTime)) !== null) {
                    matches.push(mm);
                }
                if (matches.length > 0) {
                    const first = matches[0]; // first time token
                    // Determine am/pm: prefer first token's AM/PM, otherwise inherit from a later token that has it
                    let ampm = first[3] ? first[3].toLowerCase() : null;
                    if (!ampm) {
                        for (let i = 1; i < matches.length; i++) {
                            if (matches[i][3]) { ampm = matches[i][3].toLowerCase(); break; }
                        }
                    }

                    let hours = parseInt(first[1], 10);
                    const minutes = first[2] ? parseInt(first[2], 10) : 0;
                    if (ampm === 'pm' && hours < 12) hours += 12;
                    if (ampm === 'am' && hours === 12) hours = 0;
                    timeMinutes = (hours * 60) + minutes;
                }
            }

            // Parse explicit start/end dates if present in a few common field names.
            // Accept strings like '2025-06-01', '6/1/2025', or ISO timestamps. Fall back to null.
            const parseDateCandidate = (v) => {
                if (!v) return null;
                try {
                    // If it's an object with .Value or .Date
                    if (typeof v === 'object') {
                        v = v.Value || v.Date || JSON.stringify(v) || '';
                    }
                    const s = String(v).trim();
                    if (!s) return null;
                    // Use Date.parse which handles ISO and many common formats
                    const t = Date.parse(s);
                    if (!isNaN(t)) return t;
                    // Try swapping month/day if ambiguous (MM/DD vs DD/MM) - naive: try US MM/DD first already handled
                    return null;
                } catch (e) {
                    return null;
                }
            };

            // Look for likely start/end fields in the incoming schedule object
            const startCandidates = [schedule.StartDate, schedule.Start, schedule.EffectiveStart, schedule.Start_x0020_Date, schedule.StartDateTime, schedule['Start Date'], schedule['Start_Date']];
            const endCandidates = [schedule.EndDate, schedule.End, schedule.EffectiveEnd, schedule.End_x0020_Date, schedule.EndDateTime, schedule['End Date'], schedule['End_Date']];
            let startTs = null;
            let endTs = null;
            for (const cand of startCandidates) {
                const v = parseDateCandidate(cand);
                if (v) { startTs = v; break; }
            }
            for (const cand of endCandidates) {
                const v = parseDateCandidate(cand);
                if (v) { endTs = v; break; }
            }

            return {
                id: schedule.ID,
                centerId: schedule['Center#Id'],
                title: schedule.CustomProgramScheduleTitle,
                subtitle: subtitle,
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
                scheduleDays: scheduleDays,
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
                })),
                // Internal helper fields for sorting
                _firstDayIndex: firstDayIndex,
                _timeMinutes: timeMinutes,
                // optional explicit timestamps (ms since epoch) for sorting by date range
                _startTimestamp: startTs,
                _endTimestamp: endTs
            };
        });
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
                urlFooterPhoto: photo.URLFooterPhoto || '',
                // Optional: focal point for footer photo. New field added to RSYCHomepagePhotos.json
                // Accepts values like 'Top', 'Center', 'Bottom' (case-insensitive). Keep as string for templates to consume.
                // Be robust: check several likely key names and nested .Value variants.
                footerPhotoFocus: (function() {
                    try {
                        if (!photo || typeof photo !== 'object') return '';
                        // Candidate keys to consider (case-insensitive)
                        const keys = Object.keys(photo);
                        const match = keys.find(k => /footer.*focus|urlfooterphotofocus|focalpoint|focal|verticalfocus|focusvertical|footerfocus|footertop|footerbottom|focus$/i.test(k));
                        let val = '';
                        if (match) {
                            val = photo[match]?.Value ?? photo[match];
                        } else {
                            // common explicit fallbacks
                            val = photo.FooterPhotoFocus?.Value || photo.FooterPhotoFocus || photo.URLFooterPhotoFocus || photo.Focus || photo.FocalPoint || photo.focalPoint || '';
                        }
                        return (val || '').toString().trim();
                    } catch (e) {
                        return '';
                    }
                })()
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
        // Handle both string and number IDs - convert to number for comparison
        const numericId = Number(id);
        return this.cache.centers?.find(c => c.id === numericId || c.Id === numericId);
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
        // Handle case where facilities data hasn't loaded yet (critical-data-only mode)
        const facilityFeatures = (this.cache.facilities || []).length > 0
            ? center.facilityFeatures.map(f => 
                this.cache.facilities.find(facility => facility.id === f.id)
              ).filter(Boolean).map(facility => ({
                ...facility,
                biClass: facility.iconClass || 'bi-check-circle'  // Map iconClass to biClass
              }))
            : [];

        // Get program details
        const programDetails = (this.cache.featuredPrograms || []).length > 0
            ? center.featuredPrograms.map(p => 
                this.cache.featuredPrograms.find(program => program.id === p.id)
              ).filter(Boolean)
            : [];

        // Find hours using SharePoint list item ID
        const hours = this.cache.hours.find(h => h.centerId == center.sharePointId);
        console.log('🔍 Hours lookup: center.sharePointId', center.sharePointId, 'Type:', typeof center.sharePointId, '| Found:', hours ? 'YES ✅' : 'NO ❌');
        if (!hours) {
            console.log('🔍 Sample hours centerIds:', this.cache.hours.slice(0, 5).map(h => `${h.centerId}(${typeof h.centerId})`).join(', '));
            console.log('🔍 All hours centerIds:', this.cache.hours.map(h => h.centerId).sort((a,b) => a-b).join(', '));
        }

        // Filter and sort schedules: primary by first day index, secondary by start time
        const schedulesForCenter = (this.cache.schedules || [])
            .filter(s => s.centerId === center.sharePointId)
            .slice(); // copy to avoid mutating cache

        // Sort schedules considering explicit start dates when available. Order:
        // 1) Explicit start timestamp (earlier first) if present for both; a schedule with a start date
        //    sorts before one without.
        // 2) Program run month proximity (keeps seasonal relevance)
        // 3) Start day of week (_firstDayIndex)
        // 4) Start time (_timeMinutes)
        // 5) Final tie-breaker: shorter schedule (fewer days) first
        schedulesForCenter.sort((a, b) => {
            const aStart = Number.isFinite(a._startTimestamp) ? a._startTimestamp : null;
            const bStart = Number.isFinite(b._startTimestamp) ? b._startTimestamp : null;
            if (aStart && bStart) {
                if (aStart !== bStart) return aStart - bStart;
            } else if (aStart && !bStart) {
                // schedules with explicit starts come before those without
                return -1;
            } else if (!aStart && bStart) {
                return 1;
            }

            // Month proximity metric (reuse same logic as templates: compute earliest month distance)
            const monthOrder = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const getEarliestMonth = (schedule) => {
                if (!schedule.programRunsIn || schedule.programRunsIn.length === 0) return 999;
                const monthIndices = schedule.programRunsIn.map(m => monthOrder.indexOf(m)).filter(i => i !== -1);
                if (monthIndices.length === 0) return 999;
                let minDistance = 999;
                const currentMonth = new Date().getMonth();
                for (const monthIdx of monthIndices) {
                    let distance = monthIdx - currentMonth;
                    if (distance < 0) distance += 12;
                    if (distance < minDistance) minDistance = distance;
                }
                return minDistance;
            };

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

            // As last measure, compare end timestamps (so shorter/ending sooner shows earlier)
            const aEnd = Number.isFinite(a._endTimestamp) ? a._endTimestamp : null;
            const bEnd = Number.isFinite(b._endTimestamp) ? b._endTimestamp : null;
            if (aEnd && bEnd) return aEnd - bEnd;
            if (aEnd && !bEnd) return -1;
            if (!aEnd && bEnd) return 1;

            return 0;
        });

        return {
            center,
            schedules: schedulesForCenter,
            leaders: (this.cache.leaders || []).filter(l => l.centerIds.includes(center.sharePointId)),
            photos: (this.cache.photos || []).filter(p => p.centerId === center.sharePointId),
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

// Export class to global scope
window.RSYCDataLoader = RSYCDataLoader;

// Create global instance
window.rsycData = new RSYCDataLoader();
