# Codex CLI 支援修補記錄（Follow-up）

> 日期：2026-04-03（第二輪）
> 觸發背景：第一輪修補後，Codex CLI 實測截圖 + follow-up review 文件確認新的問題。

---

## 思考過程

### 截圖帶來的三個關鍵事實（比文件分析更可靠）

1. **Codex CLI 直接測試確認**：`AGENTS.md` 是唯一可靠自動入口；`CODEX.md` 沒有額外 config 就不會 auto active
2. **14 個 skills 可見**（含 `deploy-conductor` + `upgrade-advisor`）— 第一輪 Bug A 修復有效
3. **本機 OpenSpec 狀態**：只安裝 core profile（`/opsx-propose/explore/apply/archive`），**沒有** `/opsx-new/ff/verify`

### 最關鍵的新發現（兩類 `/opsx-*` 的混淆）

`/opsx-new`、`/opsx-ff`、`/opsx-verify` 是 Codex **slash commands**（`~/.codex/prompts/opsx-*.md`），
`openspec new change`、`openspec apply` 是 **openspec CLI tool** 指令（被 SKILL.md 使用）。

**兩者完全不同**，但 `codex-cli-init.md` 的 Executor 段把 slash commands 當成 Executor 的執行指令，
造成：按文件操作 → 輸入 `/opsx-new` → Codex CLI 找不到 command → 直接失敗。

這是「低摩擦」目標的最大阻礙，也是本輪最優先修正的問題。

---

## 執行細節

### Step 1：AGENTS.md — Thin Entry Strategy + 三層 skills 說明

**修改前**
```
Codex：CODEX.md 為平台入口，列出所有 skill / rule / agent 路徑清單
```

**修改後**
```
Codex：AGENTS.md 為 Codex CLI 可靠自動入口；CODEX.md 為顯式讀取導覽補充文件
```

同時新增「Skills 路徑對照（三層定位）」表格，明確說明：
- `.github/skills/`：Canonical source（GitHub Copilot path）
- `.codex/skills/`：OpenSpec 對 Codex 的 tool-specific install path
- `.agents/skills/`：Codex CLI repo-native discovery path

### Step 2：agent-entrypoints.md — Codex 段

**修改前**
```
入口檔：CODEX.md
```

**修改後**
```
可靠自動入口：AGENTS.md；CODEX.md 為 Codex 專用導覽補充（需顯式讀取）
```

同時更新 Per-change 提示詞路徑描述（已實際生成 v3/，非「待生成」）。

### Step 3：platform-snippets.md — Codex Minimal Entrypoint

**修改前**
```
Read CODEX.md first
```

**修改後**
```
Read AGENTS.md first (it is the reliable auto-discovered entry for Codex CLI).
Then read CODEX.md for Codex-specific path guidance.
```

### Step 4：codex-cli-init.md — Executor 段（最高優先）

**修改前**（直接誤導）
```
/opsx-new "<change-name>"
/opsx-ff
/opsx-apply "<change-name>"
/opsx-verify "<change-name>"
```

**修改後**（使用 openspec CLI + skill files）
```
openspec new change "<change-name>"
openspec status --change...
# 依 openspec apply 逐步推進
# openspec archive 歸檔
```

同時加入明確警告：
- 本機只安裝 core slash commands（`/opsx-propose/explore/apply/archive`）
- expanded commands（`/opsx-new/ff/verify`）尚未安裝
- 建議路線：直接使用 openspec CLI + skill files

---

## 修改檔案清單

| 檔案 | 操作 | 影響性 |
|------|------|--------|
| `AGENTS.md` | 修改 Thin Entry Strategy + 新增三層 skills 說明 | High |
| `docs/agents/agent-entrypoints.md` | 修改 Codex 段入口說明 | High |
| `docs/agents/platform-snippets.md` | 改為先讀 AGENTS.md | High |
| `docs/agents/codex-cli-init.md` | Executor 段移除 slash commands，改為 openspec CLI | **最高** |

