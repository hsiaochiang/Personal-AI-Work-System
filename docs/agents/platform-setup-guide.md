# Platform Setup Guide

> 這份文件回答的是：「這些最小入口文字，實際上要貼到哪裡？」
> 原則：優先使用 repo 內共享文件；平台設定只放薄入口，不要把完整規範複製進去。

## 使用順序
1. 先確認 repo 內已有 `AGENTS.md`、`docs/agents/`、`docs/handoff/`
2. 再決定各平台要用 repo-level instructions 還是 UI 內的 custom prompt
3. 最後從 `docs/agents/platform-snippets.md` 複製對應平台的最小入口文字
4. 若你想照著 VS Code 畫面逐步找入口，再看 `docs/agents/platform-ui-walkthrough.md`

## Copilot

### 最穩定的放置位置
- 首選：`.github/copilot-instructions.md`
- 補充：若團隊有使用 VS Code Chat 的個人或工作區 custom instructions，可再額外貼上簡短版本

### VS Code 中的實際操作思路
1. 先確認 repo 根目錄已有 `.github/copilot-instructions.md`
2. 開啟 VS Code 後，確認此資料夾就是目前工作區根目錄
3. 進入 Copilot Chat 或 Chat 視圖，使用一次對話確認它是否已讀到 repo 內 instructions
4. 若你還想套用個人偏好，再到 Copilot 相關的 custom instructions 設定加入補充文字
5. 個人設定只放偏好，不重貼整份共享規則

### 建議操作
1. 保留 `.github/copilot-instructions.md` 作為 Copilot 常駐入口
2. 確認其中第一層規則會先導向 `AGENTS.md`
3. 若你還想加個人偏好，放在 VS Code 的 Copilot custom instructions，但不要覆寫共享規則

### 貼上的內容
- repo 層：維持 `.github/copilot-instructions.md`
- UI 層：可貼 `docs/agents/platform-snippets.md` 中的 Copilot Minimal Entrypoint

### 何時用 UI 層補充
- 想加個人輸出格式偏好
- 想限制語氣、回覆長度、是否先提 plan
- 這些屬於個人偏好，不應回寫到共享規則

### 建議檢查清單
- Copilot 啟動後是否知道先讀 `AGENTS.md`
- 接手中的任務時，是否知道先看 `docs/handoff/current-task.md`
- 是否知道命令來源在 `docs/agents/commands.md`
- 是否沒有把個人偏好覆蓋 repo 規則

## Codex

### 優先放置位置
- 首選：Codex 的 repo-level instructions 或 workspace instructions
- 次選：custom task prompt / workspace prompt

### VS Code 中的實際操作思路
1. 先開啟 Codex 對應的 chat 面板、agent 面板或 extension 設定畫面
2. 優先尋找 repo instructions、workspace instructions、project instructions 這類入口
3. 若找不到，再找 custom task prompt、default prompt、saved prompt 這類入口
4. 若同時存在 repo 層與任務層，規則放 repo 層，任務內容留在任務層
5. 貼上後，實際用一輪小任務檢查 Codex 是否會先讀 repo 內檔案

### 建議操作
1. 先找 Codex extension 或工具中的 repo / workspace instructions 設定
2. 若有 repo-level instructions，直接貼 `Codex Minimal Entrypoint`
3. 若沒有常駐 instructions，再改貼到你最常用的 custom task prompt
4. 確認 Codex 回合開始時會先讀 repo 內檔案，而不是只依賴 prompt 文字

### 貼上的內容
- 使用 `docs/agents/platform-snippets.md` 中的 Codex Minimal Entrypoint

### 實務建議
- 若 Codex 同時支援 system-like instructions 與 task prompt，規則放前者，任務內容放後者
- 不要把 `AGENTS.md` 全文直接貼進 Codex 設定；只貼最小入口即可

### 建議檢查清單
- Codex 第一輪是否知道先讀 `AGENTS.md`
- 是否知道 handoff 只在事件發生時更新，而不是每輪 prompt 更新
- 是否知道不可自行決定 scope 變更與不可逆操作
- 是否知道命令與驗證依 `docs/agents/commands.md`

## Gemini Code Assist

### 優先放置位置
- 首選：workspace context / workspace instructions
- 次選：starter prompt / pinned prompt

### VS Code 中的實際操作思路
1. 開啟 Gemini Code Assist 的聊天面板或 extension 設定
2. 先找 workspace context、workspace instructions、project prompt 類型入口
3. 若沒有常駐入口，就建立 pinned prompt、starter prompt 或常用片段
4. 貼上後，第一次接手任務時仍建議手動再補一句「先讀 AGENTS.md 和 handoff」
5. 用一個小任務驗證它是否真的能遵守共享規則

### 建議操作
1. 先找 Gemini Code Assist 在 VS Code 中可保存 workspace context 或 custom instructions 的位置
2. 若有 workspace-level 設定，貼 `Gemini Code Assist Minimal Entrypoint`
3. 若只有聊天啟動提示，則把最小入口存成 pinned prompt 或常用 starter prompt
4. 每次切到 Gemini 開工時，先確認它有讀到 `AGENTS.md` 與 `docs/handoff/`

### 貼上的內容
- 使用 `docs/agents/platform-snippets.md` 中的 Gemini Code Assist Minimal Entrypoint

### 實務建議
- Gemini 若較容易受當前對話影響，建議每次接手時先手動補一句「先讀 AGENTS.md 和 handoff」
- 若 workspace prompt 有字數限制，優先保留：`AGENTS.md`、handoff 更新時機、commands 來源、禁止自決事項

### 建議檢查清單
- Gemini 是否會先看 `AGENTS.md` 而不是直接開始回答
- 是否會把 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/` 當成長期背景
- 是否不會每次回覆都重寫 handoff
- 是否知道 merge / release / archive 需要人工批准

## 放置策略總結
- Copilot：repo 內 `.github/copilot-instructions.md` 為主
- Codex：repo / workspace instructions 為主，task prompt 為輔
- Gemini：workspace context 或 pinned prompt 為主

## 快速驗證流程
1. 選一個平台，把最小入口貼到對應設定位置
2. 開一個新對話，直接問它：「開始前你會先讀哪些檔案？」
3. 正確答案至少要包含：`AGENTS.md`、handoff、commands 或 project-context
4. 再問它：「什麼時候要更新 handoff？」
5. 正確答案應該是事件驅動，而不是每次 prompt
6. 最後問它：「哪些事不能自己決定？」
7. 正確答案應該包含 scope 變更、架構重寫、重大 dependency、不可逆操作

## 不建議的做法
- 不要把完整規範分別貼到三個平台各自維護
- 不要只把規則放在某個人的本機設定，而 repo 裡沒有共享版本
- 不要把 handoff 模板直接貼進平台設定；平台設定只需要導向 handoff 文件

## 版本差異處理
- 不同 extension 版本的設定名稱可能不同
- 若畫面上找不到完全相同的名稱，優先找這幾類入口：
    - repo instructions
    - workspace instructions
    - custom instructions
    - starter prompt
    - pinned prompt
- 找到後貼入對應平台的 minimal snippet 即可

## 與其他文件的分工
- `docs/agents/platform-setup-guide.md`：回答應該放哪一類入口、放什麼內容
- `docs/agents/platform-ui-walkthrough.md`：回答在 VS Code 畫面裡可以怎麼找、怎麼一步一步確認
- `docs/agents/platform-onboarding-checklist.md`：回答設定完後怎麼驗收有沒有真的生效
