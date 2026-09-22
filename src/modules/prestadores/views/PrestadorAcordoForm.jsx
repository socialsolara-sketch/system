// Arquivo: src/modules/prestadores/views/PrestadorAcordoForm.jsx
// Descrição: Formulário de cadastro e edição de Acordos TUSS.
// Baseado na estrutura real do banco de dados SQLite.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { generateUUIDv7 } from '@shared/utils/uuidv7'
import { getPrestadorById, getAcordoById, saveAcordo } from '../services'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'

export default function PrestadorAcordoForm() {
  const { id: prestadorId, acordoId } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()
  const isEdit = Boolean(acordoId)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prestador, setPrestador] = useState(null)

  // Estado do formulário (baseado na estrutura real do banco)
  const [formData, setFormData] = useState(() => ({
    id: acordoId || generateUUIDv7(),
    codigo_tuss: '',
    nome: '',
    acordo_data_inicio: new Date().toISOString().slice(0, 10),
    acordo_data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  }))

  // Carrega dados do prestador e do acordo (se for edição)
  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Carregar prestador
        const foundPrestador = await getPrestadorById(prestadorId)
        if (isMounted && foundPrestador) {
          setPrestador(foundPrestador)
        } else if (isMounted) {
          notify.error('Prestador Não Encontrado', 'Não foi possível carregar os dados do prestador.')
          navigate('/prestadores')
          return
        }

        // Carregar acordo se for edição
        if (isEdit && acordoId) {
          const foundAcordo = await getAcordoById(acordoId)
          if (isMounted && foundAcordo) {
            setFormData({
              id: foundAcordo.id,
              codigo_tuss: foundAcordo.codigo_tuss || '',
              nome: foundAcordo.nome || '',
              acordo_data_inicio: foundAcordo.acordo_data_inicio || new Date().toISOString().slice(0, 10),
              acordo_data_fim: foundAcordo.acordo_data_fim || ''
            })
          } else if (isMounted) {
            notify.error('Acordo Não Encontrado', 'Não foi possível carregar os dados do acordo.')
            navigate(`/prestadores/${prestadorId}/acordos`)
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
  }, [prestadorId, acordoId, isEdit, navigate, notify])

  // Manipulador de alterações
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Salvar formulário
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.codigo_tuss.trim()) {
      notify.error('Campo Obrigatório', 'Por favor, informe o Código TUSS.')
      return
    }

    if (!formData.nome.trim()) {
      notify.error('Campo Obrigatório', 'Por favor, informe o Nome do procedimento.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        id: formData.id,
        codigo_tuss: formData.codigo_tuss,
        nome: formData.nome,
        acordo_data_inicio: formData.acordo_data_inicio,
        acordo_data_fim: formData.acordo_data_fim,
        prestador_id: prestadorId
      }

      const res = await saveAcordo(prestadorId, payload)
      if (res.success) {
        notify.success(
          isEdit ? 'Acordo Atualizado!' : 'Acordo Cadastrado!',
          `Código TUSS ${formData.codigo_tuss} salvo com sucesso.`
        )
        
        // Resetar campos após salvar (não navega)
        setFormData({
          id: generateUUIDv7(),
          codigo_tuss: '',
          nome: '',
          acordo_data_inicio: new Date().toISOString().slice(0, 10),
          acordo_data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        })
      } else {
        notify.error('Erro no Cadastro', res.error || 'Falha ao salvar dados do acordo.')
      }
    } catch (err) {
      console.error('Erro ao salvar acordo:', err)
      notify.error('Erro no Cadastro', err.message || 'Falha ao salvar dados do acordo.')
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
          Carregando dados...
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
              onClick={() => navigate(`/prestadores/${prestadorId}/acordos`)}
              style={{ padding: '0.5rem', height: '38px', width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Voltar para Acordos"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: currentTheme?.colors?.textPrimary || '#111827', margin: 0 }}>
                {isEdit ? 'Editar Acordo TUSS' : 'Novo Acordo TUSS'}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280', margin: '0.2rem 0 0' }}>
                Prestador: {prestador?.nome || '-'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => navigate(`/prestadores/${prestadorId}/acordos`)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <Save size={16} />
              {saving ? 'Gravando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Acordo'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Seção 1: Dados do Acordo */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>1. Dados do Acordo TUSS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Código TUSS *</label>
                <input
                  type="text"
                  name="codigo_tuss"
                  value={formData.codigo_tuss}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Ex: 10101012"
                />
              </div>

              <div>
                <label style={labelStyle}>Nome do Procedimento *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Ex: Consulta Médica em Consultório"
                />
              </div>
            </div>
          </Card>

          {/* Seção 2: Vigência do Acordo */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>2. Vigência do Acordo</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Data Início</label>
                <input
                  type="date"
                  name="acordo_data_inicio"
                  value={formData.acordo_data_inicio}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Data Fim</label>
                <input
                  type="date"
                  name="acordo_data_fim"
                  value={formData.acordo_data_fim}
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