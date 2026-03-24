# Roadmap

> 用來回答：「目前在哪個階段？下一步是什麼？」

## 階段（可自行增修）
- S0：Stitch UI 基準（HTML）
- S1：Bootstrap workspace（rules/skills）
- S2：UI/UX 盤點 + Style Freeze
- S3：OpenSpec 規格（spec→tasks）
- S4：Implement
- S5：Bugfix 收斂 + Smoke + 回歸驗證
- S6：整理投影片素材（分享）

## 目前狀態
- Current：S4（2026-03-24）
- Next：以兩次 archived pilot 作為 Phase 1 最小完成線，準備關閉 Phase 1 或轉入下一個非同質 change
- Blockers：無
- Evidence：
	- `docs/planning/project-overview.md`
	- `docs/memory/project-context.md`
	- `docs/roadmap/project-roadmap.md`
	- `docs/roadmap/v1-roadmap.md`
	- `docs/runlog/2026-03-24_README.md`
	- `docs/decision-log.md`
	- `docs/qa/2026-03-24_smoke.md`
	- `docs/uiux/2026-03-24_ui-review.md`
	- `docs/uiux/2026-03-24_ux-review.md`
	- `openspec/specs/entrypoint-guidance-pilot/spec.md`
	- `openspec/specs/manual-workflow-pilot/spec.md`

## 階段轉換記錄
- 2026-03-24：`phase1-entrypoint-guidance-pilot` 已完成第 2 次比較型 pilot、strict validate 與 workspace smoke，roadmap 狀態由 S3 推進到 S4，待 code review / commit / sync / archive 收尾
- 2026-03-24：`phase1-entrypoint-guidance-pilot` 已完成 commit / push、main spec sync 與 archive；目前等待依兩次 archived pilot 決定 Phase 1 是否收斂或繼續第 3 次 pilot
- 2026-03-24：完成 Phase 1 收斂 review；目前判定兩次 archived pilot 已達最小完成線，暫不需要第 3 次同質 pilot
