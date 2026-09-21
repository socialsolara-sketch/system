// Arquivo: src/modules/prestadores/views/PrestadorDetail.jsx
// Descrição: Visão de detalhes completa do Prestador, integrando dados de M04_PRESTADORES e M01_PESSOAS.
// Suporta visualização de conformidade regulatória ANS/TISS e exclusão com serviços SQLite da pasta services/.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, ConfirmationModal } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { getPrestadorById, deletePrestador } from '../services'
import { ArrowLeft, Edit, Trash2, Building2, User, Stethoscope, MapPin, ShieldCheck, Hash, Calendar, FileText, FileSpreadsheet } from 'lucide-react'

export default function PrestadorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleConfirmDelete = async () => {
    if (!prestador?.id) return
    setDeleting(true)
    try {
      const res = await deletePrestador(prestador.id)
      if (res.success) {
        notify.success('Prestador Excluído!', `O prestador ${prestador.nome_razao_social || prestador.nome} foi removido da rede credenciada.`)
        navigate('/prestadores')
      } else {
        notify.error('Erro ao Excluir', res.error || 'Falha na exclusão do prestador.')
      }
    } catch (err) {
      console.error('Erro ao excluir prestador:', err)
      notify.error('Erro ao Excluir', err.message || 'Falha na exclusão do prestador.')
    } finally {
      setDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

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

  const isPF = prestador.tipo_pessoa === 'FÍSICA' || prestador.tipo_prestador === 'MÉDICO'
  const statusCred = (prestador.status_credenciamento || 'ATIVO').toUpperCase()
  const isAtivo = statusCred === 'ATIVO'

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
                  {prestador.nome_razao_social || prestador.nome}
                </h1>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: currentTheme?.colors?.textSecondary || (isDark ? '#A1A1A1' : '#737373')
                  }}
                >
                  ({prestador.codigo_operadora_prestador || 'RDA'})
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: isAtivo ? '#16a34a' : statusCred === 'EM CREDENCIAMENTO' ? '#d97706' : statusCred === 'SUSPENSO' ? '#ea580c' : '#dc2626'
                  }}
                >
                  • {statusCred}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary || '#6b7280', margin: '0.25rem 0 0' }}>
                {prestador.tipo_prestador || 'CLÍNICA'} • {prestador.cidade || prestador.municipio || 'SÃO PAULO'}/{prestador.uf || 'SP'}
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
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}
            >
              <Trash2 size={16} />
              Excluir Prestador
            </Button>
            <Button
              onClick={() => navigate(`/prestadores/editar/${prestador.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}
            >
              <Edit size={16} />
              Editar Prestador
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Dados Cadastrais e Identificação (M01_PESSOAS) */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              {isPF ? (
                <User size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              ) : (
                <Building2 size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              )}
              <span>Identificação do Prestador</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Razão Social / Nome Completo</span>
                <span style={valueStyle}>{prestador.nome_razao_social || prestador.nome || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Nome Fantasia</span>
                <span style={valueStyle}>{prestador.nome_fantasia || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>{isPF ? 'CPF' : 'CNPJ'}</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{prestador.cpf_cnpj || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Tipo de Pessoa</span>
                <span style={valueStyle}>{prestador.tipo_pessoa || (isPF ? 'FÍSICA' : 'JURÍDICA')}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>{isPF ? 'Data de Nascimento' : 'Data de Fundação'}</span>
                <span style={valueStyle}>{prestador.data_nascimento_fundacao || '-'}</span>
              </div>

              {isPF && (
                <>
                  <div style={dataBoxStyle}>
                    <span style={labelStyle}>Sexo (Exigência ANS)</span>
                    <span style={valueStyle}>{prestador.sexo ? (prestador.sexo === 'M' ? 'MASCULINO' : 'FEMININO') : '-'}</span>
                  </div>
                  <div style={dataBoxStyle}>
                    <span style={labelStyle}>Nome da Mãe (Exigência SIB)</span>
                    <span style={valueStyle}>{prestador.nome_mae || '-'}</span>
                  </div>
                </>
              )}

              {!isPF && (
                <>
                  <div style={dataBoxStyle}>
                    <span style={labelStyle}>Inscrição Estadual</span>
                    <span style={valueStyle}>{prestador.inscricao_estadual || 'ISENTO / NÃO INFORMADO'}</span>
                  </div>
                  <div style={dataBoxStyle}>
                    <span style={labelStyle}>Inscrição Municipal</span>
                    <span style={valueStyle}>{prestador.inscricao_municipal || 'NÃO INFORMADO'}</span>
                  </div>
                </>
              )}

              <div style={dataBoxStyle}>
                <span style={labelStyle}>E-mail Principal</span>
                <span style={valueStyle}>{prestador.email_principal || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Telefone Principal</span>
                <span style={valueStyle}>{prestador.telefone_principal || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 2. Credenciamento e Dados Regulatórios */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <ShieldCheck size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>Credenciamento e Regulação ANS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>CRM / Conselho Profissional</span>
                <span style={{ ...valueStyle, fontWeight: '700' }}>
                  {prestador.crm || prestador.numero_conselho ? `${prestador.conselho_profissional || 'CRM'} ${prestador.crm || prestador.numero_conselho}${prestador.estado || prestador.uf ? `/${prestador.estado || prestador.uf}` : ''}` : '-'}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Estrutura</span>
                <span style={valueStyle}>{prestador.estrutura || prestador.tipo_prestador || 'CONSULTÓRIO'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Unidade</span>
                <span style={valueStyle}>{prestador.unidade || prestador.nome_fantasia || 'UNIDADE PRINCIPAL'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Atendimento Idade</span>
                <span style={valueStyle}>{prestador.atendimento_idade || 'TODAS AS IDADES'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Código Operadora (RDA)</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>
                  {prestador.codigo_operadora_prestador || '-'}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Credenciado</span>
                <span style={{ ...valueStyle, fontWeight: '700', color: (prestador.credenciado === 'Não' || statusCred === 'DESCREDENCIADO') ? '#dc2626' : '#16a34a' }}>
                  {prestador.credenciado || (statusCred === 'DESCREDENCIADO' ? 'Não' : 'Sim')}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Contrato Ativo</span>
                <span style={{ ...valueStyle, fontWeight: '700', color: (prestador.contrato_ativo === 'Sim' || (isAtivo && !prestador.data_descredenciamento)) ? '#16a34a' : '#dc2626' }}>
                  {prestador.contrato_ativo || (isAtivo && !prestador.data_descredenciamento ? 'Sim' : 'Não')}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Contrato Desativado</span>
                <span style={{ ...valueStyle, fontWeight: '700', color: (prestador.contrato_desativado === 'Sim' || prestador.data_descredenciamento) ? '#dc2626' : '#737373' }}>
                  {prestador.contrato_desativado || (prestador.data_descredenciamento ? 'Sim' : 'Não')}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Status de Credenciamento</span>
                <span
                  style={{
                    ...valueStyle,
                    color: isAtivo ? '#16a34a' : statusCred === 'EM CREDENCIAMENTO' ? '#d97706' : statusCred === 'SUSPENSO' ? '#ea580c' : '#dc2626'
                  }}
                >
                  {statusCred}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Data de Credenciamento</span>
                <span style={valueStyle}>{prestador.data_credenciamento || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>CNES Principal</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{prestador.cnes_principal || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 3. Especialidades e Atendimento */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <Stethoscope size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>Especialidades e Modalidades de Atendimento</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Especialidade Principal</span>
                <span style={valueStyle}>{prestador.especialidade || prestador.cbos || 'CLÍNICA GERAL'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Atendimento</span>
                <span style={valueStyle}>{prestador.atendimento || prestador.modalidade_atendimento || 'Presencial'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Idade (Faixa Etária)</span>
                <span style={valueStyle}>{prestador.idade || prestador.atendimento_idade || prestador.faixa_etaria || 'Todas as idades'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>RQE (Registro de Qualificação de Especialista)</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{prestador.rqe || 'NÃO INFORMADO'}</span>
              </div>
            </div>
          </Card>

          {/* 4. Localização e Estabelecimento */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <MapPin size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>Endereço e Local de Atendimento</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>Município / Endereço</span>
                <span style={valueStyle}>
                  {prestador.municipio_endereco || (
                    (prestador.municipio || prestador.cidade) && (prestador.endereco || prestador.logradouro)
                      ? `${prestador.municipio || prestador.cidade}, ${prestador.endereco || prestador.logradouro}`
                      : (prestador.municipio || prestador.cidade || prestador.endereco || prestador.logradouro || '-')
                  )}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Número do Endereço</span>
                <span style={valueStyle}>{prestador.numero_endereco || prestador.numero || 'S/N'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Estado (UF)</span>
                <span style={valueStyle}>{prestador.estado || prestador.uf || 'SP'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Complemento / Bairro</span>
                <span style={valueStyle}>
                  {[prestador.complemento, prestador.bairro].filter(Boolean).join(' - ') || '-'}
                </span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>CEP</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{prestador.cep || '-'}</span>
              </div>
            </div>
          </Card>

          {/* 5. Rastreabilidade e Chaves Relacionais */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <Hash size={18} color={currentTheme?.colors?.textSecondary || (isDark ? '#a1a1aa' : '#6b7280')} />
              <span>Rastreabilidade e Chaves Relacionais (UUIDv7)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              <div style={dataBoxStyle}>
                <span style={labelStyle}>ID do Prestador</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{prestador.id}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>ID da Pessoa</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.8125rem' }}>{prestador.id_pessoa || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Data de Criação (Audit)</span>
                <span style={{ ...valueStyle, fontSize: '0.8125rem' }}>{prestador.created_at || '-'}</span>
              </div>

              <div style={dataBoxStyle}>
                <span style={labelStyle}>Última Atualização (Audit)</span>
                <span style={{ ...valueStyle, fontSize: '0.8125rem' }}>{prestador.updated_at || '-'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação Segura de Exclusão */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Exclusão de Prestador"
        description={`Tem certeza que deseja excluir o prestador "${prestador.nome_razao_social || prestador.nome}" da rede credenciada? Esta ação é irreversível.`}
        confirmText={deleting ? 'Excluindo...' : 'Sim, Excluir'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
