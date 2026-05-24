import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DetailedRecipe } from "@/app/api/recipe/route";

export interface SavedRecipe {
  id: string;
  meal_name: string;
  stage: string;
  recipe: DetailedRecipe;
  ingredient_names: string[];
  created_at: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { meal_name, stage, recipe } = await req.json();
  const ingredientNames = (recipe.ingredients as { item: string }[]).map((i) => i.item);

  const { error } = await supabase.from("saved_recipes").upsert(
    { user_id: user.id, meal_name, stage, recipe, ingredient_names: ingredientNames },
    { onConflict: "user_id,meal_name" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("saved_recipes")
    .select("id, meal_name, stage, recipe, ingredient_names, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
