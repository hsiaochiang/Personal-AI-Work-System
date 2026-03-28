# 個人 AI 工作台 — 目前可用功能（V1 完整版）

> 這份文件描述**現在已經可以使用的功能**，不是未來完成後的願景。
> 版本狀態與後續路線以 `docs/roadmap.md` 為準。

## 啟動方式

```bash
cd D:\program\Personal-AI-Work-System\web
npm start
```

瀏覽器開啟 http://localhost:3000

## 現在可以做的事

### 1. 看到專案 roadmap 進度

- 頁面：http://localhost:3000/
- 資料來源：`docs/roadmap.md`
- 顯示：Phase 進度表 + KPI（總數/已完成/下一步/百分比）
- 驗證：修改 roadmap.md → 重整頁面 → 畫面更新

### 2. 看到當前任務交接資訊

- 頁面：http://localhost:3000/task
- 資料來源：`docs/handoff/current-task.md`
- 顯示：任務名稱、目標、Scope、限制、已完成/進行中/下一步、驗證狀態

### 3. 瀏覽專案記憶

- 頁面：http://localhost:3000/memory
- 資料來源：`docs/memory/*.md`（6 個檔案）
- 顯示：按分類瀏覽（決策/偏好/輸出模式/背景/候選/任務模式），共 172 條

### 4. 產生 Handoff 草稿（NEW）

- 頁面：http://localhost:3000/handoff
- 功能：選擇類型（規劃/實作/整合）→ 編輯欄位 → 即時預覽 → 複製到剪貼簿
- 用途：貼進新 AI 對話，讓 AI 直接知道背景和目標

### 5. 從對話提取知識候選

- 頁面：http://localhost:3000/extract
- 功能：貼上 AI 對話文字 → 系統自動產生候選 → 審核（採用/編輯/忽略）→ 寫回記憶
- 用途：把一次性對話中的有用知識，變成可重用的專案記憶

### 6. 集中檢視決策與規則

- 頁面：http://localhost:3000/decisions
- 功能：瀏覽決策清單 + 搜尋關鍵字；規則頁依偏好/輸出模式/任務模式分類；矛盾規則高亮標記
- 用途：追蹤已定案決策、快速查閱工作規則

### 7. 多專案切換 + 全域搜尋

- 頁面：http://localhost:3000/projects（Projects Hub）| http://localhost:3000/search
- 功能：多專案卡片聚合狀態、點擊切換專案、全域搜尋所有資料
- 用途：管理多個專案工作區，快速定位資訊

## 已知限制（V2 才解決）

| 限制 | 說明 | 歸屬版本 |
|------|------|:--------:|
| writeback 無 backup 機制 | 寫回記憶時沒有 draft / backup，誤寫無法還原 | V2 |
| 多專案資料源未真正切換 | UI 可切換顯示，但後端資料仍為單一專案 | V2 |
| 不支援多工具對話格式匯入 | 僅支援貼上文字，不支援 ChatGPT/Gemini 格式自動解析 | V3 |
| 無自動化治理 | 規則衝突偵測、記憶品質檢查仍需手動 | V4 |
