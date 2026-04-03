# Codex CLI 穩定化修補順序

日期：2026-04-03

## 目的

本文件回答的是：

> 若要讓這個 repo 在 `Codex CLI` 下更穩定地引用相關檔案，下一步應該改哪些檔案、照什麼順序改、為什麼要這樣改。

這份文件是**修補順序與收斂方案**，不是實作結果。

重點是：
- 先修最影響穩定性的問題
- 再修結構一致性
- 最後才處理優化與原生化

---

## 先講結論

若要讓 `Codex CLI` 在這個 repo 中更穩定運作，我建議分成三個層級修補：

### Layer 1：入口收斂
目標：讓 Codex 真正知道「先讀什麼」

### Layer 2：技能與角色結構收斂
目標：讓 repo 內 skill / role 路徑與 Codex 官方 discovery 規則更一致

### Layer 3：使用體驗與維護性收斂
目標：讓日後不需要每次都靠人工猜測入口、提示詞與可用路徑

若只做最少改動、但希望效果最大，**最優先應該修的是 Layer 1**。

---

## 優先順序總表

| 優先 | 項目 | 目的 | 是否建議先做 |
|---|---|---|---|
| P1 | 收斂主入口到 `AGENTS.md` | 保證唯一可靠自動入口 | 是 |
| P1 | 修正 `CODEX.md` / `.codex/instructions.md` 的定位描述 | 避免誤以為自動載入 | 是 |
| P1 | 修正 `docs/agents/codex-prompts/v{N}/` 的斷鏈描述 | 避免文件與現況不一致 | 是 |
| P2 | 補齊或建立 `.agents/skills/` 策略 | 對齊 Codex 官方 skill discovery | 是，但可第二階段 |
| P2 | 整理 `.codex/skills` 與 `.github/skills` 的 canonical 關係 | 避免雙份技能漂移 | 是，但可第二階段 |
| P3 | 決定 `CODEX.md` 是否要成為 fallback filename | 讓 Codex 專屬入口更自然 | 可選 |
| P3 | 生成 per-change prompts 到 `docs/agents/codex-prompts/v{N}/` | 提升日常使用效率 | 可選 |

---

## Layer 1：入口收斂

## Step 1：明確把 `AGENTS.md` 定義為唯一可靠自動入口

### 現況
目前 repo 裡有三個可能被誤認為「Codex 入口」的檔案：
- `AGENTS.md`
- `CODEX.md`
- `.codex/instructions.md`

但目前真正有證據可依賴自動發現的是：
- `AGENTS.md`

### 問題
現在文件描述容易讓人以為：
- `CODEX.md` 會自動生效
- `.codex/instructions.md` 會自動生效

這會造成使用上的誤判。

### 建議修改檔案
- `AGENTS.md`
- `CODEX.md`
- `.codex/instructions.md`
- `docs/agents/agent-entrypoints.md`

### 建議改法
統一語言，明確區分：

#### `AGENTS.md`
- 寫成：共享主入口
- 說明：Codex CLI 可靠自動入口以 `AGENTS.md` 為準

#### `CODEX.md`
- 寫成：Codex 專用導覽文件
- 說明：需由 prompt 或人工顯式讀取，除非另有 fallback config

#### `.codex/instructions.md`
- 寫成：thin entrypoint 備用文件
- 說明：目前不可假設 Codex CLI 一定自動讀到

### 這一步的價值
這一步不是技術改造，而是**降低錯誤心理模型**。

對現階段來說，這是最值得先做的事。

---

## Step 2：修掉 `docs/agents/codex-prompts/v{N}/` 的斷鏈引用

### 現況
以下文件都提到：
- `docs/agents/codex-prompts/v{N}/`

但目前實體目錄不存在。

### 問題
這會讓使用者以為 per-change prompts 已經備妥，實際上卻找不到。

### 建議修改檔案
- `CODEX.md`
- `docs/agents/codex-cli-init.md`
- 若有其他文件提到該路徑，也一併修正

