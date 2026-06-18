const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '.')));

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
  console.log(`✓ Dashboard available at http://localhost:${PORT}/Site-Migration-Dashboard.html\n`);
});
