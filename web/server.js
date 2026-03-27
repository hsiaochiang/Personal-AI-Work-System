const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Allowed API file paths (whitelist)
const ALLOWED_PATHS = {
  '/api/roadmap': 'docs/roadmap.md',
  '/api/current-task': 'docs/handoff/current-task.md',
};

// Allowed directory for memory listing
const MEMORY_DIR = path.join(PROJECT_ROOT, 'docs', 'memory');

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

function handleAPI(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Specific file endpoints
  if (ALLOWED_PATHS[url.pathname]) {
    const filePath = path.join(PROJECT_ROOT, ALLOWED_PATHS[url.pathname]);
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        sendJSON(res, 404, { error: 'File not found' });
        return;
      }
      sendJSON(res, 200, { content, path: ALLOWED_PATHS[url.pathname] });
    });
    return true;
  }

  // Memory listing endpoint
  if (url.pathname === '/api/memory') {
    fs.readdir(MEMORY_DIR, (err, files) => {
      if (err) {
        sendJSON(res, 500, { error: 'Cannot read memory directory' });
        return;
      }
      const mdFiles = files.filter(f => f.endsWith('.md'));
      const results = [];
      let pending = mdFiles.length;
      if (pending === 0) {
        sendJSON(res, 200, { files: [] });
        return;
      }
      mdFiles.forEach(file => {
        fs.readFile(path.join(MEMORY_DIR, file), 'utf-8', (err2, content) => {
          results.push({
            filename: file,
            content: err2 ? '' : content,
          });
          pending--;
          if (pending === 0) {
            results.sort((a, b) => a.filename.localeCompare(b.filename));
            sendJSON(res, 200, { files: results });
          }
        });
      });
    });
    return true;
  }

  return false;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // API routes
  if (url.pathname.startsWith('/api/')) {
    if (handleAPI(req, res)) return;
    sendJSON(res, 404, { error: 'Unknown API endpoint' });
    return;
  }

  // Static files
  let filePath = path.join(PUBLIC_DIR, url.pathname);
  if (url.pathname === '/' || url.pathname === '') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  // Prevent directory traversal
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(resolved, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try adding .html
      if (!path.extname(resolved)) {
        serveStaticFile(res, resolved + '.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
      return;
    }
    serveStaticFile(res, resolved);
  });
});

server.listen(PORT, () => {
  console.log(`\n  個人 AI 工作系統儀表板`);
  console.log(`  ──────────────────────`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  頁面：`);
  console.log(`    總覽     http://localhost:${PORT}/`);
  console.log(`    當前任務  http://localhost:${PORT}/task`);
  console.log(`    專案記憶  http://localhost:${PORT}/memory\n`);
});
