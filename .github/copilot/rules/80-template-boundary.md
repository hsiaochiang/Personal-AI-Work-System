# 80-template-boundary（模板邊界護欄）

## 目標
- 讓 agent 與接手的人都能分辨：哪些檔案屬於模板、哪些屬於專案
- 避免在下游專案直接修改 managed files，導致下次 upgrade 被覆蓋

## 四層分類
- Managed files：模板擁有，upgrade 會以模板最新版覆蓋
- Protected files：模板建立骨架，專案負責填寫內容，upgrade 預設跳過
- Init-only files：只在第一次 init 建立骨架，後續 upgrade 與 template lock 不持續追蹤
- Project-owned files：模板不追蹤，完全由專案維護

## 工作規則
- 編輯前，先查看 `TEMPLATE-FILES.md` 或 `.github/copilot/template-lock.json`
- 若檔案屬於 managed：不要直接修改；先提醒使用者這是模板擁有檔案
- 若檔案屬於 protected：可補內容，但不要刪除模板欄位、標題或骨架
- 若檔案屬於 init-only：可直接依專案狀態維護；後續不應期待 template upgrade 幫你補回這些內容
- 若檔案屬於 project-owned：可依任務自由修改
- 若需要補專案特定規則，優先寫在 `.github/copilot/rules/90-project-custom.md`

## Agent 行為
- 若任務要求修改 managed files，先停下來說明風險，再由使用者決定是否要改上游模板
- 若不確定分類，執行 `deploy/bootstrap.py --list-managed --root <target>`
- Commit 前，應再次檢查本次改動是否包含 managed files
