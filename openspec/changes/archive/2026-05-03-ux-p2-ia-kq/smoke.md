# Smoke Test: ux-p2-ia-kq

**Date**: 2026-05-03  
**Change**: P2-IA-01 + P2-KQ-04  
**PROD Commit**: 3753f4e

## 測試項目

### P2-IA-01: nav 副標籤

| # | 測試項目 | 預期 | 結果 |
|---|---------|------|------|
| 1 | 開啟 /（專案總覽），sidebar 顯示副標籤「即時進度」 | ✅ | PASS |
| 2 | 導覽至 /memory，副標籤「知識庫與偏好規則」可見 | ✅ | PASS |
| 3 | 9 個頁面都有副標籤 | ✅ | PASS |
| 4 | 主標籤字體大小不變；副標籤更小、透明度偏低 | ✅ | PASS |
| 5 | icon 上緣對齊主標籤（margin-top: 0.05rem） | ✅ | PASS |

### P2-KQ-04: 複製給 AI

| # | 測試項目 | 預期 | 結果 |
|---|---------|------|------|
| 6 | /memory 條目 hover 後右下出現 content_copy icon | ✅ | PASS |
| 7 | 點擊 copy icon → icon 變 check 1.5 秒後恢復 | ✅ | PASS |
| 8 | 貼上剪貼簿內容格式：`[類型]：標題 — 內容（來源：PAIS，日期）` | ✅ | PASS |
| 9 | /search 搜尋結果 hover 後出現 content_copy icon | ✅ | PASS |
| 10 | /search copy-ai hover 色為 var(--primary) | ✅ | PASS |

## axe-core 結果

全部 9 頁 0 critical，serious 數量與改前相同（既有 scrollable-region-focusable，非本次引入）。
