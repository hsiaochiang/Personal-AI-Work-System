# Tasks: phase6-v3-multi-tool-integration-framework-mvp

## 1. 邊界與契約

- [ ] 1.1 確認 S6 scope / non-scope 與 S5 邊界
  - 驗收條件：明確列出「只做框架+最小演示」與「不改寫 S1-S5 archive」
- [ ] 1.2 建立 S6 delta spec 初稿（ADDED Requirements + Scenarios）
  - 驗收條件：每個 Requirement 至少 2 個 Scenarios（含失敗情境）

## 2. 多工具接入框架（MVP）

- [ ] 2.1 定義 Adapter Interface
  - 驗收條件：至少 2 個來源可被同一介面調用
- [ ] 2.2 定義 Normalized Candidate Schema
  - 驗收條件：來源資料可統一到必填欄位（source_tool/source_ref/dedupe_key 等）
- [ ] 2.3 定義 merge/dedupe 最小規則
  - 驗收條件：同 dedupe_key 候選可合併且保留來源追溯

## 3. 人工審核與寫回

- [ ] 3.1 套用統一人工審核閘門
  - 驗收條件：未審核項目不得 writeback
- [ ] 3.2 定義 draft-only writeback 格式
  - 驗收條件：僅 adopted 輸出，rejected 附 reason，且不可寫入 archive/final layer

## 4. 驗證與治理同步

- [ ] 4.1 完成 1 次端到端最小演示（2 tools）
  - 驗收條件：有可重播步驟與輸出摘要
- [ ] 4.2 執行 strict validate（change）
  - 驗收條件：PASS 並留存命令證據
- [ ] 4.3 同步 roadmap / runlog / handoff / qa
  - 驗收條件：四者狀態一致且可交接

## 5. 收尾與交棒

- [ ] 5.1 產出 S6 MVP 結果摘要
  - 驗收條件：含已完成、未完成、風險、下一步
- [ ] 5.2 提出 S6.1 擴充建議（非本次 scope）
  - 驗收條件：只列延伸方向，不併入本次驗收

## 核對清單（Checklist）

- [ ] docs-first 與 smallest safe change 有維持
- [ ] S1-S5 archive 未被修改
- [ ] 人工審核閘門未被繞過
- [ ] 至少一條失敗與回滾情境可驗證
- [ ] strict validate 證據已記錄
- [ ] 治理文件同步完成且互不矛盾
