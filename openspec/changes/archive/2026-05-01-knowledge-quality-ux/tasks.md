# Tasks: knowledge-quality-ux

> **狀態**：已完成 ✅  
> **建立日期**：2026-05-01  
> **完成日期**：2026-05-01  
> **對應 design**：`design.md`  
> **修改目標環境**：PAIS PROD (`d:\prod\Personal-AI-Work-System\web\public\`)

---

## Task 列表

---

### T-01：修復 `<select>` 無 accessible name（P0-A11Y-01）

**檔案**：`web/public/extract.html`  
**預估時間**：15 分鐘  

**修改內容**：  
將第 81 行的 `<div class="extract-source-label">工具來源</div>` 改為 `<label>` 並加入 `for="import-source-select"` 屬性。

**目前程式碼（context 含前後 3 行）**：
```html
        <div class="extract-source-copy">
            <div class="extract-source-label">工具來源</div>
            <p class="extract-source-hint" id="import-source-hint">選擇要匯入的工具來源；每個來源面板都會標示「支援格式」與目前限制。</p>
          </div>
```

**修改後**：
```html
        <div class="extract-source-copy">
            <label class="extract-source-label" for="import-source-select">工具來源</label>
            <p class="extract-source-hint" id="import-source-hint">選擇要匯入的工具來源；每個來源面板都會標示「支援格式」與目前限制。</p>
          </div>
```

**驗收條件**：
- [x] axe-core 重新掃描 extract 頁面，`select-name` violation 不再出現
- [x] 螢幕閱讀器（或 axe DevTools）聚焦 `<select>` 時朗讀「工具來源」

---

### T-02：候選卡片——加入類型選擇器（P1-KQ-01）

**檔案**：`web/public/js/extract.js`  
**預估時間**：45 分鐘  

#### 2-A：在 `renderCandidates()` 中替換靜態類型 span 為 `<select>`

**定位**：`renderCandidates()` 函式，`card.innerHTML = ` 的模板字串。

**目前的 `.candidate-category` 區塊（template 中）**：
```js
      <div class="candidate-category">
          <span class="material-symbols-outlined">${escapeHTML(cat.icon)}</span>
          <span>${escapeHTML(cat.label)}</span>
          <span class="confidence-badge" title="AI 評估此項值得保存的信心程度">${(cand.confidence * 100).toFixed(0)}%</span>
        </div>
```

**修改後**：
```js
      <div class="candidate-category">
          <span class="material-symbols-outlined category-icon">${escapeHTML(cat.icon)}</span>
          <select class="candidate-category-select" data-action="change-category" title="修改知識類型">
            ${Object.entries(CATEGORIES).map(([k, v]) =>
              `<option value="${escapeHTML(k)}"${k === cand.category ? ' selected' : ''}>${escapeHTML(v.label)}</option>`
            ).join('')}
          </select>
          <span class="confidence-badge" title="AI 評估此項值得保存的信心程度">${(cand.confidence * 100).toFixed(0)}%</span>
        </div>
```

#### 2-B：加入 `change` 監聽器（在 card.innerHTML 賦值後、container.appendChild(card) 前）

在 `renderCandidates()` 函式中，現有的「Event delegation」設定後加入：

```js
    // T-02：類型選擇器 change 事件（select 不觸發 click delegation）
    const catSelect = card.querySelector('.candidate-category-select');
    catSelect.addEventListener('change', () => {
      const newKey = catSelect.value;
      const newCat = CATEGORIES[newKey];
      if (!newCat) return;
      cand.category = newKey;
      // 更新圖示
      const iconEl = card.querySelector('.category-icon');
      if (iconEl) iconEl.textContent = newCat.icon;
      // 更新目標檔案顯示
      const targetEl = card.querySelector('.candidate-target');
      if (targetEl) targetEl.textContent = `→ ${newCat.filename}`;
    });
```

**驗收條件**：
- [x] 每個候選卡片頂部顯示類型下拉選單（6 個選項）
- [x] 選擇不同類型後，`.candidate-target` 的目標檔案即時更新（如：從 `→ preference-rules.md` 變為 `→ decision-log.md`）
- [x] 選擇不同類型後，圖示即時更新
- [x] 「全部採用」/ 「全部拒絕」操作後，選擇器狀態不被重設

---

### T-03：候選卡片——加入可編輯標題欄（P1-KQ-02）

**檔案**：`web/public/js/extract.js`  
**預估時間**：45 分鐘  

#### 3-A：初始化 `cand.title`

在 `extractCandidatesFromText()` 的 `results.push({...})` 呼叫中，加入 `title` 欄位：

**目前 push 內容**：
```js
      results.push({
        id: 'cand-' + (idx + 1),
        category: bestCategory,
        content: trimmed,
        keyLine: keyLine,
        source: primarySource,
        dedupeKey: dedupeKey,
        confidence: confidence,
        decision: confidence >= 0.6 ? null : 'rejected',
        editedContent: null,
      });
```

**修改後（新增 `title: null,`）**：
```js
      results.push({
        id: 'cand-' + (idx + 1),
        category: bestCategory,
        content: trimmed,
        keyLine: keyLine,
        title: null,
        source: primarySource,
        dedupeKey: dedupeKey,
        confidence: confidence,
        decision: confidence >= 0.6 ? null : 'rejected',
        editedContent: null,
      });
```

在 `mergeLLMCandidates()` 的 `return {...}` 中同樣加入 `title: null,`：

**目前**：
```js
    return {
      id: 'llm-cand-' + (idx + 1),
      category: internalCategory,
      content: `${c.summary}\n\n【原文佐證】${c.evidence}`,
      keyLine: c.summary,
      source: 'gemini-llm',
```

**修改後**：
```js
    return {
      id: 'llm-cand-' + (idx + 1),
      category: internalCategory,
      content: `${c.summary}\n\n【原文佐證】${c.evidence}`,
      keyLine: c.summary,
      title: null,
      source: 'gemini-llm',
```

#### 3-B：在 card template 中替換 `.candidate-content` div 為 `<input>`

**目前的 `.candidate-content` 行（template 中）**：
```js
      <div class="candidate-content">${escapeHTML(cand.keyLine)}</div>
```

**修改後**：
```js
      <input class="candidate-title-input" type="text" value="${escapeHTML(cand.title || cand.keyLine)}" placeholder="知識標題（一行摘要）" data-action="title-input">
```

#### 3-C：加入 title input 的事件監聽（在 card.innerHTML 賦值後）

在 T-02 的 catSelect 監聽器之後加入：

```js
    // T-03：標題輸入欄
    const titleInput = card.querySelector('.candidate-title-input');
    titleInput.addEventListener('input', () => {
      cand.title = titleInput.value;
    });
```

#### 3-D：修改 `runWriteback()` 的寫回內容

**目前（`groups[filename].push` 部分）**：
```js
    toWrite.forEach(cand => {
      const filename = CATEGORIES[cand.category].filename;
      if (!groups[filename]) groups[filename] = [];
      groups[filename].push({
        content: cand.editedContent || cand.content,
        source: cand.source,
      });
    });
```

**修改後**（`content` 使用 `cand.title || cand.keyLine` 作為優先標題，若使用者有編輯全文且沒有明確設標題才 fallback 到 editedContent 的第一行）：
```js
    toWrite.forEach(cand => {
      const filename = CATEGORIES[cand.category].filename;
      if (!groups[filename]) groups[filename] = [];
      groups[filename].push({
        content: cand.title || cand.keyLine || cand.editedContent || cand.content,
        source: cand.source,
      });
    });
```

**驗收條件**：
- [x] 每個候選卡片顯示可編輯的標題輸入欄，初始值為 AI 提取的 keyLine
- [x] 修改標題後，寫回至記憶 `.md` 檔案的 bullet 內容為使用者輸入的標題
- [x] 未修改標題時，寫回內容與修改前相同（backward compatible）
- [x] 標題輸入欄的 `focus` 狀態有底線高亮（CSS 效果）
- [x] 「編輯內容」全文 textarea 仍可正常展開（不受影響）

---

### T-04：全域搜尋——加入類型 chip 和新鮮度（P1-KQ-03）

**檔案**：`web/public/js/search.js`  
**預估時間**：60 分鐘  

#### 4-A：新增類型映射常數（檔案頂部）

在 `let allSearchData = null;` 之後加入：

```js
// T-04：記憶檔案 → 類型標籤映射
const SEARCH_MEMORY_TYPE_MAP = {
  'project-context.md':  { label: '專案背景', icon: 'info' },
  'preference-rules.md': { label: '偏好與規則', icon: 'tune' },
  'task-patterns.md':    { label: '任務模式', icon: 'pattern' },
  'decision-log.md':     { label: '決策記錄', icon: 'gavel' },
  'output-patterns.md':  { label: '輸出模式', icon: 'output' },
  'skill-candidates.md': { label: '技能候選', icon: 'school' },
};
```

#### 4-B：新增工具函式（檔案底部，`highlightQuery` 之後）

```js
// T-04：相對時間顯示（如：「3 個月前」）
function relativeDate(dateStr) {
  if (!dateStr) return null;
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return '今天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 週前`;
  if (days < 365) return `${Math.floor(days / 30)} 個月前`;
  return `${Math.floor(days / 365)} 年前`;
}

// T-04：超過 90 天視為 stale
function isStaleDateStr(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000 > 90;
}
```

#### 4-C：修改 `runSearch()` 中記憶檔案的 hit 建立邏輯

**目前**：
```js
  if (allSearchData?.memData?.files) {
    const hits = [];
    allSearchData.memData.files.forEach(file => {
      (file.content || '').split('\n').forEach(line => {
        if (line.toLowerCase().includes(q) && line.trim()) {
          hits.push({ title: file.filename, snippet: line.trim() });
        }
      });
    });
    if (hits.length) groups.push({ icon: 'psychology', label: '專案記憶', items: hits.slice(0, 20) });
  }
```

**修改後**：
```js
  if (allSearchData?.memData?.files) {
    const hits = [];
    allSearchData.memData.files.forEach(file => {
      let currentSectionDate = null;
      (file.content || '').split('\n').forEach(line => {
        // 追蹤 ## 提取於 YYYY-MM-DD header
        const sectionMatch = line.match(/^##\s+提取於\s+(\d{4}-\d{2}-\d{2})/);
        if (sectionMatch) { currentSectionDate = sectionMatch[1]; return; }
        if (line.toLowerCase().includes(q) && line.trim()) {
          hits.push({ title: file.filename, snippet: line.trim(), sectionDate: currentSectionDate });
        }
      });
    });
    if (hits.length) groups.push({ icon: 'psychology', label: '專案記憶', items: hits.slice(0, 20) });
  }
```

#### 4-D：修改 `runSearch()` 中結果渲染邏輯

**目前（在 `group.items.forEach` 內）**：
```js
    group.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.innerHTML =
        `<div class="search-result-title">${escapeHTML(item.title)}</div>` +
        `<div class="search-result-snippet">${highlightQuery(item.snippet, query)}</div>`;
      section.appendChild(el);
    });
```

**修改後**（僅記憶 group 的 items 有 sectionDate，其他 group 的 items 沒有 sectionDate，所以用條件判斷）：
```js
    group.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-result-item';

      // T-04：記憶 group 顯示類型 chip + 新鮮度；其他 group 保留原有 title 顯示
      if (item.sectionDate !== undefined) {
        const typeInfo = SEARCH_MEMORY_TYPE_MAP[item.title] || { label: item.title.replace('.md', ''), icon: 'article' };
        const stale = isStaleDateStr(item.sectionDate);
        const relDate = relativeDate(item.sectionDate);
        const freshnessHtml = relDate
          ? `<span class="search-result-freshness${stale ? ' freshness-stale' : ''}" title="${escapeHTML(item.sectionDate)}">${stale ? '⚠️ ' : ''}${escapeHTML(relDate)}</span>`
          : '';
        el.innerHTML =
          `<div class="search-result-meta">` +
          `<span class="search-result-type-chip"><span class="material-symbols-outlined">${escapeHTML(typeInfo.icon)}</span>${escapeHTML(typeInfo.label)}</span>` +
          freshnessHtml +
          `</div>` +
          `<div class="search-result-snippet">${highlightQuery(item.snippet, query)}</div>`;
      } else {
        el.innerHTML =
          `<div class="search-result-title">${escapeHTML(item.title)}</div>` +
          `<div class="search-result-snippet">${highlightQuery(item.snippet, query)}</div>`;
      }
      section.appendChild(el);
    });
