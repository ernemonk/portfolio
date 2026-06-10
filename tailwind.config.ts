import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blue-tinted slate neutral scale (deep end shifted to navy for depth)
        neutral: {
          50: "#F8FAFC",
          100: "#E8E8EC",
          200: "#D4D4DA",
          300: "#B8B8C2",
          400: "#9999A6",
          500: "#5C5C68",
          600: "#34343F",
          700: "#25252E",
          800: "#141B2B",
          900: "#0C1220",
          950: "#070B14",
        },
        // Primary Accent (Indigo #6366f1) - the single signal color
        primary: {
          50: "#EEF2FF",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
        },
        // Secondary Accents (Purple) - reserved, low usage
        secondary: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        // Tertiary Accents (Teal) - reserved, low usage
        tertiary: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        // Semantic Colors
        success: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        error: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "monospace"],
      },
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        "xs": "4px",
        "sm": "8px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
      },
      boxShadow: {
        "glow-sm": "0 0 20px -5px rgba(99, 102, 241, 0.15)",
        "glow-md": "0 0 30px -5px rgba(99, 102, 241, 0.25)",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
