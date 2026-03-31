# Multi-Project Switching API Design

## 概念
當前專案是由 `PROJECT_ROOT` 控制的單一目錄。
為了切換，我們引入 `PROJECT_BASE` 變數，動態由 `projectId` 查找。

## URL 參數
在所有的 `/api/*` 請求中加入 `?projectId=...` (optional)。

## 查找流程
1. 從 `web/projects.json` 讀取專案清單。
2. 根據 `projectId` 尋找 `projects.find(p => p.id === projectId)`.
3. 若找到，則 `PROJECT_BASE = project.path`.
4. 若未找到，則 `PROJECT_BASE = path.resolve(__dirname, '..')` (default project).
5. 安全性校驗：所有檔案路徑必須在 `PROJECT_BASE` 之下，防止 Path Traversal.

## 變更點
- `web/server.js`:
  - `const PROJECTS = JSON.parse(fs.readFileSync('web/projects.json')).projects;`
  - `function getProjectRoot(projectId) { ... }`
  - 更新 `handleAPI(req, res)`，傳入 `projectId`.
  - 修改 `ALLOWED_PATHS`, `MEMORY_DIR`, `BACKUP_DIR`, `TEMPLATES_DIR` 的解析邏輯，改為相對於 `PROJECT_BASE`.
- `web/public/js/app.js`:
  - `apiFetch(endpoint)` 改為 `apiFetch(endpoint, projectId = null)`.
  - `projectId` 從 `localStorage` 讀取。
  - 加入 `new URL(endpoint, location.origin)` 並 `params.set('projectId', ...)`。

## 測試場景
1. 預設專案：`?projectId=personal-ai` (或不帶參數)。
2. 新增 Mock 專案：在 `projects.json` 加入一個 ID 為 `mock-test`，path 指向一個內容不同的目錄（例如 `web/test-mock`）。
3. 非法專案：`?projectId=../../` 或 `?projectId=non-existent`。
