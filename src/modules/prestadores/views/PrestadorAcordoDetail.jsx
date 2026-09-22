// Arquivo: src/modules/prestadores/views/PrestadorAcordoDetail.jsx
// Descrição: Visualização de detalhes de Acordo TUSS.
// Baseado na estrutura real do banco de dados SQLite.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { getPrestadorById, getAcordoById } from '../services'
import { ArrowLeft, Hash } from 'lucide-react'

export default function PrestadorAcordoDetail() {
  const { id: prestadorId, acordoId } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [acordo, setAcordo] = useState(null)
  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      setLoading(true)
      try {
        const [foundPrestador, foundAcordo] = await Promise.all([
          getPrestadorById(prestadorId),
          getAcordoById(acordoId)
        ])
        
        if (!isMounted) return
        
        if (foundPrestador) {
          setPrestador(foundPrestador)
        }
        
        if (foundAcordo) {
          setAcordo(foundAcordo)
        } else {
          notify.error('Acordo Não Encontrado', 'Não foi possível carregar os dados do acordo.')
          navigate(`/prestadores/${prestadorId}/acordos`)
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do acordo:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [prestadorId, acordoId, navigate, notify])

  // Estilos de visualização
  const labelStyle = {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373'),
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem'
  }

  const valueStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: currentTheme?.colors?.textPrimary || (isDark ? '#F2F2F2' : '#171717'),
    wordBreak: 'break-word'
  }

  const dataBoxStyle = {
    padding: '0.75rem 1rem',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3B3B3B' : '#E5E5E5')}`,
    borderRadius: '0.375rem',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
    display: 'flex',
    flexDirection: 'column'
  }

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e5e7eb')}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: currentTheme?.colors?.textSecondary }}>
          CARREGANDO DETALHES DO ACORDO...
        </span>
      </div>
    )
  }

  if (!acordo) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1.25rem' }}>
        <span style={{ color: currentTheme?.colors?.textSecondary, fontWeight: '700', fontSize: '1rem' }}>
          ACORDO NÃO ENCONTRADO
        </span>
        <Button onClick={() => navigate(`/prestadores/${prestadorId}/acordos`)}>Voltar para Acordos</Button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto', backgroundColor: currentTheme?.colors?.background }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => navigate(`/prestadores/${prestadorId}/acordos`)}
              style={{ padding: '0.5rem', height: '38px', width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: currentTheme?.colors?.textPrimary || '#111827', margin: 0 }}>
                {acordo.codigo_tuss} - {acordo.nome}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280', margin: '0.25rem 0 0' }}>
                Prestador: {prestador?.nome || '-'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Dados do Acordo */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>1. Dados do Acordo TUSS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Código TUSS</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{acordo.codigo_tuss || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Nome do Procedimento</span>
                <span style={valueStyle}>{acordo.nome || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 2. Vigência */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>2. Vigência do Acordo</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Data Início</span>
                <span style={valueStyle}>{acordo.acordo_data_inicio || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Data Fim</span>
                <span style={valueStyle}>{acordo.acordo_data_fim || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 3. Rastreabilidade */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <Hash size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>Rastreabilidade (UUID)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>ID do Acordo</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                  {acordo.id}
                </span>
              </div>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>ID do Prestador</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                  {acordo.prestador_id}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}