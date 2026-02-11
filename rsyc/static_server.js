const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', req.url.split('?')[0]);
  if (req.url === '/' || req.url === '') {
    filePath = path.join(__dirname, '..', 'rsyc', 'rsyc-profile-publisher.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml'
    };
    res.setHeader('Content-Type', map[ext] || 'text/plain');
    res.end(data);
  });
});

server.listen(port, () => console.log(`Static server running at http://localhost:${port}/`));

// Graceful shutdown
process.on('SIGINT', () => { server.close(()=>process.exit()); });
