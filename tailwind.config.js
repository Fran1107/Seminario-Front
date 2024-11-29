/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primaryColor: '#023047',
        secundaryColor: '#202046',
        hoverColor: '#8C6A42',
        oscuroColor: '#1e1b4b',
        hoverTextColor: '#e0e0e0'
      }
    },
  },
  plugins: [],
}

