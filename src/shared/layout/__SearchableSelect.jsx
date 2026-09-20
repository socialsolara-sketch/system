// Arquivo: src/shared/layout/__SearchableSelect.jsx
// Descrição: Componente de seleção com busca (Listbox/Combobox) estilizado com Tailwind.

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Selecione...",
  labelField = "nome",
  valueField = "nome",
  disabled = false
}) {
  const { currentTheme, isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)

  const getLabel = (opt) => {
    if (!opt) return ''
    if (labelField && opt[labelField]) return String(opt[labelField])
    
    // Procura por campos comuns de label
    const fallbacks = ['nome', 'cidade', 'sigla', 'uf', 'descricao', 'local', 'label']
    for (const key of fallbacks) {
      if (opt[key]) return String(opt[key])
    }
    
    // Tenta encontrar o primeiro valor de string que não seja o ID
    const values = Object.entries(opt)
    const firstString = values.find(([key, val]) => key !== 'id' && typeof val === 'string' && val.length > 0)
    if (firstString) return String(firstString[1])

    return String(Object.values(opt)[0] || '')
  }

  const filteredOptions = options.filter(opt => {
    const label = getLabel(opt).toLowerCase()
    return label.includes(searchTerm.toLowerCase())
  })

  const selectedOption = options.find(opt => {
    if (String(opt[valueField]) === String(value)) return true
    if (getLabel(opt) === String(value)) return true
    return false
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (opt) => {
    const val = opt[valueField] || getLabel(opt)
    onChange({ target: { name: '', value: val } })
    setIsOpen(false)
    setSearchTerm('')
  }

  const baseStyle = {
    position: 'relative',
    width: '100%',
    fontFamily: 'inherit'
  }

  const triggerStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5')}`,
    borderRadius: '0.375rem',
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#2B2B2B' : '#ffffff'),
    color: value ? (currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717')) : (currentTheme?.colors?.textTertiary || (isDark ? '#A1A1A1' : '#737373')),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    boxSizing: 'border-box'
  }

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.25rem',
    backgroundColor: currentTheme?.colors?.card || (isDark ? '#2B2B2B' : '#ffffff'),
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5')}`,
    borderRadius: '0.5rem',
    boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    maxHeight: '260px',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: isOpen ? 'block' : 'none'
  }

  const searchBoxStyle = {
    padding: '0.75rem',
    borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5')}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    position: 'sticky',
    top: 0,
    backgroundColor: currentTheme?.colors?.card || (isDark ? '#2B2B2B' : '#ffffff'),
    zIndex: 2
  }

  const searchInputWrapperStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.03)',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.375rem',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5')}`
  }

  const searchInputStyle = {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
    color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717'),
    fontWeight: '500'
  }

  const optionStyle = (isHovered, isSelected) => ({
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    backgroundColor: isSelected 
      ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)')
      : isHovered 
        ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
        : 'transparent',
    color: isSelected 
      ? (currentTheme?.colors?.textPrimary || (isDark ? '#FFFFFF' : '#171717')) 
      : (currentTheme?.colors?.textSecondary || (isDark ? '#D9D9D9' : '#374151')),
    fontWeight: isSelected ? '700' : '500',
    transition: 'all 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  })

  return (
    <div style={baseStyle} ref={containerRef}>
      <div 
        style={triggerStyle} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          flex: 1,
          fontWeight: selectedOption ? '600' : '400'
        }}>
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            marginLeft: '0.5rem',
            flexShrink: 0,
            opacity: 0.7
          }} 
        />
      </div>

      <div style={dropdownStyle}>
        <div style={searchBoxStyle}>
          <div style={searchInputWrapperStyle}>
            <Search size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
            <input 
              style={searchInputStyle}
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <X 
                size={14} 
                style={{ cursor: 'pointer', opacity: 0.5 }} 
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
        </div>

        <div style={{ padding: '0.25rem 0' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedOption && String(opt[valueField] || getLabel(opt)) === String(value)
              return (
                <div 
                  key={idx}
                  style={optionStyle(false, isSelected)}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {getLabel(opt)}
                  {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isDark ? '#D9D9D9' : '#525252' }} />}
                </div>
              )
            })
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary, opacity: 0.6 }}>
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
