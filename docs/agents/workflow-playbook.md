# Workflow Playbook

> 給 6 個月後的自己：這份文件的存在，是因為系統的基礎設施完整，但「第一句話說什麼」不直覺。
> 從這裡開始。不要從其他文件開始。

---

## Part 1：為什麼這個系統存在（先讀這個）

### 核心問題

AI 工具很強，但你在 AI 面前的最大障礙，不是「它不會做」，而是：

1. **Context Loss**：每次重新開一個 session，你要花 10 分鐘解釋「這個專案在哪、上次做到哪、現在要做什麼」
2. **Scope Drift**：AI 容易把「做一件小事」變成「順便改了三個地方」，出了問題很難追
3. **Evidence Gap**：做了什麼、為什麼這樣做、驗證過了沒有——這些沒有文件，6 個月後的自己也不知道

### 這個系統怎麼解

```
WOS（讀狀態） → Planner（定範圍） → Executor（實作） → Review Gate（把關）
     ↑                                                              ↓
     └──────────────── docs/handoff/ 文件作為接力棒 ───────────────┘
```

- **WOS**：你不需要翻 10 份文件。叫 WOS，它幫你讀完再告訴你「現在在哪、下一步是什麼」
- **Planner**：每個 change 在實作之前，先定清楚做什麼、不做什麼、怎麼算完成
- **Executor**：照著 Planner 定的 scope 實作，不擅自擴大，遇到阻塞就停下來
- **Review Gate**：確認品質閘過了、證據文件齊了，才允許 archive

### 最重要的一個原則

> **Smallest Safe Change**：每次只做「最小的、安全的」改動。不是因為懶，是因為改動越小，出了問題越容易追，AI 犯錯的機率越低。

---

## Part 2：導入新專案的完整路徑（7 Steps）

> 剛把這個模板 bootstrap 進新專案後，按這個順序走一遍。

### Step 1：執行 Bootstrap Init

**這一步在做什麼**：把模板的 agents、rules、prompts、文件框架複製到你的目標專案。

**為什麼要這樣做**：不要手動複製。`bootstrap.py` 會追蹤哪些文件是模板管的（managed），哪些是你的專案填的（protected），升級時才不會誤蓋你的內容。

**指令（在 terminal 執行）**：
```bash
python deploy/bootstrap.py --root "D:\YourProject" --init --project-name "YourProjectName"
```

**預期結果**：目標專案多出 `.github/`、`docs/`、`AGENTS.md`、`CODEX.md` 等檔案。

---

### Step 2：填寫 5 個關鍵文件

**這一步在做什麼**：把模板框架填入你的專案真實內容。這是 agent 讀的「原料」，空的文件 = agent 說出廢話。

**為什麼要這樣做**：WOS 和其他 agent 都靠這幾份文件判斷「你的專案是什麼、現在在哪裡」。不填，agent 只能猜。

#### 文件 1：`docs/agents/project-context.md`

說明你的專案為什麼存在。

```
提示詞（貼到 VS Code Chat，請 agent 幫你填）：

請幫我填寫 docs/agents/project-context.md。
我的專案名稱是：[填入專案名稱]
這個專案想解決的問題是：[一段話描述]
主要使用者是：[誰會用這個]
這個專案的邊界是（不會做什麼）：[說出不在範圍內的事]
目前技術棧是：[語言/框架]
```

#### 文件 2：`docs/agents/commands.md`

你的專案怎麼 run、test、build。

```
提示詞：

請幫我填寫 docs/agents/commands.md。
我這個專案的開發啟動命令是：[例如 npm run dev]
測試命令是：[例如 npm test]
建置命令是：[例如 npm run build]
Lint 命令是：[例如 npm run lint]
```

#### 文件 3：`docs/roadmap.md`

你打算做什麼版本、做到哪裡算第一個里程碑。

