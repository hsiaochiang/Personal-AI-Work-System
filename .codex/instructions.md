# Codex Instructions (GitHub Copilot Coding agent)

> **本檔案由 GitHub Copilot Coding agent 自動讀取**（VS Code agent mode）。
> OpenAI Codex CLI 使用者：可靠自動入口為 `AGENTS.md`，本檔案不在 Codex CLI 的 discovery chain 中。

## Startup Sequence

1. Read `AGENTS.md` (shared agent conventions, skill list, collaboration model)
2. Read `docs/handoff/current-task.md` (what's in progress, next steps)
3. Read `docs/handoff/blockers.md` (any known blockers)
4. Use `docs/agents/commands.md` for all CLI commands (setup, test, lint, smoke)
5. Use `docs/agents/project-context.md`, `docs/roadmap.md`, `docs/decision-log.md` for project background

## Skills

OpenSpec workflow skills canonical 位置在 `.github/skills/`：
- `.github/skills/openspec-propose/SKILL.md` — propose a new change (`#opsx-new`)
- `.github/skills/openspec-apply-change/SKILL.md` — implement tasks (`#opsx-apply`)
- `.github/skills/openspec-archive-change/SKILL.md` — archive completed change (`#opsx-archive`)
- `.github/skills/openspec-explore/SKILL.md` — explore/clarify requirements (`#opsx-explore`)

`.codex/skills/` 為本地副本（內容相同），canonical source 以 `.github/skills/` 為準。
Shared skills (code review, git, smoke): `.github/copilot/skills/`

## Handoff Update Policy

Update `docs/handoff/current-task.md` ONLY on:
- New task starts
- A subtask is completed
- A new blocker is discovered
- Switching to another agent
- Session close

Do NOT update handoff on every prompt.

## Hard Limits (require human approval before proceeding)

- Scope changes or non-scope additions
- Architecture rewrites or new major abstractions
- Adding or upgrading major dependencies
- Any merge, release, archive, or other irreversible action

## Tech Stack (do not deviate without approval)

- Runtime: Node.js >= 18, pure `http` module (no Express)
- Frontend: plain HTML + vanilla JS (no framework, no build tool, no bundler)
- CSS: plain CSS only (no preprocessors)
- Storage: Markdown files under `docs/memory/` and `docs/workflows/`
- FORBIDDEN: React, Vue, Svelte, Vite, webpack, any database or ORM

## Project Layout

- App entry: `web/server.js` -> http://localhost:3000
- Memory: `docs/memory/`
- Workflows: `docs/workflows/`
- Changes: `openspec/changes/<change-name>/`
- Planning: `docs/planning/v3-brief.md` (V3 active), `docs/planning/v4-brief.md` (V4 draft)
