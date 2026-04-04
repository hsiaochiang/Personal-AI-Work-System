# UI Review 2026-04-04 — Governance Scheduler

## Review Scope

- 驗收 `governance-scheduler` 對 Overview 頁面的可見變更
- 檢查重點：
  - 治理待辦卡是否與既有 roadmap KPI / phase table 保持清楚層級
  - attention / routine 的視覺語意是否夠明確，但不誤導成系統自動執行
  - disabled / empty state 是否能在無待辦或停用時維持完整頁面節奏

## Findings

- 治理待辦卡放在 KPI grid 與 phase table 之間是合理位置：先看版本進度，再看「現在有哪些治理事項到期」，不需要切頁即可理解當前工作節奏。
- summary card + todo list 的兩層結構清楚；summary 提供 startup snapshot 語意，todo card 則提供具體路徑與到期資訊，資訊密度適中。
- attention item 用暖色邊框、routine item 維持較中性的卡片，能看出優先順序，但仍保留 suggestion-only 的保守視覺，不會像 error state 或 destructive action。
- disabled / empty state 使用卡片內文案說明，而不是把區塊整個消失，對首次進入 Overview 的使用者更容易理解「功能存在，但目前沒有待辦 / 已停用」。

## Decision

- UI review PASS
- 本次 UI 變更符合最小安全範圍：Overview 新增治理可見性，但沒有壓過既有 roadmap 主體，也沒有暗示不存在的自動執行能力

## Evidence

- `web/public/index.html`
- `web/public/js/overview.js`
- `web/public/css/style.css`
- `web/governance.json`
- `docs/qa/2026-04-04_governance-scheduler-smoke.md`