```
提示詞：

請幫我填寫 docs/roadmap.md 的 V1 版本區塊。
這個版本的目標是：[一句話說清楚]
這個版本完成的標準是：[使用者能做到什麼]
這個版本預計包含的功能/改動是：
1. [功能 A]
2. [功能 B]
3. [功能 C]
```

#### 文件 4：`docs/handoff/current-task.md`

你現在要做的第一件事。

```
提示詞：

請幫我填寫 docs/handoff/current-task.md。
目前任務名稱：[簡短名稱]
我想完成的事：[一段話]
上次做到的地方：[若是新專案就填「尚未開始」]
下一步：[第一件要做的事]
```

#### 文件 5：`docs/handoff/blockers.md`

目前有沒有任何阻塞。新專案通常沒有，但要確認。

```
提示詞：

請幫我填寫 docs/handoff/blockers.md。
目前是否有任何阻塞：[有/無]
若有，說明是什麼：[描述阻塞]
```

---

### Step 3：第一次呼叫 WOS

**這一步在做什麼**：讓 WOS 確認它讀得到你填的文件，並給你一個「你應該做的第一步」。

**為什麼要這樣做**：這是驗收 Step 2 填寫品質的最快方式。WOS 若說「文件過空」，代表你上一步填得不夠，而不是系統有問題。

```
提示詞（貼到 VS Code Chat）：

@WOS 我剛把這個模板初始化到新專案，並填寫了 5 份關鍵文件。
請告訴我：這個專案目前文件的健康度如何？哪份文件最需要補強？
以及，根據現在的狀態，我的下一步是什麼？
```

**預期結果**：WOS 輸出文件健康度 + 建議補強的文件 + 下一步建議（通常是「去確認 Version Brief」）。

---

### Step 4：確認 Version Brief

**這一步在做什麼**：讓 Planner 幫你把 V1 的 scope 寫成正式 brief，然後你確認。

**為什麼要這樣做**：Brief 確認後，Planner 才會開 change。這個機制防止你在「還沒想清楚要做什麼」的情況下就開始 AI 幫你寫程式。

```
提示詞：

OpenSpec Planner，請根據 docs/roadmap.md 和 docs/handoff/current-task.md，
為 V1 建立一份 Version Brief，包含：
- 版本目標（一句話）
- 這個版本包含的 changes 清單（3-5 個）
- 這個版本不包含什麼
- 每個 change 的完成標準

建立好後，請在 brief 裡留一個「使用者確認」欄位，等我確認 scope 後再開始任何 change。
```

**預期結果**：在 `docs/planning/v1-brief.md` 出現一份 brief。你讀完後，在「使用者確認」欄位填入今天日期，表示你接受這個 scope。

---

### Step 5：啟動第一個 Change

**這一步在做什麼**：選一個 brief 裡的 change，讓 Planner 幫你把它的 scope 定清楚。

**為什麼要這樣做**：Planner 會問你「這個 change 不應該包含什麼」。這個問題很重要——它強迫你主動劃出邊界，而不是事後爭論 AI 是否「做太多」。

```
提示詞：

OpenSpec Planner，我要開始 V1 的第一個 change：[change 名稱]。
請先讀 docs/planning/v1-brief.md，確認 brief 已確認。
然後問我這個 change 的 scope 邊界：
  1. 這個 change 應該包含什麼？
  2. 這個 change 明確不包含什麼？
  3. 完成的標準是什麼？（如何驗證「做完了」？）
```

**預期結果**：Planner 輸出 change 的正式 proposal，放在 `openspec/changes/[change-name]/proposal.md`。

---

### Step 6：執行第一個 Change

**這一步在做什麼**：讓 Executor 根據 Planner 定好的 scope 實際寫程式。

**為什麼要這樣做**：Executor 和 Planner 分開，是一個關鍵的設計決定。Planner 想清楚再給 Executor，Executor 就不需要再猜「應該做什麼」，也不會偷偷把 scope 擴大。

