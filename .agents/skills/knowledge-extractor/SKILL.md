---
name: knowledge-extractor
description: Route Wilson Knowledge Matrix inputs into the right workflow for link triage, content ingest, Wilson-perspective analysis, and reusable prompt extraction. Use when maintaining Wilson's personal knowledge base from articles, posts, YouTube material, or prompt snippets.
---

# Knowledge Extractor

Use this skill as the single entrypoint for Wilson's personal knowledge workflows.
Do not replace the existing skills. Route into them deliberately.

## Read First

- `D:\program\WKM\SCHEMA.md`
- `D:\program\WKM\wiki\_index.md`
- `D:\program\WKM\wiki\wilson\profile.md`
- `D:\program\WKM\wiki\wilson\interests.md`
- `D:\program\WKM\wiki\wilson\perspectives.md`

## Intent Routing

Choose the smallest valid path for the current input.

### 1. URL only

Use `triage-link`.

When the user only gives a link, decide whether it is worth Wilson's time.
Output a verdict first. Do not ingest the content automatically unless the user asks for it.

### 2. Full article, post text, notes, or YouTube transcript

Use `ingest-content`.

Extract durable knowledge into WKM:
- source note
- topic updates
- Wilson perspective fragments
- index and log updates

### 3. Topic or article plus a request for "Wilson 怎麼看"

Use `wilson-perspective`.

This is not summary mode. Produce a position using Wilson's existing profile, interests, and perspective framework.
Separate:
- recorded Wilson views
- framework-based inference

### 4. Prompt snippets from VS Code Insider, Codex app, Claude, or elsewhere

Extract a reusable prompt candidate.

Normalize the prompt into:
- `Goal`: what the prompt is trying to achieve
- `Inputs`: what must be supplied each time
- `Constraints`: style, rules, tone, or guardrails
- `Output Contract`: expected shape of the answer
- `Reusable Template`: a cleaned prompt with variables like `{topic}` or `{source}`
- `When To Use`: the scenario where Wilson should reuse it
- `Why It Worked`: the key prompt pattern or mechanism

If the prompt has stable long-term value, recommend saving it into a future prompt library. Until WKM defines a dedicated prompt schema, keep the prompt extraction in the response or save it only when the user explicitly asks.

## Combined Flows

If an input needs multiple outputs, use this order:

1. `triage-link` to protect attention
2. `ingest-content` to preserve knowledge
3. `wilson-perspective` to generate Wilson's stance
4. prompt extraction when the input itself is a reusable workflow pattern

## YouTube Handling

Prefer transcript or detailed notes.

If only a YouTube URL is available:
- first triage the link
- then ask for transcript or transcript-like notes if deeper ingest is needed

Do not pretend to know the full video if only the title or thumbnail is available.

## Accumulation Rules

Wilson's knowledge base should accumulate in layers:

1. `source`: raw-but-structured evidence
2. `topic`: reusable subject knowledge
3. `wilson`: stable profile, interests, and viewpoints
4. `insight`: high-value synthesized analysis
5. reusable prompts: repeatable operating patterns

Only write durable knowledge.
Do not store every conversation turn.
Do not turn temporary speculation into stable memory.

## Quality Rules

- Protect Wilson's attention before maximizing collection.
- Prefer grounded summaries over exhaustive copying.
- Do not invent Wilson opinions without evidence.
- When inferring, label it as framework-based inference.
- Keep outputs in Traditional Chinese unless the source requires English terms.
- Always connect the material back to Wilson's work: consulting, training, AI automation, Taiwan context, and long-term tracking value.
