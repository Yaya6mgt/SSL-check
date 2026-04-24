/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    opacity: {
      '0': '0',
      '20': '0.2',
      '40': '0.4',
      '60': '0.6',
      '80': '0.8',
      '100': '1',
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',

        // Basic colors
        primary: {
          DEFAULT:'hsl(0, 0%, 21%)',
          50: 'hsl(0, 0%, 95%)',
          100: 'hsl(0, 0%, 90%)',
          200: 'hsl(0, 0%, 80%)',
          300: 'hsl(0, 0%, 70%)',
          400: 'hsl(0, 0%, 60%)',
          500: 'hsl(0, 0%, 21%)',
          hover: 'hsl(0, 0%, 18%)',
          active: 'hsl(0, 0%, 15%)',
        },

        secondary: {
          DEFAULT: 'hsl(345 84% 44%)',
          50: 'hsl(345, 84%, 95%)',
          100: 'hsl(345, 84%, 90%)',
          200: 'hsl(345, 84%, 80%)',
          300: 'hsl(345, 84%, 70%)',
          400: 'hsl(345, 84%, 60%)',
          500: 'hsl(345, 84%, 50%)',
          hover: 'hsl(345, 84%, 40%)',
          active: 'hsl(345, 84%, 36%)',
        },

        // Functional colors
        success: {
          DEFAULT: '#4F8A10',
          muted: '#B4F298',
          dark: '#3b660c',
        },
        error: {
          DEFAULT: '#D8000C',
          muted: '#FFA4A4',
          dark: '#b0000a',
        },
        warning: {
          DEFAULT: '#9F6000',
          muted: '#FED7A0',
          dark: '#7f4c00',
        },
        info: {
          DEFAULT: '#31708F',
          muted: '#D5D8F7',
          dark: '#245269',
        },
        assets: {
          moon: '#3f3f46',
          sun: '#f59e0b',
        },

      }
    },
  },
  plugins: [],
};