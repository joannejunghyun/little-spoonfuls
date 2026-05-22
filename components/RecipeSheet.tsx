"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";
import type { Meal } from "@/app/api/generate/route";
import type { DetailedRecipe } from "@/app/api/recipe/route";

interface RecipeSheetProps {
  meal: Meal;
  mealType: string;
  stage: string;
  open: boolean;
  onClose: () => void;
}

export function RecipeSheet({ meal, mealType, stage, open, onClose }: RecipeSheetProps) {
  const t = useLanguage();
  const [recipe, setRecipe] = useState<DetailedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || recipe) return;
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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-5 pb-8">
        <SheetHeader className="text-left mb-5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {mealType}
          </p>
          <SheetTitle className="text-xl font-bold text-foreground leading-snug">
            {meal.name}
          </SheetTitle>
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
                    <span className="text-sm text-muted-foreground font-medium">{ing.amount}</span>
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
