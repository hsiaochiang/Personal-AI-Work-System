# Design: adapter-docs-update

## Context

目前 repo 的能力與文件有落差：

- `/extract` 已支援 `plain`、`chatgpt`、`gemini`、`claude`、`copilot` 五種來源，但支援格式提示是散落在各 panel 的自由文案，不夠一致。
- `docs/workflows/conversation-schema.md` 仍是 V3 版本，只定義 `plain` / `chatgpt` / `copilot` 與 `custom:<tool>`，沒有回寫 V5 已上線的 `gemini`、`claude`、`chatgpt-api`。
- ChatGPT 面板同時支援 transcript、JSON / TXT upload 與 tracked OpenAI platform conversation API load，但使用者不容易一眼看懂三種入口的適用條件。

這個 change 的邊界很明確：只做文件與 UI copy 補齊，不改既有 adapter / API 行為。變更必須維持 smallest safe change，讓後續 Review Gate 專注檢查文案與實作是否一致。

## Goals / Non-Goals

**Goals:**
- 在 `docs/workflows/conversation-schema.md` 補一份 V5 支援來源矩陣，說清楚來源命名、支援格式、限制與匯入入口。
- 在 `/extract` 的每個 source panel 顯示一致格式的「支援格式」提示文案。
- 讓 ChatGPT panel 清楚區分手動 transcript / 檔案匯入與 `chatgpt-api` tracked session 載入。
- 保持現有匯入路徑、按鈕、欄位與 adapter routing 不變。

**Non-Goals:**
- 不新增任何新按鈕、API、欄位或資料結構。
- 不修改 `ConversationDoc` schema 本體，也不重新命名既有 source。
- 不把 `chatgpt` 與 `chatgpt-api` 合併成單一來源。

## Decisions

### Decision 1: `conversation-schema.md` 補「來源支援矩陣」，不重寫既有 schema 定義

- 決策：保留既有型別與 MUST 規則，新增 V5 支援來源附錄，集中說明 `plain` / `chatgpt` / `chatgpt-api` / `gemini` / `claude` / `copilot` 的格式與限制。
- 理由：這次要補的是 adapter 文件層，不是重新定義 schema 契約；以附錄方式補齊最小且風險低。
- 替代方案：
  - 方案 A：全面改寫整份 schema 文件。
  - 未採用原因：會擴大變更面，增加與 V3 / main spec 漂移的風險。

### Decision 2: `/extract` 使用統一前綴「支援格式：...」

- 決策：每個來源 panel 都加入一致格式的提示句，直接回答可貼什麼、可上傳什麼、目前不支援什麼。
- 理由：這是 V5 brief 明確要求的 user-facing copy 層，且可在不改互動結構的前提下降低試錯。
- 替代方案：
  - 方案 A：只更新 selector 上方總說明。
  - 未採用原因：使用者切到個別 panel 時仍看不到足夠細節。

### Decision 3: ChatGPT docs/UI copy 明確區分 `chatgpt` 與 `chatgpt-api`

- 決策：文件與 UI 都保留兩個來源概念：`chatgpt` 代表 transcript / JSON / TXT 手動匯入，`chatgpt-api` 代表 tracked OpenAI platform conversation 載入。
- 理由：兩者目前使用不同入口與限制，混成單一文案會讓使用者誤以為 API 可以直接列出 ChatGPT 產品聊天歷史。
- 替代方案：
  - 方案 A：對外都只寫 ChatGPT，不提 `chatgpt-api`。
  - 未採用原因：會掩蓋 V5 Change 3 的安全邊界與來源 attribution 差異。

### Decision 4: 本 change 視為 UI change，但驗證聚焦文案一致性

- 決策：因為修改了 `/extract` 可見文案，仍補 `ui-review`、`ux-review` 與 smoke；但證據聚焦在提示文案與使用邊界是否對齊已上線能力。
- 理由：符合 repo 的 gate matrix，同時避免把文案更新誤當成 docs-only 而跳過 UI/UX evidence。

## Risks / Trade-offs

- [Risk] 文件說明若比實作多一點，會再次產生 manual drift
  → Mitigation：所有支援格式描述只引用目前已存在的 panel / route / adapter，避免宣稱未上線能力。
- [Risk] ChatGPT 支援格式文案太長，會讓 panel 雜訊過高
  → Mitigation：維持單一「支援格式」句式，只保留使用決策必要資訊。
- [Risk] 補 `chatgpt-api` 後，`conversation-schema.md` 與 source attribution 命名若不一致會造成誤解
  → Mitigation：文件直接沿用 runtime source name `chatgpt-api`，不另創別名。

## Migration Plan

1. 建立 active change artifacts，讓 `openspec validate --changes adapter-docs-update --strict` 可通過。
2. 更新 `docs/workflows/conversation-schema.md` 的來源命名與支援格式說明。
3. 更新 `/extract` source selector hint、各 panel 說明與 `extract.js` source config hint，使文案一致。
4. 補 smoke / UI / UX evidence，並同步 handoff / roadmap / manual / runlog。
5. 交給 Review Gate 檢查文案與實作邊界是否一致。

## Open Questions

- V5 收尾時，是否要再把這份 support matrix 摘要同步到 `docs/system-manual.md` 的 `/extract` 段落，作為長期操作手冊的一部分？
- 後續若加入 Antigravity 或其他來源，是否應把 support matrix 從 `conversation-schema.md` 拆成獨立 workflow doc？
