# Design: phase1-entrypoint-guidance-pilot

## Context

第 1 次 pilot 已 archived，並在 QA 中留下三個直接摩擦點：
1. `spec-driven` artifacts 格式無法從一般 CLI help 直接得知，需用 `openspec instructions` 反查。
2. strict validate 若使用 `openspec validate` 易失敗，應以 `openspec change validate` 為準。
3. 初次啟動時需要掃描的入口過多，尚未明確收斂為最小閱讀順序。

第 2 次 pilot 不應再只驗證「能不能跑通」，而應驗證「在知道第 1 次摩擦後，是否能更快、更少試錯地重新啟動一次流程」。

## Goals / Non-Goals

Goals:
- 讓第 2 次 pilot 以固定入口順序啟動，減少不必要的掃描。
- 將 `openspec instructions` 與 `openspec change validate` 的正確使用方式納入可比較驗收。
- 在 QA 中留下第 1 次與第 2 次 pilot 的直接比較，而不是只留下主觀感受。

Non-Goals:
- 不重寫 handoff 模板或治理骨架。
- 不新增自動化、產品功能或 UI 調整。
- 不把多次 pilot 收斂或欄位重構一次包進本次 change。

## Decisions

1. 第 2 次 pilot 的比較基線固定來自 `docs/qa/2026-03-24_smoke.md`，不得脫離第 1 次 QA 自行改題。
2. 本次 change 以新 capability 記錄「入口順序與 CLI 指引」要求，而不是回頭修改已 archived 的第 1 次 change。
3. 驗收時強制要求比較型 QA，至少要回答：artifact 反查摩擦是否消失、validate 命令誤用是否消失、入口掃描是否收斂。
4. 若仍發現欄位說明不足，只補最小說明，不把模板重寫納入本次範圍。

## Risks / Trade-offs

- 同一位 agent 可能因為已熟悉 repo 而產生假改善，因此必須記錄實際讀取順序與命令，而不是只記錄結果。
- 若本次 QA 沒有直接對照第 1 次摩擦點，仍會退化成單純再跑一次 pilot。
- 若補強說明過多，可能又把本次 change 擴大成文件重構。

## Migration Plan

- 不涉及資料 migration。
- 第 2 次 pilot 完成後，若比較證據充分，再決定是否將有效的入口順序與 CLI 指引正式提升為常駐治理規則。

## Open Questions

- 若第 2 次 pilot 仍覺得入口分散，下一步應先縮減 handoff 欄位，還是先補入口索引文件。
- 若 `openspec instructions` 仍被認為太隱晦，是否需要在 commands 中加入更明確的範例段落。