```
提示詞：

OpenSpec Executor，請執行 change：[change 名稱]。
請先讀 AGENTS.md、docs/handoff/current-task.md、docs/handoff/blockers.md、
docs/planning/v1-brief.md 和 openspec/changes/[change-name]/proposal.md。
然後依照 change lifecycle 執行：
  - 若缺 design / spec / tasks，先執行 ff（fast-forward）補齊
  - 然後執行 apply（實作）
  - 實作完成後執行 verify（驗證）
遇到任何阻塞，立刻停下來告訴我，不要自行決定。
```

**預期結果**：程式碼修改 + `docs/qa/[date]_[change-name]-smoke.md` 等證據文件 + verify PASS。

---

### Step 7：歸檔第一個 Change

**這一步在做什麼**：通過品質閘，把這個 change 正式歸檔，讓系統知道它「完成了」。

**為什麼要這樣做**：Archive 有 hard gate——缺少 smoke test、UI/UX review 等證據時，系統會拒絕歸檔。這個機制防止你「感覺做完了但其實沒有」。

```
提示詞：

OpenSpec Executor，請執行 [change 名稱] 的 archive 流程。
請先確認：
  - smoke.md 已存在
  - 若有 UI 改動，ui-review.md 和 ux-review.md 已存在
  - verify 已通過
然後執行：sync delta specs → archive → log-decision → 更新 brief 狀態
```

**預期結果**：`openspec/changes/archive/[change-name]/` 建立，brief 的該 change 狀態更新為「已歸檔」。

---

## Part 3：每日工作流提示詞速查表

> 當你已經在日常開發中，這裡是你最常用的提示詞。依場景查找。

### A. Session 管理

#### 開始一個工作 session
```
#session-start
```
（VS Code Chat 直接輸入，Copilot 會讀取 session-start.prompt.md 的指引）

#### 結束一個工作 session
```
#session-close
```

#### 快速回到狀態（最常用）
```
@WOS 我剛回來，請用最短方式告訴我：這個專案是做什麼的、目前進度、阻塞、下一步。
```

---

### B. Change 管理

#### 啟動新 change（Planner 主導）
```
#opsx-new

或明確版：
OpenSpec Planner，我要開始一個新的 change，名稱叫 [change-name]。
請讀 docs/planning/v{N}-brief.md 確認 brief 已確認，
然後問我這個 change 的 scope、non-scope、完成標準。
```

#### 快速生成 change 的所有 artifacts（proposal → design → spec → tasks）
```
#opsx-ff
```

#### 實作 change
```
#opsx-apply

或明確版：
OpenSpec Executor，請繼續執行 change [change-name] 的 apply 階段。
請讀 openspec/changes/[change-name]/tasks.md，執行未完成的 tasks。
遇到阻塞請停下來。
```

#### 驗證 change（soft gate）
```
#opsx-verify

或明確版：
OpenSpec Executor，請對 [change-name] 執行 verify：
確認 tasks 全部完成、smoke 可執行、文件齊全。
輸出 verify 結果，列出 PASS / FAIL 與原因。
```

#### 同步 delta specs 到 main specs
```
#opsx-sync
```

#### 歸檔 change（hard gate）
```
#opsx-archive

或明確版：
OpenSpec Executor，請對 [change-name] 執行 archive 流程（hard gate）。
確認 smoke.md / ui-review.md（若有 UI 改動）/ ux-review.md 存在。
然後執行 sync → archive → 更新 brief。
```

---

### C. 品質閘

#### Code Review
```
#code-review
```

#### Smoke Test
```
#smoke-test

或明確版：
請對 [change-name] 執行 smoke test：
1. 執行 [commands.md 中的測試命令]
2. 確認核心功能 [描述] 正常
3. 輸出結果到 docs/qa/[date]_[change-name]-smoke.md
```

#### UI Review
```
#ui-review
```

#### UX Review
```
#ux-review
```

---

### D. 文件更新

#### 記錄決策
```
#log-decision

或明確版：
請在 docs/decision-log.md 新增一筆決策記錄：
決策內容：[你做了什麼決定]
原因：[為什麼這樣決定]
替代方案：[你考慮過但放棄的選項]
```

