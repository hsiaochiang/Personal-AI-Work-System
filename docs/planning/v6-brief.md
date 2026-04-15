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

## 完成標準（Done Gate）

- [ ] `memory-ai-curator` 所有 tasks（T-01 ~ T-06）標記 `[x]`
- [ ] Smoke 文件：`docs/qa/<date>_memory-ai-curator-smoke.md` 全通過
- [ ] 無新增 open issue
- [ ] git commit + push

---

## 使用者確認

> **確認狀態**：已確認  
> **確認者**：Wilson  
> **確認日期**：2026-04-14

確認後請將「確認狀態」改為 ✅，並填入日期。確認前不得開始實作。

---

## 版本技術基礎

- **DEV**：`D:\program\Personal-AI-Work-System` → PORT 3000
- **PROD**：`D:\prod\Personal-AI-Work-System` → PORT 3001
- **依賴**：`geminiGenerateContent()`（v1.1.10 已建立）、`writeMemoryFileWithBackup()`（既有）
- **不新增外部 dependency**
