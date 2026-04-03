# Blockers

> 只記錄會影響接手或需要人工決策的阻塞，避免流水帳。

## Active Blockers
- 目前無 active blockers
- 2026-04-03：`conversation-schema-definition` 已完成 archive，當前無阻斷事項

## Clean-room Replay Blocker（2026-03-26）

| 項目 | 狀態 | 影響 | 修補方式 | 解除條件 |
|---|---|---|---|---|
| `openspec change validate "phase6-v3-multi-tool-integration-framework-mvp" --strict` | RESOLVED（replay v2 已改 archive-aware） | 已解除 S7 判定中的 replay 命令失效因素 | 改用 `spec strict validate + template verify + 治理一致性檢核` 重跑 | replay v2 全 PASS（已達成） |

## S7 Entry Blocker（2026-03-26）

| 項目 | 狀態 | 影響 | 修補方式 | 解除條件 |
|---|---|---|---|---|
| 風險回歸演練（R2/R3/R4）未完成 | RESOLVED | 已完成最小風險回歸演練，S7 可重判 | 依風險雷達逐項實測並回寫 QA/Runlog/Blockers | 回歸演練完成且無 P1 未解風險（已達成） |

## Working Tree 變更盤點與風險分級（不 commit 模式）

| 類型 | 路徑 | 風險等級 | 風險說明 | 目前處置 |
|---|---|---|---|---|
| Modified | `docs/decision-log.md` | 中 | 治理決策若與 roadmap/handoff 不一致會造成判讀偏差 | 持續與 `docs/roadmap.md` 真源對齊 |
| Modified | `docs/handoff/blockers.md` | 中 | 交接風險狀態若更新不完整，下一位 agent 易誤判 | 每步完成即更新 blocker 狀態 |
| Modified | `docs/runlog/2026-03-26_README.md` | 低 | 屬證據補充，主要風險為遺漏最新執行結果 | 以時間序追加，不覆蓋既有段落 |
| Untracked | `openspec/changes/phase4-v1-convergence-finalization/` | 高 | 來源未定義，若誤納入可能污染封存基線或造成重複變更 | 先凍結不處理，待人工決策後再行動 |

## S7 前風險雷達（Replay / 回歸殘留）

> 優先處理高衝擊、低可見風險；未完成前不啟動 S7。

| 優先 | 風險 | 機率 | 衝擊 | 緩解 | 觸發條件 | 退出機制 |
|---|---|---|---|---|---|---|
| P1 | clean-room replay 在新環境無法重播（前置條件遺漏） | 中 | 高 | 依 `docs/agents/commands.md` 建立最小重播清單並逐步驗證 | 任一關鍵步驟需額外口頭補充才能完成 | 立即停止 S7；補齊缺漏文件後重跑 replay，連續一次全綠才解除 |
| P1 | writeback 邊界失守，誤寫入 archive/final layer | 低 | 高 | 強制維持 draft-only writeback，逐步核對輸出目標路徑 | 發現輸出落到 `openspec/changes/archive/` 或正式層 | 立刻中止流程；回滾該次寫入並補 smoke 證據，確認無污染後才續行 |
| P2 | spec 結構回歸（缺 `Purpose/Requirements`）造成 strict validate 失敗 | 中 | 中 | sync 後固定執行 change/spec strict validate 雙檢查 | 任一 spec strict validate FAIL | 凍結 archive 與新規劃；先做最小修補並重跑雙 PASS 後解除 |
| P2 | 治理文件狀態漂移（roadmap/handoff/runlog 不一致） | 中 | 中 | 以 `docs/roadmap.md` 為真源做收尾比對 | 同一階段在不同文件出現互斥狀態 | 暫停交接；完成一致性修補與 decision-log 留痕後解除 |

## Resolved Blockers
- S6 主 spec 曾未 sync，導致 `openspec validate multi-tool-integration-framework --type spec --strict` 回報 ENOENT（缺 `openspec/specs/multi-tool-integration-framework/spec.md`）；已同步主 spec 並重跑 strict validate(spec) PASS
- S3 `opsx-sync` 初版把 delta spec 直接同步為 main spec，導致 `openspec validate real-project-validation --type spec --strict` 失敗（缺少 `## Purpose`/`## Requirements`）；已改為 main spec 標準結構後 PASS
- 模板升級曾把 handoff / runlog 證據檔與 protected 骨架混在一起；目前已改用 init-only / non-seeded 模型處理，後續由本 repo 自行維護 `current-task.md`、`blockers.md` 與每日 runlog
- S5 `#opsx-sync` 後 main spec 曾因直接覆蓋 delta 格式導致 strict validate 失敗；已補 `Purpose/Requirements` 主規格結構後 PASS
