# V2 UI 資料來源契約 v1

> 建立日期：2026-03-26  
> 對應 change：`phase9-v2-lightweight-ui-workbench-mvp`  
> 狀態：v1（可重播，待 Phase 3 實作驗證後升版）

---

## 1. 資料來源路徑（輸入）

| UI 功能 | 輸入來源路徑 | 關鍵欄位 |
|---|---|---|
| 專案總覽 | `docs/roadmap.md` | Phase 清單、`[x]`/`[ ]` 完成狀態、Phase 名稱、版本、目標、狀態 |
| 專案總覽 | `openspec/changes/<name>/.openspec.yaml` | `name`、`created`、`status`（active/archived） |
| 專案詳情 | `openspec/changes/<name>/proposal.md` | Why、Scope（In/Out）、Acceptance Criteria |
| 專案詳情 | `openspec/changes/<name>/tasks.md` | task 標題、完成狀態（`[x]`/`[ ]`）、驗收條件、產出 |
| Handoff Builder | `docs/handoff/current-task.md` | Task Name、Goal、Scope、Constraints、Done、In Progress、Next Step、Validation Status |
| 候選審核 | `docs/memory/skill-candidates.md` | 候選標題、說明（summary）、目前狀態（status）、尚缺（source_ref 代用）、confidence（隱含） |
| Memory Review | `docs/memory/decision-log.md` | 決策條目、時間戳（若有） |
| Memory Review | `docs/memory/preference-rules.md` | 偏好規則條目 |
| Memory Review | `docs/memory/output-patterns.md` | 輸出模式條目 |
| Memory Review | `docs/memory/project-context.md` | 專案背景條目 |
| Memory Review | `docs/memory/task-patterns.md` | 任務模式條目 |

### 1.1 資料來源格式約定

- **roadmap.md**：GFM 表格，以 `| [x] |`/`| [ ] |` 標識完成狀態；Phase 3 詳情以 `###` 段落分隔。
- **.openspec.yaml**：YAML，`name` 欄位為 change name，`created` 為 ISO8601 日期。
- **proposal.md / tasks.md**：GFM Markdown，段落以 `##` 標題分隔，tasks 以 `- [ ]`/`- [x]` 列表標識。
- **current-task.md**：GFM Markdown，欄位以 `##` 表頭定義，值為純文字段落或列表。
- **skill-candidates.md**：GFM Markdown，每個候選以 `###` 標題開始，欄位為 `-` 列表項。
- **memory/*.md**：GFM Markdown，以 `##`/`###` 分類，每條目為 `-` 列表項或段落。

---

## 2. 草稿輸出規格（輸出）

| UI 功能 | 草稿路徑 | 格式 | 禁止覆蓋 |
|---|---|---|---|
| Handoff Builder | `design/stitch/drafts/handoff-draft-<timestamp>.md` | Markdown | `docs/handoff/current-task.md` |
| 候選審核 | `design/stitch/drafts/candidate-review-<timestamp>.md` | Markdown 表格 | `docs/memory/*.md` |
| Memory Review | `design/stitch/drafts/memory-review-<timestamp>.md` | Markdown 清單 | `docs/memory/*.md` |

### 2.1 timestamp 格式

使用 `YYYYMMDD-HHmmss` 格式，例如：`handoff-draft-20260326-143000.md`

### 2.2 路徑安全規則

- 所有草稿輸出僅能寫入 `design/stitch/drafts/` 目錄
- 禁止寫入 `docs/handoff/`、`docs/memory/`、`openspec/` 等正式層
- 輸出前需檢查目標路徑是否在允許目錄下（路徑前綴驗證）

---

## 3. Run Metadata 格式

每份草稿輸出需包含以下 front-matter 或標頭區塊：

```markdown
---
generated_at: 2026-03-26T14:30:00+08:00
source_files:
  - docs/handoff/current-task.md
reviewer: human
session_ref: 2026-03-26
change_ref: phase9-v2-lightweight-ui-workbench-mvp
---
```

欄位說明：
- `generated_at`：ISO 8601 時間戳（含時區）
- `source_files`：本次讀取的所有輸入路徑清單
- `reviewer`：`human`（人工審核）或 `agent`（自動產出）
- `session_ref`：對應的 runlog 日期（`YYYY-MM-DD`）
- `change_ref`：對應的 OpenSpec change name

---

## 4. 欄位映射細節

### 4.1 Handoff Builder 欄位映射

| UI 欄位 | current-task.md 欄位 | 必填 | 備註 |
|---|---|:---:|---|
| Task Name | `## Task > Name:` | ✅ | 對應 `- Name:` 行 |
| Goal | `## Goal` 段落 | ✅ | 多行文字 |
| Scope In | `## Scope > In scope:` | ✅ | 列表項 |
| Scope Out | `## Scope > Out of scope:` | — | 列表項 |
| Constraints | `## Constraints` 段落 | — | 多行文字 |
| Done | `## Done` 列表 | — | 列表項 |
| In Progress | `## In Progress` 列表 | — | 列表項 |
| Next Step | `## Next Step` 列表 | ✅ | 列表項 |
| Validation Status | `## Validation Status` 列表 | — | 列表項 |

### 4.2 候選審核欄位映射

| UI 欄位 | skill-candidates.md 欄位 | 備註 |
|---|---|---|
| 候選標題 | `### 候選 N：<title>` | 作為候選 ID |
| summary | `- 說明：` | 簡要描述 |
| status | `- 目前狀態：` | 候選/升級/拒絕 |
| source_ref | `- 為何值得觀察：` 第一行 | 來源參考替代 |
| confidence | （隱含，預設 medium） | 暫無欄位，待 Phase 4 |
| pending_reason | `- 尚缺：` | 待補充項目 |

**已知缺口**：`skill-candidates.md` 缺少 `confidence` 欄位與明確 `source_ref`（S7 執行記錄、AGENTS.md），需在 Phase 4 補齊或以 mock 展示。

### 4.3 Memory Review 分類映射

| UI 分類名稱 | 對應檔案 | 解析策略 |
|---|---|---|
| 決策記錄 | `docs/memory/decision-log.md` | `##`/`###` 段落 → 條目 |
| 偏好規則 | `docs/memory/preference-rules.md` | `##` 段落 + `-` 項目 |
| 輸出模式 | `docs/memory/output-patterns.md` | `##` 段落 + `-` 項目 |
| 專案背景 | `docs/memory/project-context.md` | `##` 段落 + `-` 項目 |
| 任務模式 | `docs/memory/task-patterns.md` | `##` 段落 + `-` 項目 |
| 技能候選 | `docs/memory/skill-candidates.md` | `### 候選 N` → 條目 |

---

## 5. 已知缺口（待修正）

| 缺口 | 說明 | 優先序 | 後續 |
|---|---|:---:|---|
| 候選審核 mock data 來源標籤 | `skill-candidates.md` 無 `confidence` 欄位，`source_ref` 以「尚缺」替代 | 中 | Phase 4 補齊欄位 |
| Memory Review 條目日期 | `docs/memory/*.md` 多數條目無 `YYYY-MM-DD` 時間戳 | 低 | 後續手動標注或腳本補齊 |
| 專案詳情 active change 發現邏輯 | 需掃描 `openspec/changes/` 排除 `archive/`，目前無自動化 | 高 | Task 2.x 實作時定義 |
| Handoff Builder 多行欄位解析 | current-task.md 部分欄位為多行段落，需定義截斷或完整讀取策略 | 中 | Task 3.x 定義 |

---

*v1 — 2026-03-26 — phase9-v2-lightweight-ui-workbench-mvp*
