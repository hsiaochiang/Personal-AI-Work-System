# Task Patterns

## 使用原則

- 只記錄已具備重用價值的任務模式
- 單次成功做法先觀察，不直接視為固定流程
- 任務模式應描述步驟骨架，不要寫成過度依賴單次情境的操作紀錄

## 已確認的任務模式

### 任務模式 1：先規劃再落地

- 任務名稱：規劃型專案啟動
- 適用情境：當專案方向尚未定清楚，且使用者希望降低中途推翻的風險時
- 常見輸入：
  - 使用者的目標
  - 目前遇到的問題
  - 既有工具或工作方式
- 執行步驟：
  1. 先整理目標
  2. 再定設計原則
  3. 再收斂策略
  4. 再定運作方式
  5. 再進入 MVP 與模板設計
- 產出形式：
  - 規劃文件
  - 決策紀錄
  - 專案模板
- 檢查點：
  - 是否先完成規劃框架
  - 是否避免過早跳入工具與實作
- 狀態：已確認

### 任務模式 2：單次手動 workflow pilot

- 任務名稱：OpenSpec change 首次實跑驗證
- 適用情境：repo 已有治理入口，但尚未確認一次完整人工 workflow 是否真的可重播時
- 常見輸入：
  - 已確認的 change name、scope、non-scope、acceptance criteria
  - `AGENTS.md`、handoff、roadmap、project-context、commands
  - 可用的 OpenSpec CLI 與空的 `openspec/changes/`
- 執行步驟：
  1. 先確認治理入口與 handoff 是否足以啟動 change
  2. 用 OpenSpec CLI 建立 change 骨架，再用 `openspec instructions` 反查 artifact 格式
  3. 補齊 proposal、design、tasks、delta spec
  4. 執行 strict validate 與 repo smoke
  5. 把實際有用檔案、未使用欄位、摩擦點與最小修正寫回 QA / runlog / handoff / memory
- 產出形式：
  - `openspec/changes/<change-id>/`
  - `docs/qa/<date>_smoke.md`
  - `docs/runlog/<date>_README.md`
  - `docs/handoff/current-task.md`
- 檢查點：
  - 是否留下完整 evidence chain，而非只留主觀感受
  - 下一位 agent 是否可只靠 repo 內文件接續下一次 pilot
  - 修正是否只限於本次 pilot 直接暴露的問題
- 狀態：已確認

## 觀察中的模式

- 目前無
