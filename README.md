# Little Spoonfuls 🥣

> Meals curated by infant nutrition experts, crafted with love for your little one ✨

A baby food meal planner app for parents who want nutritious, stage-appropriate meals for their little ones — built for Danu and every baby in the world 💛

---

## Features

### 🍚 Expert-Curated Meal Recommendations
- Generates a full day's meal plan (breakfast, lunch, snack, dinner) tailored to your baby's age, diet, and allergies
- Automatically detects weaning stage: Early (6–7M) → Middle (7–9M) → Late (10–12M) → Completion (12M+)
- Recommendations are grounded in guidance from 7 international infant nutrition research sources (see below)
- Deduplication: already-served meals today are never repeated
- Daily limit of 3 suggestions to encourage variety

### 👐 Baby-Led Weaning (BLW) Support
- Choose your feeding approach: **Traditional (spoon-fed)**, **Baby-Led Weaning**, or **Mixed**
- BLW mode generates self-feedable finger food meals with stage-appropriate shapes and sizes (e.g. 7–8cm sticks for 6–7M, soft cubes for 8–9M)
- Mixed mode ensures at least 2 out of 4 meals include finger food options; snack is always BLW-style
- Built-in choking safety rules applied to every BLW meal (no whole grapes, hard raw veg, honey, etc.)
- Bilingual finger food examples (English + Korean) for each stage

### 🌏 Cuisine Selection
- **Global Mix** — draws from Korean, Western, and Chinese weaning traditions
- **Korean** — authentic 이유식 recipes: 미역죽, 소고기야채죽, 두부야채진밥, and more
- **Western** — purées, frittatas, fish fingers, oat pancakes
- **Chinese** — congee-style dishes and steamed options

### 📖 Recipe Detail & Recipe Book
- Tap any meal card to load a full recipe: ingredients, step-by-step method, and a parent tip
- Every viewed recipe is automatically saved to your personal Recipe Book
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
- Every meal plan and recipe is generated in both English and Korean simultaneously
- Switch language in profile settings — the entire app UI updates instantly

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
| AI | Claude Haiku (Anthropic) |
| Database & Auth | Supabase (PostgreSQL + Google OAuth + Magic Link) |
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

### 👐 자기주도이유식 (BLW) 지원
- 수유 방식 선택: **일반 이유식 (숟가락)**, **자기주도이유식 (BLW)**, **혼합 방식**
- BLW 선택 시 단계별 핑거푸드 형태로 메뉴 구성 (6–7개월: 7–8cm 스틱, 8–9개월: 부드러운 큐브 등)
- 혼합 방식: 4끼 중 최소 2끼 + 간식은 항상 BLW 형태
- 질식 방지 안전 규칙 내장 (포도 통째, 딱딱한 날 채소, 꿀 등 자동 제외)
- 각 단계별 핑거푸드 예시 한국어·영어 동시 제공

### 🌏 요리 스타일 선택
- **골고루** — 한식·양식·중식 균형 있게
- **한식** — 미역죽, 소고기야채죽, 두부야채진밥 등 정통 한국 이유식
- **양식** — 퓨레, 프리타타, 생선 핑거, 오트 팬케이크
- **중식** — 죽 스타일 요리, 찐 채소 메뉴

### 📖 레시피 상세보기 & 레시피북
- 메뉴 카드 탭 → 재료·만드는 방법·부모 팁 확인
- 조회한 레시피는 나만의 레시피북에 자동 저장
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
- 메뉴와 레시피 모두 한국어·영어로 동시 생성
- 프로필에서 언어 전환 시 앱 전체 UI 즉시 변경

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
| AI | Claude Haiku (Anthropic) |
| Database & Auth | Supabase (PostgreSQL + Google OAuth + Magic Link) |
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
```

---

## 만든 이

우리 아기 단우와 세상 모든 부모님을 위해 💛  
Made with ❤️ by [Joanne](https://www.linkedin.com/in/junghyunhao/)
