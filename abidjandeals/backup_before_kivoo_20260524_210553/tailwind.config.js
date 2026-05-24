/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Couleurs ───────────────────────────────────────
      colors: {
        dark: '#0F1117',
        orange: {
          50:  '#FFF4ED',
          100: '#FFE4CC',
          200: '#FFC999',
          300: '#FFAD66',
          400: '#FF8C38',
          500: '#F5620F',
          600: '#E05E00',
          700: '#B34A00',
          800: '#803500',
          900: '#4D1F00',
        },
      },

      // ── Typographie globale ────────────────────────────
      fontSize: {
        'meta':       ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'product':    ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'price':      ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        'section':    ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'section-lg': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
      },

      // ── Familles de polices ────────────────────────────
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        heading: ['var(--font-syne)', 'sans-serif'],
      },

      // ── Ombres (utilisées dans globals.css) ────────────
      boxShadow: {
        'card':          '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover':    '0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.08)',
        'orange':        '0 4px 14px 0 rgb(245 98 15 / 0.30)',
        'orange-lg':     '0 8px 24px 0 rgb(245 98 15 / 0.35)',
      },

      // ── Espacements boutons ────────────────────────────
      spacing: {
        'btn-x': '20px',
        'btn-y': '10px',
      },
    },
  },
  plugins: [],
}
