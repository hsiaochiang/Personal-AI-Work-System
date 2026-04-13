# V3 跨工具比較視圖規格 v1

> Phase 5（V3 多工具接入）產出。相關 change：`phase11-v3-multi-tool-integration-mvp`
> 性質：docs-only，不實作前端 UI。UI 實作延後至 Phase 6。

---

## 1. 資訊架構與欄位清單（Task 5.1）

### 1.1 視圖欄位定義

跨工具比較視圖（Multi-Tool Comparison View）呈現多個工具對相同或不同 `dedupe_key` 候選的各自輸出，供使用者對比審核。

| # | 欄位名稱 | 型別 | 必含 | 說明 |
|---|----------|------|:----:|------|
| 1 | **工具名**（`tool_source`） | string | ✅ | 顯示候選來源工具（`Copilot` / `Codex` / `Gemini`） |
| 2 | **來源時間**（`extracted_at`） | datetime | ✅ | 候選提取時間，格式：`YYYY-MM-DD HH:mm`（本地時間） |
| 3 | **去重鍵**（`dedupe_key`） | string | ✅ | 顯示 8 字元 hash；相同 key 的候選在視圖中歸為同一群組 |
| 4 | **可信度評分**（`confidence_score`） | integer | ✅ | 0–100；顯示數值與視覺指示（高 / 一般 / 低） |
| 5 | **狀態**（`status`） | string | ✅ | `pending` / `approved` / `skipped` / `archived`；以標籤色彩標示 |
| 6 | **候選正文**（`content`） | string | ✅ | 顯示 content 前 200 字元；可展開查看完整內容 |
| 7 | **標籤**（`tags`） | string[] | ❌ | 可選欄位；顯示語意標籤，供篩選 |

### 1.2 與 Phase 3 現有候選審核介面的邊界

- 跨工具比較視圖為**補充（Supplementary）**介面，不修改 Phase 3 現有的候選審核介面（`docs/product/` 下既有規格）。
- Phase 3 介面繼續作為單工具候選的主要審核入口；跨工具比較視圖提供「多工具橫向對比」的額外視角。
- 兩介面欄位不重疊：比較視圖新增 `tool_source`、`dedupe_key`、`confidence_score` 等 V3 欄位；Phase 3 原有欄位維持不變。

---

## 2. 比較模式與切換邏輯（Task 5.2）

### 2.1 比較模式定義

#### 模式 M1：Side-by-Side（左右並排）

**適用場景**：
- 相同 `dedupe_key` 的候選來自 ≥2 個工具，使用者需直接比較各工具的措辭差異
- 審核者需決定保留哪一個工具版本（根據 `confidence_score` 與 `content` 細節）

**展示方式**：
- 每列為一個 `dedupe_key` 群組
- 橫向展開各工具的候選欄（工具名 + confidence_score + content 前 200 字元）
- 最右側顯示「保留」操作（選擇主要候選 / 手動覆寫 status）

**前置需求**：依賴 Phase 6 UI 實作，Phase 5 docs-only 階段不模擬。

---

#### 模式 M2：聚合視圖（Aggregate）

**適用場景**：
- 使用者需全覽所有候選（含多工具）按 `confidence_score` 排序後的優先序
- 快速篩選「高分待審」或「低分跳過」候選，不需逐工具對比

**展示方式**：
- 候選以單列方式呈現（不拆開工具欄），按 `confidence_score` 降序排列
- 顯示 `tool_source` 標籤與 `dedupe_key` 前綴
- 同一 `dedupe_key` 的非主要候選自動摺疊（展開後可見 side-by-side 細節）

**前置需求**：依賴 Phase 6 UI 實作，Phase 5 docs-only 階段不模擬。

---

### 2.2 切換邏輯

**觸發條件 T1 — 自動切換**：

當視圖中 ≥1 個 `dedupe_key` 群組包含來自 ≥2 個工具的候選時，系統預設進入 **Side-by-Side 模式**，以提示使用者存在跨工具重複候選需要比較。若所有候選均來自單一工具，則預設為**聚合視圖**。

**觸發條件 T2 — 手動切換**：

使用者可透過視圖右上角的模式切換按鈕（[Phase 6 UI 前置需求]）在兩種模式間手動切換，選擇不受自動邏輯約束。

---

## 3. Phase 6 前置需求標注

以下項目依賴 Phase 6 UI 實作，**不可在 Phase 5 docs-only 下模擬或預先實作**：

| 項目 | 說明 |
|------|------|
| Side-by-Side 與聚合視圖的實際 UI 渲染 | 需前端框架建置（Phase 6 範疇） |
| 模式切換按鈕 | UI 互動元件（Phase 6 範疇） |
| content 展開/摺疊控制 | UI 互動元件（Phase 6 範疇） |
| `status` 標籤色彩標示 | UI 視覺設計（Phase 6 範疇） |
| 可信度評分視覺指示（高 / 一般 / 低 bar 或 badge） | UI 視覺設計（Phase 6 範疇） |
| 「保留」操作按鈕（手動覆寫 status） | UI 互動 + 資料寫回（Phase 6 範疇） |

**Phase 5 範疇**：欄位定義、資訊架構規格、比較模式語意描述、切換觸發邏輯（純文字規格層次）。

---

## 4. 版本記錄

| 版本 | 日期 | 說明 |
|------|------|------|
| v1 | 2026-03-27 | Phase 5 初版 |
