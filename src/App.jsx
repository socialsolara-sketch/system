// Arquivo: src/App.jsx
// Descrição: Roteamento principal do sistema com integração das views de módulos e layout.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SystemLayout } from './shared/layout'
import Home from './shared/layout/views/Home'
import CadastrosList from './modules/cadastros/views/CadastrosList'
import BeneficiariosList from './modules/beneficiarios/views/BeneficiariosList'
import ComercialList from './modules/comercial/views/ComercialList'
import RegulacaoList from './modules/regulacao/views/RegulacaoList'
import ContasMedicasList from './modules/contas-medicas/views/ContasMedicasList'
import FaturamentoList from './modules/faturamento/views/FaturamentoList'
import FinanceiroList from './modules/financeiro/views/FinanceiroList'
import CobrancaList from './modules/cobranca/views/CobrancaList'
import AnsRegulatorioList from './modules/ans-regulatorio/views/AnsRegulatorioList'
import AuditoriaList from './modules/auditoria/views/AuditoriaList'
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
import EspecialidadeList from './modules/especialidades/views/EspecialidadeList'
import EspecialidadeDetail from './modules/especialidades/views/EspecialidadeDetail'
import EspecialidadeForm from './modules/especialidades/views/EspecialidadeForm'
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

          <Route path="/cadastros" element={<CadastrosList />} />
          <Route path="/beneficiarios" element={<BeneficiariosList />} />
          <Route path="/comercial" element={<ComercialList />} />
          <Route path="/regulacao" element={<RegulacaoList />} />
          <Route path="/contas-medicas" element={<ContasMedicasList />} />
          <Route path="/faturamento" element={<FaturamentoList />} />
          <Route path="/financeiro" element={<FinanceiroList />} />
          <Route path="/cobranca" element={<CobrancaList />} />
          <Route path="/ans-regulatorio" element={<AnsRegulatorioList />} />
          <Route path="/auditoria" element={<AuditoriaList />} />

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

          <Route path="/especialidades" element={<EspecialidadeList />} />
          <Route path="/especialidades/novo" element={<EspecialidadeForm />} />
          <Route path="/especialidades/editar/:id" element={<EspecialidadeForm />} />
          <Route path="/especialidades/:id" element={<EspecialidadeDetail />} />

          <Route path="/configuracoes" element={<SystemSettings />} />
          <Route path="/system" element={<Navigate to="/configuracoes" replace />} />
          <Route path="/system/configuracoes" element={<Navigate to="/configuracoes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
