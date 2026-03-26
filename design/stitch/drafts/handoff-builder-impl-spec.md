# Handoff Builder — 實作說明文件

> 設計基線：`design/stitch/snapshots/2026-03-26/stitch_personal_ai_work_system_phase3_mvp/handoff_builder/code.html`  
> 對應 Tasks：3.1（草稿載入與編輯）、3.2（草稿輸出）  
> 資料契約：`docs/workflows/v2-ui-data-contract-v1.md`  
> 建立日期：2026-03-26

---

## 1. 欄位映射表（current-task.md → UI 表單）

| UI 表單欄位 | current-task.md 解析規則 | 必填 | 型別 | 備註 |
|---|---|:---:|---|---|
| Task Name | `## Task` 段落下 `- Name:` 後的值 | ✅ | 單行文字 | |
| Owner | `## Task` 段落下 `- Owner agent:` 後的值 | — | 單行文字 | 可為空 |
| Started On | `## Task` 段落下 `- Started on:` 後的值 | — | 日期文字 | |
| Last Updated | `## Task` 段落下 `- Last updated on:` 後的值 | — | 日期文字 | 輸出時自動更新為當前日期 |
| Goal | `## Goal` 段落全文 | ✅ | 多行文字 | |
| Scope In | `## Scope > In scope:` 列表項 | ✅ | 多行文字（換行分隔） | |
| Scope Out | `## Scope > Out of scope:` 列表項 | — | 多行文字 | |
| Constraints | `## Constraints` 段落全文 | — | 多行文字 | |
| Done | `## Done` 列表項 | — | 多行文字 | |
| In Progress | `## In Progress` 列表項 | — | 多行文字 | |
| Next Step | `## Next Step` 列表項 | ✅ | 多行文字 | |
| Validation Status | `## Validation Status` 列表項 | — | 多行文字 | |
| Evidence Paths | `## Evidence Paths` 列表項（若有） | — | 多行文字 | |

### 1.1 欄位解析函式（範例）

```javascript
// 解析 ## Task 段落下特定 key
function parseTaskField(md, key) {
  const section = extractSection(md, 'Task');
  const pattern = new RegExp(`-\\s*${key}:\\s*(.+?)(?:\\n|$)`, 'i');
  const m = (section || '').match(pattern);
  return m ? m[1].trim() : '';
}

// 解析多行列表段落
function parseListSection(md, heading) {
  const section = extractSection(md, heading);
  if (!section) return '';
  return section.split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^-\s*/, '').trim())
    .join('\n');
}
```

---

## 2. 必填驗證邏輯

### 2.1 驗收規則

| 必填欄位 | 空值判斷 | 錯誤訊息 |
|---|---|---|
| Task Name | `trim() === ''` | 「Task Name 為必填欄位」 |
| Goal | `trim() === ''` | 「Goal 為必填欄位」 |
| Scope In | `trim() === ''` | 「Scope (In scope) 為必填欄位」 |
| Next Step | `trim() === ''` | 「Next Step 為必填欄位」 |

### 2.2 驗證時機

- **即時驗證**：使用者離開欄位（`blur` 事件）時觸發單欄位驗證，顯示欄位下方紅色錯誤提示。
- **提交驗證**：點擊「輸出草稿」按鈕時觸發全欄位驗證，任一必填欄位為空時**阻止輸出**並滾動至第一個錯誤欄位。

### 2.3 驗證實作（範例）

```javascript
function validateRequired(fields) {
  const errors = [];
  const required = ['taskName', 'goal', 'scopeIn', 'nextStep'];
  required.forEach(key => {
    const el = document.getElementById(key);
    if (!el || el.value.trim() === '') {
      errors.push(key);
      el && el.classList.add('border-red-500');
    } else {
      el && el.classList.remove('border-red-500');
    }
  });
  return errors;
}
```

---

## 3. 草稿輸出邏輯

### 3.1 輸出路徑規則

```
路徑格式：design/stitch/drafts/handoff-draft-<timestamp>.md
timestamp 格式：YYYYMMDD-HHmmss（本地時間）
範例：design/stitch/drafts/handoff-draft-20260326-143000.md
```

### 3.2 路徑安全守衛（不覆蓋 guard）

```javascript
const ALLOWED_DRAFT_PREFIX = 'design/stitch/drafts/';
const FORBIDDEN_PATHS = ['docs/handoff/', 'docs/memory/', 'openspec/'];

function isPathSafe(outputPath) {
  if (!outputPath.startsWith(ALLOWED_DRAFT_PREFIX)) return false;
  for (const forbidden of FORBIDDEN_PATHS) {
    if (outputPath.startsWith(forbidden)) return false;
  }
  return true;
}
```

> **注意**：純靜態前端無法直接寫入檔案系統。MVP 階段採「下載草稿」方式（`Blob` + `<a download>`），使用者手動存入 `design/stitch/drafts/` 目錄。Phase 4 可改為後端 API 寫入。

### 3.3 草稿輸出格式

```markdown
---
generated_at: 2026-03-26T14:30:00+08:00
source_files:
  - docs/handoff/current-task.md
reviewer: human
session_ref: 2026-03-26
change_ref: phase9-v2-lightweight-ui-workbench-mvp
---

# Handoff Draft — <Task Name>

## Task
- Name: <Task Name>
- Owner agent: <Owner>
- Started on: <Started On>
- Last updated on: <current date>
- Related issue / spec: <（從原始文件帶入或留空）>

## Goal
<Goal 全文>

## Scope
- In scope: <Scope In 各行>
- Out of scope: <Scope Out 各行>

## Constraints
<Constraints 全文>

## Done
<Done 各項>

## In Progress
<In Progress 各項>

## Next Step
<Next Step 各項>

## Validation Status
<Validation Status 各項>
```

### 3.4 下載實作（MVP）

```javascript
function exportDraft(content, timestamp) {
  const filename = `handoff-draft-${timestamp}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  // 提示使用者將檔案儲存至 design/stitch/drafts/
  alert(`草稿已下載：${filename}\n請將檔案移至 design/stitch/drafts/ 目錄`);
}
```

---

## 4. 載入流程

```
1. 頁面載入
   → fetch('../../docs/handoff/current-task.md')
   → parse 各欄位（見 §1.1）
   → 填入表單預設值

2. 使用者編輯各欄位

3. 點擊「輸出草稿」
   → validateRequired() → 有錯誤時 abort
   → 組合草稿 markdown（含 run metadata）
   → 產生 timestamp = new Date().toISOString().replace(/[:.]/g, '-')
   → exportDraft(content, timestamp)
   → 顯示「草稿已輸出」確認訊息
```

---

## 5. 已知限制與後續改進

| 限制 | 說明 | 後續 |
|---|---|---|
| 無法直接寫入檔案系統 | 瀏覽器安全限制，MVP 採下載方式 | Phase 4 實作後端 API 或 File System Access API |
| 多行段落解析模糊 | current-task.md 部分欄位為混合格式 | Task 3.x 完成後依實際檔案格式調整 regex |
| 時間戳為本地時間 | 跨時區一致性未處理 | +08:00 硬編碼，後續可改用 Intl.DateTimeFormat |

---

*v1 — 2026-03-26 — Task 3.1 + 3.2*
