// Arquivo: src/modules/prestadores/services/acordoTussService.js
// Descrição: Serviço de gestão e pactuação de Códigos TUSS e Tabelas de Acordo (prestadores_acordado)
// Integrado com SQLite local (/src/data/database.db) via sqliteClient.js

import { query, queryOne, execute } from './sqliteClient'
import { generateUUIDv7 } from '@shared/utils/uuidv7'

/**
 * Catálogo Base de Referência TUSS para auxílio no cadastro de acordos
 */
export const CATALOGO_TUSS_BASE = [
  {
    codigo_tuss: '10101012',
    descricao: 'Consulta em consultório (no horário normal ou preestabelecido)',
    grupo: 'Consultas Médicas',
    rol_ans: true,
    valor_referencia: 150.00,
    ch_base: 40,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Clínica Médica', 'Cardiologia', 'Pediatria', 'Ginecologia', 'Ortopedia', 'Dermatologia', 'Neurologia', 'Oftalmologia']
  },
  {
    codigo_tuss: '10101039',
    descricao: 'Consulta em pronto socorro / atendimento de urgência e emergência',
    grupo: 'Urgência e Emergência',
    rol_ans: true,
    valor_referencia: 180.00,
    ch_base: 50,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Pronto Atendimento', 'Urgência', 'Clínica Geral', 'Pediatria']
  },
  {
    codigo_tuss: '10102019',
    descricao: 'Visita hospitalar a paciente internado (por dia)',
    grupo: 'Visitas Hospitalares',
    rol_ans: true,
    valor_referencia: 120.00,
    ch_base: 35,
    filme_base: 0,
    exige_autorizacao: true,
    especialidades_recomendadas: ['Clínica Médica', 'Cardiologia', 'Cirurgia Geral', 'Infectologia']
  },
  {
    codigo_tuss: '40101010',
    descricao: 'Eletrocardiograma convencional (ECG) de 12 derivações com laudo',
    grupo: 'Métodos Diagnósticos',
    rol_ans: true,
    valor_referencia: 55.00,
    ch_base: 15,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Cardiologia', 'Clínica Geral', 'Urgência', 'Medicina Preventiva']
  },
  {
    codigo_tuss: '40103137',
    descricao: 'Teste ergométrico convencional em esteira ou bicicleta com laudo',
    grupo: 'Cardiologia Diagnóstica',
    rol_ans: true,
    valor_referencia: 185.00,
    ch_base: 60,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Cardiologia', 'Medicina do Exercício']
  },
  {
    codigo_tuss: '40103170',
    descricao: 'Monitorização ambulatorial da pressão arterial por 24h (MAPA)',
    grupo: 'Cardiologia Diagnóstica',
    rol_ans: true,
    valor_referencia: 165.00,
    ch_base: 50,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Cardiologia', 'Nefrologia']
  },
  {
    codigo_tuss: '40103145',
    descricao: 'Holter de 24 horas - 3 canais (digital) com análise e laudo',
    grupo: 'Cardiologia Diagnóstica',
    rol_ans: true,
    valor_referencia: 190.00,
    ch_base: 55,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Cardiologia']
  },
  {
    codigo_tuss: '40901106',
    descricao: 'Ecocardiograma transtorácico bidimensional com doppler colorido (ECO)',
    grupo: 'Ultrassonografia / Cardiologia',
    rol_ans: true,
    valor_referencia: 280.00,
    ch_base: 85,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Cardiologia', 'Ecocardiografia']
  },
  {
    codigo_tuss: '40304361',
    descricao: 'Hemograma completo com contagem de plaquetas ou frações',
    grupo: 'Patologia Clínica / Hematologia',
    rol_ans: true,
    valor_referencia: 28.00,
    ch_base: 8,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Laboratório', 'Patologia Clínica', 'Hematologia', 'Clínica Geral']
  },
  {
    codigo_tuss: '40301630',
    descricao: 'Colesterol total e frações (HDL, LDL, VLDL) e Triglicerídeos (Perfil Lipídico)',
    grupo: 'Patologia Clínica / Bioquímica',
    rol_ans: true,
    valor_referencia: 32.00,
    ch_base: 10,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Laboratório', 'Patologia Clínica', 'Cardiologia', 'Endocrinologia']
  },
  {
    codigo_tuss: '40302040',
    descricao: 'Glicemia de jejum (dosagem quantitativa)',
    grupo: 'Patologia Clínica / Bioquímica',
    rol_ans: true,
    valor_referencia: 14.00,
    ch_base: 5,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Laboratório', 'Patologia Clínica', 'Endocrinologia', 'Clínica Geral']
  },
  {
    codigo_tuss: '40301982',
    descricao: 'Hemoglobina glicada (HbA1c) fração A1c',
    grupo: 'Patologia Clínica / Bioquímica',
    rol_ans: true,
    valor_referencia: 36.00,
    ch_base: 12,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Laboratório', 'Endocrinologia', 'Clínica Geral']
  },
  {
    codigo_tuss: '40316149',
    descricao: 'Troponina quantitativa (I ou T) de alta sensibilidade',
    grupo: 'Patologia Clínica / Marcadores Cardíacos',
    rol_ans: true,
    valor_referencia: 85.00,
    ch_base: 25,
    filme_base: 0,
    exige_autorizacao: false,
    especialidades_recomendadas: ['Laboratório', 'Cardiologia', 'Urgência e Emergência']
  }
]

