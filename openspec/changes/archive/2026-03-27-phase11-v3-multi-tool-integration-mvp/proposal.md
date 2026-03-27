# Proposal: phase11-v3-multi-tool-integration-mvp

## Why

Phase 4（V2.5）已完成多專案分層、共享 workflow 索引、跨專案模板集、技能候選升級流程與跨專案儀表板規格，並已 archive（`openspec/changes/archive/2026-03-27-phase10-v2.5-multi-project-shared-capability-mvp/`）。
目前系統以 GitHub Copilot 為單一 AI 工具來源，所有對話提取、候選沉澱、review 流程均假設單一工具的輸出格式。隨著 Codex、Gemini 等工具實際使用頻率提升，需要建立能容納多工具輸出的統一接入層——包含各工具的 adapter 介面規格、normalized schema、dedupe_key 策略、來源可信度評分機制，以及工具介面比較檢視規格——為後續 Phase 5 UI 擴充（多來源検視）提供設計基線。

## What Changes

1. **多工具 Adapter 介面規格定義**：定義 Copilot、Codex、Gemini 各自的 adapter 介面規範，描述如何將各工具的原始輸出對應到統一進入點，包含輸入格式、輸入來源路徑、預處理規則，以及各平台的限制與差異說明。
2. **Normalized Schema 定義（統一欄位格式）**：定義跨工具輸出的統一候選欄位規格（normalized schema），包含 `tool_source`、`extracted_at`、`dedupe_key`、`confidence_score`、`content`、`tags` 等必要欄位，確保不同工具的輸出可在同一資料層比較。
3. **跨工具候選去重策略（dedupe_key 設計）**：定義 dedupe_key 的生成規則（基於 content hash 或語意相似），說明去重邏輯（same key = 保留最高 confidence；不同 key = 各自保留），並提供至少 2 個典型案例說明。
4. **工具來源可信度評分機制**：定義 `confidence_score` 的評分維度（≥3 個維度，例如：使用頻率、交叉驗證比率、人工確認率），說明各維度的計算方式（docs-only，公式不依賴外部 API），以及評分如何影響提取候選的排序與審核優先序。
5. **工具介面切換與比較檢視規格（spec-driven，UI 延後）**：定義跨工具比較視圖的資訊架構規格（docs-only），包含視圖欄位（工具名、來源時間、dedupe_key、confidence_score、狀態）、切換邏輯、比較模式（side-by-side vs 聚合），並明確標注哪些需要 Phase 6 UI 實作。

## Scope

- In scope:
  - 多工具 adapter 介面規格（docs-only，不實作 runtime adapter）
  - Normalized schema 定義（欄位規格文件，不實作資料庫）
  - dedupe_key 設計規則與典型案例
  - confidence_score 評分維度與計算說明（docs-only）
  - 工具介面比較檢視規格文件（docs-only，不實作前端）
  - docs-first 最小安全修改原則
  - strict validate 可重播驗證
  - 治理同步（roadmap / runlog / handoff 狀態一致）
- Out of scope:
  - 多工具 adapter runtime 實作（後端或 CLI 工具）
  - 前端 UI 多來源比較介面實作（Phase 6 範疇）
  - 實際 API 呼叫或工具平台 SDK 整合
  - 後端資料庫或 vector store 建置
  - 自動去重 runtime 執行引擎
  - 使用者認證與多人協作機制
  - 重大架構重寫或重大 dependency 新增
  - 現有 Phase 1–4 產出的修改

## Acceptance Criteria (Measurable)

1. 多工具 Adapter 介面規格定義：
   - 產出 adapter 介面規格文件（`docs/workflows/v3-multi-tool-adapter-spec-v1.md`），涵蓋 ≥3 個工具（Copilot、Codex、Gemini），每個工具含輸入來源路徑、預處理規則、限制說明各 ≥1 項。
2. Normalized Schema 定義：
   - 產出 normalized schema 文件（`docs/workflows/v3-normalized-schema-v1.md`），定義 ≥6 個欄位（含 `tool_source`、`dedupe_key`、`confidence_score`），每個欄位含型別、必填性、範例值說明。
