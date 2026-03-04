// Migration Report Reconciliation Server
// Compares SharePoint migration report JSON against mountaindew CMS database
// Territory: USA Southern Territory (idTerritory=58), Theme: Symphony Skin (idTheme=19)

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

const app = express();
const PORT = process.env.NODE_PORT ?? 3002;
const HOST = process.env.NODE_HOST ?? 'localhost';

// Enable CORS for Live Server (default ports: 5500, 5501)
app.use(cors({
    origin: [
        'http://localhost:5500', 'http://localhost:5501',
        'http://127.0.0.1:5500', 'http://127.0.0.1:5501',
        `http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`
    ],
    credentials: true
}));
app.use(express.json());

// Serve static files from same directory as server (src/)
app.use(express.static(__dirname));

// MySQL connection configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
};
if (process.env.MYSQL_SSL === 'true') {
    dbConfig.ssl = {};
}

const pool = mysql.createPool(dbConfig);

// GET /config – return port info consumed by the frontend
app.get('/config', (req, res) => {
    res.json({ apiPort: PORT, apiBaseUrl: `http://localhost:${PORT}` });
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/sql-pages
// Returns all documents from mountaindew scoped to:
//   site.fkValidTerritory = 58  (USA Southern Territory)
//   site.fkTheme           = 19  (Symphony Skin)
// Matching keys: site.site_path_root + document.document_url
// ──────────────────────────────────────────────────────────────────────────────
app.get('/api/sql-pages', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                d.idDocument,
                d.title            AS page_title,
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
                s.idSite,
                s.title            AS site_title,
                s.site_path_root
            FROM document d
            JOIN site s ON d.fkSite = s.idSite
            WHERE s.fkValidTerritory = 58
              AND s.fkTheme          = 19
              AND d.page_type NOT IN ('news', 'events')
              AND s.site_path_root NOT LIKE '%kroc%'
            ORDER BY s.title, d.document_url
        `);
        res.json(rows);
    } catch (error) {
        console.error('[sql-pages] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/sharepoint-data
// Reads the migration report JSON (DashboardData.json or custom SP_JSON_PATH).
// The JSON is two SharePoint lists combined (Corps + Metro Area).
// Returns the parsed array of records.
// ──────────────────────────────────────────────────────────────────────────────
app.get('/api/sharepoint-data', (req, res) => {
    // Default: two directories up from src/ → workspace root
    const jsonPath = process.env.SP_JSON_PATH
        ? path.resolve(__dirname, process.env.SP_JSON_PATH)
        : path.resolve(__dirname, '..', '..', 'DashboardData.json');

    try {
        if (!fs.existsSync(jsonPath)) {
            return res.status(404).json({ error: `SharePoint JSON not found at: ${jsonPath}` });
        }
        const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Normalize different possible export shapes
        let records;
        if (Array.isArray(raw)) {
            records = raw;
        } else if (raw.value && Array.isArray(raw.value)) {
            records = raw.value;
        } else {
            // Collect all top-level arrays and merge (corps + metro pattern)
            records = Object.values(raw)
                .filter(v => Array.isArray(v))
                .reduce((acc, arr) => acc.concat(arr), []);
        }

        res.json({ records, total: records.length, source: jsonPath });
    } catch (error) {
        console.error('[sharepoint-data] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`\n Migration Report Reconciliation Server`);
    console.log(` Running at: http://${HOST}:${PORT}`);
    console.log(` Dashboard:  http://${HOST}:${PORT}/index.html\n`);
});
