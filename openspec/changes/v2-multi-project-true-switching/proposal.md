# v2-multi-project-true-switching

## 目的
讓多專案切換從「UI 選項」提升為「實體資料源切換」。
透過 API 傳入 `projectId`，讓後端 server 能夠讀取不同專案目錄下的內容。

## 設計
- **後端 (web/server.js)**：
  - 引入 `web/projects.json` 並解析內容。
  - 建立 `getProjectPath(projectId)` 函式，用於查找對應專案的實體路徑。
  - 在所有處理檔案讀寫的 API 中，根據 `projectId` 切換基底目錄。
  - 嚴格校驗專案路徑，防止 Path Traversal。
- **前端 (web/public/js/app.js)**：
  - 修改 `apiFetch` 函式，自動將當前選取的專案 ID 加入 Request。

## 任務清單
- [ ] 1. 準備測試資料：在 `web/projects.json` 加入一個 mock 專案（可以是同一個目錄的不同 alias 或 另一個 mock 目錄）。
- [ ] 2. 後端：實作 `getProjectPath` 與 `projectId` 參數解析邏輯。
- [ ] 3. 後端：更新 `/api/roadmap`, `/api/current-task`, `/api/memory`, `/api/handoff-templates`, `/api/memory/write`, `/api/decisions`, `/api/rules` 以支援多專案路徑。
- [ ] 4. 前端：更新 `apiFetch` 讓所有請求帶上 `projectId`。
- [ ] 5. 驗證：切換專案後，首頁 Roadmap 應顯示該專案的內容。

## 驗收標準
- `web/projects.json` 配置 2 個專案。
- 切換專案後，各頁面（Overview, Task, Memory 等）皆能顯示對應專案的資料。
- 寫回操作（Memory Write）能正確寫入所選專案的目錄。
- 無 `projectId` 或無效 `projectId` 時，回退至預設路徑且不造成 Crash。
