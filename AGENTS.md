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
- Codex：若使用自訂 prompt / instructions，內容應只引用本檔與 `docs/agents/*`
- Gemini Code Assist：若使用 workspace prompt 或 chat starter，內容也應只做導讀，不重複維護第二套規範
- 原則：共通規則只維護一份，平台專屬入口只做轉接
