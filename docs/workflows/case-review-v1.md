# 案例回顧 v1

> **版本**：v1.0  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **目的**：回顧兩個不同型態的案例，找出差異並提供可操作的規則修正點。

---

## 案例 A：規劃型 — `phase4-v1-convergence-finalization`

### 背景

- **類型**：定版/收斂型（Planning & Convergence）
- **Archive 路徑**：`openspec/changes/archive/2026-03-25-phase4-v1-convergence-finalization/`
- **執行日期**：2026-03-25
- **驅動動機**：S1–S3 已完成並封存，但缺少 V1 進入穩定交付前的收斂定版門檻與統一驗收定義。

### 流程摘要

1. **啟動**：使用 `openspec new` 建立 change，定義 Scope = 收斂定版（不新增功能）。
2. **盤點**：掃描 S1–S3 已完成的 specs 與 archived changes，形成一致性清單。
3. **定義 Gate**：建立三層 release gate：strict validate + 治理文件一致性 + handoff 可接續性。
4. **補齊缺口**：更新 roadmap / decision-log / runlog / handoff / QA，確保無互斥狀態。
5. **執行 Validate**：`openspec validate phase4-v1-convergence-finalization --type change --strict` → PASS。
6. **收尾**：完成 S4 交棒摘要後進入 archive。

### 結果

- **strict validate**：PASS
- **主要產出**：S4 release gate 定義（三層）；handoff 可接續記錄；治理文件同步完成。
- **主要風險（實際觸發）**：文件間狀態漂移（roadmap 與 handoff 一度不一致），透過手動對齊解除。
- **最終狀態**：已封存 ✅，作為 Phase 1 (V1) 定版基線。

### 評估

| 面向 | 評分 | 說明 |
|------|:----:|------|
| 流程可追溯性 | ★★★★☆ | 每步有 runlog 記錄，但缺少中間步驟的細粒度命令記錄 |
| 驗收明確性 | ★★★★★ | 三層 gate 定義清晰，pass/fail 判定無歧義 |
| 治理同步完整性 | ★★★☆☆ | 最終同步前有漂移現象，需要額外修補 |
| 可重播性 | ★★★☆☆ | 步驟可描述，但命令略有缺漏（中間對齊步驟未完整記錄） |

---

## 案例 B：實作型 — `phase7-v4-autonomous-continuation-governance-automation-mvp`

### 背景

- **類型**：治理自動化執行型（Governance Automation Implementation）
- **Archive 路徑**：`openspec/changes/archive/2026-03-26-phase7-v4-autonomous-continuation-governance-automation-mvp/`
- **執行日期**：2026-03-26
- **驅動動機**：S6 完成後，人工多次觸發與治理同步仍需手動維持，需建立一次到位續作能力。

### 流程摘要

1. **啟動**：使用 `openspec new` 建立 change，Scope = 一次啟動可完成接手→實作→驗證→治理留痕。
2. **契約定義**：定義「固定報告格式」（五段：Current state / Changes made / Validation / Open issues / Next step）；定義 runlog + handoff 為每輪必做、UI/UX 變更時補 uiux + qa。
3. **Cycle 迭代**：Cycle-01 到 Cycle-06 逐輪演進，每 Cycle 新增一個腳本化能力：
   - C01：固定五段報告驗證
   - C02：verb-first validate + fallback 驗證
   - C03：一鍵 governance 檢核腳本
   - C04：納入 template verify-only
   - C05：解決 UnicodeEncodeError 編碼問題
   - C06：roadmap 單一真源防回退檢核
4. **每 Cycle 同步**：每次 Cycle 完成後立即同步 runlog / handoff，不延後。
5. **最終封存**：C06 完成後進入 review gate → archive。

### 結果

- **strict validate**：PASS（多次跑，每次均 PASS）
- **主要產出**：4 個治理檢核腳本（`s7-cycle03~06-governance-check.ps1`）、固定報告契約、runlog/handoff 自動同步規則。
- **主要風險（實際觸發）**：C05 的 UnicodeEncodeError（Windows 編碼問題），透過 PowerShell `-Encoding utf8` 修補解除。
- **最終狀態**：已封存 ✅，作為 S7 治理自動化 MVP 基線。

### 評估

