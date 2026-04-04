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
const ruleConflictUtils = require('./public/js/rule-conflict-utils.js');
const sharedKnowledgeUtils = require('./public/js/shared-knowledge-utils.js');
const governanceSchedulerUtils = require('./public/js/governance-scheduler-utils.js');

const PORT = 3000;
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const GOVERNANCE_CONFIG_PATH = path.join(__dirname, 'governance.json');
const GOVERNANCE_CONFIG_RELATIVE_PATH = 'web/governance.json';
const RULE_FILE_LABELS = {
  'output-patterns.md': '輸出模式',
  'preference-rules.md': '偏好規則',
  'task-patterns.md': '任務模式',
};
const RULE_MEMORY_FILES = Object.keys(RULE_FILE_LABELS);

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

let governanceSnapshotState = {
  checkedAt: '',
  config: governanceSchedulerUtils.parseGovernanceConfig({}, { configPath: GOVERNANCE_CONFIG_RELATIVE_PATH }),
  projects: {},
};

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

function readProjectsConfig() {
  try {
    const projectsFile = path.join(__dirname, 'projects.json');
    const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
    return Array.isArray(data.projects) ? data.projects : [];
  } catch (error) {
    return [];
  }
}

function getDefaultProjectConfig(projects) {
  return projects.find(project => path.resolve(project.path) === DEFAULT_PROJECT_ROOT) || null;
}

function resolveProjectContext(projectId) {
  const projects = readProjectsConfig();
  const selectedProject = projectId
    ? projects.find(project => project.id === projectId)
    : getDefaultProjectConfig(projects);

  if (selectedProject) {
    return {
      projects,
      currentProject: {
        id: selectedProject.id,
        name: selectedProject.name,
        path: path.resolve(selectedProject.path),
      },
    };
  }

  return {
    projects,
    currentProject: {
      id: projectId || 'personal-ai',
      name: '個人 AI 工作系統',
      path: DEFAULT_PROJECT_ROOT,
    },
  };
}

/**
 * Get the project root directory based on projectId.
 * @param {string} projectId 
 * @returns {string}
 */
function getProjectRoot(projectId) {
  return resolveProjectContext(projectId).currentProject.path;
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

function readMemoryEntries(projectRoot) {
  const memoryDir = path.join(projectRoot, 'docs', 'memory');
  try {
    return fs.readdirSync(memoryDir)
      .filter(file => file.endsWith('.md'))
      .sort((left, right) => left.localeCompare(right))
      .map(file => ({
        filename: file,
        content: fs.readFileSync(path.join(memoryDir, file), 'utf8'),
      }));
  } catch (error) {
    return [];
  }
}

function buildMemoryPayloadForProjectRoot(projectRoot) {
  return memoryDedupUtils.attachDedupToMemoryPayload(
    memoryHealthUtils.buildMemoryApiPayload(readMemoryEntries(projectRoot))
  );
}

function parseRuleFileForGovernance(filename, content) {
  const category = RULE_FILE_LABELS[filename] || filename;
  const results = [];
  const lines = String(content || '').split('\n');
  let currentTitle = '';
  let currentBody = [];
  let inSection = false;

  const flush = () => {
    if (!currentTitle || currentTitle.startsWith('使用原則') || currentTitle.startsWith('觀察中')) {
      return;
    }

    results.push({
      id: `${filename}-${results.length}`,
      filename,
      category,
      title: currentTitle,
      body: currentBody.join('\n').trim(),
    });
    currentTitle = '';
    currentBody = [];
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^### /.test(trimmed)) {
      flush();
      currentTitle = trimmed.replace(/^### /, '');
      inSection = true;
      return;
    }

    if (/^## /.test(trimmed)) {
      flush();
      inSection = false;
      return;
    }

    if (inSection && trimmed) {
      currentBody.push(trimmed);
    }
  });

  flush();
  return results;
}

function buildRuleConflictSummaryForProjectRoot(projectRoot) {
  const memoryDir = path.join(projectRoot, 'docs', 'memory');
  const parsedRules = [];

  RULE_MEMORY_FILES.forEach(filename => {
    try {
      const content = fs.readFileSync(path.join(memoryDir, filename), 'utf8');
      parsedRules.push(...parseRuleFileForGovernance(filename, content));
    } catch (error) {
      // Missing rule files are allowed in smaller fixture projects.
    }
  });

  if (parsedRules.length === 0) {
    return {
      pairCount: 0,
      conflictRuleCount: 0,
      byCategory: [],
    };
  }

  return ruleConflictUtils.enrichRulesWithConflicts(parsedRules).summary;
}

function listGovernanceProjects() {
  const configuredProjects = readProjectsConfig().map(project => ({
    id: project.id,
    name: project.name,
    path: path.resolve(project.path),
  }));
  const defaultProject = getDefaultProjectConfig(configuredProjects);
  const projectList = defaultProject
    ? configuredProjects
    : configuredProjects.concat([{
        id: 'personal-ai',
        name: '個人 AI 工作系統',
        path: DEFAULT_PROJECT_ROOT,
      }]);

  const uniqueProjects = new Map();
  projectList.forEach(project => {
    if (!uniqueProjects.has(project.id)) {
      uniqueProjects.set(project.id, project);
    }
  });

  return Array.from(uniqueProjects.values());
}

