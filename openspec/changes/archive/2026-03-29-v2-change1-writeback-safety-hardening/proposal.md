# v2-writeback-safety-hardening

## 目的
讓記憶寫回變得可控、可回復、可檢查，避免整檔粗暴覆蓋。

## 任務
1. `POST /api/memory/write` 寫回前自動備份到 `docs/memory/.backup/`
2. 建立 `docs/memory/.backup/` 目錄（含 `.gitkeep`）
3. 回傳 `backedUp: true` 確認備份成功

## 驗收標準
- 寫回時 `.backup/` 自動建立備份檔案
- API response 含 `backedUp: true`
- 不影響既有寫回功能

## 備註
- 此 change 於 openspec 流程導入前即已完成（2026-03-29 `5658def`）
- 事後補建 proposal 以維持完整 change 記錄
