/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        innovexa: {
          /* Core backgrounds */
          bg:             '#F7F4EE',
          'bg-secondary': '#EFEAE2',
          'bg-subtle':    '#EAE4D9',
          'bg-card':      '#FCFAF6',
          /* Sidebar */
          sidebar:        '#20202A',
          'sidebar-sec':  '#282834',
          /* Typography */
          ink:            '#20202A',
          'ink-muted':    '#62616A',
          'ink-light':    '#8C8990',
          /* Borders */
          border:         '#E3DED5',
          'border-subtle':'#EDE8DF',
          /* Accents */
          coral:          '#E66F82',
          mint:           '#79C5B5',
          lavender:       '#9D96D5',
          blue:           '#8FA6DD',
          peach:          '#E7B47C',
          pink:           '#E9B7C1',
          amber:          '#E8B653',
          teal:           '#5AAFA3',
          purple:         '#8875E8',
        }
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        editorial: ['"Cormorant Garamond"', 'serif'],
        serif:   ['"DM Serif Display"', 'serif'],
        sans:    ['"Inter"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card:   '12px',
        input:  '10px',
        button: '10px',
      },
      boxShadow: {
        'subtle':     '0 2px 8px -2px rgba(32, 32, 42, 0.05), 0 1px 3px -1px rgba(32, 32, 42, 0.03)',
        'card':       '0 4px 18px -3px rgba(32, 32, 42, 0.07), 0 1px 4px -1px rgba(32, 32, 42, 0.04)',
        'float':      '0 16px 40px -12px rgba(32, 32, 42, 0.14), 0 0 0 1px rgba(32, 32, 42, 0.04)',
        'glow-coral': '0 4px 22px -6px rgba(230, 111, 130, 0.42)',
        'glow-purple':'0 4px 22px -6px rgba(136, 117, 232, 0.40)',
      }
    },
  },
  plugins: [],
}
