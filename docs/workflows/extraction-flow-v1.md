# 標準提取流程 v1

> **版本**：v1.0  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **目的**：提供可被他人依文件重播的標準提取流程，作為 V1.5 穩定化基線。

---

## Inputs（輸入）

| 輸入項目 | 類型 | 必填 | 說明 |
|---------|------|:----:|------|
| 對話紀錄 / runlog | 文字檔（`.md`） | 必填 | 來源對話或工作記錄，位置通常為 `docs/runlog/<date>_README.md` |
| 記憶候選清單 | 文字（inline 或 `.md`） | 選填 | 已有候選時直接進 Step 3；無候選則從 Step 1 開始 |
| memory 現況快照 | `docs/memory/*.md` | 必填 | 避免重複提取已存在概念 |
| 操作員標識 | 字串 | 必填 | `operator` 欄位，需為明確角色名（如 `GitHub Copilot`） |
| 操作日期 | YYYY-MM-DD | 必填 | `reviewed_at` 欄位 |

---

## Steps（步驟）

### Step 1：閱讀來源並建立 `source_summary`

1. 讀取 `docs/runlog/<date>_README.md`（主要來源）與 `docs/memory/*.md`（去重基線）。
2. 用一句話描述本次來源的核心主題，填入 `source_summary`。
3. 若有多個輸入工具（如 Tool A + Tool B），各自記錄 `source_tool` 與 `source_ref`。

### Step 2：識別提取候選

1. 掃描來源文字，找出符合以下任一條件的知識片段：
   - 可操作的規則（明確說明「應做」或「不應做」）
   - 已驗證的命令或步驟（有 `PASS` / `FAIL` 結果）
   - 邊界定義（路徑、寫入目標、責任歸屬）
   - 流程決策（「選 A 不選 B」 + 理由）
2. 每個候選填寫以下欄位：

```
candidate_id: cand-<session>-<YYYYMMDD>-<seq>
summary: <一句話描述>
confidence: <0.00-1.00>
dedupe_key: <小寫連字符唯一標識>
source_tool: <Tool A | Tool B | ...>
source_ref: <來源檔案路徑或對話段落>
status: pending
```

### Step 3：去重比對（Dedupe）

1. 取出所有現有 `/memories/` 與 `docs/memory/*.md` 中的 `dedupe_key`。
2. 若新候選的 `dedupe_key` 已存在：
   - 若內容一致 → 直接標 `status: duplicate`，不重複寫入。
   - 若內容有更新 → 標 `status: update`，進入審核。
3. 若不存在 → 維持 `status: pending`，進入審核。

### Step 4：人工／Agent 審核決策

1. 審核每個 `pending` 或 `update` 候選，填寫：
   - `decision: adopted | rejected`
   - `reviewer: <角色名>`
   - `reviewed_at: <YYYY-MM-DD>`
   - `reason: <一句話>` 

2. 採納策略：
   - `confidence >= 0.80` 且沒有寫入邊界衝突 → 優先採納
   - `confidence < 0.60` 或明確違反邊界規則（如寫入 `archive/`） → 直接拒絕
   - 其他情況 → 依 reason 判斷

### Step 5：草稿寫回（Draft Writeback）

1. 僅處理 `decision: adopted` 的候選。
2. 寫入目標（按類型）：
   - 規則類 → `docs/memory/preference-rules.md` 或 `docs/memory/task-patterns.md`
   - 流程類 → `docs/workflows/<slug>.md`
   - 命令類 → `docs/agents/commands.md`（附命令 + 期望結果）
3. **嚴格禁止**寫入以下位置：
   - `openspec/changes/archive/`（已封存區）
   - `/memories/`（user-scope，需明確觸發才可寫入）
   - 任何 archived 文件（roadmap archive、decision archive）

### Step 6：治理同步

執行以下固定收尾同步，缺一不可：
- [ ] 更新 `docs/runlog/<date>_README.md`（追加本輪執行摘要）
- [ ] 更新 `docs/handoff/current-task.md`（Done / In Progress / Validation Status）
- [ ] 若有路徑或邊界變更 → 更新 `docs/handoff/blockers.md`
- [ ] 若有 roadmap 階段完成 → 更新 `docs/roadmap.md`

---

## Outputs（輸出）

| 輸出項目 | 位置 | 必填 | 說明 |
|---------|------|:----:|------|
| 候選清單（附 decision） | `docs/qa/<date>_smoke.md` 或 runlog 段落 | 必填 | 含 adopted + rejected 各一份 |
| 採納知識寫回 | `docs/memory/` 或 `docs/workflows/` | 依採納數 | 每筆 adopted 必有對應寫回 |
| 治理同步 | `docs/runlog/`、`docs/handoff/` | 必填 | 見 Step 6 |
| 提取摘要（可選） | `docs/qa/<date>_smoke.md` | 選填 | 彙總本輪輸入/候選/決策統計 |

---

## 重播驗證 Checklist

重播者可用此 checklist 確認每步正確執行：

- [ ] Step 1：`source_summary` 已填寫
- [ ] Step 2：每個候選有完整 6 個欄位
- [ ] Step 3：`dedupe_key` 已與現有記憶比對
- [ ] Step 4：每個 `pending`/`update` 候選有 `decision + reviewer + reviewed_at + reason`
- [ ] Step 5：`adopted` 候選已寫入正確目標路徑；`rejected` 僅記錄原因，無寫入
- [ ] Step 6：runlog / handoff 均已更新

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-26 | 初版，基於 S5/S6 執行證據抽象化 |
