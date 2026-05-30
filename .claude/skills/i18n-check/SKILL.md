---
name: i18n-check
description: Audits and fixes bilingual copy in Little Spoonfuls. Use when verifying or repairing en/ko translation parity in translations.ts or local copy objects. Triggers after any UI text change — the bilingual rule is absolute. Also triggers on: "add Korean", "missing translation", "번역 추가", "한국어 없어", "copy check".
---

# i18n Check — Little Spoonfuls

## Rule

Every user-visible string must exist in both `en` and `ko`. This is non-negotiable (from CLAUDE.md).

## Where to Look

1. **`lib/i18n/translations.ts`** — run a structural diff of `translations.en` vs `translations.ko`. Every key, including nested ones, must match.

2. **Local copy objects** — find them with:
   ```
   grep -rn "const copy" app/ components/
   ```
   Current known locations: `app/login/page.tsx`, `components/LoginForm.tsx`.
   For each: verify `en` and `ko` have the same keys.

3. **Hardcoded JSX strings** — scan changed `.tsx` files for string literals that are user-visible (button text, placeholder, aria-label, error messages). These should be sourced from a copy object.

## Korean Copy Tone Reference

Study `translations.ko` before writing new entries:
- Conversational, warm ("아기", "이유식", "추천", "저장")
- Button labels: typically end in "하기" (e.g., "저장하기") or short nouns ("저장됨")
- Questions: end in "나요?" or "어요?" 
- Error/limit messages: gentle, not alarming ("다시 시도해주세요", "내일 또 만나요")
- Match emoji from the `en` counterpart

## Output Format

`_workspace/i18n-output.md`:
```
STATUS: PASS | FIXED
Fixed:
- translations.ko.landing.loginTitle: "로그인 · 회원가입"
- app/login/page.tsx copy.ko.newKey: "..."
Flagged (needs manual review):
- components/Foo.tsx:34 — hardcoded "Save" not in copy object
```
