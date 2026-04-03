const assert = require('assert');
const http = require('http');

const {
  adaptPlainTextConversation,
  conversationDocToText,
  validateConversationDoc,
} = require('../web/public/js/conversation-adapters.js');
const { PORT, startServer, server } = require('../web/server.js');

function fetchText(targetPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
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
  const sampleText = [
    '專案目標是把既有純文字流程抽成 PlainTextAdapter。',
    '不要引入新的前端框架。',
  ].join('\n\n');

  const doc = adaptPlainTextConversation(sampleText, { title: 'plain-text sample' });

  validateConversationDoc(doc);
  assert.strictEqual(doc.metadata.schemaVersion, 'v1');
  assert.strictEqual(doc.messages.length, 1);
  assert.strictEqual(doc.messages[0].role, 'user');
  assert.strictEqual(doc.messages[0].source, 'plain');
  assert.strictEqual(doc.messages[0].timestamp, null);
  assert.strictEqual(conversationDocToText(doc), sampleText);
  assert.throws(() => adaptPlainTextConversation('   '), /非空文字輸入/);
  assert.throws(() => validateConversationDoc({
    messages: [{ role: 'user', content: 'x', source: 'plain', timestamp: 'April 3, 2026' }],
    metadata: { schemaVersion: 'v1', importedAt: new Date().toISOString() },
  }), /ISO 8601/);
  assert.throws(() => validateConversationDoc({
    messages: [{ role: 'user', content: 'x', source: 'plain', timestamp: null }],
    metadata: { schemaVersion: 'v1', importedAt: 'April 3, 2026' },
  }), /ISO 8601/);

  console.log('PASS adapter contract');
}

async function runServerSmoke() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    startServer(PORT, resolve);
  });

  try {
    const extractPage = await fetchText('/extract');
    assert.strictEqual(extractPage.status, 200);
    assert.match(extractPage.body, /PlainTextAdapter/);
    assert.match(extractPage.body, /\/js\/conversation-adapters\.js/);

    const adapterScript = await fetchText('/js/conversation-adapters.js');
    assert.strictEqual(adapterScript.status, 200);
    assert.match(adapterScript.body, /adaptPlainTextConversation/);

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
  console.log('--- verify_plain_text_adapter ---');
  await runAdapterChecks();
  await runServerSmoke();
  console.log('ALL PASS plain-text adapter verification');
}

main().catch((error) => {
  console.error('FAIL plain-text adapter verification:', error.message);
  process.exit(1);
});
