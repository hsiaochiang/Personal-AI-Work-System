# UX Review 2026-04-15 — Memory AI Curator

## Review Scope

- 驗收 `memory-ai-curator` 對 `/memory` 治理流程的 UX 影響
- 檢查重點：
  - 使用者是否能從 summary 直接進入需要處理的內容
  - destructive action 是否保有人工確認與 backup 安全感
  - AI curate 是否維持「AI 提案、人類確認」而不是直接改寫

## Flow List

### Flow 1 — 從 KPI 聚焦問題條目

- Entry: `/memory`
- Navigation: 同頁 state toggle
- Steps:
  1. 使用者看到 health KPI
  2. 點擊「建議清理」
  3. 列表切成僅顯示 `health.status !== 'healthy'` 的條目
  4. 再點一次 KPI 回到完整列表
- States:
  - success: active KPI + filtered list
  - empty: 顯示目前沒有需要優先清理的條目

### Flow 2 — 刪除單條記憶

- Entry: `/memory` item card
- Navigation: 同頁 confirm dialog
- Steps:
  1. hover/focus 記憶條目
  2. 點刪除 icon
  3. confirm dialog 顯示條目摘要
  4. 後端刪除、先建立 backup、前端 reload
- States:
  - success: 條目消失、資料重載
  - error: alert 顯示失敗原因

### Flow 3 — 逐分類 AI curate

- Entry: `/memory` category header
- Navigation: 同頁 inline panel
- Steps:
  1. 點 `AI 整理`
  2. 按鈕切成 loading
  3. 顯示 original / improved 對照與 summary
  4. 使用者選擇 `確認覆寫` 或 `略過`
- States:
  - loading: 按鈕 disabled + `分析中…`
  - success: 確認後寫回並 reload
  - skip: panel 關閉，不改檔
  - error: Gemini key 缺失時顯示導向 `/settings` 的錯誤 hint

### Flow 4 — 從 AI review 直接跳到分類

- Entry: `/memory` AI 品質審查結果
- Navigation: page anchor + smooth scroll
- Steps:
  1. 使用者執行 AI 品質審查
  2. 在結果列表點某筆 `file`
  3. 頁面捲動到對應 category
- States:
  - success: scroll 到對應分類
  - empty/error: 沿用既有 AI review panel 行為

## Edge Cases

- itemId 缺失或找不到時，後端回 `404`，前端以 alert 告知，避免 silent failure。
- 非 whitelist filename 時，刪除與 curate 都會被後端拒絕，避免越界改寫。
- Gemini key 未設定時，curate 不應卡死在 loading；必須回到可再操作狀態並提示去 `/settings`。
- filtered mode 若沒有問題條目，必須顯示 empty state，而不是空白頁。

## DoD

- 使用者可在不離開 `/memory` 的情況下完成「找問題 → 刪除 / AI 整理 → 回看結果」。
- 所有 destructive / writeback action 都保留人工確認與 backup 邊界。
- AI review 不再只是建議列表，而是可直接導向對應分類的治理入口。

## Open Questions

- 之後是否需要在 KPI active 狀態下加上顯性的 `顯示全部` 次要按鈕，而不是只靠再次點擊切換。
- 若未來加入 batch curate，是否仍維持 inline panel，或需要升級成獨立 review workspace。

## Evidence

- `web/public/js/memory.js`
- `web/public/memory.html`
- `web/server.js`
- `docs/qa/2026-04-15_memory-ai-curator-smoke.md`
