# [INBOX] Gemini adapter 貼入片段內容時拋錯

日期：2026-04-10  
來源：user-feedback  
類型：bug  
狀態：已納入版本（2026-04-10 當日修復）

---

## 問題或動機

使用者在 Gemini 介面反白複製一段 AI 回應後，貼入 `/extract` 的 Gemini 來源欄位，系統彈出錯誤：

> `無法辨識為 Gemini transcript`

錯誤原因：`adaptGeminiConversation` 嚴格要求輸入中**同時包含使用者和 Gemini 的角色標頭**，但從 Gemini 網頁直接反白複製的是純回應段落，沒有 `You:` / `Gemini:` 標頭。

## 期望體驗

- 貼入純回應段落（無角色標頭），系統應能接受並處理，來源標記保留為 `gemini`
- 僅在輸入完全無法解析時才顯示錯誤

## 建議方向

`adaptGeminiConversation` 加 try/catch fallback：先嘗試 transcript 解析，失敗則退回純文字處理，source 仍記為 `gemini`。

## 優先序評估

- 影響範圍：high（所有 Gemini 使用者遇到第一步就卡關）
- 實作複雜度：low（5 行代碼）
- 阻塞現有流程：yes
