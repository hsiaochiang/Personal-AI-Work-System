# PAIS UX 稽核報告

> **執行日期**：2026-05-01  
> **執行者**：AI UX Audit Orchestrator  
> **方法論**：Nielsen 10 Heuristics（主）+ Cognitive Walkthrough 4 問框架（輔）  
> **北極星指標**：知識沉澱的完整度與可檢索性  
> **核心主張**：知識 ≠ 文字  

---

## 1. 整體評分

### 7 維度 Scorecard

| 維度 | 分數（/5）| 主要依據 |
|------|----------|---------|
| First Impression | 3 | 視覺設計精緻，但首頁是監控儀表板，缺乏 onboarding |
| Navigation & Flow | 2 | 術語不直覺；兩個搜尋入口分工不清；3/5 Task 需多次猜測 |
| Feedback & Status | 2 | 操作後回饋不足：儲存知識無成功訊息 |
| Trust & Polish | 3 | 整體視覺專業；axe critical 違規（extract select 無標籤）破壞信任 |
| Time to Value | 2 | 從進入到完成第一個「知識沉澱」需猜測多步 |
| Learnability | 2 | 術語預設背景知識；無 onboarding |
| Information Architecture | 2 | 知識呈現缺分類層次；搜尋結果無語意標記 |
| **TOTAL** | **16 / 35** | |

---

## 2. 最重要結論

> **PAIS 目前是一個「存文字」系統，還不是「沉澱知識」系統**

這是本次稽核最核心的發現，與北極星指標直接衝突：

- Extract 流程：候選知識無類型標籤、無標題編輯、無成功回饋 → 存入的是原始文字片段
- Memory/Search 流程：搜尋結果無分類、無有效期、無「複製給 AI」入口 → 找到的是文字記錄而非可操作知識

**知識需要具備**：類型（偏好/決策/技術/流程）、標題、有效期、使用途徑——目前這四個面向都付之闕如。

---

## 3. Cognitive Walkthrough 摘要

**5 個 Task 走查結果**：

| Task | 目標 | 判定 | 核心問題 |
|------|------|------|---------|
| T1：Onboarding | 5 分鐘理解系統 | ❌ 失敗 | 首頁是監控儀表板，無引導 |
| T2：提取知識 | 沉澱結構化知識 | ❌ 失敗 | 沉澱的是文字，不是知識 |
| T3：找回知識 | 3 步內找到可用知識 | ❌ 失敗 | 需 5+ 步；結果無語意層次 |
| T4：Handoff | 產生 AI 交接文件 | ✅ 成功（有摩擦）| 無一鍵複製；功能名稱不直覺 |
| T5：決策查詢 | 確認決策有效性 | ✅ 成功（資訊不足）| 無狀態標記和確認時間 |

**統計**：21 步走查 / 10 Pass / 11 Fail / 9 摩擦點

---

## 4. Heuristic Evaluation 摘要

**問題分布**：

| 優先級 | 數量 | 主要涉及 Heuristic |
|--------|------|-----------------|
| P0 | 1 | H9（無障礙） |
| P1 | 7 | H1, H3, H6, H7, H10 |
| P2 | 6 | H4, H6, H9 |
| P3 | 2 | H4, H9 |

**違反最多的 Heuristic**：H1（系統狀態能見度）、H6（辨識非回憶）

---

## 5. 無障礙掃描摘要（axe-core）

| 頁面 | 嚴重程度 | 問題 |
|------|---------|------|
| extract | **critical** | `<select>` 無 accessible name → P0-A11Y-01 |
| index | serious | 對比度不足（治理待辦 meta）|
| memory | serious | 對比度不足（記憶副標） |
| handoff | serious | `<pre>` 不可鍵盤聚焦（Safari）|
| projects | serious | 對比度不足（專案路徑） |
| settings | serious | 對比度不足（說明連結） |
| decisions, search, task | — | ✅ 通過 |

---

## 6. 改善優先順序

### 第一批（立即修復，知識品質核心）

| ID | 說明 | 工作量 |
|----|------|-------|
| P0-A11Y-01 | 修復 extract select 無 accessible name | XS |
| P1-KQ-01 | Extract：候選知識加類型標籤 | M |
| P1-KQ-02 | Extract：存入前可編輯標題 | M |
| P1-UX-02 | Extract：儲存成功 toast | XS |
| P1-UX-03 | Extract：頁面說明副標 | XS |

### 第二批（提升可用性）

| ID | 說明 | 工作量 |
|----|------|-------|
| P1-KQ-03 | Memory/Search：類型+新鮮度 | S |
| P1-UX-01 | 首頁：Onboarding 引導卡 | S |
| P1-UX-04 | Handoff：一鍵複製 | XS |
| P2-A11Y-01 | 多頁面對比度修復 | S |

### 第三批（知識管理完整性）

| ID | 說明 | 工作量 |
|----|------|-------|
| P2-KQ-04 | Memory/Search：複製給 AI 按鈕 | S |
| P2-KQ-05 | Extract：有效期機制 | M |
| P2-UX-05 | Decisions：狀態欄 | M |
| P2-IA-01 | 導航副標籤 | XS |

---

## 7. 關鍵引述

> 「目前 PAIS 的 Extract + Memory 流程是『存文字』系統，還不是『沉澱知識』系統。」
> — CW Phase B 整體結論

> 「知識品質評估不是額外加分項，而是系統存在的核心理由。如果存入的不是知識，系統的 Time to Value 就接近零。」
> — Heuristic Review H1-02

---

## 8. 產出文件索引

| 文件 | 說明 |
|------|------|
| [00-audit-config.md](00-audit-config.md) | 稽核配置、5 Task 定義、評估框架 |
| [user-journey-observation.md](user-journey-observation.md) | Phase B：Cognitive Walkthrough 完整記錄 |
| [heuristic-review.md](heuristic-review.md) | Phase C：Nielsen 10 Heuristics 完整評估 |
| [ux-improvement-backlog.md](ux-improvement-backlog.md) | Phase D：16 個改善項目（含 Given/When/Then） |
| [screenshots/](screenshots/) | 27 張截圖（9 頁面 × 3 解析度）|
| [data/](data/) | axe-core JSON 掃描結果（9 頁面）|

---

## 9. 下一步建議

1. **立即**：修復 P0-A11Y-01（30 分鐘內可完成）
2. **本衝刺**：P1-KQ-01 + P1-KQ-02（Extract 類型+標題）——這是系統能否稱為「知識系統」的門檻
3. **下個衝刺**：P1-KQ-03（搜尋結果語意層）+ P1-UX-01（Onboarding）
4. **規劃討論**：P2-KQ-05（有效期機制）涉及資料模型變更，需要獨立規劃
