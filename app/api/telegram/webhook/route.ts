// English-only surface comment retained for legacy: the bot now detects language
// (en | ko) from the incoming Telegram message and responds in kind.
// Full chatId→user→lang resolver remains a future task.
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getWeaningStage, buildStageContext } from "@/lib/weaning-context";
import { buildBlwContext } from "@/lib/blw-context";
import { sendMessage, formatMenuForTelegram } from "@/lib/telegram";
import type { MealPlan } from "@/app/api/generate/route";
import type { Lang } from "@/lib/i18n/translations";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

const DEFAULT_AGE_DAYS = 240;        // ~8 months
const DEFAULT_CUISINE = "mix";
const DEFAULT_BLW: "no-blw" = "no-blw";

const KOREAN_REGEX = /[ᄀ-ᇿ㄰-㆏ꥠ-꥿가-힯]/;

function detectLangFromText(text: string | undefined): Lang {
  if (!text) return "en";
  return KOREAN_REGEX.test(text) ? "ko" : "en";
}

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = req.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || received !== expected) {
    return new NextResponse("OK", { status: 200 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return new NextResponse("OK", { status: 200 });
  }

  const chatId = update.message?.chat.id;
  if (!chatId) {
    return new NextResponse("OK", { status: 200 });
  }

  const lang = detectLangFromText(update.message?.text);

  try {
    await handleMessage(chatId, lang);
  } catch (err) {
    console.error("[telegram-webhook] handler failed:", err);
  }

  return new NextResponse("OK", { status: 200 });
}

async function handleMessage(chatId: number, lang: Lang): Promise<void> {
  const cookingMsg = lang === "ko" ? "🥣 오늘의 메뉴를 준비하고 있어요..." : "🥣 Cooking up today's menu...";
  const errorMsg = lang === "ko"
    ? "죄송해요, 지금은 메뉴를 만들 수 없어요. 다시 시도해주세요."
    : "Sorry, I couldn't put together a menu right now. Please try again.";

  await sendMessage(chatId, cookingMsg);

  try {
    const menu = await generateDefaultMenu(lang);
    await sendMessage(chatId, formatMenuForTelegram(menu, lang));
  } catch (err) {
    console.error("[telegram-webhook] generation failed:", err);
    await sendMessage(chatId, errorMsg);
  }
}

async function generateDefaultMenu(lang: Lang): Promise<MealPlan> {
  const stage = getWeaningStage(DEFAULT_AGE_DAYS);
  const stageContext = buildStageContext(stage, DEFAULT_CUISINE);
  const blwContext = buildBlwContext(DEFAULT_BLW, stage.id, lang);

  const systemPrompt = `You are a certified baby nutritionist specializing in infant weaning. You respond ONLY with valid JSON — no markdown fences, no preamble, no explanation. Your response must start with { and end with }.
IMPORTANT RULES:
- Do not use breast milk or formula as recipe ingredients or mixing liquids.`;

  const languageInstruction = lang === "ko"
    ? "Write everything in Korean (한국어로 작성해주세요)."
    : "Write everything in English.";

  const dynamicPrompt = `Baby details:
- Age: ${DEFAULT_AGE_DAYS} days (approximately 8 months)
- Diet type: Omnivore (no restrictions)
- Cuisine style: a global mix (Korean, Western, or Chinese)
- No known allergies.

Generate a complete, safe, and nutritious day's meal plan with 4 meals appropriate for this stage. ${languageInstruction}

Return this exact JSON structure, fully filled in:
{
  "stage": "${stage.nameEn}",
  "cuisine": "Global Mix",
  "meals": {
    "breakfast": { "name": "", "ingredients": [], "prep": "", "nutrition": "" },
    "lunch":     { "name": "", "ingredients": [], "prep": "", "nutrition": "" },
    "snack":     { "name": "", "ingredients": [], "prep": "", "nutrition": "" },
    "dinner":    { "name": "", "ingredients": [], "prep": "", "nutrition": "" }
  }
}`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `${stageContext}\n\n${blwContext}` },
          { type: "text", text: dynamicPrompt },
        ],
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in model response");
  }
  return JSON.parse(jsonMatch[0]) as MealPlan;
}
