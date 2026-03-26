# Stitch Prompt - Phase 3 UI MVP

請為「Personal AI Work System」設計 Phase 3 UI MVP，目標只做兩頁：
1. Projects Overview
2. Project Detail

設計必須 1:1 對齊目前資料語意（不是通用 dashboard）：

## 核心語意（必須出現在畫面）
- Current: S6 已完成（archive）
- S7 狀態：GO（條件式）
- Replay v2：PASS
- 風險回歸 R2/R3/R4：PASS
- 仍需監控：untracked phase4 目錄（非阻斷）

## Overview 必備區塊
- Top Bar：Workspace 名稱、搜尋、篩選（phase/status/risk/date）
- KPI：Current Stage / S7 Gate / Active Blockers / Last Validation
- Project List 欄位：
  - Project
  - Current
  - Gate
  - Replay
  - Regression
  - Next Step
  - Last Updated
- 快速篩選：Gate（GO/NO-GO）、Risk（H/M/L）、Phase（S0-S7）

## Detail 必備區塊
- Header：Project Name + Current + Gate Badge
- Roadmap Snapshot：Current / Next / Blockers
- Validation Snapshot：
  - Replay v2
  - R2 writeback boundary
  - R3 spec structure
  - R4 governance consistency
- Blockers Table：
  - Item / Status / Impact / Exit Criteria / Owner
- Runlog Timeline（最近 5 筆）
- Decision Log（最近 5 筆）

## 狀態頁（兩頁都要）
- Loading
- Empty
- Error（資料載入失敗 / 權限不足 / 無資料）
- 每種狀態都要有繁中 CTA 文案

## 互動
- 可搜尋、篩選、排序
- 點專案進 Detail
- 所有 Badge 可 hover 顯示說明（例如為何是條件式 GO）

## Mock Data（請直接產）
- 至少 6 個專案
- 至少 1 個專案顯示：S7 conditional GO
- Blocker 至少 8 筆（含 resolved/open）
- Runlog 至少 12 筆（含 pass/fail）
- Decision 至少 8 筆（含 Why/Impact/EvidencePath）

## 輸出
1. 兩頁高保真設計
2. 可點擊原型流程
3. 元件清單（Card/Table/Badge/Timeline/Panel）
4. Mock data JSON
5. 可用性測試腳本（10-15 分鐘）
6. 工程 handoff（切版優先順序 + non-scope）
