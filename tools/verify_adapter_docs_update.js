const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const { PORT, startServer, server } = require('../web/server.js');

const VERIFY_PORT = Number(process.env.VERIFY_PORT || PORT + 7);
const CONVERSATION_SCHEMA_PATH = path.join(__dirname, '..', 'docs', 'workflows', 'conversation-schema.md');
const EXTRACT_HTML_PATH = path.join(__dirname, '..', 'web', 'public', 'extract.html');
const EXTRACT_SCRIPT_PATH = path.join(__dirname, '..', 'web', 'public', 'js', 'extract.js');

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
  const schemaDoc = fs.readFileSync(CONVERSATION_SCHEMA_PATH, 'utf8');
  const extractHtml = fs.readFileSync(EXTRACT_HTML_PATH, 'utf8');
  const extractScript = fs.readFileSync(EXTRACT_SCRIPT_PATH, 'utf8');

  assert.match(schemaDoc, /chatgpt-api/);
  assert.match(schemaDoc, /gemini/);
  assert.match(schemaDoc, /claude/);
  assert.match(schemaDoc, /V5 支援來源矩陣/);
  assert.match(schemaDoc, /tracked `conversationId`/);
  assert.match(schemaDoc, /Gemini 網頁複製的 transcript 全文/);
  assert.match(schemaDoc, /Claude\.ai 網頁複製的 transcript 全文/);

  assert.match(extractHtml, /支援格式：一般對話或人工整理後的純文字貼上/);
  assert.match(extractHtml, /支援格式：ChatGPT 分享頁 transcript、官方 conversation JSON \/ TXT/);
  assert.match(extractHtml, /支援格式：Gemini 網頁複製的 transcript 全文/);
  assert.match(extractHtml, /支援格式：Claude\.ai 網頁複製的 transcript 全文/);
  assert.match(extractHtml, /支援格式：本機 VS Code Copilot Chat session JSONL/);

  assert.match(extractScript, /支援格式：一般對話或人工整理後的純文字貼上/);
  assert.match(extractScript, /支援格式：ChatGPT transcript、官方 conversation JSON \/ TXT/);
  assert.match(extractScript, /支援格式：Gemini 網頁複製的 transcript 全文/);
  assert.match(extractScript, /支援格式：Claude\.ai transcript 全文/);
  assert.match(extractScript, /支援格式：本機 VS Code Copilot Chat session JSONL/);

  console.log('PASS adapter docs static contract');
}

async function runServerSmoke() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    startServer(VERIFY_PORT, resolve);
  });

  try {
    const extractPage = await fetchText('/extract');
    assert.strictEqual(extractPage.status, 200);
    assert.match(extractPage.body, /每個來源面板都會標示「支援格式」與目前限制/);
    assert.match(extractPage.body, /支援格式：ChatGPT 分享頁 transcript、官方 conversation JSON \/ TXT/);
    assert.match(extractPage.body, /支援格式：Gemini 網頁複製的 transcript 全文/);
    assert.match(extractPage.body, /支援格式：Claude\.ai 網頁複製的 transcript 全文/);
    assert.match(extractPage.body, /支援格式：本機 VS Code Copilot Chat session JSONL/);

    const extractScript = await fetchText('/js/extract.js');
    assert.strictEqual(extractScript.status, 200);
    assert.match(extractScript.body, /支援格式：一般對話或人工整理後的純文字貼上/);
    assert.match(extractScript.body, /需先在 \/settings 設定 key 並追蹤 conversationId/);

    console.log('PASS adapter docs extract smoke');
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
  console.log('--- verify_adapter_docs_update ---');
  runStaticChecks();
  await runServerSmoke();
  console.log('ALL PASS adapter-docs-update verification');
}

main().catch((error) => {
  console.error('FAIL adapter-docs-update verification:', error.message);
  process.exit(1);
});
