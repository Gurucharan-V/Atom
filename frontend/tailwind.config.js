/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F2F4F7',
        sheet: '#FFFFFF',
        ink: '#16202C',
        'ink-soft': '#4B5868',
        rule: '#D9DEE5',
        corona: '#E39B12',
        verified: '#1F8A70',
        escalated: '#C2374A',
        pending: '#4B52B8',
        // Trace tape step node colors from DESIGN.md
        step: {
          input: '#8FB4E8',
          plan: '#B9A6F0',
          tool: '#7AD1C1',
          decision: '#F1C168',
          action: '#F0967F',
          verification: '#7FD69A',
          escalate: '#F27A8A',
        }
      },
      fontFamily: {
        ui: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        control: '3px',
        panel: '8px',
      },
      boxShadow: {
        modal: '0 8px 24px rgba(22, 32, 44, 0.12)',
      }
    },
  },
  plugins: [],
}
