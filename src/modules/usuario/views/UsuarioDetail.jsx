// Arquivo: src/modules/usuario/views/UsuarioDetail.jsx
// Descrição: Visão de detalhes do Usuário/Beneficiário com rolagem vertical, campos com bordas e visualização flat.

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, Button } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import mockUsuarios from '../data/mockUsuarios'

// Formatadores auxiliares
const formatCPF = (cpf) => (cpf && cpf.length === 11 ? `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}` : cpf || '-')
const formatCEP = (cep) => (cep && cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep || '-')
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return year && month && day ? `${day}/${month}/${year}` : dateStr
}
const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export default function UsuarioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const user = mockUsuarios.find((u) => String(u.id) === String(id)) || mockUsuarios[0]
  const [activeTabSection, setActiveTabSection] = useState('carencias')

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o beneficiário ${user.nome_completo}?`)) {
      notify.success('Usuário Excluído!', `O registro de ${user.nome_completo} foi removido do sistema.`)
      navigate('/usuario')
    }
  }

  // Estilos de campos com borda
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

  const getStatusColor = (status) => {
    if (status === 'Ativo') return '#10b981'
    if (status === 'Suspenso') return '#f59e0b'
    return '#ef4444'
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
              {user.nome_completo}
            </h1>
            <span style={{
              fontSize: '0.875rem',
              color: currentTheme?.colors?.textSecondary || '#64748b'
            }}>
              Carteirinha TISS: {user.codigo_carteirinha} • ID #{user.id}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/usuario')} style={{ height: '36px', fontSize: '0.8125rem' }}>
              Voltar
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/usuario/editar/${id}`)} style={{ height: '36px', fontSize: '0.8125rem' }}>
              Editar
            </Button>
            <Button 
              variant="secondary" 
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
                cursor: 'pointer'
              }}
            >
              Excluir
            </Button>
          </div>
        </div>

        {/* Seção 1: Identificação */}
        <Card title="Identificação do Beneficiário">
          <div style={gridStyle}>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>ID no Banco (PK)</div>
              <div style={valueStyle}>{user.id}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Código Carteirinha (TISS)</div>
              <div style={valueStyle}>{user.codigo_carteirinha}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Nome Completo</div>
              <div style={valueStyle}>{user.nome_completo}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>CPF</div>
              <div style={valueStyle}>{formatCPF(user.cpf)}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>RG</div>
              <div style={valueStyle}>{user.rg || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Órgão Emissor RG</div>
              <div style={valueStyle}>{user.orgao_emissor_rg || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>CNS (Cartão SUS)</div>
              <div style={valueStyle}>{user.cns}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Data de Nascimento</div>
              <div style={valueStyle}>{formatDate(user.data_nascimento)}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Sexo</div>
              <div style={valueStyle}>{user.sexo === 'M' ? 'Masculino (M)' : 'Feminino (F)'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Nome da Mãe</div>
              <div style={valueStyle}>{user.nome_mae}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Estado Civil</div>
              <div style={valueStyle}>{user.estado_civil || '-'}</div>
            </div>
          </div>
        </Card>

        {/* Seção 2: Contrato com Operadora */}
        <Card title="Dados do Contrato com a Operadora">
          <div style={gridStyle}>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Tipo de Beneficiário</div>
              <div style={valueStyle}>{user.tipo_beneficiario}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>ID do Titular (FK)</div>
              <div style={valueStyle}>{user.id_titular || 'N/A (É Titular)'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Grau de Parentesco</div>
              <div style={valueStyle}>{user.grau_parentesco || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Número do Contrato</div>
              <div style={valueStyle}>{user.numero_contrato || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Tipo de Contrato (ANS)</div>
              <div style={valueStyle}>{user.tipo_contrato || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Nome Comercial do Plano</div>
              <div style={valueStyle}>{user.nome_comercial_plano || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Registro do Plano na ANS</div>
              <div style={valueStyle}>{user.registro_ans_plano || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Segmentação Assistencial</div>
              <div style={valueStyle}>{user.segmentacao_assistencial || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Tipo de Cobertura</div>
              <div style={valueStyle}>{user.tipo_cobertura || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Tipo de Acomodação</div>
              <div style={valueStyle}>{user.tipo_acomodacao || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Fator de Coparticipação</div>
              <div style={valueStyle}>{user.coparticipacao_indicador ? 'Sim (Com Coparticipação)' : 'Não (Sem Coparticipação)'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Valor da Mensalidade</div>
              <div style={{ ...valueStyle, fontWeight: '600', color: currentTheme?.colors?.primary || '#2563eb' }}>
                {formatCurrency(user.valor_mensalidade)}
              </div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Situação Financeira do Contrato</div>
              <div style={{ ...valueStyle, fontWeight: '700', color: user.situacao_financeira_contrato === 'Adimplente' ? '#10b981' : '#f59e0b' }}>
                {user.situacao_financeira_contrato || 'Adimplente'}
              </div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Nome da Empresa Estipulante</div>
              <div style={valueStyle}>{user.estipulante_nome || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>CNPJ da Empresa Estipulante</div>
              <div style={valueStyle}>{user.estipulante_cnpj || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>ID do Plano (FK)</div>
              <div style={valueStyle}>{user.id_plano}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Situação Cadastral</div>
              <div style={{ ...valueStyle, fontWeight: '700', color: getStatusColor(user.situacao_cadastral) }}>
                {user.situacao_cadastral}
              </div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Data de Adesão</div>
              <div style={valueStyle}>{formatDate(user.data_adesao)}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Data de Cancelamento</div>
              <div style={valueStyle}>{formatDate(user.data_cancelamento)}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Motivo do Cancelamento</div>
              <div style={valueStyle}>{user.motivo_cancelamento || '-'}</div>
            </div>
          </div>
        </Card>

        {/* Seção 3: Regulação ANS & Carências */}
        <Card title="Regulação ANS & Carências">
          {/* Cabeçalho das Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
            marginBottom: '1.25rem',
            gap: '1.5rem',
            userSelect: 'none'
          }}>
            <button
              type="button"
              onClick={() => setActiveTabSection('carencias')}
              style={{
                padding: '0.75rem 0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: activeTabSection === 'carencias' ? (currentTheme?.colors?.primary || '#2563eb') : (currentTheme?.colors?.textSecondary || '#64748b'),
                borderBottom: activeTabSection === 'carencias' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              Carências Contratuais
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('cpt')}
              style={{
                padding: '0.75rem 0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: activeTabSection === 'cpt' ? (currentTheme?.colors?.primary || '#2563eb') : (currentTheme?.colors?.textSecondary || '#64748b'),
                borderBottom: activeTabSection === 'cpt' ? `2px solid ${currentTheme?.colors?.primary || '#2563eb'}` : '2px solid transparent',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              Doenças Preexistentes (CPT)
            </button>
          </div>

          {activeTabSection === 'carencias' ? (
            <div style={gridStyle}>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>CPT / Indicador DLP</div>
                <div style={valueStyle}>
                  {user.cpt_indicador ? (
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>Sim (Lesão/Doença Preexistente)</span>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: '600' }}>Não (Sem DLP)</span>
                  )}
                </div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Início Carência Contratual</div>
                <div style={valueStyle}>{formatDate(user.inicio_carencia_contratual)}</div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Término Carência Contratual</div>
                <div style={valueStyle}>{formatDate(user.fim_carencia_contratual)}</div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Fim Carência Consultas</div>
                <div style={valueStyle}>{formatDate(user.fim_carencia_consultas)}</div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Fim Carência Exames</div>
                <div style={valueStyle}>{formatDate(user.fim_carencia_exames)}</div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Fim Carência Internação</div>
                <div style={valueStyle}>{formatDate(user.fim_carencia_internacao)}</div>
              </div>
              <div style={dataBoxStyle}>
                <div style={labelStyle}>Fim Carência Parto</div>
                <div style={valueStyle}>{formatDate(user.fim_carencia_parto)}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.875rem 1.25rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: currentTheme?.colors?.textPrimary || '#0f172a'
              }}>
                <span style={{ fontWeight: '600' }}>Indicador de DLP Geral:</span>{' '}
                {user.cpt_indicador ? (
                  <span style={{ color: '#ef4444', fontWeight: '700' }}>ATIVO — Este beneficiário possui restrições parciais temporárias.</span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: '700' }}>INATIVO — Sem doenças ou lesões preexistentes declaradas.</span>
                )}
              </div>

              {(!user.cpts || user.cpts.length === 0) ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: currentTheme?.colors?.textSecondary || '#64748b',
                  fontSize: '0.875rem',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fbfbfb',
                  border: `1px dashed ${currentTheme?.colors?.border || '#e2e8f0'}`,
                  borderRadius: '0.375rem'
                }}>
                  Nenhuma restrição de CPT (patologia/recurso) cadastrada para este beneficiário.
                </div>
              ) : (
                <div className="system-scrollbar" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: currentTheme?.colors?.textSecondary || '#64748b',
                          fontWeight: '600',
                          borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`
                        }}>
                          Patologia / Doença Preexistente
                        </th>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: currentTheme?.colors?.textSecondary || '#64748b',
                          fontWeight: '600',
                          borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`
                        }}>
                          Recurso Sob Cobertura Parcial Temporária (CPT)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.cpts.map((cpt, index) => (
                        <tr key={cpt.id || index}>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                            color: currentTheme?.colors?.textPrimary || '#0f172a',
                            fontWeight: '500'
                          }}>
                            {cpt.patologia}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
                            color: currentTheme?.colors?.textSecondary || '#64748b'
                          }}>
                            {cpt.recurso}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Seção 4: Contato e Endereço */}
        <Card title="Contato e Endereço">
          <div style={gridStyle}>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>E-mail</div>
              <div style={valueStyle}>{user.email}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Telefone Celular</div>
              <div style={valueStyle}>{user.telefone_celular || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>CEP</div>
              <div style={valueStyle}>{formatCEP(user.cep)}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Logradouro</div>
              <div style={valueStyle}>{user.logradouro}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Número</div>
              <div style={valueStyle}>{user.numero}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Complemento</div>
              <div style={valueStyle}>{user.complemento || '-'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Bairro</div>
              <div style={valueStyle}>{user.bairro}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Cidade</div>
              <div style={valueStyle}>{user.cidade}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>UF</div>
              <div style={valueStyle}>{user.uf}</div>
            </div>
          </div>
        </Card>

        {/* Seção 5: Acesso e Metadados do Sistema */}
        <Card title="Acesso e Metadados do Sistema">
          <div style={gridStyle}>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Hash Senha (App/Portal)</div>
              <div style={{ ...valueStyle, fontSize: '0.8125rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user.hash_senha}
              </div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Primeiro Acesso Pendente</div>
              <div style={valueStyle}>
                {user.primeiro_acesso ? (
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>Sim (Alteração obrigatória)</span>
                ) : (
                  <span style={{ color: '#10b981' }}>Não</span>
                )}
              </div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Data de Criação (created_at)</div>
              <div style={valueStyle}>{user.created_at || '2024-01-15 T 10:00:00Z'}</div>
            </div>
            <div style={dataBoxStyle}>
              <div style={labelStyle}>Última Atualização (updated_at)</div>
              <div style={valueStyle}>{user.updated_at || '2024-05-20 T 14:30:00Z'}</div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
