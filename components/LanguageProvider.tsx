"use client";

import { createContext, useContext } from "react";
import { translations, type Lang, type Translations } from "@/lib/i18n/translations";

const LanguageContext = createContext<Lang>("en");

export function useLanguage(): Translations {
  const lang = useContext(LanguageContext);
  return translations[lang];
}

export function useLang(): Lang {
  return useContext(LanguageContext);
}

export function LanguageProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}
