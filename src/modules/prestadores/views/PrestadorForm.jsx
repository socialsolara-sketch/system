// Arquivo: src/modules/prestadores/views/PrestadorForm.jsx
// Descrição: Formulário de cadastro e edição de Prestadores.
// Baseado na estrutura real do banco de dados SQLite.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { generateUUIDv7 } from '@shared/utils/uuidv7'
import { getPrestadorById, savePrestador, fetchEspecialidades } from '../services'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'

export default function PrestadorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [especialidadesList, setEspecialidadesList] = useState([])

  // Estado unificado dos campos do formulário (baseado na estrutura real do banco)
  const [formData, setFormData] = useState(() => ({
    id: id || generateUUIDv7(),
    crm: '',
    nome: '',
    especialidade_id: '',
    estrutura: 'CONSULTÓRIO',
    unidade: 'UNIDADE PRINCIPAL',
    estado: 'SP',
    municipio: 'SÃO PAULO',
    bairro: '',
    endereco: '',
    endereco_numero: '',
    contrato_ativo_em: new Date().toISOString().slice(0, 10),
    contrato_encerrado_em: '',
    telefone: '',
    whatsapp: '',
    idade: ''
  }))

  // Carrega dados se for modo de edição e especialidades
  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Carregar especialidades
        const espRes = await fetchEspecialidades()
        if (isMounted && espRes.success) {
          setEspecialidadesList(espRes.data)
        }

        // Carregar prestador se for edição
        if (isEdit) {
          const found = await getPrestadorById(id)
          if (isMounted && found) {
            setFormData({
              id: found.id,
              crm: found.crm || '',
              nome: found.nome || '',
              especialidade_id: found.especialidade_id || '',
              estrutura: found.estrutura || 'CONSULTÓRIO',
              unidade: found.unidade || 'UNIDADE PRINCIPAL',
              estado: found.estado || 'SP',
              municipio: found.municipio || 'SÃO PAULO',
              bairro: found.bairro || '',
              endereco: found.endereco || '',
              endereco_numero: found.endereco_numero || '',
              contrato_ativo_em: found.contrato_ativo_em || new Date().toISOString().slice(0, 10),
              contrato_encerrado_em: found.contrato_encerrado_em || '',
              telefone: found.telefone || '',
              whatsapp: found.whatsapp || '',
              idade: found.idade || ''
            })
          } else if (isMounted) {
            notify.error('Prestador Não Encontrado', 'Não foi possível carregar os dados para edição.')
            navigate('/prestadores')
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao carregar dados:', err)
          notify.error('Erro de Carregamento', 'Falha ao buscar dados.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [id, isEdit, navigate, notify])

  // Manipulador de alterações genérico
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Salvar formulário
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      notify.error('Campo Obrigatório', 'Por favor, informe o Nome do prestador.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        id: formData.id,
        crm: formData.crm,
        nome: formData.nome,
        especialidade_id: formData.especialidade_id,
        estrutura: formData.estrutura,
        unidade: formData.unidade,
        estado: formData.estado,
        municipio: formData.municipio,
        bairro: formData.bairro,
        endereco: formData.endereco,
        endereco_numero: formData.endereco_numero,
        contrato_ativo_em: formData.contrato_ativo_em,
        contrato_encerrado_em: formData.contrato_encerrado_em,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        idade: formData.idade
      }

      const res = await savePrestador(payload)
      if (res.success) {
        notify.success(
          isEdit ? 'Prestador Atualizado!' : 'Prestador Cadastrado!',
          `Prestador ${formData.nome} salvo com sucesso no banco de dados SQLite.`
        )
        
        // Resetar campos após salvar (não navega)
        setFormData({
          id: generateUUIDv7(),
          crm: '',
          nome: '',
          especialidade_id: '',
          estrutura: 'CONSULTÓRIO',
          unidade: 'UNIDADE PRINCIPAL',
          estado: 'SP',
          municipio: 'SÃO PAULO',
          bairro: '',
          endereco: '',
          endereco_numero: '',
          contrato_ativo_em: new Date().toISOString().slice(0, 10),
          contrato_encerrado_em: '',
          telefone: '',
          whatsapp: '',
          idade: ''
        })
      } else {
        notify.error('Erro no Cadastro', res.error || 'Falha ao salvar dados do prestador.')
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
                {isEdit ? `Editar Prestador: ${formData.nome}` : 'Novo Prestador'}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280', margin: '0.2rem 0 0' }}>
                Cadastro de Prestador — Base de dados SQLite
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
          {/* Seção 1: Dados do Prestador */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>1. Dados do Prestador</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Nome do prestador"
                />
              </div>

              <div>
                <label style={labelStyle}>CRM</label>
                <input
                  type="text"
                  name="crm"
                  value={formData.crm}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Número do CRM"
                />
              </div>

              <div>
                <label style={labelStyle}>Especialidade</label>
                <select
                  name="especialidade_id"
                  value={formData.especialidade_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Selecione uma especialidade</option>
                  {especialidadesList.map(esp => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Estrutura</label>
                <select
                  name="estrutura"
                  value={formData.estrutura}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="CONSULTÓRIO">CONSULTÓRIO</option>
                  <option value="CLÍNICA">CLÍNICA</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                  <option value="LABORATÓRIO">LABORATÓRIO</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Unidade</label>
                <input
                  type="text"
                  name="unidade"
                  value={formData.unidade}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Nome da unidade"
                />
              </div>

              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label style={labelStyle}>Idade</label>
                <input
                  type="text"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Ex: 45"
                />
              </div>
            </div>
          </Card>

          {/* Seção 2: Endereço e Localização */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>2. Endereço e Localização</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="RS">RS</option>
                  <option value="PR">PR</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Município</label>
                <input
                  type="text"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Nome do município"
                />
              </div>

              <div>
                <label style={labelStyle}>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Bairro"
                />
              </div>

              <div>
                <label style={labelStyle}>Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div>
                <label style={labelStyle}>Número</label>
                <input
                  type="text"
                  name="endereco_numero"
                  value={formData.endereco_numero}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Número"
                />
              </div>
            </div>
          </Card>

          {/* Seção 3: Contrato */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>3. Contrato</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Contrato Ativo Em</label>
                <input
                  type="date"
                  name="contrato_ativo_em"
                  value={formData.contrato_ativo_em}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Contrato Encerrado Em</label>
                <input
                  type="date"
                  name="contrato_encerrado_em"
                  value={formData.contrato_encerrado_em}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}