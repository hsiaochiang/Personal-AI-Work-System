# Design: phase6-v3-multi-tool-integration-framework-mvp

## Context

S5 已完成單頁工作台最小審核閉環，但來源仍偏單一。
S6 目標是建立「多工具接入框架」並完成最小演示，驗證跨來源候選可被統一審核與治理。

## Goals / Non-Goals

Goals:
- 提供最小可擴充的多工具接入契約（Adapter + Normalize + Review Gate）。
- 完成至少 2 來源的端到端演示。
- 保留 docs-first、人工審核閘門、治理同步。

Non-Goals:
- 不做完整產品化與大規模架構重寫。
- 不改寫 S1-S5 archived artifacts。
- 不追求來源品質最佳化，只驗流程打通。

## Architecture (MVP)

1. Tool Adapter Layer
- 每個工具以 adapter 實作統一介面：
  - tool_id
  - fetch_candidates(input_context)
  - map_to_normalized(candidate_raw)

2. Candidate Normalization Layer
- 將不同來源輸出轉為統一 Candidate Schema：
  - candidate_id
  - summary
  - confidence
  - dedupe_key
  - source_tool
  - source_ref
  - status (pending/adopted/rejected)

3. Merge & Dedupe Layer
- 以 dedupe_key 合併來源候選，保留來源追溯資訊。
- 衝突時維持多來源 trace，不自動覆寫人工決策。

4. Human Review Gate
- 每筆候選必須人工決策 adopted/rejected。
- 強制填寫 reviewer/reviewed_at/reason。

5. Draft Writeback Layer
- 僅輸出 adopted 候選到 draft evidence。
- 不直接寫入長期正式記憶層，不可改寫 archived artifacts。

## Data Contracts (MVP)

### Normalized Candidate

- candidate_id: string
- summary: string
- confidence: number
- dedupe_key: string
- source_tool: string
- source_ref: string
- status: pending | adopted | rejected

### Review Record

- candidate_id: string
- decision: adopted | rejected
- reviewer: string
- reviewed_at: datetime
- reason: string

### Writeback Record

- run_id: string
- adopted_items: Candidate[]
- rejected_items: { candidate_id, reason }[]
- evidence_paths: string[]

## MVP Acceptance Path

1. 輸入 context。
2. 兩來源 adapter 取回候選。
3. normalize + dedupe 形成 review queue。
4. 人工逐筆 adopt/reject。
5. 輸出 draft writeback + 治理證據同步。
6. strict validate（change）PASS。

## Risks / Trade-offs

- 接入工具越多，差異處理成本越高。
- 先做框架會犧牲部分來源品質優化。
- 若治理同步滯後，會造成流程已跑但不可驗收。

## Rollback Strategy

- 若任一來源不穩：可暫時停用該 adapter，保留框架與單來源 fallback。
- 若 normalize/dedupe 失真：回到來源分流檢視，不做自動合併。
- 若治理不同步：視為 gate fail，只修文件與驗證，不新增功能範圍。
