import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ComponentType } from "react";
import { Baby, CalendarDays, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <PublicHome />;

  const lang: Lang = detectLang(user.user_metadata?.language, (await headers()).get("accept-language"));
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
            <LegalFooter />
          </footer>
        </div>
      </main>
    </LanguageProvider>
  );
}

function PublicHome() {
  return (
    <main className="min-h-screen px-5 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-primary">
            Little Spoonfuls
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm shadow-primary/10 transition hover:border-primary/50"
          >
            Sign in
          </Link>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm shadow-primary/10">
              <Sparkles className="size-4" aria-hidden="true" />
              Baby meal planning made simpler
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Personalized baby meal plans for busy families.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Little Spoonfuls helps parents create age-appropriate baby meals from a child&apos;s
                profile, diet stage, allergies, and family preferences. Sign in to save profiles,
                generate meal ideas, keep recipe history, and return to your plans from any device.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Feature icon={Baby} title="Child profiles" text="Store diet stage and allergy notes for safer suggestions." />
              <Feature icon={CalendarDays} title="Meal planning" text="Generate practical meal ideas and save recipes you like." />
              <Feature icon={ShieldCheck} title="Private by design" text="Your account data is used only to run your meal planner." />
            </div>
          </div>

          <div>
            <div className="mb-5 space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use Google sign-in or a magic link to securely access your saved meal plans.
              </p>
            </div>
            <LoginForm />
          </div>
        </section>

        <section className="grid gap-5 rounded-3xl border border-border bg-white p-5 shadow-md shadow-primary/10 md:grid-cols-[0.85fr_1.15fr] md:p-7">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Why Google user data is requested</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Google sign-in is used only for authentication and account continuity.
              </p>
            </div>
          </div>

          <div className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
            <DataUse title="What we access" text="Your basic Google account identity, such as name and email address, so we can create and identify your Little Spoonfuls account." />
            <DataUse title="How it is used" text="We use it to sign you in, protect your account, and connect saved profiles, recipes, and meal history to you." />
            <DataUse title="What we do not do" text="We do not sell Google user data, use it for advertising, or share it for unrelated purposes." />
            <DataUse title="Your control" text="You can choose email magic-link sign-in instead, and you can review our Privacy Policy and Terms before signing in." />
          </div>
        </section>

        <footer className="pb-8 text-center text-xs leading-6 text-muted-foreground">
          <p>Little Spoonfuls provides meal planning support and does not replace medical advice.</p>
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
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm shadow-primary/10">
      <Icon className="mb-3 size-5 text-primary" aria-hidden={true} />
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
