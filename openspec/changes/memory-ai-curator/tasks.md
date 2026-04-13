# Tasks: memory-ai-curator

> **狀態**：Not Started  
> **建立日期**：2026-04-13  
>
> **執行原則**：每個 Task 獨立可驗收。後端先行，前端依賴後端完成後再做。  
> Task 順序：T-01 → T-02 → T-03 → T-04 → T-05（前四個可平行，T-05 需等 T-01~T-04 完成）

---

## Task 列表

### T-01：後端 — 新增 `POST /api/memory/item/delete` 路由

**檔案**：`web/server.js`  
**位置**：加在 `/api/memory/dedup` 路由之後，`return false;` 之前  

**實作細節**：

```javascript
if (url.pathname === '/api/memory/item/delete' && req.method === 'POST') {
  try {
    const payload = await readJsonRequestBody(req);
    const filename = (payload.filename || '').trim();
    const itemId = (payload.itemId || '').trim();
    if (!filename || !itemId) {
      sendJSON(res, 400, { error: 'filename 與 itemId 為必填' });
      return true;
    }
    const resolved = getWritableMemoryFilePath(MEMORY_DIR, filename);
    const currentContent = fs.readFileSync(resolved, 'utf8');

    // 找到 itemId 對應的行（格式：行內含 <!-- id: {itemId} -->）
    const lines = currentContent.split('\n');
    const targetIdx = lines.findIndex(l => l.includes(`<!-- id: ${itemId} -->`));
    if (targetIdx === -1) {
      sendJSON(res, 404, { error: `找不到 itemId: ${itemId}` });
      return true;
    }
    // 刪除有 itemId 標記的整行
    lines.splice(targetIdx, 1);
    const updatedContent = lines.join('\n');

    writeMemoryFileWithBackup(MEMORY_DIR, BACKUP_DIR, resolved, updatedContent, (err, backedUp) => {
      if (err) { sendJSON(res, 500, { error: err.message }); return; }
      sendJSON(res, 200, { success: true, filename, backedUp });
    });
  } catch (error) {
    const message = error && error.message ? error.message : 'delete failed';
    const statusCode = /whitelist|Path traversal/i.test(message) ? 403 : 400;
    sendJSON(res, statusCode, { error: message });
  }
  return true;
}
```

**注意**：記憶條目的 itemId 由 `memory-source-utils.js` 的 `parseMemoryMarkdown()` 產生。需確認 itemId 以行內 HTML comment 格式嵌入（若目前不是，見 T-02 處理）。

**驗收條件**：
- [ ] `POST /api/memory/item/delete` 帶合法 filename + itemId → 200 `{ success: true }`
- [ ] filename 不在白名單 → 403
- [ ] itemId 找不到 → 404
- [ ] 成功後 `docs/memory/.backup/` 有備份檔

---

### T-02：確認/修正 itemId 機制是否支援刪除

**檔案**：`web/public/js/memory-source-utils.js`（檢查）、`web/server.js`（可能調整）  

**背景**：`parseMemoryMarkdown()` 已產生 `itemId`，需確認其格式。若 itemId 以 property 形式存在（記憶體中），而 markdown 檔案裡的行沒有對應標記，T-01 的行刪除邏輯需改為「依行號」或「依行內容 hash」定位。

**實作細節**：

1. 讀取 `web/public/js/memory-source-utils.js` 的 `parseMemoryMarkdown`，確認 `itemId` 的產生邏輯
2. 若 itemId 是 content hash（例如 MD5）：T-01 的刪除改為「找到 content 完全匹配的行再刪」
3. 若 itemId 是以 `<!-- id: xxx -->` 嵌入檔案中：T-01 實作如上不變
4. 若 itemId 只存在解析後的 runtime 物件：後端刪除改接受 `{ filename, lineContent }` 作為定位依據（行內容 match）

**驗收條件**：
- [ ] 確認 itemId 定位機制，在此 task 的 comment 中記錄確認結果
- [ ] 無論哪種機制，`POST /api/memory/item/delete` 能正確找到並刪除目標行
- [ ] 刪除後原有其他行不受影響

---

