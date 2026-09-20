// Arquivo: src/modules/prestadores/services/sheetsService.js
// Descrição: Serviço de dados para o módulo M04_PRESTADORES e M01_PESSOAS da Operadora de Planos de Saúde.
// Suporta leitura combinada, cadastro normalizado, edição, exclusão e sincronização via Google Sheets / UUIDv7.

import { generateUUIDv7 } from '@shared/utils/uuidv7'

/**
 * Recupera o ID da planilha das variáveis de ambiente (.env) ou do localStorage.
 */
export const getSpreadsheetId = () => {
  const envVal = (import.meta.env.VITE_GOOGLE_SHEETS_ID || '').trim()
  if (envVal !== '') return envVal
  return (localStorage.getItem('google_sheets_id') || '').trim()
}

/**
 * Recupera a chave de API do Google Sheets das variáveis de ambiente (.env) ou do localStorage.
 */
export const getApiKey = () => {
  const envVal = (import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '').trim()
  if (envVal !== '') return envVal
  return (localStorage.getItem('google_sheets_api_key') || '').trim()
}

/**
 * Recupera URL opcional do Google Apps Script das variáveis de ambiente (.env) ou do localStorage.
 */
export const getAppsScriptUrl = () => {
  const envVal = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim()
  if (envVal !== '') return envVal
  return (localStorage.getItem('google_apps_script_url') || '').trim()
}

/**
 * Recupera token OAuth de acesso (se disponível)
 */
export const getAccessToken = () => {
  return (localStorage.getItem('google_access_token') || '').trim()
}

/**
 * Atualiza configurações do Google Sheets em tempo de execução
 */
export const setSheetsConfig = ({ spreadsheetId, apiKey, appsScriptUrl }) => {
  if (spreadsheetId !== undefined) localStorage.setItem('google_sheets_id', spreadsheetId)
  if (apiKey !== undefined) localStorage.setItem('google_sheets_api_key', apiKey)
  if (appsScriptUrl !== undefined) localStorage.setItem('google_apps_script_url', appsScriptUrl)
}

/**
 * Chave de armazenamento local para persistência de prestadores da Operadora
 */
const PRESTADORES_STORAGE_KEY = 'prestadores_database_operadora_v1'

/**
 * Seed inicial com prestadores reais da operadora caso o banco local e remoto estejam vazios
 */
const SEED_PRESTADORES = []

/**
 * Obtém os registros locais de prestadores
 */
export const getLocalPrestadores = () => {
  try {
    const raw = localStorage.getItem(PRESTADORES_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Erro ao ler prestadores do armazenamento local:', e)
    return []
  }
}

/**
 * Salva a lista de prestadores no armazenamento local
 */
export const saveLocalPrestadores = (list) => {
  try {
    localStorage.setItem(PRESTADORES_STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Erro ao salvar prestadores no armazenamento local:', e)
  }
}

/**
 * Metadados da planilha: busca todas as abas existentes na planilha Google.
 */
export const fetchSpreadsheetMetadata = async () => {
  const spreadsheetId = getSpreadsheetId()
  const apiKey = getApiKey()

  if (!spreadsheetId) {
    return { 
      error: 'ID da planilha não configurado.', 
      sheets: [] 
    }
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      return { 
        error: data.error.message, 
        sheets: [],
        title: 'Planilha'
      }
    }

    const sheets = (data.sheets || []).map(s => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId,
      index: s.properties.index,
      rowCount: s.properties.gridProperties?.rowCount,
      columnCount: s.properties.gridProperties?.columnCount
    }))

    localStorage.setItem('sheets_available_tabs', JSON.stringify(sheets.map(s => s.title)))

    return {
      title: data.properties?.title || 'Planilha do Sistema',
      sheets,
      raw: data
    }
  } catch (err) {
    console.error('Erro ao buscar metadados da planilha:', err)
    return { error: err.message, sheets: [] }
  }
}

/**
 * Busca prestadores unificando a leitura relacional de M04_PRESTADORES e M01_PESSOAS.
 * Faz merge inteligente com o banco local garantindo resposta imediata e integridade regulatória.
 */