### 建議改法
有兩種做法，二選一：

#### 做法 A：先改文字，不宣稱已存在
把文字改成：
- 「可由某生成流程建立」
- 「若已生成，路徑為 ...」

#### 做法 B：真的補齊生成結果
若你已準備讓這條路成真，就直接建立：
- `docs/agents/codex-prompts/v3/`
- 放入各 change 的 planner / executor / review prompts

### 我建議
先採 **做法 A**。

原因：
- 這一步最小、安全
- 不需要立刻擴充更多檔案
- 先讓文件與現況一致

---

## Layer 2：技能與角色結構收斂

## Step 3：建立 `.agents/skills/` 策略

### 現況
目前 repo 有：
- `.github/skills/`
- `.github/copilot/skills/`
- `.codex/skills/`

但沒有：
- `.agents/skills/`

### 問題
根據 Codex 官方 skills 文件，repo-native skill discovery 應掃描：
- `.agents/skills/`

因此目前的結構雖然可讀，但不夠原生。

### 建議修改檔案 / 目錄
- 新增 `.agents/skills/`
- 視情況補文件說明：
  - `AGENTS.md`
  - `CODEX.md`
  - `docs/agents/agent-entrypoints.md`

### 有兩種收斂策略

#### 策略 A：`.agents/skills/` 作為 Codex-native 展示層
- `.github/skills/` 保持 canonical source
- `.agents/skills/` 放 symlink / mirror / thin wrappers

#### 策略 B：把 Codex 相關 skills 正式搬到 `.agents/skills/`
- `.github/skills/` 保留給其他平台或 historical canonical
- `.agents/skills/` 作為 Codex canonical

### 我建議
先採 **策略 A**。

原因：
- 變更風險較小
- 不會破壞現有 Copilot / shared workflow 路徑
- 可以先讓 Codex CLI 的 native discovery 開始有結構可用

---

## Step 4：整理 `.codex/skills` 的定位

### 現況
`.codex/skills/` 存在，且內容與 `.github/skills/` 高度重疊。

### 問題
這會產生雙份技能來源：
- 哪份是 canonical
- 哪份只是暫存副本
- 兩份何時同步

長期會漂移。

### 建議修改檔案
- `AGENTS.md`
- `CODEX.md`
- `.codex/instructions.md`
- 視情況調整實體技能位置

### 建議改法
先做明確定義：

#### 選項 1：保留 `.codex/skills`，但標明為暫存本地副本
- `.github/skills/` 是 canonical
- `.codex/skills/` 是過渡用本地副本

#### 選項 2：逐步廢止 `.codex/skills`
- 導向 `.agents/skills/` 或 `.github/skills/`
- 不再讓 `.codex/skills` 繼續長期存在

### 我建議
若你目標是長期穩定，建議最後走向：
- **`.agents/skills/` + `.github/skills/`**
- 逐步移出 `.codex/skills/`

但這一步屬於第二階段，不必第一天就做。

---

## Layer 3：使用體驗與維護性收斂

## Step 5：決定是否讓 `CODEX.md` 進入 fallback filename 機制

### 現況
`CODEX.md` 存在，但目前沒有 config 證據顯示它是 Codex CLI 的 fallback project doc。

### 問題
如果你很重視 Codex 專屬入口，現在每次都要靠 prompt 顯式讀取它。

### 建議修改位置
- `~/.codex/config.toml`（使用者層，不一定要進 repo）

### 可能做法
在使用者層設定：
- `project_doc_fallback_filenames = ["CODEX.md"]`

### 風險
- 這是本機配置，不是 repo 共享配置
- 換一台機器就失效
- 若團隊多人協作，一致性較差

### 我建議
目前先**不要把這當第一優先**。

原因：
- 先把 `AGENTS.md` 路線穩定化更重要
- 過早依賴本機 fallback 設定，容易讓 repo 規則與個人環境綁太緊

---

