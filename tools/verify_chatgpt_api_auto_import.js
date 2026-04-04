const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const MOCK_OPENAI_PORT = Number(process.env.MOCK_OPENAI_PORT || 3211);
const VERIFY_PORT = Number(process.env.VERIFY_PORT || 3006);

process.env.OPENAI_API_BASE_URL = `http://127.0.0.1:${MOCK_OPENAI_PORT}/v1`;

const {
  adaptOpenAIConversationItems,
  validateConversationDoc,
} = require('../web/public/js/conversation-adapters.js');
const {
  API_KEYS_FILE,
  OPENAI_CONVERSATION_INDEX_FILE,
  startServer,
  server,
} = require('../web/server.js');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8'));
}

function requestJson(port, method, targetPath, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: targetPath,
      method,
      headers: body
        ? { 'Content-Type': 'application/json' }
        : undefined,
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = raw ? JSON.parse(raw) : null;
        } catch (error) {
          json = null;
        }
        resolve({ status: res.statusCode, json, body: raw });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function requestText(port, targetPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: targetPath,
      method: 'GET',
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });

    req.on('error', reject);
    req.end();
  });
}

function createMockOpenAIServer() {
  const conversation = readFixture('openai-conversation.json');
  const items = readFixture('openai-conversation-items.json');

  return http.createServer((req, res) => {
    if (req.headers.authorization !== 'Bearer sk-test-openai-api-import') {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: { message: 'Unauthorized' } }));
      return;
    }

    if (req.method === 'GET' && req.url === `/v1/conversations/${conversation.id}`) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(conversation));
      return;
    }

    if (req.method === 'GET' && req.url.startsWith(`/v1/conversations/${conversation.id}/items`)) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(items));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: { message: 'Not Found' } }));
  });
}

function snapshotFile(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }

  return null;
}

function restoreFile(filePath, content) {
  if (content === null) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

async function runAdapterChecks() {
  const items = readFixture('openai-conversation-items.json');
  const doc = adaptOpenAIConversationItems(items, {
    conversationId: 'conv_test_001',
    title: 'OpenAI 平台追蹤對話',
  });

  validateConversationDoc(doc);
  assert.strictEqual(doc.messages.length, 4);
  assert.strictEqual(doc.messages[0].source, 'chatgpt-api');
  assert.strictEqual(doc.messages[1].role, 'assistant');
  assert.match(doc.messages[3].content, /tracked sessions/);

  console.log('PASS adapter contract');
}

async function runServerSmoke() {
  const mockOpenAIServer = createMockOpenAIServer();
  const apiKeysBackup = snapshotFile(API_KEYS_FILE);
  const conversationIndexBackup = snapshotFile(OPENAI_CONVERSATION_INDEX_FILE);

  await new Promise((resolve, reject) => {
    mockOpenAIServer.listen(MOCK_OPENAI_PORT, '127.0.0.1', (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    startServer(VERIFY_PORT, resolve);
  });

  try {
    const initialSettings = await requestJson(VERIFY_PORT, 'GET', '/api/settings/openai');
    assert.strictEqual(initialSettings.status, 200);
    assert.strictEqual(initialSettings.json.configured, false);

    const saveSettings = await requestJson(VERIFY_PORT, 'POST', '/api/settings/openai', {
      apiKey: 'sk-test-openai-api-import',
    });
    assert.strictEqual(saveSettings.status, 200);
    assert.strictEqual(saveSettings.json.configured, true);
    assert.match(saveSettings.json.maskedKey, /^sk-t/);

    const emptySessions = await requestJson(VERIFY_PORT, 'GET', '/api/chatgpt/sessions');
    assert.strictEqual(emptySessions.status, 200);
    assert.deepStrictEqual(emptySessions.json.sessions, []);

    const directLoadBeforeTracking = await requestJson(
      VERIFY_PORT,
      'GET',
      '/api/chatgpt/session?conversationId=conv_test_001'
    );
    assert.strictEqual(directLoadBeforeTracking.status, 400);
    assert.match(directLoadBeforeTracking.json.error, /尚未追蹤|追蹤 Conversation/);

    const tracked = await requestJson(VERIFY_PORT, 'POST', '/api/chatgpt/sessions/track', {
      conversationId: 'conv_test_001',
    });
    assert.strictEqual(tracked.status, 200);
    assert.strictEqual(tracked.json.tracked, true);
    assert.strictEqual(tracked.json.summary.conversationId, 'conv_test_001');

    const listedSessions = await requestJson(VERIFY_PORT, 'GET', '/api/chatgpt/sessions');
    assert.strictEqual(listedSessions.status, 200);
    assert.strictEqual(listedSessions.json.sessions.length, 1);
    assert.strictEqual(listedSessions.json.sessions[0].source, 'chatgpt-api');
    assert.match(listedSessions.json.sessions[0].preview, /scope 收斂/);

    const loadedSession = await requestJson(VERIFY_PORT, 'GET', '/api/chatgpt/session?conversationId=conv_test_001');
    assert.strictEqual(loadedSession.status, 200);
    assert.strictEqual(loadedSession.json.summary.conversationId, 'conv_test_001');
    assert.strictEqual(loadedSession.json.conversationDoc.messages[0].source, 'chatgpt-api');
    assert.match(loadedSession.json.previewText, /local index/);

    const extractPage = await requestText(VERIFY_PORT, '/extract');
    assert.strictEqual(extractPage.status, 200);
    assert.match(extractPage.body, /ChatGPT API 載入/);
    assert.match(extractPage.body, /btn-track-chatgpt-session/);
    assert.match(extractPage.body, /btn-refresh-chatgpt-sessions/);

    const settingsPage = await requestText(VERIFY_PORT, '/settings');
    assert.strictEqual(settingsPage.status, 200);
    assert.match(settingsPage.body, /OpenAI API key/);
    assert.match(settingsPage.body, /local-only/);

    const extractScript = await requestText(VERIFY_PORT, '/js/extract.js');
    assert.strictEqual(extractScript.status, 200);
    assert.match(extractScript.body, /refreshChatGPTApiSessions/);
    assert.match(extractScript.body, /loadChatGPTApiSession/);

    const settingsScript = await requestText(VERIFY_PORT, '/js/settings.js');
    assert.strictEqual(settingsScript.status, 200);
    assert.match(settingsScript.body, /saveOpenAIKey/);
    assert.match(settingsScript.body, /refreshOpenAIKeyStatus/);

    console.log('PASS local API/settings smoke');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    await new Promise((resolve) => {
      mockOpenAIServer.close(() => resolve());
    });
    restoreFile(API_KEYS_FILE, apiKeysBackup);
    restoreFile(OPENAI_CONVERSATION_INDEX_FILE, conversationIndexBackup);
  }
}

async function main() {
  console.log('--- verify_chatgpt_api_auto_import ---');
  await runAdapterChecks();
  await runServerSmoke();
  console.log('ALL PASS chatgpt-api-auto-import verification');
}

main().catch((error) => {
  console.error('FAIL chatgpt-api-auto-import verification:', error.message);
  process.exit(1);
});
