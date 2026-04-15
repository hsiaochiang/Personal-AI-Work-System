# UI Review 2026-04-15 — Memory AI Curator

## Review Scope

- 驗收 `memory-ai-curator` 對 `/memory` 頁面的可見變更
- 檢查重點：
  - 刪除按鈕是否維持治理工具的低干擾設計
  - KPI 篩選 active state 是否能明確表達「目前只看問題條目」
  - AI curate panel 是否與既有 memory card 語言一致，且 before/after 對照清楚

## Findings

- 刪除按鈕預設隱藏、hover 或 focus 才浮出，符合 style guide 對 primary/secondary controls 不應搶主畫面的要求；它是可用的治理動作，不會把每條記憶卡片變成危險按鈕牆。
- KPI「建議清理」切成 active 時，卡片會直接反轉成 primary/on-primary 對比，使用者能一眼看出目前在 filtered mode，而不需要閱讀額外說明文案。
- category header 新增 `AI 整理` 後仍保持單列資訊結構：icon、標題、count、action。`flex-wrap` 的處理讓窄畫面不會擠壓標題。
- curate panel 採 inline 展開而不是 modal，符合 `/memory` 既有「在同一頁做治理」的視覺模型；兩欄對照與 mobile 單欄 fallback 都合理。
- AI review 結果中的 filename 改為可點擊連結後，視覺層級比純文字更明確，也把「建議」轉成真正可行動的入口。

## Patch Plan

- 本輪不需要額外 UI patch。
- 下一輪若要再優化，可考慮：
  - 在 filtered mode 顯示更明確的「顯示全部」輔助文案
  - 在 delete hover/focus 狀態補充更明顯的 tooltip 或 aria label

## Acceptance

- 記憶條目 hover/focus 時可看到 delete action，非 hover 時不應干擾閱讀。
- 點擊 KPI 後，active style 必須穩定切換，且再次點擊可退出。
- AI curate panel 必須清楚區分原始內容與改善版本；小螢幕下不應破版。
- AI review 的檔名連結必須能對應到正確 category anchor。

## Evidence

- `web/public/js/memory.js`
- `web/public/memory.html`
- `web/public/css/style.css`
- `docs/qa/2026-04-15_memory-ai-curator-smoke.md`
