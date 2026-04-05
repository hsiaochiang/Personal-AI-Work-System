# Source Docs Index

> 每個手冊章節對應的來源文件。供 write-user-manual skill 在撰寫各節時參考。
>
> 文件分兩種：★★★ 必讀（事實依據）、★★ 背景讀（理解設計動機）

---

## 全域背景（開始任何章節前先讀）

| 文件 | 優先級 | 提供的核心資訊 |
|------|--------|---------------|
| `docs/system-manual.md` | ★★★ | 所有功能的 What + How + Limitations；是唯一的 canonical source |
| `docs/planning/v5-brief.md` | ★★★ | 當前版本邊界、7 項驗收條件、Out of Scope 清單 |
| `docs/planning/v4-brief.md` | ★★ | Memory Health / Governance / 規則衝突為什麼存在 |
| `docs/planning/v3-brief.md` | ★★ | 多工具整合設計動機；ConversationDoc schema 為何這樣設計 |
| `docs/planning/v1-brief.md` | ★ | 系統核心問題陳述（「在多個 AI session 間保持上下文連續性」） |

---

## 章節對應來源

| 手冊章節 | 必讀來源 | 背景補充 |
|----------|----------|---------|
| **1. 快速開始** | `docs/system-manual.md`（Quick Start 段落）、`docs/product/user-guide-current.md` | `docs/planning/v1-brief.md`（了解系統定位，幫助寫好介紹段落） |
| **2.1 Overview** | `docs/system-manual.md`（Overview + 治理排程段落） | `docs/planning/v4-brief.md`（治理功能的設計動機） |
| **2.2 Handoff Builder** | `docs/system-manual.md`（Handoff Builder 段落）、`docs/product/user-guide-current.md` | — |
| **2.3 Extract — 概述** | `docs/system-manual.md`（Extract 段落，含所有 V3/V5 改善記錄）、`docs/workflows/conversation-schema.md` | `docs/planning/v3-brief.md`（為何需要統一 adapter 層） |
| **2.3 — ChatGPT JSON** | `docs/qa/2026-04-04_chatgpt-api-auto-import-smoke.md` | — |
| **2.3 — ChatGPT API** | `docs/qa/2026-04-04_chatgpt-api-auto-import-smoke.md`、`docs/planning/v5-brief.md`（驗收條件 3、4） | — |
| **2.3 — Gemini** | `docs/qa/2026-04-04_gemini-adapter-smoke.md` | `docs/planning/v3-brief.md`（半自動 import 的設計意圖） |
| **2.3 — Claude** | `docs/qa/2026-04-04_claude-adapter-smoke.md` | — |
| **2.3 — Copilot** | `docs/system-manual.md`（V3 Change 4 段落） | `docs/planning/v3-brief.md`（auto-import 的設計動機） |
| **2.4 Memory** | `docs/system-manual.md`（Memory + Shared Knowledge 段落） | `docs/planning/v4-brief.md`（Memory Health 為何存在） |
| **2.5 Decisions** | `docs/system-manual.md`（Decisions 段落） | `docs/planning/v4-brief.md`（規則衝突偵測的設計動機） |
| **2.6 Settings / API Key** | `docs/system-manual.md`（Settings 段落）、`docs/planning/v5-brief.md`（安全邊界、驗收條件 5） | — |
| **3. 多工具整合指南** | `docs/planning/v5-brief.md`（scope + 驗收條件）、全部 QA 報告 | `docs/planning/v3-brief.md`（多工具整合的整體設計思路） |
| **4. 已知限制** | `docs/system-manual.md`（已知限制段落）、`docs/planning/v5-brief.md`（Out of Scope） | — |

---

## QA 報告位置

```
docs/qa/
├── 2026-04-04_gemini-adapter-smoke.md
├── 2026-04-04_claude-adapter-smoke.md
└── 2026-04-04_chatgpt-api-auto-import-smoke.md
```

---

## 重要注意事項

- **不寫 Out of Scope 的功能**：`v5-brief.md` Out of Scope 清單的任何功能都不應出現在手冊中
- **Limitations 必須準確**：`system-manual.md` 的「已知限制」段落是唯一依據，不要根據推測補充
- **設計動機只用於幫助解釋，不直接引用**：v3/v4 briefs 幫你理解功能，但手冊內容應聚焦操作步驟，不引述設計文件原文
