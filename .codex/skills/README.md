# .codex/skills — 本地副本說明

> **本目錄為本地副本（local copy），canonical source 為 `.github/skills/`。**
> 若兩者內容不同步，以 `.github/skills/` 為準。

## 為什麼這裡存有副本？

本目錄在 GitHub Copilot Coding agent 環境中方便就近引用。
但它不是 OpenAI Codex CLI 的 repo-native skills 掃描路徑。

## 各平台的正確 skills 路徑

| 平台 | Skills 路徑 | 機制 |
|------|-------------|------|
| OpenAI Codex CLI | `.agents/skills/` | repo-native discovery（官方路徑） |
| GitHub Copilot Coding agent | `.codex/skills/` 或 `.github/skills/` | 顯式引用 |
| GitHub Copilot Chat (VS Code) | `.github/skills/` 與 `.github/copilot/skills/` | 自動掃描 |

## Canonical source

`.github/skills/openspec-{propose,explore,apply-change,archive-change}/SKILL.md`

如需更新 skill，請先更新 canonical source，再同步到此目錄與 `.agents/skills/`。
