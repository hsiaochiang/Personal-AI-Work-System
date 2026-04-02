# Gemini CLI 專案上下文

> 本檔案由 Gemini CLI 在啟動時自動載入。所有共通規則以 AGENTS.md 為準。

## 共通入口

@AGENTS.md

## 流程協調技能

@.github/copilot/skills/openspec-conductor.md

## 常用工作技能（按需引用）

@.github/copilot/skills/code-reviewer.md
@.github/copilot/skills/smoke-tester.md
@.github/copilot/skills/git-steward.md

## OpenSpec Workflow Skills

@.github/skills/openspec-propose/SKILL.md
@.github/skills/openspec-explore/SKILL.md
@.github/skills/openspec-apply-change/SKILL.md
@.github/skills/openspec-archive-change/SKILL.md

## 開發執行提醒

- 定位：開發執行端。Copilot 完成規劃並確認 brief 後，由 Gemini CLI 接手 opsx-new 起的所有步驟。
- 啟動時先讀 `docs/handoff/current-task.md` 了解目前任務狀態。
- 詳細啟動流程見 `docs/agents/gemini-cli-init.md`。
