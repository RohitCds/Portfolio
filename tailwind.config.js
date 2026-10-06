/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#04050c",
        deep: "#0a0d1f",
        star: "#e9ecf8",
        haze: "#8f97ba",
        dim: "#5a6187",
        mint: "#6ef2c8",
        indigo: "#7b7ff6",
        sky: "#5aa9ff",
        line: "rgba(160, 170, 255, 0.12)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-18px) rotate(1deg)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.8)" },
        },
        scrollCue: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spin 40s linear infinite",
        "spin-slower": "spin 70s linear infinite",
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
        "scroll-cue": "scrollCue 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
