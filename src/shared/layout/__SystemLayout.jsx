// Arquivo: src/shared/layout/__SystemLayout.jsx
// Descrição: Layout raiz do sistema contendo navbar, sidebar, provedores de tema/notificação/paginação e área principal Outlet.

import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { modules, systemViews } from '@modules'
import { Navbar, Footer, ToastContainer, NotificationPanel } from './index'
import { ThemeProvider, useTheme, PaginationProvider, NotificationProvider, ActionLockProvider, InterfaceStateProvider } from '../context'

// ==========================================
// Configuração de Itens de Navegação
// ==========================================

const navItems = [
  { id: 'home', label: 'Início', path: '/', description: 'Página inicial do sistema' },
  ...modules.map(({ id, label, path, description }) => ({
    id,
    label,
    path,
    description
  }))
]

// ==========================================
// Conteúdo Estrutural do Layout
// ==========================================

const SystemLayoutContent = () => {
  const { currentTheme, toggleTheme } = useTheme()

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.textPrimary,
      fontFamily: currentTheme.font ? currentTheme.font.family : 'inherit',
      fontSize: '1rem',
      margin: 0,
      padding: 0
    }}>
      <Navbar
        brand="System"
        items={navItems}
        onThemeToggle={toggleTheme}
        currentTheme={currentTheme}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isMobile={isMobile}
      />

      <NotificationPanel />
      <ToastContainer />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 50px)',
        maxHeight: 'calc(100vh - 50px)',
        overflow: 'hidden',
        marginTop: '50px',
        marginLeft: isSidebarOpen && !isMobile ? '250px' : 0,
        marginRight: 0,
        marginBottom: 0,
        position: 'relative',
        zIndex: 1,
        minWidth: 0,
        width: isSidebarOpen && !isMobile ? 'calc(100vw - 250px)' : '100vw',
        maxWidth: '100%',
        padding: 0,
        transition: 'margin-left 0.2s ease, width 0.2s ease'
      }}>
        <main style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Outlet />
        </main>
        <Footer text="© 2024 System. Todos os direitos reservados." />
      </div>
    </div>
  )
}

// ==========================================
// Exportação com Provedores Globais
// ==========================================

export default function SystemLayout() {
  return (
    <ThemeProvider>
      <PaginationProvider>
        <NotificationProvider>
          <ActionLockProvider>
            <InterfaceStateProvider>
              <SystemLayoutContent />
            </InterfaceStateProvider>
          </ActionLockProvider>
        </NotificationProvider>
      </PaginationProvider>
    </ThemeProvider>
  )
}
