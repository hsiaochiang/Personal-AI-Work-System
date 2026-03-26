# Design: phase7-v4-autonomous-continuation-governance-automation-mvp

## Context

專案已完成 S1-S6 並具備 docs-first 治理流程。
現況痛點為續作依賴人工多次觸發，且治理留痕易因上下文切換而遺漏。
S7 以最小安全變更建立一次到位續作契約與治理同步機制。

## Goals / Non-Goals

Goals:
- 定義單次啟動可完成接手到交付的流程契約。
- 定義治理同步最小自動化（runlog/handoff 必做，條件式 uiux/qa）。
- 保持不 commit / 不 push / 不 reset 的安全邊界。

Non-Goals:
- 不做架構重寫或大型依賴導入。
- 不處理未追蹤 phase4 目錄（維持凍結）。
- 不將 S7 擴張為完整產品化編排系統。

## Architecture (MVP)

1. Intake Validation Step
- 讀取最小必讀文件：AGENTS、handoff、blockers、roadmap、project-context、commands。
- 驗證既有資產與前置條件（S6 archive、S7 GO 條件）。

2. Autonomous Execution Loop
- 以「最高價值 + 最小安全」原則挑選下一步。
- 執行 -> 驗證 -> 留痕，直到達成目標或遇真阻塞。

3. Governance Sync Layer
- 每輪至少更新 runlog 與 handoff。
- 當變更影響 UI/UX 或流程體驗時，同步更新 uiux 與 qa。

4. Reporting Contract Layer
- 固定輸出結構：Current state / Changes made / Validation / Open issues / Next step。

## Data Contracts (MVP)

### Execution Record

- run_id: string
- task_name: string
- step_summary: string[]
- validation_summary: string[]
- blocker_state: none | active

### Governance Sync Record

- runlog_updated: boolean
- handoff_updated: boolean
- uiux_updated: boolean
- qa_updated: boolean
- evidence_paths: string[]

## MVP Acceptance Path

1. 單次啟動 S7 任務。
2. 完成最小接手驗證。
3. 建立或更新 S7 artifacts（proposal/design/tasks/spec）。
4. 同步 runlog + handoff（必要時 uiux/qa）。
5. 產出固定格式報告。

## Day-Sized Execution Slices

- Day 1:
	- 完成 S7 artifacts 邊界鎖定與 acceptance criteria 固化。
	- 驗收：strict validate PASS + roadmap/handoff/runlog 同步。
- Day 2:
	- 完成一次到位續作契約（開始/停止/阻塞）與報告契約樣板。
	- 驗收：固定 5 區塊報告可重播。
- Day 3:
	- 完成治理同步條件規則（runlog/handoff 必做，UI/UX 條件觸發 uiux/qa）。
	- 驗收：至少一輪 smoke 顯示治理同步行為正確。

## Risks / Trade-offs

- 若自動續作邊界不清，可能造成 scope 膨脹。
- 若治理同步規則過嚴，可能增加單輪執行時間。
- 若驗證不足，可能出現「看似完成但不可重播」風險。

## Risk Matrix

- R1: scope 膨脹（機率中/衝擊高）
	- 緩解：每輪僅允許一個最小安全步驟。
- R2: 治理漏寫（機率中/衝擊中）
	- 緩解：把 runlog/handoff 設為完成前必要條件。
- R3: 假完成報告（機率低/衝擊中）
	- 緩解：固定 5 區塊缺一即判 fail。

## Rollback Strategy

- 只做 docs-first 最小回退：以 runlog/handoff 補記修正，不做破壞性 git 回退。
- 若發現 scope 漂移，立即停止新功能擴張，先修治理一致性。
- 若出現 blocker，轉入 blockers 檔並明確退出條件。
