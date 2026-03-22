# Agent Entrypoints

> 本檔定義各平台應如何做薄入口。重點不是複製規範，而是把不同 agent 導到同一套共享文件。

## Shared Principle
- 入口檔只做導讀，不重複整份規範
- 共享規則來源：`AGENTS.md`、`docs/agents/`、`docs/handoff/`
- 若平台支援常駐 instructions，優先要求先讀共享文件，再補平台專屬限制

## Copilot
- 使用 `.github/copilot-instructions.md` 作為常駐入口
- 內容重點：先讀 `AGENTS.md`，再依任務需要讀 `.github/copilot/rules/` 與 `.github/copilot/skills/`
- Copilot 專屬內容應限於：語言、輸出格式、工具使用方式、Copilot agents / prompts 的導引

## Codex
- 若使用 repo instructions、workspace prompt、custom task prompt，建議內容只有：
    1. 先讀 `AGENTS.md`
    2. 任務開始或切換前同步 `docs/handoff/`
    3. 命令以 `docs/agents/commands.md` 為準
- 不要在 Codex 專屬入口重寫完整流程規範

## Gemini Code Assist
- 若使用 workspace context、starter prompt、pinned prompt，建議內容只有：
    1. 先讀 `AGENTS.md`
    2. 長期證據看 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/`
    3. 短期交接看 `docs/handoff/`
- Gemini 專屬入口只補充平台限制，例如回覆長度、偏好的工作模式、是否可自行執行命令

## What Not To Do
- 不要為 Copilot / Codex / Gemini 各維護一整套不同規範
- 不要把共享規則只寫在某單一平台入口
- 不要把 handoff 內容寫成平台綁定語法
