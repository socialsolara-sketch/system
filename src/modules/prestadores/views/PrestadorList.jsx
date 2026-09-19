// Arquivo: src/modules/prestadores/views/PrestadorList.jsx
// Descrição: View principal do módulo de prestadores com integração Google Sheets.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu } from '@layout'
import { fetchFromSheets } from '../services/sheetsService'
import { useTheme, useNotification, usePagination } from '@shared/context'
import { RefreshCw, Filter } from 'lucide-react'

export default function PrestadorList() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { currentTheme } = useTheme()
  const { setPagination, resetPagination } = usePagination()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMockData, setIsMockData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [dynamicColumns, setDynamicColumns] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 1

  // Estado do Menu de Contexto (Botão Direito)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedItem: null
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setIsMockData(false)
    try {
      const result = await fetchFromSheets('PRESTADORES!A:Z')
      setData(result.data)
      setIsMockData(result.isMock)
      
      if (result.headers) {
        const cols = result.headers.map(h => ({
          key: h.key,
          header: h.original.toUpperCase(),
          minWidth: h.key === 'nome' || h.key === 'nome_do_prestador' ? '250px' : '150px',
          render: h.key === 'status' ? (val) => {
            const statusStr = String(val).toUpperCase()
            const textColor = statusStr === 'ATIVO' ? '#16a34a' : '#dc2626'
            return (
              <span style={{ color: textColor, fontWeight: '700' }}>
                {statusStr || 'N/A'}
              </span>
            )
          } : undefined
        }))
        setDynamicColumns(cols)
      } else {
        // Fallback para colunas padrão se for mock ou não houver headers
        setDynamicColumns([
          { key: 'id', header: 'CÓDIGO', minWidth: '100px', maxWidth: '120px' },
          { key: 'nome', header: 'NOME DO PRESTADOR', minWidth: '250px', maxWidth: '350px' },
          { key: 'tipo', header: 'TIPO', minWidth: '130px', maxWidth: '150px' },
          { key: 'cidade', header: 'CIDADE', minWidth: '150px', maxWidth: '200px' },
          { key: 'uf', header: 'UF', minWidth: '60px', maxWidth: '80px' },
          { 
            key: 'status', 
            header: 'STATUS', 
            minWidth: '120px',
            render: (val) => {
              const statusStr = String(val).toUpperCase()
              const textColor = statusStr === 'ATIVO' ? '#16a34a' : '#dc2626'
              return (
                <span style={{ color: textColor, fontWeight: '700' }}>
                  {statusStr || 'N/A'}
                </span>
              )
            }
          }
        ])
      }

      if (result.isMock && result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('FALHA NA SINCRONIZAÇÃO COM GOOGLE SHEETS.')
      console.error(err)
    } finally {
      setLoading(false)
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
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // Ações do Menu de Contexto
  const handleView = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/${contextMenu.selectedItem.id || contextMenu.selectedItem.nome}`)
    }
  }

  const handleEdit = () => {
    if (contextMenu.selectedItem) {
      navigate(`/prestadores/editar/${contextMenu.selectedItem.id || contextMenu.selectedItem.nome}`)
    }
  }

  const handleDelete = () => {
    if (contextMenu.selectedItem) {
      const itemToDelete = contextMenu.selectedItem
      setData((prev) => prev.filter((u) => (u.id !== itemToDelete.id) || (u.nome !== itemToDelete.nome)))
      notify.success('Prestador Removido', `O prestador ${itemToDelete.nome || itemToDelete.nome_do_prestador} foi excluído (simulação).`)
    }
  }

  useEffect(() => {
    const initLoad = async () => {
      await loadData()
    }
    initLoad()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (statusFilter && statusFilter !== 'todos') {
        const itemStatus = String(item.status || '').toUpperCase()
        if (itemStatus !== statusFilter.toUpperCase()) return false
      }
      
      if (!searchQuery.trim()) return true
      
      const q = searchQuery.toLowerCase()
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(q)
      )
    })
  }, [data, searchQuery, statusFilter])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
  }, [])

  useEffect(() => {
    setPagination({
      currentPage,
      totalPages,
      onPageChange: handlePageChange,
      visible: true
    })

    return () => {
      resetPagination()
    }
  }, [currentPage, totalPages, handlePageChange, setPagination, resetPagination])

  const finalColumns = dynamicColumns.length > 0 ? dynamicColumns : [
    { key: 'id', header: 'CÓDIGO', minWidth: '100px', maxWidth: '120px' },
    { key: 'nome', header: 'NOME DO PRESTADOR', minWidth: '250px', maxWidth: '350px' },
    { key: 'tipo', header: 'TIPO', minWidth: '130px', maxWidth: '150px' },
    { key: 'cidade', header: 'CIDADE', minWidth: '150px', maxWidth: '200px' },
    { key: 'uf', header: 'UF', minWidth: '60px', maxWidth: '80px' },
    { 
      key: 'status', 
      header: 'STATUS', 
      minWidth: '120px',
      render: (val) => {
        const statusStr = String(val).toUpperCase()
        const textColor = statusStr === 'ATIVO' ? '#16a34a' : '#dc2626'
        return (
          <span style={{ color: textColor, fontWeight: '700' }}>
            {statusStr || 'N/A'}
          </span>
        )
      }
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="Rede de Prestadores"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        searchPlaceholder="BUSCAR POR NOME, CÓDIGO OU LOCALIDADE..."
        filterOptions={[
          { label: 'Todos os Status', value: 'todos' },
          { label: 'Ativo', value: 'ATIVO' },
          { label: 'Inativo', value: 'INATIVO' }
        ]}
        actions={[
          <Button key="novo" to="/prestadores/novo" style={{ height: '36px' }}>
            Cadastrar
          </Button>,
          <Button key="sync" variant="secondary" onClick={loadData} disabled={loading} style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Sincronizar
          </Button>
        ]}
      />

      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error && isMockData && (
          <div style={{ 
            margin: '10px 1.5rem', 
            padding: '10px 16px', 
            backgroundColor: '#ef444410', 
            border: '1px solid #ef444430', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter size={14} color="#ef4444" />
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              Ignorar
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
             <RefreshCw size={32} className="animate-spin" color={currentTheme?.colors?.primary} />
             <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: currentTheme?.colors?.textSecondary }}>Sincronizando Planilha...</span>
          </div>
        ) : (
          <Table 
            columns={finalColumns} 
            data={filteredData} 
            onRowClick={(row) => navigate(`/prestadores/${row.id || row.nome}`)}
            onRowContextMenu={handleRowContextMenu}
          />
        )}
      </div>

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleCloseContextMenu}
        itemTitle={contextMenu.selectedItem ? (contextMenu.selectedItem.nome || contextMenu.selectedItem.nome_do_prestador) : ''}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
