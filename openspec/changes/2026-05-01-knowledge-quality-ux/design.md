# Design: knowledge-quality-ux

> **建立日期**：2026-05-01  
> **對應 proposal**：`proposal.md`

---

## 現況分析

### T-01 現況：P0-A11Y-01 — `<select>` 無 label

**位置**：`web/public/extract.html`，Extract 步驟 1 區塊內：

```html
<!-- 目前的結構 -->
<div class="extract-source-selector">
  <div class="extract-source-copy">
    <div class="extract-source-label">工具來源</div>  <!-- ← 這是 div，不是 label -->
    <p class="extract-source-hint" id="import-source-hint">...</p>
  </div>
  <select class="extract-source-select" id="import-source-select">
    <option value="plain">純文字</option>
    ...
  </select>
</div>
```

`class="extract-source-label"` 的 div 在視覺上扮演 label 角色，但語意上沒有與 `<select>` 關聯。

---

### T-02 + T-03 現況：P1-KQ-01 + P1-KQ-02 — 候選知識卡片

**位置**：`web/public/js/extract.js`，`renderCandidates()` 函式，`card.innerHTML` 模板。

**現況問題**：
- 類型（category）顯示為靜態 `<span>` 文字，不可修改
- `keyLine`（標題）顯示在 `.candidate-content` div，不可直接編輯（只能透過「編輯內容」展開完整 textarea）
- 寫回時用 `cand.editedContent || cand.content` 傳給 `buildAttributedMemoryListItem`，後者呼叫 `sanitizeMemoryListContent` 只取第一行

**現況候選卡片結構**：
```html
<div class="candidate-card">
  <div class="candidate-header">
    <div class="candidate-category">
      <span class="material-symbols-outlined">{icon}</span>
      <span>{cat.label}</span>                      <!-- 靜態，不可修改 -->
      <span class="confidence-badge">XX%</span>
    </div>
    <div class="candidate-actions">...</div>
  </div>
  <div class="candidate-content">{keyLine}</div>    <!-- 靜態，不可直接編輯 -->
  <div class="candidate-meta-row">
    <div class="candidate-target">→ xxx.md</div>
    <span class="source-badge ...">來源</span>
  </div>
  <textarea class="candidate-edit hidden">...</textarea>
  <button class="btn-text toggle-edit">編輯內容</button>
</div>
```

---

### T-04 現況：P1-KQ-03 — 搜尋結果缺類型和新鮮度

**位置**：`web/public/js/search.js`，`runSearch()` 函式。

**現況問題**：
- Hit 物件只有 `{ title: file.filename, snippet: line.trim() }`，沒有類型和日期
- 結果渲染只有 `search-result-title`（顯示 filename）+ `search-result-snippet`
- 記憶檔案有 `## 提取於 YYYY-MM-DD` headers 但目前未解析

---

## 設計決策

### D-01：T-01 label 修改方式

**選擇**：將 `<div class="extract-source-label">工具來源</div>` 改為 `<label class="extract-source-label" for="import-source-select">工具來源</label>`

**理由**：最小修改，語意正確，不影響現有 CSS（class 名稱不變）。

---

### D-02：T-02 類型選擇器的 UI 形式

**選擇**：在 `.candidate-category` 中，用 `<select>` 替換靜態 `<span>` 文字標籤，保留圖示 span 且可動態更新。

**替代方案考量**：
- 方案 A（chip 點擊輪換）：較多狀態管理，且超過 4 個選項時不直覺 → 不選
- 方案 B（select 下拉）：標準表單控件，鍵盤可用，符合既有 `<select>` 風格 → 選擇

**select 事件**：由於 click delegation 不適用 `<select>`，在 `renderCandidates` 中對每張卡片的 select 直接附加 `change` 監聽器。

**類型選項**：來自 `extract.js` 現有 `CATEGORIES` 物件，6 個選項：
- 專案背景（project-context）
- 偏好與規則（preference-rules）
- 任務模式（task-patterns）
- 決策記錄（decision-log）
- 輸出模式（output-patterns）
- 技能候選（skill-candidates）

---

### D-03：T-03 標題欄的 UI 形式

**選擇**：用 `<input type="text" class="candidate-title-input">` 替換 `.candidate-content` div。初始值為 `cand.keyLine`。

**狀態管理**：
- 在 `renderCandidates` 執行前，對每個 candidate 初始化 `cand.title = cand.title || cand.keyLine`（冪等）
- `input` 事件：`cand.title = input.value`

