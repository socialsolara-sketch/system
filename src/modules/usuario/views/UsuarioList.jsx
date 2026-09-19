// Arquivo: src/modules/usuario/views/UsuarioList.jsx
// Descrição: Visão de listagem do módulo de Usuários (Beneficiários) com todas as 38 colunas na tabela, scroll horizontal, sem badges/backgrounds e menu de contexto (botão direito) flutuante.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header, Table, Button, ContextMenu } from '@layout'
import { usePagination, useNotification } from '@shared/context'
import { getModuleColors } from '@themes'
import mockUsuariosData from '../data/mockUsuarios'

// ==========================================
// Funções Utilitárias de Formatação
// ==========================================

const formatCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf || '-'
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

const formatPhone = (phone) => {
  if (!phone) return '-'
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
  }
  return phone
}

const formatCEP = (cep) => {
  if (!cep || cep.length !== 8) return cep || '-'
  return `${cep.slice(0, 5)}-${cep.slice(5)}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('T')[0].split('-')
  if (!year || !month || !day) return dateStr
  return `${day}/${month}/${year}`
}

// ==========================================
// Definição de Colunas da Tabela (Todas as 38 colunas da especificação)
// ==========================================

const columns = [
  { header: 'ID', key: 'id', minWidth: '70px', maxWidth: '80px' },
  { header: 'Carteirinha TISS', key: 'codigo_carteirinha', minWidth: '180px', maxWidth: '200px' },
  { header: 'Nome Completo', key: 'nome_completo', minWidth: '200px', maxWidth: '250px' },
  { header: 'CPF', key: 'cpf', minWidth: '130px', maxWidth: '140px', render: (v) => formatCPF(v) },
  { header: 'RG', key: 'rg', minWidth: '110px', maxWidth: '130px', render: (v) => v || '-' },
  { header: 'Órgão Emissor', key: 'orgao_emissor_rg', minWidth: '110px', maxWidth: '130px', render: (v) => v || '-' },
  { header: 'CNS (SUS)', key: 'cns', minWidth: '150px', maxWidth: '170px' },
  { header: 'Data Nascimento', key: 'data_nascimento', minWidth: '130px', maxWidth: '140px', render: (v) => formatDate(v) },
  { header: 'Sexo', key: 'sexo', minWidth: '70px', maxWidth: '80px' },
  { header: 'Nome da Mãe', key: 'nome_mae', minWidth: '180px', maxWidth: '220px' },
  { header: 'Estado Civil', key: 'estado_civil', minWidth: '110px', maxWidth: '130px', render: (v) => v || '-' },

  { header: 'Tipo Beneficiário', key: 'tipo_beneficiario', minWidth: '130px', maxWidth: '150px' },
  { header: 'ID Titular', key: 'id_titular', minWidth: '90px', maxWidth: '100px', render: (v) => v || '-' },
  { header: 'Grau Parentesco', key: 'grau_parentesco', minWidth: '130px', maxWidth: '140px', render: (v) => v || '-' },
  { header: 'Nº Contrato', key: 'numero_contrato', minWidth: '140px', maxWidth: '160px' },
  { header: 'ID Plano', key: 'id_plano', minWidth: '90px', maxWidth: '100px' },
  {
    header: 'Situação Cadastral',
    key: 'situacao_cadastral',
    minWidth: '140px',
    maxWidth: '150px',
    render: (val) => {
      let textColor = '#16a34a' // Ativo = Verde puro texto sem background
      if (val === 'Suspenso') textColor = '#d97706' // Suspenso = Amarelo/Laranja
      if (val === 'Cancelado') textColor = '#dc2626' // Cancelado = Vermelho

      return (
        <span style={{ color: textColor, fontWeight: '700' }}>
          {val}
        </span>
      )
    }
  },
  { header: 'Data Adesão', key: 'data_adesao', minWidth: '110px', maxWidth: '130px', render: (v) => formatDate(v) },
  { header: 'Data Cancelamento', key: 'data_cancelamento', minWidth: '140px', maxWidth: '160px', render: (v) => formatDate(v) },
  { header: 'Motivo Cancelamento', key: 'motivo_cancelamento', minWidth: '180px', maxWidth: '220px', render: (v) => v || '-' },

  {
    header: 'DLP (CPT)',
    key: 'cpt_indicador',
    minWidth: '90px',
    maxWidth: '100px',
    render: (val) => (
      <span style={{ color: val ? '#dc2626' : '#16a34a', fontWeight: '600' }}>
        {val ? 'Sim' : 'Não'}
      </span>
    )
  },
  { header: 'Início Carência Contratual', key: 'inicio_carencia_contratual', minWidth: '170px', maxWidth: '190px', render: (v) => formatDate(v) },
  { header: 'Término Carência Contratual', key: 'fim_carencia_contratual', minWidth: '180px', maxWidth: '200px', render: (v) => formatDate(v) },
  { header: 'Carência Consultas', key: 'fim_carencia_consultas', minWidth: '140px', maxWidth: '160px', render: (v) => formatDate(v) },
  { header: 'Carência Exames', key: 'fim_carencia_exames', minWidth: '130px', maxWidth: '150px', render: (v) => formatDate(v) },
  { header: 'Carência Internação', key: 'fim_carencia_internacao', minWidth: '140px', maxWidth: '160px', render: (v) => formatDate(v) },
  { header: 'Carência Parto', key: 'fim_carencia_parto', minWidth: '120px', maxWidth: '140px', render: (v) => formatDate(v) },

  { header: 'E-mail', key: 'email', minWidth: '180px', maxWidth: '220px' },
  { header: 'Celular', key: 'telefone_celular', minWidth: '130px', maxWidth: '150px', render: (v) => formatPhone(v) },
  { header: 'CEP', key: 'cep', minWidth: '100px', maxWidth: '110px', render: (v) => formatCEP(v) },
  { header: 'Logradouro', key: 'logradouro', minWidth: '180px', maxWidth: '220px' },
  { header: 'Número', key: 'numero', minWidth: '80px', maxWidth: '90px' },
  { header: 'Complemento', key: 'complemento', minWidth: '120px', maxWidth: '140px', render: (v) => v || '-' },
  { header: 'Bairro', key: 'bairro', minWidth: '140px', maxWidth: '160px' },
  { header: 'Cidade', key: 'cidade', minWidth: '140px', maxWidth: '160px' },
  { header: 'UF', key: 'uf', minWidth: '60px', maxWidth: '70px' },

  { header: 'Hash Senha', key: 'hash_senha', minWidth: '180px', maxWidth: '220px', render: (v) => (v ? `${v.substring(0, 15)}...` : '-') },
  {
    header: 'Primeiro Acesso',
    key: 'primeiro_acesso',
    minWidth: '120px',
    maxWidth: '140px',
    render: (val) => (
      <span style={{ color: val ? '#d97706' : '#64748b', fontWeight: '500' }}>
        {val ? 'Sim' : 'Não'}
      </span>
    )
  },
  { header: 'Criado em', key: 'created_at', minWidth: '150px', maxWidth: '170px' },
  { header: 'Atualizado em', key: 'updated_at', minWidth: '150px', maxWidth: '170px' }
]

// ==========================================
// Componente UsuarioList
// ==========================================

export default function UsuarioList() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const moduleColors = getModuleColors('usuario')
  const { setPagination, resetPagination } = usePagination()

  const [usuariosList, setUsuariosList] = useState(mockUsuariosData)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const totalPages = 1

  // Estado do Menu de Contexto (Botão Direito)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedUser: null
  })

  // ==========================================
  // Filtragem e Busca de Dados
  // ==========================================

  const filteredData = useMemo(() => {
    return usuariosList.filter((item) => {
      if (statusFilter && statusFilter !== 'todos' && item.situacao_cadastral !== statusFilter) {
        return false
      }
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        item.nome_completo.toLowerCase().includes(q) ||
        item.codigo_carteirinha.toLowerCase().includes(q) ||
        item.cpf.includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.numero_contrato.toLowerCase().includes(q) ||
        (item.cidade && item.cidade.toLowerCase().includes(q))
      )
    })
  }, [usuariosList, searchQuery, statusFilter])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
  }, [])

  // Handler de Clique com Botão Direito na Linha
  const handleRowContextMenu = (e, row) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedUser: row
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // Ações do Menu de Contexto
  const handleViewUser = () => {
    if (contextMenu.selectedUser) {
      navigate(`/usuario/${contextMenu.selectedUser.id}`)
    }
  }

  const handleEditUser = () => {
    if (contextMenu.selectedUser) {
      navigate(`/usuario/editar/${contextMenu.selectedUser.id}`)
    }
  }

  const handleDeleteUser = () => {
    if (contextMenu.selectedUser) {
      const userToDelete = contextMenu.selectedUser
      setUsuariosList((prev) => prev.filter((u) => u.id !== userToDelete.id))
      notify.success('Usuário Removido', `O beneficiário ${userToDelete.nome_completo} foi excluído do sistema.`)
    }
  }

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
        title="Usuários & Beneficiários"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        filterOptions={[
          { label: 'Todas as Situações', value: 'todos' },
          { label: 'Ativo', value: 'Ativo' },
          { label: 'Suspenso', value: 'Suspenso' },
          { label: 'Cancelado', value: 'Cancelado' }
        ]}
        actions={[
          <Button key="novo" to="/usuario/novo" style={{ backgroundColor: moduleColors.primary }}>
            + Novo Usuário
          </Button>
        ]}
      />

      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filteredData}
          onRowClick={(row) => navigate(`/usuario/${row.id}`)}
          onRowContextMenu={handleRowContextMenu}
        />
      </div>

      {/* Menu de Contexto (Pop-up do Botão Direito) */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleCloseContextMenu}
        itemTitle={contextMenu.selectedUser ? contextMenu.selectedUser.nome_completo : ''}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  )
}
