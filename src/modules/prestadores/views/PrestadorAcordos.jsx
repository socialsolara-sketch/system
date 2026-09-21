// Arquivo: src/modules/prestadores/views/PrestadorAcordos.jsx
// Descrição: Visualização e listagem dos Acordos e Códigos TUSS pactuados com o Prestador.
// Integrado com SQLite local (/src/data/database.db) via services/acordoTussService.js.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu, ConfirmationModal } from '@layout'
import { useTheme, useNotification, usePagination } from '@shared/context'
import {
  getPrestadorById,
  fetchAcordosByPrestador,
  saveAcordo,
  deleteAcordo,
  CATALOGO_TUSS_BASE
} from '../services'
import {
  Plus,
  RefreshCw,
  ChevronLeft,
  Search,
  X,
  FilterX
} from 'lucide-react'

const DEFAULT_FORM_DATA = {
  codigo_tuss: '',
  descricao: '',
  nome: '',
  grupo: 'Consultas Médicas',
  rol_ans: true,
  valor_referencia: 150.00,
  valor_acordado: 150.00,
  fator_ch: 40,
  filme_porte: 0,
  exige_autorizacao: false,
  vigencia_inicio: '2025-01-01',
  vigencia_fim: '2026-12-31',
  acordo_data_inicio: '2025-01-01',
  acordo_data_fim: '2026-12-31',
  status: 'ATIVO',
  regra_coparticipacao: 'Padrão da Operadora (20%)',
  observacoes_acordo: ''
}

