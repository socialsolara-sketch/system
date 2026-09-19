// Arquivo: src/shared/layout/__ToastContainer.jsx
// Descrição: Contêiner e renderizador de notificações flutuantes (toasts) com limite de pilha e animações de saída.

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { useNotification, useTheme } from '@shared/context'

// ==========================================
// Configuração Visual dos Tipos de Toast
// ==========================================

const typeConfig = {
  success: {
    icon: CheckCircle2,
    accentColor: '#22c55e'
  },
  error: {
    icon: AlertCircle,
    accentColor: '#ef4444'
  },
  warning: {
    icon: AlertTriangle,
    accentColor: '#f59e0b'
  },
  info: {
    icon: Info,
    accentColor: '#0ea5e9'
  }
}

// ==========================================
// Componente de Item Toast Individual
// ==========================================

const ToastItem = ({ toast, onDismiss }) => {
  const { currentTheme, isDark } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const config = typeConfig[toast.type] || typeConfig.info
  const IconComponent = config.icon
  const remainingTimeRef = useRef(toast.duration || 4500)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const exitTimerRef = useRef(null)
  const evictionTriggeredRef = useRef(false)

  // ==========================================
  // Handlers de Descarte e Saída
  // ==========================================

  const handleDismissRight = useCallback(() => {
    setIsExiting(true)
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    exitTimerRef.current = setTimeout(() => {
      onDismiss(toast.id)
    }, 280)
  }, [onDismiss, toast.id])

  const handleEvictRight = useCallback(() => {
    if (evictionTriggeredRef.current) return
    evictionTriggeredRef.current = true
    setIsExiting(true)
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    exitTimerRef.current = setTimeout(() => {
      onDismiss(toast.id)
    }, 320)
  }, [onDismiss, toast.id])

  // ==========================================
  // Efeitos de Animação e Temporização
  // ==========================================

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (toast.isEvicted || toast.exitDirection === 'right') {
      handleEvictRight()
    }
  }, [toast.isEvicted, toast.exitDirection, handleEvictRight])

  useEffect(() => {
    if (toast.duration === 0 || toast.isEvicted) return

    if (!isHovered && !isExiting) {
      startTimeRef.current = Date.now()
      timerRef.current = setTimeout(() => {
        handleDismissRight()
      }, remainingTimeRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isHovered, isExiting, toast.duration, toast.isEvicted, handleDismissRight])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (timerRef.current && startTimeRef.current) {
      clearTimeout(timerRef.current)
      const elapsed = Date.now() - startTimeRef.current
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // ==========================================
  // Renderização e Tokens de Estilo
  // ==========================================

  const bg = isDark
    ? (currentTheme?.colors?.card || '#262626')
    : '#ffffff'
  const textColor = isDark ? '#f4f4f5' : '#0f172a'
  const mutedText = isDark ? '#a1a1aa' : '#64748b'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'

  let transform = 'translateY(14px) scale(0.96)'
  let opacity = 0

  if (isMounted && !isExiting) {
    transform = 'translateX(0) translateY(0) scale(1)'
    opacity = 1
  } else if (isExiting) {
    transform = 'translateX(130%) translateY(-4px) scale(0.92)'
    opacity = 0
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '340px',
        maxWidth: 'calc(100vw - 2rem)',
        backgroundColor: bg,
        color: textColor,
        borderRadius: '8px',
        borderTop: `1px solid ${borderColor}`,
        borderRight: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${config.accentColor}`,
        boxShadow: isDark
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        pointerEvents: isExiting ? 'none' : 'auto',
        opacity,
        transform,
        transition: isExiting
          ? 'transform 0.32s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease, box-shadow 0.2s ease'
          : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform, opacity'
      }}
    >
      <div style={{
        marginTop: '2px',
        flexShrink: 0,
        color: config.accentColor
      }}>
        <IconComponent size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            lineHeight: '1.25',
            marginBottom: toast.message ? '0.25rem' : 0,
            color: textColor
          }}>
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div style={{
            fontSize: '0.8125rem',
            color: mutedText,
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {toast.message}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismissRight}
        aria-label="Fechar notificação"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: mutedText,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'color 0.15s ease, background-color 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = textColor
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = mutedText
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ==========================================
// Componente ToastContainer
// ==========================================

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotification()

  if (!toasts || toasts.length === 0) return null

  return (
    <aside
      aria-label="Notificações do sistema"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </aside>
  )
}
