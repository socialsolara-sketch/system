// Arquivo: src/shared/context/NotificationContext.jsx
// Descrição: Contexto e provedor para controle de notificações em tempo real, toasts e histórico.

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

// ==========================================
// Contexto de Notificações
// ==========================================

export const NotificationContext = createContext()

const STORAGE_NOTIFICATIONS_KEY = 'system_notifications_v1'

let notificationCounter = 0
function generateNotificationId() {
  notificationCounter += 1
  return `notif-${Date.now()}-${notificationCounter}`
}

const initialMockNotifications = []

// ==========================================
// Provedor de Notificações
// ==========================================

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY)
        if (saved) {
          return JSON.parse(saved)
        }
      } catch (e) {
        console.error('Erro ao ler notificações do storage', e)
      }
    }
    return initialMockNotifications
  })

  const [toasts, setToasts] = useState([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // ==========================================
  // Efeitos e Persistência
  // ==========================================

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications))
      } catch (e) {
        console.error('Erro ao salvar notificações', e)
      }
    }
  }, [notifications])

  // ==========================================
  // Métodos de Manipulação de Notificações
  // ==========================================

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  const notifyBase = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = generateNotificationId()
    const newNotification = {
      id,
      type,
      title: title || (type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : type === 'warning' ? 'Atenção' : 'Notificação'),
      message: message || '',
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications((prev) => [newNotification, ...prev])

    setToasts((prev) => {
      const activeToasts = prev.filter((t) => !t.isEvicted)
      let updated = [...prev]

      if (activeToasts.length >= 5) {
        const excessCount = (activeToasts.length + 1) - 5
        const toEvictIds = new Set(activeToasts.slice(0, excessCount).map((t) => t.id))
        updated = updated.map((t) =>
          toEvictIds.has(t.id) ? { ...t, isEvicted: true, exitDirection: 'right' } : t
        )
      }

      return [...updated, { ...newNotification, duration, isEvicted: false }]
    })

    return id
  }, [])

  const notifySuccess = useCallback((title, message, duration) => notifyBase({ type: 'success', title, message, duration }), [notifyBase])
  const notifyError = useCallback((title, message, duration) => notifyBase({ type: 'error', title, message, duration }), [notifyBase])
  const notifyWarning = useCallback((title, message, duration) => notifyBase({ type: 'warning', title, message, duration }), [notifyBase])
  const notifyInfo = useCallback((title, message, duration) => notifyBase({ type: 'info', title, message, duration }), [notifyBase])

  const notify = useMemo(() => {
    return Object.assign(
      (options) => notifyBase(options),
      {
        success: notifySuccess,
        error: notifyError,
        warning: notifyWarning,
        info: notifyInfo
      }
    )
  }, [notifyBase, notifySuccess, notifyError, notifyWarning, notifyInfo])

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setToasts([])
  }, [])

  const openPanel = useCallback(() => setIsPanelOpen(true), [])
  const closePanel = useCallback(() => setIsPanelOpen(false), [])
  const togglePanel = useCallback(() => setIsPanelOpen((prev) => !prev), [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const contextValue = useMemo(() => ({
    notifications,
    toasts,
    notify,
    dismissToast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    isPanelOpen,
    openPanel,
    closePanel,
    togglePanel,
    unreadCount
  }), [
    notifications,
    toasts,
    notify,
    dismissToast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    isPanelOpen,
    openPanel,
    closePanel,
    togglePanel,
    unreadCount
  ])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// ==========================================
// Hook de Consumo do Contexto
// ==========================================

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