/**
 * Consulta todos os acordos e procedimentos TUSS pactuados com um prestador
 */
export async function fetchAcordosByPrestador(prestadorId, filters = {}) {
  try {
    if (!prestadorId) return { success: true, data: [] }

    const sql = `
      SELECT * FROM prestadores_acordado
      WHERE LOWER(prestador_id) = LOWER(?)
      ORDER BY codigo_tuss ASC
    `
    const items = await query(sql, [String(prestadorId)])

    if (!filters || Object.keys(filters).length === 0) {
      return { success: true, data: items, total: items.length }
    }

    // Aplica os filtros dedicados em memória
    const filtered = items.filter(item => {
      // 1. Busca textual no Header
      if (filters.searchTerm && String(filters.searchTerm).trim()) {
        const term = String(filters.searchTerm).toLowerCase().trim()
        const matchCod = String(item.codigo_tuss || '').toLowerCase().includes(term)
        const matchNome = String(item.nome || item.descricao || '').toLowerCase().includes(term)
        const matchGrupo = String(item.grupo || '').toLowerCase().includes(term)
        if (!matchCod && !matchNome && !matchGrupo) return false
      }

      // 2. Filtro 1: Código TUSS
      if (filters.filterCodigoTuss && String(filters.filterCodigoTuss).trim()) {
        const term = String(filters.filterCodigoTuss).toLowerCase().trim()
        if (!String(item.codigo_tuss || '').toLowerCase().includes(term)) return false
      }

      // 3. Filtro 2: Nome do procedimento
      if (filters.filterNome && String(filters.filterNome).trim()) {
        const term = String(filters.filterNome).toLowerCase().trim()
        const nomeVal = String(item.nome || item.descricao || '').toLowerCase()
        if (!nomeVal.includes(term)) return false
      }

      // 4. Filtro 3: Início do Acordo
      if (filters.filterDataInicio && String(filters.filterDataInicio).trim()) {
        const dtInicio = String(item.acordo_data_inicio || item.vigencia_inicio || '')
        if (dtInicio && dtInicio < filters.filterDataInicio) return false
      }

      // 5. Filtro 4: Fim do Acordo
      if (filters.filterDataFim && String(filters.filterDataFim).trim()) {
        const dtFim = String(item.acordo_data_fim || item.vigencia_fim || '')
        if (dtFim && dtFim > filters.filterDataFim) return false
      }

      // 6. Filtro 5: Status do Acordo
      if (filters.filterStatus && filters.filterStatus !== 'todos') {
        const st = String(item.status || 'ATIVO').toUpperCase()
        if (st !== filters.filterStatus.toUpperCase()) return false
      }

      return true
    })

    return { success: true, data: filtered, total: filtered.length }
  } catch (error) {
    console.error('[acordoTussService] Erro ao buscar acordos do prestador:', error)
    return { success: false, data: [], error: error.message }
  }
}

