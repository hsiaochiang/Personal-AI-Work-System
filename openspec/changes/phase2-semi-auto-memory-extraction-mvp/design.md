# Design: phase2-semi-auto-memory-extraction-mvp

## Context

目前 workflow 已能手動跑通，但「從對話提煉可沉澱知識」仍缺乏固定結構。常見失敗點包含：輸入格式不穩定、候選欄位過度設計、文件雖完整但未形成實際閉環。此 change 以最小 MVP 原則，先把資料契約與人工確認節點固定，再以一次真實閉環驗證可行性。

## Goals / Non-Goals

Goals:
- 定義穩定可解析的對話紀錄輸入格式。
- 定義最小候選 schema 與記憶檔映射規則。
- 定義人工確認後回寫流程與留痕要求。
- 在同一 change 中完成 strict validate 與治理文件同步。

Non-Goals:
- 不做 UI 介面或視覺化審核台。
- 不整合多工具來源與跨平台 ingest。
- 不啟用全自動回寫。
- 不進行向量資料庫導入與大規模重構。

## Decisions

1. 採用最小輸入契約：
- 必填欄位為 `conversation_id`、`source`、`captured_at`、`messages`。
- `messages` 需保留 `role`、`content`、`timestamp`，不足欄位視為無效輸入並中止候選產生。

2. 候選 schema 採最小可用模型：
- 必填欄位為 `candidate_id`、`memory_scope`、`summary`、`evidence_excerpt`、`confidence`、`dedupe_key`、`status`。
- `memory_scope` 僅允許 `user`、`session`、`repo`。
- `status` 僅允許 `pending`、`approved`、`rejected`。

3. 人工確認採顯式閘門：
- 只有 `approved` 候選可以回寫。
- 回寫必須記錄操作人、時間、目標檔案與對應 candidate_id。

4. 治理同步採強制留痕：
- 每次執行都需記錄 strict validate 結果。
- handoff、runlog、roadmap 至少要能追溯「何時執行、輸入何者、回寫何處、結果如何」。

## Risks / Trade-offs

- 風險：輸入格式不穩定造成候選品質波動。
- 緩解：對缺欄位輸入採 fail-fast，先拒絕再修正格式。

- 風險：schema 過度設計導致實作負擔增加。
- 緩解：只保留審核與回寫必需欄位，延伸欄位延後至後續 change。

- 風險：只有文件通過，未形成真實閉環。
- 緩解：本 change 驗收強制至少一次真實候選 -> 人工確認 -> 回寫。

- 風險：治理文件不同步導致交接斷點。
- 緩解：將 handoff/runlog/roadmap 同步列為驗收條件。

## Migration Plan

- 不涉及資料庫 migration。
- 採文件與流程先行：先固化輸入/候選/確認契約，再評估是否進入 S3 的真實專案驗證。

## Open Questions

- `confidence` 的閾值是否需要在 S2 先凍結，或僅作參考欄位。
- `dedupe_key` 在跨日、多來源對話下是否需要加入來源權重。
