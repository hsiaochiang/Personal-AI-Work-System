# Proposal: phase5-v2-lightweight-ui-workbench-mvp

## Why

S1-S4 已完成並封存，V1 形成穩定治理與流程基線。下一步需要一個「最小可用、可操作、可驗證」的 UI 工作台，讓操作者不必只靠文件與命令列完成記憶候選審核流程。
本 change 目標是提供 V2 輕量 UI 工作台 MVP，先打通最小閉環與驗收證據，不追求完整產品化。

## What Changes

- 建立 V2 輕量 UI 工作台 MVP 定義（最小流程與資料邊界）。
- 定義最小操作流程：輸入上下文、生成候選、人工審核、寫入草稿證據。
- 建立可驗證 acceptance 與回滾策略，確保失敗時可退回 docs-first 狀態。
- 補齊治理證據同步規則：roadmap、runlog、handoff、qa 一致。

## Capabilities

### Capability: Minimal UI Workbench Flow

提供單一工作台頁面以支援最小操作閉環，降低純命令列操作門檻。

### Capability: Human Review And Draft Writeback

候選項目必須經人工審核後才能寫入草稿區，並保留採納/拒絕理由。

### Capability: Docs-First Governance Consistency

所有執行結果必須可回寫到治理文件，確保可交接與可追溯。

## Impact

### Roadmap Impact

- 啟動 S5（V2 輕量 UI 工作台）
- 為 S6（多工具接入）建立穩定 UI 操作基礎

### Non-goals

- 不改寫 S1-S4 archived 需求與證據
- 不導入多工具接入與完整產品化能力
- 不進行大規模資料層重構或權限系統建置
