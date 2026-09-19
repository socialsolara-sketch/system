// Arquivo: src/modules/prestadores/views/PrestadorDetail.jsx
// Descrição: Visão de detalhes do Prestador com visualização flat, padronizada com o módulo de usuários.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { fetchPrestadoresFromSheets } from '../services/sheetsService'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'

export default function PrestadorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPrestador = async () => {
      setLoading(true)
      try {
        const result = await fetchPrestadoresFromSheets()
        const found = result.data.find(p => 
          String(p.id) === String(id) || 
          String(p.nome) === String(id) || 
          String(p.nome_do_prestador) === String(id) ||
          String(p.razao_social) === String(id) ||
          String(p.prestador) === String(id)
        )
        setPrestador(found)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadPrestador()
  }, [id])

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o prestador ${prestador?.nome || prestador?.nome_do_prestador}?`)) {
      notify.success('Prestador Excluído!', `O registro foi removido (simulação).`)
      navigate('/prestadores')
    }
  }

  // Estilos padronizados (copiados de UsuarioDetail)
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

  if (!prestador) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
      <span style={{ color: currentTheme?.colors?.textSecondary, fontWeight: '700' }}>PRESTADOR NÃO ENCONTRADO</span>
      <Button onClick={() => navigate('/prestadores')}>Voltar para Lista</Button>
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
        
        {/* Cabeçalho da Página (Padronizado) */}
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
              {prestador.nome || prestador.nome_do_prestador || prestador.razao_social || prestador.prestador}
            </h1>
            <span style={{
              fontSize: '0.875rem',
              color: currentTheme?.colors?.textSecondary || '#64748b'
            }}>
              CÓDIGO: {prestador.id || 'N/A'} • TIPO: {prestador.tipo || 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/prestadores')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '36px', fontSize: '0.8125rem' }}
            >
              <ArrowLeft size={14} />
              Voltar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate(`/prestadores/editar/${id}`)}
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

        {/* Seção 1: Dados Gerais */}
        <Card title="Dados Gerais do Prestador">
          <div style={gridStyle}>
            {Object.entries(prestador).map(([key, value]) => {
              // Filtrar campos que não queremos exibir repetidos ou técnicos se necessário
              // Mas aqui vamos exibir todos conforme a planilha sugere
              return (
                <div key={key} style={dataBoxStyle}>
                  <div style={labelStyle}>{key.replace(/_/g, ' ')}</div>
                  <div style={valueStyle}>{String(value) || '-'}</div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Seção 2: Localização (Exemplo de agrupamento) */}
        {(prestador.cidade || prestador.uf) && (
          <Card title="Localização">
            <div style={gridStyle}>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Cidade</div>
                <div style={valueStyle}>{prestador.cidade || '-'}</div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>UF</div>
                <div style={valueStyle}>{prestador.uf || '-'}</div>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
