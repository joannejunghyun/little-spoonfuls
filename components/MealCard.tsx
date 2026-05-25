"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipeSheet } from "@/components/RecipeSheet";
import { useLanguage } from "@/components/LanguageProvider";
import type { Meal } from "@/app/api/generate/route";

const MEAL_COLORS: Record<string, string> = {
  Breakfast: "border-l-[#ffb8b8]",
  Lunch: "border-l-[#b8e994]",
  Snack: "border-l-[#74b9ff]",
  Dinner: "border-l-[#ffeaa7]",
  아침: "border-l-[#ffb8b8]",
  점심: "border-l-[#b8e994]",
  간식: "border-l-[#74b9ff]",
  저녁: "border-l-[#ffeaa7]",
};

interface MealCardProps {
  type: string;
  meal: Meal;
  stage?: string;
  traceId?: string;
}

export function MealCard({ type, meal, stage = "", traceId = "" }: MealCardProps) {
  const t = useLanguage();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => setSheetOpen(true)}
        className={`border-l-4 ${MEAL_COLORS[type] ?? "border-l-primary"} shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]`}
      >
        <CardContent className="pt-4 pb-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
            {type}
          </p>
          <p className="font-semibold text-foreground text-base mb-2">{meal.name}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {meal.ingredients.map((ing) => (
              <Badge key={ing} variant="secondary" className="text-xs font-normal">
                {ing}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">{meal.prep}</p>
            <span className="text-[10px] text-muted-foreground shrink-0">{t.tapForRecipe}</span>
          </div>
        </CardContent>
      </Card>

      <RecipeSheet
        meal={meal}
        mealType={type}
        stage={stage}
        traceId={traceId}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
