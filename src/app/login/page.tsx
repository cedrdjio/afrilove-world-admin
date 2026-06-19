import { Brand } from "@/components/Brand";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion — AfriLove World Admin" };

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream">
      {/* soft warm accents — light & easy on the eyes */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-sand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-gold/10 blur-3xl" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <Brand className="h-11" />
          <div className="page-enter max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight text-espresso">
              L&apos;amour n&apos;a pas de <span className="text-caramel">frontières</span>.
              <br />Il a des <span className="text-caramel">racines</span>.
            </h1>
            <p className="mt-4 text-espresso-500">
              Pilotez la communauté AfriLove World — membres, abonnements, paiements et cadeaux —
              depuis un tableau de bord chaleureux, rapide et sécurisé.
            </p>
          </div>
          <p className="text-xs text-espresso-500/60">© {new Date().getFullYear()} AfriLove World. Tous droits réservés.</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6">
          <div className="card w-full max-w-md animate-scale-in p-8">
            <div className="mb-6 flex justify-center lg:hidden">
              <Brand className="h-12" />
            </div>
            <h2 className="text-2xl font-bold text-espresso">Bon retour 👋</h2>
            <p className="mt-1 text-sm text-espresso-500">Connectez-vous à votre espace d&apos;administration.</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
