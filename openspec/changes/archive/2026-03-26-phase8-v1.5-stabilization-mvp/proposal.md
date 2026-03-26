# Proposal: phase8-v1.5-stabilization-mvp

## Why

Phase 1 (V1) 已完成，S7 治理自動化 MVP 也已關閉；目前唯一真源 `docs/roadmap.md` 已明確標示下一階段是 Phase 2（V1.5 穩定化）。
若未先完成穩定化就直接進入 UI 或多工具擴張，將把不穩定的流程與邊界放大，增加後續返工與治理成本。
本 change 目標是建立可重複、可驗證、可交接的 V1.5 穩定化基線。

## What Changes

- 定義提取流程重構與規則穩定化的最小可驗證契約。
- 收斂模板欄位，建立必填/選填與相容策略。
- 以真實案例回顧驗證流程在不同任務型態下的一致性。
- 建立新專案初始化流程（bootstrap + 最小檢核 + 交接接手點）。
- 定義專案層與個人層邊界（資料、權限、寫回目的地）。
- 產出第一版使用說明，支援新接手者在不口頭補充下完成一次端到端流程。

## Scope

- In scope:
  - Phase 2 六項工作項目的規格化、任務化與最小驗證路徑
  - docs-first 證據同步（roadmap/runlog/handoff/qa）
  - strict validate 可重播驗證
- Out of scope:
  - UI MVP 實作（Phase 3）
  - 多工具整合框架實作（Phase 5）
  - 重大架構重寫、重大 dependency 新增、release 決策

## Acceptance Criteria (Measurable)

1. 提取流程重構與規則穩定化：
   - 至少定義 1 份標準提取流程（輸入、步驟、輸出）與 1 份規則清單，並完成一次 strict validate + smoke 證據。
2. 模板欄位收斂：
   - 形成模板欄位矩陣（必填/選填/棄用），至少涵蓋 handoff、runlog、qa 三類文件且無衝突欄位定義。
3. 真實案例回顧：
   - 至少回顧 2 個既有案例（不同任務型態），產出一致性差異與修正建議清單。
4. 新專案初始化流程：
   - 提供一套從 0 到可交接的初始化步驟，並完成 1 次乾淨重播（clean-room style）記錄。
5. 專案層與個人層邊界定義：
   - 形成邊界規範表（可寫入位置/不可寫入位置/責任歸屬），至少覆蓋 `docs/`、`/memories/`、`openspec/` 三層。
6. 第一版使用說明：
   - 產出 v1 使用說明（含最小命令集、常見錯誤、排查流程），由另一位 agent 可獨立完成一次流程。

## Front-loaded Risks

1. 規則收斂過快造成現有流程不相容
   - 緩解：採漸進收斂，保留舊欄位對照表與過渡期映射。
2. 邊界定義過於抽象，導致執行時判斷不一致
   - 緩解：每條邊界規則需附具體路徑與正反例。
3. 以單一案例做規則推導，覆蓋面不足
   - 緩解：強制至少兩類案例（規劃型/實作型）交叉驗證。
4. 文件同步遺漏造成治理狀態漂移
   - 緩解：每個子任務收尾必做 roadmap/runlog/handoff 一致性檢核。

## Impact

### Roadmap Impact

- 啟動 Phase 2（V1.5）第一個 active change：`phase8-v1.5-stabilization-mvp`
- 為 Phase 3（UI 工作台）與後續多工具階段提供穩定前置基線

### Non-goals

- 不交付新 UI 功能
- 不新增多工具 runtime 接入
- 不變更已封存 changes 的歷史語意

## Human Decisions Required

- 是否將模板欄位收斂列為未來所有 change 的硬性 gate（預設先採建議 gate）
- 專案層/個人層邊界衝突時的最終裁決優先序（預設 project-first）
