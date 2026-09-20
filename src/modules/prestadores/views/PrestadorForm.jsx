// Arquivo: src/modules/prestadores/views/PrestadorForm.jsx
// Descrição: Formulário de cadastro e edição de Prestadores e Pessoas (M04_PRESTADORES / M01_PESSOAS).
// Alinhado com as exigências regulatórias da ANS, TISS e SIB, com suporte a UUIDv7 e sincronização.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { fetchPrestadoresFromSheets, savePrestadorToSheets } from '../services/sheetsService'
import { generateUUIDv7 } from '@shared/utils/uuidv7'
import { ArrowLeft, Save, Building2, User, Stethoscope, MapPin, ShieldCheck, RefreshCw } from 'lucide-react'

export default function PrestadorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  // Estado unificado dos campos do formulário
  const [formData, setFormData] = useState(() => ({
    id: id || generateUUIDv7(),
    id_pessoa: generateUUIDv7(),
    tipo_pessoa: 'JURÍDICA',
    nome_razao_social: '',
    nome_fantasia: '',
    cpf_cnpj: '',
    data_nascimento_fundacao: '',
    sexo: '',
    nome_mae: '',
    email_principal: '',
    telefone_principal: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    tipo_prestador: 'CLÍNICA',
    conselho_profissional: 'CRM',
    numero_conselho: '',
    uf_conselho: 'SP',
    cbos: '225125 - CLÍNICA MÉDICA',
    codigo_operadora_prestador: id ? '' : `RDA-${Math.floor(1000 + Math.random() * 9000)}`,
    cnes_principal: '',
    regime_tributario: 'SIMPLES NACIONAL',
    status_credenciamento: 'ATIVO',
    data_credenciamento: new Date().toISOString().slice(0, 10),
    data_descredenciamento: '',
    especialidade: 'CLÍNICA GERAL',
    rqe: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: 'SÃO PAULO',
    cidade: 'SÃO PAULO',
    uf: 'SP',
    cep: ''
  }))

  // Carrega dados se for modo de edição
  useEffect(() => {
    if (!isEdit) return

    let isMounted = true
    const loadPrestador = async () => {
      setLoading(true)
      try {
        const result = await fetchPrestadoresFromSheets()
        if (!isMounted) return

        const found = (result.data || []).find(p =>
          String(p.id).toLowerCase() === String(id).toLowerCase() ||
          String(p.codigo_operadora_prestador || '').toLowerCase() === String(id).toLowerCase()
        )

        if (found) {
          setFormData({
            id: found.id,
            id_pessoa: found.id_pessoa || generateUUIDv7(),
            tipo_pessoa: found.tipo_pessoa || (found.tipo_prestador === 'MÉDICO' ? 'FÍSICA' : 'JURÍDICA'),
            nome_razao_social: found.nome_razao_social || found.nome || '',
            nome_fantasia: found.nome_fantasia || '',
            cpf_cnpj: found.cpf_cnpj || '',
            data_nascimento_fundacao: found.data_nascimento_fundacao || '',
            sexo: found.sexo || '',
            nome_mae: found.nome_mae || '',
            email_principal: found.email_principal || '',
            telefone_principal: found.telefone_principal || '',
            inscricao_estadual: found.inscricao_estadual || '',
            inscricao_municipal: found.inscricao_municipal || '',
            tipo_prestador: found.tipo_prestador || 'CLÍNICA',
            conselho_profissional: found.conselho_profissional || 'CRM',
            numero_conselho: found.numero_conselho || '',
            uf_conselho: found.uf_conselho || found.uf || 'SP',
            cbos: found.cbos || '',
            codigo_operadora_prestador: found.codigo_operadora_prestador || '',
            cnes_principal: found.cnes_principal || '',
            regime_tributario: found.regime_tributario || 'SIMPLES NACIONAL',
            status_credenciamento: found.status_credenciamento || 'ATIVO',
            data_credenciamento: found.data_credenciamento || '',
            data_descredenciamento: found.data_descredenciamento || '',
            especialidade: found.especialidade || '',
            rqe: found.rqe || '',
            logradouro: found.logradouro || '',
            numero: found.numero || '',
            complemento: found.complemento || '',
            bairro: found.bairro || '',
            municipio: found.municipio || found.cidade || '',
            cidade: found.cidade || found.municipio || '',
            uf: found.uf || 'SP',
            cep: found.cep || ''
          })
        } else {
          notify.error('Prestador Não Encontrado', 'Não foi possível carregar os dados para edição.')
          navigate('/prestadores')
        }
      } catch (err) {
        console.error('Erro ao carregar dados do prestador:', err)
        notify.error('Erro de Carregamento', 'Falha ao buscar dados do prestador.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPrestador()
    return () => { isMounted = false }
  }, [id, isEdit, navigate, notify])

  // Manipulador de alterações genérico
  const handleChange = (e) => {
    const { name, value } = e.target

    // Ao alterar tipo de pessoa, ajusta valores e regras
    if (name === 'tipo_pessoa') {
      setFormData(prev => ({
        ...prev,
        tipo_pessoa: value,
        tipo_prestador: value === 'FÍSICA' ? 'MÉDICO' : (prev.tipo_prestador === 'MÉDICO' ? 'CLÍNICA' : prev.tipo_prestador),
        regime_tributario: value === 'FÍSICA' ? 'PESSOA FÍSICA' : 'SIMPLES NACIONAL'
      }))
      return
    }

    // Se o tipo de prestador for alterado para MÉDICO, ajusta tipo de pessoa
    if (name === 'tipo_prestador' && value === 'MÉDICO') {
      setFormData(prev => ({ ...prev, [name]: value, tipo_pessoa: 'FÍSICA', regime_tributario: 'PESSOA FÍSICA' }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Formatação simples de CPF / CNPJ
  const handleDocChange = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (formData.tipo_pessoa === 'FÍSICA') {
      if (val.length > 11) val = val.slice(0, 11)
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      if (val.length > 14) val = val.slice(0, 14)
      val = val.replace(/^(\d{2})(\d)/, '$1.$2')
               .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
               .replace(/\.(\d{3})(\d)/, '.$1/$2')
               .replace(/(\d{4})(\d)/, '$1-$2')
    }
    setFormData(prev => ({ ...prev, cpf_cnpj: val }))
  }

  // Salvar formulário
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome_razao_social.trim()) {
      notify.error('Campo Obrigatório', 'Por favor, informe a Razão Social ou Nome Completo do prestador.')
      return
    }

    if (!formData.codigo_operadora_prestador.trim()) {
      notify.error('Campo Obrigatório', 'O Código Operadora / RDA é obrigatório para o cadastro regulatório.')
      return
    }

    setSaving(true)
    try {
      const result = await savePrestadorToSheets(formData)

      if (result.success) {
        notify.success(
          isEdit ? 'Prestador Atualizado!' : 'Prestador Cadastrado!',
          result.message
        )
        navigate('/prestadores')
      } else {
        notify.error('Erro ao Salvar', result.syncError || 'Não foi possível salvar o prestador.')
      }
    } catch (err) {
      console.error('Erro ao salvar prestador:', err)
      notify.error('Erro no Cadastro', err.message || 'Falha ao salvar dados do prestador.')
    } finally {
      setSaving(false)
    }
  }

  // Estilos de formulário
  const labelStyle = {
    display: 'block',
    marginBottom: '0.375rem',
    fontWeight: '700',
    fontSize: '0.75rem',
    color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#4b5563'),
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: '0.375rem',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '700',
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e5e7eb')}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={28} className="animate-spin" color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: currentTheme?.colors?.textSecondary }}>
          Carregando dados do prestador...
        </span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto', backgroundColor: currentTheme?.colors?.background }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => navigate('/prestadores')}
              style={{ padding: '0.5rem', height: '38px', width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Voltar para a Lista"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: currentTheme?.colors?.textPrimary || '#111827', margin: 0 }}>
                {isEdit ? `Editar Prestador: ${formData.nome_razao_social}` : 'Novo Prestador da Operadora'}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280', margin: '0.2rem 0 0' }}>
                Módulos M04_PRESTADORES e M01_PESSOAS — Padrão ANS / TISS
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => navigate('/prestadores')} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <Save size={16} />
              {saving ? 'Gravando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Prestador'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Seção 1: Identificação da Pessoa / Entidade (M01_PESSOAS) */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              {formData.tipo_pessoa === 'FÍSICA' ? (
                <User size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              ) : (
                <Building2 size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              )}
              <span>1. Identificação da Pessoa / Entidade (M01_PESSOAS)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Tipo de Pessoa</label>
                <div style={{ display: 'flex', gap: '0.5rem', height: '40px' }}>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'tipo_pessoa', value: 'JURÍDICA' } })}
                    style={{
                      flex: 1,
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      border: formData.tipo_pessoa === 'JURÍDICA' 
                        ? `1px solid ${currentTheme?.colors?.border || (isDark ? '#52525b' : '#9ca3af')}` 
                        : `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
                      backgroundColor: formData.tipo_pessoa === 'JURÍDICA' 
                        ? (isDark ? '#3f3f46' : '#e5e7eb') 
                        : 'transparent',
                      color: formData.tipo_pessoa === 'JURÍDICA' 
                        ? (currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827')) 
                        : (currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')),
                      cursor: 'pointer'
                    }}
                  >
                    Pessoa Jurídica (PJ)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'tipo_pessoa', value: 'FÍSICA' } })}
                    style={{
                      flex: 1,
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      border: formData.tipo_pessoa === 'FÍSICA' 
                        ? `1px solid ${currentTheme?.colors?.border || (isDark ? '#52525b' : '#9ca3af')}` 
                        : `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
                      backgroundColor: formData.tipo_pessoa === 'FÍSICA' 
                        ? (isDark ? '#3f3f46' : '#e5e7eb') 
                        : 'transparent',
                      color: formData.tipo_pessoa === 'FÍSICA' 
                        ? (currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827')) 
                        : (currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')),
                      cursor: 'pointer'
                    }}
                  >
                    Pessoa Física (PF)
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  {formData.tipo_pessoa === 'FÍSICA' ? 'CPF *' : 'CNPJ *'}
                </label>
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={handleDocChange}
                  placeholder={formData.tipo_pessoa === 'FÍSICA' ? '000.000.000-00' : '00.000.000/0000-00'}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  {formData.tipo_pessoa === 'FÍSICA' ? 'Data de Nascimento' : 'Data de Fundação'}
                </label>
                <input
                  type="date"
                  name="data_nascimento_fundacao"
                  value={formData.data_nascimento_fundacao}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  {formData.tipo_pessoa === 'FÍSICA' ? 'Nome Completo do Prestador *' : 'Razão Social da Entidade *'}
                </label>
                <input
                  type="text"
                  name="nome_razao_social"
                  value={formData.nome_razao_social}
                  onChange={handleChange}
                  placeholder="EX: HOSPITAL GERAL SANTA HELENA LTDA"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Nome Fantasia / Nome Comercial</label>
                <input
                  type="text"
                  name="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={handleChange}
                  placeholder="EX: HOSPITAL SANTA HELENA"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Campos Específicos para Pessoa Física (Exigência ANS SIB) */}
            {formData.tipo_pessoa === 'FÍSICA' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: currentTheme?.colors?.surfaceMuted || (isDark ? '#18181b' : '#fafafa'),
                  border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#e5e7eb')}`
                }}
              >
                <div>
                  <label style={labelStyle}>Sexo (Exigência ANS / TISS)</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange} style={inputStyle}>
                    <option value="">SELECIONE...</option>
                    <option value="M">MASCULINO (M)</option>
                    <option value="F">FEMININO (F)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nome da Mãe (Exigência SIB / CNS)</label>
                  <input
                    type="text"
                    name="nome_mae"
                    value={formData.nome_mae}
                    onChange={handleChange}
                    placeholder="NOME COMPLETO DA MÃE"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Contato & Fiscal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>E-mail Principal</label>
                <input
                  type="email"
                  name="email_principal"
                  value={formData.email_principal}
                  onChange={handleChange}
                  placeholder="faturamento@prestador.med.br"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Telefone Principal</label>
                <input
                  type="text"
                  name="telefone_principal"
                  value={formData.telefone_principal}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  style={inputStyle}
                />
              </div>
              {formData.tipo_pessoa === 'JURÍDICA' && (
                <>
                  <div>
                    <label style={labelStyle}>Inscrição Estadual</label>
                    <input
                      type="text"
                      name="inscricao_estadual"
                      value={formData.inscricao_estadual}
                      onChange={handleChange}
                      placeholder="000.000.000.000"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Inscrição Municipal</label>
                    <input
                      type="text"
                      name="inscricao_municipal"
                      value={formData.inscricao_municipal}
                      onChange={handleChange}
                      placeholder="0.000.000"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Seção 2: Credenciamento e Dados Regulatórios (M04_PRESTADORES) */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <ShieldCheck size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>2. Credenciamento e Regulação ANS (M04_PRESTADORES)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Tipo de Prestador *</label>
                <select name="tipo_prestador" value={formData.tipo_prestador} onChange={handleChange} style={inputStyle} required>
                  <option value="MÉDICO">MÉDICO (PESSOA FÍSICA)</option>
                  <option value="CLÍNICA">CLÍNICA MÉDICA</option>
                  <option value="HOSPITAL">HOSPITAL GERAL</option>
                  <option value="HOSPITAL DIA">HOSPITAL DIA</option>
                  <option value="PRONTO ATENDIMENTO">PRONTO ATENDIMENTO</option>
                  <option value="LABORATÓRIO">LABORATÓRIO DE ANÁLISES</option>
                  <option value="CENTRO DIAGNÓSTICO">CENTRO DIAGNÓSTICO POR IMAGEM</option>
                  <option value="FISIOTERAPIA">FISIOTERAPIA E REABILITAÇÃO</option>
                  <option value="ODONTOLOGIA">ODONTOLOGIA</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Código Operadora (RDA) *</label>
                <input
                  type="text"
                  name="codigo_operadora_prestador"
                  value={formData.codigo_operadora_prestador}
                  onChange={handleChange}
                  placeholder="EX: RDA-1049"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Status de Credenciamento</label>
                <select name="status_credenciamento" value={formData.status_credenciamento} onChange={handleChange} style={inputStyle}>
                  <option value="ATIVO">ATIVO</option>
                  <option value="EM CREDENCIAMENTO">EM CREDENCIAMENTO</option>
                  <option value="SUSPENSO">SUSPENSO</option>
                  <option value="DESCREDENCIADO">DESCREDENCIADO</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Data de Credenciamento</label>
                <input
                  type="date"
                  name="data_credenciamento"
                  value={formData.data_credenciamento}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Conselho Profissional</label>
                <select name="conselho_profissional" value={formData.conselho_profissional} onChange={handleChange} style={inputStyle}>
                  <option value="CRM">CRM (CONSELHO REGIONAL DE MEDICINA)</option>
                  <option value="CRO">CRO (ODONTOLOGIA)</option>
                  <option value="CREFITO">CREFITO (FISIOTERAPIA/TO)</option>
                  <option value="CRF">CRF (FARMÁCIA/ANÁLISES)</option>
                  <option value="CRP">CRP (PSICOLOGIA)</option>
                  <option value="CRN">CRN (NUTRIÇÃO)</option>
                  <option value="COREN">COREN (ENFERMAGEM)</option>
                  <option value="OUTRO">OUTRO CONSELHO</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Número do Conselho</label>
                <input
                  type="text"
                  name="numero_conselho"
                  value={formData.numero_conselho}
                  onChange={handleChange}
                  placeholder="EX: 148291"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>UF do Conselho</label>
                <select name="uf_conselho" value={formData.uf_conselho} onChange={handleChange} style={inputStyle}>
                  {['SP', 'RJ', 'MG', 'PR', 'RS', 'MT', 'MS', 'GO', 'DF', 'BA', 'SC', 'PE', 'CE', 'ES'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>CNES Principal (7 Dígitos)</label>
                <input
                  type="text"
                  name="cnes_principal"
                  value={formData.cnes_principal}
                  onChange={handleChange}
                  placeholder="EX: 2078192"
                  maxLength={7}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>CBOS (Ocupação Padrão TISS)</label>
                <input
                  type="text"
                  name="cbos"
                  value={formData.cbos}
                  onChange={handleChange}
                  placeholder="EX: 225120 - CARDIOLOGIA"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Regime Tributário</label>
                <select name="regime_tributario" value={formData.regime_tributario} onChange={handleChange} style={inputStyle}>
                  <option value="SIMPLES NACIONAL">SIMPLES NACIONAL</option>
                  <option value="LUCRO PRESUMIDO">LUCRO PRESUMIDO</option>
                  <option value="LUCRO REAL">LUCRO REAL</option>
                  <option value="PESSOA FÍSICA">PESSOA FÍSICA / AUTÔNOMO</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Seção 3: Especialidades Médicas (M04_PRESTADORES_ESPECIALIDADES) */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <Stethoscope size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>3. Especialidade e Qualificação (M04_PRESTADORES_ESPECIALIDADES)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Especialidade Principal</label>
                <input
                  type="text"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleChange}
                  placeholder="EX: CARDIOLOGIA, CLÍNICA MÉDICA, PEDIATRIA"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>RQE (Registro de Especialista)</label>
                <input
                  type="text"
                  name="rqe"
                  value={formData.rqe}
                  onChange={handleChange}
                  placeholder="EX: 58491"
                  style={inputStyle}
                />
              </div>
            </div>
          </Card>

          {/* Seção 4: Localização e Endereço do Estabelecimento (M01_PESSOAS_ENDERECOS) */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <MapPin size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>4. Endereço do Estabelecimento (M01_PESSOAS_ENDERECOS)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Logradouro</label>
                <input
                  type="text"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                  placeholder="AVENIDA / RUA"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="123"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="SALA 804 / BLOCO A"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="BAIRRO"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Município / Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="SÃO PAULO"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>UF</label>
                <select name="uf" value={formData.uf} onChange={handleChange} style={inputStyle}>
                  {['SP', 'RJ', 'MG', 'PR', 'RS', 'MT', 'MS', 'GO', 'DF', 'BA', 'SC', 'PE', 'CE', 'ES'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Botões de Ação Inferiores */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => navigate('/prestadores')} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', padding: '0.625rem 1.5rem' }}>
              <Save size={16} />
              {saving ? 'Gravando dados...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Prestador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
