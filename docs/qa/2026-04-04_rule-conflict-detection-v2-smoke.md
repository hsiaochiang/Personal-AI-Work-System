# Rule Conflict Detection V2 Smoke — 2026-04-04

> Change: `rule-conflict-detection-v2`
> Type: UI change
> Scope: `/decisions` conflict detection heuristic 升級 + conflict overview / explanation UI

## Verify Commands

- `openspec validate --changes rule-conflict-detection-v2 --strict`
- `node tools/verify_rule_conflict_detection_v2.js`
- local smoke:
  - start `web/server.js`
  - `GET /api/rules`
  - `GET /decisions`

## Coverage

- `rule-conflict-detection-v2` 的 proposal / design / spec / tasks 已通過 strict validate
- shared `rule-conflict-utils.js` 可在 Node 與 browser 共用，支援 style conflict、planning-vs-implementation conflict 與 same-category guard
- `/api/rules` 仍保留既有 `files[].content` raw markdown contract，未新增 server endpoint
- `/decisions` 頁面存在 conflict overview 容器、rule conflict utility 引用與 per-rule explanation wiring
- rules tab 會用「可能衝突」與 explanation 呈現結果，不執行任何 writeback action

## Result

- `openspec validate --changes rule-conflict-detection-v2 --strict`：PASS
- `verify_rule_conflict_detection_v2`：PASS
  - concise vs detailed style conflict PASS
  - negation / planning-order conflict PASS
  - same-category guard PASS
  - static contract PASS
- local smoke：PASS
  - `GET /api/rules` 回傳至少 3 個 rule files，維持 raw contract
  - `GET /decisions` 可載入 `rule-conflict-overview` 與 `rule-conflict-utils.js`
- main spec strict validate：PASS
  - `openspec validate rule-conflict-detection-v2 --type spec --strict`

## Notes

- 第一版 heuristic 只覆蓋高可信 signal；沒有導入 LLM、embedding 或跨分類推論。
- 本 change 仍維持 suggestion-only 邊界；規則衝突只提示、不自動修改任何 markdown。
