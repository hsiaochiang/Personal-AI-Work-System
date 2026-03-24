# Commands

> 在此統一 repo 的常用命令，避免不同 agent 各自猜測執行方式。

## Environment Matrix
- Package manager: 目前無專案專屬 package manager；此階段以文件與工作流治理為主
- Language runtimes: Markdown / docs-first；若要執行模板工具，使用上游 template repo 的 Python 3.11 venv
- Required services: 無
- Secrets / env files: 目前無必填 secrets；若未來接入外部工具再另補

## Setup
- Install dependencies: 目前無需安裝專案依賴；若要跑模板治理命令，先確保 `D:/program/copilot-workspace-template/.venv/` 可用
- Initialize dev environment: 先閱讀 `README.md`、`docs/planning/project-overview.md`、`docs/agents/project-context.md`，再確認 `docs/handoff/current-task.md`
- Database / local services: 無

## OpenSpec CLI
- Install prerequisite: 若要在本機執行 OpenSpec CLI，需先安裝 Node.js 與 npm；若只使用 agent workflow 與 `openspec/` 目錄結構，可先不安裝
- Install globally: `npm install -g @fission-ai/openspec`
- Install specific latest tested version: `npm install -g @fission-ai/openspec@1.2.0`
- One-off usage: `npx @fission-ai/openspec --version`
- Verify install: `openspec --version`
- Strict validate example: `openspec change validate "<change-name>" --strict`
- Official source: `https://www.npmjs.com/package/@fission-ai/openspec`
- Upstream repository: `https://github.com/Fission-AI/OpenSpec`

## Daily Commands
- Dev server: 無；目前不是執行型 app
- Lint: 無正式 lint；文件變更以人工審閱與結構一致性為主
- Test: 無正式 automated tests
- Build: 無
- Smoke test: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --verify-only --root D:/program/Personal-AI-Work-System`

## Template Commands
- Template status: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --status --root D:/program/Personal-AI-Work-System`
- Upgrade preview: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --upgrade-preview --root D:/program/Personal-AI-Work-System`
- Upgrade apply: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --upgrade --root D:/program/Personal-AI-Work-System`
- List managed: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --list-managed --root D:/program/Personal-AI-Work-System`
- Verify template install: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --verify-only --root D:/program/Personal-AI-Work-System`

## Command Matrix
- Repo-wide checks: `git -C D:/program/Personal-AI-Work-System status --short`
- Backend-only checks: 無
- Frontend-only checks: 無
- Targeted test command: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --verify-only --root D:/program/Personal-AI-Work-System`
- Format / autofix: 無；保持最小安全修改

## Working Directories
- Repo root: `D:\program\Personal-AI-Work-System`
- Backend: 無
- Frontend: 無
- Package / workspace filters: 主要工作目錄為 `docs/`、`.github/`、`openspec/`

## Execution Rules
- 先選對工作目錄，再執行命令
- 優先使用專案既有 script，不自行發明等價命令
- 若命令會改寫檔案，先在回報中標明
- 若命令耗時或具破壞性，先說明目的與預期結果

## Reporting Contract
- 回報執行過哪些命令
- 回報成功 / 失敗與關鍵輸出
- 若未執行驗證，需明確說明原因
- 若命令只適用於某個子專案，需標出工作目錄

## Validation Policy
- Small change: 至少同步 handoff / runlog 或對應證據，並跑 template verify 或等價 smoke
- Medium change: 檢查 roadmap / decision-log / current-task 一致性，再跑 targeted verify
- High-risk change: 補充人工 walkthrough，確認模板邊界、handoff 可接手性與主要記憶入口未被破壞
- 若本次 change 需要在本機執行 OpenSpec strict validate，先確認 `openspec --version` 可用；若未安裝，可先用 `npx @fission-ai/openspec --version` 驗證是否能執行，再決定是否全域安裝
- active change 的 strict validate 以 `openspec change validate "<change-name>" --strict` 為準，不使用 `openspec validate` 縮寫形式

## Notes
- 新增或變更命令時，同步更新本檔
- 若專案有多個 app / package，請在此明確列出工作目錄
- 若要修改模板檔案，先看根目錄 `TEMPLATE-FILES.md`；managed files 應優先回到 template repo 修正
- 若要補專案特定規則，優先使用 `.github/copilot/rules/90-project-custom.md`，不要直接改 managed rules
- 目前 repo 仍處於 docs-first / workflow-first 階段，若未來加入可執行程式碼，再補 lint / test / build 指令
- OpenSpec CLI 目前屬可選工具，不是所有協作流程的必備前置；只有在本機要執行 strict validate 時才需要安裝