3. 跨工具候選去重策略：
   - Normalized schema 文件或獨立文件（`docs/workflows/v3-dedupe-strategy-v1.md`）說明 dedupe_key 生成規則 ≥2 種，並提供 ≥2 個典型去重案例（含相同 key 衝突處理與不同 key 共存）。
4. 工具來源可信度評分機制：
   - 產出評分機制文件（`docs/workflows/v3-confidence-scoring-v1.md`），定義 ≥3 個評分維度，每個維度含計算說明；明確說明評分如何影響審核排序（優先序規則 ≥1 條）。
5. 工具介面比較檢視規格：
   - 產出比較檢視規格文件（`docs/product/v3-multi-tool-comparison-view-spec-v1.md`），涵蓋 ≥5 個視圖欄位定義、切換邏輯說明、比較模式（side-by-side vs 聚合）的適用場景，並標注 Phase 6 UI 前置需求。
6. 驗證與治理同步：
   - `openspec validate phase11-v3-multi-tool-integration-mvp --type change --strict` PASS；roadmap（Phase 5 狀態更新）、runlog（2026-03-27）、handoff（Phase 5 active）狀態一致。

## Front-loaded Risks

1. 多工具 adapter 規格過度依賴各工具平台細節，規格易過時
   - 緩解：adapter 介面以「docs-only 行為描述」為主，不寫死 API endpoint 或 SDK 版本，僅定義輸入格式與預處理規則的抽象邊界。
2. Normalized schema 欄位設計過多，與現有候選格式（`docs/memory/`）不相容
   - 緩解：schema 欄位採增量方式設計（ADDED 欄位），不修改現有候選格式；必填欄位不超過 8 個。
3. dedupe_key 策略在語意相似但措辭不同的情境下難以精確定義
   - 緩解：Phase 5 僅定義基於 content hash 的確定性 dedupe（低風險），語意相似去重標注為「Phase 6 增量功能」，不納入本次 acceptance criteria。
4. confidence_score 評分維度若依賴工具平台 API 的統計資料無法 docs-only 實現
   - 緩解：所有評分維度限定為可從本地 docs 推算的指標（例如：session 出現次數、人工確認次數），不引入外部 API 依賴。
5. 比較檢視規格與 Phase 3 既有 UI 骨架（候選審核介面）邊界不清
   - 緩解：明確定義 Phase 5 比較檢視為新的資訊架構層（supplementary），不修改 Phase 3 審核介面現有欄位與流程。

## Impact

### Roadmap Impact

- 啟動 Phase 5（V3）first active change：`phase11-v3-multi-tool-integration-mvp`
- 完成後 Phase 5 四項工作項目可全部打勾（roadmap 對應 Phase 5 欄位更新），V3 版本多工具接入層規格交付
- 為 Phase 6 UI 擴充（多來源檢視實作）提供 adapter 規格、normalized schema、比較檢視資訊架構等設計基線

### Non-goals

- 不交付多工具 adapter runtime 實作（後端 CLI / SDK）
- 不交付前端 UI 多來源比較介面
- 不修改已封存 changes（Phase 1–4）的歷史語意
- 不引入新的重大 dependency 或構建工具
- 不實作自動去重或評分計算的 runtime 引擎

## Human Decisions Required

- Normalized schema 欄位集最終確認（建議：`tool_source`、`extracted_at`、`dedupe_key`、`confidence_score`、`content`、`tags`、`status`、`review_note`，預設採此集合，可於執行時依需求增減）
- dedupe_key 策略的優先策略確認（建議：先採 content hash exact match，語意相似去重延後至 Phase 6；預設採此策略）
- confidence_score 評分是否需要整數（0–100）或浮點（0.0–1.0）格式（建議：0–100 整數，方便文字呈現；預設採此格式）
- Phase 5 完成後是否直接啟動 Phase 6 UI 實作或先做評估回顧（建議：完成後先評估；預設：評估後再決定）