export const fetchPrestadoresFromSheets = async () => {
  const spreadsheetId = getSpreadsheetId()
  const apiKey = getApiKey()
  const localData = getLocalPrestadores()

  // Se não houver chaves de planilha, utiliza a persistência local
  if (!spreadsheetId || !apiKey) {
    return {
      data: localData,
      headers: [],
      isMock: false,
      source: 'local'
    }
  }

  try {
    // Busca conjunta via batchGet para M04_PRESTADORES e M01_PESSOAS
    const ranges = ['M04_PRESTADORES!A:Z', 'M01_PESSOAS!A:Z', 'M04_PRESTADORES_ESPECIALIDADES!A:Z']
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?key=${apiKey}&` +
      ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&')

    const response = await fetch(batchUrl)
    const json = await response.json()

    if (json.error) {
      console.warn('Google Sheets API retornou erro:', json.error.message)
      return { data: localData, isMock: false, error: json.error.message, source: 'local' }
    }

    const valueRanges = json.valueRanges || []
    const prestadoresRange = valueRanges.find(v => (v.range || '').includes('M04_PRESTADORES'))
    const pessoasRange = valueRanges.find(v => (v.range || '').includes('M01_PESSOAS'))
    const especRange = valueRanges.find(v => (v.range || '').includes('M04_PRESTADORES_ESPECIALIDADES'))

    const prestadoresRows = prestadoresRange?.values || []
    const pessoasRows = pessoasRange?.values || []
    const especRows = especRange?.values || []

    // Se as abas na planilha ainda não possuem linhas de dados (somente cabeçalho)
    if (prestadoresRows.length <= 1) {
      return { data: localData, isMock: false, source: 'local_fallback' }
    }

    // Mapeamento de pessoas por id
    const pessoasMap = new Map()
    if (pessoasRows.length > 1) {
      const [pHeaders, ...pData] = pessoasRows
      const cleanPHeaders = pHeaders.map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_'))
      
      pData.forEach(row => {
        const pObj = {}
        cleanPHeaders.forEach((h, idx) => {
          pObj[h] = row[idx] || ''
        })
        if (pObj.id) {
          pessoasMap.set(String(pObj.id).trim().toLowerCase(), pObj)
        }
      })
    }

    // Mapeamento de especialidades por id_prestador
    const especMap = new Map()
    if (especRows.length > 1) {
      const [eHeaders, ...eData] = especRows
      const cleanEHeaders = eHeaders.map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_'))
      eData.forEach(row => {
        const eObj = {}
        cleanEHeaders.forEach((h, idx) => {
          eObj[h] = row[idx] || ''
        })
        if (eObj.id_prestador) {
          especMap.set(String(eObj.id_prestador).trim().toLowerCase(), eObj)
        }
      })
    }

    // Mapeamento de prestadores unificado
    const [prestHeaders, ...prestData] = prestadoresRows
    const cleanHeaders = prestHeaders.map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_'))

    const remotePrestadores = prestData.map((row, idx) => {
      const pr = {}
      cleanHeaders.forEach((h, colIdx) => {
        pr[h] = row[colIdx] || ''
      })

      const pessoaId = String(pr.id_pessoa || '').trim().toLowerCase()
      const pessoa = pessoasMap.get(pessoaId) || {}
      const prestId = String(pr.id || '').trim().toLowerCase()
      const espec = especMap.get(prestId) || {}

      return {
        id: pr.id || generateUUIDv7(),
        id_pessoa: pr.id_pessoa || pessoa.id || generateUUIDv7(),
        tipo_pessoa: pessoa.tipo_pessoa || (pr.tipo_prestador === 'MÉDICO' ? 'FÍSICA' : 'JURÍDICA'),
        nome_razao_social: pessoa.nome_razao_social || pr.nome_razao_social || `PRESTADOR #${idx + 1}`,
        nome_fantasia: pessoa.nome_fantasia || pr.nome_fantasia || '',
        nome: pessoa.nome_razao_social || pessoa.nome_fantasia || pr.nome_razao_social || `PRESTADOR #${idx + 1}`,
        cpf_cnpj: pessoa.cpf_cnpj || '',
        data_nascimento_fundacao: pessoa.data_nascimento_fundacao || '',
        sexo: pessoa.sexo || '',
        nome_mae: pessoa.nome_mae || '',
        email_principal: pessoa.email_principal || '',
        telefone_principal: pessoa.telefone_principal || '',
        inscricao_estadual: pessoa.inscricao_estadual || '',
        inscricao_municipal: pessoa.inscricao_municipal || '',
        tipo_prestador: (pr.tipo_prestador || 'CLÍNICA').toUpperCase(),
        conselho_profissional: pr.conselho_profissional || '',
        numero_conselho: pr.numero_conselho || '',
        uf_conselho: pr.uf_conselho || '',
        cbos: pr.cbos || '',
        codigo_operadora_prestador: pr.codigo_operadora_prestador || `RDA-${1000 + idx}`,
        cnes_principal: pr.cnes_principal || '',
        regime_tributario: pr.regime_tributario || '',
        status_credenciamento: (pr.status_credenciamento || 'ATIVO').toUpperCase(),
        data_credenciamento: pr.data_credenciamento || '',
        data_descredenciamento: pr.data_descredenciamento || '',
        especialidade: espec.codigo_especialidade || pr.especialidade || '',
        rqe: espec.rqe || pr.rqe || '',
        municipio: pessoa.municipio || pr.municipio || pr.cidade || '',
        cidade: pessoa.municipio || pr.cidade || pr.municipio || '',
        uf: pr.uf_conselho || pessoa.uf || pr.uf || '',
        logradouro: pr.logradouro || '',
        numero: pr.numero || '',
        complemento: pr.complemento || '',
        bairro: pr.bairro || '',
        cep: pr.cep || '',
        created_at: pr.created_at || pessoa.created_at || new Date().toISOString(),
        updated_at: pr.updated_at || new Date().toISOString()
      }
    })

    // Merge: prestadores criados localmente que ainda não estão na planilha
    const remoteIdSet = new Set(remotePrestadores.map(p => String(p.id).toLowerCase()))
    const localPending = localData.filter(p => !remoteIdSet.has(String(p.id).toLowerCase()))

    const merged = [...localPending, ...remotePrestadores]
    saveLocalPrestadores(merged)

    return {
      data: merged,
      headers: cleanHeaders.map(k => ({ key: k, original: k })),
      isMock: false,
      source: 'sheets'
    }
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error)
    return {
      data: localData,
      isMock: false,
      error: error.message,
      source: 'local_fallback'
    }
  }
}

