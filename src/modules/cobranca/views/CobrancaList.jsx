// Arquivo: src/modules/cobranca/views/CobrancaList.jsx
// Descrição: Módulo 09 - Cobrança, Negociação e Interface Bancária (M09_BOLETOS_TITULOS, M09_ARQUIVOS_CNAB, M09_NEGOCIACOES_ACORDOS, M09_REGUA_COBRANCA)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Plus, Search, X, QrCode, FileText, Handshake, Download, Upload, Eye, Edit, Trash2 } from 'lucide-react'

const initialBoletos = []

const initialArquivosCNAB = []

export default function CobrancaList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [activeTab, setActiveTab] = useState('boletos') // 'boletos' | 'cnab'
  const [boletos, setBoletos] = useState(initialBoletos)
  const [cnabs, setCnabs] = useState(initialArquivosCNAB)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formDataBoleto, setFormDataBoleto] = useState({
    nosso_numero: '',
    numero_documento: '',
    pagador: '',
    cpf_cnpj: '',
    banco: '001 - BANCO DO BRASIL',
    carteira: '17',
    linha_digitavel: '',
    chave_pix_copia_cola: '',
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    valor_documento: 'R$ 0,00',
    status_boleto: 'EMITIDO_AGUARDANDO_REMESSA'
  })

  const filteredBoletos = useMemo(() => {
    return boletos.filter(b => {
      if (statusFilter !== 'todos' && b.status_boleto !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        b.nosso_numero?.toLowerCase().includes(q) ||
        b.pagador?.toLowerCase().includes(q) ||
        b.numero_documento?.toLowerCase().includes(q) ||
        b.linha_digitavel?.toLowerCase().includes(q)
      )
    })
  }, [boletos, searchQuery, statusFilter])

  const filteredCnabs = useMemo(() => {
    return cnabs.filter(c => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.nome_arquivo?.toLowerCase().includes(q) ||
        c.banco?.toLowerCase().includes(q) ||
        c.tipo_arquivo?.toLowerCase().includes(q)
      )
    })
  }, [cnabs, searchQuery])

  const handleOpenCreate = () => {
    setIsEditing(false)
    const nextNossoNum = `00001928${Math.floor(100 + Math.random() * 900)}`
    setFormDataBoleto({
      nosso_numero: nextNossoNum,
      numero_documento: `FAT-202403-${Math.floor(1000 + Math.random() * 9000)}`,
      pagador: '',
      cpf_cnpj: '',
      banco: '001 - BANCO DO BRASIL',
      carteira: '17',
      linha_digitavel: '00190.00009 01928.377008 00000.000171 1 96510000000000',
      chave_pix_copia_cola: '00020126580014br.gov.bcb.pix...',
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: '',
      valor_documento: 'R$ 0,00',
      status_boleto: 'EMITIDO_AGUARDANDO_REMESSA'
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormDataBoleto({ ...item })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formDataBoleto.pagador || !formDataBoleto.nosso_numero) {
      notify({ message: 'Preencha os dados do Pagador e Nosso Número.', type: 'error' })
      return
    }

    if (isEditing && selectedItem) {
      setBoletos(prev => prev.map(b => b.id === selectedItem.id ? { ...b, ...formDataBoleto } : b))
      notify({ message: 'Boleto/Título bancário atualizado!', type: 'success' })
    } else {
      const newBol = {
        ...formDataBoleto,
        id: `019234c0-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-000000000000`
      }
      setBoletos(prev => [newBol, ...prev])
      notify({ message: 'Boleto bancário emitido e preparado para Remessa CNAB!', type: 'success' })
    }
    setModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setBoletos(prev => prev.filter(b => b.id !== itemToDelete.id))
      notify({ message: 'Título baixado/cancelado.', type: 'success' })
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const columnsBoletos = [
    {
      key: 'nosso_numero',
      header: 'NOSSO NÚMERO / DOC',
      minWidth: '170px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Doc: {r.numero_documento}</span>
        </div>
      )
    },
    {
      key: 'pagador',
      header: 'SACADO / PAGADOR',
      minWidth: '230px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>Doc: {r.cpf_cnpj}</span>
        </div>
      )
    },
    {
      key: 'banco',
      header: 'BANCO / CARTEIRA',
      minWidth: '160px',
      render: (v, r) => <span style={{ fontSize: '0.8125rem' }}>{v} (Cart {r.carteira})</span>
    },
    {
      key: 'valor_documento',
      header: 'VALOR TÍTULO',
      minWidth: '130px',
      render: (v) => <span style={{ fontWeight: '700', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'data_vencimento',
      header: 'VENCIMENTO',
      minWidth: '120px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_boleto',
      header: 'STATUS BANCÁRIO',
      minWidth: '170px',
      render: (v) => {
        const isLiq = v.includes('LIQUIDADO')
        return (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isLiq ? '#16a34a' : '#2563eb'
          }}>
            {v}
          </span>
        )
      }
    }
  ]

  const columnsCNAB = [
    {
      key: 'nome_arquivo',
      header: 'ARQUIVO CNAB',
      minWidth: '150px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'tipo_arquivo',
      header: 'TIPO / LAYOUT',
      minWidth: '180px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: '600' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>{r.layout} • {r.banco}</span>
        </div>
      )
    },
    {
      key: 'qtd_registros',
      header: 'REGISTROS',
      minWidth: '110px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v} títulos</span>
    },
    {
      key: 'valor_total',
      header: 'VALOR TOTAL',
      minWidth: '140px',
      render: (v) => <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'status_processamento',
      header: 'STATUS',
      minWidth: '180px',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#16a34a' }}>
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
        title="Cobrança e Interface Bancária (M09)"
        subtitle="Emissão de Boletos Registrados, PIX QR Code Dinâmico, Remessa/Retorno CNAB 240/400 e Acordos"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="novo"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
          >
            <Plus size={16} />
            Gerar Boleto / PIX (M09)
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
          onClick={() => setActiveTab('boletos')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'boletos' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'boletos' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'boletos' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <QrCode size={16} />
          Boletos e PIX (M09_BOLETOS_TITULOS)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cnab')}
          style={{
            padding: '0.625rem 1rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'cnab' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
            color: activeTab === 'cnab' ? currentTheme?.colors?.textPrimary : currentTheme?.colors?.textSecondary,
            fontWeight: activeTab === 'cnab' ? '600' : '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={16} />
          Arquivos CNAB 240/400 (M09_ARQUIVOS_CNAB)
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
            placeholder={activeTab === 'boletos' ? "Buscar por Nosso Número, Pagador, Linha Digitável..." : "Buscar por Nome do Arquivo CNAB..."}
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

        {activeTab === 'boletos' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="todos">Status: Todos</option>
            <option value="REGISTRADO_NO_BANCO">Registrados no Banco</option>
            <option value="LIQUIDADO_PIX">Liquidados via PIX</option>
            <option value="LIQUIDADO_COMPENSACAO">Liquidados via Compensação</option>
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
          {activeTab === 'boletos' ? `${filteredBoletos.length} títulos bancários` : `${filteredCnabs.length} arquivos CNAB`}
        </div>
      </section>

      {/* Tabela de Boletos / CNAB */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'boletos' ? (
          <Table
            columns={columnsBoletos}
            data={filteredBoletos}
            onRowClick={(row) => handleOpenEdit(row)}
            emptyMessage="Nenhum boleto encontrado."
          />
        ) : (
          <Table
            columns={columnsCNAB}
            data={filteredCnabs}
            onRowClick={(row) => setSelectedItem(row)}
            emptyMessage="Nenhum arquivo CNAB registrado."
          />
        )}
      </div>

      {/* Modal Boleto */}
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
                {isEditing ? `Boleto / Título: ${formDataBoleto.nosso_numero}` : 'Novo Boleto Bancário com PIX (M09)'}
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
                  <label style={labelStyle}>Nosso Número</label>
                  <input
                    type="text"
                    required
                    value={formDataBoleto.nosso_numero}
                    onChange={(e) => setFormDataBoleto(prev => ({ ...prev, nosso_numero: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nº Documento Fatura</label>
                  <input
                    type="text"
                    required
                    value={formDataBoleto.numero_documento}
                    onChange={(e) => setFormDataBoleto(prev => ({ ...prev, numero_documento: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Sacado / Pagador *</label>
                  <input
                    type="text"
                    required
                    value={formDataBoleto.pagador}
                    onChange={(e) => setFormDataBoleto(prev => ({ ...prev, pagador: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CPF / CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={formDataBoleto.cpf_cnpj}
                    onChange={(e) => setFormDataBoleto(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Conta Cobrança / Banco</label>
                  <select
                    value={formDataBoleto.banco}
                    onChange={(e) => setFormDataBoleto(prev => ({ ...prev, banco: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="001 - BANCO DO BRASIL">001 - BANCO DO BRASIL (Carteira 17)</option>
                    <option value="237 - BRADESCO">237 - BRADESCO (Carteira 09)</option>
                    <option value="341 - ITAÚ UNIBANCO">341 - ITAÚ UNIBANCO</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Valor do Documento</label>
                  <input
                    type="text"
                    value={formDataBoleto.valor_documento}
                    onChange={(e) => setFormDataBoleto(prev => ({ ...prev, valor_documento: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Linha Digitável</label>
                <input
                  type="text"
                  value={formDataBoleto.linha_digitavel}
                  onChange={(e) => setFormDataBoleto(prev => ({ ...prev, linha_digitavel: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Status Boleto</label>
                <select
                  value={formDataBoleto.status_boleto}
                  onChange={(e) => setFormDataBoleto(prev => ({ ...prev, status_boleto: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="EMITIDO_AGUARDANDO_REMESSA">EMITIDO (AGUARDANDO ARQUIVO REMESSA CNAB)</option>
                  <option value="REGISTRADO_NO_BANCO">REGISTRADO NO BANCO (ATIVO CIP)</option>
                  <option value="LIQUIDADO_PIX">LIQUIDADO VIA PIX QR CODE</option>
                  <option value="LIQUIDADO_COMPENSACAO">LIQUIDADO VIA COMPENSAÇÃO BANCÁRIA</option>
                  <option value="BAIXADO_PROTESTO">BAIXADO / PROTESTADO</option>
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
                    Baixar Título
                  </Button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" style={{ fontWeight: '600' }}>
                    {isEditing ? 'Salvar Boleto' : 'Emitir Boleto'}
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
        title="Baixar Boleto Bancário"
        description={`Deseja realmente baixar o título "${itemToDelete?.nosso_numero}"?`}
      />
    </div>
  )
}
