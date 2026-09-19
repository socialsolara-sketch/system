// Arquivo: src/shared/layout/__Navbar.jsx
// Descrição: Componentes de navegação do sistema: barra superior com abas de módulos abertos e barra lateral recolhível.

import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { systemColors } from '@assets/colors'
import { useNotification, useActionLock } from '../context'

// ==========================================
// Tokens Visuais da Barra de Navegação
// ==========================================

const getTokens = (currentTheme) => {
  const isDark = currentTheme?.name === 'dark'

  return {
    isDark,
    surface: currentTheme ? currentTheme.colors.header : systemColors.system.header,
    border: currentTheme ? currentTheme.colors.border : systemColors.neutral.gray200,
    text: currentTheme ? currentTheme.colors.textPrimary : systemColors.neutral.gray900,
    muted: currentTheme ? currentTheme.colors.textSecondary : systemColors.neutral.gray600,
    hover: currentTheme ? currentTheme.colors.surfaceHover : systemColors.neutral.gray100,
    input: isDark ? '#23272F' : '#FFFFFF',
    inputBorder: isDark ? '#3E4451' : '#CBD5E1',
    accent: systemColors.brand.primary,
    accentSoft: isDark ? 'rgba(0, 121, 184, 0.2)' : systemColors.brand.lighter || '#E3EEFB',
    radius: '0.375rem',
    shadow: isDark ? '0 10px 25px rgba(0, 0, 0, 0.4)' : '0 4px 14px rgba(0, 0, 0, 0.06)'
  }
}

// ==========================================
// Item do Menu Lateral
// ==========================================

