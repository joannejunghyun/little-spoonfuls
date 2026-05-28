# Little Spoonfuls 🥣

> Meals curated by infant nutrition experts, crafted with love for your little one ✨

A baby food meal planner for parents who want nutritious, stage-appropriate meals — built for Danu and every baby in the world 💛

---

## What It Does

Generates a full day's meal plan (breakfast, lunch, snack, dinner) tailored to your baby's age, weaning stage, dietary style, allergies, and any special requests (poor sleep, constipation, iron boost, etc.).

**Key features:**
- Auto-detects weaning stage: Early (6–7M) → Middle (7–9M) → Late (10–12M) → Completion (12M+)
- Baby-Led Weaning (BLW), traditional spoon-fed, or mixed mode — with stage-appropriate finger food shapes and built-in choking safety rules
- Cuisine styles: Korean (정통 이유식), Western, Chinese, or Global Mix
- Tap any meal card to generate a full recipe with ingredients, steps, and a parent tip
- Save favorites and filter by ingredient
- Multi-baby profiles with per-profile allergy and diet settings
- Full English / Korean bilingual support — language switch updates the entire UI instantly
- Meal history saved automatically
- Request-specific RAG grounding for concerns like constipation, iron support, sleep, immunity, BLW safety, and Korean stage-appropriate meal patterns
- Allergy-aware safety guardrails that block requests for ingredients already marked as unsafe for the baby

---

## How Accuracy Is Maintained

### Grounded in Research

Meal recommendations are generated against a curated knowledge base drawn from 8 international infant nutrition sources:

| Source | What it covers |
|--------|----------------|
| **Korean Infant Food Market Survey 2021** (aT) | Korean weaning stages, domestic recipe conventions |
| **초기이유식 재료표** | Stage-appropriate ingredients by month (5M / 6M / 7M) |
| **The Baby-led Weaning Cookbook** — Gill Rapley & Tracey Murkett | BLW principles, finger food shapes & safety |
| **100 Baby-Led Weaning Recipes** | Practical BLW finger food recipes |
| **Feed Me: 6–12 Months** | Portion sizes, allergy introduction guidelines |
| **Wonderful Weaning Recipes** — Susheela Sababady | Stage-based purée and mash progression |
| **Recipe Book for Babies Who Need to Make the Most of Every Mouthful** — Dr. Luise Marino | High-density nutrition strategies |
| **Introducing Solid Foods and Early Years Recipe Booklet** | NHS-aligned UK weaning guidelines |

### RAG: Request-Specific Grounding

Little Spoonfuls uses a local RAG layer before meal generation. In addition to static stage and BLW rules, the generation API retrieves request-specific reference passages before calling the LLM.

Current RAG flow:

1. Build a retrieval query from the baby's stage, language, cuisine, BLW mode, diet type, allergies, and parent request
2. Retrieve matching passages from `lib/rag/documents.ts`
3. Format the selected passages with source, title, matched tags, and content
4. Inject them into the Claude prompt as `RETRIEVED EXPERT REFERENCES`
5. Record retrieval metadata in Phoenix as `rag.*` span attributes

The current local RAG knowledge base covers:

- constipation and fiber-rich ingredient strategies
- iron support with vitamin-C pairing
- cold/immunity and gentle warm-meal guidance
- sleep-friendly evening meal patterns
- BLW choking-shape reminders
- Korean middle-stage texture and menu examples

Retrieved passages are injected into the Claude prompt as `RETRIEVED EXPERT REFERENCES`, while non-negotiable safety rules such as allergies, choking hazards, diet type, and stage texture always take priority.

### Evals and Safety Guardrails

Little Spoonfuls blocks allergy-conflicting parent requests before the LLM is called. For example, if a baby has an egg allergy and a parent asks for an egg-based menu, the API returns a safety error instead of generating a plan.

The prompts also avoid using breast milk or formula as recipe ingredients or mixing liquids. If liquid is needed, recipes should use water, cooking water, unsalted vegetable stock, or fruit/vegetable purée instead.

Current eval signals:

- `eval.safety_passed` — whether the request passed safety checks
- `eval.blocked_response` — whether the API blocked a response before calling the LLM
- `eval.block_reason` — why a response was blocked, such as `allergy_requested`
- `eval.violated_allergens` — which allergy profile entries were involved
- `eval.allergy_violation` — whether generated meals contained allergy keywords during post-generation checking

These evals are code-based today. They are designed to support future LLM-as-judge or regression evals for groundedness, safety, and menu diversity.

### LLM Observability (Arize Phoenix)

Every generation is traced end-to-end via OpenTelemetry + Arize Phoenix:

