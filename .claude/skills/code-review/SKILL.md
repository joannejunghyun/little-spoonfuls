---
name: code-review
description: Reviews code changes in Little Spoonfuls for TypeScript correctness, Next.js App Router patterns, auth safety, and CLAUDE.md compliance. Used internally by the dev orchestrator when running the reviewer agent.
---

# Code Review — Little Spoonfuls

## Checklist

### TypeScript
- [ ] No `any` types
- [ ] No unsafe `as` casts hiding a real mismatch
- [ ] Props and function return types declared
- [ ] No unused imports or variables left by the change

### Next.js App Router (v16)
- [ ] `"use client"` present on every component using hooks or browser APIs
- [ ] Server components do not import from `"use client"` files
- [ ] `headers()` / `cookies()` only called in server context
- [ ] `redirect()` not inside try/catch (it throws `NEXT_REDIRECT`)
- [ ] `async`/`await` correct in server components

### Auth & Data Safety
- [ ] Every API route: `getUser()` → `if (!user) return 401` → then logic
- [ ] Every query on `babies`, `votes`, `menu_history`, `generation_log`: `.eq("user_id", user.id)` present
- [ ] `sanitizeParentRequest()` and `checkAllergyViolations()` in `app/api/generate/route.ts` not touched or weakened

### CLAUDE.md Compliance
- [ ] No features beyond the stated task scope
- [ ] No new abstractions for single-use code
- [ ] Every changed line traces to the task requirement
- [ ] No pre-existing dead code removed (mention if spotted, but flag — don't delete)

### i18n (double-check)
- [ ] No user-visible hardcoded strings in JSX

## Output Format

`_workspace/review-output.md`:
```
STATUS: PASS | NEEDS_FIXES

Issues:
- app/api/foo/route.ts:18 — missing .eq("user_id", user.id) on babies query
- components/Bar.tsx:5 — missing "use client" directive (uses useState)

Notes (non-blocking observations):
- app/api/foo/route.ts:42 — unused import `X` spotted (pre-existing, not introduced by this change)
```

Do not modify any files. Report only.
