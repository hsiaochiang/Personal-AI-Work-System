# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V3 post-archive handoff — local-import-vscode-copilot complete
- Owner agent: Codex
- Last updated on: 2026-04-03

## Goal
- 確認 `local-import-vscode-copilot` 已完成 sync / archive / git 收尾
- 保留下一位 agent 接手 `source-attribution-in-memory` 所需的最小脈絡
- 維持 `/extract` 的 Copilot / ChatGPT / plain text 三條入口一致

## Scope
- In scope:
  - 本機 Copilot session JSONL 掃描與單一 session 載入
  - `ConversationDoc` 正規化（`source: copilot`）
  - `/extract` 最小 Copilot import UI、路徑覆寫與狀態提示
  - local import 驗證與治理文件同步
- Out of scope:
  - `source-attribution-in-memory`
  - `import-ui-multi-source`
  - memory badge / writeback metadata
  - 多 session merge / 搜尋 / preview-rich picker
  - 新依賴 / 前端框架 / build tool

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` 模組 server（無 Express）
- 禁止引入任何前端框架或打包工具
- 新增依賴需先記錄決策
- `AGENTS.md` 規定：archive / release 類不可逆操作需人工確認

## Done
- Phase 1–5：V1 全數完成 ✅
- V2 Changes 1–4 全部完成並 archive ✅
- V3 brief 使用者確認 ✅（2026-04-02）
- V3 Change 1 `conversation-schema-definition` 已 archive ✅
- V3 Change 2 `plain-text-adapter-refactor` 已 archive ✅
- V3 Change 3 `chatgpt-adapter` 已 sync / archive / git 收尾 ✅
- **V3 Change 4 `#opsx-new` 完成** ✅（`openspec/changes/local-import-vscode-copilot/` 已建立）
- **V3 Change 4 `#opsx-ff` 完成** ✅（`proposal / design / spec / tasks` 全部建立）
- **V3 Change 4 strict validate** ✅ PASS（`openspec validate local-import-vscode-copilot --type change --strict`）
- 已確認本機存在 Copilot session JSONL 路徑 ✅
  - `%AppData%\\Code - Insiders\\User\\globalStorage\\emptyWindowChatSessions\\*.jsonl`
  - 至少 1 筆 session 含 request / response 可作為 parser 依據
- **V3 Change 4 `#opsx-apply` 完成** ✅（tasks 9/9 勾選完成）
- `/extract` 已支援：
  - 刷新本機 Copilot session 清單
  - 載入單一 VS Code Copilot JSONL session → `ConversationDoc`
  - 覆寫 Copilot session 路徑
  - ChatGPT / plain text 路徑維持可用
- `tools/fixtures/copilot-sessions/sample-session.jsonl` 已建立 ✅
- `docs/qa/2026-04-03_local-import-vscode-copilot-smoke.md` 已建立 ✅
- `docs/uiux/2026-04-03_ui-review.md` 已補 local-import addendum ✅
- `docs/uiux/2026-04-03_ux-review.md` 已補 local-import addendum ✅
- **V3 Change 4 `#opsx-verify` 完成** ✅
  - `node tools/verify_local_import_vscode_copilot.js`
  - `node tools/verify_chatgpt_adapter.js`
  - `node tools/verify_plain_text_adapter.js`
- **V3 Change 4 `#opsx-sync` 完成** ✅（`openspec/specs/local-import-vscode-copilot/spec.md`）
- **V3 Change 4 git commit / push 完成** ✅（`bc3c0bd add copilot local import` → `origin/main`）
- **V3 Change 4 `#opsx-archive` 完成** ✅（封存至 `openspec/changes/archive/2026-04-03-local-import-vscode-copilot/`）

## In Progress
- 準備切換至 `source-attribution-in-memory`
- 無 active blocker

## Next Step

| 優先 | Change | 說明 |
|:----:|--------|------|
| 🔴 1 | `source-attribution-in-memory` | 開新 session 做 planner / executor，補 memory source metadata 與 badge |
| 🟡 2 | `import-ui-multi-source` | 後續收斂 `/extract` 成工具 selector 與 richer import UI |
| 🟡 3 | V3 收尾 | 視 Change 5、6 完成度，再更新 brief / roadmap 的版本狀態 |

## Files Touched（本 session）
- openspec/changes/archive/2026-04-03-local-import-vscode-copilot/proposal.md
- openspec/changes/archive/2026-04-03-local-import-vscode-copilot/design.md
- openspec/changes/archive/2026-04-03-local-import-vscode-copilot/specs/local-import-vscode-copilot/spec.md
- openspec/changes/archive/2026-04-03-local-import-vscode-copilot/tasks.md
- openspec/specs/local-import-vscode-copilot/spec.md
- docs/planning/v3-brief.md
- docs/roadmap.md
- docs/handoff/current-task.md
- docs/system-manual.md
- docs/runlog/2026-04-03_README.md
- docs/qa/2026-04-03_local-import-vscode-copilot-smoke.md
- docs/uiux/2026-04-03_ui-review.md
- docs/uiux/2026-04-03_ux-review.md
- web/public/js/conversation-adapters.js
- web/public/js/extract.js
- web/public/extract.html
- web/public/css/style.css
- web/public/js/app.js
- web/server.js
- tools/fixtures/copilot-sessions/sample-session.jsonl
- tools/verify_local_import_vscode_copilot.js

## Validation Status
- OpenSpec new：✅ PASS（`openspec new change local-import-vscode-copilot`）
- OpenSpec ff：✅ PASS（artifacts 全齊）
- OpenSpec strict validate：✅ PASS（change）
- 本機 Copilot path preflight：✅ PASS（已找到 `.jsonl`）
- Local import verify：✅ PASS（`node tools/verify_local_import_vscode_copilot.js`）
- ChatGPT regression verify：✅ PASS（`node tools/verify_chatgpt_adapter.js`）
- Plain-text regression verify：✅ PASS（`node tools/verify_plain_text_adapter.js`）
- UI review：✅ PASS（`docs/uiux/2026-04-03_ui-review.md` addendum）
- UX review：✅ PASS（`docs/uiux/2026-04-03_ux-review.md` addendum）
- Review Gate：✅ PASS（archive 前 blocker 已修正）
- Git publish：✅ PASS（`git push origin main` → `bc3c0bd`）
- OpenSpec sync：✅ PASS（main spec 已建立）
- OpenSpec archive：✅ PASS（`openspec archive local-import-vscode-copilot -y --skip-specs`）
