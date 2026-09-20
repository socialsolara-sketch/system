// Arquivo: src/modules/ans-regulatorio/views/AnsRegulatorioList.jsx
// Descrição: Módulo 10 - SIP / DIOPS / ANS e Regulatório (M10_SIP_CONSOLIDACOES, M10_DIOPS_PARAMETROS, M10_TISS_VERSOES, M10_TUSS_TABELA_PROPRIAS)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, Landmark, FileSpreadsheet, ShieldAlert, CheckCircle2, DownloadCloud, Play, Edit, Trash2 } from 'lucide-react'

const initialSip = []

const initialDiops = []

export default function AnsRegulatorioList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [activeTab, setActiveTab] = useState('sip') // 'sip' | 'diops'
  const [sipData, setSipData] = useState(initialSip)
  const [diopsData, setDiopsData] = useState(initialDiops)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formDataSip, setFormDataSip] = useState({
    trimestre: '2º Trimestre / 2024',
    tipo_obrigacao: 'SIP - SISTEMA DE INFORMAÇÕES DE PRODUTOS',
    data_limite_envio: '2024-07-31',
    qtd_eventos_processados: 12500,
    valor_total_eventos: 'R$ 4.200.000,00',
    status_validacao: 'VALIDADO_SEM_ERROS',
    status_transmissao: 'PENDENTE_ENVIO'
  })

  const filteredSip = useMemo(() => {
    return sipData.filter(s => {
      if (statusFilter !== 'todos' && s.status_transmissao !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return s.trimestre?.toLowerCase().includes(q) || s.tipo_obrigacao?.toLowerCase().includes(q)
    })
  }, [sipData, searchQuery, statusFilter])

  const filteredDiops = useMemo(() => {
    return diopsData.filter(d => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return d.trimestre?.toLowerCase().includes(q) || d.tipo_obrigacao?.toLowerCase().includes(q)
    })
  }, [diopsData, searchQuery])

  const handleOpenCreate = () => {
    setIsEditing(false)
    setFormDataSip({
      trimestre: '2º Trimestre / 2024',
      tipo_obrigacao: 'SIP - SISTEMA DE INFORMAÇÕES DE PRODUTOS',
      data_limite_envio: '2024-07-31',
      qtd_eventos_processados: 12500,
      valor_total_eventos: 'R$ 4.200.000,00',
      status_validacao: 'VALIDADO_SEM_ERROS',
      status_transmissao: 'PENDENTE_ENVIO'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormDataSip({ ...item })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formDataSip.trimestre) {
      notify({ message: 'Preencha o trimestre da obrigação ANS.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setSipData(prev => prev.map(s => s.id === selectedItem.id ? { ...s, ...formDataSip } : s))
      notify({ message: 'Obrigação regulatória ANS atualizada!', type: 'success' })
    } else {
      const newSip = {
        ...formDataSip,
        id: `019234d0-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`,
        data_geracao: new Date().toISOString().split('T')[0]
      }
      setSipData(prev => [newSip, ...prev])
      notify({ message: 'Lote XML SIP gerado e validado conforme regras ANS!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setSipData(prev => prev.filter(s => s.id !== itemToDelete.id))
      notify({ message: 'Lote regulatório removido.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columnsSip = [
    {
      key: 'trimestre',
      header: 'COMPETÊNCIA / OBRIGAÇÃO',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.tipo_obrigacao}</span>
        </div>
      )
    },
    {
      key: 'qtd_eventos_processados',
      header: 'VOLUMETRIA UTILIZAÇÃO',
      minWidth: '170px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v?.toLocaleString('pt-BR')} procedimentos</span>
    },
    {
      key: 'valor_total_eventos',
      header: 'SINISTRALIDADE TOTAL',
      minWidth: '170px',
      render: (v) => <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_validacao',
      header: 'VALIDADOR ANS',
      minWidth: '170px',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#16a34a' }}>
          {v}
        </span>
      )
    },
    {
      key: 'status_transmissao',
      header: 'STATUS TRANSMISSÃO',
      minWidth: '170px',
      render: (v) => {
        const isTrans = v === 'TRANSMITIDO_ANS'
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isTrans ? '#16a34a' : '#ea580c'
          }}>
            {v}
          </span>
        )
      }
    }
  ]

  const columnsDiops = [
    {
      key: 'trimestre',
      header: 'COMPETÊNCIA DIOPS',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.tipo_obrigacao}</span>
        </div>
      )
    },
    {
      key: 'provisao_eventos_peona',
      header: 'PROVISÃO PEONA (RN 521)',
      minWidth: '180px',
      render: (v) => <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{v}</span>
    },
    {
      key: 'margem_solvencia_calculada',
      header: 'MARGEM SOLVÊNCIA APURADA',
      minWidth: '200px',
      render: (v) => <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#16a34a' }}>{v}</span>
    },
    {
      key: 'capital_base_requerido',
      header: 'CAPITAL BASE EXIGIDO',
      minWidth: '170px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_transmissao',
      header: 'TRANSMISSÃO',
      minWidth: '150px',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: v === 'TRANSMITIDO_ANS' ? '#16a34a' : '#ea580c' }}>
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
        title="SIP / DIOPS / ANS e Regulatório (M10)"
        subtitle="Geração de Arquivos SIP, DIOPS Financeiro RN 521, Margem de Solvência e Tabelas TUSS"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Play size={16} />
            Consolidar SIP Trimestral (M10)
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
          onClick={() => setActiveTab('sip')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'sip' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'sip' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'sip' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Landmark size={16} />
          SIP - Sistema Informações de Produtos (M10_SIP)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diops')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'diops' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'diops' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'diops' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileSpreadsheet size={16} />
          DIOPS Financeiro & PEONA (M10_DIOPS)
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
            placeholder="Buscar por Trimestre ou Obrigação ANS..."
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

        {activeTab === 'sip' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="todos">Transmissão: Todos</option>
            <option value="TRANSMITIDO_ANS">Transmitido à ANS</option>
            <option value="PENDENTE_ENVIO">Pendente de Envio</option>
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
          {activeTab === 'sip' ? `${filteredSip.length} arquivos SIP` : `${filteredDiops.length} apurações DIOPS`}
        </div>
      </section>

      {/* Tabela */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'sip' ? (
          <Table
            columns={columnsSip}
            data={filteredSip}
            onRowClick={(row) => handleOpenEdit(row)}
            emptyMessage="Nenhuma consolidação SIP encontrada."
          />
        ) : (
          <Table
            columns={columnsDiops}
            data={filteredDiops}
            onRowClick={(row) => setSelectedItem(row)}
            emptyMessage="Nenhuma apuração DIOPS encontrada."
          />
        )}
      </div>

      {/* Modal SIP */}
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
                {isEditing ? `Consolidação SIP: ${formDataSip.trimestre}` : 'Nova Consolidação de Dados SIP ANS'}
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
              <div>
                <label style={labelStyle}>Competência / Trimestre *</label>
                <input
                  type="text"
                  required
                  value={formDataSip.trimestre}
                  onChange={(e) => setFormDataSip(prev => ({ ...prev, trimestre: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Tipo da Obrigação</label>
                <input
                  type="text"
                  readOnly
                  value={formDataSip.tipo_obrigacao}
                  style={{ ...inputStyle, opacity: 0.8 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Qtd Eventos Processados</label>
                  <input
                    type="number"
                    value={formDataSip.qtd_eventos_processados}
                    onChange={(e) => setFormDataSip(prev => ({ ...prev, qtd_eventos_processados: parseInt(e.target.value) || 0 }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Sinistralidade Total (R$)</label>
                  <input
                    type="text"
                    value={formDataSip.valor_total_eventos}
                    onChange={(e) => setFormDataSip(prev => ({ ...prev, valor_total_eventos: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status Transmissão ANS</label>
                <select
                  value={formDataSip.status_transmissao}
                  onChange={(e) => setFormDataSip(prev => ({ ...prev, status_transmissao: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="PENDENTE_ENVIO">PENDENTE DE TRANSMISSÃO</option>
                  <option value="TRANSMITIDO_ANS">TRANSMITIDO E PROTOCOLADO NA ANS</option>
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
                    {isEditing ? 'Salvar Lote SIP' : 'Gerar e Validar SIP'}
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
        title="Remover Lote SIP"
        description={`Deseja realmente remover o lote do SIP "${itemToDelete?.trimestre}"?`}
      />
    </div>
  )
}
