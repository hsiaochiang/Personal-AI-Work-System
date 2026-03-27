# Roadmap

> 唯一路線圖。回答：「這個專案要做什麼？做到哪？下一步？」
>
> **Done = 使用者可以做到什麼新的事**，不是「產出了什麼文件」。

## 願景

從 markdown 驅動的工作流，成長為跨工具的「個人 AI 工作台」——具備專案記憶、對話交接、知識沉澱、輕量 UI、多工具接入能力。

## 產品路線

| Done | Phase | 使用者做得到的事 | 狀態 |
|:----:|-------|-----------------|:----:|
| [x] | Spec | 規格與設計完成：工作流規則、模板、UI 設計稿、資料契約（全部 docs-only，不可操作） | ✅ |
| [x] | 1 | 在瀏覽器看到自己專案的真實 roadmap 進度與當前任務 | ✅ |
| [ ] | 2 | 在瀏覽器編輯 handoff 交接草稿，並存成本地檔案 | **← 下一步** |
| [ ] | 3 | 從對話紀錄半自動提取候選知識，在 UI 審核並存成草稿 | 未開始 |
| [ ] | 4 | 支援多專案切換，在儀表板聚合多個專案狀態 | 未開始 |
| [ ] | 5 | 接入多工具（Copilot/Codex/Gemini）輸出，統一格式並去重 | 未開始 |

> **這就是全部。沒有隱藏的 Phase。** 每個 Phase 結束時使用者都有新的可操作能力。

## 目前狀態

- **可用程度**：Phase 1 儀表板已可使用（`cd web && npm start` → http://localhost:3000）
- **下一步**：Phase 1 驗收 → Phase 2 規劃（Handoff Builder 編輯功能）
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

### Phase 2：編輯交接草稿

**使用者驗收標準：** 在 Handoff Builder 頁面填寫表單，點「儲存草稿」後本地產生 markdown 檔案。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Handoff Builder 表單介面 | 開啟頁面可看到結構化表單 |
| 2 | 載入現有 current-task.md 的內容到表單 | 表單欄位自動填入現有值 |
| 3 | 草稿輸出（存到 `design/stitch/drafts/`） | 點儲存後檢查本地出現新 .md 檔案 |
| 4 | 候選審核介面 — 候選卡片 + 採用/拒絕 | 對 memory 候選做決策後產生審核草稿 |

**前置：** Phase 1 的 dev server + markdown 解析已可用

---

### Phase 3：半自動提取

**使用者驗收標準：** 貼上一段 AI 對話紀錄，系統自動產生候選知識條目，在 UI 審核。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 提取入口（文字貼上或檔案匯入） | 貼上對話後出現候選清單 |
| 2 | 規則引擎（依 extraction-rules-v1 實作） | 候選自動標注分類（偏好/模式/決策等）|
| 3 | 候選審核 + 草稿寫入 | 審核後草稿檔出現在指定路徑 |
| 4 | Memory Review 頁面 — 分類瀏覽與審核 | 能在 UI 瀏覽所有記憶分類 |

---

### Phase 4：多專案

**使用者驗收標準：** 設定多個專案根目錄，在儀表板看到所有專案的聚合狀態。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 專案設定檔（json/yaml）支援多個根目錄 | 設定 2+ 個路徑後重啟 |
| 2 | 儀表板聚合視圖 | 看到兩個專案的 Phase 進度 |
| 3 | 專案切換 | 點擊切換後 handoff/memory 顯示該專案 |

---

### Phase 5：多工具接入

**使用者驗收標準：** 從不同 AI 工具的輸出匯入候選，系統自動去重與評分。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Adapter 實作（Copilot/Codex/Gemini） | 匯入不同格式的對話紀錄皆能解析 |
| 2 | 去重邏輯 | 兩工具產出相同候選時自動合併 |
| 3 | 信心評分顯示 | 候選清單含分數排序 |
| 4 | 跨工具比較視圖 | 可 side-by-side 查看不同工具的候選 |

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

