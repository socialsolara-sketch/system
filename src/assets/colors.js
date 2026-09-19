// Arquivo: src/assets/colors.js
// Descrição: Definições centrais de paleta de cores, temas e tokens do sistema.

// ==========================================
// Paleta Central do Sistema
// ==========================================

export const systemColors = {
  brand: {
    primary: '#0079B8',
    secondary: '#64748b',
    accent: '#3DADFA',
    light: '#AFD3FA',
    lighter: '#E3EEFB',
    dark: '#00659A',
    darker: '#004064',
    darkest: '#051F31'
  },

  functional: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },

  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#fbfbfb',
    gray100: '#EEEEEE',
    gray200: '#D9D9D9',
    gray300: '#D1D1D1',
    gray400: '#C1C1C1',
    gray500: '#A1A1A1',
    gray600: '#5A5A5A',
    gray700: '#4A4A4A',
    gray800: '#2B2B2B',
    gray900: '#202020',
    gray950: '#1C1C1C'
  },

  system: {
    header: '#ffffff',
    sidebar: '#ffffff',
    main: '#fbfbfb',
    card: '#ffffff',
    input: '#ffffff',
    button: '#0079B8',
    link: '#0079B8'
  },

  dark: {
    background: '#1C1C1C',
    surface: '#2B2B2B',
    text: '#F2F2F2',
    textSecondary: '#D9D9D9',
    border: '#3B3B3B'
  }
}

// ==========================================
// Tokens Semânticos
// ==========================================

export const semanticColors = {
  primary: systemColors.brand.primary,
  secondary: systemColors.brand.secondary,
  success: systemColors.functional.success,
  warning: systemColors.functional.warning,
  error: systemColors.functional.error,
  info: systemColors.functional.info
}

// ==========================================
// Tokens de Texto
// ==========================================

export const textColors = {
  primary: '#000000',
  secondary: '#A1A1A1',
  tertiary: '#C1C1C1',
  disabled: '#D1D1D1',
  inverse: '#ffffff'
}

// ==========================================
// Tokens de Fundo
// ==========================================

export const backgroundColors = {
  primary: '#fbfbfb',
  secondary: '#EEEEEE',
  tertiary: '#D9D9D9',
  dark: '#1C1C1C'
}

// ==========================================
// Tokens de Borda
// ==========================================

export const borderColors = {
  default: '#E5E5E5',
  hover: '#D9D9D9',
  focus: '#0079B8'
}

export default systemColors
