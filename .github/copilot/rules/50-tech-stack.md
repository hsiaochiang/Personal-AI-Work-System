# 50-tech-stack（技術棧約定）

## 目標
- 統一技術選型，避免同一功能重複引入不同套件
- 新增 dependency 需有決策記錄

## 技術棧清單

### 語言 / 框架
- **Runtime**: Node.js（≥ 18）
- **前端**: 純 HTML + vanilla JS（無框架、無 build step、無打包工具）
- **CSS**: 純 CSS（inline style / class，無預處理器）
- **後端 server**: Node.js `http` 模組（`web/server.js`），無 Express

### 狀態管理
- 無；頁面狀態以 DOM 操作 + fetch API 管理

### 資料儲存
- **本地**：Markdown 純文字檔（`docs/memory/`、`docs/workflows/`）
- **遠端**：無；目前 local-only

### UI 元件庫
- 無；手刻 HTML/CSS，設計 token 來自 Stitch 快照（見 `10-style-guide.md`）

### 測試工具
- 單元測試：目前無 automated test 框架
- 整合 / E2E：`tools/verify_flow.js`（手動執行）
- Smoke：`bootstrap_copilot_workspace.py --verify-only`（template governance）

### 其他工具
- OpenSpec CLI：`@fission-ai/openspec`（change lifecycle 管理）
- 文件 bootstrap：`copilot-workspace-template`（Python 3.11 venv）

## Node / Python 版本
- Node ≥ 18
- Python ≥ 3.11（僅 template bootstrap 工具使用）

## 新增 Dependency 規則
- 引入新套件前，先確認沒有現有方式能解決
- 新增套件需記錄決策到 `docs/decisions/`，包含：套件名稱與版本、選擇原因（vs 替代方案）、license
- **禁止**：在未獲人工確認前引入任何前端框架（React/Vue/Svelte 等）、打包工具（Vite/webpack）、ORM 或資料庫

## 使用方式
- 每次新增 dependency 時對照並更新本文件
- Style Freeze 後，此文件連同 `10-style-guide.md` 一起凍結
