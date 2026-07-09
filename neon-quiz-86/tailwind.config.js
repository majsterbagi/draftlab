/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff2fb3',
          cyan: '#22e0ff',
          violet: '#a855f7',
          amber: '#ffc832',
          green: '#39ff88',
          red: '#ff3b5c',
        },
        crt: {
          bg: '#0a0518',
          panel: '#140b2e',
          line: '#2a1b55',
        },
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'monospace'],
        body: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        'neon-pink': '0 0 6px #ff2fb3, 0 0 20px rgba(255,47,179,.45)',
        'neon-cyan': '0 0 6px #22e0ff, 0 0 20px rgba(34,224,255,.45)',
        'neon-violet': '0 0 6px #a855f7, 0 0 20px rgba(168,85,247,.45)',
      },
    },
  },
  plugins: [],
}
