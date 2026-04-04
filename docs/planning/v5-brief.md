# V5 Brief — 外部 API 整合與多工具擴充層

> 這份文件是 `V5` 的版本確認書。
> 作用是定義：這一版要解什麼問題、做什麼、不做什麼、何時算完成。
> 它位在 `roadmap` 和 `OpenSpec change` 之間。

---

## 版本定位

`V5` 是 **外部 API 整合與多工具擴充層**。

它不是繼續打磨 V4 的治理機制，也不是跳到雲端多人協作。
它的任務是讓這個工作台**突破本機邊界**：透過外部 API 自動抓取 ChatGPT / Gemini 等工具的對話記錄，並補齊 V3 遺留的 Gemini、Claude 半自動 adapter，讓多工具知識匯入的覆蓋面更完整。

---

## 背景與動機

V4 完成後，工作台已具備完整的治理自動化能力：
- memory 健康度評分與清理建議 ✅（V4）
- 疑似重複記憶偵測與合併 ✅（V4）
- 規則衝突偵測（signal-based） ✅（V4）
- 跨專案 shared knowledge 候選 ✅（V4）
- Overview 治理待辦排程 ✅（V4）

但有兩個根本性的限制仍在：

1. **工具覆蓋有缺口**：Gemini 和 Claude 的對話必須手動複製貼上（純文字），沒有對應的 adapter，使用者無法以半自動方式匯入這些工具的結構化對話。

2. **所有匯入仍是手動觸發**：即使是 ChatGPT，使用者也必須手動匯出 JSON 或複製分享頁面。若能透過官方 API（需使用者提供 API key）自動抓取最近對話，可大幅降低知識輸入摩擦。

V5 要回答的問題是：**能不能讓更多工具的對話知識，用更少摩擦流進工作台——包含補齊現有工具的 adapter，以及引入 API 金鑰機制支援真正的自動抓取？**

---

## V5 完成後，使用者應該可以做到什麼

- 複製 Gemini 對話文字貼上，系統自動識別 Gemini 格式並解析，不需要手動清理
- 複製 Claude 對話文字貼上，系統自動識別 Claude 格式並解析
- 在設定頁輸入 ChatGPT API key，之後可直接從「選擇來源」點選 API 抓取最近對話，不需操作官方網站匯出
- 每個 adapter 都有明確的「支援格式說明」，使用者知道哪些格式可用
- 看到每條記憶的來源標記（出自 Gemini / Claude / ChatGPT API）

---

## In Scope

### A. Gemini Adapter（半自動 — 貼上解析）

支援將 Google Gemini 對話網頁的複製文字或匯出格式，解析為 `ConversationDoc`。

- 偵測 Gemini 對話文字格式（角色標頭、輪次結構）
- 實作 `GeminiAdapter`：輸出 `ConversationDoc`（source: `gemini`）
- 格式偵測邏輯納入現有 adapter 自動辨識流程
- `/extract` 工具來源下拉新增「Gemini」選項

### B. Claude Adapter（半自動 — 貼上解析）

支援將 Claude.ai 對話網頁的複製文字，解析為 `ConversationDoc`。

- 偵測 Claude 對話文字格式（Human / Assistant 角色區塊）
- 實作 `ClaudeAdapter`：輸出 `ConversationDoc`（source: `claude`）
- 格式偵測邏輯納入現有 adapter 自動辨識流程
- `/extract` 工具來源下拉新增「Claude」選項

### C. ChatGPT API 自動抓取（真正 auto-import）

透過使用者提供的 ChatGPT API key，從 OpenAI API 自動抓取最近 N 筆對話，讓使用者點選後直接進入提取流程。

- settings 頁新增「API Keys」設定區塊（local-only，儲存於 `web/api-keys.json`，不 commit）
- server 端新增 `/api/chatgpt/sessions` endpoint（需 API key，抓取最近 N 筆 Thread 摘要）
- `/extract` 的 ChatGPT 來源選項新增「API 載入」按鈕（需已設定 API key）
- 抓取結果以 `ConversationDoc` 格式進入既有提取流程
- API key 不落入任何 git 追蹤檔案（`.gitignore` 強制排除 `web/api-keys.json`）

