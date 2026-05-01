# Proposal: color-contrast-a11y

> **建立日期**：2026-05-01  
> **優先級**：P2  
> **工作量估算**：S  
> **來源**：docs/ux-review/ux-improvement-backlog.md [P2-A11Y-01]

---

## 問題陳述

PAIS UX 巡檢（2026-05-01）axe-core 掃描發現 4 個頁面存在 `color-contrast` serious violations：

| 頁面 | 問題元素 | fg | bg | ratio | 需達到 |
|------|---------|----|----|:-----:|:------:|
| index | `.governance-todo-meta`、`.governance-todo-copy` | `#9a9590` | `#3d3222` | 4.21 | 4.5 |
| index | `.governance-todo-note` | `#555555` | `#3d3222` | 1.67 | 4.5 |
| memory | `.memory-dedup-item-sub` | `#555555` | `#32323a` | 1.7 | 4.5 |
| memory | `.memory-item-health-reason` | `#555555` | `#2a2a32` | 1.9 | 4.5 |
| projects | `.project-card-path` | `#555555` | `#2a2a32` | 1.9 | 4.5 |
| settings | `a[target="_blank"]`（外部連結） | `#0000ee` | `#2a2a32` | 1.51 | 4.5 |

所有違規均被 axe-core 標記為 **serious**，影響視障使用者與低對比度螢幕使用者的可讀性。

---

## 根本原因

**Root Cause 1**：`--outline: #555555` 被錯誤用於文字顏色（應僅用於邊框/分隔線）。
4 個 CSS class 使用 `color: var(--outline)` 作為文字顏色，`#555555` 在深色背景上無法達到 WCAG AA。

**Root Cause 2**：`--on-surface-variant: #9a9590` 在 `--surface (#32323a)` 和 `--primary-container (#3d3222)` 兩種背景上不通過 WCAG AA（分別為 4.28 和 4.21）。

**Root Cause 3**：Settings 頁面外部連結 `<a>` 無明確顏色，回退至瀏覽器預設藍色 `#0000ee`，在深色背景上失敗。

---

## 目標

修復 4 個頁面（index / memory / projects / settings）的所有 `color-contrast` violations，使 axe-core 重新掃描後上述頁面的 `color-contrast` violations 為 0。

---

## Non-Goals

- 不修改 handoff 頁面（其違規為 `scrollable-region-focusable`，另行處理）
- 不修改 `.health-stale` 元素（屬於 error 容器內的顏色組合，另行評估）
- 不修改 HTML 結構或 JavaScript 邏輯
- 不影響 Primary、Secondary、Warning、Error 等 accent color

---

## 整體驗收標準

1. axe-core 重新掃描 index / memory / projects / settings 四個頁面，`color-contrast` violations 全部消失
2. 視覺上 `--on-surface-variant` 修改前後差異微小（warm gray 色調保持）
3. 僅修改 `style.css`，無 HTML / JS 變更
