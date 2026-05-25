"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { Meal } from "@/app/api/generate/route";
import type { DetailedRecipe } from "@/app/api/recipe/route";

interface RecipeSheetProps {
  meal: Meal;
  mealType: string;
  stage: string;
  traceId?: string;
  open: boolean;
  onClose: () => void;
}

export function RecipeSheet({ meal, mealType, stage, traceId = "", open, onClose }: RecipeSheetProps) {
  const t = useLanguage();
  const hasEmbedded = !!(meal.steps && meal.steps.length > 0);

  const embeddedRecipe: DetailedRecipe | null = hasEmbedded
    ? {
        name: meal.name,
        servings: meal.servings ?? "",
        total_time: meal.total_time ?? "",
        ingredients: meal.ingredients.map((item) => ({ item, amount: "" })),
        steps: meal.steps!,
        tips: meal.tips ?? "",
      }
    : null;

  const [recipe, setRecipe] = useState<DetailedRecipe | null>(embeddedRecipe);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setSaved(false);
      return;
    }
    // Already have embedded recipe — no API call needed
    if (hasEmbedded) {
      setRecipe(embeddedRecipe);
      return;
    }
    if (recipe) return;
    setLoading(true);
    setError("");

    fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meal_name: meal.name, stage, ingredients: meal.ingredients }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) setError(data.error ?? t.somethingWrong);
        else setRecipe(data);
      })
      .finally(() => setLoading(false));
  }, [open]);

  async function handleSave() {
    if (!recipe || saved || saving) return;
    setSaving(true);
    const recipeToSave: DetailedRecipe = hasEmbedded
      ? { ...recipe, ingredients: meal.ingredients.map((item) => ({ item, amount: "" })) }
      : recipe;
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meal_name: meal.name, stage, recipe: recipeToSave }),
    });
    if (traceId) {
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trace_id: traceId, meal_name: meal.name }),
      }).catch(console.error);
    }
    setSaved(true);
    setSaving(false);
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-5 pb-8">
        <SheetHeader className="text-left mb-5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {mealType}
          </p>
          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="text-xl font-bold text-foreground leading-snug">
              {meal.name}
            </SheetTitle>
            {recipe && (
              <button
                onClick={handleSave}
                disabled={saved || saving}
                className="shrink-0 mt-0.5 transition-transform active:scale-90"
                aria-label={saved ? t.recipeSavedBtn : t.saveRecipe}
              >
                <Heart
                  size={24}
                  className={saved ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary transition-colors"}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-primary font-medium">{meal.nutrition}</p>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <div className="text-3xl animate-bounce">🍳</div>
            <p className="text-sm">{t.gettingRecipe}</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive text-center py-8">{error}</p>}

        {recipe && (
          <div className="flex flex-col gap-6">

            {meal.expert_note && (
              <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-[#bbf7d0]">
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-1.5">
                  💡 {t.expertAdvice}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{meal.expert_note}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                ⏱ {recipe.total_time}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                🍼 {recipe.servings}
              </Badge>
            </div>

            <div>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-3">
                {t.ingredients}
              </p>
              <div className="flex flex-col gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{ing.item}</span>
                    {ing.amount && <span className="text-sm text-muted-foreground font-medium">{ing.amount}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-3">
                {t.howToMake}
              </p>
              <div className="flex flex-col gap-3">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fff9f4] rounded-2xl p-4 border border-[#ffefe0]">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                {t.parentTip}
              </p>
              <p className="text-sm text-foreground leading-relaxed">{recipe.tips}</p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saved || saving}
              className={`w-full rounded-2xl py-5 font-bold text-base transition-all ${
                saved
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-none"
                  : "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95"
              }`}
            >
              <Heart size={16} className={`mr-2 ${saved ? "fill-primary" : ""}`} />
              {saved ? t.recipeSavedBtn : t.saveRecipe}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
