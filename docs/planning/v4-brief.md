# V4 Brief — 治理、自動化、個人 AI 作業系統

> 這份文件是 `V4` 的版本確認書。
> 作用是定義：這一版要解什麼問題、做什麼、不做什麼、何時算完成。
> 它位在 `roadmap` 和 `OpenSpec change` 之間。

---

## 版本定位

`V4` 是 **個人 AI 作業系統**。

它不是再新增對話來源，也不是繼續擴張功能頁面。
它的任務是讓這個系統**開始幫你維護自己**：記憶品質自動監控、規則衝突自動提示、跨專案知識自動沉澱——讓工作台從「你管理它」變成「它協助你管理知識」。

---

## 背景與動機

V3 完成後，工作台已具備完整的知識輸入管道：
- 多工具對話可匯入 ✅（V3）
- 知識提取 → 審核 → 寫回可跑通 ✅（V1）
- writeback 有 backup 保護 ✅（V2）
- 多專案資料源可真切換 ✅（V2）
- 記憶有來源標記 ✅（V3）

但這些能力全都是「你主動使用」的工具。系統本身不會主動告訴你：
- 這條記憶是三個月前的，還適用嗎？
- 這兩條規則互相矛盾
- 你在 ProjectA 建立的某個模式，ProjectB 也需要

隨著使用時間增長，記憶庫會變得雜亂、規則庫會出現衝突、跨專案的共通知識會分散在各處。

V4 要回答的問題是：**能不能讓這個系統在你不注意的時候，維持自己的知識品質？**

---

## V4 完成後，使用者應該可以做到什麼

- 打開工作台，看到「知識健康度儀表板」：哪些記憶可能過期、哪些規則互相衝突、哪些內容重複
- 一鍵觸發（或設定定期執行）記憶清理建議，審核後寫回
- 系統提示「你在多個專案都記錄了類似的模式，要不要整合成共用技能？」
- 看到跨專案的共用知識庫，不同專案可引用同一套個人偏好與工作模式
- 不需要自己記得「上次清理記憶庫是什麼時候」

---

## In Scope

### A. 記憶品質評分與健康度儀表板

為每條記憶自動計算健康度分數（新鮮度、使用頻率、來源可信度），並在 `/memory` 頁面顯示整體健康摘要。

- 定義記憶健康度評分模型（staleness / frequency / source weight）
- `/memory` 頁面新增「健康度概覽」區塊（總條目、過期比例、建議清理數量）
- 每條記憶旁顯示健康度標記（🟢 健康 / 🟡 待確認 / 🔴 過期）

### B. 記憶去重與合併建議

自動偵測內容相似的記憶條目，提供合併或刪除建議，使用者審核後執行。

- 相似度比對（關鍵詞重疊 + 語意分群，初期採輕量啟發式）
- 在 `/memory` 頁面顯示「疑似重複」群組，供使用者確認
- 支援「合併為一條」與「刪除其中一條」操作，操作前自動 backup

### C. 規則衝突自動偵測

超越 V1 的否定詞前綴比對，提供更完整的規則衝突偵測與解釋。

- 偵測同類別規則中互相矛盾的描述（例：偏好 A 與禁止 A）
- 在 `/decisions` 頁面顯示衝突列表與衝突原因說明
- 標記「可能衝突」而非強制修改，使用者自行決定保留哪條

### D. 跨專案共用知識庫（Shared Knowledge）

識別多個專案中重複出現的模式與偏好，提供整合為「個人共用技能」的建議。

- 跨專案掃描記憶與規則，找出重複主題
- 建立 `docs/shared/` 目錄，存放跨專案共用的偏好、模式、技能摘要
- 各專案可引用 shared 知識，不需在每個專案重複記錄

### E. 例行治理排程（Governance Scheduler）

讓使用者設定定期（每週/每月）自動觸發健康度掃描，並在下次開啟工作台時顯示待審核的治理建議。

- 設定檔（`web/governance.json`）定義掃描頻率與觸發條件
- 每次啟動 server 時檢查是否有待執行的排程掃描
- 掃描結果以「治理待辦」形式顯示（不強制執行，使用者確認後才寫入）

---

## Out of Scope（留到後續版本或長期研究）

以下內容**不屬於 V4**：

