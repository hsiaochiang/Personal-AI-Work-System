# Roadmap — Personal AI Work System

> **本文件是專案進度的單一真源。**
> 回答：這個產品要做什麼？做到哪？下一步？之後還有什麼？
>
> Done = 使用者可以做到什麼新的事，不是「產出了什麼文件」。

---

## 1. 願景 / 北極星

> 從 markdown 驅動的單專案工作流，成長為跨工具、可持續累積知識、可協助交接與沉澱的**個人 AI 工作台**。

最終目標：不論你用哪個 AI 工具（Copilot、ChatGPT、Gemini、Antigravity…），這套系統都能幫你保留知識、降低交接摩擦、讓工作經驗持續累積。

---

## 2. 版本全貌地圖

> 這個產品不只有 V1。以下是完整的版本路線。

| 版本 | 版本定位 | 做完後你可以… | 核心能力 | 狀態 |
|:----:|---------|--------------|---------|:----:|
| **V1** | 單專案知識閉環工作台 | 在單一專案中完成 handoff 產生、對話提取、審核寫回、決策檢視、多專案切換 | 基礎閉環 + 輕量 UI | ✅ 已完成 |
| **V2** | 穩定化與多專案工作台 | 更安全地寫回記憶、真正的多專案資料切換、更可信任的工作台 | 穩定化 + 資料安全 | ✅ 已完成 |
| **V3** | 跨工具整合層 | 接入 ChatGPT、Gemini、VS Code、Antigravity 等多種 AI 工具的對話來源 | 多工具標準化 + adapter | ✅ 已完成 |
| **V4** | 治理、自動化、個人 AI 作業系統 | 自動化治理、記憶品質檢查、跨專案共享模式與技能沉澱 | 自動化 + 治理 | ✅ 已完成 |
| **V5** | 外部 API 整合與多工具擴充層 | 以 Gemini / Claude 半自動 adapter 補齊工具覆蓋；透過 OpenAI API key 載入工作台追蹤的對話，讓知識匯入更完整 | Gemini/Claude adapter + OpenAI conversation auto-import | ✅ 已完成 |
| **V6** | 記憶 AI 策展層 | 對記憶條目執行刪除、讓 AI 整理分類、KPI 可點擊篩選問題條目 | 刪除 + AI Curate + 篩選 | ✅ 已完成 |

### V1：單專案知識閉環工作台

**版本目標**：讓使用者在單一專案中完成「讀取現況 → 產生 handoff → 提取知識 → 審核寫回 → 檢視決策」的完整閉環。

**核心價值**：
- 降低新 AI 對話的啟動摩擦
- 把一次性對話中的有用知識變成可重用的專案記憶

**完成標準**：
- handoff builder 可真正使用
- extraction → review → writeback 可跑通
- Memory / Decisions / Rules 能反映寫回結果
- 多專案切換 + 全域搜尋可用

### V2：穩定化與多專案工作台

**版本目標**：讓產品從「可用雛形」變成「可信任的工作台」。

**核心能力**：
- writeback 更安全（backup / draft / merge 策略）
- 真正的多專案資料源切換（不只是 UI 切換，資料也跟著切換）
- 更完整的 review、搜尋與篩選
- 更清楚的 loading / error / empty 狀態

### V3：跨工具整合層

**版本目標**：讓工作台不只服務單一 AI 工具入口，能接住多種 AI 工具產生的對話與知識。

**核心能力**：
- ChatGPT / Gemini / VS Code / Antigravity 對話來源匯入
- conversation schema 統一標準化
- importer / adapter 機制
- shared / personal / project 層級的知識分流

### V4：治理、自動化、個人 AI 作業系統

**版本目標**：從「工作台」往上走，成為真正持續幫助使用者工作的個人 AI 作業系統。

**核心能力**：
- 自動或半自動治理流程
- 例行工作自動化
- 記憶品質檢查與清理
- 規則衝突偵測與建議
- 跨專案共享模式與技能沉澱

### V5：外部 API 整合與多工具擴充層