const SidebarMenuItem = ({ item, currentTheme, onItemClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  const tokens = getTokens(currentTheme)
  const { isLocked, executeAction } = useActionLock()
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLocked) {
      return
    }
    executeAction(() => {
      navigate(item.path)
      if (onItemClick) onItemClick(item)
    })
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      title={item.description ? `${item.label} — ${item.description}` : item.label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.625rem 0.75rem',
        borderRadius: tokens.radius,
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: isActive ? '600' : '500',
        color: isActive ? tokens.accent : tokens.text,
        backgroundColor: isActive ? tokens.accentSoft : isHovered ? tokens.hover : 'transparent',
        transition: 'background-color 0.15s ease, color 0.15s ease'
      })}
    >
      {({ isActive }) => (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
            color: isActive ? tokens.accent : tokens.text
          }}>
            {item.label}
          </span>
          {item.description && (
            <span style={{
              fontSize: '0.6875rem',
              color: tokens.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              marginTop: '2px'
            }}>
              {item.description}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

// ==========================================
// Componente Sidebar (Menu Lateral)
// ==========================================

export const Sidebar = ({
  items = [],
  brand = 'System',
  currentTheme,
  isOpen = true,
  isMobile = false,
  onToggle,
  onItemClick
}) => {
  const tokens = getTokens(currentTheme)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const query = searchTerm.trim().toLowerCase()
  const filteredItems = query
    ? items.filter((item) =>
        (item.label && item.label.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.id && item.id.toLowerCase().includes(query))
      )
    : items

  useEffect(() => {
    if (!isOpen || !isMobile) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onToggle?.()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isMobile, onToggle])

  const iconButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: tokens.radius,
    cursor: 'pointer',
    color: tokens.muted,
    transition: 'background-color 0.15s ease, color 0.15s ease'
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onToggle}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      <aside
        aria-label="Menu lateral de módulos"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isOpen ? '250px' : '0',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: tokens.surface,
          borderRight: isOpen ? `1px solid ${tokens.border}` : 'none',
          boxShadow: isOpen && isMobile ? tokens.shadow : 'none',
          transition: 'width 0.2s ease',
          zIndex: isMobile ? 1100 : 1002,
          overflow: 'hidden'
        }}
      >
        {isOpen && (
          <>
            <div style={{
              height: '50px',
              padding: '0 0.75rem',
              display: 'flex',
              alignItems: 'center',
              borderBottom: `1px solid ${tokens.border}`,
              boxSizing: 'border-box',
              flexShrink: 0
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%'
              }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isSearchFocused ? tokens.accent : tokens.muted}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: 'absolute',
                    left: '0.625rem',
                    pointerEvents: 'none',
                    transition: 'stroke 0.15s ease'
                  }}
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setSearchTerm('')
                  }}
                  placeholder="Buscar módulo..."
                  aria-label="Buscar módulo existente"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.4375rem 1.875rem 0.4375rem 2.125rem',
                    fontSize: '0.8125rem',
                    color: tokens.text,
                    backgroundColor: tokens.input,
                    border: `1.5px solid ${isSearchFocused ? tokens.accent : tokens.inputBorder}`,
                    borderRadius: tokens.radius,
                    outline: 'none',
                    boxShadow: isSearchFocused ? `0 0 0 3px ${tokens.accentSoft}` : 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    aria-label="Limpar busca"
                    title="Limpar busca"
                    style={{
                      position: 'absolute',
                      right: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      padding: 0,
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: tokens.muted
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <nav
              aria-label="Módulos existentes"
              className="system-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              {filteredItems.map((item) => (
                <SidebarMenuItem
                  key={item.path || item.id}
                  item={item}
                  currentTheme={currentTheme}
                  onItemClick={onItemClick}
                />
              ))}

              {filteredItems.length === 0 && (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: tokens.muted,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>Nenhum módulo encontrado</span>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{
                        fontSize: '0.75rem',
                        color: tokens.accent,
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Limpar busca
                    </button>
                  )}
                </div>
              )}
            </nav>

            {/* Rodapé da Barra Lateral: Informações do Usuário e Acesso às Configurações */}
            <div style={{
              height: '50px',
              minHeight: '50px',
              maxHeight: '50px',
              boxSizing: 'border-box',
              padding: '0 0.875rem',
              borderTop: `1px solid ${tokens.border}`,
              backgroundColor: tokens.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                minWidth: 0,
                flex: 1
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 121, 184, 0.1)',
                  color: tokens.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                  border: `1px solid ${tokens.border}`
                }}>
                  U
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0
                }}>
                  <span style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: tokens.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2
                  }}>
                    Usuário
                  </span>
                  <span style={{
                    fontSize: '0.6875rem',
                    color: tokens.muted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2
                  }}>
                    admin@system.local
                  </span>
                </div>
              </div>

              <NavLink
                to="/configuracoes"
                aria-label="Configurações do sistema"
                title="Configurações"
                onClick={() => {
                  if (onItemClick) onItemClick({ path: '/configuracoes' })
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: tokens.radius,
                  color: isActive ? tokens.accent : tokens.muted,
                  backgroundColor: isActive ? tokens.accentSoft : 'transparent',
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = tokens.text
                  e.currentTarget.style.backgroundColor = tokens.hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = window.location.pathname === '/configuracoes' ? tokens.accent : tokens.muted
                  e.currentTarget.style.backgroundColor = window.location.pathname === '/configuracoes' ? tokens.accentSoft : 'transparent'
                }}
              >
                <Settings size={18} />
              </NavLink>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

// ==========================================
// Componente TopNavbar (Barra Superior com Abas)
// ==========================================

