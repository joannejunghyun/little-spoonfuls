import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWeaningStage, buildStageContext } from "@/lib/weaning-context";
import { buildBlwContext, type BlwType } from "@/lib/blw-context";

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
  // Embedded recipe — populated at generation time to avoid a second API call
  steps?: string[];
  total_time?: string;
  servings?: string;
  tips?: string;
  // Populated only when a parent request was provided
  expert_note?: string;
}

type MealSet = MealPlan["meals"];

interface BilingualPlan {
  stage: string;
  cuisine: string;
  overall_advice_en?: string;
  overall_advice_ko?: string;
  meals_en: MealSet;
  meals_ko: MealSet;
}


export async function POST(req: NextRequest) {
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

  const { count } = await supabase
    .from("generation_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  if (!isAdmin && (count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${DAILY_LIMIT} meal plans. Come back tomorrow! 🌙` },
      { status: 429 }
    );
  }

  const { baby_id, cuisine, blw_type, parent_request } = await req.json();
  const blwType: BlwType = ["blw", "no-blw", "mix"].includes(blw_type) ? blw_type : "no-blw";
  const parentRequest: string = typeof parent_request === "string" ? parent_request.slice(0, 300) : "";
  const language: "en" | "ko" = user.user_metadata?.language ?? "en";

  const [{ data: baby, error: babyError }, { data: todayHistory }] = await Promise.all([
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

  if (babyError || !baby) {
    return NextResponse.json({ error: "Baby profile not found." }, { status: 404 });
  }

  const days = Math.floor((Date.now() - new Date(baby.birth_date).getTime()) / 86400000);

  if (days < 180) {
    return NextResponse.json({ error: `${baby.name} isn't ready for solids yet!` }, { status: 400 });
  }

  const weaningStage = getWeaningStage(days);
  const months = Math.floor(days / 30);
  const allergyNote = baby.allergies.length > 0
    ? `STRICT ALLERGIES TO AVOID: ${baby.allergies.join(", ")}.`
    : "No known allergies.";
  const cuisineLabel = cuisine === "mix" ? "a global mix (Korean, Western, or Chinese)" : cuisine;

  const usedMealNames: string[] = [];
  for (const entry of todayHistory ?? []) {
    const m = entry.meals_en as MealSet;
    usedMealNames.push(m.breakfast.name, m.lunch.name, m.snack.name, m.dinner.name);
  }
  const dedupRule = usedMealNames.length > 0
    ? `\nALREADY SERVED TODAY — do NOT repeat any of these meals: ${usedMealNames.join(", ")}.`
    : "";

  const mealFields = parentRequest
    ? `"name": "", "ingredients": [], "prep": "", "nutrition": "", "total_time": "", "servings": "", "steps": [], "tips": "", "expert_note": ""`
    : `"name": "", "ingredients": [], "prep": "", "nutrition": "", "total_time": "", "servings": "", "steps": [], "tips": ""`;

  const mealTemplate = `{
      "breakfast": { ${mealFields} },
      "lunch":     { ${mealFields} },
      "snack":     { ${mealFields} },
      "dinner":    { ${mealFields} }
    }`;

  const stageContext = buildStageContext(weaningStage, cuisine);
  const blwContext = buildBlwContext(blwType, weaningStage.id, language);
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

OVERALL ADVICE REQUIREMENT: Fill overall_advice_en and overall_advice_ko with 2–4 sentences summarising the big-picture nutritional strategy for the whole day in response to the parent's concern. Explain which nutrients/foods you prioritised across the day and why. Warm, reassuring tone — like a trusted nutritionist friend, not a textbook.

EXPERT NOTE REQUIREMENT: For each meal, fill expert_note with 1–2 sentences in the same language as the meal (English for meals_en, Korean for meals_ko). Explain specifically WHY this meal helps with the parent's stated concern — name the key ingredient(s) and their benefit. Be warm and reassuring, not clinical.`
    : "";

  const systemPrompt = `You are a certified baby nutritionist specializing in infant weaning (이유식). You respond ONLY with valid JSON — no markdown fences, no preamble, no explanation. Your response must start with { and end with }. Never truncate — output the complete JSON.
IMPORTANT RULE: Never write "breast milk" or "모유" alone. Always write "breast milk or formula" / "모유 또는 분유" — not all parents breastfeed.
For each meal, include: total_time (e.g. "20 minutes"), servings (e.g. "1 serving ~120g"), 3–5 clear cooking steps in steps[], and one practical parent tip in tips.`;

  const prompt = `Baby details:
- Name: ${baby.name}
- Age: ${days} days (approximately ${months} months)
- Diet type: ${baby.diet_type === "all" ? "Omnivore (meat, fish, dairy, eggs OK)" : baby.diet_type === "vegetarian" ? "Vegetarian (no meat/fish, dairy/eggs OK)" : "Vegan (no animal products)"}
- Cuisine style: ${cuisineLabel}
- ${allergyNote}${dedupRule}

${stageContext}

${blwContext}
${requestContext ? `\n${requestContext}\n` : ""}
MANDATORY NUTRITION RULES (follow strictly):
1. At least one meal (lunch or dinner) MUST feature a combination of 3 or more distinct vegetables or produce items.
2. Vary the vegetables across all four meals — do not repeat the same vegetable in more than one meal.
3. Prioritize whole, nutrient-dense, colorful produce appropriate for the baby's stage and texture.
4. ${blwType === "blw" ? "ALL meals must be BLW finger-food format — no spoon-fed purées. See feeding approach section above." : blwType === "mix" ? "At least 2 of 4 meals must have a BLW finger food component. Snack must always be a BLW-style finger food." : weaningStage.fingerFoodsOk ? "INCLUDE at least one finger food option per day (snack is a good fit)." : "Do NOT include finger foods — this stage requires fully puréed or mashed textures only."}

Generate a complete, safe, and nutritious day's meal plan with 4 meals appropriate for this exact stage.
Write the ENTIRE meal plan in BOTH English (meals_en) AND Korean (meals_ko).

Return this exact JSON structure, fully filled in:
{
  "stage": "${weaningStage.nameEn}",
  "cuisine": "${cuisineLabel}",${parentRequest ? `
  "overall_advice_en": "",
  "overall_advice_ko": "",` : ""}
  "meals_en": ${mealTemplate},
  "meals_ko": ${mealTemplate}
}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Claude API error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Claude raw response (no JSON found):", raw);
    return NextResponse.json({ error: "Failed to parse meal plan." }, { status: 500 });
  }

  let bilingual: BilingualPlan;
  try {
    bilingual = JSON.parse(jsonMatch[0]);
  } catch {
    console.error("Claude raw response (invalid JSON):", raw);
    return NextResponse.json({ error: "Failed to parse meal plan." }, { status: 500 });
  }

  await Promise.all([
    supabase.from("generation_log").insert({ user_id: user.id }),
    supabase.from("menu_history").insert({
      user_id: user.id,
      baby_id,
      stage: bilingual.stage,
      cuisine: bilingual.cuisine,
      meals_en: bilingual.meals_en,
      meals_ko: bilingual.meals_ko,
    }),
  ]);

  const meals = language === "ko" ? bilingual.meals_ko : bilingual.meals_en;
  const overall_advice = language === "ko"
    ? bilingual.overall_advice_ko
    : bilingual.overall_advice_en;

  return NextResponse.json({
    stage: bilingual.stage,
    cuisine: bilingual.cuisine,
    ...(overall_advice ? { overall_advice } : {}),
    meals,
    remaining: isAdmin ? null : DAILY_LIMIT - (count ?? 0) - 1,
  });
}
