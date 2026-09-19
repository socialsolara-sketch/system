// Arquivo: src/shared/context/index.js
// Descrição: Ponto central de exportação dos contextos e provedores do sistema.

export { ThemeProvider, useTheme, ThemeContext } from './ThemeContext'
export { PaginationProvider, usePagination, default as PaginationContext } from './PaginationContext'
export { NotificationProvider, useNotification, NotificationContext } from './NotificationContext'
export { ActionLockProvider, useActionLock, ActionLockContext } from './ActionLockContext'
export { InterfaceStateProvider, useInterfaceState, InterfaceStateContext } from './InterfaceStateContext'
export { default } from './ThemeContext'
