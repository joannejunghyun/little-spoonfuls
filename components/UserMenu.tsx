"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

export function UserMenu({ email }: { email: string }) {
  const t = useLanguage();
  const supabase = createClient();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/history">
        <Button variant="outline" size="sm" className="rounded-full text-xs border-border">
          {t.history}
        </Button>
      </Link>
      <Link href="/recipes">
        <Button variant="outline" size="sm" className="rounded-full text-xs border-border">
          {t.recipeBook}
        </Button>
      </Link>
      <Link href="/profile">
        <Button variant="outline" size="sm" className="rounded-full text-xs border-border">
          {t.profiles}
        </Button>
      </Link>
      <Button
        onClick={signOut}
        variant="ghost"
        size="sm"
        className="rounded-full text-xs text-muted-foreground"
      >
        {t.signOut}
      </Button>
    </div>
  );
}
