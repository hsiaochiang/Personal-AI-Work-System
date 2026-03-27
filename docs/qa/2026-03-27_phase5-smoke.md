# Smoke Test：Phase 5（V3 多工具接入）

> 日期：2026-03-27  
> Change：`phase11-v3-multi-tool-integration-mvp`  
> 執行角色：GitHub Copilot（OpenSpec Executor）

---

## 1. 產出文件存在確認

| # | 項目 | 路徑 | 確認 |
|---|------|------|:----:|
| 1 | 多工具 Adapter 介面規格 | `docs/workflows/v3-multi-tool-adapter-spec-v1.md` | ✅ |
| 2 | Normalized Schema 規格 | `docs/workflows/v3-normalized-schema-v1.md` | ✅ |
| 3 | 去重策略規格 | `docs/workflows/v3-dedupe-strategy-v1.md` | ✅ |
| 4 | 可信度評分機制規格 | `docs/workflows/v3-confidence-scoring-v1.md` | ✅ |
| 5 | 跨工具比較視圖規格 | `docs/product/v3-multi-tool-comparison-view-spec-v1.md` | ✅ |
| 6 | tasks.md（全部 [x]） | `openspec/changes/phase11-v3-multi-tool-integration-mvp/tasks.md` | ✅ |
| 7 | roadmap.md（Phase 5 [x]） | `docs/roadmap.md` | ✅ |
| 8 | handoff/current-task.md（Phase 5 完成） | `docs/handoff/current-task.md` | ✅ |

---

## 2. 最小驗收命令

```powershell
# 驗收命令 1：確認五項產出文件存在
$files = @(
  "docs/workflows/v3-multi-tool-adapter-spec-v1.md",
  "docs/workflows/v3-normalized-schema-v1.md",
  "docs/workflows/v3-dedupe-strategy-v1.md",
  "docs/workflows/v3-confidence-scoring-v1.md",
  "docs/product/v3-multi-tool-comparison-view-spec-v1.md"
)
$files | ForEach-Object { if (Test-Path $_) { "EXISTS: $_" } else { "MISSING: $_" } }
```

```powershell
# 驗收命令 2：strict validate PASS
npx openspec validate phase11-v3-multi-tool-integration-mvp --type change --strict
# 預期：exit 0，輸出 "Change 'phase11-v3-multi-tool-integration-mvp' is valid"
```

```powershell
# 驗收命令 3：tasks.md 全部 [x]（不應出現未完成的 [ ]）
$content = Get-Content "openspec/changes/phase11-v3-multi-tool-integration-mvp/tasks.md" -Raw
if ($content -match '\[ \]') { "FAIL: 仍有未完成 task" } else { "PASS: 所有 tasks 已完成" }
```

---

## 3. 驗收結果摘要

| 驗收項目 | 結果 |
|---------|:----:|
| 五項工作產出文件存在 | ✅ PASS |
| Strict validate（exit 0） | ✅ PASS |
| tasks.md 全部 [x] | ✅ PASS |
| roadmap Phase 5 四項 [x] | ✅ PASS |
| handoff Phase 5 Done 記錄完整 | ✅ PASS |

---

## 4. 下一步

- Review Gate → `/opsx-archive phase11-v3-multi-tool-integration-mvp`
