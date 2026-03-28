# 40-roadmap-governance（Roadmap 治理與階段管理）

> 目的：確保 roadmap 即時反映專案狀態，階段轉換有據可查，上線決策有明確依據。

## Roadmap 結構（必要區段）
`docs/roadmap.md` 必須包含：
1. **專案範疇**（Scope + Non-goals）
2. **里程碑**（Milestones）— 每個里程碑有驗收標準 checklist
3. **開發階段**（Stages）— 對應到里程碑
4. **目前狀態**（Current / Next / Blockers）
5. **階段轉換記錄**

## 何時必須更新 Roadmap

| 觸發事件 | 更新內容 |
|---------|---------|
| 階段完成（S? → S?+1） | 更新 §4 目前狀態 + §5 轉換記錄 |
| 里程碑驗收通過 | 勾選 §2 對應 checklist |
| 範疇變更（新增/移除功能） | 更新 §1 Scope 或 Non-goals + 記錄決策 |
| 發現阻塞 | 更新 §4 Blockers |
| `#status` prompt 執行時 | 至少更新 §4 |
| `#opsx-archive` 時 | 檢查是否觸發里程碑完成 |

## 階段轉換條件

階段轉換**不可跳級**（除非在 decision-log 中記錄特殊原因）。

### 轉換到下一階段的門檻
| 轉換 | 條件 |
|------|------|
| → S2 | S1 workspace 健檢通過（`--verify-only`） |
| → S3 | Style Freeze 完成（`docs/uiux/` 有 ui-review 且標記 FROZEN） |
| → S4 | OpenSpec Change 的 spec + tasks 已建立且 validate 通過 |
| → S5 | 所有 tasks 完成 + verify 通過 |
| → S6 | Smoke test 全數通過 + 無 P0/P1 未修 bug |

### 里程碑上線門檻
一個里程碑可以「上線」（release）的條件：
1. 該里程碑的**所有驗收標準**（checkbox）全部勾選
2. **Smoke test 通過**（`docs/qa/` 有對應記錄）
3. **無 P0 bug**（`docs/bugs/` 中無未關閉的 P0）
4. **決策已記錄**（`docs/decision-log.md` 含上線決策）

## `#status` 更新範本

執行 `#status` 時，必須輸出以下格式並同步更新 `docs/roadmap.md` §4：

```markdown
## 📊 狀態更新 — {日期}

### Roadmap
- 階段：{S?} {名稱}
- 里程碑：{M?} {名稱}
- 進度：{完成項/總項} 驗收標準已滿足

### 里程碑驗收進度
- M1 資料就緒：{?}/7 ✅
- M2 核心可用：{?}/10 ✅
- M3 練習完整：{?}/9 ✅
- M4 品質收斂：{?}/7 ✅

### 下一步
- {具體行動} — `#prompt-name`

### 風險/阻塞
- {列出或「無」}
```

## 決策記錄觸發
以下情況**必須**同步記錄到 `docs/decision-log.md`：
- 里程碑驗收標準變更
- 階段跳級
- 功能移入/移出 Scope
- 上線時程變更

## 三層規劃結構

本專案採用三層規劃結構，避免把 roadmap、版本規劃、單次 change 混在一起。

| 層級 | 文件 | 回答的問題 |
|------|------|-----------|
| L0 全貌 | `docs/roadmap.md` | 產品方向、版本地圖、目前位置 |
| L1 版本 | `docs/planning/v{{N}}-brief.md` | 這一版核心問題、in/out scope、完成條件 |
| L2 變更 | `openspec/changes/<name>/` | 這一次具體改什麼、怎麼驗收 |

### Agent 判斷流程
若任務不清楚應看哪一層，依下列順序判斷：
- 使用者在問「整個產品接下來怎麼走」→ 先看 `docs/roadmap.md`
- 使用者在問「這一版到底要做什麼」→ 先看對應版本 brief
- 使用者在問「這一次要怎麼改」→ 先看 active OpenSpec change

### 反模式
- 不要拿 roadmap 直接當 implementation task list
- 不要沒有 version brief 就直接開一串 changes
- 不要用單一 change 承接整個版本
- 不要在不同文件各自宣告版本完成（以 `docs/roadmap.md` 為準）

## Version Brief 治理

### 何時必須建立 Version Brief
- 當要推進一個新版本且預期會拆成多個 changes 時
- 存放於 `docs/planning/v{{N}}-brief.md`

### Version Brief 必要區段
1. 版本目標
2. 背景與動機
3. In Scope / Out of Scope
4. 完成條件（Acceptance Criteria，含 checkbox）
5. 預計拆分的 Changes
6. 跨版本影響
7. 使用者確認（確認日期 / 確認人 / 確認範圍）
8. 版本狀態

### Agent 必須遵守的 Brief 規則
- **開新 change 前**：必須先看當前版本 brief，確認 change 在 scope 內
- **版本完成時**：回寫 brief 的完成狀態（勾選 Acceptance Criteria）+ 更新 roadmap
- **跨版本影響**：本版做了什麼決定會影響下一版、out of scope 但下一版應處理的項目、技術債或架構約束，都必須記錄在 brief 的「跨版本影響」區段
- **新版開始時**：先讀上一版 brief 的「跨版本影響」承接脈絡

### 何時必須更新 Version Brief

| 觸發事件 | 更新內容 |
|---------|----------|
| 新 change 開始 | 更新 Changes 表的狀態 |
| change archive | 更新 Changes 表 + 檢查是否所有 changes 都已完成 |
| scope 變更 | 更新 In Scope / Out of Scope |
| 版本完成 | 勾選 Acceptance Criteria + 更新版本狀態 + 填寫跨版本影響 |
| 使用者確認範圍 | 填寫使用者確認區段 |
