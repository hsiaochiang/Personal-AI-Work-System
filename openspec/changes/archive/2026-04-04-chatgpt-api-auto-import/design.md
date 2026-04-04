## Context

V5 brief 已確認 `chatgpt-api-auto-import` 屬於 In Scope，且 Planner 已把需求收斂為「載入本工作台建立或追蹤的 OpenAI platform conversations」。目前 repo 的基線如下：

- `/extract` 已有 `ChatGPT` source panel，但只支援 transcript 貼上與 JSON / TXT 上傳。
- `web/server.js` 尚無 `/settings`、API key storage 或 OpenAI API proxy endpoint。
- repo 尚無 local conversation tracking/index 機制。
- 既有多來源匯入與來源 badge 已支援 `plain` / `chatgpt` / `gemini` / `claude` / `copilot`。

本 change 的限制：
- 純靜態 HTML + vanilla JS，無 bundler。
- Node.js `http` server，無 Express / 新 runtime dependency。
- OpenAI API key 必須只存在 server-side storage，不可出現在 client-side JS。
- 不宣稱可直接列出 ChatGPT 產品聊天歷史；若無 tracked conversation，UI 必須明確顯示需要先追蹤 conversation ID。

## Goals / Non-Goals

**Goals:**
- 提供 `/settings` API Keys UI 與 server-side key storage。
- 建立 local tracked conversation index，讓 `/extract` 的 ChatGPT 模式可列出最近 tracked OpenAI conversations。
- 讓使用者可在 `/extract` 追蹤 conversation ID、載入 session，並將內容正規化為 `ConversationDoc`。
- 在候選審核與 memory writeback 顯示 `chatgpt-api` 來源標記。

**Non-Goals:**
- 不支援 ChatGPT 產品歷史枚舉或任何未經官方 API 證實的 account scraping。
- 不做 background refresh、webhook、cron、OAuth 或跨裝置同步。
- 不建立新的 `/memory`、`/overview` 或 `/projects` 業務邏輯。

## Decisions

### Decision 1: API key 只存於 `web/api-keys.json`，client 只讀取「是否已設定」與遮罩資訊

- 決策：新增 `web/api-keys.json` 作為 local-only key store，由 server 讀寫；`GET /api/settings/openai` 只回傳 `configured`、`maskedKey`、`updatedAt` 等摘要，不回傳原始 key。
- 理由：符合官方 API key server-side 使用原則，也符合 V5 brief 的 local-only storage 要求。
- 替代方案：
  - 方案 A：把 key 存到 `localStorage`。
  - 未採用原因：會把 secret 暴露到 client-side，違反目前已確認的安全邊界。

### Decision 2: 以 local tracked conversation index 補足「最近 sessions」能力

- 決策：新增 `web/openai-conversation-index.json`，由 server 記錄每個 project 已追蹤的 `conversationId`、最近載入時間與快取摘要；`/api/chatgpt/sessions` 只列出這個 index 中的 tracked sessions。
- 理由：官方能力可 retrieve conversation / items，但沒有可靠的「列出全部 conversation history」能力可直接當 session list；本地 index 是最小且可驗證的補充層。
- 替代方案：
  - 方案 A：宣稱可直接列出 OpenAI 帳號下所有 conversations。
  - 未採用原因：超出官方已確認能力，也與 Planner 收斂後的 scope 衝突。

### Decision 3: `ChatGPT` panel 內提供「追蹤 conversation ID」與「載入 tracked session」兩段流程

- 決策：在既有 ChatGPT source panel 中保留 transcript / file import，同時加入 API import 區塊：顯示 settings 狀態、追蹤 conversation ID、刷新 tracked sessions、選擇並載入 session。
- 理由：這讓使用者仍在單一 ChatGPT 匯入模式下完成手動與 API 兩條路徑，符合 V5 brief 的操作方式。
- 替代方案：
  - 方案 A：把 conversation tracking 也移到 `/settings`。
  - 未採用原因：會讓使用者切頁兩次才可匯入；對本 change 而言 `/extract` 內完成追蹤與載入較直接。

### Decision 4: API import 內容以 `chatgpt-api` source 寫入既有 attribution pipeline

- 決策：新增 `chatgpt-api` source，供候選卡片、writeback metadata 與 `/memory` badge 顯示使用；手動 transcript / JSON 匯入仍維持 `chatgpt`。
- 理由：V5 brief 明確提到「ChatGPT API import」是新來源，應與手動 ChatGPT 匯入區分，且不必重寫既有 memory metadata 結構。
- 替代方案：
  - 方案 A：沿用 `chatgpt`。
  - 未採用原因：會讓使用者無法區分 API import 與既有手動匯入來源。

### Decision 5: OpenAI conversation items 的文字正規化沿用共享 adapter 模組

- 決策：在 `web/public/js/conversation-adapters.js` 補 `adaptOpenAIConversationItems()`，由 server 在載入 API session 後轉成 `ConversationDoc`。
- 理由：shared adapter 模組已同時服務 browser runtime 與 Node verify；把 OpenAI item parsing 放在這裡可避免 server-only parser 漂移。
- 替代方案：
  - 方案 A：只在 `web/server.js` 內就地解析。
  - 未採用原因：不利重複驗證與長期維護。

## Risks / Trade-offs

- [Risk] 若使用者尚未追蹤任何 conversation，session list 會是空的
  → Mitigation：在 ChatGPT API import panel 明確顯示 empty state 與「先追蹤 conversation ID」指引。
- [Risk] OpenAI conversation item payload 可能包含非文字 item
  → Mitigation：adapter 只抽取可見文字內容，其餘 item type 忽略；若沒有任何可見文字則回傳可解釋錯誤。
- [Risk] 新增 `chatgpt-api` source 後，既有 health / badge / writeback utility 若未同步會造成來源漏標
  → Mitigation：同步更新 source presentation / health weighting 與 targeted verify。

## Migration Plan

1. 建立 active change artifacts，通過 `openspec validate --changes chatgpt-api-auto-import --strict`。
2. 實作 API key / index storage 與 OpenAI proxy helpers。
3. 新增 `/settings` 頁面與 ChatGPT API import UI。
4. 補 `chatgpt-api` source、OpenAI item adapter 與 targeted verify。
5. 重跑既有 ChatGPT / Gemini / Claude / import UI regression，並補 handoff / manual / runlog / QA / UI / UX evidence。

## Open Questions

- 後續若工作台真的開始「建立」OpenAI conversations，是否要在建立當下自動寫入 local index，而不是只提供 manual tracking？
- `adapter-docs-update` 階段是否要把 `chatgpt` 與 `chatgpt-api` 兩種輸入模式整理成同一份 support matrix？
