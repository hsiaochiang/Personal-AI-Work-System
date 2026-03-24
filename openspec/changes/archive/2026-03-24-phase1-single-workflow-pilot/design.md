# Design: phase1-single-workflow-pilot

## Context

本 repo 已有 `AGENTS.md`、handoff、roadmap、project context、commands 與 OpenSpec 目錄，但缺少一個已經跑過的 active change 範例。這導致後續 agent 雖有入口，仍需要口頭補充才能知道最小可行 workflow 是什麼。

## Goals / Non-Goals

Goals:
- 建立第一個 active OpenSpec change，補齊可 strict validate 的最小 artifacts。
- 實際走過一次手動 workflow，確認治理入口是否足夠。
- 把本次 pilot 的摩擦點、未使用欄位與最小修正建議沉澱成可追溯證據。

Non-Goals:
- 不加入任何半自動化或新產品能力。
- 不重寫模板骨架或大幅改動治理制度。
- 不把 Phase 1 的多次重跑一起包進本次 change。

## Decisions

1. 先使用 `openspec new change` 生成骨架，再用 `openspec instructions` 反查 schema 要求，避免在沒有範例時靠猜測建立 artifacts。
2. 將本次 pilot 的規範聚焦在一次手動 workflow、證據鏈、handoff 可續接性與摩擦記錄，不把自動化或 UI 能力納入變更。
3. 將摩擦紀錄集中在 QA 與專案記憶，讓下一位 agent 在開始第 2 次 pilot 前可以直接比對。

## Risks / Trade-offs

- 單次 pilot 只能證明目前流程可跑通一次，無法代表穩定性已收斂。
- 將證據分散在 OpenSpec、handoff、runlog、QA、memory，雖然保留各自責任，但需要明確指出入口，否則仍可能增加閱讀成本。
- 不處理 commit / push / archive，代表 change 生命週期暫停在可驗證但未收尾的狀態。

## Migration Plan

- 不涉及資料或結構 migration。
- 下一次 manual pilot 直接沿用本次建立的 OpenSpec change 與 QA 記錄作為基線。

## Open Questions

- 第 2 次 pilot 是否應先驗證欄位縮減，還是先驗證交接速度改善。
- 本次通過後，是否需要把 QA 內的部分欄位上升為固定模板欄位。