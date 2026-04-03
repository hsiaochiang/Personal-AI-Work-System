const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const {
  adaptVSCodeCopilotConversation,
  conversationDocToText,
  listVSCodeCopilotSessionsFromDirectory,
  summarizeVSCodeCopilotSession,
  validateConversationDoc,
} = require('../web/public/js/conversation-adapters.js');
const { PORT, startServer, server } = require('../web/server.js');

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'copilot-sessions');
const VERIFY_PORT = Number(process.env.VERIFY_PORT || PORT + 3);

function readFixture(name) {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8');
}

function fetchJSON(targetPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: VERIFY_PORT,
      path: targetPath,
      method: 'GET',
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (error) {
          parsed = null;
        }
        resolve({ status: res.statusCode, body, json: parsed });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function fetchText(targetPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: VERIFY_PORT,
      path: targetPath,
      method: 'GET',
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.end();
  });
}

async function runAdapterChecks() {
  const raw = readFixture('sample-session.jsonl');
  const doc = adaptVSCodeCopilotConversation(raw, { fileName: 'sample-session.jsonl' });

  validateConversationDoc(doc);
  assert.strictEqual(doc.messages.length, 4);
  assert.strictEqual(doc.messages[0].role, 'user');
  assert.strictEqual(doc.messages[1].role, 'assistant');
  assert.ok(doc.messages.every((message) => message.source === 'copilot'));
  assert.strictEqual(doc.metadata.title, '整理 V3 local import scope');
  assert.strictEqual(doc.metadata.sessionId, 'copilot-session-001');
  assert.match(conversationDocToText(doc), /read-only API/);

  const summary = summarizeVSCodeCopilotSession(raw, {
    fileName: 'sample-session.jsonl',
    updatedAt: '2026-01-31T23:53:45+08:00',
  });
  assert.strictEqual(summary.requestCount, 2);
  assert.strictEqual(summary.messageCount, 4);
  assert.match(summary.preview, /請幫我整理 V3 local import/);

  const listedSessions = listVSCodeCopilotSessionsFromDirectory(FIXTURES_DIR, { maxSessions: 5 });
  assert.strictEqual(listedSessions.length, 1);
  assert.strictEqual(listedSessions[0].fileName, 'sample-session.jsonl');
  assert.strictEqual(listedSessions[0].title, '整理 V3 local import scope');

  console.log('PASS adapter contract');
}

async function runServerSmoke() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    startServer(VERIFY_PORT, resolve);
  });

  try {
    const sessionDir = encodeURIComponent(FIXTURES_DIR);
    const listRes = await fetchJSON(`/api/copilot/sessions?sessionDir=${sessionDir}`);
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.json);
    assert.strictEqual(listRes.json.sessions.length, 1);
    assert.strictEqual(listRes.json.sessions[0].fileName, 'sample-session.jsonl');

    const loadRes = await fetchJSON(`/api/copilot/session?sessionDir=${sessionDir}&fileName=sample-session.jsonl`);
    assert.strictEqual(loadRes.status, 200);
    assert.ok(loadRes.json);
    assert.strictEqual(loadRes.json.conversationDoc.messages.length, 4);
    assert.strictEqual(loadRes.json.summary.sessionId, 'copilot-session-001');

    const extractPage = await fetchText('/extract');
    assert.strictEqual(extractPage.status, 200);
    assert.match(extractPage.body, /VS Code Copilot 本機匯入/);
    assert.match(extractPage.body, /刷新 Copilot Sessions/);

    const adapterScript = await fetchText('/js/conversation-adapters.js');
    assert.strictEqual(adapterScript.status, 200);
    assert.match(adapterScript.body, /adaptVSCodeCopilotConversation/);
    assert.match(adapterScript.body, /listVSCodeCopilotSessionsFromDirectory/);

    console.log('PASS local import smoke');
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
  }
}

async function main() {
  console.log('--- verify_local_import_vscode_copilot ---');
  await runAdapterChecks();
  await runServerSmoke();
  console.log('ALL PASS local-import-vscode-copilot verification');
}

main().catch((error) => {
  console.error('FAIL local-import-vscode-copilot verification:', error.message);
  process.exit(1);
});