**版本目標**：讓工作台的對話知識輸入管道從「手動主導」往「外部自動化」推進一步：補齊 V3 遺留的 Gemini / Claude 半自動 adapter，並引入 API key 機制支援 OpenAI platform conversation 自動載入。

**核心能力**：
- Gemini 對話貼上 adapter（半自動）
- Claude 對話貼上 adapter（半自動）
- OpenAI conversation auto-import（於 ChatGPT 匯入模式使用；需使用者提供 API key）
- adapter 文件補齊，工具支援狀況清楚說明

---

## 3. 當前版本：V6 已完成 — 記憶 AI 策展層

> **Current development version：待規劃下一版**
> **Current release：V5（v1.1.0）**
> **Development status：V6 `memory-ai-curator` 已完成 main spec sync 與 archive（2026-04-15）**
> **可用程度：** `node web/server.js` → http://localhost:3000

### V1 Phase 進度

| Done | Phase | 做完後你可以… | 核心價值 | 狀態 |
|:----:|:-----:|-------------|---------|:----:|
| [x] | Spec | 規格與設計完成（docs-only，產品設計藍圖） | — | ✅ |
| [x] | 1 | 在瀏覽器看到 roadmap 進度和當前任務 | 基礎檢視 | ✅ |
| [x] | 2 | 在 UI 產生 handoff 草稿，複製貼到新 AI 對話 | 降低啟動摩擦 | ✅ |
| [x] | 3 | 貼上對話 → 產生候選 → 審核 → 寫回記憶 | 知識閉環 | ✅ |
| [x] | 4 | 集中檢視決策與規則，搜尋篩選 | 決策追蹤 | ✅ |
| [x] | 5 | 多專案切換 + 全域搜尋 + sidebar 專案名稱 | 規模化 | ✅ |

### 下一步

V1–V6 已完成；工作台現已具備多來源匯入、memory 治理、規則衝突提示、跨專案 shared knowledge 候選、Overview 治理待辦，以及 `/memory` 的單條刪除、KPI 問題篩選、逐分類 AI curate 與 AI review 跳轉。下一步可由人工決定是否升版 release，或開始規劃 V7。

- V2 Change 1（writeback safety hardening）✅ 已完成（`5658def`）
- V2 Change 2（multi-project true switching）✅ 已完成（`b5eea82`）
- V2 Change 3（roadmap and docs alignment）✅ 已完成（`f1f8e08`）
- V2 Change 4（flow validation and usability hardening）✅ 已完成
- V3 Change 1（`conversation-schema-definition`）✅ 已完成並 archive（2026-04-02）
- V3 Change 2（`plain-text-adapter-refactor`）✅ 已完成並 archive（2026-04-03）
- V3 Change 3（`chatgpt-adapter`）✅ 已完成並 archive（2026-04-03）
- V3 Change 4（`local-import-vscode-copilot`）✅ 已完成並 archive（2026-04-03）；`/extract` 可從本機 Copilot session JSONL 載入單一對話。
- V3 Change 5（`source-attribution-in-memory`）✅ 已完成並 archive（2026-04-03）；新寫回的 memory 條目可保留來源 metadata，`/memory` 會顯示來源 badge。
- V3 Change 6（`import-ui-multi-source`）✅ 已完成並 archive（2026-04-04）；`/extract` 的多來源匯入入口、來源 badge 與 main spec sync 全數收尾完成。
- V5 Change 1（`gemini-adapter`）✅ 已完成並 archive（2026-04-04）
- V5 Change 2（`claude-adapter`）✅ 已完成並 archive（2026-04-04）
- V5 Change 3（`chatgpt-api-auto-import`）✅ 已完成並 archive（2026-04-04）
- V5 Change 4（`adapter-docs-update`）✅ 已完成並 archive（2026-04-04）

**V1–V5 全數完成（2026-04-05）；版本號 v1.1.0 已發布。** 工作台現已具備完整的多工具匯入（plain / ChatGPT / Gemini / Claude / Copilot + OpenAI API）、memory 治理自動化、規則衝突偵測與跨專案 shared knowledge。

