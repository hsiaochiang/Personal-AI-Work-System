---
agent: agent
description: "OpenSpec：歸檔已完成的 Change（含品質閘硬閘確認）"
---
請使用 `openspec-archive-change` skill 歸檔目前已完成的 Change。

---

## 品質閘硬閘（Archive Hard Gate）

**歸檔前必須通過品質閘確認，缺一不過。**

### 步驟 0：讀取 `openspec/changes/<name>/gate.md`

- **若存在**：
  - 讀取「最終判定」欄位
  - 若判定為 **PASS** → 直接進入 `openspec-archive-change` skill（跳過步驟 1～4）
  - 若判定為 **BLOCKED** → 顯示 gate.md 的表格內容，進入步驟 4（Override 流程）
- **若不存在**：
  - 提示：「尚未執行過 `#opsx-verify`；建議先執行以產生 gate.md」
  - 即時執行步驟 1～3 掃描並寫入 gate.md，再依結果決定繼續或進入步驟 4

### 步驟 1：判斷 Change 類型（僅在 gate.md 不存在時執行）

讀取 `openspec/changes/<name>/design.md` 或 `tasks.md`，以關鍵字判斷：

- 含有 `UI`、`前端`、`畫面`、`介面`、`component`、`頁面`、`style`、`layout` → **UI change**
- 只修改 `docs/` 且無程式碼變更 → **doc-only**
- 其他 → **logic change**

### 步驟 2：依 Gate Matrix 掃描必要證據文件（僅在 gate.md 不存在時執行）

| change type | ui-review | ux-review | smoke |
|------------|-----------|-----------|-------|
| ui | 必需 | 必需 | 必需 |
| logic | — | — | 必需 |
| doc-only | — | — | — |

掃描方式：
- **ui-review**：`docs/uiux/` 下存在含 `<change-name>` 且 `ui-review` 的 .md 檔案
- **ux-review**：`docs/uiux/` 下存在含 `<change-name>` 且 `ux-review` 的 .md 檔案
- **smoke**：`docs/qa/` 下存在含 `<change-name>` 或 `smoke` 的 .md 檔案

### 步驟 3：寫入 gate.md 並輸出 Gate 結果表格（僅在 gate.md 不存在時執行）

格式同 `#opsx-verify` 步驟 D；完成後以 gate.md 結果進入步驟 4 判定。

### 步驟 4：若最終判定為 BLOCKED

- **停止歸檔**，列出缺少的 Gate 項目與對應補齊指令
- **Override 選項**：若確認此 change 不需要某項 review，使用者須明確回覆：
  > 「確認跳過 `<ui-review / ux-review / smoke>`，原因：___」
- Override 聲明後，**更新 gate.md 的 Override 聲明區段並將最終判定改為 PASS**
- Override 必須明確聲明，**不可靜默跳過**
- Gate 確認後（gate.md 最終判定為 PASS），繼續執行 `openspec-archive-change` skill

---

其他前置條件：
- Verify 已通過
- Specs 已同步

歸檔後更新 `docs/roadmap.md` 和 `docs/runlog/`。
