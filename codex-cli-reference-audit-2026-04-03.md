# Codex CLI 引用能力檢查報告

日期：2026-04-03

## 目的

本報告檢查目前 repo 的檔案結構與內容，回答以下問題：

1. 在 `Codex CLI` 執行時，是否能引用目前設計的相關檔案
2. 哪些入口已經可靠
3. 哪些路徑雖然存在，但不能假設會自動生效
4. 接下來應如何收斂成更穩定的 Codex CLI 工作方式

---

## 結論摘要

### 總結判斷

目前這個 repo 對 `Codex CLI` 的支援是：

- **可用，但尚未完全收斂**
- `AGENTS.md` 已可作為可靠的共享入口
- `.github/agents/*.agent.md`、`.github/skills/*`、`.github/copilot/skills/*` **可以被讀取引用**
- 但 `CODEX.md` 與 `.codex/instructions.md` **目前不能假設會被 Codex CLI 自動載入**
- `.codex/skills` 雖然存在，但**不符合官方 repo-native skills 掃描路徑**，不應視為長期穩定方案
- `docs/agents/codex-prompts/v{N}/` 在文件中被引用，但目前實體目錄不存在，屬於**斷鏈引用**

### 一句話版本

如果今天就用 `Codex CLI` 開工，**最可靠的做法仍然是讓 CLI 先自動吃到 `AGENTS.md`，再用 prompt 顯式讀 `CODEX.md`、角色規格書、skills 與 rules**；目前不應假設 `CODEX.md` 或 `.codex/instructions.md` 會自己進 prompt chain。

---

## 檢查範圍

本次檢查包含以下路徑與內容：

- `AGENTS.md`
- `CODEX.md`
- `.codex/instructions.md`
- `.codex/skills/`
- `.github/agents/`
- `.github/skills/`
- `.github/copilot/skills/`
- `.github/copilot/rules/`
- `docs/agents/codex-cli-init.md`
- `docs/agents/codex-prompts/`
- `~/.codex/config.toml`
- `codex exec` 實測結果

---

## 實際檢查結果

## 1. `AGENTS.md`：可作為可靠入口

### 狀態
- 檔案存在
- 內容完整
- 已明確定義 Codex 路線：`CODEX.md` + `docs/agents/codex-cli-init.md`

### 判斷
`AGENTS.md` 是目前最可靠的 repo-level 指令入口。

### 原因
根據 OpenAI 官方文件，Codex CLI 會自動發現並讀取 `AGENTS.md`：
- 官方說明：Codex 會先讀 `AGENTS.md`，並沿 repo root 到 cwd 建立 instruction chain
- 來源：OpenAI Developers, AGENTS.md guide

本次 `codex exec` 實測也顯示：
- `AGENTS.md` 被辨識為 active

### 結論
- **可以依賴**
- 若要讓 Codex CLI 穩定進 repo 規則，`AGENTS.md` 應繼續作為主入口

---

## 2. `CODEX.md`：存在，但目前不能假設自動載入

### 狀態
- 檔案存在
- 內容明確列出 role specs、skills、rules 與 codex-cli-init 路徑

### 判斷
`CODEX.md` 目前比較像**人工或 prompt 顯式讀取的 Codex 導覽文件**，而不是已確認會自動生效的 repo instructions。

### 原因
官方 AGENTS.md 文件指出：
- Codex CLI 預設自動發現的是 `AGENTS.override.md`、`AGENTS.md`
- 其他檔名必須透過 `project_doc_fallback_filenames` 設定為 fallback names

本機 `~/.codex/config.toml` 檢查結果：
- **沒有** `project_doc_fallback_filenames = ["CODEX.md"]`

本次 `codex exec` 實測結果也回報：
- `CODEX.md` 存在，但不在當前 active instructions chain 中

### 結論
- **可讀，但不可假設自動生效**
- 現階段應視為 prompt 顯式引用的輔助入口，而不是 CLI 保證自動載入的檔案

---

## 3. `.codex/instructions.md`：存在，但目前不能假設會被 CLI 自動讀取

### 狀態
- 檔案存在
- 內容設計合理，屬於 thin entrypoint
- 包含 startup sequence、skills、handoff policy、hard limits、tech stack、project layout

### 判斷
這份檔案的內容本身有價值，但**目前沒有足夠證據證明 Codex CLI 會自動把它當 repo instructions 載入**。

### 原因
官方 AGENTS.md 文件沒有提到：
- `CODEX.md` 預設自動發現
- `.codex/instructions.md` 預設自動發現

而是明確描述 instruction discovery 以 `AGENTS.md` / fallback filenames 為主。

本次 `codex exec` 實測中，模型甚至回報 `.codex/instructions.md` 不在 active chain；雖然這次回報有受它自身搜尋方法影響的可能，但至少可以確定：
- **不能依賴這份檔案會穩定自動生效**

### 結論
- **內容可用**
- **自動載入不可靠**
- 若要發揮作用，建議透過 prompt 顯式要求讀取，或調整 Codex discovery 策略

---

## 4. `.github/agents/*.agent.md`：可以被引用，但不是 Codex 原生 agent

