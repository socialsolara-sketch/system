// Arquivo: src/assets/themes/index.js
// Descrição: Gerenciador de temas integrados, tipografia e paleta por módulo.

import lightTheme from './light'
import darkTheme from './dark'
import { getFont, defaultFont } from '../fonts'

// ==========================================
// Exportações de Temas
// ==========================================

export { lightTheme, darkTheme, defaultFont }

export const themes = {
  light: lightTheme,
  dark: darkTheme
}

export const defaultTheme = lightTheme

// ==========================================
// Utilitários de Temas e Tipografia
// ==========================================

export const getTheme = (themeName = 'light') => {
  return themes[themeName] || defaultTheme
}

export const getThemeWithFont = (themeName = 'light', fontName = defaultFont) => {
  const theme = getTheme(themeName)
  const font = getFont(fontName)
  
  return {
    ...theme,
    font: {
      name: font.name,
      family: font.family,
      sizes: font.sizes,
      weights: font.weights,
      lineHeights: font.lineHeights
    }
  }
}

// ==========================================
// Cores Específicas por Módulo
// ==========================================

export const moduleColors = {
  tuss: {
    primary: '#0079B8',
    accent: '#3DADFA',
    brand: '#00659A',
    headerColor: '#E3EEFB',
    cardAccent: '#E3EEFB',
    tableHeader: '#AFD3FA',
    actionButton: '#0079B8'
  },
  dut: {
    primary: '#10b981',
    accent: '#34d399',
    brand: '#059669',
    headerColor: '#d1fae5',
    cardAccent: '#d1fae5',
    tableHeader: '#a7f3d0',
    actionButton: '#059669'
  },
  usuario: {
    primary: '#7c3aed',
    accent: '#a78bfa',
    brand: '#6d28d9',
    headerColor: '#ede9fe',
    cardAccent: '#ede9fe',
    tableHeader: '#ddd6fe',
    actionButton: '#7c3aed'
  },
  system: {
    primary: '#0079B8',
    accent: '#3DADFA',
    brand: '#00659A',
    headerColor: '#E3EEFB',
    cardAccent: '#E3EEFB',
    tableHeader: '#AFD3FA',
    actionButton: '#0079B8'
  }
}

export const getModuleColors = (moduleName) => {
  return moduleColors[moduleName] || moduleColors.system
}

export default themes
