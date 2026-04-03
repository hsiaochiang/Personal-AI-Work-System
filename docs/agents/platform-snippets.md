# Platform Snippets

> 可直接貼到不同平台的最小入口文字。原則是短、只做導讀、不重複維護整套規範。

## Copilot Minimal Entrypoint

```text
先讀 AGENTS.md。
若有接手中的任務，再讀 docs/handoff/current-task.md 與 docs/handoff/blockers.md。
命令與驗證方式以 docs/agents/commands.md 為準。
長期背景以 docs/agents/project-context.md、docs/roadmap.md、docs/decision-log.md、docs/runlog/ 為準。
只在這些事件更新 handoff：新任務開始、完成子任務、出現 blocker、切換 agent、session 收尾。
不可自行決定 scope 變更、架構重寫、重大 dependency、merge、release。
```

## Codex Minimal Entrypoint

```text
Read CODEX.md first (it references AGENTS.md and lists all skill / rule / agent paths).
If this is a handoff, read docs/handoff/current-task.md and docs/handoff/blockers.md next.
Use docs/agents/commands.md as the source of truth for setup, test, lint, build, and smoke commands.
Update handoff only on task start, subtask completion, blocker discovery, agent switch, or session close.
Do not silently change scope, rewrite architecture, add major dependencies, or perform irreversible actions without approval.
Per-change prompts: docs/agents/codex-prompts/v{N}/
```

## Gemini Code Assist Minimal Entrypoint

```text
Read AGENTS.md first.
For an in-progress task, read docs/handoff/current-task.md and docs/handoff/blockers.md.
For stable project context, use docs/agents/project-context.md, docs/agents/commands.md, docs/roadmap.md, docs/decision-log.md, and docs/runlog/.
Update handoff only on major task-state changes, not every prompt.
Do not make scope changes, architecture rewrites, major dependency decisions, merge, release, or archive decisions without human approval.
```

## Usage Notes
- 可直接貼到 custom instructions、workspace prompt、starter prompt、pinned prompt 等入口
- 若平台有字數限制，優先保留：先讀 AGENTS、handoff 更新時機、commands 來源、不可自決事項
- 若你已在平台入口寫了語言或輸出格式要求，這裡不需要重複
