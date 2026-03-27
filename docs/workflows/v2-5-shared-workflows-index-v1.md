# Shared Workflow 目錄與引用規範 v2.5

> **版本**：v1.0
> **建立日期**：2026-03-27
> **所屬 Change**：`phase10-v2.5-multi-project-shared-capability-mvp`
> **目的**：全盤盤點 `docs/workflows/` 現有文件，標注可重用性，並定義共享 workflow 的引用規範，供多專案環境使用。

---

## 現有 Workflow 盤點

### 盤點清單

| # | 檔案名稱 | 說明 | 可重用性 | 備註 |
|---|---------|------|:--------:|------|
| W01 | `case-review-v1.md` | 單一 case 審查流程 | `per-project` | 與本專案特定 case 審查邏輯緊密綁定 |
| W02 | `conversation-and-branch-strategy.md` | 對話紀錄與 branch 管理策略 | `shared` | 適用任何以 git + AI 協作的專案 |
| W03 | `extraction-flow-v1.md` | 記憶提取主流程 | `shared` | 核心提取 SOP，可跨專案引用 |
| W04 | `extraction-rules-v1.md` | 提取規則集 | `shared` | 提取判斷規則，可作為基礎規則集引用 |
| W05 | `new-project-init-v1.md` | 新專案初始化流程 | `shared` | 標準化 bootstrap，跨專案通用 |
| W06 | `project-personal-boundary-v1.md` | 專案層與個人層邊界（V1） | `shared` | V2.5 已升版，見 `v2-5-personal-project-boundary-v1.md` |
| W07 | `s7-governance-sync-rules.md` | 治理文件同步規則 | `shared` | 適用任何實施 OpenSpec 治理的專案 |
| W08 | `s7-one-shot-execution-contract.md` | One-Shot 執行合約 | `shared` | Executor agent 通用執行契約 |
| W09 | `update-workflow.md` | 文件更新流程 | `shared` | 通用文件更新 SOP |
| W10 | `v2-ui-data-contract-v1.md` | V2 UI 資料契約 | `per-project` | 與本系統 UI 架構（Stitch MCP）緊密耦合 |
| W11 | `v2-5-personal-project-boundary-v1.md` | 個人層與專案層邊界（V2.5） | `shared` | 本次 Phase 4 新建，為 V1 升版 |
| W12 | `v2-5-shared-workflows-index-v1.md` | （本文件）Shared Workflow 索引 | `shared` | 新專案可直接引用此目錄索引 |

### 可重用性標注說明

| 標注 | 意義 |
|------|------|
| `personal-only` | 僅適用於本個人系統（Personal-AI-Work-System），不建議直接移植 |
| `shared` | 可跨專案直接引用，無需修改即可使用 |
| `per-project` | 需每專案獨立維護，可參考結構但需客製化內容 |

> 目前無 `personal-only` 類別。若未來有僅適用本系統的特殊流程，應標注此類別。

---

## Shared Workflow 清單（可跨專案引用）

以下為可直接在新專案中引用的 shared workflows：

1. **`conversation-and-branch-strategy.md`**：對話紀錄管理與 git branch 策略
2. **`extraction-flow-v1.md`**：記憶提取主流程 SOP
3. **`extraction-rules-v1.md`**：記憶提取規則集
4. **`new-project-init-v1.md`**：新專案初始化 bootstrap 流程
5. **`project-personal-boundary-v1.md`**（V1）/ **`v2-5-personal-project-boundary-v1.md`**（V2.5）：邊界規範
6. **`s7-governance-sync-rules.md`**：治理同步規則
7. **`s7-one-shot-execution-contract.md`**：Executor 執行合約
8. **`update-workflow.md`**：文件更新 SOP

---

## 共享 Workflow 引用規範

### 引用方式

Shared workflows 位於本 repo（Personal-AI-Work-System）的 `docs/workflows/` 目錄下。新專案引用時依以下規則處理：

