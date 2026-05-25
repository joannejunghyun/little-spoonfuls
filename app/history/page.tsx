import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { HistoryClient } from "@/components/HistoryClient";
import { LanguageProvider } from "@/components/LanguageProvider";
import { translations, type Lang } from "@/lib/i18n/translations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { detectLang } from "@/lib/get-lang";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang: Lang = detectLang(user.user_metadata?.language, (await headers()).get("accept-language"));
  const t = translations[lang];

  const { data: history } = await supabase
    .from("menu_history")
    .select("id, stage, cuisine, meals_en, meals_ko, created_at, babies(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

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
            <h1 className="text-xl font-bold text-primary">{t.mealHistory}</h1>
          </div>
          <HistoryClient history={history ?? []} language={lang} />
        </div>
      </main>
    </LanguageProvider>
  );
}
