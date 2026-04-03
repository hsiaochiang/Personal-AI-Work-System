# Source Attribution In Memory Smoke — 2026-04-03

> Change: `source-attribution-in-memory`
> Type: UI change
> Scope: memory writeback source metadata + `/memory` source badge + regression verify

## Verify Commands

- `node tools/verify_source_attribution_in_memory.js`
- `node tools/verify_plain_text_adapter.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_local_import_vscode_copilot.js`
- `node tools/verify_flow.js`（以臨時啟動的 `node web/server.js` 搭配）
- `openspec validate --changes "source-attribution-in-memory" --strict`

## Coverage

- memory writeback helper 會把候選內容寫成 `- ... <!-- source: <tool> -->`
- memory markdown parser 可將 list item 還原為 `content + source`
- `/memory` 與 `/extract` 皆已載入共享 `memory-source-utils.js`
- legacy 無 metadata 條目仍可被 parser 保留
- 既有 `plain` / `chatgpt` / `copilot` import 驗證仍為 PASS
- 既有 multi-project writeback / backup / isolation flow 仍為 PASS

## Result

- `verify_source_attribution_in_memory`：PASS
  - attributed list item build / parse PASS
  - custom source label mapping PASS
  - `/extract`、`/memory` script wiring PASS
- `verify_plain_text_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS
- `verify_chatgpt_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS
- `verify_local_import_vscode_copilot`：PASS
  - adapter contract PASS
  - local import smoke PASS
- `verify_flow`：PASS
  - roadmap/project switching PASS
  - memory writeback + backup + project isolation PASS
- `openspec validate --changes "source-attribution-in-memory" --strict`：PASS

## Notes

- `verify_flow.js` 依賴 `localhost:3000`，本次以臨時啟動本機 server 的方式執行，再於驗證後關閉。
- 來源 metadata 採 inline HTML comment，避免改寫既有 `docs/memory/*.md` 結構；legacy 條目不補 badge，維持靜默相容。
