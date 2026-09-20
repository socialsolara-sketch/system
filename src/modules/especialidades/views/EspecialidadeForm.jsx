// Arquivo: src/modules/especialidades/views/EspecialidadeForm.jsx
// Descrição: Formulário de cadastro e edição de Especialidades com integração Google Sheets.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { fetchEspecialidadesFromSheets, saveEspecialidadeToSheets } from '../services/sheetsService'
import { generateUUIDv7 } from '@shared/utils/uuidv7'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'

export default function EspecialidadeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()
  const isEdit = Boolean(id)

  const [generatedId] = useState(() => (id ? id : generateUUIDv7()))
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'ATIVO',
    conselho: ''
  })
  
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (isEdit) {
      fetchEspecialidadesFromSheets()
        .then((result) => {
          if (!isMounted) return
          const found = result.data.find(p => 
            String(p.id).toLowerCase() === String(id).toLowerCase() || 
            String(p.nome) === String(id) ||
            String(p.especialidade) === String(id)
          )
          if (found) {
            setFormData({
              nome: found.nome || found.especialidade || '',
              descricao: found.descricao || '',
              status: found.status || 'ATIVO',
              conselho: found.conselho || ''
            })
          }
        })
        .catch(err => console.error(err))
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      notify.error('Campo obrigatório', 'O nome da especialidade é obrigatório.')
      return
    }

    setSaving(true)
    try {
      await saveEspecialidadeToSheets({
        id: generatedId,
        ...formData
      })
      notify.success(
        isEdit ? 'Especialidade Atualizada!' : 'Especialidade Cadastrada!', 
        `A especialidade ${formData.nome} foi salva com sucesso.`
      )
      navigate('/especialidades')
    } catch (err) {
      console.error(err)
      notify.error('Erro ao Salvar', err.message || 'Falha ao salvar no Google Sheets.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.375rem',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5')}`,
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#2B2B2B' : '#ffffff'),
    color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717'),
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, background-color 0.15s ease'
  }

  const labelStyle = {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#262626'),
    letterSpacing: '0.01em',
    marginBottom: '0.375rem',
    display: 'block'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373'), gap: '0.75rem' }}>
      <RefreshCw size={24} className="animate-spin" />
      <span>CARREGANDO DADOS DA ESPECIALIDADE...</span>
    </div>
  )

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto', backgroundColor: currentTheme?.colors?.background || (isDark ? '#1C1C1C' : '#fbfbfb') }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : 'rgba(0, 0, 0, 0.1)')}`
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717'),
              letterSpacing: '-0.01em',
              textTransform: 'uppercase'
            }}>
              {isEdit ? 'Editar Especialidade' : 'Nova Especialidade'}
            </h1>
            <span style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373') }}>
              {isEdit ? `Editando registro UUIDv7: ${generatedId}` : 'Preencha os dados para registrar na planilha'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => navigate('/especialidades')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '36px', fontSize: '0.8125rem' }}
            >
              <ArrowLeft size={14} />
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '36px', fontSize: '0.8125rem', fontWeight: '700' }}
            >
              <Save size={14} />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <Card title="Informações da Especialidade">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nome da Especialidade *</label>
              <input 
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                onFocus={(e) => { e.currentTarget.style.borderColor = isDark ? '#6B7280' : '#9CA3AF' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5') }}
                placeholder="Ex: Cardiologia, Pediatria, Ortopedia..."
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Conselho / Órgão</label>
                <input 
                  type="text"
                  name="conselho"
                  value={formData.conselho}
                  onChange={handleChange}
                  onFocus={(e) => { e.currentTarget.style.borderColor = isDark ? '#6B7280' : '#9CA3AF' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5') }}
                  placeholder="Ex: CFM, CRM..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  onFocus={(e) => { e.currentTarget.style.borderColor = isDark ? '#6B7280' : '#9CA3AF' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5') }}
                  style={inputStyle}
                >
                  <option value="ATIVO" style={{ backgroundColor: isDark ? '#2B2B2B' : '#ffffff', color: isDark ? '#F2F2F2' : '#171717' }}>ATIVO</option>
                  <option value="INATIVO" style={{ backgroundColor: isDark ? '#2B2B2B' : '#ffffff', color: isDark ? '#F2F2F2' : '#171717' }}>INATIVO</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea 
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                onFocus={(e) => { e.currentTarget.style.borderColor = isDark ? '#6B7280' : '#9CA3AF' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5') }}
                placeholder="Descrição detalhada da especialidade médica..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
