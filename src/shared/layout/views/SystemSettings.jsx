// Arquivo: src/shared/layout/views/SystemSettings.jsx
// Descrição: Visão de configurações globais com personalização tipográfica, escala de fontes e parâmetros gerais.

import { useState, useCallback, useMemo } from 'react'
import { Card, Button, ConfirmationModal, ActionsArea } from '@layout'
import { useTheme } from '../../context/ThemeContext'
import { useNotification } from '../../context/NotificationContext'
import { availableFonts } from '@assets/fonts'

const DEFAULT_SYSTEM_NAME = 'System'
const DEFAULT_SUPPORT_EMAIL = 'admin@system.local'
const DEFAULT_PAGE_SIZE = '10'

// ==========================================
// Componente SystemSettings
// ==========================================

export function SystemSettings() {
  const { theme, setTheme, font, changeFont, fontSize, changeFontSize, resetThemeDefaults, currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  // Estado local pendente para evitar re-renderizações globais a cada mudança de campo
  const [pendingSettings, setPendingSettings] = useState(() => ({
    systemName: localStorage.getItem('system_name') || DEFAULT_SYSTEM_NAME,
    supportEmail: localStorage.getItem('system_email') || DEFAULT_SUPPORT_EMAIL,
    pageSize: localStorage.getItem('system_page_size') || DEFAULT_PAGE_SIZE,
    theme: theme,
    font: font,
    fontSize: fontSize
  }))

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('save') // 'save' | 'reset'
  const [isProcessing, setIsProcessing] = useState(false)

  // ==========================================
  // Handlers de Salvamento e Reset (Refatorados para Alta Disponibilidade)
  // ==========================================

  const handleSavePermanent = useCallback(() => {
    setIsProcessing(true)
    try {
      // 1. Atualiza o contexto de tema para aplicação imediata (usando transição interna do contexto)
      setTheme(pendingSettings.theme)
      changeFont(pendingSettings.font)
      changeFontSize(pendingSettings.fontSize)

      // 2. Persiste as demais configurações de forma segura
      const storageOps = [
        () => localStorage.setItem('system_name', pendingSettings.systemName),
        () => localStorage.setItem('system_email', pendingSettings.supportEmail),
        () => localStorage.setItem('system_page_size', pendingSettings.pageSize)
      ]

      storageOps.forEach(op => {
        try { op() } catch (e) { console.error('Storage operational error:', e) }
      })
      
      notify.success('CONFIGURAÇÕES SALVAS', 'TODAS AS ALTERAÇÕES FORAM APLICADAS COM SUCESSO.')
    } catch (error) {
      console.error('Erro crítico ao salvar configurações:', error)
      notify.error('ERRO AO SALVAR', 'OCORREU UM PROBLEMA AO APLICAR AS ALTERAÇÕES.')
    } finally {
      setIsProcessing(false)
    }
  }, [pendingSettings, setTheme, changeFont, changeFontSize, notify])

  const handleResetDefaults = useCallback(() => {
    setIsProcessing(true)
    try {
      // ESTRATÉGIA ANTI-FREEZE SENIOR:
      // A limpeza de storage + reload é a forma atômica mais estável de resetar um sistema complexo.
      const keysToRemove = [
        'system_theme', 
        'system_font', 
        'system_font_size',
        'system_name', 
        'system_email', 
        'system_page_size'
      ]
      
      keysToRemove.forEach(k => localStorage.removeItem(k))
      
      notify.success('RESTAURANDO PADRÕES', 'O SISTEMA SERÁ REINICIADO COM AS CONFIGURAÇÕES ORIGINAIS.')
      
      // Delay estratégico para permitir que a notificação e o modal fechem visualmente
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (error) {
      console.error('Erro ao restaurar padrões:', error)
      setIsProcessing(false)
    }
  }, [notify])

  const handleConfirm = useCallback(() => {
    setIsConfirmModalOpen(false)

    // Executa imediatamente: o atraso artificial de 200ms apenas adicionava latência
    // perceptível entre o clique em "Confirmar" e a resposta do sistema.
    if (modalMode === 'save') {
      handleSavePermanent()
    } else {
      handleResetDefaults()
    }
  }, [modalMode, handleSavePermanent, handleResetDefaults])

  const handleCancel = useCallback(() => {
    setPendingSettings({
      systemName: localStorage.getItem('system_name') || DEFAULT_SYSTEM_NAME,
      supportEmail: localStorage.getItem('system_email') || DEFAULT_SUPPORT_EMAIL,
      pageSize: localStorage.getItem('system_page_size') || DEFAULT_PAGE_SIZE,
      theme: theme,
      font: font,
      fontSize: fontSize
    })
    notify.info('ALTERAÇÕES DESCARTADAS', 'O FORMULÁRIO FOI RE-SINCRONIZADO COM O ESTADO ATUAL.')
  }, [theme, font, fontSize, notify])

  // ==========================================
  // Otimização de Estilos Dinâmicos
  // ==========================================

  const styles = useMemo(() => {
    const inputBg = currentTheme?.colors?.input || '#ffffff'
    const borderCol = currentTheme?.colors?.border || '#e2e8f0'
    const textPri = currentTheme?.colors?.textPrimary || '#000000'
    
    return {
      input: {
        width: '100%',
        padding: '0.625rem 0.875rem',
        border: `1px solid ${borderCol}`,
        borderRadius: '0.375rem',
        backgroundColor: inputBg,
        color: textPri,
        outline: 'none',
        boxSizing: 'border-box',
        fontSize: '0.875rem',
        transition: 'border-color 0.15s ease, background-color 0.15s ease'
      },
      label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        fontSize: '0.875rem',
        color: textPri
      }
    }
  }, [currentTheme])

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
      <div style={{
        paddingBottom: '0.5rem',
        borderBottom: `1px solid ${currentTheme?.colors?.border || 'rgba(0, 0, 0, 0.1)'}`
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          margin: 0,
          color: currentTheme?.colors?.textPrimary || '#0f172a',
          letterSpacing: '-0.01em'
        }}>
          Configurações
        </h1>
        <span style={{
          fontSize: '0.875rem',
          color: currentTheme?.colors?.textSecondary || '#64748b'
        }}>
          Gerencie as preferências de interface, tipografia e parâmetros globais
        </span>
      </div>
      
      <Card
        title="Tipografia e Interface"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={styles.label}>Tema Visual</label>
            <select
              value={pendingSettings.theme}
              onChange={(e) => {
                const newTheme = e.target.value
                setPendingSettings({...pendingSettings, theme: newTheme})
                setTheme(newTheme)
              }}
              style={styles.input}
              disabled={isProcessing}
            >
              <option value="light">Claro (Padrão)</option>
              <option value="dark">Escuro (Dark Mode)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', marginTop: '0.375rem', display: 'block' }}>
              Alterna o tema de cores em toda a interface do sistema.
            </span>
          </div>

          <div>
            <label style={styles.label}>Fonte do Sistema</label>
            <select
              value={pendingSettings.font}
              onChange={(e) => {
                const newFont = e.target.value
                setPendingSettings({...pendingSettings, font: newFont})
                changeFont(newFont)
              }}
              style={styles.input}
              disabled={isProcessing}
            >
              {availableFonts.map((fontOption) => (
                <option key={fontOption.id} value={fontOption.id}>
                  {fontOption.name} ({fontOption.id === 'system' ? 'Nativa' : 'Web'})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', marginTop: '0.375rem', display: 'block' }}>
              Aplica a tipografia selecionada em toda a interface do sistema, tabelas, menus e formulários.
            </span>
          </div>

          <div>
            <label style={styles.label}>Escala do Tamanho de Fonte</label>
            <select
              value={pendingSettings.fontSize}
              onChange={(e) => {
                const newSize = e.target.value
                setPendingSettings({...pendingSettings, fontSize: newSize})
                changeFontSize(newSize)
              }}
              style={styles.input}
              disabled={isProcessing}
            >
              <option value="small">Pequeno (Compacto — base 14px)</option>
              <option value="medium">Médio (Padrão — base 16px)</option>
              <option value="large">Grande (Acessibilidade — base 18px)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary || '#64748b', marginTop: '0.375rem', display: 'block' }}>
              Escala dinamicamente todas as medidas proporcionais (&quot;rem&quot;) da aplicação.
            </span>
          </div>

          <div style={{
            marginTop: '0.5rem',
            padding: '1.25rem',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px dashed ${currentTheme?.colors?.border || 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: currentTheme?.colors?.textSecondary || '#64748b',
              fontWeight: '600',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              Pré-visualização da Tipografia Ativa
            </span>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: currentTheme?.colors?.textPrimary || '#0f172a' }}>
              Terminologia Unificada da Saúde Suplementar (TUSS)
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary || '#64748b', lineHeight: 1.5 }}>
              O rápido gavião voa sobre o cão preguiçoso — Código 10101012 com diretrizes ANS atualizadas.
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="Configurações Gerais do Sistema"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            <div>
              <label style={styles.label}>Nome do Sistema</label>
              <input
                type="text"
                value={pendingSettings.systemName}
                onChange={(e) => setPendingSettings({...pendingSettings, systemName: e.target.value})}
                style={styles.input}
                disabled={isProcessing}
              />
            </div>
            <div>
              <label style={styles.label}>Email de Suporte</label>
              <input
                type="email"
                placeholder="suporte@exemplo.com"
                value={pendingSettings.supportEmail}
                onChange={(e) => setPendingSettings({...pendingSettings, supportEmail: e.target.value})}
                style={styles.input}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Registros Padrão por Página</label>
            <select
              style={styles.input}
              value={pendingSettings.pageSize}
              onChange={(e) => setPendingSettings({...pendingSettings, pageSize: e.target.value})}
              disabled={isProcessing}
            >
              <option value="10">10 registros</option>
              <option value="25">25 registros</option>
              <option value="50">50 registros</option>
              <option value="100">100 registros</option>
            </select>
          </div>
        </div>
      </Card>

      <ActionsArea>
        <Button variant="secondary" onClick={handleCancel} disabled={isProcessing} style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={() => {
          setModalMode('reset')
          setIsConfirmModalOpen(true)
        }} disabled={isProcessing} style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>
          Restaurar Padrões
        </Button>
        <div style={{ width: '1px', height: '16px', backgroundColor: currentTheme?.colors?.border || '#e2e8f0' }} />
        <Button onClick={() => {
          setModalMode('save')
          setIsConfirmModalOpen(true)
        }} disabled={isProcessing} style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>
          Salvar Configurações
        </Button>
      </ActionsArea>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title={modalMode === 'reset' ? "Restaurar Configurações" : "Confirmar Alterações"}
        description={modalMode === 'reset' ? "Tem certeza que deseja redefinir todas as configurações para o padrão?" : "Tem certeza que deseja salvar todas as alterações de configuração no sistema?"}
        confirmText={modalMode === 'reset' ? "Confirmar e Restaurar" : "Confirmar e Salvar"}
        cancelText="Voltar"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
        variant={modalMode === 'reset' ? "danger" : "warning"}
      />

      </div>

    </div>
  )
}

export default SystemSettings
