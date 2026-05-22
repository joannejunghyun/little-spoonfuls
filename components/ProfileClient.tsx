"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BabyForm } from "@/components/BabyForm";
import { useLanguage, useLang } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { getWeaningStage } from "@/lib/weaning-context";
import type { Baby } from "@/app/api/babies/route";
import type { Lang } from "@/lib/i18n/translations";
import type { Translations } from "@/lib/i18n/translations";

function daysOld(birthDate: string) {
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / 86400000);
}

function ageLabel(birthDate: string, t: Translations): string {
  const days = daysOld(birthDate);
  const months = Math.floor(days / 30);
  if (months < 1) return t.ageDay(days);
  if (months < 24) return t.ageMonth(months);
  return t.ageYear(Math.floor(months / 12));
}

function stageLabel(birthDate: string, lang: Lang, t: Translations): string {
  const days = daysOld(birthDate);
  if (days < 180) return t.stageNotReady;
  const wStage = getWeaningStage(days);
  return lang === "ko" ? wStage.nameKo : wStage.nameEn;
}

export function ProfileClient({ babies, language: initialLanguage }: { babies: Baby[]; language: Lang }) {
  const t = useLanguage();
  const lang = useLang();
  const router = useRouter();
  const supabase = createClient();
  const [editingBaby, setEditingBaby] = useState<Baby | null>(null);
  const [showAddForm, setShowAddForm] = useState(babies.length === 0);
  const [language, setLanguage] = useState(initialLanguage);
  const [langLoading, setLangLoading] = useState(false);

  async function changeLanguage(lang: Lang) {
    if (lang === language) return;
    setLangLoading(true);
    await supabase.auth.updateUser({ data: { language: lang } });
    setLanguage(lang);
    setLangLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-3xl shadow-sm border-border">
        <CardContent className="pt-5 pb-5">
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-3">
            {t.languageLabel}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => changeLanguage("en")}
              disabled={langLoading}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border transition-colors ${
                language === "en"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary"
              }`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => changeLanguage("ko")}
              disabled={langLoading}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border transition-colors ${
                language === "ko"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary"
              }`}
            >
              🇰🇷 한국어
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t.languageNote}</p>
        </CardContent>
      </Card>

      {babies.map((baby) => (
        <Card key={baby.id} className="rounded-3xl shadow-sm border-border">
          <CardContent className="pt-5 pb-5">
            {editingBaby?.id === baby.id ? (
              <div>
                <p className="text-sm font-semibold text-foreground mb-4">
                  {t.editingProfile(baby.name)}
                </p>
                <BabyForm baby={baby} onClose={() => setEditingBaby(null)} />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-foreground text-base">{baby.name}</p>
                  <p className="text-xs text-muted-foreground">{ageLabel(baby.birth_date, t)}</p>
                  <p className="text-xs text-primary font-medium">{stageLabel(baby.birth_date, lang, t)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">{t.dietLabel}</span>
                    <span className="text-xs capitalize text-foreground">{t.diets[baby.diet_type as keyof typeof t.diets] ?? baby.diet_type}</span>
                  </div>
                  {baby.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {baby.allergies.map((a) => (
                        <span key={a} className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-2 py-0.5 rounded-full">
                          {t.allergyNo(t.allergens[a as keyof typeof t.allergens] ?? a)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBaby(baby)}
                  className="rounded-full border-border text-xs shrink-0"
                >
                  {t.editBtn}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {showAddForm ? (
        <Card className="rounded-3xl shadow-sm border-border">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm font-semibold text-foreground mb-4">
              {babies.length === 0 ? t.addFirstBaby : t.addAnotherBaby}
            </p>
            <BabyForm onClose={() => setShowAddForm(false)} />
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full rounded-2xl border-dashed border-border text-muted-foreground py-5"
        >
          {t.addBabyBtn}
        </Button>
      )}
    </div>
  );
}
