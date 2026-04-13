# For Agents — Agent 文件入口

> 給 AI agent（Copilot / Codex CLI / Gemini）讀的文件目錄。
> 使用者不需要進來這裡——請看 [for-me/README.md](../for-me/README.md)。

---

## 初始化讀取順序（每次新 session 必做）

依 `AGENTS.md` 規定，按序讀取：

1. `AGENTS.md`
2. `docs/handoff/current-task.md`
3. `docs/handoff/blockers.md`
4. `docs/roadmap.md`（確認版本號 N）
5. `docs/planning/v{N}-brief.md`
6. `docs/system-manual.md`
7. `docs/agents/project-context.md`
8. `docs/agents/commands.md`
9. `docs/agents/agent-entrypoints.md`

---

## Agent 規格書（.github/agents/）

| Agent | 路徑 | 角色 | 觸發方式 |
|-------|------|------|---------|
| **WOS** | `.github/agents/WOS.agent.md` | 專案快速上手中樞 | `/WOS`、`#session-start` |
| **OpenSpec Planner** | `.github/agents/openspec-planner.agent.md` | 規劃角色 | Codex CLI Plan session |
| **OpenSpec Executor** | `.github/agents/openspec-executor.agent.md` | 執行角色 | Codex CLI Execute session |
| **Review Gate** | `.github/agents/review-gate.agent.md` | 收尾審查角色 | Codex CLI Review session |
| **Knowledge Curator** | `.github/agents/knowledge-curator.agent.md` | 個人知識庫維護 | 貼入文章/連結 |

---

## Per-Change 提示詞（docs/agents/codex-prompts/）

| 版本 | 路徑 | 狀態 |
|------|------|------|
| V5（參考用） | `docs/agents/codex-prompts/v5/` | ✅ 已完成（4 changes × 3 prompts = 12 個） |
| V6（待產出） | `docs/agents/codex-prompts/v6/` | ⚠️ 待 `#codex-prompts-generate` |
| V3/V4（已封存） | `docs/_archive/codex-prompts-v3/` `docs/_archive/codex-prompts-v4/` | 🗃️ 已封存 |

---

## 完整 Agent/Skill/Rule 索引

見 [`docs/AGENTS-INDEX.md`](../AGENTS-INDEX.md)

---

## 重要規則與技術文件

| 文件 | 路徑 | 說明 |
|------|------|------|
| 技術栈 | `.github/copilot/rules/50-tech-stack.md` | Node.js, 版本, 依賴等 |
| OpenSpec 工作流 | `.github/copilot/rules/70-openspec-workflow.md` | Change lifecycle |
| 品質門檻 | `.github/copilot/rules/35-quality-gate.md` | Done 的定義 |
| Scope 護欄 | `.github/copilot/rules/36-scope-guard.md` | 防止過度展開 |
| 測試規範 | `.github/copilot/rules/60-testing.md` | Smoke test 標準 |
| Roadmap 治理 | `.github/copilot/rules/40-roadmap-governance.md` | Version Brief 規則 |

---

## Codex CLI 初始化

完整流程見 `docs/agents/codex-cli-init.md`

啟動命令：
```
codex --yolo -C D:\program\Personal-AI-Work-System
```