### V4 Change 進度

| # | Change | 狀態 | 備註 |
|:-:|--------|:----:|------|
| 1 | memory-health-scoring | ✅ 已 archive | `/api/memory` health summary、`/memory` 健康度概覽與 per-item badge 已上線，main spec sync 與 archive 已完成 |
| 2 | memory-dedup-suggestions | ✅ 已 archive | `/api/memory` dedup summary、`/memory` 疑似重複建議與 merge/delete action 已完成 verify；server-side duplicate group validation、main spec sync 與 archive 全數完成 |
| 3 | rule-conflict-detection-v2 | ✅ 已 archive | `/decisions` conflict overview、signal-based detection、main spec sync 與 archive 已完成 |
| 4 | cross-project-shared-knowledge | ✅ 已 archive | `/api/memory` sharedKnowledge payload、`/memory` 共用知識候選與 `docs/shared/` snapshot generator 已上線；main spec sync 與 archive 已完成 |
| 5 | governance-scheduler | ✅ 已 archive | `web/governance.json`、server startup due-check、`/api/governance` 與 Overview 治理待辦已完成 strict validate / targeted verify / local smoke；main spec sync 與 archive 已完成 |

### 已知缺口（V2 → V3 之間）

| 缺口 | 說明 | 歸屬版本 |
|------|------|:--------:|
| ~~V2 驗證未完整~~ | ✅ 已解決：補足完整工作流情境驗證與 UI 狀態處理 | V2 |
| 多工具匯入尚未涵蓋 Gemini / Claude / Antigravity | 目前已支援 plain / ChatGPT / VS Code Copilot；其他來源仍待後續版本 | V4 |
| 治理排程仍為 startup snapshot | 目前僅在 server 啟動時計算治理待辦，尚無 background daemon、cron 或自動更新 `lastReviewedOn` | V4 |

### V2 Change 進度

| # | Change | 狀態 | 備註 |
|:-:|--------|:----:|------|
| 1 | writeback safety hardening | ✅ 已完成 | `5658def` 2026-03-29 |
| 2 | multi-project true switching | ✅ 已完成 | `b5eea82` 2026-03-31 |
| 3 | roadmap and docs alignment | ✅ 已完成 | `f1f8e08` 2026-04-01 |
| 4 | flow validation and usability hardening | ✅ 已完成 | 2026-04-01 |

### V3 Change 進度

| # | Change | 狀態 | 備註 |
|:-:|--------|:----:|------|
| 1 | conversation-schema-definition | ✅ 已完成 | archive 2026-04-02 |
| 2 | plain-text-adapter-refactor | ✅ 已完成 | archive 2026-04-03 |
| 3 | chatgpt-adapter | ✅ 已完成 | archive 2026-04-03 |
| 4 | local-import-vscode-copilot | ✅ 已完成 | archive 2026-04-03 |
| 5 | source-attribution-in-memory | ✅ 已完成 | archive 2026-04-03 |
| 6 | import-ui-multi-source | ✅ 已完成 | archive 2026-04-04 |

### V5 Change 進度

| # | Change | 狀態 | 備註 |
|:-:|--------|:----:|------|
| 1 | gemini-adapter | ✅ 已 archive | `GeminiAdapter` 實作、`/extract` Gemini 來源選項、`gemini` 來源 badge；archive 2026-04-04 |
| 2 | claude-adapter | ✅ 已 archive | `ClaudeAdapter` 實作、`/extract` Claude 來源選項、`claude` 來源 badge；archive 2026-04-04 |
| 3 | chatgpt-api-auto-import | ✅ 已 archive | `/settings` API key 儲存、`/api/chatgpt/sessions`、`/extract` API import flow、`chatgpt-api` 來源 badge；archive 2026-04-04 |
| 4 | adapter-docs-update | ✅ 已 archive | `/extract` 各來源「支援格式」提示、`conversation-schema.md` V5 矩陣補齊；archive 2026-04-04 |

### Post-V5 獨立 Change（v1.1.x 修補期）