/**
 * Salva ou atualiza um procedimento pactuado no SQLite
 */
export async function saveAcordo(prestadorId, acordoData) {
  try {
    if (!prestadorId) throw new Error('ID do prestador é obrigatório.')

    const isNew = !acordoData.id
    const acordoId = isNew ? generateUUIDv7() : acordoData.id
    const nomeProcedimento = acordoData.nome?.trim() || acordoData.descricao?.trim() || ''

    if (!acordoData.codigo_tuss?.trim()) {
      throw new Error('Código TUSS é obrigatório.')
    }
    if (!nomeProcedimento) {
      throw new Error('Nome do procedimento é obrigatório.')
    }

    const nowIso = new Date().toISOString()
    const dtInicio = acordoData.acordo_data_inicio || acordoData.vigencia_inicio || nowIso.slice(0, 10)
    const dtFim = acordoData.acordo_data_fim || acordoData.vigencia_fim || null

    const normalized = {
      id: acordoId,
      prestador_id: prestadorId,
      codigo_tuss: acordoData.codigo_tuss.trim(),
      nome: nomeProcedimento,
      descricao: nomeProcedimento,
      grupo: acordoData.grupo || 'Consultas Médicas',
      rol_ans: acordoData.rol_ans ? 1 : 0,
      valor_referencia: parseFloat(acordoData.valor_referencia) || 0,
      valor_acordado: parseFloat(acordoData.valor_acordado ?? acordoData.valor_referencia) || 0,
      fator_ch: parseFloat(acordoData.fator_ch) || 0,
      filme_porte: parseFloat(acordoData.filme_porte) || 0,
      exige_autorizacao: acordoData.exige_autorizacao ? 1 : 0,
      acordo_data_inicio: dtInicio,
      acordo_data_fim: dtFim,
      vigencia_inicio: dtInicio,
      vigencia_fim: dtFim,
      status: acordoData.status || 'ATIVO',
      regra_coparticipacao: acordoData.regra_coparticipacao || 'Padrão da Operadora (20%)',
      observacoes_acordo: acordoData.observacoes_acordo || '',
      created_at: acordoData.created_at || nowIso,
      updated_at: nowIso
    }

    const insertSql = `
      INSERT OR REPLACE INTO prestadores_acordado (
        id, prestador_id, codigo_tuss, nome, descricao, grupo, rol_ans,
        valor_referencia, valor_acordado, fator_ch, filme_porte,
        exige_autorizacao, acordo_data_inicio, acordo_data_fim,
        vigencia_inicio, vigencia_fim, status, regra_coparticipacao,
        observacoes_acordo, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      );
    `

    const params = [
      normalized.id,
      normalized.prestador_id,
      normalized.codigo_tuss,
      normalized.nome,
      normalized.descricao,
      normalized.grupo,
      normalized.rol_ans,
      normalized.valor_referencia,
      normalized.valor_acordado,
      normalized.fator_ch,
      normalized.filme_porte,
      normalized.exige_autorizacao,
      normalized.acordo_data_inicio,
      normalized.acordo_data_fim,
      normalized.vigencia_inicio,
      normalized.vigencia_fim,
      normalized.status,
      normalized.regra_coparticipacao,
      normalized.observacoes_acordo,
      normalized.created_at,
      normalized.updated_at
    ]

    await execute(insertSql, params)

    return {
      success: true,
      data: normalized,
      message: `Código TUSS ${normalized.codigo_tuss} ${isNew ? 'cadastrado' : 'atualizado'} com sucesso.`
    }
  } catch (error) {
    console.error('[acordoTussService] Erro ao salvar acordo TUSS:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exclui um acordo TUSS pelo ID
 */
export async function deleteAcordo(acordoId) {
  try {
    if (!acordoId) throw new Error('ID do acordo não informado.')
    await execute('DELETE FROM prestadores_acordado WHERE LOWER(id) = LOWER(?);', [String(acordoId)])
    return { success: true, message: 'Procedimento TUSS removido com sucesso.' }
  } catch (error) {
    console.error('[acordoTussService] Erro ao excluir acordo TUSS:', error)
    return { success: false, error: error.message }
  }
}
