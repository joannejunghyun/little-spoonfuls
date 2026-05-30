---
name: dev
description: "Orchestrates feature development for Little Spoonfuls. Use when implementing a new feature, fixing a bug, updating UI copy, adding translations, or reviewing changed code. Trigger on: 'add', 'build', 'implement', 'fix', 'update copy', 'add translation', 'review', 'check translations', '새 기능', '버그', '번역', '텍스트', '추가', '수정'. Also triggers for follow-up and re-runs: 'again', 'redo', 'update', 'improve previous result', '다시', '재실행', '보완'."
---

# Dev Orchestrator — Little Spoonfuls

Runs the builder → i18n-cop → reviewer pipeline. Routes to the right subset based on task type.

## Execution Mode: Sub-agent (Sequential Pipeline)

| Agent | File | Skill | Role |
|-------|------|-------|------|
| builder | `.claude/agents/builder.md` | `implement` | Write code |
| i18n-cop | `.claude/agents/i18n-cop.md` | `i18n-check` | Fix translations |
| reviewer | `.claude/agents/reviewer.md` | `code-review` | Read-only final check |

## Routing

| Task type | Pipeline |
|-----------|----------|
| New feature | builder → i18n-cop → reviewer |
| Bug fix | builder → reviewer |
| Copy / translation only | i18n-cop → reviewer |
| Code review only | reviewer |

## Workflow

### Phase 0: Context Check

1. Check if `.claude/_workspace/` exists in the project root.
   - **Missing** → fresh run. Proceed to Phase 1.
   - **Exists + partial redo** (user wants to re-run only one agent) → skip to the relevant phase. Pass previous `_workspace/` output to the agent.
   - **Exists + new task** → rename to `.claude/_workspace_{YYYYMMDD_HHMMSS}/`, then Phase 1.

2. Identify task type from the user's request (feature / bug / copy / review).

### Phase 1: Prepare

1. Create `.claude/_workspace/` directory.
2. Write `.claude/_workspace/00_task.md`:
   ```
   Task: [user's request]
   Type: [feature | bug | copy | review]
   Pipeline: [agents to run]
   Expected files to touch: [list]
   ```

### Phase 2: Build

*Skip if task type is copy or review.*

```
Agent(
  name: "builder",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "You are the builder for Little Spoonfuls.
Read your role: .claude/agents/builder.md
Read implementation patterns: .claude/skills/implement/SKILL.md
Task: [user's request from 00_task.md]
Write your change summary to .claude/_workspace/builder-output.md"
)
```

After completion, read `.claude/_workspace/builder-output.md` to extract the list of changed files.

### Phase 3: i18n Check

*Skip if task type is review only.*

```
Agent(
  name: "i18n-cop",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "You are the i18n-cop for Little Spoonfuls.
Read your role: .claude/agents/i18n-cop.md
Read the audit guide: .claude/skills/i18n-check/SKILL.md
Changed files: [list from builder-output.md, or from task description if no builder ran]
Audit all changed files for missing en/ko entries. Fix any gaps.
Write your result to .claude/_workspace/i18n-output.md"
)
```

### Phase 4: Review

```
Agent(
  name: "reviewer",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "You are the reviewer for Little Spoonfuls.
Read your role: .claude/agents/reviewer.md
Read the review checklist: .claude/skills/code-review/SKILL.md
Changed files: [list from builder-output.md + any i18n fixes from i18n-output.md]
Perform a read-only review. Write your report to .claude/_workspace/review-output.md"
)
```

### Phase 5: Report

Read all workspace files and summarize to the user:

```
## Done

**Built:** [what was changed, from builder-output.md — or "n/a" if skipped]
**i18n:** PASS | FIXED ([keys added]) | SKIPPED
**Review:** PASS | [list of issues from review-output.md]

[If review has NEEDS_FIXES: list issues and ask developer how to proceed]
```

## Error Handling

| Situation | Action |
|-----------|--------|
| Builder fails | Report to user, stop pipeline. Check `.claude/_workspace/builder-output.md` for partial notes. |
| i18n-cop fails | Continue to reviewer. Note "i18n unchecked" in final report. |
| Reviewer fails | Report to user. Offer to re-run reviewer. |
| No `_workspace/` output file | Treat as agent failure — report and stop. |

## Test Scenarios

### Normal flow — new feature
1. User: "add a notes field to the baby profile"
2. Phase 0: no `_workspace/` → fresh run
3. Phase 1: type = feature, pipeline = builder → i18n-cop → reviewer
4. Phase 2: builder edits `BabyForm.tsx`, `app/api/babies/route.ts`, `translations.ts`
5. Phase 3: i18n-cop finds `notes` key missing in `translations.ko` → adds it
6. Phase 4: reviewer checks auth, TS, scope — PASS
7. Report: "Built: added notes field. i18n: FIXED (1 key). Review: PASS"

### Error flow — missing translation caught
1. Builder adds a new button with hardcoded English "Save notes"
2. i18n-cop detects hardcoded string in JSX → flags it + adds translation keys
3. Reviewer confirms fix is in place → PASS
4. Report: "i18n: FIXED — 2 keys added, 1 hardcoded string flagged and fixed"
