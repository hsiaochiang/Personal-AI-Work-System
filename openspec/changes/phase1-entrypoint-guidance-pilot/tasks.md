# Tasks: phase1-entrypoint-guidance-pilot

## 1. 建立第 2 次 pilot artifacts

- [ ] 1.1 補齊 proposal、design、tasks 與至少一份 delta spec
  - 驗收條件：artifacts 符合 `openspec instructions` 顯示的章節要求，且 scope 明確聚焦在入口順序、artifact 反查與 validate 命令使用
- [ ] 1.2 讓第 2 次 pilot 的 delta spec 可直接對照第 1 次 QA 摩擦點
  - 驗收條件：spec 至少覆蓋入口順序、`openspec instructions`、`openspec change validate` 三個比較面向

## 2. 執行一次比較型手動 workflow

- [ ] 2.1 依固定入口順序重新啟動第 2 次 pilot
  - 驗收條件：runlog 或 QA 明確記錄實際閱讀順序，且以 `AGENTS.md`、handoff、roadmap、commands 為主要入口
- [ ] 2.2 使用正確 CLI 路徑完成 artifacts 與 validate
  - 驗收條件：證據中明確顯示使用 `openspec instructions` 反查格式，並以 `openspec change validate <change-name> --strict` 驗證

## 3. 留下可比較的摩擦證據

- [ ] 3.1 產出第 2 次 pilot 的比較型 QA 紀錄
  - 驗收條件：QA 至少回答 artifact 反查摩擦、validate 命令誤用、入口掃描範圍三項是否較第 1 次改善
- [ ] 3.2 同步更新 handoff / runlog / roadmap 或等價治理證據
  - 驗收條件：下一位 agent 可只靠 repo 文件直接知道第 2 次 pilot 的狀態、結果與下一步