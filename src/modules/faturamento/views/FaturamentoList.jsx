// Arquivo: src/modules/faturamento/views/FaturamentoList.jsx
// Descrição: Módulo 07 - Faturamento (Mensalidades e Coparticipação) (M07_FATURAS, M07_FATURAS_ITENS, M07_COPARTICIPACOES)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, Calculator, CreditCard, Layers, PlayCircle, Eye, Edit, Trash2 } from 'lucide-react'

const initialFaturas = []

export default function FaturamentoList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [faturas, setFaturas] = useState(initialFaturas)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [competenciaFilter, setCompetenciaFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formData, setFormData] = useState({
    numero_fatura: '',
    contrato: 'CTR-2024-001092',
    pagador: '',
    competencia: '03/2024',
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    qtd_vidas: 1,
    valor_mensalidades: 'R$ 0,00',
    valor_coparticipacao: 'R$ 0,00',
    valor_total: 'R$ 0,00',
    status_fatura: 'EMITIDA'
  })

  const filtered = useMemo(() => {
    return faturas.filter(f => {
      if (statusFilter !== 'todos' && f.status_fatura !== statusFilter) return false
      if (competenciaFilter !== 'todos' && f.competencia !== competenciaFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        f.numero_fatura?.toLowerCase().includes(q) ||
        f.pagador?.toLowerCase().includes(q) ||
        f.contrato?.toLowerCase().includes(q)
      )
    })
  }, [faturas, searchQuery, statusFilter, competenciaFilter])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const nextNum = `FAT-202403-${Math.floor(1000 + Math.random() * 9000)}`
    setFormData({
      numero_fatura: nextNum,
      contrato: 'CTR-2024-001092',
      pagador: 'INDÚSTRIA METALÚRGICA PAULISTA LTDA',
      competencia: '03/2024',
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: '2024-03-10',
      qtd_vidas: 245,
      valor_mensalidades: 'R$ 112.500,00',
      valor_coparticipacao: 'R$ 14.850,00',
      valor_total: 'R$ 127.350,00',
      status_fatura: 'EMITIDA'
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
    if (!formData.numero_fatura || !formData.pagador) {
      notify({ message: 'Preencha os campos obrigatórios.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setFaturas(prev => prev.map(f => f.id === selectedItem.id ? { ...f, ...formData } : f))
      notify({ message: 'Fatura atualizada com sucesso!', type: 'success' })
    } else {
      const newFat = {
        ...formData,
        id: `019234a0-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`
      }
      setFaturas(prev => [newFat, ...prev])
      notify({ message: 'Fatura consolidada com mensalidades e coparticipações!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setFaturas(prev => prev.filter(f => f.id !== itemToDelete.id))
      notify({ message: 'Fatura cancelada.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columns = [
    {
      key: 'numero_fatura',
      header: 'Nº FATURA',
      minWidth: '150px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'pagador',
      header: 'CONTRATANTE / PAGADOR',
      minWidth: '240px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Contrato: {r.contrato} • {r.qtd_vidas} vidas</span>
        </div>
      )
    },
    {
      key: 'competencia',
      header: 'COMPETÊNCIA / VENCIMENTO',
      minWidth: '170px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: '500' }}>Comp. {v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Venc: {r.data_vencimento}</span>
        </div>
      )
    },
    {
      key: 'valor_mensalidades',
      header: 'MENSALIDADE',
      minWidth: '130px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'valor_coparticipacao',
      header: 'COPARTICIPAÇÃO',
      minWidth: '130px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'valor_total',
      header: 'VALOR TOTAL',
      minWidth: '140px',
      render: (v) => <span style={{ fontWeight: '700', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_fatura',
      header: 'STATUS',
      minWidth: '120px',
      render: (v) => {
        const isLiq = v === 'LIQUIDADA'
        const isVenc = v === 'VENCIDA'
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isLiq ? '#16a34a' : isVenc ? '#dc2626' : '#2563eb'
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
        title="Faturamento e Coparticipação (M07)"
        subtitle="Fechamento Mensal de Faturamento, Apuração de Coparticipação e Demonstrativos Financeiros"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Gerar Fatura Manual (M07)
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
            placeholder="Buscar por Nº Fatura, Pagador, Contrato..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Status: Todos</option>
          <option value="EMITIDA">Emitidas (Em Aberto)</option>
          <option value="LIQUIDADA">Liquidadas (Pagas)</option>
          <option value="VENCIDA">Vencidas (Inadimplentes)</option>
        </select>

        <select
          value={competenciaFilter}
          onChange={(e) => setCompetenciaFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Competência: Todas</option>
          <option value="03/2024">03/2024</option>
          <option value="02/2024">02/2024</option>
        </select>

        {(searchQuery || statusFilter !== 'todos' || competenciaFilter !== 'todos') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter('todos'); setCompetenciaFilter('todos') }}
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
          {filtered.length} faturas geradas
        </div>
      </section>

      {/* Tabela de Faturas */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => handleOpenEdit(row)}
          emptyMessage="Nenhuma fatura encontrada."
        />
      </div>

      {/* Modal Fatura */}
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
            maxWidth: '650px',
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
                {isEditing ? `Detalhes da Fatura: ${formData.numero_fatura}` : 'Nova Fatura de Mensalidade / Coparticipação'}
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
                  <label style={labelStyle}>Número da Fatura</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_fatura}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_fatura: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Competência</label>
                  <input
                    type="text"
                    value={formData.competencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, competencia: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Pagador / Contratante *</label>
                <input
                  type="text"
                  required
                  value={formData.pagador}
                  onChange={(e) => setFormData(prev => ({ ...prev, pagador: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Data Emissão</label>
                  <input
                    type="date"
                    value={formData.data_emissao}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_emissao: e.target.value }))}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Mensalidades</label>
                  <input
                    type="text"
                    value={formData.valor_mensalidades}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_mensalidades: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Coparticipação</label>
                  <input
                    type="text"
                    value={formData.valor_coparticipacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_coparticipacao: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Valor Total</label>
                  <input
                    type="text"
                    value={formData.valor_total}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_total: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status Fatura</label>
                <select
                  value={formData.status_fatura}
                  onChange={(e) => setFormData(prev => ({ ...prev, status_fatura: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="EMITIDA">EMITIDA (AGUARDANDO PAGAMENTO)</option>
                  <option value="LIQUIDADA">LIQUIDADA (PAGA)</option>
                  <option value="VENCIDA">VENCIDA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
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
                    {isEditing ? 'Salvar Fatura' : 'Gerar Fatura'}
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
        title="Cancelar Fatura"
        description={`Deseja realmente cancelar a fatura "${itemToDelete?.numero_fatura}"?`}
      />
    </div>
  )
}