### 狀態
存在以下角色檔：
- `.github/agents/WOS.agent.md`
- `.github/agents/openspec-planner.agent.md`
- `.github/agents/openspec-executor.agent.md`
- `.github/agents/review-gate.agent.md`

### 判斷
這些檔案目前是**可讀取的角色規格書**，但不是 Codex CLI 會自動註冊的原生 agents。

### 原因
- 目前 repo 中沒有 Codex 原生 custom agents 註冊結構
- `CODEX.md` 與 `codex-cli-init.md` 也已明確把這些檔案描述為 role specs，而非 native agents

### 結論
- **可以引用**
- **不應期待自動出現在 agent selector 或 `@planner` 之類的語法裡**
- 現行做法正確：由 prompt 顯式要求讀取，再依 spec 行動

---

## 5. `.github/skills/`：可被讀取，適合作為 canonical OpenSpec skills 來源

### 狀態
存在以下 skills：
- `.github/skills/openspec-propose/SKILL.md`
- `.github/skills/openspec-explore/SKILL.md`
- `.github/skills/openspec-apply-change/SKILL.md`
- `.github/skills/openspec-archive-change/SKILL.md`

### 判斷
這一組檔案**可被 Codex 讀取引用**，而且與 `AGENTS.md`、`CODEX.md` 中的 canonical 路徑一致。

### 結論
- **可以作為明確引用來源**
- 但目前仍屬「prompt / role spec 顯式讀取」路線，不代表是 Codex CLI 原生自動技能

---

## 6. `.github/copilot/skills/`：可被讀取，但屬於共享 Markdown skill 文件，不是 Codex 原生 skill 目錄

### 狀態
存在以下共享技能：
- `openspec-conductor.md`
- `code-reviewer.md`
- `smoke-tester.md`
- `git-steward.md`
- `debug-sheriff.md`
- `ui-designer.md`
- `ux-fullstack-engineer.md`
- `scribe.md`

### 判斷
這些檔案可被 Codex 讀取引用，但本質上仍是共享 Markdown workflow 文件。

### 結論
- **可以讀**
- **可作為角色執行時的補充規範**
- **不應視為 Codex CLI 自動 skills 掃描目錄**

---

## 7. `.codex/skills/`：實體存在，但不符合官方 repo-native skill discovery 路徑

### 狀態
存在以下本地 skills：
- `.codex/skills/openspec-propose/SKILL.md`
- `.codex/skills/openspec-explore/SKILL.md`
- `.codex/skills/openspec-apply-change/SKILL.md`
- `.codex/skills/openspec-archive-change/SKILL.md`

### 判斷
這些 skills **目前可見、可讀**，但對 Codex CLI 而言，這個位置不是官方 repo-native 掃描位置。

### 原因
官方 skills 文件指出：
- Codex 在 repo 中掃描的是 `.agents/skills`
- repo root、父層、cwd 都是 `.agents/skills`
- 使用者層是 `$HOME/.agents/skills`

官方文件並未把 `.codex/skills` 列為 repo-native 掃描位置。

### 結論
- **目前可作為本地參考副本**
- **不應作為長期唯一依據**
- 若未來要做 Codex-native skill discovery，應收斂到 `.agents/skills`

---

## 8. `.agents/skills/`：目前缺失

### 狀態
- 目錄不存在

### 判斷
這是目前結構上最重要的一個缺口。

### 原因
官方文件明確寫出：
- repo-native skills 應放在 `.agents/skills`

但目前 repo 沒有這個目錄，因此：
- 不能依賴 Codex CLI 的原生 repo skill 掃描能力
- 目前仍只能靠 `AGENTS.md` / `CODEX.md` / prompt 顯式讀取其他位置的 skill 文件

### 結論
- **這是目前最明顯的結構缺口**

---

## 9. `docs/agents/codex-prompts/v{N}/`：目前是斷鏈引用

### 狀態
- `CODEX.md` 提到：`docs/agents/codex-prompts/v{N}/`
- `docs/agents/codex-cli-init.md` 也提到可直接使用這些 per-change prompts
- 但實體目錄目前不存在

### 判斷
這代表目前文件設計已有方向，但生成物尚未落地。

### 影響
- 使用者讀到 `CODEX.md` 時會以為提示詞已備好
- 實際上需要另外執行生成步驟或手動建立

### 結論
- **屬於已規劃但未落地的斷鏈**
- 在沒有生成前，不應把這個目錄當成現成可用入口

---

## 實測結果摘要

## `codex exec` 實測 1：instruction sources

實測 prompt：
- 要求 Codex 列出它對此 repo 載入的 instruction files，並明確回答 `AGENTS.md`、`CODEX.md`、`.codex/instructions.md` 是否 active

### 結果
- `AGENTS.md`：active
- `CODEX.md`：存在，但不 active
- `.codex/instructions.md`：不在 active chain

### 解讀
這個結果至少支持一件事：
- **目前不能假設 `CODEX.md` 或 `.codex/instructions.md` 會自動進入 CLI prompt chain**

## `codex exec` 實測 2：skill visibility

