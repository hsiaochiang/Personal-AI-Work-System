# Skill: ingest-content（內容導入）

> 將文章、貼文、YouTube 影片筆記導入 WKM wiki，抽取知識並更新相關頁面。
> 觸發時機：使用者提供文章全文、YouTube 逐字稿、貼文截圖，或明確說「幫我整理」、「加入知識庫」。

---

## 前置條件

在開始 ingest 之前，確認以下已讀取：
- `D:\program\WKM\SCHEMA.md`（Wilson 設定、Interest Graph、wiki 慣例）
- `D:\program\WKM\wiki\_index.md`（目前 wiki 全貌）
- `D:\program\WKM\wiki\wilson\interests.md`（關注議題清單）
- `D:\program\WKM\wiki\wilson\perspectives.md`（Wilson 觀點框架）

使用者必須提供內容（文章全文、逐字稿、或貼文文字）。
若只有連結，先執行 `triage-link` 判斷值不值得看，再由使用者決定是否 ingest。

---

## 工作流程

### 步驟 1：判斷內容類型與產生 slug

- 類型：`article`（部落格/新聞）/ `video`（YouTube）/ `post`（社群貼文）/ `paper`（研究論文）/ `other`
- 日期：優先使用原始發布日期，若不明則用今天
- Slug：`YYYY-MM-DD-{2-4 個英文關鍵字用連字號}` — 例：`2026-04-11-ai-agents-enterprise`

### 步驟 2：建立 source 頁面

建立 `D:\program\WKM\wiki\sources\YYYY-MM\YYYY-MM-DD-{slug}.md`，結構如下：

```markdown
---
type: source
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [從 Interest Graph 選 2-5 個關鍵字]
relevance: high | medium | low
source_url: https://...（若有）
content_type: article | video | post | paper | other
author: 作者名（若有）
wilson_verdict: must-read | skim | save-for-later | skip | done
---

# {文章/影片標題}

**來源**：{URL 或說明}
**作者**：{作者}
**發布日期**：{日期}
**關聯議題**：{對應 Interest Graph 的議題名稱}

---

## 摘要（3-5 句）

{用正體中文寫，不是逐字翻譯，而是提煉核心論點}

---

## 核心論點

- {論點 1}
- {論點 2}
- {論點 3}（最多 5 點）

---

## 值得引用的段落

> {直接引用原文中最有價值的句子，並說明為何值得引用}

---

## Wilson 觀點註記

**與 Interest Graph 的關聯**：{哪個議題？關聯強度？}

**實用性評估**：{對 AI 顧問工作的直接應用是什麼？}

**在地化觀察**：{若適用，這在台灣場景下有什麼意義？}

**長期追蹤價值**：{這是短期熱點還是值得持續關注？為什麼？}
```

### 步驟 3：識別相關 topics

對照 `interests.md` 的 Interest Graph，找出此內容涉及的議題（可能多個）。
每個議題 → 對應一個 `wiki/topics/{topic-slug}.md` 頁面。

### 步驟 4：更新（或建立）topic 頁面

對每個相關 topic：

**若 topic 頁面不存在** → 建立 `D:\program\WKM\wiki\topics\{topic-slug}.md`：

```markdown
---
type: topic
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [topic 的關鍵字]
relevance: high | medium | low
---

# {議題名稱}

## 定義與範疇

{簡短說明這個議題是什麼，100 字以內}

---

## 知識點

### {子主題 1}

{知識點內容}
*來源：[[YYYY-MM-DD-{source-slug}]]*

---

## 發展趨勢

{目前已知的趨勢，由後續 ingest 逐漸補充}

---

## 相關 Source 頁面

- [[sources/YYYY-MM/YYYY-MM-DD-{slug}]] — {一句話說明這個 source 貢獻了什麼}
```

**若 topic 頁面已存在** → 在適當位置補充新知識點，格式：
```
### {新的子主題或更新點}

{知識點}
*來源：[[YYYY-MM-DD-{source-slug}]]*（新增於 YYYY-MM-DD）
```
更新 frontmatter 的 `updated` 日期。

### 步驟 5：更新 wilson/perspectives.md（若有新素材）

若此次 ingest 的內容能補充 Wilson 的觀點：
- 在 `perspectives.md` 的相關議題區塊下補充
- 格式：`{觀點內容} *[來源: [[{source-slug}]]]*`
- 更新 frontmatter 的 `updated` 和「觀點更新記錄」表格

### 步驟 6：若發現新議題

若內容涉及 `interests.md` 中沒有的議題，且評估對 Wilson 有價值：
- 在操作完成報告中標記「⚠️ 發現新議題候選：{議題名稱}」
- 說明理由
- 不要自動修改 `interests.md`，等待 Wilson 確認

### 步驟 7：更新 _index.md

在 `D:\program\WKM\wiki\_index.md` 的「Sources」表格加入新 source：
```
| [[sources/YYYY-MM/YYYY-MM-DD-slug]] | {標題} | {類型} | {verdict} | {日期} |
```

若有新建的 topic，在「Topics」表格加入：
```
| [[topics/{topic-slug}]] | {議題} | {今天日期} |
```

### 步驟 8：Append 到 _log.md

```
## [YYYY-MM-DD] ingest | {文章/影片標題} | {slug}
```

---

## 輸出規格

**必建立**：
- `wiki/sources/YYYY-MM/YYYY-MM-DD-{slug}.md`

**可能建立**：
- `wiki/topics/{topic-slug}.md`（若 topic 不存在）

**必更新**：
- `wiki/_index.md`
- `wiki/_log.md`

**可能更新**：
- `wiki/topics/{topic-slug}.md`（若 topic 已存在）
- `wiki/wilson/perspectives.md`（若有新觀點素材）

---

## 禁止事項

- 不修改 `D:\program\WKM\raw\` 內任何檔案
- 不在沒有依據的情況下宣稱「Wilson 認為...」
- 不跳過 `_log.md` 和 `_index.md` 的更新
- 不把所有內容都標為 `high` relevance，要真實評估
- 不自動修改 `interests.md`，發現新議題只能提示，不能擅自加入

---

## 品質標準

一個好的 source 頁面應該做到：
- 3 個月後重讀，不用看原文就能重建核心知識
- Wilson 觀點註記有實質內容，不是「這很有趣」這種空話
- Topic 頁面的連結真實存在
- Frontmatter 的 tags 對應到 Interest Graph 的真實關鍵字
