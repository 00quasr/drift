import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Premium color system
        'drift': {
          'bg': 'var(--color-bg)',
          'surface': 'var(--color-surface)',
          'surface-elevated': 'var(--color-surface-elevated)',
          'border': 'var(--color-border)',
          'border-hover': 'var(--color-border-hover)',
          'primary': 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          'secondary': 'var(--color-secondary)',
          'muted': 'var(--color-muted)',
          'text': 'var(--color-text)',
          'text-secondary': 'var(--color-text-secondary)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['11px', '16px'],
        'sm': ['13px', '20px'],
        'base': ['14px', '22px'],
        'lg': ['16px', '24px'],
        'xl': ['18px', '26px'],
        '2xl': ['24px', '32px'],
        '3xl': ['32px', '40px'],
        '4xl': ['40px', '48px'],
        '5xl': ['48px', '56px'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
