## Context

目前 `/decisions` 的規則資料源來自 `docs/memory/preference-rules.md`、`docs/memory/output-patterns.md`、`docs/memory/task-patterns.md`。前端 `parseRuleFile()` 會把每個 `###` 區塊視為一條規則，再交給 `detectConflicts()` 做衝突比對。

現況限制如下：

- `detectConflicts()` 只看否定詞前綴與字串 stem，比對邏輯過窄，無法抓到沒有明確否定詞的互斥偏好。
- 現有 UI 只有 category banner 與單條 badge，沒有列出「哪兩條衝突、為什麼衝突」。
- `/api/rules` 目前只回 raw markdown；若為了本 change 新增 server-side schema，會放大改動範圍。
- 專案仍採 Node.js `http` server + vanilla JS，不能引入新的 dependency 或 build step。
- 本 change scope 已在 planner handoff 收斂為 `/decisions` conflict detection + explanation + targeted verify，不延伸到 writeback action。

## Goals / Non-Goals

**Goals:**
- 建立可被 browser 與 Node verify 共用的 rule conflict utility，集中處理正規化、衝突訊號抽取與 explanation。
- 在同一規則分類內，支援超越否定詞前綴的衝突偵測，例如「精簡」vs「詳細」、「先規劃」vs「直接落地」。
- 在 `/decisions` 的規則 tab 顯示 conflict overview、衝突配對與原因說明，讓使用者知道衝突發生在哪裡。
- 維持現有 `/api/rules` raw contract 與決策 tab 行為相容，不引入新 API。
- 提供 targeted verify，覆蓋 heuristic、same-category guard 與 UI static contract。

**Non-Goals:**
- 不發明通用自然語言推理引擎；第一版只支援 deterministic heuristic 與明確可解釋的 signal。
- 不在 UI 上加入「接受建議」「停用規則」或任何自動修正操作。
- 不處理跨分類規則的抽象衝突，例如 preference rule 與 output pattern 的高階語意矛盾。
- 不修改 `docs/memory/*` 原始規則內容，也不新增 metadata schema。

## Decisions

### Decision 1: 用 shared utility 管理 conflict detection，而不是把邏輯留在 `decisions.js`

- 決策：新增 `rule-conflict-utils.js`，採 UMD 形式同時支援瀏覽器與 Node verify。
- 理由：這和既有 `memory-health-utils.js`、`memory-dedup-utils.js` 模式一致，可避免 UI 與 verify 使用不同 heuristics。
- 替代方案：
  - 方案 A：繼續把衝突邏輯內嵌在 `decisions.js`。
  - 未採用原因：verify 難以直接重用，之後若要擴充 signal 也容易讓 UI 程式過度膨脹。

### Decision 2: 衝突偵測維持 same-category guard，不做跨分類推論

- 決策：只比對同一 `category` 的規則，像「偏好規則」只對「偏好規則」。
- 理由：不同 memory 檔案的語境與粒度不同，跨分類比對容易造成誤報；這是最小安全邊界。
- 替代方案：
  - 方案 A：把三個 rule files 全部混在一起比對。
  - 未採用原因：例如任務模式描述步驟順序，未必等於偏好規則本身，混比會降低可信度。

### Decision 3: heuristic 採「明確 polarity signal + 對應主題字詞」而非任意關鍵字互撞

- 決策：utility 先正規化規則文本，再抽取少量高可信 signal：
  - 否定 / 避免 / 禁止 類 polarity
  - 精簡 vs 詳細
  - 先規劃 vs 直接實作 / 過早落地
  - 白話直覺 vs 術語抽象
- 理由：這些訊號直接對應本 repo 既有規則內容與 V4 brief 範例，能產生可解釋結果。
- 替代方案：
  - 方案 A：任意 token overlap + 否定詞抽取。
  - 未採用原因：容易把同主題但不衝突的規則誤報，也難給出可信 explanation。

### Decision 4: UI 以「overview + per-rule explanation」呈現，不另開新的頁面或寫回流程

- 決策：保留現有 decisions / rules tab 架構，在 rules tab 上方新增 conflict overview，並在 rule card 內顯示衝突原因與對象。
- 理由：這是最小 UI 變更，使用者已熟悉現有頁面；也符合 planner 收斂的 `/decisions` 內升級。
- 替代方案：
  - 方案 A：新增獨立「規則衝突」tab 或新頁面。
  - 未採用原因：需要重構導覽與狀態管理，超出本 change 安全範圍。

### Decision 5: explanation 以 pair-level reason 為主，避免把系統表述成絕對正確

- 決策：每個 conflict pair 產出 `reason` 與 `signalLabel`，UI 文案固定使用「可能衝突」「請人工確認」。
- 理由：規則衝突屬治理提示，不是裁決；system 應解釋偵測依據，而不是替使用者做決定。
- 替代方案：
  - 方案 A：直接標示「矛盾」並建議刪除其中一條。
  - 未採用原因：會把 scope 擴大成 writeback/governance action，也容易過度武斷。

## Risks / Trade-offs

- [Risk] heuristic 太窄，抓不到所有人類會覺得衝突的組合
  → Mitigation：明確把第一版定位成高可信 signal baseline，優先降低誤報，後續再疊加詞組。
- [Risk] heuristic 太鬆，讓同主題但其實互補的規則被標成衝突
  → Mitigation：保留 same-category guard，且每個 signal 需同時滿足 polarity / counterpart 兩側條件才成立。
- [Risk] 現有規則檔多為短句，若直接從整段 body 比對可能受說明文字干擾
  → Mitigation：優先抽取 `- 規則：`、`- 語氣偏好：`、`- 執行步驟：` 等結構化行，再回退到 title/body 合併文本。
- [Risk] 現有實際資料未必有衝突，UI 容易只靠 synthetic case 驗證
  → Mitigation：verify 明確覆蓋 synthetic conflict fixture；UI 仍需確認無衝突時的 empty state 不回歸。

## Migration Plan

1. 建立 change artifacts，固定偵測邊界、heuristic signal 與 UI 呈現範圍。
2. 新增 shared rule conflict utility，集中處理 rule statement normalization、signal extraction、pair detection 與 explanation。
3. 更新 `decisions.js`，將 parse 後的 rules 交由 utility enrich，並新增 conflict overview / reason rendering。
4. 更新 `decisions.html`、`style.css`，為 rules tab 提供 conflict overview 區塊與 explanation 樣式。
5. 新增 targeted verify，覆蓋 signal detection、same-category guard、UI contract；再補 smoke / UI / UX evidence。
6. 同步 brief / handoff / system-manual / runlog，回寫本 change 的 executor 與 verify 狀態。

## Open Questions

- 若後續要支援跨分類衝突，應先做 suggestion-only cross-reference，還是維持 per-category 視角？本 change 先不決定。
- 若未來規則內容變得更長，是否需要把 signal dictionary 抽成設定檔？本 change 先留在 utility 內。
