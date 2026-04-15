# Smoke Test 2026-04-15 — memory-ai-curator

## Scope

- Change: `memory-ai-curator`
- Goal: 驗證 `/memory` 的單條刪除、KPI 問題篩選、AI curate contract 與 AI review 跳轉相關程式碼已可用
- Environment:
  - Main repo: `D:\program\Personal-AI-Work-System`
  - Ephemeral smoke copy: `%TEMP%\paws-memory-curator-smoke-20260415225631`
  - Server port: `3310`

## Commands

```powershell
openspec validate --changes "memory-ai-curator" --strict
node tools/verify_memory_ai_curator.js
node tools/verify_memory_dedup_suggestions.js
node tools/verify_memory_health_scoring.js
node --check web/server.js
node --check web/public/js/memory.js
```

## Ephemeral API Smoke

在暫存副本啟動 `node web/server.js`，避免污染主 repo 的 `docs/memory/*`。

### Case 1 — `/api/memory/item/delete`

- Input:
  - `filename = preference-rules.md`
  - `itemId = preference-rules.md::0::0`
- Result:
  - `POST /api/memory/item/delete` 回傳 `200`
  - target item 從 `/api/memory` 後續 payload 消失
  - `docs/memory/.backup/` 檔案數量增加
- Status: PASS

### Case 2 — `/api/memory/ai-curate` with configured Gemini key

- Input:
  - `filename = task-patterns.md`
- Result:
  - `POST /api/memory/ai-curate` 回傳 `200`
  - payload 含 `filename` / `original` / `improved` / `summary`
  - `improved` 不含 `curator-summary` comment，summary 已正確拆出
- Status: PASS

### Case 3 — `/api/memory/ai-curate` without Gemini key

- Setup:
  - 暫存副本的 `web/api-keys.json` 將 `gemini.apiKey` 清空
- Result:
  - HTTP `400`
  - body: `{"error":"尚未設定 Gemini API key；請先到 /settings 儲存。"}`
- Status: PASS

## Static / UI Contract Checks

- `memory.js` 已新增：
  - `cleanupFilterMode`
  - `handleMemoryItemDelete()`
  - `handleMemoryAICurate()`
  - category id 與 KPI active UI 切換
- `memory.html` 的 AI review 結果已用 anchor + `scrollIntoView()` 連到 `#category-*`
- `style.css` 已新增：
  - `.memory-item-delete`
  - `.kpi-card.kpi-active`
  - `.memory-curate-*`
- Status: PASS

## Result

- strict validate: PASS
- targeted verify: PASS
- memory regressions: PASS
- syntax checks: PASS
- ephemeral API smoke: PASS

## Notes

- 本次 smoke 以暫存副本做 endpoint 驗證，避免動到主工作樹的真實 memory 資料。
- 真實瀏覽器的視覺 walkthrough 尚未自動化，但 UI / UX 證據已另行補到 `docs/uiux/`。