#### 查看專案狀態
```
#status
```

#### 提交並推送
```
#commit-push
```

---

## Part 4：有效問法 Pattern Library

> 這是從實際開發 session 中萃取出來的「有效問法」。
> 這些問法能讓 AI 給出更精確、更有邊界的回答。

### Pattern 1：Scope Boundary 問法

**適用時機**：每次啟動新 change 前，強制 AI 幫你想清楚邊界。

```
[對 Planner]
這個 change 叫做 [name]。在我們開始之前，請先告訴我：
這個 change 明確不應該包含什麼？
如果你發現我描述的範圍比必要的更大，請主動縮小並說明原因。
```

**為什麼有效**：AI 傾向「盡量做更多」，這個問法強制它先考慮邊界，而不是先考慮功能。

---

### Pattern 2：Smallest Safe Change 問法

**適用時機**：你有一個想法，但不確定範圍是否合理。

```
我想做 [描述你的想法]。
在不破壞現有功能的前提下，最小可行的改動是什麼？
哪些部分可以留到下一個版本再做？
```

**為什麼有效**：引導 AI 從最小改動開始思考，而不是從最完整的設計開始。

---

### Pattern 3：Verification First 問法

**適用時機**：你想確保「做完了」這件事可以被驗證，而不是靠感覺。

```
在開始實作之前，請先告訴我：
這個 change 完成的標準是什麼？
我們要用什麼命令或步驟來驗證「做完了」？
請先定義好驗證方式，再開始實作。
```

**為什麼有效**：先定義「完成」的標準，AI 就不會在你還沒定義清楚時就說「完成了」。

---

### Pattern 4：Multi-turn Scope 收斂問法

**適用時機**：你跟 Planner 來回討論，想逐步收斂 scope。

**第一輪**：
```
請列出這個 change 可能包含的所有項目。
```

**第二輪**：
```
從你列出的項目中，哪些是這一輪必須做的？哪些可以推遲到下一輪？
```

**第三輪**：
```
在剩下「必須做」的項目中，有哪些可以再縮小範圍或做部分實作？
```

**為什麼有效**：三輪收斂讓你和 AI 一起從「可能的一切」走到「這一輪實際要做的最小集合」。

---

### Pattern 5：Review Gate 問法

**適用時機**：verify 完成後，請 Review Gate 做最終判定。

```
Review Gate，請對 change [change-name] 做最終判定：
1. 確認所有品質閘文件存在（smoke / ui-review / ux-review，依 change 類型）
2. 確認 verify 已通過
3. 確認 scope 與 brief 一致，沒有範圍外的修改
4. 輸出：PASS 可進入 archive / FAIL 列出缺失項目
```

---

### Pattern 6：Blocker Escalation 問法

**適用時機**：Executor 遇到問題卡住了，你要讓 WOS 幫你釐清。

```
@WOS 我現在卡住了：[描述你遇到的問題]。
請幫我判斷：
1. 這個 blocker 的根本原因是什麼？
2. 最合適的下一步是什麼？
3. 這個問題需要我做決策，還是 Executor 可以自己解？
```

---

## Part 5：常見失敗模式與快速修復

### 失敗模式 1：`project-context.md` 還是模板占位

**症狀**：WOS 說「專案目的不清楚」或給出「這個專案是一個通用的 AI 工作系統……」之類的廢話。

**快速修復**：
```
請讀取 docs/agents/project-context.md，告訴我哪些欄位還是模板占位（沒有填入真實內容）。
然後依序問我每個空白欄位應該填什麼。
```

---

### 失敗模式 2：Version Brief 未確認就開始 change

**症狀**：Planner 輸出錯誤「Version Brief 尚未確認，無法啟動 change」。

**根本原因**：`docs/planning/v{N}-brief.md` 的「使用者確認」欄位是空的。

