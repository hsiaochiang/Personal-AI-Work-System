# Skill: git-steward（版本控管管家）

## 任務目標
把每次變更都變成可追溯證據，降低「做了但找不到改哪」的風險。

## 前置條件
- 已完成所有要提交的修改（不要在中途debug/半成品狀態下 commit）
- 若有測試要求，相關測試已通過（至少 smoke test pass）
- 潔楚本次變更屬於哪一個 change / task

## 工作流程
1) `git status` 確認就緒狀態（未跟蹤檔 / 修改中檔）
2) 變更屬於新功能時建立 feature 分支；狗類修復用 bugfix 分支
3) `git add`（追蹤相關檔案，避免 `git add .` 包入無關檔）
4) 依照 Commit Template 撰寫 commit message（What / Why / Impact / Evidence）
5) `git push`，句若有 PR 模式則建立 PR
6) 檢查 Template File Guard：若本次包含 managed files 剆述風险

## 分支策略
- 分支命名慣例：
  - `feature/<slug>` — 新功能
  - `bugfix/<slug>` — Bug 修復
  - `hotfix/<slug>` — 緊急修復
  - `chore/<slug>` — 雜務（依賴升級、CI、文件）
- 主分支保護：不得直接 push 到 main/master（建議）

## Commit Template（繁中）
- What：做了什麼（具體檔案/功能）
- Why：為什麼要做
- Impact：對使用者/系統的影響
- Evidence：如何驗證（測試/截圖/log/文件）

## .gitignore 建議
- 專案初始化時確認 `.gitignore` 包含：
  - 開發框架產生的暫存檔 / build 產出
  - 依賴套件目錄（`node_modules/`、`venv/` 等）
  - 組態檔案（`.env`、`*.local`）
  - OS 產生的檔案（`.DS_Store`、`Thumbs.db`）
  - IDE 設定（`.idea/`、`.vscode/` 中的個人設定）

## PR 流程（若有協作者）
- PR description 格式：What / Why / How to test / Evidence links
- 至少一人 review（或自己用 checklist 自審）
- 合併前確認 smoke test 通過

## Template File Guard
- commit 前先檢查 `.github/copilot/template-lock.json` 的 `managed_files`
- 若本次變更包含 managed files，先明確提醒：這些檔案下次 template upgrade 可能被覆蓋
- 若 managed files 的修改其實屬於模板缺陷，優先回到上游 template repo 修正
- protected files 可正常提交，但盡量維持模板提供的欄位與結構

## 禁止事項
- 使用 `git add .` 包入無關檔案（必須明確追蹤檔案）
- 使用 `--no-verify` 跳過 lint/test hooks（有明確理由時需先向使用者說明）
- 將 managed files 的變更直接 commit 而不提醒使用者
- force push 到已分享的分支

## Outputs
- 建議的 git 指令序列
- commit message（繁中，含 What/Why/Impact/Evidence）
- 若有風險：提醒需要 review / 分支策略
