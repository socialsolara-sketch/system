// Arquivo: src/modules/prestadores/views/PrestadorDetail.jsx
// Descrição: Visão de detalhes do Prestador.
// Baseado na estrutura real do banco de dados SQLite.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { getPrestadorById } from '../services'
import { ArrowLeft, Hash, FileSpreadsheet } from 'lucide-react'

export default function PrestadorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadPrestador = async () => {
      setLoading(true)
      try {
        const found = await getPrestadorById(id)
        if (!isMounted) return
        setPrestador(found || null)
      } catch (err) {
        console.error('Erro ao carregar detalhes do prestador:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadPrestador()
    return () => { isMounted = false }
  }, [id])

  // Estilos de visualização padronizados
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
          CARREGANDO DETALHES DO PRESTADOR...
        </span>
      </div>
    )
  }

  if (!prestador) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1.25rem' }}>
        <span style={{ color: currentTheme?.colors?.textSecondary, fontWeight: '700', fontSize: '1rem' }}>
          PRESTADOR NÃO ENCONTRADO NA REDE
        </span>
        <Button onClick={() => navigate('/prestadores')}>Voltar para a Lista de Prestadores</Button>
      </div>
    )
  }

  const isAtivo = prestador.contrato_ativo_em && !prestador.contrato_encerrado_em

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto', backgroundColor: currentTheme?.colors?.background }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
        {/* Top Bar com Navegação e Ações */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => navigate('/prestadores')}
              style={{ padding: '0.5rem', height: '38px', width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: currentTheme?.colors?.textPrimary || '#111827', margin: 0 }}>
                  {prestador.nome}
                </h1>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: isAtivo ? '#16a34a' : '#dc2626'
                  }}
                >
                  • {isAtivo ? 'ATIVO' : 'ENCERRADO'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280', margin: '0.25rem 0 0' }}>
                {prestador.estrutura || 'CONSULTÓRIO'} • {prestador.municipio || 'SÃO PAULO'}/{prestador.estado || 'SP'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              onClick={() => navigate(`/prestadores/${prestador.id}/acordos`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: currentTheme?.colors?.primary || '#2563eb' }}
            >
              <FileSpreadsheet size={16} />
              Ver Acordos TUSS
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Dados do Prestador */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>1. Dados do Prestador</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Nome</span>
                <span style={valueStyle}>{prestador.nome || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>CRM</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{prestador.crm || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Especialidade</span>
                <span style={valueStyle}>{prestador.especialidade_nome || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Telefone</span>
                <span style={valueStyle}>{prestador.telefone || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>WhatsApp</span>
                <span style={valueStyle}>{prestador.whatsapp || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Idade</span>
                <span style={valueStyle}>{prestador.idade || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 2. Estrutura e Contrato */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>2. Estrutura e Contrato</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Estrutura</span>
                <span style={valueStyle}>{prestador.estrutura || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Unidade</span>
                <span style={valueStyle}>{prestador.unidade || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Contrato Ativo Em</span>
                <span style={valueStyle}>{prestador.contrato_ativo_em || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Contrato Encerrado Em</span>
                <span style={valueStyle}>{prestador.contrato_encerrado_em || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 3. Endereço */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <span>3. Endereço</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Município</span>
                <span style={valueStyle}>{prestador.municipio || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Estado</span>
                <span style={valueStyle}>{prestador.estado || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Bairro</span>
                <span style={valueStyle}>{prestador.bairro || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Endereço</span>
                <span style={valueStyle}>{prestador.endereco || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Número</span>
                <span style={valueStyle}>{prestador.endereco_numero || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 4. Rastreabilidade */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <Hash size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>Rastreabilidade (UUID)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>ID do Prestador</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                  {prestador.id}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}