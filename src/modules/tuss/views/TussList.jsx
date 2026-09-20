// Arquivo: src/modules/tuss/views/TussList.jsx
// Descrição: Visão de listagem do módulo TUSS com paginação integrada, filtros de status e busca em dados ANS.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Header, Table } from '@layout'
import { usePagination } from '@shared/context'

// ==========================================
// Definição de Colunas da Tabela TUSS
// ==========================================

const columns = [
  { header: 'Código', key: 'codigo', minWidth: '100px', maxWidth: '120px' },
  { header: 'Terminologia e Procedimento', key: 'descricao', minWidth: '180px', maxWidth: '200px' },
  { header: 'Diretrizes Clínicas e Cobertura', key: 'diretrizes', minWidth: '180px', maxWidth: '200px' },
  { header: 'Especialidade', key: 'especialidade', minWidth: '140px', maxWidth: '180px' },
  { header: 'Rol ANS', key: 'rolAns', minWidth: '120px', maxWidth: '160px' },
  { header: 'Status', key: 'status', minWidth: '90px', maxWidth: '110px' },
  { header: 'Última Revisão', key: 'revisao', minWidth: '130px', maxWidth: '150px' }
]

// ==========================================
// Base de Dados Simulada Paginada
// ==========================================

const mockDataByPage = {}

// ==========================================
// Componente TussList
// ==========================================

export default function TussList() {
  const { setPagination, resetPagination } = usePagination()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const totalPages = 1

  // ==========================================
  // Filtragem e Busca de Dados
  // ==========================================

  const filteredData = useMemo(() => {
    const raw = mockDataByPage[currentPage] || []
    return raw.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return Object.values(item).some(val => String(val).toLowerCase().includes(q))
    })
  }, [currentPage, searchQuery, statusFilter])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
  }, [])

  // ==========================================
  // Efeito de Sincronização da Paginação
  // ==========================================

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="TUSS"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        filterOptions={[
          { label: 'Todos os Status', value: 'todos' },
          { label: 'Ativo', value: 'Ativo' },
          { label: 'Pendente', value: 'Pendente' }
        ]}
      />
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table columns={columns} data={filteredData} />
      </div>
    </div>
  )
}
