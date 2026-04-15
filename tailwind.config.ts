import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './composables/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Fill the gap between gray-700 and gray-800
        'gray-750': '#2d3148',
      },
    },
  },
  plugins: [],
} satisfies Config
