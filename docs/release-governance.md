# Release Governance

> 本文件定義版本發布、版本號更新、下游升級契約。目標是讓版本可追溯、可預測、可驗證。

## 版本來源（Single Source of Truth）
- `VERSION`
- `CHANGELOG.md`
- git tag（`vX.Y.Z`）
- `.github/copilot/template-lock.json`

## SemVer 規則
- `PATCH`（x.y.Z）：非破壞性修正與文件補強
- `MINOR`（x.Y.z）：向下相容新能力
- `MAJOR`（X.y.z）：不相容變更或需人工遷移

## Release Checklist
1. 判定本次為 patch / minor / major
2. 更新 `VERSION`
3. 更新 `CHANGELOG.md`
4. 在 template repo 先跑 `python bootstrap_copilot_workspace.py --release-check --root .`
5. 在至少一個既有 target repo 跑升級驗證
6. 建立並推送 tag（`vX.Y.Z`）
7. 更新決策證據（`docs/decision-log.md` / `docs/decisions/`）

## 下游升級契約
- 建議固定流程：`--status` → `--upgrade-preview` → `--upgrade` → `--verify-only`
- 若為 major release，必須提供 migration note
- 若分類規則有變，先跑 `--refresh-lock` 再評估是否套用 upgrade
