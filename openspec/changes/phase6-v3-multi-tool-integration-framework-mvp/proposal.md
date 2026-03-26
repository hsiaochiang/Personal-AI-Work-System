# Proposal: phase6-v3-multi-tool-integration-framework-mvp

## Why

S1-S5 已完成並封存，現有流程已具備 docs-first 與最小 UI 審核閉環。
下一步需進入 S6（V3 多工具接入），但仍須維持 smallest safe change：
先打通「多工具接入框架 + 最小演示」，避免一次走向完整產品化。

## What Changes

- 定義多工具接入框架最小契約：
  - Adapter Interface
  - Candidate Normalization Schema
  - Error/Retry Metadata
  - Governance Evidence Fields
- 實作最小演示路徑：
  - 至少 2 個來源工具接入（可含 1 mock）
  - 合併到同一 review queue
  - 人工審核後輸出到 draft writeback
- 明確保留人工審核閘門與治理同步要求。
- 補齊驗收條件、風險、回滾策略與驗證證據格式。

## Capabilities

### Capability: Multi-Tool Adapter Framework (MVP)

提供可擴充但最小的工具接入層，讓不同來源能以統一格式進入候選流程。

### Capability: Unified Review Gate

所有來源候選共用同一人工審核閘門，不因來源不同跳過治理。

### Capability: Draft-Only Writeback With Governance Sync

採納結果只寫入草稿層，並同步 roadmap/runlog/handoff/qa 證據。

## Impact

### Roadmap Impact

- 啟動 S6（V3 多工具接入）MVP 階段
- 為後續「更多工具接入」與「穩定化」提供基礎

### Non-goals

- 不導入完整產品化能力（權限、監控、排程、營運面）
- 不改寫 S1-S5 已封存內容
- 不一次接入大量工具
- 不移除人工審核閘門
