// Arquivo: src/main.jsx
// Descrição: Ponto de entrada da aplicação React com ativação da proteção de cliques de captura e Error Boundary.

import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { enableGlobalClickGuard } from './shared/preventRageClicks'
import { ErrorBoundary } from './shared/layout/ErrorBoundary'

// Ativa proteção em fase de captura de todos os eventos de Pointer com a estratégia híbrida definitiva.
// Cooldown global desligado (0) e apenas 320ms por elemento: o suficiente para evitar duplo clique
// acidental, sem bloquear cliques em elementos diferentes.
enableGlobalClickGuard(0, 320)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
