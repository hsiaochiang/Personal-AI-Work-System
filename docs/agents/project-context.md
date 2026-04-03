# Project Context

> 跨 agent 共用背景。請保持精簡，只放穩定且高價值的專案事實。

## Project Summary
- Project name: Personal-AI-Work-System
- Repository purpose: 建立可跨 ChatGPT、Gemini、VS Code、Antigravity 使用的個人 AI 工作系統，以 markdown 驅動的知識沉澱、輕量 web UI 工作台與 handoff workflow 為核心
- Primary stack: Node.js HTTP server + vanilla HTML/JS（無框架無 build）、Markdown 文件工作流、VS Code / GitHub Copilot 協作、OpenSpec 規格流程、copilot-workspace-template v1.5.0
- Runtime targets: `node web/server.js` → http://localhost:3000（本地 dev server）
- Deployment environments: 目前以 local workspace 為主；尚未進入正式 dev / staging / prod 部署
- Current version: V3 已完成（跨工具整合層），V4 規劃中（治理、自動化、個人 AI 作業系統）

## Repository Map
- Application entry points: `web/server.js`（dev server）、`web/public/index.html`（前端入口）
- Main packages / apps: `web/` 輕量工作台 UI + API server
- Shared libraries: `docs/memory/` 專案記憶、`docs/workflows/` 工作流、`docs/templates/` handoff 模板
- Infra / scripts / tooling: `.github/` agent / prompt / rule 結構、`openspec/` change lifecycle、上游 `copilot-workspace-template` bootstrap 工具、`tools/verify_flow.js` E2E 驗證

## Architecture Boundaries
- Core modules: 專案記憶層、handoff 層、規劃 / roadmap 層、OpenSpec workflow 層
- Shared components / libraries: `docs/memory/*`、`docs/workflows/*`、`docs/templates/*`、`docs/roadmap/*`
- External systems / APIs: GitHub Copilot、VS Code Chat、OpenSpec、未來的 ChatGPT / Gemini / Antigravity 對話來源
- Data ownership boundaries: 模板與專案的檔案邊界請見下方 Template Integration 區塊；其餘專案特定 ownership 由本專案自行補充
- Critical paths: 對話紀錄到專案記憶的沉澱流程、handoff 交接流程、V1 手動 workflow 驗證、模板治理檔與專案真實內容同步

## Important Files
- App bootstrap / main entry: `docs/planning/project-overview.md`、`docs/memory/project-context.md`
- Environment config: 目前無執行期 `.env`；模板治理入口為 `docs/agents/commands.md` 與 `.github/copilot/rules/90-project-custom.md`
- Test config: 目前無正式 automated test config；以 template verify 與文件 smoke 為主
- Build / release config: 目前無 build / release pipeline；仍處於 docs-first / workflow-first 階段

## Delivery Constraints
- Current stage: 參考 `docs/roadmap.md`
- Quality gate: 參考 `.github/copilot/rules/35-quality-gate.md`
- Scope changes must be logged in: `docs/decision-log.md`
- High-risk areas: 記憶結構邊界、handoff 流程、提取規則、任何會讓模板檔與專案檔重新混淆的調整
- Forbidden changes without approval: 架構重寫、重大 dependency、新的資料儲存方案、把 managed 模板檔在下游直接當成專案長期真相修改

## Dependency Policy
- Preferred internal abstractions: 優先沿用 `docs/memory/`、`docs/workflows/`、`docs/templates/` 既有文件分工，不新增平行結構
- Approved external dependencies: 目前以既有 workspace 工具為主；未核准新的 runtime dependency
- Dependencies requiring review: 任何腳本執行框架、資料庫、索引 / 向量檢索、正式前端框架與部署平台

## Testing Expectations
- Minimum validation per change: 至少同步 `docs/roadmap.md`、`docs/decision-log.md`、`docs/runlog/` / handoff，並確認 template verify 或對應 smoke 通過
- Required smoke paths: handoff 是否可接手、roadmap / decision-log 是否一致、模板邊界是否仍可由 `TEMPLATE-FILES.md` 判讀
- Regression-sensitive areas: 模板導入邊界、project context 正確性、commands 可執行性、記憶檔與 roadmap 的一致性

## Collaboration Notes
- Long-term evidence stays in `docs/roadmap.md`, `docs/decision-log.md`, `docs/runlog/`
- Short-term task state stays in `docs/handoff/current-task.md`, `docs/handoff/blockers.md`
- Last initialized by bootstrap on: 2026-03-21

## Template Integration
- Template: copilot-workspace-template v1.3.0
- Last applied: 2026-03-22
- Managed files: 由模板控制；下次 upgrade 會以模板最新版覆蓋。清單見 `TEMPLATE-FILES.md`
- Protected files: 模板建立骨架，專案填寫內容；upgrade 預設不覆蓋
- Init-only files: `docs/handoff/current-task.md`、`docs/handoff/blockers.md` 只在第一次 init 建立；後續由本專案自行維護
- Project-owned files: 模板不追蹤，完全由本專案控制
- Project custom slot: `.github/copilot/rules/90-project-custom.md`，若本專案需要補充規則，優先寫在此檔
- Bootstrap commands: 見 `docs/agents/commands.md` 的 Template Commands 區段
- Classification lookup: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --list-managed --root D:/program/Personal-AI-Work-System`
