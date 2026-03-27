# v3-multi-tool

## ADDED Requirements

### Requirement: Multi-Tool Adapter Interface Must Be Defined as Abstract Specification Before Runtime Implementation

Phase 5 MUST produce an adapter interface specification that abstractly describes how each supported AI tool (Copilot, Codex, Gemini) maps its raw output to a unified entry point, without binding to specific API endpoints or SDK versions.

#### Scenario: 新工具輸出格式對應

WHEN 需要將 Codex 或 Gemini 的輸出對應到統一提取層時
THEN adapter 規格文件 SHALL 提供各工具的輸入來源路徑、原始格式摘要、預處理規則，描述形式為「輸入 → normalize → 輸出」抽象三段式，不得含 runtime 程式碼或平台 SDK 具體呼叫。

#### Scenario: Adapter 規格過時風險管理

WHEN 工具平台更新其輸出格式時
THEN adapter 規格文件 SHALL 僅更新預處理規則區段（不影響 normalized schema），確保規格邊界清晰、可局部更新而不重寫整份文件。

---

### Requirement: Normalized Schema Must Define a Minimum Required Field Set Enabling Cross-Tool Candidate Comparison

Phase 5 MUST define a normalized schema with ≥6 required fields that enable candidates from different tools to be compared on the same data layer.

#### Scenario: 跨工具欄位缺失比較

WHEN 兩個來自不同工具（Copilot vs Gemini）的候選需要比較時
THEN normalized schema SHALL 確保兩者均含 `tool_source`、`dedupe_key`、`confidence_score`、`content`、`extracted_at`、`status` 欄位，任何欄位缺失應被視為格式不符規格，不得進入比較視圖。

#### Scenario: 與現有候選格式的增量相容

WHEN 現有 `docs/memory/` 路徑下的候選文件使用既有格式時
THEN normalized schema 設計 SHALL 僅新增（ADDED）欄位，不修改現有候選 markdown 欄位結構；現有格式欄位 SHALL 可對應至 normalized schema 中至少 3 個欄位。

---

### Requirement: Dedupe Key Strategy Must Define Deterministic Generation Rules and Conflict Resolution Logic

Phase 5 MUST document at least 2 dedupe_key generation strategies, designate the Phase 5 primary strategy (content hash exact match), and define conflict resolution rules for same-key candidates.

#### Scenario: 相同內容來自不同工具

WHEN 兩個來自不同工具的候選具有相同 content hash 時
THEN 去重策略 SHALL 保留 confidence_score 最高者，並記錄被去重候選的 `tool_source`，不得靜默丟棄被去重的來源資訊。

#### Scenario: 相似但措辭不同的候選去重

WHEN 兩個候選語意相似但 content hash 不同時
THEN Phase 5 去重策略 SHALL 視為兩個獨立候選各自保留（不同 key = 共存）；語意相似去重 SHALL 標注為「Phase 6 增量功能」，不在 Phase 5 中實作或評估。

---

### Requirement: Confidence Score Must Be Derived from Locally Available Docs-Based Metrics Without External API Dependency

Phase 5 MUST define a confidence_score mechanism based on ≥3 dimensions calculable from local docs (e.g., session occurrence count, manual confirmation count, cross-tool validation ratio), independent of any external API or runtime service.

#### Scenario: 高頻出現候選的評分提升

WHEN 某候選在 ≥3 個不同 session 中均被提取並確認時
THEN confidence_score 評分計算 SHALL 將 session 出現次數納入評分維度，並使得重複確認的候選具有更高的 confidence_score，從而在審核排序中提前顯示。

#### Scenario: 零確認新候選的評分初始值

WHEN 某候選是首次由工具提取、尚未經人工確認時
THEN confidence_score 初始值 SHALL 為明確定義的基礎分數（建議：30/100），不得為空或 null；評分格式 SHALL 為 0–100 整數。

---

### Requirement: Multi-Tool Comparison View Spec Must Define Information Architecture Before Any UI Implementation Begins

Phase 5 MUST produce a comparison view specification that defines ≥5 view fields, two comparison modes (side-by-side and aggregated), and switching logic, with explicit Phase 6 UI implementation prerequisites marked.

#### Scenario: 並排比較兩工具輸出

WHEN 使用者需要並排比較 Copilot 與 Gemini 對同一個候選的提取結果時
THEN 比較檢視規格 SHALL 定義 side-by-side 模式的觸發條件（≥1 個）、每欄顯示的欄位清單（至少含 tool_source、content、confidence_score），並明確標注此模式需要 Phase 6 UI 實作。

#### Scenario: 聚合視圖中的跨工具候選合併呈現

WHEN 使用者需要在單一列表中查看所有工具的候選並以 confidence_score 排序時
THEN 聚合比較模式 SHALL 定義合併排序規則（confidence_score DESC）與 dedupe_key 去重後的顯示邏輯；同 dedupe_key 的多來源候選 SHALL 以「合併列＋來源標注」方式呈現，不得重複顯示相同 dedupe_key 的多個列。
