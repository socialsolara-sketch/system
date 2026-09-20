// Arquivo: src/modules/auditoria/views/AuditoriaList.jsx
// Descrição: Módulo 11 - Auditoria e Rastreabilidade (M11_AUDITORIA_LOGS, M11_SNAPSHOTS_REGISTROS, M11_BLOQUEIOS_SISTEMA)

import { useState, useMemo } from 'react'
import { Header, Table, Button, ConfirmationModal } from '@layout'
import { useTheme, useNotification } from '@shared/context'
import { ShieldCheck, Search, X, History, Lock, FileJson, AlertTriangle, Eye, RefreshCw } from 'lucide-react'

const initialLogs = []

export default function AuditoriaList() {
  const { currentTheme, isDark } = useTheme()
  const { notify } = useNotification()

  const [logs, setLogs] = useState(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [moduloFilter, setModuloFilter] = useState('todos')
  const [acaoFilter, setAcaoFilter] = useState('todos')

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (moduloFilter !== 'todos' && l.modulo !== moduloFilter) return false
      if (acaoFilter !== 'todos' && l.acao !== acaoFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        l.usuario?.toLowerCase().includes(q) ||
        l.descricao?.toLowerCase().includes(q) ||
        l.tabela?.toLowerCase().includes(q) ||
        l.ip?.toLowerCase().includes(q)
      )
    })
  }, [logs, searchQuery, moduloFilter, acaoFilter])

  const handleOpenDetail = (item) => {
    setSelectedLog(item)
    setDetailModalOpen(true)
  }

  const columns = [
    {
      key: 'data_hora',
      header: 'DATA / HORA',
      minWidth: '160px',
      render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v}</span>
    },
    {
      key: 'usuario',
      header: 'USUÁRIO RESPONSÁVEL / IP',
      minWidth: '230px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: currentTheme?.colors?.textPrimary }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary }}>IP: {r.ip}</span>
        </div>
      )
    },
    {
      key: 'modulo',
      header: 'MÓDULO / TABELA',
      minWidth: '200px',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{v}</span>
          <span style={{ fontSize: '0.75rem', color: currentTheme?.colors?.textSecondary, fontFamily: 'monospace' }}>{r.tabela}</span>
        </div>
      )
    },
    {
      key: 'acao',
      header: 'OPERAÇÃO',
      minWidth: '120px',
      render: (v) => {
        let color = '#2563eb'
        if (v === 'INSERT') color = '#16a34a'
        if (v === 'UPDATE') color = '#ea580c'
        if (v === 'DELETE') color = '#dc2626'
        return (
          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color }}>
            {v}
          </span>
        )
      }
    },
    {
      key: 'descricao',
      header: 'DESCRIÇÃO DO EVENTO AUDITADO',
      minWidth: '280px',
      render: (v) => <span style={{ fontSize: '0.8125rem' }}>{v}</span>
    }
  ]

  const selectStyle = {
    padding: '0.45rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
    backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
    color: currentTheme?.colors?.textPrimary || (isDark ? '#f4f4f5' : '#111827'),
    outline: 'none',
    cursor: 'pointer'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="Auditoria e Rastreabilidade (M11)"
        subtitle="Trilha de Auditoria Imutável de Transações, Logs de Acessos, Modificações e Snapshot Diff"
        showSearchAndFilter={false}
        actions={[
          <Button
            key="refresh"
            variant="secondary"
            onClick={() => notify({ message: 'Logs de auditoria sincronizados em tempo real.', type: 'info' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} />
            Atualizar Trilha
          </Button>
        ]}
      />

      {/* SECTION EM LINHA DEDICADA A FILTROS */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          borderBottom: `1px solid ${currentTheme?.colors?.border || (isDark ? '#27272a' : '#e5e7eb')}`,
          backgroundColor: currentTheme?.colors?.surfaceMuted || (isDark ? '#18181b' : '#fafafa'),
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.375rem',
            border: `1px solid ${currentTheme?.colors?.border || (isDark ? '#3f3f46' : '#d1d5db')}`,
            backgroundColor: currentTheme?.colors?.input || (isDark ? '#27272a' : '#ffffff'),
            flex: '1 1 260px',
            minWidth: '220px'
          }}
        >
          <Search size={16} color={currentTheme?.colors?.textSecondary || '#6b7280'} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Usuário, IP, Tabela ou Ação..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.8125rem',
              width: '100%',
              color: currentTheme?.colors?.textPrimary || '#111827'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={moduloFilter}
          onChange={(e) => setModuloFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Módulo: Todos</option>
          <option value="M05_REGULACAO">M05 - Regulação Médica</option>
          <option value="M08_FINANCEIRO">M08 - Financeiro</option>
          <option value="M07_FATURAMENTO">M07 - Faturamento</option>
          <option value="M00_USUARIOS">M00 - Usuários</option>
        </select>

        <select
          value={acaoFilter}
          onChange={(e) => setAcaoFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="todos">Operação: Todas</option>
          <option value="INSERT">INSERT (Criação)</option>
          <option value="UPDATE">UPDATE (Alteração)</option>
          <option value="APROVACAO">APROVAÇÃO</option>
          <option value="EXEC_ROTINA">ROTINA BATCH</option>
        </select>

        {(searchQuery || moduloFilter !== 'todos' || acaoFilter !== 'todos') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setModuloFilter('todos'); setAcaoFilter('todos') }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: '500',
              border: `1px solid ${currentTheme?.colors?.border || '#d1d5db'}`,
              backgroundColor: 'transparent',
              color: currentTheme?.colors?.textSecondary,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <X size={14} />
            Limpar Filtros
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: currentTheme?.colors?.textSecondary }}>
          {filtered.length} eventos registrados
        </div>
      </section>

      {/* Tabela de Logs */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => handleOpenDetail(row)}
          emptyMessage="Nenhum log de auditoria encontrado."
        />
      </div>

      {/* Modal de Detalhes do Log (Diff JSON) */}
      {detailModalOpen && selectedLog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: currentTheme?.colors?.surface || (isDark ? '#18181b' : '#ffffff'),
            borderRadius: '0.5rem',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileJson size={20} color={currentTheme?.colors?.primary || '#2563eb'} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: currentTheme?.colors?.textPrimary }}>
                  Detalhes do Log de Auditoria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: currentTheme?.colors?.textSecondary }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ fontWeight: '600', color: currentTheme?.colors?.textSecondary, display: 'block' }}>Data/Hora:</span>
                  <span>{selectedLog.data_hora}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: currentTheme?.colors?.textSecondary, display: 'block' }}>Usuário / IP:</span>
                  <span>{selectedLog.usuario} ({selectedLog.ip})</span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: currentTheme?.colors?.textSecondary, display: 'block' }}>Módulo / Tabela:</span>
                  <span>{selectedLog.modulo} &gt; {selectedLog.tabela}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: currentTheme?.colors?.textSecondary, display: 'block' }}>Operação:</span>
                  <span style={{ fontWeight: '700' }}>{selectedLog.acao}</span>
                </div>
              </div>

              <div>
                <span style={{ fontWeight: '600', color: currentTheme?.colors?.textSecondary, fontSize: '0.8125rem', display: 'block' }}>Descrição:</span>
                <span style={{ fontSize: '0.875rem' }}>{selectedLog.descricao}</span>
              </div>

              <div>
                <span style={{ fontWeight: '600', color: currentTheme?.colors?.textSecondary, fontSize: '0.8125rem', display: 'block', marginBottom: '0.5rem' }}>
                  Snapshot Diff de Alterações (JSON):
                </span>
                <pre style={{
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: isDark ? '#09090b' : '#f4f4f5',
                  border: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}`,
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  color: currentTheme?.colors?.textPrimary || '#111827'
                }}>
                  {JSON.stringify(selectedLog.payload_diff, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${currentTheme?.colors?.border || '#3f3f46'}` }}>
                <Button type="button" onClick={() => setDetailModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
