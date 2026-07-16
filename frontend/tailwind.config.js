/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#05070D',
          900: '#0A0E17',
          800: '#0F1420',
          700: '#161C2C',
          600: '#1E2740',
        },
        neon: {
          blue: '#2F6BFF',
          cyan: '#00D9FF',
          purple: '#8B5CF6',
          violet: '#A855F7',
        },
        signal: {
          critical: '#FF3B5C',
          high: '#FF8A3D',
          medium: '#FFC93D',
          low: '#00E5A0',
        },
        ink: {
          100: '#F4F6FB',
          300: '#C7CEDD',
          500: '#8A93A6',
          700: '#4B5568',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(47,107,255,0.35)',
        'glow-purple': '0 0 24px rgba(139,92,246,0.35)',
        'glow-critical': '0 0 24px rgba(255,59,92,0.35)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(ellipse at top, rgba(47,107,255,0.15), transparent 60%)',
        'mesh': 'linear-gradient(135deg, rgba(47,107,255,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