/**
 * Função unificada de consulta de abas
 */
export const fetchFromSheets = async (range = 'M04_PRESTADORES!A:Z') => {
  if (range.toUpperCase().includes('PRESTADOR')) {
    return fetchPrestadoresFromSheets()
  }

  const spreadsheetId = getSpreadsheetId()
  const apiKey = getApiKey()

  if (spreadsheetId && apiKey) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
      const response = await fetch(url)
      const data = await response.json()

      if (!data.error && data.values && data.values.length > 0) {
        const [headers, ...rows] = data.values
        const cleanHeaders = headers.map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_'))
        const mapped = rows.map(row => {
          const obj = {}
          cleanHeaders.forEach((h, idx) => {
            obj[h] = row[idx] || ''
          })
          return obj
        })
        return { data: mapped, headers: cleanHeaders, isMock: false }
      }
    } catch (e) {
      console.warn(`Aba auxiliar ${range} não pôde ser lida:`, e)
    }
  }

  return { data: getAuxiliaryReferenceData(range), isMock: false }
}

/**
 * Salva (cadastra ou edita) um prestador de acordo com o padrão relacional Operadora ANS:
 * Normaliza e grava as entidades M04_PRESTADORES e M01_PESSOAS com chave UUIDv7.
 */
export const savePrestadorToSheets = async (prestadorData) => {
  const isNew = !prestadorData.id || String(prestadorData.id).trim() === ''
  const prestadorId = isNew ? generateUUIDv7() : String(prestadorData.id)
  const pessoaId = prestadorData.id_pessoa && String(prestadorData.id_pessoa).trim() !== '' 
    ? String(prestadorData.id_pessoa) 
    : generateUUIDv7()

  const now = new Date().toISOString()

  // Entidade consolidada para visualização rápida no app
  const unifiedPrestador = {
    ...prestadorData,
    id: prestadorId,
    id_pessoa: pessoaId,
    tipo_pessoa: (prestadorData.tipo_pessoa || (prestadorData.tipo_prestador === 'MÉDICO' ? 'FÍSICA' : 'JURÍDICA')).toUpperCase(),
    nome_razao_social: (prestadorData.nome_razao_social || prestadorData.nome || '').trim().toUpperCase(),
    nome_fantasia: (prestadorData.nome_fantasia || '').trim().toUpperCase(),
    nome: (prestadorData.nome_razao_social || prestadorData.nome || '').trim().toUpperCase(),
    cpf_cnpj: (prestadorData.cpf_cnpj || '').trim(),
    data_nascimento_fundacao: prestadorData.data_nascimento_fundacao || '',
    sexo: prestadorData.sexo || '',
    nome_mae: (prestadorData.nome_mae || '').trim().toUpperCase(),
    email_principal: (prestadorData.email_principal || '').trim().toLowerCase(),
    telefone_principal: (prestadorData.telefone_principal || '').trim(),
    inscricao_estadual: (prestadorData.inscricao_estadual || '').trim(),
    inscricao_municipal: (prestadorData.inscricao_municipal || '').trim(),
    tipo_prestador: (prestadorData.tipo_prestador || 'CLÍNICA').trim().toUpperCase(),
    conselho_profissional: (prestadorData.conselho_profissional || '').trim().toUpperCase(),
    numero_conselho: (prestadorData.numero_conselho || '').trim(),
    uf_conselho: (prestadorData.uf_conselho || '').trim().toUpperCase(),
    cbos: (prestadorData.cbos || '').trim().toUpperCase(),
    codigo_operadora_prestador: (prestadorData.codigo_operadora_prestador || `RDA-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase(),
    cnes_principal: (prestadorData.cnes_principal || '').trim(),
    regime_tributario: (prestadorData.regime_tributario || 'SIMPLES NACIONAL').trim().toUpperCase(),
    status_credenciamento: (prestadorData.status_credenciamento || 'ATIVO').trim().toUpperCase(),
    data_credenciamento: prestadorData.data_credenciamento || now.slice(0, 10),
    data_descredenciamento: prestadorData.data_descredenciamento || '',
    especialidade: (prestadorData.especialidade || '').trim().toUpperCase(),
    rqe: (prestadorData.rqe || '').trim(),
    logradouro: (prestadorData.logradouro || '').trim().toUpperCase(),
    numero: (prestadorData.numero || '').trim().toUpperCase(),
    complemento: (prestadorData.complemento || '').trim().toUpperCase(),
    bairro: (prestadorData.bairro || '').trim().toUpperCase(),
    municipio: (prestadorData.municipio || prestadorData.cidade || '').trim().toUpperCase(),
    cidade: (prestadorData.cidade || prestadorData.municipio || '').trim().toUpperCase(),
    uf: (prestadorData.uf || prestadorData.uf_conselho || '').trim().toUpperCase(),
    cep: (prestadorData.cep || '').trim(),
    updated_at: now,
    created_at: prestadorData.created_at || now
  }

  // 1. Atualiza persistência local imediatamente
  const currentList = getLocalPrestadores()
  const idx = currentList.findIndex(p => String(p.id).toLowerCase() === prestadorId.toLowerCase())
  
  let updatedList = []
  if (idx >= 0) {
    updatedList = [...currentList]
    updatedList[idx] = { ...updatedList[idx], ...unifiedPrestador }
  } else {
    updatedList = [unifiedPrestador, ...currentList]
  }
  saveLocalPrestadores(updatedList)

  // 2. Sincronização remota via Webhook (Google Apps Script) ou Google Sheets API
  const appsScriptUrl = getAppsScriptUrl()
  const spreadsheetId = getSpreadsheetId()
  const accessToken = getAccessToken()
  const apiKey = getApiKey()

  let syncedToGoogleSheets = false
  let syncError = null

  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          action: isNew ? 'insert' : 'update',
          table: 'M04_PRESTADORES',
          data: {
            prestador: {
              id: prestadorId,
              id_pessoa: pessoaId,
              tipo_prestador: unifiedPrestador.tipo_prestador,
              conselho_profissional: unifiedPrestador.conselho_profissional,
              numero_conselho: unifiedPrestador.numero_conselho,
              uf_conselho: unifiedPrestador.uf_conselho,
              cbos: unifiedPrestador.cbos,
              codigo_operadora_prestador: unifiedPrestador.codigo_operadora_prestador,
              cnes_principal: unifiedPrestador.cnes_principal,
              regime_tributario: unifiedPrestador.regime_tributario,
              status_credenciamento: unifiedPrestador.status_credenciamento,
              data_credenciamento: unifiedPrestador.data_credenciamento,
              data_descredenciamento: unifiedPrestador.data_descredenciamento,
              id_pessoa_conta_bancaria_pagamento: '',
              created_at: unifiedPrestador.created_at,
              updated_at: unifiedPrestador.updated_at
            },
            pessoa: {
              id: pessoaId,
              tipo_pessoa: unifiedPrestador.tipo_pessoa,
              cpf_cnpj: unifiedPrestador.cpf_cnpj,
              nome_razao_social: unifiedPrestador.nome_razao_social,
              nome_fantasia: unifiedPrestador.nome_fantasia,
              data_nascimento_fundacao: unifiedPrestador.data_nascimento_fundacao,
              sexo: unifiedPrestador.sexo,
              nome_mae: unifiedPrestador.nome_mae,
              email_principal: unifiedPrestador.email_principal,
              telefone_principal: unifiedPrestador.telefone_principal,
              inscricao_estadual: unifiedPrestador.inscricao_estadual,
              inscricao_municipal: unifiedPrestador.inscricao_municipal,
              ativo: unifiedPrestador.status_credenciamento === 'ATIVO' ? 'SIM' : 'NÃO',
              created_at: unifiedPrestador.created_at,
              updated_at: unifiedPrestador.updated_at
            }
          }
        })
      })
      syncedToGoogleSheets = true
    } catch (err) {
      console.warn('Erro ao sincronizar via Apps Script Webhook:', err)
      syncError = err.message
    }
  }

  // Se houver autorização para Google Sheets direto (append na aba M04_PRESTADORES e M01_PESSOAS)
  if (!syncedToGoogleSheets && spreadsheetId && (accessToken || apiKey)) {
    try {
      // Linha padronizada de M04_PRESTADORES
      const rowPrestador = [
        prestadorId,
        pessoaId,
        unifiedPrestador.tipo_prestador,
        unifiedPrestador.conselho_profissional,
        unifiedPrestador.numero_conselho,
        unifiedPrestador.uf_conselho,
        unifiedPrestador.cbos,
        unifiedPrestador.codigo_operadora_prestador,
        unifiedPrestador.cnes_principal,
        unifiedPrestador.regime_tributario,
        unifiedPrestador.status_credenciamento,
        unifiedPrestador.data_credenciamento,
        unifiedPrestador.data_descredenciamento,
        '', // id_pessoa_conta_bancaria_pagamento
        unifiedPrestador.created_at,
        unifiedPrestador.updated_at
      ]

      // Linha padronizada de M01_PESSOAS
      const rowPessoa = [
        pessoaId,
        unifiedPrestador.tipo_pessoa,
        unifiedPrestador.cpf_cnpj,
        unifiedPrestador.nome_razao_social,
        unifiedPrestador.nome_fantasia,
        unifiedPrestador.data_nascimento_fundacao,
        unifiedPrestador.sexo,
        unifiedPrestador.nome_mae,
        unifiedPrestador.email_principal,
        unifiedPrestador.telefone_principal,
        unifiedPrestador.inscricao_estadual,
        unifiedPrestador.inscricao_municipal,
        unifiedPrestador.status_credenciamento === 'ATIVO' ? 'SIM' : 'NÃO',
        unifiedPrestador.created_at,
        unifiedPrestador.updated_at
      ]

      const reqHeaders = { 'Content-Type': 'application/json' }
      if (accessToken) reqHeaders['Authorization'] = `Bearer ${accessToken}`

      const appendUrlP = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/M04_PRESTADORES!A:Z:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS${apiKey ? `&key=${apiKey}` : ''}`
      const appendUrlE = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/M01_PESSOAS!A:Z:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS${apiKey ? `&key=${apiKey}` : ''}`

      await Promise.allSettled([
        fetch(appendUrlP, { method: 'POST', headers: reqHeaders, body: JSON.stringify({ values: [rowPrestador] }) }),
        fetch(appendUrlE, { method: 'POST', headers: reqHeaders, body: JSON.stringify({ values: [rowPessoa] }) })
      ])
      syncedToGoogleSheets = true
    } catch (err) {
      console.warn('Erro ao gravar direto na planilha Sheets:', err)
      syncError = err.message
    }
  }

  return {
    success: true,
    id: prestadorId,
    prestador: unifiedPrestador,
    syncedToGoogleSheets,
    syncError,
    message: isNew 
      ? `Prestador ${unifiedPrestador.nome_razao_social} cadastrado com sucesso (UUIDv7: ${prestadorId.slice(0, 8)}...).`
      : `Prestador ${unifiedPrestador.nome_razao_social} atualizado com sucesso.`
  }
}

/**
 * Exclui um prestador do banco de dados e notifica sincronização
 */
export const deletePrestadorFromSheets = async (id) => {
  const currentLocal = getLocalPrestadores()
  const updated = currentLocal.filter(p => String(p.id).toLowerCase() !== String(id).toLowerCase())
  saveLocalPrestadores(updated)

  const appsScriptUrl = getAppsScriptUrl()
  if (appsScriptUrl) {
    try {
      fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'delete',
          table: 'M04_PRESTADORES',
          id
        })
      }).catch(() => {})
    } catch (e) {
      console.warn('Erro ao notificar exclusão via Apps Script:', e)
    }
  }

  return { success: true }
}

/**
 * Sincroniza todas as abas regulatórias do ecossistema da Operadora
 */
export const syncAllSheetsFromGoogle = async () => {
  const metadata = await fetchSpreadsheetMetadata()
  const results = {
    metadata,
    syncedTabs: [],
    prestadoresCount: 0,
    errors: []
  }

  if (metadata.error) {
    results.errors.push(metadata.error)
  }

  const tabsToFetch = metadata.sheets?.length > 0
    ? metadata.sheets.map(s => s.title).filter(t => t.startsWith('M0') || t.startsWith('M1'))
    : ['M00_OPERADORA', 'M01_PESSOAS', 'M04_PRESTADORES', 'M04_PRESTADORES_ESPECIALIDADES']

  for (const tabName of tabsToFetch) {
    try {
      const res = await fetchFromSheets(`${tabName}!A:Z`)
      results.syncedTabs.push({
        tab: tabName,
        rowCount: res.data?.length || 0
      })
      if (tabName.includes('PRESTADOR')) {
        results.prestadoresCount = res.data?.length || 0
      }
    } catch (err) {
      results.errors.push(`Erro na aba ${tabName}: ${err.message}`)
    }
  }

  return results
}

/**
 * Dados de referência auxiliares para Especialidades, Tipos e Conselhos
 */
const getAuxiliaryReferenceData = (range) => {
  if (range.includes('CIDADES') || range.includes('MUNICIPIOS')) {
    return [
      { id: '1', nome: 'SÃO PAULO', uf: 'SP', codigo_ibge: '3550308' },
      { id: '2', nome: 'CAMPINAS', uf: 'SP', codigo_ibge: '3509502' },
      { id: '3', nome: 'RIO DE JANEIRO', uf: 'RJ', codigo_ibge: '3304557' },
      { id: '4', nome: 'BELO HORIZONTE', uf: 'MG', codigo_ibge: '3106200' },
      { id: '5', nome: 'CURITIBA', uf: 'PR', codigo_ibge: '4106902' },
      { id: '6', nome: 'PORTO ALEGRE', uf: 'RS', codigo_ibge: '4314902' },
      { id: '7', nome: 'BRASÍLIA', uf: 'DF', codigo_ibge: '5300108' },
      { id: '8', nome: 'CUIABÁ', uf: 'MT', codigo_ibge: '5103403' },
      { id: '9', nome: 'SALVADOR', uf: 'BA', codigo_ibge: '2927408' }
    ]
  }

  if (range.includes('ESTADOS')) {
    return [
      { sigla: 'SP', nome: 'SÃO PAULO' },
      { sigla: 'RJ', nome: 'RIO DE JANEIRO' },
      { sigla: 'MG', nome: 'MINAS GERAIS' },
      { sigla: 'PR', nome: 'PARANÁ' },
      { sigla: 'RS', nome: 'RIO GRANDE DO SUL' },
      { sigla: 'DF', nome: 'DISTRITO FEDERAL' },
      { sigla: 'MT', nome: 'MATO GROSSO' },
      { sigla: 'GO', nome: 'GOIÁS' },
      { sigla: 'BA', nome: 'BAHIA' },
      { sigla: 'SC', nome: 'SANTA CATARINA' }
    ]
  }

  return []
}
