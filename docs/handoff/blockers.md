# Blockers

> 只記錄會影響接手或需要人工決策的阻塞，避免流水帳。

## Active Blockers
- 無

## Resolved Blockers
- 2026-04-15：`memory-ai-curator` Review Gate 指出 active change artifact 漂移（`proposal.md` 仍標 Draft / V4 / 舊 route、`tasks.md` 仍標 Not Started），已同步修正，change 回到可進 commit / sync 狀態
- 2026-04-15：`memory-ai-curator` 缺少 `specs/` artifact，已補齊 `openspec/changes/memory-ai-curator/specs/memory-ai-curator/spec.md`，`openspec validate --changes "memory-ai-curator" --strict` 已 PASS
- 2026-04-15：V6 治理漂移（brief 缺 `Codex 執行 Prompt 清單`、manual 版本狀態停在 V5）已同步修正
- 2026-04-04：`template verify` 缺少 `.github/prompts/openspec-execute.prompt.md` 已補建並解除
- 2026-04-04：`chatgpt-api-auto-import` Review Gate direct-load guard 缺失已修補並解除
- 2026-04-04：`chatgpt-api-auto-import` scope 誤寫為 ChatGPT 產品聊天歷史，已依官方文件收斂並解除
- 2026-04-04：`gemini-adapter` manual 文案與實作不一致，已修正並解除
- 2026-04-04：`memory-dedup-suggestions` merge group validation 缺失已修補並解除
- 2026-04-04：`memory-health-scoring` missing source/date guard 缺失已修補並解除
- 2026-04-03：`plain-text-adapter-refactor` 缺 UI review 與 validator 邊界已補齊並解除
