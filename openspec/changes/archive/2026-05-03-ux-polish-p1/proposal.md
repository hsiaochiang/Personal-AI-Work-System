# Proposal: ux-polish-p1

> **建立日期**：2026-05-03  
> **對應 UX Backlog**：P1-UX-02 + P1-UX-03 + P1-UX-04（3 個 XS 改善打包）  
> **優先級**：P1

---

## 問題陳述

UX 稽核第二批 P1 項目中，3 個 XS 工作量問題：

| ID | 問題 | 頁面 |
|----|------|------|
| P1-UX-02 | 知識提取完成後無明顯成功訊息，使用者不確定是否寫入成功 | `/extract` |
| P1-UX-03 | 頁面說明副標使用技術術語（`adapter`、`ConversationDoc`），對使用者不友善 | `/extract` |
| P1-UX-04 | 一鍵複製按鈕只在頁面底部預覽區，需滾動才能找到 | `/handoff` |

## 目標

- P1-UX-02：在 step-3 寫回結果頁頂端，顯示「X 條知識已成功寫入記憶庫」綠色 banner
- P1-UX-03：將 `/extract` 頁面副標改為使用者語言的流程描述
- P1-UX-04：在 `/handoff` 頁面標題區域加入頂端複製按鈕，不需滾動即可複製

## Non-goals

- 不修改 handoff 底部的原有複製按鈕
- 不修改 extract writeback 的資料流程
- 不加後端 API

## Acceptance Criteria

- [ ] `/extract` 頁面副標改為「選擇 AI 工具 → 載入對話 → 審核候選知識 → 一鍵寫入記憶庫」
- [ ] 全部採用的候選都寫入成功時，step-3 頂端顯示綠色 banner「X 條知識已成功寫入記憶庫」
- [ ] `/handoff` 頁面標題區域右側有「一鍵複製」按鈕，點擊效果與底部按鈕相同
- [ ] axe 掃描 extract / handoff 頁面：0 violations
