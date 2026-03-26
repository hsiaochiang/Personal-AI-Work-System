# Decision: V1 Roadmap 歸檔與 Roadmap 對應重整（2026-03-26）

## What

- 將 `docs/roadmap/v1-roadmap.md` 歸檔到 `docs/roadmap/archive/2026-03-26_v1-roadmap.md`。
- 在 `docs/roadmap/v1-roadmap.md` 保留精簡入口檔（歷史指引）。
- 在 `docs/roadmap.md` 新增 Roadmap 對應矩陣（project-roadmap / roadmap / change tasks / archive）。
- 在 `docs/roadmap/project-roadmap.md` 補齊閱讀指引，明確區分長程路線與執行進度來源。

## Why

- V1 roadmap 內容已全部完成，繼續作為當前衝刺文件會提高維運成本。
- `docs/roadmap.md` 與 `docs/roadmap/project-roadmap.md` 的角色需明確分工，避免同一狀態在多檔漂移。

## Impact

- 文件導覽更清晰：
  - 長程看 `project-roadmap.md`
  - 當前看 `docs/roadmap.md`
  - S7 任務看 `openspec .../tasks.md`
  - V1 歷史看 archive
- 降低交接時「看錯檔案」造成的摩擦。

## Evidence

- `docs/roadmap/archive/2026-03-26_v1-roadmap.md`
- `docs/roadmap/v1-roadmap.md`
- `docs/roadmap.md`
- `docs/roadmap/project-roadmap.md`
- `docs/decision-log.md`
