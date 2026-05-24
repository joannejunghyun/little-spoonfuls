"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MealCard } from "@/components/MealCard";
import { useLanguage, useLang } from "@/components/LanguageProvider";
import { getWeaningStage } from "@/lib/weaning-context";
import type { MealPlan } from "@/app/api/generate/route";
import type { Baby } from "@/app/api/babies/route";
import type { BlwType } from "@/lib/blw-context";

const DAILY_LIMIT = 3;

type MealPlanWithMeta = MealPlan & { remaining: number | null };

function daysOld(birthDate: string) {
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / 86400000);
}

export function MealPlanner({ babies }: { babies: Baby[] }) {
  const t = useLanguage();
  const lang = useLang();
  const [selectedBabyId, setSelectedBabyId] = useState(babies[0].id);
  const [cuisine, setCuisine] = useState("mix");
  const [blwType, setBlwType] = useState<BlwType>("no-blw");
  const [parentRequest, setParentRequest] = useState("");
  const [mealPlan, setMealPlan] = useState<MealPlanWithMeta | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedBaby = babies.find((b) => b.id === selectedBabyId) ?? babies[0];
  const days = daysOld(selectedBaby.birth_date);

  async function generateMenu() {
    if (days < 180) {
      setError(t.notReadyYet(selectedBaby.name));
      return;
    }
    setError("");
    setLoading(true);
    setMealPlan(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baby_id: selectedBabyId, cuisine, blw_type: blwType, parent_request: parentRequest.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? t.somethingWrong);
      setLoading(false);
      return;
    }

    setMealPlan(data);
    setRemaining(data.remaining);
    setLoading(false);
  }

  const isLimitReached = remaining !== null && remaining <= 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#fff9f4] rounded-3xl p-5 border border-[#ffefe0] flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
              {t.baby}
            </label>
            <Link href="/profile" className="text-[11px] text-primary font-semibold hover:underline">
              {t.manageProfiles}
            </Link>
          </div>
          {babies.length === 1 ? (
            <div className="bg-white rounded-2xl border border-border px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">{selectedBaby.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const days = daysOld(selectedBaby.birth_date);
                    if (days < 180) return t.stageNotReady;
                    const w = getWeaningStage(days);
                    return lang === "ko" ? w.nameKo : w.nameEn;
                  })()}
                </p>
              </div>
              {selectedBaby.allergies.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-end max-w-[140px]">
                  {selectedBaby.allergies.map((a) => (
                    <span key={a} className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-1.5 py-0.5 rounded-full">
                      No {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Select value={selectedBabyId} onValueChange={(v) => v && setSelectedBabyId(v)}>
              <SelectTrigger className="rounded-2xl bg-white border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {babies.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
            {t.todayCuisine}
          </label>
          <Select value={cuisine} onValueChange={(v) => v && setCuisine(v)}>
            <SelectTrigger className="rounded-2xl bg-white border-border">
              <SelectValue>{t.cuisines[cuisine as keyof typeof t.cuisines]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mix">{t.cuisines.mix}</SelectItem>
              <SelectItem value="korean">{t.cuisines.korean}</SelectItem>
              <SelectItem value="western">{t.cuisines.western}</SelectItem>
              <SelectItem value="chinese">{t.cuisines.chinese}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
            {t.feedingApproach}
          </label>
          <Select value={blwType} onValueChange={(v) => v && setBlwType(v as BlwType)}>
            <SelectTrigger className="rounded-2xl bg-white border-border">
              <SelectValue>{t.blwTypes[blwType as keyof typeof t.blwTypes]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-blw">{t.blwTypes["no-blw"]}</SelectItem>
              <SelectItem value="blw">{t.blwTypes.blw}</SelectItem>
              <SelectItem value="mix">{t.blwTypes.mix}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Parent request chat section */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          💬 {t.parentRequestLabel}
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {([...t.parentRequestChips] as string[]).map((chip) => {
            const active = parentRequest === chip;
            return (
              <button
                key={chip}
                onClick={() => setParentRequest(active ? "" : chip)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <textarea
          value={parentRequest}
          onChange={(e) => setParentRequest(e.target.value)}
          placeholder={t.parentRequestPlaceholder}
          rows={2}
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>

      {error && <p className="text-sm text-center text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <Button
          onClick={generateMenu}
          disabled={loading || isLimitReached}
          className="w-full rounded-2xl py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              {t.loadingBtn}
            </span>
          ) : isLimitReached ? t.limitBtn : t.generateBtn}
        </Button>
        {remaining !== null && (
          <p className="text-center text-xs text-muted-foreground">
            {isLimitReached ? t.limitReached : t.remaining(remaining, DAILY_LIMIT)}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {["🌅", "☀️", "🍎", "🌙"].map((icon, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-card p-4 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center text-base shrink-0">
                  {icon}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 bg-muted rounded-full w-2/3" />
                  <div className="h-2.5 bg-muted rounded-full w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && mealPlan && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <Badge className="bg-[#f0faff] text-[#74b9ff] border-0 text-xs font-bold px-4 py-1">
              ✨ {mealPlan.stage}
            </Badge>
          </div>

          {mealPlan.overall_advice && (
            <div className="bg-[#f0fdf4] rounded-3xl p-4 border border-[#bbf7d0]">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-2">
                💡 {t.overallAdvice}
              </p>
              <p className="text-sm text-foreground leading-relaxed">{mealPlan.overall_advice}</p>
            </div>
          )}
          <MealCard type={t.breakfast} meal={mealPlan.meals.breakfast} stage={mealPlan.stage} />
          <MealCard type={t.lunch} meal={mealPlan.meals.lunch} stage={mealPlan.stage} />
          <MealCard type={t.snack} meal={mealPlan.meals.snack} stage={mealPlan.stage} />
          <MealCard type={t.dinner} meal={mealPlan.meals.dinner} stage={mealPlan.stage} />
        </div>
      )}
    </div>
  );
}
