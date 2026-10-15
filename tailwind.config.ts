import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F4F1EC",
        stone: "#E3DED6",
        paper: "#FAF8F4",
        graphite: "#1C1C1A",
        smoke: "#6E6A64",
        amber: "#B4783C",
        line: "#D9D3C9",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: { lux: "cubic-bezier(0.22, 1, 0.36, 1)" },
      boxShadow: { drawer: "-30px 0 60px -30px rgba(28, 28, 26, 0.35)", card: "0 24px 50px -30px rgba(28, 28, 26, 0.35)" },
    },
  },
  plugins: [],
};
export default config;
