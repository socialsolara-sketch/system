// Arquivo: src/modules/guias/views/GuiaList.jsx
// Descrição: Visão de listagem do módulo de Guias (Autorizações) com todas as colunas regulatórias, scroll horizontal e menu de contexto.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu } from '@layout'
import { usePagination, useNotification } from '@shared/context'
import { getModuleColors } from '@themes'
import mockGuiasData from '../data/mockGuias'

// ==========================================
// Funções Utilitárias de Formatação
// ==========================================

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  } catch (e) {
    return dateStr
  }
}

// ==========================================
// Definição de Colunas da Tabela (Todas as colunas Protheus/TISS)
// ==========================================

const columns = [
  // 1. Beneficiário (Usuário) - Primeiro
  { header: 'Carteirinha', key: 'carteirinha', minWidth: '180px', maxWidth: '200px' },
  { header: 'Nome Beneficiário', key: 'nome_beneficiario', minWidth: '200px', maxWidth: '250px' },
  { header: 'Status Vida', key: 'status_beneficiario', minWidth: '110px', maxWidth: '130px' },

  // 2. Procedimento - Segundo
  { header: 'Cód. TUSS', key: 'cod_tuss', minWidth: '100px', maxWidth: '120px' },
  { header: 'Procedimento', key: 'descricao_procedimento', minWidth: '200px', maxWidth: '300px' },
  { header: 'Qtd. Sol.', key: 'qtd_solicitada', minWidth: '80px', maxWidth: '90px' },
  { header: 'Qtd. Aut.', key: 'qtd_autorizada', minWidth: '80px', maxWidth: '90px' },
  { 
    header: 'Executada', 
    key: 'executada', 
    minWidth: '100px', 
    maxWidth: '120px',
    render: (v) => {
      const color = v === 'SIM' ? '#16a34a' : '#4b5563'
      return <span style={{ color, fontWeight: '600' }}>{v || 'NÃO'}</span>
    }
  },
  {
    header: 'Status Autorização',
    key: 'status_autorizacao',
    minWidth: '160px',
    maxWidth: '180px',
    render: (val) => {
      let color = '#4b5563'
      if (val.startsWith('1')) color = '#16a34a'
      if (val.startsWith('2')) color = '#dc2626'
      if (val.startsWith('3')) color = '#d97706'
      return <span style={{ color, fontWeight: '600' }}>{val}</span>
    }
  },

  // 3. Médico (Informações Médicas)
  { header: 'Médico Solicitante', key: 'nome_solicitante', minWidth: '180px', maxWidth: '220px' },
  { header: 'CRM Solicitante', key: 'cod_prestador_solicitante', minWidth: '130px', maxWidth: '150px' },
  { header: 'Local Executante', key: 'nome_executante', minWidth: '180px', maxWidth: '220px' },
  { header: 'RDA Executante', key: 'cod_prestador_executante', minWidth: '130px', maxWidth: '150px' },

  // 4. Administrativo, Negativa e Restante
  { header: 'Nº Guia', key: 'num_guia', minWidth: '100px', maxWidth: '120px' },
  { header: 'Guia Prestador', key: 'guia_prestador', minWidth: '130px', maxWidth: '150px' },
  { header: 'Senha TISS', key: 'senha_autorizacao', minWidth: '130px', maxWidth: '150px', render: (v) => v || '-' },
  { header: 'Data Solic.', key: 'data_solicitacao', minWidth: '110px', maxWidth: '130px', render: (v) => formatDate(v) },
  { header: 'Validade', key: 'validade_guia', minWidth: '100px', maxWidth: '120px', render: (v) => formatDate(v) },
  { header: 'Tipo Guia', key: 'tipo_guia', minWidth: '110px', maxWidth: '130px' },
  { header: 'Caráter', key: 'carater_atendimento', minWidth: '100px', maxWidth: '120px' },
  { header: 'Motivo Negativa', key: 'motivo_negativa_tiss', minWidth: '120px', maxWidth: '150px' },
  { header: 'Justificativa', key: 'justificativa_negativa', minWidth: '200px', maxWidth: '300px' },
  { header: 'Plano', key: 'cod_plano', minWidth: '80px', maxWidth: '100px' },
  { header: 'CNES', key: 'cnes_local', minWidth: '90px', maxWidth: '110px' },
  { header: 'CID-10', key: 'cid_principal', minWidth: '80px', maxWidth: '100px' },
  { header: 'Origem Liberação', key: 'origem_liberacao', minWidth: '130px', maxWidth: '150px' },
  { header: 'Auditor', key: 'cod_auditor_medico', minWidth: '100px', maxWidth: '120px' },
  { header: 'Vlr. Bruto', key: 'valor_tabela_bruto', minWidth: '100px', maxWidth: '120px', render: (v) => formatCurrency(v) },
  { header: 'Coparticipação', key: 'valor_coparticipacao', minWidth: '110px', maxWidth: '130px', render: (v) => formatCurrency(v) },
  { header: 'Isento Copart.', key: 'isento_copart', minWidth: '100px', maxWidth: '120px' }
]

export default function GuiaList() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { setPagination, resetPagination } = usePagination()
  const [guiasList, setGuiasList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const totalPages = 1

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedGuia: null
  })

  const filteredData = useMemo(() => {
    return guiasList.filter((item) => {
      if (statusFilter && statusFilter !== 'todos' && !item.status_autorizacao.includes(statusFilter)) {
        return false
      }
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        item.num_guia.toLowerCase().includes(q) ||
        item.nome_beneficiario.toLowerCase().includes(q) ||
        item.carteirinha.includes(q) ||
        item.cod_tuss.includes(q) ||
        item.descricao_procedimento.toLowerCase().includes(q)
      )
    })
  }, [guiasList, searchQuery, statusFilter])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
  }, [])

  const handleRowContextMenu = (e, row) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedGuia: row
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  const handleViewGuia = () => {
    if (contextMenu.selectedGuia) {
      navigate(`/guias/${contextMenu.selectedGuia.id}`)
    }
  }

  const handleEditGuia = () => {
    if (contextMenu.selectedGuia) {
      navigate(`/guias/editar/${contextMenu.selectedGuia.id}`)
    }
  }

  const handleDeleteGuia = () => {
    if (contextMenu.selectedGuia) {
      const guiaToDelete = contextMenu.selectedGuia
      setGuiasList((prev) => prev.filter((g) => g.id !== guiaToDelete.id))
      notify.success('Guia Removida', `A guia #${guiaToDelete.num_guia} foi removida.`)
    }
  }

  useEffect(() => {
    setPagination({
      currentPage,
      totalPages,
      onPageChange: handlePageChange,
      visible: true
    })
    return () => resetPagination()
  }, [currentPage, totalPages, handlePageChange, setPagination, resetPagination])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="Gestão de Guias de Autorização"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        filterOptions={[
          { label: 'Todos os Status', value: 'todos' },
          { label: 'Autorizada', value: '1' },
          { label: 'Em Análise', value: '3' },
          { label: 'Negada', value: '2' }
        ]}
        actions={[
          <Button key="novo" to="/guias/novo" variant="primary">
            + Nova Guia
          </Button>
        ]}
      />

      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filteredData}
          onRowClick={(row) => navigate(`/guias/${row.id}`)}
          onRowContextMenu={handleRowContextMenu}
        />
      </div>

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleCloseContextMenu}
        itemTitle={contextMenu.selectedGuia ? `Guia #${contextMenu.selectedGuia.num_guia}` : ''}
        onView={handleViewGuia}
        onEdit={handleEditGuia}
        onDelete={handleDeleteGuia}
      />
    </div>
  )
}
