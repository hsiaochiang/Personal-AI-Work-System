# Decision Log（決策紀錄）

> 所有取捨與規格變更都要留痕（尤其是 Style Freeze / 規範變更）。

| Date | Decision | Why | Impact | Evidence |
|---|---|---|---|---|
| 2026-03-22 | 導入 `copilot-workspace-template` v1.3.0 的模板邊界模型 | 需要讓本專案能分辨 managed / protected / init-only 檔案，避免之後升級再把模板檔與專案檔混在一起 | 根目錄新增 `TEMPLATE-FILES.md`，並以 `template-lock.json`、`80-template-boundary.md`、`90-project-custom.md` 作為模板治理基線 | `TEMPLATE-FILES.md` |
| 2026-03-22 | handoff 與當日 runlog 在 init 後改由本專案自行維護 | `current-task`、`blockers`、當日 runlog 屬短期證據，不適合繼續由模板 seed | 後續模板升級不再補入這些檔案；本 repo 必須自行維護 handoff 與 runlog，並以第二個 commit 收錄這類治理更新 | `docs/handoff/current-task.md` |
