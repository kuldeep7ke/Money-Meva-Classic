import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF8A3D',
          secondary: '#FFCF9A',
          light: '#FFF6EC',
          dark: '#1B1B1D',
          muted: '#3D332F',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