**快速修復**：
```
請讀取 docs/planning/v{N}-brief.md，顯示「使用者確認」欄位在哪裡。
然後告訴我這個版本的 scope 是否合理，有什麼需要調整。
（確認合理後，在 brief 的使用者確認欄填入今天日期）
```

---

### 失敗模式 3：WOS 說文件過空，不知道從哪裡補

**症狀**：WOS 列出一堆「文件過空」警告，你不知道先補哪個。

**最低摩擦補強順序**（依重要性）：
1. `docs/agents/project-context.md` → 這是所有 agent 理解你專案的基礎
2. `docs/agents/commands.md` → 沒有命令，Executor 沒辦法驗證
3. `docs/handoff/current-task.md` → 沒有這個，WOS 不知道「現在在做什麼」
4. `docs/roadmap.md` → 沒有這個，Planner 不知道「要朝哪個方向做」

**快速修復提示詞**：
```
@WOS 請告訴我，現在最影響開發流暢度的一份文件是哪個。
只告訴我最優先的那一份，不要列清單。
然後提供一個提示詞讓我能快速填寫那份文件。
```

---

### 失敗模式 4：Archive 被 hard gate 擋下

**症狀**：archive 指令失敗，說某些品質閘文件缺失。

**快速確認缺少什麼**：
```
OpenSpec Executor，請確認 change [change-name] 的品質閘狀態：
- smoke.md：存在嗎？
- ui-review.md：需要嗎？存在嗎？
- ux-review.md：需要嗎？存在嗎？
列出缺少的文件，並給我對應的提示詞補齊。
```

---

### 失敗模式 5：不知道現在進度，不知道下一步

**症狀**：你打開 VS Code 看著專案一片茫然，不知道從哪裡繼續。

**這是 WOS 解決的核心問題**，直接呼叫：
```
@WOS 我剛回來，請用最短方式告訴我：這個專案是做什麼的、目前進度、阻塞、下一步。
```

---

## 附錄：每個 Agent 的正確呼叫時機

| 我想做的事 | 呼叫誰 |
|-----------|--------|
| 快速知道現在在哪、下一步是什麼 | `@WOS` |
| 討論一個 change 的 scope，還不確定要做什麼 | `OpenSpec Planner` |
| 一個 change 的 scope 已定，要開始實作 | `OpenSpec Executor` |
| 實作完成，要做最終品質確認 | `Review Gate` |
| 深入探索一個問題，不想急著下結論 | `#opsx-explore` |
| 快速生成 change 的所有文件 artifacts | `#opsx-ff` |

---

## 附錄：提示詞與 Agent 的關係

| 提示詞 / Skill | 對應的 Agent 角色 | 主要用途 |
|----------------|-----------------|---------|
| `#opsx-new` | OpenSpec Planner | 啟動新 change，定義 scope |
| `#opsx-ff` | OpenSpec Executor | 快速生成 proposal→design→spec→tasks |
| `#opsx-apply` | OpenSpec Executor | 執行 tasks，實作程式碼 |
| `#opsx-verify` | OpenSpec Executor | 驗證 change 完成（soft gate） |
| `#opsx-sync` | OpenSpec Executor | 同步 delta specs 到 main specs |
| `#opsx-archive` | OpenSpec Executor | 歸檔 change（hard gate） |
| `#opsx-explore` | 思考夥伴 | 探索問題，不急著下結論 |
| `#code-review` | OpenSpec Executor | 程式碼品質審查 |
| `#smoke-test` | OpenSpec Executor | 執行 smoke test 並記錄結果 |
| `#ui-review` | OpenSpec Executor | UI 設計品質審查 |
| `#ux-review` | OpenSpec Executor | UX 流程品質審查 |
| `#session-start` | WOS | 開始工作 session |
| `#session-close` | WOS + Executor | 結束 session，補齊文件 |
| `#commit-push` | OpenSpec Executor | 提交並推送程式碼 |
| `#log-decision` | OpenSpec Executor | 記錄決策到 decision-log |
| `#status` | WOS | 查看專案當前狀態 |
