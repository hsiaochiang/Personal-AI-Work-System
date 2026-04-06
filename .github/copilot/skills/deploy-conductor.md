# deploy-conductor（布版生命週期協調）

## 角色定位

布版指揮官。負責協調從「開發完成」到「目標專案升級完成」的整條布版路徑。
包含三個子場景：**Prepare（準備）**、**Execute（執行）**、**Verify（驗證）**。

---

## 環境配置（本機 Dev/Prod 分離）

| 環境 | 路徑 | PORT | NODE_ENV | URL |
|------|------|------|----------|-----|
| 測試區 (Dev) | `d:\program\Personal-AI-Work-System` | 3000 | development | http://localhost:3000 |
| 正式區 (Prod) | `D:\prod\Personal-AI-Work-System` | 3001 | production | http://localhost:3001 |

**正式區機制**：git worktree（與 Dev 共用同一份 `.git`）。Deploy = checkout 到指定 tag。

**首次設置**（已完成，僅供參考）：
```powershell
.\scripts\setup-prod-worktree.ps1
```

**啟動服務**：
```powershell
# 測試區
node d:\program\Personal-AI-Work-System\web\server.js

# 正式區
$env:PORT="3001"; $env:NODE_ENV="production"; node D:\prod\Personal-AI-Work-System\web\server.js
```

---

## 必讀規則

- `rules/75-deploy-governance.md` — 布版治理規範（Gate 條件）
- `rules/70-openspec-workflow.md` — Change Lifecycle（Archive 後觸發布版）
- `rules/35-quality-gate.md` — Done Gate（布版相當於 release gate）

---

## 前置條件（每個場景進入前必須確認）

- [ ] 使用者已確認本次要執行的場景（Prepare / Execute / Verify）
- [ ] 目前在模板專案目錄（不是目標專案目錄）
- [ ] `git status` 無未提交的意外變更

---

## 場景一：Prepare（`#deploy-prepare`）

**觸發時機**：所有 change 已 archive，準備發布新版本時。

**步驟**：

1. **讀取當前版本**
   ```powershell
   Get-Content VERSION
   Get-Content CHANGELOG.md | Select-Object -First 10
   ```

2. **執行 release-check**
   ```powershell
   python deploy/bootstrap.py --release-check --root .
   ```
   - 若 FAIL → 停止，列出失敗原因，要求修正後再跑

3. **比對自上次 tag 以來的異動**
   ```powershell
   git log --oneline $(git describe --tags --abbrev=0)..HEAD
   ```

4. **產出布版準備報告**（格式如下）：

```markdown
## 布版準備報告 — v{VERSION}

**版本**：{VERSION}（patch / minor / major）
**上次布版**：v{LAST_TAG}（{DATE}）

### 異動摘要
{git log 摘要或 CHANGELOG 對應段落}

### 異動檔案分類
| 檔案 | 異動類型 | 分類 | 目標專案影響 |
|------|---------|------|------------|
| ... | 新增/修改 | managed | 自動覆蓋 |
| ... | 修改 | protected | 需人工合併 |

### 待確認項目
- [ ] CHANGELOG.md 已涵蓋所有使用者可見變更
- [ ] docs/distribution-guide.md 步驟正確
- [ ] TEMPLATE-FILES.md 分類清單完整

### 已通過
- [x] release-check PASS（或列出 FAIL 項目）

### 下一步
> 確認上述「待確認項目」後，執行：#deploy-execute
```

---

## 場景二：Execute（`#deploy-execute`）

**觸發時機**：Prepare 通過，準備實際布版。

**步驟**：

1. **建立 git tag**（若尚未建立）
   ```powershell
   git tag -a "v{VERSION}" -m "v{VERSION} — {CHANGELOG 該版本標題}"
   git push --follow-tags
   # ⚠️ 立即切回 main，防止 detached HEAD
   git checkout main
   ```

2. **在 GitHub 建立 Release**
   - 標題：`v{VERSION} — {CHANGELOG 標題}`
   - Release Notes：貼入 CHANGELOG.md 對應版本段落
   - 附加說明：本版本有哪些目標專案需人工合併的 protected files

3. **【本機 prod 布版】執行 deploy-to-prod.ps1**
   ```powershell
   # 預覽（不實際執行）
   .\scripts\deploy-to-prod.ps1 -DryRun

   # 確認後執行部署
   .\scripts\deploy-to-prod.ps1
   # 或指定版本：.\scripts\deploy-to-prod.ps1 -Version 1.2.0
   ```
   > 腳本會自動：確認 tag 存在 → 顯示差異 → 人工確認 → checkout → npm install（如有變動）→ 記錄 runlog

4. **記錄每個目標的結果**：
   | 目標 | 操作 | 結果 |
   |------|------|------|
   | {ProjectA} | upgrade | ✅ 成功 |
   | {ProjectB} | init | ✅ 成功 |

5. **下一步提示**：
   > 執行完成，請進行 #deploy-verify 驗證。

---

## 場景三：Verify（`#deploy-verify`）

**觸發時機**：Execute 完成後，驗證所有目標。

**步驟**：

1. **【本機 prod 驗證】**
   ```powershell
   # 確認正式區 git tag 正確
   git -C "D:\prod\Personal-AI-Work-System" describe --tags

   # 確認正式區服務正常（PORT 3001）
   Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing | Select-Object StatusCode
   ```
   > 啟動正式區服務：`$env:PORT="3001"; $env:NODE_ENV="production"; node D:\prod\Personal-AI-Work-System\web\server.js`
   > 啟動測試區服務：`node d:\program\Personal-AI-Work-System\web\server.js`

2. **執行 smoke**（若在模板專案自驗）
   ```powershell
   python deploy/fixtures/run_smoke.py
   ```

3. **產出驗證報告**：

```markdown
## 布版驗證報告 — v{VERSION}

| 目標 | verify-only | status | smoke | 結論 |
|------|-----------|--------|-------|------|
| {ProjectA} | ✅ PASS | 1.8.0 | — | ✅ |
| {ProjectB} | ✅ PASS | 1.8.0 | — | ✅ |

**整體結論**：✅ 布版完成 / ❌ 有目標未通過（需手動處理）
```

4. **布版完成確認**：
   - [ ] 所有目標 verify-only PASS
   - [ ] 版本號與 tag 一致
   - [ ] 更新 handoff（若本次布版是交接點）

---

## 輸出

| 場景 | 輸出物 |
|------|--------|
| Prepare | 布版準備報告（inline，含下一步提示詞）|
| Execute | git tag + GitHub Release + 批次布版結果記錄 |
| Verify | 驗證報告（inline） |

---

## 注意事項

- 若 Prepare 的 release-check FAIL，不進入 Execute
- git tag 建立後，**必須立即** `git checkout main`（防止 detached HEAD）
- targets.yaml 不入 git，若目標清單為空，只執行模板自驗 smoke
- 布版報告格式為 inline Markdown，不另建檔（除非使用者明確要求）