| # | Change | 狀態 | 備註 |
|:-:|--------|:----:|------|
| — | llm-extract-gemini | ✅ 已 archive | Gemini API 輔助知識提取路徑：`/api/extract/llm`、Gemini key 管理（settings）、extract.html AI 輔助提取按鈕；archive 2026-04-14 |

### V6 Change 進度

> Brief 確認日期：2026-04-14（Wilson）

| # | Change | 狀態 | 備註 |
|:-:|--------|:----:|------|
| 1 | memory-ai-curator | ✅ 已 archive | T-01~T-06、strict validate、targeted verify、ephemeral API smoke、UI/UX review、Review Gate、implementation commit / push、main spec sync 與 archive 已完成；archive 2026-04-15 |

---

## 4. V1 Phase 詳情

<details>
<summary>展開 V1 各 Phase 交付物與驗收方式</summary>

### Spec Phase（規格層）✅ 已完成

> 之前 Phase 0–5 的所有工作。重新定位為「規格層」——產品的設計藍圖，不是產品本身。

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

### Phase 1：看到自己的專案 ✅

**使用者驗收標準：** 在瀏覽器打開一個頁面，看到從本地 markdown 讀出的真實資料。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 本地 dev server（`npm start` 一鍵啟動） | 執行後瀏覽器自動開啟 |
| 2 | 專案總覽頁 — 顯示 roadmap.md 的 Phase 進度 | 修改 roadmap.md，重整後畫面更新 |
| 3 | 當前任務頁 — 顯示 handoff/current-task.md | 修改 current-task.md，重整後畫面更新 |
| 4 | 記憶清單頁 — 顯示 docs/memory/ 下所有條目 | 新增一條 memory，重整後出現 |

---

### Phase 2：Handoff Builder ✅

**做完後你可以：** 在 UI 選擇 handoff 類型，載入現有內容或模板，編輯欄位，預覽 markdown，一鍵複製到剪貼簿。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Handoff 頁面 — 選擇類型（規劃/實作/整合） | 點擊類型切換模板 |
| 2 | 載入現有 current-task.md 或模板基線 | 欄位自動填入現有值 |
| 3 | 可編輯欄位 | 修改任一欄位 → 預覽即時更新 |
| 4 | Markdown 預覽（右側即時顯示） | 預覽區顯示完整 markdown |
| 5 | 複製到剪貼簿 | 點「複製」後可直接貼進 AI 對話 |

---

### Phase 3：知識閉環 — 提取 + 審核 + 寫回 ✅

**做完後你可以：** 貼上 AI 對話 → 系統產生候選 → 審核（採用/編輯/忽略）→ 寫回 `docs/memory/*.md`。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 對話輸入入口（文字貼上 + 檔案匯入） | 貼上對話後出現候選清單 |
| 2 | 啟發式提取引擎（識別 4 類：背景/偏好/模式/決策） | 候選自動標注分類 |
| 3 | 候選審核 UI（接受/編輯/忽略） | 操作後狀態改變 |
| 4 | 寫回 `docs/memory/*.md` | 採用後對應檔案確實更新 |
| 5 | Memory 頁重新整理後顯示新內容 | 重整頁面看到新寫入的條目 |

---

### Phase 4：決策與規則集中檢視 ✅

**做完後你可以：** 在 Decisions 頁瀏覽、搜尋決策；在 Rules 頁檢視偏好規則與模式。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | Decisions 頁 — 決策清單 + 搜尋 | 輸入關鍵字可篩選決策 |
| 2 | Rules 頁 — 偏好/輸出模式/任務模式 分類檢視 | 標籤切換可看不同分類 |
| 3 | 基本衝突提示 | 矛盾的規則有高亮標記 |

---

### Phase 5：多專案 + UI 完整化 ✅

**做完後你可以：** 管理多個專案，在 Projects Hub 聚合狀態，完整導覽與搜尋。

