import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "(--background)",
        foreground: "var(--foreground)",
        orange: "#F96915",
        darkBlack: "#060606",
      },
      fontFamily: {
        aeonikBold: ["var(--font-AeoniK-Bold)"],
        aeonikRegular: ["var(--font-AeoniK-Regular)"],
        aeonikLight: ["var(--font-AeoniK-Light)"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "18px",
          sm: "18px",
          md: "25px",
          lg: "30px",
          xl: "40px",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
