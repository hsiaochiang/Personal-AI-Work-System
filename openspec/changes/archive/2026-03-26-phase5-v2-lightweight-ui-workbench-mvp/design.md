# Design: phase5-v2-lightweight-ui-workbench-mvp

## Context

目前專案已在 S1-S4 完成 docs-first 與 spec-driven 的流程收斂，但操作體驗仍偏向文字與命令。
S5 需要提供最小 UI 工作台，讓操作者可在同一畫面完成候選檢視與審核，並保留治理證據一致性。

## Goals / Non-Goals

Goals:
- 提供最小可用 UI 工作台，完成一次端到端審核閉環。
- 保持 docs-first 與 smallest safe change，不擴張到完整產品化。
- 將採納/拒絕決策留下可追溯證據。

Non-Goals:
- 不做多工具接入（留給 S6）。
- 不做完整視覺系統與大型前端重構。
- 不改寫 S1-S4 已封存內容。
- 不處理部署、權限、監控等產品化基礎設施。

## Decisions

1. 單頁 MVP 優先
- 先用單一工作台頁面承載流程，避免跨頁資訊同步複雜度。

2. 審核先於寫入
- 所有候選都需人工採納/拒絕後才可寫入草稿，避免自動污染。

3. 寫入目標採「草稿層」
- 先寫入治理草稿或暫存輸出，不直接改動長期記憶正式檔案。

4. 驗收以可回放證據為核心
- 驗收重點是可重播的一次流程與一致文件證據，而非 UI 精緻度。

## MVP End-to-End Acceptance Path

1. 輸入（Input）
- 操作者於單頁工作台貼上任務上下文文字（必填：summary、source、operator）。

2. 候選（Candidate Generation）
- 系統產生候選清單（可為規則式或 mock），每筆至少包含 `candidate_id`、`summary`、`confidence`、`dedupe_key`。

3. 人工審核（Human Review）
- 每筆候選必須由操作者標註 `adopted` 或 `rejected`。
- 採納與拒絕都必須填寫簡短理由，並記錄 `reviewed_at`、`reviewer`。

4. 草稿寫入（Draft Writeback）
- 僅將 `adopted` 候選輸出到草稿層，不直接寫入長期正式記憶檔。
- 本次草稿層目標檔案：`docs/qa/2026-03-26_smoke.md` 的 S5 驗收區段與 `docs/runlog/2026-03-26_README.md` 的 S5 執行區段。

5. 驗收判定（Acceptance）
- 若完整保留 input/candidate/review/writeback 四段證據，且 strict validate PASS，則判定 S5 tasks 2.x / 3.x 達成。

## Candidate And Review Record Schema (MVP)

- Candidate:
  - `candidate_id` (string)
  - `summary` (string)
  - `confidence` (number)
  - `dedupe_key` (string)
  - `status` (enum: pending|adopted|rejected)

- Review Record:
  - `reviewer` (string)
  - `reviewed_at` (date)
  - `decision` (enum: adopted|rejected)
  - `reason` (string)

## Draft Writeback Format (MVP)

- Writeback 輸出採 markdown 區段，格式如下：
  - Input summary
  - Candidate list
  - Review decisions
  - Adopted outputs
  - Rejected outputs with reasons
  - Evidence paths

## Risks / Trade-offs

- 風險：MVP 範圍被擴張。
  緩解：以 non-goals 與 tasks checklist 強制邊界。

- 風險：UI 看似可用但治理未同步。
  緩解：將 runlog/handoff/qa 同步列為必經 gate。

- 風險：候選品質不足導致審核體驗差。
  緩解：S5 接受規則式或 mock 候選，先驗流程；品質優化留後續。

## Rollback Strategy

- 若 UI 流程未達驗收：
  1. 停止擴充功能，凍結在 docs-first artifacts 修正階段。
  2. 回退到最後一個可驗證的草稿輸出狀態。
  3. 補齊失敗步驟證據（runlog/qa）後再重跑最小流程。
- 若治理文件不同步：
  1. 視為 gate fail，不得宣告 S5 完成。
  2. 僅做最小文件修正，不新增功能 scope。
