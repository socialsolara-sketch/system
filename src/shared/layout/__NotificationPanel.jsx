// Arquivo: src/shared/layout/__NotificationPanel.jsx
// Descrição: Painel flat e minimalista de notificações com filtros rápidos, busca e controle de leitura.

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Trash2, Check, Search } from 'lucide-react'
import { useNotification, useTheme } from '@shared/context'

// ==========================================
// Utilitários de Formatação de Data
// ==========================================

function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Agora'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ==========================================
// Componente NotificationPanel
// ==========================================

export default function NotificationPanel() {
  const {
    notifications,
    isPanelOpen,
    closePanel,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount,
    notify
  } = useNotification()

  const { currentTheme, isDark } = useTheme()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState(null)
  const panelRef = useRef(null)
  const constraintsRef = useRef(null)

  // ==========================================
  // Efeitos de Fechamento por Clique Fora e Teclado
  // ==========================================

  useEffect(() => {
    if (!isPanelOpen) return

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        const notifBtn = document.querySelector('[aria-label^="Notificações"]')
        if (notifBtn && notifBtn.contains(e.target)) return
        closePanel()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPanelOpen, closePanel])

  // ==========================================
  // Contadores e Listas Filtradas
  // ==========================================

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      alerts: notifications.filter((n) => n.type === 'warning' || n.type === 'error').length
    }
  }, [notifications])

  const filteredList = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'unread' && item.read) return false
      if (filter === 'alerts' && item.type !== 'warning' && item.type !== 'error') return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(query)
        const matchMessage = (item.message || '').toLowerCase().includes(query)
        if (!matchTitle && !matchMessage) return false
      }

      return true
    })
  }, [notifications, filter, searchQuery])

  // ==========================================
  // Tokens de Estilo do Tema
  // ==========================================

  const bg = isDark ? (currentTheme?.colors?.surface || '#2B2B2B') : '#ffffff'
  const textPrimary = currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#1C1C1C')
  const textSecondary = currentTheme?.colors?.textSecondary || (isDark ? '#5A5A5A' : '#5A5A5A')
  const textMuted = currentTheme?.colors?.textMuted || (isDark ? '#8A8A8A' : '#7A7A7A')
  const border = currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E0E0E0')
  const primaryColor = isDark ? '#3DADFA' : (currentTheme?.colors?.primary || '#0079B8')
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
  const unreadBg = isDark ? 'rgba(61, 173, 250, 0.06)' : 'rgba(0, 121, 184, 0.04)'

  const handleSimulateSample = () => {
    const types = ['info', 'warning', 'success', 'error']
    const randomType = types[Math.floor(Math.random() * types.length)]
    const samples = {
      info: { title: 'Tabela TUSS Atualizada', message: 'Nova versão das diretrizes ANS sincronizada com sucesso.' },
      warning: { title: 'Pendente de Avaliação', message: 'Guia DUT aguarda parecer técnico da auditoria.' },
      success: { title: 'Exportação Concluída', message: 'Relatório gerado e disponível para download.' },
      error: { title: 'Falha na Comunicação', message: 'Instabilidade temporária com o serviço auxiliar.' }
    }
    notify({
      type: randomType,
      title: samples[randomType].title,
      message: samples[randomType].message
    })
  }

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.div
          key="notification-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Notificações"
          drag
          dragMomentum={false}
          dragElastic={0}
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: '50px',
            right: '1rem',
            width: '440px',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'calc(100vh - 70px)',
            backgroundColor: bg,
            color: textPrimary,
            border: `1px solid ${border}`,
            boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(0, 0, 0, 0.06)',
            zIndex: 8999,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'hidden',
            borderRadius: '8px'
          }}
        >
        <div 
          style={{
            padding: '0.875rem 1rem',
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexShrink: 0,
            cursor: 'grab'
          }}
          onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
          onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseDown={(e) => e.stopPropagation()}>
            <h3 style={{
              margin: 0,
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: textPrimary
            }}>
              Notificações
            </h3>
            {unreadCount > 0 && (
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                padding: '0.125rem 0.375rem',
                backgroundColor: primaryColor,
                color: '#ffffff',
                borderRadius: '2px'
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseDown={(e) => e.stopPropagation()}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.375rem',
                  color: primaryColor,
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Marcar lidas
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.375rem',
                  color: textSecondary,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Limpar
              </button>
            )}

            <button
              type="button"
              onClick={closePanel}
              aria-label="Fechar"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.25rem',
                color: textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{
          padding: '0.5rem 1rem',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: `1px solid ${border}`,
            padding: '0.3125rem 0.5rem',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#ffffff'
          }}>
            <Search size={13} color={textSecondary} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.75rem',
                color: textPrimary
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: textSecondary }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'all', label: 'Todas', count: counts.all },
              { id: 'unread', label: 'Não lidas', count: counts.unread },
              { id: 'alerts', label: 'Alertas', count: counts.alerts }
            ].map((tab) => {
              const active = filter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? `2px solid ${primaryColor}` : '2px solid transparent',
                    padding: '0.25rem 0.25rem 0.375rem 0.25rem',
                    color: active ? textPrimary : textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: active ? '600' : '400',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{ fontSize: '0.6875rem', color: active ? primaryColor : textMuted }}>
                    ({tab.count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="system-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '400px'
          }}
        >
          {filteredList.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: textSecondary,
              fontSize: '0.8125rem'
            }}>
              <p style={{ margin: 0 }}>Nenhuma notificação encontrada</p>
              <button
                type="button"
                onClick={handleSimulateSample}
                style={{
                  marginTop: '0.75rem',
                  background: 'none',
                  border: `1px solid ${border}`,
                  padding: '0.3125rem 0.625rem',
                  color: primaryColor,
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                + Testar notificação
              </button>
            </div>
          ) : (
            filteredList.map((item) => {
              const isHovered = hoveredId === item.id

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => !item.read && markAsRead(item.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: `1px solid ${border}`,
                    backgroundColor: !item.read ? unreadBg : isHovered ? hoverBg : 'transparent',
                    cursor: !item.read ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    position: 'relative',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: !item.read ? primaryColor : 'transparent',
                    marginTop: '0.375rem',
                    flexShrink: 0
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      marginBottom: '0.125rem'
                    }}>
                      <span style={{
                        fontSize: '0.8125rem',
                        fontWeight: item.read ? '500' : '600',
                        color: textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.title}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem',
                        color: textMuted,
                        flexShrink: 0
                      }}>
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: textSecondary,
                      lineHeight: '1.4',
                      wordBreak: 'break-word'
                    }}>
                      {item.message}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    flexShrink: 0,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.15s ease'
                  }}>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(item.id)
                        }}
                        title="Marcar como lida"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          color: primaryColor,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(item.id)
                      }}
                      title="Remover"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px',
                        color: textSecondary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div style={{
          padding: '0.5rem 1rem',
          borderTop: `1px solid ${border}`,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: textSecondary,
          flexShrink: 0
        }}>
          <span>ESC para fechar</span>
          <button
            type="button"
            onClick={handleSimulateSample}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: primaryColor,
              fontSize: '0.6875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            + Testar
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
}
