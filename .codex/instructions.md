# Codex Instructions

> This file is auto-read by Codex at session start. Keep it as a thin entrypoint.

## Startup Sequence

1. Read `AGENTS.md` (shared agent conventions, skill list, collaboration model)
2. Read `docs/handoff/current-task.md` (what's in progress, next steps)
3. Read `docs/handoff/blockers.md` (any known blockers)
4. Use `docs/agents/commands.md` for all CLI commands (setup, test, lint, smoke)
5. Use `docs/agents/project-context.md`, `docs/roadmap.md`, `docs/decision-log.md` for project background

## Skills

OpenSpec workflow skills are in `.codex/skills/`:
- `.codex/skills/openspec-propose/SKILL.md` — propose a new change (`#opsx-new`)
- `.codex/skills/openspec-apply-change/SKILL.md` — implement tasks (`#opsx-apply`)
- `.codex/skills/openspec-archive-change/SKILL.md` — archive completed change (`#opsx-archive`)
- `.codex/skills/openspec-explore/SKILL.md` — explore/clarify requirements (`#opsx-explore`)

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
