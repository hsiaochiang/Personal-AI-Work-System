# Tasks: phase4-v1-convergence-finalization

## 1. S1-S3 收斂盤點

- [ ] 1.1 盤點 S1-S3 main specs 與 archived changes 一致性
  - 驗收條件：spec 名稱、change 關聯、archive 路徑可相互對照
- [ ] 1.2 彙整 S1-S3 關鍵 acceptance 與遺留風險
  - 驗收條件：形成 S4 gate checklist 草案

## 2. 建立 S4 release gate

- [ ] 2.1 定義 strict validate、治理同步、handoff 可接續三層 gate
  - 驗收條件：每層 gate 都有明確 pass/fail 判定
- [ ] 2.2 定義未通過 gate 時的回補與回滾步驟
  - 驗收條件：可執行且不擴張 scope

## 3. 補齊治理證據

- [ ] 3.1 更新 roadmap / decision-log / runlog 對齊 S4
  - 驗收條件：文件間狀態一致，無互相矛盾
- [ ] 3.2 更新 handoff（current-task / blockers）
  - 驗收條件：下一位 agent 可直接接手
- [ ] 3.3 產出或更新 QA smoke 證據
  - 驗收條件：至少包含本輪關鍵命令與結果

## 4. 驗證與收尾

- [ ] 4.1 執行 S4 strict validate
  - 驗收條件：`openspec validate phase4-v1-convergence-finalization --type change --strict` PASS
- [ ] 4.2 完成 S4 交棒摘要
  - 驗收條件：含現況、缺口、風險、下一步命令
