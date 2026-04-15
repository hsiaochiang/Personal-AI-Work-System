# V6 Brief — 記憶 AI 策展層（Memory AI Curator）

> 這份文件是 `V6` 的版本確認書。  
> 作用是定義：這一版要解什麼問題、做什麼、不做什麼、何時算完成。  
> 它位在 `roadmap` 和 `OpenSpec change` 之間。

---

## 版本定位

`V6` 是 **記憶 AI 策展層**。

V1–V5 讓工作台能夠「收進」知識，V6 要讓工作台能夠「整理」知識。
核心任務是引入 **AI 記憶策展員（Memory Curator）**機制：讓 Gemini 協助使用者整頓記憶庫，並讓每個記憶條目變得「可操作」。

---

## 背景與動機

V5 完成後，工作台能匯入 Gemini / Claude / ChatGPT 對話，也能用 Gemini API 做語意提取。但知識進來之後就靜止了——使用者面對大量記憶條目，卻沒有任何操作工具。

三個具體痛點：

1. **看得到、動不了**：`/memory` 頁面沒有刪除按鈕，無法移除過時或錯誤的條目。
2. **量大、不知從何下手**：KPI 顯示「185 條建議清理」，但點下去什麼都不發生。
3. **AI 有審查結果、但不能接手執行**：AI 告訴你「這個分類有問題」，但你無法讓 AI 幫你改。

V6 要回答的問題是：**如何讓記憶庫從「靜態倉庫」變成「可維護的動態知識庫」？**

---

## V6 完成後，使用者應該可以做到什麼

- 在記憶頁看到每個條目旁都有「刪除」按鈕，刪除後自動備份
- 點擊 KPI「建議清理」後，列表只顯示需要注意的條目（有問題的條目優先）
- 對任意記憶分類點擊「AI 整理此分類」，Gemini 提出改善版本，使用者確認後一鍵覆寫
- AI 品質審查的每筆建議旁有「跳至分類」捷徑，讓建議可以立刻 action

---

## In Scope

### Change 1：`memory-ai-curator`

引入三個層次的記憶策展能力：

**層次一：操作能力（讓使用者能動）**
- 每個記憶條目加上「刪除」按鈕（`POST /api/memory/item/delete`）
- 刪除前自動備份，不可逆操作需 confirm() 確認
- `POST /api/memory/item/delete` 需確認 itemId 定位機制（T-02）

**層次二：AI 輔助整理**
- 「AI 整理此分類」：送整個分類給 Gemini，回傳改善建議，使用者確認後覆寫（`POST /api/memory/ai-curate`）
- 複用 `geminiGenerateContent()` 函式（v1.1.10 已建立）

**層次三：KPI 可點擊篩選**
- KPI「建議清理」點擊 → 前端 filterMode 切換，只顯示 `health.status !== 'healthy'` 的條目
- AI 審查結果加上「跳至分類」捷徑

**Tasks**：T-01 ~ T-06（含前端、後端、smoke）

---

## Out of Scope（留到後續版本）

- **Inline 編輯**：條目文字框編輯，複雜度超過目前需求
- **批次整理所有分類**：一次送全部分類給 AI，保持逐分類觸發、人工確認
- **跨專案記憶同步**：各專案記憶庫獨立，不做同步
- **向量搜尋 / embeddings / RAG**：搜尋能力留到更後期版本
- **新增記憶分類**：分類架構不變
- **改動 Extract / Writeback 流程**：知識進入路徑不調整

---

## 完成條件（Acceptance Criteria）

| # | 驗收條件 | 驗收方式 |
|:-:|---------|---------|
| 1 | `/memory` 每個條目都有可確認刪除的操作入口，且成功刪除前會先 backup | UI 操作單條刪除 → 後端回傳 success → `.backup/` 產生新檔 |
| 2 | 點擊 KPI「建議清理」後只顯示 `health.status !== 'healthy'` 的條目，且可回到完整列表 | `/memory` 點擊 KPI → 列表切到問題條目 → 再點一次或清除篩選回到完整列表 |
| 3 | 每個記憶分類都有「AI 整理」入口，Gemini 會回傳改善版，使用者確認後才覆寫 | 觸發 `/api/memory/ai-curate` → 顯示 before/after 預覽 → 確認覆寫 |
| 4 | AI 品質審查的每條建議都可跳到對應分類 | `/memory` 點 AI 品質審查 → 點某筆 `file` → 頁面滑動到對應 category |
| 5 | `memory-ai-curator` strict validate、targeted verify、smoke 全部通過 | `openspec validate --changes "memory-ai-curator" --strict` + 本 change 驗證腳本 / smoke 文件 |

