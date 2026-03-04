/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: ['flex-col'],
    theme: {
        extend: {},
    },
    plugins: [],
}