### T-03：後端 — 新增 `POST /api/memory/ai-curate` 路由

**檔案**：`web/server.js`  
**位置**：加在 `/api/memory/ai-review` 路由之後

**實作細節**：

```javascript
if (url.pathname === '/api/memory/ai-curate' && req.method === 'POST') {
  try {
    const apiKey = getRequiredGeminiApiKey();
    const payload = await readJsonRequestBody(req);
    const filename = (payload.filename || '').trim();
    const resolved = getWritableMemoryFilePath(MEMORY_DIR, filename);
    const fileContent = fs.readFileSync(resolved, 'utf8');

    const categoryLabels = {
      'decision-log.md': '決策紀錄',
      'output-patterns.md': '輸出模式',
      'preference-rules.md': '偏好規則',
      'project-context.md': '專案背景',
      'skill-candidates.md': '技能候選',
      'task-patterns.md': '任務模式',
    };
    const categoryLabel = categoryLabels[filename] || filename;

    const prompt = `你是個人 AI 工作系統的記憶品質專家。
以下是「${categoryLabel}」（${filename}）的完整內容：

---
${fileContent}
---

請整理並改善這份記憶文件，原則：
1. 移除明顯過時或不再正確的條目（說明為何移除）
2. 合併高度重複的條目
3. 補充缺少來源或日期的標記（格式：<!-- source: 來源 date: YYYY-MM-DD -->）
4. 維持原有的 Markdown 格式結構（## 標題、- bullet）
5. 不要增加原本沒有的新知識

直接回傳改善後的完整 Markdown 文字，不要有說明前言。
在文件最後附上異動摘要（HTML 注解格式）：
<!-- curator-summary: 你做了什麼 -->`;

    // ai-curate 回傳純文字 markdown，不需要 JSON 模式
    const endpoint = `${GEMINI_API_BASE_URL}/${GEMINI_EXTRACT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const reqBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
      // 注意：不加 responseMimeType: 'application/json'，因為回傳 markdown
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    });
    const responseBody = await response.json();
    if (!response.ok) {
      const errMsg = responseBody?.error?.message || `${response.status}`;
      sendJSON(res, 500, { error: `Gemini API 錯誤：${errMsg}` });
      return true;
    }
    const improved = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!improved) {
      sendJSON(res, 500, { error: 'Gemini 回傳內容為空' });
      return true;
    }

    // 擷取 curator-summary
    const summaryMatch = improved.match(/<!--\s*curator-summary:\s*([\s\S]*?)\s*-->/);
    const summary = summaryMatch ? summaryMatch[1].trim() : '（無摘要）';

    sendJSON(res, 200, { filename, original: fileContent, improved, summary });
  } catch (error) {
    const message = error && error.message ? error.message : 'curate failed';
    sendJSON(res, 500, { error: message });
  }
  return true;
}
```

**驗收條件**：
- [ ] 帶合法 filename + Gemini key 已設定 → 200 回傳 `{ filename, original, improved, summary }`
- [ ] `improved` 欄位是合法 markdown 字串
- [ ] Gemini key 未設定 → 400
- [ ] filename 不在白名單 → 403

---

### T-04：前端 JS — 為記憶條目加入刪除按鈕與 KPI 篩選

**檔案**：`web/public/js/memory.js`  

**實作細節**：

**4a. KPI「建議清理」點擊篩選**

在 `loadMemoryData()` 完成後，加入：
```javascript
// KPI 篩選
let filterMode = 'all'; // 'all' | 'needsAttention'

