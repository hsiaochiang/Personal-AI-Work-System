# Template Files

> 這份清單用來回答：哪些檔案屬於模板、哪些檔案可以由專案自己維護。

## How To Read This File
- Managed files：由模板擁有；下次 upgrade 會被模板最新版覆蓋。若要改，應優先回到 template repo 修。
- Protected files：由模板建立骨架，但內容屬於專案；upgrade 預設不覆蓋。可填寫內容，但不要任意刪掉模板欄位。
- Init-only files：只在第一次 init 時建立骨架；後續 upgrade 與 template lock 不追蹤。
- Project-owned files：模板不追蹤；完全由專案自行維護。

## Safe Upgrade
- 升級前先跑 `bootstrap_copilot_workspace.py --upgrade-preview --root <target>`。
- 若想查分類，可跑 `bootstrap_copilot_workspace.py --list-managed --root <target>`。
- 若發現需要修改 managed files，應優先回饋上游模板，而不是只在下游專案修改。

## Managed Files (60)
- .claude/skills/openspec-apply-change/SKILL.md
- .claude/skills/openspec-archive-change/SKILL.md
- .claude/skills/openspec-explore/SKILL.md
- .claude/skills/openspec-propose/SKILL.md
- .github/agents/WOS.agent.md
- .github/agents/openspec-executor.agent.md
- .github/agents/openspec-planner.agent.md
- .github/agents/review-gate.agent.md
- .github/copilot-instructions.md
- .github/copilot/prompts/code-review.prompt.md
- .github/copilot/prompts/commit-push.prompt.md
- .github/copilot/prompts/log-decision.prompt.md
- .github/copilot/prompts/opsx-apply.prompt.md
- .github/copilot/prompts/opsx-archive.prompt.md
- .github/copilot/prompts/opsx-explore.prompt.md
- .github/copilot/prompts/opsx-ff.prompt.md
- .github/copilot/prompts/opsx-new.prompt.md
- .github/copilot/prompts/opsx-sync.prompt.md
- .github/copilot/prompts/opsx-validate.prompt.md
- .github/copilot/prompts/opsx-verify.prompt.md
- .github/copilot/prompts/session-close.prompt.md
- .github/copilot/prompts/session-start.prompt.md
- .github/copilot/prompts/smoke-test.prompt.md
- .github/copilot/prompts/status.prompt.md
- .github/copilot/prompts/ui-review.prompt.md
- .github/copilot/prompts/ux-review.prompt.md
- .github/copilot/rules/10-style-guide.md
- .github/copilot/rules/20-ux-flow.md
- .github/copilot/rules/30-debug-contract.md
- .github/copilot/rules/35-quality-gate.md
- .github/copilot/rules/36-scope-guard.md
- .github/copilot/rules/40-roadmap-governance.md
- .github/copilot/rules/70-openspec-workflow.md
- .github/copilot/rules/80-template-boundary.md
- .github/copilot/rules/85-agent-skill-authoring.md
- .github/copilot/skills/code-reviewer.md
- .github/copilot/skills/debug-sheriff.md
- .github/copilot/skills/git-steward.md
- .github/copilot/skills/openspec-conductor.md
- .github/copilot/skills/scribe.md
- .github/copilot/skills/smoke-tester.md
- .github/copilot/skills/ui-designer.md
- .github/copilot/skills/ux-fullstack-engineer.md
- .github/prompts/openspec-execute.prompt.md
- AGENTS.md
- GEMINI.md
- TEMPLATE-FILES.md
- docs/agents/OPENSPEC_AGENT_GUIDE.zh-TW.md
- docs/agents/agent-entrypoints.md
- docs/agents/gemini-cli-init.md
- docs/agents/platform-onboarding-checklist.md
- docs/agents/platform-setup-guide.md
- docs/agents/platform-snippets.md
- docs/agents/platform-ui-walkthrough.md
- docs/agents/wos-playbook.md
- docs/bugs/README.md
- docs/handoff/README.md
- docs/qa/README.md
- docs/uiux/README.md
- openspec/config.yaml

## Protected Files (9)
- .github/copilot/rules/50-tech-stack.md
- .github/copilot/rules/60-testing.md
- .github/copilot/rules/90-project-custom.md
- docs/agents/commands.md
- docs/agents/project-context.md
- docs/decision-log.md
- docs/release-governance.md
- docs/roadmap.md
- docs/system-manual.md

## Init-Only Files (3)
- docs/handoff/blockers.md
- docs/handoff/current-task.md
- docs/planning/README.md

## Project-Owned Files In Template Set (0)
- 目前模板沒有主動生成 unmanaged 檔案；此區段主要用於偵錯分類。
