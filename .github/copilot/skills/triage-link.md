# Skill: triage-link（連結分流判斷）

> 使用者給一個連結（文章、YouTube、貼文），快速判斷：值不值得 Wilson 花時間看？
> 觸發時機：使用者只貼一個 URL，沒有說明要做什麼；或明確說「幫我判斷值不值得看」。
> 目的：替 Wilson 節省注意力，不是幫他閱讀所有內容。

---

## 前置條件

在開始判斷之前，確認以下已讀取：
- `D:\program\WKM\wiki\wilson\interests.md`（Interest Graph，判斷依據）
- `D:\program\WKM\wiki\wilson\perspectives.md`（Wilson 觀點，判斷既有知識）
- `D:\program\WKM\wiki\_index.md`（掌握 wiki 現有知識，避免推薦重複內容）

使用者必須提供連結（URL）。若使用者已提供文章全文，改用 `ingest-content`。

---

## 工作流程

### 步驟 1：抓取連結內容

使用 `web_fetch` 抓取連結的頁面內容。
重點掃描：
- 標題、副標題
- 作者、來源、發布日期
- 前三段文字（判斷核心主張）
- 小標題結構（判斷深度和範圍）
- 結論或摘要段落

若無法抓取（付費牆、需登入、YouTube 影片）→ 請使用者提供：
- YouTube：影片標題 + 說明文字
- 文章：標題 + 摘要 + 你為什麼認為值得看

### 步驟 2：判斷相關性

對照 `interests.md` 的 Interest Graph：

| 相關性 | 條件 |
|-------|------|
| **高** | 涉及 2 個以上第一優先議題，且有新的實際案例或方法論 |
| **中** | 涉及 1 個第一優先議題，或 2 個以上第二優先議題 |
| **低** | 只涉及第三優先議題，或邊緣相關 |
| **無** | 與 Interest Graph 無實質交集 |

### 步驟 3：判斷新知識量

對照 `wiki/_index.md` 和相關 topic 頁面（若存在）：
- **有新知識**：提出 wiki 中尚未記錄的論點、案例、或方法
- **部分新知**：有些新的，有些已知
- **無新知識**：Wilson 已有更深入的相關知識

### 步驟 4：給出 Verdict

結合相關性和新知識量，給出四選一建議：

| Verdict | 條件 |
|---------|------|
| **must-read** | 高相關 + 有新知識 + 對顧問工作有直接應用 |
| **skim** | 中相關，或高相關但新知識有限；快速掃過標題和結論即可 |
| **save-for-later** | 相關但不急；內容密度高，適合有空時深讀 |
| **skip** | 低相關、無新知識、品質低、或重複已知 |

**判斷原則**：寧可多給 `skim` 而不是 `must-read`，保護 Wilson 的注意力。

### 步驟 5：寫入 inbox.md

Append 到 `D:\program\WKM\wiki\triaged\inbox.md`：

```markdown
## [YYYY-MM-DD] {verdict} | {標題}
- **URL**：{連結}
- **類型**：{article | video | post | paper | other}
- **相關議題**：{Interest Graph 中的議題名稱}
- **理由**：{一句話說明 verdict 的原因}
- **如果看，重點看**：{若 must-read/skim，指出最值得關注的部分；skip 則填「—」}
- **狀態**：pending
```

---

## 輸出規格

### 給 Wilson 的即時回覆格式

```
## Triage 判斷：{VERDICT 大寫}

**標題**：{連結標題}
**類型**：{article | video | post | paper | other}
**來源/作者**：{若有}
**發布日期**：{若有}

---

**判斷理由**（2-3 句）：
{具體說明為何給這個 verdict，要提到相關的 Interest Graph 議題}

**與 Wilson 現有知識的關聯**：
{這篇跟 wiki 中哪些知識有關？有補充、推翻、或驗證既有觀點？}
{若 wiki 尚空，說明跟 interests.md 哪個議題相關}

**如果看，重點看什麼**：
{若 verdict 是 must-read 或 skim：指出最值得關注的段落、時間點、或問題}
{若 verdict 是 skip：「建議略過。」}

---
已記錄到 wiki/triaged/inbox.md
```

---

## 禁止事項

- 不只給「相關」或「不相關」，必須給四選一的明確 verdict
- 不跳過「與 Wilson 現有知識的關聯」這個分析
- 不因為「看起來不錯」就給 must-read，必須有具體理由
- 不跳過 `inbox.md` 的記錄更新
- 不幫使用者做閱讀決定，只做判斷依據提供

---

## 評估測試案例

以下是 triage-link 的效果驗證標準（10 個維度）：

1. 給一個 AI agents 最新論文連結 → 應給 must-read
2. 給一個通用 Python 教學 → 應給 skip
3. 給一個台灣 AI 政策新聞 → 應給 skim 或 must-read
4. 給一個重複 wiki 已知內容的文章 → 應給 skip
5. 給一個 YouTube 影片連結 → 應正確處理無法抓取的情況
6. 給一個付費牆文章 → 應請使用者提供摘要
7. verdict 應包含具體的 Interest Graph 議題名稱
8. inbox.md 應在每次 triage 後更新
9. 對同一連結兩次 triage → 應在 inbox.md 標記重複
10. 輸出格式應完整（4 個區塊都有內容）