document.getElementById('kpi-cleanup').style.cursor = 'pointer';
document.getElementById('kpi-cleanup').addEventListener('click', () => {
  filterMode = filterMode === 'needsAttention' ? 'all' : 'needsAttention';
  document.getElementById('kpi-cleanup').closest('.kpi-card').classList.toggle('kpi-active', filterMode === 'needsAttention');
  renderMemory(container, parsed, filterMode);
});
```

在 `renderMemory(container, files, filterMode = 'all')` 中：
- 若 `filterMode === 'needsAttention'`，只渲染 `item.health && item.health.status !== 'healthy'` 的條目
- 若過濾後某 group 無條目，skip 該 group；若某 category 無 group，顯示「此分類目前無待處理條目」

**4b. 刪除按鈕**

在 `renderMemory()` 的條目渲染區（`category.appendChild(card)` 之前），加入：
```javascript
const deleteBtn = document.createElement('button');
deleteBtn.className = 'btn-icon memory-item-delete';
deleteBtn.title = '刪除此條目';
deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
deleteBtn.addEventListener('click', () => handleMemoryItemDelete(file.filename, item.itemId, item.content));
card.appendChild(deleteBtn);
```

新增函式：
```javascript
async function handleMemoryItemDelete(filename, itemId, content) {
  if (!window.confirm(`確認刪除此條目？\n\n${content.slice(0, 100)}`)) return;
  try {
    await apiPost('/api/memory/item/delete', { filename, itemId });
    await loadMemoryData();
  } catch (e) {
    alert('刪除失敗：' + e.message);
  }
}
```

**驗收條件**：
- [ ] 每個記憶條目右下角有刪除 icon，hover 才明顯
- [ ] 點擊刪除 → confirm() → 呼叫後端 → 重新載入頁面資料
- [ ] KPI「建議清理」點擊後只顯示 health ≠ healthy 的條目
- [ ] 再次點擊 KPI 或有「顯示全部」可回到完整列表

---

### T-05：前端 JS — AI 整理分類按鈕與確認 panel

**檔案**：`web/public/js/memory.js`（主要）、`web/public/css/style.css`（新增樣式）

**實作細節**：

**5a. 在 category header 加入「AI 整理」按鈕**

在 `renderMemory()` 的 `header.appendChild(count)` 之後加：
```javascript
const curateBtn = document.createElement('button');
curateBtn.className = 'btn btn-ghost btn-sm memory-curate-btn';
curateBtn.innerHTML = '✨ AI 整理';
curateBtn.addEventListener('click', () => handleAICurate(file.filename, category));
header.appendChild(curateBtn);
```

**5b. AI 整理執行函式**

```javascript
async function handleAICurate(filename, categoryEl) {
  // 移除舊的 panel（若有）
  const existing = categoryEl.querySelector('.memory-curate-panel');
  if (existing) existing.remove();

  const btn = categoryEl.querySelector('.memory-curate-btn');
  btn.disabled = true;
  btn.textContent = '分析中…';

  try {
    const data = await apiPost('/api/memory/ai-curate', { filename });

    // 建立預覽 panel
    const panel = document.createElement('div');
    panel.className = 'memory-curate-panel card';
    panel.innerHTML = `
      <div class="memory-curate-panel-header">
        <strong>AI 整理建議</strong>
        <span class="memory-curate-summary">${escapeHTML(data.summary)}</span>
      </div>
      <div class="memory-curate-diff">
        <div class="memory-curate-side">
          <div class="memory-curate-label">原始內容</div>
          <pre class="memory-curate-pre">${escapeHTML(data.original)}</pre>
        </div>
        <div class="memory-curate-side">
          <div class="memory-curate-label">AI 改善版本</div>
          <pre class="memory-curate-pre">${escapeHTML(data.improved)}</pre>
        </div>
      </div>
      <div class="memory-curate-actions">
        <button class="btn btn-primary" id="btn-curate-confirm">確認覆寫</button>
        <button class="btn btn-ghost" id="btn-curate-skip">略過</button>
      </div>`;

    categoryEl.appendChild(panel);

    panel.querySelector('#btn-curate-skip').addEventListener('click', () => panel.remove());
    panel.querySelector('#btn-curate-confirm').addEventListener('click', async () => {
      await apiPost('/api/memory/write', { filename: data.filename, content: data.improved });
      panel.remove();
      await loadMemoryData();
    });
  } catch (e) {
    alert('AI 整理失敗：' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✨ AI 整理';
  }
}
```

**5c. style.css 新增樣式**

```css
/* memory-item 刪除按鈕 */
.memory-item { position: relative; }
.memory-item-delete {
  position: absolute; bottom: 0.5rem; right: 0.5rem;
  opacity: 0; transition: opacity 0.15s;
  color: var(--color-danger);
}
.memory-item:hover .memory-item-delete { opacity: 1; }

/* KPI active 篩選 */
.kpi-card.kpi-active { background: var(--primary); color: #fff; }
.kpi-card.kpi-active .kpi-label { color: rgba(255,255,255,0.8); }
.kpi-card.kpi-active .kpi-value { color: #fff; }

/* AI 整理 panel */
.memory-curate-panel {
  margin: 0.75rem 0 1rem;
  border: 1px solid var(--primary);
}
.memory-curate-panel-header { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 0.75rem; }
.memory-curate-summary { font-size: 0.85rem; color: var(--text-muted); }
.memory-curate-diff { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.memory-curate-side { display: flex; flex-direction: column; }
.memory-curate-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.25rem; }
.memory-curate-pre {
  flex: 1; padding: 0.75rem; background: var(--surface-variant);
  border-radius: 6px; font-size: 0.78rem; overflow: auto; max-height: 400px; white-space: pre-wrap;
}
.memory-curate-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
```

**驗收條件**：
- [ ] 每個記憶分類標題列出現「✨ AI 整理」按鈕
- [ ] 點擊後呈現 loading 狀態，回傳後展開 before/after panel
- [ ] 「確認覆寫」→ 呼叫 `/api/memory/write` → 重新載入
- [ ] 「略過」→ 關閉 panel，不修改資料
- [ ] Gemini key 未設定時顯示清楚錯誤訊息（hint 連結至 /settings）

---

### T-06：AI 審查結果加入「跳至分類」連結

**檔案**：`web/public/memory.html`（inline script）  

**背景**：v1.1.10 已加入 AI 品質審查按鈕與結果 panel，結果以 `{ file, severity, issue, suggestion }` 呈現。  

**實作細節**：

在 `ai-review` inline script 的 `itemsHtml` 產生邏輯，將 `it.file` 改為可點擊：

```javascript
const itemsHtml = items.map(it => `
  <div style="border-left:3px solid var(--border-color);padding:0.5rem 0.75rem;margin-bottom:0.6rem">
    <div style="display:flex;gap:0.4rem;align-items:baseline">
      <span>${severityIcon(it.severity)}</span>
      <a href="#category-${it.file.replace('.md','')}" 
         style="font-size:0.85rem;color:var(--primary);text-decoration:none;font-weight:600"
         onclick="document.getElementById('category-${it.file.replace('.md','')}')?.scrollIntoView({behavior:'smooth'});return false;">
        ${it.file}
      </a>
    </div>
    <p style="margin:0.25rem 0 0;font-size:0.9rem">${it.issue}</p>
    <p style="margin:0.2rem 0 0;font-size:0.85rem;color:var(--text-muted)">💡 ${it.suggestion}</p>
  </div>`).join('');
```

並在 `renderMemory()` 的 category 元素加上 id：
```javascript
// 在 memory.js 的 renderMemory() 中
category.id = `category-${file.filename.replace('.md', '')}`;
```

**驗收條件**：
- [ ] AI 審查結果每條 filename 可點擊，點後頁面滑動到對應分類
- [ ] category 容器有對應的 `id` 屬性

---

## 執行順序建議

```
T-02（確認 itemId 機制）
  ↓
T-01（後端刪除路由，依 T-02 結果）
T-03（後端 AI curate 路由）[可與 T-01 平行]
  ↓
T-04（前端刪除按鈕 + KPI 篩選）[依賴 T-01]
T-05（前端 AI 整理 panel）[依賴 T-03]
T-06（AI 審查跳至分類）[獨立，可最後做]
```

## 整體驗收標準

- [ ] `/memory` 頁面每個條目有刪除按鈕（hover 顯示）
- [ ] KPI「建議清理」點擊可篩選，顯示問題條目
- [ ] 每個分類有「✨ AI 整理」按鈕，可呼叫 Gemini 整理並確認覆寫
- [ ] AI 審查結果每個建議可跳至對應分類
- [ ] 所有刪除/覆寫操作前均有備份
- [ ] Gemini key 未設定時，AI 相關功能顯示友善錯誤（而非崩潰）
- [ ] DEV localhost:3000 全功能測試通過後部署 PROD
