import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MealPlanner } from "@/components/MealPlanner";
import { UserMenu } from "@/components/UserMenu";
import { LanguageProvider } from "@/components/LanguageProvider";
import { translations } from "@/lib/i18n/translations";
import type { Lang } from "@/lib/i18n/translations";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang: Lang = user.user_metadata?.language ?? "en";
  const t = translations[lang];

  const { data: babies } = await supabase
    .from("babies")
    .select("id, name, birth_date, diet_type, allergies")
    .eq("user_id", user.id)
    .order("created_at");

  if (!babies || babies.length === 0) redirect("/profile");

  return (
    <LanguageProvider lang={lang}>
      <main className="flex flex-col items-center px-5 py-8 pb-16">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-block bg-white rounded-full px-5 py-2.5 shadow-md shadow-primary/10">
              <h1 className="text-xl font-bold text-primary">{t.appName}</h1>
            </div>
            <UserMenu email={user.email ?? ""} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-center">
            {t.appTagline}
          </p>

          <MealPlanner babies={babies} />

          <footer className="text-center mt-12 text-xs text-muted-foreground leading-relaxed">
            {t.footerText}<br />
            {t.footerMadeBy}{" "}
            <a
              href="https://www.linkedin.com/in/junghyunhao/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline"
            >
              Joanne
            </a>
          </footer>
        </div>
      </main>
    </LanguageProvider>
  );
}
