---
name: implement
description: Provides Little Spoonfuls project-specific implementation patterns for the builder agent — file structure, Supabase auth patterns, translation conventions, and shadcn component usage. Used internally by the dev orchestrator when running the builder agent.
---

# Implement — Little Spoonfuls

## File Conventions

| What | Where |
|------|-------|
| New page | `app/{route}/page.tsx` (server component by default) |
| New API route | `app/api/{name}/route.ts` |
| New feature component | `components/{Name}.tsx` |
| shadcn primitives | `components/ui/` — do not add new ones without asking |
| Shared utilities | `lib/` |
| Global translations | `lib/i18n/translations.ts` |

## API Route Template

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // parse body, validate, query
}
```

## Translation Pattern

**Global** (`lib/i18n/translations.ts`): Add keys under both `en` and `ko` at the same nesting level.

**Page-local** (when a page has self-contained copy):
```ts
const copy = {
  en: { title: "...", subtitle: "..." },
  ko: { title: "...", subtitle: "..." },
} as const;
```

**Component-local** (like `LoginForm`): Accept `lang?: Lang` prop with default `"en"`, keep `copy` object internal.

## Language Detection

```ts
import { detectLang } from "@/lib/get-lang";
// In server context:
const lang = detectLang(user?.user_metadata?.language, (await headers()).get("accept-language"));
// Or for public pages:
const lang = detectLang(undefined, (await headers()).get("accept-language"));
```

## Supabase Patterns

Always use `createClient` from the correct path:
- Server context → `@/lib/supabase/server`
- Client component → `@/lib/supabase/client`

User-owned tables: `babies`, `votes`, `menu_history`, `generation_log`, `recipes`
All queries on these tables require `.eq("user_id", user.id)`.

## shadcn Components Available

`Button`, `Input`, `Card` / `CardContent`, `Badge`, `Select`, `Sheet` / `SheetContent`.
Import from `@/components/ui/{name}`.

## Reading Next.js Docs

Before implementing App Router features (layouts, metadata, caching, cookies, redirect, etc.), read the relevant doc in `node_modules/next/dist/docs/`. Next.js 16 has changes that differ from training data.
