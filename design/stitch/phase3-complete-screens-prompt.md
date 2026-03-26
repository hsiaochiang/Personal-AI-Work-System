# Stitch Prompt — Phase 3 Complete Screens

> **使用方式**：
> 1. 確認 `STITCH_API_KEY` 環境變數已設定
> 2. 搭配 Project ID `9755679534974217108`
> 3. 每個 Screen 使用下方對應 JSON payload（`payloads/` 目錄）透過 Stitch CLI 或 web 介面傳送
> 4. 執行後下載 HTML 快照並存入 `design/stitch/snapshots/2026-03-26/`

---

## Project ID

```
9755679534974217108
```

---

## 全域設計規則（所有頁面通用）

- 設計語言沿用既有頁面風格（Slate Nexus Design System）
- 全部可見文字使用**台灣常用正體中文（繁中）**
- 禁止簡體中文；禁止任何亂碼（如：蝜葉、?∟???）
- 保留英文不翻譯的術語：S1–S9、Phase 0–5、V1/V1.5/V2、GO/NO-GO、strict validate、archive、runlog、handoff、markdown
- 每頁必須包含四種狀態變體：載入中 / 目前沒有資料 / 發生錯誤 / 沒有權限
- 頂部導覽列固定：`儀表板` / `工作區` / `分析` / `治理`
- 左側 Sidebar 固定項目：`第三階段 MVP` / `專案列表` / `路線圖` / `驗證` / `決策日誌`

---

## Screen 1（調整）：專案總覽

> **調整目的**：將 mock data 從通用多專案替換為 Personal AI Work System 的實際 OpenSpec change 資料語意

### 調整項目
1. 工作區名稱改為「個人 AI 工作系統」
2. KPI 數值對齊實際語意：
   - 目前階段：Phase 3（V2 輕量 UI 工作台）
   - S8/S9 關卡：S8 ✅ archive、S9 進行中
   - 進行中阻塞項：0
   - 最近驗證：phase9 strict validate PASS
3. 篩選器標籤改為：全部 / 進行中 / 已完成 / 已歸檔
4. 清單列改為各 OpenSpec Change（S1–S9），欄位：
   - 變更名稱（Change）
   - 版本（Version）
   - 關卡（Gate）
   - 驗證（Validate）
   - 對應 Phase
   - 狀態（進行中 / 已完成 / 已歸檔）
   - 最後更新

### Mock Data（替換原有）

```
S1 phase1-entrypoint-guidance-pilot          V1     ✅ GO    PASS  Phase 1  已歸檔
S2 phase2-semi-auto-memory-extraction-mvp    V1     ✅ GO    PASS  Phase 1  已歸檔
S3 phase3-real-project-validation            V1     ✅ GO    PASS  Phase 1  已歸檔
S4 phase4-v1-convergence-finalization        V1     ✅ GO    PASS  Phase 1  已歸檔
S5 phase5-v2-lightweight-ui-workbench-mvp   草案   ✅ GO    PASS  Phase 3  已歸檔（概念驗證）
S6 phase6-v3-multi-tool-integration-framework V3   ✅ GO    PASS  Phase 5  已歸檔（概念驗證）
S7 phase7-v4-governance-automation-mvp       V4     ✅ GO    PASS  —        已歸檔
S8 phase8-v1.5-stabilization-mvp            V1.5   ✅ GO    PASS  Phase 2  已歸檔
S9 phase9-v2-lightweight-ui-workbench-mvp   V2     🔵 進行中 PASS  Phase 3  進行中
```

---

## Screen 2（調整）：專案詳情

> **調整目的**：將資料語意從「Project Alpha 技術指標」改為「OpenSpec Change 工作流程資訊」

### 調整項目
1. 頁面標題改為「S9：V2 輕量 UI 工作台（phase9-v2-lightweight-ui-workbench-mvp）」
2. 移除「R2/R3/R4 技術指標」，改為「驗收準則進度」（5 項 AC 對應 Phase 3 工作項目）：
   - AC1 UI MVP 設計與資料來源契約：未開始
   - AC2 專案總覽與專案頁：進行中
   - AC3 Handoff Builder：未開始
   - AC4 候選審核介面：未開始
   - AC5 Memory Review 介面：未開始
3. Blockers 表格內容改為 OpenSpec 流程相關（如：資料來源契約未確定、草稿輸出路徑待確認）
4. Runlog Timeline 改為 `docs/runlog/` 實際格式（日期 + 摘要 + 結果）
5. 決策日誌 改為 `docs/decision-log.md` 語意

