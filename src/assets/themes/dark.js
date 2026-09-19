// Arquivo: src/assets/themes/dark.js
// Descrição: Configuração do tema escuro do sistema.

// ==========================================
// Tema Escuro
// ==========================================

export const darkTheme = {
  name: 'dark',
  colors: {
    primary: '#0079B8',
    primaryHover: '#00659A',
    primaryLight: '#3DADFA',
    primaryLighter: '#AFD3FA',
    primaryLightest: '#E3EEFB',
    primaryDarker: '#004064',
    primaryDarkest: '#051F31',

    secondary: '#94a3b8',
    secondaryHover: '#64748b',

    success: '#22c55e',
    successHover: '#16a34a',
    warning: '#f59e0b',
    warningHover: '#d97706',
    error: '#ef4444',
    errorHover: '#dc2626',
    info: '#3b82f6',
    infoHover: '#2563eb',

    background: '#1C1C1C',
    backgroundSecondary: '#202020',
    backgroundTertiary: '#2B2B2B',

    surface: '#2B2B2B',
    surfaceHover: '#4A4A4A',

    textPrimary: '#F2F2F2',
    textSecondary: '#D9D9D9',
    textTertiary: '#A1A1A1',
    textDisabled: '#5A5A5A',

    border: '#3B3B3B',
    borderHover: '#4A4A4A',
    borderFocus: '#0079B8',

    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',

    header: '#202020',
    sidebar: '#202020',
    main: '#1C1C1C',
    card: '#2B2B2B',
    input: '#2B2B2B',
    button: '#0079B8',
    buttonHover: '#00659A',
    link: '#3DADFA',
    linkHover: '#AFD3FA'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  }
}

export default darkTheme
