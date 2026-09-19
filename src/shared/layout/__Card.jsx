// Arquivo: src/shared/layout/__Card.jsx
// Descrição: Contêiner de cartão padronizado com cabeçalho opcional, ações e corpo estilizado.

import { systemColors, textColors } from '@assets/colors'
import { useTheme } from '../context/ThemeContext'

// ==========================================
// Componente Card
// ==========================================

export default function Card({ title, children, actions = [], footer, style = {} }) {
  const { currentTheme } = useTheme()
  const borderColor = currentTheme?.colors?.border || systemColors.neutral.gray200

  return (
    <div style={{
      backgroundColor: currentTheme ? currentTheme.colors.card : systemColors.system.card,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: '0.375rem',
      boxShadow: 'none',
      overflow: 'visible',
      ...style
    }}>
      {(title || actions.length > 0) && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {title && (
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: currentTheme ? currentTheme.colors.textPrimary : textColors.primary,
              margin: 0
            }}>
              {title}
            </h2>
          )}
          {actions.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {actions}
            </div>
          )}
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
      {footer && (
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: currentTheme?.colors?.surfaceHover || 'rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          {footer}
        </div>
      )}
    </div>
  )
}
