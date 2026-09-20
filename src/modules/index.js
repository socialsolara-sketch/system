// Arquivo: src/modules/index.js
// Descrição: Registro de catálogo de módulos do sistema e funções auxiliares de rota.

// ==========================================
// Catálogo de Módulos
// ==========================================

export const modules = [
  {
    id: 'cadastros',
    label: 'Cadastros',
    description: 'Pessoas Físicas, Jurídicas, Endereços e Contas Bancárias (M01)',
    path: '/cadastros',
    summaryLabel: 'Cadastros'
  },
  {
    id: 'beneficiarios',
    label: 'Beneficiários',
    description: 'Gestão de Vidas, Carências ANS, CPT e Vínculos Contratuais (M02)',
    path: '/beneficiarios',
    summaryLabel: 'Beneficiários'
  },
  {
    id: 'comercial',
    label: 'Comercial & Planos',
    description: 'Contratos PME/PF/PJ, Planos Regulamentados e Faixas Etárias (M03)',
    path: '/comercial',
    summaryLabel: 'Comercial'
  },
  {
    id: 'regulacao',
    label: 'Regulação Médica',
    description: 'Autorizações TISS, Validação de DUT ANS e Perícia Médica (M05)',
    path: '/regulacao',
    summaryLabel: 'Regulação'
  },
  {
    id: 'contas-medicas',
    label: 'Contas Médicas',
    description: 'Lotes XML TISS, Auditoria Automatizada e Glosas (M06)',
    path: '/contas-medicas',
    summaryLabel: 'Contas Médicas'
  },
  {
    id: 'faturamento',
    label: 'Faturamento',
    description: 'Fechamento de Mensalidades, Coparticipação e Demonstrativos (M07)',
    path: '/faturamento',
    summaryLabel: 'Faturamento'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    description: 'Contas a Pagar, Contas a Receber e Rateio DRE Centros de Custo (M08)',
    path: '/financeiro',
    summaryLabel: 'Financeiro'
  },
  {
    id: 'cobranca',
    label: 'Cobrança & Bancos',
    description: 'Boletos Bancários, PIX QR Code Dinâmico e Arquivos CNAB (M09)',
    path: '/cobranca',
    summaryLabel: 'Cobrança'
  },
  {
    id: 'ans-regulatorio',
    label: 'ANS & Regulatório',
    description: 'SIP Trimestral, DIOPS Financeiro/Patrimonial e Provisões ANS (M10)',
    path: '/ans-regulatorio',
    summaryLabel: 'Regulatório'
  },
  {
    id: 'auditoria',
    label: 'Auditoria & Logs',
    description: 'Trilha Imutável de Rastreabilidade, Snapshots Diff e Segurança (M11)',
    path: '/auditoria',
    summaryLabel: 'Auditoria'
  },
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
    description: 'Gestão de Usuários, Perfis e Acessos ao Sistema',
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
    label: 'Guias TISS',
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
  },
  {
    id: 'especialidades',
    label: 'Especialidades',
    description: 'Especialidades médicas e integração Google Sheets',
    path: '/especialidades',
    summaryLabel: 'Especialidades'
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
