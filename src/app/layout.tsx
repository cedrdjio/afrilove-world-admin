import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Brand typography. Gotham (the requested primary) is a commercial font not
// available on Google Fonts; Montserrat is its closest free, geometric match
// and is the requested secondary — so we use it across the whole UI.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AfriLove World — Admin",
  description: "Administration panel for AfriLove World — l'amour n'a pas de frontières, il a des racines.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/brand/mark.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
