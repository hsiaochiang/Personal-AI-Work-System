# Decision Log（決策紀錄）

> 所有取捨與規格變更都要留痕（尤其是 Style Freeze / 規範變更）。

| Date | Decision | Why | Impact | Evidence |
|---|---|---|---|---|
| 2026-03-22 | 導入 `copilot-workspace-template` v1.3.0 的模板邊界模型 | 需要讓本專案能分辨 managed / protected / init-only 檔案，避免之後升級再把模板檔與專案檔混在一起 | 根目錄新增 `TEMPLATE-FILES.md`，並以 `template-lock.json`、`80-template-boundary.md`、`90-project-custom.md` 作為模板治理基線 | `TEMPLATE-FILES.md` |
| 2026-03-22 | handoff 與當日 runlog 在 init 後改由本專案自行維護 | `current-task`、`blockers`、當日 runlog 屬短期證據，不適合繼續由模板 seed | 後續模板升級不再補入這些檔案；本 repo 必須自行維護 handoff 與 runlog，並以第二個 commit 收錄這類治理更新 | `docs/handoff/current-task.md` |
| 2026-03-23 | OpenSpec CLI 採 npm 套件 `@fission-ai/openspec` 作為本專案可引用的安裝入口 | 需要在不擴大前置依賴的前提下，為未來本機 strict validate 補出可驗證的安裝與檢查方式；實機驗證顯示 `openspec` shim 也指向此套件 | `docs/agents/commands.md` 新增 OpenSpec CLI 段落；後續若需要本機 validate，可使用 `npm install -g @fission-ai/openspec` 或先以 `npx @fission-ai/openspec --version` 驗證 | `docs/agents/commands.md` |
| 2026-03-24 | 第一個 OpenSpec change 先採單次 pilot，命名為 `phase1-single-workflow-pilot` | 第一個 change 應先驗證流程能否完整跑通一次；若一開始就把 2 到 3 次對話驗證包進去，會把 Phase 1 的初次打通、重複驗證與模板收斂混成同一個 change，驗收邊界會失焦 | 接下來的 OpenSpec 規格應聚焦在一次完整手動 workflow 驗證、留痕與最小修正；多次重跑與欄位收斂留到下一個 change | `docs/handoff/current-task.md` |
| 2026-03-24 | `phase1-single-workflow-pilot` 以 OpenSpec CLI 生成骨架，再手動補齊最小 artifacts 與治理證據 | repo 內沒有既有 change 範例，直接用 CLI 建骨架可避免臆測檔名格式；同時本次調整會超過 5 個檔案，需先明確記錄為單一 pilot 的最小證據鏈修補 | 新增 proposal、design、tasks、delta spec、QA/UIUX 與專案記憶證據，作為第 2 次與第 3 次手動 workflow 驗證的基線；不擴大到自動化或產品功能 | `openspec/changes/phase1-single-workflow-pilot/proposal.md` |
