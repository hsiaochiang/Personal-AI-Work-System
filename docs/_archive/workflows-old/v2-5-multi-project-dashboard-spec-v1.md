# 跨專案儀表板規格 v2.5（docs-only）

> **版本**：v1.0
> **建立日期**：2026-03-27
> **所屬 Change**：`phase10-v2.5-multi-project-shared-capability-mvp`
> **目的**：定義輕量跨專案儀表板的資訊架構、視圖欄位與資料來源聚合邏輯，作為 Phase 5 UI 實作的設計基線。
> **實作狀態**：⚠️ 本文件為 docs-only 規格，**不含前端實作**；標注「需 Phase 5 UI」的部分需等 Phase 5 完成後才能呈現。

---

## 主要視圖定義

儀表板分三個主要視圖：

1. **專案清單（Project List）**
2. **Active Change 聚合（Active Changes Aggregate）**
3. **跨專案 Memory 摘要（Cross-Project Memory Summary）**

---

## 視圖一：專案清單（Project List）

### 用途
一覽所有已納入管理的專案，快速了解各專案狀態。

### 欄位定義

| 欄位 | 資料來源 | 說明 | 需 Phase 5 UI？ |
|------|---------|------|:--------------:|
| 專案名稱 | `<project-root>/AGENTS.md`（第一行標題）或目錄名稱 | 顯示名稱 | 是 |
| 根路徑 | 儀表板設定檔（見資料來源章節） | 本機絕對路徑 | 否（可直接讀設定） |
| 當前 Phase | `<project-root>/docs/roadmap.md`（`## 目前狀態` 段落） | 如「Phase 4 進行中」 | 是 |
| Active Change | `<project-root>/openspec/changes/`（非 archive 的目錄） | 當前 change name 或「無」 | 是 |
| 最後更新日期 | `<project-root>/docs/handoff/current-task.md`（`Last updated on` 欄位） | `YYYY-MM-DD` | 否（可解析 markdown） |
| Blocker 狀態 | `<project-root>/docs/handoff/blockers.md`（有無 active blocker） | 無 / 有（N 項） | 是 |

### MVP 最小可行欄位（Phase 5 前可用 CLI 呈現）

在 Phase 5 UI 實作前，以下欄位可透過 PowerShell/Python 腳本讀取並輸出到 terminal：
- 根路徑
- 最後更新日期
- Active Change（目錄掃描）

---

## 視圖二：Active Change 聚合（Active Changes Aggregate）

### 用途
聚合所有專案的進行中 change，排優先序，了解哪些 change 最需要關注。

### 欄位定義

| 欄位 | 資料來源 | 說明 | 需 Phase 5 UI？ |
|------|---------|------|:--------------:|
| Change Name | `<project-root>/openspec/changes/<change-name>/.openspec.yaml`（`name` 欄位） | Change 的唯一識別名稱 | 是 |
| 所屬專案 | 路徑解析 | 哪個專案下的 change | 否 |
| 目前狀態 | `.openspec.yaml`（`status` 欄位） | `draft / active / done / archived` | 是 |
| Validate 狀態 | `docs/handoff/current-task.md`（`Validation Status` 欄位） | `PASS / FAIL / 未執行` | 否（可解析 markdown） |
| 最後更新日期 | `.openspec.yaml`（`updated_at` 欄位）或 tasks.md 最後修改時間 | `YYYY-MM-DD` | 否 |
| 待辦 Tasks 數量 | `tasks.md`（未勾選的 `[ ]` 計數） | 未完成 task 數 | 否（可 grep 計數） |
| 完成 Tasks 數量 | `tasks.md`（已勾選的 `[x]` 計數） | 已完成 task 數 | 否 |

### 優先序排列規則

1. `active` status + 有未完成 task → 最高優先
2. `active` status + validate FAIL → 高優先（需立即處理）
3. `draft` status → 中優先
4. `done` status → 低優先（等待 archive）

---

## 視圖三：跨專案 Memory 摘要（Cross-Project Memory Summary）

### 用途
快速了解各專案的記憶狀態，發現跨專案可共用的模式或規則。

### 欄位定義

| 欄位 | 資料來源 | 說明 | 需 Phase 5 UI？ |
|------|---------|------|:--------------:|
| 所屬專案 | 路徑解析 | 哪個專案的記憶 | 是 |
| 記憶文件清單 | `<project-root>/docs/memory/` 目錄列表 | 各記憶檔案的存在狀態 | 是 |
| Skill 候選數量 | `<project-root>/docs/memory/skill-candidates.md`（候選條目計數） | 候選 N 個，審核中 M 個 | 否（可解析計數） |
| 個人 Memory 摘要 | `/memories/workstyle.md`（前 3 行摘要） | 使用者跨專案偏好摘要 | 是 |
| 最後提取日期 | `docs/runlog/`（最近一筆含「提取」關鍵字的 runlog 日期） | 上次記憶提取日期 | 否 |

### 跨專案共用識別規則

若多個專案的 `docs/memory/skill-candidates.md` 中同時出現相同描述的候選，應標注「跨專案共用候選」，優先考慮升級為 shared skill。

---

## 資料來源路徑規範

### 儀表板設定檔

為支援多專案聚合，需有一個設定檔定義「哪些專案納入儀表板」：

