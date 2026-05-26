import { headers } from "next/headers";
import { LoginForm } from "@/components/LoginForm";
import { LegalFooter } from "@/components/LegalFooter";
import { detectLang } from "@/lib/get-lang";

const copy = {
  en: {
    tagline: "Expert-curated meal plans for your baby",
    signIn: "Sign in to plan your baby's meals",
    features: [
      { icon: "🥣", text: "Personalized meal suggestions based on your baby's age, condition, and dietary needs" },
      { icon: "📖", text: "Step-by-step recipes with ingredient lists and parent tips" },
      { icon: "❤️", text: "Save favorite recipes and track your baby's meal history" },
      { icon: "🌏", text: "Korean, Western, Chinese, and global cuisine options" },
    ],
  },
  ko: {
    tagline: "전문가가 엄선한 오늘의 이유식 메뉴",
    signIn: "로그인하고 아기 이유식을 계획해보세요",
    features: [
      { icon: "🥣", text: "아기의 개월 수, 건강 상태, 식단에 맞춘 이유식 메뉴 추천" },
      { icon: "📖", text: "재료 목록과 부모 팁이 담긴 단계별 레시피" },
      { icon: "❤️", text: "마음에 드는 레시피 저장 및 식사 기록 관리" },
      { icon: "🌏", text: "한식, 양식, 중식, 글로벌 요리 선택 가능" },
    ],
  },
} as const;

export default async function LoginPage() {
  const lang = detectLang(undefined, (await headers()).get("accept-language"));
  const t = copy[lang];

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-5 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md shadow-primary/10 mb-3">
            <h1 className="text-2xl font-bold text-primary">Little Spoonfuls 🥣</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t.tagline}</p>
        </div>

        {/* App description */}
        <div className="bg-white rounded-3xl shadow-md shadow-primary/10 p-6 mb-5">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {t.features.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <span className="mt-0.5">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Login form */}
        <LoginForm />

        <footer className="mt-6 text-center">
          <LegalFooter />
        </footer>
      </div>
    </main>
  );
}
