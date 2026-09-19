// Arquivo: src/shared/layout/__Table.jsx
// Descrição: Componente de tabela com suporte a navegação por teclado, seleção de células e cópia de conteúdo.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { systemColors, textColors } from '@assets/colors'
import { useTheme } from '../context/ThemeContext'
import { useActionLock } from '../context/ActionLockContext'

// ==========================================
// Componente Table
// ==========================================

export default function Table({ columns = [], data = [], onRowClick, onRowContextMenu }) {
  const { currentTheme, isDark } = useTheme()
  const { isLocked, executeAction } = useActionLock()

  const [selectedCell, setSelectedCell] = useState(null)
  const [copiedNotification, setCopiedNotification] = useState(null)
  const tableContainerRef = useRef(null)
  const copyTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  // ==========================================
  // Definição de Cores e Tokens de Tabela
  // ==========================================

  const headerBg = currentTheme
    ? (currentTheme.colors.surfaceMuted || currentTheme.colors.backgroundSecondary || currentTheme.colors.header)
    : systemColors.neutral.gray50
  const rowHoverBg = currentTheme
    ? (currentTheme.colors.hover || 'rgba(255, 255, 255, 0.04)')
    : '#f8fafc'
  const gridLineColor = currentTheme
    ? (isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0')
    : '#e2e8f0'

  const selectionBorderColor = isDark ? '#ffffff' : '#2563eb'
  const selectionBgColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'

  // ==========================================
  // Utilitários de Extração e Cópia
  // ==========================================

  const getCellText = useCallback((row, column) => {
    if (!row || !column) return ''
    const val = row[column.key]
    if (typeof val === 'string' || typeof val === 'number') return String(val)

    const rendered = column.render ? column.render(val, row) : val
    if (typeof rendered === 'string' || typeof rendered === 'number') return String(rendered)

    if (rendered?.props?.children) {
      if (typeof rendered.props.children === 'string') return rendered.props.children
      if (Array.isArray(rendered.props.children)) {
        return rendered.props.children
          .map(c => (typeof c === 'string' ? c : (c?.props?.children || '')))
          .join('')
      }
    }
    return String(val ?? '')
  }, [])

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    } catch (err) {
      console.warn('Erro ao copiar célula:', err)
    }
  }

  const copyToClipboard = useCallback((text) => {
    if (!text && text !== 0) return

    const showFeedback = () => {
      setCopiedNotification(text)
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedNotification(null)
      }, 1800)
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text))
        .then(showFeedback)
        .catch(() => {
          fallbackCopy(String(text))
          showFeedback()
        })
    } else {
      fallbackCopy(String(text))
      showFeedback()
    }
  }, [])

  // ==========================================
  // Efeito de Atalhos de Teclado e Navegação
  // ==========================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCell || data.length === 0 || columns.length === 0) return

      const { row, col } = selectedCell

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        const selectedRow = data[row]
        const selectedColumn = columns[col]
        if (selectedRow && selectedColumn) {
          const textToCopy = getCellText(selectedRow, selectedColumn)
          copyToClipboard(textToCopy)
        }
        return
      }

      if (e.key === 'Escape') {
        setSelectedCell(null)
        return
      }

      let nextRow = row
      let nextCol = col
      let handled = false

      if (e.key === 'ArrowUp') {
        nextRow = Math.max(0, row - 1)
        handled = true
      } else if (e.key === 'ArrowDown') {
        nextRow = Math.min(data.length - 1, row + 1)
        handled = true
      } else if (e.key === 'ArrowLeft') {
        nextCol = Math.max(0, col - 1)
        handled = true
      } else if (e.key === 'ArrowRight') {
        nextCol = Math.min(columns.length - 1, col + 1)
        handled = true
      }

      if (handled) {
        e.preventDefault()
        setSelectedCell({ row: nextRow, col: nextCol })

        const cellElement = tableContainerRef.current?.querySelector(
          `[data-row="${nextRow}"][data-col="${nextCol}"]`
        )
        if (cellElement) {
          cellElement.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCell, data, columns, getCellText, copyToClipboard])

  // ==========================================
  // Efeito de Limpeza de Foco Externo
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(e.target)) {
        setSelectedCell(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleRowClick = (row) => {
    if (!onRowClick) return
    if (isLocked) return
    executeAction(() => {
      onRowClick(row)
    })
  }

  return (
    <div
      ref={tableContainerRef}
      tabIndex={0}
      className="system-scrollbar"
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: currentTheme ? currentTheme.colors.card : '#ffffff',
        position: 'relative',
        outline: 'none'
      }}
    >
      <table style={{
        width: '100%',
        minWidth: 'max-content',
        borderCollapse: 'collapse',
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{ backgroundColor: headerBg }}>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  padding: '0.875rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: currentTheme ? currentTheme.colors.textSecondary : textColors.secondary,
                  border: `1px solid ${gridLineColor}`,
                  maxWidth: column.maxWidth || '200px',
                  minWidth: column.minWidth || '110px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxSizing: 'border-box',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  backgroundColor: headerBg
                }}
                title={column.header}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? null : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || row.codigo || row.numero || rowIndex}
                onClick={() => handleRowClick(row)}
                onContextMenu={(e) => {
                  if (onRowContextMenu) {
                    e.preventDefault()
                    e.stopPropagation()
                    onRowContextMenu(e, row)
                  }
                }}
                style={{
                  cursor: onRowClick || onRowContextMenu ? 'pointer' : 'default',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = rowHoverBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {columns.map((column, colIndex) => {
                  const cellValue = column.render ? column.render(row[column.key], row) : row[column.key]
                  const rawStringValue = getCellText(row, column)
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex

                  return (
                    <td
                      key={colIndex}
                      data-row={rowIndex}
                      data-col={colIndex}
                      title={rawStringValue}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCell({ row: rowIndex, col: colIndex })
                      }}
                      style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.875rem',
                        color: currentTheme ? currentTheme.colors.textPrimary : textColors.primary,
                        border: `1px solid ${gridLineColor}`,
                        maxWidth: column.maxWidth || '200px',
                        minWidth: column.minWidth || '110px',
                        boxSizing: 'border-box',
                        cursor: 'cell',
                        userSelect: 'none',
                        position: 'relative',
                        backgroundColor: isSelected ? selectionBgColor : 'transparent',
                        boxShadow: isSelected ? `inset 0 0 0 2px ${selectionBorderColor}` : 'none',
                        transition: 'box-shadow 0.12s ease, background-color 0.12s ease'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: column.maxWidth || '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {cellValue}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {copiedNotification !== null && (
        <div
          style={{
            position: 'fixed',
            bottom: '65px',
            right: '24px',
            backgroundColor: isDark ? '#18181b' : '#0f172a',
            color: '#f8fafc',
            padding: '0.5rem 0.875rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '500',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 10000,
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Célula copiada: <strong>{copiedNotification.length > 28 ? `${copiedNotification.substring(0, 28)}...` : copiedNotification}</strong></span>
        </div>
      )}
    </div>
  )
}
