// Arquivo: src/modules/prestadores/services/prestadorService.js
// Descrição: Serviço para CRUD de prestadores usando SQLite local
// Estrutura do banco de dados (baseada no schema real):
// - prestadores: id, crm, nome, especialidade_id, estrutura, unidade, estado, municipio, bairro, endereco, endereco_numero, contrato_ativo_em, contrato_encerrado_em, telefone, whatsapp, idade
// - especialidades: id, nome
// - planos: id, nome
// 
// OBSERVAÇÃO: Scripts de migração (adicionar colunas) devem usar:
// const dbPath = path.join(__dirname, '../../../data/database.db')

import { executeQuery, executeNonQuery } from './sqliteClient'

// Busca todos os prestadores com JOIN de especialidades
export async function fetchPrestadores() {
  try {
    const prestadores = await executeQuery(`
      SELECT 
        p.id,
        p.crm,
        p.nome,
        p.especialidade_id,
        e.nome as especialidade_nome,
        p.estrutura,
        p.unidade,
        p.estado,
        p.municipio,
        p.bairro,
        p.endereco,
        p.endereco_numero,
        p.contrato_ativo_em,
        p.contrato_encerrado_em,
        p.telefone,
        p.whatsapp,
        p.idade
      FROM prestadores p
      LEFT JOIN especialidades e ON p.especialidade_id = e.id
      ORDER BY p.nome ASC
    `)
    
    return { success: true, data: prestadores }
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error)
    return { success: false, error: error.message }
  }
}

// Busca um prestador por ID
export async function getPrestadorById(id) {
  try {
    const prestadores = await executeQuery(`
      SELECT 
        p.id,
        p.crm,
        p.nome,
        p.especialidade_id,
        e.nome as especialidade_nome,
        p.estrutura,
        p.unidade,
        p.estado,
        p.municipio,
        p.bairro,
        p.endereco,
        p.endereco_numero,
        p.contrato_ativo_em,
        p.contrato_encerrado_em,
        p.telefone,
        p.whatsapp,
        p.idade
      FROM prestadores p
      LEFT JOIN especialidades e ON p.especialidade_id = e.id
      WHERE p.id = ?
    `, [id])
    
    return prestadores.length > 0 ? prestadores[0] : null
  } catch (error) {
    console.error('Erro ao buscar prestador por ID:', error)
    throw error
  }
}

// Busca todas as especialidades
export async function fetchEspecialidades() {
  try {
    const especialidades = await executeQuery(`
      SELECT id, nome
      FROM especialidades
      ORDER BY nome ASC
    `)
    
    return { success: true, data: especialidades }
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error)
    return { success: false, error: error.message }
  }
}

// Busca todos os planos
export async function fetchPlanos() {
  try {
    const planos = await executeQuery(`
      SELECT id, nome
      FROM planos
      ORDER BY nome ASC
    `)
    
    return { success: true, data: planos }
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return { success: false, error: error.message }
  }
}

// Salva um prestador (cria ou atualiza)
export async function savePrestador(prestador) {
  try {
    const existing = await getPrestadorById(prestador.id)
    
    if (existing) {
      // Atualizar
      const result = await executeNonQuery(`
        UPDATE prestadores SET
          crm = ?,
          nome = ?,
          especialidade_id = ?,
          estrutura = ?,
          unidade = ?,
          estado = ?,
          municipio = ?,
          bairro = ?,
          endereco = ?,
          endereco_numero = ?,
          contrato_ativo_em = ?,
          contrato_encerrado_em = ?,
          telefone = ?,
          whatsapp = ?,
          idade = ?
        WHERE id = ?
      `, [
        prestador.crm,
        prestador.nome,
        prestador.especialidade_id,
        prestador.estrutura,
        prestador.unidade,
        prestador.estado,
        prestador.municipio,
        prestador.bairro,
        prestador.endereco,
        prestador.endereco_numero,
        prestador.contrato_ativo_em,
        prestador.contrato_encerrado_em,
        prestador.telefone,
        prestador.whatsapp,
        prestador.idade,
        prestador.id
      ])
      
      return result
    } else {
      // Criar novo
      const result = await executeNonQuery(`
        INSERT INTO prestadores (
          id,
          crm,
          nome,
          especialidade_id,
          estrutura,
          unidade,
          estado,
          municipio,
          bairro,
          endereco,
          endereco_numero,
          contrato_ativo_em,
          contrato_encerrado_em,
          telefone,
          whatsapp,
          idade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prestador.id,
        prestador.crm,
        prestador.nome,
        prestador.especialidade_id,
        prestador.estrutura,
        prestador.unidade,
        prestador.estado,
        prestador.municipio,
        prestador.bairro,
        prestador.endereco,
        prestador.endereco_numero,
        prestador.contrato_ativo_em,
        prestador.contrato_encerrado_em,
        prestador.telefone,
        prestador.whatsapp,
        prestador.idade
      ])
      
      return result
    }
  } catch (error) {
    console.error('Erro ao salvar prestador:', error)
    return { success: false, error: error.message }
  }
}

// Exclui um prestador
export async function deletePrestador(id) {
  try {
    const result = await executeNonQuery(`
      DELETE FROM prestadores WHERE id = ?
    `, [id])
    
    return result
  } catch (error) {
    console.error('Erro ao excluir prestador:', error)
    return { success: false, error: error.message }
  }
}