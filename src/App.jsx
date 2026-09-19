// Arquivo: src/App.jsx
// Descrição: Roteamento principal do sistema com integração das views de módulos e layout.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SystemLayout } from './shared/layout'
import Home from './shared/layout/views/Home'
import TussList from './modules/tuss/views/TussList'
import TussDetail from './modules/tuss/views/TussDetail'
import TussForm from './modules/tuss/views/TussForm'
import DutList from './modules/dut/views/DutList'
import UsuarioList from './modules/usuario/views/UsuarioList'
import UsuarioDetail from './modules/usuario/views/UsuarioDetail'
import UsuarioForm from './modules/usuario/views/UsuarioForm'
import AtendimentoList from './modules/atendimento/views/AtendimentoList'
import GuiaList from './modules/guias/views/GuiaList'
import GuiaDetail from './modules/guias/views/GuiaDetail'
import GuiaForm from './modules/guias/views/GuiaForm'
import PrestadorList from './modules/prestadores/views/PrestadorList'
import PrestadorDetail from './modules/prestadores/views/PrestadorDetail'
import PrestadorForm from './modules/prestadores/views/PrestadorForm'
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

          <Route path="/tuss" element={<TussList />} />
          <Route path="/tuss/novo" element={<TussForm />} />
          <Route path="/tuss/editar/:id" element={<TussForm />} />
          <Route path="/tuss/:id" element={<TussDetail />} />

          <Route path="/dut" element={<DutList />} />

          <Route path="/usuario" element={<UsuarioList />} />
          <Route path="/usuario/novo" element={<UsuarioForm />} />
          <Route path="/usuario/editar/:id" element={<UsuarioForm />} />
          <Route path="/usuario/:id" element={<UsuarioDetail />} />
          
          <Route path="/atendimento" element={<AtendimentoList />} />
          <Route path="/guias" element={<GuiaList />} />
          <Route path="/guias/novo" element={<GuiaForm />} />
          <Route path="/guias/editar/:id" element={<GuiaForm />} />
          <Route path="/guias/:id" element={<GuiaDetail />} />

          <Route path="/prestadores" element={<PrestadorList />} />
          <Route path="/prestadores/novo" element={<PrestadorForm />} />
          <Route path="/prestadores/editar/:id" element={<PrestadorForm />} />
          <Route path="/prestadores/:id" element={<PrestadorDetail />} />

          <Route path="/configuracoes" element={<SystemSettings />} />
          <Route path="/system" element={<Navigate to="/configuracoes" replace />} />
          <Route path="/system/configuracoes" element={<Navigate to="/configuracoes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
