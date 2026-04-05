---
name: write-user-manual
description: Write or update the user operation manual for Personal AI Work System. Use when the user says "幫我寫使用者手冊", "撰寫操作說明", "write user manual", "update user manual", or wants to document the system for users. Trigger whenever the user wants to produce a user-facing guide for this system, even if they don't use the exact words "user manual".
license: MIT
metadata:
  author: wilson_hsiao
  version: "1.0"
---

# Write User Manual

A skill for systematically generating the Personal AI Work System user operation manual using existing documentation as the source of truth.

The process: define scope → research source docs → draft section by section → quality check → deliver.

---

## Input

The user's request can be any of:
- A request to write the full manual from scratch
- A request to update a specific section
- A request after completing a new change (e.g., after `adapter-docs-update`)

---

## Steps

### 1. Define Scope

Ask two quick questions using **AskUserQuestion**:

a. **Is `adapter-docs-update` complete?**
   - Yes → include full V5 adapter format descriptions in the Extract section
   - No → write the Extract section with a `<!-- TODO: update after adapter-docs-update -->` placeholder

b. **Full manual or specific section?**
   - Full → proceed through all sections in `references/manual-outline.md`
   - Specific → jump to that section only

Use **TodoWrite** to track progress through sections.

---

### 2. Research Phase

Read the following source files before drafting. Reference `references/source-docs-index.md` to know which sources apply to each section.

**Always read:**
- `docs/system-manual.md` — canonical feature list, current capabilities, and known limitations
- `docs/product/user-guide-current.md` — existing user guide structure and language
- `docs/planning/v5-brief.md` — current scope boundary, 7 acceptance criteria, out-of-scope items
- `docs/roadmap.md` — version history and current status

**Read for background context (understand the "why" behind features):**
- `docs/planning/v4-brief.md` — why Memory Health / Governance Scheduler / Rule Conflict Detection exist; helps explain these features accurately
- `docs/planning/v3-brief.md` — why ConversationDoc schema was designed this way; essential for writing the Extract section with correct mental model
- `docs/planning/v1-brief.md` — the core problem this system solves; useful for writing the intro/overview section

**Read if covering V5 adapter features:**
- `docs/qa/2026-04-04_gemini-adapter-smoke.md`
- `docs/qa/2026-04-04_claude-adapter-smoke.md`
- `docs/qa/2026-04-04_chatgpt-api-auto-import-smoke.md`

**Read if covering Extract or adapter sections:**
- `docs/workflows/conversation-schema.md` — ConversationDoc format, V5 source matrix

---

### 3. Draft Section by Section

Follow the structure in `references/manual-outline.md`. For each section:

1. Read the relevant source docs listed in `references/source-docs-index.md`
2. Write the section in Traditional Chinese (繁體中文) with the following style:
   - **Audience**: technical users who know CLI and config files but are unfamiliar with this system
   - **Tone**: direct and practical, no marketing language
   - **Format**: each feature should include: 頁面位置 → 操作步驟 → 預期結果 → 常見問題（if any）
   - **Code blocks**: use for all commands, paths, and JSON examples
3. **Screenshots**: do NOT embed actual images. Where a screenshot would help, insert a placeholder comment:
   ```
   <!-- SCREENSHOT: [描述要截什麼] -->
   ```
   Example: `<!-- SCREENSHOT: /extract 頁面，顯示工具來源下拉選單展開狀態 -->`
4. Mark **TodoWrite** task as complete after finishing each section

**Do not** describe features that are marked "Out of Scope" in `v5-brief.md` (e.g., Gemini/Claude API auto-fetch, OAuth flow, multi-user).

---

### 4. Quality Check

After drafting all sections, verify:

| Check | How |
|-------|-----|
| V5 acceptance criteria covered | Cross-check against the 7 criteria in `docs/planning/v5-brief.md` |
| No out-of-scope features described | Re-read v5-brief.md Out of Scope section |
| All 4 adapter sources documented | ChatGPT (JSON + API), Gemini (paste), Claude (paste), Copilot (session) |
| API Key security note included | Confirm settings section mentions "本機儲存，不上傳" |
| Version consistency | Manual title should state "V5" and reference current date |

If any check fails, fix the relevant section before proceeding.

---

### 5. Deliver

Write the final output to `docs/product/user-manual-v5.md`.

If updating an existing file, read it first and do targeted edits rather than full rewrite.

After writing, report to user:
- Which sections were written/updated
- Any TODOs left (e.g., awaiting `adapter-docs-update`)
- Suggested next step (e.g., "完成 adapter-docs-update 後執行 /write-user-manual 更新 Extract 章節")

---

## Reference Files

- `references/manual-outline.md` — target structure for the full manual
- `references/source-docs-index.md` — maps each section to its source documents
