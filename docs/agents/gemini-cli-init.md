# Gemini CLI 初始化指令

> 每次新 session 開工時，將此檔案的完整內容貼給 Gemini CLI 作為第一句 prompt。
> **注意**：Gemini CLI 啟動時會自動載入 `GEMINI.md`，本檔案是補充上下文用。

---

## 初始化步驟

請依序讀取以下檔案，完成後再執行任何任務：

1. `GEMINI.md`（你的 system prompt，確認你有哪些 commands 和 skills 可用）
2. `AGENTS.md`
3. `docs/roadmap.md`（確認目前版本編號 V?）
4. `docs/handoff/current-task.md`
5. `docs/planning/v{N}-brief.md`（N = 上一步確認的版本號）

---

## 執行任務

初始化完成後，根據 brief 中的「預計拆分的 Changes」清單，依序對每個未開始的 change 執行以下流程。

> **重要**：你已經有可直接使用的 `/opsx:*` 命令（見 `GEMINI.md`），
> 請使用這些正規命令執行，不要自行模擬。

### Step 1：規劃（Propose）

```
/opsx:propose "<change-name>"
```

這會呼叫 `openspec` CLI 建立 change 目錄，並產生 proposal / design / tasks。
產出後等待確認，確認無誤再繼續。

### Step 2：執行（Apply）

```
/opsx:apply "<change-name>"
```

這會讀取 tasks，引導你逐步完成實作。

### Step 3：歸檔（Archive）

```
/opsx:archive "<change-name>"
```

這會執行完整的歸檔流程（檢查 artifacts → 檢查 tasks → sync specs → 移入 archive）。

---

## 執行原則

- 遇到 blocking issue 請**停下回報**
- 無 blocking issue 請**連續推進**，不需每步等待確認
- 嚴格依 brief 的 In Scope 執行，不可自行擴大需求
- 每個階段簡短回報：當前階段、執行摘要、blocking issues、下一步

## 每個 Change 完成後的強制步驟（缺一不可）

> 這是跨 agent 協作的最後一道門。Gemini 完成開發後若跳過這些步驟，
> Copilot 讀取 remote 狀態時會誤判為「尚未執行」或遺留未歸檔殘留物。

1. **執行 `/opsx:archive "<change-name>"`**
   - 這是你已有的正規命令，會自動完成：artifacts 檢查 → tasks 檢查 → specs sync → 移入 archive
   - **不要**手動模擬 archive，直接使用命令

2. **更新 `docs/handoff/current-task.md`**
   - Done 區段加上本 change（含 commit hash 與日期）
   - 更新 Next Step 為下一個待執行的 change
   - 更新 Validation Status 為 PASS / FAIL

3. **更新 `docs/roadmap.md`**
   - Change 進度表：將本 change 標記為 `✅ 已完成`，填入 commit hash
   - 「下一步」段落：更新為下一個 change
   - 「已知缺口」表：若本 change 解決了某個缺口，加上 `~~刪除線~~` 並標 ✅

4. **`git add -A && git commit && git push`**
   - **必須 push 到 origin/main**，本地 commit 不算完成
   - commit message 格式：`feat(v{N}): <change 名稱>`

> 若因工具限制無法 push，請在回報中明確說明「本地 commit 已完成，尚未 push」，
> 並告知 commit hash，讓使用者手動執行 `git push`。
