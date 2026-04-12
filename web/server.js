const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  adaptOpenAIConversationItems,
  adaptVSCodeCopilotConversation,
  conversationDocToText,
  listVSCodeCopilotSessionsFromDirectory,
  resolveVSCodeCopilotSessionDir,
  summarizeVSCodeCopilotSession,
} = require('./public/js/conversation-adapters.js');
const memoryHealthUtils = require('./public/js/memory-health-utils.js');
const memoryDedupUtils = require('./public/js/memory-dedup-utils.js');
const ruleConflictUtils = require('./public/js/rule-conflict-utils.js');
const sharedKnowledgeUtils = require('./public/js/shared-knowledge-utils.js');
const governanceSchedulerUtils = require('./public/js/governance-scheduler-utils.js');

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const API_KEYS_FILE = path.join(__dirname, 'api-keys.json');
const OPENAI_CONVERSATION_INDEX_FILE = path.join(__dirname, 'openai-conversation-index.json');
const GOVERNANCE_CONFIG_PATH = path.join(__dirname, 'governance.json');
const GOVERNANCE_CONFIG_RELATIVE_PATH = 'web/governance.json';
const OPENAI_API_BASE_URL = String(process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const OPENAI_TRACKED_SESSION_LIMIT = 10;
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

function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallbackValue;
  }
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function normalizeIsoTimestamp(value) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const milliseconds = value > 1e12 ? value : value * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const numeric = Number(text);
  if (Number.isFinite(numeric)) {
    return normalizeIsoTimestamp(numeric);
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function maskApiKey(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (text.length <= 8) {
    return `${text.slice(0, 2)}••••`;
  }

  return `${text.slice(0, 4)}••••${text.slice(-4)}`;
}

function readOpenAIKeyStore() {
  const parsed = readJsonFile(API_KEYS_FILE, {});
  const record = parsed && typeof parsed === 'object' ? parsed.openai : null;
  const apiKey = record && typeof record.apiKey === 'string' ? record.apiKey.trim() : '';
  const updatedAt = normalizeIsoTimestamp(record && record.updatedAt);

  return {
    openai: {
      apiKey,
      updatedAt,
    },
  };
}

function saveOpenAIApiKey(apiKey) {
  const normalized = String(apiKey || '').trim();
  if (!normalized) {
    throw new Error('OpenAI API key 不可為空');
  }

  const nextStore = {
    openai: {
      apiKey: normalized,
      updatedAt: new Date().toISOString(),
    },
  };
  writeJsonFile(API_KEYS_FILE, nextStore);
  return nextStore;
}

function clearOpenAIApiKey() {
  const nextStore = {
    openai: {
      apiKey: '',
      updatedAt: new Date().toISOString(),
    },
  };
  writeJsonFile(API_KEYS_FILE, nextStore);
  return nextStore;
}

function getOpenAISettingsSummary() {
  const store = readOpenAIKeyStore();
  return {
    configured: Boolean(store.openai.apiKey),
    maskedKey: store.openai.apiKey ? maskApiKey(store.openai.apiKey) : '',
    updatedAt: store.openai.updatedAt || null,
  };
}

function getRequiredOpenAIApiKey() {
  const store = readOpenAIKeyStore();
  if (!store.openai.apiKey) {
    throw new Error('尚未設定 OpenAI API key；請先到 /settings 儲存。');
  }

  return store.openai.apiKey;
}

// ── Gemini API Key 管理 ────────────────────────────────────────
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_EXTRACT_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_MAX_INPUT_CHARS = 50000;

function readGeminiKeyStore() {
  const parsed = readJsonFile(API_KEYS_FILE, {});
  const record = parsed && typeof parsed === 'object' ? parsed.gemini : null;
  const apiKey = record && typeof record.apiKey === 'string' ? record.apiKey.trim() : '';
  const updatedAt = normalizeIsoTimestamp(record && record.updatedAt);

  return {
    gemini: {
      apiKey,
      updatedAt,
    },
  };
}

function saveGeminiApiKey(apiKey) {
  const normalized = String(apiKey || '').trim();
  if (!normalized || normalized.length < 20) {
    throw new Error('Gemini API key 不可為空且長度至少 20 字元');
  }

  const existing = readJsonFile(API_KEYS_FILE, {});
  const nextStore = {
    ...existing,
    gemini: {
      apiKey: normalized,
      updatedAt: new Date().toISOString(),
    },
  };
  writeJsonFile(API_KEYS_FILE, nextStore);
  return nextStore;
}

function clearGeminiApiKey() {
  const existing = readJsonFile(API_KEYS_FILE, {});
  const nextStore = {
    ...existing,
    gemini: {
      apiKey: '',
      updatedAt: new Date().toISOString(),
    },
  };
  writeJsonFile(API_KEYS_FILE, nextStore);
  return nextStore;
}

function getGeminiSettingsSummary() {
  const store = readGeminiKeyStore();
  return {
    configured: Boolean(store.gemini.apiKey),
    maskedKey: store.gemini.apiKey ? maskApiKey(store.gemini.apiKey) : '',
    updatedAt: store.gemini.updatedAt || null,
  };
}

function getRequiredGeminiApiKey() {
  const store = readGeminiKeyStore();
  if (!store.gemini.apiKey) {
    throw new Error('尚未設定 Gemini API key；請先到 /settings 儲存。');
  }

  return store.gemini.apiKey;
}

async function geminiGenerateContent(promptText, apiKey) {
  if (typeof fetch !== 'function') {
    throw new Error('目前 Node.js runtime 不支援 fetch');
  }

  const endpoint = `${GEMINI_API_BASE_URL}/${GEMINI_EXTRACT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  let responseBody = null;
  try {
    responseBody = JSON.parse(responseText);
  } catch (_) {
    throw new Error(`Gemini API 回傳非 JSON：${responseText.slice(0, 200)}`);
  }

  if (!response.ok) {
    const errMsg =
      responseBody &&
      responseBody.error &&
      responseBody.error.message
        ? responseBody.error.message
        : `${response.status} ${response.statusText}`;
    throw new Error(`Gemini API 錯誤：${errMsg}`);
  }

  const rawText =
    responseBody &&
    responseBody.candidates &&
    responseBody.candidates[0] &&
    responseBody.candidates[0].content &&
    responseBody.candidates[0].content.parts &&
    responseBody.candidates[0].content.parts[0] &&
    responseBody.candidates[0].content.parts[0].text;

  if (!rawText) {
    throw new Error('Gemini API 回傳內容為空');
  }

  // 去除 markdown code block wrapper（若有）
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    throw new Error(`AI 回傳格式錯誤，無法解析為 JSON。原始內容（前 300 字）：${cleaned.slice(0, 300)}`);
  }
}

function buildExtractPrompt(userText) {
  const systemPrompt = `你是一個專業的個人知識管理助手，任務是從 AI 對話紀錄中提取有長期保存價值的知識。

提取標準（必須同時符合）：
1. 使用者一年後仍會需要的資訊
2. 有具體的工具名稱、費用、功能差異、或操作方法
3. 不是泛泛而談的概念，而是可以直接執行或參考的具體知識

絕對不要提取：
- 純問答過渡句（如「你說的很對」「讓我補充...」）
- 已經是常識的概念（如「AI 可以幫助工作效率」）
- 同一個事實的重複表達

知識分類選項（category 欄位只能選以下之一）：
- tool-insights：工具/軟體的具體特性、費用、功能比較
- preference-rules：使用者的個人偏好或工作規則
- task-patterns：可重複執行的工作模式或 SOP
- decision-log：已做出的技術或商業決策（含理由）
- market-knowledge：市場、產品、商業模式相關知識

writebackTarget 選項（只能選以下之一）：
- docs/memory/skill-candidates.md（工具知識）
- docs/memory/preference-rules.md（偏好規則）
- docs/memory/task-patterns.md（任務模式）
- docs/memory/decision-log.md（決策記錄）
- docs/memory/project-context.md（專案背景）

輸出格式（必須是合法 JSON，不要加 markdown code block）：
{
  "candidates": [
    {
      "category": "tool-insights",
      "summary": "一句話的知識點摘要（最多 80 字）",
      "evidence": "從原文摘錄的關鍵句（最多 150 字）",
      "writebackTarget": "docs/memory/skill-candidates.md",
      "confidence": 0.85
    }
  ]
}

候選數量：最少 3 個，最多 7 個。只提取最有價值的，寧缺勿濫。`;

  return `${systemPrompt}\n\n請從以下對話內容提取有長期保存價值的知識：\n\n<conversation>\n${userText}\n</conversation>`;
}

function normalizeConversationId(value) {
  const normalized = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{6,}$/.test(normalized)) {
    throw new Error('conversationId 格式不合法');
  }

  return normalized;
}

function readTrackedConversationIndex() {
  const parsed = readJsonFile(OPENAI_CONVERSATION_INDEX_FILE, { sessions: [] });
  const sessions = Array.isArray(parsed && parsed.sessions) ? parsed.sessions : [];

  return {
    sessions: sessions
      .filter((session) => session && typeof session === 'object')
      .map((session) => ({
        conversationId: String(session.conversationId || '').trim(),
        projectId: String(session.projectId || '').trim(),
        title: String(session.title || '').trim(),
        preview: String(session.preview || '').trim(),
        updatedAt: normalizeIsoTimestamp(session.updatedAt),
        createdAt: normalizeIsoTimestamp(session.createdAt),
        trackedAt: normalizeIsoTimestamp(session.trackedAt),
        lastSyncedAt: normalizeIsoTimestamp(session.lastSyncedAt),
        lastLoadedAt: normalizeIsoTimestamp(session.lastLoadedAt),
        messageCount: Number.isFinite(Number(session.messageCount)) ? Number(session.messageCount) : 0,
        source: String(session.source || 'chatgpt-api').trim() || 'chatgpt-api',
      }))
      .filter((session) => session.conversationId && session.projectId),
  };
}

function writeTrackedConversationIndex(index) {
  writeJsonFile(OPENAI_CONVERSATION_INDEX_FILE, {
    sessions: Array.isArray(index && index.sessions) ? index.sessions : [],
  });
}

function sortTrackedSessions(sessions) {
  return sessions.slice().sort((left, right) => {
    const leftTime = new Date(left.lastLoadedAt || left.lastSyncedAt || left.trackedAt || left.updatedAt || 0).getTime();
    const rightTime = new Date(right.lastLoadedAt || right.lastSyncedAt || right.trackedAt || right.updatedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function upsertTrackedConversation(record) {
  const nextRecord = {
    conversationId: normalizeConversationId(record.conversationId),
    projectId: String(record.projectId || '').trim(),
    title: String(record.title || '').trim(),
    preview: String(record.preview || '').trim(),
    updatedAt: normalizeIsoTimestamp(record.updatedAt),
    createdAt: normalizeIsoTimestamp(record.createdAt),
    trackedAt: normalizeIsoTimestamp(record.trackedAt) || new Date().toISOString(),
    lastSyncedAt: normalizeIsoTimestamp(record.lastSyncedAt),
    lastLoadedAt: normalizeIsoTimestamp(record.lastLoadedAt),
    messageCount: Number.isFinite(Number(record.messageCount)) ? Number(record.messageCount) : 0,
    source: String(record.source || 'chatgpt-api').trim() || 'chatgpt-api',
  };

  if (!nextRecord.projectId) {
    throw new Error('tracked conversation 缺少 projectId');
  }

  const index = readTrackedConversationIndex();
  const filtered = index.sessions.filter((session) => !(
    session.projectId === nextRecord.projectId && session.conversationId === nextRecord.conversationId
  ));
  filtered.push(nextRecord);
  const sessions = sortTrackedSessions(filtered);
  writeTrackedConversationIndex({ sessions });
  return nextRecord;
}

function listTrackedConversationsForProject(projectId, limit = OPENAI_TRACKED_SESSION_LIMIT) {
  return sortTrackedSessions(
    readTrackedConversationIndex().sessions.filter((session) => session.projectId === projectId)
  ).slice(0, limit);
}

function getTrackedConversationForProject(projectId, conversationId) {
  const normalizedConversationId = normalizeConversationId(conversationId);
  return readTrackedConversationIndex().sessions.find((session) => (
    session.projectId === projectId && session.conversationId === normalizedConversationId
  )) || null;
}

async function readJsonRequestBody(req) {
  const body = await new Promise((resolve, reject) => {
    let payload = '';
    req.on('data', (chunk) => {
      payload += chunk;
    });
    req.on('end', () => resolve(payload));
    req.on('error', reject);
  });

  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body);
}

async function openAIJsonRequest(endpointPath, options, apiKey) {
  if (typeof fetch !== 'function') {
    throw new Error('目前 Node.js runtime 不支援 fetch');
  }

  const requestOptions = {
    method: options && options.method ? options.method : 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options && options.headers ? options.headers : {}),
    },
  };

  if (options && Object.prototype.hasOwnProperty.call(options, 'body')) {
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${OPENAI_API_BASE_URL}${endpointPath}`, requestOptions);
  const responseText = await response.text();
  let responseBody = null;
  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch (error) {
      responseBody = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      responseBody && responseBody.error && responseBody.error.message
        ? responseBody.error.message
        : `${response.status} ${response.statusText}`;
    throw new Error(`OpenAI API 錯誤：${errorMessage}`);
  }

  return responseBody;
}

