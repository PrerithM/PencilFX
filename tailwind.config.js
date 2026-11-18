/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#F7F6F0',
          surface: '#FFFFFF',
          warm: '#FAF9F5',
          muted: '#EFECE6',
          border: '#E5E3D8',
          borderStrong: '#D2CFBF',
        },
        brand: {
          primary: '#16834A',
          deep: '#105C36',
          light: '#EAF5EE',
          dark: '#0C4226',
        },
        ink: {
          DEFAULT: '#171917',
          muted: '#5C605C',
          faint: '#8C908C',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        paper: '0 1px 2px rgba(23, 25, 23, 0.05)',
        'paper-md': '0 2px 4px rgba(23, 25, 23, 0.08)',
        'paper-lg': '0 4px 8px rgba(23, 25, 23, 0.12)',
      },
      borderRadius: {
        none: '0',
        xs: '2px',
        sm: '3px',
      },
    },
  },
  plugins: [],
}
