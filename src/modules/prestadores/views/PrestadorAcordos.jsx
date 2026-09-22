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
  deleteAcordo
} from '../services'
import {
  Plus,
  RefreshCw,
  ChevronLeft,
  Search
} from 'lucide-react'

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

  // Filtros Dedicados da Section (Baseados nas colunas da tabela prestadores_acordado)
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')

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
        const acordosRes = await fetchAcordosByPrestador(found.id)
        if (acordosRes.success) {
          setAcordos(acordosRes.data)
        } else {
          setAcordos([])
        }
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
            const acordosRes = await fetchAcordosByPrestador(found.id)
            if (isMounted && acordosRes.success) {
              setAcordos(acordosRes.data)
            } else {
              setAcordos([])
            }
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
    filterDataInicio.trim() ||
    filterDataFim.trim()
  )

  const handleClearAllFilters = () => {
    setSearchTerm('')
    setFilterDataInicio('')
    setFilterDataFim('')
  }

  // Filtragem dos Acordos TUSS com suporte à busca e aos filtros
  const filteredAcordos = useMemo(() => {
    return acordos.filter(item => {
      // 1. Busca rápida no Header (código TUSS e nome)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchCod = String(item.codigo_tuss || '').toLowerCase().includes(term)
        const matchNome = String(item.nome || '').toLowerCase().includes(term)
        if (!matchCod && !matchNome) return false
      }

      // 2. Filtro 1: acordo_data_inicio
      if (filterDataInicio.trim()) {
        const dtInicio = String(item.acordo_data_inicio || '')
        if (dtInicio && dtInicio < filterDataInicio) return false
      }

      // 3. Filtro 2: acordo_data_fim
      if (filterDataFim.trim()) {
        const dtFim = String(item.acordo_data_fim || '')
        if (dtFim && dtFim > filterDataFim) return false
      }

      return true
    })
  }, [acordos, searchTerm, filterDataInicio, filterDataFim])

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

  // Handlers de Navegação para Formulário Fullscreen
  const handleOpenNewModal = () => {
    navigate(`/prestadores/${id}/acordos/novo`)
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

  const handleViewFromContextMenu = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/${id}/acordos/${contextMenu.selectedItem.id}`)
    }
  }

  const handleEditFromContextMenu = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/${id}/acordos/editar/${contextMenu.selectedItem.id}`)
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
        const updatedListRes = await fetchAcordosByPrestador(prestador.id)
        if (updatedListRes.success) {
          setAcordos(updatedListRes.data)
        }
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
      render: (val, row) => String(row.nome || val || '-')
    },
    {
      key: 'acordo_data_inicio',
      header: 'Início Acordo',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val, row) => String(row.acordo_data_inicio || val || '-')
    },
    {
      key: 'acordo_data_fim',
      header: 'Fim Acordo',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val, row) => String(row.acordo_data_fim || val || '-')
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

  const prestadorNome = prestador?.nome || 'PRESTADOR'

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
                ✕
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

      {/* Seção de Filtros Dedicada com 2 Filtros de Data */}
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
          
          {/* Filtro 1: Início do Acordo (acordo_data_inicio) */}
          <div>
            <label htmlFor="filter_data_inicio" style={filterLabelStyle}>
              1. Data Início (A partir)
            </label>
            <input
              type="date"
              id="filter_data_inicio"
              value={filterDataInicio}
              onChange={(e) => setFilterDataInicio(e.target.value)}
              style={filterInputStyle}
            />
          </div>

          {/* Filtro 2: Fim do Acordo (acordo_data_fim) */}
          <div>
            <label htmlFor="filter_data_fim" style={filterLabelStyle}>
              2. Data Fim (Até)
            </label>
            <input
              type="date"
              id="filter_data_fim"
              value={filterDataFim}
              onChange={(e) => setFilterDataFim(e.target.value)}
              style={filterInputStyle}
            />
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
                ✕ Limpar Filtros
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
            onRowClick={(row) => navigate(`/prestadores/${id}/acordos/${row.id}`)}
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
        itemTitle={contextMenu.selectedItem ? `${contextMenu.selectedItem.codigo_tuss} - ${contextMenu.selectedItem.nome}` : ''}
        onView={handleViewFromContextMenu}
        onEdit={handleEditFromContextMenu}
        onDelete={handleDeleteFromContextMenu}
      />

      {/* Modal de Exclusão de Acordo */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Remover Acordo TUSS"
        description={`Deseja remover o procedimento TUSS ${deleteModal.item?.codigo_tuss} (${deleteModal.item?.nome}) da tabela de acordos de ${prestadorNome}?`}
        confirmText={deleteModal.loading ? 'Removendo...' : 'Sim, Remover'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteAcordo}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />
    </div>
  )
}
