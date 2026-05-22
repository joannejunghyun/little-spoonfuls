import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LanguageProvider } from "@/components/LanguageProvider";
import { RecipeBookClient } from "@/components/RecipeBookClient";
import { translations, type Lang } from "@/lib/i18n/translations";

export default async function RecipesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang: Lang = user.user_metadata?.language ?? "en";
  const t = translations[lang];

  const { data: recipes } = await supabase
    .from("saved_recipes")
    .select("id, meal_name, stage, recipe, ingredient_names, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <LanguageProvider lang={lang}>
      <main className="flex flex-col items-center px-5 py-8 pb-16">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full border-border">
                {t.back}
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">{t.recipeBookTitle}</h1>
          </div>
          <RecipeBookClient recipes={recipes ?? []} />
        </div>
      </main>
    </LanguageProvider>
  );
}
