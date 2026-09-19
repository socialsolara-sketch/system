// Arquivo: src/assets/fonts.js
// Descrição: Configurações de tipografia, famílias de fontes e utilitários de escala do sistema.

// ==========================================
// Definições de Famílias de Fonte
// ==========================================

export const fonts = {
  system: {
    id: 'system',
    name: 'Sistema (Padrão)',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  inter: {
    id: 'inter',
    name: 'Inter',
    family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  roboto: {
    id: 'roboto',
    name: 'Roboto',
    family: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  openSans: {
    id: 'openSans',
    name: 'Open Sans',
    family: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  poppins: {
    id: 'poppins',
    name: 'Poppins',
    family: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  montserrat: {
    id: 'montserrat',
    name: 'Montserrat',
    family: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  }
}

// ==========================================
// Constantes e Escalas
// ==========================================

export const defaultFont = 'system'

export const fontSizes = {
  small: 0.875,
  medium: 1,
  large: 1.125
}

// ==========================================
// Funções Utilitárias de Tipografia
// ==========================================

export const getFont = (fontName = defaultFont) => {
  return fonts[fontName] || fonts[defaultFont]
}

export const getFontFamily = (fontName = defaultFont) => {
  const font = getFont(fontName)
  return font.family
}

export const getFontSize = (fontName = defaultFont, size = 'base') => {
  const font = getFont(fontName)
  return font.sizes[size] || font.sizes.base
}

export const getFontWeight = (fontName = defaultFont, weight = 'normal') => {
  const font = getFont(fontName)
  return font.weights[weight] || font.weights.normal
}

export const getLineHeight = (fontName = defaultFont, lineHeight = 'normal') => {
  const font = getFont(fontName)
  return font.lineHeights[lineHeight] || font.lineHeights.normal
}

export const getScaledFontSize = (baseSize, multiplier = fontSizes.medium) => {
  const numericValue = parseFloat(baseSize)
  return `${numericValue * multiplier}rem`
}

export const availableFonts = Object.keys(fonts).map(key => ({
  id: key,
  name: fonts[key].name,
  family: fonts[key].family
}))

export default fonts
