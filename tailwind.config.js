import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                accent: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'bg-float-1': {
                    '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                    '50%': { transform: 'translate3d(20px, -20px, 0) scale(1.05)' },
                    '100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                },
                'bg-float-2': {
                    '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                    '50%': { transform: 'translate3d(-24px, 16px, 0) scale(0.97)' },
                    '100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out forwards',
                'fade-out': 'fade-out 0.2s ease-in forwards',
                'slide-up': 'slide-up 0.4s ease-out forwards',
                'bg-float-1': 'bg-float-1 22s ease-in-out infinite',
                'bg-float-2': 'bg-float-2 26s ease-in-out infinite',
            },
        },
    },

    plugins: [forms],
};
