// Arquivo: src/modules/prestadores/views/PrestadorList.jsx
// Descrição: Visualização e listagem dos prestadores da operadora.
// Baseado na estrutura real do banco de dados SQLite.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu, ConfirmationModal } from '@layout'
import { fetchPrestadores, deletePrestador, fetchEspecialidades, fetchAcordosByPrestador } from '../services'
import { useTheme, useNotification, usePagination } from '@shared/context'
import { CIDADES_LIST } from '../constants/filterConstants'
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
  const [codigoAcordado, setCodigoAcordado] = useState('')
  const [filterCidade, setFilterCidade] = useState('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterContrato, setFilterContrato] = useState('todos')
  const [especialidadesList, setEspecialidadesList] = useState([])
  const [prestadorAcordos, setPrestadorAcordos] = useState({}) // Map de prestador_id -> acordos

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
      const espRes = await fetchEspecialidades()
      
      if (res.success) {
        setData(res.data)
        
        // Carregar acordos de todos os prestadores para busca por código acordado
        const acordosMap = {}
        console.log('Carregando acordos para', res.data.length, 'prestadores')
        
        for (const prestador of res.data) {
          if (prestador.id) {
            console.log('Buscando acordos do prestador:', prestador.id, prestador.nome)
            const acordosRes = await fetchAcordosByPrestador(prestador.id)
            console.log('Resultado acordos para', prestador.nome, ':', acordosRes)
            if (acordosRes.success) {
              acordosMap[prestador.id] = acordosRes.data
              console.log('Acordos carregados:', acordosRes.data.length)
            } else {
              acordosMap[prestador.id] = []
              console.log('Erro ao carregar acordos:', acordosRes.error)
            }
          }
        }
        console.log('Map final de acordos:', acordosMap)
        setPrestadorAcordos(acordosMap)
      } else {
        notify.error('Erro ao Carregar', res.error || 'Falha ao consultar prestadores no banco de dados SQLite.')
      }
      
      if (espRes.success) {
        setEspecialidadesList(espRes.data)
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
        const espRes = await fetchEspecialidades()
        
        if (isMounted && res.success) {
          setData(res.data)
          
          // Carregar acordos de todos os prestadores para busca por código acordado
          const acordosMap = {}
          for (const prestador of res.data) {
            if (prestador.id) {
              const acordosRes = await fetchAcordosByPrestador(prestador.id)
              if (acordosRes.success) {
                acordosMap[prestador.id] = acordosRes.data
              } else {
                acordosMap[prestador.id] = []
              }
            }
          }
          if (isMounted) setPrestadorAcordos(acordosMap)
        }
        
        if (isMounted && espRes.success) {
          setEspecialidadesList(espRes.data)
        }
      } catch (err) {
        if (isMounted) {
          console.error('[PrestadorList] Erro ao carregar:', err)
          notify.error('Falha', 'Falha ao carregar os dados de prestadores.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initFetch()
    return () => { isMounted = false }
  }, [notify])

  // Filtragem dos dados de prestadores
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Busca por Termo (Nome, CRM, Especialidade, Município, Estado)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchNome = String(item.nome || '').toLowerCase().includes(term)
        const matchCrm = String(item.crm || '').toLowerCase().includes(term)
        const matchEsp = String(item.especialidade_nome || '').toLowerCase().includes(term)
        const matchMun = String(item.municipio || '').toLowerCase().includes(term)
        const matchUf = String(item.estado || '').toLowerCase().includes(term)
        if (!matchNome && !matchCrm && !matchEsp && !matchMun && !matchUf) return false
      }

      // 2. Busca por Código Acordado (se o prestador tem esse código em algum acordo)
      if (codigoAcordado.trim()) {
        const term = codigoAcordado.trim()
        const acordosDoPrestador = prestadorAcordos[item.id] || []
        const temCodigoAcordado = acordosDoPrestador.some(acordo => {
          const codigoTussStr = String(acordo.codigo_tuss || '')
          const nomeStr = String(acordo.nome || '').toLowerCase()
          // Verifica se o termo está no código TUSS (exato ou parcial) ou no nome do procedimento
          return codigoTussStr.includes(term) || nomeStr.includes(term.toLowerCase())
        })
        if (!temCodigoAcordado) return false
      }

      // 3. Filtro por Cidade
      if (filterCidade !== 'todos') {
        const cidadeSelecionada = CIDADES_LIST.find(c => c.code === filterCidade)
        if (cidadeSelecionada) {
          const munVal = String(item.municipio || '').toLowerCase()
          const cidLabel = cidadeSelecionada.label.toLowerCase()
          if (!munVal.includes(cidLabel) && !cidLabel.includes(munVal)) return false
        }
      }

      // 4. Filtro por Especialidade
      if (filterEspecialidade !== 'todos') {
        const espVal = String(item.especialidade_nome || '').toLowerCase()
        const filterTerm = filterEspecialidade.toLowerCase()
        if (!espVal.includes(filterTerm) && !filterTerm.includes(espVal)) return false
      }

      // 5. Filtro por Estado
      if (filterEstado !== 'todos') {
        const ufVal = String(item.estado || '').toLowerCase()
        const filterTerm = filterEstado.toLowerCase()
        if (ufVal !== filterTerm) return false
      }

      // 6. Filtro por Contrato Ativo
      if (filterContrato !== 'todos') {
        const isAtivo = item.contrato_ativo_em && !item.contrato_encerrado_em
        if (filterContrato === 'ATIVO' && !isAtivo) return false
        if (filterContrato === 'ENCERRADO' && isAtivo) return false
      }

      return true
    })
  }, [data, searchTerm, codigoAcordado, filterCidade, filterEspecialidade, filterEstado, filterContrato, prestadorAcordos])

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

  const handleOpenDelete = (e, item) => {
    e?.stopPropagation()
    setDeleteModal({
      isOpen: true,
      item,
      loading: false
    })
  }

  const handleRowContextMenu = (e, row) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedItem: row
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.item?.id) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      const idToDelete = deleteModal.item.id
      const res = await deletePrestador(idToDelete)
      if (res.success) {
        setData(prev => prev.filter(p => String(p.id).toLowerCase() !== String(idToDelete).toLowerCase()))
        notify.success(
          'Prestador Removido',
          `O prestador ${deleteModal.item.nome} foi excluído com sucesso.`
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
      render: (val, row) => String(row.crm || val || '-')
    },
    {
      key: 'nome',
      header: 'Nome',
      minWidth: '220px',
      maxWidth: '320px',
      render: (val, row) => String(row.nome || val || '-')
    },
    {
      key: 'especialidade_nome',
      header: 'Especialidade',
      minWidth: '170px',
      maxWidth: '240px',
      render: (val, row) => String(row.especialidade_nome || val || '-')
    },
    {
      key: 'estrutura',
      header: 'Estrutura',
      minWidth: '130px',
      maxWidth: '170px',
      render: (val, row) => String(row.estrutura || val || '-')
    },
    {
      key: 'unidade',
      header: 'Unidade',
      minWidth: '160px',
      maxWidth: '220px',
      render: (val, row) => String(row.unidade || val || '-')
    },
    {
      key: 'estado',
      header: 'Estado',
      minWidth: '90px',
      maxWidth: '110px',
      render: (val, row) => String(row.estado || val || '-')
    },
    {
      key: 'municipio',
      header: 'Município',
      minWidth: '160px',
      maxWidth: '220px',
      render: (val, row) => String(row.municipio || val || '-')
    },
    {
      key: 'contrato_ativo_em',
      header: 'Contrato Ativo',
      minWidth: '120px',
      maxWidth: '150px',
      render: (val, row) => {
        const isAtivo = row.contrato_ativo_em && !row.contrato_encerrado_em
        return isAtivo ? 'Sim' : 'Não'
      }
    },
    {
      key: 'telefone',
      header: 'Telefone',
      minWidth: '140px',
      maxWidth: '180px',
      render: (val, row) => String(row.telefone || val || '-')
    },
    {
      key: 'whatsapp',
      header: 'WhatsApp',
      minWidth: '140px',
      maxWidth: '180px',
      render: (val, row) => String(row.whatsapp || val || '-')
    },
    {
      key: 'idade',
      header: 'Idade',
      minWidth: '80px',
      maxWidth: '100px',
      render: (val, row) => String(row.idade || val || '-')
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
          <div key="search_header" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Campo 1: Código Acordado */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '180px' }}>
              <input
                type="text"
                value={codigoAcordado}
                onChange={(e) => setCodigoAcordado(e.target.value)}
                placeholder="Código Acordado..."
                style={{
                  width: '100%',
                  height: '34px',
                  padding: '0 26px 0 10px',
                  fontSize: '0.8125rem',
                  color: currentTheme?.colors?.textPrimary || 'inherit',
                  backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
                  border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              {codigoAcordado && (
                <button
                  type="button"
                  onClick={() => setCodigoAcordado('')}
                  title="Limpar código acordado"
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
            </div>

            {/* Campo 2: Buscar Prestador */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '230px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', color: currentTheme?.colors?.textSecondary || '#9ca3af', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar prestador..."
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
            </div>
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

      {/* Seção de Filtros Dedicada: Filtros baseados nos dados reais do banco */}
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
          
          {/* Filtro 1: Cidade */}
          <div>
            <label htmlFor="filter_cidade" style={filterLabelStyle}>
              1. Cidade
            </label>
            <select
              id="filter_cidade"
              value={filterCidade}
              onChange={(e) => setFilterCidade(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todas as Cidades</option>
              <optgroup label="São Paulo (SP)">
                {CIDADES_LIST.filter(c => c.estado === 'SP').map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </optgroup>
              <optgroup label="Mato Grosso do Sul (MS)">
                {CIDADES_LIST.filter(c => c.estado === 'MS').map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filtro 2: Especialidade */}
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
              {especialidadesList.map(esp => (
                <option key={esp.id} value={esp.nome}>
                  {esp.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Estado */}
          <div>
            <label htmlFor="filter_estado" style={filterLabelStyle}>
              3. Estado
            </label>
            <select
              id="filter_estado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todos os Estados</option>
              <option value="SP">SP</option>
              <option value="RJ">RJ</option>
              <option value="MG">MG</option>
              <option value="RS">RS</option>
              <option value="PR">PR</option>
            </select>
          </div>

          {/* Filtro 4: Contrato Ativo */}
          <div>
            <label htmlFor="filter_contrato" style={filterLabelStyle}>
              4. Contrato Ativo
            </label>
            <select
              id="filter_contrato"
              value={filterContrato}
              onChange={(e) => setFilterContrato(e.target.value)}
              style={filterInputStyle}
            >
              <option value="todos">Todos os Contratos</option>
              <option value="ATIVO">Contrato Ativo (Sim)</option>
              <option value="ENCERRADO">Encerrado (Não)</option>
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
        itemTitle={contextMenu.selectedItem ? contextMenu.selectedItem.nome : ''}
        onView={handleView}
        onViewAcordos={handleViewAcordos}
        onEdit={handleEdit}
        onDelete={handleDeleteFromContextMenu}
      />

      {/* Modal de Confirmação Segura de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Prestador da Rede"
        description={`Tem certeza que deseja excluir o prestador "${deleteModal.item?.nome}"? Esta ação removerá o registro cadastral da rede credenciada.`}
        confirmText={deleteModal.loading ? 'Excluindo...' : 'Sim, Excluir'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />
    </div>
  )
}