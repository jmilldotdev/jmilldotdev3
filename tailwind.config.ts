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
        background: "#000000",
        foreground: "#FFFFFF",
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
      animation: {
        blink: "blink 2s infinite",
        "warning-blink": "warning-blink 1s infinite",
        "pulse-bar": "pulse 4s infinite",
        scroll: "scroll 20s linear infinite",
        scanline: "scanline 10s linear infinite",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        "flash-red": "flash-red 0.8s ease-in-out",
        flicker: "flicker 5s infinite",
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
        scanline: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "flash-red": {
          "0%, 100%": { borderColor: "#333" },
          "50%": { borderColor: "#ef4444" },
        },
        flicker: {
          "0%": { backgroundColor: "rgba(0,0,0,0)" },
          "5%": { backgroundColor: "rgba(0,0,0,0.02)" },
          "10%": { backgroundColor: "rgba(0,0,0,0)" },
          "15%": { backgroundColor: "rgba(0,0,0,0.04)" },
          "30%": { backgroundColor: "rgba(0,0,0,0)" },
          "50%": { backgroundColor: "rgba(0,0,0,0.03)" },
          "80%": { backgroundColor: "rgba(0,0,0,0)" },
          "95%": { backgroundColor: "rgba(0,0,0,0.05)" },
          "100%": { backgroundColor: "rgba(0,0,0,0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};

export default config;
