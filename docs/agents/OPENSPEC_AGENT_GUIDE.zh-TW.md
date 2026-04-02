# OpenSpec 3-Agent Guide（正體中文）

本文件整合 OpenSpec Planner、OpenSpec Executor、Review Gate 的導入方式、標準 prompt、流程遷移表與團隊 SOP。

適用對象：
- 要把既有 OpenSpec 指令流改成 agent-driven workflow 的團隊
- 想把原本 11 個以上的手動步驟，壓縮成 3 次主要互動的使用者

---

## 1. 快速開始

建議使用順序：
1. `OpenSpec Planner`：整理 change 定義
2. `OpenSpec Executor`：代理執行主要 lifecycle
3. `Review Gate`：收尾前做最終把關

如果只想確認目前狀態，而不是直接執行，請先使用 `@WOS`。

---

## 2. 標準 Prompt 範本

### 2.1 給 OpenSpec Planner

```text
我要開始一個新的 OpenSpec change。

需求背景：
<貼需求背景>

目標：
<貼本次要達成的目標>

限制：
<貼技術、時程、範圍限制>

請不要寫程式，也不要直接開始執行 OpenSpec。
請先幫我整理成可交給 OpenSpec Executor 的版本，固定輸出：
1. 建議 change name
2. Scope
3. Non-scope
4. Acceptance Criteria
5. 主要風險
6. 建議交棒內容
```

### 2.2 給 OpenSpec Executor

```text
請根據以下已確認的 change 定義，代理執行本次 OpenSpec change lifecycle。

【change 定義】
change name:
<貼 Planner 產出的 change name>

scope:
<貼 Planner 產出的 scope>

non-scope:
<貼 Planner 產出的 non-scope>

acceptance criteria:
<貼 Planner 產出的 acceptance criteria>

主要風險:
<貼 Planner 產出的主要風險>

【你的任務】
請依序執行以下流程，遇到 blocking issue 停下並回報；若無 blocking issue，請直接繼續：
1. /opsx-new "<change-name>"
2. /opsx-ff
3. openspec validate "<change-name>" --strict
4. 審查 proposal、specs、design、tasks 與 validate 結果，判斷是否可進 apply
5. /opsx-apply "<change-name>"
6. /opsx-verify "<change-name>"
7. /ui-review
8. /ux-review
9. /status
10. 若可行，/commit-push
11. 若可行，/opsx-sync
12. 若可行，/opsx-archive "<change-name>"

【執行要求】
- 嚴格依 scope 執行，不可擴大需求
- 每個階段都要簡短回報：當前階段、執行摘要、blocking issues、non-blocking issues、下一步
- 只有在資訊不足、出現 blocking issue、或需要人工決策時才暫停
```

### 2.3 給 Review Gate

```text
請對本次 OpenSpec change 做最終 Gate Review。

請根據以下 Executor 執行結果進行審查：
<貼 Executor 最後輸出的摘要或整段紀錄>

請固定輸出：
1. Change 狀態摘要
2. Blocking Issues
3. Non-blocking Issues
4. Accepted Risks
5. Gate Decision
   - 是否建議 commit
   - 是否建議 /opsx-sync
   - 是否建議 /opsx-archive
6. Closing Summary
```

### 2.4 最小互動版

```text
OpenSpec Planner，請把以下需求整理成可交給 Executor 的 change 定義。
<貼需求>
```

```text
OpenSpec Executor，請根據目前對話裡已確認的 change 定義往下執行，直到遇到 blocking issue、資訊不足或需要人工確認時再停下。
```

```text
Review Gate，請根據目前對話中 Executor 的最後結果，判斷是否建議 commit、sync、archive，並列出 blocking issues。
```

---

## 3. 舊流程遷移表

| 舊操作 | 原本用途 | 新流程歸屬 | 新作法 |
|---|---|---|---|
| `#session-start` | 開工、讀規範、初始化 runlog | WOS / 手動保留 | 需要開工檢查時仍可先用 `@WOS` 或 `#session-start` |
| `#opsx-new` | 建立 change | Executor 內部 | 由 Planner 先產生 change 定義，再交給 Executor 自動執行 |
| `#opsx-ff` | 補齊 artifacts | Executor 內部 | 不再單獨觸發，交給 Executor 接續 |
| `#opsx-validate` | 嚴格驗證 change | Executor 內部 | 由 Executor 自動執行並檢查 blocking issues |
| `#opsx-apply` | 實作 tasks | Executor 內部 | 由 Executor 在 validate 通過後接續 |
| `#opsx-verify` | 驗證實作結果 | Executor 內部 | 由 Executor 內部執行 |
| `#ui-review` | UI 審查 | Executor 內部 | 涉及 UI 時由 Executor 自動帶入 |
| `#ux-review` | UX 審查 | Executor 內部 | 涉及 UX 時由 Executor 自動帶入 |
| `#status` | 更新 roadmap / runlog | Executor 內部 | 不再手動插入，交給 Executor 維護 |
| `#commit-push` | commit / push | Executor + 人工確認 | Executor 先整理結果，是否執行仍需人工確認 |
| `#opsx-sync` | 同步 specs | Executor + Gate | 通常在 Gate 判斷可收尾後再執行 |
| `#opsx-archive` | 歸檔 change | Executor + Gate | Gate 建議可 archive 後再進行 |

