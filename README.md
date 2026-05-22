# Little Spoonfuls 🥣

> AI가 추천하는 영양 만점 이유식 — Nutritionist-approved meals, crafted with love for your little one ✨

우리 아기에게 오늘 뭘 먹일지 고민되는 부모님을 위한 이유식 메뉴 추천 앱이에요.  
단우와 세상 모든 아기를 위해 만들었습니다 💛

---

## 주요 기능 Features

### 🍚 AI 이유식 메뉴 추천
- Claude AI가 아기의 나이·식단·알레르기를 고려해 하루 4끼(아침·점심·간식·저녁) 추천
- 초기·중기·후기·완료기 이유식 단계 자동 적용
- 한식 선택 시 미역죽, 소고기야채죽 등 진짜 한국 이유식 레시피 제공
- 하루 3번 추천 제한으로 매번 새로운 메뉴 구성 (중복 방지)

### 📖 레시피 상세보기 & 레시피북
- 메뉴 카드를 탭하면 재료·만드는 방법·팁이 담긴 상세 레시피 확인
- 조회한 레시피는 자동으로 나만의 레시피북에 저장
- 재료별 필터로 원하는 레시피 빠르게 탐색

### 👶 멀티 아기 프로필
- 여러 아기 프로필 등록 가능
- 알레르기(달걀·유제품·땅콩 등 8가지) 개별 설정
- 생년월일 기반 이유식 단계 자동 계산

### 🌏 한국어 / English 완전 지원
- 메뉴와 레시피 모두 한국어·영어로 동시 생성
- 프로필 설정에서 언어 전환 시 앱 전체 UI 변경

### 📅 식사 기록
- 추천받은 메뉴 히스토리 자동 저장
- 날짜별로 모아보기

---

## 기술 스택 Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| AI | Claude Haiku (Anthropic) |
| Database & Auth | Supabase (Google OAuth + Magic Link) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |

---

## 시작하기 Getting Started

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

## 만든 이 About

우리 아기 단우와 세상 모든 부모님을 위해 💛  
Made with ❤️ by [Joanne](https://www.linkedin.com/in/junghyunhao/)
