# Tasks: phase3-real-project-validation

## 1. 建立 S3 active change artifacts

- [ ] 1.1 建立 proposal、design、tasks 與 delta spec
  - 驗收條件：四份 artifacts 皆存在且內容完整對齊 S3 驗證目標
- [ ] 1.2 明確標註 scope / non-scope 與 S2 non-regression 原則
  - 驗收條件：artifacts 中可明確辨識不回頭擴改 S2 scope

## 2. 執行真實專案驗證 runs（至少 2 次）

- [ ] 2.1 完成 Run A（真實任務來源）
  - 驗收條件：具備輸入摘要、候選清單、審核決策、回寫或拒絕留痕、時間與操作者
- [ ] 2.2 完成 Run B（不同上下文或不同任務切面）
  - 驗收條件：同 Run A 欄位完整，且可與 Run A 比較
- [ ] 2.3 針對每次 run 產出 dedupe 衝突處理結果
  - 驗收條件：未處理 dedupe 衝突數 = 0

## 3. 產出可驗證品質結論

- [ ] 3.1 計算 approved 候選可採納率
  - 驗收條件：可採納率 >= 70%，或未達標時附具體原因與修正建議
- [ ] 3.2 記錄 rejected 候選原因分類
  - 驗收條件：每次 run 皆有 rejected 理由或明確標記該次無 rejected

## 4. 治理同步與交接

- [ ] 4.1 更新 runlog，完整收錄兩次 run 證據
  - 驗收條件：下一位 agent 可依 runlog 重放驗證脈絡
- [ ] 4.2 更新 current-task / roadmap
  - 驗收條件：可清楚辨識 S3 進度、Validation Status、Next Step
- [ ] 4.3 視需要更新 decision 記錄（僅在超過既定門檻或策略變更時）
  - 驗收條件：重大取捨可追溯且不與既有治理檔衝突

## 5. 驗證與收尾

- [ ] 5.1 執行 strict validate 並達 PASS
  - 驗收條件：主指令或備援指令至少一條 PASS，且結果留痕
- [ ] 5.2 完成 OpenSpec Executor 交棒摘要
  - 驗收條件：包含現況、風險、剩餘工作、可直接接續命令
