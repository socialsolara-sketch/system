// Arquivo: src/modules/usuario/components/GoogleSheetsModal.jsx
// Descrição: Modal interativo para conexão com Google Sheets via OAuth e criação da aba USUARIOS na planilha system.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@shared/context/ThemeContext'
import { useNotification } from '@shared/context'
import { Table, CheckCircle, AlertTriangle, ExternalLink, X, Database, ShieldCheck, Loader2 } from 'lucide-react'
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  getCurrentUser,
  logout
} from '@shared/services/googleAuthService'
import {
  createUsuariosSheet,
  DEFAULT_SPREADSHEET_ID,
  USUARIOS_HEADERS
} from '@shared/services/googleSheetsService'

export default function GoogleSheetsModal({ isOpen, onClose }) {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [populateData, setPopulateData] = useState(true)
  const [creationResult, setCreationResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser)
        setToken(authToken)
      },
      () => {
        setUser(getCurrentUser())
        setToken(getAccessToken())
      }
    )

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSignIn = async () => {
    setIsSigningIn(true)
    setErrorMessage(null)
    try {
      const res = await googleSignIn()
      if (res) {
        setUser(res.user)
        setToken(res.accessToken)
        notify.success('Google Conectado', `Autenticado com sucesso como ${res.user.email}`)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Erro ao autenticar com o Google.')
      notify.error('Erro de Autenticação', err.message || 'Falha ao autenticar com o Google.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setToken(null)
    setCreationResult(null)
    notify.info('Sessão Encerrada', 'Desconectado do Google.')
  }

  const handleCreateSheet = async () => {
    setIsCreating(true)
    setErrorMessage(null)
    try {
      const activeToken = token || getAccessToken()
      if (!activeToken) {
        throw new Error('Você precisa se conectar com a sua conta Google primeiro.')
      }

      const result = await createUsuariosSheet({
        spreadsheetId: DEFAULT_SPREADSHEET_ID,
        token: activeToken,
        populateInitialData: populateData
      })

      setCreationResult(result)
      notify.success(
        'Aba USUARIOS Criada!',
        `Aba criada com sucesso na planilha com ${result.headers.length} colunas na Linha 1.`
      )
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Erro ao criar a aba USUARIOS na planilha.')
      notify.error('Falha na Operação', err.message || 'Erro ao se comunicar com o Google Sheets.')
    } finally {
      setIsCreating(false)
    }
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: currentTheme?.colors?.surface || '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}
        >
          {/* Header do Modal */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}
              >
                <Database size={20} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: currentTheme?.colors?.textPrimary || '#0f172a'
                  }}
                >
                  Criar Aba de Usuários no Google Sheets
                </h3>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: currentTheme?.colors?.textSecondary || '#64748b'
                  }}
                >
                  Planilha de destino: <strong>system</strong>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: currentTheme?.colors?.textSecondary || '#64748b',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Conteúdo do Modal */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Informações da Planilha */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8125rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: currentTheme?.colors?.textSecondary || '#64748b' }}>Planilha Conectada:</span>
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  Abrir no Google Sheets <ExternalLink size={13} />
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: currentTheme?.colors?.textSecondary || '#64748b' }}>Nome da Nova Aba:</span>
                <strong style={{ color: '#059669' }}>USUARIOS</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: currentTheme?.colors?.textSecondary || '#64748b' }}>Total de Colunas na Linha 1:</span>
                <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
                  {USUARIOS_HEADERS.length} colunas normalizadas
                </span>
              </div>
            </div>

            {/* Etapa 1: Autenticação Google */}
            {!token ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme?.colors?.border || '#cbd5e1'}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb' }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontWeight: '600', fontSize: '0.9375rem' }}>Autorização Necessária</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#64748b', maxWidth: '420px' }}>
                  Para adicionar a nova aba diretamente na sua planilha <strong>system</strong>, conecte sua conta Google autorizada.
                </p>

                {/* Botão Oficial Sign in with Google */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    color: '#3c4043',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isSigningIn ? 'wait' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    marginTop: '0.25rem'
                  }}
                >
                  {isSigningIn ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 18, height: 18, display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  )}
                  <span>{isSigningIn ? 'Conectando...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
                      Conectado com Google
                    </div>
                    <div style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b' }}>
                      {user?.email || 'Conta autorizada'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${currentTheme?.colors?.border || '#cbd5e1'}`,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    color: currentTheme?.colors?.textSecondary || '#64748b'
                  }}
                >
                  Trocar Conta
                </button>
              </div>
            )}

            {/* Configuração de Criação */}
            {token && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: currentTheme?.colors?.textPrimary || '#0f172a'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={populateData}
                    onChange={(e) => setPopulateData(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  <span>Popular automaticamente com os usuários de teste (5 registros completos)</span>
                </label>

                {/* Lista de colunas a serem criadas na Linha 1 */}
                <div
                  style={{
                    border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: currentTheme?.colors?.textSecondary || '#64748b'
                    }}
                  >
                    Colunas da Linha 1 (Cabeçalhos Relacionais)
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#ffffff'
                    }}
                  >
                    {USUARIOS_HEADERS.map((col, idx) => (
                      <span
                        key={col}
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'monospace',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                          color: currentTheme?.colors?.textPrimary || '#334155'
                        }}
                      >
                        {idx + 1}. {col}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateSheet}
                  disabled={isCreating}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: isCreating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Criando aba USUARIOS na Planilha...</span>
                    </>
                  ) : (
                    <>
                      <Table size={18} />
                      <span>Criar Aba USUARIOS na Planilha Google</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Sucesso */}
            {creationResult && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '700' }}>
                  <CheckCircle size={20} />
                  <span>Aba USUARIOS configurada com sucesso!</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
                  {creationResult.alreadyExisted
                    ? 'A aba USUARIOS já existia e teve seus cabeçalhos da Linha 1 revalidados com sucesso.'
                    : 'A nova aba USUARIOS foi criada no Google Sheets.'}
                  {creationResult.insertedCount > 0 && ` Foram sincronizados ${creationResult.insertedCount} registros de beneficiários.`}
                </p>
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: '0.25rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#2563eb',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Visualizar agora na planilha Google system <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* Erro */}
            {errorMessage && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  color: '#dc2626',
                  fontSize: '0.8125rem'
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Footer do Modal */}
          <div
            style={{
              padding: '0.875rem 1.5rem',
              borderTop: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: `1px solid ${currentTheme?.colors?.border || '#cbd5e1'}`,
                backgroundColor: 'transparent',
                color: currentTheme?.colors?.textPrimary || '#0f172a',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