**寫回邏輯修改**：
```js
// runWriteback() 中
groups[filename].push({
  content: cand.title || cand.keyLine,  // ← 優先用 title（使用者明確設定的標題）
  source: cand.source,
});
// 注意：cand.editedContent 仍可透過「編輯內容」textarea 修改全文
// 但 title 是單行摘要，是寫回 bullet 的主要內容
```

**設計理由**：`buildAttributedMemoryListItem` 已透過 `sanitizeMemoryListContent` 只取第一行，現在改為由前端明確提供標題，語意更清晰。全文 textarea 的角色變為「審閱上下文」，不影響寫回格式。

---

### D-04：T-04 搜尋結果的類型 chip 和新鮮度

**類型映射**：在 `search.js` 頂部新增常數（獨立定義，不依賴 extract.js，避免跨頁面耦合）：

```js
const SEARCH_MEMORY_TYPE_MAP = {
  'project-context.md':  { label: '專案背景', icon: 'info' },
  'preference-rules.md': { label: '偏好與規則', icon: 'tune' },
  'task-patterns.md':    { label: '任務模式', icon: 'pattern' },
  'decision-log.md':     { label: '決策記錄', icon: 'gavel' },
  'output-patterns.md':  { label: '輸出模式', icon: 'output' },
  'skill-candidates.md': { label: '技能候選', icon: 'school' },
};
```

**日期解析**：在 `runSearch()` 的記憶檔案處理迴圈中，逐行追蹤最近的 `## 提取於 YYYY-MM-DD` header，將日期存入 hit 物件的 `sectionDate` 欄位。

```js
let currentSectionDate = null;
(file.content || '').split('\n').forEach(line => {
  const m = line.match(/^##\s+提取於\s+(\d{4}-\d{2}-\d{2})/);
  if (m) { currentSectionDate = m[1]; return; }
  if (line.toLowerCase().includes(q) && line.trim()) {
    hits.push({ title: file.filename, snippet: line.trim(), sectionDate: currentSectionDate });
  }
});
```

**新鮮度判定**：超過 90 天 = stale（顯示 `⚠️` + warning 顏色）。

**結果渲染**：`search-result-title`（顯示 filename）改為 `search-result-meta` 區域（含類型 chip + 新鮮度）。

---

## CSS 新增

### 修改位置
**檔案**：`web/public/css/style.css`，新增至 `/* ─── Global Search ─── */` 區塊之後，以及 `/* ─── Candidates ─── */` 區塊之後。

### 新增樣式：候選卡片（T-02 + T-03）

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

### 新增樣式：搜尋結果（T-04）

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

---

## 資料流圖

### Extract 寫回流（改善後）

```
使用者貼入對話
  → [Step 1] 提取候選知識 → candidates[]
  → [Step 2] 審核
      ↳ cand.category  ← 使用者可透過 <select> 修改 (T-02)
      ↳ cand.title     ← 使用者可透過 <input> 修改，初始值 = keyLine (T-03)
      ↳ cand.editedContent ← 使用者可透過 textarea 修改全文（已有功能）
  → [Step 3] 寫回
      ↳ 目標檔案 = CATEGORIES[cand.category].filename
      ↳ bullet 內容 = cand.title || cand.keyLine
      ↳ buildAttributedMemoryListItem(bullet, cand.source) → "- {title} <!-- source: ... -->"
```

### Search 顯示流（改善後）

```
使用者搜尋
  → runSearch(query)
  → 解析記憶檔案（逐行追蹤 ## 提取於 YYYY-MM-DD）
  → hit = { title: file.filename, snippet, sectionDate }
  → 渲染
      ↳ typeInfo = SEARCH_MEMORY_TYPE_MAP[hit.title] || fallback
      ↳ 顯示 search-result-type-chip（圖示 + typeInfo.label）
      ↳ 顯示 search-result-freshness（relativeDate）+ freshness-stale（if > 90 days）
      ↳ 顯示 search-result-snippet（高亮關鍵字）
```

---

## 範圍界定（什麼不會動）

- `server.js`：本 change 不修改後端
- `memory-source-utils.js`：`buildAttributedMemoryListItem` 邏輯不變，只是傳入的 `content` 參數改為 `cand.title || cand.keyLine`
- 記憶 `.md` 檔案格式：寫回後仍然是 `- {content} <!-- source: ... -->` 格式
- `extract.html` 中候選列表的 HTML 結構（template 改變在 JS 中，非靜態 HTML）
- `memory.js`、`decisions.js` 等其他頁面 JS：不動
