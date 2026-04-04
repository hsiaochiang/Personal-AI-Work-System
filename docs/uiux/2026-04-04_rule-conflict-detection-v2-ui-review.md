# UI Review 2026-04-04 — Rule Conflict Detection V2

## Review Scope

- 驗收 `rule-conflict-detection-v2` 對 `/decisions` 頁面的可見變更
- 檢查重點：
  - 規則衝突摘要是否比舊版單一 warning banner 更可讀
  - per-rule explanation 是否能讓使用者知道衝突來自哪一條規則
  - 新增視覺層是否仍維持 `/decisions` 現有資訊架構，而非變成另一個治理頁面

## Findings

- conflict overview 放在 rule category tabs 下方，層級清楚：先看目前分類有多少衝突，再往下讀個別規則卡片，不需要跳離既有 rules tab。
- overview card 以暖色背景與 KPI 小卡呈現「組數 / 涉及規則」，比原本只有一行 banner 更容易快速掃描，也保留治理提示而非錯誤告警的語氣。
- 每張 conflict rule card 內新增的 explanation 區塊會同時顯示 signal label 與衝突對象，能回答「為什麼被標記」而不只是顯示一個 badge。
- 既有規則卡片結構、分類 tabs 與搜尋欄都保留，因此本次升級看起來像原頁面被增強，而不是新介面硬塞進來。

## Decision

- UI review PASS
- 本次 UI 改動符合 V4 Change 3 的最小可驗收邊界：提升 `/decisions` 的可解釋性，但沒有引入額外治理操作或導覽複雜度

## Evidence

- `web/public/decisions.html`
- `web/public/js/decisions.js`
- `web/public/js/rule-conflict-utils.js`
- `web/public/css/style.css`
- `docs/qa/2026-04-04_rule-conflict-detection-v2-smoke.md`
- `tools/verify_rule_conflict_detection_v2.js`
