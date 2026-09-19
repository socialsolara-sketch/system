// Arquivo: src/shared/layout/__ConfirmationModal.jsx
// Descrição: Componente reutilizável de modal de confirmação com estilização padronizada.

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '../context/ThemeContext'
import { AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react'
import Button from './__Button'

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'warning',
  style = {}
}) {
  const { currentTheme, isDark } = useTheme()
  const constraintsRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel && onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const variantConfig = {
    danger: {
      icon: <AlertTriangle size={20} color={currentTheme?.colors?.error} />,
      buttonVariant: 'danger'
    },
    warning: {
      icon: <AlertTriangle size={20} color={currentTheme?.colors?.primary} />,
      buttonVariant: 'primary'
    },
    success: {
      icon: <CheckCircle size={20} color={currentTheme?.colors?.primary} />,
      buttonVariant: 'primary'
    },
    info: {
      icon: <HelpCircle size={20} color={currentTheme?.colors?.primary} />,
      buttonVariant: 'primary'
    }
  }

  const activeConfig = variantConfig[variant] || variantConfig.warning
  const borderColor = currentTheme?.colors?.border || '#cbd5e1'

  return (
    <div
      ref={constraintsRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden'
      }}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: currentTheme?.colors?.card || '#ffffff',
          borderRadius: '0.5rem',
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'auto',
          ...style
        }}
      >
        <div 
          style={{
            padding: '1rem 1.25rem',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'grab'
          }}
          onMouseDown={(e) => e.target.style.cursor = 'grabbing'}
          onMouseUp={(e) => e.target.style.cursor = 'grab'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeConfig.icon}
            <h3 style={{
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: currentTheme?.colors?.textPrimary || '#0f172a',
              margin: 0
            }}>
              {title}
            </h3>
          </div>
          
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: currentTheme?.colors?.textSecondary || '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {children || (
            <p style={{
              fontSize: '0.875rem',
              color: currentTheme?.colors?.textSecondary || '#64748b',
              lineHeight: '1.5',
              margin: 0
            }}>
              {description}
            </p>
          )}
        </div>

        <div style={{
          padding: '1rem 1.25rem',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem'
        }}>
          <Button variant="secondary" onClick={onCancel} size="small">
            {cancelText}
          </Button>
          <Button variant={activeConfig.buttonVariant} onClick={onConfirm} size="small">
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
