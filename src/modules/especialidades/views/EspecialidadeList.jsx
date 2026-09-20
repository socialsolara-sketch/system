// Arquivo: src/modules/especialidades/views/EspecialidadeList.jsx
// Descrição: View de listagem do módulo de Especialidades com integração Google Sheets (aba ESPECIALIDADES).

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu } from '@layout'
import { fetchEspecialidadesFromSheets, deleteEspecialidadeFromSheets } from '../services/sheetsService'
import { useTheme, useNotification, usePagination } from '@shared/context'
import { RefreshCw, Plus, Database } from 'lucide-react'

export default function EspecialidadeList() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { currentTheme, isDark } = useTheme()
  const { setPagination, resetPagination } = usePagination()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 1

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedItem: null
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchEspecialidadesFromSheets()
      setData(result.data || [])
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Falha na conexão com Google Sheets.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchEspecialidadesFromSheets()
      .then((result) => {
        if (!isMounted) return
        setData(result.data || [])
        if (result.error) {
          setError(result.error)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError('Falha na conexão com Google Sheets.')
        console.error(err)
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

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

  const handleView = () => {
    if (contextMenu.selectedItem) {
      navigate(`/especialidades/${contextMenu.selectedItem.id || contextMenu.selectedItem.nome}`)
    }
  }

  const handleEdit = () => {
    if (contextMenu.selectedItem) {
      navigate(`/especialidades/editar/${contextMenu.selectedItem.id || contextMenu.selectedItem.nome}`)
    }
  }

  const handleDelete = async () => {
    if (contextMenu.selectedItem) {
      const itemToDelete = contextMenu.selectedItem
      await deleteEspecialidadeFromSheets(itemToDelete.id)
      setData((prev) => prev.filter((u) => u.id !== itemToDelete.id))
      notify.success(
        'Especialidade Removida', 
        `A especialidade ${itemToDelete.nome} foi excluída da base.`
      )
    }
  }

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

  const columns = [
    { 
      key: 'id', 
      header: 'ID CHAVE (UUIDv7)', 
      minWidth: '130px', 
      maxWidth: '180px',
      render: (val) => {
        const strVal = String(val || '')
        const isUUID = strVal.length >= 32
        return (
          <span 
            title={strVal} 
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.75rem', 
              fontWeight: '600',
              color: isDark ? '#93c5fd' : '#2563eb'
            }}
          >
            {isUUID ? `${strVal.slice(0, 8)}...${strVal.slice(-4)}` : strVal || '-'}
          </span>
        )
      }
    },
    { 
      key: 'nome', 
      header: 'NOME DA ESPECIALIDADE', 
      minWidth: '240px', 
      maxWidth: '350px',
      render: (val, row) => (
        <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
          {val || row.especialidade || '-'}
        </span>
      )
    },
    { key: 'descricao', header: 'DESCRIÇÃO', minWidth: '200px', maxWidth: '300px' },
    { key: 'conselho', header: 'CONSELHO', minWidth: '120px', maxWidth: '160px' },
    { 
      key: 'status', 
      header: 'STATUS', 
      minWidth: '110px',
      render: (val) => {
        const statusStr = String(val || 'ATIVO').toUpperCase()
        const isAtivo = statusStr === 'ATIVO'
        return (
          <span style={{ color: isAtivo ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
            {statusStr}
          </span>
        )
      }
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="Especialidades"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        searchPlaceholder="BUSCAR ESPECIALIDADE OU UUID..."
        filterOptions={[
          { label: 'Todos os Status', value: 'todos' },
          { label: 'Ativo', value: 'ATIVO' },
          { label: 'Inativo', value: 'INATIVO' }
        ]}
        actions={[
          <Button 
            key="cadastrar" 
            to="/especialidades/novo" 
            style={{ 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontWeight: '700'
            }}
          >
            <Plus size={16} />
            Cadastrar
          </Button>,
          <Button 
            key="sync" 
            variant="secondary" 
            onClick={loadData} 
            disabled={loading} 
            style={{ 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        ]}
      />

      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
             <RefreshCw size={32} className="animate-spin" color={currentTheme?.colors?.primary || '#2563eb'} />
             <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: currentTheme?.colors?.textSecondary }}>
               Consultando aba ESPECIALIDADES...
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
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={32} color={currentTheme?.colors?.textSecondary || '#64748b'} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: currentTheme?.colors?.textPrimary || '#0f172a', marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                Nenhuma Especialidade Encontrada
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary || '#64748b', maxWidth: '420px', lineHeight: 1.5 }}>
                {error ? `Erro: ${error}` : 'A aba ESPECIALIDADES retornou vazia ou não foi configurada na planilha Google Sheets.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button to="/especialidades/novo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} />
                Cadastrar Especialidade
              </Button>
              <Button variant="secondary" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} />
                Tentar Novamente
              </Button>
            </div>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={filteredData} 
            onRowClick={(row) => navigate(`/especialidades/${row.id || row.nome}`)}
            onRowContextMenu={handleRowContextMenu}
          />
        )}
      </div>

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleCloseContextMenu}
        itemTitle={contextMenu.selectedItem ? contextMenu.selectedItem.nome : ''}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
