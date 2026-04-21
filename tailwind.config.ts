import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fantasy: ["Trebuchet MS", "Arial Rounded MT Bold", "Arial", "sans-serif"],
      },
      boxShadow: {
        "hero-card": "0 25px 50px -12px rgba(0, 0, 0, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
