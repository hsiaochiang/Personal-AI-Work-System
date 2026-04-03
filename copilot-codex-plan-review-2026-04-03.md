# GitHub Copilot 所規劃的 Codex CLI 導入方案 Review

日期：2026-04-03

## Review 結論

整體方向是**可行的**，而且有幾個核心判斷是正確的：
- 以 `AGENTS.md` 作為共享規則主體
- 把 `.github/agents/*.agent.md` 當作角色規格書，而不是強行假設 Codex 有 Copilot 式 agent registry
- 使用 `Planner -> Executor -> Review Gate` 的三角色 session 切分
- 用 prompt generation 方式降低日常操作摩擦

但以目前檔案內容來看，這個方案還**不能算有效落地**，因為存在幾個會直接讓使用者被誤導或命令失敗的結構問題。

一句話判斷：

> **方向正確，但目前實作與文件描述尚未對齊 Codex CLI 的實際 discovery 規則，也有多個斷鏈與缺檔，需先修正後才算真正可用。**

---

## Findings

## [P1] 把 `CODEX.md` 當成 Codex 的主要入口，與 Codex 官方 instruction discovery 規則不一致

### 受影響檔案
- `AGENTS.md`
- `CODEX.md`
- `docs/agents/agent-entrypoints.md`
- `docs/agents/platform-snippets.md`

### 問題
目前規劃把 `CODEX.md` 寫成 Codex 平台入口，並在 snippets 中直接要求「Read CODEX.md first」。

但根據 OpenAI 官方 `AGENTS.md` 文件，Codex 會在 project scope 依序檢查：
- `AGENTS.override.md`
- `AGENTS.md`
- `project_doc_fallback_filenames` 中設定的 fallback names

官方來源：
- `project_doc_fallback_filenames` 與指令搜尋順序見 OpenAI Developers, AGENTS.md guide
- 具體行為可見 `turn2view0` 與 `turn2view1`

而目前本機 `~/.codex/config.toml` 中：
- **沒有**設定 `project_doc_fallback_filenames = ["CODEX.md"]`

這代表：
- `CODEX.md` 雖然存在
- 但不能假設 Codex CLI 會自動把它納入 instruction chain

### 影響
如果使用者依照目前文件操作，很可能會以為：
- `CODEX.md` 會像 `AGENTS.md` 一樣自動生效

但實際上沒有這個保證，這會造成入口認知錯誤。

### 建議
- 保留 `CODEX.md`，但把它降格成「Codex 專用導覽文件」
- 不要在文件裡宣稱它是可靠自動入口，除非你同時要求在使用者層設定 `project_doc_fallback_filenames`
- 共享入口仍應以 `AGENTS.md` 為主

---

## [P1] 多處命令改成 `deploy/bootstrap.py`，但該檔案目前不存在，會直接導致指令失效

### 受影響檔案
- `.github/copilot/rules/80-template-boundary.md`
- `.github/copilot/rules/85-agent-skill-authoring.md`
- `TEMPLATE-FILES.md`
- `docs/agents/agent-entrypoints.md`
- 其他引用 `deploy/bootstrap.py` 的位置

### 問題
這輪規劃把原本多處 template/bootstrap 命令改成：
- `deploy/bootstrap.py --list-managed --root <target>`
- `deploy/bootstrap.py --upgrade-preview --root <target>`

但實際檢查結果：
- `deploy/bootstrap.py`：**不存在**
- `tools/bootstrap_copilot_workspace.py`：仍存在

### 影響
這不是單純文件瑕疵，而是會直接讓 agent 或使用者照文件執行時失敗。

### 建議
在 `deploy/bootstrap.py` 尚未真正落地前：
- 不要把既有命令全面切換過去
- 至少先維持現有可執行命令，或把描述改成「未來預計遷移」

---

## [P1] `AGENTS.md` 新增的兩個 shared skills 目前缺檔，屬於明確斷鏈

