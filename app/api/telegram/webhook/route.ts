// English-only surface comment retained for legacy: the bot now detects language
// (en | ko) from the incoming Telegram message and responds in kind.
// When a chat is linked to a Supabase user, the bot uses that user's baby profile.
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getWeaningStage, buildStageContext } from "@/lib/weaning-context";
import { buildBlwContext } from "@/lib/blw-context";
import {
  sendMessage,
  formatMenuForTelegram,
  linkSuccessMessage,
  linkInvalidMessage,
  linkUsageMessage,
  profileMissingNotice,
} from "@/lib/telegram";
import type { MealPlan } from "@/app/api/generate/route";
import type { Lang } from "@/lib/i18n/translations";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

interface BabyProfile {
  name: string;
  birth_date: string;
  diet_type: string;
  allergies: string[];
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

  const text = update.message?.text ?? "";
  const lang = detectLangFromText(text);

  try {
    if (text.trim().toLowerCase().startsWith("/link")) {
      await handleLinkCommand(chatId, text, lang);
    } else {
      await handleMessage(chatId, lang);
    }
  } catch (err) {
    console.error("[telegram-webhook] handler failed:", err);
  }

  return new NextResponse("OK", { status: 200 });
}

async function handleLinkCommand(chatId: number, text: string, lang: Lang): Promise<void> {
  const parts = text.trim().split(/\s+/);
  const code = parts[1]?.toUpperCase();
  if (!code || !/^[A-Z0-9]{4,12}$/.test(code)) {
    await sendMessage(chatId, linkUsageMessage(lang));
    return;
  }

  const supabase = await createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: link, error: lookupError } = await supabase
    .from("telegram_links")
    .select("id, user_id, code_expires_at, chat_id")
    .eq("link_code", code)
    .maybeSingle();

  if (lookupError || !link || link.chat_id) {
    await sendMessage(chatId, linkInvalidMessage(lang));
    return;
  }

  if (!link.code_expires_at || link.code_expires_at < nowIso) {
    await sendMessage(chatId, linkInvalidMessage(lang));
    return;
  }

  const { error: updateError } = await supabase
    .from("telegram_links")
    .update({
      chat_id: chatId,
      link_code: null,
      code_expires_at: null,
      linked_at: nowIso,
    })
    .eq("id", link.id);

  if (updateError) {
    console.error("[telegram-webhook] link update failed:", updateError);
    await sendMessage(chatId, linkInvalidMessage(lang));
    return;
  }

  await sendMessage(chatId, linkSuccessMessage(lang));
}

async function handleMessage(chatId: number, lang: Lang): Promise<void> {
  const cookingMsg = lang === "ko" ? "🥣 오늘의 메뉴를 준비하고 있어요..." : "🥣 Cooking up today's menu...";
  const errorMsg = lang === "ko"
    ? "죄송해요, 지금은 메뉴를 만들 수 없어요. 다시 시도해주세요."
    : "Sorry, I couldn't put together a menu right now. Please try again.";

  await sendMessage(chatId, cookingMsg);

  const baby = await getBabyForChat(chatId);

  try {
    const menu = await generateMenu(baby, lang);
    await sendMessage(chatId, formatMenuForTelegram(menu, lang));
    if (!baby) {
      await sendMessage(chatId, profileMissingNotice(lang));
    }
  } catch (err) {
    console.error("[telegram-webhook] generation failed:", err);
    await sendMessage(chatId, errorMsg);
  }
}

async function getBabyForChat(chatId: number): Promise<BabyProfile | null> {
  try {
    const supabase = await createServiceClient();
    const { data: link } = await supabase
      .from("telegram_links")
      .select("user_id")
      .eq("chat_id", chatId)
      .not("linked_at", "is", null)
      .maybeSingle();

    if (!link?.user_id) return null;

    const { data: baby } = await supabase
      .from("babies")
      .select("name, birth_date, diet_type, allergies")
      .eq("user_id", link.user_id)
      .order("created_at")
      .limit(1)
      .maybeSingle();

    return (baby as BabyProfile | null) ?? null;
  } catch (err) {
    console.error("[telegram-webhook] baby lookup failed:", err);
    return null;
  }
}

async function generateMenu(baby: BabyProfile | null, lang: Lang): Promise<MealPlan> {
  const ageDays = baby
    ? Math.max(180, Math.floor((Date.now() - new Date(baby.birth_date).getTime()) / 86400000))
    : DEFAULT_AGE_DAYS;
  const stage = getWeaningStage(ageDays);
  const stageContext = buildStageContext(stage, DEFAULT_CUISINE);
  const blwContext = buildBlwContext(DEFAULT_BLW, stage.id, lang);

  const dietType = baby?.diet_type ?? "all";
  const allergies = baby?.allergies ?? [];
  const babyName = baby?.name ?? "the baby";
  const monthsApprox = Math.floor(ageDays / 30);

  const systemPrompt = `You are a certified baby nutritionist specializing in infant weaning. You respond ONLY with valid JSON — no markdown fences, no preamble, no explanation. Your response must start with { and end with }.
IMPORTANT RULES:
- Do not use breast milk or formula as recipe ingredients or mixing liquids.`;

  const languageInstruction = lang === "ko"
    ? "Write everything in Korean (한국어로 작성해주세요)."
    : "Write everything in English.";

  const allergyLine = allergies.length > 0
    ? `STRICT ALLERGIES TO AVOID: ${allergies.join(", ")}. Never include these or close synonyms.`
    : "No known allergies.";

  const dynamicPrompt = `Baby details:
- Name: ${babyName}
- Age: ${ageDays} days (approximately ${monthsApprox} months)
- Diet type: ${dietType}
- Cuisine style: a global mix (Korean, Western, or Chinese)
- ${allergyLine}

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
