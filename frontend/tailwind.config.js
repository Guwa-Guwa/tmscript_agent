/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ee',
          100: '#d8f0d6',
          600: '#238b1e',
          700: '#1d7719',
        },
      },
      boxShadow: {
        panel: '0 16px 40px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
