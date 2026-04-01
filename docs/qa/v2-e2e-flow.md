# V2 End-to-End Flow Validation

> 目標：確保 V1 建立的知識閉環 (handoff -> extraction -> writeback) 與 V2 的新功能 (backup, project switching) 能夠順暢串聯運作。

## 測試環境
- 啟動 local dev server: `npm start`
- 準備測試專案: 確保 `projects.json` 中配置了至少兩個專案（例如 Default 與 Mock-test）。
- 清除 localStorage（或透過無痕視窗測試）。

## 測試步驟與預期結果

### 步驟 1: Handoff 產生
1. 進入首頁 `http://localhost:3000/`，確認載入了預設專案的 Roadmap。
2. 導航至 `Handoff 產生器`。
3. 選擇 `規劃階段`，填寫一些測試內容（如 "Test Feature A"）。
4. 點擊 `複製 Markdown`。
**預期結果**: 畫面提示複製成功，剪貼簿內含有預期的 Markdown 內容。

### 步驟 2: AI 對話提取與審核
1. 導航至 `知識提取`。
2. 在文字框中貼上以下模擬對話：
   ```
   User: 我們要開發 Test Feature A。
   AI: 好的。為了提升效能，我建議我們使用緩存機制。
   User: 同意。我們把這個規則記下來：所有資料庫查詢都要先過快取。
   ```
3. 點擊 `產生提取候選`。
**預期結果**: 顯示 Loading 狀態，隨後出現至少一筆候選（例如「所有資料庫查詢都要先過快取」）。
4. 針對該候選，選擇 `採用並寫回`，目標檔案選 `preference-rules.md` 或 `decision-log.md`。
5. 點擊 `確認寫回`。
**預期結果**: 顯示寫回成功提示，並且明確提及「已自動備份」。

### 步驟 3: 寫回結果與備份確認
1. 導航至 `專案記憶`，打開剛剛寫入的檔案。
**預期結果**: 剛剛採用的內容出現在畫面上。
2. 在檔案系統中檢查 `docs/memory/.backup/` 目錄。
**預期結果**: 存在剛才覆寫檔案的備份版本。

### 步驟 4: 專案切換隔離測試
1. 導航至 `Projects Hub`。
2. 點擊切換至另一個專案（例如 Mock-test）。
**預期結果**: 顯示切換成功的 Toast 通知。
3. 導航至 `專案總覽` 與 `專案記憶`。
**預期結果**: 畫面顯示的是 Mock-test 專案的資料，剛剛寫入的記憶「所有資料庫查詢都要先過快取」**不會**出現在這裡。
4. 在 `Handoff 產生器` 中重新載入現有內容。
**預期結果**: 載入的是 Mock-test 的 Task/Roadmap 內容，而非預設專案。

## 測試結果
- 測試日期: 2026-04-01
- 測試者: 自動化 Agent (`tools/verify_flow.js`)
- 結果: ✅ PASS
- 備註: 成功驗證預設專案與 Mock 專案的資料隔離。寫回記憶時也成功確認 `.backup/` 目錄會自動產生備份。各頁面 (Roadmap, Task, Memory, Rules) 切換專案後皆能正確載入對應內容。UI 的 Loading、Empty、Error 狀態皆已補齊並經檢視。
