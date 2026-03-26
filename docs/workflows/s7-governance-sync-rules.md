# S7 Governance Sync Rules

## Mandatory Every Cycle

1. 更新 runlog（當輪目標、實作、驗證摘要）。
2. 更新 current-task（Done/In Progress/Next Step/Validation Status）。

## Conditional Sync

1. 觸發 uiux + qa：
   - 任何可見 UI 變更。
   - 任何互動流程變更（routing、flow、automation behavior）。
2. 例外：
   - 純 OpenSpec 規格文本變更且不影響 UI/流程互動，可不更新 uiux。

## Consistency Checks

1. roadmap Current/Next 與 current-task Next Step 不互斥。
2. runlog 的最新段落需可追溯到 files changed。
3. qa 若有新增 smoke，需列 commands 與結果。

## Acceptance Gate

未滿足以下條件不得視為完成：
1. runlog_updated = true
2. handoff_updated = true
3. 若觸發 UI/UX 條件，uiux_updated = true 且 qa_updated = true
