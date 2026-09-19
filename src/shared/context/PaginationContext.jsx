// Arquivo: src/shared/context/PaginationContext.jsx
// Descrição: Contexto e provedor para sincronização da barra global de paginação no rodapé do sistema.

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// ==========================================
// Contexto de Paginação
// ==========================================

const PaginationContext = createContext()

// ==========================================
// Provedor de Paginação
// ==========================================

export const PaginationProvider = ({ children }) => {
  const [pagination, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    onPageChange: null,
    visible: false
  })

  const setPagination = useCallback((config) => {
    setPaginationState((prev) => {
      const isSame =
        prev.currentPage === config.currentPage &&
        prev.totalPages === config.totalPages &&
        prev.visible === (config.visible ?? prev.visible) &&
        prev.onPageChange === (config.onPageChange ?? prev.onPageChange)
      if (isSame) return prev
      return {
        ...prev,
        ...config
      }
    })
  }, [])

  const resetPagination = useCallback(() => {
    setPaginationState((prev) => {
      if (!prev.visible && prev.currentPage === 1 && prev.totalPages === 1 && prev.onPageChange === null) {
        return prev
      }
      return {
        currentPage: 1,
        totalPages: 1,
        onPageChange: null,
        visible: false
      }
    })
  }, [])

  const value = useMemo(() => ({
    ...pagination,
    setPagination,
    resetPagination
  }), [pagination, setPagination, resetPagination])

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  )
}

// ==========================================
// Hook de Consumo da Paginação
// ==========================================

export const usePagination = () => {
  const context = useContext(PaginationContext)
  return context || {
    currentPage: 1,
    totalPages: 1,
    onPageChange: null,
    visible: false,
    setPagination: () => {},
    resetPagination: () => {}
  }
}

export default PaginationContext
