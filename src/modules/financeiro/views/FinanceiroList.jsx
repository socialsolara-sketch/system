// Arquivo: src/modules/financeiro/views/FinanceiroList.jsx
// Descrição: Módulo 08 - Financeiro (Contas a Pagar, Receber e Centros de Custo) (M08_LANCAMENTOS_FINANCEIROS, M08_PLANO_CONTAS, M08_CENTROS_CUSTO, M08_FORNECEDORES)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, Building2, Edit, Trash2 } from 'lucide-react'

const initialLancamentos = []

export default function FinanceiroList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [lancamentos, setLancamentos] = useState(initialLancamentos)
  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formData, setFormData] = useState({
    codigo_transacao: '',
    tipo_lancamento: 'A_PAGAR',
    origem_tipo: 'MANUAL',
    pessoa: '',
    documento: '',
    descricao: '',
    centro_custo: '2.01 - ASSISTÊNCIA MÉDICA HOSPITALAR',
    plano_contas: '4.1.01.001 - EVENTOS INDENIZÁVEIS REDE',
    valor_bruto: 'R$ 0,00',
    valor_retencoes: 'R$ 0,00',
    valor_liquido: 'R$ 0,00',
    data_vencimento: new Date().toISOString().split('T')[0],
    status_pagamento: 'ABERTO',
    status_aprovacao: 'APROVADO_GERENCIA'
  })

  const filtered = useMemo(() => {
    return lancamentos.filter(l => {
      if (tipoFilter !== 'todos' && l.tipo_lancamento !== tipoFilter) return false
      if (statusFilter !== 'todos' && l.status_pagamento !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        l.codigo_transacao?.toLowerCase().includes(q) ||
        l.pessoa?.toLowerCase().includes(q) ||
        l.descricao?.toLowerCase().includes(q) ||
        l.documento?.toLowerCase().includes(q)
      )
    })
  }, [lancamentos, searchQuery, tipoFilter, statusFilter])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const nextCode = `FIN-202403-00${Math.floor(10 + Math.random() * 90)}`
    setFormData({
      codigo_transacao: nextCode,
      tipo_lancamento: 'A_PAGAR',
      origem_tipo: 'MANUAL',
      pessoa: '',
      documento: '',
      descricao: '',
      centro_custo: '2.01 - ASSISTÊNCIA MÉDICA HOSPITALAR',
      plano_contas: '4.1.01.001 - EVENTOS INDENIZÁVEIS REDE',
      valor_bruto: 'R$ 0,00',
      valor_retencoes: 'R$ 0,00',
      valor_liquido: 'R$ 0,00',
      data_vencimento: new Date().toISOString().split('T')[0],
      status_pagamento: 'ABERTO',
      status_aprovacao: 'APROVADO_GERENCIA'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formData.pessoa || !formData.descricao) {
      notify({ message: 'Preencha a Favorecido / Pagador e Descrição.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setLancamentos(prev => prev.map(l => l.id === selectedItem.id ? { ...l, ...formData } : l))
      notify({ message: 'Lançamento financeiro atualizado!', type: 'success' })
    } else {
      const newLanc = {
        ...formData,
        id: `019234b0-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`
      }
      setLancamentos(prev => [newLanc, ...prev])
      notify({ message: 'Lançamento financeiro registrado com sucesso!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setLancamentos(prev => prev.filter(l => l.id !== itemToDelete.id))
      notify({ message: 'Lançamento financeiro cancelado.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columns = [
    {
      key: 'codigo_transacao',
      header: 'CÓD. LANÇAMENTO',
      minWidth: '160px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Doc: {r.documento}</span>
        </div>
      )
    },
    {
      key: 'tipo_lancamento',
      header: 'TIPO',
      minWidth: '130px',
      render: (v) => {
        const isPagar = v === 'A_PAGAR'
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isPagar ? '#dc2626' : '#16a34a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {isPagar ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
            {isPagar ? 'A PAGAR' : 'A RECEBER'}
          </span>
        )
      }
    },
    {
      key: 'pessoa',
      header: 'FAVORECIDO / PAGADOR',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.descricao}</span>
        </div>
      )
    },
    {
      key: 'centro_custo',
      header: 'CENTRO DE CUSTO / DRE',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem' }}>
          <span>CC: {v}</span>
          <span style={{ color: currentTheme?.colors?.textSecondary }}>Plano: {r.plano_contas}</span>
        </div>
      )
    },
    {
      key: 'valor_liquido',
      header: 'VALOR LÍQUIDO',
      minWidth: '130px',
      render: (v, r) => (
        <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: r.tipo_lancamento === 'A_PAGAR' ? '#dc2626' : '#16a34a' }}>
          {v}
        </span>
      )
    },
    {
      key: 'data_vencimento',
      header: 'VENCIMENTO',
      minWidth: '120px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_pagamento',
      header: 'STATUS',
      minWidth: '110px',
      render: (v) => {
        const isPago = v === 'PAGO' || v === 'LIQUIDADO'
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isPago ? '#16a34a' : '#ea580c'
          }}>
            {v}
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
    cursor: 'pointer'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    outline: 'none',
    marginTop: '0.25rem'
  }

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: currentTheme?.colors?.textSecondary || '#6b7280'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="Financeiro e Centros de Custo (M08)"
        subtitle="Contas a Pagar, Contas a Receber, Rateio DRE por Centros de Custo e Fornecedores"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Novo Lançamento Financeiro (M08)
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
          <Search size={16} color={currentTheme?.colors?.textSecondary || '#6b7280'} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Transação, Favorecido, Descrição ou Documento..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.8125rem',
              width: '100%',
              color: currentTheme?.colors?.textPrimary || '#111827'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Tipo: Todos</option>
          <option value="A_PAGAR">Contas a Pagar</option>
          <option value="A_RECEBER">Contas a Receber</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Status: Todos</option>
          <option value="ABERTO">Em Aberto</option>
          <option value="PAGO">Pagos / Liquidados</option>
        </select>

        {(searchQuery || tipoFilter !== 'todos' || statusFilter !== 'todos') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setTipoFilter('todos'); setStatusFilter('todos') }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: '500',
              border: `1px solid ${currentTheme?.colors?.border || '#d1d5db'}`,
              backgroundColor: 'transparent',
              color: currentTheme?.colors?.textSecondary,
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

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary }}>
          {filtered.length} títulos financeiros
        </div>
      </section>

      {/* Tabela Financeira */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => handleOpenEdit(row)}
          emptyMessage="Nenhum lançamento financeiro encontrado."
        />
      </div>

      {/* Modal Lançamento */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: currentTheme?.colors?.surface || (isDark ? '#18181b' : '#ffffff'),
            borderRadius: '0.5rem',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: currentTheme?.colors?.textPrimary }}>
                {isEditing ? `Editar Título: ${formData.codigo_transacao}` : 'Novo Lançamento Financeiro (M08_LANCAMENTOS)'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Código da Transação</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo_transacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo_transacao: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Natureza Financeira</label>
                  <select
                    value={formData.tipo_lancamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_lancamento: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="A_PAGAR">CONTAS A PAGAR (DÉBITO)</option>
                    <option value="A_RECEBER">CONTAS A RECEBER (CRÉDITO)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Favorecido / Sacado *</label>
                  <input
                    type="text"
                    required
                    value={formData.pessoa}
                    onChange={(e) => setFormData(prev => ({ ...prev, pessoa: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nº Documento / NF</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Histórico / Descrição *</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Centro de Custo (M08_CENTROS_CUSTO)</label>
                  <select
                    value={formData.centro_custo}
                    onChange={(e) => setFormData(prev => ({ ...prev, centro_custo: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="2.01 - ASSISTÊNCIA MÉDICA HOSPITALAR">2.01 - ASSISTÊNCIA MÉDICA HOSPITALAR</option>
                    <option value="1.01 - RECEITAS COMERCIAIS PME">1.01 - RECEITAS COMERCIAIS PME</option>
                    <option value="3.05 - TECNOLOGIA DA INFORMAÇÃO">3.05 - TECNOLOGIA DA INFORMAÇÃO</option>
                    <option value="3.01 - ADMINISTRAÇÃO GERAL">3.01 - ADMINISTRAÇÃO GERAL</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Plano de Contas DRE (M08_PLANO_CONTAS)</label>
                  <select
                    value={formData.plano_contas}
                    onChange={(e) => setFormData(prev => ({ ...prev, plano_contas: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="4.1.01.001 - EVENTOS INDENIZÁVEIS REDE">4.1.01.001 - EVENTOS INDENIZÁVEIS REDE</option>
                    <option value="3.1.01.002 - RECEITA CONTRAV. PLANOS">3.1.01.002 - RECEITA CONTRAV. PLANOS</option>
                    <option value="4.2.03.010 - SERVIÇOS DE TI E SOFTWARE">4.2.03.010 - SERVIÇOS DE TI E SOFTWARE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Valor Líquido</label>
                  <input
                    type="text"
                    value={formData.valor_liquido}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_liquido: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Data Vencimento</label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status Pagamento</label>
                  <select
                    value={formData.status_pagamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_pagamento: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="ABERTO">EM ABERTO</option>
                    <option value="PAGO">PAGO / LIQUIDADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}` }}>
                {isEditing ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setItemToDelete(selectedItem)
                      setDeleteModalOpen(true)
                      setModalOpen(false)
                    }}
                    style={{ color: '#dc2626' }}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" style={{ fontWeight: '600' }}>
                    {isEditing ? 'Salvar Lançamento' : 'Registrar Lançamento'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Cancelar Lançamento Financeiro"
        description={`Deseja realmente remover o lançamento "${itemToDelete?.codigo_transacao}"?`}
      />
    </div>
  )
}
