// Arquivo: src/modules/index.js
// Descrição: Registro de catálogo de módulos do sistema e funções auxiliares de rota.

// ==========================================
// Catálogo de Módulos (Apenas Prestadores)
// ==========================================

export const modules = [
  {
    id: 'prestadores',
    label: 'Prestadores',
    description: 'Rede credenciada e gestão de prestadores de serviços de saúde',
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