#### 方式一：Direct Reference（推薦）

適合新專案與本 repo 共用或同一套工作環境的情境。在新專案的 `AGENTS.md` 或 `docs/handoff/current-task.md` 中，直接以相對路徑或絕對路徑標注引用來源：

```markdown
## 引用 Shared Workflows

本專案引用以下來自 Personal-AI-Work-System 的共享 workflow：

- 新專案初始化：`D:/program/Personal-AI-Work-System/docs/workflows/new-project-init-v1.md`
- 記憶提取流程：`D:/program/Personal-AI-Work-System/docs/workflows/extraction-flow-v1.md`
- 個人/專案層邊界：`D:/program/Personal-AI-Work-System/docs/workflows/v2-5-personal-project-boundary-v1.md`
```

#### 方式二：Copy + Attribution（客製化時使用）

若新專案需要客製化某個 shared workflow，應複製一份到新專案的 `docs/workflows/` 目錄，**並在文件頭部標注來源**：

```markdown
# 記憶提取主流程（客製化版）

> **Derived from**: `D:/program/Personal-AI-Work-System/docs/workflows/extraction-flow-v1.md`
> **版本基準**：v1.0（2026-03-26）
> **客製化說明**：調整了步驟 3 的提取觸發條件，適配 <your-project> 的雙來源輸入格式
```

### 路徑規範

| 情境 | 路徑格式 | 範例 |
|------|---------|------|
| 同機器本機引用 | 絕對路徑 | `D:/program/Personal-AI-Work-System/docs/workflows/extraction-flow-v1.md` |
| 跨機器引用（CI/CD 或文件說明） | 相對路徑 + repo 名稱 | `Personal-AI-Work-System/docs/workflows/extraction-flow-v1.md` |
| 文件內引用（Markdown link） | 相對路徑（從引用方文件位置出發） | `[提取流程](../../../Personal-AI-Work-System/docs/workflows/extraction-flow-v1.md)` |

### 引用範例（完整）

以下示範如何在新專案 `my-new-project` 的 `AGENTS.md` 中引用 shared workflow：

```markdown
# AGENTS.md（my-new-project）

## 先讀順序
1. `docs/handoff/current-task.md`
2. `docs/handoff/blockers.md`
3. `docs/roadmap.md`

## Shared Workflows（從 Personal-AI-Work-System 引用）

本專案採用 Personal-AI-Work-System 提供的共享 workflow，無需本地複製：

| Workflow | 用途 | 引用路徑 |
|---------|------|---------|
| 新專案初始化 | Bootstrap 新專案 | `D:/program/Personal-AI-Work-System/docs/workflows/new-project-init-v1.md` |
| 個人/專案層邊界 | 路徑讀寫邊界規則 | `D:/program/Personal-AI-Work-System/docs/workflows/v2-5-personal-project-boundary-v1.md` |
| Executor 執行合約 | One-shot 執行規則 | `D:/program/Personal-AI-Work-System/docs/workflows/s7-one-shot-execution-contract.md` |

## 客製化說明
- 未對上述 shared workflows 做任何修改；若需客製化，請 copy 至本專案 `docs/workflows/` 並標注 `Derived from:`。
```

---

## 維護規則

1. 每次新增 workflow 文件到 `docs/workflows/`，須在本目錄的「現有 Workflow 盤點」表格中追加一行。
2. 升版 shared workflow 時，舊版保留（不刪除），新版以版本號區別（如 `v2-5-xxx-v1.md`→ `v2-5-xxx-v2.md`）。
3. `per-project` 類別文件不在本索引中推廣，但仍列出以保持盤點完整。

---

## 參考

- 個人/專案層邊界：`docs/workflows/v2-5-personal-project-boundary-v1.md`
- 模板集：`docs/templates/`
- 技能候選升級流程：`docs/workflows/v2-5-skill-candidate-promotion-v1.md`
