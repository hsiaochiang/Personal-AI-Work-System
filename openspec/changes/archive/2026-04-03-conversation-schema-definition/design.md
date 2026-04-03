# Design: conversation-schema-definition

## Context

`docs/planning/v3-brief.md` 的 In Scope A 要求先定義對話 schema，再讓後續 adapter 逐步接入。現況中，系統主要接收純文字貼上，缺乏跨工具一致的資料契約。若直接在每個 adapter 各自擴充 extraction 輸入，會放大相容性與測試成本。

此 change 採 docs-first，先產出可落地的 schema 文件與 OpenSpec requirement，不改 runtime 邏輯，維持 smallest safe change。

## Goals / Non-Goals

**Goals:**
- 定義 `ConversationMessage` 欄位與語意，最小必備欄位為 `role`、`content`、`source`、`timestamp`。
- 定義 `ConversationDoc` 包裝格式，包含 `messages` 與最小 `metadata`。
- 提供可驗證範例與 adapter 輸出約束，讓後續 change 可直接對齊。
- 確保規格可向後相容現有純文字流程（以 `source: plain` 映射）。

**Non-Goals:**
- 不實作任何 adapter 與 UI。
- 不改 extraction / review / writeback 既有流程。
- 不引入新 dependency、新儲存層或新 API。

## Decisions

### Decision 1: 以 `ConversationDoc` 作為單一入口資料容器

- 決策：所有來源先轉成 `ConversationDoc`，再交給 extraction pipeline。
- 理由：避免 pipeline 直接耦合多種工具格式，降低後續來源擴充成本。
- 替代方案：
  - 方案 A：維持 raw text，依來源在 extraction 內部分支。
  - 未採用原因：分支會隨來源數增長，難維護與回歸測試。

### Decision 2: `timestamp` 採可空 ISO 8601 字串

- 決策：`ConversationMessage.timestamp` 必須存在鍵，但可為 `null`；有值時必須為 ISO 8601。
- 理由：部分來源缺少時間資訊，若強制必填會造成 adapter 失敗或假資料。
- 替代方案：
  - 方案 A：完全必填。
  - 未採用原因：不符合多來源實際資料品質。

### Decision 3: `source` 採受控字串集合 + 可擴充命名

- 決策：保留核心值 `plain` / `chatgpt` / `copilot`，並允許 `custom:<tool>`。
- 理由：先滿足 V3 近程來源，同時保留 V3.x 與 V4 擴充彈性。
- 替代方案：
  - 方案 A：完全自由字串。
  - 未採用原因：統計與追溯會失去一致性。

### Decision 4: 本 change 僅交付文件與規格，不落實作

- 決策：先建立契約，再由後續 change 實作 adapter 與 extraction 接線。
- 理由：符合 roadmap 對 change 拆分與最小安全修改原則。
- 替代方案：
  - 方案 A：一次完成 schema + adapter refactor。
  - 未採用原因：範圍過大，驗證困難，且不符合本次 In Scope A。

## Risks / Trade-offs

- [Risk] `source` 命名規則執行不一致（例如 `copilot-chat`、`vscode-copilot` 並存）  
  → Mitigation：在 schema 文件提供受控值與 `custom:<tool>` 規則，後續 adapter 必須明確對映。
- [Risk] `timestamp = null` 造成排序差異  
  → Mitigation：在 schema 文件定義排序 fallback（無 timestamp 時按原始訊息順序）。
- [Risk] 僅 docs 交付可能被誤解為功能已上線  
  → Mitigation：在 proposal / tasks / workflow 文件重申本 change 非實作、僅定義契約。

## Migration Plan

1. 由 `plain-text-adapter-refactor` 將既有純文字輸入封裝成 `ConversationDoc`（`source: plain`）。
2. `chatgpt-adapter` 與 `local-import-vscode-copilot` 依本 schema 對映欄位。
3. 在 extraction 入口新增 schema 驗證（至少 unit-level），失敗時回傳可讀錯誤訊息。
4. 若需要回滾，adapter 可暫時保留 raw text fallback，不改既有 writeback 格式。

## Open Questions

- `metadata` 是否需要在 V3 就納入 `sessionId` 與 `title` 為強制欄位？
- `custom:<tool>` 在 UI 顯示時是否要轉為友善名稱映射？
- 後續 unit-level 驗證採手寫 validator 或 JSON Schema 檔案管理？
