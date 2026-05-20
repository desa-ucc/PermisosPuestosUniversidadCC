/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'ucc-background': '#FBF9F8',
        'ucc-surface': '#FFFFFF',
        'ucc-primary': {
          DEFAULT: '#2d5000',
          container: '#76bc21',
          fixed: '#bcf381',
        },
        'ucc-secondary': {
          DEFAULT: '#356575',
          container: '#b9eafd',
        },
        'ucc-neutral': {
          text: '#191d15',
          variant: '#414937',
          outline: '#c3c9b5',
        },
        'ucc-error': '#ba1a1a',
      },
      boxShadow: {
        'ucc-card': '0px 4px 20px rgba(0, 61, 76, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        "md": "24px",
        "gutter": "24px",
        "sidebar-width": "280px"
      },
    },
  },
  plugins: [],
}