### Mock Data（替換原有）

```
驗收進度：1/5 進行中
阻塞：1 待處理（草稿輸出路徑未確認）
Runlog: 2026-03-26 Phase 3 規劃啟動 → PASS
         2026-03-26 S8 archive → PASS
         2026-03-26 Phase 2 Review Gate → GO
         2026-03-26 S7 Cycle-06 → PASS
         2026-03-26 Phase 2 strict validate → PASS
決策：先靜態 HTML 再評估框架 / docs-first 原則 / draft-only 輸出
```

---

## Screen 3（新增）：Handoff Builder

> **功能**：從 `docs/handoff/current-task.md` 讀取並提供可編輯的草稿介面

### 版面結構
- 頂部：頁面標題「交接文件建構器」＋ Badge（目前任務名稱）＋「匯出草稿」按鈕
- 左側（60%）：可編輯表單，分段折疊
- 右側（40%）：即時預覽（markdown 渲染）

### 表單分段（對應 current-task.md 欄位）
1. **任務資訊**（Task）
   - 名稱（必填）
   - 負責 Agent
   - 開始日期 / 最後更新日期
   - 相關規格
   - 分支／工作樹
2. **目標**（Goal）：多行文字，必填
3. **範圍**（Scope）
   - In Scope（逐行清單，必填）
   - Out of Scope（逐行清單，必填）
4. **已完成**（Done）：可勾選清單，支援新增 / 刪除
5. **進行中**（In Progress）：文字欄位
6. **下一步**（Next Step）：文字欄位，必填
7. **驗證狀態**（Validation Status）：逐行清單
8. **證據路徑**（Evidence Paths）：逐行清單

### 驗證規則
- 必填欄位（名稱、目標、範圍、下一步）缺失時，「匯出草稿」按鈕 disabled 並顯示提示
- 未儲存變更時，離開頁面前顯示確認對話框

### Mock Data

```
任務名稱：phase9-v2-lightweight-ui-workbench-mvp（規劃中）
目標：依 docs/roadmap.md 推進 Phase 3 UI MVP
In Scope：五項 UI 功能規格化 / docs-first 證據同步
Out of Scope：後端 API / 資料庫 / 使用者認證
下一步：確認設計稿後執行 Task 1.1 資料來源契約
已完成：change artifacts 建立 / strict validate PASS
進行中：設計稿補全
```

### 狀態變體
- 載入中：欄位骨架 Loading skeleton
- 目前沒有資料：顯示「尚無進行中任務，請先建立 change」＋「建立 Change」按鈕
- 發生錯誤：顯示讀取 current-task.md 失敗訊息＋重試按鈕
- 草稿已匯出：頂部綠色 Banner「草稿已儲存至 design/stitch/drafts/handoff-draft.md」

---

## Screen 4（新增）：候選審核介面

> **功能**：從 `docs/memory/skill-candidates.md` 讀取候選項目，提供採用 / 拒絕決策

### 版面結構
- 頂部：頁面標題「候選審核」＋進度統計（x / y 已審核）＋篩選器（全部 / 待審核 / 已採用 / 已拒絕）
- 主體：候選卡片清單（每頁 20 筆）
- 底部：批次操作（全選 / 批次採用 / 批次拒絕）

### 候選卡片欄位
- 候選摘要（主標題，粗體）
- 分類 Badge（輸出模式 / 偏好規則 / 任務模式 / 技能候選）
- 來源（例：session 2026-03-26 / runlog）
- 信心分數（High / Medium / Low）
- 原始段落（可展開，預設折疊）
- 操作按鈕：`採用` / `拒絕`（拒絕需填理由）
- 狀態 Badge（待審核 / 已採用 / 已拒絕）

### 採用流程
- 點擊「採用」→ 選擇寫入目標（`docs/memory/output-patterns.md` / `preference-rules.md` / `task-patterns.md`）→ 確認 → 顯示成功 Toast

### 拒絕流程
- 點擊「拒絕」→ 彈出「拒絕原因」輸入框（必填）→ 確認 → 狀態更新為已拒絕

### Mock Data（6 筆候選）

