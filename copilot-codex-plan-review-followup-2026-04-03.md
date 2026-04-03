# GitHub Copilot 修正後的 Codex CLI 導入方案 Follow-up Review

日期：2026-04-03

## 總結

這輪修正之後，整體狀態已經比前一輪明顯改善，從「方向正確但不能直接用」提升到：

- **基本可行**
- **大部分關鍵斷鏈已補上**
- **仍有少數敘事與使用方式需要再收斂，否則會在真實使用時造成誤解**

我目前的整體判斷是：

> 這套方案現在已經可以拿來試跑 Codex CLI workflow，但還不建議直接宣告為「完全收斂、零歧義」；建議再修 2 個高影響敘事問題，和 1 個中影響操作問題。

---

## 我如何思考與檢查

這次我不是只看文件有沒有寫得漂亮，而是用三層方法檢查：

### 1. 結構檢查
我先確認實體檔案是否存在：
- `CODEX.md`
- `.codex/instructions.md`
- `.agents/skills/`
- `docs/agents/codex-prompts/v3/`
- `.github/copilot/skills/deploy-conductor.md`
- `.github/copilot/skills/upgrade-advisor.md`
- 模板 repo 的 `deploy/bootstrap.py`

### 2. 行為檢查
我再用 `codex exec` 直接問 Codex CLI：
- 哪個 repo instruction file 會被可靠自動發現
- `CODEX.md` 是否會在沒有額外 config 時自動 active

這一步的目的是避免只靠文件推測。

### 3. 規則對照
最後我拿現在的 repo 設計對照官方文件：
- AGENTS.md discovery
- repo-native skills 路徑
- Codex CLI slash commands

這樣可以把問題分成：
- 實體缺檔
- 官方規則不符
- 文件敘事不一致
- 真正只是可接受的設計選擇

---

## 已確認修正到位的部分

這些項目我確認已經有效改善，屬於**可保留**：

### 1. `CODEX.md` 的定位已收斂
目前 [CODEX.md](D:\program\Personal-AI-Work-System\CODEX.md) 已明確寫出：
- `AGENTS.md` 才是 Codex CLI 的可靠自動入口
- `CODEX.md` 是 Codex 專用導覽文件
- 若沒有 `project_doc_fallback_filenames = ["CODEX.md"]`，則不能假設它自動載入

這個修正是正確的。

### 2. `.codex/instructions.md` 已不再誤稱自己是 Codex CLI 自動入口
目前 [.codex/instructions.md](D:\program\Personal-AI-Work-System\.codex\instructions.md) 已經改成：
- 由 GitHub Copilot Coding agent 自動讀取
- 對 Codex CLI 而言，`AGENTS.md` 才是可靠入口

這個修正也是正確的。

### 3. 原本缺失的檔案與路徑大多已補齊
目前已存在：
- `.github/copilot/skills/deploy-conductor.md`
- `.github/copilot/skills/upgrade-advisor.md`
- `docs/agents/codex-prompts/v3/`
- `.agents/skills/`
- `D:\program\copilot-workspace-template\deploy\bootstrap.py`
- `D:\program\copilot-workspace-template\deploy\orchestrate.py`

這表示前一輪最明顯的實體斷鏈已被修掉。

### 4. `10-style-guide.md` 已與 handoff 的 FROZEN 狀態重新一致
目前 [.github/copilot/rules/10-style-guide.md](D:\program\Personal-AI-Work-System\.github\copilot\rules\10-style-guide.md) 已恢復為 `FROZEN`。

這個一致性問題已解決。

### 5. `docs/agents/codex-prompts/v3/` 生成內容基本合理
我抽查了多個 prompt，內容已調整為：
- 先讀 `AGENTS.md`
- 再讀 `CODEX.md (Codex 導覽補充)`
- 再讀 handoff / roadmap / brief / commands / role spec

這個順序比前一輪合理很多。

---

## OpenSpec 對照修正（依官方文件）

這一輪我另外把 OpenSpec 官方文件重新對照了一次，這裡有一個需要**修正我前一輪判斷**的地方。

### 1. OpenSpec 對 Codex 不是「只有 prompts、沒有 skills」

依 OpenSpec 官方 `supported-tools.md`：

- Codex 的 **skills path pattern** 是 `.codex/skills/openspec-*/SKILL.md`
- Codex 的 **command path pattern** 是 `$CODEX_HOME/prompts/opsx-*.md`

