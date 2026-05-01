# Session Slides Outline — 2026-05-01

> **主題**：PAIS 首次完整 UX 巡檢與知識品質改善
> **時長建議**：15–20 分鐘

---

## Slide 1 — 目標

**這次 session 要解決什麼？**

PAIS 系統從未做過系統性 UX 審查。已有功能可以運行，但：
- 不知道有沒有無障礙合規問題
- 不知道使用者在「提取知識」流程的認知摩擦在哪
- 沒有可複用的 UX 審查工具

目標：**一次完整跑完 5 Phase UX 巡檢，並立即修復 P0 問題**

---

## Slide 2 — 問題（Before）

**axe-core 發現的問題**

| 嚴重度 | 問題 | 頁面 |
|--------|------|------|
| 🔴 Critical | `<select>` 無 accessible name | extract |
| 🟠 Serious × 5 | color-contrast 不足 | index / memory / projects / settings / handoff |
| 🟠 Serious × 1 | scrollable region 無 keyboard focus | handoff |

**Cognitive Walkthrough 發現**
- 21 步驟中 11 步 FAIL（52% 失敗率）
- 核心問題：「存文字」不等於「沉澱知識」
- 使用者無法修改 AI 判斷的類型，也無法為知識命名

**Heuristic Evaluation**
- 7 維度得分 16/35（45%）
- 最低分：知識可見性（2/5）、使用者控制（2/5）

---

## Slide 3 — 方法

**5 Phase 巡檢流程**

```
Phase A：截圖 + axe-core 自動掃描（Playwright）
Phase B：Cognitive Walkthrough（4 問框架 × 5 任務流程）
Phase C：Nielsen 10 Heuristics 評估
Phase D：Backlog 整理 + 完整報告
Phase E：ux-auditor.md Skill 抽象化（可複用）
```

**然後立即執行 change**

```
T-05（CSS）→ T-01（P0 fix）→ T-02（類型選擇器）
→ T-03（可編輯標題）→ T-04（搜尋新鮮度）
```

---

## Slide 4 — 結果（After）

**axe-core Before / After**

| 頁面 | Before | After |
|------|--------|-------|
| extract | 1 critical | **0 violations ✅** |
| search | 0 | 0 ✅ |

**功能改善**

| 功能 | Before | After |
|------|--------|-------|
| 知識類型 | AI 決定，無法修改 | 卡片上可下拉修改 |
| 知識標題 | AI 提取 keyLine（唯讀） | 使用者可自訂標題 |
| 搜尋記憶條目 | 只顯示檔名 | 類型 chip + 相對時間 |

---

## Slide 5 — 學到什麼

**踩雷**
- `capture.mjs` 掃描 `extract` 頁面時，`<select>` 是靜態頁面元素，但 axe 仍能在 initial render 偵測到 — **不需要填表單才能發現**
- PAIS PROD repo 處於 detached HEAD 狀態，`git push` 需要指定 `HEAD:main`

**方法論收穫**
- CW 的「4 問框架」比直覺走流程更容易找到 _認知摩擦點_
- 「知識 ≠ 文字」這個 North Star 問題，讓 P1 優先級的決策標準變得清晰
- UX 巡檢 → 立即規劃 → 立即實作的 one-session cycle 是可行的（共 ~4 小時）

**可複用產出**
- `ux-auditor.md` skill：下次任何專案都能直接觸發 `#ux-audit` 執行相同流程
- `openspec/changes/archive/2026-05-01-knowledge-quality-ux/` 作為 change 格式範例

---

## Slide 6 — 下一步

- **P2-A11Y-01**：修復 5 頁面 color-contrast violations（下次 session）
- **V7 規劃**：根據 UX Backlog 16 項挑選下一版 scope
- Roadmap 狀態：V6 完成，等待人工決定 V7 scope

---

> **產出證據**：
> - `docs/runlog/2026-05-01_README.md`
> - `docs/ux-review/ux-audit-report.md`
> - `openspec/changes/archive/2026-05-01-knowledge-quality-ux/`
> - PAIS PROD commit `afb13d2` / PAIS DEV commit `f6786b0`
