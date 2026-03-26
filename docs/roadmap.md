# Roadmap

> 唯一路線圖。回答：「這個專案要做什麼？做到哪？下一步？」
> V1 歷史細節：[`archive/2026-03-26_v1-roadmap.md`](roadmap/archive/2026-03-26_v1-roadmap.md)

## 願景

從 markdown 驅動的工作流，成長為跨工具的「個人 AI 工作台」——具備專案記憶、對話交接、知識沉澱、輕量 UI、多工具接入能力。

## 產品路線

| Done | Phase | 版本 | 目標 | 狀態 |
|:----:|-------|------|------|:----:|
| [x] | Phase 0 | — | 規劃與骨架 | ✅ |
| [x] | Phase 1 | V1 | 可用工作流（手動→半自動→驗證→定版） | ✅ |
| [ ] | Phase 2 | V1.5 | 穩定化與產品化前準備 | 未開始 |
| [ ] | Phase 3 | V2 | 輕量 UI 工作台 | 未開始 |
| [ ] | Phase 4 | V2.5 | 多專案與共享能力 | 未開始 |
| [ ] | Phase 5 | V3 | 多工具接入 | 未開始 |

## 目前狀態

- **產品進度**：Phase 1 (V1) ✅ 已完成 → **Phase 2 (V1.5) 尚未啟動**
- **進行中活動**：無（S7 治理自動化 MVP 已關閉）
- **Next**：由人確認是否啟動 Phase 2（V1.5 穩定化）
- **Blockers**：無

---

## Phase 詳情

### Phase 0：規劃與骨架 ✅

| Done | 交付物 |
|:----:|--------|
| [x] | 規劃文件（目標、原則、策略、運作方式） |
| [x] | 專案記憶檔案結構 |
| [x] | handoff 模板 |
| [x] | 更新流程 |
| [x] | UI 願景與資訊架構 |

### Phase 1：V1 可用工作流 ✅

| Done | 交付物 |
|:----:|--------|
| [x] | 手動流程跑通（至少 2 次 pilot） |
| [x] | 半自動提取 MVP（對話紀錄 → 候選沉澱） |
| [x] | 真實專案驗證（至少 1 個專案完整跑過） |
| [x] | V1 收斂定版（檔案結構、規則、使用說明） |

> V1 完整歷史：[`archive/2026-03-26_v1-roadmap.md`](roadmap/archive/2026-03-26_v1-roadmap.md)

### Phase 2：V1.5 穩定化 ← 下一個產品階段

| Done | 工作項目 |
|:----:|---------|
| [ ] | 提取流程重構與規則穩定化 |
| [ ] | 模板欄位收斂 |
| [ ] | 真實案例回顧 |
| [ ] | 新專案初始化流程 |
| [ ] | 專案層與個人層邊界定義 |
| [ ] | 第一版使用說明 |

### Phase 3：V2 輕量 UI

| Done | 工作項目 |
|:----:|---------|
| [ ] | UI MVP 設計（以現有 markdown 為資料來源） |
| [ ] | 專案總覽與專案頁 |
| [ ] | handoff builder |
| [ ] | 候選審核介面 |
| [ ] | Memory Review 介面 |

### Phase 4：V2.5 多專案與共享

| Done | 工作項目 |
|:----:|---------|
| [ ] | 個人偏好與專案偏好正式分層 |
| [ ] | shared workflow 整理 |
| [ ] | 跨專案模板 |
| [ ] | 技能候選升級流程 |

### Phase 5：V3 多工具接入

| Done | 工作項目 |
|:----:|---------|
| [ ] | 多工具輸入格式整合 |
| [ ] | 統一提取與沉澱層 |
| [ ] | 審核與回寫流程擴充 |
| [ ] | UI 擴充（多來源檢視） |

---

## OpenSpec 執行記錄

> 以下為 OpenSpec change lifecycle 的治理/流程作業，**不等於產品功能交付**。
> S1-S4 是 Phase 1 的子任務；S5/S6 是未來 Phase 的規格草案（概念驗證，未交付產品）；S7 是治理自動化。
> 完整 change 記錄：`openspec/changes/archive/`

| # | OpenSpec Change | 對應 Phase | 性質 | 狀態 |
|:-:|----------------|:----------:|------|:----:|
| S0 | — | Phase 0 | 規劃與骨架 | ✅ |
| S1 | phase1-entrypoint-guidance-pilot | Phase 1 | 手動流程 pilot | ✅ |
| S2 | phase2-semi-auto-memory-extraction-mvp | Phase 1 | 半自動提取 | ✅ |
| S3 | phase3-real-project-validation | Phase 1 | 真實專案驗證 | ✅ |
| S4 | phase4-v1-convergence-finalization | Phase 1 | 收斂定版 | ✅ |
| S5 | phase5-v2-lightweight-ui-workbench-mvp | ~~Phase 3~~ | 規格草案（概念驗證，未交付產品） | ✅ |
| S6 | phase6-v3-multi-tool-integration-framework-mvp | ~~Phase 5~~ | 規格草案（概念驗證，未交付產品） | ✅ |
| S7 | phase7-v4-autonomous-continuation-governance-automation-mvp | — | 治理自動化 MVP | ✅ |

> S7 已於 2026-03-26 關閉（Cycle-06 為最終 cycle，不再新增）。完整記錄：`openspec/changes/phase7-v4-.../tasks.md`

---

## 推進原則

- **先完成 Phase 2 穩定化**，再做 UI 或多工具整合
- 若 V1 沒有真的穩定可重複，後面都建立在不穩的基礎上
- markdown / handoff / 工作流不是過渡品，是未來產品的核心骨架

---

## 異動記錄

- 2026-03-26：S7 正式關閉（Cycle-06 為最終 cycle；原始目標治理自動化 MVP 已達成）
- 2026-03-26：完成 S7 Cycle-06（roadmap 單一真源防回退檢核，腳本化可重播）
- 2026-03-26：合併 project-roadmap.md 為單一 roadmap，正規化 S-stage 命名（移除錯誤版本標籤）
- 2026-03-26：V1 roadmap 歸檔至 `archive/`
- 2026-03-26：S7 Cycle-01 到 Cycle-05 完成，治理 MVP Review Gate GO
- 2026-03-25：Phase 1 (V1) 四項交付物全部完成
- 2026-03-24：完成 Phase 1 首次 pilot 與 strict validate


