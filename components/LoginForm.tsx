"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Lang } from "@/lib/i18n/translations";

const copy = {
  en: {
    google: "Continue with Google",
    or: "or",
    emailPlaceholder: "your@email.com",
    sendLink: "Send Magic Link ✨",
    sending: "Sending...",
    checkEmail: "Check your email!",
    sentIntro: "We sent a magic link to",
    noPassword: "No password needed — we'll email you a sign-in link.",
  },
  ko: {
    google: "Google로 계속하기",
    or: "또는",
    emailPlaceholder: "이메일 주소",
    sendLink: "매직 링크 보내기 ✨",
    sending: "전송 중...",
    checkEmail: "이메일을 확인해주세요!",
    sentIntro: "매직 링크를 보냈어요 →",
    noPassword: "비밀번호 없이 이메일 링크로 바로 로그인돼요.",
  },
} as const;

export function LoginForm({ lang = "en" }: { lang?: Lang }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const c = copy[lang];

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (sent) {
    return (
      <Card className="rounded-3xl shadow-md shadow-primary/10">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="text-4xl mb-4">📬</div>
          <p className="font-semibold text-foreground mb-1">{c.checkEmail}</p>
          <p className="text-sm text-muted-foreground">
            {c.sentIntro} <strong>{email}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-md shadow-primary/10">
      <CardContent className="pt-6 pb-6 flex flex-col gap-4">
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="w-full rounded-2xl py-5 font-semibold border-border"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {c.google}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{c.or}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder={c.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-2xl border-border"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-2xl py-5 bg-primary text-white font-semibold hover:bg-primary/90"
          >
            {loading ? c.sending : c.sendLink}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {c.noPassword}
        </p>
      </CardContent>
    </Card>
  );
}
