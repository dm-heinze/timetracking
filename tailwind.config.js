/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,ts,vue}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            colors: {
                'success-100': '#fafff7'
            },
        },
    },
    daisyui: {
        logs: false,
        themes: [
            {
                dmf: {
                    "fontFamily": "'Open Sans',sans-serif",
                    "primary": "#2e186a",
                    "primary-content": "#FFFFFF",
                    "secondary": "#FFFFFF",
                    "accent": "#93e256",
                    "neutral": "#9099a8",
                    "neutral-content": "#9099a8",
                    "base-100": "#ffffff",
                    "base-200": "#f6f7f8",
                    "info": "#7EA6D7",
                    "success": "#93e256",
                    "warning": "#C98703",
                    "error": "#d72f50",
                    "--rounded-btn": "50px",
                    "--btn-text-case": "none"
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    primary: "#804eee",
                    "primary-content": "#ffffff",
                    secondary: "#e0e0e0",
                    "secondary-content": "#000000",
                    accent: "#6da244",
                    "accent-content": "#ffffff",
                    neutral: "#A6ADBB",
                    "neutral-focus": "#111318",
                    "neutral-content": "#A6ADBB",
                    "base-100": "#2A303C",
                    "base-200": "#242933",
                    "base-300": "#20252E",
                    "base-content": "#A6ADBB",
                    "error": "#b62437",
                }
            },
            'cupcake',
            'bumblebee',
            'emerald',
            'corporate',
            'synthwave',
            'retro',
            'cyberpunk',
            'valentine',
            'halloween',
            'garden',
            'forest',
            'aqua',
            'lofi',
            'pastel',
            'fantasy',
            'wireframe',
            'black',
            'luxury',
            'dracula',
            'cmyk',
            'autumn',
            'business',
            'acid',
            'lemonade',
            'night',
            'coffee',
            'winter'
        ]
    },
    plugins: [
        require("daisyui")
    ],
}