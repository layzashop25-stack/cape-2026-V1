/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        arabic:  ['Noto Sans Arabic', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // ── Brand color palette ─────────────────────────────────
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',   // primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark:  '#065f46',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark:  '#7f1d1d',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark:  '#78350f',
        },
      },

      // ── Spacing extras ──────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '72':  '18rem',
        '84':  '21rem',
        '96':  '24rem',
      },

      // ── Border radius ───────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ── Premium shadows ─────────────────────────────────────
      boxShadow: {
        'xs':      '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'soft':    '0 2px 8px -1px rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.06)',
        'card':    '0 4px 16px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 8px 32px -4px rgb(0 0 0 / 0.10), 0 4px 12px -4px rgb(0 0 0 / 0.06)',
        'float':   '0 20px 60px -10px rgb(0 0 0 / 0.15), 0 8px 24px -8px rgb(0 0 0 / 0.10)',
        'glow-blue':   '0 0 0 3px rgb(59 130 246 / 0.15), 0 4px 16px rgb(59 130 246 / 0.25)',
        'glow-green':  '0 0 0 3px rgb(16 185 129 / 0.15), 0 4px 16px rgb(16 185 129 / 0.25)',
        'glow-purple': '0 0 0 3px rgb(139 92 246 / 0.15), 0 4px 16px rgb(139 92 246 / 0.25)',
        'inner-soft':  'inset 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        // 3D depth shadows
        '3d-sm': '0 2px 0 rgb(0 0 0 / 0.12), 0 4px 8px rgb(0 0 0 / 0.08)',
        '3d-md': '0 4px 0 rgb(0 0 0 / 0.10), 0 8px 20px rgb(0 0 0 / 0.10)',
        '3d-lg': '0 6px 0 rgb(0 0 0 / 0.08), 0 12px 32px rgb(0 0 0 / 0.12)',
      },

      // ── Backdrop blur ───────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ── Animations ──────────────────────────────────────────
      keyframes: {
        'fade-in':      { from: { opacity: '0' },                                          to: { opacity: '1' } },
        'fade-out':     { from: { opacity: '1' },                                          to: { opacity: '0' } },
        'slide-up':     { from: { opacity: '0', transform: 'translateY(20px)' },           to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-down':   { from: { opacity: '0', transform: 'translateY(-20px)' },          to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-r':   { from: { opacity: '0', transform: 'translateX(24px)' },           to: { opacity: '1', transform: 'translateX(0)' } },
        'slide-in-l':   { from: { opacity: '0', transform: 'translateX(-24px)' },          to: { opacity: '1', transform: 'translateX(0)' } },
        'scale-in':     { from: { opacity: '0', transform: 'scale(0.92)' },                to: { opacity: '1', transform: 'scale(1)' } },
        'scale-out':    { from: { opacity: '1', transform: 'scale(1)' },                   to: { opacity: '0', transform: 'scale(0.92)' } },
        'bounce-in':    { '0%': { opacity: '0', transform: 'scale(0.8)' }, '60%': { transform: 'scale(1.05)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'float':        { '0%,100%': { transform: 'translateY(0px)' },                     '50%': { transform: 'translateY(-8px)' } },
        'float-slow':   { '0%,100%': { transform: 'translateY(0px)' },                     '50%': { transform: 'translateY(-4px)' } },
        'pulse-glow':   { '0%,100%': { boxShadow: '0 0 0 0 rgb(59 130 246 / 0.4)' },      '50%': { boxShadow: '0 0 0 12px rgb(59 130 246 / 0)' } },
        'shimmer':      { from: { backgroundPosition: '-200% 0' },                         to: { backgroundPosition: '200% 0' } },
        'spin-slow':    { from: { transform: 'rotate(0deg)' },                             to: { transform: 'rotate(360deg)' } },
        'toast-in':     { from: { opacity: '0', transform: 'translateY(16px) scale(0.95)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'toast-out':    { from: { opacity: '1', transform: 'translateY(0) scale(1)' },     to: { opacity: '0', transform: 'translateY(-8px) scale(0.95)' } },
        // 3D keyframes
        'tilt-in':      { from: { opacity: '0', transform: 'perspective(600px) rotateX(12deg) translateY(16px)' }, to: { opacity: '1', transform: 'perspective(600px) rotateX(0deg) translateY(0)' } },
        'flip-in':      { from: { opacity: '0', transform: 'perspective(800px) rotateY(-20deg)' }, to: { opacity: '1', transform: 'perspective(800px) rotateY(0deg)' } },
        'depth-rise':   { from: { opacity: '0', transform: 'perspective(600px) translateZ(-40px)' }, to: { opacity: '1', transform: 'perspective(600px) translateZ(0)' } },
      },

      animation: {
        'fade-in':    'fade-in 0.4s ease-out both',
        'fade-out':   'fade-out 0.3s ease-in both',
        'slide-up':   'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-r': 'slide-in-r 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-l': 'slide-in-l 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':   'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'scale-out':  'scale-out 0.2s ease-in both',
        'bounce-in':  'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'float':      'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'spin-slow':  'spin-slow 8s linear infinite',
        'toast-in':   'toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'toast-out':  'toast-out 0.25s ease-in forwards',
        // 3D
        'tilt-in':    'tilt-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'flip-in':    'flip-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'depth-rise': 'depth-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },

      // ── Transition timing ───────────────────────────────────
      transitionTimingFunction: {
        'spring':      'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':      'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-out':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ── Background gradients (as bg-* utilities) ────────────
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-blue':         'radial-gradient(at 40% 20%, hsla(217,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.2) 0px, transparent 50%)',
        'shimmer-gradient':  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
