/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-accent': '#7cfa27',
        // Override emerald with custom green #7cfa27
        'emerald': {
          50: '#f0fde4',
          100: '#ddfbbb',
          200: '#c2f788',
          300: '#a3f254',
          400: '#7cfa27',  // Your custom color
          500: '#6de01f',  // Main brand color (slightly darker)
          600: '#57b318',
          700: '#448a14',
          800: '#376d14',
          900: '#2f5c14',
          950: '#163306',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
