/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hilton: {
          blue: '#002C51',
          black: '#000000',
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Walbaum BQ Medium', 'serif'],
        sans: ['Whitney', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};