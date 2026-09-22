// Arquivo: src/modules/prestadores/services/sqliteClient.js
// Descrição: Cliente SQLite usando sql.js para acesso direto ao database.db local
// OBSERVAÇÃO: As alterações são salvas em localStorage. Para persistir no arquivo, use a função downloadDatabase()

import initSqlJs from 'sql.js'
import databaseUrl from '../../../data/database.db?url'

let db = null
let SQL = null

// Inicializa o banco de dados SQLite
export async function initDatabase() {
  if (db) return db

  try {
    SQL = await initSqlJs({
      locateFile: file => `/sql-wasm.wasm`
    })
    
    // Tenta carregar do localStorage primeiro (alterações salvas)
    const savedDb = localStorage.getItem('sqlite_db_backup')
    let uint8Array
    
    if (savedDb) {
      console.log('Carregando banco do localStorage (alterações salvas)')
      // Converte string base64 de volta para Uint8Array
      const binaryString = atob(savedDb)
      uint8Array = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i)
      }
    } else {
      // Carrega do arquivo original
      const response = await fetch(databaseUrl)
      const arrayBuffer = await response.arrayBuffer()
      uint8Array = new Uint8Array(arrayBuffer)
    }
    
    db = new SQL.Database(uint8Array)
    return db
  } catch (error) {
    console.error('Erro ao inicializar banco de dados SQLite:', error)
    throw new Error('Falha ao inicializar banco de dados SQLite')
  }
}

// Executa uma query SELECT e retorna os resultados
export async function executeQuery(query, params = []) {
  try {
    await initDatabase()
    
    const stmt = db.prepare(query)
    stmt.bind(params)
    
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    
    stmt.free()
    return results
  } catch (error) {
    console.error('Erro ao executar query:', error)
    throw error
  }
}

// Executa uma query INSERT/UPDATE/DELETE e salva as alterações
export async function executeNonQuery(query, params = []) {
  try {
    await initDatabase()
    
    db.run(query, params)
    
    // Salva as alterações no localStorage
    await saveToLocalStorage()
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao executar query sem retorno:', error)
    return { success: false, error: error.message }
  }
}

// Salva o banco no localStorage
async function saveToLocalStorage() {
  try {
    const data = db.export()
    // Converte Uint8Array para base64 para salvar no localStorage
    const binaryString = String.fromCharCode.apply(null, data)
    const base64 = btoa(binaryString)
    localStorage.setItem('sqlite_db_backup', base64)
    console.log('Banco salvo no localStorage')
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

// Função para download do banco de dados (para persistir no arquivo)
export function downloadDatabase() {
  if (!db) {
    console.error('Banco não inicializado')
    return
  }
  
  try {
    const data = db.export()
    const blob = new Blob([data], { type: 'application/x-sqlite3' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'database.db'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('Download iniciado')
  } catch (error) {
    console.error('Erro ao fazer download:', error)
  }
}

// Função para limpar o backup do localStorage (reset para original)
export function clearLocalStorageBackup() {
  localStorage.removeItem('sqlite_db_backup')
  console.log('Backup do localStorage limpo')
  // Recarrega a página para carregar o banco original
  window.location.reload()
}

// Obtém o schema do banco de dados
export async function getSchema() {
  try {
    await initDatabase()
    
    const tables = await executeQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)
    
    const schema = {}
    for (const table of tables) {
      const columns = await executeQuery(`PRAGMA table_info(${table.name})`)
      schema[table.name] = columns
    }
    
    return schema
  } catch (error) {
    console.error('Erro ao obter schema:', error)
    throw error
  }
}

// Fecha a conexão com o banco de dados
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

// Exporta o banco de dados como Uint8Array
export function exportDatabase() {
  if (!db) return null
  return db.export()
}