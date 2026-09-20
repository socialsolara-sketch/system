// Arquivo: src/modules/beneficiarios/views/BeneficiariosList.jsx
// Descrição: Módulo 02 - Beneficiários e Gestão de Vidas (M02_BENEFICIARIOS, M02_BENEFICIARIOS_HIST_STATUS, M02_DECLARACAO_SAUDE)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, HeartPulse, UserCheck, ShieldAlert, FileHeart, Edit, Trash2 } from 'lucide-react'

const initialBeneficiarios = []

export default function BeneficiariosList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [beneficiarios, setBeneficiarios] = useState(initialBeneficiarios)
  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [cptFilter, setCptFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formData, setFormData] = useState({
    numero_carteirinha: '',
    cns: '',
    nome_completo: '',
    cpf: '',
    data_nascimento: '',
    nome_plano: 'OURO NACIONAL ENFERMARIA (ANS 482910)',
    tipo_dependencia: 'TITULAR',
    grau_parentesco: 'TITULAR',
    data_adesao: new Date().toISOString().split('T')[0],
    data_fim_carencia_geral: '',
    cpt_indicador: 'NÃO',
    status_beneficiario: 'ATIVO',
    email: '',
    telefone: '',
    nome_mae: ''
  })

  const filtered = useMemo(() => {
    return beneficiarios.filter(b => {
      if (tipoFilter !== 'todos' && b.tipo_dependencia !== tipoFilter) return false
      if (statusFilter !== 'todos' && b.status_beneficiario !== statusFilter) return false
      if (cptFilter !== 'todos' && b.cpt_indicador !== cptFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        b.nome_completo?.toLowerCase().includes(q) ||
        b.numero_carteirinha?.toLowerCase().includes(q) ||
        b.cpf?.toLowerCase().includes(q) ||
        b.cns?.toLowerCase().includes(q) ||
        b.nome_plano?.toLowerCase().includes(q)
      )
    })
  }, [beneficiarios, searchQuery, tipoFilter, statusFilter, cptFilter])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const randomCard = `0019.${Math.floor(1000 + Math.random() * 9000)}.${Math.floor(100000 + Math.random() * 900000)}.01-${Math.floor(Math.random() * 9)}`
    setFormData({
      numero_carteirinha: randomCard,
      cns: '',
      nome_completo: '',
      cpf: '',
      data_nascimento: '',
      nome_plano: 'OURO NACIONAL ENFERMARIA (ANS 482910)',
      tipo_dependencia: 'TITULAR',
      grau_parentesco: 'TITULAR',
      data_adesao: new Date().toISOString().split('T')[0],
      data_fim_carencia_geral: '',
      cpt_indicador: 'NÃO',
      status_beneficiario: 'ATIVO',
      email: '',
      telefone: '',
      nome_mae: ''
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
    if (!formData.nome_completo || !formData.cpf) {
      notify({ message: 'Preencha o Nome Completo e CPF.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setBeneficiarios(prev => prev.map(b => b.id === selectedItem.id ? { ...b, ...formData } : b))
      notify({ message: 'Beneficiário atualizado com sucesso!', type: 'success' })
    } else {
      const newBeneficiario = {
        ...formData,
        id: `01923460-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`
      }
      setBeneficiarios(prev => [newBeneficiario, ...prev])
      notify({ message: 'Novo beneficiário incluído no contrato!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setBeneficiarios(prev => prev.filter(b => b.id !== itemToDelete.id))
      notify({ message: 'Beneficiário removido do cadastro.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columns = [
    {
      key: 'numero_carteirinha',
      header: 'CARTEIRINHA TISS',
      minWidth: '180px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'nome_completo',
      header: 'BENEFICIÁRIO / CPF',
      minWidth: '220px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>CPF: {r.cpf} | CNS: {r.cns}</span>
        </div>
      )
    },
    {
      key: 'nome_plano',
      header: 'PLANO DE SAÚDE',
      minWidth: '220px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'tipo_dependencia',
      header: 'VÍNCULO',
      minWidth: '120px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: '500' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.grau_parentesco}</span>
        </div>
      )
    },
    {
      key: 'cpt_indicador',
      header: 'CPT (PREEXISTÊNCIA)',
      minWidth: '140px',
      render: (v, r) => (
        <span style={{ fontSize: '0.8125rem', color: v === 'SIM' ? '#ea580c' : currentTheme?.colors?.textSecondary }}>
          {v === 'SIM' ? 'COM CPT (Agravo)' : 'ISENTO'}
        </span>
      )
    },
    {
      key: 'status_beneficiario',
      header: 'STATUS',
      minWidth: '110px',
      render: (v) => {
        const isAtivo = v === 'ATIVO'
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isAtivo ? '#16a34a' : v === 'SUSPENSO' ? '#ea580c' : '#dc2626'
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
        title="Beneficiários e Gestão de Vidas (M02)"
        subtitle="Controle de Titulares, Dependentes, Carências ANS, Declarações de Saúde e CPT"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Novo Beneficiário (M02)
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
            placeholder="Buscar por Nome, Carteirinha TISS, CPF, CNS ou Plano..."
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
          <option value="todos">Vínculo: Todos</option>
          <option value="TITULAR">Titulares</option>
          <option value="DEPENDENTE">Dependentes</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Status: Todos</option>
          <option value="ATIVO">Ativos</option>
          <option value="SUSPENSO">Suspensos</option>
          <option value="CANCELADO">Cancelados</option>
        </select>

        <select
          value={cptFilter}
          onChange={(e) => setCptFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">CPT: Todos</option>
          <option value="SIM">Com Preexistência (CPT)</option>
          <option value="NÃO">Sem CPT</option>
        </select>

        {(searchQuery || tipoFilter !== 'todos' || statusFilter !== 'todos' || cptFilter !== 'todos') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setTipoFilter('todos'); setStatusFilter('todos'); setCptFilter('todos') }}
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
          {filtered.length} beneficiários encontrados
        </div>
      </section>

      {/* Tabela de Beneficiários */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => handleOpenEdit(row)}
          emptyMessage="Nenhum beneficiário encontrado com os filtros selecionados."
        />
      </div>

      {/* Modal de Cadastro/Edição de Beneficiário */}
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
                {isEditing ? `Editar Beneficiário: ${formData.nome_completo}` : 'Novo Beneficiário (M02_BENEFICIARIOS)'}
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
                  <label style={labelStyle}>Número da Carteirinha TISS</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_carteirinha}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_carteirinha: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CNS (Cartão Nacional do SUS)</label>
                  <input
                    type="text"
                    value={formData.cns}
                    onChange={(e) => setFormData(prev => ({ ...prev, cns: e.target.value }))}
                    placeholder="789000000000000"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CPF *</label>
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nome da Mãe</label>
                  <input
                    type="text"
                    value={formData.nome_mae}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_mae: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Plano de Saúde Vinculado (M03_PLANOS)</label>
                <select
                  value={formData.nome_plano}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_plano: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="OURO NACIONAL ENFERMARIA (ANS 482910)">OURO NACIONAL ENFERMARIA (ANS 482910)</option>
                  <option value="DIAMANTE APARTAMENTO EXECUTIVO (ANS 490122)">DIAMANTE APARTAMENTO EXECUTIVO (ANS 490122)</option>
                  <option value="PRATA AMBULATORIAL REGIONAL (ANS 478120)">PRATA AMBULATORIAL REGIONAL (ANS 478120)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Tipo Vínculo</label>
                  <select
                    value={formData.tipo_dependencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_dependencia: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="TITULAR">TITULAR</option>
                    <option value="DEPENDENTE">DEPENDENTE</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Grau Parentesco</label>
                  <select
                    value={formData.grau_parentesco}
                    onChange={(e) => setFormData(prev => ({ ...prev, grau_parentesco: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="TITULAR">TITULAR</option>
                    <option value="CÔNJUGE">CÔNJUGE</option>
                    <option value="FILHO(A)">FILHO(A)</option>
                    <option value="PAI/MÃE">PAI/MÃE</option>
                    <option value="OUTRO">OUTRO</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status_beneficiario}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_beneficiario: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="SUSPENSO">SUSPENSO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Indicador de CPT (Doenças Preexistentes)</label>
                  <select
                    value={formData.cpt_indicador}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpt_indicador: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="NÃO">NÃO (Isento)</option>
                    <option value="SIM">SIM (Cobertura Parcial Temporária 24 meses)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Término Carência Geral</label>
                  <input
                    type="date"
                    value={formData.data_fim_carencia_geral}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim_carencia_geral: e.target.value }))}
                    style={inputStyle}
                  />
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
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Beneficiário'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Beneficiário"
        description={`Deseja realmente remover o registro de "${itemToDelete?.nome_completo}" (${itemToDelete?.numero_carteirinha})?`}
      />
    </div>
  )
}
