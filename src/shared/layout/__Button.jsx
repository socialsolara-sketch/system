// Arquivo: src/shared/layout/__Button.jsx
// Descrição: Componente de botão padronizado com variantes visuais, tamanhos e estados interativos.

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { systemColors, semanticColors } from '@assets/colors'
import { useTheme } from '../context/ThemeContext'

// ==========================================
// Componente Button
// ==========================================

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  to,
  type = 'button', 
  style = {} 
}) {
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isMountedRef = useRef(true)
  // Guard local de reentrada: substitui a trava global (que desabilitava TODOS os botões da tela)
  const isExecutingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ==========================================
  // Definição de Variantes e Cores
  // ==========================================

  const variants = {
    primary: {
      backgroundColor: disabled
        ? (isDark ? '#3f3f46' : '#cbd5e1')
        : (currentTheme?.colors?.primary || systemColors.brand.primary),
      color: '#ffffff',
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent',
      hover: disabled
        ? (isDark ? '#3f3f46' : '#cbd5e1')
        : (currentTheme?.colors?.primaryHover || systemColors.brand.secondary)
    },
    secondary: {
      backgroundColor: disabled
        ? (isDark ? '#27272a' : '#f1f5f9')
        : (isDark ? '#27272a' : '#f8fafc'),
      color: disabled
        ? (isDark ? '#71717a' : '#94a3b8')
        : (isDark ? '#f4f4f5' : '#1e293b'),
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isDark ? '#3f3f46' : '#e2e8f0',
      hover: disabled
        ? (isDark ? '#27272a' : '#f1f5f9')
        : (isDark ? '#3f3f46' : '#e2e8f0')
    },
    success: {
      backgroundColor: disabled ? (isDark ? '#3f3f46' : '#cbd5e1') : semanticColors.success,
      color: '#ffffff',
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent',
      hover: disabled ? (isDark ? '#3f3f46' : '#cbd5e1') : '#16a34a'
    },
    warning: {
      backgroundColor: disabled ? (isDark ? '#3f3f46' : '#cbd5e1') : (currentTheme?.colors?.warning || '#f59e0b'),
      color: '#ffffff',
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent',
      hover: disabled ? (isDark ? '#3f3f46' : '#cbd5e1') : (currentTheme?.colors?.warningHover || '#d97706')
    },
    danger: {
      backgroundColor: disabled ? (isDark ? '#3f3f46' : '#cbd5e1') : semanticColors.error,
      color: '#ffffff',
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent',
      hover: disabled ? (isDark ? '#3f3f46' : '#cbd5e1') : '#dc2626'
    }
  }

  // ==========================================
  // Definição de Tamanhos e Espaçamentos
  // ==========================================

  const sizes = {
    small: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
    medium: { padding: '0.625rem 1.25rem', fontSize: '0.875rem' },
    large: { padding: '0.875rem 1.75rem', fontSize: '1rem' }
  }

  const currentVariant = variants[variant] || variants.primary
  const currentSize = sizes[size] || sizes.medium

  // Apenas o próprio botão controla seu estado visual de bloqueio.
  // O `isLocked` global NÃO desabilita mais todos os botões da tela (isso era o que
  // deixava "Cancelar"/"Salvar" cinzas e sem resposta após qualquer clique).
  const isBtnDisabled = disabled || isLoading

  const currentBg = !isBtnDisabled && isHovered && currentVariant.hover
    ? currentVariant.hover
    : currentVariant.backgroundColor

  const handleClick = (e) => {
    if (isBtnDisabled || isExecutingRef.current) {
      e?.preventDefault()
      e?.stopPropagation()
      return
    }

    if (to) {
      isExecutingRef.current = true
      try {
        navigate(to)
      } finally {
        isExecutingRef.current = false
      }
      return
    }

    if (!onClick) return

    isExecutingRef.current = true

    let result
    try {
      result = onClick(e)
    } catch (error) {
      isExecutingRef.current = false
      console.error('Erro ao executar ação do botão:', error)
      return
    }

    // O estado de carregamento só aparece quando a ação é realmente assíncrona.
    // Antes, todo clique ficava bloqueado por 500ms mesmo em ações síncronas
    // (abrir modal, trocar aba, cancelar) — era isso que dava a sensação de travamento.
    if (result instanceof Promise) {
      setIsLoading(true)
      result
        .catch((error) => {
          console.error('Erro ao executar ação do botão:', error)
        })
        .finally(() => {
          isExecutingRef.current = false
          if (isMountedRef.current) {
            setIsLoading(false)
          }
        })
    } else {
      isExecutingRef.current = false
    }
  }

  return (
    <button
      type={type}
      disabled={isBtnDisabled}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...currentSize,
        backgroundColor: currentBg,
        color: currentVariant.color,
        borderWidth: currentVariant.borderWidth,
        borderStyle: currentVariant.borderStyle,
        borderColor: currentVariant.borderColor,
        borderRadius: '0.375rem',
        cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
        opacity: isBtnDisabled ? 0.7 : 1,
        fontWeight: '500',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style
      }}
    >
      {isLoading && (
        <svg 
          className="animate-spin h-4 w-4 mr-1 inline-block" 
          fill="none" 
          viewBox="0 0 24 24"
          style={{ width: '1em', height: '1em' }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
