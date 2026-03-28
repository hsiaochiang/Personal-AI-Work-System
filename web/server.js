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

// Allowed directories
const MEMORY_DIR = path.join(PROJECT_ROOT, 'docs', 'memory');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'docs', 'templates');

// Allowed memory files for writeback (whitelist)
const WRITABLE_MEMORY_FILES = [
  'decision-log.md',
  'output-patterns.md',
  'preference-rules.md',
  'project-context.md',
  'skill-candidates.md',
  'task-patterns.md',
];

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

  // Handoff templates listing
  if (url.pathname === '/api/handoff-templates') {
    const templateFiles = [
      'planning-handoff-template.md',
      'implementation-handoff-template.md',
      'integration-handoff-template.md',
    ];
    const results = [];
    let pending = templateFiles.length;
    templateFiles.forEach(file => {
      fs.readFile(path.join(TEMPLATES_DIR, file), 'utf-8', (err, content) => {
        results.push({
          filename: file,
          type: file.replace('-handoff-template.md', ''),
          content: err ? '' : content,
        });
        pending--;
        if (pending === 0) {
          results.sort((a, b) => a.type.localeCompare(b.type));
          sendJSON(res, 200, { templates: results });
        }
      });
    });
    return true;
  }

  // Memory writeback endpoint (POST)
  if (url.pathname === '/api/memory/write' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { filename, content } = JSON.parse(body);

        // Validate filename is in whitelist
        if (!WRITABLE_MEMORY_FILES.includes(filename)) {
          sendJSON(res, 403, { error: 'File not in writable whitelist: ' + filename });
          return;
        }

        // Validate content is a string and not empty
        if (typeof content !== 'string' || content.trim().length === 0) {
          sendJSON(res, 400, { error: 'Content must be a non-empty string' });
          return;
        }

        const filePath = path.join(MEMORY_DIR, filename);
        const resolved = path.resolve(filePath);

        // Double-check path is within MEMORY_DIR
        if (!resolved.startsWith(path.resolve(MEMORY_DIR))) {
          sendJSON(res, 403, { error: 'Path traversal denied' });
          return;
        }

        fs.writeFile(resolved, content, 'utf-8', (err) => {
          if (err) {
            sendJSON(res, 500, { error: 'Write failed: ' + err.message });
            return;
          }
          sendJSON(res, 200, { success: true, filename });
        });
      } catch (e) {
        sendJSON(res, 400, { error: 'Invalid JSON body' });
      }
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
