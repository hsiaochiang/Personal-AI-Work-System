# Proposal: onboarding-guide

> **建立日期**：2026-05-03  
> **對應 UX Backlog**：P1-UX-01  
> **優先級**：P1

---

## 問題陳述

UX 稽核 Cognitive Walkthrough T1（Onboarding）評定為**完全失敗**：
- 首頁是監控儀表板（KPI + 治理待辦 + Phase 表），對新使用者沒有任何引導
- 使用者需要自行摸索每個頁面的功能，無法在 5 分鐘內理解系統能做什麼
- Nielsen 評分 H6（辨識非回憶）違規：功能隱藏在術語化導覽列中

## 目標

- 在首頁頂端加入一張可關閉的「快速上手引導卡」
- 列出 5 個核心功能（Extract / Memory / Handoff / Decisions / Search）每個一行說明 + 連結
- 使用者點「不再顯示」後，下次造訪不重複出現（localStorage 持久化）

## Non-goals

- 不做全頁 onboarding wizard
- 不修改現有的 KPI、治理待辦、Phase 表結構
- 不加後端 API

## Acceptance Criteria

- [ ] 首頁頂端顯示 onboarding-card，包含 5 個功能圖磚（icon + 名稱 + 一行說明 + 連結）
- [ ] 右上角有「✕」關閉按鈕，點擊後卡片消失，localStorage 設定 `pais_onboarding_dismissed = true`
- [ ] 下次造訪（localStorage 已設定）不顯示卡片
- [ ] axe 掃描 index 頁面：0 violations
- [ ] 現有 KPI / 治理待辦 / Phase 表不受影響