| # | 交付物 | 驗收方式 |
|:-:|--------|---------|
| 1 | 專案設定檔支援多個根目錄 | 設定 2+ 個路徑後重啟 |
| 2 | Projects Hub — 多專案卡片 + 狀態 | 兩個專案都正確顯示 |
| 3 | 專案切換 | 點擊後所有頁面切換為該專案 |
| 4 | 頂部 tab 導覽 + 側邊欄副導覽 | 對齊設計稿的導覽結構 |
| 5 | 完整 Loading / Error / Empty 狀態 | 各狀態正確顯示 |
| 6 | 全域搜尋 | 可搜尋所有資料 |

</details>

---

## 5. 版本升級條件

| 升級 | 條件 |
|------|------|
| V1 → V2 | V1 核心閉環（handoff + extraction + writeback）可穩定使用；使用者有實際使用回饋 |
| V2 → V3 | writeback backup/merge 機制已建立；多專案資料源可真正切換 |
| V3 → V4 | 至少 2 個以上 AI 工具來源可匯入；conversation schema 已標準化 |

---

## 6. 推進原則

- **每個 Phase 交付可用功能**，不接受 docs-only 標記完成
- **Done = 使用者可操作**，不是「文件已撰寫」
- **每個交付物有明確驗收方式**，使用者自己能驗證
- 若某 Phase 原定功能太大，縮小 scope 但仍交付可用子集

---

## 7. Roadmap 治理規則

- **`docs/roadmap.md` 是專案進度的單一真源**：版本完成度、Phase 狀態、下一步方向，都先更新本文件
- **`docs/handoff/current-task.md`** 只保留短期交接與下一步，不單獨宣告整體版本完成
- **`docs/product/user-guide-current.md`** 只描述現在可用功能，並以本文件的版本狀態為準
- 版本完成判斷以本文件記載為準；其他文件若有衝突，以本文件為準
- Agent 可更新進度與驗證狀態，但不可自行決定 scope 變更、架構重寫、版本升級

---

## 8. OpenSpec Change Archive

> 以下記錄之前規格層的 OpenSpec change 歷史。這些是產品的設計藍圖，不等於產品功能交付。

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

## 9. 異動記錄

