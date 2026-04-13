# AGENTS-INDEX.md — Agent / Skill / Rule / Prompt 完整索引

> 最後審查：2026-04-13
> 狀態標記：✅ 活躍 | ⚠️ 待確認 | 🗃️ 已封存

---

## 目錄

1. [Agent 規格書](#1-agent-規格書)
2. [OpenSpec CLI Skills](#2-openspec-cli-skills)
3. [共享 Copilot Skills](#3-共享-copilot-skills)
4. [Rules](#4-rules)
5. [Prompts（#指令）](#5-prompts-指令)

---

## 1. Agent 規格書

路徑：`.github/agents/`

| Agent | 狀態 | 觸發情境 | 說明 |
|-------|------|---------|------|
| `WOS.agent.md` | ✅ | `/WOS`、`#session-start`、每次回來 | 主入口，快速上手代理 |
| `openspec-planner.agent.md` | ✅ | Codex Plan session | 規劃 change，輸出 scope + criteria |
| `openspec-executor.agent.md` | ✅ | Codex Execute session | 執行 change tasks |
| `review-gate.agent.md` | ✅ | Codex Review session | 最終收尾審查 |
| `knowledge-curator.agent.md` | ✅ | 貼入文章 / YouTube / 連結 | WKM 個人知識庫維護 |

---

## 2. OpenSpec CLI Skills

路徑：`.github/skills/`（每個是一個目錄，含 `SKILL.md`）

| Skill | 狀態 | 觸發情境 |
|-------|------|---------|
| `openspec-new-change` | ✅ | `/opsx-new "<name>"` — 建立新 change 目錄結構 |
| `openspec-ff-change` | ✅ | `/opsx-ff` — 快速產出所有 artifacts（proposal/design/spec/tasks） |
| `openspec-apply-change` | ✅ | `/opsx-apply "<name>"` — 逐步執行 tasks |
| `openspec-verify-change` | ✅ | `/opsx-verify "<name>"` — 驗證實作完整性 |
| `openspec-archive-change` | ✅ | `#opsx-archive` — 歸檔已完成 change |
| `openspec-continue-change` | ✅ | 繼續進行中的 change | 
| `openspec-explore` | ✅ | 思考探索、釐清需求不確定時 |
| `openspec-propose` | ✅ | 一步產出完整 proposal（含 design/spec/tasks） |
| `openspec-sync-specs` | ✅ | `#opsx-sync` — 將 delta spec 同步回 main specs |
| `openspec-bulk-archive-change` | ✅ | 一次歸檔多個已完成 changes |
| `openspec-onboard` | ⚠️ | 新人導引（目前僅自用，不常用） |

---

## 3. 共享 Copilot Skills

路徑：`.github/copilot/skills/`

| Skill | 狀態 | 觸發情境 | 說明 |
|-------|------|---------|------|
| `openspec-conductor.md` | ✅ | `OpenSpec Executor` agent | 協調 change 完整生命週期 |
| `code-reviewer.md` | ✅ | `#code-review` | 安全、可讀性、一致性審查 |
| `smoke-tester.md` | ✅ | `#smoke-test` | 每次 change 收尾的基礎驗證 |
| `git-steward.md` | ✅ | `#commit-push` | 規範 commit 格式 + push |
| `debug-sheriff.md` | ✅ | Bug 修復任務 | 根因分析 + 最小 fix |
| `deploy-conductor.md` | ✅ | `#deploy-prepare/execute/verify` | 布版完整流程 |
| `ui-designer.md` | ✅ | `#ui-review`（UI 類 change） | UI 審查 |
| `ux-fullstack-engineer.md` | ✅ | `#ux-review`（UX 類 change） | UX 流程審查 |
| `scribe.md` | ✅ | `#session-close` | Session 收尾，產出 experience slides |
| `upgrade-advisor.md` | ✅ | `#template-upgrade` | Copilot Template 升級顧問 |
| `knowledge-extractor.md` | ✅ | WKM 知識抽取（文章/影片） | 知識庫整理 |
| `ingest-content.md` | ✅ | 導入內容到知識庫 | WKM 相關 |
| `triage-link.md` | ✅ | 判斷連結值不值得深讀 | WKM 相關 |
| `wilson-perspective.md` | ✅ | 以 Wilson 觀點分析議題 | WKM 相關 |

---

## 4. Rules

路徑：`.github/copilot/rules/`（自動套用，不需手動觸發）

| Rule 檔案 | 說明 | 重要度 |
|-----------|------|--------|
| `10-style-guide.md` | UI Style Contract（顏色/字體/間距） | UI change 必讀 |
| `20-ux-flow.md` | UX 流程規範 | UX change 必讀 |
| `30-debug-contract.md` | Bug 診斷合約 | Bug fix 必讀 |
| `35-quality-gate.md` | Done 的定義（Done Gate） | 每個 change 必讀 |
| `36-scope-guard.md` | 防止超出 scope 的護欄 | 每次規劃必讀 |
| `40-roadmap-governance.md` | Version Brief 治理規則 | 規劃模式必讀 |
| `50-tech-stack.md` | 技術棧定義（Node.js/Gemini/版本） | 實作時必讀 |
| `60-testing.md` | 測試規範（smoke test 標準） | 驗證時必讀 |
| `70-openspec-workflow.md` | Change Lifecycle 完整流程 | 開發模式必讀 |
| `75-deploy-governance.md` | 布版治理（tag/release/驗證） | Deploy 必讀 |
| `80-template-boundary.md` | Copilot Template vs PAIS 邊界 | 跨 repo 時必讀 |
| `85-agent-skill-authoring.md` | 撰寫 agent/skill/rule 的規範 | 建立新 agent 時必讀 |
| `90-project-custom.md` | PAIS 專屬規則 | 常駐 |

---

## 5. Prompts（#指令）

路徑：`.github/copilot/prompts/`（在 VS Code Chat 輸入 `#指令名稱` 觸發）

| Prompt | 觸發指令 | 說明 |
|--------|---------|------|
| `session-start.prompt.md` | `#session-start` | 開工初始化，讀取所有上下文 |
| `session-close.prompt.md` | `#session-close` | Session 收尾，產出 experience slides |
| `status.prompt.md` | `#status` | 更新 roadmap + runlog |
| `opsx-new.prompt.md` | `#opsx-new` | 建立新 change |
| `opsx-ff.prompt.md` | `#opsx-ff` | 快速產出 change artifacts |
| `opsx-apply.prompt.md` | `#opsx-apply` | 執行 change tasks |
| `opsx-verify.prompt.md` | `#opsx-verify` | 驗證 change 完整性 |
| `opsx-archive.prompt.md` | `#opsx-archive` | 歸檔完成的 change |
| `opsx-sync.prompt.md` | `#opsx-sync` | 同步 delta spec |
| `opsx-explore.prompt.md` | `#opsx-explore` | 進入探索模式 |
| `opsx-validate.prompt.md` | `#opsx-validate` | 驗證 artifacts 品質 |
| `code-review.prompt.md` | `#code-review` | Code review |
| `smoke-test.prompt.md` | `#smoke-test` | 冒煙測試 |
| `commit-push.prompt.md` | `#commit-push` | 規範 commit + push |
| `log-decision.prompt.md` | `#log-decision` | 記錄決策到 decision-log |
| `ui-review.prompt.md` | `#ui-review` | UI 審查 |
| `ux-review.prompt.md` | `#ux-review` | UX 審查 |
| `codex-prompts-generate.prompt.md` | `#codex-prompts-generate` | Brief 確認後產出 Codex 三角色提示詞 |

---

## 維護說明

- 本文件由人工維護，每次新增/移除 agent/skill/rule 時同步更新
- 狀態從 ✅ 改為 🗃️ 時，對應的文件應移到 `.github/_archive/` 或 `docs/_archive/`
