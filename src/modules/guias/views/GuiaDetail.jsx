// Arquivo: src/modules/guias/views/GuiaDetail.jsx
// Descrição: Detalhamento completo de uma Guia de Autorização.

import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@layout'
import { useTheme } from '@shared/context'
import mockGuias from '../data/mockGuias'

export default function GuiaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme } = useTheme()

  const guia = mockGuias.find((g) => String(g.id) === String(id))

  if (!guia) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: currentTheme?.colors?.textPrimary }}>Guia não encontrada.</div>
  }

  const labelStyle = { fontSize: '0.75rem', fontWeight: '700', color: currentTheme?.colors?.textSecondary, textTransform: 'uppercase', marginBottom: '0.25rem' }
  const valueStyle = { fontSize: '0.9375rem', color: currentTheme?.colors?.textPrimary, fontWeight: '500' }
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
  const formatDate = (v) => v ? new Intl.DateTimeFormat('pt-BR').format(new Date(v)) : '-'

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: `1px solid ${currentTheme?.colors?.border}` }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: currentTheme?.colors?.textPrimary }}>
              Guia #{guia.num_guia}
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                color: guia.status_autorizacao.startsWith('1') ? '#16a34a' : guia.status_autorizacao.startsWith('2') ? '#dc2626' : '#d97706' 
              }}>
                {guia.status_autorizacao}
              </span>
              <span style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary }}>{guia.tipo_guia} • {guia.carater_atendimento}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => navigate('/guias')}>Voltar</Button>
            <Button onClick={() => navigate(`/guias/editar/${guia.id}`)}>Editar Guia</Button>
          </div>
        </div>

        <Card title="Identificação e Beneficiário">
          <div style={gridStyle}>
            <div><div style={labelStyle}>Número Guia</div><div style={valueStyle}>{guia.num_guia}</div></div>
            <div><div style={labelStyle}>Guia Prestador</div><div style={valueStyle}>{guia.guia_prestador || '-'}</div></div>
            <div><div style={labelStyle}>Senha Autorização</div><div style={valueStyle}>{guia.senha_autorizacao || '-'}</div></div>
            <div><div style={labelStyle}>Data Solicitação</div><div style={valueStyle}>{formatDate(guia.data_solicitacao)}</div></div>
            <div><div style={labelStyle}>Validade</div><div style={valueStyle}>{formatDate(guia.validade_guia)}</div></div>
            <div><div style={labelStyle}>Carteirinha</div><div style={valueStyle}>{guia.carteirinha}</div></div>
            <div><div style={labelStyle}>Beneficiário</div><div style={valueStyle}>{guia.nome_beneficiario}</div></div>
            <div><div style={labelStyle}>Plano</div><div style={valueStyle}>{guia.cod_plano}</div></div>
            <div><div style={labelStyle}>Status Vida</div><div style={valueStyle}>{guia.status_beneficiario}</div></div>
          </div>
        </Card>

        <Card title="Prestadores e Procedimento">
          <div style={gridStyle}>
            <div><div style={labelStyle}>Médico Solicitante</div><div style={valueStyle}>{guia.nome_solicitante} ({guia.cod_prestador_solicitante})</div></div>
            <div><div style={labelStyle}>Local Executante</div><div style={valueStyle}>{guia.nome_executante} ({guia.cod_prestador_executante})</div></div>
            <div><div style={labelStyle}>CID-10</div><div style={valueStyle}>{guia.cid_principal}</div></div>
            <div><div style={labelStyle}>TUSS</div><div style={valueStyle}>{guia.cod_tuss} - {guia.descricao_procedimento}</div></div>
            <div><div style={labelStyle}>Qtd. Solicitada</div><div style={valueStyle}>{guia.qtd_solicitada}</div></div>
            <div><div style={labelStyle}>Qtd. Autorizada</div><div style={valueStyle}>{guia.qtd_autorizada}</div></div>
          </div>
        </Card>

        <Card title="Regulação e Financeiro">
          <div style={gridStyle}>
            <div><div style={labelStyle}>Executada</div><div style={valueStyle}>{guia.executada || 'NÃO'}</div></div>
            <div><div style={labelStyle}>Origem Liberação</div><div style={valueStyle}>{guia.origem_liberacao}</div></div>
            <div><div style={labelStyle}>Auditor Responsável</div><div style={valueStyle}>{guia.cod_auditor_medico}</div></div>
            <div><div style={labelStyle}>Valor Bruto</div><div style={valueStyle}>{formatCurrency(guia.valor_tabela_bruto)}</div></div>
            <div><div style={labelStyle}>Coparticipação</div><div style={valueStyle}>{formatCurrency(guia.valor_coparticipacao)}</div></div>
            <div><div style={labelStyle}>Isento Copart.</div><div style={valueStyle}>{guia.isento_copart}</div></div>
          </div>
          {guia.justificativa_negativa && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: currentTheme?.colors?.background, borderRadius: '8px', borderLeft: `4px solid ${currentTheme?.colors?.error}` }}>
              <div style={labelStyle}>Justificativa da Negativa</div>
              <div style={{ ...valueStyle, marginTop: '0.5rem' }}>{guia.justificativa_negativa}</div>
              {guia.motivo_negativa_tiss && <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: currentTheme?.colors?.textSecondary }}>Código TISS: {guia.motivo_negativa_tiss}</div>}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
