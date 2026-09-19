// Arquivo: src/shared/layout/ErrorBoundary.jsx
// Descrição: Error Boundary global para interceptar exceções de renderização do React sem travar a aba do navegador, permitindo redefinir o estado.

import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro de Renderização Capturado:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--system-bg, #f8fafc)',
          color: 'var(--system-text-primary, #0f172a)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--system-font-family, system-ui, sans-serif)',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            padding: '3rem 2rem',
            borderRadius: '0', // Design Flat: cantos vivos ou raio mínimo
            backgroundColor: 'var(--system-surface, #ffffff)',
            border: '1px solid var(--system-border, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="var(--system-primary, #ef4444)" 
                strokeWidth="2.5" 
                strokeLinecap="square" 
                strokeLinejoin="inherit"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700', 
              marginBottom: '1rem',
              letterSpacing: '0.025em',
              textTransform: 'uppercase'
            }}>
              ERRO DE RENDERIZAÇÃO
            </h2>

            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--system-text-secondary, #64748b)', 
              marginBottom: '2.5rem', 
              lineHeight: '1.6',
              maxWidth: '320px'
            }}>
              O sistema detectou uma instabilidade crítica na interface. Uma tentativa de recuperação automática está disponível.
            </p>

            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                backgroundColor: 'var(--system-primary, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = 'var(--system-primary-hover, #2563eb)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = 'var(--system-primary, #3b82f6)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="inherit">
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Recuperar Interface
            </button>

            <div style={{ marginTop: '2rem', fontSize: '0.625rem', color: 'var(--system-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Código de Instabilidade: ID_{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
