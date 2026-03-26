# Phase 3 設計基線確認

> 審查日期：2026-03-26  
> 審查人：GitHub Copilot (OpenSpec Executor)  
> 設計稿目錄：`design/stitch/snapshots/2026-03-26/stitch_personal_ai_work_system_phase3_mvp/`  
> 對應 change：`phase9-v2-lightweight-ui-workbench-mvp`

---

## 1. 設計稿頁面與 Proposal 功能對應

| Proposal 功能 | 設計稿目錄 | HTML 檔案 | 對應關係 |
|---|---|---|:---:|
| 專案總覽與專案頁（Phase 進度概覽） | `s9_2/` | `code.html` | ✅ 直接對應 |
| 專案詳情頁（Active Change 詳情） | `s9_1/` | `code.html` | ✅ 直接對應 |
| Handoff Builder | `handoff_builder/` | `code.html` | ✅ 直接對應 |
| 候選審核介面 | `_/` | `code.html` | ✅ 直接對應（目錄名為 `_`） |
| Memory Review 介面 | `memory_review/` | `code.html` | ✅ 直接對應 |

**額外設計稿**：`slate_nexus/` — 不在 Proposal 五項功能範圍內，Out of scope（Phase 4+ 候選）。

---

## 2. 逐頁結構分析

### 2.1 專案總覽（s9_2/code.html）

**頁面標題**：`個人 AI 工作系統 - 專案總覽`  
**技術棧**：TailwindCSS（CDN）、Material Symbols、Manrope + Inter 字型

**主要 UI 元素**：
- 頂部導覽列（固定）：Personal AI Work System、儀表板（目前頁）、工作區、分析
- Phase 進度卡片區（推測核心呈現區）
- Active Change 清單區

**與 Proposal 對應**：
- ✅ Phase 清單呈現（對應 AC 2：讀取 `docs/roadmap.md`）
- ✅ Active Change 清單（對應 AC 2：讀取 `openspec/changes/`）
- ⚠️ **問題 1**：設計稿導覽標籤為「儀表板/工作區/分析」，Proposal 未定義導覽結構，需在實作時確認路由

### 2.2 專案詳情（s9_1/code.html）

**頁面標題**：推測為 Active Change 詳情頁（S9 語意）

**主要 UI 元素**：
- Change Name 標題區
- Scope 說明區（In/Out scope）
- Acceptance Criteria 清單
- Task 完成進度（推測含進度條或勾選清單）

**與 Proposal 對應**：
- ✅ 讀取 `proposal.md`（Why、Scope、AC）
- ✅ 讀取 `tasks.md`（完成狀態）
- ⚠️ **問題 2**：設計稿為靜態 mock，tasks 完成狀態為假資料；實作需 markdown parse `- [x]`/`- [ ]` 格式

### 2.3 Handoff Builder（handoff_builder/code.html）

**頁面標題**：`Handoff Builder - Personal AI Work System`  
**導覽**：儀表板、工作區（目前）、分析、治理

**主要 UI 元素**：
- 表單式欄位編輯區（Task Name、Goal、Next Step 等）
- 輸出草稿按鈕
- 必填驗證提示

**與 Proposal 對應**：
- ✅ 讀取 `docs/handoff/current-task.md`
- ✅ 支援編輯與草稿輸出
- ✅ 必填驗證（Task Name、Goal、Next Step）
- ⚠️ **問題 3**：設計稿「治理」導覽標籤存在，但 Proposal 中無此功能定義，Out of scope（Phase 4+）

### 2.4 候選審核介面（_/code.html）

**目錄命名**：`_`（可能為預設或無名稱頁籤）

**主要 UI 元素**：
- 候選清單視圖（summary、confidence、source_ref）
- 採用/拒絕決策按鈕
- 待審核狀態標籤（pending/adopted/rejected）
- 提交阻止邏輯（pending 時停用提交）

**與 Proposal 對應**：
- ✅ 候選清單呈現（AC 4）
- ✅ 採用/拒絕決策與草稿輸出（AC 4）
- ✅ pending 阻止提交（AC 4）
- ℹ️ 資料來源：`docs/memory/skill-candidates.md`（欄位映射見資料契約）

### 2.5 Memory Review（memory_review/code.html）

**主要 UI 元素**：
- 分類清單視圖（decision-log, preference-rules, output-patterns 等）
- 每分類下條目列表（採用/拒絕操作）
- 草稿輸出控制

**與 Proposal 對應**：
- ✅ 分類清單呈現（AC 5）
- ✅ 採用/拒絕操作（AC 5）
- ✅ 草稿輸出至草稿層（AC 5）
- ✅ 原始文件不修改（AC 5）

---

## 3. 需修正點彙整

| # | 問題 | 影響頁面 | 風險等級 | 建議處理方式 |
|:---:|---|---|:---:|---|
| 1 | 導覽結構（儀表板/工作區/分析/治理）未在 Proposal 定義，可能造成路由實作模糊 | 全部頁面 | 中 | Task 2.x 實作時明確定義：五頁採主頁導覽連結，不實作路由系統（純靜態跳頁）|
| 2 | 專案詳情 tasks 完成狀態為靜態 mock，需 markdown parse | s9_1 | 高 | Task 2.2 實作說明文件中定義 `- [x]`/`- [ ]` regex 解析策略 |
| 3 | 候選審核 `confidence` 欄位與 `source_ref` 在 `skill-candidates.md` 中無對應欄位格式 | 候選審核 | 中 | Task 4.x 以 mock 值填充，並在資料契約中標注已知缺口 |

---

## 4. 整體評估

- **設計稿完整性**：5/5 頁面均存在且可開啟，設計稿覆蓋所有 Proposal 功能（含 `_/` 候選審核）。
- **技術可行性**：全部採用純靜態 HTML + TailwindCSS，無框架依賴，符合 Proposal「純靜態前端」決策。
- **主要整合風險**：動態 markdown 資料讀取（`fetch` + 解析），需在各頁實作說明文件中明確定義解析策略。
- **Out of scope 確認**：`slate_nexus/` 頁面不在本次範圍，不納入任何 Task。

---

*Phase 3 設計基線確認完成 — 2026-03-26*
