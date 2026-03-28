# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V1 收尾校準 → V2 規劃
- Owner agent: (none)
- Last updated on: 2026-03-28

## Goal
- V1 Phase 1–5 全部實作完成，文件已校準一致。
- 下一步：依使用回饋規劃 V2 scope。

## Scope
- In scope: 文件一致性校準（roadmap / current-task / user-guide）；V2 規劃啟動
- Out of scope: V2 實作、UI 功能擴充

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js dev server

## Done
- Phase 1：基礎儀表板（3 頁）✅
- Phase 2：Handoff Builder MVP（/handoff）✅
- Phase 3：知識閉環 MVP（/extract）✅
- Phase 4：決策與規則集中檢視（/decisions）✅
- Phase 5：Projects Hub + 全域搜尋 + sidebar 專案名稱 ✅
- Roadmap 重構為單一真源（V1–V4 全貌）✅
- 文件一致性校準（current-task / user-guide）✅

## In Progress
- (無)

## Next Step
- 規劃 V2：writeback backup 機制、多專案資料源真切換（見 roadmap 已知缺口）
- 依 `docs/roadmap.md` 版本升級條件確認 V1 → V2 門檻

## Validation Status
- Phase 1：✅ http://localhost:3000/
- Phase 2：✅ http://localhost:3000/handoff
- Phase 3：✅ http://localhost:3000/extract
- Phase 4：✅ http://localhost:3000/decisions
- Phase 5：✅ http://localhost:3000/projects | http://localhost:3000/search
