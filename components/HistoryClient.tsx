"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealCard } from "@/components/MealCard";
import { useLanguage } from "@/components/LanguageProvider";
import type { Meal } from "@/app/api/generate/route";
import type { Lang } from "@/lib/i18n/translations";

type MealSet = { breakfast: Meal; lunch: Meal; snack: Meal; dinner: Meal };

interface HistoryEntry {
  id: string;
  stage: string;
  cuisine: string;
  meals_en: MealSet;
  meals_ko: MealSet | null;
  created_at: string;
  babies: { name: string } | { name: string }[] | null;
}

function getBabyName(babies: HistoryEntry["babies"]): string | null {
  if (!babies) return null;
  if (Array.isArray(babies)) return babies[0]?.name ?? null;
  return babies.name;
}

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return lang === "ko" ? "오늘" : "Today";
  if (d.toDateString() === yesterday.toDateString()) return lang === "ko" ? "어제" : "Yesterday";
  return lang === "ko"
    ? d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", year: "numeric" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string, lang: Lang) {
  const locale = lang === "ko" ? "ko-KR" : "en-US";
  return new Date(iso).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

export function HistoryClient({ history, language }: { history: HistoryEntry[]; language: Lang }) {
  const t = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function getMeals(entry: HistoryEntry): MealSet {
    return (language === "ko" && entry.meals_ko) ? entry.meals_ko : entry.meals_en;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-3xl mb-3">🥣</p>
        <p className="font-semibold text-foreground">{t.noMealsYet}</p>
        <p className="text-sm mt-1">{t.noMealsDesc}</p>
      </div>
    );
  }

  const groups: Record<string, HistoryEntry[]> = {};
  for (const entry of history) {
    const label = formatDate(entry.created_at, language);
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groups).map(([dateLabel, entries]) => (
        <div key={dateLabel}>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-3">
            {dateLabel}
          </p>
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const isOpen = expandedId === entry.id;
              const meals = getMeals(entry);
              return (
                <Card key={entry.id} className="rounded-3xl shadow-sm border-border overflow-hidden">
                  <CardContent className="pt-4 pb-4">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : entry.id)}
                      className="w-full text-left flex items-start justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {getBabyName(entry.babies) && (
                            <span className="text-sm font-bold text-foreground">
                              {getBabyName(entry.babies)}
                            </span>
                          )}
                          <Badge className="bg-[#f0faff] text-[#74b9ff] border-0 text-[10px] font-bold px-2 py-0.5">
                            {t.stageDisplay(entry.stage.split(":")[0].trim())}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {t.cuisines[entry.cuisine as keyof typeof t.cuisines] ?? entry.cuisine} · {formatTime(entry.created_at, language)}
                        </p>
                        {!isOpen && (
                          <p className="text-xs text-foreground mt-1 line-clamp-1">
                            {meals.breakfast.name}, {meals.lunch.name}...
                          </p>
                        )}
                      </div>
                      <span className="text-muted-foreground text-sm mt-0.5 shrink-0">
                        {isOpen ? "↑" : "↓"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="flex flex-col gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <MealCard type={t.breakfast} meal={meals.breakfast} stage={entry.stage} />
                        <MealCard type={t.lunch} meal={meals.lunch} stage={entry.stage} />
                        <MealCard type={t.snack} meal={meals.snack} stage={entry.stage} />
                        <MealCard type={t.dinner} meal={meals.dinner} stage={entry.stage} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