- 向量搜尋、embeddings、RAG（需外部服務依賴）
- AI 自動生成記憶或決策（需 LLM API 整合）
- 多使用者協作（目前設計為個人工作台）
- 雲端同步或遠端部署
- 自動 commit / push 到 git（仍保持人工觸發）
- 完全自動化的知識清理（保持人工審核閘門）

---

## 完成條件（Acceptance Criteria）

| # | 驗收條件 | 驗收方式 |
|:-:|---------|---------|
| 1 | 記憶條目有健康度標記（🟢/🟡/🔴）| `/memory` 頁面顯示標記與健康度概覽 |
| 2 | 相似記憶偵測後可建議合併 | 新增 2 條相似記憶 → 系統提示疑似重複 → 合併後確認只剩 1 條 |
| 3 | 規則衝突偵測超越否定詞前綴 | 建立已知衝突規則 → `/decisions` 顯示衝突說明 |
| 4 | 多專案掃描後可輸出共用主題建議 | 2 個專案有相同主題記憶 → 系統建議整合 → `docs/shared/` 產出 |
| 5 | 排程掃描設定可讀，下次啟動後顯示治理待辦 | 設定每週掃描 → 重啟 server → 顯示待審核清單 |
| 6 | 所有自動操作均有操作前備份 | 任一自動建議執行後 → `.backup/` 有對應備份 |

---

## 預計拆分的 Changes

| Change 名稱 | 使用者故事 | 狀態 | 備註 | 使用方式 |
|---|---|---|---|---|
| `memory-health-scoring` | 身為長期使用工作台的使用者，我想要看到每條記憶的「健康度」標記，以便知道哪些記憶可能已經過期或不再適用，不需要自己一條一條翻 | ✅ 已 archive | 定義健康度評分模型（新鮮度 × 來源權重）；`/memory` 頁面顯示 🟢/🟡/🔴 標記與健康度概覽卡片；評分邏輯在 server 端計算，不需前端 LLM | `/memory` → 頁面頂部顯示健康度摘要，每條記憶旁顯示標記 |
| `memory-dedup-suggestions` | 身為記憶庫越來越大的使用者，我想要系統主動告訴我哪些記憶內容重複或相似，以便我可以一次整理，而不是等到記憶庫混亂到難以使用 | ✅ 已 archive | 輕量啟發式關鍵詞重疊比對（無需 LLM）；`/memory` 頁面顯示「疑似重複」群組；支援「合併」與「刪除」，操作前自動 backup；merge action 已補上 server-side group membership 驗證，main spec sync 與 archive 已完成 | `/memory` → 「疑似重複」區塊 → 選擇合併或忽略 |
| `rule-conflict-detection-v2` | 身為有很多偏好規則的使用者，我想要系統自動偵測規則間的矛盾並解釋為什麼衝突，以便我不需要自己記住所有規則的邏輯關係 | ✅ 已 archive | 超越 V1 否定詞前綴比對；偵測同類別互斥規則（如「偏好極簡」vs「需要詳細說明」）；本輪 scope 鎖定 `/decisions` conflict overview + explanation + targeted verify，不做 auto-fix / writeback；main spec sync 與 archive 已完成 | `/decisions` → 規則 tab 查看衝突摘要與原因說明 |
| `cross-project-shared-knowledge` | 身為管理多個專案的使用者，我想要系統識別我在不同專案中重複記錄的相同偏好和模式，以便整合成一份共用的個人知識庫，不需要在每個專案重複維護 | 未開始 | 跨專案掃描 `docs/memory/` 找重複主題；建立 `docs/shared/` 存放共用知識；各專案記憶頁顯示「來自共用庫」標記；不自動搬移，使用者確認後整合 | `/memory` → 「共用知識」區塊 → 或 `/shared`（新頁面）|
| `governance-scheduler` | 身為不想手動定期維護知識庫的使用者，我想要設定工作台每隔一段時間自動掃描一次，然後在我開啟工作台時告訴我有哪些需要處理的治理待辦，以便在我不主動想到的時候也能維持知識庫的品質 | 未開始 | `web/governance.json` 定義掃描頻率；server 啟動時檢查是否到期；掃描結果以「治理待辦」清單形式在 Overview 頁顯示；不主動寫檔，使用者確認才執行 | `web/governance.json` 設定頻率 → 重啟 server → Overview 頁顯示待辦清單 |

---

## Codex 執行 Prompt 清單

