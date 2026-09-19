// Arquivo: src/modules/usuario/views/UsuarioForm.jsx
// Descrição: Formulário de criação e edição de Usuário/Beneficiário com estilização flat e minimalista.

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { Search } from 'lucide-react'
import mockUsuarios, { availableCPTs } from '../data/mockUsuarios'

export default function UsuarioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const isEditing = Boolean(id)

  const [formData, setFormData] = useState(() => {
    if (id) {
      const found = mockUsuarios.find((u) => String(u.id) === String(id))
      if (found) {
        return {
          codigo_carteirinha: found.codigo_carteirinha || '',
          nome_completo: found.nome_completo || '',
          cpf: found.cpf || '',
          rg: found.rg || '',
          orgao_emissor_rg: found.orgao_emissor_rg || '',
          cns: found.cns || '',
          data_nascimento: found.data_nascimento || '',
          sexo: found.sexo || 'M',
          nome_mae: found.nome_mae || '',
          estado_civil: found.estado_civil || 'Solteiro(a)',

          tipo_beneficiario: found.tipo_beneficiario || 'Titular',
          id_titular: found.id_titular || '',
          grau_parentesco: found.grau_parentesco || '',
          numero_contrato: found.numero_contrato || '',
          
          tipo_contrato: found.tipo_contrato || 'Coletivo Empresarial',
          estipulante_nome: found.estipulante_nome || '',
          estipulante_cnpj: found.estipulante_cnpj || '',
          segmentacao_assistencial: found.segmentacao_assistencial || 'Ambulatorial + Hospitalar com Obstetrícia',
          tipo_cobertura: found.tipo_cobertura || 'Nacional',
          tipo_acomodacao: found.tipo_acomodacao || 'Apartamento',
          registro_ans_plano: found.registro_ans_plano || '',
          nome_comercial_plano: found.nome_comercial_plano || '',
          coparticipacao_indicador: found.coparticipacao_indicador !== undefined ? Boolean(found.coparticipacao_indicador) : true,
          valor_mensalidade: found.valor_mensalidade || 0,
          situacao_financeira_contrato: found.situacao_financeira_contrato || 'Adimplente',

          id_plano: found.id_plano || '101',
          situacao_cadastral: found.situacao_cadastral || 'Ativo',
          data_adesao: found.data_adesao || '',
          data_cancelamento: found.data_cancelamento || '',
          motivo_cancelamento: found.motivo_cancelamento || '',

          cpt_indicador: Boolean(found.cpt_indicador),
          inicio_carencia_contratual: found.inicio_carencia_contratual || '',
          fim_carencia_contratual: found.fim_carencia_contratual || '',
          fim_carencia_consultas: found.fim_carencia_consultas || '',
          fim_carencia_exames: found.fim_carencia_exames || '',
          fim_carencia_internacao: found.fim_carencia_internacao || '',
          fim_carencia_parto: found.fim_carencia_parto || '',
          cpts: found.cpts || [],

          email: found.email || '',
          telefone_celular: found.telefone_celular || '',
          cep: found.cep || '',
          logradouro: found.logradouro || '',
          numero: found.numero || '',
          complemento: found.complemento || '',
          bairro: found.bairro || '',
          cidade: found.cidade || '',
          uf: found.uf || 'SP',

          hash_senha: found.hash_senha || '',
          primeiro_acesso: Boolean(found.primeiro_acesso)
        }
      }
    }
    return {
      codigo_carteirinha: '',
      nome_completo: '',
      cpf: '',
      rg: '',
      orgao_emissor_rg: '',
      cns: '',
      data_nascimento: '',
      sexo: 'M',
      nome_mae: '',
      estado_civil: 'Solteiro(a)',

      tipo_beneficiario: 'Titular',
      id_titular: '',
      grau_parentesco: '',
      numero_contrato: '',
      
      tipo_contrato: 'Coletivo Empresarial',
      estipulante_nome: '',
      estipulante_cnpj: '',
      segmentacao_assistencial: 'Ambulatorial + Hospitalar com Obstetrícia',
      tipo_cobertura: 'Nacional',
      tipo_acomodacao: 'Apartamento',
      registro_ans_plano: '',
      nome_comercial_plano: '',
      coparticipacao_indicador: true,
      valor_mensalidade: 0,
      situacao_financeira_contrato: 'Adimplente',

      id_plano: '101',
      situacao_cadastral: 'Ativo',
      data_adesao: new Date().toISOString().split('T')[0],
      data_cancelamento: '',
      motivo_cancelamento: '',

      cpt_indicador: false,
      inicio_carencia_contratual: '',
      fim_carencia_contratual: '',
      fim_carencia_consultas: '',
      fim_carencia_exames: '',
      fim_carencia_internacao: '',
      fim_carencia_parto: '',
      cpts: [],

      email: '',
      telefone_celular: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: 'SP',

      hash_senha: '$2a$12$defaultHashForNewUserPlaceholder',
      primeiro_acesso: true
    }
  })

  const [activeFormTabSection, setActiveFormTabSection] = useState('carencias')
  const [cptSearchQuery, setCptSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Estados do Modal de Confirmação Reutilizável
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    description: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    variant: 'warning'
  })

  const requestConfirmation = ({ title, description, confirmText, cancelText, onConfirm, variant }) => {
    setConfirmModalConfig({
      title,
      description,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm()
        setIsConfirmModalOpen(false)
      },
      variant
    })
    setIsConfirmModalOpen(true)
  }

  const handleAddPredefinedCpt = (cpt) => {
    const alreadyExists = (formData.cpts || []).some(
      (item) => item.patologia.toLowerCase() === cpt.patologia.toLowerCase()
    )
    if (alreadyExists) {
      notify.warn('Já adicionado', `A patologia "${cpt.patologia}" já está vinculada a este beneficiário.`)
      return
    }

    requestConfirmation({
      title: 'Vincular Doença Preexistente',
      description: `Deseja realmente vincular a patologia "${cpt.patologia}" ao contrato deste beneficiário? Os recursos e procedimentos listados sob CPT serão aplicados.`,
      confirmText: 'Vincular CPT',
      cancelText: 'Cancelar',
      variant: 'success',
      onConfirm: () => {
        const existingCpts = formData.cpts || []
        const maxId = existingCpts.reduce((max, item) => {
          const idNum = Number(item.id)
          return isNaN(idNum) ? max : Math.max(max, idNum)
        }, 0)
        const newId = maxId > 10000 ? maxId + 1 : 10001

        const newCptObj = {
          id: newId,
          patologia: cpt.patologia,
          recurso: cpt.recurso,
          predefinedId: cpt.id
        }

        setFormData((prev) => ({
          ...prev,
          cpts: [...(prev.cpts || []), newCptObj]
        }))

        setCptSearchQuery('')
        setIsDropdownOpen(false)
        notify.success('CPT Adicionada!', `A patologia "${cpt.patologia}" foi vinculada com sucesso.`)
      }
    })
  }

  const handleRemoveCpt = (cptId, patologia) => {
    requestConfirmation({
      title: 'Desvincular Doença Preexistente',
      description: `Tem certeza que deseja remover a restrição de CPT para a patologia "${patologia}" do contrato deste beneficiário?`,
      confirmText: 'Desvincular',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          cpts: (prev.cpts || []).filter((item) => item.id !== cptId)
        }))
        notify.success('Restrição removida!', `A restrição de CPT para "${patologia}" foi removida da tabela.`)
      }
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (isEditing) {
      const idx = mockUsuarios.findIndex((u) => String(u.id) === String(id))
      if (idx !== -1) {
        mockUsuarios[idx] = {
          ...mockUsuarios[idx],
          ...formData
        }
      }
      notify.success('Usuário Atualizado!', `Os dados de ${formData.nome_completo} foram salvos com sucesso.`)
    } else {
      const nextId = mockUsuarios.length > 0 ? Math.max(...mockUsuarios.map((u) => Number(u.id) || 0)) + 1 : 1
      const newUser = {
        id: nextId,
        ...formData
      }
      mockUsuarios.push(newUser)
      notify.success('Usuário Criado!', `O beneficiário ${formData.nome_completo} foi cadastrado com sucesso.`)
    }
    navigate('/usuario')
  }

  // Estilos Flat de Formulário baseados no Settings
  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    fontSize: '0.875rem',
    color: currentTheme?.colors?.textPrimary || '#0f172a'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
    borderRadius: '0.375rem',
    backgroundColor: currentTheme?.colors?.input || '#ffffff',
    color: currentTheme?.colors?.textPrimary || '#000000',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.875rem',
    transition: 'border-color 0.15s ease'
  }

  const helpTextStyle = {
    fontSize: '0.75rem',
    color: currentTheme?.colors?.textSecondary || '#64748b',
    marginTop: '0.375rem',
    display: 'block'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem'
  }

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto' }}>
      <div style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
      {/* Cabeçalho da Página (Flat Header) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${currentTheme?.colors?.border || 'rgba(0, 0, 0, 0.1)'}`
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0,
            color: currentTheme?.colors?.textPrimary || '#0f172a',
            letterSpacing: '-0.01em'
          }}>
            {isEditing ? `Editar Usuário #${id}` : 'Novo Usuário Beneficiário'}
          </h1>
          <span style={{
            fontSize: '0.875rem',
            color: currentTheme?.colors?.textSecondary || '#64748b'
          }}>
            Preencha e atualize as informações regulatórias da ANS e TISS do beneficiário.
          </span>
        </div>
      </div>

      <form id="usuario-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Seção 1: Identificação */}
        <Card title="Identificação do Beneficiário">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Código Carteirinha (TISS) *</label>
              <input
                type="text"
                name="codigo_carteirinha"
                value={formData.codigo_carteirinha}
                onChange={handleChange}
                required
                placeholder="Ex: 00123456789012345601"
                style={inputStyle}
              />
              <span style={helpTextStyle}>Padrão numérico regulatório TISS.</span>
            </div>

            <div>
              <label style={labelStyle}>Nome Completo *</label>
              <input
                type="text"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                required
                placeholder="Nome do beneficiário"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CPF (apenas números) *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                maxLength={11}
                placeholder="12345678901"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>RG</label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                placeholder="Número do RG"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Órgão Emissor RG</label>
              <input
                type="text"
                name="orgao_emissor_rg"
                value={formData.orgao_emissor_rg}
                onChange={handleChange}
                placeholder="Ex: SSP/SP"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CNS (Cartão SUS) *</label>
              <input
                type="text"
                name="cns"
                value={formData.cns}
                onChange={handleChange}
                required
                placeholder="701234567890123"
                style={inputStyle}
              />
              <span style={helpTextStyle}>15 dígitos do Cartão Nacional de Saúde.</span>
            </div>

            <div>
              <label style={labelStyle}>Data de Nascimento *</label>
              <input
                type="date"
                name="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Sexo *</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} required style={inputStyle}>
                <option value="M">Masculino (M)</option>
                <option value="F">Feminino (F)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Nome da Mãe *</label>
              <input
                type="text"
                name="nome_mae"
                value={formData.nome_mae}
                onChange={handleChange}
                required
                placeholder="Nome completo da mãe"
                style={inputStyle}
              />
              <span style={helpTextStyle}>Exigência regulatória obrigatória ANS.</span>
            </div>

            <div>
              <label style={labelStyle}>Estado Civil</label>
              <select name="estado_civil" value={formData.estado_civil} onChange={handleChange} style={inputStyle}>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
                <option value="União Estável">União Estável</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Seção 2: Contrato com a Operadora */}
        <Card title="Contrato com Operadora">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Tipo de Beneficiário *</label>
              <select name="tipo_beneficiario" value={formData.tipo_beneficiario} onChange={handleChange} required style={inputStyle}>
                <option value="Titular">Titular</option>
                <option value="Dependente">Dependente</option>
              </select>
            </div>

            {formData.tipo_beneficiario === 'Dependente' && (
              <>
                <div>
                  <label style={labelStyle}>ID do Titular (FK)</label>
                  <input
                    type="number"
                    name="id_titular"
                    value={formData.id_titular}
                    onChange={handleChange}
                    placeholder="ID do titular"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Grau de Parentesco</label>
                  <input
                    type="text"
                    name="grau_parentesco"
                    value={formData.grau_parentesco}
                    onChange={handleChange}
                    placeholder="Ex: Cônjuge, Filho"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Número do Contrato *</label>
              <input
                type="text"
                name="numero_contrato"
                value={formData.numero_contrato}
                onChange={handleChange}
                required
                placeholder="Ex: CTR-2024-9981"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Tipo de Contrato (ANS) *</label>
              <select name="tipo_contrato" value={formData.tipo_contrato} onChange={handleChange} required style={inputStyle}>
                <option value="Coletivo Empresarial">Coletivo Empresarial</option>
                <option value="Coletivo por Adesão">Coletivo por Adesão</option>
                <option value="Individual / Familiar">Individual / Familiar</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Nome Comercial do Plano *</label>
              <input
                type="text"
                name="nome_comercial_plano"
                value={formData.nome_comercial_plano}
                onChange={handleChange}
                required
                placeholder="Ex: Pleno Prata Gold"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Registro do Plano na ANS *</label>
              <input
                type="text"
                name="registro_ans_plano"
                value={formData.registro_ans_plano}
                onChange={handleChange}
                required
                placeholder="Ex: 487.210/20-4"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Segmentação Assistencial *</label>
              <select name="segmentacao_assistencial" value={formData.segmentacao_assistencial} onChange={handleChange} required style={inputStyle}>
                <option value="Ambulatorial + Hospitalar com Obstetrícia">Ambulatorial + Hospitalar com Obstetrícia</option>
                <option value="Ambulatorial + Hospitalar sem Obstetrícia">Ambulatorial + Hospitalar sem Obstetrícia</option>
                <option value="Ambulatorial">Ambulatorial</option>
                <option value="Odontológico">Odontológico</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tipo de Cobertura *</label>
              <select name="tipo_cobertura" value={formData.tipo_cobertura} onChange={handleChange} required style={inputStyle}>
                <option value="Nacional">Nacional</option>
                <option value="Estadual">Estadual</option>
                <option value="Grupo de Municípios">Grupo de Municípios</option>
                <option value="Regional">Regional</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tipo de Acomodação *</label>
              <select name="tipo_acomodacao" value={formData.tipo_acomodacao} onChange={handleChange} required style={inputStyle}>
                <option value="Apartamento">Apartamento</option>
                <option value="Enfermaria">Enfermaria</option>
                <option value="Não se aplica">Não se aplica</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fator de Coparticipação *</label>
              <select
                name="coparticipacao_indicador"
                value={formData.coparticipacao_indicador ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, coparticipacao_indicador: e.target.value === 'true' }))}
                required
                style={inputStyle}
              >
                <option value="true">Sim (Com Coparticipação)</option>
                <option value="false">Não (Sem Coparticipação)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Valor da Mensalidade (R$) *</label>
              <input
                type="number"
                name="valor_mensalidade"
                value={formData.valor_mensalidade}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Situação Financeira do Contrato *</label>
              <select name="situacao_financeira_contrato" value={formData.situacao_financeira_contrato} onChange={handleChange} required style={inputStyle}>
                <option value="Adimplente">Adimplente</option>
                <option value="Inadimplente">Inadimplente</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Nome da Empresa Estipulante</label>
              <input
                type="text"
                name="estipulante_nome"
                value={formData.estipulante_nome}
                onChange={handleChange}
                placeholder="Ex: Tecnologia Avançada Ltda"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CNPJ da Empresa Estipulante</label>
              <input
                type="text"
                name="estipulante_cnpj"
                value={formData.estipulante_cnpj}
                onChange={handleChange}
                placeholder="Ex: 12.345.678/0001-90"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>ID do Plano (FK) *</label>
              <input
                type="number"
                name="id_plano"
                value={formData.id_plano}
                onChange={handleChange}
                required
                placeholder="101"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Situação Cadastral *</label>
              <select name="situacao_cadastral" value={formData.situacao_cadastral} onChange={handleChange} required style={inputStyle}>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Data de Adesão *</label>
              <input
                type="date"
                name="data_adesao"
                value={formData.data_adesao}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Data de Cancelamento</label>
              <input
                type="date"
                name="data_cancelamento"
                value={formData.data_cancelamento}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Motivo do Cancelamento</label>
              <input
                type="text"
                name="motivo_cancelamento"
                value={formData.motivo_cancelamento}
                onChange={handleChange}
                placeholder="Motivo do desligamento"
                style={inputStyle}
              />
            </div>
          </div>
        </Card>

        {/* Seção 3: Regulação ANS & Carências */}
        <Card title="Regulação ANS & Carências">
          {/* Cabeçalho das Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
            marginBottom: '1.25rem',
            gap: '1.5rem',
            userSelect: 'none'
          }}>
            <button
              type="button"
              onClick={() => setActiveFormTabSection('carencias')}
              style={{
                padding: '0.75rem 0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: activeFormTabSection === 'carencias' ? (currentTheme?.colors?.primary || '#2563eb') : (currentTheme?.colors?.textSecondary || '#64748b'),
                borderBottom: activeFormTabSection === 'carencias' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              Carências Contratuais
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTabSection('cpt')}
              style={{
                padding: '0.75rem 0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: activeFormTabSection === 'cpt' ? (currentTheme?.colors?.primary || '#2563eb') : (currentTheme?.colors?.textSecondary || '#64748b'),
                borderBottom: activeFormTabSection === 'cpt' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              Doenças Preexistentes (CPT)
            </button>
          </div>

          {activeFormTabSection === 'carencias' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <input
                  type="checkbox"
                  id="cpt_indicador"
                  name="cpt_indicador"
                  checked={formData.cpt_indicador}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                />
                <div>
                  <label htmlFor="cpt_indicador" style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme?.colors?.textPrimary || '#0f172a', cursor: 'pointer' }}>
                    CPT / Indicador de Lesão ou Doença Preexistente (DLP)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', display: 'block' }}>
                    Marque caso haja Cobertura Parcial Temporária aplicável pela ANS.
                  </span>
                </div>
              </div>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Início Carência Contratual</label>
                  <input
                    type="date"
                    name="inicio_carencia_contratual"
                    value={formData.inicio_carencia_contratual}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Término Carência Contratual</label>
                  <input
                    type="date"
                    name="fim_carencia_contratual"
                    value={formData.fim_carencia_contratual}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Término Carência Consultas</label>
                  <input
                    type="date"
                    name="fim_carencia_consultas"
                    value={formData.fim_carencia_consultas}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Término Carência Exames</label>
                  <input
                    type="date"
                    name="fim_carencia_exames"
                    value={formData.fim_carencia_exames}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Término Carência Internação</label>
                  <input
                    type="date"
                    name="fim_carencia_internacao"
                    value={formData.fim_carencia_internacao}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Término Carência Parto</label>
                  <input
                    type="date"
                    name="fim_carencia_parto"
                    value={formData.fim_carencia_parto}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Box Adição de CPT via busca no acervo */}
              <div style={{
                padding: '1.25rem',
                border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                borderRadius: '0.375rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
                  Vincular Doença Preexistente (CPT) Cadastrada no Sistema
                </div>
                <div style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', marginBottom: '0.75rem' }}>
                  Digite o nome da patologia ou doença para buscar no acervo geral de CPTs e vincular automaticamente ao contrato deste beneficiário.
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: currentTheme?.colors?.textSecondary || '#64748b',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 2
                  }}>
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={cptSearchQuery}
                    onChange={(e) => {
                      setCptSearchQuery(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Buscar patologia por nome... (Ex: Diabetes, Hipertensão, Catarata, Hérnia...)"
                    style={{
                      ...inputStyle,
                      paddingLeft: '2.25rem'
                    }}
                  />

                  {isDropdownOpen && (
                    <>
                      {/* Overlay invisível para fechar o dropdown ao clicar fora */}
                      <div
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          right: 0,
                          zIndex: 999
                        }}
                      />

                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '0.25rem',
                        backgroundColor: currentTheme?.colors?.card || '#ffffff',
                        border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                        borderRadius: '0.375rem',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        padding: '0.25rem 0'
                      }} className="system-scrollbar">
                        {(() => {
                          const query = cptSearchQuery.toLowerCase().trim()
                          const filtered = availableCPTs.filter(
                            (cpt) =>
                              cpt.patologia.toLowerCase().includes(query) ||
                              cpt.recurso.toLowerCase().includes(query)
                          )

                          if (filtered.length === 0) {
                            return (
                              <div style={{
                                padding: '1rem',
                                fontSize: '0.8125rem',
                                color: currentTheme?.colors?.textSecondary || '#64748b',
                                textAlign: 'center'
                              }}>
                                Nenhuma patologia pré-cadastrada encontrada para &quot;{cptSearchQuery}&quot;.
                              </div>
                            )
                          }

                          return filtered.map((cpt) => {
                            const isAlreadyAdded = (formData.cpts || []).some(
                              (item) => item.patologia.toLowerCase() === cpt.patologia.toLowerCase()
                            )

                            return (
                              <div
                                key={cpt.id}
                                onClick={() => {
                                  if (!isAlreadyAdded) {
                                    handleAddPredefinedCpt(cpt)
                                  }
                                }}
                                style={{
                                  padding: '0.75rem 1rem',
                                  cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                                  borderBottom: `1px solid ${currentTheme?.colors?.border || '#f1f5f9'}`,
                                  opacity: isAlreadyAdded ? 0.4 : 1,
                                  transition: 'background-color 0.1s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isAlreadyAdded) {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
                                    {cpt.patologia}
                                  </span>
                                  {isAlreadyAdded && (
                                    <span style={{
                                      fontSize: '0.75rem',
                                      color: '#10b981',
                                      fontWeight: '600',
                                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                      padding: '0.125rem 0.375rem',
                                      borderRadius: '0.25rem'
                                    }}>
                                      Já Vinculado
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', marginTop: '0.125rem' }}>
                                  <strong style={{ fontWeight: '500' }}>Recurso sob CPT:</strong> {cpt.recurso}
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tabela de CPTs Ativas */}
              {(!formData.cpts || formData.cpts.length === 0) ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: currentTheme?.colors?.textSecondary || '#64748b',
                  fontSize: '0.875rem',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff',
                  border: `1px dashed ${currentTheme?.colors?.border || '#e2e8f0'}`,
                  borderRadius: '0.375rem'
                }}>
                  Nenhuma restrição de CPT adicionada. Use o campo acima para incluir.
                </div>
              ) : (
                <div className="system-scrollbar" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: currentTheme?.colors?.textSecondary || '#64748b',
                          fontWeight: '600',
                          borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`
                        }}>
                          Patologia / Doença Preexistente
                        </th>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: currentTheme?.colors?.textSecondary || '#64748b',
                          fontWeight: '600',
                          borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`
                        }}>
                          Recurso Limitado (CPT)
                        </th>
                        <th style={{
                          textAlign: 'center',
                          padding: '0.75rem 1rem',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: currentTheme?.colors?.textSecondary || '#64748b',
                          fontWeight: '600',
                          width: '100px',
                          borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`
                        }}>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.cpts.map((cpt, index) => (
                        <tr key={cpt.id || index}>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                            color: currentTheme?.colors?.textPrimary || '#0f172a',
                            fontWeight: '500'
                          }}>
                            {cpt.patologia}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                            color: currentTheme?.colors?.textSecondary || '#64748b'
                          }}>
                            {cpt.recurso}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                            textAlign: 'center'
                          }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveCpt(cpt.id, cpt.patologia)}
                              style={{
                                padding: '0.375rem 0.625rem',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'color 0.15s ease',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Seção 4: Contato e Endereço */}
        <Card title="Contato e Endereço">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>E-mail de Contato *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="exemplo@email.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Telefone Celular *</label>
              <input
                type="text"
                name="telefone_celular"
                value={formData.telefone_celular}
                onChange={handleChange}
                required
                placeholder="11987654321"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CEP (apenas números) *</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                required
                maxLength={8}
                placeholder="01310100"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Logradouro *</label>
              <input
                type="text"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                required
                placeholder="Rua / Avenida"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Número *</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                placeholder="100"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Complemento</label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Bairro *</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                required
                placeholder="Nome do bairro"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Cidade *</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                required
                placeholder="Município"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>UF *</label>
              <select name="uf" value={formData.uf} onChange={handleChange} required style={inputStyle}>
                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Seção 5: Acesso ao Portal / Sistema */}
        <Card title="Acesso ao Portal / App">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Hash de Senha *</label>
              <input
                type="text"
                name="hash_senha"
                value={formData.hash_senha}
                onChange={handleChange}
                required
                placeholder="Hash criptografado"
                style={inputStyle}
              />
              <span style={helpTextStyle}>Criptografia padrão BCrypt do backend.</span>
            </div>

            <div style={{
              padding: '1rem 1.25rem',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <input
                type="checkbox"
                id="primeiro_acesso"
                name="primeiro_acesso"
                checked={formData.primeiro_acesso}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
              />
              <div>
                <label htmlFor="primeiro_acesso" style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme?.colors?.textPrimary || '#0f172a', cursor: 'pointer' }}>
                  Primeiro Acesso Pendente
                </label>
                <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', display: 'block' }}>
                  Exige troca de senha no primeiro login do usuário.
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Botões de Ação Padronizados */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${currentTheme?.colors?.border || 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <Button variant="secondary" onClick={() => navigate('/usuario')} style={{ padding: '0.375rem 1.5rem', fontSize: '0.8125rem' }}>
            Cancelar
          </Button>
          <Button type="submit" style={{ padding: '0.375rem 1.5rem', fontSize: '0.8125rem' }}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Beneficiário'}
          </Button>
        </div>

      </form>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
        variant={confirmModalConfig.variant}
      />
    </div>
  </div>
  )
}
