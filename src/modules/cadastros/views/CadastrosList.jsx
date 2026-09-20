// Arquivo: src/modules/cadastros/views/CadastrosList.jsx
// Descrição: Módulo 01 - Cadastros Gerais (Master Data Management: M01_PESSOAS, M01_PESSOAS_ENDERECOS, M01_BANCOS, M01_CONTAS_BANCARIAS, M01_ANEXOS_DOCUMENTOS)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal, Card } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, Users, Landmark, FileText, MapPin, Eye, Edit, Trash2 } from 'lucide-react'

// Dados de Pessoas (M01_PESSOAS)
const initialPessoas = []

// Contas Bancárias (M01_CONTAS_BANCARIAS)
const initialContas = []

export default function CadastrosList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [activeTab, setActiveTab] = useState('pessoas') // 'pessoas' | 'contas'
  const [pessoas, setPessoas] = useState(initialPessoas)
  const [contas, setContas] = useState(initialContas)

  // Filtros em linha
  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Formulário Pessoas
  const [formDataPessoa, setFormDataPessoa] = useState({
    tipo_pessoa: 'JURÍDICA',
    cpf_cnpj: '',
    nome_razao_social: '',
    nome_fantasia: '',
    data_nascimento_fundacao: '',
    sexo: 'MASCULINO',
    estado_civil: 'CASADO',
    email_principal: '',
    telefone_principal: '',
    municipio: 'SÃO PAULO',
    uf: 'SP',
    ativo: 'SIM'
  })

  // Filtro
  const filteredPessoas = useMemo(() => {
    return pessoas.filter(p => {
      if (tipoFilter !== 'todos' && p.tipo_pessoa !== tipoFilter) return false
      if (statusFilter !== 'todos' && p.ativo !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        p.nome_razao_social?.toLowerCase().includes(q) ||
        p.nome_fantasia?.toLowerCase().includes(q) ||
        p.cpf_cnpj?.toLowerCase().includes(q) ||
        p.municipio?.toLowerCase().includes(q) ||
        p.email_principal?.toLowerCase().includes(q)
      )
    })
  }, [pessoas, searchQuery, tipoFilter, statusFilter])

  const filteredContas = useMemo(() => {
    return contas.filter(c => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.banco?.toLowerCase().includes(q) ||
        c.apelido?.toLowerCase().includes(q) ||
        c.conta?.toLowerCase().includes(q) ||
        c.agencia?.toLowerCase().includes(q)
      )
    })
  }, [contas, searchQuery])

  const handleOpenCreate = () => {
    setIsEditing(false)
    setFormDataPessoa({
      tipo_pessoa: 'JURÍDICA',
      cpf_cnpj: '',
      nome_razao_social: '',
      nome_fantasia: '',
      data_nascimento_fundacao: '',
      sexo: 'MASCULINO',
      estado_civil: 'CASADO',
      email_principal: '',
      telefone_principal: '',
      municipio: 'SÃO PAULO',
      uf: 'SP',
      ativo: 'SIM'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormDataPessoa({ ...item })
    setModalOpen(true)
  }

  const handleSavePessoa = (e) => {
    e.preventDefault()
    if (!formDataPessoa.nome_razao_social || !formDataPessoa.cpf_cnpj) {
      notify({ message: 'Preencha Razão Social / Nome e Documento.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setPessoas(prev => prev.map(p => p.id === selectedItem.id ? { ...p, ...formDataPessoa } : p))
      notify({ message: 'Cadastro atualizado com sucesso!', type: 'success' })
    } else {
      const newPessoa = {
        ...formDataPessoa,
        id: `01923450-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`,
        created_at: new Date().toISOString()
      }
      setPessoas(prev => [newPessoa, ...prev])
      notify({ message: 'Nova pessoa cadastrada no Master Data!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setPessoas(prev => prev.filter(p => p.id !== itemToDelete.id))
      notify({ message: 'Registro excluído com sucesso.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  // Colunas de Pessoas (M01_PESSOAS)
  const columnsPessoas = [
    {
      key: 'cpf_cnpj',
      header: 'DOCUMENTO',
      minWidth: '150px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'nome_razao_social',
      header: 'NOME / RAZÃO SOCIAL',
      minWidth: '240px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          {r.nome_fantasia && r.nome_fantasia !== v && (
            <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.nome_fantasia}</span>
          )}
        </div>
      )
    },
    {
      key: 'tipo_pessoa',
      header: 'TIPO',
      minWidth: '100px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'email_principal',
      header: 'CONTATO',
      minWidth: '200px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
          <span>{v}</span>
          <span style={{ color: currentTheme?.colors?.textSecondary, fontSize: '0.75rem' }}>{r.telefone_principal}</span>
        </div>
      )
    },
    {
      key: 'municipio',
      header: 'MUNICÍPIO / UF',
      minWidth: '150px',
      render: (v, r) => <span style={{ fontSize: '0.8125rem' }}>{v}/{r.uf}</span>
    },
    {
      key: 'ativo',
      header: 'STATUS',
      minWidth: '90px',
      render: (v) => {
        const isAtivo = v === 'SIM'
        return (
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: isAtivo ? '#16a34a' : '#dc2626' }}>
            {isAtivo ? 'ATIVO' : 'INATIVO'}
          </span>
        )
      }
    }
  ]

  // Colunas de Contas Bancárias (M01_CONTAS_BANCARIAS)
  const columnsContas = [
    {
      key: 'banco',
      header: 'INSTITUIÇÃO FINANCEIRA',
      minWidth: '220px',
      render: (v) => <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'apelido',
      header: 'FINALIDADE / APELIDO',
      minWidth: '220px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'agencia',
      header: 'AGÊNCIA / CONTA',
      minWidth: '150px',
      render: (v, r) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>Ag {v} / Cc {r.conta}</span>
    },
    {
      key: 'chave_pix',
      header: 'CHAVE PIX',
      minWidth: '200px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v || '-'}</span>
    },
    {
      key: 'saldo_inicial',
      header: 'SALDO',
      minWidth: '130px',
      render: (v) => <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'ativo',
      header: 'STATUS',
      minWidth: '90px',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: v === 'SIM' ? '#16a34a' : '#dc2626' }}>
          {v === 'SIM' ? 'ATIVO' : 'INATIVO'}
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
        title="Cadastros Gerais (M01)"
        subtitle="Master Data Management - Pessoas (PF/PJ), Endereços, Instituições Financeiras e Contas Bancárias"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Cadastrar Pessoa (M01)
          </Button>
        ]}
      />

      {/* Sub-abas de entidades do M01 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem 1.5rem 0',
        borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e5e7eb')}`,
        backgroundColor: currentTheme?.colors?.surface || (isDark ? '#18181b' : '#ffffff')
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('pessoas')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'pessoas' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'pessoas' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'pessoas' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={16} />
          Pessoas e Entidades (M01_PESSOAS)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contas')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'contas' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'contas' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'contas' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Landmark size={16} />
          Contas Bancárias Operadora (M01_CONTAS_BANCARIAS)
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
            placeholder={activeTab === 'pessoas' ? "Buscar por Razão Social, CPF/CNPJ, Município..." : "Buscar por Banco, Apelido, Agência..."}
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

        {activeTab === 'pessoas' && (
          <>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="todos">Tipo: Todos</option>
              <option value="JURÍDICA">Pessoa Jurídica</option>
              <option value="FÍSICA">Pessoa Física</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="todos">Status: Todos</option>
              <option value="SIM">Ativos</option>
              <option value="NÃO">Inativos</option>
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
          {activeTab === 'pessoas' ? `${filteredPessoas.length} registros` : `${filteredContas.length} contas`}
        </div>
      </section>

      {/* Conteúdo da Tabela */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'pessoas' ? (
          <Table
            columns={columnsPessoas}
            data={filteredPessoas}
            onRowClick={(row) => handleOpenEdit(row)}
            emptyMessage="Nenhuma pessoa ou entidade encontrada no Master Data."
          />
        ) : (
          <Table
            columns={columnsContas}
            data={filteredContas}
            onRowClick={(row) => setSelectedItem(row)}
            emptyMessage="Nenhuma conta bancária cadastrada."
          />
        )}
      </div>

      {/* Modal de Cadastro/Edição de Pessoa */}
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
                {isEditing ? 'Editar Entidade / Pessoa (M01)' : 'Cadastrar Nova Entidade (M01)'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePessoa} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Tipo de Pessoa</label>
                <select
                  value={formDataPessoa.tipo_pessoa}
                  onChange={(e) => setFormDataPessoa(prev => ({ ...prev, tipo_pessoa: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="JURÍDICA">Pessoa Jurídica (Empresa, Hospital, Clínica)</option>
                  <option value="FÍSICA">Pessoa Física (Médico, Beneficiário, Colaborador)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>{formDataPessoa.tipo_pessoa === 'JURÍDICA' ? 'CNPJ *' : 'CPF *'}</label>
                  <input
                    type="text"
                    required
                    value={formDataPessoa.cpf_cnpj}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                    placeholder={formDataPessoa.tipo_pessoa === 'JURÍDICA' ? '00.000.000/0000-00' : '000.000.000-00'}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{formDataPessoa.tipo_pessoa === 'JURÍDICA' ? 'Razão Social *' : 'Nome Completo *'}</label>
                  <input
                    type="text"
                    required
                    value={formDataPessoa.nome_razao_social}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, nome_razao_social: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nome Fantasia</label>
                  <input
                    type="text"
                    value={formDataPessoa.nome_fantasia}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Data Nasc. / Fundação</label>
                  <input
                    type="date"
                    value={formDataPessoa.data_nascimento_fundacao}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, data_nascimento_fundacao: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>E-mail Principal</label>
                  <input
                    type="email"
                    value={formDataPessoa.email_principal}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, email_principal: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Telefone Principal</label>
                  <input
                    type="text"
                    value={formDataPessoa.telefone_principal}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, telefone_principal: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Município</label>
                  <input
                    type="text"
                    value={formDataPessoa.municipio}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, municipio: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formDataPessoa.uf}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Ativo</label>
                  <select
                    value={formDataPessoa.ativo}
                    onChange={(e) => setFormDataPessoa(prev => ({ ...prev, ativo: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="SIM">SIM</option>
                    <option value="NÃO">NÃO</option>
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
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
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
        title="Excluir Registro Master Data"
        description={`Deseja realmente remover o cadastro de "${itemToDelete?.nome_razao_social}"? Esta ação removerá a entidade base do sistema.`}
      />
    </div>
  )
}
