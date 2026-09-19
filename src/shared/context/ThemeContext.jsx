// Arquivo: src/shared/context/ThemeContext.jsx
// Descrição: Contexto e provedor de temas, tipografia e preferências visuais do sistema.

import { createContext, useContext, useState, useEffect, useCallback, useMemo, startTransition } from 'react'
import { getThemeWithFont, defaultFont } from '@themes'
import { getFont, fontSizes, fonts } from '@fonts'

// ==========================================
// Contexto de Tema
// ==========================================

export const ThemeContext = createContext()

const STORAGE_THEME_KEY = 'system_theme'
const STORAGE_FONT_KEY = 'system_font'
const STORAGE_FONT_SIZE_KEY = 'system_font_size'

// ==========================================
// Provedor de Tema
// ==========================================

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_THEME_KEY)
      if (saved === 'light' || saved === 'dark') return saved
    }
    return 'light'
  })

  const [font, setFontState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_FONT_KEY)
      if (saved && fonts[saved]) return saved
    }
    return defaultFont
  })

  const [fontSize, setFontSizeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_FONT_SIZE_KEY)
      if (saved && fontSizes[saved]) return saved
    }
    return 'medium'
  })

  // Usamos startTransition para marcar atualizações de tema como não-urgentes.
  // Isso evita o congelamento da UI durante re-renderizações massivas de componentes.
  const setTheme = useCallback((newTheme) => {
    const val = newTheme === 'dark' ? 'dark' : 'light'
    startTransition(() => {
      setThemeState(val)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_THEME_KEY, val)
      }
    })
  }, [])

  const toggleTheme = useCallback(() => {
    startTransition(() => {
      setThemeState((prev) => {
        const next = prev === 'light' ? 'dark' : 'light'
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_THEME_KEY, next)
        }
        return next
      })
    })
  }, [])

  const changeFont = useCallback((fontName) => {
    const val = fonts[fontName] ? fontName : defaultFont
    startTransition(() => {
      setFontState(val)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_FONT_KEY, val)
      }
    })
  }, [])

  const changeFontSize = useCallback((size) => {
    const val = fontSizes[size] ? size : 'medium'
    startTransition(() => {
      setFontSizeState(val)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_FONT_SIZE_KEY, val)
      }
    })
  }, [])

  const currentTheme = useMemo(() => getThemeWithFont(theme, font), [theme, font])
  const isDark = theme === 'dark'

  // ==========================================
  // Efeito de Aplicação de Estilos no DOM
  // ==========================================

  useEffect(() => {
    if (typeof document === 'undefined') return

    // Otimização: Agrupamos todas as mutações do DOM em um único ciclo.
    // Usamos requestAnimationFrame para garantir que a atualização ocorra antes do próximo frame,
    // evitando jank visual.
    const root = document.documentElement
    const body = document.body
    
    let rafId = requestAnimationFrame(() => {
      const fontConfig = getFont(font)
      const multipliers = { small: 14, medium: 16, large: 18 }
      const basePx = multipliers[fontSize] || 16

      // Curto-circuito: se o DOM já está exatamente com o tema, a fonte e a escala atuais,
      // não reescrevemos nada. Cada escrita gera recálculo de estilo e mutações observáveis
      // no documento — quanto menos escritas redundantes, mais fluida a interface.
      // Usamos lowercase para comparação de cores segura e trim para espaços.
      const alreadyApplied =
        root.getAttribute('data-theme') === theme &&
        root.style.getPropertyValue('--system-font-size-base').trim() === `${basePx}px` &&
        root.style.getPropertyValue('--system-font-family').replace(/['"]/g, '') === fontConfig.family.replace(/['"]/g, '') &&
        root.style.getPropertyValue('--system-text-primary').toLowerCase().trim() === currentTheme.colors.textPrimary.toLowerCase().trim()

      if (alreadyApplied) return
      
      root.setAttribute('data-theme', theme)
      root.style.fontSize = `${basePx}px`
      root.style.setProperty('--system-font-size-base', `${basePx}px`)
      root.style.setProperty('--system-font-family', fontConfig.family)
      body.style.fontFamily = fontConfig.family

      const colors = currentTheme.colors
      const vars = {
        '--system-bg': colors.background,
        '--system-surface': colors.surface,
        '--system-card-bg': colors.card,
        '--system-input-bg': colors.input,
        '--system-border': colors.border,
        '--system-text-primary': colors.textPrimary,
        '--system-text-secondary': colors.textSecondary,
        '--system-primary': colors.primary,
        '--system-primary-hover': colors.primaryHover
      }

      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })

      body.style.backgroundColor = colors.background
      body.style.color = colors.textPrimary
    })

    // Limpeza de recursos para evitar Memory Leaks se o componente for desmontado rapidamente
    return () => cancelAnimationFrame(rafId)
  }, [theme, font, fontSize, currentTheme])

  const resetThemeDefaults = useCallback(() => {
    setTheme('light')
    changeFont(defaultFont)
    changeFontSize('medium')
  }, [setTheme, changeFont, changeFontSize])

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    isDark,
    currentTheme,
    font,
    changeFont,
    fontSize,
    changeFontSize,
    resetThemeDefaults
  }), [
    theme,
    setTheme,
    toggleTheme,
    isDark,
    currentTheme,
    font,
    changeFont,
    fontSize,
    changeFontSize,
    resetThemeDefaults
  ])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// ==========================================
// Hook de Consumo de Tema
// ==========================================

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
