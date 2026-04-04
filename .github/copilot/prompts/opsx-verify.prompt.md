---
agent: agent
description: "OpenSpec：驗證實作是否符合 Change artifacts，並輸出品質閘狀態表格"
---
請使用 `openspec-verify-change` skill 驗證實作結果。

檢查項目：
1. 每個 task 的驗收條件是否滿足
2. 實作是否與 spec / delta-spec 一致
3. 是否有未處理的邊界情況
4. Done Gate（`rules/35-quality-gate.md`）是否通過

---

## 品質閘掃描（Gate Scan）

驗證完成後，依序執行以下步驟並輸出 Gate Table。

### 步驟 A：判斷 Change 類型

讀取 `openspec/changes/<name>/design.md` 或 `tasks.md`，以關鍵字判斷：

- 含有 `UI`、`前端`、`畫面`、`介面`、`component`、`頁面`、`style`、`layout` → **UI change**
- 只修改 `docs/` 且無程式碼變更 → **doc-only**
- 其他 → **logic change**

### 步驟 B：掃描證據文件

| Gate 項目 | 掃描路徑 | 判斷方式 |
|-----------|---------|----------|
| proposal | `openspec/changes/<name>/proposal.md` | 檔案存在 |
| design | `openspec/changes/<name>/design.md` | 檔案存在 |
| spec | `openspec/changes/<name>/spec.md` | 檔案存在 |
| tasks | `openspec/changes/<name>/tasks.md` | 存在且所有 `- [ ]` 已改為 `- [x]` |
| ui-review | `docs/uiux/` | 目錄下存在含 `<change-name>` 且 `ui-review` 的 .md 檔案 |
| ux-review | `docs/uiux/` | 目錄下存在含 `<change-name>` 且 `ux-review` 的 .md 檔案 |
| smoke | `docs/qa/` | 目錄下存在含 `<change-name>` 或 `smoke` 的 .md 檔案 |

### 步驟 C：依 Gate Matrix 輸出結果表格

**Gate Matrix（change type 決定必填欄位）：**

| change type | ui-review | ux-review | smoke |
|------------|-----------|-----------|-------|
| ui | 必需 | 必需 | 必需 |
| logic | — 不適用 | — 不適用 | 必需 |
| doc-only | — 不適用 | — 不適用 | — 不適用 |

輸出格式：

```
## 品質閘確認（Change: <name>）— <change-type>

| 項目      | 狀態 | 說明 |
|-----------|------|------|
| proposal  | ✅/❌ | 路徑或「未找到」 |
| design    | ✅/❌ | ... |
| spec      | ✅/❌ | ... |
| tasks     | ✅/❌ | N/N 完成 |
| ui-review | ✅/❌/— | 路徑、「未找到」或「不適用」 |
| ux-review | ✅/❌/— | ... |
| smoke     | ✅/❌/— | ... |
```

**若有 ❌：**
- 列出缺少的 Gate 項目與對應補齊指令（`#ui-review` / `#ux-review` / `#smoke-test`）
- 本步驟為**軟閘**：展示 ❌ 但不阻擋；補齊後執行 `#opsx-archive` 時進行硬閘確認