- **Allergy safety monitoring** — violations are logged as span attributes in real time
- **RAG traceability** — retrieved document IDs, matched tags, source names, match counts, and top scores are recorded as `rag.*` span attributes
- **Blocked safety events** — allergy-conflicting requests are recorded with `eval.blocked_response`, `eval.block_reason`, and `eval.violated_allergens`
- **Eval-ready traces** — RAG context, generation inputs, safety blocks, and human saves live on the same trace so quality can be compared across segments
- **Human feedback signal** — each ❤️ save annotates the originating trace as a HUMAN quality signal, building a labeled dataset of what parents actually found useful
- Traces are queryable by stage, cuisine, BLW type, and special request, making it possible to spot systematic prompt issues across segments

### Prompt Unit Tests

`scripts/test-diet-prompt.mjs` verifies that each diet type (`all`, `pescatarian`, `lacto-ovo`, `lacto`, `ovo`, `vegan`) produces the correct label and that forbidden/allowed ingredient keywords are present before the string reaches the LLM.

```bash
node scripts/test-diet-prompt.mjs
```

---

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js (App Router) |
| AI | Claude Haiku 4.5 (Anthropic) — streaming + prompt caching |
| Database & Auth | Supabase (PostgreSQL + Google OAuth + Magic Link) |
| Observability | Arize Phoenix (OpenTelemetry tracing + human feedback) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |
| Deployment | Vercel |

---

## About

