export const translations = {
  en: {
    // Navigation
    back: "← Back",
    signOut: "Sign out",
    history: "History",
    profiles: "Profiles",

    // Pages
    appName: "Little Spoonfuls 🥣",
    appTagline: "Meals curated by infant nutrition experts, crafted with love for your little one ✨",
    babyProfiles: "Baby Profiles",
    mealHistory: "Meal History",

    // MealPlanner
    baby: "Baby",
    manageProfiles: "Manage profiles →",
    todayCuisine: "Today's Cuisine",
    cuisines: {
      mix: "Global Mix 🌎",
      korean: "Korean 🇰🇷",
      western: "Western 🇺🇸",
      chinese: "Chinese 🇨🇳",
    },
    feedingApproach: "Feeding Approach",
    blwTypes: {
      "no-blw": "Traditional (Spoon-fed) 🥄",
      blw: "Baby-Led Weaning (BLW) 👐",
      mix: "Mixed (BLW + Spoon) 🥄👐",
    },
    parentRequestLabel: "Anything specific today?",
    parentRequestPlaceholder: "e.g. sweet potato at home · needs iron · constipation · poor sleep...",
    parentRequestChips: [
      "Poor sleep 🌙",
      "Constipation 💩",
      "Needs iron 🩸",
      "Vitamin A 🥕",
      "Has a cold 🤧",
      "More protein 💪",
      "Boost calcium 🥛",
    ],
    generateBtn: "What should baby eat today? 🥣",
    loadingBtn: "Selecting from expert-curated recipes... ✨",
    limitBtn: "See you tomorrow! 🌙",
    remaining: (n: number, _total: number) => `${n} more ${n === 1 ? "suggestion" : "suggestions"} left today`,
    limitReached: "That's all for today — come back tomorrow for fresh ideas!",

    // Meal types
    breakfast: "Breakfast",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner",

    // MealCard
    tapForRecipe: "Tap for recipe →",

    // RecipeSheet
    ingredients: "Ingredients",
    howToMake: "How to Make",
    parentTip: "Parent Tip 💡",
    gettingRecipe: "Cooking up the recipe... 🍳",
    saveRecipe: "Save to Favorites",
    recipeSavedBtn: "Saved ❤️",
    expertAdvice: "Expert Advice",
    overallAdvice: "Today's Expert Advice",

    // Favorites
    recipeBook: "Favorites",
    recipeBookTitle: "My Favorites",
    allIngredients: "All",
    noRecipesYet: "No recipes saved yet",
    noRecipesDesc: "Tap any meal card, view the recipe, then hit ❤️ to save it here 📖",
    recipeSavedCount: (n: number) => `${n} recipe${n === 1 ? "" : "s"} saved`,

    // History
    today: "Today",
    yesterday: "Yesterday",
    noMealsYet: "No meal plans yet",
    noMealsDesc: "Your baby's meal history will appear here 🥣",

    // Profile
    languageLabel: "Language / 언어",
    languageNote: "Menus and recipes will be generated in English.",
    addFirstBaby: "Let's start by adding your baby 🍼",
    addAnotherBaby: "Add another baby",
    addBabyBtn: "+ Add Baby",
    editBtn: "Edit",
    editingProfile: (name: string) => `Editing ${name}'s profile`,

    // BabyForm
    babyName: "Baby's Name",
    babyNamePlaceholder: "e.g. Danu",
    dateOfBirth: "Date of Birth",
    dietaryStyle: "Dietary Style",
    diets: {
      all: "All (Omnivore)",
      vegetarian: "Vegetarian",
      vegan: "Vegan",
    },
    allergiesLabel: "Allergies to Avoid",
    saveChanges: "Save Changes",
    addBaby: "Add Baby",
    remove: "Remove",
    saving: "Saving...",
    removeConfirm: (name: string) => `Remove ${name}'s profile?`,

    // Footer
    footerText: "For Danu and every parent in the world",
    footerMadeBy: "Made with ❤️ by",

    // Age & stage labels
    ageDay: (n: number) => `${n} days old`,
    ageMonth: (n: number) => `${n} months old`,
    ageYear: (n: number) => `${n} years old`,
    stageNotReady: "Not yet started",
    stageDisplay: (s: string) => s,

    // Profile labels
    dietLabel: "Diet",
    allergyNo: (a: string) => `No ${a}`,
    allergens: {
      Egg: "Egg",
      Dairy: "Dairy",
      Peanut: "Peanut",
      "Tree Nuts": "Tree Nuts",
      Wheat: "Wheat",
      Soy: "Soy",
      Fish: "Fish",
      Shellfish: "Shellfish",
    },

    // Vote
    voteTitle: "Want unlimited meal plans?",
    voteDesc: "$4.99/mo for unlimited daily suggestions. Vote to let us know you're interested — early voters get a launch discount!",
    voteProgress: (n: number, target: number) => `${n} of ${target} votes`,
    voteNeeded: (n: number) => `${n} more needed`,
    voteGoalReached: "Goal reached! 🎉",
    voteBtn: "Count me in! ✋",
    voteThanks: "You're in! Thanks for voting 🎉",
    voteEarlyBird: "You'll get an early-bird discount when we launch.",
    voteLater: "Not now",

    // Errors
    notReadyYet: (name: string) => `${name} isn't quite ready for solids yet — breast milk or formula is still best! 💛`,
    somethingWrong: "Something went wrong. Please try again.",
  },
  ko: {
    // Navigation
    back: "← 뒤로",
    signOut: "로그아웃",
    history: "식사 기록",
    profiles: "프로필",

    // Pages
    appName: "Little Spoonfuls 🥣",
    appTagline: "세계 유아식 전문가 자료를 바탕으로 선별한 오늘의 이유식 메뉴 💛",
    babyProfiles: "아기 프로필",
    mealHistory: "식사 기록",

    // MealPlanner
    baby: "아기",
    manageProfiles: "프로필 관리 →",
    todayCuisine: "오늘의 요리",
    cuisines: {
      mix: "골고루 🌎",
      korean: "한식 🇰🇷",
      western: "양식 🇺🇸",
      chinese: "중식 🇨🇳",
    },
    feedingApproach: "수유 방식",
    blwTypes: {
      "no-blw": "일반 이유식 (숟가락) 🥄",
      blw: "자기주도이유식 (BLW) 👐",
      mix: "혼합 방식 🥄👐",
    },
    parentRequestLabel: "오늘 특별한 요청이 있나요?",
    parentRequestPlaceholder: "예: 집에 고구마가 있어요 · 철분이 필요해요 · 변비가 있어요 · 잠을 설쳤어요...",
    parentRequestChips: [
      "잠을 설쳤어요 🌙",
      "변비가 있어요 💩",
      "철분이 필요해요 🩸",
      "비타민 A 보충 🥕",
      "감기 기운이 있어요 🤧",
      "단백질 보충 💪",
      "칼슘 보충 🥛",
    ],
    generateBtn: "오늘 이유식 뭐먹이지? 🥣",
    loadingBtn: "전문가 레시피에서 딱 맞는 메뉴를 고르는 중이에요... ✨",
    limitBtn: "내일 또 만나요! 🌙",
    remaining: (n: number, _total: number) => `오늘 ${n}번 더 추천받을 수 있어요`,
    limitReached: "오늘 추천은 모두 사용했어요 — 내일 새 메뉴로 만나요!",

    // Meal types
    breakfast: "아침",
    lunch: "점심",
    snack: "간식",
    dinner: "저녁",

    // MealCard
    tapForRecipe: "레시피 보기 →",

    // RecipeSheet
    ingredients: "재료",
    howToMake: "만드는 방법",
    parentTip: "이런 점도 알아두세요 💡",
    gettingRecipe: "레시피를 불러오는 중이에요... 🍳",
    saveRecipe: "찜한 메뉴에 저장하기",
    recipeSavedBtn: "저장됨 ❤️",
    expertAdvice: "전문가의 조언",
    overallAdvice: "오늘의 전문가 조언",

    // Favorites
    recipeBook: "찜한 메뉴",
    recipeBookTitle: "찜한 메뉴",
    allIngredients: "전체",
    noRecipesYet: "저장된 레시피가 없어요",
    noRecipesDesc: "메뉴 카드를 탭해서 레시피를 보고, ❤️ 를 눌러 저장하세요 📖",
    recipeSavedCount: (n: number) => `레시피 ${n}개 저장됨`,

    // History
    today: "오늘",
    yesterday: "어제",
    noMealsYet: "아직 추천받은 메뉴가 없어요",
    noMealsDesc: "메뉴를 추천받으면 여기서 확인할 수 있어요 🥣",

    // Profile
    languageLabel: "Language / 언어",
    languageNote: "메뉴와 레시피가 한국어로 생성됩니다.",
    addFirstBaby: "아기 정보를 먼저 등록해주세요 🍼",
    addAnotherBaby: "다른 아기 추가하기",
    addBabyBtn: "+ 아기 추가",
    editBtn: "수정",
    editingProfile: (name: string) => `${name} 프로필 수정하기`,

    // BabyForm
    babyName: "아기 이름",
    babyNamePlaceholder: "예: 단우",
    dateOfBirth: "생년월일",
    dietaryStyle: "식단",
    diets: {
      all: "일반식 (육류 포함)",
      vegetarian: "채식",
      vegan: "완전 채식",
    },
    allergiesLabel: "알레르기 정보",
    saveChanges: "저장하기",
    addBaby: "등록하기",
    remove: "삭제",
    saving: "저장 중...",
    removeConfirm: (name: string) => `${name}의 프로필을 삭제할까요?`,

    // Footer
    footerText: "우리 아기 단우와 세상 모든 부모님을 위해",
    footerMadeBy: "사랑을 담아",

    // Age & stage labels
    ageDay: (n: number) => `${n}일`,
    ageMonth: (n: number) => `${n}개월`,
    ageYear: (n: number) => `만 ${n}세`,
    stageNotReady: "이유식 전",
    stageDisplay: (s: string) => {
      const map: Record<string, string> = {
        "Early Weaning": "초기 이유식",
        "Middle Weaning": "중기 이유식",
        "Late Weaning": "후기 이유식",
        "Completion Stage": "완료기 이유식",
        "Stage 1": "초기",
        "Stage 2": "중기",
        "Stage 3": "후기",
        "Stage 4": "완료기",
      };
      return map[s] ?? s;
    },

    // Profile labels
    dietLabel: "식단",
    allergyNo: (a: string) => `${a} 제외`,
    allergens: {
      Egg: "달걀",
      Dairy: "유제품",
      Peanut: "땅콩",
      "Tree Nuts": "견과류",
      Wheat: "밀",
      Soy: "대두",
      Fish: "생선",
      Shellfish: "갑각류",
    },

    // Vote
    voteTitle: "무제한 메뉴 추천을 원하시나요?",
    voteDesc: "월 $4.99로 하루 제한 없이 메뉴를 추천받을 수 있어요. 관심 있다면 투표해주세요 — 얼리버드 할인 혜택을 드려요!",
    voteProgress: (n: number, target: number) => `${n}/${target}명 투표 완료`,
    voteNeeded: (n: number) => `${n}명 더 필요해요`,
    voteGoalReached: "목표 달성! 🎉",
    voteBtn: "저도 원해요! ✋",
    voteThanks: "투표해 주셔서 감사해요 🎉",
    voteEarlyBird: "출시 시 얼리버드 할인 혜택을 드릴게요.",
    voteLater: "나중에요",

    // Errors
    notReadyYet: (name: string) => `${name}는 아직 이유식을 시작하기엔 조금 일러요 💛 지금은 모유나 분유가 최고예요!`,
    somethingWrong: "오류가 발생했어요. 다시 시도해주세요.",
  },
} as const;

export type Lang = "en" | "ko";

type DeepLoosen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
  ? (...args: A) => string
  : { [K in keyof T]: DeepLoosen<T[K]> };

export type Translations = DeepLoosen<typeof translations.en>;
