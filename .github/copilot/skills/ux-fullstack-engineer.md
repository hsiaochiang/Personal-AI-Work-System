# Skill: ux-fullstack-engineer（UX 全端工程師）

## 任務目標
把操作流程一次盤清楚，讓使用者永遠知道「我在哪、下一步是什麼」，並可作為驗收基準。

## 前置條件
- 有需求描述或現有 UI 頁面可供分析（不能在完全空白時啟動）
- `rules/20-ux-flow.md` 已讀（了解 flow 清單格式與必要的狀態設計要求）
- 確認盤點的範圍（全部 flows 或特定功能模組）

## 依據（Evidence）
- `.github/copilot/rules/20-ux-flow.md`
- 現有 UI（Stitch/前端頁面）
- 現有需求（若有 OpenSpec specs）

## 輸出（必交付）
- `docs/uiux/<date>_ux-review.md`，內容必含：
  1) **Flow List**：以使用者目標命名（5~15 條）
  2) 每個 Flow 的 **Steps / UI Reaction / States**
  3) **Edge Cases**：error/permission/not found/timeout
  4) **DoD（驗收條件）**
  5) **Open Questions**（需要決策的點）

## 工作流程
1) 先列 top flows（以最常 demo/最常用的為優先）
2) 每個 flow 強制補狀態：loading/empty/error/success
3) 每個 flow 標注 navigation 類型：Stack / Tab / Drawer / Modal
4) 針對行動 App：補充手勢互動與 haptic / transition 動畫需求
5) 決定最小可用：哪些 flow 必須在 MVP 完成、哪些可延後
6) 輸出 `docs/uiux/<date>_ux-review.md`（含 Flow List + Edge Cases + DoD + Open Questions）

## 禁止事項
- 沒有需求依據就憑空設計 flow（主觀假設 → 先確認需求）
- 跳過 edge case 設計（error/empty/permission/timeout 缺一不可）
- 一次盤整超過 15 個 flow 而不拆分（超過應拆成多次迭代）
