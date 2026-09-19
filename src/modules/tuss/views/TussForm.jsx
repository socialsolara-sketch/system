// Arquivo: src/modules/tuss/views/TussForm.jsx
// Descrição: Formulário de cadastro e edição de registros TUSS com estilização flat e minimalista.

import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button } from '@layout'
import { useTheme, useNotification } from '@shared/context'

export default function TussForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const handleSubmit = (e) => {
    e.preventDefault()
    notify.success(
      isEdit ? 'TUSS Atualizado' : 'TUSS Cadastrado',
      `Procedimento ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso no sistema.`
    )
    navigate('/tuss')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
    borderRadius: '0.375rem',
    backgroundColor: currentTheme?.colors?.input || '#ffffff',
    color: currentTheme?.colors?.textPrimary || '#000000',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.875rem',
    transition: 'border-color 0.15s ease'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    fontSize: '0.875rem',
    color: currentTheme?.colors?.textPrimary || '#0f172a'
  }

  const helpTextStyle = {
    fontSize: '0.75rem',
    color: currentTheme?.colors?.textSecondary || '#64748b',
    marginTop: '0.375rem',
    display: 'block'
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
            {isEdit ? `Editar TUSS #${id}` : 'Novo Registro TUSS'}
          </h1>
          <span style={{
            fontSize: '0.875rem',
            color: currentTheme?.colors?.textSecondary || '#64748b'
          }}>
            Cadastre os procedimentos médicos no padrão da Terminologia Unificada da Saúde Suplementar.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary" to="/tuss">Cancelar</Button>
          <Button type="submit" form="tuss-form">
            {isEdit ? 'Salvar Alterações' : 'Cadastrar TUSS'}
          </Button>
        </div>
      </div>

      <form id="tuss-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card title="Dados do Procedimento TUSS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}>
              <div>
                <label style={labelStyle}>Código TUSS *</label>
                <input
                  type="text"
                  placeholder="Ex: 10101012"
                  defaultValue={isEdit ? '10101012' : ''}
                  style={inputStyle}
                  required
                />
                <span style={helpTextStyle}>Código numérico padronizado pela ANS/TISS.</span>
              </div>

              <div>
                <label style={labelStyle}>Situação do Registro *</label>
                <select style={inputStyle} defaultValue="Ativo">
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Descrição Completa *</label>
              <textarea
                placeholder="Descreva o procedimento médico ou consulta..."
                rows="4"
                defaultValue={isEdit ? 'Consulta médica em consultório (no horário normal ou preestabelecido)' : ''}
                style={inputStyle}
                required
              />
            </div>
          </div>
        </Card>

        {/* Painel de Ações do Formulário */}
        <div style={{
          marginTop: '0.5rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: currentTheme?.colors?.card || '#ffffff',
          border: `1px solid ${currentTheme?.colors?.border || '#e2e8f0'}`,
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <span style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary || '#64748b' }}>
            A atualização é sincronizada em toda a tabela de terminologias da operadora.
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button variant="secondary" to="/tuss">Cancelar</Button>
            <Button type="submit">
              {isEdit ? 'Salvar Alterações' : 'Cadastrar TUSS'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
  )
}
