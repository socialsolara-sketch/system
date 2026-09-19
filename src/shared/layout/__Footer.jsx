// Arquivo: src/shared/layout/__Footer.jsx
// Descrição: Componente de rodapé com suporte a controles de paginação centralizados e texto informativo.

import { useLocation } from 'react-router-dom'
import { systemColors, textColors } from '@assets/colors'
import { useTheme, usePagination, useActionLock } from '../context'
import ChatWidget from './__ChatWidget'

// ==========================================
// Componente Footer
// ==========================================

export default function Footer({ text = '© 2024 System. Todos os direitos reservados.' }) {
  const { currentTheme, isDark } = useTheme()
  const { isLocked, executeAction } = useActionLock()
  const location = useLocation()
  const pagination = usePagination()

  // ==========================================
  // Determinação de Estado de Paginação
  // ==========================================

  const isTussOrDut = location.pathname.startsWith('/tuss') || location.pathname.startsWith('/dut') || pagination.visible
  const isHome = location.pathname === '/'
  const showTablePagination = isTussOrDut && !isHome

  const defaultTotal = location.pathname.startsWith('/tuss') ? 5 : (location.pathname.startsWith('/dut') ? 3 : 1)
  const totalPages = pagination.totalPages || defaultTotal
  const currentPage = pagination.currentPage || 1

  // ==========================================
  // Handlers de Navegação de Página
  // ==========================================

  const handlePrev = () => {
    if (isLocked) return
    if (currentPage > 1) {
      executeAction(() => {
        if (pagination.onPageChange) {
          pagination.onPageChange(currentPage - 1)
        } else if (pagination.setPagination) {
          pagination.setPagination({ currentPage: currentPage - 1 })
        }
      })
    }
  }

  const handleNext = () => {
    if (isLocked) return
    if (currentPage < totalPages) {
      executeAction(() => {
        if (pagination.onPageChange) {
          pagination.onPageChange(currentPage + 1)
        } else if (pagination.setPagination) {
          pagination.setPagination({ currentPage: currentPage + 1 })
        }
      })
    }
  }

  // ==========================================
  // Tokens Visuais e Estilos
  // ==========================================

  const textColor = currentTheme ? currentTheme.colors.textPrimary : textColors.primary
  const mutedColor = currentTheme ? currentTheme.colors.textSecondary : textColors.secondary
  const borderColor = currentTheme?.colors?.border || systemColors.neutral.gray200

  const buttonStyle = (disabled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: disabled ? (isDark ? '#52525b' : '#cbd5e1') : textColor,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 0.85,
    transition: 'opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease'
  })

  return (
    <footer style={{
      height: '50px',
      minHeight: '50px',
      maxHeight: '50px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      margin: 0,
      backgroundColor: currentTheme ? currentTheme.colors.header : systemColors.system.header,
      borderTop: `1px solid ${borderColor}`,
      color: mutedColor,
      fontSize: '0.8125rem',
      position: 'relative',
      zIndex: 40
    }}>
      {/* Lado Esquerdo - Espaçador para balancear o layout central */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }} />

      {/* Centro - Paginação ou Texto Informativo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showTablePagination ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            userSelect: 'none'
          }}>
            <button
              type="button"
              aria-label="Página anterior"
              disabled={currentPage <= 1}
              onClick={handlePrev}
              style={buttonStyle(currentPage <= 1)}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.opacity = currentPage <= 1 ? '0.35' : '0.85'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              letterSpacing: '0.08em',
              fontVariantNumeric: 'tabular-nums',
              color: textColor,
              opacity: 0.85
            }}>
              {currentPage} DE {totalPages}
            </span>
            <button
              type="button"
              aria-label="Próxima página"
              disabled={currentPage >= totalPages}
              onClick={handleNext}
              style={buttonStyle(currentPage >= totalPages)}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.opacity = currentPage >= totalPages ? '0.35' : '0.85'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : (
          <span style={{ opacity: 0.85 }}>{text}</span>
        )}
      </div>

      {/* Lado Direito - Botão e Caixa Flat de Chat Integrados no Rodapé */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <ChatWidget />
      </div>
    </footer>
  )
}

