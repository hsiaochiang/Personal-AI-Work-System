## Context

目前 `/extract` 同時暴露三種不同入口：

- Copilot 本機 session list 與 path override
- ChatGPT JSON / TXT 上傳
- 通用 textarea（同時承接 ChatGPT transcript 與 plain text）

前幾個 V3 changes 已經把底層能力建好，但 UI 仍是疊加式演進，不是以「先選來源，再顯示相對應操作」為主軸。這造成兩個問題：

1. 使用者要自己推理哪個控制屬於哪個來源，實際匯入成本仍偏高。
2. 候選審核階段看不到來源標記，直到 `/memory` 才能確認 provenance。

約束條件：
- 仍使用 Node.js `http` server + vanilla JS。
- 不新增 dependency，不重構成前端框架。
- 既有 Copilot / ChatGPT / plain text adapter 與 API contract 必須維持相容。
- template verify 缺少 `.github/prompts/openspec-execute.prompt.md` 是已知 blocker，但不直接阻塞本 change 的前端實作。

## Goals / Non-Goals

**Goals:**
- 在 `/extract` 建立明確的工具來源 selector，將 Copilot / ChatGPT / plain text 匯入流程收斂到單一心智模型。
- 依所選來源顯示對應控制與說明，減少無關入口同時出現。
- 讓 extraction 明確走 source-specific routing，而不是只依靠 auto-detect。
- 在候選審核卡片與摘要中顯示來源 badge，對齊 V3 的 provenance 能見度。
- 保留既有 extraction / review / writeback 主流程與 source metadata 寫回。

**Non-Goals:**
- 不新增新的來源 adapter 或雲端匯入模式。
- 不修改 server API 路徑或 Copilot / ChatGPT parser 的核心資料契約，除非 verify 暴露小缺口。
- 不建立新的設定頁、localStorage schema 或跨頁持久化偏好。
- 不把本 change 擴大成 V3 收尾、sync / archive 之外的 release 工作。

## Decisions

### Decision 1: 用單一 selector 收斂來源模式，而不是保留多塊並列入口

- 決策：在 `/extract` 的第一步新增工具來源 selector，使用者先選 `VS Code Copilot`、`ChatGPT` 或 `純文字`，頁面再顯示相對應的匯入控制。
- 理由：這是 V3 brief In Scope D 的直接對應，也能降低現有疊加式 UI 的判讀成本。
- 替代方案：
  - 方案 A：維持目前所有入口並列，只補說明文字。
  - 未採用原因：功能仍可用，但沒有真正解決「不知道該用哪個入口」的問題。

### Decision 2: 來源 selector 只切換 UI 與 routing，不重寫既有 adapter / API

- 決策：Copilot 仍沿用既有 session list / load API 與 `selectedConversationDoc`；ChatGPT 仍使用既有檔案上傳與 transcript / JSON adapter；plain text 則直接走 `adaptPlainTextConversation()`。
- 理由：底層能力已經存在，本 change 應聚焦在匯入入口收斂與 source-aware routing，而不是再展開 parser 風險。
- 替代方案：
  - 方案 A：為 selector 新增一層統一 server endpoint，所有來源都重新經過 server route。
  - 未採用原因：會引入不必要的 cross-layer 修改，違反最小安全修改。

### Decision 3: 選定來源後，textarea 仍保留作為內容預覽與可編輯輸入區

- 決策：Copilot / ChatGPT 載入後仍把可見文字填進 textarea；使用者切換來源或手動編輯時，前端依模式重置不相容的載入狀態。
- 理由：保留現有可見預覽能讓使用者理解匯入內容，也能避免為每個來源再做一套 preview UI。
- 替代方案：
  - 方案 A：各來源都用獨立 preview component，textarea 只給 plain text。
  - 未採用原因：UI 與狀態量會明顯膨脹，超出本 change scope。

### Decision 4: 候選來源標記直接重用 candidate.source，不引入額外 mapping

- 決策：候選卡片以 `candidate.source` 渲染 badge 與文字標籤，summary 另外顯示本輪來源分布。
- 理由：V3 Change 5 已讓候選與 writeback 具備 source metadata，這裡應直接消費既有欄位，避免重複狀態。
- 替代方案：
  - 方案 A：由頁面來源 selector 單獨推論所有候選來源，不看 candidate 資料。
  - 未採用原因：若未來一輪匯入支援更多來源或 fallback，UI 可能和實際 candidate data 脫鉤。

### Decision 5: 驗證採新增 targeted verify + 既有 regression verify 組合

- 決策：新增一支聚焦 Import UI selector / candidate source badge 的 verify 腳本，並保留既有 `verify_plain_text_adapter.js`、`verify_chatgpt_adapter.js`、`verify_local_import_vscode_copilot.js` 作 regression。
- 理由：本 change 的風險在前端狀態切換與 source-aware routing，而不是底層 schema；專屬 verify 比重新把所有驗證塞進單一腳本更容易定位問題。
- 替代方案：
  - 方案 A：只更新既有 verify 腳本，不新增專屬驗證。
  - 未採用原因：會把不同 changes 的責任邊界混在一起，回歸時不易看出是 Import UI 問題。

## Risks / Trade-offs

- [Risk] selector 切換時殘留前一個來源的狀態，導致 extraction 用錯資料
  → Mitigation：切換來源時集中清理 `selectedImportFile` / `selectedConversationDoc` / `selectedCopilotSession` 與對應 status。
- [Risk] 使用者在 ChatGPT 模式貼入 plain text，或在 plain 模式貼入 ChatGPT transcript，結果與預期不符
  → Mitigation：source-specific routing 採明確模式，並在 UI hint 與錯誤訊息說明目前使用的解析方式。
- [Risk] 來源 badge 顯示與寫回 metadata 不一致
  → Mitigation：review UI 直接讀取 candidate.source；verify 同時檢查 candidate badge 與既有 source metadata path 未回歸。
- [Risk] Copilot / ChatGPT 控制被條件顯示後，既有 smoke selector 找不到元素
  → Mitigation：更新 targeted verify 與 UI smoke，使其檢查 selector 切換後的可見內容，而非假設所有控制永久顯示。

## Migration Plan

1. 補齊 OpenSpec proposal / design / spec / tasks，並把 V3 brief / handoff 切到 Executor 進行中狀態。
2. 重構 `/extract` HTML / CSS，加入工具來源 selector 與 per-source panel。
3. 重構 `extract.js` 的輸入狀態管理與 extraction routing，讓 selected source 明確決定 adapter / 已載入 doc。
4. 在候選卡片與 summary 顯示來源 badge / 分布資訊。
5. 新增 targeted verify、補 QA / UI / UX 證據，再重跑既有 regressions。
6. 完成 verify 後同步 handoff / manual / brief，交給後續 review gate。

## Open Questions

- V3 收尾時，是否要把 `/extract` 頁面說明文案同步縮短，避免 selector 上線後仍保留過多歷史敘述？
- 若未來新增 Gemini / Claude adapter，selector 會維持下拉選單還是轉成 segmented control？本 change 先不決定。
