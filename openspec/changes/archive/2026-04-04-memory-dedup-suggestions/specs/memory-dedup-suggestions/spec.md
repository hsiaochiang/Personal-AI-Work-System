## ADDED Requirements

### Requirement: `/api/memory` MUST 提供疑似重複摘要與 suggestion groups

系統 MUST 在保留既有 memory raw content、health summary 與 enriched groups 的前提下，為同一 memory 檔中的疑似重複條目提供 dedup summary 與可供 UI 直接使用的 suggestion groups。

#### Scenario: API 回傳 dedup summary
- **WHEN** 使用者或前端呼叫 `/api/memory`
- **THEN** 系統 MUST 仍回傳每個 memory 檔案的 `filename`、`content` 與既有 health metadata
- **AND** response MUST 額外包含 dedup summary（至少包含 duplicate group 數量與涉及條目數）

#### Scenario: API 回傳 suggestion group 與 primary item
- **WHEN** 系統在同一 memory 檔內找到相似度超過閾值的多筆條目
- **THEN** response MUST 提供 suggestion groups
- **AND** 每個 group MUST 包含 group id、涉及的 item ids、similarity 與推薦保留的 primary item

### Requirement: 系統 MUST 用輕量 heuristic 偵測同檔案內的近似記憶

dedup suggestion MUST 以可重跑的 deterministic heuristic 計算，至少納入 normalized text overlap，並限制在同一 memory 檔案內比對。

#### Scenario: 同一檔案內的近似條目被標為 duplicate suggestion
- **WHEN** 兩筆以上 item 位於同一 `filename`，且 normalized content overlap 超過 dedup threshold
- **THEN** 系統 MUST 將它們歸入同一 suggestion group
- **AND** suggestion group MUST 可解釋為 exact duplicate 或 near duplicate

#### Scenario: 不同 memory 檔案不被自動合併
- **WHEN** 兩筆內容相似但分別位於不同 memory 檔案
- **THEN** 系統 MUST 不將它們歸入同一可操作 merge group

### Requirement: 系統 MUST 提供安全的 merge 與 delete action

使用者 MUST 能對 suggestion group 觸發人工確認後的 merge 或 delete，且所有改寫都必須先 backup，再限制於 whitelist 內的 memory markdown。

#### Scenario: merge action 保留一條 primary item
- **WHEN** 使用者對某個 duplicate group 執行 merge
- **THEN** 系統 MUST 只保留該 group 的一條 primary item
- **AND** 其餘 duplicate items MUST 從同一 memory 檔案中移除
- **AND** 改寫前 MUST 先建立 `.backup/` 備份

#### Scenario: delete action 僅刪除選定 duplicate item
- **WHEN** 使用者對 duplicate group 中的單一 item 執行 delete
- **THEN** 系統 MUST 只移除該 item
- **AND** 同 group 其他 item MUST 保持不變
- **AND** 改寫前 MUST 先建立 `.backup/` 備份

#### Scenario: action 受限於 whitelist 與 item existence
- **WHEN** dedup action 指向非 whitelist memory 檔案，或 item id 已不存在
- **THEN** 系統 MUST 拒絕該操作
- **AND** 不得改寫任何 memory markdown

### Requirement: `/memory` MUST 顯示 dedup suggestions 並提供人工確認操作

`/memory` 頁面 MUST 使用 API 提供的 dedup metadata，讓使用者看到疑似重複群組、推薦保留條目與可操作的 merge/delete action。

#### Scenario: 頁面顯示 dedup overview
- **WHEN** `/api/memory` 回傳至少一個 duplicate suggestion group
- **THEN** `/memory` 頁面 MUST 顯示 dedup overview / suggestion 區塊
- **AND** 區塊 MUST 呈現 duplicate group 數量與涉及條目數

#### Scenario: 頁面顯示 group items 與操作按鈕
- **WHEN** `/memory` 渲染任一 duplicate suggestion group
- **THEN** group MUST 顯示每個 item 的內容摘要、health/source badge 與推薦 primary 提示
- **AND** UI MUST 提供「合併為一條」與「刪除其中一條」操作入口

### Requirement: 本 change MUST 提供可重跑驗證且不破壞既有 memory consumers

本 change MUST 維持既有 `/api/memory` raw content / health consumers 相容，並提供 targeted verify 覆蓋 dedup heuristic、rewrite 與 UI 契約。

#### Scenario: 既有 memory health / source attribution flow 維持相容
- **WHEN** 既有 `/memory` health badge 或 source badge 邏輯繼續使用 `/api/memory`
- **THEN** 系統 MUST 保留既有欄位與 render 所需資料
- **AND** dedup 擴充不得破壞既有 health / source 顯示

#### Scenario: Targeted verify 覆蓋 heuristic 與 rewrite
- **WHEN** 執行本 change 的 targeted verify
- **THEN** 驗證 MUST 覆蓋 duplicate detection、primary selection、merge/delete rewrite 與 backup 邊界
- **AND** 驗證 MUST 覆蓋 `/memory` 頁面引用 dedup utility / suggestion container / action wiring 的契約
