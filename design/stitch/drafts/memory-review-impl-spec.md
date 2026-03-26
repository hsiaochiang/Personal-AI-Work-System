# Memory Review 介面 — 實作說明文件

> 設計基線：`design/stitch/snapshots/2026-03-26/stitch_personal_ai_work_system_phase3_mvp/memory_review/code.html`  
> 對應 Tasks：5.1（記憶候選分類呈現）、5.2（審核操作與草稿輸出）  
> 資料契約：`docs/workflows/v2-ui-data-contract-v1.md`  
> 建立日期：2026-03-26

---

## 1. docs/memory/ 各分類檔案的欄位解析策略

### 1.1 來源目錄結構

```
docs/memory/
├── decision-log.md        # 決策記錄
├── output-patterns.md     # 輸出模式
├── preference-rules.md    # 偏好規則
├── project-context.md     # 專案背景
├── skill-candidates.md    # 技能候選（由候選審核 UI 負責，此處重複使用）
└── task-patterns.md       # 任務模式
```

### 1.2 通用解析策略

所有 `docs/memory/*.md` 檔案均採 GFM Markdown 格式，解析策略統一為：

1. **分類識別**：以檔案名稱對應分類名稱（見 §2.1 分類映射表）
2. **段落切割**：以 `##` 標題切割為分組（sub-category）
3. **條目提取**：每個 `##` 段落下的 `-` 列表項為一筆記憶條目
4. **描述提取**：列表項後若有縮進段落（`  ` 或 `\t` 開頭），視為補充說明

### 1.3 解析函式（範例）

```javascript
// 解析單一 memory 檔案為分組條目結構
function parseMemoryFile(md, category) {
  const sections = [];
  const sectionPattern = /^## (.+?)$([\s\S]*?)(?=^## |\Z)/gm;
  let m;
  while ((m = sectionPattern.exec(md)) !== null) {
    const heading = m[1].trim();
    const body = m[2];
    const items = body.split('\n')
      .filter(l => /^\s*-\s+/.test(l) && !/^\s*-\s*\[[ x]\]/.test(l))
      .map(l => ({
        text: l.replace(/^\s*-\s+/, '').trim(),
        category,
        sub_category: heading,
        decision: null
      }));
    if (items.length > 0) {
      sections.push({ heading, items });
    }
  }
  return sections;
}

// 載入所有 memory 檔案
async function loadAllMemoryFiles() {
  const files = [
    { path: '../../docs/memory/decision-log.md', category: '決策記錄' },
    { path: '../../docs/memory/preference-rules.md', category: '偏好規則' },
    { path: '../../docs/memory/output-patterns.md', category: '輸出模式' },
    { path: '../../docs/memory/project-context.md', category: '專案背景' },
    { path: '../../docs/memory/task-patterns.md', category: '任務模式' },
    { path: '../../docs/memory/skill-candidates.md', category: '技能候選' },
  ];
  const results = [];
  for (const f of files) {
    try {
      const resp = await fetch(f.path);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const md = await resp.text();
      results.push({ category: f.category, sections: parseMemoryFile(md, f.category) });
    } catch (e) {
      results.push({ category: f.category, sections: [], error: e.message });
    }
  }
  return results;
}
```

---

## 2. 分類分組邏輯

### 2.1 分類映射表

| UI 分類名稱 | 對應檔案 | 預設展開狀態 |
|---|---|:---:|
| 決策記錄 | `decision-log.md` | 展開 |
| 偏好規則 | `preference-rules.md` | 展開 |
| 輸出模式 | `output-patterns.md` | 摺疊 |
| 專案背景 | `project-context.md` | 摺疊 |
| 任務模式 | `task-patterns.md` | 摺疊 |
| 技能候選 | `skill-candidates.md` | 摺疊 |

### 2.2 分組呈現邏輯

```
UI 結構：
├── 分類 A（可摺疊）
│   ├── 子分類 1（## 段落名稱）
│   │   ├── 條目 1 [採用] [拒絕]
│   │   └── 條目 2 [採用] [拒絕]
│   └── 子分類 2
│       └── ...
├── 分類 B（可摺疊）
│   └── ...
```

### 2.3 空分類處理

- 若某分類讀取失敗：顯示「⚠️ 載入失敗：<error message>」，不影響其他分類
- 若某分類無條目：顯示「（此分類目前無條目）」
- 全部分類均為空：顯示全頁「目前無 Memory 條目可審核」

