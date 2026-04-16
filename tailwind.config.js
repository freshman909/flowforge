/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ffff',
        secondary: '#8b5cf6',
        accent: '#f472b6',
        dark: '#0a0a1a',
        darker: '#050510',
        glass: 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'tech': ['Rajdhani', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
        'neon-purple': '0 0 5px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #8b5cf6',
        'neon-pink': '0 0 5px #f472b6, 0 0 20px #f472b6, 0 0 40px #f472b6',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00ffff, 0 0 20px #00ffff' },
          '50%': { boxShadow: '0 0 10px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-tech': 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 50%, #f472b6 100%)',
      },
    },
  },
  plugins: [],
}