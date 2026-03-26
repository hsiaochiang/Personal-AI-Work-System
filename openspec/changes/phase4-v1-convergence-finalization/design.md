# Design: phase4-v1-convergence-finalization

## Context

本專案已完成 S1-S3 三個 archived changes，具備流程打通、半自動提取 MVP、真實專案驗證三層證據。
S4 的核心不是加新功能，而是把既有成果收斂成可交付、可維運、可交接的 V1 定版標準。

## Goals / Non-Goals

Goals:
- 建立 V1 finalization 契約，明確 S4 完成判定。
- 將 S1-S3 證據鏈對齊單一 release gate。
- 定義主要風險與對應回滾策略。
- 讓下一位 agent 可直接依文件繼續，不需口頭背景補充。

Non-Goals:
- 不新增 UI 與產品功能。
- 不重寫既有治理架構。
- 不調整已封存 change 的需求內容。
- 不提前啟動 S5/S6 的實作。

## Decisions

1. 採 docs-first 收斂，不做功能擴張。
- 先確保驗收標準與證據完整，再評估功能演進。

2. release gate 使用三層條件。
- strict validate PASS。
- 治理文件同步完整（roadmap/decision-log/runlog/handoff/qa）。
- handoff 可單靠文件接續。

3. S3 與 S4 採串接而非覆寫。
- S3 驗證證據不足時，S4 不宣告完成，回補 S3 後再收斂。

## Risks / Trade-offs

- 風險：文件收斂完成但實際執行經驗不足。
  緩解：保留 QA 與 runlog 的可重播步驟，必要時補跑 smoke。

- 風險：S4 被誤解為可直接進入功能擴張。
  緩解：在 proposal/tasks 明確 non-goals，並以 gate 阻擋越界項目。

- 風險：多檔治理更新造成遺漏。
  緩解：以 checklist 逐一核對並在 runlog 留痕。

## Rollback Strategy

- 若任一 gate 未通過：
  - 維持 S4 change 為 in-progress，不做 archive。
  - 回到缺口來源（通常是 S3 證據或治理同步）進行最小補齊。
  - 禁止以新增 scope 取代缺口修補。
