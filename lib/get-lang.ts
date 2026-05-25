import type { Lang } from "@/lib/i18n/translations";

export function detectLang(
  userMetaLanguage: string | undefined,
  acceptLanguage: string | null
): Lang {
  if (userMetaLanguage === "en" || userMetaLanguage === "ko") return userMetaLanguage;
  const first = acceptLanguage?.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ko") ? "ko" : "en";
}
