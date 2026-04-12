---
name: knowledge-curator
description: Wilson 的個人知識庫（WKM）維護工具。當使用者貼入連結、文章、YouTube 影片、或問「我對這件事的看法？」時觸發。執行三種操作：triage（連結值不值得看）、ingest（導入內容到 wiki）、perspective（以 Wilson 觀點分析）。即使使用者只是貼一個 URL 沒說要做什麼，也要觸發此 skill 進行 triage。凡是知識管理、內容整理、觀點分析的需求都使用此 skill。
license: MIT
metadata:
  author: wilson_hsiao
  version: "1.0"
  wkm_root: "D:\\program\\WKM"
---

# Knowledge Curator（知識抽取者）

Wilson 個人知識庫（WKM）的維護工具。讓每次互動後，知識都能被抽取並沉澱到 wiki，不讓資訊在對話結束後消失。

**Obsidian 在 `D:\program\WKM\` 瀏覽，Claude Code 在這個 skill 裡維護。**

---

## 啟動檢查（每次必做）

1. 讀 `D:\program\WKM\SCHEMA.md` — Wilson 設定、Interest Graph、操作慣例
2. 讀 `D:\program\WKM\wiki\_index.md` — 目前 wiki 全貌
3. 讀 `D:\program\WKM\wiki\wilson\interests.md` — 關注議題清單

若任一檔案不存在 → 停止並提示 WKM 尚未初始化。

---

## 意圖偵測

根據使用者的輸入自動判斷要執行哪個操作：

| 使用者行為 | 操作 |
|-----------|------|
| 只貼 URL，沒說目的 | **TRIAGE** |
| URL + 「幫我整理」/「加入知識庫」 | **INGEST** |
| 文章全文 / YouTube 逐字稿 | **INGEST** |
| 「我對這件事的看法？」/「Wilson 怎麼看？」 | **PERSPECTIVE** |
| 文章 + 要求觀點分析 | **INGEST → PERSPECTIVE** |

---

## TRIAGE 操作

**目標**：替 Wilson 節省注意力，快速判斷值不值得花時間看。

### 流程

1. 用 `WebFetch` 抓取連結內容（標題、副標題、前三段、小標題）
   - 無法抓取（付費牆/YouTube）→ 請使用者提供標題和說明

2. 對照 `wiki/wilson/interests.md` 的 Interest Graph 判斷相關性：
   - 高相關：涉及 2 個以上第一優先議題 + 有新知識點
   - 中相關：涉及 1 個第一優先議題，或 2 個以上第二優先
   - 低相關：只涉及第三優先，或邊緣相關

3. 對照 `wiki/_index.md` 確認這是否是 wiki 已有的知識（避免推薦重複內容）

4. 給出四選一 verdict：
   - **MUST-READ**：高相關 + 有新知識 + 直接影響顧問工作
   - **SKIM**：中相關，或新知識有限，快速掃過即可
   - **SAVE-FOR-LATER**：相關但不急
   - **SKIP**：低相關、重複已知、品質低

5. Append 到 `D:\program\WKM\wiki\triaged\inbox.md`

### TRIAGE 輸出格式

```
## Triage 判斷：{VERDICT}

**標題**：{標題}
**類型**：{article | video | post | paper}
**來源/作者**：{若有}

**判斷理由**：
{2-3 句，說明為何給這個 verdict，要提到具體的 Interest Graph 議題}

**與 Wilson 現有知識的關聯**：
{這篇跟 wiki 現有知識有什麼關係？補充、驗證、還是推翻？}

**如果看，重點看什麼**：
{must-read/skim 時：指出最值得關注的部分 | skip 時：「建議略過。」}

---
已記錄到 wiki/triaged/inbox.md
```

---

## INGEST 操作

**目標**：把內容導入 wiki，抽取知識，更新相關頁面。

### 流程

1. 判斷內容類型（article / video / post / paper / other）
2. 產生 slug：`YYYY-MM-DD-{2-4個英文關鍵字}`

3. 建立 source 頁面：`D:\program\WKM\wiki\sources\YYYY-MM\YYYY-MM-DD-{slug}.md`
   ```yaml
   ---
   type: source
   created: YYYY-MM-DD
   updated: YYYY-MM-DD
   tags: [Interest Graph 關鍵字]
   relevance: high | medium | low
   source_url: https://...
   content_type: article | video | post | paper | other
   wilson_verdict: must-read | skim | save-for-later | done
   ---
   ```
   必要段落：摘要（3-5句）、核心論點（最多5點）、Wilson 觀點註記（四角度）

4. 識別相關 topics → 更新或建立 `wiki/topics/{topic-slug}.md`

5. 若有新觀點素材 → 更新 `wiki/wilson/perspectives.md`

6. 若發現新議題候選 → 在輸出中標記「⚠️ 發現新議題候選：{名稱}」，等待 Wilson 確認

7. 更新 `wiki/_index.md`（Sources 表格 + Topics 表格）

8. Append 到 `wiki/_log.md`：
   `## [YYYY-MM-DD] ingest | {標題} | {slug}`

