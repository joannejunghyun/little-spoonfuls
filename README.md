# Little Spoonfuls 🥣

> Meals curated by infant nutrition experts, crafted with love for your little one ✨

A baby food meal planner app for parents who want nutritious, stage-appropriate meals for their little ones — built for Danu and every baby in the world 💛

---

## Features

### 🍚 Expert-Curated Meal Recommendations
- Generates a full day's meal plan (breakfast, lunch, snack, dinner) tailored to your baby's age, diet, and allergies
- Automatically detects weaning stage: Early (6–7M) → Middle (7–9M) → Late (10–12M) → Completion (12M+)
- Recommendations are grounded in guidance from 8 international infant nutrition research sources (see below)
- Deduplication: already-served meals today are never repeated
- Daily limit of 3 suggestions to encourage variety
- Meals stream progressively — first card appears in ~3s

### 💬 Parent Special Request
- Free-text input for specific concerns: poor sleep, constipation, needs iron, vitamin A, cold, protein, calcium, or a specific ingredient at home
- Quick-select chips for the most common requests
- When a request is given, every meal is adapted to address it and an **expert advice card** explains the day's nutritional strategy
- Each meal card also includes a one-sentence expert note explaining why that meal helps

### 👐 Baby-Led Weaning (BLW) Support
- Choose your feeding approach: **Traditional (spoon-fed)**, **Baby-Led Weaning**, or **Mixed**
- BLW mode generates self-feedable finger food meals with stage-appropriate shapes and sizes (e.g. 7–8cm sticks for 6–7M, soft cubes for 8–9M)
- Mixed mode ensures at least 2 out of 4 meals include finger food options; snack is always BLW-style
- Built-in choking safety rules applied to every BLW meal (no whole grapes, hard raw veg, honey, etc.)

### 🌏 Cuisine Selection
- **Global Mix** — draws from Korean, Western, and Chinese weaning traditions
- **Korean** — authentic 이유식 recipes: 미역죽, 소고기야채죽, 두부야채진밥, and more
- **Western** — purées, frittatas, fish fingers, oat pancakes
- **Chinese** — congee-style dishes and steamed options

### ❤️ Favorites
- Tap any meal card to load a full recipe: ingredients, step-by-step method, and a parent tip
- Save recipes you love with the ❤️ button — stored in your personal Favorites list
- Filter saved recipes by ingredient

### 👶 Multi-Baby Profiles
- Add and manage multiple baby profiles
- Per-profile allergy settings (8 major allergens: egg, dairy, peanut, tree nuts, wheat, soy, fish, shellfish)
- Automatic weaning stage calculation from date of birth
- Dietary style per profile: Omnivore / Vegetarian / Vegan

### 📅 Meal History
- All generated meal plans saved automatically
- Browse past menus by date

### 🌐 Full English / Korean Bilingual Support
- Meal plans and recipes generated in the user's chosen language
- Switch language in profile settings — the entire app UI updates instantly

### 📊 LLM Observability (Arize Phoenix)
- Every generation traced end-to-end via OpenTelemetry + Arize Phoenix
- Allergy safety monitoring: violations logged as span attributes in real time
- Favorites signal: each ❤️ save annotates the originating trace as a HUMAN quality signal

---

## Nutrition Research Sources

Meal recommendations are grounded in the following materials:

| Source | Description |
|--------|-------------|
| **Korean Infant Food Market Survey 2021** (aT) | Korean weaning stages, domestic recipe conventions |
| **초기이유식 재료표** | Stage-appropriate ingredient chart by month (5M / 6M / 7M) |
| **The Baby-led Weaning Cookbook** — Gill Rapley & Tracey Murkett | BLW principles, finger food shapes & safety |
| **100 Baby-Led Weaning Recipes** | Practical BLW finger food recipes |
| **Feed Me: 6–12 Months** | Portion sizes, allergy introduction guidelines |
| **Wonderful Weaning Recipes** — Susheela Sababady | Stage-based purée and mash progression |
| **Recipe Book for Babies Who Need to Make the Most of Every Mouthful** — Dr. Luise Marino | High-density nutrition strategies |
| **Introducing Solid Foods and Early Years Recipe Booklet** | NHS-aligned UK weaning guidelines |

---

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 16 (App Router) |
| AI | Claude Haiku 4.5 (Anthropic) — streaming + prompt caching |
| Database & Auth | Supabase (PostgreSQL + Google OAuth + Magic Link) |
| Observability | Arize Phoenix (OpenTelemetry tracing + human feedback) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |
| Deployment | Vercel |

