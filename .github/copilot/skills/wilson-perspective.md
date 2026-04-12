# Skill: wilson-perspective（Wilson 觀點查詢）

> 當使用者提供一篇文章或議題，以 Wilson 的視角提供有深度的看法、分析和立場。
> 觸發時機：使用者說「我對這件事的看法？」、「Wilson 怎麼看這個？」、「幫我分析這篇文章」、或提供文章內容後要求觀點輸出。
> 不是摘要工具，是觀點產生器。輸出要能直接用於客戶提案、協會分享、或內部說明。

---

## 前置條件

在開始產生觀點之前，確認以下已讀取：
- `D:\program\WKM\wiki\wilson\interests.md`（關注議題）
- `D:\program\WKM\wiki\wilson\perspectives.md`（Wilson 的核心立場與既有觀點）
- `D:\program\WKM\wiki\wilson\profile.md`（Wilson 的身份與工作情境）

使用者應提供：文章全文、議題描述、或已 ingest 的 source-slug。

---

## 工作流程

### 步驟 1：找相關的 wiki 知識

讀取 `D:\program\WKM\wiki\_index.md`，找出與主題相關的頁面：
- 相關 `wiki/topics/{topic-slug}.md`（最多 5 頁，優先讀 `relevance: high` 的）
- 相關 `wiki/insights/`（若有相關既有分析）
- 相關 `wiki/sources/`（若有相關 source 頁面）

若 wiki 尚空（初期）→ 直接依據 `interests.md` 和 `perspectives.md` 進行分析。

### 步驟 2：確認 Wilson 已有的立場

讀 `wiki/wilson/perspectives.md` 的議題觀點區塊：
- 這個主題已有明確觀點 → 以既有觀點為基礎，用新內容補充或驗證
- 這個主題尚無觀點 → 依照 Perspectives Framework 推斷，並標注「這是基於框架的推斷，非明確記錄的觀點」

### 步驟 3：以四角度框架分析

**必須產出以下四個角度，不能省略任何一個：**

#### 角度 1：技術面理解
- 這個技術/趨勢的實質內容是什麼？
- 成熟度如何（研究階段？生產就緒？已被廣泛採用？）
- 有什麼已知的限制或風險？

#### 角度 2：顧問應用
- AI 顧問工作的哪個場景可以直接用到這個知識？
- 怎麼向非技術決策者解釋這件事的商業意義？
- 有什麼現成的說法、比喻、或框架可以用？
- 能不能成為培訓課程或提案的素材？

#### 角度 3：台灣在地觀察
- 在台灣的產業結構、語言環境、法規下，這如何落地？
- 台灣企業（尤其中小企業）的接受度和阻力是什麼？
- 台灣 AI 圈對此有何已知的討論或動態？

#### 角度 4：長期追蹤判斷
- 這是短期熱潮還是值得持續追蹤的趨勢？判斷依據是什麼？
- 與 Wilson 已追蹤的 Interest Graph 有無新的連結或交叉點？
- 未來 3-6 個月應該關注什麼後續發展？

### 步驟 4：判斷是否需要存成 insight 頁面

若輸出具有以下特徵，建立 `wiki/insights/YYYY-MM/YYYY-MM-DD-{topic}-insight.md`：
- 分析有超過 3 個有價值的論點
- 這個觀點可能被 Wilson 在未來引用
- 内容涉及 2 個以上的 Interest Graph 議題

Insight 頁面格式：
```markdown
---
type: insight
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [相關議題關鍵字]
relevance: high | medium
---

# {分析主題}（Wilson 觀點，{日期}）

## TL;DR
{一句話總結 Wilson 的立場}

## 分析

### 技術面
{內容}

### 顧問應用
{內容}

### 台灣在地觀察
{內容}

### 長期追蹤
{內容}

## 依據
- [[{source-slug}]] — {一句話說明此 source 的貢獻}
- [[wilson/perspectives]] — 核心立場參考
```

---

## 輸出規格

```
## Wilson 對「{主題}」的看法

**TL;DR**：{一句話，Wilson 的明確立場，不能是「這個議題很重要」這種空話}

---

### 技術面理解

{有深度的技術分析，但用 Wilson 的語言，不是 Wikipedia 式的中性描述}

### 顧問應用

{具體的應用場景、說法、或行動建議，能直接用在工作上}

### 台灣在地觀察

{必須有在地觀點，不能只是「台灣也有這個趨勢」這種廢話}

### 長期追蹤判斷

{明確給出「值得追蹤」或「短期熱潮」的判斷，附理由}

---

### 相關 Wiki 頁面
{列出讀取過的相關頁面，格式：[[頁面名稱]] — 一句話說明相關性}

{若有建立 insight 頁面：「已將此分析存至 wiki/insights/YYYY-MM/YYYY-MM-DD-{topic}-insight.md」}
```

---

## 禁止事項

- 不只做文章摘要，每個角度都必須有 Wilson 的判斷，而非客觀陳述
- 不用「這非常有趣」、「這值得關注」這種空洞表達
- 不在沒有依據的情況下宣稱「Wilson 認為...」，要區分：
  - 「依據 `perspectives.md` 的記錄，Wilson 對此的立場是...」
  - 「基於 Wilson 的 Perspectives Framework 推斷...」
- 不省略任何一個角度（就算資訊不足也要如實說明為什麼沒有觀點）
- 不把 TL;DR 寫成問題，要給明確立場

---

## 品質驗證

好的 wilson-perspective 輸出應通過以下測試：
1. TL;DR 是一個明確立場，不是描述
2. 顧問應用有具體的說法或場景，能直接使用
3. 台灣觀察有本土化內容，不只是「國際趨勢台灣也適用」
4. 長期判斷給出明確的 yes/no 和理由
5. 整體輸出 Wilson 可以直接複製給客戶或協會成員
