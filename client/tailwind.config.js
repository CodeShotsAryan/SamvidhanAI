const config = {
  darkMode: "class",
  content: [
    "./src/app/*.{js,ts,jsx,tsx}",
    "./src/components/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/ui/*.{js,ts,jsx,tsx}",
    "./src/components/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "red",
        bgcolor: "#e0f3ff",
      },
    },
  },
  plugins: [],
};

export default config;
