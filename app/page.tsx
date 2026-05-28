import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ComponentType } from "react";
import {
  Baby,
  CalendarDays,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MealPlanner } from "@/components/MealPlanner";
import { UserMenu } from "@/components/UserMenu";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LegalFooter } from "@/components/LegalFooter";
import { LoginForm } from "@/components/LoginForm";
import { translations } from "@/lib/i18n/translations";
import type { Lang } from "@/lib/i18n/translations";
import { detectLang } from "@/lib/get-lang";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <PublicHome />;

  const lang: Lang = detectLang(
    user.user_metadata?.language,
    (await headers()).get("accept-language"),
  );
  const t = translations[lang];

  const [{ data: babies }, { data: myVote }] = await Promise.all([
    supabase
      .from("babies")
      .select("id, name, birth_date, diet_type, allergies")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase.from("votes").select("id").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!babies || babies.length === 0) redirect("/profile");

  return (
    <LanguageProvider lang={lang}>
      <main className="flex flex-col items-center px-5 py-8 pb-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="inline-block bg-white rounded-full px-5 py-2.5 shadow-md shadow-primary/10">
              <h1 className="text-xl font-bold text-primary">{t.appName}</h1>
            </div>
            <UserMenu email={user.email ?? ""} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-center">
            {t.appTagline}
          </p>

          <MealPlanner babies={babies} initialHasVoted={!!myVote} />

          <footer className="text-center mt-12 text-xs text-muted-foreground leading-relaxed">
            {t.footerText}
            <br />
            {t.footerMadeBy}{" "}
            <a
              href="https://www.linkedin.com/in/junghyunhao/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline"
            >
              Joanne
            </a>
            <LegalFooter />
          </footer>
        </div>
      </main>
    </LanguageProvider>
  );
}

async function PublicHome() {
  const lang = detectLang(undefined, (await headers()).get("accept-language"));
  const t = translations[lang].landing;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-secondary/10">
      <div className="mx-auto w-full max-w-5xl px-5 pb-12 pt-6 sm:pt-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥄</span>
            <span className="text-base font-bold text-primary">Little Spoonfuls</span>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm shadow-primary/10 transition hover:bg-primary/5"
          >
            {t.signIn}
          </Link>
        </header>

        <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
          {/* Hero + Features */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary/40 px-4 py-2 text-sm font-semibold text-secondary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
              {t.badge}
            </div>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {t.hero}
            </h1>
            <div className="grid w-full gap-3 sm:grid-cols-3 lg:mt-2">
              <Feature icon={Baby} title={t.feature1Title} text={t.feature1Text} />
              <Feature icon={CalendarDays} title={t.feature2Title} text={t.feature2Text} />
              <Feature icon={ShieldCheck} title={t.feature3Title} text={t.feature3Text} />
            </div>
          </div>

          {/* Login card */}
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-primary/10 lg:sticky lg:top-10">
            <div className="mb-5 space-y-1 text-center">
              <h2 className="text-xl font-bold text-foreground">{t.loginTitle}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{t.loginSubtitle}</p>
            </div>
            <LoginForm />
          </div>
        </section>

        <footer className="mt-12 text-center text-xs leading-6 text-muted-foreground">
          <p>{t.footer}</p>
          <LegalFooter />
        </footer>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm shadow-primary/10">
      <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2">
        <Icon className="size-4 text-primary" aria-hidden={true} />
      </div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

function DataUse({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-bold text-foreground">{title}</h3>
      <p className="mt-1">{text}</p>
    </div>
  );
}
