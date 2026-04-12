# 90-project-custom（專案自訂擴充槽位）

## 目標
- 提供下游專案一個安全的規則擴充位置，避免直接修改 managed files
- 讓專案特定偏好、限制與流程能穩定保留，不被 template upgrade 覆蓋

## 什麼應該寫在這裡
- 專案特有的技術限制
- 專案特有的輸出偏好或命名慣例
- 專案特有的工作流補充規則
- 專案特有的禁止事項

## 什麼不應該寫在這裡
- 通用模板規則
- 應回饋到上游 template 的缺陷修正
- 單次任務的暫時性上下文（請寫到 handoff 或 runlog）

## 使用方式
- 若專案需要補充 Copilot rules，先檢查現有 managed rules 是否已涵蓋
- 若沒有涵蓋，再把專案特定規則寫在本檔
- 若本檔與 managed rules 衝突，以人工明確確認後的專案規則為準

## WKM 知識庫路徑約定

- **WKM 專案根目錄**：`D:\program\WKM\`
- **Wiki 根目錄**：`D:\program\WKM\wiki\`
- **原始資料**：`D:\program\WKM\raw\`（只讀，agent 不修改）
- **暫存區**：`D:\program\WKM\0resource\`（不是知識庫，僅暫存，不要把 wiki 內容放在這）
- **系統設定**：`D:\program\WKM\SCHEMA.md`（每次操作前必讀）
- 知識抽取者 agent 操作 wiki 時，永遠使用 Windows 絕對路徑
- WKM 是獨立目錄，不混入 PAWS 的 git 歷史

## 初始欄位
- Project-specific constraints:
    - 本 repo 目前是 docs-first / workflow-first 專案，未經人工確認不要引入新的 runtime、框架或部署假設。
    - `docs/memory/`、`docs/planning/`、`docs/roadmap/` 是專案真實內容來源；managed 模板檔若有缺陷，應回上游 template repo 修正。
    - `docs/handoff/current-task.md`、`docs/handoff/blockers.md` 屬 init-only / 專案治理檔，後續由本 repo 自行維護，不期待 template upgrade 補回。
- Project-specific conventions:
    - 根目錄 `README.md` 只保留入口導覽，細節放在 `docs/planning/`、`docs/memory/`、`docs/roadmap/`。
    - `docs/roadmap.md`、`docs/decision-log.md` 保持精簡，用來給 agent 快速判讀目前階段與已定案事項。
    - 長期背景優先沉澱到 `docs/memory/`；短期任務狀態寫在 handoff；當日證據寫在 `docs/runlog/`。
- Project-specific workflow notes:
    - 每次模板升級後，優先回填 `docs/agents/project-context.md`、`docs/agents/commands.md`、handoff 與當日 runlog，再讓 WOS / OpenSpec 依這些檔案工作。
    - 若要新增專案特定 agent 行為，先寫本檔或專案自有文件，不要直接改 managed rules。
    - 提交時將「模板導入成果」與「專案自己的 protected / init-only 回填」分成不同 commit，讓後續升級更易追蹤。
