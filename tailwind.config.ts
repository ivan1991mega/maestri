import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ice: {
          50: "#f4f8fb",
          100: "#e6eef5",
          800: "#0f3d5e",
          900: "#0a2a42",
        },
        pine: {
          500: "#1f6b4a",
          600: "#175338",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