Made with ❤️ by [Joanne](https://www.linkedin.com/in/junghyunhao/) — for Danu and every parent in the world 💛

---
---

# Little Spoonfuls 🥣 (한국어)

> 세계 유아식 전문가 자료를 바탕으로 선별한 오늘의 이유식 메뉴 ✨

오늘 우리 아기 뭐 먹일지 고민되는 부모님을 위한 이유식 메뉴 추천 앱이에요.
단우와 세상 모든 아기를 위해 만들었습니다 💛

---

## 이런 앱이에요

아기의 나이·이유식 단계·식단 스타일·알레르기·특별 요청(잠을 설쳤어요, 변비, 철분 부족 등)을 고려해 하루 4끼(아침·점심·간식·저녁) 메뉴를 추천해드려요.

**주요 기능:**
- 초기(6–7개월) → 중기(7–9개월) → 후기(10–12개월) → 완료기(12개월+) 단계 자동 적용
- 자기주도이유식(BLW), 일반 숟가락 이유식, 혼합 방식 — 단계별 핑거푸드 형태와 질식 방지 안전 규칙 내장
- 요리 스타일: 한식(정통 이유식), 양식, 중식, 골고루
- 메뉴 카드 탭 → 재료·조리법·부모 팁 포함 풀 레시피 생성
- 마음에 드는 레시피 저장 및 재료별 필터
- 알레르기·식단 타입이 개별 설정되는 멀티 아기 프로필
- 한국어/영어 완전 지원 — 언어 전환 시 앱 전체 UI 즉시 변경
- 추천 이력 자동 저장
- 변비, 철분 보충, 수면, 면역, BLW 안전, 한식 단계별 질감처럼 요청별로 관련 자료를 찾아 넣는 RAG 기반 생성
- 아기 프로필의 알레르기와 충돌하는 식재료 요청은 LLM 호출 전에 차단

---

## 정확도를 높이는 방법

### 전문가 자료 기반 추천

메뉴 추천은 국내외 유아식 전문가 자료 8종을 기반으로 구성된 지식 베이스를 바탕으로 생성돼요:

| 자료 | 설명 |
|------|------|
| **2021 가공식품 세분시장 조사 — 영유아식** (aT) | 국내 이유식 단계 및 레시피 기준 |
| **초기이유식 재료표** | 월령별(5·6·7개월) 사용 가능 식재료 |
| **The Baby-led Weaning Cookbook** — Gill Rapley | BLW 원칙, 핑거푸드 형태 및 안전 기준 |
| **100 Baby-Led Weaning Recipes** | 실전 BLW 핑거푸드 레시피 100개 |
| **Feed Me: 6–12 Months** | 월령별 섭취량, 알레르기 도입 가이드 |
| **Wonderful Weaning Recipes** — Susheela Sababady | 단계별 퓨레·매시 진행 기준 |
| **Recipe Book for Babies Who Need to Make the Most of Every Mouthful** — Dr. Luise Marino | 고영양 밀도 레시피 전략 |
| **Introducing Solid Foods and Early Years Recipe Booklet** | NHS 기반 영국 이유식 가이드라인 |

### RAG: 요청별 근거 검색

Little Spoonfuls는 메뉴 생성 전에 로컬 RAG 레이어를 실행합니다. 고정된 이유식 단계·BLW 규칙에 더해, 생성 API는 LLM을 호출하기 전에 요청과 관련된 참고 문단을 찾아 프롬프트에 넣어요.

현재 RAG 흐름:

1. 아기의 단계, 언어, 요리 스타일, BLW 모드, 식단 타입, 알레르기, 부모 요청으로 검색 쿼리 생성
2. `lib/rag/documents.ts`에서 관련 문단 검색
3. 선택된 문단을 출처, 제목, 매칭 태그, 본문과 함께 포맷팅
4. Claude 프롬프트의 `RETRIEVED EXPERT REFERENCES`로 삽입
5. Phoenix에 `rag.*` 스팬 속성으로 검색 메타데이터 기록

현재 로컬 RAG 지식 베이스는 다음 내용을 다룹니다:

- 변비와 섬유질 식재료 전략
- 철분 보충과 비타민 C 조합
- 감기/면역 요청을 위한 따뜻하고 부드러운 식단 방향
- 수면을 고려한 저녁 메뉴 패턴
- BLW 질식 위험 형태 조정
- 한식 중기 이유식 질감과 메뉴 예시

검색된 문단은 Claude 프롬프트의 `RETRIEVED EXPERT REFERENCES`로 들어가고, 알레르기·질식 위험·식단 타입·월령별 질감 같은 안전 규칙은 항상 우선 적용됩니다.

### Evals와 안전 가드레일

Little Spoonfuls는 아기 알레르기와 충돌하는 부모 요청을 LLM 호출 전에 차단합니다. 예를 들어 계란 알레르기가 있는 아기에게 계란 메뉴를 요청하면, 메뉴를 생성하지 않고 안전 안내를 반환합니다.

또한 프롬프트는 모유나 분유를 레시피 재료나 농도 조절용 액체로 사용하지 않도록 제한합니다. 액체가 필요할 때는 물, 삶은 물, 무염 채수, 채소/과일 퓨레를 사용하도록 안내합니다.

현재 eval 신호:

- `eval.safety_passed` — 요청이 안전 검사를 통과했는지
- `eval.blocked_response` — LLM 호출 전에 API가 응답을 차단했는지
- `eval.block_reason` — `allergy_requested`처럼 차단된 이유
- `eval.violated_allergens` — 충돌한 알레르기 항목
- `eval.allergy_violation` — 생성된 식단에 알레르기 키워드가 포함됐는지 사후 검사한 결과

현재 eval은 코드 기반입니다. 이후 groundedness, safety, menu diversity를 평가하는 LLM-as-judge 또는 회귀 평가로 확장할 수 있도록 설계되어 있습니다.

### LLM 관찰성 (Arize Phoenix)

모든 생성 요청은 OpenTelemetry + Arize Phoenix로 전 구간 추적돼요:

- **알레르기 안전 모니터링** — 위반 감지 시 실시간으로 스팬 속성에 기록
- **RAG 추적성** — 검색된 문서 ID, 매칭 태그, 출처, 검색 개수, 최고 점수를 `rag.*` 스팬 속성으로 기록
- **차단된 안전 이벤트** — 알레르기와 충돌하는 요청은 `eval.blocked_response`, `eval.block_reason`, `eval.violated_allergens`로 기록
- **Eval-ready trace** — RAG 컨텍스트, 생성 입력, 안전 차단, 사람 저장 피드백이 같은 트레이스에 남아 세그먼트별 품질 비교 가능
- **사람 피드백 신호** — ❤️ 저장 시 해당 트레이스에 HUMAN 품질 신호가 어노테이션됨 → 실제로 유용했던 메뉴의 레이블 데이터셋 축적
- 단계·요리 스타일·BLW 타입·특별 요청별로 트레이스를 조회할 수 있어, 프롬프트의 구조적 문제를 세그먼트별로 파악 가능

### 프롬프트 유닛 테스트

`scripts/test-diet-prompt.mjs`는 각 식단 타입(`all`, `pescatarian`, `lacto-ovo`, `lacto`, `ovo`, `vegan`)이 올바른 레이블을 생성하고, 금지/허용 식재료 키워드가 LLM에 전달되기 전 프롬프트 문자열에 정확히 포함되는지 검증해요.

```bash
node scripts/test-diet-prompt.mjs
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js (App Router) |
| AI | Claude Haiku 4.5 (Anthropic) — 스트리밍 + 프롬프트 캐싱 |
| Database & Auth | Supabase (PostgreSQL + Google OAuth + Magic Link) |
| Observability | Arize Phoenix (OpenTelemetry 추적 + 사람 피드백) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |
| Deployment | Vercel |

---

## 만든 이

우리 아기 단우와 세상 모든 부모님을 위해 💛
Made with ❤️ by [Joanne](https://www.linkedin.com/in/junghyunhao/)