> 使用方式：複製下方路徑，於 Codex CLI terminal 執行：
> ```powershell
> codex --yolo < docs/agents/codex-prompts/v4/<filename>.md
> ```
> 角色切換（Planner → Executor → Review）**必須開新 session**，不可 resume。
>
> 狀態說明：`—` 未執行 ｜ `🔄 執行中` ｜ `✅ 完成`

| # | 路徑 | 角色 | Change | 狀態 |
|---|------|------|--------|------|
| 01 | `docs/agents/codex-prompts/v4/01-memory-health-scoring-plan.md` | Planner | memory-health-scoring | — |
| 02 | `docs/agents/codex-prompts/v4/02-memory-health-scoring-execute.md` | Executor | memory-health-scoring | ✅ 完成 |
| 03 | `docs/agents/codex-prompts/v4/03-memory-health-scoring-review.md` | Review Gate | memory-health-scoring | ✅ PASS |
| 04 | `docs/agents/codex-prompts/v4/04-memory-dedup-suggestions-plan.md` | Planner | memory-dedup-suggestions | — |
| 05 | `docs/agents/codex-prompts/v4/05-memory-dedup-suggestions-execute.md` | Executor | memory-dedup-suggestions | ✅ 完成 |
| 06 | `docs/agents/codex-prompts/v4/06-memory-dedup-suggestions-review.md` | Review Gate | memory-dedup-suggestions | ✅ PASS |
| 07 | `docs/agents/codex-prompts/v4/07-rule-conflict-detection-v2-plan.md` | Planner | rule-conflict-detection-v2 | — |
| 08 | `docs/agents/codex-prompts/v4/08-rule-conflict-detection-v2-execute.md` | Executor | rule-conflict-detection-v2 | ✅ 完成 |
| 09 | `docs/agents/codex-prompts/v4/09-rule-conflict-detection-v2-review.md` | Review Gate | rule-conflict-detection-v2 | ✅ PASS |
| 10 | `docs/agents/codex-prompts/v4/10-cross-project-shared-knowledge-plan.md` | Planner | cross-project-shared-knowledge | — |
| 11 | `docs/agents/codex-prompts/v4/11-cross-project-shared-knowledge-execute.md` | Executor | cross-project-shared-knowledge | — |
| 12 | `docs/agents/codex-prompts/v4/12-cross-project-shared-knowledge-review.md` | Review Gate | cross-project-shared-knowledge | — |
| 13 | `docs/agents/codex-prompts/v4/13-governance-scheduler-plan.md` | Planner | governance-scheduler | — |
| 14 | `docs/agents/codex-prompts/v4/14-governance-scheduler-execute.md` | Executor | governance-scheduler | — |
| 15 | `docs/agents/codex-prompts/v4/15-governance-scheduler-review.md` | Review Gate | governance-scheduler | — |

---

## 跨版本影響

| 方向 | 說明 |
|------|------|
| **依賴 V2** | writeback backup 機制（V2 Change 1）— V4 所有自動操作均需 backup 保護 |
| **依賴 V2** | 多專案資料源（V2 Change 2）— cross-project 掃描需要真正的多專案資料隔離 |
| **依賴 V3** | source attribution（V3）— 健康度評分使用來源權重，需要 `source` 欄位 |
| **依賴 V3** | `ConversationDoc` schema — 治理排程掃描的輸入格式標準化基礎 |

---

## 使用者影響與 Manual Sync

- **使用者可見影響**：有
- **影響摘要**：`/memory` 頁面新增健康度標記與去重建議；`/decisions` 規則衝突偵測升級；新增 `/shared` 跨專案知識頁；Overview 頁顯示治理待辦清單
- **需同步更新的 `docs/system-manual.md` 區段**：
  - 「知識提取與寫回（/extract）」— 補充去重與合併操作說明
  - 「決策與規則檢視（/decisions）」— 說明升級後的衝突偵測
  - 新增「跨專案共用知識（/shared）」章節
  - 新增「治理排程」設定說明
  - 「版本歷史摘要」— 加入 V4 完成記錄

---

## 使用者確認

- **確認日期**：2026/4/4
- **確認人**：Wilson
- **確認範圍**：全部
- **備註**：

---

## 版本狀態

- **開始日期**：2026/4/4
- **完成日期**：
- **狀態**：進行中
