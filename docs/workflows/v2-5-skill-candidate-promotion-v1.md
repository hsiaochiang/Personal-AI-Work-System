# 技能候選升級流程 v2.5

> **版本**：v1.0
> **建立日期**：2026-03-27
> **所屬 Change**：`phase10-v2.5-multi-project-shared-capability-mvp`
> **目的**：定義 skill candidate 從「候選」到「正式 skill 文件」的完整升級生命週期，含四階段觸發條件、責任人、輸出路徑與格式規範，並提供 scenario 範例。

---

## 升級生命週期四階段

```
候選（Candidate）
      ↓  [觸發條件達成]
審核中（Under Review）
      ↓  [審核通過]
已採用（Adopted）
      ↓  [升級條件達成]
已升級（Promoted to Skill）
```

---

### 階段 1：候選（Candidate）

**定義**：某個反覆出現的模式或流程，被記錄在 `docs/memory/skill-candidates.md` 中，認為未來可能值得升級為正式 skill，但尚未有足夠重複次數或穩定輸出。

**觸發條件**（達成任一即可記錄為候選）：
- 同一模式在 3 次以上對話或任務中被重複使用
- 某個流程明顯降低了任務執行的摩擦（agent 或使用者主動注意到）
- 使用者或 agent 明確提出「這個步驟值得抽象化」

**責任人**：`agent`（任何 agent 均可提名；使用者確認後才記錄）

**動作**：
- 在 `docs/memory/skill-candidates.md` 中新增候選條目
- 條目格式：
  ```markdown
  ### 候選 N：<候選名稱>
  - 說明：<一句話說明這個模式做什麼>
  - 目前狀態：候選
  - 為何值得觀察：<具體理由>
  - 尚缺：<距離升級還差什麼>
  ```

---

### 階段 2：審核中（Under Review）

**定義**：候選條目已達到審核門檻，進入正式評估，確認是否可以定義成可重播、有明確輸入/輸出的 skill。

**觸發條件**（以下條件需同時滿足至少 3 項）：
- 重複出現至少 **3 次以上**（有明確次數記錄）
- 有**穩定的輸入形式**（可描述輸入格式）
- 有**穩定的輸出形式**（可描述輸出)
- 中間步驟可以被清晰描述（≤7 個步驟）
- 有跨時間週期的使用（至少跨兩個不同 session 或 Change）

**責任人**：`human`（使用者判斷是否值得投入升級）

**動作**：
- 將候選條目的 `目前狀態` 更新為「審核中」
- 記錄審核起始日期
- 在 `docs/decision-log.md` 中新增「技能候選進入審核」決策記錄

---

### 階段 3：已採用（Adopted）

**定義**：審核通過，確定要升級為正式 skill，進入文件撰寫階段。

**觸發條件**（需人工審核通過）：
- 使用者確認「值得升級為 skill」
- 已有初稿草擬（即使不完整）
- 明確定義了 skill 的 `applyTo` 範圍

**責任人**：`human`（最終拍板）+ `agent`（草擬 skill 文件）

**動作**：
- 將候選條目的 `目前狀態` 更新為「已採用」
- Agent 草擬 `.github/copilot/skills/<skill-name>/SKILL.md` 初稿
- 在草稿中以 `[DRAFT]` 標注尚未確認的部分
- 記錄採用日期與預計完成日期

---

### 階段 4：已升級（Promoted to Skill）

**定義**：Skill 文件完整且已通過人工驗收，正式放置到 `.github/copilot/skills/` 目錄，可被 Copilot 自動載入。

**觸發條件**（以下條件需全部滿足）：
- Skill 文件包含所有必要欄位（見下方格式規範）
- 文件中無 `[DRAFT]` 或 `[TODO]` 標記
- 在至少 1 次實際任務中驗證 skill 被正確啟用
- 使用者明確 approve

**責任人**：`agent`（執行文件建立與驗證）+ `human`（最終 approve）

**動作**：
- 將 skill 文件正式移動/建立到 `.github/copilot/skills/<skill-name>/SKILL.md`
- 在 `docs/memory/skill-candidates.md` 中將條目狀態更新為「已升級（Promoted）」，並附上最終路徑
- 在 `docs/decision-log.md` 記錄「技能正式升級」決策

---

## 輸出路徑與格式規範