也就是說，對 Codex 而言，OpenSpec 官方整合本來就可能同時安裝：

- repo-local 的 `.codex/skills/.../SKILL.md`
- user-level 的 `$CODEX_HOME/prompts/opsx-*.md`

這代表我前一輪若把 OpenSpec for Codex 描述成「主要安裝的是 prompts，不是 skills」，那個說法**過度簡化**了。

更準確的說法應該是：

- **OpenSpec 對 Codex 同時支援 skills 與 commands**
- **是否生成哪些 skill / command，取決於 profile 與 delivery**

### 2. OpenSpec 不是固定只有 4 個 skill / 4 個 command

依 OpenSpec 官方 `supported-tools.md` 與 `commands.md`：

- 預設 `core` profile：`propose`、`explore`、`apply`、`archive`
- expanded workflow 另外包含：`new`、`continue`、`ff`、`verify`、`sync`、`bulk-archive`、`onboard`

也就是說，OpenSpec 產物數量本來就是：

- **profile-dependent**
- **delivery-dependent**

不是固定 4 個。

### 3. 你目前這台機器的實際狀態

我實查到：

- repo 內有：
  - `.github/skills/openspec-*`
  - `.codex/skills/openspec-*`
  - `.agents/skills/openspec-*`
- 使用者層有：
  - `C:\\Users\\wilson_hsiao\\.codex\\prompts\\opsx-propose.md`
  - `C:\\Users\\wilson_hsiao\\.codex\\prompts\\opsx-explore.md`
  - `C:\\Users\\wilson_hsiao\\.codex\\prompts\\opsx-apply.md`
  - `C:\\Users\\wilson_hsiao\\.codex\\prompts\\opsx-archive.md`

但目前**沒有**看到：

- `opsx-new.md`
- `opsx-ff.md`
- `opsx-verify.md`
- `opsx-sync.md`

這表示你目前本機 Codex OpenSpec commands 實際上是：

- **core profile 已安裝**
- **expanded workflow commands 尚未安裝**

### 4. 這對前一輪結論的修正

因此，前一輪需要修正成：

- `/opsx-*` 在 Codex CLI **不是一概不可靠**
- 但**只有已安裝在 `$CODEX_HOME/prompts/` 的那些 prompt commands 才能假設存在**
- 就你目前這台機器來看，可合理假設存在的是：
  - `/opsx-propose`
  - `/opsx-explore`
  - `/opsx-apply`
  - `/opsx-archive`
- 而不是：
  - `/opsx-new`
  - `/opsx-ff`
  - `/opsx-verify`

這個差異對 `docs/agents/codex-cli-init.md` 的判讀非常重要。

---

## 仍建議調整的地方

## [P1] `AGENTS.md` 與 `agent-entrypoints.md` 仍把 `CODEX.md` 說成「平台入口」，這和已修正後的 `CODEX.md` 自己的說法還是有落差

### 受影響檔案
- [AGENTS.md](D:\program\Personal-AI-Work-System\AGENTS.md)
- [docs/agents/agent-entrypoints.md](D:\program\Personal-AI-Work-System\docs\agents\agent-entrypoints.md)
- [docs/agents/platform-snippets.md](D:\program\Personal-AI-Work-System\docs\agents\platform-snippets.md)

### 問題
目前 `CODEX.md` 本身已經正確承認：
- `AGENTS.md` 才是可靠自動入口

但其他文件仍在用這種語氣：
- `CODEX.md 為平台入口`
- `Read CODEX.md first`

這會造成內部敘事不一致。

### 為什麼這是高影響
因為使用者或 agent 會先看這些導覽文件。

若入口敘事不一致，最直接的結果是：
- 有人會以為 `CODEX.md` 應該自動被載入
- 有人會以為 `AGENTS.md` 是次級入口

而 `codex exec` 的實測結果仍然很清楚：
- **可靠自動發現的是 `AGENTS.md`**
- **`CODEX.md` 沒有額外 config 時不是 auto-active**

### 建議修法
統一語言為：
- `AGENTS.md`：可靠自動入口
- `CODEX.md`：Codex 專用導覽補充文件，建議顯式讀取

### 影響性
- **高**
- 不是因為會讓檔案找不到，而是會讓整個 instruction mental model 再次混亂

---

