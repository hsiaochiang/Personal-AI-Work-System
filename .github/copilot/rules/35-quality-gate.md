# 35-quality-gate（完成宣告門檻 / Done Gate）

> 目的：處理常遇到的狀況：agent 說「完成可用了」，但一按就錯。

## Done Gate（缺一不可）
- UI 相關修改：
  - 必須更新 `docs/uiux/<date>_ui-review.md`（差異→修正→驗收→證據）
- UX 流程修改：
  - 必須更新 `docs/uiux/<date>_ux-review.md`（flow/狀態/DoD）
- Bug 修復：
  - 必須產出 `docs/bugs/<date>_<slug>.md`（重現/定位/修復/驗證/防回歸）
  - 必須產出 `docs/qa/<date>_smoke.md`（最小 smoke checklist + 結果）
- 功能實作：
  - 必須有對應的規格（spec）或需求描述
  - 必須通過基本 smoke test（主要 happy path 可用）
  - 若有 OpenSpec tasks，需更新 task 狀態
- 效能相關：
  - 批次操作 / 檔案生成 / 大量資料處理需確認不造成 UI 凍結（ANR / 無回應）
  - 若有明顯效能疑慮，需記錄測試結果（操作時間 / 記憶體用量）

## System Manual 同步門檻（Manual Sync Gate）
- 若本次異動包含下列任一規劃主檔：
  - `docs/planning/v{N}-brief.md`
  - `docs/roadmap.md`
  - `docs/handoff/current-task.md`
  → 必須同步更新 `docs/system-manual.md`。
- `docs/system-manual.md` 至少要補一筆「Planning Impact Log」：
  - 日期 / 版本
  - 本次規劃異動摘要
  - 使用者可見影響（有 / 無）
  - 影響說明（能力、操作方式、風險或遷移建議）
- 若判定「無使用者可見影響」，也必須在 log 明確寫出 `No user-facing change` 與原因。
- 若 change 影響**使用者可見功能**（新增能力、改變操作方式、移除功能），除 log 外仍需同步更新對應功能段落。

## 若未通過 Done Gate
- 不得宣稱 Done
- 必須補齊 evidence 後再回報

## Brief 完整性檢查（版本收尾前必完成）

在宣告一個 Brief 已完成（版本收尾）前，必須驗證：

- Changes 表每一列的以下欄位均不可為空：
  - `使用者故事`：必須包含「身為 ___ / 我想 ___ / 以便 ___」三要素
  - `備註`：技術操作描述（必須讓開發不需臆測）
  - `使用方式`：至少一行可執行的担件指令或操作路徑
- 若任一欄位為空，不得宣稱版本收尾。
