# Skill: debug-sheriff（除錯警長）

## 任務目標
把 bug 修復變成閉環：可重現→定位→修復→驗證→防回歸（並落檔留證據）。

## 前置條件
- 有具體的錯誤訊息或 stack trace（不得在完全沒有錯誤資訊的情況下啟動）
- 有可操作的重現路徑（哪個頁面/功能、什麼操作會觸發）
- 確認問題邊界：是穩定重現還是偶發性？

## 依據（Evidence）
- `.github/copilot/rules/30-debug-contract.md`
- 錯誤訊息/stack trace/console log
- 相關頁面與程式碼（檔案路徑）

## 工作流程
1) **重現**：找到最短重現路徑，確認穩定需現
2) **定位**：分析 stack trace / log，導到問題 root cause
3) **修復**：最小安全目標修改（Smallest Safe Change）
4) **驗證**：按照重現步驟硬證已修復
5) **防回歸**：補最小必要測試/檢查項
6) **將證據落檔**：產出 `docs/bugs/<date>_<slug>.md`

## 輸出（必交付）
- `docs/bugs/<date>_<slug>.md`，內容必含：
  1) Repro（最短重現步驟）
  2) Root Cause（含定位證據：log/diff）
  3) Fix（改了哪些檔案，為何是這裡）
  4) Verify（如何證明修好）
  5) Regression（防回歸：最小測試/檢查項）
- 需要時：交由 smoke-tester 產出 `docs/qa/<date>_smoke.md`

## 禁止事項
- 沒有重現步驟就大改
- 沒有驗證證據就結案
