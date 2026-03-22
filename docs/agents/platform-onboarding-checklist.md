# Platform Onboarding Checklist

> 給第一次把 Copilot / Codex / Gemini 接進同一個 workspace 的人使用。
> 目標是用最短路徑確認：共享規則存在、平台入口放對、agent 真的讀得到、handoff 更新節奏正確。

## 使用方式
1. 先完成 `docs/agents/platform-setup-guide.md` 的對應平台設定
2. 再依這份清單逐項確認
3. 若任何一項失敗，先修 repo 內共享文件，再修平台入口，不要反過來

## A. Repo 共享文件檢查
- [ ] `AGENTS.md` 已存在，且內容是跨平台共用入口
- [ ] `docs/agents/project-context.md` 已填入此 repo 的真實背景，而不是保留模板占位
- [ ] `docs/agents/commands.md` 已填入實際可執行的 setup / test / lint / build / smoke 命令
- [ ] `docs/handoff/current-task.md` 可讓下一個 agent 直接接手，不需要再猜目前狀態
- [ ] `docs/handoff/blockers.md` 已反映目前是否有待決策或阻塞
- [ ] `docs/roadmap.md`、`docs/decision-log.md`、`docs/runlog/` 仍作為長期證據層

## B. Copilot 接入檢查
- [ ] `.github/copilot-instructions.md` 仍存在，且會先導向 `AGENTS.md`
- [ ] 若有使用 Copilot custom instructions，內容只有個人偏好，沒有重複整份共享規則
- [ ] 新開一個 Copilot 對話時，能回答出會先讀 `AGENTS.md`、handoff、commands
- [ ] Copilot 知道 handoff 不是每輪 prompt 都更新，而是事件驅動更新

## C. Codex 接入檢查
- [ ] 已找到 Codex 的 repo instructions、workspace instructions，或替代的 custom task prompt 入口
- [ ] 貼入的是 `Codex Minimal Entrypoint`，不是把完整規範全文貼上
- [ ] 新開一輪任務時，Codex 會先回到 repo 內共享文件，而不是只依賴 prompt 文字
- [ ] Codex 知道不可自行決定 scope 變更、架構重寫、重大 dependency、不可逆操作

## D. Gemini Code Assist 接入檢查
- [ ] 已找到 Gemini 的 workspace context、workspace instructions，或替代的 pinned / starter prompt 入口
- [ ] 貼入的是 `Gemini Code Assist Minimal Entrypoint`
- [ ] 第一次接手中的任務時，Gemini 能先回頭讀 `AGENTS.md` 與 `docs/handoff/`
- [ ] Gemini 不會把長期背景與短期 handoff 混成同一份 prompt 記憶

## E. 共同驗證問句
把下面問題依序丟給剛設定好的平台，答案若偏掉，就回頭修入口或共享文件。

1. 開始前你會先讀哪些檔案？
2. 哪些文件是長期背景，哪些是短期交接？
3. 什麼時候要更新 `docs/handoff/current-task.md`？
4. 命令與驗證方式要以哪份文件為準？
5. 哪些決定需要人工批准，不能由 agent 自行決定？

## F. 驗收標準
- [ ] 三個平台至少有一個已完成實測
- [ ] 被測平台能正確說出：`AGENTS.md`、`docs/agents/commands.md`、`docs/handoff/current-task.md` 的用途
- [ ] 被測平台知道 handoff 採事件驅動更新
- [ ] 被測平台知道長期證據在 `roadmap / decision-log / runlog`
- [ ] 被測平台知道重大變更與不可逆操作需要人工批准

## G. 常見失敗模式
- 把完整規範貼進平台設定，造成 repo 與平台內容分叉
- `project-context.md` 與 `commands.md` 還停在模板內容，導致 agent 讀到錯誤背景
- handoff 太空泛，下一個 agent 還是得重新讀整個 repo
- 把 custom instructions 當成唯一真相來源，導致換機器或換人後規則消失

## H. 建議落地順序
1. 先補齊 repo 內共享文件
2. 先接入 Copilot，因為本模板原生即以 Copilot 為主
3. 再接入 Codex 或 Gemini 其中一個
4. 每新增一個平台，就跑一次共同驗證問句