### 受影響檔案
- `AGENTS.md`

### 問題
目前 `AGENTS.md` 新增兩個技能條目：
- `.github/copilot/skills/deploy-conductor.md`
- `.github/copilot/skills/upgrade-advisor.md`

但這兩個檔案目前都不存在。

### 影響
任何照著 `AGENTS.md` skill 清單讀取的人，都會撞到缺檔。

這會直接降低共享 skill 清單的可信度。

### 建議
二選一：
- 若技能尚未建立，先不要把它們寫進 `AGENTS.md`
- 若要保留描述，至少明確標示為 planned / not yet created

---

## [P2] `docs/agents/codex-prompts/v{N}/` 被宣稱「已備好」，但實體目錄不存在

### 受影響檔案
- `CODEX.md`
- `docs/agents/agent-entrypoints.md`
- `docs/agents/platform-snippets.md`
- `docs/agents/codex-cli-init.md`
- `.github/copilot/prompts/codex-prompts-generate.prompt.md`

### 問題
文件多處描述：
- `docs/agents/codex-prompts/v{N}/` 已備好
- 可直接用這些 per-change prompts

但實體路徑目前不存在。

### 影響
這會讓使用者誤以為提示詞已經生成完成，實際上仍需執行生成流程或手動建立。

### 建議
在提示詞目錄真正落地前，把描述改成：
- 「可由 `#codex-prompts-generate` 生成」
- 而不是「已備好」

---

## [P2] `.codex/instructions.md` 宣稱「This file is auto-read by Codex at session start」，這個說法目前證據不足

### 受影響檔案
- `.codex/instructions.md`

### 問題
目前檔案開頭直接寫：
- `This file is auto-read by Codex at session start.`

但依官方公開文件與本機實測，Codex CLI 的 repo instructions discovery 主軸是：
- `AGENTS.override.md`
- `AGENTS.md`
- fallback filenames

官方文件並沒有把 `.codex/instructions.md` 列為預設自動 discovery 檔案。

### 影響
這個說法會讓團隊對 `.codex/instructions.md` 產生錯誤期待。

### 建議
把語氣改成：
- thin helper file
- optional prompt companion
- manually referenced entrypoint

除非你有額外證據證明 CLI/IDE surface 在你的環境中確實會自動讀它。

---

## [P2] `.codex/skills/` 與 `.github/skills/` 雙份存在，但官方 repo-native skills 路徑其實是 `.agents/skills/`

### 受影響檔案
- `.codex/instructions.md`
- `CODEX.md`
- 整體 skill 結構

### 問題
目前 repo 同時存在：
- `.codex/skills/`
- `.github/skills/`

但官方 skills 文件說得很清楚：
- repo scope 技能掃描路徑是 `.agents/skills`

官方來源：
- OpenAI Developers, Skills
- `turn2view2` / `turn2view3`

### 影響
這不代表現在不能用，而是代表：
- 目前 skill 使用方式偏向「顯式讀檔」而不是「Codex 原生 repo-native discovery」
- 長期會有 canonical source 漂移風險

### 建議
- 若要做長期穩定方案，應規劃 `.agents/skills/`
- `.github/skills/` 可保留為 canonical source
- `.codex/skills/` 不應長期作為唯一依據

---

## [P2] `docs/agents/platform-snippets.md` 的 Codex Minimal Entrypoint 寫法，現在會把使用者導向一個不可靠入口

### 受影響檔案
- `docs/agents/platform-snippets.md`

### 問題
目前寫法是：
- `Read CODEX.md first ...`

但這等於把使用者的第一反應導向一個**不能假設自動生效**的檔案，而不是導向目前最可靠的 `AGENTS.md`。

### 影響
這會讓 onboarding 與實際 CLI 行為脫節。

### 建議
如果要讓 snippet 真正穩：
- 第一行仍應先讀 `AGENTS.md`
- 然後再顯式讀 `CODEX.md`

