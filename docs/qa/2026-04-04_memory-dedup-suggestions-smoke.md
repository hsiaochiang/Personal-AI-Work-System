# Memory Dedup Suggestions Smoke — 2026-04-04

> Change: `memory-dedup-suggestions`
> Type: UI change
> Scope: `/api/memory` dedup summary + `/memory` 疑似重複建議 / merge / delete action

## Verify Commands

- `openspec validate --changes memory-dedup-suggestions --strict`
- `node tools/verify_memory_dedup_suggestions.js`
- `node tools/verify_memory_health_scoring.js`
- `node tools/verify_source_attribution_in_memory.js`
- local API smoke:
  - start `web/server.js`
  - `GET /api/memory?projectId=mock-test`
  - `POST /api/memory/dedup?projectId=mock-test`

## Coverage

- `memory-dedup-suggestions` 的 proposal / design / spec / tasks 已通過 strict validate
- `/api/memory` 仍保留 `filename` / `content` / `summary`，並新增 `dedup.summary` 與 suggestion groups
- dedup heuristic 可區分同檔案 exact duplicate 與 near duplicate，且不會把不同 memory 檔案自動合併
- dedup action 支援 merge / delete，並在改寫前先建立 `.backup/`
- `/memory` 頁面靜態契約存在 dedup overview 容器、dedup utility 引用與 `/api/memory/dedup` action wiring
- 既有 memory health scoring 與 source attribution regression 維持 PASS

## Result

- `openspec validate --changes memory-dedup-suggestions --strict`：PASS
- `verify_memory_dedup_suggestions`：PASS
  - duplicate grouping within same file PASS
  - near-duplicate heuristic PASS
  - merge/delete markdown rewrite PASS
  - malformed merge payload rejection PASS
  - static contract PASS
- `verify_memory_health_scoring`：PASS
- `verify_source_attribution_in_memory`：PASS
- local API smoke：PASS
  - `GET /api/memory?projectId=mock-test` 可回傳 `dedup.summary.groupCount = 1`
  - malformed `POST /api/memory/dedup?projectId=mock-test` merge payload 會回傳 HTTP 400
  - `POST /api/memory/dedup?projectId=mock-test` merge 成功，且 `backedUp = true`
  - `temp-mock/docs/memory/.backup/preference-rules.md` 保留 action 前內容

## Notes

- 第一版 dedup 只處理同一 memory 檔案內的重複條目；跨檔案 / 跨專案 dedup 留給後續 V4 changes。
- merge 定義為「保留推薦 primary 一條並刪除其餘重複項」，不做自動文字融合。
