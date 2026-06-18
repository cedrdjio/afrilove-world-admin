import { Brand } from "@/components/Brand";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion — AfroLove World Admin" };

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-gradient bg-pan">
      {/* decorative warm glows (gently floating) */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] animate-float rounded-full bg-terracotta/25 blur-3xl [animation-delay:-3s]" />
      {/* subtle African pattern dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(#F8F4EE 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <Brand light />
          <div className="page-enter max-w-md">
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white">
              L&apos;amour n&apos;a pas de <span className="text-gold">frontières</span>.
              <br />Il a des <span className="text-gold">racines</span>.
            </h1>
            <p className="mt-4 text-sand-light/80">
              Pilotez la communauté AfroLove World — membres, abonnements, paiements et cadeaux —
              depuis un tableau de bord chaleureux, rapide et sécurisé.
            </p>
          </div>
          <p className="text-xs text-sand-light/50">© {new Date().getFullYear()} AfroLove World. Tous droits réservés.</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6">
          <div className="card w-full max-w-md animate-scale-in p-8">
            <div className="mb-6 lg:hidden">
              <Brand />
            </div>
            <h2 className="font-display text-2xl font-bold">Bon retour 👋</h2>
            <p className="mt-1 text-sm text-espresso-500">Connectez-vous à votre espace d&apos;administration.</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
