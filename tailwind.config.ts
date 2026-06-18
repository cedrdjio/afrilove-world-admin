import type { Config } from "tailwindcss";

/**
 * AfriLove design system — derived from the afrolove-world landing page.
 * Warm African earth-tone palette: espresso, caramel, terracotta, gold, cream.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand earth tones
        espresso: {
          DEFAULT: "#2C1B14",
          900: "#100A07",
          800: "#1C100A",
          700: "#3B1F17",
          600: "#5A3A26",
          500: "#6B5347",
        },
        caramel: {
          DEFAULT: "#A56B45",
          light: "#C98B5F",
          dark: "#7A4A2C",
        },
        sand: {
          DEFAULT: "#D4A373",
          light: "#E9C9A6",
          lighter: "#F1D9A6",
        },
        terracotta: {
          DEFAULT: "#B9372A",
          light: "#D9534F",
          dark: "#8A2B20",
        },
        gold: {
          DEFAULT: "#E1AF3A",
          light: "#F1D9A6",
        },
        cream: {
          DEFAULT: "#F8F4EE",
          light: "#FFFDFB",
          dark: "#F0E6D9",
        },
        // Semantic
        success: "#1F9D55",
        danger: "#B9372A",
        warning: "#E1AF3A",
        info: "#0E7490",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg,#A56B45,#2C1B14)",
        "gold-gradient": "linear-gradient(135deg,#E1AF3A,#D4A373)",
        "sand-gradient": "linear-gradient(135deg,#F1D9A6,#D4A373)",
        "espresso-gradient": "linear-gradient(160deg,#3B2316,#1C100A)",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(44,27,20,0.06)",
        card: "0 4px 24px rgba(44,27,20,0.08)",
        lifted: "0 12px 40px rgba(44,27,20,0.14)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
