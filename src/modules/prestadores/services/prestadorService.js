// Arquivo: src/modules/prestadores/services/prestadorService.js
// Descrição: Camada de serviço de Prestadores e Pessoas (M04_PRESTADORES / M01_PESSOAS)
// Integrada diretamente com SQLite local (/src/data/database.db) via sqliteClient.js

import { query, queryOne, execute, transaction } from './sqliteClient'
import { generateUUIDv7 } from '@shared/utils/uuidv7'

/**
 * Consulta todos os prestadores cadastrados com suporte a filtros dinâmicos
 */
export async function fetchPrestadores(filters = {}) {
  try {
    let sql = `SELECT * FROM prestadores ORDER BY nome ASC`
    const items = await query(sql)

    if (!filters || Object.keys(filters).length === 0) {
      return { success: true, data: items, total: items.length }
    }

    // Filtragem em memória ou refinamento
    const filtered = items.filter(item => {
      // 1. Busca textual rápida
      if (filters.searchTerm && String(filters.searchTerm).trim()) {
        const term = String(filters.searchTerm).toLowerCase().trim()
        const matchNome = String(item.nome_razao_social || item.nome_fantasia || item.nome || '').toLowerCase().includes(term)
        const matchCrm = String(item.crm || item.numero_conselho || '').toLowerCase().includes(term)
        const matchEsp = String(item.especialidade || item.cbos || '').toLowerCase().includes(term)
        const matchEst = String(item.estrutura || item.tipo_prestador || '').toLowerCase().includes(term)
        const matchMun = String(item.municipio || item.cidade || '').toLowerCase().includes(term)
        const matchUf = String(item.estado || item.uf || item.uf_conselho || '').toLowerCase().includes(term)
        if (!matchNome && !matchCrm && !matchEsp && !matchEst && !matchMun && !matchUf) return false
      }

      // 2. Filtro Estrutura
      if (filters.filterEstrutura && filters.filterEstrutura !== 'todos') {
        const estVal = String(item.estrutura || item.tipo_prestador || '').toLowerCase()
        const filterTerm = String(filters.filterEstrutura).toLowerCase()
        if (!estVal.includes(filterTerm) && !filterTerm.includes(estVal)) return false
      }

      // 3. Filtro Especialidade
      if (filters.filterEspecialidade && filters.filterEspecialidade !== 'todos') {
        const espVal = String(item.especialidade || item.cbos || '').toLowerCase()
        const filterTerm = String(filters.filterEspecialidade).toLowerCase()
        if (!espVal.includes(filterTerm) && !filterTerm.includes(espVal)) return false
      }

      // 4. Filtro Plano
      if (filters.filterPlano && filters.filterPlano !== 'todos') {
        const planoVal = String(item.plano || item.planos || '').toLowerCase()
        const filterTerm = String(filters.filterPlano).toLowerCase()
        if (!planoVal.includes(filterTerm) && !filterTerm.includes(planoVal)) return false
      }

      // 5. Filtro Produto
      if (filters.filterProduto && filters.filterProduto !== 'todos') {
        const prodVal = String(item.produto || item.rede_produto || '').toLowerCase()
        const filterTerm = String(filters.filterProduto).toLowerCase()
        if (!prodVal.includes(filterTerm) && !filterTerm.includes(prodVal)) return false
      }

      // 6. Filtro Contrato Ativo
      if (filters.filterContrato && filters.filterContrato !== 'todos') {
        const st = String(item.status_credenciamento || item.status || '').toUpperCase()
        const isAtivo = (st === 'ATIVO' || item.contrato_ativo === 'Sim' || item.contrato_ativo === true) && !item.data_descredenciamento
        const isSuspenso = st === 'SUSPENSO' || item.contrato_ativo === 'Suspenso'
        if (filters.filterContrato === 'ATIVO' && !isAtivo) return false
        if (filters.filterContrato === 'DESCREDENCIADO' && isAtivo) return false
        if (filters.filterContrato === 'SUSPENSO' && !isSuspenso) return false
      }

      return true
    })

    return { success: true, data: filtered, total: filtered.length }
  } catch (error) {
    console.error('[prestadorService] Erro ao buscar prestadores:', error)
    return { success: false, data: [], error: error.message }
  }
}

