# UI Review 2026-04-04 — Cross-project Shared Knowledge

## Review Scope

- 驗收 `cross-project-shared-knowledge` 對 `/memory` 頁面的可見變更
- 檢查重點：
  - shared overview 是否在既有 health / dedup 區塊旁維持清楚層級
  - 候選群組是否能快速看出「哪些專案、哪些內容、建議摘要是什麼」
  - 視覺語氣是否維持 suggestion-only，而不是像可直接執行的治理 action

## Findings

- shared overview 放在 KPI 後、dedup / health 前，順序合理：先看跨專案可共用的內容，再看單專案清理與健康度，資訊架構沒有被打散。
- 每組候選卡片同時顯示 category、相似度、參與專案 badge 與建議 shared 摘要，足以讓使用者在不打開 markdown 的情況下先判斷是否值得整理。
- 綠色系視覺區隔了「共享候選」與「去重建議」的不同語意，不會與 dedup 或錯誤訊息混淆。
- UI 沒有加入任何按鈕或 destructive action，符合本次 suggestion-only 邊界。

## Decision

- UI review PASS
- 本次 UI 改動符合最小可驗收範圍：提升 `/memory` 的跨專案可見性，但沒有額外拉高導覽或操作複雜度

## Evidence

- `web/public/memory.html`
- `web/public/js/memory.js`
- `web/public/js/shared-knowledge-utils.js`
- `web/public/css/style.css`
- `docs/shared/shared-knowledge-candidates.md`
- `docs/qa/2026-04-04_cross-project-shared-knowledge-smoke.md`