---

## 結果與信心度

| 問題 | 解法 | 信心度 |
|------|------|--------|
| AGENTS.md 入口敘事不一致 | 改措辭，AGENTS.md 為可靠入口 | ✅ High |
| agent-entrypoints.md 同上 | 同步修正 | ✅ High |
| platform-snippets.md 順序錯誤 | 改為先讀 AGENTS.md | ✅ High |
| codex-cli-init.md 誤導 slash commands | 改為 openspec CLI + skill-based 說明 | ✅ High |
| CODEX.md 自動載入 | ❌ 無法解決（per-machine config，已記錄 L1） | — |
| expanded `/opsx-*` 安裝 | ❌ 超出範圍，需使用者另行安裝 | — |

---

## 目前 Codex CLI 支援程度

| 能力 | 狀態 | 說明 |
|------|------|------|
| AGENTS.md 自動載入 | ✅ 可靠 | 實測確認 |
| 14 個 skills 可見 | ✅ 可靠 | 含 deploy-conductor + upgrade-advisor |
| `.agents/skills/` native discovery | ✅ 目錄已建立 | 實測確認可見 |
| `codex-prompts/v3/` 18 個提示詞 | ✅ 已生成 | 6 個 change × 3 角色 |
| core slash commands | ✅ 已安裝 | `/opsx-propose/explore/apply/archive` |
| expanded slash commands | ⚠️ 未安裝 | `/opsx-new/ff/verify/sync`，需另行安裝 |
| CODEX.md 自動載入 | ⚠️ 需 config | per-machine `~/.codex/config.toml` 設定 |

---

## 後續待辦

1. 若要啟用 expanded slash commands：`openspec config profile` 選 expanded → `openspec update`
2. 模板層：下一版應將 `deploy-conductor.md` + `upgrade-advisor.md` 加入 `template_src/` managed files，避免再次升級遺漏（見 codex-known-limitations.md L2 的結構問題）

---

## 下一步提示詞（可直接貼入 Codex CLI）

### 方式 A：歸檔 conversation-schema-definition + 開始下一個 change

```
Read AGENTS.md first.
Then read CODEX.md for Codex-specific path guidance.
Then read docs/handoff/current-task.md and docs/handoff/blockers.md.
Then read docs/roadmap.md and docs/planning/v3-brief.md.
Then read docs/agents/commands.md.

Current state: change "conversation-schema-definition" is ready for archive (per current-task.md).

Step 1 — Archive conversation-schema-definition:
Read .github/agents/review-gate.agent.md as your role spec.
Read .github/skills/openspec-archive-change/SKILL.md and follow its steps to archive the change.

Step 2 — Start plain-text-adapter-refactor:
Use docs/agents/codex-prompts/v3/plain-text-adapter-refactor-planner.md as session prompt.
Read .github/agents/openspec-planner.agent.md as your role spec.
Produce the Planner output and wait for confirmation.
```

### 方式 B：只做 Planner（最小入口，開新 session 用）

直接貼入 `docs/agents/codex-prompts/v3/plain-text-adapter-refactor-planner.md` 的內容。

### V3 Change 執行順序（依 brief）

| # | Change | 狀態 | Planner prompt |
|---|--------|------|----------------|
| 1 | `conversation-schema-definition` | ready for archive | — |
| 2 | `plain-text-adapter-refactor` | 未開始 | `codex-prompts/v3/plain-text-adapter-refactor-planner.md` |
| 3 | `chatgpt-adapter` | 未開始 | `codex-prompts/v3/chatgpt-adapter-planner.md` |
| 4 | `local-import-vscode-copilot` | 未開始 | `codex-prompts/v3/local-import-vscode-copilot-planner.md` |
| 5 | `source-attribution-in-memory` | 未開始 | `codex-prompts/v3/source-attribution-in-memory-planner.md` |
| 6 | `import-ui-multi-source` | 未開始 | `codex-prompts/v3/import-ui-multi-source-planner.md` |
