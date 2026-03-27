# Roadmap

> 唯一路線圖。回答：「這個專案要做什麼？做到哪？下一步？」
>
> **Done = 使用者可以做到什麼新的事**，不是「產出了什麼文件」。

## 願景

從 markdown 驅動的工作流，成長為跨工具的「個人 AI 工作台」——具備專案記憶、對話交接、知識沉澱、輕量 UI、多工具接入能力。

## 產品路線

> Phase 1–5 完成 = V1 完整產品。不是 MVP，是整個產品。之後若有需要才會有 V2。

| Done | Phase | 做完後你可以… | 對應頁面 | 狀態 |
|:----:|:-----:|-------------|---------|:----:|
| [x] | Spec | 規格與設計完成（docs-only，不可操作） | — | ✅ |
| [x] | 1 | 在瀏覽器看到 roadmap 進度和當前任務 | Overview + Task | ✅ |
| [ ] | 2 | 用設計稿品質的 UI 看到完整專案狀態 | Overview 重做 + Detail | **← 下一步** |
| [ ] | 3 | 審核記憶候選（採用/拒絕），決策集中瀏覽 | Memory Review + Decisions | 未開始 |
| [ ] | 4 | 支援多專案切換，儀表板聚合多個專案狀態 | Projects Hub | 未開始 |
| [ ] | 5 | 半自動從對話提取候選知識 | Extraction Engine | 未開始 |

> **這就是全部。沒有隱藏的 Phase。** Phase 1–5 完成即為 V1 完整產品。

## 目前狀態

- **可用程度**：Phase 1 基礎儀表板已可使用（`cd web && npm start` → http://localhost:3000）
- **下一步**：Phase 2 — 用設計稿品質重做 UI（頂部導覽 + 側邊欄 + 搜尋 + KPI + Detail 頁）
- **Blockers**：無

---

## Phase 詳情

### Spec Phase（規格層）✅ 已完成

> 這是之前 Phase 0–5 的所有工作。重新定位為「規格層」——產品的設計藍圖，不是產品本身。

**交付物（docs-only，不可操作）：**

| 類別 | 份數 | 說明 |
|------|:----:|------|
| 工作流規格 | 17 | 提取流程、規則、adapter、schema、dedupe、評分等 |
| 模板集 | 9 | handoff/runlog/roadmap/decision-log 初始化模板 |
| 產品規格 | 5 | UI 願景、資訊架構、儀表板規格、比較視圖規格 |
| UI 設計稿 | 5 頁 | Stitch 生成的靜態 HTML（硬編碼 mock 資料） |
| 實作說明 | 4 | overview/handoff-builder/candidate-review/memory-review 的欄位映射與解析邏輯 |
| QA 記錄 | 7 | smoke test 記錄 |
| OpenSpec archives | 12 | change lifecycle 完整記錄 |

> 所有規格細節：`docs/workflows/`、`docs/product/`、`design/stitch/drafts/`

---

### Phase 1：看到自己的專案

**使用者驗收標準：** 在瀏覽器打開一個頁面，看到從本地 markdown 讀出的真實資料。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 本地 dev server（`npm start` 一鍵啟動） | 執行後瀏覽器自動開啟 |
| 2 | 專案總覽頁 — 顯示 roadmap.md 的 Phase 進度 | 修改 roadmap.md，重整後畫面更新 |
| 3 | 當前任務頁 — 顯示 handoff/current-task.md | 修改 current-task.md，重整後畫面更新 |
| 4 | 記憶清單頁 — 顯示 docs/memory/ 下所有條目 | 新增一條 memory，重整後出現 |

**技術選型：**
- 純靜態 HTML + vanilla JS（無框架、無 build）
- 本地 dev server 使用 Node.js（`npx serve` 或自訂 server.js）
- Markdown 解析使用輕量 library（如 marked.js）
- 設計稿基線：`design/stitch/snapshots/` 的 HTML/CSS

---

### Phase 2：設計稿品質的完整 UI

**做完後你可以：** 用頂部 tab 導覽切換不同區域，在側邊欄看到副導覽，用搜尋找資料，專案詳情頁完整呈現 AC 進度、Blocker、Decision Log、Runlog。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 頂部 tab 導覽（儀表板/工作區/分析/治理） | 點擊 tab 可切換區域 |
| 2 | 側邊欄副導覽（專案列表/路線圖/驗證/決策日誌） | 點擊可切換子頁面 |
| 3 | 全域搜尋欄 | 輸入關鍵字可搜尋 roadmap、memory、decisions |
| 4 | Overview 頁重做 — 對齊設計稿（KPI Bento Grid、Change 表格、篩選 tab） | 資料正確、視覺對齊設計稿 |
| 5 | Detail 頁 — AC 進度、Blocker 卡片、Decision Log、Runlog Timeline | 顯示真實資料 |
| 6 | Loading / Error / Empty 完整狀態 | 拔掉檔案後顯示 Error、空資料夾顯示 Empty |
| 7 | 資料自動重載（修改 md → 頁面自動更新） | 改檔案後不用手動按重整 |

**前置：** Phase 1 已完成

---

### Phase 3：記憶審核 + 決策追蹤

