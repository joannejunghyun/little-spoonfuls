import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { trace } from "@opentelemetry/api";
import { createClient } from "@/lib/supabase/server";
import { getWeaningStage, buildStageContext } from "@/lib/weaning-context";
import { buildBlwContext, type BlwType } from "@/lib/blw-context";
import { detectLang } from "@/lib/get-lang";
import { formatRetrievedContext, retrieveMealKnowledge } from "@/lib/rag/retrieve";

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  Egg: ["egg", "eggs", "yolk", "달걀", "계란"],
  Dairy: ["milk", "dairy", "cheese", "butter", "yogurt", "cream", "유제품", "치즈", "버터", "요거트", "우유"],
  Peanut: ["peanut", "groundnut", "땅콩"],
  "Tree Nuts": ["almond", "walnut", "cashew", "pecan", "hazelnut", "pistachio", "견과류", "아몬드", "호두"],
  Wheat: ["wheat", "flour", "bread", "pasta", "noodle", "밀", "밀가루", "빵", "국수"],
  Soy: ["soy", "tofu", "edamame", "miso", "두부", "콩", "두유"],
  Fish: ["salmon", "tuna", "cod", "haddock", "fish", "연어", "참치", "생선", "대구"],
  Shellfish: ["shrimp", "crab", "lobster", "prawn", "새우", "게", "조개"],
};

const DIET_RESTRICTIONS: Record<string, Array<{ label: string; keywords: string[] }>> = {
  all: [],
  pescatarian: [
    { label: "meat", keywords: ["meat", "beef", "chicken", "pork", "lamb", "turkey", "ham", "bacon", "sausage", "소고기", "쇠고기", "닭고기", "돼지고기", "고기", "햄", "베이컨", "소시지"] },
  ],
  "lacto-ovo": [
    { label: "meat", keywords: ["meat", "beef", "chicken", "pork", "lamb", "turkey", "ham", "bacon", "sausage", "소고기", "쇠고기", "닭고기", "돼지고기", "고기", "햄", "베이컨", "소시지"] },
    { label: "fish", keywords: ["fish", "salmon", "tuna", "cod", "shrimp", "crab", "lobster", "prawn", "shellfish", "생선", "연어", "참치", "대구", "새우", "게", "조개"] },
  ],
  lacto: [
    { label: "meat", keywords: ["meat", "beef", "chicken", "pork", "lamb", "turkey", "ham", "bacon", "sausage", "소고기", "쇠고기", "닭고기", "돼지고기", "고기", "햄", "베이컨", "소시지"] },
    { label: "fish", keywords: ["fish", "salmon", "tuna", "cod", "shrimp", "crab", "lobster", "prawn", "shellfish", "생선", "연어", "참치", "대구", "새우", "게", "조개"] },
    { label: "egg", keywords: ["egg", "eggs", "yolk", "달걀", "계란"] },
  ],
  ovo: [
    { label: "meat", keywords: ["meat", "beef", "chicken", "pork", "lamb", "turkey", "ham", "bacon", "sausage", "소고기", "쇠고기", "닭고기", "돼지고기", "고기", "햄", "베이컨", "소시지"] },
    { label: "fish", keywords: ["fish", "salmon", "tuna", "cod", "shrimp", "crab", "lobster", "prawn", "shellfish", "생선", "연어", "참치", "대구", "새우", "게", "조개"] },
    { label: "dairy", keywords: ["dairy", "milk", "cheese", "butter", "yogurt", "cream", "유제품", "치즈", "버터", "요거트", "우유"] },
  ],
  vegan: [
    { label: "meat", keywords: ["meat", "beef", "chicken", "pork", "lamb", "turkey", "ham", "bacon", "sausage", "소고기", "쇠고기", "닭고기", "돼지고기", "고기", "햄", "베이컨", "소시지"] },
    { label: "fish", keywords: ["fish", "salmon", "tuna", "cod", "shrimp", "crab", "lobster", "prawn", "shellfish", "생선", "연어", "참치", "대구", "새우", "게", "조개"] },
    { label: "egg", keywords: ["egg", "eggs", "yolk", "달걀", "계란"] },
    { label: "dairy", keywords: ["dairy", "milk", "cheese", "butter", "yogurt", "cream", "유제품", "치즈", "버터", "요거트", "우유"] },
    { label: "honey", keywords: ["honey", "꿀"] },
  ],
};

