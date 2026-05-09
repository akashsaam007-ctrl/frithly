import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "0.5rem",
        "2xl": "1.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      colors: {
        border: "#243241",
        cream: "#07111B",
        ink: "#FFF7F1",
        muted: "#9EAAB6",
        terracotta: {
          DEFAULT: "#D4623A",
          dark: "#B14E2A",
          light: "#E8855F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.02em",
      },
      maxWidth: {
        content: "1200px",
        narrow: "720px",
      },
      spacing: {
        section: "5rem",
        "section-lg": "8rem",
      },
    },
  },
  plugins: [],
};

export default config;
