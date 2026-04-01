# GEMINI.md — Gemini CLI System Prompt

> 本檔案在每次 Gemini CLI 啟動時自動載入。

## 先讀

1. `AGENTS.md`（跨 agent 共用入口）
2. `docs/roadmap.md`（目前版本與進度）
3. `docs/handoff/current-task.md`（當前任務交接）
4. `docs/planning/v{N}-brief.md`（N = 當前版本號）

## 輸出規則

- **語言**：正體中文為主
- **Commit message**：繁體中文（含 What / Why / Impact / Evidence）
- Commit message 前綴：`feat(v{N}):` / `fix:` / `chore:` / `docs:`

## 你擁有的 Commands（直接可用）

以下是已設定且可直接執行的 slash commands：

| 命令 | 用途 |
|------|------|
| `/opsx:propose <name>` | 建立新 change + 產生 proposal / design / tasks |
| `/opsx:apply <name>` | 依照 tasks 執行實作 |
| `/opsx:archive <name>` | 歸檔已完成的 change（含 spec sync 與 archive） |
| `/opsx:explore <topic>` | 進入探索模式，釐清需求 |

**重要**：這些命令會呼叫 `openspec` CLI（已安裝 v1.2.0），不是概念命令。請直接使用，不要自行模擬。

## 你擁有的 Skills

| Skill | 位置 |
|-------|------|
| openspec-apply-change | `.gemini/skills/openspec-apply-change/SKILL.md` |
| openspec-archive-change | `.gemini/skills/openspec-archive-change/SKILL.md` |
| openspec-explore | `.gemini/skills/openspec-explore/SKILL.md` |
| openspec-propose | `.gemini/skills/openspec-propose/SKILL.md` |

## OpenSpec 設定

- Config：`openspec/config.yaml`
- Schema：`spec-driven`
- Changes：`openspec/changes/`
- Archive：`openspec/changes/archive/`
- Main Specs：`openspec/specs/`

## 每個 Change 的標準執行流程

```
/opsx:propose "<change-name>"
    ↓ 確認 proposal + tasks
/opsx:apply "<change-name>"
    ↓ 實作完成
/opsx:archive "<change-name>"
    ↓ 歸檔到 archive/
更新文件（current-task.md、roadmap.md）→ git push
```

## 每個 Change 完成後的強制收尾步驟

> 缺一不可。Copilot 依賴 remote 狀態判斷進度。

1. **`/opsx:archive "<change-name>"`** — 歸檔 change 目錄
2. **更新 `docs/handoff/current-task.md`** — Done + Next Step + Validation Status
3. **更新 `docs/roadmap.md`** — Change 進度表 + 下一步段落 + 已知缺口表
4. **`git add -A && git commit && git push`** — 必須 push 到 origin/main

## 與 Copilot 的協作

- Copilot 負責規劃（brief 確認、scope 定義）
- Gemini CLI 負責執行（propose → apply → archive）
- 交接依據：`docs/handoff/current-task.md`
- 進度真源：`docs/roadmap.md`

## 技術約束

- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js dev server（`web/server.js`）
- 入口：`node web/server.js` → http://localhost:3000
