import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectLang } from "@/lib/get-lang";

const client = new Anthropic();

export interface DetailedRecipe {
  name: string;
  servings: string;
  total_time: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  tips: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const language: "en" | "ko" = detectLang(user.user_metadata?.language, req.headers.get("accept-language"));
  const { meal_name, stage, ingredients } = await req.json();

  const isKorean = language === "ko";

  const systemPrompt = isKorean
    ? `당신은 이유식 전문 영양사 겸 요리사입니다. 모든 답변을 한국어로 작성하고, 유효한 JSON만 반환하세요 — 마크다운 없이, { 로 시작해서 } 로 끝나야 합니다.
중요 규칙:
- 모유, 분유, breast milk, formula를 레시피 재료, 농도 조절용 액체, 조리 단계에 넣지 마세요.
- 액체가 필요하면 물, 채수, 삶은 물, 채소/과일 퓨레를 사용하세요.
- 수유를 언급해야 할 때만 별도의 주요 영양 공급으로 "모유 또는 분유"라고 표현하세요.`
    : `You are a certified baby nutritionist and chef specializing in infant weaning food. Respond ONLY with valid JSON — no markdown, start with { and end with }.
IMPORTANT RULES:
- Do not use breast milk, formula, 모유, or 분유 as recipe ingredients, mixing liquids, texture-adjustment liquids, or prep steps.
- Use water, cooking water, unsalted vegetable stock, or fruit/vegetable puree when liquid is needed.
- If feeding milk must be mentioned, only say breast milk or formula remains separate primary nutrition where appropriate. Never write "breast milk" alone.`;

  const prompt = `Generate a detailed recipe for a baby at stage: "${stage}".

Meal: ${meal_name}
Key ingredients: ${ingredients.join(", ")}

Do not add breast milk, formula, 모유, or 분유 to the ingredients or steps. Use water, cooking water, unsalted vegetable stock, or puree if the recipe needs liquid.

Return this exact JSON structure, fully filled in:
{
  "name": "${meal_name}",
  "servings": "${isKorean ? "예: 1인분 (100–150ml)" : "e.g. 1 serving (100–150ml)"}",
  "total_time": "${isKorean ? "예: 20분" : "e.g. 20 minutes"}",
  "ingredients": [
    { "item": "${isKorean ? "재료명" : "ingredient name"}", "amount": "${isKorean ? "정확한 분량 예: 2큰술 / 30g" : "exact measurement e.g. 2 tbsp / 30g"}" }
  ],
  "steps": [
    "${isKorean ? "조리 순서 1." : "Step 1 instruction."}"
  ],
  "tips": "${isKorean ? "바쁜 부모를 위한 보관 또는 서빙 팁." : "One practical storage or serving tip for busy parents."}"
}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
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
    return NextResponse.json({ error: "Failed to parse recipe." }, { status: 500 });
  }

  let recipe: DetailedRecipe;
  try {
    recipe = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "Failed to parse recipe." }, { status: 500 });
  }

  return NextResponse.json(recipe);
}
