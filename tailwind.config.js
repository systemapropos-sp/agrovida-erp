/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'agro-primary': '#16A34A',
        'agro-secondary': '#15803D',
        'agro-light': '#22C55E',
        'agro-bg': '#F0FDF4',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-slide-up': 'fadeSlideUp 0.3s ease forwards',
        'shake': 'shake 0.3s ease-in-out',
        'float1': 'float1 20s ease-in-out infinite',
        'float2': 'float2 25s ease-in-out infinite',
        'float3': 'float3 22s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
