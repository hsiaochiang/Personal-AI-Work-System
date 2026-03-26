# S7 One-Shot Execution Contract

## Goal

用單次啟動完成一輪可交付執行：
- Intake validation
- One smallest safe implementation step
- Validation
- Governance sync
- Fixed-format report

## Start Conditions

1. 必讀文件可讀：AGENTS、current-task、blockers、roadmap、project-context、commands。
2. 目前階段允許執行（S7 planning/execution 狀態，無 P1 active blocker）。
3. 不可使用破壞性 git 指令（commit/push/reset/checkout 還原）。

## Stop Conditions

1. 本輪目標已完成且驗證 PASS。
2. 遇到真阻塞且已寫入 blocker 與退出條件。
3. 發現 scope 漂移風險，先停在治理修補。

## Execution Loop

1. Intake:
   - 讀取最小上下文。
   - 判定 highest-value smallest-safe 下一步。
2. Execute:
   - 僅做單一可驗收步驟。
3. Validate:
   - 檔案存在、關鍵字或命令 smoke。
4. Sync:
   - runlog + handoff 必做。
   - 有 UI/UX/流程互動變更時補 uiux + qa。
5. Report:
   - 固定五段輸出。

## Next-Step Selection Strategy

選擇規則：
1. 先補 acceptance 缺口，再做新功能。
2. 優先可一天驗收的最小步驟。
3. 優先降低交接風險與治理漂移。

## Failure Protection Scenarios

1. Validation failed:
   - 不往下擴 scope，先修可驗收缺口。
2. Governance unsynced:
   - 視為未完成，先補 runlog/handoff。
3. Blocker detected:
   - 最小排查後寫 blocker，附解除條件。
