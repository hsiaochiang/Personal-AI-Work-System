# Skill: ux-auditor（UX 稽核員）

## 任務目標

針對已上線或開發完成的 Web 應用程式，執行完整的可用性稽核，找出「操作不直覺、流程不順、知識系統無法沉澱真正知識」的問題，輸出可供工程團隊直接執行的改善 Backlog。

## 前置條件

- 目標應用程式可在本機存取（URL + port）
- Node.js 可用（Playwright + axe-core 自動化掃描）
- 確認審查的北極星指標（預設：知識沉澱的完整度與可檢索性）
- 知道應用程式的主要功能頁面清單（5–10 個）

## 方法論

本 Skill 採用雙框架組合：

| 框架 | 觀點 | 適用情境 |
|------|------|---------|
| **Nielsen 10 Heuristics**（主）| 分析師角度，覆蓋整體 UI | 全頁面系統性審查 |
| **Cognitive Walkthrough 4 問**（輔）| 新使用者角度，聚焦可學習性 | 核心 Task Flow 逐步走查 |

**Cognitive Walkthrough 四問**（每步都回答）：

1. 使用者是否知道要達成什麼目標？（目標清晰度）
2. 正確的操作是否可見？（操作可見性）
3. 使用者是否理解操作的語意？（操作語意）
4. 完成後是否有進度回饋？（進度回饋）

## 嚴重程度

| 等級 | 定義 |
|------|------|
| P0 | 阻塞：功能壞掉、無障礙 critical，必須立即修復 |
| P1 | 嚴重 UX 問題，影響多數使用者核心任務 |
| P2 | 可注意但不阻塞，提升整體體驗 |
| P3 | 打磨建議，低優先 |

## 知識系統專用評估框架（可選）

> 當審查的目標是知識沉澱類應用時啟用此框架

**核心主張：知識 ≠ 文字**

| 評估問題 | 高品質（知識）| 低品質（只是文字）|
|---------|------------|-----------------|
| 系統是否讓使用者知道這是什麼類型的知識？ | 有語意分類且引導確認 | 直接存成文字段落 |
| 使用者能否在存入前審核和編輯知識結構？ | 可修改標題、分類、有效期 | 只能接受或拒絕 |
| 系統是否區分一時討論 vs 長期有效知識？ | 有有效期機制 | 全部平等存入 |
| 知識的上下文是否保留（來源、時間）？ | 保留來源和時間戳 | 只有文字內容 |
| 搜尋結果能讓使用者判斷知識有沒有用？ | 顯示分類、有效期、來源 | 只顯示文字片段 |
| 找到後是否有直接「使用」入口？ | 複製成可操作格式的按鈕 | 需自己解讀原始文字 |

## 工作流程（5 個 Phase）

### Phase A：準備與資料收集

1. 確認目標 URL 可存取，記錄頁面清單
2. 建立 `UXAuditOrchestrator/scripts/` 目錄，撰寫 `capture.mjs`（Playwright + axe-core）
3. 安裝依賴：`npm install playwright @axe-core/playwright`
4. 執行截圖腳本：每頁 3 viewport（1440 / 768 / 375）= N×3 張截圖
5. 執行 axe-core 無障礙掃描：每頁輸出 `docs/ux-review/data/axe-{page}.json`
6. 截圖輸出：`docs/ux-review/screenshots/{page}-{viewport}.png`

```js
// capture.mjs 最小範例
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';

const PAGES = [/* { name, path } */];
const VIEWPORTS = [{ w: 1440, h: 900 }, { w: 768, h: 1024 }, { w: 375, h: 812 }];

const browser = await chromium.launch();
for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    const pg = await browser.newPage();
    await pg.setViewportSize({ width: vp.w, height: vp.h });
    await pg.goto(`${BASE_URL}${page.path}`);
    await pg.screenshot({ path: `docs/ux-review/screenshots/${page.name}-${vp.w}.png`, fullPage: true });
    await pg.close();
  }
  // axe scan
  const pg = await browser.newPage();
  await pg.goto(`${BASE_URL}${page.path}`);
  const results = await new AxeBuilder({ page: pg }).withTags(['wcag2a','wcag2aa','best-practice']).analyze();
  fs.writeFileSync(`docs/ux-review/data/axe-${page.name}.json`, JSON.stringify({ page: page.name, violations: results.violations }, null, 2));
  await pg.close();
}
await browser.close();
```

### Phase B：Cognitive Walkthrough

1. 定義 3–5 個核心 Task Flows（代表最重要的使用者旅程）
2. 逐步走查每個 Task，觀看截圖並回答 4 問
3. 填寫 `docs/ux-review/user-journey-observation.md`
4. 知識系統：每個 Task 加入「知識品質觀察」表格

**輸出格式**：
```markdown
| 步驟 | 操作 | Q1 目標 | Q2 可見性 | Q3 語意 | Q4 回饋 | 判定 | 摩擦點 |
```

