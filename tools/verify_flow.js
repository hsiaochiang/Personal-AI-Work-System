const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const MOCK_PROJECT_ID = 'mock-test';

async function fetchJSON(url, method = 'GET', body = null) {
  const options = { method };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- 開始執行 V2 E2E Flow Validation ---');

  // 1. Check Default Project Roadmap
  let res = await fetchJSON(`${API_BASE}/roadmap`);
  if (res.status !== 200 || !res.data.content) throw new Error('Failed to load default roadmap');
  console.log('✅ 成功載入預設專案 Roadmap');

  // 2. Check Mock Project Roadmap
  res = await fetchJSON(`${API_BASE}/roadmap?projectId=${MOCK_PROJECT_ID}`);
  if (res.status !== 200 || !res.data.content.includes('Mock Roadmap')) throw new Error('Failed to load mock roadmap');
  console.log('✅ 成功切換專案，載入 Mock 專案 Roadmap');

  // 3. Writeback to Mock Project Memory
  const writePayload = {
    filename: 'preference-rules.md',
    content: '## E2E Test\n\n- E2E 測試寫入資料\n'
  };
  res = await fetchJSON(`${API_BASE}/memory/write?projectId=${MOCK_PROJECT_ID}`, 'POST', writePayload);
  if (res.status !== 200 || !res.data.success) throw new Error('Failed to write memory');
  console.log(`✅ 成功寫入記憶 (自動備份: ${res.data.backedUp})`);

  // 4. Verify Writeback
  res = await fetchJSON(`${API_BASE}/rules?projectId=${MOCK_PROJECT_ID}`);
  const ruleFile = res.data.files.find(f => f.filename === 'preference-rules.md');
  if (!ruleFile || !ruleFile.content.includes('E2E 測試寫入資料')) {
    throw new Error('Memory writeback validation failed');
  }
  console.log('✅ 成功重新讀取確認寫回結果');

  // 5. Check Backup
  const backupPath = path.resolve(__dirname, '../temp-mock/docs/memory/.backup/preference-rules.md');
  if (fs.existsSync(backupPath)) {
    console.log('✅ 成功確認 Backup 檔案存在');
  } else {
    // If it was the first time writing, there might not be a backup yet.
    // Let's write again to trigger a backup.
    const writePayload2 = {
      filename: 'preference-rules.md',
      content: '## E2E Test 2\n\n- E2E 測試寫入資料第二版\n'
    };
    await fetchJSON(`${API_BASE}/memory/write?projectId=${MOCK_PROJECT_ID}`, 'POST', writePayload2);
    if (fs.existsSync(backupPath)) {
      console.log('✅ 成功確認 Backup 檔案存在 (覆寫後)');
    } else {
      throw new Error('Backup file not found after overwrite');
    }
  }

  // 6. Verify isolation
  res = await fetchJSON(`${API_BASE}/rules`);
  const defaultRuleFile = res.data.files.find(f => f.filename === 'preference-rules.md');
  if (defaultRuleFile && defaultRuleFile.content.includes('E2E 測試寫入資料')) {
    throw new Error('Project isolation failed! Data leaked to default project.');
  }
  console.log('✅ 成功確認專案資料隔離');

  console.log('\n🎉 所有 E2E 工作流驗證通過！');
}

run().catch(err => {
  console.error('\n❌ 驗證失敗:', err.message);
  process.exit(1);
});
