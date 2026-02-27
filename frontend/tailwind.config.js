/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Orbitron'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Sora'", "sans-serif"],
      },
      colors: {
        navy: {
          950: "#020817",
          900: "#050f1f",
          800: "#081428",
          700: "#0c1d38",
          600: "#102545",
        },
        brand: {
          blue: "#2563eb",
          "blue-light": "#3b82f6",
          "blue-glow": "#60a5fa",
          red: "#dc2626",
          "red-light": "#ef4444",
          "red-glow": "#f87171",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fadeUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in": "slideIn 0.35s ease forwards",
        scanline: "scanline 6s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        spin: "spin 1s linear infinite",
        "border-flow": "borderFlow 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scanline: {
          "0%": { top: "-20%" },
          "100%": { top: "120%" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(59,130,246,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.3)" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
        "hero-gradient": "radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(220,38,38,0.08) 0%, transparent 50%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.3), 0 0 30px rgba(59,130,246,0.08)",
        "blue-glow": "0 0 20px rgba(59,130,246,0.35)",
        "red-glow": "0 0 20px rgba(239,68,68,0.35)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
}
