# Smoke Test: ux-p2-ux-05

**Date**: 2026-05-03  
**Change**: P2-UX-05 Decisions 狀態欄  
**PROD Commit**: 3753f4e

## 測試項目

| # | 測試項目 | 預期 | 結果 |
|---|---------|------|------|
| 1 | 開啟 /decisions，每條決策顯示「有效」綠色 badge | ✅ | PASS |
| 2 | badge 顏色 green-ish（rgba(74,222,128,0.15)） | ✅ | PASS |
| 3 | 在 decision-log.md 加 `- 狀態：已取代`，刷新後顯示黃色「已取代」badge | ✅ | PASS |
| 4 | 加 `- 狀態：已過期`，刷新後顯示灰色「已過期」badge | ✅ | PASS |
| 5 | 未填 status 欄位的決策預設顯示「有效」 | ✅ | PASS |
| 6 | axe-core: decisions 頁 0 critical | ✅ | PASS |
