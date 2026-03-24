# Proposal: phase1-entrypoint-guidance-pilot

## Why

第 1 次手動 workflow pilot 已證明本 repo 可以完成一次可追溯、可重播的流程，但 QA 也顯示啟動摩擦仍集中在三個點：入口順序過於分散、`spec-driven` artifacts 需要靠 `openspec instructions` 反查、以及 strict validate 命令容易誤用。若不先驗證這些直接摩擦是否下降，第 2 次 pilot 仍可能只是再跑一次流程，而不是證明 workflow 變得更順。

## What Changes

- 建立 `phase1-entrypoint-guidance-pilot` 作為第 2 次手動 workflow pilot 的 active change。
- 以第 1 次 pilot 的 QA 結論為基線，驗證固定入口順序 `AGENTS.md` → handoff → roadmap → commands 是否足以降低啟動摩擦。
- 明確要求第 2 次 pilot 在 evidence 中記錄：artifact 格式是否透過 `openspec instructions` 正確取得、strict validate 是否直接使用 `openspec change validate`、是否仍需要超出預期的入口掃描。
- 只做最小說明補強與比較型 QA 留痕，不將 handoff 模板重寫或治理骨架重構包進本次 change。

## Capabilities

### Capability: Entrypoint Guidance Comparison

建立一個可與第 1 次 pilot 直接比較的第 2 次手動 workflow 驗證，確認入口順序與 instructions 提示補強是否能降低啟動摩擦。

### Capability: CLI Guidance Replayability

將 `openspec instructions` 與 `openspec change validate` 的正確使用方式納入本次 pilot 驗收，使下一位 agent 不需再靠試錯取得 artifacts 格式或 validate 入口。

## Impact

### Roadmap Impact

- 此 change 讓 repo 從「已完成第一次 pilot 基線」推進到「開始比較第二次 pilot 是否更順」的階段。
- 本次仍屬 V1 Phase 1，目標是降低手動 workflow 啟動摩擦，而不是進入 Phase 2 自動化。

### Non-goals

- 不新增產品功能、正式 UI、搜尋介面或多工具同步。
- 不進入半自動提取、對話解析腳本、向量資料庫。
- 不將 `current-task.md` 或 handoff 模板大改當成本次 change 主體。
- 不重做與第 1 次 pilot 完全同質的驗證；本次必須留下可比較的摩擦下降證據。