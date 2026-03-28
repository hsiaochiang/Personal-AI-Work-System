# Coding Agent Handoff — 2026-03-28

## 任務目的

根據最新評估結果，調整本專案後續開發優先順序，讓產品更快靠近原始核心目標：

- 把對話變成可重用資產
- 降低新對話啟動摩擦
- 讓記憶可持續累積
- 讓 AI 協作越用越有效

## 先讀文件

1. `docs/planning/2026-03-28_improvement-adjustment-plan-for-coding-agent.md`
2. `docs/planning/2026-03-28_project-assessment-and-recommendations.md`
3. `docs/roadmap.md`
4. `docs/handoff/current-task.md`
5. `docs/product/user-guide-v1.md`

## 關鍵判斷

目前產品已經有：

- 可啟動的本地網站
- Overview / Task / Memory 三個入口頁
- 讀取 markdown 的基本 API

但目前還沒有完成最重要的閉環：

- 對話輸入
- 候選提取
- 候選審核
- 寫回記憶
- handoff 產品化

## 後續優先順序

### 第一優先

- 調整 roadmap、current-task、user guide，讓文件與產品方向一致

### 第二優先

- 建立 handoff builder MVP

### 第三優先

- 建立 extraction + candidate review + writeback MVP

### 第四優先

- 補 Decision / Rules 檢視強化

### 最後再做

- 大量 UI polish
- 多專案
- 多工具接入
- 複雜搜尋

## 這一輪應完成的最小範圍

### A. 文件校準

至少完成：

- 更新 `docs/roadmap.md`
- 更新 `docs/handoff/current-task.md`
- 新增 `docs/product/user-guide-current.md`
- 明確把下一步指向「handoff + extraction + review + writeback」

### B. Handoff Builder MVP

至少完成：

- 一個可選類型的 handoff 頁或區塊
- 可讀取現有 handoff 或模板基線
- 可編輯欄位
- 可生成 markdown 預覽
- 可複製到剪貼簿

### C. Extraction / Review / Writeback MVP

至少完成：

- 對話文字輸入入口
- 候選清單生成
- 接受 / 編輯 / 忽略
- 寫回 `docs/memory/*.md`

## 不要先做的事

- 不要先做完整的設計稿品質重做
- 不要先做多專案 Projects Hub
- 不要先做多工具 adapter abstraction
- 不要先做過度完整的搜尋與分析頁
- 不要先做高複雜度架構整理

## 驗收標準

這一輪至少要能證明：

1. 使用者可以在 UI 中建立一份可複製的 handoff
2. 使用者可以貼上一段對話文字
3. 系統可以產生候選知識項目
4. 使用者可以接受或修改候選
5. 採用後，對應 `docs/memory/*.md` 確實更新
6. 下一次打開 Memory 頁時能看到更新內容

## 完成後應回寫

- `docs/roadmap.md`
- `docs/handoff/current-task.md`
- `docs/memory/decision-log.md`
- 視需要更新 `docs/product/user-guide-v1.md`

## 一句話總結

這一輪不要把重心放在「把 dashboard 做得更漂亮」，而是要先把：

**handoff + extraction + review + writeback**

這條核心知識閉環做出來。
