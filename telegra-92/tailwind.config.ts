import type { Config } from 'tailwindcss'

// Tokeny kierunku wizualnego "Lunapark" (docs/moodboard.html).
// Role kolorów: zarowka = pieniądze, wata = emocje/kulminacje, neon = decyzje graczy.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noc: '#171233',
        panel: '#221b47',
        linia: '#3a2f66',
        kosc: '#f7f1e4',
        zgaszony: '#9d94bd',
        zarowka: '#ffb13d',
        wata: '#ff5fa2',
        neon: '#43e0d8',
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luna: '0 0 22px rgba(255, 177, 61, 0.35)',
        wata: '0 0 22px rgba(255, 95, 162, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config
