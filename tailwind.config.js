/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./apps/**/*.{html,js}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: { mono: ['"JetBrains Mono"', 'monospace'] },
            colors: {
                'tech-bg': '#0a0a0a',
                'tech-green': '#00ff9d',
                'tech-gray': '#2a2a2a',
                'tech-dim': '#888888',
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
