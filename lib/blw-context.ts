export type BlwType = "blw" | "no-blw" | "mix";

// ─── Stage-specific BLW shape & texture guidelines ────────────────────────────
// Source: The Baby-led Weaning Cookbook (Gill Rapley), 100 BLW Recipes, Feed Me 6–12 Months

const BLW_STAGES = {
  early: {
    shape: "Long finger-sized sticks or strips (~7–8cm, as long as baby's fist). Baby grasps with full palm.",
    texture: "Steamed until very soft — squashes easily between two fingers. Never crunchy or hard.",
    examples: [
      "steamed sweet potato sticks", "steamed broccoli florets (whole)", "ripe banana halved lengthwise",
      "avocado wedges (skin on as handle)", "steamed carrot sticks", "toast strips with no salt butter",
      "steamed courgette/zucchini sticks", "ripe pear wedges", "steamed green bean spears",
    ],
    koreanExamples: [
      "단호박 스틱 (쪄서)", "바나나 반쪽", "브로콜리 송이째 찌기", "아보카도 웨지",
      "고구마 스틱 (쪄서)", "당근 스틱 (완전히 무르게)", "애호박 스틱",
    ],
    avoid: "No pieces smaller than a fist. No hard raw vegetables. No whole grapes or blueberries.",
  },
  middle: {
    shape: "Strips and small soft pieces (2–3cm). Pincer grasp developing.",
    texture: "Soft enough to mash with gums. Can include more variety of shapes.",
    examples: [
      "scrambled eggs", "soft oat pancake strips", "fish fingers (homemade, baked)",
      "chicken strips (very tender)", "banana oat balls", "soft cheese cubes",
      "frittata fingers", "sweet potato fries (baked, soft)", "soft tofu cubes",
      "chickpea patties (mashed)", "mini meatballs (soft)", "avocado cubes",
    ],
    koreanExamples: [
      "달걀 스크램블", "연두부 큐브", "부드러운 닭가슴살 스틱",
      "두부 구이 손가락 크기", "오트밀 팬케이크 스트립", "고구마 구이 조각",
      "브로콜리 작은 송이", "찐 당근 큐브",
    ],
    avoid: "No whole grapes, cherry tomatoes (halve or quarter). No sticky foods like peanut butter alone.",
  },
  late: {
    shape: "Small bite-sized pieces (1–2cm). Pincer grasp well developed.",
    texture: "Near-family food texture. Can handle more resistance.",
    examples: [
      "mini meatloaves", "lentil burgers cut up", "pasta shapes", "rice balls (onigiri style)",
      "soft fish cakes", "cheese and vegetable muffins (savoury)", "tuna cakes with sweet potato",
      "chickpea fritters", "mini vegetable quiche", "salmon footballs",
      "baked sweet potato croquettes", "whole wheat mini scones",
    ],
    koreanExamples: [
      "미니 주먹밥", "두부 구이 큐브", "달걀말이 조각", "야채전 조각",
      "소고기 완자", "치즈 스틱", "연어 구이 조각", "고구마 채",
    ],
    avoid: "Still avoid whole nuts, popcorn, hard sweets, marshmallows.",
  },
  completion: {
    shape: "Family food cut into manageable pieces. Can use spoon and fork with help.",
    texture: "Adult textures in smaller portions.",
    examples: [
      "family meals cut small", "bolognese with pasta", "shepherd's pie", "mild chicken curry with rice",
      "roast vegetables", "home-made pizza (small pieces)", "fish pie", "mild lamb tagine with couscous",
    ],
    koreanExamples: [
      "소고기 볶음밥", "된장국 건더기", "비빔밥 (야채 위주)", "닭갈비 (뼈 없이)",
      "참치 주먹밥", "야채 된장찌개 건더기", "달걀 프라이 (완전 익힌)",
    ],
    avoid: "No honey until 12 months (already passed for completion stage). Still avoid whole hard nuts.",
  },
};

