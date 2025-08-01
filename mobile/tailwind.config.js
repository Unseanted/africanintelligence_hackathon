// tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require('nativewind/preset')],  // THIS IS CRUCIAL
  theme: {
    extend: {},
  },
  plugins: [],
} 