# Planning（版本規劃）

> 此目錄存放各版本的 Version Brief（版本確認書）。

## 用途
- 每個版本一份 brief，回答「這一版到底要做什麼、不做什麼、怎樣才算完成」
- 取代獨立的需求確認書，在 brief 內含「使用者確認」區段
- 與 `docs/roadmap.md` 搭配使用：roadmap 管全貌，brief 管這一版

## 開版前置流程
開新版本前，應先完成：
1. **Backlog 評審**：`docs/product/backlog.md` → 確認「下版納入」清單
2. **Inbox 整理**：`docs/product/inbox/` → 新增需求已評審並移入 backlog
3. 詳細節奏見 `docs/guides/iteration-cadence.md`

## 檔案命名
- `v1-brief.md`、`v2-brief.md`、`v3-brief.md`……

## Version Brief 結構

```markdown
# V{N} Brief — {版本代號或標題}

## 版本目標
## 背景與動機
## In Scope
## Out of Scope（留到後續版本）
## 完成條件（Acceptance Criteria）
## 預計拆分的 Changes
## 跨版本影響
## 使用者影響與 Manual Sync
- 使用者可見影響：有 / 無
- 影響摘要：
- 需同步更新的 system-manual 區段：
- 備註（若無影響，需寫 No user-facing change 原因）：
## 使用者確認
- 確認日期：
- 確認人：
- 確認範圍：全部 / 部分
- 備註：
## 版本狀態
- 開始日期：
- 完成日期：
- 狀態：規劃中 / 進行中 / 已完成
```

## 預計拆分的 Changes 表格格式

Changes 表格為 **5 欄**，所有欄位必填：

| 欄位 | 必填 | 內容要求 |
|------|------|----------|
| **Change 名稱** | ✅ | kebab-case，一看就知道做什麼 |
| **使用者故事** | ✅ | 一句話：「身為 ___，我想 ___，以便 ___」——使用者觀點，非技術觀點 |
| **狀態** | ✅ | 未開始 / 規劃中 / 進行中 / 已完成 / 已歒檔 |
| **備註** | ✅ | 技術描述：做什麼、改哪些元件、交付物（開發不需臆測的詳細度） |
| **使用方式** | ✅ | 一行可執行指令或操作路徑：使用者怎麼觸發 / 使用這個功能 |

**模板範例：**

```markdown
| Change 名稱 | 使用者故事 | 狀態 | 備註 | 使用方式 |
|---|---|---|---|---|
| `change-name` | 身為模板使用者，我想 ___，以便 ___ | 未開始 | 技術操作描述：新增 / 修改 / 移除哪些元件 | `python bootstrap_copilot_workspace.py --xxx` |
```

**實際範例（V3）：**

```markdown
| Change 名稱 | 使用者故事 | 狀態 | 備註 | 使用方式 |
|---|---|---|---|---|
| `doctor-command-agent-ready-check` | 身為模板使用者，我想在初始化前一鍵檢查環境就緒狀態，以便在流程中段前發現缺少的工具 | 已完成 | `doctor_workspace()` 6 項檢查（Python/Git/寫入權限/Node/OpenSpec/編碼），PASS/WARN/FAIL 輸出，FAIL 時 exit 2 並附修復建議 | `python bootstrap_copilot_workspace.py --doctor --root <path>` |
```

## 三層規劃關係
| 層級 | 文件 | 回答的問題 |
|------|------|-----------|
| L0 全貌 | `docs/roadmap.md` | 產品方向、版本地圖、目前位置 |
| L1 版本 | `docs/planning/v{N}-brief.md` | 這一版核心問題、scope、完成條件 |
| L2 變更 | `openspec/changes/<name>/` | 這一次具體改什麼、怎麼驗收 |

## 規劃交付 Gate（必做）
- 當 `docs/planning/v{N}-brief.md`、`docs/roadmap.md`、`docs/handoff/current-task.md` 任一檔案被異動時：
  - 必須同步更新 `docs/system-manual.md` 的 Planning Impact Log
  - 若尚無使用者可見能力變更，也要寫明 `No user-facing change`
- 沒完成上述同步，不得宣稱規劃交付完成

## 分類
- 此目錄為 **init-only**：模板初始化時建立骨架，後續 upgrade 不追蹤
