# Change Design: memory-ai-curator

> **狀態**：Draft  
> **建立日期**：2026-04-13  

---

## 架構決策

### D-01：刪除操作在後端執行，前端只傳 itemId + filename

**決定**：新增 `POST /api/memory/item/delete`（用 POST 避免 REST DELETE 與 body parsing 的 Node.js 歧義），body 為 `{ filename, itemId }`。  
**理由**：
- 複用現有 `getWritableMemoryFilePath()` 白名單驗證
- 刪除前自動呼叫 `writeMemoryFileWithBackup()` 確保備份
- 不引入新的安全風險

### D-02：AI 整理使用現有 `geminiGenerateContent()` 函式

**決定**：新增 `POST /api/memory/ai-curate`，body 為 `{ filename }`。後端讀取該檔案全文，送 Gemini 分析，回傳改善後的完整 markdown 文字供使用者確認。  
**理由**：
- 複用 v1.1.10 已建立的 `geminiGenerateContent()` 函式
- 使用者確認後才覆寫，符合「低摩擦、人工最終確認」原則
- 回傳的是 markdown 文字（非 JSON），避免解析複雜度

### D-03：KPI「建議清理」點擊後切換 memory 列表的篩選模式

**決定**：前端加入篩選狀態（`filterMode: 'all' | 'needsAttention'`），點擊 KPI 卡片切換。  
**理由**：
- 不需要後端改動，純前端 state 控制
- `renderMemory()` 依 filterMode 決定顯示哪些 group/item

### D-04：AI 整理流程採用「建議確認再覆寫」模式，對應 Extract 的候選審核 UX

**決定**：點擊「AI 整理此分類」後：
1. 顯示 loading
2. 出現「改善建議預覽」modal/inline panel
3. 使用者看完後按「確認覆寫」或「略過」
4. 確認後呼叫 `POST /api/memory/write` 覆寫整個檔案內容

**理由**：維持「使用者永遠有最後確認權」的設計原則。

---

## 資料流

### 刪除條目

```
使用者點「刪除」→ confirm() 確認
    │
    ▼
POST /api/memory/item/delete { filename, itemId }
    │
    ├── 白名單驗證 filename
    ├── 讀取檔案 → 找到 itemId 對應行 → 移除
    ├── writeMemoryFileWithBackup()  ← 先備份
    └── 回傳 { success: true }
    │
    ▼
前端 loadMemoryData() 重新載入
```

### AI 整理分類

```
使用者點「AI 整理此分類」(filename)
    │
    ▼
POST /api/memory/ai-curate { filename }
    │
    ├── 讀取 filename 全文
    ├── 呼叫 geminiGenerateContent(prompt, apiKey)
    │    prompt 包含：原始檔案內容 + 整理指引
    └── 回傳 { original: "...", improved: "...", filename }
    │
    ▼
前端顯示「改善建議預覽」panel（原文 vs 改善版並排）
    │
    ├── 使用者按「確認覆寫」→ POST /api/memory/write { filename, content: improved }
    └── 使用者按「略過」→ 關閉 panel
```

### KPI 篩選

```
使用者點擊「建議清理」KPI 卡片
    │
    ▼
filterMode = 'needsAttention'（前端 state）
    │
    ▼
renderMemory() 只顯示 health.status !== 'healthy' 的條目
    │
    ▼
KPI 卡片變 active 樣式、加上「顯示全部」按鈕
```

---

## API 規格

### `POST /api/memory/item/delete`

**Request body**：
```json
{
  "filename": "skill-candidates.md",
  "itemId": "abc123"
}
```

**Response 200**：
```json
{ "success": true, "filename": "skill-candidates.md", "backedUp": true }
```

**Error**：
- 403：filename 不在白名單
- 404：itemId 在檔案中找不到
- 400：body 缺少必要欄位

---

### `POST /api/memory/ai-curate`

**Request body**：
```json
{ "filename": "project-context.md" }
```

**Response 200**：
```json
{
  "filename": "project-context.md",
  "original": "# Project Context\n...",
  "improved": "# Project Context\n（改善後內容）...",
  "summary": "移除了 3 條過時描述，補充了 V5 功能邊界"
}
```

**Error**：
- 400：未設定 Gemini API key
- 500：Gemini API 呼叫失敗

---

## Gemini Prompt 設計（ai-curate）

```
你是個人 AI 工作系統的記憶品質專家。
以下是「{categoryLabel}」（{filename}）的完整內容：

---
{fileContent}
---

請整理並改善這份記憶文件，原則：
1. 移除明顯過時或不再正確的條目（說明為何移除）
2. 合併高度重複的條目
3. 補充缺少來源或日期的標記（格式：<!-- source: 來源 date: YYYY-MM-DD -->）
4. 維持原有的 Markdown 格式結構（## 標題、- bullet）
5. 不要增加原本沒有的新知識

直接回傳改善後的完整 Markdown 文字，不要有說明前言。
在最後以 HTML 注解格式附上異動摘要：
<!-- curator-summary: 你做了什麼 -->
```

---

## 前端 UI 規格

### 記憶條目刪除按鈕

- 位置：每個 `.memory-item` 卡片右下角
- 樣式：`btn-icon` 配 `delete` icon，hover 才顯示（opacity 0 → 1）
- 文字：無（純 icon），tooltip 為「刪除此條目」

### AI 整理分類按鈕

- 位置：每個 `.memory-category-header` 右側
- 樣式：`btn btn-ghost btn-sm`，文字「✨ AI 整理」
- 點擊後：按鈕顯示 loading，panel 展開於該 category 下方

### AI 整理預覽 panel

- 結構：簡單的 before/after diff（兩個 `<pre>` 並排，或上下排）
- 操作：「確認覆寫」（primary）、「略過」（ghost）
- 成功後：自動關閉 panel，重新載入記憶資料

### KPI「建議清理」active 狀態

- 點擊後：卡片加上 `active` class（深色背景）
- 加上「清除篩選」按鈕於頁面頂部

---

## 影響範圍

| 檔案 | 操作 | 說明 |
|------|------|------|
| `web/server.js` | 新增 | `POST /api/memory/item/delete` 路由 |
| `web/server.js` | 新增 | `POST /api/memory/ai-curate` 路由 |
| `web/public/js/memory.js` | 修改 | 新增刪除按鈕、AI 整理按鈕、KPI 篩選、預覽 panel |
| `web/public/memory.html` | 可能微調 | 若需要新增 panel 容器 |
| `web/public/css/style.css` | 修改 | 刪除按鈕 hover 樣式、active KPI、curate panel |

**不影響**：`extract.js`、`handoff.js`、`decisions.js`、`server.js` 中的現有路由邏輯

---
