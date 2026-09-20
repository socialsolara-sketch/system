// Arquivo: src/modules/contas-medicas/views/ContasMedicasList.jsx
// Descrição: Módulo 06 - Contas Médicas, Utilização e Auditoria de Glosas (M06_LOTES_PRESTADOR, M06_UTILIZACAO_SERVICOS, M06_GLOSAS, M06_RECURSOS_GLOSA)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, Receipt, ShieldX, FileCode, CheckCheck, UploadCloud, Edit, Trash2 } from 'lucide-react'

const initialLotes = []

const initialGlosas = []

export default function ContasMedicasList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [activeTab, setActiveTab] = useState('lotes') // 'lotes' | 'glosas'
  const [lotes, setLotes] = useState(initialLotes)
  const [glosas, setGlosas] = useState(initialGlosas)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formDataLote, setFormDataLote] = useState({
    numero_lote_prestador: '',
    protocolo_operadora: '',
    prestador: 'HOSPITAL SÃO LUCAS S/A',
    cnes: '2078912',
    competencia: '03/2024',
    qtd_guias: 10,
    valor_total_apresentado: 'R$ 15.000,00',
    valor_total_glosado: 'R$ 0,00',
    valor_total_liberado: 'R$ 15.000,00',
    data_previsao_pagamento: '2024-05-10',
    status_lote: 'EM AUDITORIA'
  })

  const filteredLotes = useMemo(() => {
    return lotes.filter(l => {
      if (statusFilter !== 'todos' && l.status_lote !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        l.numero_lote_prestador?.toLowerCase().includes(q) ||
        l.protocolo_operadora?.toLowerCase().includes(q) ||
        l.prestador?.toLowerCase().includes(q) ||
        l.cnes?.toLowerCase().includes(q)
      )
    })
  }, [lotes, searchQuery, statusFilter])

  const filteredGlosas = useMemo(() => {
    return glosas.filter(g => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        g.guia_tiss?.toLowerCase().includes(q) ||
        g.beneficiario?.toLowerCase().includes(q) ||
        g.codigo_glosa_tiss?.toLowerCase().includes(q) ||
        g.procedimento?.toLowerCase().includes(q)
      )
    })
  }, [glosas, searchQuery])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const randomLote = `LOTE-202403-${Math.floor(1000 + Math.random() * 9000)}`
    const randomProt = `PROT-TISS-${Math.floor(100000 + Math.random() * 900000)}`
    setFormDataLote({
      numero_lote_prestador: randomLote,
      protocolo_operadora: randomProt,
      prestador: 'HOSPITAL SÃO LUCAS S/A',
      cnes: '2078912',
      competencia: '03/2024',
      qtd_guias: 12,
      valor_total_apresentado: 'R$ 32.500,00',
      valor_total_glosado: 'R$ 0,00',
      valor_total_liberado: 'R$ 32.500,00',
      data_previsao_pagamento: '2024-05-10',
      status_lote: 'EM AUDITORIA'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormDataLote({ ...item })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formDataLote.numero_lote_prestador || !formDataLote.prestador) {
      notify({ message: 'Preencha o Número do Lote e Prestador.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setLotes(prev => prev.map(l => l.id === selectedItem.id ? { ...l, ...formDataLote } : l))
      notify({ message: 'Lote de contas médicas auditado com sucesso!', type: 'success' })
    } else {
      const newLote = {
        ...formDataLote,
        id: `01923490-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`,
        data_recebimento: new Date().toISOString().split('T')[0]
      }
      setLotes(prev => [newLote, ...prev])
      notify({ message: 'Lote XML TISS importado e registrado para auditoria!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setLotes(prev => prev.filter(l => l.id !== itemToDelete.id))
      notify({ message: 'Lote de contas médicas removido.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columnsLotes = [
    {
      key: 'protocolo_operadora',
      header: 'PROTOCOLO / LOTE',
      minWidth: '170px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.numero_lote_prestador}</span>
        </div>
      )
    },
    {
      key: 'prestador',
      header: 'PRESTADOR EXECUTANTE / CNES',
      minWidth: '230px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>CNES: {r.cnes} | Comp: {r.competencia}</span>
        </div>
      )
    },
    {
      key: 'qtd_guias',
      header: 'VOLUMETRIA',
      minWidth: '110px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v} guias</span>
    },
    {
      key: 'valor_total_apresentado',
      header: 'VALOR APRESENTADO',
      minWidth: '150px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'valor_total_glosado',
      header: 'GLOSA',
      minWidth: '120px',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', color: v !== 'R$ 0,00' ? '#dc2626' : currentTheme?.colors?.textSecondary }}>
          {v}
        </span>
      )
    },
    {
      key: 'valor_total_liberado',
      header: 'VALOR LIBERADO',
      minWidth: '140px',
      render: (v) => <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{v}</span>
    },
    {
      key: 'status_lote',
      header: 'STATUS AUDITORIA',
      minWidth: '160px',
      render: (v) => (
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: v === 'AUDITADO / LIBERADO' ? '#16a34a' : '#d97706'
        }}>
          {v}
        </span>
      )
    }
  ]

  const columnsGlosas = [
    {
      key: 'guia_tiss',
      header: 'GUIA / PROTOCOLO',
      minWidth: '150px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.protocolo_lote}</span>
        </div>
      )
    },
    {
      key: 'procedimento',
      header: 'PROCEDIMENTO / BENEFICIÁRIO',
      minWidth: '240px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '500', fontSize: '0.8125rem' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.beneficiario}</span>
        </div>
      )
    },
    {
      key: 'codigo_glosa_tiss',
      header: 'MOTIVO DA GLOSA (TISS)',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: '600' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.motivo_glosa}</span>
        </div>
      )
    },
    {
      key: 'valor_glosado',
      header: 'VALOR GLOSADO',
      minWidth: '130px',
      render: (v) => <span style={{ fontWeight: '600', color: '#dc2626', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_glosa',
      header: 'STATUS RECURSO',
      minWidth: '180px',
      render: (v) => (
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: v === 'GLOSA CONFIRMADA' ? '#dc2626' : '#ea580c'
        }}>
          {v}
        </span>
      )
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
        title="Contas Médicas, Utilização e Glosas (M06)"
        subtitle="Recepção de Lotes XML TISS, Auditoria Automatizada de Regras e Gestão de Recursos de Glosa"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <UploadCloud size={16} />
            Importar Lote XML TISS (M06)
          </Button>
        ]}
      />

      {/* Sub-abas */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem 1.5rem 0',
        borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e5e7eb')}`,
        backgroundColor: currentTheme?.colors?.surface || (isDark ? '#18181b' : '#ffffff')
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('lotes')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'lotes' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'lotes' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'lotes' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Receipt size={16} />
          Lotes de Faturamento TISS (M06_LOTES_PRESTADOR)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('glosas')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'glosas' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'glosas' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'glosas' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ShieldX size={16} />
          Glosas e Recursos de Glosa (M06_GLOSAS)
        </button>
      </div>

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
            placeholder={activeTab === 'lotes' ? "Buscar por Lote, Protocolo TISS, Prestador, CNES..." : "Buscar por Guia, Beneficiário, Código Glosa..."}
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

        {activeTab === 'lotes' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="todos">Status: Todos</option>
            <option value="AUDITADO / LIBERADO">Auditados / Liberados</option>
            <option value="EM AUDITORIA">Em Auditoria</option>
          </select>
        )}

        {(searchQuery || statusFilter !== 'todos') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter('todos') }}
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
          {activeTab === 'lotes' ? `${filteredLotes.length} lotes TISS` : `${filteredGlosas.length} glosas`}
        </div>
      </section>

      {/* Conteúdo da Tabela */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'lotes' ? (
          <Table
            columns={columnsLotes}
            data={filteredLotes}
            onRowClick={(row) => handleOpenEdit(row)}
            emptyMessage="Nenhum lote XML TISS encontrado."
          />
        ) : (
          <Table
            columns={columnsGlosas}
            data={filteredGlosas}
            onRowClick={(row) => setSelectedItem(row)}
            emptyMessage="Nenhuma glosa registrada no período."
          />
        )}
      </div>

      {/* Modal de Lote */}
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
                {isEditing ? `Auditoria de Contas: ${formDataLote.protocolo_operadora}` : 'Recepção de Lote XML TISS (M06)'}
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
                  <label style={labelStyle}>Número do Lote Prestador</label>
                  <input
                    type="text"
                    required
                    value={formDataLote.numero_lote_prestador}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, numero_lote_prestador: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Protocolo Operadora (TISS)</label>
                  <input
                    type="text"
                    required
                    value={formDataLote.protocolo_operadora}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, protocolo_operadora: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Prestador Credenciado *</label>
                <input
                  type="text"
                  required
                  value={formDataLote.prestador}
                  onChange={(e) => setFormDataLote(prev => ({ ...prev, prestador: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Competência</label>
                  <input
                    type="text"
                    value={formDataLote.competencia}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, competencia: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CNES</label>
                  <input
                    type="text"
                    value={formDataLote.cnes}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, cnes: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Qtd Guias</label>
                  <input
                    type="number"
                    value={formDataLote.qtd_guias}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, qtd_guias: parseInt(e.target.value) || 0 }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Valor Apresentado</label>
                  <input
                    type="text"
                    value={formDataLote.valor_total_apresentado}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, valor_total_apresentado: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Valor Glosado</label>
                  <input
                    type="text"
                    value={formDataLote.valor_total_glosado}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, valor_total_glosado: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Valor Liberado</label>
                  <input
                    type="text"
                    value={formDataLote.valor_total_liberado}
                    onChange={(e) => setFormDataLote(prev => ({ ...prev, valor_total_liberado: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status Auditoria Contas Médicas</label>
                <select
                  value={formDataLote.status_lote}
                  onChange={(e) => setFormDataLote(prev => ({ ...prev, status_lote: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="AUDITADO / LIBERADO">AUDITADO / LIBERADO PARA TESOURARIA</option>
                  <option value="EM AUDITORIA">EM AUDITORIA DE REGRAS E TABELAS</option>
                  <option value="LOTE REJEITADO">LOTE REJEITADO</option>
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
                    {isEditing ? 'Salvar Auditoria' : 'Processar Lote'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Lote TISS"
        description={`Deseja realmente remover o lote "${itemToDelete?.protocolo_operadora}"?`}
      />
    </div>
  )
}
