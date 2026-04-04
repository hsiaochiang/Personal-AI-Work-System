# UI Review 2026-04-04 — Memory Dedup Suggestions

## Review Scope

- 驗收 `memory-dedup-suggestions` 對 `/memory` 頁面的可見變更
- 檢查重點：
  - 疑似重複建議區塊是否清楚與既有 health overview 分層
  - duplicate group 的推薦保留項目、health/source badge 與操作按鈕是否易讀
  - merge / delete action 是否像治理工具，而不是搶走原本記憶列表的主視覺

## Findings

- dedup overview 放在 health overview 之前，閱讀順序合理：先看是否有需要整理的重複，再往下看健康度與完整記憶列表。
- duplicate group card 以暖色系背景與既有記憶卡片做出區隔，但仍沿用同一套 badge 語言，不會像另一個獨立頁面。
- 「建議保留」badge 與 recommendation copy 讓 primary item 一眼可辨，避免使用者在 group 內自行猜測哪條是系統要留的版本。
- 每個 secondary item 只有一個 `刪除這條` 動作，group header 則提供 `合併為一條`；操作層級清楚，不會把所有按鈕堆在同一列。

## Decision

- UI review PASS
- 本次 UI 改動符合 V4 Change 2 的最小可驗收邊界：新增 dedup 治理入口，但沒有破壞 `/memory` 原本的分類瀏覽模式

## Evidence

- `web/public/memory.html`
- `web/public/js/memory.js`
- `web/public/css/style.css`
- `docs/qa/2026-04-04_memory-dedup-suggestions-smoke.md`
- `tools/verify_memory_dedup_suggestions.js`
