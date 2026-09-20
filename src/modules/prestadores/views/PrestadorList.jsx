// Arquivo: src/modules/prestadores/views/PrestadorList.jsx
// Descrição: Visualização e listagem dos prestadores da operadora (M04_PRESTADORES / M01_PESSOAS).
// Inclui seção em linha dedicada para filtros, ausência de badges/pills coloridos nas células e estilização padronizada.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu, ConfirmationModal } from '@layout'
import { fetchPrestadoresFromSheets, syncAllSheetsFromGoogle, deletePrestadorFromSheets } from '../services/sheetsService'
import { useTheme, useNotification, usePagination } from '@shared/context'
import { Plus, RefreshCw, UserPlus, Database, Eye, Edit, Trash2, Search, X } from 'lucide-react'

export default function PrestadorList() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { currentTheme, isDark } = useTheme()
  const { setPagination, resetPagination } = usePagination()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)
  const [error, setError] = useState(null)
  
  // Estados de filtros da seção em linha
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [ufFilter, setUfFilter] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)

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

  // Carrega os dados de M04_PRESTADORES e M01_PESSOAS
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPrestadoresFromSheets()
      setData(result.data || [])
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Falha na conexão com os dados de prestadores.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const initFetch = async () => {
      try {
        const result = await fetchPrestadoresFromSheets()
        if (isMounted) {
          setData(result.data || [])
          if (result.error) setError(result.error)
        }
      } catch (err) {
        if (isMounted) setError('Falha na conexão com os dados de prestadores.')
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    initFetch()
    return () => { isMounted = false }
  }, [])

  // Sincronização de abas da planilha
  const handleSyncAllSheets = async () => {
    setSyncingAll(true)
    try {
      notify.info('Sincronizando...', 'Consultando tabelas M04_PRESTADORES e M01_PESSOAS na planilha Google Sheets...')
      const syncResult = await syncAllSheetsFromGoogle()
      await loadData()

      if (syncResult.errors && syncResult.errors.length > 0) {
        notify.warning(
          'Sincronização com Avisos',
          `Abas consultadas. Algumas observações: ${syncResult.errors[0]}`
        )
      } else {
        notify.success(
          'Planilha Sincronizada!',
          'Dados de prestadores e pessoas atualizados a partir da planilha Google Sheets.'
        )
      }
    } catch (err) {
      console.error('Erro na sincronização completa:', err)
      notify.error('Erro ao Sincronizar', err.message || 'Falha na comunicação com o Google Sheets.')
    } finally {
      setSyncingAll(false)
    }
  }

  // Abertura do modal de exclusão
  const handleOpenDelete = (e, item) => {
    e?.stopPropagation()
    setDeleteModal({
      isOpen: true,
      item,
      loading: false
    })
  }

  // Confirmação de exclusão
  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      const idToDelete = deleteModal.item.id
      await deletePrestadorFromSheets(idToDelete)
      setData(prev => prev.filter(p => String(p.id).toLowerCase() !== String(idToDelete).toLowerCase()))
      notify.success(
        'Prestador Removido',
        `O prestador ${deleteModal.item.nome_razao_social || deleteModal.item.nome} foi excluído com sucesso.`
      )
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

  // Lista de UFs disponíveis nos dados
  const availableUfs = useMemo(() => {
    const ufs = new Set()
    data.forEach(item => {
      const uf = item.uf || item.uf_conselho
      if (uf && uf.trim().length === 2) {
        ufs.add(uf.trim().toUpperCase())
      }
    })
    return Array.from(ufs).sort()
  }, [data])

  // Filtros combinados (busca textual + status + tipo + UF)
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filtro de status
      if (statusFilter && statusFilter !== 'todos') {
        const itemStatus = String(item.status_credenciamento || item.status || '').toUpperCase()
        if (itemStatus !== statusFilter.toUpperCase()) return false
      }

      // Filtro de tipo
      if (tipoFilter && tipoFilter !== 'todos') {
        const itemTipo = String(item.tipo_prestador || item.tipo || '').toUpperCase()
        if (itemTipo !== tipoFilter.toUpperCase()) return false
      }

      // Filtro de UF
      if (ufFilter && ufFilter !== 'todos') {
        const itemUf = String(item.uf || item.uf_conselho || '').toUpperCase()
        if (itemUf !== ufFilter.toUpperCase()) return false
      }

      // Busca textual
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()

      return (
        String(item.nome_razao_social || '').toLowerCase().includes(q) ||
        String(item.nome_fantasia || '').toLowerCase().includes(q) ||
        String(item.nome || '').toLowerCase().includes(q) ||
        String(item.cpf_cnpj || '').toLowerCase().includes(q) ||
        String(item.codigo_operadora_prestador || '').toLowerCase().includes(q) ||
        String(item.conselho_profissional || '').toLowerCase().includes(q) ||
        String(item.numero_conselho || '').toLowerCase().includes(q) ||
        String(item.cnes_principal || '').toLowerCase().includes(q) ||
        String(item.cbos || '').toLowerCase().includes(q) ||
        String(item.especialidade || '').toLowerCase().includes(q) ||
        String(item.cidade || item.municipio || '').toLowerCase().includes(q) ||
        String(item.id || '').toLowerCase().includes(q)
      )
    })
  }, [data, searchQuery, statusFilter, tipoFilter, ufFilter])

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'todos' || tipoFilter !== 'todos' || ufFilter !== 'todos'

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('todos')
    setTipoFilter('todos')
    setUfFilter('todos')
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

  // Colunas da Tabela de Prestadores (Sem badges, cores no texto quando necessário)
  const columns = [
    {
      key: 'codigo_operadora_prestador',
      header: 'CÓDIGO RDA',
      minWidth: '110px',
      maxWidth: '130px',
      render: (val, row) => {
        const code = val || row.codigo || '-'
        return (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717')
            }}
          >
            {code}
          </span>
        )
      }
    },
    {
      key: 'nome_razao_social',
      header: 'PRESTADOR / RAZÃO SOCIAL',
      minWidth: '260px',
      maxWidth: '380px',
      render: (val, row) => {
        const primary = val || row.nome || '-'
        const secondary = row.nome_fantasia && row.nome_fantasia !== primary ? row.nome_fantasia : null
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717') }}>
              {primary}
            </span>
            {secondary && (
              <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373') }}>
                {secondary}
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'cpf_cnpj',
      header: 'DOCUMENTO',
      minWidth: '150px',
      maxWidth: '170px',
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: currentTheme?.colors?.textPrimary }}>
          {val || (row.tipo_pessoa === 'FÍSICA' ? 'CPF NÃO INFORMADO' : 'CNPJ NÃO INFORMADO')}
        </span>
      )
    },
    {
      key: 'tipo_prestador',
      header: 'TIPO',
      minWidth: '120px',
      maxWidth: '140px',
      render: (val) => {
        const tipo = (val || 'CLÍNICA').toUpperCase()
        return (
          <span style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textPrimary }}>
            {tipo}
          </span>
        )
      }
    },
    {
      key: 'conselho_profissional',
      header: 'CONSELHO / UF',
      minWidth: '130px',
      maxWidth: '160px',
      render: (val, row) => {
        if (!val && !row.numero_conselho) {
          return <span style={{ color: currentTheme?.colors?.textSecondary || '#9ca3af' }}>-</span>
        }
        return (
          <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: currentTheme?.colors?.textPrimary }}>
            {val || 'CRM'} {row.numero_conselho || ''}{row.uf_conselho ? `/${row.uf_conselho}` : ''}
          </span>
        )
      }
    },
    {
      key: 'cbos',
      header: 'CBOS / ATUAÇÃO',
      minWidth: '160px',
      maxWidth: '220px',
      render: (val, row) => {
        const text = val || row.especialidade || '-'
        return (
          <span style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textPrimary }}>
            {text}
          </span>
        )
      }
    },
    {
      key: 'cnes_principal',
      header: 'CNES',
      minWidth: '100px',
      maxWidth: '120px',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: currentTheme?.colors?.textPrimary }}>
          {val || '-'}
        </span>
      )
    },
    {
      key: 'cidade',
      header: 'MUNICÍPIO / UF',
      minWidth: '150px',
      maxWidth: '200px',
      render: (val, row) => {
        const mun = val || row.municipio || '-'
        const uf = row.uf ? `/${row.uf}` : ''
        return <span style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textPrimary }}>{mun}{uf}</span>
      }
    },
    {
      key: 'status_credenciamento',
      header: 'STATUS CREDENCIAMENTO',
      minWidth: '160px',
      maxWidth: '190px',
      render: (val) => {
        const st = (val || 'ATIVO').toUpperCase()
        const isAtivo = st === 'ATIVO'
        const isEmCred = st === 'EM CREDENCIAMENTO'
        const isSuspenso = st === 'SUSPENSO'

        // Apenas cor no texto, sem fundo de badge / pill
        const textColor = isAtivo
          ? '#16a34a'
          : isEmCred
          ? '#d97706'
          : isSuspenso
          ? '#ea580c'
          : '#dc2626'

        return (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: textColor
            }}
          >
            {st}
          </span>
        )
      }
    }
  ]

  const selectStyle = {
    padding: '0.45rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    outline: 'none',
    cursor: 'pointer',
    minWidth: '150px'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Header Padronizado sem busca embutida duplicada */}
      <Header
        title="Rede Prestadora (M04)"
        subtitle="Módulo ANS/TISS - Gestão de Credenciamento, Estabelecimentos e Corpo Clínico"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="cadastrar"
            to="/prestadores/novo"
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '700'
            }}
          >
            <Plus size={16} />
            Novo Prestador
          </Button>,
          <Button
            key="sync"
            variant="secondary"
            onClick={handleSyncAllSheets}
            disabled={loading || syncingAll}
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={14} className={loading || syncingAll ? 'animate-spin' : ''} />
            {syncingAll ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        ]}
      />

      {/* SECTION EM LINHA DEDICADA A FILTROS */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e5e7eb')}`,
          backgroundColor: currentTheme?.colors?.surfaceMuted || (isDark ? '#18181b' : '#fafafa'),
          flexWrap: 'wrap'
        }}
      >
        {/* Campo de Busca em Linha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.375rem',
            border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
            backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
            flex: '1 1 260px',
            minWidth: '220px'
          }}
        >
          <Search size={16} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Razão Social, RDA, CPF/CNPJ, CRM ou CNES..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.8125rem',
              width: '100%',
              color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827')
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.2rem',
                cursor: 'pointer',
                color: currentTheme?.colors?.textSecondary || '#6b7280',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtro de Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
            aria-label="Filtrar por Status"
          >
            <option value="todos">Status: Todos</option>
            <option value="ATIVO">Status: Ativo</option>
            <option value="EM CREDENCIAMENTO">Status: Em Credenciamento</option>
            <option value="SUSPENSO">Status: Suspenso</option>
            <option value="DESCREDENCIADO">Status: Descredenciado</option>
          </select>
        </div>

        {/* Filtro de Tipo de Prestador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            style={selectStyle}
            aria-label="Filtrar por Tipo de Prestador"
          >
            <option value="todos">Tipo: Todos</option>
            <option value="MÉDICO">Tipo: Médico (PF)</option>
            <option value="CLÍNICA">Tipo: Clínica (PJ)</option>
            <option value="HOSPITAL">Tipo: Hospital</option>
            <option value="LABORATÓRIO">Tipo: Laboratório</option>
          </select>
        </div>

        {/* Filtro de UF */}
        {availableUfs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <select
              value={ufFilter}
              onChange={(e) => setUfFilter(e.target.value)}
              style={{ ...selectStyle, minWidth: '100px' }}
              aria-label="Filtrar por UF"
            >
              <option value="todos">UF: Todas</option>
              {availableUfs.map(uf => (
                <option key={uf} value={uf}>UF: {uf}</option>
              ))}
            </select>
          </div>
        )}

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: '500',
              border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
              backgroundColor: 'transparent',
              color: currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#4b5563'),
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <X size={14} />
            Limpar Filtros
          </button>
        )}

        {/* Contador Discreto de Resultados */}
        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280' }}>
          {filteredData.length} de {data.length} prestadores
        </div>
      </section>

      {/* Conteúdo da Tabela ou Estado Vazio */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
            <RefreshCw size={32} className="animate-spin" color={currentTheme?.colors?.primary || '#2563eb'} />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: currentTheme?.colors?.textSecondary }}>
              Carregando Rede de Prestadores da Operadora...
            </span>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            textAlign: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={28} color={currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373')} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717'), marginBottom: '0.375rem' }}>
                Nenhum prestador encontrado
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373'), maxWidth: '440px', lineHeight: 1.5 }}>
                {hasActiveFilters
                  ? 'Nenhum prestador corresponde aos filtros aplicados. Tente limpar os filtros ou alterar a busca.'
                  : 'Nenhum prestador cadastrado no módulo M04. Cadastre um novo prestador para iniciar o credenciamento.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {hasActiveFilters ? (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Limpar Filtros
                </Button>
              ) : (
                <Button to="/prestadores/novo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={16} />
                  Cadastrar Novo Prestador
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredData}
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
        onEdit={handleEdit}
        onDelete={handleDeleteFromContextMenu}
      />

      {/* Modal de Confirmação Segura de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Prestador da Rede"
        description={`Tem certeza que deseja excluir o prestador "${deleteModal.item?.nome_razao_social || deleteModal.item?.nome}" (${deleteModal.item?.codigo_operadora_prestador || 'RDA'})? Esta ação removerá o registro cadastral e seus vínculos do módulo M04.`}
        confirmText={deleteModal.loading ? 'Excluindo...' : 'Sim, Excluir'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />
    </div>
  )
}

