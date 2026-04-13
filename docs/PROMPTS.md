# PROMPTS.md — 提示詞速查表

> 每個情境一個區塊。找到情境 → 複製提示詞 → 貼到對應 AI → 完成。
> 最後更新：2026-04-13

---

## 索引

| # | 情境 | 平台 | 耗時 |
|---|------|------|------|
| [1](#1-session-start-回來接手) | 回來接手（2 週後回來） | Copilot Chat | 1 分鐘 |
| [2](#2-建立-version-brief) | 建立 Version Brief | Copilot Chat | 5 分鐘確認 |
| [3](#3-產出-codex-cli-提示詞) | Brief 確認後產出 Codex 提示詞 | Copilot Chat | 1 分鐘 |
| [4](#4-codex-plan-session) | Codex Plan Session（規劃 change） | Codex CLI | 10 分鐘 |
| [5](#5-codex-execute-session) | Codex Execute Session（執行 change） | Codex CLI | 自動 |
| [6](#6-codex-review-session) | Codex Review Session（收尾審查） | Codex CLI | 10 分鐘 |
| [7](#7-deploy-部署到-prod) | Deploy 到 PROD | PowerShell | 2 分鐘 |
| [8](#8-bug-fix) | Bug Fix | Copilot Chat | 依情況 |
| [9](#9-ai-解決方案顧問-research-based) | AI 解決方案顧問（Research-Based） | Copilot Chat | 依情況 |
| [10](#10-archive-change) | Archive 已完成的 Change | Copilot Chat | 5 分鐘 |

---

## 1. Session Start 回來接手

**情境**：距離上次開發 1~3 週，不記得做到哪裡了。  
**平台**：Copilot Chat（VS Code）

```
/WOS 我剛回來，請幫我快速上手：
1. 這個專案目前在哪個階段（版本 / change / 任務）？
2. 上次做到哪了、有什麼重要決定要注意？
3. 現在最該做的一件事是什麼？
4. 給我可以直接貼給 Codex CLI 的提示詞。
請同時更新 docs/START-HERE.md 的「現在在哪裡」區塊。
```

---

## 2. 建立 Version Brief

**情境**：上一個版本完成，要開始規劃下一版的 scope。  
**平台**：Copilot Chat（VS Code）  
**前置條件**：上一版 brief 的所有 changes 已 archive

```
請草擬 V[N] Brief（路徑：docs/planning/v[N]-brief.md）。
格式參考 docs/planning/v5-brief.md（含使用者確認欄位）。

版本定位：[填入，例如：記憶 AI 策展層]
In Scope：
- [change 名稱]（[說明]）
- [change 名稱]（[說明]）

Non-goals：
- [不做的事 1]
- [不做的事 2]

完成後等待我確認，**不要自行繼續到下一步**。
```

> 確認 Brief 後，務必填寫「使用者確認日期」欄位，這是解鎖開發模式的門禁。

---

## 3. 產出 Codex CLI 提示詞

**情境**：Version Brief 已確認，需要產出 Codex CLI 三角色提示詞。  
**平台**：Copilot Chat（VS Code）  
**前置條件**：`docs/planning/v[N]-brief.md` 的使用者確認日期已填寫

```
#codex-prompts-generate
V[N] Brief 已確認（確認日期：[填入]）。
請為 brief 中的所有 changes 產出 Codex CLI 三角色提示詞。
目標路徑：docs/agents/codex-prompts/v[N]/
格式參考 docs/agents/codex-prompts/v5/ 下的範例。
完成後列出所有產出的檔名。
```

---

## 4. Codex Plan Session

**情境**：在 Codex CLI 中啟動新 session，進行 change 規劃。  
**平台**：Codex CLI（終端機）  
**方式**：開新 session → 貼入對應的 plan 提示詞檔案內容

```
步驟：
1. 開新 Codex session（不要 resume）：
   codex --yolo -C D:\program\Personal-AI-Work-System

2. 貼入以下路徑的完整檔案內容：
   docs/agents/codex-prompts/v[N]/[序號]-[change-name]-plan.md
   （例如：docs/agents/codex-prompts/v6/01-memory-ai-curator-plan.md）

3. 等待 Planner 輸出規劃結果，確認後才繼續 Execute。
```

---

## 5. Codex Execute Session

**情境**：Plan 已確認，開始執行實作。  
**平台**：Codex CLI（終端機）  
**前置條件**：Plan Session 的規劃已確認

```
步驟：
1. 開新 Codex session（不要接續上一個）：
   codex --yolo -C D:\program\Personal-AI-Work-System

2. 貼入以下路徑的完整檔案內容：
   docs/agents/codex-prompts/v[N]/[序號]-[change-name]-execute.md
   （例如：docs/agents/codex-prompts/v6/02-memory-ai-curator-execute.md）

3. Executor 會自動執行：
   /opsx-new → /opsx-ff → /opsx-apply → /opsx-verify
   遇到 blocker 才停下來。
```

---

## 6. Codex Review Session

**情境**：Execute 完成，進行最終品質把關。  
**平台**：Codex CLI（終端機）

```
步驟：
1. 開新 Codex session：
   codex --yolo -C D:\program\Personal-AI-Work-System

2. 貼入以下路徑的完整檔案內容：
   docs/agents/codex-prompts/v[N]/[序號]-[change-name]-review.md
   （例如：docs/agents/codex-prompts/v6/03-memory-ai-curator-review.md）

3. Review Gate 會輸出：PASS / CONDITIONAL PASS / FAIL
4. PASS → 執行 #commit-push
```

---

## 7. Deploy 部署到 PROD

**情境**：Change 完成並 commit，要部署到正式環境。  
**平台**：PowerShell（終端機）

```powershell
# 步驟 1：確認目前版本號
Get-Content D:\program\Personal-AI-Work-System\VERSION

# 步驟 2：執行部署（替換 1.x.x 為實際版本號）
Set-Location 'D:\program\Personal-AI-Work-System'
.\scripts\deploy-to-prod.ps1 -Version 1.x.x

# 步驟 3：啟動 PROD 伺服器
D:\prod\Personal-AI-Work-System\start-prod.bat

# 步驟 4：驗證
# 開啟瀏覽器，訪問 http://localhost:3001
```

> 若 PROD 已在執行中，先停止：先關閉原本的 terminal 視窗，再執行 start-prod.bat

---

## 8. Bug Fix

**情境**：發現功能異常，需要診斷並修復。  
**平台**：Copilot Chat（VS Code）

```
Bug 描述：[填入，例如：/memory 頁面的 AI 審查按鈕點擊後沒有反應]
觸發條件：[填入，例如：點擊 ✨ AI 品質審查，POST /api/memory/ai-review 無回應]
預期行為：[填入]
實際行為：[填入]

請依 debug-sheriff 流程處理：
1. 先確認根因（讀 server.js + 對應 JS），不要猜
2. 做最小化的 fix，不要重構沒問題的部分
3. 說明驗證方式
4. 完成後產出 docs/bugs/[今天日期]_[slug].md
```

---

## 9. AI 解決方案顧問（Research-Based）

**情境**：遇到架構、設計、或工具選擇問題，需要有根據的建議，不要只是 AI 猜測。  
**平台**：Copilot Chat（VS Code）

```
你是一位 AI 解決方案顧問，對現行 AI 工具都非常擅長。
對於我想要做的事情，你應該搜尋網路上的案例來說明，
找到好的 skill 或先例，讓我相信你不只是提出解法，
而是做過 research 後，針對我的問題的最佳方案。

請你提供 plan 之前：
1. 先說明你的思考框架及解決方法（引經據典、有架構、有邏輯）
2. 讓我能從你解決的過程學習

問題/任務：[填入，越具體越好]
相關背景：[填入，例如：這個專案是 Personal AI Work System，使用 Copilot + Codex CLI]
```

---

## 10. Archive Change

**情境**：Change 已驗證完成，要正式歸檔並更新 brief。  
**平台**：Copilot Chat（VS Code）

```
[change-name] change 已驗證完成。請執行歸檔流程：
1. 確認 smoke test 已通過（docs/qa/ 下有對應 smoke 文件）
2. 確認 design.md 是否有 UI change（若有，確認 ui-review.md 存在）
3. 執行 #opsx-archive 將 change 移到 openspec/changes/archive/
4. 更新 docs/planning/v[N]-brief.md 的 Changes 表，將此 change 狀態改為「已歸檔」
5. 執行 #commit-push

完成後回報歸檔路徑與 commit 訊息。
```

---

## 附錄：角色說明

| 角色 | 何時使用 | 平台 |
|------|---------|------|
| **WOS** | 每次回來、不確定下一步 | Copilot Chat |
| **OpenSpec Planner** | 規劃新 change | Codex CLI (Plan session) |
| **OpenSpec Executor** | 執行 change 的 tasks | Codex CLI (Execute session) |
| **Review Gate** | 收尾前最終把關 | Codex CLI (Review session) |
| **debug-sheriff** | Bug 診斷與修復 | Copilot Chat |
| **AI 解決方案顧問** | 需要 research-based 建議 | Copilot Chat（用情境 #9） |
