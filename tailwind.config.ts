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
          coffee: "#4A3128", // Coffee Brown (official)
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
        sans: ["var(--font-sans)", "Montserrat", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "Montserrat", "system-ui", "sans-serif"],
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
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-14px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        heartbeat: {
          "0%,100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.18)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.12)" },
          "60%": { transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-left": "slide-in-left 0.4s ease-out both",
        float: "float 6s ease-in-out infinite",
        heartbeat: "heartbeat 2.4s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "spin-slow": "spin-slow 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
