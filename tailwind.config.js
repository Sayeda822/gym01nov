/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        lime: 'rgb(var(--lime) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        flame: '#ff6b3d',
      },
      // Text uses its own tokens so light mode can use darker, readable shades
      // while backgrounds, borders and gradients keep the neon brand colours.
      textColor: {
        lime: 'rgb(var(--lime-text) / <alpha-value>)',
        cyan: 'rgb(var(--cyan-text) / <alpha-value>)',
        flame: 'rgb(var(--flame-text) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--lime) / 0.55)',
        'glow-cyan': '0 0 40px -8px rgb(var(--cyan) / 0.55)',
        card: '0 10px 40px -12px rgb(0 0 0 / 0.45)',
      },
      backgroundImage: {
        brand: 'linear-gradient(110deg, rgb(var(--lime)) 0%, rgb(var(--cyan)) 100%)',
      },
    },
  },
  plugins: [],
}