實測 prompt：
- 要求 Codex 列出它可看到的 `.codex/skills`、`.agents/skills`、`.github/skills`、`.github/copilot/skills`

### 結果
- `.codex/skills`：可見
- `.agents/skills`：缺失
- `.github/skills`：可見
- `.github/copilot/skills`：可見

### 解讀
這個結果證明：
- **這些檔案可以被 CLI 讀到**
- 但「可被讀到」不等於「會被當作原生 skills 自動啟用」

---

## 建議

## 建議 1：繼續把 `AGENTS.md` 當唯一可靠自動入口

目前最穩定的做法是：
- 讓 `AGENTS.md` 承擔 repo-level 自動 discovery 的責任
- 其他檔案都視為顯式引用文件

### 原因
這符合：
- 官方 discovery 規則
- 目前本機 config 狀態
- `codex exec` 實測結果

---

## 建議 2：不要把 `CODEX.md` 當成會自動生效的檔案

`CODEX.md` 可以保留，但應明確定位為：
- Codex 專用導覽文件
- prompt 顯式讀取用的薄入口

不應把它寫成「只要存在，CLI 就會自動吃到」。

### 若要讓它自動生效
要嘛：
- 在 `~/.codex/config.toml` 加入 `project_doc_fallback_filenames = ["CODEX.md"]`

要嘛：
- 把其必要內容回收進 `AGENTS.md`

目前 repo 並未採取前者，因此不能假設它自動生效。

---

## 建議 3：不要把 `.codex/instructions.md` 當成 CLI 的主入口

這份文件內容可保留，但應視為：
- 補充說明
- 人工或 prompt 顯式讀取入口

而不是 CLI 保證會自動載入的 repo instructions。

---

## 建議 4：若要走 Codex-native skills，應新增 `.agents/skills/`

目前最有技術含量、也最值得長期做對的調整，是把 repo-native skills 收斂到官方掃描位置：
- `.agents/skills/`

### 建議方向
- 將真正希望 Codex 原生發現的 skills 放到 `.agents/skills/`
- `.github/skills/` 可保留作 canonical source
- `.codex/skills/` 若只是過渡副本，應避免未來與 canonical source 漂移

### 關鍵點
不是說現在不能用 `.github/skills/` 或 `.codex/skills/`，而是：
- **若你想要 CLI 原生 skill discovery，更合理的結構是 `.agents/skills/`**

---

## 建議 5：補齊 `docs/agents/codex-prompts/v{N}/`，或先移除該引用

目前這個目錄在文件中已被宣稱存在，但實際不存在。

有兩種收斂方式：

### 方式 A：補齊生成結果
- 真的生成 `docs/agents/codex-prompts/v{N}/...`
- 讓 `CODEX.md` 與 `codex-cli-init.md` 的描述成真

### 方式 B：在生成前不要宣稱已存在
- 把文字改成「可由某 prompt 生成」
- 避免使用者以為它是現成入口

目前以 audit 角度看，這屬於文件與實體結構不一致。

---

## 建議 6：短期內的最穩工作方式

在目前結構下，最穩的 Codex CLI 工作方式應是：

1. `Codex CLI` 自動讀 `AGENTS.md`
2. 第一個 prompt 顯式要求讀：
   - `CODEX.md`
   - `docs/agents/codex-cli-init.md`
   - 對應角色的 `.github/agents/*.agent.md`
3. 需要 skill/rule 時，再顯式讀：
   - `.github/skills/*`
   - `.github/copilot/skills/*`
   - `.github/copilot/rules/*`
4. 不假設 `.codex/instructions.md` 會自動進入 prompt chain
5. 不假設 `.codex/skills/` 會被當作官方 repo-native skills 自動掃描

這是目前最符合現況、也最不容易誤判的運作方式。

---

## 最終判斷

### 現在能不能引用相關檔案？
**可以。**

但要分清楚兩件事：

### 1. 可以被讀到的檔案
以下都可以被 Codex CLI 在 repo 中讀取：
- `AGENTS.md`
- `CODEX.md`
- `.github/agents/*.agent.md`
- `.github/skills/*`
- `.github/copilot/skills/*`
- `.github/copilot/rules/*`
- `.codex/skills/*`
- `.codex/instructions.md`

### 2. 可被自動發現並納入 instruction / skill chain 的檔案
目前可明確認定可靠的只有：
- `AGENTS.md`

其餘檔案大多屬於：
- 存在
- 可被顯式讀取
- 但不應假設會自動生效

## 最後一句結論

目前這個 repo 已經具備讓 `Codex CLI` 工作的必要材料，但還沒有完全對齊 Codex 官方的原生 discovery 規則；因此**短期可用，長期仍建議收斂入口與 skill 路徑**，尤其是 `CODEX.md` 自動載入期待、`.codex/skills` 路徑，以及缺失的 `.agents/skills/` 與 `docs/agents/codex-prompts/v{N}/`。

---

## 參考資料

- OpenAI Developers, Codex CLI: https://developers.openai.com/codex/cli
- OpenAI Developers, AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- OpenAI Developers, Skills: https://developers.openai.com/codex/skills