---

## 預計拆分的 Changes

| Change 名稱 | 使用者故事 | 狀態 | 備註 | 使用方式 |
|---|---|---|---|---|
| `memory-ai-curator` | 身為需要持續整理知識庫的使用者，我想要在 `/memory` 直接刪除問題條目、只看需要清理的內容，並讓 Gemini 針對單一分類提出整理建議，以便把記憶庫從靜態倉庫變成可維護的工作介面 | 🔄 進行中 | T-01~T-06、strict validate、targeted verify、memory regression、syntax check、ephemeral API smoke、UI review、UX review、Review Gate、implementation commit 與 push 已完成；下一步進入 `/opsx-sync`，archive 待人工決定 | `/memory` → 刪除條目 / 點 KPI 篩選 / 點「AI 整理」→ 確認覆寫 |

---

## Codex 執行 Prompt 清單

> 使用方式：複製下方路徑，於 Codex CLI terminal 執行：
> ```powershell
> codex --yolo < docs/agents/codex-prompts/v6/<filename>.md
> ```
> 角色切換（Planner → Executor → Review）**必須開新 session**，不可 resume。
>
> 狀態說明：`—` 未執行 ｜ `🔄 執行中` ｜ `✅ 完成`

| # | 路徑 | 角色 | Change | 狀態 |
|---|------|------|--------|------|
| 01 | `docs/agents/codex-prompts/v6/01-memory-ai-curator-plan.md` | Planner | memory-ai-curator | ✅ 完成 |
| 02 | `docs/agents/codex-prompts/v6/02-memory-ai-curator-execute.md` | Executor | memory-ai-curator | ✅ 完成 |
| 03 | `docs/agents/codex-prompts/v6/03-memory-ai-curator-review.md` | Review Gate | memory-ai-curator | ✅ 完成 |

---

## Done Gate

- [x] `memory-ai-curator` 所有 tasks（T-01 ~ T-06）標記 `[x]`
- [x] Smoke 文件：`docs/qa/<date>_memory-ai-curator-smoke.md` 全通過
- [x] 無新增 open issue
- [x] git commit + push

---

## 使用者確認

> **確認狀態**：✅  
> **確認者**：Wilson  
> **確認日期**：2026-04-14

確認後請將「確認狀態」改為 ✅，並填入日期。確認前不得開始實作。

---

## 跨版本影響

| 方向 | 說明 |
|------|------|
| **依賴 V4** | `memory-health-scoring` 提供 `health.status` 與 summary，作為 KPI 篩選與問題條目聚焦基礎 |
| **依賴 V4** | `memory-dedup-suggestions` 已建立 memory rewrite + backup 邊界，可作為單條刪除的安全基線 |
| **依賴 V5** | `geminiGenerateContent()` 與 Gemini key 設定已存在，V6 的 AI curate 直接複用此能力 |
| **影響後續版本** | 若 V6 驗證良好，後續可再評估批次 curate、inline edit、shared memory action 或更進一步的搜尋能力 |

---

## 使用者影響與 Manual Sync

- **使用者可見影響**：有
- **影響摘要**：`/memory` 將新增單條刪除、KPI 問題篩選、逐分類 AI 整理與 AI review 直接跳轉，讓記憶管理從只讀檢視升級成可操作的治理介面
- **需同步更新的 `docs/system-manual.md` 區段**：
  - 「目前版本」
  - 「專案記憶（/memory）」
  - 「已知限制」
  - 「Planning Impact Log」
- **備註**：在 V6 功能尚未實作完成前，manual 應先同步版本狀態與 planning 進度，但不要宣稱能力已上線

---

## 版本狀態

- **開始日期**：2026-04-14
- **完成日期**：
- **狀態**：執行中（implementation commit + push 已完成；待 `/opsx-sync`，archive 待人工決定）

---

## 版本技術基礎

- **DEV**：`D:\program\Personal-AI-Work-System` → PORT 3000
- **PROD**：`D:\prod\Personal-AI-Work-System` → PORT 3001
- **依賴**：`geminiGenerateContent()`（v1.1.10 已建立）、`writeMemoryFileWithBackup()`（既有）
- **不新增外部 dependency**