- 2026-04-15：**V6 Change 1 archive complete** — `memory-ai-curator` 已完成 `openspec/specs/memory-ai-curator/spec.md` sync、`openspec validate memory-ai-curator --type spec --strict` 與 `openspec archive memory-ai-curator -y --skip-specs`；active change 已封存至 `openspec/changes/archive/2026-04-15-memory-ai-curator/`
- 2026-04-15：**V6 全部完成** — V6 唯一 planned change `memory-ai-curator` 已 archive；`/memory` 的單條刪除、KPI 問題篩選、逐分類 AI curate 與 AI review 跳轉皆已收斂完成；下一步可由人工決定 release 或開始規劃 V7
- 2026-03-28：**roadmap 重構為單一真源** — 新增版本全貌地圖（V1–V4）、治理規則、版本升級條件；移除「這就是全部」表述；依據 `docs/planning/2026-03-28_roadmap-single-source-and-full-horizon-recommendation.md`
- 2026-03-28：**V1 Phase 5 實作完成** — Projects Hub + 全域搜尋 + sidebar 專案名稱上線
- 2026-03-28：**V1 Phase 4 實作完成** — 決策與規則集中檢視頁面上線（決策記錄 tab + 規則 tab + 搜尋 + 衝突偵測）
- 2026-03-28：**V1 Phase 2+3 實作完成** — Handoff Builder MVP + 知識閉環 MVP 實作上線
- 2026-03-28：**優先順序校準** — 核心閉環（handoff + extraction + review + writeback）提前至 Phase 2-3；UI polish 與多專案延後至 Phase 5
- 2026-03-27：**roadmap 重建** — 重新定位之前所有工作為 Spec Phase；新建以可操作功能為導向的 Phase 1–5
- 2026-04-04：**V3 全部完成** — 6 個 Changes 全數 archive；V4 brief 已草擬，待使用者確認
- 2026-04-04：**V4 Change 1 executor verify 完成** — `memory-health-scoring` 已完成 strict validate、health scoring 實作與 `/memory` UI 驗證，待 Review Gate
- 2026-04-04：**V4 Change 1 Review Gate PASS** — 已修補 missing source / missing date guard，重跑 strict validate、targeted verify、source attribution regression 與 local API smoke 後，可進入 commit / sync；archive 仍需人工確認
- 2026-04-04：**V4 Change 1 archive complete** — `memory-health-scoring` 已完成 main spec sync 與 archive，下一步可切到 `memory-dedup-suggestions` 或先處理 template blocker
- 2026-04-04：**V4 Change 2 executor verify 完成** — `memory-dedup-suggestions` 已完成 strict validate、dedup heuristic / action API、`/memory` 疑似重複 UI 與 local API smoke 驗證；下一步待 Review Gate
- 2026-04-04：**V4 Change 2 Review Gate FAIL** — `memory-dedup-suggestions` 的 merge action 曾未驗證 `primaryItemId` 屬於本次 duplicate group，錯誤 payload 可能誤改其他 memory item；已先凍結 sync / archive
- 2026-04-04：**V4 Change 2 Review Gate PASS** — 已補 server-side duplicate group validation，並重跑 targeted verify、health/source regression 與 local API smoke；目前可進入 commit / sync，archive 仍待人工確認
- 2026-04-04：**V4 Change 2 archive complete** — `memory-dedup-suggestions` 已完成 main spec sync 與 archive，下一步可切到 `rule-conflict-detection-v2` 或先處理 template blocker
- 2026-04-04：**V4 Change 3 Review Gate PASS** — `rule-conflict-detection-v2` 已完成 strict validate、targeted verify、local smoke、UI/UX review 與 Review Gate；目前可進入 main spec sync / archive
- 2026-04-04：**V4 Change 3 archive complete** — `rule-conflict-detection-v2` 已完成 main spec sync 與 archive，下一步可切到 `cross-project-shared-knowledge` 或先處理 template blocker
- 2026-04-04：**V4 Change 4 executor verify 完成** — `cross-project-shared-knowledge` 已完成 strict validate、shared utility / snapshot generator、`/api/memory` sharedKnowledge payload、`/memory` 共用知識候選與 local API smoke；下一步待 Review Gate
- 2026-04-04：**V4 Change 4 Review Gate PASS** — `cross-project-shared-knowledge` 已確認 shared candidate 品質、same-filename guard、snapshot / `/memory` 契約與 human-confirm 邊界均符合本輪 scope；目前可進入 commit / main spec sync / archive，是否執行仍待人工確認
- 2026-04-04：**V4 Change 4 archive complete** — `cross-project-shared-knowledge` 已完成 main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-cross-project-shared-knowledge/`；下一步可切到 `governance-scheduler` 或先處理 template blocker
- 2026-04-04：**V4 Change 5 planner** — 啟動 `governance-scheduler` 的 Planner scope gate，確認 V4 brief 已有人類確認、repo 無 active duplicate change，且目前尚無 `web/governance.json`、governance API 或 Overview 治理待辦卡；下一步待 Executor session 建立 artifacts 與最小 scheduler pipeline
- 2026-04-04：**V4 Change 5 executor verify** — 已完成 `web/governance.json`、server startup due-check、`/api/governance` 與 Overview 治理待辦卡；重跑 strict validate、`verify_governance_scheduler` 與 local API smoke 全數 PASS，下一步待 Review Gate
- 2026-04-04：**V4 Change 5 Review Gate PASS** — 已重查 scope / spec / tasks / QA / UI / UX evidence，並重跑 strict validate、targeted verify 與 local API smoke；確認 startup snapshot、manual-only 邊界與 Overview empty/disabled state 均符合本輪 scope，目前可進入 commit / main spec sync / archive，是否執行仍待人工確認
- 2026-04-04：**V4 Change 5 archive complete** — `governance-scheduler` 已完成 implementation commit、main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-governance-scheduler/`
- 2026-04-04：**V4 全部完成** — 五個 planned changes 全數 archive，V4 brief 驗收條件已全數達成；下一步可先處理 template verify blocker 或開始下一版規劃
- 2026-04-04：**V5 規劃** — 建立 `docs/planning/v5-brief.md`；補齊版本全貌地圖 V5 欄位；解除 template verify blocker（`openspec-execute.prompt.md` 已補建）
- 2026-04-04：**V5 Change 1 executor start** — `gemini-adapter` 已建立 active change 骨架並開始撰寫 OpenSpec artifacts；V5 版本狀態由規劃中轉為進行中
- 2026-04-04：**V5 Change 1 executor verify** — 已完成 `GeminiAdapter`、`/extract` Gemini source option、Gemini source badge 與 targeted verify；下一步待 Review Gate 判定是否可進入 commit / sync / archive
- 2026-04-04：**V5 Change 1 Review Gate PASS** — 已修正 `docs/system-manual.md` 的 Gemini 已知限制文案，並重跑 strict validate、Gemini targeted verify、import UI smoke 與 source attribution verify；目前可進入 commit / sync / archive 決策，是否執行仍待人工確認
- 2026-04-04：**V5 Change 1 archive complete** — `gemini-adapter` 已完成 implementation commit、main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-gemini-adapter/`；下一步可切到 `claude-adapter`
- 2026-04-04：**V5 Change 2 planner** — 已完成 `claude-adapter` scope gate：確認 V5 brief 已有人類確認、change 在 In Scope、`openspec/changes/` 無 active duplicate change，且目前 `/extract` selector / manual 仍未支援 Claude；下一步待新 session 執行 `docs/agents/codex-prompts/v5/05-claude-adapter-execute.md`
- 2026-04-04：**V5 Change 2 executor start** — 已建立 `openspec/changes/claude-adapter/` active change 骨架，完成 proposal / design / spec / tasks，並通過 `openspec validate --changes claude-adapter --strict`；下一步進入 Claude adapter 實作與 verify
- 2026-04-04：**V5 Change 2 executor verify** — 已完成 `ClaudeAdapter`、`/extract` Claude source option、Claude source badge 與 targeted verify；QA / UI / UX evidence 已補齊，下一步待 Review Gate 判定是否可進入 commit / sync / archive
- 2026-04-04：**V5 Change 2 Review Gate PASS** — 已重查 scope / spec / tasks / QA / UI / UX evidence，並重跑 strict validate、Claude targeted verify、plain / chatgpt / gemini / import UI / source attribution regression；確認無 blocking mismatch，目前可進入 commit / main spec sync / archive 決策，是否執行仍待人工確認
- 2026-04-04：**V5 Change 2 archive complete** — `claude-adapter` 已完成 implementation commit、main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-claude-adapter/`；下一步可切到 `chatgpt-api-auto-import`
- 2026-04-04：**V5 Change 3 planner** — 已完成 `chatgpt-api-auto-import` 的 Planner scope gate：確認 V5 brief 已有人類確認、change 在 In Scope、`openspec/changes/` 無 active duplicate，並盤點目前 repo 尚無 `/settings`、`web/api-keys.json` ignore 與 `/api/chatgpt/sessions` 基線；另查官方 OpenAI 文件後，尚未找到可用 API key 直接列出使用者 ChatGPT 產品聊天歷史的明確依據，因此目前先記為 blocker，待人確認是否調整 scope 後再進 Executor
- 2026-04-04：**V5 Change 3 scope adjust** — 已依官方 OpenAI 文件把 `chatgpt-api-auto-import` 收斂為「於 ChatGPT 匯入模式載入本工作台建立或追蹤的 OpenAI platform conversations」，不再宣稱可直接讀取 ChatGPT 產品聊天歷史；brief / roadmap / handoff / blockers / manual / decision-log 已同步，下一步可直接進 Executor
- 2026-04-04：**V5 Change 3 executor verify** — 已完成 `chatgpt-api-auto-import` 的 apply / verify：新增 `/settings` OpenAI API key 設定、server-side key storage、local tracked conversation index、`/api/chatgpt/sessions*` endpoint 與 `/extract` ChatGPT API import flow；`chatgpt-api` source attribution、targeted verify 與既有來源 regression 全數 PASS，下一步待 Review Gate 判定是否可進入 commit / sync / archive
- 2026-04-04：**V5 Change 3 Review Gate FAIL** — 已重跑 strict validate、targeted verify 與關鍵 regression；發現 `web/server.js` 的 `/api/chatgpt/session` 尚未驗證 `conversationId` 是否已存在於目前 project tracked index，會讓 direct load 繞過「先追蹤、再載入」邊界。已同步 brief / roadmap / handoff / blockers / manual / runlog，下一步需補 server-side guard 與 targeted verify 後再重跑 Review Gate
- 2026-04-04：**V5 Change 3 Review Gate PASS** — 已在 `web/server.js` 補 tracked-only server-side guard，並更新 `tools/verify_chatgpt_api_auto_import.js` 覆蓋 direct-load rejection；重跑 strict validate、targeted verify、ChatGPT / import UI / source attribution regression 全數 PASS，目前可進入 commit / main spec sync / archive 決策，是否執行仍待人工確認
- 2026-04-04：**V5 Change 3 archive complete** — `chatgpt-api-auto-import` 已完成 main spec sync、implementation commit `734ef44` 與 `openspec archive chatgpt-api-auto-import -y --skip-specs`；active change 已封存至 `openspec/changes/archive/2026-04-04-chatgpt-api-auto-import/`，下一步可切到 `adapter-docs-update`
- 2026-04-04：**V5 Change 4 planner** — 已完成 `adapter-docs-update` 的 Planner scope gate：確認 V5 brief 已有人類確認、change 屬於 In Scope、`openspec/changes/` 無 active duplicate，並盤點目前 `docs/workflows/conversation-schema.md` 仍停留在 V3 schema 說明、`/extract` 雖有各來源說明但尚未形成一致的「支援格式」提示層；下一步可開新 session 進入 `docs/agents/codex-prompts/v5/11-adapter-docs-update-execute.md`
- 2026-04-04：**V5 Change 4 executor verify** — 已建立 `openspec/changes/adapter-docs-update/` active change，完成 `conversation-schema.md` 的 V5 支援來源矩陣、`/extract` 一致化「支援格式」提示、`tools/verify_adapter_docs_update.js` 與 QA / UI / UX evidence；重跑 strict validate、targeted verify 與 `plain` / `chatgpt` / `chatgpt-api` / `gemini` / `claude` / `copilot` regression 全數 PASS，下一步待 Review Gate 判定是否可進入 commit / sync / archive
- 2026-04-04：**V5 Change 4 Review Gate PASS** — 已重查 scope / spec / tasks / QA / UI / UX evidence，並重跑 strict validate、targeted verify 與關鍵 import regression；確認 `conversation-schema.md`、`/extract` 文案與既有能力一致，無 blocking mismatch，目前可進入 commit / main spec sync / archive 決策，是否執行仍待人工確認
- 2026-04-04：**V5 Change 4 archive complete** — `adapter-docs-update` 已完成 `openspec/specs/adapter-docs-update/spec.md` main spec sync、strict validate、implementation commit 與 `openspec archive adapter-docs-update -y --skip-specs`；active change 已封存至 `openspec/changes/archive/2026-04-04-adapter-docs-update/`，V5 四個 planned changes 目前已全數 archive，下一步可檢查版本收尾條件
- 2026-04-04：修正 roadmap.md：版本表 V2 狀態、Section 3 標題與 Current release、補 V3 Change 進度表
- 2026-03-27：Phase 5 (V3) 全部完成並 archive（`phase11-v3-multi-tool-integration-mvp`）
- 2026-03-27：Phase 4 (V2.5) 全部完成並 archive（`phase10-v2.5-multi-project-shared-capability-mvp`）
- 2026-03-26：Phase 3 (V2) / Phase 2 (V1.5) 全部完成並 archive
- 2026-03-24–25：Phase 0–1 完成