```
1. [技能候選] 使用 strict validate 作為每個 change 的必要關卡  
   信心：High｜來源：S7 執行記錄｜待審核

2. [輸出模式] 五段固定報告格式（Current state/Changes made/Validation/Open issues/Next step）
   信心：High｜來源：S7 契約文件｜待審核

3. [偏好規則] 不得在未確認的情況下 commit/push
   信心：High｜來源：safe continuation guardrails｜已採用

4. [任務模式] 每個子任務完成後立即更新 tasks.md [x] 勾選
   信心：Medium｜來源：S8 執行觀察｜待審核

5. [技能候選] docs/handoff/current-task.md 作為 session 起點必讀文件
   信心：High｜來源：AGENTS.md 先讀順序｜已採用

6. [偏好規則] 設計稿以真實資料語意為準，不使用通用 mock data
   信心：Medium｜來源：Phase 3 設計回顧｜待審核
```

### 狀態變體
- 載入中：卡片 Skeleton
- 目前沒有資料：「目前沒有待審核候選，請先執行提取流程」＋「前往提取流程」按鈕
- 發生錯誤：讀取 skill-candidates.md 失敗＋重試按鈕
- 全部審核完成：綠色 Banner「所有候選已審核完畢（X 採用 / Y 拒絕）」

---

## Screen 5（新增）：Memory Review 介面

> **功能**：從 `docs/memory/` 讀取各類記憶檔案，提供分類檢視與標記操作

### 版面結構
- 頂部：頁面標題「記憶審查」＋搜尋欄
- 左側（25%）：分類導覽 Sidebar（對應 docs/memory/ 各檔案）
- 右側（75%）：條目清單（選中分類的內容）

### 分類導覽（對應真實檔案）
- 📋 決策日誌（`decision-log.md`）
- 🎯 輸出模式（`output-patterns.md`）
- ⚙️ 偏好規則（`preference-rules.md`）
- 🧩 專案背景（`project-context.md`）
- 💡 技能候選（`skill-candidates.md`）
- 🔄 任務模式（`task-patterns.md`）

### 條目卡片欄位
- 標題（條目摘要）
- 分類 Badge
- 最後更新日期
- 使用次數（已套用幾次）
- 操作：`標記更新` / `新增備註` / `旗標`

### 統計面板（頂部）
- 總條目數 / 本月新增 / 待更新 / 已旗標

### Mock Data

```
分類：偏好規則（6 條）
1. 回覆偏好：先給可執行結論，再補必要選項 — 套用 12 次 — 2026-03-22
2. 不反覆要求按「繼續」 — 套用 8 次 — 2026-03-25
3. 一律使用正體中文回覆 — 套用 15 次 — 2026-03-14
4. Smallest Safe Change 優先 — 套用 10 次 — 2026-03-24
5. commit log 使用繁中（含 What/Why/Impact/Evidence）— 套用 6 次 — 2026-03-24
6. 每個 task 完成後立即打 [x] — 套用 5 次 — 2026-03-26

分類：輸出模式（4 條）
1. 五段報告格式 — 套用 9 次 — 2026-03-26（待更新）
2. 治理留痕三層：runlog / handoff / qa — 套用 7 次 — 2026-03-25
3. strict validate 每次必跑 — 套用 11 次 — 2026-03-24
4. 變更超過 5 個檔案先記錄決策 — 套用 3 次 — 2026-03-26（已旗標）
```

### 狀態變體
- 載入中：分類 Sidebar + 條目轉動
- 目前沒有資料：「此分類尚無條目，請先執行建立流程」
- 發生錯誤：讀取 docs/memory/ 失敗＋重試按鈕
- 搜尋無結果：「找不到符合「XXX」的條目」＋清除搜尋按鈕

---

## 執行方式

### 方式 A：Stitch Web 介面
1. 前往 Stitch 專案（ID: `9755679534974217108`）
2. 對每個 Screen，複製對應段落中的提示詞
3. 點擊「Edit」或「Add Screen」貼入

### 方式 B：CLI（需先確認 Bun 環境）
```powershell
$env:STITCH_API_KEY = (Get-Content ".roo/mcp.json" -Raw | ConvertFrom-Json).mcpServers.stitch.env.STITCH_API_KEY
npx -y @_davideast/stitch-mcp screens --help
```

### 方式 C：JSON Payload（個別 Screen）
見 `design/stitch/payloads/` 目錄下各 JSON 檔案

---

## 快照下載後存放位置

```
design/stitch/snapshots/2026-03-26/
  overview_<screenId>.html
  detail_<screenId>.html
  handoff-builder_<screenId>.html
  candidate-review_<screenId>.html
  memory-review_<screenId>.html
```
