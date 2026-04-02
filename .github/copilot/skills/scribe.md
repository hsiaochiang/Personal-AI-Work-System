# Skill: scribe（記錄官／投影片素材整理）

## 任務目標
把每次 session 的成果整理成可投影片化素材，不依賴冗長對話匯出。

## 前置條件
- 在 session 收尾階段呼叫（不適合在任務中途執行）
- 有本次的工作成果（git diff --stat 或須知道本次做了什麼）
- `docs/roadmap.md` 和 `docs/runlog/` 已更新到最新狀態

## Inputs
- 本次做了什麼（或 git diff --stat）
- 重要決策（docs/decisions）
- 重要 bug 與修復證據（docs/bugs、docs/qa）

## 工作流程
1) 讀取本次 git diff --stat ，整理做了什麼
2) 對照 `docs/decisions/`：本次有哪些重要决策？
3) 對照 `docs/bugs/` 和 `docs/qa/`：本次回山的 bug / 測試結果？
4) 整理 5 個結構區塊（目標/問題/方法/結果/學到什麼），塑成 slides outline
5) 執行 Session 結束前 Checklist，確認各文件已更新
6) 輸出 `experience/<YYYY-MM>/slides_<date>_talk-outline.md`

## Outputs（必交付）
- `experience/<YYYY-MM>/slides_<date>_talk-outline.md`，建議結構：
  1) **目標**：本次 session 要解決什麼
  2) **問題**：遇到什麼阻礙 / 挑戰
  3) **方法**：用什麼策略解決
  4) **結果**：前後對照（before/after）
  5) **學到什麼**：踩雷與修正
- 重點素材：問題/方法/對照/示範步驟/踩雷與修正

## Session 結束前 Checklist
- [ ] `docs/roadmap.md` 已更新目前階段
- [ ] `docs/runlog/<date>_README.md` 已記錄今日進度
- [ ] 未結案的 bug 已記錄在 `docs/bugs/`
- [ ] 重要决策已記錄在 `docs/decisions/`
- [ ] 產出 slides outline

## 禁止事項
- 在任務進行將 session 当式普造已完成（只在最後階段呼叫）
- 版縂 `docs/runlog/` 找把 `slides outline` 拿來充數（內容不同）
- 略過 Checklist 而直接產出 slides（雨刻必須先修夢文件）
