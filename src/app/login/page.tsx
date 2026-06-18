import { Brand } from "@/components/Brand";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — AfriLove Admin" };

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-espresso-gradient">
      {/* decorative warm glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-terracotta/20 blur-3xl" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <Brand className="[&_span]:text-white" />
          <div className="max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Manage the <span className="text-gold">AfriLove World</span> community with confidence.
            </h1>
            <p className="mt-4 text-sand-light/80">
              Users, subscriptions, payouts, gifts and more — all in one warm, fast and secure dashboard.
            </p>
          </div>
          <p className="text-xs text-sand-light/50">© {new Date().getFullYear()} AfriLove World. All rights reserved.</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6">
          <div className="card w-full max-w-md animate-fade-in p-8">
            <div className="mb-6 lg:hidden">
              <Brand />
            </div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-espresso-500">Sign in to your admin account.</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
