// Arquivo: src/shared/layout/__ChatWidget.jsx
// Descrição: Widget de chat interno flat integrado ao rodapé do sistema para comunicação entre operadores e reguladores.

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Search,
  ChevronLeft,
  Circle,
  CheckCheck,
  Smile,
  Paperclip,
  Maximize2
} from 'lucide-react'
import { useTheme } from '../context'

// ==========================================
// Contatos Iniciais Simulados
// ==========================================

const initialContacts = [
  {
    id: 'camila',
    name: 'Dra. Camila Santos',
    role: 'Auditoria Médica TUSS',
    avatar: 'CS',
    avatarBg: '#0284c7',
    status: 'online',
    unread: 1,
    messages: [
      { id: 1, sender: 'them', text: 'Olá! Conseguiu revisar as regras de carência do TUSS 10101012?', time: '14:22' },
      { id: 2, sender: 'me', text: 'Boa tarde, Camila! Estou finalizando a conferência conforme a RN 465 da ANS.', time: '14:25' },
      { id: 3, sender: 'them', text: 'Perfeito! Se precisar de apoio na justificativa clínica me avise por aqui.', time: '14:26' }
    ]
  },
  {
    id: 'roberto',
    name: 'Dr. Roberto Mendes',
    role: 'Regulação & DUT',
    avatar: 'RM',
    avatarBg: '#059669',
    status: 'online',
    unread: 1,
    messages: [
      { id: 1, sender: 'them', text: 'A solicitação DUT-2024-001 de UTI móvel já foi liberada pelo hospital de destino.', time: '13:50' },
      { id: 2, sender: 'me', text: 'Excelente notícia! Vou atualizar o status no sistema agora.', time: '13:52' }
    ]
  },
  {
    id: 'carlos',
    name: 'Carlos Eduardo',
    role: 'Faturamento & Guias',
    avatar: 'CE',
    avatarBg: '#d97706',
    status: 'away',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Fechamento do lote de guias programado para as 18h.', time: '11:10' },
      { id: 2, sender: 'me', text: 'Certo, já incluí os procedimentos ambulatoriais validados.', time: '11:15' }
    ]
  },
  {
    id: 'fernanda',
    name: 'Fernanda Lima',
    role: 'Suporte Operacional',
    avatar: 'FL',
    avatarBg: '#7c3aed',
    status: 'online',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Sistema atualizado com sucesso. Se notar alguma lentidão nos filtros me dê um toque.', time: '09:30' }
    ]
  },
  {
    id: 'marcos',
    name: 'Marcos Vinícius',
    role: 'Coordenação de TI',
    avatar: 'MV',
    avatarBg: '#475569',
    status: 'offline',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Backup diário dos bancos TUSS/DUT concluído com êxito.', time: 'Ontem' }
    ]
  }
]

// ==========================================
// Sugestões Rápidas de Mensagens
// ==========================================

const quickReplies = [
  'Pode validar a guia DUT?',
  'Conferindo código TUSS...',
  'Obrigado pelo retorno!',
  'Em análise no momento.'
]

// ==========================================
// Componente ChatWidget Flat
// ==========================================