```

**驗收條件**：
- [x] 搜尋「記憶」關鍵字，「專案記憶」結果每項顯示類型 chip（如「偏好與規則」）
- [x] 結果項目顯示相對時間（如「3 個月前」）
- [x] 超過 90 天的結果顯示 `⚠️ 3 個月前`（warning 色）
- [x] 「決策記錄」、「規則」、「Roadmap」等其他搜尋 group 的結果顯示不受影響
- [x] 新存入（T-03 寫回）的項目若同日搜尋，顯示「今天」

---

### T-05：新增 CSS 樣式（所有 T-02 到 T-04）

**檔案**：`web/public/css/style.css`  
**預估時間**：20 分鐘  

#### 5-A：候選卡片樣式（T-02 + T-03）

在 `.candidate-source-badge { flex-shrink: 0; }` 之後加入：

```css
/* T-02: 類型選擇器 */
.candidate-category-select {
  background: var(--surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.375rem;
  cursor: pointer;
  outline: none;
}
.candidate-category-select:focus {
  border-color: var(--primary);
}

/* T-03: 標題輸入欄 */
.candidate-title-input {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--outline-variant);
  color: var(--on-surface);
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.125rem 0;
  margin-bottom: 0.375rem;
  outline: none;
  box-sizing: border-box;
}
.candidate-title-input:focus {
  border-bottom-color: var(--primary);
}
```

#### 5-B：搜尋結果樣式（T-04）

在 `.search-highlight { ... }` 之後加入：

```css
/* T-04: 搜尋結果類型 chip 和新鮮度 */
.search-result-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  flex-wrap: wrap;
}
.search-result-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--on-surface-variant);
  background: var(--surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-xl);
  padding: 0.1rem 0.5rem;
}
.search-result-type-chip .material-symbols-outlined {
  font-size: 13px;
  color: var(--primary);
}
.search-result-freshness {
  font-size: 0.7rem;
  color: var(--on-surface-variant);
}
.freshness-stale {
  color: var(--warning);
}
```

**驗收條件**：
- [x] 類型選擇器在候選卡片中顯示正確（小字、圓角邊框）
- [x] 標題輸入欄底線在非 focus 狀態為灰色，focus 狀態變為 primary 金色
- [x] 搜尋結果的 type chip 顯示圖示和類型名稱
- [x] 過期記憶的新鮮度文字顯示 warning 色（amber）

---

## 執行順序建議

1. T-05（先加 CSS，後面 JS 才能看到效果）
2. T-01（最快，先解決 P0 問題）
3. T-02（類型選擇器）
4. T-03（標題輸入欄）
5. T-04（搜尋結果）

---

## Smoke Test 要點

完成全部 Tasks 後，確認以下：

| 項目 | 方法 |
|------|------|
| P0 axe 修復 | 執行 `node capture.mjs http://localhost:3000`，確認 `axe-extract.json` 的 violations 陣列為 `[]` |
| 類型選擇器存在 | 提取一段對話 → 審核步驟 → 確認每個候選卡片有 `<select>` 下拉 |
| 類型修改後目標更新 | 選其他類型 → 確認 `→ xxx.md` 即時變更 |
| 標題輸入欄 | 修改標題 → 「全部採用」→「寫回至記憶檔」→ 確認 `.md` 的 bullet 是新標題 |
| 搜尋新鮮度 | 搜尋現有記憶關鍵字 → 確認每個記憶結果有類型 chip + 時間 |
| 過期警示 | 找一個超過 90 天的記憶項目 → 確認顯示 `⚠️` |
| 其他 group 不受影響 | 搜尋 → 確認「決策記錄」/ 「規則」結果格式不變 |
