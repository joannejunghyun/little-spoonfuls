import Link from "next/link";
import { LegalFooter } from "@/components/LegalFooter";

type Section = {
  title: string;
  body: string;
};

type LegalPageProps = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
};

export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen px-5 py-8">
      <article className="mx-auto w-full max-w-2xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Back to Little Spoonfuls
        </Link>

        <header className="mt-8 border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">Little Spoonfuls</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="mt-5 leading-7 text-foreground">{intro}</p>
        </header>

        <div className="space-y-7 py-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="border-t border-border pt-6 text-center">
          <LegalFooter />
        </footer>
      </article>
    </main>
  );
}
