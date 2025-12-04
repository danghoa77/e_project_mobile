import { Platform } from 'react-native'

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFDFB',
    tint: '#262626',
    icon: '#78716C',
    tabIconDefault: '#A8A29E',
    tabIconSelected: '#262626',
  },
  dark: {
    text: '#F5F5F5',
    background: '#1B1A17',
    tint: '#262626',
    icon: '#A8A29E',
    tabIconDefault: '#78716C',
    tabIconSelected: '#262626',
  },
}

export const Fonts = Platform.select({
  ios: {
    sans: 'Manrope',
    serif: 'serif',
    rounded: 'Manrope',
    mono: 'OverpassMono',
  },
  default: {
    sans: 'Manrope',
    serif: 'serif',
    rounded: 'Manrope',
    mono: 'OverpassMono',
  },
  web: {
    sans: "Manrope, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "serif",
    rounded: "Manrope, sans-serif",
    mono: "OverpassMono, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
