# V3 Brief — 跨工具整合層

> 這份文件是 `V3` 的版本確認書。
> 作用是定義：這一版要解什麼問題、做什麼、不做什麼、何時算完成。
> 它位在 `roadmap` 和 `OpenSpec change` 之間。

---

## 版本定位

`V3` 是 **跨工具整合層**。

它不是繼續打磨 V2 的工作台功能，也不是跳到 V4 的自動化治理。  
它的任務是讓這個工作台**打開第一扇窗**：不論你用的是 Copilot、ChatGPT、Gemini 還是其他 AI 工具，產生的對話知識都能被匯入、審核並寫回專案記憶。

---

## 背景與動機

V2 完成後，工作台已經是一個可信任的單入口知識循環系統：
- handoff 可產生 ✅
- extraction → review → writeback 可跑通 ✅
- writeback 有 backup 保護 ✅
- 多專案資料源可真切換 ✅

但現在有一個根本性的限制：**所有對話都必須手動貼上純文字**。

實際工作中，知識產生的地方不只一個：
- 你在 ChatGPT 解決了架構問題
- 你在 Gemini 寫了一段分析
- 你在 VS Code Chat 定了一個設計決策

這些全都需要你手動複製、手動貼上、手動提取。這個流程不可持續。

V3 要回答的問題是：**能不能讓多個 AI 工具的對話知識，用稍微少一點的摩擦流進這個工作台？**

---

## V3 完成後，使用者應該可以做到什麼

- **真正 auto-import（本機自動讀取）**：在 VS Code 使用 GitHub Copilot Chat 產生的對話，可直接從本機 JSONL 檔案讀取，選擇 session 即可匯入，完全不需複製貼上
- **半自動 import（手動匯出 + 貼上/上傳）**：ChatGPT 對話可從官方 JSON 匯出後上傳，或直接複製分享頁面文字貼入，系統自動識別格式並正規化
- 進入 extraction → review → writeback 的既有流程，不需要知道對話來自哪個 AI 工具
- 看到每條記憶的來源標記（出自 Copilot / ChatGPT / 純文字）
- 理解目前哪些格式被支援，哪些不支援（包含不支援原因說明）

---

## In Scope

### A. Conversation Schema 標準化

定義一套內部格式（`ConversationMessage[]`），讓所有 AI 工具的對話都能轉換為統一結構，再送入既有的 extraction engine。

- 定義 `ConversationMessage` 型別結構（role / content / source / timestamp）
- 定義 `ConversationDoc` 包裝格式（messages / metadata）
- 文件化 schema（`docs/workflows/conversation-schema.md`）

### B. 工具 Adapter（初期：VS Code Copilot Chat 自動讀取 + ChatGPT 半自動）

針對各工具的特性，實作最小可行的 adapter，輸出為 `ConversationDoc`。

- `LocalImportVSCodeCopilot`（**真正 auto-import**）：自動讀取本機 `%AppData%\Code - Insiders\User\globalStorage\<ext>\*.jsonl`，列出最近 session 讓使用者點選匯入，不需複製貼上
- `ChatGPTAdapter`（**半自動**）：支援 ChatGPT JSON 官方匯出格式 + 分享頁面複製格式；需使用者手動匯出後上傳或貼上
- 純文字（`PlainTextAdapter`）：維持現有行為作為 fallback
- 格式偵測邏輯（根據輸入自動判斷或手動選擇 adapter）

### C. 對話來源標記（Source Attribution）

讓記憶可追溯到來源工具。

- writeback 時在 memory 條目加入 `source` metadata（工具名稱）
- memory 頁面顯示來源標記（小 badge）
- 不強制來源（純文字貼上仍可用，標記為 `plain`）

### D. Import UI（匯入入口改版）

讓 extract 頁面支援多種匯入方式。

- 現有純文字貼上入口保留，加入「選擇工具來源」下拉選單
- 支援檔案上傳（`.json` / `.txt`），自動送入對應 adapter
- 在候選清單中顯示每條候選的對話來源

---

## Out of Scope（留到後續版本）

以下內容**不屬於 V3**：

- **Gemini / Claude 貼上 adapter** → V3.x（技術上可行，但先讓核心架構穩定）
- **Codex app（OpenAI GUI）真正 auto-import**：Codex app 對話儲存為雲端 Thread（與 ChatGPT API 相同），本機 `.codex/` 資料夾只含專案設定，無對話記錄；真正自動匯入需 OAuth / API key → V4 或之後
- **Claude Desktop auto-import**：本機資料為 LevelDB 二進位，且大部分對話在伺服器端；可行性低 → 不列入計畫
- 透過 OAuth / API key 自動從任何 AI 工具雲端帳號抓取對話（V4 或之後）
- shared / personal / project 多層知識分流機制
- 向量搜尋 / embeddings / RAG
- 對話品質評分或重複偵測自動化
- 大型前端框架重構

---

## 完成條件（Acceptance Criteria）

| # | 驗收條件 | 驗收方式 |
|:-:|---------|---------|
| 1 | `ConversationMessage` schema 有文件且有 unit-level 驗證 | `docs/workflows/conversation-schema.md` 存在；adapter 輸出符合 schema |
| 2 | 貼上 ChatGPT 對話格式，系統自動識別並提取候選 | 端對端測試（copy 真實 ChatGPT 對話 → extraction → 有候選輸出） |
| 3 | 從本機自動讀取 VS Code Copilot Chat JSONL，選擇 session 後提取流程可跑通 | 端對端測試（在本機執行，確認可讀取 JSONL 並輸出候選） |
| 4 | 純文字貼上仍可用（backward compatible） | 既有 smoke test 全數通過 |
| 5 | writeback 後記憶條目有 `source` 欄位 | 在 memory 頁面看到來源 badge |
| 6 | Import 頁面有工具來源下拉 + 檔案上傳入口 | UI 可操作 |
| 7 | `docs/workflows/conversation-schema.md` 文件完整 | 文件存在，描述欄位與 adapter 清單 |

