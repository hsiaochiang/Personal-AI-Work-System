# Proposal: phase9-v2-lightweight-ui-workbench-mvp

## Why

Phase 2（V1.5）已完成並 archive（`phase8-v1.5-stabilization-mvp`）；提取流程穩定化、模板欄位收斂、邊界規範與初始化流程全部就位，這些是 UI 工作台的前置條件。
S5（`phase5-v2-lightweight-ui-workbench-mvp`）已做過規格草案與 Stitch 視覺設計（`design/stitch/snapshots/2026-03-26/`），驗證了資訊架構與主要頁面的可行性。
此時進入 Phase 3 UI MVP，可在穩定的資料基線與已驗證的 UI 設計之上，交付第一個可操作的輕量 UI 工作台，降低日常作業的 markdown 編輯摩擦，並為後續多工具擴展提供 UI 骨架。

## What Changes

1. **UI MVP 設計與資料來源契約**：確立所有 UI 功能的輸入資料路徑、欄位映射、草稿輸出格式，建立可重播的資料契約文件。
2. **專案總覽與專案頁**：以 `docs/roadmap.md` 與 `openspec/changes/` 為資料來源，提供 Phase 進度概覽與 Active Change 詳情頁。
3. **Handoff Builder**：讀取 `docs/handoff/current-task.md`，提供可編輯草稿介面，輸出結構化 handoff 草稿至草稿層。
4. **候選審核介面**：提供候選清單檢視，支援採用/拒絕決策（含 metadata），輸出僅寫入草稿層。
5. **Memory Review 介面**：從 `docs/memory/` 讀取記憶候選，提供分類檢視與審核操作，輸出僅寫入草稿層。

## Scope

- In scope:
  - Phase 3 五項工作項目的 UI MVP 規格化、任務化與最小驗證路徑
  - 資料來源契約（markdown-first，不連資料庫）
  - 草稿輸出層定義（不直接覆蓋正式 docs）
  - Stitch 快照作為設計參考基線（`design/stitch/snapshots/2026-03-26/`）
  - docs-first 證據同步（roadmap/runlog/handoff/qa）
  - strict validate 可重播驗證
- Out of scope:
  - 後端 API 或資料庫整合（Phase 4+）
  - 多工具接入 runtime（Phase 5）
  - 使用者認證與多人協作（Phase 4+）
  - 正式 release 打包與部署
  - 重大架構重寫、重大 dependency 新增

## Acceptance Criteria (Measurable)

1. UI MVP 設計與資料來源契約：
   - 產出資料來源契約文件，涵蓋所有五項 UI 功能的輸入路徑與欄位映射，至少一份 markdown 解析驗收紀錄。
2. 專案總覽與專案頁：
   - 頁面可正確呈現 `docs/roadmap.md` Phase 清單與 Active Change 清單；無 active change 時顯示空狀態而非錯誤。
3. Handoff Builder：
   - 可從 `docs/handoff/current-task.md` 載入草稿、支援編輯、輸出到指定草稿路徑；必填欄位缺失時阻止提交。
4. 候選審核介面：
   - 每筆候選需有明確採用/拒絕決策方可輸出草稿；pending 項目存在時阻止提交；草稿輸出不覆蓋正式文件。
5. Memory Review 介面：
   - 可呈現 `docs/memory/` 分類清單；adopted 項目輸出至草稿層並附 run metadata；原始 memory 文件不被修改。
6. 驗證與治理同步：
   - `openspec validate phase9-v2-lightweight-ui-workbench-mvp --type change --strict` PASS；roadmap/runlog/handoff 狀態一致。

## Front-loaded Risks

1. Stitch 快照為靜態 HTML，與實際動態資料來源整合有落差
   - 緩解：先以純前端 markdown 解析（`fetch` + 正則或 marked.js）概念驗證；不引入後端依賴。
2. 資料來源契約覆蓋不足，導致介面欄位與實際 markdown 格式不匹配
   - 緩解：Task 1.x 強制先完成契約再實作各頁面。
3. 草稿輸出邊界失守，意外覆蓋正式 docs
   - 緩解：所有輸出路徑集中於 `design/stitch/drafts/` 或 `docs/drafts/`，禁止直接寫入 `docs/handoff/`、`docs/memory/` 等正式路徑。
4. 五項功能並列開發導致 scope 蔓延
   - 緩解：按任務順序嚴格推進，完成前一項才開始下一項。

## Impact

### Roadmap Impact

- 啟動 Phase 3（V2）第一個 active change：`phase9-v2-lightweight-ui-workbench-mvp`
- 完成後 Phase 3 五項工作項目全部打勾，V2 版本正式交付
- 為 Phase 4（多專案能力）提供可擴展的 UI 骨架

### Non-goals

- 不交付後端 API 或資料庫整合
- 不交付正式 release 打包或 CI/CD
- 不變更已封存 changes 的歷史語意
- 不新增多工具 runtime 接入（Phase 5 範疇）

## Human Decisions Required

- 草稿輸出路徑確認（`design/stitch/drafts/` vs `docs/drafts/` 二擇一，預設先採 `design/stitch/drafts/`）
- 是否採用純靜態前端（HTML/CSS/JS）或引入 Vite/React 等框架（預設先採靜態，降低環境依賴）
- 五項功能的開發優先序確認（預設：專案總覽 → handoff builder → 候選審核 → Memory Review）