export const TopNavbar = ({
  onThemeToggle,
  currentTheme,
  items = [],
  onToggleSidebar,
  isSidebarOpen = false,
  isMobile = false,
  openTabs = [],
  onCloseTab
}) => {
  const tokens = getTokens(currentTheme)
  const location = useLocation()
  const navigate = useNavigate()
  const { isPanelOpen, togglePanel, unreadCount } = useNotification()
  const { isLocked, executeAction } = useActionLock()

  const activeTab = openTabs.find(
    (tab) => location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`)
  )

  const iconButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: tokens.radius,
    cursor: 'pointer',
    color: tokens.text,
    transition: 'background-color 0.15s ease, color 0.15s ease'
  }

  const hoverIn = (event) => {
    event.currentTarget.style.backgroundColor = tokens.hover
  }

  const hoverOut = (event) => {
    event.currentTarget.style.backgroundColor = 'transparent'
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: isSidebarOpen && !isMobile ? '250px' : 0,
      right: 0,
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '0 1.25rem',
      backgroundColor: tokens.surface,
      borderBottom: `1px solid ${tokens.border}`,
      transition: 'left 0.2s ease',
      zIndex: 1001
    }}>
      <button
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
        aria-expanded={isSidebarOpen}
        title={isSidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        style={iconButtonStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div
        className="system-scrollbar"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto'
        }}
      >
        {openTabs.map((tab) => {
          const isActive = activeTab?.id === tab.id

          return (
            <div
              key={tab.id}
              role="link"
              tabIndex={0}
              onClick={() => {
                if (isLocked) return
                executeAction(() => {
                  navigate(tab.path)
                })
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  if (isLocked) return
                  executeAction(() => {
                    navigate(tab.path)
                  })
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.625rem 0.375rem 0.875rem',
                borderRadius: tokens.radius,
                fontSize: '0.8125rem',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? tokens.accent : tokens.muted,
                backgroundColor: isActive ? tokens.accentSoft : 'transparent',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease'
              }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              {tab.label}
              {onCloseTab && (
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    onCloseTab(tab.id, tab.path)
                  }}
                  aria-label={`Fechar ${tab.label}`}
                  title={`Fechar ${tab.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.125rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    color: 'inherit',
                    opacity: 0.7
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button
          onClick={togglePanel}
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
          aria-expanded={isPanelOpen}
          title={unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Notificações'}
          style={{
            ...iconButtonStyle,
            position: 'relative',
            backgroundColor: isPanelOpen ? tokens.hover : 'transparent',
            color: isPanelOpen ? tokens.accent : tokens.text
          }}
          onMouseEnter={hoverIn}
          onMouseLeave={(e) => {
            if (!isPanelOpen) hoverOut(e)
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              minWidth: '16px',
              height: '16px',
              padding: '0 3px',
              borderRadius: '8px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 0 0 2px ' + tokens.surface
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            aria-label={tokens.isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={tokens.isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            style={iconButtonStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            {tokens.isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </nav>
  )
}

// ==========================================
// Exportação Padrão do Navbar
// ==========================================

export default function Navbar({
  items = [],
  brand = 'System',
  onThemeToggle,
  currentTheme,
  isSidebarOpen: externalIsOpen,
  onToggleSidebar: externalToggle,
  isMobile: externalIsMobile
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )
  const isSidebarOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const toggleSidebar = externalToggle || (() => setInternalIsOpen((prev) => !prev))
  const isMobile = externalIsMobile !== undefined ? externalIsMobile : false

  const location = useLocation()
  const navigate = useNavigate()

  const [prevPath, setPrevPath] = useState(location.pathname)
  const [openTabs, setOpenTabs] = useState(() => {
    const current = items.find(
      (item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
    )
    return current ? [current] : []
  })

  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    const current = items.find(
      (item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
    )
    if (current && !openTabs.some((tab) => tab.id === current.id)) {
      setOpenTabs((prev) => [...prev, current])
    }
  }

  const closeTab = (id, path) => {
    setOpenTabs((previous) => previous.filter((tab) => tab.id !== id))

    if (location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`))) {
      navigate('/')
    }
  }

  const handleItemClick = () => {
    toggleSidebar()
  }

  return (
    <>
      <TopNavbar
        items={items}
        currentTheme={currentTheme}
        onThemeToggle={onThemeToggle}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        openTabs={openTabs}
        onCloseTab={closeTab}
      />
      <Sidebar
        items={items}
        brand={brand}
        currentTheme={currentTheme}
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onToggle={toggleSidebar}
        onItemClick={handleItemClick}
      />
    </>
  )
}
