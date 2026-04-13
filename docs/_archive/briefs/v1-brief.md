# V1 Brief — 單專案知識閉環工作台

> 這份文件是 `V1` 的版本確認書。
> 回溯記錄：V1 已於 2026-03-28 全部完成。

## 版本定位

`V1` 是 **單專案知識閉環工作台**。

它的核心任務是驗證：一套 markdown 驅動的工作台，能否讓使用者在單一專案中完成「讀取現況 → 產生 handoff → 提取知識 → 審核寫回 → 檢視決策」的完整閉環。

## 為什麼要做 V1

在多個 AI 對話 session 間，知識容易散落、上下文需反覆重建。V1 要回答的問題是：

- 輕量 web UI + markdown 驅動能否降低新對話的啟動摩擦？
- 把一次性對話中的有用知識變成可重用的專案記憶，閉環能否跑通？

## V1 完成後，使用者可以做到什麼

- 在瀏覽器看到 roadmap 進度和當前任務
- 在 UI 產生 handoff 草稿，複製貼到新 AI 對話
- 貼上對話 → 系統產生候選 → 審核 → 寫回記憶
- 集中檢視決策與規則，搜尋篩選
- 多專案切換 + 全域搜尋

## In Scope

| Phase | 交付物 |
|:-----:|--------|
| Spec | 產品設計藍圖（工作流規格、模板集、UI 設計稿） |
| 1 | 基礎儀表板（Overview / Task / Memory 三頁） |
| 2 | Handoff Builder MVP（選模板 → 填寫 → 預覽 → 複製） |
| 3 | 知識閉環 MVP（提取 → 審核 → 寫回） |
| 4 | 決策與規則集中檢視 + 搜尋 + 衝突偵測 |
| 5 | Projects Hub + 全域搜尋 + sidebar 專案名稱 |

## Out of Scope

- writeback backup / draft 機制 → V2
- 多專案資料源真切換 → V2
- 多工具對話匯入 → V3
- 自動化治理 → V4
- 前端框架重構

## 技術約束

- 純靜態 HTML + vanilla JS，無框架、無 build
- Node.js HTTP server（內建模組，無外部 dependency）
- 資料來源：直接讀寫 markdown 檔案

## 完成標準

- [x] handoff builder 可真正使用
- [x] extraction → review → writeback 可跑通
- [x] Memory / Decisions / Rules 能反映寫回結果
- [x] 多專案切換 + 全域搜尋可用
- [x] `node web/server.js` → http://localhost:3000 可用

## 完成狀態

**V1 Phase 1–5 全部完成** — 2026-03-28

## 一句話總結

V1 驗證了 markdown 驅動的知識閉環工作台是可行的，下一步是讓它從「可演示」走向「可信任」（V2）。
