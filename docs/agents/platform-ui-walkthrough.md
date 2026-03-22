# Platform UI Walkthrough

> 這份文件不是實際截圖，而是「照畫面找」的逐步版文案。
> 目標是讓第一次接入的人，在不同 extension 版本名稱略有差異時，仍能靠畫面關鍵詞找到正確入口。

## 使用方式
1. 先看 `docs/agents/platform-setup-guide.md`，確認你要找的是哪一類入口
2. 再用這份 walkthrough 按畫面逐步查找
3. 找到後，貼入 `docs/agents/platform-snippets.md` 的對應 minimal snippet
4. 最後用 `docs/agents/platform-onboarding-checklist.md` 做驗收

## 共同原則
- 不同 extension 版本的按鈕名稱可能不同，但入口類型通常相近
- 找不到完全同名選項時，優先找：workspace、repo、project、instructions、prompt、context、custom 這些字樣
- 若同時存在 repo 層與 task 層，規則放 repo 層，任務內容放 task 層

## Copilot 畫面導覽

### 你要找的入口類型
- repo 內 `.github/copilot-instructions.md`
- 視需要再加個人或工作區 custom instructions

### 畫面上通常會看到的線索
- Chat
- Copilot
- Instructions
- Custom Instructions
- Workspace

### 建議操作順序
1. 在 Explorer 確認 repo 根目錄能看到 `.github/copilot-instructions.md`
2. 打開 Copilot Chat 或 VS Code Chat 視圖
3. 開一個新對話，先不要丟任務，先問它「開始前你會先讀哪些檔案？」
4. 若它沒有提到 `AGENTS.md`，先回頭檢查 `.github/copilot-instructions.md` 是否正確導向共享文件
5. 若你還想加個人偏好，再去找 Copilot 的 custom instructions 類型設定
6. 個人偏好只補語氣、輸出格式、回覆長度，不要重貼 repo 規則

### 畫面導向檢查點
- 左側檔案樹看得到 `.github/copilot-instructions.md`
- Chat 第一輪回答知道先讀 `AGENTS.md`
- Chat 能分辨 handoff 與長期證據層

## Codex 畫面導覽

### 你要找的入口類型
- repo instructions
- workspace instructions
- project instructions
- 若沒有，再找 custom task prompt

### 畫面上通常會看到的線索
- Codex
- Agent
- Instructions
- Project
- Workspace
- Prompt
- Saved Prompt

### 建議操作順序
1. 開啟 Codex 的聊天面板、agent 面板或 extension 設定頁
2. 先找帶有 workspace、project、repo、instructions 的區塊
3. 若只有 prompt 類型入口，找 default prompt、task prompt、saved prompt 之類的設定
4. 貼入 `Codex Minimal Entrypoint`
5. 開一個新任務，先問它「你開始前會先讀哪些 repo 文件？」
6. 若它只重複 prompt 內容而沒有回到 repo 文件，表示入口放錯層級，應往 workspace 或 repo 層移

### 畫面導向檢查點
- 找得到 project 或 workspace 層級的設定，不只 task prompt
- 第一輪回答知道 `docs/agents/commands.md` 是命令真相來源
- 知道 handoff 採事件驅動更新

## Gemini Code Assist 畫面導覽

### 你要找的入口類型
- workspace context
- workspace instructions
- project prompt
- 若沒有，再找 pinned prompt 或 starter prompt

### 畫面上通常會看到的線索
- Gemini
- Code Assist
- Context
- Workspace
- Prompt
- Pin
- Starter

### 建議操作順序
1. 開啟 Gemini Code Assist 對應的 chat 面板或 extension 設定
2. 優先找 workspace context、workspace instructions、project prompt
3. 若只有聊天啟動用的 prompt，建立一個 pinned prompt 或 starter prompt
4. 貼入 `Gemini Code Assist Minimal Entrypoint`
5. 第一次接手中的任務時，再手動補一句「先讀 AGENTS.md 和 docs/handoff/」
6. 問它「長期背景與短期交接分別看哪裡？」確認它有分層概念

### 畫面導向檢查點
- 知道 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/` 是長期背景
- 知道 `docs/handoff/` 是短期交接
- 不會每輪回答都試圖重寫 handoff

## 若畫面名稱不同怎麼辦
- 不要執著完全相同的按鈕名稱
- 先辨識它屬於哪一層：repo、workspace、project、task、chat startup
- 只要能判斷層級，就能套用同一套放置原則

## 最後驗收
1. 用 walkthrough 找到入口
2. 用 `platform-snippets.md` 貼入最小入口
3. 用 `platform-onboarding-checklist.md` 驗收
4. 驗收不通過時，先修 repo 共享文件，再調整平台入口