**做完後你可以：** 在 Memory Review 頁面逐條審核記憶候選（採用/拒絕/修改），在 Decisions 頁面瀏覽、搜尋所有已定案決策。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Memory Review 頁 — 分類瀏覽（偏好/模式/決策/背景/候選/任務） | 側邊分類 tab 可切換，計數正確 |
| 2 | 候選審核操作 — 採用/拒絕按鈕 + 拒絕原因 | 操作後狀態改變，草稿輸出到指定路徑 |
| 3 | 衝突偵測 — 新候選與既有規則矛盾時高亮顯示 | 衝突卡片有「解決衝突」按鈕 |
| 4 | Decisions 頁 — 決策清單集中瀏覽 + 搜尋 | 輸入關鍵字可篩選決策 |
| 5 | Rules 頁 — 偏好規則、輸出模式、任務模式集中檢視 | 5 個標籤切換 |

**前置：** Phase 2 的導覽 + 搜尋基礎已可用

---

### Phase 4：多專案支援

**做完後你可以：** 設定多個專案根目錄，在 Projects Hub 看到所有專案聚合狀態，點擊切換。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 專案設定檔支援多個根目錄 | 設定 2+ 個路徑後重啟，看到多專案 |
| 2 | Projects Hub — 多專案卡片 + 狀態 + 最近更新 | 兩個專案都正確顯示 |
| 3 | 專案切換 | 點擊後 handoff/memory/decisions 切換為該專案 |
| 4 | 專案初始化 wizard | 新建專案時自動建立 docs 資料夾結構 |

**前置：** Phase 2-3 的 UI + 審核機制已穩定

---

### Handoff Builder（延後實作，依使用者需求排入）

> 使用者確認 handoff 可延後。若需要時可在任意 Phase 之後加入。

**做完後你可以：** 在 UI 填寫交接表單，即時預覽 markdown，一鍵輸出 handoff 草稿。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Handoff Builder 表單（左右分割 + Markdown 預覽） | 填寫後右側即時更新預覽 |
| 2 | 載入現有 current-task.md 內容 | 表單自動填入現有值 |
| 3 | 草稿儲存 | 點儲存後本地出現 .md 檔案 |

---

### Phase 5：半自動提取引擎

**做完後你可以：** 貼上 AI 對話紀錄（Copilot/Codex/Gemini），系統自動產生候選知識條目，在 UI 審核後寫入記憶。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 提取入口（文字貼上 + 檔案匯入） | 貼上對話後出現候選清單 |
| 2 | Adapter 實作（3 種工具格式解析） | 不同工具的對話格式都能解析 |
| 3 | 規則引擎（依 extraction-rules 自動分類 + 信心評分） | 候選自動標注分類和分數 |
| 4 | 去重邏輯 | 同一知識從不同工具提取不會重複 |
| 5 | 審核 → 寫入記憶檔 | 採用後自動寫入對應 docs/memory/*.md |

---

## 推進原則

- **每個 Phase 交付可用功能**，不接受 docs-only 標記完成
- **Done = 使用者可操作**，不是「文件已撰寫」
- **每個交付物有明確驗收方式**，使用者自己能驗證
- 規格已完成，直接進入實作，不再新增規格 Phase
- 若某 Phase 原定功能太大，縮小 scope 但仍交付可用子集

---

## Spec Phase 歸檔

> 以下記錄之前 Phase 0–5（全部 docs-only）的 OpenSpec change 歷史。
> 這些是產品的設計藍圖，但不等於產品功能交付。

<details>
<summary>OpenSpec Change Archive（12 個，全部已 archive）</summary>

| # | Change | 日期 | 性質 |
|:-:|--------|------|------|
| S1 | phase1-entrypoint-guidance-pilot | 2026-03-24 | 手動流程 pilot |
| S2 | phase2-semi-auto-memory-extraction-mvp | 2026-03-25 | 半自動提取規格 |
| S3 | phase3-real-project-validation | 2026-03-25 | 真實專案驗證 |
| S4 | phase4-v1-convergence-finalization | 2026-03-25 | 收斂定版 |
| S5 | phase5-v2-lightweight-ui-workbench-mvp | 2026-03-26 | UI 規格草案 |
| S6 | phase6-v3-multi-tool-integration-framework-mvp | 2026-03-26 | 多工具框架草案 |
| S7 | phase7-v4-autonomous-continuation-governance-automation-mvp | 2026-03-26 | 治理自動化 |
| S8 | phase8-v1.5-stabilization-mvp | 2026-03-26 | 穩定化 |
| S9 | phase9-v2-lightweight-ui-workbench-mvp | 2026-03-26 | UI 實作說明 |
| S10 | phase10-v2.5-multi-project-shared-capability-mvp | 2026-03-27 | 多專案規格 |
| S11 | phase11-v3-multi-tool-integration-mvp | 2026-03-27 | 多工具規格 |

</details>

---

## 異動記錄

- 2026-03-27：**roadmap 重建** — 重新定位之前所有工作為 Spec Phase；新建以可操作功能為導向的 Phase 1–5；每 Phase 定義使用者驗收標準
- 2026-03-27：Phase 5 (V3) 全部完成並 archive（`phase11-v3-multi-tool-integration-mvp`）
- 2026-03-27：Phase 4 (V2.5) 全部完成並 archive（`phase10-v2.5-multi-project-shared-capability-mvp`）
- 2026-03-26：Phase 3 (V2) / Phase 2 (V1.5) 全部完成並 archive
- 2026-03-24–25：Phase 0–1 完成

