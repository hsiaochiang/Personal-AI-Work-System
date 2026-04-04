# UI Review 2026-04-04 — Memory Health Scoring

## Review Scope

- 驗收 `memory-health-scoring` 對 `/memory` 頁面的可見變更
- 檢查重點：
  - 健康度概覽是否清楚說明整體狀態，而不是只多堆幾個 KPI
  - 每條記憶的健康 badge 是否與既有來源 badge 共存且不混淆
  - 顏色與層級是否能讓 `健康 / 待確認 / 過期風險` 一眼區分

## Findings

- `/memory` 頁首新增的 health overview 與 KPI 沒有改變原本「先看全域摘要，再往下看分類清單」的閱讀節奏；過期比例與建議清理數量屬於直接可行動的摘要。
- 條目卡片把 health badge 放在 source badge 前面，並用左側邊框同步提示狀態，視覺權重正確高於來源 badge，但沒有壓過主要內容文字。
- `healthy / review / stale` 三種顏色與既有 source badge 色系是分離的，避免「ChatGPT / Copilot」與「健康狀態」在同一視覺語義上競爭。
- `memory-item-health-reason` 放在 badge 下方，補足為何被列為待確認或過期，而不是只給顏色不給理由。

## Decision

- UI review PASS
- 本次 UI 改動符合 V4 Change 1 的最小可驗收邊界：新增治理訊號，但沒有把 `/memory` 膨脹成操作面板

## Evidence

- `web/public/memory.html`
- `web/public/js/memory.js`
- `web/public/css/style.css`
- `docs/qa/2026-04-04_memory-health-scoring-smoke.md`
- `tools/verify_memory_health_scoring.js`
