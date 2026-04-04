# UX Review 2026-04-04 — Rule Conflict Detection V2

## Review Scope

- 驗收 `rule-conflict-detection-v2` 對 `/decisions` 使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能在規則頁面內快速理解衝突，而不是只收到模糊警告
  - explanation 是否保持 suggestion-only、避免讓系統看起來像在強制裁決
  - 搜尋、分類切換與既有決策瀏覽流程是否維持低摩擦

## Findings

- 使用者進入 `/decisions` 後，現在可以先從 overview 判斷「這一類規則是否值得回頭整理」，再決定要不要看具體 pair；這比舊版只能看到 `待確認衝突` badge 更可採取行動。
- explanation 文案固定使用「可能衝突」與「請人工確認」，並指出對象與 signal 類型，符合 V4 brief 對人工判斷閘門的要求，不會誤導成系統已替使用者做最終決定。
- 衝突 explanation 被放在原規則卡片內，而不是另外開 modal 或導頁，降低了理解成本，也避免打斷搜尋 / 切分類的原生流程。
- `/api/rules` contract 維持不變，表示使用者可見體驗升級不需要承受額外 loading path 或 API 失配風險。

## Decision

- UX review PASS
- 本次流程成功把規則衝突從「抽象提示」提升為「可閱讀、可追蹤的治理訊號」，且沒有把 `/decisions` 變成高摩擦操作面板

## Evidence

- `web/public/decisions.html`
- `web/public/js/decisions.js`
- `web/public/js/rule-conflict-utils.js`
- `docs/qa/2026-04-04_rule-conflict-detection-v2-smoke.md`
