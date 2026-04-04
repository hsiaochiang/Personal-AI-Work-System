# Cross-project Shared Knowledge Smoke — 2026-04-04

> Change: `cross-project-shared-knowledge`
> Type: UI change
> Scope: `/api/memory` sharedKnowledge payload + `/memory` 共用知識候選 + `docs/shared/` snapshot

## Verify Commands

- `openspec validate --changes cross-project-shared-knowledge --strict`
- `node tools/verify_cross_project_shared_knowledge.js`
- `node tools/verify_memory_health_scoring.js`
- `node tools/verify_memory_dedup_suggestions.js`
- `node tools/generate_shared_knowledge_report.js`
- local API smoke:
  - start `web/server.js`
  - `GET /api/memory?projectId=personal-ai`
  - `GET /api/memory?projectId=mock-test`

## Coverage

- `cross-project-shared-knowledge` 的 proposal / design / spec / tasks 已通過 strict validate
- `/api/memory` 仍保留既有 `files` / `summary` / `dedup` contract，並新增 `sharedKnowledge.summary` / `sharedKnowledge.groups`
- shared candidate 只在不同 projectId、相同 `filename` 間形成群組，不會把跨類別內容混在一起
- `docs/shared/shared-knowledge-candidates.md` 可由 generator 重跑，且不改寫任何 `docs/memory/*.md`
- `/memory` 頁面存在 shared overview 容器、shared utility 引用與 suggestion-only 文案
- 既有 health / dedup regression 維持 PASS

## Result

- `openspec validate --changes cross-project-shared-knowledge --strict`：PASS
- `verify_cross_project_shared_knowledge`：PASS
  - cross-project grouping PASS
  - same-filename guard PASS
  - current-project filtering PASS
  - low-signal metadata guard PASS
  - shared snapshot markdown contract PASS
  - `/memory` / server static contract PASS
- `verify_memory_health_scoring`：PASS
- `verify_memory_dedup_suggestions`：PASS
- `generate_shared_knowledge_report`：PASS
  - 產出 `docs/shared/shared-knowledge-candidates.md`
  - current fixture 共有 4 組 shared candidates
- local API smoke：PASS
  - `GET /api/memory?projectId=personal-ai` 回傳 `sharedKnowledge.summary.groupCount = 4`
  - `GET /api/memory?projectId=mock-test` 回傳 `sharedKnowledge.summary.groupCount = 4`
  - response 含 `sharedKnowledge.snapshotPath = docs/shared/shared-knowledge-candidates.md`

## Notes

- 第一版 shared knowledge 只做 suggestion-only，不提供 accept / merge / writeback action。
- heuristic 目前只比對相同 memory filename 的跨專案條目，並排除 `狀態：已確認` 這類低訊號 metadata 行。
- 本 change 尚未建立 `/shared` 獨立頁面；read-only 呈現落在既有 `/memory`。
