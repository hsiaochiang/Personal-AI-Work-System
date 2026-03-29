# Skill: smoke-tester（冒煙測試／最小驗收）

## 任務目標
避免「agent 說完成可用了，但一按就錯」；用最小測試快速擋掉明顯回歸。

## 前置條件
- 有本次變更清單（git diff stat 或 commit 描述）
- 測試環境可用（local 或 dev 環境可啟動）
- 至少知道主要入口頁面或主要 flow 清單

## 依據
- `docs/uiux/<date>_ux-review.md`（flows）
- 本次變更範圍（git diff / commit）
- 主要入口頁面/按鈕

## 輸出（必交付）
- `docs/qa/<date>_smoke.md`，內容必含：
  - 測試環境（local/dev）
  - 測試資料/帳號（若需要）
  - Checklist（3~15 條，對應主要 flows）
  - 結果（Pass/Fail + 證據）
  - 若 Fail：連回 bug 文檔（docs/bugs）

## 工作流程
1) 根據 git diff 確認本次變更範圍（新增/修改了哪些檔案/功能）
2) 對應到主要 flows（從 `docs/uiux/` 或需求）：影響到哪些 flow？
3) 產出 checklist（3~15 條），優先覆蓋：變更的主要功能 + 相鄰功能確認無回歸
4) 逐項測試，記錄 Pass / Fail + 截圖/log 作為證據
5) 若有 Fail → 立即建立 `docs/bugs/<date>_<slug>.md` 並連結回本 smoke
6) 輸出 `docs/qa/<date>_smoke.md`（含環境/資料/checklist/結果）

## 建議 checklist 範例
- App 可啟動且首頁不報錯
- 主 CTA 按鈕可點擊且有回饋（loading/disable）
- 主要表單可送出且錯誤提示正常
- 主要列表可載入（含 empty state）

## 禁止事項
- 沒有變更清單就憑感覺測試（必須對應到本次 diff）
- 只測 happy path 不測 error/empty state（必須覆蓋主要 edge case）
- Fail 不記錄就繼續（每個 Fail 必須連結到 bug 文檔）
