/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'primary-background': "url('./assets/background/beams.jpg')",
      },
      colors: {
        'audino-primary': '#70CBA2',
        'audino-primary-dark': '#65B892',
      }
      // 
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

