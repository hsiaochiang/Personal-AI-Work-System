---
agent: agent
description: "確認 v{N}-brief.md 後，為每個 Change 生成 Codex 三角色提示詞 MD 檔案"
---
請依照以下步驟，為當前版本的每個 Change 生成 Codex 三角色提示詞 MD 檔案。

## 步驟

1. **確認版本號**：讀取 `docs/roadmap.md`，確認當前版本號 N（例如 3 → 使用 `v3`）
2. **讀取版本 brief**：讀取 `docs/planning/v{N}-brief.md`，找出「預計拆分的 Changes」表格中的所有 change 名稱
3. **確認 brief 狀態**：若 brief 尚未由使用者確認（確認日期欄位為空），停下回報，不繼續生成
4. **建立輸出目錄**：`docs/agents/codex-prompts/v{N}/`（不存在則建立）
5. **為每個 Change 生成三個檔案**（若已存在則跳過，除非使用者明確要求覆寫）

---

## 每個 Change 的三個檔案格式

### `docs/agents/codex-prompts/v{N}/<change-name>-planner.md`

```markdown
# Codex Planner — <change-name>

> 本檔案為 v{N} brief 確認後自動生成。在 Codex 新 session 中貼入以啟動 Planner 角色。

Read CODEX.md first.
Then read docs/handoff/current-task.md, docs/handoff/blockers.md,
docs/roadmap.md, docs/system-manual.md, docs/agents/project-context.md,
and docs/agents/commands.md.
Read docs/planning/v{N}-brief.md.
Then read .github/agents/openspec-planner.agent.md and use it as the role spec.

Act only as OpenSpec Planner.
Enforce brief confirmation and scope gate.
Do not implement code.
Use the exact fixed output format from the planner spec.

Change:
<change-name>
```

### `docs/agents/codex-prompts/v{N}/<change-name>-executor.md`

```markdown
# Codex Executor — <change-name>

> 本檔案為 v{N} brief 確認後自動生成。Planner 確認後，開新 Codex session 並貼入以啟動 Executor 角色。

Read CODEX.md first.
Then read docs/handoff/current-task.md, docs/handoff/blockers.md,
docs/roadmap.md, docs/system-manual.md, docs/agents/project-context.md,
and docs/agents/commands.md.
Read docs/planning/v{N}-brief.md.
Then read .github/agents/openspec-executor.agent.md and use it as the role spec.

Act only as OpenSpec Executor.
Follow the change lifecycle: new → ff → apply → verify.
Pause on blockers. Do not skip gates.
Report progress per phase.

Change:
<change-name>
```

### `docs/agents/codex-prompts/v{N}/<change-name>-review.md`

```markdown
# Codex Review Gate — <change-name>

> 本檔案為 v{N} brief 確認後自動生成。Executor 完成後，開新 Codex session 並貼入以啟動 Review Gate 角色。

Read CODEX.md first.
Then read docs/handoff/current-task.md, docs/handoff/blockers.md,
docs/roadmap.md, docs/system-manual.md, docs/agents/project-context.md,
and docs/agents/commands.md.
Read docs/planning/v{N}-brief.md.
Then read .github/agents/review-gate.agent.md and use it as the role spec.

Act only as Review Gate.
Review evidence, give explicit gate decision (PASS / CONDITIONAL PASS / FAIL).
Separate blocking vs non-blocking issues.
If PASS, proceed with commit-push.

Change:
<change-name>
```

---

## 完成後回報

生成完成後，列出：
- 版本號（v{N}）
- 生成的檔案清單（共 N×3 個）
- 輸出目錄：`docs/agents/codex-prompts/v{N}/`
- 後續使用方式：開 Codex 新 session 時，直接貼入對應角色的提示詞檔案內容
