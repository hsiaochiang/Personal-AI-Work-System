const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '..');
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

// Allowed API file paths (whitelist) relative to project root
const ALLOWED_PATHS = {
  '/api/roadmap': 'docs/roadmap.md',
  '/api/current-task': 'docs/handoff/current-task.md',
};

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

/**
 * Get the project root directory based on projectId.
 * @param {string} projectId 
 * @returns {string}
 */
function getProjectRoot(projectId) {
  if (!projectId) return DEFAULT_PROJECT_ROOT;
  try {
    const projectsFile = path.join(__dirname, 'projects.json');
    const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
    const project = data.projects.find(p => p.id === projectId);
    return project ? project.path : DEFAULT_PROJECT_ROOT;
  } catch (e) {
    return DEFAULT_PROJECT_ROOT;
  }
}

function handleAPI(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const projectId = url.searchParams.get('projectId');
  const projectRoot = getProjectRoot(projectId);

  // Derived directories
  const MEMORY_DIR = path.join(projectRoot, 'docs', 'memory');
  const BACKUP_DIR = path.join(MEMORY_DIR, '.backup');
  const TEMPLATES_DIR = path.join(projectRoot, 'docs', 'templates');

  // Specific file endpoints
  if (ALLOWED_PATHS[url.pathname]) {
    const filePath = path.join(projectRoot, ALLOWED_PATHS[url.pathname]);
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        sendJSON(res, 404, { error: 'File not found: ' + ALLOWED_PATHS[url.pathname] });
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
        sendJSON(res, 200, { files: [] }); // Directory might not exist yet
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

        const filePath = path.join(MEMORY_DIR, filename);
        const resolved = path.resolve(filePath);

        // Double-check path is within MEMORY_DIR
        if (!resolved.startsWith(path.resolve(MEMORY_DIR))) {
          sendJSON(res, 403, { error: 'Path traversal denied' });
          return;
        }

        // Backup existing file before overwriting
        const doWrite = (backedUp) => {
          fs.writeFile(resolved, content, 'utf-8', (err) => {
            if (err) {
              sendJSON(res, 500, { error: 'Write failed: ' + err.message });
              return;
            }
            sendJSON(res, 200, { success: true, filename, backedUp });
          });
        };

        fs.mkdir(BACKUP_DIR, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            sendJSON(res, 500, { error: 'Cannot create backup directory: ' + mkdirErr.message });
            return;
          }
          // Read existing file for backup (skip if not found)
          fs.readFile(resolved, 'utf-8', (readErr, existing) => {
            if (readErr) {
              // File doesn't exist yet — first write, no backup needed
              doWrite(false);
              return;
            }
            const backupPath = path.join(BACKUP_DIR, filename);
            fs.writeFile(backupPath, existing, 'utf-8', (backupErr) => {
              if (backupErr) {
                sendJSON(res, 500, { error: 'Backup failed: ' + backupErr.message });
                return;
              }
              doWrite(true);
            });
          });
        });
      } catch (e) {
        sendJSON(res, 400, { error: 'Invalid JSON body' });
      }
    });
    return true;
  }

  // Decisions endpoint (decision-log.md + memory/decision-log.md)
  if (url.pathname === '/api/decisions') {
    const sources = [
      { key: 'operational', relPath: 'docs/decision-log.md' },
      { key: 'memory', relPath: 'docs/memory/decision-log.md' },
    ];
    const results = {};
    let pending = sources.length;
    sources.forEach(({ key, relPath }) => {
      fs.readFile(path.join(projectRoot, relPath), 'utf-8', (err, content) => {
        results[key] = err ? '' : content;
        pending--;
        if (pending === 0) {
          sendJSON(res, 200, results);
        }
      });
    });
    return true;
  }

  // Rules endpoint (preference-rules + output-patterns + task-patterns)
  if (url.pathname === '/api/rules') {
    const ruleFiles = [
      'preference-rules.md',
      'output-patterns.md',
      'task-patterns.md',
    ];
    const results = [];
    let pending = ruleFiles.length;
    ruleFiles.forEach(file => {
      fs.readFile(path.join(MEMORY_DIR, file), 'utf-8', (err, content) => {
        results.push({ filename: file, content: err ? '' : content });
        pending--;
        if (pending === 0) {
          results.sort((a, b) => a.filename.localeCompare(b.filename));
          sendJSON(res, 200, { files: results });
        }
      });
    });
    return true;
  }

  // Projects endpoint
  if (url.pathname === '/api/projects') {
    const projectsFile = path.join(__dirname, 'projects.json');
    fs.readFile(projectsFile, 'utf-8', (err, content) => {
      if (err) {
        sendJSON(res, 500, { error: 'Cannot read projects.json' });
        return;
      }
      try {
        const data = JSON.parse(content);
        sendJSON(res, 200, data);
      } catch (e) {
        sendJSON(res, 500, { error: 'Invalid JSON in projects.json' });
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

function logServerStartup(port) {
  console.log(`\n  個人 AI 工作系統儀表板`);
  console.log(`  ──────────────────────`);
  console.log(`  http://localhost:${port}\n`);
  console.log(`  頁面：`);
  console.log(`    總覽     http://localhost:${port}/`);
  console.log(`    當前任務  http://localhost:${port}/task`);
  console.log(`    專案記憶  http://localhost:${port}/memory\n`);
}

function startServer(port = PORT, callback) {
  return server.listen(port, () => {
    logServerStartup(port);
    if (typeof callback === 'function') {
      callback();
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  PORT,
  server,
  startServer,
};
