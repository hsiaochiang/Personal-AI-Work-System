# 個人層與專案層邊界定義 v2.5

> **版本**：v1.0
> **建立日期**：2026-03-27
> **所屬 Change**：`phase10-v2.5-multi-project-shared-capability-mvp`
> **前置文件**：`docs/workflows/project-personal-boundary-v1.md`（V1.5，單專案邊界定義）
> **目的**：在多專案並存環境下，正式定義個人層（personal）與專案層（per-project）的路徑邊界、讀寫規則與衝突解決機制。

---

## 路徑盤點清單

### 個人層（Personal Layer）

個人層路徑在所有 workspace 與專案間共用，持久化至使用者本機設定。

| # | 路徑 | 說明 | 層級標注 |
|---|------|------|:-------:|
| P01 | `/memories/` | VS Code Copilot 使用者記憶根目錄（跨 workspace 持久化） | personal |
| P02 | `/memories/workstyle.md` | 使用者工作風格與偏好 | personal |
| P03 | `~/.vscode-insiders/User/settings.json` | VS Code 全域使用者設定 | personal |
| P04 | `~/.gitconfig` | Git 全域使用者設定（作者、別名等） | personal |
| P05 | `~/.ssh/` | SSH 金鑰與 config（存取認證） | personal |
| P06 | `~/.config/` | 其他 CLI 工具的使用者層設定 | personal |
| P07 | `/memories/session/` | 對話臨時層（跨 workspace，但隨對話結束清除） | personal（臨時） |

### 專案層（Per-Project Layer）

專案層路徑隸屬於特定 repository，每個專案獨立維護。

| # | 路徑 | 說明 | 層級標注 |
|---|------|------|:-------:|
| Q01 | `docs/roadmap.md` | 專案路線圖（唯一版本） | per-project |
| Q02 | `docs/handoff/current-task.md` | 當前任務交接文件 | per-project |
| Q03 | `docs/handoff/blockers.md` | 阻塞清單 | per-project |
| Q04 | `docs/decision-log.md` | 專案決策留痕主檔 | per-project |
| Q05 | `docs/runlog/<date>_README.md` | 每日進度記錄 | per-project |
| Q06 | `openspec/changes/` | OpenSpec change 生命週期目錄 | per-project |
| Q07 | `openspec/specs/` | 技術規格文件 | per-project |
| Q08 | `AGENTS.md` | 多 agent 協作入口 | per-project |
| Q09 | `design/` | UI/UX 設計產出 | per-project |
| Q10 | `docs/memory/` | 專案層記憶（project-context、task-patterns 等） | per-project |

### 共享層（Shared Layer）

共享層路徑屬於「個人 AI 工作台」本身，可跨專案引用但不複製。

| # | 路徑 | 說明 | 層級標注 |
|---|------|------|:-------:|
| S01 | `docs/workflows/` | 標準工作流定義 | shared |
| S02 | `docs/templates/` | 可初始化新專案的模板集 | shared |
| S03 | `.github/copilot/rules/` | Copilot agent 行為規則 | shared |
| S04 | `.github/copilot/skills/` | Promoted skill 文件集 | shared |
| S05 | `/memories/repo/` | 隸屬當前 repo 的 agent 記憶（repo-scoped） | shared（repo-scoped） |

---

## 邊界原則

### 原則 1：個人層不得由 agent 默默寫入

個人層（`/memories/` 根目錄、`~/.gitconfig` 等）只有在使用者**明確授權**的情況下才允許 agent 寫入。Agent 在執行任務時，若需記錄決策或偏好，應優先寫入 `docs/memory/`（專案層）或 `docs/runlog/`（per-project 證據），而非個人層。

**例外**：`/memories/session/` 屬對話臨時層，agent 可在對話中讀寫，但不得依賴其在下次對話中持續存在。

### 原則 2：專案層文件跟著 repo 走，不得跨 repo 混用

每個專案的 `docs/roadmap.md`、`openspec/`、`docs/handoff/` 等屬於該 repo 的內部狀態，不得直接在另一個專案中引用或修改。跨專案需要的資料（如 Active Change 狀態聚合），應透過**讀取多個 repo 的相同路徑**方式聚合，而非複製貼上。

