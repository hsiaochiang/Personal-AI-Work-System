# Roadmap

> 用來回答：「目前在哪個階段？下一步是什麼？」  
> 完整路線：[`project-roadmap.md`](roadmap/project-roadmap.md) ｜ 當前衝刺：[`v1-roadmap.md`](roadmap/v1-roadmap.md)

## 階段（對齊 project-roadmap / v1-roadmap）

| S | 里程碑 | 狀態 |
|:-:|--------|:----:|
| S0 | 規劃與骨架建立 | ✅ |
| S1 | V1 Phase 1 手動流程跑通 | ✅ 收尾 |
| S2 | V1 Phase 2 半自動提取 MVP | ✅ 已完成（已 sync/archive） |
| S3 | V1 Phase 3 真實專案驗證 | ✅ 已完成（已 sync/archive） |
| S4 | V1 Phase 4 收斂定版 | ✅ 已完成（已 sync/archive） |
| S5 | V2 輕量 UI 工作台 | ✅ 已完成（已 sync/archive） |
| S6 | V3 多工具接入 | 🟨 執行中（2.x/3.x/4.x 已完成，待 5.x 收尾） |

## 目前狀態
- Current：S6 執行中（`phase6-v3-multi-tool-integration-framework-mvp` active）
- Next：完成主 spec sync 並重跑 `strict validate(spec)`，再進入 Review Gate
- Blockers：主 spec 尚未 sync，`strict validate(spec)` 目前 ENOENT（不影響 change strict validate）

## 階段轉換記錄
- 2026-03-26：S6 tasks 5.1/5.2 已完成；下一步為主 spec sync 與 Review Gate 收尾判定
- 2026-03-26：S6 tasks 2.x/3.x/4.x 已完成；`strict validate(change)` PASS，`strict validate(spec)` 因主 spec 未 sync 出現 ENOENT，已列為可追蹤 blocker
- 2026-03-26：已建立 S6 active change `phase6-v3-multi-tool-integration-framework-mvp`（proposal/design/tasks/spec 初稿完成）
- 2026-03-26：`phase5-v2-lightweight-ui-workbench-mvp` 已完成 archive（`2026-03-26-phase5-v2-lightweight-ui-workbench-mvp`）
- 2026-03-26：已建立 S5 active change `phase5-v2-lightweight-ui-workbench-mvp`（proposal/design/tasks/spec 初稿完成）
- 2026-03-26：`phase4-v1-convergence-finalization` 已完成 archive（`2026-03-25-phase4-v1-convergence-finalization`）
- 2026-03-26：S4 已完成 `#opsx-sync` 與 strict validate（change/spec 皆 PASS），進入 archive 前最終 Gate 判定
- 2026-03-25：已建立 S4 active change `phase4-v1-convergence-finalization`（proposal/design/tasks/spec 草案完成）
- 2026-03-25：`phase3-real-project-validation` 已完成 main spec sync 與 archive（`2026-03-25-phase3-real-project-validation`）
- 2026-03-25：已建立 S3 active change `phase3-real-project-validation`（proposal/design/tasks/spec 草案完成）
- 2026-03-25：`phase2-semi-auto-memory-extraction-mvp` 已完成 main spec sync 與 archive（`2026-03-25-phase2-semi-auto-memory-extraction-mvp`）
- 2026-03-25：已建立 S2 active change `phase2-semi-auto-memory-extraction-mvp`，進入 artifacts 補齊與 strict validate 階段
- 2026-03-25：重寫 roadmap 雙檔為表格+checkbox 追蹤格式，S 階段對齊產品路線語意
- 2026-03-24：完成 Phase 1 收斂 review；兩次 archived pilot 已達最小完成線
- 2026-03-24：`phase1-entrypoint-guidance-pilot` 完成 commit / push、main spec sync 與 archive
- 2026-03-24：`phase1-entrypoint-guidance-pilot` 完成第 2 次比較型 pilot、strict validate 與 workspace smoke


