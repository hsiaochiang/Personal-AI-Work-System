# AGENTS.md

> 本檔案是 Copilot、Codex、Gemini Code Assist 在此 repo 的共用入口。平台專屬指令可存在各自設定檔，但共通規則以本檔為準。

## 先讀順序
1. `docs/handoff/current-task.md`
2. `docs/handoff/blockers.md`
3. `docs/roadmap.md`
4. `docs/planning/v{N}-brief.md`（當前版本的 Version Brief）
5. `docs/system-manual.md`
6. `docs/agents/project-context.md`
7. `docs/agents/commands.md`
8. `docs/agents/agent-entrypoints.md`
9. 需要時再讀 `.github/copilot/rules/` 與 `.github/copilot/skills/`

## 協作模式
- 長期證據層：沿用 `docs/roadmap.md`、`docs/decision-log.md`、`docs/runlog/`
- 短期交接層：使用 `docs/handoff/current-task.md`、`docs/handoff/blockers.md`
- 不要求每次 prompt 更新交接文件；採事件驅動更新

## 必須更新 handoff 的事件
1. 開始新任務
2. 完成一個可交接的子任務
3. 出現新的 blocker
4. 準備切換到另一個 agent
5. Session 收尾

## 可由 agent 直接更新的欄位
- Done
- In Progress
- Next Step
- Files Touched
- Validation Status
- Blocker 狀態與已排查內容

## 必須由人確認的事項
- Scope / Non-scope 變更
- 架構重寫或重大抽象調整
- 新增或升級重大 dependency
- 風險接受與上線決策
- merge / release / archive 類不可逆操作

## 更新原則
- 先做 Smallest Safe Change，再更新對應 evidence
- handoff 要短、可續接、可驗證，避免寫成對話紀錄
- 若 handoff 與 roadmap / decision-log 衝突，以 decision-log 與 roadmap 的人工確認內容為準

## 建議回報格式
- Current state
- Changes made
- Validation
- Open issues
- Next step

## Thin Entry Strategy
- Copilot：`.github/copilot-instructions.md` 只保留 Copilot 專屬規則，並先導向本檔
- Codex：**`AGENTS.md` 為 Codex CLI 可靠自動入口**；`CODEX.md` 為 Codex 專用導覽補充文件（需顯式讀取）；詳細啟動流程見 `docs/agents/codex-cli-init.md`
- Gemini Code Assist：若使用 workspace prompt 或 chat starter，內容也應只做導讀，不重複維護第二套規範
- 原則：共通規則只維護一份，平台專屬入口只做轉接

## Skills 路徑對照（三層定位）

> 這個 repo 同時存在三層 OpenSpec skills，各有明確定位：

| 目錄 | 定位 | 適用平台 |
|------|------|---------|
| `.github/skills/` | **Canonical source**（GitHub Copilot OpenSpec path，也是其他兩層的來源） | Copilot Chat |
| `.codex/skills/` | OpenSpec 對 Codex 的 tool-specific install path（副本，來源：`.github/skills/`） | GitHub Copilot Coding agent |
| `.agents/skills/` | Codex CLI repo-native discovery path（副本，來源：`.github/skills/`） | OpenAI Codex CLI |

同步原則：修改 skill 永遠先更新 `.github/skills/`，再同步到其他兩層。

## 共享 Skill 清單

> 所有 skill 的 canonical 位置。各平台透過原生機制存取（Copilot/Claude 自動掃描、Gemini CLI 由 GEMINI.md import、Codex 由本清單引導讀取）。

### OpenSpec Workflow Skills（`.github/skills/`，OpenSpec CLI 生成）

| Skill 名稱 | Canonical 路徑 | 說明 | 觸發情境 |
|------------|----------------|------|---------|
| `openspec-propose` | `.github/skills/openspec-propose/SKILL.md` | 一步提案新 change（proposal + design + spec + tasks） | 使用者描述想做什麼、呼叫 `OpenSpec Planner` |
| `openspec-explore` | `.github/skills/openspec-explore/SKILL.md` | 進入探索模式，釐清需求與問題 | 需要思考、不確定方向時 |
| `openspec-apply-change` | `.github/skills/openspec-apply-change/SKILL.md` | 逐步執行 change 的 tasks，標記完成 | `#opsx-apply`、呼叫 `OpenSpec Executor` |
| `openspec-archive-change` | `.github/skills/openspec-archive-change/SKILL.md` | 將完成的 change 歸檔 | `#opsx-archive`、呼叫 `Review Gate` |

### 共享工作技能（`.github/copilot/skills/`，手動維護）

| Skill 名稱 | Canonical 路徑 | 說明 | 觸發情境 |
|------------|----------------|------|---------|
| `openspec-conductor` | `.github/copilot/skills/openspec-conductor.md` | 協調 Change 完整生命週期（New→Archive） | `OpenSpec Executor`、`Review Gate` |
| `code-reviewer` | `.github/copilot/skills/code-reviewer.md` | Code review（安全、可讀性、一致性） | `#code-review`、commit 前 |
| `smoke-tester` | `.github/copilot/skills/smoke-tester.md` | 冒煙測試，驗證基本功能不壞 | `#smoke-test`、每次 change 收尾 |
| `git-steward` | `.github/copilot/skills/git-steward.md` | 正規 commit + push 流程 | `#commit-push` |
| `ui-designer` | `.github/copilot/skills/ui-designer.md` | UI 審查，產出 ui-review.md | `#ui-review`（僅 UI 類 change） |
| `ux-fullstack-engineer` | `.github/copilot/skills/ux-fullstack-engineer.md` | UX 流程審查，產出 ux-review.md | `#ux-review`（僅 UI 類 change） |
| `debug-sheriff` | `.github/copilot/skills/debug-sheriff.md` | Bug 診斷與修復流程 | bug 修復任務 |
| `scribe` | `.github/copilot/skills/scribe.md` | Session 收尾，產出 experience slides | `#session-close` |
| `deploy-conductor` | `.github/copilot/skills/deploy-conductor.md` | 布版完整生命週期（Prepare→Execute→Verify） | `#deploy-prepare`、`#deploy-execute`、`#deploy-verify` |
| `upgrade-advisor` | `.github/copilot/skills/upgrade-advisor.md` | 目標專案升級顧問（版本差異 + 升級計畫） | `#template-upgrade`（在目標專案中使用） |

### 各平台存取方式

- **Copilot**：自動掃描 `.github/copilot/skills/` 與 `.github/skills/`，無需額外設定
- **Claude Code**：掃描 `.claude/skills/<name>/SKILL.md`（薄引用，指向上方 canonical 路徑）
- **Gemini CLI**：透過 `GEMINI.md` 的 `@file.md` import 語法載入所需 skill
- **Codex**：啟動時讀取 `CODEX.md`，依其中路徑清單以 `read_file` 工具讀取所需 skill / rule / agent；per-change 提示詞見 `docs/agents/codex-prompts/`