**判定標準**：任意一問 Fail → 該步判定 ❌

### Phase C：Heuristic Evaluation

1. 逐一對照 Nielsen 10 Heuristics 審查每個頁面
2. 每個發現對應到具體的截圖、HTML 元素、axe 違規
3. 填寫 `docs/ux-review/heuristic-review.md`

**每個發現必填欄位**：
- 頁面、問題描述、截圖、違反 Heuristic、嚴重程度、北極星影響、修正方向

**7 維度評分（1–5 分，滿分 35）**：

| 維度 | 對應 Heuristic |
|------|---------------|
| First Impression | H8 |
| Navigation & Flow | H3, H4 |
| Feedback & Status | H1, H9 |
| Trust & Polish | H4, H5 |
| Time to Value | H7 |
| Learnability | H2, H6 |
| Information Architecture | H8, H10 |

### Phase D：Improvement Backlog + 稽核報告

1. 將所有發現轉成工程可執行項目，填寫 `docs/ux-review/ux-improvement-backlog.md`
2. 每個項目**必須包含 Given/When/Then 驗收條件**，不接受「優化體驗」這類模糊描述
3. 依 P0→P3 排序；同級依北極星影響排序
4. 建立 `docs/ux-review/ux-audit-report.md`（綜合報告）

**Backlog 項目格式**：
```markdown
### [P{0-3}-{Category}-{序號}] {問題簡述}
**現狀**：{可觀察的具體行為}
**影響**：{對北極星指標的具體影響}
**修正建議**：{具體的 UI 元素/文案/互動規則}
**驗收條件**：
- Given {情境}
- When {操作}
- Then {預期結果}
**工作量估算**：XS / S / M / L
**北極星連結**：{連結到北極星指標的具體說明}
**來源發現**：{Heuristic ID / axe violation / CW-Task}
```

### Phase E：Skill 抽象化

1. 回顧本次稽核的執行過程，找出可重用的模式
2. 更新本 Skill 檔案（`.github/copilot/skills/ux-auditor.md`）
3. 將截圖腳本（capture.mjs）整理為可複用的模板
4. 記錄本次特有的北極星指標評估框架

## 輸出（必交付）

| 輸出文件 | Phase | 說明 |
|---------|-------|------|
| `docs/ux-review/00-audit-config.md` | 準備 | 稽核配置、Task Flow 定義、評估框架 |
| `docs/ux-review/screenshots/` | A | N×3 截圖 |
| `docs/ux-review/data/axe-{page}.json` | A | axe-core 掃描結果 |
| `docs/ux-review/user-journey-observation.md` | B | Cognitive Walkthrough 記錄 |
| `docs/ux-review/heuristic-review.md` | C | Nielsen 10 Heuristics 評估 |
| `docs/ux-review/ux-improvement-backlog.md` | D | 工程 Backlog（含 G/W/T）|
| `docs/ux-review/ux-audit-report.md` | D | 綜合報告（評分卡 + 結論）|

## 禁止事項

- 不得用「優化體驗」、「改善 UX」等模糊描述作為改善建議——必須具體說明 UI 元素、文案或互動規則
- 不得在沒有截圖或 axe 資料作為依據的情況下宣稱某個問題存在
- 不得跳過 Given/When/Then 驗收條件
- 知識系統稽核：必須明確判定「存入的是知識還是文字」，不接受「介於兩者之間」的模糊判定
- 不得只測 happy path——必須覆蓋 loading、error、empty state 等邊界情境

## 本次執行紀錄（PAIS 2026-05-01）

> 這一節記錄第一次執行此 Skill 的實際結果，作為未來執行的參考基準。

**目標**：PAIS PROD（http://localhost:3000）  
**北極星**：知識沉澱的完整度與可檢索性  
**總分**：16/35  
**最重要結論**：PAIS 目前是「存文字」系統，Extract + Memory 流程缺乏知識語意層  
**P0 發現**：1 件（extract `<select>` 無 accessible name）  
**P1 發現**：7 件（5 件直接影響北極星）  

**發現規律**：
- H1（系統狀態）和 H6（辨識非回憶）是違反最多的 Heuristic，這類工具型應用共同弱點
- 首頁設計為「系統監控儀表板」的應用普遍缺乏 onboarding 引導
- 知識系統的「存入前結構化」流程是與一般文字儲存系統最關鍵的 UX 差異點

**可複用的評估問題**（對任何知識沉澱類應用）：
1. 存入前是否有類型選擇？
2. 找到後是否有「複製給 AI」的操作入口？
3. 是否有有效期/新鮮度機制？
4. 搜尋結果是否有語意標記（不只是文字片段）？

**相關文件**：
- 完整稽核報告：`docs/ux-review/ux-audit-report.md`
- 執行計畫：`UXAuditOrchestrator/PLAN.md`
- 截圖腳本：`UXAuditOrchestrator/scripts/capture.mjs`
