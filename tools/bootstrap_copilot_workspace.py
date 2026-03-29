from __future__ import annotations

"""
tools/bootstrap_copilot_workspace.py

目標（解決兩個最耗時的痛點 — GitHub Copilot 版）
1) UI/UX 一致性：把「按鈕/字級/間距/色彩」從逐頁人工微調，改成「有規範、可對照、可 Freeze」。
2) 反覆除錯：把「修了還錯/改錯檔」改成「可重現→定位→修復→驗證→防回歸」的閉環，並強制留下證據。

核心策略（從無到有的正確順序）
- 先 Stitch 產出 UI 基準（HTML）→ 產出 Style Contract → UI/UX 盤點 → Style Freeze → 才開始大量寫 code。

輸出（repo 內會生成）
- AGENTS.md（Copilot / Codex / Gemini 共用入口）
- .github/copilot-instructions.md（Copilot 永久載入的主指令）
- .github/agents/WOS.agent.md（流程自動導航 Agent）
- .github/agents/openspec-planner.agent.md（需求整理 Agent）
- .github/agents/openspec-executor.agent.md（流程自動執行 Agent）
- .github/agents/review-gate.agent.md（最終 Gate Agent）
- .github/copilot/rules/（詳細規範文件，含 70-openspec-workflow.md）
- .github/copilot/skills/（角色分工文件）
- .github/copilot/prompts/（18 個一鍵觸發工作流）
- docs/agents/OPENSPEC_AGENT_GUIDE.zh-TW.md（3-Agent 導入總指南）
- openspec/config.yaml（OpenSpec 設定）
- docs/（證據與追蹤）：roadmap / decision-log / runlog / uiux / bugs / qa
- docs/agents/（跨 agent 共用背景與命令）
- docs/handoff/（工程化交接：current-task / blockers）

⚠️預設行為
- **預設 = safe（保留既有檔案，不直接覆蓋）**
- 覆寫前會自動備份到：`.github/copilot/_backups/<timestamp>/`

用法
    # 1) init：初始化或重建模板檔案
    python tools/bootstrap_copilot_workspace.py --init

    # 2) init + 匯入 Stitch HTML（可選但強烈建議）
    python tools/bootstrap_copilot_workspace.py --init --stitch-html design/stitch/stitch.html

    # 3) status：查看模板狀態（不寫檔）
    python tools/bootstrap_copilot_workspace.py --status

    # 4) upgrade preview：預覽可升級的 managed files（不寫檔）
    python tools/bootstrap_copilot_workspace.py --upgrade-preview

    # 5) refresh lock：只刷新 template lock metadata
    python tools/bootstrap_copilot_workspace.py --refresh-lock

    # 6) upgrade apply：套用 managed files 升級（protected 會跳過）
    python tools/bootstrap_copilot_workspace.py --upgrade-apply

    # 7) upgrade：單一命令執行 preview -> refresh -> apply
    python tools/bootstrap_copilot_workspace.py --upgrade

    # 8) verify：只做健檢（不寫檔）
    python tools/bootstrap_copilot_workspace.py --verify-only

    # 9) 指定專案名稱（用於 openspec config.yaml）
    python tools/bootstrap_copilot_workspace.py --init --project-name MyProject

參數
  --root           repo root（預設：本檔位於 tools/ 時，使用上一層）
  --stitch-html    Stitch 匯出的 html 路徑（可選）
    --init           初始化或重建模板檔案
    --mode           overwrite|safe（預設 safe）
  --no-backup      關閉自動備份（不建議）
    --status         查看模板版本、lock file 與 managed/protected 摘要
    --upgrade-preview 預覽可升級的 managed files 與 protected drift
    --refresh-lock   刷新 template lock metadata（不改其他檔案）
    --upgrade-apply  套用 managed files 升級並刷新 lock file
    --upgrade        依序執行 preview、必要的 refresh、以及 managed files apply
  --verify-only    只做 workspace 健檢（不寫檔）
  --project-name   專案名稱（用於 openspec config，預設取 repo 資料夾名稱）
"""

import argparse
import json
import re
import shutil
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# ---------------------------
# FS helpers
# ---------------------------

def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def today_str() -> str:
    return date.today().isoformat()

def ts_str() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")

def _copy2(src: Path, dst: Path) -> None:
    ensure_dir(dst.parent)
    shutil.copy2(src, dst)

def _should_overwrite(mode: str) -> bool:
    return mode == "overwrite"

def backup_paths(root: Path, rel_paths: List[str], backup_root: Path) -> None:
    for rel in rel_paths:
        p = root / rel
        if p.exists() and p.is_file():
            _copy2(p, backup_root / rel)

def backup_tree(root: Path, rel_dir: str, backup_root: Path) -> None:
    p = root / rel_dir
    if not p.exists():
        return
    for fp in p.rglob("*"):
        if "_backups" in fp.parts:
            continue
        if fp.is_file():
            rel = fp.relative_to(root)
            _copy2(fp, backup_root / rel.as_posix())

def write_text(root: Path, rel: str, content: str, mode: str, backup_root: Optional[Path]) -> str:
    p = root / rel
    ensure_dir(p.parent)
    if p.exists() and not _should_overwrite(mode):
        return "SKIP"
    if p.exists() and backup_root:
        _copy2(p, backup_root / rel)
    p.write_text(content, encoding="utf-8")
    return "WRITE"

def copy_file(root: Path, src: Path, rel_dst: str, mode: str, backup_root: Optional[Path]) -> str:
    dst = root / rel_dst
    ensure_dir(dst.parent)
    if dst.exists() and not _should_overwrite(mode):
        return "SKIP"
    if dst.exists() and backup_root:
        _copy2(dst, backup_root / rel_dst)
    dst.write_bytes(src.read_bytes())
    return "WRITE"


def remove_file(root: Path, rel: str, backup_root: Optional[Path]) -> bool:
    path = root / rel
    if not path.exists() or not path.is_file():
        return False
    if backup_root:
        _copy2(path, backup_root / rel)
    path.unlink()
    return True


def migrate_legacy_agent_guide(root: Path, backup_root: Optional[Path]) -> str:
    legacy_path = root / LEGACY_AGENT_GUIDE_REL
    if not legacy_path.exists() or not legacy_path.is_file():
        return "missing"

    new_path = root / AGENT_GUIDE_REL
    legacy_content = legacy_path.read_text(encoding="utf-8", errors="ignore")
    new_content = read_text_if_exists(new_path)

    if new_content is None:
        ensure_dir(new_path.parent)
        new_path.write_text(legacy_content, encoding="utf-8")
        legacy_path.unlink()
        return "moved"

    if new_content == legacy_content:
        remove_file(root, LEGACY_AGENT_GUIDE_REL, backup_root)
        return "removed"

    if backup_root:
        remove_file(root, LEGACY_AGENT_GUIDE_REL, backup_root)
        return "removed_with_backup"

    return "conflict"


TEMPLATE_LOCK_REL = ".github/copilot/template-lock.json"
AGENT_GUIDE_REL = "docs/agents/OPENSPEC_AGENT_GUIDE.zh-TW.md"
LEGACY_AGENT_GUIDE_REL = "OPENSPEC_AGENT_GUIDE.zh-TW.md"
TEMPLATE_FILES_REL = "TEMPLATE-FILES.md"

MANAGED_PREFIXES = (
    ".github/agents/",
    ".github/prompts/",
    ".github/copilot/rules/",
    ".github/copilot/skills/",
    ".github/copilot/prompts/",
)

MANAGED_EXACT = {
    "AGENTS.md",
    TEMPLATE_FILES_REL,
    ".github/copilot-instructions.md",
    AGENT_GUIDE_REL,
    "openspec/config.yaml",
    ".github/copilot/rules/80-template-boundary.md",
    "docs/agents/agent-entrypoints.md",
    "docs/agents/wos-playbook.md",
    "docs/agents/platform-snippets.md",
    "docs/agents/platform-setup-guide.md",
    "docs/agents/platform-ui-walkthrough.md",
    "docs/agents/platform-onboarding-checklist.md",
    "docs/handoff/README.md",
    "docs/uiux/README.md",
    "docs/bugs/README.md",
    "docs/qa/README.md",
}

PROTECTED_PREFIXES = (
    "docs/runlog/",
    "docs/decisions/",
)

PROTECTED_EXACT = {
    ".github/copilot/rules/50-tech-stack.md",
    ".github/copilot/rules/60-testing.md",
    ".github/copilot/rules/90-project-custom.md",
    "docs/roadmap.md",
    "docs/decision-log.md",
    "docs/system-manual.md",
    "docs/agents/project-context.md",
    "docs/agents/commands.md",
}

INIT_ONLY_EXACT = {
    "docs/handoff/current-task.md",
    "docs/handoff/blockers.md",
    "docs/planning/README.md",
}


def template_repo_root(script_path: Path) -> Path:
    return script_path.parents[1] if script_path.parent.name == "tools" else script_path.parent


def read_template_version(script_path: Path) -> str:
    version_file = template_repo_root(script_path) / "VERSION"
    if not version_file.exists():
        return "0.0.0"
    return version_file.read_text(encoding="utf-8", errors="ignore").strip() or "0.0.0"


def classify_template_path(rel: str) -> str:
    if rel in INIT_ONLY_EXACT:
        return "init-only"
    if rel in PROTECTED_EXACT or any(rel.startswith(prefix) for prefix in PROTECTED_PREFIXES):
        return "protected"
    if rel in MANAGED_EXACT or any(rel.startswith(prefix) for prefix in MANAGED_PREFIXES):
        return "managed"
    return "unmanaged"


def format_classified_paths(rel_paths: List[str]) -> List[str]:
    rows: List[str] = []
    for rel in sorted(set(rel_paths)):
        rows.append(f"[{classify_template_path(rel).upper()}] {rel}")
    return rows


def render_template_files_md(rel_paths: List[str]) -> str:
    managed = sorted(rel for rel in set(rel_paths) if classify_template_path(rel) == "managed")
    protected = sorted(rel for rel in set(rel_paths) if classify_template_path(rel) == "protected")
    init_only = sorted(rel for rel in set(rel_paths) if classify_template_path(rel) == "init-only")
    unmanaged = sorted(rel for rel in set(rel_paths) if classify_template_path(rel) == "unmanaged")

    lines = [
        "# Template Files",
        "",
        "> 這份清單用來回答：哪些檔案屬於模板、哪些檔案可以由專案自己維護。",
        "",
        "## How To Read This File",
        "- Managed files：由模板擁有；下次 upgrade 會被模板最新版覆蓋。若要改，應優先回到 template repo 修。",
        "- Protected files：由模板建立骨架，但內容屬於專案；upgrade 預設不覆蓋。可填寫內容，但不要任意刪掉模板欄位。",
        "- Init-only files：只在第一次 init 時建立骨架；後續 upgrade 與 template lock 不追蹤。",
        "- Project-owned files：模板不追蹤；完全由專案自行維護。",
        "",
        "## Safe Upgrade",
        "- 升級前先跑 `bootstrap_copilot_workspace.py --upgrade-preview --root <target>`。",
        "- 若想查分類，可跑 `bootstrap_copilot_workspace.py --list-managed --root <target>`。",
        "- 若發現需要修改 managed files，應優先回饋上游模板，而不是只在下游專案修改。",
        "",
        f"## Managed Files ({len(managed)})",
    ]
    lines.extend(f"- {rel}" for rel in managed)
    lines.extend([
        "",
        f"## Protected Files ({len(protected)})",
    ])
    lines.extend(f"- {rel}" for rel in protected)
    lines.extend([
        "",
        f"## Init-Only Files ({len(init_only)})",
    ])
    lines.extend(f"- {rel}" for rel in init_only)
    lines.extend([
        "",
        f"## Project-Owned Files In Template Set ({len(unmanaged)})",
        "- 目前模板沒有主動生成 unmanaged 檔案；此區段主要用於偵錯分類。",
    ])
    lines.extend(f"- {rel}" for rel in unmanaged)
    lines.append("")
    return "\n".join(lines)


