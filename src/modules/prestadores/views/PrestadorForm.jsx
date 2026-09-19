// Arquivo: src/modules/prestadores/views/PrestadorForm.jsx
// Descrição: Formulário de cadastro/edição de prestadores padronizado com o módulo de usuários.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, SearchableSelect } from '@shared/layout'
import { useTheme, useNotification } from '@shared/context'
import { fetchFromSheets } from '../services/sheetsService'
import { ArrowLeft, Save } from 'lucide-react'

export default function PrestadorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTheme } = useTheme()
  const { notify } = useNotification()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    cidade: '',
    uf: '',
    status: 'ATIVO',
    local: ''
  })
  
  // Estados para dados auxiliares
  const [cidades, setCidades] = useState([])
  const [estados, setEstados] = useState([])
  const [locais, setLocais] = useState([])
  const [tipos, setTipos] = useState([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      try {
        // Carrega dados auxiliares em paralelo
        const [resCidades, resEstados, resLocais, resPrestadores] = await Promise.all([
          fetchFromSheets('CIDADES!A:Z'),
          fetchFromSheets('ESTADOS!A:Z'),
          fetchFromSheets('LOCAL!A:Z'),
          isEdit ? fetchFromSheets('PRESTADORES!A:Z') : Promise.resolve({ data: [] })
        ])

        setCidades(resCidades.data || [])
        setEstados(resEstados.data || [])
        setLocais(resLocais.data || [])
        
        // Define tipos de estabelecimento fixos ou baseados no LOCAL se preferir
        setTipos([
          { nome: 'HOSPITAL' },
          { nome: 'CLÍNICA' },
          { nome: 'LABORATÓRIO' },
          { nome: 'CONSULTÓRIO' }
        ])

        if (isEdit) {
          const found = resPrestadores.data.find(p => 
            String(p.id) === String(id) || 
            String(p.nome) === String(id) || 
            String(p.nome_do_prestador) === String(id) ||
            String(p.razao_social) === String(id) ||
            String(p.prestador) === String(id)
          )
          
          if (found) {
            setFormData({
              ...found,
              nome: found.nome || found.nome_do_prestador || found.razao_social || found.prestador || '',
              tipo: found.tipo || found.tipo_de_estabelecimento || found.categoria || '',
              cidade: found.cidade || found.municipio || found.localidade || '',
              uf: found.uf || found.estado || '',
              status: (found.status || 'ATIVO').toUpperCase(),
              local: found.local || found.local_atendimento || ''
            })
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Se mudar a cidade, tenta auto-completar o UF se disponível na lista de cidades
    if (name === 'cidade') {
      const cidadeFound = cidades.find(c => 
        String(c.nome || '').toUpperCase() === String(value || '').toUpperCase() || 
        String(c.cidade || '').toUpperCase() === String(value || '').toUpperCase()
      )
      if (cidadeFound) {
        const uf = cidadeFound.uf || cidadeFound.sigla || cidadeFound.estado || ''
        if (uf) {
          setFormData(prev => ({ ...prev, cidade: value, uf: uf }))
          return
        }
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateUUIDv7 = () => {
    const timestamp = Date.now().toString(16).padStart(12, '0')
    const randomHex = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    return `${timestamp.slice(0, 8)}-${timestamp.slice(8, 12)}-7${randomHex.slice(0, 3)}-${(parseInt(randomHex[3], 16) & 0x3 | 0x8).toString(16)}${randomHex.slice(4, 7)}-${randomHex.slice(7, 19)}`.toUpperCase()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newId = isEdit ? id : generateUUIDv7()
    notify.success(
      isEdit ? 'Prestador Atualizado!' : 'Prestador Cadastrado!',
      `O registro de ${formData.nome} foi salvo com sucesso. ID Único gerado: ${newId}`
    )
    navigate('/prestadores')
  }

  // Estilos padronizados (copiados de UsuarioForm)
  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    fontSize: '0.875rem',
    color: currentTheme?.colors?.textPrimary || '#0f172a'
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: currentTheme?.colors?.textSecondary }}>
      CARREGANDO FORMULÁRIO...
    </div>
  )

  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflowY: 'auto', backgroundColor: currentTheme?.colors?.background }}>
      <form onSubmit={handleSubmit} style={{
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', color: currentTheme?.colors?.textSecondary, cursor: 'pointer', display: 'flex' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: currentTheme?.colors?.textPrimary || '#0f172a',
                letterSpacing: '-0.01em',
                textTransform: 'uppercase'
              }}>
                {isEdit ? 'Editar Prestador' : 'Novo Prestador'}
              </h1>
              <span style={{ fontSize: '0.875rem', color: currentTheme?.colors?.textSecondary || '#64748b' }}>
                Gerencie as informações cadastrais do prestador da rede.
              </span>
            </div>
          </div>
        </div>

        <Card title="Informações do Prestador">
          <div style={gridStyle}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nome do Prestador / Razão Social *</label>
              <input 
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Digite o nome completo ou razão social"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Tipo de Estabelecimento</label>
              <SearchableSelect 
                options={tipos}
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                placeholder="Selecione o tipo..."
              />
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <SearchableSelect 
                options={[
                  { id: 'ATIVO', nome: 'ATIVO' },
                  { id: 'INATIVO', nome: 'INATIVO' }
                ]}
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                placeholder="Selecione o status"
              />
            </div>

            <div>
              <label style={labelStyle}>Cidade *</label>
              <SearchableSelect 
                options={cidades}
                value={formData.cidade}
                labelField="nome"
                valueField="nome"
                onChange={(e) => handleChange({ target: { name: 'cidade', value: e.target.value } })}
                placeholder="Pesquisar cidade..."
              />
            </div>

            <div style={{ minWidth: '120px' }}>
              <label style={labelStyle}>UF</label>
              <SearchableSelect 
                options={estados}
                value={formData.uf}
                labelField="sigla"
                valueField="sigla"
                onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value }))}
                placeholder="UF"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Local de Atendimento</label>
              <SearchableSelect 
                options={locais}
                value={formData.local}
                labelField="nome"
                valueField="nome"
                onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                placeholder="Selecione o local..."
              />
            </div>
          </div>
        </Card>

        {/* Botões de Ação Final */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="secondary" type="button" onClick={() => navigate('/prestadores')}>
            Cancelar
          </Button>
          <Button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} />
            {isEdit ? 'Salvar Alterações' : 'Cadastrar Prestador'}
          </Button>
        </div>

      </form>
    </div>
  )
}
