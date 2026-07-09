/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0A0F',
          secondary: '#12121A',
          tertiary: '#1A1A2E',
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        accent: {
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          'purple-dark': '#7C3AED',
          blue: '#06B6D4',
          'blue-light': '#22D3EE',
          'blue-dark': '#0891B2',
          neon: '#00F5FF',
        },
        status: {
          danger: '#EF4444',
          'danger-light': '#FCA5A5',
          warning: '#F59E0B',
          'warning-light': '#FCD34D',
          success: '#10B981',
          'success-light': '#6EE7B7',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          muted: '#475569',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.1)',
          'glass-light': 'rgba(255, 255, 255, 0.15)',
        },
      },
      fontFamily: {
        'inter-thin': ['Inter_100Thin'],
        'inter-light': ['Inter_300Light'],
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        'inter-extrabold': ['Inter_800ExtraBold'],
        'inter-black': ['Inter_900Black'],
        'space-regular': ['SpaceGrotesk_400Regular'],
        'space-medium': ['SpaceGrotesk_500Medium'],
        'space-bold': ['SpaceGrotesk_700Bold'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
