// Arquivo: src/modules/especialidades/views/EspecialidadeDetail.jsx
// Descrição: Visão de detalhes de uma Especialidade.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { fetchEspecialidadesFromSheets, deleteEspecialidadeFromSheets } from '../services/sheetsService'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'

export default function EspecialidadeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [especialidade, setEspecialidade] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadEspecialidade = async () => {
      setLoading(true)
      try {
        const result = await fetchEspecialidadesFromSheets()
        if (!isMounted) return
        const found = result.data.find(p => 
          String(p.id).toLowerCase() === String(id).toLowerCase() || 
          String(p.nome) === String(id) ||
          String(p.especialidade) === String(id)
        )
        setEspecialidade(found)
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadEspecialidade()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir a especialidade ${especialidade?.nome}?`)) {
      if (especialidade?.id) {
        await deleteEspecialidadeFromSheets(especialidade.id)
      }
      notify.success('Especialidade Excluída!', `O registro foi removido com sucesso.`)
      navigate('/especialidades')
    }
  }

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: currentTheme?.colors?.textSecondary || '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.375rem'
  }

  const valueStyle = {
    fontSize: '0.9375rem',
    fontWeight: '500',
    color: currentTheme?.colors?.textPrimary || '#0f172a',
    wordBreak: 'break-word'
  }

  const dataBoxStyle = {
    padding: '0.75rem 1rem',
    border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
    borderRadius: '0.375rem',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
    display: 'flex',
    flexDirection: 'column'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: currentTheme?.colors?.textSecondary }}>
      CARREGANDO DETALHES...
    </div>
  )

  if (!especialidade) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
      <span style={{ color: currentTheme?.colors?.textSecondary, fontWeight: '700' }}>ESPECIALIDADE NÃO ENCONTRADA</span>
      <Button onClick={() => navigate('/especialidades')}>Voltar para Lista</Button>
    </div>
  )

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto', backgroundColor: currentTheme?.colors?.background }}>
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
              letterSpacing: '-0.01em',
              textTransform: 'uppercase'
            }}>
              {especialidade.nome || especialidade.especialidade}
            </h1>
            <span style={{
              fontSize: '0.875rem',
              color: currentTheme?.colors?.textSecondary || '#64748b'
            }}>
              CÓDIGO: {especialidade.id || 'N/A'} • STATUS: {especialidade.status || 'ATIVO'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/especialidades')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '36px', fontSize: '0.8125rem' }}
            >
              <ArrowLeft size={14} />
              Voltar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate(`/especialidades/editar/${id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '36px', fontSize: '0.8125rem' }}
            >
              <Edit size={14} />
              Editar
            </Button>
            <button 
              onClick={handleDelete}
              style={{ 
                height: '36px',
                padding: '0 1rem',
                backgroundColor: '#ef444415',
                color: '#ef4444',
                border: '1px solid #ef444430',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
              Excluir
            </button>
          </div>
        </div>

        <Card title="Dados da Especialidade">
          <div style={gridStyle}>
            {Object.entries(especialidade).map(([key, value]) => (
              <div key={key} style={dataBoxStyle}>
                <div style={labelStyle}>{key.replace(/_/g, ' ')}</div>
                <div style={valueStyle}>{String(value) || '-'}</div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}
