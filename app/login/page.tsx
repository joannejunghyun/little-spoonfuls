import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md shadow-primary/10 mb-4">
            <h1 className="text-2xl font-bold text-primary">Little Spoonfuls 🥣</h1>
          </div>
          <p className="text-sm text-muted-foreground">Sign in to plan your baby&apos;s meals</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
