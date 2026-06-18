# Brand assets

The admin UI loads the logo from **`public/brand/mark.png`** and the favicon
from **`public/favicon.png`** / **`public/favicon.svg`**.

To use the official AfroLove World artwork, simply **overwrite these files**
(keep the same names) — no code changes needed:

| File | Used for | Recommended |
|------|----------|-------------|
| `public/brand/mark.png` | Logo in the sidebar, login & top bar | square, **transparent** PNG, ≥ 512×512 |
| `public/favicon.png`    | Browser tab icon | 64×64 (or 32×32) PNG |
| `public/favicon.svg`    | Browser tab icon (vector) | optional, delete if unused |

> Tip: a **transparent** background makes the mark sit cleanly on both the dark
> sidebar and light pages. If you only have the rounded-square app icon with a
> background, it still works — it'll just show its own background.

You can drop the files in via GitHub's web UI (**Add file → Upload files**,
into `public/brand/`) or locally, then commit. Vercel redeploys automatically.

The wordmark text ("AFROLOVE / World") next to the mark is rendered in
Playfair Display from `src/components/Brand.tsx`.
