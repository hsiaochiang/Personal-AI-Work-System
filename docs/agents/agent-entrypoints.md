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
- **Skill 存取**：自動掃描 `.github/copilot/skills/`（共享技能）與 `.github/skills/`（OpenSpec CLI 技能），無需額外設定

## Codex
- 入口檔：`CODEX.md`（列出所有 skill / rule / agent 完整路徑清單）
- 若使用 repo instructions、workspace prompt、custom task prompt，直接引用 `CODEX.md` 即可
- **三角色輪替模式**：Planner → Executor → Review Gate，每個角色一個獨立 session
- **Skill 存取**：讀取 `CODEX.md`，依其中清單以 `read_file` 工具讀取對應 skill 路徑
- **角色規格書**：`.github/agents/*.agent.md` 為角色規格書（非原生 agent），搭配 `read_file` 讀取後依角色行動
- **Per-change 提示詞**：`docs/agents/codex-prompts/v{N}/`（brief 確認後由 `#codex-prompts-generate` 一鍵生成）
- 詳細啟動流程：`docs/agents/codex-cli-init.md`

## Gemini Code Assist（IDE Plugin）
- 若使用 workspace context、starter prompt、pinned prompt，建議內容只有：
    1. 先讀 `AGENTS.md`
    2. 長期證據看 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/`
    3. 短期交接看 `docs/handoff/`
- Gemini 專屬入口只補充平台限制，例如回覆長度、偏好的工作模式、是否可自行執行命令
- 注意：IDE Plugin 版本的 Gemini **無法**主動執行終端命令，smoke test / verify 需人工執行後回傳結果
- **Skill 存取**：不支援原生 skill 掃描。請透過 `AGENTS.md` 的「共享 Skill 清單」了解路徑後手動讀取

## Gemini CLI（終端機）
- 已確認能力（2026-03-30）：
    - ✅ 可主動執行 Shell 命令（如 `python deploy/bootstrap.py --verify-only`）
    - ✅ 可完整擷取 stdout / stderr / exit code 並據以決定下一步
    - ✅ 可直接讀取 / 修改本機檔案（`read_file`、`write_file`、`replace`）
    - ✅ 可多步驟連續執行，不需人工在每步介入
- 執行模式：
    - **預設（逐步確認）**：每個改變系統狀態的步驟暫停等待 `y` 確認，建議第一次跑新 change 時使用
    - **自動模式**：啟動時加 `--allow-all-tools --allow-all-paths`，適合熟悉流程後全自動跑完整個 change
- 定位：**開發執行端**。Copilot 完成規劃（brief 確認）後，由 Gemini CLI 接手 opsx-new 起的所有步驟
- **Skill 存取**：透過根目錄 `GEMINI.md` 的 `@file.md` import 語法自動載入。`GEMINI.md` 已 import AGENTS.md 與常用 skill，無需手動引用
- 啟動 prompt（Copilot 移交後，Gemini CLI 開工時使用）：

```
請讀取 docs/agents/gemini-cli-init.md 並依照其中的指示執行。
```

> 完整初始化步驟與執行流程詳見 `docs/agents/gemini-cli-init.md`

## What Not To Do
- 不要為 Copilot / Codex / Gemini 各維護一整套不同規範
- 不要把共享規則只寫在某單一平台入口
- 不要把 handoff 內容寫成平台綁定語法
