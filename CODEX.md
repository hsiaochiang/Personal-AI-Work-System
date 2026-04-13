# Codex CLI 專案上下文

> 本檔案請在每次新 Codex session 啟動時手動貼入，或設定為 workspace instructions。所有共通規則以 AGENTS.md 為準。

## 必讀入口

請先讀取：`AGENTS.md`

## 角色規格書（Role Specs）

> 以下為三角色規格書路徑。**這些是角色定義文件（role specs），不是原生 Codex agent。**
> 請用 `read_file` 工具讀取，再依角色行動，不要期望有 `@planner` 等原生語法。

- `.github/agents/WOS.agent.md` — 專案狀態導航
- `.github/agents/openspec-planner.agent.md` — Change 規劃
- `.github/agents/openspec-executor.agent.md` — Change 執行
- `.github/agents/review-gate.agent.md` — 最終把關

## 技能路徑（需要時用 read_file 讀取）

### 流程協調
- `.github/copilot/skills/openspec-conductor.md`

### 常用工作技能
- `.github/copilot/skills/code-reviewer.md`
- `.github/copilot/skills/smoke-tester.md`
- `.github/copilot/skills/git-steward.md`
- `.github/copilot/skills/debug-sheriff.md`
- `.github/copilot/skills/ui-designer.md`
- `.github/copilot/skills/ux-fullstack-engineer.md`
- `.github/copilot/skills/scribe.md`
- `.github/copilot/skills/knowledge-extractor.md`

### Repo-native Skills
- `.agents/skills/knowledge-extractor/SKILL.md`

### OpenSpec Workflow Skills
- `.github/skills/openspec-propose/SKILL.md`
- `.github/skills/openspec-explore/SKILL.md`
- `.github/skills/openspec-apply-change/SKILL.md`
- `.github/skills/openspec-archive-change/SKILL.md`

## 常用 Rules（需要時用 read_file 讀取）

- `.github/copilot/rules/70-openspec-workflow.md` — Change Lifecycle
- `.github/copilot/rules/35-quality-gate.md` — Done Gate 條件
- `.github/copilot/rules/36-scope-guard.md` — Smallest Safe Change
- `.github/copilot/rules/40-roadmap-governance.md` — Roadmap 治理

## Codex CLI 使用定位

- **三角色輪替模式**：Planner → Executor → Review Gate
- 角色切換時開新 session，不要 resume（避免上下文污染）
- 每個角色用獨立 session；同角色的續接用 `codex resume --last -C <repo-path>`
- per-change 提示詞已備好在：`docs/agents/codex-prompts/v{N}/`（確認 brief 後由 `#codex-prompts-generate` 生成）
- 詳細啟動流程：`docs/agents/codex-cli-init.md`
