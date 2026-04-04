const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  adaptVSCodeCopilotConversation,
  listVSCodeCopilotSessionsFromDirectory,
  resolveVSCodeCopilotSessionDir,
  summarizeVSCodeCopilotSession,
} = require('./public/js/conversation-adapters.js');
const memoryHealthUtils = require('./public/js/memory-health-utils.js');
const memoryDedupUtils = require('./public/js/memory-dedup-utils.js');

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

function getWritableMemoryFilePath(memoryDir, filename) {
  if (!WRITABLE_MEMORY_FILES.includes(filename)) {
    throw new Error('File not in writable whitelist: ' + filename);
  }

  const filePath = path.join(memoryDir, filename);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(memoryDir))) {
    throw new Error('Path traversal denied');
  }

  return resolved;
}

function writeMemoryFileWithBackup(memoryDir, backupDir, resolvedFilePath, content, callback) {
  fs.mkdir(backupDir, { recursive: true }, (mkdirErr) => {
    if (mkdirErr) {
      callback(mkdirErr);
      return;
    }

    const doWrite = (backedUp) => {
      fs.writeFile(resolvedFilePath, content, 'utf-8', (writeErr) => {
        if (writeErr) {
          callback(writeErr);
          return;
        }
        callback(null, backedUp);
      });
    };

    fs.readFile(resolvedFilePath, 'utf-8', (readErr, existing) => {
      if (readErr) {
        doWrite(false);
        return;
      }

      const backupPath = path.join(backupDir, path.basename(resolvedFilePath));
      fs.writeFile(backupPath, existing, 'utf-8', (backupErr) => {
        if (backupErr) {
          callback(backupErr);
          return;
        }
        doWrite(true);
      });
    });
  });
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
        sendJSON(res, 200, memoryDedupUtils.attachDedupToMemoryPayload(
          memoryHealthUtils.buildMemoryApiPayload([])
        )); // Directory might not exist yet
        return;
      }
      const mdFiles = files.filter(f => f.endsWith('.md'));
      const results = [];
      let pending = mdFiles.length;
      if (pending === 0) {
        sendJSON(res, 200, memoryDedupUtils.attachDedupToMemoryPayload(
          memoryHealthUtils.buildMemoryApiPayload([])
        ));
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
            sendJSON(
              res,
              200,
              memoryDedupUtils.attachDedupToMemoryPayload(
                memoryHealthUtils.buildMemoryApiPayload(results)
              )
            );
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
        const resolved = getWritableMemoryFilePath(MEMORY_DIR, filename);
        writeMemoryFileWithBackup(MEMORY_DIR, BACKUP_DIR, resolved, content, (writeErr, backedUp) => {
          if (writeErr) {
            sendJSON(res, 500, { error: writeErr.message });
            return;
          }
          sendJSON(res, 200, { success: true, filename, backedUp });
        });
      } catch (e) {
        const message = e && e.message ? e.message : 'Invalid JSON body';
        const statusCode = /whitelist|Path traversal/i.test(message) ? 403 : 400;
        sendJSON(res, statusCode, { error: message });
      }
    });
    return true;
  }

  if (url.pathname === '/api/memory/dedup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const filename = (payload.filename || '').trim();
        const resolved = getWritableMemoryFilePath(MEMORY_DIR, filename);
        const currentContent = fs.readFileSync(resolved, 'utf8');
        const updatedContent = memoryDedupUtils.applyMemoryDedupAction(currentContent, filename, payload);

        writeMemoryFileWithBackup(MEMORY_DIR, BACKUP_DIR, resolved, updatedContent, (writeErr, backedUp) => {
          if (writeErr) {
            sendJSON(res, 500, { error: writeErr.message });
            return;
          }
          sendJSON(res, 200, {
            success: true,
            filename,
            action: payload.action,
            backedUp,
          });
        });
      } catch (error) {
        const message = error && error.message ? error.message : 'Invalid JSON body';
        const statusCode = /whitelist|Path traversal/i.test(message) ? 403 : 400;
        sendJSON(res, statusCode, { error: message });
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

  if (url.pathname === '/api/copilot/sessions') {
    try {
      const sessionDir = resolveVSCodeCopilotSessionDir(url.searchParams.get('sessionDir'));
      const sessions = listVSCodeCopilotSessionsFromDirectory(sessionDir, { maxSessions: 10 });
      sendJSON(res, 200, { sessionDir, sessions });
    } catch (error) {
      sendJSON(res, 400, { error: error.message });
    }
    return true;
  }

  if (url.pathname === '/api/copilot/session') {
    try {
      const sessionDir = resolveVSCodeCopilotSessionDir(url.searchParams.get('sessionDir'));
      const fileName = (url.searchParams.get('fileName') || '').trim();

      if (!fileName || fileName !== path.basename(fileName) || !/\.jsonl$/i.test(fileName)) {
        sendJSON(res, 400, { error: 'fileName 必須是單一 .jsonl 檔名' });
        return true;
      }

      const resolvedDir = path.resolve(sessionDir);
      const resolvedFile = path.resolve(path.join(resolvedDir, fileName));
      if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
        sendJSON(res, 403, { error: 'Copilot session path traversal denied' });
        return true;
      }

      const raw = fs.readFileSync(resolvedFile, 'utf8');
      const stats = fs.statSync(resolvedFile);
      const conversationDoc = adaptVSCodeCopilotConversation(raw, {
        fileName,
        updatedAt: stats.mtime.toISOString(),
      });
      const summary = summarizeVSCodeCopilotSession(raw, {
        fileName,
        updatedAt: stats.mtime.toISOString(),
      });

      sendJSON(res, 200, {
        sessionDir: resolvedDir,
        fileName,
        summary,
        conversationDoc,
      });
    } catch (error) {
      sendJSON(res, 400, { error: error.message });
    }
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
