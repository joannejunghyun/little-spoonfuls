export interface WeaningStage {
  id: "early" | "middle" | "late" | "completion";
  nameKo: string;
  nameEn: string;
  ageRange: string;
  daysMin: number;
  daysMax: number;
  texture: string;
  chunkSizeKo: string;
  cookingRatioKo: string;
  portionG: string;
  mealsPerDay: number;
  fingerFoodsOk: boolean;
  koreanExamples: string[];
  koreanFingerFoods?: string[];
}

export const WEANING_STAGES: WeaningStage[] = [
  {
    id: "early",
    nameKo: "초기 이유식",
    nameEn: "Early Weaning",
    ageRange: "6–7 months",
    daysMin: 180,
    daysMax: 210,
    texture: "Completely smooth purée — no lumps at all. Blend or strain through sieve.",
    chunkSizeKo: "곱게 갈거나 체에 내리기 (완전 미음 상태)",
    cookingRatioKo: "10배죽 (물:쌀 = 10:1)",
    portionG: "30–80g per meal",
    mealsPerDay: 1,
    fingerFoodsOk: false,
    koreanExamples: [
      "쌀미음", "단호박죽", "브로콜리죽", "감자죽", "당근죽", "애호박죽",
      "달걀노른자미음", "고구마죽", "완두콩죽",
    ],
  },
  {
    id: "middle",
    nameKo: "중기 이유식",
    nameEn: "Middle Weaning",
    ageRange: "7–9 months",
    daysMin: 210,
    daysMax: 300,
    texture: "Soft mash — small soft lumps OK (0.2–0.3cm). No hard pieces.",
    chunkSizeKo: "0.2~0.3cm 크기로 다지기",
    cookingRatioKo: "8~5배죽",
    portionG: "80–120g per meal",
    mealsPerDay: 2,
    fingerFoodsOk: false,
    koreanExamples: [
      "소고기단호박죽", "대구살브로콜리죽", "닭고기청경채죽",
      "두부야채죽", "시금치소고기죽", "연두부죽",
      "소고기미역죽", "닭고기감자죽", "참치야채죽",
    ],
  },
  {
    id: "late",
    nameKo: "후기 이유식",
    nameEn: "Late Weaning",
    ageRange: "10–12 months",
    daysMin: 300,
    daysMax: 365,
    texture: "Soft chopped pieces (0.4–0.5cm). Soft finger foods are encouraged.",
    chunkSizeKo: "0.4~0.5cm 크기로 썰기",
    cookingRatioKo: "5배죽~진밥",
    portionG: "100–150g per meal",
    mealsPerDay: 3,
    fingerFoodsOk: true,
    koreanExamples: [
      "닭고기야채진밥", "달걀야채볶음진밥", "소고기당근진밥",
      "연어브로콜리진밥", "두부야채진밥",
    ],
    koreanFingerFoods: [
      "두부스틱", "고구마스틱", "삶은당근스틱", "바나나조각",
      "아보카도슬라이스", "사과쪄서 슬라이스", "달걀지단조각",
    ],
  },
  {
    id: "completion",
    nameKo: "완료기 이유식",
    nameEn: "Completion Stage",
    ageRange: "12+ months",
    daysMin: 365,
    daysMax: Infinity,
    texture: "Near-adult texture. Bite-sized pieces (0.7–1cm). Wide variety encouraged.",
    chunkSizeKo: "0.7~1cm 크기로 썰기, 진밥~어른밥",
    cookingRatioKo: "진밥~어른밥",
    portionG: "120–200g per meal",
    mealsPerDay: 3,
    fingerFoodsOk: true,
    koreanExamples: [
      "소고기볶음밥", "된장국밥(연하게)", "비빔밥(야채위주)",
      "닭갈비진밥", "고구마달걀볶음밥", "참치주먹밥",
    ],
    koreanFingerFoods: [
      "미니 주먹밥", "두부구이", "달걀말이", "야채전", "고구마채",
      "치즈스틱", "닭고기완자",
    ],
  },
];

export function getWeaningStage(days: number): WeaningStage {
  return (
    WEANING_STAGES.find((s) => days >= s.daysMin && days < s.daysMax) ??
    WEANING_STAGES[WEANING_STAGES.length - 1]
  );
}

export function buildStageContext(stage: WeaningStage, cuisine: string): string {
  const lines = [
    `WEANING STAGE: ${stage.nameKo} (${stage.nameEn}, ${stage.ageRange})`,
    `- Texture: ${stage.texture}`,
    `- Portion: ${stage.portionG}`,
    `- Meals per day: ${stage.mealsPerDay}`,
  ];

  if (cuisine === "korean") {
    lines.push(`- Korean cooking method: ${stage.cookingRatioKo} / ${stage.chunkSizeKo}`);
    lines.push(`- Authentic Korean examples for this stage: ${stage.koreanExamples.join(", ")}`);
    if (stage.fingerFoodsOk && stage.koreanFingerFoods) {
      lines.push(`- Korean finger foods (권장): ${stage.koreanFingerFoods.join(", ")}`);
    }
  }

  return lines.join("\n");
}
