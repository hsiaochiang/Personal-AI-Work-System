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

## Agent 銜接流程

完整協作流程（由 WOS 起始，形成迴圈）：

```
使用者 → @WOS（判斷下一步）
          ↓ 規劃模式：brief 未確認 / 無 active change
   OpenSpec Planner（產出 change 定義）
          ↓ 開發模式：brief 已確認 + active change 存在
   OpenSpec Executor（執行 change lifecycle）
          ↓ 品質閘：tasks 全完成 / smoke 存在
   Review Gate（判斷可否 commit / sync / archive）
          ↓ 收尾 / 進度查詢
     @WOS（#progress 查看整體進度）
```

| 銜接點 | 觸發條件 | 交接內容 |
|--------|---------|---------|
| WOS → Planner | WOS 偵測到規劃模式（brief 未確認，或 brief 已確認但無 active change） | 使用者描述的需求；WOS 給出 `呼叫 OpenSpec Planner` 建議 |
| Planner → Executor | proposal / design / spec / tasks 全部產出，使用者確認 scope | change 名稱；`openspec/changes/<name>/` 目錄完整 |
| Executor → Review Gate | tasks.md 所有 `- [x]`、smoke 文件已建立 | 實作摘要；smoke 結果；blocking / non-blocking issues |
| Review Gate → WOS | commit + archive 完成 | 歸檔路徑；v{N}-brief 更新；next change 建議 |

> 上述流程是建議，不是強制。任何 agent 都可直接呼叫，使用者可自行決定跳過某個節點。
