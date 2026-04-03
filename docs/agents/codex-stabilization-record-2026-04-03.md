# Codex CLI 支援修補記錄

> 日期：2026-04-03  
> 觸發背景：v1.7.0 模板升級後，GitHub Copilot Coding agent review 指出多項缺陷。

---

## 思考過程

### 核心認知修正：「Codex」有兩個不同工具

本次修補最重要的發現是 Codex CLI review 文件本身存在工具認知混淆：

| 工具 | 自動讀取機制 | Skills native path |
|------|------------|-------------------|
| GitHub Copilot Coding agent（VS Code agent mode） | `.codex/instructions.md` | 不適用 |
| OpenAI Codex CLI（terminal `codex` 指令） | `AGENTS.md` | `.agents/skills/` |

Codex CLI review 以 OpenAI Codex CLI 視角評估，但 `.codex/instructions.md` 是由 GitHub Copilot Coding agent 自動建立、自動讀取的，因此「`.codex/instructions.md` 自動載入證據不足」這個 finding，對 OpenAI Codex CLI 是正確的，對 GitHub Copilot Coding agent 則不是缺陷。

### 分類優先順序

所有問題分兩類：

**非 Codex 問題（升級 Bug）**：由 v1.7.0 升級直接造成，會影響任何 AI 工具使用者

**Codex 問題（結構缺口）**：與 Codex 工具支援相關，不影響 Copilot Chat 使用者

---

## 執行細節

### P0：Bug 修復（v1.7.0 升級造成）

#### Bug A：`deploy-conductor.md` + `upgrade-advisor.md` 缺檔
- **根本原因**：模板 v1.7.0 的 `AGENTS.md`（managed file）新增了兩個 skill 條目，但 skill 實體檔案未加入 `template_src/`，未隨升級推送到目標專案
- **解法（方案 B，立即修）**：直接從模板複製到目標專案 `.github/copilot/skills/`
- **信心度**：High
- **驗證**：`Get-ChildItem` 確認兩個檔案出現在 `.github/copilot/skills/`

#### Bug B：`10-style-guide.md` FROZEN → PENDING 回退
- **根本原因**：managed file 升級覆蓋了專案特定狀態欄位（設計邊界問題）
- **解法**：直接改回 `FROZEN`，備註確認日期 2026/4/2 Wilson
- **信心度（立即修）**：High
- **結構問題**：已記錄於 `docs/agents/codex-known-limitations.md`（L2），需模板版本另行規劃

---

### P1：文件修正

#### `.codex/instructions.md` 語意澄清
- 開頭說明改為：「GitHub Copilot Coding agent 自動讀取」
- 加入：「OpenAI Codex CLI 使用者：請用 `AGENTS.md`」
- Skills 路徑改為指向 `.github/skills/`（canonical），`.codex/skills/` 說明為本地副本

#### `CODEX.md` 定位修正
- 標題補充：「需手動貼入或顯式讀取」
- 說明：Codex CLI 預設不自動載入，除非設定 per-machine config
- `codex-prompts` 路徑說明改為「若已生成，路徑為...」

#### `TEMPLATE-FILES.md` 指令語境修正
- 在 Safe Upgrade 段落加入警告：「以下指令從模板 repo 目錄執行」
- 補充 `orchestrate.py` batch 執行方式

---

### P2：結構補強

#### `.agents/skills/` 建立（OpenAI Codex CLI native path）
- 建立 `.agents/skills/openspec-{propose,explore,apply-change,archive-change}/SKILL.md`
- 內容與 `.github/skills/` 相同（canonical source）
- Windows 無法 symlink，採用內容複製方式
- `.codex/skills/README.md` 加入說明各平台正確 skills 路徑

#### `docs/agents/codex-prompts/v3/` 生成
- v3-brief.md 確認日期：2026/4/2 Wilson ✅
- 6 個 change × 3 個角色 = 18 個提示詞 MD 檔
- Changes：`conversation-schema-definition`、`plain-text-adapter-refactor`、`chatgpt-adapter`、`local-import-vscode-copilot`、`source-attribution-in-memory`、`import-ui-multi-source`
- 每個提示詞採固定格式：先讀 `AGENTS.md` → 讀 `CODEX.md` → 讀 handoff/roadmap → 讀 v3-brief → 讀對應 role spec

---

## 修改檔案清單

| 檔案 | 操作 | 說明 |
|------|------|------|
| `.github/copilot/skills/deploy-conductor.md` | 新增（複製） | Bug A 修復 |
| `.github/copilot/skills/upgrade-advisor.md` | 新增（複製） | Bug A 修復 |
| `.github/copilot/rules/10-style-guide.md` | 修改 | Bug B 修復：PENDING → FROZEN |
| `.codex/instructions.md` | 修改 | 澄清工具平台語意，修正 skills 路徑 |
| `CODEX.md` | 修改 | 更正自動載入語氣，修正 codex-prompts 描述 |
| `TEMPLATE-FILES.md` | 修改 | 加入指令執行語境說明 |
| `.agents/skills/openspec-propose/SKILL.md` | 新增 | OpenAI Codex CLI native path |
| `.agents/skills/openspec-explore/SKILL.md` | 新增 | OpenAI Codex CLI native path |
| `.agents/skills/openspec-apply-change/SKILL.md` | 新增 | OpenAI Codex CLI native path |
| `.agents/skills/openspec-archive-change/SKILL.md` | 新增 | OpenAI Codex CLI native path |
| `.codex/skills/README.md` | 新增 | 說明各平台 skills 路徑定位 |
| `docs/agents/codex-prompts/v3/`（18 個檔） | 新增 | v3 六組 change 的三角色提示詞 |
| `docs/agents/codex-known-limitations.md` | 新增 | 無法解決的限制說明（L1、L2、L3） |

---

## 結果與信心度

| 問題 | 解法 | 信心度 | 備註 |
|------|------|--------|------|
| Bug A：缺少兩個 skill | 直接複製 | ✅ High | 已驗證檔案存在 |
| Bug B：FROZEN 回退 | 直接改回 | ✅ High | 立即生效 |
| `.codex/instructions.md` 語意 | 修改說明 | ✅ High | 無需測試 |
| `CODEX.md` 定位 | 修改說明 | ✅ High | 無需測試 |
| `TEMPLATE-FILES.md` 語境 | 加說明 | ✅ High | 無需測試 |
| `.agents/skills/` 建立 | 複製內容 | ✅ High（建立）/ ⚠️ Medium（native 生效） | 需 Codex CLI 實測確認 |
| `codex-prompts/v3/` | 生成 18 個檔 | ✅ High | v3-brief 確認日期 2026/4/2 |
| `CODEX.md` 自動載入 | ❌ 無法解決 | — | per-machine config（L1） |
| style-guide 邊界設計 | ❌ 未完整解決 | — | 需模板版本規劃（L2） |

---

## 後續待辦

1. **`.agents/skills/` 實測**：在 Codex CLI session 中確認 4 個 skill 是否被 native discovery 辨識
2. **Bug A 長期修補**：在模板 `template_src/` 加入 `deploy-conductor.md` 和 `upgrade-advisor.md`（下一版升級時自動部署）
3. **L2 結構修補**：討論如何讓 style-guide 狀態不被升級覆蓋（須模板版本規劃）