/**
 * Busca os dados completos de um prestador por ID ou código de operadora
 */
export async function getPrestadorById(id) {
  try {
    if (!id) return null
    const sql = `
      SELECT * FROM prestadores
      WHERE LOWER(id) = LOWER(?) OR LOWER(codigo_operadora_prestador) = LOWER(?)
      LIMIT 1
    `
    const found = await queryOne(sql, [String(id), String(id)])
    return found
  } catch (error) {
    console.error('[prestadorService] Erro ao buscar prestador por ID:', error)
    return null
  }
}

/**
 * Salva ou atualiza um prestador no SQLite
 */
export async function savePrestador(prestadorData) {
  try {
    const isNew = !prestadorData.id
    const prestadorId = isNew ? generateUUIDv7() : prestadorData.id
    const pessoaId = prestadorData.id_pessoa || generateUUIDv7()
    const nowIso = new Date().toISOString()

    const normalized = {
      ...prestadorData,
      id: prestadorId,
      id_pessoa: pessoaId,
      codigo_operadora_prestador: prestadorData.codigo_operadora_prestador || `RDA-${prestadorId.slice(0, 5).toUpperCase()}`,
      nome: prestadorData.nome_razao_social || prestadorData.nome || 'PRESTADOR',
      nome_razao_social: prestadorData.nome_razao_social || prestadorData.nome || 'PRESTADOR',
      nome_fantasia: prestadorData.nome_fantasia || prestadorData.unidade || prestadorData.nome || 'UNIDADE PRINCIPAL',
      unidade: prestadorData.unidade || prestadorData.nome_fantasia || 'UNIDADE PRINCIPAL',
      tipo_pessoa: prestadorData.tipo_pessoa || (prestadorData.cpf_cnpj?.length > 14 ? 'JURIDICA' : 'FISICA'),
      cpf_cnpj: prestadorData.cpf_cnpj || '',
      crm: prestadorData.crm || prestadorData.numero_conselho || '',
      numero_conselho: prestadorData.crm || prestadorData.numero_conselho || '',
      conselho_profissional: prestadorData.conselho_profissional || 'CRM',
      uf_conselho: (prestadorData.uf_conselho || prestadorData.estado || prestadorData.uf || 'SP').toUpperCase(),
      cbos: prestadorData.cbos || prestadorData.especialidade || 'CLÍNICA GERAL',
      especialidade: prestadorData.especialidade || prestadorData.cbos || 'CLÍNICA GERAL',
      estrutura: prestadorData.estrutura || prestadorData.tipo_prestador || 'CONSULTÓRIO',
      tipo_prestador: prestadorData.tipo_prestador || prestadorData.estrutura || 'MED',
      atendimento: prestadorData.atendimento || prestadorData.modalidade_atendimento || 'Presencial',
      modalidade_atendimento: prestadorData.modalidade_atendimento || prestadorData.atendimento || 'Presencial',
      idade: prestadorData.idade || prestadorData.faixa_etaria || 'Todas as idades',
      atendimento_idade: prestadorData.atendimento_idade || prestadorData.idade || 'Todas as idades',
      faixa_etaria: prestadorData.faixa_etaria || prestadorData.idade || 'Todas as idades',
      credenciado: prestadorData.credenciado || 'Sim',
      status_credenciamento: prestadorData.status_credenciamento || prestadorData.status || 'ATIVO',
      status: prestadorData.status || prestadorData.status_credenciamento || 'ATIVO',
      contrato_ativo: prestadorData.contrato_ativo || 'Sim',
      contrato_desativado: prestadorData.contrato_desativado || 'Não',
      data_credenciamento: prestadorData.data_credenciamento || nowIso.slice(0, 10),
      data_descredenciamento: prestadorData.data_descredenciamento || null,
      plano: prestadorData.plano || 'PLANO BASICO',
      planos: prestadorData.planos || prestadorData.plano || 'PLANO BASICO',
      produto: prestadorData.produto || 'Todos os Produtos',
      rede_produto: prestadorData.rede_produto || prestadorData.produto || 'Todos os Produtos',
      cep: prestadorData.cep || '01000-000',
      estado: (prestadorData.estado || prestadorData.uf || 'SP').toUpperCase(),
      uf: (prestadorData.uf || prestadorData.estado || 'SP').toUpperCase(),
      municipio: prestadorData.municipio || prestadorData.cidade || 'SÃO PAULO',
      cidade: prestadorData.cidade || prestadorData.municipio || 'SÃO PAULO',
      endereco: prestadorData.endereco || prestadorData.logradouro || '',
      logradouro: prestadorData.logradouro || prestadorData.endereco || '',
      numero_endereco: prestadorData.numero_endereco || prestadorData.numero || 'S/N',
      numero: prestadorData.numero || prestadorData.numero_endereco || 'S/N',
      complemento: prestadorData.complemento || '',
      bairro: prestadorData.bairro || '',
      telefone: prestadorData.telefone || '',
      email: prestadorData.email || '',
      created_at: prestadorData.created_at || nowIso,
      updated_at: nowIso
    }

    const insertSql = `
      INSERT OR REPLACE INTO prestadores (
        id, id_pessoa, codigo_operadora_prestador, nome, nome_razao_social, nome_fantasia,
        unidade, tipo_pessoa, cpf_cnpj, crm, numero_conselho, conselho_profissional,
        uf_conselho, cbos, especialidade, estrutura, tipo_prestador, atendimento,
        modalidade_atendimento, idade, atendimento_idade, faixa_etaria, credenciado,
        status_credenciamento, status, contrato_ativo, contrato_desativado, data_credenciamento,
        data_descredenciamento, plano, planos, produto, rede_produto, cep, estado, uf,
        municipio, cidade, endereco, logradouro, numero_endereco, numero, complemento,
        bairro, telefone, email, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      );
    `

    const params = [
      normalized.id,
      normalized.id_pessoa,
      normalized.codigo_operadora_prestador,
      normalized.nome,
      normalized.nome_razao_social,
      normalized.nome_fantasia,
      normalized.unidade,
      normalized.tipo_pessoa,
      normalized.cpf_cnpj,
      normalized.crm,
      normalized.numero_conselho,
      normalized.conselho_profissional,
      normalized.uf_conselho,
      normalized.cbos,
      normalized.especialidade,
      normalized.estrutura,
      normalized.tipo_prestador,
      normalized.atendimento,
      normalized.modalidade_atendimento,
      normalized.idade,
      normalized.atendimento_idade,
      normalized.faixa_etaria,
      normalized.credenciado,
      normalized.status_credenciamento,
      normalized.status,
      normalized.contrato_ativo,
      normalized.contrato_desativado,
      normalized.data_credenciamento,
      normalized.data_descredenciamento,
      normalized.plano,
      normalized.planos,
      normalized.produto,
      normalized.rede_produto,
      normalized.cep,
      normalized.estado,
      normalized.uf,
      normalized.municipio,
      normalized.cidade,
      normalized.endereco,
      normalized.logradouro,
      normalized.numero_endereco,
      normalized.numero,
      normalized.complemento,
      normalized.bairro,
      normalized.telefone,
      normalized.email,
      normalized.created_at,
      normalized.updated_at
    ]

    await execute(insertSql, params)

    return {
      success: true,
      data: normalized,
      message: `Prestador ${normalized.nome_razao_social} ${isNew ? 'cadastrado' : 'atualizado'} com sucesso.`
    }
  } catch (error) {
    console.error('[prestadorService] Erro ao salvar prestador:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exclui um prestador e seus acordos relacionados
 */
export async function deletePrestador(id) {
  try {
    if (!id) throw new Error('ID do prestador não informado.')
    await transaction(async (db) => {
      db.run('DELETE FROM prestadores_acordado WHERE LOWER(prestador_id) = LOWER(?);', [String(id)])
      db.run('DELETE FROM prestadores WHERE LOWER(id) = LOWER(?);', [String(id)])
    })
    return { success: true, message: 'Prestador e acordos removidos com sucesso.' }
  } catch (error) {
    console.error('[prestadorService] Erro ao excluir prestador:', error)
    return { success: false, error: error.message }
  }
}