function containsKeyword(text: string, keyword: string): boolean {
  const normalized = text.toLowerCase();
  const kw = keyword.toLowerCase();
  if (/^[a-z0-9 ]+$/.test(kw)) {
    const pattern = kw
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`).test(normalized);
  }
  return normalized.includes(kw);
}

function findDietViolations(text: string, dietType: string): string[] {
  if (!text) return [];
  const restrictions = DIET_RESTRICTIONS[dietType] ?? [];
  const violations = new Set<string>();

  for (const restriction of restrictions) {
    const matched = restriction.keywords.find((keyword) => containsKeyword(text, keyword));
    if (matched) violations.add(`${restriction.label}:${matched}`);
  }

  return [...violations];
}

function checkAllergyViolations(meals: MealSet, allergies: string[]): string[] {
  if (allergies.length === 0) return [];
  const text = JSON.stringify(meals);
  return allergies.filter((allergen) => {
    const keywords = ALLERGEN_KEYWORDS[allergen] ?? [allergen.toLowerCase()];
    return keywords.some((kw) => containsKeyword(text, kw));
  });
}

function findRequestedAllergens(text: string, allergies: string[]): string[] {
  if (!text || allergies.length === 0) return [];
  return allergies.filter((allergen) => {
    const keywords = ALLERGEN_KEYWORDS[allergen] ?? [allergen.toLowerCase()];
    return keywords.some((kw) => containsKeyword(text, kw));
  });
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(all\s+)?(previous|prior|above|earlier|everything)/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+(if\s+)?(you\s+are\s+)?a?\s*(?!nutritionist|chef|baby)/i,
  /system\s*prompt/i,
  /\bdo\s+not\s+(follow|obey|comply)/i,
  /disregard\s+(all\s+)?(previous|prior|above|earlier)/i,
];

function sanitizeParentRequest(raw: string): string {
  const trimmed = raw
    .slice(0, 300)
    .replace(/[\x00-\x1F\x7F]/g, " ")   // strip control chars
    .replace(/[`<>]/g, "")               // strip chars used to escape prompt context
    .replace(/"{2,}/g, '"')              // collapse repeated quotes
    .trim();

  if (INJECTION_PATTERNS.some((re) => re.test(trimmed))) return "";
  return trimmed;
}

const client = new Anthropic();
const DAILY_LIMIT = 3;

export interface MealPlan {
  stage: string;
  cuisine: string;
  overall_advice?: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    snack: Meal;
    dinner: Meal;
  };
}

export interface Meal {
  name: string;
  ingredients: string[];
  prep: string;
  nutrition: string;
  steps?: string[];
  total_time?: string;
  servings?: string;
  tips?: string;
  expert_note?: string;
}

type MealSet = MealPlan["meals"];

interface ParsedPlan {
  stage: string;
  cuisine: string;
  overall_advice?: string;
  meals: MealSet;
}

