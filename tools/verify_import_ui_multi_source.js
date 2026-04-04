const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const { PORT, startServer, server } = require('../web/server.js');

const VERIFY_PORT = Number(process.env.VERIFY_PORT || PORT + 4);
const EXTRACT_SCRIPT_PATH = path.join(__dirname, '..', 'web', 'public', 'js', 'extract.js');
const EXTRACT_STYLE_PATH = path.join(__dirname, '..', 'web', 'public', 'css', 'style.css');

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

function runStaticChecks() {
  const extractScript = fs.readFileSync(EXTRACT_SCRIPT_PATH, 'utf8');
  const extractStyles = fs.readFileSync(EXTRACT_STYLE_PATH, 'utf8');

  assert.match(extractScript, /selectedImportSource = 'plain'/);
  assert.match(extractScript, /import-source-select/);
  assert.match(extractScript, /adaptChatGPTConversation/);
  assert.match(extractScript, /adaptGeminiConversation/);
  assert.match(extractScript, /adaptPlainTextConversation/);
  assert.match(extractScript, /candidate-source-badge/);
  assert.match(extractScript, /來源：/);

  assert.match(extractStyles, /\.extract-source-selector/);
  assert.match(extractStyles, /\.chatgpt-import-panel/);
  assert.match(extractStyles, /\.candidate-source-badge/);

  console.log('PASS static source-aware UI contract');
}

async function runServerSmoke() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    startServer(VERIFY_PORT, resolve);
  });

  try {
    const extractPage = await fetchText('/extract');
    assert.strictEqual(extractPage.status, 200);
    assert.match(extractPage.body, /id="import-source-select"/);
    assert.match(extractPage.body, /value="plain"/);
    assert.match(extractPage.body, /value="chatgpt"/);
    assert.match(extractPage.body, /value="gemini"/);
    assert.match(extractPage.body, /value="copilot"/);
    assert.match(extractPage.body, /source-panel-copilot/);
    assert.match(extractPage.body, /source-panel-chatgpt/);
    assert.match(extractPage.body, /source-panel-gemini/);
    assert.match(extractPage.body, /source-panel-plain/);

    const extractScript = await fetchText('/js/extract.js');
    assert.strictEqual(extractScript.status, 200);
    assert.match(extractScript.body, /setImportSource/);
    assert.match(extractScript.body, /candidate-source-badge/);

    const extractStyle = await fetchText('/css/style.css');
    assert.strictEqual(extractStyle.status, 200);
    assert.match(extractStyle.body, /\.extract-source-selector/);
    assert.match(extractStyle.body, /\.candidate-source-badge/);

    console.log('PASS import UI smoke');
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
  console.log('--- verify_import_ui_multi_source ---');
  runStaticChecks();
  await runServerSmoke();
  console.log('ALL PASS import-ui-multi-source verification');
}

main().catch((error) => {
  console.error('FAIL import-ui-multi-source verification:', error.message);
  process.exit(1);
});
