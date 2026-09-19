// Arquivo: src/modules/guias/views/GuiaForm.jsx
// Descrição: Formulário de criação e edição de Guias de Autorização com estilização flat.

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import mockGuias from '../data/mockGuias'

export default function GuiaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme } = useTheme()
  const { notify } = useNotification()

  const isEditing = Boolean(id)

  const [formData, setFormData] = useState(() => {
    if (id) {
      const found = mockGuias.find((g) => String(g.id) === String(id))
      if (found) return { ...found }
    }
    return {
      num_guia: '',
      guia_prestador: '',
      senha_autorizacao: '',
      tipo_guia: '2-SPSADT',
      carater_atendimento: 'E-Eletivo',
      data_solicitacao: new Date().toISOString(),
      validade_guia: '',
      executada: 'NÃO',
      carteirinha: '',
      nome_beneficiario: '',
      cod_plano: '',
      status_beneficiario: 'Ativo',
      cod_prestador_solicitante: '',
      nome_solicitante: '',
      cod_prestador_executante: '',
      nome_executante: '',
      cnes_local: '',
      cid_principal: '',
      cod_tuss: '',
      descricao_procedimento: '',
      qtd_solicitada: 1,
      qtd_autorizada: 0,
      status_autorizacao: '3-Em Análise/Auditoria',
      motivo_negativa_tiss: '',
      justificativa_negativa: '',
      cod_auditor_medico: '',
      origem_liberacao: 'Automática',
      valor_tabela_bruto: 0,
      valor_coparticipacao: 0,
      isento_copart: 'Não'
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (isEditing) {
      const idx = mockGuias.findIndex((g) => String(g.id) === String(id))
      if (idx !== -1) mockGuias[idx] = { ...mockGuias[idx], ...formData }
      notify.success('Guia Atualizada!', `A guia #${formData.num_guia} foi salva.`)
    } else {
      const nextId = mockGuias.length > 0 ? Math.max(...mockGuias.map(g => g.id)) + 1 : 1
      mockGuias.push({ id: nextId, ...formData })
      notify.success('Guia Criada!', `A guia #${formData.num_guia} foi cadastrada.`)
    }
    navigate('/guias')
  }

  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: currentTheme?.colors?.textPrimary }
  const inputStyle = { width: '100%', padding: '0.625rem 0.875rem', border: `1px solid ${currentTheme?.colors?.border}`, borderRadius: '0.375rem', backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, outline: 'none', fontSize: '0.875rem' }
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ paddingBottom: '1rem', borderBottom: `1px solid ${currentTheme?.colors?.border}` }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: currentTheme?.colors?.textPrimary }}>
            {isEditing ? `Editar Guia #${formData.num_guia}` : 'Nova Guia de Autorização'}
          </h1>
          <span style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary }}>
            Regulação TISS e autorização técnica.
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="1. Identificação da Guia">
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Número Guia (Protheus) *</label>
                <input name="num_guia" value={formData.num_guia} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Guia Prestador</label>
                <input name="guia_prestador" value={formData.guia_prestador} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Senha Autorização</label>
                <input name="senha_autorizacao" value={formData.senha_autorizacao} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tipo Guia</label>
                <select name="tipo_guia" value={formData.tipo_guia} onChange={handleChange} style={inputStyle}>
                  <option value="1-Consulta">1-Consulta</option>
                  <option value="2-SPSADT">2-SPSADT</option>
                  <option value="3-Internação">3-Internação</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Caráter Atendimento</label>
                <select name="carater_atendimento" value={formData.carater_atendimento} onChange={handleChange} style={inputStyle}>
                  <option value="E-Eletivo">E-Eletivo</option>
                  <option value="U-Urgência">U-Urgência</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Validade Guia</label>
                <input type="date" name="validade_guia" value={formData.validade_guia} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </Card>

          <Card title="2. Dados do Beneficiário">
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Carteirinha *</label>
                <input name="carteirinha" value={formData.carteirinha} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nome Beneficiário *</label>
                <input name="nome_beneficiario" value={formData.nome_beneficiario} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Status Beneficiário</label>
                <select name="status_beneficiario" value={formData.status_beneficiario} onChange={handleChange} style={inputStyle}>
                  <option value="Ativo">Ativo</option>
                  <option value="Carência">Carência</option>
                  <option value="Bloqueado">Bloqueado</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="3. Prestadores e Profissionais">
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>CRM Solicitante</label>
                <input name="cod_prestador_solicitante" value={formData.cod_prestador_solicitante} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nome Solicitante</label>
                <input name="nome_solicitante" value={formData.nome_solicitante} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>RDA Executante</label>
                <input name="cod_prestador_executante" value={formData.cod_prestador_executante} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nome Executante</label>
                <input name="nome_executante" value={formData.nome_executante} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </Card>

          <Card title="4. Dados Clínicos e Procedimentos">
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>CID-10 Principal</label>
                <input name="cid_principal" value={formData.cid_principal} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cód. TUSS *</label>
                <input name="cod_tuss" value={formData.cod_tuss} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Procedimento</label>
                <input name="descricao_procedimento" value={formData.descricao_procedimento} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Qtd. Solicitada</label>
                <input type="number" name="qtd_solicitada" value={formData.qtd_solicitada} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Qtd. Autorizada</label>
                <input type="number" name="qtd_autorizada" value={formData.qtd_autorizada} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </Card>

          <Card title="5. Status da Regulação">
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Status Autorização *</label>
                <select name="status_autorizacao" value={formData.status_autorizacao} onChange={handleChange} required style={inputStyle}>
                  <option value="1-Autorizada">1-Autorizada</option>
                  <option value="2-Negada">2-Negada</option>
                  <option value="3-Em Análise/Auditoria">3-Em Análise/Auditoria</option>
                  <option value="4-Cancelada">4-Cancelada</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Origem Liberação</label>
                <select name="origem_liberacao" value={formData.origem_liberacao} onChange={handleChange} style={inputStyle}>
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                  <option value="Judicial">Judicial</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Cód. Auditor Médico</label>
                <input name="cod_auditor_medico" value={formData.cod_auditor_medico} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Executada</label>
                <select name="executada" value={formData.executada} onChange={handleChange} style={inputStyle}>
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                </select>
              </div>
            </div>
            {formData.status_autorizacao === '2-Negada' && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Motivo Negativa TISS</label>
                  <input name="motivo_negativa_tiss" value={formData.motivo_negativa_tiss} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Justificativa Negativa</label>
                  <textarea name="justificativa_negativa" value={formData.justificativa_negativa} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} />
                </div>
              </div>
            )}
          </Card>

          <Card title="6. Dados Financeiros">
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Valor Tabela Bruto (R$)</label>
                <input type="number" step="0.01" name="valor_tabela_bruto" value={formData.valor_tabela_bruto} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Valor Coparticipação (R$)</label>
                <input type="number" step="0.01" name="valor_coparticipacao" value={formData.valor_coparticipacao} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Isento Copart.</label>
                <select name="isento_copart" value={formData.isento_copart} onChange={handleChange} style={inputStyle}>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => navigate('/guias')}>Cancelar</Button>
            <Button type="submit" variant="primary">Salvar Guia</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
