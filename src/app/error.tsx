"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center bg-cream p-6">
      <div className="card max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-terracotta/10 text-2xl">
          ⚠️
        </div>
        <h1 className="font-display text-2xl font-bold text-espresso">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-espresso-500">
          Le serveur a rencontré une erreur. Si vous venez de déployer, vérifiez que les variables
          d&apos;environnement Supabase (<code className="rounded bg-cream-dark px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-cream-dark px-1">SUPABASE_SERVICE_ROLE_KEY</code>,{" "}
          <code className="rounded bg-cream-dark px-1">AUTH_SECRET</code>) sont bien définies sur Vercel,
          puis redéployez.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-espresso-500/70">digest: {error.digest}</p>
        )}
        <button onClick={reset} className="btn-primary mt-6">Réessayer</button>
      </div>
    </div>
  );
}
