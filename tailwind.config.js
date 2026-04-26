import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                indigo: {
                    50:  '#F8F7FF',
                    100: '#EDE8FC',
                    200: '#D4C8F5',
                    300: '#B8A4ED',
                    400: '#8B6ADB',
                    500: '#5932C9',
                    600: '#4D2AB5',
                    700: '#28106F',
                    800: '#1E0C55',
                    900: '#140840',
                    950: '#0A0420',
                },
                brand: {
                    primary:   '#5932C9',
                    secondary: '#72CBEA',
                    dark:      '#28106F',
                    bg:        '#F8F7FF',
                },
            },
        },
    },

    plugins: [forms],
};
