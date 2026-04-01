# v2-flow-validation-and-usability

## 目的
1. **Flow Validation**: 確保 V1 建立的知識閉環 (handoff -> extraction -> writeback) 與 V2 的新功能 (backup, project switching) 能夠串聯運作。不只驗證個別 API，而是驗證「真實工作流」。
2. **Usability Hardening**: 補齊各頁面的 loading, empty, error 狀態，並優化提示語，提升系統的可靠度與可用性。

## 任務
1. **設計測試計畫**: 建立 `docs/qa/v2-e2e-flow.md`，定義完整的情境測試步驟。
2. **執行情境驗證**: 實測該計畫，若發現 UI 缺陷則記錄下來。
3. **優化 UI 狀態 (Usability Hardening)**: 
   - 檢查並補齊 `web/public/js/` 下各腳本 (overview.js, task.js, memory.js, extract.js, decisions.js, search.js) 中的 loading / empty / error 處理邏輯。
   - 確保使用了共通的 `showLoading`, `showEmpty`, `showError` 函式 (已存在於 app.js)。
4. **調整提示**: 將生硬的技術用語替換為更清楚的使用者引導。

## 驗收標準
- 存在並通過完整的 `v2-e2e-flow.md` 驗證記錄。
- 當無法載入 roadmap 或 task 時，顯示明確的 Empty 或 Error 狀態，而非空白。
- 提取與寫回過程中，有明確的 Loading 狀態與成功/失敗提示。
