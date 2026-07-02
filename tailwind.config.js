/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./*.html",
        "./apps/**/*.{html,js}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: { mono: ['"JetBrains Mono"', 'monospace'] },
            colors: {
                'tech-bg': '#0a0a0a',
                'tech-surface': '#101114',
                'tech-card': '#0f1013',
                'tech-green': '#00ff9d',
                'tech-green-dim': '#00cc7d',
                'tech-gray': '#2a2a2a',
                'tech-dim': '#8b8f98',
                'tech-cyan': '#22d3ee',
                'tech-violet': '#a78bfa',
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
                'glow-radial': "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,255,157,0.12), transparent)",
            },
            boxShadow: {
                'glow-sm': '0 0 12px rgba(0, 255, 157, 0.25)',
                'glow': '0 0 24px rgba(0, 255, 157, 0.35)',
                'card': '0 8px 32px rgba(0, 0, 0, 0.45)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
                'aurora': 'aurora 14s ease-in-out infinite alternate',
                'shimmer': 'shimmer 2.5s linear infinite',
            },
            keyframes: {
                fadeUp: {
                    from: { opacity: '0', transform: 'translateY(18px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                aurora: {
                    from: { transform: 'translate(-8%, -4%) scale(1) rotate(0deg)' },
                    to: { transform: 'translate(8%, 6%) scale(1.15) rotate(8deg)' },
                },
                shimmer: {
                    from: { backgroundPosition: '200% 0' },
                    to: { backgroundPosition: '-200% 0' },
                },
            },
            borderRadius: {
                'card': '0.875rem',
            },
        },
    },
    plugins: [],
}
