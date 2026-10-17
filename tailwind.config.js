/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          900: '#0a0f1d',
          800: '#10172a',
          700: '#1e293b',
          600: '#334155'
        },
        turf: {
          500: '#10b981',
          400: '#34d399',
          600: '#059669'
        },
        cardred: '#ef4444',
        cardyellow: '#eab308',
        subblue: '#0ea5e9'
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-goal': 'flashGoal 1.5s ease-in-out infinite',
      },
      keyframes: {
        flashGoal: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.7))' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 1))' },
        }
      }
    },
  },
  plugins: [],
}
