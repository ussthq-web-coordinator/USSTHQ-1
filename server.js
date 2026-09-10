const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// This is a *development* server — the whole point is that what you see always
// matches what's on disk. Tell every response to never cache, and disable the
// ETag/Last-Modified conditional-request machinery too (otherwise a browser can
// still get a "304 Not Modified" shortcut and reuse a stale cached body). No more
// hard-refreshing or bumping a cache-busting query string after every edit.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '.'), {
  etag: false,
  lastModified: false,
  cacheControl: false
}));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// For any route not matched, try to serve as static file first, then fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✓ Dev server running at http://localhost:${PORT}`);
  console.log(`✓ Dashboard available at http://localhost:${PORT}/Site-Migration-Dashboard.html`);
  console.log(`✓ Caching disabled — every request always serves the latest file from disk\n`);
});
