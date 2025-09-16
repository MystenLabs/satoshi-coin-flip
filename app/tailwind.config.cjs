/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            colors: {
                primary: '#FFD600',
                light: '#D3B200',
            },
            animation: {
                'flip-vertical': 'flip-vertical 2s ease-in-out infinite',
            },
            keyframes: {
                'flip-vertical': {
                    '0%': { transform: 'rotateX(0deg)' },
                    '50%': { transform: 'rotateX(90deg)' },
                    '100%': { transform: 'rotateX(0deg)' },
                },
            },
        },
    },
    plugins: [],
};
