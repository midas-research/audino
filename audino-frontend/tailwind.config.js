/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'primary-background': "url('./assets/background/beams.jpg')",
        'audino-gradient': 'linear-gradient(45deg, #69BE98, #315846)', 
      },
      colors: {
        'audino-primary': '#70CBA2',
        'audino-primary-dark': '#65B892', 
        'audino-navy': '#00042a',     
        'audino-light-navy': '#13183f',
        'audino-midnight': '#20264C',
        'audino-gray': '#868686',
        'audino-green-translucent': '#70CBA23B',
        'audino-deep-navy': '#0F1338',
        'audino-charcoal': '#4A4A4B',
        'audino-light-gray': '#D2D1D1',
        'audino-medium-gray': '#A1A1A1',
        'audino-slate-gray': '#535669',
        'audino-steel': '#5E6070',
        'audino-cloud-gray': '#8C94A3',
        'audino-graphite': '#44454A',
        'audino-teal-blue': '#334c5f',
        'audino-neutral-gray': '#8E8E8E',
        'audino-light-silver': '#E3E4E9',
        'audino-deep-space': '#181d41',
        'audino-storm-gray': '#6B7280',
        'audino-silver-gray': '#A8A8AA',
      },
      // 
      animation: {
        'spin-once': 'spin 0.5s linear',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

