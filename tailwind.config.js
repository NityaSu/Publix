/* For Tailwind config */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './component/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
    theme: {
      extend: {
        fontFamily: {
          'sans': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
          'display': ['Montserrat', 'Gotham', 'sans-serif'],
          'heading': ['Poppins', 'sans-serif']
        },
        fontWeight: {
          'normal': '400',
          'medium': '500',
          'semibold': '600',
          'bold': '700',
          'extrabold': '800'
        }
      }
    }
  }