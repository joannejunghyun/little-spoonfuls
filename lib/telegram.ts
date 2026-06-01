// English-only surface for outgoing helpers, but the bot now detects language
// (en | ko) from the incoming message and localises responses accordingly.
import type { MealPlan } from "@/app/api/generate/route";
import { translations, type Lang } from "@/lib/i18n/translations";

const TELEGRAM_API = "https://api.telegram.org";

export async function sendMessage(chatId: number | string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN is not set");
    return;
  }

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[telegram] sendMessage failed (${res.status}):`, body);
  }
}

export function linkSuccessMessage(lang: Lang): string {
  return lang === "ko"
    ? "✅ 연결되었어요! 이제 메시지를 보내면 아기 프로필에 맞춘 메뉴를 받아볼 수 있어요."
    : "✅ All linked! Send any message and I'll cook up a menu tailored to your baby's profile.";
}

export function linkInvalidMessage(lang: Lang): string {
  return lang === "ko"
    ? "코드를 확인할 수 없어요. 만료되었거나 잘못된 코드일 수 있어요. 앱에서 새 코드를 발급해 주세요."
    : "I couldn't verify that code — it may have expired or been mistyped. Please generate a new one in the app.";
}

export function linkUsageMessage(lang: Lang): string {
  return lang === "ko"
    ? "연결하려면 `/link 코드` 형식으로 보내주세요. (예: `/link ABC12345`)"
    : "To link your account, send `/link CODE` (e.g. `/link ABC12345`).";
}

export function profileMissingNotice(lang: Lang): string {
  return lang === "ko"
    ? "ℹ️ 아기 프로필을 설정하면 더 맞춤화된 메뉴를 드려요."
    : "ℹ️ Set up a baby profile in the app for menus tailored to your little one.";
}

export function formatMenuForTelegram(menu: MealPlan, lang: Lang = "en"): string {
  const { stage, cuisine, overall_advice, meals } = menu;
  const t = translations[lang];

  const headerText = lang === "ko" ? "오늘의 식단" : "Today's Meal Plan";

  const mealBlock = (label: string, meal: MealPlan["meals"]["breakfast"]) => {
    const ingredients = meal.ingredients.length > 0 ? `_${meal.ingredients.join(", ")}_` : "";
    return [
      `*${label}: ${meal.name}*`,
      ingredients,
      meal.prep,
      meal.nutrition ? `🌱 ${meal.nutrition}` : "",
    ].filter(Boolean).join("\n");
  };

  const header = `🥣 *${headerText}*\n_${stage} · ${cuisine}_`;
  const advice = overall_advice ? `\n💡 ${overall_advice}\n` : "";
  const body = [
    mealBlock(t.breakfast, meals.breakfast),
    mealBlock(t.lunch, meals.lunch),
    mealBlock(t.snack, meals.snack),
    mealBlock(t.dinner, meals.dinner),
  ].join("\n\n");

  return `${header}\n${advice}\n${body}`;
}
