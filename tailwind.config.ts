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
        border: "#E8E4DD",
        cream: "#FAF8F5",
        ink: "#1A1A1A",
        muted: "#6B6B6B",
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
