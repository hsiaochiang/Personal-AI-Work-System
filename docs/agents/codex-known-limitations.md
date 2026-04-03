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

## ~~L3：`.agents/skills/` 生效需要 Codex CLI 版本確認~~ ✅ 已解決（2026-04-03）

**原問題**：`.agents/skills/` 是否真正被 Codex CLI native discovery 辨識，需要實測確認。

**已解決**：
- `openspec init` + `openspec config profile`（全選 11 workflows）已完成安裝
- `.codex/skills/` 現有 11 個 skills（official Codex tool path，openspec 維護）
- `.agents/skills/` 已同步為 11 個 skills（手動同步自 `.codex/skills/`）
- expanded slash commands（`/opsx-new/ff/verify/sync/continue/bulk-archive/onboard`）全部安裝完畢

**此 limitation 已關閉。**

---

## 總結

| 編號 | 問題 | 無法解決的原因 | 狀態 |
|------|------|----------------|------|
| L1 | `CODEX.md` 自動載入 | per-machine config，repo 層控制不到 | ⚠️ 未解決；Workaround：提示詞顯式讀取 |
| L2 | style-guide FROZEN 覆蓋 | managed/protected 設計邊界問題，需模板重構 | ⚠️ 立即修已做；結構問題待規劃 |
| L3 | `.agents/skills/` native 生效確認 | 需實測 | ✅ 已解決（openspec 全量安裝後 .agents/skills/ 同步至 11 個 skills）|
