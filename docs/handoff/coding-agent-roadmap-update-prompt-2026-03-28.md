# Coding Agent Prompt — 更新 `docs/roadmap.md`

請在 `D:\program\Personal-AI-Work-System` 工作，目標是把 `docs/roadmap.md` 更新成這個專案的**單一真源**，讓人只看 roadmap 就能同時知道：

- 這個專案的長期產品全貌
- 現在位於哪個版本
- 當前版本做到哪裡
- 下一步是什麼

## 先讀文件

請依序閱讀：

1. `AGENTS.md`
2. `docs/handoff/current-task.md`
3. `docs/handoff/blockers.md`
4. `docs/roadmap.md`
5. `docs/planning/2026-03-28_roadmap-single-source-and-full-horizon-recommendation.md`
6. `docs/product/user-guide-current.md`

## 本次任務

請只聚焦在 **更新 `docs/roadmap.md`**，不要先擴散到 UI 或其他功能實作。

本次更新的目標不是微調字句，而是把 roadmap 重新整理成：

1. **單一真源**
   - 專案整體進度以 `docs/roadmap.md` 為準
   - roadmap 應能獨立回答「做到哪、下一步、之後還有什麼版本」

2. **全貌化**
   - roadmap 不能只寫 V1 內部 Phase
   - roadmap 必須看得到 V1、V2、V3、V4 的版本全貌

3. **當前狀態真實化**
   - 依實際 repo 狀態調整表述
   - 不要保留會讓人誤以為「整個產品只有 V1」的說法
   - 不要保留「這就是全部。沒有隱藏的 Phase。」這類表述

## 你需要完成的內容

請把 `docs/roadmap.md` 至少整理出這幾層：

### 1. 願景 / 北極星

一句話描述產品長期方向。

### 2. 版本全貌地圖

至少清楚列出：

- V1：單專案知識閉環工作台
- V2：穩定化與多專案工作台
- V3：跨工具整合層
- V4：治理、自動化、個人 AI 作業系統

每一版都要寫清楚：

- 版本定位
- 做完後使用者可以做到什麼
- 核心能力

### 3. 當前版本執行區

只針對目前所在版本，列出：

- 目標
- Phase / milestones
- 目前完成度
- 下一步
- 已知缺口

### 4. roadmap 治理規則

請明確寫入：

- `docs/roadmap.md` 是專案進度的單一真源
- `docs/handoff/current-task.md` 只保留短期交接，不單獨宣告整體版本完成
- `docs/product/user-guide-current.md` 只描述現在可用功能，並以 roadmap 為準

### 5. 異動記錄

保留重要版本調整與狀態校準記錄。

## 寫作要求

- 使用繁體中文
- 內容要白話、清楚、可掃描
- 讓第一次打開 repo 的人也能快速理解
- 區分「當前版本進度」和「整體產品全貌」
- 若目前狀態有不確定之處，用保守、真實的說法，不要過度宣告完成

## 你應該避免的事

- 不要只做 wording 微調
- 不要把 roadmap 寫成只剩抽象願景
- 不要把 roadmap 寫成只有當前 Phase，卻看不到 V2、V3、V4
- 不要延續「全部完成、沒有後續版本」的表述

## 驗收標準

更新後的 `docs/roadmap.md` 應滿足：

1. 只看 roadmap，就知道這個產品至少有 V1、V2、V3、V4
2. 只看 roadmap，就知道現在正在做哪個版本
3. 只看 roadmap，就知道下一步要做什麼
4. roadmap 內容和原始產品目標一致，不把 V2 誤當成最終終點
5. roadmap 可以作為後續 `current-task`、`user-guide-current` 的判讀依據

## 完成後回報

完成後請回報：

- 你如何重構 roadmap 的層次
- 目前版本被你判定為什麼狀態
- 你如何在 roadmap 中呈現 V1–V4 全貌
- 是否發現其他文件與 roadmap 仍有不一致之處
