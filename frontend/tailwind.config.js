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
          950: "#020617", // Deeper slate black
          900: "#06102b",
          800: "#0b1d47",
          700: "#112c66",
          600: "#183b87",
        },
        brand: {
          blue: "#2563eb",
          "blue-light": "#3b82f6",
          "blue-glow": "#60a5fa",
          red: "#e11d48", // Using deeper rose/red
          "red-light": "#f43f5e",
          "red-glow": "#fb7185",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in": "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        scanline: "scanline 8s linear infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        spin: "spin 1s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scanline: {
          "0%": { top: "-10%" },
          "100%": { top: "110%" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(59,130,246,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(59,130,246,0.6), 0 0 50px rgba(59,130,246,0.2)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
}
