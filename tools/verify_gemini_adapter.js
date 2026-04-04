const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const {
  adaptConversationInput,
  adaptGeminiConversation,
  conversationDocToText,
  validateConversationDoc,
} = require('../web/public/js/conversation-adapters.js');
const memorySourceUtils = require('../web/public/js/memory-source-utils.js');
const { PORT, startServer, server } = require('../web/server.js');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const VERIFY_PORT = Number(process.env.VERIFY_PORT || PORT + 5);

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
  const transcript = readFixture('gemini-share-transcript.txt');
  const transcriptDoc = adaptGeminiConversation(transcript, { inputFormatHint: 'gemini-text' });

  validateConversationDoc(transcriptDoc);
  assert.strictEqual(transcriptDoc.messages.length, 4);
  assert.strictEqual(transcriptDoc.messages[0].role, 'user');
  assert.strictEqual(transcriptDoc.messages[1].role, 'assistant');
  assert.ok(transcriptDoc.messages.every((message) => message.source === 'gemini'));
  assert.match(conversationDocToText(transcriptDoc), /Gemini adapter/);

  const autoDetectedDoc = adaptConversationInput(transcript);
  validateConversationDoc(autoDetectedDoc);
  assert.strictEqual(autoDetectedDoc.messages[0].source, 'gemini');

  assert.deepStrictEqual(memorySourceUtils.getMemorySourcePresentation('gemini'), {
    label: 'Gemini',
    className: 'source-gemini',
  });
  assert.strictEqual(
    memorySourceUtils.buildAttributedMemoryListItem('保留 Gemini 來源標記', 'gemini'),
    '- 保留 Gemini 來源標記 <!-- source: gemini -->'
  );
  assert.throws(() => adaptGeminiConversation('僅有一段普通文字'), /Gemini transcript/);

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
    assert.match(extractPage.body, /value="gemini"/);
    assert.match(extractPage.body, /Gemini 匯入/);
    assert.match(extractPage.body, /Gemini adapter/);

    const adapterScript = await fetchText('/js/conversation-adapters.js');
    assert.strictEqual(adapterScript.status, 200);
    assert.match(adapterScript.body, /adaptGeminiConversation/);

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
  console.log('--- verify_gemini_adapter ---');
  await runAdapterChecks();
  await runServerSmoke();
  console.log('ALL PASS gemini adapter verification');
}

main().catch((error) => {
  console.error('FAIL gemini adapter verification:', error.message);
  process.exit(1);
});
