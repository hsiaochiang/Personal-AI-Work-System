# Tasks: phase6-v3-multi-tool-integration-framework-mvp

## 1. 邊界與契約

- [x] 1.1 確認 S6 scope / non-scope 與 S5 邊界
  - 驗收條件：明確列出「只做框架+最小演示」與「不改寫 S1-S5 archive」
- [x] 1.2 建立 S6 delta spec 初稿（ADDED Requirements + Scenarios）
  - 驗收條件：每個 Requirement 至少 2 個 Scenarios（含失敗情境）

## 2. 多工具接入框架（MVP）

- [x] 2.1 定義 Adapter Interface
  - 驗收條件：至少 2 個來源可被同一介面調用
- [x] 2.2 定義 Normalized Candidate Schema
  - 驗收條件：來源資料可統一到必填欄位（source_tool/source_ref/dedupe_key 等）
- [x] 2.3 定義 merge/dedupe 最小規則
  - 驗收條件：同 dedupe_key 候選可合併且保留來源追溯

## 3. 人工審核與寫回

- [x] 3.1 套用統一人工審核閘門
  - 驗收條件：未審核項目不得 writeback
- [x] 3.2 定義 draft-only writeback 格式
  - 驗收條件：僅 adopted 輸出，rejected 附 reason，且不可寫入 archive/final layer

## 4. 驗證與治理同步

- [x] 4.1 完成 1 次端到端最小演示（2 tools）
  - 驗收條件：有可重播步驟與輸出摘要
- [x] 4.2 執行 strict validate（change）
  - 驗收條件：PASS 並留存命令證據
- [x] 4.3 同步 roadmap / runlog / handoff / qa
  - 驗收條件：四者狀態一致且可交接

## 5. 收尾與交棒

- [x] 5.1 產出 S6 MVP 結果摘要
  - 驗收條件：含已完成、未完成、風險、下一步
- [x] 5.2 提出 S6.1 擴充建議（非本次 scope）
  - 驗收條件：只列延伸方向，不併入本次驗收

## 核對清單（Checklist）

- [x] docs-first 與 smallest safe change 有維持
- [x] S1-S5 archive 未被修改
- [x] 人工審核閘門未被繞過
- [x] 至少一條失敗與回滾情境可驗證
- [x] strict validate 證據已記錄
- [x] 治理文件同步完成且互不矛盾

## 2-tools 最小演示驗收路徑（S6 2.x/3.x）

- 來源 A：`docs/memory/*.md`（歷史偏好與規則）
- 來源 B：`docs/runlog/*.md`（近期執行紀錄）
- 統一流程：fetch -> normalize -> dedupe -> review gate -> draft-only writeback
- 審核約束：每筆候選必須有人工決策與 reason，未審核不得輸出
- 證據位置：`docs/runlog/2026-03-26_README.md`、`docs/qa/2026-03-26_smoke.md`

## S6 MVP 結果摘要（Task 5.1）

- 已完成
  - tasks 2.x：adapter 介面、normalized schema、merge/dedupe 規則
  - tasks 3.x：統一人工審核閘門、draft-only writeback
  - tasks 4.x：2-tools 最小演示、change strict validate PASS、治理同步
- 未完成
  - S6 archive 最終執行
- 主要風險
  - 若未先同步主 spec 即進行最終收尾，將造成驗證訊號不完整
  - 若後續擴充超出 S6 邊界，會引發 scope 膨脹
- 下一步
  - 同步 `openspec/specs/multi-tool-integration-framework/spec.md`
  - 重跑 `openspec validate multi-tool-integration-framework --type spec --strict`
  - 進入 Review Gate 做最終收尾判定

## S6.1 擴充建議（Task 5.2，非本次 scope）

- 新增第 3 個來源 adapter（例如外部 issue/PR provider），驗證多來源衝突策略
- 補充 confidence calibration 規則（來源權重 + 人工修正回饋）
- 增加 review queue 的批次審核與拒絕原因分類
- 增加 writeback dry-run 報表（僅預覽，不寫入）
- 為 spec sync/validate 建立標準化收尾腳本（減少 ENOENT 類阻塞）
