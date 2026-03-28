# Roadmap

> 唯一路線圖。回答：「這個專案要做什麼？做到哪？下一步？」
>
> **Done = 使用者可以做到什麼新的事**，不是「產出了什麼文件」。

## 願景

從 markdown 驅動的工作流，成長為跨工具的「個人 AI 工作台」——具備專案記憶、對話交接、知識沉澱、輕量 UI、多工具接入能力。

## 產品路線

> Phase 1–5 完成 = V1 完整產品。優先順序以「核心價值閉環」為導向，不以頁面完整度為導向。

| Done | Phase | 做完後你可以… | 核心價值 | 狀態 |
|:----:|:-----:|-------------|---------|:----:|
| [x] | Spec | 規格與設計完成（docs-only，不可操作） | — | ✅ |
| [x] | 1 | 在瀏覽器看到 roadmap 進度和當前任務 | 基礎檢視 | ✅ |
| [x] | 2 | 在 UI 產生 handoff 草稿，複製貼到新 AI 對話 | 降低啟動摩擦 | ✅ |
| [x] | 3 | 貼上對話 → 產生候選 → 審核 → 寫回記憶 | 知識閉環 | ✅ |
| [x] | 4 | 集中檢視決策與規則，搜尋篩選 | 決策追蹤 | ✅ |
| [ ] | 5 | 多專案切換 + 完整 UI polish | 規模化 | **← 下一步** |

> **這就是全部。沒有隱藏的 Phase。** Phase 1–5 完成即為 V1 完整產品。
>
> **核心閉環**：handoff（Phase 2）→ extraction + review + writeback（Phase 3）是最重要的兩個 Phase。
> 完成它們之前，不投入大量 UI polish、多專案、多工具 adapter。

## 目前狀態

- **可用程度**：Phase 1–4 全部可用（`cd web && npm start` → http://localhost:3000）
- **下一步**：Phase 5 — 多專案 + UI 完整化
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

### Phase 2：Handoff Builder — 降低新對話啟動摩擦

**做完後你可以：** 在 UI 選擇 handoff 類型，載入現有內容或模板，編輯欄位，預覽 markdown，一鍵複製到剪貼簿，直接貼進新 AI 對話。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Handoff 頁面 — 選擇類型（規劃/實作/整合） | 點擊類型切換模板 |
| 2 | 載入現有 current-task.md 或模板基線 | 欄位自動填入現有值 |
| 3 | 可編輯欄位 | 修改任一欄位 → 預覽即時更新 |
| 4 | Markdown 預覽（右側即時顯示） | 預覽區顯示完整 markdown |
| 5 | 複製到剪貼簿 | 點「複製」後可直接貼進 AI 對話 |

**前置：** Phase 1 已完成

---

### Phase 3：知識閉環 — 提取 + 審核 + 寫回

**做完後你可以：** 貼上一段 AI 對話，系統產生候選知識，你在 UI 審核（採用/編輯/忽略），採用的候選自動寫回 `docs/memory/*.md`。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 對話輸入入口（文字貼上 + 檔案匯入） | 貼上對話後出現候選清單 |
| 2 | 啟發式提取引擎（識別 4 類：背景/偏好/模式/決策） | 候選自動標注分類 |
| 3 | 候選審核 UI（接受/編輯/忽略） | 操作後狀態改變 |
| 4 | 寫回 `docs/memory/*.md` | 採用後對應檔案確實更新 |
| 5 | Memory 頁重新整理後顯示新內容 | 重整頁面看到新寫入的條目 |

**前置：** Phase 2 已完成（但技術上可平行開發）

---

### Phase 4：決策與規則集中檢視

**做完後你可以：** 在 Decisions 頁瀏覽、搜尋所有已定案決策；在 Rules 頁檢視偏好規則與模式。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Decisions 頁 — 決策清單 + 搜尋 | 輸入關鍵字可篩選決策 |
| 2 | Rules 頁 — 偏好/輸出模式/任務模式 分類檢視 | 標籤切換可看不同分類 |
| 3 | 基本衝突提示 | 矛盾的規則有高亮標記 |

**前置：** Phase 3 的寫回機制已可用

---

### Phase 5：多專案 + UI 完整化

**做完後你可以：** 管理多個專案，在 Projects Hub 聚合狀態，完整的設計稿品質 UI。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 專案設定檔支援多個根目錄 | 設定 2+ 個路徑後重啟 |
| 2 | Projects Hub — 多專案卡片 + 狀態 | 兩個專案都正確顯示 |
| 3 | 專案切換 | 點擊後所有頁面切換為該專案 |
| 4 | 頂部 tab 導覽 + 側邊欄副導覽 | 對齊設計稿的導覽結構 |
| 5 | 完整 Loading / Error / Empty 狀態 | 各狀態正確顯示 |
| 6 | 全域搜尋 | 可搜尋所有資料 |

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

- 2026-03-28：**Phase 4 實作完成** — 決策與規則集中檢視頁面上線（决策記錄 tab + 規則 tab + 搜尋 + 衝突偵測）
- 2026-03-28：**Phase 2+3 實作完成** — Handoff Builder MVP + 知識閉環 MVP 實作上線；新增 5 個檔案（handoff.html/js、extract.html/js、API 端點）；全部 6 項驗收標準通過
- 2026-03-28：**優先順序校準** — 核心閉環（handoff + extraction + review + writeback）提前至 Phase 2-3；UI polish 與多專案延後至 Phase 5；依據 `docs/planning/2026-03-28_project-assessment-and-recommendations.md`
- 2026-03-27：**roadmap 重建** — 重新定位之前所有工作為 Spec Phase；新建以可操作功能為導向的 Phase 1–5；每 Phase 定義使用者驗收標準
- 2026-03-27：Phase 5 (V3) 全部完成並 archive（`phase11-v3-multi-tool-integration-mvp`）
- 2026-03-27：Phase 4 (V2.5) 全部完成並 archive（`phase10-v2.5-multi-project-shared-capability-mvp`）
- 2026-03-26：Phase 3 (V2) / Phase 2 (V1.5) 全部完成並 archive
- 2026-03-24–25：Phase 0–1 完成

