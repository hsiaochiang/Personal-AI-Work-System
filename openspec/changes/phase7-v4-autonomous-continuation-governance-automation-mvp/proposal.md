# Proposal: phase7-v4-autonomous-continuation-governance-automation-mvp

## Why

S6 已完成 archive，且 S7 具備條件式 GO。
目前主要痛點是每次續作需要人工多次觸發，且治理同步（runlog/handoff/qa）仍需手動維持。
S7 需以 smallest safe change 建立一次到位續作能力，讓單次指令可連續執行並自動補齊治理證據。

## What Changes

- 定義一鍵續作執行契約：
  - 單次啟動
  - 自動推進下一個最高價值最小步驟
  - 明確停止條件（完成或真阻塞）
- 定義治理同步最小自動化契約：
  - 至少同步 runlog + handoff
  - 涉及 UI/UX 或流程時同步 uiux/qa
- 定義交付報告契約：
  - Current state / Changes made / Validation / Open issues / Next step
- 建立最小驗證與回歸檢查路徑，確保 S7 可重播。

## Scope

- In scope:
  - 一次啟動可完成「接手驗證 -> 一個最小安全步驟 -> 驗證 -> 治理留痕」
  - 治理同步最小自動化（runlog + handoff 必做；UI/UX 變更時補 uiux + qa）
  - 固定輸出報告契約（Current state / Changes made / Validation / Open issues / Next step）
- Out of scope:
  - 排程器、權限系統、多租戶、觀測平台等產品化能力
  - 任何 S1-S6 archived artifacts 改寫
  - 新增重大 runtime dependency

## Acceptance Criteria (Measurable)

1. S7 active change artifacts 完整存在（.openspec.yaml/proposal/design/tasks/spec）且 strict validate PASS。
2. 一次啟動流程能產出固定 5 區塊報告，且不得缺段。
3. 每輪執行至少同步 runlog + handoff；若有 UI/UX 變更，同輪需同步 uiux + qa。
4. 執行過程不得出現 commit/push/reset 或破壞性 git 指令。
5. 至少完成 1 次可重播 smoke（含治理一致性檢查）。

## Capabilities

### Capability: One-Shot Autonomous Continuation

單次命令可連續完成接手檢查、實作、驗證與留痕，避免反覆人工催促。

### Capability: Governance Sync Automation (MVP)

將 runlog/handoff 作為每輪必做項，並在 UI/UX 變更時強制同步 uiux/qa。

### Capability: Deterministic Reporting Contract

所有輸出必須固定欄位，降低交接與審查成本。

## Impact

### Roadmap Impact

- 啟動 S7（V4 一次到位續作與治理自動化）規劃
- 為後續執行器穩定化與可重播驗收建立基礎

### Non-goals

- 不改寫 S1-S6 archived artifacts
- 不引入重大新 dependency
- 不實作完整平台級排程/權限/多租戶能力

## Human Decisions Required

- S7 是否允許觸發 decision-log 自動更新（目前預設人工確認後更新）
- S7 是否將 template verify 納入每輪必跑（目前作為中高風險變更必跑）
- S7 後續是否擴充為多 agent 串接編排（本次先不納入）
