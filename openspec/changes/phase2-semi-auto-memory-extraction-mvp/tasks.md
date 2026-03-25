# Tasks: phase2-semi-auto-memory-extraction-mvp

## 1. 建立 active change artifacts

- [x] 1.1 建立 `proposal.md`、`design.md`、`tasks.md` 與 delta `spec.md`
  - 驗收條件：四份 artifacts 存在且內容涵蓋 scope / non-scope / acceptance criteria / 主要風險
- [x] 1.2 定義對話輸入、候選 schema、人工確認回寫的最小契約
  - 驗收條件：delta spec 內至少包含三組 Requirement 與對應 Scenario

## 2. 執行 strict validate 並修正至 PASS

- [x] 2.1 執行 `openspec change validate phase2-semi-auto-memory-extraction-mvp --strict`
  - 驗收條件：strict validate 結果為 PASS
- [x] 2.2 若 validate 失敗，依錯誤補齊 artifacts 後重跑
  - 驗收條件：無 blocking validate 錯誤

## 3. 產出真實閉環證據與治理同步

- [x] 3.1 完成至少 1 次「對話紀錄 -> 候選 -> 人工確認 -> 回寫」閉環並寫入 runlog
  - 驗收條件：runlog 記錄輸入摘要、候選內容、確認結果、回寫目標與時間
- [x] 3.2 更新 handoff 與 roadmap 使下一位 agent 可追溯
  - 驗收條件：`docs/handoff/current-task.md` 與 `docs/roadmap.md` 可直接辨識 S2 change 狀態與下一步