### 原則 3：Shared 層以 direct reference 為主，不複製到各專案

`docs/workflows/`、`docs/templates/`、`.github/copilot/skills/` 等共享資源，新專案應通過**引用路徑**使用（如 `AGENTS.md` 的 `先讀順序` 指向共享 workflow），而非複製一份到每個專案目錄下。若專案需要客製化，應該 fork 並在 fork 文件中標注 `Derived from: <原始路徑>`。

### 原則 4：`docs/memory/` 是專案記憶，不等於使用者偏好

`docs/memory/preference-rules.md`、`docs/memory/task-patterns.md` 等是「本專案在特定時間點觀察到的偏好與規律」，是 per-project 的。使用者的**跨專案偏好**應寫入 `/memories/workstyle.md`；兩者不應混淆。

### 原則 5：`/memories/repo/` 是 repo-scoped agent 記憶，由 agent tool 管理

`/memories/repo/` 的內容由 Copilot memory tool 管理，其作用域是當前 repo。Agent 可直接讀取，但寫入需通過 memory tool `create` 指令，且僅適用於「這個 repo 的 codebase 慣例與已驗證做法」，不得存放使用者個人偏好。

---

## 個人層路徑清單（完整）

```
/memories/
├── workstyle.md           # 使用者工作風格偏好
├── (其他跨 workspace 個人記憶)
└── session/               # 臨時對話記憶（對話結束後清除）

~/.vscode-insiders/User/
├── settings.json          # VS Code 全域設定
└── keybindings.json       # 快捷鍵設定

~/.gitconfig               # Git 全域設定
~/.ssh/                    # SSH 認證金鑰
~/.config/                 # 其他 CLI 工具設定
```

---

## 專案層路徑清單（完整）

```
<project-root>/
├── AGENTS.md              # 多 agent 入口
├── docs/
│   ├── roadmap.md         # 唯一路線圖
│   ├── decision-log.md    # 決策留痕
│   ├── handoff/           # 交接文件
│   │   ├── current-task.md
│   │   └── blockers.md
│   ├── runlog/            # 每日進度
│   ├── memory/            # 專案記憶
│   │   ├── project-context.md
│   │   ├── task-patterns.md
│   │   ├── preference-rules.md
│   │   └── skill-candidates.md
│   ├── decisions/         # 決策詳情
│   └── qa/                # 測試紀錄
├── openspec/
│   ├── config.yaml
│   ├── changes/           # Change lifecycle
│   └── specs/             # 技術規格
└── design/                # UI/UX 設計
    └── stitch/
```

---

## 衝突時的決策規則

| 衝突情境 | 決策規則 |
|---------|---------|
| 個人層偏好 vs 專案層規則相衝突 | **專案層規則優先**（專案是協作環境，個人偏好不得影響專案一致性）。但若使用者明確表示「此偏好僅適用本專案」，可覆寫至 `docs/memory/preference-rules.md` |
| Shared workflow 與 per-project 客製化衝突 | **per-project 版本優先**，但 per-project 版本必須標注 `Derived from: <共享 workflow 路徑>` 及修改理由 |
| `/memories/workstyle.md` 與 `docs/memory/preference-rules.md` 定義相異 | 以當前**專案 context 為準**：對話在哪個 repo 發生，就以該 repo 的 `docs/memory/preference-rules.md` 為準；個人層設定是 fallback |
| 同一文件被多個 agent 並發寫入 | 後寫者覆蓋，但兩方均需在 `docs/runlog/` 留有寫入記錄；若發現覆蓋，以 runlog 時間戳判斷最新狀態 |
| 共享 workflow 升版，已引用的 per-project 版本未跟進 | **不強制升級**，per-project 版本可保持舊版；但應在 `AGENTS.md` 或 `docs/decision-log.md` 記錄「有意不升版」的決策 |

---

## 參考

- V1 邊界定義：`docs/workflows/project-personal-boundary-v1.md`
- 多專案儀表板規格：`docs/product/v2-5-multi-project-dashboard-spec-v1.md`
- 新專案初始化流程：`docs/workflows/new-project-init-v1.md`