---

## 3. 審核操作與草稿輸出格式

### 3.1 審核操作狀態機

```
條目初始狀態：decision = null（未審核）
使用者點擊「採用（Adopt）」→ decision = 'adopted'
使用者點擊「拒絕（Reject）」→ decision = 'rejected'（可選填拒絕原因）
使用者可重置：點擊已選擇的按鈕 → 回到 null
```

### 3.2 批次操作

- **全部採用（分類）**：一鍵將當前分類所有條目設為 `adopted`
- **全部拒絕（分類）**：一鍵將當前分類所有條目設為 `rejected`
- **重置（分類）**：回復分類所有條目至未審核狀態

### 3.3 輸出控制

- 草稿輸出**不要求**全部條目均已決策（Memory Review 為輔助工具，非強制審核）
- 輸出時只包含已決策（adopted + rejected）的條目
- 未決策（null）條目不納入草稿輸出

---

## 4. 草稿輸出格式

### 4.1 路徑規則

```
路徑格式：design/stitch/drafts/memory-review-<timestamp>.md
timestamp 格式：YYYYMMDD-HHmmss
範例：design/stitch/drafts/memory-review-20260326-143000.md
```

### 4.2 草稿格式

```markdown
---
generated_at: 2026-03-26T14:30:00+08:00
source_files:
  - docs/memory/decision-log.md
  - docs/memory/preference-rules.md
  - docs/memory/output-patterns.md
  - docs/memory/project-context.md
  - docs/memory/task-patterns.md
  - docs/memory/skill-candidates.md
reviewer: human
session_ref: 2026-03-26
change_ref: phase9-v2-lightweight-ui-workbench-mvp
---

# Memory Review 草稿

## Adopted 條目

### 決策記錄
- [決策條目文字] — sub_category: <子分類名稱>

### 偏好規則
- [偏好規則文字]

## Rejected 條目

### 輸出模式
- [模式文字] — reason: <拒絕原因（若有）>
```

### 4.3 輸出守衛

```javascript
const ALLOWED_DRAFT_PREFIX = 'design/stitch/drafts/';

function generateMemoryReviewDraft(allMemoryData, timestamp) {
  const adoptedItems = [];
  const rejectedItems = [];
  // 收集所有已決策條目
  allMemoryData.forEach(({ category, sections }) => {
    sections.forEach(({ heading, items }) => {
      items.forEach(item => {
        if (item.decision === 'adopted') {
          adoptedItems.push({ category, sub_category: heading, text: item.text });
        } else if (item.decision === 'rejected') {
          rejectedItems.push({ category, sub_category: heading, text: item.text, reason: item.reason });
        }
      });
    });
  });
  // 組合 markdown
  const content = buildDraftMarkdown(adoptedItems, rejectedItems, timestamp);
  const filename = `memory-review-${timestamp}.md`;
  // 驗證路徑安全性（filename 只含合法字元）
  if (!filename.startsWith('memory-review-')) throw new Error('非法檔名');
  return { content, filename };
}
```

### 4.4 原始文件保護

- 所有 `docs/memory/*.md` 文件僅以 `fetch`（HTTP GET）讀取，**不執行任何寫入操作**
- MVP 階段採下載方式輸出草稿，零寫入風險
- Phase 4 若採 File System Access API，需實作路徑白名單驗證

---

## 5. 條目摘要顯示策略

| 條目文字長度 | 顯示策略 |
|---|---|
| ≤ 100 字元 | 全文顯示 |
| > 100 字元 | 截斷顯示前 100 字元 + 「…」，提供「展開」按鈕 |

---

## 6. 整體載入流程

```
1. 頁面載入
   → 並行 fetch 所有 docs/memory/*.md（Promise.allSettled）
   → parseMemoryFile() 解析各分類
   → render 分類分組清單（含展開/摺疊控制）
   → 所有條目初始狀態：decision = null

2. 使用者逐條審核（採用/拒絕）或批次操作

3. 點擊「輸出審核草稿」
   → 收集已決策條目
   → 若無任何已決策條目：提示「請先審核至少一筆條目」
   → generateMemoryReviewDraft()
   → 下載草稿檔案（Blob + <a download>）
   → 提示使用者存入 design/stitch/drafts/
```

---

*v1 — 2026-03-26 — Task 5.1 + 5.2*
