import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/ProfileClient";
import { LanguageProvider } from "@/components/LanguageProvider";
import { translations, type Lang } from "@/lib/i18n/translations";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
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
            <h1 className="text-xl font-bold text-primary">{t.babyProfiles}</h1>
          </div>
          <ProfileClient babies={babies ?? []} language={lang} />
        </div>
      </main>
    </LanguageProvider>
  );
}
