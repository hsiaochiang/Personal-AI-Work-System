# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name: Phase 4 — 決策與規則集中檢視
- Owner agent: (pending)
- Last updated on: 2026-03-28

## Goal
- 集中檢視決策記錄與規則，支援搜尋篩選。

## Scope
- In scope: Decision/Rules 集中檢視頁、搜尋篩選
- Out of scope: 多專案切換、完整 UI polish

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js dev server（已建立）

## Done
- Spec Phase 全部完成（12 個 OpenSpec archives）
- Phase 1 實作完成（web/server.js + 3 個頁面）
- Phase 2 Handoff Builder MVP 完成（選類型 → 填寫 → 預覽 → 複製）
- Phase 3 知識閉環 MVP 完成（貼上對話 → 提取候選 → 審核 → 寫回記憶）
- roadmap 優先順序校準（核心閉環已完成）

## In Progress
- (尚未開始)

## Next Step
- Phase 4 規劃

## Validation Status
- Spec Phase：全部 PASS
- Phase 1：✅ 可操作（`cd web && npm start` → http://localhost:3000）
- Phase 2：✅ 可操作（http://localhost:3000/handoff）
- Phase 3：✅ 可操作（http://localhost:3000/extract）
