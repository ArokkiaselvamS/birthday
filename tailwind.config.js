/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#03040a",
        "bg-soft": "#0a0c16",
        gold: "#d8b877",
        "gold-soft": "#e9d5a3",
        warm: "#ffb469",
        cool: "#7fa0ff",
        ink: "#f2ede2",
      },
      fontFamily: {
        display: [
          "Futura",
          "Century Gothic",
          "Avenir Next",
          "Segoe UI",
          "sans-serif",
        ],
        body: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
      },
      letterSpacing: {
        widest2: "0.32em",
      },
    },
  },
  plugins: [],
};
