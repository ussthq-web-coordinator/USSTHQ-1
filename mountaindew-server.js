// Mountain Dew Server - Version 2.1 (JSON Extraction Fix)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve the HTML file
app.use(express.static(__dirname));

// MySQL connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root', // Change to your MySQL username
    password: 'Updatedpassword', // Change to your MySQL password
    database: 'mountaindew',
    charset: 'utf8mb4'
};

const [rows] = await connection.query('SELECT VERSION() AS version');
console.log(rows[0].version);

await connection.end();

// Create connection pool
const pool = mysql.createPool(dbConfig);

// API endpoint to get all territories
app.get('/api/mountaindew/territories', async (req, res) => {
    try {
        const { themeId } = req.query;
        
        let query = `
            SELECT DISTINCT vt.idTerritory, vt.territory_code, vt.territory_name
            FROM validterritory vt
        `;
        
        const params = [];
        
        if (themeId) {
            query += `
                INNER JOIN site s ON (vt.idTerritory = s.fkValidTerritory)
                LEFT JOIN site_territory_search sts ON s.idSite = sts.fkSite
                WHERE s.fkTheme = ? OR (sts.fkTerritory = vt.idTerritory AND s.fkTheme = ?)
            `;
            params.push(themeId, themeId);
        }
        
        query += ` ORDER BY vt.territory_name`;
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching territories:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get all themes
app.get('/api/mountaindew/themes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT idTheme, theme_name, theme_template_name
            FROM theme
            ORDER BY theme_name
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching themes:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get all sites
app.get('/api/mountaindew/sites', async (req, res) => {
    try {
        const { territoryId, themeId } = req.query;
        
        let query = `
            SELECT DISTINCT s.idSite, s.title, s.site_path_root, s.description, s.fkValidTerritory, s.fkTheme, s.oidc_group_mapping
            FROM site s
        `;
        
        const params = [];
        const conditions = [];
        
        if (territoryId) {
            query += ` LEFT JOIN site_territory_search sts ON s.idSite = sts.fkSite`;
            conditions.push(`(sts.fkTerritory = ? OR s.fkValidTerritory = ?)`);
            params.push(territoryId, territoryId);
        }
        
        if (themeId) {
            conditions.push(`s.fkTheme = ?`);
            params.push(themeId);
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        
        query += ` ORDER BY s.title`;
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get documents by site
app.get('/api/mountaindew/documents', async (req, res) => {
    try {
        const { siteId } = req.query;
        
        let query = `
            SELECT 
                d.idDocument,
                d.title,
                d.document_url,
                d.fkSite,
                d.published,
                d.page_type,
                d.date_modified,
                d.date_created,
                d.last_updater,
                d.description,
                d.redirect_external_url,
                d.deletion_date,
                s.title as site_title,
                s.site_path_root
            FROM document d
            JOIN site s ON d.fkSite = s.idSite
        `;
        
        const params = [];
        if (siteId) {
            query += ' WHERE d.fkSite = ?';
            params.push(siteId);
        }
        
        query += ' ORDER BY d.date_modified DESC';
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get properties for a document
app.get('/api/mountaindew/properties', async (req, res) => {
    try {
        const { documentId, siteId } = req.query;
        console.log(`[Properties API] Request for documentId: ${documentId} (Site: ${siteId || 'Global Search'})`);
        
        if (!documentId) {
            return res.status(400).json({ error: 'documentId is required' });
        }

        // 1. Get the document metadata first
        let docRows;
        try {
            let docQuery = `
                SELECT 
                    d.idDocument, d.title, d.document_url, d.fkSite, d.published, d.page_type, 
                    d.date_modified, d.date_created, d.last_updater, d.description, d.content, d.redirect_external_url, d.custom_head_content, d.deletion_date,
                    s.title as site_title, s.site_path_root 
                FROM mountaindew.document d
                JOIN mountaindew.site s ON d.fkSite = s.idSite
                WHERE d.idDocument = ?
            `;
            const docParams = [documentId];

            // CRITICAL: If siteId is provided, strictly enforce it to avoid non-unique idDocument collisions
            if (siteId && siteId !== '0' && siteId !== '') {
                docQuery += ` AND d.fkSite = ?`;
                docParams.push(siteId);
            }

            [docRows] = await pool.query(docQuery, docParams);
        } catch (dbErr) {
            console.error('[Properties API] Database error fetching document:', dbErr);
            throw new Error(`Database error: ${dbErr.message}`);
        }

        if (!docRows || docRows.length === 0) {
            console.warn(`[Properties API] Document ${documentId} not found for Site ${siteId || 'ANY'}`);
            return res.json({ properties: [], document: null });
        }

        // If multiple documents matched (rare but possible if idDocument is not unique across sites),
        // we use the first one from the list.
        const docDetails = docRows[0];
        const actualSiteId = docDetails.fkSite;

        console.log(`[Properties API] Verified Document ${documentId} belongs to Site ${actualSiteId} (${docDetails.site_title})`);

        let propRegistry = [];
        try {
            const raw = docDetails.custom_head_content;
            if (raw) {
                let custom;
                try {
                    custom = typeof raw === 'string' ? JSON.parse(raw) : raw;
                } catch (e) {
                    // Fail gracefully if custom_head_content is not valid JSON
                    console.warn('[Properties API] custom_head_content is not valid JSON, trying regex rescue');
                    const match = raw.match(/"properties"\s*:\s*(\[.*?\])/s);
                    if (match) {
                        try { custom = { properties: JSON.parse(match[1]) }; } catch(ee) {}
                    }
                }
                
                // Handle various manifest formats (document.properties, document.details.properties, or just the array)
                let propsVal = null;
                if (Array.isArray(custom)) {
                    propsVal = custom;
                } else if (custom && typeof custom === 'object') {
                    propsVal = custom.properties || (custom.details && custom.details.properties);
                }

                if (typeof propsVal === 'string') {
                    try { propsVal = JSON.parse(propsVal); } catch (e) { }
                }
                
                if (Array.isArray(propsVal)) {
                    propRegistry = propsVal;
                }
            }
        } catch (e) {
            console.warn('[Properties API] Metadata parse failed (continuing):', e.message);
        }

        // Remove duplicates and nulls from registry before processing
        propRegistry = propRegistry.filter((v, i, a) => v && a.indexOf(v) === i);

        console.log(`[Properties API] Registry found ${propRegistry.length} properties for document ${documentId}`);

        // 2. Fetch all properties for this SPECIFIC site AND any properties explicitly in the manifest (Master/DHQ)
        let dbRows;
        try {
            const regIds = propRegistry.map(reg => {
                if (typeof reg === 'string') return reg;
                return reg.id || reg.details?.id || reg.idSiteProperty;
            }).filter(id => id && String(id).length > 5);

            let query = `
                SELECT id, fkSite, name, value
                FROM mountaindew.site_property
                WHERE fkSite = ?
            `;
            const queryParams = [actualSiteId];

            if (regIds.length > 0) {
                query += ` OR id IN (?)`;
                queryParams.push(regIds);
            }

            [dbRows] = await pool.query(query, queryParams);
        } catch (dbErr) {
            console.error('[Properties API] Database error fetching properties:', dbErr);
            throw new Error(`Database error: ${dbErr.message}`);
        }

        console.log(`[Properties API] Found ${dbRows ? dbRows.length : 0} candidate properties. Filtering for document manifest...`);

        // Process rows in JS to handle potential JSON errors per-row and preserve all fields
        const processRows = (rowsToProcess) => {
            return (rowsToProcess || []).map(r => {
                let val = {};
                let parseError = null;
                try {
                    if (r && r.value) {
                        let cleanedValue = String(r.value).trim();
                        if (cleanedValue.startsWith('<?xml') || (cleanedValue.startsWith('<') && cleanedValue.includes('>'))) {
                             val = { text_html: cleanedValue, recovered_from_xml: true };
                        } else if (cleanedValue.match(/^[a-f0-9-]{12,}$/i)) {
                             val = { text: cleanedValue };
                        } else {
                            try {
                                val = JSON.parse(cleanedValue);
                            } catch (e1) {
                                const match = cleanedValue.match(/(\{.*\}|\[.*\])/s);
                                if (match) {
                                    try { val = JSON.parse(match[0]); } catch (e2) { throw e1; }
                                } else { val = { text: cleanedValue }; }
                            }
                        }
                    }
                } catch (e) {
                    parseError = e.message;
                    if (r.value && (r.value.includes('<') || r.value.length > 5)) {
                        val = { text_html: r.value };
                    } else if (r.value) {
                        val = { text: r.value };
                    }
                }
                
                const isValObject = val !== null && typeof val === 'object' && !Array.isArray(val);
                const rawVisible = isValObject && val.visible !== undefined ? val.visible : true;
                const isVisible = rawVisible === true || rawVisible === 'true' || rawVisible === 1 || rawVisible === '1';

                return {
                    ...(isValObject ? val : {}),
                    id: r.id,
                    fkSite: r.fkSite,
                    db_name: r.name,
                    parse_error: parseError,
                    recovered_content: !!(isValObject && (val.recovered_from_xml || val.text)),
                    visible: isVisible,
                    text_html: isValObject ? (val.text || val.text_html || val.content || val.html || (parseError ? r.value : null)) : (parseError ? r.value : null),
                    objects_array: isValObject ? (val.objects ? JSON.stringify(val.objects) : (val.objects_array ? JSON.stringify(val.objects_array) : null)) : null,
                    full_json_value: r.value
                };
            });
        };

        const rows = processRows(dbRows);
        
        // 3. Filter and Enrich: Only return properties that are in the manifest
        const matchedDbIds = new Set();
        const enrichedRows = propRegistry.map((reg, idx) => {
            if (!reg) return null;
            if (typeof reg === 'string') reg = { id: reg };

            const regId = String(reg.id || reg.details?.id || reg.idSiteProperty || '');
            const regName = reg.name || reg.details?.name || reg.type || '';
            const targetId = regId.toLowerCase();
            const targetName = regName.toLowerCase();
            const targetLabel = String(reg.label || '').toLowerCase();
            
            // Find matching database row from the candidate list
            // We must prefer the version that belongs to the CURRENT site to avoid "cloned ID" collisions
            const matches = rows.filter(dbRow => {
                const dbId = String(dbRow.id).toLowerCase();
                const dbName = String(dbRow.db_name || '').toLowerCase();

                // STRICT MATCHING: If the manifest provides a UUID-like ID, we MUST match that ID.
                // We intentionally disable fuzzy name matching in this case to prevent "incorrect relations".
                // Typical ID length is 32 chars (hex), so length > 10 catches UUIDs while ignoring short matches or titles.
                if (regId && regId.length > 10) { 
                    return dbId === targetId;
                }

                // If no specific ID, try fuzzy name matching
                const nameMatch = (regName || regId) && (
                    dbName === targetName || 
                    dbName === targetLabel ||
                    dbName === targetId ||
                    dbName === targetId.replace(/-/g, ' ') ||
                    dbName.replace(/-/g, ' ') === targetId.replace(/-/g, ' ')
                );
                return nameMatch;
            });

            // Filter out matches that have already been assigned to a previous manifest entry
            // This prevents "Duplicate/Incorrect Relation" issues where a generic name match
            // causes the same DB property to be assigned to multiple manifest entries.
            const availableMatches = matches.filter(m => !matchedDbIds.has(String(m.id)));

            // Priority Selection on AVAILABLE matches:
            // 1. Exact ID match on the CURRENT site
            // 2. Name/Label match on the CURRENT site
            // 3. Fallback to any ID match (could be template/global)
            let r = availableMatches.find(m => m.fkSite === actualSiteId && String(m.id).toLowerCase() === targetId) ||
                      availableMatches.find(m => m.fkSite === actualSiteId) ||
                      availableMatches.find(m => String(m.id).toLowerCase() === targetId) ||
                      availableMatches[0];
            
            // Fallback: If no available match, but we had ID matches that were used, checking if we *really* should have reused them?
            // Current user request implies NO reuse. So we stick with r (which comes from availableMatches).
            
            const manifestTitle = reg.details?.title || reg.title || reg.label || null;
            const manifestType = regName || 'unknown';
            let pos = reg.idx;
            if (reg.details && reg.details.idx !== undefined) pos = reg.details.idx;
            if (pos === undefined) pos = idx;

            let mActive = reg.active;
            if (mActive === undefined) mActive = reg.details?.active;
            if (mActive === undefined) mActive = true;
            const manifestActive = mActive === true || mActive === 'true' || mActive === 1 || mActive === '1';

            // SPECIAL CASE: Page Details always comes from Document Content
            if (manifestTitle === 'Page Details' || manifestType === 'Page Details' || regId === '1706889331994') {
                return {
                    id: regId || 'page-details',
                    db_name: 'Page Details',
                    property_type: 'Page Details',
                    position: pos,
                    manifest_active: manifestActive,
                    manifest_title: 'Page Details',
                    is_syndicated: false,
                    text_html: docDetails.content || '<p><em>No content available in document.content</em></p>',
                    fkSite: docDetails.fkSite
                };
            }

            if (r) {
                matchedDbIds.add(String(r.id));
                return {
                    ...r,
                    position: pos,
                    property_type: manifestType,
                    manifest_active: manifestActive,
                    manifest_title: manifestTitle,
                    is_syndicated: false
                };
            } else {
                // Return "Syndicated" placeholder for items in manifest but not in DB
                return {
                    id: regId || `reg-${idx}`,
                    db_name: regName || 'syndicated',
                    property_type: manifestType,
                    position: pos,
                    manifest_active: manifestActive,
                    manifest_title: manifestTitle || 'Syndicated Property',
                    is_syndicated: true,
                    text_html: null,
                    full_json_value: JSON.stringify(reg)
                };
            }
        }).filter(Boolean);

        // 4. Sort properties by position
        enrichedRows.sort((a, b) => a.position - b.position);
        
        res.json({
            properties: enrichedRows,
            document: {
                idDocument: docDetails.idDocument,
                title: docDetails.title,
                document_url: docDetails.document_url,
                fkSite: docDetails.fkSite,
                published: docDetails.published,
                page_type: docDetails.page_type,
                date_modified: docDetails.date_modified,
                date_created: docDetails.date_created,
                last_updater: docDetails.last_updater,
                description: docDetails.description,
                content: docDetails.content,
                redirect_external_url: docDetails.redirect_external_url,
                custom_head_content: docDetails.custom_head_content,
                deletion_date: docDetails.deletion_date,
                site_title: docDetails.site_title,
                site_path_root: docDetails.site_path_root,
                site_deletion_date: docDetails.site_deletion_date
            }
        });
    } catch (error) {
        console.error('[Properties API] Fatal Error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Mountain Dew Property Viewer running at http://localhost:${PORT}`);
    console.log(`Open mountaindew-property-viewer.html in your browser`);
});