function readGovernanceConfig() {
  try {
    const raw = fs.readFileSync(GOVERNANCE_CONFIG_PATH, 'utf8');
    return governanceSchedulerUtils.parseGovernanceConfig(raw, {
      configPath: GOVERNANCE_CONFIG_RELATIVE_PATH,
    });
  } catch (error) {
    const config = governanceSchedulerUtils.parseGovernanceConfig({}, {
      configPath: GOVERNANCE_CONFIG_RELATIVE_PATH,
    });
    config.enabled = false;
    config.warnings = (config.warnings || []).concat(`無法讀取 ${GOVERNANCE_CONFIG_RELATIVE_PATH}：${error.message}`);
    return config;
  }
}

function buildSharedKnowledgeForProject(projectContext) {
  const projectCatalog = projectContext.projects.map(project => ({
    projectId: project.id,
    projectName: project.name,
    files: buildMemoryPayloadForProjectRoot(path.resolve(project.path)).files,
  }));

  if (!projectCatalog.some(project => project.projectId === projectContext.currentProject.id)) {
    projectCatalog.push({
      projectId: projectContext.currentProject.id,
      projectName: projectContext.currentProject.name,
      files: buildMemoryPayloadForProjectRoot(projectContext.currentProject.path).files,
    });
  }

  return sharedKnowledgeUtils.buildSharedKnowledgePayload(projectCatalog, {
    currentProjectId: projectContext.currentProject.id,
  });
}

function buildGovernanceSnapshotForProject(project, projects, config, now) {
  const projectRoot = path.resolve(project.path);
  const memoryPayload = buildMemoryPayloadForProjectRoot(projectRoot);
  const sharedKnowledge = buildSharedKnowledgeForProject({
    projects,
    currentProject: {
      id: project.id,
      name: project.name,
      path: projectRoot,
    },
  });

  return governanceSchedulerUtils.buildGovernanceProjectSnapshot(config, {
    projectId: project.id,
    projectName: project.name,
    memorySummary: memoryPayload.summary || {},
    dedupSummary: memoryPayload.dedup && memoryPayload.dedup.summary ? memoryPayload.dedup.summary : {},
    sharedKnowledgeSummary: sharedKnowledge.summary || {},
    ruleConflictSummary: buildRuleConflictSummaryForProjectRoot(projectRoot),
  }, {
    now,
    configPath: GOVERNANCE_CONFIG_RELATIVE_PATH,
  });
}

function refreshGovernanceSnapshots(now = new Date()) {
  const projects = listGovernanceProjects();
  const config = readGovernanceConfig();
  const snapshotProjects = {};

  projects.forEach(project => {
    snapshotProjects[project.id] = buildGovernanceSnapshotForProject(project, projects, config, now);
  });

  governanceSnapshotState = {
    checkedAt: new Date(now).toISOString(),
    config,
    projects: snapshotProjects,
  };

  return governanceSnapshotState;
}

function getGovernanceSnapshotForProject(projectContext) {
  const projectId = projectContext.currentProject.id;
  if (governanceSnapshotState.projects[projectId]) {
    return governanceSnapshotState.projects[projectId];
  }

  return buildGovernanceSnapshotForProject(projectContext.currentProject, listGovernanceProjects(), governanceSnapshotState.config, governanceSnapshotState.checkedAt || new Date());
}

function handleAPI(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const projectId = url.searchParams.get('projectId');
  const projectContext = resolveProjectContext(projectId);
  const projectRoot = projectContext.currentProject.path;

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
    const payload = buildMemoryPayloadForProjectRoot(projectRoot);
    sendJSON(res, 200, {
      ...payload,
      sharedKnowledge: buildSharedKnowledgeForProject(projectContext),
    });
    return true;
  }

  if (url.pathname === '/api/governance') {
    sendJSON(res, 200, getGovernanceSnapshotForProject(projectContext));
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
    const results = [];
    let pending = RULE_MEMORY_FILES.length;
    RULE_MEMORY_FILES.forEach(file => {
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
    sendJSON(res, 200, { projects: readProjectsConfig() });
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

  const defaultProject = getDefaultProjectConfig(listGovernanceProjects()) || { id: 'personal-ai' };
  const governanceSnapshot = governanceSnapshotState.projects[defaultProject.id];
  if (!governanceSnapshot) {
    return;
  }

  if (!governanceSnapshot.enabled) {
    console.log(`  治理排程：已停用（${GOVERNANCE_CONFIG_RELATIVE_PATH}）\n`);
    return;
  }

  const summary = governanceSnapshot.summary || { dueCount: 0, attentionCount: 0, routineCount: 0 };
  if (summary.dueCount > 0) {
    console.log(`  治理待辦：${summary.dueCount} 項到期（${summary.attentionCount} 項需優先確認）`);
  } else {
    console.log(`  治理待辦：目前沒有到期項目`);
  }
  console.log(`  設定檔：${GOVERNANCE_CONFIG_RELATIVE_PATH}\n`);
}

function startServer(port = PORT, callback) {
  refreshGovernanceSnapshots();
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
  getGovernanceSnapshotForProject,
  refreshGovernanceSnapshots,
  server,
  startServer,
};