async function retrieveOpenAIConversation(conversationId, apiKey) {
  return openAIJsonRequest(`/conversations/${encodeURIComponent(conversationId)}`, null, apiKey);
}

async function listAllOpenAIConversationItems(conversationId, apiKey) {
  let after = '';
  let pageCount = 0;
  const items = [];

  while (pageCount < 10) {
    const suffix = after ? `?after=${encodeURIComponent(after)}` : '';
    const payload = await openAIJsonRequest(
      `/conversations/${encodeURIComponent(conversationId)}/items${suffix}`,
      null,
      apiKey
    );
    const pageItems = Array.isArray(payload)
      ? payload
      : Array.isArray(payload && payload.data)
        ? payload.data
        : Array.isArray(payload && payload.items)
          ? payload.items
          : [];

    items.push(...pageItems);
    pageCount += 1;

    if (!payload || !payload.has_more || !payload.last_id || pageItems.length === 0) {
      break;
    }

    after = payload.last_id;
  }

  return items;
}

function summarizeTrackedConversation(projectId, conversationId, conversationDoc, conversation, previousRecord, options) {
  const firstUserMessage = conversationDoc.messages.find((message) => message.role === 'user');
  const firstVisibleMessage = conversationDoc.messages.find((message) => message.content);
  const previewBase = (firstUserMessage || firstVisibleMessage || { content: '' }).content.trim();
  const title =
    String((conversation && conversation.title) || previousRecord && previousRecord.title || '').trim() ||
    previewBase.slice(0, 80) ||
    conversationId;
  const nowIso = new Date().toISOString();

  return {
    conversationId,
    projectId,
    title,
    preview: previewBase.slice(0, 160),
    updatedAt: normalizeIsoTimestamp(
      conversation && (conversation.updated_at || conversation.updatedAt || conversation.last_activity_at || conversation.created_at)
    ) || previousRecord && previousRecord.updatedAt || nowIso,
    createdAt: normalizeIsoTimestamp(
      conversation && (conversation.created_at || conversation.createdAt)
    ) || previousRecord && previousRecord.createdAt || null,
    trackedAt: previousRecord && previousRecord.trackedAt || nowIso,
    lastSyncedAt: nowIso,
    lastLoadedAt: options && options.markLoaded ? nowIso : previousRecord && previousRecord.lastLoadedAt || null,
    messageCount: conversationDoc.messages.length,
    source: 'chatgpt-api',
  };
}

