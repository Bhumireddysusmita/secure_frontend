/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand: indigo primary with a violet accent for gradients.
        primary: {
          50: "#eef0ff",
          100: "#e0e3ff",
          200: "#c7cbfe",
          300: "#a5a8fc",
          400: "#8183f8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#272270",
        },
        accent: {
          100: "#ede9fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        ink: "#16163f",
        danger: { 50: "#fef2f2", 200: "#fecaca", 600: "#dc2626", 700: "#b91c1c" },
        success: { 50: "#f0fdf4", 200: "#bbf7d0", 500: "#22c55e", 600: "#16a34a", 700: "#15803d" },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
        "brand-panel": "linear-gradient(160deg, #3b2fd0 0%, #4f46e5 45%, #6d28d9 100%)",
        "page-glow":
          "radial-gradient(60rem 30rem at 85% -10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(40rem 25rem at -10% 20%, rgba(99,102,241,0.12), transparent 60%)",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(49, 46, 129, 0.18)",
        glow: "0 10px 25px -8px rgba(79, 70, 229, 0.55)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
