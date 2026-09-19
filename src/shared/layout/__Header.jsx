// Arquivo: src/shared/layout/__Header.jsx
// Descrição: Componente de cabeçalho com título, barra de busca rápida integrada e dropdown de filtros.

import { useState, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { systemColors, textColors } from '@assets/colors'
import { useTheme } from '../context/ThemeContext'

// ==========================================
// Componente Header
// ==========================================

export default function Header({
  title,
  subtitle,
  searchPlaceholder = '',
  searchValue,
  onSearchChange,
  onFilterClick,
  filterOptions = [],
  activeFilter,
  onSelectFilter,
  actions,
  showSearchAndFilter = true
}) {
  const { currentTheme, isDark } = useTheme()

  const [internalSearch, setInternalSearch] = useState('')
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const filterDropdownRef = useRef(null)

  const currentSearch = searchValue !== undefined ? searchValue : internalSearch
  const borderColor = currentTheme?.colors?.border || (isDark ? 'rgba(255, 255, 255, 0.12)' : systemColors.neutral.gray200)
  const inputBg = currentTheme ? (currentTheme.colors.input || (isDark ? '#27272a' : '#ffffff')) : '#ffffff'
  const textColor = currentTheme ? currentTheme.colors.textPrimary : textColors.primary
  const mutedColor = currentTheme ? currentTheme.colors.textSecondary : textColors.secondary

  // ==========================================
  // Handlers de Busca e Filtro
  // ==========================================

  const handleSearchChange = (e) => {
    const val = e.target.value
    if (searchValue === undefined) {
      setInternalSearch(val)
    }
    if (onSearchChange) {
      onSearchChange(val)
    }
  }

  const handleClearSearch = () => {
    if (searchValue === undefined) {
      setInternalSearch('')
    }
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  const toggleFilter = () => {
    if (onFilterClick) {
      onFilterClick()
    } else {
      setIsFilterDropdownOpen(prev => !prev)
    }
  }

  // ==========================================
  // Efeito de Fechamento ao Clicar Fora
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header style={{
      margin: 0,
      padding: '0.875rem 1.5rem',
      minHeight: '56px',
      backgroundColor: currentTheme ? currentTheme.colors.main : systemColors.system.main,
      borderBottom: `1px solid ${borderColor}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: textColor,
          margin: 0,
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {title}
        </h1>
      </div>

      {showSearchAndFilter ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '230px'
          }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                color: mutedColor,
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={currentSearch}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 26px 0 32px',
                fontSize: '0.8125rem',
                color: textColor,
                backgroundColor: inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = currentTheme?.colors?.border || (isDark ? '#4b5563' : '#94a3b8')
              }}
              onBlur={(e) => {
                e.target.style.borderColor = borderColor
              }}
            />
            {currentSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Limpar busca"
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: mutedColor,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div style={{
            width: '1px',
            height: '22px',
            backgroundColor: borderColor,
            margin: '0 0.125rem'
          }} />

          <div style={{ position: 'relative' }} ref={filterDropdownRef}>
            <button
              type="button"
              onClick={toggleFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                height: '34px',
                padding: '0 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: textColor,
                backgroundColor: isFilterDropdownOpen ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') : inputBg,
                border: `1px solid ${isFilterDropdownOpen || activeFilter ? (isDark ? '#4b5563' : '#cbd5e1') : borderColor}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Filtros</span>
              {activeFilter && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? '#ffffff' : '#2563eb'
                }} />
              )}
            </button>

            {isFilterDropdownOpen && filterOptions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                minWidth: '160px',
                backgroundColor: currentTheme ? currentTheme.colors.card : '#ffffff',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.1)',
                padding: '0.375rem',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <div style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: mutedColor,
                  padding: '0.375rem 0.625rem'
                }}>
                  Filtrar por Status
                </div>
                {filterOptions.map((opt) => {
                  const isSelected = activeFilter === opt.value || (!activeFilter && opt.value === 'todos')
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        if (onSelectFilter) {
                          onSelectFilter(opt.value === 'todos' ? null : opt.value)
                        }
                        setIsFilterDropdownOpen(false)
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '0.45rem 0.625rem',
                        fontSize: '0.8125rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') : 'transparent',
                        color: textColor,
                        fontWeight: isSelected ? '600' : '400'
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : actions && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </header>
  )
}
