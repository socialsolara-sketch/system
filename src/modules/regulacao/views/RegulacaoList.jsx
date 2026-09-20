// Arquivo: src/modules/regulacao/views/RegulacaoList.jsx
// Descrição: Módulo 05 - Regulação Médica e Autorizador TISS (M05_AUTORIZACOES, M05_AUTORIZACOES_ITENS)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, CheckCircle, XCircle, Clock, FileCheck, Stethoscope, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react'

const initialAutorizacoes = []

export default function RegulacaoList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [autorizacoes, setAutorizacoes] = useState(initialAutorizacoes)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [caraterFilter, setCaraterFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formData, setFormData] = useState({
    numero_autorizacao: '',
    beneficiario: '',
    carteirinha: '',
    prestador_solicitante: '',
    prestador_executante: '',
    tipo_guia: 'SP/SADT (EXAMES / TERAPIAS)',
    carater: 'ELETIVA',
    procedimento_principal: '',
    indicacao_clinica_texto: '',
    status_autorizacao: 'EM ANÁLISE / AUDITORIA',
    justificativa_negativa: '',
    auditor: 'DR. MARCELO NOGUEIRA (Auditor Médico)'
  })

  const filtered = useMemo(() => {
    return autorizacoes.filter(a => {
      if (statusFilter !== 'todos' && a.status_autorizacao !== statusFilter) return false
      if (tipoFilter !== 'todos' && a.tipo_guia !== tipoFilter) return false
      if (caraterFilter !== 'todos' && a.carater !== caraterFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        a.numero_autorizacao?.toLowerCase().includes(q) ||
        a.beneficiario?.toLowerCase().includes(q) ||
        a.carteirinha?.toLowerCase().includes(q) ||
        a.procedimento_principal?.toLowerCase().includes(q) ||
        a.prestador_solicitante?.toLowerCase().includes(q)
      )
    })
  }, [autorizacoes, searchQuery, statusFilter, tipoFilter, caraterFilter])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const nextNum = `AUT-2024-${Math.floor(10000 + Math.random() * 90000)}`
    setFormData({
      numero_autorizacao: nextNum,
      beneficiario: '',
      carteirinha: '',
      prestador_solicitante: 'DR. CARLOS EDUARDO MENEZES (CRM 123456/SP)',
      prestador_executante: 'HOSPITAL SÃO LUCAS S/A (CNES 2078912)',
      tipo_guia: 'SP/SADT (EXAMES / TERAPIAS)',
      carater: 'ELETIVA',
      procedimento_principal: '',
      indicacao_clinica_texto: '',
      status_autorizacao: 'AUTORIZADO',
      justificativa_negativa: '',
      auditor: 'SISTEMA AUTORIZADOR TISS AUTOMÁTICO'
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
    if (!formData.beneficiario || !formData.procedimento_principal) {
      notify({ message: 'Preencha o Beneficiário e o Procedimento Solicitado.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setAutorizacoes(prev => prev.map(a => a.id === selectedItem.id ? { ...a, ...formData } : a))
      notify({ message: 'Autorização atualizada com parecer da regulação médica.', type: 'success' })
    } else {
      const newAut = {
        ...formData,
        id: `01923480-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`,
        data_solicitacao: new Date().toISOString(),
        prazo_resposta_ate: new Date(Date.now() + 3 * 86400000).toISOString()
      }
      setAutorizacoes(prev => [newAut, ...prev])
      notify({ message: 'Solicitação de autorização registrada no Autorizador TISS!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setAutorizacoes(prev => prev.filter(a => a.id !== itemToDelete.id))
      notify({ message: 'Guia de autorização cancelada.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columns = [
    {
      key: 'numero_autorizacao',
      header: 'Nº GUIA / AUTORIZAÇÃO',
      minWidth: '150px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'beneficiario',
      header: 'BENEFICIÁRIO / CARTEIRINHA',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: currentTheme?.colors?.textSecondary }}>{r.carteirinha}</span>
        </div>
      )
    },
    {
      key: 'procedimento_principal',
      header: 'PROCEDIMENTO SOLICITADO (TUSS)',
      minWidth: '260px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '500' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.tipo_guia} • {r.carater}</span>
        </div>
      )
    },
    {
      key: 'prestador_solicitante',
      header: 'PRESTADOR SOLICITANTE / EXECUTANTE',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem' }}>
          <span>Sol: {v}</span>
          <span style={{ color: currentTheme?.colors?.textSecondary }}>Exec: {r.prestador_executante}</span>
        </div>
      )
    },
    {
      key: 'status_autorizacao',
      header: 'STATUS REGULAÇÃO',
      minWidth: '150px',
      render: (v) => {
        const isAut = v === 'AUTORIZADO'
        const isAnalise = v === 'EM ANÁLISE / AUDITORIA'
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isAut ? '#16a34a' : isAnalise ? '#d97706' : '#dc2626'
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
        title="Regulação Médica e Autorizador TISS (M05)"
        subtitle="Análise Prévia de Procedimentos, Prazos ANS (RN 395/566), Mesa de Auditoria Médica e Pareceres"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Solicitar Autorização TISS (M05)
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
            placeholder="Buscar por Guia, Beneficiário, Carteirinha, Código TUSS ou Médico..."
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
          <option value="AUTORIZADO">Autorizados</option>
          <option value="EM ANÁLISE / AUDITORIA">Em Auditoria / Análise</option>
          <option value="NEGADO">Negados</option>
        </select>

        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Tipo de Guia: Todas</option>
          <option value="SP/SADT (EXAMES / TERAPIAS)">SP/SADT (Exames/Terapias)</option>
          <option value="INTERNAÇÃO CIRÚRGICA">Internação Cirúrgica</option>
          <option value="CONSULTA">Consulta Eletiva</option>
        </select>

        <select
          value={caraterFilter}
          onChange={(e) => setCaraterFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Caráter: Todos</option>
          <option value="ELETIVA">Eletiva</option>
          <option value="URGÊNCIA">Urgência / Emergência</option>
        </select>

        {(searchQuery || statusFilter !== 'todos' || tipoFilter !== 'todos' || caraterFilter !== 'todos') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter('todos'); setTipoFilter('todos'); setCaraterFilter('todos') }}
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
          {filtered.length} guias reguladas
        </div>
      </section>

      {/* Tabela de Guias Reguladas */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => handleOpenEdit(row)}
          emptyMessage="Nenhuma guia de autorização encontrada com os filtros atuais."
        />
      </div>

      {/* Modal de Regulação / Análise */}
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
            maxWidth: '700px',
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
                {isEditing ? `Auditoria Médica: ${formData.numero_autorizacao}` : 'Solicitação de Autorização TISS (M05)'}
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
                  <label style={labelStyle}>Número da Guia / Protocolo</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_autorizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_autorizacao: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tipo de Guia TISS</label>
                  <select
                    value={formData.tipo_guia}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_guia: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="SP/SADT (EXAMES / TERAPIAS)">SP/SADT (EXAMES / TERAPIAS)</option>
                    <option value="INTERNAÇÃO CIRÚRGICA">INTERNAÇÃO CIRÚRGICA</option>
                    <option value="PRORROGAÇÃO DE INTERNAÇÃO">PRORROGAÇÃO DE INTERNAÇÃO</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Beneficiário *</label>
                  <input
                    type="text"
                    required
                    value={formData.beneficiario}
                    onChange={(e) => setFormData(prev => ({ ...prev, beneficiario: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Carteirinha TISS *</label>
                  <input
                    type="text"
                    required
                    value={formData.carteirinha}
                    onChange={(e) => setFormData(prev => ({ ...prev, carteirinha: e.target.value }))}
                    placeholder="0019.0000.000000.00-0"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Procedimento Principal (Código TUSS e Descrição) *</label>
                <input
                  type="text"
                  required
                  value={formData.procedimento_principal}
                  onChange={(e) => setFormData(prev => ({ ...prev, procedimento_principal: e.target.value }))}
                  placeholder="Ex: 41101010 - RESSONÂNCIA MAGNÉTICA..."
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Prestador Solicitante</label>
                  <input
                    type="text"
                    value={formData.prestador_solicitante}
                    onChange={(e) => setFormData(prev => ({ ...prev, prestador_solicitante: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Prestador Executante</label>
                  <input
                    type="text"
                    value={formData.prestador_executante}
                    onChange={(e) => setFormData(prev => ({ ...prev, prestador_executante: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Indicação Clínica e Justificativa Médica</label>
                <textarea
                  rows={3}
                  value={formData.indicacao_clinica_texto}
                  onChange={(e) => setFormData(prev => ({ ...prev, indicacao_clinica_texto: e.target.value }))}
                  placeholder="Descreva o quadro clínico, hipótese diagnóstica e justificativa..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Decisão da Regulação / Auditoria</label>
                  <select
                    value={formData.status_autorizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_autorizacao: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="AUTORIZADO">AUTORIZADO</option>
                    <option value="EM ANÁLISE / AUDITORIA">EM ANÁLISE / AUDITORIA</option>
                    <option value="NEGADO">NEGADO (Emitir Justificativa)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Auditor Responsável</label>
                  <input
                    type="text"
                    value={formData.auditor}
                    onChange={(e) => setFormData(prev => ({ ...prev, auditor: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {formData.status_autorizacao === 'NEGADO' && (
                <div>
                  <label style={labelStyle}>Motivo e Justificativa Técnica da Negativa</label>
                  <textarea
                    rows={2}
                    value={formData.justificativa_negativa}
                    onChange={(e) => setFormData(prev => ({ ...prev, justificativa_negativa: e.target.value }))}
                    placeholder="Fundamentação regulatória (ex: Não conformidade com DUT ANS)..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              )}

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
                    Cancelar Guia
                  </Button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                    Fechar
                  </Button>
                  <Button type="submit" style={{ fontWeight: '600' }}>
                    {isEditing ? 'Salvar Parecer' : 'Emitir Autorização'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Cancelar Guia de Autorização"
        description={`Deseja realmente cancelar a guia de autorização "${itemToDelete?.numero_autorizacao}"?`}
      />
    </div>
  )
}
