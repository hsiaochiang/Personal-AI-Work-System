# Roadmap

> 用來回答：「目前在哪個階段？下一步是什麼？」  
> 完整路線：[`project-roadmap.md`](roadmap/project-roadmap.md) ｜ V1 歷史：[`v1-roadmap.md`](roadmap/v1-roadmap.md)

## Roadmap 對應矩陣

| 需求 | 主要文件 | 用途 | 更新頻率 |
|---|---|---|---|
| 看長程產品路線（版本/Phase） | `docs/roadmap/project-roadmap.md` | 產品層規劃與里程碑邊界 | 低頻（階段切換時） |
| 看當前執行進度（Current/Next） | `docs/roadmap.md` | 單一真源（執行層） | 高頻（每輪續作） |
| 查 S7 變更任務與驗收 | `openspec/changes/phase7-v4-autonomous-continuation-governance-automation-mvp/tasks.md` | change 層任務清單與勾選狀態 | 中高頻（task 完成時） |
| 查 V1 完整歷史內容 | `docs/roadmap/archive/2026-03-26_v1-roadmap.md` | 歷史封存，不再更新 | 凍結 |

## Cycle 說明（S7）

- `phase7-v4-autonomous-continuation-governance-automation-mvp` 是單一 active change。
- `Cycle` 是這個 change 內部的迭代驗收批次，不是新的 change。
- 目前統計：Cycle-01 到 Cycle-05 已完成；Cycle-06 為下一輪候選。

## 階段（對齊 project-roadmap / v1-roadmap）

| S | 里程碑 | 狀態 |
|:-:|--------|:----:|
| S0 | 規劃與骨架建立 | ✅ |
| S1 | V1 Phase 1 手動流程跑通 | ✅ 收尾 |
| S2 | V1 Phase 2 半自動提取 MVP | ✅ 已完成（已 sync/archive） |
| S3 | V1 Phase 3 真實專案驗證 | ✅ 已完成（已 sync/archive） |
| S4 | V1 Phase 4 收斂定版 | ✅ 已完成（已 sync/archive） |
| S5 | V2 輕量 UI 工作台 | ✅ 已完成（已 sync/archive） |
| S6 | V3 多工具接入 | ✅ 已完成（已 sync/archive） |
| S7 | V4 一次到位續作與治理自動化 | 🚧 治理 MVP 已 GO |

## 目前狀態
- Current：S7 active（`phase7-v4-autonomous-continuation-governance-automation-mvp`），治理 MVP Review Gate：GO，Cycle-05 已完成
- Next：啟動 S7 Cycle-06 候選（維持單一增量擴充策略）
- Blockers：無阻斷 S7 的 active blockers（僅監控未追蹤 phase4 目錄）

## 階段轉換記錄
- 2026-03-26：完成 S7 Cycle-05 最小實作（template verify-only 編碼穩定檢核）
- 2026-03-26：完成 S7 Cycle-04 最小實作（新增 template verify-only 的一鍵檢核腳本）
- 2026-03-26：完成 S7 Cycle-03 最小實作（新增 governance 一鍵檢核腳本）
- 2026-03-26：S7 完成最終 Review Gate（治理 MVP：GO），狀態由「規劃啟動」推進為「治理 MVP 已 GO」
- 2026-03-26：S7 Executor 完成 tasks 2.x/3.x/4.x/5.x（一次到位續作契約、治理同步規則、報告模板、smoke 與交接同步）
- 2026-03-26：啟動 S7 active change `phase7-v4-autonomous-continuation-governance-automation-mvp`，已建立 proposal/design/tasks/spec 草案
- 2026-03-26：完成 S7 可執行提示詞包（WOS/Planner/Executor/Review Gate），降低啟動成本並支援一次到位續作
- 2026-03-26：S6 完成 Review Gate 最終 GO，並完成 archive（`2026-03-26-phase6-v3-multi-tool-integration-framework-mvp`）
- 2026-03-26：S6 主 spec 完成 sync，`strict validate(spec)` 已 PASS，原 ENOENT blocker 已解除
- 2026-03-26：S6 進入 Review Gate，判定為 CONDITIONAL GO（待治理文件一致性修補）
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


