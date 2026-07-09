/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                bb: {
                    bg: 'var(--bb-bg)',
                    card: 'var(--bb-card)',
                    primary: 'var(--bb-primary)',
                    soft: 'var(--bb-soft)',
                    accent: 'var(--bb-accent)',
                    accent2: 'var(--bb-accent2)',
                    text: 'var(--bb-text)',
                    muted: 'var(--bb-muted)',
                    border: 'var(--bb-border)'
                }
            },
            fontFamily: {
                display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
                body: ['Nunito', 'system-ui', 'sans-serif']
            },
            borderRadius: {
                bubble: '1.75rem'
            }
        }
    },
    plugins: []
};
