# V3 工具來源可信度評分機制 v1

> Phase 5（V3 多工具接入）產出。相關 change：`phase11-v3-multi-tool-integration-mvp`
> 性質：docs-only，不依賴外部 API，從本地 docs 推算。

---

## 1. confidence_score 評分格式

- **型別**：0–100 整數
- **最低值**：0（完全不可信或無評分依據）
- **最高值**：100（最高可信度）
- **初始值**：未評分候選預設從基礎維度計算，不得直接填 50 作為預設

---

## 2. 評分維度（Task 4.1）

### 維度 V1：Session 出現次數（出現頻率）

**定義**：候選的相同或高度相似概念（以 `dedupe_key` 為判斷基準）在不同 session / 對話紀錄中出現的次數。

**計算說明**（本地 docs 推算）：
- 掃描 `docs/memory/`、`docs/runlog/`、`docs/handoff/` 下已整理的候選與工作記錄
- 計算相同 `dedupe_key` 的候選出現於多少個不同文件（檔案數）或不同日期
- 分數貢獻（建議）：出現 1 次 → +20；每增加 1 次 → +10，上限 +40

**範例**：某候選在 3 個不同 session 的 runlog 中均出現 → 出現次數得分 = 20 + 10 + 10 = 40 分

---

### 維度 V2：人工確認次數（人工審核加成）

**定義**：候選曾被人工明確標記為 `status = approved` 或在 handoff / roadmap 明確引用的次數。

**計算說明**（本地 docs 推算）：
- 掃描 `docs/handoff/current-task.md`、`docs/roadmap.md`、`docs/qa/` 等文件
- 若候選概念曾出現在 Done 列表或被明確引用（需人工確認，不做自動推斷）
- 分數貢獻（建議）：人工確認 1 次 → +30；上限 +30

**範例**：某候選概念在 `docs/roadmap.md` 的 Phase 4 Done 項目中被明確引用 → 人工確認得分 = 30 分

---

### 維度 V3：交叉工具驗證比率（多工具交叉驗證）

**定義**：相同 `dedupe_key` 的候選被兩個或以上不同工具各自獨立提取的比率。

**計算說明**（本地 docs 推算）：
- 掃描 Normalized Schema 候選集合
- 若相同 `dedupe_key` 存在來自 ≥2 個不同 `tool_source` 的候選，則視為多工具交叉驗證通過
- 分數貢獻（建議）：2 個工具 → +20；3 個工具 → +30；上限 +30

**範例**：某候選同時出現於 `tool_source = copilot` 與 `tool_source = gemini` → 交叉驗證得分 = 20 分

---

### 評分總計公式

```
confidence_score = 
  min(40, 出現次數得分) +
  min(30, 人工確認得分) +
  min(30, 交叉工具驗證得分)

範圍：0–100
```

---

## 3. 評分對審核排序的影響規則（Task 4.2）

### 3.1 優先序規則

**規則 R1 — 高分優先審核**

Review 流程中，候選按 `confidence_score` 由高至低排序呈現。`confidence_score ≥ 70` 的候選列為「高優先」；`40–69` 列為「一般」；`< 40` 列為「低優先」，預設摺疊或排後。

### 3.2 評分更新觸發條件

`confidence_score` 在以下事件發生時重新計算：

1. **新候選加入**：相同 `dedupe_key` 的新候選從額外工具提取時（交叉驗證比率可能提升）
2. **人工審核動作**：使用者將候選標記 `approved` 或在治理文件中引用時（人工確認次數 +1）
3. **新 session 記錄**：新 runlog / handoff 建立且包含相同概念時（出現次數可能提升）

---

## 4. Scenario：高分 vs 低分候選的處理差異（Task 4.2）

**Scenario S1：高分候選（score = 90）**

| 欄位 | 值 |
|------|----|
| `content` | `"openspec validate --strict 必須 PASS 才能推進 apply 階段"` |
| `confidence_score` | `90`（出現 4 次 +40；人工確認 1 次 +30；Copilot + Codex 交叉驗證 +20） |
| `tool_source` | `"copilot"` |
| `status` | `"approved"` |

**處理**：列為「高優先」候選，在 review 介面置頂顯示；若同 dedupe_key 有低分候選，低分者自動標記 `skipped`。

---

**Scenario S2：低分候選（score = 20）**

| 欄位 | 值 |
|------|----|
| `content` | `"可以嘗試用 AI 幫忙寫 commit message"` |
| `confidence_score` | `20`（出現 1 次 +20；未人工確認；無交叉驗證） |
| `tool_source` | `"gemini"` |
| `status` | `"pending"` |

**處理**：列為「低優先」候選，預設摺疊於 review 介面底部；不阻擋高分候選審核；使用者可手動展開審核或直接略過。

---

## 5. 版本記錄

| 版本 | 日期 | 說明 |
|------|------|------|
| v1 | 2026-03-27 | Phase 5 初版 |
