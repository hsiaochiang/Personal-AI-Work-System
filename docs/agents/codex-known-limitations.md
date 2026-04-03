# 無法解決的 Codex CLI 支援問題（Known Limitations）

> 記錄日期：2026-04-03  
> 這份文件描述目前在 **repo 層** 無法完全解決的 Codex CLI 支援問題，以及建議的 workaround。

---

## L1：`CODEX.md` 無法成為 OpenAI Codex CLI 的自動入口

### 問題說明
OpenAI Codex CLI 的 repo instruction discovery 機制只自動發現：
- `AGENTS.override.md`
- `AGENTS.md`
- `project_doc_fallback_filenames` 中設定的 fallback filenames（per-machine config）

`CODEX.md` 不是官方預設 discovery 對象，因此不會自動進入 CLI prompt chain。

### 為何無法在 repo 層解決
這個設定存在於 **每台機器的使用者層設定**：
```
~/.codex/config.toml
```
repo 層（`.codex/config.toml` 或 `AGENTS.md`）**不能控制** 這個行為。

### Workaround
**方法 A（每台機器單次設定）：**
在 `~/.codex/config.toml` 加入：
```toml
project_doc_fallback_filenames = ["CODEX.md"]
```
設定後 Codex CLI 會在每個 repo 嘗試讀取 `CODEX.md`。

**方法 B（每次 session 顯式貼入）：**
在 Codex CLI session 啟動時，手動把 `CODEX.md` 內容貼入，或用如下 prompt：
```
Read AGENTS.md first. Then read CODEX.md for Codex-specific context.
```

**現行採用方式**：方法 B（`docs/agents/codex-prompts/v3/` 下所有提示詞均先讀 `AGENTS.md`，再讀 `CODEX.md`）。

---

## L2：`10-style-guide.md` 升級覆蓋 FROZEN 狀態（結構設計問題）

### 問題說明
`10-style-guide.md` 是 managed file（每次模板升級會覆蓋），但檔案開頭包含**專案特定狀態**（`PENDING`/`FROZEN`）。當模板升級時，專案的 FROZEN 狀態會被模板預設值 `PENDING` 覆蓋。

**本次修補**：本次手動恢復為 FROZEN（2026/4/3 Wilson 確認）。

### 為何無法在模板層完整解決
這是模板 managed/protected 邊界的設計缺陷：
- managed file → 模板自動覆蓋 → **正確行為**（規則層面）
- PENDING/FROZEN 狀態 → 屬於專案客製化內容 → **不應被覆蓋**
- 兩者都放在同一個 managed file → 衝突

### 需要的結構修補（待規劃）
長期解法需選擇一種：
- 把 FROZEN 狀態移到 protected file（如 `docs/decisions/` 中的 freeze 記錄）
- 讓升級腳本 bootstrap.py 識別 FROZEN 時跳過狀態行
- 把 `10-style-guide.md` 的狀態行單獨抽出為 init-only 設定項

**目前無法在單次修補中解決**，需要納入模板版本設計討論。

---

## L3：`.agents/skills/` 生效需要 Codex CLI 版本確認

### 問題說明
`.agents/skills/` 是 OpenAI Codex CLI 的 repo-native skills 掃描路徑，但這個路徑的實際生效行為（版本支援、掃描細節）需要在機器上以 `codex exec` 實測才能確認。

**本次修補**：已建立 `.agents/skills/` 並放入 4 個 OpenSpec skill（與 `.github/skills/` 內容相同）。

### 無法保證的部分
- 不同版本的 Codex CLI 對 `.agents/skills/` 的支援可能不同
- skill metadata（YAML frontmatter 的 `name`、`description`）必須符合 Codex CLI 的格式才能被辨識
- **尚未在本機實際以 `codex exec` 驗證這 4 個 skill 的 native discovery 生效**

### 建議驗證步驟
```bash
codex -C D:\program\Personal-AI-Work-System
# 在 session 中輸入：
# "List all available skills you can see in this repo"
# 確認是否出現 openspec-propose, openspec-explore 等
```

---

## 總結

| 編號 | 問題 | 無法解決的原因 | Workaround 已落地 |
|------|------|----------------|-------------------|
| L1 | `CODEX.md` 自動載入 | per-machine config，repo 層控制不到 | ✅ 提示詞已顯式要求讀 CODEX.md |
| L2 | style-guide FROZEN 覆蓋 | managed/protected 設計邊界問題，需模板重構 | ✅ 本次手動恢復 FROZEN |
| L3 | `.agents/skills/` native 生效確認 | 需實測，Codex CLI 版本差異 | ✅ 目錄已建立，待使用者實測 |
