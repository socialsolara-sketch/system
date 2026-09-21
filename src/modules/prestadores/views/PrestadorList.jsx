// Arquivo: src/modules/prestadores/views/PrestadorList.jsx
// Descrição: Visualização e listagem dos prestadores da operadora (M04_PRESTADORES / M01_PESSOAS).
// Filtros em Listbox importados e padronizados com base em filterConstants.js e serviços SQLite da pasta services/.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu, ConfirmationModal } from '@layout'
import {
  PRODUTOS_LIST,
  ESPECIALIDADES_LIST,
  TIPOS_PRESTADOR_LIST,
  PLANOS_LIST
} from '../constants/filterConstants'
import { fetchPrestadores, deletePrestador } from '../services'
import { useTheme, useNotification, usePagination } from '@shared/context'
import {
  Plus,
  RefreshCw,
  Search,
  X
} from 'lucide-react'

export default function PrestadorList() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { currentTheme, isDark } = useTheme()
  const { setPagination, resetPagination } = usePagination()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Filtros de busca no header e filtros da section dedicada
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstrutura, setFilterEstrutura] = useState('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState('todos')
  const [filterPlano, setFilterPlano] = useState('todos')
  const [filterProduto, setFilterProduto] = useState('todos')
  const [filterContrato, setFilterContrato] = useState('todos')

  // Estado para exclusão com modal de confirmação
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    loading: false
  })

  // Estado do Menu de Contexto (Botão Direito)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedItem: null
  })

  // Carrega dados da camada de serviço SQLite
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPrestadores()
      if (res.success) {
        setData(res.data)
      } else {
        notify.error('Erro ao Carregar', res.error || 'Falha ao consultar prestadores no banco de dados SQLite.')
      }
    } catch (err) {
      console.error('[PrestadorList] Erro ao carregar:', err)
      notify.error('Falha', 'Falha ao carregar os dados de prestadores.')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    let isMounted = true
    const initFetch = async () => {
      try {
        setLoading(true)
        const res = await fetchPrestadores()
        if (isMounted) {
          if (res.success) {
            setData(res.data)
          } else {
            notify.error('Erro ao Carregar', res.error || 'Falha ao consultar prestadores no banco de dados SQLite.')
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[PrestadorList] Erro ao carregar:', err)
          notify.error('Falha', 'Falha ao carregar os dados de prestadores.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initFetch()
    return () => { isMounted = false }
  }, [notify])

  // Filtragem dos dados de prestadores utilizando as constantes de filterConstants.js
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Busca rápida no Header
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchNome = String(item.nome_razao_social || item.nome_fantasia || item.nome || '').toLowerCase().includes(term)
        const matchCrm = String(item.crm || item.numero_conselho || '').toLowerCase().includes(term)
        const matchEsp = String(item.especialidade || item.cbos || '').toLowerCase().includes(term)
        const matchEst = String(item.estrutura || item.tipo_prestador || '').toLowerCase().includes(term)
        const matchMun = String(item.municipio || item.cidade || '').toLowerCase().includes(term)
        const matchUf = String(item.estado || item.uf || item.uf_conselho || '').toLowerCase().includes(term)
        if (!matchNome && !matchCrm && !matchEsp && !matchEst && !matchMun && !matchUf) return false
      }

      // 2. Filtro 1: Estrutura (TIPOS_PRESTADOR_LIST)
      if (filterEstrutura !== 'todos') {
        const estVal = String(item.estrutura || item.tipo_prestador || '').toLowerCase()
        const filterTerm = filterEstrutura.toLowerCase()
        if (!estVal.includes(filterTerm) && !filterTerm.includes(estVal)) return false
      }

      // 3. Filtro 2: Especialidade (ESPECIALIDADES_LIST)
      if (filterEspecialidade !== 'todos') {
        const espVal = String(item.especialidade || item.cbos || '').toLowerCase()
        const filterTerm = filterEspecialidade.toLowerCase()
        if (!espVal.includes(filterTerm) && !filterTerm.includes(espVal)) return false
      }

      // 4. Filtro 3: Plano (PLANOS_LIST)
      if (filterPlano !== 'todos') {
        const planoVal = String(item.plano || item.planos || item.nome_plano || '').toLowerCase()
        const filterTerm = filterPlano.toLowerCase()
        if (!planoVal.includes(filterTerm) && !filterTerm.includes(planoVal)) return false
      }

      // 5. Filtro 4: Produto (PRODUTOS_LIST)
      if (filterProduto !== 'todos') {
        const prodVal = String(item.produto || item.rede_produto || item.segmento || item.abrangencia || '').toLowerCase()
        const filterTerm = filterProduto.toLowerCase()
        if (!prodVal.includes(filterTerm) && !filterTerm.includes(prodVal)) return false
      }

      // 6. Filtro 5: Contrato Ativo
      if (filterContrato !== 'todos') {
        const st = String(item.status_credenciamento || item.status || '').toUpperCase()
        const isAtivo = (st === 'ATIVO' || item.contrato_ativo === 'Sim' || item.contrato_ativo === true) && !item.data_descredenciamento
        const isSuspenso = st === 'SUSPENSO' || item.contrato_ativo === 'Suspenso'
        if (filterContrato === 'ATIVO' && !isAtivo) return false
        if (filterContrato === 'DESCREDENCIADO' && isAtivo) return false
        if (filterContrato === 'SUSPENSO' && !isSuspenso) return false
      }

      return true
    })
  }, [data, searchTerm, filterEstrutura, filterEspecialidade, filterPlano, filterProduto, filterContrato])

  // Abertura do modal de exclusão
  const handleOpenDelete = (e, item) => {
    e?.stopPropagation()
    setDeleteModal({
      isOpen: true,
      item,
      loading: false
    })
  }

  // Confirmação de exclusão direta via serviço SQLite
  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      const idToDelete = deleteModal.item.id
      const res = await deletePrestador(idToDelete)
      if (res.success) {
        setData(prev => prev.filter(p => String(p.id).toLowerCase() !== String(idToDelete).toLowerCase()))
        notify.success(
          'Prestador Removido',
          `O prestador ${deleteModal.item.nome_razao_social || deleteModal.item.nome} foi excluído com sucesso.`
        )
      } else {
        notify.error('Erro na Exclusão', res.error || 'Não foi possível excluir o prestador.')
      }
    } catch (err) {
      console.error('Erro ao excluir prestador:', err)
      notify.error('Erro na Exclusão', err.message || 'Não foi possível excluir o prestador.')
    } finally {
      setDeleteModal({ isOpen: false, item: null, loading: false })
    }
  }

  // Handler de Clique com Botão Direito na Linha
  const handleRowContextMenu = (e, row) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedItem: row
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  const handleView = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/${contextMenu.selectedItem.id}`)
    }
  }

  const handleViewAcordos = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/${contextMenu.selectedItem.id}/acordos`)
    }
  }

  const handleEdit = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/editar/${contextMenu.selectedItem.id}`)
    }
  }

  const handleDeleteFromContextMenu = () => {
    if (contextMenu.selectedItem) {
      handleOpenDelete(null, contextMenu.selectedItem)
    }
  }

  // Paginação
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
  }, [])

  useEffect(() => {
    setPagination({
      currentPage,
      totalPages: 1,
      onPageChange: handlePageChange,
      visible: true
    })

    return () => {
      resetPagination()
    }
  }, [currentPage, handlePageChange, setPagination, resetPagination])

  // Colunas da Tabela de Prestadores
  const columns = [
    {
      key: 'crm',
      header: 'CRM',
      minWidth: '100px',
      maxWidth: '130px',
      render: (val, row) => String(val || row.numero_conselho || row.crm || '-')
    },
    {
      key: 'nome',
      header: 'Nome',
      minWidth: '220px',
      maxWidth: '320px',
      render: (val, row) => String(val || row.nome_razao_social || row.nome_fantasia || row.nome || '-')
    },
    {
      key: 'especialidade',
      header: 'Especialidade',
      minWidth: '170px',
      maxWidth: '240px',
      render: (val, row) => String(val || row.especialidade || row.cbos || '-')
    },
    {
      key: 'atendimento',
      header: 'Atendimento',
      minWidth: '130px',
      maxWidth: '160px',
      render: (val, row) => String(val || row.atendimento || row.modalidade_atendimento || 'Presencial')
    },
    {
      key: 'idade',
      header: 'Idade',
      minWidth: '140px',
      maxWidth: '180px',
      render: (val, row) => String(val || row.idade || row.atendimento_idade || row.faixa_etaria || 'Todas as idades')
    },
    {
      key: 'estrutura',
      header: 'Estrutura',
      minWidth: '130px',
      maxWidth: '170px',
      render: (val, row) => String(val || row.estrutura || row.tipo_prestador || '-')
    },
    {
      key: 'unidade',
      header: 'Unidade',
      minWidth: '160px',
      maxWidth: '220px',
      render: (val, row) => String(val || row.unidade || row.nome_fantasia || '-')
    },
    {
      key: 'credenciado',
      header: 'Credenciado',
      minWidth: '110px',
      maxWidth: '140px',
      render: (val, row) => {
        if (val !== undefined && val !== null && String(val).trim() !== '') return String(val)
        if (row.credenciado) return String(row.credenciado)
        const st = String(row.status_credenciamento || row.status || '').toUpperCase()
        if (st === 'DESCREDENCIADO') return 'Não'
        return 'Sim'
      }
    },
    {
      key: 'contrato_ativo',
      header: 'Contrato Ativo',
      minWidth: '125px',
      maxWidth: '150px',
      render: (val, row) => {
        if (val !== undefined && val !== null && String(val).trim() !== '') return String(val)
        if (row.contrato_ativo) return String(row.contrato_ativo)
        const st = String(row.status_credenciamento || row.status || '').toUpperCase()
        if (st === 'ATIVO' && !row.data_descredenciamento) return 'Sim'
        if (st === 'SUSPENSO') return 'Suspenso'
        return 'Não'
      }
    },
    {
      key: 'contrato_desativado',
      header: 'Contrato Desativado',
      minWidth: '160px',
      maxWidth: '190px',
      render: (val, row) => {
        if (val !== undefined && val !== null && String(val).trim() !== '') return String(val)
        if (row.contrato_desativado) return String(row.contrato_desativado)
        if (row.data_descredenciamento) return String(row.data_descredenciamento)
        const st = String(row.status_credenciamento || row.status || '').toUpperCase()
        if (st === 'DESCREDENCIADO') return 'Sim'
        return 'Não'
      }
    },
    {
      key: 'estado',
      header: 'Estado',
      minWidth: '90px',
      maxWidth: '110px',
      render: (val, row) => String(val || row.estado || row.uf || row.uf_conselho || '-')
    },
    {
      key: 'municipio_endereco',
      header: 'Município e Endereço',
      minWidth: '230px',
      maxWidth: '340px',
      render: (val, row) => {
        if (val && typeof val === 'string' && val.trim() !== '') return val
        if (row['MUNICÍPIO ENDERECO']) return String(row['MUNICÍPIO ENDERECO'])
        if (row.municipio_endereco) return String(row.municipio_endereco)
        const mun = row.municipio || row.cidade || ''
        const end = row.endereco || row.logradouro || ''
        if (mun && end) return `${mun}, ${end}`
        return String(mun || end || '-')
      }
    },
    {
      key: 'numero_endereco',
      header: 'Número',
      minWidth: '100px',
      maxWidth: '130px',
      render: (val, row) => String(val || row.numero_endereco || row.numero || 'S/N')
    }
  ]

  // Estilos compartilhados de filtros
  const filterInputStyle = {
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    outline: 'none',
    width: '100%',
    height: '34px',
    boxSizing: 'border-box'
  }

  const filterLabelStyle = {
    fontSize: '0.6875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#4b5563'),
    marginBottom: '0.3rem',
    display: 'block'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Header Padronizado com Busca e Ações */}
      <Header
        title="Rede Prestadora"
        subtitle="Gestão de Credenciamento, Estabelecimentos de Saúde e Corpo Clínico"
        showSearchAndFilter={false}
        actions={[
          <div key="search_header" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '230px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', color: currentTheme?.colors?.textSecondary || '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por CRM, nome ou UF..."
              style={{
                width: '100%',
                height: '34px',
                padding: '0 26px 0 32px',
                fontSize: '0.8125rem',
                color: currentTheme?.colors?.textPrimary || 'inherit',
                backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
                border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
                borderRadius: '6px',
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentTheme?.colors?.textSecondary || '#9ca3af',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>,
          <Button
            key="cadastrar"
            to="/prestadores/novo"
            style={{
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: '700',
              fontSize: '0.8125rem'
            }}
          >
            <Plus size={15} />
            Novo Prestador
          </Button>
        ]}
      />

      {/* Seção de Filtros Dedicada: Todos em Listbox baseados nas listas de filterConstants.js */}
      <section
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: currentTheme ? currentTheme.colors.surfaceMuted || currentTheme.colors.backgroundSecondary : (isDark ? '#141416' : '#f8fafc'),
          borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0')}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          
          {/* Filtro 1: Estrutura / Tipo de Prestador (TIPOS_PRESTADOR_LIST) */}
          <div>
            <label htmlFor="filter_estrutura" style={filterLabelStyle}>
              1. Estrutura
            </label>
            <select
              id="filter_estrutura"
              value={filterEstrutura}
              onChange={(e) => setFilterEstrutura(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todas as Estruturas</option>
              {TIPOS_PRESTADOR_LIST.map(tipo => (
                <option key={tipo.code} value={tipo.label}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 2: Especialidade (ESPECIALIDADES_LIST) */}
          <div>
            <label htmlFor="filter_especialidade" style={filterLabelStyle}>
              2. Especialidade
            </label>
            <select
              id="filter_especialidade"
              value={filterEspecialidade}
              onChange={(e) => setFilterEspecialidade(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todas as Especialidades</option>
              {ESPECIALIDADES_LIST.map(esp => (
                <option key={esp.code + esp.label} value={esp.label}>
                  {esp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Plano (PLANOS_LIST) */}
          <div>
            <label htmlFor="filter_plano" style={filterLabelStyle}>
              3. Plano
            </label>
            <select
              id="filter_plano"
              value={filterPlano}
              onChange={(e) => setFilterPlano(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todos os Planos</option>
              {PLANOS_LIST.map(plano => (
                <option key={plano.code} value={plano.label}>
                  {plano.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 4: Produto (PRODUTOS_LIST) */}
          <div>
            <label htmlFor="filter_produto" style={filterLabelStyle}>
              4. Produto
            </label>
            <select
              id="filter_produto"
              value={filterProduto}
              onChange={(e) => setFilterProduto(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todos os Produtos</option>
              {PRODUTOS_LIST.filter(p => p.id).map(prod => (
                <option key={prod.id} value={prod.label}>
                  {prod.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 5: Status Contratual */}
          <div>
            <label htmlFor="filter_contrato" style={filterLabelStyle}>
              5. Contrato Ativo
            </label>
            <select
              id="filter_contrato"
              value={filterContrato}
              onChange={(e) => setFilterContrato(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todos os Contratos</option>
              <option value="ATIVO">Contrato Ativo (Sim)</option>
              <option value="DESCREDENCIADO">Desativado / Não</option>
              <option value="SUSPENSO">Suspenso</option>
            </select>
          </div>
        </div>
      </section>

      {/* Conteúdo da Tabela com Scroll Suave */}
      <div
        className="system-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
            <RefreshCw size={32} className="animate-spin" color={currentTheme?.colors?.primary || '#2563eb'} />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: currentTheme?.colors?.textSecondary }}>
              Carregando Rede de Prestadores da Operadora...
            </span>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredData}
            emptyMessage="Nenhum prestador encontrado para os filtros selecionados."
            onRowClick={(row) => navigate(`/prestadores/${row.id}`)}
            onRowContextMenu={handleRowContextMenu}
          />
        )}
      </div>

      {/* Menu de Contexto (Clique com Botão Direito) */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleCloseContextMenu}
        itemTitle={contextMenu.selectedItem ? (contextMenu.selectedItem.nome_razao_social || contextMenu.selectedItem.nome) : ''}
        onView={handleView}
        onViewAcordos={handleViewAcordos}
        onEdit={handleEdit}
        onDelete={handleDeleteFromContextMenu}
      />

      {/* Modal de Confirmação Segura de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Prestador da Rede"
        description={`Tem certeza que deseja excluir o prestador "${deleteModal.item?.nome_razao_social || deleteModal.item?.nome}" (${deleteModal.item?.codigo_operadora_prestador || 'RDA'})? Esta ação removerá o registro cadastral da rede credenciada.`}
        confirmText={deleteModal.loading ? 'Excluindo...' : 'Sim, Excluir'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />
    </div>
  )
}
