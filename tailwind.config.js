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
        colors: {
          background: '#111111',
          surface: '#1a1a1a',
          accent: '#4A9EFF',
          muted: '#888888',
        },
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
        },
        boxShadow: {
          'glow': '0 0 40px rgba(74, 158, 255, 0.35)',
          'glow-sm': '0 0 20px rgba(74, 158, 255, 0.25)',
        },
        keyframes: {
          'spin-left': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(-360deg)' },
          },
        },
        animation: {
          'spin-left': 'spin-left 0.6s linear infinite',
        },
      }
    }
  }