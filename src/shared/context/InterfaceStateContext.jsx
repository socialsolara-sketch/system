// Arquivo: src/shared/context/InterfaceStateContext.jsx
// Descrição: Gerenciador de Máquina de Estados Único para controle exclusivo de interfaces (modais, gavetas e sobreposições).

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export const UI_STATE = {
  CLOSED: 'CLOSED',
  VIEWING: 'VIEWING',
  EDITING: 'EDITING',
  CREATING: 'CREATING'
}

export const InterfaceStateContext = createContext({
  uiState: UI_STATE.CLOSED,
  activeId: null,
  activeData: null,
  openViewing: () => {},
  openEditing: () => {},
  openCreating: () => {},
  closeAll: () => {}
})

export const InterfaceStateProvider = ({ children }) => {
  const [uiState, setUiState] = useState(UI_STATE.CLOSED)
  const [activeId, setActiveId] = useState(null)
  const [activeData, setActiveData] = useState(null)
  const location = useLocation()

  // Limpa todos os estados de modais/gavetas ao trocar de página, aba ou fechar uma tela
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setUiState(UI_STATE.CLOSED)
      setActiveId(null)
      setActiveData(null)
    })
    return () => cancelAnimationFrame(handle)
  }, [location.pathname])

  const openViewing = useCallback((id, data = null) => {
    setUiState(UI_STATE.VIEWING)
    setActiveId(id)
    setActiveData(data)
  }, [])

  const openEditing = useCallback((id, data = null) => {
    setUiState(UI_STATE.EDITING)
    setActiveId(id)
    setActiveData(data)
  }, [])

  const openCreating = useCallback(() => {
    setUiState(UI_STATE.CREATING)
    setActiveId(null)
    setActiveData(null)
  }, [])

  const closeAll = useCallback(() => {
    setUiState(UI_STATE.CLOSED)
    setActiveId(null)
    setActiveData(null)
  }, [])

  const contextValue = useMemo(() => ({
    uiState,
    activeId,
    activeData,
    openViewing,
    openEditing,
    openCreating,
    closeAll,
    isClosed: uiState === UI_STATE.CLOSED,
    isViewing: uiState === UI_STATE.VIEWING,
    isEditing: uiState === UI_STATE.EDITING,
    isCreating: uiState === UI_STATE.CREATING
  }), [uiState, activeId, activeData, openViewing, openEditing, openCreating, closeAll])

  return (
    <InterfaceStateContext.Provider value={contextValue}>
      {children}
    </InterfaceStateContext.Provider>
  )
}

export const useInterfaceState = () => {
  const context = useContext(InterfaceStateContext)
  if (!context) {
    throw new Error('useInterfaceState deve ser usado dentro de um InterfaceStateProvider')
  }
  return context
}
