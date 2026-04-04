# UX Review 2026-04-04 — Memory Dedup Suggestions

## Review Scope

- 驗收 `memory-dedup-suggestions` 對 `/memory` 使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能在不離開 `/memory` 的情況下知道哪些條目值得整理
  - merge / delete 是否保持人工確認與 backup 安全感
  - dedup suggestion 是否與 health scoring 形成互補，而不是重複資訊

## Findings

- 使用者現在進入 `/memory` 後，可以先從 dedup overview 知道是否存在重複記錄，再決定是否深入看健康度或原始分類內容，治理入口比 V4 Change 1 更可行動。
- duplicate group 直接顯示來源 badge、health badge 與群組標題，讓使用者能快速判斷「只是同句重複」還是「不同日期反覆寫回的近似內容」。
- merge / delete 前都會跳出瀏覽器確認，且文案明示會先 backup；這符合 V4 brief 對人工審核閘門的要求。
- merge 沒有嘗試自動重寫新句子，而是保留既有 primary item；這雖然保守，但 UX 上可預期、可回滾，不會讓使用者擔心系統改壞記憶內容。

## Decision

- UX review PASS
- 本次流程成功把 dedup suggestion 轉成低摩擦、可回滾的治理操作，且沒有引入新的頁面或複雜多步驟

## Evidence

- `web/public/memory.html`
- `web/public/js/memory.js`
- `docs/qa/2026-04-04_memory-dedup-suggestions-smoke.md`
