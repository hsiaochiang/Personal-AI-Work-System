# Proposal: knowledge-quality-ux

> **建立日期**：2026-05-01  
> **來源**：UX 稽核報告（`docs/ux-review/ux-audit-report.md`）  
> **北極星指標**：知識沉澱的完整度與可檢索性（知識 ≠ 文字）

---

## 問題陳述

UX 稽核（2026-05-01）的核心結論：**PAIS 目前是「存文字」系統，還不是「沉澱知識」系統。** 以下三個具體問題直接阻礙使用者沉澱與找回結構化知識：

1. **P0-A11Y-01**：Extract 頁面的「工具來源」`<select>` 沒有 accessible name，axe-core 判定為 critical——螢幕閱讀器無法使用知識提取入口。
2. **P1-KQ-01 + P1-KQ-02**：候選知識顯示為靜態文字片段，無法修改類型、無法編輯標題。使用者只能「整段接受/跳過」，導致存入的是原始文字而非結構化知識。
3. **P1-KQ-03**：搜尋結果只顯示文字片段和檔名，沒有知識類型標籤和新鮮度資訊，使用者無法評估找到的是否是「有效的知識」。

---

## 目標

- 修復無障礙阻塞（P0），確保 extract `<select>` 對螢幕閱讀器可用
- 讓使用者在存入前能決定「這是什麼類型的知識」（類型選擇器）
- 讓使用者在存入前能編輯知識的標題（標題輸入欄）
- 讓搜尋結果顯示知識類型 chip 和新鮮度（建立日期 + 過期警示）

---

## Non-goals

- 不修改後端資料模型或 API（knowledge items 仍寫入現有 `.md` 文件）
- 不新增「知識有效期」機制（此為 P2-KQ-05，另立 change）
- 不修改 Handoff 頁面
- 不修改「決策」或「規則」頁面
- 不做 AI 自動推測類型的後端實作（類型選擇器採純前端下拉，預設沿用現有啟發式分類結果）
- 不修改記憶體資料庫格式（`docs/memory/*.md` 的 markdown 結構不變）

---

## 影響範圍

| 檔案 | 修改類型 |
|------|---------|
| `web/public/extract.html` | HTML 結構修改（label element） |
| `web/public/js/extract.js` | renderCandidates、writeback 邏輯修改 |
| `web/public/js/search.js` | runSearch、結果渲染修改 |
| `web/public/css/style.css` | 新增 5 個 CSS class |

---

## 對 Roadmap 的影響

本 change 不改變任何 roadmap phase 或版本目標，屬於已完成功能的 UX 品質改善。不影響任何進行中的 change。

---

## 驗收標準（整體）

- [ ] axe-core 掃描 extract 頁面，violations 數量 = 0（原為 1 critical）
- [ ] 審核候選知識時，每個候選項有類型下拉選單（6 個選項）且可修改
- [ ] 審核候選知識時，每個候選項有可編輯的標題輸入欄，初始值為 keyLine
- [ ] 修改類型後，選目標檔案（`→ xxx.md`）即時更新
- [ ] 寫回後，記憶檔案的 bullet 內容為使用者設定的標題（若有修改）
- [ ] 全域搜尋的「專案記憶」結果顯示類型 chip 和相對日期
- [ ] 超過 90 天的記憶項目顯示 `⚠️` 過期警示
