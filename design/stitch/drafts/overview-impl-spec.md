# 專案總覽與專案詳情頁 — 實作說明文件

> 設計基線：
> - `design/stitch/snapshots/2026-03-26/stitch_personal_ai_work_system_phase3_mvp/s9_2/code.html`（專案總覽）
> - `design/stitch/snapshots/2026-03-26/stitch_personal_ai_work_system_phase3_mvp/s9_1/code.html`（專案詳情）
>
> 對應 Tasks：2.1（專案總覽）、2.2（專案詳情）  
> 資料契約：`docs/workflows/v2-ui-data-contract-v1.md`  
> 建立日期：2026-03-26

---

## 1. 資料來源映射

### 1.1 專案總覽頁（s9_2）

| HTML 元素 / 區塊 | 資料來源路徑 | 欄位 / 解析規則 |
|---|---|---|
| Phase 進度表格 | `docs/roadmap.md` | `## 產品路線` 下的 GFM 表格；每列：Phase 名稱、版本、目標、狀態、完成勾選 |
| Phase 完成狀態 | `docs/roadmap.md` | `[x]` = 完成（✅）、`[ ]` = 未完成（進行中/未開始） |
| Active Change 清單 | `openspec/changes/<name>/.openspec.yaml` | 掃描所有子目錄；`status: active` 或非 archived 目錄（排除 `archive/`） |
| Active Change Name | `.openspec.yaml` | `name` 欄位 |
| Active Change 建立日期 | `.openspec.yaml` | `created` 欄位（ISO8601） |
| 目前狀態描述 | `docs/roadmap.md` | `## 目前狀態` 段落下的 `- **產品進度**：` 行 |

**解析詳細規則（roadmap.md Phase 表格）**：
```
正則：/\|\s*\[(.)\]\s*\|\s*Phase\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g
群組：[1] x/space [2] PhaseNo [3] Version [4] Target [5] Status
```

**Active Change 目錄掃描**：
```
路徑：openspec/changes/
排除：archive/（子目錄）
判斷 active：目錄下存在 .openspec.yaml 且不在 archive/ 子路徑
```

### 1.2 專案詳情頁（s9_1）

| HTML 元素 / 區塊 | 資料來源路徑 | 欄位 / 解析規則 |
|---|---|---|
| Change Name 標題 | `openspec/changes/<name>/.openspec.yaml` | `name` 欄位 |
| Why 段落 | `openspec/changes/<name>/proposal.md` | `## Why` 段落全文 |
| Scope — In scope | `openspec/changes/<name>/proposal.md` | `## Scope` > `- In scope:` 列表項 |
| Scope — Out of scope | `openspec/changes/<name>/proposal.md` | `## Scope` > `- Out of scope:` 列表項 |
| Acceptance Criteria | `openspec/changes/<name>/proposal.md` | `## Acceptance Criteria` 段落下的編號列表 |
| Task 清單 | `openspec/changes/<name>/tasks.md` | `##` 段落標題 + `- [ ]`/`- [x]` 列表 |
| Task 完成狀態 | `openspec/changes/<name>/tasks.md` | `[x]` = 完成、`[ ]` = 未完成 |
| Task 完成進度（百分比） | `tasks.md` | `(完成數 / 總數) * 100` 計算 |

---

## 2. 動態讀取策略（純前端 fetch + markdown parse）

### 2.1 通用技術決策

- **技術**：原生 `fetch()` API（無需後端）
- **Markdown 解析**：手工 regex（輕量，避免引入 `marked.js` 等額外依賴）；若後續需要完整 GFM 支援，再考慮引入 `marked.js`
- **CORS 限制**：本地 `file://` 協議下 fetch 受限。解法：以本機 HTTP server（`python -m http.server` 或 `npx serve`）啟動，或以相對路徑 `fetch('../../../docs/roadmap.md')`
- **快取策略**：不快取（每次載入頁面重新 fetch），避免舊資料殘留

### 2.2 資料載入序列

