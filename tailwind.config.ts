import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF8A3D",
          secondary: "#FFCF9A",
          light: "#FFF6EC",
          dark: "#1B1B1D",
          muted: "#3D332F",
        },
      },
    },
  },
};

export default config;
