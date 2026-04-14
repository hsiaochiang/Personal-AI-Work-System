# START-HERE — PAIS 現況儀表板

> 每次呼叫 `/WOS` 後可要求更新此檔。最後更新：2026-04-13

---

## 現在在哪裡

| 項目 | 狀態 |
|------|------|
| **版本** | V5 完成 ✅ \| V6 Brief：**尚未建立** ⚠️ |
| **模式** | 規劃模式（brief 未建立，不可開始 change） |
| **Active Changes** | `memory-ai-curator`（artifacts 已建，待執行） |
| **待處理** | `llm-extract-gemini`（已開發完成，需 archive） |
| **上次 commit** | 查看 `git log --oneline -3` |

---

## 馬上可做的事

**優先度 1：建立 V6 Brief（規劃模式的入場券）**

直接貼到 Copilot Chat：
```
請草擬 V6 Brief（路徑：docs/planning/v6-brief.md）。
格式參考 docs/planning/v5-brief.md。
版本定位：記憶 AI 策展層（Memory AI Curator）
In Scope：memory-ai-curator change（T-01~T-06）
Non-goals：inline 編輯、跨專案同步、向量搜尋
完成後等待我確認，不要自行繼續。
```

**優先度 2：Archive llm-extract-gemini（清除債務）**

```
llm-extract-gemini change 已開發完成，請執行 #opsx-archive。
```

---

## 文件地圖（按「我想做什麼」）

| 我想做... | 去看這裡 | 用這個 |
|-----------|----------|--------|
| 快速抓回上次狀態 | [current-task.md](handoff/current-task.md) | `/WOS` |
| 找可用的提示詞 | [PROMPTS.md](PROMPTS.md) | — |
| 了解專案進度 | [roadmap.md](roadmap.md) | — |
| 看重要決策 | [decision-log.md](decision-log.md) | — |
| 看當前版本範圍 | [planning/v5-brief.md](planning/v5-brief.md) | — |
| 確認系統功能 | [system-manual.md](system-manual.md) | — |
| 確認操作手冊 | [product/user-manual-v5.md](product/user-manual-v5.md) | — |
| 看未來功能想法 | [product/backlog.md](product/backlog.md) | — |
| 有問題要回報 | [product/inbox/](product/inbox/) | — |
| 找 agent/skill 資訊 | [AGENTS-INDEX.md](AGENTS-INDEX.md) | — |

---

## 最近決策（來自 decision-log.md）

- **2026-04 選用 Gemini 2.5 Flash**：`gemini-2.5-flash`，`maxOutputTokens: 8192`，`responseMimeType: 'application/json'`
- **2026-04 移除 mock-test 專案**：已從 projects.json 移除，temp-mock/ 目錄刪除
- **2026-04 PROD sparse-checkout 加入 /docs/product/**：修正 user-manual 缺失的問題

> 更多決策查看 [decision-log.md](decision-log.md)

---

## 技術基礎

- **DEV**：`D:\program\Personal-AI-Work-System` → PORT 3000
- **PROD**：`D:\prod\Personal-AI-Work-System` → PORT 3001（用 `start-prod.bat`）
- **VERSION**：1.1.10

---

---

## AI 不需要你讀的地方

以下是 AI（Copilot/Codex）自動讀取的檔案，你**不需要進入**：

| 目錄 | 說明 |
|------|------|
| `.github/agents/` | Agent 規格書（WOS、Planner、Executor、Review Gate） |
| `.github/copilot/rules/` | 行為規則（AI 自動套用） |
| `.github/copilot/skills/` | 技能定義（AI 自動觸發） |
| `.github/skills/` | OpenSpec 技能（`/opsx-*` 指令用） |
| `docs/agents/` | Agent 文件、codex-prompts、初始化設定 |
| `docs/memory/` | AI 記憶檔案（由 Extract 頁面寫入） |
| `openspec/` | Change 管理（changes/、specs/） |

如需了解個別 agent/skill 的功能，查看 [AGENTS-INDEX.md](AGENTS-INDEX.md)。

---

*本文件由 WOS 維護。要求更新請輸入 `/WOS 請更新 START-HERE.md`*
