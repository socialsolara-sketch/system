// Arquivo: src/App.jsx
// Descrição: Roteamento principal do sistema com foco exclusivo no módulo Prestadores.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SystemLayout } from './shared/layout'
import Home from './shared/layout/views/Home'
import PrestadorList from './modules/prestadores/views/PrestadorList'
import PrestadorDetail from './modules/prestadores/views/PrestadorDetail'
import PrestadorForm from './modules/prestadores/views/PrestadorForm'
import PrestadorAcordos from './modules/prestadores/views/PrestadorAcordos'
import SystemSettings from './shared/layout/views/SystemSettings'

// ==========================================
// Componente de Roteamento Principal
// ==========================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SystemLayout />}>
          <Route index element={<Home />} />

          <Route path="/prestadores" element={<PrestadorList />} />
          <Route path="/prestadores/novo" element={<PrestadorForm />} />
          <Route path="/prestadores/editar/:id" element={<PrestadorForm />} />
          <Route path="/prestadores/:id/acordos" element={<PrestadorAcordos />} />
          <Route path="/prestadores/acordos/:id" element={<PrestadorAcordos />} />
          <Route path="/prestadores/:id" element={<PrestadorDetail />} />

          <Route path="/configuracoes" element={<SystemSettings />} />
          <Route path="/system" element={<Navigate to="/configuracoes" replace />} />
          <Route path="/system/configuracoes" element={<Navigate to="/configuracoes" replace />} />
          
          {/* Redirecionamento padrão para prestadores */}
          <Route path="*" element={<Navigate to="/prestadores" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
