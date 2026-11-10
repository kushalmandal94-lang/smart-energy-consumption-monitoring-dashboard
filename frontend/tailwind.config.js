/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060913',
          900: '#0B0F19',
          850: '#111827',
          800: '#172033',
          700: '#1E293B',
          600: '#334155',
        },
        energy: {
          green: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
            glow: 'rgba(16, 185, 129, 0.25)',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            light: '#22D3EE',
            dark: '#0891B2',
          },
          blue: {
            DEFAULT: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
            glow: 'rgba(59, 130, 246, 0.25)',
          },
          amber: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
          rose: {
            DEFAULT: '#F43F5E',
            light: '#FB7185',
            dark: '#E11D48',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

