# Change Design: ux-p2-ux-05

**Date**: 2026-05-03  
**Scope**: P2-UX-05 (decisions status column, M)  
**Status**: 已完成

## 變更項目

### P2-UX-05: Decisions 狀態 Badge

決策頁每條決策記錄顯示狀態 badge（有效 / 已取代 / 已過期）。

**狀態來源：**
- `docs/memory/decision-log.md` 的 `- 狀態：` 欄位（與其他欄位格式一致）
- 未填寫時預設「有效」
- 表格格式 (`docs/decision-log.md`) 讀取第 6 欄（cells[5]），未填預設「有效」

**Badge 顏色：**
- 有效：green-ish (`rgba(74,222,128,0.15)`, `#6be09a`)
- 已取代：amber (`rgba(251,191,36,0.15)`, `#f5c842`)
- 已過期：gray (`rgba(148,163,184,0.12)`, `#94a3b8`)

**使用方式：**
在 `docs/memory/decision-log.md` 的 `### 決策：...` 區塊加一行：
```
- 狀態：已取代
```

**變更檔案：**
- `decisions.js`: `parseOperationalDecisions` + `parseMemoryDecisions` 各加 status 欄位；`renderDecisions` 加 statusMap + badge 渲染
- `style.css`: 加 `.decision-status-badge`, `.decision-status-active/replaced/expired`
