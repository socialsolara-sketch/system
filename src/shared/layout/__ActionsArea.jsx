// Arquivo: src/shared/layout/__ActionsArea.jsx
// Descrição: Componente padronizado e arrastável de ações flutuantes com colisão inteligente com o chat e limites de tela de 0 a 100%.

import { useTheme } from '../context/ThemeContext'

export default function ActionsArea({ children }) {
  const { currentTheme, isDark } = useTheme()

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.25rem 0',
        borderTop: `1px solid ${currentTheme?.colors?.border || (isDark ? '#334155' : '#e2e8f0')}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '1rem',
        width: '100%'
      }}
    >
      {children}
    </div>
  )
}
