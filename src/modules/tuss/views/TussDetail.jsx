// Arquivo: src/modules/tuss/views/TussDetail.jsx
// Descrição: Visão de detalhes de um item TUSS com rolagem vertical, bordas na área de dados e estilização flat.

import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, Button } from '@layout'
import { useTheme, useNotification } from '@shared/context'

export default function TussDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover o item TUSS #${id}?`)) {
      notify.success('Registro Removido!', `O item TUSS #${id} foi excluído do catálogo.`)
      navigate('/tuss')
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
    color: currentTheme?.colors?.textPrimary || '#0f172a'
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
              Procedimento TUSS #{id || '10101012'}
            </h1>
            <span style={{
              fontSize: '0.875rem',
              color: currentTheme?.colors?.textSecondary || '#64748b'
            }}>
              Consulta médica em consultório (no horário normal ou preestabelecido)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button variant="secondary" to="/tuss">Voltar</Button>
          </div>
        </div>

        <Card title="Informações Detalhadas do Registro">
          <div style={gridStyle}>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Código TUSS</div>
              <div style={{ ...valueStyle, fontWeight: '700' }}>10101012</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Situação</div>
              <div style={{ ...valueStyle, fontWeight: '700', color: '#10b981' }}>Ativo</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Grupo Regulatório</div>
              <div style={valueStyle}>Procedimentos Gerais / Consultas</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Tabela de Referência</div>
              <div style={valueStyle}>TUSS 22 — Procedimentos Médicos</div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '1rem', border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`, borderRadius: '0.375rem', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)' }}>
            <div style={labelStyle}>Descrição Completa</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9375rem', color: currentTheme?.colors?.textPrimary || '#0f172a', lineHeight: 1.6 }}>
              Consulta médica em consultório (no horário normal ou preestabelecido). Procedimento ambulatorial coberto conforme Diretrizes da ANS.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
