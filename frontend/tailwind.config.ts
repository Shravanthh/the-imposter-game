import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00ADB5',
        'primary-hover': '#009DA3',
        'secondary': '#EEEEEE',
        'secondary-hover': '#F5F5F5',
        'background': '#222831',
        'surface': 'rgba(57, 62, 70, 0.7)',
        'text-light': '#EEEEEE',
        'text-dark': '#FFFFFF',
        'text-muted': '#A0AEC0',
        'error': '#E53E3E',
        'success': '#38A169',
        'border-color': 'rgba(238, 238, 238, 0.2)',
        'accent-gold': '#4ade80',
        'accent-teal': '#3b82f6',
        'failure': '#f43f5e',
        'text-primary': '#e6edf3',
        'text-secondary': '#7d8590',
        'border': '#30363d',
        'background-dark': '#0a192f',
        'imposter-red': '#e11d48',
        'civilian-blue': '#22d3ee',
        'slate-dark': '#1e293b',
        'slate-light': '#334155',
        'cyan-accent': '#67e8f9',
        'green-ready': '#4ade80'
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Poppins', 'sans-serif'],
        'heading': ['Fredoka One', 'cursive']
      },
      borderRadius: {
        'DEFAULT': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px'
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(0, 173, 181, 0.4)',
        'glow-secondary': '0 0 15px rgba(238, 238, 238, 0.2)',
        'inner-subtle': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.25)',
        'primary-glow': '0 0 20px rgba(56, 189, 248, 0.5)',
        'green-glow': '0 0 20px rgba(74, 222, 128, 0.6)',
        'imposter-glow': '0 0 20px rgba(225, 29, 72, 0.6)',
        'civilian-glow': '0 0 20px rgba(34, 211, 238, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-bright': 'pulse-bright 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'confetti-fall': 'fall 5s linear infinite',
        'reveal': 'reveal 0.5s ease-out forwards',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'bg-pan': 'bg-pan 30s linear infinite',
        'button-pop': 'button-pop 0.3s ease-out forwards',
        'card-reveal': 'card-reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'fade-out': 'fade-out 0.5s ease-in forwards',
        'aurora': 'aurora 20s ease-in-out infinite',
        'aurora-2': 'aurora-2 25s ease-in-out infinite',
        'aurora-3': 'aurora-3 30s ease-in-out infinite'
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'pulse-bright': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
        'fall': {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        'reveal': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bg-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'button-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        'card-reveal': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)', visibility: 'hidden' }
        },
        'aurora': {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(0deg) scale(1)',
            opacity: '0.3'
          },
          '33%': { 
            transform: 'translateX(-50%) translateY(-60%) rotate(120deg) scale(1.1)',
            opacity: '0.5'
          },
          '66%': { 
            transform: 'translateX(-40%) translateY(-40%) rotate(240deg) scale(0.9)',
            opacity: '0.4'
          }
        },
        'aurora-2': {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(180deg) scale(0.8)',
            opacity: '0.2'
          },
          '50%': { 
            transform: 'translateX(-60%) translateY(-30%) rotate(300deg) scale(1.2)',
            opacity: '0.4'
          }
        },
        'aurora-3': {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(90deg) scale(1.1)',
            opacity: '0.25'
          },
          '25%': { 
            transform: 'translateX(-30%) translateY(-70%) rotate(180deg) scale(0.7)',
            opacity: '0.3'
          },
          '75%': { 
            transform: 'translateX(-70%) translateY(-20%) rotate(270deg) scale(1.3)',
            opacity: '0.35'
          }
        }
      }
    },
  },
  plugins: [],
}

export default config