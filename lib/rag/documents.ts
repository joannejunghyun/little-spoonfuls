import type { BlwType } from "@/lib/blw-context";
import type { WeaningStage } from "@/lib/weaning-context";

export type RagLanguage = "en" | "ko";

export interface RagDocument {
  id: string;
  source: string;
  title: string;
  lang: RagLanguage;
  stages: Array<WeaningStage["id"] | "all">;
  cuisines?: Array<"korean" | "western" | "chinese" | "mix" | "all">;
  blwTypes?: Array<BlwType | "all">;
  tags: string[];
  content: string;
}

export const RAG_DOCUMENTS: RagDocument[] = [
  {
    id: "ko-constipation-fiber",
    source: "Curated infant nutrition guidance",
    title: "변비 요청: 부드러운 섬유질 식재료",
    lang: "ko",
    stages: ["middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["변비", "constipation", "fiber", "섬유질", "푸룬", "배", "오트", "고구마"],
    content:
      "변비가 걱정될 때는 배, 푸룬, 오트, 고구마, 브로콜리처럼 섬유질이 풍부하고 부드럽게 조리 가능한 식재료를 우선 고려한다. 월령에 맞는 질감으로 충분히 익히고, 새로운 식재료는 소량으로 시작한다.",
  },
  {
    id: "en-constipation-fiber",
    source: "Curated infant nutrition guidance",
    title: "Constipation support: soft fiber-rich foods",
    lang: "en",
    stages: ["middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["constipation", "fiber", "prune", "pear", "oats", "sweet potato", "broccoli"],
    content:
      "For constipation support, prioritize soft cooked pear, prune, oats, sweet potato, and broccoli. Keep textures appropriate for the baby's stage and introduce unfamiliar foods in small amounts.",
  },
  {
    id: "ko-iron-vitamin-c",
    source: "Curated infant nutrition guidance",
    title: "철분 요청: 철분과 비타민 C 조합",
    lang: "ko",
    stages: ["middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["철분", "iron", "소고기", "렌틸", "두부", "달걀노른자", "비타민 c"],
    content:
      "철분 보충이 필요할 때는 소고기, 렌틸, 달걀노른자, 두부 같은 철분 식재료를 활용하고, 브로콜리나 과일처럼 비타민 C를 제공하는 식재료와 함께 구성하면 흡수 전략에 도움이 된다.",
  },
  {
    id: "en-iron-vitamin-c",
    source: "Curated infant nutrition guidance",
    title: "Iron support: pair iron foods with vitamin C",
    lang: "en",
    stages: ["middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["iron", "beef", "lentil", "tofu", "egg yolk", "vitamin c"],
    content:
      "When a parent asks for iron support, use iron-rich foods such as beef, lentils, tofu, or egg yolk, and pair them with vitamin-C foods such as broccoli or fruit to support absorption strategy.",
  },
  {
    id: "ko-cold-immunity",
    source: "Curated infant nutrition guidance",
    title: "감기/면역 요청: 따뜻하고 비타민이 있는 구성",
    lang: "ko",
    stages: ["early", "middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["감기", "면역", "immunity", "cold", "비타민", "broth", "국물"],
    content:
      "감기나 면역이 걱정되는 날에는 부드러운 채소, 비타민 C가 있는 과일 또는 채소, 따뜻한 죽이나 맑은 국물 기반 구성이 편안하다. 소금이나 자극적인 양념은 넣지 않는다.",
  },
  {
    id: "en-cold-immunity",
    source: "Curated infant nutrition guidance",
    title: "Cold and immunity support: warm, gentle meals",
    lang: "en",
    stages: ["early", "middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["cold", "immunity", "vitamin", "broth", "warm"],
    content:
      "For cold or immunity concerns, choose gentle warm meals with soft vegetables, vitamin-C produce, and mild broth-like preparations. Avoid added salt and stimulating seasonings.",
  },
  {
    id: "ko-blw-choking-shapes",
    source: "BLW safety synthesis",
    title: "BLW 안전: 질식 위험 식품 형태 조정",
    lang: "ko",
    stages: ["late", "completion"],
    cuisines: ["all"],
    blwTypes: ["blw", "mix"],
    tags: ["blw", "핑거푸드", "질식", "포도", "방울토마토", "블루베리"],
    content:
      "BLW 또는 혼합 방식에서는 포도, 방울토마토, 블루베리처럼 둥근 식품을 통째로 주지 않는다. 월령에 맞게 세로로 자르거나 충분히 익혀 으깨지는 질감으로 제공한다.",
  },
  {
    id: "en-blw-choking-shapes",
    source: "BLW safety synthesis",
    title: "BLW safety: reshape round choking hazards",
    lang: "en",
    stages: ["late", "completion"],
    cuisines: ["all"],
    blwTypes: ["blw", "mix"],
    tags: ["blw", "finger food", "choking", "grapes", "tomatoes", "blueberries"],
    content:
      "For BLW or mixed feeding, never serve round foods such as grapes, cherry tomatoes, or blueberries whole. Cut lengthwise or soften and mash them according to the baby's stage.",
  },
  {
    id: "ko-korean-middle-texture",
    source: "Korean weaning stage synthesis",
    title: "한식 중기 이유식: 질감과 예시",
    lang: "ko",
    stages: ["middle"],
    cuisines: ["korean", "mix"],
    blwTypes: ["no-blw", "mix"],
    tags: ["한식", "중기", "죽", "질감", "다지기", "korean"],
    content:
      "한식 중기 이유식은 부드러운 죽이나 매시를 중심으로 하고, 0.2~0.3cm 정도의 작은 부드러운 덩어리까지 허용한다. 소고기단호박죽, 두부야채죽, 닭고기감자죽처럼 단백질과 채소를 함께 구성하기 좋다.",
  },
  {
    id: "en-korean-middle-texture",
    source: "Korean weaning stage synthesis",
    title: "Korean middle-stage texture and examples",
    lang: "en",
    stages: ["middle"],
    cuisines: ["korean", "mix"],
    blwTypes: ["no-blw", "mix"],
    tags: ["korean", "middle", "porridge", "texture", "soft mash"],
    content:
      "Korean middle-stage meals should lean on soft porridges or mashes with tiny soft lumps around 0.2-0.3cm. Good patterns include beef and squash porridge, tofu vegetable porridge, and chicken potato porridge.",
  },
  {
    id: "ko-sleep-gentle-evening",
    source: "Curated infant nutrition guidance",
    title: "수면 요청: 편안한 저녁 구성",
    lang: "ko",
    stages: ["middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["수면", "잠", "sleep", "바나나", "오트", "자극적"],
    content:
      "잠이나 저녁 안정이 걱정될 때는 바나나, 오트, 부드러운 잎채소처럼 부담이 적은 식재료를 활용하고, 단맛이 강하거나 자극적인 음식은 피한다. 저녁 메뉴는 소화가 편한 질감과 양으로 구성한다.",
  },
  {
    id: "en-sleep-gentle-evening",
    source: "Curated infant nutrition guidance",
    title: "Sleep support: gentle evening meals",
    lang: "en",
    stages: ["middle", "late", "completion"],
    cuisines: ["all"],
    blwTypes: ["all"],
    tags: ["sleep", "banana", "oats", "gentle", "evening"],
    content:
      "For sleep or evening calm concerns, use gentle foods such as banana, oats, and soft leafy greens, while avoiding stimulating or overly sweet meals. Keep dinner easy to digest and stage-appropriate.",
  },
];