### D. 多工具 Adapter 文件補齊

讓所有 adapter 的支援格式、限制與使用說明清楚記錄，使用者知道每個工具能做什麼、不能做什麼。

- 更新 `docs/workflows/conversation-schema.md`：補齊 Gemini / Claude / ChatGPT API adapter 條目
- `/extract` 頁面在每個工具選項下方顯示「支援格式」提示文字（例：「請複製 Gemini 分享頁的全文」）

---

## Out of Scope（留到後續版本或長期研究）

以下內容**不屬於 V5**：

- **Gemini API 自動抓取**：Gemini 官方 API 目前不提供對話歷史讀取（2026/4 時點），故僅支援半自動貼上
- **Claude API 自動抓取**：Claude API 僅支援即時呼叫，無法讀取歷史對話記錄，故僅支援半自動貼上
- **VS Code Copilot Chat** 已在 V3 實作，不在 V5 再調整
- OAuth flow（Google / Anthropic / OpenAI 帳號授權）
- 多使用者協作或共享工作台
- 雲端同步或遠端資料庫
- 自動 commit / push（保持人工觸發）
- 向量搜尋 / embeddings / RAG

---

## 完成條件（Acceptance Criteria）

| # | 驗收條件 | 驗收方式 |
|:-:|---------|---------|
| 1 | 貼上 Gemini 對話，系統自動識別並提取候選 | 複製真實 Gemini 對話 → extraction → 有候選輸出，且 source 標記為 `gemini` |
| 2 | 貼上 Claude 對話，系統自動識別並提取候選 | 複製真實 Claude 對話 → extraction → 有候選輸出，且 source 標記為 `claude` |
| 3 | 設定 ChatGPT API key 後，可從 API 載入最近對話 sessions | settings 頁輸入 key → `/extract` 選 ChatGPT → 點「API 載入」→ 顯示可選 sessions |
| 4 | API key 不被 git 追蹤 | `git status` 確認 `web/api-keys.json` 出現在 `.gitignore` 排除清單 |
| 5 | adapter 文件更新完整 | `docs/workflows/conversation-schema.md` 包含 Gemini / Claude / ChatGPT API 三條 adapter 說明 |
| 6 | `/extract` 工具來源下拉包含 Gemini 和 Claude 選項 | UI 可操作 |
| 7 | 純文字 / ChatGPT 半自動 / VS Code Copilot 仍可用（backward compatible） | 既有 smoke test 全數通過 |

---

## 預計拆分的 Changes

| Change 名稱 | 使用者故事 | 狀態 | 備註 | 使用方式 |
|---|---|---|---|---|
| `gemini-adapter` | 身為使用 Google Gemini 的使用者，我想要把 Gemini 對話直接複製貼上，讓系統自動識別並提取知識，以便不用手動清理格式就能把 Gemini 的思考結果存進記憶 | ✅ 已 archive | 實作 `GeminiAdapter`：解析 Gemini 對話格式；自動偵測或手動選擇；輸出 `ConversationDoc`（source: `gemini`）；main spec sync 與 archive 已完成 | `/extract` → 選工具來源「Gemini」→ 貼上 → 提取候選 |
| `claude-adapter` | 身為使用 Claude 的使用者，我想要把 Claude 對話直接複製貼上，讓系統自動識別並提取知識，以便不用手動清理格式就能把 Claude 的分析結果存進記憶 | 未開始 | 實作 `ClaudeAdapter`：解析 Claude Human/Assistant 對話格式；自動偵測或手動選擇；輸出 `ConversationDoc`（source: `claude`） | `/extract` → 選工具來源「Claude」→ 貼上 → 提取候選 |
| `chatgpt-api-auto-import` | 身為重度使用 ChatGPT 的使用者，我想要直接透過 API key 從 ChatGPT 帳號自動載入最近的對話，以便不需要在官方網站手動操作匯出就能把對話知識帶進工作台 | 未開始 | settings 頁 API key 設定；server `/api/chatgpt/sessions`；`/extract` ChatGPT 選項新增 API 載入按鈕；`web/api-keys.json` 不 commit（.gitignore 追加） | settings → 填入 API key → `/extract` → 選 ChatGPT → 點「API 載入」→ 選 session → 提取候選 |
| `adapter-docs-update` | 身為需要了解工具支援狀況的使用者，我想要在 import 頁面看到每個工具的支援格式說明，以便知道應該複製哪段文字、可以上傳哪種格式，不需要試錯 | 未開始 | 更新 `docs/workflows/conversation-schema.md` 補齊 V5 adapter 說明；`/extract` 各工具選項下方顯示格式提示文字 | `/extract` → 選工具 → 看到「支援格式：...」提示 |

