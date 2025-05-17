import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF4800",
        secondary: "#00FFFF",
      },
      animation: {
        blink: "blink 2s infinite",
        "warning-blink": "warning-blink 1s infinite",
        pulse: "pulse 4s infinite",
        scroll: "scroll 20s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "warning-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.6", width: "75%" },
          "50%": { opacity: "0.8", width: "77%" },
        },
        scroll: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-300px)" },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};

export default config;
