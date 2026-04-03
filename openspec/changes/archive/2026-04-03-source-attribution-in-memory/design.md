## Context

目前 `/extract` 已可從 `plain`、`chatgpt`、`copilot` 三種來源取得 `ConversationDoc`，且在 candidate 階段已把 `source` 保存在每筆候選物件上。但 `runWriteback()` 寫回 `docs/memory/*.md` 時，只把條目第一行 append 成一般 markdown list item，來源資訊在這一步被丟失。

另一方面，`/memory` 頁面目前直接讀 `/api/memory` 回傳的原始 markdown，再以 `parseMemoryFile()` 把 `##` / `###` 與 `- ` 列表項目轉成卡片。這條路徑很輕，但也代表若要顯示來源 badge，必須在不重寫 memory 文件格式的前提下，讓 parser 從現有 markdown 中提取額外 metadata。

約束條件：
- 仍使用純靜態 HTML + vanilla JS 與 Node.js `http` server。
- 不新增新的 writeback 目標，不改 memory file whitelist。
- 不把 `import-ui-multi-source` 提前納入，不新增 `/extract` 工具 selector。
- 既有 `docs/memory/*.md` 歷史內容不可要求一次性 migration。

## Goals / Non-Goals

**Goals:**
- 在 writeback 階段保留每筆 memory 條目的來源工具資訊。
- 讓 `/memory` 解析來源 metadata 並在 card 上顯示 badge。
- 維持舊有 memory markdown 可讀性與 legacy 條目的向後相容。
- 以 targeted verify 覆蓋 metadata 寫入與 badge 解析，並確認既有 adapter 路徑未回歸。

**Non-Goals:**
- 不修改 `ConversationDoc` schema、adapter 偵測邏輯或 `/extract` import UI。
- 不回填歷史 memory 條目來源，也不重寫整批 memory 文件格式。
- 不新增 server-side markdown parser、前端 framework 或其他 dependency。
- 不在 candidate review、decisions、search 頁面同步顯示來源 badge。

## Decisions

### Decision 1: 來源 metadata 使用 inline HTML comment，直接附在 list item 後

- 決策：寫回 memory 條目時，使用 `- 內容 <!-- source: chatgpt -->` 這種 inline HTML comment 格式保存來源。
- 理由：這是最小修改，既不需要新增 YAML frontmatter，也不需要把單行條目改成多行區塊。HTML comment 在 markdown 中隱藏，不影響既有閱讀體驗。
- 替代方案：
  - 方案 A：在每個 section 前放 `source:` 區段層級 metadata。
  - 未採用原因：同一批寫回可能含多筆條目，未來也可能混合來源，區段層級 metadata 不夠精細。
  - 方案 B：把每條記憶改成 `- 內容\n  - 來源：chatgpt`。
  - 未採用原因：會直接改變既有 markdown 視覺結構，也更容易污染 legacy parser。

### Decision 2: `/memory` 繼續在前端解析 markdown，不把 badge 解析搬到 server

- 決策：維持 `/api/memory` 回傳原始 markdown，`memory.js` 只擴充 parser，讓 list item 可拆出 `content` 與 `source`。
- 理由：server 目前負責檔案讀寫與 whitelist 邊界，若為了 badge 額外引入 server-side parsing，會增加資料契約變動與測試面。前端 parser 已是目前 memory 頁的真實轉譯層，擴充成本最低。
- 替代方案：
  - 方案 A：新增 `/api/memory/parsed` 回傳結構化 memory items。
  - 未採用原因：這會把單純 UI 顯示需求升級為 API 契約變更，超出本 change 的最小邊界。

### Decision 3: Legacy 條目沒有來源時不補 badge，維持靜默相容

- 決策：沒有 `source` metadata 的既有條目照常顯示文字，不強制顯示 `legacy` 或 `unknown` badge。
- 理由：歷史資料沒有可靠來源，硬補 badge 只會製造假精度；靜默相容能避免讓使用者誤以為舊條目已被完整追溯。
- 替代方案：
  - 方案 A：所有無 metadata 條目顯示 `legacy` badge。
  - 未採用原因：這雖然一致，但會增加頁面噪音，也不是 V3 brief 的必要需求。

### Decision 4: 驗證拆成專屬 source attribution verify，加上既有 adapter regression

- 決策：新增專屬 verify 腳本，直接測試 writeback helper 產生的 metadata 與 memory parser 的 badge 資料，同時保留既有 `verify_plain_text_adapter.js`、`verify_chatgpt_adapter.js`、`verify_local_import_vscode_copilot.js` 作回歸檢查。
- 理由：這個 change 的核心風險在 markdown 格式與 parser，而不是 import adapter 本身；將驗證聚焦在 metadata round-trip 能更快定位問題。
- 替代方案：
  - 方案 A：只更新 `tools/verify_flow.js` 做端對端。
  - 未採用原因：現有 flow verify 比較大顆，對單一 metadata 失敗的定位較差，且更難直接驗證 `/memory` parser 行為。

## Risks / Trade-offs

- [Risk] inline HTML comment 若格式不一致，parser 可能漏抓來源
  → Mitigation：把 comment 格式固定為 `<!-- source: ... -->`，並在 verify 覆蓋多種來源值。
- [Risk] memory 檔案存在手寫 comment 或非標準 list item，可能讓 parser 過度貪婪
  → Mitigation：只解析 list item 尾端符合 `source` pattern 的 comment，其他 comment 保持原樣忽略。
- [Risk] `/memory` badge 顏色若與既有 source badge 共用樣式不足，可能影響可讀性
  → Mitigation：延用既有 `.source-badge` 基礎樣式，只補 memory-specific 配色 class，避免大改版面。
- [Risk] writeback 目前只保存候選首行，來源 metadata 雖保留但細節內容仍被截短
  → Mitigation：本 change 不擴大處理 writeback 摘要策略，只在現有條目格式上附加來源，避免 scope 外重構。

## Migration Plan

1. 建立 proposal / spec / design / tasks artifacts，固定 scope。
2. 在 `extract.js` 寫回流程加入來源 metadata append helper。
3. 在 `memory.js` 擴充 markdown parser 與 render，支援來源 badge。
4. 在 `style.css` 補 badge 配色，保持現有 card 版型。
5. 新增 verify 腳本與 QA / UI / UX 證據。
6. 更新 brief / handoff / manual / runlog，標記本 change 進入 executor 並回寫驗證結果。

## Open Questions

- `import-ui-multi-source` 開始後，是否要把同一組 badge 樣式延伸到 candidate review 或 import UI？本 change 不先處理。
- 未來若要支援多來源交叉驗證，同一條 memory 是否需要保存多個 `source` 值？本 change 先維持單一條目單一來源。
