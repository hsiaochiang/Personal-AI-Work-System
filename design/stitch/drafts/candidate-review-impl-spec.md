# 候選審核介面 — 實作說明文件

> 設計基線：`design/stitch/snapshots/2026-03-26/stitch_personal_ai_work_system_phase3_mvp/_/code.html`  
> 對應 Tasks：4.1（候選清單呈現）、4.2（採用/拒絕決策與草稿輸出）  
> 資料契約：`docs/workflows/v2-ui-data-contract-v1.md`  
> 建立日期：2026-03-26

---

## 1. 資料來源與欄位映射

### 1.1 輸入來源

- 主要來源：`docs/memory/skill-candidates.md`

### 1.2 候選欄位映射

| UI 欄位 | skill-candidates.md 解析規則 | 必填 | 備註 |
|---|---|:---:|---|
| 候選 ID | `### 候選 N：<title>` 整行（含序號） | ✅ | 作為唯一識別鍵 |
| title（標題） | `### 候選 N：` 後的文字 | ✅ | |
| summary（摘要） | `- 說明：` 後的值 | ✅ | |
| status（狀態） | `- 目前狀態：` 後的值 | ✅ | 候選/升級/拒絕 |
| source_ref | `- 為何值得觀察：` 下第一列表項 | — | 替代來源參考 |
| confidence | 無欄位，固定為 `medium`（mock） | — | 待 Phase 4 補齊 |
| pending_reason | `- 尚缺：` 列表項，`\n` 連接 | — | 審核時顯示參考 |

### 1.3 解析函式（範例）

```javascript
// 解析所有候選區塊
function parseCandidates(md) {
  const candidatePattern = /###\s+(候選\s*\d+[：:]\s*(.+?))\n([\s\S]*?)(?=###|$)/g;
  const candidates = [];
  let m;
  while ((m = candidatePattern.exec(md)) !== null) {
    const id = m[1].trim();
    const title = m[2].trim();
    const body = m[3];
    candidates.push({
      id,
      title,
      summary: extractField(body, '說明'),
      status: extractField(body, '目前狀態') || 'pending',
      source_ref: extractFirstListItem(body, '為何值得觀察'),
      confidence: 'medium',
      pending_reason: extractListItems(body, '尚缺'),
      decision: null  // adopted / rejected / null（pending）
    });
  }
  return candidates;
}

function extractField(body, key) {
  const m = body.match(new RegExp(`-\\s*${key}[：:]\\s*(.+?)(?:\\n|$)`, 'i'));
  return m ? m[1].trim() : null;
}
```

---

## 2. 採用/拒絕決策流程

### 2.1 狀態機

```
候選初始狀態：decision = null（pending）
使用者點擊「採用」→ decision = 'adopted'
使用者點擊「拒絕」→ 跳出拒絕原因輸入框
  → 輸入 reason（必填）後確認 → decision = 'rejected', reason = <input>
使用者可重置：再次點擊反向按鈕 → 回到 null（pending）
```

### 2.2 UI 狀態對應

| decision 值 | 採用按鈕樣式 | 拒絕按鈕樣式 | 列表列背景 |
|---|---|---|---|
| `null`（pending） | 預設（outline） | 預設（outline） | 白色 / 正常 |
| `adopted` | 實心綠色（active） | 預設（disabled） | 綠色淡底 |
| `rejected` | 預設（disabled） | 實心紅色（active） | 紅色淡底 |

### 2.3 pending 阻止提交邏輯

```javascript
function canSubmit(candidates) {
  return candidates.every(c => c.decision !== null);
}

function onSubmitClick(candidates) {
  if (!canSubmit(candidates)) {
    const pending = candidates.filter(c => c.decision === null);
    alert(`尚有 ${pending.length} 筆候選未完成決策，請先逐一審核`);
    // 滾動至第一筆 pending 候選
    scrollToPending(pending[0].id);
    return;
  }
  generateDraft(candidates);
}
```

---

## 3. 草稿輸出格式

### 3.1 路徑規則

```
路徑格式：design/stitch/drafts/candidate-review-<timestamp>.md
timestamp 格式：YYYYMMDD-HHmmss
範例：design/stitch/drafts/candidate-review-20260326-143000.md
```

### 3.2 草稿格式

```markdown
---
generated_at: 2026-03-26T14:30:00+08:00
source_files:
  - docs/memory/skill-candidates.md
reviewer: human
session_ref: 2026-03-26
change_ref: phase9-v2-lightweight-ui-workbench-mvp
---

# 候選審核草稿

| 候選 ID | 標題 | 摘要 | confidence | source_ref | 決策 | 拒絕原因 | reviewed_at |
|---|---|---|---|---|---|---|---|
| 候選 1：對話紀錄提取 | 對話紀錄提取與沉澱 | 從對話紀錄中提取... | medium | 直接對應本專案核心目標 | adopted | — | 2026-03-26T14:30:00+08:00 |
| 候選 2：規劃先行 | 規劃先行的專案啟動流程 | 對於高不確定性... | medium | 已在本專案中驗證有效 | rejected | 尚需跨專案重複證據 | 2026-03-26T14:30:00+08:00 |
```

### 3.3 輸出規則

- **不覆蓋正式文件**：輸出路徑必須在 `design/stitch/drafts/` 下，禁止寫入 `docs/memory/*.md`
- **MVP 下載方式**：同 Handoff Builder，採 `Blob` + `<a download>` 下載
- **只輸出已決策記錄**：草稿表格含所有候選（adopted + rejected），不含 pending（提交前已確保無 pending）

---

## 4. 空狀態處理

| 情境 | 觸發條件 | UI 呈現 |
|---|---|---|
| skill-candidates.md 讀取失敗 | `fetch()` 失敗 | 顯示「無法載入候選清單，請確認路徑正確」 |
| 無候選資料 | 解析結果為空陣列 | 顯示「目前無技能候選，請先執行提取流程」（空狀態卡片）|
| 全部已決策 | `canSubmit() === true` | 啟用「輸出審核草稿」按鈕（由 disabled → active）|

---

## 5. 已知缺口與後續

| 缺口 | 說明 | 後續 |
|---|---|---|
| `confidence` 欄位缺失 | `skill-candidates.md` 無欄位，固定 mock 為 `medium` | Phase 4 補齊欄位格式並更新解析 |
| `source_ref` 映射模糊 | 以「為何值得觀察」第一項替代，非正式來源 ID | Phase 4 補齊後更新映射規則 |
| 拒絕原因強制輸入 | 目前設計為 prompt dialog；靜態 UI 可改用 inline textarea | 視 UX 評估決定 |

---

*v1 — 2026-03-26 — Task 4.1 + 4.2*
