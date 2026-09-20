// Arquivo: src/modules/atendimento/views/AtendimentoList.jsx
// Descrição: Interface de atendimento estilo chat (WhatsApp/Tallos) com sidebar de gestão de filas.

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import QuickReplyModal from '../components/QuickReplyModal'
import { MessageSquare, Send, Search, User, Settings, Reply, Shuffle, CheckCircle, Clock, Inbox, Users, History, Star, ChevronLeft, ChevronRight, TrendingUp, BarChart2, Award, ThumbsUp, Paperclip, Mic, X, File, Image as ImageIcon, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { ConfirmationModal } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'

const mockConversations = []

const sidebarItems = [
  { id: 'queue', label: 'Fila', icon: Inbox },
  { id: 'mine', label: 'Meus', icon: Users },
  { id: 'contacts', label: 'Contatos', icon: User },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'feedback', label: 'Feedback', icon: Star },
]

export default function AtendimentoList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()
  const constraintsRef = useRef(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [activeSidebar, setActiveSidebar] = useState('queue')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState(null) // 'transfer', 'schedule', 'close'
  const [transferData, setTransferData] = useState({ unidade: '', setor: '', atendente: 'fila' })
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', message: '' })
  const [scheduledTasks, setScheduledTasks] = useState([])
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const [quickReplies, setQuickReplies] = useState([])
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false)
  const [contacts, setContacts] = useState([])
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '' })
  const [message, setMessage] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // useEffect para verificar tarefas agendadas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setScheduledTasks(prev => {
        const toTrigger = prev.filter(task => {
          const taskTime = new Date(`${task.date}T${task.time}`)
          return taskTime <= now && !task.triggered
        })

        if (toTrigger.length > 0) {
          toTrigger.forEach(task => {
            notify({
              type: 'info',
              title: 'Lembrete de Agendamento',
              message: task.message || 'Você tem um atendimento agendado para agora.',
              duration: 8000
            })
            task.triggered = true
          })
          return prev.filter(task => !task.triggered)
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [notify])

  const handleMessageChange = (e) => {
    const val = e.target.value
    setMessage(val)
    if (val.startsWith('/')) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
      file: file
    }))
    setAttachedFiles([...attachedFiles, ...newFiles])
  }

  const removeFile = (id) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== id))
  }

  const removePreviewFile = (id) => {
    setPreviewFiles(previewFiles.filter(f => f.id !== id))
  }

  const sendWithAttachments = () => {
    if (attachedFiles.length > 0) {
      setPreviewFiles([...previewFiles, ...attachedFiles])
      setAttachedFiles([])
      setIsAttachmentModalOpen(false)
    }
  }

  const insertSuggestion = (reply) => {
    setMessage(reply.message)
    setShowSuggestions(false)
  }

  const handleContactAction = (action, contact = null) => {
    if (action === 'add') {
      setSelectedContact(null)
      setContactForm({ name: '', phone: '', email: '' })
      setIsContactModalOpen(true)
    } else if (action === 'edit') {
      setSelectedContact(contact)
      setContactForm({ ...contact })
      setIsContactModalOpen(true)
    } else if (action === 'delete') {
      if (window.confirm('Deseja realmente excluir este contato?')) {
        setContacts(contacts.filter(c => c.id !== contact.id))
        notify.success('Contato Excluído', 'O contato foi removido com sucesso.')
      }
    }
  }

  const saveContact = () => {
    if (!contactForm.name || !contactForm.phone) {
      notify.warning('Dados Incompletos', 'Nome e Telefone são obrigatórios.')
      return
    }

    if (selectedContact) {
      setContacts(contacts.map(c => c.id === selectedContact.id ? { ...contactForm, id: c.id } : c))
      notify.success('Contato Atualizado', 'Os dados do contato foram salvos.')
    } else {
      const newContact = {
        ...contactForm,
        id: Math.random().toString(36).substr(2, 9)
      }
      setContacts([...contacts, newContact])
      notify.success('Contato Adicionado', 'Novo contato cadastrado com sucesso.')
    }
    setIsContactModalOpen(false)
  }

  const filteredReplies = quickReplies.filter(r => 
    ('/' + r.title.toLowerCase()).startsWith(message.toLowerCase())
  )

  const openActionModal = (action) => {
    if (action === 'reply') {
      setIsQuickReplyModalOpen(true)
    } else {
      setModalAction(action)
      setIsModalOpen(true)
    }
  }

  const handleConfirmAction = () => {
    // Lógica para executar a ação confirmada
    if (modalAction === 'transfer') {
      notify.success('Transferência Realizada', `Atendimento transferido para ${transferData.setor} na ${transferData.unidade}`)
    } else if (modalAction === 'schedule') {
      if (!scheduleData.date || !scheduleData.time) {
        notify.warning('Dados Incompletos', 'Por favor, preencha a data e o horário do agendamento.')
        return
      }
      
      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        ...scheduleData,
        triggered: false
      }
      setScheduledTasks([...scheduledTasks, newTask])
      notify.success('Agendamento Realizado', `Lembrete configurado para ${scheduleData.date} às ${scheduleData.time}`)
      setScheduleData({ date: '', time: '', message: '' })
    } else if (modalAction === 'close') {
      notify.info('Atendimento Encerrado', 'O atendimento foi finalizado com sucesso.')
    }
    
    setIsModalOpen(false)
  }

  return (
    <div ref={constraintsRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', borderTop: `1px solid ${currentTheme?.colors?.border}` }}>
        {/* Sidebar de Conversas (Integrada) */}
        <div style={{ 
          width: isSidebarOpen ? '340px' : '64px', 
          borderRight: `1px solid ${currentTheme?.colors?.border}`, 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: currentTheme?.colors?.surface,
          flexShrink: 0
        }}>
          
          {/* Botão de Toggle Lateral */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              position: 'absolute',
              right: '-12px',
              top: '48px',
              zIndex: 35,
              backgroundColor: currentTheme?.colors?.surface,
              border: `1px solid ${currentTheme?.colors?.border}`,
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: currentTheme?.colors?.textPrimary,
              transition: 'all 0.2s ease'
            }}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Navegação de Abas do Módulo (Flat Rail) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isSidebarOpen ? 'row' : 'column',
            borderBottom: `1px solid ${currentTheme?.colors?.border}`, 
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            minHeight: isSidebarOpen ? '56px' : 'auto'
          }}>
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSidebar(item.id)
                  if (!isSidebarOpen) setIsSidebarOpen(true)
                }}
                title={item.label}
                style={{
                  flex: 1,
                  height: isSidebarOpen ? '56px' : '64px',
                  padding: '0',
                  border: 'none',
                  background: activeSidebar === item.id ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : 'transparent',
                  borderBottom: isSidebarOpen && activeSidebar === item.id ? `3px solid ${currentTheme?.colors?.primary}` : '3px solid transparent',
                  borderLeft: !isSidebarOpen && activeSidebar === item.id ? `3px solid ${currentTheme?.colors?.primary}` : '3px solid transparent',
                  cursor: 'pointer',
                  color: activeSidebar === item.id ? currentTheme?.colors?.primary : currentTheme?.colors?.textSecondary,
                  fontSize: '0.65rem',
                  fontWeight: activeSidebar === item.id ? '700' : '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.id === 'queue' && mockConversations.length > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: isSidebarOpen ? 'calc(50% - 18px)' : '14px', 
                    backgroundColor: currentTheme?.colors?.error, 
                    color: '#fff', 
                    fontSize: '0.6rem', 
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    boxShadow: '0 0 0 2px ' + currentTheme?.colors?.surface,
                    zIndex: 10
                  }}>
                    {mockConversations.length}
                  </span>
                )}
                <item.icon size={isSidebarOpen ? 18 : 22} style={{ opacity: activeSidebar === item.id ? 1 : 0.7 }} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </div>

          {isSidebarOpen && (
            <>
              {/* Container de Busca Otimizado */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${currentTheme?.colors?.border}` }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                  padding: '8px 12px', 
                  borderRadius: '20px',
                  border: `1px solid ${currentTheme?.colors?.border}`,
                  transition: 'border-color 0.2s ease'
                }}>
                  <Search size={16} color={currentTheme?.colors?.textSecondary} />
                  <input 
                    type="text" 
                    placeholder="BUSCAR CONVERSA..." 
                    style={{ 
                      border: 'none', 
                      background: 'transparent', 
                      marginLeft: '8px', 
                      outline: 'none', 
                      width: '100%', 
                      color: currentTheme?.colors?.textPrimary,
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      letterSpacing: '0.02em'
                    }} 
                  />
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {activeSidebar === 'queue' && (
                  <div style={{ backgroundColor: currentTheme?.colors?.surface }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      color: currentTheme?.colors?.textSecondary, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      borderBottom: `1px solid ${currentTheme?.colors?.border}`, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
                    }}>
                      <span>Aguardando na Fila</span>
                      <span style={{ color: currentTheme?.colors?.primary }}>{mockConversations.length} REGISTROS</span>
                    </div>
                    {mockConversations.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: currentTheme?.colors?.textSecondary, fontSize: '0.8125rem' }}>
                        Nenhum atendimento na fila no momento.
                      </div>
                    ) : (
                      mockConversations.map((chat, index) => (
                        <div 
                          key={chat.id} 
                          style={{ 
                            padding: '16px', 
                            borderBottom: `1px solid ${currentTheme?.colors?.border}`, 
                            backgroundColor: 'transparent',
                            transition: 'background-color 0.2s ease',
                            cursor: 'default'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ 
                              fontSize: '0.6rem', 
                              fontWeight: '800', 
                              color: currentTheme?.colors?.primary, 
                              backgroundColor: currentTheme?.colors?.primary + '15', 
                              padding: '3px 8px', 
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              #{index + 1} NA FILA
                            </span>
                            <span style={{ fontSize: '0.65rem', color: currentTheme?.colors?.textSecondary, fontWeight: '600' }}>
                              {chat.time}
                            </span>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '2px', color: currentTheme?.colors?.textPrimary, textTransform: 'uppercase' }}>{chat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: currentTheme?.colors?.primary, fontWeight: '700', marginBottom: '8px' }}>{chat.phone}</div>
                          <div style={{ 
                            fontSize: '0.8125rem', 
                            color: currentTheme?.colors?.textSecondary, 
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            marginBottom: '14px' 
                          }}>
                            {chat.lastMessage}
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedChat(chat)
                              setActiveSidebar('mine')
                              notify.info('Atendimento Iniciado', `Iniciando chat com ${chat.name}`)
                            }}
                            style={{
                              width: '100%',
                              height: '36px',
                              borderRadius: '4px',
                              backgroundColor: currentTheme?.colors?.primary,
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <Send size={14} /> Atender
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeSidebar === 'mine' && (
                  <div style={{ backgroundColor: currentTheme?.colors?.surface }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      color: currentTheme?.colors?.textSecondary, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      borderBottom: `1px solid ${currentTheme?.colors?.border}`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
                    }}>
                      Meus Atendimentos
                    </div>
                    {mockConversations.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: currentTheme?.colors?.textSecondary, fontSize: '0.8125rem' }}>
                        Nenhum atendimento ativo no momento.
                      </div>
                    ) : (
                      mockConversations.map(chat => (
                        <div 
                          key={chat.id} 
                          onClick={() => setSelectedChat(chat)}
                          style={{ 
                            padding: '16px', 
                            borderBottom: `1px solid ${currentTheme?.colors?.border}`, 
                            cursor: 'pointer', 
                            backgroundColor: selectedChat?.id === chat.id ? currentTheme?.colors?.primary + '15' : 'transparent', 
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                          }}
                          onMouseLeave={(e) => {
                            if (selectedChat?.id !== chat.id) e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {selectedChat?.id === chat.id && (
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: currentTheme?.colors?.primary }} />
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.875rem', color: currentTheme?.colors?.textPrimary, textTransform: 'uppercase' }}>{chat.name}</div>
                            <span style={{ fontSize: '0.65rem', color: currentTheme?.colors?.textSecondary, fontWeight: '600' }}>{chat.time}</span>
                          </div>
                          <div style={{ 
                            fontSize: '0.8125rem', 
                            color: currentTheme?.colors?.textSecondary, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {chat.lastMessage}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeSidebar === 'contacts' && (
                  <div style={{ backgroundColor: currentTheme?.colors?.surface }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      borderBottom: `1px solid ${currentTheme?.colors?.border}`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
                    }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contatos</span>
                      <button 
                        onClick={() => handleContactAction('add')}
                        style={{ border: 'none', background: currentTheme?.colors?.primary + '15', color: currentTheme?.colors?.primary, width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {contacts.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: currentTheme?.colors?.textSecondary, fontSize: '0.8125rem' }}>
                          Nenhum contato cadastrado.
                        </div>
                      ) : (
                        contacts.map(contact => (
                          <div key={contact.id} style={{ 
                            padding: '16px', 
                            borderBottom: `1px solid ${currentTheme?.colors?.border}`, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '700', color: currentTheme?.colors?.textPrimary, fontSize: '0.8125rem', textTransform: 'uppercase' }}>{contact.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <Phone size={12} color={currentTheme?.colors?.textSecondary} />
                                <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary, fontWeight: '500' }}>{contact.phone}</span>
                              </div>
                              {contact.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                  <Mail size={12} color={currentTheme?.colors?.textSecondary} />
                                  <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{contact.email}</span>
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleContactAction('edit', contact)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary, padding: '4px' }}><Edit size={14} /></button>
                              <button onClick={() => handleContactAction('delete', contact)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.error, padding: '4px' }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeSidebar === 'history' && (
                  <div style={{ backgroundColor: currentTheme?.colors?.surface }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      color: currentTheme?.colors?.textSecondary, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      borderBottom: `1px solid ${currentTheme?.colors?.border}`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
                    }}>
                      Histórico de Atendimentos
                    </div>
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: currentTheme?.colors?.textSecondary, fontSize: '0.8125rem' }}>
                      Nenhum histórico de atendimento registrado.
                    </div>
                  </div>
                )}

                {activeSidebar === 'feedback' && (
                  <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: currentTheme?.colors?.surface }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Performance do Atendente</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ paddingBottom: '8px', borderBottom: `2px solid ${currentTheme?.colors?.primary}15` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Award size={14} color={currentTheme?.colors?.primary} />
                          <span style={{ fontSize: '0.6rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase' }}>CSAT</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: currentTheme?.colors?.textPrimary }}>4.9</div>
                      </div>

                      <div style={{ paddingBottom: '8px', borderBottom: `2px solid ${currentTheme?.colors?.primary}15` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <CheckCircle size={14} color={currentTheme?.colors?.primary} />
                          <span style={{ fontSize: '0.6rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase' }}>HOJE</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: currentTheme?.colors?.textPrimary }}>12</div>
                      </div>

                      <div style={{ paddingBottom: '8px', borderBottom: `2px solid ${currentTheme?.colors?.primary}15` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Inbox size={14} color={currentTheme?.colors?.primary} />
                          <span style={{ fontSize: '0.6rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase' }}>MÊS</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: currentTheme?.colors?.textPrimary }}>248</div>
                      </div>

                      <div style={{ paddingBottom: '8px', borderBottom: `2px solid ${currentTheme?.colors?.primary}15` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Clock size={14} color={currentTheme?.colors?.primary} />
                          <span style={{ fontSize: '0.6rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase' }}>TMA</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: currentTheme?.colors?.textPrimary }}>08:42</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase' }}>Performance Relativa</span>
                        <TrendingUp size={14} color="#22c55e" />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: currentTheme?.colors?.textPrimary, fontWeight: '700', textTransform: 'uppercase' }}>
                            <span>VOCÊ</span>
                            <span>85%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: currentTheme?.colors?.border, borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', backgroundColor: currentTheme?.colors?.primary }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: currentTheme?.colors?.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>
                            <span>MÉDIA EQUIPE</span>
                            <span>65%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: currentTheme?.colors?.border, borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '65%', height: '100%', backgroundColor: currentTheme?.colors?.textSecondary, opacity: 0.5 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Área de Chat (Independente) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: currentTheme?.colors?.background }}>
          {selectedChat ? (
            <>
              <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${currentTheme?.colors?.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: currentTheme?.colors?.surface }}>
                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', color: currentTheme?.colors?.textPrimary }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: currentTheme?.colors?.primary + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
                    <User size={18} color={currentTheme?.colors?.primary} />
                  </div>
                  {selectedChat.name}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button title="Respostas Rápidas" onClick={() => openActionModal('reply')} style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}><Reply size={18} /></button>
                  <button title="Transferir" onClick={() => openActionModal('transfer')} style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}><Shuffle size={18} /></button>
                  <button title="Agendar Tarefa" onClick={() => openActionModal('schedule')} style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}><Clock size={18} /></button>
                  <button title="Encerrar" onClick={() => openActionModal('close')} style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.error }}><CheckCircle size={18} /></button>
                  <button title="Configurações" style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textPrimary }}><Settings size={18} /></button>
                </div>
              </div>
              
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', backgroundColor: isDark ? '#1a1a1a' : '#f0f2f5', scrollbarGutter: 'stable' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '70%', backgroundColor: currentTheme?.colors?.card, padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0.5rem 0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: currentTheme?.colors?.textPrimary, fontSize: '0.9375rem' }}>
                    Olá! Como posso ajudar você hoje com seu plano de saúde?
                    <div style={{ fontSize: '0.7rem', color: currentTheme?.colors?.textSecondary, marginTop: '0.25rem', textAlign: 'right' }}>10:30</div>
                  </div>
                  
                  <div style={{ alignSelf: 'flex-end', maxWidth: '70%', backgroundColor: currentTheme?.colors?.primary, color: '#ffffff', padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0 0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '0.9375rem' }}>
                    Preciso de informações sobre a transferência de carência.
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem', textAlign: 'right' }}>10:31</div>
                  </div>

                  <div style={{ alignSelf: 'flex-start', maxWidth: '70%', backgroundColor: currentTheme?.colors?.card, padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0.5rem 0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: currentTheme?.colors?.textPrimary, fontSize: '0.9375rem' }}>
                    Claro, para a transferência de carência, você precisa apresentar a carta de permanência do plano anterior.
                    <div style={{ fontSize: '0.7rem', color: currentTheme?.colors?.textSecondary, marginTop: '0.25rem', textAlign: 'right' }}>10:32</div>
                  </div>

                  <div style={{ alignSelf: 'flex-end', maxWidth: '70%', backgroundColor: currentTheme?.colors?.primary, color: '#ffffff', padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0 0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '0.9375rem' }}>
                    Entendi. Posso enviar a foto por aqui mesmo?
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem', textAlign: 'right' }}>10:33</div>
                  </div>

                  <div style={{ alignSelf: 'flex-start', maxWidth: '70%', backgroundColor: currentTheme?.colors?.card, padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0.5rem 0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: currentTheme?.colors?.textPrimary, fontSize: '0.9375rem' }}>
                    Sim, pode enviar. Vou encaminhar para o setor de análise assim que você mandar.
                    <div style={{ fontSize: '0.7rem', color: currentTheme?.colors?.textSecondary, marginTop: '0.25rem', textAlign: 'right' }}>10:34</div>
                  </div>

                  <div style={{ alignSelf: 'flex-end', maxWidth: '70%', backgroundColor: currentTheme?.colors?.primary, color: '#ffffff', padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0 0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '0.9375rem' }}>
                    Perfeito, estou tirando a foto agora. Só um momento.
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem', textAlign: 'right' }}>10:35</div>
                  </div>

                  <div style={{ alignSelf: 'flex-start', maxWidth: '70%', backgroundColor: currentTheme?.colors?.card, padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0.5rem 0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: currentTheme?.colors?.textPrimary, fontSize: '0.9375rem' }}>
                    Sem pressa. Estarei aqui aguardando. Algo mais que eu possa adiantar para você?
                    <div style={{ fontSize: '0.7rem', color: currentTheme?.colors?.textSecondary, marginTop: '0.25rem', textAlign: 'right' }}>10:36</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${currentTheme?.colors?.border}`, display: 'flex', flexDirection: 'column', backgroundColor: currentTheme?.colors?.card, position: 'relative' }}>
                {/* Preview de arquivos anexados (colado na borda superior) */}
                {previewFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0', overflowX: 'auto', borderBottom: `1px solid ${currentTheme?.colors?.border}`, marginBottom: '0.5rem' }}>
                    {previewFiles.map(file => (
                      <div key={file.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: currentTheme?.colors?.background, padding: '0.4rem 0.75rem', borderRadius: '12px', border: `1px solid ${currentTheme?.colors?.border}`, minWidth: 'fit-content' }}>
                        <div style={{ width: '24px', height: '24px', backgroundColor: currentTheme?.colors?.primary + '20', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {file.type.startsWith('image/') ? <ImageIcon size={14} color={currentTheme?.colors?.primary} /> : <File size={14} color={currentTheme?.colors?.primary} />}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textPrimary, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <button onClick={() => removePreviewFile(file.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme?.colors?.textSecondary }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {showSuggestions && filteredReplies.length > 0 && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '1.5rem', backgroundColor: currentTheme?.colors?.card, border: `1px solid ${currentTheme?.colors?.border}`, borderRadius: '8px', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto', zIndex: 100, width: 'calc(100% - 3rem)', marginBottom: '0.5rem' }}>
                      {filteredReplies.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => insertSuggestion(r)} 
                          style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${currentTheme?.colors?.border}`, cursor: 'pointer', color: currentTheme?.colors?.textPrimary, transition: 'background-color 0.15s ease' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = currentTheme?.colors?.background}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ fontWeight: '600', fontSize: '0.8125rem' }}>/{r.title}</div>
                          <div style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.message}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => setIsAttachmentModalOpen(true)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: currentTheme?.colors?.background, color: currentTheme?.colors?.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Anexar Arquivo"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input 
                    type="text" 
                    placeholder="Digite uma mensagem ou / para respostas rápidas..." 
                    value={message}
                    onChange={handleMessageChange}
                    style={{ flex: 1, padding: '0.75rem 1rem', border: `1px solid ${currentTheme?.colors?.border}`, borderRadius: '2rem', outline: 'none', backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, fontSize: '0.9375rem' }} 
                  />

                  <button 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: currentTheme?.colors?.background, color: currentTheme?.colors?.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Enviar Áudio"
                  >
                    <Mic size={20} />
                  </button>

                  <button style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: currentTheme?.colors?.primary, color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: currentTheme?.colors?.textSecondary, padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: currentTheme?.colors?.primary + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <MessageSquare size={40} color={currentTheme?.colors?.primary} />
              </div>
              <h2 style={{ color: currentTheme?.colors?.textPrimary, marginBottom: '0.5rem' }}>Nenhum Atendimento Selecionado</h2>
              <p style={{ maxWidth: '320px' }}>Selecione uma conversa na barra lateral para iniciar o atendimento.</p>
            </div>
          )}
          
          <ConfirmationModal
            isOpen={isModalOpen}
            title={
              modalAction === 'transfer' ? "Transferir Atendimento" : 
              modalAction === 'schedule' ? "Agendar Lembrete" : 
              "Confirmar Ação"
            }
            confirmText="Confirmar"
            onConfirm={handleConfirmAction}
            onCancel={() => setIsModalOpen(false)}
          >
            {modalAction === 'transfer' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary }}>Unidade</label>
                <select 
                  value={transferData.unidade} 
                  onChange={(e) => setTransferData({...transferData, unidade: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary }}
                >
                  <option value="">Selecione a Unidade</option>
                  <option value="unidade1">Unidade Matriz</option>
                  <option value="unidade2">Unidade Regional</option>
                </select>

                <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary }}>Setor</label>
                <select 
                  value={transferData.setor} 
                  onChange={(e) => setTransferData({...transferData, setor: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary }}
                >
                  <option value="">Selecione o Setor</option>
                  <option value="financeiro">Financeiro / Cobrança</option>
                  <option value="autorizacao">Autorizações (OPME/SADT)</option>
                  <option value="comercial">Comercial / Vendas</option>
                  <option value="rede">Rede Credenciada</option>
                  <option value="ouvidoria">Ouvidoria</option>
                  <option value="faturamento">Faturamento</option>
                </select>

                <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary }}>Atendente</label>
                <select 
                  value={transferData.atendente} 
                  onChange={(e) => setTransferData({...transferData, atendente: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary }}
                >
                  <option value="fila">Encaminhar para a fila do setor</option>
                  <option value="atendente1">Atendente 1</option>
                  <option value="atendente2">Atendente 2</option>
                </select>
              </div>
            ) : modalAction === 'schedule' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary, display: 'block', marginBottom: '0.25rem' }}>Data</label>
                    <input 
                      type="date" 
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary, display: 'block', marginBottom: '0.25rem' }}>Horário</label>
                    <input 
                      type="time" 
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary, display: 'block', marginBottom: '0.25rem' }}>Mensagem do Lembrete</label>
                  <textarea 
                    placeholder="Ex: Retornar para o beneficiário sobre a autorização do exame..."
                    value={scheduleData.message}
                    onChange={(e) => setScheduleData({...scheduleData, message: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, minHeight: '100px', resize: 'none' }}
                  />
                </div>
              </div>
            ) : (
              <p style={{ color: currentTheme?.colors?.textPrimary }}>{`Tem certeza que deseja executar a ação: ${modalAction || ''}?`}</p>
            )}
          </ConfirmationModal>

          <QuickReplyModal 
            isOpen={isQuickReplyModalOpen} 
            onClose={() => setIsQuickReplyModalOpen(false)}
            quickReplies={quickReplies}
            setQuickReplies={setQuickReplies}
          />

          {/* Modal de Anexo de Arquivo */}
          {isAttachmentModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
              <motion.div 
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                dragElastic={0}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ width: '400px', backgroundColor: currentTheme?.colors?.card, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}
                  onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                  onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                >
                  <h3 style={{ margin: 0, color: currentTheme?.colors?.textPrimary }}>Anexar Arquivos</h3>
                  <button onClick={() => setIsAttachmentModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}><X size={20} /></button>
                </div>

                <div style={{ border: `2px dashed ${currentTheme?.colors?.border}`, borderRadius: '8px', padding: '2rem', textAlign: 'center', position: 'relative' }}>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                  <Paperclip size={32} color={currentTheme?.colors?.primary} style={{ marginBottom: '1rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: currentTheme?.colors?.textPrimary }}>Clique ou arraste arquivos para anexar</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Suporta múltiplos arquivos</p>
                </div>

                {attachedFiles.length > 0 && (
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {attachedFiles.map(file => (
                      <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: currentTheme?.colors?.background, borderRadius: '6px', border: `1px solid ${currentTheme?.colors?.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <File size={16} color={currentTheme?.colors?.primary} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: currentTheme?.colors?.textPrimary, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                            <span style={{ fontSize: '0.65rem', color: currentTheme?.colors?.textSecondary }}>{file.size}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFile(file.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.error }}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setIsAttachmentModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: 'transparent', color: currentTheme?.colors?.textPrimary, fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={sendWithAttachments} disabled={attachedFiles.length === 0} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: currentTheme?.colors?.primary, color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: attachedFiles.length === 0 ? 0.5 : 1 }}>Anexar {attachedFiles.length} arquivos</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Modal de Adicionar/Editar Contato */}
          {isContactModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
              <motion.div 
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                dragElastic={0}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ width: '400px', backgroundColor: currentTheme?.colors?.card, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}
                  onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                  onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                >
                  <h3 style={{ margin: 0, color: currentTheme?.colors?.textPrimary }}>{selectedContact ? 'Editar Contato' : 'Novo Contato'}</h3>
                  <button onClick={() => setIsContactModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary, display: 'block', marginBottom: '0.25rem' }}>Nome Completo</label>
                    <input 
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      placeholder="Ex: João Silva"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary, display: 'block', marginBottom: '0.25rem' }}>Telefone</label>
                    <input 
                      type="text" 
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      placeholder="Ex: (11) 99999-9999"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: currentTheme?.colors?.textSecondary, display: 'block', marginBottom: '0.25rem' }}>E-mail</label>
                    <input 
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      placeholder="Ex: joao@email.com"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setIsContactModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: 'transparent', color: currentTheme?.colors?.textPrimary, fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={saveContact} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: currentTheme?.colors?.primary, color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Salvar Contato</button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
