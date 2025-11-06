export const theme = {
  colors: {
    mint: '#44B090',
    sky: '#6CB1DA',
    coral: '#F39265',
    sunshine: '#FBC326',
    blush: '#F77FB2',
    navy: '#3B659F',
    cream: '#F9E8D4',
    paper: '#FBF2E7',
    ink: '#283247'
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '24px',
    xl: '36px'
  },
  shadow: {
    sm: '0 2px 6px rgba(0,0,0,0.06)',
    md: '0 6px 18px rgba(0,0,0,0.08)'
  }
} as const

export type Theme = typeof theme