---

## 預計拆分的 Changes

| Change 名稱 | 使用者故事 | 狀態 | 備註 | 使用方式 |
|---|---|---|---|---|
| `conversation-schema-definition` | 身為開發者，我想要一份清楚定義對話格式的 schema 文件，以便所有 adapter 有一致的輸出標準、extraction engine 無需知道來源工具 | `#opsx-archive` 已完成（2026-04-03） | 定義 `ConversationMessage`（role/content/source/timestamp）與 `ConversationDoc` 包裝格式；產出 `docs/workflows/conversation-schema.md`；不改動現有 extraction 邏輯 | 開發者參照 `docs/workflows/conversation-schema.md` 撰寫 adapter |
| `plain-text-adapter-refactor` | 身為使用者，我想要貼上純文字的流程繼續和以前一樣工作，以便 V3 升級不破壞我現有的使用習慣 | 未開始 | 將現有純文字貼上邏輯抽取為 `PlainTextAdapter`，輸出 `ConversationDoc`；為後續 adapter 建立介面基線；extraction engine 改為接受 `ConversationDoc` 而非裸文字 | `http://localhost:3000/extract` → 純文字貼上 → 流程不變 |
| `chatgpt-adapter` | 身為在 ChatGPT 工作的使用者，我想要把 ChatGPT 的對話複製貼上或上傳，讓系統自動識別並提取知識，以便不用手動清理格式就能把 ChatGPT 的思考結果存進專案記憶 | 未開始 | 實作 `ChatGPTAdapter`：解析 ChatGPT 共享頁面複製格式與 JSON 匯出格式；自動偵測或手動選擇；輸出 `ConversationDoc`（source: `chatgpt`） | `/extract` → 選工具來源「ChatGPT」→ 貼上或上傳 `.json` |
| `local-import-vscode-copilot` | 身為每天使用 VS Code GitHub Copilot Chat 的使用者，我想要不用複製貼上，直接從本機自動讀取 Copilot Chat 的對話記錄，以便讓開發過程的決策與知識能用最少摩擦流進記憶系統 | 未開始 | 自動讀取 `%AppData%\Code - Insiders\User\globalStorage\<ext>\*.jsonl`；列出最近 N 個 session 供選擇；輸出 `ConversationDoc`（source: `copilot`）；路徑設定可由使用者覆寫 | `/extract` → 點選「從 VS Code 讀取」→ 選 session → 直接提取候選 |
| `source-attribution-in-memory` | 身為需要追溯知識來源的使用者，我想要在記憶條目旁看到「這是從哪個 AI 工具的對話提取的」，以便判斷這條記憶的可信度與背景脈絡 | 未開始 | writeback 時在 memory markdown 條目加入 `<!-- source: chatgpt -->` metadata；memory 頁面解析並顯示來源小 badge（純色標籤，不破壞現有列表樣式） | `/memory` → 每條記憶旁顯示來源 badge |
| `import-ui-multi-source` | 身為每天使用多個 AI 工具的使用者，我想要在匯入頁面選擇對話來源工具，不論是本機自動讀取還是手動上傳貼上，以便讓系統自動用正確的方式解析，而不是每次都要確認格式是否正確 | 未開始 | `/extract` 頁面改版：保留既有純文字貼上區域；新增「工具來源」下拉選單（VS Code Copilot / ChatGPT / 純文字）；VS Code 選項顯示本機 session 列表（自動讀取）；ChatGPT 選項顯示貼上 + `.json` 上傳入口；根據選擇自動呼叫對應 adapter | `/extract` → 選工具（VS Code → 選 session；ChatGPT → 貼上/上傳）→ 提取候選 |

---

## 跨版本影響

| 方向 | 說明 |
|------|------|
| **依賴 V2** | writeback backup 機制（V2 Change 1）— writeback 必須已有 backup 才能放心讓多工具寫回 |
| **依賴 V2** | 多專案資料源切換（V2 Change 2）— source attribution 需要知道當前專案 |
| **影響 V4** | `ConversationDoc` schema 是 V4 自動化治理與批次匯入的基礎格式 |
| **影響 V4** | 來源標記機制（source metadata）是 V4 記憶品質檢查的前提 |

---

## 使用者影響與 Manual Sync

- **使用者可見影響**：有
- **影響摘要**：`/extract` 頁面新增工具來源選擇與檔案上傳；`/memory` 頁面記憶條目新增來源 badge；既有純文字貼上流程不變
- **需同步更新的 `docs/system-manual.md` 區段**：
  - 「知識提取與寫回（/extract）」— 說明新的工具來源選擇與格式支援
  - 「多專案管理 / 記憶（/memory）」— 說明來源 badge
  - 「版本歷史摘要」— 加入 V3 完成記錄

---

## 使用者確認

- **確認日期**：2026/4/2
- **確認人**：Wilson
- **確認範圍**：全部
- **備註**：auto-import 範圍依可行性評估修訂；sidebar/navigation/dashboard 留 V5

---

## 版本狀態

- **開始日期**：
- **完成日期**：
- **狀態**：規劃中
