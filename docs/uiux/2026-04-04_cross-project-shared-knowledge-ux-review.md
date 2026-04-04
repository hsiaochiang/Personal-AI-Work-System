# UX Review 2026-04-04 — Cross-project Shared Knowledge

## Review Scope

- 驗收 `cross-project-shared-knowledge` 對 `/memory` 使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能直接理解 shared candidate 與 dedup / health 的差別
  - suggestion-only 邊界是否清楚，不會誤解成系統已自動整合 shared layer
  - 目前無 `/shared` 頁面的情況下，流程是否仍足夠低摩擦

## Findings

- 使用者進入 `/memory` 後，不需要切頁，就能先看到目前專案與其他專案重複出現的模式，符合 V4 要降低「共享知識分散在各處」的核心動機。
- overview 文案與 snapshot path 同時存在，清楚說明「這是候選」以及「後續要去哪裡看 markdown 證據」，避免 shared layer 狀態被誤讀。
- 沒有 action button 反而是正確的 UX 決策：這一版還沒定義 shared writeback，若提前放按鈕只會讓流程邊界模糊。
- empty state 能處理尚無 shared candidate 的情境，代表這個功能在低資料量階段也不會造成錯誤或死流程。

## Decision

- UX review PASS
- 本次流程成功把 shared knowledge 從抽象 roadmap 項目變成可觀察的治理訊號，同時維持 human-confirm 邊界與低摩擦

## Evidence

- `web/public/memory.html`
- `web/public/js/memory.js`
- `docs/shared/README.md`
- `docs/shared/shared-knowledge-candidates.md`
- `docs/qa/2026-04-04_cross-project-shared-knowledge-smoke.md`