---

## Codex 執行 Prompt 清單

> 使用方式：複製下方路徑，於 Codex CLI terminal 執行：
> ```powershell
> codex --yolo < docs/agents/codex-prompts/v5/<filename>.md
> ```
> 角色切換（Planner → Executor → Review）**必須開新 session**，不可 resume。
>
> 狀態說明：`—` 未執行 ｜ `🔄 執行中` ｜ `✅ 完成`

| # | 路徑 | 角色 | Change | 狀態 |
|---|------|------|--------|------|
| 01 | `docs/agents/codex-prompts/v5/01-gemini-adapter-plan.md` | Planner | gemini-adapter | ✅ 完成 |
| 02 | `docs/agents/codex-prompts/v5/02-gemini-adapter-execute.md` | Executor | gemini-adapter | ✅ 完成 |
| 03 | `docs/agents/codex-prompts/v5/03-gemini-adapter-review.md` | Review Gate | gemini-adapter | ✅ PASS |
| 04 | `docs/agents/codex-prompts/v5/04-claude-adapter-plan.md` | Planner | claude-adapter | — |
| 05 | `docs/agents/codex-prompts/v5/05-claude-adapter-execute.md` | Executor | claude-adapter | — |
| 06 | `docs/agents/codex-prompts/v5/06-claude-adapter-review.md` | Review Gate | claude-adapter | — |
| 07 | `docs/agents/codex-prompts/v5/07-chatgpt-api-auto-import-plan.md` | Planner | chatgpt-api-auto-import | — |
| 08 | `docs/agents/codex-prompts/v5/08-chatgpt-api-auto-import-execute.md` | Executor | chatgpt-api-auto-import | — |
| 09 | `docs/agents/codex-prompts/v5/09-chatgpt-api-auto-import-review.md` | Review Gate | chatgpt-api-auto-import | — |
| 10 | `docs/agents/codex-prompts/v5/10-adapter-docs-update-plan.md` | Planner | adapter-docs-update | — |
| 11 | `docs/agents/codex-prompts/v5/11-adapter-docs-update-execute.md` | Executor | adapter-docs-update | — |
| 12 | `docs/agents/codex-prompts/v5/12-adapter-docs-update-review.md` | Review Gate | adapter-docs-update | — |

---

## 跨版本影響

| 方向 | 說明 |
|------|------|
| **依賴 V3** | `ConversationDoc` schema（V3 Change 1）— 所有新 adapter 輸出格式標準 |
| **依賴 V3** | import UI 多來源框架（V3 Change 6）— 新 adapter 直接插入現有下拉選單 |
| **依賴 V4** | source attribution（V3 / V4）— 新 adapter 的 source 標記需與健康度 / 共用知識掃描相容 |
| **影響後續版本** | ChatGPT API key 機制是未來 OAuth flow 的先行驗證 |

---

## 使用者影響與 Manual Sync

- **使用者可見影響**：有
- **影響摘要**：`/extract` 新增 Gemini 和 Claude 來源選項；ChatGPT 選項新增 API 載入按鈕；settings 頁新增 API Keys 區塊
- **需同步更新的 `docs/system-manual.md` 區段**：
  - 「知識提取與寫回（/extract）」— 說明 Gemini / Claude 半自動貼上與 ChatGPT API 自動載入
  - 「設定（/settings）」— 說明 API Keys 設定區塊
  - 「版本歷史摘要」— 加入 V5 完成記錄

---

## 使用者確認

- **確認日期**：2026/4/4
- **確認人**：Wilson
- **確認範圍**：全部
- **備註**：

---

## 版本狀態

- **開始日期**：2026-04-04
- **完成日期**：
- **狀態**：執行中
