// Arquivo: src/shared/layout/__Badge.jsx
// Descrição: Componente de selo (badge) para exibição de status e rótulos curtos.

import { useTheme } from '../context/ThemeContext'
import { systemColors } from '@assets/colors'

export default function Badge({ label, color = 'gray', style = {} }) {
  const { currentTheme } = useTheme()
  const isDark = currentTheme?.name === 'dark'

  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return {
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
          color: isDark ? '#4ade80' : '#166534',
          border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#BBF7D0'}`
        }
      case 'warning':
        return {
          backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3',
          color: isDark ? '#facc15' : '#854d0e',
          border: `1px solid ${isDark ? 'rgba(234, 179, 8, 0.3)' : '#FEF08A'}`
        }
      case 'error':
        return {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
          color: isDark ? '#f87171' : '#991b1b',
          border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'}`
        }
      case 'info':
        return {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
          color: isDark ? '#60a5fa' : '#1e40af',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'}`
        }
      case 'gray':
      default:
        return {
          backgroundColor: isDark ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6',
          color: isDark ? '#9ca3af' : '#374151',
          border: `1px solid ${isDark ? 'rgba(107, 114, 128, 0.3)' : '#E5E7EB'}`
        }
    }
  }

  const baseStyles = getColorStyles()

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        lineHeight: '1.25rem',
        whiteSpace: 'nowrap',
        ...baseStyles,
        ...style
      }}
    >
      {label}
    </span>
  )
}