async function syncTrackedConversation(projectId, conversationId, apiKey, options) {
  const normalizedConversationId = normalizeConversationId(conversationId);
  const previousRecord = listTrackedConversationsForProject(projectId, Number.MAX_SAFE_INTEGER)
    .find((session) => session.conversationId === normalizedConversationId) || null;
  const conversation = await retrieveOpenAIConversation(normalizedConversationId, apiKey);
  const items = await listAllOpenAIConversationItems(normalizedConversationId, apiKey);
  const conversationDoc = adaptOpenAIConversationItems(items, {
    source: 'chatgpt-api',
    conversationId: normalizedConversationId,
    sessionId: normalizedConversationId,
    title: String(conversation && conversation.title || previousRecord && previousRecord.title || '').trim() || undefined,
    projectId,
  });
  const summary = summarizeTrackedConversation(
    projectId,
    normalizedConversationId,
    conversationDoc,
    conversation,
    previousRecord,
    options
  );

  upsertTrackedConversation(summary);
  return {
    summary,
    conversation,
    conversationDoc,
  };
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

    // Inject app meta for HTML pages so browser tab and URL carry environment/project info
    if (ext === '.html') {
      const defaultProject = getDefaultProjectConfig(readProjectsConfig()) || { id: 'personal-ai', name: '個人 AI 工作系統' };
      const meta = JSON.stringify({
        projectId: defaultProject.id,
        projectName: defaultProject.name,
        env: NODE_ENV,
        port: PORT,
      });
      const injection = `<script>window.__APP_META__=${meta};</script>`;
      let html = data.toString('utf-8');
      html = html.includes('</head>')
        ? html.replace('</head>', `${injection}\n</head>`)
        : injection + html;
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(html);
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

async function handleAPI(req, res) {
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

  if (url.pathname === '/api/settings/openai') {
    if (req.method === 'GET') {
      sendJSON(res, 200, getOpenAISettingsSummary());
      return true;
    }

    if (req.method === 'POST') {
      try {
        const payload = await readJsonRequestBody(req);
        if (payload && payload.clear) {
          clearOpenAIApiKey();
        } else {
          saveOpenAIApiKey(payload && payload.apiKey);
        }

        sendJSON(res, 200, getOpenAISettingsSummary());
      } catch (error) {
        sendJSON(res, 400, { error: error.message || 'Invalid JSON body' });
      }
      return true;
    }
  }

  // Gemini API key 管理
  if (url.pathname === '/api/settings/gemini') {
    if (req.method === 'GET') {
      sendJSON(res, 200, getGeminiSettingsSummary());
      return true;
    }

    if (req.method === 'POST') {
      try {
        const payload = await readJsonRequestBody(req);
        if (payload && payload.clear) {
          clearGeminiApiKey();
        } else {
          saveGeminiApiKey(payload && payload.apiKey);
        }

        sendJSON(res, 200, getGeminiSettingsSummary());
      } catch (error) {
        sendJSON(res, 400, { error: error.message || 'Invalid JSON body' });
      }
      return true;
    }
  }

  // Gemini LLM 知識提取
  if (url.pathname === '/api/extract/llm' && req.method === 'POST') {
    try {
      const payload = await readJsonRequestBody(req);
      const inputText = payload && typeof payload.text === 'string' ? payload.text.trim() : '';

      if (!inputText) {
        sendJSON(res, 400, { error: '請提供要提取的文字內容（text 欄位不可為空）' });
        return true;
      }

      if (inputText.length > GEMINI_MAX_INPUT_CHARS) {
        sendJSON(res, 400, {
          error: `內容過長（${inputText.length} 字），上限為 ${GEMINI_MAX_INPUT_CHARS} 字元。請縮短後再試。`,
        });
        return true;
      }

      const apiKey = getRequiredGeminiApiKey();
      const prompt = buildExtractPrompt(inputText);
      const result = await geminiGenerateContent(prompt, apiKey);

      const candidates = Array.isArray(result && result.candidates) ? result.candidates : [];

      // 驗證每個候選的必要欄位
      const validCandidates = candidates.filter((c) =>
        c &&
        typeof c.category === 'string' &&
        typeof c.summary === 'string' &&
        typeof c.evidence === 'string' &&
        typeof c.writebackTarget === 'string' &&
        typeof c.confidence === 'number'
      );

      sendJSON(res, 200, {
        candidates: validCandidates,
        model: GEMINI_EXTRACT_MODEL,
        extractedAt: new Date().toISOString(),
        totalRaw: candidates.length,
        totalValid: validCandidates.length,
      });
    } catch (error) {
      const statusCode = error.message && error.message.includes('尚未設定') ? 400 : 500;
      sendJSON(res, statusCode, { error: error.message || 'Gemini 提取失敗' });
    }
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
    try {
      const { filename, content } = await readJsonRequestBody(req);
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
    return true;
  }

  if (url.pathname === '/api/memory/dedup' && req.method === 'POST') {
    try {
      const payload = await readJsonRequestBody(req);
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

  if (url.pathname === '/api/chatgpt/sessions') {
    try {
      const apiKey = getRequiredOpenAIApiKey();
      const trackedSessions = listTrackedConversationsForProject(projectContext.currentProject.id, OPENAI_TRACKED_SESSION_LIMIT);
      const sessions = [];

      for (const tracked of trackedSessions) {
        try {
          const synced = await syncTrackedConversation(
            projectContext.currentProject.id,
            tracked.conversationId,
            apiKey,
            { markLoaded: false }
          );
          sessions.push(synced.summary);
        } catch (error) {
          sessions.push({
            ...tracked,
            error: error.message,
          });
        }
      }

      sendJSON(res, 200, {
        settings: getOpenAISettingsSummary(),
        sessions: sortTrackedSessions(sessions).slice(0, OPENAI_TRACKED_SESSION_LIMIT),
      });
    } catch (error) {
      sendJSON(res, 400, { error: error.message });
    }
    return true;
  }

  if (url.pathname === '/api/chatgpt/sessions/track' && req.method === 'POST') {
    try {
      const apiKey = getRequiredOpenAIApiKey();
      const payload = await readJsonRequestBody(req);
      const conversationId = normalizeConversationId(payload && payload.conversationId);
      const synced = await syncTrackedConversation(
        projectContext.currentProject.id,
        conversationId,
        apiKey,
        { markLoaded: false }
      );

      sendJSON(res, 200, {
        tracked: true,
        summary: synced.summary,
        sessions: listTrackedConversationsForProject(projectContext.currentProject.id, OPENAI_TRACKED_SESSION_LIMIT),
      });
    } catch (error) {
      sendJSON(res, 400, { error: error.message });
    }
    return true;
  }

  if (url.pathname === '/api/chatgpt/session') {
    try {
      const apiKey = getRequiredOpenAIApiKey();
      const conversationId = normalizeConversationId(url.searchParams.get('conversationId'));
      const trackedConversation = getTrackedConversationForProject(
        projectContext.currentProject.id,
        conversationId
      );
      if (!trackedConversation) {
        sendJSON(res, 400, {
          error: '尚未追蹤此 conversationId；請先在 ChatGPT API 載入區塊追蹤 Conversation。',
        });
        return true;
      }

      const synced = await syncTrackedConversation(
        projectContext.currentProject.id,
        conversationId,
        apiKey,
        { markLoaded: true }
      );
      sendJSON(res, 200, {
        conversationId,
        summary: synced.summary,
        conversationDoc: synced.conversationDoc,
        previewText: conversationDocToText(synced.conversationDoc),
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
    Promise.resolve(handleAPI(req, res))
      .then((handled) => {
        if (!handled && !res.writableEnded) {
          sendJSON(res, 404, { error: 'Unknown API endpoint' });
        }
      })
      .catch((error) => {
        if (!res.writableEnded) {
          sendJSON(res, 500, { error: error.message || 'Internal Server Error' });
        }
      });
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
  const envTag = NODE_ENV === 'production' ? '[PROD]' : '[DEV]';
  const defaultProject = getDefaultProjectConfig(readProjectsConfig()) || { id: 'personal-ai', name: '個人 AI 工作系統' };
  const baseUrl = `http://localhost:${port}`;
  const projectParam = `?projectId=${defaultProject.id}`;

  console.log(`\n  ${envTag} 個人 AI 工作系統儀表板`);
  console.log(`  ──────────────────────────────────`);
  console.log(`  專案：${defaultProject.name}（${defaultProject.id}）`);
  console.log(`  環境：${NODE_ENV}  PORT：${port}\n`);
  console.log(`  頁面：`);
  console.log(`    總覽     ${baseUrl}/${projectParam}`);
  console.log(`    當前任務  ${baseUrl}/task${projectParam}`);
  console.log(`    專案記憶  ${baseUrl}/memory${projectParam}\n`);
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
  API_KEYS_FILE,
  OPENAI_CONVERSATION_INDEX_FILE,
  OPENAI_API_BASE_URL,
  PORT,
  getGovernanceSnapshotForProject,
  refreshGovernanceSnapshots,
  server,
  startServer,
};