## [P1] `docs/agents/codex-cli-init.md` 仍把 expanded workflow commands 寫成現在即可直接使用，這和目前這台機器的 OpenSpec 安裝狀態不一致

### 受影響檔案
- [docs/agents/codex-cli-init.md](D:\program\Personal-AI-Work-System\docs\agents\codex-cli-init.md)

### 問題
目前文件在 Executor 區段仍寫成：

```text
/opsx-new "<change-name>"
/opsx-ff
/opsx-apply "<change-name>"
/opsx-verify "<change-name>"
```

依 OpenSpec 官方文件，Codex 確實可以透過 `$CODEX_HOME/prompts/opsx-*.md` 提供 OpenSpec commands。

所以真正的問題不是「Codex CLI 一律不能用 `/opsx-*`」，而是：

- 目前這台機器的 `$CODEX_HOME/prompts/` 只有 core profile：
  - `opsx-propose.md`
  - `opsx-explore.md`
  - `opsx-apply.md`
  - `opsx-archive.md`
- 並沒有 expanded workflow 的：
  - `opsx-new.md`
  - `opsx-ff.md`
  - `opsx-verify.md`

因此，文件現在這樣寫，等於在宣稱：
- 使用者已完成 expanded workflow profile 安裝
- 且這些 commands 已實際存在於目前機器的 Codex prompt 目錄

這兩件事目前都沒有被文件明確說出來，也和現況不符。

### 為什麼這是高影響
這不是敘事差異，而是會直接影響使用者操作。

使用者若照文件理解，很可能會以為：
- 在 Codex CLI 輸入 `/opsx-new`、`/opsx-ff`、`/opsx-verify` 就會直接工作

但從本機實況來看，這個假設目前不成立。

### 建議修法
把這段改成以下任一種語氣：

#### 做法 A：明確標示「這一段需要 expanded workflow 已安裝」
例如補一句：

```text
若你已執行 `openspec config profile` 選擇 expanded workflow，並在本機執行 `openspec update`，
且確認 `$CODEX_HOME/prompts/` 已存在 `opsx-new.md`、`opsx-ff.md`、`opsx-verify.md`，
才可直接使用下列 commands。
```

#### 做法 B：改成「目標流程」而不是「當前可直接執行的命令」
例如：
- Executor 應完成對等於 `opsx-new -> ff -> apply -> verify` 的流程
- 具體執行方式：讀取對應 skill / role spec 後以自然語言推進

#### 做法 C：依目前本機狀態拆成兩段
- 已可用的 core commands：`/opsx-propose`、`/opsx-explore`、`/opsx-apply`、`/opsx-archive`
- 需額外安裝 expanded profile 才可用的 commands：`/opsx-new`、`/opsx-ff`、`/opsx-verify`、`/opsx-sync`

### 影響性
- **高**
- 因為這會直接影響第一次上手能不能成功

---

## [P2] OpenSpec skill 路徑的敘事仍未完全收斂：`.github/skills/`、`.codex/skills/`、`.agents/skills/` 三層各自代表什麼，主文件還沒有講清楚

### 受影響檔案
- [CODEX.md](D:\program\Personal-AI-Work-System\CODEX.md)
- [AGENTS.md](D:\program\Personal-AI-Work-System\AGENTS.md)
- [docs/agents/agent-entrypoints.md](D:\program\Personal-AI-Work-System\docs\agents\agent-entrypoints.md)

### 問題
依 OpenSpec 官方 `supported-tools.md`：

- GitHub Copilot 的 OpenSpec skills path 是 `.github/skills/openspec-*/SKILL.md`
- Codex 的 OpenSpec skills path 是 `.codex/skills/openspec-*/SKILL.md`

而你目前 repo 另外還有：

- `.agents/skills/openspec-*/SKILL.md`

這代表現在 repo 裡其實同時存在三層語意：

- `.github/skills/`：符合 OpenSpec 的 GitHub Copilot tool path
- `.codex/skills/`：符合 OpenSpec 的 Codex tool path
- `.agents/skills/`：符合 Codex repo-native skill discovery / 本 session skill 清單

但目前主文件還沒有清楚界定：

- 哪一份是 canonical source
- 哪一份是 OpenSpec tool-specific delivery
- 哪一份是 Codex-native mirror
- 三者的同步方向是什麼

