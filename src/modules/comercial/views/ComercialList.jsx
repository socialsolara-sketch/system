// Arquivo: src/modules/comercial/views/ComercialList.jsx
// Descrição: Módulo 03 - Comercial, Produtos e Contratos (M03_EMPRESAS_CONTRATANTES, M03_PLANOS, M03_CONTRATOS, M03_REGRAS_COPARTICIPACAO, M03_REAJUSTES_CONTRATUAIS)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, FileSignature, Layers, Building, Percent, Edit, Trash2 } from 'lucide-react'

const initialContratos = []

const initialPlanos = []

export default function ComercialList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [activeTab, setActiveTab] = useState('contratos') // 'contratos' | 'planos'
  const [contratos, setContratos] = useState(initialContratos)
  const [planos, setPlanos] = useState(initialPlanos)

  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formDataContrato, setFormDataContrato] = useState({
    numero_contrato: '',
    empresa_contratante: '',
    cnpj_cpf: '',
    plano: 'OURO NACIONAL ENFERMARIA (ANS 482910)',
    tipo_contratacao: 'COLETIVO EMPRESARIAL',
    qtd_vidas: 1,
    dia_vencimento: 10,
    dia_corte_faturamento: 25,
    mes_reajuste: 'JANEIRO',
    forma_cobranca: 'BOLETO BANCÁRIO / PIX',
    status_contrato: 'ATIVO',
    data_inicio: new Date().toISOString().split('T')[0]
  })

  const filteredContratos = useMemo(() => {
    return contratos.filter(c => {
      if (tipoFilter !== 'todos' && c.tipo_contratacao !== tipoFilter) return false
      if (statusFilter !== 'todos' && c.status_contrato !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.numero_contrato?.toLowerCase().includes(q) ||
        c.empresa_contratante?.toLowerCase().includes(q) ||
        c.cnpj_cpf?.toLowerCase().includes(q) ||
        c.plano?.toLowerCase().includes(q)
      )
    })
  }, [contratos, searchQuery, tipoFilter, statusFilter])

  const filteredPlanos = useMemo(() => {
    return planos.filter(p => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        p.nome_plano?.toLowerCase().includes(q) ||
        p.registro_ans?.toLowerCase().includes(q) ||
        p.segmentacao?.toLowerCase().includes(q)
      )
    })
  }, [planos, searchQuery])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const nextNum = `CTR-2024-00${Math.floor(1000 + Math.random() * 9000)}`
    setFormDataContrato({
      numero_contrato: nextNum,
      empresa_contratante: '',
      cnpj_cpf: '',
      plano: 'OURO NACIONAL ENFERMARIA (ANS 482910)',
      tipo_contratacao: 'COLETIVO EMPRESARIAL',
      qtd_vidas: 10,
      dia_vencimento: 10,
      dia_corte_faturamento: 25,
      mes_reajuste: 'JANEIRO',
      forma_cobranca: 'BOLETO BANCÁRIO / PIX',
      status_contrato: 'ATIVO',
      data_inicio: new Date().toISOString().split('T')[0]
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormDataContrato({ ...item })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formDataContrato.empresa_contratante || !formDataContrato.cnpj_cpf) {
      notify({ message: 'Preencha o Contratante e CPF/CNPJ.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setContratos(prev => prev.map(c => c.id === selectedItem.id ? { ...c, ...formDataContrato } : c))
      notify({ message: 'Contrato atualizado com sucesso!', type: 'success' })
    } else {
      const newContrato = {
        ...formDataContrato,
        id: `01923470-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`
      }
      setContratos(prev => [newContrato, ...prev])
      notify({ message: 'Novo contrato comercial formalizado!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setContratos(prev => prev.filter(c => c.id !== itemToDelete.id))
      notify({ message: 'Contrato removido com sucesso.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columnsContratos = [
    {
      key: 'numero_contrato',
      header: 'Nº CONTRATO',
      minWidth: '150px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'empresa_contratante',
      header: 'CONTRATANTE / CNPJ',
      minWidth: '240px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Doc: {r.cnpj_cpf}</span>
        </div>
      )
    },
    {
      key: 'plano',
      header: 'PRODUTO REGISTRADO ANS',
      minWidth: '220px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'tipo_contratacao',
      header: 'MODALIDADE',
      minWidth: '160px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
          <span>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.qtd_vidas} vidas ativas</span>
        </div>
      )
    },
    {
      key: 'dia_vencimento',
      header: 'CICLO FATURAMENTO',
      minWidth: '150px',
      render: (v, r) => (
        <span style={{ fontSize: '0.8125rem' }}>
          Venc. dia {v} (Corte dia {r.dia_corte_faturamento})
        </span>
      )
    },
    {
      key: 'status_contrato',
      header: 'STATUS',
      minWidth: '100px',
      render: (v) => (
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: v === 'ATIVO' ? '#16a34a' : v === 'SUSPENSO' ? '#ea580c' : '#dc2626'
        }}>
          {v}
        </span>
      )
    }
  ]

  const columnsPlanos = [
    {
      key: 'registro_ans',
      header: 'REGISTRO ANS',
      minWidth: '140px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'nome_plano',
      header: 'NOME DO PRODUTO',
      minWidth: '220px',
      render: (v) => <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
    },
    {
      key: 'segmentacao',
      header: 'SEGMENTAÇÃO ASSISTENCIAL',
      minWidth: '220px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'abrangencia',
      header: 'ABRANGÊNCIA',
      minWidth: '140px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
          <span>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.acomodacao}</span>
        </div>
      )
    },
    {
      key: 'tem_coparticipacao',
      header: 'COPARTICIPAÇÃO',
      minWidth: '160px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'ativo',
      header: 'STATUS ANS',
      minWidth: '100px',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: v === 'SIM' ? '#16a34a' : '#dc2626' }}>
          {v === 'SIM' ? 'ATIVO' : 'CANCELADO'}
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
        title="Comercial, Produtos e Contratos (M03)"
        subtitle="Gestão de Produtos ANS, Contratos PME/Individuais, Regras de Coparticipação e Reajustes Anuais"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Novo Contrato Comercial (M03)
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
          onClick={() => setActiveTab('contratos')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'contratos' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'contratos' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'contratos' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileSignature size={16} />
          Contratos e Empresas (M03_CONTRATOS)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('planos')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'planos' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'planos' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'planos' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Layers size={16} />
          Produtos e Planos ANS (M03_PLANOS)
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
            placeholder={activeTab === 'contratos' ? "Buscar por Contrato, Contratante, CNPJ, Plano..." : "Buscar por Nome do Produto, Registro ANS..."}
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

        {activeTab === 'contratos' && (
          <>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="todos">Modalidade: Todos</option>
              <option value="COLETIVO EMPRESARIAL">Coletivo Empresarial (PME)</option>
              <option value="INDIVIDUAL / FAMILIAR">Individual / Familiar</option>
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
          </>
        )}

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
          {activeTab === 'contratos' ? `${filteredContratos.length} contratos` : `${filteredPlanos.length} produtos`}
        </div>
      </section>

      {/* Conteúdo da Tabela */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'contratos' ? (
          <Table
            columns={columnsContratos}
            data={filteredContratos}
            onRowClick={(row) => handleOpenEdit(row)}
            emptyMessage="Nenhum contrato comercial encontrado."
          />
        ) : (
          <Table
            columns={columnsPlanos}
            data={filteredPlanos}
            onRowClick={(row) => setSelectedItem(row)}
            emptyMessage="Nenhum plano cadastrado."
          />
        )}
      </div>

      {/* Modal de Cadastro/Edição de Contrato */}
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
                {isEditing ? `Editar Contrato: ${formDataContrato.numero_contrato}` : 'Novo Contrato Comercial (M03_CONTRATOS)'}
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
                  <label style={labelStyle}>Número do Contrato</label>
                  <input
                    type="text"
                    required
                    value={formDataContrato.numero_contrato}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, numero_contrato: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Modalidade</label>
                  <select
                    value={formDataContrato.tipo_contratacao}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, tipo_contratacao: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="COLETIVO EMPRESARIAL">COLETIVO EMPRESARIAL (PME)</option>
                    <option value="INDIVIDUAL / FAMILIAR">INDIVIDUAL / FAMILIAR</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Razão Social / Nome Contratante *</label>
                  <input
                    type="text"
                    required
                    value={formDataContrato.empresa_contratante}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, empresa_contratante: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CNPJ / CPF *</label>
                  <input
                    type="text"
                    required
                    value={formDataContrato.cnpj_cpf}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, cnpj_cpf: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Plano / Produto ANS (M03_PLANOS)</label>
                <select
                  value={formDataContrato.plano}
                  onChange={(e) => setFormDataContrato(prev => ({ ...prev, plano: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="OURO NACIONAL ENFERMARIA (ANS 482910)">OURO NACIONAL ENFERMARIA (ANS 482910)</option>
                  <option value="DIAMANTE APARTAMENTO EXECUTIVO (ANS 490122)">DIAMANTE APARTAMENTO EXECUTIVO (ANS 490122)</option>
                  <option value="PRATA AMBULATORIAL REGIONAL (ANS 478120)">PRATA AMBULATORIAL REGIONAL (ANS 478120)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDataContrato.dia_vencimento}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, dia_vencimento: parseInt(e.target.value) || 10 }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Dia Corte Faturamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDataContrato.dia_corte_faturamento}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, dia_corte_faturamento: parseInt(e.target.value) || 25 }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mês Reajuste</label>
                  <select
                    value={formDataContrato.mes_reajuste}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, mes_reajuste: e.target.value }))}
                    style={inputStyle}
                  >
                    {['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Forma de Cobrança</label>
                  <select
                    value={formDataContrato.forma_cobranca}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, forma_cobranca: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="BOLETO BANCÁRIO / PIX">BOLETO BANCÁRIO / PIX</option>
                    <option value="DÉBITO AUTOMÁTICO">DÉBITO AUTOMÁTICO</option>
                    <option value="CARTÃO DE CRÉDITO RECORRENTE">CARTÃO DE CRÉDITO RECORRENTE</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status Contrato</label>
                  <select
                    value={formDataContrato.status_contrato}
                    onChange={(e) => setFormDataContrato(prev => ({ ...prev, status_contrato: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="SUSPENSO">SUSPENSO</option>
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
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Contrato'}
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
        title="Excluir Contrato Comercial"
        description={`Deseja realmente remover o contrato "${itemToDelete?.numero_contrato}" de ${itemToDelete?.empresa_contratante}?`}
      />
    </div>
  )
}
