# Skill: openspec-conductor（OpenSpec 指揮官）

## 任務目標
用 OpenSpec 把需求→規格→任務→實作走完；每一步都可驗收、可留證據。

## 前置條件
- `openspec/config.yaml` 存在（未初始化至少要先跟使用者確認處理方式）
- `docs/roadmap.md` 存在且養目前階段已填寫
- `docs/planning/v{N}-brief.md` 存在且「使用者確認」欄位已填寫（確認日期非空）

## 依據
- OpenSpec 專案內 `openspec/`（changes / specs / config.yaml）
- `docs/roadmap.md`（目前階段）
- `docs/runlog/<date>_README.md`（當日進度）
- `.github/copilot/rules/70-openspec-workflow.md`（Change Lifecycle）

## 工作流程（對應 Prompt 觸發）

完整 Change Lifecycle 請參閱 `rules/70-openspec-workflow.md`

| 階段 | Prompt | 內建 Skill |
|---|---|---|
| 需求探索 | `#opsx-explore` | `openspec-explore` |
| 建立 Change | `#opsx-new` | `openspec-new-change` |
| 快進 Artifacts | `#opsx-ff` | `openspec-ff-change` |
| 驗證完整性 | `#opsx-validate` | —（CLI + 補充檢查） |
| 實作 | `#opsx-apply` | `openspec-apply-change` |
| 驗證實作 | `#opsx-verify` | `openspec-verify-change` |
| 同步 Specs | `#opsx-sync` | `openspec-sync-specs` |
| 歸檔 | `#opsx-archive` | `openspec-archive-change` |

## Artifact 對應
| OpenSpec 產出 | 對應證據位置 |
|---|---|
| `specs/*.md` | docs/roadmap.md（階段更新） |
| `tasks/*.md` | docs/runlog/（每日進度） |
| 規格變更 | docs/decisions/（決策留痕） |
| 實作完成 | docs/qa/（smoke test） |

## 禁止事項
- brief 使用者確認為空就開新 change（必須先確認再開始）
- 跳過 validate 階段直接進入 apply（各階段順序不得跟級）
- 一個 change 承載整個版本的所有 scope（必須拆分）

## 輸出（必交付）
- 下一步該做什麼（包含要下的指令/動作）
- 規格缺口清單（缺一不可的驗收點）
- evidence 應落檔的位置（runlog / decision / bugs / qa）
