"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";
import type { SavedRecipe } from "@/app/api/recipes/route";

export function RecipeBookClient({ recipes }: { recipes: SavedRecipe[] }) {
  const t = useLanguage();
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allIngredients = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of recipes) {
      for (const ing of r.ingredient_names) {
        counts.set(ing, (counts.get(ing) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [recipes]);

  const filtered = selectedIngredient
    ? recipes.filter((r) => r.ingredient_names.includes(selectedIngredient))
    : recipes;

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-3xl mb-3">📖</p>
        <p className="font-semibold text-foreground">{t.noRecipesYet}</p>
        <p className="text-sm mt-1 leading-relaxed max-w-xs mx-auto">{t.noRecipesDesc}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">{t.recipeSavedCount(recipes.length)}</p>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setSelectedIngredient(null)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
            !selectedIngredient
              ? "bg-primary text-white border-primary"
              : "bg-white text-muted-foreground border-border hover:border-primary"
          }`}
        >
          {t.allIngredients}
        </button>
        {allIngredients.map((ing) => (
          <button
            key={ing}
            onClick={() => setSelectedIngredient(ing === selectedIngredient ? null : ing)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              selectedIngredient === ing
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border hover:border-primary"
            }`}
          >
            {ing}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((saved) => {
          const isOpen = expandedId === saved.id;
          const { recipe } = saved;
          return (
            <Card key={saved.id} className="rounded-3xl shadow-sm border-border overflow-hidden">
              <CardContent className="pt-4 pb-4">
                <button
                  onClick={() => setExpandedId(isOpen ? null : saved.id)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <p className="font-bold text-foreground text-base leading-snug">{saved.meal_name}</p>
                    <Badge className="bg-[#f0faff] text-[#74b9ff] border-0 text-[10px] font-bold px-2 py-0.5 w-fit">
                      {saved.stage}
                    </Badge>
                    {!isOpen && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {saved.ingredient_names.slice(0, 4).join(" · ")}
                        {saved.ingredient_names.length > 4 && " …"}
                      </p>
                    )}
                  </div>
                  <span className="text-muted-foreground text-sm mt-0.5 shrink-0">{isOpen ? "↑" : "↓"}</span>
                </button>

                {isOpen && (
                  <div className="mt-4 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">⏱ {recipe.total_time}</Badge>
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">🍼 {recipe.servings}</Badge>
                    </div>

                    <div>
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-3">
                        {t.ingredients}
                      </p>
                      <div className="flex flex-col">
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
                            <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