舊方式：
1. 自己整理需求
2. 自己下多個 `#opsx-*` 指令
3. 自己決定何時該停

新方式：
1. `OpenSpec Planner`：整理 change 定義
2. `OpenSpec Executor`：代理跑大部分 lifecycle
3. `Review Gate`：判斷是否可 commit / sync / archive

---

## 4. 團隊導入 SOP

### 4.1 角色定義

- `@WOS`：流程導航，不直接執行主要實作
- `OpenSpec Planner`：前置規劃，負責收斂需求與產出 change 定義
- `OpenSpec Executor`：執行代理，負責自動串接主要 lifecycle
- `Review Gate`：最終把關，負責判斷是否可 commit、sync、archive

### 4.2 標準流程

1. 先用 `@WOS` 或 `#session-start` 確認專案狀態
2. 使用 Planner 整理需求
3. 由功能負責人或 Tech Lead 確認 change 定義
4. 交給 Executor 執行 new / ff / validate / apply / verify / review / status
5. 將結果交給 Review Gate
6. commit、push、archive 前由人做最終確認

### 4.3 何時必須人工介入

1. 需求本身不清楚
2. Planner 無法穩定收斂 scope
3. strict validate 失敗且修正方向不唯一
4. apply 後結果與 acceptance criteria 有落差
5. review 顯示仍有高風險問題
6. 涉及架構調整、重大 dependency、資料遷移、安全性議題
7. 準備執行 commit、push、archive 等不可逆操作

### 4.4 什麼時候用手動 prompt

- 只想重跑單一環節，例如 `#ui-review`
- 想針對某個卡點做精細觀察
- 只想補一份缺漏證據，不想讓 Executor 往下串接

### 4.5 導入成功指標

- 成員是否不再頻繁詢問下一步該做什麼
- 是否明顯減少漏掉 validate、verify、review 的情況
- commit / archive 前的阻塞問題是否更早被發現
- 單一 change 的操作次數是否從 11+ 次下降到 3 次主要互動

---

## 5. 跨平台分工模式（Copilot 規劃 → Gemini CLI 執行）

### 5.1 分工定義

| 階段 | 負責平台 | 產出 |
|------|---------|------|
| 規劃（roadmap + brief） | GitHub Copilot | `docs/roadmap.md`、`docs/planning/v{N}-brief.md`（含完整 spec + AC） |
| 使用者確認 | **人工（必須）** | brief 的「使用者確認」區段填寫完成 |
| Change 執行（opsx-new 起） | Gemini CLI | `openspec/changes/<name>/`、程式碼變更、commit |

**重要**：Copilot 的規劃邊界到 brief 確認為止，**不**執行 opsx-new / opsx-ff。這些步驟全部移交 Gemini CLI。

### 5.2 移交前 Checklist（Copilot 完成規劃後確認）

| 確認項 | 負責 |
|--------|------|
| `docs/planning/v{N}-brief.md` 使用者確認區段已填（確認日期不為空） | 使用者（人工） |
| Brief 的每個 change 都有明確的 scope + acceptance criteria | Copilot |
| `docs/handoff/current-task.md` 的 Next Step 已指向「Gemini CLI 執行 Change X」 | Copilot |
| `docs/roadmap.md` 目前階段標示正確 | Copilot |
| `docs/system-manual.md` 已同步記錄本輪規劃影響（含 `No user-facing change` 或具體影響） | Copilot |

### 5.3 Gemini CLI 啟動 Prompt（移交後使用）

> **背景說明**：Gemini CLI 不會自動讀取任何設定檔（不同於 VS Code Copilot 的自動載入機制）。
> 完整初始化步驟（含必讀規則清單與三段執行流程）已落地為 `docs/agents/gemini-cli-init.md`。

給 Gemini CLI 的第一句 prompt：

```text
請讀取 docs/agents/gemini-cli-init.md 並依照其中的指示執行。
```

### 5.4 Gemini CLI 執行模式選擇

| 模式 | 啟動方式 | 建議情境 |
|------|---------|---------|
| 預設（逐步確認） | 直接啟動 `gemini` | 第一次跑新 change、高風險操作 |
| 自動模式 | 加 `--allow-all-tools --allow-all-paths` | 熟悉流程後，讓 CLI 一次跑完整個 change |

### 5.5 常態化說明

此分工不需要臨時交接，可成為常態：
- **Copilot** 是規劃端，每次規劃結束時更新 `current-task.md`（AGENTS.md 定義的強制事件）
- **Gemini CLI** 是執行端，每次接手時讀 `AGENTS.md` → `handoff` → `brief` 即可定位
- 兩端共享同一份 `docs/` 文件，不需要額外的人工協調