export async function POST(req: NextRequest) {
  try {
    return await handleGenerate(req);
  } catch (err) {
    console.error("[generate] unhandled error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function handleGenerate(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to generate meal plans." }, { status: 401 });
  }

  const isAdmin =
    process.env.NODE_ENV !== "production" ||
    user.user_metadata?.role === "admin";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Parse body first so baby_id is available for parallel DB queries
  const { baby_id, cuisine, blw_type, parent_request } = await req.json();
  const blwType: BlwType = ["blw", "no-blw", "mix"].includes(blw_type) ? blw_type : "no-blw";
  const parentRequest: string = typeof parent_request === "string" ? sanitizeParentRequest(parent_request) : "";
  const language: "en" | "ko" = detectLang(user.user_metadata?.language, req.headers.get("accept-language"));

  // Fire all three DB queries in parallel (saves ~1 round-trip vs sequential)
  const [
    { count },
    { data: baby, error: babyError },
    { data: todayHistory },
  ] = await Promise.all([
    supabase
      .from("generation_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("babies")
      .select("name, birth_date, diet_type, allergies")
      .eq("id", baby_id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("menu_history")
      .select("meals_en")
      .eq("baby_id", baby_id)
      .gte("created_at", todayStart.toISOString()),
  ]);

  if (!isAdmin && (count ?? 0) >= DAILY_LIMIT) {
    const msg = language === "ko"
      ? `오늘의 추천은 모두 사용했어요 — 내일 새 메뉴로 만나요! 🌙`
      : `You've reached today's limit of ${DAILY_LIMIT} meal plans. Come back tomorrow! 🌙`;
    return NextResponse.json({ error: msg }, { status: 429 });
  }

  if (babyError || !baby) {
    const msg = language === "ko" ? "아기 프로필을 찾을 수 없어요." : "Baby profile not found.";
    return NextResponse.json({ error: msg }, { status: 404 });
  }

  const days = Math.floor((Date.now() - new Date(baby.birth_date).getTime()) / 86400000);

  if (days < 180) {
    const msg = language === "ko"
      ? `${baby.name}는 아직 이유식을 시작하기엔 조금 일러요 💛 지금은 모유나 분유가 최고예요!`
      : `${baby.name} isn't ready for solids yet!`;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const weaningStage = getWeaningStage(days);
  const months = Math.floor(days / 30);
  const allergies = baby.allergies ?? [];
  const requestedAllergens = findRequestedAllergens(parentRequest, allergies);
  if (requestedAllergens.length > 0) {
    const span = trace.getActiveSpan();
    span?.setAttribute("eval.safety_passed", false);
    span?.setAttribute("eval.blocked_response", true);
    span?.setAttribute("eval.block_reason", "allergy_requested");
    span?.setAttribute("eval.violated_allergens", requestedAllergens.join(", "));

    const msg = language === "ko"
      ? `${baby.name}의 알레르기(${requestedAllergens.join(", ")})가 포함된 요청이라 메뉴를 만들 수 없어요. 해당 재료를 제외하고 다시 요청해 주세요.`
      : `I can't create a meal plan with ${requestedAllergens.join(", ")} because it conflicts with ${baby.name}'s allergy profile. Please ask again without that ingredient.`;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const requestedDietViolations = findDietViolations(parentRequest, baby.diet_type);
  if (requestedDietViolations.length > 0) {
    const span = trace.getActiveSpan();
    span?.setAttribute("eval.safety_passed", false);
    span?.setAttribute("eval.blocked_response", true);
    span?.setAttribute("eval.block_reason", "diet_requested");
    span?.setAttribute("eval.diet_violation", true);
    span?.setAttribute("eval.violated_diet_items", requestedDietViolations.join(", "));

    const msg = language === "ko"
      ? `${baby.name}의 식단 설정(${baby.diet_type})과 맞지 않는 재료가 포함된 요청이라 메뉴를 만들 수 없어요. 해당 재료를 제외하고 다시 요청해 주세요.`
      : `I can't create a meal plan with that ingredient because it conflicts with ${baby.name}'s ${baby.diet_type} diet setting. Please ask again without it.`;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const allergyNote = allergies.length > 0
    ? `STRICT ALLERGIES TO AVOID: ${allergies.join(", ")}. Never include these ingredients or close synonyms, even if the parent asks for them.`
    : "No known allergies.";
  const CUISINE_LABELS: Record<string, string> = {
    mix: "a global mix (Korean, Western, or Chinese)",
    western: "Western cuisine (freely draw from American, French, Italian, Spanish, and other European styles)",
    korean: "Korean",
    chinese: "Chinese",
  };
  const cuisineLabel = CUISINE_LABELS[cuisine] ?? cuisine;

  const usedMealNames: string[] = [];
  for (const entry of todayHistory ?? []) {
    const m = entry.meals_en as MealSet | null;
    if (m?.breakfast) usedMealNames.push(m.breakfast.name, m.lunch.name, m.snack.name, m.dinner.name);
  }
  const dedupRule = usedMealNames.length > 0
    ? `\nALREADY SERVED TODAY — do NOT repeat any of these meals: ${usedMealNames.join(", ")}.`
    : "";

  const mealFields = parentRequest
    ? `"name": "", "ingredients": [], "prep": "", "nutrition": "", "expert_note": ""`
    : `"name": "", "ingredients": [], "prep": "", "nutrition": ""`;

  const mealTemplate = `{
      "breakfast": { ${mealFields} },
      "lunch":     { ${mealFields} },
      "snack":     { ${mealFields} },
      "dinner":    { ${mealFields} }
    }`;

  // Split into cached (static per stage+blwType) and dynamic (per-request) parts
  const stageContext = buildStageContext(weaningStage, cuisine);
  const blwContext = buildBlwContext(blwType, weaningStage.id, language);
  const langLabel = language === "ko" ? "Korean (한국어)" : "English";

  const requestContext = parentRequest
    ? `PARENT'S SPECIAL REQUEST TODAY: "${parentRequest}"
Adapt every meal to directly address this concern. Guidance:
- Sleep/stress → magnesium-rich: banana, oats, leafy greens; avoid stimulating foods
- Constipation → high-fiber: prunes, pear, broccoli, sweet potato, oats
- Iron → beef, lentils, spinach, fortified cereal; pair with vitamin C foods
- Vitamin A → sweet potato, carrot, butternut squash, mango, spinach
- Cold/immunity → vitamin C foods, warm broths, leafy greens
- Protein → beef, chicken, lentils, egg yolk, tofu, fish
- Calcium → yogurt, cheese, broccoli, tofu
- Specific ingredient mentioned → build at least one meal around that ingredient

OVERALL ADVICE REQUIREMENT: Fill overall_advice with 2–3 sentences in ${langLabel} summarising the nutritional strategy for the day. Warm, reassuring tone.

EXPERT NOTE REQUIREMENT: For each meal, fill expert_note with 1 sentence in ${langLabel} explaining why this meal helps with the parent's concern. Be warm, not clinical.`
    : "";

  const systemPrompt = `You are a certified baby nutritionist specializing in infant weaning (이유식). You respond ONLY with valid JSON — no markdown fences, no preamble, no explanation. Your response must start with { and end with }. Never truncate — output the complete JSON.
IMPORTANT RULES:
- Do not use breast milk, formula, 모유, or 분유 as recipe ingredients, mixing liquids, prep steps, or texture-adjustment instructions.
- If feeding milk must be mentioned, only say breast milk or formula remains separate primary nutrition where appropriate. Never write "breast milk" or "모유" alone.`;

  const DIET_LABELS: Record<string, string> = {
    all: "Omnivore (meat, fish, dairy, eggs all OK — no restrictions)",
    pescatarian: "Pescatarian (no meat — fish, dairy, and eggs OK)",
    "lacto-ovo": "Lacto-ovo vegetarian (no meat/fish — dairy and eggs OK)",
    lacto: "Lacto vegetarian (no meat/fish/eggs — dairy OK)",
    ovo: "Ovo vegetarian (no meat/fish/dairy — eggs OK)",
    vegan: "Vegan (no animal products at all)",
  };
  const dietLabel = DIET_LABELS[baby.diet_type] ?? DIET_LABELS.all;
  const retrievalQuery = [
    parentRequest,
    cuisineLabel,
    dietLabel,
    weaningStage.nameEn,
    weaningStage.nameKo,
    blwType,
    allergies.join(", "),
  ].filter(Boolean).join("\n");
  const retrievedDocs = retrieveMealKnowledge({
    query: retrievalQuery,
    stage: weaningStage.id,
    language,
    cuisine,
    blwType,
    matchCount: 5,
  });
  const retrievedContext = formatRetrievedContext(retrievedDocs);
  const generationSpan = trace.getActiveSpan();
  if (generationSpan) {
    generationSpan.setAttribute("gen.stage", weaningStage.nameEn);
    generationSpan.setAttribute("gen.blw_type", blwType);
    generationSpan.setAttribute("gen.has_parent_request", !!parentRequest);
    generationSpan.setAttribute("gen.cuisine", cuisine);
    generationSpan.setAttribute("rag.enabled", true);
    generationSpan.setAttribute("rag.match_count", retrievedDocs.length);
    generationSpan.setAttribute("rag.doc_ids", retrievedDocs.map((doc) => doc.id).join(", "));
    generationSpan.setAttribute("rag.sources", [...new Set(retrievedDocs.map((doc) => doc.source))].join(", "));
    generationSpan.setAttribute("rag.top_score", retrievedDocs[0]?.score ?? 0);
    generationSpan.setAttribute("rag.matched_tags", [...new Set(retrievedDocs.flatMap((doc) => doc.matchedTags))].join(", "));
  }

  const dynamicPrompt = `Baby details:
- Name: ${baby.name}
- Age: ${days} days (approximately ${months} months)
- Diet type: ${dietLabel}
- Cuisine style: ${cuisineLabel}
- ${allergyNote}${dedupRule}
${requestContext ? `\n${requestContext}\n` : ""}
MANDATORY NUTRITION RULES (follow strictly):
1. At least one meal (lunch or dinner) MUST feature a combination of 3 or more distinct vegetables or produce items.
2. Vary the vegetables across all four meals — do not repeat the same vegetable in more than one meal.
3. Prioritize whole, nutrient-dense, colorful produce appropriate for the baby's stage and texture.
4. ${blwType === "blw" ? "ALL meals must be BLW finger-food format — no spoon-fed purées. See feeding approach section above." : blwType === "mix" ? "At least 2 of 4 meals must have a BLW finger food component. Snack must always be a BLW-style finger food." : weaningStage.fingerFoodsOk ? "INCLUDE at least one finger food option per day (snack is a good fit)." : "Do NOT include finger foods — this stage requires fully puréed or mashed textures only."}
5. Allergy, diet, choking, and stage-texture rules override the parent's request. If the parent requests a forbidden ingredient, omit it and choose a safe substitute.
6. Do NOT use breast milk, formula, 모유, or 분유 in any ingredient list, prep text, nutrition text, expert note, or texture-adjustment instruction. Use water, cooking water, unsalted vegetable stock, or fruit/vegetable puree where liquid is needed.

RAG GROUNDING RULES:
- Use the retrieved expert references as request-specific grounding.
- If retrieved references conflict with allergy, choking, stage texture, or diet rules, the safety and profile rules win.
- Do not invent medical claims beyond the retrieved references and static safety rules.

Generate a complete, safe, and nutritious day's meal plan with 4 meals appropriate for this exact stage.
Write the ENTIRE meal plan in ${langLabel}.

Return this exact JSON structure, fully filled in:
{
  "stage": "${weaningStage.nameEn}",
  "cuisine": "${cuisineLabel}",${parentRequest ? `
  "overall_advice": "",` : ""}
  "meals": ${mealTemplate}
}`;

  // Increment usage count before streaming
  supabase.from("generation_log").insert({ user_id: user.id }).then(null, console.error);

  const remaining = isAdmin ? null : DAILY_LIMIT - (count ?? 0) - 1;

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${stageContext}\n\n${blwContext}`,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: `RETRIEVED EXPERT REFERENCES:\n${retrievedContext}`,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: dynamicPrompt,
          },
        ],
      },
    ],
  });

  // After stream: save history + run allergy evaluation
  stream.finalMessage().then((msg) => {
    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;
    try {
      const parsed = JSON.parse(jsonMatch[0]) as ParsedPlan;

      // Allergy safety evaluation — annotate the active span
      const violations = checkAllergyViolations(parsed.meals, baby.allergies ?? []);
      const dietViolations = findDietViolations(JSON.stringify(parsed.meals), baby.diet_type);
      const span = generationSpan ?? trace.getActiveSpan();
      if (span) {
        span.setAttribute("eval.safety_passed", violations.length === 0 && dietViolations.length === 0);
        span.setAttribute("eval.allergy_violation", violations.length > 0);
        if (violations.length > 0) {
          span.setAttribute("eval.violated_allergens", violations.join(", "));
          console.error("[SAFETY] Allergy violation detected:", violations, "for user:", user.id);
        }
        span.setAttribute("eval.diet_violation", dietViolations.length > 0);
        if (dietViolations.length > 0) {
          span.setAttribute("eval.violated_diet_items", dietViolations.join(", "));
          console.error("[SAFETY] Diet violation detected:", dietViolations, "for user:", user.id);
        }
      }

      supabase.from("menu_history").insert({
        user_id: user.id,
        baby_id,
        stage: parsed.stage,
        cuisine: parsed.cuisine,
        meals_en: parsed.meals,
        meals_ko: parsed.meals,
      }).then(null, console.error);
    } catch { /* silent */ }
  }).catch(console.error);

  // Capture trace ID before starting stream for client feedback linking
  const traceId = trace.getActiveSpan()?.spanContext().traceId ?? "";

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Accel-Buffering": "no",
        ...(remaining !== null ? { "X-Remaining": String(remaining) } : {}),
        ...(traceId ? { "X-Trace-Id": traceId } : {}),
      },
    }
  );
}