export default function ChatWidget() {
  const { currentTheme, isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeContactId, setActiveContactId] = useState(null)
  const [contacts, setContacts] = useState(initialContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const msgIdCounterRef = useRef(100)
  const replyTimeoutRef = useRef(null)
  const constraintsRef = useRef(null)

  // Limpeza de timeout ao desmontar
  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const activeContact = contacts.find((c) => c.id === activeContactId)
  const totalUnread = contacts.reduce((acc, c) => acc + (c.unread || 0), 0)

  // Rolagem automática ao final das mensagens
  useEffect(() => {
    if (activeContactId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeContact?.messages, isTyping, activeContactId])

  // Limpar contador de não lidos ao abrir conversa
  const handleSelectContact = (contactId) => {
    setActiveContactId(contactId)
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unread: 0 } : c))
    )
  }

  // Enviar mensagem
  const handleSendMessage = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputMessage).trim()
    if (!text || !activeContactId) return

    msgIdCounterRef.current += 1
    const messageId = msgIdCounterRef.current

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg = {
      id: messageId,
      sender: 'me',
      text,
      time: timeStr
    }

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: [...c.messages, newMsg]
          }
        }
        return c
      })
    )

    if (typeof textToSend !== 'string') {
      setInputMessage('')
    }

    // Simulação de resposta de colega
    setIsTyping(true)
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current)
    }
    replyTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      msgIdCounterRef.current += 1
      const replyId = msgIdCounterRef.current

      const replyTime = new Date()
      const replyTimeStr = `${String(replyTime.getHours()).padStart(2, '0')}:${String(replyTime.getMinutes()).padStart(2, '0')}`
      
      const cannedReplies = [
        'Entendido! Já estou verificando aqui na minha fila de trabalho.',
        'Perfeito, acabei de registrar a anotação correspondente no prontuário/guia.',
        'Recebido com sucesso. Qualquer divergência te chamo por aqui.',
        'Excelente! Tudo conferido e alinhado com o protocolo.'
      ]
      const randomReply = cannedReplies[Math.floor(Math.random() * cannedReplies.length)]

      const replyMsg = {
        id: replyId,
        sender: 'them',
        text: randomReply,
        time: replyTimeStr
      }

      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === activeContactId) {
            return {
              ...c,
              messages: [...c.messages, replyMsg]
            }
          }
          return c
        })
      )
    }, 1200)
  }

  // ==========================================
  // Definição de Cores e Tokens
  // ==========================================

  const primaryColor = currentTheme?.colors?.primary || '#0079B8'
  const accentColor = currentTheme?.colors?.accent || '#3DADFA'
  const bgColor = currentTheme ? currentTheme.colors.card : (isDark ? '#1e293b' : '#ffffff')
  const surfaceColor = isDark ? '#0f172a' : '#f8fafc'
  const borderColor = currentTheme?.colors?.border || (isDark ? '#334155' : '#e2e8f0')
  const textColor = currentTheme ? currentTheme.colors.textPrimary : (isDark ? '#f8fafc' : '#0f172a')
  const mutedColor = currentTheme ? currentTheme.colors.textSecondary : (isDark ? '#94a3b8' : '#64748b')
  const inputBg = isDark ? '#0f172a' : '#ffffff'

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Botão Flat Embutido no Rodapé */}
      <button
        type="button"
        id="toggle-footer-chat-btn"
        onClick={() => {
          setIsOpen((prev) => !prev)
          setIsMinimized(false)
        }}
        aria-label="Abrir chat interno da equipe"
        title="Comunicação interna do sistema"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          height: '30px',
          padding: '0 0.625rem',
          borderRadius: '4px',
          border: `1px solid ${isOpen ? primaryColor : borderColor}`,
          backgroundColor: isOpen ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 121, 184, 0.08)') : 'transparent',
          color: isOpen ? primaryColor : textColor,
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: '500',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        <MessageSquare size={14} />
        <span>Chat</span>
        {totalUnread > 0 && (
          <span style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '0.6875rem',
            fontWeight: '700',
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1
          }}>
            {totalUnread}
          </span>
        )}
      </button>

      {/* Caixa Flat Acoplada Diretamente Sobre a Borda Superior do Footer */}
      {isOpen && (
        <motion.div
          id="internal-chat-flat-box"
          drag
          dragMomentum={false}
          dragElastic={0}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            bottom: '49px', // Assentada diretamente sobre a borda superior do rodapé (height 50px)
            right: '16px',
            width: '350px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '42px' : '470px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px 8px 0 0', // Base plana acoplada à borda do rodapé
            boxShadow: isDark ? '0 -4px 12px rgba(0, 0, 0, 0.3)' : '0 -4px 12px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 100000,
            pointerEvents: 'auto',
            transition: 'height 0.2s ease, scale 0.2s ease, opacity 0.2s ease',
            fontFamily: 'inherit'
          }}
        >
          {/* Cabeçalho do Chat */}
          <div style={{
            height: '42px',
            minHeight: '42px',
            backgroundColor: primaryColor,
            color: '#ffffff',
            padding: '0 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            userSelect: 'none',
            cursor: 'grab'
          }}
          onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
          onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
          >
            {/* Título / Contato Ativo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }} onMouseDown={(e) => e.stopPropagation()}>
              {activeContactId ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveContactId(null)}
                    title="Voltar aos colaboradores"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '3px'
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div style={{
                    position: 'relative',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: activeContact?.avatarBg || '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {activeContact?.avatar}
                    <span style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: activeContact?.status === 'online' ? '#22c55e' : (activeContact?.status === 'away' ? '#f59e0b' : '#94a3b8'),
                      border: `1px solid ${primaryColor}`
                    }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2
                    }}>
                      {activeContact?.name}
                    </span>
                    <span style={{
                      fontSize: '0.625rem',
                      opacity: 0.85,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2
                    }}>
                      {activeContact?.role}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare size={15} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: '600', lineHeight: 1.2 }}>
                    Chat Interno
                  </span>
                </>
              )}
            </div>

            {/* Controles de Janela */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onMouseDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? 'Expandir' : 'Minimizar'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85
                }}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Corpo do Chat */}
          {!isMinimized && (
            <>
              {!activeContactId ? (
                /* Lista de Contatos */
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: surfaceColor
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: inputBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '4px',
                      padding: '0.3125rem 0.5rem',
                      gap: '0.4rem'
                    }}>
                      <Search size={13} color={mutedColor} />
                      <input
                        type="text"
                        placeholder="Buscar colaborador..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '0.75rem',
                          color: textColor,
                          width: '100%',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.25rem 0'
                  }}>
                    {filteredContacts.length === 0 ? (
                      <div style={{
                        padding: '1.5rem 1rem',
                        textAlign: 'center',
                        color: mutedColor,
                        fontSize: '0.75rem'
                      }}>
                        Nenhum colaborador encontrado.
                      </div>
                    ) : (
                      filteredContacts.map((contact) => {
                        const lastMsg = contact.messages[contact.messages.length - 1]
                        return (
                          <div
                            key={contact.id}
                            onClick={() => handleSelectContact(contact.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
                              transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0, 121, 184, 0.04)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div style={{
                              position: 'relative',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: contact.avatarBg,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              flexShrink: 0
                            }}>
                              {contact.avatar}
                              <span style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: contact.status === 'online' ? '#22c55e' : (contact.status === 'away' ? '#f59e0b' : '#94a3b8'),
                                border: `1.5px solid ${bgColor}`
                              }} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: contact.unread > 0 ? '700' : '600',
                                  color: textColor,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {contact.name}
                                </span>
                                <span style={{ fontSize: '0.625rem', color: mutedColor }}>
                                  {lastMsg?.time || ''}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1px' }}>
                                <span style={{
                                  fontSize: '0.6875rem',
                                  color: contact.unread > 0 ? textColor : mutedColor,
                                  fontWeight: contact.unread > 0 ? '600' : '400',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {lastMsg?.text || contact.role}
                                </span>
                                {contact.unread > 0 && (
                                  <span style={{
                                    backgroundColor: primaryColor,
                                    color: '#ffffff',
                                    fontSize: '0.625rem',
                                    fontWeight: '700',
                                    minWidth: '14px',
                                    height: '14px',
                                    borderRadius: '7px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 3px',
                                    flexShrink: 0
                                  }}>
                                    {contact.unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div style={{
                    padding: '0.375rem 0.75rem',
                    borderTop: `1px solid ${borderColor}`,
                    backgroundColor: surfaceColor,
                    fontSize: '0.6875rem',
                    color: mutedColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Rede interna</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#22c55e', fontWeight: '600' }}>
                      <Circle size={7} fill="#22c55e" stroke="none" /> 3 online
                    </span>
                  </div>
                </div>
              ) : (
                /* Thread de Mensagens */
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.12)' : '#fafafa'
                  }}>
                    {activeContact?.messages.map((msg) => {
                      const isMe = msg.sender === 'me'
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '86%',
                            alignSelf: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{
                            padding: '0.45rem 0.6875rem',
                            borderRadius: isMe ? '8px 8px 1px 8px' : '8px 8px 8px 1px',
                            backgroundColor: isMe ? primaryColor : (isDark ? '#334155' : '#e2e8f0'),
                            color: isMe ? '#ffffff' : textColor,
                            fontSize: '0.75rem',
                            lineHeight: 1.4,
                            wordBreak: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                            padding: '0 2px'
                          }}>
                            <span style={{ fontSize: '0.5625rem', color: mutedColor }}>
                              {msg.time}
                            </span>
                            {isMe && <CheckCheck size={11} color={accentColor} />}
                          </div>
                        </div>
                      )
                    })}

                    {isTyping && (
                      <div style={{
                        padding: '0.375rem 0.625rem',
                        borderRadius: '8px 8px 8px 1px',
                        backgroundColor: isDark ? '#334155' : '#e2e8f0',
                        color: mutedColor,
                        width: 'fit-content',
                        fontSize: '0.6875rem',
                        fontStyle: 'italic'
                      }}>
                        Digitando...
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Respostas Rápidas */}
                  <div style={{
                    padding: '0.3125rem 0.5rem',
                    display: 'flex',
                    gap: '0.3125rem',
                    overflowX: 'auto',
                    borderTop: `1px solid ${borderColor}`,
                    backgroundColor: surfaceColor,
                    scrollbarWidth: 'none'
                  }}>
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSendMessage(reply)}
                        style={{
                          fontSize: '0.625rem',
                          whiteSpace: 'nowrap',
                          padding: '0.1875rem 0.4375rem',
                          borderRadius: '4px',
                          backgroundColor: inputBg,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                          cursor: 'pointer'
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Formulário de Envio */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    style={{
                      padding: '0.4375rem 0.625rem',
                      borderTop: `1px solid ${borderColor}`,
                      backgroundColor: bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <button
                      type="button"
                      title="Anexar documento"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: mutedColor,
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Paperclip size={14} />
                    </button>

                    <input
                      type="text"
                      placeholder="Mensagem interna..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.3125rem 0.5rem',
                        borderRadius: '4px',
                        border: `1px solid ${borderColor}`,
                        backgroundColor: inputBg,
                        color: textColor,
                        fontSize: '0.75rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />

                    <button
                      type="button"
                      title="Emoji"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: mutedColor,
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Smile size={14} />
                    </button>

                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      title="Enviar"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        backgroundColor: inputMessage.trim() ? primaryColor : (isDark ? '#334155' : '#e2e8f0'),
                        color: inputMessage.trim() ? '#ffffff' : mutedColor,
                        border: 'none',
                        cursor: inputMessage.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
