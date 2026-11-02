import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8f7f4",
          100: "#efede6",
          200: "#ddd8ca",
          300: "#c6bea8",
          400: "#ad9f82",
          500: "#998766",
          600: "#8c7659",
          700: "#75604b",
          800: "#604f40",
          900: "#1c2430",
          950: "#11161d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
