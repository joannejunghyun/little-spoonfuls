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
