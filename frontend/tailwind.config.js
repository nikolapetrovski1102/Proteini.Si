export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
    screens: {
      // Standard min-width breakpoints
      sm: "640px", // Small screens ≥ 640px
      md: "769px", // Medium screens ≥ 769px
      lg: "1025px", // Large screens ≥ 1025px
      xl: "1281px", // Extra large screens ≥ 1281px
      "2xl": "1536px", // 2X large screens ≥ 1536px

      // Reverse max-width breakpoints
      "max-sm": { max: "639px" }, // ≤ 639px
      "max-md": { max: "768px" }, // ≤ 768px
      "max-lg": { max: "1024px" }, // ≤ 1024px
      "max-xl": { max: "1280px" }, // ≤ 1280px
      "max-2xl": { max: "1535px" }, // ≤ 1535px
    },
  },
  plugins: [],
};
