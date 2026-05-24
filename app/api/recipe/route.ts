import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const language: "en" | "ko" = user.user_metadata?.language ?? "en";
  const { meal_name, stage, ingredients } = await req.json();

  const isKorean = language === "ko";

  const systemPrompt = isKorean
    ? `당신은 이유식 전문 영양사 겸 요리사입니다. 모든 답변을 한국어로 작성하고, 유효한 JSON만 반환하세요 — 마크다운 없이, { 로 시작해서 } 로 끝나야 합니다.
중요 규칙: 레시피에서 '모유'만 단독으로 사용하지 마세요. 반드시 '모유 또는 분유'로 표기하세요 — 모유수유를 하지 않는 가정도 있습니다.`
    : `You are a certified baby nutritionist and chef specializing in infant weaning food. Respond ONLY with valid JSON — no markdown, start with { and end with }.
IMPORTANT RULE: Never write "breast milk" alone. Always write "breast milk or formula" — not all parents breastfeed.`;

  const prompt = `Generate a detailed recipe for a baby at stage: "${stage}".

Meal: ${meal_name}
Key ingredients: ${ingredients.join(", ")}

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