// ─── Safety rules (universal) ──────────────────────────────────────────────────
const BLW_SAFETY = `
BLW UNIVERSAL SAFETY RULES (strictly follow):
- NEVER suggest: whole grapes, whole cherry tomatoes, whole blueberries, whole nuts, popcorn, hard raw carrots, hot dogs/sausages in rounds, hard sweets, or marshmallows — these are choking hazards.
- Grapes and cherry tomatoes MUST be halved or quartered lengthwise.
- ALL vegetables must be cooked until soft enough to squash between two fingers.
- NO added salt, sugar, honey, or soy sauce in any BLW meal.
- NO cow's milk as a drink (can use small amounts in cooking from 6 months).
- Always note breast milk or formula remains the primary nutrition source.`.trim();

// ─── Public builder ────────────────────────────────────────────────────────────

export function buildBlwContext(
  blwType: BlwType,
  stageId: "early" | "middle" | "late" | "completion",
  language: "en" | "ko",
): string {
  const stage = BLW_STAGES[stageId];

  if (blwType === "no-blw") {
    return `FEEDING APPROACH: Traditional spoon-feeding only. No finger foods unless already specified by the weaning stage. Focus on purées, smooth mashes, and spoon-fed textures appropriate to the stage.`;
  }

  const examples = language === "ko" ? stage.koreanExamples : stage.examples;
  const exampleList = examples.join(", ");

  const blwBlock = [
    `FEEDING APPROACH: ${blwType === "blw" ? "Baby-Led Weaning (BLW) — self-feeding only" : "Mixed approach (BLW + some spoon-fed meals)"}`,
    `FINGER FOOD SHAPE: ${stage.shape}`,
    `FINGER FOOD TEXTURE: ${stage.texture}`,
    `EXAMPLE FINGER FOODS FOR THIS STAGE: ${exampleList}`,
    `AVOID: ${stage.avoid}`,
    "",
    BLW_SAFETY,
  ];

  if (blwType === "blw") {
    blwBlock.push(
      "",
      "BLW MEAL FORMAT: Every meal must be self-feedable finger foods — no spoon-fed purées. Describe foods in the shape/size baby will pick up. Prep notes must explain how to cut/shape each item.",
    );
  } else {
    blwBlock.push(
      "",
      "MIXED FORMAT: At least 2 of the 4 meals should include finger food options alongside or instead of purées. Snack meal should always be a BLW-style finger food.",
    );
  }

  return blwBlock.join("\n");
}

// ─── Ingredient safety list by age (from Korean chart + international guides) ──
export const SAFE_INGREDIENTS_BY_MONTH: Record<number, string[]> = {
  5: [
    "rice (미음)", "glutinous rice", "sweet potato (단호박)", "zucchini (애호박)",
    "broccoli", "bok choy (청경채)", "cucumber", "cauliflower (콜리플라워)",
    "potato (감자)", "apple (사과)", "pear (배)",
  ],
  6: [
    // all 5-month foods plus:
    "sorghum (수수)", "lean beef (소고기 — fat removed)", "chicken (닭고기 — fat removed)",
    "egg yolk (달걀노른자)", "carrot (당근)", "spinach (시금치)", "vitamin greens (비타민)",
    "napa cabbage (알배추)", "chestnut (밤)", "onion (양파)", "beet (비트)",
    "peas (완두콩)", "kidney beans (강낭콩)", "silken tofu (연두부)",
    "banana (바나나)", "plum (자두)", "watermelon (수박)",
  ],
  7: [
    // all prior plus:
    "firm tofu (두부)", "mixed grains (잡곡)", "radish (무)", "cherry tomato (halved — 방울토마토)",
    "strawberry (딸기)", "corn (옥수수)", "cabbage (양배추)",
    "cod (대구)", "pollack (명태)", "tuna in water (참치 — no salt)",
    "avocado", "blueberry (halved)", "mango",
  ],
  10: [
    // late stage additions:
    "salmon", "egg white (달걀흰자)", "yogurt (plain full-fat)", "cheese (mild)",
    "lentils", "chickpeas", "pasta (wheat)", "oats",
    "soft cooked beans", "mild white fish", "peanut butter (thin spread, if no allergy)",
  ],
};
