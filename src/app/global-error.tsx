"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F8F4EE", color: "#2C1B14" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Une erreur critique est survenue</h1>
            <p style={{ marginTop: 8, color: "#6B5347" }}>
              Vérifiez les variables d&apos;environnement Supabase sur Vercel
              (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET), puis redéployez.
            </p>
            {error.digest && (
              <p style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12, color: "#9A8779" }}>
                digest: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ marginTop: 24, padding: "10px 20px", borderRadius: 12, border: "none", background: "#A56B45", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
