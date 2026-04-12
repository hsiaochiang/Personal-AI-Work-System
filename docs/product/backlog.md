# Product Backlog — Personal AI Work System

> 需求來源：`docs/product/inbox/`  
> 此文件在每個迭代週期起點更新一次（詳見 `docs/guides/iteration-cadence.md`）  
> 最後更新：2026-04-11

---

## 🔴 下版納入（已確認）

> 待 V6 版本規劃時確認。目前 inbox 中的已知需求列於「未來考慮」待評審。

（空）

---

## 🟡 未來考慮（待評審）

| 優先序 | 標題 | 來源 inbox | 類型 | 備註 |
|:---:|---|---|---|---|
| 1 | Claude adapter 同樣需要 fallback 機制 | — | bug | Gemini 修法可直接套用 Claude，目前尚未修 |
| 2 | `/extract` 信心分數邏輯需要對使用者更透明 | — | ux-improvement | 現在只是 regex 命中率，但呈現像「準確率」 |
| 3 | 候選提取引擎召回率偏低 | — | feature | 使用者貼入完整對話但提取候選只有 2~3 筆的問題 |
| 4 | Gemini / Claude API auto-import | — | feature | 目前只支援貼上；補齊 API key 機制 |
| 5 | 治理待辦的 lastReviewedOn 應能從 UI 更新 | — | ux-improvement | 目前需手動改 governance.json |

---

## ⚪ 觀望中（未決）

| 優先序 | 標題 | 來源 inbox | 類型 | 備註 |
|:---:|---|---|---|---|
| — | 多人協作 / 雲端化 | — | feature | 超出現有本機架構，等需求明確再評估 |
| — | ChatGPT account-wide auto discovery | — | feature | API 限制，技術可行性待確認 |

---

## ✅ 已納入版本（歸檔）

| 版本 | 標題 | 來源 inbox | 完成日期 |
|---|---|---|---|
| V5 patch (1.1.2) | Gemini adapter 貼入片段內容時拋錯 | [2026-04-10-gemini-adapter-fallback.md](inbox/2026-04-10-gemini-adapter-fallback.md) | 2026-04-10 |
| V5 patch (1.1.2) | /extract 審核候選流程 UX 設計缺失 | [2026-04-10-extract-review-ux.md](inbox/2026-04-10-extract-review-ux.md) | 2026-04-10 |
| V5 patch (1.1.2) | Review Gate 未要求多步驟流程端到端審查 | [2026-04-10-review-gate-coverage-gap.md](inbox/2026-04-10-review-gate-coverage-gap.md) | 2026-04-10 |

---

## 如何新增需求到 Inbox

1. 複製 `docs/product/inbox/_TEMPLATE.md`
2. 以 `YYYY-MM-DD-<slug>.md` 命名存入 `docs/product/inbox/`
3. 或直接告訴 Copilot：

```
我想記錄一個產品想法：[描述問題或想法]
請幫我建立一份 inbox 需求文件。
```
