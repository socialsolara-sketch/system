// Arquivo: src/shared/layout/__ContextMenu.jsx
// Descrição: Componente shared de Menu de Contexto (botão direito) flutuante com ações de Visualizar, Editar e Deletar.

import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ContextMenu({
  x = 0,
  y = 0,
  visible = false,
  onClose,
  onView,
  onViewAcordos,
  onEdit,
  onDelete,
  itemTitle = ''
}) {
  const { currentTheme, isDark } = useTheme()
  const menuRef = useRef(null)

  // ==========================================
  // Efeito de Fechamento por Clique / Tecla Esc
  // ==========================================

  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose()
      }
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose && onClose()
      }
    }

    const handleScroll = () => {
      onClose && onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [visible, onClose])

  if (!visible) return null

  // Ajuste de posição para evitar sair da tela
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  const menuWidth = 190
  const menuHeight = 200

  const adjustedX = x + menuWidth > windowWidth ? Math.max(10, windowWidth - menuWidth - 15) : x
  const adjustedY = y + menuHeight > windowHeight ? Math.max(10, y - menuHeight) : y

  const bgColor = isDark ? '#1e293b' : '#ffffff'
  const textColor = isDark ? '#f8fafc' : '#1e293b'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'
  const hoverBgColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: textColor,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.12s ease, color 0.12s ease'
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
        width: `${menuWidth}px`,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        boxShadow: isDark
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        padding: '0.375rem',
        zIndex: 99999,
        animation: 'fadeIn 0.12s ease-out'
      }}
    >
      {itemTitle && (
        <div
          style={{
            padding: '0.375rem 0.875rem 0.375rem 0.875rem',
            fontSize: '0.6875rem',
            fontWeight: '700',
            color: isDark ? '#94a3b8' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${borderColor}`,
            marginBottom: '0.25rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {itemTitle}
        </div>
      )}

      {onView && (
        <button
          onClick={() => {
            onView()
            onClose && onClose()
          }}
          style={itemStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBgColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Visualizar</span>
        </button>
      )}

      {onViewAcordos && (
        <button
          onClick={() => {
            onViewAcordos()
            onClose && onClose()
          }}
          style={itemStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBgColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={currentTheme?.colors?.primary || (isDark ? '#60a5fa' : '#2563eb')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span style={{ fontWeight: '600' }}>Ver Acordos</span>
        </button>
      )}

      {onEdit && (
        <button
          onClick={() => {
            onEdit()
            onClose && onClose()
          }}
          style={itemStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBgColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Editar</span>
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => {
            onDelete()
            onClose && onClose()
          }}
          style={{
            ...itemStyle,
            color: '#ef4444'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span>Deletar</span>
        </button>
      )}
    </div>
  )
}
