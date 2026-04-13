# Skill: knowledge-extractor（WKM 知識抽取總控）

> 統一處理 Wilson Knowledge Matrix 的四類輸入：連結、完整內容、Wilson 觀點查詢、提示詞片段。
> 觸發時機：使用者想把文章、貼文、YouTube、或 prompt 素材沉澱成可重用知識，但還沒明確指定要 triage、ingest 還是產生觀點時。

---

## 先讀

- `D:\program\WKM\SCHEMA.md`
- `D:\program\WKM\wiki\_index.md`
- `D:\program\WKM\wiki\wilson\profile.md`
- `D:\program\WKM\wiki\wilson\interests.md`
- `D:\program\WKM\wiki\wilson\perspectives.md`

---

## 路由規則

### 1. 只有 URL

先用 `triage-link`。

目標是保護 Wilson 的注意力，而不是把所有連結都讀完。
除非使用者明確要求，否則不要直接 ingest。

### 2. 有文章全文、貼文文字、整理筆記或 YouTube 逐字稿

用 `ingest-content`。

把可沉澱的知識寫進 WKM：
- `source`
- `topic`
- `wilson/perspectives`
- `_index.md`
- `_log.md`

### 3. 問「Wilson 怎麼看」或要 Wilson 視角分析

用 `wilson-perspective`。

必須區分：
- 已記錄的 Wilson 觀點
- 依據框架推斷的暫時觀點

### 4. 輸入是提示詞

抽取成可重複使用的 prompt candidate，至少整理出：
- 目標
- 必要輸入
- 限制條件
- 輸出格式
- 可重用模板
- 適用情境
- 為何有效

目前 WKM 尚未定義正式 `prompt` 頁面 schema。
若未被要求落檔，先在回覆中給出可重用版本；若要保存，再和使用者確認存放位置。

---

## 多步流程順序

若同一份輸入同時需要多種處理，依序做：

1. `triage-link`
2. `ingest-content`
3. `wilson-perspective`
4. prompt extraction

---

## YouTube 規則

- 優先使用逐字稿或足夠詳細的筆記
- 若只有 YouTube URL，先 triage
- 需要深度沉澱時，再要求逐字稿或補充內容

不要只看標題就假裝理解整支影片。

---

## 累積原則

Wilson 的知識累積要分層：

1. `source`：來源證據
2. `topic`：主題知識
3. `wilson`：人物模型、關注議題、觀點
4. `insight`：高價值綜合分析
5. `prompt`：可重用操作模式

只保存耐久知識，不保存每一輪對話雜訊。