def build_template_lock(
    script_path: Path,
    project_name: str,
    mode: str,
    rel_paths: List[str],
) -> str:
    managed_files = sorted(rel for rel in rel_paths if classify_template_path(rel) == "managed")
    protected_files = sorted(rel for rel in rel_paths if classify_template_path(rel) == "protected")
    payload = {
        "schema_version": 1,
        "template_version": read_template_version(script_path),
        "project_name": project_name,
        "last_applied_at": datetime.now().isoformat(timespec="seconds"),
        "bootstrap_mode": mode,
        "managed_files": managed_files,
        "protected_files": protected_files,
        "notes": {
            "managed_files": "後續 upgrade 可由模板安全更新的檔案。",
            "protected_files": "專案證據與歷史檔案；status 會追蹤，但後續 upgrade 預設不應直接覆蓋。",
        },
    }
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def load_template_lock(root: Path) -> Dict[str, object]:
    lock_path = root / TEMPLATE_LOCK_REL
    if not lock_path.exists():
        return {}
    try:
        return json.loads(lock_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def read_text_if_exists(path: Path) -> Optional[str]:
    if not path.exists() or not path.is_file():
        return None
    return path.read_text(encoding="utf-8", errors="ignore")


def summarize_paths(title: str, items: List[str], limit: int = 10) -> None:
    print(f"- {title}: {len(items)}")
    for rel in items[:limit]:
        print(f"  - {rel}")
    if len(items) > limit:
        print(f"  - ... and {len(items) - limit} more")


@dataclass
class UpgradePlan:
    desired_files: List[Tuple[str, str]]
    source_version: str
    installed_version: str
    lock_state: str
    lock_metadata_stale: bool
    managed_add: List[str]
    managed_update: List[str]
    managed_unchanged: List[str]
    protected_missing: List[str]
    protected_drift: List[str]
    unmanaged_template: List[str]


def build_upgrade_plan(
    root: Path,
    script_path: Path,
    project_name: str,
    tokens: Optional[StitchTokens],
) -> UpgradePlan:
    lock_data = load_template_lock(root)
    desired_files = collect_template_files(project_name, tokens)
    source_version = read_template_version(script_path)
    installed_version = str(lock_data.get("template_version", "unknown"))
    expected_managed, expected_protected = expected_lock_lists(project_name, tokens)
    current_managed = [str(p) for p in lock_data.get("managed_files", []) if isinstance(p, str)]
    current_protected = [str(p) for p in lock_data.get("protected_files", []) if isinstance(p, str)]
    lock_metadata_stale = current_managed != expected_managed or current_protected != expected_protected

    managed_add: List[str] = []
    managed_update: List[str] = []
    managed_unchanged: List[str] = []
    protected_missing: List[str] = []
    protected_drift: List[str] = []
    unmanaged_template: List[str] = []

    for rel, desired_content in desired_files:
        classification = classify_template_path(rel)
        current_content = read_text_if_exists(root / rel)

        if classification == "managed":
            if current_content is None:
                managed_add.append(rel)
            elif current_content != desired_content:
                managed_update.append(rel)
            else:
                managed_unchanged.append(rel)
            continue

        if classification == "protected":
            if current_content is None:
                protected_missing.append(rel)
            elif current_content != desired_content:
                protected_drift.append(rel)
            continue

        unmanaged_template.append(rel)

    lock_state = "ok"
    if installed_version != source_version:
        lock_state = "update"

    return UpgradePlan(
        desired_files=desired_files,
        source_version=source_version,
        installed_version=installed_version,
        lock_state=lock_state,
        lock_metadata_stale=lock_metadata_stale,
        managed_add=managed_add,
        managed_update=managed_update,
        managed_unchanged=managed_unchanged,
        protected_missing=protected_missing,
        protected_drift=protected_drift,
        unmanaged_template=unmanaged_template,
    )


def ensure_backup_root(root: Path, enabled: bool) -> Optional[Path]:
    if not enabled:
        return None
    backup_root = root / ".github" / "copilot" / "_backups" / ts_str()
    ensure_dir(backup_root)
    return backup_root


def refresh_lock_file(
    root: Path,
    script_path: Path,
    project_name: str,
    mode: str,
    tokens: Optional[StitchTokens],
    backup_root: Optional[Path],
) -> str:
    rel_paths = template_manifest_rel_paths(project_name, tokens)
    rel_paths.append(TEMPLATE_FILES_REL)
    lock_content = build_template_lock(script_path, project_name, mode, rel_paths)
    return write_text(root, TEMPLATE_LOCK_REL, lock_content, "overwrite", backup_root)


def write_template_files(root: Path, rel_paths: List[str], mode: str, backup_root: Optional[Path]) -> str:
    return write_text(root, TEMPLATE_FILES_REL, render_template_files_md(rel_paths), mode, backup_root)


def seed_missing_protected_files(
    root: Path,
    desired_map: Dict[str, str],
    rel_paths: List[str],
    backup_root: Optional[Path],
) -> List[str]:
    written: List[str] = []
    for rel in rel_paths:
        if write_text(root, rel, desired_map[rel], "safe", backup_root) == "WRITE":
            written.append(rel)
    return written


def refresh_lock_workspace(
    root: Path,
    script_path: Path,
    project_name: str,
    tokens: Optional[StitchTokens],
    with_backup: bool,
) -> int:
    backup_root = ensure_backup_root(root, with_backup)
    result = refresh_lock_file(root, script_path, project_name, "refresh", tokens, backup_root)
    print("🔒 Lock refresh")
    print(f"- Root: {root}")
    print(f"- Result: {result}")
    if backup_root:
        print(f"- Backup: {backup_root}")
    print("- template-lock.json 已依最新分類規則刷新。")
    return 0


def load_optional_stitch_tokens(stitch_html: str) -> Optional["StitchTokens"]:
    if not stitch_html:
        return None
    stitch_path = Path(stitch_html).resolve()
    if not stitch_path.exists():
        return None
    try:
        return extract_tokens_from_stitch_html(stitch_path)
    except Exception as e:
        print(f"⚠️  Failed to extract tokens from Stitch HTML: {e}")
        return None


def init_workspace(
    root: Path,
    script_path: Path,
    project_name: str,
    stitch_html: str,
    mode: str,
    with_backup: bool,
) -> int:
    backup_root = ensure_backup_root(root, with_backup)
    if _should_overwrite(mode) and backup_root:
        backup_tree(root, ".github", backup_root)
        backup_tree(root, "docs", backup_root)
        backup_paths(
            root,
            ["AGENTS.md", "openspec/config.yaml", AGENT_GUIDE_REL, LEGACY_AGENT_GUIDE_REL],
            backup_root,
        )

    for d in [
        root / ".github/agents",
        root / ".github/prompts",
        root / ".github/copilot/rules",
        root / ".github/copilot/skills",
        root / ".github/copilot/prompts",
        root / "openspec/specs",
        root / "openspec/changes/archive",
        root / "docs/agents",
        root / "docs/handoff",
        root / "docs/decisions",
        root / "docs/uiux",
        root / "docs/bugs",
        root / "docs/qa",
        root / "docs/runlog",
        root / "design/stitch",
        root / "experience",
    ]:
        ensure_dir(d)

    tokens = load_optional_stitch_tokens(stitch_html)
    if stitch_html:
        stitch_path = Path(stitch_html).resolve()
        if stitch_path.exists():
            copy_file(root, stitch_path, "design/stitch/stitch.html", mode, backup_root)

    files = collect_template_files(project_name, tokens)
    init_only_files = collect_init_only_files()
    rel_paths = template_manifest_rel_paths(project_name, tokens)
    rel_paths.append(TEMPLATE_FILES_REL)
    files.append((TEMPLATE_LOCK_REL, build_template_lock(script_path, project_name, mode, rel_paths)))

    report: List[Tuple[str, str]] = []
    for rel, content in files:
        report.append((rel, write_text(root, rel, content, mode, backup_root)))
    for rel, content in init_only_files:
        report.append((rel, write_text(root, rel, content, mode, backup_root)))
    report.append((TEMPLATE_FILES_REL, write_template_files(root, rel_paths, mode, backup_root)))

    legacy_guide_result = migrate_legacy_agent_guide(root, backup_root)

    writes = sum(1 for _, s in report if s == "WRITE")
    skips = sum(1 for _, s in report if s == "SKIP")

    print(f"✅ Done. mode={mode} WRITE={writes} SKIP={skips} root={root}")
    print(f"📦 Project: {project_name}")
    print("🧭 Mode: init")
    if backup_root:
        print(f"🗂️  Backup created at: {backup_root}")
    if legacy_guide_result in {"moved", "removed", "removed_with_backup"}:
        print(f"🧹 Legacy guide cleanup: {legacy_guide_result} ({LEGACY_AGENT_GUIDE_REL} -> {AGENT_GUIDE_REL})")
    elif legacy_guide_result == "conflict":
        print(f"⚠️  Legacy guide cleanup skipped: {LEGACY_AGENT_GUIDE_REL} 與 {AGENT_GUIDE_REL} 內容不同，請人工確認。")

    if not stitch_html:
        print("ℹ️  Hint: provide Stitch HTML to freeze style guide:")
        print("   python tools/bootstrap_copilot_workspace.py --init --stitch-html design/stitch/stitch.html")
    return 0


def apply_upgrade_workspace(
    root: Path,
    script_path: Path,
    project_name: str,
    tokens: Optional[StitchTokens],
    with_backup: bool,
) -> int:
    lock_data = load_template_lock(root)
    if not lock_data:
        print("❌ 無法執行 upgrade apply：尚未找到 template lock file。")
        print(f"- 請先執行 bootstrap 或 --refresh-lock，建立 {TEMPLATE_LOCK_REL} 後再重試。")
        return 2

    plan = build_upgrade_plan(root, script_path, project_name, tokens)
    desired_map = {rel: content for rel, content in plan.desired_files}
    backup_root = ensure_backup_root(root, with_backup)

    written_add: List[str] = []
    written_update: List[str] = []
    written_protected_missing = seed_missing_protected_files(root, desired_map, plan.protected_missing, backup_root)
    skipped_protected = plan.protected_drift

    for rel in plan.managed_add:
        if write_text(root, rel, desired_map[rel], "overwrite", backup_root) == "WRITE":
            written_add.append(rel)

    for rel in plan.managed_update:
        if write_text(root, rel, desired_map[rel], "overwrite", backup_root) == "WRITE":
            written_update.append(rel)

    template_files_result = write_template_files(
        root,
        template_manifest_rel_paths(project_name, tokens) + [TEMPLATE_FILES_REL],
        "overwrite",
        backup_root,
    )

    legacy_guide_result = migrate_legacy_agent_guide(root, backup_root)

    lock_result = refresh_lock_file(root, script_path, project_name, "upgrade", tokens, backup_root)

    print("🚀 Upgrade apply")
    print(f"- Root: {root}")
    print(f"- Source version: {plan.source_version}")
    print(f"- Installed version before apply: {plan.installed_version}")
    summarize_paths("Managed files added", written_add)
    summarize_paths("Managed files updated", written_update)
    summarize_paths("Protected files seeded", written_protected_missing)
    print(f"- TEMPLATE-FILES result: {template_files_result}")
    summarize_paths("Protected files skipped", skipped_protected)
    print(f"- Lock refresh result: {lock_result}")
    if legacy_guide_result in {"moved", "removed", "removed_with_backup"}:
        print(f"- Legacy guide cleanup: {legacy_guide_result}")
    elif legacy_guide_result == "conflict":
        print(f"- Legacy guide cleanup skipped: {LEGACY_AGENT_GUIDE_REL} content conflicts with {AGENT_GUIDE_REL}")
    if backup_root:
        print(f"- Backup: {backup_root}")
    print("- Upgrade apply 只處理 managed files；protected files 一律跳過。")
    return 0


def upgrade_workspace(
    root: Path,
    script_path: Path,
    project_name: str,
    tokens: Optional[StitchTokens],
    with_backup: bool,
) -> int:
    lock_data = load_template_lock(root)
    if not lock_data:
        print("❌ 無法執行 upgrade：尚未找到 template lock file。")
        print(f"- 請先執行 bootstrap 或 --refresh-lock，建立 {TEMPLATE_LOCK_REL} 後再重試。")
        return 2

    plan = build_upgrade_plan(root, script_path, project_name, tokens)

    print("📦 Upgrade")
    print(f"- Root: {root}")
    print(f"- Installed version: {plan.installed_version}")
    print(f"- Source version: {plan.source_version}")
    print(f"- Lock action: {plan.lock_state}")
    print(f"- Lock metadata state: {'stale' if plan.lock_metadata_stale else 'current'}")
    summarize_paths("Managed files to add", plan.managed_add)
    summarize_paths("Managed files to update", plan.managed_update)
    summarize_paths("Protected files skipped", plan.protected_missing + plan.protected_drift)

    backup_root = ensure_backup_root(root, with_backup)

    if plan.lock_metadata_stale:
        refresh_lock_file(root, script_path, project_name, "upgrade", tokens, backup_root)
        print("- 已先刷新 template lock metadata。")

    desired_map = {rel: content for rel, content in plan.desired_files}
    written_add: List[str] = []
    written_update: List[str] = []
    written_protected_missing = seed_missing_protected_files(root, desired_map, plan.protected_missing, backup_root)

    for rel in plan.managed_add:
        if write_text(root, rel, desired_map[rel], "overwrite", backup_root) == "WRITE":
            written_add.append(rel)

    for rel in plan.managed_update:
        if write_text(root, rel, desired_map[rel], "overwrite", backup_root) == "WRITE":
            written_update.append(rel)

    template_files_result = write_template_files(
        root,
        template_manifest_rel_paths(project_name, tokens) + [TEMPLATE_FILES_REL],
        "overwrite",
        backup_root,
    )

    legacy_guide_result = migrate_legacy_agent_guide(root, backup_root)

    refresh_lock_file(root, script_path, project_name, "upgrade", tokens, backup_root)

    print("\n🚀 Upgrade result")
    summarize_paths("Managed files added", written_add)
    summarize_paths("Managed files updated", written_update)
    summarize_paths("Protected files seeded", written_protected_missing)
    print(f"- TEMPLATE-FILES result: {template_files_result}")
    if legacy_guide_result in {"moved", "removed", "removed_with_backup"}:
        print(f"- Legacy guide cleanup: {legacy_guide_result}")
    elif legacy_guide_result == "conflict":
        print(f"- Legacy guide cleanup skipped: {LEGACY_AGENT_GUIDE_REL} content conflicts with {AGENT_GUIDE_REL}")
    if backup_root:
        print(f"- Backup: {backup_root}")
    print("- Upgrade 已完成；managed files 已套用、缺失的 protected 骨架已補入、既有 protected drift 仍維持跳過，lock file 已刷新。")
    return 0


def upgrade_preview_workspace(
    root: Path,
    script_path: Path,
    project_name: str,
    tokens: Optional[StitchTokens],
) -> int:
    lock_data = load_template_lock(root)
    if not lock_data:
        print("❌ 無法執行 upgrade 預覽：尚未找到 template lock file。")
        print(f"- 請先執行 bootstrap，建立 {TEMPLATE_LOCK_REL} 後再重試。")
        return 2

    plan = build_upgrade_plan(root, script_path, project_name, tokens)

    print("📦 Upgrade preview")
    print(f"- Root: {root}")
    print(f"- Installed version: {plan.installed_version}")
    print(f"- Source version: {plan.source_version}")
    print(f"- Lock action: {plan.lock_state}")
    print(f"- Lock metadata state: {'stale' if plan.lock_metadata_stale else 'current'}")

    summarize_paths("Managed files to add", plan.managed_add)
    summarize_paths("Managed files to update", plan.managed_update)
    print(f"- Managed files unchanged: {len(plan.managed_unchanged)}")
    summarize_paths("Protected files missing (will seed)", plan.protected_missing)
    summarize_paths("Protected files with drift (will skip)", plan.protected_drift)

    print("\n🧭 Preview policy")
    print("- Managed files: 後續 upgrade 可安全新增或更新。")
    print("- Protected files: 缺失的骨架檔會在 upgrade 時安全補入；已有內容差異的 protected files 仍會跳過，不直接覆蓋。")
    print("- Unmanaged template files: 目前不納入 upgrade 套用決策。")

    if plan.unmanaged_template:
        print(f"- Unmanaged template-defined files: {len(plan.unmanaged_template)}")

    print("\n🧭 Suggested next step")
    if plan.managed_add or plan.managed_update:
        print("- 下一步可實作 upgrade 套用模式，沿用這份預覽結果做新增/更新/補入/跳過。")
    elif plan.lock_metadata_stale:
        print("- 目前分類規則已更新，但 lock file 尚未刷新；下一步應提供安全的 lock refresh 或 upgrade apply 流程。")
    elif plan.installed_version != plan.source_version:
        print("- 目前版本不同但 managed files 無內容差異；下一步可先決定 lock file 版本更新策略。")
    else:
        print("- 目前沒有需要套用的 managed 檔案差異；可繼續實作 upgrade 實際套用流程。")

    return 0


def required_workspace_paths(root: Path) -> List[Path]:
    required = [
        root / "TEMPLATE-FILES.md",
        root / "AGENTS.md",
        root / ".github" / "copilot-instructions.md",
        root / ".github" / "agents" / "WOS.agent.md",
        root / ".github" / "agents" / "openspec-planner.agent.md",
        root / ".github" / "agents" / "openspec-executor.agent.md",
        root / ".github" / "agents" / "review-gate.agent.md",
        root / "docs" / "agents" / "OPENSPEC_AGENT_GUIDE.zh-TW.md",
        root / ".github" / "copilot" / "rules" / "10-style-guide.md",
        root / ".github" / "copilot" / "rules" / "20-ux-flow.md",
        root / ".github" / "copilot" / "rules" / "30-debug-contract.md",
        root / ".github" / "copilot" / "rules" / "35-quality-gate.md",
        root / ".github" / "copilot" / "rules" / "36-scope-guard.md",
        root / ".github" / "copilot" / "rules" / "40-roadmap-governance.md",
        root / ".github" / "copilot" / "rules" / "50-tech-stack.md",
        root / ".github" / "copilot" / "rules" / "60-testing.md",
        root / ".github" / "copilot" / "rules" / "70-openspec-workflow.md",
        root / ".github" / "copilot" / "rules" / "80-template-boundary.md",
        root / ".github" / "copilot" / "rules" / "90-project-custom.md",
        root / ".github" / "copilot" / "skills" / "ui-designer.md",
        root / ".github" / "copilot" / "skills" / "ux-fullstack-engineer.md",
        root / ".github" / "copilot" / "skills" / "debug-sheriff.md",
        root / ".github" / "copilot" / "skills" / "smoke-tester.md",
        root / ".github" / "copilot" / "skills" / "openspec-conductor.md",
        root / ".github" / "copilot" / "skills" / "scribe.md",
        root / ".github" / "copilot" / "skills" / "git-steward.md",
        root / ".github" / "copilot" / "skills" / "code-reviewer.md",
        root / "openspec" / "config.yaml",
        root / "docs" / "roadmap.md",
        root / "docs" / "decision-log.md",
        root / "docs" / "agents" / "project-context.md",
        root / "docs" / "agents" / "commands.md",
        root / "docs" / "agents" / "agent-entrypoints.md",
        root / "docs" / "agents" / "wos-playbook.md",
        root / "docs" / "agents" / "platform-snippets.md",
        root / "docs" / "agents" / "platform-setup-guide.md",
        root / "docs" / "agents" / "platform-ui-walkthrough.md",
        root / "docs" / "agents" / "platform-onboarding-checklist.md",
    ]
    for name in PROMPT_FILES:
        required.append(root / ".github" / "copilot" / "prompts" / f"{name}.prompt.md")
    required.append(root / ".github" / "prompts" / "openspec-execute.prompt.md")
    return required


def collect_template_files(project_name: str, tokens: Optional[StitchTokens]) -> List[Tuple[str, str]]:
    files: List[Tuple[str, str]] = []

    files.append(("AGENTS.md", render_agents_md()))
    files.append((".github/copilot-instructions.md", render_copilot_instructions()))

    files.append((".github/agents/WOS.agent.md", render_wos_agent()))
    files.append((".github/agents/openspec-planner.agent.md", render_openspec_planner_agent()))
    files.append((".github/agents/openspec-executor.agent.md", render_openspec_executor_agent()))
    files.append((".github/agents/review-gate.agent.md", render_review_gate_agent()))

    files.append((".github/copilot/rules/10-style-guide.md", rule_10_style_guide(tokens)))
    files.append((".github/copilot/rules/20-ux-flow.md", rule_20_ux_flow()))
    files.append((".github/copilot/rules/30-debug-contract.md", rule_30_debug_contract()))
    files.append((".github/copilot/rules/35-quality-gate.md", rule_35_quality_gate()))
    files.append((".github/copilot/rules/36-scope-guard.md", rule_36_scope_guard()))
    files.append((".github/copilot/rules/40-roadmap-governance.md", rule_40_roadmap_governance()))
    files.append((".github/copilot/rules/50-tech-stack.md", rule_50_tech_stack()))
    files.append((".github/copilot/rules/60-testing.md", rule_60_testing()))
    files.append((".github/copilot/rules/70-openspec-workflow.md", rule_70_openspec_workflow()))
    files.append((".github/copilot/rules/80-template-boundary.md", rule_80_template_boundary()))
    files.append((".github/copilot/rules/85-agent-skill-authoring.md", rule_85_agent_skill_authoring()))
    files.append((".github/copilot/rules/90-project-custom.md", rule_90_project_custom()))

    files.append((".github/copilot/skills/ui-designer.md", skill_ui_designer()))
    files.append((".github/copilot/skills/ux-fullstack-engineer.md", skill_ux_fullstack_engineer()))
    files.append((".github/copilot/skills/debug-sheriff.md", skill_debug_sheriff()))
    files.append((".github/copilot/skills/smoke-tester.md", skill_smoke_tester()))
    files.append((".github/copilot/skills/openspec-conductor.md", skill_openspec_conductor()))
    files.append((".github/copilot/skills/scribe.md", skill_scribe()))
    files.append((".github/copilot/skills/git-steward.md", skill_git_steward()))
    files.append((".github/copilot/skills/code-reviewer.md", skill_code_reviewer()))

    for name in PROMPT_FILES:
        files.append((f".github/copilot/prompts/{name}.prompt.md", render_prompt_file(name)))
    files.append((".github/prompts/openspec-execute.prompt.md", render_openspec_execute_prompt()))
    files.append((AGENT_GUIDE_REL, render_openspec_agent_guide()))

    files.append(("openspec/config.yaml", render_openspec_config(project_name)))

    files.append(("docs/roadmap.md", doc_roadmap()))
    files.append(("docs/decision-log.md", doc_decision_log()))
    files.append(("docs/agents/project-context.md", doc_agents_project_context()))
    files.append(("docs/agents/commands.md", doc_agents_commands()))
    files.append(("docs/agents/agent-entrypoints.md", doc_agents_agent_entrypoints()))
    files.append(("docs/agents/wos-playbook.md", doc_agents_wos_playbook()))
    files.append(("docs/agents/platform-snippets.md", doc_agents_platform_snippets()))
    files.append(("docs/agents/platform-setup-guide.md", doc_agents_platform_setup_guide()))
    files.append(("docs/agents/platform-ui-walkthrough.md", doc_agents_platform_ui_walkthrough()))
    files.append(("docs/agents/platform-onboarding-checklist.md", doc_agents_platform_onboarding_checklist()))
    files.append(("docs/handoff/README.md", doc_handoff_readme()))
    files.append(("docs/uiux/README.md", docs_readme("UI/UX Evidence", "每次 UI/UX 審查的輸出請放在此資料夾（以日期命名）。")))
    files.append(("docs/bugs/README.md", docs_readme("Bugs Evidence", "每個 bug 一份檔案（日期 + slug），包含重現/定位/修復/驗證/防回歸。")))
    files.append(("docs/qa/README.md", docs_readme("QA Evidence（Smoke）", "每次 bugfix 都必須產出一份 smoke 檢查清單與結果（作為 Done Gate）。")))
    files.append(("docs/system-manual.md", doc_system_manual()))
    return files


def collect_init_only_files() -> List[Tuple[str, str]]:
    return [
        ("docs/handoff/current-task.md", doc_handoff_current_task()),
        ("docs/handoff/blockers.md", doc_handoff_blockers()),
        ("docs/planning/README.md", doc_planning_readme()),
    ]


def template_manifest_rel_paths(project_name: str, tokens: Optional[StitchTokens]) -> List[str]:
    rel_paths = [rel for rel, _ in collect_template_files(project_name, tokens)]
    rel_paths.extend(rel for rel, _ in collect_init_only_files())
    return rel_paths


def expected_lock_lists(project_name: str, tokens: Optional[StitchTokens]) -> Tuple[List[str], List[str]]:
    rel_paths = [rel for rel, _ in collect_template_files(project_name, tokens)]
    managed_files = sorted(rel for rel in rel_paths if classify_template_path(rel) == "managed")
    protected_files = sorted(rel for rel in rel_paths if classify_template_path(rel) == "protected")
    return managed_files, protected_files


def status_workspace(root: Path, script_path: Path) -> int:
    source_version = read_template_version(script_path)
    project_name = root.name
    lock_data = load_template_lock(root)
    installed_version = str(lock_data.get("template_version", "未初始化"))
    required = required_workspace_paths(root)
    missing = [p for p in required if not p.exists()]
    expected_managed, expected_protected = expected_lock_lists(project_name, None)

    managed_files = [str(p) for p in lock_data.get("managed_files", []) if isinstance(p, str)]
    protected_files = [str(p) for p in lock_data.get("protected_files", []) if isinstance(p, str)]
    present_managed = sum(1 for rel in managed_files if (root / rel).exists())
    present_protected = sum(1 for rel in protected_files if (root / rel).exists())
    lock_metadata_stale = managed_files != expected_managed or protected_files != expected_protected

    print("📋 Workspace template status")
    print(f"- Root: {root}")
    print(f"- Template source version: {source_version}")
    print(f"- Installed version: {installed_version}")
    print(f"- Lock file: {'present' if lock_data else 'missing'} ({TEMPLATE_LOCK_REL})")

    if lock_data:
        print(f"- Last applied at: {lock_data.get('last_applied_at', 'unknown')}")
        print(f"- Managed files: {present_managed}/{len(managed_files)} present")
        print(f"- Protected files: {present_protected}/{len(protected_files)} present")
        print(f"- Lock metadata state: {'stale' if lock_metadata_stale else 'current'}")
    else:
        print("- Managed files: 尚未建立 lock file，無法追蹤模板管理範圍")

    if missing:
        print(f"- Required files missing: {len(missing)}")
        for path in missing[:10]:
            print(f"  - {path.relative_to(root)}")
        if len(missing) > 10:
            print(f"  - ... and {len(missing) - 10} more")
    else:
        print("- Required files missing: 0")

    print("\n🧭 Suggested next step")
    if not lock_data:
        print("- 先執行 bootstrap 一次，建立 template lock file 與 managed/protected metadata。")
    elif lock_metadata_stale:
        print("- 目前 lock file 分類落後於最新規則；下一步應提供安全的 lock refresh 或 upgrade apply 流程。")
    elif installed_version != source_version:
        print("- 模板版本有差異；下一步應先做 upgrade 預覽，再決定是否套用。")
    elif missing:
        print("- 先補齊缺少的必要檔案，再跑 --verify-only 確認 workspace 完整性。")
    else:
        print("- 目前模板版本與必要檔案狀態正常；可繼續做 upgrade 設計或在目標專案試跑 status。")
    return 0


# ---------------------------
# Stitch token extraction (best-effort)
# ---------------------------

COLOR_PAIR_RE = re.compile(r'"([^"]+)"\s*:\s*"?(#[0-9A-Fa-f]{3,8})"?')
FONT_ARRAY_RE = re.compile(r'("?[a-zA-Z0-9_-]+"?)\s*:\s*\[([^\]]+)\]')
QUOTED_STR_RE = re.compile(r'"([^"]+)"|\'([^\']+)\'')

def _scan_js_object(text: str, start: int) -> Optional[str]:
    i = text.find("{", start)
    if i == -1:
        return None
    depth = 0
    in_str: Optional[str] = None
    esc = False
    for j in range(i, len(text)):
        ch = text[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == in_str:
                in_str = None
            continue
        else:
            if ch in ("'", '"'):
                in_str = ch
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[i : j + 1]
    return None

def _extract_quoted_strings(s: str) -> List[str]:
    out: List[str] = []
    for m in QUOTED_STR_RE.finditer(s):
        val = m.group(1) or m.group(2)
        if val:
            out.append(val)
    return out

@dataclass
class StitchTokens:
    colors: Dict[str, str]
    fonts: Dict[str, List[str]]

def extract_tokens_from_stitch_html(html_path: Path) -> StitchTokens:
    text = html_path.read_text(encoding="utf-8", errors="ignore")
    idx = text.find("tailwind.config")
    colors: Dict[str, str] = {}
    fonts: Dict[str, List[str]] = {}

    if idx != -1:
        obj = _scan_js_object(text, idx)
        if obj:
            for name, hexv in COLOR_PAIR_RE.findall(obj):
                if len(name) < 2:
                    continue
                colors[name.strip()] = hexv.strip()
            for key, arr in FONT_ARRAY_RE.findall(obj):
                family_key = key.strip().strip('"').strip("'")
                items = _extract_quoted_strings(arr)
                if items:
                    fonts[family_key] = items

    return StitchTokens(colors=colors, fonts=fonts)


# ---------------------------
# Render: copilot-instructions.md (main entry, always loaded)
# ---------------------------

def render_copilot_instructions() -> str:
    return f"""\
# GitHub Copilot 工作規範（自動載入）

> 本檔案在每次 Copilot 對話時自動載入。跨 agent 共用入口請先看 `AGENTS.md`；詳細規範請參閱 `.github/copilot/rules/` 與 `.github/copilot/skills/`。

## 基本輸出規則（強制）
- 回覆與說明：**一律使用正體中文**
- 可上網查適合的工具或套件（請附來源連結）
- 對使用者提供的文件：以中文為主；若必須用英文，請在備註區用中文說明

## 治理與留痕（強制）
- 討論結論必須寫入文件（`docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/` / `docs/uiux/` / `docs/bugs/` / `docs/qa/`）
- 維持 `docs/roadmap.md` 最新（回答「目前在哪個階段」）
- 任務交接採事件驅動更新：`docs/handoff/current-task.md` / `docs/handoff/blockers.md`
- 每次 Implement 後：add/commit/push，commit log 使用**繁體中文**（含 What / Why / Impact / Evidence）

## 多 Agent 協作（Copilot / Codex / Gemini）
- 先讀 `AGENTS.md`，再讀 `docs/agents/project-context.md` 與 `docs/agents/commands.md`
- 長期證據沿用 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/`
- 短期交接使用 `docs/handoff/current-task.md` 與 `docs/handoff/blockers.md`
- 不要求每次 prompt 更新 handoff；只在任務開始、子任務完成、遇到 blocker、切換 agent、session 收尾時更新
- agent 可更新進度與驗證狀態，但不可自行默默決定 scope 變更、架構重寫、重大 dependency、新的 release 決策

## Smallest Safe Change（最小安全修改）
- 僅做必要修改；可共用的要共用化
- 沒有證據不得宣稱「已修好」或「已符合」

## 品質門檻（Done Gate）
- UI 修改 → 必須更新 `docs/uiux/<date>_ui-review.md`
- UX 流程修改 → 必須更新 `docs/uiux/<date>_ux-review.md`
- Bug 修復 → 必須產出 `docs/bugs/<date>_<slug>.md` + `docs/qa/<date>_smoke.md`
- 未通過門檻不得宣稱 Done

## 範圍護欄
- 一次改動超過 5 個檔案 → 先記錄決策（`docs/decisions/`）
- 需要改動 Style Contract → 先記錄決策
- 同一問題第 3 次未收斂 → 換策略

## 流程導航與自動執行（Agents）
- 呼叫 `@WOS` 可自動偵測目前狀態並建議下一步
- 呼叫 `OpenSpec Planner` 可先整理 change name / scope / acceptance criteria
- 呼叫 `OpenSpec Executor` 可依已確認的 change 定義自動接續執行 Change Lifecycle
- 呼叫 `Review Gate` 可在收尾前做最終 Gate Review
- WOS 會檢查：roadmap 階段、Change 狀態、git 狀態、今日 runlog
- 不確定該執行什麼時，優先呼叫 `@WOS`
- 要開始新 Change 時，優先先用 `OpenSpec Planner`
- 已有明確 change 定義時，再交給 `OpenSpec Executor`

## 開工流程（每次新任務）
0. 先閱讀 `AGENTS.md`，確認本次是否需要沿用 handoff
1. 呼叫 `@WOS`、`OpenSpec Planner`、`OpenSpec Executor` 或執行 `#session-start`
2. 閱讀 `.github/copilot/rules/` 下所有規範
3. 確認目前階段（`docs/roadmap.md`）
4. 確認當前版本 brief（`docs/planning/v{{N}}-brief.md`），掌握這一版的 scope 與完成條件
   - 4a. 確認 brief 的「使用者確認」區段已填寫（確認日期不為空）—— 若未確認，不可開新 change
   - 4b. 確認 brief 的 Changes 表各項都有狀態欄位（未開始 / 進行中 / 已歸檔）
5. 初始化當日 runlog（`docs/runlog/<date>_README.md`）
6. 檢查 Style Guide 狀態（PENDING/FROZEN）
7. 若是接手中的任務，先同步檢查 `docs/handoff/current-task.md` / `docs/handoff/blockers.md`
8. 回報啟用證據：已讀規範清單、本次使用的角色、產出的證據位置

## 任務觸發（依任務類型讀取對應文件）
| 任務 | Prompt 觸發 | 必讀規範 | 使用角色 | 產出 |
|------|------------|---------|---------|------|
| 開工 | `#session-start` | 全部 rules | — | runlog 初始化 |
| Change 規劃 | `OpenSpec Planner` | `rules/36-scope-guard.md` + `rules/70-openspec-workflow.md` | `openspec-conductor.md` | change 定義摘要 |
| 完整流程自動執行 | `OpenSpec Executor` / `#openspec-execute` | `rules/35-quality-gate.md` + `rules/70-openspec-workflow.md` | `openspec-conductor.md` + `code-reviewer.md` + `git-steward.md` | 依狀態自動推進 Change |
| 最終 Gate | `Review Gate` | `rules/35-quality-gate.md` + `rules/70-openspec-workflow.md` | `code-reviewer.md` | commit/sync/archive 建議 |
| UI 調整 | `#ui-review` | `rules/10-style-guide.md` | `skills/ui-designer.md` | `docs/uiux/<date>_ui-review.md` |
| UX 流程 | `#ux-review` | `rules/20-ux-flow.md` | `skills/ux-fullstack-engineer.md` | `docs/uiux/<date>_ux-review.md` |
| 修 Bug | — | `rules/30-debug-contract.md` | `skills/debug-sheriff.md` + `skills/smoke-tester.md` | `docs/bugs/` + `docs/qa/` |
| 新功能實作 | `#opsx-new` → `#opsx-ff` → `#opsx-apply` | `rules/50-tech-stack.md` + `rules/70-openspec-workflow.md` | `skills/openspec-conductor.md` | spec + runlog + smoke |
| 驗證 | `#opsx-verify` | `rules/35-quality-gate.md` | — | 驗證報告 |
| Code Review | `#code-review` | `rules/50-tech-stack.md` + `rules/60-testing.md` | `skills/code-reviewer.md` | review 記錄 |
| 冒煙測試 | `#smoke-test` | — | `skills/smoke-tester.md` | `docs/qa/<date>_smoke.md` |
| 提交推送 | `#commit-push` | — | `skills/git-steward.md` + `skills/code-reviewer.md` | commit + push |
| 狀態更新 | `#status` | — | — | roadmap + runlog 更新 |
| 記錄決策 | `#log-decision` | — | — | `docs/decision-log.md` + `docs/decisions/` |
| 歸檔 | `#opsx-archive` | — | — | change 歸檔 |
| Agent/Skill/Rule 撰寫 | — | `rules/85-agent-skill-authoring.md` | — | `.agent.md` / `skills/*.md` / `rules/*.md` |
| Session 結束 | `#session-close` | — | `skills/scribe.md` | `experience/<YYYY-MM>/slides_<date>.md` |

## 證據結構
```
docs/
├─ roadmap.md              # 階段追蹤
├─ system-manual.md        # 系統操作手冊（面向使用者）
├─ decision-log.md         # 決策留痕
├─ decisions/<date>_*.md   # 決策詳情
├─ planning/v{{N}}-brief.md  # 版本確認書（含需求確認）
├─ agents/*.md             # 跨 agent 共用背景與命令
├─ handoff/*.md            # 任務交接（current-task / blockers）
├─ runlog/<date>_*.md      # 每日進度
├─ uiux/<date>_*.md        # UI/UX 審查
├─ bugs/<date>_*.md        # Bug 修復
└─ qa/<date>_*.md          # Smoke 測試
```

## 啟用證據（每次回覆強制包含）
- 已讀入的規範清單
- 本次使用的角色
- 產出的證據位置（文件路徑）
"""


# ---------------------------
# Render: rules
# ---------------------------

def rule_10_style_guide(tokens: Optional[StitchTokens]) -> str:
    status = "FROZEN" if tokens and (tokens.colors or tokens.fonts) else "PENDING"
    src = "design/stitch/stitch.html" if tokens else "（尚未提供 Stitch HTML）"
    colors_md = "- （待匯入 Stitch HTML 後自動萃取或人工補齊）"
    fonts_md = "- （待匯入 Stitch HTML 後自動萃取或人工補齊）"

    if tokens and tokens.colors:
        pairs = sorted(tokens.colors.items(), key=lambda kv: kv[0].lower())
        colors_md = "\n".join([f"- `{k}`: `{v}`" for k, v in pairs])
    if tokens and tokens.fonts:
        items = []
        for k, v in sorted(tokens.fonts.items(), key=lambda kv: kv[0].lower()):
            items.append(f"- `{k}`: {', '.join([f'`{x}`' for x in v])}")
        fonts_md = "\n".join(items)

    return f"""\
# 10-style-guide（Style Contract）

> 狀態：**{status}**
> 來源：{src}

## 1) 字體（Fonts）
{fonts_md}

## 2) 顏色（Colors）
{colors_md}

## 3) 間距 / 版面（Spacing / Layout）
- 統一使用 4px 基準（4/8/12/16/24/32...）
- 同一層級卡片 padding 一致（避免每頁漂移）
- 主要內容區塊盡量「有效滿版」：避免左右留白不一致

## 4) 按鈕 / 表單 / 互動狀態（Controls & States）
- Primary/Secondary/Link Button：高度/圓角/字重/hover/disabled/loading 必須一致
- 表單狀態：default / focus / error / success / disabled
- 空狀態（empty state）與載入（loading）必須有明確訊息與 skeleton/indicator

## 5) Freeze 機制（避免 UI 返工）
- UI 確認 OK 後：記錄「Style Freeze」決策到 `docs/decisions/`（原因→影響→驗收→證據）
- Freeze 後若需要改 UI：必須先記錄決策（原因→影響→驗收）才能動

## 6) 行動裝置 / 觸控（Mobile / Touch）
- 觸控目標最小尺寸：48×48 dp（依平台設計規範）
- Safe Area：頂部（狀態列）與底部（手勢列 / Home Indicator）必須留空
- Navigation Bar / Tab Bar：高度與圖示規格統一
- 捲動區域需有明確邊界（避免與系統手勢衝突）
- 長按（long-press）行為需有視覺回饋（highlight / tooltip）

## 7) 深色模式（Dark Mode）
- 提供 Light / Dark 兩組色彩 token（或至少預留命名空間）
- 背景：Dark 模式建議 #121212 或品牌深色，避免純黑 #000000
- 文字對比：Dark 模式下前景/背景對比 ≥ 4.5:1
- 圖片/圖示：需額外確認在深色背景上的可見度

## 8) 無障礙（Accessibility）
- 最小字級：14sp（正文），12sp（輔助文字，不可低於此值）
- 色彩對比：前景/背景 ≥ 4.5:1（WCAG AA）
- 可聚焦元件需有明確的 focus indicator
- 按鈕/連結需提供 accessibility label（螢幕閱讀器可讀）
- 觸控回饋：haptic / ripple / 視覺 highlight（至少擇一）

## 9) 使用方式
- 匯入 Stitch：重新跑 bootstrap `--stitch-html`
- 手動填入 tokens：直接編輯本文件的字體/顏色區段，將狀態改為 **FROZEN**
- 做 UI 盤點：依據本文件 + `skills/ui-designer.md` 產出 `docs/uiux/<date>_ui-review.md`
- Freeze：記錄決策到 `docs/decisions/` + `docs/decision-log.md`
"""


def rule_20_ux_flow() -> str:
    return """\
# 20-ux-flow（UX Flow Contract）

## 目標
- 盤點主要操作流程（happy path / edge cases）
- 每個流程都要有狀態設計：loading / empty / error / success
- 使用者永遠知道：我在哪、下一步是什麼、我做對了嗎

## 產出格式（建議）
- 流程清單：以「使用者目標」命名（例：建立專案、編輯提示詞、匯出、權限設定）
- 每個流程：
  - 前置條件 / 入口
  - 步驟（1..N）
  - 介面反應（按下按鈕後的反應、換頁、提示）
  - 錯誤處理與提示文字（含 retry）
  - 驗收條件（DoD）

## Navigation 架構
- 每個 flow 必須標注使用的 navigation 類型：Stack / Tab / Drawer / Modal
- 頁面層級關係需明確（從哪進、返回到哪）
- Deep link / 通知點擊的入口需標注

## 離線 / 網路狀態
- 明確定義離線策略：local-first / online-only / 混合
- 離線時的 UI 狀態：banner / toast / 功能降級範圍
- 重新上線時的同步行為（自動 / 手動 / 提示）

## 權限流程
- 需要裝置權限的功能（如麥克風、儲存、通知等），需定義：
  - 何時請求（首次使用時 / 啟動時）
  - 拒絕後的 UI 反應（功能降級 + 引導至設定）
  - 永久拒絕的處理

## App 生命週期
- 定義切換至背景時的行為（暫停 / 繼續 / 儲存進度）
- 定義從背景恢復時的行為（刷新 / 恢復 / 提示）
- 長時間背景後（被系統回收）的重新啟動行為

## 手勢規範
- 列出使用的手勢類型：swipe / long-press / pull-to-refresh / pinch 等
- 每個手勢需定義：觸發區域、行為、視覺回饋
- 手勢不可與系統手勢衝突（如邊緣滑動返回）

## 使用方式
- 依據本文件 + `skills/ux-fullstack-engineer.md` 產出 `docs/uiux/<date>_ux-review.md`
"""


def rule_30_debug_contract() -> str:
    return """\
# 30-debug-contract（Debug Contract）

## 除錯閉環（必走）
1) 重現：最短重現步驟（含環境、帳號、資料）
2) 定位：root cause 與定位證據（log / stack trace / diff）
3) 修復：改了哪些檔案、為何是這裡
4) 驗證：修復後如何驗證（步驟 + 證據）
5) 防回歸：補最小必要測試/檢查項（避免下次又壞）

## 禁止事項
- 沒有重現步驟，不得宣稱已修好
- 沒有驗證證據，不得結案

## 行動裝置偵錯（若適用）
- 重現步驟需標注測試裝置：模擬器 / 實機 + OS 版本
- 使用平台對應的 debug 工具（DevTools / 日誌檢視器 / 效能分析器）
- 若為裝置特定問題，需記錄裝置型號與 OS 版本

## 使用方式
- 依據本文件 + `skills/debug-sheriff.md` + `skills/smoke-tester.md`
- 產出 `docs/bugs/<date>_<slug>.md` + `docs/qa/<date>_smoke.md`
"""


def rule_35_quality_gate() -> str:
    return """\
# 35-quality-gate（完成宣告門檻 / Done Gate）

> 目的：處理常遇到的狀況：agent 說「完成可用了」，但一按就錯。

## Done Gate（缺一不可）
- UI 相關修改：
  - 必須更新 `docs/uiux/<date>_ui-review.md`（差異→修正→驗收→證據）
- UX 流程修改：
  - 必須更新 `docs/uiux/<date>_ux-review.md`（flow/狀態/DoD）
- Bug 修復：
  - 必須產出 `docs/bugs/<date>_<slug>.md`（重現/定位/修復/驗證/防回歸）
  - 必須產出 `docs/qa/<date>_smoke.md`（最小 smoke checklist + 結果）
- 功能實作：
  - 必須有對應的規格（spec）或需求描述
  - 必須通過基本 smoke test（主要 happy path 可用）
  - 若有 OpenSpec tasks，需更新 task 狀態
- 效能相關：
  - 批次操作 / 檔案生成 / 大量資料處理需確認不造成 UI 凍結（ANR / 無回應）
  - 若有明顯效能疑慮，需記錄測試結果（操作時間 / 記憶體用量）

## System Manual 更新觸發
- 若 change 影響**使用者可見功能**（新增能力、改變操作方式、移除功能）→ 必須同步更新 `docs/system-manual.md`
- 若 change 只是內部重構或 agent 規則調整，不影響使用者操作 → 不需更新

## 若未通過 Done Gate
- 不得宣稱 Done
- 必須補齊 evidence 後再回報
"""


def rule_36_scope_guard() -> str:
    return """\
# 36-scope-guard（範圍護欄 / Smallest Safe Change 強化）

## 目標
- 避免為了修一個 bug/調一個 UI，把其它頁面或流程一起弄壞（引入新 bug）
- 確保每次改動可回溯、可驗收、可快速回滾

## 觸發條件（遇到就先停、先記錄決策）
- 一次改動超過 5 個檔案
- 需要改動 tokens / Style Contract（10-style-guide）
- 沒有重現步驟卻想大改
- 同一問題第 3 次仍未收斂（代表需要換策略）
- 新增或升級 dependency（套件 / 函式庫）
- 新增或移除頁面路由（navigation route）
- 變更資料庫 schema 或本地儲存結構
- 修改 managed files（模板擁有的檔案；下次 upgrade 可能覆蓋）

## 拆解策略
- 先把「最短修復」做出來 → 先通過 smoke → 再做重構/美化
- 若要修改 managed files，先確認是否應回到上游模板修正，而不是只在下游專案局部改動
"""


def rule_80_template_boundary() -> str:
    return """\
# 80-template-boundary（模板邊界護欄）

## 目標
- 讓 agent 與接手的人都能分辨：哪些檔案屬於模板、哪些屬於專案
- 避免在下游專案直接修改 managed files，導致下次 upgrade 被覆蓋

## 四層分類
- Managed files：模板擁有，upgrade 會以模板最新版覆蓋
- Protected files：模板建立骨架，專案負責填寫內容，upgrade 預設跳過
- Init-only files：只在第一次 init 建立骨架，後續 upgrade 與 template lock 不持續追蹤
- Project-owned files：模板不追蹤，完全由專案維護

## 工作規則
- 編輯前，先查看 `TEMPLATE-FILES.md` 或 `.github/copilot/template-lock.json`
- 若檔案屬於 managed：不要直接修改；先提醒使用者這是模板擁有檔案
- 若檔案屬於 protected：可補內容，但不要刪除模板欄位、標題或骨架
- 若檔案屬於 init-only：可直接依專案狀態維護；後續不應期待 template upgrade 幫你補回這些內容
- 若檔案屬於 project-owned：可依任務自由修改
- 若需要補專案特定規則，優先寫在 `.github/copilot/rules/90-project-custom.md`

## Agent 行為
- 若任務要求修改 managed files，先停下來說明風險，再由使用者決定是否要改上游模板
- 若不確定分類，執行 `bootstrap_copilot_workspace.py --list-managed --root <target>`
- Commit 前，應再次檢查本次改動是否包含 managed files
"""


def rule_85_agent_skill_authoring() -> str:
    return """\
---
applyTo: "**/*.agent.md,**/skills/*.md,**/rules/*.md"
---

# 85-agent-skill-authoring（Agent / Skill / Rule 撰寫規範）

> 目的：確保新增或修改 Agent、Skill、Rule 定義時，遵守專案的規則引用架構，避免規則層與執行層斷裂。
> 本規則在編輯 `.agent.md`、`skills/*.md`、`rules/*.md` 時自動載入。

## 前置步驟（每次新增或修改前必須執行）

```
[ ] 1. 閱讀本文件全部內容
[ ] 2. 閱讀 `.github/copilot-instructions.md` 的任務觸發表
[ ] 3. 閱讀專案現有的 `.github/copilot/rules/` 下所有規則檔
[ ] 4. 列出這個 Agent / Skill / Rule 需要「強制引用」哪些規則
[ ] 5. 確認此 Agent / Skill / Rule 是否與現有定義重複或衝突
[ ] 6. 確認是否需要同步更新 bootstrap render 函式（若此檔案為 managed file）
```

未完成以上步驟，不得開始撰寫定義。

## Rules vs Skills vs Agents — 三者分工

| 類型 | 存放位置 | 用途 | 被動/主動 |
|------|----------|------|-----------|
| **Rule** | `.github/copilot/rules/*.md` | 專案規範、約束條件、不可違反的政策 | **被動**（需要被引用或 `applyTo` 自動載入） |
| **Skill** | `.github/copilot/skills/*.md` | 可重複使用的操作流程、角色定義 | **被動**（在任務觸發表或 agent 定義中被引用） |
| **Agent** | `.github/agents/*.agent.md` | 具備角色、前置條件、執行流程的執行單元 | **主動**（接收指令後執行） |

> 關鍵原則：Rule 是政策文件，Skill 是可重用流程，Agent 是有前置檢查的執行單元。
> 不要把應該是 Skill 的東西寫成 Rule，然後期待 Agent 自己去讀。

## Agent 撰寫規範

### 檔案位置與命名
```
.github/agents/<agent-name>.agent.md
```

### 必要結構

```markdown
---
name: <Agent 名稱>
description: <第三人稱描述，說明角色職責與觸發條件>
tools: [read, search, agent, todo]   # 選用：限制可用工具
---

# 角色
[一句話說明唯一職責]

# 必讀規則（每次啟動時自動套用）
- `rules/<rule-file>.md` — [為什麼要讀]
- `skills/<skill-file>.md` — [為什麼要讀]

# 前置檢查（每次被呼叫時必做）
1. 讀取 [需要讀取的文件或規則]
2. 確認 [關鍵欄位或條件]
3. 若任一條件不符 → 停止，向使用者說明，不得繼續執行

# 工作原則
[列出核心原則]

# 固定輸出格式
[定義輸出結構]
```

### 強制要求
- 每個 Agent **必須有「必讀規則」區塊**，明確列出需要引用的 rules 與 skills
- 每個 Agent **必須有「前置檢查」區塊**，列出啟動前必須確認的條件
- 前置檢查中若有 Gate 條件（如 brief 使用者確認），必須**強制把關**，不符合時停止執行
- description 欄位必須包含觸發條件（Use when... / 適用於...）

## Skill 撰寫規範

### 檔案位置與命名
```
.github/copilot/skills/<skill-name>.md
```

### 必要結構

Skill 不需要 YAML frontmatter，直接以 Markdown 撰寫：

```markdown
# <Skill 名稱>

> 角色定位與使用情境

## 前置條件
[列出使用此 Skill 前必須確認的事項]

## 工作流程
[有序步驟，每步含驗證點]

## 輸出規格
[明確的產出格式、位置、命名]

## 禁止事項
[列出不可違反的限制]
```

## Rule 撰寫規範

### 檔案位置與命名
```
.github/copilot/rules/<NN>-<name>.md
```
- 編號 10~89：模板全域規則（managed，upgrade 會覆蓋）
- 編號 90：專案自訂槽位（protected，upgrade 不覆蓋）

### 必要結構

```markdown
---
applyTo: "<glob-pattern>"     # 選用：自動載入條件
---

# <NN>-<name>（規則標題）

> 目的：[一句話]

## [規範內容]
[具體規則條目]
```

### 何時加 `applyTo`
- 若規則只在特定檔案類型編輯時才需要 → 使用 `applyTo` glob
- 若規則是全域政策（如 scope guard、quality gate）→ 不加 `applyTo`，由 agent 在必讀規則中引用

## 常見設計錯誤（禁止重蹈）

### ❌ Agent 沒有「必讀規則」或「前置檢查」區塊
Agent 定義只有「做什麼」，沒有「開始前先確認什麼」。
→ 每個 Agent 都必須有這兩個區塊。

### ❌ 規則存在但 Agent 不引用
規則寫在 `rules/`，但沒有任何 Agent 在前置條件中讀取它。
→ 在 Agent 的必讀規則中明確列出，並說明要從規則中確認什麼。

### ❌ Gate 條件沒有強制把關
規則要求「使用者確認欄位不為空」，但沒有任何 Agent 檢查它。
→ 把 Gate 條件做成 Agent 的前置檢查，不符合時停止執行。

### ❌ Agent 跳過中間步驟直接執行
Executor 沒有建立 change 目錄就直接改程式碼。
→ 流程步驟必須有驗證點，確認產出存在再進入下一步。

### ❌ 修改了 Agent/Skill/Rule 但沒有同步 bootstrap
若檔案是 managed file，直接改 `.agent.md` 或 `rules/*.md` 會在下次 upgrade 時被覆蓋。
→ 必須同步修改 `bootstrap_copilot_workspace.py` 中對應的 render 函式。

## 完成後的交付

建立或修改完成後，必須：

1. 確認檔案位置符合本規範
2. 若為 managed file → 同步更新 bootstrap render 函式
3. 若為新增檔案 → 更新 `TEMPLATE-FILES.md`（若影響分類計數）
4. 提交供審查（可直接建檔，但需在 commit 前提醒使用者確認）
"""


def rule_90_project_custom() -> str:
    return """\
# 90-project-custom（專案自訂擴充槽位）

## 目標
- 提供下游專案一個安全的規則擴充位置，避免直接修改 managed files
- 讓專案特定偏好、限制與流程能穩定保留，不被 template upgrade 覆蓋

## 什麼應該寫在這裡
- 專案特有的技術限制
- 專案特有的輸出偏好或命名慣例
- 專案特有的工作流補充規則
- 專案特有的禁止事項

## 什麼不應該寫在這裡
- 通用模板規則
- 應回饋到上游 template 的缺陷修正
- 單次任務的暫時性上下文（請寫到 handoff 或 runlog）

## 使用方式
- 若專案需要補充 Copilot rules，先檢查現有 managed rules 是否已涵蓋
- 若沒有涵蓋，再把專案特定規則寫在本檔
- 若本檔與 managed rules 衝突，以人工明確確認後的專案規則為準

## 初始欄位
- Project-specific constraints:
    - 待補
- Project-specific conventions:
    - 待補
- Project-specific workflow notes:
    - 待補
"""


def rule_40_roadmap_governance() -> str:
    return """\
# 40-roadmap-governance（Roadmap 治理與階段管理）

> 目的：確保 roadmap 即時反映專案狀態，階段轉換有據可查，上線決策有明確依據。

## Roadmap 結構（必要區段）
`docs/roadmap.md` 必須包含：
1. **專案範疇**（Scope + Non-goals）
2. **里程碑**（Milestones）— 每個里程碑有驗收標準 checklist
3. **開發階段**（Stages）— 對應到里程碑
4. **目前狀態**（Current / Next / Blockers）
5. **階段轉換記錄**

## 何時必須更新 Roadmap

| 觸發事件 | 更新內容 |
|---------|---------|
| 階段完成（S? → S?+1） | 更新 §4 目前狀態 + §5 轉換記錄 |
| 里程碑驗收通過 | 勾選 §2 對應 checklist |
| 範疇變更（新增/移除功能） | 更新 §1 Scope 或 Non-goals + 記錄決策 |
| 發現阻塞 | 更新 §4 Blockers |
| `#status` prompt 執行時 | 至少更新 §4 |
| `#opsx-archive` 時 | 檢查是否觸發里程碑完成 |

## 階段轉換條件

階段轉換**不可跳級**（除非在 decision-log 中記錄特殊原因）。

### 轉換到下一階段的門檻
| 轉換 | 條件 |
|------|------|
| → S2 | S1 workspace 健檢通過（`--verify-only`） |
| → S3 | Style Freeze 完成（`docs/uiux/` 有 ui-review 且標記 FROZEN） |
| → S4 | OpenSpec Change 的 spec + tasks 已建立且 validate 通過 |
| → S5 | 所有 tasks 完成 + verify 通過 |
| → S6 | Smoke test 全數通過 + 無 P0/P1 未修 bug |

### 里程碑上線門檻
一個里程碑可以「上線」（release）的條件：
1. 該里程碑的**所有驗收標準**（checkbox）全部勾選
2. **Smoke test 通過**（`docs/qa/` 有對應記錄）
3. **無 P0 bug**（`docs/bugs/` 中無未關閉的 P0）
4. **決策已記錄**（`docs/decision-log.md` 含上線決策）

## `#status` 更新範本

執行 `#status` 時，必須輸出以下格式並同步更新 `docs/roadmap.md` §4：

```markdown
## 📊 狀態更新 — {日期}

### Roadmap
- 階段：{S?} {名稱}
- 里程碑：{M?} {名稱}
- 進度：{完成項/總項} 驗收標準已滿足

### 里程碑驗收進度
- M1 資料就緒：{?}/7 ✅
- M2 核心可用：{?}/10 ✅
- M3 練習完整：{?}/9 ✅
- M4 品質收斂：{?}/7 ✅

### 下一步
- {具體行動} — `#prompt-name`

### 風險/阻塞
- {列出或「無」}
```

## 決策記錄觸發
以下情況**必須**同步記錄到 `docs/decision-log.md`：
- 里程碑驗收標準變更
- 階段跳級
- 功能移入/移出 Scope
- 上線時程變更

## 三層規劃結構

本專案採用三層規劃結構，避免把 roadmap、版本規劃、單次 change 混在一起。

| 層級 | 文件 | 回答的問題 |
|------|------|-----------|
| L0 全貌 | `docs/roadmap.md` | 產品方向、版本地圖、目前位置 |
| L1 版本 | `docs/planning/v{{N}}-brief.md` | 這一版核心問題、in/out scope、完成條件 |
| L2 變更 | `openspec/changes/<name>/` | 這一次具體改什麼、怎麼驗收 |

### Agent 判斷流程
若任務不清楚應看哪一層，依下列順序判斷：
- 使用者在問「整個產品接下來怎麼走」→ 先看 `docs/roadmap.md`
- 使用者在問「這一版到底要做什麼」→ 先看對應版本 brief
- 使用者在問「這一次要怎麼改」→ 先看 active OpenSpec change

### 反模式
- 不要拿 roadmap 直接當 implementation task list
- 不要沒有 version brief 就直接開一串 changes
- 不要用單一 change 承接整個版本
- 不要在不同文件各自宣告版本完成（以 `docs/roadmap.md` 為準）

## Version Brief 治理

### 何時必須建立 Version Brief
- 當要推進一個新版本且預期會拆成多個 changes 時
- 存放於 `docs/planning/v{{N}}-brief.md`

### Version Brief 必要區段
1. 版本目標
2. 背景與動機
3. In Scope / Out of Scope
4. 完成條件（Acceptance Criteria，含 checkbox）
5. 預計拆分的 Changes
6. 跨版本影響
7. 使用者確認（確認日期 / 確認人 / 確認範圍）
8. 版本狀態

### Agent 必須遵守的 Brief 規則
- **開新 change 前**：必須先看當前版本 brief，確認 change 在 scope 內
- **版本完成時**：回寫 brief 的完成狀態（勾選 Acceptance Criteria）+ 更新 roadmap
- **跨版本影響**：本版做了什麼決定會影響下一版、out of scope 但下一版應處理的項目、技術債或架構約束，都必須記錄在 brief 的「跨版本影響」區段
- **新版開始時**：先讀上一版 brief 的「跨版本影響」承接脈絡

### 何時必須更新 Version Brief

| 觸發事件 | 更新內容 |
|---------|----------|
| 新 change 開始 | 更新 Changes 表的狀態 |
| change archive | 更新 Changes 表 + 檢查是否所有 changes 都已完成 |
| scope 變更 | 更新 In Scope / Out of Scope |
| 版本完成 | 勾選 Acceptance Criteria + 更新版本狀態 + 填寫跨版本影響 |
| 使用者確認範圍 | 填寫使用者確認區段 |
"""


# ---------------------------
# Render: skills
# ---------------------------

def skill_ui_designer() -> str:
    return r"""
# Skill: ui-designer（UI 前端設計師）

## 任務目標
把「每頁都要慢慢調」變成「有規範可對照、一次修到位」，並把修正計畫做成可交付的清單。

## 依據（Evidence）
- `.github/copilot/rules/10-style-guide.md`（唯一 UI 規範）
- `design/stitch/stitch.html`（Stitch evidence；或補充截圖/錄影/URL）
- 目標頁面/元件檔案（repo 內）

## 輸出（必交付）
- `docs/uiux/<date>_ui-review.md`，內容必含：
  1) **Findings（差異清單）**：逐項列「現況 vs 規範」＋引用規範章節
  2) **Patch Plan（修正計畫）**：可直接執行的修改清單（檔案/元件/範圍）
  3) **Acceptance（驗收）**：如何驗收（視覺/互動/狀態）
  4) **Evidence（證據）**：相關 diff、截圖、或 runlog 位置

## 執行步驟（建議順序）
1) 先讀 style guide，列出「可凍結基準」：字級、按鈕高度、卡片 padding、主色/次色、表單狀態
2) 逐頁比對（或抽 3~5 個代表頁）→ 先抓最大的不一致
3) 只做 Smallest Safe Change：先把 tokens/共用元件拉齊，再調個別頁面
4) 若發現規範本身要改：停止，先記錄決策到 docs/decisions/

## 禁止事項
- 未引用 style guide 就做「主觀美化」
- 一次改太多頁面造成漂移（觸發 scope-guard）
""".lstrip()


def skill_ux_fullstack_engineer() -> str:
    return r"""
# Skill: ux-fullstack-engineer（UX 全端工程師）

## 任務目標
把操作流程一次盤清楚，讓使用者永遠知道「我在哪、下一步是什麼」，並可作為驗收基準。

## 依據（Evidence）
- `.github/copilot/rules/20-ux-flow.md`
- 現有 UI（Stitch/前端頁面）
- 現有需求（若有 OpenSpec specs）

## 輸出（必交付）
- `docs/uiux/<date>_ux-review.md`，內容必含：
  1) **Flow List**：以使用者目標命名（5~15 條）
  2) 每個 Flow 的 **Steps / UI Reaction / States**
  3) **Edge Cases**：error/permission/not found/timeout
  4) **DoD（驗收條件）**
  5) **Open Questions**（需要決策的點）

## 執行步驟
1) 先列 top flows（以最常 demo/最常用的為優先）
2) 每個 flow 強制補狀態：loading/empty/error/success
3) 每個 flow 標注 navigation 類型：Stack / Tab / Drawer / Modal
4) 針對行動 App：補充手勢互動與 haptic / transition 動畫需求
5) 決定最小可用：哪些 flow 必須在 MVP 完成、哪些可延後
""".lstrip()


def skill_debug_sheriff() -> str:
    return r"""
# Skill: debug-sheriff（除錯警長）

## 任務目標
把 bug 修復變成閉環：可重現→定位→修復→驗證→防回歸（並落檔留證據）。

## 依據（Evidence）
- `.github/copilot/rules/30-debug-contract.md`
- 錯誤訊息/stack trace/console log
- 相關頁面與程式碼（檔案路徑）

## 輸出（必交付）
- `docs/bugs/<date>_<slug>.md`，內容必含：
  1) Repro（最短重現步驟）
  2) Root Cause（含定位證據：log/diff）
  3) Fix（改了哪些檔案，為何是這裡）
  4) Verify（如何證明修好）
  5) Regression（防回歸：最小測試/檢查項）
- 需要時：交由 smoke-tester 產出 `docs/qa/<date>_smoke.md`

## 禁止事項
- 沒有重現步驟就大改
- 沒有驗證證據就結案
""".lstrip()


def skill_smoke_tester() -> str:
    return r"""
# Skill: smoke-tester（冒煙測試／最小驗收）

## 任務目標
避免「agent 說完成可用了，但一按就錯」；用最小測試快速擋掉明顯回歸。

## 依據
- `docs/uiux/<date>_ux-review.md`（flows）
- 本次變更範圍（git diff / commit）
- 主要入口頁面/按鈕

## 輸出（必交付）
- `docs/qa/<date>_smoke.md`，內容必含：
  - 測試環境（local/dev）
  - 測試資料/帳號（若需要）
  - Checklist（3~15 條，對應主要 flows）
  - 結果（Pass/Fail + 證據）
  - 若 Fail：連回 bug 文檔（docs/bugs）

## 建議 checklist 範例
- App 可啟動且首頁不報錯
- 主 CTA 按鈕可點擊且有回饋（loading/disable）
- 主要表單可送出且錯誤提示正常
- 主要列表可載入（含 empty state）
""".lstrip()


def skill_openspec_conductor() -> str:
    return r"""
# Skill: openspec-conductor（OpenSpec 指揮官）

## 任務目標
用 OpenSpec 把需求→規格→任務→實作走完；每一步都可驗收、可留證據。

## 依據
- OpenSpec 專案內 `openspec/`（changes / specs / config.yaml）
- `docs/roadmap.md`（目前階段）
- `docs/runlog/<date>_README.md`（當日進度）
- `.github/copilot/rules/70-openspec-workflow.md`（Change Lifecycle）

## 工作流程（對應 Prompt 觸發）

完整 Change Lifecycle 請參閱 `rules/70-openspec-workflow.md`

| 階段 | Prompt | 內建 Skill |
|---|---|---|
| 需求探索 | `#opsx-explore` | `openspec-explore` |
| 建立 Change | `#opsx-new` | `openspec-new-change` |
| 快進 Artifacts | `#opsx-ff` | `openspec-ff-change` |
| 驗證完整性 | `#opsx-validate` | —（CLI + 補充檢查） |
| 實作 | `#opsx-apply` | `openspec-apply-change` |
| 驗證實作 | `#opsx-verify` | `openspec-verify-change` |
| 同步 Specs | `#opsx-sync` | `openspec-sync-specs` |
| 歸檔 | `#opsx-archive` | `openspec-archive-change` |

## Artifact 對應
| OpenSpec 產出 | 對應證據位置 |
|---|---|
| `specs/*.md` | docs/roadmap.md（階段更新） |
| `tasks/*.md` | docs/runlog/（每日進度） |
| 規格變更 | docs/decisions/（決策留痕） |
| 實作完成 | docs/qa/（smoke test） |

## 輸出（必交付）
- 下一步該做什麼（包含要下的指令/動作）
- 規格缺口清單（缺一不可的驗收點）
- evidence 應落檔的位置（runlog / decision / bugs / qa）
""".lstrip()


def skill_scribe() -> str:
    return r"""
# Skill: scribe（記錄官／投影片素材整理）

## 任務目標
把每次 session 的成果整理成可投影片化素材，不依賴冗長對話匯出。

## Inputs
- 本次做了什麼（或 git diff --stat）
- 重要決策（docs/decisions）
- 重要 bug 與修復證據（docs/bugs、docs/qa）

## Outputs（必交付）
- `experience/<YYYY-MM>/slides_<date>_talk-outline.md`，建議結構：
  1) **目標**：本次 session 要解決什麼
  2) **問題**：遇到什麼阻礙 / 挑戰
  3) **方法**：用什麼策略解決
  4) **結果**：前後對照（before/after）
  5) **學到什麼**：踩雷與修正
- 重點素材：問題/方法/對照/示範步驟/踩雷與修正

## Session 結束前 Checklist
- [ ] `docs/roadmap.md` 已更新目前階段
- [ ] `docs/runlog/<date>_README.md` 已記錄今日進度
- [ ] 未結案的 bug 已記錄在 `docs/bugs/`
- [ ] 重要決策已記錄在 `docs/decisions/`
- [ ] 產出 slides outline
""".lstrip()


def skill_git_steward() -> str:
    return r"""
# Skill: git-steward（版本控管管家）

## 任務目標
把每次變更都變成可追溯證據，降低「做了但找不到改哪」的風險。

## 分支策略
- 分支命名慣例：
  - `feature/<slug>` — 新功能
  - `bugfix/<slug>` — Bug 修復
  - `hotfix/<slug>` — 緊急修復
  - `chore/<slug>` — 雜務（依賴升級、CI、文件）
- 主分支保護：不得直接 push 到 main/master（建議）

## Commit Template（繁中）
- What：做了什麼（具體檔案/功能）
- Why：為什麼要做
- Impact：對使用者/系統的影響
- Evidence：如何驗證（測試/截圖/log/文件）

## .gitignore 建議
- 專案初始化時確認 `.gitignore` 包含：
  - 開發框架產生的暫存檔 / build 產出
  - 依賴套件目錄（`node_modules/`、`venv/` 等）
  - 組態檔案（`.env`、`*.local`）
  - OS 產生的檔案（`.DS_Store`、`Thumbs.db`）
  - IDE 設定（`.idea/`、`.vscode/` 中的個人設定）

## PR 流程（若有協作者）
- PR description 格式：What / Why / How to test / Evidence links
- 至少一人 review（或自己用 checklist 自審）
- 合併前確認 smoke test 通過

## Template File Guard
- commit 前先檢查 `.github/copilot/template-lock.json` 的 `managed_files`
- 若本次變更包含 managed files，先明確提醒：這些檔案下次 template upgrade 可能被覆蓋
- 若 managed files 的修改其實屬於模板缺陷，優先回到上游 template repo 修正
- protected files 可正常提交，但盡量維持模板提供的欄位與結構

## Outputs
- 建議的 git 指令序列
- commit message（繁中，含 What/Why/Impact/Evidence）
- 若有風險：提醒需要 review / 分支策略
""".lstrip()


def rule_50_tech_stack() -> str:
    return """\
# 50-tech-stack（技術棧約定）

## 目標
- 統一技術選型，避免同一功能重複引入不同套件
- 新增 dependency 需有決策記錄

## 技術棧清單（依專案填入）

### 語言 / 框架
- （請填入：例如 TypeScript、Python、React Native + Expo、Next.js 等）

### 狀態管理
- （請填入：例如 Zustand、Redux Toolkit、Pinia 等）

### 資料儲存
- 本地：（請填入：例如 AsyncStorage、SQLite、MMKV 等）
- 遠端：（請填入：例如 Supabase、Firebase、自建 API 等）

### UI 元件庫
- （請填入：例如 NativeBase、Tamagui、shadcn/ui 等）

### 測試工具
- 單元測試：（請填入：例如 Jest、Vitest 等）
- 整合 / E2E：（請填入：例如 Detox、Maestro、Playwright 等）

### 其他工具
- 音檔處理：（請填入）
- 多語系：（請填入）
- CI/CD：（請填入）

## 新增 Dependency 規則
- 引入新套件前，先確認沒有現有套件能解決
- 新增套件需記錄決策到 `docs/decisions/`，內容包含：
  - 套件名稱與版本
  - 為什麼選這個（vs 替代方案）
  - 對 bundle size / 啟動速度的影響評估
  - 授權條款（license）確認

## Node / Python 版本
- （請填入：例如 Node ≥ 18、Python ≥ 3.11）

## 使用方式
- 專案初始化時填入本文件
- 每次新增 dependency 時對照並更新
- Style Freeze 後，此文件連同 `10-style-guide.md` 一起凍結
"""


def rule_60_testing() -> str:
    return """\
# 60-testing（測試策略）

## 目標
- 定義最低測試覆蓋標準，避免「只手動測」或「完全沒測」
- 讓每次修改都有可驗證的依據

## 測試金字塔

### 1) 單元測試（Unit）
- 覆蓋範圍：純函式、工具函式、資料轉換、商業邏輯
- 不測 UI 渲染、不測第三方 API
- 最低要求：核心邏輯模組覆蓋率 ≥ 70%

### 2) 整合測試（Integration）
- 覆蓋範圍：元件組合、頁面流程、API 串接（可 mock）
- 確認主要 flow 的 happy path 可通過

### 3) E2E 測試（End-to-End）
- 覆蓋範圍：主要使用者流程（3~5 條 critical path）
- 可使用平台對應的 E2E 工具
- 最低要求：主 CTA 流程可跑通

### 4) Smoke 測試（手動 / 自動化前的替代）
- 參考 `skills/smoke-tester.md` 的 checklist
- 每次 bugfix / feature 完成後必跑

## 命名慣例
- 測試檔案與被測檔案同目錄或 `__tests__/` 子目錄
- 命名：`<filename>.test.ts` 或 `<filename>.spec.ts`

## 何時寫測試
- Bug 修復：修復前先補重現測試（紅燈）→ 修復後轉綠燈
- 新功能：核心邏輯先寫測試 → 再實作
- 重構：確保既有測試全部通過後才動手

## 使用方式
- 此文件為通用策略，具體工具依 `50-tech-stack.md` 定義
- 測試結果作為 Done Gate 證據之一
"""


def rule_70_openspec_workflow() -> str:
    return """\
# 70-openspec-workflow（Change Lifecycle 完整流程）

> 定義一個 Change 從構想到歸檔的完整生命週期，確保每個步驟都不遺漏。

## Change Lifecycle（建議順序）

```
Session Start → Explore（可選）→ New → FF → Validate
    → Apply → Verify → UI Review → UX Review → Smoke Test
    → Code Review → Commit-Push → Status
    → Sync → Archive → Log Decision → Session Close
```

## 各階段說明

### Phase 1：規劃
| 步驟 | 觸發 | 內建 Skill | 專案 Skill | 產出 |
|---|---|---|---|---|
| Session Start | `#session-start` | — | — | runlog 初始化 |
| Explore | `#opsx-explore` | `openspec-explore` | — | 需求釐清筆記 |
| New Change | `#opsx-new` | `openspec-new-change` | `openspec-conductor.md` | change 目錄 + proposal |
| Fast-Forward | `#opsx-ff` | `openspec-ff-change` | — | 所有 artifacts |
| Validate | `#opsx-validate` | — | — | 驗證報告 |

### Phase 2：實作
| 步驟 | 觸發 | 內建 Skill | 專案 Skill | 產出 |
|---|---|---|---|---|
| Apply | `#opsx-apply` | `openspec-apply-change` | — | 程式碼變更 |
| Verify | `#opsx-verify` | `openspec-verify-change` | — | 驗證結果 |

### Phase 3：品質閘
| 步驟 | 觸發 | 專案 Skill | 產出 |
|---|---|---|---|
| UI Review | `#ui-review` | `ui-designer.md` | `docs/uiux/<date>_ui-review.md` |
| UX Review | `#ux-review` | `ux-fullstack-engineer.md` | `docs/uiux/<date>_ux-review.md` |
| Smoke Test | `#smoke-test` | `smoke-tester.md` | `docs/qa/<date>_smoke.md` |
| Code Review | `#code-review` | `code-reviewer.md` | review 記錄 |

### Phase 4：提交與歸檔
| 步驟 | 觸發 | 專案 Skill | 產出 |
|---|---|---|---|
| Commit-Push | `#commit-push` | `git-steward.md` + `code-reviewer.md` | commit + push |
| Status | `#status` | — | roadmap + runlog 更新 |
| Sync Specs | `#opsx-sync` | — | main specs 同步 |
| Archive | `#opsx-archive` | — | change 歸檔 |
| Log Decision | `#log-decision` | — | `docs/decision-log.md` + `docs/decisions/` |
| Session Close | `#session-close` | `scribe.md` | `experience/` slides outline |

## 簡化流程（小型修改）

若 Change 很小（如 bugfix、微調 UI），可省略部分步驟：

```
New → FF → Apply → Verify → Smoke Test → Commit-Push → Archive
```

## 必須遵守
- Apply 前必須有 Validate 通過
- Commit-Push 前必須有 Code Review
- Archive 前必須有 Verify 通過

## 版本收尾檢查（Archive 後）

Archive 完成後，必須檢查當前版本 brief（`docs/planning/v{{N}}-brief.md`）：

1. **若版本 brief 裡所有 Changes 都已 archive → 觸發版本收尾流程：**
   - 勾選 brief 的 Acceptance Criteria
   - 更新 brief 的版本狀態為「已完成」
   - 填寫 brief 的「跨版本影響」區段
   - 更新 `docs/roadmap.md` 的目前狀態
   - 若 change 影響使用者可見功能 → 更新 `docs/system-manual.md`
   - （可選）建立下一版 brief 骨架

2. **若版本 brief 裡仍有未完成的 Changes → 只更新 brief 的 Changes 表狀態**
"""


# ---------------------------
# Render: WOS Agent
# ---------------------------

def render_wos_agent() -> str:
    return '''\
---
description: "Wilson Operation System — 專案快速上手代理。Use when: 回到中斷已久的專案、想快速知道專案目的、目前進度、下一步與可直接使用的提示詞"
tools: [read, search, agent, todo]
---

你是 **WOS（Wilson Operation System）**，專案的低摩擦快速上手代理。
你的職責不是叫使用者自己翻很多文件，而是先幫他把文件內容收斂成「這個專案是什麼、現在在哪裡、下一步做什麼、可以直接複製的提示詞」。
你的核心任務是讓使用者在 VS Code 裡幾乎不用切換心智狀態，就能重新進入開發節奏。

## 回答目標
每次被呼叫時，優先回答這四件事：
1. **為什麼有這個專案**
2. **這個專案目前進度在哪裡**
3. **我接下來該做什麼**
4. **如果我要交給其他 agent 或繼續推進，直接可用的提示詞是什麼**

## 成功條件
- 使用者不用自己翻多份文件
- 使用者看完你的回答，30 秒內知道下一步
- 使用者可以直接複製你給的提示詞到 VS Code Chat 使用
- 若文件不足，你要指出缺哪份文件最影響順暢度

## 核心能力

### 1. 文件優先的狀態摘要
每次被呼叫時，優先依序讀取下列文件，所有回答盡量以這些文件為依據，而不是憑空推測：

```
檢查順序：
1. docs/handoff/current-task.md → 目前任務、已完成、下一步
2. docs/handoff/blockers.md → 是否有阻塞或待決策
3. docs/roadmap.md → 目前大階段（S0~S6）與 Next
4. docs/planning/v{N}-brief.md → 當前版本的 scope、完成條件、changes 進度
5. docs/system-manual.md → 系統目前能做什麼
6. docs/agents/project-context.md → 專案為何存在、邊界、風險
7. docs/agents/commands.md → 現在能跑什麼命令、怎麼驗證
8. docs/runlog/<最近日期>_README.md → 最近一次工作做了什麼
9. docs/decision-log.md → 重要取捨與目前已確立方向
10. 若上述文件不足，再讀 openspec/changes/ 或其他必要文件
```

### 2. 回答策略

- 先用一小段話說明「這個專案為什麼存在」
- 再用目前文件內容總結「現在做到哪裡」
- 再給「下一步」與原因
- 最後給 2 到 4 個可直接複製的提示詞
- 若文件彼此矛盾，要明確指出衝突來源
- 若文件太空，直接說哪些文件缺資訊，不要假裝知道

### 3. 常見情境模式

當使用者沒有講很多細節時，依問題型態自動切到最合適的模式。

| 使用者意圖 | WOS 模式 | 你要優先輸出什麼 |
|---|---|---|
| 我剛回來 / 幫我快速上手 | Resume Mode | 專案目的、目前進度、下一步、提示詞 |
| 我下一步做什麼 | Next Step Mode | 最優先動作、原因、備選動作 |
| 給我提示詞 | Prompt Pack Mode | 2 到 4 個可直接複製的 prompt |
| 我要開始做事 | Start Mode | 最適合先開的 agent / prompt / 命令 |
| 我卡住了 | Unblock Mode | blocker 摘要、先排查什麼、該找哪個 agent |
| 我要交接 | Handoff Mode | 應更新哪些文件、交接 prompt、遺漏風險 |
| 我要驗證 / 收尾 | Verify Mode | 應跑哪些驗證、應叫哪個 agent、收尾順序 |

若使用者只輸入 `@WOS` 或一句很短的問題，預設使用 **Resume Mode**。

### 4. Lifecycle 階段判斷邏輯

| 偵測到的狀態 | 判定階段 | 建議動作 |
|---|---|---|
| 無 runlog 或今日目標為空 | 未開工 | → `#session-start` |
| **brief 的使用者確認為空** | **未確認** | → **先確認 Version Brief 的 scope 與完成條件** |
| **brief 的 Changes 表有 change 缺少狀態** | **治理缺口** | → **補齊 brief Changes 表的狀態欄位** |
| 無進行中 Change | 規劃階段 | → `OpenSpec Planner` |
| Change 有 proposal，無 spec/tasks | 需要 FF | → `#opsx-ff` |
| Change 有 tasks，無實作 | 需要驗證後實作 | → `#opsx-validate` → `#opsx-apply` |
| Change tasks 部分完成 | 實作中 | → 繼續 `#opsx-apply` |
| Change tasks 全部完成 | 需要驗證 | → `#opsx-verify` |
| Verify 通過，有 UI 變更 | 品質閘 | → `#ui-review` |
| Verify 通過，有 UX 變更 | 品質閘 | → `#ux-review` |
| Verify 通過，有 Bug 修復 | 品質閘 | → `#smoke-test` |
| 品質閘通過 | 待審查 | → `#code-review` |
| Review 通過 | 待提交 | → `#commit-push` |
| 已提交，有 delta specs | 待同步 | → `#opsx-sync` |
| 已同步 | 待歸檔 | → `#opsx-archive` → `#log-decision` |
| 一切就緒 | 收尾 | → `#status` → `#session-close` |

### 5. VS Code 低摩擦互動規則

- 預設先給短答案，再給可展開內容，不要一開始丟長篇文件摘要
- 優先給 **一個主要下一步**，次要建議最多一個
- 提示詞一定要可直接貼進 VS Code Chat
- 若適合，明確寫出要用哪個 agent，例如 `@WOS`、`OpenSpec Planner`、`OpenSpec Executor`、`Review Gate`
- 若適合，明確寫出要用哪個 prompt，例如 `#session-start`、`#opsx-apply`、`#code-review`
- 如果需要使用者自己去讀文件，只列最多 3 份最關鍵的，不要把整個 docs 結構再講一遍
- 若目前資訊足夠，就不要叫使用者先去讀文件，直接幫他整理完

### 6. 輸出格式

```markdown
## WOS 快速上手

### 這個專案是做什麼的
- {根據 project-context / roadmap / current-task 的一句到兩句摘要}

### 目前進度
- Roadmap：{S? 階段名稱}
- Version Brief：{V? 版本名稱} — {scope 完成度 / 剩餘 changes 數}
- Current task：{任務名稱或目前主題}
- Done：{已完成重點，最多 3 點}
- In progress / blockers：{若無則明說無}

### 你現在最該做的事
1. {最優先下一步}
    原因：{為什麼這一步最值得先做}
2. {次要下一步，可選}

### 可直接複製的提示詞
1. `@WOS 請用 5 句話告訴我這個專案目的、目前進度、阻塞與下一步。`
2. `{根據目前狀態產生的最適合 prompt，例如 #session-start / OpenSpec Planner / OpenSpec Executor / #opsx-apply}`
3. `{若適合，再提供一個針對驗證、handoff 或 review 的 prompt}`

### 依據的文件
- {這次主要依據了哪些文件}

### 文件健康度
- {哪些關鍵文件完整、哪些過空、哪些可能過期}
```

### 7. 提示詞產生規則

- **若當前版本 brief 的使用者確認為空** → 最優先提示詞為「請先確認 Version Brief」
- **若 brief 的 Changes 表有 change 缺少狀態** → 提示需要補狀態
- 若目前是剛回來、還沒進入實作：優先給 `@WOS`、`#session-start`、`OpenSpec Planner`
- 若已有明確 current-task 且缺執行：優先給 `OpenSpec Executor` 或對應 `#opsx-*`
- 若目前是文件治理或交接整理：優先給能更新 handoff / roadmap / decision-log 的提示詞
- 提示詞要盡量帶上下文，不只丟一個命令名稱
- 若沒有足夠資訊判斷，就先給「補齊資訊用提示詞」，例如要求 agent 先讀 `current-task`、`roadmap`、`project-context`

### 8. 文件健康度判斷

把下列情況視為會增加開發摩擦，並在回答最後簡短提醒：
- `current-task.md` 太空，無法看出下一步
- `project-context.md` 還停在模板占位，導致專案目的不清
- `commands.md` 沒有真實命令，導致下一步無法落地
- `roadmap.md` 與 `current-task.md` 的 Next 不一致
- `runlog` 過久未更新，無法快速知道最近一次工作內容
- 當前版本 brief 不存在或過空，導致無法判斷這一版的 scope
- `system-manual.md` 不存在或過空，導致無法快速了解系統目前能力

若這些問題存在，請用「最低摩擦修補順序」提出建議，而不是一次要求補所有文件。

## 約束
- **不直接修改程式碼或檔案**（只讀取、分析、建議）
- **優先減少使用者查文件成本**，不要把回答變成文件清單
- **不跳過流程步驟**（嚴格按照 `rules/70-openspec-workflow.md`）
- **使用正體中文**回覆
- 若偵測到異常（如 current-task、roadmap、runlog 彼此矛盾），主動警告
'''


def doc_agents_wos_playbook() -> str:
    return """\
# WOS Playbook

> 這份文件是給使用者看的，不是給 WOS 自己看的。
> 目的是讓你在 VS Code 裡，用最少思考成本叫出正確的 WOS 能力。

## WOS 的定位
- WOS 不是拿來取代實作 agent
- WOS 的工作是先幫你快速回到狀態，再把你送到最合適的下一步
- 如果你剛回來、被打斷很久、不知道下一步、需要 prompt，先叫 WOS

## 最常用的 6 種問法

### 1. 30 秒快速回到狀態
```text
@WOS 我剛回來，請用最短方式告訴我：這個專案是做什麼的、目前進度、阻塞、下一步。
```

### 2. 只要下一步
```text
@WOS 不用解釋太多，只告訴我現在最該做的 1 件事，和為什麼。
```

### 3. 直接給我提示詞
```text
@WOS 根據目前狀態，給我 3 個可以直接貼到 VS Code Chat 的提示詞：一個用於開工、一個用於執行、一個用於驗證。
```

### 4. 我卡住了
```text
@WOS 我現在卡住了，請先判斷 blocker 是什麼、先排哪一個、要交給哪個 agent 最合適。
```

### 5. 我要交接
```text
@WOS 我要交接這個任務，請告訴我應該先補哪幾個文件，並給我一段可直接交給下一個 agent 的提示詞。
```

### 6. 我要收尾
```text
@WOS 我準備收尾，請告訴我還缺哪些驗證、review 或文件更新，並給我最短路徑。
```

## 在 VS Code 裡怎麼用最順
- 如果你剛開啟一個久未處理的 repo，第一句就先問 WOS，不要先自己翻 docs
- 若 WOS 已經能說清楚狀態，就直接複製它給的 prompt 去叫下一個 agent
- 若 WOS 說文件過空，先補最影響摩擦的一份，不要一次補全部
- 若你只剩 10 分鐘，也先用 WOS 問「我現在最該做的 1 件事」

## WOS 後面通常會接誰
- 需要收斂範圍：`OpenSpec Planner`
- 需要直接推進執行：`OpenSpec Executor`
- 需要最終把關：`Review Gate`
- 需要再次快速整理上下文：`@WOS`

## 低摩擦原則
- 先問 WOS，再決定要不要翻文件
- 先做一個下一步，不同時追三條線
- 先拿 prompt 再行動，不要自己重想一次
- 若中斷頻繁，優先維護 `current-task.md`、`roadmap.md`、`commands.md`
"""


# ---------------------------
# Render: OpenSpec Planner / Executor / Review Gate Agents
# ---------------------------

def render_openspec_planner_agent() -> str:
    return '''\
---
name: OpenSpec Planner
description: 規劃 OpenSpec change，整理 change name、scope、non-scope、acceptance criteria 與前置風險
---

# 角色
你是 OpenSpec Planner。
你的任務是把需求整理成可以交給 OpenSpec Executor 執行的 change 定義。

# 必讀規則（每次啟動時自動套用）
- `.github/copilot/rules/40-roadmap-governance.md` — Version Brief 治理與三層規劃
- `.github/copilot/rules/36-scope-guard.md` — 範圍護欄
- `.github/copilot/rules/70-openspec-workflow.md` — Change Lifecycle
- `.github/copilot/skills/openspec-conductor.md` — OpenSpec 工作流對應

# 前置檢查（每次被呼叫時必做）
1. 讀取 `docs/roadmap.md`，確認目前版本編號（V?）
2. 讀取 `docs/planning/v{N}-brief.md`（N = 目前版本）
3. 檢查 brief 的「使用者確認」區段：
   - 若確認日期為空 → **停止規劃**，回報：「Version Brief 尚未經使用者確認，請先確認 scope 後再開始規劃」
4. 檢查需求是否在 brief 的 In Scope 範圍內：
   - 若需求超出 scope → **停止規劃**，回報 scope 衝突並建議是否應先修改 brief
5. 檢查 brief 的 Changes 表中是否已有同名或同目的的 active change

# 工作原則
1. 先理解需求，再建議 change name。
2. 先確認 scope / non-scope / acceptance criteria，再交給 Executor。
3. 若資訊不足，先提出最少但必要的關鍵問題。
4. 不直接修改程式碼，不直接進入 apply。
5. 回覆應聯焦在可執行方案，不展開過多分支。
6. 規劃完成後，必須提醒使用者：此 change 需更新 brief 的 Changes 表（加入新 change 並設狀態為「未開始」）。

# 固定輸出格式
## 建議 change name
- 使用 kebab-case
- 名稱可直接對應功能目的

## Scope
- 本次 change 要做的內容

## Non-scope
- 本次 change 明確不做的內容

## Acceptance Criteria
- 可驗收條件，必須具體、可觀察、可測試

## 主要風險
- 規格風險
- 技術風險
- 驗證風險

## 建議交棒內容
- 可直接交給 OpenSpec Executor 的摘要
'''

def render_openspec_executor_agent() -> str:
    return '''\
---
name: OpenSpec Executor
description: 根據已確認的 change 定義，代理執行 OpenSpec 流程與校正流程，遇到 blocking issue 停下回報
---

# 角色
你是 OpenSpec Executor。
你的任務不是討論概念，而是代理使用者完成 OpenSpec change lifecycle。

# 必讀規則（每次啟動時自動套用）
- `.github/copilot/rules/70-openspec-workflow.md` — Change Lifecycle 完整流程
- `.github/copilot/rules/35-quality-gate.md` — Done Gate 門檻
- `.github/copilot/rules/40-roadmap-governance.md` — Version Brief 治理
- `.github/copilot/skills/openspec-conductor.md` — OpenSpec 工作流對應

# 前置檢查（每次被呼叫時必做）
1. 讀取 `docs/roadmap.md`，確認目前版本編號（V?）
2. 讀取 `docs/planning/v{N}-brief.md`（N = 目前版本）
3. 確認 brief 有「使用者確認」區段且確認日期不為空
   - 若未確認 → **停止執行**，回報：「Version Brief 尚未經使用者確認，請先確認 scope 後再開始執行」
4. 確認 change 在 brief 的 In Scope 範圍內
   - 若超出 scope → **停止執行**，回報 scope 衝突

# 核心任務
根據使用者提供的已確認 change 定義，自主完成以下流程：

1. `/opsx-new "<change-name>"`
   - 在 `openspec/changes/<change-name>/` 建立目錄與 proposal.md
   - 更新 `docs/planning/v{N}-brief.md` 的 Changes 表：加入此 change，狀態設為「進行中」
2. `/opsx-ff`
3. `openspec validate "<change-name>" --strict`
4. 審查 proposal、specs、design、tasks 與 validate 結果
5. 若可進入 apply，執行 `/opsx-apply "<change-name>"`
6. 執行 `/opsx-verify "<change-name>"`
7. 執行 `/ui-review`
8. 執行 `/ux-review`
9. 執行 `/status`
10. 若結果允許，執行 `/commit-push`
11. 若結果允許，執行 `/opsx-sync`
12. 若結果允許，執行 `/opsx-archive "<change-name>"`
    - 歸檔後，讀取 brief 的 Changes 表
    - 更新此 change 的狀態為「已歸檔」
    - 若 brief 中所有 changes 都已歸檔 → 觸發版本收尾：
      - 勾選 brief 的 Acceptance Criteria
      - 更新版本狀態為「已完成」
      - 填寫「跨版本影響」區段
      - 更新 `docs/roadmap.md`
      - 若涉及使用者可見功能 → 更新 `docs/system-manual.md`

# 執行規則
1. 嚴格以本次 scope 執行，不得擴大需求。
2. 若在 new / ff / validate 階段發現 blocking issue，立即停止，回報問題與建議修正方向。
3. 若在 apply / verify 階段發現與 acceptance criteria 不一致，立即停止，回報差異。
4. 若 ui-review / ux-review / status 顯示仍有高風險問題，不得進入 commit / sync / archive。
5. 每完成一個階段，都要回報：
   - 當前階段
   - 執行結果
   - blocking / non-blocking issue
   - 下一步建議
6. 若可以繼續，直接往下執行，不要每一步都回問使用者。
7. 僅在以下情況暫停並等待使用者：
   - 需求資訊不足
   - 發現 blocking issue
   - 需要人工做決策
   - 有高風險不可逆操作

# 固定回報格式
## 當前階段
## 執行摘要
## Blocking Issues
## Non-blocking Issues
## 下一步
'''


def render_review_gate_agent() -> str:
    return '''\
---
name: Review Gate
description: 對 OpenSpec Executor 的執行結果進行最終把關，判斷是否可收尾與歸檔
---

# 角色
你是 Review Gate。
你的任務是審查本次 change 是否真的可收斂，不負責重跑整個流程。

# 必讀規則（每次啟動時自動套用）
- `.github/copilot/rules/35-quality-gate.md` — Done Gate 門檻
- `.github/copilot/rules/70-openspec-workflow.md` — Change Lifecycle（確認已走完必要階段）
- `.github/copilot/rules/40-roadmap-governance.md` — Version Brief 治理（確認 brief 狀態）

# 前置檢查（每次被呼叫時必做）
1. 讀取 `docs/planning/v{N}-brief.md`，確認此 change 在 brief 的 In Scope 內
2. 讀取 change 的 proposal / spec / tasks，確認 acceptance criteria 已定義
3. 確認 Done Gate 所需的證據是否都已產出（ui-review / ux-review / smoke / bugs）

# 工作原則
1. 先判斷能不能過關，再討論如何優化。
2. 必須區分 blocking issue 與 non-blocking issue。
3. 必須檢查是否偏離本次 scope 與 acceptance criteria。
4. 必須明確回答是否可 commit / sync / archive。
5. 若不可收尾，要清楚指出阻塞原因與建議修正方向。
6. 若建議 archive，必須提醒 Executor 檢查版本收尾（brief 的 Changes 表是否全部完成）。

# 固定輸出格式
## Change 狀態摘要
## Blocking Issues
## Non-blocking Issues
## Accepted Risks
## Gate Decision
- 是否建議 commit
- 是否建議 /opsx-sync
- 是否建議 /opsx-archive

## Closing Summary
- 本次 change 的最終評語
'''


def render_openspec_execute_prompt() -> str:
    return '''\
---
mode: agent
description: Run the full OpenSpec execution flow for a confirmed change
---

Please act as OpenSpec Executor.

Use the confirmed change definition from the current conversation and run this workflow:
1. /opsx-new "<change-name>"
2. /opsx-ff
3. openspec validate "<change-name>" --strict
4. Review proposal, specs, design, tasks and validate result
5. /opsx-apply "<change-name>"
6. /opsx-verify "<change-name>"
7. /ui-review
8. /ux-review
9. /status
10. /commit-push if safe
11. /opsx-sync if safe
12. /opsx-archive "<change-name>" if safe

Rules:
- Stop only for blocking issues, missing information, or human approval requirements
- Do not expand scope
- Summarize each phase with current stage, result, blocking issues, non-blocking issues, next step
'''


def render_openspec_agent_guide() -> str:
    return '''\
# OpenSpec 3-Agent Guide（正體中文）

本文件整合 OpenSpec Planner、OpenSpec Executor、Review Gate 的導入方式、標準 prompt、流程遷移表與團隊 SOP。

適用對象：
- 要把既有 OpenSpec 指令流改成 agent-driven workflow 的團隊
- 想把原本 11 個以上的手動步驟，壓縮成 3 次主要互動的使用者

---

## 1. 快速開始

建議使用順序：
1. `OpenSpec Planner`：整理 change 定義
2. `OpenSpec Executor`：代理執行主要 lifecycle
3. `Review Gate`：收尾前做最終把關

如果只想確認目前狀態，而不是直接執行，請先使用 `@WOS`。

---

## 2. 標準 Prompt 範本

### 2.1 給 OpenSpec Planner

```text
我要開始一個新的 OpenSpec change。

需求背景：
<貼需求背景>

目標：
<貼本次要達成的目標>

限制：
<貼技術、時程、範圍限制>

請不要寫程式，也不要直接開始執行 OpenSpec。
請先幫我整理成可交給 OpenSpec Executor 的版本，固定輸出：
1. 建議 change name
2. Scope
3. Non-scope
4. Acceptance Criteria
5. 主要風險
6. 建議交棒內容
```

### 2.2 給 OpenSpec Executor

```text
請根據以下已確認的 change 定義，代理執行本次 OpenSpec change lifecycle。

【change 定義】
change name:
<貼 Planner 產出的 change name>

scope:
<貼 Planner 產出的 scope>

non-scope:
<貼 Planner 產出的 non-scope>

acceptance criteria:
<貼 Planner 產出的 acceptance criteria>

主要風險:
<貼 Planner 產出的主要風險>

【你的任務】
請依序執行以下流程，遇到 blocking issue 停下並回報；若無 blocking issue，請直接繼續：
1. /opsx-new "<change-name>"
2. /opsx-ff
3. openspec validate "<change-name>" --strict
4. 審查 proposal、specs、design、tasks 與 validate 結果，判斷是否可進 apply
5. /opsx-apply "<change-name>"
6. /opsx-verify "<change-name>"
7. /ui-review
8. /ux-review
9. /status
10. 若可行，/commit-push
11. 若可行，/opsx-sync
12. 若可行，/opsx-archive "<change-name>"

【執行要求】
- 嚴格依 scope 執行，不可擴大需求
- 每個階段都要簡短回報：當前階段、執行摘要、blocking issues、non-blocking issues、下一步
- 只有在資訊不足、出現 blocking issue、或需要人工決策時才暫停
```

### 2.3 給 Review Gate

```text
請對本次 OpenSpec change 做最終 Gate Review。

請根據以下 Executor 執行結果進行審查：
<貼 Executor 最後輸出的摘要或整段紀錄>

請固定輸出：
1. Change 狀態摘要
2. Blocking Issues
3. Non-blocking Issues
4. Accepted Risks
5. Gate Decision
   - 是否建議 commit
   - 是否建議 /opsx-sync
   - 是否建議 /opsx-archive
6. Closing Summary
```

### 2.4 最小互動版

```text
OpenSpec Planner，請把以下需求整理成可交給 Executor 的 change 定義。
<貼需求>
```

```text
OpenSpec Executor，請根據目前對話裡已確認的 change 定義往下執行，直到遇到 blocking issue、資訊不足或需要人工確認時再停下。
```

```text
Review Gate，請根據目前對話中 Executor 的最後結果，判斷是否建議 commit、sync、archive，並列出 blocking issues。
```

---

## 3. 舊流程遷移表

| 舊操作 | 原本用途 | 新流程歸屬 | 新作法 |
|---|---|---|---|
| `#session-start` | 開工、讀規範、初始化 runlog | WOS / 手動保留 | 需要開工檢查時仍可先用 `@WOS` 或 `#session-start` |
| `#opsx-new` | 建立 change | Executor 內部 | 由 Planner 先產生 change 定義，再交給 Executor 自動執行 |
| `#opsx-ff` | 補齊 artifacts | Executor 內部 | 不再單獨觸發，交給 Executor 接續 |
| `#opsx-validate` | 嚴格驗證 change | Executor 內部 | 由 Executor 自動執行並檢查 blocking issues |
| `#opsx-apply` | 實作 tasks | Executor 內部 | 由 Executor 在 validate 通過後接續 |
| `#opsx-verify` | 驗證實作結果 | Executor 內部 | 由 Executor 內部執行 |
| `#ui-review` | UI 審查 | Executor 內部 | 涉及 UI 時由 Executor 自動帶入 |
| `#ux-review` | UX 審查 | Executor 內部 | 涉及 UX 時由 Executor 自動帶入 |
| `#status` | 更新 roadmap / runlog | Executor 內部 | 不再手動插入，交給 Executor 維護 |
| `#commit-push` | commit / push | Executor + 人工確認 | Executor 先整理結果，是否執行仍需人工確認 |
| `#opsx-sync` | 同步 specs | Executor + Gate | 通常在 Gate 判斷可收尾後再執行 |
| `#opsx-archive` | 歸檔 change | Executor + Gate | Gate 建議可 archive 後再進行 |

舊方式：
1. 自己整理需求
2. 自己下多個 `#opsx-*` 指令
3. 自己決定何時該停

新方式：
1. `OpenSpec Planner`：整理 change 定義
2. `OpenSpec Executor`：代理跑大部分 lifecycle
3. `Review Gate`：判斷是否可 commit / sync / archive

---

## 4. 團隊導入 SOP

### 4.1 角色定義

- `@WOS`：流程導航，不直接執行主要實作
- `OpenSpec Planner`：前置規劃，負責收斂需求與產出 change 定義
- `OpenSpec Executor`：執行代理，負責自動串接主要 lifecycle
- `Review Gate`：最終把關，負責判斷是否可 commit、sync、archive

### 4.2 標準流程

1. 先用 `@WOS` 或 `#session-start` 確認專案狀態
2. 使用 Planner 整理需求
3. 由功能負責人或 Tech Lead 確認 change 定義
4. 交給 Executor 執行 new / ff / validate / apply / verify / review / status
5. 將結果交給 Review Gate
6. commit、push、archive 前由人做最終確認

### 4.3 何時必須人工介入

1. 需求本身不清楚
2. Planner 無法穩定收斂 scope
3. strict validate 失敗且修正方向不唯一
4. apply 後結果與 acceptance criteria 有落差
5. review 顯示仍有高風險問題
6. 涉及架構調整、重大 dependency、資料遷移、安全性議題
7. 準備執行 commit、push、archive 等不可逆操作

### 4.4 什麼時候用手動 prompt

- 只想重跑單一環節，例如 `#ui-review`
- 想針對某個卡點做精細觀察
- 只想補一份缺漏證據，不想讓 Executor 往下串接

### 4.5 導入成功指標

- 成員是否不再頻繁詢問下一步該做什麼
- 是否明顯減少漏掉 validate、verify、review 的情況
- commit / archive 前的阻塞問題是否更早被發現
- 單一 change 的操作次數是否從 11+ 次下降到 3 次主要互動
'''


# ---------------------------
# Render: OpenSpec config.yaml
# ---------------------------

def render_openspec_config(project_name: str) -> str:
    return f"""\
schema: spec-driven

context: |
  專案名稱：{project_name}
  語言：正體中文為主
  治理規範：.github/copilot/rules/*.md
  角色分工：.github/copilot/skills/*.md
  工作流程：.github/copilot/rules/70-openspec-workflow.md
  證據結構：docs/（roadmap / decision-log / runlog / uiux / bugs / qa）
  Commit 慣例：繁體中文（What / Why / Impact / Evidence）

rules:
  proposal:
    - 使用正體中文撰寫
    - 必須包含 Non-goals 區段
    - 必須說明對 roadmap 的影響
  tasks:
    - 每個 task 拆到 2 小時內可完成
    - 每個 task 必須有明確驗收條件
    - 遵守最小安全修改原則
"""


# ---------------------------
# Render: Prompt files（18 個一鍵觸發工作流）
# ---------------------------

PROMPT_FILES: Dict[str, Tuple[str, str]] = {
    "session-start": (
        "開工流程：讀取規範、確認階段、初始化 runlog",
        """\
請執行開工流程（Session Start）：

1. 閱讀 `.github/copilot/rules/` 下所有規範
2. 確認目前階段（`docs/roadmap.md`）
3. 初始化或更新當日 runlog（`docs/runlog/<今日日期>_README.md`）
4. 檢查 Style Guide 狀態（PENDING/FROZEN）
5. 檢查 `openspec/changes/` 是否有進行中的 Change
6. 回報啟用證據：已讀規範清單、本次使用的角色、目前階段""",
    ),
    "opsx-explore": (
        "OpenSpec：需求探索與問題釐清",
        """\
請使用 `openspec-explore` skill 進入探索模式。

協助我釐清需求、調查問題、或討論設計方向。
在探索結束後，總結要點並建議是否建立新的 Change。""",
    ),
    "opsx-new": (
        "OpenSpec：建立新 Change",
        """\
請使用 `openspec-new-change` skill 建立新的 Change。

步驟：
1. 在 `openspec/changes/` 下建立 change 目錄
2. 建立 proposal artifact
3. 確認 Change 名稱和範疇
4. 更新 `docs/runlog/` 記錄本次操作

完成後告訴我下一步該執行什麼（建議 `#opsx-ff` 快進生成所有 artifacts）。""",
    ),
    "opsx-ff": (
        "OpenSpec：快進生成所有 artifacts",
        """\
請使用 `openspec-ff-change` skill 快進完成目前進行中 Change 的所有 artifacts。

這會自動生成：proposal → spec → delta-spec → tasks 等所有必要文件。
完成後提示我進行 `#opsx-validate` 驗證。""",
    ),
    "opsx-validate": (
        "OpenSpec：驗證 Change 完整性（自動呼叫 openspec validate）",
        """\
請對目前進行中的 Change 執行嚴格驗證。

### Step 1：找出目前 Change
- 讀取 `openspec/changes/` 目錄，找出進行中的 change（排除 `archive/`）
- 若無進行中 Change → 告知並停止

### Step 2：執行 OpenSpec CLI 驗證
在終端執行：
```
openspec validate "<change-name>" --strict
```
捕獲輸出結果。

### Step 3：補充檢查（CLI 無法覆蓋的部分）
1. 檢查所有 artifacts 是否完整（proposal / spec / delta-spec / tasks）
2. 檢查 tasks 是否可執行（每個 task 有明確的驗收條件）
3. 檢查 spec 與 delta-spec 是否一致
4. 檢查是否違反 `rules/36-scope-guard.md`（範圍護欄）

### Step 4：輸出驗證報告
```markdown
## 驗證報告：<change-name>

### CLI 驗證
- 結果：PASS / FAIL
- 輸出：（CLI 原始輸出）

### 補充檢查
| 項目 | 狀態 | 說明 |
|---|---|---|
| Artifacts 完整性 | ✅/❌ | ... |
| Tasks 可執行性 | ✅/❌ | ... |
| Spec 一致性 | ✅/❌ | ... |
| 範圍護欄 | ✅/❌ | ... |

### 結論：PASS / WARN / FAIL
```

若有問題，說明需要修正什麼再繼續。
通過後提示進行 `#opsx-apply`。""",
    ),
    "opsx-apply": (
        "OpenSpec：實作 Change 中的 tasks",
        """\
請使用 `openspec-apply-change` skill 實作目前進行中 Change 的 tasks。

遵守規則：
- 參照 `rules/50-tech-stack.md` 技術棧約定
- 遵守 `rules/36-scope-guard.md` 範圍護欄
- 最小安全修改原則（Smallest Safe Change）
- 每完成一個 task 就更新狀態
- 在 `docs/runlog/` 記錄進度

完成後提示我進行 `#opsx-verify` 驗證實作結果。""",
    ),
    "opsx-verify": (
        "OpenSpec：驗證實作是否符合 Change artifacts",
        """\
請使用 `openspec-verify-change` skill 驗證實作結果。

檢查項目：
1. 每個 task 的驗收條件是否滿足
2. 實作是否與 spec / delta-spec 一致
3. 是否有未處理的邊界情況
4. Done Gate（`rules/35-quality-gate.md`）是否通過

若涉及：
- UI 修改 → 提示需要 `#ui-review`
- UX 流程 → 提示需要 `#ux-review`
- Bug 修復 → 提示需要 `#smoke-test`

完成後提示進入品質閘階段。""",
    ),
    "opsx-sync": (
        "OpenSpec：同步 delta specs 到 main specs",
        """\
請使用 `openspec-sync-specs` skill，將目前 Change 的 delta specs 同步到 main specs。

完成後提示進行 `#opsx-archive` 歸檔。""",
    ),
    "opsx-archive": (
        "OpenSpec：歸檔已完成的 Change",
        """\
請使用 `openspec-archive-change` skill 歸檔目前已完成的 Change。

前置條件（必須全部滿足）：
- Verify 已通過
- 相關品質閘已通過（UI/UX review、smoke test）
- Specs 已同步

歸檔後更新 `docs/roadmap.md` 和 `docs/runlog/`。""",
    ),
    "ui-review": (
        "UI 審查：依 Style Guide 比對差異並產出修正計畫",
        """\
請以 `ui-designer` 角色執行 UI 審查。

步驟：
1. 讀取 `rules/10-style-guide.md`（Style Contract）
2. 讀取 `skills/ui-designer.md`（角色說明）
3. 對目標頁面/元件進行比對
4. 產出 `docs/uiux/<今日日期>_ui-review.md`

輸出內容必含：
- Findings（差異清單）：現況 vs 規範 + 引用章節
- Patch Plan（修正計畫）：可直接執行的修改清單
- Acceptance（驗收）：如何驗收
- Evidence（證據）：diff / 截圖 / runlog 位置

如果你不確定目標頁面，請先問我。""",
    ),
    "ux-review": (
        "UX 審查：盤點操作流程、狀態設計、DoD",
        """\
請以 `ux-fullstack-engineer` 角色執行 UX 審查。

步驟：
1. 讀取 `rules/20-ux-flow.md`（UX Flow Contract）
2. 讀取 `skills/ux-fullstack-engineer.md`（角色說明）
3. 盤點目標功能的操作流程
4. 產出 `docs/uiux/<今日日期>_ux-review.md`

輸出內容必含：
- Flow List（使用者目標命名，5~15 條）
- Steps / UI Reaction / States
- Edge Cases（error / permission / not found / timeout）
- DoD（驗收條件）
- Open Questions（需要決策的點）""",
    ),
    "smoke-test": (
        "冒煙測試：最小驗收 checklist",
        """\
請以 `smoke-tester` 角色執行冒煙測試。

步驟：
1. 讀取 `skills/smoke-tester.md`（角色說明）
2. 確認本次變更範圍（git diff 或手動說明）
3. 產出 `docs/qa/<今日日期>_smoke.md`

輸出內容必含：
- 測試環境
- 測試資料/帳號（若需要）
- Checklist（3~15 條，對應主要 flows）
- 結果（Pass / Fail + 證據）
- 若 Fail：連回 bug 文檔路徑""",
    ),
    "code-review": (
        "程式碼審查：安全性、效能、一致性檢查",
        """\
請以 `code-reviewer` 角色執行程式碼審查。

步驟：
1. 讀取 `rules/50-tech-stack.md` + `rules/60-testing.md`
2. 讀取 `skills/code-reviewer.md`（角色說明 + checklist）
3. 檢視本次變更的 diff
4. 依 checklist 逐項檢查：安全性 / 效能 / 一致性 / 可維護性 / 測試

輸出格式：
- 🔴 必修（Must Fix）
- 🟡 建議（Suggestion）
- 🟢 良好（Good）

審查通過後提示可進行 `#commit-push`。""",
    ),
    "status": (
        "狀態更新：同步 roadmap 與 runlog",
        """\
請執行狀態更新：

1. 讀取 `docs/roadmap.md`，確認目前階段
2. 讀取 `openspec/changes/` 查看進行中的 Changes
3. 更新 `docs/roadmap.md`：
   - Current 階段
   - Next 步驟
   - Blockers（阻塞因素）
   - Evidence（證據連結）
4. 更新 `docs/runlog/<今日日期>_README.md`：
   - 今日目標
   - 今日進度
   - 阻塞
   - 證據連結

輸出更新摘要。""",
    ),
    "commit-push": (
        "審查 + 提交 + 推送：先 review 再 commit/push（GitKraken MCP 自動化）",
        """\
請以 `git-steward` + `code-reviewer` 角色執行提交流程。
優先使用 GitKraken MCP 工具（`mcp_gitkraken_*`）執行 git 操作，若 MCP 不可用則 fallback 到終端指令。

**嚴格順序**：

### Step 1：查看變更（GitKraken MCP）
- 使用 `mcp_gitkraken_git_status` 查看目前工作區狀態
- 使用 `mcp_gitkraken_git_log_or_diff` 查看詳細 diff
- 依 `code-reviewer.md` checklist 審查
- 若有 🔴 必修項 → 停止，先修復

### Step 2：Review 結果呈現
- 列出變更檔案清單
- 列出 review 結果（必修/建議/良好）
- **等待我確認後才繼續**

### Step 3：Commit + Push（我確認後執行）
- 產出 commit message（繁體中文，含 What / Why / Impact / Evidence）
- 使用 `mcp_gitkraken_git_add_or_commit` 執行 stage + commit
- 使用 `mcp_gitkraken_git_push` 執行 push

### Fallback（MCP 不可用時）
- 改用終端執行 `git add` + `git commit` + `git push`

注意：
- 不得跳過 review 直接 commit
- commit message 必須使用繁體中文""",
    ),
    "log-decision": (
        "記錄決策：落檔到 decision-log 和 decisions/",
        """\
請執行決策記錄：

1. 確認本次決策的內容（若不清楚，請問我）
2. 在 `docs/decision-log.md` 新增一行：
   - Date | Decision | Why | Impact | Evidence
3. 若為重大決策（Style Freeze / 規範變更 / 架構調整），額外產出：
   - `docs/decisions/<今日日期>_<slug>.md`
   - 內容：背景 / 決策 / 原因 / 影響 / 替代方案 / 證據

完成後確認 decision-log.md 已更新。""",
    ),
    "session-close": (
        "Session 收尾：更新 roadmap、產出 slides outline",
        """\
請以 `scribe` 角色執行 Session 收尾。

### Checklist（逐項完成）：
- [ ] `docs/roadmap.md` 已更新目前階段
- [ ] `docs/runlog/<今日日期>_README.md` 已記錄今日進度
- [ ] 未結案的 bug 已記錄在 `docs/bugs/`
- [ ] 進行中的 Change 狀態已更新
- [ ] 重要決策已記錄在 `docs/decisions/`

### 產出 Slides Outline
在 `experience/<YYYY-MM>/slides_<今日日期>_talk-outline.md` 產出：
1. **目標**：本次 session 要解決什麼
2. **問題**：遇到什麼阻礙/挑戰
3. **方法**：用什麼策略解決
4. **結果**：前後對照（before/after）
5. **學到什麼**：踩雷與修正

### 最後
- 列出所有本次 session 產出的證據文件路徑
- 列出下次 session 建議的第一步""",
    ),
}


def render_prompt_file(name: str) -> str:
    """Render a single .prompt.md file content."""
    desc, body = PROMPT_FILES[name]
    return f"---\nagent: agent\ndescription: \"{desc}\"\n---\n{body}\n"


def skill_code_reviewer() -> str:
    return r"""
# Skill: code-reviewer（程式碼審查員）

## 任務目標
在提交前做結構化的程式碼審查，擋掉安全性、效能、一致性問題。

## 依據
- `.github/copilot/rules/50-tech-stack.md`（技術棧約定）
- `.github/copilot/rules/60-testing.md`（測試策略）
- `.github/copilot/rules/10-style-guide.md`（UI 規範，若涉及前端）
- 本次變更的 diff

## 審查 Checklist

### 安全性
- [ ] 沒有硬編碼的密鑰 / token / 密碼
- [ ] 使用者輸入有做驗證與清理（sanitize）
- [ ] API 呼叫有做錯誤處理
- [ ] 檔案操作有做路徑驗證（避免 path traversal）
- [ ] 沒有暴露敏感資訊到 log / UI

### 效能
- [ ] 沒有不必要的重複渲染 / 重複計算
- [ ] 大量資料處理使用分頁 / 串流 / 批次
- [ ] 非同步操作有適當的 loading 狀態
- [ ] 沒有記憶體洩漏風險（event listener / subscription 有清理）

### 一致性
- [ ] 符合 `50-tech-stack.md` 的技術選型
- [ ] 命名風格一致（camelCase / PascalCase / snake_case）
- [ ] 錯誤處理模式一致（try-catch / Result type / error boundary）
- [ ] 目錄結構符合專案慣例

### 可維護性
- [ ] 函式職責單一（不超過 50 行為佳）
- [ ] 沒有重複程式碼（可抽取的已抽取）
- [ ] 關鍵邏輯有必要的註解
- [ ] 公開 API / 型別有適當的文件

### 測試
- [ ] 新增 / 修改的邏輯有對應測試
- [ ] 測試涵蓋 happy path + 主要 edge case
- [ ] 測試可獨立執行（不依賴外部狀態）

## 輸出（建議格式）
```markdown
## Code Review: <PR/commit 描述>
### 🔴 必修（Must Fix）
- [檔案:行號] 問題描述 → 建議修改

### 🟡 建議（Suggestion）
- [檔案:行號] 問題描述 → 建議修改

### 🟢 良好（Good）
- 值得肯定的做法
```

## 使用方式
- 告訴 Copilot：「請以 code-reviewer 角色審查這次變更」
- 可搭配 `git-steward` 在 commit 前執行
""".lstrip()


# ---------------------------
# Render: docs
# ---------------------------

def doc_roadmap() -> str:
    return f"""\
# Roadmap

> 用來回答：「目前在哪個階段？下一步是什麼？」

## 階段（可自行增修）
- S0：Stitch UI 基準（HTML）
- S1：Bootstrap workspace（rules/skills）
- S2：UI/UX 盤點 + Style Freeze
- S3：OpenSpec 規格（spec→tasks）
- S4：Implement
- S5：Bugfix 收斂 + Smoke + 回歸驗證
- S6：整理投影片素材（分享）

## 目前狀態
- Current：S1（{today_str()}）
- Next：
- Blockers：
- Evidence：
"""


def doc_decision_log() -> str:
    return """\
# Decision Log（決策紀錄）

> 所有取捨與規格變更都要留痕（尤其是 Style Freeze / 規範變更）。

| Date | Decision | Why | Impact | Evidence |
|---|---|---|---|---|
"""


def doc_runlog() -> str:
    return f"""\
# Runlog {today_str()}

## 今日目標
-

## 今日進度
-

## 阻塞
-

## 證據（links / paths）
-

## Handoff Sync
- current-task 已同步：
- blockers 已同步：
"""


def docs_readme(title: str, desc: str) -> str:
    return f"""\
# {title}

- {desc}
"""


def render_agents_md() -> str:
    return """\
# AGENTS.md

> 本檔案是 Copilot、Codex、Gemini Code Assist 在此 repo 的共用入口。平台專屬指令可存在各自設定檔，但共通規則以本檔為準。

## 先讀順序
1. `docs/handoff/current-task.md`
2. `docs/handoff/blockers.md`
3. `docs/roadmap.md`
4. `docs/planning/v{N}-brief.md`（當前版本的 Version Brief）
5. `docs/system-manual.md`
6. `docs/agents/project-context.md`
7. `docs/agents/commands.md`
8. `docs/agents/agent-entrypoints.md`
9. 需要時再讀 `.github/copilot/rules/` 與 `.github/copilot/skills/`

## 協作模式
- 長期證據層：沿用 `docs/roadmap.md`、`docs/decision-log.md`、`docs/runlog/`
- 短期交接層：使用 `docs/handoff/current-task.md`、`docs/handoff/blockers.md`
- 不要求每次 prompt 更新交接文件；採事件驅動更新

## 必須更新 handoff 的事件
1. 開始新任務
2. 完成一個可交接的子任務
3. 出現新的 blocker
4. 準備切換到另一個 agent
5. Session 收尾

## 可由 agent 直接更新的欄位
- Done
- In Progress
- Next Step
- Files Touched
- Validation Status
- Blocker 狀態與已排查內容

## 必須由人確認的事項
- Scope / Non-scope 變更
- 架構重寫或重大抽象調整
- 新增或升級重大 dependency
- 風險接受與上線決策
- merge / release / archive 類不可逆操作

## 更新原則
- 先做 Smallest Safe Change，再更新對應 evidence
- handoff 要短、可續接、可驗證，避免寫成對話紀錄
- 若 handoff 與 roadmap / decision-log 衝突，以 decision-log 與 roadmap 的人工確認內容為準

## 建議回報格式
- Current state
- Changes made
- Validation
- Open issues
- Next step

## Thin Entry Strategy
- Copilot：`.github/copilot-instructions.md` 只保留 Copilot 專屬規則，並先導向本檔
- Codex：若使用自訂 prompt / instructions，內容應只引用本檔與 `docs/agents/*`
- Gemini Code Assist：若使用 workspace prompt 或 chat starter，內容也應只做導讀，不重複維護第二套規範
- 原則：共通規則只維護一份，平台專屬入口只做轉接
"""


def doc_agents_project_context() -> str:
    return f"""\
# Project Context

> 跨 agent 共用背景。請保持精簡，只放穩定且高價值的專案事實。

## Project Summary
- Project name: 待補
- Repository purpose: 待補
- Primary stack: 待補
- Runtime targets: 待補
- Deployment environments: local / dev / staging / prod（依實際情況調整）

## Repository Map
- Application entry points: 待補
- Main packages / apps: 待補
- Shared libraries: 待補
- Infra / scripts / tooling: 待補

## Architecture Boundaries
- Core modules: 待補
- Shared components / libraries: 待補
- External systems / APIs: 待補
- Data ownership boundaries: 待補
- Critical paths: 待補

## Important Files
- App bootstrap / main entry: 待補
- Environment config: 待補
- Test config: 待補
- Build / release config: 待補

## Delivery Constraints
- Current stage: 參考 `docs/roadmap.md`
- Quality gate: 參考 `.github/copilot/rules/35-quality-gate.md`
- Scope changes must be logged in: `docs/decision-log.md`
- High-risk areas: 待補
- Forbidden changes without approval: 待補

## Dependency Policy
- Preferred internal abstractions: 待補
- Approved external dependencies: 待補
- Dependencies requiring review: 待補

## Testing Expectations
- Minimum validation per change: 待補
- Required smoke paths: 待補
- Regression-sensitive areas: 待補

## Collaboration Notes
- Long-term evidence stays in `docs/roadmap.md`, `docs/decision-log.md`, `docs/runlog/`
- Short-term task state stays in `docs/handoff/current-task.md`, `docs/handoff/blockers.md`
- Last initialized by bootstrap on: {today_str()}
"""


def doc_agents_commands() -> str:
    return """\
# Commands

> 在此統一 repo 的常用命令，避免不同 agent 各自猜測執行方式。

## Environment Matrix
- Package manager: 待補
- Language runtimes: 待補
- Required services: 待補
- Secrets / env files: 待補

## Setup
- Install dependencies: 待補
- Initialize dev environment: 待補
- Database / local services: 待補

## OpenSpec CLI
- Install prerequisite: 若此 repo 會在本機執行 OpenSpec CLI，先確認已安裝 Node.js 與 npm
- Install globally: `npm install -g @fission-ai/openspec`
- One-off usage: `npx @fission-ai/openspec --version`
- Verify install: `openspec --version`
- Strict validate example: `openspec validate "<change-name>" --strict`
- Official source: `https://www.npmjs.com/package/@fission-ai/openspec`

## Daily Commands
- Dev server: 待補
- Lint: 待補
- Test: 待補
- Build: 待補
- Smoke test: 待補

## Command Matrix
- Repo-wide checks: 待補
- Backend-only checks: 待補
- Frontend-only checks: 待補
- Targeted test command: 待補
- Format / autofix: 待補

## Working Directories
- Repo root: 待補
- Backend: 待補
- Frontend: 待補
- Package / workspace filters: 待補

## Execution Rules
- 先選對工作目錄，再執行命令
- 優先使用專案既有 script，不自行發明等價命令
- 若命令會改寫檔案，先在回報中標明
- 若命令耗時或具破壞性，先說明目的與預期結果

## Reporting Contract
- 回報執行過哪些命令
- 回報成功 / 失敗與關鍵輸出
- 若未執行驗證，需明確說明原因
- 若命令只適用於某個子專案，需標出工作目錄

## Validation Policy
- Small change: 至少跑對應目標測試或 smoke
- Medium change: 跑 lint + targeted tests + build 或等價驗證
- High-risk change: 補充更完整驗證與風險說明
- 若本次 change 需要在本機執行 OpenSpec strict validate，先確認 `openspec --version` 可用；若未安裝，可先用 `npx @fission-ai/openspec --version` 驗證是否能執行，再決定是否全域安裝

## Notes
- 新增或變更命令時，同步更新本檔
- 若專案有多個 app / package，請在此明確列出工作目錄
- 若此 repo 會實際執行 OpenSpec CLI，不要只寫 `openspec validate` 指令；應一併記錄安裝前置與版本檢查方式
"""


def doc_agents_agent_entrypoints() -> str:
    return """\
# Agent Entrypoints

> 本檔定義各平台應如何做薄入口。重點不是複製規範，而是把不同 agent 導到同一套共享文件。

## Shared Principle
- 入口檔只做導讀，不重複整份規範
- 共享規則來源：`AGENTS.md`、`docs/agents/`、`docs/handoff/`
- 若平台支援常駐 instructions，優先要求先讀共享文件，再補平台專屬限制

## Copilot
- 使用 `.github/copilot-instructions.md` 作為常駐入口
- 內容重點：先讀 `AGENTS.md`，再依任務需要讀 `.github/copilot/rules/` 與 `.github/copilot/skills/`
- Copilot 專屬內容應限於：語言、輸出格式、工具使用方式、Copilot agents / prompts 的導引

## Codex
- 若使用 repo instructions、workspace prompt、custom task prompt，建議內容只有：
    1. 先讀 `AGENTS.md`
    2. 任務開始或切換前同步 `docs/handoff/`
    3. 命令以 `docs/agents/commands.md` 為準
- 不要在 Codex 專屬入口重寫完整流程規範

## Gemini Code Assist
- 若使用 workspace context、starter prompt、pinned prompt，建議內容只有：
    1. 先讀 `AGENTS.md`
    2. 長期證據看 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/`
    3. 短期交接看 `docs/handoff/`
- Gemini 專屬入口只補充平台限制，例如回覆長度、偏好的工作模式、是否可自行執行命令

## What Not To Do
- 不要為 Copilot / Codex / Gemini 各維護一整套不同規範
- 不要把共享規則只寫在某單一平台入口
- 不要把 handoff 內容寫成平台綁定語法
"""


def doc_agents_platform_snippets() -> str:
    return """\
# Platform Snippets

> 可直接貼到不同平台的最小入口文字。原則是短、只做導讀、不重複維護整套規範。

## Copilot Minimal Entrypoint

```text
先讀 AGENTS.md。
若有接手中的任務，再讀 docs/handoff/current-task.md 與 docs/handoff/blockers.md。
命令與驗證方式以 docs/agents/commands.md 為準。
長期背景以 docs/agents/project-context.md、docs/roadmap.md、docs/decision-log.md、docs/runlog/ 為準。
只在這些事件更新 handoff：新任務開始、完成子任務、出現 blocker、切換 agent、session 收尾。
不可自行決定 scope 變更、架構重寫、重大 dependency、merge、release。
```

## Codex Minimal Entrypoint

```text
Read AGENTS.md first.
If this is a handoff, read docs/handoff/current-task.md and docs/handoff/blockers.md next.
Use docs/agents/commands.md as the source of truth for setup, test, lint, build, and smoke commands.
Use docs/agents/project-context.md, docs/roadmap.md, docs/decision-log.md, and docs/runlog/ for project context.
Update handoff only on task start, subtask completion, blocker discovery, agent switch, or session close.
Do not silently change scope, rewrite architecture, add major dependencies, or perform irreversible actions without approval.
```

## Gemini Code Assist Minimal Entrypoint

```text
Read AGENTS.md first.
For an in-progress task, read docs/handoff/current-task.md and docs/handoff/blockers.md.
For stable project context, use docs/agents/project-context.md, docs/agents/commands.md, docs/roadmap.md, docs/decision-log.md, and docs/runlog/.
Update handoff only on major task-state changes, not every prompt.
Do not make scope changes, architecture rewrites, major dependency decisions, merge, release, or archive decisions without human approval.
```

## Usage Notes
- 可直接貼到 custom instructions、workspace prompt、starter prompt、pinned prompt 等入口
- 若平台有字數限制，優先保留：先讀 AGENTS、handoff 更新時機、commands 來源、不可自決事項
- 若你已在平台入口寫了語言或輸出格式要求，這裡不需要重複
"""


def doc_agents_platform_setup_guide() -> str:
    return """\
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
"""


def doc_agents_platform_ui_walkthrough() -> str:
    return """\
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
"""


def doc_agents_platform_onboarding_checklist() -> str:
    return """\
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
"""


def doc_handoff_current_task() -> str:
    return f"""\
# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name:
- Owner agent:
- Started on: {today_str()}
- Last updated on: {today_str()}
- Related issue / spec:
- Branch / worktree:

## Goal
-

## Scope
- In scope:
- Out of scope:

## Constraints
- Technical constraints:
- Product / UX constraints:

## Implementation Plan
- Step 1:
- Step 2:

## Done
-

## In Progress
-

## Next Step
-

## Files Touched
-

## Key Symbols / Entry Points
-

## Interfaces / Contracts Affected
- API / schema / types:
- UI contract / user flow:
- Config / env / migration:

## Risks / Watchouts
-

## Validation Status
- Commands run:
- Result:
- Not run yet:

## Rollback / Recovery Notes
-

## Pending Decisions
-

## Notes for Next Agent
-
"""


def doc_handoff_blockers() -> str:
    return """\
# Blockers

> 只記錄會影響接手或需要人工決策的阻塞，避免流水帳。

## Active Blockers
- Blocker:
  - Impact:
  - What was checked:
  - Decision needed:
  - Suggested next action:

## Resolved Blockers
-
"""


def doc_handoff_readme() -> str:
    return """\
# Handoff

- `current-task.md`：工程化交接主檔
- `blockers.md`：只記錄會影響接手的阻塞
- 更新時機：新任務開始、子任務完成、出現 blocker、切換 agent、session 收尾
- 建議只更新關鍵欄位，不要把 handoff 寫成逐輪對話紀錄
"""


def doc_planning_readme() -> str:
    return """\
# Planning（版本規劃）

> 此目錄存放各版本的 Version Brief（版本確認書）。

## 用途
- 每個版本一份 brief，回答「這一版到底要做什麼、不做什麼、怎樣才算完成」
- 取代獨立的需求確認書，在 brief 內含「使用者確認」區段
- 與 `docs/roadmap.md` 搭配使用：roadmap 管全貌，brief 管這一版

## 檔案命名
- `v1-brief.md`、`v2-brief.md`、`v3-brief.md`……

## Version Brief 結構

```markdown
# V{N} Brief — {版本代號或標題}

## 版本目標
## 背景與動機
## In Scope
## Out of Scope（留到後續版本）
## 完成條件（Acceptance Criteria）
## 預計拆分的 Changes
## 跨版本影響
## 使用者確認
- 確認日期：
- 確認人：
- 確認範圍：全部 / 部分
- 備註：
## 版本狀態
- 開始日期：
- 完成日期：
- 狀態：規劃中 / 進行中 / 已完成
```

## 三層規劃關係
| 層級 | 文件 | 回答的問題 |
|------|------|-----------|
| L0 全貌 | `docs/roadmap.md` | 產品方向、版本地圖、目前位置 |
| L1 版本 | `docs/planning/v{N}-brief.md` | 這一版核心問題、scope、完成條件 |
| L2 變更 | `openspec/changes/<name>/` | 這一次具體改什麼、怎麼驗收 |

## 分類
- 此目錄為 **init-only**：模板初始化時建立骨架，後續 upgrade 不追蹤
"""


def doc_system_manual() -> str:
    return """\
# System Manual — {產品名稱}

## 系統概述
{一段話描述這個系統是做什麼的}

## 目前版本
{V? — 對應 roadmap 的哪個版本}

## 功能總覽

### {功能區域 1}
- 能力描述：
- 操作方式：
- 限制 / 注意事項：

## 快速上手（Getting Started）
{使用者第一次使用時的最小步驟}

## 已知限制
- {限制 1}

## 版本歷史摘要
| 版本 | 日期 | 主要變更 |
|------|------|---------|
| V1   |      | ...     |

## 參考連結
- Version Brief：`docs/planning/v{N}-brief.md`
- Roadmap：`docs/roadmap.md`
"""


# ---------------------------
# Verify-only (workspace health check)
# ---------------------------

def verify_workspace(root: Path) -> int:
    required = required_workspace_paths(root)

    missing = [p for p in required if not p.exists()]
    if missing:
        print("❌ Missing required files:")
        for p in missing:
            print(f"  - {p.relative_to(root)}")
        return 2

    # Check style guide status
    sg = (root / ".github" / "copilot" / "rules" / "10-style-guide.md").read_text(
        encoding="utf-8", errors="ignore"
    )
    if "**PENDING**" in sg:
        print("⚠️  Style guide is PENDING. Provide Stitch HTML and run bootstrap with --stitch-html.")
    else:
        print("✅ Style guide looks ready (not PENDING).")

    lock_data = load_template_lock(root)
    if not lock_data:
        print(f"⚠️  Missing template lock file: {TEMPLATE_LOCK_REL}")
    else:
        print(f"✅ Template lock detected: version={lock_data.get('template_version', 'unknown')}")

    # Check docs directories
    for d in ["docs/agents", "docs/handoff", "docs/decisions", "docs/runlog", "docs/uiux", "docs/bugs", "docs/qa"]:
        dp = root / d
        if not dp.exists():
            print(f"⚠️  Missing directory: {d}")

    # Check openspec directories
    for d in ["openspec/specs", "openspec/changes", "openspec/changes/archive"]:
        dp = root / d
        if not dp.exists():
            print(f"⚠️  Missing directory: {d}")

    print("✅ Workspace verify passed.")
    return 0


def list_managed_workspace(root: Path) -> int:
    lock_data = load_template_lock(root)
    if not lock_data:
        print("❌ 無法列出分類：尚未找到 template lock file。")
        print(f"- 請先建立或刷新 {TEMPLATE_LOCK_REL}。")
        return 2

    rel_paths: List[str] = []
    for key in ("managed_files", "protected_files"):
        rel_paths.extend([str(path) for path in lock_data.get(key, []) if isinstance(path, str)])

    if not rel_paths:
        print("⚠️  template lock file 中沒有可列出的 managed/protected files。")
        return 0

    print("📚 Template file classification")
    print(f"- Root: {root}")
    print(f"- Lock: {TEMPLATE_LOCK_REL}")
    for row in format_classified_paths(rel_paths):
        print(row)
    return 0


# ---------------------------
# Main
# ---------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Bootstrap GitHub Copilot workspace（rules/skills/prompts/agents/docs）")
    parser.add_argument("--root", default="", help="repo root（預設：本檔位於 tools/ 時，使用上一層）")
    parser.add_argument("--stitch-html", default="", help="Stitch 匯出的 html 路徑（可選）")
    parser.add_argument("--init", action="store_true", help="初始化或重建模板檔案")
    parser.add_argument("--mode", choices=["overwrite", "safe"], default="safe", help="預設 safe")
    parser.add_argument("--no-backup", action="store_true", help="關閉自動備份（不建議）")
    parser.add_argument("--verify-only", action="store_true", help="只做健檢（不寫檔）")
    parser.add_argument("--status", action="store_true", help="輸出模板安裝狀態、lock file 與 managed files 摘要")
    parser.add_argument("--upgrade", action="store_true", help="依序執行 preview、必要的 lock refresh、以及 managed files apply")
    parser.add_argument("--upgrade-preview", action="store_true", help="預覽可升級的 managed files 與 protected drift（不寫檔）")
    parser.add_argument("--refresh-lock", action="store_true", help="刷新 template lock metadata（不改其他檔案）")
    parser.add_argument("--upgrade-apply", action="store_true", help="套用 managed files 升級並刷新 lock file")
    parser.add_argument("--list-managed", action="store_true", help="列出 template lock 中的 managed / protected files 分類")
    parser.add_argument("--project-name", default="", help="專案名稱（用於 openspec config，預設取 repo 資料夾名稱）")
    args = parser.parse_args()

    here = Path(__file__).resolve()
    default_root = template_repo_root(here) if here.parent.name == "tools" else Path(".").resolve()
    root = Path(args.root).resolve() if args.root else default_root
    project_name = args.project_name or root.name

    if args.status:
        return status_workspace(root, here)

    if args.init:
        return init_workspace(root, here, project_name, args.stitch_html, args.mode, with_backup=not args.no_backup)

    if args.upgrade:
        tokens = load_optional_stitch_tokens(args.stitch_html)
        return upgrade_workspace(root, here, project_name, tokens, with_backup=not args.no_backup)

    if args.upgrade_preview:
        tokens = load_optional_stitch_tokens(args.stitch_html)
        return upgrade_preview_workspace(root, here, project_name, tokens)

    if args.refresh_lock:
        tokens = load_optional_stitch_tokens(args.stitch_html)
        return refresh_lock_workspace(root, here, project_name, tokens, with_backup=not args.no_backup)

    if args.list_managed:
        return list_managed_workspace(root)

    if args.upgrade_apply:
        tokens = load_optional_stitch_tokens(args.stitch_html)
        return apply_upgrade_workspace(root, here, project_name, tokens, with_backup=not args.no_backup)

    if args.verify_only:
        return verify_workspace(root)
    return init_workspace(root, here, project_name, args.stitch_html, args.mode, with_backup=not args.no_backup)


if __name__ == "__main__":
    raise SystemExit(main())