```yaml
# <Personal-AI-Work-System-root>/openspec/config.yaml 中追加（或獨立設定檔）
# 或置於 ~/.config/ai-workbench/projects.yaml

dashboard:
  projects:
    - name: Personal-AI-Work-System
      root: D:/program/Personal-AI-Work-System
      active: true
    - name: my-other-project
      root: D:/program/my-other-project
      active: true
```

### 多專案場景示範

#### 場景 A：單一開發者，兩個並行專案

```
開發者本機
├── D:/program/Personal-AI-Work-System/   （主系統，含 shared workflows）
│   ├── docs/roadmap.md                   → 讀取 Phase 狀態
│   ├── openspec/changes/phase10-xxx/     → 讀取 Active Change
│   └── docs/memory/skill-candidates.md  → 讀取 skill 候選
│
└── D:/program/client-project-alpha/      （客戶專案，使用本系統的 shared workflows）
    ├── docs/roadmap.md                   → 讀取 Phase 狀態
    ├── openspec/changes/feature-login/   → 讀取 Active Change
    └── docs/memory/skill-candidates.md  → 讀取 skill 候選
```

**聚合示例（Project List 視圖）**：

| 專案名稱 | 當前 Phase | Active Change | 最後更新 | Blockers |
|---------|-----------|---------------|---------|---------|
| Personal-AI-Work-System | Phase 4 完成 | 無 | 2026-03-27 | 無 |
| client-project-alpha | Phase 1 進行中 | `feature-login` | 2026-03-25 | 有（1 項） |

#### 場景 B：同一專案，多個 active change（並行開發）

```
D:/program/big-project/
├── openspec/changes/
│   ├── feature-auth/         → Active Change 1
│   └── feature-dashboard/    → Active Change 2
└── docs/roadmap.md           → Phase 狀態
```

**聚合示例（Active Change 聚合視圖）**：

| Change Name | 所屬專案 | 狀態 | 待辦 Tasks | Validate |
|------------|---------|------|-----------|---------|
| feature-auth | big-project | active | 3 | PASS |
| feature-dashboard | big-project | draft | 7 | 未執行 |

---

## 聚合欄位清單

以下欄位可跨專案聚合，適合在儀表板首頁顯示摘要數字：

| 聚合欄位 | 計算方式 | 說明 |
|---------|---------|------|
| 總專案數 | 設定檔 `active: true` 計數 | 納入管理的專案數量 |
| Active Change 總數 | 所有專案 `openspec/changes/`（非 archive）目錄計數 | 進行中 change 總量 |
| Validate FAIL 數 | 掃描各專案 handoff 的 Validation Status | 需立即處理的問題數 |
| 有 Blocker 的專案數 | 掃描各專案 `docs/handoff/blockers.md` | 阻塞中的專案數 |
| Skill 候選總數 | 各專案 `skill-candidates.md` 候選計數加總 | 跨專案候選升級潛力 |
| 上週完成 Tasks | 掃描 runlog，統計 7 天內 `[x]` 新增數量 | 近期活躍度指標 |

---

## 聚合邏輯說明

### 聚合觸發時機

- **手動觸發**（Phase 5 前）：執行 CLI 腳本，輸出到 terminal 或 markdown 文件
- **自動觸發**（Phase 5 後）：儀表板 UI 啟動時自動讀取各專案路徑

### 聚合步驟

1. 讀取設定檔，獲取所有 `active: true` 的專案根路徑清單
2. 對每個專案根路徑，平行讀取以下文件：
   - `docs/roadmap.md`（Phase 狀態）
   - `docs/handoff/current-task.md`（last updated、Validation Status）
   - `docs/handoff/blockers.md`（blocker 狀態）
   - `openspec/changes/`（非 archive 子目錄列表）
   - `docs/memory/skill-candidates.md`（候選計數）
3. 解析各文件的目標欄位（使用 markdown heading + pattern matching）
4. 將所有專案資料合併為統一資料模型
5. 依優先序排列（Blocker > Validate FAIL > Active > Draft）
6. 輸出到視圖

### 錯誤處理原則

- 若某專案的必要文件不存在，顯示「⚠️ 未初始化（缺少 `<檔案路徑>`）」
- 不中斷整體聚合；繼續處理其他專案
- 每次聚合在 runlog 中記錄「掃描了 N 個專案，成功 M 個，缺失 K 個」

---

## Phase 5 前置需求（標注）

以下功能需等 Phase 5 UI 實作後才能呈現於圖形介面：

| 功能 | 說明 | Phase 5 工作 |
|------|------|------------|
| 視覺化專案清單卡片 | 每個專案以卡片呈現 | UI 元件：ProjectCard |
| Blocker 紅色警示 | 有 blocker 的專案標紅 | UI 狀態：BlockerBadge |
| Change 甘特圖/時間軸 | 多個 change 的時間排列 | UI 元件：ChangeTimeline |
| Memory 文字雲 | 跨專案高頻詞分析 | NLP 層 + UI |
| 即時聚合刷新 | 儀表板自動定時刷新 | 背景排程 + WebSocket |

---

## 參考

- 個人/專案層邊界：`docs/workflows/v2-5-personal-project-boundary-v1.md`
- 新專案初始化：`docs/workflows/new-project-init-v1.md`
- Phase 3 UI 架構：`docs/workflows/v2-ui-data-contract-v1.md`
- Skill 候選升級：`docs/workflows/v2-5-skill-candidate-promotion-v1.md`
