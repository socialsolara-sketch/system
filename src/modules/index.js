// Arquivo: src/modules/index.js
// Descrição: Registro de catálogo de módulos do sistema e funções auxiliares de rota.

// ==========================================
// Catálogo de Módulos
// ==========================================

export const modules = [
  {
    id: 'tuss',
    label: 'TUSS',
    description: 'Terminologia Unificada da Saúde Suplementar',
    path: '/tuss',
    summaryLabel: 'Registros'
  },
  {
    id: 'dut',
    label: 'DUT',
    description: 'Diretrizes de Utilização (ANS)',
    path: '/dut',
    summaryLabel: 'Diretrizes'
  },
  {
    id: 'usuario',
    label: 'Usuários',
    description: 'Beneficiários e Cadastro Geral de Usuários',
    path: '/usuario',
    summaryLabel: 'Usuários'
  },
  {
    id: 'atendimento',
    label: 'Atendimentos',
    description: 'Gestão de conversas com prestadores e beneficiários',
    path: '/atendimento',
    summaryLabel: 'Atendimentos'
  },
  {
    id: 'guias',
    label: 'Guias',
    description: 'Gestão e autorização de guias médicas',
    path: '/guias',
    summaryLabel: 'Guias'
  },
  {
    id: 'prestadores',
    label: 'Prestadores',
    description: 'Rede credenciada e integração Google Sheets',
    path: '/prestadores',
    summaryLabel: 'Prestadores'
  }
]

// ==========================================
// Views Internas do Sistema
// ==========================================

export const systemViews = {
  home: { path: '/', label: 'Home' },
  settings: { path: '/configuracoes', label: 'Configurações' }
}

// ==========================================
// Funções Utilitárias de Busca e Navegação
// ==========================================

export const getModule = (id) => modules.find((module) => module.id === id) || null

export const getModuleByPath = (pathname = '') =>
  modules.find(
    (module) => pathname === module.path || pathname.startsWith(`${module.path}/`)
  ) || null

export const getModuleNavItems = () =>
  modules.map(({ id, label, path, description }) => ({ id, label, path, description }))

export default modules
