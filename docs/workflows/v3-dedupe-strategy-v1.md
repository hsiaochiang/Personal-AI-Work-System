# V3 跨工具候選去重策略 v1

> Phase 5（V3 多工具接入）產出。相關 change：`phase11-v3-multi-tool-integration-mvp`
> 性質：docs-only，定義 dedupe_key 生成規則與衝突處理邏輯。

---

## 1. dedupe_key 生成規則（Task 3.1）

### 策略 A：Content Hash Exact Match（Phase 5 主要策略）

**方法**：對候選 `content` 欄位（純文字，去除前後空白）計算固定雜湊值（如 SHA-256 截取前 8 字元）作為 `dedupe_key`。

```
dedupe_key = hash(normalize(content))[:8]

其中 normalize(content):
  - 去除前後空白
  - 將多個連續空白/換行合併為單一空格
  - 統一為 UTF-8 小寫（不做語意轉換）
```

**特性**：
- 確定性（deterministic）：相同 content → 相同 key，不同 content → 不同 key
- 跨工具適用：Copilot / Codex / Gemini 輸出相同文字時可精確匹配
- 限制：文字措辭稍有差異（如「使用」vs「用」）則視為不同 key，無法捕捉語意相似候選

**Phase 5 採用**：✅ 主要策略

---

### 策略 B：欄位組合 Hash（Phase 6 增量）

**方法**：結合 `content`（前 100 字元）+ `tags`（排序後合併）+ `tool_source` 計算組合 hash，作為 `dedupe_key`。

```
dedupe_key = hash(content[:100] + sorted(tags).join(",") + tool_source)[:8]
```

**特性**：
- 允許相同脈絡、不同工具來源的候選共用相同 key（若 tags 與 content 前綴一致）
- 適合多工具交叉提取相同概念的場景

**Phase 5 標注**：❌ Phase 6 增量功能，不納入本次 acceptance criteria

---

### 策略 C：語意相似 Hash（Phase 6 增量）

**方法**：使用 embedding 模型計算語意向量，對相似度 ≥ 閾值的候選分配相同 cluster key。

**Phase 5 標注**：❌ Phase 6 增量功能，依賴向量計算，不在 docs-only 範疇

---

## 2. 衝突處理邏輯（Task 3.2）

### 2.1 Same dedupe_key 衝突時的保留規則

**規則 D1 — 保留最高 confidence_score**

當多個候選具有相同 `dedupe_key` 時：
1. 保留 `confidence_score` 最高者作為主要候選
2. 其餘候選標記為 `status = skipped`，但不刪除原始記錄（保留 provenance）
3. 若 `confidence_score` 相同，優先保留 `extracted_at` 較早者（首次提取優先）

**規則 D2 — 不同 key 共存**

不同 `dedupe_key` 的候選各自獨立保留，不做合併，各自進入 confidence scoring 與 review 流程。

---

## 3. 典型案例（Task 3.2）

### 案例一：相同 dedupe_key 衝突（跨工具重複提取）

**場景**：使用者在 Copilot 對話整理出「OpenSpec validate 必須 PASS 才能進 apply」，同一週在 Codex 輸出中也出現幾乎相同的表述。

| 欄位 | 候選 A（Copilot） | 候選 B（Codex） |
|------|-----------------|----------------|
| `content` | `"openspec validate 必須 PASS 才能進 apply 階段"` | `"openspec validate 必須 PASS 才能進 apply 階段"` |
| `tool_source` | `"copilot"` | `"codex"` |
| `dedupe_key` | `"a3f9bc2d"` | `"a3f9bc2d"` |（相同）
| `confidence_score` | `85` | `60` |
| `extracted_at` | `"2026-03-25T10:00:00+08:00"` | `"2026-03-27T09:30:00+08:00"` |
| `status` | `"approved"` → **保留** | `"skipped"` → 降級 |

**決策**：候選 A（Copilot）confidence_score 較高（85 > 60），保留為主要候選；候選 B 標記 `status = skipped`。

---

### 案例二：不同 dedupe_key 共存（不同概念同時出現）

**場景**：同一 session 中，Copilot 提取「使用 handoff 文件做任務交接」，Gemini 提取「docs-first 原則要求先寫文件再實作」——兩者概念不同，content hash 各異。

| 欄位 | 候選 C（Copilot） | 候選 D（Gemini） |
|------|-----------------|-----------------|
| `content` | `"使用 handoff 文件做任務交接"` | `"docs-first 原則要求先寫文件再實作"` |
| `tool_source` | `"copilot"` | `"gemini"` |
| `dedupe_key` | `"b7c1e44f"` | `"d9a2f803"` |（不同）
| `confidence_score` | `78` | `65` |
| `status` | `"pending"` | `"pending"` |

**決策**：兩個 key 不同，各自獨立進入 review 流程，不做合併，使用者分別審核。

---

## 4. 版本記錄

| 版本 | 日期 | 說明 |
|------|------|------|
| v1 | 2026-03-27 | Phase 5 初版 |