**專案總覽頁**：
```
1. fetch('../../docs/roadmap.md')
   → parse Phase 表格（regex）
   → render Phase 進度卡片
2. fetch API 掃描 openspec/changes/ 目錄
   （注意：fetch 無法列目錄，需改用預先產生的 index.json 或 hardcode active change 清單）
   → render Active Change 清單
```

**Active Change 索引替代方案**（因 fetch 無法列目錄）：
- 方案 A：在 `openspec/changes/` 保存 `active-index.json`，記錄所有 active change name
- 方案 B：hardcode active change name 清單（適合 MVP 階段）
- **MVP 採用**：方案 B（hardcode），Phase 4 再升為方案 A

**專案詳情頁**：
```
1. 取得 change name（URL 參數 ?change=<name> 或 hardcode）
2. fetch(`../../openspec/changes/${name}/proposal.md`)
   → parse Why / Scope / AC 段落
3. fetch(`../../openspec/changes/${name}/tasks.md`)
   → parse task 列表與完成狀態
4. render 詳情頁
```

### 2.3 Markdown 解析輔助函式（範例）

```javascript
// 擷取 ## 段落全文
function extractSection(md, heading) {
  const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const m = md.match(pattern);
  return m ? m[1].trim() : null;
}

// 擷取列表項目
function extractListItems(section) {
  return (section || '').split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^-\s*/, '').trim());
}

// 擷取 tasks（含完成狀態）
function parseTaskItems(md) {
  const lines = md.split('\n');
  return lines
    .filter(l => /^\s*- \[[ x]\]/.test(l))
    .map(l => ({
      done: /- \[x\]/i.test(l),
      text: l.replace(/^\s*- \[[ x]\]\s*/i, '').trim()
    }));
}
```

---

## 3. 空狀態 / 錯誤狀態觸發條件

### 3.1 專案總覽頁

| 情境 | 觸發條件 | UI 呈現 |
|---|---|---|
| roadmap.md 讀取失敗 | `fetch()` 回傳非 2xx | 顯示「無法載入路線圖，請確認服務已啟動」 |
| Phase 表格解析失敗 | regex 無匹配 | 顯示「路線圖格式不符，請確認 roadmap.md 結構」 |
| 無 Active Change | hardcode 清單為空 | 顯示「目前無進行中的 Change」（空狀態卡片）|
| Active Change .openspec.yaml 讀取失敗 | fetch 失敗 | 跳過該 change，顯示警告標籤 |

### 3.2 專案詳情頁

| 情境 | 觸發條件 | UI 呈現 |
|---|---|---|
| change name 未指定 | URL 無 `?change=` 參數且無 hardcode | 顯示「請選擇一個 Change」並導回總覽頁 |
| proposal.md 讀取失敗 | `fetch()` 失敗 | 顯示「無法載入 Proposal，請確認路徑正確」 |
| tasks.md 讀取失敗 | `fetch()` 失敗 | Tasks 區塊顯示「載入失敗」，其他區塊正常呈現 |
| tasks 全部完成 | 所有解析項目 `done === true` | 顯示「所有 Tasks 已完成 ✅」 |
| tasks 為空 | 解析結果為空陣列 | 顯示「尚無 Task 定義」 |

---

## 4. 實作注意事項

1. **本地開發啟動**：需以 HTTP server 啟動（`cd design/stitch/drafts && python -m http.server 8080`），避免 `file://` CORS 問題。
2. **相對路徑**：HTML 檔案位於 `design/stitch/drafts/`，fetch 路徑需計算相對偏移（`../../docs/...`）。
3. **XSS 防護**：所有從 markdown 解析的內容需以 `textContent` 插入 DOM，**禁止使用 `innerHTML`** 插入未消毒的 markdown 文字。
4. **錯誤邊界**：每個 `fetch` 需有獨立 `try/catch`，單一資料來源失敗不應阻塞整頁渲染。

---

*v1 — 2026-03-26 — Task 2.1 + 2.2*
