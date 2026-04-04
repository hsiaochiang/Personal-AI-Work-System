# UX Review 2026-04-04 — Governance Scheduler

## Review Scope

- 驗收 `governance-scheduler` 對首頁使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能從 Overview 直接理解「哪些治理事項到期、接下來去哪裡處理」
  - startup snapshot 與 manual confirmation 邊界是否清楚
  - empty / disabled state 是否避免產生死流程或誤解

## Findings

- 使用者現在不必主動想到 `/memory` 或 `/decisions` 才能做治理整理；一進首頁就會先被提醒「哪些巡檢已到期」，這與 V4 的核心目標高度對齊。
- todo card 直接提供 `/memory` 或 `/decisions` route，將「提醒」與「下一步入口」放在同一位置，降低了從看到訊號到開始處理的摩擦。
- `manualNote` 文案清楚說明「確認後請手動更新 web/governance.json」，有效避免使用者誤以為按了首頁卡片就算完成治理流程。
- empty state 與 disabled state 都保留說明文字，因此在沒有到期待辦或暫時停用時，Overview 不會形成資訊黑洞。

## Decision

- UX review PASS
- 本次流程成功把治理能力從分散的頁面功能提升為首頁可感知的工作節奏，同時維持 human-confirm 邊界與低摩擦導流

## Evidence

- `web/public/index.html`
- `web/public/js/overview.js`
- `web/governance.json`
- `docs/qa/2026-04-04_governance-scheduler-smoke.md`
