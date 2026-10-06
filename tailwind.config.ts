import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme.js'

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        surface: {
          DEFAULT: token('surface'),
          foreground: token('surface-foreground'),
        },
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
          subtle: token('primary-subtle'),
        },
        destructive: {
          DEFAULT: token('destructive'),
          foreground: token('destructive-foreground'),
        },
        success: {
          DEFAULT: token('success'),
          foreground: token('success-foreground'),
        },
        warning: {
          DEFAULT: token('warning'),
          foreground: token('warning-foreground'),
        },
        info: {
          DEFAULT: token('info'),
          foreground: token('info-foreground'),
        },
        score: {
          hot: token('score-hot'),
          warm: token('score-warm'),
          cold: token('score-cold'),
        },
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      fontFamily: {
        sans: ['"Inter Variable"', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        popover: '0 4px 16px -4px rgb(16 24 40 / 0.08), 0 2px 4px -2px rgb(16 24 40 / 0.04)',
        modal: '0 20px 40px -12px rgb(16 24 40 / 0.18)',
      },
    },
  },
  plugins: [],
}

export default config