| 面向 | 評分 | 說明 |
|------|:----:|------|
| 流程可追溯性 | ★★★★★ | 每 Cycle 都有明確的 runlog 段落記錄，可逐 Cycle 重播 |
| 驗收明確性 | ★★★★★ | Cycle 驗收條件量化（腳本可一鍵跑），無歧義 |
| 治理同步完整性 | ★★★★★ | 每 Cycle 強制同步，無漂移 |
| 可重播性 | ★★★★☆ | 腳本可重播，但 C05 需要 PowerShell 環境（Windows 限定） |

---

## 差異分析

### 核心差異對照

| 面向 | 案例 A（規劃型） | 案例 B（實作型） |
|------|----------------|----------------|
| **觸發方式** | 里程碑事件驅動（S3 完成後） | 痛點驅動（人工觸發頻率過高） |
| **交付物形態** | 文件（定義、清單、摘要） | 腳本 + 契約（可執行物件） |
| **治理同步時機** | 收尾統一同步（有漂移風險） | 每 Cycle 即時同步（無漂移） |
| **迭代粒度** | 大任務（一輪完成） | 小 Cycle（C01–C06 漸進） |
| **驗收方式** | 人工核對 gate checklist | 腳本自動驗收 + 人工複核 |
| **風險觸發** | 治理文件漂移 | 環境問題（Windows 編碼） |
| **可重播性** | 需要人口頭補充步驟 | 腳本可一鍵重播 |

### 差異成因分析

1. **案例 A** 以「定義清楚就完成」為目標，導致中間步驟細粒度不足；適合需要高層次定義的規劃任務。
2. **案例 B** 以「可重播執行」為目標，每 Cycle 強制驗收，適合需要持續演進的實作任務。
3. 治理同步策略的差異（收尾同步 vs 即時同步）是最大風險分化點：收尾同步在多步驟任務中易造成漂移。

---

## 規則修正建議

> 基於差異分析，以下是對 `extraction-rules-v1.md` 和 `extraction-flow-v1.md` 的可操作修正點：

### 案例 A 帶出的修正點

**A-01（高優先）**：治理同步應在每個子任務完成後立即執行，而不是等到收尾。
- 修正：在 `extraction-flow-v1.md` Step 6 加入「每完成一個 task group 即觸發一次同步」說明。
- 驗證：runlog 與 handoff 的最後更新時間不應落後於最近一次任務完成時間超過 1 天。

**A-02（中優先）**：中間步驟的命令記錄應即時追加，不得事後重建。
- 修正：在 `extraction-rules-v1.md` 新增 R-13：「每個可執行步驟需在執行後 5 分鐘內寫入 runlog，不得事後補充」。
- 驗證：命令與 runlog 時間戳應連貫（同一 session）。

**A-03（低優先）**：三層 gate 的「治理文件一致性」層缺少自動化驗證，依賴人工判斷。
- 修正：在 `new-project-init-v1.md` 的初始化 checklist 中加入「建立治理一致性檢核腳本（參考 s7-cycle03）」。
- 驗證：有腳本且可一鍵執行。

### 案例 B 帶出的修正點

**B-01（高優先）**：腳本化檢核應成為 V1.5 標準流程的一部分，而非每 change 重新發明。
- 修正：將 `scripts/s7-cycle06-governance-check.ps1` 文件化為「標準治理檢核腳本」並在 `new-project-init-v1.md` 中引用。
- 驗證：新專案初始化後能直接執行該腳本並 PASS。

**B-02（高優先）**：Windows 環境的 PowerShell 編碼問題（UnicodeEncodeError）需要在初始化階段預設配置。
- 修正：在 `new-project-init-v1.md` 加入「PowerShell 編碼設定（`$OutputEncoding = [System.Text.Encoding]::UTF8`）」為必要初始化步驟。
- 驗證：執行腳本時不出現 UnicodeEncodeError。

**B-03（中優先）**：Cycle 迭代的粒度控制（每 Cycle 限定一個新增能力）值得推廣到所有實作型任務。
- 修正：在 `extraction-flow-v1.md` 新增「實作型任務建議採 Cycle 迭代，每 Cycle 限定一個可驗收的新增能力」說明。
- 驗證：任務分解後每個 Cycle 只有一個明確的 acceptance criteria。

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-26 | 初版。回顧 phase4（規劃型）與 phase7（實作型）兩案例，含差異分析與 6 條修正建議 |