### 輸出路徑

```
.github/
└── copilot/
    └── skills/
        └── <skill-name>/
            └── SKILL.md
```

**命名規範**：
- 目錄名稱使用 **kebab-case**（全小寫，以 `-` 分隔），如 `memory-extraction`、`handoff-init`
- 不使用版本號（版本靠 git log 追蹤）
- 使用英文，貼近行為描述（動詞 + 名詞，如 `extract-memory`、`init-project`）

### 最小必要欄位（Skill Markdown 結構）

```markdown
# <Skill 名稱>

> 一句話說明：什麼情境 → 用這個 skill → 完成什麼

## 觸發情境（When to Use）
- 使用者明確要求 <觸發詞或情境>
- 任務涉及 <特定問題域>
- （至少 2 個觸發條件）

## 輸入（Input）
- <輸入 1>：<說明>
- <輸入 2>：<說明>

## 執行步驟（Steps）
1. <步驟 1>
2. <步驟 2>
3. ...（最多 7 步）

## 輸出（Output）
- <輸出類型>：<說明>
- 產出位置：<檔案路徑或命名規則>

## 驗收條件（Done Criteria）
- [ ] <驗收項目 1>
- [ ] <驗收項目 2>

## 來源候選
> 此 skill 升級自：`docs/memory/skill-candidates.md` - 候選 N：<候選名稱>
> 採用日期：<YYYY-MM-DD>
```

---

## Scenario 範例：候選 1「對話紀錄提取與沉澱」完整升級流程

以 `docs/memory/skill-candidates.md` 中的「候選 1：對話紀錄提取與沉澱」為例，走完四個階段：

### 階段 1 → 候選（已完成）

在 `docs/memory/skill-candidates.md` 中已有記錄：
- 說明：從對話紀錄中提取專案背景、偏好、流程與決策，整理後寫入專案記憶檔
- 目前狀態：候選
- 已觀察到在 Phase 1、Phase 2、Phase 3 均有使用

### 階段 2 → 審核中

觸發：已確認「重複 3 次以上」、「輸入穩定（對話 transcript）」、「輸出穩定（`docs/memory/*.md` 更新）」、「步驟可描述（提取 → 分類 → 寫入）」

動作：
```markdown
### 候選 1：對話紀錄提取與沉澱
- 目前狀態：審核中（2026-03-27 開始）
- ...
```

決策記錄：在 `docs/decision-log.md` 追加：
```
2026-03-27：候選 1「對話紀錄提取」進入審核，已確認 3+ 次使用證據
```

### 階段 3 → 已採用

使用者 approve，agent 草擬初稿 `.github/copilot/skills/extract-memory/SKILL.md`：

```markdown
# Extract Memory from Conversation

> [DRAFT] 從對話紀錄中提取專案記憶，更新 `docs/memory/` 相關文件

## 觸發情境
- 使用者說「從這段對話提取記憶」
- 一段任務結束，需要沉澱決策或偏好

## 輸入
- 對話紀錄片段（text）
- 目標記憶類型（project-context / task-patterns / preference-rules）

## 執行步驟
1. 識別對話中的決策、偏好、規律
2. 分類到對應的記憶文件
3. 以 append 方式更新 `docs/memory/<target>.md`
4. 在 `docs/runlog/` 記錄提取來源

## 輸出
- 更新後的 `docs/memory/<target>.md`

## 驗收條件
- [ ] 所有提取項目已有具體目標文件路徑
- [ ] 未覆蓋既有內容（append only）
```

### 階段 4 → 已升級

人工審核通過 `[DRAFT]` 移除後，正式建立：
```
.github/copilot/skills/extract-memory/SKILL.md
```

在 `docs/memory/skill-candidates.md` 更新：
```markdown
### 候選 1：對話紀錄提取與沉澱
- 目前狀態：已升級（Promoted）
- 正式路徑：`.github/copilot/skills/extract-memory/SKILL.md`
- 升級日期：2026-03-27（範例）
```

---

## 參考

- 候選清單：`docs/memory/skill-candidates.md`
- Promoted skills 目錄：`.github/copilot/skills/`
- 決策留痕：`docs/decision-log.md`
- Shared Workflow 索引：`docs/workflows/v2-5-shared-workflows-index-v1.md`