### 為什麼這是中影響
這不會阻止使用，但會讓你日後面對一個問題：
- 到底 `.github/skills/` 才是 canonical
- 還是 `.codex/skills/` / `.agents/skills/` 才是對應平台真正該看的位置

### 建議修法
至少在 `AGENTS.md` 與 `CODEX.md` 補一句清楚說明：

- `.github/skills/`：GitHub Copilot / shared canonical source（若你決定它是 canonical）
- `.codex/skills/`：OpenSpec 對 Codex 的官方 tool-specific skill install path
- `.agents/skills/`：Codex repo-native mirror，用於 Codex skill discovery

如果這三層都要保留，就應明示：
- 誰是來源
- 誰是鏡像
- 什麼時候由哪個流程同步

### 影響性
- **中**
- 短期不阻斷，長期若不收斂會漂移

---

## [P3] `docs/agents/platform-snippets.md` 的 Codex snippet 還可以更穩

### 受影響檔案
- [docs/agents/platform-snippets.md](D:\program\Personal-AI-Work-System\docs\agents\platform-snippets.md)

### 問題
目前 Codex snippet 是：
- `Read CODEX.md first ...`

從「日常使用成功率」來看，更穩的寫法其實應該是：
- 先讀 `AGENTS.md`
- 再讀 `CODEX.md`

因為這樣跟 Codex 真實 discovery 行為完全一致。

### 建議修法
改成：

```text
Read AGENTS.md first.
Then read CODEX.md for Codex-specific path guidance.
...
```

### 影響性
- **中低**
- 現在不一定會出錯，但這樣改後更一致，也更不容易讓新使用者建立錯誤心智模型

---

## `docs/agents/codex-cli-init.md` 中「目前做不到 / 限制」的影響性

你特別問了這一點，我直接講判斷。

### 我在該檔案中看到的真正限制類型
這份文件沒有用一個專門區段列「目前做不到」，但實質上包含了幾種限制：

### 1. `.github/agents/*.agent.md` 不是原生 Codex agent
這點寫得正確。

#### 影響性
- **低**，只要文件持續寫清楚就好
- 這不是 blocker，而是現實邊界

### 2. 角色切換要開新 session，不能靠 native `@planner` / `@executor`
這點也合理。

#### 影響性
- **低到中**
- 會增加一點操作成本，但不阻止 workflow 成立

### 3. 以 `/opsx-*` 命令語氣描述 Executor 流程
這是我認為目前真正高影響的限制/問題。

#### 影響性
- **高**
- 因為這不是單純做不到，而是「core 與 expanded 已安裝哪些 command」沒有被講清楚，很容易讓人誤會都可以直接做

### 結論
若你要我對 `docs/agents/codex-cli-init.md` 中「無法做到的內容」做影響評估，我會這樣分級：

| 項目 | 影響性 | 原因 |
|---|---|---|
| `.agent.md` 非原生 agent | 低 | 已有替代方案：role spec + 顯式讀取 |
| 角色切換需新 session | 低到中 | 只是操作成本，不阻斷流程 |
| expanded `/opsx-*` commands 尚未在本機安裝，卻被寫成可直接使用 | 高 | 可能直接誤導使用者操作 |

---

## 最終判斷

### 現在是否可行且有效？
我的結論是：

- **可行：是**
- **有效：大致有效，但還沒完全收斂**

### 我會怎麼處理
如果我是接手這個問題的人，我不會全面翻掉這輪修正，因為大方向已經修正正確了。

我會做的是：

1. **保留現在大部分修正**
   - 因為入口、缺檔、prompts、模板路徑這些關鍵問題大多已經補好

2. **只做最小必要修補**
   - 把 `AGENTS.md` / `agent-entrypoints.md` / `platform-snippets.md` 的入口敘事收斂成一致
   - 把 `codex-cli-init.md` 裡 `/opsx-*` 的描述改成不誤導的 workflow 說法

3. **暫時不動更大的結構問題**
   - 像 `.agents/skills/` 與 `.github/skills/` 的 canonical 關係，可以留到下一輪再處理

這樣做的理由是：
- 先把真實使用時會撞牆的地方修掉
- 不要在已經接近可用的狀態下，再一次做大幅重構

---

## 最後一句結論

> 這輪修正已經把方案從「不能直接用」拉到「可以試跑」，目前最值得再修的不是大改架構，而是把入口敘事和 `/opsx-*` 的操作描述收斂到完全不誤導使用者。
