# UX Review 2026-04-04 — Memory Health Scoring

## Review Scope

- 驗收 `memory-health-scoring` 對 `/memory` 使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能更快知道哪些條目要先回頭整理
  - legacy 條目沒有日期 / 來源時，系統是否給出合理而不過度驚嚇的預設狀態
  - 新摘要是否保留既有分類瀏覽心智模型，而不是迫使用者先學一套新流程

## Findings

- 使用者現在進入 `/memory` 後，不需要先展開每個分類，就能先從過期比例與建議清理數量判斷是否值得做治理。
- 沒有日期的 legacy 條目被標成 `待確認`，而不是直接紅色 `過期風險`；這個預設對現有資料更公平，也避免第一版 health scoring 造成過度噪音。
- health reason 直接說明「缺少日期」「最近 30 天」等判斷依據，降低黑箱感，讓使用者理解這是治理提示，不是內容真偽判定。
- 原本的分類閱讀流程、來源 badge 與記憶內容都被保留，因此現有使用者不用重新學 `/memory` 的導航方式。

## Decision

- UX review PASS
- 本次流程提升了治理可預期性，且沒有新增額外點擊或編輯步驟；適合作為 V4 第一個變更的基線

## Evidence

- `web/public/memory.html`
- `web/public/js/memory.js`
- `docs/qa/2026-04-04_memory-health-scoring-smoke.md`