也就是：
- `AGENTS.md` 是可靠入口
- `CODEX.md` 是 Codex 導覽補充

---

## [P2] `10-style-guide.md` 從 FROZEN 改回 PENDING，與 repo 其他證據層狀態矛盾

### 受影響檔案
- `.github/copilot/rules/10-style-guide.md`
- `docs/handoff/current-task.md`

### 問題
目前 `10-style-guide.md` 被改成：
- `PENDING`

但 `docs/handoff/current-task.md` 仍記錄：
- `Style guide: ✅ FROZEN`

### 影響
這不是 Codex 專屬問題，但它會破壞治理一致性。

### 建議
若 style guide 狀態確實要重置：
- 必須同步更新 handoff / roadmap / decision evidence

若只是模板升級造成的預設覆蓋：
- 應恢復到 repo 真實狀態

---

## 可行且有效的部分

以下內容我認為是合理而且值得保留的：

### 1. 三角色輪替模式
- `Planner -> Executor -> Review Gate`
- 每個角色一個獨立 session
- 角色切換時不要 resume

這個做法對你目前的 OpenSpec workflow 是合理的。

### 2. 把 `.github/agents/*.agent.md` 定位成 role specs
這是正確的。

你不應期待 Codex 直接把這些 `.agent.md` 當成 native agents；把它們當 role specs，再由 prompt 顯式讀取，是目前最務實的做法。

### 3. 產生 per-change prompts 的方向
`.github/copilot/prompts/codex-prompts-generate.prompt.md` 這個方向本身是好的。

它能把抽象的三角色 workflow 轉成 change-specific 的日常入口，對降低 CLI 使用摩擦有幫助。

前提是：
- 不要先宣稱生成物已存在
- 要先把入口與技能路徑定義收斂好

---

## 整體判斷

### 可行性
**可行。**

這套方案不是空想，它的主架構是成立的：
- 共享規則保留在 `AGENTS.md`
- Codex 透過 role specs + prompts 工作
- 三角色 session 分工清楚

### 有效性
**目前還不夠有效。**

原因不是方向錯，而是目前有數個會直接破壞使用體驗的問題：
- 入口檔定位錯誤
- 缺檔
- 斷鏈
- 不存在的命令路徑
- 與 evidence 層矛盾的狀態

---

## 建議修正順序

### 第一批必修
1. 把 `AGENTS.md` 恢復為 Codex 的可靠主入口敘事
2. 修正 `CODEX.md` / `.codex/instructions.md` 的「自動載入」語氣
3. 把所有 `deploy/bootstrap.py` 改回可執行命令，或先標示為 future state
4. 移除或補齊 `deploy-conductor` / `upgrade-advisor` 缺檔引用
5. 修正 `docs/agents/codex-prompts/v{N}` 的「已存在」說法

### 第二批再做
1. 規劃 `.agents/skills/`
2. 決定 `.github/skills/`、`.codex/skills/`、`.agents/skills/` 的 canonical 關係
3. 真正生成 `docs/agents/codex-prompts/v3/`

### 第三批優化
1. 若真的要讓 `CODEX.md` 自動進 instruction chain，再處理 `project_doc_fallback_filenames`
2. 視需要調整本機 `~/.codex/config.toml`

---

## 最終結論

目前 GitHub Copilot 這輪規劃：
- **架構方向正確**
- **落地細節尚未完成**
- **在修正 P1 / P2 問題前，不建議直接把它當成已穩定可用方案**

一句話總結：

> 可以沿著這個方案繼續做，但必須先把入口真相、缺檔、斷鏈與失效命令修掉，否則使用者照文件操作時會很快撞牆。

---

## 參考資料

- OpenAI Developers, Custom instructions with AGENTS.md – Codex
  - https://developers.openai.com/codex/guides/agents-md
- OpenAI Developers, Agent Skills – Codex
  - https://developers.openai.com/codex/skills
