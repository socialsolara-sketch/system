// Arquivo: src/shared/services/googleSheetsService.js
// Descrição: Operações na API do Google Sheets para criação e manipulação da aba USUARIOS.

import { getAccessToken } from './googleAuthService'
import mockUsuariosData from '../../modules/usuario/data/mockUsuarios'

export const DEFAULT_SPREADSHEET_ID = '1136QV5AhCJoD8gNy8UXzGu8yfLFKyV_c1dY0RKo858M'

/**
 * Cabeçalhos padronizados da Linha 1 para a aba USUARIOS.
 */
export const USUARIOS_HEADERS = [
  'ID',
  'CODIGO_CARTEIRINHA',
  'NOME_COMPLETO',
  'CPF',
  'RG',
  'ORGAO_EMISSOR_RG',
  'CNS',
  'DATA_NASCIMENTO',
  'SEXO',
  'NOME_MAE',
  'ESTADO_CIVIL',
  'TIPO_BENEFICIARIO',
  'ID_TITULAR',
  'GRAU_PARENTESCO',
  'NUMERO_CONTRATO',
  'TIPO_CONTRATO',
  'ESTIPULANTE_NOME',
  'ESTIPULANTE_CNPJ',
  'SEGMENTACAO_ASSISTENCIAL',
  'TIPO_COBERTURA',
  'TIPO_ACOMODACAO',
  'REGISTRO_ANS_PLANO',
  'NOME_COMERCIAL_PLANO',
  'ID_PLANO',
  'SITUACAO_CADASTRAL',
  'DATA_ADESAO',
  'DATA_CANCELAMENTO',
  'MOTIVO_CANCELAMENTO',
  'CPT_INDICADOR',
  'INICIO_CARENCIA_CONTRATUAL',
  'FIM_CARENCIA_CONTRATUAL',
  'FIM_CARENCIA_CONSULTAS',
  'FIM_CARENCIA_EXAMES',
  'FIM_CARENCIA_INTERNACAO',
  'FIM_CARENCIA_PARTO',
  'EMAIL',
  'TELEFONE_CELULAR',
  'CEP',
  'LOGRADOURO',
  'NUMERO',
  'COMPLEMENTO',
  'BAIRRO',
  'CIDADE',
  'UF',
  'CREATED_AT',
  'UPDATED_AT'
]

/**
 * Verifica as abas existentes na planilha.
 */
export const getSpreadsheetMetadata = async (spreadsheetId = DEFAULT_SPREADSHEET_ID, token = null) => {
  const authToken = token || getAccessToken()
  const headers = {}
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`
  const response = await fetch(url, { headers })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Erro ao consultar planilha: HTTP ${response.status}`)
  }
  return await response.json()
}

/**
 * Cria a aba USUARIOS na planilha Google e define a Linha 1 com os cabeçalhos relacionais.
 */
export const createUsuariosSheet = async (options = {}) => {
  const spreadsheetId = options.spreadsheetId || DEFAULT_SPREADSHEET_ID
  const token = options.token || getAccessToken()

  if (!token) {
    throw new Error('Token de autorização do Google Sheets não disponível. Faça login com o Google primeiro.')
  }

  // 1. Verificar se a aba USUARIOS já existe
  const metadata = await getSpreadsheetMetadata(spreadsheetId, token)
  const existingSheet = metadata.sheets?.find(
    (s) => s.properties?.title?.toUpperCase() === 'USUARIOS'
  )

  let sheetId = null

  if (!existingSheet) {
    // 2. Criar a nova aba via batchUpdate
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`
    const batchResponse = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: 'USUARIOS',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: USUARIOS_HEADERS.length + 4
                },
                tabColor: {
                  red: 0.15,
                  green: 0.45,
                  blue: 0.85
                }
              }
            }
          }
        ]
      })
    })

    if (!batchResponse.ok) {
      const errorData = await batchResponse.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Falha ao criar a aba USUARIOS.')
    }

    const batchData = await batchResponse.json()
    sheetId = batchData.replies?.[0]?.addSheet?.properties?.sheetId
  } else {
    sheetId = existingSheet.properties.sheetId
  }

  // 3. Gravar a Linha 1 (Cabeçalhos) na aba USUARIOS
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/USUARIOS!A1:ZZ1?valueInputOption=USER_ENTERED`
  const valuesResponse = await fetch(valuesUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'USUARIOS!A1:ZZ1',
      majorDimension: 'ROWS',
      values: [USUARIOS_HEADERS]
    })
  })

  if (!valuesResponse.ok) {
    const errorData = await valuesResponse.json().catch(() => ({}))
    throw new Error(errorData.error?.message || 'Falha ao gravar os cabeçalhos na aba USUARIOS.')
  }

  // 4. Opcionalmente popular dados iniciais se solicitado
  let insertedCount = 0
  if (options.populateInitialData && mockUsuariosData && mockUsuariosData.length > 0) {
    const rows = mockUsuariosData.map((user) => [
      user.id || '',
      user.codigo_carteirinha || '',
      user.nome_completo || '',
      user.cpf || '',
      user.rg || '',
      user.orgao_emissor_rg || '',
      user.cns || '',
      user.data_nascimento || '',
      user.sexo || '',
      user.nome_mae || '',
      user.estado_civil || '',
      user.tipo_beneficiario || '',
      user.id_titular || '',
      user.grau_parentesco || '',
      user.numero_contrato || '',
      user.tipo_contrato || '',
      user.estipulante_nome || '',
      user.estipulante_cnpj || '',
      user.segmentacao_assistencial || '',
      user.tipo_cobertura || '',
      user.tipo_acomodacao || '',
      user.registro_ans_plano || '',
      user.nome_comercial_plano || '',
      user.id_plano || '',
      user.situacao_cadastral || '',
      user.data_adesao || '',
      user.data_cancelamento || '',
      user.motivo_cancelamento || '',
      user.cpt_indicador ? 'true' : 'false',
      user.inicio_carencia_contratual || '',
      user.fim_carencia_contratual || '',
      user.fim_carencia_consultas || '',
      user.fim_carencia_exames || '',
      user.fim_carencia_internacao || '',
      user.fim_carencia_parto || '',
      user.email || '',
      user.telefone_celular || '',
      user.cep || '',
      user.logradouro || '',
      user.numero || '',
      user.complemento || '',
      user.bairro || '',
      user.cidade || '',
      user.uf || '',
      user.created_at || '',
      user.updated_at || ''
    ])

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/USUARIOS!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    })

    if (appendResponse.ok) {
      insertedCount = rows.length
    }
  }

  return {
    success: true,
    sheetId,
    alreadyExisted: !!existingSheet,
    headers: USUARIOS_HEADERS,
    insertedCount
  }
}
