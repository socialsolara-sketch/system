// Arquivo: src/shared/context/ActionLockContext.jsx
// Descrição: Gerenciador de trava global contra cliques múltiplos/rage clicks e concorrência de ações.

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export const ActionLockContext = createContext({
  isLocked: false,
  executeAction: async () => {},
  releaseLock: () => {}
})

export const ActionLockProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false)
  const isLockedRef = useRef(false)
  const location = useLocation()
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Fonte única de verdade da trava: mantém estado e ref sempre sincronizados
  const setLock = useCallback((value) => {
    isLockedRef.current = value
    if (isMountedRef.current) {
      setIsLocked(value)
    }
  }, [])

  // Reset do bloqueio global ao trocar de rota/página com um delay de segurança de 400ms.
  // Isso garante que a nova página monte por completo antes de liberar novas navegações/cliques.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLock(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [location.pathname, setLock])

  const releaseLock = useCallback(() => {
    setLock(false)
  }, [setLock])

  // ==========================================
  // Execução de Ação com Trava Global
  // ==========================================
  // A trava global agora só existe enquanto houver uma ação ASSÍNCRONA realmente pendente.
  // Ações síncronas (abrir modal, navegar, filtrar) executam imediatamente, sem cooldown
  // artificial: o cooldown fixo de 500ms era uma das causas da sensação de travamento.
  const executeAction = useCallback(async (actionFn, cooldownMs = 0) => {
    if (typeof actionFn !== 'function') return
    if (isLockedRef.current) return

    let result
    try {
      result = actionFn()
    } catch (error) {
      console.error('Erro na execução da ação:', error)
      return
    }

    // Ação síncrona: nada a travar, a interface já pode responder ao próximo clique
    if (!(result instanceof Promise)) return

    setLock(true)

    // Watchdog de segurança: nunca deixa a trava presa indefinidamente
    const watchdog = setTimeout(() => {
      console.warn('ActionLock: watchdog liberou a trava global após 10s de espera.')
      setLock(false)
    }, 10000)

    try {
      const pendingTasks = [
        result.catch((error) => {
          console.error('Erro na execução da ação:', error)
        })
      ]

      if (cooldownMs > 0) {
        pendingTasks.push(new Promise((resolve) => setTimeout(resolve, cooldownMs)))
      }

      await Promise.all(pendingTasks)
    } finally {
      clearTimeout(watchdog)
      setLock(false)
    }
  }, [setLock])

  const contextValue = useMemo(() => ({
    isLocked,
    executeAction,
    releaseLock
  }), [isLocked, executeAction, releaseLock])

  return (
    <ActionLockContext.Provider value={contextValue}>
      {children}
    </ActionLockContext.Provider>
  )
}

export const useActionLock = () => {
  const context = useContext(ActionLockContext)
  if (!context) {
    throw new Error('useActionLock deve ser usado dentro de um ActionLockProvider')
  }
  return context
}

export default ActionLockContext
