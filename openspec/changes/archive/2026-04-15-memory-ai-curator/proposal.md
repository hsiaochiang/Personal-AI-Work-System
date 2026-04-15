# Change Proposal: memory-ai-curator

> **狀態**：Review Gate conditional pass; pending commit / sync  
> **建立日期**：2026-04-13  
> **提出者**：Wilson / GitHub Copilot  

---

## 問題陳述

使用者把對話知識匯入系統，Extract 頁面完成了「資料進來」的部分。但進來之後，記憶就像丟進倉庫一樣靜止在那裡。

三個具體痛點：

1. **看得到、動不了**：`/memory` 頁面的記憶條目沒有任何操作按鈕。疑似重複的「刪除這條」按鈕樣式過低調，使用者不會注意到。
2. **量大、不知從何下手**：185 條「建議清理」的 KPI 數字，但點下去什麼都不發生，使用者不知道哪 185 條、出了什麼問題。
3. **AI 有審查結果，但不能接手**：新加的 AI 品質審查告訴你「`project-context.md` 有問題」，但你沒辦法讓 AI 直接幫你改它。

核心問題是：**系統只負責「收」，沒有負責「整理」**。使用者必須自己讀每一條、自己判斷、自己手動操作。這違反「低摩擦、高掌握」的設計原則。

---

## 解決方案

引入 **AI 記憶策展員（Memory Curator）**機制，分三個層次：

**層次一：操作能力（讓使用者能動）**
- 每個記憶條目加上「刪除」按鈕
- KPI「建議清理」可點擊，篩選出有問題的條目

**層次二：AI 輔助整理（讓 AI 幫你分擔判斷）**
- 「AI 整理此分類」：送整個分類給 Gemini，回傳建議，使用者確認後一鍵改善
- AI 審查結果加上「跳至分類」捷徑，讓建議可以立刻 action

**層次三：問題可見性（告訴使用者問題在哪）**
- 記憶條目依健康度排序：問題條目優先顯示
- 每個條目的「待確認」原因清楚標示（缺少什麼、為何過期）

---

## Goals

- [ ] 每個記憶條目有「刪除」按鈕，刪除前有備份
- [ ] KPI「建議清理」可點擊，只顯示需要注意的條目
- [ ] 「AI 整理此分類」：Gemini 分析後提出改善版本，使用者確認再覆寫
- [ ] AI 審查結果每條有「跳至分類」按鈕
- [ ] 疑似重複區塊的按鈕視覺明確（加強「刪除這條」的樣式）

---

## Non-goals

- 不實作記憶條目的 inline 編輯（文字框編輯增加的複雜度超過目前需求）
- 不改動 Extract / Writeback 流程
- 不增加新的記憶分類
- 不做 Gemini 批次整理所有分類（逐分類觸發，保持人工掌控）
- 不做跨專案記憶同步

---

## 對 Roadmap 的影響

本 change 屬於 V6（記憶 AI 策展層）的第一個 active change，目標是把 `/memory` 從只讀治理頁升級成可操作的策展介面。不引入新的 runtime dependency，複用既有的 `/api/memory`、`/api/memory/write`、`/api/memory/ai-review`、Gemini key 設定與 backup write boundary，並新增：
- `POST /api/memory/item/delete`：依 deterministic `itemId` 刪除單一記憶條目
- `POST /api/memory/ai-curate`：針對單一 memory 分類產生 AI 整理建議，回傳 `filename` / `original` / `improved` / `summary`

本輪 Review Gate 已確認功能與 evidence 對齊；剩餘收尾為治理同步（proposal/tasks 狀態校正）後進入 commit / sync / archive 決策。

---