---

## Getting Started

```bash
npm install
npm run dev
```

Set the following environment variables in `.env.local`:

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PHOENIX_COLLECTOR_ENDPOINT=https://app.phoenix.arize.com
PHOENIX_API_KEY=
```

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

## 주요 기능

### 🍚 전문가 큐레이션 메뉴 추천
- 아기의 나이·식단·알레르기를 고려해 하루 4끼(아침·점심·간식·저녁) 추천
- 초기(6–7개월) → 중기(7–9개월) → 후기(10–12개월) → 완료기(12개월+) 단계 자동 적용
- 국내외 유아식 전문가 자료 8종을 바탕으로 선별된 레시피
- 오늘 이미 추천된 메뉴는 중복 제외
- 하루 3회 추천 제한으로 매번 새로운 구성
- 스트리밍 방식으로 첫 메뉴 카드가 약 3초 내 표시

### 💬 부모 특별 요청
- 잠을 설쳤어요, 변비, 철분 부족, 비타민A, 감기, 단백질, 칼슘, 특정 재료 등 자유롭게 입력
- 자주 쓰는 요청은 칩으로 빠르게 선택
- 요청이 있으면 모든 메뉴가 해당 관심사에 맞게 조정되고, 오늘의 영양 전략을 설명하는 **전문가 조언 카드** 표시
- 각 메뉴 카드에도 왜 이 메뉴가 도움이 되는지 한 줄 전문가 노트 제공

### 👐 자기주도이유식 (BLW) 지원
- 수유 방식 선택: **일반 이유식 (숟가락)**, **자기주도이유식 (BLW)**, **혼합 방식**
- BLW 선택 시 단계별 핑거푸드 형태로 메뉴 구성 (6–7개월: 7–8cm 스틱, 8–9개월: 부드러운 큐브 등)
- 혼합 방식: 4끼 중 최소 2끼 + 간식은 항상 BLW 형태
- 질식 방지 안전 규칙 내장 (포도 통째, 딱딱한 날 채소, 꿀 등 자동 제외)

### 🌏 요리 스타일 선택
- **골고루** — 한식·양식·중식 균형 있게
- **한식** — 미역죽, 소고기야채죽, 두부야채진밥 등 정통 한국 이유식
- **양식** — 퓨레, 프리타타, 생선 핑거, 오트 팬케이크
- **중식** — 죽 스타일 요리, 찐 채소 메뉴

### ❤️ 찜한 메뉴
- 메뉴 카드 탭 → 재료·만드는 방법·부모 팁 확인
- ❤️ 버튼으로 마음에 드는 레시피 저장
- 재료별 필터로 원하는 레시피 빠르게 탐색

### 👶 멀티 아기 프로필
- 여러 아기 프로필 등록·관리
- 알레르기 개별 설정 (달걀·유제품·땅콩·견과류·밀·대두·생선·갑각류)
- 생년월일 기반 이유식 단계 자동 계산
- 식단 타입: 일반식 / 채식 / 완전 채식

### 📅 식사 기록
- 추천받은 메뉴 히스토리 자동 저장
- 날짜별로 모아보기

### 🌐 한국어 / 영어 완전 지원
- 선택한 언어로 메뉴와 레시피 생성
- 프로필에서 언어 전환 시 앱 전체 UI 즉시 변경

### 📊 LLM 관찰성 (Arize Phoenix)
- OpenTelemetry 기반 생성 요청 전체 추적
- 알레르기 안전 모니터링: 위반 감지 시 실시간 스팬 속성 기록
- 찜한 메뉴 신호: ❤️ 저장 시 해당 트레이스에 사람 피드백 어노테이션 기록

---

## 참고 자료

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

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| AI | Claude Haiku 4.5 (Anthropic) — 스트리밍 + 프롬프트 캐싱 |
| Database & Auth | Supabase (PostgreSQL + Google OAuth + Magic Link) |
| Observability | Arize Phoenix (OpenTelemetry 추적 + 사람 피드백) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |
| Deployment | Vercel |

---

## 시작하기

```bash
npm install
npm run dev
```

`.env.local` 파일에 아래 환경변수를 설정해주세요:

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PHOENIX_COLLECTOR_ENDPOINT=https://app.phoenix.arize.com
PHOENIX_API_KEY=
```

---

## 만든 이

우리 아기 단우와 세상 모든 부모님을 위해 💛  
Made with ❤️ by [Joanne](https://www.linkedin.com/in/junghyunhao/)
