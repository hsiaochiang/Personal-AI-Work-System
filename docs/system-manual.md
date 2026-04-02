# System Manual — Personal AI Work System

## 系統概述

Personal AI Work System（WOS）是一個讓使用者在多個 AI 對話 session 之間保持上下文連續性的個人工作台。透過 markdown 驅動的文件結構與輕量 web UI，支援 handoff 產生、對話知識提取、審核寫回、決策檢視與多專案管理。

## 目前版本

- **V1** — 單專案知識閉環工作台 ✅ 已完成
- **V2** — 穩定化與多專案工作台 ✅ 已完成
- **V3** — 跨工具整合層 ⏳ 規劃中

## 功能總覽

### 專案總覽（Overview）
- 能力描述：顯示 roadmap 進度與當前任務狀態
- 操作方式：瀏覽器開啟 http://localhost:3000/
- 限制：僅讀取，不可在 UI 編輯

### Handoff Builder（/handoff）
- 能力描述：選擇 handoff 類型（規劃/實作/整合），編輯欄位，產生 markdown，一鍵複製
- 操作方式：選模板 → 填寫欄位 → 預覽 → 複製
- 限制：範本結構硬編碼在前端 JS，不支援自訂範本

### 知識提取與寫回（/extract）
- 能力描述：貼上 AI 對話 → 啟發式提取候選 → 審核（採用/編輯/忽略）→ 寫回 `docs/memory/`
- 操作方式：貼文字 → 審核候選 → 點「寫回」
- 改善（V2）：寫回前自動 backup（`.backup/` 機制），不再整檔覆蓋

### 決策與規則檢視（/decisions）
- 能力描述：瀏覽決策記錄、搜尋篩選、檢視偏好規則、基本衝突偵測
- 操作方式：輸入關鍵字搜尋，切換 tab 查看不同分類
- 限制：衝突偵測僅基於否定詞前綴比對

### 多專案管理（/projects）
- 能力描述：多專案卡片、選中狀態、sidebar 顯示目前專案
- 操作方式：在 `web/projects.json` 設定專案，UI 點選切換
- 改善（V2）：切換專案後 API 資料源跟著切換，各頁面顯示對應專案資料

### 全域搜尋（/search）
- 能力描述：跨所有資料來源的全文搜尋
- 操作方式：輸入關鍵字，結果按來源分組
- 限制：前端字串比對，資料量大時效能未最佳化

## 快速上手（Getting Started）

```bash
# 1. 確認 Node.js 已安裝（>= 18.x）
node --version

# 2. 啟動 dev server
cd web
npm start        # 或 node server.js

# 3. 開啟瀏覽器
# http://localhost:3000
```

## 已知限制
- 對話格式僅支援貼上純文字（V3 改善目標）
- 無自動化治理（V4 改善目標）

## 版本歷史摘要
| 版本 | 日期 | 主要變更 |
|------|------|---------||
| V2 Change 4 | 2026-04-01 | flow validation 與 usability hardening |
| V2 Change 3 | 2026-04-01 | roadmap 與文件一致性校準 |
| V2 Change 2 | 2026-03-31 | 多專案資料源真切換 |
| V2 Change 1 | 2026-03-29 | writeback 寫回前自動 backup |
| V1           | 2026-03-28 | 單專案知識閉環工作台（Phase 1–5 全部完成）|
| Template 1.5 | 2026-04-02 | 升級 copilot-workspace-template v1.5.0 + Style Guide FROZEN |

## Planning Impact Log

| 日期 | 版本 | 異動摘要 | 使用者可見影響 |
|------|------|---------|---------------|
| 2026-04-02 | V3 | 撰寫 v3-brief.md，定義跨工具整合層計劃 | 無（規劃文件，未開始實作） |
| 2026-04-02 | Template 1.5 | 升級 copilot-workspace-template v1.5.0，凍結 Style Guide | 無（開發流程改善，不影響產品功能） |
| 2026-04-01 | V2 | V2 四個 Changes 全部完成，工作台穩定化 | 有：writeback 更安全、多專案真切換、文件一致 |
| 2026-03-28 | V1 | V1 Phase 1–5 全部完成 | 有：完整知識閉環工作台可用 |

## 參考連結
- Version Brief（V1）：`docs/planning/v1-brief.md`
- Version Brief（V2）：`docs/planning/v2-brief.md`
- Roadmap：`docs/roadmap.md`
