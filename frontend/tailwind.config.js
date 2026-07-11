/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gaming: {
          dark: '#0D0E12',
          card: '#14161E',
          purple: '#9E00FF',
          cyan: '#00F0FF',
          green: '#00FF85',
          slate: '#1E222D',
          muted: '#8A8F9E'
        }
      },
      boxShadow: {
        'neon-purple': '0 0 15px rgba(158, 0, 255, 0.35)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.35)',
        'neon-green': '0 0 15px rgba(0, 255, 133, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif']
      },
      backgroundImage: {
        'carbon-pattern': "radial-gradient(circle, rgba(20,22,30,0.2) 1px, transparent 1px)",
        'neon-glow': "radial-gradient(circle at 50% 50%, rgba(158,0,255,0.15) 0%, transparent 60%)"
      }
    },
  },
  plugins: [],
}
