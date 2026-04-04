## Context

V5 brief 已確認 `claude-adapter` 屬於 In Scope，且目前 repo 中沒有同名 active change。現有 `/extract` 已透過 `ConversationDoc` 支援 `plain`、`chatgpt`、`gemini`、`copilot` 四種來源，來源 selector、candidate source badge 與 writeback attribution 都已存在，但尚未包含 Claude。

本 change 的限制：
- 純靜態 HTML + vanilla JS，無 bundler。
- Node.js `http` server，無新增 server-side Claude API。
- 不新增 runtime dependency。
- 維持既有 `plain` / `chatgpt` / `gemini` / `copilot` flow 與 verify 腳本可回歸。

## Goals / Non-Goals

**Goals:**
- 在共享 adapter 模組中加入 `ClaudeAdapter` 與最小 Claude transcript 偵測。
- 讓 `/extract` 可明確選擇「Claude」來源，並以 `source: claude` 進入既有 extraction / review / writeback。
- 補齊 `Claude` source badge、verify fixture 與 smoke evidence。

**Non-Goals:**
- 不實作 Claude API、自動抓取、OAuth 或 settings UI。
- 不處理 ChatGPT API session list、Gemini parser 重構或 adapter 文件總整理。
- 不改寫既有 extraction category heuristics 或 writeback 檔案格式。

## Decisions

### Decision 1: 沿用共享 adapter 模組承載 Claude transcript parser

- 決策：在 `web/public/js/conversation-adapters.js` 新增 Claude 專屬 role alias、transcript parser、explicit adapter function 與最小 auto-detect。
- 理由：現有 `PlainTextAdapter`、`ChatGPTAdapter`、`GeminiAdapter` 與 Copilot parser 都共用同一模組；Claude 也應共用同一條驗證與 runtime 邊界，避免 browser / verify logic drift。
- 替代方案：
  - 方案 A：把 Claude parser 直接寫進 `extract.js`。
  - 未採用原因：會複製 adapter 邏輯，且 Node verify 不易共用。

### Decision 2: 本 change 只支援「Claude 貼上 transcript」，不支援 API 或檔案匯入

- 決策：Claude 模式只處理使用者從 Claude.ai 網頁複製下來的文字 transcript；不新增 upload 或 server endpoint。
- 理由：V5 change table 已把 Claude 定義為半自動貼上 adapter，最小可用解是處理 copied transcript，而非擴大到 API / 匯出格式研究。
- 替代方案：
  - 方案 A：一併加上 Claude JSON / HTML 匯入。
  - 未採用原因：缺乏穩定格式保證，且會擴大 scope。

### Decision 3: Claude 解析採「Human / Assistant / Claude role heading」策略

- 決策：Claude adapter 會接受常見的 `Human`、`Assistant`、`Claude`、`User`、`You` 類 transcript 標頭，且只有在形成有效的 user + assistant turns 時才視為合法 Claude transcript。
- 理由：Claude 貼上文字常以 `Human:` / `Assistant:` 或 `Claude` heading 出現；加入 Claude 專屬 assistant alias 與最小結構驗證，可降低誤判 plain text 或 Gemini transcript 的機率。
- 替代方案：
  - 方案 A：完全沿用 Gemini / ChatGPT transcript parser，只把來源改成 `claude`。
  - 未採用原因：會讓來源判定失真，也不利後續針對 Claude 格式做獨立收斂。

### Decision 4: `/extract` 採 explicit Claude source route，auto-detect 只作共享模組保底

- 決策：UI 上新增 `Claude` source option，`extract.js` 在 Claude 模式下明確呼叫 `adaptClaudeConversation()`；`adaptConversationInput()` 同時補上 Claude auto-detect，作為共享模組一致性與未來擴充保底。
- 理由：現有 import UI 已是 source-aware selector；explicit route 最可控，也符合 V5 brief 的操作方式。
- 替代方案：
  - 方案 A：只做 auto-detect，不新增 UI 選項。
  - 未採用原因：與 brief 驗收條件「`/extract` 工具來源下拉包含 Claude」不符。

## Risks / Trade-offs

- [Risk] Claude 網頁複製格式可能因語系或 UI 版本差異改變
  → Mitigation：role alias 同時支援常見英文 heading，並以 fixture 驗證最小可接受格式。
- [Risk] 若 transcript 缺少明確 heading，auto-detect 可能退回 plain
  → Mitigation：在 Claude explicit mode 下直接使用 `ClaudeAdapter`，避免依賴 auto-detect 才能成功。
- [Risk] 新增來源後，source badge 或 writeback attribution 若未同步，會造成來源漏標
  → Mitigation：一併更新 `memory-source-utils.js`、候選 badge 顯示與 verify。

## Migration Plan

1. 補 proposal / design / spec / tasks，通過 strict validate。
2. 擴充共享 adapter 模組與 `memory-source-utils.js`，加入 `claude` source。
3. 更新 `/extract` source selector、文案與 routing。
4. 新增 Claude fixture / verify 腳本，並重跑 plain / chatgpt / gemini / import UI regression。
5. 補 QA / UI / UX / handoff / roadmap / manual evidence；停在需人工確認的 commit / sync / archive 前。

## Open Questions

- Claude transcript 若出現 `Me` / `User` / `Claude` 混用標頭，是否要在後續 change 補更多 alias？
- 後續 `adapter-docs-update` 是否要把 Claude / Gemini 支援格式提示收斂成單一 schema 附錄？
