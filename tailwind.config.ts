import { type Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        outfit: ["'Outfit'", "sans-serif"],
      },
    },
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;