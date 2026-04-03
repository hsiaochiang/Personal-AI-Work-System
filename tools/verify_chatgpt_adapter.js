const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const {
  adaptChatGPTConversation,
  adaptConversationInput,
  conversationDocToText,
  validateConversationDoc,
} = require('../web/public/js/conversation-adapters.js');
const { PORT, startServer, server } = require('../web/server.js');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const VERIFY_PORT = Number(process.env.VERIFY_PORT || PORT + 2);

function readFixture(name) {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8');
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
  const transcript = readFixture('chatgpt-share-transcript.txt');
  const transcriptDoc = adaptChatGPTConversation(transcript);

  validateConversationDoc(transcriptDoc);
  assert.strictEqual(transcriptDoc.messages.length, 4);
  assert.strictEqual(transcriptDoc.messages[0].role, 'user');
  assert.strictEqual(transcriptDoc.messages[1].role, 'assistant');
  assert.ok(transcriptDoc.messages.every((message) => message.source === 'chatgpt'));
  assert.ok(transcriptDoc.messages.every((message) => message.timestamp === null));
  assert.match(conversationDocToText(transcriptDoc), /最小 JSON 上傳入口/);

  const jsonPayload = readFixture('chatgpt-conversations.json');
  const jsonDoc = adaptChatGPTConversation(jsonPayload, { inputFormatHint: 'chatgpt-json' });

  validateConversationDoc(jsonDoc);
  assert.strictEqual(jsonDoc.metadata.title, 'ChatGPT 最新討論');
  assert.strictEqual(jsonDoc.messages.length, 2);
  assert.strictEqual(jsonDoc.messages[0].role, 'user');
  assert.strictEqual(jsonDoc.messages[0].source, 'chatgpt');
  assert.match(jsonDoc.messages[0].timestamp, /^2024-/);
  assert.match(conversationDocToText(jsonDoc), /shared adapter module/);

  const fallbackDoc = adaptConversationInput('專案目標是保留 plain text fallback。');
  validateConversationDoc(fallbackDoc);
  assert.strictEqual(fallbackDoc.messages.length, 1);
  assert.strictEqual(fallbackDoc.messages[0].source, 'plain');

  console.log('PASS adapter contract');
}

async function runServerSmoke() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    startServer(VERIFY_PORT, resolve);
  });

  try {
    const extractPage = await fetchText('/extract');
    assert.strictEqual(extractPage.status, 200);
    assert.match(extractPage.body, /上傳 ChatGPT JSON \/ TXT/);
    assert.match(extractPage.body, /ConversationDoc/);

    const adapterScript = await fetchText('/js/conversation-adapters.js');
    assert.strictEqual(adapterScript.status, 200);
    assert.match(adapterScript.body, /adaptChatGPTConversation/);
    assert.match(adapterScript.body, /adaptConversationInput/);

    console.log('PASS local extract smoke');
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
  console.log('--- verify_chatgpt_adapter ---');
  await runAdapterChecks();
  await runServerSmoke();
  console.log('ALL PASS chatgpt adapter verification');
}

main().catch((error) => {
  console.error('FAIL chatgpt adapter verification:', error.message);
  process.exit(1);
});
