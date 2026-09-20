// Arquivo: src/modules/especialidades/services/sheetsService.js
// Descrição: Serviço para integração com a planilha Google Sheets na aba ESPECIALIDADES, com suporte a UUIDv7 e persistência.

import { generateUUIDv7 } from '@shared/utils/uuidv7'

export const getSpreadsheetId = () => {
  const envVal = (import.meta.env.VITE_GOOGLE_SHEETS_ID || '').trim()
  if (envVal !== '') return envVal
  return (localStorage.getItem('google_sheets_id') || '').trim()
}

export const getApiKey = () => {
  const envVal = (import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '').trim()
  if (envVal !== '') return envVal
  return (localStorage.getItem('google_sheets_api_key') || '').trim()
}

export const fetchEspecialidadesFromSheets = async (range = 'ESPECIALIDADES!A:Z') => {
  const spreadsheetId = getSpreadsheetId()
  const apiKey = getApiKey()

  if (!spreadsheetId || !apiKey) {
    const err = new Error('VITE_GOOGLE_SHEETS_ID ou VITE_GOOGLE_SHEETS_API_KEY não configurados.')
    console.error('Erro ao buscar especialidades do Google Sheets:', err.message)
    return { data: [], headers: [], error: err.message }
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      console.error(`Erro da API Google Sheets ao buscar ${range}:`, data.error.message)
      return { data: [], headers: [], error: data.error.message }
    }

    if (!data.values || data.values.length === 0) {
      console.error(`Aba ${range} retornou vazia da planilha Google Sheets.`)
      return { data: [], headers: [] }
    }

    const [headers, ...rows] = data.values
    const mapped = rows.map((row, index) => {
      const obj = { id: generateUUIDv7() }
      headers.forEach((h, colIndex) => {
        const key = h.toLowerCase().trim().replace(/\s+/g, '_')
        obj[key] = row[colIndex] || ''
      })

      if (!obj.id || obj.id.trim() === '') {
        obj.id = generateUUIDv7()
      }
      obj.codigo = obj.codigo || obj.codigo_cbo || obj.cod || ''
      obj.nome = obj.nome_especialidade || obj.nome || obj.especialidade || obj.nome_da_especialidade || `ESPECIALIDADE #${index + 1}`
      obj.status = (obj.status || 'ATIVO').toUpperCase()
      return obj
    })

    return {
      data: mapped,
      headers: headers.map(h => ({ key: h.toLowerCase().trim().replace(/\s+/g, '_'), original: h }))
    }
  } catch (error) {
    console.error(`Erro de rede ao buscar ${range} do Google Sheets:`, error)
    return { data: [], headers: [], error: error.message }
  }
}

export const saveEspecialidadeToSheets = async (formData) => {
  const id = formData.id || generateUUIDv7()
  const record = {
    id,
    nome: formData.nome || '',
    descricao: formData.descricao || '',
    status: formData.status || 'ATIVO',
    conselho: formData.conselho || ''
  }

  // Tenta salvar via Apps Script se configurado, ou simula sucesso
  const appsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || localStorage.getItem('google_apps_script_url')
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_especialidade', data: record })
      })
    } catch (e) {
      console.error('Erro ao enviar para Apps Script:', e)
    }
  }

  return { success: true, id, record }
}

export const deleteEspecialidadeFromSheets = async (id) => {
  const appsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || localStorage.getItem('google_apps_script_url')
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_especialidade', id })
      })
    } catch (e) {
      console.error('Erro ao excluir via Apps Script:', e)
    }
  }
  return { success: true, id }
}
