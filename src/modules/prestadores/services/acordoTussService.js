// Arquivo: src/modules/prestadores/services/acordoTussService.js
// Descrição: Serviço para CRUD de acordos TUSS usando SQLite local
// Estrutura do banco de dados (baseada no schema real):
// - prestadores_acordado: id, codigo_tuss, nome, prestador_id, acordo_data_inicio, acordo_data_fim

import { executeQuery, executeNonQuery } from './sqliteClient'
import { generateUUIDv7 } from '@shared/utils/uuidv7'

// Busca todos os acordos de um prestador
export async function fetchAcordosByPrestador(prestadorId) {
  try {
    const acordos = await executeQuery(`
      SELECT 
        id,
        codigo_tuss,
        nome,
        prestador_id,
        acordo_data_inicio,
        acordo_data_fim
      FROM prestadores_acordado
      WHERE prestador_id = ?
      ORDER BY codigo_tuss ASC
    `, [prestadorId])
    
    return { success: true, data: acordos }
  } catch (error) {
    console.error('Erro ao buscar acordos do prestador:', error)
    return { success: false, error: error.message }
  }
}

// Busca um acordo por ID
export async function getAcordoById(id) {
  try {
    const acordos = await executeQuery(`
      SELECT 
        id,
        codigo_tuss,
        nome,
        prestador_id,
        acordo_data_inicio,
        acordo_data_fim
      FROM prestadores_acordado
      WHERE id = ?
    `, [id])
    
    return acordos.length > 0 ? acordos[0] : null
  } catch (error) {
    console.error('Erro ao buscar acordo por ID:', error)
    throw error
  }
}

// Salva um acordo (cria ou atualiza)
export async function saveAcordo(prestadorId, acordo) {
  try {
    const existing = acordo.id ? await getAcordoById(acordo.id) : null
    
    if (existing) {
      // Atualizar
      const result = await executeNonQuery(`
        UPDATE prestadores_acordado SET
          codigo_tuss = ?,
          nome = ?,
          prestador_id = ?,
          acordo_data_inicio = ?,
          acordo_data_fim = ?
        WHERE id = ?
      `, [
        acordo.codigo_tuss,
        acordo.nome,
        prestadorId,
        acordo.acordo_data_inicio,
        acordo.acordo_data_fim,
        acordo.id
      ])
      
      return result
    } else {
      // Criar novo - gerar UUID se não tiver id
      const novoId = acordo.id || generateUUIDv7()
      const result = await executeNonQuery(`
        INSERT INTO prestadores_acordado (
          id,
          codigo_tuss,
          nome,
          prestador_id,
          acordo_data_inicio,
          acordo_data_fim
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        novoId,
        acordo.codigo_tuss,
        acordo.nome,
        prestadorId,
        acordo.acordo_data_inicio,
        acordo.acordo_data_fim
      ])
      
      return result
    }
  } catch (error) {
    console.error('Erro ao salvar acordo:', error)
    return { success: false, error: error.message }
  }
}

// Exclui um acordo
export async function deleteAcordo(id) {
  try {
    const result = await executeNonQuery(`
      DELETE FROM prestadores_acordado WHERE id = ?
    `, [id])
    
    return result
  } catch (error) {
    console.error('Erro ao excluir acordo:', error)
    return { success: false, error: error.message }
  }
}