## Step 6：若要主打 per-change prompts，再真的生成 `docs/agents/codex-prompts/v{N}/`

### 現況
你已經有一個 prompt 生成器：
- `.github/copilot/prompts/codex-prompts-generate.prompt.md`

這代表方向已經清楚，只是生成物未落地。

### 建議修改位置
- `docs/agents/codex-prompts/v3/`
- 以及可能的索引說明文件

### 這一步的價值
如果生成後，日常使用會更順：
- 不必每次手動拼 Planner prompt
- 不必每次自己填 role spec 路徑
- 對 change-driven workflow 會更低摩擦

### 我建議
這一步放在結構收斂之後再做。

原因：
- 若入口與 skills 路徑尚未收斂，先生成 prompt 只是把暫時方案大量複製出去

---

## 我建議的實際執行順序

## Phase 1：先修文件語意與斷鏈

### 應改檔案
- `AGENTS.md`
- `CODEX.md`
- `.codex/instructions.md`
- `docs/agents/agent-entrypoints.md`
- `docs/agents/codex-cli-init.md`

### 目標
- 明確說清楚哪些檔案是自動入口
- 哪些檔案只是顯式引用導覽
- 消除 `codex-prompts/v{N}` 的現況誤導

### 為什麼先做
- 風險最低
- 對認知修正效果最大
- 不需要大搬動目錄

---

## Phase 2：補 `.agents/skills/`，建立官方對齊路徑

### 應改內容
- 新增 `.agents/skills/`
- 建立策略：wrapper / symlink / mirror / canonicalization
- 更新相關文件描述

### 目標
- 讓 Codex CLI 開始有官方路徑對齊的 repo-native skills 位置

### 為什麼第二階段做
- 這一步開始碰結構，不適合在入口尚未講清楚前先動

---

## Phase 3：處理 `.codex/skills` 與 per-change prompts

### 應改內容
- 重新定義 `.codex/skills` 的角色，或逐步退場
- 視需求生成 `docs/agents/codex-prompts/v3/`

### 目標
- 提升日常使用體驗
- 降低 prompt 手工成本

### 為什麼最後做
- 這是優化，不是穩定性前提

---

## 不建議的做法

## 1. 不要先大改所有 skill 路徑
現在最常見的錯誤是：
- 一看到 `.agents/skills/` 缺失，就想一次把全部搬過去

這樣風險太高，因為：
- 會影響 Copilot / Codex / shared skill 關係
- 很容易在 canonical source 上搞亂

## 2. 不要把 `CODEX.md` 當主入口，卻不處理 fallback
如果你想讓 `CODEX.md` 真正進 discovery chain，就要明確做 config 或文件策略；否則它只能是顯式讀取檔。

## 3. 不要同時處理入口、技能、提示詞生成、平台策略重寫
這樣會讓問題來源混在一起，難以驗證哪一步真的有效。

---

## 最小可行修補方案

如果你只想先做最少改動，但讓 `Codex CLI` 使用體驗明顯變穩，我建議只先做這三件事：

1. **修正文案**
   - 明確寫出 `AGENTS.md` 是唯一可靠自動入口
   - `CODEX.md` / `.codex/instructions.md` 是顯式讀取文件

2. **修正斷鏈**
   - 把 `docs/agents/codex-prompts/v{N}/` 的描述改成「若已生成」而不是假定存在

3. **規劃 `.agents/skills/`**
   - 先訂策略，不急著大量搬檔

這三步做完後，整體穩定性就會明顯提升。

---

## 最終結論

若要讓這個 repo 在 `Codex CLI` 下更穩定，正確順序不是先追求更多文件，而是先收斂「哪一份文件真的有權威」。

我建議的順序是：

1. **先收斂入口語意**
2. **再補官方對齊的 `.agents/skills/` 路徑**
3. **最後才處理 per-change prompts 與本地副本技能的優化**

一句話版本：

> 先修「入口真相」，再修「技能路徑」，最後才修「使用體驗」。