export default function PrestadorAcordos() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()
  const { setPagination, resetPagination } = usePagination()

  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acordos, setAcordos] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  // Campo de busca rápida no Header
  const [searchTerm, setSearchTerm] = useState('')

  // 5 Filtros Dedicados da Section (Baseados nas colunas da tabela prestadores_acordado)
  const [filterCodigoTuss, setFilterCodigoTuss] = useState('')
  const [filterNome, setFilterNome] = useState('')
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  // Modais de Cadastro / Edição
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAcordo, setEditingAcordo] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA)

  // Modal de Exclusão
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    loading: false
  })

  // Menu de Contexto (Botão Direito)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedItem: null
  })

  // Carrega dados do Prestador e Acordos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const found = await getPrestadorById(id)
      setPrestador(found || null)
      if (found?.id) {
        const acordosList = await fetchAcordosByPrestador(found.id)
        setAcordos(acordosList)
      } else {
        setAcordos([])
      }
    } catch (err) {
      console.error('Erro ao carregar dados do prestador e acordos:', err)
      notify.error('Erro de Carregamento', 'Não foi possível carregar os acordos do prestador.')
    } finally {
      setLoading(false)
    }
  }, [id, notify])

  useEffect(() => {
    let isMounted = true
    const initFetch = async () => {
      try {
        setLoading(true)
        const found = await getPrestadorById(id)
        if (isMounted) {
          setPrestador(found || null)
          if (found?.id) {
            const acordosList = await fetchAcordosByPrestador(found.id)
            if (isMounted) setAcordos(acordosList)
          } else {
            setAcordos([])
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao carregar dados do prestador e acordos:', err)
          notify.error('Erro de Carregamento', 'Não foi possível carregar os acordos do prestador.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initFetch()
    return () => { isMounted = false }
  }, [id, notify])

  // Verificação de Filtros Ativos
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    filterCodigoTuss.trim() ||
    filterNome.trim() ||
    filterDataInicio.trim() ||
    filterDataFim.trim() ||
    filterStatus !== 'todos'
  )

  const handleClearAllFilters = () => {
    setSearchTerm('')
    setFilterCodigoTuss('')
    setFilterNome('')
    setFilterDataInicio('')
    setFilterDataFim('')
    setFilterStatus('todos')
  }

  // Filtragem dos Acordos TUSS com suporte à busca e aos 5 filtros
  const filteredAcordos = useMemo(() => {
    return acordos.filter(item => {
      // 1. Busca rápida no Header
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchCod = String(item.codigo_tuss || '').toLowerCase().includes(term)
        const matchNome = String(item.nome || item.descricao || '').toLowerCase().includes(term)
        const matchGrupo = String(item.grupo || '').toLowerCase().includes(term)
        if (!matchCod && !matchNome && !matchGrupo) return false
      }

      // 2. Filtro 1: codigo_tuss
      if (filterCodigoTuss.trim()) {
        const term = filterCodigoTuss.toLowerCase().trim()
        if (!String(item.codigo_tuss || '').toLowerCase().includes(term)) return false
      }

      // 3. Filtro 2: nome (procedimento)
      if (filterNome.trim()) {
        const term = filterNome.toLowerCase().trim()
        const nomeVal = String(item.nome || item.descricao || '').toLowerCase()
        if (!nomeVal.includes(term)) return false
      }

      // 4. Filtro 3: acordo_data_inicio
      if (filterDataInicio.trim()) {
        const dtInicio = String(item.acordo_data_inicio || item.vigencia_inicio || '')
        if (dtInicio && dtInicio < filterDataInicio) return false
      }

      // 5. Filtro 4: acordo_data_fim
      if (filterDataFim.trim()) {
        const dtFim = String(item.acordo_data_fim || item.vigencia_fim || '')
        if (dtFim && dtFim > filterDataFim) return false
      }

      // 6. Filtro 5: Status
      if (filterStatus !== 'todos') {
        const st = String(item.status || 'ATIVO').toUpperCase()
        if (st !== filterStatus) return false
      }

      return true
    })
  }, [acordos, searchTerm, filterCodigoTuss, filterNome, filterDataInicio, filterDataFim, filterStatus])

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

  // Handlers do Modal de Cadastro/Edição
  const handleOpenNewModal = () => {
    setEditingAcordo(null)
    setFormData({
      codigo_tuss: '',
      descricao: '',
      nome: '',
      grupo: 'Consultas Médicas',
      rol_ans: true,
      valor_referencia: 150.00,
      valor_acordado: 150.00,
      fator_ch: 40,
      filme_porte: 0,
      exige_autorizacao: false,
      vigencia_inicio: new Date().toISOString().slice(0, 10),
      vigencia_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      acordo_data_inicio: new Date().toISOString().slice(0, 10),
      acordo_data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'ATIVO',
      regra_coparticipacao: 'Padrão da Operadora (20%)',
      observacoes_acordo: ''
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (acordo) => {
    setEditingAcordo(acordo)
    setFormData({
      codigo_tuss: acordo.codigo_tuss || '',
      descricao: acordo.descricao || acordo.nome || '',
      nome: acordo.nome || acordo.descricao || '',
      grupo: acordo.grupo || 'Consultas Médicas',
      rol_ans: acordo.rol_ans ?? true,
      valor_referencia: acordo.valor_referencia || 0,
      valor_acordado: acordo.valor_acordado || 0,
      fator_ch: acordo.fator_ch || 0,
      filme_porte: acordo.filme_porte || 0,
      exige_autorizacao: Boolean(acordo.exige_autorizacao),
      vigencia_inicio: acordo.acordo_data_inicio || acordo.vigencia_inicio || new Date().toISOString().slice(0, 10),
      vigencia_fim: acordo.acordo_data_fim || acordo.vigencia_fim || '',
      acordo_data_inicio: acordo.acordo_data_inicio || acordo.vigencia_inicio || new Date().toISOString().slice(0, 10),
      acordo_data_fim: acordo.acordo_data_fim || acordo.vigencia_fim || '',
      status: acordo.status || 'ATIVO',
      regra_coparticipacao: acordo.regra_coparticipacao || 'Padrão da Operadora (20%)',
      observacoes_acordo: acordo.observacoes_acordo || ''
    })
    setIsModalOpen(true)
  }

  const handleSaveAcordo = async (e) => {
    e.preventDefault()
    if (!prestador?.id) return

    if (!formData.codigo_tuss.trim()) {
      notify.warning('Código Obrigatório', 'Informe o código TUSS do procedimento.')
      return
    }

    const nomeProcedimento = formData.descricao.trim() || formData.nome.trim()
    if (!nomeProcedimento) {
      notify.warning('Descrição Obrigatória', 'Informe o nome/descrição do procedimento TUSS.')
      return
    }

    try {
      const payload = {
        ...formData,
        descricao: nomeProcedimento,
        nome: nomeProcedimento,
        acordo_data_inicio: formData.vigencia_inicio || formData.acordo_data_inicio,
        acordo_data_fim: formData.vigencia_fim || formData.acordo_data_fim,
        prestador: prestador.id,
        id: editingAcordo ? editingAcordo.id : undefined
      }
      const res = await saveAcordo(prestador.id, payload)
      if (res.success) {
        const updatedList = await fetchAcordosByPrestador(prestador.id)
        setAcordos(updatedList)

        notify.success(
          editingAcordo ? 'Acordo Atualizado' : 'Procedimento Acordado',
          `Código TUSS ${formData.codigo_tuss} salvo com sucesso no banco de dados SQLite.`
        )
        setIsModalOpen(false)
      } else {
        notify.error('Erro ao Salvar', res.error || 'Falha ao gravar acordo TUSS.')
      }
    } catch (err) {
      console.error('Erro ao salvar acordo:', err)
      notify.error('Erro ao Salvar', err.message || 'Falha ao gravar acordo TUSS.')
    }
  }

  // Handler de Clique com Botão Direito na Linha (ContextMenu)
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

  const handleEditFromContextMenu = () => {
    if (contextMenu.selectedItem) {
      handleOpenEditModal(contextMenu.selectedItem)
    }
  }

  const handleDeleteFromContextMenu = () => {
    if (contextMenu.selectedItem) {
      setDeleteModal({
        isOpen: true,
        item: contextMenu.selectedItem,
        loading: false
      })
    }
  }

  // Confirmação de exclusão
  const handleConfirmDeleteAcordo = async () => {
    if (!prestador?.id || !deleteModal.item?.id) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      const res = await deleteAcordo(deleteModal.item.id)
      if (res.success) {
        const updatedList = await fetchAcordosByPrestador(prestador.id)
        setAcordos(updatedList)
        notify.success('Acordo Removido', `O procedimento TUSS ${deleteModal.item.codigo_tuss} foi excluído do acordo.`)
      } else {
        notify.error('Erro ao Excluir', res.error || 'Não foi possível remover o acordo.')
      }
    } catch (err) {
      notify.error('Erro ao Excluir', err.message || 'Não foi possível remover o acordo.')
    } finally {
      setDeleteModal({ isOpen: false, item: null, loading: false })
    }
  }

  // Colunas da Tabela de Acordos TUSS mapeadas com base no modelo prestadores_acordado
  const columns = [
    {
      key: 'codigo_tuss',
      header: 'Código TUSS',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val, row) => String(row.codigo_tuss || val || '-')
    },
    {
      key: 'nome',
      header: 'Nome do Procedimento',
      minWidth: '240px',
      maxWidth: '380px',
      render: (val, row) => String(row.nome || row.descricao || val || '-')
    },
    {
      key: 'grupo',
      header: 'Grupo',
      minWidth: '160px',
      maxWidth: '220px',
      render: (val, row) => String(row.grupo || val || '-')
    },
    {
      key: 'valor_acordado',
      header: 'Valor Acordado',
      minWidth: '140px',
      maxWidth: '170px',
      render: (val, row) => {
        const v = row.valor_acordado ?? row.valor_referencia ?? val
        if (typeof v === 'number') {
          return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        }
        return String(v || '-')
      }
    },
    {
      key: 'rol_ans',
      header: 'Rol ANS',
      minWidth: '100px',
      maxWidth: '120px',
      render: (val, row) => (row.rol_ans !== false && val !== false ? 'Sim' : 'Não')
    },
    {
      key: 'exige_autorizacao',
      header: 'Exige Guia / Autorização',
      minWidth: '170px',
      maxWidth: '210px',
      render: (val, row) => (row.exige_autorizacao || val ? 'Sim' : 'Não (Livre)')
    },
    {
      key: 'acordo_data_inicio',
      header: 'Início Acordo',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val, row) => String(row.acordo_data_inicio || row.vigencia_inicio || val || '-')
    },
    {
      key: 'acordo_data_fim',
      header: 'Fim Acordo',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val, row) => String(row.acordo_data_fim || row.vigencia_fim || val || '-')
    },
    {
      key: 'status',
      header: 'Status Acordo',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val, row) => String(row.status || val || 'ATIVO')
    }
  ]

  // Estilos compartilhados para os campos de filtro da nova section
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

  const prestadorNome = prestador?.nome_razao_social || prestador?.nome_fantasia || prestador?.nome || 'PRESTADOR'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Header Padronizado com Navegação < (NOME DO PRESTADOR) CODIGOS ACORDADO: ... Campo de Busca + Novo Acordo */}
      <Header
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/prestadores')}
              title="Voltar para a Listagem de Prestadores"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${currentTheme?.colors?.border || (isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1')}`,
                backgroundColor: currentTheme?.colors?.surface || (isDark ? '#27272a' : '#f8fafc'),
                color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#0f172a'),
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', letterSpacing: '-0.01em' }}>
                {prestadorNome.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme?.colors?.primary || '#3b82f6' }}>
                CÓDIGOS ACORDADOS
              </span>
            </div>
          </div>
        }
        subtitle={prestador ? `CRM / Conselho: ${prestador.crm || prestador.numero_conselho || '-'} • UF: ${prestador.estado || prestador.uf || 'SP'} • Total Acordado: ${acordos.length} códigos` : 'Tabela de Precificação e Procedimentos Pactuados'}
        showSearchAndFilter={false}
        actions={[
          <div key="search_header" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '230px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', color: currentTheme?.colors?.textSecondary || '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código ou nome..."
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
            key="btn_novo_acordo"
            onClick={handleOpenNewModal}
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
            Novo Acordo
          </Button>
        ]}
      />

      {/* Seção de Filtros Dedicada com até 5 Filtros */}
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
          
          {/* Filtro 1: Código TUSS */}
          <div>
            <label htmlFor="filter_codigo_tuss" style={filterLabelStyle}>
              1. Código TUSS
            </label>
            <input
              type="text"
              id="filter_codigo_tuss"
              value={filterCodigoTuss}
              onChange={(e) => setFilterCodigoTuss(e.target.value)}
              placeholder="Ex: 10101012..."
              style={filterInputStyle}
            />
          </div>

          {/* Filtro 2: Nome do Procedimento */}
          <div>
            <label htmlFor="filter_nome_procedimento" style={filterLabelStyle}>
              2. Nome do Procedimento
            </label>
            <input
              type="text"
              id="filter_nome_procedimento"
              value={filterNome}
              onChange={(e) => setFilterNome(e.target.value)}
              placeholder="Ex: Consulta, Hemograma..."
              style={filterInputStyle}
            />
          </div>

          {/* Filtro 3: Início do Acordo (acordo_data_inicio) */}
          <div>
            <label htmlFor="filter_data_inicio" style={filterLabelStyle}>
              3. Data Início (A partir)
            </label>
            <input
              type="date"
              id="filter_data_inicio"
              value={filterDataInicio}
              onChange={(e) => setFilterDataInicio(e.target.value)}
              style={filterInputStyle}
            />
          </div>

          {/* Filtro 4: Fim do Acordo (acordo_data_fim) */}
          <div>
            <label htmlFor="filter_data_fim" style={filterLabelStyle}>
              4. Data Fim (Até)
            </label>
            <input
              type="date"
              id="filter_data_fim"
              value={filterDataFim}
              onChange={(e) => setFilterDataFim(e.target.value)}
              style={filterInputStyle}
            />
          </div>

          {/* Filtro 5: Status do Acordo */}
          <div>
            <label htmlFor="filter_status_acordo" style={filterLabelStyle}>
              5. Status do Acordo
            </label>
            <select
              id="filter_status_acordo"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="EM NEGOCIAÇÃO">Em Negociação</option>
              <option value="SUSPENSO">Suspenso</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Botão de Limpeza quando há filtros ativos */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'center', height: '34px' }}>
              <button
                type="button"
                onClick={handleClearAllFilters}
                style={{
                  height: '34px',
                  padding: '0 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: isDark ? '#f87171' : '#dc2626',
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
                  border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title="Limpar todos os filtros aplicados"
              >
                <FilterX size={14} />
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Conteúdo da Tabela de Acordos com Scroll */}
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
              Carregando Tabela de Procedimentos Acordados...
            </span>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredAcordos}
            emptyMessage="Nenhum procedimento TUSS acordado para os critérios selecionados."
            onRowClick={(row) => handleOpenEditModal(row)}
            onRowContextMenu={handleRowContextMenu}
          />
        )}
      </div>

      {/* Menu de Contexto (Clique com Botão Direito na Linha) */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleCloseContextMenu}
        itemTitle={contextMenu.selectedItem ? `${contextMenu.selectedItem.codigo_tuss} - ${contextMenu.selectedItem.nome || contextMenu.selectedItem.descricao}` : ''}
        onEdit={handleEditFromContextMenu}
        onDelete={handleDeleteFromContextMenu}
      />

      {/* Modal de Cadastro / Edição de Acordo TUSS */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: currentTheme?.colors?.surface || (isDark ? '#18181b' : '#ffffff'),
              color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#09090b'),
              borderRadius: '0.75rem',
              border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e4e4e7')}`,
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e4e4e7')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800' }}>
                  {editingAcordo ? 'Editar Acordo TUSS' : 'Novo Acordo de Procedimento'}
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#71717a' }}>
                  Pactuação regulatória com {prestadorNome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme?.colors?.textSecondary || '#71717a',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Formulário */}
            <form onSubmit={handleSaveAcordo} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Código TUSS e Nome */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={filterLabelStyle}>Código TUSS *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo_tuss}
                    onChange={e => setFormData({ ...formData, codigo_tuss: e.target.value })}
                    placeholder="Ex: 10101012"
                    style={filterInputStyle}
                  />
                </div>
                <div>
                  <label style={filterLabelStyle}>Nome / Descrição do Procedimento *</label>
                  <input
                    type="text"
                    required
                    value={formData.descricao || formData.nome}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value, nome: e.target.value })}
                    placeholder="Ex: Consulta Médica em Consultório"
                    style={filterInputStyle}
                  />
                </div>
              </div>

              {/* Grupo e Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={filterLabelStyle}>Grupo de Procedimento</label>
                  <input
                    type="text"
                    value={formData.grupo}
                    onChange={e => setFormData({ ...formData, grupo: e.target.value })}
                    placeholder="Ex: Consultas Médicas, Exames..."
                    style={filterInputStyle}
                  />
                </div>
                <div>
                  <label style={filterLabelStyle}>Status do Acordo</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={filterInputStyle}
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="EM NEGOCIAÇÃO">Em Negociação</option>
                    <option value="SUSPENSO">Suspenso</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Valores Acordados */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={filterLabelStyle}>Valor Acordado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_acordado}
                    onChange={e => setFormData({ ...formData, valor_acordado: parseFloat(e.target.value) || 0 })}
                    style={filterInputStyle}
                  />
                </div>
                <div>
                  <label style={filterLabelStyle}>Valor de Referência (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_referencia}
                    onChange={e => setFormData({ ...formData, valor_referencia: parseFloat(e.target.value) || 0 })}
                    style={filterInputStyle}
                  />
                </div>
              </div>

              {/* Vigências / Datas do Acordo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={filterLabelStyle}>Data Início do Acordo</label>
                  <input
                    type="date"
                    value={formData.acordo_data_inicio || formData.vigencia_inicio}
                    onChange={e => setFormData({ ...formData, acordo_data_inicio: e.target.value, vigencia_inicio: e.target.value })}
                    style={filterInputStyle}
                  />
                </div>
                <div>
                  <label style={filterLabelStyle}>Data Fim do Acordo</label>
                  <input
                    type="date"
                    value={formData.acordo_data_fim || formData.vigencia_fim}
                    onChange={e => setFormData({ ...formData, acordo_data_fim: e.target.value, vigencia_fim: e.target.value })}
                    style={filterInputStyle}
                  />
                </div>
              </div>

              {/* Flags Regulatórias */}
              <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.rol_ans}
                    onChange={e => setFormData({ ...formData, rol_ans: e.target.checked })}
                  />
                  Procedimento do Rol ANS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.exige_autorizacao}
                    onChange={e => setFormData({ ...formData, exige_autorizacao: e.target.checked })}
                  />
                  Exige Guia / Autorização Prévia
                </label>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e4e4e7')}`
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAcordo ? 'Salvar Alterações' : 'Cadastrar Acordo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Acordo */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Remover Acordo TUSS"
        description={`Deseja remover o procedimento TUSS ${deleteModal.item?.codigo_tuss} (${deleteModal.item?.nome || deleteModal.item?.descricao}) da tabela de acordos de ${prestadorNome}?`}
        confirmText={deleteModal.loading ? 'Removendo...' : 'Sim, Remover'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteAcordo}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />
    </div>
  )
}
