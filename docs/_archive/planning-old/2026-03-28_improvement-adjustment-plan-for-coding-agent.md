# 2026-03-28 改善與調整執行指示

## 目的

這份文件是給後續 coding agent 的執行指示。

目標不是推翻現有成果，而是校準優先順序，讓專案更快靠近原始要解決的問題：

- 把對話變成資產
- 讓記憶能持續累積
- 降低新對話啟動摩擦
- 讓 AI 協作越用越有效

## 核心判斷

目前專案已經有：

- 可啟動的本地網站
- Overview / Task / Memory 三個入口頁
- 讀取 markdown 的 API 與基礎畫面

這些成果是正確的，但目前產品重心偏向：

- 狀態檢視
- dashboard 呈現

而不是最核心的價值閉環：

- 對話輸入
- 候選提取
- 候選審核
- 寫回專案記憶
- handoff 交接

因此，後續開發應調整優先順序。

## 不變的部分

以下內容不需要推翻：

- `web/` 目前的基本網站骨架
- `docs/` 目前的文件結構
- markdown 作為第一版資料來源
- vanilla JS + 本地 server 的技術方向

這些都可以保留，直接往下一步長。

## 必須調整的優先順序

## 調整原則 1：核心價值優先於 UI polish

接下來優先做的，不應是完整的 Phase 2 UI 視覺升級，而應先做：

1. handoff builder MVP
2. extraction + candidate review + writeback MVP

理由：

- 這兩件事最直接對應原始目標
- 它們比完整搜尋、KPI 重做、Detail polish 更能立即提升價值
- 若沒有這兩者，產品會先變成一個好看的 dashboard，而不是會累積知識的工作台

## 調整原則 2：先做最小可用閉環，再補完整工作台

接下來的工作應先完成最小閉環：

`對話輸入 -> 產生候選 -> 人工確認 -> 寫回 docs/memory -> 下次可被使用`

在這條閉環成立前，不要把大量時間投入：

- 多專案切換
- UI 全面重做
- 過度完整的搜尋
- 大量視覺 polish

## 調整原則 3：文件與產品描述必須區分「現在可用」與「最終可用」

目前 `docs/product/user-guide-v1.md` 比較接近最終完成版手冊。

需要補一份：

- `docs/product/user-guide-current.md`

讓使用者與 agent 清楚知道：

- 現在已經可用的是什麼
- 尚未完成的是什麼

## 建議的下一階段執行順序

## Milestone A：重新校準路線與文件

### 目標

讓 roadmap、handoff 與使用手冊先反映新的優先順序。

### 建議工作項目

1. 更新 `docs/roadmap.md`
2. 更新 `docs/handoff/current-task.md`
3. 新增 `docs/product/user-guide-current.md`
4. 明確標示：
   - 下一個主要里程碑不是「完整 UI polish」
   - 而是「handoff + extraction + review + writeback 最小閉環」

### 驗收標準

- `docs/roadmap.md` 的下一步清楚指向核心閉環
- `current-task.md` 的 Goal / Scope 已同步調整
- 使用者能從文件中清楚分辨 current / target

## Milestone B：Handoff Builder MVP

### 目標

讓使用者在 UI 裡快速產生可貼到新對話的 handoff。

### 最小功能

- 選擇 handoff 類型
- 載入既有 `docs/handoff/current-task.md` 或模板基線
- 顯示可編輯欄位
- 即時生成 markdown 預覽
- 複製到剪貼簿

### 建議不要先做

- 複雜模板管理
- 多專案 handoff 聚合
- 完整格式化工具列

### 驗收標準

- 使用者能在瀏覽器內建立一份 handoff 草稿
- 草稿可直接複製貼到新的 AI 對話
- 至少支援一種 handoff 類型完整跑通

## Milestone C：Extraction + Candidate Review + Writeback MVP

### 目標

建立本專案最核心的第一條知識閉環。

### 最小功能

1. 對話輸入入口
   - 貼上純文字
   - 或匯入單一文字檔 / markdown 檔

2. 候選提取
   - 先不用追求完美分類
   - 先能抽出最重要的 4 類：
     - project context
     - preference rules
     - task patterns
     - decisions

3. 候選審核
   - 接受
   - 編輯
   - 忽略

4. 寫回記憶
   - 採用後寫入對應 `docs/memory/*.md`

### 技術建議

- 第一版可先採規則式 / 啟發式提取
- 不必一開始就做完整 adapter abstraction
- 不必一開始就做多工具格式支援
- 先從一種最簡單輸入格式跑通

### 驗收標準

- 貼上一段對話後，系統能產生候選清單
- 使用者可在 UI 裡接受或修改候選
- 採用後，對應 `docs/memory/*.md` 確實更新
- 下一次打開 Memory 頁時，能看到新內容

## Milestone D：最小決策與規則檢視強化

### 目標

在核心閉環成立後，再補上對規則與決策的可讀性。

### 建議工作項目

- 加入 Decisions 檢視頁
- 加入 Rules 檢視頁
- 基本搜尋與篩選
- 衝突提示的最小版本

### 驗收標準

- 使用者能集中看到決策與規則
- 能用簡單搜尋找到特定決策或規則

## Milestone E：再回頭補完整 UI polish

### 目標

等核心閉環可用後，再做完整工作台體驗。

### 可延後項目

- 完整 KPI Bento Grid
- 更高保真的視覺重做
- 完整 Detail 頁 polish
- 多專案 hub
- 更細的 loading / empty / error 狀態

## coding agent 應優先修改的文件

### 第一批

- `docs/roadmap.md`
- `docs/handoff/current-task.md`
- `docs/product/user-guide-v1.md`
- `docs/product/` 下新增 current guide

### 第二批

- `web/public/` 新增或擴充 handoff / extraction / review 頁面
- `web/server.js` 擴充對應 API
- `web/public/js/` 新增對應互動邏輯

## coding agent 應避免的方向

- 不要先把大量時間投入純視覺美化
- 不要先做多專案
- 不要先做多工具接入
- 不要先做複雜搜尋系統
- 不要先做過度抽象的提取引擎架構

## 建議的最小版本切割

如果只做一輪最小改善，優先完成：

1. roadmap / current-task / user guide 對齊
2. handoff builder 最小版
3. 對話貼上 -> 候選 -> 寫回 memory 的最小版

只要這三件事完成，專案就會從：

- 「看文件的 dashboard」

進一步變成：

- 「開始能把對話轉成資產的工作台」

## 最重要的完成判斷

後續每個里程碑都應回答這個問題：

### 這個功能是否讓使用者更接近以下成果？

- 更少重講背景
- 更快開新對話
- 更容易保留決策與偏好
- 更容易把一次性對話變成可重用知識

如果答案是否定的，優先順序就應下調。

## 一句話總結

後續改善的核心不是把網站做得更像成熟 SaaS，而是先把：

**handoff + extraction + review + writeback**

這條知識閉環做出來。
