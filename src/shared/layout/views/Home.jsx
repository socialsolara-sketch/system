// Arquivo: src/shared/layout/views/Home.jsx
// Descrição: Visão inicial do sistema exibindo boas-vindas e identificação da plataforma.

import { useTheme } from '../../context/ThemeContext'

// ==========================================
// Componente Home
// ==========================================

export default function Home() {
  const { currentTheme } = useTheme()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 150px)',
      margin: 0,
      padding: '2rem',
      gap: '0.75rem'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '700',
        color: currentTheme?.colors?.primary || '#0079B8',
        margin: 0,
        letterSpacing: '-0.02em'
      }}>
        SISTEMA
      </h1>
      <p style={{
        margin: 0,
        fontSize: '1rem',
        color: currentTheme?.colors?.textSecondary || '#64748b'
      }}>
        Plataforma unificada de gestão em saúde suplementar
      </p>
    </div>
  )
}