### Wilson 觀點註記（source 頁面必有）

```markdown
## Wilson 觀點註記

**與 Interest Graph 的關聯**：{哪個議題？相關強度？}
**實用性評估**：{對 AI 顧問工作的直接應用？}
**在地化觀察**：{在台灣場景下的意義？}
**長期追蹤價值**：{短期熱點還是值得持續關注？}
```

### INGEST 輸出格式

```
## 知識抽取者操作完成

**操作類型**：INGEST
**處理內容**：{標題}

**影響的 wiki 頁面**：
- 新建：{路徑清單}
- 更新：{路徑清單}

**給 Wilson 的摘要**：
{2-3 句，說明這次 ingest 最重要的結果，例如補充了哪個 topic、發現了什麼新觀點}

**建議的後續動作**：
{1 個最值得做的下一步}
```

---

## PERSPECTIVE 操作

**目標**：以 Wilson 的四角度框架，產生有深度、能直接使用的觀點分析。

### 流程

1. 讀 `wiki/wilson/perspectives.md` 確認 Wilson 對此議題的既有立場

2. 讀相關 topic 頁面（最多 5 頁，優先 `relevance: high`）

3. 以四角度分析（每個角度都必須有實質內容）：

**角度 1：技術面理解**
- 這個技術的實質內容是什麼？成熟度？已知限制？

**角度 2：顧問應用**
- 哪個客戶場景能直接用？怎麼向 C-level 說明商業意義？
- 能成為培訓素材或提案框架嗎？

**角度 3：台灣在地觀察**
- 台灣的產業結構、語言環境、法規如何影響落地？
- 中小企業的接受度和阻力是什麼？

**角度 4：長期追蹤判斷**
- 明確給出「值得追蹤」或「短期熱潮」，附理由
- 與 Interest Graph 有無新的交叉點？

4. 若分析有保存價值 → 建立 `wiki/insights/YYYY-MM/YYYY-MM-DD-{topic}-insight.md`

### PERSPECTIVE 輸出格式

```
## Wilson 對「{主題}」的看法

**TL;DR**：{一句明確立場，不是描述}

### 技術面理解
{實質分析}

### 顧問應用
{具體應用場景和說法}

### 台灣在地觀察
{本土化內容，不能只說「台灣也有這個趨勢」}

### 長期追蹤判斷
{明確 yes/no + 理由}

---
### 相關 Wiki 頁面
{[[頁面名稱]] — 相關性說明}
```

---

## 核心約束

- **`raw/` 只讀**：不修改 `D:\program\WKM\raw\` 的任何檔案
- **日誌不跳**：每次操作後必須更新 `_log.md` 和 `_index.md`
- **觀點有據**：不在沒有依據的情況下宣稱「Wilson 認為...」
- **議題謹慎**：發現新議題只能提示，不能擅自修改 `interests.md`
- **四角度完整**：PERSPECTIVE 操作四個角度都必須有實質內容

---

## WKM 目錄結構參考

```
D:\program\WKM\
├── SCHEMA.md              ← 系統設定（每次必讀）
├── raw\                   ← 原始資料（只讀）
│   ├── articles\
│   ├── videos\
│   └── assets\
└── wiki\                  ← 知識庫（agent 讀寫）
    ├── _index.md          ← 全站目錄（每次 ingest 後更新）
    ├── _log.md            ← 操作日誌（append-only）
    ├── wilson\
    │   ├── profile.md
    │   ├── interests.md   ← Interest Graph
    │   └── perspectives.md ← 累積式觀點
    ├── topics\            ← 議題頁面
    ├── sources\           ← 來源摘要（YYYY-MM/YYYY-MM-DD-slug.md）
    ├── insights\          ← Wilson 觀點分析文
    └── triaged\
        └── inbox.md       ← 待看清單
```
